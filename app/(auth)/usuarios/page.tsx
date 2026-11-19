import { requireRole } from "@/lib/require-role";
import UsuariosClient from "./usuarios-client";

export const instant = false;

export default async function UsuariosPage() {
  await requireRole(["admin"]);
  return <UsuariosClient />;
}
