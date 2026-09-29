export const TRAPS = Object.freeze({
  spikes: { id: "spikes", name: "Espinhos", glyph: "⚔", cost: 1, damage: 1, color: "#b85c38", hint: "Estacas de obsidiana. 1 ferimento." },
  darts: { id: "darts", name: "Dardos", glyph: "➶", cost: 1, damage: 1, color: "#5ec25a", hint: "Sopro envenenado. 1 ferimento." },
  snakes: { id: "snakes", name: "Serpentes", glyph: "~", cost: 1, damage: 1, color: "#2f6b3a", hint: "Ninho vivo. 1 ferimento." },
  axe: { id: "axe", name: "Machado", glyph: "⚒", cost: 1, damage: 1, color: "#8b1e1e", hint: "Pêndulo de bronze. 1 ferimento." },
  pit: { id: "pit", name: "Fosso", glyph: "◉", cost: 1, damage: 1, extra: "stun", color: "#3b2a22", hint: "1 ferimento e perde o próximo passo." },
  sand: { id: "sand", name: "Areia", glyph: "∴", cost: 1, damage: 0, extra: "drain", color: "#c4a574", hint: "Engole o restante dos passos." },
  collapse: { id: "collapse", name: "Laje", glyph: "▣", cost: 2, damage: 1, extra: "block", color: "#6b5e4e", hint: "1 ferimento e o ladrilho vira ruína." },
  boulder: { id: "boulder", name: "Pedra", glyph: "●", cost: 2, damage: 2, color: "#7a5a3a", hint: "Pedra ritual. 2 ferimentos." }
});
export const TRAP_ORDER = Object.freeze(["spikes","darts","snakes","axe","pit","sand","collapse","boulder"]);
export function getTrap(id) {
  const trap = TRAPS[id];
  if (!trap) throw new Error("Armadilha desconhecida: " + id);
  return trap;
}
