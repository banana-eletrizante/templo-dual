const L = [
  [1, 1, 1, 1, 3, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 2, 1, 1, 1, 1],
];
const E = { c: 4, r: 8 },
  R = { c: 4, r: 0 };
const OMENS = [
  { id: "calm", n: "Céu parado", t: "Nenhum presságio nesta era." },
  { id: "wind", n: "Sopro", t: "As expedições ganham +1 passo." },
  { id: "offering", n: "Oferenda", t: "A armação ganha +1 ponto." },
  { id: "blood", n: "Sangue", t: "A primeira armadilha da era fere +1." },
  {
    id: "quake",
    n: "Tremor",
    t: "Uma laje aleatória desaba no início de cada expedição.",
  },
  { id: "judgment", n: "Juízo", t: "Tomar o ídolo cura 1 vida." },
];
const M = [
  { n: "Poente", p: "Sacerdote do Poente", x: "Explorador do Poente" },
  { n: "Nascente", p: "Sacerdotisa da Nascente", x: "Exploradora da Nascente" },
];
const T = {
  spikes: ["Espinhos", "+", 1, 1],
  darts: ["Dardos", ">", 1, 1],
  snakes: ["Serpentes", "~", 1, 1],
  axe: ["Machado", "x", 1, 1],
  pit: ["Fosso", "o", 1, 1],
  sand: ["Areia", ".", 1, 0],
  collapse: ["Laje", "#", 2, 1],
  boulder: ["Pedra", "O", 2, 2],
  ward: ["Oferenda", "*", 1, 0],
};
const O = Object.keys(T);
const k = (c, r) => c + "," + r;
const walk = (c, r) => c >= 0 && r >= 0 && c < 9 && r < 9 && L[r][c] !== 1;
const omen = (r) => OMENS[Math.min(6, Math.max(1, r)) - 1];
const bud = (r) =>
  2 + Math.floor((r - 1) / 2) + (omen(r).id === "offering" ? 1 : 0);
