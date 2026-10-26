import { Link } from "@/components/SmartLink";
import { LEARN, TOOLS } from "@/lib/site";

const YEAR = 2026;

export function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <Link className="brand" href="/" style={{ marginBottom: 10 }}>
              <span className="mark">$</span> Salary Timer
            </Link>
            <p
              style={{
                fontSize: 13.5,
                color: "var(--muted)",
                fontWeight: 600,
                maxWidth: 260,
                marginTop: 8,
              }}
            >
              A free live counter for your working hours. Built for people who&apos;d rather see the
              number than wait for the payslip.
            </p>
          </div>

          <div>
            <h5>Free tools</h5>
            <ul>
              {TOOLS.map((tool) => (
                <li key={tool.href}>
                  <Link href={tool.href}>{tool.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5>Learn</h5>
            <ul>
              {LEARN.map((article) => (
                <li key={article.href}>
                  <Link href={article.href}>{article.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5>About</h5>
            <ul>
              <li>
                <Link href="/#how">How a salary timer works</Link>
              </li>
              <li>
                <Link href="/#faq">Is my salary data private?</Link>
              </li>
              <li>
                <Link href="/#faq">Salary timer FAQ</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="foot-bottom">
          <span>© {YEAR} Salary Timer. Estimates only — not financial or tax advice.</span>
          <span>Made with 🪙 for people who count the hours.</span>
        </div>
      </div>
    </footer>
  );
}
