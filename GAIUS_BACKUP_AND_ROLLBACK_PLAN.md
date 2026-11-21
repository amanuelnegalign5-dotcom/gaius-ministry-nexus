# Protected backup, restore and rollback runbook — NOT YET EXECUTED

## Verified source checkpoint
- Immutable baseline Git commit `4aba3e25f36c0c42c7c5d2764057e5ce194ce4ee`.
- Git commit restores **source code**, not the state of the production Durable Object, R2 objects, Resend records, device-local drafts, or browser caches.
- Previous `MIGRATION_ROLLBACK_V11_1.md` is guidance, not evidence of a completed recovery test.

## Required protected backups (operator actions, not performed here)
1. Restrict access to authorized GAIUS administrators and review whether private content is inadvertently public.
2. Record the deployed Worker version, namespace, Durable Object identifiers and storage schema in a private operational log (never publish credentials).
3. Use an approved, authenticated administrative export mechanism for **all** Durable Object buckets, including users, reports, plans, audit history, approvals, v11 records and v11 file metadata. Verify record counts and SHA-256 of exported data.
4. If R2 is configured, make a private object inventory with object size, ID, checksum and ACL/scope metadata; export using provider-supported access into an encrypted controlled destination. **Do not upload to GitHub**.
5. Identify historical local-browser-only records or offline drafts on every relevant device. Do not clear browser/site data before export and owner verification.
6. Record backup timestamp, custody, restore compatibility, retention and privacy classifications.
7. Restore a sanitized or authorization-approved copy to an **isolated staging Durable Object / R2 bucket**. Check referential integrity, user roles, report counts, file availability, and permission denials using synthetic accounts.
8. Define approved recovery objectives (RPO/RTO), test a simulated failure and perform a documented rollback drill.

## Rollback procedure
- Immediately stop writes if data corruption/unauthorized access occurs, but do not destroy data or rotate secrets without incident-response authorization.
- Revert GitHub Pages by deploying a previously validated commit; rotate service-worker cache safely.
- Redeploy the previous Worker only after confirming compatibility with newer Durable Object records and R2 metadata.
- If a data restore is necessary, first reconcile writes that occurred after the backup. Do not silently replace live state.
- Re-run negative authorization tests, smoke tests and audit consistency checks before reopening writes.

## Do-not-do list
- Do not claim a code branch/commit is a full data backup.
- Do not export email tokens, raw session tokens, passwords or reset codes into public logs.
- Do not delete `ORIGINAL_REPORTS` or rewrite Git history without explicit approval and a replacement/reconciliation plan.
- Do not declare Phase 1 complete until a staging restore has actually succeeded.

## Operator attestation checklist
- [ ] Production Durable Object export secured; timestamp and record counts recorded
- [ ] Production file manifest and object backup secured (or confirmed no R2 bucket)
- [ ] Local-only data inventory completed
- [ ] Encrypted offsite or separate-account backup copy present
- [ ] Staging restore completed; SHA-256/record-count reconciliation passed
- [ ] Negative access tests passed against staging
- [ ] Rollback/restore evidence attached to private operations log
- [ ] Authorized owner approves progress to production security changes

**Current result:** All boxes UNVERIFIED / NOT PERFORMED from this GitHub-only session.
