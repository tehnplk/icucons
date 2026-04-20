import type { RowDataPacket } from "mysql2";

import { getMysqlPool } from "@/lib/mysql";

export type CaseRegisterListItem = {
  id: number;
  patient_id: number;
  case_close_id: number | null;
  is_closed: boolean;
  close_date: string | null;
  close_time: string | null;
  close_type: string | null;
  record_date: string | null;
  record_time: string | null;
  status: string;
  priority: string;
  specialty: string | null;
  reason: string | null;
  current_symptoms: string | null;
  initial_diagnosis: string | null;
  clinical_notes: string | null;
  sender_id: string | null;
  last_action: string | null;
  last_active_time: string | null;
  hoscode: string;
  hosname: string | null;
  hn: string;
  an: string;
  pre_name: string;
  first_name: string;
  last_name: string;
};

type CaseRegisterRow = RowDataPacket & CaseRegisterListItem;

export async function fetchCaseRegisterList(): Promise<CaseRegisterListItem[]> {
  const pool = getMysqlPool();
  const [rows] = await pool.query<CaseRegisterRow[]>(`
    SELECT
      c.id,
      c.patient_id,
      cc.id AS case_close_id,
      CASE WHEN cc.id IS NULL THEN FALSE ELSE TRUE END AS is_closed,
      DATE_FORMAT(cc.close_date, '%Y-%m-%d') AS close_date,
      TIME_FORMAT(cc.close_time, '%H:%i') AS close_time,
      cc.close_type,
      DATE_FORMAT(c.record_date, '%Y-%m-%d') AS record_date,
      TIME_FORMAT(c.record_time, '%H:%i') AS record_time,
      c.status,
      c.priority,
      c.specialty,
      c.reason,
      c.current_symptoms,
      c.initial_diagnosis,
      c.clinical_notes,
      c.sender_id,
      c.last_action,
      c.last_active_time,
      p.hoscode,
      h.hosname,
      p.hn,
      p.an,
      p.pre_name,
      p.first_name,
      p.last_name
    FROM case_register c
    JOIN patient p ON p.id = c.patient_id
    LEFT JOIN hospital h ON h.hoscode = p.hoscode
    LEFT JOIN (
      SELECT x.*
      FROM case_close x
      INNER JOIN (
        SELECT patient_id, MAX(id) AS latest_id
        FROM case_close
        GROUP BY patient_id
      ) latest ON latest.latest_id = x.id
    ) cc ON cc.patient_id = c.patient_id
    ORDER BY c.id DESC
  `);

  return rows;
}
