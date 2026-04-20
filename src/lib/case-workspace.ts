import type { ResultSetHeader, RowDataPacket } from "mysql2";

import {
  CASE_CHILD_TRANSACTION_ORDER,
  CASE_TRANSACTION_CONFIG,
  type CaseChildEntityKey,
  type CaseEntityKey,
  type CaseFieldConfig,
} from "@/lib/case-transaction-config";
import { getMysqlPool } from "@/lib/mysql";

export type ChoiceOption = {
  id: number;
  name: string;
};

export type ProviderOption = {
  id: number;
  name: string;
  specialty: string | null;
};

export type CaseRecordValue = string | number | boolean | null;

export type CaseTransactionRecord = {
  id: number;
  [key: string]: CaseRecordValue;
};

export type CasePatientSummary = {
  id: number;
  hoscode: string;
  hosname: string | null;
  pid: string;
  hn: string;
  an: string;
  pre_name: string;
  first_name: string;
  last_name: string;
  full_name: string;
  gender: string;
  blood_type: string | null;
  admit_date: string | null;
  admit_time: string | null;
};

export type CaseRegisterDetail = {
  id: number;
  patient_id: number;
  is_closed: boolean;
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
};

export type CaseWorkspaceOptions = {
  priorities: ChoiceOption[];
  specialties: ChoiceOption[];
  providers: ProviderOption[];
};

export type CaseWorkspace = {
  caseRegister: CaseRegisterDetail;
  patient: CasePatientSummary;
  transactions: Record<CaseChildEntityKey, CaseTransactionRecord[]>;
  options: CaseWorkspaceOptions;
};

type ChoiceRow = RowDataPacket & ChoiceOption;

type ProviderRow = RowDataPacket & ProviderOption;

type CountRow = RowDataPacket & {
  total: number;
};

type CaseContextRow = RowDataPacket & {
  id: number;
  patient_id: number;
  status: string | null;
};

type HeaderRow = RowDataPacket & {
  id: number;
  patient_id: number;
  is_closed: number | boolean;
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
  pid: string;
  hn: string;
  an: string;
  pre_name: string;
  first_name: string;
  last_name: string;
  gender: string;
  blood_type: string | null;
  admit_date: string | null;
  admit_time: string | null;
};

type GenericRow = RowDataPacket & {
  id: number;
  [key: string]: unknown;
};

function readText(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function readRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

export function parsePositiveInt(value: string | number, field: string) {
  const parsed =
    typeof value === "number" ? value : Number.parseInt(String(value), 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${field}`);
  }

  return parsed;
}

function buildSelectExpression(field: CaseFieldConfig) {
  switch (field.type) {
    case "date":
      return `DATE_FORMAT(${field.name}, '%Y-%m-%d') AS ${field.name}`;
    case "time":
      return `TIME_FORMAT(${field.name}, '%H:%i') AS ${field.name}`;
    case "checkbox":
      return `CASE WHEN ${field.name} = 1 THEN TRUE ELSE FALSE END AS ${field.name}`;
    default:
      return field.name;
  }
}

function normalizeDateValue(field: CaseFieldConfig, value: unknown) {
  const text = readText(value);

  if (!text) {
    if (field.required) {
      throw new Error(`Missing required field: ${field.label}`);
    }
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new Error(`Invalid date: ${field.label}`);
  }

  return text;
}

function normalizeTimeValue(field: CaseFieldConfig, value: unknown) {
  const text = readText(value);

  if (!text) {
    if (field.required) {
      throw new Error(`Missing required field: ${field.label}`);
    }
    return null;
  }

  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(text)) {
    throw new Error(`Invalid time: ${field.label}`);
  }

  return text.length === 5 ? `${text}:00` : text;
}

function normalizeNumberValue(field: CaseFieldConfig, value: unknown) {
  const text = readText(value);

  if (!text) {
    if (field.required) {
      throw new Error(`Missing required field: ${field.label}`);
    }
    return null;
  }

  const parsed = Number(text);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid number: ${field.label}`);
  }

  if (field.numberMode !== "float" && !Number.isInteger(parsed)) {
    throw new Error(`Invalid integer: ${field.label}`);
  }

  if (field.min !== undefined && parsed < field.min) {
    throw new Error(`${field.label} must be at least ${field.min}`);
  }

  return parsed;
}

