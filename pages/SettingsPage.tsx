
import React, { useState, useRef } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { Settings, Save, Moon, Sun, Type, Palette, Wifi, Server, Globe, Key, Printer, Monitor, Shield, ExternalLink, Network, LayoutGrid, Database, Upload, Download, AlertTriangle } from 'lucide-react';
import { AppTheme } from '../types';
import { downloadBackup, importDatabase } from '../utils/backup';
import { getThemeStyles } from '../utils/themeStyles';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, toggleDarkMode, addNotification, updateRoomCount } = useHotel();
  const ts = getThemeStyles(settings);
  const [formData, setFormData] = useState(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'data' | 'integrations'>('general');

  const handleBackup = async () => {
      await downloadBackup();
      addNotification('تم تحميل النسخة الاحتياطية بنجاح', "success");
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!window.confirm('تحذير: استعادة النسخة الاحتياطية ستقوم بحذف جميع البيانات الحالية واستبدالها. هل أنت متأكد؟')) {
          return;
      }

      const success = await importDatabase(file);
      if (success) {
          addNotification('تمت استعادة البيانات بنجاح. سيتم إعادة تحميل التطبيق.', "success");
          setTimeout(() => window.location.reload(), 1500);
      } else {
          addNotification('فشل في استعادة البيانات. تأكد من صحة الملف.', "error");
      }
  };

  const handleSave = () => {
      if (formData.totalRooms !== settings.totalRooms) {
          updateRoomCount(formData.totalRooms);
      }
      updateSettings(formData);
      addNotification('تم حفظ الإعدادات بنجاح', "success");
  };

  const themes: { id: AppTheme; label: string; color: string; isAuthentic?: boolean }[] = [
      { id: 'zellige', label: 'زليج جزائري أصيل', color: '#006269', isAuthentic: true },
      { id: 'zellige-v2', label: 'زليج أخضر', color: '#024d38' },
      { id: 'zellige-algiers', label: 'زليج البهجة', color: '#1e3a8a' },
      { id: 'default', label: 'عصري', color: '#2563eb' },
  ];

  const tabs = [
      { id: 'general', label: 'الإعدادات العامة', icon: Settings },
      { id: 'appearance', label: 'المظهر والسمات', icon: Palette },
      { id: 'data', label: 'البيانات والمزامنة', icon: Database },
      { id: 'integrations', label: 'الربط والأنظمة', icon: Network },
  ];

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
        <PageHeader pageKey="settings" defaultTitle="إعدادات النظام" icon={Settings} />

        {/* Tabs Navigation */}
        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
                        activeTab === tab.id 
                        ? (settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b] text-[#002a2d]' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20')
                        : (settings.darkMode && settings.theme === 'zellige' ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-white text-gray-500 hover:bg-gray-50')
                    }`}
                >
                    <tab.icon size={18} />
                    {tab.label}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-1 gap-6">
            
            {activeTab === 'general' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
                    {/* System Administration */}
                    <div className={`p-6 rounded-[2.5rem] shadow-sm ${ts.card} lg:col-span-2`}>
                        <h3 className="font-black text-lg mb-6 flex items-center gap-2"><Shield size={20}/> إدارة النظام والصلاحيات</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button onClick={() => window.dispatchEvent(new CustomEvent('navigate-to', { detail: 'permissions' }))} className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition hover:scale-[1.02] ${ts.activeItem}`}>
                                <div className="p-3 bg-white/20 rounded-xl"><Key size={24}/></div>
                                <div className="text-right">
                                    <h4 className="font-bold text-sm">صلاحيات الموظفين</h4>
                                    <p className="text-[10px] opacity-70">تحديد الأدوار والوصول</p>
                                </div>
                            </button>
                            <button onClick={() => window.dispatchEvent(new CustomEvent('navigate-to', { detail: 'venues' }))} className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition hover:scale-[1.02] ${ts.activeItem}`}>
                                <div className="p-3 bg-white/20 rounded-xl"><LayoutGrid size={24}/></div>
                                <div className="text-right">
                                    <h4 className="font-bold text-sm">إدارة الصالات والطاولات</h4>
                                    <p className="text-[10px] opacity-70">تخطيط المطعم والقاعات</p>
                                </div>
                            </button>
                            <button onClick={() => window.dispatchEvent(new CustomEvent('navigate-to', { detail: 'print_settings' }))} className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition hover:scale-[1.02] ${ts.activeItem}`}>
                                <div className="p-3 bg-white/20 rounded-xl"><Printer size={24}/></div>
                                <div className="text-right">
                                    <h4 className="font-bold text-sm">استوديو الطباعة</h4>
                                    <p className="text-[10px] opacity-70">تخصيص البطاقات والفواتير</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Room Configuration */}
                    <div className={`p-6 rounded-[2.5rem] shadow-sm ${ts.card} lg:col-span-2`}>
                        <h3 className="font-black text-lg mb-6 flex items-center gap-2"><LayoutGrid size={20}/> إعدادات الغرف والمباني</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Room Numbering Config */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold opacity-80 border-b pb-2">تكوين الترقيم</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold mb-2 opacity-70">إجمالي الغرف</label>
                                        <input 
                                            type="number" 
                                            className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.input}`} 
                                            value={formData.totalRooms} 
                                            onChange={e => setFormData({...formData, totalRooms: parseInt(e.target.value) || 0})} 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold mb-2 opacity-70">رقم البداية</label>
                                        <input 
                                            type="number" 
                                            className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.input}`} 
                                            value={formData.roomConfig?.startingNumber || 101} 
                                            onChange={e => setFormData({...formData, roomConfig: { ...formData.roomConfig, startingNumber: parseInt(e.target.value) || 101 }})} 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold mb-2 opacity-70">بادئة الغرفة (مثال: A-)</label>
                                        <input 
                                            type="text" 
                                            className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.input}`} 
                                            value={formData.roomConfig?.prefix || ''} 
                                            onChange={e => setFormData({...formData, roomConfig: { ...formData.roomConfig, prefix: e.target.value }})} 
                                            dir="ltr"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold mb-2 opacity-70">عدد الطوابق</label>
                                        <input 
                                            type="number" 
                                            className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.input}`} 
                                            value={formData.roomConfig?.floorCount || 1} 
                                            onChange={e => setFormData({...formData, roomConfig: { ...formData.roomConfig, floorCount: parseInt(e.target.value) || 1 }})} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Building Management */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold opacity-80 border-b pb-2 flex justify-between items-center">
                                    <span>إدارة المباني والفروع</span>
                                    <button 
                                        onClick={() => {
                                            const newBuilding = { id: `b-${Date.now()}`, name: 'مبنى جديد', address: '', roomCount: 0, isActive: true };
                                            setFormData({ ...formData, buildings: [...(formData.buildings || []), newBuilding] });
                                        }}
                                        className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded-lg hover:bg-blue-500/20 transition"
                                    >
                                        + إضافة مبنى
                                    </button>
                                </h4>
                                
                                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                    {(formData.buildings || []).map((building, index) => (
                                        <div key={building.id} className={`p-3 rounded-xl border flex flex-col gap-2 ${ts.itemBg}`}>
                                            <div className="flex justify-between items-start">
                                                <input 
                                                    type="text" 
                                                    value={building.name}
                                                    onChange={(e) => {
                                                        const newBuildings = [...(formData.buildings || [])];
                                                        newBuildings[index] = { ...building, name: e.target.value };
                                                        setFormData({ ...formData, buildings: newBuildings });
                                                    }}
                                                    className="bg-transparent font-bold text-sm outline-none w-full"
                                                    placeholder="اسم المبنى"
                                                />
                                                <button 
                                                    onClick={() => {
                                                        const newBuildings = (formData.buildings || []).filter(b => b.id !== building.id);
                                                        setFormData({ ...formData, buildings: newBuildings });
                                                    }}
                                                    className="text-red-400 hover:text-red-500"
                                                >
                                                    <AlertTriangle size={14} />
                                                </button>
                                            </div>
                                            <input 
                                                type="text" 
                                                value={building.address}
                                                onChange={(e) => {
                                                    const newBuildings = [...(formData.buildings || [])];
                                                    newBuildings[index] = { ...building, address: e.target.value };
                                                    setFormData({ ...formData, buildings: newBuildings });
                                                }}
                                                className="bg-transparent text-xs opacity-70 outline-none w-full"
                                                placeholder="العنوان"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hotel Info */}
                    <div className={`p-6 rounded-[2.5rem] shadow-sm ${ts.card} lg:col-span-2`}>
                        <h3 className="font-black text-lg mb-6 flex items-center gap-2"><Type size={20}/> معلومات الفندق</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold mb-2 opacity-70">اسم الفندق</label>
                                <input type="text" className={`w-full p-4 rounded-2xl border-2 font-bold outline-none ${ts.input}`} value={formData.appName} onChange={e => setFormData({...formData, appName: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-2 opacity-70">العنوان</label>
                                <input type="text" className={`w-full p-4 rounded-2xl border-2 font-bold outline-none ${ts.input}`} value={formData.hotelAddress} onChange={e => setFormData({...formData, hotelAddress: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-2 opacity-70">الهاتف</label>
                                <input type="text" className={`w-full p-4 rounded-2xl border-2 font-bold outline-none ${ts.input}`} value={formData.hotelPhone} onChange={e => setFormData({...formData, hotelPhone: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-2 opacity-70">رقم الواتساب</label>
                                <input type="text" className={`w-full p-4 rounded-2xl border-2 font-bold outline-none ${ts.input}`} value={formData.whatsappNumber || ''} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'appearance' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
                    <div className={`p-6 rounded-[2.5rem] shadow-sm ${ts.card}`}>
                        <h3 className="font-black text-lg mb-6 flex items-center gap-2"><Sun size={20}/> الوضع والسمات</h3>
                        <div className="mb-6">
                            <label className="block text-xs font-bold mb-3 opacity-70">الوضع الليلي</label>
                            <button onClick={toggleDarkMode} className={`flex items-center gap-3 p-3 rounded-2xl w-full transition ${ts.itemBg}`}>
                                {settings.darkMode ? <Moon size={20}/> : <Sun size={20}/>}
                                <span className="font-bold text-sm">{settings.darkMode ? 'مفعل (داكن)' : 'معطل (فاتح)'}</span>
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold mb-3 opacity-70">السمة اللونية (Theme)</label>
                            <div className="grid grid-cols-2 gap-3">
                                {themes.map(theme => (
                                    <button 
                                        key={theme.id}
                                        onClick={() => setFormData({...formData, theme: theme.id})}
                                        className={`p-3 rounded-xl border-2 text-right transition flex items-center justify-between relative ${formData.theme === theme.id ? ts.activeItem : ts.itemBg} ${theme.isAuthentic ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold">{theme.label}</span>
                                            {theme.isAuthentic && <span className="text-[8px] text-amber-600 font-black uppercase tracking-tighter">الأصيل الجزائري</span>}
                                        </div>
                                        <div className="w-4 h-4 rounded-full shadow-inner" style={{backgroundColor: theme.color}}></div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={`p-6 rounded-[2.5rem] shadow-sm ${ts.card}`}>
                        <h3 className="font-black text-lg mb-6 flex items-center gap-2"><Monitor size={20}/> إعدادات العرض</h3>
                        <div>
                            <label className="block text-xs font-bold mb-3 opacity-70">كثافة العرض</label>
                            <div className="flex gap-2">
                                {['compact', 'comfortable', 'spacious'].map((d: any) => (
                                    <button 
                                        key={d}
                                        onClick={() => setFormData({...formData, gridDensity: d})}
                                        className={`flex-1 py-4 rounded-2xl text-xs font-bold capitalize transition border-2 ${formData.gridDensity === d ? ts.activeItem : ts.itemBg}`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'data' && (
                <div className="grid grid-cols-1 gap-6 animate-slide-up">
                    {/* Adaptive Storage Explanation */}
                    <div className={`p-8 rounded-[2.5rem] shadow-sm border-2 ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] border-[#cca43b]/20' : 'bg-blue-50 border-blue-100'}`}>
                        <div className="flex items-start gap-4">
                            <div className={`p-4 rounded-2xl ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/20 text-[#cca43b]' : 'bg-blue-600 text-white'}`}>
                                <Database size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black mb-2">نظام الحفظ المتكيف (Adaptive Storage)</h3>
                                <p className="text-sm opacity-80 leading-relaxed mb-4">
                                    يعمل تطبيق "نزل" بنظام هجين يجمع بين سرعة العمل المحلي وأمان السحابة العالمية.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-current/10">
                                        <h4 className="font-bold text-sm mb-1 flex items-center gap-2"><Monitor size={14}/> الحفظ المحلي (Offline First)</h4>
                                        <p className="text-[10px] opacity-70">يتم حفظ كافة البيانات فوراً في ذاكرة المتصفح (IndexedDB) لضمان العمل بدون إنترنت وبسرعة فائقة.</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-current/10">
                                        <h4 className="font-bold text-sm mb-1 flex items-center gap-2"><Globe size={14}/> المزامنة العالمية (Cloud Sync)</h4>
                                        <p className="text-[10px] opacity-70">عند توفر الإنترنت، يتم مزامنة البيانات تلقائياً مع قاعدة بيانات Firebase العالمية لضمان الوصول من أي جهاز.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Backup & Restore */}
                    <div className={`p-8 rounded-[2.5rem] shadow-sm ${ts.card}`}>
                        <h3 className="font-black text-lg mb-6 flex items-center gap-2"><Download size={20}/> النسخ الاحتياطي اليدوي (Excel)</h3>
                        <p className="text-sm opacity-60 mb-8">
                            يمكنك تصدير كافة بيانات الفندق إلى ملف Excel كنسخة احتياطية إضافية أو لنقلها يدوياً. يتم حفظ البيانات المعقدة بصيغة JSON داخل الخلايا لضمان الدقة.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className={`p-6 rounded-3xl border-2 border-dashed flex flex-col items-center text-center gap-4 ${ts.itemBg}`}>
                                <div className="p-4 bg-green-500/10 text-green-500 rounded-full">
                                    <Download size={32} />
                                </div>
                                <div>
                                    <h4 className="font-bold mb-1">تصدير نسخة احتياطية</h4>
                                    <p className="text-[10px] opacity-60">تحميل ملف Excel يحتوي على كافة السجلات</p>
                                </div>
                                <button onClick={handleBackup} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-600/20">
                                    حفظ نسخة كاملة (Excel)
                                </button>
                            </div>

                            <div className={`p-6 rounded-3xl border-2 border-dashed flex flex-col items-center text-center gap-4 ${ts.itemBg}`}>
                                <div className="p-4 bg-orange-500/10 text-orange-500 rounded-full">
                                    <Upload size={32} />
                                </div>
                                <div>
                                    <h4 className="font-bold mb-1">استعادة نسخة احتياطية</h4>
                                    <p className="text-[10px] opacity-60">رفع ملف Excel لاستبدال البيانات الحالية</p>
                                </div>
                                <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-600/20">
                                    استعادة من ملف احتياطي
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleRestore} accept=".xlsx" className="hidden" />
                            </div>
                        </div>
                    </div>

                    {/* Database Settings Link */}
                    <div className={`p-6 rounded-[2.5rem] shadow-sm ${ts.card} flex items-center justify-between`}>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                                <Database size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">إعدادات قاعدة البيانات المستقلة</h4>
                                <p className="text-[10px] opacity-60">ربط الفندق بمشروع Firebase الخاص بك</p>
                            </div>
                        </div>
                        <button onClick={() => window.dispatchEvent(new CustomEvent('navigate-to', { detail: 'database_settings' }))} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition">
                            إدارة الربط
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'integrations' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
                    {/* 1. Network & Connectivity */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold flex items-center gap-2 opacity-80"><Wifi size={16}/> إعدادات الشبكة (Wi-Fi)</h4>
                        <div className={`p-5 rounded-2xl border ${ts.card}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold mb-1 opacity-70">اسم شبكة النزلاء (SSID)</label>
                                    <input 
                                        type="text" 
                                        className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.input}`}
                                        value={formData.systemIntegrations?.guestWifiSsid || ''}
                                        onChange={e => setFormData({...formData, systemIntegrations: { ...formData.systemIntegrations, guestWifiSsid: e.target.value }})}
                                        dir="ltr"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 opacity-70">كلمة المرور</label>
                                    <input 
                                        type="text" 
                                        className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.input}`}
                                        value={formData.systemIntegrations?.guestWifiPass || ''}
                                        onChange={e => setFormData({...formData, systemIntegrations: { ...formData.systemIntegrations, guestWifiPass: e.target.value }})}
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Hardware & Devices */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold flex items-center gap-2 opacity-80"><Server size={16}/> الأجهزة والعتاد (Hardware)</h4>
                        <div className={`p-5 rounded-2xl border ${ts.card}`}>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold mb-1 opacity-70 flex items-center gap-2"><Printer size={12}/> طابعة الشبكة (IP)</label>
                                    <input 
                                        type="text" 
                                        placeholder="192.168.1.200"
                                        className={`w-full p-3 rounded-xl border-2 font-mono font-bold outline-none ${ts.input}`}
                                        value={formData.systemIntegrations?.printerIp || ''}
                                        onChange={e => setFormData({...formData, systemIntegrations: { ...formData.systemIntegrations, printerIp: e.target.value }})}
                                        dir="ltr"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-2">
                                    <label className="text-xs font-bold opacity-70 flex items-center gap-2"><Monitor size={12}/> وضع الكشك (Kiosk Mode)</label>
                                    <input 
                                        type="checkbox"
                                        checked={formData.systemIntegrations?.kioskMode || false}
                                        onChange={e => setFormData({...formData, systemIntegrations: { ...formData.systemIntegrations, kioskMode: e.target.checked }})}
                                        className="w-5 h-5 rounded accent-blue-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. External Integrations */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold flex items-center gap-2 opacity-80"><Globe size={16}/> أنظمة الحجز (OTA)</h4>
                        <div className={`p-5 rounded-2xl border ${ts.card}`}>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold mb-1 opacity-70">محرك الحجز (Booking Engine)</label>
                                    <input 
                                        type="text" 
                                        className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.input}`}
                                        value={formData.systemIntegrations?.bookingEngineUrl || ''}
                                        onChange={e => setFormData({...formData, systemIntegrations: { ...formData.systemIntegrations, bookingEngineUrl: e.target.value }})}
                                        dir="ltr"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 opacity-70">إدارة القنوات (Channel Manager)</label>
                                    <input 
                                        type="text" 
                                        className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.input}`}
                                        value={formData.systemIntegrations?.otaManagerUrl || ''}
                                        onChange={e => setFormData({...formData, systemIntegrations: { ...formData.systemIntegrations, otaManagerUrl: e.target.value }})}
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Government & Compliance */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold flex items-center gap-2 opacity-80"><Shield size={16}/> البوابات الحكومية والرسمية</h4>
                        <div className={`p-5 rounded-2xl border ${ts.card}`}>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold mb-1 opacity-70 flex items-center gap-1">بوابة الشرطة <ExternalLink size={10}/></label>
                                    <input 
                                        type="text" 
                                        className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.input}`}
                                        value={formData.systemIntegrations?.policePortalUrl || ''}
                                        onChange={e => setFormData({...formData, systemIntegrations: { ...formData.systemIntegrations, policePortalUrl: e.target.value }})}
                                        dir="ltr"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 opacity-70 flex items-center gap-1">وزارة السياحة <ExternalLink size={10}/></label>
                                    <input 
                                        type="text" 
                                        className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.input}`}
                                        value={formData.systemIntegrations?.tourismPortalUrl || ''}
                                        onChange={e => setFormData({...formData, systemIntegrations: { ...formData.systemIntegrations, tourismPortalUrl: e.target.value }})}
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div className="flex justify-end pt-4">
            <button onClick={handleSave} className={`px-10 py-4 rounded-2xl font-black shadow-xl flex items-center gap-3 transition transform hover:-translate-y-1 ${ts.button}`}>
                <Save size={20}/> حفظ كافة التغييرات
            </button>
        </div>
    </div>
  );
};
