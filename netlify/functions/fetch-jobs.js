const https = require("https");
exports.handler = async function (event) {
  const keyword = event.queryStringParameters?.q || "";
  const url = `https://careers.lilly.com/api/apply/v2/jobs?domain=lilly.com&start=0&num=100&locale=en_US&q=${encodeURIComponent(keyword)}`;
  try {
    const data = await new Promise((resolve, reject) => {
      https.get(url, { headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" } }, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve(body));
      }).on("error", reject);
    });
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: data,
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