const mv = (r) => 6 + Math.floor((r - 1) / 2) + (omen(r).id === "wind" ? 1 : 0);
function P(id) {
  return {
    id,
    lives: 3,
    relics: 0,
    wounds: 0,
    camp: { ...E },
    torch: 1,
    rite: false,
  };
}
function TM() {
  return { traps: new Map(), blocked: new Set(), wards: new Set() };
}
let S = {
  scene: "title",
  round: 1,
  phase: "place",
  actor: 0,
  sel: "spikes",
  pts: 2,
  stun: false,
  run: null,
  players: [P(0), P(1)],
  temples: [TM(), TM()],
  kind: "place",
  blood: false,
};
const app = document.getElementById("app");
const $ = (s) => document.querySelector(s);
function dust() {
  if (document.querySelector(".dust")) return;
  const d = document.createElement("div");
  d.className = "dust";
  d.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 16; i++) {
    const s = document.createElement("i");
    s.style.left = Math.random() * 100 + "%";
    s.style.animationDuration = 12 + Math.random() * 18 + "s";
    s.style.animationDelay = -Math.random() * 18 + "s";
    d.appendChild(s);
  }
  document.body.appendChild(d);
}
function flash(kind) {
  const v = document.createElement("div");
  v.className = "fx " + kind;
  document.body.appendChild(v);
  setTimeout(() => v.remove(), 480);
}
function go(sc) {
  S.scene = sc;
  paint();
}
function paint() {
  dust();
  requestAnimationFrame(() => {
    app.focus({ preventScroll: true });
  });
  if (S.scene === "title") {
    app.innerHTML =
      '<section class="scene"><p class="eyebrow">DUAS ERAS · UM ÍDOLO</p><h1>Templo Dual</h1><p class="lede">O mesmo santuário asteca, fendido no tempo. Numa era você arma as armadilhas. Na outra, tenta roubar a relíquia.</p><div class="actions"><button class="btn gold" id="a">Mesmo aparelho</button><button class="btn ghost" id="b">Como se joga</button></div><p class="lede" style="margin-top:22px">2 jogadores locais · 6 eras · estratégia e memória</p></section>';
    $("#a").onclick = start;
    $("#b").onclick = () => go("rules");
    return;
  }
  if (S.scene === "rules") {
    app.innerHTML =
      '<section class="scene"><p class="eyebrow">CÓDICE</p><h1>Duas linhas do tempo</h1><p class="lede">Cada jogador começa com 3 vidas. Após 6 eras, vence quem tiver mais vidas; relíquias desempatam.</p><ol class="rules-list"><li><strong>Prepare em segredo.</strong> Poente arma seu templo, depois Nascente. Escolha uma armadilha e toque no piso. Pontos restantes são descartados.</li><li><strong>Passe o aparelho.</strong> O rival deve olhar somente depois de receber o aparelho.</li><li><strong>Explore o templo rival.</strong> Mova uma casa por vez, na horizontal ou vertical. Armadilhas ficam ocultas até serem ativadas, uma única vez.</li><li><strong>Planeje a próxima era.</strong> Você acampa onde terminar. Tomar o ídolo soma uma relíquia e retorna à entrada na próxima expedição.</li><li><strong>Use seus recursos.</strong> Uma tocha por partida dá 2 passos. A oferenda protege uma casa. Sem vidas, sacrifique uma relíquia no rito, uma vez por partida, para voltar com 1 vida.</li><li><strong>Observe o presságio.</strong> Cada era muda uma regra. No fosso, erguer-se custa um passo; ruínas preservam uma rota até o ídolo.</li></ol><p class="lede">No teclado, use Tab para escolher uma casa e Enter para agir.</p><div class="actions"><button class="btn gold" id="a">Começar</button><button class="btn" id="b">Voltar</button></div></section>';
    $("#a").onclick = start;
    $("#b").onclick = () => go("title");
    return;
  }
  if (S.scene === "pass") {
    const m = M[S.actor],
      pl = S.kind === "place",
      o = omen(S.round);
    app.innerHTML =
      '<section class="scene"><p class="eyebrow">ERA ' +
      S.round +
      " / 6 · " +
      o.n.toUpperCase() +
      "</p><h1>" +
      (pl ? m.p : m.x) +
      '</h1><p class="lede">Passe o aparelho para <strong>' +
      m.n +
      "</strong>. " +
      o.t +
      '</p><button class="btn gold" id="a">Estou pronto</button></section>';
    $("#a").onclick = () => go("play");
    return;
  }
  if (S.scene === "end") {
    const w = dec();
    app.innerHTML =
      '<section class="scene"><p class="eyebrow">VEREDITO</p><h1>' +
      (w == null ? "Empate ancestral" : M[w].n + " prevalece") +
      '</h1><div class="score-grid"><div class="score-card"><h2>' +
      M[0].n +
      "</h2><p>Vidas " +
      S.players[0].lives +
      " · Relíquias " +
      S.players[0].relics +
      '</p></div><div class="score-card"><h2>' +
      M[1].n +
      "</h2><p>Vidas " +
      S.players[1].lives +
      " · Relíquias " +
      S.players[1].relics +
      '</p></div></div><button class="btn gold" id="a">Nova expedição</button></section>';
    $("#a").onclick = start;
    return;
  }
  view();
}
function dec() {
  const [a, b] = S.players;
  if (a.lives !== b.lives) return a.lives > b.lives ? 0 : 1;
  if (a.relics !== b.relics) return a.relics > b.relics ? 0 : 1;
  return null;
}
function start() {
  S = {
    scene: "pass",
    round: 1,
    phase: "place",
    actor: 0,
    sel: "spikes",
    pts: bud(1),
    stun: false,
    run: null,
    players: [P(0), P(1)],
    temples: [TM(), TM()],
    kind: "place",
    blood: omen(1).id === "blood",
  };
  paint();
}
function view() {
  const o = omen(S.round);
  app.innerHTML =
    '<section class="play-scene"><div class="topbar"><strong>Templo Dual</strong> · Era ' +
    S.round +
    "/6 · " +
    M[0].n +
    " " +
    S.players[0].lives +
    "v " +
    S.players[0].relics +
    "r · " +
    M[1].n +
    " " +
    S.players[1].lives +
    "v " +
    S.players[1].relics +
    'r</div><div class="omen"><b>' +
    o.n +
    "</b> " +
    o.t +
    '</div><div class="phase-banner" id="st" role="status" aria-live="polite"></div><p class="board-help">Prepare seu templo; explore o templo rival. Toque nas casas destacadas para agir.</p><div class="boards">' +
    fr(0) +
    fr(1) +
    '</div><div class="dock"><div class="tray" id="tr"></div><div class="actions"><button class="btn ghost" id="sk">Descartar pontos</button><button class="btn ghost" id="to">Soprar tocha +2</button><button class="btn ghost" id="ri">Rito de sangue</button><button class="btn gold" id="cf">Confirmar</button></div></div></section>';
  bd(0);
  bd(1);
  ref();
  $("#sk").onclick = () => {
    if (S.phase === "place") {
      S.pts = 0;
      ok();
    }
  };
  $("#to").onclick = () => {
    if (S.phase === "run" && S.run) {
      const p = S.players[S.run.w];
      if (p.torch > 0 && !S.run.dead && !S.run.got && !S.stun) {
        p.torch--;
        S.run.left += 2;
        ref();
      }
    }
  };
  $("#ri").onclick = () => {
    if (S.phase === "run" && S.run && S.run.dead) {
      const p = S.players[S.run.w];
      if (!p.rite && p.relics > 0) {
        p.relics--;
        p.rite = true;
        p.lives = 1;
        S.run.dead = false;
        S.stun = false;
        S.run.c = E.c;
        S.run.r = E.r;
        S.run.left = 2;
        p.camp = { ...E };
        flash("gold");
        ref();
      }
    }
  };
  $("#cf").onclick = ok;
}
function fr(i) {
  return (
    '<section class="board-frame ' + ((S.phase === "place" ? S.actor : 1 - S.run.w) === i ? 'is-active' : '') + '"><header><span>Templo ' +
    (i ? "da Nascente" : "do Poente") +
    "</span><span>" +
    (S.phase === "run" && S.run && 1 - S.run.w === i ? "Presente" : "Passado") +
    '</span></header><div class="board" id="b' +
    i +
    '"></div></section>'
  );
}
function bd(i) {
  const r = document.getElementById("b" + i);
  r.innerHTML = "";
  for (let y = 0; y < 9; y++)
    for (let x = 0; x < 9; x++) {
      const b = document.createElement("button");
      b.className = "cell";
      b.dataset.c = x;
      b.dataset.r = y;
      b.onclick = () => cl(i, x, y);
      r.appendChild(b);
    }
}
function cl(o, c, r) {
  if (S.phase === "place") {
    if (o !== S.actor) return;
    pl(c, r);
    return;
  }
  if (S.phase === "run" && S.run && o === 1 - S.run.w) mo(c, r);
}
function pl(c, r) {
  if (!walk(c, r) || L[r][c] === 2 || L[r][c] === 3) return;
  const tm = S.temples[S.actor],
    key = k(c, r),
    d = T[S.sel];
  if (d[2] > S.pts) return;
  if (S.sel === "ward") {
    if (tm.wards.has(key)) return;
    tm.wards.add(key);
    S.pts -= d[2];
    ref();
    return;
  }
  if (tm.traps.has(key) || tm.blocked.has(key)) return;
  tm.traps.set(key, { id: S.sel, sh: false });
  S.pts -= d[2];
  ref();
}
// Preserve a route from both the entrance and the current explorer to the idol.
function canBlock(tm, c, r, origin = E) {
  const blocked = new Set([...tm.blocked, k(c, r)]);
  return [E, origin].every((start) => {
    const queue = [start],
      seen = new Set();
    while (queue.length) {
      const p = queue.shift(),
        key = k(p.c, p.r);
      if (seen.has(key) || blocked.has(key) || !walk(p.c, p.r)) continue;
      if (p.c === R.c && p.r === R.r) return true;
      seen.add(key);
      for (const [dc, dr] of [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ])
        queue.push({ c: p.c + dc, r: p.r + dr });
    }
    return false;
  });
}
function br(w) {
  S.phase = "run";
  S.actor = w;
  S.stun = false;
  const p = S.players[w],
    tm = S.temples[1 - w];
  const camp =
    p.camp && walk(p.camp.c, p.camp.r) && !tm.blocked.has(k(p.camp.c, p.camp.r))
      ? p.camp
      : E;
  S.run = {
    w: w,
    c: camp.c,
    r: camp.r,
    left: mv(S.round),
    dead: p.lives <= 0,
    got: false,
  };
  if (omen(S.round).id === "quake") {
    const spots = [];
    for (let y = 0; y < 9; y++)
      for (let x = 0; x < 9; x++) {
        if (
          L[y][x] === 0 &&
          !(x === camp.c && y === camp.r) &&
          canBlock(tm, x, y, camp)
        )
          spots.push(k(x, y));
      }
    if (spots.length)
      tm.blocked.add(spots[Math.floor(Math.random() * spots.length)]);
  }
}
function mo(c, r) {
  const u = S.run;
  if (!u || u.dead || u.got || u.left <= 0 || S.stun) return;
  if (Math.abs(c - u.c) + Math.abs(r - u.r) !== 1) return;
  const tm = S.temples[1 - u.w];
  if (!walk(c, r) || tm.blocked.has(k(c, r))) return;
  u.c = c;
  u.r = r;
  u.left--;
  const key = k(c, r),
    tr = tm.traps.get(key);
  if (tr && !tr.sh) {
    tr.sh = true;
    if (tm.wards.has(key)) {
      tm.wards.delete(key);
      flash("gold");
    } else {
      const d = T[tr.id];
      let dmg = d[3];
      if (dmg && S.blood) {
        dmg += 1;
        S.blood = false;
      }
      const p = S.players[u.w];
      if (dmg) {
        p.wounds += dmg;
        p.lives = Math.max(0, p.lives - dmg);
        if (!p.lives) {
          u.dead = true;
          u.left = 0;
        }
      }
      if (tr.id === "pit") S.stun = true;
      if (tr.id === "sand") u.left = 0;
      if (tr.id === "collapse") {
        if (canBlock(tm, c, r, E)) tm.blocked.add(key);
        tm.traps.delete(key);
      }
      document.body.classList.add("is-shaking");
      flash("hit");
      setTimeout(() => document.body.classList.remove("is-shaking"), 420);
    }
  }
  if (!u.dead && c === R.c && r === R.r) {
    u.got = true;
    u.left = 0;
    S.players[u.w].relics++;
    if (omen(S.round).id === "judgment")
      S.players[u.w].lives = Math.min(3, S.players[u.w].lives + 1);
    flash("gold");
  }
  ref();
}
function done() {
  const u = S.run;
  return u && (u.dead || u.got || (u.left <= 0 && !S.stun));
}
function ok() {
  if (S.phase === "place") {
    if (S.actor === 0) {
      S.actor = 1;
      S.pts = bud(S.round);
      S.sel = "spikes";
      S.kind = "place";
      go("pass");
    } else {
      br(0);
      S.kind = "run";
      go("pass");
    }
    return;
  }
  if (!done() && !S.stun) return;
  if (S.stun && !S.run.dead) {
    S.stun = false;
    S.run.left = Math.max(0, S.run.left - 1);
    ref();
    return;
  }
  const u = S.run,
    p = S.players[u.w];
  p.camp = u.dead || u.got ? { ...E } : { c: u.c, r: u.r };
  if (u.w === 0) {
    br(1);
    S.kind = "run";
    go("pass");
    return;
  }
  S.run = null;
  if (S.round >= 6) {
    go("end");
    return;
  }
  S.round++;
  S.phase = "place";
  S.actor = 0;
  S.pts = bud(S.round);
  S.sel = "spikes";
  S.kind = "place";
  S.blood = omen(S.round).id === "blood";
  go("pass");
}
function ref() {
  const st = $("#st"),
    tr = $("#tr"),
    cf = $("#cf"),
    sk = $("#sk"),
    to = $("#to"),
    ri = $("#ri");
  if (S.phase === "place") {
    st.innerHTML = "<strong>" + M[S.actor].p + "</strong> — pontos " + S.pts;
    tr.innerHTML = O.map((id) => {
      const d = T[id];
      return (
        '<button class="trap-btn ' +
        (S.sel === id ? "is-on" : "") +
        '" aria-pressed="' +
        (S.sel === id) +
        '" title="' +
        (id === "ward"
          ? "Anula uma armadilha nesta casa"
          : id === "pit"
            ? "1 dano e perde um passo"
            : id === "sand"
              ? "Encerra os passos"
              : id === "collapse"
                ? "1 dano; desaba se houver outro caminho"
                : d[3] + " de dano") +
        '" data-id="' +
        id +
        '" ' +
        (d[2] > S.pts ? "disabled" : "") +
        ">" +
        d[1] +
        " " +
        d[0] +
        " " +
        d[2] +
        "</button>"
      );
    }).join("");
    tr.querySelectorAll("[data-id]").forEach(
      (b) =>
        (b.onclick = () => {
          S.sel = b.dataset.id;
          ref();
        }),
    );
    sk.hidden = S.pts <= 0;
    to.hidden = true;
    ri.hidden = true;
    cf.disabled = false;
    cf.textContent = S.pts > 0 ? "Encerrar preparação" : "Passar o templo";
  } else {
    const u = S.run,
      m = M[u.w],
      p = S.players[u.w];
    st.innerHTML = u.got
      ? m.x + " segura o ídolo."
      : u.dead
        ? m.x + " caiu."
        : m.x + " — passos " + u.left + (S.stun ? " (fosso)" : "");
    tr.innerHTML = "";
    sk.hidden = true;
    to.hidden = p.torch <= 0 || u.dead || u.got || S.stun;
    ri.hidden = !(u.dead && !p.rite && p.relics > 0);
    cf.disabled = !done() && !S.stun;
    cf.textContent = u.got
      ? "Sair com o ídolo"
      : u.dead
        ? "Aceitar a queda"
        : S.stun
          ? "Erguer-se"
          : "Recuar";
  }
  pb();
}
function pb() {
  for (let i = 0; i < 2; i++) {
    const root = document.getElementById("b" + i),
      tm = S.temples[i];
    const priest = S.phase === "place" && S.actor === i,
      runner = S.phase === "run" && S.run && 1 - S.run.w === i;
    [...root.children].forEach((el) => {
      const c = +el.dataset.c,
        r = +el.dataset.r,
        tile = L[r][c],
        tr = tm.traps.get(k(c, r)),
        bl = tm.blocked.has(k(c, r)),
        wd = tm.wards.has(k(c, r)),
        sh = tr && (priest || tr.sh);
      el.className = "cell";
      el.disabled = tile === 1;
      el.classList.toggle("is-wall", tile === 1);
      el.classList.toggle("is-start", tile === 2);
      el.classList.toggle("is-idol", tile === 3);
      el.classList.toggle("is-trap", !!sh);
      el.classList.toggle("is-ward", wd && priest);
      el.classList.toggle(
        "is-placeable",
        priest && tile === 0 && !bl && (S.sel === "ward" ? !wd : !tr),
      );
      if (runner && S.run) {
        const legal =
          Math.abs(c - S.run.c) + Math.abs(r - S.run.r) === 1 &&
          walk(c, r) &&
          !bl;
        el.classList.toggle(
          "is-legal",
          legal && !S.run.dead && !S.run.got && S.run.left > 0 && !S.stun,
        );
      }
      el.setAttribute(
        "aria-label",
        "Coluna " +
          (c + 1) +
          ", linha " +
          (r + 1) +
          ": " +
          (tile === 1
            ? "parede"
            : tile === 2
              ? "entrada"
              : tile === 3
                ? "ídolo"
                : bl
                  ? "ruína"
                  : sh
                    ? T[tr.id][0]
                    : "piso") +
          (runner && S.run.c === c && S.run.r === r ? ", explorador" : ""),
      );
      el.disabled =
        tile === 1 ||
        (!priest && !runner) ||
        bl ||
        (priest &&
          (tile !== 0 ||
            T[S.sel][2] > S.pts ||
            (S.sel === "ward" ? wd : !!tr))) ||
        (runner && !el.classList.contains("is-legal"));
      el.textContent =
        tile === 3 ? "*" : tile === 2 ? "+" : bl ? "x" : sh ? T[tr.id][1] : "";
      if (runner && S.run && S.run.c === c && S.run.r === r) {
        const s = document.createElement("span");
        s.className = "pawn" + (S.run.w ? " b" : "");
        el.appendChild(s);
      }
    });
  }
}
paint();
