import { useState, useRef, useEffect } from "react";
import { Bot, User, Send, Loader2, X, RotateCcw, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

const SYSTEM_PROMPT = `You are an expert Victoria Legal Aid (VLA) criminal law advisor assisting staff at the Law and Advocacy Centre for Women (LACW) in Melbourne, Australia.

You specialise in VLA criminal law grants, guidelines, and costs payable. Your primary focus is:
- Criminal law grants (summary, indictable, committal, appeals, Children's Court)
- VLA Simplified Grants Process (SGP) and fixed fee schedules
- Means and merits test requirements for criminal matters
- Special circumstances provisions (family violence, mental health, intellectual disability, youth)
- Costs payable under the VLA criminal law fee schedule
- When grants require prior approval vs can be claimed at completion

Be concise and practical. Staff are experienced legal professionals. Always note if something requires VLA officer discretion or if you recommend checking the current VLA Handbook/fee schedule for exact figures.`;

const INITIAL_MESSAGE = {
  role: "assistant",
  content: "Hi! I'm your VLA criminal law AI advisor. Ask me anything about grants, guidelines, costs payable, or complex situations not covered by the decision tool. I can also help with non-criminal VLA matters."
};

export default function AidChatBubble() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const conversationForLLM = newMessages
      .map(m => `${m.role === "user" ? "Staff" : "Advisor"}: ${m.content}`)
      .join("\n\n");

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_PROMPT}\n\nConversation:\n${conversationForLLM}\n\nAdvisor:`,
      model: "claude_sonnet_4_6"
    });

    setMessages(prev => [...prev, { role: "assistant", content: response }]);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const reset = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-96 h-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-purple-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-white" />
              <span className="text-white font-semibold text-sm">AI Advisor</span>
              <span className="text-purple-200 text-xs">— ask anything</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={reset} title="New chat" className="text-purple-200 hover:text-white transition-colors">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setOpen(false)} className="text-purple-200 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3 h-3 text-purple-600" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white rounded-br-sm"
                    : "bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-sm"
                }`}>
                  {msg.role === "assistant" ? (
                    <ReactMarkdown
                      className="prose prose-xs max-w-none prose-p:my-0.5 prose-ul:my-0.5 prose-li:my-0 prose-headings:text-sm prose-strong:text-slate-800"
                      components={{
                        a: ({ children, href }) => (
                          <a href={href} target="_blank" rel="noreferrer" className="text-purple-600 underline">{children}</a>
                        )
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3 h-3 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-purple-600" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl rounded-bl-sm px-3 py-2">
                  <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 px-3 py-2 flex gap-2 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about grants, costs, guidelines..."
              rows={2}
              className="flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="h-9 w-9 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-40 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Bubble toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        title="AI Advisor"
      >
        {open ? <X className="w-5 h-5 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>
    </div>
  );
}