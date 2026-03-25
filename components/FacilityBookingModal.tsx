import React, { useState } from 'react';
import { X, Calendar, Clock, User, Users, Check, ChevronRight, Sparkles, Info, Crown, Coffee, Car, Utensils, House, Waves } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: {
        id: string;
        name: string;
        description: string;
        price: number;
        category: string;
    };
    onConfirm: (bookingDetails: any) => void;
    themeColor: string;
}

const ROOM_TYPES = [
    { id: 'single', label: 'غرفة فردية', icon: User, desc: 'للمسافر المنفرد' },
    { id: 'double', label: 'غرفة زوجية', icon: Users, desc: 'لشخصين' },
    { id: 'triple', label: 'غرفة ثلاثية', icon: Users, desc: 'لثلاثة أشخاص' },
    { id: 'family', label: 'غرفة عائلية', icon: House, desc: 'للعائلات الكبيرة' },
    { id: 'suite', label: 'جناح جونيور', icon: Crown, desc: 'أناقة وراحة' },
    { id: 'royal', label: 'الجناح الملكي', icon: Crown, desc: 'فخامة مطلقة' },
];

const ROOM_CLASSIFICATIONS = [
    { id: 'standard', label: 'قياسية', price: 0, desc: 'مريحة وعملية' },
    { id: 'deluxe', label: 'ديلوكس', price: 4500, desc: 'إطلالة ومساحة أكبر' },
    { id: 'luxury', label: 'فاخرة', price: 10000, desc: 'أفخم التجهيزات' },
];

const ADDITIONAL_SERVICES = [
    { id: 'breakfast', label: 'إفطار بوفيه مفتوح', price: 1800, icon: Coffee },
    { id: 'spa', label: 'دخول السبا والمساج', price: 5000, icon: Sparkles },
    { id: 'pool_vip', label: 'تذكرة مسبح VIP', price: 2500, icon: Waves },
    { id: 'transport', label: 'نقل من/إلى المطار', price: 3000, icon: Car },
    { id: 'late_checkout', label: 'تسجيل خروج متأخر', price: 2000, icon: Clock },
];

