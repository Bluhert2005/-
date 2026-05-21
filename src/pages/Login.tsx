import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Network, Fingerprint, ShieldAlert, Satellite, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [pilotId, setPilotId] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pilotId || !password) {
      toast.error('身份验证失败', {
        description: '请填入飞行员 ID 及访问授权码。',
      });
      return;
    }

    setIsAuthenticating(true);
    toast('正在初始化安全握手...', {
      description: '正在连接主 UTM 服务器节点 GZ-7。',
    });

    // Simulate network authentication delay
    setTimeout(() => {
      toast.success('访问权限已授予', {
        description: `欢迎回来，指挥官。`,
      });
      onLogin();
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#05070A] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Decorative Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[1px] border-[#00D1FF]/30 rounded-full animate-[spin_60s_linear_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-[1px] border-[#00D1FF]/20 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border-[1px] border-[#00D1FF]/20 border-dashed rounded-full animate-[spin_20s_linear_infinite]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-10 shadow-2xl">
          <div className="flex flex-col items-center justify-center mb-10">
            <div className="w-20 h-20 bg-[#00D1FF]/10 text-[#00D1FF] rounded-3xl flex items-center justify-center border border-[#00D1FF]/30 mb-6 shadow-[0_0_30px_rgba(0,209,255,0.2)]">
              <Satellite size={40} />
            </div>
            <h1 className="text-3xl font-serif text-white tracking-widest text-center">AeroLearn.</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold mt-3">低空经济未来学习中心系统</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase text-slate-500 tracking-widest font-bold flex items-center ml-1">
                <Fingerprint size={12} className="mr-2" />
                飞行员身份认证 (Pilot ID)
              </label>
              <input
                type="text"
                value={pilotId}
                onChange={(e) => setPilotId(e.target.value)}
                placeholder="例如: FH-4902-AL"
                disabled={isAuthenticating}
                className="w-full bg-[#030407]/80 border border-slate-800 rounded-2xl px-5 py-4 text-slate-200 placeholder-slate-700 focus:outline-none focus:border-[#00D1FF]/50 focus:ring-1 focus:ring-[#00D1FF]/50 transition-all font-mono text-sm disabled:opacity-50 shadow-inner"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-[10px] uppercase text-slate-500 tracking-widest font-bold flex items-center ml-1">
                <ShieldAlert size={12} className="mr-2" />
                系统访问授权码 (Clearance)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isAuthenticating}
                className="w-full bg-[#030407]/80 border border-slate-800 rounded-2xl px-5 py-4 text-slate-200 placeholder-slate-700 focus:outline-none focus:border-[#00D1FF]/50 focus:ring-1 focus:ring-[#00D1FF]/50 transition-all font-mono text-sm tracking-widest disabled:opacity-50 shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full mt-6 bg-[#00D1FF] hover:bg-[#00b8e6] text-[#05070A] py-4.5 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(0,209,255,0.4)] hover:shadow-[0_0_35px_rgba(0,209,255,0.6)] flex items-center justify-center disabled:opacity-75 disabled:cursor-wait active:scale-95"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-3" />
                  正在建立卫星链路...
                </>
              ) : (
                '登录作战中心'
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-800 flex justify-between items-center text-[9px] text-slate-600 uppercase tracking-widest font-bold">
            <div className="flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 flex-shrink-0 shadow-[0_0_5px_#10b981]"></span>
              加密连接已激活
            </div>
            <div className="flex items-center">
              <Network size={10} className="mr-2" />
              节点: GZ-7 Active
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
