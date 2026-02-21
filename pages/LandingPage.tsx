
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, UserPlus, ListChecks, Ticket, Volume2, Heart, CheckCircle2 } from 'lucide-react';

const LandingPage: React.FC = () => {
  const logoUrl = localStorage.getItem('alro_logo_url') || "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Emblem_of_Thailand.svg/1200px-Emblem_of_Thailand.svg.png";

  return (
    <div className="flex flex-col animate-fadeIn">
      {/* Hero Section */}
      <section className="bg-[#007a4d] text-white py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="grid grid-cols-6 h-full border-r border-white/20">
            {[...Array(6)].map((_, i) => <div key={i} className="border-l border-white/20 h-full"></div>)}
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block bg-white p-3 rounded-full mb-8 shadow-xl">
             <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight leading-[1.2]">
            ยินดีต้อนรับสู่ระบบจองคิวอัจฉริยะ<br/>สำนักงานการปฏิรูปที่ดินจังหวัดตรัง
          </h1>
          <p className="text-lg md:text-xl opacity-80 mb-10 max-w-2xl mx-auto font-light">
            ยกระดับการให้บริการประชาชนด้วยเทคโนโลยี AI และระบบจัดการ<br/>ที่รวดเร็ว แม่นยำ และโปร่งใส
          </p>
          <Link to="/kiosk" className="bg-white text-[#007a4d] px-10 py-4 rounded-full font-bold shadow-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2 mx-auto w-fit text-lg">
            เริ่มรับบริการ <ChevronRight size={22} />
          </Link>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-16 text-slate-800">5 ขั้นตอนง่ายๆ ในการรับบริการ</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {[
            { icon: UserPlus, color: 'bg-blue-500', title: 'ลงทะเบียนสมาชิก', desc: 'เข้าสู่ระบบด้วยความสะดวกในการจองคิวและรับบัตรคิว' },
            { icon: ListChecks, color: 'bg-teal-500', title: 'เลือกประเภทบริการ', desc: 'เลือกบริการต่างๆ ที่ท่านต้องการผ่านตู้บริการอัตโนมัติ' },
            { icon: Ticket, color: 'bg-orange-500', title: 'รับบัตรคิว', desc: 'ระบบจะพิมพ์บัตรคิวให้ท่านอัตโนมัติ เพื่อเข้าลำดับในระบบ' },
            { icon: Volume2, color: 'bg-indigo-500', title: 'รอรับบริการ', desc: 'ติดตามคิวผ่านจอแสดงผล โดยระบบจะแจ้งเตือนเมื่อถึงคิวของท่าน' },
            { icon: Heart, color: 'bg-pink-500', title: 'ประเมินความพึงพอใจ', desc: 'ให้คะแนนความพึงพอใจหลังเสร็จบริการ เพื่อปรับปรุงคุณภาพ' },
          ].map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center group">
              <div className="relative mb-6">
                <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon size={32} />
                </div>
                <div className="absolute -top-2 -right-2 bg-white text-gray-800 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md border">
                  {i + 1}
                </div>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-light">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Section */}
      <section className="bg-white py-20 px-6 border-y border-gray-100">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-slate-800 leading-tight">สะดวกสบาย ประหยัดเวลาด้วยระบบ MFA</h2>
            <p className="text-slate-600 mb-8 text-lg font-light leading-relaxed">
              เข้าถึงข้อมูลที่ดินของคุณได้จากทุกที่ ผ่านระบบยืนยันตัวตนแบบหลายชั้น (Multi-Factor Authentication) ที่มีความปลอดภัยสูงสุด และสามารถติดตามสถานะคิวได้แบบเรียลไทม์
            </p>
            <ul className="space-y-5">
              {[
                'ตรวจสอบประวัติการทำธุรกรรมย้อนหลัง',
                'รับการแจ้งเตือนผ่าน SMS และโทรศัพท์มือถือ',
                'ลดขั้นตอนการกรอกข้อมูลซ้ำซ้อน',
                'ปลอดภัยด้วยมาตรฐานการรักษาความปลอดภัยข้อมูล'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-slate-700 font-medium">
                  <div className="bg-emerald-100 p-1 rounded-full">
                    <CheckCircle2 className="text-[#007a4d]" size={20} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-[#007a4d]/10 to-transparent p-12 rounded-[40px] relative">
            <div className="bg-white rounded-[32px] shadow-2xl p-8 max-w-xs mx-auto transform rotate-2 hover:rotate-0 transition-transform duration-700 border border-emerald-50">
              <div className="flex justify-between items-start mb-12">
                <span className="bg-emerald-100 text-[#007a4d] text-xs px-3 py-1 rounded-full font-bold">คิวของคุณ</span>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">สถานะ: กำลังดำเนินการ</div>
              </div>
              <div className="text-center mb-12">
                <h4 className="text-5xl font-black text-slate-800 tracking-tighter">A001</h4>
              </div>
              <div className="flex justify-between items-end">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ช่องบริการ</div>
                <div className="text-3xl font-bold text-[#007a4d]">01</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
