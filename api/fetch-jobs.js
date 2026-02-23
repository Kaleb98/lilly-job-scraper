const https = require("https");

module.exports = async function (req, res) {
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

    const jobMatches = [...data.matchAll(/<loc>(.*?)<\/loc>[\s\S]*?<lastmod>(.*?)<\/lastmod>/g)];

    const jobs = jobMatches
      .filter(m => m[1].includes("/job/"))
      .map(m => ({
        title: m[1].split("/job/")[1]?.replace(/-/g, " ").replace(/\d+\/?$/, "").trim() || "Lilly Job",
        canonicalPositionUrl: m[1],
        postedDate: m[2],
        city: "United States",
        state: "US",
        department: "N/A",
      }));

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
