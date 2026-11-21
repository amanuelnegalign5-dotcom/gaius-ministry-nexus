# GAIUS Nexus — Phase 1 evidence-led baseline (2026-11-21)

## Evidence and scope
- Public repository: `amanuelnegalign5-dotcom/gaius-ministry-nexus`; **main SHA:** `4aba3e25f36c0c42c7c5d2764057e5ce194ce4ee`; `package.json` version `11.2.2`. Repository is public.
- GitHub role-scope workflow run `44887404803`: 52 tests passed, 0 failed, 0 skipped. This is automated source-level evidence, **not** an externally audited security certification.
- GitHub Pages + Cloudflare Worker deployment workflow `44887475871`: `verify`, `deploy-backend`, `build`, `deploy` jobs all succeeded. Deployment status alone does not verify end-user authentication, database restore, R2 availability, or iOS behavior.
- The live website and Worker `/info` could not be independently retrieved with the current verification interface. **Live UI and API status: UNVERIFIED**. Never infer production database contents from source code.
- Repo files inspected: `index.html`, `gaius-core.js`, `gaius-v11-core.js`, `gaius-report-policy.js`, `gaius-worker.js`, `gaius-recovery.js`, `gaius-store.js`, `gaius-v11-ui.js`, `gaius-v11-model.js`, `wrangler.jsonc`, `gaius-config.js`, `sw.js`, workflows, source tests, release documentation.
- Historical approval and source requirements: earlier GAIUS v11 master specification (private Library); this public repository must never include private source documents.

## Architecture and trust boundaries
| Layer | Current implementation | Verification |
|---|---|---|
| Public frontend | GitHub Pages static HTML/JS/CSS; PWA service worker | Successful Pages build, 52 tests |
| Browser cache/drafts | Service Worker + IndexedDB; explicit `?workspace=local` local mode | Browser-only data is NOT an authorization boundary |
| Shared API | `gaius-nexus-api` Cloudflare Worker | Workflow deployed; endpoint request unverified |
| Persistence | `WORKSPACE` Durable Object; app's internal `db` buckets | Source present; no independent production snapshot/restore |
| File storage | `MEDIA_BUCKET` R2 binding expected by Worker | NOT declared in `wrangler.jsonc`; dashboard binding unverified |
| Recovery email | Resend/verified sender and Worker secrets | Configuration and inbox delivery unverified |
| Source documents | Three-item private JSON import architecture; director 16-goal importer | Import code exists; production import not verified |
| Separate Center App | No complete, source-verified synchronization | NOT IMPLEMENTED |

## Highest-priority findings
1. **P0 Privacy exposure:** `index.html` contains six October reports as `ORIGINAL_REPORTS` in a public repository/Pages artifact. This is publicly retrievable source, not a protected dashboard. Do not reproduce report contents in public audit docs. Potential incident assessment and owner-approved, backup-backed migration are needed. Historical Git copies may remain even after removing current assets.
2. **P0 Proposed privacy correction:** In `gaius-v11-core.js`, `canReadFile()` admits all Directors and delegated `fullAdmin` users *before* handling personal file scope. Personal records in `v11_records` use a separate owner-only rule; uploaded `v11_files` do not. A draft remediation/negative-access regression is being prepared, not approved for production deployment.
3. **P1 Recovery not verified:** Source and rollback note explicitly say production Durable Object and R2 recovery drills have not been demonstrated. **Phase 1 exit gate remains BLOCKED**.
4. **P1 Document storage:** R2 upload route exists, but production bucket binding, malicious upload scanning, end-to-end document approval and phone interaction remain unverified.
5. **P1 Role UX:** 9 HQ roles recognized in server policy, but legacy registration/admin role selector coverage requires browser-level verification (prior source inspection identified Support and Establishment omissions).
6. **P1 Live UAT:** iPhone Safari, installed PWA, Desktop role accounts, email and Center integration not verified.
7. **P2 Documentation drift:** `README.md`, `ROLE_PERMISSION_MATRIX.md`, `DOCUMENT_SECURITY.md` and some release notes describe older states; update after testing instead of silently treating them as current.

## Verified status labels
- VERIFIED WORKING: 52 current GitHub source tests; latest GitHub deployment jobs completed.
- IMPLEMENTED BUT NOT VERIFIED: sign-in on actual devices; R2-backed uploads; governance dashboards; 16-goal private import; email recovery; DOCX/PDF browser exports.
- PARTIALLY IMPLEMENTED: role-specific UX, audited document grants, offline draft management, documentation coverage.
- MISSING: fully integrated separate Center App; scheduled external notifications; restore drill evidence; malware scanning.
- BROKEN: documented privacy invariant for uploaded personal files; published historical report confidentiality.
- BLOCKED BY INFRASTRUCTURE: evidence of private R2 bucket, external sender verification, production recovery.
- BLOCKED BY REQUIRED APPROVAL: removal of public historical source reports, production authorization-policy change, live data migration.

## Phase 1 exit gate
**NOT MET**. Source audit begun and documented; **production database/R2 backup, restore test, inventory reconciliation, and public-data incident assessment remain open**. No production data was modified during this phase. Do not represent the subjective earlier 7/10 prototype or 3/10 readiness scores as independently measured scores.

## Sequence
1. Owner exports protected Durable Object data and R2 manifest into a controlled private destination, records checksums, and proves a *staging* restore.
2. Obtain explicit approval for a migration/redaction and any policy changes; run least-privilege tests using synthetic identities.
3. Complete role-specific production UAT, operational monitoring, and rollback readiness before declaring production-ready.
