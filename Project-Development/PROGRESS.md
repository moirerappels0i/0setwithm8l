# Progress Log

## 2026-04-22 22:30 — Phase 1: CSS theming foundation
- Added semantic theme tokens (bg, surface, text, border, shadow, overlay, header) in :root with a `[data-theme="dark"]` override block using the planned palette.
- Converted hardcoded colors across homepage, waiting room, multiplayer, game, popup, and header sections to use the new tokens; accent color literals (#ffffff on buttons) kept intentional.
- Added a gentle transition on body/section backgrounds and text for smooth theme switches.
- Files: m8lset.css
- Decisions: kept existing legacy tokens (--color-blue1/2/3, --color-whitefaded) and redefined them under [data-theme="dark"] so existing rules that reference them theme correctly without a sweeping refactor. The file has significant rule duplication (later sections re-declare earlier rules) — I left the duplication in place and used replace_all so both copies stay in sync.
- Next: Phase 2 — hamburger button + menu panel CSS.

## 2026-04-22 22:45 — Phase 2: Hamburger menu component
- Appended fixed-position hamburger button (top-right, z-index 1100) with a CSS-only bars→X morph keyed off aria-expanded, plus a drop-down menu panel that transitions opacity/transform on data-open.
- Built a pill-style toggle switch (visually-hidden checkbox + styled track/thumb) that picks up the current --color-primary accent for the on state.
- Added a small-screen media query so button/panel shrink and panel spans the width on ≤480px.
- Also added an explicit `color: var(--color-text)` on `.btn` so header buttons remain legible in dark mode (buttons don't inherit color by default).
- Files: m8lset.css
- Next: Phase 3 — ThemeManager JS.

## 2026-04-22 22:50 — Phase 3: ThemeManager
- Added a ThemeManager module to m8lset.js: reads/writes localStorage key `m8lset-theme`, applies `data-theme="dark"` to `<html>` (so the anti-flash head script and runtime code target the same element), injects the menu button + panel into document.body, wires the checkbox to toggle, and handles click-outside + Escape close.
- Menu markup is created programmatically (no per-page HTML edits needed).
- Files: m8lset.js
- Decisions: used `document.documentElement` rather than `<body>` for the data-theme attribute so the anti-flash inline script works before body parses; CSS selector `[data-theme="dark"]` matches either element.
- Next: Phase 4 — anti-flash scripts in all four HTML heads.

## 2026-04-22 22:55 — Phase 4: Wire up all pages
- Added the same anti-flash IIFE to the `<head>` of index.html, playm8lset.html, m8lwithfriends.html, and waitingroom.html. It reads `localStorage['m8lset-theme']` and applies `data-theme="dark"` to the documentElement before first paint.
- All four pages already load m8lset.js, so the hamburger/menu gets injected automatically once the body parses.
- Files: index.html, playm8lset.html, m8lwithfriends.html, waitingroom.html
- Next: Phase 4 complete — all TODOs done, awaiting user review.
