import { NextResponse } from "next/server";

import { getMysqlPool } from "@/lib/mysql";
import { normalizePatientPayload } from "@/lib/patient";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function resolveId(context: RouteContext) {
  const { id } = await context.params;
  const patientId = Number(id);

  if (!Number.isInteger(patientId) || patientId <= 0) {
    throw new Error("Invalid patient id");
  }

  return patientId;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const patientId = await resolveId(context);
    const body = await request.json();
    const payload = normalizePatientPayload(body);
    const pool = getMysqlPool();

    const [result] = await pool.execute(
      `
        UPDATE patient
        SET
          hoscode = ?,
          pid = ?,
          hn = ?,
          an = ?,
          admit_date = ?,
          admit_time = ?,
          pre_name = ?,
          first_name = ?,
          last_name = ?,
          gender = ?,
          birth_date = ?,
          phone_number = ?,
          district = ?,
          province = ?,
          blood_type = ?,
          discharge_date = ?,
          discharge_time = ?,
          discharge_type = ?,
          discharge_note = ?
        WHERE id = ?
      `,
      [
        payload.hoscode,
        payload.pid,
        payload.hn,
        payload.an,
        payload.admit_date,
        payload.admit_time,
        payload.pre_name,
        payload.first_name,
        payload.last_name,
        payload.gender,
        payload.birth_date,
        payload.phone_number,
        payload.district,
        payload.province,
        payload.blood_type_id,
        payload.discharge_date,
        payload.discharge_time,
        payload.discharge_type,
        payload.discharge_note,
        patientId,
      ]
    );

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update patient";

    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const patientId = await resolveId(context);
    const pool = getMysqlPool();
    const [result] = await pool.execute(`DELETE FROM patient WHERE id = ?`, [
      patientId,
    ]);

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete patient";

    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
