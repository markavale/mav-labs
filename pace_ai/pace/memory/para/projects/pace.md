---
project: Pace (Personal AI Cognitive Engine)
status: active
priority: high
started: 2026-02-24
category: personal
tags: [openclaw, ai-assistant, telegram, para, nextjs, redis]
last_updated: 2026-02-26
---

# Pace — Personal AI Cognitive Engine

## Overview

Fully autonomous AI assistant built on OpenClaw for MAV. Runs on a VPS, communicates via Telegram, manages knowledge using PARA method, provides a Next.js dashboard for monitoring and interaction.

## Current Status

Dashboard authentication implemented. WS4 dashboard has branded login page with JWT sessions, Redis rate limiting, and full route protection. Pushed to GitHub. Remaining workstreams pending VPS deployment.

## Architecture Notes

- **Runtime:** OpenClaw (self-hosted agent OS) on Ubuntu 22.04 VPS
- **LLM:** Claude Sonnet 4.5 (routine) / Opus 4.5 (complex)
- **Communication:** Telegram Bot API (grammY adapter)
- **Database:** SQLite + sqlite-vec (memory) / Redis (real-time pub/sub + cache)
- **Dashboard:** Next.js 14+ with Tailwind CSS, shadcn/ui
- **Research:** Brave Search + Serper + Apify
- **Scheduling:** Redis-backed cron, 30-minute heartbeat loop

## Key Metrics

- Target: 48 heartbeats/day (every 30 minutes)
- Target: Morning pulse delivered by 5:30 AM PHT daily
- Target: All PARA files maintained and current
- Target: < 5 minute response time on Telegram queries

## Blockers

- VPS not yet provisioned
- OpenClaw not yet installed
- API keys not yet configured

## Completed

- [x] WS4: Scaffold Next.js dashboard
- [x] WS4: Dashboard authentication (JWT login, rate limiting, route protection)
- [x] WS5: Research engine implemented (Brave, Serper, Apify clients)

## Next Actions

- [ ] WS1: Provision VPS and install OpenClaw
- [ ] WS2: Create all PARA content files
- [ ] WS3: Build all 10 SKILL.md files
- [ ] WS4: Set AUTH_PASSWORD_HASH and AUTH_JWT_SECRET on VPS
- [ ] WS5: Configure research engine API keys on VPS

## Related PARA Items

- [[self-improving-ai]] — research on autonomous AI workflows
- [[multi-agent-systems]] — research on agent architectures
- [[content-creation]] — Pace helps with content pipeline
