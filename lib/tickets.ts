export interface Ticket {
  id: string | number;
  titulo: string;
  descricao: string;
  status: string;
  prioridade: string;
  cliente: string;
  agente: string | null;
  dataCriacao: string;
  dataAtualizacao: string;
}

export const mockTickets: Ticket[] = [
  {
    id: 1,
    titulo: "Erro ao acessar sistema",
    descricao: "Não consigo fazer login no sistema",
    status: "Aberto",
    prioridade: "Alta",
    cliente: "João Silva",
    agente: "Carlos Santos",
    dataCriacao: "2026-10-29T10:30:00",
    dataAtualizacao: "2026-10-29T10:30:00",
  },
  {
    id: 2,
    titulo: "Solicitação de novo usuário",
    descricao: "Preciso criar acesso para novo funcionário",
    status: "Em andamento",
    prioridade: "Média",
    cliente: "Maria Oliveira",
    agente: "Ana Costa",
    dataCriacao: "2026-10-28T14:20:00",
    dataAtualizacao: "2026-10-29T09:15:00",
  },
  {
    id: 3,
    titulo: "Relatório não está gerando",
    descricao: "Erro ao tentar gerar relatório mensal",
    status: "Aberto",
    prioridade: "Urgente",
    cliente: "Pedro Santos",
    agente: "Carlos Santos",
    dataCriacao: "2026-10-29T08:45:00",
    dataAtualizacao: "2026-10-29T08:45:00",
  },
  {
    id: 4,
    titulo: "Dúvida sobre configuração",
    descricao: "Como configurar notificações?",
    status: "Resolvido",
    prioridade: "Baixa",
    cliente: "Ana Costa",
    agente: "Carlos Santos",
    dataCriacao: "2026-10-27T16:00:00",
    dataAtualizacao: "2026-10-28T11:30:00",
  },
  {
    id: 5,
    titulo: "Sistema lento",
    descricao: "O sistema está muito lento hoje",
    status: "Fechado",
    prioridade: "Média",
    cliente: "Lucas Ferreira",
    agente: "Ana Costa",
    dataCriacao: "2026-10-26T09:00:00",
    dataAtualizacao: "2026-10-27T15:45:00",
  },
  {
    id: 6,
    titulo: "Erro no cadastro",
    descricao: "Não consigo cadastrar novo cliente",
    status: "Aberto",
    prioridade: "Alta",
    cliente: "Juliana Mendes",
    agente: null,
    dataCriacao: "2026-10-29T11:00:00",
    dataAtualizacao: "2026-10-29T11:00:00",
  },
  {
    id: 7,
    titulo: "Backup não foi realizado",
    descricao: "O backup de ontem não foi executado",
    status: "Em andamento",
    prioridade: "Urgente",
    cliente: "Roberto Almeida",
    agente: "Carlos Santos",
    dataCriacao: "2026-10-28T18:30:00",
    dataAtualizacao: "2026-10-29T07:00:00",
  },
  {
    id: 8,
    titulo: "Alteração de senha",
    descricao: "Preciso resetar minha senha",
    status: "Resolvido",
    prioridade: "Baixa",
    cliente: "Fernanda Lima",
    agente: "Ana Costa",
    dataCriacao: "2026-10-27T10:15:00",
    dataAtualizacao: "2026-10-27T14:00:00",
  },
  {
    id: 9,
    titulo: "Problema com impressão",
    descricao: "Relatórios não estão sendo impressos corretamente",
    status: "Aberto",
    prioridade: "Média",
    cliente: "Marcos Paulo",
    agente: null,
    dataCriacao: "2026-10-29T09:30:00",
    dataAtualizacao: "2026-10-29T09:30:00",
  },
  {
    id: 10,
    titulo: "Integração com ERP",
    descricao: "Preciso integrar sistema com ERP",
    status: "Em andamento",
    prioridade: "Alta",
    cliente: "Carla Dias",
    agente: "Carlos Santos",
    dataCriacao: "2026-10-25T13:00:00",
    dataAtualizacao: "2026-10-28T16:20:00",
  },
];

export function getTicketById(id: number): Ticket | undefined {
  return mockTickets.find((ticket) => ticket.id === id);
}
