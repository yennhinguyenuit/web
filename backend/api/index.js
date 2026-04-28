// #region agent log
fetch("http://127.0.0.1:7794/ingest/c4d804d9-8e2f-4344-943b-cbfbb576fc1e", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Debug-Session-Id": "33eab5",
  },
  body: JSON.stringify({
    sessionId: "33eab5",
    runId: "initial-debug",
    hypothesisId: "H2",
    location: "api/index.js:2",
    message: "Serverless entry evaluating",
    data: {
      nodeEnv: process.env.NODE_ENV || null,
    },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion

const app = require("../src/app");

// #region agent log
fetch("http://127.0.0.1:7794/ingest/c4d804d9-8e2f-4344-943b-cbfbb576fc1e", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Debug-Session-Id": "33eab5",
  },
  body: JSON.stringify({
    sessionId: "33eab5",
    runId: "initial-debug",
    hypothesisId: "H2",
    location: "api/index.js:21",
    message: "Serverless entry exported app",
    data: {
      appType: typeof app,
    },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion

module.exports = app;