export const FacilityBookingModal: React.FC<BookingModalProps> = ({
    isOpen,
    onClose,
    item,
    onConfirm,
    themeColor
}) => {
    const isRoomBooking = item.category === 'tickets' && (item.name.includes('غرفة') || item.name.includes('جناح'));
    
    const [bookingType, setBookingType] = useState<'immediate' | 'scheduled'>('immediate');
    const [serviceLevel, setServiceLevel] = useState<'standard' | 'premium' | 'vip'>('standard');
    const [forWhom, setForWhom] = useState<'self' | 'others'>('self');
    const [quantity, setQuantity] = useState(1);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [guestName, setGuestName] = useState('');
    
    // Room specific states
    const [roomClassification, setRoomClassification] = useState((item as any).subcategory || 'standard');
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    if (!isOpen) return null;

    const getServicePriceMultiplier = () => {
        if (serviceLevel === 'vip') return 1.5;
        if (serviceLevel === 'premium') return 1.2;
        return 1;
    };

    const calculateTotalPrice = () => {
        let base = item.price;
        
        if (isRoomBooking) {
            const classPrice = ROOM_CLASSIFICATIONS.find(c => c.id === roomClassification)?.price || 0;
            const servicesPrice = selectedServices.reduce((sum, id) => {
                const s = ADDITIONAL_SERVICES.find(as => as.id === id);
                return sum + (s?.price || 0);
            }, 0);
            base = (base + classPrice + servicesPrice);
        }

        return Math.round(base * getServicePriceMultiplier() * quantity);
    };

    const handleConfirm = () => {
        const extras = selectedServices.map(id => ADDITIONAL_SERVICES.find(s => s.id === id)?.label).filter(Boolean);
        const classification = ROOM_CLASSIFICATIONS.find(c => c.id === roomClassification)?.label;
        
        onConfirm({
            itemId: item.id,
            itemName: isRoomBooking ? `${item.name} (${classification})` : item.name,
            bookingType,
            serviceLevel,
            forWhom,
            guestName: forWhom === 'others' ? guestName : 'لي شخصياً',
            quantity,
            date: bookingType === 'scheduled' ? date : 'فوري',
            time: bookingType === 'scheduled' ? time : 'الآن',
            notes: notes + (extras.length > 0 ? `\nالخدمات الإضافية: ${extras.join('، ')}` : ''),
            roomDetails: isRoomBooking ? {
                classification: roomClassification,
                additionalServices: selectedServices
            } : null,
            totalPrice: calculateTotalPrice()
        });
        onClose();
    };

    const toggleService = (id: string) => {
        setSelectedServices(prev => 
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
            >
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="w-full max-w-2xl bg-white rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[95vh]"
                >
                    {/* Header */}
                    <div className="p-6 sm:p-8 flex items-center justify-between border-b border-gray-50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: themeColor }}>
                                {isRoomBooking ? <Crown size={24} /> : <Calendar size={24} />}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900">{item.name}</h3>
                                <p className="text-xs text-gray-400 font-bold">
                                    {isRoomBooking ? 'تخصيص حجز الغرفة والخدمات' : 'تخصيص حجز المرفق'}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
                        {/* Service Info */}
                        <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                            <div className="flex items-start gap-4">
                                <Info size={20} className="text-gray-400 mt-1 shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-600 font-bold leading-relaxed">{item.description}</p>
                                    <div className="mt-4 flex items-center gap-2">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">السعر الأساسي:</span>
                                        <span className="text-lg font-black" style={{ color: themeColor }}>{item.price.toLocaleString()} د.ج</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isRoomBooking && (
                            <>
                                {/* Room Classification */}
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">تصنيف الغرفة (Upgrade)</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {ROOM_CLASSIFICATIONS.map(cls => (
                                            <button 
                                                key={cls.id}
                                                onClick={() => setRoomClassification(cls.id)}
                                                className={`p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-1 ${
                                                    roomClassification === cls.id 
                                                    ? 'bg-white shadow-md' 
                                                    : 'bg-gray-50 border-transparent text-gray-400'
                                                }`}
                                                style={{ borderColor: roomClassification === cls.id ? themeColor : 'transparent' }}
                                            >
                                                <span className="font-black text-[10px]">{cls.label}</span>
                                                <span className="text-[8px] font-bold opacity-60">+{cls.price.toLocaleString()} د.ج</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Additional Services */}
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">خدمات إضافية ذكية (Extras)</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {ADDITIONAL_SERVICES.map(service => (
                                            <button 
                                                key={service.id}
                                                onClick={() => toggleService(service.id)}
                                                className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                                                    selectedServices.includes(service.id)
                                                    ? 'bg-white shadow-md' 
                                                    : 'bg-gray-50 border-transparent text-gray-400'
                                                }`}
                                                style={{ borderColor: selectedServices.includes(service.id) ? themeColor : 'transparent' }}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedServices.includes(service.id) ? 'bg-opacity-20 text-opacity-100' : 'bg-gray-200 text-gray-400'}`} style={{ backgroundColor: selectedServices.includes(service.id) ? themeColor : undefined, color: selectedServices.includes(service.id) ? themeColor : undefined }}>
                                                    <service.icon size={16} />
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-[10px] text-gray-900">{service.label}</p>
                                                    <p className="text-[8px] font-bold">+{service.price.toLocaleString()} د.ج</p>
                                                </div>
                                                {selectedServices.includes(service.id) && <Check size={14} className="mr-auto" style={{ color: themeColor }} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Booking Type */}
                        <div className="space-y-4">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">نوع الحجز</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setBookingType('immediate')}
                                    className={`p-6 rounded-[2rem] border-2 transition-all text-right flex flex-col gap-2 ${
                                        bookingType === 'immediate' 
                                        ? 'bg-white shadow-xl' 
                                        : 'bg-gray-50 border-transparent text-gray-400'
                                    }`}
                                    style={{ borderColor: bookingType === 'immediate' ? themeColor : 'transparent' }}
                                >
                                    <Clock size={24} style={{ color: bookingType === 'immediate' ? themeColor : undefined }} />
                                    <span className={`font-black ${bookingType === 'immediate' ? 'text-gray-900' : ''}`}>حجز فوري</span>
                                    <span className="text-[10px] font-bold">{isRoomBooking ? 'تسجيل دخول الآن' : 'استخدام المرفق الآن'}</span>
                                </button>
                                <button 
                                    onClick={() => setBookingType('scheduled')}
                                    className={`p-6 rounded-[2rem] border-2 transition-all text-right flex flex-col gap-2 ${
                                        bookingType === 'scheduled' 
                                        ? 'bg-white shadow-xl' 
                                        : 'bg-gray-50 border-transparent text-gray-400'
                                    }`}
                                    style={{ borderColor: bookingType === 'scheduled' ? themeColor : 'transparent' }}
                                >
                                    <Calendar size={24} style={{ color: bookingType === 'scheduled' ? themeColor : undefined }} />
                                    <span className={`font-black ${bookingType === 'scheduled' ? 'text-gray-900' : ''}`}>حجز مسبق</span>
                                    <span className="text-[10px] font-bold">تحديد موعد لاحق</span>
                                </button>
                            </div>
                        </div>

                        {/* Service Level */}
                        <div className="space-y-4">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">مستوى الخدمة</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'standard', label: 'عادي', icon: User, desc: 'الخدمة القياسية' },
                                    { id: 'premium', label: 'مميز', icon: Sparkles, desc: '+20% تكلفة' },
                                    { id: 'vip', label: 'VIP', icon: Crown, desc: '+50% تكلفة' }
                                ].map(level => (
                                    <button 
                                        key={level.id}
                                        onClick={() => setServiceLevel(level.id as any)}
                                        className={`p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-1 ${
                                            serviceLevel === level.id 
                                            ? 'bg-white shadow-md' 
                                            : 'bg-gray-50 border-transparent text-gray-400'
                                        }`}
                                        style={{ borderColor: serviceLevel === level.id ? themeColor : 'transparent' }}
                                    >
                                        <level.icon size={20} style={{ color: serviceLevel === level.id ? themeColor : undefined }} />
                                        <span className="font-black text-[10px]">{level.label}</span>
                                        <span className="text-[8px] font-bold opacity-60">{level.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* For Whom */}
                        <div className="space-y-4">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">الحجز لـ</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setForWhom('self')}
                                    className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                                        forWhom === 'self' 
                                        ? 'bg-white shadow-md' 
                                        : 'bg-gray-50 border-transparent text-gray-400'
                                    }`}
                                    style={{ borderColor: forWhom === 'self' ? themeColor : 'transparent' }}
                                >
                                    <User size={18} style={{ color: forWhom === 'self' ? themeColor : undefined }} />
                                    <span className="font-black text-sm">لي شخصياً</span>
                                </button>
                                <button 
                                    onClick={() => setForWhom('others')}
                                    className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                                        forWhom === 'others' 
                                        ? 'bg-white shadow-md' 
                                        : 'bg-gray-50 border-transparent text-gray-400'
                                    }`}
                                    style={{ borderColor: forWhom === 'others' ? themeColor : 'transparent' }}
                                >
                                    <Users size={18} style={{ color: forWhom === 'others' ? themeColor : undefined }} />
                                    <span className="font-black text-sm">لشخص آخر</span>
                                </button>
                            </div>
                        </div>

                        {/* Guest Name for others */}
                        {forWhom === 'others' && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-2"
                            >
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">اسم الضيف</label>
                                <input 
                                    type="text" 
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    placeholder="أدخل اسم الشخص الذي ستحجز له..."
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:ring-2 outline-none"
                                    style={{ '--tw-ring-color': themeColor } as any}
                                />
                            </motion.div>
                        )}

                        {/* Quantity / Multiple Bookings */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                    {isRoomBooking ? 'عدد الغرف' : 'عدد الأشخاص / التذاكر'}
                                </label>
                                <span className="text-xs font-black" style={{ color: themeColor }}>{quantity} {isRoomBooking ? 'غرف' : 'تذاكر'}</span>
                            </div>
                            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                                <button 
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition-all"
                                >
                                    -
                                </button>
                                <div className="flex-1 text-center font-black text-lg">{quantity}</div>
                                <button 
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-400 hover:text-green-500 shadow-sm transition-all"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Scheduled Details */}
                        {bookingType === 'scheduled' && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="grid grid-cols-2 gap-4"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">التاريخ</label>
                                    <input 
                                        type="date" 
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:ring-2 outline-none"
                                        style={{ '--tw-ring-color': themeColor } as any}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">الوقت</label>
                                    <input 
                                        type="time" 
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:ring-2 outline-none"
                                        style={{ '--tw-ring-color': themeColor } as any}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Notes */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">ملاحظات إضافية</label>
                            <textarea 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="أي طلبات خاصة أو تفاصيل إضافية..."
                                className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[2rem] font-bold text-sm focus:ring-2 outline-none min-h-[120px] resize-none"
                                style={{ '--tw-ring-color': themeColor } as any}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 sm:p-8 bg-gray-50 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">إجمالي الحجز</p>
                                <p className="text-2xl font-black text-gray-900">{calculateTotalPrice().toLocaleString()} د.ج</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الحالة</p>
                                <p className="text-sm font-black text-emerald-500">تأكيد فوري</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleConfirm}
                            className="w-full py-5 text-white rounded-[2rem] font-black text-lg shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                            style={{ backgroundColor: themeColor, boxShadow: `0 20px 40px ${themeColor}33` }}
                        >
                            <Check size={24} /> تأكيد الحجز والطلب
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
