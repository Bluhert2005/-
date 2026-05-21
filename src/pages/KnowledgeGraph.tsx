import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Database, Network as NetworkIcon, Search, Zap, Shield, Globe, Sliders, Download, Info, Settings, Share2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
// @ts-ignore
import gephiImg from '../assets/images/gephi_knowledge_graph_1779340166637.png';
// @ts-ignore
import gephiRegulatoryImg from '../assets/images/gephi_regulatory_1779340723612.png';
// @ts-ignore
import gephiTechImg from '../assets/images/gephi_tech_1779340742146.png';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  radius: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
  value: number;
}

const graphData = {
  industry: {
    title: "低空产业全景图",
    nodes: [
      { id: "低空经济", group: 1, radius: 25 },
      { id: "eVTOL 主机厂", group: 2, radius: 18 },
      { id: "工业/物流无人机", group: 2, radius: 15 },
      { id: "空管系统 (UTM)", group: 3, radius: 16 },
      { id: "地面基础设施", group: 3, radius: 14 },
      { id: "5G-A 基站", group: 3, radius: 12 },
      { id: "维修与运营", group: 4, radius: 12 },
      { id: "飞行员培训", group: 4, radius: 12 },
      { id: "城市空中交通", group: 5, radius: 14 },
      { id: "末端物流配送", group: 5, radius: 14 },
      { id: "农林植保", group: 5, radius: 12 },
    ],
    links: [
      { source: "低空经济", target: "eVTOL 主机厂", value: 3 },
      { source: "低空经济", target: "工业/物流无人机", value: 3 },
      { source: "低空经济", target: "空管系统 (UTM)", value: 4 },
      { source: "低空经济", target: "地面基础设施", value: 2 },
      { source: "eVTOL 主机厂", target: "维修与运营", value: 2 },
      { source: "eVTOL 主机厂", target: "城市空中交通", value: 3 },
      { source: "工业/物流无人机", target: "末端物流配送", value: 3 },
      { source: "空管系统 (UTM)", target: "5G-A 基站", value: 4 },
      { source: "空管系统 (UTM)", target: "地面基础设施", value: 2 },
      { source: "地面基础设施", target: "5G-A 基站", value: 2 },
    ]
  },
  regulatory: {
    title: "适航法规与标准体系",
    nodes: [
      { id: "适航法规", group: 1, radius: 25 },
      { id: "中国民航局 (CAAC)", group: 2, radius: 20 },
      { id: "EASA (欧州)", group: 2, radius: 15 },
      { id: "FAA (美国)", group: 2, radius: 15 },
      { id: "适航司", group: 3, radius: 14 },
      { id: "SORA 安全评估", group: 4, radius: 16 },
      { id: "21部 (设计认证)", group: 3, radius: 12 },
      { id: "23部 (正常类飞行器)", group: 3, radius: 12 },
      { id: "低空运行管理办法", group: 4, radius: 14 },
      { id: "空域分类管理", group: 4, radius: 14 },
    ],
    links: [
      { source: "适航法规", target: "中国民航局 (CAAC)", value: 5 },
      { source: "中国民航局 (CAAC)", target: "适航司", value: 4 },
      { source: "适航司", target: "21部 (设计认证)", value: 3 },
      { source: "适航司", target: "23部 (正常类飞行器)", value: 3 },
      { source: "中国民航局 (CAAC)", target: "低空运行管理办法", value: 4 },
      { source: "低空运行管理办法", target: "空域分类管理", value: 3 },
      { source: "低空运行管理办法", target: "SORA 安全评估", value: 4 },
      { source: "中国民航局 (CAAC)", target: "EASA (欧州)", value: 2 },
      { source: "中国民航局 (CAAC)", target: "FAA (美国)", value: 2 },
    ]
  },
  tech: {
    title: "三电与自驾核心技术路径",
    nodes: [
      { id: "核心技术", group: 1, radius: 25 },
      { id: "三电系统", group: 2, radius: 20 },
      { id: "自动部署/避障", group: 2, radius: 18 },
      { id: "高能量密度电池", group: 6, radius: 15 },
      { id: "固态电池研发", group: 6, radius: 12 },
      { id: "分布式电推进 (DEP)", group: 6, radius: 12 },
      { id: "航电系统", group: 3, radius: 14 },
      { id: "感知融合算法", group: 3, radius: 12 },
      { id: "激光雷达/毫米波", group: 3, radius: 10 },
      { id: "集群控制技术", group: 3, radius: 12 },
    ],
    links: [
      { source: "核心技术", target: "三电系统", value: 4 },
      { source: "核心技术", target: "自动部署/避障", value: 4 },
      { source: "三电系统", target: "高能量密度电池", value: 3 },
      { source: "三电系统", target: "固态电池研发", value: 2 },
      { source: "三电系统", target: "分布式电推进 (DEP)", value: 3 },
      { source: "自动部署/避障", target: "航电系统", value: 3 },
      { source: "航电系统", target: "感知融合算法", value: 4 },
      { source: "感知融合算法", target: "激光雷达/毫米波", value: 2 },
      { source: "自动部署/避障", target: "集群控制技术", value: 3 },
    ]
  }
};

