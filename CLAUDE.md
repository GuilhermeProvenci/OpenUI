# OpenUI — Implementation Reference for Claude Code

> This file is the single source of truth for building OpenUI. Read it fully before writing any code.
> When in doubt about architecture, data models, or feature scope — consult this file first.

---

## What is OpenUI?

OpenUI is an open platform for sharing UI components, working like Reddit for frontend devs. Anyone can post React/JSX or HTML+CSS+JS components, vote on others' work, suggest improvements (PR-style), and fork components.

**Core difference from UIVerse:** OpenUI is unmoderated by default — community votes surface quality. It also has a collaborative PR/fork system UIVerse lacks.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | Full-stack TypeScript, no separate backend repo |
| Language | TypeScript (strict mode) | All files `.ts` or `.tsx` |
| Database | PostgreSQL via Supabase | Free tier sufficient for MVP |
| ORM | Prisma | With migrations committed to repo |
| Auth | NextAuth.js v5 | GitHub OAuth only for MVP |
| Styling | Tailwind CSS | No custom CSS files |
| Cache / Rate limit | Upstash Redis | Serverless-compatible |
| Code Editor | Monaco Editor | `@monaco-editor/react` |
| Sandbox | iframe + srcdoc + Babel standalone | No server-side execution |
| Diff viewer | react-diff-viewer-continued | For PR suggestion diffs |
| Deploy | Vercel | Zero-config with Next.js |

### Environment Variables Required

```env
# .env.local
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
GITHUB_ID="..."
GITHUB_SECRET="..."
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (main)/
│   │   ├── layout.tsx               # Main layout with navbar
│   │   ├── page.tsx                 # Home feed
│   │   ├── [category]/
│   │   │   └── page.tsx             # Category feed (e.g. /button)
│   │   ├── component/
│   │   │   ├── new/
│   │   │   │   └── page.tsx         # Post new component
│   │   │   └── [id]/
│   │   │       ├── page.tsx         # View component
│   │   │       ├── edit/
│   │   │       │   └── page.tsx     # Edit component (author only)
│   │   │       └── suggest/
│   │   │           └── page.tsx     # Create suggestion/PR
│   │   └── profile/
│   │       └── [username]/
│   │           └── page.tsx
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts
│       ├── components/
│       │   ├── route.ts             # GET (list), POST (create)
│       │   └── [id]/
│       │       ├── route.ts         # GET, PUT, DELETE
│       │       ├── vote/
│       │       │   └── route.ts     # POST vote
│       │       └── fork/
│       │           └── route.ts     # POST fork
│       └── suggestions/
│           ├── route.ts             # POST create suggestion
│           └── [id]/
│               ├── accept/
│               │   └── route.ts     # POST accept
│               └── reject/
│                   └── route.ts     # POST reject
├── components/
│   ├── ui/                          # shadcn/ui primitives
│   ├── ComponentCard.tsx            # Feed card with preview
│   ├── ComponentPreview.tsx         # iframe sandbox wrapper
│   ├── CodeEditor.tsx               # Monaco editor wrapper
│   ├── VoteButton.tsx               # Upvote/downvote with optimistic UI
│   ├── SuggestionCard.tsx           # PR suggestion item
│   ├── CategoryBadge.tsx
│   └── Navbar.tsx
├── lib/
│   ├── prisma.ts                    # Prisma client singleton
│   ├── auth.ts                      # NextAuth config
│   ├── sandbox.ts                   # srcdoc HTML builder
│   ├── redis.ts                     # Upstash client + rate limit helpers
│   └── utils.ts                     # cn(), formatDate(), etc.
├── types/
│   └── index.ts                     # Shared TypeScript types
└── prisma/
    └── schema.prisma
```

---

## Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String       @id @default(cuid())
  username     String       @unique
  email        String       @unique
  avatarUrl    String?
  bio          String?
  githubId     String?      @unique
  components   Component[]
  votes        Vote[]
  suggestions  Suggestion[]
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
}

