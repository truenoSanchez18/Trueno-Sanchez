// Servidor del administrador del live.
//   /panel       panel de control (celular o compu)
//   /scoreboard  overlay para OBS (Fuente de navegador, 1920x1080)
//   /api/...     datos del partido
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { networkInterfaces } from 'node:os';
import { join, dirname, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTeams, BroadcastStore, PERIODS } from './state.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');
const PORT = Number(process.env.PORT ?? 3000);
const TOKEN = process.env.PANEL_TOKEN ?? '';

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const PAGES = { '/panel': 'panel.html', '/scoreboard': 'scoreboard.html' };

export function createApp({ teamsFile = join(ROOT, 'teams.yaml'), stateFile = join(ROOT, 'data', 'state.json'), token = TOKEN } = {}) {
  const teams = loadTeams(teamsFile);
  const store = new BroadcastStore({ teams, file: stateFile });
  const clients = new Set();

  store.on('change', (view) => {
    const msg = `data: ${JSON.stringify(view)}\n\n`;
    for (const res of clients) res.write(msg);
  });

  const send = (res, status, body) => {
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
    res.end(JSON.stringify(body));
  };

  const readJson = async (req) => {
    let raw = '';
    for await (const chunk of req) {
      raw += chunk;
      if (raw.length > 64_000) throw new Error('Cuerpo demasiado grande');
    }
    try {
      return raw ? JSON.parse(raw) : {};
    } catch {
      throw new Error('JSON inválido');
    }
  };

  const authorized = (req, url) => !token || req.headers['x-panel-token'] === token || url.searchParams.get('token') === token;

  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname;
    try {
      if (req.method === 'GET' && path === '/') {
        res.writeHead(302, { location: '/panel' }).end();
        return;
      }
      if (req.method === 'GET' && PAGES[path]) return await serveFile(res, join(PUBLIC, PAGES[path]));
      if (req.method === 'GET' && path.startsWith('/static/')) {
        const file = normalize(join(PUBLIC, path.slice('/static/'.length)));
        if (!file.startsWith(PUBLIC)) return send(res, 404, { error: 'No existe' });
        return await serveFile(res, file);
      }

      if (req.method === 'GET' && path === '/api/teams') return send(res, 200, { teams, periods: PERIODS });
      if (req.method === 'GET' && path === '/api/broadcast') return send(res, 200, store.view());
      if (req.method === 'GET' && path === '/api/broadcast/events') {
        res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' });
        res.write(`data: ${JSON.stringify(store.view())}\n\n`);
        clients.add(res);
        const ping = setInterval(() => res.write(': ping\n\n'), 20_000);
        req.on('close', () => {
          clearInterval(ping);
          clients.delete(res);
        });
        return;
      }

      if (req.method === 'POST' && path.startsWith('/api/')) {
        if (!authorized(req, url)) return send(res, 401, { error: 'Falta el token del panel' });
        const body = await readJson(req);
        if (path === '/api/broadcast') return send(res, 200, store.update(body));
        if (path === '/api/broadcast/points') return send(res, 200, store.addPoints(body.side, body.delta));
      }

      send(res, 404, { error: 'No existe' });
    } catch (err) {
      send(res, 400, { error: err.message });
    }
  });

  return { server, store };
}

async function serveFile(res, file) {
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(data);
  } catch {
    res.writeHead(404).end('No existe');
  }
}

function lanAddresses() {
  return Object.values(networkInterfaces())
    .flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal)
    .map((i) => i.address);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { server } = createApp();
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Administrador del live listo en el puerto ${PORT}`);
    console.log(`  Overlay para OBS:  http://localhost:${PORT}/scoreboard`);
    console.log(`  Panel (esta compu): http://localhost:${PORT}/panel`);
    for (const ip of lanAddresses()) console.log(`  Panel (celular):   http://${ip}:${PORT}/panel${TOKEN ? `?token=${TOKEN}` : ''}`);
    if (!TOKEN) console.log('  Aviso: sin PANEL_TOKEN, cualquiera en tu red wifi puede mover el marcador.');
  });
}
