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
const pageMeta = load('src/lib/page-meta.ts');
const markdown = load('server/markdown.ts');
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
  content: '# Overview\n\nEthical hacking is **authorised** testing.\n\n- scope first\n- report after\n',
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
  const handler = load('api/page.ts', {
    '../server/db.js': db,
    '../server/site-url.js': siteUrl,
    '../server/markdown.js': markdown,
    '../src/lib/seo-meta.js': seoMeta,
    '../src/lib/page-meta.js': pageMeta,
  }).default;
  return { handler, calls, res: response() };
}

const request = (path) => ({ method: 'GET', query: { path }, headers: { host: 'www.snorty.space' } });

test('a published post is served with its own metadata AND its own words in the HTML', async () => {
  const { handler, calls, res } = setup([POST]);
  await withShell(SHELL, () => handler(request(`/post/${POST.slug}`), res));

  assert.equal(res.code, 200);
  // The whole point: the crawler must find all of this without running JavaScript.
  assert.ok(res.body.includes('<title>What Is Ethical Hacking? | Snorty Blog</title>'));
  assert.ok(res.body.includes('<link rel="canonical" href="https://www.snorty.space/post/what-is-ethical-hacking" />'));
  assert.ok(res.body.includes('<meta property="og:type" content="article" />'));
  assert.ok(res.body.includes('<meta property="og:image" content="https://example.com/cover.png" />'));
  assert.ok(res.body.includes('"@type":"BlogPosting"'));
  assert.ok(res.body.includes('<h1 class="text-2xl sm:text-3xl font-semibold text-ink leading-snug tracking-tight mb-6">What Is Ethical Hacking?</h1>'));
  assert.ok(res.body.includes('Ethical hacking is <strong class="font-semibold text-ink">authorised</strong> testing.'));
  assert.ok(res.body.includes('<li class="text-ink/90 leading-relaxed">scope first</li>'));
  // ...and the application must still boot from the same document and replace it.
  assert.ok(res.body.includes('<div id="root">'));
  assert.equal(res.headers['Content-Type'], 'text/html; charset=utf-8');

  assert.match(calls[0][0], /published = true/);
  assert.match(calls[0][0], /publish_at IS NULL OR publish_at <= NOW\(\)/);
  assert.deepEqual(calls[0][1], [POST.slug]);
});

test('the static pages carry their own head instead of the shared default', async () => {
  for (const page of pageMeta.PUBLIC_PAGES) {
    const { handler, calls, res } = setup([]);
    await withShell(SHELL, () => handler(request(page.path), res));

    assert.equal(res.code, 200, page.path);
    assert.ok(res.body.includes(`<link rel="canonical" href="https://www.snorty.space${page.path === '/' ? '/' : page.path}" />`), page.path);
    assert.ok(res.body.includes(`<meta name="description" content="${page.description}" />`), page.path);
    assert.ok(res.body.includes('"@type":"WebPage"'), page.path);
    assert.ok(res.body.includes('<meta name="robots" content="index, follow, max-image-preview:large" />'), page.path);
    assert.equal(calls.length, 0, `${page.path} must not query the database`);
  }
  // Four pages that used to share one <title> must now have four different ones.
  const titles = new Set();
  for (const page of pageMeta.PUBLIC_PAGES) {
    const { handler, res } = setup([]);
    await withShell(SHELL, () => handler(request(page.path), res));
    titles.add(res.body.match(/<title>([^<]*)<\/title>/)[1]);
  }
  assert.equal(titles.size, pageMeta.PUBLIC_PAGES.length);
});

test('trailing slashes are the same page, not a duplicate', async () => {
  const { handler, res } = setup([]);
  await withShell(SHELL, () => handler(request('/posts/'), res));
  assert.equal(res.code, 200);
  assert.ok(res.body.includes('<link rel="canonical" href="https://www.snorty.space/posts" />'));
});

test('admin screens answer 200 and noindex, never 404', async () => {
  for (const path of ['/login', '/dashboard', '/dashboard/new', '/dashboard/edit/some-slug', '/dashboard/tools', '/dashboard/tools/new', '/dashboard/tools/edit/7']) {
    const { handler, res } = setup([]);
    await withShell(SHELL, () => handler(request(path), res));
    assert.equal(res.code, 200, path);
    assert.ok(res.body.includes('<meta name="robots" content="noindex, nofollow" />'), path);
  }
});

test('an unknown route answers 404 instead of the soft 404 the SPA catch-all produced', async () => {
  for (const path of ['/post/does-not-exist', '/nope', '/dashboard/nope', '//evil.example.com']) {
    const { handler, res } = setup([]);
    await withShell(SHELL, () => handler(request(path), res));
    assert.equal(res.code, 404, path);
    assert.ok(res.body.includes('<meta name="robots" content="noindex, nofollow" />'), path);
    // A 404 must never be cached, or a post published on a schedule would keep
    // being served as missing until the entry expired.
    assert.equal(res.headers['Cache-Control'], 'no-store', path);
    assert.ok(res.body.includes('<div id="root">'), 'the app still has to render its not-found screen');
  }
});

test('a missing path is treated as not found rather than queried', async () => {
  const { handler, calls, res } = setup([POST]);
  await withShell(SHELL, () => handler({ method: 'GET', query: {}, headers: { host: 'www.snorty.space' } }, res));
  assert.equal(res.code, 404);
  assert.equal(calls.length, 0);
});

test('a database failure degrades to the plain shell, never to a broken page', async () => {
  const { handler, res } = setup([], { failQuery: true });
  await withShell(SHELL, () => handler(request(`/post/${POST.slug}`), res));
  assert.equal(res.code, 200);
  assert.equal(res.body, SHELL);
  assert.equal(res.headers['Cache-Control'], 'no-store');
});

test('an unreachable shell fails loudly instead of serving a broken document', async () => {
  const { handler, res } = setup([POST]);
  await withShell(new Error('offline'), () => handler(request(`/post/${POST.slug}`), res));
  assert.equal(res.code, 502);
});

test('every client route in main.tsx is a route the server knows how to answer', () => {
  const main = readFileSync('src/main.tsx', 'utf8');
  const routes = [...main.matchAll(/<Route\s+path="([^"]+)"/g)].map((match) => match[1]).filter((path) => path !== '*');
  assert.ok(routes.length >= 12, 'the route list should not have silently emptied');
  for (const route of routes) {
    // A parameterised route is probed with a plausible value.
    const path = route.replace(/:[^/]+/g, 'sample');
    const known = pageMeta.isArticlePath(path) || pageMeta.publicPage(path) || pageMeta.adminPage(path);
    assert.ok(known, `${route} is a real page but api/page.ts would answer 404 for it`);
  }
});
