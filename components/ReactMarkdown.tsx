import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="my-1 first:mt-0 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="my-1 list-disc pl-5">{children}</ul>,
        ol: ({ children }) => <ol className="my-1 list-decimal pl-5">{children}</ol>,
        li: ({ children }) => <li className="my-0.5">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        h1: ({ children }) => <h3 className="mb-1 mt-2 text-base font-bold">{children}</h3>,
        h2: ({ children }) => <h3 className="mb-1 mt-2 text-base font-bold">{children}</h3>,
        h3: ({ children }) => <h3 className="mb-1 mt-2 font-semibold">{children}</h3>,
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#15803D] underline hover:text-[#116A32]"
          >
            {children}
          </a>
        ),
        code: ({ children, className }) =>
          className ? (
            // bloco de código (tem className "language-xxx")
            <code className={className}>{children}</code>
          ) : (
            <code className="rounded bg-black/10 px-1 py-0.5 text-[13px]">{children}</code>
          ),
        pre: ({ children }) => (
          <pre className="my-2 overflow-x-auto rounded-lg bg-[#10241A] p-3 text-[13px] text-emerald-50">
            {children}
          </pre>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-1 border-l-4 border-[#D8E1DA] pl-3 text-[#4B5E54]">
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div className="my-2 overflow-x-auto">
            <table className="w-full border-collapse text-sm">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-[#D8E1DA] bg-white/60 px-2 py-1 text-left">{children}</th>
        ),
        td: ({ children }) => (
          <td className="border border-[#D8E1DA] px-2 py-1">{children}</td>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
