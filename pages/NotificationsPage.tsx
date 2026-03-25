
import React, { useState, useMemo } from 'react';
import { useHotel } from '../context/HotelContext';
import { 
    Bell, Info, AlertTriangle, CheckCircle, Trash2, XCircle, ShieldAlert, XOctagon, 
    Archive, Inbox, RotateCcw, Check, CalendarClock, Eye, ArrowRight, Share2, 
    Briefcase, User, Users, Building2, MessageSquare, Clock
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Department, Role, Notification } from '../types';

export const NotificationsPage: React.FC = () => {
  const { 
      notifications, deleteNotificationPermanently, restoreNotification, 
      emptyTrash, moveToTrash, markAsRead, addNotification, 
      settings, currentUser, users 
  } = useHotel();
  
  const [activeTab, setActiveTab] = useState<'inbox' | 'unread' | 'trash'>('inbox');
  const [forwardModal, setForwardModal] = useState<Notification | null>(null);
  const [forwardNote, setForwardNote] = useState('');
  const [forwardTarget, setForwardTarget] = useState<{ type: 'dept' | 'role' | 'user', value: string }>({ type: 'dept', value: 'reception' });

  // --- Derived State ---
  const myNotifications = useMemo(() => {
      if (!currentUser) return [];
      return notifications.filter(n => {
          // 1. Basic Targeting
          if (n.hiddenFor.includes(currentUser.id)) return false;
          
          // 2. Role/Dept Targeting
          const isTargeted = 
              (!n.targetDepartments && !n.targetRoles && !n.targetUsers) || // Public
              (n.targetUsers?.includes(currentUser.id)) ||
              (n.targetRoles?.includes(currentUser.role)) ||
              (n.targetDepartments?.includes(currentUser.department)) ||
              (currentUser.role === 'manager'); // Managers see all? Maybe not all, but let's say yes for now or stick to targeting.
          
          // Actually, managers shouldn't see private messages for others unless targeting says so.
          // Let's stick to strict targeting if defined.
          if (n.targetUsers && !n.targetUsers.includes(currentUser.id) && currentUser.role !== 'manager') return false;
          
          return true;
      }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications, currentUser]);

  const displayedNotifications = useMemo(() => {
      return myNotifications.filter(n => {
          if (activeTab === 'trash') return n.isTrashed;
          if (n.isTrashed) return false;
          if (activeTab === 'unread') return !(n.readBy?.includes(currentUser?.id || ''));
          return true;
      });
  }, [myNotifications, activeTab, currentUser]);

  const unreadCount = myNotifications.filter(n => !n.isTrashed && !(n.readBy?.includes(currentUser?.id || ''))).length;
  const trashCount = myNotifications.filter(n => n.isTrashed).length;

  // --- Handlers ---
  const handleMarkAllRead = () => {
      displayedNotifications.forEach(n => markAsRead(n.id));
  };

  const handleForward = () => {
      if (!forwardModal || !currentUser) return;
      
      const targetName = forwardTarget.type === 'dept' 
          ? `قسم ${forwardTarget.value}` 
          : forwardTarget.type === 'role' ? `وظيفة ${forwardTarget.value}` : 'موظف محدد';

      addNotification(
          `تم تحويل إشعار من ${currentUser.name}: ${forwardModal.message}`,
          'info',
          `${forwardNote} \n\n [الإشعار الأصلي]: ${forwardModal.details || ''}`,
          {
              departments: forwardTarget.type === 'dept' ? [forwardTarget.value as Department] : undefined,
              roles: forwardTarget.type === 'role' ? [forwardTarget.value as Role] : undefined,
              users: forwardTarget.type === 'user' ? [forwardTarget.value] : undefined
          },
          undefined,
          'task'
      );
      
      addNotification(`تم تحويل الإشعار بنجاح إلى ${targetName}`, "success");
      setForwardModal(null);
      setForwardNote('');
  };

  // --- Icons & Styles ---
  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="text-orange-500" />;
      case 'success': return <CheckCircle className="text-green-500" />;
      case 'error': return <XOctagon className="text-red-500" />;
      default: return <Info className="text-blue-500" />;
    }
  };

  const getCategoryBadge = (cat?: string) => {
      switch(cat) {
          case 'task': return <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">مهمة</span>;
          case 'alert': return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">تنبيه</span>;
          case 'reminder': return <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">تذكير</span>;
          default: return null;
      }
  };

  // --- Theme ---
  const getThemeStyles = () => {
      // Radical Fix: Dark mode overrides all themes for consistency but respects theme identity
      if (settings.darkMode) {
          if (settings.theme === 'zellige') {
              return {
                  tabContainer: 'bg-[#001e21] border border-[#cca43b]/30',
                  tabActive: 'bg-[#cca43b] text-[#001e21] shadow-md',
                  tabInactive: 'text-[#cca43b] hover:text-[#cca43b]/80 hover:bg-[#cca43b]/10',
                  card: 'bg-[#002a2d] border-r-4 border-[#cca43b] shadow-none border-y border-l border-[#cca43b]/20',
                  cardHover: 'hover:bg-[#003539]',
                  trashBtn: 'bg-[#001e21] text-red-400 hover:text-red-300 border border-red-900',
                  restoreBtn: 'bg-[#001e21] text-green-400 hover:text-green-300 border border-green-900',
                  timestamp: 'bg-[#001e21] text-[#cca43b]/70',
                  emptyStateIcon: 'text-[#cca43b]/50',
                  detailsBox: 'bg-[#001517] text-[#cca43b]/80 border border-[#cca43b]/20',
                  text: 'text-[#cca43b]',
                  subText: 'text-[#cca43b]/60',
                  activeTab: 'bg-[#cca43b] text-[#001e21]',
                  inactiveTab: 'text-[#cca43b] hover:bg-[#cca43b]/10',
              };
          }
           if (settings.theme === 'algerian-military') {
              return {
                  tabContainer: 'bg-[#0f140f] border border-[#D4AF37]/30',
                  tabActive: 'bg-[#D4AF37] text-[#1a211a] shadow-md',
                  tabInactive: 'text-[#D4AF37] hover:text-[#D4AF37]/80 hover:bg-[#D4AF37]/10',
                  card: 'bg-[#1a211a] border-r-4 border-[#D4AF37] shadow-none border-y border-l border-[#D4AF37]/20',
                  cardHover: 'hover:bg-[#252e25]',
                  trashBtn: 'bg-[#0f140f] text-red-400 hover:text-red-300 border border-red-900',
                  restoreBtn: 'bg-[#0f140f] text-green-400 hover:text-green-300 border border-green-900',
                  timestamp: 'bg-[#0f140f] text-[#D4AF37]/70',
                  emptyStateIcon: 'text-[#D4AF37]/50',
                  detailsBox: 'bg-[#0f140f] text-[#D4AF37]/80 border border-[#D4AF37]/20',
                  text: 'text-[#D4AF37]',
                  subText: 'text-[#D4AF37]/60',
                  activeTab: 'bg-[#D4AF37] text-[#1a211a]',
                  inactiveTab: 'text-[#D4AF37] hover:bg-[#D4AF37]/10',
              };
          }
          return {
              tabContainer: 'bg-gray-800 border border-gray-700',
              tabActive: 'bg-gray-700 text-blue-400 shadow-sm',
              tabInactive: 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50',
              card: 'bg-gray-800 border-r-4 border-gray-600 shadow-none border-y border-l border-gray-700',
              cardHover: 'hover:bg-gray-700/50',
              trashBtn: 'bg-gray-800 text-red-400 hover:text-red-300 border border-red-900',
              restoreBtn: 'bg-gray-800 text-green-400 hover:text-green-300 border border-green-900',
              timestamp: 'bg-gray-700 text-gray-400',
              emptyStateIcon: 'text-gray-600',
              detailsBox: 'bg-gray-900/50 text-gray-300 border border-gray-700',
              text: 'text-gray-100',
              subText: 'text-gray-400',
              activeTab: 'bg-gray-700 text-white',
              inactiveTab: 'text-gray-400 hover:bg-gray-800',
          };
      }

      switch (settings.theme) {
          case 'zellige': return {
              tabContainer: 'bg-[#FDFBF7] border-2 border-[#cca43b]/30',
              tabActive: 'bg-[#006269] text-[#cca43b] shadow-md border border-[#cca43b]',
              tabInactive: 'text-[#006269] hover:bg-[#cca43b]/10',
              card: 'bg-[#fbf8f1] border-r-4 border-[#cca43b] shadow-sm hover:shadow-md border-y border-l border-y-[#cca43b]/20 border-l-[#cca43b]/20',
              cardHover: 'hover:bg-[#cca43b]/5',
              trashBtn: 'bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100 shadow-sm',
              restoreBtn: 'bg-green-50 text-green-600 border-2 border-green-200 hover:bg-green-100 shadow-sm',
              timestamp: 'bg-[#cca43b]/10 text-[#006269] border border-[#cca43b]/20',
              emptyStateIcon: 'text-[#cca43b]',
              detailsBox: 'bg-[#cca43b]/5 text-[#006269] border border-[#cca43b]/20',
              text: 'text-[#006269]',
              subText: 'text-[#006269]/70',
              activeTab: 'bg-[#006269] text-[#cca43b]',
              inactiveTab: 'text-[#006269] hover:bg-[#cca43b]/10',
          };
          case 'algerian-military': return {
              tabContainer: 'bg-[#F0EFEA] border-2 border-[#D4AF37]/30',
              tabActive: 'bg-[#2F3E2E] text-[#D4AF37] shadow-md border border-[#D4AF37]',
              tabInactive: 'text-[#2F3E2E] hover:bg-[#D4AF37]/10',
              card: 'bg-[#E5E5E0] border-r-4 border-[#D4AF37] shadow-sm hover:shadow-md border-y border-l border-y-[#D4AF37]/20 border-l-[#D4AF37]/20',
              cardHover: 'hover:bg-[#D4AF37]/5',
              trashBtn: 'bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100 shadow-sm',
              restoreBtn: 'bg-green-50 text-green-600 border-2 border-green-200 hover:bg-green-100 shadow-sm',
              timestamp: 'bg-[#D4AF37]/10 text-[#2F3E2E] border border-[#D4AF37]/20',
              emptyStateIcon: 'text-[#D4AF37]',
              detailsBox: 'bg-[#D4AF37]/5 text-[#2F3E2E] border border-[#D4AF37]/20',
              text: 'text-[#2F3E2E]',
              subText: 'text-[#2F3E2E]/70',
              activeTab: 'bg-[#2F3E2E] text-[#D4AF37]',
              inactiveTab: 'text-[#2F3E2E] hover:bg-[#D4AF37]/10',
          };
          case 'zellige-v2': return {
              tabContainer: 'bg-[#f5fcf9] border-2 border-[#c6e3d8]',
              tabActive: 'bg-[#024d38] text-white shadow-md',
              tabInactive: 'text-[#024d38] hover:bg-[#c6e3d8]/30',
              card: 'bg-white border-r-4 border-[#024d38] shadow-sm hover:shadow-md border-y border-l border-y-[#c6e3d8] border-l-[#c6e3d8]',
              cardHover: 'hover:bg-[#f5fcf9]',
              trashBtn: 'bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100 shadow-sm',
              restoreBtn: 'bg-green-50 text-green-600 border-2 border-green-200 hover:bg-green-100 shadow-sm',
              timestamp: 'bg-[#c6e3d8]/30 text-[#024d38]',
              emptyStateIcon: 'text-[#024d38]',
              detailsBox: 'bg-[#f5fcf9] text-[#024d38] border border-[#c6e3d8]',
              text: 'text-[#024d38]',
              subText: 'text-[#024d38]/70',
              activeTab: 'bg-[#024d38] text-white',
              inactiveTab: 'text-[#024d38] hover:bg-[#c6e3d8]/30',
          };
          default: return {
              tabContainer: 'bg-gray-100 border border-transparent',
              tabActive: 'bg-white text-blue-600 shadow-sm',
              tabInactive: 'text-gray-500 hover:text-gray-700',
              card: 'bg-white border-r-4 border-gray-300 shadow-sm border-y border-l border-gray-100',
              cardHover: 'hover:bg-gray-50',
              trashBtn: 'bg-white text-red-500 hover:text-red-700 border border-red-200',
              restoreBtn: 'bg-white text-green-500 hover:text-green-700 border border-green-200',
              timestamp: 'bg-gray-100 text-gray-500',
              emptyStateIcon: 'text-gray-300',
              detailsBox: 'bg-gray-50 text-gray-600 border border-gray-100',
              text: 'text-gray-800',
              subText: 'text-gray-500',
              activeTab: 'bg-gray-900 text-white',
              inactiveTab: 'text-gray-500 hover:bg-gray-100',
          };
      }
  };
  const ts = getThemeStyles();

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
      <PageHeader pageKey="notifications" defaultTitle="مركز الإشعارات والمهام" icon={Bell} />

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          
          {/* Tabs */}
          <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-full md:w-auto">
              {[
                  { id: 'inbox', label: 'الكل', icon: Inbox, count: myNotifications.filter(n => !n.isTrashed).length },
                  { id: 'unread', label: 'غير مقروء', icon: Eye, count: unreadCount },
                  { id: 'trash', label: 'المحذوفات', icon: Trash2, count: trashCount }
              ].map(tab => (
                  <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                          activeTab === tab.id ? ts.activeTab : ts.inactiveTab
                      }`}
                  >
                      <tab.icon size={16} /> {tab.label}
                      {tab.count > 0 && <span className="bg-white/20 px-1.5 rounded text-[10px]">{tab.count}</span>}
                  </button>
              ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 w-full md:w-auto">
              {activeTab !== 'trash' && unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="flex-1 md:flex-none px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100 transition flex items-center justify-center gap-2">
                      <Check size={16}/> تحديد الكل كمقروء
                  </button>
              )}
              {activeTab === 'trash' && trashCount > 0 && (
                  <button 
                    onClick={() => { if(window.confirm('إفراغ سلة المحذوفات نهائياً؟')) emptyTrash(); }}
                    className="flex-1 md:flex-none px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-xs hover:bg-red-100 transition flex items-center justify-center gap-2"
                  >
                      <XCircle size={16}/> إفراغ السلة
                  </button>
              )}
          </div>
      </div>

      {/* List */}
      <div className="space-y-3">
          {displayedNotifications.length === 0 ? (
              <div className="text-center py-20 opacity-50">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      {activeTab === 'trash' ? <Trash2 size={32}/> : <CheckCircle size={32}/>}
                  </div>
                  <p className="font-bold text-lg">لا توجد إشعارات هنا</p>
              </div>
          ) : (
              displayedNotifications.map(note => {
                  const isRead = note.readBy?.includes(currentUser?.id || '');
                  return (
                    <div 
                        key={note.id} 
                        onClick={() => markAsRead(note.id)}
                        className={`group relative p-5 rounded-2xl border transition-all duration-200 ${ts.card} ${ts.cardHover} ${!isRead && activeTab !== 'trash' ? 'border-l-4 border-l-blue-500 bg-blue-50/10' : ''}`}
                    >
                        <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className={`p-3 rounded-xl shrink-0 ${
                                note.type === 'error' ? 'bg-red-100 text-red-600' : 
                                note.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                                note.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                                {getIcon(note.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className={`font-bold text-sm ${ts.text} ${!isRead ? 'text-blue-700 dark:text-blue-400' : ''}`}>
                                            {note.message}
                                        </h3>
                                        {getCategoryBadge(note.category)}
                                        {!isRead && activeTab !== 'trash' && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>}
                                    </div>
                                    <span className="text-[10px] font-mono opacity-50 flex items-center gap-1">
                                        <Clock size={10}/>
                                        {new Date(note.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute:'2-digit' })}
                                    </span>
                                </div>

                                {note.details && (
                                    <p className={`text-xs leading-relaxed mb-3 ${ts.subText} line-clamp-2 group-hover:line-clamp-none transition-all`}>
                                        {note.details}
                                    </p>
                                )}

                                {/* Footer Info */}
                                <div className="flex flex-wrap items-center gap-3 mt-2">
                                    <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500 flex items-center gap-1">
                                        <User size={10}/> {note.userId}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        {new Date(note.timestamp).toLocaleDateString('ar-SA')}
                                    </span>
                                </div>
                            </div>

                            {/* Actions Column */}
                            <div className="flex flex-col gap-2 shrink-0">
                                {activeTab === 'trash' ? (
                                    <>
                                        <button onClick={(e) => { e.stopPropagation(); restoreNotification(note.id); }} className="p-2 hover:bg-green-100 text-green-600 rounded-lg transition" title="استعادة">
                                            <RotateCcw size={18}/>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); deleteNotificationPermanently(note.id); }} className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition" title="حذف نهائي">
                                            <XCircle size={18}/>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {note.actionLink && (
                                            <button onClick={(e) => { e.stopPropagation(); window.location.href = note.actionLink!; }} className="p-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition" title={note.actionLabel || "عرض"}>
                                                <ArrowRight size={18}/>
                                            </button>
                                        )}
                                        <button onClick={(e) => { e.stopPropagation(); setForwardModal(note); }} className="p-2 hover:bg-purple-100 text-purple-600 rounded-lg transition" title="توجيه">
                                            <Share2 size={18}/>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); moveToTrash(note.id); }} className="p-2 hover:bg-gray-100 text-gray-400 hover:text-red-500 rounded-lg transition" title="حذف">
                                            <Trash2 size={18}/>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                  );
              })
          )}
      </div>

      {/* --- Forward Modal --- */}
      {forwardModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setForwardModal(null)}>
              <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                  <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                      <Share2 size={24} className="text-purple-600"/>
                      توجيه الإشعار / المهمة
                  </h3>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-4 text-sm text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                      <p className="font-bold mb-1 text-black dark:text-white">{forwardModal.message}</p>
                      <p className="text-xs opacity-80 line-clamp-2">{forwardModal.details}</p>
                  </div>

                  <div className="space-y-4 mb-6">
                      <div>
                          <label className="block text-xs font-bold mb-2 text-gray-500">توجيه إلى:</label>
                          <div className="flex gap-2 mb-2">
                              <button onClick={() => setForwardTarget({ ...forwardTarget, type: 'dept' })} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${forwardTarget.type === 'dept' ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200'}`}>قسم</button>
                              <button onClick={() => setForwardTarget({ ...forwardTarget, type: 'role' })} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${forwardTarget.type === 'role' ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200'}`}>وظيفة</button>
                              <button onClick={() => setForwardTarget({ ...forwardTarget, type: 'user' })} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${forwardTarget.type === 'user' ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200'}`}>موظف</button>
                          </div>
                          
                          {forwardTarget.type === 'dept' && (
                              <select className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:border-gray-700 outline-none" value={forwardTarget.value} onChange={e => setForwardTarget({ ...forwardTarget, value: e.target.value })}>
                                  {['reception', 'housekeeping', 'maintenance', 'food_beverage', 'security', 'hr'].map(d => (
                                      <option key={d} value={d}>{d}</option>
                                  ))}
                              </select>
                          )}
                          {forwardTarget.type === 'role' && (
                              <select className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:border-gray-700 outline-none" value={forwardTarget.value} onChange={e => setForwardTarget({ ...forwardTarget, value: e.target.value })}>
                                  {['manager', 'receptionist', 'housekeeping_staff', 'maintenance_staff', 'chef', 'waiter', 'security_guard'].map(r => (
                                      <option key={r} value={r}>{r}</option>
                                  ))}
                              </select>
                          )}
                          {forwardTarget.type === 'user' && (
                              <select className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:border-gray-700 outline-none" value={forwardTarget.value} onChange={e => setForwardTarget({ ...forwardTarget, value: e.target.value })}>
                                  {users.map(u => (
                                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                  ))}
                              </select>
                          )}
                      </div>

                      <div>
                          <label className="block text-xs font-bold mb-2 text-gray-500">ملاحظة إضافية:</label>
                          <textarea 
                              className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:border-gray-700 outline-none h-24 resize-none"
                              placeholder="أضف تعليمات للفريق..."
                              value={forwardNote}
                              onChange={e => setForwardNote(e.target.value)}
                          />
                      </div>
                  </div>

                  <div className="flex gap-3">
                      <button onClick={() => setForwardModal(null)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold">إلغاء</button>
                      <button onClick={handleForward} className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-lg flex items-center justify-center gap-2">
                          <Share2 size={18}/> إرسال التوجيه
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
