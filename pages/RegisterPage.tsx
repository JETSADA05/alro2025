
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Phone, ArrowLeft, CheckCircle2, UserPlus, CreditCard } from 'lucide-react';
import { Member } from '../types';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    idCard: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const logoUrl = localStorage.getItem('alro_logo_url') || "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Emblem_of_Thailand.svg/1200px-Emblem_of_Thailand.svg.png";

  const handleIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // รับเฉพาะตัวเลข
    if (val.length <= 13) {
      setFormData({ ...formData, idCard: val });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // รับเฉพาะตัวเลข
    if (val.length <= 10) {
      setFormData({ ...formData, phone: val });
    }
  };

  const isIdCardValid = formData.idCard.length === 13;
  const isPhoneValid = formData.phone.length === 10;
  const isPasswordMatch = formData.password.length > 0 && formData.password === formData.confirmPassword;
  const canRegister = formData.fullName.length > 0 && isIdCardValid && isPhoneValid && isPasswordMatch;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isIdCardValid) {
      setError('เลขบัตรประชาชนต้องมี 13 หลัก');
      return;
    }
    if (!isPhoneValid) {
      setError('เบอร์โทรศัพท์ต้องมี 10 หลัก');
      return;
    }
    if (!isPasswordMatch) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    // บันทึกข้อมูลสมาชิกลง localStorage พร้อมรหัสผ่าน
    const newMember: Member = {
      id: Math.random().toString(36).substr(2, 9),
      fullName: formData.fullName,
      idCard: formData.idCard,
      phone: formData.phone,
      password: formData.password, // บันทึกรหัสผ่านลงไปด้วย
      registeredAt: new Date().toISOString(),
      status: 'active'
    };

    const existingMembers = JSON.parse(localStorage.getItem('alro_members') || '[]');
    localStorage.setItem('alro_members', JSON.stringify([newMember, ...existingMembers]));

    alert('ลงทะเบียนสำเร็จ! คุณสามารถเข้าสู่ระบบด้วยเบอร์โทรศัพท์และรหัสผ่านที่ตั้งไว้');
    navigate('/login');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 animate-scaleUp">
        {/* Header */}
        <div className="bg-[#007a4d] text-white p-10 text-center flex flex-col items-center relative">
          <Link to="/login" className="absolute top-6 left-6 p-2 hover:bg-white/10 rounded-full transition-all" title="กลับไปหน้าเข้าสู่ระบบ">
            <ArrowLeft size={20} />
          </Link>
          <div className="bg-white p-2 rounded-full w-14 h-14 mb-4 shadow-lg flex items-center justify-center">
             <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
          </div>
          <h1 className="text-2xl font-bold mb-1">สมัครสมาชิกใหม่</h1>
          <p className="text-[10px] opacity-70">กรอกข้อมูลเพื่อเริ่มต้นใช้งานระบบจองคิว</p>
        </div>

        {/* Form Content */}
        <div className="p-8">
          <form className="space-y-5" onSubmit={handleRegister}>
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">ชื่อ-นามสกุล</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                    <User size={18} />
                 </div>
                 <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  placeholder="ระบุชื่อจริง-นามสกุล" 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#007a4d]/20 transition-all text-gray-700 font-medium"
                  required
                 />
              </div>
            </div>

            {/* ID Card */}
            <div>
              <div className="flex justify-between items-end mb-2 ml-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">เลขบัตรประชาชน</label>
                {formData.idCard.length > 0 && (
                  <span className={`text-[9px] font-bold ${isIdCardValid ? 'text-emerald-500' : 'text-orange-400'}`}>
                    {formData.idCard.length}/13 หลัก
                  </span>
                )}
              </div>
              <div className="relative">
                 <div className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                    <CreditCard size={18} />
                 </div>
                 <input 
                  type="text" 
                  inputMode="numeric"
                  value={formData.idCard}
                  onChange={handleIdCardChange}
                  placeholder="X-XXXX-XXXXX-XX-X" 
                  className={`w-full pl-12 pr-10 py-4 bg-gray-50 border rounded-2xl focus:outline-none transition-all text-gray-700 font-medium ${isIdCardValid ? 'border-emerald-500/30 ring-2 ring-emerald-500/5' : 'border-gray-100 focus:ring-2 focus:ring-[#007a4d]/10'}`}
                  required
                 />
                 {isIdCardValid && (
                   <div className="absolute inset-y-0 right-4 flex items-center text-emerald-500">
                     <CheckCircle2 size={18} />
                   </div>
                 )}
              </div>
            </div>

            {/* Phone */}
            <div>
              <div className="flex justify-between items-end mb-2 ml-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">เบอร์โทรศัพท์</label>
                {formData.phone.length > 0 && (
                  <span className={`text-[9px] font-bold ${isPhoneValid ? 'text-emerald-500' : 'text-orange-400'}`}>
                    {formData.phone.length}/10 หลัก
                  </span>
                )}
              </div>
              <div className="relative">
                 <div className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                    <Phone size={18} />
                 </div>
                 <input 
                  type="text" 
                  inputMode="numeric"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="08X-XXX-XXXX" 
                  className={`w-full pl-12 pr-10 py-4 bg-gray-50 border rounded-2xl focus:outline-none transition-all text-gray-700 font-medium ${isPhoneValid ? 'border-emerald-500/30 ring-2 ring-emerald-500/5' : 'border-gray-100 focus:ring-2 focus:ring-[#007a4d]/10'}`}
                  required
                 />
                 {isPhoneValid && (
                   <div className="absolute inset-y-0 right-4 flex items-center text-emerald-500">
                     <CheckCircle2 size={18} />
                   </div>
                 )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">กำหนดรหัสผ่าน</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                    <Lock size={18} />
                 </div>
                 <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="รหัสผ่าน" 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#007a4d]/20 transition-all text-gray-700 font-medium"
                  required
                 />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">ยืนยันรหัสผ่าน</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                    <Lock size={18} />
                 </div>
                 <input 
                  type="password" 
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="ระบุรหัสผ่านอีกครั้ง" 
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl focus:outline-none transition-all text-gray-700 font-medium ${formData.confirmPassword && !isPasswordMatch ? 'border-red-300' : 'border-gray-100 focus:ring-2 focus:ring-[#007a4d]/20'}`}
                  required
                 />
              </div>
            </div>

            {error && <p className="text-red-500 text-[10px] font-bold text-center">{error}</p>}

            <button 
              type="submit"
              disabled={!canRegister}
              className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                canRegister 
                ? 'bg-[#007a4d] text-white shadow-emerald-700/20 hover:bg-[#00643d] hover:shadow-xl' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              <UserPlus size={18} /> ลงทะเบียนสมาชิก
            </button>
          </form>

          <div className="text-center mt-10 border-t border-slate-50 pt-8">
             <p className="text-xs text-slate-400 font-medium">มีบัญชีอยู่แล้ว? 
               <Link to="/login" className="text-[#007a4d] font-bold hover:underline ml-1 inline-flex items-center">
                 เข้าสู่ระบบ
               </Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
