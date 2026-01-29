const API_BASE = "http://localhost:3000";

const output = document.getElementById("output");
const userIdInput = document.getElementById("userId");

function log(msg) {
  output.textContent =
    typeof msg === "string" ? msg : JSON.stringify(msg, null, 2);
}

async function setSessionId(sessionId) {
  await chrome.storage.local.set({ sessionId });
}

async function getSessionId() {
  const data = await chrome.storage.local.get(["sessionId"]);
  return data.sessionId ?? null;
}

async function clearSessionId() {
  await chrome.storage.local.remove(["sessionId"]);
}

// === BUTTON ACTIONS ===

document.getElementById("startBtn").onclick = async () => {
  const userId = userIdInput.value.trim();
  if (!userId) {
    log("Please enter a userId.");
    return;
  }

  const res = await fetch(`${API_BASE}/session/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId })
  });

  const data = await res.json();
  if (!res.ok) {
    log(data);
    return;
  }

  await setSessionId(data.sessionId);
  log({ started: true, ...data });
};

document.getElementById("statusBtn").onclick = async () => {
  const sessionId = await getSessionId();
  if (!sessionId) {
    log("No active session.");
    return;
  }

  const res = await fetch(`${API_BASE}/session/${sessionId}`);
  const data = await res.json();
  log(data);
};

document.getElementById("clearBtn").onclick = async () => {
  await clearSessionId();
  log("Session cleared.");
};