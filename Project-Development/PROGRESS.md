# Progress Log

## 2026-04-22 22:30 — Phase 1: CSS theming foundation
- Added semantic theme tokens (bg, surface, text, border, shadow, overlay, header) in :root with a `[data-theme="dark"]` override block using the planned palette.
- Converted hardcoded colors across homepage, waiting room, multiplayer, game, popup, and header sections to use the new tokens; accent color literals (#ffffff on buttons) kept intentional.
- Added a gentle transition on body/section backgrounds and text for smooth theme switches.
- Files: m8lset.css
- Decisions: kept existing legacy tokens (--color-blue1/2/3, --color-whitefaded) and redefined them under [data-theme="dark"] so existing rules that reference them theme correctly without a sweeping refactor. The file has significant rule duplication (later sections re-declare earlier rules) — I left the duplication in place and used replace_all so both copies stay in sync.
- Next: Phase 2 — hamburger button + menu panel CSS.
