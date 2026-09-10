const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { transpileModule, ModuleKind } = require('typescript');
function load(env, fetch = async () => ({ ok: true })) {
  const exports = {};
  const source = transpileModule(readFileSync('server/email.ts', 'utf8'), { compilerOptions: { module: ModuleKind.CommonJS } }).outputText;
  new Function('exports', 'process', 'fetch', source)(exports, { env }, fetch);
  return exports;
}
const env = { SITE_URL: 'https://snorty.space/', RESEND_API_KEY: 'test-key', RESEND_FROM_EMAIL: 'Snorty Blog <noreply@snorty.space>' };
test('password reset uses a configured HTTPS origin', () => {
  assert.equal(load(env).getPasswordResetSiteUrl(), 'https://snorty.space');
  assert.equal(load(env).isPasswordResetEmailConfigured(), true);
  for (const SITE_URL of ['', 'http://snorty.space', 'https://user@snorty.space', 'https://snorty.space/path', 'invalid']) {
    assert.equal(load({ ...env, SITE_URL }).isPasswordResetEmailConfigured(), false);
  }
  assert.equal(load({ ...env, RESEND_API_KEY: '' }).isPasswordResetEmailConfigured(), false);
});
test('Resend request includes sender, recipient and working reset link in text and HTML', async () => {
  const link = 'https://snorty.space/reset-password/example';
  let called = false;
  await load(env, async (url, options) => {
    called = true;
    assert.equal(url, 'https://api.resend.com/emails');
    assert.equal(options.headers.Authorization, 'Bearer test-key');
    const body = JSON.parse(options.body);
    assert.equal(body.from, env.RESEND_FROM_EMAIL);
    assert.equal(body.to, 'reader@example.com');
    assert.ok(body.html.includes(link)); assert.ok(body.text.includes(link));
    return { ok: true };
  }).sendPasswordResetEmail('reader@example.com', link);
  assert.equal(called, true);
});
test('Resend failures are not reported as successful sends', async () => {
  await assert.rejects(load(env, async () => ({ ok: false, status: 403, text: async () => 'Domain not verified' })).sendPasswordResetEmail('reader@example.com', 'https://snorty.space/reset-password/example'), /403/);
});
