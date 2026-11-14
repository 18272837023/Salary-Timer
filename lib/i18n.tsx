"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type Lang = "en" | "zh";

/**
 * The dictionary is a flat map of dot-path keys to per-language strings.
 * Keeping it flat (rather than nested objects) means every key is greppable
 * and there is no risk of a nested lookup silently returning undefined.
 *
 * Missing keys fall back to English, so a partially-translated page never
 * shows a raw key to the visitor.
 */
type Dict = Record<string, string>;

// ─────────────────────────────────────────────────────────────────────────────
// Dictionaries
// ─────────────────────────────────────────────────────────────────────────────

const en: Dict = {
  // Header / nav
  "nav.brand": "Salary Timer",
  "nav.liveTimer": "Live timer",
  "nav.features": "Features",
  "nav.who": "Who it's for",
  "nav.faq": "FAQ",
  "nav.learn": "Learn",
  "nav.calculators": "Calculators",
  "nav.openMenu": "Open menu",
  "nav.closeMenu": "Close menu",
  "nav.lang": "中文",

  // Hero
  "hero.h1.line1": "Free ",
  "hero.h1.hl": "salary timer",
  "hero.h1.line2": "See your earnings in real time.",
  "hero.lede": "Enter your pay and working schedule to see estimated gross earnings update every second. Track today’s pay, account for unpaid breaks, and open a floating desktop counter in supported browsers.",
  "hero.sticker1.title": "Every second counts",
  "hero.sticker1.sub": "live gross-pay estimates",
  "hero.sticker2.title": "Unpaid break tracking",
  "hero.sticker2.sub": "pauses during configured breaks",
  "hero.sticker3.title": "Privacy mode",
  "hero.sticker3.sub": "blur every number in one tap",

  // Entity definition
  "entity.lede": "It runs entirely in your browser — no account, no install, and your pay figures never leave your device.",

  // SalaryApp — status labels
  "status.working": "On the clock",
  "status.break": "On an unpaid break",
  "status.overtime": "Overtime",
  "status.before": "Shift hasn't started",
  "status.done": "Clocked out",
  "status.dayoff": "Day off",
  "status.unset": "Pay not set yet",

  // SalaryApp — actions
  "action.showNumbers": "👀 Show numbers",
  "action.hideNumbers": "🙈 Hide numbers",
  "action.numbersVisible": "Numbers visible 👀",
  "action.numbersHidden": "Numbers hidden 🙈",
  "action.settle": "📋 Today's settlement",
  "action.setPay": "⚙️ Set my pay",

  "float.title": "Desktop live earnings",
  "float.open": "Desktop live earnings",
  "float.focus": "Show floating timer",
  "float.opening": "Opening…",
  "float.hint": "Keep this tab open while you work in other apps. Closing it also closes the floating timer.",
  "float.windowHint": "Keep the original tab open · Gross-pay estimate",
  "float.setup": "Set your pay first, then open a floating timer over your other apps.",
  "float.unsupported": "Floating timers are unavailable in this browser. Try a supported desktop browser such as Chrome or Edge.",
  "float.error": "The floating timer could not open. Check your browser settings and try again.",
  "float.return": "Back to webpage ↗",
  "float.hide": "Hide earnings",
  "float.show": "Show earnings",
  "float.hidden": "Earnings hidden",

  // Demo bar

  // Ticker
  "tick.earnedToday": "Earned today",
  "tick.atRate": "at",
  "tick.paidToday": "paid today",
  "tick.thisMonth": "this month",
  "tick.perMinute": "Per minute",
  "tick.perHour": "Per hour",
  "tick.perSecond": "Per second",
  "tick.ofShift": "of shift",
  "tick.nextMilestone": "Next",
  "tick.clockOutIn": "Clock out in",
  "tick.breakEndsIn": "Break ends in",
  "tick.shiftStartsIn": "Shift starts in",
  "tick.nextShiftIn": "Next shift in",
  "tick.untilPayday": "Payday in",
  "tick.daysLeft": "{n} days",
  "tick.dayLeft": "{n} day",
  "tick.paydayToday": "Payday today!",
  "tick.shiftDone": "Shift done",

  // Countdown labels
  "cd.nextShift": "Next shift",
  "cd.notSet": "Set your pay to start",
  "cd.clockOutIn": "Clock out in",
  "cd.overtimeFor": "Overtime for",
  "cd.shiftStartsIn": "Shift starts in",
  "cd.shiftComplete": "Shift complete",

  // Pause notes
  "pause.break": "Unpaid break — pay paused",
  "pause.breakResume": "Unpaid break — counting resumes at",
  "pause.before": "Shift starts at",
  "pause.done": "Clocked out — see you next shift",
  "pause.dayoff": "Day off — nothing to count today",

  // Slack card
  "slack.slackingFor": "Slacking for",
  "slack.slackedToday": "Slacked today",
  "slack.mode": "Slack mode",
  "slack.clockPaused": "clock paused",
  "slack.noPay": "no pay, no guilt",
  "slack.tap": "Tap when you wander off",
  "slack.backToWork": "Back to work",
  "slack.away": "☕ Away",

  // This month
  "month.title": "💸 This month, honestly",
  "month.expand": "Expand",
  "month.collapse": "Collapse",
  "month.hint": "Base pay plus extras, minus unpaid days",
  "month.baseEarned": "Base earned",
  "month.extras": "Extras (bonus, tips, OT)",
  "month.unpaidDays": "Unpaid days off",
  "month.total": "Total",
  "month.extraPlaceholder": "Bonus / tips",
  "month.unpaidThisMonth": "Unpaid days this month",
  "month.extraAdded": "Extra income added",
  "month.enterAmount": "Enter an amount",

  // QuickStart
  "qs.title": "Quick setup",
  "qs.skip": "Skip",
  "qs.notNow": "Not now",
  "qs.cancel": "Cancel",
  "qs.back": "Back",
  "qs.next": "Next",
  "qs.startClock": "Start my clock",
  "qs.step1.title": "What do you earn?",
  "qs.step1.sub": "Gross, before tax. Nothing leaves your browser.",
  "qs.step1.perYear": "Per year",
  "qs.step1.perMonth": "Per month",
  "qs.step1.perDay": "Per day",
  "qs.step1.perHour": "Per hour",
  "qs.step1.yearUnit": "/ year",
  "qs.step1.monthUnit": "/ month",
  "qs.step1.dayUnit": "/ workday",
  "qs.step1.hourUnit": "/ hour",
  "qs.step1.conversionHint": "A day means one paid shift. Estimates use your working days and paid hours.",
  "qs.when.title": "When are you at work?",
  "qs.when.sub": "Pick your shift and your unpaid break. The counter only runs while you are on the clock.",
  "qs.when.shift": "Working hours",
  "qs.when.start": "Clock in",
  "qs.when.end": "Clock out",
  "qs.when.lunch": "Unpaid break",
  "qs.when.lunchHelp": "The clock pauses here — no pay is added during this window.",
  "qs.when.breakStart": "Break starts",
  "qs.when.breakEnd": "Break ends",
  "qs.when.timeline": "Your working day",
  "qs.when.paidShort": "paid",
  "qs.when.paid": "Paid time",
  "qs.when.paused": "Unpaid break · paused",
  "qs.when.pauseNote": "Earnings only grow between clock-in and clock-out. Before the shift, during your break and after clock-out the counter is paused — nothing is added.",
  "qs.when.hoursHint": "Worked out from your shift and break. Drag to adjust — it moves your clock-out time.",
  "qs.step2.title": "How many hours is that?",
  "qs.step2.sub": "Choose your paid hours and working days to see what each hour is really worth.",
  "qs.step2.daysWeek": "Days a week",
  "qs.step2.hoursDay": "Paid hours a day",
  "qs.step2.fact": "That is {hours} paid hours a year — and {rate} an hour.",
  "qs.preview.earn": "You earn",
  "qs.preview.sec": "/ sec",
  "qs.preview.hr": "/ hr",
  "qs.addPayFirst": "Add your pay first 🙂",
  "qs.saved": "Saved — your clock is running",
  "qs.dragAdjust": "Drag to adjust",
  "qs.annualLabel": "Annual salary",
  "qs.monthlyLabel": "Monthly salary",
  "qs.dailyLabel": "Pay per working day",
  "qs.hourlyLabel": "Hourly rate",

  // SetupPanel
  "panel.title": "⚙️ Your pay setup",
  "panel.close": "Close",
  "panel.howPaid": "How are you paid?",
  "panel.yearly": "Yearly",
  "panel.monthly": "Monthly",
  "panel.daily": "Daily",
  "panel.hourly": "Hourly",
  "panel.annualLabel": "Annual salary (gross)",
  "panel.monthlyLabel": "Monthly salary (gross)",
  "panel.dailyLabel": "Pay per working day (gross)",
  "panel.hourlyLabel": "Hourly rate",
  "panel.currency": "Currency",
  "panel.currencyHelp": "The currency only changes the symbol — there are no exchange rates, so the number you typed stays exactly as it is.",
  "panel.workingDays": "Working days",
  "panel.daysHelp": "Tap the days you actually work — not the ones in your contract.",
  "panel.shiftStarts": "Shift starts",
  "panel.shiftEnds": "Shift ends",
  "panel.unpaidBreaks": "Unpaid breaks",
  "panel.addBreak": "+ Add a break",
  "panel.payday": "Payday",
  "panel.paydayHelp": "Used for the payday countdown.",
  "panel.dayOfMonth": "Day {d} of the month",
  "panel.lastDay": "Last day of the month",
  "panel.overtime": "Overtime after clock-out",
  "panel.overtimeHelp": "Keep counting at a higher rate",
  "panel.otMult": "Overtime multiplier",
  "panel.otTime": "1.5× overtime",
  "panel.otRate": "Overtime rate —",
  "panel.otToday": "Overtime today",
  "panel.otManual": "manual",
  "panel.otNone": "None yet",
  "panel.otClickHint": "Click to record today's overtime by hand",
  "panel.otReset": "↺ auto",
  "panel.otClearManual": "Clear manual overtime",
  "panel.privacyMode": "Privacy mode",
  "panel.privacyHelp": "Blur every number on screen",
  "panel.preview": "Your real hourly rate",
  "panel.previewPerDay": "per day",
  "panel.previewHoursYear": "paid hours a year",
  "panel.previewDaysWeek": "days a week",
  "panel.previewPaidShift": "paid per shift",
  "panel.startClock": "Start the clock",
  "panel.addPayFirst": "Add your pay first 🙂",
  "panel.pickDay": "Pick at least one working day",
  "panel.savedRunning": "Saved — the clock is running",
  "panel.savedUpdated": "Settings updated — clock running",
  "panel.savedBreak": "Saved — paused for unpaid break",
  "panel.savedBefore": "Saved — shift starts at {time}",
  "panel.savedDone": "Saved — shift complete for today",
  "panel.savedDayoff": "Saved — today is a day off",
  "panel.clockAlready": "The clock already counts {time} today",
  "panel.enterOt": "Enter how many overtime hours you did",
  "panel.timeHalf": "Time and a half",
  "panel.doubleTime": "Double time",

  // SettlementModal
  "settle.title": "📋 Today's settlement",
  "settle.shift": "Shift",
  "settle.paidHours": "Paid hours in shift",
  "settle.unpaidBreaks": "Unpaid breaks",
  "settle.paidSoFar": "Paid time so far",
  "settle.overtime": "Overtime ({mult}×)",
  "settle.hourlyRate": "Hourly rate",
  "settle.nextPayday": "Next payday",
  "settle.paydayDays": "{n} days",
  "settle.paydayDay": "{n} day",
  "settle.today": "Today",
  "settle.done": "Done",
  "settle.label": "Today's settlement",

  // Toast messages
  "toast.extraAdded": "Extra income added",
  "toast.numbersVisible": "Numbers visible 👀",
  "toast.numbersHidden": "Numbers hidden 🙈",

  // Footer
  "footer.tagline": "A free live counter for your working hours. Built for people who'd rather see the number than wait for the payslip.",
  "footer.tools": "Free tools",
  "footer.learn": "Learn",
  "footer.about": "About",
  "footer.howWorks": "How a salary timer works",
  "footer.private": "Is my salary data private?",
  "footer.faq": "Salary timer FAQ",
  // Label only — the policies themselves are English, with no /zh duplicates.
  "footer.privacy": "Privacy Policy",
  "footer.terms": "Terms of Use",
  "footer.copyright": "© {year} Salary Timer. Estimates only — not financial or tax advice.",
  "footer.madeWith": "Made with 🪙 for people who count the hours.",

  // Pain points

  // Features
  "feat.eyebrow": "What's inside",
  "feat.h2": "What the salary timer handles",
  "feat.lede": "Set the working time that should count toward your earnings. The timer follows your saved weekly schedule and the overtime options you choose.",
  "feat.1.title": "A live counter, down to the second",
  "feat.1.body": "See today’s estimated earnings update during paid working time, alongside your rates per second, minute and hour. Hourly pay uses your entered rate; salary modes convert pay using your schedule.",
  "feat.2.title": "Weekly schedules and overnight shifts",
  "feat.2.body": "Choose working days, shift start and end times, and unpaid breaks. Shifts can cross midnight. Update the saved schedule when your rota changes; individual holiday dates and rotating calendars are not scheduled automatically.",
  "feat.3.title": "Unpaid breaks, handled honestly",
  "feat.3.body": "Enter only unpaid breaks. The counter pauses during these windows and excludes them from paid hours. Leave paid breaks out of the unpaid-break list.",
  "feat.4.title": "Overtime, tips and bonuses",
  "feat.4.body": "Enable a multiplier to estimate pay after your scheduled shift ends. Add tips or bonuses to the month total. The timer follows these inputs; it does not determine statutory overtime eligibility.",
  "feat.5.title": "Payday countdown",
  "feat.5.body": "Set your monthly payday to see the calendar days remaining. Track estimated gross earnings alongside it; bank deposits, taxes and deductions are not predicted.",
  "feat.6.title": "Privacy and a floating desktop timer",
  "feat.6.body": "Blur pay figures on screen or open Desktop live earnings in supported desktop browsers. The floating window stays visible while you use other apps. Keep the original tab open; closing it closes the floating window.",
  "feat.mock.earnedToday": "Earned today",
  "feat.mock.yourWeek": "Your week",
  "feat.mock.shift": "Shift",
  "feat.mock.unpaidBreak": "Unpaid break",
  "feat.mock.today": "Today",
  "feat.mock.overtime": "Overtime",
  "feat.mock.paydayIn": "Payday in",
  "feat.mock.thisWeek": "This week",
  "feat.mock.tips": "Tips added",
  "feat.mock.paidTime": "Paid time",
  "feat.mock.paused": "paused",

  // Personas
  "persona.eyebrow": "Who it's for",
  "persona.h2": "Who the salary timer is for",
  "persona.lede": "Use the timer when your pay can be estimated from a saved working schedule. Adjust the inputs whenever your rate or schedule changes.",
  "persona.1.title": "Hourly and shift workers",
  "persona.1.body": "Enter an hourly rate, working days and shift times. Overnight shifts and unpaid break windows are supported.",
  "persona.2.title": "Retail & hospitality",
  "persona.2.body": "Variable hours, tips, split shifts. Watch a Sunday shift turn into a number you can actually plan with.",
  "persona.3.title": "Salaried employees",
  "persona.3.body": "Convert annual or monthly gross pay into a scheduled hourly equivalent, then see estimated earnings during your workday.",
  "persona.4.title": "Freelancers with scheduled hours",
  "persona.4.body": "Estimate earnings for a defined work window at your hourly rate. The timer does not record billable sessions or generate invoices.",
  "persona.5.title": "Remote & hybrid workers",
  "persona.5.body": "When work and home blur, a visible counter draws the line back at 5:30.",
  "persona.6.title": "Students & part-timers",
  "persona.6.body": "Four hours after class, one visible total. Suddenly a shift is worth more than \u201ca bit of cash\u201d.",

  // Scenarios

  // How it works
  "how.eyebrow": "How it works",
  "how.h2": "How to set up the salary timer",
  "how.lede": "Set your pay and schedule once, then return to the same browser to use your saved settings.",
  "how.1.title": "Tell it what you earn",
  "how.1.body": "Choose annual, monthly, daily or hourly pay, enter the gross amount and select your currency.",
  "how.2.title": "Tell it when you work",
  "how.2.body": "Set working days, start and end times, and unpaid breaks. Enable overtime only if you want the counter to continue after the scheduled shift.",
  "how.3.title": "Watch your estimated earnings",
  "how.3.body": "Save your settings and read today’s total, the per-second rate and shift progress. The counter pauses during configured unpaid breaks.",

  // FAQ
  "faq.eyebrow": "Questions",
  "faq.h2": "Salary timer FAQ",
  "faq.lede": "Short answers, no small print.",

  // CTA band
  "cta.h2": "Start the free salary timer",
  "cta.body": "Enter your pay and working hours to see today’s estimated earnings. Free to use, with no account required.",
  "cta.btn": "Start my salary timer",

  // Learn links
  "learn.eyebrow": "Learn",
  "learn.h2": "The three topics behind the salary timer",
  "learn.lede": "Everything this site explains belongs to one of three questions: what an hour is worth, what counts as paid time, and when the money arrives. Start at the full topic map — or take the shortest route in.",
  "learn.entry": "New to the idea? How salary timers work explains the whole thing in one read, before the detail.",

  // Tool links
  "tools.eyebrow": "Keep going",
  "tools.h2": "More free salary tools",
  "tools.related": "Prefer a walkthrough first? Read {label}, then come back to the calculator.",
  "tools.faqTitle": "{label}: the short answers",
  "tools.faqLede": "Everything people ask about this particular calculation.",

  // Tool page
  "tool.breadcrumbHome": "Home",
  "tool.breadcrumbSlash": "/",
  "tool.relatedNew": "New here? Read",
  "tool.relatedOr": ", or open the salary timer on the homepage.",
  "tool.relatedOrShort": "Or start on the homepage with the salary timer.",

  // Day labels
  "day.today": "Today",
  "day.tomorrow": "Tomorrow",
  "day.0": "Sunday",
  "day.1": "Monday",
  "day.2": "Tuesday",
  "day.3": "Wednesday",
  "day.4": "Thursday",
  "day.5": "Friday",
  "day.6": "Saturday",
};

