import Link from "next/link";
import { ArrowRight, ClipboardPlus, Database } from "lucide-react";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl">
      <div className="flex min-h-[calc(100vh-8rem)] items-center">
        <section className="grid w-full gap-6 rounded-[28px] border border-slate-200 bg-white p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Consult
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              Consult workspace
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              Start with consultation registration, then connect patient data as needed.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/case-register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <ClipboardPlus className="h-4 w-4" />
                Open /case-register
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-6 text-slate-900">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Tools
              </div>
              <div className="mt-3 text-xl font-semibold">
                Consult-led workflow
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-sm text-slate-500">Stack</div>
              <div className="mt-2 inline-flex items-center gap-2 text-lg font-semibold">
                <Database className="h-5 w-5 text-amber-500" />
                Next.js + mysql2
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-sm text-slate-500">Tables</div>
              <div className="mt-2 text-lg font-semibold">
                case_register, patient, hospital, c_*
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
