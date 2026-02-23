const HOURS_LIMIT = 24;
const PROXY_URL = "https://lilly-job-scraper.vercel.app/api/fetch-jobs";

function isWithinLimit(dateString) {
  if (!dateString) return true; // include if no date
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
    container.innerHTML = `<div class="no-results">No jobs found in the last 7 days.</div>`;
    return;
  }
  const rows = jobs.map((job) => `
    <tr>
      <td><a href="${job.url}" target="_blank">${job.title}</a></td>
      <td>${job.location || "N/A"}</td>
      <td>${job.source || "N/A"}</td>
      <td>${job.posted ? new Date(job.posted).toLocaleDateString() : "N/A"}</td>
    </tr>`).join("");

  container.innerHTML = `
    <div class="results-header">✅ Found <strong>${jobs.length}</strong> job(s)</div>
    <table>
      <thead><tr><th>Job Title</th><th>Location</th><th>Source</th><th>Posted Date</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

window.runSearch = async function () {
  const btn = document.getElementById("searchBtn");
  btn.disabled = true;
  btn.textContent = "Searching...";
  setStatus("Fetching jobs...");
  document.getElementById("results").innerHTML = "";

  try {
    const response = await fetch(PROXY_URL, { headers: { Accept: "application/json" } });
    const data = await response.json();
    const jobs = data.jobs || [];

    console.log(`Total jobs fetched: ${jobs.length}`);

    const filtered = jobs.filter(job => isWithinLimit(job.posted));

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

