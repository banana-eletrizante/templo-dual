/* Local-only save data and presentation utilities; no tracking or network APIs. */
const Icons = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
  moon: '<path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z"/>',
  idol: '<path d="m12 2 8 10-8 10L4 12Z M4 12h16M12 2v20"/>',
  heart: '<path d="M12 21 3 12C-3 5 7-1 12 6c5-7 15-1 9 6Z"/>',
  spikes: '<path d="M2 20 6 5l4 15m0 0 4-17 4 17m0 0 3-11 2 11Z"/>',
  darts: '<path d="M3 21 20 4m-7 0h7v7M3 14l7 7M6 11l7 7"/>',
  snakes: '<path d="M4 20c17 5 18-8 5-7S0 3 11 4h6m-3-3 5 3-5 3"/>',
  axe: '<path d="m6 22 9-19m-3 3c7-6 13 3 7 7l-7-7ZM12 6C4 1 0 9 5 13Z"/>',
  pit: '<ellipse cx="12" cy="14" rx="10" ry="6"/><path d="m5 4 3 5 4-6 4 6 3-5"/>',
  sand: '<path d="M5 2h14M5 22h14M7 2c0 7 10 13 10 20M17 2C17 9 7 15 7 22M9 18h6"/>',
  collapse: '<path d="M3 3h18v18H3Z M12 3l-3 7 7 3-5 8"/>',
  boulder: '<path d="m7 3 11 1 4 9-6 8H6l-4-9Z M7 3l3 7 8-6M10 10l6 11"/>',
  ward: '<path d="m12 2 8 4v7c0 5-8 9-8 9s-8-4-8-9V6Z m-4 10 3 3 5-6"/>',
  torch:
    '<path d="M12 2c1 6 7 5 6 11-1 6-11 6-12 0-1-4 3-6 6-11ZM9 18l1 5h4l1-5"/>',
  step: '<path d="m5 19 14-14M8 5h11v11"/>',
  door: '<path d="M4 22V2h16v20M9 22V7h6v15M12 14h1"/>',
};
function icon(name) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${Icons[name] || Icons.idol}</svg>`;
}
function portrait(i, extra = "") {
  return `<span class="portrait portrait-${i} ${extra}" aria-hidden="true"></span>`;
}
const HINTS = {
  spikes: "Causa 1 ferimento ao ser pisada.",
  darts: "Um disparo oculto causa 1 ferimento.",
  snakes: "Uma mordida causa 1 ferimento.",
  axe: "A lâmina causa 1 ferimento.",
  pit: "Causa 1 ferimento. Erguer-se custa mais 1 passo.",
  sand: "Encerra os passos da expedição.",
  collapse: "Causa 1 ferimento e desaba, preservando uma rota.",
  boulder: "Causa 2 ferimentos. Custa 2 pontos.",
  ward: "Protege a casa: anula sua primeira armadilha.",
};
const GameStore = {
  key: "templo-dual.save.v2",
  save(state) {
    try {
      if (state.scene === "title") return;
      localStorage.setItem(
        this.key,
        JSON.stringify({ v: 2, state }, (_, v) =>
          v instanceof Map
            ? { map: [...v] }
            : v instanceof Set
              ? { set: [...v] }
              : v,
        ),
      );
      return true;
    } catch {
      return false;
    }
  },
  load() {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw || raw.length > 50000) return null;
      const data = JSON.parse(raw, (_, v) =>
        v && Array.isArray(v.map)
          ? new Map(v.map)
          : v && Array.isArray(v.set)
            ? new Set(v.set)
            : v,
      );
      const s = data.state;
      const integer = (x, min, max) =>
        Number.isInteger(x) && x >= min && x <= max;
      const pos = (p) => p && integer(p.c, 0, 8) && integer(p.r, 0, 8);
      const key = (k) => typeof k === "string" && /^[0-8],[0-8]$/.test(k);
      if (
        data.v !== 2 ||
        !s ||
        !["pass", "play", "pause", "end"].includes(s.scene) ||
        !["place", "run"].includes(s.phase) ||
        !integer(s.round, 1, 6) ||
        !integer(s.actor, 0, 1) ||
        !integer(s.pts, 0, 5) ||
        !Object.hasOwn(HINTS, s.sel) ||
        typeof s.stun !== "boolean" ||
        typeof s.blood !== "boolean"
      )
        return null;
      if (
        !Array.isArray(s.players) ||
        s.players.length !== 2 ||
        s.players.some(
          (p) =>
            !integer(p.lives, 0, 3) ||
            !integer(p.relics, 0, 6) ||
            !integer(p.torch, 0, 1) ||
            typeof p.rite !== "boolean" ||
            !pos(p.camp),
        )
      )
        return null;
      if (
        !Array.isArray(s.temples) ||
        s.temples.length !== 2 ||
        s.temples.some(
          (t) =>
            !(t.traps instanceof Map) ||
            !(t.blocked instanceof Set) ||
            !(t.wards instanceof Set) ||
            t.traps.size > 81 ||
            [...t.traps].some(
              ([k, v]) =>
                !key(k) || !v || !Object.hasOwn(HINTS, v.id) || typeof v.sh !== "boolean",
            ) ||
            [...t.blocked, ...t.wards].some((k) => !key(k)),
        )
      )
        return null;
      if (
        s.phase === "run" &&
        s.scene !== "end" &&
        (!pos(s.run) ||
          !integer(s.run.w, 0, 1) ||
          !integer(s.run.left, 0, 12) ||
          typeof s.run.dead !== "boolean" ||
          typeof s.run.got !== "boolean")
      )
        return null;
      s.kind = s.phase;
      s.notice = "Partida retomada. O templo espera por você.";
      return s;
    } catch {
      return null;
    }
  },
  clear() {
    try {
      localStorage.removeItem(this.key);
    } catch {}
  },
};
const Sound = {
  enabled: false,
  ctx: null,
  toggle() {
    this.enabled = !this.enabled;
    this.play("gold");
    return this.enabled;
  },
  play(kind) {
    if (!this.enabled) return;
    try {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return;
      this.ctx ||= new C();
      this.ctx.resume().catch(() => {});
      const o = this.ctx.createOscillator(),
        g = this.ctx.createGain(),
        t = this.ctx.currentTime;
      o.type = kind === "hit" ? "triangle" : "sine";
      o.frequency.setValueAtTime(
        kind === "hit" ? 150 : kind === "step" ? 330 : 620,
        t,
      );
      o.frequency.exponentialRampToValueAtTime(
        kind === "hit" ? 55 : kind === "step" ? 250 : 930,
        t + 0.12,
      );
      g.gain.setValueAtTime(0.045, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.connect(g);
      g.connect(this.ctx.destination);
      o.start();
      o.stop(t + 0.21);
    } catch {}
  },
};
