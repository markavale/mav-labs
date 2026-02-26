# Workstream 4: Dashboard (Next.js)

## Scope

You are responsible for building the Pace Dashboard — a Next.js application that provides visual monitoring and interaction with PARA-structured data. The dashboard connects to OpenClaw via Redis pub/sub for real-time updates.

**You own:** Everything in `dashboard/`
**You do NOT touch:** `infra/`, `memory/`, `skills/`, `research/`

## Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js (App Router) | 14+ |
| Language | TypeScript | 5+ |
| Styling | Tailwind CSS | 3+ |
| Components | shadcn/ui | Latest |
| Charts | Recharts | 2+ |
| Real-time | WebSocket (ws) | 8+ |
| State | React Server Components + useState/useReducer | — |
| Icons | Lucide React | Latest |
| Fonts | Space Grotesk (sans) + JetBrains Mono (mono) | Google Fonts |

## Brand Design Tokens

```typescript
// lib/tokens.ts
export const brand = {
  colors: {
    cyan: '#22d3ee',
    purple: '#a855f7',
    sky: '#0ea5e9',
    darkBg: '#0D1117',
    darkCard: '#161B22',
    darkBorder: '#30363D',
    textPrimary: '#F0F6FC',
    textSecondary: '#8B949E',
    textMuted: '#6E7681',
    success: '#3FB950',
    warning: '#D29922',
    error: '#F85149',
    blocked: '#F85149',
    inProgress: '#A855F7',
    todo: '#8B949E',
    done: '#3FB950',
  },
  fonts: {
    sans: "'Space Grotesk', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
} as const;

export const paraColors = {
  projects: '#22d3ee',
  areas: '#a855f7',
  resources: '#0ea5e9',
  archives: '#6E7681',
} as const;
```

## Dashboard Views (8 total)

### View 1: PARA Kanban (Default/Home)

**Route:** `/`

The primary view. A Kanban board with columns: **To-Do → In Progress → Done → Blocked**

- Cards color-coded by PARA category (cyan=Projects, purple=Areas, sky=Resources)
- Each card: title, PARA category tag, priority indicator, days in column, assigned project/area
- Drag-and-drop reordering within and between columns
- Filter bar: filter by PARA category, project, priority, date range
- "Add Task" button writes to Redis `pace:notes` channel for Pace to pick up
- Real-time updates via WebSocket when Pace moves cards

### View 2: Activity Feed

**Route:** `/activity`

Real-time timestamped log of every action Pace takes.

- Infinite scroll, newest first
- Each entry: timestamp, action icon, description, PARA category tag, duration
- Filter by: PARA category, action type, date range
- Search within entries
- Click to expand: full details, files modified, output summary
- Live via Redis Streams subscription

### View 3: Projects Hub

**Route:** `/projects` and `/projects/[slug]`

Overview of all active projects with drill-down.

- Grid of project cards: name, status badge, progress indicator, last activity, top blocker
- Detail page: full description, architecture notes, metrics, task list, timeline, related PARA items
- Status badges: Active (green), Blocked (red), Paused (yellow), Archived (gray)
- "Quick Update" button writes to project's PARA file

### View 4: Notes Panel

**Route:** `/notes` (also slide-out panel on all views)

Freeform input for MAV to drop notes that Pace picks up.

- Large text area with markdown support
- "Send to Pace" publishes to Redis `pace:notes`
- History of past notes with Pace's responses
- Quick-note shortcuts: "Research: [topic]", "Task: [description]", "Idea: [thought]"
- Auto-detected or manual PARA category tagging

### View 5: Research Library

**Route:** `/research`

Searchable repository of all research outputs.

- Card grid organized by resource topic
- Each card: topic title, date, source count, key finding preview, PARA tags
- Full-text search across content
- Filter by resource topic, date range, source type
- Click-through to full research report
- "Request Research" button sends command to Pace via Redis

### View 6: Agent Status

**Route:** Component on all pages (header bar)

Real-time indicator of Pace's current state.

- Status: Idle (gray pulse), Thinking (cyan pulse), Running Sub-Agent (purple pulse), Error (red)
- Last heartbeat timestamp with "X minutes ago"
- Current task (if any)
- Expand: uptime, tasks completed today, next trigger, model usage (Sonnet vs Opus calls)

### View 7: Analytics

**Route:** `/analytics`

Charts and visualizations.

- **Task Throughput:** Bar chart — tasks per day/week (30 days)
- **PARA Distribution:** Donut chart — time/tasks across P/A/R
- **Project Velocity:** Line chart — per-project tasks over time
- **Skills Radar:** Radar chart — proficiency levels
- **Fitness Trends:** Line chart — workouts/week, running distance
- **Learning Progress:** Progress bars — Rust 40%, Go 40%, Three.js 60%
- **Research Output:** Bar chart — entries per topic per week
- Date range selector (7d, 30d, 90d, all)

### View 8: Focus Planner

