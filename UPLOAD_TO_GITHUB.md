# GAIUS v10.3 GitHub upload instructions

**For a GitHub repository that currently contains v10, v10.1 or v10.2:** extract `GAIUS_v10_3_GitHub_Update.zip`, then upload the extracted contents into the repository **root beside `index.html`**. Do not remove other v4/v10 files. Work on a new branch, inspect the diff, and merge only when no unreviewed changes will be overwritten. Keep the Worker deployment bound to the **existing** Durable Object, not a newly named database. See [Amharic administrator delete guide](GAIUS_v10_3_ADMIN_DELETE_AMHARIC.md).

---

# GAIUS v10.2 — Updated upload guide

Use [the new Amharic guide](GAIUS_v10_2_SETUP_AMHARIC.md) rather than uploading the ZIP as one file. Place its extracted files at the root containing `index.html`.

---

## Prior instructions

# Updating the existing v10 GitHub repository

Use the file list and instructions for this upgrade. [የአማርኛ የGitHub መመሪያ](GAIUS_v10_GitHub_Amharic.md)

## Archived instructions from the supplied v10 package

# Upload to a new GitHub repository

1. Create a new GitHub repository.
2. Extract `GAIUS_v9_Final_GitHub_Repository.zip`.
3. Open the `GAIUS_v9_GitHub_Repository` folder.
4. Upload every item inside that folder to the repository root. Include `.github`, `.nojekyll`, `icons`, and all Markdown documents.
5. Commit to the `main` branch.
6. In GitHub, open Settings > Pages and choose GitHub Actions.
7. Wait for the workflow `Deploy GAIUS v9` to complete successfully.
8. On iPhone, open the Pages link in Safari and choose Share > Add to Home Screen.

`index.html` must be at repository root, not inside a second nested folder.

---
## v11 update for an existing GitHub repository

**Do not delete other v4/v10 files** unless an explicit reviewed plan calls for that. Extract `GAIUS_v11_Update_Only.zip`, upload/replace its exact relative paths at the repository root (where `index.html` already lives), and retain all other repository files. Select a feature branch first, review the diff, and merge only after checking the preview.

After GitHub Pages publishes, the **new Director setup will still need Cloudflare Worker, R2 (for private media) and secret configuration**. Read `GAIUS_v11_SETUP_AMHARIC.md`. The update ZIP is not a one-click secure hosting service.
