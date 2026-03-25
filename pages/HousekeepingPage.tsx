
import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { 
  Brush, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  Search,
  Filter,
  MoreVertical,
  Play,
  Check,
  Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HousekeepingTask } from '../types';

export const HousekeepingPage: React.FC = () => {
  const { housekeepingTasks, updateHousekeepingTask, assignHousekeepingTask, currentUser, users } = useHotel();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<HousekeepingTask['status'] | 'all'>('all');

  const filteredTasks = housekeepingTasks.filter(task => {
    const matchesSearch = task.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (task.assignedName?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: HousekeepingTask['status']) => {
    switch (status) {
      case 'dirty': return 'bg-red-100 text-red-700 border-red-200';
      case 'cleaning': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'clean': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'inspected': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'maintenance': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: HousekeepingTask['status']) => {
    switch (status) {
      case 'dirty': return <AlertTriangle size={16} />;
      case 'cleaning': return <Clock size={16} className="animate-spin-slow" />;
      case 'clean': return <CheckCircle2 size={16} />;
      case 'inspected': return <Check size={16} />;
      case 'maintenance': return <Wrench size={16} />;
      default: return null;
    }
  };

  const handleStartCleaning = (taskId: string) => {
    if (currentUser) {
      assignHousekeepingTask(taskId, currentUser.id, currentUser.name);
    }
  };

  const handleCompleteCleaning = (taskId: string) => {
    updateHousekeepingTask(taskId, { 
      status: 'clean', 
      endTime: new Date().toISOString() 
    });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <PageHeader 
        title="إدارة خدمات التنظيف" 
        subtitle="متابعة حالة نظافة الغرف والمهام اليومية"
        icon={<Brush className="text-brand-gold" />}
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'بانتظار التنظيف', count: housekeepingTasks.filter(t => t.status === 'dirty').length, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'قيد التنظيف', count: housekeepingTasks.filter(t => t.status === 'cleaning').length, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'تم تنظيفها', count: housekeepingTasks.filter(t => t.status === 'clean').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'تحت الصيانة', count: housekeepingTasks.filter(t => t.status === 'maintenance').length, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-4 rounded-2xl border border-white/20 shadow-sm`}>
            <p className="text-sm font-bold text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-3xl font-black ${stat.color}`}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="بحث برقم الغرفة أو الموظف..."
            className="w-full pr-12 pl-4 py-3 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {(['all', 'dirty', 'cleaning', 'clean', 'inspected', 'maintenance'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                filterStatus === status 
                ? 'bg-brand-green text-white shadow-md' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'الكل' : 
               status === 'dirty' ? 'متسخة' : 
               status === 'cleaning' ? 'قيد التنظيف' : 
               status === 'clean' ? 'نظيفة' : 
               status === 'inspected' ? 'تم الفحص' : 'صيانة'}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300"
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${
                      task.status === 'dirty' ? 'bg-red-500 text-white' : 
                      task.status === 'cleaning' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                    }`}>
                      {task.roomNumber}
                    </div>
                    <div>
                      <h3 className="font-black text-lg">غرفة {task.roomNumber}</h3>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(task.status)}`}>
                        {getStatusIcon(task.status)}
                        <span>
                          {task.status === 'dirty' ? 'تحتاج تنظيف' : 
                           task.status === 'cleaning' ? 'جاري التنظيف' : 
                           task.status === 'clean' ? 'جاهزة' : 
                           task.status === 'inspected' ? 'مفحوصة' : 'صيانة'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-400">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div className="space-y-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <User size={16} />
                    <span className="font-bold">المكلف:</span>
                    <span>{task.assignedName || 'لم يتم التعيين'}</span>
                  </div>
                  {task.notes && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-sm text-gray-600 dark:text-gray-300 italic">
                      "{task.notes}"
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  {task.status === 'dirty' && (
                    <button 
                      onClick={() => handleStartCleaning(task.id)}
                      className="flex-1 bg-brand-green text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-lg shadow-brand-green/20"
                    >
                      <Play size={18} />
                      ابدأ التنظيف
                    </button>
                  )}
                  {task.status === 'cleaning' && (
                    <button 
                      onClick={() => handleCompleteCleaning(task.id)}
                      className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <Check size={18} />
                      إتمام المهمة
                    </button>
                  )}
                  {task.status === 'clean' && (
                    <button 
                      onClick={() => updateHousekeepingTask(task.id, { status: 'inspected' })}
                      className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-lg shadow-blue-500/20"
                    >
                      <CheckCircle2 size={18} />
                      اعتماد الفحص
                    </button>
                  )}
                  <button 
                    onClick={() => updateHousekeepingTask(task.id, { status: 'maintenance' })}
                    className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 transition-all"
                    title="تحويل للصيانة"
                  >
                    <Wrench size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-700">
          <Brush size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-black text-gray-400">لا توجد مهام تنظيف حالياً</h3>
          <p className="text-gray-500">كل الغرف في حالة جيدة أو لا تطابق البحث</p>
        </div>
      )}
    </div>
  );
};
