# Gaius Nexus — v11.1 Changes

- Preserved the historical v11 code, reports, and governance logic.
- Added `directorGoals` and `visits` server-checked private record kinds.
- Added server-authorized bulk import of the Director's original 16-objective plan, with immutable source snapshots and total ETB 68,000 validation. Source data shipped separately for privacy.
- Added Addis Ababa monthly and Bishoftu bi-monthly center visit compliance calculations based on registered centers.
- Added separate individual advisory contact and formal advisory board meeting classifications.
- Added HQ department-specific monthly report fields and manually recorded Ethiopian period labels.
- Added analytics with attendance visualizations, comparable-unit planned/actual display, and no synthetic targets.
- Added deduplication for center weekly follow-ups and center leader visibility of submitted own-center reports.
- Applied the user's GAIUS logo, PWA icons, modern bilingual mobile layout, and Gaius Nexus name.
- Added a frontend-only GitHub Pages workflow to avoid publishing Worker backend files through the website.
- Hardened bootstrap: registered Director role requires preapproved email address, one-time email verification code, and server-side setup key.
- Added local domain tests and release setup documentation.

## Unfinished external tasks

Actual GitHub/Cloudflare deployment, remote email tests, iPhone PWA QA, secure production migration, and integration with the separate Center App are still required.
