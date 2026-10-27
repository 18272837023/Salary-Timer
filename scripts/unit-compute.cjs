/**
 * 真实代码测试：compute() 在"过了下班时间"时的行为
 */
const assert = require("node:assert");
const { compute, derive, isWorkday } = require("../.tmptest/schedule.js");
const { defaultSettings } = require("../.tmptest/defaults.js");

function S(partial = {}) {
  return { ...defaultSettings(), onboarded: true, ...partial };
}
// 2026-01-05 是周一
function at(h, m = 0, dow = 1) {
  return new Date(2026, 0, 5 + (dow - 1), h, m, 0, 0);
}
const LIVE = new Set(["working", "overtime"]);

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); pass++; }
  catch (e) { console.log(`  FAIL  ${name}\n        ${e.message}`); fail++; }
}

console.log("=== 1. 默认设置（overtime 关闭）：过了下班时间必须停止计薪 ===");
{
  const s = S();
  check("默认 overtime 为 false", () => assert.strictEqual(s.overtime, false));

  const during = compute(s, at(10, 0));
  check("10:00 工作中且在计薪", () => {
    assert.strictEqual(during.status, "working");
    assert.ok(LIVE.has(during.status));
    assert.ok(during.earnedCents > 0);
  });

  // 17:30 整点是班次的最后一瞬，仍算在岗；金额必须已封顶为日薪，且不产生加班。
  check("17:30 整点金额已封顶为日薪、无加班分钟", () => {
    const snap = compute(s, at(17, 30));
    const d = derive(s);
    assert.ok(["working", "done"].includes(snap.status), `实际 ${snap.status}`);
    assert.strictEqual(snap.earnedCents, Math.round(d.dailyCents));
    assert.strictEqual(snap.overtimeMin, 0);
    assert.strictEqual(snap.progress, 1);
  });

  for (const [h, m] of [[17, 31], [18, 0], [18, 30], [20, 0], [23, 59]]) {
    check(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} 状态为 done 且不计薪`, () => {
      const snap = compute(s, at(h, m));
      assert.strictEqual(snap.status, "done");
      assert.ok(!LIVE.has(snap.status), `不应为 live 状态，实际 ${snap.status}`);
      assert.strictEqual(snap.overtimeMin, 0, "不应产生加班分钟");
      // 金额必须锁定在整天工资，且不再增长
      const d = derive(s);
      assert.strictEqual(snap.earnedCents, Math.round(d.dailyCents), "应为整天工资且冻结");
    });
  }

  check("18:30 与 23:59 金额完全相同（不再增长）", () => {
    assert.strictEqual(compute(s, at(18, 30)).earnedCents, compute(s, at(23, 59)).earnedCents);
  });
}

console.log("\n=== 2. 用户主动开启 overtime：下班后仍计薪（这是 feature，必须保留） ===");
{
  const s = S({ overtime: true });
  const a = compute(s, at(18, 30));
  const b = compute(s, at(23, 0));
  check("18:30 状态为 overtime 且在计薪", () => {
    assert.strictEqual(a.status, "overtime");
    assert.ok(LIVE.has(a.status));
  });
  check("23:00 金额大于 18:30（加班继续累积）", () => {
    assert.ok(b.earnedCents > a.earnedCents);
  });
  check("加班按 1.5 倍计算", () => {
    const d = derive(s);
    const expected = Math.round(d.dailyCents + (330 / 60) * d.hourlyCents * 1.5);
    assert.strictEqual(compute(s, at(23, 0)).earnedCents, expected);
  });
}

console.log("\n=== 3. 跨午夜夜班 22:00-06:00 ===");
{
  const s = S({ start: "22:00", end: "06:00" });

  check("周一 23:00 工作中", () => assert.strictEqual(compute(s, at(23, 0, 1)).status, "working"));
  check("周二 02:00 仍在工作中（跨午夜）", () => assert.strictEqual(compute(s, at(2, 0, 2)).status, "working"));
  check("周二 05:59 仍在工作中", () => assert.strictEqual(compute(s, at(5, 59, 2)).status, "working"));

  // 修复点：刚下班不应显示 "before"
  for (const h of [6, 7, 8, 10]) {
    check(`周二 ${String(h).padStart(2, "0")}:30 显示 done 而不是 before`, () => {
      const snap = compute(s, at(h, 30, 2));
      assert.strictEqual(snap.status, "done", `实际 ${snap.status}`);
      assert.ok(!LIVE.has(snap.status), "下班后不应计薪");
    });
  }

  const s2 = S({ start: "22:00", end: "06:00", overtime: true });
  check("夜班 + overtime 开启：06:30 显示 overtime", () => {
    assert.strictEqual(compute(s2, at(6, 30, 2)).status, "overtime");
  });
  check("夜班 + overtime 开启：06:30 金额仍为 0（还没开始加班累积）", () => {
    assert.strictEqual(compute(s2, at(6, 30, 2)).earnedCents, 0);
  });
}

console.log("\n=== 4. 非跨午夜班次的下班前仍应显示 before（不能改坏） ===");
{
  const s = S();
  check("07:30 显示 before", () => assert.strictEqual(compute(s, at(7, 30)).status, "before"));
  check("09:00 整点开始上班", () => {
    const snap = compute(s, at(9, 0));
    assert.strictEqual(snap.status, "working");
    assert.strictEqual(snap.earnedCents, 0);
  });
}

console.log("\n=== 5. 休息时间 ===");
{
  const s = S();
  check("12:45 午休中且暂停计薪", () => {
    const snap = compute(s, at(12, 45));
    assert.strictEqual(snap.status, "break");
    assert.ok(!LIVE.has(snap.status));
  });
  check("13:00 恢复工作", () => assert.strictEqual(compute(s, at(13, 0)).status, "working"));
}

console.log("\n=== 6. 休息日 ===");
{
  const s = S();
  check("周六 dayoff 不计薪", () => {
    const snap = compute(s, at(10, 0, 6));
    assert.strictEqual(snap.status, "dayoff");
    assert.strictEqual(snap.earnedCents, 0);
  });
  check("周日 dayoff 不计薪", () => {
    assert.strictEqual(compute(s, at(10, 0, 0)).status, "dayoff");
  });
}

console.log("\n=== 7. 金额单调性：整天内 earned 只增不减，到点后封顶 ===");
{
  const s = S();
  const d = derive(s);
  let prev = -1;
  let ok = true;
  for (let min = 0; min < 1440; min += 5) {
    const snap = compute(s, new Date(2026, 0, 5, Math.floor(min / 60), min % 60));
    if (snap.earnedCents < prev) { ok = false; console.log(`    递减点: ${min} 分钟`); }
    if (snap.earnedCents > Math.round(d.dailyCents)) {
      ok = false;
      console.log(`    超出日薪: ${min} 分钟 → ${snap.earnedCents}`);
    }
    prev = snap.earnedCents;
  }
  check("全天 288 个采样点金额单调不减且不超过日薪", () => assert.ok(ok));
  check("23:55 金额恰等于日薪", () => {
    assert.strictEqual(compute(s, at(23, 55)).earnedCents, Math.round(d.dailyCents));
  });
}

console.log(`\n结果: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
