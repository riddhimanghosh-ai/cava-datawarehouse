"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cx } from "@/lib/format";
import { TOP_LEVEL, GROUPS, BOTTOM_LEVEL } from "./nav";

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
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="h-9 w-9 border border-[var(--ink)] flex items-center justify-center font-medium text-[15px]">C</div>
        <div>
          <div className="font-medium tracking-tight leading-none">
            CAVA <span className="serif-accent">Athleisure</span>
          </div>
          <div className="eyebrow mt-1">Data Warehouse</div>
        </div>
      </div>

      <nav className="flex flex-col">
        {TOP_LEVEL.map(({ href, label, icon: Icon }) => (
          <NavLink key={href} href={href} label={label} icon={Icon} active={pathname === href} />
        ))}
      </nav>

      <div className="mt-6 flex flex-col gap-5">
        {GROUPS.map((group) => {
          const isCollapsed = collapsed.has(group.title);
          const groupActive = group.items.some((i) => pathname === i.href || pathname.startsWith(i.href + "/"));
          const GroupIcon = group.icon;
          return (
            <div key={group.title}>
              <button
                onClick={() => toggle(group.title)}
                className={cx(
                  "flex w-full items-center gap-2 px-2 py-1.5 eyebrow transition-colors",
                  groupActive ? "!text-[var(--accent)]" : "hover:!text-[var(--foreground)]"
                )}
              >
                <GroupIcon size={13} strokeWidth={1.5} />
                <span className="flex-1 text-left">{group.title}</span>
                <ChevronDown size={12} className={cx("transition-transform", isCollapsed && "-rotate-90")} />
              </button>
              {!isCollapsed && (
                <div className="flex flex-col mt-1">
                  {group.items.map((item) => (
                    <NavLink key={item.href} href={item.href} label={item.label} active={pathname === item.href} indent />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <nav className="flex flex-col mt-6 pt-4 border-t border-[var(--border)]">
        {BOTTOM_LEVEL.map(({ href, label, icon: Icon }) => (
          <NavLink key={href} href={href} label={label} icon={Icon} active={pathname === href} />
        ))}
      </nav>

      <div className="mt-auto pt-6">
        <div className="border border-[var(--border)] bg-[var(--surface-2)] p-3 text-xs text-[var(--muted)]">
          <div className="eyebrow mb-1.5">Live channels</div>
          Shopify D2C · Amazon · Myntra · Zepto · Nykaa Fashion
        </div>
        <div className="eyebrow mt-3 px-1">Prototype data — demo only</div>
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
        "flex items-center gap-3 px-2 py-2 text-sm transition-colors border-l-2",
        indent && "ml-2 pl-4",
        active
          ? "border-[var(--accent)] text-[var(--accent)] font-medium"
          : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
      )}
    >
      {Icon && <Icon size={16} strokeWidth={1.5} />}
      {label}
    </Link>
  );
}
