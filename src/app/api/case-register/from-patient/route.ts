import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

import { getMysqlPool } from "@/lib/mysql";

type ExistingCaseRow = RowDataPacket & {
  id: number;
};

function readPatientId(value: unknown) {
  const raw = typeof value === "number" ? value : Number(String(value ?? ""));
  if (!Number.isInteger(raw) || raw <= 0) {
    throw new Error("Invalid patient_id");
  }

  return raw;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { patient_id?: number };
    const patientId = readPatientId(body.patient_id);
    const pool = getMysqlPool();

    const [patientRows] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM patient WHERE id = ? LIMIT 1`,
      [patientId]
    );

    if (patientRows.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Patient not found" },
        { status: 404 }
      );
    }

    const [existingRows] = await pool.query<ExistingCaseRow[]>(
      `SELECT id FROM case_register WHERE patient_id = ? LIMIT 1`,
      [patientId]
    );

    if (existingRows.length > 0) {
      return NextResponse.json({
        ok: true,
        created: false,
        caseRegisterId: existingRows[0].id,
      });
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `
        INSERT INTO case_register (
          patient_id,
          record_date,
          record_time,
          status,
          priority,
          specialty,
          reason,
          current_symptoms,
          initial_diagnosis,
          clinical_notes,
          sender_id,
          last_action,
          last_active_time
        ) VALUES (?, CURDATE(), CURTIME(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        patientId,
        "Pending",
        "Urgency",
        null,
        "for proper management",
        null,
        null,
        null,
        null,
        "Case sent from patient register",
        "just now",
      ]
    );

    return NextResponse.json({
      ok: true,
      created: true,
      caseRegisterId: result.insertId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to send case";

    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}

