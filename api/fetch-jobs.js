const https = require("https");
const RAPIDAPI_KEY = "263172727bmsh79e63b82c671d3fp1768f8jsn188a4057f8cc";

module.exports = async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const company = req.query?.company || "Eli Lilly";
  const query = encodeURIComponent(`${company} jobs`);

  const options = {
    method: "GET",
    hostname: "jsearch.p.rapidapi.com",
    path: `/search?query=${query}&page=1&num_pages=3&country=us&date_posted=3days`,
    headers: {
      "x-rapidapi-host": "jsearch.p.rapidapi.com",
      "x-rapidapi-key": RAPIDAPI_KEY
    }
  };

  try {
    const data = await new Promise((resolve, reject) => {
      https.request(options, (r) => {
        let body = "";
        r.on("data", (chunk) => (body += chunk));
        r.on("end", () => resolve(body));
      }).on("error", reject).end();
    });

    const parsed = JSON.parse(data);
    const jobs = (parsed.data || []).map(job => ({
      title: job.job_title,
      company: job.employer_name,
      location: `${job.job_city || ""}${job.job_state ? ", " + job.job_state : ""}`,
      url: job.job_apply_link,
      posted: job.job_posted_at_datetime_utc,
      source: job.job_publisher,
      description: job.job_description?.substring(0, 300) + "..."
    }));

    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