function normalizeCheckboxValue(value: unknown) {
  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  if (typeof value === "number") {
    return value > 0 ? 1 : 0;
  }

  const text = readText(value).toLowerCase();
  return ["1", "true", "yes", "on"].includes(text) ? 1 : 0;
}

function normalizeTextValue(field: CaseFieldConfig, value: unknown) {
  const text = readText(value);

  if (!text) {
    if (field.required) {
      throw new Error(`Missing required field: ${field.label}`);
    }
    return null;
  }

  return text;
}

function normalizeSelectValue(field: CaseFieldConfig, value: unknown) {
  const text = readText(value);

  if (!text) {
    if (field.required) {
      throw new Error(`Missing required field: ${field.label}`);
    }
    return null;
  }

  if (field.valueType === "number") {
    const parsed = Number.parseInt(text, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error(`Invalid selection: ${field.label}`);
    }
    return parsed;
  }

  return text;
}

function normalizeEntityPayload(entity: CaseEntityKey, raw: unknown) {
  const input = readRecord(raw);
  const config = CASE_TRANSACTION_CONFIG[entity];

  return Object.fromEntries(
    config.fields.map((field) => {
      const rawValue = Reflect.get(input, field.name);

      switch (field.type) {
        case "date":
          return [field.name, normalizeDateValue(field, rawValue)];
        case "time":
          return [field.name, normalizeTimeValue(field, rawValue)];
        case "number":
          return [field.name, normalizeNumberValue(field, rawValue)];
        case "checkbox":
          return [field.name, normalizeCheckboxValue(rawValue)];
        case "select":
          return [field.name, normalizeSelectValue(field, rawValue)];
        case "text":
        case "textarea":
        default:
          return [field.name, normalizeTextValue(field, rawValue)];
      }
    })
  ) as Record<string, string | number | null>;
}

async function fetchChoices(tableName: string) {
  const pool = getMysqlPool();
  const [rows] = await pool.query<ChoiceRow[]>(
    `SELECT id, name FROM ${tableName} WHERE is_active = 1 ORDER BY id ASC`
  );
  return rows;
}

async function fetchProviders() {
  const pool = getMysqlPool();
  const [rows] = await pool.query<ProviderRow[]>(`
    SELECT
      id,
      CONCAT(COALESCE(title, ''), first_name, ' ', last_name) AS name,
      specialty
    FROM provider
    ORDER BY first_name ASC, last_name ASC, id ASC
  `);

  return rows;
}

async function fetchCaseWorkspaceOptions(): Promise<CaseWorkspaceOptions> {
  const [priorities, specialties, providers] = await Promise.all([
    fetchChoices("c_priority"),
    fetchChoices("c_specialty"),
    fetchProviders(),
  ]);

  return {
    priorities,
    specialties,
    providers,
  };
}

export async function resolveCaseRegisterContext(caseRegisterId: number) {
  const pool = getMysqlPool();
  const [rows] = await pool.query<CaseContextRow[]>(
    `SELECT id, patient_id, status FROM case_register WHERE id = ? LIMIT 1`,
    [caseRegisterId]
  );

  if (rows.length === 0) {
    throw new Error("Case register not found");
  }

  return rows[0];
}

