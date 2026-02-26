# PACE AI — System Architecture

> **P**ersonal **A**I **C**ognitive **E**ngine

## Overview

PACE is a fully autonomous AI assistant built on OpenClaw, designed as a personal cognitive engine for managing knowledge, tasks, and research using the PARA methodology.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    PACE AI SYSTEM                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │
│  │   TELEGRAM   │     │  DASHBOARD   │     │    CRON      │     │   GITHUB     │   │
│  │     BOT      │     │   (Next.js)  │     │  SCHEDULER   │     │    SYNC      │   │
│  └──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘   │
│         │                    │                    │                    │            │
│         │    WebSocket       │                    │                    │            │
│         ▼                    ▼                    ▼                    ▼            │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                              REDIS (Pub/Sub + Cache)                         │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────────┐  │   │
│  │  │activity │ │ kanban  │ │ status  │ │heartbeat│ │  notes  │ │  streams  │  │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └───────────┘  │   │
│  └─────────────────────────────────────┬───────────────────────────────────────┘   │
│                                        │                                            │
│                                        ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                            OPENCLAW RUNTIME                                  │   │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐          │   │
│  │  │     GATEWAY     │───▶│  AGENT RUNTIME  │───▶│    SANDBOX      │          │   │
│  │  │  (localhost:    │    │                 │    │    (Docker)     │          │   │
│  │  │     18789)      │    │  ┌───────────┐  │    │                 │          │   │
│  │  └─────────────────┘    │  │  DeepSeek │  │    │  ┌───────────┐  │          │   │
│  │                         │  │   Chat    │  │    │  │Sub-Agents │  │          │   │
│  │                         │  ├───────────┤  │    │  │(Isolated) │  │          │   │
│  │                         │  │  DeepSeek │  │    │  └───────────┘  │          │   │
│  │                         │  │ Reasoner  │  │    └─────────────────┘          │   │
│  │                         │  └───────────┘  │                                  │   │
│  │                         └─────────────────┘                                  │   │
│  └─────────────────────────────────────┬───────────────────────────────────────┘   │
│                                        │                                            │
│                                        ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                              CORE MODULES                                    │   │
│  │                                                                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │   │
│  │  │   MEMORY    │  │   SKILLS    │  │  RESEARCH   │  │    INFRA    │         │   │
│  │  │             │  │             │  │   ENGINE    │  │             │         │   │
│  │  │ • SOUL.md   │  │ • morning-  │  │             │  │ • Docker    │         │   │
│  │  │ • AGENTS.md │  │   pulse     │  │ • Brave API │  │ • systemd   │         │   │
│  │  │ • MEMORY.md │  │ • daily-    │  │ • Serper    │  │ • scripts   │         │   │
│  │  │ • PARA/     │  │   briefing  │  │ • Apify     │  │ • cron      │         │   │
│  │  │   ├─projects│  │ • research- │  │ • Synthesis │  │             │         │   │
│  │  │   ├─areas   │  │   agent     │  │ • PARA      │  │             │         │   │
│  │  │   ├─resources│ │ • fitness-  │  │   Categoriz │  │             │         │   │
│  │  │   └─archives│  │   tracker   │  │             │  │             │         │   │
│  │  │             │  │ • +6 more   │  │             │  │             │         │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘         │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### 1. Interface Layer

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERFACE LAYER                          │
├─────────────────┬─────────────────┬─────────────────────────────┤
│                 │                 │                             │
│  ┌───────────┐  │  ┌───────────┐  │  ┌───────────────────────┐  │
│  │ TELEGRAM  │  │  │ DASHBOARD │  │  │    SCHEDULED JOBS     │  │
│  │           │  │  │           │  │  │                       │  │
│  │ • Commands│  │  │ • Kanban  │  │  │ • 05:30 Morning Pulse │  │
│  │ • Chat    │  │  │ • Activity│  │  │ • 21:00 Daily Wrap    │  │
│  │ • Alerts  │  │  │ • Projects│  │  │ • 23:00 Research Sweep│  │
│  │           │  │  │ • Notes   │  │  │ • Every 30m Heartbeat │  │
│  │           │  │  │ • Research│  │  │                       │  │
│  │           │  │  │ • Focus   │  │  │                       │  │
│  └───────────┘  │  └───────────┘  │  └───────────────────────┘  │
│                 │                 │                             │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

