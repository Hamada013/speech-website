# Standalone repositories

The tools (`Hamada013/tools`) and VB-MAPP (`Hamada013/vb-mapp`) each live in their own repository, and future major apps should too. Links only go one way: this website links to every standalone repository, and they must never link to or depend on this website. Add a card with the full address in `scripts/site-pages.cjs` for each new one. When an app moves out, add its old address to `scripts/retired-addresses.cjs`.

# App home screens

Use `tools/VSS/taffaha` from the `tools` repository as the default visual reference for new app home screens and home-screen redesigns, unless the user requests another style. Follow [docs/app-home-style.md](docs/app-home-style.md). Preserve each app's branding, available activities, and behavior.

Use Taffaha as the visual and interaction reference for activity-screen work too: calm white cards, compact icon controls, short flows, and minimal routine instructional text. Preserve accessibility labels and error feedback.

Style dropdowns and option menus to match the app whenever adding or changing them. Use rounded white triggers, a clear chevron, a rounded white option list, and a soft green selected row with a check. Do not leave browser-default dropdown buttons or menus. Preserve labels, keyboard navigation, focus, outside dismissal, and form values. See the dropdown guidance in `docs/app-home-style.md`.
