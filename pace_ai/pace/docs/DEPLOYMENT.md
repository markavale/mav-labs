# PACE AI — Deployment Guide

> Complete deployment reference for PACE (Personal AI Cognitive Engine)

---

## Table of Contents

1. [Deployment Overview](#1-deployment-overview)
2. [Service Deployment Matrix](#2-service-deployment-matrix)
3. [Single VPS Deployment (Recommended)](#3-single-vps-deployment-recommended)
4. [Environment Configuration](#4-environment-configuration)
5. [Service Architecture](#5-service-architecture)
6. [Networking & Security](#6-networking--security)
7. [Deployment Commands](#7-deployment-commands)
8. [Scaling Considerations](#8-scaling-considerations)
9. [Monitoring & Maintenance](#9-monitoring--maintenance)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Deployment Overview

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Single VPS (Ubuntu 22.04)                   │
│                         4GB RAM / 2 vCPU                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐        │
│  │   Telegram   │────▶│   OpenClaw   │◀───▶│    Redis     │        │
│  │   Bot API    │     │   Gateway    │     │   (pub/sub)  │        │
│  └──────────────┘     │  :18789      │     │   :6379      │        │
│                       └──────┬───────┘     └──────┬───────┘        │
│                              │                    │                │
│                              │                    ▼                │
│                       ┌──────▼───────┐     ┌──────────────┐        │
│                       │   Sandbox    │     │  Dashboard   │        │
│                       │  (ephemeral) │     │  (Next.js)   │        │
│                       │   Docker     │     │   :3000      │        │
│                       └──────────────┘     └──────────────┘        │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Memory Files: SOUL.md, AGENTS.md, MEMORY.md, PARA/          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
          │                                        ▲
          │ Tailscale VPN                          │ Localhost only
          ▼                                        │ (no public ports)
    ┌──────────┐
    │   MAV    │
    │ (remote) │
    └──────────┘
```

### Deployment Options Comparison

| Aspect | Single VPS (Recommended) | Split Deployment |
|--------|--------------------------|------------------|
| **Latency** | ~1ms (localhost) | 10-50ms (network) |
| **Complexity** | Low | High |
| **Cost** | ~$20/month | $40-80/month |
| **Use Case** | Personal assistant | Team/multi-user |
| **Scaling** | Vertical | Horizontal |
| **Maintenance** | Simple | Complex |
| **Security** | Localhost isolation | Network security required |

### Recommendation

**Use Single VPS Deployment** unless you have:
- Multiple concurrent users needing isolated instances
- Dashboard traffic exceeding 10,000 requests/day
- RAM requirements exceeding 8GB

PACE is designed as a personal assistant for Mark Anthony Vale (MAV). All components benefit from co-location on a single VPS.

---

## 2. Service Deployment Matrix

### Services Overview

| Service | Type | Port | Always Running | Can Separate? | Resource Usage |
|---------|------|------|----------------|---------------|----------------|
| **Redis** | Data Store | 6379 | Yes | Yes (managed) | 50-200MB RAM |
| **OpenClaw Gateway** | Agent Runtime | 18789 | Yes | No | 200-500MB RAM |
| **Dashboard** | Web App | 3000 | Yes | Yes | 150-300MB RAM |
| **Research Engine** | Library | N/A | No (invoked) | N/A | Included in OpenClaw |
| **Sandbox** | Container | N/A | No (ephemeral) | N/A | 2GB limit per instance |
| **Telegram Bot** | Integration | N/A | Yes | No (OpenClaw) | Included in OpenClaw |
| **Cron Scheduler** | Scheduler | N/A | Yes | No (OpenClaw) | Included in OpenClaw |

### Service Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Redis ◀────────────┬────────────────────┬────────────────┐│
│    │                │                    │                ││
│    ▼                ▼                    ▼                ▼│
│  OpenClaw ───▶ Dashboard          Research Engine    Cron ││
│    │                                                       │
│    ▼                                                       │
│  Sandbox (ephemeral)                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Legend:
  ◀─── Required dependency (must start first)
  ───▶ Spawns/invokes
```

### Which Services Must Run Together

| Group | Services | Reason |
|-------|----------|--------|
| **Core** | Redis + OpenClaw | OpenClaw requires Redis for cron, pub/sub, and state |
| **Optional** | Dashboard | Can run independently if Redis is available |
| **On-Demand** | Sandbox | Ephemeral containers spawned by OpenClaw |
| **Bundled** | Telegram, Cron, Research | Part of OpenClaw runtime |

---

## 3. Single VPS Deployment (Recommended)

### Prerequisites

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| **OS** | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| **RAM** | 4GB | 8GB |
| **vCPU** | 2 | 4 |
| **Storage** | 40GB SSD | 80GB SSD |
| **Node.js** | 22.x | 22.x (LTS) |
| **Docker** | 24.x | Latest stable |
| **Python** | 3.11+ | 3.11+ |

### Step-by-Step Installation

#### Step 1: VPS Initial Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential software-properties-common

# Create dedicated user
sudo useradd -m -s /bin/bash pace
sudo usermod -aG sudo pace
sudo passwd pace

# Switch to pace user
sudo su - pace
```

#### Step 2: Install Node.js 22

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

# Install Node.js 22
nvm install 22
nvm use 22
nvm alias default 22

# Install pnpm
npm install -g pnpm

# Verify
node --version  # Should show v22.x.x
```

#### Step 3: Install Docker

```bash
# Install Docker dependencies
sudo apt install -y apt-transport-https ca-certificates gnupg lsb-release

# Add Docker GPG key and repository
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add pace user to docker group
sudo usermod -aG docker pace
newgrp docker

# Verify
docker --version
docker compose version
```

#### Step 4: Install Redis

```bash
# Install Redis
sudo apt install -y redis-server

# Configure Redis to bind to localhost only
sudo sed -i 's/^bind .*/bind 127.0.0.1 ::1/' /etc/redis/redis.conf

# Enable persistence
sudo sed -i 's/^# appendonly no/appendonly yes/' /etc/redis/redis.conf

# Start and enable Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify
redis-cli ping  # Should return PONG
```

#### Step 5: Clone and Configure PACE

```bash
# Clone repository
cd ~
git clone git@github.com:markavale/pace.git
cd pace

# Create environment file
cp infra/config/.env.example ~/.env

# Edit environment variables
nano ~/.env  # Fill in all required values
```

#### Step 6: Build and Start Services

```bash
# Build Docker images
docker compose build

# Start Redis + Dashboard (minimal stack)
docker compose up -d redis dashboard

# Verify services
docker compose ps
```

#### Step 7: Install OpenClaw Systemd Service

```bash
# Copy systemd service file
sudo cp infra/services/pace-openclaw.service /etc/systemd/system/
sudo cp infra/services/pace-health.service /etc/systemd/system/
sudo cp infra/services/pace-health.timer /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable and start OpenClaw
sudo systemctl enable pace-openclaw
sudo systemctl start pace-openclaw

# Enable health check timer
sudo systemctl enable pace-health.timer
sudo systemctl start pace-health.timer

# Verify
sudo systemctl status pace-openclaw
```

#### Step 8: Verify Deployment

```bash
# Run the pace-ctl status command
./infra/scripts/pace-ctl.sh status

# Expected output:
# === Pace Service Status ===
# OpenClaw: Running
# Redis: Running
# Health Timer: Active
# Docker: Running
```

---

## 4. Environment Configuration

### Required Environment Variables

Create `~/.env` with the following:

```bash
# =============================================================================
# LLM Providers
# =============================================================================
# Primary: DeepSeek (routine tasks)
DEEPSEEK_API_KEY=sk-your-deepseek-key-here

# Secondary: Anthropic (complex reasoning)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# =============================================================================
# Telegram Bot
# =============================================================================
# Get from @BotFather
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Your Telegram user ID (get from @userinfobot)
MAV_TELEGRAM_ID=123456789

# =============================================================================
# Redis
# =============================================================================
REDIS_URL=redis://127.0.0.1:6379

# =============================================================================
# Research APIs
# =============================================================================
# Brave Search API - https://brave.com/search/api/
BRAVE_API_KEY=your-brave-api-key

# Serper API - https://serper.dev/
SERPER_API_KEY=your-serper-api-key

# Apify - https://apify.com/
APIFY_TOKEN=your-apify-token

# =============================================================================
# GitHub
# =============================================================================
# Personal access token with repo scope
GITHUB_TOKEN=ghp_your-token-here
GITHUB_REPO=markavale/pace

# =============================================================================
# Google Workspace (Optional)
# =============================================================================
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
GMAIL_ADDRESS=pace.mav@your-domain.com

# =============================================================================
# Dashboard Authentication
# =============================================================================
# Generate password hash:
#   node -e "require('bcryptjs').hash('yourpassword',12).then(h=>console.log(h))"
AUTH_PASSWORD_HASH=$2b$12$your-bcrypt-hash-here

# Generate JWT secret (256-bit random):
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
AUTH_JWT_SECRET=your-256-bit-hex-secret-here

# Session duration (default: 7 days)
AUTH_SESSION_DURATION=7d

# =============================================================================
# System
# =============================================================================
TZ=Asia/Manila
OPENCLAW_LOG_LEVEL=info
```

### Secrets Management Best Practices

1. **Never commit `.env` files** — Add to `.gitignore`
2. **Use restrictive permissions** — `chmod 600 ~/.env`
3. **Rotate API keys quarterly** — Set calendar reminders
4. **Separate production/development** — Use `.env.production` and `.env.development`
5. **Document required variables** — Keep `.env.example` updated

### Environment Variable Loading

```bash
# OpenClaw loads from multiple sources (in order):
# 1. /etc/pace/env (system-wide)
# 2. ~/.env (user-level)
# 3. .env in project directory
# 4. Environment variables set in shell/systemd

# For Docker Compose, use .env in project root
cp ~/.env /path/to/pace/.env
```

---

## 5. Service Architecture

### Redis (Always Containerized)

**Role:** Real-time pub/sub, cron persistence, caching

**Configuration:**
```yaml
# docker-compose.yml (excerpt)
redis:
  image: redis:7-alpine
  container_name: pace-redis
  ports:
    - "6379:6379"  # Binds to localhost only via UFW
  volumes:
    - redis_data:/data
  command: redis-server --appendonly yes
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 10s
```

**Pub/Sub Channels:**
| Channel | Purpose |
|---------|---------|
| `pace:activity` | Activity feed events |
| `pace:kanban` | Kanban state changes |
| `pace:status` | Agent status (idle/thinking/running) |
| `pace:heartbeat` | Heartbeat tick events |
| `pace:notes` | Notes from dashboard |

### OpenClaw (Systemd or Containerized)

**Role:** Agent runtime, Telegram bot, cron scheduler

**Two deployment options:**

**Option A: Systemd (Recommended for VPS)**
```ini
# /etc/systemd/system/pace-openclaw.service
[Unit]
Description=Pace OpenClaw Gateway and Agent Runtime
After=network.target redis-server.service docker.service

[Service]
Type=simple
User=pace
WorkingDirectory=/home/pace/openclaw
ExecStart=/home/pace/pace/scripts/openclaw-start.sh
Restart=always
RestartSec=10
```

**Option B: Docker (Full containerization)**
```bash
# Start with full profile
docker compose --profile full up -d openclaw
```

### Dashboard (Containerized)

**Role:** Next.js 14 web app for visualization

**Modes:**
```bash
# Production mode
docker compose up -d dashboard

# Development mode (hot reload)
docker compose --profile dev up -d dashboard-dev
```

**Ports:**
- Production: `http://localhost:3000`
- Development: `http://localhost:3000` (with hot reload)

### Research Engine (Library, Not Standalone)

**Role:** TypeScript modules invoked by OpenClaw

The Research Engine is **not a running service**. It consists of:
- `search.ts` — Brave/Serper search integration
- `scrape.ts` — Apify web scraping
- `aggregate.ts` — Multi-source aggregation

These are imported and called by OpenClaw skills.

### Sandbox (Ephemeral Containers)

**Role:** Isolated code execution environment

**Constraints:**
| Limit | Value |
|-------|-------|
| CPU | 2 cores |
| Memory | 2GB |
| Filesystem | Ephemeral (tmpfs) |
| Network | Internal only (no internet) |
| User | Non-root (`sandbox`) |

**Invocation:**
```bash
# Via OpenClaw
# Sandbox containers are created on-demand and destroyed after execution

# Manual testing
./infra/scripts/sandbox-run.sh "python -c 'print(1+1)'"
```

---

## 6. Networking & Security

### Firewall Rules (UFW)

```bash
# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Only allow SSH
sudo ufw allow ssh
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable

# Verify
sudo ufw status verbose
```

**Critical:** No ports except SSH (22) are exposed publicly. All services bind to `127.0.0.1`.

### Tailscale VPN Setup

Tailscale provides secure remote access without exposing ports.

```bash
# Install Tailscale
curl -fsSL https://tailscale.com/install.sh | sh

# Start and authenticate
sudo tailscale up

# Get your Tailscale IP
tailscale ip -4  # e.g., 100.x.x.x
```

**Access services via Tailscale:**
```bash
# From MAV's machine (must be on same Tailnet)
ssh pace@100.x.x.x              # SSH access
http://100.x.x.x:3000           # Dashboard
http://100.x.x.x:18789          # OpenClaw Gateway
```

### Localhost Binding Strategy

| Service | Bind Address | Externally Accessible? |
|---------|--------------|------------------------|
| Redis | 127.0.0.1:6379 | No |
| OpenClaw Gateway | 127.0.0.1:18789 | No |
| Dashboard | 0.0.0.0:3000 | Via Tailscale only |

### No Public Ports Policy

PACE follows a strict "no public ports" policy:
1. All services bind to localhost
2. UFW blocks all incoming except SSH
3. Remote access only via Tailscale VPN
4. Telegram bot uses outbound webhook (no inbound port)

### Security Checklist

- [ ] Gateway bound to 127.0.0.1 only
- [ ] Redis bound to 127.0.0.1 only
- [ ] All API keys in `.env`, not in config files
- [ ] Telegram allowlist configured (MAV_TELEGRAM_ID)
- [ ] Docker sandbox limits verified
- [ ] Tailscale required for remote access
- [ ] GitHub repo is private
- [ ] UFW enabled with deny incoming
- [ ] SSH key authentication (password disabled)

---

## 7. Deployment Commands

### Using pace-ctl.sh

```bash
# Start all services
./infra/scripts/pace-ctl.sh start

# Stop all services
./infra/scripts/pace-ctl.sh stop

# Restart services
./infra/scripts/pace-ctl.sh restart

# Check status
./infra/scripts/pace-ctl.sh status

# View logs
./infra/scripts/pace-ctl.sh logs

# Run health check
./infra/scripts/pace-ctl.sh health

# Check Redis status
./infra/scripts/pace-ctl.sh redis

# Check Docker/sandbox status
./infra/scripts/pace-ctl.sh docker
```

### Docker Compose Profiles

```bash
# Minimal stack (Redis + Dashboard)
docker compose up -d

# Development mode (with hot reload)
docker compose --profile dev up -d

# Full stack (includes OpenClaw container)
docker compose --profile full up -d

# With sandbox runner
docker compose --profile sandbox up -d

# Stop all
docker compose down

# Stop and remove volumes (CAUTION: data loss)
docker compose down -v
```

### Development Mode

```bash
# Start Redis only
docker compose up -d redis

# Run Dashboard in dev mode
docker compose --profile dev up -d dashboard-dev

# Or run Next.js directly
cd dashboard
npm run dev
```

### Production Mode

```bash
# Build all images
docker compose build

# Start production stack
docker compose up -d redis dashboard

# Start OpenClaw via systemd
sudo systemctl start pace-openclaw

# Enable auto-start on boot
sudo systemctl enable pace-openclaw
sudo systemctl enable pace-health.timer
```

### Minimal Stack (Redis + Dashboard Only)

For testing or when OpenClaw is temporarily unavailable:

```bash
docker compose up -d redis dashboard

# Dashboard will show cached data from Redis
# No new heartbeats or Telegram integration
```

---

## 8. Scaling Considerations

### When to Scale

| Indicator | Threshold | Action |
|-----------|-----------|--------|
| RAM usage | > 80% consistently | Upgrade VPS or optimize |
| Dashboard latency | > 500ms | Consider separate deployment |
| Heartbeat duration | > 5 minutes | Optimize skills or add CPU |
| Redis memory | > 1GB | Archive old streams |
| Concurrent users | > 3 | Consider multi-instance |

### Vertical Scaling (Recommended First)

```bash
# Current: 4GB RAM, 2 vCPU
# Upgrade path:
# - 8GB RAM, 4 vCPU ($40/month) — handles more skills
# - 16GB RAM, 8 vCPU ($80/month) — heavy research workloads
```

### Horizontal Scaling Options

#### Option A: Dashboard as Separate Deployment

When to use: High dashboard traffic, need CDN/caching

```
┌─────────────────┐     ┌─────────────────┐
│   VPS 1         │     │   VPS 2         │
│   OpenClaw      │────▶│   Dashboard     │
│   Redis         │     │   (or Vercel)   │
└─────────────────┘     └─────────────────┘
```

```bash
# Dashboard can connect to remote Redis
REDIS_URL=redis://vps1-tailscale-ip:6379
```

#### Option B: Redis Managed Service

When to use: High availability requirements, data durability concerns

Providers:
- **DigitalOcean Managed Redis** — $15/month
- **Upstash** — Serverless, pay-per-request
- **Redis Cloud** — Free tier available

```bash
# Update .env
REDIS_URL=rediss://user:password@managed-redis-host:6380
```

#### Option C: Multi-Instance OpenClaw (Future)

Not currently supported. Would require:
- Session affinity for Telegram users
- Distributed cron with leader election
- Shared memory store

### What NOT to Separate

These components should **always** run together:
- OpenClaw Gateway + Telegram Bot (same process)
- OpenClaw + Cron Scheduler (same process)
- OpenClaw + Research Engine (library, not service)

---

## 9. Monitoring & Maintenance

### Health Check Script

Located at `infra/scripts/health-check.sh`:

```bash
# Run manually
./infra/scripts/health-check.sh

# Checks:
# 1. OpenClaw Gateway responding
# 2. Redis responding (PING)
# 3. Telegram bot connected
# 4. Last heartbeat < 35 minutes ago
# 5. Docker daemon running
# 6. Disk space > 10% free
```

### Automated Health Monitoring

```bash
# Health check runs every 5 minutes via systemd timer
sudo systemctl status pace-health.timer

# View recent health check results
sudo journalctl -u pace-health.service --since "1 hour ago"
```

### Log Management

```bash
# OpenClaw logs (via journald)
sudo journalctl -u pace-openclaw -f

# View last 100 lines
sudo journalctl -u pace-openclaw -n 100

# Filter by time
sudo journalctl -u pace-openclaw --since "2024-01-01" --until "2024-01-02"

# Docker logs
docker compose logs -f dashboard
docker compose logs -f redis
```

### Log Retention

```bash
# journald configuration (/etc/systemd/journald.conf)
SystemMaxUse=500M
MaxRetentionSec=30day
```

### Backup Strategy

#### What to Backup

| Item | Location | Frequency | Method |
|------|----------|-----------|--------|
| Memory files | `./memory/` | Every commit | GitHub |
| Skills | `./skills/` | Every commit | GitHub |
| Redis data | Docker volume | Daily | `redis-cli BGSAVE` |
| Environment | `~/.env` | On change | Encrypted backup |
| Dashboard state | Redis | Daily | Part of Redis backup |

#### Backup Commands

```bash
# Manual Redis backup
docker exec pace-redis redis-cli BGSAVE
docker cp pace-redis:/data/dump.rdb ./backups/redis-$(date +%Y%m%d).rdb

# Automated daily backup (add to crontab)
0 3 * * * /home/pace/pace/infra/scripts/backup.sh
```

### Update Procedures

#### Updating PACE Code

```bash
cd ~/pace
git pull origin main

# Rebuild Docker images if needed
docker compose build

# Restart services
./infra/scripts/pace-ctl.sh restart
```

#### Updating System Packages

```bash
# Security updates only
sudo unattended-upgrade

# Full upgrade (schedule maintenance window)
sudo apt update && sudo apt upgrade -y
sudo reboot
```

---

## 10. Troubleshooting

### Common Issues

#### OpenClaw Won't Start

```bash
# Check systemd status
sudo systemctl status pace-openclaw -l

# Check if Redis is running
redis-cli ping

# Check if Docker is running
docker info

# Check logs
sudo journalctl -u pace-openclaw -n 50

# Common fixes:
# 1. Redis not running: sudo systemctl start redis-server
# 2. Docker not running: sudo systemctl start docker
# 3. Port conflict: lsof -i :18789
```

#### Redis Connection Refused

```bash
# Check Redis status
sudo systemctl status redis-server

# Check binding
grep "^bind" /etc/redis/redis.conf

# Restart Redis
sudo systemctl restart redis-server
```

#### Dashboard Not Loading

```bash
# Check if container is running
docker compose ps dashboard

# Check logs
docker compose logs dashboard

# Restart dashboard
docker compose restart dashboard

# Check if Redis is accessible from container
docker exec pace-dashboard redis-cli -h redis ping
```

#### Telegram Bot Not Responding

```bash
# Check OpenClaw logs for Telegram errors
sudo journalctl -u pace-openclaw | grep -i telegram

# Verify bot token
curl https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe

# Common issues:
# 1. Invalid token: regenerate via @BotFather
# 2. Bot not started: send /start to bot
# 3. Allowlist issue: check MAV_TELEGRAM_ID
```

#### Sandbox Container Errors

```bash
# Check if sandbox image exists
docker images pace-sandbox

# Rebuild sandbox image
./infra/scripts/build-sandbox.sh

# Check sandbox network
docker network ls | grep pace-sandbox-net

# Clean up stuck containers
docker rm -f $(docker ps -a --filter "name=pace-sandbox" -q)
```

### Diagnostic Commands

```bash
# Full system status
./infra/scripts/pace-ctl.sh status

# Redis diagnostics
./infra/scripts/pace-ctl.sh redis

# Docker diagnostics
./infra/scripts/pace-ctl.sh docker

# Memory usage
free -h

# Disk usage
df -h

# Process list
htop

# Network connections
ss -tlnp
```

### Recovery Procedures

#### Complete System Recovery

```bash
# 1. Restore from GitHub
git clone git@github.com:markavale/pace.git
cd pace

# 2. Restore environment
cp /backup/.env ~/.env

# 3. Restore Redis data
docker compose up -d redis
docker cp ./backups/redis-latest.rdb pace-redis:/data/dump.rdb
docker compose restart redis

# 4. Rebuild and start
docker compose build
./infra/scripts/pace-ctl.sh start
```

#### Rollback to Previous Version

```bash
# Find previous working commit
git log --oneline -20

# Checkout previous version
git checkout <commit-hash>

# Restart services
docker compose build
./infra/scripts/pace-ctl.sh restart
```

---

## Quick Reference

### Service Ports

| Service | Port | Access |
|---------|------|--------|
| Redis | 6379 | localhost only |
| OpenClaw Gateway | 18789 | localhost only |
| Dashboard | 3000 | Tailscale VPN |

### Key Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Service definitions |
| `infra/config/.env.example` | Environment template |
| `infra/services/pace-openclaw.service` | Systemd service |
| `infra/scripts/pace-ctl.sh` | Service control |
| `infra/scripts/health-check.sh` | Health monitoring |

### Emergency Contacts

For issues with external services:
- **DigitalOcean Support:** https://cloud.digitalocean.com/support
- **Tailscale:** https://tailscale.com/contact/support
- **DeepSeek API:** https://platform.deepseek.com/support
- **Anthropic API:** https://support.anthropic.com

---

*Last updated: Auto-generated deployment guide for PACE AI*
