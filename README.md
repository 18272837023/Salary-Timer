# Salary Timer 1

A free salary timer that shows what you earn per second, minute and hour — live.

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- Static export (`output: "export"`)
- No backend — all data stays in the browser (localStorage)

## Deploy

Push to `main` branch triggers GitHub Actions → builds → deploys to server via SCP.

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
