'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { processOfficerQuery, ChatMessage } from '../lib/chatbot-engine';
import { getCurrentSession } from '../lib/auth';
import {
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  Bot,
  User,
  ArrowRight,
  HelpCircle,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';

function renderFormattedLine(line: string) {
  // If line contains markdown bold **text**, cleanly render as styled strong tag without asterisks
  const parts = line.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const cleanText = part.slice(2, -2);
          return (
            <strong key={pIdx} className="font-bold text-slate-900 dark:text-white">
              {cleanText}
            </strong>
          );
        }
        return <span key={pIdx}>{part}</span>;
      })}
    </>
  );
}

export function AiOfficerChatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Extract application ID if currently viewing an application detail page
  const appDetailMatch = pathname.match(/\/applications\/([a-zA-Z0-9_-]+)/);
  const currentAppId = appDetailMatch ? appDetailMatch[1] : undefined;

  // Initialize with officer greeting
  useEffect(() => {
    const session = getCurrentSession();
    const officerName = session ? session.officer.name : 'அலுவலரே';

    const welcomeMsg: ChatMessage = {
      id: 'msg-welcome',
      sender: 'ai',
      text: `வணக்கம் ${officerName}! நான் உங்கள் RTO AI உதவியாளர்.\n\nஅலுவலகத்தின் விண்ணப்ப நிலவரங்கள், நிலுவைகள் மற்றும் விடுபட்ட ஆவணங்களை உடனுக்குடன் சுருக்கி வழங்க நான் தயார். உங்களுக்கு என்ன தகவல் தேவை?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([welcomeMsg]);
  }, [pathname]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = processOfficerQuery(query, currentAppId);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionLinks: response.actionLinks,
        highlightItems: response.highlights,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 350);
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Trigger Button (Matches the uploaded "Ai" design) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          title="RTO AI உதவியாளருடன் உரையாட (Open AI Assistant)"
          className="relative group w-14 h-14 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-700/90 shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-emerald-500/20 hover:ring-emerald-500/50"
        >
          {/* Serif "Ai" typography matching user's image */}
          <span className="font-serif text-2xl font-bold text-white tracking-tight select-none">
            Ai
          </span>

          {/* Green Sparkle Star positioned at top-right */}
          <span className="absolute -top-1.5 -right-1.5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse">
            <svg
              width="20"
              height="20"
              className="w-5 h-5 fill-current"
              style={{ width: 20, height: 20 }}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
            </svg>
          </span>

          {/* Tooltip on hover */}
          <span className="absolute right-16 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700">
            RTO AI உதவியாளர் (Data Summary)
          </span>
        </button>
      )}

      {/* Expanded Chatbot Modal / Drawer */}
      {isOpen && (
        <div
          className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col overflow-hidden ${
            isMinimized
              ? 'w-80 h-14'
              : 'w-[92vw] sm:w-[420px] md:w-[460px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Chat Window Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 select-none">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-serif font-bold text-sm text-white">
                Ai
                <span className="absolute -top-1 -right-1 text-emerald-400">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
                  </svg>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-white">
                    RTO AI உதவியாளர்
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-300">
                  அலுவலக தரவு சுருக்கம் & விதிமுறை வழிகாட்டி
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'பெரிதாக்கு' : 'சிறிதாக்கு'}
                className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="மூடு"
                className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* When not minimized: Chat Body */}
          {!isMinimized && (
            <>
              {/* Context Banner: If inside an application detail view */}
              {currentAppId && (
                <div className="bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-2 border-b border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-indigo-900 dark:text-indigo-200 font-medium truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <span className="truncate">செயலில் உள்ள விண்ணப்பம்: <strong className="font-mono">{currentAppId}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickPrompt('இந்த விண்ணப்பத்தை சுருக்கிக் கூறு')}
                    className="shrink-0 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 hover:underline cursor-pointer"
                  >
                    சுருக்கம் ⚡
                  </button>
                </div>
              )}

              {/* Message Timeline */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-slate-50 dark:bg-slate-950/40">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="w-6 h-6 rounded-lg bg-slate-900 text-white font-serif font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        Ai
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs space-y-2 ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                      }`}
                    >
                      {/* Render text with clean readable format (No raw markdown stars) */}
                      <div className="leading-relaxed space-y-1">
                        {msg.text.split('\n').map((line, lIdx) => {
                          if (!line.trim()) {
                            return <div key={lIdx} className="h-1.5" />;
                          }
                          const isBullet = line.startsWith('• ');
                          const isNumbered = /^\d+\.\s/.test(line);

                          return (
                            <p
                              key={lIdx}
                              className={`${
                                isBullet
                                  ? 'pl-2 text-slate-700 dark:text-slate-200'
                                  : isNumbered
                                  ? 'font-bold text-slate-900 dark:text-white pt-1'
                                  : line.endsWith(':')
                                  ? 'font-bold text-slate-900 dark:text-white pb-0.5'
                                  : ''
                              }`}
                            >
                              {renderFormattedLine(line)}
                            </p>
                          );
                        })}
                      </div>

                      {/* Action Links if returned */}
                      {msg.actionLinks && msg.actionLinks.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-1.5">
                          {msg.actionLinks.map((link, lIdx) => (
                            <Link
                              key={lIdx}
                              href={link.href}
                              onClick={() => setIsOpen(false)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                            >
                              <span>{link.label}</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          ))}
                        </div>
                      )}

                      <span
                        className={`block text-[9px] text-right mt-1 opacity-70 ${
                          msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-500'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-slate-500 text-xs pl-8">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span>AI தரவுகளை ஆய்வு செய்கிறது...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Pills (Flex-wrap to eliminate horizontal scrollbars) */}
              <div className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleQuickPrompt('இன்றைய அலுவலக சுருக்கம் கூறு')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  📊 பணிச்சுமை சுருக்கம்
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPrompt('உடனடி கவனம் தேவைப்படும் விண்ணப்பங்கள் எவை?')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  🚨 உடனடி கவனம்
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPrompt('விடுபட்ட மருத்துவ சான்றிதழ் உள்ளவை')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 hover:text-amber-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  📑 விடுபட்ட ஆவணங்கள்
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPrompt('கோவை மாவட்ட விண்ணப்பங்கள் நிலை என்ன?')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  🏛️ கோவை RTO
                </button>
              </div>

              {/* Chat Input Field */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="அலுவலக நிலவரம் அல்லது விண்ணப்பம் பற்றி கேட்கவும்..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-colors cursor-pointer"
                  title="அனுப்புக"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
