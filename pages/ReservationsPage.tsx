import React, { useState, useMemo } from 'react';
import { useHotel } from '../context/HotelContext';
import { 
    Calendar, Clock, Users, Search, Filter, Plus, 
    CheckCircle, XCircle, AlertCircle, QrCode, 
    Utensils, PartyPopper, Waves, Armchair, MapPin,
    ChevronRight, ChevronLeft, Printer
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Reservation, ReservationType, Table, AppTheme } from '../types';

const getThemeStyles = (theme: AppTheme, darkMode: boolean) => {
    const isZellige = theme.startsWith('zellige');
    
    if (darkMode) {
        if (theme === 'zellige') return {
            bg: 'bg-[#001e21]', card: 'bg-[#002a2d]', text: 'text-[#cca43b]', border: 'border-[#cca43b]/30',
            accent: 'bg-[#cca43b]', accentText: 'text-[#001e21]', muted: 'text-[#cca43b]/60',
            input: 'bg-[#001517] border-[#cca43b]/30 text-[#cca43b]',
            pattern: 'bg-zellige-pattern opacity-5'
        };
        // ... add other zellige variants if needed, fallback to standard dark
        return {
            bg: 'bg-gray-900', card: 'bg-gray-800', text: 'text-white', border: 'border-gray-700',
            accent: 'bg-blue-600', accentText: 'text-white', muted: 'text-gray-400',
            input: 'bg-gray-900 border-gray-700 text-white',
            pattern: ''
        };
    }

    if (theme === 'zellige') return {
        bg: 'bg-[#fdfbf7]', card: 'bg-white', text: 'text-[#006269]', border: 'border-[#cca43b]/30',
        accent: 'bg-[#006269]', accentText: 'text-[#cca43b]', muted: 'text-[#006269]/60',
        input: 'bg-[#fdfbf7] border-[#cca43b]/30 text-[#006269]',
        pattern: 'bg-zellige-pattern opacity-5'
    };
    
    return {
        bg: 'bg-gray-50', card: 'bg-white', text: 'text-gray-900', border: 'border-gray-200',
        accent: 'bg-blue-600', accentText: 'text-white', muted: 'text-gray-500',
        input: 'bg-gray-50 border-gray-200 text-gray-900',
        pattern: ''
    };
};