const zh: Dict = {
  // Header / nav
  "nav.brand": "薪资计时器",
  "nav.liveTimer": "实时计时",
  "nav.features": "功能",
  "nav.who": "适用人群",
  "nav.faq": "常见问题",
  "nav.learn": "知识库",
  "nav.calculators": "计算器",
  "nav.openMenu": "打开菜单",
  "nav.closeMenu": "关闭菜单",
  "nav.lang": "EN",

  // Hero
  "hero.h1.line1": "免费的",
  "hero.h1.hl": "薪资计时器",
  "hero.h1.line2": "实时查看工作收入。",
  "hero.lede": "输入薪资和排班，每秒查看税前收入估算。追踪今日已赚金额，扣除无薪休息，并在支持的桌面浏览器中开启悬浮计薪。",
  "hero.sticker1.title": "每一秒都算数",
  "hero.sticker1.sub": "实时估算税前收入",
  "hero.sticker2.title": "无薪休息暂停",
  "hero.sticker2.sub": "按设置的休息时段暂停计薪",
  "hero.sticker3.title": "隐私模式",
  "hero.sticker3.sub": "一键模糊所有数字",

  // Entity definition
  "entity.lede": "完全在浏览器中运行——无需注册、无需安装，你的薪资数据永远不会离开你的设备。",

  // SalaryApp — status labels
  "status.working": "工作中",
  "status.break": "无薪休息中",
  "status.overtime": "加班中",
  "status.before": "尚未开始",
  "status.done": "已下班",
  "status.dayoff": "休息日",
  "status.unset": "还没设置薪资",

  // SalaryApp — actions
  "action.showNumbers": "👀 显示数字",
  "action.hideNumbers": "🙈 隐藏数字",
  "action.numbersVisible": "数字已显示 👀",
  "action.numbersHidden": "数字已隐藏 🙈",
  "action.settle": "📋 今日结算",
  "action.setPay": "⚙️ 设置薪资",

  "float.title": "桌面实时计薪",
  "float.open": "桌面实时计薪",
  "float.focus": "查看悬浮窗",
  "float.opening": "正在打开…",
  "float.hint": "请保留此标签页，可切换到其他应用。关闭标签页也会关闭悬浮窗。",
  "float.windowHint": "请保留原标签页 · 税前收入估算",
  "float.setup": "先设置薪资，再打开悬浮计薪，切换应用也能看收入。",
  "float.unsupported": "此浏览器暂不支持悬浮计薪，请使用支持的桌面浏览器，如 Chrome 或 Edge。",
  "float.error": "无法打开悬浮窗，请检查浏览器设置后重试。",
  "float.return": "返回网页 ↗",
  "float.hide": "隐藏收入",
  "float.show": "显示收入",
  "float.hidden": "收入已隐藏",

  // Demo bar

  // Ticker
  "tick.earnedToday": "今日已赚",
  "tick.atRate": "时薪",
  "tick.paidToday": "今日已计薪",
  "tick.thisMonth": "本月",
  "tick.perMinute": "每分钟",
  "tick.perHour": "每小时",
  "tick.perSecond": "每秒",
  "tick.ofShift": "班次进度",
  "tick.nextMilestone": "下一个",
  "tick.clockOutIn": "距下班",
  "tick.breakEndsIn": "休息还剩",
  "tick.shiftStartsIn": "距上班",
  "tick.nextShiftIn": "距下次上班",
  "tick.untilPayday": "距发薪日",
  "tick.daysLeft": "{n} 天",
  "tick.dayLeft": "{n} 天",
  "tick.paydayToday": "今天发薪日！",
  "tick.shiftDone": "今日已完成",

  // Countdown labels
  "cd.nextShift": "下次上班",
  "cd.notSet": "设置薪资后开始",
  "cd.clockOutIn": "距下班",
  "cd.overtimeFor": "加班时长",
  "cd.shiftStartsIn": "距上班",
  "cd.shiftComplete": "班次完成",

  // Pause notes
  "pause.break": "无薪休息——暂停计薪",
  "pause.breakResume": "无薪休息——恢复计薪于",
  "pause.before": "上班时间为",
  "pause.done": "已下班——下次见",
  "pause.dayoff": "休息日——今天无计薪",

  // Slack card
  "slack.slackingFor": "摸鱼中",
  "slack.slackedToday": "今日摸鱼",
  "slack.mode": "摸鱼模式",
  "slack.clockPaused": "计时暂停",
  "slack.noPay": "不计薪，不愧疚",
  "slack.tap": "走开时点一下",
  "slack.backToWork": "回来工作",
  "slack.away": "☕ 离开",

  // This month
  "month.title": "💸 本月真实收入",
  "month.expand": "展开",
  "month.collapse": "收起",
  "month.hint": "基本薪资 + 额外收入 − 无薪天数",
  "month.baseEarned": "基本收入",
  "month.extras": "额外（奖金、小费、加班）",
  "month.unpaidDays": "无薪休假",
  "month.total": "合计",
  "month.extraPlaceholder": "奖金 / 小费",
  "month.unpaidThisMonth": "本月无薪天数",
  "month.extraAdded": "额外收入已添加",
  "month.enterAmount": "请输入金额",

  // QuickStart
  "qs.title": "快速设置",
  "qs.skip": "跳过",
  "qs.notNow": "以后再说",
  "qs.cancel": "取消",
  "qs.back": "上一步",
  "qs.next": "下一步",
  "qs.startClock": "开始计时",
  "qs.step1.title": "你的收入是多少？",
  "qs.step1.sub": "税前总额。数据不会离开你的浏览器。",
  "qs.step1.perYear": "按年",
  "qs.step1.perMonth": "按月",
  "qs.step1.perDay": "按天",
  "qs.step1.perHour": "按时",
  "qs.step1.yearUnit": "/ 年",
  "qs.step1.monthUnit": "/ 月",
  "qs.step1.dayUnit": "/ 工作日",
  "qs.step1.hourUnit": "/ 时",
  "qs.step1.conversionHint": "按天指一个计薪工作日；估算会考虑你的工作天数与计薪工时。",
  "qs.when.title": "你什么时候在上班？",
  "qs.when.sub": "选择上下班时间和无薪休息。计时器只在你上班的时段累加。",
  "qs.when.shift": "上班时段",
  "qs.when.start": "上班时间",
  "qs.when.end": "下班时间",
  "qs.when.lunch": "无薪午休",
  "qs.when.lunchHelp": "这段时间内计时器暂停，不再累加收入。",
  "qs.when.breakStart": "休息开始",
  "qs.when.breakEnd": "休息结束",
  "qs.when.timeline": "你的一天",
  "qs.when.paidShort": "计薪",
  "qs.when.paid": "计薪时段",
  "qs.when.paused": "无薪休息 · 暂停",
  "qs.when.pauseNote": "只有上班到下班之间才会累加收入；上班前、午休时和下班后，计时器都会暂停，不再计薪。",
  "qs.when.hoursHint": "根据上班时段和午休自动算出；拖动可调整，下班时间会同步变化。",
  "qs.step2.title": "工作多少小时？",
  "qs.step2.sub": "选择每周工作天数与每日计薪工时，看看一小时实际值多少钱。",
  "qs.step2.daysWeek": "每周工作天数",
  "qs.step2.hoursDay": "每日计薪工时",
  "qs.step2.fact": "全年 {hours} 计薪小时——时薪 {rate}。",
  "qs.preview.earn": "你的时薪",
  "qs.preview.sec": "/ 秒",
  "qs.preview.hr": "/ 时",
  "qs.addPayFirst": "先填写你的收入 🙂",
  "qs.saved": "已保存——计时开始",
  "qs.dragAdjust": "拖动调整",
  "qs.annualLabel": "年薪",
  "qs.monthlyLabel": "月薪",
  "qs.dailyLabel": "日薪（每个工作日）",
  "qs.hourlyLabel": "时薪",

  // SetupPanel
  "panel.title": "⚙️ 薪资设置",
  "panel.close": "关闭",
  "panel.howPaid": "你的薪资类型？",
  "panel.yearly": "年薪",
  "panel.monthly": "月薪",
  "panel.daily": "日薪",
  "panel.hourly": "时薪",
  "panel.annualLabel": "年薪（税前）",
  "panel.monthlyLabel": "月薪（税前）",
  "panel.dailyLabel": "日薪（每个工作日，税前）",
  "panel.hourlyLabel": "时薪",
  "panel.currency": "货币",
  "panel.currencyHelp": "货币只决定显示的符号，不做汇率换算——你填的数字原样保留。",
  "panel.workingDays": "工作日",
  "panel.daysHelp": "点选你实际工作的日子——不是合同上写的。",
  "panel.shiftStarts": "上班时间",
  "panel.shiftEnds": "下班时间",
  "panel.unpaidBreaks": "无薪休息",
  "panel.addBreak": "+ 添加休息时段",
  "panel.payday": "发薪日",
  "panel.paydayHelp": "用于发薪日倒计时。",
  "panel.dayOfMonth": "每月 {d} 号",
  "panel.lastDay": "每月最后一天",
  "panel.overtime": "下班后加班",
  "panel.overtimeHelp": "按更高倍率继续计薪",
  "panel.otMult": "加班倍率",
  "panel.otTime": "1.5 倍加班",
  "panel.otRate": "加班时薪——",
  "panel.otToday": "今日加班",
  "panel.otManual": "手动",
  "panel.otNone": "暂无",
  "panel.otClickHint": "点击手动记录今日加班时长",
  "panel.otReset": "↺ 自动",
  "panel.otClearManual": "清除手动加班",
  "panel.privacyMode": "隐私模式",
  "panel.privacyHelp": "模糊屏幕上所有数字",
  "panel.preview": "你的真实时薪",
  "panel.previewPerDay": "每天",
  "panel.previewHoursYear": "全年计薪小时",
  "panel.previewDaysWeek": "每周工作天数",
  "panel.previewPaidShift": "每班计薪时长",
  "panel.startClock": "开始计时",
  "panel.addPayFirst": "先填写你的收入 🙂",
  "panel.pickDay": "至少选择一个工作日",
  "panel.savedRunning": "已保存——计时开始",
  "panel.savedUpdated": "设置已更新——计时运行中",
  "panel.savedBreak": "已保存——无薪休息暂停中",
  "panel.savedBefore": "已保存——上班时间为 {time}",
  "panel.savedDone": "已保存——今日班次已完成",
  "panel.savedDayoff": "已保存——今天是休息日",
  "panel.clockAlready": "计时器已记录今日 {time}",
  "panel.enterOt": "请输入你的加班小时数",
  "panel.timeHalf": "一点五倍",
  "panel.doubleTime": "两倍",

  // SettlementModal
  "settle.title": "📋 今日结算",
  "settle.shift": "班次",
  "settle.paidHours": "班次计薪工时",
  "settle.unpaidBreaks": "无薪休息",
  "settle.paidSoFar": "已计薪时长",
  "settle.overtime": "加班（{mult}×）",
  "settle.hourlyRate": "时薪",
  "settle.nextPayday": "距发薪日",
  "settle.paydayDays": "{n} 天",
  "settle.paydayDay": "{n} 天",
  "settle.today": "今日",
  "settle.done": "完成",
  "settle.label": "今日结算",

  // Toast messages
  "toast.extraAdded": "额外收入已添加",
  "toast.numbersVisible": "数字已显示 👀",
  "toast.numbersHidden": "数字已隐藏 🙈",

  // Footer
  "footer.tagline": "一个免费的工作时间实时计薪器。为那些想看到数字、而不是等工资条的人而做。",
  "footer.tools": "免费工具",
  "footer.learn": "知识库",
  "footer.about": "关于",
  "footer.howWorks": "计时器如何工作",
  "footer.private": "我的薪资数据安全吗？",
  "footer.faq": "常见问题",
  // 仅本地化链接文字，政策正文只有英文版。
  "footer.privacy": "隐私政策",
  "footer.terms": "使用条款",
  "footer.copyright": "© {year} 薪资计时器。仅供参考——非财务或税务建议。",
  "footer.madeWith": "用 🪙 为每个认真计时的人而做。",

  // Pain points

  // Features
  "feat.eyebrow": "功能一览",
  "feat.h2": "计时器能做什么",
  "feat.lede": "设置哪些工作时间参与计薪。计时器按保存的每周排班和你选择的加班选项计算收入。",
  "feat.1.title": "实时计数器，精确到秒",
  "feat.1.body": "在计薪时段查看持续更新的今日收入，以及每秒、每分钟和每小时的收入。时薪模式直接使用输入的金额，固定薪资模式按排班换算。",
  "feat.2.title": "每周排班与跨午夜班次",
  "feat.2.body": "选择工作日、上下班时间和无薪休息，支持跨午夜的班次。轮班变化时需要手动更新排班；不会自动安排具体节假日或循环轮班表。",
  "feat.3.title": "无薪休息，诚实处理",
  "feat.3.body": "只填写无薪休息时段。计时器会在这些时段暂停，并从计薪工时中扣除。带薪休息无需加入无薪休息列表。",
  "feat.4.title": "加班、小费和奖金",
  "feat.4.body": "开启加班倍率后，可估算排班结束后的收入。小费和奖金可加入本月总额。计时器按输入计算，不自动判断法定加班资格。",
  "feat.5.title": "发薪日倒计时",
  "feat.5.body": "设置每月发薪日，查看还剩多少个日历天，同时追踪税前收入估算。倒计时不预测银行到账时间，也不计算税费和扣款。",
  "feat.6.title": "隐私模式与桌面实时计薪",
  "feat.6.body": "可模糊屏幕上的薪资数字，也可在支持的桌面浏览器中打开“桌面实时计薪”。使用其他应用时仍能查看悬浮窗；请保留原标签页，关闭它会同时关闭悬浮窗。",
  "feat.mock.earnedToday": "今日已赚",
  "feat.mock.yourWeek": "你的工作周",
  "feat.mock.shift": "班次",
  "feat.mock.unpaidBreak": "无薪休息",
  "feat.mock.today": "今日",
  "feat.mock.overtime": "加班",
  "feat.mock.paydayIn": "距发薪日",
  "feat.mock.thisWeek": "本周",
  "feat.mock.tips": "小费",
  "feat.mock.paidTime": "计薪工时",
  "feat.mock.paused": "暂停",

  // Personas
  "persona.eyebrow": "适用人群",
  "persona.h2": "谁在用这个计时器",
  "persona.lede": "适合按固定工作时段估算收入的用户。费率或排班变化后，请同步调整设置。",
  "persona.1.title": "时薪与轮班工作者",
  "persona.1.body": "输入时薪、工作日和班次时间，支持跨午夜班次及无薪休息时段。",
  "persona.2.title": "零售和餐饮",
  "persona.2.body": "工时不固定、有小费、分段班。看着一个周日班次变成一个你能规划的数字。",
  "persona.3.title": "固定薪资工作者",
  "persona.3.body": "将税前年薪或月薪换算成排班对应的时薪，在工作日查看实时收入估算。",
  "persona.4.title": "按固定时段工作的自由职业者",
  "persona.4.body": "按时薪估算指定工作时段的收入。计时器不记录客户计费会话，也不生成发票。",
  "persona.5.title": "远程和混合办公",
  "persona.5.body": "当工作和生活的界限模糊时，一个可见的计薪器帮你在 5:30 把线画回来。",
  "persona.6.title": "学生和兼职",
  "persona.6.body": "课后四小时，一个可见的总额。突然一个班次就不只是\u201c一点零花钱\u201d了。",

  // Scenarios

  // How it works
  "how.eyebrow": "使用方法",
  "how.h2": "如何设置计时器",
  "how.lede": "设置薪资和排班后，下次使用同一浏览器即可读取已保存的设置。",
  "how.1.title": "告诉它你的收入",
  "how.1.body": "选择年薪、月薪、日薪或时薪，输入税前金额并选择币种。",
  "how.2.title": "告诉它你的工作时间",
  "how.2.body": "设置工作日、上下班时间和无薪休息。需要在排班结束后继续计薪时，再开启加班选项。",
  "how.3.title": "查看实时收入估算",
  "how.3.body": "保存设置，查看今日已赚、每秒收入和班次进度。遇到设置的无薪休息时段，计数器会暂停。",

  // FAQ
  "faq.eyebrow": "常见问题",
  "faq.h2": "薪资计时器常见问题",
  "faq.lede": "简短回答，没有废话。",

  // CTA band
  "cta.h2": "开始使用免费计薪器",
  "cta.body": "输入薪资与工作时间，查看今天的税前收入估算。免费使用，无需注册。",
  "cta.btn": "开始计时",

  // Learn links
  "learn.eyebrow": "知识库",
  "learn.h2": "计时器背后的三个话题",
  "learn.lede": "本站解释的一切都属于三个问题之一：一小时值多少钱、什么算计薪时间、钱什么时候到。从完整话题地图开始——或者选最短的路进去。",
  "learn.entry": "第一次接触？计时器工作原理用一篇文章解释了全部，在细节之前。",

  // Tool links
  "tools.eyebrow": "继续探索",
  "tools.h2": "更多免费薪资工具",
  "tools.related": "想先看指南？读 {label}，然后回到计算器。",
  "tools.faqTitle": "{label}：简短回答",
  "tools.faqLede": "关于这个计算的所有常见问题。",

  // Tool page
  "tool.breadcrumbHome": "首页",
  "tool.breadcrumbSlash": "/",
  "tool.relatedNew": "第一次来？读",
  "tool.relatedOr": "，或在首页打开薪资计时器。",
  "tool.relatedOrShort": "或在首页开始使用薪资计时器。",

  // Day labels
  "day.today": "今天",
  "day.tomorrow": "明天",
  "day.0": "周日",
  "day.1": "周一",
  "day.2": "周二",
  "day.3": "周三",
  "day.4": "周四",
  "day.5": "周五",
  "day.6": "周六",
};

