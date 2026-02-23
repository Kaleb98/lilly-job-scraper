const https = require("https");

module.exports = async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const url = "https://careers.lilly.com/us/en/search-results?format=json";

  // Try their job feed via the refNum we found (LILLUS)
  const feedUrl = "https://content-us.phenompeople.com/api/content-delivery/caasContentV1?refNum=LILLUS&lang=en_us&blob=jobwidgetsettings";

  try {
    const data = await new Promise((resolve, reject) => {
      https.get(feedUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json",
        }
      }, (r) => {
        let body = "";
        r.on("data", (chunk) => (body += chunk));
        r.on("end", () => resolve(body));
      }).on("error", reject);
    });

    res.send(data || JSON.stringify({ jobs: [] }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
