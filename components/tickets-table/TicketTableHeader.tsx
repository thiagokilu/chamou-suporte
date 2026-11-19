import { FiArrowDown, FiArrowUp } from "react-icons/fi";
import type { SortKey } from "./TicketTableTypes";

function Sort({
  label,
  current,
  desc,
  onClick,
}: {
  label: string;
  current: boolean;
  desc: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-sm transition-colors hover:text-[#0F3D2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] motion-reduce:transition-none ${current ? "text-[#0F3D2A]" : ""}`}
    >
      {label}
      {current ? (
        desc ? (
          <FiArrowDown aria-hidden="true" />
        ) : (
          <FiArrowUp aria-hidden="true" />
        )
      ) : (
        <FiArrowDown className="text-[#9AA99F]" aria-hidden="true" />
      )}
    </button>
  );
}

export function TicketTableHeader({
  sort,
  desc,
  onSort,
}: {
  sort: SortKey;
  desc: boolean;
  onSort: (key: SortKey) => void;
}) {
  return (
    <thead className="border-y border-[#D8E1DA] bg-[#F2F6F3] text-xs font-semibold text-[#4B5E54]">
      <tr>
        <th scope="col" className="w-[85px] px-6 py-3.5">
          ID
        </th>
        <th scope="col" className="min-w-[250px] px-3 py-3.5">
          Assunto
        </th>
        <th scope="col" className="px-3 py-3.5">
          Solicitante
        </th>
        <th scope="col" className="px-3 py-3.5">
          Agente responsável
        </th>
        <th scope="col" className="px-3 py-3.5">
          Status
        </th>
        <th scope="col" className="px-3 py-3.5">
          <Sort
            label="Prioridade"
            current={sort === "priority"}
            desc={desc}
            onClick={() => onSort("priority")}
          />
        </th>
        <th scope="col" className="px-3 py-3.5">
          <Sort
            label="Criação"
            current={sort === "created"}
            desc={desc}
            onClick={() => onSort("created")}
          />
        </th>
        <th scope="col" className="px-3 py-3.5">
          <Sort
            label="Atualização"
            current={sort === "updated"}
            desc={desc}
            onClick={() => onSort("updated")}
          />
        </th>
        <th scope="col" className="w-[60px] px-3 py-3.5">
          <span className="sr-only">Ações</span>
        </th>
      </tr>
    </thead>
  );
}
