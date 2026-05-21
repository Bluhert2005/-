import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlayCircle, 
  Clock, 
  Award, 
  ShieldAlert, 
  Cpu, 
  Box, 
  Radio, 
  ExternalLink, 
  BookOpen, 
  X, 
  CheckCircle2, 
  TrendingUp, 
  Info,
  Sliders,
  Sparkles,
  RefreshCw,
  Trophy,
  Tv,
  Terminal,
  Volume2,
  CheckSquare,
  Square
} from 'lucide-react';
import { toast } from 'sonner';

export interface SyllabusItem {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
}

export interface CourseType {
  id: number;
  title: string;
  description: string;
  iconType: 'cpu' | 'box' | 'radio' | 'shield';
  color: string;
  duration: string;
  level: string;
  progress: number;
  videoUrl: string;
  detailUrl: string;
  videoPlatform: string;
  detailPlatform: string;
  bvid: string; // Bilibili BV number to load in iframe player
  syllabus: SyllabusItem[];
  outcomes: string[];
  techSpec: string;
}

// Default course definitions
const DEFAULT_COURSES: CourseType[] = [
  {
    id: 1,
    title: 'eVTOL 技术基础与飞行控制',
    description: '解析电动垂直起降飞行器的气动布局、动力学建模、电池电机能量管理以及先进的多飞控容错控制算法。',
    iconType: 'cpu',
    color: 'bg-slate-900/40 border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/60 shadow-[0_4px_30px_rgba(0,209,255,0.03)]',
    duration: '4h 30m',
    level: '入门',
    progress: 75,
    videoUrl: 'https://www.bilibili.com/video/BV1pt4y1q7Lg',
    detailUrl: 'https://www.jobyaviation.com/',
    videoPlatform: '哔哩哔哩 (北京航空航天大学《多旋翼无人机设计与控制》国家一流本科精品课)',
    detailPlatform: 'Joby Aviation 官方飞行控制实勘',
    bvid: 'BV1pt4y1q7Lg',
    syllabus: [
      { id: '1-1', title: '多旋翼与倾转旋翼气动原理', duration: '45m', completed: true },
      { id: '1-2', title: '电池能量管理系统 (BMS) 与高压架构', duration: '60m', completed: true },
      { id: '1-3', title: '飞控计算机硬件冗余与总线通信', duration: '75m', completed: true },
      { id: '1-4', title: '控制分配算法 (Control Allocation) 实践', duration: '90m', completed: false },
    ],
    outcomes: ['理解eVTOL的核心气力耦合特性', '能够对多旋翼过渡到固定翼段进行力学建模', '掌握三余度/四余度飞控冗余原理'],
    techSpec: '基于 ARW-9 飞控平台、Matlab/Simulink 仿真适配器'
  },
  {
    id: 2,
    title: '无人飞行器 (UAV) 城市物流体系',
    description: '探讨无人机在城市高密度建筑群与复杂环境下的超视距（BVLOS）末端配送、全自动起降机场及自主避障调度。',
    iconType: 'box',
    color: 'bg-slate-900/40 border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/60 shadow-[0_4px_30px_rgba(37,99,235,0.03)]',
    duration: '5h 15m',
    level: '进阶',
    progress: 50,
    videoUrl: 'https://www.bilibili.com/video/BV1v5411r7Vz',
    detailUrl: 'https://drone.meituan.com/',
    videoPlatform: '哔哩哔哩 (阿木实验室《基于ROS的Prometheus无人机三维自主路径规划与避障算法实务》)',
    detailPlatform: '美团无人机低空物流系统运营网',
    bvid: 'BV1v5411r7Vz',
    syllabus: [
      { id: '2-1', title: '超视距飞行 (BVLOS) 法规与边界控制', duration: '60m', completed: true },
      { id: '2-2', title: '全自动起降机场 (Vertiport) 软硬件接口', duration: '75m', completed: true },
      { id: '2-3', title: '4G/5G 双冗余通信链路及避障雷达数据融合', duration: '90m', completed: false },
      { id: '2-4', title: '末端高精度风偏补偿算法与安全着陆控制', duration: '90m', completed: false },
    ],
    outcomes: ['了解高密度城市群物流配送的空域痛点', '掌握微气象监测与风偏估计核心算法', '能够设计Vertiport调度状态机格式'],
    techSpec: '适配美团/丰翼自动机场通信 API、BVLOS 安全规程'
  },
  {
    id: 3,
    title: 'UTM: 从空中交管到低空智联网',
    description: '学习无人机低空交管系统（UTM）架构、四维航线冲突检测以及5G-A（5G-Advanced）网络通感一体化的立体覆盖。',
    iconType: 'radio',
    color: 'bg-slate-900/40 border-slate-800 hover:border-[#C2A34F]/50 hover:bg-slate-900/60 shadow-[0_4px_30px_rgba(194,163,79,0.03)]',
    duration: '6h 00m',
    level: '高级',
    progress: 25,
    videoUrl: 'https://www.bilibili.com/video/BV1G8411Y7z8',
    detailUrl: 'https://www.nasa.gov/aeroresearch/programs/aasp/utm/',
    videoPlatform: '哔哩哔哩 (中国信通院《5G-Advanced通感一体化基站网络空中智联网与UTM管制系统研讨会》)',
    detailPlatform: 'NASA UTM 航空自主与空域交管规范',
    bvid: 'BV1G8411Y7z8',
    syllabus: [
      { id: '3-1', title: '传统空警与无人机 UTM 系统的底层差异', duration: '60m', completed: true },
      { id: '3-2', title: '通感一体化 (I-S-A-C) 基站定位与波束成形', duration: '90m', completed: false },
      { id: '3-3', title: '四维（时空 + 航路）防撞冲突解脱算法', duration: '120m', completed: false },
      { id: '3-4', title: '低空智联网边缘计算与低时延专网网关', duration: '90m', completed: false },
    ],
    outcomes: ['理解航线去中心化非确定性冲突预测', '深入5G-A波形设计与多集波束传感感知', '熟悉低空高动态网络多路径衰落与补偿指标'],
    techSpec: '支持 3GPP Rel-18 下行通感总线、ASTM F3401 网络标准'
  },
  {
    id: 4,
    title: '低空安全监管与适航认证审定',
    description: '解读民用航空器最新适航管理标准、特定运行风险评估（SORA）及空域申报、集群管制安全框架。',
    iconType: 'shield',
    color: 'bg-slate-900/40 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/60 shadow-[0_4px_30px_rgba(16,185,129,0.03)]',
    duration: '3h 45m',
    level: '核心',
    progress: 0,
    videoUrl: 'https://www.bilibili.com/video/BV1aP411A7p5',
    detailUrl: 'https://uom.caac.gov.cn/',
    videoPlatform: '哔哩哔哩 (中国民用航空局《特定运行风险评估 (SORA) 认证通稿规章实务解读》)',
    detailPlatform: '中国民航局 UOM 中枢综合管理服务平台',
    bvid: 'BV1aP411A7p5',
    syllabus: [
      { id: '4-1', title: '中国民航 CCAR-92 / CCAR-21 法规体系精解', duration: '45m', completed: false },
      { id: '4-2', title: 'JARUS 特定运行风险评估 (SORA) 方法论基础', duration: '60m', completed: false },
      { id: '4-3', title: '安全生命周期评估 (FHA/DDP) 与失效树分析', duration: '60m', completed: false },
      { id: '4-4', title: '突发黑飞检测技术与低空物理防御/拒止网络', duration: '60m', completed: false },
    ],
    outcomes: ['胜任低空空域运行的 SORA 申报及安全论证评估', '明确轻小微型无人航空器备案注册流程', '掌握大中型eVTOL局方型号合格证(TC)设计规范'],
    techSpec: '全面对齐中国 CAAC 新规、JARUS SORA v2.5 指引'
  }
];

