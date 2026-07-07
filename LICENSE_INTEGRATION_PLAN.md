# License System Integration — 6-Phase Plan

## Goal

Wire the end-user authentication system to the backend and expose team-scoped
endpoints so each tenant can, from the dashboard, manage their application's
licenses and the customers who sign in with them. Today the license auth flow
(end-user sign-in) mostly works but license management is reachable **only via
the Discord bot** — the dashboard has UI calling ~12 endpoints that don't exist.

## Current state (from exploration)

- **Works:** end-user sign-in (`POST /auth/license/login` → session token → JWT),
  refresh, hwid bind, logout. License CRUD exists in `LicenseService` /
  `LicenseBuilder` but is only surfaced through `/protected/*` Discord endpoints.
  `TenantProcessor` + `RequiresScopeAttribute` team-auth pattern is solid and
  reusable.
- **Broken:** `LicenseSessionAuth` has its validation (active / paused / expired
  checks) **commented out** — sessions never actually expire. `Application`
  entity declares `ClientDecryptionChaChaKey` / `ServerApiSecret` columns the DB
  doesn't have — reads that touch them will fail.
- **Missing:** every dashboard-facing license mutation (create/update/delete/
  revoke/ban/bulk), sessions list + revoke, app-credential retrieval/rotation,
  and the story for how the tenant's client app (the Cooking app) authenticates
  itself to the API.

Frontend already calls (and 404s on): `POST|PUT|DELETE .../licenses/{id}`,
`.../licenses/bulk/add-time`, `.../licenses/bulk/delete`, `.../licenses/{used,unused}`,
`.../licenses/{id}/{revoke,ban,unban}`, `GET|DELETE .../sessions`, `POST /users/with-license`.

---

## Phase 1 — Data model + security correctness (foundation)

Fix what's silently broken before building on it.

- Migration: add `client_decryption_chacha_key`, `server_api_secret` to
  `applications` (nullable, populated on create/rotate). Reconcile
  `Application` entity ↔ schema so no query touches a missing column.
- Migration: license state needs a `banned`/`revoked` status. Add a `status`
  column or `banned bool` to `licenses` (frontend already shows ban/revoke).
- **Un-comment and fix `LicenseSessionAuth`** validation: reject inactive
  sessions, paused/expired licenses. This is a real auth hole. Add a self-check.
- Confirm `keygen` secrets (`/secrets/Chacha20`, `/secrets/symmetricKey`) are
  the source for per-app `server_api_secret` generation.

Deliverable: schema matches entities, sessions actually expire, license can be
banned at the data layer.

## Phase 2 — Tenant-facing license CRUD endpoints

Expose the license operations that already exist in `LicenseService` behind the
team-auth pattern. New endpoints under `Server/Endpoints/ApplicationEndpoints/`
(or a new `LicenseEndpoints/Team/`), each `PreProcessor<TenantProcessor<T>>` +
`RequiresScopeAttribute`, route `\/teams/{teamId}/apps/{appId}/licenses...`:

- `POST` create (single) — plan/expiry/max_sessions/notes
- `PUT|PATCH /{id}` update
- `DELETE /{id}` delete
- `POST /{id}/revoke`, `/{id}/ban`, `/{id}/unban`
- Reuse existing `LicenseBuilder.CreateLicenseAsync`, `LicenseService.UpdateLicenseAsync`,
  `DeleteLicenseAsync`, `ActivateLicense`.
- Scopes: `license.create`, `license.update`, `license.delete`, `license.ban`
  (seed any missing in `MigrationUtility` insert scripts + grant to TEAM_OWNER).

Deliverable: dashboard can fully manage individual licenses; frontend
`licensesApi` create/update/delete stop 404ing.

## Phase 3 — Bulk operations + generation

The dashboard's power features and the "keep up with licenses" ask.

- `POST /licenses/bulk` (generate N keys) — reuse `LicenseBuilder.CreateLicenseInBulk`
  (transactional).
- `POST /licenses/bulk/add-time` (extend expiry for a selection).
- `POST /licenses/bulk/delete`, `DELETE /licenses/{used,unused}`.
- Key format: reuse old `Guider` base64url UUID scheme (already in codebase).
  Respect the application's `default_key_schema` (regex in `key_schemas` table)
  when generating human-facing keys.
