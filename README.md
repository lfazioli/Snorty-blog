# Snorty Blog

A modern, full-stack blog built with React, TypeScript, and Vercel Functions. It provides article publishing, scheduled posts, a protected administration area, and integration with dev.to.

**Live site:** [snorty.space](https://snorty.space/)  
**Production host:** Vercel

## Features

- Responsive, accessible React interface
- Server-rendered metadata and article pages
- PostgreSQL-backed posts and administration
- JWT-based administrator authentication
- Draft, published, and scheduled article states
- Markdown rendering with safe HTML handling
- dev.to project feed integration
- SEO metadata, canonical URLs, Open Graph, and JSON-LD
- Automated tests for public and administrative behavior

## Technology

- React 19 and React Router
- TypeScript
- Vite
- Tailwind CSS
- Express-compatible Vercel Functions
- PostgreSQL with Drizzle ORM helpers
- Node.js test runner
- ESLint

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- PostgreSQL database

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:5173` unless Vite reports another port.

See `.env.example` for the available configuration values. Do not commit real credentials or database URLs.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the Node.js test suite |
| `npm run typecheck:api` | Type-check Vercel API handlers |
| `npm run preview` | Preview the production build locally |

## Testing

```bash
npm run test
npm run lint
npm run typecheck:api
npm run build
```

The test suite covers authentication, API publication rules, metadata, Markdown safety, canonical URLs, routing, and database error handling.

## Project structure

```text
api/          Vercel serverless API handlers
server/       Shared database, authentication, and publication logic
src/          React application
public/       Static assets
tests/        Automated test suite
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `ADMIN_EMAIL` | Administrator account email |
| `ADMIN_PASSWORD` | Administrator account password |
| `JWT_SECRET` | Secret used to sign administrator sessions |
| `SITE_URL` | Canonical production host |
| `VITE_SITE_URL` | Public host embedded in the client build |
| `DEVTO_USERNAME` | dev.to username used for the public project feed |

Configure these variables locally in `.env.local` and in the Vercel project settings for production deployments.

## Deployment

1. Create or connect the repository in Vercel.
2. Configure the environment variables in the Vercel project.
3. Set the production domain to `www.snorty.space` or the intended canonical host.
4. Deploy the `main` branch.

Run the complete validation sequence before deploying.

## Contributing

1. Create a focused feature branch.
2. Keep changes scoped and document behavior changes.
3. Run tests, lint, type-checking, and the production build.
4. Open a pull request with a clear summary and verification steps.

## License

No license has been declared for this repository. All rights remain with the project owner unless an open-source license is added.

## Author

**Leonardo Fazioli**  
GitHub: [@lfazioli](https://github.com/lfazioli)