async function countEntityRows(
  entity: CaseChildEntityKey,
  caseRegisterId: number
) {
  const pool = getMysqlPool();
  const config = CASE_TRANSACTION_CONFIG[entity];
  const [rows] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) AS total FROM ${config.tableName} WHERE case_register_id = ?`,
    [caseRegisterId]
  );

  return Number(rows[0]?.total ?? 0);
}

async function fetchChildTransactions(
  entity: CaseChildEntityKey,
  caseRegisterId: number
): Promise<CaseTransactionRecord[]> {
  const pool = getMysqlPool();
  const config = CASE_TRANSACTION_CONFIG[entity];
  const selectColumns = config.fields.map(buildSelectExpression).join(",\n        ");
  const [rows] = await pool.query<GenericRow[]>(
    `
      SELECT
        id,
        ${selectColumns}
      FROM ${config.tableName}
      WHERE case_register_id = ?
      ORDER BY ${config.sortColumns.join(", ")}
    `,
    [caseRegisterId]
  );

  return rows.map((row) => {
    const record: CaseTransactionRecord = {
      id: Number(row.id),
    };

    for (const field of config.fields) {
      const value = row[field.name];
      if (field.type === "checkbox") {
        record[field.name] = Boolean(value);
      } else if (typeof value === "number" || typeof value === "string") {
        record[field.name] = value;
      } else {
        record[field.name] = value == null ? null : String(value);
      }
    }

    return record;
  });
}

export async function fetchCaseWorkspace(
  caseRegisterId: number
): Promise<CaseWorkspace | null> {
  const pool = getMysqlPool();
  const [rows] = await pool.query<HeaderRow[]>(
    `
      SELECT
        c.id,
        c.patient_id,
        CASE
          WHEN EXISTS (
            SELECT 1
            FROM case_close cc
            WHERE cc.case_register_id = c.id
          ) THEN TRUE
          ELSE FALSE
        END AS is_closed,
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
        p.pid,
        p.hn,
        p.an,
        p.pre_name,
        p.first_name,
        p.last_name,
        p.gender,
        cbt.name AS blood_type,
        DATE_FORMAT(p.admit_date, '%Y-%m-%d') AS admit_date,
        TIME_FORMAT(p.admit_time, '%H:%i') AS admit_time
      FROM case_register c
      JOIN patient p ON p.id = c.patient_id
      LEFT JOIN hospital h ON h.hoscode = p.hoscode
      LEFT JOIN c_blood_type cbt ON cbt.id = CAST(p.blood_type AS UNSIGNED)
      WHERE c.id = ?
      LIMIT 1
    `,
    [caseRegisterId]
  );

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  const [options, childRows] = await Promise.all([
    fetchCaseWorkspaceOptions(),
    Promise.all(
      CASE_CHILD_TRANSACTION_ORDER.map((entity) =>
        fetchChildTransactions(entity, row.id)
      )
    ),
  ]);

  const transactions = CASE_CHILD_TRANSACTION_ORDER.reduce<
    Record<CaseChildEntityKey, CaseTransactionRecord[]>
  >((result, entity, index) => {
    result[entity] = childRows[index];
    return result;
  }, {} as Record<CaseChildEntityKey, CaseTransactionRecord[]>);

  return {
    caseRegister: {
      id: row.id,
      patient_id: row.patient_id,
      is_closed: Boolean(row.is_closed),
      record_date: row.record_date,
      record_time: row.record_time,
      status: row.status,
      priority: row.priority,
      specialty: row.specialty,
      reason: row.reason,
      current_symptoms: row.current_symptoms,
      initial_diagnosis: row.initial_diagnosis,
      clinical_notes: row.clinical_notes,
      sender_id: row.sender_id,
      last_action: row.last_action,
      last_active_time: row.last_active_time,
    },
    patient: {
      id: row.patient_id,
      hoscode: row.hoscode,
      hosname: row.hosname,
      pid: row.pid,
      hn: row.hn,
      an: row.an,
      pre_name: row.pre_name,
      first_name: row.first_name,
      last_name: row.last_name,
      full_name: `${row.pre_name}${row.first_name} ${row.last_name}`.trim(),
      gender: row.gender,
      blood_type: row.blood_type,
      admit_date: row.admit_date,
      admit_time: row.admit_time,
    },
    transactions,
    options,
  };
}

async function markCaseActivity(caseRegisterId: number, action: string) {
  const pool = getMysqlPool();
  await pool.execute(
    `
      UPDATE case_register
      SET
        last_action = ?,
        last_active_time = ?
      WHERE id = ?
    `,
    [action, "just now", caseRegisterId]
  );
}

export async function syncCaseCloseState(
  caseRegisterId: number,
  action: string
) {
  const pool = getMysqlPool();
  const [countRows] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) AS total FROM case_close WHERE case_register_id = ?`,
    [caseRegisterId]
  );
  const [contextRows] = await pool.query<CaseContextRow[]>(
    `SELECT id, patient_id, status FROM case_register WHERE id = ? LIMIT 1`,
    [caseRegisterId]
  );

  if (contextRows.length === 0) {
    return;
  }

  const hasCloseRecord = Number(countRows[0]?.total ?? 0) > 0;
  const currentStatus = contextRows[0].status;
  const nextStatus = hasCloseRecord
    ? "Discharge"
    : currentStatus === "Discharge"
      ? "Active"
      : (currentStatus ?? "Active");

  await pool.execute(
    `
      UPDATE case_register
      SET
        status = ?,
        last_action = ?,
        last_active_time = ?
      WHERE id = ?
    `,
    [nextStatus, action, "just now", caseRegisterId]
  );
}

