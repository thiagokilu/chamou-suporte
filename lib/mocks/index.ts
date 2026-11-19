import type { ApiTicket } from "@/lib/http/tickets/getTicket";
import type { ApiUser } from "@/lib/http/auth/getUsers";

const demoUsers: ApiTicketUser[] = [
  { id: "demo-admin", username: "Administrador Demo", email: "admin@demo.com", role: "ADMIN" },
  { id: "demo-agent-1", username: "Carla Souza", email: "carla@demo.com", role: "AGENT" },
  { id: "demo-agent-2", username: "Rafael Lima", email: "rafael@demo.com", role: "AGENT" },
  { id: "demo-client-1", username: "Marina Costa", email: "marina@demo.com", role: "CLIENT" },
  { id: "demo-client-2", username: "Lucas Ferreira", email: "lucas@demo.com", role: "CLIENT" },
];

type ApiTicketUser = NonNullable<ApiTicket["requester"]>;

export const MOCK_USERS: ApiUser[] = demoUsers.map((user, index) => ({
  ...user,
  is_active: true,
  created_at: `2026-${String(8 + (index % 3)).padStart(2, "0")}-${String(8 + index).padStart(2, "0")}T12:00:00.000Z`,
  updated_at: "2026-11-10T15:30:00.000Z",
}));

export const MOCK_TICKETS: ApiTicket[] = [
  { id: "demo-2048", title: "Acesso ao e-mail corporativo", description: "A equipe não consegue acessar as caixas compartilhadas desde esta manhã.", status: "IN_PROGRESS", priority: "HIGH", requester: demoUsers[3], assigned_to: demoUsers[1], created_at: "2026-11-11T09:20:00.000Z", updated_at: "2026-11-11T10:45:00.000Z" },
  { id: "demo-2047", title: "Notebook sem conexão Wi-Fi", description: "A conexão cai a cada poucos minutos na sala de reunião.", status: "OPEN", priority: "URGENT", requester: demoUsers[4], assigned_to: null, created_at: "2026-11-11T08:05:00.000Z", updated_at: "2026-11-11T08:05:00.000Z" },
  { id: "demo-2046", title: "Instalação do pacote de design", description: "Solicito a instalação da ferramenta de design para o novo projeto.", status: "WAITING_FOR_CUSTOMER", priority: "MEDIUM", requester: demoUsers[3], assigned_to: demoUsers[2], created_at: "2026-11-10T14:10:00.000Z", updated_at: "2026-11-11T09:00:00.000Z" },
  { id: "demo-2045", title: "Permissão na pasta Financeiro", description: "Preciso de acesso de leitura à pasta compartilhada do financeiro.", status: "RESOLVED", priority: "LOW", requester: demoUsers[4], assigned_to: demoUsers[1], created_at: "2026-11-09T11:35:00.000Z", updated_at: "2026-11-10T16:20:00.000Z" },
  { id: "demo-2044", title: "Erro ao emitir relatório mensal", description: "O relatório de novembro apresenta uma mensagem de erro ao exportar.", status: "OPEN", priority: "HIGH", requester: demoUsers[3], assigned_to: demoUsers[2], created_at: "2026-11-08T16:40:00.000Z", updated_at: "2026-11-08T16:40:00.000Z" },
  { id: "demo-2043", title: "Redefinição de senha", description: "Ajuda para redefinir a senha de acesso ao portal interno.", status: "CLOSED", priority: "LOW", requester: demoUsers[4], assigned_to: demoUsers[1], created_at: "2026-11-07T10:00:00.000Z", updated_at: "2026-11-08T13:15:00.000Z" },
];

export const MOCK_METRICS = {
  total: MOCK_TICKETS.length,
  open: MOCK_TICKETS.filter(({ status }) => status === "OPEN").length,
  inProgress: MOCK_TICKETS.filter(({ status }) => status === "IN_PROGRESS").length,
  waiting: MOCK_TICKETS.filter(({ status }) => status === "WAITING_FOR_CUSTOMER").length,
  resolved: MOCK_TICKETS.filter(({ status }) => status === "RESOLVED" || status === "CLOSED").length,
};
