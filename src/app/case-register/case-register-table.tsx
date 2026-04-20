"use client";

import { useRouter } from "next/navigation";
import { Clock3, Lock, ShieldCheck } from "lucide-react";
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

function statusTone(status: string) {
  const value = status.toLowerCase();

  if (value.includes("critical")) return "bg-rose-50 text-rose-700";
  if (value.includes("active")) return "bg-emerald-50 text-emerald-700";
  if (value.includes("pending")) return "bg-amber-50 text-amber-700";
  if (value.includes("discharge")) return "bg-slate-100 text-slate-700";

  return "bg-sky-50 text-sky-700";
}

type CaseRegisterTableProps = {
  cases: CaseRegisterListItem[];
};

export function CaseRegisterTable({ cases }: CaseRegisterTableProps) {
  const router = useRouter();

  async function handleCloseCase(caseItem: CaseRegisterListItem) {
    const result = await Swal.fire({
      icon: "warning",
      title: `Close case for ${patientName(caseItem)}?`,
      text: "This will create a case_close record and mark the case as discharged.",
      showCancelButton: true,
      confirmButtonText: "Close case",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#0f172a",
    });

    if (!result.isConfirmed) return;

    const response = await fetch("/api/case-register/close", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
        title: "Close failed",
        text: payload.message || "Unable to close case",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    await Swal.fire({
      icon: "success",
      title: payload.created ? "Case closed" : "Already closed",
      text: payload.created
        ? "The case has been closed successfully."
        : "This case was already closed before.",
      confirmButtonColor: "#0f172a",
    });

    router.refresh();
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5">
      <div className="overflow-hidden rounded-[24px] border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Patient</th>
                <th className="px-4 py-3 font-semibold">Hospital</th>
                <th className="px-4 py-3 font-semibold">Case</th>
                <th className="px-4 py-3 font-semibold">Reason</th>
                <th className="px-4 py-3 font-semibold">Time</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {cases.map((caseItem) => (
                <tr key={caseItem.id} className="align-top">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-900">
                      {patientName(caseItem)}
                    </div>
                    <div className="mt-1 text-slate-500">
                      HN {caseItem.hn} • AN {caseItem.an}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-slate-800">
                      {caseItem.hosname || "-"}
                    </div>
                    <div className="mt-1 text-slate-500">{caseItem.hoscode}</div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <div
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(
                        caseItem.status
                      )}`}
                    >
                      {caseItem.status}
                    </div>
                    <div className="mt-2 font-medium text-slate-800">
                      {caseItem.priority}
                    </div>
                    <div className="mt-1 text-slate-500">
                      {caseItem.specialty || "-"}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <div>{caseItem.reason || "-"}</div>
                    <div className="mt-1 text-slate-500">
                      {caseItem.last_action || "-"}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <div className="inline-flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-slate-400" />
                      <span>{caseItem.record_date || "-"}</span>
                    </div>
                    <div className="mt-1 text-slate-500">
                      {caseItem.record_time || "-"}
                    </div>
                    {caseItem.is_closed && (
                      <div className="mt-2 text-xs text-slate-500">
                        Closed {caseItem.close_date || "-"} {caseItem.close_time || ""}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => void handleCloseCase(caseItem)}
                        disabled={caseItem.is_closed}
                        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                          caseItem.is_closed
                            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                            : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {caseItem.is_closed ? (
                          <ShieldCheck className="h-4 w-4" />
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                        {caseItem.is_closed ? "Closed" : "Close case"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {cases.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    No case register records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
