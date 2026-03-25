
import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { Smartphone, Plus, Check, X, Bell, Coffee, Car, Shirt, Sparkles, Utensils, Wifi, Edit } from 'lucide-react';
import { ServiceItem } from '../types';

export const ServiceManagerPage: React.FC = () => {
  const { guestServices, addNewService, toggleServiceStatus, removeService, settings, addNotification } = useHotel();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState<Partial<ServiceItem>>({
      icon: 'Bell',
      labelAr: '',
      labelEn: '',
      description: '',
      targetDepartment: 'reception',
      allowedLocations: ['all'],
      isActive: true
  });

  const getThemeStyles = () => {
      if (settings.darkMode) {
          if (settings.theme === 'zellige') {
              return {
                  button: 'bg-[#cca43b] text-[#001e21] hover:bg-[#b08d30]',
                  card: 'bg-[#002a2d] border border-[#cca43b]/40 text-[#f0c04a]',
                  modalBg: 'bg-[#001e21] border border-[#cca43b]/30',
                  modalHeader: 'bg-[#002a2d] text-[#f0c04a] border-b border-[#cca43b]/20',
                  modalInput: 'border-[#cca43b]/40 focus:border-[#f0c04a] bg-[#001012] text-[#f0c04a] placeholder-[#cca43b]/30'
              };
          }
      }
      switch (settings.theme) {
          case 'zellige': return {
              button: 'bg-[#006269] text-[#cca43b] hover:bg-[#004d53]',
              card: 'bg-[#FDFBF7] border border-[#cca43b]/40 text-[#006269]',
              modalBg: 'bg-[#FDFBF7] border border-[#cca43b]/30',
              modalHeader: 'bg-[#006269] text-[#cca43b]',
              modalInput: 'border-[#cca43b]/40 focus:border-[#006269] bg-[#fbf8f1] text-[#006269] placeholder-[#006269]/40'
          };
          default: return {
              button: 'bg-indigo-600 text-white hover:bg-indigo-700',
              card: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
              modalBg: 'bg-white dark:bg-gray-900',
              modalHeader: 'bg-slate-900 text-white',
              modalInput: 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
          };
      }
  };
  const ts = getThemeStyles();

  const getIconComponent = (name: string) => {
      const icons: any = { Bell, Coffee, Car, Shirt, Sparkles, Utensils, Wifi };
      const Icon = icons[name] || Bell;
      return <Icon size={24} />;
  };

  const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      if (newService.labelAr && newService.targetDepartment) {
          addNewService(newService as any);
          setShowAddModal(false);
      }
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
        <PageHeader pageKey="services" defaultTitle="مدير الخدمات الرقمية" icon={Smartphone} />

        <div className="flex justify-end mb-6">
            <button onClick={() => setShowAddModal(true)} className={`px-6 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2 transition ${ts.button}`}>
                <Plus size={20} /> خدمة جديدة
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guestServices.map(service => (
                <div key={service.id} className={`p-6 rounded-[2rem] shadow-sm relative overflow-hidden group ${ts.card} ${!service.isActive ? 'opacity-60 grayscale' : ''}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-gray-100 rounded-2xl text-gray-600">
                            {getIconComponent(service.icon)}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => toggleServiceStatus(service.id)} className={`p-2 rounded-xl transition ${service.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                                <Check size={16}/>
                            </button>
                            <button onClick={() => { if(window.confirm('حذف الخدمة؟')) removeService(service.id) }} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100">
                                <X size={16}/>
                            </button>
                        </div>
                    </div>
                    <h3 className="font-bold text-lg mb-1">{service.labelAr}</h3>
                    <p className="text-xs text-gray-500 mb-4">{service.description}</p>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-600">{service.targetDepartment}</span>
                    </div>
                </div>
            ))}
        </div>

        {showAddModal && (
            <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                <div className={`w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden ${ts.modalBg}`}>
                    <div className={`p-6 flex justify-between items-center ${ts.modalHeader}`}>
                        <h3 className="text-xl font-black">إضافة خدمة جديدة</h3>
                        <button onClick={() => setShowAddModal(false)} className="text-white hover:bg-white/20 p-2 rounded-full"><X size={24}/></button>
                    </div>
                    
                    <form onSubmit={handleAdd} className="p-8 space-y-4 mb-20 overflow-y-auto max-h-[70vh]">
                        <div>
                            <label className="block text-xs font-bold mb-2">اسم الخدمة (عربي)</label>
                            <input required type="text" className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.modalInput}`} value={newService.labelAr} onChange={e => setNewService({...newService, labelAr: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-2">الوصف</label>
                            <input required type="text" className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.modalInput}`} value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-2">الأيقونة</label>
                            <div className="flex gap-2">
                                {['Bell', 'Coffee', 'Car', 'Shirt', 'Sparkles', 'Utensils'].map(icon => (
                                    <button 
                                        key={icon}
                                        type="button"
                                        onClick={() => setNewService({...newService, icon})}
                                        className={`p-3 rounded-xl border-2 transition ${newService.icon === icon ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200'}`}
                                    >
                                        {getIconComponent(icon)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-2">القسم المسؤول</label>
                            <select className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.modalInput}`} value={newService.targetDepartment} onChange={e => setNewService({...newService, targetDepartment: e.target.value as any})}>
                                <option value="reception">استقبال (Reception)</option>
                                <option value="housekeeping">تنظيف (Housekeeping)</option>
                                <option value="food_beverage">مطعم (F&B)</option>
                                <option value="spa_wellness">سبا وصحة (Spa)</option>
                                <option value="guest_services">خدمات و سياحة (Concierge)</option>
                                <option value="maintenance">صيانة (Maintenance)</option>
                                <option value="security">أمن (Security)</option>
                            </select>
                        </div>
                    </form>

                    <div className={`p-3 border-t dark:border-gray-700 absolute bottom-0 w-full z-20 pb-safe flex justify-end gap-3 ${settings.theme === 'zellige' ? 'bg-[#FDFBF7]' : 'bg-white'}`}>
                        <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 rounded-xl font-bold bg-gray-200 text-gray-600 hover:bg-gray-300 text-sm">إلغاء</button>
                        <button onClick={handleAdd} className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition text-sm ${ts.button}`}>
                            <Check size={18}/> حفظ
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
