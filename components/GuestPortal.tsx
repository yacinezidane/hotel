import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { Send, Bell, Phone, Coffee, Info, MessageCircle, LogOut, Truck, Crown, Calendar, DollarSign, Clock, QrCode, House, X, ChevronRight, Users, User, FileCheck, ShoppingBag, Star, Utensils, Wifi, Key, Dumbbell, Waves, Car, Shirt, UserPlus, ArrowRight, FileText, Shield, AlertTriangle, Sparkles, MapPin, Wind, Share2, LogIn, Check, ShieldCheck } from 'lucide-react';
import { GuestExternalServices } from './GuestExternalServices';
import { GuestRegistrationForm } from './GuestRegistrationForm';
import { GuestPrivacyForm } from './GuestPrivacyForm';
import { SelfCheckInForm } from './SelfCheckInForm';
import { GuestServiceCatalog } from './GuestServiceCatalog';
import { GuestOnboardingModal } from './GuestOnboardingModal';
import { CartReviewModal } from './CartReviewModal';
import { QRCodeSVG } from 'qrcode.react';
import { generateSecureToken } from '../utils/qrCrypto';
import { motion, AnimatePresence } from 'motion/react';
import { ServicePoint, BookableUnit } from '../types';

interface GuestPortalProps {
    token: string;
    onExit?: () => void;
    onLogoClick?: () => void;
    onSwitchToVisitor?: (profile?: any) => void;
    initialTab?: 'home' | 'services' | 'financials' | 'registration' | 'chat' | 'privacy' | 'bookings' | 'guide' | 'self-check-in' | 'orders';
}