const DICTS: Record<Lang, Dict> = { en, zh };

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

// The URL is the single source of truth for language:
//
//   /            → English, for every visitor, including Chinese browsers
//   /zh/         → Chinese
//
// Deriving the locale from the route (instead of navigator.language or a
// localStorage flag) means the prerendered HTML of /zh is already Chinese —
// no flash of English on load, no two languages served from one URL — and a
// shared link always opens in the language it was shared in.
export const DEFAULT_LANG: Lang = "en";
export const EN_HOME = "/";
export const ZH_HOME = "/zh/";

const ZH_ROUTE = /^\/zh(?:\/|$)/;

export function langFromPath(pathname: string | null | undefined): Lang {
  return pathname && ZH_ROUTE.test(pathname) ? "zh" : "en";
}

interface I18nContextValue {
  lang: Lang;
  /** Navigate to the home page in the requested language. */
  setLang: (lang: Lang) => void;
  /** Navigate to the other language. */
  toggleLang: () => void;
  /** Translate a key, with optional interpolation. Falls back to English. */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** Same as `t` but returns the raw English key if missing (for debugging). */
  tRaw: (key: string) => string;
  /** Kept for API compatibility — the locale no longer needs hydration. */
  ready: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const lang = langFromPath(pathname);

  // Keep <html lang> in sync for screen readers, translation tools and crawlers.
  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);

  const setLang = useCallback(
    (next: Lang) => {
      if (next === lang) return;
      router.push(next === "zh" ? ZH_HOME : EN_HOME);
    },
    [lang, router],
  );

  const toggleLang = useCallback(() => setLang(lang === "en" ? "zh" : "en"), [lang, setLang]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const dict = DICTS[lang];
      let str = dict[key] ?? en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return str;
    },
    [lang],
  );

  const tRaw = useCallback(
    (key: string): string => DICTS[lang][key] ?? en[key] ?? key,
    [lang],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ lang, setLang, toggleLang, t, tRaw, ready: true }),
    [lang, setLang, toggleLang, t, tRaw],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

