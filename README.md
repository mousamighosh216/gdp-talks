# GDP Talks

Company hackathon site. One Next.js app (App Router) with Tailwind CSS v4, written in TypeScript. MongoDB is optional.

## Run it
```bash
npm install
cp .env.local.example .env.local   # optional: MONGODB_URI, NEXT_PUBLIC_REGISTER_URL, NEXT_PUBLIC_CONTACT_EMAIL
npm run dev                        # http://localhost:3000
npm run build && npm start         # production
npm run typecheck
npm test                           # Vitest + Testing Library
```
Without `MONGODB_URI` content is served from `content/content.json` and submissions stay in memory.

## Structure
- `app/`: pages (`/`, `/sectors/[slug]`, `/doc-d`, 404) and route handlers (`/api/health`, `/api/sectors`, `/api/sectors/[slug]`, `/api/journey`, `POST /api/submissions`)
- `components/`: Hero (+HeroAsset), Journey, Companies, About, ProblemModal, SectorView, FloatingBackdrop, Navbar, Footer
- `lib/`: content, story (the Engineer X / Doc D conversation), sectors (icons and soft tints), db/models/data (optional MongoDB), validation, rateLimit
- `content/content.json`: journey steps, sectors and sample problem statements (replace with real ones)
- `PROJECT_PROMPT.txt`: the full project spec as a prompt
