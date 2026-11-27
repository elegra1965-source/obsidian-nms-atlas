---
cssclasses: nms-cockpit
type: dashboard
tags:
  - atlas
  - dashboard
ship: Lantern
system: Orovane
expedition: Eltiensleen Survey
goal: 36
inbox-capacity: 20
backlog-capacity: 20
---
```dataviewjs
const fm = dv.current();
const num = (v, d) => (Number.isFinite(Number(v)) && v !== null && v !== undefined && v !== "") ? Number(v) : d;
const goal = num(fm.goal, 100), inCap = num(fm["inbox-capacity"], 20), bkCap = num(fm["backlog-capacity"], 20);
const curName = String(fm.system ?? ""), shipName = String(fm.ship ?? ""), expName = String(fm.expedition ?? "");
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const lnk = (path, text) => `<a class="internal-link" data-href="${esc(path)}" href="${esc(path)}">${esc(text)}</a>`;
const bare = v => String(v?.path ?? v ?? "").replace(/[\[\]]/g, "").split("/").pop().replace(/\.md$/, "");

// ---- read the vault ----
const pages = dv.pages('""').array();
const notes = pages.length;
const links = pages.reduce((n, p) => n + p.file.outlinks.length, 0);
const linked = pages.filter(p => p.file.outlinks.length + p.file.inlinks.length > 0).length;
const health = notes ? linked / notes : 0;
const systems = dv.pages('"Systems"').array().sort((a, b) => a.file.name.localeCompare(b.file.name));
const planets = dv.pages('"Planets"').array();
const worldsOf = n => planets.filter(p => p.system && bare(p.system) === n).length;
const openTasks = dv.pages('-"Expeditions"').file.tasks.where(t => !t.completed).length;
const inbox = dv.pages('"Inbox"').length, backlog = dv.pages('"Backlog"').length;
const ex = expName ? dv.page(expName) : null;
const tgt = t => (t.text.match(/\[\[([^\]|#]+)/) || [])[1] || t.text;
const route = ex ? ex.file.tasks.array().filter(t => systems.some(s => s.file.name === tgt(t))) : [];
const done = route.filter(t => t.completed).length, total = route.length;
const pct = total ? Math.round(done / total * 100) : 0;
const nextIdx = route.findIndex(t => !t.completed);
const nextName = nextIdx >= 0 ? tgt(route[nextIdx]) : "";
const charted = systems.reduce((n, s) => n + Math.min(3, worldsOf(s.file.name)), 0);
const chartedPct = systems.length ? Math.min(1, charted / (systems.length * 3)) : 0;
const cur = systems.find(s => s.file.name === curName);
const lanes = cur ? new Set(cur.file.outlinks.map(l => l.path).filter(p => systems.some(s => s.file.path === p))).size : 0;
const ratio = goal ? notes / goal : 0;
const tier = ratio >= 1 ? "gold" : ratio >= 0.5 ? "silver" : "bronze";
const tierShip = { bronze: "Shuttle", silver: "Fighter", gold: "Exotic" }[tier];
const tierN = { bronze: 1, silver: 2, gold: 3 }[tier];
const hp = Math.round(health * 100);
const shieldWord = health >= 0.6 ? "Nominal" : health >= 0.35 ? "Charging" : "Low";

// ---- rotating star chart + dome (one shared angle) ----
const mk = [[60,-1.0,62],[70,0.9,48],[86,2.2,30],[48,-2.4,36],[26,0.3,86],[40,1.6,55]];
const shown = systems.slice(0, mk.length);
const nextOf = s => s.file.name === nextName, curOf = s => s.file.name === curName;
const nodes = shown.map((s, i) => `<circle class="ck-nd${nextOf(s) ? " next" : curOf(s) ? " cur" : ""}" cx="640" cy="330" r="${nextOf(s) || curOf(s) ? 7 : 6}"${nextOf(s) ? ' stroke="#e8b84a"' : ""}/>`).join("");
const labels = shown.map((s, i) => {
  const w = worldsOf(s.file.name), small = nextOf(s) ? "Next jump" : curOf(s) ? "You are here" : `${w} ${w === 1 ? "world" : "worlds"}`;
  return `<a class="internal-link ck-lab${nextOf(s) ? " g" : ""}${nextOf(s) || curOf(s) ? "" : " q"} ck-cyc" data-href="${esc(s.file.path)}" href="${esc(s.file.path)}">${esc(s.file.name)}<small>${small}</small></a>`;
}).join("");
const more = systems.length > mk.length ? `<div class="ck-k" style="position:absolute;right:3%;bottom:4%">+${systems.length - mk.length} more systems</div>` : "";
const dms = shown.map(s => `<g class="ck-dm"><line stroke="#ff9a3c" stroke-opacity=".7"/><circle r="2" fill="#ff9a3c"/><path fill="${curOf(s) ? "#38d9f5" : nextOf(s) ? "#e8b84a" : "#5a7f8a"}" stroke="${curOf(s) ? "#7df3ff" : nextOf(s) ? "#fff0c0" : "#9fc3cc"}" stroke-opacity=".85" class="ck-mk"/></g>`).join("");
const baseRings = [100, 78, 56, 34].map(r => `<ellipse class="ck-br" data-r="${r}" cx="150" cy="178" rx="${r}" ry="${(r * 0.26).toFixed(1)}" stroke="#ff8a2a" stroke-opacity="${(0.25 + 0.15 * (100 - r) / 66).toFixed(2)}" fill="none"/>`).join("");
const dome = `<svg class="ck-holo ck-radar ck-orange" viewBox="0 0 300 240"><defs><filter id="og" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><radialGradient id="ob" cx="50%" cy="72%" r="55%"><stop offset="0" stop-color="#ff8a2a" stop-opacity=".30"/><stop offset=".6" stop-color="#ff8a2a" stop-opacity=".08"/><stop offset="1" stop-color="#ff8a2a" stop-opacity="0"/></radialGradient></defs><ellipse cx="150" cy="190" rx="132" ry="40" fill="url(#ob)"/><path class="ck-limbf" d="M28 178A122 112 0 0 1 272 178Z" fill="url(#ob)"/><g filter="url(#og)" fill="none">${baseRings}<path class="ck-limb" d="M28 178A122 112 0 0 1 272 178" stroke="#ffb15c" stroke-width="1.6"/><path class="ck-eqb" d="M28 178A122 31.7 0 0 1 272 178" stroke="#ff8a2a" stroke-opacity=".35"/><path class="ck-eqf" d="M28 178A122 31.7 0 0 0 272 178" stroke="#ffb15c" stroke-width="1.8"/><path class="ck-merb" stroke="#ff8a2a" stroke-opacity=".35"/><path class="ck-merf" stroke="#ffb15c" stroke-width="1.4"/>${dms}</g><path d="M150 166L158 182L142 182Z" fill="#fff" filter="url(#og)"/><rect x="141" y="196" width="18" height="6" fill="#ff8a2a" opacity=".6"/></svg>`;