async function assertCreateAllowed(
  entity: CaseChildEntityKey,
  caseRegisterId: number
) {
  const config = CASE_TRANSACTION_CONFIG[entity];
  const maxRecords = "maxRecords" in config ? config.maxRecords : undefined;

  if (!maxRecords) {
    return;
  }

  const total = await countEntityRows(entity, caseRegisterId);
  if (total >= maxRecords) {
    throw new Error(`${config.singularLabel} already exists for this case`);
  }
}

export async function updateCaseRegister(caseRegisterId: number, raw: unknown) {
  const pool = getMysqlPool();
  await resolveCaseRegisterContext(caseRegisterId);
  const payload = normalizeEntityPayload("case_register", raw);
  const hasCloseRecord = (await countEntityRows("case_close", caseRegisterId)) > 0;

  if (hasCloseRecord) {
    payload.status = "Discharge";
  }

  const config = CASE_TRANSACTION_CONFIG.case_register;
  const values = config.fields.map((field) => payload[field.name] ?? null);
  const setClause = config.fields.map((field) => `${field.name} = ?`).join(",\n          ");

  const [result] = await pool.execute<ResultSetHeader>(
    `
      UPDATE case_register
      SET
        ${setClause}
      WHERE id = ?
    `,
    [...values, caseRegisterId]
  );

  if (result.affectedRows === 0) {
    throw new Error("Case register not found");
  }

  if (hasCloseRecord) {
    await syncCaseCloseState(caseRegisterId, "Case overview updated");
  } else {
    await markCaseActivity(caseRegisterId, "Case overview updated");
  }
}

export async function createCaseTransaction(
  caseRegisterId: number,
  entity: CaseChildEntityKey,
  raw: unknown
) {
  const pool = getMysqlPool();
  await resolveCaseRegisterContext(caseRegisterId);
  const config = CASE_TRANSACTION_CONFIG[entity];
  await assertCreateAllowed(entity, caseRegisterId);

  const payload = normalizeEntityPayload(entity, raw);
  const columns = ["case_register_id", ...config.fields.map((field) => field.name)];
  const values = [
    caseRegisterId,
    ...config.fields.map((field) => payload[field.name]),
  ];

  const [result] = await pool.execute<ResultSetHeader>(
    `
      INSERT INTO ${config.tableName} (${columns.join(", ")})
      VALUES (${columns.map(() => "?").join(", ")})
    `,
    values
  );

  if (entity === "case_close") {
    await syncCaseCloseState(caseRegisterId, "Case close added");
  } else {
    await markCaseActivity(caseRegisterId, `${config.activityLabel} added`);
  }

  return result.insertId;
}

export async function updateCaseTransaction(
  caseRegisterId: number,
  entity: CaseChildEntityKey,
  recordId: number,
  raw: unknown
) {
  const pool = getMysqlPool();
  await resolveCaseRegisterContext(caseRegisterId);
  const config = CASE_TRANSACTION_CONFIG[entity];
  const payload = normalizeEntityPayload(entity, raw);
  const values = config.fields.map((field) => payload[field.name] ?? null);
  const setClause = config.fields.map((field) => `${field.name} = ?`).join(",\n          ");

  const [result] = await pool.execute<ResultSetHeader>(
    `
      UPDATE ${config.tableName}
      SET
        ${setClause}
      WHERE id = ? AND case_register_id = ?
    `,
    [...values, recordId, caseRegisterId]
  );

  if (result.affectedRows === 0) {
    throw new Error(`${config.singularLabel} not found`);
  }

  if (entity === "case_close") {
    await syncCaseCloseState(caseRegisterId, "Case close updated");
  } else {
    await markCaseActivity(caseRegisterId, `${config.activityLabel} updated`);
  }
}

export async function deleteCaseTransaction(
  caseRegisterId: number,
  entity: CaseChildEntityKey,
  recordId: number
) {
  const pool = getMysqlPool();
  await resolveCaseRegisterContext(caseRegisterId);
  const config = CASE_TRANSACTION_CONFIG[entity];

  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE FROM ${config.tableName} WHERE id = ? AND case_register_id = ?`,
    [recordId, caseRegisterId]
  );

  if (result.affectedRows === 0) {
    throw new Error(`${config.singularLabel} not found`);
  }

  if (entity === "case_close") {
    await syncCaseCloseState(caseRegisterId, "Case reopened");
  } else {
    await markCaseActivity(caseRegisterId, `${config.activityLabel} deleted`);
  }
}
