# OpenUI

The open platform for UI components. Share, vote, fork, and suggest improvements — like Reddit, but for frontend devs.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)
![License](https://img.shields.io/badge/License-MIT-green)

---

## What is OpenUI?

OpenUI is a community-driven platform where developers can:

- **Post** React/JSX or HTML+CSS+JS components with live preview
- **Vote** on components — community votes surface the best ones
- **Fork** any component and make it your own
- **Suggest improvements** with a PR-style system (diff viewer included)
- **Version** components — track changes over time

Components render in a sandboxed iframe with React 18 + Babel, so users see live previews as they code.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Database | PostgreSQL (Neon / Supabase) |
| ORM | Prisma 5 |
| Auth | NextAuth.js v4 (GitHub OAuth) |
| Rate Limiting | Upstash Redis |
| Code Editor | Monaco Editor |
| Diff Viewer | react-diff-viewer-continued |
| Monorepo | pnpm + Turborepo |
| Deploy | Vercel |

---

## Project Structure

```
openui/
├── apps/
│   └── web/                          # Next.js application
│       └── src/
│           ├── app/
│           │   ├── (auth)/login/     # Login page
│           │   ├── (main)/           # Main app layout
│           │   │   ├── page.tsx      # Home (landing + feed)
│           │   │   ├── [category]/   # Category feed (/button, /card, etc.)
│           │   │   ├── component/
│           │   │   │   ├── new/      # Post new component
│           │   │   │   └── [id]/     # View / Edit / Suggest
│           │   │   └── profile/
│           │   │       └── [username]/ # User profile
│           │   └── api/
│           │       ├── components/   # CRUD + vote + fork
│           │       └── suggestions/  # Create / accept / reject
│           ├── components/           # Shared UI components
│           ├── lib/                  # Auth, Redis, sandbox, utilities
│           └── types/                # TypeScript types
├── packages/
│   ├── database/                     # Prisma schema + client
│   ├── ui/                           # Shared utilities (categories, formatDate, etc.)
│   └── config/                       # Shared ESLint + TypeScript configs
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm** >= 8 (`npm install -g pnpm`)
- **PostgreSQL** database (free tier on [Neon](https://neon.tech) or [Supabase](https://supabase.com))
- **GitHub OAuth App** (for authentication)
- **Upstash Redis** (for rate limiting — free tier on [Upstash](https://upstash.com))

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/openui.git
cd openui
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

```bash
cp apps/web/.env.example apps/web/.env
```

Edit `apps/web/.env` with your credentials:

```env
# Database — PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"

# GitHub OAuth — create at https://github.com/settings/developers
GITHUB_ID="your-github-oauth-client-id"
GITHUB_SECRET="your-github-oauth-client-secret"

# Upstash Redis — create at https://console.upstash.com
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"
```

You also need the DATABASE_URL in the database package:

```bash
cp apps/web/.env packages/database/.env
```

> Only the `DATABASE_URL` line is needed in `packages/database/.env`.

### 4. Set up the database

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to your database
pnpm db:push
```

### 5. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Setting Up External Services

### PostgreSQL Database

You need a PostgreSQL database. Recommended free options:

**Option A — Neon (recommended)**
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string from the dashboard
4. Paste into `DATABASE_URL` in your `.env` files

**Option B — Supabase**
1. Go to [supabase.com](https://supabase.com) and create a free project
2. Go to Settings > Database > Connection string (URI)
3. Copy and paste into `DATABASE_URL`

### GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name:** `OpenUI` (or anything you want)
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
4. Click **Register application**
5. Copy **Client ID** → `GITHUB_ID`
6. Generate a **Client Secret** → `GITHUB_SECRET`

> For production, update the URLs to your deployed domain (e.g., `https://openui.vercel.app`).

### Upstash Redis

1. Go to [console.upstash.com](https://console.upstash.com)
2. Create a free Redis database
3. Go to **REST API** tab
4. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/openui.git
git push -u origin main
```

### 2. Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure the project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
4. Add all environment variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` |
| `NEXTAUTH_SECRET` | A random secret (`openssl rand -base64 32`) |
| `GITHUB_ID` | Your GitHub OAuth Client ID |
| `GITHUB_SECRET` | Your GitHub OAuth Client Secret |
| `UPSTASH_REDIS_REST_URL` | Your Upstash URL |
| `UPSTASH_REDIS_REST_TOKEN` | Your Upstash token |

5. Click **Deploy**

### 3. Update GitHub OAuth URLs

After deploying, go back to your [GitHub OAuth App settings](https://github.com/settings/developers) and update:
- **Homepage URL:** `https://your-domain.vercel.app`
- **Authorization callback URL:** `https://your-domain.vercel.app/api/auth/callback/github`

### 4. Push the database schema

After the first deploy, if the database is fresh:

```bash
pnpm db:push
```

Or run it via the Vercel CLI:

```bash
npx vercel env pull .env.local
pnpm db:push
```

---

## Key Features

### Live Component Preview
Components render inside a sandboxed `<iframe>` with `sandbox="allow-scripts"` (never `allow-same-origin`). JSX components are transpiled in-browser using Babel standalone + React 18 from CDN.

### Voting System
Reddit-style upvote/downvote with optimistic UI. Votes are denormalized into `voteScore` on the component for fast sorting. Feed supports Hot, New, and Top sort modes.

### Fork System
One-click fork copies all code fields into a new component linked to the original. The original shows a fork count and list of forks.

### PR-style Suggestions
Any user can suggest code changes to any component. The component author sees a side-by-side diff and can accept or reject. Accepted suggestions automatically create a new version.

### Component Versioning
Every code change can optionally create a new version. Version history is visible on the component detail page with change notes.

### Soft Delete (Archive)
Authors can archive components instead of permanently deleting them. Archived components are hidden from feeds but forks and votes remain intact. Authors can restore at any time.

---

## Database Schema

The main models are:

- **User** — GitHub OAuth profile + components, votes, suggestions
- **Component** — Title, description, category, code (JSX/HTML/CSS/JS), vote score, fork relations
- **ComponentVersion** — Immutable code snapshots with change notes
- **Vote** — +1 or -1 per user per component (unique constraint)
- **Suggestion** — PR-style code change proposals with PENDING/ACCEPTED/REJECTED status

See the full schema at [`packages/database/prisma/schema.prisma`](packages/database/prisma/schema.prisma).

---

## API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/components` | List components (sort, category, search, pagination) |
| POST | `/api/components` | Create a new component |
| GET | `/api/components/[id]` | Get component details |
| PUT | `/api/components/[id]` | Update component (author only) |
| DELETE | `/api/components/[id]` | Archive component (author only) |
| POST | `/api/components/[id]` | Restore archived component |
| POST | `/api/components/[id]/vote` | Vote (+1 / -1 / toggle off) |
| POST | `/api/components/[id]/fork` | Fork a component |
| GET | `/api/components/[id]/versions/[v]` | Get specific version |
| POST | `/api/suggestions` | Create a suggestion |
| POST | `/api/suggestions/[id]/accept` | Accept suggestion (author only) |
| POST | `/api/suggestions/[id]/reject` | Reject suggestion (author only) |

### Query Parameters for `GET /api/components`

| Param | Type | Description |
|---|---|---|
| `sort` | `hot` \| `new` \| `top` | Sort mode (default: `hot`) |
| `category` | string | Filter by category (e.g., `BUTTON`) |
| `q` | string | Search by title/tags |
| `cursor` | string | Cursor for pagination (ISO date string) |
| `limit` | number | Items per page (default: 20, max: 50) |
| `period` | `week` \| `month` | Filter by creation date |
| `author` | string | Filter by author username |

---

## Available Scripts

```bash
# Development
pnpm dev              # Start dev server (all packages)

# Build
pnpm build            # Build all packages

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to database

# Format
pnpm format           # Format code with Prettier
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Set up your own database, GitHub OAuth, and Upstash (see [Getting Started](#getting-started))
4. Make your changes
5. Run `pnpm build` to verify everything compiles
6. Push and open a Pull Request

> **Note:** Contributors use their own database instance. The production database is not shared.

---

## License

MIT
