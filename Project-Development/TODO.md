## Phase 1: CSS theming foundation
- [x] Audit existing CSS colors and ensure all use var(--*) tokens
- [x] Add dark mode CSS variable overrides under [data-theme="dark"]

## Phase 2: Hamburger menu component
- [x] Add hamburger button + menu panel CSS (fixed top-right, z-index, open/close animation)
- [x] Add toggle switch CSS (pill-style, animated)

## Phase 3: JavaScript logic
- [x] Add ThemeManager to m8lset.js (localStorage read/write, menu injection, toggle wiring)

## Phase 4: Wire up all pages
- [x] Add anti-flash inline script to index.html head
- [x] Add anti-flash inline script + menu script to playm8lset.html
- [x] Add anti-flash inline script + menu script to m8lwithfriends.html
- [x] Add anti-flash inline script + menu script to waitingroom.html
