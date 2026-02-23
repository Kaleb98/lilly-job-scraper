const https = require("https");

module.exports = async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/plain");

  const postData = JSON.stringify({
    refNum: "LILLUS",
    lang: "en_us",
    siteType: "external",
    size: 20,
    from: 0,
    multiFields: [],
    facets: {}
  });

  const options = {
    hostname: "careers.lilly.com",
    path: "/api/jobs",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Content-Length": Buffer.byteLength(postData),
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Referer": "https://careers.lilly.com/us/en/search-results",
      "Origin": "https://careers.lilly.com",
      "x-ph-refnum": "LILLUS",
      "x-ph-sitevariant": "external",
      "x-ph-locale": "en_us"
    }
  };

  try {
    const data = await new Promise((resolve, reject) => {
      const r = https.request(options, (res2) => {
        let body = "";
        res2.on("data", (chunk) => (body += chunk));
        res2.on("end", () => resolve(`STATUS:${res2.statusCode}\n${body}`));
      });
      r.on("error", reject);
      r.write(postData);
      r.end();
    });

    res.send(data || "empty");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
