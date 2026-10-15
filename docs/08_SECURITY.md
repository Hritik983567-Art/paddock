# 🏎️ Paddock Telemetry — Security Architecture & Audit Report

| Metadata | Details |
| :--- | :--- |
| **Document ID** | `PADDOCK-SEC-008` |
| **Version** | `6.0.0` (Production Hardened) |
| **Security Classification** | Public Engineering Specification |
| **Status** | Scoped Production Hardened / Audit Verified |

---

## 1. Threat Model & Defensive Posture

Formula 1 telemetry platforms that process user credentials, live data feeds, and session tokens face four primary threat vectors:
1. **Token Exfiltration via XSS**: Attackers injecting scripts to steal authentication tokens from browser storage.
2. **Brute-Force & Credential Stuffing**: Automated bots flooding login routes to compromise engineer credentials.
3. **Session Hijacking & CSRF**: Unauthorized requests executed using stolen or cross-site forged cookies.
4. **Upstream API Flooding**: Exhaustion of serverless compute and downstream Jolpica/FastF1 community quotas.

```mermaid
graph LR
    Attacker["🚨 Malicious Actor / Bot"]
    CSP["🛡️ Strict CSP (No unsafe-eval)"]
    RL["⏱️ Sliding Window Rate Limiter"]
    COOKIE["🔐 HttpOnly Signed Cookie"]
    SERVER["🔒 Server-Only JWT Engine"]

    Attacker -->|XSS Injection Attempt| CSP
    Attacker -->|Brute-Force Attack| RL
    Attacker -->|Token Stealing Script| COOKIE
    Attacker -->|Client Bundle Tampering| SERVER
```

---

## 2. Core Security Implementations

### 2.1 Zero-Client-Token Rule & HttpOnly Cookies
Paddock strictly prohibits storing authentication JWTs or credentials inside `window.localStorage` or `sessionStorage`. 
- **Storage**: `paddock_auth_token` is stored exclusively in browser cookies marked:
  ```http
  Set-Cookie: paddock_auth_token=<JWT>; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800
  ```
- **Benefit**: Cross-Site Scripting (XSS) attacks cannot inspect or extract the token via JavaScript `document.cookie`.

### 2.2 Server-Only Cryptography (`app/lib/jwt.ts`)
The cryptographic engine that signs and validates JWTs uses the native **Web Crypto API** (`crypto.subtle`) with `HMAC-SHA256`:
- **Isolation**: The file enforces `import 'server-only'`.
- **Compile-Time Guard**: If any frontend React component attempts to import cryptographic signing keys, the Next.js Turbopack compiler fails the build immediately.

### 2.3 Mandatory Email Verification Gate
- When users register via email and password, Supabase creates the identity in an unconfirmed state.
- [`AuthGate.tsx`](../app/components/AuthGate.tsx) checks `email_confirmed_at`. If null, the user is halted on the verification screen, completely preventing access to the command center until their email link is clicked.

### 2.4 Hardened Content Security Policy (CSP)
Defined in [`next.config.ts`](../next.config.ts):
```text
default-src 'self';
script-src 'self' 'unsafe-inline' https://accounts.google.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com;
img-src 'self' data: blob: https://lh3.googleusercontent.com https://racingnews365.com https://*.racingnews365.com https://api.jolpica.net https://api.jolpi.ca https://ergast.com https://*.googleusercontent.com https://maps.google.com https://*.googleapis.com https://*.google.com https://*.openstreetmap.org https://images.unsplash.com https://*.unsplash.com https://upload.wikimedia.org https://*.wikimedia.org https://media.formula1.com https://*.formula1.com https://cdn-1.motorsport.com;
font-src 'self' https://fonts.gstatic.com;
connect-src 'self' ws: wss: https://api.jolpica.net https://api.jolpi.ca https://ergast.com https://*.supabase.co https://api.open-meteo.com https://accounts.google.com https://api.rss2json.com https://racingnews365.com https://*.racingnews365.com;
frame-src 'self' https://accounts.google.com https://maps.google.com https://www.google.com https://*.google.com https://*.openstreetmap.org;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
```
> [!IMPORTANT]
> The security vulnerability `unsafe-eval` has been completely eliminated from `script-src`. Dynamic runtime string-to-code evaluation is prohibited in production.

