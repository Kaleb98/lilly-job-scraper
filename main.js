const HOURS_LIMIT = 24;
const PROXY_URL = "https://candid-moxie-4889e0.netlify.app/.netlify/functions/fetch-jobs";

function isWithin24Hours(dateString) {
  if (!dateString) return false;
  const posted = new Date(dateString);
  const now = new Date();
  return (now - posted) / (1000 * 60 * 60) <= HOURS_LIMIT;
}

function setStatus(msg, isError = false) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.className = `status ${isError ? "error" : "info"}`;
}

function renderResults(jobs) {
  const container = document.getElementById("results");
  if (jobs.length === 0) {
    container.innerHTML = `<div class="no-results">No US jobs found posted in the last 24 hours.</div>`;
    return;
  }
  const rows = jobs.map((job) => `
    <tr>
      <td><a href="${job.canonicalPositionUrl}" target="_blank">${job.title}</a></td>
      <td>${job.city || ""}${job.state ? ", " + job.state : ""}</td>
      <td>${job.department || job.category || "N/A"}</td>
      <td>${job.postedDate ? new Date(job.postedDate).toLocaleDateString() : "N/A"}</td>
    </tr>`).join("");

  container.innerHTML = `
    <div class="results-header">✅ Found <strong>${jobs.length}</strong> US job(s) posted in the last 24 hours</div>
    <table>
      <thead><tr><th>Job Title</th><th>Location</th><th>Department</th><th>Posted Date</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

window.runSearch = async function () {
  const btn = document.getElementById("searchBtn");
  btn.disabled = true;
  btn.textContent = "Searching...";
  setStatus("Fetching all US jobs posted in the last 24 hours...");
  document.getElementById("results").innerHTML = "";

  try {
    const response = await fetch(PROXY_URL, { headers: { Accept: "application/json" } });
    const data = await response.json();
    const jobs = data.jobs || data.data || data.results || [];

    console.log(`Total jobs fetched: ${jobs.length}`);

    const filtered = jobs.filter((job) => {
      const postedDate = job.postedDate || job.postDate || job.datePosted;
      const country = (job.country || job.countryCode || "").toUpperCase();
      const state = job.state || "";
      const isUS = country === "US" || country === "USA" || country === "UNITED STATES" || state.length === 2;
      return isUS && isWithin24Hours(postedDate);
    });

    setStatus(`Search complete. Found ${filtered.length} jobs.`);
    renderResults(filtered);
  } catch (err) {
    console.error(err);
    setStatus(`Error: ${err.message}`, true);
  } finally {
    btn.disabled = false;
    btn.textContent = "Search Jobs";
  }
};
