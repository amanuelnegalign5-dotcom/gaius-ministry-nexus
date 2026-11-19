# Feature-status matrix — exactly what is delivered

| Requirement | Release status | Notes |
|---|---|---|
| Preserve v10.3 source and original reports | Done in repository | The original six October source payloads are byte-identical within `index.html` |
| Amharic and English interface | Implemented | v11 navigation and form labels translated, some legacy fields still use original labels |
| New director bootstrap shared code | Implemented in core | Requires deployed `SETUP_KEY` and authenticated Cloudflare Worker |
| Both Director / Full Admin rights | Implemented in core | Existing v10 account management carried forward |
| Center/HQ registration roles and required stars | Implemented | Director must approve registrations; center assignment is required for center roles |
| Scoped plans, monthly reports, approvals | Implemented | v11 records in shared Durable Object or local demo mode |
| Report summary Planned/Actual/Result/Challenge/Next | Implemented | 6 preserved legacy reports can also be exported |
| DOCX and PDF exports | Implemented | Tested DOCX parser and PDF file structure; Safari device QA still needed |
| Center follow-up and Sunday/biweekly attendance | Implemented as forms/records | Aggregates and person-level leader attendance; backend authorizes scope |
| Mentoring and two successor slots | Implemented | Director-private vs HQ scopes; two active slots per leader |
| Board/advisory and director notes | Implemented | Editable profile/meeting records; monthly reminders shown as upcoming work |
| Editable master-doc and teaching roadmap | Editor implemented | Original full source must be securely pasted; no automatic DOCX parser |
| Secure file upload/approval | Implemented as backend routes | Requires R2 bucket and production test |
| Offline shell and nonrestricted draft queue | Implemented | IndexedDB manual sync, subject to session and device storage limitations |
| Connected to separate Center App | Not yet integrated | Its exact code/API not provided; integration contract documented |
| Scheduled push/email reminders | Not implemented | In-app upcoming deadline view only |
| Live production Cloudflare/GitHub deployment | Not performed | User account setup is still necessary |
| Production security validation | Partial | Role/domain tests passed; penetration, device and external infrastructure tests outstanding |