model Component {
  id          String       @id @default(cuid())
  title       String
  description String?
  category    Category
  tags        String[]     @default([])

  // Code fields — at least one of jsx or html must be present
  codeJsx     String?      // React/JSX code
  codeHtml    String?      // Plain HTML
  codeCss     String?      // CSS (used in both modes)
  codeJs      String?      // Vanilla JS (html mode only)

  // Relations
  authorId    String
  author      User         @relation(fields: [authorId], references: [id], onDelete: Cascade)

  // Fork system
  forkedFromId String?
  forkedFrom   Component?  @relation("forks", fields: [forkedFromId], references: [id])
  forks        Component[] @relation("forks")

  votes       Vote[]
  suggestions Suggestion[]

  // Denormalized score for fast sorting
  voteScore   Int          @default(0)

  published   Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([category])
  @@index([voteScore])
  @@index([createdAt])
  @@index([authorId])
}

model Vote {
  id          String    @id @default(cuid())
  value       Int       // +1 or -1 only
  userId      String
  componentId String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  component   Component @relation(fields: [componentId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())

  @@unique([userId, componentId])
}

model Suggestion {
  id          String           @id @default(cuid())
  title       String
  description String

  // Suggested code (null = no change to that field)
  codeJsx     String?
  codeHtml    String?
  codeCss     String?
  codeJs      String?

  status      SuggestionStatus @default(PENDING)

  authorId    String
  componentId String
  author      User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  component   Component @relation(fields: [componentId], references: [id], onDelete: Cascade)

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([componentId])
  @@index([status])
}

enum Category {
  BUTTON
  CARD
  INPUT
  TABS
  MODAL
  NAVBAR
  CHART
  BADGE
  TOOLTIP
  FORM
  TABLE
  HERO
  ANIMATION
  OTHER
}

enum SuggestionStatus {
  PENDING
  ACCEPTED
  REJECTED
}
```

---

## Core Implementation Details

### 1. Sandbox — How Preview Works

This is the most critical piece. Never execute user code outside of an iframe sandbox.

```typescript
// src/lib/sandbox.ts

export type SandboxMode = 'jsx' | 'html'

interface SandboxOptions {
  mode: SandboxMode
  codeJsx?: string
  codeHtml?: string
  codeCss?: string
  codeJs?: string
  theme?: 'light' | 'dark'
}

export function buildSandboxHtml(opts: SandboxOptions): string {
  const bg = opts.theme === 'dark' ? '#0f172a' : '#ffffff'
  const baseStyles = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${bg}; display: flex; align-items: center;
           justify-content: center; min-height: 100vh; padding: 16px; font-family: system-ui; }
  `

  if (opts.mode === 'jsx') {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>${baseStyles}${opts.codeCss ?? ''}</style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${opts.codeJsx ?? ''}
    const rootElement = document.getElementById('root')
    if (typeof App !== 'undefined') {
      ReactDOM.createRoot(rootElement).render(React.createElement(App))
    }
  </script>
</body>
</html>`
  }

  // HTML mode
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${baseStyles}${opts.codeCss ?? ''}</style>
</head>
<body>
  ${opts.codeHtml ?? ''}
  <script>${opts.codeJs ?? ''}</script>
</body>
</html>`
}
```

```tsx
// src/components/ComponentPreview.tsx
'use client'
import { buildSandboxHtml } from '@/lib/sandbox'

interface Props {
  component: {
    codeJsx?: string | null
    codeHtml?: string | null
    codeCss?: string | null
    codeJs?: string | null
  }
  mode?: 'jsx' | 'html'
  height?: number
}

export function ComponentPreview({ component, mode = 'jsx', height = 300 }: Props) {
  const srcdoc = buildSandboxHtml({
    mode: component.codeJsx ? 'jsx' : 'html',
    ...component,
  })

  return (
    <iframe
      srcDoc={srcdoc}
      sandbox="allow-scripts"          // ONLY allow-scripts. Never add allow-same-origin.
      style={{ height }}
      className="w-full rounded-lg border border-border bg-background"
      title="Component Preview"
      loading="lazy"
    />
  )
}
```

