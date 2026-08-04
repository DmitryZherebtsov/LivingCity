const test = require('node:test');
const assert = require('node:assert/strict');

const router = require('../routes/eventRoutes');

function findRouteLayer(method, path) {
  return router.stack.find(
    (layer) => layer.route && layer.route.path === path && layer.route.methods[method]
  );
}

// Route stacks here are always [requireAuth, requireRole(...), controller.fn],
// so index 1 is always the role-check middleware we want to exercise directly
// (bypassing requireAuth, which needs a real JWT and isn't what these tests
// are about).
function getRoleMiddleware(layer) {
  const handle = layer.route.stack[1] && layer.route.stack[1].handle;
  assert.ok(handle, 'expected a role-checking middleware at index 1');
  return handle;
}

function runRoleMiddleware(middleware, roleName) {
  return new Promise((resolve) => {
    const req = { user: roleName ? { roleName } : undefined };
    const res = {
      statusCode: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        resolve({ allowed: false, statusCode: this.statusCode, body });
      },
    };

    middleware(req, res, () => resolve({ allowed: true }));
  });
}

test('PATCH /:id exists and allows admin and organizer (fixes broken organizer event editing)', async () => {
  const layer = findRouteLayer('patch', '/:id');
  assert.ok(layer, 'expected a PATCH /:id route so organizer edits (sent as PATCH) are reachable');

  const roleMiddleware = getRoleMiddleware(layer);

  const admin = await runRoleMiddleware(roleMiddleware, 'admin');
  assert.equal(admin.allowed, true);

  const organizer = await runRoleMiddleware(roleMiddleware, 'organizer');
  assert.equal(organizer.allowed, true);

  const client = await runRoleMiddleware(roleMiddleware, 'client');
  assert.equal(client.allowed, false);
  assert.equal(client.statusCode, 403);
});

test('PUT /:id remains admin-only (used by the admin EditEventModal)', async () => {
  const layer = findRouteLayer('put', '/:id');
  assert.ok(layer, 'expected the existing PUT /:id route to still exist');

  const roleMiddleware = getRoleMiddleware(layer);

  const admin = await runRoleMiddleware(roleMiddleware, 'admin');
  assert.equal(admin.allowed, true);

  const organizer = await runRoleMiddleware(roleMiddleware, 'organizer');
  assert.equal(organizer.allowed, false);
  assert.equal(organizer.statusCode, 403);
});

test('PATCH /approve/:id and /reject/:id allow moderators (fixes admin/moderator role mismatch)', async () => {
  for (const path of ['/approve/:id', '/reject/:id']) {
    const layer = findRouteLayer('patch', path);
    assert.ok(layer, `expected a PATCH ${path} route`);

    const roleMiddleware = getRoleMiddleware(layer);

    const admin = await runRoleMiddleware(roleMiddleware, 'admin');
    assert.equal(admin.allowed, true, `admin should be allowed on ${path}`);

    const moderator = await runRoleMiddleware(roleMiddleware, 'moderator');
    assert.equal(moderator.allowed, true, `moderator should be allowed on ${path}`);

    const organizer = await runRoleMiddleware(roleMiddleware, 'organizer');
    assert.equal(organizer.allowed, false, `organizer should not be allowed on ${path}`);
    assert.equal(organizer.statusCode, 403);
  }
});