### 2. Dashboard Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DASHBOARD (Next.js 14)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      PAGES (App Router)                  │   │
│  │  /              → PARA Kanban Board                      │   │
│  │  /activity      → Real-time Activity Feed                │   │
│  │  /projects      → Project Hub                            │   │
│  │  /projects/[id] → Project Detail                         │   │
│  │  /notes         → Notes Panel                            │   │
│  │  /research      → Research Library                       │   │
│  │  /analytics     → Charts & Metrics                       │   │
│  │  /focus         → AI Focus Recommendations               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      API ROUTES                          │   │
│  │  /api/kanban/*     → Kanban CRUD                         │   │
│  │  /api/activity     → Activity Feed                       │   │
│  │  /api/projects/*   → Project Management                  │   │
│  │  /api/notes        → Note Input                          │   │
│  │  /api/research/*   → Research Queries                    │   │
│  │  /api/analytics    → Metrics Data                        │   │
│  │  /api/status       → Agent Status                        │   │
│  │  /api/ws           → WebSocket Bridge                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    REDIS CONNECTION                      │   │
│  │  Subscribe: pace:activity, pace:kanban, pace:status      │   │
│  │  Publish:   pace:notes                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Research Engine Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                      RESEARCH ENGINE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐    ┌──────────────────────────────────────────┐   │
│  │ TRIGGER │───▶│            INTENT CLASSIFIER              │   │
│  │         │    │  • quick_lookup  → Sonnet                 │   │
│  │ • Cron  │    │  • deep_dive     → Reasoner               │   │
│  │ • Manual│    │  • comparison    → Reasoner               │   │
│  │ • Skill │    │  • trend_scan    → Sonnet                 │   │
│  └─────────┘    │  • news_check    → Sonnet                 │   │
│                 └──────────────────┬───────────────────────┘   │
│                                    │                            │
│                                    ▼                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  QUERY BUILDER                           │   │
│  │  Topic Expansion → Time Filtering → Source Selection     │   │
│  └─────────────────────────────┬───────────────────────────┘   │
│                                │                                │
│                                ▼                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              MULTI-SOURCE QUERY (Parallel)               │   │
│  │                                                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │   │
│  │  │  BRAVE   │  │  SERPER  │  │  APIFY   │  │  MEMORY  │ │   │
│  │  │  Search  │  │   SERP   │  │ Scraping │  │  Search  │ │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │   │
│  │       │             │             │             │        │   │
│  │       └─────────────┴─────────────┴─────────────┘        │   │
│  │                          │                               │   │
│  └──────────────────────────┼───────────────────────────────┘   │
│                             ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    AGGREGATOR                            │   │
│  │  Deduplicate → Score → Rank → Filter                     │   │
│  └─────────────────────────────┬───────────────────────────┘   │
│                                │                                │
│                                ▼                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    SYNTHESIZER                           │   │
│  │  LLM Analysis → Key Findings → Action Items              │   │
│  └─────────────────────────────┬───────────────────────────┘   │
│                                │                                │
│                                ▼                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    PARA      │  │   STORAGE    │  │   DELIVERY   │          │
│  │ CATEGORIZER  │  │   WRITER     │  │  FORMATTER   │          │
│  │              │  │              │  │              │          │
│  │ Auto-tag to  │  │ • Resources  │  │ • Telegram   │          │
│  │ P/A/R        │  │ • Daily Log  │  │ • PDF Report │          │
│  │              │  │ • Redis      │  │ • Dashboard  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Memory & Identity System

```
┌─────────────────────────────────────────────────────────────────┐
│                    MEMORY SYSTEM (PARA)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    IDENTITY LAYER                        │   │
│  │                                                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │   SOUL.md   │  │  AGENTS.md  │  │  MEMORY.md  │      │   │
│  │  │             │  │             │  │             │      │   │
│  │  │ Personality │  │ Constraints │  │ User Profile│      │   │
│  │  │ Voice/Tone  │  │ Boundaries  │  │ Preferences │      │   │
│  │  │ Values      │  │ Capabilities│  │ Context     │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    PARA STRUCTURE                        │   │
│  │                                                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │  PROJECTS   │  │    AREAS    │  │  RESOURCES  │      │   │
│  │  │             │  │             │  │             │      │   │
│  │  │ • EchoSight │  │ • Health    │  │ • RAG Arch  │      │   │
│  │  │ • RAG Bot   │  │ • Learning  │  │ • AI Trends │      │   │
│  │  │ • Pace      │  │ • Investing │  │ • Multi-    │      │   │
│  │  │ • SERP      │  │ • Leadership│  │   Agent     │      │   │
│  │  │   Scrapers  │  │ • Content   │  │ • Scraping  │      │   │
│  │  │ • +7 more   │  │ • Branding  │  │ • +3 more   │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  │                                                          │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │                   ARCHIVES                       │    │   │
│  │  │  • Coffee Website • E-Barangay • VPN Rotator    │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### User Interaction Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   USER   │────▶│ TELEGRAM │────▶│ OPENCLAW │────▶│ DEEPSEEK │
│          │     │   BOT    │     │  GATEWAY │     │   LLM    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                        │
     ┌──────────────────────────────────┘
     │
     ▼
┌──────────┐     ┌──────────┐     ┌──────────┐
│  SKILLS  │────▶│  MEMORY  │────▶│  REDIS   │
│          │     │  (PARA)  │     │ PUB/SUB  │
└──────────┘     └──────────┘     └──────────┘
                                        │
     ┌──────────────────────────────────┘
     │
     ▼
┌──────────┐     ┌──────────┐     ┌──────────┐
│DASHBOARD │◀────│WEBSOCKET │◀────│ UPDATES  │
│          │     │          │     │          │
└──────────┘     └──────────┘     └──────────┘
```

### Heartbeat Cycle (Every 30 Minutes)

```
┌─────────────────────────────────────────────────────────────┐
│                    HEARTBEAT SEQUENCE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. WAKE                                                     │
│     └──▶ Load SOUL.md, AGENTS.md, MEMORY.md                 │
│                                                              │
│  2. DASHBOARD SYNC                                           │
│     └──▶ Verify Redis connections                           │
│                                                              │
│  3. NOTES CHECK                                              │
│     └──▶ Scan pace:notes channel                            │
│                                                              │
│  4. EMAIL MONITOR                                            │
│     └──▶ Check Gmail inbox                                  │
│                                                              │
│  5. PARA SCAN                                                │
│     └──▶ Check for updates, new items                       │
│                                                              │
│  6. TASK PICKUP                                              │
│     └──▶ Pull next To-Do (priority ordered)                 │
│                                                              │
│  7. EXECUTE                                                  │
│     └──▶ Spawn sub-agents if needed (Docker)                │
│                                                              │
│  8. COMMIT                                                   │
│     └──▶ Push changes to GitHub                             │
│                                                              │
│  9. LOG                                                      │
│     └──▶ Write to daily log + Redis stream                  │
│                                                              │
│  10. UPDATE KANBAN                                           │
│      └──▶ Move tasks, publish events                        │
│                                                              │
│  11. NOTIFY                                                  │
│      └──▶ Telegram message if actionable                    │
│                                                              │
│  12. MEMORY FLUSH                                            │
│      └──▶ Extract key info if context limit                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                     TECHNOLOGY STACK                         │
├──────────────────┬──────────────────────────────────────────┤
│ CATEGORY         │ TECHNOLOGIES                             │
├──────────────────┼──────────────────────────────────────────┤
│ LLM Provider     │ DeepSeek (Chat + Reasoner)               │
├──────────────────┼──────────────────────────────────────────┤
│ Agent Runtime    │ OpenClaw (self-hosted)                   │
├──────────────────┼──────────────────────────────────────────┤
│ Frontend         │ Next.js 14, React 18, TypeScript         │
├──────────────────┼──────────────────────────────────────────┤
│ Styling          │ Tailwind CSS, Custom Design Tokens       │
├──────────────────┼──────────────────────────────────────────┤
│ Charts           │ Recharts                                 │
├──────────────────┼──────────────────────────────────────────┤
│ Real-time        │ Redis Pub/Sub, WebSocket                 │
├──────────────────┼──────────────────────────────────────────┤
│ Cache/State      │ Redis 7+                                 │
├──────────────────┼──────────────────────────────────────────┤
│ Search APIs      │ Brave Search, Serper (Google), Apify     │
├──────────────────┼──────────────────────────────────────────┤
│ Communication    │ Telegram Bot API (grammY)                │
├──────────────────┼──────────────────────────────────────────┤
│ Containerization │ Docker, Docker Compose                   │
├──────────────────┼──────────────────────────────────────────┤
│ Process Manager  │ systemd                                  │
├──────────────────┼──────────────────────────────────────────┤
│ Version Control  │ Git, GitHub                              │
├──────────────────┼──────────────────────────────────────────┤
│ VPS              │ Ubuntu 22.04 (4GB RAM, 2 vCPU)           │
└──────────────────┴──────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         VPS (Ubuntu 22.04)                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                     DOCKER COMPOSE                          │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │ │
│  │  │  DASHBOARD  │  │   REDIS     │  │  SANDBOX    │         │ │
│  │  │  (Next.js)  │  │   :6379     │  │  (Isolated) │         │ │
│  │  │   :3000     │  │             │  │             │         │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                     SYSTEMD SERVICES                        │ │
│  │                                                             │ │
│  │  ┌─────────────────┐  ┌─────────────────┐                  │ │
│  │  │ pace-openclaw   │  │ pace-health     │                  │ │
│  │  │    .service     │  │   .timer        │                  │ │
│  │  │                 │  │  (every 5min)   │                  │ │
│  │  │ OpenClaw Gateway│  │ Health Monitor  │                  │ │
│  │  │ + Agent Runtime │  │ + Alerts        │                  │ │
│  │  └─────────────────┘  └─────────────────┘                  │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                     SECURITY LAYER                          │ │
│  │                                                             │ │
│  │  • UFW Firewall (SSH only)                                 │ │
│  │  • Tailscale VPN for remote access                         │ │
│  │  • Gateway bound to localhost:18789                        │ │
│  │  • Redis bound to localhost:6379                           │ │
│  │  • Telegram allowlist (MAV only)                           │ │
│  │  • Docker sandbox isolation                                │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Tailscale VPN
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                            │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ DEEPSEEK │  │  BRAVE   │  │  SERPER  │  │  GITHUB  │        │
│  │   API    │  │  SEARCH  │  │   API    │  │          │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │  APIFY   │  │ TELEGRAM │  │  GOOGLE  │                      │
│  │          │  │   API    │  │ WORKSPACE│                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Skills Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         10 CUSTOM SKILLS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PRIORITY 1 (Daily Use)                                         │
│  ┌─────────────────┐  ┌─────────────────┐                       │
│  │  morning-pulse  │  │  daily-briefing │                       │
│  │                 │  │                 │                       │
│  │ • Weather       │  │ • Task Summary  │                       │
│  │ • Calendar      │  │ • Focus Areas   │                       │
│  │ • Priority Tasks│  │ • Blockers      │                       │
│  │ • AI Updates    │  │ • Wins          │                       │
│  └─────────────────┘  └─────────────────┘                       │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐                       │
│  │ research-agent  │  │ fitness-tracker │                       │
│  │                 │  │                 │                       │
│  │ • Multi-source  │  │ • Workout Logs  │                       │
│  │ • Synthesis     │  │ • Progress      │                       │
│  │ • PARA Tagging  │  │ • Goals         │                       │
│  └─────────────────┘  └─────────────────┘                       │
│                                                                  │
│  PRIORITY 2 (Weekly Use)                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │learning-curator │  │  code-reviewer  │  │ content-writer  │  │
│  │                 │  │                 │  │                 │  │
│  │ • Curate        │  │ • PR Analysis   │  │ • Blog Posts    │  │
│  │ • Track Progress│  │ • Best Practices│  │ • LinkedIn      │  │
│  │ • Recommend     │  │ • Suggestions   │  │ • Threads       │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                  │
│  PRIORITY 3 (Specialized)                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │triple-p-planner │  │  mav-identity   │  │  resume-tailor  │  │
│  │                 │  │                 │  │                 │  │
│  │ • Strategic     │  │ • Voice/Tone    │  │ • Job-specific  │  │
│  │ • Weekly Review │  │ • Branding      │  │ • ATS Optimized │  │
│  │ • Goal Tracking │  │ • Consistency   │  │ • Keywords      │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LAYER 1: Network Security                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ • UFW Firewall: Block all except SSH (22)                 │  │
│  │ • Tailscale VPN: Secure remote access                     │  │
│  │ • No public ports exposed                                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  LAYER 2: Application Security                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ • Gateway bound to 127.0.0.1:18789                        │  │
│  │ • Redis bound to 127.0.0.1:6379                           │  │
│  │ • Telegram allowlist (single user)                        │  │
│  │ • Input validation on API routes                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  LAYER 3: Container Security                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ • Docker sandbox with no-new-privileges                   │  │
│  │ • Non-root user in containers                             │  │
│  │ • Resource limits (CPU: 2, Memory: 2GB)                   │  │
│  │ • Isolated network for sandbox                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  LAYER 4: Secrets Management                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ • All secrets in .env files (never committed)             │  │
│  │ • .gitignore configured                                   │  │
│  │ • Environment variables for runtime config                │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Structure Overview

```
pace/
├── ARCHITECTURE.md          ← You are here
├── CLAUDE.md                ← Project overview
├── docker-compose.yml       ← Container orchestration
├── .env.example             ← Environment template
├── .gitignore               ← Git exclusions
│
├── infra/                   ← Infrastructure (Workstream 1)
│   ├── config/              ← OpenClaw config, .env
│   ├── docs/                ← Setup documentation
│   ├── services/            ← systemd units
│   ├── docker/              ← Dockerfiles
│   └── scripts/             ← Utility scripts
│
├── memory/                  ← Memory & Identity (Workstream 2)
│   ├── SOUL.md              ← Pace personality
│   ├── AGENTS.md            ← Agent constraints
│   ├── MEMORY.md            ← User profile
│   ├── templates/           ← Daily log template
│   └── para/                ← PARA structure
│       ├── projects/        ← Active projects (12)
│       ├── areas/           ← Ongoing areas (6)
│       ├── resources/       ← Research topics (7)
│       └── archives/        ← Completed items (3)
│
├── skills/                  ← Custom Skills (Workstream 3)
│   ├── morning-pulse/
│   ├── daily-briefing/
│   ├── research-agent/
│   ├── fitness-tracker/
│   ├── learning-curator/
│   ├── code-reviewer/
│   ├── content-writer/
│   ├── triple-p-planner/
│   ├── mav-identity/
│   └── resume-tailor/
│
├── dashboard/               ← Next.js Dashboard (Workstream 4)
│   ├── app/                 ← App Router pages + API
│   ├── components/          ← React components
│   ├── lib/                 ← Utilities, types, tokens
│   ├── public/              ← Static assets
│   └── Dockerfile           ← Production build
│
└── research/                ← Research Engine (Workstream 5)
    ├── clients/             ← API clients (Brave, Serper, Apify)
    ├── modules/             ← Pipeline modules (7)
    ├── config/              ← YAML configurations
    ├── types/               ← TypeScript interfaces
    └── Dockerfile           ← Production build
```

---

## Integration Matrix

| Source | Target | Method | Data |
|--------|--------|--------|------|
| Telegram | OpenClaw | Bot API | Messages, Commands |
| OpenClaw | Redis | Pub/Sub | Events, State |
| Redis | Dashboard | WebSocket | Real-time Updates |
| Dashboard | Redis | Pub/Sub | Notes, Commands |
| Research | Redis | Streams | Activity Log |
| Research | Memory | File Write | PARA Resources |
| OpenClaw | GitHub | Git Push | State Persistence |
| Cron | OpenClaw | Trigger | Scheduled Tasks |

---

## Performance Considerations

| Component | Optimization |
|-----------|--------------|
| Dashboard | Standalone build, static generation where possible |
| Redis | Pub/Sub for real-time, Streams for persistence |
| Research | Parallel API calls, rate limiting, caching |
| LLM | Sonnet for quick tasks, Reasoner for complex |
| Docker | Multi-stage builds, alpine base images |
| Sandbox | Resource limits, ephemeral containers |

---

*Last Updated: February 2026*
