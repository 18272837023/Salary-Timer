/**
 * The one human behind the site.
 *
 * Kept in a single file because three places need the same facts: the byline
 * strip on the homepage, the `/about` page, and the `founder` reference in the
 * Organization structured data. A bio that drifts between those three is worse
 * than no bio at all — Google reads the JSON-LD, a visitor reads the strip, and
 * they had better be saying the same thing.
 *
 * Everything here is a claim that can be checked: the repository is public, the
 * arithmetic is on the page, and the "what this is not" line is deliberate. No
 * invented job titles, no invented years of experience.
 */

import { CONTACT_EMAIL, SITE_NAME, pageUrl } from "./site";

/** Stable @id so the Organization on every page points at one Person, not a
 *  second, slightly different description of the same person. */
export const AUTHOR_ID = `${pageUrl("/about")}#author`;

export const AUTHOR = {
  /** Byline name. Swap for a real name here and every surface follows. */
  name: "Sunfly",
  initials: "SF",
  /** Portrait for the byline strip and /about. A sunflower, because the site is
   *  about counting daylight hours. Served from /public, no image CDN. */
  avatar: "/author-sunflower.png",
  role: "Independent developer",
  /** One line under the name. */
  tagline: `I build ${SITE_NAME} and look after it.`,

  /** Two sentences — the byline strip. */
  shortBio:
    "Every number on this site is arithmetic you can check yourself. No account, no server-side database, and nothing you type into the timer leaves your browser.",

  /** The long version, one paragraph per section on /about. */
  bio: [
    `I am the developer behind ${SITE_NAME}. I wanted a way to see what I earn during a workday using my own schedule. A standard 2,080-hour estimate assumes 40 paid hours a week for 52 weeks, and my schedule can vary.`,
    "So the counter here runs the arithmetic the other way round. You describe the schedule you actually work — the days, the unpaid break, the overtime rate — and the page shows what an hour, a minute and a second of your working time are worth, then keeps counting while you work.",
    "It is free and there is no account, because a tool that asks for your salary should not also ask for your email address. Your settings stay in this browser's local storage; there is no server-side database for them to be uploaded to.",
  ],

  /** Topics the author is claiming, in schema.org `knowsAbout` terms. */
  knowsAbout: [
    "hourly rate calculation",
    "overtime pay",
    "shift work and rotating rotas",
    "pay periods and paydays",
    "gross pay estimation",
  ],

  /**
   * The honest limit. Printed verbatim on /about — the point is that a pay
   * calculator should say out loud what it cannot do.
   */
  limit:
    "I am not a CPA, tax adviser or payroll specialist. Everything here is a gross-pay estimate from arithmetic you can check, not tax advice, and not a payslip.",

  /**
   * One link, and it is the address itself rather than the word "Email".
   * A byline is about reachability: printing the address is checkable.
   */
  links: [{ label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` }],

  email: CONTACT_EMAIL,
};
