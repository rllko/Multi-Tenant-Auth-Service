# Handover — Frontend (License System, Phase 6)

Self-contained work order for the frontend agent. Next.js app router, project
`website/`. **Depends on the backend endpoints from `02-backend.md` existing** —
confirm the final routes with the backend agent before wiring (this file assumes
the routes as planned).

## The problem

`website/components/licenses-tab.tsx` and `sessions-tab.tsx` were built against
endpoints that never existed, using **raw `fetch(\`${process.env.NEXT_PUBLIC_API_URL}/apps/...\`)`**
with the wrong (non-team-scoped) paths and no shared error handling. They 404
today. The centralized client in `website/lib/api-service.ts` already has correct
`licensesApi` / `sessionsApi` stubs — route everything through those.

## Rules (match the rest of the codebase)

- All calls go through `fetchApi` in `website/lib/api-service.ts` (handles base
  URL `http://localhost/api`, bearer token, 401→refresh, timeout). **No raw
  `fetch` in components.**
- Team id comes from `useTeam().selectedTeam.id` (context), not hardcoded.
- License timestamps are **unix seconds** — the app-centric dashboard already has
  the bucket logic in `website/components/dashboard-view.tsx` (`computeLicenseStats`);
  reuse the pattern for expiry display (`new Date(sec * 1000)`).
- License `Value` is the display key string; `id` (long) is what mutations key on.

## Task 1 — Extend `licensesApi` / `sessionsApi` in `lib/api-service.ts`

Current `licensesApi` has get/getLicense/create/update/delete only. Add the
missing methods (all team+app scoped), matching backend routes:

```ts
export const licensesApi = {
  // existing: getLicenses, getLicense, createLicense, updateLicense, deleteLicense
  bulkCreate:   (teamId, appId, data) => fetchApi(`/teams/${teamId}/apps/${appId}/licenses/bulk`, {method:"POST", body:JSON.stringify(data)}),
  bulkAddTime:  (teamId, appId, data) => fetchApi(`/teams/${teamId}/apps/${appId}/licenses/bulk/add-time`, {method:"POST", body:JSON.stringify(data)}, DEFAULT_TIMEOUT, false),
  bulkDelete:   (teamId, appId, data) => fetchApi(`/teams/${teamId}/apps/${appId}/licenses/bulk/delete`, {method:"POST", body:JSON.stringify(data)}, DEFAULT_TIMEOUT, false),
  deleteUsed:   (teamId, appId) => fetchApi(`/teams/${teamId}/apps/${appId}/licenses/used`,   {method:"DELETE"}, DEFAULT_TIMEOUT, false),
  deleteUnused: (teamId, appId) => fetchApi(`/teams/${teamId}/apps/${appId}/licenses/unused`, {method:"DELETE"}, DEFAULT_TIMEOUT, false),
  revoke: (teamId, appId, id) => fetchApi(`/teams/${teamId}/apps/${appId}/licenses/${id}/revoke`, {method:"POST"}, DEFAULT_TIMEOUT, false),
  ban:    (teamId, appId, id) => fetchApi(`/teams/${teamId}/apps/${appId}/licenses/${id}/ban`,    {method:"POST"}, DEFAULT_TIMEOUT, false),
  unban:  (teamId, appId, id) => fetchApi(`/teams/${teamId}/apps/${appId}/licenses/${id}/unban`,  {method:"POST"}, DEFAULT_TIMEOUT, false),
}
```
`createLicense`/`updateLicense` already exist — the frontend `licenses-tab.tsx`
uses `PATCH` for update but `api-service` uses `PUT`; align to whatever backend
shipped (backend plan says `PUT`). Fix `updateLicense`'s method if needed.

`sessionsApi` already has `getSessions` + `terminateSession` pointing at the right
routes — no change, just switch the component to use them.

## Task 2 — Rewire `licenses-tab.tsx`

Replace every raw `fetch(...)` (lines ~225, 235, 426, 451, 474, 493, 512, 551,
593, 627, 661, 695) with the `licensesApi` methods. Map the existing handlers:

| Handler (line ~) | Replace with |
| ---------------- | ------------ |
| create (235)     | `licensesApi.createLicense(teamId, appId, body)` |
| update (225)     | `licensesApi.updateLicense(teamId, appId, id, body)` |
| bulk add-time (426) | `licensesApi.bulkAddTime` — body already `{licenseIds, amount, unit}` |
| bulk delete (451)   | `licensesApi.bulkDelete` — `{licenseIds}` |
| delete all (474)    | decide with backend: no "delete all" route planned — either drop the button or loop bulkDelete over all ids |
| delete used (493)   | `licensesApi.deleteUsed` |
| delete unused (512) | `licensesApi.deleteUnused` |
| users-with-license (551) | backend route TBD — confirm, then add an api method |
| delete single (593) | `licensesApi.deleteLicense` |
| revoke (627) / ban (661) / unban (695) | `licensesApi.revoke/ban/unban` |

The create form state (`newLicense`) is `{ plan, expiresAt, maxUsages, notes,
generateKey, customKey }`. Backend expects `{ expiresInDays, maxSessions?,
email?, username?, generateKey?, customKey? }` — **map the fields** (there's no
`plan`/`notes`/`maxUsages` server-side; drop or translate: `maxUsages`→`maxSessions`,
`expiresAt` date → `expiresInDays`). Coordinate the exact create body with backend.

Replace the mock `plans` data if the create form still references it.

## Task 3 — License status display (ban/revoke)

Backend adds `banned`/`revoked` to `LicenseDto`. Update
`website/models/license.ts` (`LicenseSchema`) to include them, and render status
badges in the table: active / paused / banned / revoked / expired
(expired = `expirationDate <= now`). Show ban/unban/revoke actions conditionally
(no "ban" on an already-banned license, etc.).

## Task 4 — Rewire `sessions-tab.tsx`

Replace the 3 raw `fetch`es (lines 31, 53, 87) with `sessionsApi.getSessions`
and `sessionsApi.terminateSession`. The component expects fields like user, ip,
created/expires — map to the backend session DTO
(`{ id, licenseId, username, ipAddress, createdAt, refreshedAt, isActive }`);
drop UI fields the backend doesn't provide (browser/location) or mark them
"unknown". Convert unix-second timestamps for display.

## Task 5 — Type cleanup while here

`licenses-tab.tsx` / `sessions-tab.tsx` carry several of the ~190 pre-existing
TS type-mismatch errors (masked by `ignoreBuildErrors: true` in `next.config.mjs`).
Fix the ones you touch: type the license row shape against `models/license.ts`,
type handler params (a previous pass already typed most; keep it clean).

## Verification

1. Dashboard → app → Licenses tab: create a license (appears in table), edit,
   ban → badge flips, unban, revoke, delete. Cross-check against
   `psql ... "SELECT value, banned, revoked FROM licenses ..."`.
2. Bulk: select rows → add time (expiry moves), bulk delete.
3. Sessions tab: an end-user login shows a live session; terminate → gone.
4. Both dark + light themes; no console 404s; `pnpm build` clean (rebuild in
   container or `rm -rf website/.next && docker restart ...-webapp-1` after a
   host build — the volume mount clobbers dev `.next`).

## Handoff

None downstream — this is the last layer. Report any backend route/DTO mismatch
back to the backend agent rather than working around it in the component.
