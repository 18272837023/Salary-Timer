/**
 * 真实代码测试：验证 defaults.ts 的 overtime 默认值与 v2→v3 迁移
 */
const assert = require("node:assert");

// 伪造浏览器 localStorage，让 getStorage() 可用
const mem = new Map();
global.window = {
  localStorage: {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => mem.set(k, String(v)),
    removeItem: (k) => mem.delete(k),
  },
};

const D = require("../.tmptest/defaults.js");
const KEY = D.STORAGE_KEY;
const LEGACY = "salarytimer.site.v1";

function reset() {
  mem.clear();
}

let pass = 0;
let fail = 0;
function check(name, fn) {
  try {
    fn();
    console.log(`  PASS  ${name}`);
    pass++;
  } catch (e) {
    console.log(`  FAIL  ${name}\n        ${e.message}`);
    fail++;
  }
}

console.log("=== A. 默认设置 ===");
check("defaultSettings().overtime === false", () => {
  assert.strictEqual(D.defaultSettings().overtime, false);
});
check("defaultSettings().v === 3", () => {
  assert.strictEqual(D.defaultSettings().v, 3);
});

console.log("\n=== B. 首次访问（无存储） ===");
reset();
check("loadSettings() 返回 null", () => {
  assert.strictEqual(D.loadSettings(), null);
});

console.log("\n=== C. 老用户：v2 载荷带 overtime:true（本次 bug 的受害者） ===");
reset();
mem.set(KEY, JSON.stringify({
  mode: "annual", amountCents: 7800000, currency: "USD",
  start: "09:00", end: "17:30", days: [1, 2, 3, 4, 5],
  breaks: [{ id: "b1", start: "12:30", end: "13:00" }],
  payday: 15,
  overtime: true,   // 老默认值，用户从未主动选择
  otMult: 1.5,
  onboarded: true,
}));
const oldUser = D.loadSettings();
check("迁移后 overtime === false", () => {
  assert.strictEqual(oldUser.overtime, false);
});
check("迁移后写入 v === 3", () => {
  assert.strictEqual(oldUser.v, 3);
});
check("迁移结果已持久化（存储里 v 变成 3）", () => {
  const saved = JSON.parse(mem.get(KEY));
  assert.strictEqual(saved.v, 3);
  assert.strictEqual(saved.overtime, false);
});
check("其他设置未丢失（班次时间保留）", () => {
  assert.strictEqual(oldUser.start, "09:00");
  assert.strictEqual(oldUser.end, "17:30");
  assert.strictEqual(oldUser.amountCents, 7800000);
});

console.log("\n=== D. 迁移只跑一次：用户之后主动开启 overtime 应被保留 ===");
const enabled = { ...oldUser, overtime: true };
D.saveSettings(enabled);
const reloaded = D.loadSettings();
check("v3 载荷里用户主动开启的 overtime 保持 true", () => {
  assert.strictEqual(reloaded.overtime, true);
});

console.log("\n=== E. 全新用户主动开启 overtime ===");
reset();
D.saveSettings({ ...D.defaultSettings(), overtime: true, onboarded: true });
check("v3 载荷 overtime:true 保留", () => {
  assert.strictEqual(D.loadSettings().overtime, true);
});

console.log("\n=== F. v1 老格式迁移 ===");
reset();
mem.set(LEGACY, JSON.stringify({
  amount: 52000, start: "08:00", end: "16:00", days: [1, 2, 3, 4, 5],
  overtime: true,
}));
const v1 = D.loadSettings();
check("v1 迁移后 overtime === false", () => {
  assert.strictEqual(v1.overtime, false);
});
check("v1 金额从美元转成分（52000 → 5200000）", () => {
  assert.strictEqual(v1.amountCents, 5200000);
});

console.log("\n=== G. 损坏载荷不应崩溃 ===");
reset();
mem.set(KEY, "{not valid json");
check("损坏 JSON 返回 null 而不是抛错", () => {
  assert.strictEqual(D.loadSettings(), null);
});
reset();
mem.set(KEY, JSON.stringify("a string, not an object"));
check("非对象载荷返回 null", () => {
  assert.strictEqual(D.loadSettings(), null);
});

console.log(`\n结果: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