export const ReservationsPage = () => {
    const { 
        settings, reservations, addReservation, 
        restaurantTables, updateTableStatus,
        currentUser, addNotification
    } = useHotel();
    
    const ts = getThemeStyles(settings.theme, settings.darkMode);
    const [activeTab, setActiveTab] = useState<ReservationType>('table');
    const [showModal, setShowModal] = useState(false);
    const [selectedTarget, setSelectedTarget] = useState<any>(null);
    
    // Form State
    const [formData, setFormData] = useState({
        guestName: '',
        date: new Date().toISOString().split('T')[0],
        time: '19:00',
        pax: 2,
        notes: ''
    });

    const [showQR, setShowQR] = useState<Reservation | null>(null);

    const handleBook = (target: any) => {
        setSelectedTarget(target);
        setShowModal(true);
    };

    const confirmBooking = () => {
        if (!selectedTarget) return;

        const newRes: Omit<Reservation, 'id' | 'createdAt' | 'status' | 'qrCodeData'> = {
            type: activeTab,
            targetId: selectedTarget.id,
            targetName: selectedTarget.name || `Table ${selectedTarget.number}`,
            guestName: formData.guestName,
            date: formData.date,
            startTime: formData.time,
            pax: formData.pax,
            notes: formData.notes,
            price: 0, // Calculate based on target if needed
            isPaid: false
        };

        addReservation(newRes);
        
        // If table, update status
        if (activeTab === 'table') {
            updateTableStatus(selectedTarget.id, 'reserved');
        }

        setShowModal(false);
        setFormData({ guestName: '', date: new Date().toISOString().split('T')[0], time: '19:00', pax: 2, notes: '' });
    };

    const filteredReservations = useMemo(() => {
        return reservations.filter(r => r.type === activeTab);
    }, [reservations, activeTab]);

    return (
        <div className={`min-h-full p-6 ${ts.bg} ${ts.text} font-sans transition-colors duration-300`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black mb-2">نظام الحجوزات المركزي</h1>
                    <p className={`text-sm font-bold ${ts.muted}`}>إدارة حجوزات الطاولات، الفعاليات، والمرافق</p>
                </div>
                <div className={`p-3 rounded-2xl ${ts.card} ${ts.border} border shadow-sm`}>
                    <Calendar size={24} />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                {[
                    { id: 'table', label: 'المطعم والطاولات', icon: Utensils },
                    { id: 'event', label: 'الفعاليات', icon: PartyPopper },
                    { id: 'pool', label: 'المسبح', icon: Waves },
                    { id: 'venue', label: 'القاعات', icon: Armchair },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ReservationType)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                            activeTab === tab.id 
                            ? `${ts.accent} ${ts.accentText} shadow-lg` 
                            : `${ts.card} ${ts.text} border ${ts.border}`
                        }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Available Options (Left Column) */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold mb-4">المتاح للحجز</h2>
                    
                    {activeTab === 'table' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {restaurantTables.map(table => (
                                <div 
                                    key={table.id}
                                    onClick={() => table.status === 'available' && handleBook(table)}
                                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group ${
                                        table.status === 'available' 
                                        ? `${ts.card} ${ts.border} hover:border-green-500` 
                                        : 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-black text-lg">T-{table.number}</span>
                                        <Users size={16} className={ts.muted} />
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-bold opacity-70">
                                        <span>{table.capacity} أشخاص</span>
                                        <span>•</span>
                                        <span>{table.zone}</span>
                                    </div>
                                    {table.status === 'available' ? (
                                        <div className="mt-3 text-green-600 text-xs font-black uppercase tracking-wider">متاح للحجز</div>
                                    ) : (
                                        <div className="mt-3 text-red-500 text-xs font-black uppercase tracking-wider">غير متاح</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Placeholder for other tabs */}
                    {activeTab !== 'table' && (
                        <div className={`p-12 rounded-3xl border-2 border-dashed ${ts.border} flex flex-col items-center justify-center text-center`}>
                            <div className={`p-4 rounded-full mb-4 ${ts.input}`}>
                                <Calendar size={32} className="opacity-50" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">لا توجد عناصر متاحة حالياً</h3>
                            <p className={`max-w-xs mb-6 ${ts.muted}`}>سيتم إضافة العناصر الخاصة بهذا القسم قريباً</p>
                            <button 
                                onClick={() => addNotification(`قسم ${activeTab === 'event' ? 'الفعاليات' : activeTab === 'pool' ? 'المسبح' : 'القاعات'} قيد التطوير حالياً وسيتم تفعيله قريباً!`, 'info')}
                                className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${ts.accent} ${ts.accentText} hover:scale-105 active:scale-95`}
                            >
                                إشعار عند التفعيل
                            </button>
                        </div>
                    )}
                </div>

                {/* Recent Reservations (Right Column) */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold mb-4">الحجوزات النشطة</h2>
                    <div className="space-y-4">
                        {filteredReservations.length === 0 ? (
                            <div className={`p-8 rounded-2xl text-center ${ts.card} ${ts.border} border`}>
                                <p className={ts.muted}>لا توجد حجوزات نشطة</p>
                            </div>
                        ) : (
                            filteredReservations.map(res => (
                                <div key={res.id} className={`p-4 rounded-2xl border ${ts.card} ${ts.border} shadow-sm`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold">{res.targetName}</h3>
                                            <p className={`text-xs ${ts.muted}`}>{res.guestName}</p>
                                        </div>
                                        <button onClick={() => setShowQR(res)} className={`p-2 rounded-lg ${ts.input}`}>
                                            <QrCode size={16} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-medium opacity-80 mt-2">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {res.date}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {res.startTime}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users size={12} />
                                            {res.pax}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl animate-fade-in-up ${ts.card} ${ts.text}`}>
                        <h3 className="text-xl font-black mb-6">تأكيد الحجز</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold mb-1 opacity-70">اسم الضيف</label>
                                <input 
                                    type="text" 
                                    value={formData.guestName}
                                    onChange={e => setFormData({...formData, guestName: e.target.value})}
                                    className={`w-full p-3 rounded-xl border outline-none font-bold ${ts.input}`}
                                    placeholder="الاسم الكامل"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold mb-1 opacity-70">التاريخ</label>
                                    <input 
                                        type="date" 
                                        value={formData.date}
                                        onChange={e => setFormData({...formData, date: e.target.value})}
                                        className={`w-full p-3 rounded-xl border outline-none font-bold ${ts.input}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 opacity-70">الوقت</label>
                                    <input 
                                        type="time" 
                                        value={formData.time}
                                        onChange={e => setFormData({...formData, time: e.target.value})}
                                        className={`w-full p-3 rounded-xl border outline-none font-bold ${ts.input}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1 opacity-70">عدد الأشخاص</label>
                                <input 
                                    type="number" 
                                    value={formData.pax}
                                    onChange={e => setFormData({...formData, pax: parseInt(e.target.value)})}
                                    className={`w-full p-3 rounded-xl border outline-none font-bold ${ts.input}`}
                                    min={1}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1 opacity-70">ملاحظات</label>
                                <textarea 
                                    value={formData.notes}
                                    onChange={e => setFormData({...formData, notes: e.target.value})}
                                    className={`w-full p-3 rounded-xl border outline-none font-bold ${ts.input}`}
                                    rows={2}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button 
                                onClick={confirmBooking}
                                className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg ${ts.accent}`}
                            >
                                تأكيد الحجز
                            </button>
                            <button 
                                onClick={() => setShowModal(false)}
                                className={`flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200`}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Modal */}
            {showQR && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setShowQR(null)}>
                    <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full animate-scale-in" onClick={e => e.stopPropagation()}>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">رمز الحجز</h3>
                        <p className="text-gray-500 text-sm mb-6">يرجى إبراز هذا الرمز عند الوصول</p>
                        
                        <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 shadow-inner inline-block mb-6">
                            <QRCodeSVG value={showQR.qrCodeData} size={200} level="H" />
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-6">
                            <p><span className="font-bold">المكان:</span> {showQR.targetName}</p>
                            <p><span className="font-bold">التاريخ:</span> {showQR.date} - {showQR.startTime}</p>
                            <p><span className="font-bold">الضيف:</span> {showQR.guestName}</p>
                        </div>

                        <button 
                            onClick={() => window.print()}
                            className="w-full py-3 rounded-xl font-bold bg-gray-900 text-white flex items-center justify-center gap-2 hover:bg-black transition"
                        >
                            <Printer size={18} />
                            طباعة التذكرة
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
