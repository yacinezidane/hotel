import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, User, Users, Building2, ArrowRight, Shield, LogIn, Sparkles, Camera, Key, X, Database, UserPlus } from 'lucide-react';
import { EntryScanner } from './EntryScanner';
import { useHotel } from '../context/HotelContext';

interface PortalSelectionPageProps {
    onSelectGuest: (token: string) => void;
    onSelectVisitor: () => void;
    onAdminClick: () => void;
}

export const PortalSelectionPage: React.FC<PortalSelectionPageProps> = ({ 
    onSelectGuest, 
    onSelectVisitor,
    onAdminClick
}) => {
    const { settings, populateDemoData, addNotification } = useHotel();
    const [showScanner, setShowScanner] = useState(false);
    const [adminClicks, setAdminClicks] = useState(0);
    const [isPopulating, setIsPopulating] = useState(false);

    const handlePopulate = async () => {
        setIsPopulating(true);
        try {
            await populateDemoData();
            addNotification('تم ملء البيانات التجريبية بنجاح!', 'success');
        } catch (error) {
            console.error(error);
            addNotification('حدث خطأ أثناء ملء البيانات', 'error');
        } finally {
            setIsPopulating(false);
        }
    };

    const handleLogoClick = () => {
        setAdminClicks(prev => {
            const next = prev + 1;
            if (next >= 7) {
                // Side effect should be outside of the updater
                setTimeout(() => onAdminClick(), 0);
                return 0;
            }
            return next;
        });
        // Reset clicks after 3 seconds of inactivity
        setTimeout(() => setAdminClicks(0), 3000);
    };

    return (
        <div className="h-[100dvh] bg-[#FDFBF7] flex flex-col items-center justify-start sm:justify-center p-6 relative overflow-y-auto custom-scrollbar" dir="rtl">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-zellige-pattern"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#006269] rounded-full blur-[100px] opacity-10"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#cca43b] rounded-full blur-[100px] opacity-10"></div>

            {/* Logo Section */}
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-12 text-center relative z-10"
                onClick={handleLogoClick}
            >
                <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center mx-auto mb-6 border-4 border-[#cca43b]/20 hover:scale-105 transition-transform cursor-pointer">
                    <Building2 size={48} className="text-[#006269]" />
                </div>
                <h1 className="text-4xl font-black text-[#006269] mb-2">فندق الجزائر</h1>
                <p className="text-[#cca43b] font-bold tracking-widest uppercase text-sm">Zellij Hotel Experience</p>
            </motion.div>

            {/* Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl relative z-10">
                {/* Guest Card */}
                <motion.div
                    className="flex flex-col gap-4"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowScanner(true)}
                        className="group relative bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 text-right overflow-hidden transition-all hover:shadow-2xl hover:border-[#006269]/30 w-full"
                    >
                        <div className="absolute top-0 left-0 w-2 h-full bg-[#006269]"></div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-16 h-16 bg-[#006269]/10 text-[#006269] rounded-2xl flex items-center justify-center group-hover:bg-[#006269] group-hover:text-white transition-colors">
                                <Key size={32} />
                            </div>
                            <Sparkles className="text-[#cca43b] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">أنا نزيل بالفندق</h2>
                        <p className="text-gray-500 font-bold text-sm leading-relaxed mb-6">
                            لديك رمز دخول سريع؟ ادخل مباشرة إلى غرفتك وخدماتك.
                        </p>
                        <div className="flex items-center gap-2 text-[#006269] font-black group-hover:gap-4 transition-all">
                            <span>دخول سريع (QR/Code)</span>
                            <ArrowRight size={20} />
                        </div>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectGuest('NEW_REGISTRATION')}
                        className="group relative bg-[#006269]/5 p-6 rounded-[2.5rem] border border-[#006269]/10 text-right overflow-hidden transition-all hover:bg-[#006269]/10"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#006269] shadow-sm">
                                    <UserPlus size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-[#006269]">تسجيل نزيل جديد</h3>
                                    <p className="text-[10px] text-gray-500 font-bold">احصل على عضوية النزلاء الآن</p>
                                </div>
                            </div>
                            <ArrowRight size={20} className="text-[#006269]" />
                        </div>
                    </motion.button>
                </motion.div>

                {/* Visitor Card */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onSelectVisitor}
                    className="group relative bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 text-right overflow-hidden transition-all hover:shadow-2xl hover:border-[#cca43b]/30"
                >
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#cca43b]"></div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-16 h-16 bg-[#cca43b]/10 text-[#cca43b] rounded-2xl flex items-center justify-center group-hover:bg-[#cca43b] group-hover:text-white transition-colors">
                            <Users size={32} />
                        </div>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">أنا زائر</h2>
                    <p className="text-gray-500 font-bold text-sm leading-relaxed mb-6">
                        استكشف مرافقنا، احجز طاولتك في المطعم، واستمتع بخدماتنا العامة المتميزة.
                    </p>
                    <div className="flex items-center gap-2 text-[#cca43b] font-black group-hover:gap-4 transition-all">
                        <span>دخول كزائر</span>
                        <ArrowRight size={20} />
                    </div>
                </motion.button>
            </div>

            {/* Staff Access Link */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 relative z-10"
            >
                <button 
                    onClick={onAdminClick}
                    className="flex items-center gap-2 text-gray-400 hover:text-[#006269] transition-colors font-bold text-sm"
                >
                    <Shield size={16} />
                    <span>دخول الموظفين والإدارة</span>
                </button>
            </motion.div>

            {/* Scanner Overlay */}
            <AnimatePresence>
                {showScanner && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 overflow-y-auto custom-scrollbar"
                    >
                        <div className="min-h-full flex flex-col items-center justify-center p-6 py-12">
                            <button 
                                onClick={() => setShowScanner(false)}
                                className="fixed top-8 left-8 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-[60]"
                            >
                                <X size={24} />
                            </button>
                            
                            <div className="w-full max-w-md md:max-w-2xl text-center space-y-8 relative">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-white">امسح رمز الغرفة</h2>
                                    <p className="text-gray-400 font-bold">يرجى توجيه الكاميرا نحو رمز QR الموجود في غرفتك أو على بطاقة المفتاح</p>
                                </div>

                                <div className="relative aspect-square w-full max-w-sm md:max-w-md mx-auto rounded-[3rem] overflow-hidden border-4 border-[#006269] shadow-2xl shadow-[#006269]/20">
                                    <EntryScanner 
                                        minimal={true}
                                        hotelName={settings.appName}
                                        onScan={(code) => {
                                            onSelectGuest(code);
                                            setShowScanner(false);
                                        }} 
                                    />
                                    {/* Scanner Frame UI */}
                                    <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none"></div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-[#cca43b] rounded-3xl animate-pulse"></div>
                                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#cca43b] shadow-[0_0_15px_#cca43b] animate-scan"></div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="relative space-y-4">
                                        <input 
                                            type="text" 
                                            id="manual-code-input"
                                            placeholder="أدخل رمز الحجز يدوياً..."
                                            className="w-full bg-white/10 border border-white/20 rounded-2xl p-5 text-white text-center font-black placeholder:text-white/30 focus:ring-2 focus:ring-[#006269] outline-none transition-all"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    onSelectGuest((e.target as HTMLInputElement).value);
                                                    setShowScanner(false);
                                                }
                                            }}
                                        />
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                const input = document.getElementById('manual-code-input') as HTMLInputElement;
                                                if (input && input.value) {
                                                    onSelectGuest(input.value);
                                                    setShowScanner(false);
                                                }
                                            }}
                                            className="w-full py-5 bg-[#006269] text-white rounded-2xl font-black shadow-xl shadow-[#006269]/20 flex items-center justify-center gap-2 hover:bg-[#007a82] transition-colors"
                                        >
                                            <LogIn size={20} />
                                            <span>دخول إلى حسابي</span>
                                        </motion.button>
                                        <p className="text-white/40 text-[10px] font-bold">يمكنك استخدام رموز سريعة مثل REST أو POOL للوصول المباشر للخدمات</p>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <p className="text-gray-500 text-xs font-bold">
                                        تواجه مشكلة؟ يرجى مراجعة موظف الاستقبال للحصول على رمز دخول جديد.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes scan {
                    0%, 100% { top: 20%; }
                    50% { top: 80%; }
                }
                .animate-scan {
                    animation: scan 3s ease-in-out infinite;
                    position: absolute;
                }
            `}} />
        </div>
    );
};
