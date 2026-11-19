# Gaius Nexus v11.1 — Migration and Rollback

## Preservation

All v11 `index.html` October report source payloads have been checked for exact byte equality against the source ZIP. The core data system continues to use the existing Durable Object storage. New record kinds (`directorGoals` and `visits`) are additive; no destructive SQL schema migration is performed in this package.

## Before release

1. Tag or copy the currently deployed Git commit. Create a backup branch.
2. Export an independent backup of all production Durable Object data, R2 files, and any local-browser records that matter. This source package itself does **not** back up your production database.
3. Record the existing worker deployment and resource IDs.
4. Use a staging Worker and staging GitHub Pages deployment. Test two Director roles and approved account workflows.
5. Test new private plan import exactly once using your own authorized Country Director account.

## Update-only package

Compare against the exact `GAIUS_v11_Complete_Repository.zip` base. Replace only listed paths from the update ZIP. Unlisted files must be retained.

## Rollback

1. Disable editing if a release issue risks data loss.
2. Revert the frontend to the previously tagged commit, using the previous app shell / service worker cache version.
3. Redeploy the old Worker source **only when** compatible with the current records. Do not blindly clear the Durable Object or R2 files.
4. Newly inserted v11.1 `directorGoals` and `visits` remain in the shared database unless deliberately archived/exported; rollback does not automatically delete them.
5. Restore from the independent backup only after reviewing whether data created after the backup must be preserved.

## Known challenges

- This package has not restored production data in a real Cloudflare environment.
- The separate Center App does not yet synchronize.
- Legacy October report text remains embedded in `index.html` because source preservation was required. Anyone viewing the public page source may read it: **review privacy before publishing any sensitive information**.
- The private Director JSON is intentionally outside the repository ZIP. Import it after authentication, not at build time.
