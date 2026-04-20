import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";

import { getMysqlPool } from "@/lib/mysql";

export async function GET() {
  const pool = getMysqlPool();

  // Validate connection and show what DB we ended up connected to.
  type DbRow = RowDataPacket & { db: string | null };
  const [rows] = await pool.query<DbRow[]>("SELECT DATABASE() AS db");

  return NextResponse.json({ ok: true, db: rows[0]?.db ?? null });
}
