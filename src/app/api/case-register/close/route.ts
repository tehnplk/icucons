import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

import { getMysqlPool } from "@/lib/mysql";

type ExistingRow = RowDataPacket & {
  id: number;
  patient_id: number;
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
      `SELECT id, patient_id FROM case_register WHERE id = ? LIMIT 1`,
      [caseRegisterId]
    );

    if (caseRows.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Case register not found" },
        { status: 404 }
      );
    }

    const caseRow = caseRows[0];

    const [closeRows] = await pool.query<ExistingRow[]>(
      `SELECT id, patient_id FROM case_close WHERE patient_id = ? ORDER BY id DESC LIMIT 1`,
      [caseRow.patient_id]
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
          patient_id,
          close_date,
          close_time,
          close_type,
          close_note
        ) VALUES (?, CURDATE(), CURTIME(), ?, ?)
      `,
      [caseRow.patient_id, "Closed from case register", "Closed via datagrid action"]
    );

    await pool.execute(
      `
        UPDATE case_register
        SET
          status = ?,
          last_action = ?,
          last_active_time = ?
        WHERE id = ?
      `,
      ["Discharge", "Case closed", "just now", caseRegisterId]
    );

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

