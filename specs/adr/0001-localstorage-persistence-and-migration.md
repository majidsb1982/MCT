# Offline LocalStorage Persistence & Schema Migration

## Context
MCT is an offline-first PWA running entirely in the browser without a remote backend database.

## Decision
We store all application state in browser `localStorage` under a single key (`mct:data`), managed via a versioned schema migration runner (`Store` in `js/core.js`).

## Consequences
- **Positive:** Zero latency, fully offline-capable, extremely simple export/import backup format.
- **Negative / Trade-off:** Storage quota limits (~5-10MB), vulnerability to browser data clearing unless exported regularly, and lack of multi-device real-time sync.
