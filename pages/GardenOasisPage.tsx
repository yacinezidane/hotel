import React, { useState, useMemo } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { 
    Trees, Sun, CloudRain, Wind, Umbrella, Coffee, 
    Utensils, Music, Users, Clock, MapPin, 
    CheckCircle2, AlertCircle, Trash2, Plus, 
    MoreVertical, Power, Wifi, Droplets, Store
} from 'lucide-react';
import { ServicePoint } from '../types';

export const GardenOasisPage: React.FC = () => {
    const { servicePoints, updateServicePoint, settings } = useHotel();
    const [selectedZone, setSelectedZone] = useState<string | null>(null);

    // Mock Data for the Grand Garden (Al-Bustan)
    // In a real app, this would be fetched from the DB as a specific ServicePoint
    const gardenId = 'grand-oasis-001';
    
    // Ensure we have a garden object in state or use a default mock
    const gardenData = useMemo(() => {
        const existing = servicePoints.find(sp => sp.id === gardenId);
        if (existing) return existing;
        
        // Default Mock if not found
        return {
            id: gardenId,
            name: 'واحة البستان الملكية',
            type: 'garden',
            status: 'active',
            capacity: 150,
            occupancy: 45,
            location: { address: 'الساحة المركزية - الجناح الشرقي' },
            features: ['shaded', 'wifi', 'fountain', 'live_music'],
            zones: [
                { id: 'z1', name: 'منطقة النافورة', type: 'seating', status: 'occupied', capacity: 20 },
                { id: 'z2', name: 'ركن العائلات (مظلل)', type: 'seating', status: 'available', capacity: 30 },
                { id: 'z3', name: 'ممشى الزهور', type: 'walkway', status: 'available' },
                { id: 'z4', name: 'ساحة الأكشاك', type: 'kiosk_spot', status: 'active', capacity: 50 },
                { id: 'z5', name: 'المسرح المفتوح', type: 'stage', status: 'reserved', capacity: 50 },
            ]
        } as ServicePoint;
    }, [servicePoints]);

    const activeKiosks = servicePoints.filter(sp => sp.location?.parentVenueId === gardenId && sp.status === 'active');

    const isZellige = settings.theme === 'zellige' || settings.theme === 'zellige-v2';
    const isDark = settings.darkMode;

    return (
        <div className="space-y-8 pb-20 animate-fade-in">
            <PageHeader 
                pageKey="garden_oasis" 
                defaultTitle="واحة البستان - الحديقة المركزية" 
                icon={Trees} 
                description="إدارة المساحات الخضراء، مناطق الجلوس، ومحطات الأكشاك في الحديقة الكبرى"
            />

            {/* Top Stats / Weather Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Weather Card (Simulated) */}
                <div className={`relative overflow-hidden rounded-[2.5rem] p-6 shadow-lg ${isDark ? 'bg-blue-900/20 text-blue-100' : 'bg-blue-50 text-blue-900'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Sun size={120} /></div>
                    <h3 className="text-lg font-bold mb-1 flex items-center gap-2"><Sun className="text-amber-500"/> حالة الطقس</h3>
                    <div className="text-4xl font-black mb-2">24°C</div>
                    <div className="flex gap-4 text-sm font-medium opacity-80">
                        <span className="flex items-center gap-1"><Wind size={14}/> 12 km/h</span>
                        <span className="flex items-center gap-1"><Droplets size={14}/> 45%</span>
                    </div>
                    <div className="mt-4 text-xs font-bold bg-white/20 inline-block px-3 py-1 rounded-full">
                        مناسب للجلوس الخارجي
                    </div>
                </div>

                {/* Occupancy Card */}
                <div className={`relative overflow-hidden rounded-[2.5rem] p-6 shadow-lg ${isDark ? 'bg-emerald-900/20 text-emerald-100' : 'bg-emerald-50 text-emerald-900'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Users size={120} /></div>
                    <h3 className="text-lg font-bold mb-1 flex items-center gap-2"><Users className="text-emerald-500"/> الإشغال الحالي</h3>
                    <div className="text-4xl font-black mb-2">{gardenData.occupancy} / {gardenData.capacity}</div>
                    <div className="w-full bg-black/10 h-2 rounded-full mt-2 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(gardenData.occupancy! / gardenData.capacity!) * 100}%` }}></div>
                    </div>
                    <div className="mt-4 text-xs font-bold bg-white/20 inline-block px-3 py-1 rounded-full">
                        {gardenData.occupancy! > (gardenData.capacity! * 0.8) ? 'مزدحم' : 'متوفر أماكن'}
                    </div>
                </div>

                {/* Active Services */}
                <div className={`relative overflow-hidden rounded-[2.5rem] p-6 shadow-lg ${isDark ? 'bg-purple-900/20 text-purple-100' : 'bg-purple-50 text-purple-900'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Store size={120} /></div>
                    <h3 className="text-lg font-bold mb-1 flex items-center gap-2"><Store className="text-purple-500"/> الأكشاك النشطة</h3>
                    <div className="text-4xl font-black mb-2">{activeKiosks.length}</div>
                    <div className="flex -space-x-2 space-x-reverse mt-2">
                        {activeKiosks.slice(0, 4).map((k, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-white border-2 border-purple-100 flex items-center justify-center overflow-hidden" title={k.name}>
                                {k.image ? <img src={k.image} className="w-full h-full object-cover"/> : <Store size={14} className="text-purple-500"/>}
                            </div>
                        ))}
                        {activeKiosks.length > 4 && (
                            <div className="w-8 h-8 rounded-full bg-purple-200 text-purple-700 font-bold flex items-center justify-center text-xs">+{activeKiosks.length - 4}</div>
                        )}
                    </div>
                    <button className="mt-4 text-xs font-bold bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors">
                        إدارة الأكشاك
                    </button>
                </div>
            </div>

            {/* Main Garden Map & Zones */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Map (Left) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className={`rounded-[2.5rem] p-6 min-h-[500px] relative overflow-hidden shadow-xl border-4 ${isZellige ? 'border-[#cca43b]/30' : 'border-emerald-100'} ${isDark ? 'bg-[#001e21]' : 'bg-[#FDFBF7]'}`}>
                        {/* Background Texture */}
                        {isZellige && <div className="absolute inset-0 bg-zellige-pattern opacity-5 pointer-events-none"></div>}
                        
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h2 className="text-2xl font-black flex items-center gap-2">
                                <MapPin className="text-emerald-600"/> خريطة الواحة
                            </h2>
                            <div className="flex gap-2">
                                <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg bg-green-100 text-green-700"><div className="w-2 h-2 rounded-full bg-green-500"></div> متاح</span>
                                <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg bg-red-100 text-red-700"><div className="w-2 h-2 rounded-full bg-red-500"></div> مشغول</span>
                                <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg bg-amber-100 text-amber-700"><div className="w-2 h-2 rounded-full bg-amber-500"></div> محجوز</span>
                            </div>
                        </div>

                        {/* Interactive Zones Grid (Simulated Map) */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
                            {gardenData.zones?.map(zone => (
                                <div 
                                    key={zone.id}
                                    onClick={() => setSelectedZone(zone.id)}
                                    className={`
                                        p-6 rounded-[2rem] border-2 transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-lg
                                        ${selectedZone === zone.id ? 'ring-4 ring-blue-400 ring-offset-2' : ''}
                                        ${zone.status === 'available' ? 'bg-green-50/50 border-green-200 hover:bg-green-100' : 
                                          zone.status === 'occupied' ? 'bg-red-50/50 border-red-200 hover:bg-red-100' : 
                                          zone.status === 'reserved' ? 'bg-amber-50/50 border-amber-200 hover:bg-amber-100' : 'bg-gray-50 border-gray-200'}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl ${
                                            zone.type === 'seating' ? 'bg-emerald-100 text-emerald-600' :
                                            zone.type === 'kiosk_spot' ? 'bg-purple-100 text-purple-600' :
                                            zone.type === 'stage' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                            {zone.type === 'seating' ? <Umbrella size={20}/> :
                                             zone.type === 'kiosk_spot' ? <Store size={20}/> :
                                             zone.type === 'stage' ? <Music size={20}/> : <Trees size={20}/>}
                                        </div>
                                        {zone.features && (
                                            <div className="flex gap-1">
                                                {gardenData.features?.includes('wifi') && <Wifi size={14} className="text-gray-400"/>}
                                                {gardenData.features?.includes('power') && <Power size={14} className="text-gray-400"/>}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-lg mb-1">{zone.name}</h3>
                                    <p className="text-xs font-medium opacity-60 mb-3">
                                        {zone.type === 'seating' ? 'منطقة جلوس' : 
                                         zone.type === 'kiosk_spot' ? 'محطة أكشاك' : 
                                         zone.type === 'stage' ? 'مسرح فعاليات' : 'ممشى'}
                                    </p>
                                    
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span className={`px-2 py-1 rounded-lg ${
                                            zone.status === 'available' ? 'bg-green-200 text-green-800' :
                                            zone.status === 'occupied' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'
                                        }`}>
                                            {zone.status === 'available' ? 'متاح' : zone.status === 'occupied' ? 'مشغول' : 'محجوز'}
                                        </span>
                                        {zone.capacity && <span className="text-gray-500">{zone.capacity} مقعد</span>}
                                    </div>
                                </div>
                            ))}
                            
                            {/* Add New Zone Placeholder */}
                            <button className="border-2 border-dashed border-gray-300 rounded-[2rem] flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-blue-500 hover:border-blue-400 hover:bg-blue-50 transition-all min-h-[160px]">
                                <Plus size={32}/>
                                <span className="font-bold">إضافة منطقة</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls (Right) */}
                <div className="space-y-6">
                    {/* Selected Zone Details */}
                    <div className={`rounded-[2.5rem] p-6 shadow-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <h3 className="font-black text-xl mb-4 flex items-center gap-2">
                            <CheckCircle2 className="text-blue-500"/> التحكم في المنطقة
                        </h3>
                        
                        {selectedZone ? (
                            <div className="space-y-4 animate-fade-in">
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50">
                                    <h4 className="font-bold text-lg">{gardenData.zones?.find(z => z.id === selectedZone)?.name}</h4>
                                    <p className="text-sm text-gray-500">الحالة: {gardenData.zones?.find(z => z.id === selectedZone)?.status}</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-sm flex flex-col items-center gap-2">
                                        <Utensils size={20}/> طلب نادل
                                    </button>
                                    <button className="p-3 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 font-bold text-sm flex flex-col items-center gap-2">
                                        <Trash2 size={20}/> طلب تنظيف
                                    </button>
                                    <button className="p-3 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 font-bold text-sm flex flex-col items-center gap-2">
                                        <Music size={20}/> تشغيل موسيقى
                                    </button>
                                    <button className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-bold text-sm flex flex-col items-center gap-2">
                                        <AlertCircle size={20}/> إبلاغ صيانة
                                    </button>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">تغيير الحالة</label>
                                    <select className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-900 border-none font-bold text-sm">
                                        <option value="available">متاح للزوار</option>
                                        <option value="reserved">حجز خاص</option>
                                        <option value="maintenance">تحت الصيانة</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <MapPin size={48} className="mx-auto mb-2 opacity-20"/>
                                <p>اختر منطقة من الخريطة للتحكم بها</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Services */}
                    <div className={`rounded-[2.5rem] p-6 shadow-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <h3 className="font-black text-xl mb-4">خدمات الواحة</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600"><Trees size={18}/></div>
                                    <div>
                                        <h4 className="font-bold text-sm">جدول الري</h4>
                                        <p className="text-[10px] text-gray-500">القادم: 18:00 مساءً</p>
                                    </div>
                                </div>
                                <Clock size={16} className="text-gray-400"/>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-amber-100 text-amber-600"><Sun size={18}/></div>
                                    <div>
                                        <h4 className="font-bold text-sm">التحكم في الإضاءة</h4>
                                        <p className="text-[10px] text-gray-500">الوضع: تلقائي (غروب)</p>
                                    </div>
                                </div>
                                <Power size={16} className="text-gray-400"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GardenOasisPage;
