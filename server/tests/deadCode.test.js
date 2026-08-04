const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('the unused adminEvent route/controller pair (never mounted in index.js) has been removed', () => {
  const routePath = path.join(__dirname, '..', 'routes', 'adminEvent.routes.js');
  const controllerPath = path.join(__dirname, '..', 'controllers', 'adminEvent.controller.js');

  assert.equal(fs.existsSync(routePath), false, 'adminEvent.routes.js should have been deleted');
  assert.equal(
    fs.existsSync(controllerPath),
    false,
    'adminEvent.controller.js should have been deleted'
  );
});

test('index.js does not reference the removed adminEvent route module', () => {
  const indexSource = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
  assert.equal(indexSource.includes('adminEvent'), false);
});
