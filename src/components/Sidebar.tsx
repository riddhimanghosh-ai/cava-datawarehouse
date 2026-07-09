"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  BarChart3,
  TrendingUp,
  Wallet,
  Megaphone,
} from "lucide-react";
import { cx } from "@/lib/format";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/sales", label: "Sales", icon: BarChart3 },
  { href: "/forecasting", label: "Demand Forecasting", icon: TrendingUp },
  { href: "/cashflow", label: "Cash Flow", icon: Wallet },
  { href: "/marketing", label: "Marketing Pulse", icon: Megaphone },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col shrink-0 border-r border-[var(--border)] bg-[var(--surface)] px-4 py-5">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="h-9 w-9 rounded-lg bg-[var(--accent)] flex items-center justify-center font-black text-black text-lg">
          C
        </div>
        <div>
          <div className="font-bold tracking-tight leading-none">CAVA</div>
          <div className="text-[11px] text-[var(--muted)] leading-none">Athleisure · Data Warehouse</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--accent)] text-black"
                  : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
              )}
            >
              <Icon size={17} strokeWidth={2.25} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-xs text-[var(--muted)]">
          <div className="text-[var(--foreground)] font-semibold mb-1">Live channels</div>
          Shopify D2C · Amazon · Myntra · Zepto · Nykaa Fashion
        </div>
        <div className="text-[10px] text-[var(--muted)] mt-3 px-1">
          Prototype data — for demo purposes only.
        </div>
      </div>
    </aside>
  );
}
