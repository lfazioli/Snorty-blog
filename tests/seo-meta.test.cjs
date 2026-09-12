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
const seo = load('src/lib/seo-meta.ts');
const SITE = 'https://www.snorty.space';

const article = () => seo.buildSeoMeta({
  siteUrl: SITE,
  title: 'What Is Ethical Hacking?',
  description: 'A short introduction to ethical hacking.',
  path: '/post/what-is-ethical-hacking',
  image: 'https://example.com/cover.png',
  type: 'article',
  article: { publishedTime: '2026-08-23T10:00:00.000Z', modifiedTime: '2026-08-24T10:00:00.000Z' },
});

const tag = (meta, key) => meta.tags.find((item) => item.key === key);

test('the brand suffix is dropped once the title would stop fitting a result', () => {
  // 46 characters + " | Snorty Blog" is exactly the 60 character budget.
  const fits = 'a'.repeat(46);
  assert.equal(seo.pageTitle(fits), `${fits} | Snorty Blog`);
  assert.equal(seo.pageTitle('a'.repeat(47)), 'a'.repeat(47));
  assert.ok(seo.pageTitle(fits).length <= seo.TITLE_LIMIT);
});

test('canonical, og:url and JSON-LD all resolve against the configured host', () => {
  const meta = article();
  const expected = `${SITE}/post/what-is-ethical-hacking`;
  assert.equal(meta.canonical, expected);
  assert.equal(tag(meta, 'og:url').content, expected);
  assert.equal(meta.structuredData[0].value.mainEntityOfPage['@id'], expected);
  assert.equal(meta.structuredData[1].value.url, `${SITE}/`);
  // A trailing slash on the configured value must not produce a doubled one.
  assert.equal(seo.absoluteUrl(`${SITE}/`, '/posts'), `${SITE}/posts`);
});

test('an article carries its dates, type and language; a page carries none of them', () => {
  const meta = article();
  assert.equal(tag(meta, 'og:type').content, 'article');
  assert.equal(tag(meta, 'article:published_time').content, '2026-08-23T10:00:00.000Z');
  assert.equal(meta.structuredData[0].value['@type'], 'BlogPosting');
  assert.equal(meta.structuredData[0].value.inLanguage, seo.SITE_LANGUAGE);

  const page = seo.buildSeoMeta({ siteUrl: SITE, title: 'Tools', description: 'A toolbox.', path: '/tools' });
  assert.equal(tag(page, 'og:type').content, 'website');
  assert.equal(tag(page, 'article:published_time'), undefined);
  assert.equal(page.structuredData[0].value['@type'], 'WebPage');
});

test('every optional tag the builder can emit is declared for cleanup', () => {
  // Seo.tsx removes these when navigating away; one missing from the list would
  // leave the previous post's image or dates in the head.
  const optional = new Set(seo.OPTIONAL_TAG_KEYS);
  const always = seo.buildSeoMeta({ siteUrl: SITE, title: 'Tools', description: 'A toolbox.', path: '/tools' });
  const alwaysKeys = new Set(always.tags.map((item) => item.key));
  for (const item of article().tags) {
    if (!alwaysKeys.has(item.key)) assert.ok(optional.has(item.key), `${item.key} is not in OPTIONAL_TAG_KEYS`);
  }
});

test('noIndex reaches the robots tag', () => {
  const meta = seo.buildSeoMeta({ siteUrl: SITE, title: 'Post not found', description: 'Not available.', noIndex: true });
  assert.equal(meta.robots, 'noindex, nofollow');
  assert.equal(tag(meta, 'robots').content, 'noindex, nofollow');
});

test('injection rewrites the real index.html and keeps the document intact', () => {
  const shell = readFileSync('index.html', 'utf8');
  // Guards the marker itself: Vite copies index.html through, and losing the
  // markers would make the prerender silently serve the defaults instead.
  assert.ok(shell.includes('<!-- seo:start -->'), 'index.html lost the seo:start marker');
  assert.ok(shell.includes('<!-- seo:end -->'), 'index.html lost the seo:end marker');

  const out = seo.injectSeoMeta(shell, article());
  assert.ok(out.includes('<title>What Is Ethical Hacking? | Snorty Blog</title>'));
  assert.ok(!out.includes('<title>Snorty Blog | Cybersecurity and development</title>'), 'the default title survived');
  assert.equal(out.match(/<title>/g).length, 1, 'exactly one title must remain');
  assert.ok(out.includes(`<link rel="canonical" href="${SITE}/post/what-is-ethical-hacking" />`));
  assert.ok(out.includes('<meta property="og:image" content="https://example.com/cover.png" />'));
  assert.ok(out.includes('"@type":"BlogPosting"'));
  // Everything outside the block has to survive untouched.
  assert.ok(out.includes('<div id="root"></div>'));
  assert.ok(out.includes('google-site-verification'));
  assert.ok(out.trimEnd().endsWith('</html>'));
});

test('a shell without markers is returned untouched rather than half-rewritten', () => {
  const shell = '<!DOCTYPE html><html><head><title>x</title></head><body></body></html>';
  assert.equal(seo.injectSeoMeta(shell, article()), shell);
});

test('titles cannot break out of an attribute or close the JSON-LD script', () => {
  const meta = seo.buildSeoMeta({
    siteUrl: SITE,
    title: '</script><img src=x> "quoted" & odd',
    description: 'A description with "quotes" & an ampersand.',
    path: '/post/x',
    type: 'article',
    article: { publishedTime: '2026-01-01T00:00:00.000Z' },
  });
  const out = seo.renderSeoMeta(meta);
  assert.ok(!out.includes('<img src=x>'), 'raw markup leaked into an attribute');
  assert.ok(!out.includes('</script><img'), 'the JSON-LD script could be closed early');
  assert.ok(out.includes('&quot;quoted&quot;'));
  assert.ok(out.includes('\\u003c/script'));
});

test('the icon emitted by the build is picked up as the default social image', () => {
  const shell = readFileSync('index.html', 'utf8');
  assert.equal(seo.shellIconHref(shell), '/src/assets/logo.png');
  assert.equal(seo.shellIconHref('<html><head></head></html>'), null);
});
