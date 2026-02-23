const HOURS_LIMIT = 24;
const PROXY_URL = "https://candid-moxie-4889e0.netlify.app/.netlify/functions/fetch-jobs";

function isWithin24Hours(dateString) {
  if (!dateString) return false;
  const posted = new Date(dateString);
  const now = new Date();
  return (now - posted) / (1000 * 60 * 60) <= HOURS_LIMIT;
}

function parseKeywords(input) {
  return input.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean);
}

function jobMatchesKeywords(job, keywords) {
  const searchText = [job.title, job.description, job.department, job.category, job.city, job.state]
    .join(" ").toLowerCase();
  return keywords.some((kw) => searchText.includes(kw));
}

function setStatus(msg, isError = false) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.className = `status ${isError ? "error" : "info"}`;
}

function renderResults(jobs, keywords) {
  const container = document.getElementById("results");
  if (jobs.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        No jobs found matching <strong>${keywords.join(", ")}</strong> posted in the last 24 hours.
      </div>`;
    return;
  }
  const rows = jobs.map((job) => `
    <tr>
      <td><a href="${job.canonicalPositionUrl}" target="_blank">${job.title}</a></td>
      <td>${job.city || ""}${job.state ? ", " + job.state : ""}</td>
      <td>${job.department || job.category || "N/A"}</td>
      <td>${job.postedDate ? new Date(job.postedDate).toLocaleDateString() : "N/A"}</td>
      <td class="keyword-tag">${job.matchedKeyword}</td>
    </tr>`).join("");

  container.innerHTML = `
    <div class="results-header">
      ✅ Found <strong>${jobs.length}</strong> job(s) posted in the last 24 hours
    </div>
    <table>
      <thead>
        <tr>
          <th>Job Title</th><th>Location</th><th>Department</th>
          <th>Posted Date</th><th>Matched Keyword</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

window.runSearch = async function () {
  const keywordInput = document.getElementById("keywords").value;
  const keywords = parseKeywords(keywordInput);

  if (keywords.length === 0) {
    setStatus("Please enter at least one keyword.", true);
    return;
  }

  const btn = document.getElementById("searchBtn");
  btn.disabled = true;
  btn.textContent = "Searching...";
  setStatus(`Fetching jobs for: ${keywords.join(", ")}...`);
  document.getElementById("results").innerHTML = "";

  const matchedJobs = [];

  try {
    for (const kw of keywords) {
      setStatus(`Searching for "${kw}"...`);
      const url = `${PROXY_URL}?q=${encodeURIComponent(kw)}`;
      const response = await fetch(url, { headers: { Accept: "application/json" } });

      if (!response.ok) {
        console.warn(`Request failed for "${kw}": ${response.status}`);
        continue;
      }

      const data = await response.json();
      const jobs = data.jobs || data.data || data.results || [];
      console.log(`Keyword "${kw}": ${jobs.length} raw results`);

      for (const job of jobs) {
        const postedDate = job.postedDate || job.postDate || job.datePosted;
        if (!isWithin24Hours(postedDate)) continue;
        if (!jobMatchesKeywords(job, [kw])) continue;
        if (matchedJobs.find((j) => j.jobId === job.jobId)) continue;
        matchedJobs.push({ ...job, matchedKeyword: kw, postedDate });
      }

      await new Promise((r) => setTimeout(r, 800));
    }

    setStatus(`Search complete. Scanned ${keywords.length} keyword(s).`);
    renderResults(matchedJobs, keywords);
  } catch (err) {
    console.error(err);
    setStatus(`Error: ${err.message}`, true);
  } finally {
    btn.disabled = false;
    btn.textContent = "Search Jobs";
  }
};
