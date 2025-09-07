import { useEffect, useRef, useState } from "react";
import { ArrowLeft, MoreVertical, Send, Smile } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/navigation/BottomNav";
import { useNavigate } from "react-router-dom";

interface Message { id: string; text: string; fromMe: boolean; timestamp: string }

export default function Messages() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Hey! Ready to plan our Japan trip?", fromMe: true, timestamp: "10:10" },
    { id: "2", text: "Absolutely! Tokyo first then Kyoto?", fromMe: false, timestamp: "10:11" },
    { id: "3", text: "Perfect. I love temples and food markets.", fromMe: true, timestamp: "10:12" },
  ]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const send = () => {
    if (!text.trim()) return;
    const now = new Date();
    setMessages((prev) => [...prev, { id: String(now.getTime()), text, fromMe: true, timestamp: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setText("");
    // Simulate partner typing
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { id: String(Date.now()), text: "Sounds great!", fromMe: false, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button aria-label="Back" onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted text-foreground/80">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Avatar className="h-9 w-9 ring-2 ring-primary/20">
            <AvatarImage src="/api/placeholder/64/64" alt="Buddy" />
            <AvatarFallback>TB</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="font-semibold text-foreground">Marcus</div>
              <span className="inline-flex items-center gap-1 text-xs text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-500" /> online
              </span>
            </div>
            {typing && <div className="text-xs text-muted-foreground">typing…</div>}
          </div>
          <button aria-label="More" className="p-2 rounded-lg hover:bg-muted text-foreground/80">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="max-w-3xl mx-auto px-4 pt-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${m.fromMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary text-foreground rounded-bl-sm"}`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
              <div className={`text-[10px] mt-1 ${m.fromMe ? "text-white/80" : "text-foreground/60"}`}>{m.timestamp}</div>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="max-w-[60%] rounded-2xl px-4 py-2 bg-secondary text-foreground shadow-sm">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-foreground/60 animate-bounce [animation-delay:-0.2s]" />
                <span className="h-2 w-2 rounded-full bg-foreground/60 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-foreground/60 animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </main>

      {/* Composer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t">
        <div className="max-w-3xl mx-auto px-3 py-2 flex items-end gap-2">
          <button aria-label="Emoji" className="p-2 rounded-lg hover:bg-muted text-foreground/80">
            <Smile className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a message…"
              className="bg-white/90"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            />
          </div>
          <Button onClick={send} aria-label="Send" className="bg-primary text-primary-foreground">
            <Send className="h-4 w-4 mr-1" /> Send
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
