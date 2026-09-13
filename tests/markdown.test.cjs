const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { transpileModule, ModuleKind } = require('typescript');
function load(file) {
  const exports = {};
  new Function('exports', 'require', transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ModuleKind.CommonJS } }).outputText)(exports, () => { throw new Error('the renderer must stay dependency-free'); });
  return exports;
}
const { renderMarkdown, MARKDOWN_CLASS_NAMES } = load('server/markdown.ts');

test('every construct the posts actually use survives the server render', () => {
  // The list is not invented: it is what a tally over all 27 published posts
  // found — bullet lists, h1-h3, fenced code, rules, numbered lists, GFM
  // tables, bold, inline code, links and images, in that order of frequency.
  const html = renderMarkdown([
    '# Overview',
    '',
    'Docker packages an app and its **dependencies** into one `container`.',
    '',
    '## Why it matters',
    '',
    '- portable',
    '- reproducible',
    '',
    '1. build',
    '2. run',
    '',
    '### Commands',
    '',
    '```bash',
    'docker run -it ubuntu',
    '```',
    '',
    '| Flag | Meaning |',
    '| --- | --- |',
    '| -it | interactive |',
    '',
    '> Containers are not virtual machines.',
    '',
    '---',
    '',
    'See [the docs](https://docs.docker.com) and ![the logo](/logo.png).',
  ].join('\n'));

  // A markdown h1 repeats the post title, so it is demoted exactly as
  // MarkdownComponents.tsx demotes it for react-markdown.
  assert.ok(html.includes(`<h2 class="${MARKDOWN_CLASS_NAMES.h1}">Overview</h2>`));
  assert.ok(html.includes(`<h2 class="${MARKDOWN_CLASS_NAMES.h2}">Why it matters</h2>`));
  assert.ok(html.includes(`<h3 class="${MARKDOWN_CLASS_NAMES.h3}">Commands</h3>`));
  assert.ok(html.includes('<strong class="font-semibold text-ink">dependencies</strong>'));
  assert.ok(html.includes(`<code class="${MARKDOWN_CLASS_NAMES.code}">container</code>`));
  assert.ok(html.includes('<li class="text-ink/90 leading-relaxed">portable</li>'));
  assert.ok(html.includes(`<ol class="${MARKDOWN_CLASS_NAMES.ol}">`));
  assert.ok(html.includes('<pre class="bg-panel p-4 rounded-lg overflow-x-auto my-5 border border-line text-[13px]"><code>docker run -it ubuntu</code></pre>'));
  assert.ok(html.includes(`<th class="${MARKDOWN_CLASS_NAMES.th}">Flag</th>`));
  assert.ok(html.includes(`<td class="${MARKDOWN_CLASS_NAMES.td}">interactive</td>`));
  assert.ok(!html.includes('---</td>'), 'the table divider row is not a data row');
  assert.ok(html.includes('<blockquote'));
  assert.ok(html.includes(`<hr class="${MARKDOWN_CLASS_NAMES.hr}" />`));
  assert.ok(html.includes('<a class="text-signal underline underline-offset-2 hover:text-signal-600" href="https://docs.docker.com">the docs</a>'));
  assert.ok(html.includes('src="/logo.png" alt="the logo"'));
});

// The renderer emits only these tags; any other tag in the output came from the
// post itself and means an escape was skipped. A whitelist rather than a search
// for "<script": removing the escaping has to fail this test under any tag name.
const EMITTED = new Set(['p', 'h2', 'h3', 'ul', 'ol', 'li', 'pre', 'code', 'blockquote', 'hr', 'a', 'img', 'strong', 'em', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td']);
const tagsIn = (html) => [...html.matchAll(/<\/?([a-z][a-z0-9]*)/gi)].map((match) => match[1].toLowerCase());

test('a post cannot inject markup, exactly as react-markdown does not render raw HTML', () => {
  const html = renderMarkdown('<script>alert(1)</script>\n\nAnd <img src=x onerror=alert(1)>');
  for (const tag of tagsIn(html)) assert.ok(EMITTED.has(tag), `<${tag}> reached the output: it came from the post, not from the renderer`);
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'), 'the source markup is inert text');
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  // A code span is literal: its contents must not be re-interpreted either.
  assert.ok(!renderMarkdown('`**not bold**`').includes('<strong'));
  assert.ok(!renderMarkdown('`[not a link](/x)`').includes('<a '));
});

test('a link with a scheme a browser should not follow never becomes a link', () => {
  const html = renderMarkdown('[click](javascript:alert(1))');
  assert.ok(!html.includes('<a '), html);
  assert.ok(!html.includes('href='), html);
  // It stays inert text rather than disappearing, so the author can see the typo.
  assert.ok(html.includes('[click](javascript:alert(1))'));
});

test('paragraphs join their lines and blank input renders nothing', () => {
  assert.equal(renderMarkdown('one\ntwo'), `<p class="${MARKDOWN_CLASS_NAMES.p}">one two</p>`);
  assert.equal(renderMarkdown(''), '');
  assert.equal(renderMarkdown('   \n\n  '), '');
});

test('an unterminated code fence cannot swallow the rest of the post silently', () => {
  const html = renderMarkdown('```\nnot closed');
  assert.ok(html.includes('<pre'));
  assert.ok(html.includes('not closed'));
});

test('the server classes are the ones MarkdownComponents.tsx uses, or the flash would be visible', () => {
  const client = readFileSync('src/components/MarkdownComponents.tsx', 'utf8');
  for (const [element, className] of Object.entries(MARKDOWN_CLASS_NAMES)) {
    assert.ok(client.includes(`"${className}"`), `${element}: "${className}" is no longer in MarkdownComponents.tsx`);
  }
});
