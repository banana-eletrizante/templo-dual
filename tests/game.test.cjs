const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
function game() {
  const ctx = vm.createContext({
    document: {
      getElementById: () => ({}),
      body: { classList: { add() {}, remove() {} } },
    },
    setTimeout() {},
    Map,
    Set,
    Math,
  });
  vm.runInContext(
    fs.readFileSync("js/live.js", "utf8").replace(/paint\(\);\s*$/, ""),
    ctx,
  );
  vm.runInContext("paint=()=>{};ref=()=>{};flash=()=>{};", ctx);
  return (code) => vm.runInContext(code, ctx);
}
test("fosso costs one step and allows the same explorer to continue", () => {
  const run = game();
  run("start();br(0);S.run.c=4;S.run.r=7;S.run.left=4;S.stun=true;ok()");
  assert.equal(run("S.run.w"), 0);
  assert.equal(run("S.run.left"), 3);
  assert.equal(run("S.stun"), false);
  run("mo(4,6)");
  assert.equal(run("S.run.r"), 6);
});
test("zero lives cannot move in a later expedition", () => {
  const run = game();
  run("start();S.players[0].lives=0;br(0);mo(4,7)");
  assert.equal(run("S.run.dead"), true);
  assert.equal(run("S.run.r"), 8);
});
test("quake preserves entrance and idol routes", () => {
  const run = game();
  assert.equal(run("canBlock(TM(),4,7)"), false);
  assert.equal(run("canBlock(TM(),4,1)"), false);
  assert.equal(run("canBlock(TM(),1,1)"), true);
  run("start();S.round=5;br(0)");
  assert.equal(run('S.temples[1].blocked.has("4,8")'), false);
});
test("traps trigger once and wards cancel damage", () => {
  const run = game();
  run(
    'start();S.temples[1].traps.set("4,7",{id:"spikes",sh:false});S.temples[1].wards.add("4,7");br(0);mo(4,7)',
  );
  assert.equal(run("S.players[0].lives"), 3);
  assert.equal(run("S.temples[1].wards.size"), 0);
  run("mo(4,8);mo(4,7)");
  assert.equal(run("S.players[0].lives"), 3);
});
test("collapse at entrance cannot permanently seal the temple", () => {
  const run = game();
  run(
    'start();S.temples[1].traps.set("4,7",{id:"collapse",sh:false});br(0);mo(4,7)',
  );
  assert.equal(run('S.temples[1].blocked.has("4,7")'), false);
  assert.equal(run("S.players[0].lives"), 2);
});
test("six full eras lead to verdict", () => {
  const run = game();
  run(
    "start();for(let i=0;i<6;i++){ok();ok();S.run.left=0;ok();S.run.left=0;ok()}",
  );
  assert.equal(run("S.scene"), "end");
  assert.equal(run("S.round"), 6);
  assert.equal(run("dec()"), null);
});
