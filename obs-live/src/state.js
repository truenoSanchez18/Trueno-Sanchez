// Estado del live: marcador, periodo, tema activo y cinta de resultados.
// Una sola fuente de verdad: el panel escribe aquí y /scoreboard lee de aquí.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { EventEmitter } from 'node:events';
import YAML from 'yaml';

export const PERIODS = ['PRE', '1Q', '2Q', 'MT', '3Q', '4Q', 'OT', 'FINAL'];
const MAX_TICKER = 20;
const MAX_TEXT = 80;

export function loadTeams(file) {
  const doc = YAML.parse(readFileSync(file, 'utf8'));
  const teams = doc?.teams ?? [];
  const ids = new Set();
  for (const t of teams) {
    if (!t.id || !t.name || !t.colors?.primary) throw new Error(`Equipo incompleto en ${file}: ${JSON.stringify(t)}`);
    if (ids.has(t.id)) throw new Error(`Equipo repetido en ${file}: ${t.id}`);
    ids.add(t.id);
  }
  if (teams.length !== 32) throw new Error(`${file} debe tener 32 equipos, tiene ${teams.length}`);
  return teams;
}

function defaultState(teams) {
  return {
    home: { team: teams[0].id, score: 0 },
    away: { team: teams[1].id, score: 0 },
    period: 'PRE',
    clock: '15:00',
    topic: '',
    ticker: [],
    updatedAt: new Date().toISOString(),
  };
}

const text = (v, field) => {
  if (typeof v !== 'string') throw new Error(`${field} debe ser texto`);
  return v.trim().slice(0, MAX_TEXT);
};

const score = (v, field) => {
  if (!Number.isInteger(v) || v < 0 || v > 999) throw new Error(`${field} debe ser un entero entre 0 y 999`);
  return v;
};

export class BroadcastStore extends EventEmitter {
  constructor({ teams, file }) {
    super();
    this.teams = teams;
    this.byId = new Map(teams.map((t) => [t.id, t]));
    this.file = file;
    this.state = defaultState(teams);
    if (file && existsSync(file)) {
      try {
        this.state = { ...this.state, ...this.#validate(JSON.parse(readFileSync(file, 'utf8'))) };
      } catch (err) {
        console.warn(`No pude cargar ${file} (${err.message}); empiezo con estado nuevo.`);
      }
    }
  }

  #team(id, field) {
    const key = String(id ?? '').toUpperCase();
    if (!this.byId.has(key)) throw new Error(`${field}: equipo desconocido "${id}"`);
    return key;
  }

  // Valida un parche parcial y regresa solo los campos limpios.
  #validate(patch) {
    if (!patch || typeof patch !== 'object' || Array.isArray(patch)) throw new Error('El cuerpo debe ser un objeto JSON');
    const out = {};
    for (const side of ['home', 'away']) {
      if (patch[side] === undefined) continue;
      const cur = { ...this.state[side] };
      if (patch[side].team !== undefined) cur.team = this.#team(patch[side].team, `${side}.team`);
      if (patch[side].score !== undefined) cur.score = score(patch[side].score, `${side}.score`);
      out[side] = cur;
    }
    if (patch.period !== undefined) {
      if (!PERIODS.includes(patch.period)) throw new Error(`period debe ser uno de ${PERIODS.join(', ')}`);
      out.period = patch.period;
    }
    if (patch.clock !== undefined) {
      const c = text(patch.clock, 'clock');
      if (c && !/^\d{1,2}:\d{2}$/.test(c)) throw new Error('clock debe tener formato MM:SS');
      out.clock = c;
    }
    if (patch.topic !== undefined) out.topic = text(patch.topic, 'topic');
    if (patch.ticker !== undefined) {
      if (!Array.isArray(patch.ticker)) throw new Error('ticker debe ser una lista');
      if (patch.ticker.length > MAX_TICKER) throw new Error(`ticker admite máximo ${MAX_TICKER} resultados`);
      out.ticker = patch.ticker.map((r, i) => ({
        away: this.#team(r.away, `ticker[${i}].away`),
        awayScore: score(r.awayScore ?? 0, `ticker[${i}].awayScore`),
        home: this.#team(r.home, `ticker[${i}].home`),
        homeScore: score(r.homeScore ?? 0, `ticker[${i}].homeScore`),
        status: text(r.status ?? 'FINAL', `ticker[${i}].status`) || 'FINAL',
      }));
    }
    return out;
  }

  get() {
    return this.state;
  }

  // Estado con los datos de cada equipo ya resueltos, listo para pintar.
  view() {
    const s = this.state;
    const t = (id) => this.byId.get(id);
    return {
      ...s,
      home: { ...s.home, ...t(s.home.team) },
      away: { ...s.away, ...t(s.away.team) },
      ticker: s.ticker.map((r) => ({ ...r, awayTeam: t(r.away), homeTeam: t(r.home) })),
    };
  }

  update(patch) {
    const clean = this.#validate(patch);
    this.state = { ...this.state, ...clean, updatedAt: new Date().toISOString() };
    this.#save();
    this.emit('change', this.view());
    return this.view();
  }

  addPoints(side, delta) {
    if (!['home', 'away'].includes(side)) throw new Error('side debe ser home o away');
    if (!Number.isInteger(delta)) throw new Error('delta debe ser entero');
    const next = Math.max(0, this.state[side].score + delta);
    return this.update({ [side]: { score: next } });
  }

  #save() {
    if (!this.file) return;
    mkdirSync(dirname(this.file), { recursive: true });
    writeFileSync(this.file, JSON.stringify(this.state, null, 2));
  }
}