/**
 * Localise an internal href for the active language. Homepage anchors stay on
 * the Chinese homepage; links into /learn/* and the tool pages keep pointing at
 * the English site, which is the only place those pages exist.
 */
export function useHref(): (href: string) => string {
  const { lang } = useI18n();
  return useCallback(
    (href: string) => {
      if (lang !== "zh") return href;
      if (href === "/") return ZH_HOME;
      if (href.startsWith("/#")) return `${ZH_HOME}${href.slice(1)}`;
      return href;
    },
    [lang],
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Language picker — a dropdown in the header
//
// The button always shows the language of the page you are ON (EN / 中文) and
// the menu offers both languages with the active one ticked. So EN always means
// an English page and 中文 always means a Chinese page — no "label of the other
// language" ambiguity. Language names are intentionally not translated: each
// is written the way that language refers to itself.
// ─────────────────────────────────────────────────────────────────────────────

const LANG_OPTIONS: { id: Lang; code: string; name: string; htmlLang: string }[] = [
  { id: "en", code: "EN", name: "English", htmlLang: "en" },
  { id: "zh", code: "中", name: "简体中文", htmlLang: "zh-CN" },
];

export function LangDropdown() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const current = LANG_OPTIONS.find((o) => o.id === lang)!;

  return (
    <div className="lang-dd" ref={boxRef}>
      <button
        type="button"
        className="lang-dd-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${current.name}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="lang-dd-globe" aria-hidden="true">
          🌐
        </span>
        <span>{current.code}</span>
        <span className="lang-dd-chev" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div className="lang-dd-menu" role="listbox" aria-label="Language">
          {LANG_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              role="option"
              aria-selected={lang === o.id}
              lang={o.htmlLang}
              className={`lang-dd-item${lang === o.id ? " active" : ""}`}
              onClick={() => {
                setOpen(false);
                setLang(o.id);
              }}
            >
              <span className="lang-dd-code">{o.code}</span>
              <span className="lang-dd-name">{o.name}</span>
              <span className="lang-dd-check" aria-hidden="true">
                {lang === o.id ? "✓" : ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** @deprecated use <LangDropdown /> — kept so older imports keep working. */
export const LangToggle = LangDropdown;
