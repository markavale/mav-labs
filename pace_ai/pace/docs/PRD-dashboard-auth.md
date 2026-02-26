Product Requirements Document (PRD)
Project: PACE Dashboard Authentication
Version: 2.0   Last Updated: February 2026   Status: In Development

---

## 1. Executive Summary & Context

### Goal

The PACE Dashboard is a Next.js 14 web application that provides visual monitoring and interaction with MAV's PARA-structured data. Currently, the dashboard has no authentication layer — any user with network access can view and modify data. This feature adds Supabase-powered authentication to protect all dashboard routes and API endpoints, ensuring only MAV can access the system.

### Core Workflow

1. User navigates to any dashboard route
2. Next.js middleware intercepts the request and verifies the Supabase session
3. Unauthenticated users are redirected to the `/login` page (or receive a 401 for API calls)
4. User enters their email and password on the branded login page
5. Supabase Auth verifies credentials with built-in rate limiting and password hashing
6. On success, Supabase sets secure session cookies and the user is redirected to the dashboard
7. User can manually log out via the header button, which clears the Supabase session

---

## 2. Technical Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Authentication Provider | Supabase Auth | Managed auth with built-in rate limiting, password hashing, session management |
| Client SDK | `@supabase/supabase-js` | Official Supabase client for browser and server |
| SSR Integration | `@supabase/ssr` | Cookie-based session management for Next.js App Router |
| Session Storage | Supabase-managed cookies | Automatic token refresh, secure HttpOnly cookies |
| Route Protection | Next.js Middleware | Edge-based session verification before rendering |
| Frontend Framework | Next.js 14 (existing) | App Router with Server Components |
| Styling | Tailwind CSS (existing) | Consistent with PACE brand design system |

---

## 3. User Roles & Permissions

### 3.1 MAV (Single User / Owner)

**Authentication**
* Login with email + password via Supabase Auth
* Session managed by Supabase with automatic token refresh
* Manual logout clears Supabase session immediately
* Automatic redirect to `/login` when session expires
* User account created via Supabase Dashboard (Authentication > Users > Add User)

**Dashboard Access**
* Full access to all 10 dashboard pages: `/`, `/chat`, `/activity`, `/projects`, `/projects/[slug]`, `/research`, `/analytics`, `/focus`, `/notes`
* Full access to all 16 API endpoints
* Read/write access to Kanban board, notes, and all interactive features

**Configuration**
* `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase publishable/anon key

### 3.2 Unauthenticated User

**Restrictions**
* Redirected to `/login` on any page route access
* Receives `401 Unauthorized` JSON response on any API route access
* Can only access: `/login`, `/auth/callback`, `/_next/static/*`, `/_next/image/*`, `/favicon.ico`

**Rate Limiting**
* Handled by Supabase Auth (built-in brute force protection)
* No custom Redis rate limiting needed

---

## 4. Data Schema

No new database tables or collections required. Authentication is fully managed by Supabase.

### 4.1 Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Supabase publishable/anon key
```

### 4.2 Supabase User Record

User created in Supabase Dashboard with:
- Email: MAV's email address
- Password: Chosen by MAV
- Supabase manages: password hashing, session tokens, refresh tokens, rate limiting

---

## 5. API Endpoints (Auth)

### 5.1 POST /api/auth/login

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Success Response (200):**
```json
{
  "success": true
}
```
Supabase sets session cookies automatically.

**Error Responses:**
- `401`: `{ "success": false, "error": "Invalid login credentials" }`
- `429`: `{ "success": false, "error": "Rate limit exceeded" }`

### 5.2 POST /api/auth/logout

**Success Response (200):**
```json
{
  "success": true
}
```
Clears Supabase session cookies.

### 5.3 GET /api/auth/verify

**Success Response (200):**
```json
{
  "success": true,
  "data": { "authenticated": true, "user": "mav@example.com" }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Not authenticated"
}
```

### 5.4 GET /auth/callback

Supabase auth callback for code exchange (used internally by Supabase Auth flows).

---

## 6. UI Specification

### 6.1 Login Page (`/login`)

- **Layout:** Centered card on dark background (#0D1117)
- **Branding:** PACE avatar image, "PACE AI" title in gradient text (cyan to purple), tagline "Personal AI Cognitive Engine"
- **Form:** Email input + password input with show/hide toggle, "Sign In" button with cyan accent
- **States:** Default, loading (spinner on button), error (red message below inputs)
- **Responsive:** Centered on all breakpoints, min-width 320px
- **Fonts:** Space Grotesk (headings), JetBrains Mono (footer text)
- **Auto-redirect:** Navigates to `/` on successful authentication; redirects logged-in users away from `/login`

### 6.2 Header Update

- **Logout button:** Added to the right side of the header, icon-only (LogOut from lucide-react)
- **Confirmation:** Immediate logout on click (no confirmation dialog for simplicity)

---

## 7. Security Requirements

| Requirement | Implementation |
|------------|----------------|
| Password hashing | Managed by Supabase (bcrypt, server-side) |
| Session security | Supabase-managed HttpOnly cookies with automatic refresh |
| Brute force protection | Supabase built-in rate limiting on auth endpoints |
| Route protection | Next.js middleware verifies Supabase session on every request |
| API protection | Middleware returns 401 JSON for unauthenticated API requests |
| No credentials in git | `.env` in `.gitignore`, `.env.example` with placeholder values |
| Transport security | Tailscale VPN for remote access, localhost binding |
