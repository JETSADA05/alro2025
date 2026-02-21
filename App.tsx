
import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import KioskPage from './pages/KioskPage';
import DisplayPage from './pages/DisplayPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { QueueItem, ServiceCode } from './types';

const Header = ({ officeName, logoUrl }: { officeName: string, logoUrl: string }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-[#007a4d] text-white px-6 py-3 flex justify-between items-center shadow-md sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-3">
        <div className="bg-white p-1 rounded-full w-10 h-10 flex items-center justify-center overflow-hidden shadow-sm">
          <img src={logoUrl || "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Emblem_of_Thailand.svg/1200px-Emblem_of_Thailand.svg.png"} alt="Logo" className="w-8 h-8 object-contain" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-tight">{officeName}</h1>
          <p className="text-[10px] opacity-70 uppercase tracking-wider font-medium">Province Land Reform Office</p>
        </div>
      </Link>
      
      <div className="hidden md:flex items-center gap-1 text-sm font-medium">
        <Link to="/" className={`px-4 py-2 rounded-lg transition-all ${isActive('/') ? 'bg-white/20' : 'hover:bg-white/10'}`}>หน้าแรก</Link>
        <Link to="/kiosk" className={`px-4 py-2 rounded-lg transition-all ${isActive('/kiosk') ? 'bg-white text-[#007a4d]' : 'hover:bg-white/10'}`}>ตู้รับบัตรคิว</Link>
        <Link to="/display" className={`px-4 py-2 rounded-lg transition-all ${isActive('/display') ? 'bg-white/20' : 'hover:bg-white/10'}`}>จอแสดงผล</Link>
        <Link to="/admin" className={`px-4 py-2 rounded-lg transition-all ${isActive('/admin') ? 'bg-white/20' : 'hover:bg-white/10'}`}>แอดมิน / เรียกคิว</Link>
        <Link to="/login" className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${isActive('/login') || isActive('/register') ? 'bg-white text-[#007a4d]' : 'hover:bg-white/10'}`}>
          <User size={16} /> สมาชิก
        </Link>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const [queues, setQueues] = useState<QueueItem[]>(() => {
    try {
      const savedQueues = localStorage.getItem('alro_queues');
      const parsed = savedQueues ? JSON.parse(savedQueues) : [];
      return Array.isArray(parsed) ? parsed.map((q: any) => ({ ...q, timestamp: new Date(q.timestamp) })) : [];
    } catch (e) {
      console.error("Failed to load queues", e);
      return [];
    }
  });
  
  useEffect(() => {
    localStorage.setItem('alro_queues', JSON.stringify(queues));
  }, [queues]);
  
  const [settings, setSettings] = useState({
    officeName: localStorage.getItem('alro_office_name') || 'สำนักงานการปฏิรูปที่ดินจังหวัดตรัง',
    officeNameEn: localStorage.getItem('alro_office_name_en') || 'PROVINCE LAND REFORM OFFICE QUEUE MANAGEMENT SYSTEM',
    copyrightText: localStorage.getItem('alro_copyright') || '© 2024 สงวนลิขสิทธิ์ตามกฎหมาย',
    counterCount: Number(localStorage.getItem('alro_counter_count')) || 5,
    logoUrl: localStorage.getItem('alro_logo_url') || 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Emblem_of_Thailand.svg/1200px-Emblem_of_Thailand.svg.png'
  });

  const [counters, setCounters] = useState<{ [key: number]: QueueItem | null }>(() => {
    const initialCounters: { [key: number]: QueueItem | null } = {};
    for (let i = 1; i <= settings.counterCount; i++) {
      initialCounters[i] = null;
    }
    return initialCounters;
  });

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setSettings({
        officeName: localStorage.getItem('alro_office_name') || 'สำนักงานการปฏิรูปที่ดินจังหวัดตรัง',
        officeNameEn: localStorage.getItem('alro_office_name_en') || 'PROVINCE LAND REFORM OFFICE QUEUE MANAGEMENT SYSTEM',
        copyrightText: localStorage.getItem('alro_copyright') || '© 2024 สงวนลิขสิทธิ์ตามกฎหมาย',
        counterCount: Number(localStorage.getItem('alro_counter_count')) || 5,
        logoUrl: localStorage.getItem('alro_logo_url') || 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Emblem_of_Thailand.svg/1200px-Emblem_of_Thailand.svg.png'
      });
    };

    window.addEventListener('alro_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('alro_settings_updated', handleSettingsUpdate);
  }, []);

  const generateQueue = useCallback((serviceCode: ServiceCode, regData: any) => {
    const serviceQueues = queues.filter(q => q.serviceCode === serviceCode);
    const lastNum = serviceQueues.length > 0 
      ? parseInt(serviceQueues[serviceQueues.length - 1].number.substring(1)) 
      : 0;
    const newNum = (lastNum + 1).toString().padStart(3, '0');
    
    const newQueue: QueueItem = {
      id: Math.random().toString(36).substr(2, 9),
      number: `${serviceCode}${newNum}`,
      serviceCode,
      serviceId: serviceCode,
      timestamp: new Date(),
      status: 'waiting',
      ...regData
    };

    setQueues(prev => [...prev, newQueue]);
    return newQueue;
  }, [queues]);

  const callNext = useCallback((counterId: number) => {
    const nextQueue = queues.find(q => q.status === 'waiting');
    if (nextQueue) {
      const updatedQueue: QueueItem = { ...nextQueue, status: 'calling', counter: counterId, timestamp: new Date() };
      setQueues(prev => prev.map(q => q.id === nextQueue.id ? updatedQueue : q));
      setCounters(prev => ({ ...prev, [counterId]: updatedQueue }));
      return updatedQueue;
    }
    return null;
  }, [queues]);

  const completeQueue = useCallback((counterId: number) => {
    const current = counters[counterId];
    if (current) {
      setQueues(prev => prev.map(q => q.id === current.id ? { ...q, status: 'completed' } : q));
      setCounters(prev => ({ ...prev, [counterId]: null }));
    }
  }, [counters]);

  const reCall = useCallback((counterId: number) => {
    const current = counters[counterId];
    if (current) {
      const updatedQueue: QueueItem = { ...current, timestamp: new Date() };
      setQueues(prev => prev.map(q => q.id === current.id ? updatedQueue : q));
      setCounters(prev => ({ ...prev, [counterId]: updatedQueue }));
      return updatedQueue;
    }
    return null;
  }, [counters]);

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col font-['Prompt']">
        <Header officeName={settings.officeName} logoUrl={settings.logoUrl} />
        <main className="flex-1 bg-gray-50">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/kiosk" element={<KioskPage onGenerate={generateQueue} />} />
            <Route path="/display" element={<DisplayPage queues={queues} counters={counters} />} />
            <Route path="/admin" element={<AdminPage queues={queues} counters={counters} onCallNext={callNext} onComplete={completeQueue} onReCall={reCall} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
        
        <footer className="bg-[#0f172a] text-white py-14 px-6 text-center border-t border-white/5">
            <div className="max-w-4xl mx-auto flex flex-col items-center">
                <div className="bg-white/5 p-4 rounded-full mb-6 shadow-2xl border border-white/10 ring-4 ring-white/5">
                     <img 
                      src={settings.logoUrl || "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Emblem_of_Thailand.svg/1200px-Emblem_of_Thailand.svg.png"} 
                      alt="Logo" 
                      className="w-12 h-12 object-contain" 
                     />
                </div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2 text-white">
                  {settings.officeName}
                </h2>
                <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-8 max-w-lg leading-relaxed">
                  {settings.officeNameEn}
                </p>
                <div className="w-12 h-[1px] bg-slate-700/60 mb-8"></div>
                <p className="text-[10px] md:text-xs text-slate-500 font-medium tracking-wide">
                  {settings.copyrightText}
                </p>
            </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
