## Multisite Setup Guide

This guide explains how to configure, theme, and sync a multisite setup using this repository as the reference. It covers how child sites (brands) inherit from the main repository and how to safely push updates to each brand.

### Prerequisites
- A GitHub App with installation on your organization/user
- GitHub App permissions (minimum):
  - `Contents: Read and write`
  - `Actions: Read and write`
  - `Workflows: Read and write` (only if you intend to push workflow files to child repos)
- Secrets in the main repository:
  - `APP_ID` (numeric GitHub App ID)
  - `APP_PRIVATE_KEY` (full PEM content with header/footer and newlines)
  - Optional: `GITHUB_INSTALLATION_ID` (installation pinned to your owner)

### Repository Anatomy
- `.multisite/config.yaml`: defines child (brand) repositories to sync to.
- `.multisite/<brand>/...`: brand-specific overrides. Everything in this folder is copied into the repo root during sync for that brand.
- `.github/workflows/sync.yaml`: workflow that copies overrides into each child repo and pushes the result.
- `styles/styles.css`: base variables and global styling.
- `styles/theme.css`: site- or brand-level variable overrides (loaded after base stylesheet).
- `head.html`: HTML head where stylesheets are loaded.

### Configure the GitHub App
1. Create or select your GitHub App: Settings → Developer settings → GitHub Apps.
2. Permissions → Repository permissions:
   - Actions: Read and write
   - Contents: Read and write
   - Workflows: Read and write (only if pushing workflow files to child repos)
3. Save.
4. Install the app: Install App → choose owner `ComwrapUkReply` (example) → select `All repositories` or at least:
   - `eds-multisite-demo-main`
   - `eds-multisite-demo-gold`
   - `eds-multisite-demo-silver`
5. If prompted to approve new permissions, confirm/approve.

### Add Repository Secrets
In the main repo (this one): Settings → Secrets and variables → Actions → New repository secret
- `APP_ID`: the numeric App ID (not Client ID)
- `APP_PRIVATE_KEY`: paste the entire `.pem` private key, including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` and real newlines
- Optional `GITHUB_INSTALLATION_ID`: if you want to pin a specific installation

Tip: If you ever see `Invalid keyData` or ASN.1 errors, regenerate the private key from the GitHub App and paste it again with all headers/footers and newlines.

### Sync Workflow (Overview)
The workflow `.github/workflows/sync.yaml` uses your GitHub App to:
1. Generate an installation token
2. Check out the main repo with that token
3. For each brand defined in `.multisite/config.yaml`:
   - Copy `.multisite/<brand>/` into the repo root
   - Commit and push to the corresponding child repo

Relevant step in `sync.yaml` (abbreviated):
    with:
      app-id: ${{ secrets.APP_ID }}
      private-key: ${{ secrets.APP_PRIVATE_KEY }}
      owner: ${{ github.repository_owner }}

Notes:
- This setup pushes directly to `main` on each child repo (history is force-overwritten). Consider switching to a branch+PR model if you want code review or to avoid rewriting history.
- If your app does not have `Workflows: write`, you must avoid staging `.github/workflows/**` when committing changes to child repos.

### Defining Brands
Edit `.multisite/config.yaml` and add sites pointing to the child repositories. Example shape:
    sites:
      demo-gold:
        origin: https://github.com/ComwrapUkReply/eds-multisite-demo-gold
      demo-silver:
        origin: https://github.com/ComwrapUkReply/eds-multisite-demo-silver

Create brand folders with overrides:
- `.multisite/demo-gold/` and `.multisite/demo-silver/`
- Put only the files you want to override relative to the project root (e.g., `styles/theme.css`, `fstab.yaml`, `head.html`, etc.)

### Theming Rules
- Load base CSS first, then brand theme last, so theme variables override base variables.
- In `head.html`, ensure order:
    <link rel="stylesheet" href="/styles/styles.css"/>
    <link rel="stylesheet" href="/styles/theme.css"/>

- Base variables live in `styles/styles.css` under `:root`.
- Brand-specific overrides go in `styles/theme.css` under `:root` in each brand folder, e.g. `.multisite/demo-gold/styles/theme.css`.

Example brand override (`.multisite/demo-gold/styles/theme.css`):
    :root {
        /* colors */
        --text-color: rgb(217, 255, 0);
        --heading-text-color: rgb(255, 215, 0);
        --link-color: #1071b0;
        --link-hover-color: #1071b0;
        --header-background: #1071b0;

        /* sizes, fonts, etc. as needed */
    }

