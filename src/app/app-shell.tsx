"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardPlus,
  HeartPulse,
  Menu,
  UsersRound,
  X,
} from "lucide-react";

const navItems = [
  {
    href: "/patient",
    label: "ทะเบียนผู้ป่วย",
    icon: UsersRound,
  },
  {
    href: "/case-register",
    label: "ทะเบียนให้คำปรึกษา",
    icon: ClipboardPlus,
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-sky-50 text-slate-900">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-sky-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-700 transition active:scale-95 hover:bg-sky-100"
            aria-label={mobileOpen ? "ปิดเมนู" : "เปิดเมนู"}
            title={mobileOpen ? "ปิดเมนู" : "เปิดเมนู"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-sm">
              <HeartPulse className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <h1 className="text-sm font-bold text-slate-900">ICU Consult</h1>
              <p className="text-[10px] text-slate-500">ระบบปรึกษาผู้ป่วยวิกฤต</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="ปิดเมนู"
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="mx-auto flex min-h-screen max-w-screen-2xl flex-col lg:flex-row">
        <aside
          className={`fixed inset-y-0 left-0 z-40 border-r border-sky-100 bg-white shadow-lg transition-transform duration-200 lg:static lg:shadow-none lg:translate-x-0 lg:transition-[width] ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          } ${collapsed ? "lg:w-24" : "lg:w-72"} w-72 lg:min-h-screen`}
        >
          <div
            className={`flex items-center border-b border-sky-100 px-5 py-5 ${
              collapsed ? "justify-center lg:px-4" : "justify-between gap-3"
            }`}
          >
            {(!collapsed || mobileOpen) && (
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-md shadow-sky-200">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <div className="leading-tight">
                  <h1 className="text-base font-bold text-slate-900">ICU Consult</h1>
                  <p className="text-[11px] text-slate-500">ระบบปรึกษาผู้ป่วยวิกฤต</p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="hidden h-10 w-10 items-center justify-center rounded-xl border border-sky-200 text-sky-700 transition hover:bg-sky-50 lg:inline-flex"
              aria-label={collapsed ? "ขยายเมนู" : "ย่อเมนู"}
              title={collapsed ? "ขยายเมนู" : "ย่อเมนู"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 text-sky-700 transition hover:bg-sky-50 lg:hidden"
              aria-label="ปิดเมนู"
              title="ปิดเมนู"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav
            className={`flex flex-col gap-1.5 px-3 py-4 lg:overflow-visible ${
              collapsed ? "lg:px-3" : ""
            }`}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname?.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`group inline-flex min-w-max items-center rounded-xl text-sm font-medium transition lg:w-full ${
                    collapsed
                      ? "justify-center px-3 py-3"
                      : "gap-3 px-3 py-3"
                  } ${
                    active
                      ? "bg-gradient-to-r from-sky-600 to-sky-700 text-white shadow-md shadow-sky-200"
                      : "text-slate-700 hover:bg-sky-50 hover:text-sky-800"
                  }`}
                  aria-label={item.label}
                  title={item.label}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${active ? "text-white" : "text-sky-600"}`} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

        </aside>

        <main className="min-w-0 flex-1">
          <div className="p-3 sm:p-5 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
