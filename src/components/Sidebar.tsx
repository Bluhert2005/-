import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { LayoutDashboard, BookOpen, MessageSquare, Satellite, Network, Cpu, UserCircle, ShieldAlert } from 'lucide-react';

export type TabType = 'dashboard' | 'courses' | 'ai-tutor' | 'knowledge-graph' | 'embodied-ai' | 'profile' | 'security-settings' | 'paper';

interface SidebarProps {
  currentTab: TabType;
  setTab: (tab: TabType) => void;
  onLogout: () => void;
}

export function Sidebar({ currentTab, setTab, onLogout }: SidebarProps) {
  const mainNavItems = [
    { id: 'dashboard', label: '产业全景 (Dashboard)', icon: <LayoutDashboard size={20} /> },
    { id: 'knowledge-graph', label: '知识图谱 (Registry)', icon: <Network size={20} /> },
    { id: 'courses', label: '虚拟课程 (Sim Lab)', icon: <BookOpen size={20} /> },
  ] as const;

  const aiNavItems = [
    { id: 'ai-tutor', label: '智能导师 (Terminal)', icon: <MessageSquare size={20} /> },
    { id: 'embodied-ai', label: '具身交互 (Embodied)', icon: <Cpu size={20} /> },
  ] as const;

  const userNavItems = [
    { id: 'profile', label: '个人档案 (Profile)', icon: <UserCircle size={20} /> },
    { id: 'security-settings', label: '安全设置 (Security)', icon: <ShieldAlert size={20} /> },
    { id: 'paper', label: '学术论文 (Thesis)', icon: <BookOpen size={20} /> },
  ] as const;

  const NavButton = ({ item }: { item: typeof mainNavItems[number] | typeof aiNavItems[number] | typeof userNavItems[number] }) => (
    <button
      onClick={() => setTab(item.id)}
      className={cn(
        "w-full flex items-center px-4 py-2.5 text-left transition-all duration-200 group relative",
        currentTab === item.id 
          ? "text-white" 
          : "text-slate-500 hover:text-slate-300"
      )}
    >
      {currentTab === item.id && (
        <motion.div 
          layoutId="active-tab"
          className="absolute inset-0 bg-slate-800/40 rounded-xl border-l-2 border-[#00D1FF]"
        />
      )}
      <div className={cn(
        "mr-3 transition-colors relative z-10", 
        currentTab === item.id ? "text-[#00D1FF]" : "text-slate-600 group-hover:text-slate-400"
      )}>
        {item.icon}
      </div>
      <span className="text-sm font-medium relative z-10">{item.label}</span>
    </button>
  );

  return (
    <aside className="w-64 border-r border-slate-800 flex flex-col bg-[#05070A] shrink-0">
      <div className="p-8">
        <div className="text-[#00D1FF] font-serif italic text-2xl tracking-tighter mb-1 flex items-center whitespace-nowrap">
          <Satellite className="mr-2 shrink-0" size={24} /> AeroLearn.
        </div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mt-1">未来学习中心系统</div>
      </div>
      
      <div className="flex-1 px-3 py-4 space-y-8 overflow-y-auto overflow-x-hidden scrollbar-none">
        <div>
          <div className="px-4 mb-3 text-[9px] uppercase tracking-[0.3em] text-slate-600 font-bold">核心运行业务</div>
          <div className="space-y-1">
            {mainNavItems.map(item => <NavButton key={item.id} item={item} />)}
          </div>
        </div>

        <div>
          <div className="px-4 mb-3 text-[9px] uppercase tracking-[0.3em] text-slate-600 font-bold">前沿 AI 实验</div>
          <div className="space-y-1">
            {aiNavItems.map(item => <NavButton key={item.id} item={item} />)}
          </div>
        </div>

        <div>
          <div className="px-4 mb-3 text-[9px] uppercase tracking-[0.3em] text-slate-600 font-bold">用户管控中心</div>
          <div className="space-y-1">
            {userNavItems.map(item => <NavButton key={item.id} item={item} />)}
          </div>
        </div>
      </div>

      <div className="p-6">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center px-4 py-2.5 mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white border border-slate-800 hover:border-slate-600 rounded-xl transition-all active:scale-95"
        >
          断开卫星链路
        </button>
        <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 shadow-inner">
          <div className="text-[10px] uppercase text-slate-500 mb-2 tracking-widest font-bold">系统运行状态</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
            <div className="text-xs text-slate-300">GZ-7 云端节点在线</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
