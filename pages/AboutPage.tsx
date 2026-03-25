
import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { 
  Building2, Star, Calendar, User, FileText, Globe, Mail, MapPin, Award, Edit, Save, X, Hexagon, Trophy, Quote
} from 'lucide-react';
import { HotelIdentity } from '../types';

export const AboutPage: React.FC = () => {
  const { settings, updateSettings, currentUser } = useHotel();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<HotelIdentity>(settings.hotelIdentity);

  // Permission Check
  const canEdit = currentUser?.role === 'manager';

  // --- Theme Styles ---
  const isZellige = settings.theme === 'zellige' || settings.theme === 'zellige-v2';
  const themeColors = {
      card: isZellige ? 'bg-[#FDFBF7] border-[3px] border-[#cca43b]' : 'bg-white border-2 border-gray-100',
      headerBg: settings.theme === 'zellige' ? 'bg-[#006269]' : 'bg-blue-900',
      accentText: settings.theme === 'zellige' ? 'text-[#006269]' : 'text-blue-900',
      goldText: settings.theme === 'zellige' ? 'text-[#cca43b]' : 'text-yellow-500',
      subText: isZellige ? 'text-gray-600' : 'text-gray-500',
      pattern: settings.theme === 'zellige' ? 'bg-zellige-pattern' : settings.theme === 'zellige-v2' ? 'bg-zellige-v2-pattern' : '',
      button: settings.theme === 'zellige' ? 'bg-[#006269] text-[#cca43b]' : 'bg-blue-600 text-white',
      input: isZellige ? 'border-[#cca43b]/40 focus:border-[#006269] bg-[#fbf8f1] text-[#006269]' : 'border-gray-300 focus:border-blue-500 bg-white',
  };

  const handleSave = () => {
      updateSettings({ hotelIdentity: formData });
      setIsEditing(false);
  };

  // Render Stars
  const renderStars = (count: number) => {
      return Array(count).fill(0).map((_, i) => (
          <Star key={i} size={20} fill="currentColor" className={`${themeColors.goldText} drop-shadow-sm`} />
      ));
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* --- HOTEL IDENTITY CARD (The "Plaque") --- */}
      <div className={`relative rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-500 group mx-auto max-w-4xl ${themeColors.card}`}>
        
        {/* Pattern Overlay */}
        {isZellige && (
            <div className={`absolute inset-0 opacity-10 pointer-events-none ${themeColors.pattern} mix-blend-multiply`}></div>
        )}

        {/* Decorative Corners (Zellige) */}
        {isZellige && (
            <>
                <div className="absolute top-6 left-6 w-24 h-24 border-t-4 border-l-4 border-[#cca43b] opacity-40 rounded-tl-3xl"></div>
                <div className="absolute top-6 right-6 w-24 h-24 border-t-4 border-r-4 border-[#cca43b] opacity-40 rounded-tr-3xl"></div>
                <div className="absolute bottom-6 left-6 w-24 h-24 border-b-4 border-l-4 border-[#cca43b] opacity-40 rounded-bl-3xl"></div>
                <div className="absolute bottom-6 right-6 w-24 h-24 border-b-4 border-r-4 border-[#cca43b] opacity-40 rounded-br-3xl"></div>
            </>
        )}

        <div className="relative z-10 p-8 md:p-12 text-center">
            
            {/* Classification & Rank */}
            <div className="flex justify-center items-center gap-3 mb-6">
                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${isZellige ? 'bg-[#006269]/10 text-[#006269] border-[#006269]/20' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {settings.hotelIdentity.classificationType} Hotel
                </span>
                {settings.hotelIdentity.globalRank && (
                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                        <Trophy size={12} /> {settings.hotelIdentity.globalRank}
                    </span>
                )}
            </div>

            {/* Main Hotel Name */}
            <h1 className={`text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight ${themeColors.accentText}`}>
                {settings.appName}
            </h1>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-8 animate-pulse">
                {renderStars(settings.hotelIdentity.stars)}
            </div>

            {/* Bio / Description */}
            <div className="max-w-2xl mx-auto mb-10 relative">
                <Quote size={32} className={`absolute -top-4 -right-4 opacity-20 ${themeColors.goldText}`} />
                <p className={`text-lg font-medium leading-relaxed ${themeColors.subText}`}>
                    {settings.hotelIdentity.bio}
                </p>
                <Quote size={32} className={`absolute -bottom-4 -left-4 opacity-20 transform rotate-180 ${themeColors.goldText}`} />
            </div>

            {/* Identity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-10">
                <div className={`p-4 rounded-2xl border ${isZellige ? 'bg-[#fbf8f1] border-[#cca43b]/20' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex flex-col items-center gap-2">
                        <Calendar size={20} className={themeColors.goldText} />
                        <span className="text-xs font-bold opacity-50 uppercase">تاريخ الافتتاح</span>
                        <span className={`font-black ${themeColors.accentText}`}>{new Date(settings.hotelIdentity.openingDate).toLocaleDateString('ar-SA')}</span>
                    </div>
                </div>
                <div className={`p-4 rounded-2xl border ${isZellige ? 'bg-[#fbf8f1] border-[#cca43b]/20' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex flex-col items-center gap-2">
                        <FileText size={20} className={themeColors.goldText} />
                        <span className="text-xs font-bold opacity-50 uppercase">السجل التجاري</span>
                        <span className={`font-black font-mono ${themeColors.accentText}`}>{settings.hotelIdentity.crNumber}</span>
                    </div>
                </div>
                <div className={`p-4 rounded-2xl border ${isZellige ? 'bg-[#fbf8f1] border-[#cca43b]/20' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex flex-col items-center gap-2">
                        <User size={20} className={themeColors.goldText} />
                        <span className="text-xs font-bold opacity-50 uppercase">الإدارة العامة</span>
                        <span className={`font-black ${themeColors.accentText}`}>{settings.hotelIdentity.managerName}</span>
                    </div>
                </div>
            </div>

            {/* Footer / Contact */}
            <div className="flex flex-wrap justify-center gap-6 opacity-70 text-sm font-bold border-t pt-6 border-current/10">
                {settings.hotelIdentity.website && <span className="flex items-center gap-2"><Globe size={14}/> {settings.hotelIdentity.website}</span>}
                {settings.hotelIdentity.email && <span className="flex items-center gap-2"><Mail size={14}/> {settings.hotelIdentity.email}</span>}
                <span className="flex items-center gap-2"><MapPin size={14}/> {settings.hotelAddress}</span>
            </div>

            {/* EDIT BUTTON (Manager Only) */}
            {canEdit && (
                <button 
                    onClick={() => setIsEditing(true)}
                    className={`absolute top-6 left-6 p-3 rounded-full shadow-lg transition transform hover:scale-110 active:scale-95 z-20 ${themeColors.button}`}
                    title="تعديل بيانات الفندق"
                >
                    <Edit size={20} />
                </button>
            )}
        </div>
      </div>

      {/* --- EDIT MODAL --- */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
            <div className={`w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] ${isZellige ? 'bg-[#FDFBF7]' : 'bg-white'}`}>
                
                {/* Header */}
                <div className={`p-6 flex justify-between items-center ${themeColors.headerBg} text-white shadow-md relative z-10`}>
                    <div className="flex items-center gap-3">
                        <Award size={24} />
                        <div>
                            <h3 className="text-xl font-black">تعديل هوية الفندق</h3>
                            <p className="text-xs opacity-80">تحديث المعلومات الأساسية والتصنيف</p>
                        </div>
                    </div>
                    <button onClick={() => setIsEditing(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition"><X size={20}/></button>
                </div>

                {/* Form */}
                <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold mb-2 opacity-70">تصنيف الفندق (Stars)</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5, 6, 7].map(s => (
                                    <button 
                                        key={s} 
                                        onClick={() => setFormData({...formData, stars: s})}
                                        className={`flex-1 py-3 rounded-xl font-black text-sm border-2 transition ${formData.stars === s ? 'bg-yellow-400 border-yellow-500 text-white shadow-md' : 'bg-white border-gray-200 text-gray-400'}`}
                                    >
                                        {s}★
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-2 opacity-70">نوع المنشأة</label>
                            <select 
                                className={`w-full p-3 rounded-xl border-2 outline-none font-bold ${themeColors.input}`}
                                value={formData.classificationType}
                                onChange={e => setFormData({...formData, classificationType: e.target.value as any})}
                            >
                                <option value="Business">Business Hotel</option>
                                <option value="Resort">Luxury Resort</option>
                                <option value="Boutique">Boutique Hotel</option>
                                <option value="Hostel">City Hostel</option>
                                <option value="Luxury">Ultra Luxury</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold mb-2 opacity-70">تاريخ الافتتاح</label>
                            <input type="date" value={formData.openingDate} onChange={e => setFormData({...formData, openingDate: e.target.value})} className={`w-full p-3 rounded-xl border-2 outline-none font-bold ${themeColors.input}`} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-2 opacity-70">رقم السجل التجاري (RC)</label>
                            <input type="text" value={formData.crNumber} onChange={e => setFormData({...formData, crNumber: e.target.value})} className={`w-full p-3 rounded-xl border-2 outline-none font-bold font-mono uppercase ${themeColors.input}`} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold mb-2 opacity-70">اسم المدير العام</label>
                            <input type="text" value={formData.managerName} onChange={e => setFormData({...formData, managerName: e.target.value})} className={`w-full p-3 rounded-xl border-2 outline-none font-bold ${themeColors.input}`} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-2 opacity-70">الترتيب العالمي/المحلي (اختياري)</label>
                            <input type="text" value={formData.globalRank || ''} onChange={e => setFormData({...formData, globalRank: e.target.value})} className={`w-full p-3 rounded-xl border-2 outline-none font-bold ${themeColors.input}`} placeholder="#1 in Region" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold mb-2 opacity-70">نبذة تعريفية (Bio)</label>
                        <textarea 
                            className={`w-full p-3 rounded-xl border-2 outline-none font-bold h-24 resize-none ${themeColors.input}`} 
                            value={formData.bio} 
                            onChange={e => setFormData({...formData, bio: e.target.value})} 
                            placeholder="وصف مختصر للفندق..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold mb-2 opacity-70">الموقع الإلكتروني</label>
                            <input type="text" value={formData.website || ''} onChange={e => setFormData({...formData, website: e.target.value})} className={`w-full p-3 rounded-xl border-2 outline-none font-bold ${themeColors.input}`} dir="ltr" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-2 opacity-70">البريد الإلكتروني</label>
                            <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className={`w-full p-3 rounded-xl border-2 outline-none font-bold ${themeColors.input}`} dir="ltr" />
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-white z-10">
                    <button onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition">إلغاء</button>
                    <button onClick={handleSave} className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition transform hover:-translate-y-1 ${themeColors.button}`}>
                        <Save size={18} /> حفظ التغييرات
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Footer Info (Version) */}
      <div className="text-center py-4 opacity-40 text-xs font-mono">
          System v2.1 • Licensed to {settings.appName}
      </div>

    </div>
  );
};
