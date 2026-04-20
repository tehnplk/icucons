import type { Metadata } from "next";
import { Activity, ClipboardPlus, TriangleAlert } from "lucide-react";

import { CaseRegisterTable } from "@/app/case-register/case-register-table";
import { fetchCaseRegisterList } from "@/lib/case-register";

export const metadata: Metadata = {
  title: "Case Register",
  description: "Case register fed from patient registry",
};

export default async function CaseRegisterPage() {
  const cases = await fetchCaseRegisterList();

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 text-slate-900">
      <section className="rounded-[28px] border border-slate-200 bg-white">
        <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.3fr_0.9fr] lg:px-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Case
            </p>
            <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              ทะเบียนให้คำปรึกษา
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              รายการนี้ดึงข้อมูลคนไข้จาก patient และแสดงข้อมูลเคสจาก case_register
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <ClipboardPlus className="h-5 w-5 text-slate-700" />
              <div className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                Cases
              </div>
              <div className="mt-1 text-2xl font-semibold">{cases.length}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <TriangleAlert className="h-5 w-5 text-amber-600" />
              <div className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                Pending
              </div>
              <div className="mt-1 text-2xl font-semibold">
                {cases.filter((item) => item.status.toLowerCase().includes("pending")).length}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <Activity className="h-5 w-5 text-emerald-600" />
              <div className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                Active
              </div>
              <div className="mt-1 text-2xl font-semibold">
                {cases.filter((item) => item.status.toLowerCase().includes("active")).length}
              </div>
            </div>
          </div>
        </div>
      </section>
      <CaseRegisterTable cases={cases} />
    </main>
  );
}
