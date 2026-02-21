
import React, { useState, useEffect, useRef } from 'react';
import { QueueItem } from '../types';
import { Bell, Clock, Volume2, VolumeX, Speaker } from 'lucide-react';
import { generateThaiTTS } from '../services/geminiService';

interface DisplayPageProps {
  queues: QueueItem[];
  counters: { [key: number]: QueueItem | null };
}

const DisplayPage: React.FC<DisplayPageProps> = ({ queues, counters }) => {
  const [time, setTime] = useState(new Date());
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [announcementQueue, setAnnouncementQueue] = useState<{number: string, counterId: string, type: 'new' | 'update'}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const prevCountersRef = useRef<{ [key: number]: { id: string | null, timestamp: number } }>({});
  const audioContextRef = useRef<AudioContext | null>(null);

  // Dynamic counter list from keys of current counters object
  const counterIds = Object.keys(counters).map(Number).sort((a, b) => a - b);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize AudioContext on first interaction
  const enableAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setAudioEnabled(true);
    setAudioBlocked(false);
  };

  // Global click listener to resume audio context if it was blocked
  useEffect(() => {
    const handleGesture = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().then(() => {
          setAudioBlocked(false);
        });
      }
    };
    window.addEventListener('click', handleGesture);
    return () => window.removeEventListener('click', handleGesture);
  }, []);

  // Process the announcement queue sequentially
  useEffect(() => {
    const processQueue = async () => {
      if (announcementQueue.length === 0 || isProcessing) return;
      
      setIsProcessing(true);
      const next = announcementQueue[0];
      
      try {
        await announceQueue(next.number, next.counterId, next.type);
      } catch (e) {
        console.error("Announcement failed:", e);
      } finally {
        setAnnouncementQueue(prev => prev.slice(1));
        setIsProcessing(false);
      }
    };

    processQueue();
  }, [announcementQueue, isProcessing]);

  const playChime = (type: 'new' | 'update'): Promise<void> => {
    return new Promise((resolve) => {
      if (!audioEnabled) {
        resolve();
        return;
      }
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;

      if (ctx.state === 'suspended') {
        setAudioBlocked(true);
        resolve();
        return;
      }

      const createChimeTone = (freq: number, start: number, duration: number, volume: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine'; // Sine is smoother for chimes
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(volume, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      // Standard double-tone chime (Ding-Dong)
      // First tone: E5 (659.25 Hz)
      // Second tone: C5 (523.25 Hz)
      createChimeTone(659.25, now, 1.2, 0.15); 
      createChimeTone(523.25, now + 0.4, 1.5, 0.12);
      
      setTimeout(resolve, 1800); // Wait for chime to finish gracefully
    });
  };

  const announceQueue = async (queueNumber: string, counterId: string, type: 'new' | 'update' = 'new') => {
    if (!audioEnabled) return;

    // Format queue number for clearer speech (e.g., A 0 0 4)
    const charPart = queueNumber.charAt(0);
    const numPart = queueNumber.substring(1).split('').join(' ');
    const textToSpeak = `ขอเชิญหมายเลขคิว ${charPart} ${numPart} ที่ช่องบริการหมายเลข ${counterId} ค่ะ`;
    
    // เล่นเสียง Chime และรอให้จบ
    await playChime(type);

    const voiceMode = localStorage.getItem('alro_voice_mode') || 'gemini';

    // ลองใช้ Gemini TTS ถ้าเลือกโหมด gemini
    let useFallback = voiceMode === 'local';
    if (!useFallback) {
      try {
        const base64Audio = await generateThaiTTS(textToSpeak);
        
        if (base64Audio && audioContextRef.current) {
          const ctx = audioContextRef.current;
          const binaryString = window.atob(base64Audio);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          const pcmData = new Int16Array(bytes.buffer);
          const audioBuffer = ctx.createBuffer(1, pcmData.length, 24000);
          const channelData = audioBuffer.getChannelData(0);
          
          for (let i = 0; i < pcmData.length; i++) {
            channelData[i] = pcmData[i] / 32768;
          }
          
          return new Promise<void>((resolve) => {
            if (ctx.state === 'suspended') {
              setAudioBlocked(true);
              resolve();
              return;
            }
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.onended = () => {
              setTimeout(resolve, 500);
            };
            source.start();
          });
        } else {
          useFallback = true;
        }
      } catch (error) {
        console.warn("Gemini TTS unavailable, using local fallback.");
        useFallback = true;
      }
    }

    if (useFallback) {
      return new Promise<void>((resolve) => {
        const msg = new SpeechSynthesisUtterance();
        msg.text = textToSpeak;
        msg.lang = 'th-TH';
        msg.rate = 1.0;
        
        const speak = () => {
          const voices = window.speechSynthesis.getVoices();
          const thaiVoice = voices.find(v => v.lang.includes('th-TH') || v.lang.includes('th_TH'));
          if (thaiVoice) msg.voice = thaiVoice;

          msg.onend = () => {
            setTimeout(resolve, 500);
          };
          
          msg.onerror = (e) => {
            console.error("SpeechSynthesis error:", e);
            resolve();
          };

          window.speechSynthesis.speak(msg);
        };

        if (window.speechSynthesis.getVoices().length === 0) {
          window.speechSynthesis.onvoiceschanged = speak;
        } else {
          speak();
        }
      });
    }
  };

  useEffect(() => {
    Object.entries(counters).forEach(([id, queue]) => {
      const q = queue as QueueItem | null;
      const counterId = parseInt(id);
      const currentQueueId = q?.id || null;
      const currentTimestamp = q ? new Date(q.timestamp).getTime() : 0;
      
      const prevData = prevCountersRef.current[counterId] || { id: null, timestamp: 0 };

      // เพิ่มลงใน Queue ถ้า ID เปลี่ยน หรือ Timestamp เปลี่ยน (เรียกซ้ำ)
      if (currentQueueId && (currentQueueId !== prevData.id || currentTimestamp !== prevData.timestamp)) {
        setAnnouncementQueue(prev => [...prev, { 
          number: q!.number, 
          counterId: id, 
          type: currentQueueId !== prevData.id ? 'new' : 'update' 
        }]);
      }
      prevCountersRef.current[counterId] = { id: currentQueueId, timestamp: currentTimestamp };
    });
  }, [counters]);

  const currentCalling = (Object.values(counters) as (QueueItem | null)[])
    .filter((q): q is QueueItem => q !== null)
    .sort((a, b) => (new Date(b.timestamp).getTime() || 0) - (new Date(a.timestamp).getTime() || 0));

  const latestCall = currentCalling[0];

  const logoUrl = localStorage.getItem('alro_logo_url') || "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Emblem_of_Thailand.svg/1200px-Emblem_of_Thailand.svg.png";

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col bg-white animate-fadeIn font-['Prompt']">
      
      {audioBlocked && (
        <div className="fixed inset-0 z-[100] bg-[#007a4d]/95 backdrop-blur-xl flex flex-col items-center justify-center text-white p-6">
          <div className="bg-white/10 p-12 rounded-[60px] border border-white/20 flex flex-col items-center shadow-2xl animate-scaleUp max-w-lg text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-8">
               <Volume2 size={40} className="text-[#007a4d]" />
            </div>
            <h2 className="text-3xl font-black mb-4">เปิดระบบเสียงประกาศ</h2>
            <p className="opacity-80 mb-10 text-lg">กรุณาคลิกเพื่อเปิดใช้งานเสียงเรียกคิวอัตโนมัติ</p>
            <button onClick={enableAudio} className="bg-white text-[#007a4d] px-12 py-5 rounded-full font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all">เปิดเสียง</button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Left Section: Active Calling Area */}
        <div className="flex-[3] p-12 flex flex-col items-center justify-center border-r border-slate-50 relative bg-white">
          <div className="text-center z-10 w-full max-w-2xl">
            {latestCall ? (
              <div className="animate-scaleUp">
                <div className="flex items-center justify-center gap-4 mb-10">
                   <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                   <h2 className="text-4xl font-black text-[#1e293b]">ขณะนี้กำลังเรียกหมายเลขคิว</h2>
                </div>
                
                <div className="relative inline-block mb-10">
                   <div className="text-[16rem] font-black text-[#1e293b] leading-none tracking-tighter drop-shadow-sm">
                      {latestCall.number}
                   </div>
                </div>

                <div className="text-2xl font-bold text-slate-400">
                  ช่องบริการหมายเลข {latestCall.counter}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center opacity-80 animate-fadeIn">
                 <div className="w-80 h-80 bg-slate-50 rounded-[60px] border border-slate-100 flex items-center justify-center mb-10 relative">
                    <Speaker size={180} className="text-slate-100" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-500/20 ring-4 ring-emerald-500/10"></div>
                 </div>
                 <div className="flex items-center gap-3 mb-10">
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    <h2 className="text-3xl font-black text-[#1e293b]">ขณะนี้กำลังเรียกหมายเลขคิว</h2>
                 </div>
                 
                 <div className="w-64 h-64 border-[3px] border-dashed border-slate-100 rounded-[50px] flex flex-col items-center justify-center p-8 bg-white mb-10">
                    <img src={logoUrl} alt="Logo" className="w-20 h-20 object-contain grayscale opacity-20 mb-4" />
                    <span className="text-xs font-black text-slate-200 uppercase tracking-widest">Logo</span>
                 </div>
                 
                 <p className="text-2xl font-bold text-slate-300">รอการเรียกคิวถัดไป</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Queue Board */}
        <div className="flex-[2] bg-slate-50/30 p-10 flex flex-col">
           <div className="flex items-center justify-between mb-12">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">กระดานคิว</h3>
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-300 flex items-center justify-center hover:text-emerald-500 transition-colors">
                  <Bell size={20} />
                </button>
                <button 
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${audioEnabled ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-500 border border-rose-100'}`}
                >
                  {audioEnabled ? <><Volume2 size={16} /> เสียง: เปิด</> : <><VolumeX size={16} /> เสียง: ปิด</>}
                </button>
              </div>
           </div>

           <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {counterIds.map(id => {
                const q = counters[id];
                const isCalling = q !== null;
                const isLatest = q?.id === latestCall?.id;
                
                return (
                  <div key={id} className={`flex items-center justify-between p-6 bg-white rounded-[35px] shadow-sm border border-white transition-all duration-500 ${isLatest ? 'ring-2 ring-emerald-500/20 scale-[1.02]' : ''}`}>
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-[20px] bg-slate-50 flex items-center justify-center text-xl font-black text-slate-400">
                        {id}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">COUNTER</span>
                      </div>
                    </div>
                    
                    <div className={`text-6xl font-black tracking-tighter ${isCalling ? 'text-[#1e293b]' : 'text-slate-100'}`}>
                      {isCalling ? q.number : '---'}
                    </div>
                  </div>
                );
              })}
           </div>

           {/* Waiting Summary */}
           <div className="mt-10 pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                 <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                   <Clock size={14} /> คิวที่รอเรียก
                 </h4>
                 <div className="text-[11px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">
                   {queues.filter(q => q.status === 'waiting').length} คิว
                 </div>
              </div>
           </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-scaleUp { animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default DisplayPage;
