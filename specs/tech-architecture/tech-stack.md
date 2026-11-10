# MCT Technical Stack & Architecture

## Tech Stack
- **Frontend Runtime:** Vanilla JavaScript (ES6+), HTML5, CSS3 (No framework build step, modular script loading).
- **Storage:** Browser `localStorage` (`mct:data`) with automated JSON schema migration and backup/recovery support.
- **PWA / Offline:** Service Worker (`sw.js`), Web Manifest (`manifest.webmanifest`), offline caching.
- **UI / Styling:** Custom CSS (`css/app.css`) supporting responsive layout, dark mode, and Vazirmatn font.

## Concurrency & State Management
- **State Model:** Synchronous client-side single-object state store (`Store`) with in-memory caching and immediate persistence.
- **Concurrency Model:** Single-threaded browser JavaScript execution context. All mutations to `Store` are synchronous within event callbacks, eliminating multi-threaded race conditions.
- **Undo Stack:** Maintains an `undoStack` array in state for lightweight action rollbacks.
