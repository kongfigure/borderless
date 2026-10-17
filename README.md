# Borderless

**Everything you desire. Anywhere in the world.** Shop the world, in English.

Built for DubHacks 2026, Visa "Reimagine Shopping" track. Borderless unifies international
marketplaces (Taobao, Rakuten, Coupang, Naver Shopping, Flipkart, Mercado Libre, Vinted) in
one place: search in English, see the true price to your door, get an honest verdict on
whether a listing looks risky, chat with sellers in translation, and pay through a safe,
mocked checkout.

Full spec: [`BUILD_PROMPT.md`](./BUILD_PROMPT.md). Clickable prototype reference:
[`borderless-site.html`](./borderless-site.html).

## Status: Phase 1 — foundation

This phase sets up the monorepo, design system, routing, and sample data. No search, trust
scoring, chat, or checkout logic is wired up yet — those are Phase 2+.

**Real:** project scaffolding, Tailwind design tokens, light/dark theme toggle, responsive
nav, all routes render, the Discover page fetches live from the Express API.

**Mocked / placeholder:** every page's content beyond Home and Discover is a stub screen.
`data/products.json` is entirely made-up sample data, clearly labelled as such.

## Stack

- `client/` — Vite + React + TypeScript + Tailwind CSS v4 + Framer Motion + React Router + lucide-react
- `server/` — Node + Express + TypeScript (`tsx` for dev, `tsup` for build)
- `shared/types.ts` — the `Product` type used by both client and server
- `data/products.json` — 12 sample products (furniture, home goods, clothing) across all 7 marketplaces

## Running it

```bash
npm run install:all   # installs root, client, and server dependencies
npm run dev            # runs the Express API (port 3001) and Vite client (port 5173) together
```

Open http://localhost:5173.

Copy `server/.env.example` to `server/.env` if you want to set `PORT` or add an
`ANTHROPIC_API_KEY` for later phases. Nothing reads the API key yet.

Other scripts: `npm run build` (builds both), `npm run typecheck`.

## Design system

- Ivory `#F7F5F0` background, near-black `#1C1C1C` text, forest green `#234C3B` accent,
  muted gold `#C3A77A` secondary accent.
- Fraunces for headlines, DM Sans for body text (Google Fonts).
- Light mode is primary; dark mode is a deep green-black variant with the same gold accent,
  toggled via the nav and persisted to `localStorage`.

## Honesty rules

- All sample data is explicitly labelled (`isSample: true` on every product, a `note` field
  in `data/products.json`).
- No real brand logos or scraped store photos — placeholder tiles and icons only.
- Verdicts (once built in Phase 2+) are a guide, not proof, and the UI will say so.
