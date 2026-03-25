
import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { getThemeStyles } from '../utils/themeStyles';
import { 
    Wrench, CheckCircle, Plus, X, AlertTriangle, Check, AlertOctagon, 
    UserX, User, Building, FileWarning, Gavel, XCircle, ShieldAlert, 
    Flame, Volume2, Key, UtensilsCrossed, Watch, PaintBucket, Tv, 
    Shirt, Search, Ban, UserPlus 
} from 'lucide-react';
import { MaintenanceTicket, IncidentReport, IncidentSeverity, IncidentType } from '../types';
import { isZelligeTheme } from '../constants';

// --- CATEGORIZED VIOLATION PRESETS ---
// تعريف قوائم المخالفات الجاهزة لتسهيل الاختيار
const VIOLATION_CATEGORIES = {
    guest: {
        label: 'مخالفات النزلاء',
        icon: User,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        items: [
            { id: 'g_smoke', title: 'تدخين في الغرفة', severity: 'high', fine: 5000, icon: Flame, desc: 'التدخين داخل الغرفة أو الممرات مما يفعل أجهزة الإنذار ويترك روائح.' },
            { id: 'g_noise', title: 'إزعاج وضوضاء', severity: 'medium', fine: 2000, icon: Volume2, desc: 'إصدار أصوات عالية وإزعاج راحة النزلاء المجاورين بعد التوقيت المسموح.' },
            { id: 'g_key', title: 'فقدان المفتاح/البطاقة', severity: 'low', fine: 1500, icon: Key, desc: 'ضياع بطاقة الدخول أو المفتاح الميكانيكي للغرفة.' },
            { id: 'g_checkout', title: 'تأخر المغادرة (Late)', severity: 'low', fine: 3000, icon: Watch, desc: 'البقاء في الغرفة بعد وقت المغادرة الرسمي دون تمديد مسبق.' },
            { id: 'g_visitors', title: 'زوار غير مسجلين', severity: 'high', fine: 8000, icon: UserPlus, desc: 'إدخال أشخاص غير مسجلين في الاستقبال إلى الغرفة.' },
        ]
    },
    staff: {
        label: 'مخالفات الموظفين',
        icon: UserX,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        items: [
            { id: 's_late', title: 'تأخر عن الدوام', severity: 'low', fine: 500, icon: Watch, desc: 'الوصول متأخراً عن بداية الوردية بأكثر من 15 دقيقة.' },
            { id: 's_uniform', title: 'عدم الالتزام بالزي', severity: 'low', fine: 1000, icon: Shirt, desc: 'الحضور بدون الزي الرسمي الكامل أو بمظهر غير لائق.' },
            { id: 's_rude', title: 'سلوك غير مهني', severity: 'high', fine: 5000, icon: Ban, desc: 'التحدث بأسلوب غير لائق مع نزيل أو زميل أو التقصير في الخدمة.' },
            { id: 's_absence', title: 'غياب غير مبرر', severity: 'high', fine: 3000, icon: UserX, desc: 'الغياب عن العمل دون إذن مسبق أو شهادة طبية.' },
        ]
    },
    damage: {
        label: 'أضرار وتخريب',
        icon: UtensilsCrossed,
        color: 'text-red-600',
        bg: 'bg-red-50',
        items: [
            { id: 'd_furniture', title: 'كسر أثاث', severity: 'medium', fine: 10000, icon: UtensilsCrossed, desc: 'كسر أو إتلاف قطعة أثاث داخل الغرفة أو المرافق العامة.' },
            { id: 'd_device', title: 'عطل جهاز (تلف)', severity: 'high', fine: 25000, icon: Tv, desc: 'تخريب التلفاز، الهاتف، أو أجهزة التحكم.' },
            { id: 'd_stain', title: 'بقع وتلوث شديد', severity: 'medium', fine: 4000, icon: PaintBucket, desc: 'تلطيخ الفراش أو السجاد بمواد يصعب تنظيفها وتتطلب غسيل خاص.' },
        ]
    }
};

