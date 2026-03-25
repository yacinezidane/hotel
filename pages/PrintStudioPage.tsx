
import React, { useState, useMemo } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { PrintButton } from '../components/PrintButton';
import { RegistrationCard } from '../components/RegistrationCard';
import { 
    Printer, Check, Shield, Ticket, Copy, Eye, FileText, 
    Search, User, QrCode, FileBarChart, LayoutTemplate, 
    Plus, Edit2, Trash2, Save, Code, ChevronRight,
    Settings, Sparkles, Wand2, FileCheck
} from 'lucide-react';
import { PrintTemplate, PrintTemplateStyle, RegistrationTemplateStyle } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';

// Mock Components for Previews
const CardPreview = ({ style, type, title, subtitle }: { style: PrintTemplateStyle, type: string, title: string, subtitle: string }) => {
    let containerClass = "border p-4 rounded-xl shadow-md h-40 flex flex-col justify-between relative overflow-hidden transition-all duration-300";
    if (style === 'royal_andalus') containerClass += " bg-[#fdfbf7] border-[#cca43b] text-[#006269]";
    else if (style === 'modern_corporate') containerClass += " bg-white border-blue-200 text-slate-800";
    else if (style === 'vibrant_party') containerClass += " bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none";
    else containerClass += " bg-gray-50 border-gray-300 text-gray-700 font-mono";

    return (
        <div className={containerClass}>
            {style === 'royal_andalus' && <div className="absolute inset-0 bg-zellige-pattern opacity-10 pointer-events-none mix-blend-multiply"></div>}
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-70">{type}</span>
                    <div className={`w-2 h-2 rounded-full ${style === 'vibrant_party' ? 'bg-white' : 'bg-current'}`}></div>
                </div>
                <h3 className={`font-bold text-lg leading-tight ${style === 'royal_andalus' ? 'font-serif' : ''}`}>{title}</h3>
                <p className="text-xs opacity-80 mt-1">{subtitle}</p>
            </div>
            <div className={`relative z-10 flex justify-between items-end border-t pt-2 ${style === 'royal_andalus' ? 'border-[#cca43b]/30' : 'border-current/20'}`}>
                <div className="w-8 h-8 bg-current opacity-20 rounded-md"></div>
                <span className="text-[9px] font-bold tracking-tighter">PREMIUM MODEL</span>
            </div>
        </div>
    );
};

