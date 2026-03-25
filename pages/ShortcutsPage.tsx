
import React from 'react';
import { useHotel } from '../context/HotelContext';
import { 
  BedDouble, CalendarCheck, Receipt, Bell, Send, Settings, 
  Users, Moon, Plus, CheckSquare, Square, Zap, Sun, Info, LayoutGrid, ToggleLeft
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';

interface ShortcutsPageProps {
  navigate: (page: string) => void;
}

export const ShortcutsPage: React.FC<ShortcutsPageProps> = ({ navigate }) => {
  const { userShortcuts, toggleShortcut, toggleDarkMode, settings } = useHotel();

  const AVAILABLE_ACTIONS = [
    { id: 'add_booking', label: 'إضافة حجز جديد', icon: Plus, page: 'accommodation', action: 'modal' },
    { id: 'view_rooms', label: 'حالة الغرف', icon: BedDouble, page: 'accommodation' },
    { id: 'view_bookings', label: 'سجل الحجوزات', icon: CalendarCheck, page: 'accommodation' },
    { id: 'invoices', label: 'الفواتير والتقارير', icon: Receipt, page: 'invoices' },
    { id: 'messages', label: 'المراسلات', icon: Send, page: 'messages' },
    { id: 'notifications', label: 'الإشعارات', icon: Bell, page: 'notifications' },
    { id: 'settings', label: 'الإعدادات', icon: Settings, page: 'settings' },
    { id: 'about', label: 'عن التطبيق', icon: Info, page: 'about' },
    { id: 'toggle_theme', label: 'تغيير الوضع (ليلي/نهاري)', icon: settings.darkMode ? Sun : Moon, page: null, special: 'theme' },
  ];

  const handleShortcutClick = (action: any) => {
      if (action.special === 'theme') {
          toggleDarkMode();
      } else if (action.page) {
          navigate(action.page);
      }
  };

  const activeShortcuts = AVAILABLE_ACTIONS.filter(a => userShortcuts.includes(a.id));

  // --- Dynamic Theme Styles ---
  const getThemeStyles = () => {
      switch (settings.theme) {
          case 'zellige': return {
              title: 'text-[#006269]',
              card: 'bg-[#FDFBF7] border-2 border-[#cca43b]/40 hover:border-[#006269] shadow-sm hover:shadow-[0_10px_30px_-10px_rgba(0,98,105,0.2)]',
              iconBox: 'bg-[#006269] text-[#cca43b] shadow-lg shadow-[#006269]/30 border-2 border-[#cca43b]',
              configBg: 'bg-[#fbf8f1] border-[#cca43b]/30',
              activeItem: 'bg-[#006269] text-[#cca43b] border-[#cca43b] shadow-md',
              inactiveItem: 'bg-[#FDFBF7] text-[#006269] border-[#cca43b]/30 hover:bg-[#cca43b]/10'
          };
          case 'zellige-v2': return {
              title: 'text-[#024d38]',
              card: 'bg-[#f5fcf9] border-2 border-[#c6e3d8] hover:border-[#024d38] shadow-sm',
              iconBox: 'bg-[#024d38] text-white shadow-lg border border-[#c6e3d8]',
              configBg: 'bg-[#f5fcf9] border-[#c6e3d8]',
              activeItem: 'bg-[#024d38] text-white border-[#024d38] shadow-md',
              inactiveItem: 'bg-white text-[#024d38] border-[#c6e3d8] hover:bg-[#c6e3d8]/20'
          };
          case 'instagram': return {
              title: 'text-pink-600',
              card: 'bg-white border-2 border-pink-100 hover:border-pink-400 shadow-sm hover:shadow-pink-500/20',
              iconBox: 'bg-gradient-to-tr from-[#833AB4] to-[#FCAF45] text-white shadow-lg shadow-pink-500/30',
              configBg: 'bg-gradient-to-br from-purple-50 to-orange-50 border-pink-100',
              activeItem: 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white border-transparent shadow-md',
              inactiveItem: 'bg-white text-gray-600 border-pink-100 hover:border-pink-300'
          };
          case 'real-madrid': return {
              title: 'text-[#00529F]',
              card: 'bg-white border-2 border-[#FEBE10] hover:border-[#00529F] shadow-sm',
              iconBox: 'bg-[#00529F] text-white border-2 border-[#FEBE10] shadow-lg',
              configBg: 'bg-gray-50 border-[#FEBE10]/30',
              activeItem: 'bg-[#00529F] text-white border-[#FEBE10] shadow-md',
              inactiveItem: 'bg-white text-[#00529F] border-gray-200 hover:bg-gray-50'
          };
          case 'barcelona': return {
              title: 'text-[#A50044]',
              card: 'bg-white border-2 border-[#A50044]/30 hover:border-[#004D98] shadow-sm',
              iconBox: 'bg-gradient-to-r from-[#004D98] to-[#A50044] text-[#EDBB00] shadow-lg',
              configBg: 'bg-[#f8f9fa] border-[#A50044]/20',
              activeItem: 'bg-gradient-to-r from-[#004D98] to-[#A50044] text-[#EDBB00] shadow-md border-transparent',
              inactiveItem: 'bg-white text-[#A50044] border-[#004D98]/20 hover:bg-[#004D98]/5'
          };
          default: return {
              title: 'text-blue-600 dark:text-blue-400',
              card: 'bg-white dark:bg-gray-800 border-2 border-transparent hover:border-blue-500/30 shadow-sm hover:shadow-xl dark:shadow-none',
              iconBox: 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-600/30',
              configBg: 'bg-white/40 dark:bg-black/20 border-white/20 dark:border-gray-700',
              activeItem: 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/30',
              inactiveItem: 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          };
      }
  };

  const ts = getThemeStyles();
  const isZellige = settings.theme === 'zellige' || settings.theme === 'zellige-v2';

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
        <PageHeader pageKey="shortcuts" defaultTitle="الاختصارات السريعة" icon={LayoutGrid} />

        {/* Active Shortcuts Grid */}
        <section>
            <div className={`p-6 rounded-[2.5rem] mb-6 ${ts.configBg} transition-colors duration-300`}>
                <h2 className={`text-xl font-black mb-6 flex items-center gap-2 ${ts.title}`}>
                    <Zap size={24} className="fill-current opacity-80" /> الوصول السريع
                </h2>
                
                {activeShortcuts.length === 0 ? (
                    <div className="text-center py-10 opacity-60">
                        <ToggleLeft size={48} className={`mx-auto mb-2 ${ts.title}`} />
                        <p className={`font-bold ${ts.title}`}>لم تقم بتفعيل أي اختصارات بعد.</p>
                        <p className="text-sm opacity-70">استخدم القائمة في الأسفل لاختيار أدواتك المفضلة.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {activeShortcuts.map(action => (
                            <button
                                key={action.id}
                                onClick={() => handleShortcutClick(action)}
                                className={`
                                    flex flex-col items-center justify-center p-6 rounded-[2rem] transition-all duration-500 group relative overflow-hidden
                                    ${ts.card}
                                `}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ${ts.iconBox} relative overflow-hidden`}>
                                    {isZellige && (
                                        <div className={`absolute inset-0 opacity-20 bg-${settings.theme === 'zellige' ? 'zellige-pattern' : 'zellige-v2-pattern'} mix-blend-multiply pointer-events-none`}></div>
                                    )}
                                    <action.icon size={26} strokeWidth={2.5} className="relative z-10" />
                                </div>
                                <h3 className={`font-bold text-sm text-center ${settings.theme === 'instagram' ? 'text-gray-700' : ts.title}`}>{action.label}</h3>
                                
                                {/* Hover Glow */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </section>

        {/* Configuration Section */}
        <section className={`p-8 rounded-[2.5rem] border ${ts.configBg}`}>
            <h3 className={`text-xl font-black mb-6 flex items-center gap-2 ${ts.title}`}>
                <Settings size={20}/> تخصيص القائمة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {AVAILABLE_ACTIONS.map(action => {
                    const isSelected = userShortcuts.includes(action.id);
                    return (
                        <div 
                            key={action.id}
                            onClick={() => toggleShortcut(action.id)}
                            className={`
                                flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border-2
                                ${isSelected ? ts.activeItem : ts.inactiveItem}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <action.icon size={20} strokeWidth={2.5} />
                                <span className="font-bold text-sm">{action.label}</span>
                            </div>
                            <div className={`p-1 rounded-full ${isSelected ? 'bg-white/20' : ''}`}>
                                {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    </div>
  );
};