**Route:** `/focus`

AI-generated daily and weekly focus recommendations.

- Today's top 3 tasks with reasoning from Pace
- Weekly priority stack ordered by strategic importance
- Editable: MAV can override priorities (feeds back to Pace)
- Calendar integration with meeting prep notes
- "What should I focus on?" triggers Pace regeneration

## API Routes

```
dashboard/app/api/
├── kanban/
│   ├── route.ts           GET: fetch board state, POST: add card
│   └── [id]/route.ts      PATCH: move/update card, DELETE: remove
├── activity/
│   └── route.ts           GET: fetch activity feed (paginated)
├── projects/
│   ├── route.ts           GET: list all projects
│   └── [slug]/route.ts    GET: project detail (parse .md file)
├── notes/
│   └── route.ts           GET: note history, POST: send note to Pace
├── research/
│   ├── route.ts           GET: list research entries
│   └── search/route.ts    GET: semantic search across research
├── status/
│   └── route.ts           GET: current agent status
├── analytics/
│   └── route.ts           GET: aggregated analytics data
├── focus/
│   └── route.ts           GET: current focus recommendations
└── ws/
    └── route.ts           WebSocket: bridge to Redis pub/sub
```

## Real-Time Architecture

```
Redis pub/sub channels          Next.js API route         Browser
─────────────────────          ──────────────────         ───────
pace:activity      ──────┐
pace:kanban        ──────┤     /api/ws (WebSocket)       React components
pace:status        ──────┼───► upgrade to WS  ──────────► useEffect listeners
pace:heartbeat     ──────┤     subscribe to Redis         update state on event
pace:notes         ◄─────┘     forward events
```

**Implementation:**
1. Next.js API route at `/api/ws` upgrades HTTP to WebSocket
2. Server-side: create Redis subscriber for all `pace:*` channels
3. On Redis message: forward to all connected WebSocket clients
4. Client-side: `useEffect` connects to WebSocket, dispatches events to components
5. Components update via React state (useState/useReducer)

## File Structure

```
dashboard/
├── app/
│   ├── layout.tsx              ← Root layout: dark theme, fonts, header with agent status
│   ├── page.tsx                ← Home: PARA Kanban
│   ├── activity/page.tsx
│   ├── projects/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── notes/page.tsx
│   ├── research/page.tsx
│   ├── analytics/page.tsx
│   ├── focus/page.tsx
│   └── api/                    ← All API routes (see above)
├── components/
│   ├── layout/
│   │   ├── header.tsx          ← Logo, nav, agent status indicator
│   │   ├── sidebar.tsx         ← Navigation with PARA category icons
│   │   └── notes-panel.tsx     ← Slide-out notes panel
│   ├── kanban/
│   │   ├── board.tsx           ← Kanban board with drag-and-drop
│   │   ├── column.tsx
│   │   └── card.tsx
│   ├── activity/
│   │   └── feed.tsx
│   ├── projects/
│   │   ├── project-card.tsx
│   │   └── project-detail.tsx
│   ├── analytics/
│   │   ├── task-throughput.tsx
│   │   ├── para-distribution.tsx
│   │   ├── skills-radar.tsx
│   │   └── fitness-trends.tsx
│   └── shared/
│       ├── para-badge.tsx      ← Color-coded PARA category badge
│       ├── status-indicator.tsx
│       └── search-bar.tsx
├── lib/
│   ├── tokens.ts               ← Brand design tokens
│   ├── redis.ts                ← Redis client + pub/sub helpers
│   ├── markdown.ts             ← Parse .md + YAML frontmatter
│   ├── websocket.ts            ← WebSocket client hook
│   └── types.ts                ← TypeScript interfaces
├── public/
│   └── fonts/                  ← Space Grotesk + JetBrains Mono (self-hosted)
├── tailwind.config.ts          ← Extended with brand colors
├── package.json
├── tsconfig.json
└── next.config.ts
```

## Development Approach

1. **Start with mock data.** Build all views against hardcoded mock data first.
2. **Component-first.** Build shared components before page views.
3. **API routes with file fallback.** Try Redis first, fall back to reading .md files directly.
4. **Mobile-responsive from start.** Tailwind responsive utilities. Kanban stacks on mobile.
5. **Dark theme only.** No light mode. The brand is dark-first.

## Testing Checklist

- [ ] All 8 views render with mock data
- [ ] Kanban drag-and-drop works across columns
- [ ] WebSocket connection to Redis pub/sub delivers real-time updates
- [ ] Notes panel successfully publishes to Redis `pace:notes`
- [ ] API routes parse PARA markdown files with YAML frontmatter correctly
- [ ] Analytics charts render with sample data (Recharts)
- [ ] Responsive layout works on mobile (375px+)
- [ ] Brand tokens applied consistently (colors, fonts, spacing)
- [ ] Agent status indicator updates in real-time
- [ ] Search works across projects and research entries
