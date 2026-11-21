# Source reconciliation and data migration baseline (no migration performed)

## Known data stores and source groups
| Data | Source / current representation | Evidence | Migration/backup status |
|---|---|---|---|
| Organizational users / accounts | Durable Object `users` records | Worker and `gaius-core.js` | Live count NOT VERIFIED |
| Legacy reports/plans | Durable Object buckets and some `ORIGINAL_REPORTS` in public HTML | Source and known limits | Public exposure; owner approval required before removal |
| v11 scoped records | Durable Object `v11_records` | `gaius-v11-core.js` | Production count NOT VERIFIED |
| File metadata | Durable Object `v11_files` | Worker and v11 core | Production count NOT VERIFIED |
| File bodies | Private R2 `MEDIA_BUCKET` (expected) | Worker routes, absent config binding | Bucket existence and object inventory NOT VERIFIED |
| Audit and approvals | Durable Object audit/review buckets | v10/v11 core | Retention and completeness NOT VERIFIED |
| Personal offline drafts | Browser IndexedDB | `gaius-v11-ui.js` | Not in server backup; device inventory required |
| Private 16-objective Director plan | Authorized private importer/file | v11 import source check; private Library source may exist | Real import NOT VERIFIED |
| GAIUS Ministry Manual and teaching roadmap | Private author-supplied files / JSON extraction | Importer expects hashes/metadata | Source-derived text available privately; full original layout/media not implied |
| Separate Center App data | External application | `CENTER_APP_INTEGRATION_SPEC.md` | No live sync; no verified schema |

## Authoritative source discovery (no sensitive content copied)
- Private Library contains `GAIUS_Private_Source_Documents_Import.json`, with metadata for the ministry manual, teaching roadmap and country director six-month plan; this is a *source-derived text bundle*, not full DOCX embedded images/layout.
- Private Library also contains `GAIUS_v11_COMPLETE_MASTER_PROMPT_AMHARIC` in document/text/markdown formats with owner-only Director workspace requirements and separate HQ/center access. These must **not** be copied to the public repository as raw private content.
- The original Ministry Manual DOCM (if one exists) has **not** been independently found/verified as part of this audit.

## Migration safety procedure
1. Operator takes protected Durable Object and R2 backups and verifies a staging restore.
2. Build private record census and content manifest; compare file hashes, source titles and counts.
3. Establish deterministic IDs and idempotency keys for each source record.
4. Run migrations only on staging with sanitized test accounts.
5. Review data scope, Director-only fields, files, free-text references, history and role membership.
6. Obtain explicit authorization before production import/removal; preserve original snapshots and audit trail.
7. Confirm no duplicate imports, broken references or lost data after deployment.

No uploads, imports, backups, redactions or destructive migrations were performed in this branch.
