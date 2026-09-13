// The failure this file exists to prevent: a Vercel deployment on the Hobby plan
// may contain at most 12 Serverless Functions, and every source file under api/
// is one. Going over does not degrade anything gracefully — the build fails and
// production stops updating, with no warning at review time. It happened once,
// when the SEO work added api/feed.ts and api/post-page.ts and took the project
// from 12 to 14.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readdirSync, readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

// Vercel's Hobby plan limit. Raise it only together with the plan.
const LIMIT = 12;
// Extensions Vercel turns into a function; a file or directory named with a
// leading underscore is treated as a helper and does not become one.
const RUNTIME = /\.(js|mjs|cjs|ts|mts|cts|go|py|rb|rs)$/;

function functionFiles(dir = 'api', prefix = 'api') {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('_') || entry.name === 'node_modules') return [];
    const path = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) return functionFiles(join(dir, entry.name), path);
    return RUNTIME.test(entry.name) ? [path] : [];
  });
}

test(`the deployment stays within the ${LIMIT} Serverless Functions of the Hobby plan`, () => {
  const files = functionFiles().sort();
  assert.ok(
    files.length <= LIMIT,
    `${files.length} Serverless Functions, ${LIMIT} allowed. Merge endpoints that can share a file:\n${files.join('\n')}`
  );
});

test('every /api rewrite in vercel.json lands on a function that exists', () => {
  const { routes } = JSON.parse(readFileSync('vercel.json', 'utf8'));
  const destinations = routes.map((route) => route.dest).filter((dest) => dest && dest.startsWith('/api/'));
  assert.ok(destinations.length > 0, 'vercel.json should still rewrite the public URLs onto /api');
  for (const dest of destinations) {
    const path = dest.split('?')[0].replace(/^\//, '');
    assert.ok(
      existsSync(`${path}.ts`) || existsSync(`${path}.js`),
      `vercel.json rewrites to ${dest}, but no function file exists at ${path}`
    );
  }
});
