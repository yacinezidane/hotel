
import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { PrintButton } from '../components/PrintButton';
import { HallBookingTicket } from '../components/HallBookingTicket';
import { 
    PartyPopper, Plus, Calendar, Users, DollarSign, Check, X, 
    Printer, Ticket, QrCode, Mic2, Music, Monitor, Layout, Utensils, 
    Armchair, LayoutGrid, Coffee, ChefHat, Save, CheckCircle, Clock, MapPin
} from 'lucide-react';
import { HallBooking, HallLayoutStyle, HallCateringType } from '../types';

export const EventsPage: React.FC = () => {
  const { hallBookings, addHallBooking, cancelHallBooking, settings, addQRRecord, currentUser, activities } = useHotel();
  const [activeTab, setActiveTab] = useState<'calendar' | 'list' | 'activities'>('calendar');
  const [showModal, setShowModal] = useState(false);

  const canPrintTickets = ['manager', 'assistant_manager', 'reception_manager', 'receptionist'].includes(currentUser?.role || '');
  
  // New Booking State - Professional Details
  const [newBooking, setNewBooking] = useState<Partial<HallBooking>>({
      eventType: 'wedding',
      startDate: new Date().toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '23:00',
      days: 1,
      guestCount: 50,
      price: 0,
      clientName: '',
      phone: '',
      paymentStatus: 'partial',
      layoutStyle: 'banquet',
      cateringType: 'coffee_break',
      resources: []
  });

  const resourcesList = [
      { id: 'mic', label: 'ميكروفون (Wireless)', icon: Mic2 },
      { id: 'sound', label: 'نظام صوتي (DJ)', icon: Music },
      { id: 'projector', label: 'عرض داتاشو', icon: Monitor },
      { id: 'stage', label: 'منصة مسرح', icon: Layout },
      { id: 'wifi', label: 'واي فاي مخصص', icon: QrCode },
  ];

  // Visual options for Layout Style
  const layoutOptions: { id: HallLayoutStyle, label: string, icon: any }[] = [
      { id: 'theater', label: 'مسرح', icon: Users },
      { id: 'classroom', label: 'فصل دراسي', icon: LayoutGrid },
      { id: 'u_shape', label: 'اجتماع U-Shape', icon: Users },
      { id: 'banquet', label: 'مآدبة (طاولات دائرية)', icon: Armchair },
      { id: 'reception', label: 'حفل استقبال (وقوف)', icon: PartyPopper },
  ];

  // Visual options for Catering
  const cateringOptions: { id: HallCateringType, label: string, icon: any }[] = [
      { id: 'none', label: 'بدون إطعام', icon: X },
      { id: 'coffee_break', label: 'استراحة قهوة', icon: Coffee },
      { id: 'buffet_lunch', label: 'بوفيه مفتوح', icon: Utensils },
      { id: 'gala_dinner', label: 'عشاء فاخر', icon: ChefHat },
      { id: 'snacks', label: 'مقبلات خفيفة', icon: Utensils },
  ];

  const toggleResource = (id: string) => {
      setNewBooking(prev => {
          const res = prev.resources || [];
          return { ...prev, resources: res.includes(id) ? res.filter(r => r !== id) : [...res, id] };
      });
  };

  const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      if (newBooking.clientName) {
          const bookingId = `hall-${Date.now()}`;
          addHallBooking({
              id: bookingId,
              ...newBooking as any,
              status: 'confirmed'
          });

          // Create Access QR Code for the event automatically
          addQRRecord({
              type: 'hall',
              referenceId: bookingId,
              title: newBooking.clientName || 'Event',
              subtitle: `${newBooking.eventType} (${newBooking.guestCount} Pax)`,
              status: 'valid',
              dataPayload: `HALL:${bookingId}`
          }, 'access_pass');

          setShowModal(false);
          setNewBooking({
              eventType: 'wedding', startDate: new Date().toISOString().split('T')[0], startTime: '14:00', endTime: '23:00', days: 1, guestCount: 50, price: 0, clientName: '', phone: '', paymentStatus: 'partial', layoutStyle: 'banquet', cateringType: 'coffee_break', resources: []
          });
      }
  };

  // --- THEME STYLES ---
  const isZellige = settings.theme === 'zellige' || settings.theme === 'zellige-v2';
  const isDark = settings.darkMode;

  const ts = {
      timelineItem: isZellige 
          ? (isDark ? 'bg-[#002a2d] border-l-4 border-[#cca43b] shadow-lg shadow-[#cca43b]/10' : 'bg-[#FDFBF7] border-l-4 border-[#006269] shadow-sm')
          : 'bg-white dark:bg-gray-800 border-l-4 border-purple-500 shadow-sm',
      
      button: isZellige 
          ? (isDark ? 'bg-[#cca43b] text-[#001e21] hover:bg-[#b38f30]' : 'bg-[#006269] text-[#cca43b] hover:bg-[#004d53]')
          : 'bg-purple-600 text-white hover:bg-purple-700',
      
      modalBg: isZellige 
          ? (isDark ? 'bg-[#001e21]' : 'bg-[#FDFBF7]')
          : 'bg-white dark:bg-gray-900',
      
      modalHeader: isZellige 
          ? (isDark ? 'bg-[#002a2d] text-[#cca43b] border-b border-[#cca43b]/30' : 'bg-[#006269] text-[#cca43b] border-b-8 border-[#cca43b]')
          : 'bg-slate-900 text-white',
      
      modalInput: isZellige 
          ? (isDark ? 'border-[#cca43b]/30 focus:border-[#cca43b] bg-[#001012] text-[#cca43b] placeholder-[#cca43b]/30' : 'border-[#cca43b]/40 focus:border-[#006269] bg-[#fbf8f1] text-[#006269]')
          : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-white',
      
      selectionActive: isZellige 
          ? (isDark ? 'bg-[#cca43b] text-[#001e21] border-[#cca43b] ring-2 ring-[#cca43b]/50' : 'bg-[#006269] text-[#cca43b] border-[#cca43b] ring-2 ring-[#cca43b]/50')
          : 'bg-purple-600 text-white shadow-md',
      
      selectionInactive: isZellige 
          ? (isDark ? 'bg-[#002a2d] border-[#cca43b]/20 text-[#cca43b]/60 hover:bg-[#cca43b]/10' : 'bg-white border-[#cca43b]/20 text-gray-500 hover:bg-[#cca43b]/5')
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400',
      
      badgePattern: isZellige ? 'bg-zellige-pattern' : '',
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
        <PageHeader pageKey="events" defaultTitle="قاعات المناسبات والمؤتمرات" icon={PartyPopper} />

        <div className="flex justify-between items-center mb-6">
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shadow-inner">
                <button onClick={() => setActiveTab('calendar')} className={`px-6 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'calendar' ? 'bg-white dark:bg-gray-700 shadow text-black dark:text-white' : 'text-gray-500'}`}>الجدول الزمني</button>
                <button onClick={() => setActiveTab('list')} className={`px-6 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'list' ? 'bg-white dark:bg-gray-700 shadow text-black dark:text-white' : 'text-gray-500'}`}>القائمة</button>
                <button onClick={() => setActiveTab('activities')} className={`px-6 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'activities' ? 'bg-white dark:bg-gray-700 shadow text-black dark:text-white' : 'text-gray-500'}`}>الأنشطة اليومية</button>
            </div>
            <button onClick={() => setShowModal(true)} className={`px-6 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2 transition transform hover:-translate-y-1 ${ts.button}`}>
                <Plus size={20} /> حجز قاعة
            </button>
        </div>

        {activeTab === 'calendar' && (
            <div className="space-y-4">
                {hallBookings.sort((a,b) => a.startDate.localeCompare(b.startDate)).map(booking => (
                    <div key={booking.id} className={`p-5 rounded-[2rem] flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden transition hover:shadow-md ${ts.timelineItem}`}>
                        {isZellige && <div className={`absolute inset-0 opacity-10 ${isDark ? 'mix-blend-screen opacity-20' : 'mix-blend-multiply'} bg-zellige-pattern pointer-events-none`}></div>}
                        
                        <div className="text-center min-w-[80px] relative z-10">
                            <span className={`block text-3xl font-black ${isZellige && isDark ? 'text-[#cca43b]' : 'text-gray-800 dark:text-gray-200'}`}>{new Date(booking.startDate).getDate()}</span>
                            <span className={`text-xs font-bold uppercase ${isZellige && isDark ? 'text-[#cca43b]/70' : 'text-gray-500'}`}>{new Date(booking.startDate).toLocaleString('default', { month: 'short' })}</span>
                        </div>
                        
                        <div className="flex-1 relative z-10">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className={`font-bold text-lg ${isZellige && isDark ? 'text-[#f0c04a]' : 'text-gray-900 dark:text-white'}`}>{booking.clientName}</h4>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isZellige && isDark ? 'bg-[#cca43b]/20 text-[#cca43b]' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{booking.phone}</span>
                            </div>
                            <div className={`flex flex-wrap gap-4 text-xs font-bold mt-2 ${isZellige && isDark ? 'text-[#cca43b]/60' : 'text-gray-500'}`}>
                                <span className="flex items-center gap-1"><Clock size={14}/> {booking.startTime} - {booking.endTime}</span>
                                <span className="flex items-center gap-1"><Users size={14}/> {booking.guestCount} ضيف</span>
                                {booking.tableCount && <span className="flex items-center gap-1"><LayoutGrid size={14}/> {booking.tableCount} طاولة</span>}
                                {booking.seatCount && <span className="flex items-center gap-1"><Users size={14}/> {booking.seatCount} كرسي</span>}
                                <span className="flex items-center gap-1"><Utensils size={14}/> {cateringOptions.find(c => c.id === booking.cateringType)?.label}</span>
                                <span className="flex items-center gap-1"><Layout size={14}/> {layoutOptions.find(l => l.id === booking.layoutStyle)?.label}</span>
                            </div>
                            
                            {booking.resources && booking.resources.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {booking.resources.map(r => (
                                        <span key={r} className={`px-2 py-1 rounded text-[10px] font-bold border ${isZellige && isDark ? 'bg-[#cca43b]/10 text-[#cca43b] border-[#cca43b]/30' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border-blue-100 dark:border-blue-800'}`}>
                                            {resourcesList.find(x=>x.id===r)?.label}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="text-right relative z-10">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-black ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {booking.status === 'confirmed' ? 'مؤكد' : booking.status}
                            </span>
                            <div className="mt-2 text-xs font-mono font-bold opacity-60">ID: {booking.id.slice(-6)}</div>
                            <div className="mt-2">
                                {canPrintTickets && (
                                    <PrintButton 
                                        label="طباعة"
                                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold hover:bg-gray-200"
                                        variants={['modern', 'classic', 'minimal', 'elegant', 'technical', 'compact']}
                                        defaultVariant="modern"
                                        renderContent={(variant) => (
                                            <HallBookingTicket 
                                                booking={booking}
                                                appName={settings.appName}
                                                layoutLabel={layoutOptions.find(l => l.id === booking.layoutStyle)?.label || booking.layoutStyle}
                                                cateringLabel={cateringOptions.find(c => c.id === booking.cateringType)?.label || booking.cateringType}
                                                variant={variant}
                                            />
                                        )}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {hallBookings.length === 0 && (
                    <div className="text-center py-20 text-gray-400 font-bold border-2 border-dashed rounded-[3rem]">
                        <Calendar size={48} className="mx-auto mb-4 opacity-20"/>
                        الجدول الزمني فارغ. أضف حجوزات جديدة.
                    </div>
                )}
            </div>
        )}

        {activeTab === 'activities' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.map(activity => (
                    <div key={activity.id} className={`p-5 rounded-[2rem] border relative overflow-hidden transition hover:shadow-lg group ${ts.timelineItem}`}>
                        {isZellige && <div className={`absolute inset-0 opacity-10 ${isDark ? 'mix-blend-screen opacity-20' : 'mix-blend-multiply'} bg-zellige-pattern pointer-events-none`}></div>}
                        
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${isZellige && isDark ? 'bg-[#cca43b]/20 text-[#cca43b]' : 'bg-blue-100 text-blue-700'}`}>
                                    {activity.type}
                                </span>
                                {activity.isPaid && <span className="text-xs font-black text-green-600 bg-green-100 px-2 py-1 rounded-lg">{activity.price} د.ج</span>}
                            </div>
                            
                            <h3 className={`text-xl font-black mb-2 ${isZellige && isDark ? 'text-[#f0c04a]' : 'text-gray-900 dark:text-white'}`}>{activity.title}</h3>
                            <p className={`text-xs font-medium mb-4 line-clamp-2 ${isZellige && isDark ? 'text-[#cca43b]/70' : 'text-gray-500'}`}>{activity.description}</p>
                            
                            <div className="space-y-2 text-xs font-bold opacity-80">
                                <div className="flex items-center gap-2"><Clock size={14}/> {activity.startTime} - {activity.endTime}</div>
                                <div className="flex items-center gap-2"><MapPin size={14}/> {activity.location}</div>
                                <div className="flex items-center gap-2"><Calendar size={14}/> {activity.days.join(', ')}</div>
                            </div>
                        </div>
                    </div>
                ))}
                {activities.length === 0 && (
                     <div className="col-span-full text-center py-20 text-gray-400 font-bold border-2 border-dashed rounded-[3rem]">
                        <PartyPopper size={48} className="mx-auto mb-4 opacity-20"/>
                        لا توجد أنشطة حالياً.
                    </div>
                )}
            </div>
        )}

        {/* --- PROFESSIONAL BOOKING MODAL --- */}
        {showModal && (
            <div className="fixed inset-0 bg-black/70 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-sm overflow-hidden">
                <div className={`w-full max-w-4xl rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl relative flex flex-col h-[100dvh] md:h-[90vh] overflow-hidden ${ts.modalBg} border border-white/10 animate-fade-in-up`}>
                    
                    {/* Header */}
                    <div className={`p-6 flex justify-between items-center shrink-0 shadow-sm relative z-30 ${ts.modalHeader}`}>
                        {isZellige && <div className={`absolute inset-0 opacity-20 pointer-events-none ${ts.badgePattern} ${isDark ? 'mix-blend-screen' : 'mix-blend-multiply'}`}></div>}
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md"><PartyPopper size={24}/></div>
                            <div>
                                <h3 className="text-2xl font-black">حجز قاعة جديد</h3>
                                <p className="text-xs font-bold opacity-80">New Event Booking</p>
                            </div>
                        </div>
                        <button onClick={() => setShowModal(false)} className="relative z-10 p-2 rounded-full hover:bg-white/20 transition text-current"><X size={24}/></button>
                    </div>
                    
                    <form onSubmit={handleAdd} className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 pb-24 space-y-8">
                        
                        {/* 1. Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold mb-2 opacity-70">اسم العميل / الجهة</label>
                                <input required type="text" placeholder="الاسم الكامل" value={newBooking.clientName} onChange={e => setNewBooking({...newBooking, clientName: e.target.value})} className={`w-full p-4 rounded-2xl border-2 font-bold outline-none ${ts.modalInput}`}/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-2 opacity-70">رقم الهاتف للتواصل</label>
                                <input type="tel" placeholder="05..." value={newBooking.phone} onChange={e => setNewBooking({...newBooking,phone: e.target.value})} className={`w-full p-4 rounded-2xl border-2 font-bold outline-none ${ts.modalInput}`}/>
                            </div>
                        </div>

                        {/* 2. Timing & Attendance */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[2rem] border border-gray-200 dark:border-gray-700">
                            <h4 className="font-black text-sm mb-4 flex items-center gap-2 opacity-70"><Clock size={16}/> التوقيت والحضور</h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold mb-1 opacity-70">تاريخ الحدث</label>
                                    <input required type="date" value={newBooking.startDate} onChange={e => setNewBooking({...newBooking, startDate: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.modalInput}`}/>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold mb-1 opacity-70">من الساعة</label>
                                    <input type="time" value={newBooking.startTime} onChange={e => setNewBooking({...newBooking, startTime: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.modalInput}`}/>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold mb-1 opacity-70">إلى الساعة</label>
                                    <input type="time" value={newBooking.endTime} onChange={e => setNewBooking({...newBooking, endTime: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.modalInput}`}/>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold mb-1 opacity-70">عدد الضيوف</label>
                                    <input type="number" value={newBooking.guestCount} onChange={e => setNewBooking({...newBooking, guestCount: Number(e.target.value)})} className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.modalInput}`}/>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold mb-1 opacity-70">عدد الطاولات</label>
                                    <input type="number" value={newBooking.tableCount || ''} onChange={e => setNewBooking({...newBooking, tableCount: Number(e.target.value)})} className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.modalInput}`}/>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold mb-1 opacity-70">عدد الكراسي</label>
                                    <input type="number" value={newBooking.seatCount || ''} onChange={e => setNewBooking({...newBooking, seatCount: Number(e.target.value)})} className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.modalInput}`}/>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold mb-1 opacity-70">نوع الحدث</label>
                                    <select value={newBooking.eventType} onChange={e => setNewBooking({...newBooking, eventType: e.target.value as any})} className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.modalInput}`}>
                                        <option value="wedding">حفل زفاف</option>
                                        <option value="meeting">اجتماع عمل</option>
                                        <option value="conference">مؤتمر / ندوة</option>
                                        <option value="party">حفلة خاصة</option>
                                        <option value="workshop">ورشة عمل</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 3. Layout Style (Visual Selection) */}
                        <div>
                            <label className="block text-xs font-bold mb-3 opacity-70">تخطيط القاعة (Seating Plan)</label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {layoutOptions.map(layout => (
                                    <button 
                                        key={layout.id} 
                                        type="button"
                                        onClick={() => setNewBooking({...newBooking, layoutStyle: layout.id})}
                                        className={`p-3 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${newBooking.layoutStyle === layout.id ? ts.selectionActive : ts.selectionInactive}`}
                                    >
                                        <layout.icon size={24} strokeWidth={1.5} />
                                        <span className="text-[10px] font-bold">{layout.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 4. Catering (Visual Selection) */}
                        <div>
                            <label className="block text-xs font-bold mb-3 opacity-70">باقة الطعام (Catering)</label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {cateringOptions.map(cat => (
                                    <button 
                                        key={cat.id} 
                                        type="button"
                                        onClick={() => setNewBooking({...newBooking, cateringType: cat.id})}
                                        className={`p-3 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${newBooking.cateringType === cat.id ? ts.selectionActive : ts.selectionInactive}`}
                                    >
                                        <cat.icon size={24} strokeWidth={1.5} />
                                        <span className="text-[10px] font-bold">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 5. Resources & Price */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-bold mb-3 opacity-70">التجهيزات المطلوبة</label>
                                <div className="flex flex-wrap gap-2">
                                    {resourcesList.map(res => (
                                        <button 
                                            key={res.id} 
                                            type="button" 
                                            onClick={() => toggleResource(res.id)}
                                            className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2 transition text-xs font-bold ${newBooking.resources?.includes(res.id) ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-500'}`}
                                        >
                                            <res.icon size={14}/> {res.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-2 opacity-70">السعر الإجمالي (د.ج)</label>
                                <div className="relative">
                                    <input type="number" value={newBooking.price} onChange={e => setNewBooking({...newBooking, price: Number(e.target.value)})} className={`w-full p-4 pl-12 rounded-2xl border-2 font-black text-xl outline-none ${ts.modalInput}`}/>
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30"/>
                                </div>
                            </div>
                        </div>

                    </form>

                    <div className={`p-4 md:p-6 border-t dark:border-gray-700 flex justify-end gap-3 md:gap-4 absolute bottom-0 w-full z-20 pb-safe ${ts.modalBg}`}>
                        <button type="button" onClick={() => setShowModal(false)} className={`px-8 py-4 rounded-2xl font-bold transition text-sm ${isZellige && isDark ? 'bg-[#002a2d] text-[#cca43b] hover:bg-[#cca43b]/10' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>إلغاء</button>
                        <button onClick={handleAdd} className={`px-12 py-4 rounded-2xl font-black shadow-xl transition flex items-center justify-center gap-3 text-sm ${ts.button}`}>
                            <Save size={20} /> تأكيد الحجز
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
