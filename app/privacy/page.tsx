import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { LegalPage } from "@/components/LegalPage";
import { CONTACT_EMAIL, LEGAL_PAGES, SITE_NAME } from "@/lib/site";

const page = LEGAL_PAGES.find((p) => p.href === "/privacy")!;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: { canonical: page.href },
  openGraph: {
    title: page.title,
    description: page.description,
    url: page.href,
  },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      page={page}
      h1={
        <>
          Privacy <span className="hl">Policy</span>.
        </>
      }
      lede={`${SITE_NAME} calculates your earnings in your own browser. There is no account, no server-side database and no upload of your pay figures. This page states exactly what is stored on your device and what our one analytics provider sees.`}
    >
      <section>
        <h2>The short version</h2>
        <p>
          Your salary settings stay on your device. We run Google Analytics 4 to count page views
          and a small set of interaction events, and that service may set cookies. We do not run
          ads, build advertising profiles, sell data, or ask you to identify yourself. Blocking
          analytics does not break the timer.
        </p>
        <p>
          This policy applies to {SITE_NAME} and every page on this domain, including the guides
          in Learn and the <Link href="/">free live salary timer</Link> on the homepage.
        </p>
      </section>

      <section>
        <h2>What stays on your device</h2>
        <p>
          When you change a setting, your browser saves it to <code>localStorage</code> under the
          key <code>salarytimer.site.v2</code>. That record can contain: your pay amount (stored as
          an integer in the smallest unit of your chosen currency), currency, working days, shift
          start and end times, unpaid breaks, payday date, overtime multiplier, extra income entries
          you add, and interface flags such as privacy mode and whether you completed the setup
          wizard. A version number is included so a future release can migrate older settings safely.
        </p>
        <p>
          A separate <code>sessionStorage</code> flag, <code>st.qs.skip</code>, remembers that you
          dismissed the setup wizard in this tab. It disappears when the tab closes.
        </p>
        <ul className="checks">
          <li>
            <strong>None of it is uploaded.</strong> The timer reads these values locally, computes
            a gross figure in JavaScript, and paints it on screen. There is no API call carrying
            your settings.
          </li>
          <li>
            <strong>You can delete it.</strong> Clearing site data for this domain in your browser,
            or using the reset control in the app, removes the saved settings.
          </li>
          <li>
            <strong>Some browsers refuse storage.</strong> Private-browsing modes may block it
            entirely; the timer still runs for that session but remembers nothing afterwards.
          </li>
        </ul>
        <p>
          The arithmetic behind that local calculation is documented in our guide to{" "}
          <Link href="/learn/how-salary-timers-work">
            how a salary timer turns your schedule into a live counter
          </Link>
          .
        </p>
      </section>

      <section>
        <h2>What Google Analytics collects</h2>
        <p>
          Google Analytics 4 (Google LLC) is the only analytics service on this site. It records a
          page view when you open a page or move between pages, along with the page path, page
          title and referrer, plus the standard browser, device and approximate-region information
          that GA4 derives from the request. GA4 processes IP addresses to derive that region but
          does not make raw IP addresses available in our reports.
        </p>
        <p>
          We also send a few interaction events so we can tell which parts of the tool are worth
          keeping. Here is the complete list — including the numeric parameters, rather than hiding
          them behind &ldquo;anonymous usage data&rdquo;:
        </p>
        <div className="table-wrap legal-table">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Parameters sent</th>
                <th>What it tells us</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>page_view</code>
                </td>
                <td>page path, title, referrer</td>
                <td>Which pages people open</td>
              </tr>
              <tr>
                <td>
                  <code>quickstart_shown</code>
                </td>
                <td>none</td>
                <td>Whether the setup wizard appeared</td>
              </tr>
              <tr>
                <td>
                  <code>setup_complete</code>
                </td>
                <td>
                  <code>mode</code>, <code>days</code>, <code>hours</code>,{" "}
                  <code>annual_hours</code>
                </td>
                <td>Which schedule shape people choose</td>
              </tr>
              <tr>
                <td>
                  <code>milestone</code>
                </td>
                <td>
                  <code>n</code>, <code>step_cents</code>
                </td>
                <td>How far the live counter gets</td>
              </tr>
              <tr>
                <td>
                  <code>settle_open</code>, <code>slack_toggle</code>
                </td>
                <td>none; <code>on</code> for the toggle</td>
                <td>Whether secondary panels are opened</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <code>step_cents</code> is the size of one milestone step in the smallest unit of your
          chosen currency — a derived counter interval, not your salary, your running total or your
          payslip. It is a numeric value derived from your settings, so we name it here explicitly.
          No event carries your name, email address, employer, tax identifier or bank details, and
          we do not set a GA user ID or otherwise link events to an identity.
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          The site itself sets no login, session or advertising cookie. Google Analytics sets
          first-party cookies such as <code>_ga</code> and <code>_ga_*</code> to distinguish
          returning browsers; their names and lifetimes are controlled by Google.
        </p>
        <p>
          You can refuse them: delete this site&apos;s cookies in your browser settings, block{" "}
          <code>googletagmanager.com</code> and <code>google-analytics.com</code> with a content
          blocker, or turn on your browser&apos;s tracking protection. The counter does not depend
          on cookies and will keep working with analytics blocked.
        </p>
      </section>

      <section>
        <h2>What we never collect</h2>
        <ul className="checks">
          <li>Your name, phone number, postal address or account credentials — there are no accounts.</li>
          <li>Your employer&apos;s name, contract, payslip, tax ID or bank details.</li>
          <li>Precise location, contacts, clipboard contents or keystrokes.</li>
          <li>A copy of your settings file. Only the derived event parameters listed above leave the browser.</li>
          <li>Advertising or cross-site profiles. There are no ad networks, social pixels, heatmaps or session-recording scripts on this site.</li>
        </ul>
        <p>
          The one exception is email: if you write to us, we receive whatever you chose to put in
          that message. We will never ask you to send salary figures.
        </p>
      </section>

      <section>
        <h2>Who processes analytics data</h2>
        <p>
          Google LLC processes GA4 data on our behalf, potentially in the United States or any
          other country where Google operates, under{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Google&apos;s Privacy Policy
          </a>
          . We keep no separate copy of it, do not merge it with other data sources and cannot
          resolve a GA4 report entry back to an individual visitor.
        </p>
        <p>
          Fonts, styles and scripts are served from this domain; there is no third-party CDN, tag
          manager container or embedded media making additional requests on your behalf.
        </p>
      </section>

      <section>
        <h2>How long data is kept</h2>
        <p>
          Your <code>localStorage</code> settings remain until you clear or reset them — there is
          no automatic expiry. The <code>sessionStorage</code> flag lasts one tab session.
          Analytics event retention is set by the Google Analytics property&apos;s own retention
          controls; we do not hold a second copy anywhere else.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          {SITE_NAME} is not directed at children under 16, and we do not knowingly collect personal
          information from them. If you believe a child has emailed us personal information, write
          to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will delete the
          message.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <ul className="checks">
          <li>Clear this site&apos;s data in your browser, or use the in-app reset, to erase every saved setting.</li>
          <li>Block analytics cookies or the Google Analytics domains with browser or extension controls.</li>
          <li>
            Turn on privacy mode, which blurs the figures on screen when someone is looking over
            your shoulder. It changes the display, not the underlying stored values — see the{" "}
            <Link href="/#faq">salary timer FAQ</Link> for what it does and does not do.
          </li>
          <li>Try the tool with the example figures instead of your real pay if you are on a shared computer.</li>
        </ul>
      </section>

      <section>
        <h2>Changes to this policy</h2>
        <p>
          If the tool or its analytics change, we will update this page and the &ldquo;Last
          updated&rdquo; date at the top. Continuing to use the site after an update means you
          accept the revised policy. The corresponding{" "}
          <Link href="/terms">Terms of Use</Link> explain the limits of the estimates themselves.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          For any privacy question, data request or correction, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. There is no account system, so
          email is the only channel we operate.
        </p>
      </section>
    </LegalPage>
  );
}
