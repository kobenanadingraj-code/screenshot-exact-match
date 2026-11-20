import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Bot,
  ClipboardList,
  ScanLine,
  FileText,
  Network,
  BookOpen,
  History,
  Settings,
  Search,
  Bell,
  CircleHelp,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  FlaskConical,
  Menu,
  ExternalLink,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useDemo } from "@/lib/demo-context";
import { BrandSymbol, Status } from "./shared";
import { NewIncident } from "./incidents";

const navigation = [
  { title: "AI Overview", path: "/", icon: LayoutDashboard },
  { title: "AI Assistant", path: "/assistant", icon: Bot },
  { title: "Incident Management", path: "/incidents", icon: ClipboardList },
  { title: "Smart Diagnosis", path: "/diagnosis", icon: ScanLine },
  { title: "Intervention Reports", path: "/reports", icon: FileText },
  { title: "NOC Escalation", path: "/escalations", icon: Network },
  { title: "Knowledge Base", path: "/knowledge", icon: BookOpen },
  { title: "History", path: "/history", icon: History },
  { title: "Settings", path: "/settings", icon: Settings },
] as const;
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { theme, setTheme, engineer, incidents } = useDemo();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notificationRead, setNotificationRead] = useState(false);
  const current =
    navigation.find((item) =>
      item.path === "/" ? pathname === "/" : pathname.startsWith(item.path),
    ) ?? navigation[0];
  return (
    <TooltipProvider>
      <div className="app-shell">
        {mobileOpen && <div className="mobile-backdrop" onClick={() => setMobileOpen(false)} />}
        <aside
          className={`app-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}
        >
          <Link to="/" className="wordmark" aria-label="AI FIELD ASSISTANT home">
            <BrandSymbol />
            <div className="sidebar-label">
              <div className="wordmark-name">
                AI FIELD
                <br />
                ASSISTANT<span className="text-primary">.</span>
              </div>
              <div className="wordmark-sub">TELECOM OPERATIONS INTELLIGENCE</div>
            </div>
          </Link>
          <div className="nav-section-label sidebar-label">Workspace</div>
          <nav className="sidebar-nav" aria-label="Main navigation">
            {navigation.map((item, index) => (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="nav"
                    className={`nav-control ${current.path === item.path ? "active" : ""}`}
                  >
                    <Link to={item.path} onClick={() => setMobileOpen(false)}>
                      <item.icon />
                      <span className="sidebar-label">{item.title}</span>
                      {index === 1 && !collapsed && (
                        <span className="sidebar-label ml-auto text-[8px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          AI
                        </span>
                      )}
                      {index === 2 && !collapsed && (
                        <span className="sidebar-label ml-auto text-[9px] text-faint">
                          {
                            incidents.filter((i) => !["Resolved", "Closed"].includes(i.status))
                              .length
                          }
                        </span>
                      )}
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{item.title}</TooltipContent>
              </Tooltip>
            ))}
          </nav>
          <div className="mx-5 mt-auto mb-5 border border-border rounded-lg p-3.5 sidebar-label">
            <div className="flex items-center gap-2 text-[10px] font-medium">
              <span className="size-1.5 rounded-full bg-success" />
              Workspace ready
            </div>
            <p className="text-[9px] text-muted-foreground mt-2 leading-relaxed">
              Local demonstration
              <br />
              No live network connected
            </p>
          </div>
          <div className="sidebar-bottom">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="size-8 rounded-full bg-elevated border border-border flex items-center justify-center text-[10px] font-semibold shrink-0">
                {engineer
                  .split(" ")
                  .map((v) => v[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="sidebar-label min-w-0">
                <p className="text-[11px] font-medium truncate">{engineer}</p>
                <p className="text-[9px] text-muted-foreground mt-1">Telecom Field Engineer</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="sidebar-label text-[9px] text-faint">v1.0.0 · Demo</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                  aria-label="Toggle theme"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? <Sun /> : <Moon />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  aria-label="Toggle sidebar"
                  className="hidden min-[901px]:inline-flex"
                  onClick={() => setCollapsed(!collapsed)}
                >
                  {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
                </Button>
              </div>
            </div>
          </div>
        </aside>
        <div className={`app-main ${collapsed ? "sidebar-collapsed" : ""}`}>
          <header className="topbar">
            <div className="flex items-center gap-3">
              <Button
                className="min-[641px]:hidden"
                variant="ghost"
                size="icon"
                aria-label="Open navigation"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X /> : <Menu />}
              </Button>
              <div>
                <h2 className="text-[15px] font-semibold">{current.title}</h2>
                <div className="mt-1.5 flex items-center gap-1.5 text-[9px] text-muted-foreground">
                  <Link to="/">Workspace</Link>
                  <ChevronRight className="size-2.5" />
                  <span className="text-foreground/80">{current.title}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="topbar-search h-8 w-56 justify-start text-muted-foreground text-[10px] bg-card border-border"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="size-3.5" />
                Search workspace…<span className="ml-auto text-faint">⌕</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Notifications"
                    title="Notifications"
                    className="relative"
                  >
                    <Bell />
                    {!notificationRead && (
                      <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>Demo notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => setNotificationRead(true)}
                    className="flex flex-col items-start gap-2 py-3"
                  >
                    <span>Supervision loss requires verification</span>
                    <span className="technical text-muted-foreground">SITE-DEMO-001</span>
                    <Status value="Under Analysis" />
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setNotificationRead(true)}>
                    Mark notifications as read
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Help and safety"
                title="Help and safety"
                onClick={() => setHelpOpen(true)}
              >
                <CircleHelp />
              </Button>
              <div className="h-6 w-px bg-border mx-1" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-1" aria-label="Profile menu">
                    <span className="size-8 rounded-full bg-elevated border border-border grid place-items-center text-[10px]">
                      {engineer
                        .split(" ")
                        .map((v) => v[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <ChevronDown className="size-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{engineer}</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <Settings className="mr-2 size-4" />
                      Profile settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    {theme === "dark" ? "Light appearance" : "Dark appearance"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="workspace">
            <div className="demo-bar">
              <div className="flex items-center gap-3">
                <span className="demo-pill">
                  <FlaskConical className="size-3" />
                  DEMONSTRATION MODE
                </span>
                <span>Illustrative data only. No live AI or network connection.</span>
              </div>
              <Link
                to="/incidents/$incidentId"
                params={{ incidentId: "INC-2026-001" }}
                className="demo-extra text-[10px] text-primary flex items-center gap-1.5 shrink-0"
              >
                Explore demo scenario
                <ExternalLink className="size-3" />
              </Link>
            </div>
            {children}
            <footer className="workspace-footer">
              <span>© 2026 AI FIELD ASSISTANT · Telecom Operations Intelligence Platform</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3" />
                AI assists. Engineers validate.
              </span>
            </footer>
          </main>
        </div>
        <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Search workspace</DialogTitle>
              <DialogDescription>
                Find demonstration incidents and operational modules.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Search sites, incidents, or modules…"
              aria-label="Global search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {incidents
                .filter((i) =>
                  `${i.site} ${i.id} ${i.category}`.toLowerCase().includes(search.toLowerCase()),
                )
                .map((i) => (
                  <Button key={i.id} variant="ghost" className="w-full justify-between" asChild>
                    <Link
                      to="/incidents/$incidentId"
                      params={{ incidentId: i.id }}
                      onClick={() => setSearchOpen(false)}
                    >
                      <span className="technical">{i.site}</span>
                      <Status value={i.status} />
                    </Link>
                  </Button>
                ))}
              {navigation
                .filter((i) => i.title.toLowerCase().includes(search.toLowerCase()))
                .map((i) => (
                  <Button key={i.path} variant="ghost" asChild className="w-full justify-start">
                    <Link to={i.path} onClick={() => setSearchOpen(false)}>
                      <i.icon />
                      {i.title}
                    </Link>
                  </Button>
                ))}
            </div>
            <NewIncident compact />
          </DialogContent>
        </Dialog>
        <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Engineer safety & demonstration scope</DialogTitle>
              <DialogDescription>
                Human judgment remains essential to all telecom operations.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                No live AI, monitoring system, or external storage is connected. Sample responses do
                not analyze attached files.
              </p>
              <p>
                Only record tests you actually performed. Review every hypothesis and recommendation
                using authorized technical and safety procedures.
              </p>
              <p>
                Demo work resets when this page is refreshed. Generated documents are clearly marked
                as simulated.
              </p>
              <Button asChild variant="outline">
                <Link to="/knowledge" onClick={() => setHelpOpen(false)}>
                  <BookOpen />
                  Knowledge library
                </Link>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
