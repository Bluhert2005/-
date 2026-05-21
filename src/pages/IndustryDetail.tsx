import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Target, TrendingUp, ShieldCheck, Globe, Activity, FileText, Database } from 'lucide-react';

interface DetailPageProps {
  onBack: () => void;
  title: string;
  category: string;
}

export function IndustryDetail({ onBack, title, category }: DetailPageProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <button 
        onClick={onBack}
        className="flex items-center text-slate-400 hover:text-[#00D1FF] transition-colors group mb-4"
      >
        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        返回监控台
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div>
          <div className="text-[#C2A34F] font-serif italic mb-2 tracking-widest uppercase text-xs">{category} / 深度穿透</div>
          <h1 className="text-4xl font-medium text-white tracking-tight">{title}</h1>
        </div>
        <div className="flex gap-3">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl flex items-center">
            <Activity size={16} className="text-emerald-500 mr-2" />
            <span className="text-xs text-slate-300">指标状态: 优</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
            <h2 className="text-xl font-serif text-white mb-6 flex items-center">
              <FileText size={20} className="mr-3 text-[#00D1FF]" />
              战略综述
            </h2>
            <div className="text-slate-300 leading-relaxed space-y-4">
              <p>随着低空智联网与飞行控制技术的成熟，该领域已成为国家战略性新兴产业的核心增长引擎。作为“新质生产力”的典型代表，城市空中交通（UAM）和无人机物流配送正在从试点走向大规模商用。</p>
              <p>目前，技术突破主要集中在 5G-A 关键节点的通感一体化布局。依托强大的计算能力，单节点感知半径已突破 5 公里，能够实现米级精度的实时位置回传与碰撞规避。</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-slate-100 font-bold mb-4 flex items-center text-sm uppercase tracking-widest">
                <Globe size={16} className="mr-2 text-blue-500" /> 全球对标
              </h3>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="flex justify-between border-b border-slate-800 pb-2"><span>亚太地区 (APAC)</span> <span className="text-white">+24.5%</span></li>
                <li className="flex justify-between border-b border-slate-800 pb-2"><span>北美地区 (NA)</span> <span className="text-white">+18.2%</span></li>
                <li className="flex justify-between"><span>欧洲地区 (EU)</span> <span className="text-white">+12.8%</span></li>
              </ul>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-slate-100 font-bold mb-4 flex items-center text-sm uppercase tracking-widest">
                <ShieldCheck size={16} className="mr-2 text-emerald-500" /> 合规进度
              </h3>
              <div className="space-y-4 pt-2">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>适航认证 (TC)</span>
                  <span>85%</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[85%]"></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>运行安全 (SORA)</span>
                  <span>92%</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[92%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600/20 to-transparent border border-blue-500/20 rounded-3xl p-8">
            <Database size={32} className="text-[#00D1FF] mb-6" />
            <h3 className="text-white text-lg font-serif mb-2">数据来源与同步</h3>
            <p className="text-xs text-slate-400 leading-loose">当前数据已对接国家民航局 (CAAC) 低空运行数据中台，支持每日 24:00 准时同步最新适航指标与市场份额统计。</p>
            <button className="mt-8 w-full py-3 bg-[#00D1FF] text-[#05070A] rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,209,255,0.4)] transition-all">
              获取完整分析报告
            </button>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-slate-500 text-[10px] uppercase tracking-widest mb-4 font-bold border-b border-slate-800 pb-2">关联专家</h3>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700"></div>
              <div>
                <p className="text-sm text-white font-medium">张建国 教授</p>
                <p className="text-[10px] text-slate-500">低空智联首席技术顾问</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
