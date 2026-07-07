# Handover — Backend (License System, Phases 1, 2, 3, 4)

Self-contained work order for the backend agent. **Depends on `01-migrations.md`
being merged first** (needs the credential columns, ban/revoke columns, and the
`license.*` scopes). FastEndpoints + Dapper, .NET, project `Server/`.

## The team-scoped endpoint pattern (copy this)

Every dashboard-facing endpoint follows the exact shape used by
`Server/Endpoints/TeamsEndpoints/TeamSentInvitesEndpoint.cs` and
`ApplicationEndpoints/ApplicationLicensesEndpoint.cs`:

```csharp
public override void Configure()
{
    Post("/teams/{teamId:guid}/apps/{appId:guid}/licenses");
    PreProcessor<TenantProcessor<CreateLicenseDto>>();   // EmptyRequest for GET/DELETE w/o body
    DontThrowIfValidationFails();
    Options(x => x.WithMetadata(new RequiresScopeAttribute("license.create")));

    Summary(s => {                                       // required — matches the swagger docs work
        s.Summary = "...";
        s.Description = "...";
        s.Params["teamId"] = "Team id (GUID)";
        s.Params["appId"]  = "Application id (GUID)";
        s.Response<...>(200, "...");
        s.Response<ErrorResponse>(400, "...");
        s.Response(403, "Not a team member or missing scope");
    });
}
```

`TenantProcessor<T>` (`Server/RequestProcessors/TenantProcessor.cs`) validates the
bearer token, team membership, and the scope from `RequiresScopeAttribute`, then
puts the session in `HttpContext.Items["Session"] as TenantSessionInfo`. Read
`teamId`/`appId` with `Route<Guid>("teamId")`. Register any new service in
`Server/Program.cs` next to the others (`AddScoped`).

**Every new endpoint gets a `Summary(...)` block** (200/400/403 with typed
response) — the repo just finished documenting all endpoints; keep parity.

## Existing service methods to REUSE (do not re-implement)

`ILicenseService` (`Server/Services/Licenses/ILicenseService.cs`):
- `GetLicenseByApplication(Guid application)` → `Option<IEnumerable<LicenseDto>>`
- `GetLicenseByIdAsync(long)`, `GetLicenseByValueAsync(Guid)`
- `DeleteLicenseAsync(long id, IDbTransaction?)`
- `UpdateLicenseAsync(License, IDbTransaction?)`, `UpdateLicenseListAsync(IEnumerable<License>, ...)`
- `ActivateLicense(Guid value, username, password, email, discordId, ...)`

`ILicenseBuilder` (`Server/Services/Licenses/Builder/ILicenseBuilder.cs`):
- `CreateLicenseAsync(int licenseExpirationInDays, long? discordId, string? username, string? email, string? password, IDbTransaction?)` → `Result<License, ValidationFailed>`
- `CreateLicenseInBulk(int amount, int licenseExpirationInDays, ...)` → `IEnumerable<LicenseDto>` (transactional)

`ILicenseSessionService` (`Server/Services/Licenses/Sessions/ILicenseSessionService.cs`):
- `GetSessionsByLicenseAsync(long licenseId)`, `GetSessionByTokenAsync(Guid)`
- `DeleteSessionTokenAsync(Guid id, ...)`
- `CreateSessionWithTokenAsync(SignInRequest)` (end-user sign-in path)

Key encoding: license `Value` (Guid) ↔ display string via
`Guider.ToStringFromGuid` / `ToGuidFromString` (`Server/Services/Guider.cs`).
`License.MapToDto()` already emits the base64url `Value`, unix `ExpirationDate`,
`CreationDate`, `Activated`, `Paused`, `Email`, `Discord`. **Extend `LicenseDto`
+ `MapToDto` with the new `Banned`/`Revoked` bools** so the frontend can render
status. Add an `Id` passthrough if not already surfaced (frontend keys on it).

## Phase 1 — Security correctness (do first, small, high value)

**`Server/AuthenticationHandlers/LicenseSessionAuth.cs`** — the session
validation is commented out (lines ~31-50), so end-user sessions never expire or
respect paused/banned licenses. Un-comment and fix:
- reject when `session.Active` is false
- reject when `session.License.Paused`, `Banned`, or `Revoked`
- reject when `session.License.ExpiresAt <= now` (unix seconds)
- the stale `RefreshedAt > now` check is inverted/buggy — session is stale when
  `now - session.RefreshedAt > 24h`; fix or drop it, don't ship it as-is.
Return `AuthenticateResult.Fail(reason)` with a clear message per case.
`GetSessionByTokenAsync` must load `session.License` (join) for these checks —
verify it does; if not, extend the query.

Also enforce `max_sessions` at sign-in in
`LicenseSessionService.CreateSessionWithTokenAsync` (count `user_sessions WHERE
license_id = X AND is_active` vs `licenses.max_sessions`) if not already firm.

