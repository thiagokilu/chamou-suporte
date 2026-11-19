"use client";

import Link from "next/link";
import { focusRing } from "./constants";
import type { MenuItem, SidebarSectionProps } from "./types";

function SidebarLink({ item, collapsed, pathname }: {
    item: MenuItem;
    collapsed: boolean;
    pathname: string;
}) {
    const { label, href, icon: Icon, badge } = item;
    const active = pathname === href || pathname.startsWith(`${href}/`);
    const hideLabel = collapsed ? "lg:hidden" : "";
    const centerWhenCollapsed = collapsed ? "lg:justify-center lg:px-0" : "";

    return (
        <li>
            <Link
                href={href}
                aria-current={active ? "page" : undefined}
                aria-label={collapsed ? label : undefined}
                data-tour={item.href === "/usuarios" ? "manage-users" : item.label === "Tickets" ? "admin-dashboard" : undefined}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${centerWhenCollapsed} ${focusRing} ${
                    active
                        ? "bg-zinc-200 text-zinc-950 dark:bg-zinc-700/70 dark:text-white"
                        : "text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-100"
                }`}
            >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <span className={hideLabel}>{label}</span>
                {badge !== undefined && badge > 0 && (
                    <span
                        className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
                            active ? "bg-zinc-500 text-white" : "bg-rose-600 text-white"
                        } ${collapsed ? "lg:absolute lg:right-1.5 lg:top-1 lg:ml-0 lg:px-1.5 lg:py-0 lg:text-[10px]" : ""}`}
                        aria-label={`${badge} em aberto`}
                    >
                        {badge > 99 ? "99+" : badge}
                    </span>
                )}
                <span
                    role="tooltip"
                    className={`pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 ${collapsed ? "lg:block" : ""}`}
                >
                    {label}
                </span>
            </Link>
        </li>
    );
}

export function SidebarSection({ items, collapsed, pathname, title }: SidebarSectionProps) {
    return (
        <section className="mb-5">
            {title && <h2 className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500 ${collapsed ? "lg:hidden" : ""}`}>{title}</h2>}
            <ul className="flex flex-col gap-1">
                {items.map((item) => (
                    <SidebarLink key={item.href} item={item} collapsed={collapsed} pathname={pathname} />
                ))}
            </ul>
        </section>
    );
}

