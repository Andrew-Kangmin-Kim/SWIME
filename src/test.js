const { Session, FAIL_REASON } = require("./session/Session");

const session = new Session("user_123");

console.log("Initial status:", session.status);

session.start();
console.log("After start:", session.status);

session.fail(FAIL_REASON.FORFEIT);
console.log(
  "After forfeit:",
  session.status,
  session.failReason
);