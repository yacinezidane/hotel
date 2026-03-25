
import React, { useState, useEffect, useRef } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { 
    CalendarCheck, Plus, Search, Filter, MoreVertical, X, Check, 
    Bed, User, CalendarDays, ArrowRightLeft, Calendar as CalendarIcon, 
    CheckCircle, Building2, Camera, Sparkles, UserPlus, GitFork, Key,
    QrCode, RefreshCw, Smartphone, ExternalLink, Printer, FileText,
    Fingerprint, Languages, Heart, MapPin, Scan, Image, Trash2, Save,
    ArrowUpDown, ArrowUp, ArrowDown, Clock, CreditCard, Users, Banknote
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { PaymentModal } from '../components/PaymentModal';
import { PrintButton } from '../components/PrintButton';
import { RegistrationCard, RegistrationCardVariant } from '../components/RegistrationCard';
import { PoliceFormPrint } from '../components/PoliceFormPrint';
import { Modal } from '../components/Modal';
import { Booking, GuestInfo, Transaction, GuestRegistrationForm } from '../types';
import { getThemeStyles } from '../utils/themeStyles';

export const BookingsPage: React.FC = () => {
  const { 
    bookings, rooms, addBooking, updateRoomStatus, moveBooking, splitBooking, 
    addGuestToRoom, settings, searchGuest, regenerateBookingQR, checkOut, 
    addTransaction, currentUser, addNotification, confirmBooking, cancelBooking,
    guestRegistrationForms, updateGuestRegistrationFormStatus, toggleAutoApproval
  } = useHotel();
  const ts = getThemeStyles(settings);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'completed' | 'cancelled'>('all');
  const [showModal, setShowModal] = useState(false);
  
  // Permissions
  const canEditBooking = currentUser?.permissions.allowedActions?.includes('edit_booking') || currentUser?.role === 'manager';
  const canDeleteBooking = currentUser?.permissions.allowedActions?.includes('cancel_booking') || currentUser?.role === 'manager';
  const canAddBooking = currentUser?.permissions.allowedActions?.includes('add_booking') || currentUser?.role === 'manager';
  const canManageBookings = canEditBooking || canDeleteBooking || canAddBooking;

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState<Booking | null>(null);
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'checkInDate', direction: 'desc' });

  // Management Modal
  const [showManageModal, setShowManageModal] = useState<Booking | null>(null);
  const [manageAction, setManageAction] = useState<'move' | 'split' | 'add_guest' | null>(null);
  const [moveTargetRoom, setMoveTargetRoom] = useState<number>(0);
  const [moveReason, setMoveReason] = useState('');
  const [movePrice, setMovePrice] = useState<string>('');
  const [splitGuests, setSplitGuests] = useState<number[]>([]);
  const [splitTargetRoom, setSplitTargetRoom] = useState<number>(0);
  const [splitPrice, setSplitPrice] = useState('');
  
  // Add Guest State
  const [newGuestPrice, setNewGuestPrice] = useState<number>(0);
  const [newGuestData, setNewGuestData] = useState<GuestInfo>({
      idType: 'بطاقة تعريف',
      idNumber: '',
      firstNameAr: '',
      lastNameAr: '',
      firstNameEn: '',
      lastNameEn: '',
      birthDate: '',
      birthPlace: '',
      fatherName: '',
      motherName: '',
      idPhoto: ''
  });

  // New Booking State
  const [bookingType, setBookingType] = useState<'check_in' | 'reservation'>('check_in');
  const [newBooking, setNewBooking] = useState({
      roomId: 0,
      checkInDate: new Date().toISOString(), // Use full ISO string for precise time
      checkOutDate: '',
      companyName: ''
  });
  const [isCompany, setIsCompany] = useState(false);
  
  // Enhanced Guest Data State - Full Police Sheet Fields
  const [guestData, setGuestData] = useState<GuestInfo>({
      idType: 'بطاقة تعريف',
      idNumber: '',
      firstNameAr: '',
      lastNameAr: '',
      firstNameEn: '',
      lastNameEn: '',
      birthDate: '',
      birthPlace: '',
      fatherName: '',
      motherName: '',
      idPhoto: ''
  });
  
  // Room Assign Modal (for pending bookings)
  const [showRoomAssignModal, setShowRoomAssignModal] = useState<Booking | null>(null);
  const [regCardVariant, setRegCardVariant] = useState<RegistrationCardVariant>('modern');
  const [showFormsModal, setShowFormsModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState<any>(null);

  // QR / Key Modal
  const [showQRModal, setShowQRModal] = useState<Booking | null>(null); // For Existing Bookings
  const [successQR, setSuccessQR] = useState<{ booking: Booking, url: string } | null>(null); // For New Bookings (Success Popup)
  
  const [currentQRData, setCurrentQRData] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Camera & Search
  const [foundGuestData, setFoundGuestData] = useState<any>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isZellige = settings.theme === 'zellige' || settings.theme === 'zellige-v2';
  const isMilitary = settings.theme === 'algerian-military';

  const filteredBookings = bookings.filter(b => filter === 'all' || b.status === filter);
  const availableRooms = rooms.filter(r => r.status === 'available');

  // Sorting Logic
  const handleSort = (key: string) => {
    setSortConfig(current => ({
        key,
        direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    let aValue: any = a[sortConfig.key as keyof Booking];
    let bValue: any = b[sortConfig.key as keyof Booking];

    // Handle special cases
    if (sortConfig.key === 'roomNumber') {
        aValue = rooms.find(r => r.id === a.roomId)?.number || '';
        bValue = rooms.find(r => r.id === b.roomId)?.number || '';
    } else if (sortConfig.key === 'guestCount') {
        aValue = a.guests.length;
        bValue = b.guests.length;
    } else if (sortConfig.key === 'duration') {
        aValue = new Date(a.checkOutDate).getTime() - new Date(a.checkInDate).getTime();
        bValue = new Date(b.checkOutDate).getTime() - new Date(b.checkInDate).getTime();
    } else {
        // Default property access
        aValue = a[sortConfig.key as keyof Booking];
        bValue = b[sortConfig.key as keyof Booking];
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const confirmMove = () => {
      if (showManageModal && moveTargetRoom) {
          moveBooking(showManageModal.id, moveTargetRoom, moveReason, movePrice ? Number(movePrice) : undefined);
          setShowManageModal(null);
          setManageAction(null);
          setMoveTargetRoom(0);
          setMoveReason('');
          setMovePrice('');
      }
  };

  const toggleSplitGuest = (idx: number) => {
      setSplitGuests(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const confirmSplit = () => {
      if (showManageModal && splitTargetRoom && splitPrice) {
          splitBooking(showManageModal.id, splitGuests, splitTargetRoom, Number(splitPrice));
          setShowManageModal(null);
          setManageAction(null);
          setSplitTargetRoom(0);
          setSplitGuests([]);
          setSplitPrice('');
      }
  };

  const confirmAddGuest = () => {
      if (showManageModal && newGuestData.firstNameAr && newGuestData.lastNameAr) {
          const price = newGuestPrice > 0 ? newGuestPrice : undefined;
          addGuestToRoom(showManageModal.roomId, newGuestData, price);
          setShowManageModal(null);
          setManageAction(null);
          setNewGuestPrice(0);
          setNewGuestData({
              idType: 'بطاقة تعريف',
              idNumber: '',
              firstNameAr: '',
              lastNameAr: '',
              firstNameEn: '',
              lastNameEn: '',
              birthDate: '',
              birthPlace: '',
              fatherName: '',
              motherName: '',
              idPhoto: ''
          });
      } else {
          addNotification('يرجى إدخال الاسم واللقب على الأقل', "warning");
      }
  };

  const generateGuestPortalLink = (booking: Booking) => {
      const room = rooms.find(r => r.id === booking.roomId);
      const portalPayload = JSON.stringify({
          type: 'room',
          id: room?.number || booking.roomId,
          name: booking.primaryGuestName,
          expiry: booking.checkOutDate || new Date(Date.now() + 86400000).toISOString()
      });
      return `https://nuzul-hotel.com/guest-services?token=${btoa(unescape(encodeURIComponent(portalPayload)))}`;
  }

  // --- CAMERA LOGIC ENHANCED ---
  const startCamera = async () => {
      setShowCamera(true);
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } });
          if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
          console.error("Camera error", err);
          addNotification("Could not access camera", "error");
          setShowCamera(false);
      }
  };

  const stopCamera = () => {
      setShowCamera(false);
      if (videoRef.current && videoRef.current.srcObject) {
          (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
  };

  const capturePhoto = () => {
      if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          
          if (context) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              context.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
              
              if (showManageModal && manageAction === 'add_guest') {
                  setNewGuestData(prev => ({ ...prev, idPhoto: dataUrl }));
              } else {
                  setGuestData(prev => ({ ...prev, idPhoto: dataUrl }));
              }
              stopCamera();
          }
      }
  };

  const handleIdSearch = () => {
      if (!guestData.idNumber) return;
      const found = searchGuest(guestData.idNumber);
      if (found) {
          setFoundGuestData(found);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!guestData.firstNameAr || !guestData.lastNameAr || !newBooking.roomId) {
          addNotification('يرجى تعبئة الحقول الإلزامية (الغرفة، الاسم بالعربية)', "warning");
          return;
      }
      
      const createdBooking = addBooking({
          guests: [guestData],
          primaryGuestName: `${guestData.firstNameAr} ${guestData.lastNameAr}`,
          roomId: newBooking.roomId,
          checkInDate: new Date().toISOString(), // Ensure precise timestamp
          checkOutDate: newBooking.checkOutDate,
          status: bookingType === 'check_in' ? 'active' : 'pending',
          totalAmount: 0, 
          mealPlan: 'room_only',
          companyName: isCompany ? newBooking.companyName : undefined,
          extraServices: []
      }, newBooking.roomId ? [newBooking.roomId] : []);

      setShowModal(false);

      if (createdBooking.status === 'active') {
          const portalLink = generateGuestPortalLink(createdBooking);
          setSuccessQR({ booking: createdBooking, url: portalLink });
      }
  };

  const handleAssignRoom = () => {
      if (showRoomAssignModal && moveTargetRoom) {
          moveBooking(showRoomAssignModal.id, moveTargetRoom, 'تسكين الحجز المعلق');
          updateRoomStatus(moveTargetRoom, 'occupied');
          setShowRoomAssignModal(null);
          setMoveTargetRoom(0);
          addNotification('تم تسكين الحجز بنجاح', "success");
      }
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
      if (sortConfig.key !== columnKey) return <ArrowUpDown size={14} className="opacity-30" />;
      return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
        <PageHeader pageKey="bookings" defaultTitle="إدارة الحجوزات" icon={CalendarCheck} />

        <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4 items-center">
                <div className={`flex p-1 rounded-xl shadow-inner ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] border border-[#cca43b]/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    {['all', 'active', 'pending', 'completed', 'cancelled'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${filter === f ? (settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b] text-[#001e21] shadow-md' : 'bg-white shadow text-black dark:bg-gray-700 dark:text-white') : (settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]/60 hover:text-[#cca43b]' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400')}`}
                        >
                            {f === 'all' ? 'الكل' : f === 'pending' ? 'معلق/حجز' : f}
                        </button>
                    ))}
                </div>

                <button 
                    onClick={() => setShowFormsModal(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition relative ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] text-[#cca43b] border border-[#cca43b]/30' : 'bg-white border border-gray-200 text-gray-700'}`}
                >
                    <FileText size={18} />
                    استمارات النزلاء
                    {guestRegistrationForms.filter(f => f.status === 'pending').length > 0 && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                            {guestRegistrationForms.filter(f => f.status === 'pending').length}
                        </span>
                    )}
                </button>

                <button 
                    onClick={toggleAutoApproval}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition ${settings.autoApproveBookings ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    title={settings.autoApproveBookings ? 'التأكيد الآلي مفعل' : 'التأكيد الآلي معطل'}
                >
                    <RefreshCw size={18} className={settings.autoApproveBookings ? 'animate-spin-slow' : ''} />
                    {settings.autoApproveBookings ? 'تأكيد آلي' : 'تأكيد يدوي'}
                </button>
            </div>
            {canManageBookings && (
                <button onClick={() => setShowModal(true)} className={`flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg font-bold transition transform hover:-translate-y-1 ${ts.button}`}>
                    <Plus size={20} /> حجز جديد
                </button>
            )}
        </div>

        {/* Table View */}
        <div className={`rounded-[2.5rem] shadow-sm overflow-hidden border ${ts.sectionCard}`}>
            <table className="w-full text-sm text-right">
                <thead className={`${ts.tableHeader} font-bold`}>
                    <tr>
                        <th className="p-4 cursor-pointer hover:bg-black/5 transition" onClick={() => handleSort('id')}>
                            <div className="flex items-center gap-2">رقم الحجز <SortIcon columnKey="id"/></div>
                        </th>
                        <th className="p-4 cursor-pointer hover:bg-black/5 transition" onClick={() => handleSort('primaryGuestName')}>
                            <div className="flex items-center gap-2">النزيل <SortIcon columnKey="primaryGuestName"/></div>
                        </th>
                        <th className="p-4 cursor-pointer hover:bg-black/5 transition" onClick={() => handleSort('roomNumber')}>
                            <div className="flex items-center gap-2">الغرفة <SortIcon columnKey="roomNumber"/></div>
                        </th>
                        <th className="p-4 cursor-pointer hover:bg-black/5 transition" onClick={() => handleSort('checkInDate')}>
                            <div className="flex items-center gap-2">التواريخ <SortIcon columnKey="checkInDate"/></div>
                        </th>
                        <th className="p-4 cursor-pointer hover:bg-black/5 transition" onClick={() => handleSort('totalAmount')}>
                            <div className="flex items-center gap-2">المبلغ <SortIcon columnKey="totalAmount"/></div>
                        </th>
                        <th className="p-4 cursor-pointer hover:bg-black/5 transition" onClick={() => handleSort('status')}>
                            <div className="flex items-center gap-2">الحالة <SortIcon columnKey="status"/></div>
                        </th>
                        <th className="p-4">إجراءات</th>
                    </tr>
                </thead>
                <tbody className={`divide-y ${settings.darkMode && settings.theme === 'zellige' ? 'divide-[#cca43b]/10' : 'divide-gray-100 dark:divide-gray-700'}`}>
                    {sortedBookings.map(booking => {
                        const room = rooms.find(r => r.id === booking.roomId);
                        const duration = Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24));
                        
                        return (
                        <tr key={booking.id} className={`${ts.tableRow} transition`}>
                            <td className={`p-4 font-mono text-xs ${ts.tableSubText}`}>
                                {booking.id.slice(-6).toUpperCase()}
                            </td>
                            <td className="p-4">
                                <div className="flex flex-col">
                                    <span className={`font-bold text-base ${ts.tableText}`}>{booking.primaryGuestName}</span>
                                    <div className={`flex items-center gap-2 text-xs mt-1 ${ts.tableSubText}`}>
                                        <span className="flex items-center gap-1"><Users size={12}/> {booking.guests.length}</span>
                                        {booking.guests[0]?.idNumber && <span className={`font-mono px-1 rounded ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/10' : 'bg-gray-100 dark:bg-gray-700'}`}>{booking.guests[0].idNumber}</span>}
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                {booking.roomId ? (
                                    <div className="flex flex-col items-start">
                                        <span className={`px-2 py-1 rounded-lg font-black text-sm ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/20 text-[#cca43b]' : 'bg-blue-50 text-blue-600'}`}>
                                            {room?.number}
                                        </span>
                                        <span className={`text-[10px] mt-1 uppercase font-bold tracking-wider ${ts.tableSubText}`}>
                                            {room?.type}
                                        </span>
                                    </div>
                                ) : (
                                    <span className={`${ts.tableSubText} text-xs italic`}>غير محدد</span>
                                )}
                            </td>
                            <td className="p-4">
                                <div className="flex flex-col gap-1">
                                    <div className={`flex items-center gap-2 text-xs font-bold ${ts.tableText}`}>
                                        <span className="text-green-600">دخول:</span>
                                        <span>{new Date(booking.checkInDate).toLocaleDateString('en-GB')}</span>
                                    </div>
                                    <div className={`flex items-center gap-2 text-xs ${ts.tableSubText}`}>
                                        <span className="text-red-400">خروج:</span>
                                        <span>{booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString('en-GB') : '---'}</span>
                                    </div>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded w-fit mt-1 ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/10 text-[#cca43b]' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                        {duration > 0 ? `${duration} ليالي` : 'يوم واحد'}
                                    </span>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className={`font-bold font-mono ${ts.tableText}`}>
                                    {booking.totalAmount.toLocaleString()} <span className={`text-[10px] ${ts.tableSubText}`}>د.ج</span>
                                </div>
                                {booking.mealPlan !== 'room_only' && (
                                    <span className="text-[10px] text-purple-500 font-bold block mt-1">
                                        {booking.mealPlan === 'breakfast' ? 'فطور صباح' : booking.mealPlan === 'half_board' ? 'نصف إقامة' : 'إقامة كاملة'}
                                    </span>
                                )}
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                    booking.status === 'active' ? 'bg-green-100 text-green-700' : 
                                    booking.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                    booking.status === 'completed' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {booking.status === 'active' ? 'إقامة جارية' : 
                                     booking.status === 'pending' ? 'معلق / حجز' :
                                     booking.status === 'completed' ? 'مكتمل' : 'ملغى'}
                                </span>
                            </td>
                            <td className="p-4 flex gap-2">
                                {booking.status === 'active' && (
                                    <>
                                        {canEditBooking && (
                                            <>
                                                <button onClick={() => { setShowManageModal(booking); setManageAction('move'); }} className={`p-2 rounded-lg transition ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/10 text-[#cca43b] hover:bg-[#cca43b]/20' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`} title="نقل">
                                                    <ArrowRightLeft size={16}/>
                                                </button>
                                                <button onClick={() => { setShowManageModal(booking); setManageAction('split'); }} className={`p-2 rounded-lg transition ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/10 text-[#cca43b] hover:bg-[#cca43b]/20' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`} title="فصل">
                                                    <GitFork size={16}/>
                                                </button>
                                                <button onClick={() => { setShowManageModal(booking); setManageAction('add_guest'); }} className={`p-2 rounded-lg transition ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/10 text-[#cca43b] hover:bg-[#cca43b]/20' : 'bg-green-50 text-green-600 hover:bg-green-100'}`} title="إضافة نزيل">
                                                    <UserPlus size={16}/>
                                                </button>
                                            </>
                                        )}
                                        <button onClick={() => setShowQRModal(booking)} className={`p-2 rounded-lg transition ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] text-[#cca43b] border border-[#cca43b]/30' : 'bg-black text-white hover:bg-gray-800'}`} title="المفتاح الرقمي">
                                            <QrCode size={16}/>
                                        </button>
                                        {canEditBooking && (
                                            <button onClick={() => setShowPaymentModal(booking)} className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition" title="إتمام الدفع والمغادرة">
                                                <CheckCircle size={16}/>
                                            </button>
                                        )}
                                        <PrintButton 
                                            label=""
                                            title="طباعة استمارة الشرطة"
                                            className={`p-2 rounded-lg transition ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] text-[#cca43b] border border-[#cca43b]/30' : 'bg-gray-800 text-white hover:bg-gray-900'}`}
                                            variants={['standard', 'detailed', 'compact', 'modern', 'classic', 'official']}
                                            defaultVariant="standard"
                                            renderContent={(variant) => (
                                                <PoliceFormPrint 
                                                    guest={booking.guests[0]}
                                                    roomNumber={rooms.find(r=>r.id===booking.roomId)?.number}
                                                    checkInDate={booking.checkInDate}
                                                    hotelName={settings.appName}
                                                    variant={variant}
                                                />
                                            )}
                                        >
                                            <FileText size={16}/>
                                        </PrintButton>
                                    </>
                                )}
                                {booking.status === 'pending' && (
                                    <div className="flex gap-1">
                                        {canEditBooking && (
                                            <button 
                                                onClick={() => confirmBooking(booking.id)} 
                                                className={`p-2 rounded-lg transition ${settings.darkMode && settings.theme === 'zellige' ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' : 'bg-green-50 text-green-600 hover:bg-green-100'}`} 
                                                title="تأكيد الحجز"
                                            >
                                                <Check size={16}/>
                                            </button>
                                        )}
                                        {canDeleteBooking && (
                                            <button 
                                                onClick={() => cancelBooking(booking.id)} 
                                                className={`p-2 rounded-lg transition ${settings.darkMode && settings.theme === 'zellige' ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-50 text-red-600 hover:bg-red-100'}`} 
                                                title="إلغاء الحجز"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        )}
                                        {canEditBooking && (
                                            <button onClick={() => setShowRoomAssignModal(booking)} className={`p-2 rounded-lg transition ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/10 text-[#cca43b] hover:bg-[#cca43b]/20 border border-[#cca43b]/30' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`} title="تسكين">
                                                <Key size={16}/>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>
        </div>

      {/* --- ADD BOOKING / REGISTRATION MODAL --- */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="استمارة تسجيل النزيل"
        subtitle="Fiche de Police - بيانات شاملة"
        icon={FileText}
        size="4xl"
      >
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Operation & Room */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-5 rounded-[2rem] border shadow-sm ${ts.sectionCard}`}>
                        <label className={`text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2 ${ts.inputLabel}`}><Bed size={16}/> الغرفة ونوع الحجز</label>
                        <div className="grid grid-cols-2 gap-4">
                            <select 
                                value={newBooking.roomId}
                                onChange={e => setNewBooking({...newBooking, roomId: Number(e.target.value)})}
                                className={`w-full p-3 rounded-2xl border-2 outline-none font-bold cursor-pointer transition-all ${ts.modalInput}`}
                            >
                                <option value={0}>{bookingType === 'check_in' ? '-- اختر غرفة --' : '-- تحديد لاحقاً --'}</option>
                                {rooms.filter(r => bookingType === 'check_in' ? r.status === 'available' : true).map(r => (
                                    <option key={r.id} value={r.id}>
                                        غرفة {r.number} - {r.type} - {r.price} د.ج
                                    </option>
                                ))}
                            </select>
                            <div className={`flex gap-1 p-1 rounded-2xl ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#001517] border border-[#cca43b]/30' : 'bg-gray-100'}`}>
                                <button type="button" onClick={() => setBookingType('check_in')} className={`flex-1 rounded-xl text-xs font-bold transition-all ${bookingType === 'check_in' ? (settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b] text-[#001e21]' : 'bg-white shadow text-black') : (settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]/50' : 'text-gray-500')}`}>دخول</button>
                                <button type="button" onClick={() => setBookingType('reservation')} className={`flex-1 rounded-xl text-xs font-bold transition-all ${bookingType === 'reservation' ? (settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b] text-[#001e21]' : 'bg-white shadow text-black') : (settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]/50' : 'text-gray-500')}`}>حجز</button>
                            </div>
                        </div>
                    </div>

                    <div className={`p-5 rounded-[2rem] border shadow-sm ${ts.sectionCard}`}>
                        <label className={`text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2 ${ts.inputLabel}`}><CalendarIcon size={16}/> التوقيت</label>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <span className={`text-[9px] font-bold block mb-1 ${ts.inputLabel}`}>وقت الدخول (آلي)</span>
                                <input type="text" disabled value={new Date().toLocaleString('ar-SA')} className={`w-full p-3 rounded-xl border-2 font-bold text-xs opacity-70 ${ts.modalInput}`} />
                            </div>
                            <div className="flex-1">
                                <span className={`text-[9px] font-bold block mb-1 ${ts.inputLabel}`}>الخروج (اختياري)</span>
                                <input type="date" value={newBooking.checkOutDate} onChange={e => setNewBooking({...newBooking, checkOutDate: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Identity Document & Camera */}
                <div className={`relative rounded-[2.5rem] overflow-hidden border-2 border-dashed ${ts.sectionCard}`}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className={`text-xl font-black flex items-center gap-2 ${ts.icon}`}>
                                <Scan size={24} /> وثيقة الهوية (ID Capture)
                            </h4>
                            {!showCamera && !guestData.idPhoto && (
                                <button type="button" onClick={startCamera} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm ${ts.activeTab}`}>
                                    <Camera size={16} /> فتح الكاميرا
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Inputs */}
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

                            {/* Camera / Preview Area */}
                            <div className={`relative aspect-video rounded-2xl overflow-hidden flex items-center justify-center border-2 ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#001517] border-[#cca43b]/30' : 'bg-black/5 border-gray-200'}`}>
                                {showCamera ? (
                                    <>
                                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                                        <div className="absolute inset-0 border-2 border-white/50 m-4 rounded-xl pointer-events-none"></div>
                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                                            <button type="button" onClick={capturePhoto} className="w-14 h-14 bg-white rounded-full border-4 border-gray-300 shadow-lg"></button>
                                            <button type="button" onClick={stopCamera} className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white p-2 rounded-full"><X size={16}/></button>
                                        </div>
                                    </>
                                ) : guestData.idPhoto ? (
                                    <div className="relative w-full h-full group">
                                        <img src={guestData.idPhoto} alt="ID" className="w-full h-full object-contain" />
                                        <button type="button" onClick={() => setGuestData({...guestData, idPhoto: ''})} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"><Trash2 size={16}/></button>
                                    </div>
                                ) : (
                                    <div className={`text-center ${ts.inputLabel}`}>
                                        <Image size={32} className="mx-auto mb-2 opacity-50"/>
                                        <p className="text-xs font-bold">لم يتم إرفاق صورة</p>
                                    </div>
                                )}
                                <canvas ref={canvasRef} className="hidden"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Personal Information Grid */}
                <div className={`p-6 rounded-[2.5rem] border shadow-sm ${ts.sectionCard}`}>
                    <h4 className={`text-lg font-black mb-6 flex items-center gap-2 ${ts.inputLabel}`}><User size={20}/> البيانات الشخصية والعائلية</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Arabic Names */}
                        <div className="space-y-4">
                            <h5 className="text-xs font-bold text-gray-400 uppercase border-b pb-1">باللغة العربية</h5>
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
                            <h5 className="text-xs font-bold text-gray-400 uppercase border-b pb-1 flex items-center gap-1"><Languages size={12}/> باللغة اللاتينية</h5>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold mb-1">Nom (Surname)</label>
                                    <input type="text" dir="ltr" value={guestData.lastNameEn} onChange={e => setGuestData({...guestData, lastNameEn: e.target.value.toUpperCase()})} className={`w-full p-3 rounded-xl border-2 font-bold uppercase ${ts.modalInput}`} placeholder="SURNAME"/>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold mb-1">Prénom (First Name)</label>
                                    <input type="text" dir="ltr" value={guestData.firstNameEn} onChange={e => setGuestData({...guestData, firstNameEn: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold capitalize ${ts.modalInput}`} placeholder="First Name"/>
                                </div>
                            </div>
                        </div>

                        {/* Parents */}
                        <div className="space-y-4">
                            <h5 className="text-xs font-bold text-gray-400 uppercase border-b pb-1 flex items-center gap-1"><Heart size={12}/> النسب (اختياري)</h5>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold mb-1">اسم الأب</label>
                                    <input type="text" value={guestData.fatherName} onChange={e => setGuestData({...guestData, fatherName: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} placeholder="اسم الأب"/>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold mb-1">اسم الأم (كامل)</label>
                                    <input type="text" value={guestData.motherName} onChange={e => setGuestData({...guestData, motherName: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} placeholder="اسم ولقب الأم"/>
                                </div>
                            </div>
                        </div>

                        {/* Birth Info */}
                        <div className="space-y-4">
                            <h5 className="text-xs font-bold text-gray-400 uppercase border-b pb-1 flex items-center gap-1"><MapPin size={12}/> الميلاد</h5>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold mb-1">تاريخ الميلاد</label>
                                    <input type="date" value={guestData.birthDate} onChange={e => setGuestData({...guestData, birthDate: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`}/>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold mb-1">مكان الميلاد</label>
                                    <input type="text" value={guestData.birthPlace} onChange={e => setGuestData({...guestData, birthPlace: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} placeholder="الولاية / البلد"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-6">
                    <button type="button" onClick={() => setShowModal(false)} className={`px-8 py-3 rounded-xl font-bold text-sm transition ${settings.theme === 'zellige' && settings.darkMode ? 'bg-[#002a2d] text-[#cca43b] hover:bg-[#cca43b]/10' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}>إلغاء</button>
                    <PrintButton 
                        title="استمارة التسجيل"
                        label="طباعة الاستمارة"
                        className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 ${settings.theme === 'zellige' && settings.darkMode ? 'bg-[#002a2d] text-[#cca43b] border border-[#cca43b]/30' : 'bg-gray-200'}`}
                        variants={['modern', 'classic', 'minimal', 'elegant', 'technical', 'compact']}
                        defaultVariant="modern"
                        renderContent={(variant) => (
                            <RegistrationCard 
                                guest={guestData}
                                roomNumber={rooms.find(r=>r.id===newBooking.roomId)?.number}
                                checkInDate={new Date().toLocaleString()}
                                appName={settings.appName}
                                variant={variant}
                            />
                        )}
                    />
                    <button type="submit" className={`px-10 py-3 rounded-xl font-black shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center gap-2 text-sm ${ts.button}`}>
                        <CheckCircle className="w-5 h-5" /> {bookingType === 'check_in' ? 'إتمام التسجيل (Check-in)' : 'حفظ الحجز'}
                    </button>
                </div>
            </form>
      </Modal>

      {/* --- SUCCESS VOUCHER MODAL --- */}
      <Modal
        isOpen={!!successQR}
        onClose={() => setSuccessQR(null)}
        title="تم التسجيل بنجاح"
        subtitle="تم إنشاء ملف النزيل وتفعيل الدخول"
        icon={CheckCircle}
        size="md"
      >
            <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-inner"><CheckCircle size={40} /></div>
                
                {successQR?.url && (
                    <div className="p-4 bg-white rounded-3xl shadow-xl border-8 border-gray-50 mb-6">
                        <QRCodeSVG value={successQR.url} size={180} level="H" includeMargin={true} />
                    </div>
                )}

                <div className="flex gap-2 w-full mt-6">
                    <PrintButton 
                        title="استمارة التسجيل"
                        label="طباعة الاستمارة"
                        className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-black"
                        variants={['modern', 'classic', 'minimal', 'elegant', 'technical', 'compact']}
                        defaultVariant={regCardVariant}
                        renderContent={(variant) => (
                            <RegistrationCard 
                                guest={guestData}
                                roomNumber={rooms.find(r=>r.id===newBooking.roomId)?.number}
                                checkInDate={new Date().toLocaleString()}
                                appName={settings.appName}
                                variant={variant}
                            />
                        )}
                    />
                    <button onClick={() => setSuccessQR(null)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-200">إغلاق</button>
                </div>
            </div>
      </Modal>

      {/* --- QR MODAL (For Existing Bookings) --- */}
      <Modal
        isOpen={!!showQRModal}
        onClose={() => setShowQRModal(null)}
        title="المفتاح الرقمي / QR Code"
        icon={QrCode}
        size="md"
      >
        {showQRModal && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-3xl shadow-xl border-8 border-gray-50">
                <QRCodeSVG value={regenerateBookingQR(showQRModal)} size={200} level="H" includeMargin={true} />
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg">غرفة {rooms.find(r => r.id === showQRModal.roomId)?.number}</h4>
              <p className="text-sm text-gray-500">{showQRModal.primaryGuestName}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowQRModal(null)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-200">إغلاق</button>
              <button 
                onClick={() => {
                  const url = regenerateBookingQR(showQRModal);
                  window.open(url, '_blank');
                }}
                className={`flex-1 py-3 rounded-xl font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 ${ts.button}`}
              >
                <ExternalLink size={16}/> فتح الرابط
              </button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* --- MANAGE MODAL (Move/Split/Add Guest) --- */}
      <Modal
        isOpen={!!showManageModal}
        onClose={() => setShowManageModal(null)}
        title={manageAction === 'move' ? 'نقل النزيل' : manageAction === 'split' ? 'فصل الحجز' : 'إضافة نزيل'}
        icon={manageAction === 'move' ? ArrowRightLeft : manageAction === 'split' ? GitFork : UserPlus}
        size={manageAction === 'add_guest' ? '2xl' : 'lg'}
      >
                  <div className="space-y-6 pb-20">
                      {manageAction === 'move' ? (
                          <>
                              <div className={`p-6 rounded-[2rem] border shadow-sm ${ts.sectionCard}`}>
                                  <h4 className="font-bold text-sm mb-4 flex items-center gap-2"><Bed size={18}/> الغرفة الحالية</h4>
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
                      ) : manageAction === 'split' ? (
                          <>
                              <div className={`p-6 rounded-[2rem] border shadow-sm ${ts.sectionCard}`}>
                                  <h4 className="font-bold text-sm mb-4 flex items-center gap-2"><User size={18}/> تحديد النزلاء للفصل</h4>
                                  <div className="space-y-2">
                                      {showManageModal?.guests.map((g, idx) => (
                                          <label key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50">
                                              <input type="checkbox" checked={splitGuests.includes(idx)} onChange={() => toggleSplitGuest(idx)} className="w-5 h-5 rounded text-blue-600"/>
                                              <span className="font-bold text-sm">{g.firstNameAr} {g.lastNameAr}</span>
                                          </label>
                                      ))}
                                  </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4"><div><label className={`block text-xs font-bold mb-2 uppercase tracking-wide opacity-80 ${ts.inputLabel}`}>الغرفة الجديدة</label><select value={splitTargetRoom} onChange={(e) => setSplitTargetRoom(Number(e.target.value))} className={`w-full p-4 rounded-2xl border-2 font-bold outline-none cursor-pointer ${ts.modalInput}`}><option value={0}>-- اختر --</option>{availableRooms.map(r => (<option key={r.id} value={r.id}>غرفة {r.number}</option>))}</select></div><div><label className={`block text-xs font-bold mb-2 uppercase tracking-wide opacity-80 ${ts.inputLabel}`}>سعر الغرفة الجديدة</label><input type="number" value={splitPrice} onChange={e => setSplitPrice(e.target.value)} className={`w-full p-4 rounded-2xl border-2 font-bold outline-none ${ts.modalInput}`} placeholder="0.00"/></div></div>
                          </>
                      ) : (
                          <>
                              {/* Enhanced Add Guest Form */}
                              <div className="space-y-6">
                                  {/* ID & Camera Section */}
                                  <div className={`p-6 rounded-[2rem] border shadow-sm ${ts.sectionCard}`}>
                                      <div className="flex justify-between items-center mb-4">
                                          <h4 className="font-bold flex items-center gap-2"><Scan size={18}/> وثيقة الهوية</h4>
                                          {!showCamera && !newGuestData.idPhoto && (
                                              <button type="button" onClick={startCamera} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm ${ts.activeTab}`}>
                                                  <Camera size={14} /> فتح الكاميرا
                                              </button>
                                          )}
                                      </div>
                                      
                                      <div className="space-y-4">
                                          <div className="flex gap-2">
                                              {['بطاقة تعريف', 'جواز سفر', 'رخصة سياقة'].map(t => (
                                                  <button type="button" key={t} onClick={() => setNewGuestData({...newGuestData, idType: t})} className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition ${newGuestData.idType === t ? 'bg-gray-800 text-white' : 'bg-white text-gray-500'}`}>{t}</button>
                                              ))}
                                          </div>
                                          <div className="relative">
                                              <input type="text" value={newGuestData.idNumber} onChange={e => setNewGuestData({...newGuestData, idNumber: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold uppercase ${ts.modalInput}`} placeholder="رقم الوثيقة (ID Number)"/>
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
                                                          <button type="button" onClick={stopCamera} className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white p-2 rounded-full"><X size={16}/></button>
                                                      </div>
                                                  </>
                                              ) : newGuestData.idPhoto ? (
                                                  <div className="relative w-full h-full group">
                                                      <img src={newGuestData.idPhoto} alt="ID" className="w-full h-full object-contain" />
                                                      <button type="button" onClick={() => setNewGuestData({...newGuestData, idPhoto: ''})} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"><Trash2 size={16}/></button>
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
                                          placeholder={`السعر الحالي: ${showManageModal?.totalAmount}`}
                                          onChange={(e) => setNewGuestPrice(Number(e.target.value))}
                                          className={`w-full p-3 rounded-xl border-2 font-bold text-lg ${ts.modalInput}`} 
                                      />
                                      <p className="text-[10px] text-gray-400">اتركه فارغاً للإبقاء على السعر الحالي ({showManageModal?.totalAmount} د.ج)</p>
                                  </div>
                              </div>

                              {/* Personal Info */}
                              <div className={`p-6 rounded-[2rem] border shadow-sm ${ts.sectionCard}`}>
                                  <h4 className="font-bold mb-4 flex items-center gap-2"><User size={18}/> البيانات الشخصية</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="col-span-2 md:col-span-1">
                                          <label className="block text-[10px] font-bold mb-1">الاسم (عربي)</label>
                                          <input required type="text" dir="rtl" value={newGuestData.firstNameAr} onChange={e => setNewGuestData({...newGuestData, firstNameAr: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} placeholder="الاسم الأول"/>
                                      </div>
                                      <div className="col-span-2 md:col-span-1">
                                          <label className="block text-[10px] font-bold mb-1">اللقب (عربي)</label>
                                          <input required type="text" dir="rtl" value={newGuestData.lastNameAr} onChange={e => setNewGuestData({...newGuestData, lastNameAr: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} placeholder="اللقب"/>
                                      </div>
                                      <div className="col-span-2 md:col-span-1">
                                          <label className="block text-[10px] font-bold mb-1">First Name</label>
                                          <input type="text" dir="ltr" value={newGuestData.firstNameEn} onChange={e => setNewGuestData({...newGuestData, firstNameEn: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold capitalize ${ts.modalInput}`} placeholder="First Name"/>
                                      </div>
                                      <div className="col-span-2 md:col-span-1">
                                          <label className="block text-[10px] font-bold mb-1">Surname</label>
                                          <input type="text" dir="ltr" value={newGuestData.lastNameEn} onChange={e => setNewGuestData({...newGuestData, lastNameEn: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold uppercase ${ts.modalInput}`} placeholder="SURNAME"/>
                                      </div>
                                  </div>
                              </div>
                              
                              <div className={`p-6 rounded-[2rem] border shadow-sm ${ts.sectionCard}`}>
                                  <h4 className="font-bold mb-4 flex items-center gap-2"><MapPin size={18}/> الميلاد</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div>
                                          <label className="block text-[10px] font-bold mb-1">تاريخ الميلاد</label>
                                          <input type="date" value={newGuestData.birthDate} onChange={e => setNewGuestData({...newGuestData, birthDate: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`}/>
                                      </div>
                                      <div>
                                          <label className="block text-[10px] font-bold mb-1">مكان الميلاد</label>
                                          <input type="text" value={newGuestData.birthPlace} onChange={e => setNewGuestData({...newGuestData, birthPlace: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} placeholder="الولاية / البلد"/>
                                      </div>
                                  </div>
                              </div>

                              <div className={`p-6 rounded-[2rem] border shadow-sm ${ts.sectionCard}`}>
                                  <h4 className="font-bold mb-4 flex items-center gap-2"><Heart size={18}/> الوالدين</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div>
                                          <label className="block text-[10px] font-bold mb-1">اسم الأب</label>
                                          <input type="text" value={newGuestData.fatherName} onChange={e => setNewGuestData({...newGuestData, fatherName: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} placeholder="اسم الأب"/>
                                      </div>
                                      <div>
                                          <label className="block text-[10px] font-bold mb-1">اسم الأم</label>
                                          <input type="text" value={newGuestData.motherName} onChange={e => setNewGuestData({...newGuestData, motherName: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold ${ts.modalInput}`} placeholder="اسم الأم"/>
                                      </div>
                                  </div>
                              </div>
                          </div>
                          </>
                      )}
                  </div>

                  <div className={`p-3 border-t dark:border-gray-700 absolute bottom-0 w-full left-0 z-20 pb-safe mobile-hide-on-keyboard ${settings.theme === 'zellige' ? 'bg-[#FDFBF7]' : settings.theme === 'algerian-military' ? 'bg-[#F0EFEA]' : 'bg-white dark:bg-gray-900'}`}>
                      {manageAction === 'move' ? (
                          <button onClick={confirmMove} disabled={moveTargetRoom === 0} className={`w-full py-3 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2 text-sm ${moveTargetRoom === 0 ? 'bg-gray-300 cursor-not-allowed' : ts.button}`}><Check size={18}/> تأكيد النقل</button>
                      ) : manageAction === 'split' ? (
                          <button onClick={confirmSplit} disabled={splitTargetRoom === 0 || splitGuests.length === 0 || !splitPrice} className={`w-full py-3 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2 text-sm ${splitTargetRoom === 0 || splitGuests.length === 0 ? 'bg-gray-300 cursor-not-allowed' : ts.button}`}><GitFork size={18}/> تأكيد الفصل وإنشاء الحجز</button>
                      ) : (
                          <button onClick={confirmAddGuest} className={`w-full py-3 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2 text-sm ${ts.button}`}><UserPlus size={18}/> إضافة النزيل</button>
                      )}
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
                  <div className="space-y-4">
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
                          onClick={() => {
                              if (showRoomAssignModal && moveTargetRoom) {
                                  moveBooking(showRoomAssignModal.id, moveTargetRoom, 'تسكين الحجز المعلق');
                                  updateRoomStatus(moveTargetRoom, 'occupied');
                                  setShowRoomAssignModal(null);
                                  setMoveTargetRoom(0);
                                  addNotification('تم تسكين الحجز بنجاح', "success");
                              }
                          }}
                          disabled={moveTargetRoom === 0}
                          className={`w-full py-4 rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 mt-4 ${moveTargetRoom === 0 ? 'bg-gray-300' : ts.button}`}
                      >
                          <CheckCircle size={20}/> تأكيد التسكين
                      </button>
                  </div>
      </Modal>

      {/* --- PAYMENT MODAL --- */}
      {showPaymentModal && (
          <PaymentModal
              isOpen={true}
              onClose={() => setShowPaymentModal(null)}
              amount={showPaymentModal.totalAmount}
              description={`تصفية حساب الغرفة ${rooms.find(r => r.id === showPaymentModal.roomId)?.number} - ${showPaymentModal.primaryGuestName}`}
              onSuccess={(details) => {
                  addTransaction({
                      amount: showPaymentModal.totalAmount,
                      type: 'income',
                      category: 'room_service', // Or 'accommodation' if available
                      paymentMethod: details.method,
                      cardDetails: details.cardInfo,
                      description: `تصفية حساب ومغادرة - غرفة ${rooms.find(r => r.id === showPaymentModal.roomId)?.number}`,
                      userId: showPaymentModal.primaryGuestName
                  });
                  
                  checkOut(showPaymentModal.id);
                  setShowPaymentModal(null);
                  addNotification('تم تسجيل الدفع والمغادرة بنجاح', "success");
              }}
          />
      )}
      {/* --- GUEST FORMS MODAL --- */}
      <Modal
        isOpen={showFormsModal}
        onClose={() => setShowFormsModal(false)}
        title="استمارات النزلاء (عن بعد)"
        icon={FileText}
        size="4xl"
      >
          <div className="space-y-4">
              {guestRegistrationForms.length === 0 ? (
                  <div className="text-center py-20 opacity-30">
                      <FileText size={64} className="mx-auto mb-4" />
                      <p className="font-bold">لا توجد استمارات مقدمة حالياً</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {guestRegistrationForms.map(form => (
                          <div key={form.id} className={`p-4 rounded-2xl border transition-all ${form.status === 'pending' ? 'border-orange-200 bg-orange-50/30' : 'border-gray-100 bg-white'}`}>
                              <div className="flex justify-between items-start mb-3">
                                  <div>
                                      <h4 className="font-black text-lg">{form.firstNameAr} {form.lastNameAr}</h4>
                                      <p className="text-[10px] font-mono opacity-50">{new Date(form.submittedAt).toLocaleString()}</p>
                                  </div>
                                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                                      form.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
                                      form.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                  }`}>
                                      {form.status === 'pending' ? 'بانتظار المراجعة' : form.status === 'approved' ? 'تمت المراجعة' : 'مرفوضة'}
                                  </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                                  <div className="opacity-60">رقم الوثيقة:</div>
                                  <div className="font-bold">{form.idNumber}</div>
                                  <div className="opacity-60">الهاتف:</div>
                                  <div className="font-bold">{form.phone}</div>
                              </div>

                              <div className="flex gap-2">
                                  <button 
                                      onClick={() => {
                                          // Logic to convert form to guest data and potentially start a booking
                                          setGuestData({
                                              ...form,
                                              idPhoto: '' // Forms don't have photos yet in this simplified version
                                          });
                                          updateGuestRegistrationFormStatus(form.id, 'approved');
                                          setShowModal(true);
                                          setShowFormsModal(false);
                                      }}
                                      className="flex-1 bg-zellige-primary text-white py-2 rounded-xl text-xs font-bold"
                                  >
                                      استخدام البيانات
                                  </button>
                                  {form.status === 'pending' && (
                                      <button 
                                          onClick={() => updateGuestRegistrationFormStatus(form.id, 'rejected')}
                                          className="px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold"
                                      >
                                          رفض
                                      </button>
                                  )}
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </Modal>
    </div>
  );
};
