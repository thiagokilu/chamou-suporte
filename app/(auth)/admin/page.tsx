
import Chat from "../../../components/chat";
import { TicketsTable } from "@/components/tickets-table";
import { requireRole } from "@/lib/require-role";

export const instant = false;

export default async function AdminDashboardPage() {
  await requireRole(["admin"]);

  return (
    <>
      <TicketsTable />
      <Chat />
    </>
  );
}
