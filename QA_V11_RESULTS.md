# GAIUS v11 Quality Assurance — evidence and boundaries

Date: 2026-11-19. Test environment: local Node 22, simulated in-memory domain DB.

**Passed:** `npm test` (5 integration tests). Tests cover two-director first-time bootstrap and refusal of a third duplicate; department-scoped report draft/submission/approval and cross-department denial; director-private documents and duplicate successor-slot refusal; and refusal to issue a new director in insecure local-browser mode; and center monthly-report isolation across center leaders and directors.

**Passed file-format checks:** JavaScript-created DOCX opened with `python-docx`, including Ethiopic characters; a mocked-canvas PDF passed `pdfinfo` parsing as a valid A4 PDF.

**Source preservation:** full package is based on all 27 files from GAIUS v10.3, with additions and changed paths documented in the release manifest. Six original October source reports remain in `index.html` and are not rewritten.

**NOT tested here:** real browser functionality (headless Chromium navigation was blocked in this tool environment), Cloudflare Worker/Durable Object deployment and persistence, actual R2 uploads or downloads, Resend inbox delivery, Safari/iPhone PWA cache, real multi-phone synchronization, local-to-server record migration, center-app integration, and public GitHub Pages production build. These require user-hosted staging and manual verification.

**Do not claim production-ready until those checks pass.**
