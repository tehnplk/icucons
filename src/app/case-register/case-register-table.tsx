"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Clock3,
  Lock,
  Search,
  ShieldCheck,
  Stethoscope,
  Building2,
  AlertCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import type { CaseRegisterListItem } from "@/lib/case-register";

function patientName(caseItem: {
  pre_name: string;
  first_name: string;
  last_name: string;
}) {
  return `${caseItem.pre_name}${caseItem.first_name} ${caseItem.last_name}`.trim();
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

function priorityTone(priority: string) {
  const v = priority.toUpperCase();
  if (v.includes("IMMEDIATE")) return "text-rose-700 bg-rose-50";
  if (v.includes("EMERGENCY")) return "text-orange-700 bg-orange-50";
  if (v === "URGENT" || v.includes("URGENCY")) return "text-amber-700 bg-amber-50";
  if (v.includes("SEMI")) return "text-sky-700 bg-sky-50";
  return "text-slate-600 bg-slate-50";
}

type CaseRegisterTableProps = {
  cases: CaseRegisterListItem[];
};

type FilterKey = "all" | "pending" | "active" | "critical" | "closed";

export function CaseRegisterTable({ cases }: CaseRegisterTableProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cases.filter((c) => {
      const status = c.status.toLowerCase();
      if (filter === "pending" && !status.includes("pending")) return false;
      if (filter === "active" && !status.includes("active")) return false;
      if (filter === "critical" && !status.includes("critical")) return false;
      if (filter === "closed" && !c.is_closed) return false;
      if (!q) return true;
      const hay = [
        patientName(c),
        c.hn,
        c.an,
        c.hosname,
        c.hoscode,
        c.specialty,
        c.reason,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [cases, filter, query]);

  function handleConsult(caseItem: CaseRegisterListItem) {
    router.push(`/case-register/${caseItem.id}`);
  }

  async function handleCloseCase(caseItem: CaseRegisterListItem) {
    const result = await Swal.fire({
      icon: "warning",
      title: `ปิดเคสของ ${patientName(caseItem)}?`,
      text: "ระบบจะบันทึกการปิดเคสและเปลี่ยนสถานะเป็นจำหน่าย",
      showCancelButton: true,
      confirmButtonText: "ยืนยันปิดเคส",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#0369a1",
      cancelButtonColor: "#64748b",
    });

    if (!result.isConfirmed) return;

    const response = await fetch("/api/case-register/close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ case_register_id: caseItem.id }),
    });

    const payload = (await response.json()) as {
      ok?: boolean;
      created?: boolean;
      message?: string;
    };

    if (!response.ok || !payload.ok) {
      await Swal.fire({
        icon: "error",
        title: "ปิดเคสไม่สำเร็จ",
        text: payload.message || "ไม่สามารถปิดเคสได้",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    await Swal.fire({
      icon: "success",
      title: payload.created ? "ปิดเคสเรียบร้อย" : "เคสนี้ถูกปิดไปแล้ว",
      text: payload.created
        ? "บันทึกการปิดเคสเรียบร้อยแล้ว"
        : "เคสนี้ถูกปิดก่อนหน้านี้",
      confirmButtonColor: "#0369a1",
    });

    router.refresh();
  }

  const filterOptions: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "ทั้งหมด", count: cases.length },
    {
      key: "pending",
      label: "รอรับเคส",
      count: cases.filter((c) => c.status.toLowerCase().includes("pending")).length,
    },
    {
      key: "active",
      label: "กำลังรักษา",
      count: cases.filter((c) => c.status.toLowerCase().includes("active")).length,
    },
    {
      key: "critical",
      label: "วิกฤต",
      count: cases.filter((c) => c.status.toLowerCase().includes("critical")).length,
    },
    {
      key: "closed",
      label: "ปิดแล้ว",
      count: cases.filter((c) => c.is_closed).length,
    },
  ];

  return (
    <section className="rounded-2xl border border-sky-100 bg-white shadow-sm sm:rounded-3xl">
      {/* Search + Filter */}
      <div className="space-y-3 border-b border-sky-100 p-3 sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหา ชื่อผู้ป่วย / HN / AN / โรงพยาบาล..."
            className="w-full rounded-xl border border-sky-200 bg-sky-50/50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setFilter(opt.key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                filter === opt.key
                  ? "bg-sky-600 text-white shadow-sm"
                  : "bg-sky-50 text-sky-700 hover:bg-sky-100"
              }`}
            >
              {opt.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  filter === opt.key ? "bg-white/20" : "bg-white text-sky-700"
                }`}
              >
                {opt.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-sky-50/60 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">ผู้ป่วย</th>
              <th className="px-4 py-3 font-semibold">โรงพยาบาล</th>
              <th className="px-4 py-3 font-semibold">สถานะเคส</th>
              <th className="px-4 py-3 font-semibold">อาการ / ความคืบหน้า</th>
              <th className="px-4 py-3 font-semibold">เวลา</th>
              <th className="px-4 py-3 text-right font-semibold">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-50 bg-white">
            {filtered.map((caseItem) => (
              <tr key={caseItem.id} className="align-top transition hover:bg-sky-50/40">
                <td className="px-4 py-4">
                  <div className="font-semibold text-slate-900">
                    {patientName(caseItem)}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    HN {caseItem.hn} · AN {caseItem.an}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="font-medium text-slate-800">
                    {caseItem.hosname || "-"}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{caseItem.hoscode}</div>
                </td>
                <td className="px-4 py-4">
                  <div
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusTone(
                      caseItem.status
                    )}`}
                  >
                    {translateStatus(caseItem.status)}
                  </div>
                  <div className={`mt-2 inline-flex rounded px-2 py-0.5 text-xs font-semibold ${priorityTone(caseItem.priority)}`}>
                    {translatePriority(caseItem.priority)}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {caseItem.specialty || "-"}
                  </div>
                </td>
                <td className="max-w-xs px-4 py-4 text-slate-600">
                  <div className="text-sm">{caseItem.reason || "-"}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {caseItem.last_action || "-"}
                  </div>
                </td>
                <td className="px-4 py-4 text-slate-600">
                  <div className="inline-flex items-center gap-1.5 text-sm">
                    <Clock3 className="h-3.5 w-3.5 text-sky-500" />
                    <span>{caseItem.record_date || "-"}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {caseItem.record_time || "-"}
                  </div>
                  {caseItem.is_closed && (
                    <div className="mt-1.5 text-xs text-slate-500">
                      ปิด {caseItem.close_date || "-"} {caseItem.close_time || ""}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleConsult(caseItem)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-95"
                    >
                      <Stethoscope className="h-4 w-4" />
                      เปิดเคส
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleCloseCase(caseItem)}
                      disabled={caseItem.is_closed}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                        caseItem.is_closed
                          ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                          : "border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-sky-50 active:scale-95"
                      }`}
                    >
                      {caseItem.is_closed ? (
                        <ShieldCheck className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                      {caseItem.is_closed ? "ปิดแล้ว" : "ปิดเคส"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <EmptyState />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="divide-y divide-sky-50 lg:hidden">
        {filtered.map((caseItem) => (
          <div key={caseItem.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${statusTone(
                      caseItem.status
                    )}`}
                  >
                    {translateStatus(caseItem.status)}
                  </div>
                  <div className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${priorityTone(caseItem.priority)}`}>
                    {translatePriority(caseItem.priority)}
                  </div>
                </div>
                <div className="mt-1.5 truncate text-base font-bold text-slate-900">
                  {patientName(caseItem)}
                </div>
                <div className="mt-0.5 truncate text-xs text-slate-500">
                  HN {caseItem.hn} · AN {caseItem.an}
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1.5 text-xs">
              <Building2 className="mt-0.5 h-3.5 w-3.5 text-sky-500" />
              <div className="text-slate-700">
                {caseItem.hosname || "-"} <span className="text-slate-400">· {caseItem.hoscode}</span>
              </div>

              <AlertCircle className="mt-0.5 h-3.5 w-3.5 text-amber-500" />
              <div className="text-slate-700">
                {caseItem.reason || "-"}
                {caseItem.last_action && (
                  <div className="mt-0.5 text-slate-500">{caseItem.last_action}</div>
                )}
              </div>

              <Clock3 className="mt-0.5 h-3.5 w-3.5 text-sky-500" />
              <div className="text-slate-600">
                {caseItem.record_date || "-"} {caseItem.record_time || ""}
                {caseItem.is_closed && (
                  <span className="ml-2 text-slate-400">
                    · ปิด {caseItem.close_date || "-"}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => handleConsult(caseItem)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-95 active:bg-sky-700"
              >
                <Stethoscope className="h-4 w-4" />
                เปิดเคส
              </button>
              <button
                type="button"
                onClick={() => void handleCloseCase(caseItem)}
                disabled={caseItem.is_closed}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                  caseItem.is_closed
                    ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                    : "border-slate-300 text-slate-700 active:scale-95 active:bg-sky-50"
                }`}
              >
                {caseItem.is_closed ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12">
            <EmptyState />
          </div>
        )}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="text-center text-slate-500">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-400">
        <ClipboardPlusIcon />
      </div>
      <p className="mt-3 text-sm">ไม่พบเคสที่ตรงกับเงื่อนไข</p>
      <p className="mt-1 text-xs text-slate-400">ลองเปลี่ยนตัวกรองหรือคำค้นหา</p>
    </div>
  );
}

function ClipboardPlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 14h6" />
      <path d="M12 17v-6" />
    </svg>
  );
}
