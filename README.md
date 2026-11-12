# Salary Timer 1

A free salary timer that shows what you earn per second, minute and hour — live.

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- Static export (`output: "export"`)
- No backend — all data stays in the browser (localStorage)
- English and Chinese routes use separate root layouts (`app/(en)` and `app/(zh)`) so the exported HTML declares the correct language. Public URLs are unchanged.
- Fonts are bundled locally with their OFL licenses; builds do not download Google Fonts.

## Floating timer

The calculator's **Desktop live earnings / 桌面实时计薪** control uses Document Picture-in-Picture on supported secure desktop browsers. Its full-width button sits below the main tools and above the monthly-income accordion, which starts collapsed. Save pay settings first. The source tab must remain open; the user can drag the native window, but the website cannot choose its desktop position. Privacy and pay settings are shared with the main view. The visible PiP window drives its own clock so the display continues updating when the source tab is hidden. Unsupported browsers show an explanation without opening a regular popup.

`npm run test:floating -- http://127.0.0.1:3000` runs the native-browser regression against a running development server (or pass a static preview URL). It checks background ticking, privacy/currency synchronization, window lifecycle and unsupported/denied requests.

## Content maintenance

- Keep significant edit dates in `lib/editorial.ts` aligned with actual content edits. Do not use build time for sitemap `lastmod`. Omit dates that are unknown; do not invent publication or expert-review history.
- Shared guide/tool notes explain the annualized, gross-pay model and its limits. Jurisdiction-specific claims must identify their scope and link official sources. Keep visible answers and FAQ JSON-LD in agreement.
- `npm run test:geo` checks exported language, canonical URLs, visible evidence, FAQ/schema consistency and content dates after a build.

## Deploy

Push to `main` branch triggers GitHub Actions → builds → deploys to server via SCP.

The workflow uploads static files, but it does **not** install `nginx.conf`. Apply the repository's routing changes to the active server configuration and validate with `nginx -t` before reloading. Unknown paths must return HTTP 404 via `try_files ... =404`, with `/404.html` as the error document. The workflow now checks the live 404 status and the raw Chinese HTML language after deployment.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Production domain (e.g. `https://salarytimer.work`) |

## Scripts

```bash
npm run dev      # Development server
npm run build    # Static export to ./out
npm run typecheck
npm run test:e2e
```
