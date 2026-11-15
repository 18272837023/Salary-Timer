"use client";

import { useId, useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n";
import { CURRENCIES, parseAmountToCents, currencyName } from "@/lib/money";
import { toMinutes } from "@/lib/schedule";
import { useSettings, useToast } from "@/lib/store";
import { SETTINGS_VERSION } from "@/lib/defaults";
import { track } from "@/lib/analytics";
import type { CurrencyCode, PayMode } from "@/lib/types";
import { EarningsBuddy } from "./EarningsBuddy";

export function SalaryStart({ onAdvanced }: { onAdvanced: () => void }) {
  const { lang, t } = useI18n();
  const zh = lang === "zh";
  const { settings, hydrated, replace } = useSettings();
  const { show } = useToast();
  const id = useId();
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<PayMode>(zh ? "monthly" : "annual");
  const [currency, setCurrency] = useState<CurrencyCode>(zh ? "CNY" : "USD");
  const [days, setDays] = useState([1, 2, 3, 4, 5]);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:30");
  const [lunch, setLunch] = useState(true);
  const [breakStart, setBreakStart] = useState("12:30");
  const [breakEnd, setBreakEnd] = useState("13:00");
  const [error, setError] = useState("");
  const modes: PayMode[] = ["monthly", "annual", "daily", "hourly"];
  function save(e: FormEvent) {
    e.preventDefault();
    const cents = parseAmountToCents(amount);
    if (cents === null || cents <= 0 || cents > 1e12 || !days.length) {
      setError(zh ? "请输入有效薪资，并至少选择一个工作日。" : "Enter a valid pay amount and choose at least one working day."); return;
    }
    const s = toMinutes(start), eMin = toMinutes(end);
    const win = (eMin - s + 1440) % 1440;
    const offset = (toMinutes(breakStart) - s + 1440) % 1440;
    const duration = (toMinutes(breakEnd) - toMinutes(breakStart) + 1440) % 1440;
    if (!win || (lunch && (!duration || offset + duration > win || duration >= win))) {
      setError(zh ? "请确认班次时间有效，且无薪休息完整位于班次内。夜班可跨午夜。" : "Check shift times and keep the unpaid break inside your shift. Overnight shifts are supported."); return;
    }
    const saved = replace({ ...settings, mode, currency, amountCents: cents, start, end, days: [...days].sort(), breaks: lunch ? [{ id: "start-break", start: breakStart, end: breakEnd }] : [], onboarded: true, v: SETTINGS_VERSION });
    track("setup_complete", { mode, days: days.length });
    show(saved.ok ? (zh ? "设置好了，今天的收入从这里看。" : "All set. Your workday, in earnings.") : (zh ? "当前浏览器无法保存设置，关闭页面后可能丢失。" : "This browser cannot save settings; they may be lost when you close the page."));
  }
  return <div className="salary-start">
    <div className="start-intro">
      <span className="start-eyebrow">{zh ? "YOUR TIME, WELL EARNED" : "YOUR TIME, WELL EARNED"}</span>
      <EarningsBuddy />
      <h2>{zh ? <>每一秒，<br />都有小小的收获。</> : <>A little progress.<br />Every paid second.</>}</h2>
      <p>{zh ? "把工作中的时间，变成看得见的收入。先告诉我们你的薪资和排班，剩下的交给计时器。" : "Make the value of your working time visible. Add your pay and schedule, and let the timer take it from here."}</p>
      <span className="start-private">{zh ? "本机保存 · 无需注册 · 税前估算" : "Saved on this device · No account · Gross-pay estimates"}</span>
    </div>
    <form className="start-form" onSubmit={save}>
      <div className="start-form-head"><span>{zh ? "开始设置" : "MAKE IT YOURS"}</span><span>01 / 01</span></div>
      <div className="start-pay-row">
        <label htmlFor={`${id}-amount`}>{zh ? "你的薪资" : "Your pay"}</label>
        <select aria-label={zh ? "薪资类型" : "Pay type"} value={mode} onChange={e => setMode(e.target.value as PayMode)}>{modes.map(m => <option value={m} key={m}>{t(`panel.${m === "annual" ? "yearly" : m}`)}</option>)}</select>
      </div>
      <div className="start-amount">
        <select aria-label={zh ? "币种" : "Currency"} value={currency} onChange={e => setCurrency(e.target.value as CurrencyCode)}>{CURRENCIES.map(c => <option key={c} value={c}>{c} · {currencyName(c, zh ? "zh-CN" : "en-US")}</option>)}</select>
        <input id={`${id}-amount`} type="text" inputMode="decimal" autoComplete="off" placeholder={zh ? "输入金额" : "Enter amount"} value={amount} onChange={e => setAmount(e.target.value)} required aria-describedby={error ? `${id}-error` : undefined} />
      </div>
      <fieldset className="start-days"><legend>{zh ? "每周工作日" : "Working days"}</legend><div>{[1, 2, 3, 4, 5, 6, 0].map(day => <button type="button" aria-pressed={days.includes(day)} key={day} aria-label={t(`day.${day}`)} onClick={() => setDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])}>{zh ? ["日", "一", "二", "三", "四", "五", "六"][day] : ["S", "M", "T", "W", "T", "F", "S"][day]}</button>)}</div></fieldset>
      <div className="start-time-row"><span>{zh ? "上下班时间" : "Shift times"}</span><div><input type="time" aria-label={zh ? "上班时间" : "Shift start"} value={start} onChange={e => setStart(e.target.value)} required /><span>—</span><input type="time" aria-label={zh ? "下班时间" : "Shift end"} value={end} onChange={e => setEnd(e.target.value)} required /></div></div>
      <div className="start-break-row"><label><input type="checkbox" checked={lunch} onChange={e => setLunch(e.target.checked)} />{zh ? "扣除无薪休息" : "Exclude an unpaid break"}</label>{lunch && <div><input type="time" aria-label={zh ? "休息开始" : "Break start"} value={breakStart} onChange={e => setBreakStart(e.target.value)} required /><span>—</span><input type="time" aria-label={zh ? "休息结束" : "Break end"} value={breakEnd} onChange={e => setBreakEnd(e.target.value)} required /></div>}</div>
      {error && <p className="start-error" id={`${id}-error`} role="alert">{error}</p>}
      <button className="btn btn-ink start-submit" type="submit" disabled={!hydrated}>{zh ? "保存并开始计薪" : "Save & start earning"}<span aria-hidden="true">↗</span></button>
      <button className="start-advanced" type="button" disabled={!hydrated} onClick={onAdvanced}>{zh ? "更多设置：发薪日、加班与其他选项" : "More settings: payday, overtime & other options"}</button>
    </form>
  </div>;
}
