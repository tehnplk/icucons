import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

import { syncCaseCloseState } from "@/lib/case-workspace";
import { getMysqlPool } from "@/lib/mysql";

type ExistingRow = RowDataPacket & {
  id: number;
};

type ExistingCloseRow = RowDataPacket & {
  id: number;
  case_register_id: number;
};

function readCaseRegisterId(value: unknown) {
  const raw = typeof value === "number" ? value : Number(String(value ?? ""));
  if (!Number.isInteger(raw) || raw <= 0) {
    throw new Error("Invalid case_register_id");
  }

  return raw;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      case_register_id?: number;
    };
    const caseRegisterId = readCaseRegisterId(body.case_register_id);
    const pool = getMysqlPool();

    const [caseRows] = await pool.query<ExistingRow[]>(
      `SELECT id FROM case_register WHERE id = ? LIMIT 1`,
      [caseRegisterId]
    );

    if (caseRows.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Case register not found" },
        { status: 404 }
      );
    }

    const [closeRows] = await pool.query<ExistingCloseRow[]>(
      `SELECT id, case_register_id FROM case_close WHERE case_register_id = ? ORDER BY id DESC LIMIT 1`,
      [caseRegisterId]
    );

    if (closeRows.length > 0) {
      return NextResponse.json({
        ok: true,
        created: false,
        caseCloseId: closeRows[0].id,
      });
    }

    const [insertResult] = await pool.execute<ResultSetHeader>(
      `
        INSERT INTO case_close (
          case_register_id,
          close_date,
          close_time,
          close_type,
          close_note
        ) VALUES (?, CURDATE(), CURTIME(), ?, ?)
      `,
      [caseRegisterId, "Closed from case register", "Closed via datagrid action"]
    );

    await syncCaseCloseState(caseRegisterId, "Case closed");

    return NextResponse.json({
      ok: true,
      created: true,
      caseCloseId: insertResult.insertId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to close case";

    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
