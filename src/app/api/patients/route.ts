import { NextResponse } from "next/server";

import { getMysqlPool } from "@/lib/mysql";
import { fetchPatientList, normalizePatientPayload } from "@/lib/patient";

export async function GET() {
  const patients = await fetchPatientList();
  return NextResponse.json({ patients });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = normalizePatientPayload(body);
    const pool = getMysqlPool();

    const [result] = await pool.execute(
      `
        INSERT INTO patient (
          hoscode,
          pid,
          hn,
          an,
          admit_date,
          admit_time,
          pre_name,
          first_name,
          last_name,
          gender,
          birth_date,
          phone_number,
          district,
          province,
          blood_type,
          discharge_date,
          discharge_time,
          discharge_type,
          discharge_note
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      ]
    );

    return NextResponse.json({ ok: true, result }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create patient";

    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
