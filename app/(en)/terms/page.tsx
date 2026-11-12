import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { LegalPage } from "@/components/LegalPage";
import { CONTACT_EMAIL, LEGAL_PAGES, SAME_AS, SITE_NAME } from "@/lib/site";

const page = LEGAL_PAGES.find((p) => p.href === "/terms")!;

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

export default function TermsPage() {
  return (
    <LegalPage
      page={page}
      h1={
        <>
          Terms of <span className="hl">Use</span>.
        </>
      }
      lede={`${SITE_NAME} is a free, browser-only gross-pay estimator. It shows what a working day is worth before deductions — nothing more. These terms set out what the numbers mean, what we do and do not promise, and where your settings live.`}
    >
      <section>
        <h2>The short version</h2>
        <p>
          Use the site for a rough, pre-tax view of your earnings while you work. It is not a
          payslip or a tax calculation, and it is not financial, legal or employment advice. There
          is no account, no warranty and no service-level guarantee. By using {SITE_NAME} you
          accept these terms.
        </p>
      </section>

      <section>
        <h2>What the service is</h2>
        <p>
          {SITE_NAME} is a static website with no backend. You enter a pay amount and a schedule,
          and your browser derives an hourly rate and accrues it during paid time. The{" "}
          <Link href="/">free live salary timer</Link> on the homepage is the main tool; the
          calculators, countdowns and Learn guides are supporting pages. The arithmetic is
          explained in{" "}
          <Link href="/learn/how-salary-timers-work">how a salary timer works</Link>.
        </p>
        <p>
          Every calculation runs locally on your device. Nothing you type is sent to a server for
          processing, and we operate no user database.
        </p>
      </section>

      <section>
        <h2>The numbers are estimates, not payroll</h2>
        <p>
          Every figure on this site is a gross (before deductions) estimate derived from the
          settings you enter. It does not include income tax, social insurance, pension
          contributions, student-loan or union deductions, statutory holiday pay, sick pay,
          bonuses, back pay, tips, expenses, or currency conversion. It does not know your
          contract, your employer&apos;s rounding rules or the overtime law where you work. A
          multiplier you set is your own assumption, not a legal determination.
        </p>
        <p>
          Your payslip, your employment agreement and your local law are authoritative. Do not use
          a figure from this site as the sole basis for a tax return, a pay dispute, a contract
          negotiation, or any other decision with financial consequences. Check it against the
          official numbers first.
        </p>
      </section>

      <section>
        <h2>This is not professional advice</h2>
        <p>
          Content on {SITE_NAME}, including the Learn guides, is general information. It is not
          financial, tax, legal, accounting or employment advice, and using it does not create a
          professional relationship. Ask a qualified professional in your jurisdiction before
          acting on anything you read here.
        </p>
      </section>

      <section>
        <h2>Your settings are yours to keep</h2>
        <p>
          Settings are saved in your browser&apos;s <code>localStorage</code>. They do not sync
          between devices or browsers, and clearing site data or using the in-app reset removes
          them permanently. We keep no backup and cannot recover them. If you use a shared
          computer, avoid leaving real pay figures behind.
        </p>
        <p>
          Privacy mode blurs the numbers on screen; it does not encrypt the stored settings or
          hide them from someone with access to your browser profile. The exact storage behaviour
          is described in the <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <ul className="checks">
          <li>Use the site for personal or internal reference, or link to it and quote it with attribution.</li>
          <li>Do not place unreasonable automated load on the site, probe or attempt to break it, or inject content into it.</li>
          <li>Do not republish the tool as your own service or present its output as a certified payroll calculation.</li>
          <li>
            The source code is published in our{" "}
            <a href={SAME_AS[0]} target="_blank" rel="noopener noreferrer">
              public GitHub repository
            </a>
            ; use it under the terms stated there. The site&apos;s text and design are separate
            from the code.
          </li>
        </ul>
      </section>

      <section>
        <h2>Availability and changes</h2>
        <p>
          This is a free static site provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;.
          We may change, pause or withdraw any page or feature at any time without notice. We do
          not promise uninterrupted access, compatibility with every browser or device, or freedom
          from errors.
        </p>
      </section>

      <section>
        <h2>No warranty</h2>
        <p>
          To the fullest extent permitted by law, {SITE_NAME} is provided without warranties of any
          kind, express or implied, including accuracy, fitness for a particular purpose and
          non-infringement. The estimates are illustrative and may be wrong — including when a
          browser clock, a shift crossing midnight, or a setting you entered produces an
          unexpected result.
        </p>
      </section>

      <section>
        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, we are not liable for any indirect, incidental or
          consequential loss, or for any decision made in reliance on an estimate from this site.
          Nothing in these terms excludes liability that cannot lawfully be excluded, or limits any
          mandatory consumer rights you have in your country of residence.
        </p>
      </section>

      <section>
        <h2>Third-party services</h2>
        <p>
          Google Analytics 4 is used for page-view and interaction measurement, as described in the{" "}
          <Link href="/privacy">Privacy Policy</Link>. Google&apos;s own terms govern that service;
          we are not responsible for its availability or behaviour. Blocking it does not affect the
          timer.
        </p>
      </section>

      <section>
        <h2>Changes to these terms</h2>
        <p>
          We may revise these terms as the tool changes. The revised version takes effect when it
          is posted here with a new &ldquo;Last updated&rdquo; date. Continuing to use the site
          after that date means you accept the revision.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about these terms, or a dispute you would like us to try to resolve directly,
          can be sent to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We aim to reply,
          but we do not provide a support guarantee.
        </p>
      </section>
    </LegalPage>
  );
}
