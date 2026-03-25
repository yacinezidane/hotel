
import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Tag, 
  Info,
  ShieldCheck,
  CreditCard,
  Settings,
  Users,
  House,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuditLog } from '../types';

export const AuditLogsPage: React.FC = () => {
  const { auditLogs } = useHotel();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<AuditLog['category'] | 'all'>('all');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || log.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const getCategoryIcon = (category: AuditLog['category']) => {
    switch (category) {
      case 'booking': return <House size={16} className="text-blue-500" />;
      case 'finance': return <CreditCard size={16} className="text-emerald-500" />;
      case 'staff': return <Users size={16} className="text-purple-500" />;
      case 'settings': return <Settings size={16} className="text-gray-500" />;
      case 'security': return <ShieldCheck size={16} className="text-red-500" />;
      case 'housekeeping': return <Tag size={16} className="text-amber-500" />;
      default: return <Info size={16} className="text-gray-400" />;
    }
  };

  const getCategoryLabel = (category: AuditLog['category']) => {
    switch (category) {
      case 'booking': return 'الحجوزات';
      case 'finance': return 'المالية';
      case 'staff': return 'الموظفين';
      case 'settings': return 'الإعدادات';
      case 'security': return 'الأمن';
      case 'housekeeping': return 'التنظيف';
      default: return 'أخرى';
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <PageHeader 
        title="سجل النشاطات والنظام" 
        subtitle="مراقبة كافة العمليات والتغييرات في النظام لضمان الشفافية"
        icon={<History className="text-brand-gold" />}
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="بحث في السجلات..."
            className="w-full pr-12 pl-4 py-3 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {(['all', 'booking', 'finance', 'staff', 'settings', 'security', 'housekeeping'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                filterCategory === cat 
                ? 'bg-brand-green text-white shadow-md' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'الكل' : getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 text-sm font-black uppercase tracking-wider">
                <th className="px-6 py-4">الوقت</th>
                <th className="px-6 py-4">المستخدم</th>
                <th className="px-6 py-4">العملية</th>
                <th className="px-6 py-4">التفاصيل</th>
                <th className="px-6 py-4">الفئة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              <AnimatePresence mode="popLayout">
                {filteredLogs.map((log) => (
                  <motion.tr
                    key={log.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={14} />
                        {new Date(log.timestamp).toLocaleString('ar-DZ')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="font-black text-sm">{log.userName}</p>
                          <p className="text-xs text-gray-400">{log.userRole}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-brand-green">{log.action}</span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate" title={log.details}>
                        {log.details}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-bold w-fit">
                        {getCategoryIcon(log.category)}
                        {getCategoryLabel(log.category)}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-20">
            <AlertCircle size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-xl font-black text-gray-400">لا توجد سجلات مطابقة</h3>
          </div>
        )}
      </div>
    </div>
  );
};