// ---- tiles ----
const cells = (n, k) => Array.from({ length: 12 }, (_, i) => `<u class="${i < Math.round(n * 12) ? "on" : ""}"></u>`).join("");
const trackParts = route.map((t, i) => {
  const cls = t.completed ? "d" : i === nextIdx ? "c" : "";
  const seg = i === 0 ? "" : `<b class="${t.completed ? "d" : i === nextIdx ? "" : "x"}"></b>`;
  return seg + `<i class="${cls}"></i>`;
}).join("");
const grid = Array.from({ length: 20 }, (_, i) => `<u class="${i < Math.min(20, Math.ceil(inCap ? inbox / inCap * 20 : 0)) ? "on" : ""}"></u>`).join("");
const eqSeed = [10,16,8,22,14,18,9,12,20,7], bk = bkCap ? Math.min(1, backlog / bkCap) : 0;
const eq = eqSeed.map(v => `<u style="height:${Math.max(3, Math.round(v * (0.25 + 0.75 * bk)))}px"></u>`).join("");
const pad = n => String(n).padStart(2, "0");
const hasCur = curName && cur;

const html = `<div class="nms-ck">
<div class="ck-over"><span><span class="ck-dot"></span>Atlas online<span class="ck-cur"></span></span><span>Ship <b>${esc(shipName || "none")}</b></span><span>System <b>${esc(curName || "none")}</b></span><span>Shield <b>${shieldWord}</b></span><span><span class="ck-dot g"></span>${openTasks} tasks open</span><span class="ck-calmbtn" role="button" tabindex="0" title="Stop all cockpit motion"></span></div>
<div class="ck-vp">
<svg class="ck-chart" viewBox="0 0 1280 512" preserveAspectRatio="xMidYMid meet"><g stroke="#38d9f5" stroke-opacity=".5" fill="none" stroke-width="1.2"><path class="ck-sp" d=""/></g><g fill="#04101a" stroke="#7df3ff" stroke-width="1.5"><circle cx="640" cy="330" r="9"/>${nodes}</g></svg>
${labels}${more}
<div class="ck-ring"><div class="ck-clip" style="--a:-56deg"></div><div class="ck-clip c" style="--a:-28deg"></div><div class="ck-clip" style="--a:0deg"></div><div class="ck-clip c" style="--a:28deg"></div><div class="ck-clip" style="--a:56deg"></div></div>
</div>
<div class="ck-con">
<div class="ck-scr ck-l1"><i class="ck-led o"></i><i class="ck-led g"></i><div class="ck-k ck-cyc">Location</div><div class="ck-compass"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="#38d9f5" stroke-opacity=".45"/><circle cx="50" cy="50" r="36" fill="none" stroke="#38d9f5" stroke-opacity=".2" stroke-dasharray="2 5"/><g class="ck-tk" stroke="#38d9f5" stroke-opacity=".7"><line x1="50" y1="6" x2="50" y2="16" transform="rotate(0 50 50)"/><line x1="50" y1="6" x2="50" y2="12" transform="rotate(10 50 50)"/><line x1="50" y1="6" x2="50" y2="12" transform="rotate(20 50 50)"/><line x1="50" y1="6" x2="50" y2="16" transform="rotate(30 50 50)"/><line x1="50" y1="6" x2="50" y2="12" transform="rotate(40 50 50)"/><line x1="50" y1="6" x2="50" y2="12" transform="rotate(50 50 50)"/><line x1="50" y1="6" x2="50" y2="16" transform="rotate(60 50 50)"/><line x1="50" y1="6" x2="50" y2="12" transform="rotate(70 50 50)"/><line x1="50" y1="6" x2="50" y2="12" transform="rotate(80 50 50)"/><line x1="50" y1="6" x2="50" y2="16" transform="rotate(90 50 50)"/><line x1="50" y1="6" x2="50" y2="12" transform="rotate(100 50 50)"/><line x1="50" y1="6" x2="50" y2="12" transform="rotate(110 50 50)"/><line x1="50" y1="6" x2="50" y2="16" transform="rotate(120 50 50)"/><line x1="50" y1="6" x2="50" y2="12" transform="rotate(130 50 50)"/><line x1="50" y1="6" x2="50" y2="12" transform="rotate(140 50 50)"/><line x1="50" y1="6" x2="50" y2="16" transform="rotate(150 50 50)"/><line x1="50" y1="6" x2="50" y2="12" transform="rotate(160 50 50)"/><line x1="50" y1="6" x2="50" y2="12" transform="rotate(170 50 50)"/><line x1="50" y1="6" x2="50" y2="16" transform="rotate(180 50 50)"/><line x1="50" y1="6" x2="50" y2="12" transform="rotate(190 50 50)"/><line x1="50" y1="6" x2="50" y2="12" transform="rotate(200 50 50)"/><line x1="50" y1="6" x2="50" y2="16" transform="rotate(210 50 50)"/><line x1="50" y1="6" x2="50" y2="12" transform="rotate(220 50 50)"/><line x1="50" y1="6" x2="50" y2="12" transform="rotate(230 50 50)"/><line x1="50" y1="6" x2="50" y2="16" transform="rotate(240 50 50)"/><line x1="50" y1="6" x2="50" y2="12" transform="rotate(250 50 50)"/><line x1="50" y1="6" x2="50" y2="12" transform="rotate(260 50 50)"/><line x1="50" y1="6" x2="50" y2="16" transform="rotate(270 50 50)"/><line x1="50" y1="6" x2="50" y2="12" transform="rotate(280 50 50)"/><line x1="50" y1="6" x2="50" y2="12" transform="rotate(290 50 50)"/><line x1="50" y1="6" x2="50" y2="16" transform="rotate(300 50 50)"/><line x1="50" y1="6" x2="50" y2="12" transform="rotate(310 50 50)"/><line x1="50" y1="6" x2="50" y2="12" transform="rotate(320 50 50)"/><line x1="50" y1="6" x2="50" y2="16" transform="rotate(330 50 50)"/><line x1="50" y1="6" x2="50" y2="12" transform="rotate(340 50 50)"/><line x1="50" y1="6" x2="50" y2="12" transform="rotate(350 50 50)"/></g><g class="ck-need"><path d="M50 16L55 50L50 44L45 50Z" fill="#e8b84a"/><path d="M50 84L45 50L50 56L55 50Z" fill="#38d9f5" fill-opacity=".5"/></g><circle cx="50" cy="50" r="3" fill="#fff"/></svg></div><div class="ck-nm">${hasCur ? lnk(cur.file.path, curName) : "Not set"}</div><div class="ck-route"><span class="n on"></span><span class="l"></span><span class="n nx"></span></div><div class="ck-k ck-cyc" style="margin-top:6px">Next jump · ${lanes} ${lanes === 1 ? "lane" : "lanes"}</div><div class="ck-nm" style="font-size:14px">${nextName ? esc(nextName) : "None planned"}</div></div>
<div class="ck-scr ck-l2"><i class="ck-led o"></i><div><span class="ck-chev">&gt;&gt;&gt;</span><span class="ck-big">${pct}%</span></div><div class="ck-k ck-cyc" style="margin-top:8px">${ex ? lnk(ex.file.path, "Expedition") : "No expedition"}</div><div class="ck-track">${trackParts}</div><div class="ck-cells">${cells(pct / 100)}</div><div class="ck-cells b">${cells(chartedPct)}</div><div class="ck-k" style="margin-top:8px">${done} / ${total} systems</div></div>
<div class="ck-mid">${dome}<div class="ck-mt"><div class="ck-d ck-cyc" style="font-size:11px;color:#7df3ff"><a class="ck-open" data-path="Atlas Star Chart.canvas">Atlas star chart</a></div><div class="ck-cnt"><div><div class="ck-big">${notes}</div><div class="ck-k">Notes</div></div><div><div class="ck-big">${links}</div><div class="ck-k">Links</div></div><div><div class="ck-big">${pad(systems.length)}</div><div class="ck-k">Systems</div></div></div></div></div>
<div class="ck-scr ck-r2" data-go="${esc(ex ? ex.file.path : "")}"><i class="ck-led g"></i><div class="ck-k ck-cyc">${esc(shipName || "No ship")}</div><div class="ck-shield t-${tier}${health < 0.35 ? " low" : ""}"><i class="ck-sh2"></i><i class="ck-sh1"></i><b class="ck-ship"></b><s class="ck-scan"></s></div><div class="ck-k">Shield · vault health</div><div class="ck-bar"><i style="width:${hp}%"></i></div><div class="ck-big" style="font-size:18px;margin-top:6px">${hp}%</div><div class="ck-tier t-${tier}"><span>${notes} / ${goal} notes</span><span class="ck-pips">${[1,2,3].map(n => `<u class="${n <= tierN ? "on" : ""}"></u>`).join("")}</span><span class="ck-chip">${tierShip}</span></div></div>
<div class="ck-scr ck-r1" data-go="Inbox"><i class="ck-led r"></i><div class="ck-k ck-cyc">${inbox ? lnk("Inbox", "Inbox") : "Inbox"}</div><div class="ck-hr" style="margin-top:6px"><span class="ck-big">${inbox}</span><span class="ck-k">/ ${inCap}</span></div><div class="ck-grid">${grid}</div><div class="ck-k" style="margin-top:8px">Backlog · ${backlog}</div><div class="ck-eq">${eq}</div><div class="ck-k" style="margin-top:8px"><i class="ck-led g" style="position:static;display:inline-block;margin-right:6px"></i>Open tasks ${openTasks}</div></div>
</div>
<div class="ck-scanbar"></div>
</div>`;
dv.container.innerHTML = html;

