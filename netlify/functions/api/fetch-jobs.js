const https = require("https");

exports.handler = async function (event) {
  const url = "https://careers.lilly.com/us/en/sitemap.xml";

  try {
    const data = await new Promise((resolve, reject) => {
      https.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
        }
      }, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve(body));
      }).on("error", reject);
    });

    // Parse job URLs and last modified dates from sitemap
    const jobMatches = [...data.matchAll(/<loc>(.*?)<\/loc>[\s\S]*?<lastmod>(.*?)<\/lastmod>/g)];

    const jobs = jobMatches
      .filter(m => m[1].includes("/job/"))
      .map(m => {
        const url = m[1];
        const lastmod = m[2];
        // Extract job title from URL slug
        const slug = url.split("/job/")[1] || "";
        const title = slug.replace(/-/g, " ").replace(/\d+\/?$/, "").trim();
        return {
          title: title || "Lilly Job",
          canonicalPositionUrl: url,
          postedDate: lastmod,
          city: "United States",
          state: "US",
          department: "N/A",
        };
      });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jobs }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
