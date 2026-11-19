# GAIUS Ministry v11.0 — Director-centered Governance & Operations PWA

**This is a real implementation update built on v10.3, not a clean-slate replacement.** It retains the original v10 page/workflow, historical reports, branding and assets, and adds a separate **GAIUS v11 Workspace** accessed from the header after sign-in.

## Features implemented in code

- Shared, authenticated v11 records across six-month plans, monthly reports, director / HQ / center follow-up, center-leader attendance, successors (two slots per incumbent), mentoring, centers/departments, teaching schedules, editable master documents, documents, board/advisory meeting records, subcommittees/projects, tasks/decisions and ministry updates.
- Director/Full Admin governance across Country Director and International Director, with **one shared backend-only bootstrap secret** usable for one initial account in each director role. Duplicate claims and browser-only director bootstrap are refused.
- New center roles, center assignment during registration, required-field * indicators, pending approval, existing password recovery and permanent-account-removal safeguards.
- Visibility enforced on **backend** by role, center/HQ scope, record owner, submitted/approved status and delegated permissions. Director personal records are owner-only.
- Offline PWA shell/cache; local IndexedDB **drafts for non-sensitive records** that users can manually synchronize after reconnecting. **Approvals, account management and publication require server connectivity.**
- In-app topical monthly report summary with Planned/Actual/Result/Challenge/Next Action, basic KPI calculation, genuine **DOCX** and offline-created rasterized **PDF** downloads including Amharic text rendered by the device font.
- Optional secure 10 MB file uploads (PDF, DOCX, images, MP4, TXT) with Cloudflare R2, server-mediated private downloads and Full Admin file approval, rejection or removal.
- Full ministry identity, original v10 October reports and original v10 navigation preserved.

## What requires deployment or other source material

1. The cross-device backend requires deployment of the included Cloudflare Worker, Durable Object and the browser URL in `gaius-config.js`.
2. Uploads require a Cloudflare R2 bucket linked as `MEDIA_BUCKET`.
3. Email recovery requires a verified Resend sender and Cloudflare-only email credentials.
4. The separate Center Leaders' app is **not automatically integrated**: its current API/database schema and credentials were not supplied, so v11 contains center-scoped records and a documented integration contract, not a fabricated live connection.
5. The full organizational manual and complete teaching roadmap should be **imported after login by a Director** into the `Master Documents` editor. Their confidential source files are **not** embedded in public GitHub Pages.
6. This release was tested in Node integration checks and document-format validation. A real Cloudflare deployment, production email delivery, external Center App sync, live R2 upload, and end-to-end browser/mobile QA remain unverified and must be tested before organizational rollout.

## Start

- **Existing GitHub repository**: upload files from `GAIUS_v11_Update_Only.zip` (extracted) into the **repository root**. Do not delete other legacy files. Prefer a backup branch and a pull request.
- **New GitHub repository**: upload the full repository ZIP (extracted).
- Follow `GAIUS_v11_SETUP_AMHARIC.md` for Cloudflare / R2 / email / GitHub steps and role-based acceptance tests.
- Run Node tests: `npm test` (Node 20+). No npm dependencies are required to view the PWA.

**Security:** The unconfigured `apiUrl: ""` leaves the original local-browser mode accessible, but that local mode is **not** a trustworthy multi-user or confidential production deployment. Browser-based director bootstrap is deliberately disabled. Never store `SETUP_KEY`, Resend or R2 secrets in GitHub.
