"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PostchatIa } from "../lib/http/chat";
import Markdown from "react-markdown";

type Msg = { id: string; role: "user" | "assistant"; text: string };
type ChatHistory = { role: "user" | "model"; text: string }[];

const uid = () => Math.random().toString(36).slice(2);

function getAssistantText(payload: unknown): string {
  if (typeof payload === "string") return payload;
  if (!payload || typeof payload !== "object") return "";

  const data = payload as Record<string, unknown>;
  for (const key of ["reply", "answer", "response", "message", "output_text", "content", "output"]) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value;
  }

  const choices = data.choices;
  if (Array.isArray(choices) && choices.length > 0) {
    const firstChoice = choices[0] as Record<string, unknown>;
    const message = firstChoice.message as Record<string, unknown> | undefined;
    if (typeof message?.content === "string") return message.content;
    if (typeof firstChoice.text === "string") return firstChoice.text;
  }

  for (const key of ["data", "result"]) {
    const nested = getAssistantText(data[key]);
    if (nested) return nested;
  }

  return "";
}

export default function ChatModal() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSent, setLastSent] = useState<{ text: string; history: ChatHistory } | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, loading, open]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = useCallback(async (text: string, history: ChatHistory, addToList = true) => {
    setError(null);
    setLoading(true);
    setLastSent({ text, history });
    if (addToList) {
      setMessages((m) => [...m, { id: uid(), role: "user", text }]);
    }

    try {
      const response = await PostchatIa<unknown>(text, history);
      const answer = getAssistantText(response);

      if (!answer.trim()) {
        setError("A resposta da API não contém um texto reconhecido.");
        return;
      }

      setMessages((m) => [...m, { id: uid(), role: "assistant", text: answer }]);
    } catch (requestError) {
      console.error(requestError);
      setError("Sem conexão com o chat. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  const submit = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const history = messages.map(({ role, text }) => ({
      role: role === "assistant" ? "model" as const : "user" as const,
      text,
    }));
    send(text, history);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir chat"
        data-tour="ai-chat"
        className="fixed bottom-5 right-5 z-50 rounded-full bg-[#15803D] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#116A32] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F7F4] motion-reduce:transition-none"
      >
        Chat
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-end sm:p-5"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Chat"
            className="flex h-full w-full flex-col overflow-hidden border border-[#D8E1DA] bg-[var(--ch-surface)] text-[15px] leading-snug text-[var(--ch-ink)] sm:h-[620px] sm:max-h-full sm:w-[420px] sm:rounded-2xl"
          >
            {/* Cabeçalho */}
            <header className="flex items-center justify-between border-b border-[#D8E1DA] bg-[var(--ch-side)] px-4 py-3.5 font-semibold text-[var(--ch-ink)]">
              <span>Chat</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar chat"
                className="rounded-md px-1 text-2xl leading-none transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 motion-reduce:transition-none"
              >
                ×
              </button>
            </header>

            {/* Mensagens */}
            <div
              ref={listRef}
              aria-live="polite"
              className="flex flex-1 flex-col gap-2 overflow-y-auto p-4"
            >
              {messages.length === 0 && (
                <p className="m-auto text-[#4B5E54]">
                  Escreva uma mensagem para começar.
                </p>
              )}

              {messages.map((m) => (
                  <div
                    key={m.id}
                    className={
                      "max-w-[82%] break-words rounded-2xl px-3.5 py-2 " +
                      (m.role === "user"
                        ? "self-end whitespace-pre-wrap rounded-br-sm bg-[#15803D] text-white"
                        : "self-start rounded-bl-sm border border-[#D8E1DA] bg-[#F2F6F3] text-[#10241A]")
                    }
                  >
                    {m.role === "assistant" ? <Markdown>{m.text}</Markdown> : m.text}
                  </div>
              ))}

              {loading && (
                <div className="flex gap-1 self-start rounded-2xl rounded-bl-sm border border-[#D8E1DA] bg-[#F2F6F3] px-3.5 py-3.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4B5E54] motion-reduce:animate-none" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4B5E54] [animation-delay:150ms] motion-reduce:animate-none" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4B5E54] [animation-delay:300ms] motion-reduce:animate-none" />
                </div>
              )}

              {error && (
                <div className="flex items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
                  <span>{error}</span>
                  {lastSent && (
                    <button
                      onClick={() => send(lastSent.text, lastSent.history, false)}
                      className="shrink-0 rounded-lg border border-rose-300 px-2 py-0.5 text-rose-900 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] motion-reduce:transition-none"
                    >
                      Tentar de novo
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Campo de envio */}
            <div className="flex gap-2 border-t border-[#D8E1DA] bg-white p-3">
              <textarea
                ref={inputRef}
                value={input}
                rows={1}
                placeholder="Digite sua mensagem"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                className="max-h-[120px] flex-1 resize-none rounded-xl border border-[#D8E1DA] bg-white px-3 py-2 text-[#10241A] outline-none placeholder:text-[#718078] focus-visible:ring-2 focus-visible:ring-[#15803D]"
              />
              <button
                onClick={submit}
                disabled={loading || !input.trim()}
                className="rounded-xl bg-[#15803D] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#116A32] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
