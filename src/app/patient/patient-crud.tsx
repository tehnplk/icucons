"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ClipboardPlus,
  PencilLine,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import type {
  ChoiceOption,
  HospitalOption,
  PatientListItem,
  PatientPayload,
} from "@/lib/patient";

type PatientCrudProps = {
  initialPatients: PatientListItem[];
  hospitals: HospitalOption[];
  preNames: ChoiceOption[];
  genders: ChoiceOption[];
  bloodTypes: ChoiceOption[];
  dischargeTypes: ChoiceOption[];
};

type FormState = {
  hoscode: string;
  pid: string;
  hn: string;
  an: string;
  admit_date: string;
  admit_time: string;
  pre_name: string;
  first_name: string;
  last_name: string;
  gender: string;
  birth_date: string;
  phone_number: string;
  district: string;
  province: string;
  blood_type_id: string;
  discharge_date: string;
  discharge_time: string;
  discharge_type: string;
  discharge_note: string;
};

const EMPTY_FORM: FormState = {
  hoscode: "",
  pid: "",
  hn: "",
  an: "",
  admit_date: "",
  admit_time: "",
  pre_name: "",
  first_name: "",
  last_name: "",
  gender: "",
  birth_date: "",
  phone_number: "",
  district: "",
  province: "",
  blood_type_id: "",
  discharge_date: "",
  discharge_time: "",
  discharge_type: "",
  discharge_note: "",
};

function toFormState(patient?: PatientListItem | null): FormState {
  if (!patient) return EMPTY_FORM;

  return {
    hoscode: patient.hoscode ?? "",
    pid: patient.pid ?? "",
    hn: patient.hn ?? "",
    an: patient.an ?? "",
    admit_date: patient.admit_date ?? "",
    admit_time: patient.admit_time ?? "",
    pre_name: patient.pre_name ?? "",
    first_name: patient.first_name ?? "",
    last_name: patient.last_name ?? "",
    gender: patient.gender ?? "",
    birth_date: patient.birth_date ?? "",
    phone_number: patient.phone_number ?? "",
    district: patient.district ?? "",
    province: patient.province ?? "",
    blood_type_id: String(patient.blood_type_id ?? ""),
    discharge_date: patient.discharge_date ?? "",
    discharge_time: patient.discharge_time ?? "",
    discharge_type: patient.discharge_type ?? "",
    discharge_note: patient.discharge_note ?? "",
  };
}

function toPayload(form: FormState): PatientPayload {
  return {
    hoscode: form.hoscode.trim(),
    pid: form.pid.trim(),
    hn: form.hn.trim(),
    an: form.an.trim(),
    admit_date: form.admit_date.trim() || null,
    admit_time: form.admit_time.trim() || null,
    pre_name: form.pre_name.trim(),
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    gender: form.gender.trim(),
    birth_date: form.birth_date.trim() || null,
    phone_number: form.phone_number.trim() || null,
    district: form.district.trim() || null,
    province: form.province.trim() || null,
    blood_type_id: Number(form.blood_type_id),
    discharge_date: form.discharge_date.trim() || null,
    discharge_time: form.discharge_time.trim() || null,
    discharge_type: form.discharge_type.trim() || null,
    discharge_note: form.discharge_note.trim() || null,
  };
}

function joinLabel(patient: PatientListItem) {
  return `${patient.pre_name}${patient.first_name} ${patient.last_name}`.trim();
}

function mergeOptions(
  baseOptions: Array<{ value: string; label: string }>,
  currentValue: string,
  currentLabel?: string
) {
  if (!currentValue) return baseOptions;
  if (baseOptions.some((option) => option.value === currentValue)) {
    return baseOptions;
  }

  return [
    {
      value: currentValue,
      label: currentLabel ? `${currentLabel} (current)` : `${currentValue} (current)`,
    },
    ...baseOptions,
  ];
}

async function readJson(response: Response) {
  const payload = (await response.json()) as {
    ok?: boolean;
    message?: string;
    patients?: PatientListItem[];
  };

  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  return payload;
}

