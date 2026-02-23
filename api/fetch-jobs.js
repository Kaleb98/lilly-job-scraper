const https = require("https");

module.exports = async function (req, res) {
  const postData = JSON.stringify({
    "lang": "en_us",
    "orgId": "LILLUS",
    "siteType": "external",
    "facets": {},
    "limit": 50,
    "offset": 0,
    "searchText": ""
  });

  const options = {
    hostname: "careers.lilly.com",
    path: "/widgets/jobs/search",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Content-Length": Buffer.byteLength(postData),
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Referer": "https://careers.lilly.com/us/en/search-results",
      "Origin": "https://careers.lilly.com"
    }
  };

  try {
    const data = await new Promise((resolve, reject) => {
      const req2 = https.request(options, (r) => {
        let body = "";
        r.on("data", (chunk) => (body += chunk));
        r.on("end", () => resolve(body));
      });
      req2.on("error", reject);
      req2.write(postData);
      req2.end();
    });

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/plain");
    res.send(data || "empty response");

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
