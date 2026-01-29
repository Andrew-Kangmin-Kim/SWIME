// === CONFIG ===
const API_BASE = "http://localhost:3000";

// Explicitly blocked hosts (high-confidence distractions)
const BLOCKED_HOSTS = new Set([
  "instagram.com",
  "www.instagram.com",
  "tiktok.com",
  "www.tiktok.com",
  "twitter.com",
  "www.twitter.com",
  "x.com",
  "www.x.com",
  "reddit.com",
  "www.reddit.com",
  "twitch.tv",
  "www.twitch.tv",
  "facebook.com",
  "www.facebook.com",
  "netflix.com",
  "www.netflix.com"
]);

// Keyword-based blocking (cheap NLP)
const BLOCKED_KEYWORDS = [
  "game",
  "games",
  "gaming",
  "casino",
  "slots",
  "bet",
  "porn",
  "nsfw",
  "shopping",
  "deal",
  "sale",
  "news",
  "trending",
  "reels",
  "shorts",
  "explore",
  "feed"
];

// === HELPERS ===
function getUrlInfo(url) {
  try {
    const u = new URL(url);
    return {
      host: u.host.toLowerCase(),
      full: url.toLowerCase()
    };
  } catch {
    return null;
  }
}

async function getSessionId() {
  const data = await chrome.storage.local.get(["sessionId"]);
  return data.sessionId ?? null;
}

async function failSession(reason) {
  const sessionId = await getSessionId();
  if (!sessionId) return;

  fetch(`${API_BASE}/session/event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      eventType: reason
    })
  }).catch(() => {});
}

function isBlockedSite(url) {
  const info = getUrlInfo(url);
  if (!info) return false;

  // Rule 1: explicit host block
  if (BLOCKED_HOSTS.has(info.host)) {
    return true;
  }

  // Rule 2: keyword-based blocking
  for (const kw of BLOCKED_KEYWORDS) {
    if (info.full.includes(kw)) {
      return true;
    }
  }

  return false;
}

// === TAB MONITORING ===

// Fired when user switches tabs
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId);
  if (!tab?.url) return;

  if (isBlockedSite(tab.url)) {
    failSession("TAB_VIOLATION");
  }
});

// Fired when URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.url) return;

  if (isBlockedSite(changeInfo.url)) {
    failSession("TAB_VIOLATION");
  }
});