// ---- rotation + tilt (drag), scan bar that flips the words as it passes ----
const root = dv.container, nms = root.querySelector(".nms-ck"), vp = root.querySelector(".ck-vp"), mid = root.querySelector(".ck-mid");
const ndEl = [...root.querySelectorAll(".ck-nd")], labEl = [...root.querySelectorAll(".ck-lab")], dmEl = [...root.querySelectorAll(".ck-dm")];
const spEl = root.querySelector(".ck-sp"), merf = root.querySelector(".ck-merf"), merb = root.querySelector(".ck-merb");
const brEl = [...root.querySelectorAll(".ck-br")], eqb = root.querySelector(".ck-eqb"), eqf = root.querySelector(".ck-eqf"), limb = root.querySelector(".ck-limb"), limbf = root.querySelector(".ck-limbf");
const bar = root.querySelector(".ck-scanbar"), words = [...root.querySelectorAll(".ck-cyc")];
root.querySelectorAll(".ck-scr[data-go]").forEach(t => { if (!t.dataset.go) return; t.classList.add("go"); t.addEventListener("click", e => { if (e.target.closest("a")) return; app.workspace.openLinkText(t.dataset.go, "", false); }); });
root.querySelectorAll(".ck-open").forEach(a => a.addEventListener("click", e => { e.preventDefault(); app.workspace.openLinkText(a.dataset.path, "", false); }));
const calmBtn = root.querySelector(".ck-calmbtn");
if (calmBtn) {
  const CK = "nms-ck-calm", setCalm = on => { document.body.classList.toggle("nms-calm", on); calmBtn.textContent = on ? "Calm: on" : "Calm: off"; calmBtn.classList.toggle("on", on); };
  let saved = false; try { saved = app.loadLocalStorage(CK) === "1"; } catch (e) {}
  if (saved) setCalm(true); else setCalm(document.body.classList.contains("nms-calm"));
  const flipCalm = () => { const on = !document.body.classList.contains("nms-calm"); setCalm(on); try { app.saveLocalStorage(CK, on ? "1" : "0"); } catch (e) {} };
  calmBtn.addEventListener("click", flipCalm);
  calmBtn.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flipCalm(); } });
}
const hitEl = ndEl.map((n, i) => { const sys = shown[i]; if (!sys) return null; const h = document.createElementNS("http://www.w3.org/2000/svg", "circle"); h.setAttribute("class", "ck-hit"); h.setAttribute("r", "30"); h.setAttribute("fill", "transparent"); h.setAttribute("aria-label", sys.file.name); n.after(h);
  h.addEventListener("mouseenter", () => n.classList.add("hot")); h.addEventListener("mouseleave", () => n.classList.remove("hot"));
  h.addEventListener("click", e => { e.stopPropagation(); app.workspace.openLinkText(sys.file.path, "", false); }); return h; });
