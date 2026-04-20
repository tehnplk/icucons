import mysql from "mysql2/promise";

declare global {
  var __mysqlPool: mysql.Pool | undefined;
}

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

export function getMysqlPool(): mysql.Pool {
  // In dev, Next.js can reload modules often; keep a single pool on globalThis.
  if (globalThis.__mysqlPool) return globalThis.__mysqlPool;

  const host = requiredEnv("DB_HOST");
  const user = requiredEnv("DB_USER");
  const password = requiredEnv("DB_PASSWORD");
  const database = requiredEnv("DB_NAME");

  const port = Number(process.env.DB_PORT ?? 3306);
  const connectionLimit = Number(process.env.DB_CONNECTION_LIMIT ?? 10);

  globalThis.__mysqlPool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit,
    queueLimit: 0,
  });

  return globalThis.__mysqlPool;
}
