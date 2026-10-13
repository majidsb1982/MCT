# Instructions for AI code review and changes in MCT

## Product and language
- MCT is a Persian, RTL-first class/group attendance and follow-up web app.
- Keep Persian text readable, natural, and correctly encoded as UTF-8.
- Preserve mobile usability, keyboard access, and accessible labels.
- Avoid horizontal overflow, oversized controls, accidental zoom/scale behavior, and cluttered dialogs.

## Architecture
- The app is a static/offline-capable web app; do not add a backend requirement.
- Main entry: index.html.
- Core/store/modal helpers: js/core.js.
- Page rendering: js/pages.js.
- Feature workflows: js/features.js.
- Bootstrap, routing, roles and app-level actions: js/app.js.
- Styles: css/app.css.
- Service worker/offline cache: sw.js.
- Keep asset cache-busting versions in index.html and sw.js synchronized.

## Change safety
- Before changing a workflow, trace its callers, permission checks, persistence and render path.
- Do not create duplicate buttons, duplicate IDs, parallel implementations, or inline help text that should be hidden behind a help control.
- Do not break existing localStorage data or change its schema without a migration.
- Keep user data out of logs, screenshots, and test artifacts.
- Prefer focused changes and add regression tests for fixes.
- Run JavaScript syntax/static validation and Playwright desktop/mobile checks.
- Do not claim a visual or workflow behavior passed unless an automated test or manual browser inspection verifies it.
