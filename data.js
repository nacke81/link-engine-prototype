/* FAKE DATA ONLY. example.com domains, invented organisations, 555 numbers. */
(function () {
  var BW = "Brightwater Home Care (fake client)";
  var NM = "Harborline Studio (demo)";
  var tactics = [
    { id: "resource-page-ask", title: "Resource page ask", tier: "green", status: "running",
      desc: "The resource-page ask: find a Site whose existing resources or links page already curates outside links for the client's audience, and ask the person who maintains it to add one link to one live client page that genuinely belongs on that list. A Site says yes because the client page makes its list better for the people the list serves." },
    { id: "competitor-link-gap", title: "Competitor link gap", tier: "green", status: "running",
      desc: "Competitor link gap: find Sites that already link to one or more competitors but not to us, work out why each Site linked, and pitch the same kind of value from our own pages. A Site says yes because it has already shown it links to this kind of resource; we are not creating demand, we are answering it." },
    { id: "gov-vendor-registration", title: "Government vendor registration", tier: "green", status: "testing",
      desc: "Government vendor registration: register the business in the free public registries governments run for suppliers (SAM.gov federally, the SBA small business search via the small-business self-certification, and each state's vendor portal), so a profile carrying the business name and website lives on a .gov domain. The registry says yes because the listing is what it exists for; no pitch is needed." },
    { id: "broken-link-replacement", title: "Broken link replacement", tier: "green", status: "testing",
      desc: "Broken-link replacement: find a dead page that still carries live Links, publish a genuinely useful replacement, and ask each linking Site to update the link. The Site says yes because its page is currently sending readers to a 404 and we hand it the fix." },
    { id: "listicle-inclusion-ask", title: "Listicle inclusion ask", tier: "green", status: "testing",
      desc: "Listicle inclusion ask: find \"best tools\" or \"best options\" listicles that recommend two or more competitors and leave us out, show the author the exact gap, and hand them an edit-ready addition. The Site says yes because the author has already decided to cover the category and we make the list better, not longer for its own sake." },
    { id: "local-sponsorship-chamber-news", title: "Local sponsorship and chamber news", tier: "green", status: "not started",
      desc: "Local sponsorship, local news and chamber activity: the local bundle. Sponsor things the client would sponsor even without a link (youth sports, school events), treat one well-run client event as a multi-asset campaign (calendar listing, local news mention, partner-org links, GBP photos), and hold chamber or association membership for the trust and NAP signal rather than link equity. These Sites say yes because the relationship is real: the link is a byproduct of showing up locally." }
  ];
  // site: id, name, type, tactic, status, price, client, retry, note
  var sites = [
    ["pinecrest-eldercare", "Pinecrest Elder Care Network", "resource-page", "resource-page-ask", "won", null, BW, null, "Link verified."],
    ["lakeside-aging-council", "Lakeside Aging Council", "association", "resource-page-ask", "won", null, BW, null, "Link verified. Later lost on recheck."],
    ["valleyview-caregivers", "Valleyview Caregivers Guild", "resource-page", "resource-page-ask", "won", null, BW, null, "Link verified."],
    ["northgate-seniors-guide", "Northgate Seniors Guide", "directory", "resource-page-ask", "dead", null, BW, "2027-03-20", "Declined. Kept so nobody asks again too soon."],
    ["maple-court-living", "Maple Court Living Blog", "blog", "resource-page-ask", "open", null, BW, null, "Outreach in flight."],
    ["riverbend-family-hub", "Riverbend Family Hub", "resource-page", "resource-page-ask", "do-not-contact", null, BW, null, "Asked us to stop. Never contact again."],
    ["summit-wellness-review", "Summit Wellness Review", "listicle", "competitor-link-gap", "won", null, NM, null, "Link verified."],
    ["orchard-tech-weekly", "Orchard Tech Weekly", "news", "competitor-link-gap", "won", null, NM, null, "Link verified."],
    ["brightpath-startups", "BrightPath Startup Digest", "blog", "competitor-link-gap", "dead", null, NM, "2027-02-25", "Declined. Kept so nobody asks again too soon."],
    ["cedar-ridge-marketing", "Cedar Ridge Marketing Notes", "blog", "competitor-link-gap", "open", null, NM, null, "Outreach in flight."],
    ["state-vendor-portal", "State Vendor Registry (demo)", "gov", "gov-vendor-registration", "won", null, NM, null, "Registration page links to us."],
    ["county-business-list", "County Business Directory (demo)", "gov", "gov-vendor-registration", "won", null, NM, null, "Listing links to us."],
    ["city-procurement-hub", "City Procurement Hub (demo)", "gov", "gov-vendor-registration", "open", null, NM, null, "Form submitted, waiting."],
    ["elmwood-careguide", "Elmwood Care Guide", "resource-page", "broken-link-replacement", "dead", null, BW, "2027-02-10", "Replied: page retired. Kept."],
    ["tidewater-health-links", "Tidewater Health Links", "resource-page", "broken-link-replacement", "open", null, BW, null, "Outreach in flight."],
    ["harbor-senior-roundup", "Harbor Senior Roundup", "listicle", "listicle-inclusion-ask", "dead", 150, BW, "2027-04-01", "Wanted $150, we declined. Kept."],
    ["goldleaf-living-picks", "Goldleaf Living Picks", "listicle", "listicle-inclusion-ask", "won", 120, BW, null, "Paid $120, Link verified."],
    ["westfield-chamber-news", "Westfield Chamber News", "sponsor", "local-sponsorship-chamber-news", "open", 250, BW, null, "Quote $250, waiting on approval."]
  ].map(function (r) {
    return { id: r[0], domain: r[0] + ".example.com", name: r[1], type: r[2], tactic: r[3], status: r[4], price: r[5], client: r[6], retry: r[7], note: r[8] };
  });

  // attempt: site, date, action, minutes, cash, outcome
  var raw = [
    ["pinecrest-eldercare", "2026-07-12", "email", 45, 0, "sent"], ["pinecrest-eldercare", "2026-07-20", "follow-up", 20, 0, "won"],
    ["lakeside-aging-council", "2026-07-14", "email", 40, 0, "sent"], ["lakeside-aging-council", "2026-07-24", "follow-up", 20, 0, "won"],
    ["valleyview-caregivers", "2026-10-25", "email", 35, 0, "sent"], ["valleyview-caregivers", "2026-11-03", "follow-up", 15, 0, "won"],
    ["northgate-seniors-guide", "2026-10-27", "email", 40, 0, "sent"], ["northgate-seniors-guide", "2026-11-05", "follow-up", 15, 0, "declined"],
    ["maple-court-living", "2026-12-01", "email", 50, 0, "sent"],
    ["riverbend-family-hub", "2026-10-30", "email", 30, 0, "sent"], ["riverbend-family-hub", "2026-11-09", "follow-up", 10, 0, "declined"],
    ["summit-wellness-review", "2026-11-02", "email", 60, 0, "sent"], ["summit-wellness-review", "2026-11-10", "follow-up", 20, 0, "won"],
    ["orchard-tech-weekly", "2026-11-04", "email", 55, 0, "sent"], ["orchard-tech-weekly", "2026-11-12", "follow-up", 15, 0, "won"],
    ["brightpath-startups", "2026-11-06", "email", 50, 0, "sent"], ["brightpath-startups", "2026-11-15", "follow-up", 15, 0, "declined"],
    ["cedar-ridge-marketing", "2026-12-03", "email", 45, 0, "sent"],
    ["state-vendor-portal", "2026-11-08", "form", 90, 0, "sent"], ["state-vendor-portal", "2026-11-20", "follow-up", 30, 0, "won"],
    ["county-business-list", "2026-11-09", "form", 75, 0, "sent"], ["county-business-list", "2026-11-22", "follow-up", 25, 0, "won"],
    ["city-procurement-hub", "2026-12-02", "form", 120, 0, "sent"],
    ["elmwood-careguide", "2026-11-11", "email", 55, 0, "sent"], ["elmwood-careguide", "2026-11-19", "follow-up", 15, 0, "replied"],
    ["tidewater-health-links", "2026-12-04", "email", 50, 0, "sent"],
    ["harbor-senior-roundup", "2026-11-13", "email", 40, 0, "sent"], ["harbor-senior-roundup", "2026-11-21", "payment", 10, 0, "declined"],
    ["goldleaf-living-picks", "2026-11-14", "email", 40, 0, "sent"], ["goldleaf-living-picks", "2026-11-24", "payment", 15, 120, "won"],
    ["westfield-chamber-news", "2026-12-05", "email", 45, 0, "sent"]
  ];
  var tacOf = {}, cliOf = {};
  sites.forEach(function (s) { tacOf[s.id] = s.tactic; cliOf[s.id] = s.client; });
  raw = raw.slice().sort(function (a, b) { return a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0; });
  var attempts = raw.map(function (r, i) {
    return { id: "A-" + ("00" + (i + 1)).slice(-3), site: r[0], tactic: tacOf[r[0]], client: cliOf[r[0]], date: r[1], action: r[2], minutes: r[3], cash: r[4], outcome: r[5], gate: "card t_demo" + ("00" + (i + 1)).slice(-3) };
  });

  // Site authority (DataForSEO rank, 0 to 1000) and spam score for the Sites in the database
  var siteMeta = {
    "pinecrest-eldercare": [412, 3], "lakeside-aging-council": [338, 5], "valleyview-caregivers": [221, 9], "goldleaf-living-picks": [186, 31],
    "summit-wellness-review": [297, 12], "orchard-tech-weekly": [455, 4], "state-vendor-portal": [538, 1], "county-business-list": [361, 2]
  };
  // Sites that linked without an Attempt (found by the script): name, domain slug, authority, spam score, linking page path
  var found = [
    ["Maplewood Community Guide", "maplewood-guide", 244, 6, "/partners"], ["Eastside Neighbors Directory", "eastside-neighbors", 171, 14, "/local/services"],
    ["Cobalt Valley Gazette", "cobalt-valley-gazette", 389, 3, "/business/2026/11/new-in-town"], ["Fernhill Chamber Members", "fernhill-chamber", 267, 2, "/members"],
    ["Quickrank Link Hub", "quickrank-hub", 58, 68, "/links/page-14"], ["Bayline Family Blog", "bayline-family", 142, 18, "/2026/10/helpful-sites"],
    ["Oakridge Library Resources", "oakridge-library", 503, 1, "/resources/community"], ["Sunrise Parents Forum", "sunrise-parents", 96, 27, "/threads/recommended"],
    ["Pioneer Business Review", "pioneer-review", 318, 7, "/best/local-services"], ["Lantern Hills Rotary Club", "lantern-hills-club", 207, 4, "/sponsors"],
    ["Metro Deal Finder", "metro-deal-finder", 33, 74, "/coupons/misc"], ["Greenfield Gardeners", "greenfield-gardeners", 129, 11, "/links"],
    ["Harbor Point News", "harbor-point-news", 441, 5, "/community/briefs"], ["Willow Creek Wellness", "willow-creek-wellness", 184, 16, "/resources"],
    ["Northshore Home Pros", "northshore-pros", 152, 22, "/recommended"], ["Cityscape Startups Weekly", "cityscape-startups", 276, 9, "/issues/188"],
    ["Birchwood Senior Center", "birchwood-center", 349, 3, "/community-links"], ["PromoBlast Directory", "promoblast", 41, 61, "/dir/business"],
    ["Redwood Tech Notes", "redwood-tech-notes", 233, 8, "/2026/09/tools-we-like"], ["Meadowlark Co-op", "meadowlark-coop", 164, 5, "/our-partners"],
    ["Stonebridge Neighborhood News", "stonebridge-news", 398, 6, "/local-business"], ["Lakeshore Makers Guild", "lakeshore-makers", 24, 12, "/members/list"]
  ];

  // Client pages. Each Link: [Site (id or index into found), class, rel, first seen, live, linking page authority].
  // Anchor text is built from the class in app.js, so class and words always agree.
  var pages = [
    { id: "bw-home", client: "bw", path: "/", type: "home", phrase: "home care Lakeview", ur: [14, 19, 25, 31, 34], top3: [88, 9, 3],
      links: [["lakeside-aging-council", "brand", "follow", "2026-07-25", 0, 168], [0, "brand", "follow", "2026-08-03", 1, 120], [3, "website-name-com", "follow", "2026-08-19", 1, 210],
        [6, "brand", "follow", "2026-09-02", 1, 322], [9, "brand-plus-keyword", "nofollow", "2026-09-11", 1, 74], [12, "full-url", "follow", "2026-09-30", 1, 240],
        [13, "generic", "follow", "2026-10-05", 1, 61], [16, "url-no-http", "follow", "2026-10-14", 1, 188], [17, "empty", "nofollow", "2026-10-22", 1, 0],
        [19, "website-name-com", "follow", "2026-10-29", 1, 96], [20, "brand", "follow", "2026-11-04", 1, 143], [4, "exact-match", "follow", "2026-11-09", 1, 0]] },
    { id: "bw-care", client: "bw", path: "/services/in-home-care", type: "inner", phrase: "in-home care Lakeview", ur: [6, 11, 17, 24], top3: [55, 30, 15],
      links: [["pinecrest-eldercare", "keyword-plus", "follow", "2026-07-21", 1, 207], [2, "brand", "follow", "2026-08-08", 1, 150], [5, "partial-keyword", "follow", "2026-08-27", 1, 118],
        ["goldleaf-living-picks", "brand-plus-keyword", "nofollow", "2026-09-04", 1, 133], [7, "home-url", "follow", "2026-09-17", 1, 54], [8, "exact-match", "follow", "2026-09-26", 1, 176],
        [10, "website-name-com", "follow", "2026-10-07", 1, 87], [14, "full-url", "follow", "2026-10-18", 1, 112], [15, "url-no-http", "follow", "2026-10-30", 1, 201],
        [18, "brand", "follow", "2026-11-06", 1, 0], [21, "empty", "nofollow", "2026-11-12", 1, 0], [11, "generic", "follow", "2026-11-14", 0, 69]] },
    { id: "bw-guide", client: "bw", path: "/blog/choosing-a-caregiver", type: "inner", phrase: "how to choose a caregiver", ur: [9, 13], top3: [62, 28, 10],
      links: [["valleyview-caregivers", "brand", "follow", "2026-11-04", 1, 134], [3, "generic", "follow", "2026-11-08", 1, 77], [16, "keyword-plus", "follow", "2026-11-11", 1, 160], [9, "brand", "nofollow", "2026-11-13", 1, 49]] },
    { id: "hs-home", client: "hs", path: "/", type: "home", phrase: "web design studio Harborline", ur: [21, 29, 38, 44], top3: [85, 11, 4],
      links: [["summit-wellness-review", "brand", "nofollow", "2026-11-11", 1, 260], ["state-vendor-portal", "brand", "follow", "2026-11-21", 1, 380], ["county-business-list", "website-name-com", "follow", "2026-11-23", 1, 291],
        [2, "brand", "follow", "2026-09-06", 1, 233], [6, "full-url", "follow", "2026-09-22", 1, 340], [8, "url-no-http", "follow", "2026-10-03", 1, 122], [15, "website-name-com", "follow", "2026-10-16", 1, 199],
        [18, "generic", "follow", "2026-10-25", 1, 40], [11, "empty", "nofollow", "2026-11-02", 1, 0], [13, "brand-plus-keyword", "follow", "2026-11-07", 1, 105]] },
    { id: "hs-seo", client: "hs", path: "/services/seo", type: "inner", phrase: "seo services Harborline", ur: [5, 12, 18, 23, 27], top3: [58, 29, 13],
      links: [["orchard-tech-weekly", "brand", "follow", "2026-11-13", 1, 335], [0, "keyword-plus", "follow", "2026-08-02", 1, 148], [1, "brand", "follow", "2026-08-21", 1, 212], [4, "partial-keyword", "follow", "2026-09-09", 1, 0],
        [5, "full-url", "follow", "2026-09-19", 1, 92], [7, "website-name-com", "follow", "2026-10-02", 1, 120], [9, "home-url", "follow", "2026-10-11", 1, 158], [12, "exact-match", "follow", "2026-10-20", 1, 99],
        [14, "brand-plus-keyword", "nofollow", "2026-10-28", 1, 71], [17, "url-no-http", "follow", "2026-11-05", 1, 83], [19, "generic", "follow", "2026-11-09", 1, 66], [20, "empty", "nofollow", "2026-11-12", 1, 0]] },
    { id: "hs-blog", client: "hs", path: "/blog/local-seo-checklist", type: "inner", phrase: "local seo checklist", ur: [7, 10], top3: [60, 27, 13],
      links: [[6, "brand", "follow", "2026-11-03", 1, 205], [18, "generic", "follow", "2026-11-10", 1, 38], [13, "partial-keyword", "follow", "2026-11-12", 1, 91]] }
  ];

  var clients = [
    { id: "bw", name: BW, short: "Brightwater Home Care", brand: "Brightwater Home Care", domain: "brightwater-care.example.com", da: [41, 43, 42, 44, 43, 46, 47, 51, 54, 57, 62, 66] },
    { id: "hs", name: NM, short: "Harborline Studio", brand: "Harborline Studio", domain: "harborline-studio.example.com", da: [96, 98, 97, 99, 101, 100, 104, 109, 112, 118, 121, 126] }
  ];
  var cname = {}, cdom = {};
  clients.forEach(function (c) { cname[c.id] = c.name; cdom[c.id] = c.domain; });

  var links = [], n = 0, siteById = {};
  sites.forEach(function (s) { siteById[s.id] = s; });
  var live90 = { "pinecrest-eldercare": true, "lakeside-aging-council": false };
  var oldPath = { "pinecrest-eldercare": "/resources/partners", "lakeside-aging-council": "/links", "valleyview-caregivers": "/resources/guides", "summit-wellness-review": "/best-of/seo-partners",
    "orchard-tech-weekly": "/issues/204", "state-vendor-portal": "/vendors/registered", "county-business-list": "/directory/marketing", "goldleaf-living-picks": "/picks/home-care" };
  pages.forEach(function (p) {
    p.links = p.links.map(function (r) {
      n++;
      var sid, name, dom, da, spam, path, tac = null;
      if (typeof r[0] === "string") {
        var s = siteById[r[0]]; sid = s.id; name = s.name; dom = s.domain; da = siteMeta[sid][0]; spam = siteMeta[sid][1]; path = oldPath[sid]; tac = s.tactic;
      } else {
        var f = found[r[0]]; sid = f[1]; name = f[0]; dom = f[1] + ".example.com"; da = f[2]; spam = f[3]; path = f[4];
      }
      return { id: "L-" + ("00" + n).slice(-3), page: p.id, client: cname[p.client], clientId: p.client, site: sid, siteName: name, domain: dom, da: da, spam: spam, tactic: tac,
        url: "https://" + dom + path, cls: r[1], ai: r[1], rel: r[2], first: r[3], live: !!r[4], pa: r[5],
        live90: tac === null ? null : (live90.hasOwnProperty(sid) ? live90[sid] : null) };
    });
    p.url = cdom[p.client] + p.path;
    links = links.concat(p.links);
  });
  // The AI guess is wrong on a few Links, so a person has something real to fix.
  var aiWrong = { "L-005": "partial-keyword", "L-014": "generic", "L-027": "partial-keyword", "L-040": "exact-match" };
  links.forEach(function (l) { if (aiWrong[l.id]) l.ai = aiWrong[l.id]; });

  window.DATA = { tactics: tactics, sites: sites, attempts: attempts, links: links, pages: pages, clients: clients, asof: "2026-12-06", client: BW, contact: "555-0142",
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], backfill: 6 };
})();
