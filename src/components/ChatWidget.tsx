import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const WEBHOOK_URL =
  "https://divya2312.app.n8n.cloud/webhook/a0fcb1bc-8e59-4d2c-a448-f78eba76374e";

type Msg = { role: "user" | "bot"; text: string };

function extractReply(data: unknown): string {
  if (typeof data === "string") return data;
  if (Array.isArray(data) && data.length) return extractReply(data[0]);
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const k of ["reply", "response", "message", "output", "text", "answer"]) {
      const v = o[k];
      if (typeof v === "string" && v.trim()) return v;
      if (v && typeof v === "object") return extractReply(v);
    }
  }
  return "Thanks for your message! We'll get back to you shortly.";
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "Hi! I'm Kishor Electronics assistant. How can I help you today?" },
  ]);
  const sessionId = useRef<string>(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2),
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setSending(true);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId.current,
          message: text,
          timestamp: new Date().toISOString(),
        }),
      });
      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json() : await res.text();
      setMessages((m) => [...m, { role: "bot", text: extractReply(data) }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "bot", text: "Sorry, I couldn't reach the server. Please try again." },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-brand text-brand-foreground shadow-[var(--shadow-lift)] transition-transform hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
      {open && (
        <div
          className={cn(
            "fixed bottom-5 right-5 z-50 flex w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-[var(--shadow-lift)]",
            "h-[70vh] max-h-[520px]",
          )}
        >
          <div className="flex items-center justify-between bg-brand px-4 py-3 text-brand-foreground">
            <div>
              <div className="text-sm font-semibold">Kishor Electronics</div>
              <div className="text-[11px] opacity-90">We reply as soon as we can</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="p-1">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto bg-surface-alt p-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm",
                    m.role === "user"
                      ? "bg-brand text-brand-foreground rounded-br-sm"
                      : "bg-background border border-border rounded-bl-sm",
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-border bg-background px-3 py-2 text-sm text-ink-muted">
                  Typing…
                </div>
              </div>
            )}
          </div>
          <form onSubmit={send} className="flex items-center gap-2 border-t border-border bg-background p-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message…"
              className="h-10"
              disabled={sending}
            />
            <Button type="submit" size="icon" className="h-10 w-10 shrink-0" disabled={sending || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}