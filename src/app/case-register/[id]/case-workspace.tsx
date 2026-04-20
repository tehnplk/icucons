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

function padTime(value: number) {
  return String(value).padStart(2, "0");
}

function todayString() {
  const now = new Date();
  return `${now.getFullYear()}-${padTime(now.getMonth() + 1)}-${padTime(
    now.getDate()
  )}`;
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

function statusTone(status: string) {
  const value = status.toLowerCase();

  if (value.includes("critical")) return "bg-rose-50 text-rose-700";
  if (value.includes("active")) return "bg-emerald-50 text-emerald-700";
  if (value.includes("pending")) return "bg-amber-50 text-amber-700";
  if (value.includes("discharge")) return "bg-slate-100 text-slate-700";

  return "bg-sky-50 text-sky-700";
}

function mergeOptions(baseOptions: SelectOption[], currentValue: string) {
  if (!currentValue) return baseOptions;
  if (baseOptions.some((option) => option.value === currentValue)) {
    return baseOptions;
  }

  return [
    {
      value: currentValue,
      label: `${currentValue} (current)`,
    },
    ...baseOptions,
  ];
}

function defaultFieldValue(field: CaseFieldConfig): FormValue {
  if (field.type === "checkbox") {
    return Boolean(field.defaultValue ?? false);
  }

  if (field.defaultValue === "today") {
    return todayString();
  }

  if (field.defaultValue === "now") {
    return timeString();
  }

  if (
    typeof field.defaultValue === "string" ||
    typeof field.defaultValue === "number"
  ) {
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

      if (field.type === "checkbox") {
        return [field.name, Boolean(rawValue)];
      }

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

  if (timeField?.name) {
    parts.push(record[timeField.name]);
  }

  return parts
    .filter((value) => hasValue(value as CaseRecordValue))
    .map((value) => String(value))
    .join(" ");
}

function fieldSpan(field: CaseFieldConfig) {
  return field.type === "textarea" ? "md:col-span-2" : "";
}

function createActionLabel(entity: CaseChildEntityKey) {
  if (entity === "case_close") return "Close case";
  return `Add ${CASE_TRANSACTION_CONFIG[entity].singularLabel.toLowerCase()}`;
}

function submitActionLabel(entity: CaseEntityKey, mode: "create" | "edit") {
  if (entity === "case_close" && mode === "create") return "Close case";
  return mode === "create" ? "Create" : "Save changes";
}

function successTitle(entity: CaseEntityKey, mode: "create" | "edit") {
  if (entity === "case_close" && mode === "create") return "Case closed";

  const config = CASE_TRANSACTION_CONFIG[entity];
  return mode === "create"
    ? `${config.singularLabel} created`
    : `${config.singularLabel} updated`;
}

function detailValue(
  field: CaseFieldConfig,
  value: CaseRecordValue,
  lookups: Record<string, Map<string, string>>
) {
  if (!hasValue(value)) return "-";

  if (field.type === "checkbox") {
    return value ? "Yes" : "No";
  }

  if (field.type === "select" && field.optionSource) {
    return lookups[field.optionSource].get(String(value)) ?? String(value);
  }

  return String(value);
}

export function CaseWorkspaceView({
  workspace,
}: {
  workspace: CaseWorkspace;
}) {
  const router = useRouter();
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { caseRegister, patient, options, transactions } = workspace;

  const optionSets = useMemo(() => {
    const priorities = options.priorities.map((item) => ({
      value: item.name,
      label: item.name,
    }));
    const specialties = options.specialties.map((item) => ({
      value: item.name,
      label: item.name,
    }));
    const providers = options.providers.map((item) => ({
      value: String(item.id),
      label: item.specialty ? `${item.name} • ${item.specialty}` : item.name,
    }));

    return {
      priorities,
      specialties,
      providers,
    };
  }, [options]);

  const optionLookups = useMemo(
    () => ({
      priorities: new Map(
        optionSets.priorities.map((item) => [item.value, item.label])
      ),
      specialties: new Map(
        optionSets.specialties.map((item) => [item.value, item.label])
      ),
      providers: new Map(
        optionSets.providers.map((item) => [item.value, item.label])
      ),
    }),
    [optionSets]
  );

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
      return {
        ...current,
        values: {
          ...current.values,
          [fieldName]: value,
        },
      };
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Request failed");
      }

      await Swal.fire({
        icon: "success",
        title: successTitle(editor.entity, editor.mode),
        confirmButtonColor: "#0f172a",
      });

      setEditor(null);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save record";
      setFormError(message);
      await Swal.fire({
        icon: "error",
        title: "Save failed",
        text: message,
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(entity: CaseChildEntityKey, record: CaseTransactionRecord) {
    const config = CASE_TRANSACTION_CONFIG[entity];
    const result = await Swal.fire({
      icon: "warning",
      title: entity === "case_close" ? "Reopen case?" : `Delete ${config.singularLabel.toLowerCase()}?`,
      text:
        entity === "case_close"
          ? "This will remove the close record and reopen the case."
          : "This transaction will be removed from the case.",
      showCancelButton: true,
      confirmButtonText: entity === "case_close" ? "Reopen case" : "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: entity === "case_close" ? "#0f172a" : "#dc2626",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `/api/case-register/${caseRegister.id}/transactions/${entity}/${record.id}`,
        {
          method: "DELETE",
        }
      );

      const payload = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "Unable to delete record");
      }

      await Swal.fire({
        icon: "success",
        title: entity === "case_close" ? "Case reopened" : "Record deleted",
        confirmButtonColor: "#0f172a",
      });

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to delete record";

      await Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: message,
        confirmButtonColor: "#dc2626",
      });
    }
  }

  const editorConfig = editor ? CASE_TRANSACTION_CONFIG[editor.entity] : null;
  const editorTitle = editor
    ? editor.entity === "case_register"
      ? "Edit case overview"
      : editor.mode === "create"
        ? createActionLabel(editor.entity)
        : `Edit ${CASE_TRANSACTION_CONFIG[editor.entity].singularLabel.toLowerCase()}`
    : "";

  return (
    <>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 text-slate-900">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/case-register"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to case register
          </Link>
          <div className="text-sm text-slate-500">
            Case #{caseRegister.id} • Patient #{patient.id}
          </div>
        </div>

        <section className="rounded-[28px] border border-slate-200 bg-white">
          <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.3fr_0.9fr] lg:px-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Consult
              </p>
              <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                {patient.full_name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(
                    caseRegister.status
                  )}`}
                >
                  {caseRegister.status}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {caseRegister.priority}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {caseRegister.specialty || "No specialty"}
                </span>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                ทุก transaction ในกลุ่ม <code>case_*</code> ของเคสนี้เริ่มจาก
                <code> case_register</code> รายการเดียวกัน
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <ClipboardPlus className="h-5 w-5 text-slate-700" />
                <div className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                  Transactions
                </div>
                <div className="mt-1 text-2xl font-semibold">{totalTransactions}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <div className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                  Sections
                </div>
                <div className="mt-1 text-2xl font-semibold">{activeSections}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <HeartPulse className="h-5 w-5 text-rose-500" />
                <div className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                  Closed
                </div>
                <div className="mt-1 text-2xl font-semibold">
                  {caseRegister.is_closed ? "Yes" : "No"}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[28px] border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Patient
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">
                  Patient summary
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <SummaryItem label="Hospital" value={patient.hosname || "-"} />
              <SummaryItem label="Hoscode" value={patient.hoscode} />
              <SummaryItem label="HN" value={patient.hn} />
              <SummaryItem label="AN" value={patient.an} />
              <SummaryItem label="PID" value={patient.pid} />
              <SummaryItem label="Gender" value={patient.gender} />
              <SummaryItem label="Blood" value={patient.blood_type || "-"} />
              <SummaryItem
                label="Admit"
                value={[patient.admit_date, patient.admit_time].filter(Boolean).join(" ") || "-"}
              />
            </div>
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Case register
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">
                  Case overview
                </h2>
              </div>
              <button
                type="button"
                onClick={openCaseOverviewEditor}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <PencilLine className="h-4 w-4" />
                Edit
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <SummaryItem label="Record" value={[caseRegister.record_date, caseRegister.record_time].filter(Boolean).join(" ") || "-"} />
              <SummaryItem label="Sender" value={caseRegister.sender_id || "-"} />
              <SummaryItem label="Last action" value={caseRegister.last_action || "-"} />
              <SummaryItem label="Last active" value={caseRegister.last_active_time || "-"} />
              <SummaryItem label="Reason" value={caseRegister.reason || "-"} full />
              <SummaryItem
                label="Symptoms"
                value={caseRegister.current_symptoms || "-"}
                full
              />
              <SummaryItem
                label="Diagnosis"
                value={caseRegister.initial_diagnosis || "-"}
                full
              />
              <SummaryItem
                label="Clinical notes"
                value={caseRegister.clinical_notes || "-"}
                full
              />
            </div>
          </article>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap gap-2">
            {CASE_CHILD_TRANSACTION_ORDER.map((entity) => {
              const Icon = ENTITY_ICONS[entity];
              return (
                <a
                  key={entity}
                  href={`#${entity}`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <Icon className="h-4 w-4" />
                  {CASE_TRANSACTION_CONFIG[entity].label}
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {transactions[entity].length}
                  </span>
                </a>
              );
            })}
          </div>
        </section>

        {CASE_CHILD_TRANSACTION_ORDER.map((entity) => {
          const config = CASE_TRANSACTION_CONFIG[entity];
          const Icon = ENTITY_ICONS[entity];
          const records = transactions[entity];
          const maxRecords =
            "maxRecords" in config ? config.maxRecords : undefined;
          const isMaxed = Boolean(maxRecords && records.length >= maxRecords);

          return (
            <section
              key={entity}
              id={entity}
              className="rounded-[28px] border border-slate-200 bg-white p-5 scroll-mt-24"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">
                      {config.label}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {records.length} record{records.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openCreateEditor(entity)}
                  disabled={isMaxed}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    isMaxed
                      ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
                      : "bg-slate-950 text-white hover:bg-slate-800"
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  {isMaxed ? "Already added" : createActionLabel(entity)}
                </button>
              </div>

              {records.length === 0 ? (
                <div className="mt-5 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                  {config.emptyTitle}
                </div>
              ) : (
                <div className="mt-5 grid gap-4">
                  {records.map((record) => {
                    const timestamp = resolveTimestamp(config.fields, record);
                    const detailFields = config.fields.filter(
                      (field) =>
                        hasValue(record[field.name]) &&
                        !(
                          Boolean(timestamp) &&
                          (field.type === "date" || field.type === "time")
                        )
                    );

                    return (
                      <article
                        key={record.id}
                        className="overflow-hidden rounded-[24px] border border-slate-200"
                      >
                        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                              {config.singularLabel} #{record.id}
                            </div>
                            <div className="mt-1 text-sm text-slate-600">
                              {timestamp || "No time recorded"}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openEditEditor(entity, record)}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                              <PencilLine className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(entity, record)}
                              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              {entity === "case_close" ? "Reopen" : "Delete"}
                            </button>
                          </div>
                        </div>

                        <div className="grid gap-3 px-4 py-4 md:grid-cols-2 xl:grid-cols-3">
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

      {editor && editorConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {editor.entity.replaceAll("_", " ")}
                </div>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                  {editorTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto px-6 py-6 md:grid-cols-2">
                {editorConfig.fields.map((field) => (
                  <label
                    key={field.name}
                    className={`flex flex-col gap-2 text-sm text-slate-700 ${fieldSpan(field)}`}
                  >
                    {field.type === "checkbox" ? (
                      <span className="font-medium">{field.label}</span>
                    ) : (
                      <span className="font-medium">
                        {field.label}
                        {field.required ? " *" : ""}
                      </span>
                    )}

                    {field.type === "textarea" && (
                      <textarea
                        rows={field.rows ?? 4}
                        value={String(editor.values[field.name] ?? "")}
                        onChange={(event) => updateField(field.name, event.target.value)}
                        className={`${inputClassName} min-h-28 resize-y`}
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
                        <option value="">Select {field.label.toLowerCase()}</option>
                        {fieldOptions(field).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === "checkbox" && (
                      <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={Boolean(editor.values[field.name])}
                          onChange={(event) =>
                            updateField(field.name, event.target.checked)
                          }
                          className="h-4 w-4 rounded border-slate-300"
                        />
                        <span>Enable</span>
                      </label>
                    )}
                  </label>
                ))}
              </div>

              {formError && (
                <div className="px-6 pb-4">
                  <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {formError}
                  </div>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting
                    ? "Saving..."
                    : submitActionLabel(editor.entity, editor.mode)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
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
      className={`rounded-2xl border border-slate-200 bg-slate-50 p-4 ${
        full ? "sm:col-span-2" : ""
      }`}
    >
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">
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
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div
        className={`mt-2 text-sm leading-6 text-slate-800 ${
          multiline ? "whitespace-pre-wrap break-words" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white";
