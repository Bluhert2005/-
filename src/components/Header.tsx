import React from 'react';
import { Bell, Search, Hexagon } from 'lucide-react';
import { toast } from 'sonner';

export function Header() {
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      toast('正在启动全球检索', {
        description: `正在从远程 UTM 服务器查询 "${e.currentTarget.value}" 相关数据...`
      });
      e.currentTarget.value = '';
    }
  };

  const handleNotifications = () => {
    toast('系统通知日志', {
      description: '您有 3 条新的空域安全警报。'
    });
  };

  const handleProfile = () => {
    toast.error('访问受限', {
      description: '访客飞行员权限不足以修改配置文件。'
    });
  };

  return (
    <header className="h-20 border-b border-slate-800 flex items-center justify-between px-10 sticky top-0 z-10 shrink-0 bg-[#05070A]/90 backdrop-blur-md">
      <div className="flex flex-col">
        <h1 className="text-xl font-serif text-white tracking-wide">飞行任务指挥仪表台</h1>
        <p className="text-xs text-slate-500 uppercase tracking-tighter">飞行员 ID: FH-4902-AL</p>
      </div>

      <div className="flex items-center space-x-6">
        <div className="hidden sm:flex items-center text-slate-400 bg-slate-900 border border-slate-800 rounded-full px-4 py-1.5 w-64 focus-within:border-[#00D1FF]/50 focus-within:text-[#00D1FF] transition-colors relative mr-2">
          <Search size={16} className="mr-2 opacity-50" />
          <input 
            type="text" 
            onKeyDown={handleSearch}
            placeholder="检索空域知识库..." 
            className="bg-transparent border-none outline-none text-sm w-full placeholder-slate-600 text-slate-200"
          />
        </div>
        <button onClick={handleNotifications} className="text-slate-400 hover:text-[#00D1FF] transition-colors relative cursor-pointer group">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#00D1FF] rounded-full shadow-[0_0_5px_rgba(0,209,255,0.8)] animate-pulse"></span>
        </button>
        <div className="flex items-center gap-6 pl-6 border-l border-slate-800">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest hidden sm:block">空域天气站</div>
            <div className="text-xs text-slate-200 uppercase">晴朗 / 24°C</div>
          </div>
          <button onClick={handleProfile} className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#00D1FF] to-blue-600 border-2 border-slate-900 shadow-xl shadow-blue-500/20 flex items-center justify-center text-[#05070A] hover:scale-105 transition-transform cursor-pointer">
            <Hexagon size={18} fill="currentColor" className="text-[#05070A] opacity-80" />
          </button>
        </div>
      </div>
    </header>
  );
}
