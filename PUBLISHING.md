# Publishing "No Man's Sky — Atlas" to the Obsidian community themes

The theme is fully self-contained: `theme.css` has the font and galaxy image embedded as base64, so the only two files that *must* ship are `theme.css` and `manifest.json`.

## 1. Make a GitHub repo

Create a public repo (e.g. `obsidian-nms-atlas`) with these at the **root**:

```
theme.css            (required)
manifest.json        (required)
README.md            (required for the store listing)
LICENSE              (required — MIT included here)
screenshot.png       (required — see below)
```

Optional extras you can keep in the repo: `nms-glyph-translate/`, `nms-discovery-toast/`, `NMS_DESIGN_SYSTEM.md`. The `.gitignore` already excludes `.obsidian/`.

## 2. Add a screenshot

Obsidian requires a theme screenshot named `screenshot.png` (or `.jpg`) at the repo root, ideally ~1000–1500px wide showing a real note. Take it from your vault (a note in dark mode with the galaxy + glyph title looks best). Reference it at the top of `README.md`.

## 3. Tag a release

The community list installs by version. Either:
- create a GitHub **release** whose tag matches `manifest.json` `version` (currently `1.2.0`), or
- just push to `main` (Obsidian reads `manifest.json` from the default branch).

Make sure `manifest.json` `authorUrl` points at your GitHub profile or the repo.

## 4. Submit to the community list

1. Fork `obsidianmd/obsidian-releases`.
2. Edit `community-css-themes.json` and append an entry:

```json
{
  "name": "No Man's Sky — Atlas",
  "author": "Tony",
  "repo": "<your-github-username>/obsidian-nms-atlas",
  "screenshot": "screenshot.png",
  "modes": ["dark", "light"]
}
```

3. Open a pull request. The Obsidian bot runs automated checks (valid manifest, screenshot present, theme.css loads). Fix anything it flags, then a maintainer reviews and merges.
4. Once merged, it appears in **Settings → Appearance → Themes → Manage** for everyone.

## 5. Before you submit — quick checklist

- [ ] `manifest.json` name matches the repo listing name exactly
- [ ] `version` is set and (if you tag a release) matches the tag
- [ ] `screenshot.png` at repo root
- [ ] `LICENSE` present
- [ ] Theme loads cleanly on a fresh vault with no errors in the console
- [ ] (Recommended) note in the README that **Style Settings** is an optional companion plugin that unlocks the control panel
- [ ] Decide on the bundled NMS font/image — for a public release you may want to swap in assets you own the rights to (see LICENSE note)
