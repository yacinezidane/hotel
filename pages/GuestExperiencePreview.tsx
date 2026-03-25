
import React, { useState } from 'react';
import { GuestServicesPage } from './GuestServicesPage';
import { PageHeader } from '../components/PageHeader';
import { Smartphone, Eye, ArrowLeft, BedDouble, Utensils, Waves, Crown, ShieldCheck, Coffee, Users, Armchair, PartyPopper, Music, Mic2 } from 'lucide-react';
import { useHotel } from '../context/HotelContext';

export const GuestExperiencePreview: React.FC = () => {
    const { settings } = useHotel();
    
    // Grouped Scenarios for better UX
    const scenarioGroups = [
        {
            title: "خدمات الإقامة (النزلاء)",
            icon: BedDouble,
            color: "text-blue-600",
            items: [
                { type: 'room', id: '101', name: 'غرفة قياسية (101)', icon: BedDouble, sub: 'خدمة الغرف، تنظيف' },
                { type: 'room', id: 'SUITE-ROYAL', name: 'جناح ملكي', icon: Crown, sub: 'خدمات VIP، سائق خاص' },
            ]
        },
        {
            title: "الأغذية والمشروبات",
            icon: Utensils,
            color: "text-orange-600",
            items: [
                { type: 'restaurant_table', id: 'TBL-5', name: 'طاولة 5 (VIP)', icon: Utensils, sub: 'القائمة الرقمية، استدعاء نادل' },
                { type: 'restaurant_table', id: 'CAFE-3', name: 'ركن المقهى', icon: Coffee, sub: 'مشروبات سريعة' },
            ]
        },
        {
            title: "المناسبات والقاعات",
            icon: PartyPopper,
            color: "text-purple-600",
            items: [
                { type: 'hall', id: 'WEDDING-AHMED', name: 'حفل زفاف (القاعة الذهبية)', icon: Music, sub: 'تحكم بالإضاءة، البوفيه' },
                { type: 'hall', id: 'CONF-TECH', name: 'مؤتمر التقنية 2024', icon: Mic2, sub: 'جدول الأعمال، التصويت' },
            ]
        },
        {
            title: "الترفيه والزوار",
            icon: Waves,
            color: "text-cyan-600",
            items: [
                { type: 'pool_chair', id: 'POOL-12', name: 'كرسي مسبح (12)', icon: Waves, sub: 'مشروبات باردة، مناشف' },
                { type: 'vip_area', id: 'LOUNGE-A', name: 'صالة كبار الزوار', icon: ShieldCheck, sub: 'دخول حصري' },
            ]
        }
    ];

    const [selectedScenario, setSelectedScenario] = useState<{
        type: 'room' | 'restaurant_table' | 'pool_chair' | 'vip_area' | 'hall',
        id: string,
        name: string
    }>(scenarioGroups[0].items[0] as any);

    // Theme Helpers
    const isZellige = settings.theme === 'zellige' || settings.theme === 'zellige-v2';
    const getThemeColors = () => {
        if (settings.darkMode) {
            if (settings.theme === 'zellige') {
                return {
                    bg: 'bg-[#001e21]',
                    panel: 'bg-[#002a2d] border-[#cca43b]/30',
                    activeItem: 'bg-[#cca43b] text-[#001e21] shadow-[#cca43b]/20',
                    text: 'text-[#f0c04a]',
                    subtext: 'text-[#cca43b]/70',
                    inactiveItem: 'bg-[#001012] text-[#cca43b]/60 border-[#cca43b]/20 hover:bg-[#002a2d]'
                };
            }
        }
        if (settings.theme === 'zellige') {
            return {
                bg: 'bg-[#FDFBF7]',
                panel: 'bg-white border-[#cca43b]/30',
                activeItem: 'bg-[#006269] text-[#cca43b] shadow-[#006269]/20',
                text: 'text-[#006269]',
                subtext: 'text-gray-400',
                inactiveItem: 'bg-white hover:bg-gray-50 border-gray-100 text-gray-600 hover:shadow-sm'
            };
        }
        return {
            bg: 'bg-gray-50 dark:bg-gray-900',
            panel: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
            activeItem: 'bg-blue-600 text-white shadow-blue-500/30',
            text: 'text-gray-800 dark:text-white',
            subtext: 'text-gray-400',
            inactiveItem: 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:shadow-sm'
        };
    };
    const themeColors = getThemeColors();

    return (
        <div className={`min-h-screen relative overflow-hidden ${themeColors.bg} pb-20 animate-fade-in`}>
            {/* Background Pattern */}
            {isZellige && <div className={`absolute inset-0 opacity-10 pointer-events-none bg-${settings.theme === 'zellige' ? 'zellige-pattern' : 'zellige-v2-pattern'} ${settings.darkMode ? 'mix-blend-screen' : 'mix-blend-multiply'}`}></div>}

            <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8 pt-6">
                <PageHeader 
                    pageKey="guest_preview" 
                    defaultTitle="محاكاة تجربة العميل (Guest Journey)" 
                    icon={Smartphone} 
                />

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-4 items-start">
                    
                    {/* Left: Scenarios Panel */}
                    <div className="xl:col-span-4 space-y-4">
                        <div className={`backdrop-blur-xl p-5 rounded-[2rem] border-2 shadow-xl ${themeColors.panel}`}>
                            <h3 className={`font-black text-lg mb-2 flex items-center gap-2 ${themeColors.text}`}>
                                <Eye size={20} /> نقاط الدخول (Touchpoints)
                            </h3>
                            <p className={`text-[11px] font-bold mb-4 leading-relaxed ${themeColors.subtext}`}>
                                اختر سيناريو لرؤية كيف تتكيف الواجهة تلقائياً مع سياق الزبون لتحقيق تجربة "5 نجوم".
                            </p>

                            <div className="space-y-4 h-[550px] overflow-y-auto custom-scrollbar pr-2">
                                {scenarioGroups.map((group, gIdx) => (
                                    <div key={gIdx} className="space-y-2">
                                        <h4 className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-2 ${group.color}`}>
                                            <group.icon size={12} /> {group.title}
                                        </h4>
                                        {group.items.map((scenario: any) => (
                                            <button
                                                key={scenario.id}
                                                onClick={() => setSelectedScenario(scenario)}
                                                className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-300 group relative overflow-hidden ${
                                                    selectedScenario.id === scenario.id 
                                                    ? `${themeColors.activeItem} border-transparent shadow-md scale-[1.02]` 
                                                    : themeColors.inactiveItem
                                                }`}
                                            >
                                                {/* Active Indicator Line */}
                                                {selectedScenario.id === scenario.id && (
                                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/30"></div>
                                                )}

                                                <div className={`p-2 rounded-lg shrink-0 ${selectedScenario.id === scenario.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                                    <scenario.icon size={18} strokeWidth={2} />
                                                </div>
                                                
                                                <div className="text-right flex-1 min-w-0">
                                                    <span className="font-bold block text-xs truncate">{scenario.name}</span>
                                                    <span className={`text-[9px] block truncate ${selectedScenario.id === scenario.id ? 'opacity-80 text-white' : 'text-gray-400'}`}>
                                                        {scenario.sub}
                                                    </span>
                                                </div>
                                                
                                                {selectedScenario.id === scenario.id && <ArrowLeft size={16} className="animate-pulse shrink-0" />}
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Developer Note */}
                        <div className={`p-4 rounded-[1.5rem] shadow-lg relative overflow-hidden ${
                            settings.theme === 'zellige' 
                                ? (settings.darkMode ? 'bg-[#002a2d] text-[#f0c04a] border border-[#cca43b]/30' : 'bg-[#006269] text-[#cca43b]') 
                                : 'bg-gray-900 text-white'
                        }`}>
                            {isZellige && <div className={`absolute inset-0 opacity-20 bg-${settings.theme === 'zellige' ? 'zellige-pattern' : 'zellige-v2-pattern'} ${settings.darkMode ? 'mix-blend-screen' : 'mix-blend-multiply'}`}></div>}
                            <div className="relative z-10 flex items-start gap-3">
                                <Smartphone size={20} className="mt-1" />
                                <div>
                                    <h4 className="font-bold text-xs mb-1">واجهة متجاوبة ذكية</h4>
                                    <p className="text-[10px] opacity-80 leading-relaxed">
                                        يتم تخصيص الألوان والخدمات المتاحة تلقائياً بناءً على رمز QR الممسوح.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Device Mockup */}
                    <div className="xl:col-span-8 flex justify-center items-start pt-2 h-full min-h-[850px]">
                        <div className="sticky top-6 perspective-1000">
                            <div className="relative mx-auto border-gray-900 bg-gray-900 border-[10px] rounded-[3rem] h-[780px] w-[370px] shadow-2xl flex flex-col transform rotate-0 transition-transform duration-500 hover:scale-[1.005]">
                                {/* Phone Hardware Details */}
                                <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[13px] top-[72px] rounded-l-lg"></div>
                                <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[13px] top-[124px] rounded-l-lg"></div>
                                <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[13px] top-[178px] rounded-l-lg"></div>
                                <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[13px] top-[142px] rounded-r-lg"></div>
                                <div className="w-[100px] h-[22px] bg-black top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute z-30 flex justify-center items-center">
                                    <div className="w-12 h-1 bg-gray-800 rounded-full"></div>
                                </div>
                                
                                {/* Screen Content */}
                                <div className="rounded-[2.4rem] overflow-hidden w-full h-full bg-white relative flex flex-col shadow-inner">
                                    <GuestServicesPage 
                                        key={selectedScenario.id} // Forces remount on change
                                        previewData={selectedScenario} 
                                    />
                                    
                                    {/* Home Bar Indicator */}
                                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-black/20 rounded-full z-50 backdrop-blur-sm"></div>
                                </div>
                            </div>
                            
                            {/* Reflection/Shadow beneath phone */}
                            <div className="absolute -bottom-8 left-10 right-10 h-4 bg-black/30 blur-xl rounded-[100%]"></div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
