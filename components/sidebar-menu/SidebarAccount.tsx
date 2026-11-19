"use client";

import { LuArrowLeftFromLine, LuUser, LuSun, LuMoon } from "react-icons/lu";
import { ROLE_LABEL, focusRing, initials } from "./constants";
import type { SidebarUser } from "./types";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type SidebarAccountProps = {
    user?: SidebarUser;
    collapsed: boolean;
    isLoggingOut: boolean;
    onLogout: () => void;
};

export function SidebarAccount({ user, collapsed, isLoggingOut, onLogout }: SidebarAccountProps) {
    const role = user?.role?.toLowerCase();
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const isDark = resolvedTheme === "dark";

    return (
        <div className={`mt-4 flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-zinc-200/70 dark:hover:bg-white/[0.04] ${collapsed ? "lg:flex-col lg:gap-2 lg:px-1" : ""}`}>
            <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-bold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100"
            >
                {user ? initials(user.name) : <LuUser className="size-4" />}
            </span>
            <div className={`min-w-0 flex-1 ${collapsed ? "lg:hidden" : ""}`}>
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{user?.name ?? "Minha conta"}</p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {(role && ROLE_LABEL[role]) ?? user?.email ?? ""}
                </p>
            </div>

            {/* Theme toggle */}
            {mounted && (
                <button
                    type="button"
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
                    className={`group relative shrink-0 rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white ${focusRing}`}
                >
                    {isDark
                        ? <LuSun className="size-4" aria-hidden="true" />
                        : <LuMoon className="size-4" aria-hidden="true" />
                    }
                    <span role="tooltip" className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 lg:group-hover:block">
                        {isDark ? "Modo claro" : "Modo escuro"}
                    </span>
                </button>
            )}

            {/* Logout */}
            <button
                type="button"
                onClick={onLogout}
                disabled={isLoggingOut}
                aria-busy={isLoggingOut}
                aria-label={isLoggingOut ? "Saindo..." : "Sair"}
                className={`group relative shrink-0 rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
            >
                <LuArrowLeftFromLine className="size-5" aria-hidden="true" />
                <span role="tooltip" className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 lg:group-hover:block">
                    {isLoggingOut ? "Saindo..." : "Sair"}
                </span>
            </button>
        </div>
    );
}
