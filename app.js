(function () {
  var D = window.DATA, app = document.getElementById("app");
  var st = { tactic: "all", status: "all", selTactic: null, ctac: "all" };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function pct(n) { return n == null ? "n/a" : Math.round(n * 100) + "%"; }
  function usd(n) { return n == null ? "n/a" : "$" + n.toFixed(0); }
  function hrs(n) { return n == null ? "n/a" : n.toFixed(1) + " h"; }
  function pill(cls, txt) { return '<span class="pill ' + cls + '">' + esc(txt) + "</span>"; }
  function statusPill(s) { return s === "do-not-contact" ? pill("dnc", s) : pill(s, s); }
  function lastAttempt(site) { var a = D.attempts.filter(function (x) { return x.site === site; }); return a.length ? a[a.length - 1] : null; }

  // one Link per Site per client, however many pages (ledger rule)
  function countedLinks(tac) {
    var seen = {};
    return D.links.filter(function (l) {
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
      var s = score(D.tactics.filter(function (t) { return t.id === st.selTactic; })[0]);
      detail = '<div class="card detail" id="detail"><h3>Attempts for ' + esc(st.selTactic) + '</h3>' +
        (s.at.length ? '<table><thead><tr><th>Attempt</th><th>Date</th><th>Site</th><th>Action</th><th class="num">Minutes</th><th class="num">Cash</th><th>Outcome</th><th>Gate</th></tr></thead><tbody>' +
        s.at.map(function (a) { return '<tr><td data-l="Attempt">' + a.id + '</td><td data-l="Date">' + a.date + '</td><td data-l="Site">' + a.site + '.example.com</td><td data-l="Action">' + a.action + '</td><td class="num" data-l="Minutes">' + a.minutes + '</td><td class="num" data-l="Cash">$' + a.cash + '</td><td data-l="Outcome">' + pill(a.outcome === "won" ? "won" : a.outcome === "declined" ? "dead" : "open", a.outcome) + '</td><td data-l="Gate">' + a.gate + "</td></tr>"; }).join("") + "</tbody></table>"
        : '<div class="empty">No Attempts yet for this Tactic.</div>') +
        '<p><button class="btn" id="close">Close</button></p></div>';
    }
    return "<h1>Tactic scorecard</h1><p class=\"lede\">One row per Tactic. Click a row to see its Attempts. Numbers are invented. As of " + D.asof + ".</p>" +
      '<div class="stats"><div class="stat"><b>' + live + '</b><span>live Links (one per Site per client)</span></div><div class="stat"><b>' + Object.keys(tacs).length + '</b><span>Tactics with a live Link</span></div><div class="stat"><b>0</b><span>ungated sends</span></div></div>' +
      '<div class="card"><table><thead><tr><th>Tactic</th><th>Tier</th><th>Status</th><th class="num">Attempts</th><th class="num">Links</th><th class="num">Win rate</th><th class="num">Hours per Link</th><th class="num">Cash per Link</th><th class="num">Live at 90 days</th></tr></thead><tbody>' + rows + "</tbody></table>" +
      '<p class="note">Win rate = Sites that gave a Link, out of Sites tried. Live at 90 days = share of Links still found on the recheck; n/a until a Link is 90 days old.</p></div>' + detail;
  }

  function sitesView() {
    var tOpts = '<option value="all">All Tactics</option>' + D.tactics.map(function (t) { return '<option value="' + t.id + '"' + (st.tactic === t.id ? " selected" : "") + ">" + t.id + "</option>"; }).join("");
    var sOpts = ["all", "open", "won", "dead", "do-not-contact"].map(function (s) { return '<option value="' + s + '"' + (st.status === s ? " selected" : "") + ">" + (s === "all" ? "All statuses" : s) + "</option>"; }).join("");
    var list = D.sites.filter(function (s) { return (st.tactic === "all" || s.tactic === st.tactic) && (st.status === "all" || s.status === st.status); });
    var rows = list.map(function (s) {
      var la = lastAttempt(s.id), cls = s.status === "dead" ? "is-dead" : s.status === "do-not-contact" ? "is-dnc" : "";
      return '<tr class="' + cls + '"><td data-l="Site"><b>' + esc(s.name) + '</b><div class="kept">' + s.domain + '</div></td><td data-l="Type">' + s.type + '</td><td data-l="Tactic">' + s.tactic + '</td><td data-l="Status">' + statusPill(s.status) + '<div class="kept">' + esc(s.note) + '</div></td><td data-l="Last Attempt">' + (la ? la.date + " (" + la.outcome + ")" : "none") + '</td><td data-l="Retry after">' + (s.status === "do-not-contact" ? "never" : s.retry || "n/a") + '</td><td class="num" data-l="Price">' + (s.price == null ? "free" : "$" + s.price) + "</td></tr>";
    }).join("");
    var lost = D.sites.filter(function (s) { return s.status === "dead" || s.status === "do-not-contact"; }).length;
    return "<h1>Site database</h1><p class=\"lede\">Every Site we touch is kept, win or lose. " + lost + " of " + D.sites.length + " Sites here did not work out and are still on the list so nobody asks twice.</p>" +
      '<div class="card"><div class="filters"><label>Status<select id="fstatus">' + sOpts + '</select></label><label>Tactic<select id="ftactic">' + tOpts + '</select></label><button class="btn" id="reset">Reset filters</button></div>' +
      '<p class="note" id="count">Showing ' + list.length + " of " + D.sites.length + " Sites.</p>" +
      (list.length ? "<table><thead><tr><th>Site</th><th>Type</th><th>Tactic</th><th>Status</th><th>Last Attempt</th><th>Retry after</th><th class=\"num\">Price</th></tr></thead><tbody>" + rows + "</tbody></table>" : '<div class="empty">No Sites match these filters.</div>') + "</div>";
  }

  function clientView() {
    var mine = D.links.filter(function (l) { return l.client === D.client; });
    var shown = mine.filter(function (l) { return st.ctac === "all" || (st.ctac === "live" ? l.live : !l.live); });
    var flight = D.sites.filter(function (s) { return s.client === D.client && s.status === "open"; }).length;
    var live = mine.filter(function (l) { return l.live; }).length;
    var opts = [["all", "All Links"], ["live", "Live only"], ["lost", "Lost only"]].map(function (o) { return '<option value="' + o[0] + '"' + (st.ctac === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("");
    var rows = shown.map(function (l) {
      return '<tr><td data-l="Page URL"><a class="lnk" href="#/client" onclick="return false">' + esc(l.page) + '</a></td><td data-l="Anchor">' + esc(l.anchor) + '</td><td data-l="Rel">' + l.rel + '</td><td data-l="First seen">' + l.first + '</td><td data-l="Status">' + (l.live ? pill("won", "live") : pill("lost", "lost")) + "</td></tr>";
    }).join("");
    return "<h1>Links</h1><p class=\"lede\">What " + esc(D.client) + " would see in its portal. Questions: call 555-0142.</p>" +
      '<div class="stats"><div class="stat"><b>' + live + '</b><span>Links live</span></div><div class="stat"><b>' + mine.length + '</b><span>Links won in all</span></div><div class="stat"><b>' + flight + '</b><span>outreach in flight (count only)</span></div></div>' +
      '<div class="card"><div class="filters"><label>Show<select id="cfilter">' + opts + '</select></label></div>' +
      (shown.length ? "<table><thead><tr><th>Page URL</th><th>Anchor</th><th>Rel</th><th>First seen</th><th>Status</th></tr></thead><tbody>" + rows + "</tbody></table>" : '<div class="empty">No Links match.</div>') +
      '<p class="note">A Link is live when the newest recheck still finds it on the page. Rechecks run at 30 and 90 days.</p></div>';
  }

  function render() {
    var r = (location.hash.replace("#/", "") || "scorecard").split("?")[0];
    if (["scorecard", "sites", "client"].indexOf(r) < 0) r = "scorecard";
    app.innerHTML = r === "scorecard" ? scorecard() : r === "sites" ? sitesView() : clientView();
    document.querySelectorAll("#nav a").forEach(function (a) { var on = a.getAttribute("data-r") === r; a.className = on ? "on" : ""; if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    document.title = "Link Engine prototype: " + r;
    bind(r);
  }
  function bind(r) {
    if (r === "scorecard") {
      app.querySelectorAll("tr.click").forEach(function (tr) {
        function go() { var id = tr.getAttribute("data-tac"); st.selTactic = st.selTactic === id ? null : id; render(); var d = document.getElementById("detail"); if (d) d.scrollIntoView({ block: "nearest" }); }
        tr.addEventListener("click", go);
        tr.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
      });
      var c = document.getElementById("close"); if (c) c.addEventListener("click", function () { st.selTactic = null; render(); });
    } else if (r === "sites") {
      document.getElementById("fstatus").addEventListener("change", function (e) { st.status = e.target.value; render(); });
      document.getElementById("ftactic").addEventListener("change", function (e) { st.tactic = e.target.value; render(); });
      document.getElementById("reset").addEventListener("click", function () { st.status = "all"; st.tactic = "all"; render(); });
    } else {
      document.getElementById("cfilter").addEventListener("change", function (e) { st.ctac = e.target.value; render(); });
    }
  }
  window.addEventListener("hashchange", render);
  render();
})();
