/*
  Einföld, samþykkisbundin heimsóknartalning fyrir Drónatökur.is.
  - Telur aðeins þegar gestur samþykkir.
  - Telur sama tæki aðeins einu sinni á dag.
  - Sleppir stats.html, svo tölfræðisíðan teljist ekki með.
*/

const SUPABASE_URL = "https://klpyevbowxggowsjxpvv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscHlldmJvd3hnZ293c2p4cHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1OTQ3ODcsImV4cCI6MjA5NDE3MDc4N30.QWgEP0ohm99H4S-guYpo1mpb_aLwjvlaG18Lb46DlbQ";

const ANALYTICS_CONFIG = {
  consentKey: "dronatokur_analytics_consent",
  visitorKey: "dronatokur_visitor_id",
  lastVisitKey: "dronatokur_last_visit_date",
  trackedPages: new Set(["index.html", "about.html", "contact.html"]),
};

function getCurrentPage() {
  const page = window.location.pathname.split("/").pop();
  return page || "index.html";
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function getVisitorId() {
  let visitorId = localStorage.getItem(ANALYTICS_CONFIG.visitorKey);

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(ANALYTICS_CONFIG.visitorKey, visitorId);
  }

  return visitorId;
}

function getSupabaseClient() {
  if (!window.supabase) {
    console.warn("Supabase library was not loaded. Analytics skipped.");
    return null;
  }

  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

async function trackVisit() {
  const consent = localStorage.getItem(ANALYTICS_CONFIG.consentKey);

  if (consent !== "accepted") {
    return;
  }

  const page = getCurrentPage();

  if (!ANALYTICS_CONFIG.trackedPages.has(page)) {
    return;
  }

  const today = getTodayString();
  const lastVisitDate = localStorage.getItem(ANALYTICS_CONFIG.lastVisitKey);

  // Telur sama tæki aðeins einu sinni á dag, svo refresh spammi ekki teljarann.
  if (lastVisitDate === today) {
    return;
  }

  const supabaseClient = getSupabaseClient();

  if (!supabaseClient) {
    return;
  }

  const { error } = await supabaseClient.from("visits").insert({
    page,
    visitor_id: getVisitorId(),
  });

  if (error) {
    console.error("Villa við að skrá heimsókn:", error);
    return;
  }

  localStorage.setItem(ANALYTICS_CONFIG.lastVisitKey, today);
}

function closeCookieBanner(banner) {
  banner.classList.add("cookie-banner--hidden");
  banner.addEventListener("transitionend", () => banner.remove(), { once: true });
}

function createCookieBanner() {
  const consent = localStorage.getItem(ANALYTICS_CONFIG.consentKey);

  if (consent === "accepted") {
    trackVisit();
    return;
  }

  if (consent === "declined") {
    return;
  }

  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-live", "polite");
  banner.setAttribute("aria-label", "Samþykki fyrir heimsóknartölum");

  banner.innerHTML = `
    <p>Við notum einfaldar heimsóknartölur til að sjá fjölda heimsókna.</p>
    <div class="cookie-buttons">
      <button id="accept-analytics" type="button">Samþykkja</button>
      <button id="decline-analytics" type="button">Hafna</button>
    </div>
  `;

  document.body.appendChild(banner);

  document.getElementById("accept-analytics").addEventListener("click", () => {
    localStorage.setItem(ANALYTICS_CONFIG.consentKey, "accepted");
    closeCookieBanner(banner);
    trackVisit();
  });

  document.getElementById("decline-analytics").addEventListener("click", () => {
    localStorage.setItem(ANALYTICS_CONFIG.consentKey, "declined");
    closeCookieBanner(banner);
  });
}

document.addEventListener("DOMContentLoaded", createCookieBanner);
