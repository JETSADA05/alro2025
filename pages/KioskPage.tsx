
import React, { useState, useEffect } from 'react';
import { Search, Ticket, User, Phone, MapPin, Calendar, Clock, ChevronLeft, ArrowRight } from 'lucide-react';
import { SERVICES } from '../constants';
import { ServiceCode, QueueItem, Service, Member } from '../types';

interface KioskPageProps {
  onGenerate: (code: ServiceCode, regData: any) => QueueItem;
}

const KioskPage: React.FC<KioskPageProps> = ({ onGenerate }) => {
  const [step, setStep] = useState<'service' | 'registration'>('service');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [lastTicket, setLastTicket] = useState<QueueItem | null>(null);

  // Registration form state
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    bookingDate: new Date().toISOString().split('T')[0],
    bookingTime: '',
    address: ''
  });

  // Effect to pull data from logged in member or when returning to registration step
  useEffect(() => {
    if (step === 'registration') {
      const userPhone = localStorage.getItem('alro_user_phone');
      const userDisplay = localStorage.getItem('alro_user_display');
      
      if (userPhone || userDisplay) {
        setFormData(prev => ({
          ...prev,
          customerName: userDisplay || prev.customerName,
          phone: userPhone || prev.phone
        }));
      }
    }
  }, [step]);

  const filteredServices = SERVICES.filter(s => 
    s.name.includes(searchTerm) || s.code.includes(searchTerm)
  );

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep('registration');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); 
    if (val.length <= 10) {
      setFormData(prev => ({ ...prev, phone: val }));
      
      // Auto-pull name if phone matches a registered member in local storage
      if (val.length === 10) {
        const savedMembers: Member[] = JSON.parse(localStorage.getItem('alro_members') || '[]');
        const matched = savedMembers.find(m => m.phone === val);
        if (matched) {
          setFormData(prev => ({ ...prev, customerName: matched.fullName }));
        }
      }
    }
  };

  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    if (formData.phone.length !== 10) {
      alert('กรุณาระบุเบอร์โทรศัพท์ให้ครบ 10 หลัก');
      return;
    }

    const ticket = onGenerate(selectedService.code, formData);
    setLastTicket(ticket);
    
    // Reset and go back to first step
    setStep('service');
    setSelectedService(null);
    setFormData({
      customerName: '',
      phone: '',
      bookingDate: new Date().toISOString().split('T')[0],
      bookingTime: '',
      address: ''
    });
  };

  const logoUrl = localStorage.getItem('alro_logo_url') || "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Emblem_of_Thailand.svg/1200px-Emblem_of_Thailand.svg.png";

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden font-['Prompt']">
      
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#007a4d]/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#007a4d]/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-[60px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden border border-white z-10 animate-fadeIn">
        
        {/* Step 1: Select Service */}
        {step === 'service' && (
          <div className="flex flex-col h-full">
            <div className="bg-[#007a4d] text-white p-12 text-center relative overflow-hidden">
              <div className="bg-white p-4 rounded-full w-24 h-24 mx-auto mb-6 shadow-xl flex items-center justify-center relative z-10">
                <img src={logoUrl} alt="Logo" className="w-14 h-14 object-contain" />
              </div>
              <h1 className="text-3xl font-black mb-2 tracking-tight relative z-10">ระบบจองคิวอัจฉริยะ</h1>
              <p className="text-lg opacity-80 font-medium relative z-10">กรุณาเลือกประเภทบริการที่ท่านต้องการ</p>
            </div>

            <div className="p-10">
              <div className="relative mb-10">
                <div className="absolute inset-y-0 left-6 flex items-center text-slate-300">
                  <Search size={24} />
                </div>
                <input 
                  type="text" 
                  placeholder="ค้นหาบริการที่ต้องการ..." 
                  className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[30px] focus:outline-none focus:ring-4 focus:ring-[#007a4d]/5 focus:border-[#007a4d]/20 transition-all text-lg font-bold shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar">
                {filteredServices.map((service) => (
                  <button 
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className="flex items-center justify-between p-7 bg-white hover:bg-[#007a4d]/5 border border-slate-100 rounded-[35px] group transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95"
                  >
                    <span className="font-black text-slate-700 text-lg text-left leading-tight pr-4">
                      {service.name}
                    </span>
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center font-black text-xl group-hover:bg-[#007a4d] group-hover:text-white transition-all">
                      {service.code}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Registration Form */}
        {step === 'registration' && selectedService && (
          <div className="flex flex-col h-full animate-slideIn">
            <div className="bg-[#007a4d] text-white p-10 flex items-center gap-6 relative">
              <button 
                onClick={() => setStep('service')}
                className="w-12 h-12 hover:bg-white/20 rounded-full transition-colors flex items-center justify-center shrink-0"
              >
                <ChevronLeft size={32} strokeWidth={2.5} />
              </button>
              <div>
                <h2 className="font-black text-3xl tracking-tight leading-none mb-2">ลงทะเบียนข้อมูลผู้รับบริการ</h2>
                <p className="text-sm opacity-80 flex items-center gap-2 font-bold uppercase tracking-widest">
                   <Ticket size={16} /> บริการ: {selectedService.name}
                </p>
              </div>
            </div>

            <form onSubmit={handleRegistrationSubmit} className="p-12 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3 ml-2">
                    <User size={16} className="text-slate-300" /> ชื่อนามสกุล
                  </label>
                  <input 
                    required
                    type="text" 
                    placeholder="ระบุชื่อจริง-นามสกุล" 
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[30px] focus:ring-4 focus:ring-emerald-500/5 focus:border-[#007a4d]/20 outline-none transition-all font-black text-slate-700 text-lg shadow-inner placeholder:text-slate-200"
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                      <Phone size={16} className="text-slate-300" /> เบอร์โทรศัพท์
                    </label>
                    <span className={`text-[11px] font-black ${formData.phone.length === 10 ? 'text-emerald-500' : 'text-slate-200'}`}>
                      {formData.phone.length}/10
                    </span>
                  </div>
                  <input 
                    required
                    type="tel" 
                    inputMode="numeric"
                    placeholder="08X-XXX-XXXX" 
                    className={`w-full px-8 py-5 bg-slate-50 border rounded-[30px] focus:ring-4 outline-none transition-all font-black text-slate-700 text-lg shadow-inner ${formData.phone.length === 10 ? 'border-emerald-500 border-2 focus:ring-emerald-500/5' : 'border-slate-100 focus:ring-emerald-500/5'}`}
                    value={formData.phone}
                    onChange={handlePhoneChange}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3 ml-2">
                    <Calendar size={16} className="text-slate-300" /> วันที่เข้ารับบริการ
                  </label>
                  <input 
                    required
                    type="date" 
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[30px] focus:ring-4 focus:ring-emerald-500/5 focus:border-[#007a4d]/20 outline-none transition-all font-black text-slate-700 text-lg shadow-inner appearance-none"
                    value={formData.bookingDate}
                    onChange={(e) => setFormData({...formData, bookingDate: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3 ml-2">
                    <Clock size={16} className="text-slate-300" /> เวลาที่ต้องการ
                  </label>
                  <div className="relative">
                    <select 
                      required
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[30px] focus:ring-4 focus:ring-emerald-500/5 focus:border-[#007a4d]/20 outline-none transition-all font-black text-slate-700 text-lg shadow-inner appearance-none cursor-pointer"
                      value={formData.bookingTime}
                      onChange={(e) => setFormData({...formData, bookingTime: e.target.value})}
                    >
                      <option value="" disabled>เลือกเวลาเข้าบริการ</option>
                      <option value="08:30">08:30 น.</option>
                      <option value="09:00">09:00 น.</option>
                      <option value="10:00">10:00 น.</option>
                      <option value="11:00">11:00 น.</option>
                      <option value="13:00">13:00 น.</option>
                      <option value="14:00">14:00 น.</option>
                      <option value="15:00">15:00 น.</option>
                    </select>
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                      <ChevronLeft size={24} className="-rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3 ml-2">
                  <MapPin size={16} className="text-slate-300" /> ที่อยู่สำหรับการทำธุรกรรม
                </label>
                <textarea 
                  required
                  placeholder="ระบุที่อยู่ตามทะเบียนบ้าน หรือที่อยู่ปัจจุบัน" 
                  rows={3}
                  className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[35px] focus:ring-4 focus:ring-emerald-500/5 focus:border-[#007a4d]/20 outline-none transition-all font-black text-slate-700 text-lg shadow-inner placeholder:text-slate-200 leading-relaxed resize-none"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                ></textarea>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-6 bg-[#007a4d] text-white rounded-[35px] font-black text-2xl hover:bg-[#00643d] transition-all shadow-[0_20px_50px_rgba(0,122,77,0.2)] active:scale-[0.97] flex items-center justify-center gap-5 group"
                >
                  ยืนยันการจองคิว <ArrowRight size={28} className="group-hover:translate-x-3 transition-transform" strokeWidth={3} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Success Modal - Refined for compact fit and smaller text */}
      {lastTicket && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn p-4 overflow-y-auto">
          <div className="bg-white rounded-[60px] shadow-[0_40px_100px_rgba(0,0,0,0.15)] p-10 max-w-[400px] w-full text-center animate-scaleUp relative mt-auto mb-auto">
            
            {/* Header Icon - Compact circle */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-[#e8f5f0] rounded-full flex items-center justify-center shadow-inner ring-4 ring-white">
                <Ticket size={42} className="text-[#007a4d] fill-current opacity-80" strokeWidth={2.5} />
              </div>
            </div>
            
            {/* Title & Instruction - Smaller fonts */}
            <h2 className="text-[2.2rem] font-black mb-3 text-[#1e293b] tracking-tight leading-tight">จองคิวสำเร็จแล้ว</h2>
            <p className="text-[#94a3b8] mb-10 font-bold text-sm leading-relaxed px-10">
              กรุณารับบัตรคิวและเตรียมเอกสาร<br/>ตัวจริงมาให้พร้อมในวันนัดหมาย
            </p>
            
            {/* Ticket Visualization - Compacted with dashed border */}
            <div className="bg-white border-[2px] border-dashed border-[#e2e8f0] rounded-[50px] p-8 mb-10 relative group overflow-hidden">
              <div className="absolute inset-0 bg-slate-50/5 pointer-events-none"></div>
              
              {/* QUEUE NUMBER Label - Tiny and spaced */}
              <div className="text-[10px] text-[#94a3b8] font-black uppercase tracking-[0.5em] mb-4">
                QUEUE NUMBER
              </div>
              
              {/* The Big Number - Large but fitted */}
              <div className="text-[8rem] font-black text-[#1e293b] tracking-tighter mb-4 leading-none inline-block">
                {lastTicket.number}
              </div>
              
              {/* Divider Line */}
              <div className="w-24 h-[1.5px] bg-[#f1f5f9] mx-auto mb-8 rounded-full"></div>

              {/* Customer Info - Green Name Style */}
              <div className="space-y-3">
                <div className="text-2xl font-black text-[#007a4d] tracking-tight uppercase">
                  {lastTicket.customerName}
                </div>
                <div className="text-[14px] text-[#94a3b8] font-bold tracking-wide leading-relaxed">
                  {lastTicket.bookingDate} • {lastTicket.bookingTime} น.
                </div>
              </div>

              {/* Decorative Side Notches */}
              <div className="absolute top-1/2 -left-5 w-10 h-10 bg-white rounded-full -translate-y-1/2 border-r-[2px] border-[#e2e8f0]"></div>
              <div className="absolute top-1/2 -right-5 w-10 h-10 bg-white rounded-full -translate-y-1/2 border-l-[2px] border-[#e2e8f0]"></div>
            </div>

            {/* Action Button - Large Pill Shape */}
            <button 
              onClick={() => setLastTicket(null)}
              className="w-full py-6 bg-[#007a4d] text-white rounded-full font-black text-2xl hover:bg-[#00643d] transition-all shadow-[0_20px_40px_rgba(0,122,77,0.2)] active:scale-[0.96]"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-scaleUp { animation: scaleUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slideIn { animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default KioskPage;
