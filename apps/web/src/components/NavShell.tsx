import { NavLink } from "react-router-dom";
import { Grid3x3, Layers } from "lucide-react";
import type { ReactNode } from "react";

const linkBase =
  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors";
const linkIdle = "text-muted-foreground hover:text-foreground hover:bg-muted";
const linkActive = "bg-primary text-primary-foreground";

export default function NavShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border sticky top-0 z-10 bg-background/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-6">
          <div className="font-semibold tracking-tight">claude-palace</div>
          <nav className="flex items-center gap-1">
            <NavLink
              to="/palace"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
            >
              <Grid3x3 className="size-4" />
              Palace
            </NavLink>
            <NavLink
              to="/sessions"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
            >
              <Layers className="size-4" />
              Sessions
            </NavLink>
          </nav>
          <div className="ml-auto text-xs text-muted-foreground">
            API: localhost:8000
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-6">{children}</main>
    </div>
  );
}
