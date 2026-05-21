import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Briefcase, GraduationCap, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

export type UserRole = 'student' | 'professional' | 'researcher' | 'admin';

interface RoleSelectionProps {
  onSelect: (role: UserRole) => void;
}

const roles = [
  {
    id: 'student' as UserRole,
    title: '在校学生',
    enTitle: 'Student',
    description: '获取学术课程、职业规划建议及无人机虚拟仿真实验室权限。',
    icon: <GraduationCap size={44} />,
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    capabilities: ['核心课程库', '虚拟仿真室', 'AI 导师对话']
  },
  {
    id: 'professional' as UserRole,
    title: '行业从业者',
    enTitle: 'Professional',
    description: '专注于产业看板、实战案例分析及持证上岗培训路径。',
    icon: <Briefcase size={44} />,
    color: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    capabilities: ['产业看板', '技术文档', '就业对接']
  },
  {
    id: 'researcher' as UserRole,
    title: '政策研究者',
    enTitle: 'Researcher',
    description: '访问法律法规知识图谱、政策趋势分析及多维度行业研究报告。',
    icon: <BookOpen size={44} />,
    color: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400',
    capabilities: ['法律知识库', '政策看板', '学术论文查阅']
  },
  {
    id: 'admin' as UserRole,
    title: '企业培训管理',
    enTitle: 'Enterprise Admin',
    description: '统筹下属成员权限分配、批量管理课程订单及教学进度监控。',
    icon: <ShieldCheck size={44} />,
    color: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
    capabilities: ['成员权限管控', '课程分发', '学习进度汇总']
  }
];

export function RoleSelection({ onSelect }: RoleSelectionProps) {
  const [selected, setSelected] = React.useState<UserRole | null>(null);

  return (
    <div className="min-h-screen bg-[#05070A] flex items-center justify-center p-6 sm:p-10">
      <div className="max-w-6xl w-full">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-[#00D1FF] font-serif italic mb-4 tracking-widest text-xs uppercase">Welcome to AeroLearn / 角色定义</div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              定义您的<span className="text-[#00D1FF]">空域身份</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              系统将根据您的角色配置特定的权限权限组（RBAC）与界面模块，确保您获得最精确的低空经济学习体验。
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, i) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              onClick={() => setSelected(role.id)}
              className={cn(
                "group cursor-pointer relative rounded-3xl p-6 border transition-all duration-300 flex flex-col h-full",
                selected === role.id 
                  ? cn("bg-gradient-to-b border-white ring-2 ring-white/20", role.color) 
                  : "bg-slate-900/30 border-slate-800 hover:border-slate-600 hover:bg-slate-900/50"
              )}
            >
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                selected === role.id ? "bg-white text-black" : role.textColor
              )}>
                {role.icon}
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white">{role.title}</h3>
                  {selected === role.id && (
                    <motion.div 
                      layoutId="check-badge"
                      className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white"
                    >
                      <ShieldCheck size={12} />
                    </motion.div>
                  )}
                </div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">{role.enTitle}</p>
                <p className="text-sm text-slate-400 leading-relaxed min-h-[3rem]">
                  {role.description}
                </p>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-800/50 space-y-2">
                <p className="text-[9px] uppercase tracking-widest text-slate-600 font-black mb-2">开放功能预览</p>
                {role.capabilities.map((cap, i) => (
                  <div key={i} className="flex items-center text-xs text-slate-400 group-hover:text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mr-2 group-hover:bg-[#00D1FF]" />
                    {cap}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-16 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: selected ? 1 : 0 }}
        >
          <button
            disabled={!selected}
            onClick={() => selected && onSelect(selected)}
            className="group px-10 py-4 bg-white text-black font-bold uppercase tracking-widest rounded-2xl flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            确认并初始化系统环境
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
