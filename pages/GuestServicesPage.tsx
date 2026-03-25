import React, { useState, useEffect, useRef } from 'react';
import { useHotel } from '../context/HotelContext';
import { MenuItem, ServicePoint, BookableUnit } from '../types';
import { parseSecureToken } from '../utils/qrCrypto';
import { isZelligeTheme } from '../constants';
import { 
    Bell, Coffee, Car, Shirt, Sparkles, Utensils, Wifi, CheckCircle, Globe, Send, MessageCircle, Clock, Zap, 
    Menu, ShoppingBag, MapPin, Phone, LogOut, ChevronRight, Star, Heart, CreditCard, Info, Waves, Crown, Plus, House, PartyPopper, Music, Lightbulb, Settings2, DollarSign, Thermometer, Wind, Flower2, Moon, Sun, Volume2, Power, User, Umbrella, GlassWater, ShieldCheck, Gem, LayoutGrid, Maximize2, Minimize2, Calendar, X, Store, Search, QrCode, Ticket, Armchair, Map as MapIcon, Languages, Palette, BellOff, LogIn
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { FacilityMap } from '../components/FacilityMap';

interface GuestServicesPageProps {
    previewData?: {
        type: 'room' | 'restaurant_table' | 'cafe_table' | 'pool_chair' | 'vip_area' | 'hall' | 'kiosk';
        id: string;
        name?: string;
    };
}

export const GuestServicesPage: React.FC<GuestServicesPageProps> = ({ previewData }) => {
    const { guestServices, requestService, sendGuestMessage, messages, settings, serviceRequests, menuItems, bookings, hallBookings, toggleGuestPresence, addNotification, addRestaurantOrder, rooms, servicePoints, updateServicePoint, updateServicePointUnit } = useHotel();
    const [tokenData, setTokenData] = useState<any>(null);
    const [isExpired, setIsExpired] = useState(false);
    const [isInvalid, setIsInvalid] = useState(false);
    const [activeRequest, setActiveRequest] = useState<string | null>(null);
    
    // Navigation State
    const [activeTab, setActiveTab] = useState<'home' | 'map' | 'chat' | 'wallet' | 'settings'>('home');
    const [view, setView] = useState<'home' | 'menu' | 'services' | 'controls' | 'taxi' | 'external'>('home'); // Sub-views for Home tab
    
    const [chatInput, setChatInput] = useState('');
    const [selectedServiceCategory, setSelectedServiceCategory] = useState<'all' | 'housekeeping' | 'food_beverage' | 'spa_wellness' | 'reception' | 'external'>('all');
    const [showNav, setShowNav] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMenuCategory, setSelectedMenuCategory] = useState('all');
    
    // Map & Booking State
    const [selectedFacility, setSelectedFacility] = useState<ServicePoint | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<BookableUnit | null>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);

    // Settings State
    const [guestSettings, setGuestSettings] = useState({
        notifications: true,
        darkMode: false,
        language: 'ar',
        autoReply: false
    });

    // --- New App-Like States ---
    const [showContactModal, setShowContactModal] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [bookingDetails, setBookingDetails] = useState({ facility: 'spa', date: '', time: '', guests: 1, notes: '' });
    const [selectedService, setSelectedService] = useState<any>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    
    // Smart Room State
    const [roomState, setRoomState] = useState({
        dnd: false, // Do Not Disturb
        clean: false, // Make Up Room
        lights: 80, // Dimmer
        temp: 22,
        ac: true
    });

    const inputRef = useRef<HTMLInputElement>(null);

    // --- Cart State ---
    const [cart, setCart] = useState<{ item: MenuItem, quantity: number }[]>([]);
    const [isOrderSubmitting, setIsOrderSubmitting] = useState(false);

    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.item.id === item.id);
            if (existing) return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            return [...prev, { item, quantity: 1 }];
        });
        triggerHaptic();
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(i => i.item.id !== itemId));
        triggerHaptic();
    };

    const handlePlaceOrder = () => {
        if (!tokenData || cart.length === 0) return;
        setIsOrderSubmitting(true);
        
        // Create Order Object
        const totalAmount = cart.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0);
        const orderType = tokenData.type === 'room' ? 'room_service' : 
                          tokenData.type === 'pool_chair' ? 'pool_side' : 'dine_in';
        
        const newOrder: any = {
            id: `ord-${Date.now()}`,
            items: cart,
            totalAmount,
            status: 'pending',
            type: orderType,
            source: 'restaurant',
            timestamp: new Date().toISOString(),
            notes: `Digital Order via Guest App (${tokenData.type})`,
            tableId: tokenData.type === 'restaurant_table' ? tokenData.id : undefined,
            roomNumber: tokenData.type === 'room' ? tokenData.id : undefined,
            customerName: tokenData.name || 'Guest',
        };

        if (tokenData.type === 'pool_chair') {
            newOrder.notes += ` - Location: Pool Chair ${tokenData.id}`;
        }

        // Use Context directly instead of dispatching event
        addRestaurantOrder(newOrder);

        // If it's a room order, also notify the delivery system
        if (tokenData.type === 'room') {
            addNotification(`طلب توصيل جديد للغرفة ${tokenData.id}`, 'info', `إجمالي: ${totalAmount} د.ج`, { departments: ['restaurant', 'reception'] });
        }

        setTimeout(() => {
            setIsOrderSubmitting(false);
            setCart([]);
            addNotification('تم استلام طلبك بنجاح! سيصلك قريباً.', "success");
            setView('home');
        }, 1000);
    };

    const getZelligePatternClass = () => {
        if (settings.theme === 'zellige') return 'bg-zellige-pattern';
        if (settings.theme === 'zellige-v2') return 'bg-zellige-v2-pattern';
        if (settings.theme === 'zellige-algiers') return 'bg-zellige-algiers-pattern';
        return 'bg-zellige-pattern';
    };

    const getThemeStyles = () => {
        if (settings.darkMode || guestSettings.darkMode) {
            if (settings.theme === 'zellige') {
                return {
                    container: 'bg-[#001e21]',
                    card: 'bg-[#002a2d] border-[#cca43b]/40',
                    textPrimary: 'text-[#f0c04a] drop-shadow-sm',
                    textSecondary: 'text-[#cca43b]/80',
                    buttonActive: 'bg-[#cca43b] text-[#001e21] border-[#cca43b]',
                    buttonInactive: 'bg-[#002a2d] text-[#cca43b]/60 border-[#cca43b]/20',
                    iconBg: 'bg-[#001012] text-[#f0c04a]',
                    bottomNav: 'bg-[#002a2d]/90 border-[#cca43b]/20 backdrop-blur-xl',
                    navIconActive: 'text-[#f0c04a]',
                    navIconInactive: 'text-[#cca43b]/40'
                };
            }
            // ... (Other dark themes can be added here)
            // Fallback Dark
            return {
                container: 'bg-gray-900',
                card: 'bg-gray-800 border-gray-700',
                textPrimary: 'text-white',
                textSecondary: 'text-gray-400',
                buttonActive: 'bg-white text-black border-white',
                buttonInactive: 'bg-gray-800 text-gray-500 border-gray-700',
                iconBg: 'bg-gray-700 text-gray-300',
                bottomNav: 'bg-gray-800/90 border-gray-700 backdrop-blur-xl',
                navIconActive: 'text-white',
                navIconInactive: 'text-gray-500'
            };
        }

        // Light Mode Themes
        switch (settings.theme) {
            case 'zellige': return {
                container: 'bg-[#FDFBF7]',
                card: 'bg-white border-[#cca43b]/40',
                textPrimary: 'text-[#006269]',
                textSecondary: 'text-[#006269]/70',
                buttonActive: 'bg-[#006269] text-[#cca43b] border-[#cca43b]',
                buttonInactive: 'bg-white text-[#006269] border-[#cca43b]/20',
                iconBg: 'bg-[#fbf8f1] text-[#006269]',
                bottomNav: 'bg-white/90 border-[#cca43b]/20 backdrop-blur-xl',
                navIconActive: 'text-[#006269]',
                navIconInactive: 'text-[#006269]/40'
            };
            // ... (Other light themes)
            default: return {
                container: 'bg-gray-50',
                card: 'bg-white border-gray-100',
                textPrimary: 'text-gray-800',
                textSecondary: 'text-gray-500',
                buttonActive: 'bg-black text-white border-black',
                buttonInactive: 'bg-white text-gray-500 border-gray-200',
                iconBg: 'bg-gray-50 text-gray-600',
                bottomNav: 'bg-white/90 border-gray-200 backdrop-blur-xl',
                navIconActive: 'text-black',
                navIconInactive: 'text-gray-400'
            };
        }
    };
    const ts = getThemeStyles();

    // --- Initialization ---
    useEffect(() => {
        if (previewData) {
            // If it's a legacy guest token from App.tsx
            if (previewData.id === '?') {
                const params = new URLSearchParams(window.location.search);
                const guestToken = params.get('guest');
                if (guestToken) {
                    const booking = bookings.find(b => b.guestToken === guestToken);
                    if (booking) {
                        const room = rooms.find(r => r.id === booking.roomId);
                        setTokenData({
                            type: 'room',
                            id: room?.number || '?',
                            name: booking.primaryGuestName,
                            bookingId: booking.id
                        });
                        setView('home');
                        return;
                    } else {
                        setIsInvalid(true);
                    }
                }
            }
            setTokenData(previewData);
            if (previewData.type === 'room') setView('home'); 
        } else {
            const params = new URLSearchParams(window.location.search);
            const token = params.get('token');
            if (token) {
                try {
                    const payload = parseSecureToken(token);
                    if (payload) {
                        if (payload.x && Date.now() > payload.x) {
                            setIsExpired(true);
                        } else {
                            // Map QR Payload to Guest Portal State
                            const mapType = (t: string) => {
                                switch(t) {
                                    case 'ROOM_KEY': return 'room';
                                    case 'TABLE_ORDER': return 'restaurant_table';
                                    case 'POOL_ACCESS': return 'pool_chair';
                                    case 'HALL_EVENT': return 'hall';
                                    case 'VIP_ACCESS': return 'vip_area';
                                    default: return 'room';
                                }
                            };
                            
                            setTokenData({
                                type: mapType(payload.t),
                                id: payload.i,
                                name: payload.n,
                                expiry: payload.x
                            });
                        }
                    } else {
                        // Fallback for legacy tokens if any
                        const decoded = JSON.parse(decodeURIComponent(escape(atob(token))));
                        if (decoded && decoded.type && decoded.id) {
                            setTokenData(decoded);
                        }
                    }
                } catch (e) { console.error("Invalid Token", e); }
            }
        }
    }, [previewData]);

    // --- Interactions ---
    const triggerHaptic = () => {
        if (navigator.vibrate) navigator.vibrate(15);
    };

    const handleRoomControl = (key: keyof typeof roomState, value: any) => {
        triggerHaptic();
        setRoomState(prev => ({ ...prev, [key]: value }));
        
        // Notify staff about room status changes and create service requests for tracking
        if (key === 'dnd' || key === 'clean') {
            const label = key === 'dnd' ? (value ? 'تفعيل عدم الإزعاج' : 'إلغاء عدم الإزعاج') : (value ? 'طلب تنظيف الغرفة' : 'إلغاء طلب التنظيف');
            const serviceId = key === 'clean' ? 'srv1' : 'srv_dnd';
            
            // Create a formal service request
            requestService(serviceId, tokenData.type, tokenData.id, `حالة الغرفة: ${label}`);
            
            addNotification(`${label} - غرفة ${tokenData.id}`, value ? 'warning' : 'info', `بواسطة النزيل ${tokenData.name || ''}`, { departments: ['housekeeping', 'reception'] });
        }
    };

    const handleRequest = (serviceId: string, label: string, notes?: string) => {
        if (!tokenData) return;
        triggerHaptic();
        requestService(serviceId, tokenData.type, tokenData.id, notes || (previewData ? `(محاكاة)` : `Digital Request`));
        setActiveRequest(serviceId);
        setTimeout(() => setActiveRequest(null), 3000);
        addNotification(`تم إرسال طلب "${label}" إلى الفريق المختص.`, "success");
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !tokenData) return;
        triggerHaptic();
        const chatTokenId = `GUEST_${tokenData.type}_${tokenData.id}`;
        sendGuestMessage(chatTokenId, chatInput);
        setChatInput('');
    };

    // --- Helpers ---
    const chatTokenId = tokenData ? `GUEST_${tokenData.type}_${tokenData.id}` : '';
    const myMessages = messages.filter(m => m.senderId === chatTokenId || m.receiverId === chatTokenId);

    // --- Auto Scroll Chat ---
    useEffect(() => {
        if (activeTab === 'chat' && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [myMessages, activeTab]);

    const getContextConfig = () => {
        if (!tokenData) return { bg: 'bg-gray-900', title: 'مرحباً', subtitle: 'الخدمات الذكية' };
        switch(tokenData.type) {
            case 'room': return { 
                bg: 'bg-gradient-to-br from-[#0f172a] to-[#334155]', 
                accent: 'text-blue-400',
                title: 'غرفتي الذكية', 
                subtitle: `غرفة ${tokenData.id} • ${tokenData.name || 'النزيل'}`,
                icon: House
            };
            case 'restaurant_table': return { 
                bg: 'bg-gradient-to-br from-[#451a03] to-[#78350f]', 
                accent: 'text-orange-400',
                title: 'المطعم الأندلسي', 
                subtitle: `طاولة ${tokenData.id} • القاعة المستقلة`,
                icon: Utensils
            };
            case 'cafe_table': return { 
                bg: 'bg-gradient-to-br from-[#064e3b] to-[#065f46]', 
                accent: 'text-emerald-400',
                title: 'مقهى القصبة', 
                subtitle: `طاولة ${tokenData.id} • القاعة المستقلة`,
                icon: Coffee
            };
            case 'pool_chair': return { 
                bg: 'bg-gradient-to-br from-[#0e7490] to-[#155e75]', 
                accent: 'text-cyan-300',
                title: 'المسبح الذكي', 
                subtitle: `كرسي ${tokenData.id} • القاعة المتعددة`,
                icon: Waves
            };
            case 'vip_area': return { 
                bg: 'bg-gradient-to-br from-[#1c1917] to-[#78350f]', 
                accent: 'text-yellow-500',
                title: 'VIP LOUNGE', 
                subtitle: `الأجنحة والقاعات VIP • ${tokenData.id}`,
                icon: Crown
            };
            case 'hall': return { 
                bg: 'bg-gradient-to-br from-[#4c1d95] to-[#7c3aed]', 
                accent: 'text-purple-300',
                title: 'القاعة المتعددة', 
                subtitle: `مركز الفعاليات • ${tokenData.name || 'مؤتمر'}`,
                icon: PartyPopper
            };
            case 'kiosk': return { 
                bg: 'bg-gradient-to-br from-[#166534] to-[#14532d]', 
                accent: 'text-green-400',
                title: 'أكشاك الحديقة', 
                subtitle: `نقطة خدمة ${tokenData.id} • الحديقة`,
                icon: Store
            };
            default: return { bg: 'bg-gray-800', accent: 'text-white', title: 'Authentic Guest', subtitle: 'Welcome', icon: Star };
        }
    };
    const ctx = getContextConfig();

    const getIconComponent = (name: string) => {
        const icons: any = { 
            Bell, Coffee, Car, Shirt, Sparkles, Utensils, Wifi, CheckCircle, Globe, Send, 
            MessageCircle, Clock, Zap, Menu, ShoppingBag, MapPin, Phone, LogOut, Star, 
            Heart, CreditCard, Info, Waves, Crown, Plus, House, PartyPopper, Music, 
            Lightbulb, Settings2, DollarSign, Thermometer, Wind, Flower2, Moon, Sun, 
            Volume2, Power, User, Umbrella, GlassWater, ShieldCheck, Gem, LayoutGrid, 
            Calendar 
        };
        const Icon = icons[name] || Bell;
        return <Icon size={20} />;
    };

    if (isExpired) return <div className="h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-8 text-center"><LogOut size={48} className="mb-4 text-red-400"/><h2 className="text-xl font-bold text-gray-800">انتهت الجلسة</h2><p className="text-xs mt-2">يرجى طلب رمز جديد من الاستقبال</p></div>;
    if (isInvalid) return <div className="h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-8 text-center"><ShieldCheck size={48} className="mb-4 text-orange-400"/><h2 className="text-xl font-bold text-gray-800">رمز غير صالح</h2><p className="text-xs mt-2">لم نتمكن من العثور على بيانات لهذا الرمز</p></div>;
    if (!tokenData) return <div className="h-full flex flex-col items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;

    const filteredServices = guestServices.filter(s => 
        s.isActive && 
        (selectedServiceCategory === 'all' || s.targetDepartment === selectedServiceCategory) &&
        (s.allowedLocations.includes('all') || s.allowedLocations.includes(tokenData.type))
    );

    // --- RENDER CONTENT BASED ON ACTIVE TAB ---
    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return (
                    <div className={`flex-1 overflow-y-auto custom-scrollbar space-y-6 ${showNav ? 'pb-24' : 'pb-6'}`}>
                        {/* Featured Banner */}
                        <div className="relative h-48 rounded-[2.5rem] overflow-hidden shadow-lg group mx-4 mt-4">
                            <img 
                                src="https://picsum.photos/seed/hotel-luxury/800/400" 
                                alt="Luxury Hotel" 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                                <span className="bg-yellow-500 text-black text-[10px] font-black px-2 py-1 rounded-full w-fit mb-2">عرض خاص</span>
                                <h2 className="text-white font-black text-xl">استمتع بخصم 20% على السبا</h2>
                                <p className="text-white/70 text-[10px] font-bold">احجز جلستك اليوم عبر التطبيق</p>
                            </div>
                        </div>

                        {/* Main App Grid - Expanded & Prominent */}
                        <div className="grid grid-cols-4 gap-y-6 gap-x-4 px-4 mb-6">
                            {[
                                { id: 'menu', label: 'المطعم', icon: Utensils, color: 'bg-orange-100 text-orange-600', action: () => setView('menu') },
                                { id: 'map', label: 'حجز مرفق', icon: Armchair, color: 'bg-emerald-100 text-emerald-600', action: () => setActiveTab('map') },
                                { id: 'chat', label: 'محادثة', icon: MessageCircle, color: 'bg-blue-100 text-blue-600', action: () => setActiveTab('chat') },
                                { id: 'wallet', label: 'هويتي', icon: QrCode, color: 'bg-purple-100 text-purple-600', action: () => setActiveTab('wallet') },
                                
                                { id: 'services', label: 'خدمات', icon: Bell, color: 'bg-indigo-100 text-indigo-600', action: () => setView('services') },
                                { id: 'taxi', label: 'تاكسي', icon: Car, color: 'bg-yellow-100 text-yellow-600', action: () => setView('taxi') },
                                { id: 'laundry', label: 'مصبغة', icon: Shirt, color: 'bg-pink-100 text-pink-600', action: () => handleRequest('srv_laundry', 'مصبغة', 'طلب خدمة غسيل الملابس') },
                                { id: 'settings', label: 'إعدادات', icon: Settings2, color: 'bg-gray-100 text-gray-600', action: () => setActiveTab('settings') },
                            ].map(app => (
                                <button 
                                    key={app.id}
                                    onClick={app.action}
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className={`w-16 h-16 rounded-[1.2rem] ${app.color} flex items-center justify-center shadow-md group-active:scale-90 transition-all border border-white/60`}>
                                        <app.icon size={30} strokeWidth={2} />
                                    </div>
                                    <span className={`text-[11px] font-black ${ts.textPrimary}`}>{app.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Smart Controls Section (Only for Rooms) */}
                        {tokenData.type === 'room' && (
                            <div className={`mx-4 p-6 rounded-[2.5rem] shadow-sm border ${ts.card}`}>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className={`font-black flex items-center gap-2 ${ts.textPrimary}`}><Settings2 size={18}/> تحكم الغرفة</h3>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleRoomControl('dnd', !roomState.dnd)}
                                            className={`p-2 rounded-xl transition-all ${roomState.dnd ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}
                                        >
                                            <Moon size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleRoomControl('clean', !roomState.clean)}
                                            className={`p-2 rounded-xl transition-all ${roomState.clean ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}
                                        >
                                            <Sparkles size={16} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className={`text-[10px] font-bold ${ts.textSecondary}`}>التكييف</span>
                                            <span className={`text-sm font-black ${ts.textPrimary}`}>{roomState.temp}°C</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleRoomControl('temp', roomState.temp - 1)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">-</button>
                                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500" style={{ width: `${(roomState.temp / 30) * 100}%` }}></div>
                                            </div>
                                            <button onClick={() => handleRoomControl('temp', roomState.temp + 1)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">+</button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className={`text-[10px] font-bold ${ts.textSecondary}`}>الإضاءة</span>
                                            <span className={`text-sm font-black ${ts.textPrimary}`}>{roomState.lights}%</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="0" max="100" 
                                            value={roomState.lights} 
                                            onChange={(e) => setRoomState({...roomState, lights: parseInt(e.target.value)})}
                                            className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-yellow-400" 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'map':
                return (
                    <div className={`flex-1 overflow-y-auto custom-scrollbar p-4 ${showNav ? 'pb-24' : 'pb-6'}`}>
                        <h2 className={`text-xl font-black mb-4 ${ts.textPrimary}`}>خريطة المرافق والحجز</h2>
                        <p className={`text-xs mb-4 ${ts.textSecondary}`}>اختر المرفق ثم اختر الطاولة أو المقعد المناسب لك.</p>
                        
                        {/* Facility Selector */}
                        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                            {servicePoints.map(sp => (
                                <button
                                    key={sp.id}
                                    onClick={() => setSelectedFacility(sp)}
                                    className={`px-4 py-2 rounded-xl whitespace-nowrap transition border ${selectedFacility?.id === sp.id ? ts.buttonActive : ts.buttonInactive}`}
                                >
                                    {sp.name}
                                </button>
                            ))}
                        </div>

                        {/* Map View */}
                        {selectedFacility ? (
                            <div className="h-[500px] rounded-3xl overflow-hidden border border-gray-200 shadow-inner">
                                <FacilityMap 
                                    venue={selectedFacility}
                                    units={selectedFacility.units || []} // Ensure units exist
                                    mode="booking"
                                    onSelectUnit={(unit) => {
                                        setSelectedUnit(unit);
                                        setShowBookingModal(true);
                                    }}
                                    onUpdateUnit={() => {}}
                                    onDeleteUnit={() => {}}
                                    onAddUnit={() => {}}
                                />
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                                <p className="text-gray-400 font-bold">يرجى اختيار مرفق لعرض الخريطة</p>
                            </div>
                        )}
                    </div>
                );

            case 'chat':
                return (
                    <div className={`flex-1 flex flex-col h-full ${showNav ? 'pb-24' : 'pb-6'}`}>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {myMessages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                                    <MessageCircle size={48} className="mb-2" />
                                    <p>لا توجد رسائل بعد. ابدأ المحادثة مع الاستقبال.</p>
                                </div>
                            ) : (
                                myMessages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.senderId === chatTokenId ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                            msg.senderId === chatTokenId 
                                            ? 'bg-blue-600 text-white rounded-br-none' 
                                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                        }`}>
                                            {msg.content}
                                            <span className="text-[9px] opacity-70 block mt-1 text-left">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                            <input 
                                type="text" 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="اكتب رسالتك هنا..."
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button type="submit" className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                );

            case 'wallet':
                return (
                    <div className={`flex-1 overflow-y-auto custom-scrollbar p-6 ${showNav ? 'pb-24' : 'pb-6'}`}>
                        <h2 className={`text-2xl font-black mb-6 ${ts.textPrimary}`}>محفظتي الرقمية</h2>
                        
                        {/* QR Card */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col items-center text-center mb-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                            <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <QRCodeSVG value={JSON.stringify({ t: tokenData.type, i: tokenData.id, n: tokenData.name })} size={180} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-1">{tokenData.name || 'Guest'}</h3>
                            <p className="text-sm text-gray-500 font-mono mb-4">{tokenData.id}</p>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">نشط</span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">{tokenData.type}</span>
                            </div>
                        </div>

                        {/* Stats/Points */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className={`p-5 rounded-3xl border ${ts.card}`}>
                                <div className="flex items-center gap-2 mb-2 text-yellow-500">
                                    <Star size={20} fill="currentColor" />
                                    <span className="font-bold text-xs">النقاط</span>
                                </div>
                                <p className={`text-2xl font-black ${ts.textPrimary}`}>1,250</p>
                            </div>
                            <div className={`p-5 rounded-3xl border ${ts.card}`}>
                                <div className="flex items-center gap-2 mb-2 text-green-500">
                                    <Ticket size={20} />
                                    <span className="font-bold text-xs">الكوبونات</span>
                                </div>
                                <p className={`text-2xl font-black ${ts.textPrimary}`}>3</p>
                            </div>
                        </div>
                    </div>
                );

            case 'settings':
                return (
                    <div className={`flex-1 overflow-y-auto custom-scrollbar p-6 ${showNav ? 'pb-24' : 'pb-6'}`}>
                        <h2 className={`text-2xl font-black mb-6 ${ts.textPrimary}`}>الإعدادات</h2>
                        
                        <div className="space-y-4">
                            <div className={`p-4 rounded-2xl border flex items-center justify-between ${ts.card}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${ts.iconBg}`}><Bell size={20}/></div>
                                    <span className={`font-bold ${ts.textPrimary}`}>الإشعارات</span>
                                </div>
                                <button 
                                    onClick={() => setGuestSettings(s => ({...s, notifications: !s.notifications}))}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${guestSettings.notifications ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${guestSettings.notifications ? 'left-1' : 'right-1'}`}></div>
                                </button>
                            </div>

                            <div className={`p-4 rounded-2xl border flex items-center justify-between ${ts.card}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${ts.iconBg}`}><Moon size={20}/></div>
                                    <span className={`font-bold ${ts.textPrimary}`}>الوضع الليلي</span>
                                </div>
                                <button 
                                    onClick={() => setGuestSettings(s => ({...s, darkMode: !s.darkMode}))}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${guestSettings.darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${guestSettings.darkMode ? 'left-1' : 'right-1'}`}></div>
                                </button>
                            </div>

                            <div className={`p-4 rounded-2xl border flex items-center justify-between ${ts.card}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${ts.iconBg}`}><Languages size={20}/></div>
                                    <span className={`font-bold ${ts.textPrimary}`}>اللغة</span>
                                </div>
                                <span className={`text-sm font-bold ${ts.textSecondary}`}>العربية</span>
                            </div>
                        </div>

                        <button className="w-full mt-8 p-4 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-2">
                            <LogOut size={20} /> تسجيل الخروج
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className={`h-full flex flex-col font-sans relative overflow-hidden ${ts.container}`} dir="rtl">
            {/* Zellige Background Pattern Overlay */}
            {(isZelligeTheme(settings.theme)) && (
                <div className={`absolute inset-0 opacity-15 ${getZelligePatternClass()} mix-blend-multiply pointer-events-none z-0`}></div>
            )}
            
            {/* --- SIDE MENU DRAWER --- */}
            {isMenuOpen && (
                <div className="absolute inset-0 z-[60] flex">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                        onClick={() => setIsMenuOpen(false)}
                    ></div>
                    
                    {/* Drawer Content */}
                    <div className={`relative w-[80%] max-w-xs h-full ${ts.card} shadow-2xl animate-slide-right overflow-y-auto custom-scrollbar flex flex-col`}>
                        {/* Drawer Header */}
                        <div className={`p-6 border-b ${settings.darkMode ? 'border-gray-700' : 'border-gray-100'} flex items-center justify-between`}>
                            <div>
                                <h2 className={`text-xl font-black ${ts.textPrimary}`}>القائمة</h2>
                                <p className={`text-xs ${ts.textSecondary}`}>كل ما تحتاجه في مكان واحد</p>
                            </div>
                            <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Drawer Items */}
                        <div className="p-4 space-y-6 flex-1">
                            {/* Section 1: Main Services */}
                            <div>
                                <h3 className={`text-xs font-bold uppercase mb-3 px-2 ${ts.textSecondary}`}>الخدمات الرئيسية</h3>
                                <div className="space-y-1">
                                    {[
                                        { id: 'home', label: 'الرئيسية', icon: House, action: () => { setActiveTab('home'); setView('home'); } },
                                        { id: 'menu', label: 'المطعم و الطلبات', icon: Utensils, action: () => { setActiveTab('home'); setView('menu'); } },
                                        { id: 'map', label: 'حجز المرافق', icon: Armchair, action: () => setActiveTab('map') },
                                        { id: 'services', label: 'خدمات الغرف', icon: Bell, action: () => { setActiveTab('home'); setView('services'); } },
                                    ].map(item => (
                                        <button 
                                            key={item.id}
                                            onClick={() => { item.action(); setIsMenuOpen(false); }}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${ts.textPrimary}`}
                                        >
                                            <div className={`p-2 rounded-lg ${ts.iconBg}`}><item.icon size={18}/></div>
                                            <span className="font-bold text-sm">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Section 2: Personal */}
                            <div>
                                <h3 className={`text-xs font-bold uppercase mb-3 px-2 ${ts.textSecondary}`}>شخصي</h3>
                                <div className="space-y-1">
                                    {[
                                        { id: 'wallet', label: 'هويتي (QR)', icon: QrCode, action: () => setActiveTab('wallet') },
                                        { id: 'chat', label: 'محادثة الاستقبال', icon: MessageCircle, action: () => setActiveTab('chat') },
                                        { id: 'settings', label: 'الإعدادات', icon: Settings2, action: () => setActiveTab('settings') },
                                    ].map(item => (
                                        <button 
                                            key={item.id}
                                            onClick={() => { item.action(); setIsMenuOpen(false); }}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${ts.textPrimary}`}
                                        >
                                            <div className={`p-2 rounded-lg ${ts.iconBg}`}><item.icon size={18}/></div>
                                            <span className="font-bold text-sm">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Section 3: External & Other */}
                            <div>
                                <h3 className={`text-xs font-bold uppercase mb-3 px-2 ${ts.textSecondary}`}>خدمات إضافية</h3>
                                <div className="space-y-1">
                                    {[
                                        { id: 'taxi', label: 'طلب تاكسي', icon: Car, action: () => { setActiveTab('home'); setView('taxi'); } },
                                        { id: 'laundry', label: 'مصبغة', icon: Shirt, action: () => { handleRequest('srv_laundry', 'مصبغة', 'طلب خدمة غسيل الملابس'); setIsMenuOpen(false); } },
                                        { id: 'tours', label: 'جولات سياحية', icon: Globe, action: () => { setActiveTab('home'); setView('external'); } },
                                        { id: 'events', label: 'الفعاليات', icon: PartyPopper, action: () => { /* Add event view logic later */ setIsMenuOpen(false); } },
                                    ].map(item => (
                                        <button 
                                            key={item.id}
                                            onClick={() => { item.action(); setIsMenuOpen(false); }}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${ts.textPrimary}`}
                                        >
                                            <div className={`p-2 rounded-lg ${ts.iconBg}`}><item.icon size={18}/></div>
                                            <span className="font-bold text-sm">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        <div className="p-6 border-t border-gray-100 dark:border-gray-700">
                            <button className="w-full p-3 bg-red-50 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition">
                                <LogOut size={18} /> تسجيل الخروج
                            </button>
                            <p className="text-center text-[10px] text-gray-400 mt-4">v1.2.0 • Powered by HotelOS</p>
                        </div>
                    </div>
                </div>
            )}

            {/* --- HEADER (Context Aware) --- */}
            <div className={`relative px-5 pt-8 pb-16 rounded-b-[2.5rem] shadow-xl shrink-0 ${ctx.bg} text-white transition-all duration-500 overflow-hidden`}>
                {/* Authentic Zellige Pattern Overlay - Enhanced Visibility */}
                <div className={`absolute inset-0 opacity-30 ${getZelligePatternClass()} mix-blend-overlay`}></div>
                
                <div className="relative z-10 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        {/* Menu Trigger Button */}
                        <button 
                            onClick={() => setIsMenuOpen(true)}
                            className="p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 active:scale-90 transition-transform hover:bg-white/20"
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <div className={`flex items-center gap-2 mb-1 ${ctx.accent}`}>
                                <ctx.icon size={18} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{ctx.title}</span>
                            </div>
                            <h1 className="text-xl font-black leading-tight">{ctx.subtitle}</h1>
                        </div>
                    </div>
                    
                    {/* Status Badge & Controls */}
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                            <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold border border-white/10 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> متصل
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN INTERFACE --- */}
            <div className={`flex-1 flex flex-col -mt-10 relative z-20 px-0 pb-0 overflow-hidden transition-all duration-300`}>
                {renderContent()}
            </div>

            {/* --- BOTTOM NAVIGATION --- */}
            {showNav && (
                <div className={`absolute bottom-0 left-0 w-full ${ts.bottomNav} pb-6 pt-4 px-6 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50`}>
                    <div className="flex justify-between items-center">
                        <button 
                            onClick={() => { setActiveTab('home'); setView('home'); }}
                            className={`flex flex-col items-center gap-1 transition-all ${(activeTab === 'home' && view === 'home') ? '-translate-y-2' : 'opacity-60'}`}
                        >
                            <div className={`p-3 rounded-2xl transition-all ${(activeTab === 'home' && view === 'home') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-gray-400'}`}>
                                <House size={24} />
                            </div>
                            <span className={`text-[10px] font-bold ${(activeTab === 'home' && view === 'home') ? ts.navIconActive : ts.navIconInactive}`}>الرئيسية</span>
                        </button>

                        <button 
                            onClick={() => { setActiveTab('home'); setView('menu'); }}
                            className={`flex flex-col items-center gap-1 transition-all ${(activeTab === 'home' && view === 'menu') ? '-translate-y-2' : 'opacity-60'}`}
                        >
                            <div className={`p-3 rounded-2xl transition-all ${(activeTab === 'home' && view === 'menu') ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-gray-400'}`}>
                                <Utensils size={24} />
                            </div>
                            <span className={`text-[10px] font-bold ${(activeTab === 'home' && view === 'menu') ? ts.navIconActive : ts.navIconInactive}`}>المطعم</span>
                        </button>

                        {/* Center Action Button (QR) */}
                        <div className="-mt-12">
                            <button 
                                onClick={() => setActiveTab('wallet')}
                                className="w-16 h-16 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-orange-500/40 border-4 border-white dark:border-gray-800 transform transition active:scale-95"
                            >
                                <QrCode size={32} />
                            </button>
                        </div>

                        <button 
                            onClick={() => setActiveTab('map')}
                            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'map' ? '-translate-y-2' : 'opacity-60'}`}
                        >
                            <div className={`p-3 rounded-2xl transition-all ${activeTab === 'map' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-gray-400'}`}>
                                <Armchair size={24} />
                            </div>
                            <span className={`text-[10px] font-bold ${activeTab === 'map' ? ts.navIconActive : ts.navIconInactive}`}>المرافق</span>
                        </button>

                        <button 
                            onClick={() => setActiveTab('chat')}
                            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'chat' ? '-translate-y-2' : 'opacity-60'}`}
                        >
                            <div className={`p-3 rounded-2xl transition-all ${activeTab === 'chat' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-gray-400'}`}>
                                <MessageCircle size={24} />
                            </div>
                            <span className={`text-[10px] font-bold ${activeTab === 'chat' ? ts.navIconActive : ts.navIconInactive}`}>محادثة</span>
                        </button>
                    </div>
                </div>
            )}

            {/* --- BOOKING MODAL --- */}
            {showBookingModal && selectedUnit && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-900">تأكيد الحجز</h3>
                            <button onClick={() => setShowBookingModal(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                    <Armchair size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">الوحدة المختارة</p>
                                    <p className="text-lg font-black text-gray-900">{selectedUnit.name}</p>
                                    <p className="text-xs text-gray-400">{selectedUnit.type} • {selectedUnit.capacity} أشخاص</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2">ملاحظات إضافية</label>
                                <textarea 
                                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    rows={3}
                                    placeholder="هل لديك أي طلبات خاصة؟"
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowBookingModal(false)}
                                className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition"
                            >
                                إلغاء
                            </button>
                            <button 
                                onClick={() => {
                                    if (selectedFacility && selectedUnit) {
                                        updateServicePointUnit(selectedFacility.id, selectedUnit.id, { status: 'occupied' });
                                        addNotification('تم تأكيد الحجز بنجاح!', 'success');
                                        setShowBookingModal(false);
                                    }
                                }}
                                className="flex-[2] py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-900 transition shadow-lg shadow-black/20"
                            >
                                تأكيد الحجز
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
