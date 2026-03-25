
import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { Globe, Link, Copy, Edit3, Save, ExternalLink, Smartphone, Eye, Plus, Trash2, Image, Calendar, Utensils, Sparkles } from 'lucide-react';
import { PublicService, Facility, HotelEvent } from '../types';

export const WebsiteManagerPage: React.FC = () => {
    const { 
        settings, updateSettings, currentUser, addNotification,
        publicServices, addPublicService, deletePublicService,
        facilities, addFacility, deleteFacility,
        hotelEvents, addHotelEvent, deleteHotelEvent
    } = useHotel();
    const [config, setConfig] = useState(settings.marketingConfig);

    const [newService, setNewService] = useState<Partial<PublicService>>({ title: '', description: '', category: 'other', iconName: 'Star', image: '', color: 'text-gray-600' });
    const [newFacility, setNewFacility] = useState<Partial<Facility>>({ title: '', description: '', iconName: 'Star', image: '', color: 'bg-gray-50 text-gray-600' });
    const [newEvent, setNewEvent] = useState<Partial<HotelEvent>>({ title: '', description: '', date: '', category: 'other', image: '' });

    const getThemeStyles = () => {
        if (settings.darkMode) {
            if (settings.theme === 'zellige') {
                return {
                    bg: 'bg-[#001e21]',
                    card: 'bg-[#002a2d] border-[#cca43b]/40 relative overflow-hidden',
                    text: 'text-[#f0c04a]',
                    subtext: 'text-[#cca43b]/70',
                    accent: 'text-[#cca43b]',
                    buttonPrimary: 'bg-[#cca43b] text-[#001e21] hover:bg-[#b08d30]',
                    buttonSecondary: 'bg-[#002a2d] text-[#cca43b] hover:bg-[#00383d] border border-[#cca43b]/30',
                    input: 'bg-[#001012] border-[#cca43b]/40 text-[#f0c04a] focus:border-[#f0c04a] placeholder-[#cca43b]/30',
                    codeBlock: 'bg-[#001012] border-[#cca43b]/30 text-[#cca43b]',
                    pattern: 'bg-zellige-pattern opacity-10 mix-blend-screen'
                };
            }
        }
        if (settings.theme === 'zellige') {
            return {
                bg: 'bg-[#FDFBF7]',
                card: 'bg-white border-[#cca43b]/40 relative overflow-hidden',
                text: 'text-[#006269]',
                subtext: 'text-[#006269]/70',
                accent: 'text-[#006269]',
                buttonPrimary: 'bg-[#006269] text-[#cca43b] hover:bg-[#004d53]',
                buttonSecondary: 'bg-white text-[#006269] hover:bg-[#f0f9fa] border border-[#cca43b]/30',
                input: 'bg-[#fbf8f1] border-[#cca43b]/40 text-[#006269] focus:border-[#006269] placeholder-[#006269]/40',
                codeBlock: 'bg-[#fbf8f1] border-[#cca43b]/30 text-[#006269]',
                pattern: 'bg-zellige-pattern opacity-5 mix-blend-multiply'
            };
        }
        return {
            bg: 'bg-gray-50 dark:bg-gray-900',
            card: 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700',
            text: 'text-gray-800 dark:text-white',
            subtext: 'text-gray-500 dark:text-gray-400',
            accent: 'text-blue-600',
            buttonPrimary: 'bg-blue-600 text-white hover:bg-blue-700',
            buttonSecondary: 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200',
            input: 'bg-gray-50 dark:bg-gray-900 border-transparent focus:border-blue-500 text-gray-900 dark:text-white',
            codeBlock: 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300',
            pattern: ''
        };
    };
    const ts = getThemeStyles();

    if (currentUser?.role !== 'manager') return <div className="p-10 text-center">وصول غير مصرح به</div>;

    const publicLink = `${window.location.origin}?mode=public`;

    const handleSave = () => {
        updateSettings({ marketingConfig: config });
        addNotification("تم تحديث إعدادات الموقع الإلكتروني", "success");
    };

    return (
        <div className="space-y-8 pb-20 animate-fade-in">
            <PageHeader pageKey="website_manager" defaultTitle="مدير الموقع الإلكتروني" icon={Globe} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Preview & Link Card */}
                <div className={`p-8 rounded-[2.5rem] shadow-sm border ${ts.card}`}>
                    {settings.theme === 'zellige' && <div className={`absolute inset-0 pointer-events-none ${ts.pattern}`}></div>}
                    <h3 className={`font-black text-xl mb-6 flex items-center gap-2 relative z-10 ${ts.accent}`}>
                        <Link size={24} /> رابط الوصول العام
                    </h3>
                    
                    <div className={`p-4 rounded-2xl border border-dashed flex justify-between items-center mb-6 relative z-10 ${ts.codeBlock}`}>
                        <code className="text-sm font-mono break-all">{publicLink}</code>
                        <button 
                            onClick={() => { navigator.clipboard.writeText(publicLink); addNotification('تم النسخ!', "success"); }}
                            className={`p-2 rounded-lg shadow-sm transition ${ts.buttonSecondary}`}
                        >
                            <Copy size={16}/>
                        </button>
                    </div>

                    <div className="flex gap-4 relative z-10">
                        <a 
                            href={publicLink} 
                            target="_blank" 
                            rel="noreferrer"
                            className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition ${ts.buttonPrimary}`}
                        >
                            <ExternalLink size={20}/> فتح الموقع الآن
                        </a>
                        <div className="flex-1 bg-gray-900 text-white rounded-2xl flex flex-col items-center justify-center p-4 relative overflow-hidden group">
                            <Smartphone size={32} className="mb-2 z-10"/>
                            <span className="font-bold text-xs z-10">معاينة الجوال</span>
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                        </div>
                    </div>

                    <p className={`mt-6 text-xs font-bold leading-relaxed relative z-10 ${ts.subtext}`}>
                        * هذا الرابط مخصص للزوار والنزلاء. يمكن استخدامه للتحقق من الحجوزات أو تصفح الخدمات دون الدخول للنظام الإداري.
                    </p>
                </div>

                {/* Configuration Form */}
                <div className={`p-8 rounded-[2.5rem] shadow-sm border ${ts.card}`}>
                    {settings.theme === 'zellige' && <div className={`absolute inset-0 pointer-events-none ${ts.pattern}`}></div>}
                    <h3 className={`font-black text-xl mb-6 flex items-center gap-2 relative z-10 ${ts.text}`}>
                        <Edit3 size={24} /> تخصيص المحتوى
                    </h3>
                    
                    <div className="space-y-4 relative z-10">
                        <div>
                            <label className={`block text-xs font-bold mb-2 ${ts.subtext}`}>العنوان الترويجي (Hero Title)</label>
                            <input 
                                type="text" 
                                value={config.promoTitle}
                                onChange={e => setConfig({...config, promoTitle: e.target.value})}
                                className={`w-full p-4 rounded-2xl border-2 outline-none font-bold transition ${ts.input}`}
                            />
                        </div>
                        <div>
                            <label className={`block text-xs font-bold mb-2 ${ts.subtext}`}>الوصف المختصر</label>
                            <textarea 
                                value={config.promoDescription}
                                onChange={e => setConfig({...config, promoDescription: e.target.value})}
                                className={`w-full p-4 rounded-2xl border-2 outline-none font-bold transition h-32 resize-none ${ts.input}`}
                            />
                        </div>
                        <div>
                            <label className={`block text-xs font-bold mb-2 ${ts.subtext}`}>نص الزر الرئيسي</label>
                            <input 
                                type="text" 
                                value={config.buttonText}
                                onChange={e => setConfig({...config, buttonText: e.target.value})}
                                className={`w-full p-4 rounded-2xl border-2 outline-none font-bold transition ${ts.input}`}
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleSave}
                        className="w-full mt-8 py-4 bg-green-600 text-white rounded-2xl font-black shadow-lg hover:bg-green-700 transition flex items-center justify-center gap-2 relative z-10"
                    >
                        <Save size={20}/> حفظ التعديلات
                    </button>
                </div>
            </div>
        </div>
    );
};
