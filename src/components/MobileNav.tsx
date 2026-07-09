"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cx } from "@/lib/format";
import { TOP_LEVEL, GROUPS, BOTTOM_LEVEL } from "./nav";

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[var(--accent)] flex items-center justify-center font-black text-black">C</div>
          <span className="font-bold tracking-tight">CAVA</span>
        </div>
        <button onClick={() => setOpen(true)} className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2" aria-label="Open menu">
          <Menu size={18} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[85%] overflow-y-auto bg-[var(--surface)] border-r border-[var(--border)] px-4 py-5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[var(--accent)] flex items-center justify-center font-black text-black">C</div>
                <span className="font-bold tracking-tight">CAVA</span>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-1.5" aria-label="Close menu">
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              {TOP_LEVEL.map(({ href, label, icon: Icon }) => (
                <MobileLink key={href} href={href} label={label} icon={Icon} active={pathname === href} />
              ))}
            </div>

            {GROUPS.map((group) => (
              <div key={group.title} className="mt-4">
                <div className="flex items-center gap-2 px-3 mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                  <group.icon size={13} />
                  {group.title}
                </div>
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => (
                    <MobileLink key={item.href} href={item.href} label={item.label} active={pathname === item.href} indent />
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-4 pt-4 border-t border-[var(--border)] flex flex-col gap-1">
              {BOTTOM_LEVEL.map(({ href, label, icon: Icon }) => (
                <MobileLink key={href} href={href} label={label} icon={Icon} active={pathname === href} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileLink({
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
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        indent && "ml-3 pl-4 border-l border-[var(--border)] rounded-l-none",
        active ? "bg-[var(--accent)] text-black" : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
      )}
    >
      {Icon && <Icon size={17} strokeWidth={2.25} />}
      {label}
    </Link>
  );
}
