(function () {
  var D = window.DATA, app = document.getElementById("app");
  var st = { tactic: "all", status: "all", selTactic: null, how: null, ctac: "all", client: "all", open: {}, cls: {} };

  // Anchor classes (12), grouped into the three buckets. Order = order of the "least used class" tie-break.
  var CLASSES = [
    ["exact-match", "exact"], ["keyword-plus", "blended"], ["partial-keyword", "blended"], ["brand-plus-keyword", "blended"], ["page-title", "blended"],
    ["brand", "natural"], ["website-name-com", "natural"], ["full-url", "natural"], ["home-url", "natural"], ["url-no-http", "natural"], ["generic", "natural"], ["empty", "natural"]
  ];
  var BUCKET = {}; CLASSES.forEach(function (c) { BUCKET[c[0]] = c[1]; });
  var BUCKETS = [["natural", "Natural"], ["blended", "Blended"], ["exact", "Exact match"]];
  // Bands from the anchor text note: [low, high] in percent, per bucket, per page type
  var BANDS = {
    home: { natural: [80, 95], blended: [0, 10], exact: [0, 5] },
    inner: { natural: [59, 69], blended: [22, 32], exact: [2, 12] }
  };
  var BAND_TXT = {
    home: { natural: "80 to 95%", blended: "under 10%", exact: "under 5%" },
    inner: { natural: "59 to 69%", blended: "22 to 32%", exact: "2 to 12%" }
  };

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function pct(n) { return n == null ? "n/a" : Math.round(n * 100) + "%"; }
  function usd(n) { return n == null ? "n/a" : "$" + n.toFixed(0); }
  function hrs(n) { return n == null ? "n/a" : n.toFixed(1) + " h"; }
  function pill(cls, txt) { return '<span class="pill ' + cls + '">' + esc(txt) + "</span>"; }
  function statusPill(s) { return s === "do-not-contact" ? pill("dnc", s) : pill(s, s); }
  function lastAttempt(site) { var a = D.attempts.filter(function (x) { return x.site === site; }); return a.length ? a[a.length - 1] : null; }
  function clientOf(id) { return D.clients.filter(function (c) { return c.id === id; })[0]; }
  function curCls(l) { return st.cls[l.id] || l.cls; }

  // ---------- charts (inline SVG, scale to the box, never wider than it) ----------
  function chart(vals, o) {
    o = o || {};
    var W = o.w || (window.innerWidth < 760 ? 340 : 600), H = o.h || (window.innerWidth < 760 ? 120 : 150), padL = o.big ? 30 : 6, padR = 8, padT = 10, padB = o.big ? 22 : 8;
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    if (min === max) { min -= 1; max += 1; }
    var span = max - min; min -= span * 0.15; max += span * 0.15;
    var n = vals.length, bf = o.backfill || 0;
    function x(i) { return padL + (n === 1 ? 0 : i * (W - padL - padR) / (n - 1)); }
    function y(v) { return padT + (max - v) * (H - padT - padB) / (max - min); }
    function pts(a, b) { var s = []; for (var i = a; i <= b; i++) s.push(x(i).toFixed(1) + "," + y(vals[i]).toFixed(1)); return s.join(" "); }
    var g = "";
    if (o.big) {
      [min, (min + max) / 2, max].forEach(function (t) { g += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + y(t).toFixed(1) + '" y2="' + y(t).toFixed(1) + '" class="grid"/><text x="' + (padL - 4) + '" y="' + (y(t) + 3).toFixed(1) + '" class="ax" text-anchor="end">' + Math.round(t) + "</text>"; });
      (o.labels || []).forEach(function (lb, i) { if (i % 2 === 0 || i === n - 1) g += '<text x="' + x(i).toFixed(1) + '" y="' + (H - 6) + '" class="ax" text-anchor="middle">' + lb + "</text>"; });
    }
    var body = "";
    if (bf > 1) {
      body += '<polyline points="' + pts(0, bf - 1) + '" class="ln back"/>';
      body += '<polyline points="' + pts(bf - 1, n - 1) + '" class="ln"/>';
      if (o.big) body += '<text x="' + x(0).toFixed(1) + '" y="' + (padT + 2) + '" class="bf">backfill (DataForSEO history)</text>';
    } else if (n > 1) body += '<polyline points="' + pts(0, n - 1) + '" class="ln"/>';
    for (var i = 0; i < n; i++) body += '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(vals[i]).toFixed(1) + '" r="' + (i === n - 1 ? 3.4 : 2) + '" class="dot' + (i < bf ? " back" : "") + (i === n - 1 ? " now" : "") + '"/>';
    return '<svg class="chart' + (o.big ? " big" : "") + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(o.label || "Trend") + '" preserveAspectRatio="xMidYMid meet">' + g + body + "</svg>";
  }
  function pageMonths(len) { return D.months.slice(D.months.length - len); }

  // ---------- anchors ----------
  function anchorText(l, p) {
    var c = clientOf(l.clientId), pick = parseInt(l.id.slice(2), 10) % 2, brand = c.brand, ph = p.phrase, dom = c.domain, url = "https://" + dom + (p.path === "/" ? "" : p.path);
    var t = {
      "exact-match": [ph, ph.charAt(0).toUpperCase() + ph.slice(1)],
      "keyword-plus": ["best " + ph + " services", ph + " cost guide"],
      "partial-keyword": [ph.split(" ").slice(0, 2).join(" ") + " specialists", ph.split(" ").slice(-1)[0] + " experts"],
      "brand-plus-keyword": [brand + " " + ph, ph + " by " + brand],
      "page-title": [pageTitle(p, brand), pageTitle(p, brand)],
      "brand": [brand, brand.split(" ").slice(0, 2).join(" ")],
      "website-name-com": [dom.replace(/\.example\.com$/, "").replace(/(^|-)([a-z])/g, function (m, a, b) { return b.toUpperCase(); }) + ".com", dom.replace(/\.example\.com$/, "") + ".com"],
      "full-url": [url, url],
      "home-url": ["https://" + dom, "https://" + dom],
      "url-no-http": [dom + (p.path === "/" ? "" : p.path), dom],
      "generic": ["click here", "this local guide"],
      "empty": ["(image link, no alt text)", "(image link, no alt text)"]
    };
    return t[curCls(l)][pick];
  }
  function pageTitle(p, brand) { return p.phrase.charAt(0).toUpperCase() + p.phrase.slice(1) + " | " + brand; }
  function liveLinks(p) { return p.links.filter(function (l) { return l.live; }); }
  function mixOf(p) {
    var live = liveLinks(p), n = live.length, cc = {}, bc = { natural: 0, blended: 0, exact: 0 };
    CLASSES.forEach(function (c) { cc[c[0]] = 0; });
    live.forEach(function (l) { var c = curCls(l); cc[c]++; bc[BUCKET[c]]++; });
    var bp = {}; BUCKETS.forEach(function (b) { bp[b[0]] = n ? bc[b[0]] * 100 / n : 0; });
    return { n: n, cc: cc, bc: bc, bp: bp };
  }
  function bandState(type, b, v) {
    var band = BANDS[type][b];
    if (b === "natural") return v < band[0] ? "under" : v > band[1] ? "over" : "in";
    if (type === "home") return v >= band[1] ? "over" : "in";
    return v < band[0] ? "under" : v > band[1] ? "over" : "in";
  }
  // The next-anchor rule from the anchor text note
  function nextAnchor(p) {
    var m = mixOf(p), type = p.type, top = { natural: p.top3[0], blended: p.top3[1], exact: p.top3[2] };
    var usable = CLASSES.filter(function (c) { return !(type === "home" && c[0] === "home-url"); });
    function leastUsed(b) {
      var best = null; usable.forEach(function (c) { if (c[1] === b && (best === null || m.cc[c[0]] < m.cc[best])) best = c[0]; }); return best;
    }
    if (m.n < 10) return { cls: leastUsed("natural"), why: "This page has " + m.n + " live Links. Under 10 the percentages are too coarse to steer, so the advice is natural until it has 10." };
    var order = BUCKETS.map(function (b) { return b[0]; }).sort(function (a, b) { return (top[b] - m.bp[b]) - (top[a] - m.bp[a]); });
    var skipped = [];
    for (var i = 0; i < order.length; i++) {
      var b = order[i], gap = top[b] - m.bp[b];
      if (gap <= 0 && b !== "natural") continue;
      if (b !== "natural") {
        var after = (m.bc[b] + 1) * 100 / (m.n + 1);
        if (bandState(type, b, after) === "over") { skipped.push(b); continue; }
      }
      var bname = BUCKETS.filter(function (x) { return x[0] === b; })[0][1].toLowerCase(), why;
      var skipTxt = skipped.map(function (s) { return (s === "exact" ? "Exact match" : "Blended") + " is under the top-3 mix but one more Link would pass the top of its band (" + BANDS[type][s][1] + "%)"; }).join("; ");
      if (gap > 0) {
        why = "Furthest under the top-3 mix: " + bname + " (" + Math.round(m.bp[b]) + "% now, " + top[b] + "% top-3).";
        if (skipped.length) why = skipTxt + ", so " + (skipped.length > 1 ? "they move" : "it moves") + " on. " + why;
      } else if (skipped.length) {
        why = (skipped.length > 1 ? "Exact match and blended would both pass the top of their band" : skipTxt) + ", so natural is the only bucket left.";
      } else {
        why = "Every bucket is at or over the top-3 mix, so natural, which has the most room.";
      }
      return { cls: leastUsed(b), why: why + " Least used class inside it." };
    }
  }

  function anchorPanel(p) {
    var m = mixOf(p), type = p.type, top = { natural: p.top3[0], blended: p.top3[1], exact: p.top3[2] }, nx = nextAnchor(p);
    var rows = BUCKETS.map(function (b) {
      var k = b[0], v = m.bp[k], s = bandState(type, k, v), classes = CLASSES.filter(function (c) { return c[1] === k && !(type === "home" && c[0] === "home-url"); })
        .map(function (c) { return c[0] + " " + m.cc[c[0]]; }).join(", ");
      var sp = s === "in" ? pill("won", "in band") : s === "under" ? pill("open", "under band") : pill("lost", "over band");
      return '<tr><td data-l="Bucket"><div class="cell"><b>' + b[1] + '</b><div class="kept">' + classes + '</div></div></td><td class="num" data-l="Now">' + Math.round(v) + "% (" + m.bc[k] + " of " + m.n + ')</td><td data-l="Band for ' + (type === "home" ? "a homepage" : "an inner page") + '">' + '<div class="cell">' + BAND_TXT[type][k] + " " + sp + '</div></td><td class="num" data-l="Top-3 competitors (fake)">' + top[k] + "%</td></tr>";
    }).join("");
    return '<div class="anchor"><h4>Anchor mix for this client page <span class="pill dnc">internal only</span></h4>' +
      '<p class="note">Page type: ' + (type === "home" ? "homepage" : "inner page") + ". Counts live Links only. Bands are per bucket; class counts sit under each bucket. The top-3 column is invented.</p>" +
      '<table class="mix"><thead><tr><th>Bucket</th><th class="num">Now</th><th>Band</th><th class="num">Top-3 competitors</th></tr></thead><tbody>' + rows + "</tbody></table>" +
      '<p class="next" data-next="' + nx.cls + '"><b>Next anchor: ' + nx.cls + "</b></p><p class=\"note\">" + esc(nx.why) + "</p></div>";
  }

  // ---------- scorecard ----------
  // one Link per Site per client, however many pages (ledger rule). Only Links we asked for count here.
  function countedLinks(tac) {
    var seen = {};
    return D.links.filter(function (l) {
      if (!l.tactic) return false;
      if (tac && l.tactic !== tac) return false;
      var k = l.client + "|" + l.site; if (seen[k]) return false; seen[k] = 1; return true;
    });
  }
  function score(t) {
    var at = D.attempts.filter(function (a) { return a.tactic === t.id; });
    var sitesTried = {}; at.forEach(function (a) { sitesTried[a.site] = 1; });
    var nTried = Object.keys(sitesTried).length;
    var lk = countedLinks(t.id);
    var min = at.reduce(function (s, a) { return s + a.minutes; }, 0);
    var cash = at.reduce(function (s, a) { return s + a.cash; }, 0);
    var old = lk.filter(function (l) { return l.live90 !== null; });
    return { at: at, n: at.length, links: lk.length, win: nTried ? lk.length / nTried : null,
      hpl: lk.length ? min / 60 / lk.length : null, cpl: lk.length ? cash / lk.length : null,
      live90: old.length ? old.filter(function (l) { return l.live90; }).length / old.length : null };
  }

  function scorecard() {
    var rows = D.tactics.map(function (t) {
      var s = score(t), sel = st.selTactic === t.id;
      return '<tr class="click' + (sel ? " sel" : "") + '" tabindex="0" role="button" data-tac="' + t.id + '" aria-expanded="' + sel + '">' +
        '<td data-l="Tactic"><b>' + t.id + "</b></td><td data-l=\"Tier\">" + pill("green", t.tier) + '</td><td data-l="Status">' + pill("open", t.status) + "</td>" +
        '<td class="num" data-l="Attempts">' + s.n + '</td><td class="num" data-l="Links">' + s.links + '</td><td class="num" data-l="Win rate">' + pct(s.win) +
        '</td><td class="num" data-l="Hours per Link">' + hrs(s.hpl) + '</td><td class="num" data-l="Cash per Link">' + usd(s.cpl) + '</td><td class="num" data-l="Live at 90 days">' + pct(s.live90) + "</td></tr>";
    }).join("");
    var tl = countedLinks(), live = tl.filter(function (l) { return l.live; }).length;
    var tacs = {}; tl.filter(function (l) { return l.live; }).forEach(function (l) { tacs[l.tactic] = 1; });
    var detail = "";
    if (st.selTactic) {
      var t = D.tactics.filter(function (x) { return x.id === st.selTactic; })[0], s = score(t), open = st.how === t.id;
      detail = '<div class="card detail" id="detail"><div class="thead"><h2 class="tt" id="ttitle">' + esc(t.title) + "</h2>" + pill("green", t.tier) + pill("open", t.status) + "</div>" +
        '<p class="desc" id="tdesc">' + esc(t.desc) + "</p>" +
        '<p class="btnrow"><button class="btn" id="how" aria-expanded="' + open + '" aria-controls="howpanel">' + (open ? "Hide how it works" : "How it works") + "</button></p>" +
        (open ? '<div class="how" id="howpanel"><p class="note">Step by step, one box per step: what happens, who runs it (the seat), and where it can fail. Each failure names the scorecard number it moves.</p>' +
          '<div class="frame" tabindex="0" aria-label="Diagram, scrolls sideways on a phone"><iframe title="How it works: ' + esc(t.title) + '" src="how/' + t.id + '.html?embed=1" loading="lazy"></iframe></div>' +
          '<p class="btnrow"><a class="lnk" href="how/' + t.id + '.html" target="_blank" rel="noopener">Open full size in a new tab</a> <button class="btn" id="howclose">Close diagram</button></p></div>' : "") +
        "<h3>Attempts for " + esc(t.id) + "</h3>" +
        (s.at.length ? '<table><thead><tr><th>Attempt</th><th>Date</th><th>Site</th><th>Action</th><th class="num">Minutes</th><th class="num">Cash</th><th>Outcome</th><th>Gate</th></tr></thead><tbody>' +
        s.at.map(function (a) { return '<tr><td data-l="Attempt">' + a.id + '</td><td data-l="Date">' + a.date + '</td><td data-l="Site">' + a.site + '.example.com</td><td data-l="Action">' + a.action + '</td><td class="num" data-l="Minutes">' + a.minutes + '</td><td class="num" data-l="Cash">$' + a.cash + '</td><td data-l="Outcome">' + pill(a.outcome === "won" ? "won" : a.outcome === "declined" ? "dead" : "open", a.outcome) + '</td><td data-l="Gate">' + a.gate + "</td></tr>"; }).join("") + "</tbody></table>"
        : '<div class="empty">No Attempts yet for this Tactic.</div>') +
        '<p><button class="btn" id="close">Close</button></p></div>';
    }
    return "<h1>Tactic scorecard</h1><p class=\"lede\">One row per Tactic. Click a row to see its title, what it is, how it works and its Attempts. Numbers are invented. As of " + D.asof + ".</p>" +
      '<div class="stats"><div class="stat"><b>' + live + '</b><span>live Links we asked for (one per Site per client)</span></div><div class="stat"><b>' + Object.keys(tacs).length + '</b><span>Tactics with a live Link</span></div><div class="stat"><b>0</b><span>ungated sends</span></div></div>' +
      '<div class="card"><table><thead><tr><th>Tactic</th><th>Tier</th><th>Status</th><th class="num">Attempts</th><th class="num">Links</th><th class="num">Win rate</th><th class="num">Hours per Link</th><th class="num">Cash per Link</th><th class="num">Live at 90 days</th></tr></thead><tbody>' + rows + "</tbody></table>" +
      '<p class="note">Win rate = Sites that gave a Link, out of Sites tried. Live at 90 days = share of Links still found on the recheck; n/a until a Link is 90 days old.</p></div>' + detail;
  }

  // ---------- sites ----------
  function sitesView() {
    var tOpts = '<option value="all">All Tactics</option>' + D.tactics.map(function (t) { return '<option value="' + t.id + '"' + (st.tactic === t.id ? " selected" : "") + ">" + t.id + "</option>"; }).join("");
    var sOpts = ["all", "open", "won", "dead", "do-not-contact"].map(function (s) { return '<option value="' + s + '"' + (st.status === s ? " selected" : "") + ">" + (s === "all" ? "All statuses" : s) + "</option>"; }).join("");
    var list = D.sites.filter(function (s) { return (st.tactic === "all" || s.tactic === st.tactic) && (st.status === "all" || s.status === st.status); });
    var rows = list.map(function (s) {
      var la = lastAttempt(s.id), cls = s.status === "dead" ? "is-dead" : s.status === "do-not-contact" ? "is-dnc" : "";
      return '<tr class="' + cls + '"><td data-l="Site"><div class="cell"><b>' + esc(s.name) + '</b><div class="kept">' + s.domain + '</div></div></td><td data-l="Type">' + s.type + '</td><td data-l="Tactic">' + s.tactic + '</td><td data-l="Status"><div class="cell">' + statusPill(s.status) + '<div class="kept">' + esc(s.note) + '</div></div></td><td data-l="Last Attempt">' + (la ? la.date + " (" + la.outcome + ")" : "none") + '</td><td data-l="Retry after">' + (s.status === "do-not-contact" ? "never" : s.retry || "n/a") + '</td><td class="num" data-l="Price">' + (s.price == null ? "free" : "$" + s.price) + "</td></tr>";
    }).join("");
    var lost = D.sites.filter(function (s) { return s.status === "dead" || s.status === "do-not-contact"; }).length;
    return "<h1>Site database</h1><p class=\"lede\">Every Site we touch is kept, win or lose. " + lost + " of " + D.sites.length + " Sites here did not work out and are still on the list so nobody asks twice.</p>" +
      '<div class="card"><div class="filters"><label>Status<select id="fstatus">' + sOpts + '</select></label><label>Tactic<select id="ftactic">' + tOpts + '</select></label><button class="btn" id="reset">Reset filters</button></div>' +
      '<p class="note" id="count">Showing ' + list.length + " of " + D.sites.length + " Sites.</p>" +
      (list.length ? "<table><thead><tr><th>Site</th><th>Type</th><th>Tactic</th><th>Status</th><th>Last Attempt</th><th>Retry after</th><th class=\"num\">Price</th></tr></thead><tbody>" + rows + "</tbody></table>" : '<div class="empty">No Sites match these filters.</div>') + "</div>";
  }

  // ---------- client screens ----------
  function authFoot() { return '<p class="note foot">Domain authority and Page authority are DataForSEO rank, 0 to 1000. Like Ahrefs DR and UR, different scale.</p>'; }
  function clientCard(c) {
    var now = c.da[c.da.length - 1], first = c.da[D.backfill];
    return '<div class="card cli" data-client="' + c.id + '"><div class="cli-h"><div><h3>' + esc(c.name) + '</h3><div class="note">' + c.domain + '</div></div>' +
      '<div class="metric"><b>' + now + '</b><span>Domain authority now</span><small>DataForSEO rank, up ' + (now - first) + " since we started recording</small></div></div>" +
      chart(c.da, { big: true, backfill: D.backfill, labels: D.months, label: "Domain authority by month for " + c.short }) +
      '<p class="note">Monthly. The dashed first ' + D.backfill + " points are backfill from DataForSEO history; the solid line is recorded by us.</p></div>";
  }
  function pageRows(c, internal) {
    var pgs = D.pages.filter(function (p) { return p.clientId === c.id || p.client === c.id; });
    return pgs.map(function (p) {
      var open = !!st.open[p.id], live = liveLinks(p).length, lost = p.links.length - live, now = p.ur[p.ur.length - 1];
      var row = '<tr class="click' + (open ? " sel" : "") + '" tabindex="0" role="button" data-page="' + p.id + '" aria-expanded="' + open + '">' +
        '<td data-l="Client page"><div class="cell"><b>' + esc(p.url) + '</b><div class="kept">' + (p.type === "home" ? "homepage" : "inner page") + '</div></div></td>' +
        '<td class="num" data-l="Total Links">' + p.links.length + (lost ? '<div class="kept">' + live + " live, " + lost + " lost</div>" : "") + '</td>' +
        '<td class="num" data-l="Page authority"><b>' + now + '</b><div class="kept">DataForSEO rank</div></td>' +
        '<td data-l="Trend"><div class="spark">' + chart(p.ur, { w: 140, h: 44, label: "Page authority by month for " + p.url }) + '<div class="kept">' + pageMonths(p.ur.length)[0] + " to " + pageMonths(p.ur.length)[p.ur.length - 1] + "</div></div></td>" +
        '<td data-l=""><span class="btn tiny">' + (open ? "Hide Links" : "Show Links") + "</span></td></tr>";
      if (open) row += '<tr class="expand"><td colspan="5">' + linksTable(p, internal) + (internal ? anchorPanel(p) : "") + "</td></tr>";
      return row;
    }).join("");
  }
  function linksTable(p, internal) {
    var rows = p.links.map(function (l) {
      var hi = l.spam >= 50, c = curCls(l), changed = c !== l.ai || st.cls[l.id];
      var cell = internal ? '<td data-l="Anchor class"><div class="cell"><span class="pill cls ' + BUCKET[c] + '">' + c + '</span><div class="kept">AI guess: ' + l.ai + (st.cls[l.id] && st.cls[l.id] !== l.ai ? ". Changed by a person." : "") + '</div>' +
        '<select class="recls" data-lid="' + l.id + '" aria-label="Reclassify anchor for ' + esc(l.siteName) + '">' + CLASSES.map(function (k) { return '<option value="' + k[0] + '"' + (k[0] === c ? " selected" : "") + ">" + k[0] + "</option>"; }).join("") + "</select></div></td>" : "";
      return '<tr><td data-l="Linking page URL"><div class="cell"><a class="lnk" href="#/' + (internal ? "client" : "portal") + '" onclick="return false">' + esc(l.url) + '</a>' + (l.tactic ? "" : '<div class="kept">found, not asked for</div>') + '</div></td>' +
        '<td data-l="Site"><div class="cell"><b>' + esc(l.siteName) + '</b>' + (internal ? '<div class="kept">' + (hi ? '<span class="spam hi">spam ' + l.spam + " (high)</span>" : '<span class="spam">spam ' + l.spam + "</span>") + "</div>" : "") + "</div></td>" +
        '<td class="num" data-l="Site domain authority">' + l.da + '</td><td class="num" data-l="Linking page authority">' + l.pa + "</td>" +
        '<td data-l="Anchor">' + esc(anchorText(l, p)) + "</td>" + cell +
        '<td data-l="Rel">' + l.rel + '</td><td data-l="First seen">' + l.first + '</td><td data-l="Status">' + (l.live ? pill("won", "live") : pill("lost", "lost")) + "</td></tr>";
    }).join("");
    return '<table class="sub"><thead><tr><th>Linking page URL</th><th>Site</th><th class="num">Site domain authority<small>DataForSEO rank</small></th><th class="num">Linking page authority<small>DataForSEO rank</small></th><th>Anchor</th>' + (internal ? "<th>Anchor class</th>" : "") + "<th>Rel</th><th>First seen</th><th>Status</th></tr></thead><tbody>" + rows + "</tbody></table>";
  }
  function pageTable(c, internal) {
    return '<table class="pages"><thead><tr><th>Client page</th><th class="num">Total Links</th><th class="num">Page authority<small>DataForSEO rank</small></th><th>Trend</th><th></th></tr></thead><tbody>' + pageRows(c, internal) + "</tbody></table>";
  }
  function clientStats(list) {
    var ls = D.links.filter(function (l) { return list.indexOf(l.clientId) >= 0; });
    var live = ls.filter(function (l) { return l.live; }).length;
    var flight = D.sites.filter(function (s) { return s.status === "open" && list.indexOf(D.clients.filter(function (c) { return c.name === s.client; })[0].id) >= 0; }).length;
    return '<div class="stats"><div class="stat"><b>' + live + '</b><span>Links live</span></div><div class="stat"><b>' + ls.length + '</b><span>Links in all, over ' + D.pages.filter(function (p) { return list.indexOf(p.client) >= 0; }).length + ' client pages</span></div><div class="stat"><b>' + flight + '</b><span>outreach in flight (count only)</span></div></div>';
  }

  function clientView() {
    var opts = [["all", "All clients"]].concat(D.clients.map(function (c) { return [c.id, c.name]; })).map(function (o) { return '<option value="' + o[0] + '"' + (st.client === o[0] ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("");
    var list = st.client === "all" ? D.clients : D.clients.filter(function (c) { return c.id === st.client; });
    var ids = list.map(function (c) { return c.id; });
    var body = '<div class="cards' + (list.length > 1 ? " two" : "") + '">' + list.map(clientCard).join("") + "</div>" + clientStats(ids) +
      list.map(function (c) { return '<div class="card" data-group="' + c.id + '"><h3>Links by client page: ' + esc(c.name) + '</h3><p class="note">One row per client page. Click a row to see the Links that point at it.</p>' + pageTable(c, true) + "</div>"; }).join("");
    return "<h1>Client Links</h1><p class=\"lede\">Internal view. Pick a client, or see all. Domain authority is tracked over time because it should go up when link building works. Click a client page to see its Links and its anchor advice.</p>" +
      '<div class="card"><div class="filters"><label>Client<select id="csel">' + opts + "</select></label></div></div>" + body +
      '<p class="note">Links shown as "found, not asked for" were found by the script on Sites we never contacted. They show here but do not count on the scorecard. A Link is live when the newest recheck still finds it on the page. Reclassifying an anchor is kept only while this page stays open (fake state).</p>' + authFoot();
  }
  function portalView() {
    var c = D.clients[0];
    return "<h1>Links</h1><p class=\"lede\">What " + esc(c.name) + " would see in its portal. One client only. Questions: call " + D.contact + ".</p>" +
      '<div class="cards">' + clientCard(c) + "</div>" + clientStats([c.id]) +
      '<div class="card"><h3>Links by client page</h3><p class="note">One row per page on your site. Click a row to see the Links that point at it.</p>' + pageTable(c, false) +
      '<p class="note">A Link is live when the newest recheck still finds it on the page. Rechecks run at 30 and 90 days.</p></div>' + authFoot();
  }

  var ROUTES = ["scorecard", "sites", "client", "portal"];
  function render() {
    var r = (location.hash.replace("#/", "") || "scorecard").split("?")[0];
    if (ROUTES.indexOf(r) < 0) r = "scorecard";
    app.innerHTML = r === "scorecard" ? scorecard() : r === "sites" ? sitesView() : r === "client" ? clientView() : portalView();
    document.querySelectorAll("#nav a").forEach(function (a) { var on = a.getAttribute("data-r") === r; a.className = on ? "on" : ""; if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    document.title = "Link Engine prototype: " + r;
    bind(r);
  }
  function bind(r) {
    if (r === "scorecard") {
      app.querySelectorAll("tr.click").forEach(function (tr) {
        function go() { var id = tr.getAttribute("data-tac"); st.selTactic = st.selTactic === id ? null : id; st.how = null; render(); var d = document.getElementById("detail"); if (d) d.scrollIntoView({ block: "nearest" }); }
        tr.addEventListener("click", go);
        tr.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
      });
      var c = document.getElementById("close"); if (c) c.addEventListener("click", function () { st.selTactic = null; st.how = null; render(); });
      var h = document.getElementById("how"); if (h) h.addEventListener("click", function () { st.how = st.how === st.selTactic ? null : st.selTactic; render(); var el = document.getElementById(st.how ? "howpanel" : "how"); if (el) el.scrollIntoView({ block: "nearest" }); });
      var hc = document.getElementById("howclose"); if (hc) hc.addEventListener("click", function () { st.how = null; render(); var el = document.getElementById("how"); if (el) el.focus(); });
    } else if (r === "sites") {
      document.getElementById("fstatus").addEventListener("change", function (e) { st.status = e.target.value; render(); });
      document.getElementById("ftactic").addEventListener("change", function (e) { st.tactic = e.target.value; render(); });
      document.getElementById("reset").addEventListener("click", function () { st.status = "all"; st.tactic = "all"; render(); });
    } else {
      var cs = document.getElementById("csel"); if (cs) cs.addEventListener("change", function (e) { st.client = e.target.value; render(); });
      app.querySelectorAll("tr.click").forEach(function (tr) {
        function go() { var id = tr.getAttribute("data-page"); st.open[id] = !st.open[id]; var y = window.scrollY; render(); window.scrollTo(0, y); }
        tr.addEventListener("click", go);
        tr.addEventListener("keydown", function (e) { if (e.target === tr && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); go(); } });
      });
      app.querySelectorAll("select.recls").forEach(function (s) {
        s.addEventListener("change", function (e) { var lid = s.getAttribute("data-lid"); st.cls[lid] = e.target.value; var y = window.scrollY; render(); window.scrollTo(0, y); var again = app.querySelector('select[data-lid="' + lid + '"]'); if (again) again.focus(); });
      });
    }
  }
  var lastW = window.innerWidth;
  window.addEventListener("resize", function () { if ((lastW < 760) !== (window.innerWidth < 760)) { lastW = window.innerWidth; render(); } else lastW = window.innerWidth; });
  window.addEventListener("hashchange", render);
  render();
})();
