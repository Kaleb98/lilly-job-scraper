const https = require("https");

module.exports = async function (req, res) {
  const url = "https://careers.lilly.com/us/en/rss";

  try {
    const data = await new Promise((resolve, reject) => {
      https.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/rss+xml, application/xml, text/xml",
        }
      }, (r) => {
        let body = "";
        r.on("data", (chunk) => (body += chunk));
        r.on("end", () => resolve(body));
      }).on("error", reject);
    });

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/plain");
    res.send(data || "empty response");

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
