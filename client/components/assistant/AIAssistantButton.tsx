import { useEffect, useRef, useState } from "react";
import { FaRegCommentDots, FaRegPaperPlane, FaRegStar } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { importRecommendations } from "@/lib/planner";

interface ChatMsg { id: string; text: string; fromMe: boolean }

const suggestions = [
  "Find popular spots",
  "Book tickets",
  "Plan my trip",
];

export default function AIAssistantButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: "w1", text: "Hi! I can help plan destinations, tickets, and itineraries.", fromMe: false },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  const ask = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { id: crypto.randomUUID(), text, fromMe: true }]);
    // Simulate AI reply
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          text:
            text.toLowerCase().includes("plan")
              ? "Here's a 3-day plan: Day 1 Tokyo highlights, Day 2 Kyoto temples, Day 3 Osaka food tour."
              : text.toLowerCase().includes("book")
              ? "I can remind you to book flights and trains."
              : "Top spots: Fushimi Inari, Arashiyama Bamboo Grove, Dotonbori.",
          fromMe: false,
        },
      ]);
    }, 700);
    setInput("");
  };

  const saveToPlanner = () => {
    const recs = messages.filter((m) => !m.fromMe).slice(-3).map((m) => m.text);
    importRecommendations(recs);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        aria-label="AI Assistant"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-24 right-4 md:right-6 z-40 p-4 rounded-full shadow-lg bg-primary text-primary-foreground hover:shadow-xl"
      >
        <FaRegStar className="h-5 w-5" />
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setOpen(false)}>
          <div
            className="absolute bottom-0 right-0 left-0 md:left-auto md:right-6 md:bottom-24 md:w-[380px] bg-white rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b bg-white/80 backdrop-blur-sm flex items-center gap-2">
              <FaRegCommentDots className="h-5 w-5 text-primary" />
              <div className="font-semibold text-foreground">AI Travel Assistant</div>
              <div className="ml-auto">
                <Button size="sm" variant="secondary" onClick={saveToPlanner}>Save to To-Do</Button>
              </div>
            </div>
            <div className="max-h-[55vh] overflow-y-auto p-4 space-y-2 bg-[hsl(var(--background))]">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${m.fromMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary text-foreground rounded-bl-sm"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap gap-2 pt-2">
                {suggestions.map((s) => (
                  <Button key={s} variant="outline" size="sm" onClick={() => ask(s)}>
                    {s}
                  </Button>
                ))}
              </div>
              <div ref={endRef} />
            </div>
            <div className="p-3 border-t bg-white">
              <div className="flex items-center gap-2">
                <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about destinations, tickets, itineraries…" onKeyDown={(e) => { if (e.key === "Enter") ask(input); }} />
                <Button onClick={() => ask(input)} className="bg-primary text-primary-foreground">
                  <FaRegPaperPlane className="h-4 w-4 mr-1" /> Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
