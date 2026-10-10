# GDP Talks

Company hackathon site. MERN stack (MongoDB, Express, React, Node) with Tailwind CSS v4, written in TypeScript.

## Run it

```bash
npm run install:all
cp server/.env.example server/.env      # set MONGODB_URI (or leave empty to run in memory)
cp client/.env.example client/.env      # set VITE_REGISTER_URL (Unstop or other host)
npm run dev                             # API on :5000, site on :5173
```

Without `MONGODB_URI` the API serves content from `shared/content.json` and keeps
submissions in memory. With it, content is seeded into MongoDB on start.

Production: `npm run build && npm start` (builds the client and compiles the server to `server/dist`; Express then serves `client/dist`).

Type checking: `npm run typecheck` (server and client).

## Tests

```bash
npm test               # server + client
npm run test:server    # Node's built-in test runner, no database needed
npm run test:client    # Vitest + Testing Library (jsdom)
npm run test:watch --prefix client
```

- `server/test/`: every endpoint, submission validation, content integrity, rate limit
- `client/src/test/`: hero chat (two at a time, redirect at the end), section order, company hover and colour contrast, journey, sector form, routes, brand tokens

## Page order

Hero (subtitle, title, chat, asset) → About → Student journey → Company routing → Footer.

## Structure

- `shared/content.json`: journey steps, sectors and sample problem statements
- `server/`: Express API in TypeScript (run with tsx in dev, compiled with tsc for production) (`/api/sectors`, `/api/sectors/:slug`, `/api/journey`, `POST /api/submissions`)
- `client/src/components/`: Hero (title + scroll-driven chat + asset), About, Journey, Companies, FloatingBackdrop (drifting background assets)
- `client/src/pages/`: Home, Sector (one template, 8 sector pages), DocD (coming soon), NotFound
- `client/src/lib/sectors.ts`: icon and soft hover tint per sector
- `client/src/lib/story.ts`: the Engineer X / Doc D conversation and the two-at-a-time scroll logic

## Design decisions to know about

- Palette and fonts are tokens in `client/src/index.css` (Libron body, Space Grotesk heading).
- Type scale: heading = subtitle x 1.6, chat text = heading reduced by 45%. Change `--fs-sub` to scale all.
- The company logo is a placeholder: replace `client/public/logo-placeholder.svg`.
- Footer email and social links are placeholders.
