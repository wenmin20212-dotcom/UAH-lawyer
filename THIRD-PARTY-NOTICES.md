# Third-party and runtime provenance

- Goose/UAH desktop runtime and backend: inherited pure UAH Native baseline. Baseline source commit: `26e5c009f224169493c4a61a1d9f61d6ed5331a9`; backend reports `1.52.0`. Upstream Goose project: https://github.com/block/goose . Apache-2.0 license retained as LICENSE-Goose.
- Electron/Chromium: binary runtime includes LICENSE and LICENSES.chromium.html in app/BOSS-win32-x64. Retain those files when redistributing.
- Node.js distribution: v24.21.0 with npm 11.19.0; bundled runtime/LICENSE and dependency license files retained.
- This repository's bootstrap is derived from the standalone UAH child bootstrap and modified for lawyer-specific installed/portable profile separation, fresh per-machine instance identity and a startup marker.
- @electron/asar and yaml are build/runtime JavaScript dependencies. Their original licenses are included in their distributions and recorded by package-lock.json.

No mother-controller code or business records are required to install or run this product. The native host is consumed as a pinned published binary; this repository does not claim to contain the complete modified native host source tree.