> **Security rule:** `sandbox="allow-scripts"` only. Adding `allow-same-origin` would let the iframe access the parent domain's cookies and localStorage. Without it, the iframe runs in an opaque origin, fully isolated.

---

### 2. Vote API with Optimistic UI

```typescript
// src/app/api/components/[id]/vote/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/redis'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate limit: 50 votes per hour per user
  const limited = await rateLimit(`vote:${session.user.id}`, 50, 3600)
  if (limited) return Response.json({ error: 'Rate limited' }, { status: 429 })

  const { value } = await req.json() as { value: 1 | -1 }
  if (value !== 1 && value !== -1) return Response.json({ error: 'Invalid value' }, { status: 400 })

  const existing = await prisma.vote.findUnique({
    where: { userId_componentId: { userId: session.user.id, componentId: params.id } }
  })

  if (existing?.value === value) {
    // Toggle off — remove vote
    await prisma.$transaction([
      prisma.vote.delete({ where: { id: existing.id } }),
      prisma.component.update({
        where: { id: params.id },
        data: { voteScore: { decrement: value } }
      })
    ])
    return Response.json({ score: 'decremented', userVote: null })
  }

  const scoreDelta = existing ? value * 2 : value  // switching vote counts double

  await prisma.$transaction([
    prisma.vote.upsert({
      where: { userId_componentId: { userId: session.user.id, componentId: params.id } },
      create: { value, userId: session.user.id, componentId: params.id },
      update: { value }
    }),
    prisma.component.update({
      where: { id: params.id },
      data: { voteScore: { increment: scoreDelta } }
    })
  ])

  return Response.json({ score: 'updated', userVote: value })
}
```

```tsx
// src/components/VoteButton.tsx — optimistic update pattern
'use client'
import { useState } from 'react'

export function VoteButton({ componentId, initialScore, initialUserVote }: Props) {
  const [score, setScore] = useState(initialScore)
  const [userVote, setUserVote] = useState<1 | -1 | null>(initialUserVote)

  async function vote(value: 1 | -1) {
    const prevScore = score
    const prevVote = userVote

    // Optimistic update
    if (userVote === value) {
      setScore(s => s - value)
      setUserVote(null)
    } else {
      setScore(s => s + (userVote ? value * 2 : value))
      setUserVote(value)
    }

    try {
      await fetch(`/api/components/${componentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
      })
    } catch {
      // Revert on error
      setScore(prevScore)
      setUserVote(prevVote)
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button onClick={() => vote(1)} className={userVote === 1 ? 'text-orange-500' : 'text-muted-foreground'}>▲</button>
      <span className="font-bold text-sm">{score}</span>
      <button onClick={() => vote(-1)} className={userVote === -1 ? 'text-blue-500' : 'text-muted-foreground'}>▼</button>
    </div>
  )
}
```

---

### 3. Feed API with Sorting

```typescript
// src/app/api/components/route.ts — GET handler
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') as Category | null
  const sort = (searchParams.get('sort') ?? 'hot') as 'hot' | 'new' | 'top'
  const cursor = searchParams.get('cursor')
  const limit = 20

  const orderBy = {
    hot: [{ voteScore: 'desc' }, { createdAt: 'desc' }],
    new: [{ createdAt: 'desc' }],
    top: [{ voteScore: 'desc' }],
  }[sort] as Prisma.ComponentOrderByWithRelationInput[]

  const components = await prisma.component.findMany({
    where: {
      published: true,
      ...(category ? { category } : {}),
      ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
    },
    orderBy,
    take: limit + 1,
    include: {
      author: { select: { username: true, avatarUrl: true } },
      _count: { select: { votes: true, suggestions: true, forks: true } }
    }
  })

  const hasMore = components.length > limit
  const items = hasMore ? components.slice(0, limit) : components
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null

  return Response.json({ items, nextCursor })
}
```

---

### 4. Suggestion (PR) System

```typescript
// src/app/api/suggestions/[id]/accept/route.ts
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const suggestion = await prisma.suggestion.findUnique({
    where: { id: params.id },
    include: { component: true }
  })

  if (!suggestion) return Response.json({ error: 'Not found' }, { status: 404 })
  if (suggestion.component.authorId !== session.user.id)
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  if (suggestion.status !== 'PENDING')
    return Response.json({ error: 'Already resolved' }, { status: 409 })

  await prisma.$transaction([
    prisma.component.update({
      where: { id: suggestion.componentId },
      data: {
        // Only overwrite fields that were actually suggested (non-null)
        ...(suggestion.codeJsx !== null && { codeJsx: suggestion.codeJsx }),
        ...(suggestion.codeHtml !== null && { codeHtml: suggestion.codeHtml }),
        ...(suggestion.codeCss !== null && { codeCss: suggestion.codeCss }),
        ...(suggestion.codeJs !== null && { codeJs: suggestion.codeJs }),
      }
    }),
    prisma.suggestion.update({
      where: { id: params.id },
      data: { status: 'ACCEPTED' }
    })
  ])

  return Response.json({ success: true })
}
```

```tsx
// Diff viewer usage in suggestion review page
import ReactDiffViewer from 'react-diff-viewer-continued'

