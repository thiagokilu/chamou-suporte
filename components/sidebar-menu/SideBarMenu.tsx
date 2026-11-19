"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
    LuChevronLeft,
    LuChevronRight,
    LuMenu,
    LuPlus,
    LuSettings,
    LuTicket,
    LuX,
    LuUser,
    LuUsersRound,
} from "react-icons/lu";
import { clearStoredUser, getStoredToken, setStoredUser, type User } from "@/lib/auth";
import { getMe } from "@/lib/http/auth/me";
import { Logout } from "@/lib/http/auth/logout";
import { Brand } from "./Brand";
import { focusRing, STORAGE_KEY, WIDTH_COLLAPSED, WIDTH_EXPANDED } from "./constants";
import { SidebarAccount } from "./SidebarAccount";
import { SidebarSection } from "./SidebarSection";
import { getSidebarUser, subscribeToUserStorage } from "./user-storage";
import type { MenuItem, SideBarMenuProps } from "./types";

export function SideBarMenu({ user, openTickets, newTicketHref }: SideBarMenuProps) {
    const pathname = usePathname();
    const isDemo = pathname === "/demo";
    const [isOpen, setIsOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const storedUser = useSyncExternalStore(subscribeToUserStorage, getSidebarUser, () => null);
    const currentUser = user ?? storedUser ?? undefined;
    const role = currentUser?.role?.toLowerCase();
    const dashboardFromCurrentPath = pathname.startsWith("/client")
        ? "/client"
        : pathname.startsWith("/agent")
          ? "/agent"
          : pathname.startsWith("/admin")
            ? "/admin"
            : undefined;
    const dashboardHref = isDemo || currentUser?.id === "demo-admin"
        ? "/demo"
        : role === "agent"
          ? "/agent"
          : role === "client"
            ? "/client"
            : role === "admin"
              ? "/admin"
              : dashboardFromCurrentPath ?? "/admin";

    const mainItems: MenuItem[] = [
        { label: "Tickets", href: dashboardHref, icon: LuTicket, badge: openTickets },
        { label: "Usuários", href: "/usuarios", icon: LuUsersRound, roles: ["admin"] },
    ];
    const accountItems: MenuItem[] = [
        { label: "Perfil", href: "/perfil", icon: LuUser },
        { label: "Configurações", href: "/configuracoes", icon: LuSettings },
    ];

    useEffect(() => {
        if (isDemo || currentUser) return;

        const token = getStoredToken();
        if (!token) return;

        const controller = new AbortController();
        getMe<User>(token, controller.signal)
            .then(setStoredUser)
            .catch(() => {
                // O menu continua funcional mesmo se a sessão não puder ser consultada.
            });

        return () => controller.abort();
    }, [currentUser, isDemo]);

    useEffect(() => {
        try {
            // A preferência só pode ser lida no navegador após a montagem.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
        } catch {
            // Sem armazenamento, o menu segue expandido.
        }
    }, []);

    useEffect(() => {
        document.documentElement.style.setProperty(
            "--sidebar-w",
            collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED,
        );
        try {
            localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
        } catch {
            // Ignora armazenamento indisponível.
        }
    }, [collapsed]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen]);

    const visibleItems = (items: MenuItem[]) =>
        items.filter((item) => {
            if (!item.roles || (role !== undefined && item.roles.includes(role))) return true;

            // Keep the admin link visible while the session profile is being restored.
            return item.href === "/usuarios" && (pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/usuarios");
        });

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            if (!isDemo) await Logout();
        } catch (error) {
            if (!(error instanceof Error && error.message.endsWith("(401)."))) {
                console.error("Erro ao fazer logout:", error);
            }
        } finally {
            clearStoredUser();
            setIsLoggingOut(false);
            window.location.replace("/login");
        }
    };

    return (
        <>
            <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-zinc-200 bg-zinc-100 px-4 text-zinc-900 dark:border-white/10 dark:bg-zinc-900 dark:text-white lg:hidden">
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    aria-label="Abrir menu"
                    aria-expanded={isOpen}
                    aria-controls="sidebar-menu"
                    className={`rounded-md p-2 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-950 dark:text-white dark:hover:bg-white/10 ${focusRing}`}
                >
                    <LuMenu className="size-5" aria-hidden="true" />
                </button>
                <Brand collapsed={false} />
            </div>

            {isOpen && (
                <div
                    aria-hidden="true"
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                />
            )}

            <aside
                id="sidebar-menu"
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-zinc-100 px-3 py-5 text-zinc-800 transition-[width,transform,visibility] duration-200 motion-reduce:transition-none dark:border-white/[0.07] dark:bg-zinc-900 dark:text-zinc-100 lg:visible lg:translate-x-0 ${collapsed ? "lg:w-20" : "lg:w-60"} ${isOpen ? "visible translate-x-0" : "invisible -translate-x-full"}`}
            >
                <button
                    type="button"
                    onClick={() => setCollapsed((value) => !value)}
                    aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
                    aria-pressed={collapsed}
                    className="absolute -right-3 top-7 hidden size-6 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-600 shadow-sm transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-white/10 dark:bg-[#292929] dark:text-zinc-300 dark:hover:bg-zinc-700 lg:flex"
                >
                    {collapsed ? <LuChevronRight className="size-4" aria-hidden="true" /> : <LuChevronLeft className="size-4" aria-hidden="true" />}
                </button>

                <div className={`mb-7 flex items-center justify-between border-b border-zinc-200 px-1 pb-5 dark:border-white/[0.07] ${collapsed ? "lg:justify-center" : ""}`}>
                    <Brand collapsed={collapsed} />
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        aria-label="Fechar menu"
                        className={`rounded-md p-2 text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-white/10 lg:hidden ${focusRing}`}
                    >
                        <LuX className="size-5" aria-hidden="true" />
                    </button>
                </div>

                {newTicketHref && (
                    <Link
                        href={newTicketHref}
                        aria-label={collapsed ? "Novo chamado" : undefined}
                        className={`group relative mb-5 flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500 ${focusRing}`}
                    >
                        <LuPlus className="size-5 shrink-0" aria-hidden="true" />
                        <span className={collapsed ? "lg:hidden" : ""}>Novo chamado</span>
                        <span role="tooltip" className={`pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 ${collapsed ? "lg:block" : ""}`}>
                            Novo chamado
                        </span>
                    </Link>
                )}

                <nav aria-label="Menu principal" className="flex flex-1 flex-col">
                    <SidebarSection title="Visão geral" items={visibleItems(mainItems)} collapsed={collapsed} pathname={pathname} />
                    <div className="mt-auto border-t border-zinc-200 pt-4 dark:border-white/[0.07]">
                        <SidebarSection title="Conta" items={visibleItems(accountItems)} collapsed={collapsed} pathname={pathname} />
                        <SidebarAccount
                            user={currentUser}
                            collapsed={collapsed}
                            isLoggingOut={isLoggingOut}
                            onLogout={handleLogout}
                        />
                    </div>
                </nav>
            </aside>
        </>
    );
}