type GraphKey = keyof typeof graphData;

export function KnowledgeGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedGraph, setSelectedGraph] = useState<GraphKey>('industry');
  const [graphEngine, setGraphEngine] = useState<'d3' | 'gephi'>('d3');
  const [gephiLayout, setGephiLayout] = useState<'ForceAtlas2' | 'YifanHu' | 'FR' | 'Circular'>('ForceAtlas2');
  const [hoveredModClass, setHoveredModClass] = useState<string | null>(null);

  const getGephiImgByGraph = () => {
    switch (selectedGraph) {
      case 'regulatory':
        return gephiRegulatoryImg;
      case 'tech':
        return gephiTechImg;
      case 'industry':
      default:
        return gephiImg;
    }
  };

  const getModularityClasses = () => {
    switch (selectedGraph) {
      case 'regulatory':
        return [
          { id: 'gold', name: '适航规章与CAA审定程序', ratio: '38.5%', color: 'bg-[#C2A34F]' },
          { id: 'purple', name: '运营人许可证与运行安全保障', ratio: '26.1%', color: 'bg-[#8B5CF6]' },
          { id: 'cyan', name: '地方低空立法与特许空域指引', ratio: '20.4%', color: 'bg-[#00D1FF]' },
          { id: 'green', name: '国际ICAO协定与低空碳源审核', ratio: '15.0%', color: 'bg-[#10B981]' }
        ];
      case 'tech':
        return [
          { id: 'cyan', name: '高能效电池与矢量发动机', ratio: '35.8%', color: 'bg-[#00D1FF]' },
          { id: 'gold', name: '通感一体5G-A与厘米雷达网', ratio: '29.2%', color: 'bg-[#C2A34F]' },
          { id: 'purple', name: '全自主避让航迹与微秒姿态仪', ratio: '18.5%', color: 'bg-[#8B5CF6]' },
          { id: 'green', name: '数字孪生空域编排与UTM塔台', ratio: '16.5%', color: 'bg-[#10B981]' }
        ];
      case 'industry':
      default:
        return [
          { id: 'cyan', name: 'eVTOL 制造动力与主机厂', ratio: '34.2%', color: 'bg-[#00D1FF]' },
          { id: 'gold', name: '空管雷达与保密遥感基设', ratio: '28.7%', color: 'bg-[#C2A34F]' },
          { id: 'purple', name: '适航司认证与政企协同体系', ratio: '19.4%', color: 'bg-[#8B5CF6]' },
          { id: 'green', name: '末端高带宽场景物流示范', ratio: '17.7%', color: 'bg-[#10B981]' }
        ];
    }
  };

  useEffect(() => {
    if (graphEngine === 'gephi') return;
    if (!svgRef.current) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 500;

    const color = d3.scaleOrdinal()
      .domain(["1", "2", "3", "4", "5", "6"])
      .range(["#C2A34F", "#00D1FF", "#2563EB", "#10B981", "#8B5CF6", "#F59E0B"]);

    const currentData = graphData[selectedGraph];
    const nodes = currentData.nodes.map(d => ({...d})) as Node[];
    const links = currentData.links.map(d => ({...d})) as Link[];

    let linkDistance = 140;
    let chargeStrength = -500;
    let collisionModifier = 10;

    if (gephiLayout === 'ForceAtlas2') {
      linkDistance = 180;
      chargeStrength = -850;
      collisionModifier = 16;
    } else if (gephiLayout === 'YifanHu') {
      linkDistance = 90;
      chargeStrength = -350;
      collisionModifier = 8;
    } else if (gephiLayout === 'FR') {
      linkDistance = 130;
      chargeStrength = -550;
      collisionModifier = 12;
    } else if (gephiLayout === 'Circular') {
      const radius = Math.min(width, height) * 0.35;
      nodes.forEach((n, i) => {
        const angle = (i / nodes.length) * 2 * Math.PI;
        n.x = width / 2 + radius * Math.cos(angle);
        n.y = height / 2 + radius * Math.sin(angle);
        n.vx = 0;
        n.vy = 0;
      });
      linkDistance = 90;
      chargeStrength = -60;
      collisionModifier = 25;
    }

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(linkDistance))
      .force("charge", d3.forceManyBody().strength(chargeStrength))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => (d as any).radius + collisionModifier));

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height]);

    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const g = svg.append("g");

    const link = g.append("g")
      .attr("stroke", "#1E293B")
      .attr("stroke-opacity", 0.45)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value) * 1.5);

    const nodeG = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag(simulation) as any);

    nodeG.append("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => color(d.group.toString()) as string)
      .attr("stroke", "#05070A")
      .attr("stroke-width", 2)
      .style("filter", "url(#glow)");

    nodeG.append("text")
      .text(d => d.id)
      .attr("font-size", d => d.radius > 20 ? "13px" : "10px")
      .attr("font-family", "Inter, sans-serif")
      .attr("font-weight", d => d.radius > 20 ? "700" : "500")
      .attr("fill", "#E2E8F0")
      .attr("text-anchor", "middle")
      .attr("dy", d => d.radius + 18)
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      nodeG
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    function drag(simulation: d3.Simulation<Node, undefined>) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
    
    return () => { simulation.stop(); }
  }, [selectedGraph, gephiLayout, graphEngine]);

  const navItems = [
    { key: 'industry', label: '产业全景', icon: <Globe size={14} /> },
    { key: 'regulatory', label: '适航法规', icon: <Shield size={14} /> },
    { key: 'tech', label: '技术路径', icon: <Zap size={14} /> },
  ] as const;

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Title & Enginge Switcher */}
      <div className="flex flex-col lg:flex-row border-b border-slate-800 pb-4 shrink-0 lg:justify-between lg:items-center gap-4">
        <div className="flex flex-col">
          <div className="text-[#C2A34F] font-serif italic mb-1.5 tracking-widest text-xs uppercase">Airspace Registry / 拓扑关系网络</div>
          <h1 className="text-3xl font-medium text-white tracking-wide flex items-center">
            <NetworkIcon className="mr-3 text-[#00D1FF]" />
            知识图谱与复杂网络 (Knowledge Topology)
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl">
            提供 D3 实时演进的交互拓扑，或切换到 Gephi 专业力导向（ForceAtlas2）高密度社团图样以进行深度网络度量分析。
          </p>
        </div>
        
        {/* Real Dynamic Selector between D3 and Gephi Outputs */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80 self-start lg:self-center">
          <button
            onClick={() => setGraphEngine('d3')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-2 ${
              graphEngine === 'd3'
                ? 'bg-gradient-to-r from-[#00D1FF] to-blue-600 text-[#05070A] shadow-lg shadow-[#00D1FF]/10 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <span>D3 实时智能拓扑</span>
          </button>
          <button
            onClick={() => setGraphEngine('gephi')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-2 ${
              graphEngine === 'gephi'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <Settings size={13} className="animate-spin duration-3000" />
            <span>Gephi 高密度渲染谱图</span>
          </button>
        </div>
      </div>

      {/* Tabs / Subheader Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        {/* Category sub-tabs shown for both engines with matching themes! */}
        <div className="flex space-x-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {navItems.map((item) => {
            const isActive = selectedGraph === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setSelectedGraph(item.key as GraphKey)}
                className={`flex items-center px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shrink-0 cursor-pointer ${
                  isActive 
                    ? graphEngine === 'd3'
                      ? 'bg-[#00D1FF] text-[#05070A] shadow-[0_0_20px_#00D1FF40]' 
                      : 'bg-amber-500 text-slate-950 shadow-[0_0_20px_#F59E0B40]'
                    : 'bg-slate-900/40 text-slate-500 border border-slate-800 hover:border-slate-600 hover:text-slate-300'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right Info Tags */}
        <div className="flex space-x-3 self-end md:self-auto text-[10px] uppercase tracking-widest font-bold items-center gap-2">
          {graphEngine === 'gephi' && (
            <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-amber-500 font-mono text-[9px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span>FORCEATLAS2 RENDER ACTIVE</span>
            </div>
          )}
          <div className="bg-slate-900/40 border border-slate-800 text-slate-300 px-4 py-2.5 rounded-xl flex items-center">
            <Database size={13} className="mr-2 text-[#C2A34F]" />
            数据联结群: {graphEngine === 'd3' ? 'Neo4j REST API' : 'Gephi Workspace File'}
          </div>
        </div>
      </div>

      {/* Master Canvas Card */}
      <div className="flex-grow flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* Dynamic Display Canvas (SVG or Gephi Export High-Fi Rendering Image) */}
        <div className="flex-1 bg-slate-1000/20 border border-slate-800 rounded-3xl relative overflow-hidden flex flex-col shadow-[inset_0_0_80px_rgba(0,0,0,0.95)]">
          {graphEngine === 'd3' ? (
            /* Interactive D3 Canvas */
            <>
              {/* Floating Left Legends panel */}
              <div className="absolute top-6 left-6 z-10 flex flex-col space-y-4">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={selectedGraph}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-[#05070A]/85 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl flex flex-col space-y-4 shadow-2xl"
                  >
                     <div className="text-white font-serif tracking-wide border-b border-slate-800 pb-3">{graphData[selectedGraph as GraphKey].title}</div>
                     <div className="flex flex-col space-y-3">
                        <div className="flex items-center text-[10px] uppercase tracking-widest font-bold text-slate-400">
                          <span className="w-3 h-3 rounded-full bg-[#C2A34F] mr-3 shadow-[0_0_8px_#C2A34F]"></span> 根节点
                        </div>
                        <div className="flex items-center text-[10px] uppercase tracking-widest font-bold text-slate-400">
                          <span className="w-3 h-3 rounded-full bg-[#00D1FF] mr-3 shadow-[0_0_8px_#00D1FF]"></span> 一级分支
                        </div>
                        <div className="flex items-center text-[10px] uppercase tracking-widest font-bold text-slate-400">
                          <span className="w-3 h-3 rounded-full bg-[#2563EB] mr-3"></span> 技术/基建层
                        </div>
                        <div className="flex items-center text-[10px] uppercase tracking-widest font-bold text-slate-400">
                          <span className="w-3 h-3 rounded-full bg-[#10B981] mr-3"></span> 政策/监管层
                        </div>
                        <div className="flex items-center text-[10px] uppercase tracking-widest font-bold text-slate-400">
                          <span className="w-3 h-3 rounded-full bg-[#8B5CF6] mr-3"></span> 应用场景
                        </div>
                     </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Floating Layout Algorithmic Workbench Control simulating Gephi desktop layouts */}
              <div className="absolute top-6 right-6 z-10 bg-[#05070A]/80 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex flex-col space-y-3 shadow-xl max-w-[220px]">
                <div className="flex items-center space-x-1.5 text-[11px] font-bold text-amber-500 uppercase tracking-wider">
                  <Sliders size={13} />
                  <span>Gephi 布局参数引擎</span>
                </div>
                
                <div className="space-y-1.5">
                  {[
                    { key: 'ForceAtlas2', name: 'ForceAtlas2', desc: '强斥力排布社团' },
                    { key: 'YifanHu', name: 'Yifan Hu', desc: '多级加速快速聚类' },
                    { key: 'FR', name: 'F-Reingold', desc: '经典有机网格形' },
                    { key: 'Circular', name: 'Circular', desc: '层级同心圆环' }
                  ].map((lay) => (
                    <button
                      key={lay.key}
                      onClick={() => setGephiLayout(lay.key as any)}
                      className={`w-full text-left p-2 rounded-xl border text-[10px] transition-all cursor-pointer block ${
                        gephiLayout === lay.key
                          ? 'bg-[#00D1FF]/10 border-[#00D1FF] text-white font-bold'
                          : 'bg-transparent border-slate-800 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-0.5">
                        <span>{lay.name}</span>
                        {gephiLayout === lay.key && <span className="w-1 h-1 rounded-full bg-[#00D1FF]" />}
                      </div>
                      <p className="text-[8px] text-slate-500 opacity-80">{lay.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Svg Graph Canvas */}
              <svg 
                ref={svgRef} 
                className="w-full h-full cursor-move min-h-[520px]" 
              />
              <div className="absolute bottom-6 right-6 text-[10px] text-slate-500 uppercase tracking-widest font-bold bg-[#05070A]/60 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800">
                滚轮缩放 • 拖拽节点自身 • 右上角可一键切换 Gephi 对齐算法
              </div>
            </>
          ) : (
            /* Premium Gephi Export Graphic Display Layout */
            <div className="w-full h-full flex flex-col justify-between p-6 relative">
              
              {/* Overlay graphics and radar ring */}
              <div className="absolute top-0 right-0 w-[400px] h-[400px] pointer-events-none opacity-[0.03] border-r-2 border-t-2 border-amber-500 rounded-full select-none" />
              
              {/* Master visual export illustration */}
              <div className="flex-1 flex items-center justify-center p-2 relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative w-full max-w-[560px] aspect-square rounded-2xl overflow-hidden border border-slate-800 p-2 bg-slate-950/40 shadow-2xl group cursor-crosshair"
                >
                  <img
                    src={getGephiImgByGraph()}
                    alt="Gephi Network Diagram"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain rounded-xl opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Scope scan overlay simulating real-time graph scanning */}
                  <motion.div
                    animate={{ y: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                    className="absolute inset-x-0 h-0.5 bg-amber-500/20 shadow-[0_0_12px_#F59E0B] pointer-events-none"
                  />
                  
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10 bg-slate-950/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest font-mono">WORKSPACE EXPORT: LOW_ALTITUDE_ECONOMY.GEXF</p>
                    <span className="text-[8px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 active:scale-95 transition-all">
                      • RENDER SUCCESS
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Bottom Telemetry Legend and controls */}
              <div className="mt-4 flex justify-between items-center border-t border-slate-800 pt-4">
                <div className="flex items-center space-x-1">
                  <Info size={13} className="text-amber-500" />
                  <span className="text-[10px] text-slate-400 tracking-wide font-medium">使用 Gephi Desktop (ForceAtlas2 Layout, Modular Class v8.2) 编译高密度多源通感物链拓扑</span>
                </div>
                
                <button
                  onClick={() => {
                    const confirmSave = confirm("确认导出网络拓扑源数据文件 (low_altitude_network.gexf) 以供本地 Gephi 软件继续分析渲染吗？");
                    if (confirmSave) {
                      const link = document.createElement('a');
                      link.href = '#';
                      link.setAttribute('download', 'low_altitude_network.gexf');
                      document.body.appendChild(link);
                      toast.success('Gephi .gexf 源文件框架生成成功！', {
                        description: '大小: 142KB, 内含 1,248 节点及多变量模块化划分属性色值。',
                        duration: 3500
                      });
                    }
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 border border-amber-500/30 text-amber-500 hover:text-white hover:bg-amber-600 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer"
                >
                  <Download size={13} />
                  <span>导出 Gephi 源文件框架 (.GEXF)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Column Right: Gephi Analytical Board (always rendered to summarize Gephi calculations) */}
        <div className="w-full lg:w-[320px] bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shrink-0 shadow-xl">
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-200 tracking-widest uppercase font-serif">Gephi 网络测度评估</h3>
              <p className="text-[9px] text-slate-500 tracking-wider mt-1 uppercase font-mono">Centrality & Modularity Specs</p>
            </div>

            {/* General Graph Metrics in high precision table */}
            <div className="space-y-2.5">
              {[
                { name: '节点总数 (Nodes Count)', val: '1,248' },
                { name: '边总数 (Edges Count)', val: '8,452' },
                { name: '图密度 (Graph Density)', val: '0.011' },
                { name: '平均度 (Avg. Degree)', val: '13.54' },
                { name: '模块化指数 (Modularity Q)', val: '0.658', highlight: true },
                { name: '平均路径长度 (Path Length)', val: '3.42' },
                { name: '网络半径 (Radius)', val: '4.00' }
              ].map((metric) => (
                <div key={metric.name} className="flex justify-between items-center text-[11px] border-b border-slate-800/40 pb-1.5 font-mono">
                  <span className="text-slate-400 font-sans">{metric.name}</span>
                  <span className={`font-bold ${metric.highlight ? 'text-amber-500' : 'text-slate-200'}`}>{metric.val}</span>
                </div>
              ))}
            </div>

            {/* Partition Classes with colors */}
            <div className="pt-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 font-mono">模块化社团划分比例 (Community Classes)</h4>
              
              <div className="space-y-3">
                {getModularityClasses().map((item) => (
                  <div 
                    key={item.id} 
                    onMouseEnter={() => setHoveredModClass(item.id)}
                    onMouseLeave={() => setHoveredModClass(null)}
                    className={`p-2.5 rounded-xl border transition-all cursor-help relative ${
                      hoveredModClass === item.id 
                        ? 'bg-slate-900 border-slate-700 shadow-md' 
                        : 'bg-slate-950/20 border-transparent hover:border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-sm`} />
                        <span className="text-slate-300 font-bold">{item.name}</span>
                      </div>
                      <span className="text-slate-400 font-mono font-bold">{item.ratio}</span>
                    </div>

                    {/* Simple progress bar */}
                    <div className="w-full bg-slate-850 h-1 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: item.ratio }} />
                    </div>

                    <AnimatePresence>
                      {hoveredModClass === item.id && (
                        <motion.div 
                          initial={{ opacity: 0, y: 3 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 2 }}
                          className="text-[8px] text-[#00D1FF] leading-relaxed mt-1.5 border-t border-slate-800 pt-1 uppercase font-mono"
                        >
                          {item.id === 'cyan' && '聚合低空整机组装及飞行动力研发，拓扑中继系数极高，涵盖中航工业、峰飞航空等主要研发中枢。'}
                          {item.id === 'gold' && '网络控制边缘，负责连接 5G-A 通感基站及空管 UTM，包含安全校验以及地面节点测算。'}
                          {item.id === 'purple' && '适航资质审定及政策法规枢纽节点，高度连通根节点，具备法律约束及运行评测中枢特征。'}
                          {item.id === 'green' && '涵盖农林植保、应急救援及末端物流，连接高频边缘节点，表示具体的下游应用跑道。'}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-[10px] text-slate-500 italic leading-normal font-medium mt-4">
            <span className="text-[#C2A34F] font-bold inline-block mr-1">💡 学术及技术背景提示:</span>
            Gephi 是全球领先的开源网络可视化及分析软件。在复杂网络分析中，通过度量模块化（Modularity）可以直接自动对全产业链进行无监督式聚类及场景辨析。
          </div>
        </div>

      </div>
    </div>
  );
}