<ReactDiffViewer
  oldValue={component.codeJsx ?? ''}
  newValue={suggestion.codeJsx ?? component.codeJsx ?? ''}
  splitView={true}
  leftTitle="Current code"
  rightTitle="Suggested change"
  useDarkTheme={true}
/>
```

---

### 5. Fork System

```typescript
// src/app/api/components/[id]/fork/route.ts
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const original = await prisma.component.findUnique({ where: { id: params.id } })
  if (!original) return Response.json({ error: 'Not found' }, { status: 404 })

  const fork = await prisma.component.create({
    data: {
      title: `Fork of ${original.title}`,
      description: original.description,
      category: original.category,
      tags: original.tags,
      codeJsx: original.codeJsx,
      codeHtml: original.codeHtml,
      codeCss: original.codeCss,
      codeJs: original.codeJs,
      authorId: session.user.id,
      forkedFromId: original.id,
      voteScore: 0,
    }
  })

  return Response.json({ id: fork.id })
}
```

---

### 6. Rate Limiting (Upstash Redis)

```typescript
// src/lib/redis.ts
import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Returns true if rate limited (should block)
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
  })
  const { success } = await ratelimit.limit(key)
  return !success
}

// Usage:
// POST component: rateLimit(`post:${userId}`, 5, 86400)   — 5/day
// Vote:           rateLimit(`vote:${userId}`, 50, 3600)   — 50/hour
// Suggestion:     rateLimit(`suggest:${userId}`, 10, 86400) — 10/day
```

---

### 7. Auth Config

```typescript
// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    })
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) session.user.id = user.id
      return session
    }
  },
  pages: {
    signIn: '/login',
  }
}
```

---

## Implementation Phases

### Phase 1 — Foundation (Week 1)
**Goal:** Repo up, auth working, schema migrated, deploy on Vercel.

```bash
# Setup commands
npx create-next-app@latest openui --typescript --tailwind --app
cd openui
npm install prisma @prisma/client @auth/prisma-adapter next-auth
npm install @upstash/redis @upstash/ratelimit
npm install @monaco-editor/react react-diff-viewer-continued
npx prisma init
# → fill .env.local, run:
npx prisma migrate dev --name init
npx prisma generate
```

Tasks:
- [ ] `prisma/schema.prisma` — full schema as defined above
- [ ] `src/lib/prisma.ts` — singleton client
- [ ] `src/lib/auth.ts` — NextAuth with GitHub provider
- [ ] `src/app/api/auth/[...nextauth]/route.ts`
- [ ] `src/app/(auth)/login/page.tsx` — simple GitHub sign-in button
- [ ] `src/app/(main)/layout.tsx` — navbar with auth state
- [ ] Deploy to Vercel, confirm auth flow works end-to-end

---

### Phase 2 — Component Creation (Week 2)
**Goal:** Users can post a component with code, pick a category.

Tasks:
- [ ] `src/components/CodeEditor.tsx` — Monaco wrapper with JSX/CSS/HTML tabs
- [ ] `src/app/(main)/component/new/page.tsx` — form: title, description, category, tags, code editors
- [ ] `src/app/api/components/route.ts` — POST handler with validation
- [ ] Rate limit on POST (5/day per user)
- [ ] Redirect to `/component/[id]` after creation

Validation rules:
- title: required, 3–80 chars
- category: required, must be valid enum
- code: at least one of codeJsx or codeHtml must be non-empty
- tags: max 5, each max 20 chars

---

### Phase 3 — Live Preview Sandbox (Week 3)
**Goal:** Users see their component render as they type.

Tasks:
- [ ] `src/lib/sandbox.ts` — `buildSandboxHtml()` as defined above
- [ ] `src/components/ComponentPreview.tsx` — iframe wrapper
- [ ] Wire preview into the new component form (debounce 500ms)
- [ ] Mode toggle: JSX preview vs HTML preview
- [ ] Handle iframe load errors gracefully (catch + show error state)
- [ ] Test: script injection attempts should be blocked by sandbox

---

### Phase 4 — Feed & Voting (Week 4)
**Goal:** The home page works. People can vote.

Tasks:
- [ ] `src/app/api/components/route.ts` — GET with pagination, sort, category filter
- [ ] `src/app/(main)/page.tsx` — feed with infinite scroll (Intersection Observer)
- [ ] `src/app/(main)/[category]/page.tsx` — category-filtered feed
- [ ] `src/components/ComponentCard.tsx` — card with mini preview, title, author, score, category badge
- [ ] `src/components/VoteButton.tsx` — optimistic update as defined above
- [ ] `src/app/api/components/[id]/vote/route.ts` — vote API
- [ ] Sort tabs: Hot / New / Top

---

### Phase 5 — Component Detail Page & Downloads (Week 5)
**Goal:** Full component page with code viewer and download.

Tasks:
- [ ] `src/app/(main)/component/[id]/page.tsx` — large preview + code tabs
- [ ] Code tabs: Preview | JSX | HTML | CSS | JS (show only tabs that have content)
- [ ] Download button per tab — generates a `.jsx`, `.html`, `.css`, `.js` file via Blob URL
- [ ] Show fork count, suggestion count, vote score
- [ ] Show "Forked from X" badge if applicable
- [ ] Show all forks as a list at bottom

Download implementation:
```typescript
function downloadCode(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

---

### Phase 6 — Suggestions & Forks (Weeks 6–7)
**Goal:** Full collaboration system working.

Tasks:
- [ ] `src/app/(main)/component/[id]/suggest/page.tsx` — editor pre-filled with current code
- [ ] `src/app/api/suggestions/route.ts` — POST create suggestion
- [ ] Suggestions tab on component detail page
- [ ] `src/components/SuggestionCard.tsx` — shows title, author, status, diff button
- [ ] `src/app/api/suggestions/[id]/accept/route.ts`
- [ ] `src/app/api/suggestions/[id]/reject/route.ts`
- [ ] Side-by-side diff modal using `react-diff-viewer-continued`
- [ ] `src/app/api/components/[id]/fork/route.ts`
- [ ] Fork button on component detail page → redirects to new fork

---

### Phase 7 — Polish & Launch (Week 8)
**Goal:** Production-ready MVP.

Tasks:
- [ ] `src/app/(main)/profile/[username]/page.tsx` — user's components + forks
- [ ] Search: `?q=` param on feed, filter by title and tags (`prisma: { title: { contains: q, mode: 'insensitive' } }`)
- [ ] Open Graph meta tags on component pages (title, description, preview image placeholder)
- [ ] Sitemap.xml (`src/app/sitemap.ts`)
- [ ] Components with `voteScore < -5` — collapse in feed, still accessible by URL
- [ ] Report button (stores in a `Report` table, email alert to admin at threshold 3)
- [ ] Error boundaries on preview iframe
- [ ] Loading skeletons on feed
- [ ] `README.md` with setup instructions

---

## Key Decisions & Conventions

### TypeScript Conventions
- All API route handlers type their request body with a cast: `const body = await req.json() as ExpectedType`
- Always validate before using: don't trust the cast
- Use `Response.json()` (not `NextResponse.json()`) in App Router routes
- Server components fetch data directly via Prisma (no API call to self)
- Client components that need data use SWR or fetch to the API routes

### Error Handling Pattern
```typescript
// All API routes follow this pattern:
try {
  // ... logic
  return Response.json({ data })
} catch (error) {
  console.error('[route-name]', error)
  return Response.json({ error: 'Internal server error' }, { status: 500 })
}
```

### Prisma Client Singleton
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Category URL Mapping
Categories in URLs are lowercase: `/button`, `/card`, etc. Map them:
```typescript
const categoryFromSlug = (slug: string): Category =>
  slug.toUpperCase() as Category
```

### Component Card — What to Show
- Mini iframe preview (height: 180px) — lazy loaded
- Title (truncated to 1 line)
- Author avatar + username
- Category badge
- Tag list (max 3 shown, "+N more" if more)
- Vote score + vote buttons
- Fork count
- "Forked from X" if applicable

---

## Post-MVP Backlog (Do Not Build in MVP)

These are explicitly out of scope for MVP. Do not implement unless asked:

- Email notifications (use in-app only for now — not even in-app for MVP)
- Comments system
- Playwright screenshot for OG image generation
- Component versioning / history
- npm package export
- CLI tool (`npx openui download <id>`)
- User karma system
- Collections / bookmarks
- Import from CodePen URL
- Dark/light theme toggle in preview
- Gamification badges

---

## Common Gotchas

1. **iframe sandbox** — `allow-scripts` only. Never add `allow-same-origin`. See sandbox.ts.

2. **voteScore delta when switching vote** — if user voted +1 and switches to -1, delta is -2 (not -1). Account for this: `scoreDelta = existing ? value * 2 : value`.

3. **Fork self-reference in Prisma** — the `forkedFrom` self-relation requires both `forkedFrom` and `forks` named relations (`@relation("forks")`). Don't omit the relation name.

4. **Prisma singleton in Next.js dev** — without the globalThis trick, hot reload creates too many connections and crashes Postgres.

5. **`@babel/standalone` size** — it's ~1MB. Load it from unpkg CDN inside the iframe, not bundled into your app.

6. **User JSX must export `App` component** — the sandbox template calls `ReactDOM.createRoot(rootElement).render(React.createElement(App))`. Document this in the editor placeholder text.

7. **Cursor-based pagination** — use `createdAt` as cursor, not page numbers. Page numbers break when new items are inserted.

8. **`prisma.component.findMany` with `_count`** — include `_count: { select: { votes: true, suggestions: true, forks: true } }` in all feed queries to avoid N+1.

---

## Running Locally

```bash
# 1. Install deps
npm install

# 2. Set up env
cp .env.example .env.local
# Fill in DATABASE_URL, NEXTAUTH_SECRET, GITHUB_ID, GITHUB_SECRET, Upstash vars

# 3. Migrate DB
npx prisma migrate dev

# 4. Start dev server
npm run dev
```

---

*Last updated: OpenUI v1.0 MVP spec*
