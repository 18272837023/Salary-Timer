/**
 * Homepage FAQ copy, kept in a framework-free module on purpose.
 *
 * `components/sections.tsx` is a Client Component while `HomeContent.tsx` is a
 * Server Component. A Server Component importing a *value* from a Client
 * Component module receives a client-reference proxy instead of the array, so
 * the FAQ data has to live here where both sides get the real thing.
 */

export interface FaqItem {
  q: string;
  a: string;
}

export const HOME_FAQ: FaqItem[] = [
  {
    q: "What exactly is a salary timer?",
    a: "A salary timer is a live counter that converts your working time into money as it passes. Instead of calculating what you earned at the end of a month, it shows the number moving in real time — so you can see the value of an hour, a meeting, or an extra shift while it's happening.",
  },
  {
    q: "How does it calculate my salary per second?",
    a: "It takes your pay, converts it to an hourly rate using your real schedule (paid hours per day × working days × 52), then divides by 3,600. That per-second figure is added only while you're inside a paid window of your shift — never during breaks, before you start, or after you clock out (unless you've turned on overtime).",
  },
  {
    q: "How do I work out my hourly rate from an annual salary?",
    a: "The common shortcut is salary ÷ 2,080, which assumes 40 hours a week, 52 weeks a year. It's wrong for almost everyone. This site does the honest version: your actual paid hours per day, minus unpaid breaks, times the number of days you actually work, times 52. Work a 4-day week and your hourly rate jumps; work 50-hour weeks and it drops.",
  },
  {
    q: "Does it count my lunch break as paid time?",
    a: "No — and that's deliberate. Any break you add is treated as unpaid, and the counter freezes while you're on it. If your lunch is genuinely paid, just don't add it as a break and the timer will keep running through it.",
  },
  {
    q: "Can I use it if I'm paid hourly instead of a salary?",
    a: "Yes, and it's the most accurate mode. Switch the pay type to hourly and the timer uses your rate directly — no annual-hours estimation involved. It's ideal for retail, hospitality, warehouse, agency and gig work.",
  },
  {
    q: "Does it handle overtime and shift work?",
    a: "Yes. Turn on overtime and the timer keeps counting after your shift ends at 1.25×, 1.5× or 2×, whichever matches your contract. Shifts that cross midnight are supported, so night shifts work correctly. Rotating patterns are handled by changing your working days.",
  },
  {
    q: "Is my salary data private?",
    a: "Your pay figures never leave your device. Everything is calculated in your browser and saved to your own device's local storage — there's no account and no server holding your numbers. We do count page views with Google Analytics so we know which pages are worth keeping, but that records the page you visited, never what you earn. Privacy mode blurs the figures on screen when someone's looking over your shoulder.",
  },
  {
    q: "Do I need to install an app or create an account?",
    a: "No. It's a website — open it, use it, close the tab. Your settings stay saved on that device for next time. It works on phones, tablets and desktops, and it keeps working offline once loaded.",
  },
  {
    q: "Is a salary timer accurate enough to rely on?",
    a: "For tracking and motivation, yes. It's a gross-pay estimate: it doesn't model tax, pension contributions, deductions or pay-period rounding, so treat it as \"what I earned before deductions\" rather than \"what will hit my bank\". Many people find the pre-tax number more motivating anyway.",
  },
  {
    q: "Can freelancers use it for billing?",
    a: "Yes — set an hourly rate and use the timer as a live session tracker. It won't produce invoices, but it will show you what a task is really worth, including the unpaid admin around it. Many freelancers use it to sanity-check quotes before sending them.",
  },
  {
    q: "Why does watching money tick up actually help?",
    a: "Because abstract rewards don't motivate behaviour; visible ones do. A salary arrives once a month, far from the effort that produced it. A counter that moves every second shortens that gap — which is why people report leaving on time more often, saying no to unpaid extras, and negotiating harder after a week of watching.",
  },
];

/** Chinese FAQ for /zh — same order and intent as HOME_FAQ. */
export const HOME_FAQ_ZH: FaqItem[] = [
  {
    q: "什么是薪资计时器？",
    a: "薪资计时器是一个实时计数器，把你正在流逝的工作时间换算成钱。它不是在月底才算出你赚了多少，而是让数字实时跳动——让你在一小时、一场会议、一次加班正在发生时，就看见它的价值。",
  },
  {
    q: "它怎么算我每秒赚多少钱？",
    a: "它先按你的真实排班把收入换算成时薪（每日计薪工时 × 每周工作日 × 52），再除以 3,600。这个每秒数字只在你处于班次的计薪时间段内累加——休息、上班前、下班后都不算（除非你打开了加班）。",
  },
  {
    q: "年薪怎么换算成真实时薪？",
    a: "常见的捷径是年薪 ÷ 2,080，它假设每周 40 小时、每年 52 周，对几乎所有人都不准。这里用的是诚实的算法：每天实际计薪工时减去无薪休息，乘以每周实际工作天数，再乘以 52。上四天班，时薪会变高；每周干 50 小时，时薪会变低。",
  },
  {
    q: "午休会被算成计薪时间吗？",
    a: "不会，这是刻意的。你添加的休息时段都按无薪处理，计时器在这段时间冻结。如果你的午休确实是带薪的，不要把它加进休息时段，计时器就会继续走。",
  },
  {
    q: "我拿时薪而不是年薪，能用吗？",
    a: "能，而且这是最准确的模式。把薪资类型切成「时薪」，计时器直接采用你的时薪，不需要按年工时估算。适合零售、餐饮、仓储、外包和零工。",
  },
  {
    q: "支持加班和轮班吗？",
    a: "支持。打开加班后，计时器会在班次结束后按 1.25 倍、1.5 倍或 2 倍继续计薪，与你合同里的倍率对应。跨午夜的班次也能正确处理，所以夜班没问题；轮班表通过修改工作日来实现。",
  },
  {
    q: "我的薪资数据安全吗？",
    a: "你的薪资数字永远不会离开设备。所有计算都在浏览器里完成，只保存在你自己设备的本地存储中——没有账号，也没有服务器保存你的数字。我们会用 Google Analytics 统计页面浏览量，以便判断哪些页面值得保留，但它只记录你访问了哪个页面，从不记录你赚多少。隐私模式可以在有人路过时模糊屏幕上的所有数字。",
  },
  {
    q: "需要下载 App 或注册账号吗？",
    a: "不需要。它就是一个网页——打开就用，用完关掉标签页。设置会保存在这台设备上，下次打开自动恢复。手机、平板、电脑都能用，加载过一次之后断网也能继续运行。",
  },
  {
    q: "计薪器的结果够准、能当依据吗？",
    a: "用来追踪和激励，够准。它是税前估算：不计算税金、社保、扣款和发薪周期的四舍五入，所以请把它理解成「我税前赚了多少」，而不是「到账会有多少」。很多人反而觉得税前数字更有动力。",
  },
  {
    q: "自由职业者能拿它来计费吗？",
    a: "可以——设置时薪，把计时器当成实时的工时记录器。它不会生成发票，但会告诉你一项任务真正值多少钱，包括周围那些无薪的行政时间。很多自由职业者用它来在报价前核对一遍。",
  },
  {
    q: "为什么看着数字跳动真的有用？",
    a: "因为抽象的奖励改变不了行为，看得见的奖励可以。工资一个月才来一次，离产生它的努力很远。每秒都在跳的计数器缩短了这个距离——这也是为什么很多人用了一周之后，更常准时下班、更敢拒绝无薪的额外工作、也更愿意去谈加薪。",
  },
];
