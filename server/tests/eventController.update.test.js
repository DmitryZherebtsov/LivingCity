const test = require('node:test');
const assert = require('node:assert/strict');

const pool = require('../config/dbConfig');
const eventModel = require('../models/eventModel');
const controller = require('../controllers/eventController');

function createRes() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function withMocks(mocks, fn) {
  const originals = {
    poolQuery: pool.query,
    getEventById: eventModel.getEventById,
    updateEvent: eventModel.updateEvent,
  };

  Object.assign(pool, { query: mocks.poolQuery ?? originals.poolQuery });
  Object.assign(eventModel, {
    getEventById: mocks.getEventById ?? originals.getEventById,
    updateEvent: mocks.updateEvent ?? originals.updateEvent,
  });

  return Promise.resolve(fn()).finally(() => {
    pool.query = originals.poolQuery;
    eventModel.getEventById = originals.getEventById;
    eventModel.updateEvent = originals.updateEvent;
  });
}

test('update() forbids an organizer from editing an event owned by another organization', () =>
  withMocks(
    {
      poolQuery: async () => ({ rows: [{ organization_id: 1 }] }),
      getEventById: async () => ({ id: 42, organization_id: 2 }),
      updateEvent: async () => {
        throw new Error('updateEvent should not be called when ownership check fails');
      },
    },
    async () => {
      const req = {
        params: { id: '42' },
        body: { title: 'Hijacked title' },
        user: { id: 'user-1', roleName: 'organizer' },
      };
      const res = createRes();

      await controller.update(req, res);

      assert.equal(res.statusCode, 403);
    }
  ));

test('update() allows an organizer to edit their own event but strips moderation-only fields', () =>
  withMocks(
    {
      poolQuery: async () => ({ rows: [{ organization_id: 7 }] }),
      getEventById: async () => ({ id: 99, organization_id: 7 }),
      updateEvent: async (id, body) => ({ id, ...body }),
    },
    async () => {
      const req = {
        params: { id: '99' },
        body: { title: 'New title', status: 'approved', organization_id: 999 },
        user: { id: 'user-2', roleName: 'organizer' },
      };
      const res = createRes();

      await controller.update(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.title, 'New title');
      assert.equal('status' in res.body, false);
      assert.equal('organization_id' in res.body, false);
    }
  ));

test('update() lets an admin edit any event without an ownership check', () =>
  withMocks(
    {
      poolQuery: async () => {
        throw new Error('pool.query should not be called for admin requests');
      },
      getEventById: async () => {
        throw new Error('getEventById should not be called for admin requests');
      },
      updateEvent: async (id, body) => ({ id, ...body }),
    },
    async () => {
      const req = {
        params: { id: '5' },
        body: { title: 'Admin edit', status: 'approved' },
        user: { id: 'admin-1', roleName: 'admin' },
      };
      const res = createRes();

      await controller.update(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.status, 'approved');
    }
  ));

test('update() returns 404 when the event does not exist', () =>
  withMocks(
    {
      poolQuery: async () => ({ rows: [{ organization_id: 1 }] }),
      getEventById: async () => {
        throw new Error('Event not found');
      },
      updateEvent: async () => {
        throw new Error('updateEvent should not be called');
      },
    },
    async () => {
      const req = {
        params: { id: '404' },
        body: { title: 'Ghost event' },
        user: { id: 'user-3', roleName: 'organizer' },
      };
      const res = createRes();

      await controller.update(req, res);

      assert.equal(res.statusCode, 404);
    }
  ));
