export type CaseEntityKey =
  | "case_register"
  | "case_vital"
  | "case_lab"
  | "case_medication"
  | "case_message"
  | "case_note"
  | "case_team"
  | "case_file"
  | "case_close";

export type CaseChildEntityKey = Exclude<CaseEntityKey, "case_register">;

export type CaseFieldType =
  | "text"
  | "textarea"
  | "date"
  | "time"
  | "number"
  | "checkbox"
  | "select";

export type CaseOptionSource =
  | "priorities"
  | "specialties"
  | "providers";

export type CaseFieldConfig = {
  name: string;
  label: string;
  type: CaseFieldType;
  required?: boolean;
  optionSource?: CaseOptionSource;
  valueType?: "string" | "number";
  numberMode?: "integer" | "float";
  min?: number;
  step?: string;
  rows?: number;
  placeholder?: string;
  defaultValue?: string | number | boolean | "today" | "now";
};

export type CaseEntityConfig = {
  key: CaseEntityKey;
  tableName: CaseEntityKey;
  label: string;
  singularLabel: string;
  activityLabel: string;
  emptyTitle: string;
  icon: string;
  allowCreate: boolean;
  allowEdit: boolean;
  allowDelete: boolean;
  maxRecords?: number;
  sortColumns: readonly string[];
  fields: readonly CaseFieldConfig[];
};

export const CASE_CHILD_TRANSACTION_ORDER: readonly CaseChildEntityKey[] = [
  "case_vital",
  "case_lab",
  "case_medication",
  "case_message",
  "case_note",
  "case_team",
  "case_file",
  "case_close",
];

