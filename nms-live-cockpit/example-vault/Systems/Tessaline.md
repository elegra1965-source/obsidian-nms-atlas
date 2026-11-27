---
cssclasses: nms-system
type: system
star: green
race: "Gek"
tags:
  - system
  - atlas
---
```dataviewjs
const home = dv.page("00 Home"), me = dv.current(), esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");
const worlds = me.file.outlinks.filter(l => dv.page(l.path)?.file.folder.startsWith("Planets")).length;
const lanes = new Set(me.file.outlinks.map(l => l.path).filter(p => dv.pages('"Systems"').some(s => s.file.path === p))).size;
const here = String(home?.system ?? "") === me.file.name;
dv.container.innerHTML = `<div class="nms-ck nms-hud"><div class="ck-over"><span><span class="ck-dot"></span>System <b>${esc(me.file.name)}</b></span><span>${here ? "You are here" : "Charted"}</span><span>Worlds <b>${worlds}</b></span><span>Lanes <b>${lanes}</b></span><span>Ship <b>${esc(home?.ship ?? "none")}</b></span><span><a class="internal-link" data-href="00 Home" href="00 Home">Back to cockpit</a></span></div></div>`;
```
> [!info] System survey
> **Star class:** green · **Dominant race:** Gek
> The garden system. Everything here wants to be photographed.

## Worlds
- [[Tessaline IV Mossgarden]]
- [[Tessaline II Thornwake]]

## Lane links
- Jump route to [[Kethra Prime]]
- Jump route to [[Orovane]]

## Notes
Part of the [[Eltiensleen Survey]]. Logged in the [[Resource Ledger]].

## To do
- [ ] Photograph Mossgarden fauna
