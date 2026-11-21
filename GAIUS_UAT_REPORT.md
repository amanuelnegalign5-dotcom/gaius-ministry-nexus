# User Acceptance Test plan and execution log — NOT EXECUTED

## Required preconditions
- Staging environment and private synthetic dataset.
- Representative approved test identities for each required role, not shared real passwords.
- Staging R2 and Resend sender or mocks clearly labeled, no real counseling data.
- Baseline build fingerprint, test device/browser, and a tested rollback/recovery plan.

| Test | Scenario | Expected | Result |
|---|---|---|---|
| UAT-01 | Country Director login and separate personal space | Personal content visible only to owner | NOT EXECUTED |
| UAT-02 | International Director management and cross-director private read | Organizational oversight, other Director private files denied | NOT EXECUTED |
| UAT-03 | All nine HQ leaders open submitted reports | Each sees all shared HQ reports; other leaders' drafts hidden | NOT EXECUTED |
| UAT-04 | Center leader plan/report | Own center only | NOT EXECUTED |
| UAT-05 | Center department leader plan/report | Own center and department only | NOT EXECUTED |
| UAT-06 | Ordinary staff attendance and personal plan | Own work only; HQ reports denied | NOT EXECUTED |
| UAT-07 | New user registers → approved → login | Pending access denied until approval | NOT EXECUTED |
| UAT-08 | Submitted plan → review → revision → approval | Authorized reviewers and clear audit | NOT EXECUTED |
| UAT-09 | Upload PDF/Word/PPT/Excel/image | Works after configured R2 binding; validates files | BLOCKED |
| UAT-10 | Approved file grant → download → revoke | Denied after revocation even using direct API | BLOCKED |
| UAT-11 | iPhone Safari sign-in and file picker | Visible labels, no overlapping controls | NOT EXECUTED |
| UAT-12 | Installed PWA offline draft → sync | No confidential draft leakage, no duplicate records | NOT EXECUTED |
| UAT-13 | Password reset / email verification | Verified real email delivery and reset/login | BLOCKED |
| UAT-14 | Backup → isolate → restore | Source/hash/user/files match | BLOCKED |
| UAT-15 | Bilingual switching and accessible forms | Amharic/English functional, readable | NOT EXECUTED |

## Evidence collection
For each row record date, browser/device version, role, sanitized record IDs, expected/actual behavior, screenshot or test log, incident/issue, reviewer initials, and final pass/fail. No actual credentials or private ministry reports in public CI artifacts.

Current UAT sign-off: **NOT APPROVED**.
