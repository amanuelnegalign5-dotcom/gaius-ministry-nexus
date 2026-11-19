# Gaius Nexus | ጋይዮስ ኔክሰስ

**GAIUS Ministry v11.1 — Final Director & Analytics Source Release**

Gaius Nexus is the existing GAIUS v11 bilingual (Amharic/English) Progressive Web Application expanded with Country Director visit scheduling, a private 16-goal six-month plan importer, department-specific reports, center analytics, and a mobile-first GAIUS-logo appearance. The existing v11 modules, governance, user registration, attendance, secure documents, offline draft queue, and six historical October reports are preserved.

**Not a hosted deployment.** The ZIP contains working source plus locally exercised tests. A shared Worker backend, R2 storage, and Resend configuration are required for several features. Live Cloudflare, GitHub Pages, Safari, and phone-to-phone testing is NOT VERIFIED. The separate Center Leaders application is not synchronized with this application.

## Important privacy boundary

The 16-objective Country Director plan is **not included in this public-repository ZIP** because it belongs to the Director's private workspace. The separate `GAIUS_Nexus_v11_1_Private_Director_Plan_Import.json` is distributed directly to the Director and must NEVER be added to public GitHub files. After deploying a secure backend, the Country Director opens **Gaius Nexus → Director workspace → Import privately** and selects that JSON. The server validates the goal count and original ETB 68,000 total, imports an editable working copy, and preserves an immutable source snapshot. The original DOCX can also be uploaded separately to a **Personal** file scope.

## Source tree

- `index.html`, `gaius-app.js`, `gaius-v11-ui.js`, `gaius-v11.css`, `gaius-nexus-analytics.js`: frontend
- `gaius-core.js`, `gaius-v11-core.js`, `gaius-v11-model.js`: shared domain and role rules
- `gaius-worker.js`, `gaius-recovery.js`, `wrangler.jsonc`: server/backend; **do not publish these to GitHub Pages**
- `gaius-store.js`: network/local storage abstraction
- `gaius-v11-export.js`: Word/PDF client exports
- `sw.js`, `manifest.webmanifest`, `icons/`: PWA offline shell and supplied-logo assets
- `.github/workflows/static.yml`: frontend-only GitHub Pages upload
- `tests/`: automated domain tests
- `GAIUS_Nexus_v11_1_SETUP_AMHARIC.md`, `QA_V11_1_RESULTS.md`, `MIGRATION_ROLLBACK_V11_1.md`: implementation documentation

## Testing locally

```bash
npm test
python -m http.server 8765
```

Visit `http://localhost:8765` to inspect the public frontend. A local-browser fallback is a **limited demo/data archive mode**, not an appropriate backend for authentic Director registration or multi-device access.

## New security requirement for Directors

Before either original Director registers, configure secure Cloudflare Worker secrets: `SETUP_KEY`, `COUNTRY_DIRECTOR_EMAIL`, `INTERNATIONAL_DIRECTOR_EMAIL`, `RESEND_API_KEY`, `RESET_CODE_SECRET` and `MAIL_FROM`. The same setup key works for both pre-authorized role slots, but each registered Director must confirm an emailed one-time code. Public client JavaScript contains no Director setup key and cannot issue a Director account by itself.

**Recommended GitHub repository:** `gaius-ministry-nexus` (availability not independently verified).

See the Amharic setup guide for installation and deployment constraints.
