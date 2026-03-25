import React, { useState, useRef, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { isZelligeTheme } from '../constants';
import { 
    Building2, Search, QrCode, MapPin, Phone, Mail, House,
    Star, Coffee, Wifi, Car, CheckCircle, Check, ArrowLeft, Scan, Camera, X, Sparkles,
    Utensils, Calendar, Key, User, LogIn, Lock, ShieldCheck, ChevronRight,
    Globe, Heart, Clock, Info, Menu, Play, Languages, Plus, LogOut, Send, Maximize2, Minimize2, MessageSquare, MessageCircle,
    Briefcase, Smile, Bell, Smartphone, Layout, CreditCard, Activity, Truck, Bike, Package, Trees, Store, Map, Navigation,
    Waves, Crown, Flower2, Settings2, AlertTriangle, CalendarCheck, RefreshCw, ConciergeBell, Download, Music, Ticket
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Booking, GuestInfo } from '../types';
import { GuestExternalServices } from '../components/GuestExternalServices';
import { GuestOnboardingModal } from '../components/GuestOnboardingModal';
import { EntryScanner } from '../components/EntryScanner';
import { VisitorPortal } from '../components/VisitorPortal';
import { GuestPortal } from '../components/GuestPortal';

const IconMap: Record<string, any> = {
    'Utensils': Utensils,
    'Sparkles': Sparkles,
    'Waves': Waves,
    'Bell': Bell,
    'Briefcase': Briefcase,
    'Smile': Smile,
    'Calendar': Calendar,
    'Globe': Globe,
    'Heart': Heart,
    'Wifi': Wifi,
    'Coffee': Coffee,
    'Car': Car,
    'Map': MapPin,
    'MapPin': MapPin,
    'Shirt': Star,
    'Plane': Star,
    'Clock': Clock,
    'ShieldCheck': ShieldCheck,
    'Info': Info,
    'CheckCircle': CheckCircle,
    'Send': Send,
    'Phone': Phone,
    'Building2': Building2,
    'Mail': Mail,
    'Lock': Lock,
    'Check': Check,
    'QrCode': QrCode,
    'User': User,
    'X': X,
    'Search': Search,
    'Plus': Plus,
    'LogIn': LogIn,
    'Menu': Menu,
    'Star': Star,
    'Crown': Crown,
    'Flower2': Flower2,
    'Store': Store,
    'Trees': Trees,
    'Settings2': Settings2,
    'AlertTriangle': AlertTriangle
};

export const PublicLandingPage: React.FC<{ activePage?: string; onNavigate?: (page: string) => void }> = ({ activePage: propActivePage, onNavigate }) => {
    const { 
        settings, rooms, bookings, menuItems, addNotification, 
        requestService, addRestaurantOrder, addBooking, 
        publicServices, facilities, hotelEvents, addExternalOrder,
        restaurantOrders, servicePoints, deliveryDrivers,
        guestProfile, registerGuest
    } = useHotel();
    const [internalActiveSection, setInternalActiveSection] = useState<string>('home');
    
    // Map external activePage to internal sections or use directly
    const activeSection = propActivePage || internalActiveSection;

    const setActiveSection = (section: string) => {
        if (onNavigate) {
            onNavigate(section);
        } else {
            setInternalActiveSection(section);
        }
    };

    const [bookingRef, setBookingRef] = useState('');
    const [verificationResult, setVerificationResult] = useState<Booking | null>(null);
    const [residentData, setResidentData] = useState<Booking | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [showSecretLogin, setShowSecretLogin] = useState(false);
    const [secretPin, setSecretPin] = useState('');
    const [selectedService, setSelectedService] = useState<any>(null);
    const [adminClicks, setAdminClicks] = useState(0);
    const [showContactCenter, setShowContactCenter] = useState(false);
    const [activeCategory, setActiveCategory] = useState<'all' | 'internal' | 'external' | 'dining'>('all');
    const [scrolled, setScrolled] = useState(false);
    const [orderCart, setOrderCart] = useState<{ item: any, quantity: number }[]>([]);
    const [myOrderIds, setMyOrderIds] = useState<string[]>(() => {
        const saved = localStorage.getItem('myOrderIds');
        return saved ? JSON.parse(saved) : [];
    });
    const [myBookingIds, setMyBookingIds] = useState<string[]>(() => {
        const saved = localStorage.getItem('myBookingIds');
        return saved ? JSON.parse(saved) : [];
    });

    const [hiddenClicks, setHiddenClicks] = useState(0);
    const [lastClickTime, setLastClickTime] = useState(0);
    const [isFlashing, setIsFlashing] = useState(false);
    const [showScanner, setShowScanner] = useState(true);
    const [isVisitorMode, setIsVisitorMode] = useState(false);

    const handleHiddenClick = () => {
        const now = Date.now();
        const isFast = now - lastClickTime < 500;
        setLastClickTime(now);

        if (isFast) {
            setHiddenClicks(prev => {
                const next = prev + 1;
                if (next >= 10) {
                    handleAdminClick();
                    return 0;
                }
                return next;
            });
        } else {
            setHiddenClicks(1);
        }
        
        // Flash effect
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 300);
    };

    useEffect(() => {
        localStorage.setItem('myOrderIds', JSON.stringify(myOrderIds));
    }, [myOrderIds]);

    useEffect(() => {
        localStorage.setItem('myBookingIds', JSON.stringify(myBookingIds));
    }, [myBookingIds]);
    const [maintenanceDesc, setMaintenanceDesc] = useState('');
    const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
    const [showNav, setShowNav] = useState(true);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [showParkingModal, setShowParkingModal] = useState(false);
    const [reportDetails, setReportDetails] = useState({ type: 'incident', description: '', location: '' });
    const [parkingDetails, setParkingDetails] = useState({ plateNumber: '', duration: '1', zone: 'A' });
    
    // --- New App-Like States ---
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [showChatModal, setShowChatModal] = useState(false);
    const [showBillingModal, setShowBillingModal] = useState(false);
    const [billingData, setBillingData] = useState<any>(null);

    const handleScanResident = (code: string) => {
        // Find booking by ref or membership code
        const booking = bookings.find(b => b.id === code || b.guestToken === code);
        if (booking) {
            setResidentData(booking);
            setShowScanner(false);
            setIsVisitorMode(false);
            addNotification('تم التحقق من هويتك بنجاح، مرحباً بك!', 'success');
        } else {
            // Check if it's a visitor membership code
            if (guestProfile && guestProfile.membershipCode === code) {
                setShowScanner(false);
                setIsVisitorMode(true);
                addNotification('مرحباً بك مجدداً كزائر!', 'success');
            } else {
                addNotification('الرمز غير صالح، يرجى المحاولة مرة أخرى أو التسجيل كزائر.', 'error');
            }
        }
    };

    const handleRegisterVisitor = () => {
        setShowRegistrationModal(true);
    };

    const handleOnboardingComplete = (profile: any) => {
        registerGuest(profile);
        setShowRegistrationModal(false);
        setShowScanner(false);
        setIsVisitorMode(true);
        addNotification('تم تسجيلك كزائر بنجاح!', 'success');
    };
    const [chatTarget, setChatTarget] = useState('');
    const [messageCategory, setMessageCategory] = useState<'feedback' | 'complaint' | 'request' | 'other'>('feedback');
    const [bookingDetails, setBookingDetails] = useState({ date: '', time: '', guests: 1, notes: '', serviceName: '', reservationType: 'general' });
    const [registrationDetails, setRegistrationDetails] = useState({ name: '', phone: '', email: '', arrival: '', notes: '' });
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<{sender: 'user' | 'system', text: string}[]>([
        { sender: 'system', text: 'مرحباً بك، كيف يمكننا مساعدتك اليوم؟' }
    ]);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showBookingSelector, setShowBookingSelector] = useState(false);
    const [showRoomChangeModal, setShowRoomChangeModal] = useState(false);
    const [showRoomRequestModal, setShowRoomRequestModal] = useState(false);
    const [showQRImport, setShowQRImport] = useState(false);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [ticketDetails, setTicketDetails] = useState({ eventName: '', price: 0, date: new Date().toISOString().split('T')[0], time: '18:00', quantity: 1 });
    const [showSeatingMap, setShowSeatingMap] = useState(false);
    const [showFormerGuestModal, setShowFormerGuestModal] = useState(false);
    const [formerGuestDetails, setFormerGuestDetails] = useState({ bookingId: '', email: '', notes: '' });
    const [selectedTable, setSelectedTable] = useState<number | null>(null);
    const [feedbackTarget, setFeedbackTarget] = useState<{ id: string, title: string, type: 'service' | 'facility' | 'menu_item' } | null>(null);
    const [feedbackRating, setFeedbackRating] = useState(5);
    const [feedbackComment, setFeedbackComment] = useState('');

    const { addServiceFeedback } = useHotel();

    useEffect(() => {
        // We no longer redirect these to 'visitor' to allow dedicated sections to work.
        // If propActivePage is set, we ensure internal state matches if needed,
        // but the activeSection derived variable already handles propActivePage.
    }, [propActivePage]);

    useEffect(() => {
        const handleOpenStaffLogin = () => setShowSecretLogin(true);
        window.addEventListener('open-staff-login', handleOpenStaffLogin);
        return () => window.removeEventListener('open-staff-login', handleOpenStaffLogin);
    }, []);

    const filteredServices = activeCategory === 'all' 
        ? publicServices 
        : publicServices.filter(s => s.category === activeCategory);

    const videoRef = useRef<HTMLVideoElement>(null);
    const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

    // --- Scroll Effect ---
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // --- Admin Click Logic (Beta: Visible & Single Click) ---
    const handleAdminClick = () => {
        setShowSecretLogin(true);
    };

    const getZelligePatternClass = () => {
        if (settings.theme === 'zellige') return 'bg-zellige-pattern';
        if (settings.theme === 'zellige-v2') return 'bg-zellige-v2-pattern';
        if (settings.theme === 'zellige-algiers') return 'bg-zellige-algiers-pattern';
        return 'bg-zellige-pattern';
    };

    // --- Theme Configuration ---
    const getThemeConfig = () => {
        const pattern = getZelligePatternClass();
        
        if (settings.darkMode) {
            if (settings.theme === 'zellige') { // زليج البهجة
                return {
                    bg: 'bg-[#001e21]',
                    primary: 'bg-[#002a2d]',
                    primaryText: 'text-[#f0c04a]',
                    accent: 'text-[#cca43b]',
                    accentBg: 'bg-[#cca43b]',
                    border: 'border-[#cca43b]',
                    pattern: pattern,
                    glass: "bg-[#002a2d]/80 backdrop-blur-xl border border-[#cca43b]/20 shadow-2xl"
                };
            }
            if (settings.theme === 'zellige-v2') { // زليج اخضر
                return {
                    bg: 'bg-[#001a14]',
                    primary: 'bg-[#012a20]',
                    primaryText: 'text-[#c6e3d8]',
                    accent: 'text-[#10b981]',
                    accentBg: 'bg-[#024d38]',
                    border: 'border-[#024d38]',
                    pattern: pattern,
                    glass: "bg-[#001a14]/80 backdrop-blur-xl border border-[#024d38]/30 shadow-2xl"
                };
            }
            if (settings.theme === 'zellige-algiers') { // زليج اصيل (جزائري)
                return {
                    bg: 'bg-[#0a192f]',
                    primary: 'bg-[#112240]',
                    primaryText: 'text-[#64ffda]',
                    accent: 'text-[#cca43b]',
                    accentBg: 'bg-[#cca43b]',
                    border: 'border-[#cca43b]/30',
                    pattern: pattern,
                    glass: "bg-[#0a192f]/80 backdrop-blur-xl border border-[#cca43b]/20 shadow-2xl"
                };
            }
            // Modern / Fallback Dark
            return {
                bg: 'bg-gray-900',
                primary: 'bg-gray-800',
                primaryText: 'text-white',
                accent: 'text-blue-400',
                accentBg: 'bg-blue-600',
                border: 'border-blue-500',
                pattern: '',
                glass: "bg-gray-900/80 backdrop-blur-xl border border-gray-700 shadow-2xl"
            };
        }

        // Light Mode
        switch (settings.theme) {
            case 'zellige': // زليج البهجة
                return {
                    bg: 'bg-[#FDFBF7]',
                    primary: 'bg-[#006269]',
                    primaryText: 'text-[#006269]',
                    accent: 'text-[#cca43b]',
                    accentBg: 'bg-[#cca43b]',
                    border: 'border-[#cca43b]',
                    pattern: pattern,
                    glass: "bg-white/80 backdrop-blur-xl border border-[#cca43b]/20 shadow-2xl"
                };
            case 'zellige-v2': // زليج اخضر
                return {
                    bg: 'bg-[#f5fcf9]',
                    primary: 'bg-[#024d38]',
                    primaryText: 'text-[#024d38]',
                    accent: 'text-[#10b981]',
                    accentBg: 'bg-[#024d38]',
                    border: 'border-[#c6e3d8]',
                    pattern: pattern,
                    glass: "bg-white/80 backdrop-blur-xl border border-[#c6e3d8]/20 shadow-2xl"
                };
            case 'zellige-algiers': // زليج اصيل (جزائري)
                return {
                    bg: 'bg-[#f8fafc]',
                    primary: 'bg-[#1e3a8a]',
                    primaryText: 'text-[#1e3a8a]',
                    accent: 'text-[#cca43b]',
                    accentBg: 'bg-[#cca43b]',
                    border: 'border-[#1e3a8a]',
                    pattern: pattern,
                    glass: "bg-white/80 backdrop-blur-xl border border-[#1e3a8a]/20 shadow-2xl"
                };
            default: // Modern
                return {
                    bg: 'bg-gray-50',
                    primary: 'bg-white',
                    primaryText: 'text-gray-900',
                    accent: 'text-blue-600',
                    accentBg: 'bg-blue-600',
                    border: 'border-blue-200',
                    pattern: '',
                    glass: "bg-white/80 backdrop-blur-xl border border-gray-200 shadow-2xl"
                };
        }
    };
    const th = getThemeConfig();

    // --- Secret Staff Access ---
    const handleSecretLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (secretPin === '0000') { // Simple PIN for demo
            sessionStorage.setItem('staffMode', 'true');
            window.location.reload();
        } else {
            addNotification('رمز الدخول غير صحيح', 'error');
            setSecretPin('');
        }
    };

    const handleServiceClick = (service: any) => {
        setSelectedService(service);
    };

    const contactOptions = [
        { title: 'مركز الحجز الهاتفي', desc: 'تحدث مباشرة مع موظفينا للحجز والاستفسار', icon: Phone, color: 'bg-emerald-50 text-emerald-600', action: `tel:${settings.hotelPhone}` },
        { title: 'واتساب الفندق', desc: 'راسلنا عبر الواتساب لرد سريع ومباشر', icon: MessageCircle, color: 'bg-green-50 text-green-600', action: `https://wa.me/${settings.whatsappNumber?.replace(/[^\d+]/g, '')}` },
        { title: 'التوجيه والمرافقة', icon: MapPin, desc: 'احصل على نصائح حول أفضل الأماكن للزيارة في الجزائر', color: 'bg-amber-50 text-amber-600', action: 'chat' },
        { title: 'البريد الإلكتروني', icon: Mail, desc: 'راسلنا لطلبات المجموعات والفعاليات الكبرى', color: 'bg-blue-50 text-blue-600', action: `mailto:${settings.hotelEmail}` },
    ];

    // Merge static services with dynamic public services
    const allServices = [
        { id: 'ps1', title: 'المطعم الأندلسي المستقل', category: 'dining', iconName: 'Utensils', desc: 'مطعم فاخر بقاعة خاصة مستقلة، يقدم أشهى الأطباق التقليدية والعالمية.', color: 'bg-orange-50 text-orange-600' },
        { id: 'ps2', title: 'مقهى القصبة المستقل', category: 'dining', iconName: 'Coffee', desc: 'مقهى بقاعة خاصة مستقلة، مثالي للاسترخاء والاستمتاع بالحلويات التقليدية.', color: 'bg-emerald-50 text-emerald-600' },
        { id: 'ps3', title: 'المسبح والقاعة المتعددة', category: 'internal', iconName: 'Waves', desc: 'مرفق متكامل يضم مسبحاً وقاعة متعددة الخدمات للنشاطات المختلفة.', color: 'bg-cyan-50 text-cyan-600' },
        { id: 'ps4', title: 'الأجنحة والقاعات VIP', category: 'internal', iconName: 'Crown', desc: 'مساحات حصرية مخصصة لكبار الشخصيات ورجال الأعمال.', color: 'bg-yellow-50 text-yellow-600' },
        { id: 'ps5', title: 'الحديقة والأكشاك', category: 'internal', iconName: 'Flower2', desc: 'استمتع بالهواء الطلق في حديقتنا الواسعة مع خدمات الأكشاك المتنوعة.', color: 'bg-green-50 text-green-600' },
        { id: 'room-service', title: 'خدمة الغرف 24/7', category: 'internal', iconName: 'Bell', desc: 'استمتع بوجباتك المفضلة في خصوصية غرفتك في أي وقت (للنزلاء فقط).', color: 'bg-blue-50 text-blue-600' },
        ...publicServices.filter(s => !['ps1', 'ps2', 'ps3', 'ps4', 'ps5', 'ps6'].includes(s.id)).map(s => ({
            ...s,
            iconName: s.iconName || 'Star',
            color: s.color || 'bg-gray-50 text-gray-600'
        }))
    ];

    const displayedVisitorServices = allServices.filter(s => activeCategory === 'all' || s.category === activeCategory);

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        const found = bookings.find(b => 
            b.id.toLowerCase().includes(bookingRef.toLowerCase()) || 
            b.guestToken === bookingRef ||
            b.primaryGuestName.toLowerCase().includes(bookingRef.toLowerCase())
        );
        
        if (found) {
            setVerificationResult(found);
            if (found.status === 'active') {
                setResidentData(found);
                addNotification(`مرحباً بك ${found.primaryGuestName}، تم التحقق من هويتك بنجاح.`, 'success');
                setActiveSection('resident_dashboard');
            }
        } else {
            addNotification('لم يتم العثور على حجز بهذا الرقم', "error");
            setVerificationResult(null);
        }
    };

    const handlePlaceOrder = () => {
        if (orderCart.length === 0) return;
        
        const total = orderCart.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0);
        const orderId = `res-ord-${Date.now()}`;
        const newOrder = {
            id: orderId,
            items: orderCart,
            totalAmount: total,
            status: 'pending' as const,
            type: residentData ? 'room_service' as const : 'dine_in' as const,
            source: 'restaurant' as const,
            targetNumber: residentData ? `Room ${residentData.roomId}` : 'Visitor Table',
            roomId: residentData?.roomId || 0,
            customerName: residentData?.primaryGuestName || 'Visitor',
            timestamp: new Date().toISOString(),
            notes: residentData ? 'إضافة إلى فاتورة الغرفة' : 'دفع نقدي/بطاقة عند الاستلام'
        };
        
        setBillingData(newOrder);
        setShowBillingModal(true);
    };

    const handleTicketPurchase = () => {
        const newBkg = addBooking({
            primaryGuestName: residentData?.primaryGuestName || 'Visitor',
            checkInDate: `${ticketDetails.date}T${ticketDetails.time}`,
            checkOutDate: `${ticketDetails.date}T${ticketDetails.time}`,
            status: 'active',
            guests: [],
            totalAmount: ticketDetails.quantity * ticketDetails.price,
            notes: `عدد التذاكر: ${ticketDetails.quantity}. الفعالية: ${ticketDetails.eventName}`,
            mealPlan: 'room_only',
            extraServices: [],
            roomId: residentData?.roomId || 0
        }, []);
        
        setMyBookingIds(prev => [...prev, newBkg.id]);
        addNotification(`تم حجز ${ticketDetails.quantity} تذاكر لـ ${ticketDetails.eventName} بنجاح!`, 'success');
        setShowTicketModal(false);
        setSelectedService(null);
    };

    const confirmOrderFromBilling = () => {
        if (!billingData) return;
        addRestaurantOrder(billingData);
        setMyOrderIds(prev => [...prev, billingData.id]);
        addNotification('تم تأكيد الطلب والمصادقة على الفاتورة بنجاح!', 'success');
        setOrderCart([]);
        setBillingData(null);
        setShowBillingModal(false);
        setSelectedService(null);
    };

    const handleMaintenanceRequest = (e: React.FormEvent) => {
        e.preventDefault();
        if (!residentData || !maintenanceDesc) return;
        
        requestService(
            'maintenance', 
            'room', 
            residentData.roomId.toString(), 
            maintenanceDesc
        );
        
        addNotification('تم تسجيل طلب الصيانة، سيصلكم فريقنا قريباً.', 'success');
        setMaintenanceDesc('');
        setShowMaintenanceForm(false);
    };

    const handleSubmitFeedback = (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedbackTarget) return;

        addServiceFeedback({
            id: `fb-${Date.now()}`,
            targetId: feedbackTarget.id,
            targetType: feedbackTarget.type,
            guestName: residentData?.primaryGuestName || 'ضيف زائر',
            rating: feedbackRating,
            comment: feedbackComment,
            date: new Date().toISOString()
        });

        setShowFeedbackModal(false);
        setFeedbackTarget(null);
        setFeedbackRating(5);
        setFeedbackComment('');
    };

    const renderServiceContent = (service: any) => {
        const ServiceIcon = IconMap[service.iconName] || Star;
        const isDining = service.title?.includes('المطعم') || service.title?.includes('المقهى') || service.category === 'dining';
        const isInternal = service.category === 'internal';
        const isExternal = service.category === 'external';

        if (isDining) {
            // Group menu items by category
            const menuCategories = Array.from(new Set(menuItems.map(item => item.category)));

            return (
                <div className="space-y-8">
                    {/* Header with Icon instead of Image */}
                    <div className={`relative h-64 rounded-[3rem] overflow-hidden mb-6 flex items-center justify-center ${service.color.split(' ')[0]} border-4 border-white shadow-2xl`}>
                        <div className={`absolute inset-0 opacity-10 ${th.pattern}`}></div>
                        <div className="text-center relative z-10">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                                <ServiceIcon size={48} className={service.color.split(' ')[1]} />
                            </div>
                            <h4 className={`font-black text-4xl ${service.color.split(' ')[1]}`}>{service.title}</h4>
                        </div>
                    </div>

                    <p className="text-gray-600 font-medium leading-relaxed text-lg text-center max-w-2xl mx-auto">{service.desc || 'استمتع بتجربة طعام فريدة تجمع بين الأصالة الجزائرية واللمسات العالمية في قاعاتنا المستقلة.'}</p>
                    
                    {/* Smart Dining Features */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: 'الطلب الذاتي', desc: 'اطلب مباشرة من هاتفك للمطبخ', icon: Smartphone, color: 'text-blue-600 bg-blue-50' },
                            { title: 'إدارة الطاولات', desc: 'حجز ومتابعة حالة الطاولات', icon: Layout, color: 'text-emerald-600 bg-emerald-50' },
                            { title: 'دفع مرن', icon: CreditCard, desc: residentData ? 'إضافة لفاتورة الإقامة' : 'دفع نقدي أو بالبطاقة', color: 'text-amber-600 bg-amber-50' },
                            { title: 'تتبع حي', icon: Activity, desc: 'متابعة حالة الطلب لحظياً', color: 'text-purple-600 bg-purple-50' },
                        ].map((feat, idx) => (
                            <div key={idx} className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                                <div className={`w-12 h-12 rounded-2xl ${feat.color} flex items-center justify-center mb-3`}>
                                    <feat.icon size={24} />
                                </div>
                                <h5 className="font-black text-sm text-gray-800 mb-1">{feat.title}</h5>
                                <p className="text-[10px] text-gray-400 font-bold">{feat.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Self-Service Info Box */}
                    <div className="bg-amber-50 border-2 border-dashed border-amber-200 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-right">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                            <Utensils size={32} />
                        </div>
                        <div>
                            <h5 className="font-black text-xl text-amber-900 mb-1">خدمة ذاتية ذكية</h5>
                            <p className="text-amber-700 font-bold text-sm">يمكنكم الطلب مباشرة من القائمة أدناه، وسيصل طلبكم إلى غرفتكم أو طاولتكم فور تحضيره، تماماً كما يفعل النادل.</p>
                        </div>
                    </div>
                    
                    {/* Menu Sections */}
                    <div className="space-y-8">
                        {menuCategories.map(category => (
                            <div key={category} className="bg-gray-50 rounded-[2.5rem] p-6 border border-gray-100">
                                <h4 className="font-black text-xl text-[#006269] mb-4 flex items-center gap-2 px-2">
                                    <Utensils size={20} className="text-[#cca43b]" /> 
                                    {category === 'meal' ? 'الأطباق الرئيسية' : 
                                     category === 'breakfast' ? 'المقبلات' : 
                                     category === 'dessert' ? 'الحلويات' : 
                                     category === 'hot_drink' || category === 'cold_drink' ? 'المشروبات' : category}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {menuItems.filter(item => item.category === category).map(item => (
                                        <div key={item.id} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-100 hover:border-[#cca43b]/30 transition-all group shadow-sm hover:shadow-md">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-[#cca43b] group-hover:scale-110 transition-transform">
                                                    <Utensils size={20} />
                                                </div>
                                                <div>
                                                    <span className="font-black text-gray-800 block text-lg">{item.name}</span>
                                                    <span className="text-xs text-gray-400 font-bold">{item.description || 'طبق مميز'}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[#cca43b] font-black text-lg">{item.price} د.ج</span>
                                                <button 
                                                    onClick={() => {
                                                        setOrderCart(prev => {
                                                            const exists = prev.find(i => i.item.id === item.id);
                                                            if (exists) return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
                                                            return [...prev, { item, quantity: 1 }];
                                                        });
                                                        addNotification(`تمت إضافة ${item.name} للسلة`, 'success');
                                                    }}
                                                    className="p-3 bg-[#006269] text-white rounded-xl hover:bg-[#004d53] shadow-md active:scale-90 transition-all"
                                                >
                                                    <Plus size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Reservation & Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-[#006269]/5 rounded-[2rem] border-2 border-dashed border-[#006269]/10 flex items-center gap-4">
                            <Clock size={24} className="text-[#cca43b]" />
                            <div>
                                <span className="font-black text-[#006269] block">أوقات العمل</span>
                                <span className="text-sm text-gray-500 font-bold">07:00 صباحاً - 11:00 مساءً</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => {
                                    setBookingDetails(prev => ({ ...prev, serviceName: service.title, reservationType: 'table' }));
                                    setShowBookingModal(true);
                                }}
                                className="flex-1 p-6 bg-[#cca43b] text-white rounded-[2rem] font-black text-lg shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                <Calendar size={24} /> حجز طاولة
                            </button>
                            <button 
                                onClick={() => {
                                    setFeedbackTarget({ id: service.id, title: service.title, type: 'service' });
                                    setShowFeedbackModal(true);
                                }}
                                className="p-6 bg-white text-[#006269] border-2 border-[#006269] rounded-[2rem] font-black text-lg shadow-lg hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center"
                                title="تقييم الخدمة"
                            >
                                <Star size={24} />
                            </button>
                        </div>
                    </div>

                    {orderCart.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="sticky bottom-4 p-6 bg-[#006269] text-white rounded-[2rem] shadow-2xl border-4 border-[#cca43b]/20 z-50">
                            <div className="flex justify-between items-center mb-4">
                                <h5 className="font-black text-xl flex items-center gap-2">
                                    <Search size={20} /> ملخص الطلب ({orderCart.length} أصناف)
                                </h5>
                                <span className="font-black text-2xl text-[#cca43b]">{orderCart.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0)} د.ج</span>
                            </div>
                            <button 
                                onClick={handlePlaceOrder}
                                className="w-full py-4 bg-white text-[#006269] rounded-2xl font-black text-lg shadow-lg hover:bg-gray-100 active:scale-95 transition-all"
                            >
                                {residentData ? `تأكيد الطلب وإضافته للغرفة ${residentData.roomId}` : 'تأكيد الطلب والدفع عند الاستلام'}
                            </button>
                        </motion.div>
                    )}
                </div>
            );
        }

        if (isExternal) {
            return (
                <div className="space-y-8">
                    {/* Header with Icon instead of Image */}
                    <div className={`relative h-64 rounded-[3rem] overflow-hidden mb-6 flex items-center justify-center ${service.color?.split(' ')[0] || 'bg-gray-100'} border-4 border-white shadow-2xl`}>
                        <div className={`absolute inset-0 opacity-10 ${th.pattern}`}></div>
                        <div className="text-center relative z-10">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                                <ServiceIcon size={48} className={service.color?.split(' ')[1] || 'text-gray-600'} />
                            </div>
                            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-gray-800 text-xs font-black uppercase tracking-widest mb-2">
                                خدمة خارجية
                            </div>
                            <h4 className={`font-black text-4xl ${service.color?.split(' ')[1] || 'text-gray-800'}`}>{service.title}</h4>
                        </div>
                    </div>

                    <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-[2.5rem] p-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                                <Truck size={28} />
                            </div>
                            <div>
                                <h5 className="font-black text-xl text-blue-900">نظام اللوجستيات الذكي</h5>
                                <p className="text-blue-700 font-bold text-sm">توصيل آمن وسريع عبر أسطولنا المتكامل</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="bg-white/50 p-4 rounded-2xl flex items-start gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Bike size={18}/></div>
                                <div>
                                    <span className="font-black text-sm block">أسطول توصيل متنوع</span>
                                    <span className="text-[10px] text-gray-500 font-bold">دراجات، سيارات، وشاحنات مجهزة.</span>
                                </div>
                            </div>
                            <div className="bg-white/50 p-4 rounded-2xl flex items-start gap-3">
                                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><QrCode size={18}/></div>
                                <div>
                                    <span className="font-black text-sm block">تتبع عبر QR Code</span>
                                    <span className="text-[10px] text-gray-500 font-bold">رمز فريد لكل طلب لضمان الأمان.</span>
                                </div>
                            </div>
                            <div className="bg-white/50 p-4 rounded-2xl flex items-start gap-3">
                                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><MapPin size={18}/></div>
                                <div>
                                    <span className="font-black text-sm block">نقاط خدمة منتشرة</span>
                                    <span className="text-[10px] text-gray-500 font-bold">أكشاك ومرافق في الحدائق والمسابح.</span>
                                </div>
                            </div>
                            <div className="bg-white/50 p-4 rounded-2xl flex items-start gap-3">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Activity size={18}/></div>
                                <div>
                                    <span className="font-black text-sm block">تكامل خارجي</span>
                                    <span className="text-[10px] text-gray-500 font-bold">نربط طلباتكم الخارجية بنظامنا فوراً.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="prose prose-sm max-w-none text-center">
                        <p className="text-gray-600 font-medium leading-relaxed text-xl">
                            {service.desc || service.description || 'نقدم لكم أرقى الخدمات المصممة خصيصاً لتلبية تطلعاتكم.'}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <button 
                            onClick={() => {
                                setBookingDetails(prev => ({ ...prev, serviceName: service.title, reservationType: 'general' }));
                                setShowBookingModal(true);
                                setSelectedService(null);
                            }}
                            className="w-full bg-[#006269] text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <Send size={20} /> طلب الخدمة الآن
                        </button>
                        <button 
                            onClick={() => setShowContactCenter(true)}
                            className="w-full bg-white text-[#cca43b] border-2 border-[#cca43b] py-5 rounded-2xl font-black text-xl hover:bg-[#cca43b]/5 transition-all flex items-center justify-center gap-3"
                        >
                            <Phone size={20} /> استفسار
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-8">
                {/* Header with Icon instead of Image */}
                <div className={`relative h-64 rounded-[3rem] overflow-hidden mb-6 flex items-center justify-center ${service.color?.split(' ')[0] || 'bg-gray-100'} border-4 border-white shadow-2xl`}>
                    <div className={`absolute inset-0 opacity-10 ${th.pattern}`}></div>
                    <div className="text-center relative z-10">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                            <ServiceIcon size={48} className={service.color?.split(' ')[1] || 'text-gray-600'} />
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-gray-800 text-xs font-black uppercase tracking-widest mb-2">
                            {isInternal ? 'مرافق الفندق' : 'خدمة فندقية'}
                        </div>
                        <h4 className={`font-black text-4xl ${service.color?.split(' ')[1] || 'text-gray-800'}`}>{service.title}</h4>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 bg-emerald-50 rounded-2xl text-center">
                        <Clock size={20} className="mx-auto mb-1 text-emerald-600" />
                        <span className="text-[10px] font-black text-emerald-700 block">متاح الآن</span>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-2xl text-center">
                        <Star size={20} className="mx-auto mb-1 text-amber-600" />
                        <span className="text-[10px] font-black text-amber-700 block">جودة عالية</span>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-2xl text-center">
                        <ShieldCheck size={20} className="mx-auto mb-1 text-blue-600" />
                        <span className="text-[10px] font-black text-blue-700 block">آمن</span>
                    </div>
                </div>

                <div className="prose prose-sm max-w-none text-center">
                    <p className="text-gray-600 font-medium leading-relaxed text-xl">
                        {service.desc || service.description || 'نقدم لكم أرقى الخدمات المصممة خصيصاً لتلبية تطلعاتكم.'}
                    </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                    <h5 className="font-black text-[#006269] mb-4 flex items-center gap-2">
                        <Info size={18} /> تفاصيل الخدمة:
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><CreditCard size={16}/></div>
                            <div>
                                <span className="text-[10px] text-gray-400 font-bold block">طريقة الدفع</span>
                                <span className="text-xs font-black">{residentData ? 'على فاتورة الغرفة' : 'دفع مباشر'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                            <div className={`p-2 bg-emerald-50 text-emerald-600 rounded-lg`}><CheckCircle size={16}/></div>
                            <div>
                                <span className="text-[10px] text-gray-400 font-bold block">الحالة</span>
                                <span className="text-xs font-black">جاهز للتنفيذ</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => {
                                setBookingDetails(prev => ({ ...prev, serviceName: service.title, reservationType: 'general' }));
                                setShowBookingModal(true);
                                setSelectedService(null);
                            }}
                            className="flex-1 bg-[#006269] text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <Calendar size={24} /> حجز موعد/قاعة
                        </button>
                        <button 
                            onClick={() => {
                                setFeedbackTarget({ id: service.id, title: service.title, type: 'facility' });
                                setShowFeedbackModal(true);
                            }}
                            className="p-6 bg-white text-[#006269] border-2 border-[#006269] rounded-[2rem] font-black text-lg shadow-lg hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center"
                            title="تقييم الخدمة"
                        >
                            <Star size={24} />
                        </button>
                    </div>
                    <button 
                        onClick={() => setShowContactCenter(true)}
                        className="w-full bg-white text-[#cca43b] border-2 border-[#cca43b] py-5 rounded-2xl font-black text-xl hover:bg-[#cca43b]/5 transition-all flex items-center justify-center gap-3"
                    >
                        <Phone size={20} /> استفسار
                    </button>
                </div>
            </div>
        );
    };

    const startCamera = async () => {
        setShowCamera(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
            addNotification("تعذر الوصول للكاميرا", "error");
            setShowCamera(false);
        }
    };

    // --- BOTTOM NAVIGATION COMPONENT ---
    const BottomNav = () => (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-lg bg-white/90 backdrop-blur-2xl border border-white/20 px-6 py-3 flex justify-between items-center z-[60] shadow-2xl rounded-[2.5rem] border-b-4 border-b-[#cca43b]/20 transition-all duration-500 ${showNav ? 'translate-y-0 opacity-100' : 'translate-y-[200%] opacity-0'}`}>
            {[
                { id: 'home', label: 'الرئيسية', icon: Building2 },
                { id: 'bookings', label: 'حجوزاتي', icon: CalendarCheck },
                { id: 'dining', label: 'المطاعم', icon: Utensils, isAction: true },
                { id: 'external_services', label: 'خدمات خارجية', icon: Truck },
                { id: 'chat', label: 'مراسلة', icon: MessageSquare },
            ].map(nav => (
                <button 
                    key={nav.id}
                    onClick={() => {
                        if (nav.id === 'tickets') {
                            const ticketService = publicServices.find(s => s.title.includes('تذاكر') || s.title.includes('مسبح') || s.category === 'wellness');
                            if (ticketService) {
                                setTicketDetails({ ...ticketDetails, eventName: ticketService.title });
                                setShowTicketModal(true);
                            } else {
                                setTicketDetails({ ...ticketDetails, eventName: 'تذكرة دخول عامة' });
                                setShowTicketModal(true);
                            }
                        } else if (nav.id === 'chat') {
                            setShowChatModal(true);
                        } else if (nav.id === 'dining') {
                            const dining = publicServices.find(s => s.category === 'dining');
                            if (dining) setSelectedService(dining);
                            else setActiveSection('visitor');
                        } else {
                            setActiveSection(nav.id as any);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                    }}
                    className={`flex flex-col items-center gap-1.5 transition-all relative group ${activeSection === nav.id ? 'text-[#006269] scale-110' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    {nav.isAction ? (
                        <div className="relative -top-8">
                            <div className="w-16 h-16 bg-[#cca43b] text-white rounded-full shadow-[0_10px_25px_rgba(204,164,59,0.4)] flex items-center justify-center border-4 border-white active:scale-90 transition-all">
                                <nav.icon size={28} strokeWidth={2.5} />
                            </div>
                            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-[#cca43b] whitespace-nowrap">{nav.label}</span>
                        </div>
                    ) : (
                        <>
                            <div className={`p-3 rounded-2xl transition-all duration-500 ${activeSection === nav.id ? 'bg-[#006269] text-white shadow-xl' : 'bg-transparent group-hover:bg-gray-100'}`}>
                                <nav.icon size={22} />
                            </div>
                            <span className={`text-[10px] font-black transition-all ${activeSection === nav.id ? 'opacity-100' : 'opacity-60'}`}>
                                {nav.label}
                            </span>
                            {activeSection === nav.id && (
                                <motion.div layoutId="nav-dot" className="absolute -bottom-1 w-1 h-1 bg-[#cca43b] rounded-full" />
                            )}
                        </>
                    )}
                </button>
            ))}
        </div>
    );

    // --- Render ---

    return (
        <div className={`min-h-screen ${th.bg} font-sans text-gray-800 flex flex-col relative overflow-x-hidden pb-32`} dir="rtl">
            {/* Background Pattern */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
                <div className="absolute inset-0 bg-[radial-gradient(#006269_1px,transparent_1px)] [background-size:40px_40px]"></div>
            </div>

            {residentData ? (
                <GuestPortal 
                    token={residentData.guestToken} 
                    onExit={() => setResidentData(null)} 
                    onLogoClick={handleHiddenClick}
                />
            ) : (guestProfile && isVisitorMode) ? (
                <VisitorPortal 
                    guestProfile={guestProfile} 
                    onExit={() => setIsVisitorMode(false)} 
                    onLogoClick={handleHiddenClick}
                />
            ) : showScanner ? (
                <EntryScanner 
                    hotelName={settings.appName}
                    onScanResident={handleScanResident}
                    onRegisterVisitor={handleRegisterVisitor}
                    onManualEntry={handleScanResident}
                    onLogoClick={handleHiddenClick}
                />
            ) : (
                <>
                    {/* GUEST ONBOARDING MODAL */}
                    {showRegistrationModal && (
                        <GuestOnboardingModal 
                            onComplete={handleOnboardingComplete}
                            onClose={() => setShowRegistrationModal(false)}
                        />
                    )}

                    {/* Zellige Background Pattern Overlay */}
                    <div className={`fixed inset-0 opacity-5 pointer-events-none z-0 ${th.pattern} bg-repeat bg-[length:400px_400px]`}></div>

            {/* 6. SURROUNDINGS & DELIVERY SECTION */}
            {activeSection === 'surroundings' && (
                <div className="flex-1 overflow-y-auto custom-scrollbar pb-32">
                    {/* Hero Section */}
                    <div className="relative h-72 rounded-b-[3rem] overflow-hidden mb-8 shadow-2xl">
                        <img 
                            src="https://images.unsplash.com/photo-1596178065887-1198b6148b2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                            alt="Hotel Surroundings" 
                            className="w-full h-full object-cover"
                        />
                        <div className={`absolute inset-0 opacity-40 ${th.primary} mix-blend-multiply`}></div>
                        <div className={`absolute inset-0 opacity-20 ${th.pattern}`}></div>
                        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-[#cca43b] rounded-lg text-white">
                                    <Map size={24} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-[#cca43b]">اكتشف المحيط</span>
                            </div>
                            <h2 className="text-3xl font-black mb-2">خدمات التوصيل والمرافق الخارجية</h2>
                            <p className="text-gray-200 font-medium max-w-xl">استمتع بخدمات الفندق أينما كنت، في حدائقنا الغناء أو عبر شبكة التوصيل السريع.</p>
                        </div>
                    </div>

                    <div className="px-6 space-y-8">
                        
                        {/* Delivery Status Banner */}
                        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-gray-100 relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-full h-2 ${th.accentBg}`}></div>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="font-black text-xl text-gray-800 flex items-center gap-2">
                                        <Bike className="text-[#cca43b]" /> أسطول التوصيل النشط
                                    </h3>
                                    <p className="text-gray-500 text-sm font-bold mt-1">نصلك أينما كنت في محيط الفندق</p>
                                </div>
                                <div className="text-center">
                                    <span className="block text-3xl font-black text-[#006269]">{deliveryDrivers?.filter(d => d.status === 'available').length || 0}</span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">سائق متاح</span>
                                </div>
                            </div>

                            {/* Simulated Live Drivers */}
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {deliveryDrivers?.slice(0, 5).map(driver => (
                                    <div key={driver.id} className="min-w-[140px] p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center text-center">
                                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 text-[#006269]">
                                            {driver.vehicleType === 'bike' ? <Bike size={20} /> : <Car size={20} />}
                                        </div>
                                        <span className="font-bold text-sm text-gray-800">{driver.name}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 ${driver.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                            {driver.status === 'available' ? 'متاح للطلب' : 'مشغول'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Service Points Grid */}
                        <div>
                            <div className="flex justify-between items-end mb-6">
                                <h3 className="font-black text-2xl text-gray-800 flex items-center gap-2">
                                    <Trees className="text-[#006269]" /> واحات ومرافق الفندق
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {servicePoints?.map(point => (
                                    <div key={point.id} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300">
                                        <div className="h-48 bg-gray-200 relative overflow-hidden">
                                            {point.image ? (
                                                <img src={point.image} alt={point.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className={`w-full h-full flex items-center justify-center ${point.type === 'garden' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {point.type === 'garden' ? <Trees size={48} /> : <Store size={48} />}
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black shadow-sm flex items-center gap-1">
                                                <div className={`w-2 h-2 rounded-full ${point.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                                {point.status === 'active' ? 'مفتوح الآن' : 'مغلق'}
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-black text-xl text-gray-800">{point.name}</h4>
                                                <div className="p-2 bg-gray-50 rounded-full text-gray-400">
                                                    {point.type === 'kiosk' ? <Store size={18} /> : <Trees size={18} />}
                                                </div>
                                            </div>
                                            <p className="text-gray-500 text-sm font-medium mb-4 line-clamp-2">{point.description || 'استمتع بأجواء رائعة وخدمات مميزة في هذا المرفق.'}</p>
                                            
                                            <div className="flex items-center gap-2 text-xs text-gray-400 font-bold mb-6">
                                                <MapPin size={14} /> {point.location.address}
                                            </div>

                                            <div className="flex gap-3">
                                                <button 
                                                    onClick={() => {
                                                        setBookingDetails(prev => ({ ...prev, serviceName: point.name, notes: `طلب توصيل إلى: ${point.name}` }));
                                                        setShowBookingModal(true);
                                                    }}
                                                    className="flex-1 py-3 bg-[#006269] text-white rounded-xl font-black text-sm shadow-lg hover:bg-[#004d53] transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Package size={16} /> اطلب هنا
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        // Open location in maps (simulated)
                                                        window.open(`https://maps.google.com/?q=${point.location.lat},${point.location.lng}`, '_blank');
                                                    }}
                                                    className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-black text-sm hover:bg-gray-200 transition-colors"
                                                >
                                                    <Navigation size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div className={`rounded-[2.5rem] p-8 text-center relative overflow-hidden ${th.primary} text-white shadow-2xl`}>
                            <div className={`absolute inset-0 opacity-10 ${th.pattern}`}></div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black mb-2">هل أنت في مكان آخر؟</h3>
                                <p className="text-white/80 font-medium mb-6 max-w-md mx-auto">يمكننا توصيل طلباتك إلى أي مكان داخل محيط الفندق أو المناطق المجاورة.</p>
                                <button 
                                    onClick={() => {
                                        setBookingDetails(prev => ({ ...prev, serviceName: 'توصيل خارجي', notes: 'يرجى تحديد الموقع بدقة' }));
                                        setShowBookingModal(true);
                                    }}
                                    className="px-8 py-4 bg-[#cca43b] text-white rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2 mx-auto"
                                >
                                    <MapPin size={20} /> حدد موقعك واطلب
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )}

            {/* Bottom Navigation Dock */}
            {!propActivePage && <BottomNav />}

            {/* --- TOP NAVIGATION BAR --- */}
            {!propActivePage && (
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4 flex justify-between items-center ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg' : 'bg-transparent'}`}>
                <div 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={handleHiddenClick}
                >
                    <div className={`p-2 rounded-xl backdrop-blur-md border transition-all group-hover:scale-110 ${scrolled ? 'bg-[#006269] border-[#cca43b]/30' : 'bg-white/10 border-white/20'}`}>
                        <Building2 size={24} className={scrolled ? 'text-[#cca43b]' : 'text-white'} />
                    </div>
                    <div className={scrolled ? 'text-[#006269]' : 'text-white'}>
                        <h1 className="font-black text-lg leading-none group-hover:text-[#cca43b] transition-colors">{settings.appName}</h1>
                        <p className="text-[10px] font-bold tracking-widest uppercase opacity-70">Luxury & Heritage</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                     <button 
                        onClick={() => setShowNav(!showNav)}
                        className={`p-3 rounded-xl backdrop-blur-md border transition-all hover:scale-110 ${scrolled ? 'bg-gray-100 border-gray-200 text-[#006269]' : 'bg-white/10 border-white/20 text-white'}`}
                        title={showNav ? "إخفاء القائمة" : "إظهار القائمة"}
                    >
                        {showNav ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>
                    <button 
                        onClick={() => setShowContactCenter(true)}
                        className={`p-3 rounded-xl backdrop-blur-md border transition-all hover:scale-110 ${scrolled ? 'bg-gray-100 border-gray-200 text-[#006269]' : 'bg-white/10 border-white/20 text-white'}`}
                    >
                        <Phone size={20} />
                    </button>
                    <button 
                        onClick={() => setActiveSection('my_activity')}
                        className={`p-3 rounded-xl backdrop-blur-md border transition-all hover:scale-110 ${scrolled ? 'bg-gray-100 border-gray-200 text-[#006269]' : 'bg-white/10 border-white/20 text-white'}`}
                        title="نشاطاتي"
                    >
                        <Clock size={20} />
                    </button>
                    {residentData && (
                        <button 
                            onClick={() => setActiveSection('resident_dashboard')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md border transition-all hover:scale-105 ${scrolled ? 'bg-[#cca43b] border-[#cca43b] text-white' : 'bg-white/10 border-white/20 text-white'}`}
                        >
                            <User size={18} />
                            <span className="text-sm font-black hidden sm:block">{residentData.primaryGuestName}</span>
                        </button>
                    )}
                </div>
            </nav>
            )}

            {/* --- HERO SECTION --- */}
            {!propActivePage && (
            <header className={`relative min-h-[60vh] flex flex-col justify-center items-center text-white overflow-hidden ${th.primary} rounded-b-[5rem] shadow-2xl z-10 transition-all duration-700 ${activeSection !== 'home' ? 'min-h-[35vh]' : ''}`}>
                <div className={`absolute inset-0 opacity-25 ${th.pattern} mix-blend-multiply`}></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#006269]"></div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 px-6 text-center max-w-4xl mx-auto"
                >
                    <AnimatePresence mode="wait">
                        {activeSection === 'home' ? (
                            <motion.div
                                key="hero-home"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 text-[#cca43b] font-bold text-sm">
                                    <Sparkles size={16} />
                                    <span>أهلاً بكم في واحة الضيافة الجزائرية</span>
                                </div>
                                <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-white drop-shadow-2xl">
                                    اكتشف سحر <span className="text-[#cca43b] italic">الأصالة</span> <br/> في قلب الجزائر
                                </h2>
                                <p className="text-emerald-100 text-lg md:text-xl font-medium mb-8 max-w-2xl mx-auto leading-relaxed opacity-90">
                                    نحن لا نقدم مجرد إقامة، بل ننسج لك حكاية من الفخامة والراحة المستوحاة من عمق تاريخنا العريق.
                                </p>
                                <div className="flex flex-wrap justify-center gap-4">
                                    <button onClick={() => setActiveSection('current_guest')} className="bg-[#cca43b] text-white px-10 py-5 rounded-2xl font-black shadow-2xl hover:scale-105 transition-all active:scale-95 flex items-center gap-3">
                                        <User size={24} /> أنا نزيل حالي
                                    </button>
                                    <button onClick={() => setActiveSection('external_visitor')} className="bg-white/10 backdrop-blur-md text-white border border-white/30 px-10 py-5 rounded-2xl font-black hover:bg-white/20 transition-all active:scale-95 flex items-center gap-3">
                                        <Globe size={24} /> أنا زائر خارجي
                                    </button>
                                    <button onClick={() => setActiveSection('bookings')} className="bg-white text-[#006269] px-10 py-5 rounded-2xl font-black shadow-xl hover:scale-105 transition-all active:scale-95 flex items-center gap-3">
                                        <Calendar size={24} /> حجز جديد
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="hero-compact"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-12"
                            >
                                <div className="flex items-center justify-center gap-6">
                                    {activeSection !== 'home' && (
                                        <div className="flex items-center gap-3">
                                            <motion.button
                                                whileHover={{ x: 5 }}
                                                onClick={() => setActiveSection('home')}
                                                className="p-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white hover:bg-white/20 transition-all"
                                                title="العودة للرئيسية"
                                            >
                                                <ChevronRight size={24} className="rotate-180" />
                                            </motion.button>
                                        </div>
                                    )}
                                    <h2 className="text-4xl font-black text-white">
                                        {activeSection === 'current_guest' && 'بوابة النزلاء الحالية'}
                                        {activeSection === 'external_visitor' && 'بوابة الزوار الخارجيين'}
                                        {activeSection === 'my_activity' && 'نشاطاتي وطلباتي'}
                                        {activeSection === 'resident' && 'بوابة النزلاء الرقمية'}
                                        {activeSection === 'visitor' && 'المطاعم والكافيهات'}
                                        {activeSection === 'restaurant_public' && 'المطعم'}
                                        {activeSection === 'cafe_public' && 'المقهى'}
                                        {activeSection === 'pool_public' && 'المسبح'}
                                        {activeSection === 'external_services' && 'الخدمات الخارجية والتوصيل'}
                                        {activeSection === 'verify' && 'التحقق الذكي من الحجز'}
                                        {activeSection === 'resident_dashboard' && 'لوحة تحكم الجناح'}
                                        {activeSection === 'facilities' && 'المرافق والخدمات'}
                                        {activeSection === 'hotel_map' && 'خريطة الفندق التفاعلية'}
                                        {activeSection === 'bookings' && 'حجز جديد'}
                                        {activeSection === 'events' && 'الفعاليات والعروض'}
                                        {activeSection === 'about' && 'عن الفندق'}
                                        {activeSection === 'contact' && 'اتصل بنا'}
                                    </h2>
                                </div>
                                <div className="w-24 h-1 bg-[#cca43b] mx-auto mt-4 rounded-full"></div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Decorative Elements */}
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#FDFBF7] to-transparent z-0"></div>
            </header>
            )}

            {/* --- MAIN CONTENT AREA --- */}
            <main className={`flex-1 max-w-6xl mx-auto w-full px-4 relative z-20 pb-24 ${propActivePage ? 'mt-6' : '-mt-16'}`}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                
                        {/* CURRENT GUEST PORTAL */}
                        {activeSection === 'current_guest' && (
                            <div className="space-y-8">
                                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 text-center">
                                    <h3 className="text-3xl font-black text-gray-900 mb-4">أهلاً بك نزيلنا العزيز</h3>
                                    <p className="text-gray-500 font-bold mb-8">اختر الخدمة التي تحتاجها وسنكون في خدمتك فوراً</p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                                        {[
                                            { id: 'scan', label: 'مسح QR', icon: Scan, color: 'bg-[#cca43b]/10 text-[#cca43b]', action: () => setShowScanner(true) },
                                            { id: 'restaurant', label: 'المطعم', icon: Utensils, color: 'bg-orange-50 text-orange-600', action: () => { setActiveSection('visitor'); setActiveCategory('dining'); } },
                                            { id: 'cafe', label: 'المقهى', icon: Coffee, color: 'bg-amber-50 text-amber-600', action: () => { setActiveSection('visitor'); setActiveCategory('dining'); } },
                                            { id: 'pool', label: 'المسبح', icon: Waves, color: 'bg-cyan-50 text-cyan-600', action: () => { setActiveSection('pool_public'); } },
                                            { id: 'report', label: 'الإبلاغ', icon: Bell, color: 'bg-red-50 text-red-600', action: () => setShowReportModal(true) },
                                            { id: 'maintenance', label: 'الصيانة', icon: Settings2, color: 'bg-blue-50 text-blue-600', action: () => setShowMaintenanceModal(true) },
                                            { id: 'room_requests', label: 'طلبات الغرفة', icon: ConciergeBell, color: 'bg-cyan-50 text-cyan-600', action: () => setShowRoomRequestModal(true) },
                                        ].map(item => (
                                            <button 
                                                key={item.id}
                                                onClick={item.action}
                                                className="p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:scale-105 transition-all flex flex-col items-center gap-3 group"
                                            >
                                                <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center group-hover:rotate-12 transition-transform`}>
                                                    <item.icon size={28} />
                                                </div>
                                                <span className="font-black text-sm text-gray-800 text-center">{item.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <button onClick={() => setActiveSection('resident')} className="p-10 bg-[#006269] text-white rounded-[3rem] shadow-xl text-right relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Key size={80} /></div>
                                        <h4 className="text-2xl font-black mb-2">تسجيل الدخول للجناح</h4>
                                        <p className="opacity-80 font-bold">الوصول لخدمات الغرف والتحكم الذكي</p>
                                    </button>
                                    <button onClick={() => onNavigate('events_map')} className="p-10 bg-white text-[#cca43b] border-2 border-[#cca43b] rounded-[3rem] shadow-xl text-right relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Map size={80} /></div>
                                        <h4 className="text-2xl font-black mb-2">خريطة الحجوزات والفعاليات</h4>
                                        <p className="text-gray-400 font-bold">استكشف المناطق المتاحة والتذاكر</p>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* RESTAURANT PUBLIC */}
                        {activeSection === 'restaurant_public' && (
                            <div className="space-y-8">
                                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 text-center relative overflow-hidden">
                                    <div className={`absolute inset-0 opacity-5 ${th.pattern} pointer-events-none`}></div>
                                    <div className="w-24 h-24 bg-orange-50 text-orange-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl relative z-10">
                                        <Utensils size={48} />
                                    </div>
                                    <h3 className="text-4xl font-black text-gray-900 mb-4 relative z-10">مطعم الفندق الفاخر</h3>
                                    <p className="text-gray-500 font-bold text-lg mb-8 max-w-2xl mx-auto relative z-10">استمتع بأشهى المأكولات الجزائرية والعالمية في أجواء راقية وخدمة متميزة.</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 relative z-10">
                                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                            <Clock className="mx-auto mb-3 text-orange-600" size={24} />
                                            <h4 className="font-black text-gray-900 mb-1">ساعات العمل</h4>
                                            <p className="text-gray-500 text-sm font-bold">06:00 صباحاً - 11:00 مساءً</p>
                                        </div>
                                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                            <Star className="mx-auto mb-3 text-orange-600" size={24} />
                                            <h4 className="font-black text-gray-900 mb-1">التقييم</h4>
                                            <p className="text-gray-500 text-sm font-bold">4.9/5 (250+ تقييم)</p>
                                        </div>
                                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                            <MapPin className="mx-auto mb-3 text-orange-600" size={24} />
                                            <h4 className="font-black text-gray-900 mb-1">الموقع</h4>
                                            <p className="text-gray-500 text-sm font-bold">الطابق الأرضي - الجناح الشرقي</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                                        <button 
                                            onClick={() => {
                                                setTicketDetails({ eventName: 'حجز طاولة مطعم', price: 0, date: new Date().toISOString().split('T')[0], time: '19:00', quantity: 2 });
                                                setShowTicketModal(true);
                                            }}
                                            className="px-12 py-5 bg-orange-600 text-white rounded-2xl font-black text-xl shadow-2xl hover:bg-orange-700 transition-all active:scale-95"
                                        >
                                            حجز طاولة الآن
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setActiveSection('visitor');
                                                setActiveCategory('dining');
                                            }}
                                            className="px-12 py-5 bg-gray-100 text-gray-700 rounded-2xl font-black text-xl hover:bg-gray-200 transition-all"
                                        >
                                            عرض قائمة الطعام
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CAFE PUBLIC */}
                        {activeSection === 'cafe_public' && (
                            <div className="space-y-8">
                                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 text-center relative overflow-hidden">
                                    <div className={`absolute inset-0 opacity-5 ${th.pattern} pointer-events-none`}></div>
                                    <div className="w-24 h-24 bg-amber-50 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl relative z-10">
                                        <Coffee size={48} />
                                    </div>
                                    <h3 className="text-4xl font-black text-gray-900 mb-4 relative z-10">مقهى الفندق التقليدي</h3>
                                    <p className="text-gray-500 font-bold text-lg mb-8 max-w-2xl mx-auto relative z-10">أفضل أنواع القهوة والحلويات التقليدية في جو هادئ ومريح.</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 relative z-10">
                                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                            <Clock className="mx-auto mb-3 text-amber-600" size={24} />
                                            <h4 className="font-black text-gray-900 mb-1">ساعات العمل</h4>
                                            <p className="text-gray-500 text-sm font-bold">07:00 صباحاً - 12:00 منتصف الليل</p>
                                        </div>
                                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                            <Sparkles className="mx-auto mb-3 text-amber-600" size={24} />
                                            <h4 className="font-black text-gray-900 mb-1">المميزات</h4>
                                            <p className="text-gray-500 text-sm font-bold">جلسات خارجية، واي فاي مجاني</p>
                                        </div>
                                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                            <MapPin className="mx-auto mb-3 text-amber-600" size={24} />
                                            <h4 className="font-black text-gray-900 mb-1">الموقع</h4>
                                            <p className="text-gray-500 text-sm font-bold">البهو الرئيسي</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                                        <button 
                                            onClick={() => {
                                                setTicketDetails({ eventName: 'حجز طاولة مقهى', price: 0, date: new Date().toISOString().split('T')[0], time: '16:00', quantity: 2 });
                                                setShowTicketModal(true);
                                            }}
                                            className="px-12 py-5 bg-amber-600 text-white rounded-2xl font-black text-xl shadow-2xl hover:bg-amber-700 transition-all active:scale-95"
                                        >
                                            حجز طاولة الآن
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setActiveSection('visitor');
                                                setActiveCategory('dining');
                                            }}
                                            className="px-12 py-5 bg-gray-100 text-gray-700 rounded-2xl font-black text-xl hover:bg-gray-200 transition-all"
                                        >
                                            عرض المنيو
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* POOL PUBLIC */}
                        {activeSection === 'pool_public' && (
                            <div className="space-y-8">
                                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 text-center relative overflow-hidden">
                                    <div className={`absolute inset-0 opacity-5 ${th.pattern} pointer-events-none`}></div>
                                    <div className="w-24 h-24 bg-cyan-50 text-cyan-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl relative z-10">
                                        <Waves size={48} />
                                    </div>
                                    <h3 className="text-4xl font-black text-gray-900 mb-4 relative z-10">مسبح الفندق والسبا</h3>
                                    <p className="text-gray-500 font-bold text-lg mb-8 max-w-2xl mx-auto relative z-10">استمتع بتجربة استرخاء فريدة في مسبحنا المصمم على الطراز العالمي مع خدمات السبا المتكاملة.</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 relative z-10">
                                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                            <Clock className="mx-auto mb-3 text-cyan-600" size={24} />
                                            <h4 className="font-black text-gray-900 mb-1">ساعات العمل</h4>
                                            <p className="text-gray-500 text-sm font-bold">08:00 صباحاً - 10:00 مساءً</p>
                                        </div>
                                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                            <Star className="mx-auto mb-3 text-cyan-600" size={24} />
                                            <h4 className="font-black text-gray-900 mb-1">المرافق</h4>
                                            <p className="text-gray-500 text-sm font-bold">مسبح دافئ، ساونا، جاكوزي</p>
                                        </div>
                                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                            <Ticket className="mx-auto mb-3 text-cyan-600" size={24} />
                                            <h4 className="font-black text-gray-900 mb-1">السعر</h4>
                                            <p className="text-gray-500 text-sm font-bold">2000 د.ج للشخص</p>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => {
                                            setTicketDetails({ eventName: 'تذكرة مسبح / سبا', price: 2000, date: new Date().toISOString().split('T')[0], time: '10:00', quantity: 1 });
                                            setShowTicketModal(true);
                                        }}
                                        className="px-16 py-6 bg-cyan-600 text-white rounded-[2rem] font-black text-2xl shadow-2xl hover:bg-cyan-700 hover:scale-105 active:scale-95 transition-all relative z-10"
                                    >
                                        حجز تذكرة دخول الآن
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* EXTERNAL VISITOR PORTAL */}
                        {activeSection === 'external_visitor' && (
                            <div className="space-y-8">
                                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 text-center">
                                    <h3 className="text-3xl font-black text-gray-900 mb-4">مرحباً بك في فندقنا</h3>
                                    <p className="text-gray-500 font-bold mb-8">نسعد بزيارتك، استكشف خدماتنا المتاحة للزوار</p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                                        {[
                                            { id: 'scan', label: 'مسح QR', icon: Scan, color: 'bg-[#cca43b]/10 text-[#cca43b]', action: () => setShowScanner(true) },
                                            { id: 'restaurant', label: 'المطعم', icon: Utensils, color: 'bg-orange-50 text-orange-600', action: () => { setActiveSection('visitor'); setActiveCategory('dining'); } },
                                            { id: 'cafe', label: 'المقهى', icon: Coffee, color: 'bg-amber-50 text-amber-600', action: () => { setActiveSection('visitor'); setActiveCategory('dining'); } },
                                            { id: 'pool', label: 'المسبح', icon: Waves, color: 'bg-cyan-50 text-cyan-600', action: () => { setActiveSection('pool_public'); } },
                                            { id: 'former_guest', label: 'حجز نزيل سابق', icon: Star, color: 'bg-yellow-50 text-yellow-600', action: () => setShowFormerGuestModal(true) },
                                            { id: 'parking', label: 'موقف السيارات', icon: Car, color: 'bg-emerald-50 text-emerald-600', action: () => setShowParkingModal(true) },
                                            { id: 'report', label: 'إبلاغ / ملاحظات', icon: Bell, color: 'bg-red-50 text-red-600', action: () => setShowReportModal(true) },
                                        ].map(item => (
                                            <button 
                                                key={item.id}
                                                onClick={item.action}
                                                className="p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:scale-105 transition-all flex flex-col items-center gap-3 group"
                                            >
                                                <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center group-hover:rotate-12 transition-transform`}>
                                                    <item.icon size={28} />
                                                </div>
                                                <span className="font-black text-sm text-gray-800 text-center">{item.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-[#cca43b] p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10"><Building2 size={120} /></div>
                                    <div className="relative z-10">
                                        <h4 className="text-3xl font-black mb-4">هل ترغب في الإقامة معنا؟</h4>
                                        <p className="text-white/80 font-bold mb-8 max-w-xl">استمتع بتجربة إقامة لا تنسى في قلب الجزائر مع أرقى الخدمات الفندقية.</p>
                                        <button onClick={() => onNavigate('events_map')} className="px-8 py-4 bg-white text-[#cca43b] rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all">
                                            خريطة الحجوزات والتذاكر
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MY ACTIVITY SECTION */}
                        {activeSection === 'my_activity' && (
                            <div className="space-y-10">
                                <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-100 relative overflow-hidden">
                                    <div className={`absolute inset-0 opacity-5 ${th.pattern} pointer-events-none`}></div>
                                    <div className="relative z-10 text-center">
                                        <div className="w-20 h-20 bg-[#cca43b]/10 text-[#cca43b] rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl">
                                            <Clock size={40} />
                                        </div>
                                        <h2 className="text-4xl font-black text-gray-900 mb-2">نشاطاتي الأخيرة</h2>
                                        <p className="text-gray-500 font-bold text-lg">تتبع طلباتك وحجوزاتك التي قمت بها خلال هذه الجلسة</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* ORDERS */}
                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-black text-gray-800 px-6">طلبات الطعام والخدمات</h3>
                                        <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
                                            {restaurantOrders.filter(o => myOrderIds.includes(o.id)).length > 0 ? (
                                                <div className="divide-y divide-gray-50">
                                                    {restaurantOrders.filter(o => myOrderIds.includes(o.id)).map((order, idx) => (
                                                        <div key={idx} className="p-8 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                                            <div className="flex items-center gap-6">
                                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                                                                    order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                                                    order.status === 'preparing' ? 'bg-amber-50 text-amber-600' :
                                                                    'bg-blue-50 text-blue-600'
                                                                }`}>
                                                                    <Utensils size={28} />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-3 mb-1">
                                                                        <span className="font-black text-xl text-gray-900">طلب #{order.id.slice(-4)}</span>
                                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                                            order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                                            order.status === 'preparing' ? 'bg-amber-100 text-amber-700' :
                                                                            'bg-blue-100 text-blue-700'
                                                                        }`}>
                                                                            {order.status === 'completed' ? 'مكتمل' : 
                                                                             order.status === 'preparing' ? 'قيد التحضير' : 'قيد الانتظار'}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-gray-500 font-bold">{order.items.length} أصناف • {order.totalAmount} د.ج</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-16 text-center text-gray-400 font-bold">
                                                    <p>لا توجد طلبات سابقة</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* BOOKINGS */}
                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-black text-gray-800 px-6">حجوزات المرافق</h3>
                                        <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
                                            {bookings.filter(b => myBookingIds.includes(b.id)).length > 0 ? (
                                                <div className="divide-y divide-gray-50">
                                                    {bookings.filter(b => myBookingIds.includes(b.id)).map((bkg, idx) => (
                                                        <div key={idx} className="p-8 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                                            <div className="flex items-center gap-6">
                                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                                                                    bkg.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' :
                                                                    bkg.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                                                    'bg-blue-50 text-blue-600'
                                                                }`}>
                                                                    <Calendar size={28} />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-3 mb-1">
                                                                        <span className="font-black text-xl text-gray-900">حجز #{bkg.id.slice(-4)}</span>
                                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                                            bkg.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                                                            bkg.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                                            'bg-blue-100 text-blue-700'
                                                                        }`}>
                                                                            {bkg.status === 'confirmed' ? 'مؤكد' : 
                                                                             bkg.status === 'pending' ? 'قيد المراجعة' : bkg.status}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-gray-500 font-bold">{bkg.primaryGuestName}</p>
                                                                    <p className="text-xs text-gray-400">{bkg.checkInDate.split('T')[0]}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-16 text-center text-gray-400 font-bold">
                                                    <p>لا توجد حجوزات سابقة</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* RESIDENT DASHBOARD */}
                        {activeSection === 'resident_dashboard' && residentData && (
                            <div className="space-y-10">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-100 relative overflow-hidden">
                                    <div className={`absolute inset-0 opacity-5 ${th.pattern} pointer-events-none`}></div>
                                    <div className="flex items-center gap-8 relative z-10">
                                        <div className="w-24 h-24 bg-[#cca43b] text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl rotate-3">
                                            <User size={48} />
                                        </div>
                                        <div className="text-right">
                                            <h2 className="text-4xl font-black text-gray-900 mb-1">مرحباً، {residentData.primaryGuestName}</h2>
                                            <p className="text-gray-500 font-bold text-xl">جناح رقم <span className="text-[#006269]">{residentData.roomId}</span> • إقامة سعيدة</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 relative z-10">
                                        <button 
                                            onClick={() => setShowMaintenanceForm(true)}
                                            className="px-8 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-sm hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                        >
                                            <ShieldCheck size={18} /> طلب صيانة
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setResidentData(null);
                                                setActiveSection('resident');
                                            }}
                                            className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all flex items-center gap-2"
                                        >
                                            <LogOut size={18} /> خروج
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Stats / Staff-like integration */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {[
                                        { label: 'رصيد النقاط', value: '1,250', icon: Star, color: 'text-amber-600 bg-amber-50' },
                                        { label: 'الطلبات النشطة', value: restaurantOrders.filter(o => o.targetNumber === residentData.roomId.toString() && o.status !== 'completed').length, icon: Clock, color: 'text-blue-600 bg-blue-50' },
                                        { label: 'رسائل الإدارة', value: '2', icon: Bell, color: 'text-purple-600 bg-purple-50' },
                                        { label: 'مستوى العضوية', value: 'ذهبي', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50' },
                                    ].map((stat, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                                            <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center mb-3`}>
                                                <stat.icon size={24} />
                                            </div>
                                            <span className="text-2xl font-black text-gray-900">{stat.value}</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{stat.label}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                    <div className="md:col-span-2 space-y-10">
                                        {/* Empowerment Section: Feedback & Suggestions */}
                                        <div className="bg-gradient-to-r from-[#006269] to-[#004d53] p-10 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl">
                                                        <Sparkles size={32} className="text-[#cca43b]" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-3xl font-black">أنت جزء من عائلتنا</h3>
                                                        <p className="opacity-80 font-bold">رأيك يساهم في تطوير خدماتنا باستمرار</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <button 
                                                        onClick={() => setShowChatModal(true)}
                                                        className="p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl hover:bg-white/20 transition-all text-right group"
                                                    >
                                                        <MessageSquare className="mb-4 text-[#cca43b] group-hover:scale-110 transition-transform" />
                                                        <h4 className="font-black text-xl mb-1">تقديم اقتراح</h4>
                                                        <p className="text-xs opacity-70">شاركنا أفكارك لتحسين تجربتك</p>
                                                    </button>
                                                    <button 
                                                        onClick={() => setActiveSection('visitor')}
                                                        className="p-6 bg-white text-[#006269] rounded-3xl hover:bg-gray-100 transition-all text-right group"
                                                    >
                                                        <Star className="mb-4 text-[#cca43b] group-hover:scale-110 transition-transform" />
                                                        <h4 className="font-black text-xl mb-1">تقييم الخدمات</h4>
                                                        <p className="text-xs text-gray-400">قيم المرافق التي استخدمتها اليوم</p>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center px-6">
                                            <h3 className="text-3xl font-black text-gray-800">خدمات الغرف المتاحة</h3>
                                            <div className="h-1 flex-1 mx-6 bg-gray-100 rounded-full"></div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                            {allServices.filter(s => s.category !== 'external').map((s, i) => {
                                                const Icon = IconMap[s.iconName] || Star;
                                                return (
                                                <motion.div 
                                                    key={i}
                                                    whileHover={{ scale: 1.02, y: -5 }}
                                                    onClick={() => handleServiceClick(s)}
                                                    className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-gray-100 cursor-pointer group hover:border-[#006269]/30 transition-all"
                                                >
                                                    <div className={`w-16 h-16 rounded-2xl ${s.color.split(' ')[0]} flex items-center justify-center mb-8 shadow-inner group-hover:rotate-12 transition-transform`}>
                                                        <Icon size={32} className={s.color.split(' ')[1]} />
                                                    </div>
                                                    <h4 className="font-black text-2xl text-gray-800 mb-3">{s.title}</h4>
                                                    <p className="text-gray-500 text-base font-medium mb-6 line-clamp-2">{s.description}</p>
                                                    <div className="text-[#006269] font-black text-base flex items-center gap-3">
                                                        <span>اطلب الآن</span> <ChevronRight size={20} />
                                                    </div>
                                                </motion.div>
                                                );
                                            })}
                                        </div>

                                        {/* MY ORDERS SECTION */}
                                        <div className="mt-16 space-y-8">
                                            <div className="flex justify-between items-center px-6">
                                                <h3 className="text-3xl font-black text-gray-800">طلباتي الحالية</h3>
                                                <div className="h-1 flex-1 mx-6 bg-gray-100 rounded-full"></div>
                                            </div>
                                            
                                            <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
                                                {restaurantOrders.filter(o => o.targetNumber === residentData.roomId.toString()).length > 0 ? (
                                                    <div className="divide-y divide-gray-50">
                                                        {restaurantOrders.filter(o => o.targetNumber === residentData.roomId.toString()).map((order, idx) => (
                                                            <div key={idx} className="p-8 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                                                <div className="flex items-center gap-6">
                                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                                                                        order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                                                        order.status === 'preparing' ? 'bg-amber-50 text-amber-600' :
                                                                        'bg-blue-50 text-blue-600'
                                                                    }`}>
                                                                        <Clock size={28} />
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-3 mb-1">
                                                                            <span className="font-black text-xl text-gray-900">طلب #{order.id.slice(-4)}</span>
                                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                                                order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                                                order.status === 'preparing' ? 'bg-amber-100 text-amber-700' :
                                                                                'bg-blue-100 text-blue-700'
                                                                            }`}>
                                                                                {order.status === 'completed' ? 'مكتمل' : 
                                                                                 order.status === 'preparing' ? 'قيد التحضير' : 'قيد الانتظار'}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-gray-500 font-bold">{order.items.length} أصناف • {order.totalAmount} د.ج</p>
                                                                    </div>
                                                                </div>
                                                                <button className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:bg-gray-200 transition-all">
                                                                    <ChevronRight size={20} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-20 text-center">
                                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                                            <Utensils size={40} />
                                                        </div>
                                                        <p className="text-gray-400 font-bold text-lg">لا توجد طلبات نشطة حالياً</p>
                                                        <button 
                                                            onClick={() => {
                                                                setActiveSection('visitor');
                                                                setActiveCategory('dining');
                                                            }}
                                                            className="mt-6 text-[#cca43b] font-black hover:underline"
                                                        >
                                                            اطلب وجبتك الأولى الآن
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        <h3 className="text-3xl font-black text-gray-800 mr-6">معلومات الحجز</h3>
                                        <div className="bg-[#006269] text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden border-8 border-[#cca43b]/10">
                                            <div className={`absolute inset-0 opacity-15 ${th.pattern} pointer-events-none`}></div>
                                            <div className="relative z-10 space-y-10">
                                                <div className="flex justify-between items-center border-b-2 border-white/10 pb-6">
                                                    <span className="opacity-70 font-bold text-lg">تاريخ الوصول</span>
                                                    <span className="font-black text-xl">{residentData.checkIn}</span>
                                                </div>
                                                <div className="flex justify-between items-center border-b-2 border-white/10 pb-6">
                                                    <span className="opacity-70 font-bold text-lg">تاريخ المغادرة</span>
                                                    <span className="font-black text-xl">{residentData.checkOut}</span>
                                                </div>
                                                <div className="flex justify-between items-center border-b-2 border-white/10 pb-6">
                                                    <span className="opacity-70 font-bold text-lg">نوع الغرفة</span>
                                                    <span className="font-black text-xl">{residentData.roomType}</span>
                                                </div>
                                                <div className="pt-6 text-center">
                                                    <div className="inline-block p-6 bg-white rounded-[2.5rem] shadow-2xl">
                                                        <QrCode size={140} className="text-[#006269]" />
                                                    </div>
                                                    <p className="mt-6 text-xs font-black opacity-70 uppercase tracking-widest">مفتاح الغرفة الرقمي</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                {/* HOME SECTION */}
                {activeSection === 'home' && (
                    <div className="space-y-16">
                        {propActivePage && (
                            <div className="bg-white p-8 rounded-[2rem] shadow-xl mb-8 flex items-center justify-between relative overflow-hidden">
                                <div className={`absolute inset-0 opacity-5 ${th.pattern} pointer-events-none`}></div>
                                <div className="relative z-10">
                                    <h2 className="text-3xl font-black text-[#006269] mb-2">مرحباً بك في {settings.appName}</h2>
                                    <p className="text-gray-500 font-medium">استمتع بإقامة فاخرة وخدمات مميزة تليق بك</p>
                                </div>
                                <div className="w-16 h-16 bg-[#cca43b]/10 rounded-2xl flex items-center justify-center text-[#cca43b] shadow-inner relative z-10">
                                    <Sparkles size={32} />
                                </div>
                            </div>
                        )}
                        {/* Welcome Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Resident Card */}
                            <motion.button 
                                whileHover={{ y: -10 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveSection('current_guest')}
                                className="group bg-white rounded-[3.5rem] p-12 shadow-2xl border-2 border-transparent hover:border-[#006269] transition-all duration-500 text-right relative overflow-hidden flex flex-col h-full"
                            >
                                <div className={`absolute top-0 left-0 w-40 h-40 ${th.primary} opacity-5 rounded-br-[8rem]`}></div>
                                <div className={`w-24 h-24 rounded-[2.5rem] ${th.primary} flex items-center justify-center mb-8 text-white shadow-2xl group-hover:rotate-6 transition-transform`}>
                                    <User size={48} />
                                </div>
                                <h3 className={`text-4xl font-black mb-4 ${th.primaryText}`}>أنا نزيل حالي</h3>
                                <p className="text-gray-500 font-medium leading-relaxed text-lg mb-8">
                                    الوصول السريع لخدمات الغرف، الإبلاغ عن المشاكل، طلب الصيانة، وحجز مواقف السيارات الخاصة بالنزلاء.
                                </p>
                                <div className="mt-auto flex items-center gap-3 text-[#cca43b] font-black text-xl group-hover:gap-5 transition-all">
                                    <span>دخول بوابة النزلاء</span> <ArrowLeft size={28}/>
                                </div>
                            </motion.button>

                            {/* Visitor Card */}
                            <motion.button 
                                whileHover={{ y: -10 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveSection('external_visitor')}
                                className="group bg-white rounded-[3.5rem] p-12 shadow-2xl border-2 border-transparent hover:border-[#cca43b] transition-all duration-500 text-right relative overflow-hidden flex flex-col h-full"
                            >
                                <div className={`absolute top-0 left-0 w-40 h-40 ${th.accentBg} opacity-5 rounded-br-[8rem]`}></div>
                                <div className={`w-24 h-24 rounded-[2.5rem] ${th.accentBg} flex items-center justify-center mb-8 text-white shadow-2xl group-hover:-rotate-6 transition-transform`}>
                                    <Globe size={48} />
                                </div>
                                <h3 className={`text-4xl font-black mb-4 ${th.primaryText}`}>أنا زائر خارجي</h3>
                                <p className="text-gray-500 font-medium leading-relaxed text-lg mb-8">
                                    استكشف المطاعم، احجز موقف سيارة، اطلب خدمات التوصيل، أو تواصل مع الإدارة لتقديم ملاحظاتك.
                                </p>
                                <div className="mt-auto flex items-center gap-3 text-[#cca43b] font-black text-xl group-hover:gap-5 transition-all">
                                    <span>دخول بوابة الزوار</span> <ArrowLeft size={28}/>
                                </div>
                            </motion.button>
                        </div>

                        {/* TODAY'S HIGHLIGHTS / EVENTS */}
                        {hotelEvents.length > 0 && (
                        <div className="bg-[#006269] rounded-[4rem] p-16 shadow-2xl text-white relative overflow-hidden group border-8 border-[#cca43b]/10">
                            <div className={`absolute inset-0 opacity-15 ${th.pattern} group-hover:scale-110 transition-transform duration-1000`}></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                                <div className="text-right">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6 text-[#cca43b] font-bold text-sm">
                                        <Calendar size={16} />
                                        <span>فعاليات اليوم</span>
                                    </div>
                                    <h3 className="text-4xl font-black mb-4">{hotelEvents[0].title}</h3>
                                    <p className="text-emerald-100 text-xl font-medium opacity-90 leading-relaxed">{hotelEvents[0].description}</p>
                                </div>
                                <button 
                                    onClick={() => setShowBookingSelector(true)}
                                    className="bg-[#cca43b] text-white px-12 py-6 rounded-2xl font-black text-2xl shadow-2xl hover:bg-white hover:text-[#cca43b] transition-all active:scale-95 whitespace-nowrap"
                                >
                                    احجز مكانك
                                </button>
                            </div>
                        </div>
                        )}
                    </div>
                )}

                {/* RESIDENT SECTION */}
                {activeSection === 'resident' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                        <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-[#cca43b]/20">
                            <div className="flex justify-between items-center mb-10">
                                <h2 className={`text-3xl font-black flex items-center gap-4 ${th.primaryText}`}>
                                    <div className="w-12 h-12 rounded-2xl bg-[#cca43b]/10 flex items-center justify-center text-[#cca43b]">
                                        <Key size={28} />
                                    </div>
                                    خدمات النزلاء الرقمية
                                </h2>
                                <div className="hidden md:flex items-center gap-2 text-gray-400 font-bold text-sm">
                                    <Clock size={16} /> متاح 24 ساعة
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[
                                    { label: 'تتبع الحجز', icon: Search, action: () => setActiveSection('verify'), color: 'text-blue-600 bg-blue-50' },
                                    { label: 'خدمة الغرف', icon: Coffee, color: 'text-amber-600 bg-amber-50', action: () => {
                                        setActiveSection('visitor');
                                        setActiveCategory('dining');
                                        window.scrollTo({ top: 800, behavior: 'smooth' });
                                    }},
                                    { label: 'الإنترنت المجاني', icon: Wifi, color: 'text-emerald-600 bg-emerald-50', action: () => {
                                        addNotification('شبكة الواي فاي: Authentic_Guest_Free | كلمة السر: Welcome2024', 'info');
                                    }},
                                    { label: 'طلب صيانة', icon: ShieldCheck, color: 'text-red-600 bg-red-50', action: () => setShowMaintenanceForm(true) },
                                    { label: 'المغادرة السريعة', icon: LogIn, color: 'text-purple-600 bg-purple-50', action: () => {
                                        if (residentData) {
                                            addNotification('سيتم معالجة طلب المغادرة السريعة، يرجى التوجه للاستقبال لتسليم المفتاح.', 'warning');
                                        } else {
                                            addNotification('هذه الخدمة متاحة للنزلاء المسجلين فقط.', 'error');
                                        }
                                    }},
                                    { label: 'دليل الفندق', icon: Info, color: 'text-cyan-600 bg-cyan-50', action: () => {
                                        setActiveSection('facilities');
                                        window.scrollTo({ top: 800, behavior: 'smooth' });
                                    }},
                                    { label: 'قائمة الطعام', icon: Menu, color: 'text-orange-600 bg-orange-50', action: () => {
                                        setActiveSection('visitor');
                                        setActiveCategory('dining');
                                        window.scrollTo({ top: 800, behavior: 'smooth' });
                                    }},
                                    { label: 'اتصل بنا', icon: Phone, color: 'text-gray-600 bg-gray-50', action: () => setShowContactCenter(true) }
                                ].map((item, idx) => (
                                    <motion.button 
                                        key={idx}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={item.action}
                                        className="p-6 rounded-[2rem] bg-gray-50 hover:bg-white border border-transparent hover:border-[#cca43b]/30 shadow-sm hover:shadow-xl transition-all text-center group"
                                    >
                                        <div className={`w-16 h-16 mx-auto rounded-2xl shadow-inner flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform ${item.color}`}>
                                            <item.icon size={28}/>
                                        </div>
                                        <span className="font-black text-gray-700 text-sm block">{item.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Quick Verification Widget */}
                        <div className="bg-[#006269] rounded-[3rem] p-10 shadow-2xl text-white relative overflow-hidden group">
                            <div className={`absolute inset-0 opacity-10 ${th.pattern} group-hover:scale-110 transition-transform duration-1000`}></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="text-center md:text-right">
                                    <h3 className="text-3xl font-black mb-3 text-[#cca43b]">هل وصلت للتو؟</h3>
                                    <p className="text-emerald-100 text-lg font-medium opacity-80">قم بتسجيل وصولك السريع وتفعيل مفتاح غرفتك الرقمي الآن.</p>
                                </div>
                                <button onClick={() => setActiveSection('verify')} className="bg-white text-[#006269] px-10 py-5 rounded-2xl font-black text-xl shadow-2xl hover:bg-[#cca43b] hover:text-white transition-all active:scale-95 whitespace-nowrap">
                                    ابدأ تسجيل الوصول
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                        {/* EXTERNAL SERVICES SECTION */}
                        {activeSection === 'external_services' && (
                            <div className="space-y-12">
                                <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-100 relative overflow-hidden">
                                    <div className={`absolute inset-0 opacity-5 ${th.pattern} pointer-events-none`}></div>
                                    <div className="relative z-10 text-right">
                                        <h2 className="text-4xl font-black text-gray-900 mb-4">الخدمات الخارجية</h2>
                                        <p className="text-gray-500 font-bold text-xl max-w-2xl mr-0 ml-auto">اطلب طعامك المفضل أو احجز خدمات النقل والتنظيف مباشرة من هنا. نحن نضمن لك الجودة والسرعة.</p>
                                    </div>
                                </div>
                                <GuestExternalServices />
                            </div>
                        )}

                        {/* VISITOR SECTION */}
                        {activeSection === 'visitor' && (
                            <div className="space-y-12">
                                <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-100 relative overflow-hidden">
                                    <div className={`absolute inset-0 opacity-5 ${th.pattern} pointer-events-none`}></div>
                                    <div className="relative z-10 text-right">
                                        <h2 className="text-4xl font-black text-gray-900 mb-4">المطاعم والكافيهات</h2>
                                        <p className="text-gray-500 font-bold text-xl max-w-2xl mr-0 ml-auto">استمتع بتجربة طعام فريدة في مطاعمنا الفاخرة ومقاهينا التقليدية التي تجمع بين الأصالة والحداثة.</p>
                                    </div>

                                    {/* Category Filters */}
                                    <div className="flex flex-wrap gap-4 mt-10 relative z-10">
                                        {[
                                            { id: 'dining', label: 'المطاعم والكافيهات', icon: Utensils },
                                            { id: 'all', label: 'كافة الخدمات', icon: Globe },
                                        ].map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setActiveCategory(cat.id as any)}
                                                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-lg transition-all ${
                                                    activeCategory === cat.id 
                                                    ? 'bg-[#006269] text-white shadow-xl scale-105' 
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                            >
                                                <cat.icon size={24} />
                                                <span>{cat.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                    {filteredServices.map((s, i) => {
                                        const Icon = IconMap[s.iconName] || Star;
                                        return (
                                        <motion.div 
                                            key={i} 
                                            whileHover={{ y: -15 }}
                                            onClick={() => handleServiceClick(s)} 
                                            className="bg-white rounded-[3.5rem] shadow-xl border border-gray-100 overflow-hidden cursor-pointer group hover:border-[#cca43b]/30 transition-all flex flex-col h-full"
                                        >
                                            <div className={`h-64 relative overflow-hidden flex items-center justify-center ${s.color?.split(' ')[0] || 'bg-gray-100'}`}>
                                                <div className={`absolute inset-0 opacity-10 ${th.pattern}`}></div>
                                                <div className={`w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500 relative z-10`}>
                                                    <Icon size={40} className={s.color?.split(' ')[1] || 'text-gray-600'} />
                                                </div>
                                                <div className="absolute top-6 left-6 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-xs text-gray-800 font-black uppercase tracking-widest border border-white/30">
                                                    {s.category === 'external' ? 'خارجي' : 'داخلي'}
                                                </div>
                                            </div>
                                            <div className="p-8 text-right flex flex-col flex-1">
                                                <h3 className="font-black text-2xl mb-3 text-gray-800">{s.title}</h3>
                                                <p className="text-gray-500 text-lg leading-relaxed font-medium mb-8 line-clamp-2">{s.description}</p>
                                                <div className="mt-auto flex items-center justify-between text-[#cca43b] font-black text-lg group-hover:gap-5 transition-all">
                                                    <span className="flex items-center gap-2">استكشف التفاصيل <ChevronRight size={24} /></span>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setBookingDetails(prev => ({ ...prev, serviceName: s.title }));
                                                            setShowBookingModal(true);
                                                        }}
                                                        className="bg-[#006269] text-white p-3 rounded-xl hover:bg-[#004d53] transition-colors shadow-lg active:scale-95"
                                                    >
                                                        <Calendar size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Booking Center CTA */}
                                <div className="bg-[#006269] rounded-[4rem] p-16 shadow-2xl text-white relative overflow-hidden group border-8 border-[#cca43b]/10">
                                    <div className={`absolute inset-0 opacity-15 ${th.pattern} group-hover:scale-110 transition-transform duration-1000`}></div>
                                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                                        <div className="text-right">
                                            <h3 className="text-4xl font-black mb-4">مركز الحجز والتوجيه</h3>
                                            <p className="text-emerald-100 text-xl font-medium opacity-90 leading-relaxed">هل تحتاج لمساعدة في اختيار الخدمة المناسبة؟ فريقنا جاهز لمرافقتك وتقديم النصح.</p>
                                        </div>
                                        <button 
                                            onClick={() => setShowContactCenter(true)}
                                            className="bg-[#cca43b] text-white px-12 py-6 rounded-2xl font-black text-2xl shadow-2xl hover:bg-white hover:text-[#cca43b] transition-all active:scale-95 whitespace-nowrap flex items-center gap-4"
                                        >
                                            <Phone size={32} /> اتصل بنا الآن
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MY ACTIVITY SECTION */}

                        {/* VERIFICATION / CHECK-IN */}
                        {activeSection === 'verify' && (
                            <div className="bg-white rounded-[4rem] p-16 shadow-2xl border border-gray-100 max-w-2xl mx-auto relative overflow-hidden">
                                <div className={`absolute inset-0 opacity-5 ${th.pattern} pointer-events-none`}></div>
                                <div className="relative z-10 text-center mb-12">
                                    <div className="w-24 h-24 bg-[#006269]/10 text-[#006269] rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                                        <ShieldCheck size={48} />
                                    </div>
                                    <h2 className="text-4xl font-black text-gray-900 mb-4">التحقق من الحجز</h2>
                                    <p className="text-gray-500 font-bold text-xl">أدخل بياناتك للوصول إلى خدماتك الخاصة وتفعيل مفتاح غرفتك الرقمي.</p>
                                </div>
                                
                                {!verificationResult ? (
                                    <div className="relative z-10 w-full space-y-10">
                                        <button 
                                            onClick={startCamera} 
                                            className="w-full py-6 bg-[#006269] text-white rounded-2xl font-black flex items-center justify-center gap-4 shadow-2xl hover:brightness-110 transition-all active:scale-95 text-xl"
                                        >
                                            <QrCode size={32}/> مسح رمز الاستجابة السريعة (QR)
                                        </button>

                                        {showCamera && (
                                            <div className="relative aspect-square bg-black rounded-[3rem] overflow-hidden border-8 border-[#cca43b]/20 shadow-inner">
                                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                                                <button onClick={() => setShowCamera(false)} className="absolute top-8 right-8 bg-white/20 backdrop-blur-md text-white p-4 rounded-full hover:bg-white/40 transition-colors"><X size={24}/></button>
                                                <div className="absolute inset-0 border-4 border-[#cca43b] m-16 rounded-3xl pointer-events-none animate-pulse"></div>
                                                <div className="absolute top-1/2 left-0 w-full h-1 bg-[#cca43b] shadow-[0_0_20px_#cca43b] animate-scan"></div>
                                            </div>
                                        )}

                                        <div className="relative flex items-center">
                                            <div className="flex-grow border-t-2 border-gray-100"></div>
                                            <span className="flex-shrink-0 mx-8 text-gray-400 text-sm font-black uppercase tracking-widest">أو أدخل الرمز يدوياً</span>
                                            <div className="flex-grow border-t-2 border-gray-100"></div>
                                        </div>

                                        <form onSubmit={handleVerify} className="space-y-6">
                                            <input 
                                                type="text" 
                                                placeholder="رقم الحجز (مثال: REF-1234)" 
                                                className="w-full p-8 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#cca43b] focus:bg-white outline-none font-black text-center text-3xl transition-all shadow-inner"
                                                value={bookingRef}
                                                onChange={e => setBookingRef(e.target.value)}
                                            />
                                            <button 
                                                type="submit" 
                                                className="w-full py-6 bg-[#cca43b] text-white rounded-2xl font-black text-2xl shadow-2xl hover:brightness-110 transition-all active:scale-95"
                                            >
                                                تأكيد الهوية
                                            </button>
                                        </form>
                                        <div className="text-center mt-6">
                                            <button 
                                                onClick={() => setShowRegistrationModal(true)}
                                                className="text-[#006269] font-bold hover:underline"
                                            >
                                                ليس لديك حجز؟ استفسر الآن
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center space-y-10">
                                        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                            <Check size={48} />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-gray-900 mb-2">تم التحقق بنجاح!</h3>
                                            <p className="text-gray-500 font-bold text-xl">أهلاً بك في فندق الجزائر، {verificationResult.primaryGuestName}</p>
                                        </div>
                                        
                                        <div className="bg-gray-50 p-8 rounded-3xl border-2 border-emerald-100 text-right space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500 font-bold">رقم الغرفة</span>
                                                <span className="text-[#006269] font-black text-2xl">{verificationResult.roomId}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500 font-bold">تاريخ المغادرة</span>
                                                <span className="text-gray-900 font-black text-xl">{verificationResult.checkOut}</span>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => {
                                                setResidentData(verificationResult);
                                                setActiveSection('resident_dashboard');
                                            }}
                                            className="w-full py-6 bg-[#006269] text-white rounded-2xl font-black text-2xl shadow-2xl hover:brightness-110 transition-all active:scale-95"
                                        >
                                            دخول لوحة التحكم
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {/* BOOKINGS SECTION */}
                        {activeSection === 'bookings' && (
                            <div className="space-y-10">
                                <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-100 relative overflow-hidden">
                                    <div className={`absolute inset-0 opacity-5 ${th.pattern} pointer-events-none`}></div>
                                    <div className="relative z-10 text-right">
                                        <h2 className="text-4xl font-black text-gray-900 mb-4">حجوزاتي ونظام الحجز الذكي</h2>
                                        <p className="text-gray-500 font-bold text-xl max-w-2xl mr-0 ml-auto">أدر حجوزاتك الحالية أو قم بحجز خدمات جديدة بلمسة واحدة.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="md:col-span-2 space-y-6">
                                        <h3 className="text-2xl font-black text-gray-800 text-right mb-4">قائمة الحجوزات النشطة</h3>
                                        {residentData ? (
                                            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-emerald-100 relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                                                <div className="flex justify-between items-center">
                                                    <div className="text-left">
                                                        <span className="px-4 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-black uppercase">نشط الآن</span>
                                                        <p className="text-gray-400 text-xs font-bold mt-2">رقم المرجع: {residentData.id}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <h4 className="text-2xl font-black text-gray-900">حجز غرفة: {residentData.roomId}</h4>
                                                        <p className="text-gray-500 font-bold">تاريخ المغادرة: {residentData.checkOut}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-8 flex gap-4">
                                                    <button onClick={() => setShowScanner(true)} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-black hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                                                        <QrCode size={20} /> عرض الرمز
                                                    </button>
                                                    <button onClick={() => setShowRoomChangeModal(true)} className="flex-1 py-4 bg-[#006269] text-white rounded-2xl font-black hover:brightness-110 transition-all flex items-center justify-center gap-2">
                                                        <RefreshCw size={20} /> طلب تغيير
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 p-12 rounded-[3rem] border-2 border-dashed border-gray-200 text-center">
                                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                                    <Ticket size={40} />
                                                </div>
                                                <p className="text-gray-400 font-bold text-lg">لا توجد حجوزات نشطة حالياً</p>
                                                <button onClick={() => setShowBookingSelector(true)} className="mt-6 text-[#cca43b] font-black hover:underline">ابدأ حجزك الأول الآن</button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-black text-gray-800 text-right mb-4">حجز سريع</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            {[
                                                { label: 'حجز غرفة / جناح', icon: House, color: 'bg-blue-50 text-blue-600', action: () => setShowRegistrationModal(true) },
                                                { label: 'تذكرة مسبح / سبا', icon: Waves, color: 'bg-cyan-50 text-cyan-600', action: () => { setTicketDetails({ ...ticketDetails, eventName: 'تذكرة مسبح', price: 2000 }); setShowTicketModal(true); } },
                                                { label: 'طاولة مطعم / مقهى', icon: Utensils, color: 'bg-orange-50 text-orange-600', action: () => { setTicketDetails({ ...ticketDetails, eventName: 'حجز طاولة', price: 0 }); setShowTicketModal(true); } },
                                                { label: 'تذكرة حفلة / فعالية', icon: Music, color: 'bg-purple-50 text-purple-600', action: () => { setTicketDetails({ ...ticketDetails, eventName: 'تذكرة حفلة', price: 5000 }); setShowTicketModal(true); } },
                                                { label: 'قاعة متعددة الخدمات', icon: Building2, color: 'bg-emerald-50 text-emerald-600', action: () => { setTicketDetails({ ...ticketDetails, eventName: 'حجز قاعة (مؤتمر/زفاف)', price: 50000 }); setShowTicketModal(true); } },
                                            ].map((btn, i) => (
                                                <button 
                                                    key={i}
                                                    onClick={btn.action}
                                                    className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#cca43b]/30 transition-all flex items-center gap-4 group text-right"
                                                >
                                                    <div className={`w-14 h-14 rounded-2xl ${btn.color} flex items-center justify-center group-hover:rotate-12 transition-transform`}>
                                                        <btn.icon size={28} />
                                                    </div>
                                                    <span className="font-black text-gray-800">{btn.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeSection === 'events' && (
                            <div className="space-y-10">
                                <div className="text-center mb-12">
                                    <h2 className="text-4xl font-black text-gray-900 mb-4">الفعاليات والأنشطة</h2>
                                    <p className="text-gray-500 font-bold text-xl">اكتشف ما يحدث اليوم في فندقنا</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {hotelEvents.map((event, idx) => (
                                        <motion.div 
                                            key={idx}
                                            whileHover={{ y: -5 }}
                                            className="bg-white rounded-[3rem] overflow-hidden shadow-xl border border-gray-100 group"
                                        >
                                            <div className="h-64 relative bg-[#006269]/5 flex items-center justify-center overflow-hidden">
                                                <div className={`absolute inset-0 opacity-10 ${th.pattern}`}></div>
                                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500 relative z-10">
                                                    <Calendar size={40} className="text-[#cca43b]" />
                                                </div>
                                                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[#006269] font-black text-sm shadow-lg border border-[#006269]/10">
                                                    {event.date} • {event.startTime}
                                                </div>
                                            </div>
                                            <div className="p-8 text-right">
                                                <h3 className="text-2xl font-black text-gray-900 mb-3">{event.title}</h3>
                                                <p className="text-gray-500 font-medium mb-6">{event.description}</p>
                                                <button className="w-full py-4 bg-[#006269]/10 text-[#006269] rounded-2xl font-black hover:bg-[#006269] hover:text-white transition-all">
                                                    تفاصيل أكثر
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ABOUT SECTION (New for App Mode) */}
                        {activeSection === 'about' && (
                            <div className="space-y-12">
                                <div className="bg-white rounded-[4rem] p-12 shadow-2xl border border-gray-100 relative overflow-hidden text-center">
                                    <div className={`absolute inset-0 opacity-5 ${th.pattern} pointer-events-none`}></div>
                                    <div className="w-24 h-24 bg-[#cca43b]/10 text-[#cca43b] rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl rotate-3">
                                        <Building2 size={48} />
                                    </div>
                                    <h2 className="text-4xl font-black text-gray-900 mb-6">عن {settings.appName}</h2>
                                    <p className="text-gray-500 text-xl font-medium leading-relaxed max-w-3xl mx-auto mb-10">
                                        يعد فندقنا أيقونة معمارية تجمع بين التراث الجزائري الأصيل ورفاهية الضيافة العالمية. 
                                        نحن نلتزم بتقديم تجربة استثنائية لكل ضيف، مع الاهتمام بأدق التفاصيل لضمان راحتكم وسعادتكم.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-6 bg-gray-50 rounded-[2rem]">
                                            <h4 className="font-black text-2xl text-[#006269] mb-2">+50</h4>
                                            <p className="text-gray-400 font-bold text-sm">عاماً من الخبرة</p>
                                        </div>
                                        <div className="p-6 bg-gray-50 rounded-[2rem]">
                                            <h4 className="font-black text-2xl text-[#006269] mb-2">5 نجوم</h4>
                                            <p className="text-gray-400 font-bold text-sm">تصنيف عالمي</p>
                                        </div>
                                        <div className="p-6 bg-gray-50 rounded-[2rem]">
                                            <h4 className="font-black text-2xl text-[#006269] mb-2">+100</h4>
                                            <p className="text-gray-400 font-bold text-sm">جائزة تميز</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* FACILITIES SECTION */}
                        {activeSection === 'facilities' && (
                            <div className="space-y-8">
                                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                                        <div className="text-right">
                                            <h3 className="text-3xl font-black text-gray-900 mb-2">مرافق الفندق</h3>
                                            <p className="text-gray-500 font-bold">استكشف جميع المرافق المتاحة والخدمات المقدمة</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => setActiveSection('hotel_map')}
                                                className="flex items-center gap-2 px-6 py-3 bg-[#cca43b] text-white rounded-2xl font-black hover:scale-105 transition-all"
                                            >
                                                <Map size={20} />
                                                <span>خريطة الفندق</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {servicePoints.map(point => (
                                            <div key={point.id} className="group bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 hover:shadow-2xl transition-all relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                                                    <Building2 size={80} />
                                                </div>
                                                <div className="relative z-10">
                                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-md text-[#006269]">
                                                        {point.type === 'restaurant' ? <Utensils size={32} /> : 
                                                         point.type === 'pool' ? <Waves size={32} /> : 
                                                         point.type === 'cafe' ? <Coffee size={32} /> : <Building2 size={32} />}
                                                    </div>
                                                    <h4 className="text-xl font-black text-gray-900 mb-2">{point.name}</h4>
                                                    <p className="text-gray-500 text-sm font-bold mb-6 line-clamp-2">{point.description}</p>
                                                    
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                                                            <User size={16} />
                                                            <span>السعة: {point.capacity}</span>
                                                        </div>
                                                        <button 
                                                            onClick={() => {
                                                                if (point.type === 'restaurant') setActiveSection('restaurant_public');
                                                                else if (point.type === 'pool') setActiveSection('pool_public');
                                                                else if (point.type === 'cafe') setActiveSection('cafe_public');
                                                            }}
                                                            className="text-[#006269] font-black text-sm flex items-center gap-1 hover:gap-2 transition-all"
                                                        >
                                                            <span>عرض التفاصيل</span>
                                                            <ChevronRight size={16} className="rotate-180" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* HOTEL MAP SECTION */}
                        {activeSection === 'hotel_map' && (
                            <div className="space-y-8">
                                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
                                    <div className="flex justify-between items-center mb-10">
                                        <div className="text-right">
                                            <h3 className="text-3xl font-black text-gray-900 mb-2">خريطة الفندق التفاعلية</h3>
                                            <p className="text-gray-500 font-bold">تصفح مرافق الفندق ومواقع الخدمات</p>
                                        </div>
                                        <button 
                                            onClick={() => setActiveSection('facilities')}
                                            className="p-3 bg-gray-100 rounded-2xl text-gray-600 hover:bg-gray-200 transition-all"
                                        >
                                            <ArrowLeft size={24} className="rotate-180" />
                                        </button>
                                    </div>

                                    <div className="aspect-video bg-gray-100 rounded-[3rem] border-4 border-gray-50 overflow-hidden relative group">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center p-10">
                                                <MapPin size={64} className="mx-auto text-[#cca43b] mb-4 animate-bounce" />
                                                <h4 className="text-2xl font-black text-gray-900 mb-2">خريطة الفندق قيد التحميل</h4>
                                                <p className="text-gray-500 font-bold">جاري تجهيز العرض التفاعلي للمرافق...</p>
                                            </div>
                                        </div>
                                        
                                        {/* Mock Map Elements */}
                                        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#006269]/20 rounded-2xl border-2 border-[#006269] flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-[#006269]/30 transition-all">
                                            <span className="font-black text-[#006269]">المسبح</span>
                                        </div>
                                        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-orange-600/20 rounded-2xl border-2 border-orange-600 flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-orange-600/30 transition-all">
                                            <span className="font-black text-orange-600">المطعم الرئيسي</span>
                                        </div>
                                        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-amber-600/20 rounded-2xl border-2 border-amber-600 flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-amber-600/30 transition-all">
                                            <span className="font-black text-amber-600">المقهى</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CONTACT SECTION (New for App Mode) */}
                        {activeSection === 'contact' && (
                            <div className="space-y-8">
                                <div className="text-center mb-8">
                                    <h2 className="text-4xl font-black text-gray-900 mb-4">تواصل معنا</h2>
                                    <p className="text-gray-500 font-bold text-xl">نحن هنا للإجابة على جميع استفساراتكم</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {contactOptions.map((opt, idx) => (
                                        <motion.a 
                                            key={idx}
                                            href={opt.action.startsWith('tel') || opt.action.startsWith('mailto') || opt.action.startsWith('http') ? opt.action : '#'}
                                            target={opt.action.startsWith('http') ? '_blank' : undefined}
                                            onClick={(e) => {
                                                if (opt.action === 'chat') {
                                                    e.preventDefault();
                                                    setShowChatModal(true);
                                                }
                                            }}
                                            whileHover={{ scale: 1.02 }}
                                            className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 flex items-center gap-6 group cursor-pointer"
                                        >
                                            <div className={`w-20 h-20 rounded-[2rem] ${opt.color} flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform`}>
                                                <opt.icon size={32} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-xl text-gray-900 mb-2">{opt.title}</h4>
                                                <p className="text-gray-500 text-sm font-medium">{opt.desc}</p>
                                            </div>
                                        </motion.a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* LOCATION SECTION (New for App Mode) */}
                        {activeSection === 'location' && (
                            <div className="space-y-8">
                                <div className="bg-white rounded-[4rem] p-4 shadow-2xl border border-gray-100 overflow-hidden h-[60vh] relative group">
                                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                                        <div className="text-center opacity-50">
                                            <MapPin size={64} className="mx-auto mb-4 text-gray-400" />
                                            <p className="font-black text-xl text-gray-500">خريطة الموقع</p>
                                            <p className="text-sm font-bold text-gray-400 mt-2">الجزائر العاصمة، الجزائر</p>
                                        </div>
                                    </div>
                                    {/* Placeholder for Map - In a real app, integrate Google Maps here */}
                                    <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md p-6 rounded-[2.5rem] shadow-lg border border-white/50 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-black text-lg text-gray-900">فندق {settings.appName}</h4>
                                            <p className="text-gray-500 text-sm font-bold">شارع الاستقلال، الجزائر العاصمة</p>
                                        </div>
                                        <button className="bg-[#006269] text-white p-4 rounded-2xl hover:bg-[#004d53] transition-colors shadow-lg">
                                            <MapPin size={24} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </main>

            {/* --- FOOTER --- */}
            {!propActivePage && (
            <footer className="bg-[#00383d] text-white py-16 text-center relative z-10 mt-auto overflow-hidden">
                <div className={`absolute inset-0 opacity-5 ${th.pattern}`}></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-12 text-right">
                        <div className="max-w-xs">
                            <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                                <Building2 size={32} className="text-[#cca43b]" />
                                <h2 className="text-2xl font-black">{settings.appName}</h2>
                            </div>
                            <p className="text-emerald-100/60 font-medium leading-relaxed">فندق يجمع بين عراقة الماضي وحداثة المستقبل في قلب عاصمتنا الجميلة.</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
                            <div>
                                <h4 className="font-black text-[#cca43b] mb-4">روابط سريعة</h4>
                                <ul className="space-y-2 text-emerald-100/70 font-bold text-sm">
                                    <li><button onClick={() => setActiveSection('home')}>الرئيسية</button></li>
                                    <li><button onClick={() => setActiveSection('visitor')}>الخدمات</button></li>
                                    <li><button onClick={() => setActiveSection('facilities')}>المرافق</button></li>
                                    <li><button onClick={() => setActiveSection('resident')}>النزلاء</button></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-black text-[#cca43b] mb-4">تواصل معنا</h4>
                                <ul className="space-y-2 text-emerald-100/70 font-bold text-sm">
                                    <li className="flex items-center gap-2 justify-center md:justify-start"><Phone size={14}/> {settings.phone}</li>
                                    <li className="flex items-center gap-2 justify-center md:justify-start"><Mail size={14}/> {settings.email}</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-white/10 w-full mb-8"></div>
                    
                    <p className="opacity-40 text-xs font-bold tracking-widest uppercase mb-8">© {new Date().getFullYear()} {settings.appName}. ALL RIGHTS RESERVED.</p>
                    
                    <div className="flex justify-center gap-8 opacity-20">
                        <Building2 size={24}/>
                        <Wifi size={24}/>
                        <Coffee size={24}/>
                        <Utensils size={24}/>
                        <Car size={24}/>
                    </div>
                </div>
            </footer>
            )}

            {/* SECRET PIN MODAL */}
            <AnimatePresence>
                {showSecretLogin && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] p-10 max-w-md md:max-w-2xl w-full shadow-2xl relative overflow-hidden text-center"
                        >
                            <button onClick={() => setShowSecretLogin(false)} className="absolute top-6 left-6 text-gray-400 hover:text-red-500 transition-colors"><X size={24}/></button>
                            
                            <div className="mb-8">
                                <div className="w-20 h-20 bg-gray-900 text-[#cca43b] rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3">
                                    <Lock size={40} />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 mb-2">نظام الإدارة</h3>
                                <p className="text-gray-500 font-medium">يرجى إدخال رمز الوصول الإداري</p>
                            </div>

                            <form onSubmit={handleSecretLogin}>
                                <div className="flex justify-center gap-2 mb-8" dir="ltr">
                                    <input 
                                        type="password" 
                                        autoFocus
                                        maxLength={4}
                                        placeholder="••••" 
                                        className="w-full p-6 rounded-2xl bg-gray-100 border-2 border-transparent focus:border-gray-900 outline-none font-mono text-center text-5xl tracking-[0.5em] shadow-inner"
                                        value={secretPin}
                                        onChange={e => setSecretPin(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xl hover:bg-black transition-all shadow-2xl active:scale-95">
                                    دخول النظام الآمن
                                </button>
                            </form>
                            
                            <div className="mt-8 flex items-center justify-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                <ShieldCheck size={14} />
                                <span>نظام مشفر ومحمي</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FLOATING GUIDANCE BUTTON */}
            {!propActivePage && (
            <motion.button 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowContactCenter(true)}
                className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-16 h-16 bg-[#cca43b] text-white rounded-full shadow-2xl z-50 flex items-center justify-center group border-4 border-white"
            >
                <div className="absolute -top-12 right-0 bg-white text-[#006269] px-4 py-2 rounded-xl text-xs font-black shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-100">
                    هل تحتاج مساعدة؟
                </div>
                <Phone size={28} />
            </motion.button>
            )}

            {/* CONTACT CENTER MODAL */}
            <AnimatePresence>
                {showContactCenter && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 100 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 100 }}
                            className="bg-white rounded-[3.5rem] p-10 max-w-xl md:max-w-3xl w-full shadow-2xl relative overflow-hidden border-8 border-[#006269]/10"
                        >
                            <div className={`absolute inset-0 opacity-5 ${th.pattern} pointer-events-none`}></div>
                            <button onClick={() => setShowContactCenter(false)} className="absolute top-8 left-8 bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition-colors z-10"><X size={24}/></button>
                            
                            <div className="relative z-10">
                                <div className="text-center mb-10">
                                    <div className="w-24 h-24 bg-[#cca43b]/10 text-[#cca43b] rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl">
                                        <Phone size={48} />
                                    </div>
                                    <h3 className="text-4xl font-black text-gray-900 mb-3">مركز الحجز والتوجيه</h3>
                                    <p className="text-gray-500 text-lg font-medium leading-relaxed">نحن هنا لمرافقتكم في كل خطوة لضمان إقامة مثالية.</p>
                                </div>

                                <div className="space-y-4">
                                    {contactOptions.map((opt, idx) => (
                                        <motion.a 
                                            key={idx}
                                            href={opt.action.startsWith('tel') || opt.action.startsWith('mailto') || opt.action.startsWith('http') ? opt.action : '#'}
                                            target={opt.action.startsWith('http') ? '_blank' : undefined}
                                            onClick={(e) => {
                                                if (opt.action === 'chat') {
                                                    e.preventDefault();
                                                    setShowChatModal(true);
                                                }
                                            }}
                                            whileHover={{ x: -10, scale: 1.02 }}
                                            className="flex items-center gap-6 p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 hover:border-[#cca43b]/30 hover:bg-white transition-all group shadow-sm hover:shadow-xl"
                                        >
                                            <div className={`w-16 h-16 rounded-2xl ${opt.color} flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform`}>
                                                <opt.icon size={32} />
                                            </div>
                                            <div className="text-right">
                                                <h4 className="font-black text-xl text-gray-800 mb-1">{opt.title}</h4>
                                                <p className="text-gray-500 text-sm font-medium">{opt.desc}</p>
                                            </div>
                                            <div className="mr-auto text-gray-300 group-hover:text-[#cca43b] transition-colors">
                                                <ChevronRight size={24} />
                                            </div>
                                        </motion.a>
                                    ))}
                                </div>

                                <div className="mt-10 p-6 bg-[#006269] rounded-[2.5rem] text-white text-center shadow-xl">
                                    <p className="font-bold text-sm mb-2 opacity-80">ساعات العمل الرسمية</p>
                                    <p className="font-black text-xl">متاحون لخدمتكم 24/7</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SERVICE DETAILS MODAL */}
            <AnimatePresence>
                {selectedService && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="bg-white md:rounded-[3.5rem] p-6 md:p-10 max-w-4xl md:max-w-[90vw] w-full h-full md:h-[90vh] shadow-2xl relative overflow-hidden border-0 md:border-8 border-[#cca43b]/10 flex flex-col"
                        >
                            <div className={`absolute inset-0 opacity-5 ${th.pattern} pointer-events-none`}></div>
                            
                            {/* Navigation Belt / Header */}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 relative z-10 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setSelectedService(null)} 
                                        className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl hover:bg-gray-200 transition-all text-gray-600 font-black text-sm shadow-sm"
                                    >
                                        <ChevronRight size={18} className="rotate-180" /> رجوع
                                    </button>
                                    <div className="h-8 w-px bg-gray-200"></div>
                                    <div className="flex flex-col text-right">
                                        <h3 className="text-xl font-black text-gray-900">{selectedService.title}</h3>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">نافذة الخدمات والمنتجات</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <button className="p-2.5 bg-white rounded-xl text-gray-400 hover:text-[#cca43b] transition-colors shadow-sm"><Info size={20}/></button>
                                    <button className="p-2.5 bg-white rounded-xl text-gray-400 hover:text-[#cca43b] transition-colors shadow-sm"><Heart size={20}/></button>
                                    <button onClick={() => setSelectedService(null)} className="bg-white p-2.5 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm text-gray-400"><X size={20}/></button>
                                </div>
                            </div>
                            
                            <div className="relative z-10 flex-1 overflow-y-auto px-2 custom-scrollbar">
                                <div className="bg-white rounded-[2.5rem] p-2 md:p-8 mb-8">
                                    {renderServiceContent(selectedService)}
                                </div>
                                
                                <div className="flex items-center justify-center gap-2 text-[#cca43b] font-bold text-sm pb-8">
                                    <Sparkles size={16} />
                                    <span>نتمنى لكم تجربة ممتعة في مرافقنا</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* BOOKING MODAL */}
            <AnimatePresence>
                {showBookingModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md p-0 md:p-4"
                    >
                        <motion.div 
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white rounded-t-[3rem] md:rounded-[3rem] p-8 md:p-10 max-w-lg md:max-w-3xl w-full shadow-2xl relative overflow-hidden h-[85vh] md:h-auto overflow-y-auto"
                        >
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full mx-auto mb-8 md:hidden"></div>
                            
                            {/* Header with Back Button */}
                            <div className="flex justify-between items-center mb-8 relative z-10">
                                <button 
                                    onClick={() => setShowBookingModal(false)} 
                                    className="flex items-center gap-2 bg-gray-100 px-5 py-2.5 rounded-2xl hover:bg-gray-200 transition-all text-gray-600 font-black text-sm"
                                >
                                    <ChevronRight size={18} className="rotate-180" /> رجوع
                                </button>
                                <div className="h-1 flex-1 mx-4 bg-gray-100 rounded-full"></div>
                                <button onClick={() => setShowBookingModal(false)} className="bg-gray-100 p-2.5 rounded-xl hover:bg-gray-200 transition-colors"><X size={20}/></button>
                            </div>
                            
                            <div className="text-center mb-8">
                                <h3 className="text-3xl font-black text-gray-900 mb-2">حجز خدمة</h3>
                                <p className="text-gray-500 font-bold">يرجى ملء التفاصيل لتأكيد طلبك</p>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                
                                if (selectedService?.category === 'external') {
                                    // Create an external order linked to delivery
                                    const extOrderId = `ext-${Date.now()}`;
                                    addExternalOrder({
                                        type: 'food_delivery', // Default for external
                                        customerName: residentData?.primaryGuestName || 'Guest Request',
                                        phone: residentData?.phone || 'N/A',
                                        address: residentData ? `Room ${residentData.roomId}` : 'Lobby/Reception',
                                        notes: `Service: ${bookingDetails.serviceName}. Notes: ${bookingDetails.notes}`,
                                        items: [{ name: bookingDetails.serviceName || 'External Service', quantity: 1, price: 0 }],
                                        totalAmount: 0
                                    });
                                    setMyOrderIds(prev => [...prev, extOrderId]);
                                    addNotification(`تم إرسال طلب الخدمة الخارجية (${bookingDetails.serviceName}) لمركز التوصيل`, 'success');
                                } else {
                                    // Create a pending booking for internal services
                                    const newBkg = addBooking({
                                        primaryGuestName: residentData?.primaryGuestName || `Guest Request (${bookingDetails.serviceName})`,
                                        checkInDate: `${bookingDetails.date}T${bookingDetails.time}`,
                                        checkOutDate: `${bookingDetails.date}T${bookingDetails.time}`, 
                                        status: 'pending',
                                        guests: [],
                                        totalAmount: 0, 
                                        notes: `Service: ${bookingDetails.serviceName}. Type: ${bookingDetails.reservationType}. Guests: ${bookingDetails.guests}. Notes: ${bookingDetails.notes}`,
                                        mealPlan: 'room_only',
                                        extraServices: [],
                                        roomId: 0, // Unassigned
                                        guestLocation: 'out_of_hotel'
                                    }, []);
                                    setMyBookingIds(prev => [...prev, newBkg.id]);
                                    addNotification(`تم استلام طلب الحجز لـ ${bookingDetails.serviceName || 'خدمة'} بنجاح! رقم الحجز: ${newBkg.id.slice(-4)}`, 'success');
                                }

                                setShowBookingModal(false);
                                setBookingDetails({ date: '', time: '', guests: 1, notes: '', serviceName: '', reservationType: 'general' });
                                setSelectedService(null);
                            }} className="space-y-6">
                                {bookingDetails.serviceName && (
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-center">
                                        <span className="text-gray-500 text-sm font-bold block mb-1">الخدمة المختارة</span>
                                        <span className="text-[#006269] font-black text-xl">{bookingDetails.serviceName}</span>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 mr-2">نوع الحجز</label>
                                    <select 
                                        className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-[#006269] outline-none font-bold appearance-none"
                                        value={bookingDetails.reservationType}
                                        onChange={e => setBookingDetails({...bookingDetails, reservationType: e.target.value})}
                                    >
                                        <option value="general">حجز عام</option>
                                        <option value="table">حجز طاولة</option>
                                        <option value="ticket">تذكرة دخول</option>
                                        <option value="seat">حجز مقعد</option>
                                        <option value="sunbed">سرير تشمس (للمسبح)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 mr-2">التاريخ</label>
                                    <div className="relative">
                                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input 
                                            type="date" 
                                            required
                                            className="w-full p-4 pr-12 bg-gray-50 rounded-2xl border border-gray-200 focus:border-[#006269] outline-none font-bold"
                                            value={bookingDetails.date}
                                            onChange={e => setBookingDetails({...bookingDetails, date: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 mr-2">الوقت</label>
                                        <div className="relative">
                                            <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            <input 
                                                type="time" 
                                                required
                                                className="w-full p-4 pr-12 bg-gray-50 rounded-2xl border border-gray-200 focus:border-[#006269] outline-none font-bold"
                                                value={bookingDetails.time}
                                                onChange={e => setBookingDetails({...bookingDetails, time: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 mr-2">عدد الأشخاص</label>
                                        <div className="relative">
                                            <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            <input 
                                                type="number" 
                                                min="1"
                                                required
                                                className="w-full p-4 pr-12 bg-gray-50 rounded-2xl border border-gray-200 focus:border-[#006269] outline-none font-bold"
                                                value={bookingDetails.guests}
                                                onChange={e => setBookingDetails({...bookingDetails, guests: parseInt(e.target.value)})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 mr-2">ملاحظات خاصة</label>
                                    <textarea 
                                        rows={3}
                                        className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-[#006269] outline-none font-medium resize-none"
                                        placeholder="هل لديك أي طلبات خاصة؟"
                                        value={bookingDetails.notes}
                                        onChange={e => setBookingDetails({...bookingDetails, notes: e.target.value})}
                                    ></textarea>
                                </div>

                                <button type="submit" className="w-full py-5 bg-[#006269] text-white rounded-2xl font-black text-xl shadow-xl hover:brightness-110 active:scale-95 transition-all mt-4">
                                    تأكيد الحجز
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CHAT MODAL */}
            <AnimatePresence>
                {showChatModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[130] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md p-0 md:p-4"
                    >
                        <motion.div 
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="bg-white rounded-t-[3rem] md:rounded-[3rem] max-w-lg md:max-w-3xl w-full shadow-2xl relative overflow-hidden h-[90vh] md:h-[80vh] flex flex-col"
                        >
                            {/* Chat Header */}
                            <div className="p-6 bg-[#006269] text-white flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                        <MessageSquare size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg">المحادثة المباشرة</h3>
                                        <div className="flex items-center gap-2 text-xs font-bold opacity-80">
                                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                            متاح الآن
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setShowChatModal(false)} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-colors"><X size={20}/></button>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                                {chatHistory.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
                                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-bold leading-relaxed ${
                                            msg.sender === 'user' 
                                            ? 'bg-[#006269] text-white rounded-tr-none' 
                                            : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-tl-none'
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 bg-white border-t border-gray-100 shrink-0 pb-safe">
                                <form 
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (!chatMessage.trim()) return;
                                        setChatHistory([...chatHistory, { sender: 'user', text: chatMessage }]);
                                        setChatMessage('');
                                        setTimeout(() => {
                                            setChatHistory(prev => [...prev, { sender: 'system', text: 'شكراً لتواصلك معنا. سيقوم أحد موظفينا بالرد عليك في أقرب وقت.' }]);
                                        }, 1000);
                                    }}
                                    className="flex gap-3"
                                >
                                    <input 
                                        type="text" 
                                        placeholder="اكتب رسالتك هنا..." 
                                        className="flex-1 p-4 bg-gray-100 rounded-2xl border-none focus:ring-2 focus:ring-[#006269]/20 outline-none font-medium"
                                        value={chatMessage}
                                        onChange={e => setChatMessage(e.target.value)}
                                    />
                                    <button type="submit" className="p-4 bg-[#cca43b] text-white rounded-2xl hover:bg-[#b89334] transition-colors shadow-lg active:scale-95">
                                        <Send size={24} className="rotate-180" />
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* BILLING MODAL (PRE-INVOICE) */}
            <AnimatePresence>
                {showBillingModal && billingData && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="bg-white rounded-[3rem] p-10 max-w-md md:max-w-2xl w-full shadow-2xl relative overflow-hidden border-8 border-[#cca43b]/10"
                        >
                            <div className={`absolute inset-0 opacity-5 ${th.pattern} pointer-events-none`}></div>
                            
                            <div className="relative z-10 text-right">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                                        <CreditCard size={32} />
                                    </div>
                                    <div className="text-right">
                                        <h3 className="text-2xl font-black text-gray-900">الفاتورة الأولية</h3>
                                        <p className="text-gray-400 font-bold text-xs">رقم الطلب: {billingData.id.slice(-8)}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                    {billingData.items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <span className="font-black text-gray-800">{item.item.name} x{item.quantity}</span>
                                            <span className="font-bold text-gray-500">{item.item.price * item.quantity} د.ج</span>
                                        </div>
                                    ))}
                                    <div className="h-px bg-gray-200 my-4"></div>
                                    <div className="flex justify-between items-center text-lg font-black text-[#006269]">
                                        <span>المجموع الكلي</span>
                                        <span className="text-[#cca43b]">{billingData.totalAmount} د.ج</span>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="flex items-center justify-between text-xs font-black">
                                            <span className="text-gray-400">طريقة الدفع:</span>
                                            <span className={residentData ? 'text-emerald-600' : 'text-blue-600'}>
                                                {residentData ? `إضافة لغرفة ${residentData.roomId}` : 'دفع مباشر عند الاستلام'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 mb-8 flex items-start gap-3">
                                    <Info size={20} className="text-amber-600 shrink-0 mt-1" />
                                    <p className="text-xs text-amber-700 font-bold leading-relaxed">
                                        {residentData 
                                            ? 'بالمصادقة على هذه الفاتورة، سيتم إرسال الطلب للتنفيذ وإضافته لحساب غرفتكم تلقائياً.' 
                                            : 'بالمصادقة على هذه الفاتورة، سيتم إرسال الطلب للتنفيذ. يرجى تجهيز المبلغ للدفع عند الاستلام.'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => setShowBillingModal(false)}
                                        className="py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all"
                                    >
                                        تعديل الطلب
                                    </button>
                                    <button 
                                        onClick={confirmOrderFromBilling}
                                        className="py-4 bg-[#006269] text-white rounded-2xl font-black shadow-lg hover:bg-[#004d53] transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={20} /> مصادقة
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MESSAGING / CHAT MODAL */}
            <AnimatePresence>
                {showChatModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="bg-white rounded-[3rem] p-10 max-w-lg md:max-w-3xl w-full shadow-2xl relative overflow-hidden border-8 border-[#cca43b]/10 flex flex-col h-[80vh]"
                        >
                            <div className={`absolute inset-0 opacity-5 ${th.pattern} pointer-events-none`}></div>
                            
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-center mb-8">
                                    <button onClick={() => setShowChatModal(false)} className="bg-gray-100 p-2.5 rounded-xl hover:bg-gray-200 transition-colors"><X size={20}/></button>
                                    <div className="text-right">
                                        <h3 className="text-2xl font-black text-gray-900">مراسلة الإدارة</h3>
                                        <p className="text-gray-400 font-bold text-xs">نحن هنا للاستماع إليكم وتلبية طلباتكم</p>
                                    </div>
                                </div>

                                {/* Category Selector */}
                                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                                    {[
                                        { id: 'feedback', label: 'ملاحظة', icon: Smile },
                                        { id: 'complaint', label: 'شكوى', icon: ShieldCheck },
                                        { id: 'request', label: 'طلب تغيير', icon: Activity },
                                        { id: 'other', label: 'أخرى', icon: MessageSquare },
                                    ].map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setMessageCategory(cat.id as any)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs whitespace-nowrap transition-all ${
                                                messageCategory === cat.id 
                                                ? 'bg-[#006269] text-white shadow-md' 
                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                            }`}
                                        >
                                            <cat.icon size={14} />
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex-1 overflow-y-auto mb-6 space-y-4 pr-2 custom-scrollbar">
                                    {chatHistory.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
                                            <div className={`max-w-[80%] p-4 rounded-2xl font-bold text-sm ${
                                                msg.sender === 'user' 
                                                ? 'bg-[#006269] text-white rounded-br-none' 
                                                : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                            }`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="relative">
                                    <textarea 
                                        value={chatMessage}
                                        onChange={(e) => setChatMessage(e.target.value)}
                                        placeholder="اكتب رسالتك هنا..."
                                        className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-3xl focus:border-[#cca43b] outline-none font-bold text-right resize-none h-32"
                                    />
                                    <button 
                                        onClick={() => {
                                            if (!chatMessage.trim()) return;
                                            setChatHistory(prev => [...prev, { sender: 'user', text: `[${messageCategory.toUpperCase()}] ${chatMessage}` }]);
                                            setChatMessage('');
                                            setTimeout(() => {
                                                setChatHistory(prev => [...prev, { sender: 'system', text: 'شكراً لتواصلكم معنا. تم استلام رسالتكم وسيقوم فريق الإدارة بمراجعتها والرد عليكم في أقرب وقت ممكن.' }]);
                                            }, 1000);
                                        }}
                                        className="absolute bottom-4 left-4 p-3 bg-[#cca43b] text-white rounded-xl shadow-lg hover:scale-110 transition-all active:scale-95"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showRegistrationModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md p-0 md:p-4"
                    >
                        <motion.div 
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white rounded-t-[3rem] md:rounded-[3rem] p-8 md:p-10 max-w-lg md:max-w-3xl w-full shadow-2xl relative overflow-hidden h-[85vh] md:h-auto overflow-y-auto"
                        >
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full mx-auto mb-8 md:hidden"></div>
                            <button onClick={() => setShowRegistrationModal(false)} className="absolute top-8 left-8 bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition-colors hidden md:block"><X size={24}/></button>
                            
                            <div className="text-center mb-8">
                                <h3 className="text-3xl font-black text-gray-900 mb-2">حجز غرفة / جناح</h3>
                                <p className="text-gray-500 font-bold">يرجى إدخال بياناتك الكاملة لتأكيد طلب الحجز</p>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                addNotification('تم إرسال طلب حجز الغرفة بنجاح! سيتصل بك فريق الاستقبال لتأكيد التفاصيل.', 'success');
                                setShowRegistrationModal(false);
                                setRegistrationDetails({ name: '', phone: '', email: '', arrival: '', notes: '' });
                            }} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 mr-2">الاسم الكامل</label>
                                        <input 
                                            type="text" 
                                            required
                                            placeholder="الاسم كما في جواز السفر"
                                            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-[#cca43b] outline-none font-bold"
                                            value={registrationDetails.name}
                                            onChange={e => setRegistrationDetails({...registrationDetails, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 mr-2">رقم الهاتف الدولي</label>
                                        <input 
                                            type="tel" 
                                            required
                                            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-[#cca43b] outline-none font-bold text-left"
                                            dir="ltr"
                                            placeholder="+213 ..."
                                            value={registrationDetails.phone}
                                            onChange={e => setRegistrationDetails({...registrationDetails, phone: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 mr-2">تاريخ الوصول</label>
                                        <input 
                                            type="date" 
                                            required
                                            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-[#cca43b] outline-none font-bold"
                                            value={registrationDetails.arrival}
                                            onChange={e => setRegistrationDetails({...registrationDetails, arrival: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 mr-2">عدد الليالي</label>
                                        <input 
                                            type="number" 
                                            min="1"
                                            required
                                            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-[#cca43b] outline-none font-bold"
                                            placeholder="1"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 mr-2">عدد الضيوف</label>
                                        <input 
                                            type="number" 
                                            min="1"
                                            required
                                            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-[#cca43b] outline-none font-bold"
                                            placeholder="2"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 mr-2">نوع الغرفة المفضل</label>
                                    <select className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-[#cca43b] outline-none font-bold">
                                        <option>جناح ملكي (Royal Suite)</option>
                                        <option>غرفة مزدوجة فاخرة (Deluxe Double)</option>
                                        <option>غرفة مفردة (Single Room)</option>
                                        <option>جناح عائلي (Family Suite)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 mr-2">البريد الإلكتروني</label>
                                    <input 
                                        type="email" 
                                        required
                                        className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-[#cca43b] outline-none font-bold text-left"
                                        dir="ltr"
                                        placeholder="example@mail.com"
                                        value={registrationDetails.email}
                                        onChange={e => setRegistrationDetails({...registrationDetails, email: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 mr-2">ملاحظات خاصة</label>
                                    <textarea 
                                        rows={3}
                                        className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-[#cca43b] outline-none font-medium resize-none"
                                        placeholder="أي طلبات إضافية أو تفاصيل تود مشاركتها..."
                                        value={registrationDetails.notes}
                                        onChange={e => setRegistrationDetails({...registrationDetails, notes: e.target.value})}
                                    ></textarea>
                                </div>

                                <button type="submit" className="w-full py-6 bg-[#006269] text-white rounded-3xl font-black text-2xl shadow-xl hover:bg-[#cca43b] active:scale-95 transition-all mt-4">
                                    تأكيد طلب الحجز
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* REPORTING MODAL */}
            <AnimatePresence>
                {showReportModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="bg-white rounded-[3rem] p-10 max-w-lg md:max-w-3xl w-full shadow-2xl relative overflow-hidden border-8 border-red-500/10"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <button onClick={() => setShowReportModal(false)} className="bg-gray-100 p-2.5 rounded-xl hover:bg-gray-200 transition-colors"><X size={20}/></button>
                                <div className="text-right">
                                    <h3 className="text-2xl font-black text-gray-900">مركز البلاغات</h3>
                                    <p className="text-gray-400 font-bold text-xs">أبلغ عن أي مشكلة أو حادثة فوراً</p>
                                </div>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                addNotification('تم استلام بلاغك بنجاح. فريق الأمن والسلامة في طريقه للمراجعة.', 'success');
                                setShowReportModal(false);
                            }} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 mr-2">نوع البلاغ</label>
                                    <select 
                                        className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-red-500 outline-none font-bold"
                                        value={reportDetails.type}
                                        onChange={e => setReportDetails({...reportDetails, type: e.target.value})}
                                    >
                                        <option value="incident">حادثة / مشكلة أمنية</option>
                                        <option value="lost">مفقودات</option>
                                        <option value="cleanliness">ملاحظة نظافة</option>
                                        <option value="other">أخرى</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 mr-2">الموقع</label>
                                    <input 
                                        type="text" 
                                        placeholder="مثال: اللوبي، المسبح، الغرفة 302..."
                                        required
                                        className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-red-500 outline-none font-bold"
                                        value={reportDetails.location}
                                        onChange={e => setReportDetails({...reportDetails, location: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 mr-2">التفاصيل</label>
                                    <textarea 
                                        rows={4}
                                        required
                                        className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-red-500 outline-none font-medium resize-none"
                                        placeholder="يرجى شرح المشكلة بوضوح..."
                                        value={reportDetails.description}
                                        onChange={e => setReportDetails({...reportDetails, description: e.target.value})}
                                    ></textarea>
                                </div>

                                <button type="submit" className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                                    <AlertTriangle size={24} /> إرسال البلاغ العاجل
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MAINTENANCE MODAL */}
            <AnimatePresence>
                {showMaintenanceModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="bg-white rounded-[3rem] p-10 max-w-lg md:max-w-3xl w-full shadow-2xl relative overflow-hidden border-8 border-blue-500/10"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <button onClick={() => setShowMaintenanceModal(false)} className="bg-gray-100 p-2.5 rounded-xl hover:bg-gray-200 transition-colors"><X size={20}/></button>
                                <div className="text-right">
                                    <h3 className="text-2xl font-black text-gray-900">طلب صيانة</h3>
                                    <p className="text-gray-400 font-bold text-xs">أخبرنا بما يحتاج إلى إصلاح</p>
                                </div>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                addNotification('تم تسجيل طلب الصيانة. سيقوم فريقنا الفني بالمعاينة قريباً.', 'success');
                                setShowMaintenanceModal(false);
                            }} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 mr-2">رقم الغرفة / المكان</label>
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-blue-500 outline-none font-bold"
                                            placeholder="مثال: 405"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 mr-2">الأولوية</label>
                                        <select className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-blue-500 outline-none font-bold">
                                            <option value="normal">عادية</option>
                                            <option value="high">عاجلة</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 mr-2">وصف العطل</label>
                                    <textarea 
                                        rows={4}
                                        required
                                        className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-blue-500 outline-none font-medium resize-none"
                                        placeholder="مثال: تكييف الغرفة لا يعمل، مشكلة في الإضاءة..."
                                    ></textarea>
                                </div>

                                <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                                    <Settings2 size={24} /> تأكيد طلب الصيانة
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PARKING MODAL */}
            <AnimatePresence>
                {showParkingModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="bg-white rounded-[3rem] p-10 max-w-lg md:max-w-3xl w-full shadow-2xl relative overflow-hidden border-8 border-emerald-500/10"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <button onClick={() => setShowParkingModal(false)} className="bg-gray-100 p-2.5 rounded-xl hover:bg-gray-200 transition-colors"><X size={20}/></button>
                                <div className="text-right">
                                    <h3 className="text-2xl font-black text-gray-900">نظام مواقف السيارات</h3>
                                    <p className="text-gray-400 font-bold text-xs">احجز مكانك أو اطلب سيارتك</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <button className="p-6 bg-emerald-50 text-emerald-700 rounded-3xl border-2 border-emerald-200 flex flex-col items-center gap-2 font-black">
                                    <Car size={32} />
                                    <span>حجز موقف</span>
                                </button>
                                <button className="p-6 bg-gray-50 text-gray-500 rounded-3xl border-2 border-gray-100 flex flex-col items-center gap-2 font-black hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all">
                                    <Key size={32} />
                                    <span>طلب السيارة (Valet)</span>
                                </button>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                addNotification('تم حجز موقف السيارة بنجاح. رقم الموقف المخصص: B-12', 'success');
                                setShowParkingModal(false);
                            }} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 mr-2">رقم لوحة السيارة</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-emerald-500 outline-none font-bold text-center text-2xl tracking-widest"
                                        placeholder="00000 111 16"
                                        value={parkingDetails.plateNumber}
                                        onChange={e => setParkingDetails({...parkingDetails, plateNumber: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 mr-2">المدة المتوقعة (ساعة)</label>
                                        <input 
                                            type="number" 
                                            min="1"
                                            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-emerald-500 outline-none font-bold"
                                            value={parkingDetails.duration}
                                            onChange={e => setParkingDetails({...parkingDetails, duration: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 mr-2">المنطقة المفضلة</label>
                                        <select 
                                            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-emerald-500 outline-none font-bold"
                                            value={parkingDetails.zone}
                                            onChange={e => setParkingDetails({...parkingDetails, zone: e.target.value})}
                                        >
                                            <option value="A">المنطقة A (قريب من المدخل)</option>
                                            <option value="B">المنطقة B (مواقف مغطاة)</option>
                                            <option value="C">المنطقة C (مواقف خارجية)</option>
                                        </select>
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                                    <CheckCircle size={24} /> تأكيد الحجز
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Styles for Animations and Theme */}
            {/* TICKET MODAL */}
            <AnimatePresence>
                {showFeedbackModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="bg-white rounded-[3rem] p-8 md:p-10 max-w-md md:max-w-2xl w-full shadow-2xl relative overflow-hidden border-8 border-[#cca43b]/10"
                        >
                            <div className={`absolute inset-0 opacity-5 ${th.pattern} pointer-events-none`}></div>
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-6">
                                    <button onClick={() => setShowFeedbackModal(false)} className="bg-gray-100 p-2 rounded-xl hover:bg-gray-200 transition-colors"><X size={20}/></button>
                                    <h3 className="text-2xl font-black text-gray-900">تقييم الخدمة</h3>
                                </div>

                                <div className="text-center mb-8">
                                    <p className="text-gray-500 font-bold mb-4">كيف كانت تجربتك مع <span className="text-[#006269]">{feedbackTarget?.title}</span>؟</p>
                                    <div className="flex justify-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setFeedbackRating(star)}
                                                className={`p-2 transition-all duration-300 ${feedbackRating >= star ? 'text-amber-400 scale-125' : 'text-gray-200'}`}
                                            >
                                                <Star size={32} fill={feedbackRating >= star ? 'currentColor' : 'none'} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <form onSubmit={handleSubmitFeedback} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 mr-2">تعليقك (اختياري)</label>
                                        <textarea 
                                            value={feedbackComment}
                                            onChange={(e) => setFeedbackComment(e.target.value)}
                                            placeholder="أخبرنا بالمزيد عن تجربتك..."
                                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#cca43b] outline-none font-bold text-right resize-none h-32"
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        className="w-full py-4 bg-[#006269] text-white rounded-2xl font-black text-lg shadow-xl hover:bg-[#004d53] active:scale-95 transition-all"
                                    >
                                        إرسال التقييم
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TICKET MODAL */}
            <AnimatePresence>
                {showTicketModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[160] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="bg-white rounded-[3.5rem] p-8 md:p-12 max-w-2xl md:max-w-4xl w-full shadow-2xl relative overflow-hidden border-8 border-[#cca43b]/10"
                        >
                            <div className={`absolute inset-0 opacity-5 ${th.pattern} pointer-events-none`}></div>
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-8">
                                    <button onClick={() => setShowTicketModal(false)} className="bg-gray-100 p-2.5 rounded-xl hover:bg-gray-200 transition-colors"><X size={20}/></button>
                                    <div className="text-right">
                                        <h3 className="text-3xl font-black text-gray-900 mb-2">
                                            {ticketDetails.eventName.includes('طاولة') ? 'حجز طاولة ذكي' : 
                                             ticketDetails.eventName.includes('مسبح') ? 'تذكرة دخول المسبح' : 'حجز تذكرة ذكية'}
                                        </h3>
                                        <p className="text-gray-500 font-bold">
                                            {ticketDetails.eventName.includes('طاولة') ? 'يرجى تحديد عدد الأشخاص والوقت' : 'يرجى تحديد عدد التذاكر وتأكيد الحجز'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div className="space-y-6">
                                        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">الفعالية / المرفق</label>
                                            <div className="flex items-center gap-3 text-gray-800 font-black text-xl">
                                                {ticketDetails.eventName.includes('طاولة') ? <Utensils className="text-[#cca43b]" /> : 
                                                 ticketDetails.eventName.includes('مسبح') ? <Waves className="text-[#cca43b]" /> : <Ticket className="text-[#cca43b]" />}
                                                {ticketDetails.eventName}
                                            </div>
                                        </div>

                                        {ticketDetails.eventName.includes('طاولة') && (
                                            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">وقت الحجز</label>
                                                <input type="time" className="w-full bg-transparent font-black text-xl outline-none" defaultValue="20:00" />
                                            </div>
                                        )}

                                        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">
                                                {ticketDetails.eventName.includes('طاولة') ? 'عدد الأشخاص' : 'عدد التذاكر'}
                                            </label>
                                            <div className="flex items-center justify-between">
                                                <button 
                                                    onClick={() => setTicketDetails(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                                                    className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400 hover:text-[#006269] transition-colors"
                                                >
                                                    <X size={20} className="rotate-45" />
                                                </button>
                                                <span className="text-3xl font-black text-[#006269]">{ticketDetails.quantity}</span>
                                                <button 
                                                    onClick={() => setTicketDetails(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                                                    className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400 hover:text-[#006269] transition-colors"
                                                >
                                                    <Plus size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[#006269] rounded-[2.5rem] p-8 text-white flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                                        <div className="relative z-10">
                                            <div className="w-24 h-24 bg-white p-3 rounded-2xl mb-4 mx-auto shadow-inner">
                                                <QrCode size="100%" className="text-[#006269]" />
                                            </div>
                                            <span className="text-xs font-bold opacity-60 uppercase tracking-widest mb-2 block">إجمالي المبلغ</span>
                                            <div className="text-4xl font-black text-[#cca43b] mb-1">
                                                {ticketDetails.price === 0 ? 'دفع عند الوصول' : `${ticketDetails.quantity * ticketDetails.price} د.ج`}
                                            </div>
                                            <p className="text-[10px] opacity-60 font-medium">سيتم إصدار الرمز فور التأكيد</p>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleTicketPurchase}
                                    className="w-full py-6 bg-[#cca43b] text-white rounded-[2rem] font-black text-2xl shadow-[0_15px_30px_rgba(204,164,59,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-4"
                                >
                                    <CheckCircle size={28} /> تأكيد الحجز والرمز
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SCANNER MODAL */}
            <AnimatePresence>
                {showScanner && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white/5 rounded-[4rem] p-10 max-w-lg md:max-w-2xl w-full shadow-2xl relative overflow-hidden border border-white/10 text-center"
                        >
                            <button onClick={() => setShowScanner(false)} className="absolute top-8 left-8 bg-white/10 p-3 rounded-full text-white hover:bg-white/20 transition-colors"><X size={24}/></button>
                            
                            <div className="mb-10">
                                <h3 className="text-3xl font-black text-white mb-2">الماسح الضوئي الذكي</h3>
                                <p className="text-gray-400 font-bold">قم بمسح رمز QR لإثبات الهوية أو الوصول للخدمات</p>
                            </div>

                            <div className="relative w-72 h-72 mx-auto mb-12">
                                <div className="absolute inset-0 border-4 border-[#cca43b] rounded-[3rem] opacity-40"></div>
                                <div className="absolute top-0 left-0 w-12 h-12 border-t-8 border-l-8 border-[#cca43b] rounded-tl-3xl"></div>
                                <div className="absolute top-0 right-0 w-12 h-12 border-t-8 border-r-8 border-[#cca43b] rounded-tr-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-8 border-l-8 border-[#cca43b] rounded-bl-3xl"></div>
                                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-8 border-r-8 border-[#cca43b] rounded-br-3xl"></div>
                                
                                <div className="absolute inset-4 bg-white/5 rounded-[2rem] flex items-center justify-center overflow-hidden">
                                    <Camera size={80} className="text-white/20" />
                                    <div className="w-full h-1 bg-[#cca43b] shadow-[0_0_15px_#cca43b] animate-scan"></div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex items-center gap-4 text-right">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black">إثبات هوية آمن</h4>
                                        <p className="text-gray-500 text-xs font-bold">تشفير كامل للبيانات الشخصية</p>
                                    </div>
                                </div>
                                <p className="text-gray-500 text-sm font-medium">وجه الكاميرا نحو الرمز الموجود في غرفتك أو على تذكرتك</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* BOOKING SELECTION MODAL */}
            <AnimatePresence>
                {showBookingSelector && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[280] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="bg-white rounded-[4rem] p-10 max-w-2xl md:max-w-4xl w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className={`absolute inset-0 opacity-5 ${th.pattern} pointer-events-none`}></div>
                            <button onClick={() => setShowBookingSelector(false)} className="absolute top-8 left-8 bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition-colors"><X size={24}/></button>
                            
                            <div className="text-center mb-12 relative z-10">
                                <h3 className="text-3xl font-black text-gray-900 mb-2">احجز مكانك المفضل</h3>
                                <p className="text-gray-500 font-bold">اختر نوع الحجز الذي ترغب به وسنقوم بتجهيز كل شيء لك</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                <button 
                                    onClick={() => { setShowBookingSelector(false); setShowRegistrationModal(true); }}
                                    className="p-10 bg-white border-2 border-gray-100 rounded-[3rem] shadow-sm hover:border-[#cca43b] hover:shadow-xl transition-all text-right group"
                                >
                                    <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <House size={32} />
                                    </div>
                                    <h4 className="text-2xl font-black text-gray-900 mb-2">حجز غرفة / جناح</h4>
                                    <p className="text-gray-400 font-bold text-sm">إقامة فاخرة مع إطلالات ساحرة وخدمات ملكية</p>
                                </button>

                                <button 
                                    onClick={() => { setShowBookingSelector(false); setActiveSection('hotel_map'); }}
                                    className="p-10 bg-white border-2 border-gray-100 rounded-[3rem] shadow-sm hover:border-[#006269] hover:shadow-xl transition-all text-right group"
                                >
                                    <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Ticket size={32} />
                                    </div>
                                    <h4 className="text-2xl font-black text-gray-900 mb-2">تذاكر وفعاليات</h4>
                                    <p className="text-gray-400 font-bold text-sm">مسبح، مطاعم، حفلات، ومرافق ترفيهية</p>
                                </button>

                                <button 
                                    onClick={() => { 
                                        setShowBookingSelector(false); 
                                        setTicketDetails({ ...ticketDetails, eventName: 'حجز طاولة مطعم', price: 0 });
                                        setShowTicketModal(true); 
                                    }}
                                    className="p-10 bg-white border-2 border-gray-100 rounded-[3rem] shadow-sm hover:border-orange-500 hover:shadow-xl transition-all text-right group"
                                >
                                    <div className="w-16 h-16 rounded-3xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Utensils size={32} />
                                    </div>
                                    <h4 className="text-2xl font-black text-gray-900 mb-2">طاولة مطعم / مقهى</h4>
                                    <p className="text-gray-400 font-bold text-sm">استمتع بأشهى المأكولات في أرقى مطاعمنا</p>
                                </button>

                                <button 
                                    onClick={() => { 
                                        setShowBookingSelector(false); 
                                        setTicketDetails({ ...ticketDetails, eventName: 'تذكرة مسبح / سبا', price: 2000 });
                                        setShowTicketModal(true); 
                                    }}
                                    className="p-10 bg-white border-2 border-gray-100 rounded-[3rem] shadow-sm hover:border-cyan-500 hover:shadow-xl transition-all text-right group"
                                >
                                    <div className="w-16 h-16 rounded-3xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Waves size={32} />
                                    </div>
                                    <h4 className="text-2xl font-black text-gray-900 mb-2">مسبح وسبا</h4>
                                    <p className="text-gray-400 font-bold text-sm">استرخاء تام في مرافقنا الصحية العالمية</p>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ROOM CHANGE MODAL */}
            <AnimatePresence>
                {showRoomChangeModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="bg-white rounded-[3rem] p-10 max-w-lg md:max-w-2xl w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <button onClick={() => setShowRoomChangeModal(false)} className="bg-gray-100 p-2.5 rounded-xl hover:bg-gray-200 transition-colors"><X size={20}/></button>
                                <div className="text-right">
                                    <h3 className="text-2xl font-black text-gray-900">طلب تغيير الغرفة</h3>
                                    <p className="text-gray-400 font-bold text-xs">سنبذل قصارى جهدنا لتوفير خيار أفضل لك</p>
                                </div>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                addNotification('تم استلام طلب تغيير الغرفة. سيقوم موظف الاستقبال بالتواصل معك فور توفر خيارات بديلة.', 'success');
                                setShowRoomChangeModal(false);
                            }} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 mr-2">سبب الطلب</label>
                                    <select className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-[#cca43b] outline-none font-bold">
                                        <option>الرغبة في إطلالة مختلفة</option>
                                        <option>الحاجة لمساحة أكبر</option>
                                        <option>مشكلة في الغرفة الحالية</option>
                                        <option>تغيير نوع السرير</option>
                                        <option>أخرى</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 mr-2">ملاحظات إضافية</label>
                                    <textarea 
                                        rows={4}
                                        className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-[#cca43b] outline-none font-medium resize-none"
                                        placeholder="يرجى توضيح تفضيلاتك للغرفة الجديدة..."
                                    ></textarea>
                                </div>

                                <button type="submit" className="w-full py-5 bg-[#006269] text-white rounded-2xl font-black text-xl shadow-xl hover:bg-[#cca43b] transition-all flex items-center justify-center gap-2">
                                    <RefreshCw size={24} /> إرسال الطلب
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ROOM REQUEST MODAL */}
            <AnimatePresence>
                {showRoomRequestModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="bg-white rounded-[3rem] p-10 max-w-lg md:max-w-2xl w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <button onClick={() => setShowRoomRequestModal(false)} className="bg-gray-100 p-2.5 rounded-xl hover:bg-gray-200 transition-colors"><X size={20}/></button>
                                <div className="text-right">
                                    <h3 className="text-2xl font-black text-gray-900">طلبات الغرفة</h3>
                                    <p className="text-gray-400 font-bold text-xs">أخبرنا بما تحتاجه لراحتك</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {[
                                    { label: 'مناشف إضافية', icon: Waves },
                                    { label: 'تنظيف الغرفة', icon: Sparkles },
                                    { label: 'ماء / مشروبات', icon: Coffee },
                                    { label: 'وسائد إضافية', icon: House },
                                ].map((req, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => {
                                            addNotification(`تم إرسال طلب ${req.label} بنجاح.`, 'success');
                                            setShowRoomRequestModal(false);
                                        }}
                                        className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center gap-2 font-black hover:bg-[#cca43b]/10 hover:text-[#cca43b] hover:border-[#cca43b]/30 transition-all"
                                    >
                                        <req.icon size={28} />
                                        <span className="text-xs">{req.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <p className="text-gray-400 text-xs font-bold text-center">أو اطلب شيئاً آخر</p>
                                <textarea 
                                    rows={3}
                                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-[#cca43b] outline-none font-medium resize-none"
                                    placeholder="اكتب طلبك هنا..."
                                ></textarea>
                                <button 
                                    onClick={() => {
                                        addNotification('تم إرسال طلبك الخاص بنجاح.', 'success');
                                        setShowRoomRequestModal(false);
                                    }}
                                    className="w-full py-4 bg-[#006269] text-white rounded-2xl font-black hover:bg-[#cca43b] transition-all"
                                >
                                    إرسال الطلب الخاص
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SEATING MAP MODAL */}
            <AnimatePresence>
                {showSeatingMap && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="bg-white rounded-[4rem] p-8 md:p-12 max-w-4xl md:max-w-[90vw] w-full shadow-2xl relative overflow-hidden h-[90vh] flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <button onClick={() => setShowSeatingMap(false)} className="bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition-colors"><X size={24}/></button>
                                <div className="text-right">
                                    <h3 className="text-3xl font-black text-gray-900">خريطة الطاولات والمقاعد</h3>
                                    <p className="text-gray-500 font-bold">اختر مكانك المفضل في المطعم أو المقهى</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto p-4 bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-200 mb-8 relative">
                                <div className="min-w-[600px] h-full flex flex-col items-center justify-center gap-12 p-12">
                                    {/* Stage / Entrance */}
                                    <div className="w-64 h-8 bg-gray-300 rounded-full flex items-center justify-center text-[10px] font-black text-gray-500 uppercase tracking-widest">المدخل الرئيسي / الإطلالة</div>
                                    
                                    {/* Table Grid */}
                                    <div className="grid grid-cols-4 gap-12">
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <div key={i} className="relative flex flex-col items-center gap-4">
                                                {/* Chairs */}
                                                <div className="flex gap-4">
                                                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                                                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                                                </div>
                                                {/* Table */}
                                                <button 
                                                    onClick={() => setSelectedTable(i + 1)}
                                                    className={`w-24 h-24 rounded-3xl shadow-xl flex items-center justify-center font-black text-2xl transition-all ${
                                                        selectedTable === i + 1 
                                                        ? 'bg-[#cca43b] text-white scale-110 rotate-6' 
                                                        : 'bg-white text-gray-400 hover:border-[#cca43b] border-2 border-transparent'
                                                    }`}
                                                >
                                                    {i + 1}
                                                </button>
                                                {/* Chairs */}
                                                <div className="flex gap-4">
                                                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                                                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-[#cca43b] rounded-full"></div>
                                        <span className="text-xs font-bold text-gray-500">مختار</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-white border border-gray-200 rounded-full"></div>
                                        <span className="text-xs font-bold text-gray-500">متاح</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                                        <span className="text-xs font-bold text-gray-500">محجوز</span>
                                    </div>
                                </div>
                                <button 
                                    disabled={!selectedTable}
                                    onClick={() => {
                                        addNotification(`تم اختيار الطاولة رقم ${selectedTable} بنجاح.`, 'success');
                                        setShowSeatingMap(false);
                                    }}
                                    className={`px-12 py-5 rounded-2xl font-black text-xl shadow-xl transition-all ${
                                        selectedTable 
                                        ? 'bg-[#006269] text-white hover:bg-[#cca43b]' 
                                        : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                    }`}
                                >
                                    تأكيد الاختيار
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FORMER GUEST MODAL */}
            <AnimatePresence>
                {showFormerGuestModal && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowFormerGuestModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="bg-white rounded-[3rem] p-10 max-w-md md:max-w-2xl w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className={`absolute inset-0 opacity-5 ${th.pattern} pointer-events-none`}></div>
                            <button onClick={() => setShowFormerGuestModal(false)} className="absolute top-8 left-8 bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition-colors"><X size={24}/></button>
                            
                            <div className="text-center mb-8 relative z-10">
                                <div className="w-20 h-20 bg-yellow-50 text-yellow-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                                    <Star size={40} />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 mb-2">حجز نزيل سابق</h3>
                                <p className="text-gray-500 font-bold">أهلاً بك مجدداً! يرجى إدخال بياناتك السابقة لتسهيل عملية الحجز</p>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div>
                                    <label className="block text-right text-sm font-black text-gray-700 mb-2">رقم الحجز السابق (اختياري)</label>
                                    <input 
                                        type="text" 
                                        value={formerGuestDetails.bookingId}
                                        onChange={(e) => setFormerGuestDetails({...formerGuestDetails, bookingId: e.target.value})}
                                        className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[#cca43b] rounded-2xl text-right font-bold transition-all"
                                        placeholder="مثال: BK-1234"
                                    />
                                </div>
                                <div>
                                    <label className="block text-right text-sm font-black text-gray-700 mb-2">البريد الإلكتروني المسجل سابقاً</label>
                                    <input 
                                        type="email" 
                                        value={formerGuestDetails.email}
                                        onChange={(e) => setFormerGuestDetails({...formerGuestDetails, email: e.target.value})}
                                        className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[#cca43b] rounded-2xl text-right font-bold transition-all"
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <button 
                                    onClick={() => {
                                        setShowFormerGuestModal(false);
                                        setShowBookingSelector(true);
                                        addNotification('تم التعرف على بياناتك، يمكنك المتابعة في الحجز', 'success');
                                    }}
                                    className="w-full py-5 bg-[#cca43b] text-white rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    متابعة الحجز
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* QR IMPORT MODAL */}
            <AnimatePresence>
                {showQRImport && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="bg-white rounded-[3rem] p-10 max-w-md md:max-w-2xl w-full shadow-2xl relative overflow-hidden text-center"
                        >
                            <button onClick={() => setShowQRImport(false)} className="absolute top-8 left-8 bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition-colors"><X size={24}/></button>
                            
                            <div className="mb-8">
                                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <Download size={40} />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 mb-2">استيراد رمز QR</h3>
                                <p className="text-gray-500 font-bold">قم بتحميل صورة الرمز الخاص بحجزك لتسهيل عملية الربط</p>
                            </div>

                            <div className="border-4 border-dashed border-gray-100 rounded-[2.5rem] p-12 mb-8 group hover:border-blue-200 transition-all cursor-pointer">
                                <input type="file" className="hidden" id="qr-upload" />
                                <label htmlFor="qr-upload" className="cursor-pointer flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-blue-500 transition-colors">
                                        <Plus size={32} />
                                    </div>
                                    <span className="text-gray-400 font-black">اختر صورة من جهازك</span>
                                </label>
                            </div>

                            <button 
                                onClick={() => {
                                    addNotification('تم استيراد الرمز بنجاح. جاري التحقق من البيانات...', 'info');
                                    setShowQRImport(false);
                                }}
                                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-blue-700 transition-all"
                            >
                                بدء المعالجة
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes scan {
                    0% { top: 0; }
                    100% { top: 100%; }
                }
                .animate-scan {
                    position: absolute;
                    animation: scan 2s linear infinite;
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .zellige-pattern {
                    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 15-15 15-15-15zM0 30l15 15-15 15-15-15zM60 30l15 15-15 15-15-15zM30 60l15 15-15 15-15-15z' fill='%23cca43b' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .glass-effect {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
            ` }} />
        </div>
    );
};
