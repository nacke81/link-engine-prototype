/* FAKE DATA ONLY. example.com domains, invented organisations, 555 numbers. */
(function () {
  var BW = "Brightwater Home Care (fake client)";
  var NM = "Nacke Media (demo)";
  var tactics = [
    { id: "resource-page-ask", tier: "green", status: "running" },
    { id: "competitor-link-gap", tier: "green", status: "running" },
    { id: "gov-vendor-registration", tier: "green", status: "testing" },
    { id: "broken-link-replacement", tier: "green", status: "testing" },
    { id: "listicle-inclusion-ask", tier: "green", status: "testing" },
    { id: "local-sponsorship-chamber-news", tier: "green", status: "not started" }
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
    ["pinecrest-eldercare", "2026-10-20", "email", 45, 0, "sent"], ["pinecrest-eldercare", "2026-10-28", "follow-up", 20, 0, "won"],
    ["lakeside-aging-council", "2026-10-22", "email", 40, 0, "sent"], ["lakeside-aging-council", "2026-11-01", "follow-up", 20, 0, "won"],
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
  var attempts = raw.map(function (r, i) {
    return { id: "A-" + ("00" + (i + 1)).slice(-3), site: r[0], tactic: tacOf[r[0]], client: cliOf[r[0]], date: r[1], action: r[2], minutes: r[3], cash: r[4], outcome: r[5], gate: "card t_demo" + ("00" + (i + 1)).slice(-3) };
  });

  // link: site, page path, anchor, rel, first seen, live now, live at 90 days (null = not yet 90 days old)
  var L = [
    ["pinecrest-eldercare", "/resources/partners", "home care guide", "follow", "2026-10-29", true, true],
    ["lakeside-aging-council", "/links", "Brightwater Home Care", "follow", "2026-11-02", false, false],
    ["valleyview-caregivers", "/resources/guides", "trusted local home care", "follow", "2026-11-04", true, null],
    ["summit-wellness-review", "/best-of/seo-partners", "Nacke Media", "nofollow", "2026-11-11", true, null],
    ["orchard-tech-weekly", "/issues/204", "SEO and web design partner", "follow", "2026-11-13", true, null],
    ["state-vendor-portal", "/vendors/registered", "Nacke Media", "follow", "2026-11-21", true, null],
    ["county-business-list", "/directory/marketing", "Nacke Media", "follow", "2026-11-23", true, null],
    ["goldleaf-living-picks", "/picks/home-care", "Brightwater Home Care", "nofollow", "2026-11-25", true, null]
  ];
  var links = L.map(function (r, i) {
    var cli = cliOf[r[0]];
    return { id: "L-" + ("00" + (i + 1)).slice(-3), site: r[0], tactic: tacOf[r[0]], client: cli, page: "https://" + r[0] + ".example.com" + r[1], target: cli.indexOf("Nacke") === 0 ? "https://nackemedia.example.com/" : "https://brightwater-care.example.com/", anchor: r[2], rel: r[3], first: r[4], live: r[5], live90: r[6] };
  });

  window.DATA = { tactics: tactics, sites: sites, attempts: attempts, links: links, asof: "2026-12-06", client: BW, contact: "555-0142" };
})();
