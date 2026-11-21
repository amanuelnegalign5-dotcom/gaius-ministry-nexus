# Verified test/deployment evidence — 2026-11-21

## Known successful GitHub runs on main
- Security regression: [GitHub Actions run 44887404803](https://github.com/amanuelnegalign5-dotcom/gaius-ministry-nexus/actions/runs/44887404803), commit `22029e84714b995f9c70b6638863f4ead4083d61`: **52 passed / 0 failed / 0 skipped**. This run was on PR head, and is not direct proof of an identical post-merge production state.
- Pages/Worker pipeline: [run 44887475871](https://github.com/amanuelnegalign5-dotcom/gaius-ministry-nexus/actions/runs/44887475871), `main` commit `4aba3e25f36c0c42c7c5d2764057e5ce194ce4ee`: `verify`, `deploy-backend`, `build`, `deploy` all completed successfully.
- `package.json`: `node --test tests/*.test.mjs`. Historical tests are not a guarantee of complete test-case coverage.

## Unknown / outstanding
- No independently verified iPhone Safari or installed-PWA end-to-end account workflows.
- No verified R2 upload/download for actual Office/PDF/images or revoked file recipients.
- No live Resend email recovery receipt.
- No staging restore of real or sanitized production Durable Object state.
- No verified real-account abuse, negative-role or external penetration test.
- No independent public URL/Worker `/info` retrieval from the current browsing interface.

## Future test strategy
1. CI tests: static-build graph integrity, role-scope unit+API integration, negative access control, draft/review state transitions, duplicate-safe imports, file MIME + signature validation.
2. Staging browser tests: realistic login, 9 HQ leaders, both Directors, center leader/staff, mobile file picker, PDF/Office downloads, language switch, offline handling and PWA refresh.
3. Restore tests: migration dry run, integrity checks, fresh/stale session validation and rollback.
4. Security gate: independent review and owner approval before production authorization/data migration.

**Current outcome:** Source-level CI green. Production acceptance **NOT VERIFIED**.
