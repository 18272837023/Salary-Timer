/**
 * 真实代码测试：lib/money.ts 的货币格式化
 *
 * 重点覆盖三件事：
 *  1. 美元类货币仍是两位小数，千分位正确；
 *  2. 日元 / 韩元 / 印尼盾 / 越南盾这些没有小数位的货币，不能出现 ".00"；
 *  3. 人民币和日元共用 "¥"，必须靠 ISO 代码区分，而不是靠符号。
 */
const assert = require("node:assert");

const M = require("../.tmptest/money.js");

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

console.log("=== A. 货币表完整性 ===");
check("六种主流货币都在列表里", () => {
  for (const code of ["USD", "CNY", "GBP", "EUR", "JPY", "KRW"]) {
    assert.ok(M.CURRENCY_CODES.includes(code), `${code} missing`);
    assert.ok(M.CURRENCY_META[code], `${code} has no meta`);
  }
});
check("货币代码无重复且顺序固定", () => {
  assert.strictEqual(new Set(M.CURRENCY_CODES).size, M.CURRENCY_CODES.length);
  assert.deepStrictEqual(M.CURRENCY_CODES.slice(0, 6), ["USD", "EUR", "CNY", "GBP", "JPY", "KRW"]);
});
check("isCurrencyCode 拒绝未知代码", () => {
  assert.strictEqual(M.isCurrencyCode("USD"), true);
  assert.strictEqual(M.isCurrencyCode("CNY"), true);
  assert.strictEqual(M.isCurrencyCode("XYZ"), false);
  assert.strictEqual(M.isCurrencyCode(undefined), false);
});

console.log("=== B. 两位小数货币 ===");
check("USD 123456 分 → $1,234.56", () => {
  assert.strictEqual(M.formatCents(123456, "USD"), "$1,234.56");
});
check("CNY 123456 分 → ¥1,234.56", () => {
  assert.strictEqual(M.formatCents(123456, "CNY"), "¥1,234.56");
});
check("EUR 5 分 → €0.05（补零）", () => {
  assert.strictEqual(M.formatCents(5, "EUR"), "€0.05");
});
check("GBP 负值保留负号", () => {
  assert.strictEqual(M.formatCents(-123456, "GBP"), "-£1,234.56");
});
check("formatRate 默认两位", () => {
  assert.strictEqual(M.formatRate(3750, "USD"), "$37.50");
});
check("formatRate 支持四位（每秒）", () => {
  assert.strictEqual(M.formatRate(0.96, "USD", 4), "$0.0096");
});

console.log("=== C. 零小数货币 ===");
check("JPY 没有小数位", () => {
  assert.strictEqual(M.decimalsFor("JPY"), 0);
  assert.strictEqual(M.formatCents(123456, "JPY"), "¥1,234");
});
check("KRW 没有小数位", () => {
  assert.strictEqual(M.formatCents(123456, "KRW"), "₩1,234");
});
check("零小数货币余额向下取整，不多显示", () => {
  assert.strictEqual(M.formatCents(199, "JPY"), "¥1");
  assert.strictEqual(M.formatCents(99, "JPY"), "¥0");
});
check("splitCents 对日元返回空小数部分", () => {
  assert.deepStrictEqual(M.splitCents(123456, "JPY"), { whole: "1,234", frac: "" });
});
check("splitCents 对美元保留两位", () => {
  assert.deepStrictEqual(M.splitCents(123456, "USD"), { whole: "1,234", frac: ".56" });
});
check("centsToInput 日元只给整数", () => {
  assert.strictEqual(M.centsToInput(123456, "JPY"), "1234");
  assert.strictEqual(M.centsToInput(123456, "USD"), "1234.56");
});

console.log("=== D. 共用符号的货币 ===");
check("人民币与日元符号相同，靠代码区分", () => {
  assert.strictEqual(M.symbolFor("CNY"), M.symbolFor("JPY"));
  assert.notStrictEqual(M.currencyName("CNY", "zh-CN"), M.currencyName("JPY", "zh-CN"));
});
check("各种美元用不同符号前缀", () => {
  assert.strictEqual(M.symbolFor("USD"), "$");
  assert.strictEqual(M.symbolFor("CAD"), "CA$");
  assert.strictEqual(M.symbolFor("AUD"), "A$");
  assert.strictEqual(M.symbolFor("SGD"), "S$");
  assert.strictEqual(M.symbolFor("HKD"), "HK$");
});
check("currencyName 输出本地化名称", () => {
  assert.strictEqual(M.currencyName("CNY", "zh-CN"), "人民币");
  assert.strictEqual(M.currencyName("USD", "en-US"), "US Dollar");
});
check("未知代码回退到美元符号且不抛错", () => {
  assert.strictEqual(M.symbolFor("XYZ"), "$");
  assert.strictEqual(M.decimalsFor("XYZ"), 2);
});

console.log("=== E. 解析与回填往返 ===");
check("输入解析成整数分", () => {
  assert.strictEqual(M.parseAmountToCents("78000"), 7800000);
  assert.strictEqual(M.parseAmountToCents("1,234.56"), 123456);
  assert.strictEqual(M.parseAmountToCents("abc"), null);
  assert.strictEqual(M.parseAmountToCents(""), null);
});
check("日元金额往返不丢精度", () => {
  const cents = M.parseAmountToCents("4800000");
  assert.strictEqual(M.centsToInput(cents, "JPY"), "4800000");
  assert.strictEqual(M.formatCents(cents, "JPY"), "¥4,800,000");
});

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
