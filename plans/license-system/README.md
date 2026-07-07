# License System — Agent Handover

Detailed, self-contained work orders to hook the end-user license auth system to
the dashboard. Overview + phasing lives in `../../LICENSE_INTEGRATION_PLAN.md`;
these three files are the executable detail, one per agent.

## Order of execution

```
01-migrations.md  ──►  02-backend.md  ──►  03-frontend.md
   (blocking)            (blocking)           (last)
```

- **01 — Migrations** — app-credential columns, license ban/revoke columns,
  `license.*` scopes + grants. Nothing else can start until this merges.
- **02 — Backend** — fix the commented-out session validation (real auth hole),
  then team-scoped license CRUD, bulk ops, and session list/revoke endpoints.
  Reuses existing `LicenseService` / `LicenseBuilder` / `LicenseSessionService`.
- **03 — Frontend** — route `licenses-tab.tsx` / `sessions-tab.tsx` through
  `lib/api-service.ts` at the real routes; ban/revoke badges; session list.

## Scope of this handover

Covers **Phases 1–4** of the master plan (data + license CRUD + bulk + sessions)
— the concrete, well-understood core. **Phase 5 (full OAuth2 client auth)** and
**Phase 6 residual** are larger and get their own handover once this lands; they
are out of scope for these three files.

## Conventions every agent follows

- Branch: `feat/license-system`. Commits unsigned (`--no-gpg-sign`), no
  Claude co-author trailer.
- Timestamps are unix seconds (`bigint` server / `number` client).
- New endpoints: `TenantProcessor<T>` + `RequiresScopeAttribute` + a `Summary(...)`
  block with typed 200/400/403 (parity with the just-completed swagger docs).
- Verify against `psql` and the live stack through `http://localhost/api/...`;
  swagger UI at `/api/docs/ui` (dev only).