export function PatientCrud({
  initialPatients,
  hospitals,
  preNames,
  genders,
  bloodTypes,
  dischargeTypes,
}: PatientCrudProps) {
  const router = useRouter();
  const [patients, setPatients] = useState(initialPatients);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientListItem | null>(
    null
  );
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needle = query.trim().toLowerCase();
  const filteredPatients = !needle
    ? patients
    : patients.filter((patient) => {
        const haystack = [
          patient.hn,
          patient.an,
          patient.pid,
          patient.hoscode,
          patient.hosname ?? "",
          patient.first_name,
          patient.last_name,
          patient.phone_number ?? "",
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(needle);
      });

  const hospitalOptions = hospitals.map((hospital) => ({
    value: hospital.hoscode,
    label: `${hospital.hosname} (${hospital.hoscode})`,
  }));
  const preNameOptions = preNames.map((item) => ({
    value: item.name,
    label: item.name,
  }));
  const genderOptions = genders.map((item) => ({
    value: item.name,
    label: item.name,
  }));
  const bloodTypeOptions = bloodTypes.map((item) => ({
    value: String(item.id),
    label: item.name,
  }));
  const dischargeTypeOptions = dischargeTypes.map((item) => ({
    value: item.name,
    label: item.name,
  }));

  const safeHospitalOptions = mergeOptions(
    hospitalOptions,
    form.hoscode,
    editingPatient?.hosname ?? form.hoscode
  );
  const safePreNameOptions = mergeOptions(preNameOptions, form.pre_name);
  const safeGenderOptions = mergeOptions(genderOptions, form.gender);
  const safeBloodTypeOptions = mergeOptions(
    bloodTypeOptions,
    form.blood_type_id,
    editingPatient?.blood_type
  );
  const safeDischargeTypeOptions = mergeOptions(
    dischargeTypeOptions,
    form.discharge_type
  );

  function openCreateModal() {
    setEditingPatient(null);
    setForm(EMPTY_FORM);
    setError(null);
    setIsModalOpen(true);
  }

  function openEditModal(patient: PatientListItem) {
    setEditingPatient(patient);
    setForm(toFormState(patient));
    setError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingPatient(null);
    setForm(EMPTY_FORM);
  }

  async function refreshPatients() {
    const response = await fetch("/api/patients", { cache: "no-store" });
    const payload = await readJson(response);
    setPatients(payload.patients ?? []);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const method = editingPatient ? "PUT" : "POST";
      const url = editingPatient
        ? `/api/patients/${editingPatient.id}`
        : "/api/patients";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toPayload(form)),
      });

      await readJson(response);
      await refreshPatients();
      closeModal();
      await Swal.fire({
        icon: "success",
        title: editingPatient ? "Patient updated" : "Patient created",
        text: editingPatient
          ? "The patient record has been updated successfully."
          : "The new patient record has been added successfully.",
        confirmButtonColor: "#0f172a",
      });
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Unable to save";
      setError(message);
      await Swal.fire({
        icon: "error",
        title: "Save failed",
        text: message,
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(patient: PatientListItem) {
    setError(null);

    try {
      const result = await Swal.fire({
        icon: "warning",
        title: `Delete ${joinLabel(patient)}?`,
        text: "This action will remove the patient record from the database.",
        showCancelButton: true,
        confirmButtonText: "Delete patient",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#334155",
      });

      if (!result.isConfirmed) return;

      const response = await fetch(`/api/patients/${patient.id}`, {
        method: "DELETE",
      });

      await readJson(response);
      await refreshPatients();
      setEditingPatient(null);
      await Swal.fire({
        icon: "success",
        title: "Patient deleted",
        text: "The patient record has been removed successfully.",
        confirmButtonColor: "#0f172a",
      });
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "Unable to delete";
      setError(message);
      await Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: message,
        confirmButtonColor: "#dc2626",
      });
    }
  }

  async function handleSendCase(patient: PatientListItem) {
    setError(null);

    try {
      const response = await fetch("/api/case-register/from-patient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ patient_id: patient.id }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        created?: boolean;
        message?: string;
        caseRegisterId?: number;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "Unable to send case");
      }

      await Swal.fire({
        icon: "success",
        title: payload.created ? "Case sent" : "Case already exists",
        text: payload.created
          ? `${joinLabel(patient)} has been added to case register.`
          : `${joinLabel(patient)} already has a case register entry.`,
        confirmButtonColor: "#0f172a",
      });

      if (payload.caseRegisterId) {
        router.push(`/case-register/${payload.caseRegisterId}`);
      } else {
        router.push("/case-register");
      }
      router.refresh();
    } catch (sendError) {
      const message =
        sendError instanceof Error ? sendError.message : "Unable to send case";
      setError(message);
      await Swal.fire({
        icon: "error",
        title: "Send case failed",
        text: message,
        confirmButtonColor: "#dc2626",
      });
    }
  }

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 text-slate-900">
        <section className="rounded-[28px] border border-slate-200 bg-white">
          <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.3fr_0.9fr] lg:px-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Patient
              </p>
              <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                Patient registry
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                View and manage patient records.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Users className="h-5 w-5 text-amber-300" />
                <div className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                  Total
                </div>
                <div className="mt-1 text-2xl font-semibold">{patients.length}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Building2 className="h-5 w-5 text-sky-500" />
                <div className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                  Hospitals
                </div>
                <div className="mt-1 text-2xl font-semibold">{hospitals.length}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Search className="h-5 w-5 text-emerald-500" />
                <div className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                  Search
                </div>
                <div className="mt-1 text-2xl font-semibold">{filteredPatients.length}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by name, HN, AN, PID, phone, hospital..."
                  className="min-w-0 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
            >
              <Plus className="h-4 w-4" />
              Add patient
            </button>
          </div>

          {error && (
            <div
              className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {error}
            </div>
          )}

          <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Patient</th>
                    <th className="px-4 py-3 font-semibold">Hospital</th>
                    <th className="px-4 py-3 font-semibold">ID</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 font-semibold">Admit</th>
                    <th className="px-4 py-3 font-semibold text-right">#</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="align-top">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 font-semibold text-slate-900">
                          <UserRound className="h-4 w-4 text-slate-400" />
                          {joinLabel(patient)}
                        </div>
                        <div className="mt-1 text-slate-500">
                          {patient.gender} • {patient.blood_type}
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleSendCase(patient)}
                          disabled={patient.has_case_register}
                          className={`mt-3 inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                            patient.has_case_register
                              ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                              : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {patient.has_case_register ? (
                            <Stethoscope className="h-3.5 w-3.5" />
                          ) : (
                            <ClipboardPlus className="h-3.5 w-3.5" />
                          )}
                          {patient.has_case_register ? "Consult" : "Send case"}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-800">
                          {patient.hosname || "-"}
                        </div>
                        <div className="mt-1 text-slate-500">{patient.hoscode}</div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <div>{patient.hn}</div>
                        <div>{patient.an}</div>
                        <div>{patient.pid}</div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <div>{patient.phone_number || "-"}</div>
                        <div className="mt-1">
                          {[patient.district, patient.province]
                            .filter(Boolean)
                            .join(", ") || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <div>{patient.admit_date || "-"}</div>
                        <div className="mt-1">{patient.admit_time || "-"}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(patient)}
                            type="button"
                            title="Edit"
                            aria-label={`Edit ${joinLabel(patient)}`}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-amber-500 hover:text-amber-700"
                          >
                            <PencilLine className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => void handleDelete(patient)}
                            type="button"
                            title="Delete"
                            aria-label={`Delete ${joinLabel(patient)}`}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 text-rose-700 transition hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredPatients.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-slate-500"
                      >
                        No patients match the current search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-slate-950/35 p-4 py-10">
          <div className="w-full max-w-5xl rounded-[28px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">
                  {editingPatient ? "Edit patient" : "Create patient"}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600"
              >
                <X className="h-4 w-4" />
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="Hospital" required>
                  <select
                    value={form.hoscode}
                    onChange={(event) => updateField("hoscode", event.target.value)}
                    className={inputClassName}
                    required
                  >
                    <option value="">Select hospital</option>
                    {safeHospitalOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="PID" required>
                  <input
                    value={form.pid}
                    onChange={(event) => updateField("pid", event.target.value)}
                    className={inputClassName}
                    required
                  />
                </Field>

                <Field label="HN" required>
                  <input
                    value={form.hn}
                    onChange={(event) => updateField("hn", event.target.value)}
                    className={inputClassName}
                    required
                  />
                </Field>

                <Field label="AN" required>
                  <input
                    value={form.an}
                    onChange={(event) => updateField("an", event.target.value)}
                    className={inputClassName}
                    required
                  />
                </Field>

                <Field label="Pre-name" required>
                  <select
                    value={form.pre_name}
                    onChange={(event) => updateField("pre_name", event.target.value)}
                    className={inputClassName}
                    required
                  >
                    <option value="">Select pre-name</option>
                    {safePreNameOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="First name" required>
                  <input
                    value={form.first_name}
                    onChange={(event) =>
                      updateField("first_name", event.target.value)
                    }
                    className={inputClassName}
                    required
                  />
                </Field>

                <Field label="Last name" required>
                  <input
                    value={form.last_name}
                    onChange={(event) => updateField("last_name", event.target.value)}
                    className={inputClassName}
                    required
                  />
                </Field>

                <Field label="Gender" required>
                  <select
                    value={form.gender}
                    onChange={(event) => updateField("gender", event.target.value)}
                    className={inputClassName}
                    required
                  >
                    <option value="">Select gender</option>
                    {safeGenderOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Blood type" required>
                  <select
                    value={form.blood_type_id}
                    onChange={(event) =>
                      updateField("blood_type_id", event.target.value)
                    }
                    className={inputClassName}
                    required
                  >
                    <option value="">Select blood type</option>
                    {safeBloodTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Admit date">
                  <input
                    type="date"
                    value={form.admit_date}
                    onChange={(event) =>
                      updateField("admit_date", event.target.value)
                    }
                    className={inputClassName}
                  />
                </Field>

                <Field label="Admit time">
                  <input
                    type="time"
                    value={form.admit_time}
                    onChange={(event) =>
                      updateField("admit_time", event.target.value)
                    }
                    className={inputClassName}
                  />
                </Field>

                <Field label="Birth date">
                  <input
                    type="date"
                    value={form.birth_date}
                    onChange={(event) =>
                      updateField("birth_date", event.target.value)
                    }
                    className={inputClassName}
                  />
                </Field>

                <Field label="Phone number">
                  <input
                    value={form.phone_number}
                    onChange={(event) =>
                      updateField("phone_number", event.target.value)
                    }
                    className={inputClassName}
                  />
                </Field>

                <Field label="District">
                  <input
                    value={form.district}
                    onChange={(event) => updateField("district", event.target.value)}
                    className={inputClassName}
                  />
                </Field>

                <Field label="Province">
                  <input
                    value={form.province}
                    onChange={(event) => updateField("province", event.target.value)}
                    className={inputClassName}
                  />
                </Field>

                <Field label="Discharge date">
                  <input
                    type="date"
                    value={form.discharge_date}
                    onChange={(event) =>
                      updateField("discharge_date", event.target.value)
                    }
                    className={inputClassName}
                  />
                </Field>

                <Field label="Discharge time">
                  <input
                    type="time"
                    value={form.discharge_time}
                    onChange={(event) =>
                      updateField("discharge_time", event.target.value)
                    }
                    className={inputClassName}
                  />
                </Field>

                <Field label="Discharge type">
                  <select
                    value={form.discharge_type}
                    onChange={(event) =>
                      updateField("discharge_type", event.target.value)
                    }
                    className={inputClassName}
                  >
                    <option value="">Select discharge type</option>
                    {safeDischargeTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Discharge note">
                  <textarea
                    value={form.discharge_note}
                    onChange={(event) =>
                      updateField("discharge_note", event.target.value)
                    }
                    className={`${inputClassName} min-h-28 resize-y`}
                  />
                </Field>
              </div>

              {error && (
                <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving
                    ? "Saving..."
                    : editingPatient
                      ? "Save changes"
                      : "Create patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate-700">
      <span className="font-medium">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white";
