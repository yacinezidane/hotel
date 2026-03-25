
import React, { useState, useMemo } from 'react';
import { useHotel } from '../context/HotelContext';
import { 
    Clock, Users, Calendar, Receipt, Plus, 
    Settings, LayoutGrid, Bell, Shield, 
    TrendingUp, LogIn, LogOut, Search,
    Maximize, Minimize, X, Edit2, Trash2,
    CheckCircle2, AlertCircle, RefreshCw,
    MoreVertical, ChevronRight, Layout,
    Monitor, MousePointer2, Sparkles, BedDouble
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DesktopWidget, DesktopConfig } from '../types';

export const DesktopPage: React.FC = () => {
    const { 
        settings, updateDesktopConfig, rooms, bookings, 
        notifications, invoices, currentUser,
        addNotification
    } = useHotel();
    
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update clock every second
    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const stats = useMemo(() => {
        const occupied = rooms.filter(r => r.status === 'occupied').length;
        const occupancyRate = Math.round((occupied / rooms.length) * 100);
        const todayBookings = bookings.filter(b => b.checkInDate?.startsWith(new Date().toISOString().split('T')[0])).length;
        return { occupied, occupancyRate, todayBookings };
    }, [rooms, bookings]);

    const recentBookings = useMemo(() => {
        return [...bookings]
            .sort((a, b) => b.id.localeCompare(a.id))
            .slice(0, 5)
            .map(b => ({
                ...b,
                roomNumber: rooms.find(r => r.id === b.roomId)?.number || b.roomId.toString()
            }));
    }, [bookings, rooms]);

    const handleToggleWidget = (id: string) => {
        const updatedWidgets = settings.desktopConfig.widgets.map(w => 
            w.id === id ? { ...w, isVisible: !w.isVisible } : w
        );
        updateDesktopConfig({ widgets: updatedWidgets });
    };

    const handleMoveWidget = (id: string, direction: 'up' | 'down') => {
        const widgets = [...settings.desktopConfig.widgets];
        const index = widgets.findIndex(w => w.id === id);
        if (direction === 'up' && index > 0) {
            [widgets[index], widgets[index - 1]] = [widgets[index - 1], widgets[index]];
        } else if (direction === 'down' && index < widgets.length - 1) {
            [widgets[index], widgets[index + 1]] = [widgets[index + 1], widgets[index]];
        }
        updateDesktopConfig({ widgets: widgets.map((w, i) => ({ ...w, position: i })) });
    };

    const renderWidget = (widget: DesktopWidget) => {
        if (!widget.isVisible && !isCustomizing) return null;

        const baseClass = `relative rounded-3xl p-6 transition-all duration-300 ${
            !widget.isVisible ? 'opacity-40 grayscale' : ''
        } ${
            settings.darkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-black/5'
        } border backdrop-blur-xl shadow-xl hover:shadow-2xl group`;

        const sizeClass = widget.size === 'sm' ? 'col-span-1' : widget.size === 'md' ? 'col-span-2' : 'col-span-3';

        return (
            <motion.div 
                key={widget.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`${baseClass} ${sizeClass}`}
            >
                {isCustomizing && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                        <button 
                            onClick={() => handleToggleWidget(widget.id)}
                            className={`p-2 rounded-full ${widget.isVisible ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}
                        >
                            {widget.isVisible ? <CheckCircle2 size={16} /> : <X size={16} />}
                        </button>
                        <button 
                            onClick={() => handleMoveWidget(widget.id, 'up')}
                            className="p-2 rounded-full bg-white/50 text-gray-600 hover:bg-white"
                        >
                            <RefreshCw size={16} className="rotate-180" />
                        </button>
                    </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                        {widget.type === 'clock' && <Clock size={20} />}
                        {widget.type === 'stats' && <TrendingUp size={20} />}
                        {widget.type === 'quick_actions' && <Plus size={20} />}
                        {widget.type === 'recent_bookings' && <Calendar size={20} />}
                        {widget.type === 'notifications' && <Bell size={20} />}
                    </div>
                    <h3 className="font-bold text-lg">{widget.title}</h3>
                </div>

                {widget.type === 'clock' && (
                    <div className="text-center py-4">
                        <div className="text-5xl font-black tracking-tighter mb-1">
                            {currentTime.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-sm font-medium opacity-60">
                            {currentTime.toLocaleDateString('ar-DZ', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                    </div>
                )}

                {widget.type === 'stats' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-black/5">
                            <div className="text-2xl font-black">{stats.occupancyRate}%</div>
                            <div className="text-xs opacity-60">نسبة الإشغال</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-black/5">
                            <div className="text-2xl font-black">{stats.todayBookings}</div>
                            <div className="text-xs opacity-60">حجوزات اليوم</div>
                        </div>
                    </div>
                )}

                {widget.type === 'quick_actions' && (
                    <div className="grid grid-cols-2 gap-2">
                        <button className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600 transition">
                            <Plus size={20} />
                            <span className="text-[10px] font-bold">حجز جديد</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 transition">
                            <LogIn size={20} />
                            <span className="text-[10px] font-bold">دخول</span>
                        </button>
                    </div>
                )}

                {widget.type === 'recent_bookings' && (
                    <div className="space-y-3">
                        {recentBookings.map(b => (
                            <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-black/5 hover:bg-black/10 transition cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-emerald-600">
                                        {b.roomNumber}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">{b.primaryGuestName}</div>
                                        <div className="text-[10px] opacity-60">{b.checkInDate}</div>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="opacity-40" />
                            </div>
                        ))}
                    </div>
                )}

                {widget.type === 'notifications' && (
                    <div className="space-y-2">
                        {notifications.slice(0, 3).map(n => (
                            <div key={n.id} className="flex gap-3 p-3 rounded-xl bg-black/5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                <div className="text-xs font-medium line-clamp-2">{n.message}</div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <div className={`min-h-screen pt-16 px-8 pb-8 transition-colors duration-500 ${
            settings.darkMode ? 'bg-[#001517]' : 'bg-slate-50'
        }`}>
            {/* Desktop Header */}
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <Monitor size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">مكتب الاستقبال الذكي</h1>
                        <p className="text-sm font-medium opacity-60 flex items-center gap-2">
                            <Sparkles size={14} className="text-emerald-500" />
                            مرحباً بك، {currentUser?.name}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsCustomizing(!isCustomizing)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                            isCustomizing 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                            : 'bg-white text-gray-900 border border-black/5 hover:bg-gray-50'
                        }`}
                    >
                        <Layout size={20} />
                        {isCustomizing ? 'حفظ التغييرات' : 'تخصيص المكتب'}
                    </button>
                    
                    <div className="flex items-center gap-1 p-1 bg-white rounded-2xl border border-black/5">
                        <button className="p-2 rounded-xl hover:bg-gray-100 transition"><Search size={20} /></button>
                        <button className="p-2 rounded-xl hover:bg-gray-100 transition"><Bell size={20} /></button>
                        <button className="p-2 rounded-xl hover:bg-gray-100 transition"><Settings size={20} /></button>
                    </div>
                </div>
            </div>

            {/* Desktop Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                    {settings.desktopConfig.widgets
                        .sort((a, b) => a.position - b.position)
                        .map(renderWidget)}
                </AnimatePresence>
                
                {isCustomizing && (
                    <motion.button 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="col-span-1 border-2 border-dashed border-emerald-500/30 rounded-3xl flex flex-col items-center justify-center gap-3 p-8 text-emerald-600 hover:bg-emerald-500/5 transition group"
                    >
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition">
                            <Plus size={24} />
                        </div>
                        <span className="font-bold">إضافة ودجت</span>
                    </motion.button>
                )}
            </div>

            {/* Quick Access Bar */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-white/80 backdrop-blur-2xl border border-black/5 rounded-[2.5rem] shadow-2xl z-40">
                {[
                    { icon: <Users size={20} />, label: 'النزلاء' },
                    { icon: <BedDouble size={20} />, label: 'الغرف' },
                    { icon: <Receipt size={20} />, label: 'الفواتير' },
                    { icon: <Shield size={20} />, label: 'الأمن' },
                    { icon: <LayoutGrid size={20} />, label: 'التطبيقات' }
                ].map((item, i) => (
                    <button key={i} className="flex flex-col items-center gap-1 px-5 py-3 rounded-[2rem] hover:bg-black/5 transition group">
                        <div className="text-gray-600 group-hover:text-emerald-600 transition">{item.icon}</div>
                        <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