### 2.5 Database Row-Level Security & Role Escalation Defense
Supabase PostgreSQL tables implement defensive access controls:
- **Profile Data Isolation**: Standard users can only `SELECT` their own private profile record (`auth.uid() = id`). Public social directories query the `public.public_profiles` view, exposing only safe presentation fields (`id`, `full_name`, `avatar_url`, `created_at`, `updated_at`).
- **Role Escalation Guard**: Client `UPDATE` policies enforce `WITH CHECK (role = (SELECT role FROM public.profiles WHERE id = auth.uid()))` and the `protect_profile_role()` `BEFORE UPDATE` trigger prevents client-initiated changes to authorization tiers (`admin`, `engineer`, `user`).
- **Search Path Pinning**: All `SECURITY DEFINER` functions (such as `handle_new_user()`) explicitly declare `SET search_path = public, auth, pg_temp;` to prevent privilege escalation via malicious schema injection.
- **CI Workflow Sanitization**: GitHub Actions workflows utilize `${{ secrets.JWT_SECRET || 'ci-build-synthetic-dummy-key-not-for-production' }}` to eliminate hardcoded secrets from version control while supporting fork pull-request builds.

---

## 3. Empirical Security Audit Matrix (v6.0 Resolution)

The following verification matrix details the exhaustive audit conducted across all subsystems of the Paddock codebase:

| Audit Item | Area | Verdict | Implementation Details |
| :--- | :--- | :---: | :--- |
| **Mandatory Email Verification** | Auth Gate | **PASS** | Unconfirmed users are strictly held on the Awaiting Verification screen. Site access is blocked until email link confirmation. |
| **Server Credential Guard** | Auth Routes | **PASS** | `/api/auth/login` verifies credentials server-side via Supabase `signInWithPassword`. Wrong passwords return HTTP 401 with no cookie. |
| **Session Revocation on Logout**| Auth Lifecycle| **PASS** | `logout()` triggers global `supabase.auth.signOut()`, clears HttpOnly cookies, and purges browser cache to prevent auto-relogin bugs. |
| **OAuth PKCE Code Exchange** | OAuth 2.0 | **PASS** | `/auth/callback` handles server-side PKCE code exchange and redirects cleanly to the origin without leaking auth parameters in the URL. |
| **Server JWT Secret Exposure** | Cryptography | **PASS** | `import 'server-only'` enforced in `app/lib/jwt.ts`. Zero private secrets in client JavaScript bundles. |
| **CI Secret Hygiene** | CI/CD | **PASS** | Literal JWT secret eliminated from `.github/workflows/ci.yml`; relies on repo secrets with synthetic build fallback. |
| **Browser Token Storage** | Storage Policy| **PASS** | `localStorage` token storage eliminated. `localStorage` only stores non-sensitive UI theme preferences (`paddock_theme`). |
| **Google Identity Verification**| OAuth 2.0 | **PASS** | Native Google OAuth ID Token Claims Verifier (`app/lib/googleOAuth.ts`) with dynamic `prompt: 'select_account consent'`. |
| **Row Level Security & Roles** | Database | **PASS** | Profile visibility isolated to record owner with `public_profiles` view; role escalation blocked by check constraint and trigger. |
| **Function Search Path** | Database | **PASS** | `handle_new_user()` `SECURITY DEFINER` pins `search_path = public, auth, pg_temp;`. |
| **Telemetry Presets RLS** | Database | **PASS** | Explicit `UPDATE` policy restricts preset edits strictly to the creating user (`auth.uid() = user_id`). |
| **Public Route Methods** | API Gateway | **PASS** | Invalid HTTP methods return HTTP `405 Method Not Allowed` with descriptive OPTIONS headers. |
| **Defensive Security Headers** | Transport | **PASS** | Strict HSTS, `DENY` framing, `nosniff`, Referrer Policy, and Permissions Policy served on every route. |
| **CSP Hardening** | Security Headers| **PASS** | Removed `'unsafe-eval'`. Image and connect origins restricted to declared endpoints in `next.config.ts`. |

---

## 4. Vulnerability Disclosure & Bug Bounty

Paddock Telemetry maintains an open and transparent security posture:
- **Reporting Vulnerabilities**: Send full cryptographic proofs or attack vectors directly to the security team at `security@paddock-telemetry.io` or open a private GitHub Security Advisory at [github.com/Hritik983567-Art/paddock/security/advisories](https://github.com/Hritik983567-Art/paddock/security/advisories).
- **Remediation SLA**: Critical vulnerabilities are triaged within 24 hours, with remediation deployed to production within 48 hours.
