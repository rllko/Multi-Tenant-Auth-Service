# Handover — Migrations (License System, Phases 1 & 3)

Self-contained work order for the DB migration agent. Covers schema changes the
backend and frontend agents depend on. Do this **first** — the other two are
blocked on it.

## Context

Postgres, migrations run by `MigrationUtility` via DbUp. Scripts live in
`MigrationUtility/Database/Scripts/NNNNNN - name.up.sql` and **must be registered
as `<EmbeddedResource>` in `MigrationUtility/MigrationUtility.csproj`** or DbUp
won't pick them up (there's a `<None Remove>` + `<EmbeddedResource Include>` pair
per script — copy the existing pattern). Journal table tracks what ran; scripts
are immutable once applied, so never edit an old one — always add a new number.

Highest existing script today: `000031 - cascade_application_deletes.up.sql`.
**Start new scripts at `000032`.**

Timestamps in this system are **unix seconds stored as `bigint`** (see
`licenses.expires_at`, `creation_date`, `activated_at`, `user_sessions.created_at`).
Match that — do not introduce `timestamptz` for license/session time fields.

## Task 1 — Application credentials columns (Phase 1, BLOCKING)

`Server/Models/Entities/Application.cs` declares two columns the DB does not have:

```csharp
public required string ClientDecryptionChaChaKey { get; set; }
public required string ServerApiSecret { get; set; }
```

Any Dapper query doing `SELECT *` into `Application` will break. Add the columns.

**`000032 - add_application_credentials.up.sql`**
```sql
ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS client_decryption_chacha_key varchar(64),
    ADD COLUMN IF NOT EXISTS server_api_secret            varchar(128);
```
Nullable — existing rows have no credentials until rotated (Phase 5 populates
them). Backend agent maps these snake_case columns to the PascalCase entity
props via aliases; confirm the entity uses `[Column(...)]` or aliased SELECTs
(the codebase mixes both — check `ApplicationService`).

> Note: `applications` already gained `status varchar(20)` in migration 000030;
> don't re-add it.

## Task 2 — License ban/revoke state (Phase 1, BLOCKING for ban/unban/revoke)

`licenses` today has `paused bool` and `activated bool` but no ban/revoke state.
The frontend has ban/unban/revoke actions; the backend needs a column to back them.

**`000033 - add_license_status.up.sql`**
```sql
ALTER TABLE licenses
    ADD COLUMN IF NOT EXISTS banned      bool   DEFAULT false,
    ADD COLUMN IF NOT EXISTS revoked     bool   DEFAULT false,
    ADD COLUMN IF NOT EXISTS revoked_at  bigint;
```
Semantics agreed with backend agent:
- **banned** — hard block, license + its sessions rejected; reversible (unban).
- **revoked** — permanent kill (e.g. refund/chargeback); not reversible in UI.
- Keep them as two bools (not one enum) so the auth handler check is a cheap
  `WHERE NOT banned AND NOT revoked`. `revoked_at` is for audit/display.

## Task 3 — License management scopes (Phase 2/3, BLOCKING for endpoint auth)

New team-scoped license endpoints are guarded by `RequiresScopeAttribute("...")`.
The scope slugs must exist in `scopes` and be granted to TEAM_OWNER (and probably
ADMIN) or every call 403s. Follow the seeding pattern in
`000030 - add_status_to_applications.up.sql` (which inserted `application.update`
and granted it) — that is the reference for scope+grant inserts.

Existing license scope seeded already: `license.retrieve_info`. Add the rest.

**`000034 - insert_license_management_scopes.up.sql`** — insert into `scopes`
(category `LICENSE_MANAGEMENT`, pick impact levels sensibly) and grant to
TEAM_OWNER via `role_scopes`:

| slug                  | impact   | used by                                  |
| --------------------- | -------- | ---------------------------------------- |
| `license.create`      | MEDIUM   | create, bulk create, users-with-license  |
| `license.update`      | MEDIUM   | update, bulk add-time                    |
| `license.delete`      | HIGH     | delete, bulk delete, delete used/unused  |
| `license.ban`         | HIGH     | ban / unban / revoke                     |
| `license.sessions`    | LOW      | list sessions, revoke session            |

Cross-check the existing category slug: exploration showed `LICENSE_MANAGEMENT`
exists in `scope_categories`. Verify with
`SELECT slug FROM scope_categories;` before writing the insert; reuse the exact
slug. Verify TEAM_OWNER role slug the same way (`SELECT slug FROM roles;`).

## Verification

1. `docker compose build migration && docker compose up migration` — logs show
   each `Executing ... 0000NN` and `Upgrade successful`, exit 0.
2. `docker exec ...-database-1 psql -U postgres -d auth -c "\d applications"` and
   `"\d licenses"` — new columns present.
3. `psql ... -c "SELECT slug FROM scopes WHERE slug LIKE 'license.%';"` — five rows.
4. `psql ... -c "SELECT r.slug, s.slug FROM role_scopes rs JOIN roles r ON r.role_id=rs.role_id JOIN scopes s ON s.scope_id=rs.scope_id WHERE s.slug LIKE 'license.%';"`
   — grants present for TEAM_OWNER.

## Handoff

Once merged, tell the backend agent: columns + scopes are live. Backend is
unblocked for all license CRUD/session endpoints.
