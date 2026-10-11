import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  RotateCcw, 
  Key, 
  X, 
  Loader2,
  Sparkles
} from 'lucide-react';

/**
 * DeluluChat Component - "Delulu" The AI Guide
 * 
 * Features:
 * - 8-Bit Pixel Traveler Avatar (🧑‍🚀 🎒)
 *   * Slow CSS bounce when idle (isLoading === false)
 *   * Rapid CSS pulse/wiggle when talking/thinking (isLoading === true)
 * - Gemini REST API (gemini-1.5-flash with fallback)
 * - Payload: { contents: [{ role: "user", parts: [{ text: userMessage }] }] }
 * - Robust try/catch/finally with fallback response so it NEVER hangs
 */
export default function DeluluChat() {
  const [messages, setMessages] = useState([
    {
      id: 'init-msg',
      role: 'assistant',
      content: "Hey wanderer! 🎒✨ I'm Delulu, your 8-bit quirky travel guide! Ask me anything about secret food spots, cultural etiquette, or packing. Where are we wandering today?! ✈️🌍",
      timestamp: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gsg_gemini_key') || '';
  });
  const [showKeyModal, setShowKeyModal] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "🍜 Best tucked-away ramen?",
    "⛩️ Hidden shrines with zero crowds?",
    "🎒 Top 3 day-trip packing essentials?",
    "💬 Must-know polite phrase in Japanese?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (suggestedText) => {
    const textToSend = suggestedText || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!suggestedText) setInputText('');
    setIsLoading(true);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // EXTREME SPEED OPTIMIZATION: Exact system prompt and maxOutputTokens: 60
    const systemPrompt = "You are a travel assistant. Reply in exactly ONE short sentence. NEVER generate lists. Be instant.";
    const userPromptText = `[System: ${systemPrompt}]\n\n${textToSend.trim()}`;

    // Payload strictly using gemini-1.5-flash constraints
    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPromptText }]
        }
      ],
      generationConfig: {
        maxOutputTokens: 60
      }
    };

    try {
      if (!apiKey || apiKey === 'PLACE_KEY_HERE') {
        throw new Error('API key not configured. Set VITE_GEMINI_API_KEY in .env');
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        let errorDetails = `HTTP ${response.status}`;
        try {
          const errData = await response.json();
          if (errData?.error?.message) {
            errorDetails = `${errData.error.message} (HTTP ${response.status})`;
          }
        } catch {
          // ignore json parse error
        }
        throw new Error(errorDetails);
      }

      const data = await response.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!reply) {
        throw new Error("No response candidate returned");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `delulu-${Date.now()}`,
          role: 'assistant',
          content: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (error) {
      console.warn('Delulu Gemini API warning/error:', error);
      // REVEAL REAL ERROR ON SCREEN
      setMessages((prev) => [
        ...prev,
        {
          id: `delulu-${Date.now()}`,
          role: 'assistant',
          content: `API ERROR: ${error.message || error.toString()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false); // ALWAYS reset loading state
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: "Clean slate! Where are we wandering today?! 🗺️✨",
        timestamp: 'Just now'
      }
    ]);
  };

  return (
    <div className="flex flex-col h-full min-h-[520px] bg-slate-50 relative select-none rounded-3xl overflow-hidden border border-sky-100 shadow-sm animate-in fade-in">
      {/* Top Chat Bar with 8-Bit Pixel Traveler Avatar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-sky-100 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* TASK 1: 8-BIT STYLE PIXEL TRAVELER AVATAR */}
          <div className="relative">
            <div 
              className={`w-11 h-11 rounded-2xl bg-amber-100 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center transition-all ${
                isLoading 
                  ? 'animate-pixel-wiggle scale-105 ring-2 ring-sky-400' 
                  : 'animate-pixel-bounce'
              }`}
            >
              <span className="text-2xl select-none" role="img" aria-label="pixel-traveler">
                🧑‍🚀
              </span>
            </div>
            {/* Small 8-bit backpack badge */}
            <span className="absolute -bottom-1 -right-1 text-xs select-none">
              🎒
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-black text-slate-900 font-mono tracking-tight">Delulu 8-Bit</h2>
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                isLoading ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isLoading ? 'THINKING...' : 'ONLINE'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              {isLoading ? 'Consulting cosmic travel guides...' : 'Your quirky 8-bit companion'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowKeyModal(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition cursor-pointer"
            title="Configure Gemini API Key"
          >
            <Key className="w-4 h-4" />
          </button>
          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Reset Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Key Modal Drawer */}
      {showKeyModal && (
        <div className="p-3 bg-white border-b border-sky-100 shadow-md animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">Google Gemini API Key</span>
            <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy... / AQ..."
              className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 rounded-xl px-3 py-2 text-xs outline-none"
            />
            <button
              onClick={() => {
                localStorage.setItem('gsg_gemini_key', apiKey.trim());
                setShowKeyModal(false);
              }}
              className="px-3 py-2 bg-sky-600 text-white font-semibold rounded-xl text-xs hover:bg-sky-700 transition cursor-pointer"
            >
              Save
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Reads VITE_GEMINI_API_KEY from .env.</p>
        </div>
      )}

      {/* Message History Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-[280px]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-amber-100 border border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center text-xs shrink-0 select-none mb-1">
                  🧑‍🚀
                </div>
              )}

              <div
                className={`max-w-[82%] px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-br-xs shadow-md shadow-sky-500/15'
                    : 'bg-white text-slate-800 rounded-bl-xs shadow-sm border border-slate-100'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                <div
                  className={`text-[9px] mt-1 text-right font-medium ${
                    isUser ? 'text-sky-100' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* LOADING STATE INDICATOR */}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs pl-1 animate-pulse">
            <div className="w-7 h-7 rounded-lg bg-amber-100 border border-slate-900 flex items-center justify-center text-xs animate-spin">
              💫
            </div>
            <div className="bg-white text-slate-600 rounded-2xl rounded-bl-xs px-3.5 py-2 shadow-sm border border-slate-100 font-medium flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin text-sky-600" />
              <span>Delulu is typing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-hide shrink-0">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] whitespace-nowrap bg-white hover:bg-sky-50 hover:text-sky-700 text-slate-600 border border-slate-200/80 px-2.5 py-1 rounded-full font-medium transition shadow-2xs shrink-0 active:scale-95 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 bg-white border-t border-slate-200/80 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Delulu anything about your journey..."
            className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-100 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="w-11 h-11 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white rounded-2xl flex items-center justify-center shadow-md shadow-sky-600/20 disabled:opacity-40 transition shrink-0 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>

      {/* Custom 8-bit CSS animations */}
      <style>{`
        @keyframes pixelBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes pixelWiggle {
          0%, 100% { transform: rotate(-5deg) scale(1.05); }
          50% { transform: rotate(5deg) scale(1.07); }
        }
        .animate-pixel-bounce {
          animation: pixelBounce 2s ease-in-out infinite;
        }
        .animate-pixel-wiggle {
          animation: pixelWiggle 0.22s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
