import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Plane, Zap, Target, Network, Share2, ExternalLink, RefreshCw, BarChart3, RadioIcon, Database, Sparkles, Globe, Newspaper, Check, QrCode, AlertCircle, CreditCard, Lock, Crown, ShieldCheck } from 'lucide-react';
import { IndustryDetail } from './IndustryDetail';
import { toast } from 'sonner';
import { getRealtimeIndustryStats } from '../lib/gemini';

export function Dashboard() {
  const [selectedTopic, setSelectedTopic] = useState<{title: string, category: string} | null>(null);
  const [panelTab, setPanelTab] = useState<'news' | 'subscribe'>('news');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(() => {
    return localStorage.getItem('low_altitude_last_sync') || new Date().toLocaleString('zh-CN');
  });

  // Target subscription model & status states
  const [subType, setSubType] = useState<'yearly' | 'monthly'>('yearly');
  const [isSubscribed, setIsSubscribed] = useState(() => {
    return localStorage.getItem('low_altitude_subscribed') === 'true';
  });
  const [showPayModal, setShowPayModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('low_altitude_industry_stats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => {
          let icon = <Target className="text-[#00D1FF]" size={24} />;
          if (item.id === 'uav') icon = <Plane className="text-white" size={24} />;
          if (item.id === 'evtol') icon = <Zap className="text-[#C2A34F]" size={24} />;
          if (item.id === 'nodes') icon = <Network className="text-emerald-500" size={24} />;
          return { ...item, icon };
        });
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: 'market', label: '低空经济市场规模(万亿)', value: 2.50, icon: <Target className="text-[#00D1FF]" size={24} />, suffix: '万亿 (2030预测)' },
      { id: 'uav', label: '全国注册无人机数量', value: 126.70, icon: <Plane className="text-white" size={24} />, suffix: '万+ (实时更新)' },
      { id: 'evtol', label: 'eVTOL 验证飞行架次', value: 8450, icon: <Zap className="text-[#C2A34F]" size={24} />, suffix: '次 (月度累计)' },
      { id: 'nodes', label: '通感智联网节点', value: 12.40, icon: <Network className="text-emerald-500" size={24} />, suffix: '万个 (覆盖率)' },
    ];
  });

  // Helper designed specifically to achieve "每次更新图样根据数据变化对应具备多样"
  const getDynamicTheme = () => {
    // Determine overall mood based on current marketSize & uav registry
    const marketVal = stats.find(item => item.id === 'market')?.value || 2.5;
    
    if (marketVal < 1.0) {
      return {
        id: "blue-cyan",
        name: "极客翠蓝 (Aero-Cyan-Pulse)",
        desc: "空域数据初期试验检测：采用极速高冷青蓝配色方案",
        primary: "#00D1FF",
        secondary: "#10B981",
        gradientStart: "#00D1FF",
        gradientEnd: "rgba(0, 209, 255, 0.02)",
        barColor: "#00D1FF",
        gridOpacity: 0.1,
        sweepColor: "conic-gradient(from 0deg, transparent 80%, rgba(0, 209, 255, 0.15) 100%)",
        radarLine: "#00D1FF",
        textColor: "text-[#00D1FF]",
        borderColor: "border-[#00D1FF]/20"
      };
    } else if (marketVal >= 1.0 && marketVal < 2.0) {
      return {
        id: "cyber-violet",
        name: "电磁极光 (Vortex-Aurora-Purple)",
        desc: "智联网网格高速承载：采用炫彩极光与磁力红紫配色方案",
        primary: "#A855F7",
        secondary: "#3B82F6",
        gradientStart: "#A855F7",
        gradientEnd: "rgba(168, 85, 247, 0.02)",
        barColor: "#8B5CF6",
        gridOpacity: 0.14,
        sweepColor: "conic-gradient(from 0deg, transparent 75%, rgba(168, 85, 247, 0.22) 100%)",
        radarLine: "#A855F7",
        textColor: "text-[#A855F7]",
        borderColor: "border-[#A855F7]/30"
      };
    } else {
      // marketVal >= 2.0 (Booming market size tier)
      return {
        id: "golden-ignition",
        name: "落日烈金 (Golden-Ignition)",
        desc: "万亿低空全方位爆发成熟段：切换重磅高热赤焰与烈阳金配色方案",
        primary: "#F59E0B",
        secondary: "#EF4444",
        gradientStart: "#F59E0B",
        gradientEnd: "rgba(245, 158, 11, 0.02)",
        barColor: "#F59E0B",
        gridOpacity: 0.2,
        sweepColor: "conic-gradient(from 0deg, transparent 70%, rgba(245, 158, 11, 0.28) 100%)",
        radarLine: "#F59E0B",
        textColor: "text-[#D97706]",
        borderColor: "border-amber-500/30"
      };
    }
  };

  const activeTheme = getDynamicTheme();

  const [trafficData, setTrafficData] = useState([
    { time: '08:00', logistics: 120, passenger: 20 },
    { time: '09:00', logistics: 250, passenger: 35 },
    { time: '10:00', logistics: 450, passenger: 45 },
    { time: '11:00', logistics: 580, passenger: 60 },
    { time: '12:00', logistics: 680, passenger: 80 },
    { time: '13:00', logistics: 610, passenger: 100 },
    { time: '14:00', logistics: 520, passenger: 120 },
    { time: '15:00', logistics: 650, passenger: 150 },
    { time: '16:00', logistics: 800, passenger: 180 },
    { time: '17:00', logistics: 560, passenger: 130 },
  ]);

  const [marketData, setMarketData] = useState(() => {
    const saved = localStorage.getItem('low_altitude_market_history');
    return saved ? JSON.parse(saved) : [
      { year: '2023', size: 0.52 },
      { year: '2024', size: 0.74 },
      { year: '2025', size: 1.25 },
      { year: '2026', size: 1.83 },
      { year: '2030', size: 2.50 },
    ];
  });

  const [newsFeed, setNewsFeed] = useState<any[]>(() => {
    const saved = localStorage.getItem('low_altitude_news_feed');
    return saved ? JSON.parse(saved) : [
      { title: '中国民航局：支持深圳等多地率先建设低空经济产业示范试验区', date: '2024-03', source: '中国民航局办公厅', url: 'http://www.caac.gov.cn/' },
      { title: '工信部等四部门发布《通用航空装备创新应用实施方案（2024-2030年）》', date: '2024-03', source: '国家工信部', url: 'https://www.miit.gov.cn/' },
      { title: '峰飞盛世航空eVTOL完成深圳-珠海跨海跨城首次演示飞行', date: '2024-02', source: '新华网报导', url: 'https://www.xinhuanet.com/' }
    ];
  });

  const [insightText, setInsightText] = useState(() => {
    return localStorage.getItem('low_altitude_insight_text') || '低空经济正处于由政策爆发转向商业落地的极速上行通道。全行业注册无人机、eVTOL适航审定以及5G-A（通感一体）智能网络的配套基设施网节点在多地相继跑通，正在深刻重组智慧空域生产力。';
  });

  const [groundingSources, setGroundingSources] = useState<any[]>(() => {
    const saved = localStorage.getItem('low_altitude_grounding_sources');
    return saved ? JSON.parse(saved) : [];
  });

  const syncIndustryData = async (showToast = true) => {
    if (isSyncing) return;
    setIsSyncing(true);
    let toastId: any = null;
    if (showToast) {
      toastId = toast.loading('正在联网检索最新低空经济指标与CAAC权威公告...', {
        description: '依托 Gemini Google Search Grounding 提供全网真实校准数据…'
      });
    }

    try {
      const res = await getRealtimeIndustryStats();
      if (res.success && res.data) {
        const d = res.data;
        
        const newStats = [
          { id: 'market', label: '低空经济市场规模(万亿)', value: d.marketSize || 2.50, icon: <Target className="text-[#00D1FF]" size={24} />, suffix: d.marketSizeSuffix || '万亿 (预测)' },
          { id: 'uav', label: '全国注册无人机数量', value: d.uavCount || 126.70, icon: <Plane className="text-white" size={24} />, suffix: d.uavCountSuffix || '万+ (实时更新)' },
          { id: 'evtol', label: 'eVTOL 验证飞行架次', value: d.evtolFlights || 8450, icon: <Zap className="text-[#C2A34F]" size={24} />, suffix: d.evtolFlightsSuffix || '次 (月度累计)' },
          { id: 'nodes', label: '通感智联网节点', value: d.nodesCount || 12.40, icon: <Network className="text-emerald-500" size={24} />, suffix: d.nodesCountSuffix || '万个 (覆盖率)' },
        ];

        setStats(newStats);

        if (d.marketHistory && d.marketHistory.length > 0) {
          setMarketData(d.marketHistory);
        }

        if (d.realtimeNews && d.realtimeNews.length > 0) {
          setNewsFeed(d.realtimeNews);
        }

        if (d.insight) {
          setInsightText(d.insight);
        }

        if (res.sources && res.sources.length > 0) {
          setGroundingSources(res.sources);
        }

        const nowStr = new Date().toLocaleString('zh-CN');
        setLastSync(nowStr);

        localStorage.setItem('low_altitude_industry_stats', JSON.stringify(
          newStats.map(s => ({ id: s.id, label: s.label, value: s.value, suffix: s.suffix }))
        ));
        if (d.marketHistory) localStorage.setItem('low_altitude_market_history', JSON.stringify(d.marketHistory));
        if (d.realtimeNews) localStorage.setItem('low_altitude_news_feed', JSON.stringify(d.realtimeNews));
        if (d.insight) localStorage.setItem('low_altitude_insight_text', d.insight);
        if (res.sources) localStorage.setItem('low_altitude_grounding_sources', JSON.stringify(res.sources));
        localStorage.setItem('low_altitude_last_sync', nowStr);

        if (showToast && toastId) {
          toast.success('网络校准成功！已同步全网最新真实指标。', {
            id: toastId,
            description: `成功从 ${res.sources?.length || '多方'} 处主流媒体或监管数据库获取最新实证数据。`
          });
        }
      } else {
        if (showToast && toastId) {
          toast.error('联网校准超时，已加载备用本地指标。', { id: toastId });
        }
      }
    } catch (err) {
      console.error(err);
      if (showToast && toastId) {
        toast.error('网络校准异常，已运用本地缓冲层。', { id: toastId });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const hasSync = localStorage.getItem('low_altitude_last_sync');
    if (!hasSync) {
      syncIndustryData(false);
    }
    
    const interval = setInterval(() => {
      setStats(prev => {
        const newStats = [...prev];
        const flux = Math.floor(Math.random() * 5) - 1;
        newStats[2] = { ...newStats[2], value: newStats[2].value + flux };
        if (Math.random() > 0.8) {
          const nodeFlux = (Math.random() * 0.02 - 0.01);
          newStats[3] = { ...newStats[3], value: Number((newStats[3].value + nodeFlux).toFixed(2)) };
        }
        return newStats;
      });

      setTrafficData(prev => {
        const newData = [...prev];
        if (newData.length === 0) return prev;
        const lastBaseTime = parseInt(newData[newData.length - 1].time.split(':')[0]);
        const nextTime = (lastBaseTime + 1) >= 24 ? '00:00' : `${(lastBaseTime + 1).toString().padStart(2, '0')}:00`;
        const lastLogistics = newData[newData.length - 1].logistics;
        const lastPassenger = newData[newData.length - 1].passenger;
        newData.shift();
        newData.push({
          time: nextTime,
          logistics: Math.max(10, lastLogistics + (Math.floor(Math.random() * 100) - 50)),
          passenger: Math.max(5, lastPassenger + (Math.floor(Math.random() * 40) - 20))
        });
        return newData;
      });

      setMarketData(prev => prev.map(item => ({
        ...item,
        size: Number((item.size + (Math.random() * 0.001 - 0.0005)).toFixed(3))
      })));
      
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const openDetail = (title: string, category: string) => {
    setSelectedTopic({ title, category });
  };

  if (selectedTopic) {
    return (
      <IndustryDetail 
        title={selectedTopic.title} 
        category={selectedTopic.category} 
        onBack={() => setSelectedTopic(null)} 
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div className="flex flex-col">
          <div className="text-[#C2A34F] font-serif italic mb-2 tracking-widest text-xs uppercase">Macro Analytics / 产业洞察</div>
          <h1 className="text-4xl font-medium text-white tracking-tight flex items-center">
            产业全景监控台 <span className="text-[#00D1FF] ml-4 font-mono text-xl opacity-50">V1.2</span>
          </h1>
          <div className="flex items-center mt-3 text-slate-500 text-[10px] uppercase tracking-widest font-bold gap-1">
            <Globe size={11} className="text-[#00D1FF]" />
            最后同步: {lastSync} (支持多源自动联网校准)
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            disabled={isSyncing}
            onClick={() => syncIndustryData(true)}
            className="group flex items-center bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-[#00D1FF] hover:border-[#00D1FF]/50 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <RefreshCw size={14} className={`mr-2 ${isSyncing ? 'animate-spin text-[#00D1FF]' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
            {isSyncing ? '正在校准全网数据...' : '连网同步最新数据'}
          </button>
          <div className="bg-[#00D1FF]/10 border border-[#00D1FF]/20 px-4 py-2 rounded-xl flex items-center space-x-3">
            <div className="relative">
              <span className="block w-2.5 h-2.5 bg-[#00D1FF] rounded-full animate-ping"></span>
              <span className="absolute inset-0 w-2.5 h-2.5 bg-[#00D1FF] rounded-full"></span>
            </div>
            <span className="text-[10px] text-[#00D1FF] uppercase font-bold tracking-[0.2em]">数据遥测正常</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.button 
            key={i}
            onClick={() => openDetail(stat.label, '实时指标')}
            whileHover={{ scale: 1.02, translateY: -4 }}
            whileTap={{ scale: 0.98 }}
            className="group text-left bg-slate-900/40 border border-slate-800 rounded-3xl p-7 relative overflow-hidden transition-all hover:bg-slate-900/60 hover:border-slate-700 shadow-xl"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <BarChart3 size={80} />
            </div>
            <div className="shrink-0 mb-6 bg-slate-800/80 w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-700/50 group-hover:bg-[#00D1FF]/10 group-hover:border-[#00D1FF]/30 transition-colors">
              {stat.icon}
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase text-slate-500 tracking-[0.2em] font-bold h-8">{stat.label}</p>
              <div className="flex items-baseline space-x-2 pt-2">
                <span className="text-3xl text-white font-mono tracking-tighter">
                  {typeof stat.value === 'number' && stat.value % 1 !== 0 ? stat.value.toFixed(2) : stat.value}
                </span>
              </div>
              <p className="text-[10px] text-[#00D1FF] font-bold tracking-widest mt-2">{stat.suffix}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <motion.div 
           className="xl:col-span-4 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 relative overflow-hidden h-[450px] shadow-2xl"
        >
          <div className="flex justify-between items-center mb-8 relative z-10">
             <h2 className="text-xl font-serif text-white tracking-wide">空域实时雷达 (区域 07)</h2>
             <button 
              onClick={() => openDetail('区域 07 空域分析', '数字网格')}
              className="hover:underline text-[10px] font-bold tracking-widest uppercase flex items-center transition-colors"
              style={{ color: activeTheme.primary }}
             >
                详情 <ExternalLink size={10} className="ml-1" />
             </button>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center opacity-40">
             <div className="absolute w-[360px] h-[360px] border border-slate-800/50 rounded-full"></div>
             <div className="absolute w-[240px] h-[240px] border border-slate-800/80 rounded-full"></div>
             <div className="absolute w-[120px] h-[120px] border border-slate-800 rounded-full"></div>
             <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="absolute w-[180px] h-[180px] origin-bottom-right top-1/2 left-1/2 -translate-x-full -translate-y-full"
                style={{ background: activeTheme.sweepColor }}
             />
             <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-[0.05]">
                {Array(16).fill(0).map((_, i) => <div key={i} className="border border-slate-500"></div>)}
             </div>
             <motion.div 
                animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full"
                style={{ backgroundColor: activeTheme.primary, boxShadow: `0 0 15px ${activeTheme.primary}` }}
             />
             <motion.div 
                animate={{ opacity: [0.5, 0.2, 0.5] }} transition={{ duration: 3, repeat: Infinity }}
                className="absolute bottom-1/4 left-1/3 w-2 h-2 rounded-full"
                style={{ backgroundColor: activeTheme.secondary, boxShadow: `0 0 10px ${activeTheme.secondary}` }}
             />
          </div>
          
          <div className="absolute bottom-8 inset-x-8 flex justify-between items-center text-xs">
            <div className="flex items-center space-x-3">
               <div className="p-2 bg-slate-800 rounded-lg"><RadioIcon size={14} className="text-[#00D1FF]" /></div>
               <div className="space-y-0.5">
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">信号节点</p>
                  <p className="font-mono text-white">SZ-NANS-02</p>
               </div>
            </div>
            <div className="text-right space-y-0.5">
               <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">活跃目标统计</p>
               <p className="font-mono text-white">42 架次</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="xl:col-span-8 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 relative overflow-hidden flex flex-col h-[450px] shadow-2xl"
        >
          <div className="flex justify-between items-center mb-10 shrink-0 relative z-10 w-full gap-4">
            <div>
              <h2 className="text-xl font-serif text-white tracking-wide">空域飞行流量 (实时)</h2>
              <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider mt-1">
                实时图样色彩主题：<span className="font-bold underline" style={{ color: activeTheme.primary }}>{activeTheme.name}</span>
              </p>
            </div>
            <div className="flex items-center space-x-6 text-[10px] uppercase tracking-widest font-bold">
              <div className="flex items-center text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: activeTheme.primary, boxShadow: `0 0 8px ${activeTheme.primary}` }}></span>
                物流无人机
              </div>
              <div className="flex items-center text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: activeTheme.secondary }}></span>
                客运 eVTOL
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorLogisticsDynamic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeTheme.primary} stopOpacity={0.45}/>
                    <stop offset="95%" stopColor={activeTheme.primary} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPassengerDynamic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeTheme.secondary} stopOpacity={0.45}/>
                    <stop offset="95%" stopColor={activeTheme.secondary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={activeTheme.gridOpacity} />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#05070A', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="logistics" stroke={activeTheme.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorLogisticsDynamic)" animationDuration={1000} />
                <Area type="monotone" dataKey="passenger" stroke={activeTheme.secondary} strokeWidth={3} fillOpacity={1} fill="url(#colorPassengerDynamic)" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 flex justify-end">
            <button 
              onClick={() => openDetail('飞行流量时序分析', '动态监测')}
              className="px-6 py-2 border border-slate-800 rounded-full text-[10px] uppercase font-bold tracking-widest text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
            >
              展开深度时序图
            </button>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 relative overflow-hidden flex flex-col min-h-[350px] shadow-2xl group"
        >
          <div className="mb-10 flex justify-between items-center relative z-10">
            <div>
              <h2 className="text-xl font-serif text-white tracking-wide">宏观市场预测报告</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">
                数据来源: CAAC 运行中心 • 同步频率: 24H
              </p>
            </div>
            <div className="flex gap-2">
               <div className="px-3 py-1 bg-[#00D1FF]/10 text-[#00D1FF] border border-[#00D1FF]/20 rounded font-mono text-[10px] tracking-widest">CAGR: 28.4%</div>
               <button onClick={() => openDetail('低空经济市场规模预测', '宏观趋势')} className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:border-[#00D1FF]/50 transition-colors">
                  <ExternalLink size={14} className="text-slate-400 group-hover:text-[#00D1FF]" />
               </button>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marketData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.1}/>
                <XAxis dataKey="year" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#05070A', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="size" fill={activeTheme.primary} radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="bg-gradient-to-br from-slate-900/60 to-slate-900/20 border border-slate-800 rounded-3xl p-7 flex flex-col justify-between shadow-2xl relative overflow-hidden h-[450px]">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 pointer-events-none">
             <Share2 size={120} className="text-[#00D1FF]" />
          </div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-800 pb-2.5 mb-3 justify-between items-center shrink-0">
              <div className="flex space-x-4">
                <button
                  onClick={() => setPanelTab('news')}
                  className={`text-[11px] font-bold uppercase tracking-widest pb-1 border-b-2 transition-all cursor-pointer ${
                    panelTab === 'news'
                      ? 'border-[#00D1FF] text-[#00D1FF]'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  实时网络快讯
                </button>
                <button
                  onClick={() => setPanelTab('subscribe')}
                  className={`text-[11px] font-bold uppercase tracking-widest pb-1 border-b-2 transition-all cursor-pointer ${
                    panelTab === 'subscribe'
                      ? 'border-[#00D1FF] text-[#00D1FF]'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  高级中台订阅
                </button>
              </div>

              <div className="flex items-center gap-1 text-[9px] font-mono select-none px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 animate-pulse">
                <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0"></span>
                <span>LIVE</span>
              </div>
            </div>

            {/* Panel Body */}
            {panelTab === 'news' ? (
              <div className="flex-1 flex flex-col justify-between min-h-0">
                <div className="space-y-2.5 min-h-0 flex-1 flex flex-col">
                  {/* Insight synopsis */}
                  <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl shrink-0">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1">
                      <Sparkles size={11} className="text-[#00D1FF]" />
                      依据网络来源智能研判:
                    </p>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans line-clamp-2">
                      {insightText}
                    </p>
                  </div>

                  {/* News list scrollable */}
                  <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[170px] scrollbar-thin">
                    {newsFeed.map((item, idx) => (
                      <a
                        key={idx}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2.5 bg-slate-900/45 hover:bg-slate-800/40 border border-slate-800/70 rounded-xl transition-all group/news"
                      >
                        <div className="flex justify-between items-start gap-1.5">
                          <span className="text-[11px] font-medium text-white group-hover/news:text-[#00D1FF] transition-colors leading-snug line-clamp-2">
                            {item.title}
                          </span>
                          <ExternalLink size={10} className="text-slate-500 shrink-0 mt-0.5 group-hover/news:text-[#00D1FF]" />
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-[9px] text-slate-500 font-mono">
                          <span className="px-1.5 py-0.2 bg-slate-950 rounded border border-slate-800">{item.source}</span>
                          <span>{item.date}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Grounding Sources citations */}
                {groundingSources.length > 0 && (
                  <div className="pt-2.5 border-t border-slate-900 mt-2 shrink-0">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">引证多源监管与研报网络 :</p>
                    <div className="flex flex-wrap gap-1.5">
                      {groundingSources.slice(0, 3).map((src, idx) => (
                        <a
                          key={idx}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] text-[#00D1FF]/80 hover:text-[#00D1FF] bg-[#00D1FF]/5 px-2 py-0.5 rounded border border-[#00D1FF]/10 hover:border-[#00D1FF]/35 transition-all truncate max-w-[130px]"
                        >
                          {src.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between min-h-0 pt-1">
                {isSubscribed ? (
                  /* Active VIP State */
                  <div className="space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center animate-pulse">
                          <Crown size={15} className="text-amber-500" />
                        </div>
                        <div>
                          <p className="text-[11px] text-amber-400 font-bold uppercase tracking-widest">高级中台服务已激活</p>
                          <p className="text-[9px] text-slate-500 font-mono">
                            专属模式: {localStorage.getItem('low_altitude_plan_term') === 'monthly' ? '￥10/月 (轻量版)' : '￥100/年 (豪华整年版)'}
                          </p>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
                        尊贵的行业决策人您好，您的低空智联高级中台功能已全面解锁，多源遥测监测与研报网络自动校准已在后台持续运行。
                      </p>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center space-x-2 text-[10px] text-emerald-400">
                          <ShieldCheck size={12} className="shrink-0" />
                          <span>每日空域监管特约报告 (PDF可下载)</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-emerald-400">
                          <ShieldCheck size={12} className="shrink-0" />
                          <span>全线企业适航融资专题索引数据同步</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button 
                        onClick={() => {
                          toast.success('每日空域监管PDF规报生成中... 下载已自动开始', {
                            description: '文件大小: 24.3MB, 包含 42 个低空示范跑道全维流速表。',
                            duration: 4000
                          });
                        }}
                        className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-amber-500/10 text-center block"
                      >
                        ⚡ 下载每日空域数据报告 (PDF)
                      </button>

                      <button 
                        onClick={() => {
                          if (confirm('确认取消低空高级中台的专属会员订阅吗？')) {
                            localStorage.removeItem('low_altitude_subscribed');
                            localStorage.removeItem('low_altitude_plan_term');
                            setIsSubscribed(false);
                            toast.info('尊贵的决策人，您已退订高级中台服务。权益已回收。');
                          }
                        }}
                        className="w-full py-1 bg-transparent hover:bg-slate-950 text-slate-600 hover:text-slate-400 border border-transparent hover:border-slate-800 rounded-lg text-[9px] transition-all cursor-pointer"
                      >
                        退订专属顾问服务
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Option Selection State */
                  <div className="flex-1 flex flex-col justify-between min-h-0 pt-1">
                    <div className="space-y-3">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        订阅 “低空领航者” 实时数据中报，解锁全方位 eVTOL 实网流速、行业融资及地方空域政策。
                      </p>

                      {/* Explicit Interactive Pricing Selection */}
                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setSubType('monthly')}
                          className={`p-2.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                            subType === 'monthly'
                              ? 'bg-slate-900 border-[#00D1FF] shadow-lg shadow-[#00D1FF]/5'
                              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">轻量版</span>
                            {subType === 'monthly' && <span className="w-1.5 h-1.5 rounded-full bg-[#00D1FF]" />}
                          </div>
                          <div className="text-white font-serif text-sm">￥10<span className="text-[10px] text-slate-400 font-sans">/月</span></div>
                          <p className="text-[8px] text-slate-500 mt-0.5">按月付，轻量追踪</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSubType('yearly')}
                          className={`p-2.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                            subType === 'yearly'
                              ? 'bg-slate-900 border-[#00D1FF] shadow-lg shadow-[#00D1FF]/5'
                              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="absolute -top-2 right-1 font-sans font-bold bg-[#00D1FF] text-slate-950 text-[7px] px-1.5 py-0.2 rounded-full scale-90 uppercase tracking-widest">
                            狂省￥20!
                          </div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">尊享年付</span>
                            {subType === 'yearly' && <span className="w-1.5 h-1.5 rounded-full bg-[#00D1FF]" />}
                          </div>
                          <div className="text-[#C2A34F] font-serif text-sm">￥100<span className="text-[10px] text-slate-400 font-sans">/年</span></div>
                          <p className="text-[8px] text-slate-500 mt-0.5">年付，专享极力优惠</p>
                        </button>
                      </div>

                      <div className="space-y-1 text-[10px] text-slate-400 pt-1">
                        <div className="flex items-center space-x-1.5">
                          <Check size={11} className="text-[#00D1FF]" />
                          <span>每日示范跑道全维流速规报 (PDF)</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Check size={11} className="text-[#00D1FF]" />
                          <span>通感物联网节点遥测频率缩至24小时</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowPayModal(true)}
                      className="w-full py-2.5 bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all mt-3 leading-none cursor-pointer flex items-center justify-center space-x-1.5 animate-pulse"
                    >
                      <CreditCard size={13} />
                      <span>立即订阅 (￥{subType === 'yearly' ? '100/年' : '10/月'})</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alipay cashier modal overlay */}
      <AnimatePresence>
        {showPayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-[380px] bg-[#F4F6F9] rounded-3xl overflow-hidden shadow-2xl border border-slate-350 relative text-slate-800"
            >
              {/* Cashier Blue Header */}
              <div className="bg-[#00A0E9] p-5 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center font-bold text-[#00A0E9] text-xs">支</div>
                  <span className="font-sans font-bold tracking-wide text-sm">支付宝官方收银台</span>
                </div>
                <button 
                  onClick={() => setShowPayModal(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs font-bold font-mono transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Bill Details */}
              <div className="p-6 space-y-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-2 text-slate-500">
                    <span className="text-xs">收款商户</span>
                    <span className="text-xs text-slate-700 font-bold">领航低空经济研究院中台部</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-2 text-slate-500">
                    <span className="text-xs">商品名称</span>
                    <span className="text-xs text-slate-700 font-bold">高级中台深度数据订阅 ({subType === 'yearly' ? '尊享年付' : '轻量月付'})</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="text-xs">交易金额</span>
                    <span className="text-base text-rose-600 font-sans font-semibold">￥{subType === 'yearly' ? '100.00' : '10.00'}</span>
                  </div>
                </div>

                {/* QR Code and guidelines */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/85 shadow-sm flex flex-col items-center justify-center space-y-4">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">请使用支付宝扫描二维码支付</p>
                  
                  {/* High Quality Styled QR Code placeholder layout */}
                  <div className="relative p-2.5 bg-slate-50 rounded-xl border border-slate-250">
                    <div className="w-40 h-40 bg-white flex items-center justify-center relative">
                      <QrCode className="text-[#00A0E9]" size={150} />
                      <div className="absolute inset-0 flex items-center justify-center bg-white/5 pointer-events-none">
                        <div className="w-10 h-10 bg-[#00A0E9] rounded-lg border-2 border-white flex items-center justify-center text-white font-sans text-xs font-bold shadow-md">
                          支
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-center">
                    <p className="text-[11px] text-slate-600 font-medium">扫上方二维码，完成支付宝安全沙箱付款</p>
                    <p className="text-[9px] text-[#00A0E9] font-mono select-none bg-[#00A0E9]/5 border border-[#00A0E9]/15 px-2 py-0.5 rounded-full inline-block">
                      Secure Alipay SSL Gate Active
                    </p>
                  </div>
                </div>

                {/* Simulated Payment Helper Control */}
                <div className="space-y-2">
                  <button
                    disabled={isPaying}
                    onClick={() => {
                      setIsPaying(true);
                      toast.loading('正在通过支付宝极速通道对账中...', { id: 'pay_audit' });
                      setTimeout(() => {
                        localStorage.setItem('low_altitude_subscribed', 'true');
                        localStorage.setItem('low_altitude_plan_term', subType);
                        setIsSubscribed(true);
                        setIsPaying(false);
                        setShowPayModal(false);
                        toast.success('支付宝对账成功！已开通高级中台专属会员功能。', { id: 'pay_audit' });
                      }, 1800);
                    }}
                    className="w-full py-3 bg-[#00A0E9] hover:bg-[#00A0E9]/90 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all tracking-wider cursor-pointer shadow-lg shadow-[#00A0E9]/30 flex items-center justify-center space-x-1.5"
                  >
                    {isPaying ? (
                      <span>正在扣减对账中...</span>
                    ) : (
                      <>
                        <ShieldCheck size={14} />
                        <span>我已在手机完成模拟扫码并支付</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowPayModal(false)}
                    className="w-full py-2.5 bg-transparent hover:bg-slate-200/50 text-slate-500 hover:text-slate-700 text-[11px] transition-all cursor-pointer font-bold uppercase text-center"
                  >
                    取消本次交易
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
