const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { transpileModule, ModuleKind } = require('typescript');
function load(file, dependencies) {
  const code = transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ModuleKind.CommonJS } }).outputText;
  const result = { exports: {} };
  new Function('require', 'module', 'exports', code)((name) => {
    if (!(name in dependencies)) throw new Error(`Unexpected dependency ${name}`);
    return dependencies[name];
  }, result, result.exports);
  return result.exports;
}
const valid = { name: ' Example ', category: 'OSINT', description: 'Description', howTo: 'Instructions', href: 'https://example.com', image: '', badge: '', published: false };
const helpers = load('server/tools.ts', { './db.js': {}, './tool-seed.js': {} });
test('validation trims text and preserves draft status', () => {
  const values = helpers.validateTool(valid);
  assert.equal(values[0], 'Example'); assert.equal(values[7], false);
});
test('validation rejects unsafe URLs, malformed fields and oversized content', () => {
  for (const patch of [{ href: 'javascript:alert(1)' }, { image: '//evil.test/img' }, { image: 'data:text/html,test' }, { name: ' ' }, { category: {} }, { published: 'false' }, { description: 'x'.repeat(2001) }]) {
    assert.throws(() => helpers.validateTool({ ...valid, ...patch }));
  }
  assert.doesNotThrow(() => helpers.validateTool({ ...valid, image: '/tools/crt.png' }));
});
function setup(role, rows = []) {
  const calls = [];
  const handler = load('api/tools.ts', {
    '../server/db.js': { pool: { query: async (...args) => { calls.push(args); return { rows, rowCount: rows.length }; } } },
    '../server/auth.js': {
      getSessionFromRequest: () => role ? { role } : null,
      requireAdmin: (_req, res) => role === 'admin' ? { role } : (res.status(role ? 403 : 401).json({ error: 'Forbidden' }), null),
    },
    '../server/tools.js': { ensureTools: async () => {}, validateTool: helpers.validateTool },
  }).default;
  const res = { code: 200, data: null, setHeader() {}, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
  return { handler, res, calls };
}
test('all writes require admin before database access', async () => {
  for (const role of [null, 'reader']) for (const method of ['POST', 'PUT', 'DELETE']) {
    const { handler, res, calls } = setup(role);
    await handler({ method, query: { id: '1' }, body: valid }, res);
    assert.equal(res.code, role ? 403 : 401); assert.equal(calls.length, 0);
  }
});
test('public queries enforce published status, admin queries allow drafts', async () => {
  for (const role of [null, 'reader', 'admin']) {
    const { handler, res, calls } = setup(role);
    await handler({ method: 'GET', query: {} }, res);
    assert.equal(res.code, 200);
    assert.match(calls[0][0], /published = true/);
    assert.equal(calls[0][1][0], role === 'admin');
  }
});
test('create and update retain all fields with parameterized queries', async () => {
  for (const method of ['POST', 'PUT']) {
    const { handler, res, calls } = setup('admin', [{ id: 1, ...valid }]);
    await handler({ method, query: method === 'PUT' ? { id: '1' } : {}, body: valid }, res);
    assert.equal(res.code, method === 'POST' ? 201 : 200);
    assert.equal(calls[0][1][0], 'Example'); assert.equal(calls[0][1][7], false);
  }
});
test('missing tools and malformed IDs return errors', async () => {
  for (const method of ['GET', 'PUT', 'DELETE']) {
    const { handler, res } = setup('admin');
    await handler({ method, query: { id: '999' }, body: valid }, res);
    assert.equal(res.code, 404);
    await handler({ method, query: { id: '1 OR 1=1' }, body: valid }, res);
    assert.equal(res.code, 400);
  }
});
test('delete removes the requested tool', async () => {
  const { handler, res, calls } = setup('admin', [{ id: 7 }]);
  await handler({ method: 'DELETE', query: { id: '7' } }, res);
  assert.equal(res.code, 200); assert.match(calls[0][0], /DELETE FROM tools/); assert.deepEqual(calls[0][1], ['7']);
});
test('migration seeds once and does not recreate deleted tools on a new instance', async () => {
  let applied = false, inserts = 0;
  const client = { release() {}, async query(sql) {
    if (sql.startsWith('SELECT name')) return { rowCount: applied ? 1 : 0 };
    if (sql.startsWith('INSERT INTO tools ')) inserts++;
    if (sql.startsWith('INSERT INTO tool_migrations')) applied = true;
    return { rowCount: 0 };
  } };
  const dependencies = { './db.js': { pool: { connect: async () => client } }, './tool-seed.js': { initialTools: [valid] } };
  await load('server/tools.ts', dependencies).ensureTools();
  await load('server/tools.ts', dependencies).ensureTools();
  assert.equal(inserts, 1);
});
