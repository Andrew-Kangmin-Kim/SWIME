const { v4: uuidv4 } = require("uuid");

const SESSION_STATUS = {
  CREATED: "CREATED",
  ACTIVE: "ACTIVE",
  FAILED: "FAILED",
  SUCCESS: "SUCCESS",
};

const FAIL_REASON = {
  FORFEIT: "FORFEIT",
  TAB_VIOLATION: "TAB_VIOLATION",
  POPUP_MISSED: "POPUP_MISSED",
};

class Session {
  constructor(userId) {
    this.id = uuidv4();
    this.userId = userId;

    this.status = SESSION_STATUS.CREATED;
    this.failReason = null;

    this.startTime = null;
    this.endTime = null;

    this.durationSeconds = 60 * 60; // 60 minutes
  }

  start() {
    if (this.status !== SESSION_STATUS.CREATED) {
      throw new Error("Session cannot be started");
    }

    this.status = SESSION_STATUS.ACTIVE;
    this.startTime = Date.now();
  }

  fail(reason) {
    if (this.status !== SESSION_STATUS.ACTIVE) {
      return;
    }

    this.status = SESSION_STATUS.FAILED;
    this.failReason = reason;
    this.endTime = Date.now();
  }

  succeed() {
    if (this.status !== SESSION_STATUS.ACTIVE) {
      return;
    }

    this.status = SESSION_STATUS.SUCCESS;
    this.endTime = Date.now();
  }

  checkTimeout() {
    if (this.status !== SESSION_STATUS.ACTIVE) {
      return;
    }

    const elapsedSeconds =
      (Date.now() - this.startTime) / 1000;

    if (elapsedSeconds >= this.durationSeconds) {
      this.succeed();
    }
  }
}

module.exports = {
  Session,
  SESSION_STATUS,
  FAIL_REASON,
};