import React, { useState } from 'react';
import { 
    QrCode, Scan, Camera, X, ShieldCheck, 
    UserPlus, Key, ArrowLeft, Sparkles, 
    Smartphone, Info, ChevronLeft, Building2,
    Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HotelQRCode } from './HotelQRCode';

interface EntryScannerProps {
    onScanResident?: (code: string) => void;
    onRegisterVisitor?: () => void;
    onManualEntry?: (code: string) => void;
    onScan?: (code: string) => void;
    onLogoClick?: () => void;
    hotelName: string;
    minimal?: boolean;
}

export const EntryScanner: React.FC<EntryScannerProps> = ({ 
    onScanResident, 
    onRegisterVisitor, 
    onManualEntry,
    onScan,
    onLogoClick,
    hotelName,
    minimal = false
}) => {
    const [mode, setMode] = useState<'selection' | 'scanner' | 'manual'>(minimal ? 'scanner' : 'selection');
    const [manualCode, setManualCode] = useState('');
    const [showHotelQR, setShowHotelQR] = useState(false);

    const handleScan = (code: string) => {
        if (onScan) onScan(code);
        if (onScanResident) onScanResident(code);
    };

    if (minimal) {
        return (
            <div className="w-full h-full bg-black flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center animate-pulse">
                        <Camera size={40} className="text-white/20" />
                    </div>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">Camera Active</p>
                </div>
                
                {/* Test Trigger for Demo */}
                <button 
                    onClick={() => handleScan('TEST-CODE')}
                    className="absolute inset-0 z-20 opacity-0 cursor-pointer w-full h-full"
                    title="Click to simulate scan"
                />
            </div>
        );
    }

    return (
        <div className="h-[100dvh] bg-[#001e21] flex flex-col font-sans overflow-y-auto custom-scrollbar relative" dir="rtl">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#cca43b]/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#006269]/20 rounded-full blur-[100px] -ml-48 -mb-48"></div>

            {/* Header */}
            <header className="p-8 flex justify-between items-center relative z-10">
                <div 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={onLogoClick}
                >
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 group-hover:border-[#cca43b]/50 transition-all">
                        <Building2 size={24} className="text-[#cca43b]" />
                    </div>
                    <div>
                        <h1 className="text-white font-black text-xl tracking-tight group-hover:text-[#cca43b] transition-colors">{hotelName}</h1>
                        <p className="text-[#cca43b] text-[10px] font-bold uppercase tracking-widest">Smart Access System</p>
                    </div>
                </div>
                {mode !== 'selection' && (
                    <button 
                        onClick={() => setMode('selection')}
                        className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                )}
            </header>

            <main className="flex-1 flex flex-col items-center justify-start sm:justify-center p-8 py-12 relative z-10">
                <AnimatePresence mode="wait">
                    {mode === 'selection' && (
                        <motion.div 
                            key="selection"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full max-w-md md:max-w-2xl space-y-12"
                        >
                            <div className="text-center space-y-4">
                                <motion.div 
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="w-24 h-24 bg-gradient-to-br from-[#cca43b] to-[#8a6d25] rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-[#cca43b]/20"
                                >
                                    <QrCode size={48} className="text-white" />
                                </motion.div>
                                <h2 className="text-4xl font-black text-white leading-tight">مرحباً بك في <br/><span className="text-[#cca43b]">تجربة الإقامة الذكية</span></h2>
                                <p className="text-gray-400 font-bold">يرجى اختيار طريقة الدخول المناسبة لك للبدء</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <button 
                                    onClick={() => setMode('scanner')}
                                    className="group p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center gap-6 hover:bg-white/10 hover:border-[#cca43b]/50 transition-all text-right shadow-xl hover:shadow-[#cca43b]/10"
                                >
                                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#cca43b]/30 to-[#cca43b]/10 text-[#cca43b] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-[#cca43b]/20">
                                         <Scan size={32} />
                                     </div>
                                     <div className="flex-1">
                                         <h3 className="text-xl font-black text-white group-hover:text-[#cca43b] transition-colors">مسح رمز الاستجابة</h3>
                                         <p className="text-gray-500 text-sm font-bold">للمقيمين والزوار المسجلين مسبقاً</p>
                                     </div>
                                     <ChevronLeft size={24} className="text-gray-600 group-hover:text-[#cca43b] group-hover:translate-x-[-4px] transition-all" />
                                 </button>

                                 <button 
                                     onClick={onRegisterVisitor}
                                     className="group p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center gap-6 hover:bg-white/10 hover:border-[#006269]/50 transition-all text-right shadow-xl hover:shadow-[#006269]/10"
                                 >
                                     <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#006269]/30 to-[#006269]/10 text-[#006269] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-[#006269]/20">
                                         <UserPlus size={32} />
                                     </div>
                                     <div className="flex-1">
                                         <h3 className="text-xl font-black text-white group-hover:text-[#006269] transition-colors">تسجيل زائر جديد</h3>
                                         <p className="text-gray-500 text-sm font-bold">للحصول على رمز انتماء وخدمات الفندق</p>
                                     </div>
                                     <ChevronLeft size={24} className="text-gray-600 group-hover:text-[#006269] group-hover:translate-x-[-4px] transition-all" />
                                 </button>

                                 <button 
                                     onClick={() => setShowHotelQR(true)}
                                     className="group p-8 bg-[#cca43b]/5 border border-[#cca43b]/20 rounded-[2.5rem] flex items-center gap-6 hover:bg-[#cca43b]/10 transition-all text-right shadow-xl"
                                 >
                                     <div className="w-16 h-16 rounded-3xl bg-[#cca43b] text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                         <Share2 size={32} />
                                     </div>
                                     <div className="flex-1">
                                         <h3 className="text-xl font-black text-white">عرض رمز الفندق</h3>
                                         <p className="text-[#cca43b]/60 text-sm font-bold">ليقوم الزائر بمسحه والبدء في استخدام التطبيق</p>
                                     </div>
                                     <ChevronLeft size={24} className="text-[#cca43b]/40" />
                                 </button>

                                 <button 
                                     onClick={() => setMode('manual')}
                                     className="group p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center gap-6 hover:bg-white/10 hover:border-white/30 transition-all text-right shadow-xl"
                                 >
                                     <div className="w-16 h-16 rounded-3xl bg-white/5 text-white/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                         <Key size={32} />
                                     </div>
                                     <div className="flex-1">
                                         <h3 className="text-xl font-black text-white group-hover:text-white/80 transition-colors">إدخال يدوي</h3>
                                         <p className="text-gray-500 text-sm font-bold">استخدم رقم الحجز أو رمز العضوية</p>
                                     </div>
                                     <ChevronLeft size={24} className="text-gray-600 group-hover:text-white group-hover:translate-x-[-4px] transition-all" />
                                 </button>
                            </div>
                        </motion.div>
                    )}

                    {mode === 'scanner' && (
                        <motion.div 
                            key="scanner"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`w-full ${minimal ? 'h-full' : 'max-w-lg md:max-w-3xl text-center space-y-10'}`}
                        >
                            {!minimal && (
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-white">الماسح الضوئي الذكي</h3>
                                    <p className="text-gray-400 font-bold">وجه الكاميرا نحو رمز QR الخاص بك</p>
                                </div>
                            )}

                            <div className={`${minimal ? 'h-full w-full' : 'relative w-80 h-80 mx-auto'}`}>
                                {/* Scanner Frame */}
                                {!minimal && (
                                    <>
                                        <div className="absolute inset-0 border-2 border-white/10 rounded-[3.5rem]"></div>
                                        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#cca43b] rounded-tl-[2.5rem]"></div>
                                        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#cca43b] rounded-tr-[2.5rem]"></div>
                                        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-[#cca43b] rounded-bl-[2.5rem]"></div>
                                        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[#cca43b] rounded-br-[2.5rem]"></div>
                                    </>
                                )}
                                
                                <div className={`${minimal ? 'absolute inset-0' : 'absolute inset-6'} bg-white/5 rounded-[2.5rem] flex items-center justify-center overflow-hidden`}>
                                    <Camera size={minimal ? 48 : 80} className="text-white/10" />
                                    {/* Scanning Line */}
                                    <motion.div 
                                        animate={{ top: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="absolute left-0 right-0 h-1 bg-[#cca43b] shadow-[0_0_20px_#cca43b] z-10"
                                    ></motion.div>
                                    
                                    {/* Mock Video Feed Background */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>
                                </div>

                                {/* Decorative Dots */}
                                {!minimal && (
                                    <>
                                        <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#cca43b]/20 rounded-full blur-xl"></div>
                                        <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-[#006269]/20 rounded-full blur-xl"></div>
                                    </>
                                )}
                            </div>

                            {!minimal && (
                                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 flex items-center gap-4 text-right">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black text-sm">نظام تحقق آمن</h4>
                                        <p className="text-gray-500 text-[10px] font-bold">يتم تشفير جميع البيانات الممسوحة ضوئياً فوراً</p>
                                    </div>
                                </div>
                            )}

                            {!minimal && (
                                <button 
                                    onClick={() => handleScan('TEST-CODE')}
                                    className="text-[#cca43b] font-black text-sm hover:underline"
                                >
                                    هل تواجه مشكلة؟ جرب الإدخال اليدوي
                                </button>
                            )}
                        </motion.div>
                    )}

                    {mode === 'manual' && (
                        <motion.div 
                            key="manual"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full max-w-md md:max-w-2xl space-y-8"
                        >
                            <div className="text-center space-y-2">
                                <h3 className="text-3xl font-black text-white">الإدخال اليدوي</h3>
                                <p className="text-gray-400 font-bold">أدخل رمز العضوية أو رقم الحجز الخاص بك</p>
                            </div>

                            <div className="space-y-6">
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={manualCode}
                                        onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                        placeholder="مثال: BK-123456"
                                        className="w-full p-6 bg-white/5 border-2 border-white/10 rounded-[2rem] text-white text-center font-mono text-2xl tracking-widest focus:border-[#cca43b] outline-none transition-all placeholder:text-white/10"
                                    />
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20">
                                        <Key size={24} />
                                    </div>
                                </div>

                                <button 
                                    onClick={() => onManualEntry?.(manualCode)}
                                    disabled={!manualCode}
                                    className="w-full py-6 bg-gradient-to-r from-[#cca43b] to-[#8a6d25] text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-[#cca43b]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                                >
                                    تحقق من الرمز
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                                    <p className="text-gray-500 text-[10px] font-black uppercase mb-1">نزيل مقيم</p>
                                    <p className="text-white text-xs font-bold">استخدم رقم الحجز</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                                    <p className="text-gray-500 text-[10px] font-black uppercase mb-1">زائر سابق</p>
                                    <p className="text-white text-xs font-bold">استخدم رمز العضوية</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Hotel QR Modal */}
            <AnimatePresence>
                {showHotelQR && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[110] flex items-center justify-center p-6"
                        onClick={() => setShowHotelQR(false)}
                    >
                        <div onClick={e => e.stopPropagation()}>
                            <HotelQRCode 
                                hotelName={hotelName}
                                appUrl={window.location.origin}
                                themeColor="#cca43b"
                                onClose={() => setShowHotelQR(false)}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <footer className="p-8 text-center relative z-10">
                <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">Powered by {hotelName} Smart Systems</p>
            </footer>
        </div>
    );
};
