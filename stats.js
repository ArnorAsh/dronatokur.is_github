/* Sækir heimsóknartölur úr Supabase og birtir á stats.html. */

const STATS_SUPABASE_URL = "https://klpyevbowxggowsjxpvv.supabase.co";
const STATS_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscHlldmJvd3hnZ293c2p4cHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1OTQ3ODcsImV4cCI6MjA5NDE3MDc4N30.QWgEP0ohm99H4S-guYpo1mpb_aLwjvlaG18Lb46DlbQ";

function setStatsError(message) {
  const loading = document.getElementById("loading");
  const errorBox = document.getElementById("error");

  loading.style.display = "none";
  errorBox.textContent = message;
  errorBox.style.display = "block";
}

async function loadStats() {
  const loading = document.getElementById("loading");

  if (!window.supabase) {
    setStatsError("Supabase hlóðst ekki inn. Prófaðu að endurhlaða síðuna.");
    return;
  }

  const supabaseClient = window.supabase.createClient(
    STATS_SUPABASE_URL,
    STATS_SUPABASE_ANON_KEY
  );

  const { data, error } = await supabaseClient.rpc("get_visit_stats");

  loading.style.display = "none";

  if (error) {
    console.error("Villa við að sækja tölfræði:", error);
    setStatsError("Villa kom upp við að sækja tölurnar.");
    return;
  }

  const stats = Array.isArray(data) ? data[0] : data;

  if (!stats) {
    setStatsError("Engar tölur fundust.");
    return;
  }

  document.getElementById("last30").textContent = stats.last_30_days ?? 0;
  document.getElementById("allTime").textContent = stats.all_time ?? 0;
}

document.addEventListener("DOMContentLoaded", loadStats);
