# GAIUS Nexus — controlled production release checklist

Release status on baseline: **BLOCKED**; do not award 10/10 or claim rollout complete.

## Mandatory release gates
- [ ] Proven private backups of production Durable Object and R2/local data; staging restore passes
- [ ] Historical public October report exposure evaluated; owner-approved migration/redaction, retention and Git/history impact reviewed
- [ ] Personal files of Directors and other users are owner-only unless owner-authorized sharing is explicitly designed and tested
- [ ] Every HQ leader, each Director, center leader, center department leader and staff can complete authorized workflows; cross-scope access fails
- [ ] Zero unresolved Critical/High security findings; independent review of sensitive API authorization
- [ ] R2 bucket private and binding verifiably configured (or uploads clearly disabled)
- [ ] Signed-off attachment scanning/quarantine/retention policy
- [ ] iPhone Safari, installed PWA and desktop UAT completed with bilingual controls, non-overlapping UI and uploads
- [ ] Resend sender verification and recovery deliverability tested, or recovery disabled and explicitly documented
- [ ] Source-document reconciliation validated against protected original files; missing content flagged
- [ ] Full test suite and artifact-integrity checks green on exact release commit
- [ ] Backup restore, alerting, runbook and rollback verified
- [ ] Approved release candidate and responsible organizational owner recorded

## Decision
Status: **NO-GO until gates complete**. A passed GitHub Actions job is necessary but not sufficient. If the owner agrees to a time-bounded pilot, it must use synthetic/non-sensitive data until privacy, storage and recovery controls are verified.

## Acceptance scoring
Security 25; functionality 20; recovery 15; data integrity 15; mobile UX 10; maintainability/testing 10; governance 5. Points are earned **only** from evidence. Security, confidentiality or restore failures override any numerical total. Previous qualitative estimates (7/10, 3/10) remain provisional.
