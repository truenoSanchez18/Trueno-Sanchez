import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../src/server.js';

let base, server;
const call = (path, body, headers = {}) =>
  fetch(base + path, body ? { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) } : {})
    .then(async (r) => ({ status: r.status, body: await r.json() }));

before(async () => {
  const dir = mkdtempSync(join(tmpdir(), 'obs-live-'));
  ({ server } = createApp({ stateFile: join(dir, 'state.json'), token: 'secreto' }));
  await new Promise((ok) => server.listen(0, ok));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

const auth = { 'x-panel-token': 'secreto' };

test('teams.yaml trae los 32 equipos', async () => {
  const { body } = await call('/api/teams');
  assert.equal(body.teams.length, 32);
  assert.equal(new Set(body.teams.map((t) => t.id)).size, 32);
});

test('GET /api/broadcast regresa equipos resueltos', async () => {
  const { status, body } = await call('/api/broadcast');
  assert.equal(status, 200);
  assert.ok(body.home.colors.primary);
  assert.equal(typeof body.home.score, 'number');
});

test('escribir sin token se rechaza', async () => {
  const { status } = await call('/api/broadcast', { topic: 'x' });
  assert.equal(status, 401);
});

test('cambiar equipos, puntos, tema y cinta', async () => {
  let r = await call('/api/broadcast', { home: { team: 'kc', score: 0 }, away: { team: 'BUF', score: 0 }, topic: 'Previa' }, auth);
  assert.equal(r.status, 200);
  assert.equal(r.body.home.team, 'KC');
  r = await call('/api/broadcast/points', { side: 'home', delta: 6 }, auth);
  r = await call('/api/broadcast/points', { side: 'home', delta: 1 }, auth);
  assert.equal(r.body.home.score, 7);
  r = await call('/api/broadcast/points', { side: 'away', delta: -1 }, auth);
  assert.equal(r.body.away.score, 0, 'el marcador nunca baja de 0');
  r = await call('/api/broadcast', { ticker: [{ away: 'DAL', awayScore: 17, home: 'PHI', homeScore: 24, status: 'FINAL' }] }, auth);
  assert.equal(r.body.ticker[0].homeTeam.name, 'Eagles');
});

test('datos inválidos se rechazan con mensaje claro', async () => {
  for (const bad of [{ home: { team: 'XYZ' } }, { period: '5Q' }, { clock: 'ayer' }, { ticker: [{ away: 'DAL', home: 'NOPE' }] }, { home: { score: -3 } }]) {
    const { status, body } = await call('/api/broadcast', bad, auth);
    assert.equal(status, 400, JSON.stringify(bad));
    assert.ok(body.error);
  }
});
