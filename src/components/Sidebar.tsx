"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Wallet,
  ChevronDown,
  BarChart3,
  Boxes,
  Factory,
  Megaphone,
} from "lucide-react";
import { cx } from "@/lib/format";

const TOP_LEVEL = [{ href: "/", label: "Overview", icon: LayoutDashboard }];

const GROUPS = [
  {
    title: "Sales",
    icon: BarChart3,
    items: [
      { href: "/sales/primary-secondary", label: "Primary & Secondary Sales" },
      { href: "/sales/daily-report", label: "Daily Sales Report" },
    ],
  },
  {
    title: "Inventory & Demand Forecasting",
    icon: Boxes,
    items: [
      { href: "/inventory", label: "Inventory" },
      { href: "/forecasting", label: "Demand Forecasting" },
    ],
  },
  {
    title: "Supply Chain Management",
    icon: Factory,
    items: [
      { href: "/scm", label: "SCM" },
      { href: "/pricing", label: "Pricing Tracker" },
    ],
  },
  {
    title: "Marketing",
    icon: Megaphone,
    items: [
      { href: "/marketing", label: "Marketing Pulse" },
      { href: "/marketing/events", label: "Events & Campaigns" },
      { href: "/marketing/social-comments", label: "Social Comments" },
      { href: "/marketing/price-tracker", label: "Competitor Price Tracker" },
      { href: "/marketing/new-launches", label: "New Launch Detector" },
      { href: "/marketing/stockout-sniper", label: "Stockout Sniper" },
    ],
  },
];

const BOTTOM_LEVEL = [{ href: "/cashflow", label: "Cash Flow", icon: Wallet }];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggle = (title: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  };

  return (
    <aside className="hidden md:flex w-72 flex-col shrink-0 border-r border-[var(--border)] bg-[var(--surface)] px-4 py-5 overflow-y-auto">
      <div className="flex items-center gap-2 px-2 mb-6">
        <div className="h-9 w-9 rounded-lg bg-[var(--accent)] flex items-center justify-center font-black text-black text-lg">
          C
        </div>
        <div>
          <div className="font-bold tracking-tight leading-none">CAVA</div>
          <div className="text-[11px] text-[var(--muted)] leading-none">Athleisure · Data Warehouse</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {TOP_LEVEL.map(({ href, label, icon: Icon }) => (
          <NavLink key={href} href={href} label={label} icon={Icon} active={pathname === href} />
        ))}
      </nav>

      <div className="mt-4 flex flex-col gap-3">
        {GROUPS.map((group) => {
          const isCollapsed = collapsed.has(group.title);
          const groupActive = group.items.some((i) => pathname === i.href || pathname.startsWith(i.href + "/"));
          const GroupIcon = group.icon;
          return (
            <div key={group.title}>
              <button
                onClick={() => toggle(group.title)}
                className={cx(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-wide transition-colors",
                  groupActive ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                <GroupIcon size={14} />
                <span className="flex-1 text-left">{group.title}</span>
                <ChevronDown size={13} className={cx("transition-transform", isCollapsed && "-rotate-90")} />
              </button>
              {!isCollapsed && (
                <div className="flex flex-col gap-0.5 mt-0.5">
                  {group.items.map((item) => (
                    <NavLink key={item.href} href={item.href} label={item.label} active={pathname === item.href} indent />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <nav className="flex flex-col gap-1 mt-4 pt-4 border-t border-[var(--border)]">
        {BOTTOM_LEVEL.map(({ href, label, icon: Icon }) => (
          <NavLink key={href} href={href} label={label} icon={Icon} active={pathname === href} />
        ))}
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

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  indent,
}: {
  href: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  active: boolean;
  indent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        indent && "ml-3 pl-4 border-l border-[var(--border)] rounded-l-none",
        active
          ? "bg-[var(--accent)] text-black"
          : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
      )}
    >
      {Icon && <Icon size={17} strokeWidth={2.25} />}
      {label}
    </Link>
  );
}
