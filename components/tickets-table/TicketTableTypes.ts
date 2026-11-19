export type Status = "Aberto" | "Em andamento" | "Aguardando resposta" | "Resolvido" | "Fechado";
export type Priority = "Baixa" | "Média" | "Alta" | "Urgente";
export type Tone = "teal" | "violet";

export type PersonInfo = {
  name: string;
  initials: string;
  tone: Tone;
};

export type Ticket = {
  id: string;
  subject: string;
  requester: PersonInfo;
  agent: PersonInfo | null;
  status: Status;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
};

export type SortKey = "updated" | "created" | "priority";
