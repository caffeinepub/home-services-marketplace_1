import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Loader2, MessageCircle, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { ChatMessage } from "../backend.d";
import { useActor } from "../hooks/useActor";

interface ChatDialogProps {
  bookingId: bigint;
  open: boolean;
  onClose: () => void;
  currentUserRole: "customer" | "professional";
}

function formatTime(timestampNs: bigint): string {
  const ms = Number(timestampNs) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(timestampNs: bigint): string {
  const ms = Number(timestampNs) / 1_000_000;
  const date = new Date(ms);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function ChatDialog({
  bookingId,
  open,
  onClose,
  currentUserRole,
}: ChatDialogProps) {
  const { actor } = useActor();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!actor) return;
    try {
      const msgs = await actor.getMessages(bookingId);
      // Sort by timestamp ascending
      const sorted = [...msgs].sort((a, b) =>
        Number(a.timestamp - b.timestamp),
      );
      setMessages(sorted);
      setIsError(false);
      // Scroll to bottom after updating messages
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 50);
    } catch {
      setIsError(true);
    }
  }, [actor, bookingId]);

  // Initial load + polling when open
  useEffect(() => {
    if (!open || !actor) return;

    setIsLoading(true);
    setIsError(false);

    void fetchMessages().finally(() => setIsLoading(false));

    pollingRef.current = setInterval(() => {
      void fetchMessages();
    }, 4000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [open, actor, fetchMessages]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSend = async () => {
    if (!text.trim() || !actor || isSending) return;
    const msgText = text.trim();
    setText("");
    setIsSending(true);
    try {
      await actor.sendMessage(bookingId, msgText);
      await fetchMessages();
    } catch {
      toast.error("Failed to send message. Please try again.");
      setText(msgText); // restore on failure
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  // Group messages by date
  const groupedMessages: { date: string; msgs: ChatMessage[] }[] = [];
  for (const msg of messages) {
    const dateLabel = formatDate(msg.timestamp);
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === dateLabel) {
      lastGroup.msgs.push(msg);
    } else {
      groupedMessages.push({ date: dateLabel, msgs: [msg] });
    }
  }

  const otherRole = currentUserRole === "customer" ? "Technician" : "Customer";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        className="sm:max-w-md p-0 gap-0 overflow-hidden border-border"
        data-ocid="chat.dialog"
      >
        {/* Header */}
        <DialogHeader className="px-5 py-4 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-primary" />
              </div>
              <div>
                <DialogTitle className="font-display text-base font-bold text-foreground">
                  Chat with {otherRole}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Booking #{bookingId.toString()}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
              data-ocid="chat.close_button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Messages area */}
        <div className="h-[380px] flex flex-col">
          {/* Loading state */}
          {isLoading && (
            <div
              className="flex-1 flex items-center justify-center gap-3 text-muted-foreground"
              data-ocid="chat.loading_state"
            >
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm">Loading messages...</span>
            </div>
          )}

          {/* Error state */}
          {isError && !isLoading && (
            <div
              className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground px-6 text-center"
              data-ocid="chat.error_state"
            >
              <AlertCircle className="w-8 h-8 text-destructive" />
              <p className="text-sm">
                Failed to load messages. Please try again.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void fetchMessages()}
              >
                Retry
              </Button>
            </div>
          )}

          {/* Messages */}
          {!isLoading && !isError && (
            <ScrollArea className="flex-1" data-ocid="chat.messages_list">
              <div
                ref={scrollRef}
                className="flex flex-col gap-0 px-4 py-3 h-full"
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  groupedMessages.map(({ date, msgs }) => (
                    <div key={date}>
                      {/* Date separator */}
                      <div className="flex items-center gap-3 my-3">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground font-medium px-2">
                          {date}
                        </span>
                        <div className="flex-1 h-px bg-border" />
                      </div>

                      {/* Messages in this date group */}
                      <div className="flex flex-col gap-2">
                        {msgs.map((msg) => {
                          const isOwnMessage =
                            msg.senderRole === currentUserRole;
                          const senderLabel = isOwnMessage ? "You" : otherRole;

                          return (
                            <div
                              key={msg.id.toString()}
                              className={`flex flex-col gap-1 max-w-[78%] ${isOwnMessage ? "self-end items-end" : "self-start items-start"}`}
                            >
                              <span className="text-[10px] text-muted-foreground px-1 font-medium">
                                {senderLabel}
                              </span>
                              <div
                                className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                                  isOwnMessage
                                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                                    : "bg-muted text-foreground rounded-tl-sm"
                                }`}
                              >
                                {msg.text}
                              </div>
                              <span className="text-[10px] text-muted-foreground px-1">
                                {formatTime(msg.timestamp)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Input area */}
        <div className="px-4 py-3 border-t border-border bg-card flex gap-2 items-center">
          <Input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message the ${otherRole.toLowerCase()}...`}
            className="flex-1 rounded-xl border-border bg-background text-sm"
            disabled={isSending}
            data-ocid="chat.input"
          />
          <Button
            size="icon"
            onClick={() => void handleSend()}
            disabled={!text.trim() || isSending}
            className="h-9 w-9 rounded-xl shrink-0"
            data-ocid="chat.send_button"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
