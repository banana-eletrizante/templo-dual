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
function header() {
  return (
    '<header class="site-header"><a class="brand" href="./">' +
    icon("idol") +
    ' TEMPLO <span>DUAL</span></a><span class="edition">A DISPUTA DAS ERAS</span><button class="text-button" id="sound" aria-pressed="' +
    Sound.enabled +
    '">Som: ' +
    (Sound.enabled ? "ligado" : "desligado") +
    "</button></header>"
  );
}
function bindSound() {
  const button = $("#sound");
  if (button)
    button.onclick = () => {
      Sound.toggle();
      button.textContent = "Som: " + (Sound.enabled ? "ligado" : "desligado");
      button.setAttribute("aria-pressed", Sound.enabled);
    };
}
function note(text, kind = "step") {
  S.notice = text;
  if (typeof Sound !== "undefined") Sound.play(kind);
}
function saved() {
  if (typeof GameStore !== "undefined") return GameStore.save(S);
}
function paint() {
  dust();
  document.body.dataset.scene = S.scene;
  document.body.dataset.player = S.actor;
  requestAnimationFrame(() => app.focus({ preventScroll: true }));
  if (S.scene === "title") {
    const hasSave = !!GameStore.load();
    app.innerHTML =
      header() +
      '<section class="hero"><img class="hero-art" src="./assets/guardians.webp" alt="Os guardiões do Sol e da Lua diante do templo ancestral" fetchpriority="high"><div class="hero-shade"></div><div class="hero-copy"><p class="eyebrow">ESTRATÉGIA · MEMÓRIA · RIVALIDADE</p><h1>Dois destinos.<br>Um <em>templo.</em></h1><p class="hero-lede">Arme o passado. Desafie o futuro.<br>O ídolo espera por quem sobreviver às seis eras.</p><div class="actions"><button class="btn gold" id="a">' +
      icon("idol") +
      " Nova partida <span>↗</span></button>" +
      (hasSave
        ? '<button class="btn" id="continue">Continuar partida</button>'
        : "") +
      '<button class="btn ghost" id="b">Como jogar</button></div><div class="hero-meta"><span>02 <small>JOGADORES</small></span><span>06 <small>ERAS</small></span><span>01 <small>APARELHO</small></span></div></div><span class="art-caption">POENTE & NASCENTE · GUARDIÕES DO TEMPO</span></section><section class="intro"><div><p class="eyebrow">O MESMO TEMPLO. OUTRA ERA.</p><h2>Seu rival conhece o caminho.<br>Você conhece as armadilhas.</h2></div><p>Um duelo local para compartilhar o aparelho. Construa sua defesa em segredo, passe o controle e explore o santuário do outro guardião.</p></section><section class="guardian-grid"><article class="guardian-card sun-card">' +
      portrait(0) +
      '<div><p class="eyebrow">GUARDIÃO DO SOL</p><h3>Poente</h3><p>Obsidiana, ouro e coragem.<br>Prepare o templo sob a última luz.</p></div>' +
      icon("sun") +
      '</article><article class="guardian-card moon-card">' +
      portrait(1) +
      '<div><p class="eyebrow">GUARDIÃ DA LUA</p><h3>Nascente</h3><p>Jade, silêncio e astúcia.<br>Desvende o que a noite esconde.</p></div>' +
      icon("moon") +
      '</article></section><footer class="site-footer"><span>TEMPLO DUAL</span><span>Sem contas. Sem anúncios. Apenas o duelo.</span></footer>';
    $("#a").onclick = () => {
      if (hasSave) {
        S.scene = "new";
        paint();
      } else start();
    };
    $("#b").onclick = () => go("rules");
    if (hasSave)
      $("#continue").onclick = () => {
        const data = GameStore.load();
        if (data) {
          S = data;
          S.scene = S.scene === "end" ? "end" : "pass";
          paint();
        }
      };
    bindSound();
    return;
  }
  if (S.scene === "new") {
    app.innerHTML =
      header() +
      '<section class="scene dialog-scene"><p class="eyebrow">UM NOVO CICLO</p><h1>Recomeçar o duelo?</h1><p class="lede">A partida salva será substituída. Os dois guardiões voltam com 3 vidas.</p><div class="actions"><button class="btn gold" id="a">Começar nova partida</button><button class="btn" id="b">Manter partida salva</button></div></section>';
    $("#a").onclick = start;
    $("#b").onclick = () => go("title");
    bindSound();
    return;
  }
  if (S.scene === "rules") {
    app.innerHTML =
      header() +
      '<section class="scene rules-scene"><p class="eyebrow">CÓDICE DO TEMPLO</p><h1>Prepare. Passe.<br><em>Sobreviva.</em></h1><p class="lede">Dois jogadores, 3 vidas cada. Ao final de 6 eras, vence quem tiver mais vidas. Relíquias desempatam.</p><div class="rules-grid"><article><b>01 · PREPARE</b><h3>Arme seu templo</h3><p>Escolha uma armadilha e uma casa. Cada uma custa 1 ou 2 pontos. O rival não deve olhar. Pontos restantes são descartados.</p></article><article><b>02 · PASSE</b><h3>Guarde seu segredo</h3><p>Entregue o aparelho na tela de passagem. Poente e Nascente preparam seus próprios templos antes de explorar o templo rival.</p></article><article><b>03 · EXPLORE</b><h3>Encontre o ídolo</h3><p>Mova uma casa por vez, sem diagonais. Armadilhas disparam uma única vez. Chegar ao ídolo soma uma relíquia e encerra a expedição.</p></article><article><b>04 · SOBREVIVA</b><h3>Planeje outra era</h3><p>Você acampa na última casa. Cada era tem um presságio. Vidas valem mais que relíquias: escolha o caminho com cuidado.</p></article></div><div class="resource-rules"><h3>Seus recursos</h3><p><strong>Tocha:</strong> +2 passos, uma vez por jogador na partida. <strong>Oferenda:</strong> anula uma armadilha na casa protegida. <strong>Rito:</strong> ao cair, troque uma relíquia por 1 vida e 2 passos, uma vez por partida.</p><p>No fosso, erguer-se custa um passo. Desabamentos preservam uma rota até o ídolo. Use as setas ou WASD para explorar; Tab e Enter também funcionam.</p></div><button class="btn gold" id="b">Voltar</button></section>';
    $("#b").onclick = () => go("title");
    bindSound();
    return;
  }
  if (S.scene === "pause") {
    saved();
    app.innerHTML =
      header() +
      '<section class="scene dialog-scene"><p class="eyebrow">O TEMPO PODE ESPERAR</p><h1>Duelo pausado</h1><p class="lede">Era ' +
      S.round +
      " de 6 · " +
      M[S.actor].n +
      '. Continue quando os dois estiverem prontos.</p><div class="actions"><button class="btn gold" id="a">Continuar duelo</button><button class="btn" id="b">Menu principal</button></div><p class="save-status">' +
      (GameStore.load()
        ? "Progresso salvo neste aparelho."
        : "Salvamento local indisponível neste navegador.") +
      "</p></section>";
    $("#a").onclick = () => go("pass");
    $("#b").onclick = () => go("title");
    bindSound();
    return;
  }
  if (S.scene === "pass") {
    saved();
    const m = M[S.actor],
      pl = S.kind === "place",
      o = omen(S.round);
    app.innerHTML =
      header() +
      '<section class="handoff"><div class="handoff-art character-' +
      S.actor +
      '" role="img" aria-label="Guardião ' +
      m.n +
      '"></div><div class="handoff-copy"><p class="eyebrow">ERA ' +
      String(S.round).padStart(2, "0") +
      " / 06 · " +
      (pl ? "PREPARAÇÃO" : "EXPLORAÇÃO") +
      "</p><h1>É sua vez,<br><em>" +
      m.n +
      '.</em></h1><p class="lede">' +
      (pl
        ? "Prepare as armadilhas do seu templo em segredo."
        : "Explore o templo rival. O caminho esconde surpresas.") +
      '</p><div class="omen">' +
      icon(o.id === "wind" ? "step" : o.id === "judgment" ? "heart" : "idol") +
      "<div><b>" +
      o.n +
      "</b><p>" +
      o.t +
      '</p></div></div><button class="btn gold" id="a">' +
      (pl ? "Preparar meu templo" : "Entrar no templo") +
      ' ↗</button><p class="privacy-note">Passe o aparelho para ' +
      m.n +
      " antes de continuar.</p></div></section>";
    $("#a").onclick = () => {
      S.notice = pl
        ? "Escolha uma armadilha e toque em uma casa livre."
        : "Siga as casas iluminadas até o ídolo.";
      go("play");
    };
    bindSound();
    return;
  }
  if (S.scene === "end") {
    saved();
    const w = dec();
    app.innerHTML =
      header() +
      '<section class="scene verdict"><p class="eyebrow">O TEMPLO ESCOLHEU</p>' +
      (w === null ? icon("idol") : portrait(w, "winner")) +
      "<h1>" +
      (w === null ? "Equilíbrio ancestral" : M[w].n + " prevalece") +
      '</h1><p class="lede">Seis eras. Dois destinos. ' +
      (w === null
        ? "Uma história compartilhada."
        : "Uma vitória conquistada.") +
      '</p><div class="score-grid">' +
      S.players
        .map(
          (p, i) =>
            '<article class="score-card">' +
            portrait(i) +
            "<h3>" +
            M[i].n +
            "</h3><p>" +
            p.lives +
            " vidas · " +
            p.relics +
            " relíquias</p></article>",
        )
        .join("") +
      '</div><div class="actions"><button class="btn gold" id="a">Jogar novamente</button><button class="btn" id="b">Menu principal</button></div></section>';
    $("#a").onclick = start;
    $("#b").onclick = () => go("title");
    bindSound();
    return;
  }
  view();
  saved();
}

