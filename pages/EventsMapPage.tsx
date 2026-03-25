
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Users, Ticket, ChevronRight, ArrowRight, Info, Star, Coffee, Utensils, Music, Sparkles } from 'lucide-react';
import { useHotel } from '../context/HotelContext';

export const EventsMapPage: React.FC = () => {
    const { hotelEvents, addNotification } = useHotel();
    const [selectedTable, setSelectedTable] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'map' | 'events'>('map');

    const handleBookTicket = (event: any) => {
        if (event.availableSeats > 0) {
            addNotification(`تم حجز تذكرة لـ ${event.title} بنجاح.`, 'success');
        } else {
            addNotification(`عذراً، نفدت التذاكر لهذه الفعالية.`, 'error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-gray-100 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#006269]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-right">
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">خريطة الحجوزات والفعاليات</h1>
                            <p className="text-gray-500 font-bold text-xl">استكشف أماكن الجلوس، الفعاليات الحية، واحجز تذكرتك بكل سهولة.</p>
                        </div>
                        <div className="flex bg-gray-100 p-2 rounded-2xl">
                            <button 
                                onClick={() => setActiveTab('map')}
                                className={`px-8 py-3 rounded-xl font-black text-lg transition-all ${activeTab === 'map' ? 'bg-white text-[#006269] shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                خريطة المقاعد
                            </button>
                            <button 
                                onClick={() => setActiveTab('events')}
                                className={`px-8 py-3 rounded-xl font-black text-lg transition-all ${activeTab === 'events' ? 'bg-white text-[#006269] shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                الفعاليات والتذاكر
                            </button>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'map' ? (
                        <motion.div 
                            key="map"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-[4rem] p-8 md:p-16 shadow-2xl border border-gray-100"
                        >
                            <div className="flex flex-col lg:flex-row gap-12">
                                {/* Map Controls / Info */}
                                <div className="lg:w-1/3 space-y-8 text-right">
                                    <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100">
                                        <h3 className="text-2xl font-black text-[#006269] mb-4 flex items-center justify-end gap-3">
                                            معلومات الخريطة <Info size={24} />
                                        </h3>
                                        <p className="text-emerald-800 font-bold leading-relaxed mb-6">
                                            يمكنك اختيار طاولتك المفضلة في المطعم الأندلسي أو مقهى القصبة. الأرقام الموضحة تمثل رقم الطاولة.
                                        </p>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-end gap-4">
                                                <span className="text-sm font-bold text-gray-600">طاولة مختارة</span>
                                                <div className="w-6 h-6 bg-[#cca43b] rounded-lg shadow-lg rotate-3"></div>
                                            </div>
                                            <div className="flex items-center justify-end gap-4">
                                                <span className="text-sm font-bold text-gray-600">طاولة متاحة</span>
                                                <div className="w-6 h-6 bg-white border-2 border-gray-200 rounded-lg"></div>
                                            </div>
                                            <div className="flex items-center justify-end gap-4">
                                                <span className="text-sm font-bold text-gray-600">طاولة محجوزة</span>
                                                <div className="w-6 h-6 bg-gray-100 rounded-lg"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedTable && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-[#006269] p-8 rounded-[2.5rem] text-white shadow-2xl"
                                        >
                                            <h4 className="text-xl font-black mb-2">لقد اخترت الطاولة رقم {selectedTable}</h4>
                                            <p className="text-emerald-100 font-medium mb-6">هذه الطاولة تتسع لـ 4 أشخاص وتطل على الحديقة الأندلسية.</p>
                                            <button 
                                                onClick={() => addNotification(`تم تأكيد حجز الطاولة رقم ${selectedTable}`, 'success')}
                                                className="w-full py-4 bg-[#cca43b] rounded-xl font-black text-lg hover:bg-white hover:text-[#cca43b] transition-all"
                                            >
                                                تأكيد الحجز الآن
                                            </button>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Interactive Map */}
                                <div className="lg:w-2/3 bg-gray-50 rounded-[3.5rem] p-8 md:p-12 border-4 border-dashed border-gray-200 relative overflow-auto min-h-[600px]">
                                    <div className="min-w-[500px] flex flex-col items-center gap-16">
                                        <div className="w-full max-w-md h-12 bg-gray-200 rounded-full flex items-center justify-center text-xs font-black text-gray-400 uppercase tracking-[0.3em]">
                                            المنصة الرئيسية / الإطلالة البانورامية
                                        </div>

                                        <div className="grid grid-cols-3 md:grid-cols-4 gap-12">
                                            {Array.from({ length: 16 }).map((_, i) => (
                                                <div key={i} className="flex flex-col items-center gap-4">
                                                    <div className="flex gap-3">
                                                        <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                                                        <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                                                    </div>
                                                    <button 
                                                        onClick={() => setSelectedTable(i + 1)}
                                                        className={`w-20 h-20 md:w-24 md:h-24 rounded-[2rem] shadow-xl flex items-center justify-center font-black text-2xl transition-all duration-500 ${
                                                            selectedTable === i + 1 
                                                            ? 'bg-[#cca43b] text-white scale-110 rotate-6 shadow-[#cca43b]/40' 
                                                            : 'bg-white text-gray-400 hover:border-[#cca43b] border-2 border-transparent hover:scale-105'
                                                        }`}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                    <div className="flex gap-3">
                                                        <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                                                        <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="w-full max-w-xs h-8 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                            منطقة المدخل
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="events"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {hotelEvents.map((event, i) => (
                                    <motion.div 
                                        key={event.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-white rounded-[3.5rem] overflow-hidden shadow-xl border border-gray-100 group hover:shadow-2xl transition-all"
                                    >
                                        <div className="h-64 relative overflow-hidden">
                                            <img 
                                                src={event.image} 
                                                alt={event.title} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                referrerPolicy="no-referrer"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                            <div className="absolute bottom-6 right-6 text-right">
                                                <div className="flex items-center justify-end gap-2 text-emerald-400 font-black text-sm mb-1 uppercase tracking-widest">
                                                    {event.category === 'music' && <Music size={16} />}
                                                    {event.category === 'food' && <Utensils size={16} />}
                                                    {event.category === 'culture' && <Sparkles size={16} />}
                                                    <span>{event.category}</span>
                                                </div>
                                                <h3 className="text-2xl font-black text-white">{event.title}</h3>
                                            </div>
                                            <div className="absolute top-6 left-6 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-xs text-white font-black border border-white/30">
                                                {event.date}
                                            </div>
                                        </div>
                                        <div className="p-8 text-right space-y-6">
                                            <p className="text-gray-500 font-bold leading-relaxed">{event.description}</p>
                                            
                                            <div className="flex flex-wrap justify-end gap-4">
                                                <div className="bg-gray-50 px-4 py-2 rounded-xl flex items-center gap-2 border border-gray-100">
                                                    <span className="text-gray-900 font-black">{event.price} د.ج</span>
                                                    <Ticket size={18} className="text-[#cca43b]" />
                                                </div>
                                                <div className="bg-gray-50 px-4 py-2 rounded-xl flex items-center gap-2 border border-gray-100">
                                                    <span className={`font-black ${event.availableSeats && event.availableSeats < 15 ? 'text-red-500' : 'text-emerald-600'}`}>
                                                        {event.availableSeats} / {event.totalSeats}
                                                    </span>
                                                    <Users size={18} className="text-gray-400" />
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => handleBookTicket(event)}
                                                disabled={!event.availableSeats || event.availableSeats <= 0}
                                                className={`w-full py-5 rounded-2xl font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3 ${
                                                    event.availableSeats && event.availableSeats > 0
                                                    ? 'bg-[#006269] text-white hover:bg-[#cca43b]' 
                                                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                                }`}
                                            >
                                                {event.availableSeats && event.availableSeats > 0 ? (
                                                    <>احجز تذكرتك الآن <ArrowRight size={24} /></>
                                                ) : 'نفدت التذاكر'}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Admin Info Section */}
                            <div className="bg-gray-900 rounded-[4rem] p-12 md:p-16 text-white relative overflow-hidden group">
                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/zellige-dark.png')]"></div>
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                                    <div className="text-right max-w-2xl">
                                        <h3 className="text-3xl font-black mb-4">نظام الحجز الذكي</h3>
                                        <p className="text-gray-400 font-bold text-lg leading-relaxed">
                                            يتم تحديث عدد التذاكر والفعاليات المتاحة بشكل لحظي من قبل إدارات الفندق المختلفة. الأسماء والمقاعد والأسعار محددة بدقة لضمان أفضل تجربة لكم.
                                        </p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20">
                                            <Star className="text-[#cca43b]" size={32} />
                                        </div>
                                        <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20">
                                            <Sparkles className="text-emerald-400" size={32} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default EventsMapPage;
