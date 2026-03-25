import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { 
  MessageSquare, Calendar, Utensils, CheckCircle, Clock, 
  AlertTriangle, Send, Filter, ChefHat, Coffee, PartyPopper 
} from 'lucide-react';
import { CoordinationNote, Department } from '../types';

export const CoordinationCenter: React.FC = () => {
  const { 
    settings, coordinationNotes, addCoordinationNote, resolveCoordinationNote, 
    hallBookings, restaurantOrders, currentUser, rooms, maintenanceTickets,
    addNotification
  } = useHotel();

  const [newNoteContent, setNewNoteContent] = useState('');
  const [targetDepts, setTargetDepts] = useState<Department[]>([]);
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');

  const getThemeStyles = () => {
      if (settings.darkMode) {
          if (settings.theme === 'zellige') {
              return {
                  card: 'bg-[#001e21] border border-[#cca43b]/30 relative overflow-hidden shadow-lg',
                  activeTab: 'bg-[#cca43b] text-[#001e21] shadow-lg shadow-[#cca43b]/20',
                  button: 'bg-[#cca43b] text-[#001e21] hover:bg-[#b08d30] font-bold border border-[#cca43b]',
                  badge: 'bg-[#cca43b]/20 text-[#cca43b]',
                  input: 'bg-[#001517] border-[#cca43b]/30 focus:border-[#cca43b] text-[#cca43b] placeholder-[#cca43b]/40',
                  pattern: 'bg-zellige-pattern opacity-10 mix-blend-screen',
                  textPrimary: 'text-[#cca43b]',
                  textSecondary: 'text-[#cca43b]/70',
                  metricCard: 'bg-[#002a2d] border-[#cca43b]/20',
                  metricText: 'text-[#cca43b]',
                  metricLabel: 'text-[#cca43b]/60'
              };
          }
          return {
              card: 'bg-gray-800 border-gray-700',
              activeTab: 'bg-blue-600 text-white',
              button: 'bg-blue-600 text-white',
              badge: 'bg-blue-900/50 text-blue-200',
              input: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400',
              pattern: '',
              textPrimary: 'text-white',
              textSecondary: 'text-gray-400',
              metricCard: 'bg-gray-800 border-gray-700',
              metricText: 'text-white',
              metricLabel: 'text-gray-400'
          };
      }

      switch (settings.theme) {
          case 'zellige': return {
              card: 'bg-[#FDFBF7] border border-[#cca43b]/40 relative overflow-hidden shadow-sm',
              activeTab: 'bg-[#006269] text-[#cca43b] shadow-md border-[#cca43b]',
              button: 'bg-[#006269] text-[#cca43b] hover:bg-[#004d53]',
              badge: 'bg-[#cca43b]/20 text-[#006269]',
              input: 'bg-[#fbf8f1] border-[#cca43b]/30 focus:border-[#006269] text-[#006269] placeholder-[#cca43b]/50',
              pattern: 'bg-zellige-pattern opacity-10 mix-blend-multiply',
              textPrimary: 'text-[#006269]',
              textSecondary: 'text-[#006269]/70',
              metricCard: 'bg-white border-[#cca43b]/20',
              metricText: 'text-[#006269]',
              metricLabel: 'text-[#006269]/60'
          };
          case 'algerian-military': return {
              card: 'bg-[#F0EFEA] border-[#D4AF37]/40',
              activeTab: 'bg-[#2F3E2E] text-[#D4AF37] border border-[#D4AF37]',
              button: 'bg-[#2F3E2E] text-[#D4AF37] border border-[#D4AF37]',
              badge: 'bg-[#D4AF37]/20 text-[#2F3E2E]',
              input: 'bg-[#E5E5E0] border-[#D4AF37]/30 focus:border-[#2F3E2E]',
              pattern: 'bg-military-pattern opacity-10',
              textPrimary: 'text-[#2F3E2E]',
              textSecondary: 'text-[#2F3E2E]/70',
              metricCard: 'bg-[#E5E5E0] border-[#D4AF37]/30',
              metricText: 'text-[#2F3E2E]',
              metricLabel: 'text-[#2F3E2E]/60'
          };
          default: return {
              card: 'bg-white border-gray-200',
              activeTab: 'bg-blue-600 text-white',
              button: 'bg-blue-600 text-white',
              badge: 'bg-blue-100 text-blue-800',
              input: 'bg-gray-50 border-gray-300',
              pattern: '',
              textPrimary: 'text-gray-900',
              textSecondary: 'text-gray-500',
              metricCard: 'bg-white border-gray-200',
              metricText: 'text-gray-900',
              metricLabel: 'text-gray-500'
          };
      }
  };
  const ts = getThemeStyles();

  // Dashboard Metrics
  const dirtyRooms = rooms.filter(r => r.status === 'dirty').length;
  const activeMaintenance = maintenanceTickets.filter(t => t.status !== 'resolved').length;
  const activeKitchenOrders = restaurantOrders.filter(o => o.status === 'preparing').length;
  const upcomingEventsCount = hallBookings.filter(b => new Date(b.date) >= new Date()).length;

  const handleBroadcast = () => {
      if (!newNoteContent.trim()) return;
      // Broadcast to all selected departments
      addNotification(
          `توجيه عام من ${currentUser?.name || 'الإدارة'}`, 
          priority === 'urgent' ? 'warning' : 'info', 
          newNoteContent,
          { departments: targetDepts.length > 0 ? targetDepts : undefined } // If empty, broadcast to all? No, safer to require selection or default to all.
      );
      handleAddNote({ preventDefault: () => {} } as any); // Reuse existing logic
      addNotification("تم إرسال التوجيه والإشعار للقطاعات المعنية", "success");
  };

  const handleAddNote = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newNoteContent.trim() || targetDepts.length === 0) return;
      
      addCoordinationNote({
          content: newNoteContent,
          targetDepartments: targetDepts,
          priority
      });
      setNewNoteContent('');
      setTargetDepts([]);
      setPriority('normal');
  };

  const toggleDept = (dept: Department) => {
      setTargetDepts(prev => prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]);
  };

  const activeNotes = coordinationNotes.filter(n => !n.isResolved);
  const resolvedNotes = coordinationNotes.filter(n => n.isResolved);

  // Filter relevant events (next 7 days)
  const upcomingEvents = hallBookings.filter(b => {
      const date = new Date(b.date);
      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);
      return date >= now && date <= nextWeek && b.status === 'confirmed';
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Filter large orders
  const largeOrders = restaurantOrders.filter(o => o.totalAmount > 5000 && o.status !== 'completed' && o.status !== 'cancelled');

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
        <PageHeader pageKey="coordination" defaultTitle="مركز القيادة والتنسيق (Coordination Hub)" icon={MessageSquare} />

        {/* STATUS DASHBOARD (Reception/Manager View) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-2xl shadow-sm border-l-4 border-blue-500 ${ts.metricCard}`}>
                <span className={`text-xs font-bold ${ts.metricLabel}`}>غرف للتنظيف</span>
                <div className={`text-2xl font-black mt-1 ${ts.metricText}`}>{dirtyRooms}</div>
            </div>
            <div className={`p-4 rounded-2xl shadow-sm border-l-4 border-red-500 ${ts.metricCard}`}>
                <span className={`text-xs font-bold ${ts.metricLabel}`}>صيانة نشطة</span>
                <div className={`text-2xl font-black mt-1 ${ts.metricText}`}>{activeMaintenance}</div>
            </div>
            <div className={`p-4 rounded-2xl shadow-sm border-l-4 border-orange-500 ${ts.metricCard}`}>
                <span className={`text-xs font-bold ${ts.metricLabel}`}>طلبات المطبخ</span>
                <div className={`text-2xl font-black mt-1 ${ts.metricText}`}>{activeKitchenOrders}</div>
            </div>
            <div className={`p-4 rounded-2xl shadow-sm border-l-4 border-purple-500 ${ts.metricCard}`}>
                <span className={`text-xs font-bold ${ts.metricLabel}`}>مناسبات قادمة</span>
                <div className={`text-2xl font-black mt-1 ${ts.metricText}`}>{upcomingEventsCount}</div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: Communication Board */}
            <div className="lg:col-span-2 space-y-6">
                {/* ... (Keep existing Input and Note Stream) */}

                <div className={`p-6 rounded-[2rem] shadow-sm border ${ts.card}`}>
                    {(settings.theme === 'zellige' || (settings.darkMode && settings.theme === 'zellige')) && <div className={`absolute inset-0 pointer-events-none ${ts.pattern}`}></div>}
                    <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 relative z-10 ${ts.textPrimary}`}><Send size={20}/> إرسال توجيه / ملاحظة</h3>
                    <form onSubmit={handleAddNote} className="space-y-4 relative z-10">
                        <textarea 
                            className={`w-full p-4 rounded-2xl outline-none border-2 font-medium min-h-[100px] ${ts.input}`}
                            placeholder="اكتب الملاحظة أو التوجيه هنا..."
                            value={newNoteContent}
                            onChange={e => setNewNoteContent(e.target.value)}
                        />
                        
                        <div className="flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex gap-2">
                                {['reception', 'food_beverage', 'housekeeping', 'maintenance', 'security'].map((dept: any) => (
                                    <button
                                        key={dept}
                                        type="button"
                                        onClick={() => toggleDept(dept)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${targetDepts.includes(dept) ? ts.activeTab : `bg-transparent border-current opacity-60 hover:opacity-100 ${ts.textSecondary}`}`}
                                    >
                                        {dept === 'food_beverage' ? 'المطعم/المقهى' : dept === 'reception' ? 'الاستقبال' : dept === 'housekeeping' ? 'التنظيف' : dept === 'maintenance' ? 'الصيانة' : 'الأمن'}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <select 
                                    value={priority} 
                                    onChange={(e: any) => setPriority(e.target.value)}
                                    className={`p-2 rounded-xl font-bold text-sm outline-none border-2 ${ts.input}`}
                                >
                                    <option value="normal">عادية</option>
                                    <option value="high">هامة</option>
                                    <option value="urgent">عاجلة</option>
                                </select>
                                <button type="submit" className={`px-6 py-2 rounded-xl font-bold shadow-md transition transform active:scale-95 ${ts.button}`}>
                                    إرسال
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Active Notes Stream */}
                <div className="space-y-4">
                    <h3 className={`font-bold text-lg opacity-80 px-2 ${ts.textPrimary}`}>التوجيهات النشطة</h3>
                    {activeNotes.length === 0 ? (
                        <div className={`text-center p-8 opacity-50 font-bold ${ts.textSecondary}`}>لا توجد ملاحظات نشطة حالياً</div>
                    ) : (
                        activeNotes.map(note => (
                            <div key={note.id} className={`p-5 rounded-[2rem] border shadow-sm flex gap-4 ${ts.card} ${note.priority === 'urgent' ? 'border-red-500/50 bg-red-50/10' : ''}`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${note.priority === 'urgent' ? (settings.theme === 'zellige' ? 'bg-red-900/20 text-red-400 border border-red-500/30' : 'bg-red-100 text-red-600') : ts.badge}`}>
                                    {note.priority === 'urgent' ? <AlertTriangle size={24}/> : <MessageSquare size={24}/>}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-black text-sm ${ts.textPrimary}`}>{note.createdBy}</span>
                                            <span className={`text-[10px] opacity-60 font-mono ${ts.textSecondary}`}>{new Date(note.createdAt).toLocaleTimeString('ar-DZ', {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <button onClick={() => resolveCoordinationNote(note.id)} className={`text-xs font-bold px-2 py-1 rounded-lg transition ${settings.theme === 'zellige' ? 'text-green-400 hover:bg-green-900/20' : 'text-green-600 hover:bg-green-50'}`}>
                                            <CheckCircle size={14} className="inline ml-1"/> تمت المعالجة
                                        </button>
                                    </div>
                                    <p className={`font-bold text-base leading-relaxed mb-3 ${ts.textPrimary}`}>{note.content}</p>
                                    <div className="flex gap-2">
                                        {note.targetDepartments.map(d => (
                                            <span key={d} className={`text-[10px] px-2 py-1 rounded-lg font-bold opacity-70 ${ts.badge}`}>
                                                {d === 'food_beverage' ? 'المطعم' : d}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>

            {/* RIGHT: Operational Context */}
            <div className="space-y-6">
                
                {/* Upcoming Events (Hall) */}
                <div className={`p-6 rounded-[2.5rem] shadow-sm border ${ts.card}`}>
                    <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${ts.textPrimary}`}><PartyPopper size={20}/> مناسبات القاعة (7 أيام)</h3>
                    <div className="space-y-3">
                        {upcomingEvents.length === 0 ? (
                            <p className={`text-sm opacity-60 text-center py-4 ${ts.textSecondary}`}>لا توجد مناسبات قادمة</p>
                        ) : (
                            upcomingEvents.map(event => (
                                <div key={event.id} className={`p-4 rounded-2xl border ${ts.metricCard} border-opacity-50`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`font-bold text-sm ${ts.textPrimary}`}>{event.eventName}</h4>
                                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border opacity-70 ${ts.badge}`}>{event.date}</span>
                                    </div>
                                    <p className={`text-xs opacity-70 mb-2 ${ts.textSecondary}`}>{event.clientName} • {event.attendees} شخص</p>
                                    {event.services.includes('catering') && (
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg w-fit">
                                            <Utensils size={10}/> مطلوب إطعام
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Large Kitchen Orders */}
                <div className={`p-6 rounded-[2.5rem] shadow-sm border ${ts.card}`}>
                    <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${ts.textPrimary}`}><ChefHat size={20}/> طلبيات مطبخ كبيرة</h3>
                    <div className="space-y-3">
                        {largeOrders.length === 0 ? (
                            <p className={`text-sm opacity-60 text-center py-4 ${ts.textSecondary}`}>لا توجد طلبيات كبيرة نشطة</p>
                        ) : (
                            largeOrders.map(order => (
                                <div key={order.id} className={`p-4 rounded-2xl border ${ts.metricCard} border-opacity-50`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`font-bold text-sm ${ts.textPrimary}`}>طاولة {order.tableId}</span>
                                        <span className={`font-mono font-bold text-xs ${ts.textPrimary}`}>{order.totalAmount} د.ج</span>
                                    </div>
                                    <div className="flex gap-1 flex-wrap mt-2">
                                        {order.items.slice(0, 3).map((item, i) => (
                                            <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded border opacity-70 ${ts.badge}`}>{item.name} x{item.quantity}</span>
                                        ))}
                                        {order.items.length > 3 && <span className={`text-[10px] opacity-50 ${ts.textSecondary}`}>+{order.items.length - 3}</span>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};
