const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { transpileModule, ModuleKind } = require('typescript');
const jwt = require('jsonwebtoken');
function load(file, dependencies = {}, env = {}) {
  const exports = {};
  new Function('exports', 'require', 'process', 'console', transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ModuleKind.CommonJS, esModuleInterop: true } }).outputText)(exports, (name) => {
    if (!(name in dependencies)) throw new Error(`Unexpected dependency ${name}`);
    return dependencies[name];
  }, { env }, { error() {} });
  return exports;
}
function response() { return { code: 200, setHeader() {}, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } }; }
function setup(adminEmail = 'admin@example.com', user = { id: 1, email: 'admin@example.com', role: 'admin', password_hash: 'hash' }) {
  let signed = false, queries = 0;
  const handler = load('api/auth/login.ts', {
    bcryptjs: { compare: async (password) => password === 'correct-password' },
    '../../server/db.js': { ensureSchema: async () => {}, pool: { query: async () => { queries++; return { rows: user ? [user] : [] }; } } },
    '../../server/auth.js': { signSession: (payload) => { assert.equal(payload.role, 'admin'); signed = true; return 'token'; } },
  }, { ADMIN_EMAIL: adminEmail }).default;
  return { handler, res: response(), signed: () => signed, queries: () => queries };
}
test('only the configured administrator with the correct password can sign in', async () => {
  for (const [email, password, expected] of [[' ADMIN@example.com ', 'correct-password', 200], ['admin@example.com', 'wrong', 401], ['reader@example.com', 'correct-password', 401]]) {
    const state = setup();
    await state.handler({ method: 'POST', body: { email, password } }, state.res);
    assert.equal(state.res.code, expected); assert.equal(state.signed(), expected === 200);
  }
});
test('missing admin configuration fails closed and login cannot create an account', async () => {
  const missing = setup('');
  await missing.handler({ method: 'POST', body: { email: 'admin@example.com', password: 'correct-password' } }, missing.res);
  assert.equal(missing.res.code, 503); assert.equal(missing.queries(), 0);
  const absent = setup('admin@example.com', null);
  await absent.handler({ method: 'POST', body: { email: 'admin@example.com', password: 'correct-password' } }, absent.res);
  assert.equal(absent.res.code, 401); assert.equal(absent.signed(), false);
});
test('old reader and other administrator sessions cannot access protected APIs', () => {
  const secret = 'test-only-secret';
  const auth = load('server/auth.ts', { jsonwebtoken: jwt }, { JWT_SECRET: secret, ADMIN_EMAIL: 'admin@example.com' });
  for (const [email, role, allowed] of [['admin@example.com', 'admin', true], ['reader@example.com', 'reader', false], ['other@example.com', 'admin', false], ['admin@example.com', 'reader', false]]) {
    const token = jwt.sign({ userId: 1, email, role }, secret);
    assert.equal(Boolean(auth.verifySession(token)), allowed);
    const res = response();
    assert.equal(Boolean(auth.requireAdmin({ headers: { authorization: `Bearer ${token}` } }, res)), allowed);
  }
});
test('retired registration and reset endpoints reject every request without dependencies', () => {
  for (const file of ['register', 'forgot', 'reset']) {
    const handler = load(`api/auth/${file}.ts`).default;
    for (const method of ['GET', 'POST', 'PUT']) {
      const res = response(); handler({ method, body: { email: 'admin@example.com', password: 'test', token: 'old-token' } }, res);
      assert.equal(res.code, 404);
    }
  }
});
