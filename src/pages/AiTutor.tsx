import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Bot, User, Loader2, Sparkles, Orbit } from 'lucide-react';
import { askAiTutor } from '../lib/gemini';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export function AiTutor() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: '准航官，你好！我是 Aero-Guide (云端启航者)，你的 **低空经济(Low-Altitude Economy)** 专属虚拟导师。\n\n关于 eVTOL 设计、飞行器法规、UTM 或者是无人机商业应用，你有什么想了解的吗？'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await askAiTutor(userMsg, messages);
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: '> 警告：信号受电磁干扰，连接台网失败。请复位重试。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col no-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex border-b border-slate-800 pb-4 mb-4 shrink-0 justify-between items-center">
        <div className="flex flex-col">
          <div className="text-[#C2A34F] font-serif italic mb-2 tracking-widest text-xs uppercase">Learning Terminal / 学习终端</div>
          <h1 className="text-3xl font-medium text-white tracking-wide flex items-center">
            虚拟导师联络舱
          </h1>
          <p className="text-slate-400 mt-2 text-sm">与 Aero-Guide 探讨未来适航标准、城市空中交通等议题。</p>
        </div>
        <div className="bg-[#00D1FF]/10 border border-[#00D1FF]/20 text-[#00D1FF] px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest flex items-center font-bold">
          <Sparkles size={14} className="mr-2" />
          由 Gemini 模型驱动
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 space-y-6" ref={scrollRef}>
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}
          >
            <div className={cn("flex max-w-[80%]", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg border",
                msg.role === 'user' 
                  ? "bg-slate-800 text-white ml-4 border-slate-700" 
                  : "bg-[#00D1FF]/10 text-[#00D1FF] mr-4 border-[#00D1FF]/20"
              )}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              
              <div className={cn(
                "px-5 py-4 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-[#00D1FF]/20 text-white rounded-tr-none border border-[#00D1FF]/30" 
                  : "bg-slate-900/40 text-slate-200 rounded-tl-none border border-slate-800"
              )}>
                {msg.role === 'model' ? (
                  <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800 prose-a:text-[#00D1FF] max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full justify-start">
            <div className="flex">
              <div className="w-10 h-10 rounded-full bg-[#00D1FF]/10 text-[#00D1FF] mr-4 border border-[#00D1FF]/20 flex items-center justify-center shrink-0">
                 <Bot size={20} />
              </div>
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl rounded-tl-none px-5 py-4 flex items-center text-[#00D1FF]">
                <Loader2 className="animate-spin mr-2" size={18} />
                <span className="text-[10px] tracking-widest uppercase font-bold">计算航迹中...</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Suggested Quick Questions */}
      <div className="mt-4 shrink-0 flex flex-col space-y-2">
        <span className="text-[10px] uppercase text-slate-500 tracking-widest font-bold">推荐学术与政策议题快捷联络：</span>
        <div className="flex flex-wrap gap-2">
          {[
            "什么是通感一体（5G-A）与低空智网？",
            "eVTOL 安全适航审定标准是什么？",
            "中国 2030 年低空经济预计市场规模是多少？",
            "低空 G 类与 W 类管制空域有何区别？"
          ].map((q) => (
            <button
              key={q}
              type="button"
              disabled={isLoading}
              onClick={async () => {
                if (isLoading) return;
                setMessages(prev => [...prev, { role: 'user', content: q }]);
                setIsLoading(true);
                try {
                  const response = await askAiTutor(q, messages);
                  setMessages(prev => [...prev, { role: 'model', content: response }]);
                } catch (error) {
                  setMessages(prev => [...prev, { role: 'model', content: '> 警告：信号受电磁干扰，连接台网失败。请复位重试。' }]);
                } finally {
                  setIsLoading(false);
                }
              }}
              className="px-3 py-1.5 bg-slate-900/60 hover:bg-[#00D1FF]/10 text-slate-300 hover:text-[#00D1FF] border border-slate-850 hover:border-[#00D1FF]/30 rounded-lg text-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 shrink-0 border-t border-slate-800/50">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="输入指令或提问，例如 '请解释什么是 eVTOL？'"
            className="w-full bg-slate-900/40 border border-slate-800 rounded-xl px-5 py-4 pr-14 text-white placeholder-slate-500 focus:outline-none focus:border-[#00D1FF]/50 focus:ring-1 focus:ring-[#00D1FF]/50 transition-all text-sm disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="absolute right-3 p-2 text-slate-400 hover:text-[#00D1FF] hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
