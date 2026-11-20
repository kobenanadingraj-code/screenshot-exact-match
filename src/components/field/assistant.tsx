import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Plus,
  MessageSquare,
  Copy,
  RotateCcw,
  Trash2,
  Paperclip,
  FileText,
  ListChecks,
  Network,
  ScanLine,
  CircleAlert,
  Radio,
  ArrowUp,
  X,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputButton,
  usePromptInputAttachments,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { useDemo } from "@/lib/demo-context";
import { demoResponse, type DemoMessage } from "@/lib/demo";
import { BrandSymbol, SafetyNote, IncidentPicker, Status } from "./shared";
import { toast } from "sonner";

const suggestions = [
  { title: "Analyze a telecom incident", icon: ScanLine },
  { title: "Generate a diagnostic checklist", icon: ListChecks },
  { title: "Create an intervention report", icon: FileText },
  { title: "Prepare an NOC escalation", icon: Network },
  { title: "Explain a technical alarm", icon: CircleAlert },
  { title: "Analyze equipment observations", icon: Radio },
];
function AttachmentControls() {
  const attachments = usePromptInputAttachments();
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <PromptInputButton
        aria-label="Attach files"
        title="Attach files"
        onClick={() => attachments.openFileDialog()}
      >
        <Paperclip />
      </PromptInputButton>
      {attachments.files.map((file) => (
        <div
          key={file.id}
          className="flex gap-1 items-center text-[10px] bg-elevated rounded px-2 py-1 max-w-40"
        >
          <span className="truncate">{file.filename}</span>
          <Button
            size="icon-xs"
            variant="ghost"
            title="Remove attachment"
            onClick={() => attachments.remove(file.id)}
          >
            <X />
          </Button>
        </div>
      ))}
    </div>
  );
}
export function AssistantWorkspace({ threadId }: { threadId: string }) {
  const { threads, setThreads, incidents, activeIncidentId, setActiveIncidentId, addActivity } =
    useDemo();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const thread = threads.find((t) => t.id === threadId);
  const incident = incidents.find((i) => i.id === activeIncidentId) ?? incidents[0];
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const newThread = () => {
    const id = crypto.randomUUID();
    setThreads((prev) => [{ id, title: "New conversation", messages: [] }, ...prev]);
    void navigate({ to: "/assistant/$threadId", params: { threadId: id } });
  };
  if (!thread || !incident)
    return (
      <div className="py-16 text-center">
        <h1 className="text-xl font-semibold">Conversation unavailable</h1>
        <p className="text-muted-foreground mt-3 mb-6">
          Demo conversations are available only during this session.
        </p>
        <Button onClick={newThread}>
          <Plus />
          New conversation
        </Button>
      </div>
    );
  function respond(prompt: string, regenerate = false, files: string[] = []) {
    if (busy || !incident || !thread) return;
    const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const user: DemoMessage = {
      id: crypto.randomUUID(),
      role: "user",
      parts: [
        {
          type: "text",
          text:
            prompt +
            (files.length ? `\n\nAttached (not analyzed in demo): ${files.join(", ")}` : ""),
        },
      ],
      time,
    };
    setThreads((prev) =>
      prev.map((t) =>
        t.id !== threadId
          ? t
          : {
              ...t,
              title: t.messages.length ? t.title : prompt.slice(0, 40),
              messages: regenerate
                ? t.messages.filter(
                    (m, index) => !(m.role === "assistant" && index === t.messages.length - 1),
                  )
                : [...t.messages, user],
            },
      ),
    );
    setBusy(true);
    textarea.current?.focus();
    timer.current = setTimeout(() => {
      const response: DemoMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        parts: [{ type: "text", text: demoResponse(prompt, incident) }],
        time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      };
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, messages: [...t.messages, response] } : t)),
      );
      setBusy(false);
      addActivity("Simulated assistant analysis generated", "AI Analysis", incident.site);
      textarea.current?.focus();
    }, 850);
  }
  function submit(message: PromptInputMessage) {
    if (!message.text.trim() && !message.files.length) return;
    respond(
      message.text.trim() || "Analyze equipment observations",
      false,
      message.files.map((file) => file.filename ?? "Attachment"),
    );
  }
  return (
    <div className="chat-grid">
      <aside className="chat-history">
        <Button className="w-full text-[11px] mb-6" variant="outline" onClick={newThread}>
          <Plus />
          New conversation
        </Button>
        <p className="text-[9px] uppercase text-faint px-2 mb-3">This session</p>
        <div className="space-y-2">
          {threads.map((t) => (
            <Button
              key={t.id}
              asChild
              variant="nav"
              className={`whitespace-normal text-left text-[10px] h-auto min-h-12 leading-5 ${t.id === threadId ? "active" : ""}`}
            >
              <Link to="/assistant/$threadId" params={{ threadId: t.id }}>
                <MessageSquare className="shrink-0" />
                <span>{t.title}</span>
              </Link>
            </Button>
          ))}
        </div>
        <p className="text-[9px] text-faint leading-6 px-2 mt-7">
          Demonstration conversations
          <br />
          Reset after page refresh
        </p>
      </aside>
      <section className="chat-main">
        <div className="chat-heading">
          <BrandSymbol small />
          <div className="min-w-0">
            <h1 className="text-[12px] font-semibold">AI FIELD ASSISTANT</h1>
            <p className="text-[9px] text-muted-foreground mt-1">
              Your intelligent telecom operations copilot.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Conversation history"
                  title="Conversations"
                >
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={newThread}>
                  <Plus className="mr-2 size-4" />
                  New conversation
                </DropdownMenuItem>
                {threads.map((t) => (
                  <DropdownMenuItem key={t.id} asChild>
                    <Link to="/assistant/$threadId" params={{ threadId: t.id }}>
                      {t.title}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon-sm"
              title="Clear conversation"
              aria-label="Clear conversation"
              disabled={busy || !thread.messages.length}
              onClick={() => setClearConfirm(true)}
            >
              <Trash2 />
            </Button>
          </div>
        </div>
        {clearConfirm && (
          <div className="flex justify-between gap-3 items-center bg-elevated p-3 text-[11px]">
            <span>Clear this conversation?</span>
            <div className="flex gap-2">
              <Button size="xs" variant="outline" onClick={() => setClearConfirm(false)}>
                Cancel
              </Button>
              <Button
                size="xs"
                variant="destructive"
                onClick={() => {
                  setThreads((prev) =>
                    prev.map((t) =>
                      t.id === threadId ? { ...t, messages: [], title: "New conversation" } : t,
                    ),
                  );
                  setClearConfirm(false);
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
        <Conversation>
          <ConversationContent className="gap-7 p-6">
            {thread.messages.length === 0 && (
              <div className="py-4">
                <div className="flex justify-center mb-5">
                  <BrandSymbol />
                </div>
                <h2 className="text-center text-lg font-semibold">Hello Engineer.</h2>
                <p className="text-center text-xs text-muted-foreground leading-7 mt-3">
                  I'm ready to help you analyze incidents, organize technical information and
                  generate professional intervention documents.
                </p>
                <div className="flex justify-center mt-4">
                  <span className="demo-pill">SIMULATED ASSISTANT</span>
                </div>
                <div className="prompt-suggestions">
                  {suggestions.map((s) => (
                    <Button key={s.title} variant="outline" onClick={() => respond(s.title)}>
                      <s.icon className="text-primary shrink-0" />
                      {s.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {thread.messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <div
                  className={`flex items-center gap-2 text-[9px] text-muted-foreground ${message.role === "user" ? "justify-end" : ""}`}
                >
                  {message.role === "assistant" ? "AI FIELD ASSISTANT · Demo" : "You"}
                  <span>{message.time}</span>
                </div>
                <MessageContent>
                  {message.parts.map((part, index) => (
                    <MessageResponse key={index} className="text-xs leading-7">
                      {part.text}
                    </MessageResponse>
                  ))}
                </MessageContent>
                {message.role === "assistant" && (
                  <MessageActions>
                    <MessageAction
                      tooltip="Copy response"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            message.parts.map((p) => p.text).join("\n"),
                          );
                          toast.success("Response copied.");
                        } catch {
                          toast.error("Clipboard access is unavailable.");
                        }
                      }}
                    >
                      <Copy />
                    </MessageAction>
                    <MessageAction
                      tooltip="Regenerate sample response"
                      disabled={busy || message.id !== thread.messages.at(-1)?.id}
                      onClick={() => {
                        const lastUser = [...thread.messages]
                          .reverse()
                          .find((m) => m.role === "user");
                        respond(lastUser?.parts[0]?.text ?? "Analyze this incident", true);
                      }}
                    >
                      <RotateCcw />
                    </MessageAction>
                  </MessageActions>
                )}
              </Message>
            ))}
            {busy && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <BrandSymbol small />
                <Shimmer>Preparing demonstration analysis…</Shimmer>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <div className="chat-composer">
          <PromptInput onSubmit={submit} multiple onError={(error) => toast.error(error.message)}>
            <PromptInputTextarea
              ref={textarea}
              autoFocus
              placeholder="Describe an incident or ask a technical question…"
              aria-label="Message AI FIELD ASSISTANT"
              disabled={busy}
            />
            <PromptInputFooter>
              <AttachmentControls />
              <PromptInputSubmit
                status={busy ? "submitted" : "ready"}
                disabled={busy}
                aria-label="Send message"
              >
                <ArrowUp />
              </PromptInputSubmit>
            </PromptInputFooter>
          </PromptInput>
          <p className="text-[8px] text-faint mt-2.5 text-center">
            Simulated responses · Attachments are not analyzed · Engineer validation required
          </p>
        </div>
      </section>
      <aside className="chat-context">
        <h2 className="text-xs font-semibold mb-4">Incident context</h2>
        <IncidentPicker value={incident.id} onChange={setActiveIncidentId} incidents={incidents} />
        <div className="mt-5">
          <Status value={incident.status} />
          <p className="text-xs leading-7 mt-4">{incident.description}</p>
          <p className="text-[10px] text-muted-foreground mt-3 leading-6">
            {incident.category}
            <br />
            {incident.alarms}
          </p>
        </div>
        <div className="border-t border-border mt-6 pt-5">
          <h3 className="text-xs font-semibold mb-3">Suggested actions</h3>
          <div className="flex flex-col gap-2">
            {[
              { to: "/diagnosis", label: "Diagnostic checklist", icon: ListChecks },
              { to: "/reports", label: "Intervention report", icon: FileText },
              { to: "/escalations", label: "NOC escalation", icon: Network },
            ].map((action) => (
              <Button
                key={action.to}
                asChild
                variant="ghost"
                className="justify-start p-1 text-[10px]"
              >
                <Link to={action.to}>
                  <action.icon className="text-primary" />
                  {action.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <SafetyNote />
        </div>
      </aside>
    </div>
  );
}
