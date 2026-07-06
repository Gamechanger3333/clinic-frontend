"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, X, Sparkles, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

export interface AiAssistantProps {
  /** "app" = logged-in, role-aware assistant. "public" = landing page visitor assistant. */
  mode: "app" | "public";
  role?: string; // patient | doctor | receptionist | admin (mode="app" only)
}

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const GREETINGS: Record<string, string> = {
  patient:
    "Hi! I'm your ClinicFlow assistant. Ask me about booking appointments, your prescriptions, lab reports, or billing.",
  doctor:
    "Hi Doctor. I can help draft visit notes, organize today's patients, or think through documentation — final medical decisions are always yours.",
  receptionist:
    "Hi! I can help with scheduling logic, patient registration steps, or front-desk questions.",
  admin:
    "Hi! I can help with staff management, clinic-wide stats, announcements, or workflow questions.",
  public:
    "Hi! I'm the ClinicFlow assistant. Ask me what ClinicFlow does, or how appointments, records, and billing work here.",
};

const ENDPOINT: Record<AiAssistantProps["mode"], string> = {
  app: "/api/ai/chat",
  public: "/api/ai/public-chat",
};

export default function AiAssistant({ mode, role = "public" }: AiAssistantProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const greeting = GREETINGS[mode === "app" ? role : "public"] || GREETINGS.public;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError(null);
    const nextHistory: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(nextHistory);
    setLoading(true);

    try {
      const res = await apiFetch(ENDPOINT[mode], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages.slice(-10) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setMessages([...nextHistory, { role: "assistant", content: data.reply }]);
    } catch (e: any) {
      setError(e.message || "AI assistant is unavailable right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Floating launcher button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open AI assistant"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-lg px-4 py-3 hover:opacity-90 transition-opacity"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">AI Assistant</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[560px] flex flex-col rounded-2xl border border-border bg-background shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <p className="text-sm font-semibold leading-tight">ClinicFlow AI</p>
                <p className="text-[11px] opacity-80 leading-tight capitalize">
                  {mode === "app" ? `${role} assistant` : "visitor assistant"}
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close AI assistant" className="opacity-90 hover:opacity-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
            <div className="flex">
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm">{greeting}</div>
            </div>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
                </div>
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-border flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type a message..."
              className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 max-h-24"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="rounded-lg bg-primary text-primary-foreground p-2.5 disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
