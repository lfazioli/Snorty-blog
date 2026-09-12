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
const seoMeta = load('src/lib/seo-meta.ts');
const siteUrl = load('server/site-url.ts');
const SHELL = readFileSync('index.html', 'utf8');

function response() {
  return {
    code: 200, headers: {}, body: '',
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.code = code; return this; },
    send(body) { this.body = body; return this; },
  };
}

// The handler fetches the built shell from its own deployment; the network is
// the only thing stubbed here, the rest is the real module.
function withShell(shellOrError, run) {
  const original = globalThis.fetch;
  globalThis.fetch = async () => {
    if (shellOrError instanceof Error) throw shellOrError;
    return { ok: true, status: 200, text: async () => shellOrError };
  };
  return run().finally(() => { globalThis.fetch = original; });
}

const POST = {
  slug: 'what-is-ethical-hacking',
  title: 'What Is Ethical Hacking?',
  excerpt: 'A short introduction to ethical hacking.',
  image: 'https://example.com/cover.png',
  publish_at: null,
  created_at: '2026-08-23T10:00:00.000Z',
  updated_at: '2026-08-24T10:00:00.000Z',
};

function setup(rows, { failQuery = false } = {}) {
  const calls = [];
  const db = {
    ensureSchema: async () => {},
    pool: { query: async (...args) => { calls.push(args); if (failQuery) throw new Error('database is down'); return { rows, rowCount: rows.length }; } },
  };
  const handler = load('api/post-page.ts', {
    '../server/db.js': db,
    '../server/site-url.js': siteUrl,
    '../src/lib/seo-meta.js': seoMeta,
  }).default;
  return { handler, calls, res: response() };
}

const request = (slug) => ({ method: 'GET', query: { slug }, headers: { host: 'www.snorty.space' } });

test('a published post is served with its own metadata in the HTML', async () => {
  const { handler, calls, res } = setup([POST]);
  await withShell(SHELL, () => handler(request(POST.slug), res));

  assert.equal(res.code, 200);
  // The whole point: the crawler must find this without running JavaScript.
  assert.ok(res.body.includes('<title>What Is Ethical Hacking? | Snorty Blog</title>'));
  assert.ok(res.body.includes('<link rel="canonical" href="https://www.snorty.space/post/what-is-ethical-hacking" />'));
  assert.ok(res.body.includes('<meta property="og:type" content="article" />'));
  assert.ok(res.body.includes('<meta property="og:image" content="https://example.com/cover.png" />'));
  assert.ok(res.body.includes('"@type":"BlogPosting"'));
  // ...and the application must still boot from the same document.
  assert.ok(res.body.includes('<div id="root"></div>'));
  assert.equal(res.headers['Content-Type'], 'text/html; charset=utf-8');

  assert.match(calls[0][0], /published = true/);
  assert.match(calls[0][0], /publish_at IS NULL OR publish_at <= NOW\(\)/);
  assert.deepEqual(calls[0][1], [POST.slug]);
});

test('an unknown slug answers 404 instead of the soft 404 the SPA produced', async () => {
  const { handler, res } = setup([]);
  await withShell(SHELL, () => handler(request('does-not-exist'), res));

  assert.equal(res.code, 404);
  assert.ok(res.body.includes('<meta name="robots" content="noindex, nofollow" />'));
  // A 404 must never be cached, or a post published on a schedule would keep
  // being served as missing until the entry expired.
  assert.equal(res.headers['Cache-Control'], 'no-store');
  assert.ok(res.body.includes('<div id="root"></div>'), 'the app still has to render its not-found screen');
});

test('a missing slug is treated as not found rather than queried', async () => {
  const { handler, calls, res } = setup([POST]);
  await withShell(SHELL, () => handler({ method: 'GET', query: {}, headers: { host: 'www.snorty.space' } }, res));
  assert.equal(res.code, 404);
  assert.equal(calls.length, 0);
});

test('a database failure degrades to the plain shell, never to a broken page', async () => {
  const { handler, res } = setup([], { failQuery: true });
  await withShell(SHELL, () => handler(request(POST.slug), res));
  assert.equal(res.code, 200);
  assert.equal(res.body, SHELL);
  assert.equal(res.headers['Cache-Control'], 'no-store');
});

test('an unreachable shell fails loudly instead of serving a broken document', async () => {
  const { handler, res } = setup([POST]);
  await withShell(new Error('offline'), () => handler(request(POST.slug), res));
  assert.equal(res.code, 502);
});
