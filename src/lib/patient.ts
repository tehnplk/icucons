import type { RowDataPacket } from "mysql2";

import { getMysqlPool } from "@/lib/mysql";

export type ChoiceOption = {
  id: number;
  name: string;
};

export type HospitalOption = {
  hoscode: string;
  hosname: string;
};

export type PatientListItem = {
  id: number;
  case_register_id: number | null;
  has_case_register: boolean;
  hoscode: string;
  hosname: string | null;
  pid: string;
  hn: string;
  an: string;
  admit_date: string | null;
  admit_time: string | null;
  pre_name: string;
  first_name: string;
  last_name: string;
  gender: string;
  birth_date: string | null;
  phone_number: string | null;
  district: string | null;
  province: string | null;
  blood_type_id: number;
  blood_type: string;
  discharge_date: string | null;
  discharge_time: string | null;
  discharge_type: string | null;
  discharge_note: string | null;
};

export type PatientPayload = {
  hoscode: string;
  pid: string;
  hn: string;
  an: string;
  admit_date: string | null;
  admit_time: string | null;
  pre_name: string;
  first_name: string;
  last_name: string;
  gender: string;
  birth_date: string | null;
  phone_number: string | null;
  district: string | null;
  province: string | null;
  blood_type_id: number;
  discharge_date: string | null;
  discharge_time: string | null;
  discharge_type: string | null;
  discharge_note: string | null;
};

type ChoiceRow = RowDataPacket & ChoiceOption;
type HospitalRow = RowDataPacket & HospitalOption;
type PatientRow = RowDataPacket & PatientListItem;

function readString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function readNullableString(value: unknown): string | null {
  const text = readString(value);
  return text.length > 0 ? text : null;
}

function readNullableDate(value: unknown): string | null {
  const text = readString(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

function readNullableTime(value: unknown): string | null {
  const text = readString(value);
  return /^\d{2}:\d{2}(:\d{2})?$/.test(text) ? text : null;
}

function readRequiredInt(value: unknown, field: string): number {
  const raw =
    typeof value === "number" ? String(value) : readString(value).trim();
  const parsed = Number(raw);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Missing required field: ${field}`);
  }

  return parsed;
}

export function normalizePatientPayload(raw: unknown): PatientPayload {
  const body = typeof raw === "object" && raw !== null ? raw : {};

  const payload: PatientPayload = {
    hoscode: readString(Reflect.get(body, "hoscode")),
    pid: readString(Reflect.get(body, "pid")),
    hn: readString(Reflect.get(body, "hn")),
    an: readString(Reflect.get(body, "an")),
    admit_date: readNullableDate(Reflect.get(body, "admit_date")),
    admit_time: readNullableTime(Reflect.get(body, "admit_time")),
    pre_name: readString(Reflect.get(body, "pre_name")),
    first_name: readString(Reflect.get(body, "first_name")),
    last_name: readString(Reflect.get(body, "last_name")),
    gender: readString(Reflect.get(body, "gender")),
    birth_date: readNullableDate(Reflect.get(body, "birth_date")),
    phone_number: readNullableString(Reflect.get(body, "phone_number")),
    district: readNullableString(Reflect.get(body, "district")),
    province: readNullableString(Reflect.get(body, "province")),
    blood_type_id: readRequiredInt(
      Reflect.get(body, "blood_type_id"),
      "blood_type_id"
    ),
    discharge_date: readNullableDate(Reflect.get(body, "discharge_date")),
    discharge_time: readNullableTime(Reflect.get(body, "discharge_time")),
    discharge_type: readNullableString(Reflect.get(body, "discharge_type")),
    discharge_note: readNullableString(Reflect.get(body, "discharge_note")),
  };

  const requiredFields: Array<keyof PatientPayload> = [
    "hoscode",
    "pid",
    "hn",
    "an",
    "pre_name",
    "first_name",
    "last_name",
    "gender",
  ];

  for (const field of requiredFields) {
    if (!payload[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  return payload;
}

export async function fetchPatientList(): Promise<PatientListItem[]> {
  const pool = getMysqlPool();
  const [rows] = await pool.query<PatientRow[]>(`
    SELECT
      p.id,
      cr.id AS case_register_id,
      CASE WHEN cr.id IS NULL THEN FALSE ELSE TRUE END AS has_case_register,
      p.hoscode,
      h.hosname,
      p.pid,
      p.hn,
      p.an,
      DATE_FORMAT(p.admit_date, '%Y-%m-%d') AS admit_date,
      TIME_FORMAT(p.admit_time, '%H:%i') AS admit_time,
      p.pre_name,
      p.first_name,
      p.last_name,
      p.gender,
      DATE_FORMAT(p.birth_date, '%Y-%m-%d') AS birth_date,
      p.phone_number,
      p.district,
      p.province,
      CAST(p.blood_type AS UNSIGNED) AS blood_type_id,
      cbt.name AS blood_type,
      DATE_FORMAT(p.discharge_date, '%Y-%m-%d') AS discharge_date,
      TIME_FORMAT(p.discharge_time, '%H:%i') AS discharge_time,
      p.discharge_type,
      p.discharge_note
    FROM patient p
    LEFT JOIN hospital h ON h.hoscode = p.hoscode
    LEFT JOIN case_register cr ON cr.patient_id = p.id
    LEFT JOIN c_blood_type cbt ON cbt.id = CAST(p.blood_type AS UNSIGNED)
    ORDER BY p.id DESC
  `);

  return rows;
}

async function fetchChoices(tableName: string): Promise<ChoiceOption[]> {
  const pool = getMysqlPool();
  const [rows] = await pool.query<ChoiceRow[]>(
    `SELECT id, name FROM ${tableName} WHERE is_active = 1 ORDER BY id ASC`
  );
  return rows;
}

export async function fetchPatientOptions() {
  const pool = getMysqlPool();
  const [hospitals] = await pool.query<HospitalRow[]>(
    `
      SELECT hoscode, hosname
      FROM hospital
      WHERE is_active = 1
      ORDER BY hosname ASC
    `
  );

  const [preNames, genders, bloodTypes, dischargeTypes] = await Promise.all([
    fetchChoices("c_pre_name"),
    fetchChoices("c_gender"),
    fetchChoices("c_blood_type"),
    fetchChoices("c_discharge_type"),
  ]);

  return {
    hospitals,
    preNames,
    genders,
    bloodTypes,
    dischargeTypes,
  };
}
