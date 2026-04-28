const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const globalForPrisma = globalThis;

function logDebug(location, message, data, hypothesisId) {
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
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

let prisma = globalForPrisma.prisma;
let pool = globalForPrisma.prismaPool;

if (!prisma) {
  logDebug(
    "src/config/prisma.js:27",
    "Creating Prisma client",
    {
      nodeEnv: process.env.NODE_ENV || null,
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      hasCachedClient: Boolean(globalForPrisma.prisma),
      hasCachedPool: Boolean(globalForPrisma.prismaPool),
    },
    "H1"
  );

  try {
    pool =
      pool ||
      new Pool({
        connectionString: process.env.DATABASE_URL,
      });

    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
    logDebug(
      "src/config/prisma.js:46",
      "Prisma client created",
      {
        nodeEnv: process.env.NODE_ENV || null,
        hasPool: Boolean(pool),
        adapterName: "PrismaPg",
      },
      "H1"
    );
  } catch (error) {
    logDebug(
      "src/config/prisma.js:58",
      "Prisma client creation failed",
      {
        nodeEnv: process.env.NODE_ENV || null,
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
        errorName: error?.name || null,
        errorMessage: error?.message || null,
      },
      "H1"
    );
    throw error;
  }
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaPool = pool;
}

module.exports = prisma;