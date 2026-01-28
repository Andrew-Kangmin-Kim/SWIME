const express = require("express");
const { Session, FAIL_REASON } = require("./session/Session");

const app = express();
app.use(express.json());

// In-memory session store (Phase 0 only)
const sessions = new Map();

/**
 * Start a new session
 */
app.post("/session/start", (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "userId required" });
  }

  const session = new Session(userId);
  session.start();

  sessions.set(session.id, session);

  res.json({
    sessionId: session.id,
    status: session.status,
  });
});

/**
 * Voluntary forfeit
 */
app.post("/session/forfeit", (req, res) => {
  const { sessionId } = req.body;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  session.fail(FAIL_REASON.FORFEIT);

  res.json({
    status: session.status,
    failReason: session.failReason,
  });
});

/**
 * Health check
 */
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`SWIME backend running on port ${PORT}`);
});