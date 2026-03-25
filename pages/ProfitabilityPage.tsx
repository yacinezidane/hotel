import React, { useMemo } from 'react';
import { useHotel } from '../context/HotelContext';
import { TrendingUp, DollarSign, PieChart, Target, ArrowUp, ArrowDown, Zap, Users, ShoppingBag } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export const ProfitabilityPage = () => {
    const { settings, transactions, bookings, rooms } = useHotel();

    const getThemeStyles = () => {
        if (settings.darkMode) {
            if (settings.theme === 'zellige') {
                return {
                    bg: 'bg-[#001e21]',
                    card: 'bg-[#002a2d] border border-[#cca43b]/30 relative overflow-hidden',
                    text: 'text-[#f0c04a]',
                    subtext: 'text-[#cca43b]/70',
                    accent: 'text-[#cca43b]',
                    button: 'bg-[#cca43b] text-[#001e21] hover:bg-[#b08d30]',
                    pattern: 'bg-zellige-pattern opacity-10 mix-blend-screen',
                    chartColor: '#cca43b'
                };
            }
        }
        if (settings.theme === 'zellige') {
            return {
                bg: 'bg-[#FDFBF7]',
                card: 'bg-white border border-[#cca43b]/40 relative overflow-hidden',
                text: 'text-[#006269]',
                subtext: 'text-[#cca43b]',
                accent: 'text-[#006269]',
                button: 'bg-[#006269] text-[#cca43b] hover:bg-[#004d53]',
                pattern: 'bg-zellige-pattern opacity-5 mix-blend-multiply',
                chartColor: '#006269'
            };
        }
        return {
            bg: 'bg-gray-50 dark:bg-gray-900',
            card: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
            text: 'text-gray-900 dark:text-white',
            subtext: 'text-gray-500 dark:text-gray-400',
            accent: 'text-blue-600',
            button: 'bg-blue-600 text-white hover:bg-blue-700',
            pattern: '',
            chartColor: '#2563eb'
        };
    };

    const ts = getThemeStyles();

    const { revenueData, kpis } = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Calculate monthly data for the last 6 months
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(currentYear, currentMonth - i, 1);
            const monthName = d.toLocaleString('ar-DZ', { month: 'short' });
            
            const monthTransactions = transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear();
            });

            const revenue = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

            monthlyData.push({ name: monthName, revenue, expenses });
        }

        // Calculate KPIs
        const totalRevenue = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const totalProfit = totalRevenue - totalExpenses;
        const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0.0';
        
        const activeBookings = bookings.filter(b => b.status === 'active');
        const revPAR = rooms.length > 0 ? (totalRevenue / rooms.length).toFixed(0) : '0';

        // Mock changes for demonstration
        const kpis = [
            { label: 'إجمالي الأرباح', value: `${totalProfit.toLocaleString()} د.ج`, change: '+12%', icon: DollarSign, positive: true },
            { label: 'هامش الربح', value: `${profitMargin}%`, change: '+2.1%', icon: PieChart, positive: true },
            { label: 'متوسط العائد للغرفة (RevPAR)', value: `${Number(revPAR).toLocaleString()} د.ج`, change: '+5.4%', icon: Target, positive: true },
            { label: 'التكاليف التشغيلية', value: `${totalExpenses.toLocaleString()} د.ج`, change: '-5%', icon: Zap, positive: true },
        ];

        return { revenueData: monthlyData, kpis };
    }, [transactions, bookings, rooms]);

    return (
        <div className={`min-h-screen p-6 pb-24 ${ts.bg} transition-colors duration-300`}>
            {/* Header */}
            <div className={`rounded-[2.5rem] p-8 mb-8 shadow-xl relative overflow-hidden ${ts.card}`}>
                {settings.theme === 'zellige' && <div className={`absolute inset-0 pointer-events-none ${ts.pattern}`}></div>}
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 opacity-80">
                        <TrendingUp size={20} className={ts.accent} />
                        <span className={`text-xs font-bold uppercase tracking-widest ${ts.subtext}`}>Profitability Engine</span>
                    </div>
                    <h1 className={`text-4xl font-black tracking-tight mb-2 ${ts.text}`}>محرك الربحية الذكي</h1>
                    <p className={`font-medium text-sm max-w-xl ${ts.subtext}`}>
                        تحليلات متقدمة وتوصيات مدعومة بالذكاء الاصطناعي لزيادة الإيرادات وتقليل التكاليف التشغيلية.
                    </p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {kpis.map((kpi, idx) => (
                    <div key={idx} className={`p-6 rounded-[2rem] shadow-sm border ${ts.card}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${settings.darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                                <kpi.icon size={24} className={ts.accent} />
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${kpi.positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {kpi.positive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                                {kpi.change}
                            </div>
                        </div>
                        <div className={`text-3xl font-black mb-1 ${ts.text}`}>{kpi.value}</div>
                        <div className={`text-xs font-bold ${ts.subtext}`}>{kpi.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className={`lg:col-span-2 rounded-[2.5rem] p-6 shadow-lg ${ts.card}`}>
                    <h3 className={`text-xl font-bold mb-6 ${ts.text}`}>تحليل الإيرادات والمصروفات</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={ts.chartColor} stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor={ts.chartColor} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="name" stroke={settings.darkMode ? '#888' : '#666'} fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke={settings.darkMode ? '#888' : '#666'} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: settings.darkMode ? '#001e21' : '#fff', 
                                        borderRadius: '16px', 
                                        border: 'none', 
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)' 
                                    }} 
                                />
                                <Area type="monotone" dataKey="revenue" stroke={ts.chartColor} strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Recommendations */}
                <div className={`rounded-[2.5rem] p-6 shadow-lg ${ts.card}`}>
                    <div className="flex items-center gap-2 mb-6">
                        <Zap size={24} className="text-yellow-500" fill="currentColor" />
                        <h3 className={`text-xl font-bold ${ts.text}`}>توصيات الذكاء الاصطناعي</h3>
                    </div>
                    
                    <div className="space-y-4">
                        {[
                            { title: 'رفع الأسعار في عطلة نهاية الأسبوع', desc: 'تشير التوقعات إلى زيادة الطلب بنسبة 40%. نقترح زيادة السعر الأساسي بمقدار 15$.', impact: 'عالي', type: 'pricing' },
                            { title: 'باقة العشاء الرومانسي', desc: 'النزلاء في الأجنحة يطلبون خدمة الغرف كثيراً. اعرض عليهم باقة عشاء خاصة.', impact: 'متوسط', type: 'upsell' },
                            { title: 'تقليل طاقم التنظيف يوم الثلاثاء', desc: 'نسبة الإشغال منخفضة يوم الثلاثاء القادم. يمكن تقليل عدد الموظفين.', impact: 'منخفض', type: 'cost' }
                        ].map((rec, idx) => (
                            <div key={idx} className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] cursor-pointer ${settings.darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                                        rec.type === 'pricing' ? 'bg-blue-100 text-blue-700' :
                                        rec.type === 'upsell' ? 'bg-purple-100 text-purple-700' :
                                        'bg-orange-100 text-orange-700'
                                    }`}>
                                        {rec.type === 'pricing' ? 'تسعير ديناميكي' : rec.type === 'upsell' ? 'فرصة بيع' : 'توفير تكاليف'}
                                    </div>
                                    <div className={`text-[10px] font-bold ${rec.impact === 'عالي' ? 'text-green-500' : 'text-yellow-500'}`}>
                                        تأثير {rec.impact}
                                    </div>
                                </div>
                                <h4 className={`font-bold text-sm mb-1 ${ts.text}`}>{rec.title}</h4>
                                <p className={`text-xs opacity-70 ${ts.subtext}`}>{rec.desc}</p>
                            </div>
                        ))}
                    </div>
                    
                    <button className={`w-full mt-6 py-3 rounded-xl font-bold text-sm ${ts.button}`}>
                        تطبيق التوصيات المختارة
                    </button>
                </div>
            </div>
        </div>
    );
};
