"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ClipboardPlus,
  MapPin,
  PencilLine,
  Phone,
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

function translateGender(gender: string) {
  const v = gender.toLowerCase();
  if (v === "male" || v.includes("ชาย")) return "ชาย";
  if (v === "female" || v.includes("หญิง")) return "หญิง";
  return gender || "-";
}

function mergeOptions(
  baseOptions: Array<{ value: string; label: string }>,
  currentValue: string,
  currentLabel?: string
) {
  if (!currentValue) return baseOptions;
  if (baseOptions.some((option) => option.value === currentValue)) return baseOptions;
  return [
    {
      value: currentValue,
      label: currentLabel ? `${currentLabel} (ค่าปัจจุบัน)` : `${currentValue} (ค่าปัจจุบัน)`,
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
    throw new Error(payload.message || "ไม่สามารถประมวลผลคำขอได้");
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
  const [editingPatient, setEditingPatient] = useState<PatientListItem | null>(null);
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
  const preNameOptions = preNames.map((item) => ({ value: item.name, label: item.name }));
  const genderOptions = genders.map((item) => ({ value: item.name, label: item.name }));
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
  const safeDischargeTypeOptions = mergeOptions(dischargeTypeOptions, form.discharge_type);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(form)),
      });

      await readJson(response);
      await refreshPatients();
      closeModal();
      await Swal.fire({
        icon: "success",
        title: editingPatient ? "อัปเดตเรียบร้อย" : "เพิ่มผู้ป่วยเรียบร้อย",
        text: editingPatient
          ? "แก้ไขข้อมูลผู้ป่วยสำเร็จ"
          : "เพิ่มข้อมูลผู้ป่วยใหม่สำเร็จ",
        confirmButtonColor: "#0369a1",
        confirmButtonText: "ตกลง",
      });
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "บันทึกไม่สำเร็จ";
      setError(message);
      await Swal.fire({
        icon: "error",
        title: "บันทึกไม่สำเร็จ",
        text: message,
        confirmButtonColor: "#dc2626",
        confirmButtonText: "ปิด",
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
        title: `ลบผู้ป่วย ${joinLabel(patient)}?`,
        text: "ข้อมูลผู้ป่วยจะถูกลบออกจากระบบอย่างถาวร",
        showCancelButton: true,
        confirmButtonText: "ลบ",
        cancelButtonText: "ยกเลิก",
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#64748b",
      });

      if (!result.isConfirmed) return;

      const response = await fetch(`/api/patients/${patient.id}`, { method: "DELETE" });
      await readJson(response);
      await refreshPatients();
      setEditingPatient(null);
      await Swal.fire({
        icon: "success",
        title: "ลบเรียบร้อย",
        text: "ลบข้อมูลผู้ป่วยสำเร็จ",
        confirmButtonColor: "#0369a1",
        confirmButtonText: "ตกลง",
      });
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "ลบไม่สำเร็จ";
      setError(message);
      await Swal.fire({
        icon: "error",
        title: "ลบไม่สำเร็จ",
        text: message,
        confirmButtonColor: "#dc2626",
        confirmButtonText: "ปิด",
      });
    }
  }

  async function handleSendCase(patient: PatientListItem) {
    setError(null);
    try {
      const response = await fetch("/api/case-register/from-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patient.id }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        created?: boolean;
        message?: string;
        caseRegisterId?: number;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "ส่งเคสไม่สำเร็จ");
      }

      await Swal.fire({
        icon: "success",
        title: payload.created ? "ส่งเคสเรียบร้อย" : "เคสนี้มีอยู่แล้ว",
        text: payload.created
          ? `ส่ง ${joinLabel(patient)} เข้าทะเบียนปรึกษาเรียบร้อย`
          : `${joinLabel(patient)} มีเคสในทะเบียนปรึกษาอยู่แล้ว`,
        confirmButtonColor: "#0369a1",
        confirmButtonText: "ตกลง",
      });

      if (payload.caseRegisterId) {
        router.push(`/case-register/${payload.caseRegisterId}`);
      } else {
        router.push("/case-register");
      }
      router.refresh();
    } catch (sendError) {
      const message =
        sendError instanceof Error ? sendError.message : "ส่งเคสไม่สำเร็จ";
      setError(message);
      await Swal.fire({
        icon: "error",
        title: "ส่งเคสไม่สำเร็จ",
        text: message,
        confirmButtonColor: "#dc2626",
        confirmButtonText: "ปิด",
      });
    }
  }

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 text-slate-900 sm:gap-5">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">ทะเบียนผู้ป่วย</h1>
          <div className="flex gap-2">
            <HeaderChip icon={Users} label="ทั้งหมด" value={patients.length} />
            <HeaderChip icon={Building2} label="รพ." value={hospitals.length} />
            <HeaderChip icon={Search} label="ค้นพบ" value={filteredPatients.length} />
          </div>
        </header>

        {/* Search + Add */}
        <section className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ค้นหา ชื่อ / HN / AN / PID / เบอร์โทร / โรงพยาบาล..."
                className="w-full rounded-xl border border-sky-200 bg-sky-50/50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              เพิ่มผู้ป่วย
            </button>
          </div>

          {error && (
            <div className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
              ⚠️ {error}
            </div>
          )}

          {/* Desktop table */}
          <div className="mt-4 hidden overflow-hidden rounded-xl border border-sky-100 lg:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-sky-50/60 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">ผู้ป่วย</th>
                  <th className="px-4 py-3 font-semibold">โรงพยาบาล</th>
                  <th className="px-4 py-3 font-semibold">รหัสประจำตัว</th>
                  <th className="px-4 py-3 font-semibold">ติดต่อ</th>
                  <th className="px-4 py-3 font-semibold">รับไว้</th>
                  <th className="px-4 py-3 text-right font-semibold">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50 bg-white">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="align-top transition hover:bg-sky-50/40">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 font-semibold text-slate-900">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                          <UserRound className="h-4 w-4" />
                        </div>
                        {joinLabel(patient)}
                      </div>
                      <div className="mt-1 ml-10 text-xs text-slate-500">
                        {translateGender(patient.gender)} · {patient.blood_type || "-"}
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleSendCase(patient)}
                        disabled={patient.has_case_register}
                        className={`mt-2 ml-10 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                          patient.has_case_register
                            ? "cursor-not-allowed bg-slate-100 text-slate-400"
                            : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 active:scale-95"
                        }`}
                      >
                        {patient.has_case_register ? (
                          <>
                            <Stethoscope className="h-3.5 w-3.5" />
                            มีเคสแล้ว
                          </>
                        ) : (
                          <>
                            <ClipboardPlus className="h-3.5 w-3.5" />
                            ส่งเคสปรึกษา
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-800">
                        {patient.hosname || "-"}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        รหัส {patient.hoscode}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600">
                      <div>HN: <span className="font-medium text-slate-800">{patient.hn}</span></div>
                      <div className="mt-0.5">AN: <span className="font-medium text-slate-800">{patient.an}</span></div>
                      <div className="mt-0.5">PID: <span className="font-medium text-slate-800">{patient.pid}</span></div>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-sky-500" />
                        {patient.phone_number || "-"}
                      </div>
                      <div className="mt-1 flex items-start gap-1">
                        <MapPin className="mt-0.5 h-3 w-3 text-sky-500" />
                        <span>
                          {[patient.district, patient.province].filter(Boolean).join(", ") || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600">
                      <div>{patient.admit_date || "-"}</div>
                      <div className="mt-1 text-slate-500">{patient.admit_time || ""}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(patient)}
                          type="button"
                          title="แก้ไข"
                          aria-label={`แก้ไข ${joinLabel(patient)}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-sky-200 bg-white text-sky-700 transition hover:bg-sky-50 active:scale-95"
                        >
                          <PencilLine className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => void handleDelete(patient)}
                          type="button"
                          title="ลบ"
                          aria-label={`ลบ ${joinLabel(patient)}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-700 transition hover:bg-rose-50 active:scale-95"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      ไม่พบผู้ป่วยที่ตรงกับการค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="mt-4 space-y-3 lg:hidden">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="rounded-xl border border-sky-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold text-slate-900">
                      {joinLabel(patient)}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {translateGender(patient.gender)} · กรุ๊ปเลือด {patient.blood_type || "-"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid gap-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Building2 className="h-3.5 w-3.5 text-sky-500" />
                    <span className="truncate">
                      {patient.hosname || "-"}{" "}
                      <span className="text-slate-400">· {patient.hoscode}</span>
                    </span>
                  </div>
                  <div className="text-slate-600">
                    <span className="text-slate-400">HN</span> {patient.hn} ·{" "}
                    <span className="text-slate-400">AN</span> {patient.an}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Phone className="h-3.5 w-3.5 text-sky-500" />
                    {patient.phone_number || "-"}
                  </div>
                  {(patient.district || patient.province) && (
                    <div className="flex items-start gap-1.5 text-slate-600">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 text-sky-500" />
                      <span>
                        {[patient.district, patient.province].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleSendCase(patient)}
                    disabled={patient.has_case_register}
                    className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      patient.has_case_register
                        ? "cursor-not-allowed bg-slate-100 text-slate-400"
                        : "bg-emerald-100 text-emerald-700 active:scale-95 active:bg-emerald-200"
                    }`}
                  >
                    {patient.has_case_register ? (
                      <>
                        <Stethoscope className="h-3.5 w-3.5" />
                        มีเคสแล้ว
                      </>
                    ) : (
                      <>
                        <ClipboardPlus className="h-3.5 w-3.5" />
                        ส่งเคส
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(patient)}
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-sky-200 text-sky-700 active:scale-95"
                  >
                    <PencilLine className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => void handleDelete(patient)}
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 text-rose-700 active:scale-95"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {filteredPatients.length === 0 && (
              <div className="py-12 text-center text-sm text-slate-500">
                ไม่พบผู้ป่วยที่ตรงกับการค้นหา
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center overflow-y-auto bg-slate-900/50 backdrop-blur-sm sm:items-start sm:p-4 sm:py-10">
          <div className="w-full max-h-[95vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-4xl sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-sky-100 bg-sky-50/80 px-4 py-4 backdrop-blur sm:px-6 sm:py-5">
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                {editingPatient ? `แก้ไข: ${joinLabel(editingPatient)}` : "เพิ่มผู้ป่วยใหม่"}
              </h2>
              <button
                onClick={closeModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-white text-slate-600 transition hover:bg-sky-50 active:scale-95"
                aria-label="ปิด"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              {/* Section 1: Basic info */}
              <FormSection title="ข้อมูลพื้นฐาน" color="sky">
                <Field label="โรงพยาบาล" required full>
                  <select
                    value={form.hoscode}
                    onChange={(e) => updateField("hoscode", e.target.value)}
                    className={inputClassName}
                    required
                  >
                    <option value="">-- เลือกโรงพยาบาล --</option>
                    {safeHospitalOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="HN" required>
                  <input
                    value={form.hn}
                    onChange={(e) => updateField("hn", e.target.value)}
                    className={inputClassName}
                    placeholder="100001"
                    required
                  />
                </Field>
                <Field label="AN" required>
                  <input
                    value={form.an}
                    onChange={(e) => updateField("an", e.target.value)}
                    className={inputClassName}
                    placeholder="2026-001"
                    required
                  />
                </Field>
                <Field label="เลขบัตรประชาชน (PID)" required full>
                  <input
                    inputMode="numeric"
                    value={form.pid}
                    onChange={(e) => updateField("pid", e.target.value)}
                    className={inputClassName}
                    placeholder="13 หลัก"
                    required
                  />
                </Field>
              </FormSection>

              {/* Section 2: Personal info */}
              <FormSection title="ข้อมูลส่วนตัว" color="indigo">
                <Field label="คำนำหน้า" required>
                  <select
                    value={form.pre_name}
                    onChange={(e) => updateField("pre_name", e.target.value)}
                    className={inputClassName}
                    required
                  >
                    <option value="">-- เลือก --</option>
                    {safePreNameOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="ชื่อ" required>
                  <input
                    value={form.first_name}
                    onChange={(e) => updateField("first_name", e.target.value)}
                    className={inputClassName}
                    required
                  />
                </Field>
                <Field label="นามสกุล" required>
                  <input
                    value={form.last_name}
                    onChange={(e) => updateField("last_name", e.target.value)}
                    className={inputClassName}
                    required
                  />
                </Field>
                <Field label="เพศ" required>
                  <select
                    value={form.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                    className={inputClassName}
                    required
                  >
                    <option value="">-- เลือก --</option>
                    {safeGenderOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="กรุ๊ปเลือด" required>
                  <select
                    value={form.blood_type_id}
                    onChange={(e) => updateField("blood_type_id", e.target.value)}
                    className={inputClassName}
                    required
                  >
                    <option value="">-- เลือก --</option>
                    {safeBloodTypeOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="วันเกิด">
                  <input
                    type="date"
                    value={form.birth_date}
                    onChange={(e) => updateField("birth_date", e.target.value)}
                    className={inputClassName}
                  />
                </Field>
              </FormSection>

              {/* Section 3: Contact */}
              <FormSection title="ข้อมูลติดต่อ" color="emerald">
                <Field label="เบอร์โทร">
                  <input
                    type="tel"
                    inputMode="tel"
                    value={form.phone_number}
                    onChange={(e) => updateField("phone_number", e.target.value)}
                    className={inputClassName}
                    placeholder="08X-XXX-XXXX"
                  />
                </Field>
                <Field label="อำเภอ/เขต">
                  <input
                    value={form.district}
                    onChange={(e) => updateField("district", e.target.value)}
                    className={inputClassName}
                  />
                </Field>
                <Field label="จังหวัด">
                  <input
                    value={form.province}
                    onChange={(e) => updateField("province", e.target.value)}
                    className={inputClassName}
                  />
                </Field>
              </FormSection>

              {/* Section 4: Admit */}
              <FormSection title="การรับผู้ป่วย" color="amber">
                <Field label="วันที่รับไว้">
                  <input
                    type="date"
                    value={form.admit_date}
                    onChange={(e) => updateField("admit_date", e.target.value)}
                    className={inputClassName}
                  />
                </Field>
                <Field label="เวลาที่รับไว้">
                  <input
                    type="time"
                    value={form.admit_time}
                    onChange={(e) => updateField("admit_time", e.target.value)}
                    className={inputClassName}
                  />
                </Field>
              </FormSection>

              {/* Section 5: Discharge */}
              <FormSection title="การจำหน่าย" color="rose">
                <Field label="วันที่จำหน่าย">
                  <input
                    type="date"
                    value={form.discharge_date}
                    onChange={(e) => updateField("discharge_date", e.target.value)}
                    className={inputClassName}
                  />
                </Field>
                <Field label="เวลาจำหน่าย">
                  <input
                    type="time"
                    value={form.discharge_time}
                    onChange={(e) => updateField("discharge_time", e.target.value)}
                    className={inputClassName}
                  />
                </Field>
                <Field label="ประเภทการจำหน่าย">
                  <select
                    value={form.discharge_type}
                    onChange={(e) => updateField("discharge_type", e.target.value)}
                    className={inputClassName}
                  >
                    <option value="">-- เลือก --</option>
                    {safeDischargeTypeOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="หมายเหตุการจำหน่าย" full>
                  <textarea
                    value={form.discharge_note}
                    onChange={(e) => updateField("discharge_note", e.target.value)}
                    className={`${inputClassName} min-h-24 resize-y`}
                  />
                </Field>
              </FormSection>

              {error && (
                <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
                  ⚠️ {error}
                </div>
              )}

              <div className="sticky bottom-0 -mx-4 -mb-4 mt-6 flex flex-col-reverse gap-2 border-t border-sky-100 bg-sky-50/80 px-4 py-4 backdrop-blur sm:-mx-6 sm:-mb-6 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving
                    ? "กำลังบันทึก..."
                    : editingPatient
                      ? "บันทึกการแก้ไข"
                      : "เพิ่มผู้ป่วย"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function HeaderChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs text-sky-700">
      <Icon className="h-3.5 w-3.5" />
      <span className="font-semibold">{label}</span>
      <span className="font-bold text-slate-900">{value}</span>
    </div>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  color?: "sky" | "indigo" | "emerald" | "amber" | "rose";
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 border-t border-sky-100 pt-4 first:border-t-0 first:pt-0">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm text-slate-700 ${full ? "sm:col-span-2 lg:col-span-3" : ""}`}>
      <span className="text-xs font-semibold text-slate-600">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

const inputClassName =
  "w-full rounded-xl border border-sky-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100";
