import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Key, Smartphone, Mail, Eye, EyeOff, CheckCircle2, History as HistoryIcon, XCircle, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export function SecuritySettings() {
  const [showPassword, setShowPassword] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  const loginHistory = [
    { id: 1, ip: '192.168.1.105', device: 'Chrome / MacOS', time: '2024-05-06 14:20:11', status: '当前会话' },
    { id: 2, ip: '110.24.56.2', device: 'Safari / iPhone 15', time: '2024-05-05 09:12:45', status: '已注销' },
    { id: 3, ip: '223.1.5.178', device: 'AeroLearn Desktop / Windows', time: '2024-05-03 21:05:32', status: '已注销' },
    { id: 4, ip: '14.20.112.5', device: 'Edge / Ubuntu', time: '2024-04-30 15:40:00', status: '已注销' },
    { id: 5, ip: '42.12.8.99', device: 'Unknown Unit / GZ-7 Node', time: '2024-04-28 11:22:15', status: '已注销' },
  ];

  const handleLogoutAll = () => {
    toast.success('已注销所有其他设备的会话链接', {
      description: '所有远程节点已同步切断。'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex border-b border-slate-800 pb-4 shrink-0 justify-between items-end">
        <div className="flex flex-col">
          <div className="text-[#00D1FF] font-serif italic mb-2 tracking-widest text-xs uppercase">Security Protocol / 安全协议</div>
          <h1 className="text-3xl font-medium text-white tracking-wide">账号安全管理 (Security Hub)</h1>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl">
            配置您的生物识别、多因素认证与密钥管理，确保您的空域指挥权安全受控。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Primary Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Password Section */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                <Key size={20} />
              </div>
              <h3 className="text-xl font-bold text-white">修改访问密钥 (Password)</h3>
            </div>

            <div className="space-y-6 max-w-md">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">原密钥 (Current Password)</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    className="w-full bg-[#05070A] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00D1FF]/50 transition-colors"
                    placeholder="请输入原密码"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">新密钥 (New Password)</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    className="w-full bg-[#05070A] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00D1FF]/50 transition-colors"
                    placeholder="至少8位，含大小写字母与数字"
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="flex gap-1 mt-2">
                  <div className="h-1 flex-1 bg-emerald-500 rounded-full" />
                  <div className="h-1 flex-1 bg-emerald-500 rounded-full" />
                  <div className="h-1 flex-1 bg-slate-800 rounded-full" />
                  <div className="h-1 flex-1 bg-slate-800 rounded-full" />
                </div>
                <p className="text-[10px] text-slate-500 italic mt-1 text-right">强度级别: 中等</p>
              </div>

              <button className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-xl hover:scale-105 transition-transform active:scale-95">
                确认更新密钥
              </button>
            </div>
          </div>

          {/* MFA Section */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                  <Shield size={20} />
                </div>
                <h3 className="text-xl font-bold text-white">多因素认证 (MFA)</h3>
              </div>
              <div 
                onClick={() => setMfaEnabled(!mfaEnabled)}
                className={cn(
                  "w-12 h-6 rounded-full relative cursor-pointer transition-colors p-1",
                  mfaEnabled ? "bg-blue-500" : "bg-slate-800"
                )}
              >
                <div className={cn(
                  "w-4 h-4 bg-white rounded-full transition-transform",
                  mfaEnabled ? "translate-x-6" : "translate-x-0"
                )} />
              </div>
            </div>

            <p className="text-sm text-slate-400 mb-8 max-w-xl">
              启用 TOTP 认证（如 Google Authenticator），即使密码泄露，也能通过动态验证码提供双重保护。企业管理账户建议强制开启。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 border border-slate-800 rounded-2xl bg-slate-900/20 flex items-center justify-between group hover:border-[#00D1FF]/50 transition-colors">
                <div className="flex items-center gap-4">
                  <Smartphone className="text-slate-500" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">手机动态码</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">未绑定</p>
                  </div>
                </div>
                <button className="text-[10px] uppercase tracking-widest text-[#00D1FF] font-bold">去绑定</button>
              </div>

              <div className="p-5 border border-slate-800 rounded-2xl bg-slate-900/20 flex items-center justify-between group hover:border-emerald-500/50 transition-colors">
                <div className="flex items-center gap-4">
                  <Mail className="text-emerald-500" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">邮箱校验</h4>
                    <p className="text-[10px] text-emerald-500/70 mt-0.5">已激活: lo***@gm**.com</p>
                  </div>
                </div>
                <button className="text-[10px] uppercase tracking-widest text-slate-500 hover:text-white font-bold">解绑</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: History & Stats */}
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <HistoryIcon size={100} />
            </div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">近期登录记录</h3>
              <button 
                onClick={handleLogoutAll}
                className="text-[10px] uppercase text-red-400 hover:text-white transition-colors tracking-tighter"
              >
                注销其他设备
              </button>
            </div>

            <div className="space-y-4 relative z-10">
              {loginHistory.map((item) => (
                <div key={item.id} className="flex justify-between items-start pt-4 border-t border-slate-800/50 first:border-0 first:pt-0">
                  <div className="space-y-1">
                    <p className="text-[11px] font-mono text-white">{item.ip}</p>
                    <p className="text-[10px] text-slate-500">{item.device}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-mono">{item.time}</p>
                    <span className={cn(
                      "text-[8px] uppercase font-bold tracking-widest inline-block px-1.5 py-0.5 rounded-md mt-1",
                      item.status === '当前会话' ? "bg-blue-500/10 text-blue-400" : "bg-slate-800 text-slate-600"
                    )}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-3xl p-8 shadow-xl">
             <Shield className="text-[#00D1FF] mb-4" size={32} />
             <h4 className="text-lg font-bold text-white mb-2 underline decoration-[#00D1FF]/50 underline-offset-4">安全防御报告</h4>
             <p className="text-sm text-slate-400 leading-relaxed">
               系统已在过去 30 天内为您抵挡了 <span className="text-white font-bold">12 次</span> 针对 API 端的暴力破解尝试。您的双重认证保护已将账户安全指数提升至 <span className="text-emerald-400 font-bold">98%</span>。
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
