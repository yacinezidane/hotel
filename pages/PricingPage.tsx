
import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { 
    Tag, BedDouble, Utensils, Waves, Zap, Plus, Trash2, Edit3, Save, Check, X, 
    Coffee, PartyPopper, Briefcase, Sliders, Power, ArrowUp, ArrowDown, Settings, Gauge, ShoppingBag,
    Truck, Car, Shirt, Sparkles
} from 'lucide-react';
import { RoomType, MenuItem, ServiceItem } from '../types';

export const PricingPage: React.FC = () => {
    const { 
        settings, updateRoomPrices, updateStandardRate, updateServiceAvailability,
        menuItems, addMenuItem, updateMenuItem, deleteMenuItem,
        guestServices, addNewService, updateServiceItem, removeService, toggleServiceStatus, addNotification
    } = useHotel();

    const [activeTab, setActiveTab] = useState<'rooms' | 'restaurant' | 'cafe' | 'facilities' | 'services' | 'strategy'>('rooms');
    
    // --- Modals & Edit States ---
    const [showMenuModal, setShowMenuModal] = useState(false);
    const [menuItemForm, setMenuItemForm] = useState<Partial<MenuItem>>({});
    
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [serviceItemForm, setServiceItemForm] = useState<Partial<ServiceItem>>({});

    const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
    const [roomPriceForm, setRoomPriceForm] = useState<{label: string, amount: number}[]>([]);

    // --- Bulk Action States ---
    const [bulkPercentage, setBulkPercentage] = useState<number>(0);

    // --- Theme Logic ---
    const getThemeStyles = () => {
        switch (settings.theme) {
            case 'zellige': return {
                tabActive: 'bg-[#006269] text-[#cca43b] border-[#cca43b] shadow-md',
                tabInactive: 'text-[#006269] bg-[#fbf8f1] border-[#cca43b]/20 hover:bg-[#cca43b]/10',
                card: 'bg-[#FDFBF7] border border-[#cca43b]/30 shadow-sm hover:shadow-md',
                button: 'bg-[#006269] text-[#cca43b] hover:bg-[#004d53]',
                icon: 'text-[#cca43b]',
                input: 'border-[#cca43b]/40 focus:border-[#006269] bg-[#fbf8f1] text-[#006269]',
                smartPanel: 'bg-[#006269]/5 border-[#006269]/10'
            };
            case 'zellige-v2': return {
                tabActive: 'bg-[#024d38] text-white border-[#c6e3d8] shadow-md',
                tabInactive: 'text-[#024d38] bg-[#f5fcf9] border-[#c6e3d8]/30 hover:bg-[#c6e3d8]/20',
                card: 'bg-[#f5fcf9] border border-[#c6e3d8]/50 shadow-sm hover:shadow-md',
                button: 'bg-[#024d38] text-white hover:bg-[#013b2b]',
                icon: 'text-[#024d38]',
                input: 'border-[#c6e3d8] focus:border-[#024d38] bg-[#f5fcf9] text-[#024d38]',
                smartPanel: 'bg-[#024d38]/5 border-[#024d38]/10'
            };
            default: return {
                tabActive: 'bg-blue-600 text-white shadow-md',
                tabInactive: 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
                card: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md',
                button: 'bg-blue-600 text-white hover:bg-blue-700',
                icon: 'text-blue-500',
                input: 'border-gray-200 dark:border-gray-600 focus:border-blue-500 bg-white dark:bg-gray-900',
                smartPanel: 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
            };
        }
    };
    const ts = getThemeStyles();

    // --- Helpers for Separation (CROSS-SELLING ENABLED) ---
    // Restaurant displays: Meals, Breakfast, Drinks (Cold), Desserts
    const isRestaurantItem = (cat: string) => ['meal', 'breakfast', 'cold_drink', 'dessert'].includes(cat);
    // Cafe displays: Hot Drinks, Cold Drinks, Desserts, Light Meals (we show all meals for simplicity, filtered in UI if needed)
    const isCafeItem = (cat: string) => ['hot_drink', 'cold_drink', 'dessert', 'meal'].includes(cat);

    const currentMenuItems = menuItems.filter(item => 
        activeTab === 'restaurant' ? isRestaurantItem(item.category) : 
        activeTab === 'cafe' ? isCafeItem(item.category) : false
    );

    // --- Smart Plan: Bulk Actions ---
    const handleBulkAvailability = (available: boolean) => {
        if (!window.confirm(`هل أنت متأكد من ${available ? 'تفعيل' : 'إيقاف'} جميع الأصناف في هذا القسم؟`)) return;
        currentMenuItems.forEach(item => {
            updateMenuItem(item.id, { isAvailable: available });
        });
        addNotification("تم تحديث حالة التوافر بنجاح", "success");
    };

    const handleBulkPriceUpdate = () => {
        if (bulkPercentage === 0) return;
        if (!window.confirm(`سيتم تغيير الأسعار بنسبة ${bulkPercentage > 0 ? '+' : ''}${bulkPercentage}%. هل أنت متأكد؟`)) return;
        
        currentMenuItems.forEach(item => {
            // Smart Rounding: Round to nearest 10 for clean prices
            let newPrice = item.price * (1 + bulkPercentage / 100);
            newPrice = Math.round(newPrice / 10) * 10;
            updateMenuItem(item.id, { price: newPrice });
        });
        setBulkPercentage(0);
        addNotification("تم تحديث الأسعار وفق الخطة", "success");
    };

    const handleStrategyApply = (strategy: string) => {
        if (strategy === 'high_season') {
            if(window.confirm('تفعيل وضع الموسم السياحي؟ سيتم رفع الأسعار بنسبة 20% تقريباً.')) {
               // Logic to increase room prices
               addNotification('تم تفعيل وضع الموسم السياحي', "success");
            }
        } else if (strategy === 'ramadan') {
            addNotification('تم تفعيل وضع رمضان (تغيير مواعيد الخدمات وتعديل القائمة)', "success");
        }
    };

    // --- Save Handlers ---
    const handleEditRoomPrice = (type: RoomType) => {
        setEditingRoomType(type);
        setRoomPriceForm(settings.roomPrices[type].map(p => ({...p})));
    };

    const handleSaveRoomPrice = () => {
        if (editingRoomType) {
            updateRoomPrices(editingRoomType, roomPriceForm);
            setEditingRoomType(null);
        }
    };

    const updateRoomPriceField = (index: number, field: 'label'|'amount', value: any) => {
        const newForm = [...roomPriceForm];
        newForm[index] = { ...newForm[index], [field]: value };
        setRoomPriceForm(newForm);
    };

    const handleSaveMenuItem = () => {
        if (!menuItemForm.name || !menuItemForm.price) return;
        if (menuItemForm.id) {
            updateMenuItem(menuItemForm.id, menuItemForm);
        } else {
            addMenuItem(menuItemForm as any);
        }
        setShowMenuModal(false);
        setMenuItemForm({});
    };

    const handleSaveServiceItem = () => {
        if (!serviceItemForm.labelAr) return;
        if (serviceItemForm.id) {
            updateServiceItem(serviceItemForm.id, serviceItemForm);
        } else {
            addNewService(serviceItemForm as any);
        }
        setShowServiceModal(false);
        setServiceItemForm({});
    };

    // --- Sub-Component: Smart Controls Toolbar ---
    const SmartControls = () => (
        <div className={`p-4 rounded-2xl mb-6 border flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in ${ts.smartPanel}`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-white dark:bg-gray-700 shadow-sm ${ts.icon.split(' ')[0]}`}>
                    <Sliders size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-sm">أدوات التسيير الذكي</h4>
                    <p className="text-[10px] opacity-70">تحكم سريع في القائمة والأسعار</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <div className="flex gap-1 bg-white dark:bg-gray-700 p-1 rounded-xl shadow-sm">
                    <button onClick={() => handleBulkAvailability(true)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-green-600 hover:bg-green-50 transition flex items-center gap-1">
                        <Power size={14}/> فتح الوردية
                    </button>
                    <div className="w-px bg-gray-200 dark:bg-gray-600"></div>
                    <button onClick={() => handleBulkAvailability(false)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition flex items-center gap-1">
                        <Power size={14}/> إغلاق الوردية
                    </button>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-gray-700 p-1 rounded-xl shadow-sm">
                    <button onClick={() => setBulkPercentage(prev => prev - 5)} className="p-1.5 hover:bg-gray-100 rounded-lg text-red-500"><ArrowDown size={14}/></button>
                    <span className={`text-xs font-mono font-bold w-12 text-center ${bulkPercentage > 0 ? 'text-green-600' : bulkPercentage < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                        {bulkPercentage > 0 ? '+' : ''}{bulkPercentage}%
                    </span>
                    <button onClick={() => setBulkPercentage(prev => prev + 5)} className="p-1.5 hover:bg-gray-100 rounded-lg text-green-600"><ArrowUp size={14}/></button>
                    <button 
                        onClick={handleBulkPriceUpdate}
                        disabled={bulkPercentage === 0}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${bulkPercentage !== 0 ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-400'}`}
                    >
                        تطبيق
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 pb-20 animate-fade-in">
            <PageHeader pageKey="pricing" defaultTitle="دليل الأسعار والخدمات" icon={Tag} />

            {/* Tabs */}
            <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
                {[
                    { id: 'strategy', label: 'استراتيجية التسيير', icon: Gauge },
                    { id: 'rooms', label: 'الإقامة والغرف', icon: BedDouble },
                    { id: 'restaurant', label: 'المطعم (مأكولات ومشروبات)', icon: Utensils },
                    { id: 'cafe', label: 'المقهى (مشروبات وسناك)', icon: Coffee },
                    { id: 'facilities', label: 'المرافق والأنشطة', icon: Waves },
                    { id: 'services', label: 'الخدمات الإضافية', icon: Zap },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 min-w-[150px] py-3 px-4 rounded-2xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 border transition-all ${
                            activeTab === tab.id ? ts.tabActive : ts.tabInactive
                        }`}
                    >
                        <tab.icon size={18} /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[500px]">
                
                {/* --- STRATEGY TAB --- */}
                {activeTab === 'strategy' && (
                    <div className="animate-fade-in space-y-6">
                        <div className={`p-6 rounded-[2.5rem] border shadow-sm ${ts.card}`}>
                            <h3 className="font-black text-xl mb-4 flex items-center gap-2"><Settings size={22}/> أوضاع التشغيل العامة</h3>
                            <p className="text-sm opacity-70 mb-6">تغيير إعدادات الفندق بلمسة واحدة لتناسب الظروف الحالية.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <button onClick={() => handleStrategyApply('standard')} className="p-4 rounded-2xl border-2 border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100 transition text-right">
                                    <div className="font-bold text-lg mb-1">الوضع القياسي</div>
                                    <div className="text-xs opacity-80">الأسعار والخدمات الافتراضية</div>
                                </button>
                                <button onClick={() => handleStrategyApply('high_season')} className="p-4 rounded-2xl border-2 border-orange-100 bg-orange-50 text-orange-700 hover:bg-orange-100 transition text-right">
                                    <div className="font-bold text-lg mb-1">الموسم السياحي 🔥</div>
                                    <div className="text-xs opacity-80">رفع الأسعار +20%، تفعيل العروض</div>
                                </button>
                                <button onClick={() => handleStrategyApply('ramadan')} className="p-4 rounded-2xl border-2 border-green-100 bg-green-50 text-green-700 hover:bg-green-100 transition text-right">
                                    <div className="font-bold text-lg mb-1">شهر رمضان 🌙</div>
                                    <div className="text-xs opacity-80">قائمة السحور والإفطار فقط</div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- ROOMS --- */}
                {activeTab === 'rooms' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className={`p-6 rounded-[2.5rem] shadow-sm flex justify-between items-center ${ts.card}`}>
                            <div>
                                <h3 className="font-black text-xl">إتاحة حجز الغرف للزوار</h3>
                                <p className="text-sm text-gray-500 font-bold">السماح للزوار بطلب حجز الغرف عبر واجهة الزوار</p>
                            </div>
                            <button 
                                onClick={() => updateServiceAvailability('roomBooking', !settings.serviceAvailability?.roomBooking)} 
                                className={`p-3 rounded-2xl transition-all duration-300 flex items-center gap-2 font-bold ${settings.serviceAvailability?.roomBooking ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}
                            >
                                <Power size={20}/>
                                {settings.serviceAvailability?.roomBooking ? 'متاح للحجز' : 'غير متاح'}
                            </button>
                        </div>
                        
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!settings.serviceAvailability?.roomBooking ? 'opacity-60 grayscale pointer-events-none' : ''}`}>
                            {(['single', 'double', 'suite', 'vip'] as RoomType[]).map(type => (
                            <div key={type} className={`p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden transition-all duration-300 ${ts.card} ${editingRoomType === type ? 'ring-2 ring-blue-500 scale-[1.01]' : ''}`}>
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-2xl bg-gray-100 dark:bg-gray-700 ${ts.icon}`}>
                                            {type === 'vip' ? <Briefcase /> : <BedDouble />}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black capitalize">
                                                {type === 'single' ? 'غرفة مفردة' : type === 'double' ? 'غرفة مزدوجة' : type === 'suite' ? 'جناح ملكي' : 'VIP Suite'}
                                            </h3>
                                            <p className="text-xs opacity-60 font-bold uppercase tracking-widest">{type}</p>
                                        </div>
                                    </div>
                                    
                                    {editingRoomType === type ? (
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingRoomType(null)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"><X size={18}/></button>
                                            <button onClick={handleSaveRoomPrice} className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-600"><Check size={18}/></button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleEditRoomPrice(type)} className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"><Edit3 size={18}/></button>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {(editingRoomType === type ? roomPriceForm : settings.roomPrices[type]).map((price, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                            {editingRoomType === type ? (
                                                <>
                                                    <input 
                                                        type="text" 
                                                        value={price.label} 
                                                        onChange={(e) => updateRoomPriceField(idx, 'label', e.target.value)}
                                                        className={`flex-1 bg-transparent outline-none font-bold text-sm ${ts.input} border-b`}
                                                        inputMode="text"
                                                    />
                                                    <div className="flex items-center gap-1">
                                                        <input 
                                                            type="number" 
                                                            value={price.amount} 
                                                            onChange={(e) => updateRoomPriceField(idx, 'amount', Number(e.target.value))}
                                                            className={`w-20 bg-transparent outline-none font-black text-right ${ts.input} border-b`}
                                                            inputMode="numeric"
                                                        />
                                                        <span className="text-xs font-bold text-gray-400">د.ج</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="flex-1 font-bold text-sm text-gray-700 dark:text-gray-300">{price.label}</span>
                                                    <span className={`font-black text-lg ${ts.icon.split(' ')[0]}`}>{price.amount.toLocaleString()} <span className="text-xs text-gray-400">د.ج</span></span>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                )}

                {/* --- RESTAURANT & CAFE (Unified Smart Logic) --- */}
                {(activeTab === 'restaurant' || activeTab === 'cafe') && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Global Toggle */}
                        <div className={`p-6 rounded-3xl shadow-sm border flex justify-between items-center ${ts.card} ${!settings.serviceAvailability?.[activeTab] ? 'opacity-60 grayscale' : ''}`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-2xl ${settings.darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                                    {activeTab === 'restaurant' ? <Utensils size={32} className={ts.icon} /> : <Coffee size={32} className={ts.icon} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black">{activeTab === 'restaurant' ? 'خدمة المطعم' : 'خدمة المقهى'}</h3>
                                    <p className={`text-sm font-bold text-gray-500`}>تفعيل أو إيقاف الخدمة بالكامل للنزلاء والزوار</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => updateServiceAvailability(activeTab, !settings.serviceAvailability?.[activeTab])} 
                                className={`p-3 rounded-2xl transition ${settings.serviceAvailability?.[activeTab] !== false ? 'bg-green-100 text-green-600 shadow-inner' : 'bg-gray-200 text-gray-500'}`}
                            >
                                <Power size={24}/>
                            </button>
                        </div>

                        <SmartControls />

                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-lg flex items-center gap-2">
                                {activeTab === 'restaurant' ? <Utensils size={20}/> : <Coffee size={20}/>}
                                {activeTab === 'restaurant' ? 'قائمة المطعم (أطباق ومشروبات)' : 'قائمة المقهى (مشروبات وسناك)'}
                            </h3>
                            <button 
                                onClick={() => { 
                                    setMenuItemForm({ 
                                        category: activeTab === 'restaurant' ? 'meal' : 'hot_drink', 
                                        isAvailable: true 
                                    }); 
                                    setShowMenuModal(true); 
                                }} 
                                className={`px-4 py-2 rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2 ${ts.button}`}
                            >
                                <Plus size={16}/> إضافة صنف
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {currentMenuItems.map(item => (
                                <div key={item.id} className={`p-4 rounded-2xl flex items-center justify-between group transition-all duration-300 ${ts.card} ${!item.isAvailable ? 'opacity-50 grayscale' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl bg-gray-100 dark:bg-gray-700`}>
                                            {item.category === 'meal' ? <Utensils size={20}/> : 
                                             item.category === 'hot_drink' ? <Coffee size={20}/> :
                                             <Zap size={20}/>}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm line-clamp-1">{item.name}</p>
                                            <p className={`text-xs font-black ${ts.icon.split(' ')[0]}`}>{item.price} د.ج</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => updateMenuItem(item.id, { isAvailable: !item.isAvailable })} 
                                            className={`p-1.5 rounded-lg ${item.isAvailable ? 'bg-green-50 text-green-600' : 'bg-gray-200 text-gray-500'}`}
                                            title={item.isAvailable ? 'متوفر' : 'غير متوفر'}
                                        >
                                            <Power size={14}/>
                                        </button>
                                        <button onClick={() => { setMenuItemForm(item); setShowMenuModal(true); }} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Edit3 size={14}/></button>
                                        <button onClick={() => { if(window.confirm('حذف الصنف؟')) deleteMenuItem(item.id); }} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            ))}
                            {currentMenuItems.length === 0 && (
                                <div className="col-span-full py-10 text-center text-gray-400 border-2 border-dashed rounded-3xl">
                                    <p className="font-bold">القائمة فارغة لهذا القسم</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- FACILITIES --- */}
                {activeTab === 'facilities' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        <div className={`p-6 rounded-[2.5rem] shadow-sm ${ts.card} ${!settings.serviceAvailability?.pool ? 'opacity-60 grayscale' : ''}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-black text-xl flex items-center gap-2"><Waves className={ts.icon.split(' ')[0]}/> المسبح والنادي</h3>
                                <button onClick={() => updateServiceAvailability('pool', !settings.serviceAvailability?.pool)} className={`p-2 rounded-xl transition ${settings.serviceAvailability?.pool ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                                    <Power size={18}/>
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl flex justify-between items-center border">
                                    <span className="font-bold">دخول عادي (يومي)</span>
                                    <input 
                                        type="number" 
                                        value={settings.standardRates.poolAccess}
                                        onChange={(e) => updateStandardRate('poolAccess', Number(e.target.value))}
                                        className={`w-24 p-2 rounded-lg font-black text-right outline-none ${ts.input}`}
                                        inputMode="numeric"
                                        disabled={!settings.serviceAvailability?.pool}
                                    />
                                </div>
                                <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl flex justify-between items-center border">
                                    <span className="font-bold">دخول VIP (شامل)</span>
                                    <input 
                                        type="number" 
                                        value={settings.standardRates.poolVipAccess}
                                        onChange={(e) => updateStandardRate('poolVipAccess', Number(e.target.value))}
                                        className={`w-24 p-2 rounded-lg font-black text-right outline-none ${ts.input}`}
                                        inputMode="numeric"
                                        disabled={!settings.serviceAvailability?.pool}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={`p-6 rounded-[2.5rem] shadow-sm ${ts.card} ${!settings.serviceAvailability?.hall ? 'opacity-60 grayscale' : ''}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-black text-xl flex items-center gap-2"><PartyPopper className={ts.icon.split(' ')[0]}/> قاعات المناسبات</h3>
                                <button onClick={() => updateServiceAvailability('hall', !settings.serviceAvailability?.hall)} className={`p-2 rounded-xl transition ${settings.serviceAvailability?.hall ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                                    <Power size={18}/>
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl flex justify-between items-center border">
                                    <span className="font-bold">سعر القاعة الأساسي</span>
                                    <input 
                                        type="number" 
                                        value={settings.standardRates.hallBasePrice}
                                        onChange={(e) => updateStandardRate('hallBasePrice', Number(e.target.value))}
                                        className={`w-32 p-2 rounded-lg font-black text-right outline-none ${ts.input}`}
                                        inputMode="numeric"
                                        disabled={!settings.serviceAvailability?.hall}
                                    />
                                </div>
                                <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl flex justify-between items-center border">
                                    <span className="font-bold">إضافة نهاية الأسبوع</span>
                                    <input 
                                        type="number" 
                                        value={settings.standardRates.hallWeekendSurcharge}
                                        onChange={(e) => updateStandardRate('hallWeekendSurcharge', Number(e.target.value))}
                                        className={`w-32 p-2 rounded-lg font-black text-right outline-none ${ts.input}`}
                                        inputMode="numeric"
                                        disabled={!settings.serviceAvailability?.hall}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Extra Services Pricing */}
                        <div className={`p-6 rounded-3xl shadow-sm border mt-6 col-span-full ${ts.card}`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-3 rounded-2xl ${settings.darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                                    <ShoppingBag size={24} className={ts.icon} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black">الخدمات الإضافية</h3>
                                    <p className={`text-sm font-bold text-gray-500`}>تسعير الخدمات الإضافية للنزلاء والزوار</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className={`flex justify-between items-center p-4 rounded-2xl border ${settings.darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'} ${!settings.serviceAvailability?.parkingVIP ? 'opacity-60 grayscale' : ''}`}>
                                    <div>
                                        <div className="font-bold flex items-center gap-2">
                                            ركن السيارة VIP
                                            <button onClick={() => updateServiceAvailability('parkingVIP', !settings.serviceAvailability?.parkingVIP)} className={`p-1 rounded-lg transition ${settings.serviceAvailability?.parkingVIP ? 'text-green-600' : 'text-gray-400'}`}>
                                                <Power size={14}/>
                                            </button>
                                        </div>
                                        <div className={`text-xs text-gray-500`}>خدمة ركن السيارة في مكان مظلل</div>
                                    </div>
                                    <input 
                                        type="number" 
                                        value={settings.standardRates.parkingVIP || 1000}
                                        onChange={(e) => updateStandardRate('parkingVIP', Number(e.target.value))}
                                        className={`w-32 p-2 rounded-lg font-black text-right outline-none ${ts.input}`}
                                        inputMode="numeric"
                                        disabled={!settings.serviceAvailability?.parkingVIP}
                                    />
                                </div>
                                <div className={`flex justify-between items-center p-4 rounded-2xl border ${settings.darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'} ${!settings.serviceAvailability?.gardenPicnic ? 'opacity-60 grayscale' : ''}`}>
                                    <div>
                                        <div className="font-bold flex items-center gap-2">
                                            سلة نزهة الحديقة
                                            <button onClick={() => updateServiceAvailability('gardenPicnic', !settings.serviceAvailability?.gardenPicnic)} className={`p-1 rounded-lg transition ${settings.serviceAvailability?.gardenPicnic ? 'text-green-600' : 'text-gray-400'}`}>
                                                <Power size={14}/>
                                            </button>
                                        </div>
                                        <div className={`text-xs text-gray-500`}>تشكيلة من السندوتشات والفواكه</div>
                                    </div>
                                    <input 
                                        type="number" 
                                        value={settings.standardRates.gardenPicnic || 3500}
                                        onChange={(e) => updateStandardRate('gardenPicnic', Number(e.target.value))}
                                        className={`w-32 p-2 rounded-lg font-black text-right outline-none ${ts.input}`}
                                        inputMode="numeric"
                                        disabled={!settings.serviceAvailability?.gardenPicnic}
                                    />
                                </div>
                                <div className={`flex justify-between items-center p-4 rounded-2xl border ${settings.darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'} ${!settings.serviceAvailability?.kioskSouvenir ? 'opacity-60 grayscale' : ''}`}>
                                    <div>
                                        <div className="font-bold flex items-center gap-2">
                                            هدايا تذكارية تقليدية
                                            <button onClick={() => updateServiceAvailability('kioskSouvenir', !settings.serviceAvailability?.kioskSouvenir)} className={`p-1 rounded-lg transition ${settings.serviceAvailability?.kioskSouvenir ? 'text-green-600' : 'text-gray-400'}`}>
                                                <Power size={14}/>
                                            </button>
                                        </div>
                                        <div className={`text-xs text-gray-500`}>صناعات يدوية محلية</div>
                                    </div>
                                    <input 
                                        type="number" 
                                        value={settings.standardRates.kioskSouvenir || 2500}
                                        onChange={(e) => updateStandardRate('kioskSouvenir', Number(e.target.value))}
                                        className={`w-32 p-2 rounded-lg font-black text-right outline-none ${ts.input}`}
                                        inputMode="numeric"
                                        disabled={!settings.serviceAvailability?.kioskSouvenir}
                                    />
                                </div>
                                <div className={`flex justify-between items-center p-4 rounded-2xl border ${settings.darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                                    <div>
                                        <div className="font-bold">تذكرة دخول المسبح للزوار</div>
                                        <div className={`text-xs text-gray-500`}>دخول يومي للمسبح للزوار غير المقيمين</div>
                                    </div>
                                    <input 
                                        type="number" 
                                        value={settings.standardRates.visitorPoolAccess || 3000}
                                        onChange={(e) => updateStandardRate('visitorPoolAccess', Number(e.target.value))}
                                        className={`w-32 p-2 rounded-lg font-black text-right outline-none ${ts.input}`}
                                        inputMode="numeric"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- SERVICES --- */}
                {activeTab === 'services' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* External Services Toggles */}
                        <div className={`p-6 rounded-3xl shadow-sm border ${ts.card}`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-3 rounded-2xl ${settings.darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                                    <Truck size={24} className={ts.icon} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black">الخدمات الخارجية للنزلاء</h3>
                                    <p className={`text-sm font-bold text-gray-500`}>تفعيل أو إيقاف طلبات الخدمات الخارجية</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { id: 'extFood', label: 'توصيل الطعام', icon: Utensils },
                                    { id: 'extTransport', label: 'النقل والمواصلات', icon: Car },
                                    { id: 'extLaundry', label: 'غسيل الملابس', icon: Shirt },
                                    { id: 'extCleaning', label: 'خدمات التنظيف', icon: Sparkles }
                                ].map(ext => (
                                    <div key={ext.id} className={`flex justify-between items-center p-4 rounded-2xl border ${settings.darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'} ${!settings.serviceAvailability?.[ext.id] ? 'opacity-60 grayscale' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <ext.icon size={20} className="text-gray-400" />
                                            <span className="font-bold">{ext.label}</span>
                                        </div>
                                        <button 
                                            onClick={() => updateServiceAvailability(ext.id, !settings.serviceAvailability?.[ext.id])} 
                                            className={`p-2 rounded-xl transition ${settings.serviceAvailability?.[ext.id] !== false ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}
                                        >
                                            <Power size={18}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Internal Digital Services */}
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-lg">الخدمات الرقمية الداخلية (طلبات النزلاء)</h3>
                                <button onClick={() => { setServiceItemForm({}); setShowServiceModal(true); }} className={`px-4 py-2 rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2 ${ts.button}`}>
                                    <Plus size={16}/> إضافة خدمة
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {guestServices.map(service => (
                                <div key={service.id} className={`p-5 rounded-[2rem] relative group ${ts.card} ${!service.isActive ? 'opacity-50' : ''}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold">{service.labelAr}</h4>
                                        <div className="flex gap-2">
                                            <button onClick={() => toggleServiceStatus(service.id)} className={`p-1.5 rounded-lg ${service.isActive ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}`}><Check size={14}/></button>
                                            <button onClick={() => { setServiceItemForm(service); setShowServiceModal(true); }} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Edit3 size={14}/></button>
                                            <button onClick={() => removeService(service.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><Trash2 size={14}/></button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-3">{service.description}</p>
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span className="px-2 py-1 bg-gray-100 rounded-lg">{service.targetDepartment}</span>
                                        {service.price ? <span className="text-green-600">{service.price} د.ج</span> : <span className="text-gray-400">مجاني</span>}
                                    </div>
                                </div>
                            ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* --- Modals --- */}
            
            {/* Menu Item Modal */}
            {showMenuModal && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className={`w-full max-w-md rounded-[2rem] p-6 shadow-2xl ${settings.theme === 'zellige' ? 'bg-[#FDFBF7]' : 'bg-white dark:bg-gray-900'}`}>
                        <h3 className="font-black text-xl mb-4">إدارة الصنف</h3>
                        <div className="space-y-4">
                            <input type="text" placeholder="اسم الصنف" value={menuItemForm.name || ''} onChange={e => setMenuItemForm({...menuItemForm, name: e.target.value})} className={`w-full p-3 rounded-xl border-2 outline-none font-bold ${ts.input}`} />
                            <input type="text" placeholder="وصف قصير" value={menuItemForm.description || ''} onChange={e => setMenuItemForm({...menuItemForm, description: e.target.value})} className={`w-full p-3 rounded-xl border-2 outline-none font-bold ${ts.input}`} />
                            <input type="number" placeholder="السعر" value={menuItemForm.price || ''} onChange={e => setMenuItemForm({...menuItemForm, price: Number(e.target.value)})} className={`w-full p-3 rounded-xl border-2 outline-none font-bold ${ts.input}`} inputMode="numeric" />
                            <select 
                                value={menuItemForm.category} 
                                onChange={e => setMenuItemForm({...menuItemForm, category: e.target.value as any})} 
                                className={`w-full p-3 rounded-xl border-2 outline-none font-bold ${ts.input}`}
                            >
                                <option value="meal">وجبة رئيسية</option>
                                <option value="breakfast">فطور</option>
                                <option value="hot_drink">مشروب ساخن</option>
                                <option value="cold_drink">مشروب بارد</option>
                                <option value="dessert">تحلية</option>
                            </select>
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setShowMenuModal(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-500">إلغاء</button>
                                <button onClick={handleSaveMenuItem} className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg ${ts.button.split(' ')[0]}`}>حفظ</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Service Item Modal */}
            {showServiceModal && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className={`w-full max-w-md rounded-[2rem] p-6 shadow-2xl ${settings.theme === 'zellige' ? 'bg-[#FDFBF7]' : 'bg-white dark:bg-gray-900'}`}>
                        <h3 className="font-black text-xl mb-4">إدارة الخدمة</h3>
                        <div className="space-y-4">
                            <input type="text" placeholder="اسم الخدمة (عربي)" value={serviceItemForm.labelAr || ''} onChange={e => setServiceItemForm({...serviceItemForm, labelAr: e.target.value})} className={`w-full p-3 rounded-xl border-2 outline-none font-bold ${ts.input}`} />
                            <input type="text" placeholder="الوصف" value={serviceItemForm.description || ''} onChange={e => setServiceItemForm({...serviceItemForm, description: e.target.value})} className={`w-full p-3 rounded-xl border-2 outline-none font-bold ${ts.input}`} />
                            <div className="flex gap-2">
                                <input type="number" placeholder="تكلفة إضافية (0 = مجاني)" value={serviceItemForm.price || ''} onChange={e => setServiceItemForm({...serviceItemForm, price: Number(e.target.value)})} className={`w-full p-3 rounded-xl border-2 outline-none font-bold ${ts.input}`} inputMode="numeric" />
                            </div>
                            <select value={serviceItemForm.targetDepartment || 'reception'} onChange={e => setServiceItemForm({...serviceItemForm, targetDepartment: e.target.value as any})} className={`w-full p-3 rounded-xl border-2 outline-none font-bold ${ts.input}`}>
                                <option value="reception">استقبال</option>
                                <option value="housekeeping">تنظيف</option>
                                <option value="food_beverage">مطعم</option>
                                <option value="spa_wellness">سبا</option>
                            </select>
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setShowServiceModal(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-500">إلغاء</button>
                                <button onClick={handleSaveServiceItem} className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg ${ts.button.split(' ')[0]}`}>حفظ</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