export const CASE_TRANSACTION_CONFIG: Record<CaseEntityKey, CaseEntityConfig> = {
  case_register: {
    key: "case_register",
    tableName: "case_register",
    label: "Case overview",
    singularLabel: "Case overview",
    activityLabel: "Case overview",
    emptyTitle: "No case overview found.",
    icon: "clipboard-plus",
    allowCreate: false,
    allowEdit: true,
    allowDelete: false,
    maxRecords: 1,
    sortColumns: ["id DESC"],
    fields: [
      {
        name: "record_date",
        label: "Record date",
        type: "date",
        defaultValue: "today",
      },
      {
        name: "record_time",
        label: "Record time",
        type: "time",
        defaultValue: "now",
      },
      {
        name: "status",
        label: "Status",
        type: "text",
        required: true,
        placeholder: "Pending, Active, Critical, Discharge",
      },
      {
        name: "priority",
        label: "Priority",
        type: "select",
        optionSource: "priorities",
        required: true,
      },
      {
        name: "specialty",
        label: "Specialty",
        type: "select",
        optionSource: "specialties",
      },
      {
        name: "reason",
        label: "Reason",
        type: "textarea",
        rows: 3,
      },
      {
        name: "current_symptoms",
        label: "Symptoms",
        type: "textarea",
        rows: 4,
      },
      {
        name: "initial_diagnosis",
        label: "Diagnosis",
        type: "textarea",
        rows: 3,
      },
      {
        name: "clinical_notes",
        label: "Clinical notes",
        type: "textarea",
        rows: 4,
      },
      {
        name: "sender_id",
        label: "Sender ID",
        type: "text",
      },
    ],
  },
  case_vital: {
    key: "case_vital",
    tableName: "case_vital",
    label: "Vital signs",
    singularLabel: "Vital sign",
    activityLabel: "Vital sign",
    emptyTitle: "No vital signs recorded yet.",
    icon: "heart-pulse",
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    sortColumns: ["record_date DESC", "record_time DESC", "id DESC"],
    fields: [
      {
        name: "record_date",
        label: "Record date",
        type: "date",
        defaultValue: "today",
      },
      {
        name: "record_time",
        label: "Record time",
        type: "time",
        defaultValue: "now",
      },
      {
        name: "bp",
        label: "BP",
        type: "text",
        placeholder: "120/80",
      },
      {
        name: "hr",
        label: "HR",
        type: "number",
        numberMode: "integer",
        min: 0,
      },
      {
        name: "temp",
        label: "Temp",
        type: "number",
        numberMode: "float",
        min: 0,
        step: "0.1",
      },
      {
        name: "rr",
        label: "RR",
        type: "number",
        numberMode: "integer",
        min: 0,
      },
      {
        name: "spo2",
        label: "SpO2",
        type: "number",
        numberMode: "integer",
        min: 0,
      },
      {
        name: "gcs",
        label: "GCS",
        type: "text",
        placeholder: "15/15",
      },
    ],
  },
  case_lab: {
    key: "case_lab",
    tableName: "case_lab",
    label: "Lab results",
    singularLabel: "Lab result",
    activityLabel: "Lab result",
    emptyTitle: "No lab results recorded yet.",
    icon: "flask-conical",
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    sortColumns: ["lab_date DESC", "lab_time DESC", "id DESC"],
    fields: [
      {
        name: "lab_date",
        label: "Lab date",
        type: "date",
        defaultValue: "today",
      },
      {
        name: "lab_time",
        label: "Lab time",
        type: "time",
        defaultValue: "now",
      },
      {
        name: "name",
        label: "Test",
        type: "text",
        required: true,
      },
      {
        name: "result",
        label: "Result",
        type: "text",
        required: true,
      },
      {
        name: "unit",
        label: "Unit",
        type: "text",
        required: true,
      },
      {
        name: "ref_range",
        label: "Ref range",
        type: "text",
      },
      {
        name: "status",
        label: "Status",
        type: "text",
        required: true,
      },
      {
        name: "note",
        label: "Note",
        type: "textarea",
        rows: 3,
      },
    ],
  },
  case_medication: {
    key: "case_medication",
    tableName: "case_medication",
    label: "Medications",
    singularLabel: "Medication",
    activityLabel: "Medication",
    emptyTitle: "No medications recorded yet.",
    icon: "pill",
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    sortColumns: ["start_date DESC", "start_time DESC", "id DESC"],
    fields: [
      {
        name: "start_date",
        label: "Start date",
        type: "date",
        defaultValue: "today",
      },
      {
        name: "start_time",
        label: "Start time",
        type: "time",
        defaultValue: "now",
      },
      {
        name: "name",
        label: "Drug",
        type: "text",
        required: true,
      },
      {
        name: "dose",
        label: "Dose",
        type: "text",
        required: true,
      },
      {
        name: "freq",
        label: "Frequency",
        type: "text",
        required: true,
      },
      {
        name: "route",
        label: "Route",
        type: "text",
        required: true,
      },
      {
        name: "category",
        label: "Category",
        type: "text",
      },
      {
        name: "note",
        label: "Note",
        type: "textarea",
        rows: 3,
      },
    ],
  },
  case_message: {
    key: "case_message",
    tableName: "case_message",
    label: "Messages",
    singularLabel: "Message",
    activityLabel: "Message",
    emptyTitle: "No messages recorded yet.",
    icon: "messages-square",
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    sortColumns: ["record_date DESC", "record_time DESC", "id DESC"],
    fields: [
      {
        name: "record_date",
        label: "Record date",
        type: "date",
        defaultValue: "today",
      },
      {
        name: "record_time",
        label: "Record time",
        type: "time",
        defaultValue: "now",
      },
      {
        name: "sender_id",
        label: "Sender ID",
        type: "text",
      },
      {
        name: "sender_name",
        label: "Sender",
        type: "text",
      },
      {
        name: "text",
        label: "Message",
        type: "textarea",
        rows: 4,
        required: true,
      },
      {
        name: "is_self",
        label: "Self",
        type: "checkbox",
        defaultValue: false,
      },
      {
        name: "is_system",
        label: "System",
        type: "checkbox",
        defaultValue: false,
      },
    ],
  },
  case_note: {
    key: "case_note",
    tableName: "case_note",
    label: "Notes",
    singularLabel: "Note",
    activityLabel: "Note",
    emptyTitle: "No notes recorded yet.",
    icon: "notebook-pen",
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    sortColumns: ["record_date DESC", "record_time DESC", "id DESC"],
    fields: [
      {
        name: "record_date",
        label: "Record date",
        type: "date",
        defaultValue: "today",
      },
      {
        name: "record_time",
        label: "Record time",
        type: "time",
        defaultValue: "now",
      },
      {
        name: "provider_id_do_note",
        label: "Provider",
        type: "select",
        optionSource: "providers",
        valueType: "number",
        required: true,
      },
      {
        name: "color",
        label: "Color",
        type: "text",
        placeholder: "yellow, red, #f59e0b",
      },
      {
        name: "note_text",
        label: "Note",
        type: "textarea",
        rows: 4,
        required: true,
      },
    ],
  },
  case_team: {
    key: "case_team",
    tableName: "case_team",
    label: "Care team",
    singularLabel: "Care team",
    activityLabel: "Care team",
    emptyTitle: "No care team assigned yet.",
    icon: "users-round",
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    sortColumns: ["assign_date DESC", "assign_time DESC", "id DESC"],
    fields: [
      {
        name: "provider_id",
        label: "Provider",
        type: "select",
        optionSource: "providers",
        valueType: "number",
        required: true,
      },
      {
        name: "role",
        label: "Role",
        type: "text",
        required: true,
      },
      {
        name: "assign_date",
        label: "Assign date",
        type: "date",
        defaultValue: "today",
      },
      {
        name: "assign_time",
        label: "Assign time",
        type: "time",
        defaultValue: "now",
      },
    ],
  },
  case_file: {
    key: "case_file",
    tableName: "case_file",
    label: "Files",
    singularLabel: "File",
    activityLabel: "File",
    emptyTitle: "No files attached yet.",
    icon: "file-text",
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    sortColumns: ["file_date DESC", "file_time DESC", "id DESC"],
    fields: [
      {
        name: "file_date",
        label: "File date",
        type: "date",
        defaultValue: "today",
      },
      {
        name: "file_time",
        label: "File time",
        type: "time",
        defaultValue: "now",
      },
      {
        name: "privder_id_do_file",
        label: "Provider",
        type: "select",
        optionSource: "providers",
        valueType: "string",
      },
      {
        name: "file_name",
        label: "File name",
        type: "text",
        required: true,
      },
      {
        name: "file_type",
        label: "Type",
        type: "text",
        required: true,
      },
      {
        name: "category",
        label: "Category",
        type: "text",
        required: true,
      },
      {
        name: "mime_type",
        label: "MIME type",
        type: "text",
      },
      {
        name: "file_url",
        label: "URL",
        type: "textarea",
        rows: 3,
      },
      {
        name: "size_kb",
        label: "Size KB",
        type: "number",
        numberMode: "integer",
        min: 0,
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        rows: 3,
      },
      {
        name: "is_previewable",
        label: "Preview",
        type: "checkbox",
        defaultValue: true,
      },
    ],
  },
  case_close: {
    key: "case_close",
    tableName: "case_close",
    label: "Case close",
    singularLabel: "Case close",
    activityLabel: "Case close",
    emptyTitle: "This case is still open.",
    icon: "shield-check",
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    maxRecords: 1,
    sortColumns: ["close_date DESC", "close_time DESC", "id DESC"],
    fields: [
      {
        name: "close_date",
        label: "Close date",
        type: "date",
        defaultValue: "today",
      },
      {
        name: "close_time",
        label: "Close time",
        type: "time",
        defaultValue: "now",
      },
      {
        name: "close_type",
        label: "Close type",
        type: "text",
        placeholder: "Closed from consult workspace",
      },
      {
        name: "close_note",
        label: "Close note",
        type: "textarea",
        rows: 3,
      },
    ],
  },
};

export function isCaseEntityKey(value: string): value is CaseEntityKey {
  return value in CASE_TRANSACTION_CONFIG;
}

export function isCaseChildEntityKey(value: string): value is CaseChildEntityKey {
  return value !== "case_register" && isCaseEntityKey(value);
}
