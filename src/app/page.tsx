import Link from "next/link";
import { ArrowRight, ClipboardPlus, UsersRound } from "lucide-react";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-sky-700 to-blue-800 p-6 text-white shadow-xl shadow-sky-200 sm:p-10">
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          ระบบให้คำปรึกษา<br />
          ผู้ป่วยวิกฤต ICU
        </h1>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/case-register"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-sky-700 shadow-md transition hover:bg-sky-50 active:scale-95"
          >
            <ClipboardPlus className="h-4 w-4" />
            ไปที่ทะเบียนปรึกษา
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/patient"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-95"
          >
            <UsersRound className="h-4 w-4" />
            ทะเบียนผู้ป่วย
          </Link>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <QuickLink href="/case-register" icon={ClipboardPlus} label="ทะเบียนปรึกษา" />
        <QuickLink href="/patient" icon={UsersRound} label="ทะเบียนผู้ป่วย" />
      </div>
    </main>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof ClipboardPlus;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm transition hover:border-sky-300 hover:shadow-md active:scale-[0.98]"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700 transition group-hover:bg-sky-600 group-hover:text-white">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 text-sm font-bold text-slate-900">{label}</div>
      <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-sky-600" />
    </Link>
  );
}