function dec() {
  const [a, b] = S.players;
  if (a.lives !== b.lives) return a.lives > b.lives ? 0 : 1;
  if (a.relics !== b.relics) return a.relics > b.relics ? 0 : 1;
  return null;
}
function start() {
  if (typeof GameStore !== "undefined") GameStore.clear();
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
function playerCard(i) {
  const p = S.players[i];
  return (
    '<article class="player-card ' +
    (S.actor === i ? "current" : "") +
    " player-" +
    i +
    '">' +
    portrait(i) +
    '<div><span class="player-label">' +
    (i ? "GUARDIÃ DA LUA" : "GUARDIÃO DO SOL") +
    "</span><h2>" +
    M[i].n +
    '</h2><div class="player-stats"><span aria-label="' +
    p.lives +
    ' vidas">' +
    icon("heart") +
    " " +
    p.lives +
    '/3</span><span aria-label="' +
    p.relics +
    ' relíquias">' +
    icon("idol") +
    " " +
    p.relics +
    '</span><span class="' +
    (p.torch ? "" : "spent") +
    '" title="Tochas restantes">' +
    icon("torch") +
    " " +
    p.torch +
    "</span></div></div></article>"
  );
}
function view() {
  const o = omen(S.round);
  document.body.dataset.scene = "play";
  app.innerHTML =
    header() +
    '<section class="play-scene"><div class="game-heading"><div><p class="eyebrow">' +
    (S.phase === "place" ? "PREPARE O PASSADO" : "DESAFIE O FUTURO") +
    '</p><h1>O duelo dos guardiões</h1></div><button class="btn compact" id="pause">Pausar</button></div><div class="scoreboard" id="scoreboard">' +
    playerCard(0) +
    '<div class="era-counter"><span>ERA</span><b>' +
    String(S.round).padStart(2, "0") +
    "</b><span>DE 06</span></div>" +
    playerCard(1) +
    '</div><div class="game-layout"><div class="temple-stage"><div class="boards">' +
    fr(0) +
    fr(1) +
    '</div><div class="board-legend"><span>' +
    icon("door") +
    " Entrada</span><span>" +
    icon("idol") +
    ' Ídolo</span><span><i></i> Caminho disponível</span></div></div><aside class="command-panel"><div class="phase-banner" id="st" role="status" aria-live="polite"></div><div class="omen">' +
    icon("idol") +
    "<div><b>" +
    o.n +
    "</b><p>" +
    o.t +
    '</p></div></div><div class="dock"><div class="tray" id="tr"></div><p class="trap-description" id="trap-description"></p><div class="actions"><button class="btn ghost" id="sk">Descartar pontos</button><button class="btn" id="to">' +
    icon("torch") +
    ' Acender tocha +2</button><button class="btn" id="ri">' +
    icon("heart") +
    ' Rito de sangue</button><button class="btn gold" id="cf">Confirmar</button></div></div><div class="event-log"><span class="eyebrow">ECOS DO TEMPLO</span><p id="notice" role="status" aria-live="polite"></p></div><details class="quick-help"><summary>Como funciona esta fase?</summary><p>' +
    (S.phase === "place"
      ? "Escolha um item. Toque no piso para posicioná-lo. As armadilhas ficam ocultas para seu rival até serem ativadas."
      : "Mova nas casas vizinhas iluminadas ou use as setas / WASD. Alcance o ídolo. Cada armadilha só dispara uma vez. Vidas decidem a vitória; relíquias desempatam.") +
    '</p></details><p class="save-status" id="save-status"></p></aside></div></section>';
  bd(0);
  bd(1);
  ref();
  bindSound();
  $("#pause").onclick = () => go("pause");
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
        note("Tocha acesa. Você ganhou 2 passos.", "gold");
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
        note("O rito devolveu 1 vida. Você tem 2 passos.", "gold");
        flash("gold");
        ref();
      }
    }
  };
  $("#cf").onclick = ok;
}

