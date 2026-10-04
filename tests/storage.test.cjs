const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
function setup() {
  const data = new Map();
  const ctx = vm.createContext({
    localStorage: {
      getItem: (k) => data.get(k),
      setItem: (k, v) => data.set(k, v),
      removeItem: (k) => data.delete(k),
    },
    document: { getElementById: () => ({}) },
    Map,
    Set,
  });
  vm.runInContext(fs.readFileSync("js/presentation.js", "utf8"), ctx);
  vm.runInContext(
    fs.readFileSync("js/live.js", "utf8").replace(/paint\(\);\s*$/, ""),
    ctx,
  );
  vm.runInContext("paint=()=>{};ref=()=>{};start();", ctx);
  return (s) => vm.runInContext(s, ctx);
}
test("save restores maps, sets and a prepared trap", () => {
  const run = setup();
  run(
    'S.temples[0].traps.set("4,7",{id:"pit",sh:false});S.temples[0].wards.add("4,7");GameStore.save(S)',
  );
  assert.equal(run('GameStore.load().temples[0].traps.get("4,7").id'), "pit");
  assert.equal(run('GameStore.load().temples[0].wards.has("4,7")'), true);
});
test("an exploration save retains steps and actor", () => {
  const run = setup();
  run('br(1);S.run.left=4;S.scene="pause";GameStore.save(S)');
  assert.equal(run("GameStore.load().run.left"), 4);
  assert.equal(run("GameStore.load().actor"), 1);
});
test("invalid and unsupported saves fail safely", () => {
  const run = setup();
  run('localStorage.setItem(GameStore.key,"broken")');
  assert.equal(run("GameStore.load()"), null);
  run("S.round=99;GameStore.save(S)");
  assert.equal(run("GameStore.load()"), null);
});
test("blocked storage does not prevent gameplay", () => {
  const run = setup();
  run(
    'localStorage.setItem=()=>{throw Error("blocked")};localStorage.getItem=()=>{throw Error("blocked")};',
  );
  assert.equal(run("GameStore.save(S)"), false);
  assert.equal(run("GameStore.load()"), null);
});
test("completed game can be restored to its verdict", () => {
  const run = setup();
  run('S.scene="end";S.phase="run";S.round=6;S.run=null;GameStore.save(S)');
  assert.equal(run("GameStore.load().scene"), "end");
});
