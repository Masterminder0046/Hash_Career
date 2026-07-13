import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { chatbotApi } from '../../services/api';
import { MessageSquare, Send, Bot, User, Mic, MicOff, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

const quickReplies = [
  'How can I improve my resume?',
  'Tips for interview preparation',
  'Which companies are hiring?',
  'What skills should I learn?',
  'Create a study roadmap for me',
  'How to prepare for technical interviews?',
];

export default function CareerChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Hi! I\'m your AI career advisor. Ask me anything about placements, interviews, companies, or career advice!' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onresult = (event: any) => { setInput(event.results[0][0].transcript); setListening(false); };
      recognition.onerror = () => setListening(false);
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
      recognition.start();
      setListening(true);
    }
  };

  const stopListening = () => { recognitionRef.current?.stop(); setListening(false); };

  const handleSend = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const res = await chatbotApi.chat(msg);
      if (res.data.success) {
        setMessages((prev) => [...prev, { role: 'bot', text: res.data.data.message }]);
      }
    } catch { } finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Career Chatbot</h1>
          <p className="text-slate-400 mt-1">Ask anything about placements and career</p>
        </div>
      </div>

      <div className="flex-1 glass-card flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
              {m.role === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <p className="text-sm whitespace-pre-wrap">{m.text}</p>
              </div>
              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className="px-6 pb-4">
            <p className="text-xs text-slate-400 mb-2">Quick Questions</p>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((qr) => (
                <button key={qr} onClick={() => handleSend(qr)} className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-500 hover:text-indigo-600 rounded-full transition-colors">{qr}</button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex gap-3">
            <button onClick={listening ? stopListening : startListening} className={`p-3 rounded-xl transition-colors ${listening ? 'bg-red-100 dark:bg-red-900/20 text-red-500' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200'}`}>
              {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="input-field flex-1" placeholder="Ask anything about placements..." />
            <button onClick={() => handleSend()} disabled={!input.trim() || loading} className="btn-primary p-3">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
