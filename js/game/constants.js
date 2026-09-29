export const COLS = 9;
export const ROWS = 9;
export const TILE = Object.freeze({ WALL: 1, FLOOR: 0, START: 2, IDOL: 3 });
export const LAYOUT = Object.freeze([
  [1,1,1,1,3,1,1,1,1],
  [1,0,0,0,0,0,0,0,1],
  [1,0,1,0,0,0,1,0,1],
  [1,0,0,0,0,0,0,0,1],
  [1,0,0,1,0,1,0,0,1],
  [1,0,0,0,0,0,0,0,1],
  [1,0,1,0,0,0,1,0,1],
  [1,0,0,0,0,0,0,0,1],
  [1,1,1,1,2,1,1,1,1],
]);
export const START = Object.freeze({ c: 4, r: 8 });
export const IDOL = Object.freeze({ c: 4, r: 0 });
export const MAX_ROUNDS = 6;
export const STARTING_LIVES = 3;
export const STARTING_MOVES = 6;
export const PLAYER = Object.freeze({ A: 0, B: 1 });
export const PLAYER_META = Object.freeze([
  { id: 0, name: "Poente", priestTitle: "Sacerdote do Poente", runnerTitle: "Explorador do Poente", accent: "#c9a227" },
  { id: 1, name: "Nascente", priestTitle: "Sacerdotisa da Nascente", runnerTitle: "Exploradora da Nascente", accent: "#5ec2a2" },
]);
export function placementBudget(round) { return 2 + Math.floor((round - 1) / 2); }
export function moveBudget(round) { return STARTING_MOVES + Math.floor((round - 1) / 2); }
export function keyOf(c, r) { return `${c},${r}`; }
export function inBounds(c, r) { return c >= 0 && r >= 0 && c < COLS && r < ROWS; }
export function isWalkableCell(c, r) {
  if (!inBounds(c, r)) return false;
  return LAYOUT[r][c] !== TILE.WALL;
}
export const ORTHO = Object.freeze([[0,-1],[1,0],[0,1],[-1,0]]);
