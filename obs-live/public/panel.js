// Panel del live: lee /api/broadcast por SSE y escribe con POST.
const $ = (id) => document.getElementById(id);
const PERIOD_LABEL = { PRE: 'Previa', MT: 'Medio', FINAL: 'Final' };

// El token llega una vez por ?token= y se recuerda en este celular.
const store = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
                set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
const qsToken = new URLSearchParams(location.search).get('token');
if (qsToken) store.set('panelToken', qsToken);
const token = qsToken || store.get('panelToken') || '';

let teams = [];
let state = null;
let tickerDraft = null; // copia local mientras se edita la cinta

function toast(msg, err = false) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.toggle('err', err);
  t.classList.add('on');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('on'), err ? 4000 : 1500);
}

async function post(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { 'x-panel-token': token } : {}) },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    toast(data.error || `Error ${res.status}`, true);
    throw new Error(data.error);
  }
  return data;
}

function teamOptions(selected, short = false) {
  const groups = {};
  for (const t of teams) (groups[`${t.conference} ${t.division}`] ??= []).push(t);
  return Object.entries(groups).map(([g, list]) =>
    `<optgroup label="${g}">${list.map((t) =>
      `<option value="${t.id}"${t.id === selected ? ' selected' : ''}>${short ? t.id : `${t.id} · ${t.name}`}</option>`).join('')}</optgroup>`).join('');
}

function renderTeams() {
  for (const side of ['away', 'home']) {
    const box = document.querySelector(`.team[data-side="${side}"]`);
    const s = state[side];
    const pick = box.querySelector('.pick');
    if (pick.dataset.value !== s.team) {
      pick.innerHTML = teamOptions(s.team);
      pick.dataset.value = s.team;
    }
    box.querySelector('.score').textContent = s.score;
    box.style.setProperty('--team', s.colors.primary);
  }
}

function renderPeriods(periods) {
  $('periods').innerHTML = periods.map((p) => `<button type="button" data-period="${p}">${PERIOD_LABEL[p] || p}</button>`).join('');
}

function renderTicker() {
  const rows = tickerDraft ?? state.ticker;
  const box = $('ticker');
  if (!rows.length) {
    box.innerHTML = '<div class="empty">Sin resultados. La cinta no aparece en OBS mientras esté vacía.</div>';
  } else {
    box.innerHTML = rows.map((r, i) => `
      <div class="trow" data-i="${i}">
        <select data-k="away" aria-label="Visitante">${teamOptions(r.away, true)}</select>
        <input data-k="awayScore" type="number" min="0" inputmode="numeric" value="${r.awayScore}" aria-label="Puntos visitante">
        <select data-k="home" aria-label="Local">${teamOptions(r.home, true)}</select>
        <input data-k="homeScore" type="number" min="0" inputmode="numeric" value="${r.homeScore}" aria-label="Puntos local">
        <input class="st" data-k="status" value="${String(r.status).replace(/"/g, '&quot;')}" maxlength="20" aria-label="Estado">
        <button type="button" class="del" aria-label="Quitar">✕</button>
      </div>`).join('');
  }
  $('tickerState').textContent = tickerDraft ? 'Cambios sin guardar.' : '';
}

function render() {
  renderTeams();
  for (const b of $('periods').querySelectorAll('button')) b.setAttribute('aria-pressed', String(b.dataset.period === state.period));
  if (document.activeElement !== $('clock')) $('clock').value = state.clock;
  $('topicNow').textContent = state.topic ? `Al aire: “${state.topic}”` : 'Sin tema al aire.';
  if (!tickerDraft) renderTicker();
}

function plainTicker(rows) {
  return rows.map(({ away, awayScore, home, homeScore, status }) => ({ away, awayScore, home, homeScore, status }));
}

// --- eventos ---
document.querySelectorAll('.team').forEach((box) => {
  const side = box.dataset.side;
  box.querySelector('.btns').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) post('/api/broadcast/points', { side, delta: Number(b.dataset.delta) }).catch(() => {});
  });
  box.querySelector('.pick').addEventListener('change', (e) => {
    post('/api/broadcast', { [side]: { team: e.target.value } }).then(() => toast('Equipo cambiado')).catch(() => {});
  });
});

$('periods').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b) post('/api/broadcast', { period: b.dataset.period }).catch(() => {});
});

$('clock').addEventListener('change', (e) => post('/api/broadcast', { clock: e.target.value }).then(() => toast('Reloj actualizado')).catch(() => {}));

$('topicForm').addEventListener('submit', (e) => {
  e.preventDefault();
  post('/api/broadcast', { topic: $('topic').value }).then(() => { toast('Tema al aire'); $('topic').value = ''; }).catch(() => {});
});
$('topicClear').addEventListener('click', () => post('/api/broadcast', { topic: '' }).then(() => toast('Tema quitado')).catch(() => {}));

$('ticker').addEventListener('input', (e) => {
  const row = e.target.closest('.trow');
  if (!row) return;
  tickerDraft ??= plainTicker(state.ticker);
  const k = e.target.dataset.k;
  tickerDraft[row.dataset.i][k] = k.endsWith('Score') ? Math.max(0, parseInt(e.target.value, 10) || 0) : e.target.value;
  $('tickerState').textContent = 'Cambios sin guardar.';
});
$('ticker').addEventListener('click', (e) => {
  if (!e.target.closest('.del')) return;
  tickerDraft ??= plainTicker(state.ticker);
  tickerDraft.splice(Number(e.target.closest('.trow').dataset.i), 1);
  renderTicker();
});
$('tickerAdd').addEventListener('click', () => {
  tickerDraft ??= plainTicker(state.ticker);
  tickerDraft.push({ away: teams[0].id, awayScore: 0, home: teams[1].id, homeScore: 0, status: 'FINAL' });
  renderTicker();
});
$('tickerSave').addEventListener('click', () => {
  if (!tickerDraft) return toast('No hay cambios');
  post('/api/broadcast', { ticker: tickerDraft }).then(() => { tickerDraft = null; renderTicker(); toast('Cinta guardada'); }).catch(() => {});
});

// --- arranque ---
(async () => {
  const meta = await fetch('/api/teams').then((r) => r.json());
  teams = meta.teams;
  renderPeriods(meta.periods);
  const es = new EventSource('/api/broadcast/events');
  es.onopen = () => { $('status').textContent = 'En línea'; $('status').className = 'status ok'; };
  es.onerror = () => { $('status').textContent = 'Sin conexión'; $('status').className = 'status bad'; };
  es.onmessage = (e) => { state = JSON.parse(e.data); render(); };
})();
