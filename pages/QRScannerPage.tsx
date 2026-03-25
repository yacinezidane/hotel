
import React, { useState, useRef, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { 
    QrCode, Scan, History, Search, FileText, CheckCircle, XCircle, 
    Calendar, DollarSign, User, MapPin, Coffee, Utensils, Waves, PartyPopper,
    Printer, ArrowRight, Camera, Plus, CreditCard, Clock, UserPlus, Hash, 
    Keyboard, Check, UserCheck, Briefcase, MinusCircle, LogOut, House, Crown, Lock, RefreshCw, Smartphone, AlertTriangle, Info, HelpCircle, Ticket, Building2, Users
} from 'lucide-react';
import { QRRecord, Booking, User as UserType } from '../types';
import { QRPayload } from '../utils/qrCrypto';
import { printDocument } from '../utils/print';
import { QRCodeSVG } from 'qrcode.react';
import { renderToStaticMarkup } from 'react-dom/server';

export const QRScannerPage: React.FC = () => {
    const { 
        settings, bookings, users, hallBookings, poolPasses, 
        recordAttendance, toggleGuestPresence, parseSystemQR, addNotification,
        scanQRRecord, qrRecords, reservations
    } = useHotel();

    const [activeTab, setActiveTab] = useState<'scan' | 'manual'>('scan');
    const [scannedResult, setScannedResult] = useState<QRPayload | null>(null);
    const [manualInput, setManualInput] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    
    // Rich Data Context for the Card
    const [richData, setRichData] = useState<any>(null);

    const videoRef = useRef<HTMLVideoElement>(null);

    // --- Theme Styles ---
    const isZellige = settings.theme === 'zellige';
    const ts = {
        container: isZellige ? 'bg-[#FDFBF7] border-[3px] border-[#cca43b]' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        accentText: isZellige ? 'text-[#006269]' : 'text-blue-600',
        buttonPrimary: isZellige ? 'bg-[#006269] text-[#cca43b] hover:bg-[#004d53]' : 'bg-blue-600 text-white hover:bg-blue-700',
        scanLine: isZellige ? 'bg-[#cca43b] shadow-[0_0_20px_#cca43b]' : 'bg-green-500 shadow-[0_0_20px_#22c55e]',
        cardBg: isZellige ? 'bg-white border-[#cca43b]/20' : 'bg-gray-50 dark:bg-gray-700 border-gray-200'
    };

    // Supported Types Legend
    const supportedTypes = [
        { id: 'STAFF', label: 'هوية موظف', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: 'ROOM_KEY', label: 'مفتاح غرفة', icon: House, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'TABLE_ORDER', label: 'طلب مطعم', icon: Utensils, color: 'text-orange-600', bg: 'bg-orange-50' },
        { id: 'POOL_ACCESS', label: 'دخول مسبح', icon: Waves, color: 'text-cyan-600', bg: 'bg-cyan-50' },
        { id: 'HALL_EVENT', label: 'تذكرة حدث', icon: PartyPopper, color: 'text-pink-600', bg: 'bg-pink-50' },
        { id: 'TICKET', label: 'تذكرة مرفق', icon: Ticket, color: 'text-green-600', bg: 'bg-green-50' },
        { id: 'HOTEL_CODE', label: 'رمز الفندق', icon: Building2, color: 'text-teal-600', bg: 'bg-teal-50' },
        { id: 'VISITOR_CODE', label: 'رمز زائر', icon: User, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { id: 'GUEST_CODE', label: 'رمز نزيل', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'GROUP_BOOKING_CODE', label: 'حجز مجموعة', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    // --- MAIN LOGIC: Process Token ---
    const handleProcessToken = (rawToken: string) => {
        setScanError(null);
        setScannedResult(null);
        setRichData(null);

        // 1. Try Parse as Secure Token
        const payload = parseSystemQR(rawToken);

        if (!payload) {
            setScanError("الرمز غير صالح أو غير مدعوم (Invalid Format).");
            return;
        }

        // Check if expired
        if (payload.m?.isExpired) {
            setScanError("عذراً، هذا الرمز منتهي الصلاحية.");
            return;
        }

        // 2. Hydrate Data based on Type
        let foundData: any = null;

        switch(payload.t) {
            case 'STAFF':
                foundData = users.find(u => u.id === payload.i);
                if (!foundData) setScanError("لم يتم العثور على بيانات الموظف.");
                break;
            case 'ROOM_KEY':
                foundData = bookings.find(b => b.roomId.toString() === payload.i && b.status === 'active');
                if(!foundData) setScanError("لا يوجد حجز نشط لهذه الغرفة حالياً.");
                break;
            case 'TABLE_ORDER':
                // Redirect to Restaurant Page with Table ID
                window.location.href = `/restaurant?tableId=${payload.i}`;
                return; // Stop processing here as we redirect
            case 'HALL_EVENT':
                foundData = hallBookings.find(h => h.id === payload.i);
                if (!foundData) setScanError("تذكرة الحدث غير صالحة.");
                break;
            case 'POOL_ACCESS':
                foundData = poolPasses.find(p => p.id === payload.i);
                if (!foundData || !foundData.isValid) setScanError("تذكرة المسبح غير صالحة أو منتهية.");
                break;
            case 'TICKET':
                // Check QR Records for validity
                const record = qrRecords.find(r => r.referenceId === payload.i);
                if (record) {
                    foundData = { 
                        name: payload.n || 'تذكرة', 
                        type: 'ticket', 
                        status: record.currentState,
                        details: payload.m 
                    };
                    // Auto-scan if valid
                    if (record.currentState === 'fresh' || record.currentState === 'active_session') {
                        scanQRRecord(record.id);
                    }
                } else {
                    setScanError("لم يتم العثور على سجل التذكرة.");
                }
                break;
            case 'RESERVATION':
                foundData = reservations.find(r => r.id === payload.i);
                if (!foundData) setScanError("لم يتم العثور على الحجز.");
                break;
            case 'FACILITY':
                foundData = { name: payload.n || 'مرفق عام', id: payload.i, type: 'facility' };
                break;
            case 'HOTEL_CODE':
                foundData = { name: 'فندق الجزائر', type: 'hotel', details: 'معلومات الفندق العامة' };
                break;
            case 'VISITOR_CODE':
                foundData = { name: payload.n || 'زائر', id: payload.i, type: 'visitor', details: payload.m };
                break;
            case 'GUEST_CODE':
                foundData = bookings.find(b => b.id === payload.i);
                if (!foundData) setScanError("لم يتم العثور على بيانات النزيل.");
                break;
            case 'GROUP_BOOKING_CODE':
                foundData = { name: payload.n || 'حجز مجموعة', id: payload.i, type: 'group_booking', details: payload.m };
                break;
            default:
                foundData = { raw: payload };
        }

        if (foundData || payload.t === 'ASSET') {
            setScannedResult(payload);
            setRichData(foundData);
            // Stop scanning on success
            stopScanner(); 
        } else if (!scanError) { // If no specific error set above
            setScanError("لم يتم العثور على البيانات المرتبطة بهذا الرمز.");
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate "External Scanner" or "Manual Entry"
        if (manualInput.startsWith('NZL:')) {
             handleProcessToken(manualInput);
        } else {
             // Fallback for ID Documents (Manual ID Entry)
             setScanError("جاري البحث في السجلات اليدوية...");
             setTimeout(() => {
                 const guest = users.find(u => u.id === manualInput) || bookings.find(b => b.id === manualInput);
                 if (guest) {
                     setRichData(guest);
                     setScannedResult({ t: 'STAFF', i: manualInput, n: 'سجل يدوي' } as any); // Mock payload
                     setScanError(null);
                 } else {
                     setScanError("لم يتم العثور على سجل مطابق.");
                 }
             }, 1000);
        }
    };

    // --- ACTIONS ---
    const executeAction = (action: string) => {
        if (!scannedResult) return;

        if (scannedResult.t === 'STAFF' && richData) {
            if (action === 'check_in') {
                recordAttendance(richData.id, 'in');
                addNotification(`تم تسجيل حضور: ${richData.name}`, "success");
            } else if (action === 'check_out') {
                recordAttendance(richData.id, 'out');
                addNotification(`تم تسجيل انصراف: ${richData.name}`, "info");
            }
        } else if (scannedResult.t === 'ROOM_KEY' && richData) {
            if (action === 'entry') {
                toggleGuestPresence(richData.id, 'in_hotel');
                addNotification('تم تسجيل الدخول للفندق', "success");
            } else if (action === 'exit') {
                toggleGuestPresence(richData.id, 'out_of_hotel');
                addNotification('تم تسجيل الخروج المؤقت', "info");
            }
        }

        // Reset after action
        setScannedResult(null);
        setRichData(null);
        if (activeTab === 'scan') startScanner();
    };

    // --- CAMERA UTILS ---
    const startScanner = async () => {
        setIsScanning(true);
        setScanError(null);
        setScannedResult(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (e) { console.warn("Camera access failed", e); }
    };

    const stopScanner = () => {
        setIsScanning(false);
        if (videoRef.current && videoRef.current.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        }
    };

    useEffect(() => { return () => stopScanner(); }, []);

    // --- RENDER HELPERS ---
    const getTypeLabel = (type: string) => {
        const map: any = {
            'STAFF': 'بطاقة موظف',
            'ROOM_KEY': 'مفتاح غرفة',
            'TABLE_ORDER': 'طلب مطعم',
            'POOL_ACCESS': 'تذكرة مسبح',
            'HALL_EVENT': 'تذكرة حدث',
            'ASSET': 'أصل ثابت',
            'TICKET': 'تذكرة دخول',
            'RESERVATION': 'حجز مؤكد',
            'HOTEL_CODE': 'رمز الفندق',
            'VISITOR_CODE': 'رمز زائر',
            'GUEST_CODE': 'رمز نزيل',
            'GROUP_BOOKING_CODE': 'حجز مجموعة'
        };
        return map[type] || type;
    };

    const getTypeIcon = (type: string) => {
        switch(type) {
            case 'STAFF': return <Briefcase className="text-purple-600"/>;
            case 'ROOM_KEY': return <House className="text-blue-600"/>;
            case 'TABLE_ORDER': return <Utensils className="text-orange-600"/>;
            case 'POOL_ACCESS': return <Waves className="text-cyan-600"/>;
            case 'HALL_EVENT': return <PartyPopper className="text-pink-600"/>;
            case 'TICKET': return <Ticket className="text-green-600"/>;
            case 'RESERVATION': return <Calendar className="text-indigo-600"/>;
            case 'HOTEL_CODE': return <Building2 className="text-teal-600"/>;
            case 'VISITOR_CODE': return <User className="text-indigo-600"/>;
            case 'GUEST_CODE': return <UserCheck className="text-emerald-600"/>;
            case 'GROUP_BOOKING_CODE': return <Users className="text-amber-600"/>;
            default: return <QrCode className="text-gray-600"/>;
        }
    };

    // New: Helper for visual header styling of the card
    const getCardHeaderStyle = (type: string) => {
        switch(type) {
            case 'STAFF': return 'bg-purple-600 text-white';
            case 'ROOM_KEY': return 'bg-blue-600 text-white';
            case 'POOL_ACCESS': return 'bg-cyan-600 text-white';
            case 'TABLE_ORDER': return 'bg-orange-500 text-white';
            case 'TICKET': return 'bg-green-600 text-white';
            case 'RESERVATION': return 'bg-indigo-600 text-white';
            case 'HOTEL_CODE': return 'bg-teal-600 text-white';
            case 'VISITOR_CODE': return 'bg-indigo-600 text-white';
            case 'GUEST_CODE': return 'bg-emerald-600 text-white';
            case 'GROUP_BOOKING_CODE': return 'bg-amber-600 text-white';
            default: return 'bg-gray-800 text-white';
        }
    };

    return (
        <div className="space-y-6 pb-20 animate-fade-in">
            <PageHeader pageKey="qr_scanner" defaultTitle="الماسح الضوئي الذكي" icon={Scan} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* LEFT: VIEWFINDER & INPUT */}
                <div className="space-y-6">
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl mb-4">
                        <button onClick={() => setActiveTab('scan')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${activeTab === 'scan' ? 'bg-white shadow text-black' : 'text-gray-500'}`}><Camera size={18}/> الكاميرا</button>
                        <button onClick={() => { setActiveTab('manual'); stopScanner(); }} className={`flex-1 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${activeTab === 'manual' ? 'bg-white shadow text-black' : 'text-gray-500'}`}><Keyboard size={18}/> إدخال يدوي</button>
                    </div>

                    {activeTab === 'scan' ? (
                        <>
                            <div className={`relative aspect-[4/3] bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-[6px] ${isZellige ? 'border-[#006269]' : 'border-gray-800'}`}>
                                {isScanning ? (
                                    <>
                                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-80"></video>
                                        
                                        {/* HUD Overlay */}
                                        <div className="absolute inset-0 pointer-events-none">
                                            <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-white/50 rounded-tl-3xl"></div>
                                            <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-white/50 rounded-tr-3xl"></div>
                                            <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-white/50 rounded-bl-3xl"></div>
                                            <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-white/50 rounded-br-3xl"></div>
                                            
                                            {/* Laser Scanner */}
                                            <div className={`absolute top-1/2 left-4 right-4 h-0.5 animate-[scan_2s_infinite] ${ts.scanLine}`}></div>
                                            
                                            <div className="absolute bottom-6 w-full text-center">
                                                <span className="bg-black/50 text-white px-4 py-1 rounded-full text-xs font-mono backdrop-blur-md">جاري البحث عن رمز NZL...</span>
                                            </div>
                                        </div>
                                        
                                        <button onClick={stopScanner} className="absolute top-4 right-4 bg-red-600/80 text-white p-2 rounded-full pointer-events-auto hover:bg-red-600"><XCircle/></button>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                                        <Scan size={64} className="mb-4 opacity-50"/>
                                        <button onClick={startScanner} className={`px-8 py-3 rounded-full font-bold shadow-lg text-white flex items-center gap-2 ${ts.buttonPrimary}`}>
                                            <Camera size={20}/> تشغيل الكاميرا
                                        </button>
                                        <p className="mt-4 text-xs opacity-60 max-w-[200px] text-center">في حال عدم توفر كاميرا، استخدم الإدخال اليدوي أو الماسح الخارجي.</p>
                                    </div>
                                )}
                            </div>

                            {/* Supported Types Legend */}
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700">
                                <h4 className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1"><Info size={12}/> الرموز المدعومة</h4>
                                <div className="flex flex-wrap gap-2">
                                    {supportedTypes.map(type => (
                                        <div key={type.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold ${type.bg} ${type.color}`}>
                                            <type.icon size={12}/>
                                            {type.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className={`p-8 rounded-[2.5rem] border-2 border-dashed ${isZellige ? 'bg-[#fbf8f1] border-[#cca43b]/40' : 'bg-gray-50 border-gray-300'}`}>
                            <form onSubmit={handleManualSubmit}>
                                <label className="block text-sm font-bold mb-4 opacity-70">أدخل رمز NZL أو رقم الهوية (ID)</label>
                                <div className="flex gap-2 mb-6">
                                    <input 
                                        type="text" 
                                        className={`flex-1 p-4 rounded-2xl border-2 font-mono text-lg outline-none ${isZellige ? 'border-[#cca43b]/40 focus:border-[#006269]' : 'border-gray-200 focus:border-blue-500'}`}
                                        placeholder="NZL:... أو رقم الهوية"
                                        value={manualInput}
                                        onChange={e => setManualInput(e.target.value)}
                                    />
                                    <button type="submit" className={`p-4 rounded-2xl shadow-lg text-white ${ts.buttonPrimary}`}><ArrowRight size={24}/></button>
                                </div>
                                
                                {/* External ID Image Placeholder */}
                                <div className="border-t pt-6">
                                    <h5 className="text-xs font-bold mb-3 flex items-center gap-2 opacity-60"><Printer size={14}/> صورة الهوية (ماسح خارجي)</h5>
                                    <div className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                                        <div className="text-center opacity-50">
                                            <Camera size={32} className="mx-auto mb-2"/>
                                            <span className="text-xs font-bold">مساحة مخصصة لصور الماسح الضوئي الخارجي</span>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Simulation Buttons (Dev Only) */}
                    <div className="flex flex-wrap gap-2 justify-center opacity-50 hover:opacity-100 transition p-2 border border-dashed rounded-xl">
                        <span className="w-full text-center text-[9px] font-bold text-gray-400 uppercase">Dev Simulation</span>
                        <button onClick={() => handleProcessToken('NZL:eyJ0IjoiU1RBRkYiLCJpIjoidTEifQ==:SIG')} className="text-[10px] bg-gray-200 px-2 py-1 rounded">Sim: Staff (Mgr)</button>
                        <button onClick={() => handleProcessToken('NZL:eyJ0IjoiUk9PTV9LRVkiLCJpIjoiMSJ9:SIG')} className="text-[10px] bg-gray-200 px-2 py-1 rounded">Sim: Room (Active)</button>
                        <button onClick={() => handleProcessToken('NZL:eyJ0IjoiVEFCTEVfT1JERVIiLCJpIjoiVDFfVklQIn0=:SIG')} className="text-[10px] bg-gray-200 px-2 py-1 rounded">Sim: Table</button>
                    </div>
                </div>

                {/* RIGHT: INTERACTIVE RESULT CARD */}
                <div className="relative">
                    {scannedResult && !scanError ? (
                        <div className={`sticky top-6 rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in-up ${ts.container}`}>
                            {isZellige && <div className="absolute inset-0 bg-zellige-pattern opacity-10 pointer-events-none mix-blend-multiply"></div>}
                            
                            {/* Color Bar */}
                            <div className={`h-4 w-full ${getCardHeaderStyle(scannedResult.t)}`}></div>

                            <div className="relative z-10 p-8 text-center">
                                {/* Header Icon */}
                                <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 border-4 border-gray-50">
                                    {React.cloneElement(getTypeIcon(scannedResult.t) as React.ReactElement, { size: 32 })}
                                </div>

                                <h2 className={`text-2xl font-black mb-2 ${ts.accentText}`}>
                                    {scannedResult.n || richData?.name || richData?.clientName || 'عنصر معروف'}
                                </h2>
                                <span className="inline-block px-4 py-1.5 rounded-full bg-gray-900 text-white text-xs font-bold uppercase tracking-widest mb-8">
                                    {getTypeLabel(scannedResult.t)}
                                </span>

                                {/* Dynamic Content based on Type */}
                                <div className="space-y-4">
                                    {scannedResult.t === 'STAFF' && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <button onClick={() => executeAction('check_in')} className="py-4 bg-green-500 text-white rounded-2xl font-bold shadow-md hover:bg-green-600 transition flex flex-col items-center gap-1">
                                                <CheckCircle size={24}/> تسجيل حضور
                                            </button>
                                            <button onClick={() => executeAction('check_out')} className="py-4 bg-gray-800 text-white rounded-2xl font-bold shadow-md hover:bg-gray-900 transition flex flex-col items-center gap-1">
                                                <LogOut size={24}/> انصراف
                                            </button>
                                        </div>
                                    )}

                                    {scannedResult.t === 'ROOM_KEY' && (
                                        <div className="bg-white/50 p-4 rounded-2xl border border-gray-200">
                                            <p className="text-sm font-bold text-gray-500 mb-4">التحكم في الوصول</p>
                                            <div className="flex gap-3">
                                                <button onClick={() => executeAction('entry')} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow hover:bg-blue-700">دخول الفندق</button>
                                                <button onClick={() => executeAction('exit')} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300">خروج مؤقت</button>
                                            </div>
                                        </div>
                                    )}

                                    {scannedResult.t === 'TABLE_ORDER' && (
                                        <button className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-lg hover:bg-orange-600 flex items-center justify-center gap-2">
                                            <Utensils size={20}/> فتح الطلب / الفاتورة
                                        </button>
                                    )}

                                    {(scannedResult.t === 'POOL_ACCESS' || scannedResult.t === 'HALL_EVENT') && (
                                        <div className="bg-green-50 p-4 rounded-2xl border border-green-200 text-green-800 font-bold">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <CheckCircle size={24}/> <span>صلاحية مؤكدة</span>
                                            </div>
                                            <p className="text-xs opacity-75">يسمح بالدخول للمنطقة المحددة</p>
                                        </div>
                                    )}

                                    {scannedResult.t === 'TICKET' && (
                                        <div className={`p-4 rounded-2xl border font-bold ${richData?.status === 'consumed' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                {richData?.status === 'consumed' ? <XCircle size={24}/> : <CheckCircle size={24}/>}
                                                <span>{richData?.status === 'consumed' ? 'تم استخدام التذكرة مسبقاً' : 'تذكرة صالحة'}</span>
                                            </div>
                                            <p className="text-xs opacity-75">
                                                {richData?.details?.venueName || richData?.name} - {richData?.details?.type || ''}
                                            </p>
                                            <p className="text-xs opacity-75 mt-1">
                                                العدد: {richData?.details?.count || richData?.details?.quantity || 1}
                                            </p>
                                        </div>
                                    )}

                                    {scannedResult.t === 'HOTEL_CODE' && (
                                        <div className="bg-teal-50 p-4 rounded-2xl border border-teal-200 text-teal-800 font-bold">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <Building2 size={24}/> <span>معلومات الفندق</span>
                                            </div>
                                            <p className="text-xs opacity-75">يمكن للزوار مسح هذا الرمز للوصول إلى بوابة الفندق</p>
                                        </div>
                                    )}

                                    {scannedResult.t === 'VISITOR_CODE' && (
                                        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200 text-indigo-800 font-bold">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <User size={24}/> <span>زائر مسجل</span>
                                            </div>
                                            <p className="text-xs opacity-75">رقم الهاتف: {richData?.details?.phone || 'غير متوفر'}</p>
                                        </div>
                                    )}

                                    {scannedResult.t === 'GUEST_CODE' && (
                                        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-emerald-800 font-bold">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <UserCheck size={24}/> <span>نزيل مسجل</span>
                                            </div>
                                            <p className="text-xs opacity-75">رقم الحجز: {richData?.id}</p>
                                            <p className="text-xs opacity-75 mt-1">رقم الغرفة: {richData?.roomId}</p>
                                        </div>
                                    )}

                                    {scannedResult.t === 'GROUP_BOOKING_CODE' && (
                                        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-amber-800 font-bold">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <Users size={24}/> <span>حجز مجموعة</span>
                                            </div>
                                            <p className="text-xs opacity-75">رقم الحجز: {richData?.details?.bookingId}</p>
                                            <p className="text-xs opacity-75 mt-1">عدد الأفراد: {richData?.details?.groupSize}</p>
                                        </div>
                                    )}

                                    {scannedResult.t === 'RESERVATION' && richData && (
                                        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200 text-indigo-900">
                                            <div className="flex items-center justify-center gap-2 mb-4">
                                                <Calendar size={24} className="text-indigo-600"/>
                                                <span className="font-bold text-lg">تفاصيل الحجز</span>
                                            </div>
                                            <div className="space-y-2 text-sm text-right">
                                                <div className="flex justify-between border-b border-indigo-200 pb-2">
                                                    <span className="font-bold">الضيف:</span>
                                                    <span>{richData.guestName}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-indigo-200 pb-2">
                                                    <span className="font-bold">المكان:</span>
                                                    <span>{richData.targetName}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-indigo-200 pb-2">
                                                    <span className="font-bold">التاريخ:</span>
                                                    <span>{richData.date}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-indigo-200 pb-2">
                                                    <span className="font-bold">الوقت:</span>
                                                    <span>{richData.startTime}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-bold">العدد:</span>
                                                    <span>{richData.pax} أشخاص</span>
                                                </div>
                                            </div>
                                            {richData.status === 'confirmed' && (
                                                <div className="mt-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold inline-block">
                                                    حجز مؤكد
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Manual Print Button */}
                                    <button 
                                        onClick={() => printDocument({
                                            title: `Scanned Ticket - ${scannedResult.n || 'Unknown'}`,
                                            content: (
                                                <div className="text-center p-8 border-4 border-double border-black rounded-xl" dir="rtl">
                                                    <h1 className="text-2xl font-black mb-4">{scannedResult.n || richData?.name || 'Ticket'}</h1>
                                                    <p className="text-lg font-bold mb-4">{getTypeLabel(scannedResult.t)}</p>
                                                    <div className="my-6 inline-block">
                                                        {renderToStaticMarkup(<QRCodeSVG value={scannedResult.i} size={200} />)}
                                                    </div>
                                                    <p className="font-mono text-sm">{scannedResult.i}</p>
                                                    <p className="text-xs text-gray-500 mt-4">{new Date().toLocaleString()}</p>
                                                </div>
                                            ),
                                            settings
                                        })} 
                                        className="w-full py-3 mt-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 flex items-center justify-center gap-2"
                                    >
                                        <Printer size={18}/> طباعة التذكرة / الإيصال
                                    </button>
                                </div>

                                <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-[10px] font-mono text-gray-400">SECURE ID: {scannedResult.i}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={`h-full min-h-[400px] flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed transition-colors text-center p-8 ${isZellige ? 'bg-[#FDFBF7]/50 border-[#cca43b]/30' : 'bg-gray-50/50 border-gray-200'}`}>
                            {scanError ? (
                                <>
                                    <AlertTriangle size={64} className="mb-4 text-red-400 opacity-80" />
                                    <h3 className="text-xl font-black text-red-500 mb-2">خطأ في المسح</h3>
                                    <p className="text-gray-500 font-bold text-sm">{scanError}</p>
                                    <button onClick={() => setScanError(null)} className="mt-6 text-sm font-bold underline">حاول مرة أخرى</button>
                                </>
                            ) : (
                                <>
                                    <Smartphone size={64} className={`mb-4 opacity-20 ${isZellige ? 'text-[#cca43b]' : 'text-gray-400'}`} />
                                    <p className="font-bold text-gray-400">بانتظار عملية مسح...</p>
                                    <p className="text-xs text-gray-300 mt-2">وجّه الكاميرا نحو أي رمز NZL ذكي</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
