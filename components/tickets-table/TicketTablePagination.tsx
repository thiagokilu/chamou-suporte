import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export function TicketTablePagination({
  pageSize,
  currentPage,
  totalPages,
  onPageSizeChange,
  onPageChange,
}: {
  pageSize: number;
  currentPage: number;
  totalPages: number;
  onPageSizeChange: (size: number) => void;
  onPageChange: (page: number) => void;
}) {
  return (
    <footer className="flex flex-col gap-3 border-t border-[#D8E1DA] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <label className="flex items-center gap-2 text-sm text-[#4B5E54]">
        Exibir
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="rounded-lg border border-[#D8E1DA] bg-white px-2 py-1 text-sm text-[#10241A] outline-none focus-visible:ring-2 focus-visible:ring-[#15803D]"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        por página
      </label>
      <div className="flex items-center gap-4">
        <span className="text-sm text-[#4B5E54]">Página <span className="tabular-nums">{currentPage} de {totalPages}</span></span>
        <div className="flex gap-1">
          <button aria-label="Página anterior" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} className="rounded-lg border border-[#D8E1DA] p-1.5 text-[#4B5E54] transition-colors hover:bg-[#DDF3E4] hover:text-[#0F3D2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none">
            <FiChevronLeft aria-hidden="true" />
          </button>
          <button aria-label="Próxima página" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} className="rounded-lg border border-[#D8E1DA] p-1.5 text-[#4B5E54] transition-colors hover:bg-[#DDF3E4] hover:text-[#0F3D2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none">
            <FiChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