const FormPreview = ({ style }: { style: RegistrationTemplateStyle }) => {
    let containerClass = "border rounded-xl shadow-sm h-56 flex flex-col relative overflow-hidden transition-all duration-300 bg-white p-3";
    if (style === 'classic') containerClass += " border-[#cca43b] bg-[#fffbf0]";
    else if (style === 'modern') containerClass += " border-gray-200";
    else if (style === 'minimal') containerClass += " border-gray-300 font-serif text-[8px]";
    else if (style === 'elegant') containerClass += " border-gray-800 bg-[#1a1a1a] text-yellow-500";
    else if (style === 'technical') containerClass += " border-blue-200 bg-blue-50";

    return (
        <div className={containerClass}>
            {style === 'classic' && <div className="absolute inset-0 bg-zellige-pattern opacity-5 pointer-events-none mix-blend-multiply"></div>}
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${style === 'elegant' ? 'bg-yellow-500' : 'bg-gray-200'}`}></div>
                    <span className="text-[8px] font-bold">REGISTRATION</span>
                </div>
            </div>
            <div className="flex-1 space-y-2">
                <div className="h-2 w-full bg-gray-100 rounded"></div>
                <div className="h-2 w-3/4 bg-gray-100 rounded"></div>
                <div className="h-2 w-full bg-gray-100 rounded"></div>
            </div>
            <div className="mt-auto pt-2 border-t border-gray-50">
                <div className="h-px w-1/2 ml-auto bg-gray-200"></div>
            </div>
        </div>
    );
};

export const PrintStudioPage: React.FC = () => {
    const { settings, updateSettings, currentUser, bookings, rooms, addNotification, addPrintTemplate, updatePrintTemplate, deletePrintTemplate } = useHotel();
    const [activeMainTab, setActiveMainTab] = useState<'quick' | 'studio' | 'settings'>('quick');
    const [activeQuickTab, setActiveQuickTab] = useState<'registration' | 'official' | 'tickets' | 'other'>('registration');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Partial<PrintTemplate> | null>(null);
    const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
    const [config, setConfig] = useState(settings.printConfig);

    const categories = ['all', 'ticket', 'form', 'card', 'report', 'letter', 'invoice'];

    const ts = useMemo(() => {
        const isZellige = settings.theme.startsWith('zellige');
        return {
            card: isZellige ? 'bg-[#FDFBF7] border border-[#cca43b]/30' : 'bg-white dark:bg-gray-800 border border-black/5',
            header: isZellige ? 'text-[#006269]' : 'text-gray-900 dark:text-white',
            btn: isZellige ? 'bg-[#006269] text-[#cca43b]' : 'bg-emerald-600 text-white',
            tabActive: isZellige ? 'bg-[#006269] text-[#cca43b]' : 'bg-emerald-600 text-white',
            tabInactive: isZellige ? 'text-[#006269] hover:bg-[#006269]/10' : 'text-gray-500 hover:bg-gray-100',
            input: isZellige ? 'bg-[#fbf8f1] border-[#cca43b]/30' : 'bg-gray-50 border-black/5'
        };
    }, [settings.theme]);

    const filteredTemplates = useMemo(() => {
        return (settings.customPrintTemplates || []).filter(t => {
            const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                t.type.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [settings.customPrintTemplates, searchTerm, selectedCategory]);

    const filteredBookings = bookings.filter(b => 
        b.status === 'active' && 
        b.guests.some(g => 
            g.firstNameAr.includes(searchTerm) || 
            g.lastNameAr.includes(searchTerm) ||
            g.firstNameEn.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleSaveTemplate = () => {
        if (!editingTemplate?.name || !editingTemplate?.content) return;
        if (editingTemplate.id) {
            updatePrintTemplate(editingTemplate.id, editingTemplate);
        } else {
            addPrintTemplate(editingTemplate as Omit<PrintTemplate, 'id'>);
        }
        setIsEditing(false);
        setEditingTemplate(null);
        addNotification('تم حفظ النموذج بنجاح', 'success');
    };

    const handleSaveSettings = () => {
        updateSettings({ printConfig: config });
        addNotification('تم حفظ الإعدادات بنجاح', 'success');
    };

    const renderCustomPreview = (content: string) => {
        let preview = content
            .replace(/{{hotelName}}/g, settings.appName)
            .replace(/{{guestName}}/g, 'محمد الجزائري')
            .replace(/{{roomNumber}}/g, '101')
            .replace(/{{date}}/g, new Date().toLocaleDateString('ar-DZ'))
            .replace(/{{footerText}}/g, settings.invoiceFooterText);
        return <div dangerouslySetInnerHTML={{ __html: preview }} />;
    };

    return (
        <div className="space-y-8 pb-32 animate-fade-in">
            <PageHeader pageKey="print_studio" defaultTitle="استوديو الطباعة الذكي" icon={Printer} />

            {/* Main Navigation Tabs */}
            <div className="flex justify-center">
                <div className="flex p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-[2rem] border border-black/5">
                    {[
                        { id: 'quick', label: 'الطباعة السريعة', icon: Printer },
                        { id: 'studio', label: 'استوديو النماذج', icon: Wand2 },
                        { id: 'settings', label: 'الإعدادات', icon: Settings },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveMainTab(tab.id as any)}
                            className={`px-8 py-3.5 rounded-[1.5rem] font-black flex items-center gap-3 transition-all ${activeMainTab === tab.id ? ts.tabActive + ' shadow-lg' : ts.tabInactive}`}
                        >
                            <tab.icon size={20} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeMainTab === 'quick' && (
                    <motion.div 
                        key="quick"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        {/* Sub Tabs for Quick Print */}
                        <div className="flex flex-wrap justify-center gap-2">
                            {[
                                { id: 'registration', label: 'استمارات التسجيل', icon: FileCheck },
                                { id: 'official', label: 'الوثائق الرسمية', icon: Shield },
                                { id: 'tickets', label: 'التذاكر والبطاقات', icon: Ticket },
                                { id: 'other', label: 'نماذج أخرى', icon: Copy },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveQuickTab(tab.id as any)}
                                    className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${activeQuickTab === tab.id ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200' : 'bg-white border-2 border-transparent text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Quick Print Content */}
                        <div className={`p-8 rounded-[3rem] shadow-xl ${ts.card}`}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <div>
                                    <h3 className={`text-2xl font-black ${ts.header}`}>
                                        {activeQuickTab === 'registration' && 'استمارات تسجيل النزلاء'}
                                        {activeQuickTab === 'official' && 'الوثائق والتقارير الرسمية'}
                                        {activeQuickTab === 'tickets' && 'إصدار التذاكر والبطاقات'}
                                        {activeQuickTab === 'other' && 'نماذج ووثائق متنوعة'}
                                    </h3>
                                    <p className="text-sm opacity-60">اختر النموذج المطلوب وقم بالطباعة فوراً.</p>
                                </div>
                                <div className="relative w-full md:w-72">
                                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                                    <input 
                                        type="text"
                                        placeholder="بحث سريع..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className={`w-full pr-12 pl-4 py-3 rounded-2xl outline-none font-bold transition-all ${ts.input}`}
                                    />
                                </div>
                            </div>

                            {activeQuickTab === 'registration' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredBookings.map(booking => (
                                        booking.guests.map((guest, idx) => (
                                            <div key={`${booking.id}-${idx}`} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between group hover:bg-white dark:hover:bg-gray-800 transition-all border border-transparent hover:border-emerald-500/20">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                                                        {guest.firstNameAr.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">{guest.firstNameAr} {guest.lastNameAr}</p>
                                                        <p className="text-[10px] opacity-50">غرفة {rooms.find(r => r.id === booking.roomId)?.number}</p>
                                                    </div>
                                                </div>
                                                <PrintButton 
                                                    label="طباعة"
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold ${ts.btn}`}
                                                    content={<RegistrationCard guest={guest} roomNumber={rooms.find(r => r.id === booking.roomId)?.number} checkInDate={booking.checkInDate} appName={settings.appName} />}
                                                />
                                            </div>
                                        ))
                                    ))}
                                </div>
                            )}

                            {activeQuickTab === 'official' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100">
                                        <Shield className="text-blue-600 mb-4" size={32} />
                                        <h4 className="font-black text-lg mb-2">استمارة الشرطة (Police Form)</h4>
                                        <p className="text-xs text-blue-800/60 mb-6">النموذج الرسمي المعتمد للأجهزة الأمنية.</p>
                                        <div className="space-y-2">
                                            {filteredBookings.slice(0, 3).map(b => (
                                                <div key={b.id} className="flex items-center justify-between p-2 bg-white rounded-xl">
                                                    <span className="text-xs font-bold">{b.guests[0].firstNameAr}</span>
                                                    <PrintButton label="طباعة" className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px]" content={<div>Police Form Content</div>} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-purple-50 border border-purple-100">
                                        <FileBarChart className="text-purple-600 mb-4" size={32} />
                                        <h4 className="font-black text-lg mb-2">تقرير الإشغال اليومي</h4>
                                        <p className="text-xs text-purple-800/60 mb-6">إحصائيات النزلاء والغرف لليوم الحالي.</p>
                                        <PrintButton label="توليد وطباعة التقرير" className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold" content={<div>Daily Report Content</div>} />
                                    </div>
                                </div>
                            )}

                            {activeQuickTab === 'tickets' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <CardPreview style="royal_andalus" type="VIP PASS" title="جناح ملكي" subtitle="وصول كامل للمرافق" />
                                    <CardPreview style="modern_corporate" type="EVENT" title="مؤتمر التقنية" subtitle="قاعة الاجتماعات الكبرى" />
                                    <CardPreview style="vibrant_party" type="PARTY" title="حفل العشاء" subtitle="مطعم الزليج - 8:00 مساءً" />
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeMainTab === 'studio' && (
                    <motion.div 
                        key="studio"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        {!isEditing ? (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                <div className="flex flex-col md:flex-row items-center gap-4 flex-1">
                                    <div className="relative flex-1 w-full">
                                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
                                        <input 
                                            type="text"
                                            placeholder="بحث في النماذج المخصصة..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className={`w-full pr-12 pl-4 py-3 rounded-2xl outline-none font-bold ${ts.input}`}
                                        />
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar max-w-full md:max-w-xs">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all ${
                                                    selectedCategory === cat ? ts.tabActive : ts.tabInactive
                                                }`}
                                            >
                                                {cat === 'all' ? 'الكل' : cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                    <button 
                                        onClick={() => {
                                            setEditingTemplate({ name: '', type: 'invoice', category: 'invoice', content: '', isDefault: false, description: '' });
                                            setIsEditing(true);
                                        }}
                                        className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black shadow-xl transition-transform hover:scale-105 ${ts.btn}`}
                                    >
                                        <Plus size={20} />
                                        تصميم نموذج جديد
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredTemplates.map(template => (
                                        <div key={template.id} className={`p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group ${ts.card}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                                                    <LayoutTemplate size={24} />
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => { setEditingTemplate(template); setIsEditing(true); }} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-emerald-600 transition-colors"><Edit2 size={18}/></button>
                                                    <button onClick={() => deletePrintTemplate(template.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
                                                </div>
                                            </div>
                                            <h4 className="text-xl font-black mb-1">{template.name}</h4>
                                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                                <span className="px-3 py-1 rounded-full bg-gray-100 text-[10px] font-bold uppercase">{template.category || template.type}</span>
                                                {template.isDefault && <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold">افتراضي</span>}
                                                {template.description && <span className="text-[10px] opacity-40 truncate max-w-[100px]">{template.description}</span>}
                                            </div>
                                            <button 
                                                onClick={() => { setEditingTemplate(template); setIsEditing(true); setPreviewMode('preview'); }}
                                                className="w-full py-3 rounded-xl bg-gray-50 text-gray-900 font-bold text-sm hover:bg-gray-100 transition flex items-center justify-center gap-2"
                                            >
                                                <Eye size={16} /> معاينة وتعديل
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className={`rounded-[3rem] shadow-2xl overflow-hidden ${ts.card}`}>
                                <div className="p-6 border-b border-black/5 flex items-center justify-between bg-gray-50/50">
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setIsEditing(false)} className="p-2 rounded-xl hover:bg-white transition"><ChevronRight size={24}/></button>
                                        <h2 className="text-xl font-black">{editingTemplate?.id ? 'تعديل النموذج' : 'نموذج جديد'}</h2>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex p-1 bg-white rounded-xl border border-black/5">
                                            <button onClick={() => setPreviewMode('edit')} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${previewMode === 'edit' ? 'bg-emerald-600 text-white' : 'text-gray-500'}`}><Code size={14} className="inline ml-2"/>المحرر</button>
                                            <button onClick={() => setPreviewMode('preview')} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${previewMode === 'preview' ? 'bg-emerald-600 text-white' : 'text-gray-500'}`}><Eye size={14} className="inline ml-2"/>المعاينة</button>
                                        </div>
                                        <button onClick={handleSaveTemplate} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold ${ts.btn}`}><Save size={20}/> حفظ</button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 h-[65vh]">
                                    <div className={`p-8 border-l border-black/5 flex flex-col gap-6 ${previewMode === 'preview' ? 'hidden lg:flex' : 'flex'}`}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold mb-1 block opacity-50">اسم النموذج</label>
                                                <input 
                                                    type="text" 
                                                    value={editingTemplate?.name} 
                                                    onChange={e => setEditingTemplate(p => ({...p!, name: e.target.value}))}
                                                    className={`w-full p-4 rounded-2xl outline-none font-bold ${ts.input}`}
                                                    placeholder="اسم النموذج"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold mb-1 block opacity-50">التصنيف</label>
                                                <select 
                                                    value={editingTemplate?.category || 'form'} 
                                                    onChange={e => setEditingTemplate(p => ({...p!, category: e.target.value as any}))}
                                                    className={`w-full p-4 rounded-2xl outline-none font-bold ${ts.input}`}
                                                >
                                                    {categories.filter(c => c !== 'all').map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold mb-1 block opacity-50">النوع الأساسي</label>
                                                <select 
                                                    value={editingTemplate?.type} 
                                                    onChange={e => setEditingTemplate(p => ({...p!, type: e.target.value as any}))}
                                                    className={`w-full p-4 rounded-2xl outline-none font-bold ${ts.input}`}
                                                >
                                                    <option value="invoice">فاتورة</option>
                                                    <option value="ticket">تذكرة</option>
                                                    <option value="form">استمارة</option>
                                                    <option value="letter">رسالة</option>
                                                    <option value="card">بطاقة</option>
                                                    <option value="report">تقرير</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold mb-1 block opacity-50">الوصف</label>
                                                <input 
                                                    type="text" 
                                                    value={editingTemplate?.description || ''} 
                                                    onChange={e => setEditingTemplate(p => ({...p!, description: e.target.value}))}
                                                    className={`w-full p-4 rounded-2xl outline-none font-bold ${ts.input}`}
                                                    placeholder="وصف مختصر..."
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1 flex flex-col">
                                            <label className="text-[10px] font-bold mb-1 block opacity-50">محتوى HTML</label>
                                            <textarea 
                                                value={editingTemplate?.content} 
                                                onChange={e => setEditingTemplate(p => ({...p!, content: e.target.value}))}
                                                className="flex-1 w-full p-6 rounded-3xl bg-gray-900 text-emerald-400 font-mono text-sm resize-none"
                                                placeholder="كود HTML هنا..."
                                            />
                                        </div>
                                    </div>
                                    <div className={`bg-gray-100 p-8 overflow-auto ${previewMode === 'edit' ? 'hidden lg:block' : 'block'}`}>
                                        <div className="bg-white shadow-2xl rounded-xl min-h-full p-8">
                                            {editingTemplate?.content ? renderCustomPreview(editingTemplate.content) : <div className="flex items-center justify-center h-full opacity-20"><Eye size={64}/></div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeMainTab === 'settings' && (
                    <motion.div 
                        key="settings"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        <div className={`p-8 rounded-[3rem] shadow-xl ${ts.card}`}>
                            <h3 className={`text-xl font-black mb-6 flex items-center gap-2 ${ts.header}`}><QrCode size={24}/> إعدادات رموز الاستجابة (QR)</h3>
                            <div className="space-y-6">
                                <label className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 cursor-pointer">
                                    <input type="checkbox" checked={config.showQrCode} onChange={e => setConfig({...config, showQrCode: e.target.checked})} className="w-6 h-6 rounded-lg" />
                                    <div>
                                        <p className="font-bold">تفعيل QR Code</p>
                                        <p className="text-xs opacity-50">إضافة رمز التحقق لجميع المطبوعات الرسمية.</p>
                                    </div>
                                </label>
                                <div>
                                    <label className="block text-xs font-bold mb-2 opacity-50">نص التذييل الافتراضي</label>
                                    <input 
                                        type="text" 
                                        value={config.customFooterText} 
                                        onChange={e => setConfig({...config, customFooterText: e.target.value})}
                                        className={`w-full p-4 rounded-2xl outline-none font-bold ${ts.input}`}
                                    />
                                </div>
                                <button onClick={handleSaveSettings} className={`w-full py-4 rounded-2xl font-black shadow-lg ${ts.btn}`}>حفظ الإعدادات العامة</button>
                            </div>
                        </div>

                        <button 
                            onClick={() => addNotification('ميزة الذكاء الاصطناعي قيد التطوير حالياً، سيتم تفعيلها في التحديث القادم!', 'info')}
                            className={`p-8 rounded-[3rem] shadow-xl ${ts.card} flex flex-col items-center justify-center text-center transition-transform hover:scale-[1.02] active:scale-95 w-full`}
                        >
                            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                                <Sparkles size={40} />
                            </div>
                            <h3 className="text-xl font-black mb-2">الذكاء الاصطناعي في الطباعة</h3>
                            <p className="text-sm opacity-60 mb-6">قريباً: توليد نماذج طباعة احترافية باستخدام الوصف النصي فقط.</p>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="w-2/3 h-full bg-emerald-500"></div>
                            </div>
                            <p className="text-[10px] mt-2 font-bold text-emerald-600">قيد التطوير - 65% (اضغط لمزيد من التفاصيل)</p>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
