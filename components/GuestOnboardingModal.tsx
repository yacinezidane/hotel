
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Phone, ShieldCheck, X, ArrowRight, CheckCircle, Info, QrCode, Download, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface GuestOnboardingModalProps {
    onComplete: (profile: { name: string, phone: string, idNumber: string, membershipCode: string }) => void;
    onClose?: () => void;
}

export const GuestOnboardingModal: React.FC<GuestOnboardingModalProps> = ({ onComplete, onClose }) => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [error, setError] = useState('');
    const [membershipCode, setMembershipCode] = useState('');

    const handleNext = () => {
        if (step === 1) {
            if (!name.trim()) {
                setError('يرجى إدخال الاسم الكامل');
                return;
            }
            setStep(2);
            setError('');
        } else if (step === 2) {
            if (!phone.trim()) {
                setError('يرجى إدخال رقم الهاتف');
                return;
            }
            setStep(3);
            setError('');
        } else if (step === 3) {
            if (!idNumber.trim()) {
                setError('يرجى إدخال رقم الهوية للتوثيق');
                return;
            }
            // Generate temporary membership code for display
            const code = `ALG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            setMembershipCode(code);
            setStep(4);
            setError('');
        } else if (step === 4) {
            onComplete({ name, phone, idNumber, membershipCode });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[3rem] w-full max-w-lg md:max-w-2xl overflow-hidden shadow-2xl border border-white/20"
            >
                {/* Header */}
                <div className="bg-[#006269] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                <ShieldCheck size={24} className="text-[#cca43b]" />
                            </div>
                            <h2 className="text-2xl font-black">توثيق الهوية</h2>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-90 flex items-center gap-2"
                            title="إغلاق وتخطي"
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest">تخطي</span>
                            <X size={20} />
                        </button>
                    </div>
                    <p className="text-white/70 text-sm font-bold mt-2">إجراء احترازي لضمان أمن وسلامة جميع الزوار والنزلاء</p>
                </div>

                {/* Progress Bar */}
                <div className="flex h-1.5 bg-gray-100">
                    <motion.div 
                        initial={{ width: '33%' }}
                        animate={{ width: `${(step / 3) * 100}%` }}
                        className="bg-[#cca43b]"
                    />
                </div>

                {/* Content */}
                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <User size={32} />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900">ما هو اسمك الكامل؟</h3>
                                    <p className="text-gray-500 text-sm font-bold mt-1">يرجى إدخال اسمك كما هو موضح في بطاقة الهوية</p>
                                </div>
                                
                                <div className="relative">
                                    <input 
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="الاسم الكامل"
                                        className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-[#cca43b] rounded-2xl outline-none transition-all text-right font-bold text-lg"
                                        autoFocus
                                    />
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Phone size={32} />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900">رقم الهاتف للتواصل</h3>
                                    <p className="text-gray-500 text-sm font-bold mt-1">سنستخدم هذا الرقم لإرسال التحديثات الهامة</p>
                                </div>
                                
                                <div className="relative">
                                    <input 
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="0XXXXXXXXX"
                                        className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-[#cca43b] rounded-2xl outline-none transition-all text-center font-bold text-lg tracking-widest"
                                        dir="ltr"
                                        autoFocus
                                    />
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div 
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <ShieldCheck size={32} />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900">رقم الهوية الوطنية</h3>
                                    <p className="text-gray-500 text-sm font-bold mt-1">لتأكيد هويتك وضمان أمن المنشأة</p>
                                </div>
                                
                                <div className="relative">
                                    <input 
                                        type="text"
                                        value={idNumber}
                                        onChange={(e) => setIdNumber(e.target.value)}
                                        placeholder="رقم بطاقة التعريف أو جواز السفر"
                                        className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-[#cca43b] rounded-2xl outline-none transition-all text-center font-bold text-lg"
                                        autoFocus
                                    />
                                </div>
                                
                                <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
                                    <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                                    <p className="text-blue-800 text-[10px] font-bold leading-relaxed">
                                        يتم تشفير بياناتك وحمايتها وفقاً لمعايير الأمن السيبراني العالمية. لا يتم مشاركة هذه البيانات مع أي طرف ثالث.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div 
                                key="step4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-6"
                            >
                                <div className="mb-6">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                                        <CheckCircle size={48} />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900">تم التوثيق بنجاح!</h3>
                                    <p className="text-gray-500 font-bold">أهلاً بك {name}، لقد أصبحت الآن عضواً في فندقنا</p>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-[2.5rem] border-2 border-dashed border-gray-200 relative group">
                                    <div className="bg-white p-4 rounded-2xl shadow-lg inline-block mb-4 border border-gray-100">
                                        <QRCodeSVG 
                                            value={JSON.stringify({ name, membershipCode, type: 'visitor' })}
                                            size={180}
                                            level="H"
                                            includeMargin={true}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">رمز الانتماء الخاص بك</p>
                                        <div className="bg-white px-6 py-3 rounded-xl border border-gray-100 inline-block">
                                            <span className="text-2xl font-black tracking-[0.3em] text-[#006269]">{membershipCode}</span>
                                        </div>
                                    </div>

                                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                                        <button className="p-2 bg-white rounded-full shadow-md text-gray-400 hover:text-[#cca43b] transition-colors">
                                            <Download size={16} />
                                        </button>
                                        <button className="p-2 bg-white rounded-full shadow-md text-gray-400 hover:text-[#cca43b] transition-colors">
                                            <Share2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-2xl text-right">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Info size={14} className="text-blue-600" />
                                            <span className="text-[10px] font-black text-blue-600 uppercase">دليل الإقامة</span>
                                        </div>
                                        <p className="text-xs font-bold text-blue-900">دليل شامل لجميع مرافق وخدمات الفندق</p>
                                    </div>
                                    <div className="bg-[#cca43b]/10 p-4 rounded-2xl text-right">
                                        <div className="flex items-center gap-2 mb-1">
                                            <QrCode size={14} className="text-[#cca43b]" />
                                            <span className="text-[10px] font-black text-[#cca43b] uppercase">حساب الفندق</span>
                                        </div>
                                        <p className="text-xs font-bold text-[#8a6d27]">استخدم الرمز لطلب الخدمات وتخصيص تجربتك</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => onComplete({ name, phone, idNumber, membershipCode })}
                                    className="w-full py-4 bg-[#006269] text-white rounded-2xl font-black text-sm hover:bg-[#004d52] transition-all shadow-lg flex items-center justify-center gap-2"
                                >
                                    <span>إخفاء البطاقة والبدء باستخدام التطبيق</span>
                                    <ArrowRight size={18} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && (
                        <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-xs font-black mt-4 text-center"
                        >
                            {error}
                        </motion.p>
                    )}

                    <div className="mt-10 flex flex-col gap-3">
                        {step < 4 && (
                            <div className="flex gap-4">
                                {step > 1 && (
                                    <button 
                                        onClick={() => setStep(step - 1)}
                                        className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all active:scale-95"
                                    >
                                        رجوع
                                    </button>
                                )}
                                <button 
                                    onClick={handleNext}
                                    className="flex-[2] py-4 bg-[#cca43b] text-white rounded-2xl font-black text-sm hover:bg-[#b38f32] transition-all shadow-lg shadow-[#cca43b]/20 flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <span>{step === 3 ? 'إتمام التوثيق' : 'المتابعة'}</span>
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        )}
                        
                        {step < 4 && (
                            <button 
                                onClick={onClose}
                                className="w-full py-4 bg-gray-50 text-gray-400 font-black text-xs hover:text-[#006269] hover:bg-gray-100 rounded-2xl transition-all border border-dashed border-gray-200"
                            >
                                تخطي التوثيق حالياً واستخدام التطبيق مباشرة
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2">
                    <CheckCircle size={14} className="text-green-500" />
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">نظام حماية متكامل</span>
                </div>
            </motion.div>
        </div>
    );
};
