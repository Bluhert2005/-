import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Shield, Star, Rocket, PieChart, Clock, Award, 
  Fingerprint, Settings, Lock, ChevronRight, ExternalLink, 
  History as HistoryIcon, Camera, Plus, Trash2, Check, X, Upload 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface ProfileProps {
  onNavigate?: (tab: 'security-settings' | 'profile') => void;
  userRole?: string;
}

interface InterestTag {
  tag: string;
  weight: number;
}

interface Trait {
  label: string;
  value: number;
}

interface StatItem {
  label: string;
  value: string;
}

interface ActivityLog {
  title: string;
  type: string;
  time: string;
  progress: number;
}

interface UserProfileData {
  name: string;
  id: string;
  rank: string;
  institution: string;
  registrationDate: string;
  clearance: string;
  avatarUrl: string; // Base64 data-url or static image
  avatarStyle: 'default' | 'cyan-glow' | 'amber-pulse' | 'amethyst-shield';
  interests: InterestTag[];
  traits: Trait[];
  stats: StatItem[];
  recentActivity: ActivityLog[];
}

export function Profile({ onNavigate, userRole }: ProfileProps) {
  // Try to load state from localStorage or fallback to robust initial low-altitude controller values
  const [profile, setProfile] = useState<UserProfileData>(() => {
    const saved = localStorage.getItem('user_persona_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse user profile, resetting to default.", e);
      }
    }
    return {
      name: "指挥官 龙",
      id: "FH-4902-AL",
      rank: userRole === 'admin' ? "企业培训管理员" : userRole === 'professional' ? "高级行业专家" : "高级无人机飞行员",
      institution: "低空经济研究院 / 联合技术部",
      registrationDate: "2023-11-12",
      clearance: userRole === 'admin' ? "6级 - 全局系统管理" : "4级 - 战略运营权限",
      avatarUrl: "", // Default to empty (renders standard vector user icon)
      avatarStyle: 'cyan-glow',
      interests: [
        { tag: "eVTOL 飞行控制", weight: 5 },
        { tag: "UTM 基础设施", weight: 3 },
        { tag: "城市空中物流", weight: 4 },
        { tag: "法规沙盒", weight: 2 },
        { tag: "氢能动力", weight: 3 },
        { tag: "自主避障", weight: 5 },
        { tag: "5G-A 感知", weight: 4 },
        { tag: "载人航线规划", weight: 2 }
      ],
      traits: [
        { label: "技术精通度", value: 92 },
        { label: "风险管理", value: 88 },
        { label: "导航逻辑", value: 95 },
        { label: "法规合规性", value: 100 }
      ],
      stats: [
        { label: "累计时长", value: "420.5h" },
        { label: "完成课程", value: "24" },
        { label: "获得证书", value: "12" },
        { label: "全网排名", value: "TOP 2%" }
      ],
      recentActivity: [
        { title: "完成深度课程: 无人机集群协同算法", type: "课程", time: "2 小时前", progress: 100 },
        { title: "通过模拟测试: 复杂气象自主着陆", type: "模拟", time: "昨天 14:30", progress: 85 },
        { title: "查阅技术规范: UTM 数据标准 v2.0", type: "文档", time: "2024-05-04", progress: 60 },
        { title: "访问知识图谱节点: 民用无人驾驶航空器登记管理规范", type: "检索", time: "2024-05-02", progress: 100 },
        { title: "完成课程: 垂直起降起降场选址标准", type: "课程", time: "2024-04-30", progress: 100 },
      ]
    };
  });

  // State to handle edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfileData>(profile);
  const [newTagText, setNewTagText] = useState('');
  const [newTagWeight, setNewTagWeight] = useState(3);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync edits if standard props change slightly
  useEffect(() => {
    if (!isEditing) {
      setEditedProfile(profile);
    }
  }, [profile, isEditing]);

  // Persist to local storage
  const handleSave = () => {
    setProfile(editedProfile);
    localStorage.setItem('user_persona_v2', JSON.stringify(editedProfile));
    setIsEditing(false);
    toast.success("指挥官档案同步成功！", {
      description: "所有修改内容已安全上传并写入本地系统存储。"
    });
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
    toast.info("取消档案修改", {
      description: "草稿已安全回滚至上一层校验节点。"
    });
  };

  // Avatar upload handler
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        toast.error("照片容量超限", {
          description: "请上传小于 1.5MB 的高清图片，以防止底层空管系统信号拥塞。"
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedProfile(prev => ({
          ...prev,
          avatarUrl: reader.result as string
        }));
        toast.success("高清个人头像加载完毕", {
          description: "头像已转换并暂存在局方高保真寄存器中。"
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedProfile(prev => ({
          ...prev,
          avatarUrl: reader.result as string
        }));
        toast.success("拖拽上传头像成功！");
      };
      reader.readAsDataURL(file);
    }
  };

  // Add tag
  const handleAddTag = () => {
    if (!newTagText.trim()) return;
    if (editedProfile.interests.some(t => t.tag === newTagText.trim())) {
      toast.warning("标签已存在", { description: "请勿重复添加同一技术集群标签。" });
      return;
    }
    setEditedProfile(prev => ({
      ...prev,
      interests: [...prev.interests, { tag: newTagText.trim(), weight: newTagWeight }]
    }));
    setNewTagText('');
    toast.success(`已添加标签 #${newTagText}`);
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setEditedProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(item => item.tag !== tagToRemove)
    }));
    toast.info(`已移除学术标签: ${tagToRemove}`);
  };

  // Get active avatar outline based on Style selected
  const getAvatarGradient = (style: typeof profile.avatarStyle) => {
    switch (style) {
      case 'cyan-glow':
        return 'from-[#00D1FF] to-blue-500 shadow-[0_0_25px_rgba(0,209,255,0.4)]';
      case 'amber-pulse':
        return 'from-amber-400 to-orange-500 shadow-[0_0_25px_rgba(245,158,11,0.4)]';
      case 'amethyst-shield':
        return 'from-purple-500 to-indigo-600 shadow-[0_0_25px_rgba(139,92,246,0.3)]';
      case 'default':
      default:
        return 'from-slate-700 to-slate-500 shadow-lg';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 font-sans">
      
      {/* Dynamic Sub-header Panel */}
      <div className="flex border-b border-slate-800 pb-4 shrink-0 justify-between items-end flex-wrap gap-4">
        <div className="flex flex-col text-left">
          <div className="text-[#00D1FF] font-serif italic mb-2 tracking-widest text-xs uppercase">Pilot Bio / 指挥官画像</div>
          <h1 className="text-3xl font-medium text-white tracking-wide">
            {isEditing ? "编辑指挥档案 (Edits Desk)" : "个人指挥中心 (Personal Hub)"}
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl">
            {isEditing ? "正在进入指令修改环境。您可以上传新头像、微调核心度量与技术指标标签。" : "查看您的全量学习数据、技能图谱映射及其在集群系统中的权限状态。"}
          </p>
        </div>
        <div className="flex gap-3 mb-1">
          {isEditing ? (
            <>
              <button 
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-850 transition-all cursor-pointer"
              >
                <X size={14} /> 取消
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-[#05070A] rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <Check size={14} /> 保存修改
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00D1FF] to-blue-600 text-[#05070A] font-bold rounded-xl text-xs hover:shadow-[0_0_20px_rgba(0,209,255,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Settings size={14} /> 编辑个人资料
              </button>
              <button 
                onClick={() => onNavigate?.('security-settings')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-400 hover:bg-blue-500/20 transition-all"
              >
                <Lock size={14} /> 安全设置
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        
        {/* Left column: ID Badge card */}
        <div className="space-y-6">
          
          {/* Main Visual Badge */}
          <div className="bg-[#05070A]/80 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
              <Fingerprint size={160} />
            </div>

            {/* Glowing active header ribbon */}
            <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${isEditing ? 'from-amber-400 to-orange-500' : 'from-[#00D1FF] to-blue-600'}`} />

            <div className="flex flex-col items-center text-center">
              
              {/* Interactive Avatar Container */}
              <div className="relative group/avatar">
                <div className={cn(
                  "w-28 h-28 rounded-3xl bg-gradient-to-tr p-0.5 mb-6 transition-all duration-500 relative",
                  getAvatarGradient(isEditing ? editedProfile.avatarStyle : profile.avatarStyle)
                )}>
                  {/* File Upload zone or hover trigger in edit mode */}
                  <div 
                    onClick={isEditing ? triggerFileUpload : undefined}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={cn(
                      "w-full h-full bg-[#05070A] rounded-[22px] flex items-center justify-center overflow-hidden relative",
                      isEditing ? "cursor-pointer group-hover/avatar:opacity-90 select-none" : ""
                    )}
                  >
                    {isEditing && (
                      <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity z-15 p-2">
                        <Upload size={20} className="text-[#00D1FF] mb-1 animate-bounce" />
                        <span className="text-[8px] text-[#00D1FF] uppercase tracking-widest font-black leading-tight">点击上传</span>
                        <span className="text-[7px] text-slate-500 uppercase">或拖放至此</span>
                      </div>
                    )}

                    {/* Display photo selection (User uploaded base64 / preset vs fallback User Icon) */}
                    {(isEditing ? editedProfile.avatarUrl : profile.avatarUrl) ? (
                      <img 
                        src={isEditing ? editedProfile.avatarUrl : profile.avatarUrl} 
                        alt="Pilot Photo Avatar"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-[22px]"
                      />
                    ) : (
                      <div className="text-slate-500 group-hover:text-slate-300 transition-colors flex flex-col items-center">
                        <User size={48} className={isEditing ? "text-amber-500" : "text-[#00D1FF]"} />
                      </div>
                    )}
                  </div>
                  
                  {isEditing && (
                    <button 
                      onClick={triggerFileUpload}
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer active:scale-90"
                      title="上传自定义照片"
                    >
                      <Camera size={14} />
                    </button>
                  )}
                </div>

                {/* Secret input for upload file */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleAvatarFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Avatar Preset style choices (Only visible in edit mode!) */}
              {isEditing && (
                <div className="w-full mb-6 p-3.5 bg-slate-950/60 border border-slate-850 rounded-2xl flex flex-col space-y-2">
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold self-start">炫彩霓虹边框选择：</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { key: 'default', color: 'bg-slate-600', label: '无光' },
                      { key: 'cyan-glow', color: 'bg-cyan-400', label: '天青' },
                      { key: 'amber-pulse', color: 'bg-amber-500', label: '琥珀' },
                      { key: 'amethyst-shield', color: 'bg-indigo-500', label: '幽兰' }
                    ].map(preset => (
                      <button
                        key={preset.key}
                        onClick={() => setEditedProfile(prev => ({ ...prev, avatarStyle: preset.key as any }))}
                        className={cn(
                          "py-1.5 rounded-lg border text-[8px] font-bold uppercase transition-all flex flex-col items-center gap-1 cursor-pointer",
                          editedProfile.avatarStyle === preset.key 
                            ? "border-amber-400 text-white bg-slate-900" 
                            : "border-slate-800 text-slate-500 hover:border-slate-700 bg-transparent"
                        )}
                      >
                        <span className={cn("w-2 h-2 rounded-full", preset.color)} />
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Identity Editable Fields */}
              <div className="w-full space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block mb-1">飞行员姓名 / 称号</label>
                      <input
                        type="text"
                        value={editedProfile.name}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                        placeholder="例：指挥官 龙"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block mb-1">飞行员唯一 ID 标识</label>
                      <input
                        type="text"
                        value={editedProfile.id}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, id: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white/80 focus:outline-none focus:border-amber-400 font-mono"
                        placeholder="例：FH-4902-AL"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block mb-1">技术职级与审定头衔</label>
                      <input
                        type="text"
                        value={editedProfile.rank}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, rank: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white/80 focus:outline-none focus:border-amber-400"
                        placeholder="例：企业培训管理员"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-serif text-white mb-1 tracking-wide">{profile.name}</h2>
                    <p className="text-xs text-slate-500 uppercase tracking-[0.2em] mb-4 font-mono font-bold">{profile.id}</p>
                    
                    <div className="flex flex-col gap-2 w-full">
                      <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-xl flex items-center justify-center">
                        <Shield size={10} className="mr-2 text-blue-400" /> {profile.rank}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-2 font-medium bg-slate-900/20 py-2 border border-slate-850 rounded-xl px-3 inline-block">
                        {profile.institution}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Static Meta Attributes */}
            <div className="space-y-4 pt-8 mt-8 border-t border-slate-800/50">
              <div className="flex flex-col space-y-3.5">
                {isEditing ? (
                  <>
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block mb-1">归属学术/民航机构</label>
                      <input
                        type="text"
                        value={editedProfile.institution}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, institution: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white/80 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block mb-1">空域准入权限</label>
                        <input
                          type="text"
                          value={editedProfile.clearance}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, clearance: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white/85 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block mb-1">系统注册日期</label>
                        <input
                          type="text"
                          value={editedProfile.registrationDate}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, registrationDate: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white/85 font-mono"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 uppercase tracking-widest font-bold">空域准入权限</span>
                      <span className="text-white font-mono font-bold bg-[#00D1FF]/5 px-2 py-0.5 rounded border border-[#00D1FF]/10 text-[#00D1FF]">
                        {profile.clearance}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 uppercase tracking-widest font-bold">系统注册时间</span>
                      <span className="text-slate-400 font-mono">{profile.registrationDate}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Interest Tags Cluster (Always Highly Editable) */}
          <div className="bg-[#05070A]/80 border border-slate-800 rounded-3xl p-8 shadow-xl">
             <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold mb-6">学者兴趣标签云 (Trait Cloud)</h3>
             
             {isEditing && (
               <div className="mb-6 p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col space-y-3">
                  <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">新增技术细分星群：</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTagText}
                      onChange={(e) => setNewTagText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="例: 通感融合基建"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] text-slate-500 font-mono">标签视觉权重等级 (1-5):</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map(w => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setNewTagWeight(w)}
                          className={cn(
                            "w-5 h-5 rounded text-[9px] font-bold font-mono transition-colors",
                            newTagWeight === w 
                              ? "bg-[#00D1FF] text-[#05070A]" 
                              : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700"
                          )}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
               </div>
             )}

             <div className="flex flex-wrap gap-x-4 gap-y-3.5 justify-center items-center">
               {(isEditing ? editedProfile.interests : profile.interests).map((interest, i) => (
                 <div 
                   key={interest.tag + i} 
                   className="group/tag inline-flex items-center gap-1.5 transition-all relative"
                 >
                   <span 
                    className={cn(
                      "cursor-pointer transition-all hover:text-[#00D1FF]",
                      interest.weight === 5 ? "text-lg text-white font-bold" :
                      interest.weight === 4 ? "text-base text-slate-200" :
                      interest.weight === 3 ? "text-sm text-slate-400" :
                      "text-xs text-slate-500 uppercase tracking-widest"
                    )}
                   >
                     {interest.tag}
                   </span>
                   
                   {isEditing && (
                     <button
                       type="button"
                       onClick={() => handleRemoveTag(interest.tag)}
                       className="w-4 h-4 rounded-full bg-red-900/80 border border-red-700 flex items-center justify-center text-white scale-0 group-hover/tag:scale-100 opacity-0 group-hover/tag:opacity-100 transition-all cursor-pointer absolute -top-1 -right-2"
                       title="移除该标签"
                     >
                       <X size={8} />
                     </button>
                   )}
                 </div>
               ))}
             </div>
             
             {!isEditing && (
               <p className="text-[9px] text-slate-600 italic text-center mt-6">
                 温馨提示：以上标签将用作 AI 导师、知识图谱深度对齐参考点。
               </p>
             )}
          </div>
        </div>

        {/* Right Column: Dynamic Statistics & Slider Ratings */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Flight Statistics Panel (Editable values!) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {(isEditing ? editedProfile.stats : profile.stats).map((item, i) => (
              <div 
                key={i} 
                className="bg-slate-900/30 border border-slate-800 p-6 rounded-3xl flex flex-col items-center justify-center hover:bg-slate-900/50 transition-colors relative"
              >
                {/* Visual Icon matching category */}
                <div className={cn(
                  "mb-3",
                  i === 0 ? "text-blue-500" : 
                  i === 1 ? "text-emerald-500" : 
                  i === 2 ? "text-[#00D1FF]" : "text-[#C2A34F]"
                )}>
                  {i === 0 && <Clock size={18} />}
                  {i === 1 && <Rocket size={18} />}
                  {i === 2 && <Award size={18} />}
                  {i === 3 && <Star size={18} />}
                </div>

                <p className="text-[9px] uppercase text-slate-500 tracking-widest mb-2 font-black">
                  {item.label}
                </p>

                {isEditing ? (
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => {
                      const updatedValue = e.target.value;
                      setEditedProfile(prev => {
                        const nextStats = [...prev.stats];
                        nextStats[i] = { ...nextStats[i], value: updatedValue };
                        return { ...prev, stats: nextStats };
                      });
                    }}
                    className="w-full text-center bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                ) : (
                  <p className="text-xl font-mono text-white font-bold tracking-tighter">
                    {item.value}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Matrix sliders area */}
          <div className="bg-[#05070A]/80 border border-slate-800 rounded-3xl p-8 shadow-xl relative">
             <div className="absolute top-6 right-8 text-[8px] uppercase font-bold tracking-widest font-mono text-slate-600">
               {isEditing ? 'DRAFT_FORM_SLIDERS' : 'INTEGRITY_READONLY'}
             </div>

             <h3 className="text-lg font-serif text-white mb-8 flex items-center">
              <PieChart size={18} className="mr-3 text-[#00D1FF]" />
              多维技术与职责能力配比 (Capability Matrix)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {(isEditing ? editedProfile.traits : profile.traits).map((trait, i) => (
                <div key={i} className="space-y-3.5">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] uppercase text-slate-400 tracking-widest font-black font-mono">
                      {trait.label}
                    </span>
                    <span className={cn("text-xs font-mono font-bold", isEditing ? 'text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20' : 'text-[#00D1FF]')}>
                      {trait.value}%
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center space-x-3">
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={trait.value}
                        onChange={(e) => {
                          const valStr = e.target.value;
                          setEditedProfile(prev => {
                            const nextTraits = [...prev.traits];
                            nextTraits[i] = { ...nextTraits[i], value: parseInt(valStr) || 0 };
                            return { ...prev, traits: nextTraits };
                          });
                        }}
                        className="flex-1 accent-amber-500 h-1 bg-slate-900 rounded-lg cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${trait.value}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full bg-gradient-to-r from-blue-600 to-[#00D1FF]"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {isEditing && (
              <p className="text-[10px] text-zinc-500 italic mt-6 leading-relaxed">
                * 调校能力拖动条可更新您在虚拟审定终端中的测试基准值，同步实时技能曲线。
              </p>
            )}
          </div>

          {/* Recent Activity Log (Always clean and informative) */}
          <div className="bg-[#05070A]/80 border border-slate-800 rounded-3xl p-8 shadow-xl">
             <div className="flex items-center justify-between mb-8 flex-wrap gap-2">
               <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center">
                 <HistoryIcon size={16} className="mr-3 text-slate-500" />
                 近期学习与飞试验证记录 (Verification Logs)
               </h3>
               <button 
                onClick={() => toast("飞行测试记录加载成功", { description: "历时 182 级自控评估验证程序一切正常。" })}
                className="text-[10px] uppercase tracking-widest text-[#00D1FF] hover:underline cursor-pointer"
               >
                 刷新记录
               </button>
             </div>

             <div className="space-y-4">
               {profile.recentActivity.map((log, i) => (
                 <div key={i} className="group flex items-center justify-between p-4 bg-slate-900/20 hover:bg-[#05070A]/60 border border-slate-850 rounded-2xl hover:border-slate-700 transition-all">
                   <div className="flex items-center gap-4 text-left">
                     <div className={cn(
                       "w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]",
                       log.type === '课程' ? "bg-blue-500 shadow-blue-500/40" : 
                       log.type === '模拟' ? "bg-emerald-500 shadow-emerald-500/40" :
                       log.type === '检索' ? "bg-purple-500 shadow-purple-500/40" : "bg-slate-500"
                     )} />
                     <div className="space-y-1">
                       <h4 className="text-xs text-slate-200 group-hover:text-[#00D1FF] transition-colors">{log.title}</h4>
                       <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                         <span className="uppercase tracking-widest font-black">{log.type}</span>
                         <span>{log.time}</span>
                       </div>
                     </div>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="hidden md:block w-32 h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                        <div className="h-full bg-[#00D1FF]" style={{ width: `${log.progress}%` }} />
                      </div>
                      <ChevronRight size={15} className="text-slate-700 group-hover:text-[#00D1FF] transition-colors" />
                   </div>
                 </div>
               ))}
             </div>
          </div>

          {/* Secure E-Certifications Hub */}
          <div className="flex flex-col md:flex-row gap-6">
            <button 
              onClick={() => toast.success("正在生成加密电子学术证书(PDF)", { description: "由CAAC/低空协同院联合数字公钥签名中..." })}
              className="flex-1 p-6 bg-slate-900/30 border border-slate-800 rounded-3xl flex items-center justify-between hover:bg-slate-900/60 hover:border-slate-700 transition-colors group text-left cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#C2A34F]/10 flex items-center justify-center text-[#C2A34F] border border-[#C2A34F]/25 shadow-inner">
                  <Award size={22} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">我的航空研究学分与电子证书群</h4>
                  <p className="text-[10px] text-slate-500 mt-1">查看与导出在平台课程与 AI 导师校验通过的 12 项审定资格认证书</p>
                </div>
              </div>
              <ExternalLink size={16} className="text-slate-600 group-hover:text-white transition-all group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
