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
  "hero.h1.line1": "The ",
  "hero.h1.hl": "salary timer",
  "hero.h1.line2": "for every second you work.",
  "hero.lede": "This free salary timer turns your pay into a live counter — per second, per minute, per hour. Type it in once, then watch the number climb through meetings, coffee breaks and that last impossible hour before clock-out.",
  "hero.sticker1.title": "Every second counts",
  "hero.sticker1.sub": "literally — down to the cent",
  "hero.sticker2.title": "Breaks are unpaid",
  "hero.sticker2.sub": "so the timer pauses for them",
  "hero.sticker3.title": "Save for something real",
  "hero.sticker3.sub": "priced in hours, not dollars",

  // Entity definition
  "entity.lede": "It runs entirely in your browser — no account, no install, and your pay figures never leave your device.",

  // SalaryApp — status labels
  "status.working": "On the clock",
  "status.break": "On an unpaid break",
  "status.overtime": "Overtime",
  "status.before": "Shift hasn't started",
  "status.done": "Clocked out",
  "status.dayoff": "Day off",
  "status.preview": "Previewing a shift",

  // SalaryApp — actions
  "action.showNumbers": "👀 Show numbers",
  "action.hideNumbers": "🙈 Hide numbers",
  "action.numbersVisible": "Numbers visible 👀",
  "action.numbersHidden": "Numbers hidden 🙈",
  "action.settle": "📋 Today's settlement",
  "action.setPay": "⚙️ Set my pay",

  // Demo bar
  "demo.text": "👋 This is a demo salary of $78,000/yr. The clock is running so you can see how it feels — 3 questions and it becomes yours.",
  "demo.btn": "Make it mine",

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
  "tick.untilPayday": "Payday in",
  "tick.daysLeft": "{n} days",
  "tick.dayLeft": "{n} day",
  "tick.paydayToday": "Payday today!",
  "tick.shiftDone": "Shift done",

  // Countdown labels
  "cd.nextShift": "Next shift",
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

  // Savings jar
  "jar.title": "🏺 Savings jar",
  "jar.hint": "Saving {rate}% of everything you earn",
  "jar.goal": "Goal",
  "jar.leftToGo": "Left to go",
  "jar.goalReached": "Goal reached 🎉",
  "jar.progress": "{pct}% there — keep going 🐷",

  // Wishlist
  "wish.title": "🎁 Wishlist",
  "wish.hint": "Every price, in hours of your life",
  "wish.empty": "Nothing yet — add something you are saving for.",
  "wish.placeholder": "Concert ticket",
  "wish.unit.price": "{sym} price",
  "wish.unit.hours": "hours",
  "wish.preview.typeHours": "type hours, e.g. 10",
  "wish.preview.typePrice": "type a price, e.g. 120",
  "wish.preview.setPay": "set your pay first",
  "wish.preview.hoursOfWork": "h of work",
  "wish.emojiHint": "Tap an emoji to change it",
  "wish.added": "Added to your wishlist",
  "wish.nameNumber": "Name and a number, please",
  "wish.setPayFirst": "Set your pay first — hours need an hourly rate",
  "wish.nothing": "That works out to nothing — try a bigger number",
  "wish.emojiChange": "Change emoji",
  "wish.emojiAuto": "auto",
  "wish.preset.coffee": "Morning coffee",
  "wish.preset.lunch": "Lunch",
  "wish.preset.rent": "Monthly rent",
  "wish.preset.phone": "Phone bill",
  "wish.preset.gym": "Gym membership",
  "wish.preset.trip": "Weekend trip",

  // This month
  "month.title": "💸 This month, honestly",
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
  "qs.step2.title": "How many hours is that?",
  "qs.step2.sub": "Choose your paid hours and working days to see what each hour is really worth.",
  "qs.step2.daysWeek": "Days a week",
  "qs.step2.hoursDay": "Paid hours a day",
  "qs.step2.fact": "That is {hours} paid hours a year — and {rate} an hour.",
  "qs.step3.title": "What are you saving for?",
  "qs.step3.sub": "We will put {rate}% of everything you earn toward it.",
  "qs.step3.goalUnit": "goal",
  "qs.step3.factHours": "That is {hours} hours of your working life",
  "qs.step3.factWeeks": "— about {weeks} weeks at {rate}% of your pay.",
  "qs.step3.addPay": "Add your pay first to see this in hours.",
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
  "qs.savingsGoal": "Savings goal",

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
  "panel.jar": "Savings jar",
  "panel.jarGoal": "Goal",
  "panel.saveRate": "Save {r}%",
  "panel.jarHelp": "The jar fills from your earnings at this rate.",
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
  "toast.addedWish": "Added to your wishlist",
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
  "pain.eyebrow": "The problem",
  "pain.h2": "Why a salary timer helps",
  "pain.lede": "You work 160 hours a month and feel about four of them. A salary timer exists because a monthly salary hides the hourly trade you make all day. Here's what that costs you — and why watching a live counter changes how a working day feels.",
  "pain.1.title": "Payday amnesia — one number, once a month",
  "pain.1.body": "Thirty days of effort arrive as one number in your bank app, already spoken for by rent. The work itself never feels like it added up to anything.",
  "pain.2.title": "The 3pm slump — the clock moves, pay doesn't",
  "pain.2.body": "Three hours left and no way to feel progress. The clock moves, the counter doesn't — so the afternoon just feels like a long grey nothing.",
  "pain.3.title": "\u201cCan we grab 15 minutes?\u201d — that half hour isn't free",
  "pain.3.body": "Meetings are free at the moment you accept them. You only find out what that half hour cost when the month is over and nothing moved.",
  "pain.4.title": "Overtime that vanishes — extra hours, no trace",
  "pain.4.body": "Four extra evenings, one slightly bigger payslip, zero sense of which hours produced it. Extra effort disappears into the average.",
  "pain.5.title": "Savings are abstract — hours are not",
  "pain.5.body": "\u201cSave $2,000\u201d is a number with no weight. \u201c74 hours of my life\u201d is something you can actually decide about.",
  "pain.6.title": "You don't know your real rate — 2,080 is a fiction",
  "pain.6.body": "Salary ÷ 2,080 is not your hourly rate if you work 47 hours a week and answer Slack on Sundays. Most people are paid less per hour than they think.",

  // Features
  "feat.eyebrow": "What's inside",
  "feat.h2": "What the salary timer handles",
  "feat.lede": "Most salary calculators assume a tidy 9-to-5. Real jobs have unpaid lunch breaks, rotating shifts, holiday schedules, tips, overtime and days you'd rather forget. This free salary timer handles all of it — see also how salary timers work.",
  "feat.1.title": "A live counter, down to the second",
  "feat.1.body": "Your salary per second is calculated from your actual schedule — not a generic 2,080-hour year. The number updates continuously while you're on paid time, so a two-hour meeting has a visible price and the last hour of a shift has a visible finish line.",
  "feat.2.title": "Schedules for real jobs, not brochures",
  "feat.2.body": "Five-day week, four-day week, six-day week, or pick your own days. Add public holidays and one-off days off. If you work nights, set a shift that crosses midnight — the timer follows it. Your hourly rate is recalculated the moment your schedule changes, because a 4-day week pays a very different hourly rate than a 5-day one.",
  "feat.3.title": "Unpaid breaks, handled honestly",
  "feat.3.body": "Add as many breaks as your day really has: lunch, the school run, the gym, the 20 minutes you spend making coffee. The counter freezes during them. No fake numbers, no pretending your lunch break is billable.",
  "feat.4.title": "Overtime, tips and bonuses",
  "feat.4.body": "After clock-out the timer can keep running at 1.25×, 1.5× or 2×, so late evenings are worth something visible. Tips, commission and one-off bonuses can be added in a tap and roll straight into your month total.",
  "feat.5.title": "Payday countdown & a savings jar",
  "feat.5.body": "Set your payday and the site tells you how many days, hours and shifts are left. Then pick a savings rate and watch a little jar fill with every paid second — the only savings account that fills while you're sitting in a meeting.",
  "feat.6.title": "A wishlist priced in hours",
  "feat.6.body": "Add the things you're actually saving for. Every item shows its price in hours of your life, and a progress bar fills as you earn. \u201c$120 concert ticket\u201d becomes \u201c3.5 hours\u201d — which is a completely different decision.",
  "feat.7.title": "Privacy mode for open offices",
  "feat.7.body": "One tap blurs every number on screen. Handy when you're on a train, in a shared desk, or showing a colleague the timer without showing them your salary.",
  "feat.mock.earnedToday": "Earned today",
  "feat.mock.yourWeek": "Your week",
  "feat.mock.shift": "Shift",
  "feat.mock.unpaidBreak": "Unpaid break",
  "feat.mock.today": "Today",
  "feat.mock.overtime": "Overtime",
  "feat.mock.paydayIn": "Payday in",
  "feat.mock.jar": "Jar",
  "feat.mock.thisWeek": "This week",
  "feat.mock.wishlist": "Wishlist",
  "feat.mock.tips": "Tips added",
  "feat.mock.paidTime": "Paid time",
  "feat.mock.paused": "paused",

  // Personas
  "persona.eyebrow": "Who it's for",
  "persona.h2": "Who the salary timer is for",
  "persona.lede": "Built for anyone whose time has a price. If you're paid for hours — any hours, in any arrangement — this was made for you. Shift workers can jump to the shift worker salary timer, or read the shift work guide first.",
  "persona.1.title": "Nurses & shift workers",
  "persona.1.body": "Twelve-hour shifts, rotating patterns, night differentials. Set the shift once and the timer follows your rota.",
  "persona.2.title": "Retail & hospitality",
  "persona.2.body": "Variable hours, tips, split shifts. Watch a Sunday shift turn into a number you can actually plan with.",
  "persona.3.title": "Salaried 9-to-5ers",
  "persona.3.body": "The classic case: a fixed salary, a fixed schedule, and no idea what an hour of your life is worth.",
  "persona.4.title": "Freelancers & contractors",
  "persona.4.body": "Know your true hourly rate before you quote. Add unpaid admin time and the real number gets honest fast.",
  "persona.5.title": "Remote & hybrid workers",
  "persona.5.body": "When work and home blur, a visible counter draws the line back at 5:30.",
  "persona.6.title": "Students & part-timers",
  "persona.6.body": "Four hours after class, one visible total. Suddenly a shift is worth more than \u201ca bit of cash\u201d.",

  // Scenarios
  "scn.eyebrow": "In real life",
  "scn.h2": "When a salary timer changes a decision",
  "scn.lede": "Four situations where seeing the number changes what you decide. Each one is a choice you can only price while you still have the option to turn it down — and pricing it is what the salary timer does.",
  "scn.1.title": "2:47pm, the meeting has no end",
  "scn.1.body": "You glance at the tab: $96.20 earned, 42% of the shift gone. The meeting isn't more bearable — but it's finally measurable. You leave on time, because you can see what staying costs.",
  "scn.2.title": "\u201cCan you cover Saturday?\u201d",
  "scn.2.body": "Instead of guessing, you check the real rate: an eight-hour Saturday at 1.5× is worth $415. Now it's a decision about a weekend, not a vague favour.",
  "scn.3.title": "The $1,800 trip",
  "scn.3.body": "The wishlist turns it into 52 hours. Four working days. Somehow that's easier to commit to than a number on a savings app — and the jar fills every single shift.",
  "scn.4.title": "Two job offers",
  "scn.4.body": "$62k with a 45-minute commute versus $58k from your spare room. Run both through the timer with real hours. The higher salary is often the lower rate.",
  "scn.quote": "\u201cI used to think my salary was fine. Then I worked out it was $19.40 an hour after the commute, the unpaid lunch and the 47-hour weeks. I asked for a raise two weeks later.\u201d",
  "scn.quoteWho": "— the moment most people have around day three",

  // How it works
  "how.eyebrow": "How it works",
  "how.h2": "How to set up the salary timer",
  "how.lede": "Twenty seconds to set up, then it just runs. Three steps, no account.",
  "how.1.title": "Tell it what you earn",
  "how.1.body": "Yearly, monthly or hourly — whichever you actually know. Pick your currency. That's the only number it needs.",
  "how.2.title": "Tell it when you work",
  "how.2.body": "Working days, start and finish times, unpaid breaks, holidays. Add overtime rules if you get them.",
  "how.3.title": "Watch, and go back to work",
  "how.3.body": "The counter runs only during paid time. Leave the tab open, or check in at lunch — it's always mid-sentence.",

  // FAQ
  "faq.eyebrow": "Questions",
  "faq.h2": "Salary timer FAQ",
  "faq.lede": "Short answers, no small print.",

  // CTA band
  "cta.h2": "Start the free salary timer",
  "cta.body": "Your next hour is already worth something. Set it up once and watch it — it takes twenty seconds, costs nothing, and you'll never look at 4:45pm the same way.",
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
  "hero.h1.line1": "为你的每一秒",
  "hero.h1.hl": "工作时间",
  "hero.h1.line2": "实时计薪。",
  "hero.lede": "免费的薪资计时器，把你的收入变成一个实时跳动的数字——每秒、每分、每小时。输入一次，然后看着数字在开会、喝咖啡和下班前那最漫长的最后一小时里不断攀升。",
  "hero.sticker1.title": "每一秒都算数",
  "hero.sticker1.sub": "精确到分",
  "hero.sticker2.title": "休息不计薪",
  "hero.sticker2.sub": "计时器会自动暂停",
  "hero.sticker3.title": "为真实目标存钱",
  "hero.sticker3.sub": "用工作小时标价，不是用金额",

  // Entity definition
  "entity.lede": "完全在浏览器中运行——无需注册、无需安装，你的薪资数据永远不会离开你的设备。",

  // SalaryApp — status labels
  "status.working": "工作中",
  "status.break": "无薪休息中",
  "status.overtime": "加班中",
  "status.before": "尚未开始",
  "status.done": "已下班",
  "status.dayoff": "休息日",
  "status.preview": "预览模式",

  // SalaryApp — actions
  "action.showNumbers": "👀 显示数字",
  "action.hideNumbers": "🙈 隐藏数字",
  "action.numbersVisible": "数字已显示 👀",
  "action.numbersHidden": "数字已隐藏 🙈",
  "action.settle": "📋 今日结算",
  "action.setPay": "⚙️ 设置薪资",

  // Demo bar
  "demo.text": "👋 这是 $78,000/年 的演示薪资。时钟正在运行，让你感受一下效果——3 个问题就能变成你的专属计时器。",
  "demo.btn": "设为我的",

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
  "tick.untilPayday": "距发薪日",
  "tick.daysLeft": "{n} 天",
  "tick.dayLeft": "{n} 天",
  "tick.paydayToday": "今天发薪日！",
  "tick.shiftDone": "今日已完成",

  // Countdown labels
  "cd.nextShift": "下次上班",
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

  // Savings jar
  "jar.title": "🏺 存钱罐",
  "jar.hint": "将你收入的 {rate}% 存入",
  "jar.goal": "目标",
  "jar.leftToGo": "还差",
  "jar.goalReached": "目标达成 🎉",
  "jar.progress": "已完成 {pct}%——继续加油 🐷",

  // Wishlist
  "wish.title": "🎁 心愿单",
  "wish.hint": "每个价格，都换算成你的工作时间",
  "wish.empty": "还没有内容——添加一个你在攒钱的目标吧。",
  "wish.placeholder": "演唱会门票",
  "wish.unit.price": "{sym} 价格",
  "wish.unit.hours": "小时",
  "wish.preview.typeHours": "输入小时数，如 10",
  "wish.preview.typePrice": "输入价格，如 120",
  "wish.preview.setPay": "先设置你的薪资",
  "wish.preview.hoursOfWork": "小时工作量",
  "wish.emojiHint": "点击 emoji 更换",
  "wish.added": "已添加到心愿单",
  "wish.nameNumber": "请填写名称和数字",
  "wish.setPayFirst": "先设置薪资——按小时计需要时薪",
  "wish.nothing": "算下来是零——试试更大的数字",
  "wish.emojiChange": "更换 emoji",
  "wish.emojiAuto": "自动",
  "wish.preset.coffee": "晨间咖啡",
  "wish.preset.lunch": "午餐",
  "wish.preset.rent": "每月房租",
  "wish.preset.phone": "话费",
  "wish.preset.gym": "健身会员",
  "wish.preset.trip": "周末旅行",

  // This month
  "month.title": "💸 本月真实收入",
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
  "qs.step2.title": "工作多少小时？",
  "qs.step2.sub": "选择每周工作天数与每日计薪工时，看看一小时实际值多少钱。",
  "qs.step2.daysWeek": "每周工作天数",
  "qs.step2.hoursDay": "每日计薪工时",
  "qs.step2.fact": "全年 {hours} 计薪小时——时薪 {rate}。",
  "qs.step3.title": "你在为什么存钱？",
  "qs.step3.sub": "我们会把你收入的 {rate}% 存入存钱罐。",
  "qs.step3.goalUnit": "目标",
  "qs.step3.factHours": "相当于 {hours} 小时的工作时间",
  "qs.step3.factWeeks": "——按收入的 {rate}% 存，大约 {weeks} 周。",
  "qs.step3.addPay": "先设置薪资才能看到换算结果。",
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
  "qs.savingsGoal": "存钱目标",

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
  "panel.jar": "存钱罐",
  "panel.jarGoal": "目标",
  "panel.saveRate": "存 {r}%",
  "panel.jarHelp": "存钱罐按此比例从你的收入中填充。",
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
  "toast.addedWish": "已添加到心愿单",
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
  "pain.eyebrow": "问题所在",
  "pain.h2": "为什么需要薪资计时器",
  "pain.lede": "你每月工作 160 小时，却只感受到其中 4 个。薪资计时器之所以存在，是因为月薪制让你看不到日常时间与金钱的交换。以下是这种看不见的代价——以及为什么看着数字跳动会改变一天的感受。",
  "pain.1.title": "发薪日健忘——一个月只有一个数字",
  "pain.1.body": "三十天的努力变成银行 App 里的一个数字，还没到手就被房租划走了。工作本身从未让人觉得累积成了什么。",
  "pain.2.title": "下午三点的低潮——时间在走，薪资不动",
  "pain.2.body": "还剩三小时，却感受不到任何进展。时钟在走，计薪器不动——于是整个下午就成了一段漫长的灰色空白。",
  "pain.3.title": "\u201c能耽误你 15 分钟吗？\u201d——那半小时不是免费的",
  "pain.3.body": "会议在你接受的那一刻是免费的。你只有在月底才发现那半小时的代价——而那时什么都改变不了了。",
  "pain.4.title": "消失的加班——额外工时，无影无踪",
  "pain.4.body": "四个额外的晚上，一张稍微大一点的工资条，完全分不清是哪些小时产生了那点差额。额外的努力消失在了平均数里。",
  "pain.5.title": "存钱是抽象的——工时不是",
  "pain.5.body": "\u201c存 $2,000\u201d是一个没有重量的数字。\u201c我生命的 74 小时\u201d才是你能真正做决定的东西。",
  "pain.6.title": "你不知道真实时薪——2,080 小时是个谎言",
  "pain.6.body": "年薪 ÷ 2,080 不是你的真实时薪，如果你每周工作 47 小时还在周日回消息的话。大多数人的时薪比他们以为的要低。",

  // Features
  "feat.eyebrow": "功能一览",
  "feat.h2": "计时器能做什么",
  "feat.lede": "大多数薪资计算器假设一个标准的朝九晚五。真正的工作有无薪午休、轮班制、假期安排、小费、加班和那些你宁愿忘掉的日子。这个免费的薪资计时器全都能处理——还可以了解计时器的工作原理。",
  "feat.1.title": "实时计数器，精确到秒",
  "feat.1.body": "你的每秒收入是根据实际排班计算的——不是通用的 2,080 小时。数字在你计薪期间持续更新，所以两小时的会议有了可见的价格，最后一小时也有了可见的终点线。",
  "feat.2.title": "为真实工作排班，不是宣传册上的",
  "feat.2.body": "五天工作制、四天、六天，或者自选天数。如果上夜班，可以设置跨午夜的班次——计时器会跟随。排班一改，时薪立刻重算，因为四天工作制和五天工作制的时薪差很多。",
  "feat.3.title": "无薪休息，诚实处理",
  "feat.3.body": "添加你一天里真正的休息时段：午餐、接送孩子、健身、泡咖啡的 20 分钟。计时器在休息期间冻结。没有虚假数字，不假装午休也算薪。",
  "feat.4.title": "加班、小费和奖金",
  "feat.4.body": "下班后计时器可以按 1.25 倍、1.5 倍或 2 倍继续运行，让加班有了可见的价值。小费、提成和一次性奖金一键添加，直接滚入本月总额。",
  "feat.5.title": "发薪日倒计时和存钱罐",
  "feat.5.body": "设置发薪日后，网站会告诉你还剩几天、几小时、几个班次。然后选择存钱比例，看着小罐子随着每一秒计薪而装满——唯一一个你坐在开会时也在攒钱的储蓄账户。",
  "feat.6.title": "以工时标价的心愿单",
  "feat.6.body": "添加你真正在攒钱的目标。每件物品都显示其价格换算成你的工作小时数，进度条随收入增长而填充。\u201c$120 演唱会门票\u201d变成\u201c3.5 小时\u201d——完全不同的决策。",
  "feat.7.title": "隐私模式",
  "feat.7.body": "一键模糊屏幕上所有数字。在火车上、共享工位、或者给同事看计时器但不暴露薪资时非常有用。",
  "feat.mock.earnedToday": "今日已赚",
  "feat.mock.yourWeek": "你的工作周",
  "feat.mock.shift": "班次",
  "feat.mock.unpaidBreak": "无薪休息",
  "feat.mock.today": "今日",
  "feat.mock.overtime": "加班",
  "feat.mock.paydayIn": "距发薪日",
  "feat.mock.jar": "存钱罐",
  "feat.mock.thisWeek": "本周",
  "feat.mock.wishlist": "心愿单",
  "feat.mock.tips": "小费",
  "feat.mock.paidTime": "计薪工时",
  "feat.mock.paused": "暂停",

  // Personas
  "persona.eyebrow": "适用人群",
  "persona.h2": "谁在用这个计时器",
  "persona.lede": "为所有时间有价格的人而做。如果你按小时拿钱——任何小时，任何形式——这就是为你做的。轮班工作者可以直接用轮班薪资计时器，或者先读轮班工作指南。",
  "persona.1.title": "护士和轮班工作者",
  "persona.1.body": "12 小时班次、轮班排表、夜班补贴。设置一次班次，计时器跟随你的排班走。",
  "persona.2.title": "零售和餐饮",
  "persona.2.body": "工时不固定、有小费、分段班。看着一个周日班次变成一个你能规划的数字。",
  "persona.3.title": "朝九晚五上班族",
  "persona.3.body": "最典型的情况：固定薪资、固定排班，却完全不知道自己一小时的人生值多少钱。",
  "persona.4.title": "自由职业者和外包",
  "persona.4.body": "报价前先知道真实时薪。加上无薪的行政时间，真实数字会很快变得坦诚。",
  "persona.5.title": "远程和混合办公",
  "persona.5.body": "当工作和生活的界限模糊时，一个可见的计薪器帮你在 5:30 把线画回来。",
  "persona.6.title": "学生和兼职",
  "persona.6.body": "课后四小时，一个可见的总额。突然一个班次就不只是\u201c一点零花钱\u201d了。",

  // Scenarios
  "scn.eyebrow": "真实场景",
  "scn.h2": "计薪器改变决定的瞬间",
  "scn.lede": "四个看到数字就改变决定的场景。每个都是你只有在还有机会拒绝时才能定价的选择——而定价正是计薪器做的事。",
  "scn.1.title": "下午 2:47，会议没有尽头",
  "scn.1.body": "你瞥一眼标签页：已赚 $96.20，班次完成 42%。会议并没有变得更可忍受——但终于可以被量化了。你准时下班，因为你看到了留下的代价。",
  "scn.2.title": "\u201c周六能顶个班吗？\u201d",
  "scn.2.body": "不用猜了——查一下真实时薪：周六八小时按 1.5 倍算是 $415。现在这是一个关于周末的决定，不是一个模糊的人情。",
  "scn.3.title": "那次 $1,800 的旅行",
  "scn.3.body": "心愿单把它变成 52 小时。四个工作日。不知为何这比储蓄 App 上的一个数字更容易下定决心——而存钱罐在每个班次都在填充。",
  "scn.4.title": "两个 offer",
  "scn.4.body": "$62k 加 45 分钟通勤 vs $58k 在家办公。两个都用真实工时跑一遍计时器。高薪的那个往往是更低的时薪。",
  "scn.quote": "\u201c我一直觉得薪资还行。后来算出来在加上通勤、无薪午休和每周 47 小时之后，时薪只有 $19.40。两周后我就提了加薪。\u201d",
  "scn.quoteWho": "——大多数人在第三天左右会有的顿悟",

  // How it works
  "how.eyebrow": "使用方法",
  "how.h2": "如何设置计时器",
  "how.lede": "20 秒设置，然后就一直跑着。三步搞定，无需注册。",
  "how.1.title": "告诉它你的收入",
  "how.1.body": "按年、按月或按小时——哪个你知道就用哪个。选好货币。这是它需要的唯一数字。",
  "how.2.title": "告诉它你的工作时间",
  "how.2.body": "工作日、上下班时间、无薪休息、假期。如果有加班规则也加上。",
  "how.3.title": "看着它跑，然后回去工作",
  "how.3.body": "计时器只在计薪期间运行。开着标签页，或午休时回来看一眼——它总是半句话的状态。",

  // FAQ
  "faq.eyebrow": "常见问题",
  "faq.h2": "薪资计时器常见问题",
  "faq.lede": "简短回答，没有废话。",

  // CTA band
  "cta.h2": "开始使用免费计薪器",
  "cta.body": "你的下一个小时已经有价值了。设置一次然后看着它跑——只需 20 秒，不花一分钱，你会永远改变对下午 4:45 的看法。",
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
