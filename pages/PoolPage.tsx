
import React, { useState, useRef } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { PrintButton } from '../components/PrintButton';
import { PoolTicket } from '../components/PoolTicket';
import { 
    Waves, Plus, Ticket, Check, X, QrCode, User, Crown, MapPin, Printer, ExternalLink, 
    Camera, CreditCard, Scan, Maximize2, ShieldCheck, UserCheck 
} from 'lucide-react';
import { PoolPass } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { renderToStaticMarkup } from 'react-dom/server';

export const PoolPage: React.FC = () => {
  const { poolPasses, createPoolPass, invalidatePoolPass, settings, rooms, addQRRecord, currentUser, addNotification } = useHotel();
  const [showModal, setShowModal] = useState(false);
  const [successQR, setSuccessQR] = useState<{ pass: PoolPass, url: string } | null>(null);
  const [zoomedQR, setZoomedQR] = useState<PoolPass | null>(null);

  const canIssueTickets = ['manager', 'assistant_manager', 'reception_manager', 'receptionist'].includes(currentUser?.role || '');
  
  // New Pass State
  const [passType, setPassType] = useState<'guest' | 'vip' | 'external'>('external');
  const [accessZone, setAccessZone] = useState<'general' | 'vip_lounge' | 'family_area'>('general');
  const [holderName, setHolderName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [price, setPrice] = useState(2000);
  const [roomId, setRoomId] = useState<number>(0);

  // Camera State
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getThemeStyles = () => {
      // Radical Fix: Dark mode overrides all themes for consistency but respects theme identity
      if (settings.darkMode) {
          if (settings.theme === 'zellige') {
              return {
                  button: 'bg-[#cca43b] text-[#001e21] hover:bg-[#b08d30] font-bold',
                  modalBg: 'bg-[#001e21] text-[#cca43b]',
                  modalHeader: 'bg-[#002a2d] text-[#cca43b] border-b border-[#cca43b]/20',
                  modalInput: 'border-[#cca43b]/40 focus:border-[#cca43b] bg-[#001517] text-[#cca43b] placeholder-[#cca43b]/40',
                  activeTab: 'bg-[#cca43b] text-[#001e21] border-[#cca43b]',
                  inactiveTab: 'bg-[#002a2d] text-[#cca43b]/60 border-[#cca43b]/20 hover:bg-[#cca43b]/10',
                  badgePattern: 'bg-zellige-pattern opacity-20'
              };
          }
           if (settings.theme === 'algerian-military') {
              return {
                  button: 'bg-[#D4AF37] text-[#1a211a] hover:bg-[#b08d30] border border-[#D4AF37]',
                  modalBg: 'bg-[#0f140f] text-[#D4AF37]',
                  modalHeader: 'bg-[#1a211a] text-[#D4AF37] border-b border-[#D4AF37]/30',
                  modalInput: 'border-[#D4AF37]/40 focus:border-[#D4AF37] bg-[#0f140f] text-[#D4AF37] placeholder-[#D4AF37]/40',
                  activeTab: 'bg-[#D4AF37] text-[#1a211a] border border-[#D4AF37]',
                  inactiveTab: 'bg-[#1a211a] text-[#D4AF37]/60 border-[#D4AF37]/30',
                  badgePattern: 'bg-military-pattern opacity-20'
              };
          }
          return {
              button: 'bg-cyan-600 text-white hover:bg-cyan-700',
              modalBg: 'bg-gray-900 text-white',
              modalHeader: 'bg-gray-800 text-white border-b border-gray-700',
              modalInput: 'border-gray-700 bg-gray-800 text-white placeholder-gray-500',
              activeTab: 'bg-cyan-600 text-white border-cyan-600',
              inactiveTab: 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700',
              badgePattern: ''
          };
      }

      switch (settings.theme) {
          case 'zellige': return {
              button: 'bg-[#006269] text-[#cca43b] hover:bg-[#004d53]',
              modalBg: 'bg-[#FDFBF7]',
              modalHeader: 'bg-[#006269] text-[#cca43b] border-b-8 border-[#cca43b]',
              modalInput: 'border-[#cca43b]/40 focus:border-[#006269] bg-[#fbf8f1] text-[#006269]',
              activeTab: 'bg-[#006269] text-[#cca43b] border-[#cca43b]',
              inactiveTab: 'bg-white text-[#006269] border-[#cca43b]/30',
              badgePattern: 'bg-zellige-pattern'
          };
          case 'algerian-military': return {
              button: 'bg-[#2F3E2E] text-[#D4AF37] hover:bg-[#4B5320] border border-[#D4AF37]',
              modalBg: 'bg-[#F0EFEA]',
              modalHeader: 'bg-[#2F3E2E] text-[#D4AF37] border-b-4 border-[#D4AF37]',
              modalInput: 'border-[#D4AF37]/40 focus:border-[#2F3E2E] bg-[#F0EFEA] text-[#2F3E2E]',
              activeTab: 'bg-[#2F3E2E] text-[#D4AF37] border border-[#D4AF37]',
              inactiveTab: 'bg-[#F0EFEA] text-[#2F3E2E] border-[#D4AF37]/30',
              badgePattern: 'bg-military-pattern'
          };
          default: return {
              button: 'bg-cyan-600 text-white hover:bg-cyan-700',
              modalBg: 'bg-white',
              modalHeader: 'bg-slate-900 text-white border-b border-gray-700',
              modalInput: 'border-gray-200 bg-white text-gray-900',
              activeTab: 'bg-cyan-600 text-white',
              inactiveTab: 'bg-white text-gray-600 border-gray-200',
              badgePattern: ''
          };
      }
  };
  const ts = getThemeStyles();

  // --- Camera Logic ---
  const startCamera = async () => {
      setShowCamera(true);
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
              video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
          });
          if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
          console.error("Camera error", err);
          addNotification("تعذر الوصول للكاميرا الخلفية. يرجى التأكد من الصلاحيات.", "error");
          setShowCamera(false);
      }
  };

  const stopCamera = () => {
      setShowCamera(false);
      if (videoRef.current && videoRef.current.srcObject) {
          (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
  };

  const captureId = () => {
      stopCamera();
      addNotification("تم مسح الوثيقة بنجاح والتعرف على البيانات (محاكاة OCR)", "success");
      if (!holderName) setHolderName("زائر جديد (مسح آلي)");
      if (!idNumber) setIdNumber("P-99238421");
  };

  const handleIssuePass = (e: React.FormEvent) => {
      e.preventDefault();
      if (!holderName) return;
      if (passType === 'external' && !idNumber) {
          addNotification('الرجاء إدخال رقم الهوية للزوار الخارجيين', "warning");
          return;
      }
      
      const newPass: PoolPass = {
          id: `pass-${Date.now()}`,
          holderName,
          idNumber: idNumber || undefined,
          type: passType,
          accessZone,
          relatedRoomId: passType === 'guest' ? roomId : undefined,
          date: new Date().toISOString(),
          expiryTime: '18:00', // Mock end of day
          price: passType === 'guest' ? 0 : price,
          isValid: true,
          qrCodeData: '', // Will be generated
          seatNumber,
          tableNumber
      };
      
      const createdPass = createPoolPass(newPass);
      
      // Generate Portal Link
      const portalPayload = JSON.stringify({
          type: 'pool_chair',
          id: createdPass.id, 
          name: createdPass.holderName,
          expiry: new Date(Date.now() + 28800000).toISOString() // 8 hours
      });
      // SAFE UNICODE ENCODING
      const url = `https://nuzul-hotel.com/guest-services?token=${btoa(unescape(encodeURIComponent(portalPayload)))}`;

      // Register in Security System
      addQRRecord({
          type: 'pool_pass',
          referenceId: createdPass.id,
          title: `مسبح: ${createdPass.holderName}`,
          subtitle: `${createdPass.type} - ${createdPass.accessZone}`,
          status: 'valid',
          dataPayload: `POOL:${createdPass.id}`
      }, 'access_pass');

      setSuccessQR({ pass: createdPass, url });
      setShowModal(false);
      
      // Reset
      setHolderName('');
      setIdNumber('');
      setPrice(2000);
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
        <PageHeader pageKey="pool" defaultTitle="المسبح والنادي" icon={Waves} />

        <div className="flex justify-end mb-6">
            {canIssueTickets && (
                <button onClick={() => setShowModal(true)} className={`px-6 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2 transition transform hover:-translate-y-1 ${ts.button}`}>
                    <Ticket size={20} /> إصدار تذكرة
                </button>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {poolPasses.map(pass => (
                <div key={pass.id} className={`p-6 rounded-[2rem] shadow-sm relative overflow-hidden border transition-all hover:shadow-md ${!pass.isValid ? 'opacity-50 grayscale' : ''} ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] border-[#cca43b]/30' : 'bg-white dark:bg-gray-800 dark:border-gray-700'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/20 text-[#cca43b]' : 'bg-cyan-100 text-cyan-600'}`}>
                            {pass.type === 'vip' ? <Crown size={24}/> : <Waves size={24}/>}
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                            pass.isValid 
                                ? (settings.darkMode && settings.theme === 'zellige' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-green-100 text-green-700')
                                : (settings.darkMode && settings.theme === 'zellige' ? 'bg-red-900/30 text-red-400 border border-red-800' : 'bg-red-100 text-red-700')
                        }`}>
                            {pass.isValid ? 'سارية' : 'منتهية'}
                        </span>
                    </div>
                    
                    <h3 className={`text-xl font-black mb-1 ${settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]' : 'text-gray-800 dark:text-gray-100'}`}>{pass.holderName}</h3>
                    <p className={`text-sm font-bold mb-1 uppercase tracking-wide ${settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]/70' : 'text-gray-500'}`}>{pass.type} • {pass.accessZone.replace('_', ' ')}</p>
                    
                    {(pass.tableNumber || pass.seatNumber) && (
                        <div className="flex gap-2 mb-2">
                            {pass.tableNumber && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/10 text-[#cca43b]' : 'bg-blue-50 text-blue-600'}`}>
                                    طاولة: {pass.tableNumber}
                                </span>
                            )}
                            {pass.seatNumber && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/10 text-[#cca43b]' : 'bg-emerald-50 text-emerald-600'}`}>
                                    مقعد: {pass.seatNumber}
                                </span>
                            )}
                        </div>
                    )}

                    {pass.idNumber && <p className={`text-[10px] font-mono mb-4 uppercase ${settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]/50' : 'text-gray-400'}`}>ID: {pass.idNumber}</p>}
                    
                    {pass.isValid && (
                        <div className={`p-3 rounded-2xl flex items-center justify-between mb-4 border ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#001e21] border-[#cca43b]/30' : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
                            <div className="relative group cursor-pointer" onClick={() => setZoomedQR(pass)}>
                                <QrCode size={48} className={`${settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]' : 'text-gray-800 dark:text-white'}`}/>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 rounded transition">
                                    <Maximize2 size={16} className="text-white drop-shadow-md"/>
                                </div>
                            </div>
                            <div className="text-left pl-2">
                                <span className={`block text-[10px] font-bold uppercase ${settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]/60' : 'text-gray-500'}`}>Valid Until</span>
                                <span className={`font-mono font-black text-lg ${settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]' : 'text-gray-800 dark:text-gray-200'}`}>{pass.expiryTime}</span>
                            </div>
                        </div>
                    )}

                    {pass.isValid && (
                        <div className="flex gap-2 mt-auto">
                            <button onClick={() => { if(window.confirm('إلغاء الصلاحية؟')) invalidatePoolPass(pass.id) }} className={`flex-1 py-3 border rounded-xl font-bold text-xs transition ${settings.darkMode && settings.theme === 'zellige' ? 'border-red-900/50 text-red-400 hover:bg-red-900/20' : 'border-red-200 text-red-600 hover:bg-red-50'}`}>
                                إنهاء
                            </button>
                            <button onClick={() => setZoomedQR(pass)} className={`flex-1 py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-md ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b] text-[#001e21] hover:bg-[#b08d30]' : 'bg-gray-900 text-white hover:bg-black'}`}>
                                <Maximize2 size={14}/> عرض QR
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>

        {/* --- ZOOMED QR MODAL --- */}
        {zoomedQR && (
            <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-6 backdrop-blur-xl animate-fade-in" onClick={() => setZoomedQR(null)}>
                <div 
                    className={`w-full max-w-sm rounded-[3rem] p-8 relative shadow-2xl flex flex-col items-center transform transition-all scale-100 ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#001e21] border border-[#cca43b]/30' : 'bg-white'}`} 
                    onClick={e => e.stopPropagation()}
                >
                    <button onClick={() => setZoomedQR(null)} className={`absolute top-6 right-6 p-2 rounded-full transition z-20 ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/20 text-[#cca43b] hover:bg-[#cca43b]/40' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
                        <X size={24} />
                    </button>

                    <div className="mb-8 text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/20 text-[#cca43b]' : 'bg-cyan-100 text-cyan-600'}`}>
                            <Ticket size={32} />
                        </div>
                        <h3 className={`text-2xl font-black ${settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]' : 'text-gray-900'}`}>{zoomedQR.holderName}</h3>
                        <span className={`inline-block mt-2 px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-widest ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] text-[#cca43b] border border-[#cca43b]/30' : 'bg-gray-900 text-white'}`}>
                            {zoomedQR.type} ACCESS
                        </span>
                    </div>

                    <div className={`p-6 rounded-[2.5rem] border-4 shadow-2xl mb-8 w-full aspect-square flex items-center justify-center relative overflow-hidden group ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#FDFBF7] border-[#cca43b]' : 'bg-white border-black'}`}>
                        <QRCodeSVG value={`POOL:${zoomedQR.id}`} size={256} />
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-[scan_2.5s_infinite]"></div>
                    </div>

                    <div className={`w-full flex justify-between items-center text-sm font-bold border-t pt-6 ${settings.darkMode && settings.theme === 'zellige' ? 'border-[#cca43b]/20 text-[#cca43b]/60' : 'text-gray-500'}`}>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase">Expires At</span>
                            <span className={`text-lg font-mono ${settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]' : 'text-gray-900'}`}>{zoomedQR.expiryTime}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase">ID Verified</span>
                            {zoomedQR.idNumber ? (
                                <span className="text-green-600 flex items-center gap-1"><ShieldCheck size={14}/> YES</span>
                            ) : (
                                <span className="text-gray-400">--</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- SUCCESS CREATION MODAL --- */}
        {successQR && (
            <div className="fixed inset-0 bg-black/90 z-[150] flex items-center justify-center p-6 backdrop-blur-xl animate-fade-in">
                <div className={`w-full max-w-md rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col items-center p-8 ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#001e21] text-[#cca43b] border border-[#cca43b]/30' : 'bg-white text-gray-900'}`}>
                    
                    <button onClick={() => setSuccessQR(null)} className={`absolute top-6 right-6 p-2 rounded-full transition z-20 ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/10 text-[#cca43b] hover:bg-[#cca43b]/20' : 'hover:bg-gray-100 text-gray-500'}`}>
                        <X size={24} />
                    </button>

                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-inner ${settings.darkMode && settings.theme === 'zellige' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'}`}>
                        <Check size={40} strokeWidth={4} />
                    </div>

                    <h3 className="text-2xl font-black mb-1">تم إصدار التذكرة</h3>
                    <p className={`text-sm font-bold mb-8 ${settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]/60' : 'text-gray-500'}`}>التذكرة جاهزة للاستخدام</p>
                    
                    <div className={`p-6 rounded-[2.5rem] shadow-2xl mb-6 relative group cursor-pointer ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] border border-[#cca43b]/30' : 'bg-gray-900'}`} onClick={() => window.open(successQR.url, '_blank')}>
                        <div className="bg-white p-2 rounded-xl">
                            <QRCodeSVG value={successQR.url} size={224} />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-[2.5rem]">
                            <span className="text-white font-bold flex items-center gap-2">
                                <ExternalLink size={20}/> محاكاة (فتح الرابط)
                            </span>
                        </div>
                    </div>

                    <div className={`p-4 rounded-2xl w-full text-center border mb-6 ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] border-[#cca43b]/20' : 'bg-gray-50 border-gray-100'}`}>
                        <p className={`text-xs font-bold uppercase mb-1 ${settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]/50' : 'text-gray-400'}`}>الزائر</p>
                        <p className="text-lg font-black">{successQR.pass.holderName}</p>
                        {successQR.pass.idNumber && <p className={`text-xs font-mono mt-1 uppercase ${settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]/60' : 'text-gray-500'}`}>ID: {successQR.pass.idNumber}</p>}
                    </div>

                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={() => { setZoomedQR(successQR.pass); setSuccessQR(null); }}
                            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b] text-[#001e21] hover:bg-[#b08d30]' : 'bg-gray-900 text-white hover:bg-black'}`}
                        >
                            <Maximize2 size={16}/> عرض QR
                        </button>
                        {canIssueTickets && (
                            <PrintButton 
                                label="طباعة"
                                className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] text-[#cca43b] border border-[#cca43b]/30 hover:bg-[#cca43b]/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                variants={['modern', 'classic', 'minimal', 'elegant', 'technical', 'compact']}
                                defaultVariant="modern"
                                templateType="pool_pass"
                                data={{
                                    guestName: successQR.pass.holderName,
                                    date: new Date(successQR.pass.date).toLocaleDateString('ar-DZ'),
                                    passId: successQR.pass.id.slice(-6).toUpperCase()
                                }}
                                renderContent={(variant) => (
                                    <PoolTicket 
                                        pass={successQR.pass}
                                        appName={settings.appName}
                                        variant={variant}
                                    />
                                )}
                            />
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* --- ISSUE TICKET MODAL --- */}
        {showModal && (
            <div className="fixed inset-0 bg-black/60 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-sm overflow-hidden">
                <div className={`w-full max-w-4xl rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl relative flex flex-col h-[100dvh] md:max-h-[85vh] overflow-hidden ${ts.modalBg} dark:bg-gray-900 dark:text-white border border-white/20 animate-fade-in-up`}>
                    
                    {/* Header */}
                    <div className={`p-6 flex justify-between items-center shrink-0 shadow-sm relative z-30 ${ts.modalHeader}`}>
                        {settings.theme === 'zellige' && <div className={`absolute inset-0 opacity-10 pointer-events-none ${ts.badgePattern} mix-blend-multiply`}></div>}
                        <h3 className="text-2xl font-black flex items-center gap-3 relative z-10">
                            <Ticket size={28} /> إصدار تذكرة مسبح
                        </h3>
                        <button onClick={() => setShowModal(false)} className="relative z-10 p-2 rounded-full hover:bg-white/20 transition text-current"><X size={24}/></button>
                    </div>
                    
                    <form onSubmit={handleIssuePass} className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50 dark:bg-gray-900/50 pb-24 md:pb-32 modal-content-area">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* Left Column: Visitor Identity */}
                            <div className="space-y-6">
                                <h4 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${settings.theme === 'zellige' ? 'text-[#006269]' : 'text-gray-400'}`}>
                                    <UserCheck size={16}/> بيانات الزائر
                                </h4>

                                {/* Type Selection */}
                                <div className="grid grid-cols-3 gap-2">
                                    {['external', 'guest', 'vip'].map(t => (
                                        <button 
                                            key={t}
                                            type="button"
                                            onClick={() => { setPassType(t as any); setPrice(t === 'vip' ? 5000 : t === 'guest' ? 0 : 2000); }}
                                            className={`py-3 rounded-xl font-bold text-xs capitalize transition border-2 ${passType === t ? ts.activeTab : ts.inactiveTab}`}
                                        >
                                            {t === 'external' ? 'زائر خارجي' : t === 'guest' ? 'نزيل فندق' : 'VIP'}
                                        </button>
                                    ))}
                                </div>

                                {passType === 'guest' ? (
                                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                        <label className="block text-xs font-bold mb-2">رقم الغرفة</label>
                                        <select className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.modalInput}`} value={roomId} onChange={e => setRoomId(Number(e.target.value))}>
                                            <option value={0}>اختر الغرفة...</option>
                                            {rooms.filter(r => r.status === 'occupied').map(r => (
                                                <option key={r.id} value={r.id}>{r.number}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Camera / ID Scan Section */}
                                        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden group ring-2 ring-gray-200 dark:ring-gray-700">
                                            {showCamera ? (
                                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-100 dark:bg-gray-800">
                                                    <Scan size={32} className="mb-2 opacity-50" />
                                                    <p className="text-xs font-bold">جاهز للمسح الضوئي</p>
                                                </div>
                                            )}
                                            
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="w-3/4 h-3/4 border-2 border-dashed border-white/50 rounded-xl"></div>
                                            </div>

                                            <div className="absolute bottom-3 right-3 left-3 flex gap-2 z-20">
                                                {!showCamera ? (
                                                    <button type="button" onClick={startCamera} className="flex-1 py-2 bg-black/50 backdrop-blur text-white text-xs font-bold rounded-lg hover:bg-black/70 transition flex items-center justify-center gap-2">
                                                        <Camera size={14}/> مسح الوثيقة (خلفي)
                                                    </button>
                                                ) : (
                                                    <button type="button" onClick={captureId} className="flex-1 py-2 bg-white text-black text-xs font-bold rounded-lg shadow-lg hover:bg-gray-100 transition">
                                                        التقاط الصورة
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold mb-1">رقم الطاولة</label>
                                                <input type="text" className={`w-full p-3 rounded-xl border-2 font-bold outline-none text-sm ${ts.modalInput}`} value={tableNumber} onChange={e => setTableNumber(e.target.value)} placeholder="T-01" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold mb-1">رقم المقعد</label>
                                                <input type="text" className={`w-full p-3 rounded-xl border-2 font-bold outline-none text-sm ${ts.modalInput}`} value={seatNumber} onChange={e => setSeatNumber(e.target.value)} placeholder="S-01" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold mb-1">الاسم الكامل</label>
                                                <input required type="text" className={`w-full p-3 rounded-xl border-2 font-bold outline-none text-sm ${ts.modalInput}`} value={holderName} onChange={e => setHolderName(e.target.value)} placeholder="الاسم" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold mb-1">رقم الهوية</label>
                                                <input required type="text" className={`w-full p-3 rounded-xl border-2 font-bold uppercase font-mono outline-none text-sm ${ts.modalInput}`} value={idNumber} onChange={e => setIdNumber(e.target.value.toUpperCase())} placeholder="AB-123456" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Ticket Details */}
                            <div className="space-y-6">
                                <h4 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${settings.theme === 'zellige' ? 'text-[#006269]' : 'text-gray-400'}`}>
                                    <Ticket size={16}/> تفاصيل التذكرة
                                </h4>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold mb-2">منطقة الدخول</label>
                                        <div className="space-y-2">
                                            {[
                                                { id: 'general', label: 'المسبح العام', icon: Waves },
                                                { id: 'family_area', label: 'مسبح العائلات', icon: User },
                                                { id: 'vip_lounge', label: 'VIP Lounge', icon: Crown }
                                            ].map(zone => (
                                                <button
                                                    key={zone.id}
                                                    type="button"
                                                    onClick={() => setAccessZone(zone.id as any)}
                                                    className={`w-full p-3 rounded-xl flex items-center gap-3 border-2 transition-all ${accessZone === zone.id ? ts.activeTab : ts.inactiveTab}`}
                                                >
                                                    <div className={`p-2 rounded-full ${accessZone === zone.id ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                                                        <zone.icon size={16}/>
                                                    </div>
                                                    <span className="font-bold text-sm">{zone.label}</span>
                                                    {accessZone === zone.id && <Check size={16} className="mr-auto"/>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold mb-2">السعر (د.ج)</label>
                                        <div className="relative">
                                            <input type="number" className={`w-full p-4 rounded-xl border-2 font-black text-xl outline-none ${ts.modalInput}`} value={price} onChange={e => setPrice(Number(e.target.value))} readOnly={passType === 'guest'} />
                                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={20}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>

                    <div className={`p-4 md:p-6 border-t dark:border-gray-700 flex justify-end gap-3 md:gap-4 absolute bottom-0 w-full z-20 pb-safe mobile-hide-on-keyboard ${settings.theme === 'zellige' ? 'bg-[#FDFBF7]' : 'bg-white dark:bg-gray-900'}`}>
                        <button type="button" onClick={() => setShowModal(false)} className="px-10 py-4 bg-gray-100 dark:bg-gray-700 rounded-2xl font-bold text-gray-600 dark:text-gray-300 transition">إلغاء</button>
                        <button onClick={handleIssuePass} className={`px-14 py-4 rounded-2xl font-black shadow-xl transition flex items-center justify-center gap-3 text-lg text-white ${ts.button}`}>
                            <Check size={24} strokeWidth={3} /> تأكيد وإصدار
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