function fr(i) {
  return (
    '<section class="board-frame ' +
    ((S.phase === "place" ? S.actor : 1 - S.run.w) === i ? "is-active" : "") +
    '"><header><span>Templo ' +
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
    if (tm.wards.has(key) || tm.blocked.has(key)) return;
    tm.wards.add(key);
    S.pts -= d[2];
    note("Oferenda posicionada. Esta casa está protegida.", "gold");
    ref();
    return;
  }
  if (tm.traps.has(key) || tm.blocked.has(key)) return;
  tm.traps.set(key, { id: S.sel, sh: false });
  S.pts -= d[2];
  note(d[0] + " preparada. Seu rival não verá esta armadilha.");
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
  note("Passo seguro. " + u.left + " passos restantes.");
  const key = k(c, r),
    tr = tm.traps.get(key);
  if (tr && !tr.sh) {
    tr.sh = true;
    if (tm.wards.has(key)) {
      tm.wards.delete(key);
      note("A oferenda anulou a armadilha.", "gold");
      flash("gold");
    } else {
      const d = T[tr.id];
      let dmg = d[3];
      if (dmg && S.blood) {
        dmg += 1;
        S.blood = false;
      }
      const p = S.players[u.w];
      note(
        T[tr.id][0] +
          " ativada! " +
          (dmg ? dmg + " de dano." : "Seus passos foram consumidos."),
        "hit",
      );
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
    note("Você conquistou a relíquia!", "gold");
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
    note("Você saiu do fosso. Continue a exploração.");
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
    st.innerHTML =
      '<span class="eyebrow">' +
      M[S.actor].n +
      " · PREPARAÇÃO</span><h2>Arme seu templo</h2><p><strong>" +
      S.pts +
      "</strong> pontos disponíveis</p>";
    tr.innerHTML = O.map(
      (id) =>
        '<button class="trap-btn ' +
        (S.sel === id ? "is-on" : "") +
        '" data-id="' +
        id +
        '" aria-pressed="' +
        (S.sel === id) +
        '" ' +
        (T[id][2] > S.pts ? "disabled" : "") +
        ">" +
        icon(id) +
        "<span>" +
        T[id][0] +
        "</span><small>" +
        T[id][2] +
        " PT" +
        (T[id][2] > 1 ? "S" : "") +
        "</small></button>",
    ).join("");
    tr.querySelectorAll("[data-id]").forEach(
      (b) =>
        (b.onclick = () => {
          S.sel = b.dataset.id;
          ref();
          const next = tr.querySelector('[data-id="' + S.sel + '"]');
          if (next) next.focus({ preventScroll: true });
        }),
    );
    $("#trap-description").textContent = HINTS[S.sel];
    sk.hidden = true;
    to.hidden = true;
    ri.hidden = true;
    cf.disabled = false;
    cf.textContent =
      S.pts > 0
        ? "Concluir preparação · " + S.pts + " pts não usados"
        : "Passar o aparelho";
  } else {
    const u = S.run,
      p = S.players[u.w];
    st.innerHTML =
      '<span class="eyebrow">' +
      M[u.w].n +
      " · EXPLORAÇÃO</span><h2>" +
      (u.got
        ? "Relíquia conquistada"
        : u.dead
          ? "O guardião caiu"
          : S.stun
            ? "Preso no fosso"
            : "Encontre o ídolo") +
      "</h2><p><strong>" +
      u.left +
      "</strong> passos restantes</p>";
    tr.innerHTML = "";
    $("#trap-description").textContent = u.dead
      ? "Use o rito se tiver uma relíquia, ou encerre sua expedição."
      : u.got
        ? "A relíquia é sua. Você retorna à entrada na próxima era."
        : S.stun
          ? "Erguer-se custa 1 passo. Depois você pode continuar."
          : "Toque em uma casa iluminada. Cada movimento custa 1 passo.";
    sk.hidden = true;
    to.hidden = p.torch <= 0 || u.dead || u.got || S.stun;
    ri.hidden = !(u.dead && !p.rite && p.relics > 0);
    cf.disabled = !done() && !S.stun;
    cf.textContent = u.got
      ? "Guardar relíquia e sair"
      : u.dead
        ? "Encerrar expedição"
        : S.stun
          ? "Erguer-se · 1 passo"
          : "Acampar e passar";
  }
  $("#scoreboard").innerHTML =
    playerCard(0) +
    '<div class="era-counter"><span>ERA</span><b>' +
    String(S.round).padStart(2, "0") +
    "</b><span>DE 06</span></div>" +
    playerCard(1);
  $("#notice").textContent = S.notice || "O templo aguarda sua decisão.";
  pb();
  $("#save-status").textContent = saved()
    ? "Progresso salvo neste aparelho"
    : "Salvamento indisponível. Mantenha esta aba aberta.";
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
      el.classList.toggle("is-blocked", bl);
      el.classList.toggle("is-spent", !!(tr && tr.sh));
      el.innerHTML =
        tile === 3
          ? icon("idol")
          : tile === 2
            ? icon("door")
            : bl
              ? icon("collapse")
              : sh
                ? icon(tr.id)
                : "";
      if (runner && S.run && S.run.c === c && S.run.r === r) {
        const s = document.createElement("span");
        s.className = "pawn guardian-token token-" + S.run.w;
        s.setAttribute("aria-hidden", "true");
        el.appendChild(s);
      }
    });
  }
}
if (typeof window !== "undefined")
  window.addEventListener("keydown", (event) => {
    if (
      S.scene !== "play" ||
      S.phase !== "run" ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return;
    const moves = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      w: [0, -1],
      s: [0, 1],
      a: [-1, 0],
      d: [1, 0],
    };
    const delta = moves[event.key];
    if (delta) {
      event.preventDefault();
      mo(S.run.c + delta[0], S.run.r + delta[1]);
    }
  });
paint();
