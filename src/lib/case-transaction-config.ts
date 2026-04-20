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
    label: "รายละเอียดเคส",
    singularLabel: "รายละเอียดเคส",
    activityLabel: "รายละเอียดเคส",
    emptyTitle: "ยังไม่มีรายละเอียดเคส",
    icon: "clipboard-plus",
    allowCreate: false,
    allowEdit: true,
    allowDelete: false,
    maxRecords: 1,
    sortColumns: ["id DESC"],
    fields: [
      {
        name: "record_date",
        label: "วันที่บันทึก",
        type: "date",
        defaultValue: "today",
      },
      {
        name: "record_time",
        label: "เวลาบันทึก",
        type: "time",
        defaultValue: "now",
      },
      {
        name: "status",
        label: "สถานะ",
        type: "text",
        required: true,
        placeholder: "Pending, Active, Critical, Discharge",
      },
      {
        name: "priority",
        label: "ระดับความเร่งด่วน",
        type: "select",
        optionSource: "priorities",
        required: true,
      },
      {
        name: "specialty",
        label: "สาขาที่ปรึกษา",
        type: "select",
        optionSource: "specialties",
      },
      {
        name: "reason",
        label: "เหตุผลที่ปรึกษา",
        type: "textarea",
        rows: 3,
      },
      {
        name: "current_symptoms",
        label: "อาการปัจจุบัน",
        type: "textarea",
        rows: 4,
      },
      {
        name: "initial_diagnosis",
        label: "การวินิจฉัยเบื้องต้น",
        type: "textarea",
        rows: 3,
      },
      {
        name: "clinical_notes",
        label: "บันทึกทางคลินิก",
        type: "textarea",
        rows: 4,
      },
      {
        name: "sender_id",
        label: "รหัสผู้ส่ง",
        type: "text",
      },
    ],
  },
  case_vital: {
    key: "case_vital",
    tableName: "case_vital",
    label: "สัญญาณชีพ",
    singularLabel: "สัญญาณชีพ",
    activityLabel: "สัญญาณชีพ",
    emptyTitle: "ยังไม่มีการบันทึกสัญญาณชีพ",
    icon: "heart-pulse",
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    sortColumns: ["record_date DESC", "record_time DESC", "id DESC"],
    fields: [
      {
        name: "record_date",
        label: "วันที่บันทึก",
        type: "date",
        defaultValue: "today",
      },
      {
        name: "record_time",
        label: "เวลาบันทึก",
        type: "time",
        defaultValue: "now",
      },
      {
        name: "bp",
        label: "ความดัน (BP)",
        type: "text",
        placeholder: "120/80",
      },
      {
        name: "hr",
        label: "ชีพจร (HR)",
        type: "number",
        numberMode: "integer",
        min: 0,
        placeholder: "ครั้ง/นาที",
      },
      {
        name: "temp",
        label: "อุณหภูมิ (°C)",
        type: "number",
        numberMode: "float",
        min: 0,
        step: "0.1",
        placeholder: "36.5",
      },
      {
        name: "rr",
        label: "อัตราหายใจ (RR)",
        type: "number",
        numberMode: "integer",
        min: 0,
        placeholder: "ครั้ง/นาที",
      },
      {
        name: "spo2",
        label: "SpO₂ (%)",
        type: "number",
        numberMode: "integer",
        min: 0,
        placeholder: "98",
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
    label: "ผลแล็บ",
    singularLabel: "ผลแล็บ",
    activityLabel: "ผลแล็บ",
    emptyTitle: "ยังไม่มีการบันทึกผลแล็บ",
    icon: "flask-conical",
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    sortColumns: ["lab_date DESC", "lab_time DESC", "id DESC"],
    fields: [
      {
        name: "lab_date",
        label: "วันที่ตรวจ",
        type: "date",
        defaultValue: "today",
      },
      {
        name: "lab_time",
        label: "เวลาตรวจ",
        type: "time",
        defaultValue: "now",
      },
      {
        name: "name",
        label: "รายการตรวจ",
        type: "text",
        required: true,
        placeholder: "เช่น Hb, WBC, Na",
      },
      {
        name: "result",
        label: "ผล",
        type: "text",
        required: true,
      },
      {
        name: "unit",
        label: "หน่วย",
        type: "text",
        required: true,
        placeholder: "mg/dL",
      },
      {
        name: "ref_range",
        label: "ค่าปกติ",
        type: "text",
      },
      {
        name: "status",
        label: "สถานะ",
        type: "text",
        required: true,
        placeholder: "normal, high, low, critical",
      },
      {
        name: "note",
        label: "หมายเหตุ",
        type: "textarea",
        rows: 3,
      },
    ],
  },
  case_medication: {
    key: "case_medication",
    tableName: "case_medication",
    label: "ยาที่ให้",
    singularLabel: "รายการยา",
    activityLabel: "ยา",
    emptyTitle: "ยังไม่มีการบันทึกยา",
    icon: "pill",
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    sortColumns: ["start_date DESC", "start_time DESC", "id DESC"],
    fields: [
      {
        name: "start_date",
        label: "วันที่เริ่มยา",
        type: "date",
        defaultValue: "today",
      },
      {
        name: "start_time",
        label: "เวลาเริ่ม",
        type: "time",
        defaultValue: "now",
      },
      {
        name: "name",
        label: "ชื่อยา",
        type: "text",
        required: true,
      },
      {
        name: "dose",
        label: "ขนาดยา",
        type: "text",
        required: true,
        placeholder: "500 mg",
      },
      {
        name: "freq",
        label: "ความถี่",
        type: "text",
        required: true,
        placeholder: "tid, bid, q8h",
      },
      {
        name: "route",
        label: "วิธีบริหารยา",
        type: "text",
        required: true,
        placeholder: "PO, IV, IM, SC",
      },
      {
        name: "category",
        label: "หมวดยา",
        type: "text",
      },
      {
        name: "note",
        label: "หมายเหตุ",
        type: "textarea",
        rows: 3,
      },
    ],
  },
  case_message: {
    key: "case_message",
    tableName: "case_message",
    label: "ข้อความ",
    singularLabel: "ข้อความ",
    activityLabel: "ข้อความ",
    emptyTitle: "ยังไม่มีข้อความ",
    icon: "messages-square",
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    sortColumns: ["record_date DESC", "record_time DESC", "id DESC"],
    fields: [
      {
        name: "record_date",
        label: "วันที่",
        type: "date",
        defaultValue: "today",
      },
      {
        name: "record_time",
        label: "เวลา",
        type: "time",
        defaultValue: "now",
      },
      {
        name: "sender_id",
        label: "รหัสผู้ส่ง",
        type: "text",
      },
      {
        name: "sender_name",
        label: "ชื่อผู้ส่ง",
        type: "text",
      },
      {
        name: "text",
        label: "ข้อความ",
        type: "textarea",
        rows: 4,
        required: true,
      },
      {
        name: "is_self",
        label: "ส่งจากตนเอง",
        type: "checkbox",
        defaultValue: false,
      },
      {
        name: "is_system",
        label: "ข้อความระบบ",
        type: "checkbox",
        defaultValue: false,
      },
    ],
  },
  case_note: {
    key: "case_note",
    tableName: "case_note",
    label: "บันทึกช่วยจำ",
    singularLabel: "บันทึก",
    activityLabel: "บันทึก",
    emptyTitle: "ยังไม่มีบันทึก",
    icon: "notebook-pen",
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    sortColumns: ["record_date DESC", "record_time DESC", "id DESC"],
    fields: [
      {
        name: "record_date",
        label: "วันที่",
        type: "date",
        defaultValue: "today",
      },
      {
        name: "record_time",
        label: "เวลา",
        type: "time",
        defaultValue: "now",
      },
      {
        name: "provider_id_do_note",
        label: "ผู้บันทึก",
        type: "select",
        optionSource: "providers",
        valueType: "number",
        required: true,
      },
      {
        name: "color",
        label: "สีแถบ",
        type: "text",
        placeholder: "yellow, red, #f59e0b",
      },
      {
        name: "note_text",
        label: "เนื้อหาบันทึก",
        type: "textarea",
        rows: 4,
        required: true,
      },
    ],
  },
  case_team: {
    key: "case_team",
    tableName: "case_team",
    label: "ทีมผู้ดูแล",
    singularLabel: "สมาชิกทีม",
    activityLabel: "ทีมผู้ดูแล",
    emptyTitle: "ยังไม่มีการมอบหมายทีม",
    icon: "users-round",
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    sortColumns: ["assign_date DESC", "assign_time DESC", "id DESC"],
    fields: [
      {
        name: "provider_id",
        label: "แพทย์/ผู้ดูแล",
        type: "select",
        optionSource: "providers",
        valueType: "number",
        required: true,
      },
      {
        name: "role",
        label: "บทบาท",
        type: "text",
        required: true,
        placeholder: "Consultant, Resident, Nurse",
      },
      {
        name: "assign_date",
        label: "วันที่มอบหมาย",
        type: "date",
        defaultValue: "today",
      },
      {
        name: "assign_time",
        label: "เวลา",
        type: "time",
        defaultValue: "now",
      },
    ],
  },
  case_file: {
    key: "case_file",
    tableName: "case_file",
    label: "ไฟล์แนบ",
    singularLabel: "ไฟล์",
    activityLabel: "ไฟล์",
    emptyTitle: "ยังไม่มีไฟล์แนบ",
    icon: "file-text",
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    sortColumns: ["file_date DESC", "file_time DESC", "id DESC"],
    fields: [
      {
        name: "file_date",
        label: "วันที่แนบ",
        type: "date",
        defaultValue: "today",
      },
      {
        name: "file_time",
        label: "เวลา",
        type: "time",
        defaultValue: "now",
      },
      {
        name: "privder_id_do_file",
        label: "ผู้แนบไฟล์",
        type: "select",
        optionSource: "providers",
        valueType: "string",
      },
      {
        name: "file_name",
        label: "ชื่อไฟล์",
        type: "text",
        required: true,
      },
      {
        name: "file_type",
        label: "ประเภท",
        type: "text",
        required: true,
      },
      {
        name: "category",
        label: "หมวด",
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
        label: "URL ไฟล์",
        type: "textarea",
        rows: 3,
      },
      {
        name: "size_kb",
        label: "ขนาด (KB)",
        type: "number",
        numberMode: "integer",
        min: 0,
      },
      {
        name: "description",
        label: "คำอธิบาย",
        type: "textarea",
        rows: 3,
      },
      {
        name: "is_previewable",
        label: "แสดงตัวอย่างได้",
        type: "checkbox",
        defaultValue: true,
      },
    ],
  },
  case_close: {
    key: "case_close",
    tableName: "case_close",
    label: "ปิดเคส",
    singularLabel: "การปิดเคส",
    activityLabel: "ปิดเคส",
    emptyTitle: "เคสนี้ยังเปิดอยู่",
    icon: "shield-check",
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    maxRecords: 1,
    sortColumns: ["close_date DESC", "close_time DESC", "id DESC"],
    fields: [
      {
        name: "close_date",
        label: "วันที่ปิดเคส",
        type: "date",
        defaultValue: "today",
      },
      {
        name: "close_time",
        label: "เวลา",
        type: "time",
        defaultValue: "now",
      },
      {
        name: "close_type",
        label: "ประเภทการปิด",
        type: "text",
        placeholder: "Discharge, Refer, Dead",
      },
      {
        name: "close_note",
        label: "หมายเหตุ",
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
