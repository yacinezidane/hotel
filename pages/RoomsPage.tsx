
import React, { useState, useEffect, useRef } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { RoomCard } from '../components/RoomCard';
import { Room, RoomStatus, RoomType, GuestInfo, Booking } from '../types';
import { RegistrationCard } from '../components/RegistrationCard';
import { PrintButton } from '../components/PrintButton';
import { 
    BedDouble, Plus, X, Check, Search, Calendar as CalendarIcon, 
    CheckCircle, Camera, User, FileText, QrCode, Grid, List, Key, GitFork, 
    ArrowRightLeft, Printer, Scan, Languages, Heart, MapPin, Image, Trash2, 
    CreditCard, Phone, UserCheck, Banknote, AlertCircle, Bookmark, Copy, ExternalLink, Wallet,
    UserPlus, LogOut
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { renderToStaticMarkup } from 'react-dom/server';
import { printDocument } from '../utils/print';
import { getThemeStyles } from '../utils/themeStyles';

export const RoomsPage: React.FC = () => {
  const { rooms, bookings, updateRoomStatus, updateRoomType, currentUser, addBooking, moveBooking, splitBooking, settings, searchGuest, regenerateBookingQR, addGuestToRoom, checkOut, addNotification } = useHotel();
  const ts = getThemeStyles(settings);
  
  // --- VIEW STATE ---
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // --- FILTERS ---
  const [filterStatus, setFilterStatus] = useState<RoomStatus | 'all'>('all');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'active' | 'pending' | 'completed' | 'cancelled'>('all');

  // --- MODAL STATES ---
  const [showModal, setShowModal] = useState(false);
  const [bookingMode, setBookingMode] = useState<'check_in' | 'reservation'>('check_in');
  
  // --- MANAGEMENT MODALS ---
  const [showManageModal, setShowManageModal] = useState<Booking | null>(null);
  const [showQRModal, setShowQRModal] = useState<Booking | null>(null);
  const [showRoomAssignModal, setShowRoomAssignModal] = useState<Booking | null>(null);
  const [successVoucher, setSuccessVoucher] = useState<{ booking: Booking, type: 'check_in' | 'reservation', url: string } | null>(null);
  
  // --- NEW: Occupied Room Management ---
  const [selectedOccupiedBooking, setSelectedOccupiedBooking] = useState<Booking | null>(null);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  // const [printGuest, setPrintGuest] = useState<GuestInfo | null>(null); // Removed state

  // --- FORM DATA STATE ---
  const [newBooking, setNewBooking] = useState({
      roomId: 0,
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: '',
      // Reservation Specifics
      bookerName: '', // Person making the booking
      bookerPhone: '',
      beneficiaryName: '', // Guest Name (if different/unknown)
      totalPrice: 0,
      paidAmount: 0,
      paymentStatus: 'unpaid' as 'paid' | 'partial' | 'unpaid',
      notes: ''
  });
  
  // Guest Identity Data (For Check-in)
  const [guestData, setGuestData] = useState<GuestInfo>({
      idType: 'بطاقة تعريف', idNumber: '', firstNameAr: '', lastNameAr: '', firstNameEn: '', lastNameEn: '',
      birthDate: '', birthPlace: '', fatherName: '', motherName: '', idPhoto: '',
      nationality: settings.defaultNationality, phone: ''
  });

  // Manage Actions State
  const [manageAction, setManageAction] = useState<'move' | 'split' | null>(null);
  const [moveTargetRoom, setMoveTargetRoom] = useState<number>(0);
  const [moveReason, setMoveReason] = useState('');
  const [movePrice, setMovePrice] = useState<string>('');
  const [splitGuests, setSplitGuests] = useState<number[]>([]);
  const [splitTargetRoom, setSplitTargetRoom] = useState<number>(0);
  const [splitPrice, setSplitPrice] = useState('');

  // Camera & Utils
  const [showCamera, setShowCamera] = useState(false);
  const [foundGuestData, setFoundGuestData] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const canEditRoom = currentUser?.permissions.allowedActions?.includes('edit_room') || currentUser?.role === 'manager';
  const canDeleteRoom = currentUser?.permissions.allowedActions?.includes('delete_room') || currentUser?.role === 'manager';
  const canEditBooking = currentUser?.permissions.allowedActions?.includes('edit_booking') || currentUser?.role === 'manager';
  const canDeleteBooking = currentUser?.permissions.allowedActions?.includes('cancel_booking') || currentUser?.role === 'manager';
  const canAddBooking = currentUser?.permissions.allowedActions?.includes('add_booking') || currentUser?.role === 'manager';

  // --- Derived Data ---
  const sortedRooms = [...rooms].sort((a, b) => a.id - b.id);
  const filteredRooms = filterStatus === 'all' ? sortedRooms : sortedRooms.filter(r => r.status === filterStatus);
  const filteredBookings = bookings.filter(b => bookingFilter === 'all' || b.status === bookingFilter);
  const availableRooms = rooms.filter(r => r.status === 'available');
  
  // Helper for generating portal link
  const generateGuestPortalLink = (booking: Booking) => {
      const room = rooms.find(r => r.id === booking.roomId);
      const portalPayload = JSON.stringify({
          type: 'room',
          id: room?.number || booking.roomId,
          name: booking.primaryGuestName,
          expiry: booking.checkOutDate || new Date(Date.now() + 86400000).toISOString()
      });
      // SAFE UNICODE ENCODING
      return `https://nuzul-hotel.com/guest-services?token=${btoa(unescape(encodeURIComponent(portalPayload)))}`;
  };

  // --- Handlers ---
  const handleRoomClick = (room: Room) => {
      // NEW: Handle Occupied Room
      if (room.status === 'occupied') {
          const booking = bookings.find(b => b.roomId === room.id && b.status === 'active');
          if (booking) {
              setSelectedOccupiedBooking(booking);
              return;
          }
      }

      setNewBooking(prev => ({ 
          ...prev, 
          roomId: room.id, 
          totalPrice: room.price 
      }));
      setBookingMode('check_in');
      setShowModal(true);
  };

  const handleIdSearch = () => {
      if (!guestData.idNumber) return;
      const found = searchGuest(guestData.idNumber);
      if (found) setFoundGuestData(found);
  };

  // NEW: Handle Add Guest Submit
  const handleAddGuestSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedOccupiedBooking) return;
      if (!guestData.firstNameAr || !guestData.lastNameAr) { addNotification('يرجى إدخال اسم النزيل', "warning"); return; }
      
      // Use newBooking.totalPrice if it was set in the modal, otherwise undefined to keep current price
      const newPrice = newBooking.totalPrice > 0 ? newBooking.totalPrice : undefined;

      addGuestToRoom(selectedOccupiedBooking.roomId, guestData, newPrice);
      setShowAddGuestModal(false);
      setGuestData({ idType: 'بطاقة تعريف', idNumber: '', firstNameAr: '', lastNameAr: '', firstNameEn: '', lastNameEn: '', birthDate: '', birthPlace: '', fatherName: '', motherName: '', idPhoto: '', nationality: settings.defaultNationality, phone: '' });
      setNewBooking(prev => ({ ...prev, totalPrice: 0 })); // Reset temp price
      
      // Refresh selected booking
      const updatedBooking = bookings.find(b => b.id === selectedOccupiedBooking.id);
      if (updatedBooking) setSelectedOccupiedBooking(updatedBooking);
  };

  const handlePrintGuest = (guest: GuestInfo) => {
      if (!selectedOccupiedBooking) return;
      printDocument({
          title: `Registration Card - ${guest.firstNameEn} ${guest.lastNameEn}`,
          content: (
              <RegistrationCard 
                  guest={guest} 
                  roomNumber={rooms.find(r => r.id === selectedOccupiedBooking.roomId)?.number}
                  checkInDate={selectedOccupiedBooking.checkInDate}
                  appName={settings.appName}
                  variant="modern"
              />
          ),
          settings
      });
  };

  const handlePrintVoucher = () => {
      if (!successVoucher) return;
      printDocument({
          title: `Booking Voucher - ${successVoucher.booking.id}`,
          content: `
              <div style="text-align: center; padding: 40px; border: 4px solid #000; border-radius: 20px; font-family: sans-serif;">
                  <h1 style="font-size: 36px; margin-bottom: 20px; font-weight: 900;">${successVoucher.type === 'check_in' ? 'تم الدخول بنجاح' : 'تم الحجز بنجاح'}</h1>
                  <h2 style="font-size: 24px; margin-bottom: 20px;">${successVoucher.booking.primaryGuestName}</h2>
                  <div style="margin: 20px auto; display: inline-block;">
                      ${renderToStaticMarkup(<QRCodeSVG value={successVoucher.url} size={200} />)}
                  </div>
                  <p style="font-size: 18px; font-weight: bold;">Room: ${rooms.find(r => r.id === successVoucher.booking.roomId)?.number}</p>
                  <p style="font-size: 18px;">Amount: ${successVoucher.booking.totalAmount} DZD</p>
                  <p style="font-size: 12px; color: #555; margin-top: 20px;">Scan to access guest portal</p>
              </div>
          `,
          settings
      });
  };

  // Effect to autofill guest data if found
  useEffect(() => {
      if (foundGuestData) {
          setGuestData(prev => ({...prev, ...foundGuestData}));
          setFoundGuestData(null);
      }
  }, [foundGuestData]);

  const startCamera = async () => {
      setShowCamera(true);
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) { addNotification("Could not access camera", "error"); setShowCamera(false); }
  };
  
  const capturePhoto = () => {
      if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          if (context) {
              canvas.width = video.videoWidth; canvas.height = video.videoHeight;
              context.drawImage(video, 0, 0, canvas.width, canvas.height);
              setGuestData(prev => ({ ...prev, idPhoto: canvas.toDataURL('image/jpeg', 0.8) }));
              setShowCamera(false);
              if (video.srcObject) (video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
          }
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Validation Logic
      if (!newBooking.roomId) { addNotification('يرجى اختيار الغرفة', "warning"); return; }
      
      if (bookingMode === 'check_in') {
          if (!guestData.firstNameAr || !guestData.lastNameAr) { addNotification('يرجى إدخال اسم النزيل', "warning"); return; }
      } else {
          // Reservation Mode Validation
          if (!newBooking.bookerName) { addNotification('يرجى إدخال اسم القائم بالحجز', "warning"); return; }
      }

      // Construct Booking Data
      const primaryName = bookingMode === 'check_in' 
          ? `${guestData.firstNameAr} ${guestData.lastNameAr}`
          : (newBooking.beneficiaryName || newBooking.bookerName);

      const finalStatus = bookingMode === 'check_in' ? 'active' : 'pending';
      
      let notes = newBooking.notes;
      if (bookingMode === 'reservation') {
          notes += ` | Booker: ${newBooking.bookerName} (${newBooking.bookerPhone})`;
      }
      
      // Handle Payment Status Notes
      const paymentNote = newBooking.paymentStatus === 'paid' ? 'مدفوع (فوري)' : 'غير مدفوع (عند الخروج)';
      notes += ` | Payment: ${paymentNote}`;

      const createdBooking = addBooking({
          guests: bookingMode === 'check_in' ? [guestData] : [],
          primaryGuestName: primaryName,
          roomId: newBooking.roomId,
          checkInDate: newBooking.checkInDate,
          checkOutDate: newBooking.checkOutDate,
          status: finalStatus,
          totalAmount: newBooking.totalPrice,
          mealPlan: 'room_only',
          companyName: bookingMode === 'reservation' ? newBooking.bookerName : undefined,
          extraServices: [],
          notes: notes
      }, [newBooking.roomId]);

      // If paid immediately, record transaction
      if (newBooking.paymentStatus === 'paid') {
          // logic to add transaction is handled in context usually, but for now we note it.
      }

      setShowModal(false);
      
      const portalLink = generateGuestPortalLink(createdBooking);
      setSuccessVoucher({ 
          booking: { ...createdBooking, totalAmount: newBooking.totalPrice }, 
          type: bookingMode, 
          url: portalLink 
      });

      // Reset
      setNewBooking({ roomId: 0, checkInDate: new Date().toISOString().split('T')[0], checkOutDate: '', bookerName: '', bookerPhone: '', beneficiaryName: '', totalPrice: 0, paidAmount: 0, paymentStatus: 'unpaid', notes: '' });
      setGuestData({ idType: 'بطاقة تعريف', idNumber: '', firstNameAr: '', lastNameAr: '', firstNameEn: '', lastNameEn: '', birthDate: '', birthPlace: '', fatherName: '', motherName: '', idPhoto: '', nationality: settings.defaultNationality, phone: '' });
  };

  const confirmMove = () => { if (showManageModal && moveTargetRoom) { moveBooking(showManageModal.id, moveTargetRoom, moveReason, movePrice ? Number(movePrice) : undefined); setShowManageModal(null); setManageAction(null); setMoveTargetRoom(0); setMovePrice(''); } };
  const confirmSplit = () => { if (showManageModal && splitTargetRoom && splitPrice) { splitBooking(showManageModal.id, splitGuests, splitTargetRoom, Number(splitPrice)); setShowManageModal(null); setManageAction(null); setSplitGuests([]); } };

  // Handle Room Assignment for Pending Bookings
  const handleAssignRoom = () => {
      if (showRoomAssignModal && moveTargetRoom) {
          moveBooking(showRoomAssignModal.id, moveTargetRoom, 'تسكين الحجز المعلق');
          updateRoomStatus(moveTargetRoom, 'occupied');
          setShowRoomAssignModal(null);
          setMoveTargetRoom(0);
          addNotification('تم تسكين الحجز بنجاح', "success");
      }
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <PageHeader pageKey="accommodation" defaultTitle="إدارة الإقامة (الغرف والحجوزات)" icon={BedDouble} />

      {/* Main Tabs */}
      <div className="flex justify-center mb-6 px-4">
          <div className={`p-1.5 rounded-2xl shadow-sm flex flex-wrap justify-center items-center gap-2 border ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] border-[#cca43b]/20' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}>
              <button onClick={() => setViewMode('grid')} className={`px-4 md:px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all text-sm md:text-base ${viewMode === 'grid' ? ts.activeTab : ts.inactiveTab}`}><Grid size={18}/> شبكة الغرف</button>
              <button onClick={() => setViewMode('list')} className={`px-4 md:px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all text-sm md:text-base ${viewMode === 'list' ? ts.activeTab : ts.inactiveTab}`}><List size={18}/> سجل الحجوزات</button>
          </div>
      </div>

      {/* --- GRID VIEW (ROOMS) --- */}
      {viewMode === 'grid' && (
          <div className="animate-fade-in">
              <div className="flex flex-wrap gap-2 mb-6">
                  {['all', 'available', 'occupied', 'dirty', 'maintenance', 'booked'].map((status) => (
                      <button key={status} onClick={() => setFilterStatus(status as any)} className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${filterStatus === status ? (settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b] text-[#001e21] shadow-lg' : 'bg-black text-white dark:bg-white dark:text-black shadow-lg') : (settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] text-[#cca43b]/60 hover:bg-[#cca43b]/10' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100')}`}>{status === 'all' ? 'الكل' : status}</button>
                  ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                  {filteredRooms.map(room => {
                      const activeBooking = bookings.find(b => b.roomId === room.id && (b.status === 'active' || b.status === 'pending'));
                      return <RoomCard key={room.id} room={room} canEdit={canEditRoom} onStatusChange={updateRoomStatus} onTypeChange={updateRoomType} onClick={handleRoomClick} activeBooking={activeBooking} />;
                  })}
              </div>
          </div>
      )}

      {/* --- LIST VIEW (BOOKINGS) --- */}
      {viewMode === 'list' && (
          <div className="animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div className={`flex p-1 rounded-xl shadow-inner overflow-x-auto max-w-full ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] border border-[#cca43b]/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      {['all', 'active', 'pending', 'completed', 'cancelled'].map(f => (
                          <button key={f} onClick={() => setBookingFilter(f as any)} className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${bookingFilter === f ? (settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b] text-[#001e21] shadow-md' : 'bg-white shadow text-black dark:bg-gray-700 dark:text-white') : (settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]/60 hover:text-[#cca43b]' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400')}`}>{f === 'all' ? 'الكل' : f}</button>
                      ))}
                  </div>
              {canAddBooking && (
                <button onClick={() => setShowModal(true)} className={`w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl shadow-lg font-bold transition transform hover:-translate-y-1 ${ts.button}`}><Plus size={20} /> حجز جديد</button>
            )}
              </div>
              <div className={`rounded-[2.5rem] shadow-sm overflow-x-auto border ${ts.sectionCard}`}>
                  <table className="w-full text-sm text-right min-w-[600px]">
                      <thead className={`${ts.tableHeader} font-bold`}><tr><th className="p-4">الرقم</th><th className="p-4">النزيل</th><th className="p-4">الغرفة</th><th className="p-4">الدخول</th><th className="p-4">الحالة</th><th className="p-4">إجراءات</th></tr></thead>
                      <tbody className={`divide-y ${settings.darkMode && settings.theme === 'zellige' ? 'divide-[#cca43b]/10' : 'divide-gray-100 dark:divide-gray-700'}`}>
                          {filteredBookings.map(booking => (
                              <tr key={booking.id} className={`${ts.tableRow} transition`}>
                                  <td className={`p-4 font-mono text-xs ${ts.tableSubText}`}>{booking.id.slice(-6).toUpperCase()}</td>
                                  <td className={`p-4 font-bold ${ts.tableText}`}>{booking.primaryGuestName}</td>
                                  <td className="p-4">{booking.roomId ? <span className={`px-2 py-1 rounded font-black ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/20 text-[#cca43b]' : 'bg-blue-50 text-blue-600'}`}>{rooms.find(r=>r.id===booking.roomId)?.number}</span> : '--'}</td>
                                  <td className={`p-4 ${ts.tableText}`}>{new Date(booking.checkInDate).toLocaleDateString()}</td>
                                  <td className="p-4"><span className={`px-2 py-1 rounded-lg text-xs font-bold ${booking.status === 'active' ? 'bg-green-100 text-green-700' : booking.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>{booking.status}</span></td>
                                  <td className="p-4 flex gap-2">
                                      {booking.status === 'active' && <><button onClick={() => { setShowManageModal(booking); setManageAction('move'); }} className={`p-2 rounded-lg ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/10 text-[#cca43b] hover:bg-[#cca43b]/20' : 'bg-blue-50 text-blue-600'}`}><ArrowRightLeft size={16}/></button><button onClick={() => setShowQRModal(booking)} className={`p-2 rounded-lg ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] text-[#cca43b] border border-[#cca43b]/30' : 'bg-black text-white'}`}><QrCode size={16}/></button></>}
                                      {booking.status === 'pending' && <button onClick={() => setShowRoomAssignModal(booking)} className={`p-2 rounded-lg ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/10 text-[#cca43b] hover:bg-[#cca43b]/20' : 'bg-green-50 text-green-600'}`}><Key size={16}/></button>}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* --- UNIFIED BOOKING MODAL --- */}
      <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="تسجيل جديد"
          icon={FileText}
          size="xl"
      >
          <div className="flex flex-col h-full">
            <div className={`p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 border-b ${settings.darkMode && settings.theme === 'zellige' ? 'border-[#cca43b]/20' : 'border-gray-100 dark:border-gray-700'}`}>
                <div className={`relative z-10 flex p-1 rounded-xl w-full md:w-auto ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#001517] border border-[#cca43b]/30' : 'bg-black/10'}`}>
                    <button type="button" onClick={() => setBookingMode('check_in')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${bookingMode === 'check_in' ? (settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b] text-[#001e21]' : 'bg-white text-black shadow-md') : (settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]/50 hover:text-[#cca43b]' : 'text-gray-500 hover:bg-white/10')}`}>
                        <UserCheck size={16}/> دخول فوري (Check-in)
                    </button>
                    <button type="button" onClick={() => setBookingMode('reservation')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${bookingMode === 'reservation' ? (settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b] text-[#001e21]' : 'bg-white text-black shadow-md') : (settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]/50 hover:text-[#cca43b]' : 'text-gray-500 hover:bg-white/10')}`}>
                        <Bookmark size={16}/> حجز مسبق / للغير
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50 dark:bg-gray-900/50 pb-24 md:pb-32">
                
                {/* 1. Guest Identity & Camera (First Priority) */}
                {bookingMode === 'check_in' && (
                    <div className={`relative rounded-[2rem] overflow-hidden border-2 border-dashed ${ts.sectionCard}`}>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className={`text-lg font-black flex items-center gap-2 ${ts.icon}`}>
                                    <Scan size={20} /> وثيقة الهوية (ID Capture)
                                </h4>
                                {!showCamera && !guestData.idPhoto && (
                                    <button type="button" onClick={startCamera} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm ${ts.activeTab}`}>
                                        <Camera size={16} /> فتح الكاميرا
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className={`block text-[10px] font-bold uppercase mb-1 ${ts.inputLabel}`}>نوع الوثيقة</label>
                                        <div className="flex gap-2">
                                            {['بطاقة تعريف', 'جواز سفر', 'رخصة سياقة'].map(t => (
                                                <button key={t} type="button" onClick={() => setGuestData({...guestData, idType: t})} className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition ${guestData.idType === t ? (settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b] text-[#001e21] border-[#cca43b]' : 'bg-gray-800 text-white border-gray-800') : (settings.darkMode && settings.theme === 'zellige' ? 'bg-[#001517] text-[#cca43b] border-[#cca43b]/30' : 'bg-white text-gray-500 border-gray-200')}`}>{t}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className={`block text-[10px] font-bold uppercase mb-1 ${ts.inputLabel}`}>رقم الوثيقة</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                value={guestData.idNumber} 
                                                onChange={e => setGuestData({...guestData, idNumber: e.target.value.toUpperCase()})}
                                                onBlur={handleIdSearch}
                                                className={`w-full p-3 rounded-xl border-2 font-mono font-bold tracking-wider uppercase outline-none ${ts.modalInput}`} 
                                                placeholder="N° ID"
                                            />
                                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${ts.inputLabel}`} size={16}/>
                                        </div>
                                    </div>
                                </div>

                                <div className={`relative aspect-video rounded-2xl overflow-hidden flex items-center justify-center border-2 ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#001517] border-[#cca43b]/30' : 'bg-black/5 border-gray-200'}`}>
                                    {showCamera ? (
                                        <>
                                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                                            <div className="absolute inset-0 border-2 border-white/50 m-4 rounded-xl pointer-events-none"></div>
                                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                                                <button type="button" onClick={capturePhoto} className="w-14 h-14 bg-white rounded-full border-4 border-gray-300 shadow-lg"></button>
                                                <button type="button" onClick={() => setShowCamera(false)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white p-2 rounded-full"><X size={16}/></button>
                                            </div>
                                        </>
                                    ) : guestData.idPhoto ? (
                                        <div className="relative w-full h-full group">
                                            <img src={guestData.idPhoto} alt="ID" className="w-full h-full object-contain" />
                                            <button type="button" onClick={() => setGuestData({...guestData, idPhoto: ''})} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"><Trash2 size={16}/></button>
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <Image size={32} className="mx-auto mb-2 opacity-50"/>
                                            <p className="text-xs font-bold">لم يتم إرفاق صورة</p>
                                        </div>
                                    )}
                                    <canvas ref={canvasRef} className="hidden"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Personal Information Grid */}
                {bookingMode === 'check_in' ? (
                    <div className={`p-6 rounded-[2rem] border shadow-sm ${ts.sectionCard}`}>
                        <h4 className={`text-lg font-black mb-6 flex items-center gap-2 ${ts.inputLabel}`}><User size={20}/> البيانات الشخصية والعائلية</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* Arabic Names */}
                            <div className="space-y-4">
                                <h5 className="text-xs font-bold text-gray-400 uppercase border-b pb-1">الاسم واللقب (عربي)</h5>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold mb-1">الاسم</label>
                                        <input required type="text" dir="rtl" value={guestData.firstNameAr} onChange={e => setGuestData({...guestData, firstNameAr: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} placeholder="الاسم الأول"/>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold mb-1">اللقب</label>
                                        <input required type="text" dir="rtl" value={guestData.lastNameAr} onChange={e => setGuestData({...guestData, lastNameAr: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} placeholder="اللقب"/>
                                    </div>
                                </div>
                            </div>

                            {/* Latin Names */}
                            <div className="space-y-4">
                                <h5 className="text-xs font-bold text-gray-400 uppercase border-b pb-1 flex items-center gap-1"><Languages size={12}/> الاسم واللقب (Latin)</h5>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold mb-1">First Name</label>
                                        <input type="text" dir="ltr" value={guestData.firstNameEn} onChange={e => setGuestData({...guestData, firstNameEn: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold capitalize ${ts.modalInput}`} placeholder="First Name"/>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold mb-1">Surname</label>
                                        <input type="text" dir="ltr" value={guestData.lastNameEn} onChange={e => setGuestData({...guestData, lastNameEn: e.target.value.toUpperCase()})} className={`w-full p-3 rounded-xl border-2 font-bold uppercase ${ts.modalInput}`} placeholder="SURNAME"/>
                                    </div>
                                </div>
                            </div>

                            {/* Parents (Prominent) */}
                            <div className="space-y-4 md:col-span-2 bg-gray-50/50 p-4 rounded-xl border border-gray-200/50">
                                <h5 className="text-xs font-bold text-gray-400 uppercase border-b pb-1 flex items-center gap-1"><Heart size={12}/> معلومات الوالدين</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold mb-1">اسم الأب</label>
                                        <input type="text" value={guestData.fatherName} onChange={e => setGuestData({...guestData, fatherName: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} placeholder="اسم الأب"/>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold mb-1">اسم ولقب الأم</label>
                                        <input type="text" value={guestData.motherName} onChange={e => setGuestData({...guestData, motherName: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} placeholder="الاسم الكامل للأم"/>
                                    </div>
                                </div>
                            </div>

                            {/* Birth Info & Contact */}
                            <div className="space-y-4">
                                <h5 className="text-xs font-bold text-gray-400 uppercase border-b pb-1 flex items-center gap-1"><MapPin size={12}/> الميلاد والاتصال</h5>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold mb-1">تاريخ الميلاد</label>
                                        <input type="date" value={guestData.birthDate} onChange={e => setGuestData({...guestData, birthDate: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`}/>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold mb-1">مكان الميلاد</label>
                                        <input type="text" value={guestData.birthPlace} onChange={e => setGuestData({...guestData, birthPlace: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} placeholder="الولاية / البلد"/>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold mb-1">الجنسية</label>
                                        <input type="text" value={guestData.nationality} onChange={e => setGuestData({...guestData, nationality: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} placeholder={settings.defaultNationality}/>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold mb-1">رقم الهاتف</label>
                                        <input type="tel" value={guestData.phone} onChange={e => setGuestData({...guestData, phone: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} placeholder="0550..."/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Reservation Mode Form (Booker Info)
                    <div className={`p-5 rounded-[2rem] border shadow-sm ${ts.sectionCard}`}>
                        <label className={`text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2 ${ts.inputLabel}`}><Bookmark size={16}/> بيانات الحجز (عن بعد / شركة)</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="اسم القائم بالحجز / الشركة" value={newBooking.bookerName} onChange={e => setNewBooking({...newBooking, bookerName: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} />
                            <input type="text" placeholder="رقم الهاتف" value={newBooking.bookerPhone} onChange={e => setNewBooking({...newBooking, bookerPhone: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} />
                            <input type="text" placeholder="اسم المستفيد (إن وجد)" value={newBooking.beneficiaryName} onChange={e => setNewBooking({...newBooking, beneficiaryName: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} />
                        </div>
                    </div>
                )}

                {/* 3. Room, Dates & Pricing */}
                <div className={`p-5 rounded-[2rem] border shadow-sm ${ts.sectionCard}`}>
                    <label className={`text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2 ${ts.inputLabel}`}><BedDouble size={16}/> تفاصيل الإقامة</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select 
                            value={newBooking.roomId}
                            onChange={e => {
                                const r = rooms.find(room => room.id === Number(e.target.value));
                                setNewBooking({...newBooking, roomId: Number(e.target.value), totalPrice: r ? r.price : 0});
                            }}
                            className={`w-full p-3 rounded-xl border-2 outline-none font-bold ${ts.modalInput}`}
                        >
                            <option value={0}>-- اختر الغرفة --</option>
                            {rooms.filter(r => bookingMode === 'check_in' ? r.status === 'available' : true).map(r => (
                                <option key={r.id} value={r.id}>غرفة {r.number} ({r.type}) - {r.price} د.ج</option>
                            ))}
                        </select>
                        <div className="relative">
                            <label className="absolute -top-2 right-2 text-[10px] font-bold bg-white px-1 text-gray-500">دخول</label>
                            <input type="date" value={newBooking.checkInDate} onChange={e => setNewBooking({...newBooking, checkInDate: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} />
                        </div>
                        <div className="relative">
                            <label className="absolute -top-2 right-2 text-[10px] font-bold bg-white px-1 text-gray-500">خروج (اختياري)</label>
                            <input type="date" value={newBooking.checkOutDate} onChange={e => setNewBooking({...newBooking, checkOutDate: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} />
                        </div>
                    </div>
                    
                    {/* Price & Payment Mode */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="absolute -top-2 right-2 text-[10px] font-bold bg-white px-1 text-gray-500">السعر المتفق عليه</label>
                            <input type="number" placeholder="0.00" value={newBooking.totalPrice} onChange={e => setNewBooking({...newBooking, totalPrice: Number(e.target.value)})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} />
                        </div>
                        
                        {/* Payment Timing Toggle */}
                        <div className={`flex gap-2 p-1.5 rounded-xl border ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#001517] border-[#cca43b]/30' : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                            <button 
                                type="button"
                                onClick={() => setNewBooking({...newBooking, paymentStatus: 'paid'})}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${newBooking.paymentStatus === 'paid' ? (settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b] text-[#001e21]' : 'bg-green-500 text-white shadow-md') : (settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]/50' : 'text-gray-500')}`}
                            >
                                <Banknote size={14}/> دفع فوري
                            </button>
                            <button 
                                type="button"
                                onClick={() => setNewBooking({...newBooking, paymentStatus: 'unpaid'})}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${newBooking.paymentStatus === 'unpaid' ? (settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b] text-[#001e21]' : 'bg-white shadow-md text-black') : (settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]/50' : 'text-gray-500')}`}
                            >
                                <Wallet size={14}/> عند الخروج
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => setShowModal(false)} className={`px-8 py-3 rounded-xl font-bold text-sm transition ${settings.theme === 'zellige' && settings.darkMode ? 'bg-[#002a2d] text-[#cca43b] hover:bg-[#cca43b]/10' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}>إلغاء</button>
                    <button type="submit" className={`px-10 py-3 rounded-xl font-black shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center gap-2 text-sm ${ts.button}`}>
                        <CheckCircle className="w-5 h-5" /> {bookingMode === 'check_in' ? 'إتمام التسجيل (Check-in)' : 'حفظ الحجز'}
                    </button>
                </div>
            </form>
          </div>
      </Modal>

      {/* --- SUCCESS VOUCHER MODAL --- */}
      <Modal
          isOpen={!!successVoucher}
          onClose={() => setSuccessVoucher(null)}
          title={successVoucher?.type === 'check_in' ? 'تم الدخول بنجاح' : 'تم الحجز بنجاح'}
          icon={CheckCircle}
          size="md"
      >
          <div className="p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-inner"><CheckCircle size={40} /></div>
              <p className="text-sm text-gray-500 font-bold mb-6">تم إنشاء السجل وتوليد رابط الوصول</p>
              
              <div className="bg-gray-50 w-full p-4 rounded-2xl mb-6 text-center border border-gray-100">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">النزيل</p>
                  <p className="font-black text-lg">{successVoucher?.booking.primaryGuestName}</p>
                  <div className="flex justify-center gap-4 mt-2 text-xs font-bold text-gray-600">
                      <span>غرفة: {rooms.find(r => r.id === successVoucher?.booking.roomId)?.number}</span>
                      <span>المبلغ: {successVoucher?.booking.totalAmount} د.ج</span>
                  </div>
              </div>

              <div className="flex gap-2 w-full">
                  <button onClick={() => successVoucher && window.open(successVoucher.url, '_blank')} className="flex-1 py-3 bg-black text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-800"><ExternalLink size={16}/> بوابة النزيل</button>
                  <button onClick={handlePrintVoucher} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-200"><Printer size={16}/> طباعة</button>
              </div>
          </div>
      </Modal>

      {/* --- QR MODAL --- */}
      <Modal
          isOpen={!!showQRModal}
          onClose={() => setShowQRModal(null)}
          title="المفتاح الرقمي"
          icon={QrCode}
          size="sm"
      >
          <div className="p-8 text-center">
              <div className="bg-black p-4 rounded-3xl inline-block mb-4">
                  <div className="bg-white p-2 rounded-xl">
                      {showQRModal && <QRCodeSVG value={generateGuestPortalLink(showQRModal)} size={200} />}
                  </div>
              </div>
              <p className="font-bold text-lg">{showQRModal?.primaryGuestName}</p>
              <p className="text-sm text-gray-500">غرفة {rooms.find(r=>r.id===showQRModal?.roomId)?.number}</p>
              
              <div className="flex justify-center mt-6">
                  <PrintButton
                      title={`Room Key - ${rooms.find(r=>r.id===showQRModal?.roomId)?.number}`}
                      label="طباعة المفتاح"
                      className="bg-black text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 flex items-center gap-2"
                      iconSize={18}
                      htmlContent={`
                          <div style="text-align: center; padding: 40px; border: 4px solid #000; border-radius: 20px; font-family: sans-serif;">
                              <h1 style="font-size: 36px; margin-bottom: 20px;">مفتاح الغرفة الرقمي</h1>
                              <h2 style="font-size: 48px; margin-bottom: 20px; font-weight: 900;">غرفة ${rooms.find(r=>r.id===showQRModal?.roomId)?.number}</h2>
                              <p style="font-size: 24px; margin-bottom: 30px;">${showQRModal?.primaryGuestName}</p>
                              <div style="margin-bottom: 40px; display: inline-block; padding: 20px; border: 2px dashed #ccc; border-radius: 20px;">
                                  ${renderToStaticMarkup(<QRCodeSVG value={showQRModal ? generateGuestPortalLink(showQRModal) : ''} size={400} level="H" includeMargin={true} />)}
                              </div>
                              <p style="font-size: 18px; color: #555;">امسح الرمز للوصول إلى خدمات الغرفة</p>
                          </div>
                      `}
                  />
              </div>
          </div>
      </Modal>

      {/* --- ROOM ASSIGN MODAL (For Pending Bookings) --- */}
      <Modal
          isOpen={!!showRoomAssignModal}
          onClose={() => setShowRoomAssignModal(null)}
          title="تسكين الحجز"
          icon={Key}
          size="md"
      >
          <div className="p-6 space-y-4">
              <div className="bg-white/50 p-4 rounded-2xl border">
                  <p className="text-xs font-bold text-gray-500 uppercase">النزيل</p>
                  <p className="font-black text-lg">{showRoomAssignModal?.primaryGuestName}</p>
              </div>
              
              <div>
                  <label className="block text-xs font-bold mb-2">اختر الغرفة المتاحة</label>
                  <select 
                      value={moveTargetRoom} 
                      onChange={(e) => setMoveTargetRoom(Number(e.target.value))}
                      className={`w-full p-4 rounded-2xl border-2 font-bold outline-none cursor-pointer ${ts.modalInput}`}
                  >
                      <option value={0}>-- اختر --</option>
                      {availableRooms.map(r => (
                          <option key={r.id} value={r.id}>غرفة {r.number} ({r.type})</option>
                      ))}
                  </select>
              </div>

              <button 
                  onClick={handleAssignRoom}
                  disabled={moveTargetRoom === 0}
                  className={`w-full py-4 rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 mt-4 ${moveTargetRoom === 0 ? 'bg-gray-300' : ts.button}`}
              >
                  <CheckCircle size={20}/> تأكيد التسكين
              </button>
          </div>
      </Modal>

      {/* --- MANAGE MODAL (Move/Split) --- */}
      <Modal
          isOpen={!!showManageModal}
          onClose={() => setShowManageModal(null)}
          title={manageAction === 'move' ? 'نقل النزيل' : 'فصل الحجز'}
          icon={manageAction === 'move' ? ArrowRightLeft : GitFork}
          size="md"
      >
          <div className="p-8 space-y-6 bg-gray-50/50 dark:bg-gray-900/50 pb-24 md:pb-32 modal-content-area">
              {manageAction === 'move' ? (
                  <>
                      <div className={`p-6 rounded-[2rem] border shadow-sm ${ts.sectionCard}`}>
                          <h4 className="font-bold text-sm mb-4 flex items-center gap-2"><BedDouble size={18}/> الغرفة الحالية</h4>
                          <div className="text-3xl font-black text-gray-800 dark:text-gray-200">
                              {rooms.find(r => r.id === showManageModal?.roomId)?.number}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">سيتم تحويل حالتها إلى "بحاجة لتنظيف" تلقائياً</p>
                      </div>
                      <div><label className={`block text-xs font-bold mb-2 uppercase tracking-wide opacity-80 ${ts.inputLabel}`}>الغرفة الجديدة</label><select value={moveTargetRoom} onChange={(e) => setMoveTargetRoom(Number(e.target.value))} className={`w-full p-4 rounded-2xl border-2 font-bold outline-none cursor-pointer ${ts.modalInput}`}><option value={0}>-- اختر غرفة متاحة --</option>{availableRooms.map(r => (<option key={r.id} value={r.id}>غرفة {r.number} ({r.type})</option>))}</select></div>
                      <div><label className={`block text-xs font-bold mb-2 uppercase tracking-wide opacity-80 ${ts.inputLabel}`}>سبب النقل (إداري)</label><input type="text" value={moveReason} onChange={e => setMoveReason(e.target.value)} className={`w-full p-4 rounded-2xl border-2 font-bold outline-none ${ts.modalInput}`} placeholder="مثال: عطل في التكييف، ترقية..."/></div>
                      <div>
                          <label className={`block text-xs font-bold mb-2 uppercase tracking-wide opacity-80 ${ts.inputLabel}`}>تحديث السعر الإجمالي (اختياري)</label>
                          <input type="number" value={movePrice} onChange={e => setMovePrice(e.target.value)} className={`w-full p-4 rounded-2xl border-2 font-bold outline-none ${ts.modalInput}`} placeholder={`السعر الحالي: ${showManageModal?.totalAmount} د.ج`}/>
                          <p className="text-[10px] text-gray-400 mt-1">اتركه فارغاً للإبقاء على السعر الحالي</p>
                      </div>
                  </>
              ) : (
                  <>
                      <div className={`p-6 rounded-[2rem] border shadow-sm ${ts.sectionCard}`}>
                          <h4 className="font-bold text-sm mb-4 flex items-center gap-2"><User size={18}/> تحديد النزلاء للفصل/النقل</h4>
                          <p className="text-xs text-gray-500 mb-4">اختر النزلاء الذين تريد نقلهم إلى غرفة أخرى (سيتم إنشاء حجز جديد لهم)</p>
                          <div className="space-y-2">
                              {showManageModal?.guests.map((g, idx) => (
                                  <label key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50">
                                      <input type="checkbox" checked={splitGuests.includes(idx)} onChange={() => setSplitGuests(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])} className="w-5 h-5 rounded text-blue-600"/>
                                      <span className="font-bold text-sm">{g.firstNameAr} {g.lastNameAr}</span>
                                  </label>
                              ))}
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4"><div><label className={`block text-xs font-bold mb-2 uppercase tracking-wide opacity-80 ${ts.inputLabel}`}>الغرفة الجديدة</label><select value={splitTargetRoom} onChange={(e) => setSplitTargetRoom(Number(e.target.value))} className={`w-full p-4 rounded-2xl border-2 font-bold outline-none cursor-pointer ${ts.modalInput}`}><option value={0}>-- اختر --</option>{availableRooms.map(r => (<option key={r.id} value={r.id}>غرفة {r.number}</option>))}</select></div><div><label className={`block text-xs font-bold mb-2 uppercase tracking-wide opacity-80 ${ts.inputLabel}`}>سعر الغرفة الجديدة</label><input type="number" value={splitPrice} onChange={e => setSplitPrice(e.target.value)} className={`w-full p-4 rounded-2xl border-2 font-bold outline-none ${ts.modalInput}`} placeholder="0.00"/></div></div>
                  </>
              )}
          </div>

          <div className={`p-3 border-t dark:border-gray-700 absolute bottom-0 w-full z-20 pb-safe mobile-hide-on-keyboard ${settings.theme === 'zellige' ? 'bg-[#FDFBF7]' : 'bg-white dark:bg-gray-900'}`}>
              {manageAction === 'move' ? (
                  <button onClick={confirmMove} disabled={moveTargetRoom === 0} className={`w-full py-3 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2 text-sm ${moveTargetRoom === 0 ? 'bg-gray-300 cursor-not-allowed' : ts.button}`}><Check size={18}/> تأكيد النقل</button>
              ) : (
                  <button onClick={confirmSplit} disabled={splitTargetRoom === 0 || splitGuests.length === 0 || !splitPrice} className={`w-full py-3 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2 text-sm ${splitTargetRoom === 0 || splitGuests.length === 0 ? 'bg-gray-300 cursor-not-allowed' : ts.button}`}><GitFork size={18}/> تأكيد الفصل وإنشاء الحجز</button>
              )}
          </div>
      </Modal>
    
      {/* --- OCCUPIED ROOM MODAL --- */}
      <Modal
          isOpen={!!selectedOccupiedBooking}
          onClose={() => setSelectedOccupiedBooking(null)}
          title={`غرفة ${rooms.find(r => r.id === selectedOccupiedBooking?.roomId)?.number}`}
          icon={BedDouble}
          size="xl"
      >
          <div className="p-6 space-y-6">
              {/* Booking Info */}
              <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">تاريخ الدخول</p>
                      <p className="font-black text-lg">{selectedOccupiedBooking && new Date(selectedOccupiedBooking.checkInDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">تاريخ الخروج</p>
                      <p className="font-black text-lg">{selectedOccupiedBooking?.checkOutDate ? new Date(selectedOccupiedBooking.checkOutDate).toLocaleDateString() : '---'}</p>
                  </div>
                  <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">إجمالي المبلغ</p>
                      <p className="font-black text-lg text-green-600">{selectedOccupiedBooking?.totalAmount} د.ج</p>
                  </div>
              </div>

              {/* Guests List */}
              <div>
                  <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-lg flex items-center gap-2"><User size={20}/> قائمة النزلاء ({selectedOccupiedBooking?.guests.length})</h4>
                      <button onClick={() => setShowAddGuestModal(true)} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm ${ts.button}`}>
                          <UserPlus size={16}/> إضافة مرافق
                      </button>
                  </div>
                  <div className="space-y-3">
                      {selectedOccupiedBooking?.guests.map((guest, idx) => (
                          <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex justify-between items-center shadow-sm hover:shadow-md transition">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500">
                                      {idx + 1}
                                  </div>
                                  <div>
                                      <p className="font-black text-sm">{guest.firstNameAr} {guest.lastNameAr}</p>
                                      <p className="text-xs text-gray-400 uppercase">{guest.firstNameEn} {guest.lastNameEn}</p>
                                  </div>
                              </div>
                              <div className="flex gap-2">
                                  <button onClick={() => handlePrintGuest(guest)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200" title="طباعة الاستمارة"><Printer size={16}/></button>
                                  <button onClick={() => { setShowManageModal(selectedOccupiedBooking); setManageAction('split'); setSplitGuests([idx]); }} className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100" title="فصل / نقل"><GitFork size={16}/></button>
                                  <button onClick={() => { setShowManageModal(selectedOccupiedBooking); setManageAction('split'); setSplitGuests([idx]); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="نقل فردي"><ArrowRightLeft size={16}/></button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
                  <button onClick={() => { setShowManageModal(selectedOccupiedBooking); setManageAction('move'); }} className="py-3 bg-blue-50 text-blue-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-100">
                      <ArrowRightLeft size={18}/> تغيير الغرفة
                  </button>
                  <button onClick={() => { if(selectedOccupiedBooking) { checkOut(selectedOccupiedBooking.id); setSelectedOccupiedBooking(null); } }} className="py-3 bg-red-50 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100">
                      <LogOut size={18}/> تسجيل خروج
                  </button>
              </div>
          </div>
      </Modal>

      {/* --- ADD GUEST MODAL --- */}
      <Modal
          isOpen={showAddGuestModal}
          onClose={() => setShowAddGuestModal(false)}
          title="إضافة مرافق جديد (New Guest)"
          icon={UserPlus}
          size="2xl"
      >
          <form onSubmit={handleAddGuestSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column: ID & Camera */}
                  <div className="space-y-6">
                      <div className={`p-6 rounded-[2rem] border shadow-sm ${ts.sectionCard}`}>
                          <div className="flex justify-between items-center mb-4">
                              <h4 className="font-bold flex items-center gap-2"><Scan size={18}/> وثيقة الهوية</h4>
                              {!showCamera && !guestData.idPhoto && (
                                  <button type="button" onClick={startCamera} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm ${ts.activeTab}`}>
                                      <Camera size={14} /> فتح الكاميرا
                                  </button>
                              )}
                          </div>
                          
                          <div className="space-y-4">
                              <div className="flex gap-2">
                                  {['بطاقة تعريف', 'جواز سفر', 'رخصة سياقة'].map(t => (
                                      <button type="button" key={t} onClick={() => setGuestData({...guestData, idType: t})} className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition ${guestData.idType === t ? 'bg-gray-800 text-white' : 'bg-white text-gray-500'}`}>{t}</button>
                                  ))}
                              </div>
                              <div className="relative">
                                  <input type="text" value={guestData.idNumber} onChange={e => setGuestData({...guestData, idNumber: e.target.value})} onBlur={handleIdSearch} className={`w-full p-3 rounded-xl border-2 font-bold uppercase ${ts.modalInput}`} placeholder="رقم الوثيقة (ID Number)"/>
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                              </div>

                              {/* Camera View */}
                              <div className="relative aspect-video bg-black/5 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-gray-200">
                                  {showCamera ? (
                                      <>
                                          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                                          <div className="absolute inset-0 border-2 border-white/50 m-4 rounded-xl pointer-events-none"></div>
                                          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                                              <button type="button" onClick={capturePhoto} className="w-14 h-14 bg-white rounded-full border-4 border-gray-300 shadow-lg"></button>
                                              <button type="button" onClick={() => setShowCamera(false)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white p-2 rounded-full"><X size={16}/></button>
                                          </div>
                                      </>
                                  ) : guestData.idPhoto ? (
                                      <div className="relative w-full h-full group">
                                          <img src={guestData.idPhoto} alt="ID" className="w-full h-full object-contain" />
                                          <button type="button" onClick={() => setGuestData({...guestData, idPhoto: ''})} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"><Trash2 size={16}/></button>
                                      </div>
                                  ) : (
                                      <div className="text-center text-gray-400">
                                          <Image size={32} className="mx-auto mb-2 opacity-50"/>
                                          <p className="text-xs font-bold">لم يتم إرفاق صورة</p>
                                      </div>
                                  )}
                                  <canvas ref={canvasRef} className="hidden"></canvas>
                              </div>
                          </div>
                      </div>

                      {/* Price Update Section */}
                      <div className={`p-6 rounded-[2rem] border shadow-sm ${ts.sectionCard} bg-blue-50/50 border-blue-100`}>
                          <h4 className="font-bold mb-4 flex items-center gap-2 text-blue-700"><Banknote size={18}/> تحديث سعر الغرفة (اختياري)</h4>
                          <div className="space-y-2">
                              <label className="block text-xs font-bold text-gray-500">السعر الإجمالي الجديد للحجز</label>
                              <input 
                                  type="number" 
                                  placeholder={`السعر الحالي: ${selectedOccupiedBooking?.totalAmount}`}
                                  onChange={(e) => {
                                      setNewBooking(prev => ({ ...prev, totalPrice: Number(e.target.value) }));
                                  }}
                                  className={`w-full p-3 rounded-xl border-2 font-bold text-lg ${ts.modalInput}`} 
                              />
                              <p className="text-[10px] text-gray-400">اتركه فارغاً للإبقاء على السعر الحالي ({selectedOccupiedBooking?.totalAmount} د.ج)</p>
                          </div>
                      </div>
                  </div>

                  {/* Right Column: Personal Info */}
                  <div className="space-y-6">
                      <div className={`p-6 rounded-[2rem] border shadow-sm ${ts.sectionCard}`}>
                          <h4 className="font-bold mb-4 flex items-center gap-2"><User size={18}/> البيانات الشخصية</h4>
                          <div className="grid grid-cols-2 gap-4">
                              <div className="col-span-2 md:col-span-1">
                                  <label className="block text-[10px] font-bold mb-1">الاسم (عربي)</label>
                                  <input required type="text" dir="rtl" value={guestData.firstNameAr} onChange={e => setGuestData({...guestData, firstNameAr: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} placeholder="الاسم الأول"/>
                              </div>
                              <div className="col-span-2 md:col-span-1">
                                  <label className="block text-[10px] font-bold mb-1">اللقب (عربي)</label>
                                  <input required type="text" dir="rtl" value={guestData.lastNameAr} onChange={e => setGuestData({...guestData, lastNameAr: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} placeholder="اللقب"/>
                              </div>
                              <div className="col-span-2 md:col-span-1">
                                  <label className="block text-[10px] font-bold mb-1">First Name</label>
                                  <input type="text" dir="ltr" value={guestData.firstNameEn} onChange={e => setGuestData({...guestData, firstNameEn: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold capitalize ${ts.modalInput}`} placeholder="First Name"/>
                              </div>
                              <div className="col-span-2 md:col-span-1">
                                  <label className="block text-[10px] font-bold mb-1">Surname</label>
                                  <input type="text" dir="ltr" value={guestData.lastNameEn} onChange={e => setGuestData({...guestData, lastNameEn: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold uppercase ${ts.modalInput}`} placeholder="SURNAME"/>
                              </div>
                          </div>
                      </div>
                      
                      <div className={`p-6 rounded-[2rem] border shadow-sm ${ts.sectionCard}`}>
                          <h4 className="font-bold mb-4 flex items-center gap-2"><MapPin size={18}/> الميلاد والاتصال</h4>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-[10px] font-bold mb-1">تاريخ الميلاد</label>
                                  <input type="date" value={guestData.birthDate} onChange={e => setGuestData({...guestData, birthDate: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`}/>
                              </div>
                              <div>
                                  <label className="block text-[10px] font-bold mb-1">مكان الميلاد</label>
                                  <input type="text" value={guestData.birthPlace} onChange={e => setGuestData({...guestData, birthPlace: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} placeholder="الولاية / البلد"/>
                              </div>
                              <div>
                                  <label className="block text-[10px] font-bold mb-1">الجنسية</label>
                                  <input type="text" value={guestData.nationality} onChange={e => setGuestData({...guestData, nationality: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} placeholder={settings.defaultNationality}/>
                              </div>
                              <div>
                                  <label className="block text-[10px] font-bold mb-1">رقم الهاتف</label>
                                  <input type="tel" value={guestData.phone} onChange={e => setGuestData({...guestData, phone: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} placeholder="0550..."/>
                              </div>
                          </div>
                      </div>

                      <div className={`p-6 rounded-[2rem] border shadow-sm ${ts.sectionCard}`}>
                          <h4 className="font-bold mb-4 flex items-center gap-2"><Heart size={18}/> الوالدين</h4>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-[10px] font-bold mb-1">اسم الأب</label>
                                  <input type="text" value={guestData.fatherName} onChange={e => setGuestData({...guestData, fatherName: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} placeholder="اسم الأب"/>
                              </div>
                              <div>
                                  <label className="block text-[10px] font-bold mb-1">اسم الأم</label>
                                  <input type="text" value={guestData.motherName} onChange={e => setGuestData({...guestData, motherName: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} placeholder="اسم الأم"/>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                  <button type="button" onClick={() => setShowAddGuestModal(false)} className="px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-bold text-gray-600 dark:text-gray-300 transition hover:bg-gray-200">إلغاء</button>
                  <button type="submit" className={`px-10 py-3 rounded-xl font-black text-white shadow-lg transition transform hover:-translate-y-1 flex items-center gap-2 ${ts.button}`}>
                      <CheckCircle size={20}/> حفظ وإضافة المرافق
                  </button>
              </div>
          </form>
      </Modal>

      {/* Print Component (Hidden) - REMOVED (Handled by printDocument) */}

    </div>
  );
};
