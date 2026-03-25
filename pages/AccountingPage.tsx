
import React, { useState, useMemo } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { 
  Briefcase, TrendingUp, TrendingDown, DollarSign, Filter, Download, PlusCircle, 
  User, Calendar, FileText, CheckCircle, Wrench, Users, ShoppingBag, LayoutDashboard,
  Wallet, PieChart, X, Calculator, CreditCard, Landmark, Banknote, BarChart3, Clock
} from 'lucide-react';
import { Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

export const AccountingPage: React.FC = () => {
  const { transactions, users, currentUser, addTransaction, clearUserBalance, settings, bookings, rooms, addNotification } = useHotel();
  
  // Tabs Configuration
  const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'expenses' | 'salaries' | 'maintenance' | 'forecast'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);

  // Colors for Charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Forecast Logic
  const forecastStats = useMemo(() => {
      const activeRevenue = bookings.filter(b => b.status === 'active').reduce((acc, b) => acc + b.totalAmount, 0);
      const pendingRevenue = bookings.filter(b => b.status === 'pending').reduce((acc, b) => acc + b.totalAmount, 0);
      const occupancyRate = rooms.length > 0 ? (bookings.filter(b => b.status === 'active').length / rooms.length) * 100 : 0;
      return { activeRevenue, pendingRevenue, occupancyRate };
  }, [bookings, rooms]);

  // New Transaction State
  const [newTrans, setNewTrans] = useState({
      amount: '',
      type: 'expense' as 'income' | 'expense' | 'deduction',
      category: 'other',
      paymentMethod: 'cash' as 'cash' | 'card' | 'transfer' | 'check', // New
      description: '',
      notes: '',
      targetUserId: '' // For deductions
  });

  const hasAuditPermission = currentUser?.role === 'manager' || currentUser?.role === 'assistant_manager';
  const canClearSettlements = currentUser?.permissions.canClearSettlements || currentUser?.permissions.allowedActions?.includes('clear_balance') || currentUser?.role === 'manager';

  // --- Theme Helper ---
  const getThemeStyles = () => {
      // Radical Fix: Dark mode overrides all themes for consistency but respects theme identity
      if (settings.darkMode) {
          if (settings.theme === 'zellige') {
              return {
                  modalHeader: 'bg-[#002a2d] text-[#f0c04a] border-b border-[#cca43b]/20',
                  modalBg: 'bg-[#001e21] text-[#f0c04a]',
                  badgePattern: 'bg-zellige-pattern opacity-10 mix-blend-overlay',
                  modalInput: 'border-[#cca43b]/40 focus:border-[#f0c04a] bg-[#001517] text-[#f0c04a] placeholder-[#cca43b]/40',
                  inputLabel: 'text-[#cca43b]/80',
                  button: 'bg-[#cca43b] text-[#001e21] hover:bg-[#b08d30] font-bold',
                  tableHeader: 'bg-[#002a2d] border-b border-[#cca43b]/20 text-[#f0c04a]',
                  tableContainer: 'bg-[#001e21] border-[#cca43b]/20 text-[#f0c04a]',
                  tableRow: 'hover:bg-[#cca43b]/10 border-b border-[#cca43b]/10',
                  activeTab: 'bg-[#cca43b] text-[#001e21] border-[#cca43b] shadow-md',
                  inactiveTab: 'bg-[#002a2d] text-[#cca43b]/60 border-[#cca43b]/20 hover:bg-[#cca43b]/10'
              };
          }
          if (settings.theme === 'algerian-military') {
              return {
                  modalHeader: 'bg-[#1a211a] text-[#D4AF37] border-b border-[#D4AF37]/30',
                  modalBg: 'bg-[#0f140f] text-[#D4AF37]',
                  badgePattern: 'bg-military-pattern opacity-20',
                  modalInput: 'border-[#D4AF37]/40 focus:border-[#D4AF37] bg-[#0f140f] text-[#D4AF37]',
                  inputLabel: 'text-[#D4AF37]/80',
                  button: 'bg-[#D4AF37] text-[#1a211a] hover:bg-[#b08d30] border border-[#D4AF37]',
                  tableHeader: 'bg-[#1a211a] border-b border-[#D4AF37]/20 text-[#D4AF37]',
                  tableContainer: 'bg-[#0f140f] border-[#D4AF37]/20 text-[#D4AF37]',
                  tableRow: 'hover:bg-[#D4AF37]/10 border-b border-[#D4AF37]/10',
                  activeTab: 'bg-[#D4AF37] text-[#1a211a] border border-[#D4AF37]',
                  inactiveTab: 'bg-[#1a211a] text-[#D4AF37]/60 border-[#D4AF37]/30'
              };
          }
          if (settings.theme === 'modern-ornate') {
              return {
                  modalHeader: 'bg-[#2d0b3d] text-[#ffd700] border-b border-[#ffd700]/30',
                  modalBg: 'bg-[#2d0b3d] text-[#ffd700]',
                  badgePattern: 'bg-ornate-pattern opacity-20',
                  modalInput: 'border-[#ffd700]/40 focus:border-[#ffd700] bg-[#1a0524] text-[#ffd700]',
                  inputLabel: 'text-[#ffd700]/80',
                  button: 'bg-[#ffd700] text-[#2d0b3d] hover:bg-[#e6c200] border border-[#ffd700]',
                  tableHeader: 'bg-[#2d0b3d] border-b border-[#ffd700]/20 text-[#ffd700]',
                  tableContainer: 'bg-[#2d0b3d] border-[#ffd700]/20 text-[#ffd700]',
                  tableRow: 'hover:bg-[#ffd700]/10 border-b border-[#ffd700]/10',
                  activeTab: 'bg-[#ffd700] text-[#2d0b3d] border border-[#ffd700]',
                  inactiveTab: 'bg-[#2d0b3d] text-[#ffd700]/60 border-[#ffd700]/30'
              };
          }
          return {
              modalHeader: 'bg-gray-800 text-white border-b border-gray-700',
              modalBg: 'bg-gray-900 text-white',
              badgePattern: '',
              modalInput: 'border-gray-700 focus:border-blue-500 bg-gray-800 text-white placeholder-gray-500',
              inputLabel: 'text-gray-400',
              button: 'bg-blue-600 text-white hover:bg-blue-700',
              tableHeader: 'bg-gray-800 text-gray-300 border-b border-gray-700',
              tableContainer: 'bg-gray-800 border-gray-700 text-gray-100',
              tableRow: 'hover:bg-gray-700/50 border-b border-gray-700',
              activeTab: 'bg-gray-700 text-white shadow-lg border-gray-600',
              inactiveTab: 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
          };
      }

      switch (settings.theme) {
          case 'zellige': return {
              modalHeader: 'bg-[#006269] text-[#cca43b] border-b-8 border-[#cca43b]',
              modalBg: 'bg-[#FDFBF7]',
              badgePattern: 'bg-zellige-pattern',
              modalInput: 'border-[#cca43b]/40 focus:border-[#006269] focus:ring-[#006269]/20 bg-[#fbf8f1] text-[#006269] placeholder-[#006269]/40',
              inputLabel: 'text-[#006269]',
              button: 'bg-[#006269] text-[#cca43b] hover:bg-[#004d53]',
              tableHeader: 'bg-[#fbf8f1] border-b-2 border-[#cca43b]/30 text-[#006269]',
              tableContainer: 'bg-white border-[#cca43b]/20 text-[#006269]',
              tableRow: 'hover:bg-[#cca43b]/5 border-b border-[#cca43b]/10',
              activeTab: 'bg-[#006269] text-[#cca43b] shadow-md',
              inactiveTab: 'bg-[#fbf8f1] text-[#006269] hover:bg-[#cca43b]/10'
          };
          case 'algerian-military': return {
              modalHeader: 'bg-[#2F3E2E] text-[#D4AF37] border-b-4 border-[#D4AF37]',
              modalBg: 'bg-[#F0EFEA]',
              badgePattern: 'bg-military-pattern',
              modalInput: 'border-[#D4AF37]/40 focus:border-[#2F3E2E] bg-[#F0EFEA] text-[#2F3E2E]',
              inputLabel: 'text-[#2F3E2E]',
              button: 'bg-[#2F3E2E] text-[#D4AF37] hover:bg-[#4B5320] border border-[#D4AF37]',
              tableHeader: 'bg-[#E5E5E0] border-b border-[#D4AF37]/40 text-[#2F3E2E]',
              activeTab: 'bg-[#2F3E2E] text-[#D4AF37] border border-[#D4AF37]',
              inactiveTab: 'bg-[#E5E5E0] text-[#2F3E2E] border-[#D4AF37]/30'
          };
          case 'modern-ornate': return {
              modalHeader: 'bg-[#4a148c] text-[#ffd700] border-b-4 border-[#ffd700]',
              modalBg: 'bg-[#f3e5f5]',
              badgePattern: 'bg-ornate-pattern',
              modalInput: 'border-[#ffd700]/40 focus:border-[#4a148c] bg-white text-[#4a148c]',
              inputLabel: 'text-[#4a148c]',
              button: 'bg-[#4a148c] text-[#ffd700] hover:bg-[#380d6b] border border-[#ffd700]',
              tableHeader: 'bg-white border-b border-[#ffd700]/40 text-[#4a148c]',
              activeTab: 'bg-[#4a148c] text-[#ffd700] border border-[#ffd700]',
              inactiveTab: 'bg-[#f3e5f5] text-[#4a148c] border-[#ffd700]/30'
          };
          default: return {
              modalHeader: 'bg-slate-900 text-white border-b border-gray-700',
              modalBg: 'bg-white dark:bg-gray-900',
              badgePattern: 'bg-gray-100/50',
              modalInput: 'border-gray-200 dark:border-gray-600 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
              inputLabel: 'text-gray-500 dark:text-gray-400',
              button: 'bg-blue-600 text-white hover:bg-blue-700',
              tableHeader: 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 border-b border-gray-100 dark:border-gray-600',
              activeTab: 'bg-blue-600 text-white shadow-md',
              inactiveTab: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          };
      }
  };
  const ts = getThemeStyles();

  const currentData = useMemo(() => {
    return transactions.filter(t => {
      if (activeTab === 'overview') return true;
      if (activeTab === 'income') return t.type === 'income';
      if (activeTab === 'expenses') return t.type === 'expense';
      if (activeTab === 'salaries') return t.category === 'salary' || t.category === 'deduction' || t.category === 'bonus';
      if (activeTab === 'maintenance') return t.category === 'maintenance';
      return true;
    });
  }, [transactions, activeTab]);

  const stats = useMemo(() => {
    return {
        income: transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
        expenses: transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
        salaries: transactions.filter(t => t.category === 'salary' || t.category === 'bonus').reduce((acc, t) => acc + t.amount, 0),
        maintenance: transactions.filter(t => t.category === 'maintenance').reduce((acc, t) => acc + t.amount, 0)
    };
  }, [transactions]);

  const forecastChartData = useMemo(() => [
      { name: 'الشهر الماضي', income: stats.income * 0.85, expense: stats.expenses * 0.9 },
      { name: 'الشهر الحالي', income: stats.income, expense: stats.expenses },
      { name: 'الشهر القادم (توقع)', income: stats.income + forecastStats.pendingRevenue, expense: stats.expenses * 1.1 },
  ], [stats, forecastStats]);

  const handleAddTransaction = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTrans.amount || !newTrans.description) return;
      
      let finalType: Transaction['type'] = newTrans.type === 'deduction' ? 'expense' : newTrans.type;
      let finalCategory: Transaction['category'] = newTrans.type === 'deduction' ? 'deduction' : newTrans.category as any;
      let finalNotes = newTrans.notes;

      if (newTrans.type === 'deduction') {
          const targetUser = users.find(u => u.id === newTrans.targetUserId);
          if (targetUser) {
            finalNotes = `خصم على الموظف: ${targetUser.name} - ${newTrans.notes}`;
          } else {
            addNotification("يرجى اختيار الموظف", "warning");
            return;
          }
      }

      addTransaction({
          amount: parseFloat(newTrans.amount),
          type: finalType,
          category: finalCategory,
          paymentMethod: newTrans.paymentMethod, // Add this
          description: newTrans.description,
          notes: finalNotes,
          targetUserId: newTrans.targetUserId
      });
      setShowAddModal(false);
  };

  // ... (keep UI components)

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
       <PageHeader pageKey="accounting" defaultTitle="المحاسبة والمالية" icon={Briefcase} />

       {/* Tabs */}
       <div className="flex overflow-x-auto pb-2 gap-3 scrollbar-hide">
           {[
               { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
               { id: 'income', label: 'الإيرادات', icon: TrendingUp },
               { id: 'expenses', label: 'المصروفات', icon: TrendingDown },
               { id: 'salaries', label: 'الرواتب', icon: Users },
               { id: 'maintenance', label: 'الصيانة', icon: Wrench },
               { id: 'forecast', label: 'توقعات النمو', icon: TrendingUp },
           ].map((tab: any) => (
               <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition flex items-center gap-2 shadow-sm ${activeTab === tab.id ? ts.activeTab : ts.inactiveTab}`}
               >
                   <tab.icon size={18} />
                   {tab.label}
               </button>
           ))}
       </div>

       {activeTab === 'forecast' ? (
           <div className="space-y-6 animate-fade-in">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className={`p-6 rounded-[2.5rem] shadow-sm border relative overflow-hidden ${ts.modalBg} border-green-200`}>
                       <h3 className="text-gray-500 font-bold mb-2 flex items-center gap-2"><Wallet size={18}/> إيرادات الحجوزات المؤكدة</h3>
                       <p className="text-3xl font-black text-green-600">{forecastStats.activeRevenue.toLocaleString()} <span className="text-sm text-gray-400">د.ج</span></p>
                       <p className="text-xs text-green-500 mt-2 font-bold">مبالغ سيتم تحصيلها قريباً</p>
                   </div>
                   <div className={`p-6 rounded-[2.5rem] shadow-sm border relative overflow-hidden ${ts.modalBg} border-orange-200`}>
                       <h3 className="text-gray-500 font-bold mb-2 flex items-center gap-2"><Clock size={18}/> إيرادات الحجوزات المعلقة</h3>
                       <p className="text-3xl font-black text-orange-600">{forecastStats.pendingRevenue.toLocaleString()} <span className="text-sm text-gray-400">د.ج</span></p>
                       <p className="text-xs text-orange-500 mt-2 font-bold">فرص بيع محتملة</p>
                   </div>
                   <div className={`p-6 rounded-[2.5rem] shadow-sm border relative overflow-hidden ${ts.modalBg} border-blue-200`}>
                       <h3 className="text-gray-500 font-bold mb-2 flex items-center gap-2"><TrendingUp size={18}/> نسبة الإشغال الحالية</h3>
                       <p className="text-3xl font-black text-blue-600">{forecastStats.occupancyRate.toFixed(1)}%</p>
                       <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                           <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${forecastStats.occupancyRate}%` }}></div>
                       </div>
                   </div>
               </div>

               <div className={`p-6 rounded-[2.5rem] shadow-sm border h-96 ${ts.modalBg} ${settings.theme === 'zellige' ? 'border-[#cca43b]/20' : 'border-gray-100 dark:border-gray-700'}`}>
                   <h3 className="font-bold mb-6 text-xl">تحليل النمو المالي المتوقع</h3>
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={forecastChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                           <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                           <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 'bold' }} />
                           <YAxis />
                           <Tooltip 
                               contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                               cursor={{ fill: 'transparent' }}
                           />
                           <Legend />
                           <Bar dataKey="income" name="الإيرادات" fill="#10B981" radius={[10, 10, 0, 0]} barSize={40} />
                           <Bar dataKey="expense" name="المصروفات" fill="#EF4444" radius={[10, 10, 0, 0]} barSize={40} />
                       </BarChart>
                   </ResponsiveContainer>
               </div>
           </div>
       ) : (
        <>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <div className={`p-6 rounded-[2.5rem] shadow-sm border relative overflow-hidden ${ts.modalBg} ${settings.theme === 'zellige' ? 'border-[#cca43b]/20' : 'border-gray-100 dark:border-gray-700'}`}>
                 <div className="flex justify-between items-start mb-4">
                     <div className={`p-3 rounded-2xl ${settings.theme === 'zellige' ? 'bg-[#cca43b]/10 text-[#006269]' : 'bg-green-100 text-green-600'}`}>
                         <TrendingUp size={24} />
                     </div>
                     <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-lg">+12%</span>
                 </div>
                 <h3 className="text-gray-500 dark:text-gray-400 font-bold mb-1">إجمالي الدخل</h3>
                 <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.income.toLocaleString()} <span className="text-sm text-gray-400">د.ج</span></p>
             </div>

             <div className={`p-6 rounded-[2.5rem] shadow-sm border relative overflow-hidden ${ts.modalBg} ${settings.theme === 'zellige' ? 'border-[#cca43b]/20' : 'border-gray-100 dark:border-gray-700'}`}>
                 <div className="flex justify-between items-start mb-4">
                     <div className={`p-3 rounded-2xl ${settings.theme === 'zellige' ? 'bg-[#cca43b]/10 text-[#006269]' : 'bg-red-100 text-red-600'}`}>
                         <TrendingDown size={24} />
                     </div>
                     <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded-lg">-5%</span>
                 </div>
                 <h3 className="text-gray-500 dark:text-gray-400 font-bold mb-1">المصروفات</h3>
                 <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.expenses.toLocaleString()} <span className="text-sm text-gray-400">د.ج</span></p>
             </div>

             <div className={`p-6 rounded-[2.5rem] shadow-sm border relative overflow-hidden ${ts.modalBg} ${settings.theme === 'zellige' ? 'border-[#cca43b]/20' : 'border-gray-100 dark:border-gray-700'}`}>
                 <div className="flex justify-between items-start mb-4">
                     <div className={`p-3 rounded-2xl ${settings.theme === 'zellige' ? 'bg-[#cca43b]/10 text-[#006269]' : 'bg-blue-100 text-blue-600'}`}>
                         <Wallet size={24} />
                     </div>
                 </div>
                 <h3 className="text-gray-500 dark:text-gray-400 font-bold mb-1">صافي الربح</h3>
                 <p className={`text-3xl font-black ${(stats.income - stats.expenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{(stats.income - stats.expenses).toLocaleString()} <span className="text-sm text-gray-400">د.ج</span></p>
             </div>

             <div className={`p-6 rounded-[2.5rem] shadow-sm border relative overflow-hidden ${ts.modalBg} ${settings.theme === 'zellige' ? 'border-[#cca43b]/20' : 'border-gray-100 dark:border-gray-700'}`}>
                 <div className="flex justify-between items-start mb-4">
                     <div className={`p-3 rounded-2xl ${settings.theme === 'zellige' ? 'bg-[#cca43b]/10 text-[#006269]' : 'bg-purple-100 text-purple-600'}`}>
                         <Users size={24} />
                     </div>
                 </div>
                 <h3 className="text-gray-500 dark:text-gray-400 font-bold mb-1">الرواتب</h3>
                 <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.salaries.toLocaleString()} <span className="text-sm text-gray-400">د.ج</span></p>
             </div>
        </div>

         {/* Transactions Table */}
         <div className={`rounded-[2.5rem] shadow-sm overflow-hidden border animate-fade-in ${ts.tableContainer}`}>
             <div className={`p-6 flex justify-between items-center ${ts.tableHeader}`}>
                 <h3 className="font-black text-lg flex items-center gap-2">
                     <FileText size={20}/> سجل العمليات المالية
                 </h3>
                 <div className="flex gap-2">
                     <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition text-gray-500">
                         <Filter size={20} />
                     </button>
                     <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition text-gray-500">
                         <Download size={20} />
                     </button>
                     <button 
                         onClick={() => setShowAddModal(true)}
                         className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition transform hover:-translate-y-1 ${ts.button}`}
                     >
                         <PlusCircle size={18} /> عملية جديدة
                     </button>
                 </div>
             </div>
             
             <div className="overflow-x-auto">
                 <table className="w-full text-sm text-right min-w-[800px]">
                 <thead className={`${ts.tableHeader} font-bold`}>
                     <tr>
                         <th className="p-4">البيان / الوصف</th>
                         {activeTab === 'overview' && <th className="p-4">القسم</th>}
                         <th className="p-4">طريقة الدفع</th>
                         <th className="p-4">ملاحظات</th>
                         <th className="p-4">المبلغ</th>
                         <th className="p-4">التاريخ</th>
                         <th className="p-4">الموظف</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                     {currentData.length === 0 ? (
                         <tr><td colSpan={7} className="p-12 text-center opacity-50 font-bold">لا توجد سجلات في هذا القسم</td></tr>
                     ) : (
                         currentData.map(t => (
                             <tr key={t.id} className={`transition ${ts.tableRow}`}>
                                 <td className="p-4">
                                     <p className="font-bold">{t.description}</p>
                                     {activeTab === 'salaries' && t.category === 'deduction' && <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded">خصم</span>}
                                 </td>
                                 {activeTab === 'overview' && (
                                     <td className="p-4">
                                         <span className={`text-xs px-2 py-1 rounded-lg font-bold ${
                                             t.type === 'income' ? 'bg-green-100 text-green-700' :
                                             t.category === 'maintenance' ? 'bg-red-100 text-red-700' :
                                             (t.category === 'salary' || t.category === 'bonus') ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                         }`}>
                                             {t.category === 'booking' ? 'حجوزات' :
                                              t.category === 'maintenance' ? 'صيانة' :
                                              t.category === 'salary' ? 'رواتب' :
                                              t.category === 'bonus' ? 'مكافآت' :
                                              t.category === 'deduction' ? 'خصومات' : 'عام'}
                                         </span>
                                     </td>
                                 )}
                                 <td className="p-4">
                                     <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                                         {t.paymentMethod === 'card' ? <CreditCard size={14}/> : 
                                          t.paymentMethod === 'transfer' ? <Landmark size={14}/> : 
                                          t.paymentMethod === 'check' ? <FileText size={14}/> : <Banknote size={14}/>}
                                         <span>
                                             {t.paymentMethod === 'card' ? 'بطاقة' : 
                                              t.paymentMethod === 'transfer' ? 'تحويل' : 
                                              t.paymentMethod === 'check' ? 'شيك' : 'نقداً'}
                                         </span>
                                     </div>
                                 </td>
                                 <td className="p-4 text-xs text-gray-500 max-w-xs truncate">
                                     {t.notes || '-'}
                                 </td>
                                 <td className={`p-4 font-bold text-base ${t.type === 'income' ? 'text-green-600' : t.type === 'settlement' ? 'text-blue-600' : 'text-red-600'}`}>
                                     {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('en-US')}
                                 </td>
                                 <td className="p-4 text-gray-500 font-mono text-xs">
                                     {new Date(t.date).toLocaleDateString('ar-SA')}
                                 </td>
                                 <td className="p-4">
                                     <div className="flex items-center gap-2">
                                         <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold overflow-hidden text-gray-500">
                                             {t.userName.charAt(0)}
                                         </div>
                                     </div>
                                 </td>
                             </tr>
                         ))
                     )}
                 </tbody>
             </table>
         </div>
         </div>
         </>
       )}

         {/* Add Transaction Modal */}
         {showAddModal && (
             <div className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center p-0 text-gray-900 backdrop-blur-sm overflow-hidden">
                 <div className={`w-full max-w-lg rounded-t-[2.5rem] shadow-2xl relative flex flex-col h-[85dvh] overflow-hidden ${ts.modalBg} dark:bg-gray-900 dark:text-white border-x border-t border-white/20 animate-fade-in-up`}>
                     
                     {/* ... (keep header) */}
                     <div className={`p-6 flex justify-between items-center shrink-0 shadow-sm relative z-30 ${ts.modalHeader}`}>
                         {(settings.theme === 'zellige' || settings.theme === 'zellige-v2') && (
                             <div className={`absolute inset-0 opacity-10 pointer-events-none ${ts.badgePattern} mix-blend-multiply`}></div>
                         )}
                         <h3 className="text-2xl font-black flex items-center gap-2 relative z-10">
                             <PlusCircle /> تسجيل عملية
                         </h3>
                         <button onClick={() => setShowAddModal(false)} className="relative z-10 p-2 rounded-full hover:bg-white/20 transition text-current">
                             <X size={24} />
                         </button>
                     </div>
 
                     <form onSubmit={handleAddTransaction} className="p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50 dark:bg-gray-900/50 pb-24 md:pb-32 modal-content-area">
                         {/* Type Selection */}
                         <div className="grid grid-cols-2 gap-4">
                              {/* ... (keep type buttons) */}
                              <div 
                                 onClick={() => setNewTrans({...newTrans, type: 'income', category: 'other'})}
                                 className={`cursor-pointer p-4 rounded-2xl border-2 text-center transition-all group ${newTrans.type === 'income' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 shadow-md' : 'border-gray-200 dark:border-gray-700 hover:border-green-300'}`}
                              >
                                 <div className="mb-2 bg-white dark:bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition">
                                     <TrendingUp className="text-green-500" size={24}/>
                                 </div>
                                 <span className="font-bold text-sm">إيراد (دخل)</span>
                              </div>
                              <div 
                                 onClick={() => setNewTrans({...newTrans, type: 'expense', category: 'other'})}
                                 className={`cursor-pointer p-4 rounded-2xl border-2 text-center transition-all group ${(newTrans.type === 'expense' || newTrans.type === 'deduction') ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 shadow-md' : 'border-gray-200 dark:border-gray-700 hover:border-red-300'}`}
                              >
                                 <div className="mb-2 bg-white dark:bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition">
                                     <TrendingDown className="text-red-500" size={24}/>
                                 </div>
                                 <span className="font-bold text-sm">مصروف (خرج)</span>
                              </div>
                         </div>
 
                         {/* ... (keep deduction checkbox) */}
                         {hasAuditPermission && (newTrans.type === 'expense' || newTrans.type === 'deduction') && (
                              <label className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl cursor-pointer border border-orange-100 dark:border-orange-800">
                                 <input 
                                     type="checkbox" 
                                     checked={newTrans.type === 'deduction'}
                                     onChange={(e) => setNewTrans(prev => ({...prev, type: e.target.checked ? 'deduction' : 'expense', category: e.target.checked ? 'deduction' : 'other'}))}
                                     className="w-5 h-5 accent-orange-600"
                                 />
                                 <span className="font-bold text-orange-800 dark:text-orange-300">خصم من راتب موظف</span>
                              </label>
                         )}
 
                         {/* ... (keep employee/category select) */}
                         {newTrans.type === 'deduction' ? (
                              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                 <label className={`block text-xs font-bold mb-2 uppercase tracking-wide opacity-80 ${ts.inputLabel}`}>الموظف المعني بالخصم</label>
                                 <select 
                                     required
                                     value={newTrans.targetUserId}
                                     onChange={(e) => setNewTrans({...newTrans, targetUserId: e.target.value})}
                                     className={`w-full p-4 rounded-2xl border-2 font-bold outline-none transition-all ${ts.modalInput}`}
                                 >
                                     <option value="">اختر الموظف...</option>
                                     {users.filter(u => u.role !== 'manager').map(u => (
                                         <option key={u.id} value={u.id}>{u.name}</option>
                                     ))}
                                 </select>
                             </div>
                         ) : (
                             <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                 <label className={`block text-xs font-bold mb-2 uppercase tracking-wide opacity-80 ${ts.inputLabel}`}>التصنيف</label>
                                 <select 
                                     value={newTrans.category}
                                     onChange={(e) => setNewTrans({...newTrans, category: e.target.value})}
                                     className={`w-full p-4 rounded-2xl border-2 font-bold outline-none transition-all ${ts.modalInput}`}
                                 >
                                     {newTrans.type === 'expense' ? (
                                         <>
                                             <option value="other">مصاريف عامة / نثرية</option>
                                             <option value="maintenance">صيانة وتصليح</option>
                                             <option value="salary">رواتب ومكافآت</option>
                                             <option value="bonus">مكافآت وحوافز (Bonuses)</option>
                                             <option value="service">مشتريات وخدمات</option>
                                         </>
                                     ) : (
                                         <>
                                             <option value="other">إيرادات أخرى</option>
                                             <option value="service">خدمات إضافية</option>
                                         </>
                                     )}
                                 </select>
                             </div>
                         )}
 
                         {/* Payment Method Selection */}
                         <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                             <label className={`block text-xs font-bold mb-3 uppercase tracking-wide opacity-80 ${ts.inputLabel}`}>طريقة الدفع</label>
                             <div className="grid grid-cols-4 gap-2">
                                 {[
                                     { id: 'cash', label: 'نقداً', icon: Banknote },
                                     { id: 'card', label: 'بطاقة', icon: CreditCard },
                                     { id: 'transfer', label: 'تحويل', icon: Landmark },
                                     { id: 'check', label: 'شيك', icon: FileText }
                                 ].map(m => (
                                     <button
                                         key={m.id}
                                         type="button"
                                         onClick={() => setNewTrans({...newTrans, paymentMethod: m.id as any})}
                                         className={`p-3 rounded-xl flex flex-col items-center gap-1 transition text-xs font-bold ${
                                             newTrans.paymentMethod === m.id 
                                             ? ts.activeTab
                                             : ts.inactiveTab
                                         }`}
                                     >
                                         <m.icon size={18}/>
                                         {m.label}
                                     </button>
                                 ))}
                             </div>
                         </div>
 
                         {/* ... (keep amount, description, notes) */}
                         <div>
                             <label className={`block text-xs font-bold mb-2 uppercase tracking-wide opacity-80 ${ts.inputLabel}`}>المبلغ (د.ج)</label>
                             <div className="relative">
                                 <input 
                                     type="number" 
                                     required
                                     value={newTrans.amount}
                                     onChange={(e) => setNewTrans({...newTrans, amount: e.target.value})}
                                     className={`w-full p-4 rounded-2xl border-2 font-bold outline-none transition-all pl-12 text-xl ${ts.modalInput}`}
                                     placeholder="0.00"
                                 />
                                 <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" size={20}/>
                             </div>
                         </div>
 
                         <div>
                             <label className={`block text-xs font-bold mb-2 uppercase tracking-wide opacity-80 ${ts.inputLabel}`}>الوصف</label>
                             <input 
                                 type="text"
                                 required
                                 value={newTrans.description}
                                 onChange={(e) => setNewTrans({...newTrans, description: e.target.value})}
                                 className={`w-full p-4 rounded-2xl border-2 font-bold outline-none transition-all ${ts.modalInput}`}
                                 placeholder={newTrans.type === 'deduction' ? "سبب الخصم..." : "مثال: فاتورة كهرباء، شراء مواد..."}
                             />
                         </div>
 
                         <div>
                             <label className={`block text-xs font-bold mb-2 uppercase tracking-wide opacity-80 ${ts.inputLabel}`}>ملاحظات (اختياري)</label>
                             <textarea 
                                 value={newTrans.notes}
                                 onChange={(e) => setNewTrans({...newTrans, notes: e.target.value})}
                                 className={`w-full p-4 rounded-2xl border-2 font-bold outline-none transition-all h-24 ${ts.modalInput}`}
                                 placeholder="تفاصيل إضافية..."
                             />
                         </div>
 
                         {/* ... (keep footer) */}
                         <div className={`p-4 border-t dark:border-gray-700 flex justify-end gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] absolute bottom-0 w-full z-20 pb-safe mobile-hide-on-keyboard ${settings.theme === 'zellige' ? 'bg-[#FDFBF7]' : 'bg-white dark:bg-gray-900'}`}>
                             <button 
                                 type="button" 
                                 onClick={() => setShowAddModal(false)}
                                 className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 rounded-2xl font-bold text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm"
                             >
                                 إلغاء
                             </button>
                             <button 
                                 type="submit" 
                                 className={`flex-[2] py-4 rounded-2xl font-bold shadow-xl transition transform hover:-translate-y-1 flex items-center justify-center gap-2 text-sm ${ts.button}`}
                             >
                                 <CheckCircle size={20} /> حفظ العملية
                             </button>
                         </div>
                     </form>
                 </div>
             </div>
         )}
    </div>
  );
};
