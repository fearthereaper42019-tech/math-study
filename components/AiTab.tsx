import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

export const AiTab: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hello! I am Eternity AI. How can I help you with your school work today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Always use process.env.API_KEY directly as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: "You are Eternity AI, a helpful, concise assistant for a student using a web proxy. Help them with homework, research, or simple questions. Keep it simple and friendly."
        }
      });

      const aiText = response.text || "I'm sorry, I couldn't process that.";
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Error: Could not connect to the AI brain. Make sure you have an API key configured." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto px-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 scrollbar-hide" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-6 py-3 backdrop-blur-md ${
              m.role === 'user' ? 'bg-white/20 border border-white/20' : 'bg-black/40 border border-white/10'
            }`}>
              <p className="text-sm font-bold mb-1 opacity-50 uppercase tracking-tighter">
                {m.role === 'user' ? 'You' : 'Eternity AI'}
              </p>
              <p className="whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-black/40 border border-white/10 rounded-2xl px-6 py-3 backdrop-blur-md italic animate-pulse">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="pb-8">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="w-full bg-black/40 backdrop-blur-md border border-white/20 rounded-full py-4 px-6 outline-none focus:ring-2 focus:ring-white/30 transition-all"
          />
          <button
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 bg-white text-black px-6 rounded-full font-bold hover:bg-white/80 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};