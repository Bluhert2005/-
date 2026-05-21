import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Video, Radio, Cpu, Activity, Terminal, Layers, Zap, Send, Disc, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { askAiTutor } from '../lib/gemini';

type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';

export function EmbodiedAI() {
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [isMicActive, setIsMicActive] = useState(false);
  const [isCamActive, setIsCamActive] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [currentCaption, setCurrentCaption] = useState('终端系统待命。点击麦克风或直接在终端中下达指令。');
  const [nlpConfidence, setNlpConfidence] = useState(98.2);
  const [ikPrecision, setIkPrecision] = useState(94.5);
  
  const [interactionLogs, setInteractionLogs] = useState<{ time: string, msg: string, type: 'user' | 'system' }[]>([
    { time: '09:00:00', msg: 'Aero 2.0 具身数字生命网络已成功部署并载入。', type: 'system' }
  ]);

  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoStream]);

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // Initialize Speech Services on mount
  useEffect(() => {
    synthesisRef.current = window.speechSynthesis || null;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'zh-CN';

      rec.onstart = () => {
        setIsMicActive(true);
        setAvatarState('listening');
        setCurrentCaption('正在倾听您的指令，请说话...');
        addLog('System', '已开启空间全双工麦克风阵列对焦。');
      };

      rec.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const text = result[0].transcript;
        setCurrentCaption(`识别中: "${text}"`);
        if (result.isFinal) {
          handleUserCommand(text);
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          toast.error('麦克风访问未被允许', {
            description: '请在浏览器设置中开启麦克风权限或使用右侧键盘输入。'
          });
        }
        setIsMicActive(false);
        setAvatarState('idle');
        setCurrentCaption('麦克风链路受限。请使用键盘下达具身指令。');
      };

      rec.onend = () => {
        setIsMicActive(false);
        if (avatarState === 'listening') {
          setAvatarState('idle');
        }
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, [avatarState]);

  // Audio bars simulator based on State
  const [bars, setBars] = useState<number[]>(Array(24).fill(10));
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (avatarState === 'listening') {
      interval = setInterval(() => {
        setBars(prev => prev.map(() => Math.floor(Math.random() * 25) + 5));
      }, 100);
    } else if (avatarState === 'speaking') {
      interval = setInterval(() => {
        setBars(prev => prev.map(() => Math.floor(Math.random() * 45) + 15));
      }, 70);
    } else if (avatarState === 'thinking') {
      interval = setInterval(() => {
        setBars(prev => prev.map((_, idx) => Math.floor(Math.sin((Date.now() / 150) + idx) * 15) + 20));
      }, 50);
    } else {
      interval = setInterval(() => {
        setBars(prev => prev.map((curr) => Math.max(4, curr - 2)));
      }, 200);
    }
    return () => clearInterval(interval);
  }, [avatarState]);

  const addLog = (sender: string, msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setInteractionLogs(prev => [{ time, msg, type: sender === 'User' ? 'user' : 'system' }, ...prev.slice(0, 19)]);
  };

  // Speaks out output text via SpeechSynthesis
  const speakOutput = (text: string) => {
    if (!synthesisRef.current) return;
    synthesisRef.current.cancel();

    // Clean brackets/markdown for phonetic playback
    const phoneticText = text
      .replace(/[*#_`~\[\]()\-]/g, '')
      .replace(/[A-Za-z0-9]/g, (char) => char + ' '); // slow down acronyms

    const utterance = new SpeechSynthesisUtterance(phoneticText);
    utterance.lang = 'zh-CN';
    
    const voices = synthesisRef.current.getVoices();
    const candidateVoic = voices.find(v => v.lang.includes('zh') || v.lang.includes('ZH'));
    if (candidateVoic) {
      utterance.voice = candidateVoic;
    }

    utterance.onstart = () => {
      setAvatarState('speaking');
      setCurrentCaption('Aero (具身系统语音读取中...)');
    };

    utterance.onend = () => {
      setAvatarState('idle');
      setCurrentCaption('Aero 指令执行完毕，交互端待命。');
    };

    utterance.onerror = () => {
      setAvatarState('idle');
    };

    synthesisRef.current.speak(utterance);
  };

  // Main action dispatch calling Gemini dynamically
  const handleUserCommand = async (指令: string) => {
    if (!指令.trim()) return;
    addLog('User', 指令);
    setAvatarState('thinking');
    setCurrentCaption(`正在将具身指令 "${指令}" 上传给 Gemini 中枢算力进行多模态运动对齐...`);
    
    // Dynamically adjust confidence rates to add hyper-real sci-fi feedback
    setNlpConfidence(Number((95 + Math.random() * 4.9).toFixed(1)));
    setIkPrecision(Number((92 + Math.random() * 7.5).toFixed(1)));

    try {
      const responsePrompt = `你现在作为一个数字具身生命实体（代号：Aero），这是用户下达的具身/多模态控制命令或知识问题：
"${指令}"
请采用高级未来派人型 AI 机械战卫的冷酷和沉着口吻进行回应。回答内容请【非常简短】，不超过100字（以确保真人语音朗读不会过于冗长）。
内容中请具体说明你如何将此指令映射到你的虚拟肢体、仿生传感器或者低空感知单元上去。`;

      const reply = await askAiTutor(responsePrompt, []);
      addLog('System', reply);
      speakOutput(reply);
    } catch (err) {
      const fallback = "多维空间对准错误：信号链路中断。请重启神经端口。";
      addLog('System', fallback);
      speakOutput(fallback);
    }
  };

  const toggleMic = () => {
    if (avatarState === 'listening') {
      if (recognitionRef.current) recognitionRef.current.stop();
      setAvatarState('idle');
      setIsMicActive(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      } else {
        toast.warning('设备环境限制', {
          description: '当前浏览器或安全域不支持 HTML5 麦克风录音，请使用右侧控制台进行文本具身交互，Gemini 算力将完全一致。'
        });
        // Simulated voice toggle if HTML5 speech isn't functional
        setIsMicActive(true);
        setAvatarState('listening');
        setTimeout(() => {
          setIsMicActive(false);
          const mockSpokenText = "Aero，诊断并同步空域5G-A地面网点。";
          handleUserCommand(mockSpokenText);
        }, 3000);
      }
    }
  };

  useEffect(() => {
    if (isCamActive && videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream;
      videoRef.current.play().catch(err => {
        console.error("Camera playback failed:", err);
      });
    }
  }, [isCamActive, videoStream]);

  const toggleCam = () => {
    if (isCamActive) {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        setVideoStream(null);
      }
      setIsCamActive(false);
      addLog('System', '机器视觉配准暂停。');
      toast.info('机器视觉摄像头已停开');
    } else {
      navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
        .then(stream => {
          setVideoStream(stream);
          setIsCamActive(true);
          toast.success('激活机器视觉对焦模块', {
            description: '已成功打开前置摄像头，正在叠加实时多模态定位与手势配准。'
          });
          addLog('System', 'Aero 机器视觉传感器标定完成。');
        })
        .catch(err => {
          console.error('Camera access error:', err);
          toast.error('无法启动摄像头', {
            description: '请确认已授予应用摄像头权限并检测硬件连接是否正常。'
          });
        });
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col font-sans animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex border-b border-slate-800 pb-4 shrink-0 justify-between items-end">
        <div className="flex flex-col">
          <div className="text-[#C2A34F] font-serif italic mb-2 tracking-widest text-xs uppercase">Embodied Intelligence Hub / 虚拟具身交互</div>
          <h1 className="text-3xl font-medium text-white tracking-wide flex items-center">
            <Cpu className="mr-3 text-[#00D1FF]" />
            具身数字生命 Aero (全功能交互端)
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl leading-relaxed">
            模块 F 成果验证：结合 Web Speech API 语音控制与自主口型同步（Lip-Sync）。
            点击左下角麦克风激活高保真语音流，或使用右下角交互审计台发布具身对齐指令。
          </p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden min-h-0">
        
        {/* Left Column: 3D Visualization Area */}
        <div className="lg:col-span-7 flex flex-col space-y-4 min-h-0">
          <div className="flex-1 bg-[#05070a] border border-slate-800 rounded-3xl relative overflow-hidden flex flex-col shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] group">
            
            {/* 3D Scene Marker UI */}
            <div className="absolute top-6 left-6 z-10 flex flex-col space-y-3">
               <div className="bg-[#05070A]/80 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={isCamActive ? "w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" : "w-1.5 h-1.5 rounded-full bg-slate-700"}></div>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-[#00D1FF] font-bold">NODE: Aero-EmbodiedV2</span>
                    <span className="text-[8px] uppercase tracking-[0.2em] text-slate-500 font-bold">STATE: {avatarState.toUpperCase()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                      <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">感知延迟</p>
                      <p className="text-xs font-mono text-[#00D1FF] font-bold">
                        {avatarState === 'thinking' ? '快速计算中' : '15ms (Optimal)'}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">TTS引擎</p>
                      <p className="text-xs font-mono text-amber-400 font-bold">WEB SYNTHESIS</p>
                    </div>
                  </div>
               </div>
            </div>

            {/* Real Webcam / Computer Vision Feed */}
            <div className="absolute top-6 right-6 z-10 w-48 h-36 rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-md overflow-hidden flex flex-col shadow-2xl">
              {isCamActive ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover opacity-80"
                  />
                  {/* Cyber Scanner HUD Overlay */}
                  <div className="absolute inset-0 border border-[#00D1FF]/20 pointer-events-none">
                    <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00D1FF]" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00D1FF]" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#00D1FF]" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#00D1FF]" />
                    
                    {/* Continuous sweep line */}
                    <div className="w-full h-[1px] bg-emerald-400/40 absolute top-0 left-0 animate-[bounce_3s_infinite]" />
                    
                    {/* Simulated skeleton target boundaries */}
                    <motion.div
                      animate={{
                        x: [15, 30, 25, 35, 15],
                        y: [12, 28, 18, 33, 12],
                        width: [70, 85, 80, 95, 70],
                        height: [60, 75, 70, 85, 60]
                      }}
                      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                      className="absolute border border-dashed border-amber-500/50 flex flex-col justify-end p-1"
                    >
                      <span className="text-[6px] text-amber-400 font-mono tracking-tighter">FACE_POSE SYNC</span>
                      <span className="text-[5px] text-amber-500 font-mono scale-90 origin-left">COORD MATCH_OK</span>
                    </motion.div>
                  </div>
                  
                  {/* Feed Status tag */}
                  <div className="absolute bottom-2 right-2 flex items-center space-x-1.5 bg-slate-950/80 py-0.5 px-2 rounded border border-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[7px] text-emerald-400 font-mono uppercase font-bold tracking-wider">WEBCAM LIVE</span>
                  </div>
                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center relative p-3 text-center">
                  <Video size={20} className="text-slate-600 mb-2 animate-pulse" />
                  <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold font-mono">VISION STANDBY</span>
                  <span className="text-[6px] text-slate-600 uppercase font-mono mt-1">视频模块待命 / 点击下方激活</span>
                </div>
              )}
            </div>

            {/* Simulated 3D Avatar (Highly Interactive Visual Shape) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Background glow syncing with state */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] blur-[110px] rounded-full transition-all duration-700 ${
                  avatarState === 'listening' ? 'bg-[#00D1FF]/15' :
                  avatarState === 'thinking' ? 'bg-amber-500/15' :
                  avatarState === 'speaking' ? 'bg-emerald-500/15' :
                  'bg-[#00D1FF]/5'
                }`}></div>
                
                {/* Hologram Circle */}
                <motion.div 
                  animate={{ 
                    rotate: avatarState === 'thinking' ? 360 : -360
                  }} 
                  transition={{ 
                    duration: avatarState === 'thinking' ? 5 : 20, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }} 
                  className={`absolute inset-0 -m-16 border rounded-full border-dashed transition-colors duration-500 ${
                    avatarState === 'listening' ? 'border-[#00D1FF]/40' :
                    avatarState === 'thinking' ? 'border-amber-500/40' :
                    avatarState === 'speaking' ? 'border-emerald-500/40' :
                    'border-[#00D1FF]/10'
                  }`}
                />
                
                {/* Rotating Geometric Mesh */}
                <motion.div 
                  animate={{ 
                    y: avatarState === 'speaking' ? [0, -10, 5, -5, 0] : [0, -10, 0],
                    scale: avatarState === 'speaking' ? [1, 1.08, 0.98, 1.05, 1] : 1,
                    rotateY: avatarState === 'listening' ? [0, 15, -15, 0] : [0, 10, 0]
                  }}
                  transition={{ 
                    duration: avatarState === 'speaking' ? 0.3 : 5, 
                    repeat: avatarState === 'speaking' ? 0 : Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="relative z-10 cursor-pointer flex items-center justify-center"
                  onClick={() => handleUserCommand("发起常规系统行为自检")}
                >
                  <Layers 
                    size={170} 
                    className={`transition-colors duration-500 stroke-[0.4] ${
                      avatarState === 'listening' ? 'text-[#00D1FF]' :
                      avatarState === 'thinking' ? 'text-amber-500' :
                      avatarState === 'speaking' ? 'text-emerald-500' :
                      'text-slate-400'
                    }`}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <HexagonIcon className={`w-32 h-32 transition-all duration-500 ${
                      avatarState === 'listening' ? 'text-[#00D1FF] drop-shadow-[0_0_25px_#00D1FF]' :
                      avatarState === 'thinking' ? 'text-amber-500 drop-shadow-[0_0_25px_#F59E0B]' :
                      avatarState === 'speaking' ? 'text-emerald-500 drop-shadow-[0_0_25px_#10B981]' :
                      'text-slate-700 drop-shadow-[0_0_8px_rgba(0,209,255,0.2)]'
                    }`} />
                  </div>
                </motion.div>
                
                {/* Core Particle Glow */}
                <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-all duration-500 ${
                  avatarState === 'listening' ? 'bg-[#00D1FF] shadow-[0_0_20px_#00D1FF]' :
                  avatarState === 'thinking' ? 'bg-amber-500 animate-ping' :
                  avatarState === 'speaking' ? 'bg-emerald-500 shadow-[0_0_20px_#10b981] animate-pulse' :
                  'bg-slate-600'
                }`}></span>
              </div>
            </div>

            {/* Real-time speech subtitle banner overlay */}
            <div className="absolute top-[52%] inset-x-8 px-6 text-center select-none pointer-events-none">
              <span className="bg-[#05070a]/90 border border-slate-800 text-slate-300 px-5 py-2.5 rounded-full text-xs font-mono tracking-wide inline-flex items-center shadow-2xl">
                {avatarState === 'listening' && <Disc size={13} className="mr-2 text-red-500 animate-spin" />}
                {avatarState === 'thinking' && <Activity size={13} className="mr-2 text-amber-500 animate-pulse" />}
                {avatarState === 'speaking' && <Sparkles size={13} className="mr-2 text-emerald-400 animate-bounce" />}
                {avatarState === 'idle' && <Radio size={13} className="mr-2 text-slate-500" />}
                {currentCaption}
              </span>
            </div>

            {/* Bottom Controls / Visualizer */}
            <div className="absolute bottom-6 inset-x-6 z-10">
              <div className="flex items-center justify-between bg-[#05070A]/85 backdrop-blur-2xl border border-slate-800 p-5 rounded-[2rem] shadow-2xl">
                <div className="flex space-x-3 shrink-0">
                   <button 
                     onClick={toggleMic}
                     title="点击开始语音指令交互 (Speech Recognition)"
                     className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 cursor-pointer ${avatarState === 'listening' ? 'bg-[#00D1FF] text-[#05070A] shadow-[0_0_25px_rgba(0,209,255,0.5)]' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-600'}`}
                   >
                     <Mic size={20} />
                   </button>
                   <button 
                     onClick={toggleCam}
                     title="开启虚拟摄像头标定对齐"
                     className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 cursor-pointer ${isCamActive ? 'bg-emerald-500 text-[#05070A] shadow-[0_0_25px_rgba(16,185,129,0.5)]' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-600'}`}
                   >
                     <Video size={20} />
                   </button>
                </div>

                {/* Simulated equalizer visualizer syncing to speaker waves */}
                <div className="flex-1 mx-6 flex items-end justify-center space-x-1.5 h-10 overflow-hidden">
                   {bars.map((h, i) => (
                     <motion.div 
                        key={i}
                        animate={{ height: h }}
                        className={`w-1 rounded-full ${
                          avatarState === 'listening' ? 'bg-[#00D1FF]' :
                          avatarState === 'thinking' ? 'bg-amber-500' :
                          avatarState === 'speaking' ? 'bg-emerald-500' :
                          'bg-slate-800'
                        } transition-all duration-70`}
                     />
                   ))}
                </div>

                <div className="flex flex-col items-end shrink-0 select-none">
                   <span className="text-[8px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-0.5 font-mono">NEURAL SYNC</span>
                   <span className="text-xs font-mono text-white font-bold tracking-widest">ONLINE 100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Terminal CLI */}
        <div className="lg:col-span-5 flex flex-col space-y-4 overflow-hidden min-h-0">
          
          {/* Preset Embodied Actions Shortcuts */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-5 shrink-0 flex flex-col space-y-3 shadow-md">
            <h4 className="text-[10px] uppercase text-slate-400 tracking-widest font-bold flex items-center">
              <Zap size={12} className="mr-2 text-amber-500" />
              具身行为库与控制场景映射 (Preset Actions)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { title: "航道防撞自检", desc: "Aero，列明当前空域防撞避障(DAA)自检状态", icon: "🛡️" },
                { title: "诊断通感节点", desc: "Aero，诊断当前低空5G-A智联网通感一体化节点", icon: "📡" },
                { title: "适航法规调阅", desc: "Aero，解读中国民航局最新适航法规 CCAR-92 精神", icon: "⚖️" },
                { title: "遥视多维对准", desc: "Aero，执行多物理传感器及具身运动骨骼多维对齐", icon: "🤖" },
              ].map((item) => (
                <button
                  key={item.title}
                  onClick={() => handleUserCommand(item.desc)}
                  disabled={avatarState === 'thinking' || avatarState === 'speaking'}
                  className="p-3 bg-[#05070a]/60 border border-slate-850 hover:bg-[#00D1FF]/5 hover:border-[#00D1FF]/30 hover:text-white rounded-xl text-left transition-all cursor-pointer group active:scale-95 disabled:opacity-40"
                >
                  <p className="text-xs font-bold text-slate-200 group-hover:text-[#00D1FF] flex items-center">
                    <span className="mr-1.5 text-sm">{item.icon}</span>
                    {item.title}
                  </p>
                  <p className="text-[9px] text-slate-500 truncate mt-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Interaction Logs */}
          <div className="flex-1 bg-slate-1000/10 border border-slate-800 rounded-3xl p-6 flex flex-col overflow-hidden shadow-xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4 shrink-0">
              <h2 className="text-sm font-serif text-white tracking-wide flex items-center">
                <Terminal size={15} className="mr-2.5 text-[#C2A34F]" />
                神经控制审计序列 (Neural logs)
              </h2>
              <span className="text-[8px] uppercase text-slate-500 tracking-widest bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                LIP_SYNC_ACTIVE
              </span>
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-800 hover:scrollbar-thumb-slate-700 min-h-[140px]">
               <AnimatePresence initial={false}>
                 {interactionLogs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-25 text-center space-y-2">
                      <Radio size={24} className="animate-pulse text-slate-400" />
                      <p className="text-[9px] uppercase tracking-widest font-bold">没有日志流</p>
                    </div>
                 ) : (
                    interactionLogs.map((log, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={i + log.time}
                        className="flex space-x-3 text-[11px] group"
                      >
                         <span className="text-slate-600 font-mono shrink-0 pt-0.5 text-[9px]">[{log.time}]</span>
                         <div className="flex-grow flex flex-col">
                           <span className={log.type === 'user' ? 'text-[#00D1FF] font-bold uppercase text-[8px] tracking-widest mb-1' : 'text-[#C2A34F] font-bold uppercase text-[8px] tracking-widest mb-1'}>
                             {log.type === 'user' ? '► 上行电询 (USER)' : '▼ 具身控制下达 (Aero AI)'}
                           </span>
                           <p className="text-slate-300 leading-relaxed font-mono bg-slate-900/60 p-2.5 rounded-xl border border-slate-850 group-hover:border-slate-700 transition-colors">{log.msg}</p>
                         </div>
                      </motion.div>
                    ))
                 )}
               </AnimatePresence>
            </div>

            {/* Custom Terminal TextInput Input to bypass limited mic constraints */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!inputVal.trim() || avatarState === 'thinking') return;
                handleUserCommand(inputVal);
                setInputVal('');
              }}
              className="mt-4 pt-3 border-t border-slate-800/80 flex items-center space-x-2 shrink-0"
            >
              <input
                type="text"
                disabled={avatarState === 'thinking'}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="发送文字电波让 Aero 具身读取并大声说出..."
                className="flex-1 bg-slate-900/40 border border-slate-800 px-4 py-3 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00D1FF]/50 transition-all font-mono"
              />
              <button 
                type="submit"
                disabled={!inputVal.trim() || avatarState === 'thinking'}
                className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-slate-500 hover:text-[#00D1FF] transition-all cursor-pointer active:scale-95 disabled:opacity-40"
              >
                <Send size={14} />
              </button>
            </form>
          </div>

          {/* Multimodal Telemetry Metrics */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 shrink-0 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="p-1.5 bg-emerald-500/10 rounded-lg mr-2.5">
                 <Activity size={12} className="text-emerald-500" />
              </div>
              <h3 className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">具身链接度量 parameters</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                 <div className="flex justify-between text-[9px] uppercase text-slate-400 font-bold tracking-widest">
                   <span>语音对齐精度 (NLP)</span>
                   <span className="text-emerald-400 font-mono text-[10px]">{nlpConfidence}%</span>
                 </div>
                 <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div style={{ width: `${nlpConfidence}%` }} className="h-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                 </div>
              </div>
              <div className="space-y-1.5">
                 <div className="flex justify-between text-[9px] uppercase text-slate-400 font-bold tracking-widest">
                   <span>骨骼力反馈 (IK)</span>
                   <span className="text-[#00D1FF] font-mono text-[10px]">{ikPrecision}%</span>
                 </div>
                 <div className="h-1 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                   <div style={{ width: `${ikPrecision}%` }} className="h-full bg-[#00D1FF] shadow-[0_0_8px_#00D1FF]" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HexagonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <circle cx="12" cy="12" r="3.5" fill="currentColor" fillOpacity="0.15" />
    </svg>
  );
}