const Rx = 400, DR = 122, DV = 112, RC = [640, 560], RMX = 420, RMY = 450;
let theta = 0, alpha = 0.26;
function draw() {
  const ty = Math.sin(alpha), cz = Math.cos(alpha);
  let sp = "";
  const pos = [];
  shown.forEach((s, i) => {
    const [r, a0, h] = mk[i], a = a0 + theta, sn = Math.sin(a), cs = Math.cos(a), f = r / 90;
    let x = 640 + f * Rx * sn, y = 330 + f * Rx * cs * ty * 1.4;
    const ddx = x - RC[0], ddy = y - RC[1], dd = Math.hypot(ddx / RMX, ddy / RMY);
    if (dd > 1) { x = RC[0] + ddx / dd; y = RC[1] + ddy / dd; } if (y > 392) y = 392;
    const depth = (cs + 1) / 2;
    sp += `M640 330L${x.toFixed(1)} ${y.toFixed(1)}`;
    ndEl[i].setAttribute("cx", x.toFixed(1)); ndEl[i].setAttribute("cy", y.toFixed(1)); if (hitEl[i]) { hitEl[i].setAttribute("cx", x.toFixed(1)); hitEl[i].setAttribute("cy", y.toFixed(1)); } ndEl[i].style.opacity = (0.45 + 0.55 * depth).toFixed(2);
    pos[i] = { x, y, right: x > 640 };
    const dx = 150 + r * sn, dy = 178 + ty * r * cs, q = 5, g = dmEl[i], ch = g.children, top = dy - h * cz;
    ch[0].setAttribute("x1", dx.toFixed(1)); ch[0].setAttribute("y1", dy.toFixed(1)); ch[0].setAttribute("x2", dx.toFixed(1)); ch[0].setAttribute("y2", top.toFixed(1));
    ch[1].setAttribute("cx", dx.toFixed(1)); ch[1].setAttribute("cy", dy.toFixed(1));
    ch[2].setAttribute("d", `M${dx.toFixed(1)} ${(top-q).toFixed(1)}L${(dx+q).toFixed(1)} ${top.toFixed(1)}L${dx.toFixed(1)} ${(top+q).toFixed(1)}L${(dx-q).toFixed(1)} ${top.toFixed(1)}Z`);
    g.style.opacity = (0.5 + 0.5 * depth).toFixed(2);
  });
  const place = side => {
    const g = pos.map((q, i) => ({ q, i })).filter(o => o.q.right === side).sort((a, b) => a.q.y - b.q.y);
    const CAP = 74, gaps = [], tops = [];
    let prevT = -99, prevKey = false;
    g.forEach(({ q, i }, n) => {
      const key = labEl[i].classList.contains("g") || !labEl[i].classList.contains("q"), gap = key || prevKey ? 7.2 : 4.4;
      let top = q.y / 5.12 - 2.2; if (top < prevT + gap) top = prevT + gap;
      tops[n] = top; gaps[n] = gap; prevT = top; prevKey = key;
    });
    for (let n = tops.length - 1; n >= 0; n--) { const lim = n === tops.length - 1 ? CAP : tops[n + 1] - gaps[n + 1]; if (tops[n] > lim) tops[n] = lim; }
    g.forEach(({ q, i }, n) => {
      const lb = labEl[i], dep = (Math.cos(theta + mk[i][1]) + 1) / 2;
      lb.style.top = tops[n].toFixed(1) + "%"; lb.style.opacity = (0.5 + 0.5 * dep).toFixed(2);
      if (side) { lb.style.left = "auto"; lb.style.right = (100 - q.x / 12.8 + 1.6).toFixed(1) + "%"; lb.style.textAlign = "right"; }
      else { lb.style.right = "auto"; lb.style.left = (q.x / 12.8 + 1.6).toFixed(1) + "%"; lb.style.textAlign = "left"; }
    });
  };
  place(true); place(false);
  { // labels from the two sides can meet in the middle: nudge the lower one down until they clear
    const vh = vp.clientHeight, bx = labEl.filter(l => l.offsetParent).map(l => ({ l, x: l.offsetLeft, w: l.offsetWidth, h: l.offsetHeight, t: parseFloat(l.style.top) / 100 * vh })).sort((u, v) => u.t - v.t);
    bx.forEach((m, i) => { for (let k = 0; k < i; k++) { const o = bx[k]; if (m.x < o.x + o.w + 4 && o.x < m.x + m.w + 4 && m.t < o.t + o.h + 3 && o.t < m.t + m.h + 3) m.t = o.t + o.h + 3; } m.l.style.top = (m.t / vh * 100).toFixed(1) + "%"; });
  }
  spEl.setAttribute("d", sp);
  brEl.forEach(e => e.setAttribute("ry", (e.dataset.r * ty).toFixed(1)));
  const ry = (DR * ty).toFixed(1), lr = Math.hypot(DV * cz, DR * ty).toFixed(1);
  eqb.setAttribute("d", `M28 178A122 ${ry} 0 0 1 272 178`); eqf.setAttribute("d", `M28 178A122 ${ry} 0 0 0 272 178`);
  limb.setAttribute("d", `M28 178A122 ${lr} 0 0 1 272 178`); limbf.setAttribute("d", `M28 178A122 ${lr} 0 0 1 272 178Z`);
  let F = "", B = "";
  for (let k = 0; k < 3; k++) {
    const L = theta + k * Math.PI / 3;
    for (let half = 0; half < 2; half++) {
      let d = "", zs = 0;
      for (let n = 0; n <= 14; n++) {
        const lat = (half + n / 14) * Math.PI / 2, X = DR * Math.cos(lat) * Math.sin(L), Z = DR * Math.cos(lat) * Math.cos(L);
        zs += Z; d += (n ? "L" : "M") + (150 + X).toFixed(1) + " " + (178 - DV * Math.sin(lat) * cz + Z * ty).toFixed(1);
      }
      if (zs >= 0) F += d; else B += d;
    }
  }
  merf.setAttribute("d", F); merb.setAttribute("d", B);
}
draw();
// ---- ship fly-in (ported from the Medal Fly-in Lab): plays when the ship tier changes; click the ship picture to replay ----
(function () {
  const shield = root.querySelector(".ck-shield"), real = root.querySelector(".ck-ship"); if (!shield || !real) return;
  const P = { delay: .35, dur: 2.8, dist: 520, arc: -55, sScale: .3, bank: 12, angle: -151, thrust: 1, flame: 70, wake: 1.05, wakeW: 10, flash: .8, ring: .9, ringSize: 170, shake: 3.5, spark: 16, pulse: .9, fade: .12, engX: -106, engY: -25, flameA: -165 };
  const TOT = P.delay + P.dur + 1.5, clamp = v => Math.max(0, Math.min(1, v)), sm = v => { v = clamp(v); return v * v * (3 - 2 * v); }, easeQ = p => 1 - Math.pow(1 - clamp(p), 4);
  const SPK = Array.from({ length: 16 }, (_, i) => ({ a: i / 16 * 6.283 + (i % 3) * .2, d: .35 + (i * 37 % 10) / 14, z: .6 + (i * 53 % 7) / 9 }));
  let running = 0;
  function play() {
    const B = document.body.classList; if (B.contains("nms-calm") || matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    const myRun = ++running, W = shield.clientWidth, H = shield.clientHeight, k = W / 340, tc = getComputedStyle(shield).getPropertyValue("--tc").trim() || "#e8b84a";
    const M = 90, cv = document.createElement("canvas"); cv.width = (W + 2 * M) * devicePixelRatio; cv.height = (H + 2 * M) * devicePixelRatio;
    cv.style.cssText = `position:absolute;left:${-M}px;top:${-M}px;width:${W + 2 * M}px;height:${H + 2 * M}px;pointer-events:none;z-index:7`;
    const ship = document.createElement("b"); ship.className = "ck-ship ck-flyship"; ship.style.cssText = "animation:none;z-index:6;pointer-events:none";
    shield.append(cv, ship); real.style.visibility = "hidden";
    const ctx = cv.getContext("2d"); ctx.scale(devicePixelRatio, devicePixelRatio);
    const cx = W / 2 + M, cy = H / 2 + M, a = P.angle * Math.PI / 180, sx0 = Math.cos(a) * P.dist * k, sy0 = Math.sin(a) * P.dist * k;
    const fade = [shield.querySelector(".ck-sh1"), shield.querySelector(".ck-sh2"), root.querySelector(".ck-r2 .ck-bar"), root.querySelector(".ck-r2 .ck-tier")].filter(Boolean);
    const sw = real.offsetWidth, sh = real.offsetHeight;
    function st(t) {
      const pr = clamp((t - P.delay) / P.dur), e = easeQ(pr), len = Math.hypot(sx0, sy0) || 1, nx = sy0 / len, ny = -sx0 / len, bend = P.arc * k * Math.sin(Math.PI * pr);
      return { x: sx0 * (1 - e) + nx * bend, y: sy0 * (1 - e) + ny * bend, rot: P.bank * (1 - e), sc: P.sScale + (1 - P.sScale) * e, pr };
    }
    const eng = t => { const s = st(t), r = s.rot * Math.PI / 180, ex = P.engX * k * .55 * s.sc, ey = P.engY * k * .55 * s.sc; return { x: cx + s.x + ex * Math.cos(r) - ey * Math.sin(r), y: cy + s.y + ex * Math.sin(r) + ey * Math.cos(r), ok: t >= P.delay }; };
    const t0 = performance.now();
    (function frame(now) {
      if (myRun !== running || !root.isConnected) { cv.remove(); ship.remove(); real.style.visibility = ""; return; }
      const t = (now - t0) / 1000;
      if (t >= TOT) { cv.remove(); ship.remove(); real.style.animation = "none"; void real.offsetWidth; real.style.animation = ""; real.style.visibility = ""; fade.forEach(f => f.style.filter = ""); shield.style.transform = ""; return; }
      const s = st(t), land = P.delay + P.dur, started = t >= P.delay, q = clamp((t - land) / .9), q2 = clamp((t - land) / .4), on = t >= land;
      ctx.clearRect(0, 0, W + 2 * M, H + 2 * M);
      ship.style.opacity = started ? clamp(s.pr / P.fade) : 0;
      ship.style.transform = `translate(calc(-50% + ${s.x.toFixed(1)}px),calc(-50% + ${s.y.toFixed(1)}px)) rotate(${s.rot.toFixed(1)}deg) scale(${s.sc.toFixed(3)})`;
      // grey -> colour on the tile around the ship
      const g = 1 - sm((t - P.delay) / (P.dur * .9)), flt = g < .005 ? "" : `grayscale(${g.toFixed(2)}) brightness(${(1 - .5 * g).toFixed(2)})`; fade.forEach(f => f.style.filter = flt);
      // wake
      if (started) { const N = 22; let prev = eng(t); for (let i = 0; i < N; i++) { const tt = t - (i + 1) / N * P.wake, c = eng(tt), f = 1 - i / N; if (!prev.ok || !c.ok) { prev = c; continue; } ctx.strokeStyle = tc; ctx.globalAlpha = f * .7; ctx.lineWidth = Math.max(.4, P.wakeW * k * .5 * f * s.sc); ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(c.x, c.y); ctx.stroke(); prev = c; } }
      // thrust glow
      const th = P.thrust * Math.pow(1 - clamp(s.pr), .7) * (started ? 1 : 0);
      if (th > .01) { const e = eng(t), L = P.flame * k * .6 * s.sc, fa = (P.flameA + s.rot) * Math.PI / 180; ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(fa); const gr = ctx.createRadialGradient(L * .5, 0, 0, L * .5, 0, L); gr.addColorStop(0, "rgba(255,255,255,.95)"); gr.addColorStop(.35, tc); gr.addColorStop(1, "rgba(0,0,0,0)"); ctx.globalAlpha = th; ctx.fillStyle = gr; ctx.scale(1, .38); ctx.beginPath(); ctx.arc(L * .5, 0, L, 0, 6.283); ctx.fill(); ctx.restore(); }
      // landing: flash, ring, sparks, shake
      ctx.globalAlpha = 1;
      if (on) {
        ctx.globalAlpha = P.flash * Math.pow(1 - q, 2); const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70 * k + 40); fg.addColorStop(0, "#fff"); fg.addColorStop(.5, tc); fg.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = fg; ctx.fillRect(0, 0, W + 2 * M, H + 2 * M);
        ctx.globalAlpha = P.ring * (1 - q); ctx.strokeStyle = tc; ctx.lineWidth = 1 + 4 * (1 - q); ctx.beginPath(); ctx.ellipse(cx, cy, (20 + (P.ringSize - 20) * (1 - Math.pow(1 - q, 3))) * k, (20 + (P.ringSize - 20) * (1 - Math.pow(1 - q, 3))) * k * .45, 0, 0, 6.283); ctx.stroke();
        SPK.forEach((c, i) => { if (i >= P.spark) return; const d = (50 + 130 * c.d) * k * (1 - Math.pow(1 - q, 2.2)); ctx.globalAlpha = 1 - q; ctx.fillStyle = "#fffbea"; ctx.beginPath(); ctx.arc(cx + Math.cos(c.a) * d, cy + Math.sin(c.a) * d * .6, 2.2 * c.z * (1 - q * .7), 0, 6.283); ctx.fill(); });
        const sk = P.shake * (1 - q2) * Math.sin(q2 * 38) * k * 1.4; shield.style.transform = sk ? `translate(${sk.toFixed(2)}px,${(sk * .6).toFixed(2)}px)` : "";
      }
      requestAnimationFrame(frame);
    })(t0);
  }
  shield.style.cursor = "pointer"; shield.title = "Replay arrival"; shield.addEventListener("click", e => { e.stopPropagation(); play(); });
  try { const key = "nms-ck-tier", old = app.loadLocalStorage(key); app.saveLocalStorage(key, tier); if (old && old !== tier) setTimeout(play, 600); } catch (e) {}
})();

