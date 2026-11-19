import { getStoredUser } from "@/lib/auth";
import type { SidebarUser } from "./types";

let lastStoredValue: string | null | undefined;
let cachedSidebarUser: SidebarUser | null = null;

export const getSidebarUser = (): SidebarUser | null => {
    const storedValue = localStorage.getItem("tickets_user");
    if (storedValue === lastStoredValue) return cachedSidebarUser;

    lastStoredValue = storedValue;
    const authenticatedUser = getStoredUser();

    cachedSidebarUser = authenticatedUser
        ? {
              id: authenticatedUser.id,
              name: authenticatedUser.name,
              email: authenticatedUser.email,
              role: authenticatedUser.role?.toLowerCase(),
          }
        : null;

    return cachedSidebarUser;
};

export const subscribeToUserStorage = (onStoreChange: () => void) => {
    window.addEventListener("storage", onStoreChange);
    window.addEventListener("tickets-user-change", onStoreChange);
    return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener("tickets-user-change", onStoreChange);
    };
};
