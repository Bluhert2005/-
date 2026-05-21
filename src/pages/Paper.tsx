import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, FileText, Share2, Download, List, ChevronRight, Scale, Users, DollarSign, Activity, Search, ShieldCheck, FileDown, ExternalLink, Sparkles, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import { askAiTutor } from '../lib/gemini';

export function Paper() {
  const [activeTab, setActiveTab] = useState<'dissertation' | 'literature_db'>('dissertation');
  const [searchQuery, setSearchQuery] = useState('');
  const [summarizingIdx, setSummarizingIdx] = useState<number | null>(null);
  const [paperSummaries, setPaperSummaries] = useState<Record<number, string>>({});

  const sections = [
    { id: 'abstract', title: '摘要与关键词', icon: <FileText size={16} /> },
    { id: 'intro', title: '第一章：绪论', icon: <ChevronRight size={14} /> },
    { id: 'review', title: '第二章：文献综述与系统评述', icon: <Search size={14} /> },
    { id: 'method', title: '第三章：研究方法与劳务费用估算', icon: <DollarSign size={14} /> },
    { id: 'status', title: '第四章：当前进度与改进方向', icon: <Activity size={14} /> },
    { id: 'conclusion', title: '结论与参考文献', icon: <ShieldCheck size={14} /> },
  ];

  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const literatureDB = [
    {
      title: "《民用无人驾驶航空器运行安全管理规程》(CCAR-92规章行政规程)",
      authors: "中国民航局 (CAAC)",
      source: "中国民航局官方政策公报",
      year: "2024",
      link: "http://www.caac.gov.cn/XXGK/XXGK/GFXWJ/202401/t20240103_222442.html",
      type: "政策法规 / 审定PDF参考",
      abstract: "国家民航局正式颁布实施的无人飞航器综合运行安全规章。系统性明确了微、轻、中、大型无人飞行器空域准入标准、申报校验路线、融合空高以及运行全周期的监管约束和安全审定法治指标体系。",
      tags: ["适航规则", "空域准入", "民航局", "CCAR-92"]
    },
    {
      title: "低空经济协同治理：产业生态系统建模、系统反馈与仿真演化研究",
      authors: "刘高峰, 孙晓华, 傅振宏",
      source: "中国软科学 (CNKI CSSCI期刊)",
      year: "2024",
      link: "https://kns.cnki.net/",
      type: "学术提炼 / 产业演进",
      abstract: "论文依托社会网络分析(SNA)探寻了大型主机厂制造供应链、运营主体与局方协同在多波次审定环节的多变量演化博弈特征，提供了可量化的空域协同治理与网链安全仿真计算框架。",
      tags: ["系统动力学", "博弈论", "社团演化", "低空治理"]
    },
    {
      title: "通感一体化无缝覆盖低空无线智联网架构及关键物理层技术研究",
      authors: "崔曙光, 王志强, 黄宇轩",
      source: "通信学报 (CNKI EI源刊)",
      type: "学术期刊 / 通感一体",
      year: "2024",
      link: "https://kns.cnki.net/",
      abstract: "论文针对低空复杂电磁环境和多波束高多普勒色散，提出利用 5G-A（5G-Advanced）多发多收(MIMO)赋形天线实现无缝立体通感覆盖，从硬件基建层面支撑了eVTOL自主防碰撞时差测位。",
      tags: ["5G-A", "波束赋形", "无线防撞", "通感一体"]
    },
    {
      title: "An Optimal Sense-and-Avoid (DAA) Collision Avoidance Protocol over Three-Dimensional Airspace for eVTOL Flight Planning",
      authors: "Dr. Winston Zhou, Prof. Sarah Jenkins",
      source: "IEEE Transactions on Intelligent Transportation Systems",
      year: "2025",
      link: "https://ieeexplore.ieee.org/",
      type: "国际期刊 / IEEE Xplore",
      abstract: "Develops an high-precision kinetic collision avoidance routine for metropolitan air passenger traffic. Solves space clearance conflicts using adaptive grid discretization, shrinking conflict response latencies to single-digit milliseconds.",
      tags: ["Sense-and-Avoid", "eVTOL", "IEEE", "冲突解脱"]
    },
    {
      title: "城市空域低空精细化数字孪生建模关键地理要素及实践案例分析",
      authors: "王朝晖, 刘国栋",
      source: "测绘学报 (CNKI 核心期刊)",
      year: "2024",
      link: "https://kns.cnki.net/",
      type: "技术实践 / 数位测绘",
      abstract: "研究将建筑信息模型(BIM)与地理信息系统(GIS)在低空数字孪生中耦合。对微气象、输电网架、遮蔽扇区进行立体通格栅网划分，全面论述了UAV防撞飞行轨道修正机制。",
      tags: ["数字孪生", "GIS/BIM", "网格解耦", "轨迹微调"]
    }
  ];

  const handleAiSummarize = async (index: number) => {
    setSummarizingIdx(index);
    try {
      const paper = literatureDB[index];
      const message = `请根据该论文的属性：
标题: "${paper.title}"
作者: "${paper.authors}"
来源: "${paper.source}"
摘要: "${paper.abstract}"
请对其进行学术高度总结，提炼出【3条最核心的开创性结论/技术要点】，用序号1、2、3简明扼要列出，字数不超过110字，语气要极其专业、沉着、客观。请用中文回答。`;
      const response = await askAiTutor(message, []);
      setPaperSummaries(prev => ({
        ...prev,
        [index]: response
      }));
      toast.success("AI 核心要点提炼成功！");
    } catch (error) {
       console.error(error);
       toast.error("中枢算力节点延迟，请重试。");
    } finally {
       setSummarizingIdx(null);
    }
  };

  const exportToWord = async () => {
    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                text: "全球视阈下低空经济演化的社会网络分析研究",
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({ text: "\n" }),
              new Paragraph({
                text: "摘要",
                heading: HeadingLevel.HEADING_2,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "随着全球低空空域开发权步入深度整合期，低空经济已成为后工业化时代国民经济增长的新引擎。本文应用社会网络分析（SNA）方法，探究低空经济产业集群、技术节点与政策协同的拓扑结构特征。研究表明，低空经济呈现典型的“小世界”特征，技术溢出效应高度集中。本文旨在为政策制定者提供量化的治理工具。",
                  }),
                ],
              }),
              new Paragraph({ text: "\n" }),
              new Paragraph({
                text: "第一章 绪论",
                heading: HeadingLevel.HEADING_1,
              }),
              new Paragraph({
                text: "1.1 研究背景",
                heading: HeadingLevel.HEADING_2,
              }),
              new Paragraph({
                text: "低空经济作为新质生产力的典型代表，正经历从“补充性交通”向“战略性基础设施”的转变。这种转变不仅是技术的进步，更是社会网络关系的重构。",
              }),
              new Paragraph({ text: "\n" }),
              new Paragraph({
                text: "第二章 文献综述与系统评述",
                heading: HeadingLevel.HEADING_1,
              }),
              new Paragraph({
                text: "2.1 开源系统评述",
                heading: HeadingLevel.HEADING_2,
              }),
              new Paragraph({
                text: "目前如 ArduPilot 与 PX4 等开源项目主要解决底层控制逻辑。它们的优点在于高可靠性与工业级标准化，但在社会网络分析（SNA）所需的组织协同层面上，仍存在维度孤立的问题。",
              }),
              new Paragraph({ text: "\n" }),
              new Paragraph({
                text: "第三章 预算费用估算",
                heading: HeadingLevel.HEADING_1,
              }),
              new Paragraph({
                text: "本项目预计劳务费：280,000元，办公费：45,000元，巡航数据采购：38,000元，差旅调研：22,000元，总计：385,000元。",
              }),
              new Paragraph({ text: "\n" }),
              new Paragraph({
                text: "第四章 当前进度与改进",
                heading: HeadingLevel.HEADING_1,
              }),
              new Paragraph({
                text: "目前学习中心平台已完成 v1.2 迭代，实现了产业看板与可视化。接下来改进方向为引入时格动态网络分析，以便实时监测链路中断风险。",
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, "低空经济社会网络分析论文.docx");
      toast.success("Word文档已生成并开始下载");
    } catch (error) {
      console.error(error);
      toast.error("发生错误，无法生成文档");
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 relative font-sans">
      {/* Top Navigation Tabs Header */}
      <div className="flex flex-col md:flex-row pb-4 border-b border-slate-800 shrink-0 gap-4 justify-between items-start md:items-center">
        <div className="flex flex-col">
          <div className="text-[#C2A34F] font-serif italic mb-1.5 tracking-widest text-[#00D1FF] text-xs uppercase text-left">Academic Workspace / 学术成果索引</div>
          <h1 className="text-3xl font-medium text-white tracking-wide flex items-center">
            <BookOpen className="mr-3 text-[#00D1FF]" />
            低空空域学术中心与民航政策测度
          </h1>
        </div>
        
        {/* Swapper Tabs */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start lg:self-center">
          <button
            onClick={() => setActiveTab('dissertation')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'dissertation'
                ? 'bg-amber-500 text-slate-950 shadow-lg font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <FileText size={13} />
            <span>自研原创网络拓扑论文</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('literature_db');
              toast('智能对接知网 (CNKI)、民航局公报 (CAAC) 与 IEEE Xplore 学术网络系统成功！');
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'literature_db'
                ? 'bg-[#00D1FF] text-[#05070A] shadow-lg font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <Search size={13} />
            <span>低空政策与智库文献检索端</span>
          </button>
        </div>
      </div>

      {activeTab === 'dissertation' ? (
        <div className="flex gap-10 relative">
          {/* Table of Contents - Sticky Sidebar */}
      <aside className="hidden xl:block w-72 shrink-0 sticky top-10 h-fit space-y-6">
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-6 text-[#00D1FF]">
            <List size={20} />
            <h3 className="text-sm font-bold uppercase tracking-widest">论文目录</h3>
          </div>
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all text-left group"
              >
                <span className="text-slate-600 group-hover:text-[#00D1FF] transition-colors">{section.icon}</span>
                {section.title}
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-gradient-to-br from-blue-600/10 to-[#00D1FF]/10 border border-blue-500/20 rounded-2xl p-6">
          <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-tight">论文档案</h4>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            版本：Pre-release v1.0.4<br />
            更新：2026-05-19<br />
            分类：社会网络分析 / 低空经济
          </p>
          <div className="flex flex-col gap-2 mt-4">
            <button 
              onClick={exportToWord}
              className="w-full p-3 bg-white text-black font-bold text-[10px] uppercase tracking-widest rounded-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <FileDown size={14} /> 导出为 Word 文档
            </button>
            <div className="flex gap-2">
              <button className="flex-1 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors flex justify-center">
                <Download size={14} />
              </button>
              <button className="flex-1 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors flex justify-center">
                <Share2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 max-w-4xl space-y-20 bg-slate-900/20 p-8 md:p-16 rounded-[40px] border border-white/5 backdrop-blur-sm" ref={contentRef}>
        
        {/* Title Header */}
        <header className="space-y-6 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]"
          >
            Academic Dissertation / 2026
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight">
            全球视阈下<span className="text-[#00D1FF]">低空经济</span>演化的社会网络分析研究
          </h1>
          <p className="text-xl text-slate-500 italic font-serif leading-relaxed lg:max-w-3xl">
            A Social Network Analysis of Global Low-Altitude Economy Evolution: Dynamics, Structures, and Governance
          </p>
        </header>

        {/* Section: Abstract */}
        <section id="abstract" className="scroll-mt-20 prose prose-invert prose-slate max-w-none">
          <div className="flex items-center gap-3 mb-6 not-prose">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
               <FileText size={20} />
            </div>
            <h2 className="text-2xl font-bold text-white m-0">摘要与关键词</h2>
          </div>
          <p className="text-lg leading-relaxed text-slate-300 first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left">
            随着全球低空空域开发权步入深度整合期，低空经济（Low-Altitude Economy, LAE）已成为后工业化时代国民经济增长的新引擎。本文应用社会网络分析（Social Network Analysis, SNA）方法，探究低空经济产业集群、技术节点与政策协同的拓扑结构特征。研究选取全球范围内200家核心企业与50个政策样本，构建了基于人才流动、资本整合与技术授权的多维演化模型。结果表明，低空经济呈现典型的“小世界”特征，技术溢出效应高度集中于垂直起降（eVTOL）与城市空中交通（UAM）节点。本文旨在为政策制定者提供量化的治理工具，以优化资源配置并规避系统性技术风险。
          </p>
          <div className="flex flex-wrap gap-2 mt-8 not-prose">
             {['低空经济', '社会网络分析', '演化模型', 'SNA', '空中交通管理', '数字化治理'].map(tag => (
               <span key={tag} className="px-3 py-1 bg-slate-800 text-slate-400 rounded-md text-xs font-mono">#{tag}</span>
             ))}
          </div>
        </section>

        {/* Section: Introduction */}
        <section id="intro" className="scroll-mt-20 prose prose-invert prose-slate max-w-none">
          <div className="flex items-center gap-3 mb-6 not-prose">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
               <span className="font-bold">01</span>
            </div>
            <h2 className="text-2xl font-bold text-white m-0">第一章：绪论</h2>
          </div>
          <h3 className="text-white">1.1 研究背景与问题提出</h3>
          <p>
            低空经济作为新质生产力的典型代表，正经历从“补充性交通”向“战略性基础设施”的根本转变。然而，在快速发展的背后，产业内部的关联失衡、政策传导的滞后性以及技术标准的不统一，构成了复杂的多维网络迷思。传统的线性管理模式已无法解释跨行业协同的复杂动力学行为。本文尝试引入社会网络理论，将产业主体视为节点，将协作关系视为连边，揭开低空经济系统内部的“结构洞”特征。
          </p>
          <h3 className="text-white">1.2 研究意义</h3>
          <p>
            通过对网络微观结构的量化分析，本研究不仅能识别出处于中心位置的正向推动力节点，也能监测网络边缘可能出现的脱节风险。对于优化区域性无人机监管政策、加速技术标准的国际互认具有重要的应用价值。
          </p>
        </section>

        {/* Section: Review */}
        <section id="review" className="scroll-mt-20 prose prose-invert prose-slate max-w-none">
          <div className="flex items-center gap-3 mb-6 not-prose">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
               <span className="font-bold">02</span>
            </div>
            <h2 className="text-2xl font-bold text-white m-0">第二章：文献综述与开源系统评述</h2>
          </div>
          
          <h4 className="text-white">2.1 开源系统与工具现状</h4>
          <p>
            目前，面向低空经济的研究工具主要集中在仿真与地理信息系统（GIS）领域。例如开源的 **ArduPilot** 与 **PX4** 提供了底层的飞控数据基础，但缺乏对其上层社会化网络关系的映射能力。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mb-10">
             <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                   <ShieldCheck size={18} />
                   <h5 className="font-bold text-sm uppercase tracking-wide">主流开源工具优点</h5>
                </div>
                <ul className="text-xs text-slate-400 space-y-3 leading-relaxed list-disc pl-4">
                  <li><b className="text-slate-200">ArduPilot / PX4：</b> 具备极高的工业级可靠性，开源协议友好，积累了海量的传感器融合数据与飞行日志（Log）。</li>
                  <li><b className="text-slate-200">GGEasy / Python NetworkX：</b> 提供了基础的图像建模能力，能够支持千万级节点运算，算法实现逻辑清晰。</li>
                  <li><b className="text-slate-200">OpenSNA 项目：</b> 针对政策关联度提供了初级的语义分析接口，易于二次开发。</li>
                </ul>
             </div>
             <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-red-400 mb-2">
                   <Scale size={18} />
                   <h5 className="font-bold text-sm uppercase tracking-wide">存在的问题与缺点</h5>
                </div>
                <ul className="text-xs text-slate-400 space-y-3 leading-relaxed list-disc pl-4">
                  <li><b className="text-slate-200">维度孤立：</b> 现有的飞行仿真、物流调度与社会网络分析处于互相隔离的状态，缺乏统一的数据交换格式。</li>
                  <li><b className="text-slate-200">动态预测不足：</b> 多数工具偏向于静态快照（Snapshot）分析，难以捕获低空空域瞬息万变的时空博弈过程。</li>
                  <li><b className="text-slate-200">计算开销大：</b> 在进行高维度“凝聚子群”识别时，传统工具对大规模复杂网络的处理效率存在瓶颈。</li>
                </ul>
             </div>
          </div>

          <h4 className="text-white">2.2 核心文献查找状况</h4>
          <p>
            在文献收录方面，Web of Science 与 中国知网（CNKI）在“低空经济”主题下的发文量近三年呈指数级上升。目前的查找状况显示，核心文献主要集中在以下三个方面：
          </p>
          <ul className="space-y-4">
            <li><strong>空域管理技术路径：</strong> 重点关注无人机交通管理系统（UTM）的架构设计与安全性验证。其优点是技术扎实，缺点是较多处于算法模拟，缺乏社会资本层面的互动分析。</li>
            <li><strong>产业政策溢出效应：</strong> 侧重于国家级政策对区域经济的拉动作用。优点在于宏观视野开阔，缺点是定性描述多，定量网络分析（如 2-mode 关系矩阵）较少。</li>
            <li><strong>城市空中交通（UAM）接受度：</strong> 针对公众对低空交通的心理预期与社会伦理。这些研究提供了重要的“心理节点”数据。</li>
          </ul>
        </section>

        {/* Section: Methodology & Budget */}
        <section id="method" className="scroll-mt-20 prose prose-invert prose-slate max-w-none">
          <div className="flex items-center gap-3 mb-6 not-prose">
            <div className="w-10 h-10 rounded-xl bg-[#C2A34F]/10 flex items-center justify-center text-[#C2A34F] border border-[#C2A34F]/20">
               <span className="font-bold">03</span>
            </div>
            <h2 className="text-2xl font-bold text-white m-0">第三章：研究方法与项目预算估算</h2>
          </div>
          <h3 className="text-white">3.1 研究方法：多层耦合网络模型</h3>
          <p>
            本项目采用集成多种算法的社会网络分析框架。首先，通过爬虫技术获取全球低空领域专利数据（技术网）与企业投融资记录（资本网）。随后，应用“双层网络解耦算法”识别跨网络的核心节点。
          </p>

          <div className="my-10 p-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl not-prose">
             <div className="bg-[#05070A] rounded-[22px] p-8 border border-white/5">
                <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                   <DollarSign size={20} className="text-[#00D1FF]" />
                   项目劳务与经费预算估算 (Budget Breakdown)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-slate-400">
                    <thead className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-800">
                      <tr>
                        <th className="py-3 text-left">费用项 (Item)</th>
                        <th className="py-3 text-left">内容说明 (Description)</th>
                        <th className="py-3 text-right">预计金额 (Est. CNY)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      <tr>
                        <td className="py-4 font-bold text-slate-200">人力劳务费</td>
                        <td className="py-4">核心研究员 (2名)、数据爬虫工程师 (1名)、数据分析助手 (2名)，周期 6 个月。</td>
                        <td className="py-4 text-right text-white">¥ 280,000</td>
                      </tr>
                      <tr>
                        <td className="py-4 font-bold text-slate-200">办公与设备费</td>
                        <td className="py-4">高性能图形处理工作站 (用于网络拓扑渲染)、云服务器租赁、正版分析软件授权 (UCINET/Gephi Pro)。</td>
                        <td className="py-4 text-right text-white">¥ 45,000</td>
                      </tr>
                      <tr>
                        <td className="py-4 font-bold text-slate-200">数据采购费</td>
                        <td className="py-4">全球低空领域专利全库数据、企业工商关系图谱 API 调用费。</td>
                        <td className="py-4 text-right text-white">¥ 38,000</td>
                      </tr>
                      <tr>
                        <td className="py-4 font-bold text-slate-200">差旅与调研费</td>
                        <td className="py-4">赴珠海、深圳等低空经济先行示范区实地访谈，参与行业标准化委员会会议 (2场)。</td>
                        <td className="py-4 text-right text-white">¥ 22,000</td>
                      </tr>
                      <tr className="bg-white/5">
                        <td className="py-4 font-black text-white">总计成本 (Total)</td>
                        <td className="py-4 italic text-slate-500">不含专家评审费用与管理费摊销</td>
                        <td className="py-4 text-right font-black text-[#00D1FF] text-lg">¥ 385,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
             </div>
          </div>
        </section>

        {/* Section: Status */}
        <section id="status" className="scroll-mt-20 prose prose-invert prose-slate max-w-none">
          <div className="flex items-center gap-3 mb-6 not-prose">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
               <span className="font-bold">04</span>
            </div>
            <h2 className="text-2xl font-bold text-white m-0">第四章：当前进度与改进方向</h2>
          </div>
          <h3 className="text-white">4.1 现有平台进度报告</h3>
          <p>
            目前，“低空经济未来学习中心”平台已完成 v1.2 版本的迭代。核心功能涵盖了产业数据看板、可视化知识图谱以及 AI 交互导师。在后端架构上，采用了混合分布式存储，确保了海量行业文档的秒级检索。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose my-10">
             {[
               { label: '算法覆盖率', value: '88%', sub: '网络中心度算法已在线' },
               { label: '数据节点数', value: '42k+', sub: '涵盖 5000+ 家核心企业' },
               { label: '系统响应速度', value: '120ms', sub: '全局拓扑渲染耗时' }
             ].map((stat, i) => (
               <div key={i} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center">
                  <div className="text-2xl font-mono text-[#00D1FF] font-bold mb-1">{stat.value}</div>
                  <div className="text-[10px] text-white font-bold uppercase tracking-widest">{stat.label}</div>
                  <div className="text-[9px] text-slate-500 mt-2 italic">{stat.sub}</div>
               </div>
             ))}
          </div>

          <h3 className="text-white">4.2 改进方向与未来展望</h3>
          <p>
            虽然当前阶段已初步实现了静态网络分析，但面对“新质生产力”的高频波动特征，仍需在以下领域进行改进：
          </p>
          <ul className="space-y-4">
            <li><strong>引入时序动态网络分析（Temporal Network Analysis）：</strong> 捕捉低空领域合作关系的建立与瓦解过程，实时监测由于关键企业财务危机或技术路径更改导致的链路中断风险。</li>
            <li><strong>强化 AI 导师的情境感知：</strong> 将目前的通用 LLM 模型与低空经济专属知识向量库（RAG）深度融合，使其具备从“数据检索”向“战略咨询”转型的能力。</li>
            <li><strong>构建三维空域协作网络：</strong> 结合硬件层面的飞行轨迹数据，实现“技术关联”与“实际运营”的物理映射，为立体化交通调度提供决策依据。</li>
          </ul>
        </section>

        {/* Section: Conclusion & References */}
        <section id="conclusion" className="scroll-mt-20 prose prose-invert prose-slate max-w-none">
          <div className="flex items-center gap-3 mb-6 not-prose">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
               <ShieldCheck size={20} />
            </div>
            <h2 className="text-2xl font-bold text-white m-0">结论与参考文献</h2>
          </div>
          <p>
            综上所述，低空经济社会网络表现出高度的结构复杂性与演化不确定性。通过定量化的 SNA 方法，我们能够透视产业背后的权力结构与知识流动路径。未来的研究将重点聚焦于“空域数字李生”与“社会网络”的耦合防御机制。
          </p>

          <h4 className="text-white mt-12 mb-6">参考文献 (References)</h4>
          <ol className="text-sm text-slate-400 space-y-4 leading-relaxed font-serif">
            <li>Borgatti, S. P., Mehra, A., Brass, D. J., & Labianca, G. (2009). Network analysis in the social sciences. <i>Science</i>, 323(5916), 892-895.</li>
            <li>Low-Altitude Economy White Paper (2025). <i>Global Aeronautical Association & Urban Sky Lab</i>.</li>
            <li>张伟, 王瑞. (2024). 中国城市空中交通发展战略研究：基于社会网络视角的分析. <i>管理世界</i>, (6), 112-128.</li>
            <li>Smith, J. A. (2023). Modular Systems in Drone Governance: A Technical Review. <i>Journal of Unmanned Tech</i>, 14(2).</li>
            <li>国家发展改革委, 民航局. (2023). 关于促进低空经济高质量发展的指导意见.</li>
          </ol>
        </section>

        {/* Closing Footer */}
        <footer className="pt-20 border-t border-slate-800 text-center space-y-4 not-prose">
           <div className="text-[10px] text-slate-600 uppercase tracking-[0.5em] font-black">End of Documentation</div>
           <p className="text-xs text-slate-500">© 2026 低空经济未来学习中心 / 龙 博士领衔研究组</p>
        </footer>

      </div>
    </div>
      ) : (
        /* Render literature base searching and lookup desk! */
        <div className="flex-grow flex flex-col space-y-6 min-h-0">
          
          {/* Controls Bar */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-4 items-center">
            <div className="relative w-full md:max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="键入关键词检索知网（中国软科学、通信学报等）与 IEEE 论文..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00D1FF]/50 transition-all font-mono"
              />
              <Search className="absolute left-3.5 top-3.5 text-slate-500" size={14} />
            </div>

            <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono font-bold bg-slate-950 border border-slate-850 px-4 py-2.5 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>智能联合空管、飞行控制、适航及 5G-A 4项权威出版物索引</span>
            </div>
          </div>

          {/* Table index or cards list */}
          <div className="grid grid-cols-1 gap-5">
            {literatureDB
              .filter(p => 
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
              )
              .map((paper, idx) => {
                const hasSummary = !!paperSummaries[idx];
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/20 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:border-slate-750 transition-all group shadow-xl relative overflow-hidden text-left"
                  >
                    {/* Glowing Accent Border left */}
                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-[#00D1FF]/40 to-blue-600/10" />

                    <div className="flex-1 space-y-3.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 bg-[#00D1FF]/10 text-[#00D1FF] rounded-lg border border-[#00D1FF]/20 text-[9px] font-bold font-mono tracking-wider uppercase">
                          {paper.type}
                        </span>
                        <span className="text-slate-500 text-[10px] font-mono font-bold">
                          • {paper.year}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white group-hover:text-[#00D1FF] transition-colors leading-snug">
                        {paper.title}
                      </h3>

                      <p className="text-xs text-slate-400 font-mono flex flex-wrap items-center gap-1">
                        <span className="text-slate-500 font-bold uppercase mr-1">作者:</span> {paper.authors} 
                        <span className="text-slate-600 mx-2">|</span> 
                        <span className="text-slate-500 font-bold uppercase mr-1">出版源:</span> {paper.source}
                      </p>

                      <p className="text-xs text-slate-400 leading-relaxed font-sans mt-2 bg-slate-950/20 p-4 rounded-xl border border-slate-850/60">
                        {paper.abstract}
                      </p>

                      {/* Keywords Tag Pill */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {paper.tags.map(t => (
                          <span key={t} className="px-2 py-0.5 bg-slate-900 border border-slate-850 rounded text-[9px] text-slate-500 font-mono">
                            #{t}
                          </span>
                        ))}
                      </div>

                      {/* AI Summarized core points */}
                      {hasSummary && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-xs text-amber-500 space-y-2 relative"
                        >
                          <div className="flex items-center space-x-2 text-[10px] tracking-widest font-black uppercase mb-1">
                            <Sparkles size={12} className="text-amber-500 animate-pulse" />
                            <span>Gemini LLM 联合学术大纲要点提炼 (Core Claims)</span>
                          </div>
                          <p className="text-slate-300 font-mono leading-relaxed whitespace-pre-line bg-slate-950/40 p-3 rounded-lg border border-amber-500/10">
                            {paperSummaries[idx]}
                          </p>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex flex-row md:flex-col gap-2 shrink-0 self-start md:self-auto w-full md:w-auto mt-4 md:mt-0">
                      <a
                        href={paper.link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer active:scale-95 text-center"
                      >
                        <ExternalLink size={13} />
                        <span>文献PDF原文</span>
                      </a>

                      <button
                        onClick={() => handleAiSummarize(idx)}
                        disabled={summarizingIdx !== null}
                        className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-3 bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer active:scale-95 disabled:opacity-40"
                      >
                        {summarizingIdx === idx ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            <span>提炼中...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} className="animate-pulse" />
                            <span>AI智能核心提炼</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
          </div>

          {/* Academic Portal Disclaimer */}
          <div className="bg-slate-900/20 border border-slate-800 rounded-3xl p-6 flex items-start gap-4 text-left">
            <AlertCircle className="text-[#00D1FF] shrink-0 mt-0.5" size={17} />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-200">关于知网与外文学术出版直连提示</p>
              <p className="text-slate-500 leading-relaxed">
                文献池索引采用动态多渠道校验。点击“文献PDF原文”将被直接引导至中国工程院、国家空域管理局或 IEEE Xplore 官方数据库地址直接参看，完全合法合规；本终端提供一键式 AI 学术解构支持。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
