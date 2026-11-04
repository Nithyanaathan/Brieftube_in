import React, { useState } from 'react';
import { Send, HelpCircle, Sparkles, MessageSquare, ChevronDown, ChevronUp, Bot, User } from 'lucide-react';
import { ClarificationMessage, VideoSummaryResult } from '../types/index.ts';
import { fetchClarification } from '../services/api.ts';

interface InteractiveClarifierProps {
  videoTitle: string;
  transcript: string;
  currentSummary: VideoSummaryResult | null;
  focusedSegmentTitle?: string;
  onClearFocus: () => void;
}

export const InteractiveClarifier: React.FC<InteractiveClarifierProps> = ({
  videoTitle,
  transcript,
  currentSummary,
  focusedSegmentTitle,
  onClearFocus,
}) => {
  const [messages, setMessages] = useState<ClarificationMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Have questions about any bullet point, timestamp, or concept in this video? Ask me below and I will clarify it in simple, intuitive terms.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-expand and focus input when segment is selected for clarification
  React.useEffect(() => {
    if (focusedSegmentTitle) {
      setIsExpanded(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [focusedSegmentTitle]);

  const quickPrompts = [
    'Explain the core takeaway with an everyday analogy',
    'What was the most surprising point made?',
    'What are the common beginner mistakes mentioned?',
  ];

  const handleSend = async (questionText?: string) => {
    const q = (questionText || inputQuestion).trim();
    if (!q || isAsking) return;

    const userMsg: ClarificationMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: focusedSegmentTitle ? `[About ${focusedSegmentTitle}]: ${q}` : q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsAsking(true);

    try {
      const answer = await fetchClarification({
        videoTitle,
        question: q,
        transcript,
        currentSummary,
        segmentTitle: focusedSegmentTitle,
      });

      const aiMsg: ClarificationMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ClarificationMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I could not clarify that right now: ${err.message || 'Unknown error'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-left cursor-pointer hover:bg-slate-100/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-red-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Interactive Clarifier · Ask AI
          </h3>
          {focusedSegmentTitle && (
            <span className="text-[11px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-medium truncate max-w-[200px]">
              Focused: {focusedSegmentTitle}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {/* Collapsible Body */}
      {isExpanded && (
        <div className="p-4 flex flex-col gap-3">
          {/* Focused Segment Banner */}
          {focusedSegmentTitle && (
            <div className="flex items-center justify-between p-2 bg-red-50/70 border border-red-100 rounded-lg text-xs text-red-800">
              <span>Clarifying segment: <strong>{focusedSegmentTitle}</strong></span>
              <button
                onClick={onClearFocus}
                className="text-[11px] text-red-600 hover:underline font-medium cursor-pointer"
              >
                Clear Focus
              </button>
            </div>
          )}

          {/* Quick Prompts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                disabled={isAsking}
                className="px-2.5 py-1 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white text-slate-600 text-[11px] whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div className="max-h-60 overflow-y-auto space-y-3 pr-1 text-xs">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2 ${
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white ${
                      isUser ? 'bg-slate-800' : 'bg-red-600'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-xl p-3 leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    <p>{m.content}</p>
                    <span
                      className={`block text-[10px] mt-1 ${
                        isUser ? 'text-slate-400 text-right' : 'text-slate-400'
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
            {isAsking && (
              <div className="flex items-center gap-2 text-xs text-slate-500 italic pl-8">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-red-500" />
                <span>Formulating clear explanation...</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 pt-2 border-t border-slate-100"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask for clarification or simpler explanation..."
              disabled={isAsking}
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!inputQuestion.trim() || isAsking}
              className="p-2 text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
              aria-label="Send question"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
