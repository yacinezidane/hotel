import React, { useState } from 'react';
import { Shield, Check, AlertCircle, Lock, Eye, EyeOff, FileText, ChevronLeft, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useHotel } from '../context/HotelContext';

interface GuestPrivacyFormProps {
    bookingId: string;
    onSuccess: () => void;
}

export const GuestPrivacyForm: React.FC<GuestPrivacyFormProps> = ({ bookingId, onSuccess }) => {
    const { addNotification } = useHotel();
    const [step, setStep] = useState(1);
    const [consents, setConsents] = useState({
        marketing: false,
        dataSharing: false,
        biometric: false,
        analytics: true
    });
    const [showPolicy, setShowPolicy] = useState(false);

    const handleSave = () => {
        addNotification('تم تحديث إعدادات الخصوصية بنجاح', 'success');
        onSuccess();
    };

    return (
        <div className="space-y-6 animate-fade-in text-right" dir="rtl">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                    <button 
                        onClick={onSuccess}
                        className="p-2 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 transition-all"
                    >
                        <ArrowRight size={20} />
                    </button>
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-xl text-gray-800">الخصوصية والأمان</h3>
                        <p className="text-xs text-gray-500 font-bold">إدارة بياناتك وتفضيلات الخصوصية</p>
                    </div>
                </div>

                {step === 1 ? (
                    <div className="space-y-6">
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                            <Info size={20} className="text-blue-500 shrink-0" />
                            <p className="text-xs text-blue-700 font-bold leading-relaxed">
                                نحن نلتزم بحماية بياناتك الشخصية. يمكنك التحكم في كيفية استخدامنا لبياناتك من خلال الإعدادات أدناه.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { id: 'marketing', label: 'التسويق والعروض', desc: 'تلقي عروض مخصصة وخصومات حصرية عبر البريد أو الهاتف.', icon: Sparkles },
                                { id: 'dataSharing', label: 'مشاركة البيانات مع الشركاء', desc: 'مشاركة بياناتك مع شركائنا الموثوقين لتحسين تجربتك السياحية.', icon: Users },
                                { id: 'biometric', label: 'التعرف على الوجه (اختياري)', desc: 'استخدام القياسات الحيوية لتسريع عملية الدخول وفتح الأبواب.', icon: Camera },
                                { id: 'analytics', label: 'تحسين الخدمة', desc: 'جمع بيانات مجهولة الهوية حول استخدامك للتطبيق لتحسين جودته.', icon: Activity },
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex-1 ml-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <item.icon size={16} className="text-gray-400" />
                                            <span className="font-black text-sm text-gray-800">{item.label}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-bold">{item.desc}</p>
                                    </div>
                                    <button 
                                        onClick={() => setConsents(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof consents] }))}
                                        className={`w-12 h-6 rounded-full transition-all relative ${consents[item.id as keyof typeof consents] ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${consents[item.id as keyof typeof consents] ? 'right-7' : 'right-1'}`}></div>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => setStep(2)}
                            className="w-full py-4 bg-[#006269] text-white rounded-2xl font-black shadow-lg hover:bg-[#cca43b] transition-all flex items-center justify-center gap-2"
                        >
                            متابعة <ChevronLeft size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h4 className="font-black text-gray-800 text-sm">اتفاقية الخصوصية</h4>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 max-h-48 overflow-y-auto text-[10px] text-gray-600 font-bold leading-relaxed">
                                <p className="mb-2">1. جمع البيانات: نقوم بجمع البيانات الضرورية فقط لتوفير خدماتنا الفندقية.</p>
                                <p className="mb-2">2. استخدام البيانات: تستخدم البيانات لتحسين تجربتك وتأمين إقامتك.</p>
                                <p className="mb-2">3. حقوقك: يحق لك طلب نسخة من بياناتك أو طلب حذفها في أي وقت.</p>
                                <p className="mb-2">4. الأمان: نستخدم تقنيات تشفير متقدمة لحماية بياناتك من الوصول غير المصرح به.</p>
                                <p>بالمتابعة، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بفندقنا.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                                <Check size={14} />
                            </div>
                            <span className="text-xs font-bold text-emerald-700">أوافق على جميع الشروط والأحكام المذكورة أعلاه.</span>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setStep(1)}
                                className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all"
                            >
                                رجوع
                            </button>
                            <button 
                                onClick={handleSave}
                                className="flex-[2] py-4 bg-[#006269] text-white rounded-2xl font-black shadow-lg hover:bg-[#cca43b] transition-all"
                            >
                                تأكيد وحفظ
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h4 className="font-black text-gray-800 text-sm mb-4">طلبات البيانات</h4>
                <div className="space-y-3">
                    <button className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                <FileText size={18} />
                            </div>
                            <span className="text-xs font-black text-gray-700">طلب نسخة من بياناتي</span>
                        </div>
                        <ChevronLeft size={16} className="text-gray-300" />
                    </button>
                    <button className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-red-200 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                <AlertCircle size={18} />
                            </div>
                            <span className="text-xs font-black text-gray-700">طلب حذف الحساب والبيانات</span>
                        </div>
                        <ChevronLeft size={16} className="text-gray-300" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Add missing icons that were used in the map
const Sparkles = ({ size, className }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
);

const Users = ({ size, className }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const Camera = ({ size, className }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" />
    </svg>
);

const Activity = ({ size, className }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);

const Info = ({ size, className }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
    </svg>
);