Keep structural CSS and block styling in the base; use theme files primarily for tokens (variables) to minimize drift across brands.

### Running the Sync
- The workflow triggers on `push` to the main repo (and can be `workflow_dispatch`).
- Once it runs:
  - It copies each brand’s overrides into a clean state, commits, and pushes to each child repo.
  - The child repos are then deployed independently by their own pipelines (e.g., Edge Delivery).

### Verifying Changes
1. Confirm the child repos received the updated files.
2. Open the brand sites and hard-refresh to bypass caches:
   - Gold site: https://main--eds-multisite-demo-gold--comwrapukreply.aem.page/
   - Silver site: https://main--eds-multisite-demo-silver--comwrapukreply.aem.page/
3. Inspect their theme files directly to confirm the latest content:
   - Gold theme: https://main--eds-multisite-demo-gold--comwrapukreply.aem.page/styles/theme.css
   - Silver theme: https://main--eds-multisite-demo-silver--comwrapukreply.aem.page/styles/theme.css

### Troubleshooting
- `Invalid keyData` or ASN.1 errors when generating token:
  - Regenerate the GitHub App private key and paste the full PEM with headers/footers and newlines into `APP_PRIVATE_KEY`.

- `refusing to allow a GitHub App to create or update workflow ... without workflows permission`:
  - Grant `Workflows: Read and write` to the GitHub App and re-approve installation for the target repos; or avoid staging `.github/workflows/**` when committing to child repos.

- Brand colors don’t update:
  - Ensure `head.html` loads `/styles/styles.css` before `/styles/theme.css`.
  - Verify the brand theme file exists and is updated in each child repo.
  - Hard-refresh or append a cache-buster query to the `theme.css` link if needed.

- No access to target repos:
  - Confirm the app is installed for all needed repos or switch to `All repositories` for the installation.
  - Optionally provide `installation-id` to the token step to pin the installation.

### Recommended Improvements (Optional)
- Commit-on-diff only: skip committing when no changes are detected.
- Switch to branch + PR per child repo to avoid history rewrite and enable review.
- Add a `.multisite/.syncignore` to centrally exclude files (e.g., workflows, CODEOWNERS) when desired.
- Add concurrency to avoid overlapping runs: `concurrency: sync-multisite-${{ github.ref }}`.
- Use a job matrix to process brands independently for clearer logs and partial failures.
- Pin action versions by SHA for supply-chain safety.

### Quick Checklist
- `APP_ID` and `APP_PRIVATE_KEY` secrets exist and are correct.
- GitHub App installed on all relevant repos (`main`, all child repos).
- Permissions granted (and re-approved) for Contents/Actions/Workflows (as needed).
- `head.html` loads `styles.css` first, then `theme.css`.
- Brand overrides live in `.multisite/<brand>/` and contain only the files to override.

With this setup, updating shared code or tokens in the main repo and brand-specific tokens in each `.multisite/<brand>` will propagate cleanly to each site.

## Agent Runbook (Hands-free Execution)

This section provides deterministic variables, commands, and checks so an automation agent can set up and operate the multisite reliably.

### Define Variables (adjust as needed)
    export OWNER="ComwrapUkReply"
    export MAIN_REPO="eds-multisite-demo-main"
    export CHILD_REPOS="eds-multisite-demo-gold eds-multisite-demo-silver"
    export APP_ID="<numeric-app-id>"
    export INSTALLATION_ID="<optional-installation-id>"
    export PRIVATE_KEY_PATH="/path/to/private-key.pem"  # must be PEM with BEGIN/END and newlines

