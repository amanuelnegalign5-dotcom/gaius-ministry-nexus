# GAIUS Nexus feature register — baseline 2026-11-21

Statuses distinguish repository implementation from tested production behavior.

| Domain | Implementation status | Production validation |
|---|---|---|
| Public frontend / login / registration | Present in `index.html`, `gaius-app.js` | UI NOT VERIFIED across devices |
| GitHub Pages publication | `.github/workflows/static.yml`; required asset test | CI deployment VERIFIED |
| Cloudflare Worker | `gaius-worker.js` deployed by workflow | Build/deploy VERIFIED; actual API behavior NOT VERIFIED |
| Worker/Durable Object account state | Present in `gaius-core.js` and Worker class | Real DB records and restore NOT VERIFIED |
| Password recovery / Resend OTP | Present in `gaius-recovery.js` | External sender/inbox NOT VERIFIED |
| Nine HQ department report visibility | Server mapping and automated tests present | CI-tested; real-account UAT NOT VERIFIED |
| Separate center/staff plans and reports | v11 scoped records implemented | CI-tested; live UAT NOT VERIFIED |
| Director organizational dashboards | Multiple views, KPI and task forms | Source present; live data NOT VERIFIED |
| Director personal owner-only v11 records | `canRead` enforces personal owner | Source-tested |
| Director personal **file** privacy | Source currently admits other Directors implicitly | **BROKEN**; pending patch/review in this branch |
| R2 Office/PDF/image upload | MIME/signature/size checks and protected routes | Storage binding and media UAT BLOCKED |
| File approval and grants | Worker+v11 permission records | Implemented, review required |
| 16-goal original Director plan | Runtime JSON import handler | Production import/reconciliation NOT VERIFIED |
| Source text of ministry and teaching documents | Runtime private JSON importer | Production import/reconciliation NOT VERIFIED |
| Board/advisory, succession, mentorship | v11 record kinds | End-to-end workflows NOT VERIFIED |
| Attendance and Monday staff | Legacy and v11 operations | Real-account UAT NOT VERIFIED |
| Offline PWA and drafts | Service Worker, IndexedDB drafts | Device sync/loss tests NOT VERIFIED |
| DOCX/PDF export | Client export module | Safari output/font verification NOT VERIFIED |
| External Center App synchronization | Contract only | MISSING |
| Scheduled push or external reminder delivery | In-app reminders only | MISSING |
| R2 malware scanning and safe file handling | Signature checks, no independently verified scanning | PARTIAL |
| Private production backups / restore | Written rollback instructions | BLOCKED, test evidence missing |
| Production monitoring / alerting | GitHub workflow history available | PARTIAL |

## Evidence notes
Source code is not proof of correct production behavior. Six historical report payloads are in public `index.html`; any confidential records must be assessed before inviting broad production usage. User-approved legacy features have been **preserved** in the audit branch.
