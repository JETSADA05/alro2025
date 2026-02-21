
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QueueItem, LoginHistoryItem, Member, ServiceCode } from '../types';
import { generateThaiTTS } from '../services/geminiService';
import { 
  Megaphone, List, LogOut, Play, 
  CheckCircle, History, Clock,
  BarChart3, Save, Building2, 
  Loader2, CheckCircle2, 
  Settings, Link as LinkIcon, Download, RefreshCcw, Database, 
  Image as ImageIcon, Copyright, Code, Copy, Check, Search, X, Filter, Users, Trash2, UserCheck,
  Phone, Pencil, UserPlus, CreditCard, User, Terminal, Speaker, Printer, FileText, PieChart, ChevronLeft, ChevronRight
} from 'lucide-react';

interface AdminPageProps {
  queues: QueueItem[];
  counters: { [key: number]: QueueItem | null };
  onCallNext: (counterId: number) => QueueItem | null;
  onComplete: (counterId: number) => void;
  onReCall: (counterId: number) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ queues, counters, onCallNext, onComplete, onReCall }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('calling');
  const [selectedCounter, setSelectedCounter] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copied, setCopied] = useState(false);
  
  // Report States
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Member Management States
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberFormData, setMemberFormData] = useState({
    fullName: '',
    idCard: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const adminDisplayName = localStorage.getItem('alro_user_display') || 'แอดมิน';

  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem('alro_members');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  // Settings states
  const [officeName, setOfficeName] = useState(() => localStorage.getItem('alro_office_name') || 'สำนักงานการปฏิรูปที่ดินจังหวัดตรัง');
  const [officeNameEn, setOfficeNameEn] = useState(() => localStorage.getItem('alro_office_name_en') || 'PROVINCE LAND REFORM OFFICE QUEUE MANAGEMENT SYSTEM');
  const [counterCount, setCounterCount] = useState(() => Number(localStorage.getItem('alro_counter_count')) || 5);
  const [copyrightText, setCopyrightText] = useState(() => localStorage.getItem('alro_copyright') || '© 2024 สงวนลิขสิทธิ์ตามกฎหมาย');
  const [logoUrl, setLogoUrl] = useState(() => localStorage.getItem('alro_logo_url') || 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Emblem_of_Thailand.svg/1200px-Emblem_of_Thailand.svg.png');
  const [gasUrl, setGasUrl] = useState(() => localStorage.getItem('alro_gas_url') || '');
  const [voiceMode, setVoiceMode] = useState(() => localStorage.getItem('alro_voice_mode') || 'gemini');
  
  const [isSaving, setIsSaving] = useState(false);

  const [loginHistory] = useState<LoginHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('alro_login_history');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    const isAdmin = localStorage.getItem('alro_is_admin') === 'true';
    if (!isAdmin) navigate('/login');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('alro_is_admin');
    localStorage.removeItem('alro_user_display');
    navigate('/login');
  };

  const filteredQueues = useMemo(() => {
    return queues.filter(q => {
      const matchesSearch = searchTerm === '' || q.number.toLowerCase().includes(searchTerm.toLowerCase()) || (q.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [queues, searchTerm, statusFilter]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => m.fullName.toLowerCase().includes(memberSearchTerm.toLowerCase()) || m.phone.includes(memberSearchTerm) || m.idCard.includes(memberSearchTerm));
  }, [members, memberSearchTerm]);

  const handleDeleteMember = (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลสมาชิกท่านนี้?')) {
      const updated = members.filter(m => m.id !== id);
      setMembers(updated);
      localStorage.setItem('alro_members', JSON.stringify(updated));
    }
  };

  const openAddMemberModal = () => {
    setEditingMember(null);
    setMemberFormData({ fullName: '', idCard: '', phone: '', password: '', confirmPassword: '' });
    setIsMemberModalOpen(true);
  };

  const openEditMemberModal = (member: Member) => {
    setEditingMember(member);
    setMemberFormData({ 
      fullName: member.fullName, 
      idCard: member.idCard, 
      phone: member.phone, 
      password: member.password || '', 
      confirmPassword: member.password || '' 
    });
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (memberFormData.password !== memberFormData.confirmPassword) {
      alert('รหัสผ่านไม่ตรงกัน');
      return;
    }

    let updatedMembers;
    const { confirmPassword, ...saveData } = memberFormData;

    if (editingMember) {
      updatedMembers = members.map(m => m.id === editingMember.id ? { ...m, ...saveData } : m);
    } else {
      const newMember: Member = { 
        id: Math.random().toString(36).substr(2, 9), 
        ...saveData, 
        registeredAt: new Date().toISOString() 
      };
      updatedMembers = [newMember, ...members];
    }
    setMembers(updatedMembers);
    localStorage.setItem('alro_members', JSON.stringify(updatedMembers));
    setIsMemberModalOpen(false);
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    localStorage.setItem('alro_office_name', officeName);
    localStorage.setItem('alro_office_name_en', officeNameEn);
    localStorage.setItem('alro_counter_count', counterCount.toString());
    localStorage.setItem('alro_copyright', copyrightText);
    localStorage.setItem('alro_logo_url', logoUrl);
    localStorage.setItem('alro_gas_url', gasUrl);
    localStorage.setItem('alro_voice_mode', voiceMode);
    window.dispatchEvent(new CustomEvent('alro_settings_updated'));
    setTimeout(() => setIsSaving(false), 800);
  };

  const gasBackendCode = `/**
 * Google Apps Script (Full Backend) สำหรับ ALRO Smart Queue
 */
const SS = SpreadsheetApp.getActiveSpreadsheet();

function doGet(e) {
  const action = e.parameter.action || "GET_ALL";
  if (action === "GET_ALL") {
    return createJsonResponse({
      queues: getSheetData("Queues"),
      members: getSheetData("Members"),
      history: getSheetData("History"),
      settings: getSheetData("Settings")
    });
  }
}

function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  const action = params.action;
  try {
    if (action === "SYNC_ALL") {
      updateSheet("Queues", params.queues);
      updateSheet("Members", params.members);
      updateSheet("History", params.history);
      updateSheet("Settings", params.settings);
      return createJsonResponse({ status: "success" });
    }
    return createJsonResponse({ status: "success" });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

function getSheetData(name) {
  let sheet = SS.getSheetByName(name);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  return values.map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h.toLowerCase()] = row[i]);
    return obj;
  });
}

function updateSheet(name, data) {
  let sheet = SS.getSheetByName(name);
  if (!sheet) sheet = SS.insertSheet(name);
  sheet.clear();
  if (data && data.length > 0) {
    const headers = Object.keys(data[0]);
    sheet.appendRow(headers);
    const rows = data.map(item => headers.map(h => item[h]));
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gasBackendCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSyncData = async () => {
    if (!gasUrl) return alert('กรุณาระบุ URL ของ Google Apps Script');
    setIsSaving(true);
    try {
      const dataToSync = {
        action: 'SYNC_ALL',
        queues: queues,
        members: members,
        history: loginHistory,
        settings: [
          { key: 'office_name', value: officeName },
          { key: 'office_name_en', value: officeNameEn },
          { key: 'counter_count', value: counterCount },
          { key: 'copyright', value: copyrightText },
          { key: 'logo_url', value: logoUrl }
        ]
      };
      await fetch(gasUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSync)
      });
      alert('ส่งข้อมูลไปยัง Google Sheets สำเร็จ');
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsSaving(false);
    }
  };

  const sidebarItems = [
    { id: 'calling', icon: Megaphone, label: 'จุดเรียกคิว' },
    { id: 'all', icon: List, label: 'คิวทั้งหมด' },
    { id: 'members', icon: Users, label: 'จัดการสมาชิก' },
    { id: 'history', icon: History, label: 'ประวัติเข้าใช้งาน' },
    { id: 'stats', icon: BarChart3, label: 'สถิติ' },
    { id: 'settings', icon: Settings, label: 'ตั้งค่า' },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] flex bg-gray-50 font-['Prompt'] animate-fadeIn">
      {/* Sidebar - Pill Design */}
      <div className="w-16 md:w-[320px] bg-white border-r border-slate-100 flex flex-col shadow-sm">
        <div className="p-8 hidden md:block">
          <div className="bg-white border border-slate-100 rounded-[40px] p-6 flex items-center gap-5 shadow-sm">
            <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center shadow-lg ring-4 ring-emerald-50 overflow-hidden">
              <img src={logoUrl || "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Emblem_of_Thailand.svg/1200px-Emblem_of_Thailand.svg.png"} alt="Logo" className="w-12 h-12 object-contain" />
            </div>
            <div className="flex-1 overflow-hidden">
               <h3 className="font-black text-slate-800 truncate text-lg tracking-tight">{adminDisplayName}</h3>
               <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-2 mt-1">
                 <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> ออนไลน์
               </p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-6 py-4 space-y-3">
          {sidebarItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`w-full flex items-center gap-5 px-8 py-5 rounded-full transition-all font-bold text-base ${
                activeTab === item.id 
                ? 'bg-[#007a4d] text-white shadow-xl scale-[1.02]' 
                : 'text-slate-400 bg-slate-50/50 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <item.icon size={24} /> 
              <span className="hidden md:block">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-8 border-t border-slate-50">
          <button onClick={handleLogout} className="w-full flex items-center gap-5 px-8 py-5 text-slate-400 hover:text-rose-500 rounded-full transition-all font-bold group">
            <LogOut size={24} className="group-hover:-translate-x-1 transition-transform" /> 
            <span className="hidden md:block">ออกจากระบบ</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 md:p-12 overflow-auto">
        {/* Calling Tab */}
        {activeTab === 'calling' && (
          <div className="max-w-[1400px] mx-auto space-y-12 animate-fadeIn">
            <div className="flex flex-col lg:flex-row gap-12 items-start">
              <div className="w-full lg:w-[450px] bg-white rounded-[50px] shadow-sm border border-slate-100 p-12">
                 <h3 className="font-black text-slate-800 text-2xl mb-12 tracking-tight">เลือกช่องบริการ</h3>
                 <div className="grid grid-cols-2 gap-6">
                    {[...Array(counterCount)].map((_, i) => (
                      <button key={i+1} onClick={() => setSelectedCounter(i+1)} className={`aspect-square rounded-[40px] border-2 flex flex-col items-center justify-center transition-all ${selectedCounter === i+1 ? 'bg-[#007a4d] border-[#007a4d] text-white shadow-2xl scale-105' : 'bg-white border-slate-50 text-slate-200 hover:bg-emerald-50/20'}`}>
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] mb-2 opacity-60">Counter</span>
                        <span className="text-5xl font-black">{i+1}</span>
                      </button>
                    ))}
                 </div>
              </div>
              <div className="flex-1 bg-[#007a4d] rounded-[80px] min-h-[650px] p-24 flex flex-col justify-center items-center text-white relative shadow-2xl overflow-hidden">
                 <div className="text-center flex flex-col items-center relative z-10 w-full">
                    {counters[selectedCounter] ? (
                      <div className="animate-scaleUp w-full">
                        <div className="inline-block bg-white/10 px-8 py-3 rounded-full text-[13px] font-black uppercase mb-10 tracking-[0.4em]">Now Calling • Counter {selectedCounter}</div>
                        <h2 className="text-[12rem] md:text-[15rem] font-black leading-none mb-16 drop-shadow-2xl tracking-tighter">{counters[selectedCounter]!.number}</h2>
                        <div className="flex flex-wrap justify-center gap-6">
                          <button 
                            className="bg-white/10 px-10 md:px-16 py-5 md:py-7 rounded-[40px] font-black text-xl md:text-2xl flex items-center gap-4 border border-white/10 hover:bg-white/20 active:scale-95"
                            onClick={() => onReCall(selectedCounter)}
                          >
                            <Megaphone size={32} /> เรียกอีกครั้ง
                          </button>
                          <button className="bg-[#dcfce7] px-10 md:px-16 py-5 md:py-7 rounded-[40px] font-black text-xl md:text-2xl text-[#007a4d] hover:bg-white flex items-center gap-4 shadow-2xl active:scale-95" onClick={() => onComplete(selectedCounter)}><CheckCircle2 size={32} /> เสร็จสิ้นบริการ</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-20 opacity-95">
                         <div className="w-40 h-40 rounded-full border-4 border-white/20 flex items-center justify-center mb-14 bg-white/5"><Play size={64} className="text-white fill-current ml-2" /></div>
                         <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tight">พร้อมรับคิวถัดไป</h2>
                         <button onClick={() => onCallNext(selectedCounter)} className="bg-emerald-50 text-[#007a4d] px-16 md:px-24 py-6 md:py-8 rounded-[40px] font-black text-2xl md:text-4xl shadow-2xl hover:scale-110 active:scale-95 transition-all">เรียกคิวถัดไป</button>
                      </div>
                     )}
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* All Queues Tab */}
        {activeTab === 'all' && (
          <div className="max-w-[1400px] mx-auto space-y-10 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <h2 className="text-5xl font-black text-slate-800 tracking-tight">คิวทั้งหมด</h2>
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="relative group w-full md:w-[350px]">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#007a4d]" size={20} />
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="ค้นหาหมายเลขคิว หรือ ชื่อ..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-full font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 shadow-sm" />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-8 py-4 bg-white border border-slate-100 rounded-full font-bold outline-none cursor-pointer focus:ring-4 focus:ring-emerald-500/5 shadow-sm appearance-none">
                  <option value="all">สถานะทั้งหมด</option>
                  <option value="waiting">รอเรียก</option>
                  <option value="calling">กำลังเรียก</option>
                  <option value="completed">เสร็จสิ้น</option>
                  <option value="cancelled">ยกเลิก</option>
                </select>
              </div>
            </div>
            
            <div className="bg-white rounded-[60px] shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">หมายเลขคิว</th>
                      <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">ผู้รับบริการ</th>
                      <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">สถานะ</th>
                      <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">เวลา</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredQueues.length > 0 ? filteredQueues.map(q => (
                      <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-10 py-8">
                          <span className="text-2xl font-black text-slate-700">{q.number}</span>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700">{q.customerName || 'ทั่วไป'}</span>
                            <span className="text-xs text-slate-400">{q.phone || '-'}</span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            q.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                            q.status === 'calling' ? 'bg-amber-50 text-amber-600' :
                            q.status === 'waiting' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'
                          }`}>
                            {q.status === 'waiting' ? 'รอเรียก' : 
                             q.status === 'calling' ? 'กำลังเรียก' : 
                             q.status === 'completed' ? 'เสร็จสิ้น' : 'ยกเลิก'}
                          </span>
                        </td>
                        <td className="px-10 py-8 font-bold text-slate-400">
                          {new Date(q.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-10 py-20 text-center text-slate-300 font-bold">ไม่พบข้อมูลคิว</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Member Management Tab - Updated to match screenshot */}
        {activeTab === 'members' && (
          <div className="max-w-[1400px] mx-auto space-y-12 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-8">
                  <h2 className="text-[44px] font-black text-slate-800 tracking-tight leading-none">จัดการสมาชิก</h2>
                  <button 
                    onClick={openAddMemberModal} 
                    className="bg-[#007a4d] text-white px-8 py-3.5 rounded-[22px] font-black text-sm shadow-[0_10px_25px_rgba(0,122,77,0.2)] hover:bg-[#00643d] flex items-center gap-3 transition-all active:scale-95"
                  >
                    <UserPlus size={20} /> เพิ่มสมาชิกใหม่
                  </button>
                </div>
                <div className="bg-[#f0f9f6] px-6 py-3 rounded-full border border-emerald-100 flex items-center gap-3 w-fit shadow-sm">
                  <UserCheck className="text-[#007a4d]" size={18} />
                  <span className="text-sm font-black text-[#007a4d]">สมาชิกทั้งหมด: {members.length} ท่าน</span>
                </div>
              </div>
              <div className="w-full md:w-[500px] pt-2">
                <div className="relative group">
                  <Search className="absolute inset-y-0 left-8 flex items-center text-slate-300 group-focus-within:text-[#007a4d]" size={22} />
                  <input 
                    type="text" 
                    value={memberSearchTerm} 
                    onChange={(e) => setMemberSearchTerm(e.target.value)} 
                    placeholder="ค้นชื่อ, เบอร์โทร หรือเลขบัตร..." 
                    className="w-full pl-16 pr-12 py-6 bg-white border border-slate-100 rounded-full font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-[0_15px_40px_rgba(0,0,0,0.03)]" 
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[60px] shadow-[0_10px_60px_rgba(0,0,0,0.02)] border border-slate-50 overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50/30 border-b border-slate-50">
                      <tr>
                        <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">ข้อมูลสมาชิก</th>
                        <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">เลขบัตรประชาชน</th>
                        <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredMembers.length > 0 ? filteredMembers.map(m => (
                        <tr key={m.id} className="hover:bg-slate-50/50 group transition-colors">
                          <td className="px-12 py-10">
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-slate-700 text-[19px]">{m.fullName}</span>
                              <span className="text-sm text-[#007a4d] font-black flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                <Phone size={14} className="opacity-50" /> {m.phone}
                              </span>
                            </div>
                          </td>
                          <td className="px-12 py-10">
                            <span className="text-slate-400 font-mono font-bold tracking-wider">{m.idCard}</span>
                          </td>
                          <td className="px-12 py-10 text-right">
                             <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                                <button 
                                  onClick={() => openEditMemberModal(m)} 
                                  className="p-4 bg-emerald-50 text-[#007a4d] rounded-[20px] hover:bg-[#007a4d] hover:text-white transition-all shadow-sm active:scale-90"
                                  title="แก้ไขข้อมูล"
                                >
                                  <Pencil size={20} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteMember(m.id)} 
                                  className="p-4 bg-rose-50 text-rose-500 rounded-[20px] hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-90"
                                  title="ลบข้อมูล"
                                >
                                  <Trash2 size={20} />
                                </button>
                             </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={3} className="px-12 py-32 text-center">
                            <div className="flex flex-col items-center gap-4 opacity-20">
                              <Users size={80} />
                              <span className="text-xl font-black">ไม่พบข้อมูลสมาชิก</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {/* Other Tabs remain the same... (History, Stats, Settings) */}
        {activeTab === 'history' && (
          <div className="max-w-[1400px] mx-auto space-y-10 animate-fadeIn">
            <h2 className="text-5xl font-black text-slate-800 tracking-tight">ประวัติเข้าใช้งาน</h2>
            <div className="bg-white rounded-[60px] shadow-sm border border-slate-100 p-12">
               <div className="space-y-6">
                 {loginHistory.length > 0 ? loginHistory.map((item, idx) => (
                   <div key={item.id} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[30px] border border-slate-50">
                     <div className="flex items-center gap-6">
                       <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-300 shadow-sm">
                          <History size={20} />
                       </div>
                       <div className="flex flex-col">
                         <span className="font-bold text-slate-700">ลงชื่อเข้าใช้งานระบบ</span>
                         <span className="text-xs text-slate-400 uppercase tracking-widest font-black">Admin ID: {item.phone}</span>
                       </div>
                     </div>
                     <div className="text-right flex flex-col items-end">
                       <span className="font-bold text-slate-700">{new Date(item.timestamp).toLocaleDateString('th-TH')}</span>
                       <span className="text-xs text-[#007a4d] font-black">{new Date(item.timestamp).toLocaleTimeString('th-TH')} น.</span>
                     </div>
                   </div>
                 )) : (
                   <div className="text-center py-20 text-slate-300 font-bold">ไม่มีข้อมูลประวัติ</div>
                 )}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="max-w-[1400px] mx-auto space-y-12 animate-fadeIn pb-20 print-area">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-2">
                <div className="hidden print:block mb-4">
                  <h1 className="text-3xl font-black text-slate-800">{officeName}</h1>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{officeNameEn}</p>
                  <div className="h-1 w-20 bg-[#007a4d] mt-4"></div>
                </div>
                <h2 className="text-5xl font-black text-slate-800 tracking-tight">สถิติการรับบริการ</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Service Statistics & Reports</p>
                <p className="hidden print:block text-slate-600 font-bold mt-2">
                  {reportPeriod === 'daily' && `รายงานประจำวันที่ ${selectedDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                  {reportPeriod === 'monthly' && `รายงานประจำเดือน ${selectedDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}`}
                  {reportPeriod === 'yearly' && `รายงานประจำปี พ.ศ. ${selectedDate.getFullYear() + 543}`}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-[30px] shadow-sm border border-slate-100">
                <div className="flex bg-slate-100 p-1 rounded-full">
                  {(['daily', 'monthly', 'yearly'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setReportPeriod(p)}
                      className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${reportPeriod === p ? 'bg-white text-[#007a4d] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {p === 'daily' ? 'รายวัน' : p === 'monthly' ? 'รายเดือน' : 'รายปี'}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-3 px-4 border-l border-slate-100">
                  <button 
                    onClick={() => {
                      const d = new Date(selectedDate);
                      if (reportPeriod === 'daily') d.setDate(d.getDate() - 1);
                      else if (reportPeriod === 'monthly') d.setMonth(d.getMonth() - 1);
                      else d.setFullYear(d.getFullYear() - 1);
                      setSelectedDate(d);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <span className="font-black text-slate-700 min-w-[140px] text-center">
                    {reportPeriod === 'daily' && selectedDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {reportPeriod === 'monthly' && selectedDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                    {reportPeriod === 'yearly' && `พ.ศ. ${selectedDate.getFullYear() + 543}`}
                  </span>
                  
                  <button 
                    onClick={() => {
                      const d = new Date(selectedDate);
                      if (reportPeriod === 'daily') d.setDate(d.getDate() + 1);
                      else if (reportPeriod === 'monthly') d.setMonth(d.getMonth() + 1);
                      else d.setFullYear(d.getFullYear() + 1);
                      setSelectedDate(d);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <button 
                  onClick={() => window.print()}
                  className="ml-2 p-4 bg-[#007a4d] text-white rounded-full hover:bg-[#00643d] transition-all shadow-lg active:scale-90"
                  title="พิมพ์รายงาน"
                >
                  <Printer size={20} />
                </button>
              </div>
            </div>

            {/* Stats Summary */}
            {(() => {
              const periodQueues = queues.filter(q => {
                const qDate = new Date(q.timestamp);
                if (reportPeriod === 'daily') {
                  return qDate.toDateString() === selectedDate.toDateString();
                } else if (reportPeriod === 'monthly') {
                  return qDate.getMonth() === selectedDate.getMonth() && qDate.getFullYear() === selectedDate.getFullYear();
                } else {
                  return qDate.getFullYear() === selectedDate.getFullYear();
                }
              });

              const completed = periodQueues.filter(q => q.status === 'completed');
              const waiting = periodQueues.filter(q => q.status === 'waiting');
              const cancelled = periodQueues.filter(q => q.status === 'cancelled');
              
              const serviceStats = Object.values(ServiceCode).map(code => ({
                code,
                count: periodQueues.filter(q => q.serviceCode === code).length
              })).filter(s => s.count > 0);

              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 print:grid-cols-4">
                    <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100 flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-6">
                        <List size={20} />
                      </div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2">Total Queues</span>
                      <span className="text-5xl font-black text-slate-800">{periodQueues.length}</span>
                    </div>
                    <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100 flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-6">
                        <CheckCircle size={20} />
                      </div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2">Completed</span>
                      <span className="text-5xl font-black text-emerald-500">{completed.length}</span>
                    </div>
                    <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100 flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-6">
                        <Clock size={20} />
                      </div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2">Waiting</span>
                      <span className="text-5xl font-black text-amber-500">{waiting.length}</span>
                    </div>
                    <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100 flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
                        <X size={20} />
                      </div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2">Cancelled</span>
                      <span className="text-5xl font-black text-rose-500">{cancelled.length}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Service Distribution */}
                    <div className="lg:col-span-1 bg-white rounded-[60px] shadow-sm border border-slate-100 p-12 space-y-10">
                      <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><PieChart size={20}/></div>
                        แยกตามประเภทบริการ
                      </h3>
                      <div className="space-y-6">
                        {serviceStats.length > 0 ? serviceStats.map(s => (
                          <div key={s.code} className="space-y-3">
                            <div className="flex justify-between items-end">
                              <span className="font-bold text-slate-600 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black">{s.code}</div>
                                บริการประเภท {s.code}
                              </span>
                              <span className="font-black text-slate-800">{s.count} คิว</span>
                            </div>
                            <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#007a4d] rounded-full transition-all duration-1000" 
                                style={{ width: `${(s.count / periodQueues.length) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-10 text-slate-300 font-bold">ไม่มีข้อมูล</div>
                        )}
                      </div>
                    </div>

                    {/* Detailed Table */}
                    <div className="lg:col-span-2 bg-white rounded-[60px] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                      <div className="p-12 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#007a4d]"><FileText size={20}/></div>
                          รายการคิวทั้งหมดในรอบนี้
                        </h3>
                        <span className="px-6 py-2 bg-slate-100 rounded-full text-xs font-black text-slate-400 uppercase tracking-widest">
                          {periodQueues.length} Records
                        </span>
                      </div>
                      <div className="flex-1 overflow-auto max-h-[600px] custom-scrollbar">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50/50 sticky top-0 z-10">
                            <tr>
                              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">หมายเลขคิว</th>
                              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">เวลา</th>
                              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">สถานะ</th>
                              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">ช่องบริการ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {periodQueues.length > 0 ? periodQueues.map(q => (
                              <tr key={q.id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-10 py-6">
                                  <span className="font-black text-slate-700 text-lg">{q.number}</span>
                                </td>
                                <td className="px-10 py-6">
                                  <span className="text-sm font-bold text-slate-400">{new Date(q.timestamp).toLocaleTimeString('th-TH')}</span>
                                </td>
                                <td className="px-10 py-6">
                                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    q.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                    q.status === 'waiting' ? 'bg-amber-50 text-amber-600' :
                                    q.status === 'calling' ? 'bg-blue-50 text-blue-600' :
                                    'bg-rose-50 text-rose-600'
                                  }`}>
                                    {q.status}
                                  </span>
                                </td>
                                <td className="px-10 py-6">
                                  <span className="font-bold text-slate-500">{q.counter ? `ช่อง ${q.counter}` : '-'}</span>
                                </td>
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan={4} className="px-10 py-20 text-center text-slate-300 font-bold">ไม่มีข้อมูล</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                body * { visibility: hidden; }
                .print-area, .print-area * { visibility: visible; }
                .print-area { position: absolute; left: 0; top: 0; width: 100%; }
                nav, footer, .no-print, button { display: none !important; }
                .max-w-\\[1400px\\] { max-width: 100% !important; padding: 0 !important; }
                .rounded-\\[60px\\], .rounded-\\[50px\\] { border-radius: 20px !important; }
                .shadow-sm, .shadow-lg { shadow: none !important; border: 1px solid #eee !important; }
                .animate-fadeIn { animation: none !important; }
              }
            `}} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-[1400px] mx-auto space-y-10 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h2 className="text-5xl font-black text-slate-800 tracking-tight">ตั้งค่าระบบ</h2>
              <button onClick={handleSaveSettings} disabled={isSaving} className="bg-[#007a4d] text-white px-10 py-4 rounded-full font-black shadow-xl hover:bg-[#00643d] flex items-center gap-4 transition-all active:scale-95">
                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              <div className="bg-white rounded-[60px] shadow-sm border border-slate-100 p-12 space-y-10">
                 <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4">
                   <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#007a4d]"><Settings size={20}/></div>
                   ตั้งค่าทั่วไป
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-4">ชื่อหน่วยงาน (ภาษาไทย)</label>
                      <div className="relative">
                        <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input type="text" value={officeName} onChange={(e) => setOfficeName(e.target.value)} className="w-full pl-14 pr-8 py-5 bg-slate-50 border-none rounded-[30px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all" />
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-4">ชื่อหน่วยงาน (ภาษาอังกฤษ)</label>
                      <div className="relative">
                        <Code className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input type="text" value={officeNameEn} onChange={(e) => setOfficeNameEn(e.target.value)} className="w-full pl-14 pr-8 py-5 bg-slate-50 border-none rounded-[30px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all" />
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-4">จำนวนช่องบริการ</label>
                      <div className="relative">
                        <RefreshCcw className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input type="number" value={counterCount} onChange={(e) => setCounterCount(Number(e.target.value))} className="w-full pl-14 pr-8 py-5 bg-slate-50 border-none rounded-[30px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all" />
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-4">ลิขสิทธิ์ (Copyright)</label>
                      <div className="relative">
                        <Copyright className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input type="text" value={copyrightText} onChange={(e) => setCopyrightText(e.target.value)} className="w-full pl-14 pr-8 py-5 bg-slate-50 border-none rounded-[30px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all" />
                      </div>
                   </div>
                 </div>
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-4">URL รูปภาพโลโก้</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      <input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." className="w-full pl-14 pr-8 py-5 bg-slate-50 border-none rounded-[30px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all" />
                    </div>
                 </div>
              </div>

              <div className="flex flex-col gap-10">
                <div className="bg-[#0f172a] rounded-[60px] shadow-2xl overflow-hidden flex flex-col h-[500px]">
                   <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Terminal size={24} className="text-emerald-400" />
                        <h3 className="font-black text-white text-lg">Google Apps Script (Full Backend)</h3>
                      </div>
                      <button onClick={handleCopyCode} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full font-bold text-xs flex items-center gap-3 transition-all active:scale-95">
                        {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                        {copied ? 'คัดลอกแล้ว' : 'คัดลอกโค้ดทั้งหมด'}
                      </button>
                   </div>
                   <div className="flex-1 p-8 overflow-auto custom-scrollbar-dark">
                      <pre className="text-emerald-400/90 font-mono text-[13px] leading-relaxed whitespace-pre-wrap">
                        <code>{gasBackendCode}</code>
                      </pre>
                   </div>
                </div>

                <div className="bg-white rounded-[60px] shadow-sm border border-slate-100 p-12 space-y-10">
                   <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4">
                     <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#007a4d]"><Database size={20}/></div>
                     ตั้งค่าจัดการระบบและสำรองข้อมูล
                   </h3>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2"><Speaker size={14}/> ระบบเสียงเรียกคิว (Voice Mode)</label>
                      <div className="grid grid-cols-2 gap-4">
                         <button 
                           onClick={() => setVoiceMode('gemini')}
                           className={`p-5 rounded-[25px] font-bold border transition-all ${voiceMode === 'gemini' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                         >
                           Gemini AI Voice (ชัดเจน)
                         </button>
                         <button 
                           onClick={() => setVoiceMode('local')}
                           className={`p-5 rounded-[25px] font-bold border transition-all ${voiceMode === 'local' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                         >
                           Local Voice (ประหยัดโควตา)
                         </button>
                      </div>
                      <button 
                        onClick={async () => {
                          const text = "ทดสอบระบบเสียงเรียกคิว ภาษาไทย ค่ะ";
                          if (voiceMode === 'gemini') {
                            try {
                              const base64 = await generateThaiTTS(text);
                              if (base64) {
                                const audio = new Audio(`data:audio/mp3;base64,${base64}`);
                                audio.play();
                              }
                            } catch (e) {
                              alert("Gemini TTS Error: " + e);
                            }
                          } else {
                            const msg = new SpeechSynthesisUtterance(text);
                            msg.lang = 'th-TH';
                            window.speechSynthesis.speak(msg);
                          }
                        }}
                        className="w-full py-3 rounded-[20px] bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                      >
                        <Play size={14} /> ทดสอบเสียงเรียกคิว
                      </button>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2"><LinkIcon size={14}/> GOOGLE APP SCRIPT URL</label>
                      <input type="text" value={gasUrl} onChange={(e) => setGasUrl(e.target.value)} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[25px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all" />
                   </div>
                   <div className="grid grid-cols-3 gap-6">
                      <button onClick={handleSyncData} className="flex flex-col items-center justify-center p-8 bg-white border border-slate-100 rounded-[35px] hover:border-[#007a4d]/30 hover:shadow-xl transition-all active:scale-95 group">
                         <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-[#007a4d] mb-4 group-hover:scale-110 transition-transform"><LinkIcon size={24} /></div>
                         <span className="font-black text-slate-700 text-sm">เชื่อมต่อข้อมูล</span>
                      </button>
                      <button className="flex flex-col items-center justify-center p-8 bg-white border border-slate-100 rounded-[35px] hover:border-blue-500/30 hover:shadow-xl transition-all active:scale-95 group">
                         <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform"><Download size={24} /></div>
                         <span className="font-black text-slate-700 text-sm">ดึงข้อมูล</span>
                      </button>
                      <button className="flex flex-col items-center justify-center p-8 bg-white border border-slate-100 rounded-[35px] hover:border-amber-500/30 hover:shadow-xl transition-all active:scale-95 group">
                         <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform"><RefreshCcw size={24} /></div>
                         <span className="font-black text-slate-700 text-sm">คืนข้อมูล</span>
                      </button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Member Modal */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
           <div className="bg-white rounded-[50px] shadow-2xl w-full max-w-lg overflow-hidden animate-scaleUp">
              <div className="bg-[#007a4d] p-10 text-white relative">
                 <button onClick={() => setIsMemberModalOpen(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"><X size={24} /></button>
                 <h2 className="text-3xl font-black tracking-tight">{editingMember ? 'แก้ไขข้อมูลสมาชิก' : 'เพิ่มสมาชิกใหม่'}</h2>
              </div>
              <form onSubmit={handleSaveMember} className="p-12 space-y-8">
                 <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อ-นามสกุล</label>
                    <input required type="text" value={memberFormData.fullName} onChange={(e) => setMemberFormData({...memberFormData, fullName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-[25px] px-8 py-5 font-bold text-slate-700 outline-none" />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">เลขบัตรประชาชน</label>
                      <input required type="text" maxLength={13} value={memberFormData.idCard} onChange={(e) => setMemberFormData({...memberFormData, idCard: e.target.value.replace(/\D/g, '')})} className="w-full bg-slate-50 border border-slate-100 rounded-[25px] px-8 py-5 font-bold text-slate-700 outline-none" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">เบอร์โทรศัพท์</label>
                      <input required type="text" maxLength={10} value={memberFormData.phone} onChange={(e) => setMemberFormData({...memberFormData, phone: e.target.value.replace(/\D/g, '')})} className="w-full bg-slate-50 border border-slate-100 rounded-[25px] px-8 py-5 font-bold text-slate-700 outline-none" />
                   </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">รหัสผ่าน</label>
                      <input required type="password" value={memberFormData.password} onChange={(e) => setMemberFormData({...memberFormData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-[25px] px-8 py-5 font-bold text-slate-700 outline-none" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">ยืนยันรหัสผ่าน</label>
                      <input required type="password" value={memberFormData.confirmPassword} onChange={(e) => setMemberFormData({...memberFormData, confirmPassword: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-[25px] px-8 py-5 font-bold text-slate-700 outline-none" />
                   </div>
                 </div>
                 <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setIsMemberModalOpen(false)} className="flex-1 py-5 rounded-[25px] font-black text-slate-400 hover:bg-slate-50 transition-colors">ยกเลิก</button>
                    <button type="submit" className="flex-[2] bg-[#007a4d] text-white py-5 rounded-[25px] font-black text-xl shadow-2xl hover:bg-[#00643d] transition-colors active:scale-95">บันทึก</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <style>{`
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-scaleUp { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar-dark::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-dark::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AdminPage;
