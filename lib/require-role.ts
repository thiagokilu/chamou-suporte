// lib/require-role.ts
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiUrl } from "@/lib/http/api-url";

type Role = "admin" | "agent" | "client";
const DEMO_TOKEN = "demo-token";

export async function requireRole(allowed: Role[]) {
    const token = (await cookies()).get("tickets_token")?.value;

    if (!token) redirect("/login");

    // O usuário demo é fictício, então a página usa dados mockados sem consultar /auth/me.
    if (token === DEMO_TOKEN) {
        if (!allowed.includes("admin")) redirect("/admin");
        return { id: "demo-admin", username: "Administrador Demo", role: "ADMIN" };
    }

    // Pergunte ao backend quem é o usuário (o role não pode vir de algo que o cliente edita)
    const res = await fetch(apiUrl("/auth/me"), {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });

    if (!res.ok) redirect("/login");

    const user: { role: string } = await res.json();

    const role = user.role.toLowerCase() as Role;
    if (!allowed.includes(role)) {
        if (role === "agent") redirect("/agent");
        if (role === "client") redirect("/client");
        if (role === "admin") redirect("/admin");
        redirect("/login");
    }

    return user;
}
