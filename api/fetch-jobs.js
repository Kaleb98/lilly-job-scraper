const https = require("https");

module.exports = async function (req, res) {
  // Try the job-specific sitemap
  const url = "https://careers.lilly.com/us/en/sitemap.xml";

  try {
    const data = await new Promise((resolve, reject) => {
      https.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml",
          "Accept-Language": "en-US,en;q=0.9",
        }
      }, (r) => {
        let body = "";
        r.on("data", (chunk) => (body += chunk));
        r.on("end", () => resolve(body));
      }).on("error", reject);
    });

    // Return raw sitemap so we can see what's actually in it
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/plain");
    res.send(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
