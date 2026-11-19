export const ROLE_LABEL: Record<string, string> = {
    admin: "Administrador",
    agent: "Agente",
    client: "Cliente",
    user: "Usuário",
};

export const STORAGE_KEY = "chamou:sidebar-collapsed";
export const WIDTH_EXPANDED = "15rem";
export const WIDTH_COLLAPSED = "5rem";

export const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400";

export const initials = (name: string) =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
