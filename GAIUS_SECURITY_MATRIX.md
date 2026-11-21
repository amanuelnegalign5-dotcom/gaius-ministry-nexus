# Preliminary security and authorization assessment

**Method:** Public source code and GitHub workflow review. No penetration testing, production-secret inspection, real identity access, R2 bucket read, or live network security scan occurred.

| Finding | Severity (triage) | Evidence | Proposed containment / verification |
|---|---|---|---|
| Six historical reports embedded in publicly shipped `index.html` | **Critical until sensitivity assessed** | `const ORIGINAL_REPORTS=` and `KNOWN_LIMITATIONS.md` | Owner-controlled incident review, verified private backup, safe migration, source/history and cache assessment, approved removal |
| Personal uploaded-file bypass for other Directors or `fullAdmin` | **High** | `gaius-v11-core.js:canReadFile`: Director shortcut precedes personal-scope check | Owner-only personal first; deny unrelated admin; regression tests; approve policy change before production merge |
| Director can change another user's personal file grants | **High** | `gaius-v11-core.js:filePermissions` checks Director but not owner | Owner-only grants for personal file; prevent broader admin override |
| Production backup and restore evidence absent | **High** | `MIGRATION_ROLLBACK_V11_1.md` | Private data inventory, export and staging restore, loss/recovery objectives |
| R2 and malware-scanning readiness unverified | **High** | `wrangler.jsonc` lacks R2 declaration; `KNOWN_LIMITATIONS.md` says malware scan not delivered | Confirm private bucket via Cloudflare account, protected download test, quarantine/scanning design |
| Browser local archive mode retained | Medium | `gaius-store.js` `?workspace=local` fallback | Clearly label demo/insecure local mode, avoid confusion with central accounts |
| Cross-scope authorization across legacy/v11 | Medium/High until live tested | Two parallel rule systems `gaius-core.js` and `gaius-v11-core.js` | Enumerate endpoints and test direct API access by role |
| Recovery provider and OTP delivery unverified | Medium/High | `gaius-recovery.js`, external secrets | Verify Resend domain/sender and recipient inbox without exposing keys |
| Client-side tokens and offline drafts | Medium | `gaius-store.js`, `gaius-v11-ui.js` | Threat-model XSS, device compromise and retention risks |
| UI role selectors inconsistent with server roles | Medium | `gaius-app.js` vs `gaius-core.js` | Test support/establishment assignment before rollout |

## Intended boundary matrix
| Actor | Shared HQ reports | Personal private file of another user | Own personal records | Center records |
|---|---|---|---|---|
| Country Director | Yes | **No**, without valid owner-mediated authorization | Yes | Authorized organizational oversight |
| International Director | Yes | **No**, without valid owner-mediated authorization | Yes | Authorized organizational oversight |
| Nine assigned HQ leaders | Submitted HQ only | No | Yes | No, unless explicitly scoped |
| Center leader | No | No | Yes | Own center only |
| Center department leader | No | No | Yes | Own center/department only |
| Other staff | No | No | Yes | Assigned items only |
| Delegated admin | Only if they also hold allowed HQ/Director role | No | Yes | Explicit scoped grants only |

## Mandatory negative tests
- Director A cannot list/download Director B private file using metadata or direct `/file/download` request.
- Generic Full Admin cannot list/download other owners' personal files.
- Director A cannot self-add a recipient to Director B personal file.
- Pending, rejected, removed and revoked file access is denied to unrelated users.
- Suspended/pending/removed accounts cannot use file endpoints.
- HQ leaders cannot read another HQ leader's draft or approve it unless explicitly authorized.
- Centers cannot access other centers or HQ reports even with a forged `scopeId`.

**Status:** Findings are evidence-based hypotheses unless confirmed through tests. Draft tests/patch can be prepared on an isolated branch; deploying a changed authorization policy requires explicit owner approval.
