"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ClipboardPlus,
  FileText,
  FlaskConical,
  HeartPulse,
  MessageSquareMore,
  NotebookPen,
  PencilLine,
  Pill,
  Plus,
  ShieldCheck,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import {
  CASE_CHILD_TRANSACTION_ORDER,
  CASE_TRANSACTION_CONFIG,
  type CaseChildEntityKey,
  type CaseEntityKey,
  type CaseFieldConfig,
} from "@/lib/case-transaction-config";
import type {
  CaseRecordValue,
  CaseTransactionRecord,
  CaseWorkspace,
} from "@/lib/case-workspace";

type SelectOption = {
  value: string;
  label: string;
};

type FormValue = string | boolean;

type FormState = Record<string, FormValue>;

type EditorState = {
  entity: CaseEntityKey;
  mode: "create" | "edit";
  recordId?: number;
  values: FormState;
};

const ENTITY_ICONS = {
  case_register: ClipboardPlus,
  case_vital: HeartPulse,
  case_lab: FlaskConical,
  case_medication: Pill,
  case_message: MessageSquareMore,
  case_note: NotebookPen,
  case_team: UsersRound,
  case_file: FileText,
  case_close: ShieldCheck,
} as const;

const ENTITY_COLORS: Record<CaseEntityKey, { bg: string; text: string; border: string }> = {
  case_register: { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-200" },
  case_vital: { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
  case_lab: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  case_medication: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  case_message: { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200" },
  case_note: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  case_team: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
  case_file: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
  case_close: { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200" },
};

function padTime(value: number) {
  return String(value).padStart(2, "0");
}

function todayString() {
  const now = new Date();
  return `${now.getFullYear()}-${padTime(now.getMonth() + 1)}-${padTime(now.getDate())}`;
}

function timeString() {
  const now = new Date();
  return `${padTime(now.getHours())}:${padTime(now.getMinutes())}`;
}

function hasValue(value: CaseRecordValue) {
  return !(
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  );
}

function translateStatus(status: string) {
  const v = status.toLowerCase();
  if (v.includes("critical")) return "วิกฤต";
  if (v.includes("active")) return "กำลังรักษา";
  if (v.includes("pending")) return "รอรับเคส";
  if (v.includes("discharge")) return "จำหน่ายแล้ว";
  return status;
}

function translatePriority(priority: string) {
  const v = priority.toUpperCase();
  if (v.includes("IMMEDIATE")) return "ฉุกเฉินทันที";
  if (v.includes("EMERGENCY")) return "ฉุกเฉิน";
  if (v === "URGENT" || v.includes("URGENCY")) return "เร่งด่วน";
  if (v.includes("SEMI")) return "กึ่งเร่งด่วน";
  if (v.includes("NON")) return "ไม่เร่งด่วน";
  return priority;
}

function statusTone(status: string) {
  const value = status.toLowerCase();
  if (value.includes("critical")) return "bg-rose-100 text-rose-700 ring-1 ring-rose-200";
  if (value.includes("active")) return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
  if (value.includes("pending")) return "bg-amber-100 text-amber-800 ring-1 ring-amber-200";
  if (value.includes("discharge")) return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  return "bg-sky-100 text-sky-700 ring-1 ring-sky-200";
}

function mergeOptions(baseOptions: SelectOption[], currentValue: string) {
  if (!currentValue) return baseOptions;
  if (baseOptions.some((option) => option.value === currentValue)) return baseOptions;
  return [{ value: currentValue, label: `${currentValue} (ค่าปัจจุบัน)` }, ...baseOptions];
}

function defaultFieldValue(field: CaseFieldConfig): FormValue {
  if (field.type === "checkbox") return Boolean(field.defaultValue ?? false);
  if (field.defaultValue === "today") return todayString();
  if (field.defaultValue === "now") return timeString();
  if (typeof field.defaultValue === "string" || typeof field.defaultValue === "number") {
    return String(field.defaultValue);
  }
  return "";
}

function buildFormState(
  fields: readonly CaseFieldConfig[],
  record?: CaseTransactionRecord | Record<string, CaseRecordValue>
) {
  return Object.fromEntries(
    fields.map((field) => {
      const rawValue = record?.[field.name];
      if (field.type === "checkbox") return [field.name, Boolean(rawValue)];
      if (typeof rawValue === "number" || typeof rawValue === "string") {
        return [field.name, String(rawValue)];
      }
      return [field.name, defaultFieldValue(field)];
    })
  ) as FormState;
}

function resolveTimestamp(
  fields: readonly CaseFieldConfig[],
  record: CaseTransactionRecord
) {
  const dateField = fields.find((field) => field.type === "date");
  const timeField = fields.find((field) => field.type === "time");
  const parts = [dateField?.name ? record[dateField.name] : null];
  if (timeField?.name) parts.push(record[timeField.name]);
  return parts
    .filter((value) => hasValue(value as CaseRecordValue))
    .map((value) => String(value))
    .join(" ");
}

function fieldSpan(field: CaseFieldConfig) {
  return field.type === "textarea" ? "sm:col-span-2" : "";
}

function createActionLabel(entity: CaseChildEntityKey) {
  if (entity === "case_close") return "ปิดเคส";
  return `เพิ่ม${CASE_TRANSACTION_CONFIG[entity].singularLabel}`;
}

function submitActionLabel(entity: CaseEntityKey, mode: "create" | "edit") {
  if (entity === "case_close" && mode === "create") return "ยืนยันปิดเคส";
  return mode === "create" ? "บันทึก" : "บันทึกการแก้ไข";
}

function successTitle(entity: CaseEntityKey, mode: "create" | "edit") {
  if (entity === "case_close" && mode === "create") return "ปิดเคสเรียบร้อย";
  const config = CASE_TRANSACTION_CONFIG[entity];
  return mode === "create" ? `เพิ่ม${config.singularLabel}เรียบร้อย` : `แก้ไข${config.singularLabel}เรียบร้อย`;
}

function detailValue(
  field: CaseFieldConfig,
  value: CaseRecordValue,
  lookups: Record<string, Map<string, string>>
) {
  if (!hasValue(value)) return "-";
  if (field.type === "checkbox") return value ? "ใช่" : "ไม่";
  if (field.type === "select" && field.optionSource) {
    return lookups[field.optionSource].get(String(value)) ?? String(value);
  }
  return String(value);
}

export function CaseWorkspaceView({ workspace }: { workspace: CaseWorkspace }) {
  const router = useRouter();
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { caseRegister, patient, options, transactions } = workspace;

  const optionSets = useMemo(() => ({
    priorities: options.priorities.map((item) => ({ value: item.name, label: item.name })),
    specialties: options.specialties.map((item) => ({ value: item.name, label: item.name })),
    providers: options.providers.map((item) => ({
      value: String(item.id),
      label: item.specialty ? `${item.name} • ${item.specialty}` : item.name,
    })),
  }), [options]);

  const optionLookups = useMemo(() => ({
    priorities: new Map(optionSets.priorities.map((item) => [item.value, item.label])),
    specialties: new Map(optionSets.specialties.map((item) => [item.value, item.label])),
    providers: new Map(optionSets.providers.map((item) => [item.value, item.label])),
  }), [optionSets]);

  const totalTransactions = CASE_CHILD_TRANSACTION_ORDER.reduce(
    (total, entity) => total + transactions[entity].length,
    0
  );

  const activeSections = CASE_CHILD_TRANSACTION_ORDER.filter(
    (entity) => transactions[entity].length > 0
  ).length;

  function openCaseOverviewEditor() {
    setFormError(null);
    setEditor({
      entity: "case_register",
      mode: "edit",
      values: buildFormState(CASE_TRANSACTION_CONFIG.case_register.fields, caseRegister),
    });
  }

  function openCreateEditor(entity: CaseChildEntityKey) {
    setFormError(null);
    setEditor({
      entity,
      mode: "create",
      values: buildFormState(CASE_TRANSACTION_CONFIG[entity].fields),
    });
  }

  function openEditEditor(entity: CaseChildEntityKey, record: CaseTransactionRecord) {
    setFormError(null);
    setEditor({
      entity,
      mode: "edit",
      recordId: record.id,
      values: buildFormState(CASE_TRANSACTION_CONFIG[entity].fields, record),
    });
  }

  function closeEditor() {
    if (isSubmitting) return;
    setEditor(null);
    setFormError(null);
  }

  function updateField(fieldName: string, value: FormValue) {
    setEditor((current) => {
      if (!current) return current;
      return { ...current, values: { ...current.values, [fieldName]: value } };
    });
  }

  function fieldOptions(field: CaseFieldConfig) {
    if (!field.optionSource) return [];
    const currentValue = editor ? String(editor.values[field.name] ?? "") : "";
    return mergeOptions(optionSets[field.optionSource], currentValue);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    setIsSubmitting(true);
    setFormError(null);

    try {
      const config = CASE_TRANSACTION_CONFIG[editor.entity];
      const payload = Object.fromEntries(
        config.fields.map((field) => [field.name, editor.values[field.name]])
      );

      const endpoint =
        editor.entity === "case_register"
          ? `/api/case-register/${caseRegister.id}`
          : editor.mode === "create"
            ? `/api/case-register/${caseRegister.id}/transactions/${editor.entity}`
            : `/api/case-register/${caseRegister.id}/transactions/${editor.entity}/${editor.recordId}`;

      const method =
        editor.entity === "case_register"
          ? "PUT"
          : editor.mode === "create"
            ? "POST"
            : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "บันทึกไม่สำเร็จ");
      }

      await Swal.fire({
        icon: "success",
        title: successTitle(editor.entity, editor.mode),
        confirmButtonColor: "#0369a1",
        confirmButtonText: "ตกลง",
      });

      setEditor(null);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "ไม่สามารถบันทึกได้";
      setFormError(message);
      await Swal.fire({
        icon: "error",
        title: "บันทึกไม่สำเร็จ",
        text: message,
        confirmButtonColor: "#dc2626",
        confirmButtonText: "ปิด",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(entity: CaseChildEntityKey, record: CaseTransactionRecord) {
    const config = CASE_TRANSACTION_CONFIG[entity];
    const result = await Swal.fire({
      icon: "warning",
      title: entity === "case_close" ? "เปิดเคสใหม่?" : `ลบ${config.singularLabel}นี้?`,
      text:
        entity === "case_close"
          ? "ระบบจะลบบันทึกการปิดเคสและเปิดเคสอีกครั้ง"
          : "ข้อมูลจะถูกลบออกจากเคสอย่างถาวร",
      showCancelButton: true,
      confirmButtonText: entity === "case_close" ? "เปิดเคสใหม่" : "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: entity === "case_close" ? "#0369a1" : "#dc2626",
      cancelButtonColor: "#64748b",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `/api/case-register/${caseRegister.id}/transactions/${entity}/${record.id}`,
        { method: "DELETE" }
      );

      const payload = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "ไม่สามารถลบได้");
      }

      await Swal.fire({
        icon: "success",
        title: entity === "case_close" ? "เปิดเคสเรียบร้อย" : "ลบเรียบร้อย",
        confirmButtonColor: "#0369a1",
        confirmButtonText: "ตกลง",
      });

      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "ไม่สามารถลบได้";
      await Swal.fire({
        icon: "error",
        title: "ลบไม่สำเร็จ",
        text: message,
        confirmButtonColor: "#dc2626",
        confirmButtonText: "ปิด",
      });
    }
  }

  const editorConfig = editor ? CASE_TRANSACTION_CONFIG[editor.entity] : null;
  const editorTitle = editor
    ? editor.entity === "case_register"
      ? "แก้ไขรายละเอียดเคส"
      : editor.mode === "create"
        ? createActionLabel(editor.entity)
        : `แก้ไข${CASE_TRANSACTION_CONFIG[editor.entity].singularLabel}`
    : "";

  return (
    <>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 text-slate-900 sm:gap-5">
        {/* Back link */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/case-register"
            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-sm font-medium text-sky-700 shadow-sm transition hover:bg-sky-50 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปทะเบียน
          </Link>
          <div className="text-xs text-slate-500">
            เคส #{caseRegister.id} · ผู้ป่วย #{patient.id}
          </div>
        </div>

        {/* Patient header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              {patient.full_name}
            </h1>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${statusTone(caseRegister.status)}`}>
                {translateStatus(caseRegister.status)}
              </span>
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                {translatePriority(caseRegister.priority)}
              </span>
              {caseRegister.specialty && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                  {caseRegister.specialty}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <WorkspaceChip icon={ClipboardPlus} label="รายการ" value={totalTransactions} />
            <WorkspaceChip icon={ShieldCheck} label="หัวข้อ" value={activeSections} />
            <WorkspaceChip
              icon={HeartPulse}
              label="สถานะ"
              value={caseRegister.is_closed ? "ปิด" : "เปิด"}
              tone={caseRegister.is_closed ? "slate" : "emerald"}
            />
          </div>
        </header>

        {/* Patient summary + Case overview */}
        <section className="grid gap-4 sm:gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                <UsersRound className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">ข้อมูลผู้ป่วย</h2>
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <SummaryItem label="โรงพยาบาล" value={patient.hosname || "-"} />
              <SummaryItem label="รหัสโรงพยาบาล" value={patient.hoscode} />
              <SummaryItem label="HN" value={patient.hn} />
              <SummaryItem label="AN" value={patient.an} />
              <SummaryItem label="PID" value={patient.pid} />
              <SummaryItem label="เพศ" value={patient.gender === "male" ? "ชาย" : patient.gender === "female" ? "หญิง" : patient.gender || "-"} />
              <SummaryItem label="กรุ๊ปเลือด" value={patient.blood_type || "-"} />
              <SummaryItem
                label="วันที่รับไว้"
                value={[patient.admit_date, patient.admit_time].filter(Boolean).join(" ") || "-"}
              />
            </div>
          </article>

          <article className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white">
                  <ClipboardPlus className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900 sm:text-lg">รายละเอียดเคส</h2>
              </div>
              <button
                type="button"
                onClick={openCaseOverviewEditor}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-95 sm:text-sm"
              >
                <PencilLine className="h-4 w-4" />
                แก้ไข
              </button>
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <SummaryItem
                label="วันที่บันทึก"
                value={[caseRegister.record_date, caseRegister.record_time].filter(Boolean).join(" ") || "-"}
              />
              <SummaryItem label="ผู้ส่งเคส" value={caseRegister.sender_id || "-"} />
              <SummaryItem label="การดำเนินการล่าสุด" value={caseRegister.last_action || "-"} />
              <SummaryItem label="อัปเดตล่าสุด" value={caseRegister.last_active_time || "-"} />
              <SummaryItem label="เหตุผลที่ปรึกษา" value={caseRegister.reason || "-"} full />
              <SummaryItem label="อาการปัจจุบัน" value={caseRegister.current_symptoms || "-"} full />
              <SummaryItem label="การวินิจฉัยเบื้องต้น" value={caseRegister.initial_diagnosis || "-"} full />
              <SummaryItem label="บันทึกทางคลินิก" value={caseRegister.clinical_notes || "-"} full />
            </div>
          </article>
        </section>

        {/* Section navigation pills - horizontal scroll on mobile */}
        <section className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-4">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
            {CASE_CHILD_TRANSACTION_ORDER.map((entity) => {
              const Icon = ENTITY_ICONS[entity];
              const c = ENTITY_COLORS[entity];
              const count = transactions[entity].length;
              return (
                <a
                  key={entity}
                  href={`#${entity}`}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border ${c.border} ${c.bg} px-3 py-1.5 text-xs font-semibold ${c.text} transition active:scale-95 hover:brightness-105`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {CASE_TRANSACTION_CONFIG[entity].label}
                  <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[10px]">
                    {count}
                  </span>
                </a>
              );
            })}
          </div>
        </section>

        {/* Transaction sections */}
        {CASE_CHILD_TRANSACTION_ORDER.map((entity) => {
          const config = CASE_TRANSACTION_CONFIG[entity];
          const Icon = ENTITY_ICONS[entity];
          const c = ENTITY_COLORS[entity];
          const records = transactions[entity];
          const maxRecords = "maxRecords" in config ? config.maxRecords : undefined;
          const isMaxed = Boolean(maxRecords && records.length >= maxRecords);

          return (
            <section
              key={entity}
              id={entity}
              className="scroll-mt-24 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.bg} ${c.text} sm:h-11 sm:w-11`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                      {config.label}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {records.length === 0 ? "ยังไม่มีข้อมูล" : `${records.length} รายการ`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openCreateEditor(entity)}
                  disabled={isMaxed}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isMaxed
                      ? "cursor-not-allowed border border-slate-200 bg-slate-50 text-slate-400"
                      : "bg-sky-600 text-white shadow-sm hover:bg-sky-700 active:scale-95"
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  {isMaxed ? "เพิ่มไปแล้ว" : createActionLabel(entity)}
                </button>
              </div>

              {records.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-sky-200 bg-sky-50/50 px-4 py-8 text-center text-sm text-slate-500 sm:rounded-2xl">
                  {config.emptyTitle}
                </div>
              ) : (
                <div className="mt-4 grid gap-3 sm:gap-4">
                  {records.map((record) => {
                    const timestamp = resolveTimestamp(config.fields, record);
                    const detailFields = config.fields.filter(
                      (field) =>
                        hasValue(record[field.name]) &&
                        !(Boolean(timestamp) && (field.type === "date" || field.type === "time"))
                    );

                    return (
                      <article
                        key={record.id}
                        className="overflow-hidden rounded-xl border border-sky-100 sm:rounded-2xl"
                      >
                        <div className="flex flex-col gap-2 border-b border-sky-100 bg-sky-50/40 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold ${c.bg} ${c.text}`}>
                                #{record.id}
                              </span>
                              <span className="text-xs font-semibold text-slate-700">
                                {config.singularLabel}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {timestamp || "ไม่ระบุเวลา"}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditEditor(entity, record)}
                              className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-50 active:scale-95"
                            >
                              <PencilLine className="h-3.5 w-3.5" />
                              แก้ไข
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(entity, record)}
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 active:scale-95"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {entity === "case_close" ? "เปิดใหม่" : "ลบ"}
                            </button>
                          </div>
                        </div>

                        <div className="grid gap-2.5 px-4 py-3 sm:grid-cols-2 lg:grid-cols-3">
                          {detailFields.map((field) => (
                            <DetailCard
                              key={`${record.id}-${field.name}`}
                              label={field.label}
                              value={detailValue(field, record[field.name], optionLookups)}
                              multiline={field.type === "textarea"}
                            />
                          ))}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </main>

      {/* Editor modal */}
      {editor && editorConfig && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border-t border-sky-100 bg-white shadow-2xl sm:max-w-3xl sm:rounded-3xl sm:border">
            <div className="flex items-center justify-between border-b border-sky-100 bg-sky-50/60 px-4 py-4 sm:px-6 sm:py-5">
              <h2 className="min-w-0 truncate text-lg font-bold text-slate-900 sm:text-xl">
                {editorTitle}
              </h2>
              <button
                type="button"
                onClick={closeEditor}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-200 bg-white text-slate-600 transition hover:bg-sky-50 active:scale-95"
                aria-label="ปิด"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto px-4 py-5 sm:grid-cols-2 sm:gap-4 sm:px-6">
                {editorConfig.fields.map((field) => (
                  <label
                    key={field.name}
                    className={`flex flex-col gap-1.5 text-sm text-slate-700 ${fieldSpan(field)}`}
                  >
                    {field.type === "checkbox" ? (
                      <span className="text-xs font-semibold text-slate-600">{field.label}</span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-600">
                        {field.label}
                        {field.required && <span className="text-rose-500"> *</span>}
                      </span>
                    )}

                    {field.type === "textarea" && (
                      <textarea
                        rows={field.rows ?? 4}
                        value={String(editor.values[field.name] ?? "")}
                        onChange={(event) => updateField(field.name, event.target.value)}
                        className={`${inputClassName} min-h-24 resize-y`}
                        placeholder={field.placeholder}
                      />
                    )}

                    {field.type === "text" && (
                      <input
                        value={String(editor.values[field.name] ?? "")}
                        onChange={(event) => updateField(field.name, event.target.value)}
                        className={inputClassName}
                        placeholder={field.placeholder}
                      />
                    )}

                    {field.type === "number" && (
                      <input
                        type="number"
                        inputMode="decimal"
                        value={String(editor.values[field.name] ?? "")}
                        onChange={(event) => updateField(field.name, event.target.value)}
                        className={inputClassName}
                        min={field.min}
                        step={field.step}
                        placeholder={field.placeholder}
                      />
                    )}

                    {field.type === "date" && (
                      <input
                        type="date"
                        value={String(editor.values[field.name] ?? "")}
                        onChange={(event) => updateField(field.name, event.target.value)}
                        className={inputClassName}
                      />
                    )}

                    {field.type === "time" && (
                      <input
                        type="time"
                        value={String(editor.values[field.name] ?? "")}
                        onChange={(event) => updateField(field.name, event.target.value)}
                        className={inputClassName}
                      />
                    )}

                    {field.type === "select" && (
                      <select
                        value={String(editor.values[field.name] ?? "")}
                        onChange={(event) => updateField(field.name, event.target.value)}
                        className={inputClassName}
                      >
                        <option value="">-- เลือก{field.label} --</option>
                        {fieldOptions(field).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === "checkbox" && (
                      <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-sky-200 bg-sky-50/60 px-4 py-3 text-sm text-slate-700 transition hover:bg-sky-50">
                        <input
                          type="checkbox"
                          checked={Boolean(editor.values[field.name])}
                          onChange={(event) => updateField(field.name, event.target.checked)}
                          className="h-4 w-4 rounded border-sky-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span>{field.label}</span>
                      </label>
                    )}
                  </label>
                ))}
              </div>

              {formError && (
                <div className="px-4 pb-3 sm:px-6">
                  <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
                    ⚠️ {formError}
                  </div>
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 border-t border-sky-100 bg-sky-50/40 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "กำลังบันทึก..." : submitActionLabel(editor.entity, editor.mode)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function WorkspaceChip({
  icon: Icon,
  label,
  value,
  tone = "sky",
}: {
  icon: typeof ClipboardPlus;
  label: string;
  value: number | string;
  tone?: "sky" | "emerald" | "slate";
}) {
  const toneMap = {
    sky: "text-sky-700 bg-sky-50 border-sky-200",
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-200",
    slate: "text-slate-600 bg-slate-50 border-slate-200",
  };
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs ${toneMap[tone]}`}>
      <Icon className="h-3.5 w-3.5" />
      <span className="font-semibold">{label}</span>
      <span className="font-bold text-slate-900">{value}</span>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  full,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-sky-100 bg-sky-50/40 p-3 ${
        full ? "sm:col-span-2" : ""
      }`}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider text-sky-600">
        {label}
      </div>
      <div className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">
        {value}
      </div>
    </div>
  );
}

function DetailCard({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-sky-600">
        {label}
      </div>
      <div
        className={`mt-1 text-sm leading-6 text-slate-800 ${
          multiline ? "whitespace-pre-wrap break-words" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

const inputClassName =
  "w-full rounded-xl border border-sky-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100";
