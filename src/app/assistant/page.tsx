"use client";

import { useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Card } from "@/components/ui";
import { cx } from "@/lib/format";
import { answerFor, SUGGESTED_QUESTIONS } from "@/lib/data";

interface Msg {
  role: "user" | "assistant";
  text: string;
}

const GREETING =
  "Hi! I'm your CAVA data assistant. I can read across inventory, sales, cash flow and marketing. Ask me anything — or tap a suggested question below.";

export default function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", text: GREETING }]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = (text: string) => {
    const q = text.trim();
    if (!q || thinking) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setThinking(true);
    // Simulate the assistant "reading the warehouse" before replying.
    window.setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", text: answerFor(q) }]);
      setThinking(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }));
    }, 650);
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current!.scrollHeight, behavior: "smooth" }));
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col" style={{ height: "calc(100vh - 150px)" }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-9 w-9 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center">
          <Sparkles size={18} />
        </div>
        <div>
          <h2 className="text-sm font-semibold">Ask AI</h2>
          <p className="text-[11px] text-[var(--muted)]">Query your data warehouse in plain English · prototype</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 p-0 overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={cx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cx(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line leading-relaxed",
                  m.role === "user" ? "bg-[var(--accent)] text-black" : "bg-[var(--surface-2)] text-[var(--foreground)]"
                )}
              >
                {m.text}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="bg-[var(--surface-2)] rounded-2xl px-4 py-3 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--muted)] animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-[var(--muted)] animate-bounce" style={{ animationDelay: "120ms" }} />
                <span className="h-2 w-2 rounded-full bg-[var(--muted)] animate-bounce" style={{ animationDelay: "240ms" }} />
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="px-5 pb-3">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] font-semibold mb-2">Try asking</div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/40 text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-[var(--border)] p-3 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Ask about stockouts, cash runway, ROAS, competitors…"
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]/50"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || thinking}
            className="rounded-xl bg-[var(--accent)] text-black px-4 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </Card>
    </div>
  );
}
