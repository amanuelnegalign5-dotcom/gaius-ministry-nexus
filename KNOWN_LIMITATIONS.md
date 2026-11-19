# Additional v10.3 limitations

1. Permanent user deletion removes the account and structured personal references in the **active** workspace database, but does not redact names in free-text reports, attached media, filenames, exports, downloaded backups, email-provider logs, or offline copies. Review those separately when handling a data-erasure request.
2. The local-only/browser mode can be modified by anyone with access to that browser and is not a production security boundary. The shared Worker is required for server-enforced Full Admin permissions.
3. Cloudflare backup/snapshot retention and external copies must be handled under an organizational retention and legal-compliance policy. "Permanent" describes deletion from the current live account database, not guaranteed destruction of all copies.
4. The command is atomic for a single Durable Object. The local browser storage adapter is best-effort and is not a replacement for a regulated or audited system.
5. Keep at least two trusted Full Admin accounts where practical, use strong unique passwords, and maintain a tested backup/restore procedure for organization records.

---

# Known limitations — v10.2

1. **Email requires a backend and verified sender.** GitHub Pages cannot send password-reset codes securely. Configure the shared Cloudflare Worker, verified Resend domain, `RESEND_API_KEY`, `RESET_CODE_SECRET`, and `MAIL_FROM` server-side to enable email recovery. When not configured, the application explains that email recovery is unavailable rather than simulating success.
2. **Local browser data is not a shared database.** Local v10 records remain on their original browser and are not automatically migrated to the Cloudflare Durable Object. A backup/export is available, but importing it is not automated.
3. **Original source reports may be public.** The six existing October texts remain embedded in `index.html` by preservation request. Public GitHub Pages visitors could inspect their contents. Do not upload any other confidential information into published source code.
4. **Document registry does not equal private file storage.** Document metadata is recorded; the platform is not a secure repository for sensitive clinical, pastoral, or financial records.
5. **Production governance needs operational controls.** Use separate administrator accounts, long unique passwords, least-privilege delegation, verified ownership of email addresses, and regular backup tests. Hardware MFA, externally immutable logs, and routine external backups are not included.
6. **Email reliability is external.** OTP delivery is subject to the organization's Resend account, domain DNS, recipient inbox, and service limits. A mock-delivery test is not a guarantee of actual inbox delivery.

---
# v11 additions and unresolved work (2026-11-19)

1. **Not deployed in the user's GitHub or Cloudflare.** This ZIP is a prepared code release and must be uploaded and configured by the account holder.
2. **Full Center App integration remains unimplemented.** A separate Center App was mentioned but its source/schema was not supplied here. Center-scoped forms in v11 are a working standalone module, not a fabricated live integration.
3. **Manual import.** Original GAIUS ministry and Teaching Roadmap DOCX/DOCM text is not included in public GitHub assets. Authorized Directors can paste the full text into `Master Documents`, where history is kept. Automatic DOCX text import and document collaboration are future work.
4. **Cloudflare R2 required** for actual photo/video/document storage; the old v10 documents area is still metadata-oriented. An authenticated R2 Worker route is provided but requires deployment and private bucket setup.
5. **Offline scope.** Offline cache and IndexedDB save/sync cover newly authored *non-restricted* drafts, not sensitive records, remote approvals, account changes or media uploads. Local browser fallback is insecure for multi-user governance.
6. **Existing historical reports embedded in public index.html.** They were preserved by explicit requirement; this makes them potentially visible to public GitHub visitors. Removing/migrating them requires explicit authorization and a tested replacement.
7. **Report formats.** DOCX is editable and tested in python-docx. PDF rendering is based on the device's available Amharic font and rendered as images; actual iOS PDF download/font behavior was not browser-tested here.
8. **Reminder delivery** is currently an in-app upcoming deadline overview; scheduled push/email notifications are not deployed.
9. **Cloudflare operational verification remains.** Check compatibility/migrations, R2, Resend verified domain, real multi-device sessions, rate limiting, storage recovery, and backup restore before production.
10. **Original v10 local-only director bootstrap is disabled.** The old fixed frontend code is unsafe and no longer accepted for new director accounts. An operational Cloudflare backend with `SETUP_KEY` is required.
11. **Known legacy scope.** Preserved v10 pages and local browser records have older permissions/data formats; v11 module enforces new scope rules on v11 records, but full legacy refactoring and a privacy migration audit are still needed.
12. **File scanning / privacy:** basic type and size validation exists; malware scanning, immutable auditing, automated consent workflows, scheduled reminders, externally verified backups, and emergency break-glass procedures are not delivered.
