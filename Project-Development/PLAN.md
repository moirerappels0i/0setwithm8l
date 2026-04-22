# Plan: theme-toggle-menu

## Goal
Add a fixed hamburger menu button to all pages that opens a panel containing a light/dark mode toggle switch. The chosen theme persists via `localStorage` across page loads and navigation.

## Approach
- Add CSS custom properties for both light and dark themes to `m8lset.css`, switching via a `data-theme="dark"` attribute on `<body>`
- Build a shared hamburger menu component (HTML snippet + CSS in `m8lset.css` + JS in `m8lset.js`) that gets injected into every page on load
- Toggle switch inside the menu flips the theme and saves to `localStorage`
- On every page load, read `localStorage` and apply the stored theme before paint (no flash)

**Dark mode palette:**
| Token | Value |
|---|---|
| Background | `#0f1117` |
| Surface (cards) | `#1c1f2e` |
| Text primary | `#e8eaf0` |
| Text muted | `#9aa0b8` |
| Primary accent | `#4da6ff` |
| Secondary accent | `#7ec8e3` |
| Success | `#2ecc71` |
| Danger | `#ff5c5c` |

## Phases

### Phase 1: CSS theming foundation
- Audit all existing color usages and convert to `var(--*)` tokens
- Add `[data-theme="dark"]` CSS variable overrides to `m8lset.css`

### Phase 2: Hamburger menu component
- Add hamburger button + menu panel HTML/CSS (fixed top-right, z-index above everything)
- Style the toggle switch (pill-style, animated)
- Add open/close animation for the menu panel

### Phase 3: JavaScript logic
- Add `ThemeManager` to `m8lset.js`: reads `localStorage` on load, injects menu HTML, wires toggle switch
- Anti-flash inline `<script>` in `<head>` of each HTML file

### Phase 4: Wire up all pages
- Add anti-flash script to `index.html`, `playm8lset.html`, `m8lwithfriends.html`, `waitingroom.html`
- Verify hamburger menu renders and theme toggles on all pages

## Out of scope
- System-preference (`prefers-color-scheme`) auto-detection
- Additional menu items beyond the theme toggle
- Any backend or build tooling changes
