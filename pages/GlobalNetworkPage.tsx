import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Globe, Shield, Activity, Share2, Lock, Server, Map, BarChart3, ArrowUpRight, CheckCircle2, XCircle, Building2, Briefcase, Plus, Search, MoreVertical, Phone, Mail, FileText, UserCircle } from 'lucide-react';
import { Partner } from '../types';

export const GlobalNetworkPage = () => {
    const { settings, partners, addPartner, updatePartner, removePartner } = useHotel();
    const [networkStatus, setNetworkStatus] = useState('active');
    const [activeTab, setActiveTab] = useState<'network' | 'partners'>('network');
    const [showAddPartner, setShowAddPartner] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // New Partner Form State
    const [newPartner, setNewPartner] = useState<Partial<Partner>>({
        type: 'hotel',
        contractStatus: 'pending',
        partnershipLevel: 'silver',
        servicesExchanged: []
    });

    const [dataSharing, setDataSharing] = useState({
        blacklist: true,
        marketTrends: true,
        staffRating: false,
        inventory: false
    });

    const getThemeStyles = () => {
        if (settings.darkMode) {
            if (settings.theme === 'zellige') {
                return {
                    bg: 'bg-[#001e21]',
                    card: 'bg-[#002a2d] border border-[#cca43b]/30 relative overflow-hidden',
                    text: 'text-[#f0c04a]',
                    subtext: 'text-[#cca43b]/70',
                    accent: 'text-[#cca43b]',
                    button: 'bg-[#cca43b] text-[#001e21] hover:bg-[#b08d30]',
                    input: 'bg-[#001517] border-[#cca43b]/30 text-[#f0c04a]',
                    pattern: 'bg-zellige-pattern opacity-10 mix-blend-screen'
                };
            }
            if (settings.theme === 'zellige-algiers') {
                return {
                    bg: 'bg-[#0f172a]',
                    card: 'bg-[#1e293b] border border-[#1e3a8a]/30 relative overflow-hidden',
                    text: 'text-[#f8fafc]',
                    subtext: 'text-[#94a3b8]',
                    accent: 'text-[#1e3a8a]',
                    button: 'bg-[#1e3a8a] text-[#f8fafc] hover:bg-[#172554]',
                    input: 'bg-[#0f172a] border-[#1e3a8a]/30 text-[#f8fafc]',
                    pattern: 'bg-zellige-algiers-pattern opacity-10 mix-blend-screen'
                };
            }
        }
        if (settings.theme === 'zellige') {
            return {
                bg: 'bg-[#FDFBF7]',
                card: 'bg-white border border-[#cca43b]/40 relative overflow-hidden',
                text: 'text-[#006269]',
                subtext: 'text-[#cca43b]',
                accent: 'text-[#006269]',
                button: 'bg-[#006269] text-[#cca43b] hover:bg-[#004d53]',
                input: 'bg-[#fbf8f1] border-[#cca43b]/30 text-[#006269]',
                pattern: 'bg-zellige-pattern opacity-10 mix-blend-multiply'
            };
        }
        if (settings.theme === 'zellige-algiers') {
            return {
                bg: 'bg-[#eff6ff]',
                card: 'bg-white border border-[#1e3a8a]/40 relative overflow-hidden',
                text: 'text-[#1e3a8a]',
                subtext: 'text-[#64748b]',
                accent: 'text-[#1e3a8a]',
                button: 'bg-[#1e3a8a] text-[#f8fafc] hover:bg-[#172554]',
                input: 'bg-white border-[#1e3a8a]/30 text-[#1e3a8a]',
                pattern: 'bg-zellige-algiers-pattern opacity-10 mix-blend-multiply'
            };
        }
        return {
            bg: 'bg-gray-50 dark:bg-gray-900',
            card: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
            text: 'text-gray-900 dark:text-white',
            subtext: 'text-gray-500 dark:text-gray-400',
            accent: 'text-blue-600',
            button: 'bg-blue-600 text-white hover:bg-blue-700',
            input: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
            pattern: ''
        };
    };

    const ts = getThemeStyles();

    const handleAddPartner = () => {
        if (!newPartner.name || !newPartner.contactPerson) return;
        addPartner({
            ...newPartner,
            id: `partner-${Date.now()}`,
            servicesExchanged: newPartner.servicesExchanged || []
        } as Partner);
        setShowAddPartner(false);
        setNewPartner({ type: 'hotel', contractStatus: 'pending', partnershipLevel: 'silver', servicesExchanged: [] });
    };

    const filteredPartners = (partners || []).filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className={`min-h-screen p-6 pb-24 ${ts.bg} transition-colors duration-300`}>
            {/* Header */}
            <div className={`rounded-[2.5rem] p-8 mb-8 shadow-xl relative overflow-hidden ${ts.card}`}>
                {settings.theme === 'zellige' && <div className={`absolute inset-0 pointer-events-none ${ts.pattern}`}></div>}
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            <Globe size={20} className={ts.accent} />
                            <span className={`text-xs font-bold uppercase tracking-widest ${ts.subtext}`}>Zellige Global Alliance</span>
                        </div>
                        <h1 className={`text-4xl font-black tracking-tight mb-2 ${ts.text}`}>الشبكة العالمية والشراكات</h1>
                        <p className={`font-medium text-sm max-w-xl ${ts.subtext}`}>
                            منصة مركزية لربط الفنادق وإدارة الشراكات الاستراتيجية.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setActiveTab('network')} className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'network' ? ts.button : 'bg-transparent border border-current opacity-50'}`}>
                            الشبكة العالمية
                        </button>
                        <button onClick={() => setActiveTab('partners')} className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'partners' ? ts.button : 'bg-transparent border border-current opacity-50'}`}>
                            إدارة الشركاء
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'network' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                    {/* Network Status & Map */}
                    <div className={`lg:col-span-2 rounded-[2.5rem] p-6 shadow-lg ${ts.card}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className={`text-xl font-bold flex items-center gap-2 ${ts.text}`}>
                                <Map size={24} />
                                خريطة التواجد العالمي
                            </h3>
                            <button className={`px-4 py-2 rounded-xl text-xs font-bold ${ts.button}`}>تحديث البيانات</button>
                        </div>
                        
                        <div className={`aspect-video rounded-3xl w-full flex items-center justify-center relative overflow-hidden ${settings.darkMode ? 'bg-[#001012]' : 'bg-blue-50'}`}>
                            {/* Mock Map Visualization */}
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #888 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                            <div className="relative z-10 text-center">
                                <Globe size={64} className={`mx-auto mb-4 opacity-50 ${ts.accent}`} />
                                <p className={`font-bold ${ts.subtext}`}>جاري تحميل خريطة العقد المتصلة...</p>
                                <div className="flex justify-center gap-4 mt-4">
                                    <div className="flex items-center gap-2 text-xs font-bold opacity-70">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span> 12 فندق متصل
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold opacity-70">
                                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span> 3 قيد المزامنة
                                    </div>
                                </div>
                            </div>
                            
                            {/* Mock Nodes */}
                            <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-ping"></div>
                            <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"></div>
                            <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <div className={`p-4 rounded-2xl border ${settings.darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                                <div className="text-xs font-bold opacity-60 mb-1">زمن الاستجابة</div>
                                <div className={`text-xl font-black ${ts.text}`}>45ms</div>
                            </div>
                            <div className={`p-4 rounded-2xl border ${settings.darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                                <div className="text-xs font-bold opacity-60 mb-1">البيانات المتبادلة</div>
                                <div className={`text-xl font-black ${ts.text}`}>2.4 GB</div>
                            </div>
                            <div className={`p-4 rounded-2xl border ${settings.darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                                <div className="text-xs font-bold opacity-60 mb-1">التشفير</div>
                                <div className={`text-xl font-black ${ts.text}`}>AES-256</div>
                            </div>
                        </div>
                    </div>

                    {/* Data Sharing Controls */}
                    <div className="space-y-6">
                        <div className={`rounded-[2.5rem] p-6 shadow-lg ${ts.card}`}>
                            <h3 className={`text-xl font-bold flex items-center gap-2 mb-6 ${ts.text}`}>
                                <Share2 size={24} />
                                بروتوكولات المشاركة
                            </h3>
                            
                            <div className="space-y-4">
                                {[
                                    { id: 'blacklist', label: 'القائمة السوداء الموحدة', icon: Shield, desc: 'مشاركة بيانات النزلاء المحظورين أمنياً' },
                                    { id: 'marketTrends', label: 'مؤشرات السوق', icon: BarChart3, desc: 'مشاركة نسب الإشغال ومتوسط الأسعار (مجهول المصدر)' },
                                    { id: 'staffRating', label: 'تقييم الموظفين', icon: Activity, desc: 'سجل أداء الموظفين المتنقلين بين الفروع' },
                                    { id: 'inventory', label: 'فائض المخزون', icon: Server, desc: 'عرض المواد الزائدة للبيع أو التبادل' }
                                ].map((item) => (
                                    <div key={item.id} className={`p-4 rounded-2xl border transition-all ${dataSharing[item.id as keyof typeof dataSharing] ? (settings.darkMode ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200') : (settings.darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100')}`}>
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl ${ts.bg}`}>
                                                    <item.icon size={18} className={ts.accent} />
                                                </div>
                                                <div>
                                                    <div className={`font-bold ${ts.text}`}>{item.label}</div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => setDataSharing(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof dataSharing] }))}
                                                className={`relative w-11 h-6 rounded-full transition-colors ${dataSharing[item.id as keyof typeof dataSharing] ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                            >
                                                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${dataSharing[item.id as keyof typeof dataSharing] ? 'translate-x-5' : ''}`}></span>
                                            </button>
                                        </div>
                                        <p className="text-xs opacity-70 leading-relaxed pr-12">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in">
                    {/* Partners Management */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className={`relative flex-1 w-full max-w-md`}>
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50" size={20} />
                            <input 
                                type="text" 
                                placeholder="بحث عن شريك..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className={`w-full pr-12 pl-4 py-3 rounded-2xl border-2 outline-none font-bold ${ts.input}`}
                            />
                        </div>
                        <button 
                            onClick={() => setShowAddPartner(true)}
                            className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg ${ts.button}`}
                        >
                            <Plus size={20} /> إضافة شريك جديد
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPartners.map(partner => (
                            <div key={partner.id} className={`p-6 rounded-[2rem] shadow-sm border relative group ${ts.card}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl ${ts.bg}`}>
                                        {partner.type === 'hotel' ? <Building2 size={24} className={ts.accent}/> : <Briefcase size={24} className={ts.accent}/>}
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${partner.contractStatus === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                        {partner.contractStatus === 'active' ? 'نشط' : 'معلق'}
                                    </div>
                                </div>
                                <h3 className={`text-xl font-black mb-1 ${ts.text}`}>{partner.name}</h3>
                                <p className={`text-sm font-bold opacity-70 mb-4 ${ts.subtext}`}>{partner.type === 'hotel' ? 'فندق شريك' : 'مركز خدمات'}</p>
                                
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-sm opacity-80">
                                        <UserCircle size={16} /> {partner.contactPerson}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm opacity-80">
                                        <Phone size={16} /> {partner.phone}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm opacity-80">
                                        <Mail size={16} /> {partner.email}
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-auto">
                                    <button className={`flex-1 py-2 rounded-xl text-xs font-bold border border-current opacity-50 hover:opacity-100 transition ${ts.text}`}>
                                        التفاصيل
                                    </button>
                                    <button className={`flex-1 py-2 rounded-xl text-xs font-bold border border-current opacity-50 hover:opacity-100 transition ${ts.text}`}>
                                        العقود
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filteredPartners.length === 0 && (
                            <div className="col-span-full text-center py-12 opacity-50">
                                <Briefcase size={48} className="mx-auto mb-4" />
                                <p>لا يوجد شركاء مطابقين للبحث</p>
                            </div>
                        )}
                    </div>

                    {/* Add Partner Modal */}
                    {showAddPartner && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className={`w-full max-w-lg p-8 rounded-[2.5rem] shadow-2xl animate-scale-in ${ts.card} ${ts.bg}`}>
                                <h2 className={`text-2xl font-black mb-6 ${ts.text}`}>إضافة شريك جديد</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold mb-2 opacity-70">اسم المؤسسة</label>
                                        <input 
                                            type="text" 
                                            className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.input}`}
                                            value={newPartner.name || ''}
                                            onChange={e => setNewPartner({...newPartner, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold mb-2 opacity-70">النوع</label>
                                            <select 
                                                className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.input}`}
                                                value={newPartner.type}
                                                onChange={e => setNewPartner({...newPartner, type: e.target.value as any})}
                                            >
                                                <option value="hotel">فندق</option>
                                                <option value="service_center">مركز خدمات</option>
                                                <option value="travel_agency">وكالة سفر</option>
                                                <option value="corporate">شركة</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-2 opacity-70">المستوى</label>
                                            <select 
                                                className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.input}`}
                                                value={newPartner.partnershipLevel}
                                                onChange={e => setNewPartner({...newPartner, partnershipLevel: e.target.value as any})}
                                            >
                                                <option value="silver">فضي</option>
                                                <option value="gold">ذهبي</option>
                                                <option value="platinum">بلاتيني</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold mb-2 opacity-70">الشخص المسؤول</label>
                                        <input 
                                            type="text" 
                                            className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.input}`}
                                            value={newPartner.contactPerson || ''}
                                            onChange={e => setNewPartner({...newPartner, contactPerson: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold mb-2 opacity-70">الهاتف</label>
                                            <input 
                                                type="text" 
                                                className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.input}`}
                                                value={newPartner.phone || ''}
                                                onChange={e => setNewPartner({...newPartner, phone: e.target.value})}
                                                dir="ltr"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-2 opacity-70">البريد الإلكتروني</label>
                                            <input 
                                                type="email" 
                                                className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.input}`}
                                                value={newPartner.email || ''}
                                                onChange={e => setNewPartner({...newPartner, email: e.target.value})}
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button onClick={() => setShowAddPartner(false)} className="flex-1 py-3 rounded-xl font-bold opacity-70 hover:opacity-100 transition bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                        إلغاء
                                    </button>
                                    <button onClick={handleAddPartner} className={`flex-1 py-3 rounded-xl font-bold shadow-lg ${ts.button}`}>
                                        حفظ الشريك
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