const tok = (window.__nmsCkTok = (window.__nmsCkTok || 0) + 1);
let paused = false, dragging = false, lastX = 0, lastY = 0, moved = 0, last = performance.now(), prevY = -1;
[vp, mid].forEach(el => {
  if (!el) return;
  el.addEventListener("pointerenter", () => paused = true);
  el.addEventListener("pointerleave", () => { paused = false; dragging = false; });
  el.addEventListener("pointerdown", e => { dragging = true; lastX = e.clientX; lastY = e.clientY; moved = 0; });
  el.addEventListener("pointermove", e => { if (!dragging) return; const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY; moved += Math.abs(dx) + Math.abs(dy); theta += dx * 0.008; alpha = Math.min(0.45, Math.max(0.1, alpha + dy * 0.004)); draw(); });
  el.addEventListener("pointerup", () => dragging = false);
  el.addEventListener("click", e => { if (moved > 4) { e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);
});
const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const flip = w => { w.classList.toggle("en"); w.classList.add("gl"); setTimeout(() => w.classList.remove("gl"), 450); };
words.forEach(w => { const g = () => { w.classList.add("gl"); setTimeout(() => w.classList.remove("gl"), 450); }; w.addEventListener("mouseenter", g); w.addEventListener("mouseleave", g); });
const SW = 15, SWEEP = 7.2, ov = root.querySelector(".ck-over");
(function loop(now) {
  if (tok !== window.__nmsCkTok || !root.isConnected) return;
  const dt = (now - last) / 1000; last = now;
  const B = document.body.classList, calm = B.contains("nms-calm") || reduce;
  if (dt < 0.2 && !paused && !dragging && !calm && B.contains("nms-fx-rotate")) { theta += dt * 0.1; draw(); }
  if (calm || !B.contains("nms-fx-sweep")) { bar.style.opacity = 0; prevY = -1; }
  else {
    const c = (now / 1000) % SW, nr = nms.getBoundingClientRect(), H = vp.getBoundingClientRect().bottom - nr.top, Y0 = ov.getBoundingClientRect().bottom - nr.top;
    if (c > SWEEP) { bar.style.opacity = 0; if (prevY >= 0) words.forEach(w => { const r = w.getBoundingClientRect(); const m = r.top + r.height / 2 - nr.top; if (m > H || m < Y0) flip(w); }); prevY = -1; }
    else {
      const y = Y0 + c / SWEEP * (H - Y0);
      const vr = vp.getBoundingClientRect(), vh = vr.height, ecx = vr.left - nr.left + vr.width / 2, ecy = (vr.top - nr.top) + vh * 0.97, eb = vh * 0.83, ea = vr.width * 0.455, tt = Math.min(1, (y - ecy) / eb), half = Math.abs(tt) >= 1 ? 0 : ea * Math.sqrt(1 - tt * tt);
      const bh = Math.min(150, y - Y0) + 2; bar.style.height = bh + "px"; bar.style.top = (y - bh + 2) + "px"; bar.style.left = (ecx - half).toFixed(0) + "px"; bar.style.right = (nr.width - ecx - half).toFixed(0) + "px"; bar.style.opacity = half > 6 ? 1 : 0;
      if (prevY >= 0) words.forEach(w => { const r = w.getBoundingClientRect(), cy = r.top + r.height / 2 - nr.top; if (prevY < cy && cy <= y) flip(w); });
      prevY = y;
    }
  }
  requestAnimationFrame(loop);
})(last);
```

> [!note]- Systems index (folded)
> [[Kethra Prime]] · [[Orovane]] · [[Vell-Ashkar]] · [[Tessaline]] · [[Hadrix Reach]]

> [!quote] Live test vault
> Every system, planet and creature here is invented. The cockpit reads this vault live through Dataview (counts, tasks, links, folders). Turn on Calm mode in Style Settings (Atlas Cockpit) to stop all motion.
