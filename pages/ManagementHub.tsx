
import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { 
    Users, Briefcase, Settings, PieChart, ShieldAlert, Wrench, 
    Smartphone, Lock, Eye, Calculator, Scan, Crown, ArrowRight, Printer, Tag, Globe, TrendingUp, Monitor, Layout, Database, Sparkles, Key, ExternalLink
} from 'lucide-react';
import { DEMO_TOKENS } from '../utils/demoData';

interface ManagementHubProps {
    navigate: (page: string) => void;
}

export const ManagementHub: React.FC<ManagementHubProps> = ({ navigate }) => {
    const { settings, currentUser, populateDemoData, addNotification } = useHotel();
    const [isPopulating, setIsPopulating] = useState(false);

    if (currentUser?.role !== 'manager' && currentUser?.role !== 'assistant_manager') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Lock size={64} className="mb-4 opacity-20"/>
                <h2 className="text-xl font-bold">منطقة محظورة</h2>
                <p>هذه اللوحة مخصصة للإدارة العليا فقط</p>
                <button onClick={() => navigate('dashboard')} className="mt-4 px-6 py-2 bg-gray-100 rounded-xl text-sm font-bold text-gray-600">عودة</button>
            </div>
        );
    }

    const handlePopulate = async () => {
        if (window.confirm('هل تريد ملء النظام ببيانات تجريبية عالية الجودة للمراجعة؟ سيتم استبدال بعض البيانات الحالية.')) {
            setIsPopulating(true);
            await populateDemoData();
            setIsPopulating(false);
            addNotification('تم ملء البيانات التجريبية بنجاح!', 'success');
        }
    };

    const adminModules = [
        { 
            id: 'desktop', 
            label: 'المكتب الذكي', 
            desc: 'تخصيص واجهة موظف الاستقبال', 
            icon: Monitor, 
            allowed: currentUser.permissions.canManageSettings 
        },
        { 
            id: 'global_network', 
            label: 'الشبكة العالمية', 
            desc: 'التحالف الفندقي وتبادل البيانات', 
            icon: Globe, 
            allowed: currentUser.permissions.canManageSettings 
        },
        { 
            id: 'profitability', 
            label: 'محرك الربحية', 
            desc: 'الذكاء الاصطناعي لتعظيم العائدات', 
            icon: TrendingUp, 
            allowed: currentUser.permissions.canViewAccounting 
        },
        { 
            id: 'pricing', 
            label: 'الأسعار والخدمات', 
            desc: 'تعديل أسعار الغرف والمرافق', 
            icon: Tag, 
            allowed: currentUser.permissions.canManageSettings 
        },
        { 
            id: 'accounting', 
            label: 'النظام المحاسبي', 
            desc: 'الإيرادات، المصروفات، والرواتب', 
            icon: Calculator, 
            allowed: currentUser.permissions.canViewAccounting 
        },
        { 
            id: 'staff', 
            label: 'إدارة الموظفين', 
            desc: 'الهيكل التنظيمي والصلاحيات', 
            icon: Users, 
            allowed: currentUser.permissions.canManageStaff 
        },
        { 
            id: 'reports', 
            label: 'التقارير والتحليلات', 
            desc: 'مؤشرات الأداء والرسوم البيانية', 
            icon: PieChart, 
            allowed: currentUser.permissions.canViewAccounting 
        },
        { 
            id: 'print_settings', 
            label: 'استوديو الطباعة', 
            desc: 'تصميم الدعوات والتذاكر', 
            icon: Printer, 
            allowed: currentUser.permissions.canManageSettings 
        },
        { 
            id: 'settings', 
            label: 'إعدادات النظام', 
            desc: 'تخصيص الفندق والسمات', 
            icon: Settings, 
            allowed: currentUser.permissions.canManageSettings 
        },
        { 
            id: 'database_settings', 
            label: 'قاعدة البيانات', 
            desc: 'الربط المستقل والاستقلالية', 
            icon: Database, 
            allowed: currentUser.role === 'manager' 
        },
        { 
            id: 'website_manager', 
            label: 'مدير الموقع', 
            desc: 'إدارة الموقع الإلكتروني', 
            icon: Globe, 
            allowed: currentUser.role === 'manager' 
        },
        { 
            id: 'security', 
            label: 'بوابة الأمن', 
            desc: 'سجلات الشرطة والبلاغات', 
            icon: ShieldAlert, 
            allowed: currentUser.permissions.canViewSecurityLink 
        },
        { 
            id: 'services', 
            label: 'الخدمات الرقمية', 
            desc: 'إدارة QR والخدمات الذكية', 
            icon: Smartphone, 
            allowed: currentUser.permissions.canManageServices 
        },
        { 
            id: 'operations', 
            label: 'مركز العمليات', 
            desc: 'الصيانة والدعم الفني', 
            icon: Wrench, 
            allowed: true 
        },
        { 
            id: 'qr_monitor', 
            label: 'الحارس الرقمي', 
            desc: 'مراقبة التذاكر والاحتيال', 
            icon: Scan, 
            allowed: true 
        },
        { 
            id: 'guest_preview', 
            label: 'محاكاة النزيل', 
            desc: 'تجربة الواجهة الأمامية', 
            icon: Eye, 
            allowed: true 
        },
    ];

    // --- Theme Logic ---
    const getThemeStyles = () => {
        if (settings.darkMode) {
            if (settings.theme === 'zellige') {
                return {
                    card: 'bg-[#001e21] border-2 border-[#cca43b]/30 hover:border-[#f0c04a] hover:shadow-[0_10px_30px_-10px_rgba(204,164,59,0.2)] relative overflow-hidden',
                    iconBox: 'bg-[#002a2d] text-[#f0c04a] shadow-lg shadow-[#cca43b]/20 border border-[#cca43b]/50',
                    text: 'text-[#f0c04a]',
                    subtext: 'text-[#cca43b]/80',
                    headerBg: 'bg-[#001e21] border border-[#cca43b]/30 text-[#f0c04a]',
                    pattern: 'bg-zellige-pattern'
                };
            }
            if (settings.theme === 'zellige-v2') {
                return {
                    card: 'bg-[#001a14] border-2 border-[#024d38]/50 hover:border-[#c6e3d8] hover:shadow-[0_10px_30px_-10px_rgba(2,77,56,0.4)] relative overflow-hidden',
                    iconBox: 'bg-[#012a20] text-[#c6e3d8] shadow-lg border border-[#024d38]',
                    text: 'text-[#c6e3d8]',
                    subtext: 'text-[#c6e3d8]/70',
                    headerBg: 'bg-[#001a14] border border-[#024d38]/50 text-[#c6e3d8]',
                    pattern: 'bg-zellige-v2-pattern'
                };
            }
            if (settings.theme === 'zellige-algiers') {
                return {
                    card: 'bg-[#0f172a] border-2 border-[#1e3a8a]/50 hover:border-[#f8fafc] hover:shadow-[0_10px_30px_-10px_rgba(30,58,138,0.4)] relative overflow-hidden',
                    iconBox: 'bg-[#1e293b] text-[#f8fafc] shadow-lg border border-[#1e3a8a]',
                    text: 'text-[#f8fafc]',
                    subtext: 'text-[#94a3b8]',
                    headerBg: 'bg-[#0f172a] border border-[#1e3a8a]/50 text-[#f8fafc]',
                    pattern: 'bg-zellige-algiers-pattern'
                };
            }
        }

        switch (settings.theme) {
            case 'zellige': return {
                card: 'bg-[#FDFBF7] border-2 border-[#cca43b]/40 hover:border-[#006269] hover:shadow-[0_10px_30px_-10px_rgba(0,98,105,0.2)] relative overflow-hidden',
                iconBox: 'bg-[#006269] text-[#cca43b] shadow-lg shadow-[#006269]/20 border border-[#cca43b]',
                text: 'text-[#006269]',
                subtext: 'text-[#cca43b]',
                headerBg: 'bg-[#006269] text-[#cca43b]',
                pattern: 'bg-zellige-pattern'
            };
            case 'zellige-v2': return {
                card: 'bg-[#f5fcf9] border-2 border-[#c6e3d8] hover:border-[#024d38] hover:shadow-[0_10px_30px_-10px_rgba(2,77,56,0.2)]',
                iconBox: 'bg-[#024d38] text-white shadow-lg border border-[#c6e3d8]',
                text: 'text-[#024d38]',
                subtext: 'text-[#024d38]/70',
                headerBg: 'bg-[#024d38] text-white',
                pattern: 'bg-zellige-v2-pattern'
            };
            case 'zellige-algiers': return {
                card: 'bg-[#eff6ff] border-2 border-[#1e3a8a]/20 hover:border-[#1e3a8a] hover:shadow-[0_10px_30px_-10px_rgba(30,58,138,0.2)]',
                iconBox: 'bg-[#1e3a8a] text-[#f8fafc] shadow-lg shadow-[#1e3a8a]/20 border border-[#f8fafc]/20',
                text: 'text-[#1e3a8a]',
                subtext: 'text-[#64748b]',
                headerBg: 'bg-[#1e3a8a] text-[#f8fafc]',
                pattern: 'bg-zellige-algiers-pattern'
            };
            default: return {
                card: 'bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl',
                iconBox: 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-600/30',
                text: 'text-gray-900 dark:text-white',
                subtext: 'text-gray-500 dark:text-gray-400',
                headerBg: 'bg-slate-900 text-white',
                pattern: ''
            };
        }
    };
    const ts = getThemeStyles();
    const isZellige = settings.theme.startsWith('zellige');

    return (
        <div className="space-y-8 pb-20 animate-fade-in">
            {/* Custom Header for this special page */}
            <div className={`rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden ${ts.headerBg}`}>
                {isZellige && <div className={`absolute inset-0 opacity-20 pointer-events-none ${ts.pattern} ${settings.darkMode ? 'mix-blend-screen' : 'mix-blend-multiply'}`}></div>}
                
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            <Briefcase size={18} />
                            <span className="text-xs font-bold uppercase tracking-widest">Administration Hub</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight mb-2">لوحة القيادة الإدارية</h1>
                        <p className="opacity-90 font-medium text-sm max-w-md">
                            مركز التحكم المركزي للإدارة العليا. جميع الأدوات الحساسة والتقارير المالية وإعدادات النظام في مكان واحد.
                        </p>
                    </div>
                    <div className="hidden md:block bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20">
                        <Crown size={48} className="opacity-90" />
                    </div>
                </div>
            </div>

            {/* Demo Data Section */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-[2rem] p-6 mb-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/30">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100">بيانات المراجعة التجريبية</h2>
                            <p className="text-sm text-amber-700 dark:text-amber-300">استخدم هذه البيانات لمراجعة واجهات النزلاء والزوار.</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-amber-200 dark:border-amber-700 flex items-center gap-3">
                            <Key size={16} className="text-amber-500" />
                            <div>
                                <div className="text-[10px] uppercase font-bold text-gray-400">رمز النزيل (Guest)</div>
                                <div className="font-mono font-bold text-amber-600">{DEMO_TOKENS.GUEST_VIP}</div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-amber-200 dark:border-amber-700 flex items-center gap-3">
                            <Key size={16} className="text-amber-500" />
                            <div>
                                <div className="text-[10px] uppercase font-bold text-gray-400">رمز الزائر (Visitor)</div>
                                <div className="font-mono font-bold text-amber-600">{DEMO_TOKENS.VISITOR}</div>
                            </div>
                        </div>
                        <button 
                            onClick={handlePopulate}
                            disabled={isPopulating}
                            className={`
                                flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all
                                ${isPopulating ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-amber-600/30'}
                            `}
                        >
                            {isPopulating ? 'جاري التحميل...' : 'تعبئة البيانات التجريبية'}
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
                <div className="mt-4 flex gap-4 text-xs font-medium text-amber-600">
                    <button onClick={() => window.open('/guest', '_blank')} className="flex items-center gap-1 hover:underline">
                        <ExternalLink size={12} /> فتح بوابة النزلاء
                    </button>
                    <button onClick={() => window.open('/visitor', '_blank')} className="flex items-center gap-1 hover:underline">
                        <ExternalLink size={12} /> فتح بوابة الزوار
                    </button>
                </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminModules.filter(m => m.allowed).map(module => (
                    <button 
                        key={module.id}
                        onClick={() => navigate(module.id)}
                        className={`
                            relative overflow-hidden p-6 rounded-[2rem] text-right transition-all duration-300 group flex flex-col h-48
                            ${ts.card}
                        `}
                    >
                        {/* Zellige Background Pattern Overlay for Cards */}
                        {isZellige && (
                            <div className={`absolute inset-0 pointer-events-none ${ts.pattern} ${settings.darkMode ? 'opacity-15 mix-blend-screen' : 'opacity-10 mix-blend-multiply'}`}></div>
                        )}
                        
                        <div className="flex justify-between items-start mb-auto relative z-10">
                            {/* Dynamic Icon Box styling based on theme */}
                            <div className={`p-4 rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${ts.iconBox}`}>
                                <module.icon size={28} strokeWidth={2} />
                            </div>
                            <div className={`opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:-translate-x-2 duration-300 p-2 rounded-full shadow-sm ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/10 text-[#cca43b]' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'}`}>
                                <ArrowRight size={20} />
                            </div>
                        </div>

                        <div className="relative z-10">
                            <h3 className={`text-xl font-black mb-1 ${ts.text}`}>{module.label}</h3>
                            <p className={`text-xs font-bold ${ts.subtext}`}>{module.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
