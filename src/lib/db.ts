import sql from "mssql";

declare global {
  var __veriTracePoolPromise: Promise<sql.ConnectionPool> | undefined;
}

function getEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getDbConfig(): sql.config {
  return {
    user: getEnv("DB_USER"),
    password: getEnv("DB_PASSWORD"),
    server: getEnv("DB_SERVER"),
    port: Number(process.env.DB_PORT ?? 1433),
    database: process.env.DB_NAME ?? "SMIDVS",
    options: {
      encrypt: process.env.DB_ENCRYPT !== "false",
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === "true",
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
    requestTimeout: Number(process.env.DB_REQUEST_TIMEOUT_MS ?? 60000),
    connectionTimeout: Number(process.env.DB_CONNECTION_TIMEOUT_MS ?? 30000),
  };
}

export async function getSqlPool() {
  if (!global.__veriTracePoolPromise) {
    const pool = new sql.ConnectionPool(getDbConfig());
    global.__veriTracePoolPromise = pool.connect();
  }

  return global.__veriTracePoolPromise;
}
