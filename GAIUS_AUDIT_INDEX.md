# GAIUS Nexus — Phase 1 audit pack (2026-11-21)

This is a **draft, evidence-led audit and proposed security patch**, not a production release. All content is public-safe: no raw source documents, private ministry report text, credentials, database exports, or screenshots of sensitive data are added.

## Artifacts
- [Full baseline and architecture map](GAIUS_MASTER_AUDIT.md)
- [Requirements traceability matrix](GAIUS_REQUIREMENTS_MATRIX.md)
- [Current feature statuses](GAIUS_FEATURE_STATUS.md)
- [Security and cross-scope risk matrix](GAIUS_SECURITY_MATRIX.md)
- [Protected backup and rollback runbook](GAIUS_BACKUP_AND_ROLLBACK_PLAN.md)
- [Source and data migration inventory](GAIUS_DATA_MIGRATION_REPORT.md)
- [Verified GitHub test results](GAIUS_TEST_RESULTS.md)
- [User acceptance test scenarios](GAIUS_UAT_REPORT.md)
- [Amharic administrator guide](GAIUS_ADMINISTRATOR_GUIDE_AM.md)
- [Production release gate checklist](GAIUS_RELEASE_CHECKLIST.md)
- [Evidence-only 10/10 scorecard](GAIUS_FINAL_10_OF_10_SCORECARD.md)

## Proposed code change — **requires owner approval before production**
`gaius-v11-core.js` and `tests/personal-file-boundaries.test.mjs` propose fixing the default read of personal uploaded files by other Directors and generic Full Admins, allowing explicit sharing only by the file's authorized Director owner. This intentionally changes existing file permissions and must not be deployed without reviewed role/recipient policy and verified backups.

## Current release decision
**Phase 1 exit gate NOT MET**: no verified Durable Object/R2 export and staging restore; public October reports remain in source; real-device, real-recipient and role UAT outstanding.

## Suggested next step
The owner completes protected backups and staging restore, authorizes privacy policy adjustments and historical report remediation, and schedules iPhone/role-specific UAT. Then the security patch can be separately reviewed, merged and deployed in a controlled release.
