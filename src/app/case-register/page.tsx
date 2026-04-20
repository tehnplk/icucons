import type { Metadata } from "next";
import { Activity, ClipboardPlus, TriangleAlert } from "lucide-react";

import { CaseRegisterTable } from "@/app/case-register/case-register-table";
import { fetchCaseRegisterList } from "@/lib/case-register";

export const metadata: Metadata = {
  title: "ทะเบียนให้คำปรึกษา ICU",
  description: "รายการเคสปรึกษาจากทะเบียนผู้ป่วย",
};

export default async function CaseRegisterPage() {
  const cases = await fetchCaseRegisterList();
  const pendingCount = cases.filter((item) => item.status.toLowerCase().includes("pending")).length;
  const activeCount = cases.filter((item) => item.status.toLowerCase().includes("active")).length;
  const criticalCount = cases.filter((item) => item.status.toLowerCase().includes("critical")).length;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-3 text-slate-900 sm:gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          ทะเบียนให้คำปรึกษา
        </h1>
        <div className="flex gap-2">
          <StatChip icon={ClipboardPlus} label="ทั้งหมด" value={cases.length} color="sky" />
          <StatChip icon={TriangleAlert} label="รอรับ" value={pendingCount} color="amber" />
          <StatChip
            icon={Activity}
            label={criticalCount > 0 ? "วิกฤต" : "รักษา"}
            value={criticalCount > 0 ? criticalCount : activeCount}
            color={criticalCount > 0 ? "rose" : "emerald"}
          />
        </div>
      </header>

      <CaseRegisterTable cases={cases} />
    </main>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof ClipboardPlus;
  label: string;
  value: number;
  color: "sky" | "amber" | "emerald" | "rose";
}) {
  const colorMap = {
    sky: "text-sky-700 bg-sky-50 border-sky-200",
    amber: "text-amber-700 bg-amber-50 border-amber-200",
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-200",
    rose: "text-rose-700 bg-rose-50 border-rose-200",
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs ${colorMap[color]}`}>
      <Icon className="h-3.5 w-3.5" />
      <span className="font-semibold">{label}</span>
      <span className="font-bold text-slate-900">{value}</span>
    </div>
  );
}
