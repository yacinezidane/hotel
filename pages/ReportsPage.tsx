
import React, { useMemo, useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    AreaChart, Area, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { 
    TrendingUp, PieChart as PieIcon, Download, Calendar, Filter, 
    ArrowUp, ArrowDown, Target, Award, Zap, Crown 
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
    const { invoices, bookings, rooms, settings, transactions, restaurantOrders, hallBookings, poolPasses } = useHotel();
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

    // --- Theme Styles Helper ---
    const getThemeStyles = () => {
        if (settings.darkMode) {
            if (settings.theme === 'zellige') {
                return {
                    card: 'bg-[#001e21] border border-[#cca43b]/20 text-[#f0c04a]',
                    textPrimary: 'text-[#f0c04a]',
                    textSecondary: 'text-[#cca43b]/70',
                    buttonActive: 'bg-[#cca43b] text-[#001e21]',
                    buttonInactive: 'text-[#cca43b]/60 hover:bg-[#cca43b]/10',
                    banner: 'bg-[#002a2d] border-[#cca43b]/30 text-[#f0c04a]',
                    bannerIcon: 'text-[#f0c04a]',
                    bannerText: 'text-[#cca43b]/80',
                    chartTooltip: 'bg-[#001e21] border-[#cca43b]/20 text-[#f0c04a]'
                };
            }
            return {
                card: 'bg-gray-800 border border-gray-700 text-white',
                textPrimary: 'text-white',
                textSecondary: 'text-gray-400',
                buttonActive: 'bg-white text-black',
                buttonInactive: 'text-gray-400 hover:bg-gray-700',
                banner: 'bg-gradient-to-r from-blue-900 to-indigo-900 border-none text-white',
                bannerIcon: 'text-yellow-300',
                bannerText: 'text-blue-100',
                chartTooltip: 'bg-gray-800 border-gray-700 text-gray-200'
            };
        }

        if (settings.theme === 'zellige') {
            return {
                card: 'bg-[#FDFBF7] border border-[#cca43b]/40 text-[#006269]',
                textPrimary: 'text-[#006269]',
                textSecondary: 'text-[#006269]/70',
                buttonActive: 'bg-[#006269] text-[#cca43b]',
                buttonInactive: 'text-[#006269]/60 hover:bg-[#cca43b]/10',
                banner: 'bg-[#FDFBF7] border-[#cca43b] text-[#006269]',
                bannerIcon: 'text-[#cca43b]',
                bannerText: 'text-gray-600',
                chartTooltip: 'bg-white border-[#cca43b]/20 text-[#006269]'
            };
        }

        return {
            card: 'bg-white border border-gray-100 text-gray-900',
            textPrimary: 'text-gray-900',
            textSecondary: 'text-gray-500',
            buttonActive: 'bg-gray-900 text-white',
            buttonInactive: 'text-gray-500 hover:bg-gray-100',
            banner: 'bg-gradient-to-r from-blue-600 to-indigo-700 border-none text-white',
            bannerIcon: 'text-yellow-300',
            bannerText: 'text-blue-100',
            chartTooltip: 'bg-white border-gray-100 text-gray-700'
        };
    };
    const ts = getThemeStyles();

    // --- Helper for Theme Colors ---
    const getThemeColors = () => {
        switch (settings.theme) {
            case 'zellige': return ['#006269', '#cca43b', '#d97706', '#f59e0b'];
            case 'zellige-v2': return ['#024d38', '#c6e3d8', '#10b981', '#34d399'];
            case 'instagram': return ['#833AB4', '#FD1D1D', '#FCAF45', '#E1306C'];
            case 'rose': return ['#be123c', '#fb7185', '#fda4af', '#f43f5e'];
            default: return ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd']; // Blue default
        }
    };
    const COLORS = getThemeColors();

    // --- Data Processing ---

    // 1. Revenue Sources (Pie Chart)
    const revenueSources = useMemo(() => {
        const roomRevenue = bookings.filter(b => b.status === 'completed' || b.status === 'active').reduce((acc, b) => acc + b.totalAmount, 0);
        const restaurantRevenue = restaurantOrders.filter(o => o.status === 'completed').reduce((acc, o) => acc + o.totalAmount, 0);
        const hallRevenue = hallBookings.filter(h => h.status === 'confirmed').reduce((acc, h) => acc + h.price, 0);
        const poolRevenue = poolPasses.filter(p => p.isValid).reduce((acc, p) => acc + p.price, 0);

        return [
            { name: 'الإقامة', value: roomRevenue },
            { name: 'المطعم', value: restaurantRevenue },
            { name: 'القاعات', value: hallRevenue },
            { name: 'المسبح', value: poolRevenue },
        ].filter(item => item.value > 0);
    }, [bookings, restaurantOrders, hallBookings, poolPasses]);

    // 2. Weekly Revenue Trend (Area Chart)
    const weeklyTrend = useMemo(() => {
        const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        // Mocking distribution for demo purposes based on invoices dates
        // In a real app, you would aggregate by actual invoice date
        return days.map((day, index) => ({
            name: day,
            income: Math.floor(Math.random() * 50000) + 10000, // Simulated data for visual appeal
            expense: Math.floor(Math.random() * 20000) + 5000,
        }));
    }, []);

    // 3. Room Type Popularity (Bar Chart)
    const roomPopularity = useMemo(() => {
        const counts = { single: 0, double: 0, suite: 0, vip: 0 };
        bookings.forEach(b => {
            const room = rooms.find(r => r.id === b.roomId);
            if (room) counts[room.type]++;
        });
        return [
            { name: 'فردية', count: counts.single },
            { name: 'مزدوجة', count: counts.double },
            { name: 'أجنحة', count: counts.suite },
            { name: 'VIP', count: counts.vip },
        ];
    }, [bookings, rooms]);

    // 4. Key Performance Indicators (KPIs)
    const kpis = useMemo(() => {
        const totalRevenue = invoices.reduce((acc, i) => acc + i.amount, 0);
        const totalBookings = bookings.length;
        const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
        
        return {
            totalRevenue,
            totalBookings,
            avgBookingValue,
            growth: '+15%' // Simulated
        };
    }, [invoices, bookings]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className={`p-4 rounded-xl shadow-xl border text-right ${ts.chartTooltip}`}>
                    <p className={`font-bold mb-2 ${ts.textPrimary}`}>{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm font-mono font-bold" style={{ color: entry.color }}>
                            {entry.name}: {entry.value.toLocaleString()}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="flex-1 w-full">
                    <PageHeader pageKey="reports" defaultTitle="التقارير والتحليلات الذكية" icon={PieIcon} />
                </div>
                <div className="mb-8 flex gap-3">
                    <div className={`p-1 rounded-xl shadow-sm flex ${ts.card}`}>
                        <button 
                            onClick={() => setTimeRange('week')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${timeRange === 'week' ? ts.buttonActive : ts.buttonInactive}`}
                        >
                            أسبوعي
                        </button>
                        <button 
                            onClick={() => setTimeRange('month')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${timeRange === 'month' ? ts.buttonActive : ts.buttonInactive}`}
                        >
                            شهري
                        </button>
                        <button 
                            onClick={() => setTimeRange('year')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${timeRange === 'year' ? ts.buttonActive : ts.buttonInactive}`}
                        >
                            سنوي
                        </button>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 hover:bg-blue-700 transition">
                        <Download size={18} /> تصدير PDF
                    </button>
                </div>
            </div>

            {/* Smart Insights Banner (AI Simulation) */}
            <div className={`p-6 rounded-[2rem] border relative overflow-hidden flex flex-col md:flex-row items-center gap-6 shadow-sm ${ts.banner}`}>
                <div className="p-4 bg-white/20 rounded-full backdrop-blur-md animate-pulse">
                    <Zap size={32} className={ts.bannerIcon} fill="currentColor" />
                </div>
                <div className="flex-1 text-center md:text-right">
                    <h3 className={`text-xl font-black mb-1 ${ts.textPrimary}`}>رؤى ذكية للنظام</h3>
                    <p className={`text-sm font-medium opacity-90 ${ts.bannerText}`}>
                        أداء الفندق ممتاز هذا الأسبوع! ارتفعت إيرادات المطعم بنسبة 20% مقارنة بالشهر الماضي، وتعتبر الأجنحة (Suites) الأكثر طلباً حالياً.
                    </p>
                </div>
                {settings.theme === 'zellige' && <div className={`absolute inset-0 bg-zellige-pattern pointer-events-none ${settings.darkMode ? 'opacity-10 mix-blend-overlay' : 'opacity-10 mix-blend-multiply'}`}></div>}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className={`p-6 rounded-[2rem] shadow-sm relative overflow-hidden group ${ts.card}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className={`text-xs font-bold uppercase ${ts.textSecondary}`}>إجمالي الإيرادات</p>
                            <h3 className={`text-2xl font-black mt-1 ${ts.textPrimary}`}>{kpis.totalRevenue.toLocaleString()} د.ج</h3>
                        </div>
                        <div className="bg-green-100 text-green-600 p-2 rounded-xl">
                            <ArrowUp size={20} />
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 dark:bg-gray-700">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                </div>

                <div className={`p-6 rounded-[2rem] shadow-sm relative overflow-hidden group ${ts.card}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className={`text-xs font-bold uppercase ${ts.textSecondary}`}>متوسط الحجز</p>
                            <h3 className={`text-2xl font-black mt-1 ${ts.textPrimary}`}>{Math.round(kpis.avgBookingValue).toLocaleString()} د.ج</h3>
                        </div>
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-xl">
                            <Target size={20} />
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 dark:bg-gray-700">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '55%' }}></div>
                    </div>
                </div>

                <div className={`p-6 rounded-[2rem] shadow-sm relative overflow-hidden group ${ts.card}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className={`text-xs font-bold uppercase ${ts.textSecondary}`}>عدد الحجوزات</p>
                            <h3 className={`text-2xl font-black mt-1 ${ts.textPrimary}`}>{kpis.totalBookings}</h3>
                        </div>
                        <div className="bg-purple-100 text-purple-600 p-2 rounded-xl">
                            <Calendar size={20} />
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 dark:bg-gray-700">
                        <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                </div>

                <div className={`p-6 rounded-[2rem] shadow-sm relative overflow-hidden group ${ts.card}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className={`text-xs font-bold uppercase ${ts.textSecondary}`}>الخدمة الأفضل</p>
                            <h3 className={`text-2xl font-black mt-1 ${ts.textPrimary}`}>المطعم</h3>
                        </div>
                        <div className="bg-yellow-100 text-yellow-600 p-2 rounded-xl">
                            <Award size={20} />
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 dark:bg-gray-700">
                        <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                </div>
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. Revenue Trends (Big Chart) */}
                <div className={`lg:col-span-2 p-8 rounded-[2.5rem] shadow-sm ${ts.card}`}>
                    <div className="flex justify-between items-center mb-8">
                        <h3 className={`text-xl font-bold flex items-center gap-2 ${ts.textPrimary}`}>
                            <TrendingUp className="text-blue-500" /> تحليل الأداء المالي
                        </h3>
                    </div>
                    <div className="h-[300px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyTrend}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" />
                                <Area type="monotone" dataKey="income" name="الدخل" stroke={COLORS[0]} strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                <Area type="monotone" dataKey="expense" name="المصروفات" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Revenue Sources (Donut) */}
                <div className={`p-8 rounded-[2.5rem] shadow-sm ${ts.card}`}>
                    <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${ts.textPrimary}`}>
                        <PieIcon className="text-purple-500" /> مصادر الدخل
                    </h3>
                    <div className="h-[250px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={revenueSources}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {revenueSources.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Label */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className={`text-3xl font-black ${ts.textPrimary}`}>
                                {revenueSources.length}
                            </span>
                            <span className={`text-xs font-bold uppercase ${ts.textSecondary}`}>مصادر</span>
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                        {revenueSources.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className={`font-bold ${ts.textPrimary}`}>{item.name}</span>
                                </div>
                                <span className={`font-mono ${ts.textSecondary}`}>{item.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. Room Type Popularity (Bar) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className={`p-8 rounded-[2.5rem] shadow-sm ${ts.card}`}>
                    <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${ts.textPrimary}`}>
                        <Filter className="text-orange-500" /> أنواع الغرف الأكثر طلباً
                    </h3>
                    <div className="h-[250px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={roomPopularity}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" name="عدد الحجوزات" fill={COLORS[1]} radius={[10, 10, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Top Performing Staff (Gamification) */}
                <div className={`p-8 rounded-[2.5rem] shadow-sm flex flex-col ${ts.card}`}>
                    <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${ts.textPrimary}`}>
                        <Award className="text-yellow-500" /> الموظف المثالي (هذا الشهر)
                    </h3>
                    
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 p-1">
                                <img src="https://ui-avatars.com/api/?name=Ali+Ahmed&background=random" className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-800" alt="Best Staff" />
                            </div>
                            <div className="absolute -bottom-3 -right-3 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md">
                                <Crown size={20} className="text-yellow-500 fill-current" />
                            </div>
                        </div>
                        <h4 className={`text-2xl font-black ${ts.textPrimary}`}>علي أحمد</h4>
                        <p className={`font-bold mb-4 ${ts.textSecondary}`}>موظف استقبال</p>
                        
                        <div className="flex gap-4 w-full">
                            <div className={`flex-1 p-3 rounded-2xl ${settings.theme === 'zellige' && settings.darkMode ? 'bg-[#002a2d]' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                                <span className="block text-2xl font-black text-blue-600">42</span>
                                <span className={`text-xs font-bold ${ts.textSecondary}`}>حجز منجز</span>
                            </div>
                            <div className={`flex-1 p-3 rounded-2xl ${settings.theme === 'zellige' && settings.darkMode ? 'bg-[#002a2d]' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                                <span className="block text-2xl font-black text-green-600">98%</span>
                                <span className={`text-xs font-bold ${ts.textSecondary}`}>تقييم العملاء</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