- `POST /users/with-license` — create an end-user account + assign a license in
  one transaction (activation ceremony: username/email/password + generated key).

Deliverable: bulk lifecycle tooling; a tenant can mint and hand out keys.

## Phase 4 — Session visibility + control

Let tenants see and cut off who's logged into their app.

- `GET /teams/{teamId}/apps/{appId}/sessions` — list active `user_sessions`
  joined to licenses (user, ip, created/refreshed, hwid). Add
  `LicenseSessionService.GetSessionsByAppAsync`.
- `DELETE .../sessions/{id}` — revoke one (soft delete via `is_active`, matching
  old design).
- Optional: surface `ActiveSessions` per app on the app-centric dashboard card
  (the slot left open in `dashboard-view.tsx`) via a per-app session count in
  `DashboardService`.
- Enforce `max_sessions` at sign-in (port old concurrent-session check into
  `CreateSessionWithTokenAsync` if not already firm).

Deliverable: sessions tab works; dashboard shows live logins per app.

## Phase 5 — Client integration surface: full OAuth2 (how the Cooking app talks to the API)

**Decision (locked): full OAuth2.** Harden the currently-shallow
`AuthorizeEndpoint` (`GET /auth/authorize`) and `TokenEndpoint`
(`POST /auth/token`) into a real OAuth2 authorization-code flow, backed by the
`clients` / `oauth_clients` tables and `ClientValidator` already present.

- **Client registration:** each application already creates OAuth clients
  (`POST .../apps/{appId}/oauth/clients`). Ensure the created client has a real
  `client_id` + hashed `client_secret`, redirect URIs, and allowed scopes.
  Add retrieve/rotate for the client secret (scope-guarded) so tenants can
  configure their app.
- **Authorize endpoint:** validate `client_id`, `redirect_uri`, `response_type=code`,
  `scope`, `state`; the end user authenticates with their license credentials
  (reuse the `license/login` credential check), then issue a short-lived
  authorization code bound to client + license + scopes.
- **Token endpoint:** exchange the code (grant_type=authorization_code) — and a
  refresh grant — for an access token (the existing JWT signing via
  `EnvironmentVariableService.SignKeyName`) carrying the license session +
  granted scopes. Enforce PKCE for public clients.
- **Resource protection:** the license session/`AuthorizeResultService` path
  validates the bearer access token on protected calls; fold in the Phase 1
  license state checks (expired/paused/banned) here too.
- Document the flow in Swagger (already per-endpoint documented) + a short
  "integrate your app with OAuth2" page in the website `/api-docs` section.

Deliverable: a tenant registers an OAuth client for their app; end users sign in
through the standard authorization-code (+PKCE) flow; access tokens carry the
license and scopes and are rejected once the license lapses.

## Phase 6 — Frontend wiring + end-to-end verification

- Point `website/lib/api-service.ts` license/session methods at the new routes
  (fix the hardcoded `${API_URL}/apps/...` calls in `licenses-tab.tsx` /
  `sessions-tab.tsx` to the team-scoped paths); replace mock plan data with real.
- Wire ban/unban/revoke/bulk UI actions to the Phase 2–3 endpoints.
- App-detail page: licenses tab, sessions tab, credentials panel all live.
- E2E test path: create app → generate licenses → configure a fake client →
  end-user `login` → session appears in dashboard → revoke → login rejected →
  license expiry/ban enforced.
- Clean up the ~190 pre-existing TS type-mismatch errors in the license
  components while wiring (masked by `ignoreBuildErrors`).

Deliverable: dashboard ↔ backend ↔ end-user auth loop closed and verified.

---

## Sequencing notes

- Phases 1→2→3 are strictly ordered (schema, then single ops, then bulk).
- Phase 4 (sessions) can run parallel to 2/3 — independent tables.
- Phase 5 depends on Phase 1 (app credentials columns).
- Phase 6 lands after each backend phase incrementally, not only at the end.
- Every new endpoint follows the `TenantProcessor` + `RequiresScopeAttribute`
  pattern and gets a Swagger `Summary` block (matches the just-completed docs).
