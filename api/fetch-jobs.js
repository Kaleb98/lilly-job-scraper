const https = require("https");

module.exports = async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/plain");

  // Using exact params the API told us it needs
  const feedUrl = "https://content-us.phenompeople.com/api/content-delivery/caasContentV1?refNum=LILLUS&siteType=external&locale=en_us&pageId=page17&blob=jobwidgetsettings";

  try {
    const data = await new Promise((resolve, reject) => {
      https.get(feedUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json",
          "Referer": "https://careers.lilly.com/us/en/search-results"
        }
      }, (r) => {
        let body = "";
        r.on("data", (chunk) => (body += chunk));
        r.on("end", () => resolve(body));
      }).on("error", reject);
    });

    res.send(data || "empty response");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
