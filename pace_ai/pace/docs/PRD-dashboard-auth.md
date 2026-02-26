Product Requirements Document (PRD)
Project: PACE Dashboard Authentication
Version: 1.0   Last Updated: February 2026   Status: In Development

---

## 1. Executive Summary & Context

### Goal

The PACE Dashboard is a Next.js 14 web application that provides visual monitoring and interaction with MAV's PARA-structured data. Currently, the dashboard has no authentication layer — any user with network access can view and modify data. This feature adds single-user password authentication to protect all dashboard routes and API endpoints, ensuring only MAV can access the system.

### Core Workflow

1. User navigates to any dashboard route
2. Middleware intercepts the request and checks for a valid JWT session cookie
3. Unauthenticated users are redirected to the `/login` page (or receive a 401 for API calls)
4. User enters the configured password on the branded login page
5. Server verifies the password against the bcrypt hash stored in environment variables, subject to Redis-based rate limiting
6. On success, a signed JWT cookie is set with a 7-day expiry and the user is redirected to the dashboard
7. User can manually log out, which clears the session cookie

---

## 2. Technical Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| JWT Management | `jose` ^5.x | Edge-compatible, zero-dependency JWT signing/verification |
| Password Hashing | `bcryptjs` ^2.4.x | Pure JS bcrypt implementation, no native compilation required |
| Session Storage | HttpOnly Cookie | Secure, no client-side JS access, SameSite protection |
| Rate Limiting | Redis (existing `ioredis`) | Sliding window counter using existing infrastructure |
| Route Protection | Next.js Middleware | Edge-based request interception before rendering |
| Frontend Framework | Next.js 14 (existing) | App Router with Server Components |
| Styling | Tailwind CSS (existing) | Consistent with PACE brand design system |

---

## 3. User Roles & Permissions

### 3.1 MAV (Single User / Owner)

**Authentication**
* Login with password-only authentication
* Session persists for `auth_session_duration` (Default: 7 days) via JWT cookie
* Manual logout clears session immediately
* Automatic redirect to `/login` when session expires

**Dashboard Access**
* Full access to all 10 dashboard pages: `/`, `/chat`, `/activity`, `/projects`, `/projects/[slug]`, `/research`, `/analytics`, `/focus`, `/notes`
* Full access to all 16 API endpoints
* Read/write access to Kanban board, notes, and all interactive features

**Configuration**
* `auth_password_hash`: Bcrypt hash of login password, stored in environment variable
* `auth_jwt_secret`: 256-bit secret for JWT signing, stored in environment variable
* `auth_session_duration`: JWT expiry duration (Default: `7d`)

### 3.2 Unauthenticated User

**Restrictions**
* Redirected to `/login` on any page route access
* Receives `401 Unauthorized` JSON response on any API route access
* Can only access: `/login`, `/_next/static/*`, `/_next/image/*`, `/favicon.ico`

**Rate Limiting**
* Constraint: Max 5 login attempts per 15-minute sliding window per IP
* On rate limit exceeded: `429 Too Many Requests` response with `retry_after` header
* Rate limit state stored in Redis with key pattern `pace:auth:ratelimit:{ip}`

---

## 4. Data Schema

No new database tables or collections required. Authentication state is managed through:

### 4.1 Environment Variables

```
AUTH_PASSWORD_HASH    # bcrypt hash ($2b$ prefix, 12 rounds)
AUTH_JWT_SECRET       # 256-bit random string for JWT signing
AUTH_SESSION_DURATION # Optional, default "7d"
```

### 4.2 JWT Token Payload

```json
{
  "sub": "mav",              // static subject identifier
  "role": "owner",           // static role
  "iat": 1740000000,         // issued at (Unix timestamp)
  "exp": 1740604800          // expires at (iat + 7 days)
}
```

### 4.3 Redis Rate Limit Key

```
Key:    pace:auth:ratelimit:{ip_address}
Type:   Sorted Set
Members: Timestamps of login attempts (score = timestamp)
TTL:    900 seconds (15 minutes)
```

---

## 5. API Endpoints (New)

### 5.1 POST /api/auth/login

**Request:**
```json
{
  "password": "string"
}
```

**Success Response (200):**
```json
{
  "success": true
}
```
Sets `pace-auth-token` HttpOnly cookie.

**Error Responses:**
- `401`: `{ "success": false, "error": "Invalid password" }`
- `429`: `{ "success": false, "error": "Too many attempts", "retryAfter": 900 }`

### 5.2 POST /api/auth/logout

**Success Response (200):**
```json
{
  "success": true
}
```
Clears `pace-auth-token` cookie.

### 5.3 GET /api/auth/verify

**Success Response (200):**
```json
{
  "success": true,
  "data": { "authenticated": true, "user": "mav" }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Not authenticated"
}
```

---

## 6. UI Specification

### 6.1 Login Page (`/login`)

- **Layout:** Centered card on dark background (#0D1117)
- **Branding:** PACE avatar image, "PACE AI" title in gradient text (cyan → purple), tagline "Personal AI Cognitive Engine"
- **Form:** Single password input with show/hide toggle, "Sign In" button with cyan accent
- **States:** Default, loading (spinner on button), error (red message below input), rate limited (countdown display)
- **Responsive:** Centered on all breakpoints, min-width 320px
- **Fonts:** Space Grotesk (headings), JetBrains Mono (footer text)
- **Auto-redirect:** Navigates to `/` on successful authentication

### 6.2 Header Update

- **Logout button:** Added to the right side of the header, icon-only (LogOut from lucide-react)
- **Confirmation:** Immediate logout on click (no confirmation dialog for simplicity)

---

## 7. Security Requirements

| Requirement | Implementation |
|------------|----------------|
| Password never stored in plaintext | Bcrypt hash in environment variable only |
| Cookie security | HttpOnly, Secure (production), SameSite=Strict |
| JWT expiration | 7-day default, configurable |
| Brute force protection | Redis sliding window: 5 attempts / 15 min per IP |
| Defense-in-depth | Middleware + individual API route verification |
| No credentials in git | `.env` in `.gitignore`, placeholder values only |
| Transport security | Tailscale VPN for remote access, localhost binding |
