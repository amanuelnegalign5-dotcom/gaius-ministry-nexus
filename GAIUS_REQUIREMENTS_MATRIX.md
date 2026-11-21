# Requirements traceability — baseline, not a completion claim

Source priorities: current owner-supplied master execution prompt; prior private GAIUS v11 complete master specification (Library, November 2026); present repository source. For original ministry plans/manuals, inspect protected originals when available; never infer their unseen content.

| ID | Requirement | Code / evidence | Current status | Acceptance |
|---|---|---|---|---|
| R-01 | Login and role approval | `gaius-core.js`, `gaius-worker.js`, `index.html` | IMPLEMENTED BUT NOT VERIFIED | Real sign-in/approval/revocation on iPhone and desktop |
| R-02 | Country/International Director scope | `gaius-core.js`, `gaius-v11-core.js` | PARTIAL | All director journeys tested, personal files owner-only |
| R-03 | Nine HQ reporting roles | `gaius-report-policy.js`, `gaius-v11-model.js` | IMPLEMENTED BUT NOT VERIFIED | Nine distinct accounts can read shared submitted HQ reports, not other drafts |
| R-04 | Centers and unrelated staff scoped out of HQ reporting | `gaius-v11-core.js`, `tests/nine-hq-report-access.test.mjs` | SOURCE-TESTED | Real unauthorized API requests denied |
| R-05 | Staff/center own planning and reporting | `gaius-v11-core.js` | SOURCE-TESTED | Submit and retrieve own records, no cross-scope access |
| R-06 | Password and email recovery | `gaius-recovery.js` | BLOCKED | Real sender verified; delivery and recovery flow tested |
| R-07 | PWA deployment integrity | `.github/workflows/static.yml`, `tests/pages-deployment-integrity.test.mjs` | VERIFIED IN CI | Direct live/mobile network request and refresh test |
| R-08 | PDF, Word, PPT, spreadsheet, image storage | `gaius-worker.js`, `gaius-store.js` | BLOCKED | R2 private binding + end-to-end upload/preview/download |
| R-09 | File sharing, revocation, approvals | `gaius-v11-core.js` | PARTIAL | Deny-by-default, personal owner-only, real file tests |
| R-10 | Source-derived six-month goals (16) | `gaius-v11-core.js` private importer | IMPLEMENTED BUT NOT VERIFIED | Authorized production import reconciled against original |
| R-11 | Ministry Manual and teaching roadmap | `v11.importSourceDocs`, private source manifest | IMPLEMENTED BUT NOT VERIFIED | Hash/document counts and user-visible content reconciliation |
| R-12 | Board, advisory, mentorship, succession | `gaius-v11-model.js` | IMPLEMENTED BUT NOT VERIFIED | Full owner/reviewer workflow tests |
| R-13 | Director task, visit and decision tracking | v11 record kinds, `gaius-v11-ui.js` | IMPLEMENTED BUT NOT VERIFIED | Actual Director UAT and evidence-backed KPI rollups |
| R-14 | Sunday/Monday and center attendance | `gaius-core.js`, `gaius-v11-core.js` | IMPLEMENTED BUT NOT VERIFIED | Cross-role attendance and duplicate controls |
| R-15 | Center App synchronization | `CENTER_APP_INTEGRATION_SPEC.md` | MISSING | Separate App schema and tested idempotent sync |
| R-16 | Scheduled notifications | `KNOWN_LIMITATIONS.md` | MISSING | Authorized live push/email, verified opt-in |
| R-17 | Backup/restore and retention | `MIGRATION_ROLLBACK_V11_1.md` | BLOCKED | Staging recovery with checksums and RTO/RPO |
| R-18 | Bilingual mobile accessibility | `gaius-app.js`, `gaius-v11-ui.js`, CSS | PARTIAL | iPhone and desktop WCAG 2.2 AA review |
| R-19 | Historical public reports confidentiality | `index.html` | BROKEN | Owner-approved secure migration, public copies assessed |
| R-20 | Production deployment monitoring | Actions and Worker code | PARTIAL | Log alerts, runbook, rollback tested |

Rules: SOURCE-TESTED does not imply LIVE-VERIFIED. No private document content or test credentials should be committed to this matrix.
