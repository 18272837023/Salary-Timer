import { Link } from "@/components/SmartLink";
import { AUTHOR } from "@/lib/author";

/**
 * The byline. One card, used twice: on the homepage it answers "who makes
 * this?", and at the top of /about it is the identity row under the heading.
 *
 * Deliberately a Server Component with no state: the byline is part of the
 * prerendered HTML, so a crawler sees the same name a visitor does. The copy is
 * passed in rather than read from a hook for the same reason — `lang` is known
 * at build time, so the Chinese homepage gets Chinese, not a hydration-time
 * swap.
 *
 * `loading="lazy"` is intentionally absent. The strip sits below the fold, and
 * lazy-loading a 64px circle produces a visible empty ring when it finally
 * scrolls into view. Next preloads it instead.
 */

const COPY = {
  en: {
    eyebrow: "Who makes this",
    body: AUTHOR.shortBio,
    more: "More about this site",
  },
  zh: {
    eyebrow: "关于作者",
    body: "站内每个数字都是你自己能算一遍的算术。无需注册，没有服务器数据库，你在计时器里输入的任何内容都不会离开浏览器。",
    more: "关于本站（英文）",
  },
} as const;

export function AuthorStrip({
  eyebrow = true,
  lang = "en",
  aboutLink = true,
}: {
  eyebrow?: boolean;
  lang?: "en" | "zh";
  /** False on /about itself — a byline that links to the page you are on is noise. */
  aboutLink?: boolean;
}) {
  const copy = COPY[lang];

  return (
    <div className="author-strip">
      <img className="author-face" src={AUTHOR.avatar} alt="" width={64} height={64} />
      <div className="author-body">
        {eyebrow ? <p className="author-eyebrow">{copy.eyebrow}</p> : null}
        <p className="author-name">{AUTHOR.name}</p>
        <p className="author-line">{copy.body}</p>
        <p className="author-links">
          {aboutLink ? <Link href="/about">{copy.more}</Link> : null}
          <a href={`mailto:${AUTHOR.email}`}>{AUTHOR.email}</a>
        </p>
      </div>
    </div>
  );
}
