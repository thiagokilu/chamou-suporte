export const getStatusColor = (status: string) => {
  switch (status) {
    case "Aberto":
      return "bg-sky-100 text-sky-900 ring-1 ring-sky-200";
    case "Em andamento":
      return "bg-sky-100 text-sky-900 ring-1 ring-sky-200";
    case "Aguardando cliente":
    case "Aguardando resposta":
      return "bg-amber-100 text-amber-900 ring-1 ring-amber-200";
    case "Resolvido":
      return "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200";
    case "Fechado":
      return "bg-[#F2F6F3] text-[#4B5E54] ring-1 ring-[#D8E1DA]";
    default:
      return "bg-[#F2F6F3] text-[#4B5E54] ring-1 ring-[#D8E1DA]";
  }
};

export const getStatusDot = (status: string) => {
  switch (status) {
    case "Aberto":
      return "bg-blue-400";
    case "Em andamento":
      return "bg-blue-400";
    case "Aguardando cliente":
    case "Aguardando resposta":
      return "bg-amber-400";
    case "Resolvido":
      return "bg-emerald-400";
    case "Fechado":
      return "bg-zinc-500";
    default:
      return "bg-zinc-500";
  }
};

export const getPrioridadeColor = (prioridade: string) => {
  switch (prioridade) {
    case "Urgente":
      return "bg-rose-100 text-rose-900 ring-1 ring-rose-200";
    case "Alta":
      return "bg-rose-100 text-rose-900 ring-1 ring-rose-200";
    case "Média":
      return "bg-amber-100 text-amber-900 ring-1 ring-amber-200";
    case "Baixa":
      return "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200";
    default:
      return "bg-[#F2F6F3] text-[#4B5E54] ring-1 ring-[#D8E1DA]";
  }
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const getInitials = (name: string) => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

export const getAvatarColor = (name: string) => {
  const colors = [
    "bg-violet-700",
    "bg-blue-700",
    "bg-emerald-700",
    "bg-rose-700",
    "bg-amber-700",
    "bg-cyan-700",
    "bg-pink-700",
    "bg-indigo-700",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