Leave ONE self-check behind: a small `assert`-style test or a documented curl
sequence proving an expired/banned license is rejected.

## Phase 2 — Single-license CRUD endpoints

All under `Server/Endpoints/ApplicationEndpoints/` (or a new
`Server/Endpoints/LicenseEndpoints/Team/`). Routes + scopes + reuse:

| Method | Route | Scope | Body / behavior |
| ------ | ----- | ----- | --------------- |
| POST   | `/teams/{teamId}/apps/{appId}/licenses` | `license.create` | `{ expiresInDays, maxSessions?, email?, username?, generateKey?, customKey?, notes? }` → `LicenseBuilder.CreateLicenseAsync`, set `application = appId`. Return created `LicenseDto`. |
| PUT    | `/teams/{teamId}/apps/{appId}/licenses/{licenseId:long}` | `license.update` | partial update (email, maxSessions, expiry, paused) → load via `GetLicenseByIdAsync`, `UpdateLicenseAsync`. 404 if missing / wrong app. |
| DELETE | `/teams/{teamId}/apps/{appId}/licenses/{licenseId:long}` | `license.delete` | `DeleteLicenseAsync`; cascades sessions via FK. |
| POST   | `.../licenses/{licenseId:long}/revoke` | `license.ban` | set `revoked=true, revoked_at=now`; kill active sessions. |
| POST   | `.../licenses/{licenseId:long}/ban`    | `license.ban` | set `banned=true`; kill active sessions. |
| POST   | `.../licenses/{licenseId:long}/unban`  | `license.ban` | set `banned=false`. |

**Guard app ownership:** always confirm the license's `application == appId` (and
the app belongs to `teamId` — TenantProcessor already checks team membership, but
verify the license/app link) so tenant A can't touch tenant B's license by id.
Add a `LicenseService.GetLicenseForAppAsync(long id, Guid appId)` helper if it
makes the ownership check clean. Ban/revoke/unban need new
`LicenseService` methods (`SetBannedAsync`, `SetRevokedAsync`) — thin Dapper
`UPDATE`s.

## Phase 3 — Bulk + generation

| Method | Route | Scope | Body |
| ------ | ----- | ----- | ---- |
| POST | `.../licenses/bulk` | `license.create` | `{ amount, expiresInDays, maxSessions? }` → `CreateLicenseInBulk`. Return the created keys. |
| POST | `.../licenses/bulk/add-time` | `license.update` | `{ licenseIds: long[], amount, unit: "days"\|"months"\|"years" }` → convert to seconds, add to each `expires_at`. Frontend sends exactly this shape (`licenses-tab.tsx:426`). |
| POST | `.../licenses/bulk/delete` | `license.delete` | `{ licenseIds: long[] }` |
| DELETE | `.../licenses/used`   | `license.delete` | delete where `activated = true` |
| DELETE | `.../licenses/unused` | `license.delete` | delete where `activated = false` |
| POST | `.../users/with-license` OR `.../licenses/assign` | `license.create` | create end-user account + license in one transaction (activation ceremony: username/email/password + key). Reuse `ActivateLicense`. Confirm final route with frontend agent — old FE hits `/users/with-license` (no team scope); move it under the team/app tree. |

Respect the application's `default_key_schema` (regex in `key_schemas`) when
generating human keys, if the builder doesn't already.

## Phase 4 — Sessions endpoints

| Method | Route | Scope | Behavior |
| ------ | ----- | ----- | -------- |
| GET | `/teams/{teamId}/apps/{appId}/sessions` | `license.sessions` | list active `user_sessions` for the app joined to licenses: `{ id, sessionToken?, licenseId, username, ipAddress, createdAt, refreshedAt, hwid, isActive }`. Add `LicenseSessionService.GetSessionsByAppAsync(Guid appId)` (query `user_sessions WHERE application = @appId AND is_active`). |
| DELETE | `/teams/{teamId}/apps/{appId}/sessions/{sessionId:guid}` | `license.sessions` | soft-revoke: set `is_active = false` (matches old design; `DeleteSessionTokenAsync` may hard-delete — prefer soft). |

Optional dashboard tie-in: add a per-app active-session count to
`DashboardService.GetDashboardAsync` so the app cards can show live logins (a slot
was left for this in `website/components/dashboard-view.tsx`). Cheap:
`SELECT application, count(*) FROM user_sessions WHERE is_active GROUP BY application`.

## Verification

- `docker compose build server && docker compose up -d server`, get a token via
  `POST /api/auth/tenant/login`, then exercise each route with curl through
  `http://localhost/api/...`; compare counts against `psql`.
- Swagger UI at `/api/docs/ui` (dev only) should list every new endpoint with its
  Summary + typed responses.
- Phase 1 proof: sign in an end user, expire/ban the license, confirm the next
  authenticated call is rejected.

## Handoff

Report the FINAL routes + request/response DTO shapes to the frontend agent
(`03-frontend.md` assumes the routes in this file; flag any you renamed).
