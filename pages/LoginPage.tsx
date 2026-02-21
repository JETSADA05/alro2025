
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';
import { LoginHistoryItem, Member } from '../types';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const logoUrl = localStorage.getItem('alro_logo_url') || "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Emblem_of_Thailand.svg/1200px-Emblem_of_Thailand.svg.png";

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // จำลองการตรวจสอบสิทธิ์
    setTimeout(() => {
      const input = identifier.trim();
      
      // 1. ตรวจสอบสิทธิ์แอดมิน (Username)
      const admin1 = input === 'phuwit' && password === 'tum';
      const admin2 = input === 'aniwat' && password === 'taem';
      
      // 2. ตรวจสอบสมาชิกทั่วไปจากฐานข้อมูลจริงใน localStorage
      const savedMembers: Member[] = JSON.parse(localStorage.getItem('alro_members') || '[]');
      const registeredMember = savedMembers.find(m => m.phone === input && m.password === password);
      
      // จำลองสมาชิก Hardcoded เดิม (เผื่อไว้ทดสอบ)
      const isMockMember = input === '0812345678' && password === '123456';

      if (admin1 || admin2) {
        const displayName = admin1 ? 'แอดมิน: ภูวิศ' : 'แอดมิน: อนิวัต';
        localStorage.setItem('alro_is_admin', 'true');
        localStorage.setItem('alro_user_display', displayName);
        
        // บันทึกประวัติ
        const newEntry: LoginHistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          phone: input,
          timestamp: new Date().toISOString(),
        };
        const history = JSON.parse(localStorage.getItem('alro_login_history') || '[]');
        localStorage.setItem('alro_login_history', JSON.stringify([newEntry, ...history].slice(0, 100)));

        navigate('/admin');
      } else if (registeredMember || isMockMember) {
        const name = registeredMember ? registeredMember.fullName : 'คุณสมชาย รักดี';
        localStorage.setItem('alro_is_admin', 'false');
        localStorage.setItem('alro_user_display', name);
        localStorage.setItem('alro_user_phone', input);
        
        navigate('/');
      } else {
        setError('ชื่อผู้ใช้งาน/เบอร์โทร หรือรหัสผ่านไม่ถูกต้อง');
        triggerShake();
        setIsLoading(false);
      }
    }, 800);
  };

  const isFormValid = identifier.length > 0 && password.length > 0;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-[#f8fafc] font-['Prompt']">
      <div className={`w-full max-w-[420px] bg-white rounded-[60px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden transition-transform duration-500 border border-slate-50 ${isShaking ? 'animate-shake' : 'animate-scaleUp'}`}>
        
        {/* Header Section - Matched to Image */}
        <div className="bg-[#007a4d] text-white pt-16 pb-12 text-center flex flex-col items-center relative overflow-hidden">
          <div className="bg-white p-4 rounded-full w-28 h-28 mb-6 shadow-2xl flex items-center justify-center relative z-10 border-4 border-emerald-600/20">
             <img src={logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-4xl font-black mb-1 relative z-10 tracking-tight">เข้าสู่ระบบ</h1>
          <p className="text-[11px] opacity-80 relative z-10 font-black uppercase tracking-[0.2em]">ALRO MANAGEMENT SYSTEM</p>
        </div>

        {/* Form Section */}
        <div className="p-12 space-y-8">
          {error && (
            <div className="flex items-center gap-4 text-[15px] text-[#ef4444] font-bold bg-[#fff1f2] py-5 px-8 rounded-[30px] border border-[#fecaca] animate-fadeIn">
              <ShieldAlert size={22} className="flex-shrink-0" /> 
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-7">
            {/* Identifier Input (Username or Phone) */}
            <div className="space-y-3">
              <label className="block text-[13px] font-black text-[#cbd5e1] uppercase tracking-[0.1em] ml-4">ชื่อผู้ใช้งาน หรือ เบอร์โทรศัพท์</label>
              <div className="relative group">
                 <div className="absolute inset-y-0 left-7 flex items-center text-slate-300 group-focus-within:text-[#007a4d] transition-colors">
                    <User size={22} />
                 </div>
                 <input 
                  type="text" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="0000000000" 
                  className="w-full pl-16 pr-8 py-5 bg-[#f4f7fa] border-none rounded-[30px] focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-slate-700 font-bold text-lg placeholder:font-bold placeholder:text-slate-200"
                  required
                 />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-3">
              <label className="block text-[13px] font-black text-[#cbd5e1] uppercase tracking-[0.1em] ml-4">รหัสผ่าน</label>
              <div className="relative group">
                 <div className="absolute inset-y-0 left-7 flex items-center text-slate-300 group-focus-within:text-[#007a4d] transition-colors">
                    <Lock size={22} />
                 </div>
                 <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="······" 
                  className="w-full pl-16 pr-8 py-5 bg-[#f4f7fa] border-none rounded-[30px] focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-slate-700 font-bold text-lg placeholder:font-black placeholder:text-slate-200"
                  required
                 />
              </div>
            </div>

            {/* Login Button */}
            <button 
              type="submit"
              disabled={isLoading || !isFormValid}
              className={`w-full py-6 rounded-[30px] font-black text-xl transition-all active:scale-[0.97] flex items-center justify-center gap-4 ${
                !isFormValid || isLoading
                ? 'bg-[#f1f5f9] text-[#cbd5e1] cursor-not-allowed' 
                : 'bg-[#007a4d] text-white shadow-[0_15px_30px_rgba(0,122,77,0.2)] hover:bg-[#00643d]'
              }`}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <div className="flex items-center gap-3">
                  <span>เข้าสู่ระบบ</span>
                  <ArrowRight size={24} />
                </div>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-8 border-t border-slate-50 flex flex-col gap-2">
             <p className="text-[14px] text-slate-400 font-bold">
               ยังไม่มีบัญชีสมาชิก? 
               <Link to="/register" className="text-[#007a4d] font-black hover:underline ml-2">ลงทะเบียนใช้งาน</Link>
             </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-scaleUp { animation: scaleUp 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default LoginPage;
