# No Man's Sky — Atlas · Theme Ideas & To-Do

Backlog of immersion ideas for the Obsidian theme. Guiding principle: **glyphs and heavy effects go on the chrome (titles, labels, splash, UI), never on the note body you actually read and write in.**

---

## Shipped (v1.2)

- [x] Deep-space cyan & gold HUD theme (dark + "Daylight Scanner" light mode)
- [x] Orbitron / Rajdhani typography, accent glow, HUD grid, optional scanlines + vignette
- [x] Accent switcher (cyan / gold / Atlas red / green / violet), rainbow biome folders
- [x] **Galaxy nebula background** behind the workspace (embedded image, opt-out + dimming via Style Settings)
- [x] **Korvax glyph font** — your real `nms-alphabet.ttf` on note titles, reading-view headings, callout titles & tags; **hover to translate to English**. Body text stays English/editable.
- [x] **Seamless / transparent window** — editor, sidebars and bars are fully transparent so the galaxy flows edge-to-edge (no panel "sharp edges"), with one even dimming layer + text shadow for readability.
- [x] **"Atlas Interface" boot splash** — scanner ring + "ESTABLISHING LINK" fades in/out on vault open (safe-hidden if reduced-motion is on; never blocks clicks).
- [x] **Hex corner-brackets** on the active editor note (cyan L-brackets, top-left + bottom-right).
- [x] **Status bar HUD markers** — gold `▸` markers on status-bar items.
- [x] **Interaction-prompt link hover** — links glow gold on hover.
- [x] **Title scan-in reveal** — the note title sweeps in left-to-right on open.
- [x] **HUD-styled toasts** — all Obsidian notices get the cyan/gold console frame.
- [x] **Galaxy backdrops** — recolor the nebula (Atlas Purple / Toxic Green / Scorched Red / Frozen Cyan / Irradiated Gold) via Style Settings.
- [x] **NMS callout set** — `[!atlas]`, `[!sentinel]`, `[!korvax]`, `[!vykeen]`, `[!gek]`, `[!traveller]`, `[!anomaly]`, `[!scan]`.
- [x] **Scanner checkboxes**, **HUD code blocks + table headers**.
- [x] **Focus / writing mode** — calms the galaxy + reverts glyphs to English (Style Settings toggle).
- [x] **Full Style Settings control panel** — 28 controls: accent, glyph/immersion, backdrop, focus, boot/brackets, atmosphere, layout, typography. (Style Settings plugin installed + enabled in the vault.)
- [x] **Publish package** — README, LICENSE (MIT), PUBLISHING.md, version 1.2.0, self-contained `theme.css`, distributable zip.

## Ready to enable (needs a plugin toggle)

- [~] **Discovery-style toasts** — "◆ ENTRY REGISTERED — <note>" on create, "◆ DATA SYNCED" on save.
  - Shipped as a tiny plugin in `nms-discovery-toast/` (manifest.json + main.js). CSS can't hook save/create events, so this is a 2-file community plugin.
  - **To enable:** copy the `nms-discovery-toast` folder into `<vault>/.obsidian/plugins/`, then Settings → Community plugins → enable "NMS Discovery Toast". (Toasts inherit the HUD styling above.)

## Reusable across your other projects

- [x] **`nms-glyph-translate/`** — drop-in glyph-on-hover-translate component (CSS + JS + standalone demo) for the netlify apps. Scramble cycles through the real NMS alphabet.

## Future / nice-to-have

- [ ] **Add a real `screenshot.png`** to the repo root (required for community-store submission) — take it from a note in dark mode.
- [ ] **Typewriter-per-letter** title option (current reveal is a smooth scan-in; true per-letter typing needs JS).
- [ ] **Discovery "scan" sound** on note open (needs a plugin; optional).
- [ ] **Swap bundled NMS font/image for owned assets** before a public release if you want to avoid third-party rights questions.

---

## Notes / decisions

- Fine for the showcase apps (nms-theme-pack, nms-weather-app, nms-command-network, nms-atlas-interface-ai). For the daily-driver vault the only real risk is content legibility — handled by keeping body text English + the dimming layer.
- Boot splash, toasts and save-hooks need JS/event hooks; everything else is pure theme CSS.
- Glyph default is currently glyphs-with-hover; flip to English-first via the Style Settings "Disable alien glyph headings" toggle (or ask and I'll change the default).
