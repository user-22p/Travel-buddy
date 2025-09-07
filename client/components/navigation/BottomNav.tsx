import { Home, MessageCircle, User, ListTodo, Wallet } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = (p: string) => pathname.startsWith(p);
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="mx-auto max-w-3xl">
        <div className="m-3 rounded-2xl bg-white/85 backdrop-blur-md border border-[hsl(var(--border))] shadow-lg">
          <div className="flex items-center justify-around py-2">
            <button
              aria-label="Home"
              onClick={() => navigate("/")}
              className={`p-3 rounded-xl ${isActive("/") ? "text-primary bg-primary/10" : "text-foreground/70 hover:bg-muted"}`}
            >
              <Home className="h-5 w-5" />
            </button>
            <button
              aria-label="Planner"
              onClick={() => navigate("/planner")}
              className={`p-3 rounded-xl ${isActive("/planner") ? "text-primary bg-primary/10" : "text-foreground/70 hover:bg-muted"}`}
            >
              <ListTodo className="h-5 w-5" />
            </button>
            <button
              aria-label="Expenses"
              onClick={() => navigate("/expenses")}
              className={`p-3 rounded-xl ${isActive("/expenses") ? "text-primary bg-primary/10" : "text-foreground/70 hover:bg-muted"}`}
            >
              <Wallet className="h-5 w-5" />
            </button>
            <button
              aria-label="Messages"
              onClick={() => navigate("/messages")}
              className={`p-3 rounded-xl ${isActive("/messages") ? "text-primary bg-primary/10" : "text-foreground/70 hover:bg-muted"}`}
            >
              <MessageCircle className="h-5 w-5" />
            </button>
            <button
              aria-label="Profile"
              onClick={() => navigate("/profile")}
              className={`p-3 rounded-xl ${isActive("/profile") ? "text-primary bg-primary/10" : "text-foreground/70 hover:bg-muted"}`}
            >
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
