const https = require("https");

function makeRequest(url, options, postData, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) return reject(new Error("Too many redirects"));

    const req = https.request(url, options, (res) => {
      // Follow redirect
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        const location = res.headers.location;
        resolve(`REDIRECTED TO: ${location}`);
        return;
      }

      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve(`STATUS:${res.statusCode}\n${body}`));
    });

    req.on("error", reject);
    if (postData) req.write(postData);
    req.end();
  });
}

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
    const data = await makeRequest(
      "https://careers.lilly.com/api/jobs",
      options,
      postData
    );

    res.send(data || "empty");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
