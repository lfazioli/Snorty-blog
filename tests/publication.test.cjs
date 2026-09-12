const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { transpileModule, ModuleKind } = require('typescript');
function load(file, dependencies = {}) {
  const exports = {};
  new Function('exports', 'require', transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ModuleKind.CommonJS } }).outputText)(exports, (name) => {
    if (!(name in dependencies)) throw new Error(`Missing dependency ${name}`);
    return dependencies[name];
  });
  return exports;
}
const publication = load('server/publication.ts');
const local = load('src/lib/publication.ts');
const seoMeta = load('src/lib/seo-meta.ts');
test('validates dates and converts explicit offsets to UTC', () => {
  assert.equal(publication.parsePublishAt('2027-07-15T10:30:00+02:00'), '2027-07-15T08:30:00.000Z');
  for (const value of [undefined, null, '']) assert.equal(publication.parsePublishAt(value), null);
  for (const value of ['2027-07-15T10:30', '2027-02-30T10:00:00Z', 'invalid', 123, {}, '2027-13-01T10:00:00Z']) assert.throws(() => publication.parsePublishAt(value));
});
test('local dates survive a round trip in winter and summer', () => {
  for (const date of ['2027-01-15T10:30', '2027-07-15T10:30']) assert.equal(local.toLocalDateTime(local.fromLocalDateTime(date)), date);
  assert.throws(() => local.fromLocalDateTime('invalid'));
  assert.equal(local.publicationLabel(false, '2000-01-01T00:00:00Z'), 'Draft');
  assert.equal(local.publicationLabel(true, '2000-01-01T00:00:00Z'), 'Published');
});
function response() { return { code: 200, headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; }, send(body) { this.body = body; return this; } }; }
function setup(file, admin, result = []) {
  const calls = [];
  const db = { ensureSchema: async () => {}, pool: { query: async (...args) => { calls.push(args); return { rows: result, rowCount: result.length }; } } };
  const auth = { getSessionFromRequest: () => admin ? { role: 'admin' } : null, requireAdmin: (_req, res) => admin ? { email: 'admin@example.com' } : (res.status(401).json({ error: 'Unauthorized' }), null) };
  const siteUrl = load('server/site-url.ts');
  const tools = load('server/tools.ts', { './db.js': db, './tool-seed.js': {}, './publication.js': publication });
  const handler = load(file, { '../server/db.js': db, '../../server/db.js': db, '../server/auth.js': auth, '../../server/auth.js': auth, '../../server/publication.js': publication, '../server/tools.js': { ...tools, ensureTools: async () => {} }, '../server/site-url.js': siteUrl, '../src/lib/seo-meta.js': seoMeta }).default;
  return { handler, calls, res: response() };
}
test('every public read enforces the server publication deadline, with uncached responses', async () => {
  for (const file of ['api/posts/index.ts', 'api/posts/[slug].ts', 'api/post.ts', 'api/tools.ts', 'api/sitemap.ts', 'api/feed.ts']) {
    const { handler, calls, res } = setup(file, false);
    await handler({ method: 'GET', query: { slug: 'test' }, headers: { host: 'snorty.space' } }, res);
    assert.match(calls[0][0], /published = true/);
    assert.match(calls[0][0], /publish_at IS NULL OR publish_at <= NOW\(\)/);
    assert.equal(res.headers['Cache-Control'], 'no-store');
  }
});
test('admin can retrieve scheduled content while public scope hides it', async () => {
  for (const file of ['api/posts/index.ts', 'api/tools.ts']) {
    const { handler, calls, res } = setup(file, true);
    await handler({ method: 'GET', query: { scope: 'public' } }, res);
    if (file.includes('posts')) assert.match(calls[0][0], /publish_at <= NOW/);
    else assert.equal(calls[0][1][0], false);
  }
  const { handler, calls, res } = setup('api/posts/[slug].ts', true, [{ published: true, publish_at: '2099-01-01T00:00:00Z' }]);
  await handler({ method: 'GET', query: { slug: 'scheduled' } }, res);
  assert.equal(calls[0][1][1], true); assert.equal(res.code, 200);
});
test('post and tool create/update save schedules and allow cancelling them', async () => {
  const tool = { name: 'Test', category: 'OSINT', description: 'Text', howTo: 'Steps', href: 'https://example.com', published: true };
  for (const [file, method] of [['api/posts/index.ts', 'POST'], ['api/posts/[slug].ts', 'PUT'], ['api/tools.ts', 'POST'], ['api/tools.ts', 'PUT']]) {
    for (const publish_at of ['2027-07-15T10:30:00+02:00', null]) {
      const { handler, calls, res } = setup(file, true, [{ id: 1 }]);
      await handler({ method, query: { slug: 'test', id: '1' }, body: { ...tool, title: 'Post', content: 'Content', publish_at } }, res);
      const write = calls.find(([sql]) => /INSERT INTO|UPDATE/.test(sql));
      assert.ok(write); assert.match(write[0], /publish_at/);
      assert.ok(write[1].includes(publish_at ? '2027-07-15T08:30:00.000Z' : null));
      assert.ok([200, 201].includes(res.code));
    }
  }
});
test('invalid schedules cannot write content', async () => {
  const { handler, calls, res } = setup('api/posts/index.ts', true);
  await handler({ method: 'POST', query: {}, body: { title: 'Test', content: 'Test', publish_at: 'tomorrow' } }, res);
  assert.equal(res.code, 400); assert.equal(calls.length, 0);
});
