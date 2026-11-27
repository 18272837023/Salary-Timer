import type { Lang } from "@/lib/i18n";
import { Link } from "@/components/SmartLink";

export function HomeCalculation({ lang }: { lang: Lang }) {
  const zh = lang === "zh";
  return <section className="section tight" id="calculation">
    <div className="wrap">
      <h2>{zh ? "实时收入如何计算" : "How your live earnings are calculated"}</h2>
      <p className="sec-lede">{zh
        ? "时薪模式直接使用输入的费率。年薪除以每周计薪工时 × 52；月薪先乘以12，再按相同方法换算；日薪除以每天计薪工时。无薪休息只扣除一次。"
        : "Hourly mode uses your entered rate. Annual pay is divided by scheduled paid hours per week × 52. Monthly pay is multiplied by 12 before that conversion; daily pay is divided by paid hours per day. Unpaid breaks are deducted once."}</p>
      {!zh && <p className="sec-lede">
        Want to check your hourly rate first? Use our <Link href="/hourly-rate-calculator/">hourly rate calculator</Link> with your salary and paid working hours. For the smallest unit, the <Link href="/pay-per-second-calculator/">pay per second calculator</Link> turns the same rate into seconds, minutes and a workday.
      </p>}
      <div className="table-wrap">
        <table>
          <caption>{zh ? "示例：每小时30美元，不含加班" : "Example: $30 per paid hour, without overtime"}</caption>
          <thead><tr><th scope="col">{zh ? "时间单位" : "Time unit"}</th><th scope="col">{zh ? "计算" : "Calculation"}</th><th scope="col">{zh ? "税前收入" : "Gross earnings"}</th></tr></thead>
          <tbody>
            <tr><th scope="row">{zh ? "每秒" : "Per second"}</th><td>$30 ÷ 3,600</td><td>≈ $0.00833</td></tr>
            <tr><th scope="row">{zh ? "每分钟" : "Per minute"}</th><td>$30 ÷ 60</td><td>$0.50</td></tr>
            <tr><th scope="row">{zh ? "2个计薪小时" : "2 paid hours"}</th><td>$30 × 2</td><td>$60.00</td></tr>
          </tbody>
        </table>
      </div>
      <p className="sec-lede">{zh
        ? "今日收入按排班中已过去的计薪时间估算。它不计算税费、扣款或具体休假日期；排班变化需要手动更新。"
        : "Today’s total estimates pay for elapsed paid time in your saved schedule. It excludes taxes, deductions and individual leave dates; update your settings when your schedule changes."}</p>

    </div>
  </section>;
}
