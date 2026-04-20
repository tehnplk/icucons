"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardPlus,
  LayoutGrid,
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
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            title={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Consult
            </p>
            <h1 className="text-base font-semibold text-slate-950">Workspace</h1>
          </div>
        </div>
        <div className="w-10" />
      </div>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="mx-auto flex min-h-screen max-w-screen-2xl flex-col lg:flex-row">
        <aside
          className={`fixed inset-y-0 left-0 z-40 border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 lg:transition-[width] ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          } ${collapsed ? "lg:w-24" : "lg:w-72"} w-72 lg:min-h-screen ${
            collapsed ? "" : ""
          }`}
        >
          <div
            className={`flex items-center px-5 py-5 ${
              collapsed ? "justify-center lg:px-4" : "justify-between gap-3"
            }`}
          >
            {(!collapsed || mobileOpen) && (
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Consult
                  </p>
                  <h1 className="text-lg font-semibold text-slate-950">Workspace</h1>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 lg:inline-flex"
              aria-label={collapsed ? "Expand menu" : "Collapse menu"}
              title={collapsed ? "Expand menu" : "Collapse menu"}
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 lg:hidden"
              aria-label="Close menu"
              title="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav
            className={`flex flex-col gap-2 px-4 pb-4 lg:overflow-visible ${
              collapsed ? "lg:px-3" : ""
            }`}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`inline-flex min-w-max items-center rounded-2xl text-sm font-medium transition lg:w-full ${
                    collapsed
                      ? "justify-center px-3 py-3"
                      : "gap-3 px-4 py-3"
                  } ${
                    active
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                  aria-label={item.label}
                  title={item.label}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