export function Courses() {
  const [courseList, setCourseList] = useState<CourseType[]>(() => {
    const saved = localStorage.getItem('low_altitude_courses_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to restore course metrics from localStorage.", e);
      }
    }
    return DEFAULT_COURSES;
  });

  const [selectedCourse, setSelectedCourse] = useState<CourseType | null>(null);
  
  // Tab within details workspace: 'video' (Watch lecture) or 'sandbox' (Simulation terminal)
  const [activeTab, setActiveTab] = useState<'video' | 'sandbox'>('video');
  
  // Custom simulation variables
  const [isSimulating, setIsSimulating] = useState(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [selectedVideoBvid, setSelectedVideoBvid] = useState<string>('');

  // Persist course metrics state
  useEffect(() => {
    localStorage.setItem('low_altitude_courses_v2', JSON.stringify(courseList));
  }, [courseList]);

  // Synchronize modal state if list is updated internally
  useEffect(() => {
    if (selectedCourse) {
      const updated = courseList.find(c => c.id === selectedCourse.id);
      if (updated) {
        setSelectedCourse(updated);
      }
    }
  }, [courseList]);

  const getCourseIcon = (type: string) => {
    switch (type) {
      case 'cpu': return <Cpu className="text-[#00D1FF]" size={28} />;
      case 'box': return <Box className="text-blue-500" size={28} />;
      case 'radio': return <Radio className="text-[#C2A35F]" size={28} />;
      case 'shield': return <ShieldAlert className="text-emerald-500" size={28} />;
      default: return <Cpu className="text-[#00D1FF]" size={28} />;
    }
  };

  // Toggle syllabus checklist status - Dynamically updates real progress in state & localStorage!
  const handleToggleSyllabus = (courseId: number, syllabusId: string, currentStatus: boolean) => {
    const updated = courseList.map(c => {
      if (c.id === courseId) {
        const updatedSyllabus = c.syllabus.map(s => {
          if (s.id === syllabusId) return { ...s, completed: !currentStatus };
          return s;
        });
        
        // Recalculate genuine progress percentage
        const completedCount = updatedSyllabus.filter(s => s.completed).length;
        const totalCount = updatedSyllabus.length;
        const newProgress = Math.round((completedCount / totalCount) * 100);

        return {
          ...c,
          syllabus: updatedSyllabus,
          progress: newProgress
        };
      }
      return c;
    });

    setCourseList(updated);
    
    // Toast notification showing true progress update
    const newStatus = !currentStatus;
    toast.success(newStatus ? '单元标记已完成' : '单元标记为未学习', {
      description: `系统实时记录：本章研究进度现已刷新。`
    });
  };

  // Mark all syllabus items in a course as complete
  const handleCompleteAll = (courseId: number) => {
    const updated = courseList.map(c => {
      if (c.id === courseId) {
        const updatedSyllabus = c.syllabus.map(s => ({ ...s, completed: true }));
        return {
          ...c,
          syllabus: updatedSyllabus,
          progress: 100
        };
      }
      return c;
    });
    setCourseList(updated);
    toast.success('🎉 恭喜！该课程全部大纲微单元已标记完成！', {
      description: '已成功归档并颁发全息数字研学学时荣誉。'
    });
  };

  // Reset course learning progress
  const handleResetCourse = (courseId: number) => {
    const updated = courseList.map(c => {
      if (c.id === courseId) {
        const updatedSyllabus = c.syllabus.map(s => ({ ...s, completed: false }));
        return {
          ...c,
          syllabus: updatedSyllabus,
          progress: 0
        };
      }
      return c;
    });
    setCourseList(updated);
    toast.info('课程学习进度已重置。', {
      description: '您可以开启新的一轮仿真和视频研习。'
    });
  };

  // Trigger simulated hardware logic validation lab in terminal box
  const triggerSimulation = (course: CourseType) => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimLogs([
      `[SYS_INFO] 初始化 ${course.title} 立体数字化空中演练环境...`,
      `[SYS_INFO] 正在申请通感一体化局端频谱数据...`,
      `[PORTAL] 正在从 GZ-7 服务器调取实时链路接口...`
    ]);

    let intervalCount = 0;
    const interval = setInterval(() => {
      intervalCount++;
      if (intervalCount === 1) {
        setSimLogs(prev => [...prev, `[STATUS] 网络物理拓扑已连接。正在加载三维时空向量...`]);
      } else if (intervalCount === 2) {
        setSimLogs(prev => [...prev, `[TELEMETRY] 姿态角Pitch: +2.1°, 无人管段风偏指标: 0.14m/s, 电池剩余: 84%`]);
      } else if (intervalCount === 3) {
        setSimLogs(prev => [...prev, `[DEVICES] 遥测数据流完全接收成功，算法模型校验：PASS!`]);
      } else if (intervalCount === 4) {
        setSimLogs(prev => [...prev, `[SYSTEM] 模拟课程检验完成。自动在您的作业本中开启该学科。`]);
        clearInterval(interval);
        setIsSimulating(false);
        
        // Auto check standard next pending syllabus task!
        const nextPending = course.syllabus.find(s => !s.completed);
        if (nextPending) {
          handleToggleSyllabus(course.id, nextPending.id, false);
          toast.success(`空中实验考核通过！已自动记录：标记完成 [${nextPending.title}]`);
        } else {
          toast.info('核心仿真验证已完成。您的课堂成果相当显著！');
        }
      }
    }, 1200);
  };

  // Calculate high-level global academic statistics
  const totalCourses = courseList.length;
  const completedCourses = courseList.filter(c => c.progress === 100).length;
  const averageProgress = Math.round(courseList.reduce((acc, curr) => acc + curr.progress, 0) / totalCourses);
  const totalCompletedSyllabus = courseList.reduce((acc, c) => acc + c.syllabus.filter(s => s.completed).length, 0);
  const totalSyllabusCount = courseList.reduce((acc, c) => acc + c.syllabus.length, 0);

  const handleCardClick = (course: CourseType) => {
    setSelectedCourse(course);
    setSimLogs([]);
    setActiveTab('video');
    toast.info(`正在加载：${course.title}`, {
      description: '已成功开启全息课程研讨终端，并实时同步云端进度。'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Dynamic Academic Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-6 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-inner relative overflow-hidden backdrop-blur-sm">
        <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
          <Sparkles className="text-cyan-400 w-48 h-48" />
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#00D1FF]/10 text-[#00D1FF] flex items-center justify-center border border-[#00D1FF]/20 shadow-inner">
            <Trophy size={22} />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">已解业课程</div>
            <div className="text-xl font-serif text-white">{completedCourses} <span className="text-xs text-slate-500">/ {totalCourses} 门</span></div>
          </div>
        </div>

        <div className="flex items-center space-x-4 border-t sm:border-t-0 sm:border-l border-slate-800 pl-0 sm:pl-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-inner">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">总平均学习进度</div>
            <div className="text-xl font-serif text-cyan-400">{averageProgress}%</div>
          </div>
        </div>

        <div className="flex items-center space-x-4 border-t sm:border-t-0 sm:border-l border-slate-800 pl-0 sm:pl-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20 shadow-inner">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">完成排程知识点</div>
            <div className="text-xl font-serif text-white">{totalCompletedSyllabus} <span className="text-xs text-slate-500">/ {totalSyllabusCount} 点</span></div>
          </div>
        </div>

        <div className="flex items-center space-x-4 border-t sm:border-t-0 sm:border-l border-slate-800 pl-0 sm:pl-4">
          <button 
            onClick={() => {
              setCourseList(DEFAULT_COURSES);
              localStorage.removeItem('low_altitude_courses_v2');
              toast.success('学习数据已还原至系统出厂指标');
            }}
            className="w-full h-full flex flex-col items-center justify-center hover:bg-white/5 transition-colors p-2 text-center rounded-xl border border-dashed border-slate-800"
          >
            <RefreshCw size={18} className="text-slate-400 group-hover:rotate-180 transition-transform mb-1" />
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">重置全部真实进度</span>
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-800 pb-4 shrink-0 justify-between items-end">
        <div className="flex flex-col">
          <div className="text-[#00D1FF] font-serif italic mb-2 tracking-widest text-xs uppercase">Interactive Academy / 真实进度学习实验室</div>
          <h1 className="text-3xl font-medium text-white tracking-wide">全息课程协同研习 (Study Center)</h1>
          <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
            支持**真实的课程大纲微单元交互打勾**——勾选状态将直接重算并本地保存课程真实进度。配备长达1小时以上的高清专业大公开课外链直达、科研考卷及机载仿真模拟终端验证。
          </p>
        </div>
      </div>

      {/* Courses Bento List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courseList.map((course, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            key={course.id} 
            onClick={() => handleCardClick(course)}
            className={`border rounded-3xl p-8 group cursor-pointer transition-all duration-300 relative overflow-hidden ${course.color}`}
          >
            {/* Absolute element */}
            <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <div className="w-48 h-48 border-[10px] border-[#00D1FF] rounded-full"></div>
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-slate-800/80 w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-700 shadow-inner">
                  {getCourseIcon(course.iconType)}
                </div>
                <div className="flex space-x-2">
                  <span className="px-3 py-1 bg-slate-900/50 text-slate-300 border border-slate-800 text-[10px] uppercase font-bold tracking-widest rounded-lg flex items-center">
                    <Award size={12} className="mr-1 text-yellow-500" />
                    {course.level}
                  </span>
                  <span className="px-3 py-1 bg-slate-900/50 text-slate-300 border border-slate-800 text-[10px] uppercase font-bold tracking-widest rounded-lg flex items-center">
                    <Clock size={12} className="mr-1 text-cyan-400" />
                    {course.duration}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-serif text-white mb-3 tracking-wide group-hover:text-[#00D1FF] transition-colors flex items-center gap-2">
                {course.title}
                <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity duration-300" />
              </h3>
              
              <p className="text-sm text-slate-400 mb-8 flex-grow leading-relaxed line-clamp-2">{course.description}</p>

              {/* Learning Progress Indicator */}
              <div className="mt-auto">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] uppercase text-slate-500 tracking-widest font-bold flex items-center gap-1">
                    <CheckCircle2 size={10} className="text-cyan-400" />
                    云备份进度（点击卡片勾选）
                  </span>
                  <span className="text-sm font-serif italic text-white">{course.progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner relative">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-[#00D1FF] transition-all duration-700 ease-out shadow-[0_0_10px_#00D1FF]"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                  <span className="text-[10px] text-slate-500 font-mono block">
                    已打通: {course.syllabus.filter(s => s.completed).length}/{course.syllabus.length} 单元
                  </span>

                  <div className="flex gap-2 shrink-0">
                    <a 
                      href={course.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success(`正在为您跳转至专业精品课堂`, {
                          description: `即刻前往Bilibili学堂学习【${course.title}】的专业视频课。`
                        });
                      }}
                      className="cursor-pointer px-3.5 py-2 bg-slate-900 hover:bg-[#00D1FF]/20 border border-slate-800 hover:border-[#00D1FF]/30 text-slate-300 hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1"
                    >
                      <span>⚡ 直达视频 (1h+)</span>
                      <ExternalLink size={10} />
                    </a>

                    <button 
                      onClick={(e) => { e.stopPropagation(); handleCardClick(course); }}
                      className="cursor-pointer px-3.5 py-2 bg-[#00D1FF]/10 text-[#00D1FF] text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#00D1FF] hover:text-[#05070A] transition-all active:scale-95 border border-[#00D1FF]/20"
                    >
                      {course.progress === 0 ? '研习大纲' : '继续研习'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Advanced Double-Pane Holographic Interactive Learning Console/Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            {/* Dark blur backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCourse(null)}
              className="absolute inset-0 bg-[#020406]/95 backdrop-blur-xl"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-6xl bg-[#090D14]/95 border border-slate-800 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden z-10 flex flex-col md:flex-row max-h-[92vh]"
            >
              {/* Decorative top laser indicator */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00D1FF] to-transparent" />

              {/* LEFT INTERACTIVE MODULE: Premium Video Player Embed OR Simulation Hardware Terminal */}
              <div className="md:w-7/12 border-b md:border-b-0 md:border-r border-slate-800 bg-[#05070A] flex flex-col justify-between p-6">
                <div>
                  {/* Tab bar header */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 space-x-1">
                      <button
                        onClick={() => setActiveTab('video')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-colors ${
                          activeTab === 'video' 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Tv size={12} /> 🎥 热门空中讲义视频
                      </button>
                      <button
                        onClick={() => setActiveTab('sandbox')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-colors ${
                          activeTab === 'sandbox' 
                            ? 'bg-[#00D1FF]/10 text-[#00D1FF] border border-[#00D1FF]/20' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Terminal size={12} /> 机载仿真验证终端
                      </button>
                    </div>

                    <a 
                      href={selectedCourse.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-red-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      B站源视频主页 <ExternalLink size={12} />
                    </a>
                  </div>

                  {/* Tab Display Area */}
                  {activeTab === 'video' ? (
                    <div className="space-y-4">
                      {/* Custom Gateway visual panel instead of slow/unwanted embedded iframe */}
                      <div className="p-6 border border-slate-800 bg-slate-950/80 rounded-2xl shadow-xl flex flex-col justify-between h-[330px] relative overflow-hidden">
                        {/* Decorative glow background */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
                        
                        <div className="relative z-10 flex-grow flex flex-col justify-center items-center text-center space-y-4">
                          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center shadow-lg animate-pulse">
                            <PlayCircle size={36} />
                          </div>
                          
                          <div className="space-y-2 max-w-md">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#00D1FF] px-2.5 py-1 bg-[#00D1FF]/10 rounded-full border border-[#00D1FF]/20">
                              专业重磅研讨视频（时长 &gt; 1小时）
                            </span>
                            <h4 className="text-base font-serif font-bold text-white tracking-wide pt-1">
                              【{selectedCourse.title}】
                            </h4>
                            <p className="text-xs text-slate-400 leading-relaxed font-sans px-4">
                              本课程整合了来自行业一线或国家级重点高校的专业研究讲座与慕课学堂，核心授课视频全长一小时以上，带给您极高密度的系统化理论。
                            </p>
                          </div>
                        </div>

                        {/* Direct Jump Button Action */}
                        <div className="relative z-10 pt-4 border-t border-slate-900 flex flex-col items-center">
                          <a
                            href={selectedCourse.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              toast.success("正在为您开辟外部空中研习课堂窗口...", {
                                description: `即刻前往Bilibili进入沉浸式完整视频进修。`
                              });
                            }}
                            className="w-full text-center py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-orange-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_20px_rgba(239,68,68,0.3)] flex items-center justify-center gap-2 transform active:scale-[0.98]"
                          >
                            <span>🚀 立即跳转专业课堂学习</span>
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>

                      {/* Video explanation details card */}
                      <div className="p-4 bg-[#090D14] border border-slate-800 rounded-xl space-y-2">
                        <div className="text-[10px] font-black uppercase text-red-400 tracking-wider flex items-center gap-1.5">
                          <BookOpen size={12} />
                          <span>推荐专业平台和出处:</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          {selectedCourse.videoPlatform}。免去内嵌限制，直接在新标签页开启，支持极速、清晰度模式自由调整及全面板弹幕互动。
                        </p>
                      </div>
                    </div>
                  ) : (
                    // SANDBOX SIMULATOR TERMINAL
                    <div className="space-y-4">
                      <div className="border border-slate-800 bg-[#030508] p-5 rounded-2xl space-y-4 h-[330px] flex flex-col justify-between font-mono text-xs">
                        {/* Terminal Logs View */}
                        <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                          {simLogs.length === 0 ? (
                            <div className="text-slate-500 italic p-10 text-center flex flex-col items-center justify-center space-y-2">
                              <Terminal size={32} className="text-slate-600 mb-2 animate-pulse" />
                              <p>机载多域传感器模拟器校验就绪</p>
                              <p className="text-[10px]">点击下方按钮，开始模拟物理适航或三维冲突解算评估：</p>
                            </div>
                          ) : (
                            simLogs.map((log, idx) => {
                              let statusColor = 'text-green-400';
                              if (log.includes('[SYS_INFO]')) statusColor = 'text-cyan-400';
                              if (log.includes('[TELEMETRY]')) statusColor = 'text-yellow-400/90';
                              return (
                                <div key={idx} className={`${statusColor} text-[11px]`}>
                                  {log}
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Telemetry quick values */}
                        <div className="h-0.5 bg-slate-900" />
                        
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>连接基站: GZ_7_AIRSPACE_EAST</span>
                          <span className="flex items-center gap-1">
                            <Volume2 size={12} className="text-[#00D1FF]" /> 音频传感: 已启动
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          disabled={isSimulating}
                          onClick={() => triggerSimulation(selectedCourse)}
                          className={`flex-1 p-3 rounded-xl border font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            isSimulating 
                              ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-[#00D1FF]/10 text-[#00D1FF] border-[#00D1FF]/30 hover:bg-[#00D1FF]/20 active:scale-95'
                          }`}
                        >
                          {isSimulating ? '🛠️ 正在解算空气遥测向量...' : '📡 运行微单元算法与硬件仿真检验'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Outcomes and specs at the bottom container */}
                <div className="border-t border-slate-900 pt-5 mt-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase text-slate-500 tracking-wider font-bold">仿真硬件环境 (Specs)</span>
                    <span className="text-[10px] text-zinc-300 font-mono italic">{selectedCourse.techSpec}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <a 
                      href={selectedCourse.detailUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-2.5 bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 hover:border-slate-700 font-mono text-[9px] uppercase tracking-wider rounded-xl transition-all"
                    >
                      🔗 调取官方学术背景文档 (caac/NASA/Joby)
                    </a>
                    <button
                      onClick={() => {
                        toast.success("已复制课程核心技术规范字段至剪贴板");
                        navigator.clipboard.writeText(selectedCourse.techSpec);
                      }}
                      className="flex items-center justify-center p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 rounded-xl font-mono text-[9px] uppercase tracking-wider transition-all"
                    >
                      📋 提取硬件架构参数
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT CHECKLIST PANEL: Interactive Syllabus Checkpoints & Progress */}
              <div className="flex-1 p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-slate-950/70">
                <div className="space-y-6">
                  {/* Modal Header inside details */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-cyan-400/10 text-cyan-400 text-[10px] font-bold uppercase rounded-lg border border-cyan-400/20 mb-2">
                        研习座舱 ID: #00{selectedCourse.id}
                      </span>
                      <h3 className="text-xl font-serif font-bold text-white tracking-wide">{selectedCourse.title}</h3>
                    </div>
                    <button 
                      onClick={() => setSelectedCourse(null)} 
                      className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* High Quality Course Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 p-4 bg-[#05070A] border border-slate-800/80 rounded-2xl text-center">
                    <div>
                      <p className="text-[8px] uppercase text-slate-500 tracking-widest mb-1 font-bold">真实进度</p>
                      <p className="text-lg font-serif italic text-cyan-400">{selectedCourse.progress}%</p>
                    </div>
                    <div className="border-l border-slate-800/80 pl-2">
                      <p className="text-[8px] uppercase text-slate-500 tracking-widest mb-1 font-bold font-mono">课题时长</p>
                      <p className="text-md font-mono text-zinc-300 font-bold leading-normal pt-1">{selectedCourse.duration}</p>
                    </div>
                    <div className="border-l border-slate-800/80 pl-2">
                      <p className="text-[8px] uppercase text-slate-500 tracking-widest mb-1 font-bold">标准等级</p>
                      <p className="text-md font-bold text-yellow-500 leading-normal pt-1">{selectedCourse.level}</p>
                    </div>
                  </div>

                  {/* Real Dynamic Interactive Syllabus Checklist */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase text-slate-400 tracking-wider font-bold">
                        大纲微单元学习打勾 (互动记录)
                      </span>
                      <span className="text-[9px] text-slate-500">
                        勾选自动累计重置真实完成进度
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                      {selectedCourse.syllabus.map((item) => (
                        <div 
                          key={item.id} 
                          onClick={() => handleToggleSyllabus(selectedCourse.id, item.id, item.completed)}
                          className={`p-3 border rounded-xl flex justify-between items-center text-xs transition-colors cursor-pointer select-none ${
                            item.completed 
                              ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-300' 
                              : 'bg-slate-900/60 border-slate-800/60 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <button className="text-slate-400 hover:text-[#00D1FF] transition-colors focus:outline-none">
                              {item.completed ? (
                                <CheckCircle2 size={16} className="text-emerald-400" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-slate-600 hover:border-slate-400 shrink-0" />
                              )}
                            </button>
                            <span className={item.completed ? 'line-through text-slate-500 font-normal' : 'text-slate-200 font-medium'}>
                              {item.title}
                            </span>
                          </div>
                          <span className="font-mono text-[9px] text-slate-500 bg-slate-950/40 px-2 py-0.5 rounded-lg">
                            {item.duration}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Course Control Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-slate-900">
                    <button
                      onClick={() => handleCompleteAll(selectedCourse.id)}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[9px] uppercase tracking-widest font-black rounded-xl transition-all"
                    >
                      🪄 一键全部修完
                    </button>
                    <button
                      onClick={() => handleResetCourse(selectedCourse.id)}
                      className="py-2 px-3 bg-slate-900 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-slate-800 text-slate-500 text-[9px] uppercase tracking-widest font-black rounded-xl transition-all"
                    >
                      重置
                    </button>
                  </div>

                  {/* Outcomes Panel */}
                  <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-2">
                    <h4 className="text-[10px] uppercase text-slate-400 tracking-wider font-bold">课题产出技能项:</h4>
                    <div className="space-y-1">
                      {selectedCourse.outcomes.map((outcome, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-300 leading-normal">
                          <span className="text-cyan-400 mt-0.5 pr-1 font-serif">•</span>
                          <span>{outcome}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-900 flex justify-end gap-2 shrink-0">
                  <button 
                    onClick={() => setSelectedCourse(null)}
                    className="px-5 py-2.5 bg-[#05070A] hover:bg-slate-900 text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all border border-slate-900"
                  >
                    返回列表
                  </button>
                  <button 
                    onClick={() => {
                      if (selectedCourse.progress < 100) {
                        toast.info("已经开启该课程的视频大纲，请在微单元中持续打勾记录学时！");
                      } else {
                        toast.success("您已全面攻克本科目，请继续进修其他专业课题！");
                      }
                      setSelectedCourse(null);
                    }}
                    className="px-6 py-2.5 bg-[#00D1FF] hover:bg-blue-400 text-black text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_25px_rgba(0,209,255,0.25)]"
                  >
                    {selectedCourse.progress === 100 ? '学成毕业并返回' : '同步数据并返回'}
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
