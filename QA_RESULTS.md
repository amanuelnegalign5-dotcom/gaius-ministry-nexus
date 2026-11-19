# GAIUS v10.3 — permanent deletion verification (2026-11-19)

**New integration coverage:** Node.js + SQLite using the unchanged production core and Worker logic. Verified Full Admin-only permissions, delegated manager denial, re-authentication and exact name/phrase confirmation, stale version rejection, pending and removed account purge, removal of another Full Admin while retaining an active Full Admin, transaction rollback on an injected database failure, removal of active sessions/OTP challenges/idempotency receipts, account lookup/login failure, anonymization of report/plan/comments/review/audit/attendance/project/document metadata, preservation of historical data and approval statuses, self-deletion with another admin present, and refusal to delete the last active Full Admin. Original protected October sources remain untouched.

**Not yet verified in a live deployment:** Cloudflare production traffic, email-provider inbox delivery, iPhone browser interface, historic backups, or free-text personal-data redaction. A scripted browser smoke test could not connect to localhost in the execution environment; do not interpret core integration success as a production security audit.

---

# GAIUS v10.2 — verification record (19 November 2026)

## Checks performed on the delivered release

- Syntax-checked all JavaScript files, including the Cloudflare Worker, recovery module, and service worker.
- Compared the release to the supplied v10 archive: all 17 original files retained; original six October reports (Amharic and English), all original agreement strings, logo assets, GitHub Actions configuration, and manifest confirmed unchanged.
- Confirmed unique HTML element IDs, correct linked script files, and cache version bump to 10.2.0.
- Four Node.js integration test suites passed against an in-memory SQLite test Worker and a **mock email delivery service**. They covered missing email configuration, origin restrictions, recovery requests that do not reveal account existence, 8-digit code verification, bad codes, strong password checks, session invalidation, protected email change, attempt limits, resend replacement, and concurrent one-time-code use.
- Verified 200/401/403/400 status behavior and one-time-code reuse prevention in the test harness.

## Requires configuration and live validation

- **No live email was sent**: Resend's actual delivery, DNS domain verification, spam filtering, and Cloudflare deployment require the organization to provide its own external accounts and secrets.
- Cross-device mobile-browser testing in the final production deployment and iPhone Add to Home Screen must be done after publication.
- The shared Cloudflare Durable Object requires production backup and recovery procedures.
- Do not assume the old local browser records have been migrated into shared storage; no automatic data-import workflow is included.
- This release does not provide hardware-backed MFA, a formal penetration test, an immutable external audit sink, or a regulated private file vault.