export const GuestPortal: React.FC<GuestPortalProps> = ({ token, onExit, onLogoClick, onSwitchToVisitor, initialTab }) => {
    const { 
        bookings, rooms, settings, sendGuestMessage, messages, 
        invoices, guestHistory, notifications, addNotification, 
        addQRRecord, restaurantOrders, cart, clearCart,
        updateCartItemQuantity, removeFromCart, updateCartItemNotes
    } = useHotel();
    const [input, setInput] = useState('');
    const [activeTab, setActiveTab] = useState<'home' | 'services' | 'financials' | 'registration' | 'chat' | 'privacy' | 'bookings' | 'guide' | 'self-check-in' | 'orders'>(initialTab || 'home');
    const [tabHistory, setTabHistory] = useState<string[]>([]);
    const [isRegistering, setIsRegistering] = useState(token === 'NEW_REGISTRATION');
    const [quickCode, setQuickCode] = useState('');
    const [loginError, setLoginError] = useState('');
    const [internalToken, setInternalToken] = useState(token !== 'NEW_REGISTRATION' ? token : '');
    const [serviceCategory, setServiceCategory] = useState<string>('all');
    const [showQR, setShowQR] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showWifi, setShowWifi] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [showVisitorPass, setShowVisitorPass] = useState(false);
    const [showCartReview, setShowCartReview] = useState(false);
    const [hasSkippedOnboarding, setHasSkippedOnboarding] = useState(false);
    const [chatRecipient, setChatRecipient] = useState<'reception' | 'management' | 'facilities'>('reception');
    const [hiddenClicks, setHiddenClicks] = useState(0);
    const [lastClickTime, setLastClickTime] = useState(0);
    const [registrationType, setRegistrationType] = useState<'new' | 'companion' | null>(null);
    const colors = [
        { name: 'الافتراضي (النظام)', value: settings.theme.includes('zellige') ? '#006269' : '#cca43b' },
        { name: 'زمردي', value: '#006269' },
        { name: 'ذهبي', value: '#cca43b' },
        { name: 'ياقوتي', value: '#9b2226' },
        { name: 'نيلي', value: '#1d3557' },
        { name: 'بنفسجي', value: '#5a189a' },
    ];

    const [themeColor, setThemeColor] = useState(() => {
        const saved = localStorage.getItem('guestTheme');
        if (saved) return saved;
        
        // Derive from global settings if no local override
        if (settings.theme.includes('zellige')) return '#006269';
        if (settings.theme === 'instagram') return '#E1306C';
        if (settings.theme === 'real-madrid') return '#FEBE10';
        if (settings.theme === 'barcelona') return '#A50044';
        if (settings.theme === 'comoros') return '#3A7D44';
        
        return colors[0].value;
    });
    const [showThemePicker, setShowThemePicker] = useState(false);

    const [guestProfile, setGuestProfile] = useState<{ name: string, phone: string, idNumber: string, membershipCode: string } | null>(() => {
        const saved = localStorage.getItem('guestProfile');
        return saved ? JSON.parse(saved) : null;
    });

    const handleHiddenClick = () => {
        if (onLogoClick) {
            onLogoClick();
            return;
        }
        const now = Date.now();
        const isFast = now - lastClickTime < 500;
        setLastClickTime(now);

        if (isFast) {
            setHiddenClicks(prev => {
                const next = prev + 1;
                if (next >= 10) {
                    window.location.href = '/staff';
                    return 0;
                }
                return next;
            });
        } else {
            setHiddenClicks(1);
        }
    };

    // Find booking
    const currentToken = internalToken || token;
    const anyBooking = bookings.find(b => b.guestToken === currentToken && currentToken !== 'NEW_REGISTRATION');
    const booking = anyBooking?.status === 'active' ? anyBooking : null;
    const isExpired = anyBooking && anyBooking.status !== 'active';
    const room = booking ? rooms.find(r => r.id === booking.roomId) : null;
    
    // Find Guest Info for Rank/CrewID
    const guestInfo = booking ? guestHistory.find(g => g.name === booking.primaryGuestName) : null;
    const guestInvoice = booking ? invoices.find(i => i.bookingId === booking.id) : null;
    const guestOrders = booking ? restaurantOrders.filter(o => o.bookingId === booking.id) : [];

    const isSelfCheckedIn = booking?.guests[0]?.isSelfCheckedIn;

    // Filter chat for this guest
    const chatMessages = messages.filter(m => m.senderId === token || m.receiverId === token);
    // Filter notifications (public or targeted)
    const guestNotifications = notifications.filter(n => !n.targetUsers || (booking && n.targetUsers.includes(booking.id)) || n.type === 'info');

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if(!input.trim()) return;
        sendGuestMessage(token, input, chatRecipient);
        setInput('');
    };

    const isSectionVisible = (section: string) => {
        if (!settings.guestPermissions?.visibleSections) return true;
        return settings.guestPermissions.visibleSections.includes(section);
    };

    const handleTabChange = (tab: any) => {
        if (tab === activeTab) return;
        if (!isSectionVisible(tab)) {
            addNotification('هذا القسم غير متاح حالياً', 'info');
            return;
        }
        setTabHistory(prev => [...prev, activeTab]);
        setActiveTab(tab);
    };

    const handleBack = () => {
        if (tabHistory.length > 0) {
            const newHistory = [...tabHistory];
            const prevTab = newHistory.pop();
            setTabHistory(newHistory);
            setActiveTab(prevTab as any);
        } else {
            setActiveTab('home');
        }
    };

    const [showTicketQR, setShowTicketQR] = useState<{ token: string, title: string } | null>(null);

    const handleOrder = (items: any[]) => {
        const orderSummary = items.map(i => {
            let detailsStr = '';
            if (i.details) {
                detailsStr = ` (لـ: ${i.details.forWhom === 'self' ? 'نفسي' : 'آخرين'}، ${i.details.date} ${i.details.time})`;
            }
            const itemName = i.item?.name || i.name;
            return `${i.quantity}x ${itemName}${detailsStr}`;
        }).join('، ');
        
        sendGuestMessage(token, `طلب خدمة جديد: ${orderSummary}`);
        addNotification('تم استلام طلبك، سيصلك قريباً!', 'success');
        
        // Check if any item is a ticket or facility booking for others
        const ticketItem = items.find(i => {
            const cat = i.item?.category || i.category;
            return cat === 'tickets' || cat === 'pool' || cat === 'hall';
        });
        
        if (ticketItem && ticketItem.details) {
            const itemName = ticketItem.item?.name || ticketItem.name;
            const category = ticketItem.item?.category || ticketItem.category;
            const ticketId = `TKT-${Date.now()}`;
            const ticketToken = generateSecureToken({
                t: 'TICKET',
                i: ticketId,
                n: itemName,
                m: { 
                    bookingId: booking.id, 
                    guestName: guestProfile?.name || booking.primaryGuestName,
                    quantity: ticketItem.quantity,
                    date: ticketItem.details.date,
                    time: ticketItem.details.time,
                    forWhom: ticketItem.details.forWhom
                }
            });
            
            addQRRecord({
                type: category === 'pool' ? 'pool_pass' : (category === 'hall' ? 'hall' : 'guest_service'),
                referenceId: ticketId,
                title: itemName,
                subtitle: `تذكرة لـ ${ticketItem.details.forWhom === 'self' ? 'نفسي' : 'آخرين'}`,
                status: 'valid',
                dataPayload: ticketToken
            }, 'multi_use');

            setShowTicketQR({ token: ticketToken, title: itemName });
        }
    };

    const [showQuickCodeInput, setShowQuickCodeInput] = useState(false);
    const [quickCodeInput, setQuickCodeInput] = useState('');

    const handleQuickLogin = (code: string) => {
        const found = bookings.find(b => b.guestToken === code.toUpperCase());
        if (found) {
            setInternalToken(code.toUpperCase());
            addNotification('تم تسجيل الدخول بنجاح', 'success');
        } else {
            addNotification('الرمز غير صحيح، يرجى المحاولة مرة أخرى', 'error');
        }
    };

    if ((!booking || !room) && !isRegistering) {
        return (
            <div className="min-h-[100dvh] bg-[#FDFBF7] flex flex-col items-center justify-start sm:justify-center p-4 sm:p-6 text-right overflow-y-auto custom-scrollbar" dir="rtl">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md bg-white rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl p-6 sm:p-10 border border-gray-100 relative overflow-hidden my-4 sm:my-8"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#006269]/5 rounded-full -mr-16 -mt-16"></div>
                    
                    <div className="relative z-10">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#006269]/10 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Crown size={32} className="text-[#006269] sm:size-10" />
                        </div>
                        
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 text-center mb-2">مرحباً بك في فندق الجزائر</h2>
                        <p className="text-gray-500 font-bold text-center mb-8 sm:mb-10 text-sm sm:text-base">يرجى اختيار طريقة الدخول للوصول إلى خدماتك</p>

                        {isExpired ? (
                            <div className="space-y-6 animate-fade-in">
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 text-sm font-bold flex items-center gap-3">
                                    <AlertTriangle size={20} className="shrink-0" />
                                    <span>عذراً، يبدو أن حجزك قد انتهى أو تم إلغاؤه. يمكنك الاستمرار كزائر.</span>
                                </div>
                                <button 
                                    onClick={() => onSwitchToVisitor?.({
                                        name: guestProfile?.name || anyBooking?.primaryGuestName || 'زائر سابق',
                                        phone: guestProfile?.phone || '',
                                        idNumber: guestProfile?.idNumber || '',
                                        membershipCode: 'EXPIRED-GUEST'
                                    })}
                                    className="w-full py-4 bg-[#cca43b] text-white rounded-2xl font-black shadow-lg hover:shadow-xl transition active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Users size={20} />
                                    الدخول كزائر
                                </button>
                                <button 
                                    onClick={() => {
                                        setInternalToken('');
                                        setQuickCode('');
                                        setShowQuickCodeInput(false);
                                    }}
                                    className="w-full py-4 text-gray-400 font-bold hover:text-gray-600 transition"
                                >
                                    جرب رمزاً آخر
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Modern Entry Options */}
                                <AnimatePresence mode="wait">
                                    {!showQuickCodeInput ? (
                                        <motion.button 
                                            key="entry-btn"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            onClick={() => setShowQuickCodeInput(true)}
                                            className="w-full p-5 sm:p-6 bg-gray-50 rounded-[2rem] border-2 border-transparent hover:border-[#006269] flex items-center gap-4 sm:gap-5 transition group text-right"
                                        >
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#006269] group-hover:rotate-12 transition-transform">
                                                <Key size={24} className="sm:size-7" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-base sm:text-lg text-gray-800">دخول سريع بالرمز</h4>
                                                <p className="text-[10px] sm:text-xs text-gray-400 font-bold">للدخول المباشر إذا كان لديك رمز مسبق</p>
                                            </div>
                                            <ChevronRight size={20} className="text-gray-300" />
                                        </motion.button>
                                    ) : (
                                        <motion.div 
                                            key="entry-input"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="bg-gray-50 p-5 sm:p-6 rounded-[2rem] border-2 border-[#006269] space-y-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-black text-gray-800">أدخل رمز الدخول</h4>
                                                <button onClick={() => setShowQuickCodeInput(false)} className="text-gray-400 hover:text-gray-600">
                                                    <X size={18} />
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <input 
                                                    type="text"
                                                    value={quickCodeInput}
                                                    onChange={(e) => setQuickCodeInput(e.target.value.toUpperCase())}
                                                    placeholder="مثال: ROOM-101-ABC"
                                                    className="w-full p-4 bg-white border border-gray-200 rounded-xl font-black text-center tracking-widest outline-none focus:ring-2 focus:ring-[#006269]/20"
                                                    autoFocus
                                                />
                                            </div>
                                            <button 
                                                onClick={() => handleQuickLogin(quickCodeInput)}
                                                className="w-full py-4 bg-[#006269] text-white rounded-xl font-black shadow-lg active:scale-95 transition-all"
                                            >
                                                تأكيد الدخول
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button 
                                    onClick={() => setIsRegistering(true)}
                                    className="w-full p-5 sm:p-6 bg-white border-2 border-gray-100 rounded-[2rem] hover:border-[#cca43b] flex items-center gap-4 sm:gap-5 transition group text-right"
                                >
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-50 rounded-2xl shadow-sm flex items-center justify-center text-[#cca43b] group-hover:rotate-12 transition-transform">
                                        <UserPlus size={24} className="sm:size-7" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-base sm:text-lg text-gray-800">تسجيل نزيل جديد</h4>
                                        <p className="text-[10px] sm:text-xs text-gray-400 font-bold">للحصول على عضوية وتوثيق بياناتك</p>
                                    </div>
                                    <ChevronRight size={20} className="text-gray-300" />
                                </button>

                                <div className="relative py-4">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                                    <div className="relative flex justify-center"><span className="bg-white px-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">أو</span></div>
                                </div>

                                <button 
                                    onClick={() => onSwitchToVisitor?.()}
                                    className="w-full py-4 text-gray-500 font-bold hover:text-[#006269] transition flex items-center justify-center gap-2"
                                >
                                    <Users size={18} />
                                    تصفح كزائر فقط
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>

                <button 
                    onClick={onExit}
                    className="mt-4 sm:mt-8 text-gray-400 font-bold hover:text-[#cca43b] transition flex items-center gap-2 mb-8"
                >
                    <ArrowRight size={18} />
                    العودة للرئيسية
                </button>
            </div>
        );
    }


    if (isRegistering && !booking) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] p-4 sm:p-6" dir="rtl">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <button 
                            onClick={() => {
                                if (registrationType) {
                                    setRegistrationType(null);
                                } else {
                                    setIsRegistering(false);
                                }
                            }} 
                            className="w-11 h-11 sm:w-12 sm:h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-600 active:scale-90 transition-all"
                        >
                            <ArrowRight size={24} />
                        </button>
                        <div className="text-left">
                            <h2 className="text-xl sm:text-2xl font-black text-[#006269]">عضوية النزلاء</h2>
                            <p className="text-gray-400 font-bold text-[10px] sm:text-sm">سجل بياناتك للحصول على كامل الامتيازات</p>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-[2.5rem] sm:rounded-[3rem] shadow-xl p-6 sm:p-8 border border-gray-100 min-h-[400px] flex flex-col justify-center">
                        {!registrationType ? (
                            <div className="space-y-6 animate-fade-in">
                                <div className="text-center mb-8">
                                    <h3 className="text-xl font-black text-gray-800">اختر نوع التسجيل</h3>
                                    <p className="text-sm text-gray-400 font-bold">ساعدنا في توثيق بياناتك بشكل صحيح</p>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => setRegistrationType('new')}
                                        className="bg-gray-50 p-6 rounded-[2.5rem] border-2 border-transparent hover:border-[#006269] flex items-center gap-6 active:scale-95 transition text-right group"
                                    >
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-sm text-[#006269] flex items-center justify-center group-hover:rotate-12 transition-transform shrink-0">
                                            <UserPlus size={32} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-lg text-gray-800">نزيل جديد</h4>
                                            <p className="text-[10px] sm:text-xs text-gray-400 font-bold leading-relaxed">أرغب في حجز غرفة جديدة أو الحصول على عضوية دائمة</p>
                                        </div>
                                        <ChevronRight size={24} className="text-gray-300" />
                                    </button>

                                    <button 
                                        onClick={() => setRegistrationType('companion')}
                                        className="bg-gray-50 p-6 rounded-[2.5rem] border-2 border-transparent hover:border-[#cca43b] flex items-center gap-6 active:scale-95 transition text-right group"
                                    >
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-sm text-[#cca43b] flex items-center justify-center group-hover:rotate-12 transition-transform shrink-0">
                                            <Users size={32} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-lg text-gray-800">نزيل مرافق</h4>
                                            <p className="text-[10px] sm:text-xs text-gray-400 font-bold leading-relaxed">أنا مرافق لنزيل لديه حجز مسبق بالفعل في الفندق</p>
                                        </div>
                                        <ChevronRight size={24} className="text-gray-300" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <GuestRegistrationForm 
                                registrationType={registrationType}
                                onSuccess={() => {
                                    addNotification('تم تسجيلك بنجاح! يرجى التوجه للاستقبال لتأكيد الغرفة.', 'success');
                                    setIsRegistering(false);
                                    setRegistrationType(null);
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center font-sans" dir="rtl" style={{ '--theme-color': themeColor } as any}>
            {/* Desktop Branding Side */}
            <div className="hidden lg:flex flex-col items-center justify-center w-1/2 p-12 pt-24 text-center">
                <div 
                    onClick={handleHiddenClick}
                    className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-2xl mb-8 border-8 cursor-pointer active:scale-95 transition-all" 
                    style={{ borderColor: themeColor }}
                >
                    <Crown size={80} style={{ color: themeColor }} />
                </div>
                <h1 className="text-5xl font-black text-gray-900 mb-4">{settings.appName}</h1>
                <p className="text-xl text-gray-600 font-medium max-w-md">بوابتك الرقمية لتجربة إقامة استثنائية. تصفح الخدمات، تواصل معنا، وتحكم في إقامتك بكل سهولة.</p>
            </div>

            {/* Mobile App Container */}
            <div className="w-full lg:w-[480px] h-[100dvh] lg:h-[90vh] lg:rounded-[3rem] lg:shadow-2xl bg-gray-50 flex flex-col relative overflow-hidden lg:border-8 border-gray-900">
                {/* GUEST ONBOARDING MODAL */}
            {!guestProfile && !hasSkippedOnboarding && (
                <GuestOnboardingModal 
                    onComplete={(profile) => {
                        setGuestProfile(profile);
                        localStorage.setItem('guestProfile', JSON.stringify(profile));
                        addNotification('تم توثيق هويتك بنجاح. أهلاً بك في فندقنا.', 'success');
                    }}
                    onClose={() => {
                        setHasSkippedOnboarding(true);
                        addNotification('يمكنك توثيق هويتك لاحقاً من قسم البيانات', 'info');
                    }}
                />
            )}
            {/* Immersive Header */}
            <header className="relative h-64 shrink-0 overflow-hidden rounded-b-[3.5rem] shadow-sm z-20 border-b border-gray-100" style={{ backgroundColor: themeColor }}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                
                <div className="absolute top-0 left-0 right-0 pt-12 px-6 sm:pt-16 sm:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {onExit && (
                            <button 
                                onClick={onExit}
                                className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 text-white hover:bg-white/20 transition-all active:scale-90"
                            >
                                <ArrowRight size={22} />
                            </button>
                        )}
                        {activeTab !== 'home' && (
                            <button 
                                onClick={handleBack}
                                className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 text-white hover:bg-white/20 transition-all active:scale-90"
                                title="رجوع"
                            >
                                <ArrowRight size={22} />
                            </button>
                        )}
                        <div 
                            onClick={handleHiddenClick}
                            className="flex items-center gap-3 cursor-pointer group active:scale-95 transition-all"
                        >
                            <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 group-hover:bg-gray-50 transition-all">
                                <Crown size={22} style={{ color: themeColor }} />
                            </div>
                            <h1 className="text-white font-black text-xl tracking-tight group-hover:opacity-80 transition-opacity">{settings.appName}</h1>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowThemePicker(true)}
                            className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 text-white hover:bg-white/20 transition-all active:scale-90"
                        >
                            <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: themeColor }}></div>
                        </button>
                        <button onClick={() => setShowNotifications(true)} className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 text-white relative hover:bg-white/20 transition-all active:scale-90">
                            <Bell size={22} />
                            {guestNotifications.length > 0 && (
                                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white/20"></span>
                            )}
                        </button>
                    </div>
                </div>

                <div className="absolute bottom-10 left-8 right-8">
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex justify-between items-end"
                    >
                        <div>
                            <p className="text-white/60 text-[10px] font-black mb-1 uppercase tracking-[0.2em]">أهلاً بك في جناحك</p>
                            <h2 className="text-white text-3xl font-black tracking-tight">غرفة {room.number}</h2>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-[10px] font-black border border-white/20 flex items-center gap-2">
                            <Star size={14} fill="currentColor" /> {guestInfo?.rank || 'ضيف مميز'}
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-5 -mt-6 relative z-30 space-y-8 pb-20 custom-scrollbar">
                
                {/* HOME TAB */}
                {activeTab === 'home' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Self Check-in Banner */}
                        {!isSelfCheckedIn && isSectionVisible('self-check-in') && settings.guestPermissions.allowedActions.includes('can_self_checkin') && (
                            <motion.div 
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
                                onClick={() => setActiveTab('self-check-in')}
                            >
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 text-blue-600">
                                        <FileCheck size={28} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-black text-gray-900 text-lg">تسجيل وصول ذاتي</h3>
                                        <p className="text-xs font-bold text-gray-400">وثق هويتك الآن لتسريع دخولك</p>
                                    </div>
                                    <ArrowRight size={24} className="text-gray-300 group-hover:translate-x-[-5px] transition-transform" />
                                </div>
                            </motion.div>
                        )}

                        {/* Quick Services Pulse - New prominent section */}
                        {isSectionVisible('services') && (
                            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#cca43b] to-transparent opacity-30"></div>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-black text-gray-800 flex items-center gap-2">
                                        <Sparkles size={18} className="text-[#cca43b]" />
                                        الوصول السريع للخدمات
                                    </h3>
                                    <button 
                                        onClick={() => handleTabChange('services')}
                                        className="text-[10px] font-black text-[#cca43b] hover:underline"
                                    >
                                        تصفح الكل
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-4 gap-4">
                                    {[
                                        { id: 'room_service', label: 'خدمة غرف', icon: Coffee, color: 'bg-rose-50 text-rose-600', cat: 'room_service', action: 'can_order_room_service' },
                                        { id: 'restaurant', label: 'المطعم', icon: Utensils, color: 'bg-orange-50 text-orange-600', cat: 'restaurant', action: 'can_order_room_service' },
                                        { id: 'pool', label: 'المسبح', icon: Waves, color: 'bg-cyan-50 text-cyan-600', cat: 'pool', action: 'can_book_facilities' },
                                        { id: 'wifi', label: 'الواي فاي', icon: Wifi, color: 'bg-blue-50 text-blue-600', action: () => setShowWifi(true) },
                                    ].filter(item => !item.action || settings.guestPermissions.allowedActions.includes(item.action)).map(action => (
                                        <button 
                                            key={action.id}
                                            onClick={action.cat ? () => { setServiceCategory(action.cat); handleTabChange('services'); } : (typeof action.action === 'function' ? action.action : undefined)}
                                            className="flex flex-col items-center gap-2 group"
                                        >
                                            <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform border border-white/50`}>
                                                <action.icon size={24} />
                                            </div>
                                            <span className="text-[9px] font-black text-gray-500 truncate w-full text-center">{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick Status / My Stay */}
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-gray-800">حالة الإقامة</h3>
                                <div className="text-[10px] font-black px-3 py-1 rounded-full border" style={{ color: themeColor, borderColor: `${themeColor}30`, backgroundColor: `${themeColor}10` }}>جارية</div>
                            </div>
                            
                            <div className="relative flex justify-between items-center px-4">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-50"></div></div>
                                <div className="relative z-10 flex flex-col items-center gap-2">
                                    <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: themeColor }}></div>
                                    <span className="text-[9px] font-black text-gray-400">وصول</span>
                                </div>
                                <div className="relative z-10 flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 rounded-2xl text-white flex items-center justify-center shadow-md border border-white/20" style={{ backgroundColor: themeColor }}>
                                        <House size={18} />
                                    </div>
                                    <span className="text-[9px] font-black" style={{ color: themeColor }}>اليوم</span>
                                </div>
                                <div className="relative z-10 flex flex-col items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gray-200 border-2 border-white shadow-sm"></div>
                                    <span className="text-[9px] font-black text-gray-400">مغادرة</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-8">
                                {[
                                    { id: 'orders', label: 'طلباتي', icon: Truck, color: 'bg-blue-50 text-blue-500' },
                                    { id: 'registration', label: 'البيانات', icon: FileCheck, color: 'bg-amber-50 text-amber-600' },
                                    { id: 'privacy', label: 'الخصوصية', icon: Shield, color: 'bg-emerald-50 text-emerald-500' },
                                    { id: 'qr', label: 'هويتي', icon: QrCode, color: 'bg-indigo-50 text-indigo-600', action: () => setShowQR(true) },
                                ].filter(item => item.id === 'qr' || isSectionVisible(item.id)).map((item) => (
                                    <button 
                                        key={item.id}
                                        onClick={item.action || (() => handleTabChange(item.id as any))}
                                        className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:bg-gray-50 transition active:scale-95"
                                    >
                                        <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center`}>
                                            <item.icon size={20} />
                                        </div>
                                        <span className="text-[10px] font-black text-gray-700">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Privileges & Access Grid */}
                        <div>
                            <div className="flex justify-between items-center mb-4 px-2">
                                <h3 className="font-black text-lg text-gray-800 flex items-center gap-2">
                                    <Key style={{ color: themeColor }} size={20}/> صلاحياتي ووصولي
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {[
                                    { icon: Key, label: 'المفتاح', color: 'bg-indigo-50 text-indigo-600', active: true, onClick: () => setShowKey(true) },
                                    { icon: Wifi, label: 'واي فاي', color: 'bg-blue-50 text-blue-600', active: true, onClick: () => setShowWifi(true) },
                                    { icon: Waves, label: 'المسبح', color: 'bg-cyan-50 text-cyan-600', active: true, onClick: () => addNotification('دخول المسبح متاح', 'info'), action: 'can_book_facilities' },
                                    { icon: Dumbbell, label: 'النادي', color: 'bg-emerald-50 text-emerald-600', active: true, onClick: () => addNotification('النادي متاح الآن', 'info'), action: 'can_book_facilities' },
                                    { icon: UserPlus, label: 'زائر', color: 'bg-purple-50 text-purple-600', active: true, onClick: () => setShowVisitorPass(true) },
                                    { icon: Car, label: 'السيارة', color: 'bg-amber-50 text-amber-600', active: false, onClick: () => {} },
                                ].filter(item => !item.action || settings.guestPermissions.allowedActions.includes(item.action)).map((priv, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={priv.onClick}
                                        className={`bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 transition-all active:scale-95 ${!priv.active ? 'opacity-50 grayscale' : 'hover:shadow-md hover:border-[#cca43b]/30'}`}
                                    >
                                        <div className={`w-10 h-10 ${priv.color} rounded-xl flex items-center justify-center`}>
                                            <priv.icon size={20} />
                                        </div>
                                        <span className="text-[10px] font-black text-gray-700 text-center truncate w-full px-1">{priv.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Service Showcase (Virtual Review) */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="font-black text-lg text-gray-800 flex items-center gap-2">
                                    <Sparkles style={{ color: themeColor }} size={20}/> استكشف خدماتنا
                                </h3>
                                <button onClick={() => handleTabChange('services')} className="text-xs font-bold text-[#cca43b] flex items-center gap-1">
                                    عرض الكل <ChevronRight size={14} />
                                </button>
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
                                {[
                                    { title: 'المطعم الملكي', desc: 'أشهى المأكولات الجزائرية والعالمية بتوقيع الشيف', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=400&q=80', icon: Utensils, category: 'restaurant' },
                                    { title: 'مقهى التراس', desc: 'إطلالة ساحرة مع أجود أنواع القهوة العالمية', img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80', icon: Coffee, category: 'cafe' },
                                    { title: 'المسبح الأولمبي', desc: 'استمتع بالسباحة في مياهنا الدافئة والمنعشة', img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=400&q=80', icon: Waves, category: 'pool' },
                                    { title: 'القاعة المتعددة', desc: 'مساحة مثالية لاجتماعاتكم وفعالياتكم الخاصة', img: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=400&q=80', icon: MapPin, category: 'hall' },
                                    { title: 'حديقة الفندق', desc: 'هدوء الطبيعة في قلب الفندق، مثالية للاسترخاء', img: 'https://images.unsplash.com/photo-1526398977052-654221a252b1?auto=format&fit=crop&w=400&q=80', icon: Wind, category: 'garden' },
                                ].map((service, idx) => (
                                    <motion.div 
                                        key={idx}
                                        whileHover={{ y: -5 }}
                                        onClick={() => {
                                            setServiceCategory(service.category);
                                            handleTabChange('services');
                                        }}
                                        className="min-w-[240px] bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 shrink-0 group cursor-pointer flex items-center p-4 gap-4"
                                    >
                                        <div className="w-16 h-16 relative overflow-hidden rounded-xl shrink-0 bg-gray-50">
                                            <img src={service.img} alt={service.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" referrerPolicy="no-referrer" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <service.icon size={20} className="text-gray-400 group-hover:text-white transition-colors z-10" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-gray-900 text-sm truncate">{service.title}</h4>
                                            <p className="text-[10px] text-gray-500 font-bold leading-relaxed line-clamp-1">{service.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Services Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { id: 'room_service', label: 'خدمة الغرف', icon: Coffee, color: 'bg-rose-50 text-rose-500' },
                                { id: 'restaurant', label: 'المطعم', icon: Utensils, color: 'bg-orange-50 text-orange-500' },
                                { id: 'pool', label: 'المسبح', icon: Waves, color: 'bg-cyan-50 text-cyan-500' },
                                { id: 'tickets', label: 'تذاكر وحجز', icon: Sparkles, color: 'bg-indigo-50 text-indigo-500' },
                            ].map((item) => (
                                <button 
                                    key={item.id}
                                    onClick={() => {
                                        setServiceCategory(item.id);
                                        handleTabChange('services');
                                    }} 
                                    className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center gap-2 active:scale-95 transition"
                                >
                                    <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center`}>
                                        <item.icon size={24} />
                                    </div>
                                    <span className="font-black text-[10px] text-gray-800">{item.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <button onClick={() => handleTabChange('chat')} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center gap-3 active:scale-95 transition">
                                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
                                    <MessageCircle size={28} />
                                </div>
                                <span className="font-black text-sm text-gray-800">مساعدة فورية</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* BOOKINGS TAB */}
                {activeTab === 'bookings' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="px-2">
                            <h3 className="font-black text-2xl text-gray-800 mb-1">حجوزات المرافق</h3>
                            <p className="text-xs text-gray-500 font-bold">احجز طاولتك أو مكانك في المسبح</p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { id: 'room', label: 'حجز غرفة إضافية', icon: House, color: 'bg-indigo-50 text-indigo-600', desc: 'احجز لأصدقائك أو عائلتك' },
                                { id: 'restaurant', label: 'حجز طاولة مطعم', icon: Utensils, color: 'bg-orange-50 text-orange-600', desc: 'استمتع بعشاء فاخر' },
                                { id: 'cafe', label: 'حجز طاولة مقهى', icon: Coffee, color: 'bg-amber-50 text-amber-600', desc: 'جلسة هادئة مع قهوة مميزة' },
                                { id: 'pool', label: 'تذكرة مسبح / سبا', icon: Waves, color: 'bg-cyan-50 text-cyan-600', desc: 'استرخاء وتجديد نشاط' },
                                { id: 'event', label: 'تذاكر فعاليات', icon: Sparkles, color: 'bg-rose-50 text-rose-600', desc: 'احجز مكانك في فعالياتنا' },
                            ].map((item) => (
                                <button 
                                    key={item.id}
                                    onClick={() => {
                                        sendGuestMessage(token, `طلب حجز جديد: ${item.label}`);
                                        addNotification(`تم إرسال طلب ${item.label}، سيتم التواصل معك للتأكيد.`, 'success');
                                        handleTabChange('chat');
                                    }}
                                    className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6 active:scale-95 transition text-right group"
                                >
                                    <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center group-hover:rotate-12 transition-transform`}>
                                        <item.icon size={32} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-lg text-gray-800">{item.label}</h4>
                                        <p className="text-xs text-gray-400 font-bold">{item.desc}</p>
                                    </div>
                                    <ChevronRight size={24} className="text-gray-300" />
                                </button>
                            ))}
                        </div>

                        <div className="mt-8">
                            <h4 className="font-black text-gray-800 mb-4 px-2">حجوزاتي الحالية</h4>
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                {bookings.filter(b => b.guestToken === token && b.id !== booking.id).length > 0 ? (
                                    <div className="divide-y">
                                        {bookings.filter(b => b.guestToken === token && b.id !== booking.id).map((bkg, idx) => (
                                            <div key={idx} className="p-6 flex justify-between items-center">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                                        <Calendar size={24} />
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-gray-800">{bkg.id.slice(-6)}</div>
                                                        <div className="text-xs text-gray-400">{bkg.checkInDate}</div>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                                                    bkg.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {bkg.status === 'confirmed' ? 'مؤكد' : 'قيد الانتظار'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center text-gray-400 font-bold">
                                        <p>لا توجد حجوزات مرافق حالية</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* FINANCIALS TAB */}
                {activeTab === 'financials' && (
                    <div className="animate-fade-in space-y-4">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-zellige-secondary/10 rounded-full -mr-8 -mt-8"></div>
                            <div className="text-sm text-gray-500 font-bold mb-1">الرصيد المستحق</div>
                            <div className="text-4xl font-black text-gray-900 mb-2">{guestInvoice?.totalAmount || 0} <span className="text-sm text-gray-400 font-medium">د.ج</span></div>
                            <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold ${guestInvoice?.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {guestInvoice?.status === 'paid' ? 'مدفوع بالكامل' : 'غير مدفوع'}
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <h3 className="font-bold p-5 border-b bg-gray-50 text-sm text-gray-700 flex justify-between items-center">
                                <span>تفاصيل الفاتورة</span>
                                <FileText size={16} className="text-gray-400" />
                            </h3>
                            <div className="divide-y">
                                {guestInvoice?.items.map((item, idx) => (
                                    <div key={idx} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                                        <div>
                                            <div className="font-bold text-sm text-gray-800">{item.description}</div>
                                            <div className="text-xs text-gray-500">{item.date}</div>
                                        </div>
                                        <div className="font-bold text-sm font-mono">{item.amount}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* SERVICES TAB (Catalog) */}
                {activeTab === 'services' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="px-2">
                            <h3 className="font-black text-2xl text-gray-800 mb-1">الخدمات</h3>
                            <p className="text-xs text-gray-500 font-bold">اطلب ما تحتاجه</p>
                        </div>
                        <GuestServiceCatalog key={serviceCategory} onOrder={() => setShowCartReview(true)} initialCategory={serviceCategory} themeColor={themeColor} />
                    </div>
                )}

                {/* CHAT TAB */}
                {activeTab === 'chat' && (
                    <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 animate-fade-in">
                        <div className="bg-gray-50 p-4 border-b flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: themeColor }}>
                                        <MessageCircle size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm text-gray-800">مساعدك الشخصي</h4>
                                        <p className="text-[10px] text-green-500 font-bold">متصل الآن</p>
                                    </div>
                                </div>
                                {settings.whatsappNumber && (
                                    <button 
                                        onClick={() => {
                                            const number = settings.whatsappNumber?.replace(/[^\d+]/g, '') || '';
                                            window.open(`https://wa.me/${number}`, '_blank');
                                        }}
                                        className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-xl text-[10px] font-black hover:bg-green-600 transition active:scale-95 shadow-sm"
                                    >
                                        واتساب
                                    </button>
                                )}
                            </div>
                            
                            {/* Recipient Selector */}
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                {[
                                    { id: 'reception', label: 'الاستقبال', icon: User },
                                    { id: 'management', label: 'الإدارة', icon: Shield },
                                    { id: 'facilities', label: 'المرافق', icon: Sparkles }
                                ].map(dept => (
                                    <button
                                        key={dept.id}
                                        onClick={() => setChatRecipient(dept.id as any)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all flex items-center gap-2 ${
                                            chatRecipient === dept.id 
                                            ? 'text-white shadow-md' 
                                            : 'bg-white text-gray-400 border border-gray-100'
                                        }`}
                                        style={{ backgroundColor: chatRecipient === dept.id ? themeColor : undefined }}
                                    >
                                        <dept.icon size={12} />
                                        {dept.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {chatMessages.length === 0 && (
                                <div className="text-center text-gray-400 text-sm mt-10 flex flex-col items-center gap-4">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                                        <MessageCircle size={40} className="opacity-20" />
                                    </div>
                                    <p className="font-bold max-w-[200px]">كيف يمكننا مساعدتك اليوم؟ أرسل لنا أي استفسار.</p>
                                </div>
                            )}
                            {chatMessages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.senderId === token ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-3xl text-sm shadow-sm ${msg.senderId === token ? 'text-white rounded-tl-none' : 'bg-gray-100 text-gray-800 rounded-tr-none'}`} style={{ backgroundColor: msg.senderId === token ? themeColor : undefined }}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleSend} className="p-4 border-t bg-gray-50 flex gap-3">
                            <input 
                                type="text" 
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="اكتب رسالتك..."
                                className="flex-1 border-none bg-white shadow-inner rounded-2xl px-5 py-4 focus:ring-2 text-sm font-bold"
                                style={{ '--tw-ring-color': themeColor } as any}
                            />
                            <button type="submit" className="text-white p-4 rounded-2xl shadow-lg hover:opacity-90 transition active:scale-90" style={{ backgroundColor: themeColor }}>
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                )}

                {/* SELF CHECK-IN TAB */}
                {activeTab === 'self-check-in' && (
                    <div className="animate-fade-in space-y-4">
                        <button 
                            onClick={handleBack}
                            className="flex items-center gap-2 text-gray-500 font-bold px-2 hover:text-zellige-primary transition"
                        >
                            <ArrowRight size={18} /> العودة للرئيسية
                        </button>
                        <SelfCheckInForm 
                            bookingId={booking.id} 
                            onSuccess={() => handleTabChange('home')} 
                            themeColor={themeColor}
                        />
                    </div>
                )}

                {/* ORDERS TAB */}
                {activeTab === 'orders' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="px-2">
                            <h3 className="font-black text-2xl text-gray-800 mb-1">تتبع طلباتي</h3>
                            <p className="text-xs text-gray-500 font-bold">متابعة حالة طلبات الطعام والخدمات</p>
                        </div>

                        <div className="space-y-4">
                            {guestOrders.length > 0 ? (
                                guestOrders.map((order) => (
                                    <div key={order.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                                                    <Utensils size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-gray-800">طلب #{order.id.slice(-4)}</h4>
                                                    <p className="text-[10px] text-gray-400 font-bold">{new Date(order.timestamp).toLocaleTimeString('ar-DZ')}</p>
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-black ${
                                                order.status === 'completed' || order.status === 'served' ? 'bg-emerald-100 text-emerald-700' :
                                                order.status === 'preparing' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {order.status === 'pending' ? 'بانتظار التأكيد' :
                                                 order.status === 'preparing' ? 'قيد التحضير' :
                                                 (order.status === 'completed' || order.status === 'served') ? 'تم التوصيل' : 'ملغي'}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {order.items.map((item, i) => (
                                                <div key={i} className="flex justify-between text-xs font-bold">
                                                    <span className="text-gray-500">{item.quantity}x {item.item.name}</span>
                                                    <span className="text-gray-800">{item.item.price * item.quantity} د.ج</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-4 border-t flex justify-between items-center">
                                            <span className="text-xs font-black text-gray-400">الإجمالي</span>
                                            <span className="text-lg font-black text-brand-green">{order.totalAmount} د.ج</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
                                    <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
                                    <p className="text-gray-400 font-bold">لا توجد طلبات حالية</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* REGISTRATION TAB */}
                {activeTab === 'registration' && (
                    <div className="animate-fade-in space-y-4">
                        <button 
                            onClick={handleBack}
                            className="flex items-center gap-2 text-gray-500 font-bold px-2 hover:text-zellige-primary transition"
                        >
                            <ArrowRight size={18} /> العودة للرئيسية
                        </button>
                        <GuestRegistrationForm bookingId={booking.id} onSuccess={() => handleTabChange('home')} />
                    </div>
                )}

                {/* PRIVACY TAB */}
                {activeTab === 'privacy' && (
                    <div className="animate-fade-in space-y-4">
                        <button 
                            onClick={handleBack}
                            className="flex items-center gap-2 text-gray-500 font-bold px-2 hover:text-zellige-primary transition"
                        >
                            <ArrowRight size={18} /> العودة للرئيسية
                        </button>
                        <GuestPrivacyForm bookingId={booking.id} onSuccess={() => handleTabChange('home')} />
                    </div>
                )}

                {activeTab === 'guide' && (
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 space-y-6 animate-fade-in">
                        <h3 className="text-xl font-black text-gray-800 border-b pb-4">دليل الإقامة والخدمات</h3>
                        <div className="space-y-4">
                            {[
                                { title: 'المطعم الرئيسي', desc: 'يقدم أشهى المأكولات الجزائرية والعالمية', time: '07:00 - 23:00' },
                                { title: 'المسبح الأولمبي', desc: 'مسبح خارجي مدفأ مع إطلالة ساحرة', time: '08:00 - 20:00' },
                                { title: 'النادي الصحي', desc: 'خدمات سبا ومساج وجيم متكامل', time: '09:00 - 21:00' },
                                { title: 'خدمة التوصيل', desc: 'نصلك أينما كنت داخل محيط الفندق', time: '24/7' }
                            ].map((item, i) => (
                                <div key={i} className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                                    <div>
                                        <h4 className="font-black text-sm text-gray-900">{item.title}</h4>
                                        <p className="text-[10px] text-gray-500 font-bold">{item.desc}</p>
                                    </div>
                                    <div className="text-[10px] font-black text-[#006269] bg-white px-2 py-1 rounded-lg border border-gray-100">
                                        {item.time}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* BOTTOM NAVIGATION */}
            <nav className="fixed bottom-0 w-full bg-white/80 backdrop-blur-2xl border-t border-gray-100 pb-safe z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
                <div className="flex justify-around items-center p-3 relative">
                    {[
                        { id: 'home', icon: House, label: 'الرئيسية' },
                        { id: 'bookings', icon: Calendar, label: 'الحجوزات' },
                        { id: 'services', icon: ShoppingBag, label: 'الخدمات', isCenter: true },
                        { id: 'financials', icon: DollarSign, label: 'الفاتورة' },
                        { id: 'chat', icon: MessageCircle, label: 'المحادثة' },
                        { id: 'guide', icon: FileText, label: 'الدليل' },
                    ].filter(tab => tab.id === 'home' || isSectionVisible(tab.id)).map((tab) => {
                        if (tab.isCenter) {
                            return (
                                <div key={tab.id} className="-mt-12 relative">
                                    <div className="absolute inset-0 blur-xl opacity-20 animate-pulse" style={{ backgroundColor: themeColor }}></div>
                                    <button 
                                        onClick={() => {
                                            setServiceCategory('all');
                                            handleTabChange('services');
                                        }}
                                        className={`relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center border-4 border-white transition-all duration-500 ${activeTab === 'services' ? 'text-white rotate-12' : 'bg-white'}`}
                                        style={{ backgroundColor: activeTab === 'services' ? themeColor : 'white', color: activeTab === 'services' ? 'white' : themeColor }}
                                    >
                                        <tab.icon size={28} />
                                    </button>
                                </div>
                            );
                        }
                        return (
                            <button 
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id as any)}
                                className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${activeTab === tab.id ? 'scale-110' : 'text-gray-300'}`}
                                style={{ color: activeTab === tab.id ? themeColor : undefined }}
                            >
                                <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                                <span className="text-[9px] font-black">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* QR MODAL */}
            {showQR && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowQR(false)}>
                    <div className="bg-white rounded-[3rem] p-8 w-full max-w-sm md:max-w-2xl text-center relative overflow-y-auto max-h-[90vh] custom-scrollbar shadow-2xl border border-white/20" onClick={e => e.stopPropagation()}>
                        {/* Drag Handle for Mobile */}
                        <div className="drag-handle mb-4"></div>
                        
                        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-[#006269] to-[#cca43b]"></div>
                        
                        <div className="absolute top-6 right-6">
                            <button 
                                onClick={() => setShowQR(false)} 
                                className="p-3 bg-gray-100/80 backdrop-blur-sm rounded-2xl text-gray-500 hover:bg-gray-200 transition-all active:scale-90"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="mb-8 mt-4">
                            <div className="w-16 h-16 bg-[#006269]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <QrCode size={32} className="text-[#006269]" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-800 mb-1">هويتي الرقمية</h2>
                            <p className="text-gray-500 text-sm font-bold">أظهر هذا الرمز للطاقم عند الطلب</p>
                        </div>

                        <div className="bg-white p-6 rounded-[2.5rem] shadow-inner border border-gray-100 inline-block mb-8 relative group">
                            <QRCodeSVG 
                                value={generateSecureToken({
                                    t: 'GUEST_CODE',
                                    i: booking.id,
                                    n: booking.primaryGuestName,
                                    m: { membershipCode: guestProfile?.membershipCode || 'GUEST-' + booking.id.slice(-4) }
                                })} 
                                size={220} 
                                level="H" 
                                includeMargin={true}
                            />
                            <div className="absolute inset-0 border-2 border-dashed border-gray-100 rounded-[2.5rem] pointer-events-none"></div>
                        </div>

                        <div className="bg-[#006269]/5 p-5 rounded-2xl border border-[#006269]/10 mb-8">
                            <div className="text-[10px] text-[#006269] font-black uppercase tracking-[0.2em] mb-2">رمز الانتماء الخاص بك</div>
                            <div className="text-3xl font-mono font-black text-[#006269] tracking-[0.3em]">{guestProfile?.membershipCode || 'GUEST-' + booking.id.slice(-4)}</div>
                        </div>

                        <div className="space-y-4">
                            <button 
                                onClick={() => setShowQR(false)}
                                className="w-full py-5 bg-[#006269] text-white rounded-[1.5rem] font-black shadow-xl shadow-[#006269]/20 flex items-center justify-center gap-3 active:scale-95 transition-all text-lg"
                            >
                                <ArrowRight size={24} />
                                إخفاء البطاقة واستخدام التطبيق
                            </button>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={async () => {
                                        const token = generateSecureToken({
                                            t: 'GUEST_CODE',
                                            i: booking.id,
                                            n: booking.primaryGuestName,
                                            m: { membershipCode: guestProfile?.membershipCode || 'GUEST-' + booking.id.slice(-4) }
                                        });
                                        const shareData = {
                                            title: 'رمز تسجيل النزيل',
                                            text: `رمز التسجيل الخاص بك في ${settings.appName}`,
                                            url: `${window.location.origin}/guest?token=${token}`
                                        };
                                        try {
                                            if (navigator.share) {
                                                await navigator.share(shareData);
                                            } else {
                                                navigator.clipboard.writeText(token);
                                                addNotification('تم نسخ الرمز للحافظة', 'success');
                                            }
                                        } catch (err) {
                                            console.error(err);
                                        }
                                    }}
                                    className="py-4 bg-gray-100 text-gray-600 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    <Share2 size={18} />
                                    مشاركة
                                </button>
                                <button 
                                    onClick={() => {
                                        setShowQR(false);
                                        handleTabChange('services');
                                        addNotification('مرحباً بك! يمكنك الآن طلب الخدمات مباشرة', 'success');
                                    }}
                                    className="py-4 bg-[#cca43b]/10 text-[#cca43b] rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-[#cca43b]/20 transition-all active:scale-95"
                                >
                                    <ShoppingBag size={18} />
                                    الخدمات
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center gap-8">
                            <div className="flex flex-col items-center gap-1 text-gray-400">
                                <div className="p-3 bg-gray-50 rounded-full"><Users size={20} /></div>
                                <span className="text-[10px] font-black uppercase tracking-wider">المرافقين</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 text-gray-400">
                                <div className="p-3 bg-gray-50 rounded-full"><ShieldCheck size={20} /></div>
                                <span className="text-[10px] font-black uppercase tracking-wider">موثق</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* NOTIFICATIONS MODAL */}
            {showNotifications && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end animate-fade-in" onClick={() => setShowNotifications(false)}>
                    <div className="bg-white w-full max-w-md md:max-w-2xl h-full shadow-2xl flex flex-col relative" onClick={e => e.stopPropagation()}>
                        <div className="drag-handle md:hidden absolute top-2 left-1/2 -translate-x-1/2 z-50"></div>
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50 pt-8">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <ArrowRight size={20} />
                                </button>
                                <h2 className="font-bold text-lg">الإشعارات</h2>
                            </div>
                            <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {guestNotifications.length === 0 && (
                                <div className="text-center text-gray-400 py-10">
                                    <Bell size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>لا توجد إشعارات جديدة</p>
                                </div>
                            )}
                            {guestNotifications.map(notif => (
                                <div key={notif.id} className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm flex gap-3">
                                    <div className={`w-2 h-full rounded-full ${notif.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-800">{notif.message}</h4>
                                        {notif.details && <p className="text-xs text-gray-500 mt-1">{notif.details}</p>}
                                        <span className="text-[10px] text-gray-400 mt-2 block">{notif.timestamp}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* WIFI MODAL */}
            {showWifi && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowWifi(false)}>
                    <div className="bg-white rounded-3xl p-8 w-full max-w-sm md:max-w-2xl text-center relative overflow-y-auto max-h-[90vh] custom-scrollbar" onClick={e => e.stopPropagation()}>
                        <div className="drag-handle mb-2"></div>
                        <div className="absolute top-0 left-0 w-full h-3 bg-blue-500"></div>
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button onClick={() => setShowWifi(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                                <ArrowRight size={20} />
                            </button>
                            <button onClick={() => setShowWifi(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="mb-6 mt-6">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mx-auto mb-4">
                                <Wifi size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-800 mb-1">واي فاي</h2>
                            <p className="text-gray-500 text-sm">بيانات الاتصال</p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-right">
                                <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">اسم الشبكة (SSID)</div>
                                <div className="text-lg font-black text-gray-800">Hotel_Guest_WiFi</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-right">
                                <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">كلمة المرور</div>
                                <div className="text-lg font-black text-gray-800">Welcome2024</div>
                            </div>
                        </div>

                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText('Welcome2024');
                                addNotification('تم نسخ كلمة المرور', 'success');
                            }}
                            className="w-full mt-6 bg-blue-600 text-white p-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition"
                        >
                            نسخ كلمة المرور
                        </button>
                    </div>
                </div>
            )}

            {/* DIGITAL KEY MODAL */}
            {showKey && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowKey(false)}>
                    <div className="bg-white rounded-3xl p-8 w-full max-w-sm md:max-w-2xl text-center relative overflow-y-auto max-h-[90vh] custom-scrollbar" onClick={e => e.stopPropagation()}>
                        <div className="drag-handle mb-2"></div>
                        <div className="absolute top-0 left-0 w-full h-3 bg-indigo-500"></div>
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button onClick={() => setShowKey(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                                <ArrowRight size={20} />
                            </button>
                            <button onClick={() => setShowKey(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="mb-6 mt-6">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 mx-auto mb-4">
                                <Key size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-800 mb-1">المفتاح</h2>
                            <p className="text-gray-500 text-sm">افتح الباب</p>
                        </div>

                        <div className="bg-indigo-50 p-8 rounded-full w-48 h-48 mx-auto flex items-center justify-center border-4 border-white shadow-inner relative">
                            <div className="absolute inset-0 bg-indigo-400/20 rounded-full animate-ping"></div>
                            <Key size={64} className="text-indigo-600 relative z-10" />
                        </div>

                        <div className="mt-8">
                            <div className="text-sm font-black text-indigo-600">غرفة {room.number}</div>
                            <div className="text-[10px] text-gray-400 font-bold">صالح حتى: {booking.checkOutDate}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* VISITOR PASS MODAL */}
            {showVisitorPass && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowVisitorPass(false)}>
                    <div className="bg-white rounded-3xl p-8 w-full max-w-sm md:max-w-2xl text-center relative overflow-y-auto max-h-[90vh] custom-scrollbar" onClick={e => e.stopPropagation()}>
                        <div className="drag-handle mb-2"></div>
                        <div className="absolute top-0 left-0 w-full h-3" style={{ backgroundColor: themeColor }}></div>
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button onClick={() => setShowVisitorPass(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                                <ArrowRight size={20} />
                            </button>
                            <button onClick={() => setShowVisitorPass(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="mb-6 mt-6">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${themeColor}15`, color: themeColor }}>
                                <UserPlus size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-800 mb-1">زائر</h2>
                            <p className="text-gray-500 text-sm">تصريح دخول</p>
                        </div>

                        <div className="space-y-4 text-right">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase px-2">اسم الزائر</label>
                                <input type="text" placeholder="أدخل اسم الزائر..." className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold mt-1" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase px-2">تاريخ الزيارة</label>
                                <input type="date" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold mt-1" />
                            </div>
                        </div>

                        <button 
                            onClick={() => {
                                addNotification('تم إنشاء تصريح الزيارة بنجاح', 'success');
                                setShowVisitorPass(false);
                            }}
                            className="w-full mt-6 text-white p-4 rounded-2xl font-black shadow-lg transition"
                            style={{ backgroundColor: themeColor }}
                        >
                            إصدار التصريح
                        </button>
                    </div>
                </div>
            )}

            {/* TICKET QR MODAL */}
            <AnimatePresence>
                {showTicketQR && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
                        onClick={() => setShowTicketQR(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] p-8 w-full max-w-sm md:max-w-2xl text-center relative overflow-y-auto max-h-[90vh] custom-scrollbar shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="drag-handle mb-2"></div>
                            <div className="absolute top-0 left-0 w-full h-3" style={{ backgroundColor: themeColor }}></div>
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button onClick={() => setShowTicketQR(null)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                                    <ArrowRight size={20} />
                                </button>
                                <button onClick={() => setShowTicketQR(null)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="mb-8 mt-6">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner" style={{ backgroundColor: `${themeColor}15`, color: themeColor }}>
                                    <Sparkles size={32} />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 mb-2">{showTicketQR.title}</h2>
                                <p className="text-gray-500 text-sm font-bold">رمز التذكرة الخاص بك</p>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-[2rem] inline-block mb-8 shadow-inner border border-gray-100">
                                <QRCodeSVG 
                                    value={showTicketQR.token} 
                                    size={200}
                                    level="H"
                                    includeMargin={false}
                                    fgColor={themeColor}
                                    bgColor="transparent"
                                />
                            </div>

                            <div className="space-y-3">
                                <button 
                                    onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({
                                                title: showTicketQR.title,
                                                text: 'تذكرتي من الفندق',
                                                url: window.location.href
                                            }).catch(console.error);
                                        } else {
                                            navigator.clipboard.writeText(showTicketQR.token);
                                            addNotification('تم نسخ الرمز', 'success');
                                        }
                                    }}
                                    className="w-full text-white p-4 rounded-2xl font-black shadow-lg shadow-black/5 hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    style={{ backgroundColor: themeColor }}
                                >
                                    <Share2 size={20} />
                                    مشاركة التذكرة
                                </button>
                                <button 
                                    onClick={() => setShowTicketQR(null)}
                                    className="w-full text-gray-500 p-4 rounded-2xl font-black bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    إغلاق
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Theme Picker Modal */}
            <AnimatePresence>
                {showThemePicker && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6"
                        onClick={() => setShowThemePicker(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] p-8 w-full max-w-sm md:max-w-2xl space-y-6 relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="drag-handle mb-2"></div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-black text-gray-900">تخصيص المظهر</h3>
                                <p className="text-gray-500 text-sm font-bold">اختر لونك المفضل للواجهة</p>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {colors.map(color => (
                                    <button 
                                        key={`${color.name}-${color.value}`}
                                        onClick={() => {
                                            setThemeColor(color.value);
                                            localStorage.setItem('guestTheme', color.value);
                                            setShowThemePicker(false);
                                            addNotification(`تم تغيير المظهر إلى ${color.name}`, 'success');
                                        }}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${themeColor === color.value ? 'bg-gray-50 ring-2 ring-offset-2' : 'hover:bg-gray-50'}`}
                                        style={{ '--tw-ring-color': color.value } as any}
                                    >
                                        <div className="w-10 h-10 rounded-full shadow-sm" style={{ backgroundColor: color.value }}></div>
                                        <span className="text-[10px] font-black text-gray-600">{color.name}</span>
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={() => setShowThemePicker(false)}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black"
                            >
                                إغلاق
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CART REVIEW MODAL */}
            <CartReviewModal
                isOpen={showCartReview}
                onClose={() => setShowCartReview(false)}
                items={cart}
                onUpdateQuantity={updateCartItemQuantity}
                onUpdateNotes={updateCartItemNotes}
                onRemove={removeFromCart}
                onConfirm={handleOrder}
                themeColor={themeColor}
            />

            {/* Floating Cart Button (Global) */}
            <AnimatePresence>
                {cart.length > 0 && activeTab !== 'services' && (
                    <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="fixed bottom-24 left-6 z-[45]"
                    >
                        <button 
                            onClick={() => setShowCartReview(true)}
                            className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white relative"
                            style={{ backgroundColor: themeColor, boxShadow: `0 10px 25px ${themeColor}66` }}
                        >
                            <ShoppingBag size={24} />
                            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                                {cart.reduce((acc, item) => acc + item.quantity, 0)}
                            </span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            </div>
        </div>
    );
}