export const OperationsPage: React.FC = () => {
  const { maintenanceTickets, addMaintenanceTicket, resolveMaintenanceTicket, rooms, settings, incidentReports, reportIncident, resolveIncident, users, bookings, currentUser, addNotification } = useHotel();
  const [activeTab, setActiveTab] = useState<'maintenance' | 'incidents'>('maintenance');
  
  // Maintenance Modal State
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [newTicket, setNewTicket] = useState<Partial<MaintenanceTicket>>({
      roomId: 0,
      description: '',
      priority: 'medium'
  });

  // Incident Modal State
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  // Default to 'guest' category
  const [activeCategory, setActiveCategory] = useState<'guest' | 'staff' | 'damage'>('guest'); 
  
  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
      isOpen: boolean;
      title: string;
      message?: string;
      action: (inputValue?: string) => void;
      type: 'danger' | 'info' | 'warning';
      hasInput?: boolean;
      inputPlaceholder?: string;
  }>({ isOpen: false, title: '', action: () => {}, type: 'info' });

  const [confirmInput, setConfirmInput] = useState('');

  const openConfirm = (title: string, message: string, type: 'danger' | 'info' | 'warning', action: (val?: string) => void, hasInput = false, inputPlaceholder = '') => {
      setConfirmModal({ isOpen: true, title, message, action, type, hasInput, inputPlaceholder });
      setConfirmInput('');
  };

  const handleConfirmAction = () => {
      confirmModal.action(confirmInput);
      setConfirmModal({ ...confirmModal, isOpen: false });
  }; 
  
  const [newIncident, setNewIncident] = useState<{
      type: IncidentType,
      severity: IncidentSeverity,
      title: string,
      description: string,
      locationType: 'room' | 'staff' | 'general',
      targetId: string, // Room ID or Staff ID
      fineAmount: string
  }>({
      type: 'guest_violation',
      severity: 'medium',
      title: '',
      description: '',
      locationType: 'room',
      targetId: '',
      fineAmount: ''
  });

  const isZellige = isZelligeTheme(settings.theme);
  const ts = getThemeStyles(settings);

  // --- Helpers for Incident Cards Styles ---
  const getIncidentStyles = (status: string) => {
      if (settings.darkMode && isZellige) {
          if (status === 'resolved') {
              return 'bg-[#001e21] border border-[#cca43b]/10 text-[#cca43b]/40 grayscale';
          }
           return 'bg-[#002a2d] border border-[#cca43b]/40 shadow-lg shadow-[#cca43b]/5 text-[#cca43b]';
      }

      if (isZellige) {
          if (status === 'resolved') {
              return 'bg-[#fbf8f1] border border-[#cca43b]/10 text-[#006269]/50 grayscale';
          }
          return 'bg-[#FDFBF7] border-2 border-[#cca43b] shadow-lg shadow-[#cca43b]/10 text-[#006269]';
      }

      if (status === 'resolved') return 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700';
      return 'bg-red-50 border-red-200 shadow-sm dark:bg-red-900/20 dark:border-red-800';
  };

  // --- Handle Click on a Preset Violation ---
  const handlePresetClick = (preset: any) => {
      // Auto-set location type based on active category
      let locType: 'room' | 'staff' | 'general' = 'room';
      let incidentType: IncidentType = 'guest_violation';

      if (activeCategory === 'staff') {
          locType = 'staff';
          incidentType = 'staff_violation';
      } else if (activeCategory === 'damage') {
          locType = 'room'; // Default to room, can be changed to general manually if needed
          incidentType = 'property_damage';
      }

      setNewIncident(prev => ({
          ...prev,
          title: preset.title,
          description: preset.desc,
          severity: preset.severity,
          fineAmount: preset.fine.toString(),
          type: incidentType,
          locationType: locType,
          // Keep the targetId if user already selected it, otherwise keep empty
          targetId: prev.targetId 
      }));
  };

  // --- Handlers ---
  const handleReportMaintenance = (e: React.FormEvent) => {
      e.preventDefault();
      if (newTicket.roomId && newTicket.description) {
          addMaintenanceTicket(newTicket as any);
          setShowMaintModal(false);
          setNewTicket({ roomId: 0, description: '', priority: 'medium' });
      }
  };

  const handleReportIncident = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newIncident.title || !newIncident.targetId) {
          addNotification("الرجاء تحديد الهدف (الغرفة أو الموظف) والعنوان", "warning");
          return;
      }

      let locationLabel = "General Area";
      let relatedRoomId: number | undefined;
      let relatedStaffId: string | undefined;

      if (newIncident.locationType === 'room') {
          if (newIncident.targetId === 'general') {
              locationLabel = "مرافق عامة / مجهول";
          } else {
              const room = rooms.find(r => r.id === Number(newIncident.targetId));
              locationLabel = `غرفة ${room?.number}`;
              relatedRoomId = room?.id;
          }
      } else if (newIncident.locationType === 'staff') {
          const staff = users.find(u => u.id === newIncident.targetId);
          locationLabel = `الموظف: ${staff?.name}`;
          relatedStaffId = staff?.id;
      } else {
          locationLabel = newIncident.targetId; // General Area Name
      }

      reportIncident({
          type: newIncident.type,
          severity: newIncident.severity,
          title: newIncident.title,
          description: newIncident.description,
          location: locationLabel,
          reportedBy: currentUser?.name || 'System',
          relatedRoomId,
          relatedStaffId,
          fineAmount: Number(newIncident.fineAmount) || 0
      });

      setShowIncidentModal(false);
      // Reset
      setNewIncident({ type: 'guest_violation', severity: 'medium', title: '', description: '', locationType: 'room', targetId: '', fineAmount: '' });
  };

  const isManager = currentUser?.role === 'manager' || currentUser?.role === 'assistant_manager';

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
        <PageHeader pageKey="operations" defaultTitle="مركز العمليات والامتثال" icon={AlertOctagon} />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className={`p-1 rounded-2xl flex w-full md:w-auto ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] border border-[#cca43b]/20' : (isZellige ? 'bg-[#006269]/5 border border-[#cca43b]/20' : 'bg-gray-100 dark:bg-gray-800')}`}>
                <button 
                    onClick={() => setActiveTab('maintenance')} 
                    className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${activeTab === 'maintenance' ? ts.activeTab : ts.inactiveTab}`}
                >
                    <Wrench size={18}/> الصيانة
                </button>
                <button 
                    onClick={() => setActiveTab('incidents')} 
                    className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${activeTab === 'incidents' ? ts.activeTab : ts.inactiveTab}`}
                >
                    <FileWarning size={18}/> المخالفات
                </button>
            </div>

            {activeTab === 'maintenance' ? (
                <button onClick={() => setShowMaintModal(true)} className={`w-full md:w-auto px-6 py-3 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 transition ${ts.button}`}>
                    <Plus size={20} /> تبليغ عن عطل
                </button>
            ) : (
                <button onClick={() => setShowIncidentModal(true)} className={`w-full md:w-auto px-6 py-3 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 transition ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] text-[#cca43b] border border-[#cca43b] hover:bg-[#cca43b]/10' : (isZellige ? 'bg-[#006269] text-[#cca43b] hover:bg-[#004d53]' : 'bg-red-600 text-white hover:bg-red-700')}`}>
                    <AlertTriangle size={20} /> تسجيل مخالفة
                </button>
            )}
        </div>

        {/* --- MAINTENANCE TAB --- */}
        {activeTab === 'maintenance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {maintenanceTickets.length === 0 && (
                    <div className={`col-span-full py-16 text-center font-bold border-2 border-dashed rounded-[3rem] flex flex-col items-center justify-center gap-4 ${settings.darkMode && settings.theme === 'zellige' ? 'border-[#cca43b]/30 text-[#cca43b]/60' : (isZellige ? 'border-[#cca43b]/30 text-[#006269]/60' : 'border-gray-200 text-gray-400 dark:border-gray-700')}`}>
                        <CheckCircle size={48} className={settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]' : (isZellige ? 'text-[#cca43b]' : '')} />
                        لا توجد أعطال مسجلة. الفندق في حالة ممتازة.
                    </div>
                )}
                {maintenanceTickets.map(ticket => (
                    <div key={ticket.id} className={`p-6 rounded-[2rem] shadow-sm relative overflow-hidden group ${ts.card} ${ticket.status === 'resolved' ? 'opacity-60 grayscale' : ''}`}>
                        {(isZellige || (settings.darkMode && settings.theme === 'zellige')) && <div className={`absolute inset-0 pointer-events-none ${ts.badgePattern}`}></div>}
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <span className={`font-black text-xl ${ts.text}`}>غرفة {rooms.find(r => r.id === ticket.roomId)?.number}</span>
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                                ticket.priority === 'critical' ? 'bg-red-100 text-red-600' :
                                ticket.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                                'bg-blue-100 text-blue-600'
                            }`}>{ticket.priority}</span>
                        </div>
                        <p className={`font-medium mb-6 min-h-[3rem] ${ts.subText}`}>{ticket.description}</p>
                        <div className={`flex justify-between items-center text-xs opacity-60 mb-4 font-bold ${ts.subText}`}>
                            <span>{new Date(ticket.reportedAt).toLocaleDateString()}</span>
                            <span>بواسطة: {ticket.reportedBy}</span>
                        </div>
                        {ticket.status === 'pending' || ticket.status === 'in_progress' ? (
                            <button 
                                onClick={() => openConfirm(
                                    "إتمام الصيانة",
                                    "أدخل تكلفة الإصلاح (إن وجدت):",
                                    "info",
                                    (cost) => resolveMaintenanceTicket(ticket.id, Number(cost) || 0),
                                    true,
                                    "0"
                                )} 
                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/10 text-[#cca43b] hover:bg-[#cca43b]/20 border border-[#cca43b]/30' : (isZellige ? 'bg-[#006269]/10 text-[#006269] hover:bg-[#006269] hover:text-[#cca43b]' : 'bg-green-100 text-green-700 hover:bg-green-200')}`}
                            >
                                <CheckCircle size={18}/> تم الإصلاح
                            </button>
                        ) : (
                            <div className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl font-bold flex items-center justify-center gap-2">
                                <Check size={18}/> مكتملة
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}

        {/* --- INCIDENTS & VIOLATIONS TAB --- */}
        {activeTab === 'incidents' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {incidentReports.length === 0 && (
                    <div className={`col-span-full py-16 text-center font-bold border-2 border-dashed rounded-[3rem] flex flex-col items-center justify-center gap-4 ${settings.darkMode && settings.theme === 'zellige' ? 'border-[#cca43b]/30 text-[#cca43b]/60' : (isZellige ? 'border-[#cca43b]/30 text-[#006269]/60' : 'border-gray-200 text-gray-400 dark:border-gray-700')}`}>
                        <ShieldAlert size={48} className={settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]' : (isZellige ? 'text-[#cca43b]' : '')} />
                        سجل المخالفات نظيف.
                    </div>
                )}
                {incidentReports.map(incident => (
                    <div 
                        key={incident.id} 
                        className={`p-6 rounded-[2rem] relative overflow-hidden group hover:shadow-lg transition-all duration-300 ${getIncidentStyles(incident.status)}`}
                    >
                        {(isZellige || (settings.darkMode && settings.theme === 'zellige')) && incident.status !== 'resolved' && (
                            <div className={`absolute inset-0 pointer-events-none ${ts.badgePattern}`}></div>
                        )}
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#001e21] text-[#cca43b] border border-[#cca43b]/30' : (isZellige ? 'bg-[#006269] text-[#cca43b] border border-[#cca43b]' : incident.type === 'staff_violation' ? 'bg-orange-200 text-orange-800' : 'bg-red-200 text-red-800')}`}>
                                        {incident.type === 'staff_violation' ? <UserX size={20}/> : <AlertOctagon size={20}/>}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm line-clamp-1">{incident.title}</h4>
                                        <p className="text-[10px] font-bold opacity-70 flex items-center gap-1">
                                            <Building size={10}/> {incident.location}
                                        </p>
                                    </div>
                                </div>
                                {incident.status === 'reported' && (
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black animate-pulse ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b] text-[#001e21]' : (isZellige ? 'bg-[#006269] text-[#cca43b]' : 'bg-red-600 text-white')}`}>جديد</span>
                                )}
                            </div>
                            <p className="text-sm font-bold opacity-90 mb-4 min-h-[3rem] leading-relaxed">{incident.description}</p>
                            {incident.fineAmount && incident.fineAmount > 0 && (
                                <div className={`p-3 rounded-xl mb-4 flex justify-between items-center border ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#001e21]/50 border-[#cca43b]/30' : (isZellige ? 'bg-[#006269]/5 border-[#cca43b]/30' : 'bg-white/60 border-red-100')}`}>
                                    <span className="text-xs font-bold opacity-70">الغرامة المقترحة</span>
                                    <span className={`font-black ${settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]' : (isZellige ? 'text-[#006269]' : 'text-red-600')}`}>{incident.fineAmount} د.ج</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-[10px] font-bold opacity-60 mb-4 border-t pt-2 border-current/10">
                                <span>{new Date(incident.reportedAt).toLocaleDateString()}</span>
                                <span>{incident.reportedBy}</span>
                            </div>
                            {incident.status === 'reported' && isManager ? (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => openConfirm(
                                            "إلغاء المخالفة", 
                                            "يرجى ذكر سبب إلغاء المخالفة:", 
                                            "warning", 
                                            (note) => { if (note) resolveIncident(incident.id, 'dismiss', note); }, 
                                            true, 
                                            "سبب الإلغاء..."
                                        )} 
                                        className={`flex-1 py-2.5 rounded-xl font-bold text-xs ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/10 text-[#cca43b] hover:bg-[#cca43b]/20' : (isZellige ? 'bg-[#006269]/10 text-[#006269] hover:bg-[#006269]/20' : 'bg-gray-200 text-gray-600')}`}
                                    >
                                        إلغاء
                                    </button>
                                    {incident.fineAmount && incident.fineAmount > 0 ? (
                                        <button 
                                            onClick={() => openConfirm(
                                                "تأكيد الغرامة", 
                                                `هل أنت متأكد من تطبيق غرامة بقيمة ${incident.fineAmount} د.ج وإغلاق الملف؟`, 
                                                "danger", 
                                                () => resolveIncident(incident.id, 'apply_fine')
                                            )} 
                                            className={`flex-[2] py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow-md ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b] text-[#001e21] hover:bg-[#b08d33]' : (isZellige ? 'bg-[#cca43b] text-[#006269] hover:bg-[#b08d33]' : 'bg-red-600 text-white hover:bg-red-700')}`}
                                        >
                                            <Gavel size={14}/> تطبيق الغرامة
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => resolveIncident(incident.id, 'resolve')} 
                                            className={`flex-[2] py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow-md ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] text-[#cca43b] border border-[#cca43b] hover:bg-[#cca43b]/10' : (isZellige ? 'bg-[#006269] text-white hover:bg-[#004d53]' : 'bg-green-600 text-white hover:bg-green-700')}`}
                                        >
                                            <CheckCircle size={14}/> معالجة
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className={`w-full py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border ${incident.status === 'resolved' ? (settings.darkMode && settings.theme === 'zellige' ? 'bg-[#001e21] text-[#cca43b]/50 border-[#cca43b]/10' : (isZellige ? 'bg-[#006269]/5 text-[#006269] border-[#006269]/20' : 'bg-green-50 text-green-700 border-green-200')) : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                    {incident.status === 'resolved' ? <><CheckCircle size={14}/> تمت المعالجة {incident.isFineApplied ? '(مع غرامة)' : ''}</> : <><XCircle size={14}/> ملغاة</>}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        <Modal
            isOpen={confirmModal.isOpen}
            onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            title={confirmModal.title}
            size="sm"
        >
            <div className="p-6 text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                    confirmModal.type === 'danger' 
                    ? (settings.darkMode && isZellige ? 'bg-red-900/30 text-red-400 border border-red-800/50' : 'bg-red-100 text-red-600') 
                    : (settings.darkMode && isZellige ? 'bg-[#cca43b]/20 text-[#cca43b] border border-[#cca43b]/30' : 'bg-blue-100 text-blue-600')
                }`}>
                    {confirmModal.type === 'danger' ? <AlertOctagon size={32}/> : <CheckCircle size={32}/>}
                </div>
                <p className={`text-sm font-bold opacity-70 mb-6 ${ts.subText}`}>{confirmModal.message}</p>
                
                {confirmModal.hasInput && (
                    <input 
                        type="text" 
                        autoFocus
                        value={confirmInput}
                        onChange={(e) => setConfirmInput(e.target.value)}
                        placeholder={confirmModal.inputPlaceholder}
                        className={`w-full p-3 rounded-xl border-2 font-bold outline-none mb-6 text-center ${ts.modalInput}`}
                    />
                )}

                <div className="flex gap-3">
                    <button onClick={() => setConfirmModal({...confirmModal, isOpen: false})} className={`flex-1 py-3 rounded-xl font-bold transition ${ts.buttonSecondary}`}>إلغاء</button>
                    <button 
                        onClick={handleConfirmAction} 
                        disabled={confirmModal.hasInput && !confirmInput}
                        className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition ${
                            confirmModal.type === 'danger' 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : ts.button
                        } ${confirmModal.hasInput && !confirmInput ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        تأكيد
                    </button>
                </div>
            </div>
        </Modal>

        {/* Maintenance Modal */}
        <Modal
            isOpen={showMaintModal}
            onClose={() => setShowMaintModal(false)}
            title="تبليغ صيانة جديد"
        >
            <form onSubmit={handleReportMaintenance} className="p-6 space-y-4">
                <div>
                    <label className={`block text-xs font-bold mb-2 ${ts.text}`}>الغرفة</label>
                    <select className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.modalInput}`} value={newTicket.roomId} onChange={e => setNewTicket({...newTicket, roomId: Number(e.target.value)})}>
                        <option value={0}>اختر الغرفة...</option>
                        {rooms.map(r => <option key={r.id} value={r.id}>غرفة {r.number}</option>)}
                    </select>
                </div>
                <div>
                    <label className={`block text-xs font-bold mb-2 ${ts.text}`}>الوصف</label>
                    <textarea required className={`w-full p-3 rounded-xl border-2 font-bold outline-none h-32 resize-none ${ts.modalInput}`} value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})} placeholder="وصف المشكلة..." />
                </div>
                <div>
                    <label className={`block text-xs font-bold mb-2 ${ts.text}`}>الأولوية</label>
                    <div className="flex gap-2">
                        {['low', 'medium', 'high', 'critical'].map(p => (
                            <button 
                                key={p} 
                                type="button" 
                                onClick={() => setNewTicket({...newTicket, priority: p as any})} 
                                className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition border-2 ${
                                    newTicket.priority === p 
                                    ? ts.activeTab 
                                    : ts.inactiveTab
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => setShowMaintModal(false)} className={`px-6 py-3 rounded-xl font-bold text-sm transition ${ts.buttonSecondary}`}>إلغاء</button>
                    <button type="submit" className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition text-sm ${ts.button}`}><Check size={18}/> إرسال</button>
                </div>
            </form>
        </Modal>

        {/* Incident Reporting Modal */}
        <Modal
            isOpen={showIncidentModal}
            onClose={() => setShowIncidentModal(false)}
            title={<div className="flex items-center gap-2"><AlertTriangle/> تسجيل مخالفة / ضرر</div>}
            size="lg"
        >
            <form onSubmit={handleReportIncident} className="flex flex-col h-full">
                {/* Tabs: Categories */}
                <div className={`flex px-6 pt-4 gap-2 shrink-0 border-b pb-4 ${settings.darkMode && isZellige ? 'border-[#cca43b]/20' : (isZellige ? 'border-[#cca43b]/20' : 'border-gray-100 dark:border-gray-700')}`}>
                    {(Object.keys(VIOLATION_CATEGORIES) as Array<keyof typeof VIOLATION_CATEGORIES>).map(cat => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => { 
                                setActiveCategory(cat); 
                                setNewIncident(prev => ({...prev, targetId: '', title: '', description: '', fineAmount: '', locationType: cat === 'staff' ? 'staff' : 'room'})); 
                            }}
                            className={`flex-1 py-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                                activeCategory === cat ? ts.activeTab : ts.inactiveTab
                            }`}
                        >
                            {React.createElement(VIOLATION_CATEGORIES[cat].icon, { size: 18 })}
                            {VIOLATION_CATEGORIES[cat].label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Target Selection */}
                    <div className={`p-4 rounded-2xl border-2 ${ts.card}`}>
                        <label className={`block text-xs font-bold mb-2 uppercase tracking-wide opacity-70 ${ts.text}`}>
                            {activeCategory === 'guest' ? 'الغرفة المعنية (النزيل)' : activeCategory === 'staff' ? 'الموظف المسؤول' : 'موقع الضرر'}
                        </label>
                        {activeCategory === 'guest' || activeCategory === 'damage' ? (
                            <div className="relative">
                                <select 
                                    className={`w-full p-4 rounded-xl border-2 font-bold outline-none cursor-pointer appearance-none ${ts.modalInput}`} 
                                    value={newIncident.targetId} 
                                    onChange={e => setNewIncident({...newIncident, targetId: e.target.value, locationType: 'room'})}
                                >
                                    <option value="">-- اختر الغرفة --</option>
                                    {rooms.filter(r => activeCategory === 'damage' ? true : r.status === 'occupied').map(r => (
                                        <option key={r.id} value={r.id}>
                                            غرفة {r.number} {activeCategory === 'damage' ? `(${r.status})` : '(مشغولة)'}
                                        </option>
                                    ))}
                                    {activeCategory === 'damage' && <option value="general">مرافق عامة / مجهول</option>}
                                </select>
                                <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 opacity-50 ${ts.text}`}/>
                            </div>
                        ) : (
                            <div className="relative">
                                <select 
                                    className={`w-full p-4 rounded-xl border-2 font-bold outline-none cursor-pointer appearance-none ${ts.modalInput}`} 
                                    value={newIncident.targetId} 
                                    onChange={e => setNewIncident({...newIncident, targetId: e.target.value, locationType: 'staff'})}
                                >
                                    <option value="">-- اختر الموظف --</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                                <User size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 opacity-50 ${ts.text}`}/>
                            </div>
                        )}
                    </div>

                    {/* Presets Grid */}
                    <div>
                        <h4 className={`text-xs font-bold mb-3 flex items-center gap-2 ${ts.text}`}>
                            <CheckCircle size={14}/> اختر نوع المخالفة (تعبئة تلقائية)
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            {VIOLATION_CATEGORIES[activeCategory].items.map(preset => (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => handlePresetClick(preset)}
                                    className={`p-3 rounded-2xl border-2 text-right transition-all group relative overflow-hidden hover:shadow-md ${
                                        newIncident.title === preset.title 
                                        ? (settings.darkMode && isZellige ? 'bg-[#cca43b] border-[#cca43b] text-[#001e21]' : (isZellige ? 'bg-[#006269] border-[#cca43b] text-[#cca43b]' : 'bg-gray-900 border-gray-900 text-white')) 
                                        : (settings.darkMode && isZellige ? 'bg-[#002a2d] border-[#cca43b]/30 text-[#cca43b] hover:bg-[#cca43b]/10' : (isZellige ? 'bg-white border-[#cca43b]/30 text-[#006269] hover:bg-[#cca43b]/10' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'))
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <preset.icon size={20} className={newIncident.title === preset.title ? 'opacity-100' : 'opacity-50'}/>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${newIncident.title === preset.title ? 'bg-white/20' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'}`}>{preset.fine} د.ج</span>
                                    </div>
                                    <span className="font-bold text-sm block leading-tight">{preset.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                        <div>
                            <label className={`block text-xs font-bold mb-1 opacity-70 ${ts.text}`}>الوصف</label>
                            <textarea required className={`w-full p-3 rounded-xl border-2 font-bold outline-none h-20 resize-none ${ts.modalInput}`} value={newIncident.description} onChange={e => setNewIncident({...newIncident, description: e.target.value})} placeholder="تفاصيل..." />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className={`block text-xs font-bold mb-1 opacity-70 ${ts.text}`}>الخطورة</label>
                                <select className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.modalInput}`} value={newIncident.severity} onChange={e => setNewIncident({...newIncident, severity: e.target.value as any})}>
                                    <option value="low">منخفضة</option>
                                    <option value="medium">متوسطة</option>
                                    <option value="high">عالية</option>
                                    <option value="critical">حرجة</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold mb-1 text-red-500">الغرامة المقترحة (د.ج)</label>
                                <input type="number" className={`w-full p-3 rounded-xl border-2 font-black outline-none ${settings.darkMode && isZellige ? 'border-[#cca43b] text-[#cca43b] bg-[#001e21]' : (isZellige ? 'border-[#cca43b] text-[#006269] bg-[#fbf8f1]' : 'border-red-200 text-red-600 bg-red-50 dark:bg-red-900/20 dark:border-red-800')}`} value={newIncident.fineAmount} onChange={e => setNewIncident({...newIncident, fineAmount: e.target.value})} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`p-4 border-t flex justify-end gap-3 shrink-0 ${settings.darkMode && isZellige ? 'bg-[#001e21] border-[#cca43b]/20' : 'border-gray-100 dark:border-gray-700'}`}>
                    <button type="button" onClick={() => setShowIncidentModal(false)} className={`px-6 py-3 rounded-xl font-bold text-sm transition ${ts.buttonSecondary}`}>إلغاء</button>
                    <button type="submit" className={`px-10 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition text-sm ${ts.button}`}>
                        <Check size={18}/> تسجيل المخالفة
                    </button>
                </div>
            </form>
        </Modal>
    </div>
  );
};