### Create/Update Secrets in Main Repo (requires `gh` CLI and repo admin)
    gh repo set-default "$OWNER/$MAIN_REPO"
    gh secret set APP_ID --repo "$OWNER/$MAIN_REPO" --body "$APP_ID"
    gh secret set APP_PRIVATE_KEY --repo "$OWNER/$MAIN_REPO" < "$PRIVATE_KEY_PATH"
    # Optional if workflow pins installation
    if [ -n "$INSTALLATION_ID" ]; then gh secret set GITHUB_INSTALLATION_ID --repo "$OWNER/$MAIN_REPO" --body "$INSTALLATION_ID"; fi

### Install/Update GitHub App Permissions (manual UI step)
- App must have: Contents: Read & write, Actions: Read & write, Workflows: Read & write (if pushing workflow files)
- Re-approve the installation for owner `$OWNER` and include: `$MAIN_REPO` and all repos in `$CHILD_REPOS`.

### Preflight Checks
Create `scripts/preflight.sh` and run it before sync. It should:
    #!/usr/bin/env bash
    set -euo pipefail

    missing=0
    for v in APP_ID APP_PRIVATE_KEY; do
      if ! gh secret list --repo "$OWNER/$MAIN_REPO" | grep -q "^$v\b"; then
        echo "Missing secret: $v"; missing=1; fi
    done
    if [ "$missing" -eq 1 ]; then exit 1; fi

    # Validate PEM locally if available
    if [ -f "$PRIVATE_KEY_PATH" ]; then
      if ! openssl pkey -in "$PRIVATE_KEY_PATH" -noout -check >/dev/null 2>&1; then
        echo "APP_PRIVATE_KEY PEM invalid"; exit 1; fi
    fi

    # Verify head.html order (base first, theme last)
    if ! grep -q "/styles/styles.css" head.html || ! grep -q "/styles/theme.css" head.html; then
      echo "head.html missing required stylesheets"; exit 1; fi
    order=$(awk '/styles\/styles.css/{print NR} /styles\/theme.css/{print NR}' head.html | paste -sd, -)
    base_line=${order%,*}; theme_line=${order#*,}
    if [ -z "$base_line" ] || [ -z "$theme_line" ] || [ "$theme_line" -le "$base_line" ]; then
      echo "Incorrect stylesheet order in head.html"; exit 1; fi

    echo "Preflight OK"

Run preflight:
    bash scripts/preflight.sh

### Optional: Safer Sync Mode (Branch + PR)
- Instead of force-pushing to child `main`, the workflow can push a branch per brand and open a PR.
- Policy flags to document for the agent:
  - `SYNC_FORCE_PUSH=true|false`
  - `SYNC_EXCLUDE_WORKFLOWS=true|false`
  - `SYNC_ONLY_IF_DIFF=true|false`

### Job Permissions and Concurrency (in workflow)
- Ensure job-level permissions are explicit when needed:
    permissions:
      contents: write
      actions: write
      workflows: write

- Prevent overlapping runs:
    concurrency:
      group: sync-multisite-${{ github.ref }}
      cancel-in-progress: true

### Matrix Execution (optional)
- Convert the site loop to a job matrix reading from `.multisite/config.yaml` to isolate failures per brand and speed up runs.

### Verification/Gates
After pushing, verify brand CSS is deployed and contains expected tokens before reporting success:
    for repo in $CHILD_REPOS; do
      brand=${repo##*-}
      url="https://main--$repo--$OWNER.aem.page/styles/theme.css"
      echo "Checking $url"
      css=$(curl -fsSL "$url" || true)
      echo "$css" | grep -q ":root" || { echo "Missing :root in $url"; exit 1; }
      # Optional: assert specific tokens
      # echo "$css" | grep -q "--text-color:" || { echo "Missing --text-color in $url"; exit 1; }
    done

With these steps, an agent can initialize secrets, validate configuration, run the sync, and verify brand deployments end-to-end.


