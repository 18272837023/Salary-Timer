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
    "q": "What is a salary timer?",
    "a": "A salary timer is a live earnings counter. Enter your pay and working schedule to see estimated gross earnings for elapsed paid time, along with your rates per second, minute and hour."
  },
  {
    "q": "Does the counter run outside my working hours?",
    "a": "The counter follows your saved schedule. It pauses during configured unpaid breaks and does not add regular earnings before or after the shift. Enabling overtime lets it count after the scheduled shift end at your chosen multiplier."
  },
  {
    "q": "Should I add paid lunch or coffee breaks?",
    "a": "Only enter unpaid breaks in the break settings. A paid break remains part of paid working time, so leave it out of that list. The timer cannot determine whether your employer pays for a break."
  },
  {
    "q": "Can I keep the salary timer visible while using other apps?",
    "a": "Supported desktop browsers can open Desktop live earnings as a floating window. Keep the original tab open: closing it closes the floating window. Other browsers can use the timer in the webpage."
  },
  {
    "q": "Does it handle night shifts and rotating schedules?",
    "a": "A shift can cross midnight, with unpaid breaks inside that shift. The timer repeats the working days you select each week. When a rotating rota changes, update those days and times manually; it does not generate a rotating calendar or apply holiday dates automatically."
  },
  {
    "q": "Is this my take-home pay or a payroll record?",
    "a": "No. This is a gross-pay estimate based on your inputs. It does not calculate taxes, deductions, payroll rounding or statutory overtime eligibility. It does not record client billing sessions or generate invoices. Check your payslip or payroll records for actual pay."
  },
  {
    "q": "Where are my salary settings stored?",
    "a": "Your pay settings are saved in this browser’s local storage and calculations run on your device. They do not sync between devices. Google Analytics records page views and usage events, not your entered salary figures. Privacy mode blurs numbers on screen."
  },
  {
    "q": "Do I need an account or an installed app?",
    "a": "No account or installation is required. You can use the webpage on a phone, tablet or computer. Settings remain in the same browser for your next visit unless you clear its stored data; private browsing may discard them when the session ends."
  }
];

export const HOME_FAQ_ZH: FaqItem[] = [
  {
    "q": "什么是薪资计时器？",
    "a": "薪资计时器是一种实时收入计数器。输入薪资与排班，便可查看已过去计薪时间对应的税前收入估算，以及每秒、每分钟和每小时的收入。"
  },
  {
    "q": "工作时间之外也会计薪吗？",
    "a": "计时器按保存的排班运行，在设置的无薪休息期间暂停，上班前和下班后不继续累计普通工时收入。开启加班后，会按所选倍率估算排班结束后的收入。"
  },
  {
    "q": "带薪午休或茶歇需要填写吗？",
    "a": "休息设置只填写无薪时段。带薪休息属于计薪时间，无需加入该列表。计时器无法判断雇主是否为某个休息时段支付工资。"
  },
  {
    "q": "使用其他应用时还能看到实时计薪吗？",
    "a": "支持的桌面浏览器可通过“桌面实时计薪”打开悬浮窗。请保留原标签页，关闭它会同时关闭悬浮窗。其他浏览器可继续使用网页中的计薪器。"
  },
  {
    "q": "支持夜班和轮班吗？",
    "a": "支持跨午夜班次及班次内的无薪休息。计时器每周重复你选择的工作日；轮班变化后需手动更新工作日和时间，不自动生成循环轮班表或应用节假日日期。"
  },
  {
    "q": "这些数字是到手工资或工资记录吗？",
    "a": "这些数字是按输入计算的税前收入估算，不计算税费、扣款、工资结算舍入或法定加班资格，也不记录客户计费会话或生成发票。实际薪资请核对工资单或工资记录。"
  },
  {
    "q": "薪资设置保存在哪里？",
    "a": "薪资设置保存在当前浏览器的本地存储中，计算在本机完成，不会跨设备同步。Google Analytics记录页面浏览和使用事件，不记录输入的薪资金额。隐私模式可以模糊屏幕上的数字。"
  },
  {
    "q": "需要注册或安装应用吗？",
    "a": "无需注册或安装，可在手机、平板和电脑的浏览器中使用。除非清除本地数据，设置会在同一浏览器中保留供下次访问使用；隐私浏览可能在会话结束时删除这些设置。"
  }
];
