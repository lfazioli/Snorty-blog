const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { transpileModule, ModuleKind } = require('typescript');
const source = transpileModule(readFileSync('api/github-projects.ts', 'utf8'), { compilerOptions: { module: ModuleKind.CommonJS } }).outputText;
const repo = (id, overrides = {}) => ({ id, name: `project-${id}`, private: false, fork: false, owner: { login: 'lfazioli' }, stargazers_count: 2, ...overrides });
function setup(fetch) {
  const exports = {};
  new Function('exports', 'fetch', 'console', source)(exports, fetch, { error() {} });
  const res = { code: 200, headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
  return { handler: exports.default, res };
}
test('shows six newest original public projects and safe canonical links', async () => {
  const { handler, res } = setup(async (url, options) => {
    assert.match(url, /sort=created&direction=desc/);
    assert.equal(options.headers.Authorization, undefined);
    return { ok: true, json: async () => [repo(0, { private: true }), repo(1, { fork: true }), repo(2, { owner: { login: 'other' } }), ...Array.from({ length: 8 }, (_, i) => repo(i + 3))] };
  });
  await handler({ method: 'GET' }, res);
  assert.equal(res.code, 200);
  assert.deepEqual(res.data.projects.map((p) => p.id), [3, 4, 5, 6, 7, 8]);
  assert.equal(res.data.projects[0].url, 'https://github.com/lfazioli/project-3');
  assert.ok(res.data.projects[0].description);
  assert.match(res.headers['Cache-Control'], /s-maxage=600/);
});
test('paginates past forks to discover original projects', async () => {
  let calls = 0;
  const { handler, res } = setup(async () => ({ ok: true, json: async () => ++calls === 1 ? Array.from({ length: 100 }, (_, i) => repo(i, { fork: true })) : [repo(101)] }));
  await handler({ method: 'GET' }, res);
  assert.equal(calls, 2); assert.equal(res.data.projects[0].id, 101);
});
test('rate limits and network failures return an uncached recoverable error', async () => {
  for (const fetch of [async () => ({ ok: false, status: 403 }), async () => { throw new Error('timeout'); }]) {
    const { handler, res } = setup(fetch);
    await handler({ method: 'GET' }, res);
    assert.equal(res.code, 502); assert.equal(res.headers['Cache-Control'], 'no-store');
  }
});
test('empty profiles succeed and unsupported methods never contact GitHub', async () => {
  let calls = 0;
  const { handler, res } = setup(async () => { calls++; return { ok: true, json: async () => [] }; });
  await handler({ method: 'POST' }, res);
  assert.equal(res.code, 405); assert.equal(calls, 0);
  await handler({ method: 'GET' }, res);
  assert.deepEqual(res.data.projects, []);
});
