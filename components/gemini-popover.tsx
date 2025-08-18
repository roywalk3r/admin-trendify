"use client";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send,
  Bot,
  Loader,
  X,
  Sparkles,
  Trash2,
  Minimize2,
  Copy,
  Check,
} from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";

interface Message {
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  model?: string;
  metricsFriendlyTimestamp?: string;
}

export default function GeminiPopover() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const quickPrompts = [
    "How many products are active?",
    "Show me low stock items",
    "What's the total revenue this month?",
    "How many pending orders today?",
  ];

  const popoverRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsMinimized(false);
      }
    }

    if (isOpen && !isMinimized) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, isMinimized]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation, isMinimized]);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen && !isMinimized && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const sendQuick = async (q: string) => {
    if (isLoading) return;
    setPrompt(q);
    // Wait one tick so state updates before submit
    setTimeout(() => {
      handleSubmit();
    }, 0);
  };

  const handleCopy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 1200);
    } catch (e) {
      // noop
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    const userMessage: Message = {
      type: "user",
      content: prompt,
      timestamp: new Date(),
    };

    setConversation((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError("");
    setPrompt("");

    try {
      const response = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          clientContext: { pathname },
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to get response");

      const aiMessage: Message = {
        type: "ai",
        content: data.data?.response || data.response,
        model: data.data?.model || data.model,
        timestamp: new Date(), // Use current time when response is received
        metricsFriendlyTimestamp: data.data?.metrics?.friendlyTimestamp,
      };

      setConversation((prev) => [...prev, aiMessage]);

      if (!isOpen || isMinimized) {
        setUnreadCount((prev) => prev + 1);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePopover = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
      setUnreadCount(0);
    } else {
      setIsOpen(false);
      setIsMinimized(false);
    }
  };

  const minimizePopover = () => {
    setIsMinimized(!isMinimized);
    if (!isMinimized) setUnreadCount(0);
  };

  const clearChat = () => {
    setConversation([]);
    setError("");
    setUnreadCount(0);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Action Button */}
      <div className="relative group">
        <Button
          onClick={togglePopover}
          size="lg"
          className="relative h-14 w-14 rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 group-hover:rotate-3 border-0"
        >
          <div className="absolute inset-0 bg-white/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Sparkles className="h-6 w-6 relative z-10" />

          {/* Unread badge */}
          {(unreadCount > 0 || (!isOpen && conversation.length > 0)) && (
            <Badge className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-red-500 hover:bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse border-0">
              {unreadCount > 0 ? unreadCount : "•"}
            </Badge>
          )}
        </Button>

        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-popover text-popover-foreground text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md border">
            Ask Trendify AI
            <div className="absolute top-full right-4 w-2 h-2 bg-popover rotate-45 border-r border-b"></div>
          </div>
        )}
      </div>

      {/* Popover Container */}
      {isOpen && (
        <Card
          ref={popoverRef}
          className={`absolute bottom-20 right-0 w-98 shadow-2xl border-0 overflow-hidden transition-all duration-300 ${
            isMinimized ? "h-16" : "h-[32rem]"
          }`}
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Header */}
          <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50 border-b border-purple-100 dark:border-purple-800">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Trendify AI</h3>
                <p className="text-xs text-muted-foreground flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Online</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={minimizePopover}
                className="h-8 w-8 p-0 hover:bg-white/70 dark:hover:bg-gray-800/70"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                <Minimize2
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    isMinimized ? "rotate-180" : ""
                  }`}
                />
              </Button>
              {conversation.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950/50 text-muted-foreground hover:text-red-600"
                  title="Clear chat"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePopover}
                className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950/50 text-muted-foreground hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Messages Area */}
          {!isMinimized && (
            <CardContent className="p-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 h-80 bg-gradient-to-b from-transparent to-purple-50/30 dark:to-purple-950/30">
                {conversation.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 rounded-full flex items-center justify-center">
                        <Sparkles className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-purple-400 rounded-full animate-ping opacity-20"></div>
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      Welcome to Trendify AI
                    </h4>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      I'm here to help with questions, creative writing,
                      analysis, and more. What would you like to explore?
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      {quickPrompts.map((qp) => (
                        <Button
                          key={qp}
                          size="sm"
                          variant="secondary"
                          className="rounded-full"
                          onClick={() => sendQuick(qp)}
                          disabled={isLoading}
                        >
                          {qp}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {conversation.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.type === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[95%] rounded-2xl p-3 shadow-sm ${
                            message.type === "user"
                              ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white ml-4"
                              : "bg-card border text-card-foreground mr-4"
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            {message.type === "ai" && (
                              <div className="w-6 h-6 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Bot className="h-3 w-3 text-purple-600" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              {message.type === "ai" && (
                                <div className="flex justify-end mb-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                    onClick={() => handleCopy(message.content, index)}
                                    title="Copy"
                                  >
                                    {copiedIndex === index ? (
                                      <Check className="h-3 w-3" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              )}

                              <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:rounded-lg prose-pre:bg-muted prose-code:before:content-[''] prose-code:after:content-['']">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    a: (props) => (
                                      <a
                                        {...props}
                                        className="text-purple-600 underline underline-offset-2"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      />
                                    ),
                                    code: ({ inline, className, children, ...props }: any) => {
                                      const code = String(children ?? "");
                                      if (inline) {
                                        return (
                                          <code className="bg-muted px-1 py-0.5 rounded" {...props}>
                                            {code}
                                          </code>
                                        );
                                      }
                                      return (
                                        <pre className="relative group">
                                          <code className={className} {...props}>
                                            {code}
                                          </code>
                                        </pre>
                                      );
                                    },
                                    ul: ({ children, ...props }) => (
                                      <ul className="list-disc pl-5 space-y-1" {...props}>
                                        {children}
                                      </ul>
                                    ),
                                    ol: ({ children, ...props }) => (
                                      <ol className="list-decimal pl-5 space-y-1" {...props}>
                                        {children}
                                      </ol>
                                    ),
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>

                              {message.type === "ai" && message.metricsFriendlyTimestamp && (
                                <p className="text-[11px] mt-1 text-muted-foreground">
                                  Using live data as of {message.metricsFriendlyTimestamp}
                                </p>
                              )}

                              <p
                                className={`text-xs mt-2 ${
                                  message.type === "user"
                                    ? "text-purple-100"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {message.timestamp.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-card border rounded-2xl p-3 shadow-sm mr-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 rounded-full flex items-center justify-center">
                              <Bot className="h-3 w-3 text-purple-600" />
                            </div>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="mx-4 mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                  <p className="text-sm text-destructive flex items-center space-x-2">
                    <span className="w-2 h-2 bg-destructive rounded-full"></span>
                    <span>{error}</span>
                  </p>
                </div>
              )}

              {/* Quick prompts row (always visible) */}
              <div className="px-4 pt-2">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {quickPrompts.map((qp) => (
                    <Button
                      key={qp}
                      size="sm"
                      variant="secondary"
                      className="rounded-full whitespace-nowrap"
                      onClick={() => sendQuick(qp)}
                      disabled={isLoading}
                    >
                      {qp}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="border-t p-4 bg-card">
                <div className="flex space-x-3">
                  <div className="flex-1 relative">
                    <Textarea
                      ref={textareaRef}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ask me anything..."
                      className="w-full p-3 pr-12 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-muted focus:bg-card text-foreground"
                      disabled={isLoading}
                      style={{ minHeight: "44px", maxHeight: "120px" }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit();
                        }
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height =
                          Math.min(target.scrollHeight, 120) + "px";
                      }}
                    />
                    <Button
                      onClick={handleSubmit}
                      disabled={isLoading || !prompt.trim()}
                      size="sm"
                      className="absolute right-2 top-2 h-8 w-8 p-0 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 transition-all hover:scale-105 border-0"
                    >
                      {isLoading ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
                  <span>Enter to send, Shift+Enter for new line</span>
                  <span className="text-purple-600 font-medium">
                    Powered by Gemini
                  </span>
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
