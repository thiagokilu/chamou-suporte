import { TicketsTable } from "@/components/tickets-table";
import { requireRole } from "@/lib/require-role";

export const instant = false;

export default async function AgentDashboardPage() {
  await requireRole(["agent"]);

  return <TicketsTable />;
}
