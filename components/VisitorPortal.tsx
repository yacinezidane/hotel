import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { 
    House, ShoppingBag, FileText, MessageCircle, Info, 
    MapPin, Star, Utensils, Waves, Coffee, ArrowRight,
    Bell, QrCode, X, Send, MessageSquare, ChevronRight,
    User, Phone, Sparkles, Car, Share2, Shield, Check, Wind
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GuestServiceCatalog } from './GuestServiceCatalog';
import { CartReviewModal } from './CartReviewModal';
import { HotelQRCode } from './HotelQRCode';
import { QRCodeSVG } from 'qrcode.react';
import { generateSecureToken } from '../utils/qrCrypto';

interface VisitorPortalProps {
    guestProfile?: { name: string, phone: string, idNumber: string, membershipCode: string };
    onExit: () => void;
    onLogoClick?: () => void;
    initialTab?: 'home' | 'services' | 'guide' | 'chat';
}

export const VisitorPortal: React.FC<VisitorPortalProps> = ({ guestProfile: initialProfile, onExit, onLogoClick, initialTab }) => {
    const { 
        settings, messages, sendGuestMessage, 
        addNotification, addQRRecord, cart, clearCart,
        updateCartItemQuantity, removeFromCart, updateCartItemNotes
    } = useHotel();
    const [guestProfile, setGuestProfile] = useState(initialProfile);
    const [isRegistering, setIsRegistering] = useState(!initialProfile);
    const [regStatus, setRegStatus] = useState<'form' | 'pending' | 'scanning'>('form');
    const [activeTab, setActiveTab] = useState<'home' | 'services' | 'guide' | 'chat'>(initialTab || 'home');
    const [tabHistory, setTabHistory] = useState<string[]>([]);
    const [showQR, setShowQR] = useState(false);
    const [showCartReview, setShowCartReview] = useState(false);
    const [chatRecipient, setChatRecipient] = useState<'reception' | 'management' | 'facilities'>('reception');
    const [hiddenClicks, setHiddenClicks] = useState(0);
    const [lastClickTime, setLastClickTime] = useState(0);
    const [regData, setRegData] = useState({ name: '', phone: '', hotelCode: '' });
    const [input, setInput] = useState('');
    const colors = [
        { name: 'الافتراضي (النظام)', value: settings.theme.includes('zellige') ? '#006269' : '#cca43b' },
        { name: 'ذهبي', value: '#cca43b' },
        { name: 'زمردي', value: '#006269' },
        { name: 'ياقوتي', value: '#9b2226' },
        { name: 'نيلي', value: '#1d3557' },
        { name: 'بنفسجي', value: '#5a189a' },
    ];

    const [themeColor, setThemeColor] = useState(() => {
        const saved = localStorage.getItem('visitorTheme');
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
    const [showHotelQR, setShowHotelQR] = useState(false);
    const [serviceCategory, setServiceCategory] = useState<string>('all');
    const [showTicketQR, setShowTicketQR] = useState<{ token: string, title: string } | null>(null);

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

    const handleTabChange = (tab: any) => {
        if (tab === activeTab) return;
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

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (!regData.name || !regData.phone) {
            addNotification('يرجى إكمال جميع البيانات', 'warning');
            return;
        }
        
        // Simulate sending to admin
        setRegStatus('pending');
        addNotification('تم إرسال طلبك، يرجى الانتظار للمصادقة', 'info');
        
        // For demo purposes, auto-approve after 3 seconds
        setTimeout(() => {
            const newProfile = {
                name: regData.name,
                phone: regData.phone,
                idNumber: 'VISITOR',
                membershipCode: `V-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
            };
            setGuestProfile(newProfile);
            setIsRegistering(false);
        }, 3000);
    };

    if (isRegistering) {
        return (
            <div className="h-[100dvh] bg-[#FDFBF7] flex flex-col font-sans overflow-y-auto custom-scrollbar" dir="rtl">
                <div className="min-h-full flex flex-col items-center justify-start sm:justify-center p-4 sm:p-8 py-12">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-md bg-white p-5 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl border border-gray-100 space-y-4 sm:space-y-8"
                    >
                        {regStatus === 'form' && (
                            <>
                                <div className="flex justify-between items-center mb-2">
                                    <button 
                                        onClick={onExit}
                                        className="p-2 sm:p-3 bg-gray-100 rounded-xl sm:rounded-2xl text-gray-500 hover:bg-gray-200 transition-all flex items-center gap-2"
                                        title="رجوع"
                                    >
                                        <ArrowRight size={18} />
                                        <span className="text-xs font-bold sm:hidden">خروج</span>
                                    </button>
                                    <button 
                                        onClick={() => setShowHotelQR(true)}
                                        className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-900 text-white rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black shadow-lg"
                                    >
                                        <QrCode size={12} />
                                        رمز الفندق
                                    </button>
                                </div>
                                <div className="text-center space-y-2 sm:space-y-4">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mx-auto shadow-inner" style={{ backgroundColor: `${themeColor}15`, color: themeColor }}>
                                        <Star size={32} />
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900">تسجيل زائر</h2>
                                    <p className="text-xs sm:text-sm text-gray-500 font-bold">يرجى إدخال بياناتك للمصادقة أو مسح رمز الفندق</p>
                                </div>

                                <form onSubmit={handleRegister} className="space-y-6">
                                    <div className="bg-gray-50 p-6 rounded-[2rem] space-y-6 border border-gray-100">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 px-2">
                                                <User size={14} className="text-gray-400" />
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الاسم الكامل</label>
                                            </div>
                                            <input 
                                                type="text" 
                                                required
                                                value={regData.name}
                                                onChange={e => setRegData(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full p-4 bg-white border border-gray-100 rounded-xl focus:ring-2 font-bold text-sm"
                                                style={{ '--tw-ring-color': themeColor } as any}
                                                placeholder="أدخل اسمك الكامل"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 px-2">
                                                <Phone size={14} className="text-gray-400" />
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">رقم الهاتف</label>
                                            </div>
                                            <input 
                                                type="tel" 
                                                required
                                                value={regData.phone}
                                                onChange={e => setRegData(prev => ({ ...prev, phone: e.target.value }))}
                                                className="w-full p-4 bg-white border border-gray-100 rounded-xl focus:ring-2 font-bold text-sm tracking-widest"
                                                style={{ '--tw-ring-color': themeColor } as any}
                                                placeholder="05XXXXXXXX"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        type="submit"
                                        className="w-full py-5 text-white rounded-[1.5rem] font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                                        style={{ backgroundColor: themeColor, boxShadow: `0 20px 40px ${themeColor}33` }}
                                    >
                                        إرسال طلب المصادقة
                                    </button>
                                </form>

                                <div className="relative py-4">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-gray-400 font-bold">أو</span></div>
                                </div>

                                <button 
                                    onClick={() => setRegStatus('scanning')}
                                    className="w-full py-4 sm:py-5 bg-gray-900 text-white rounded-xl sm:rounded-2xl font-black text-base sm:text-lg shadow-xl flex items-center justify-center gap-3 hover:bg-black transition-all"
                                >
                                    <QrCode size={20} />
                                    مسح رمز الاستقبال
                                </button>
                            </>
                        )}

                        {regStatus === 'pending' && (
                            <div className="text-center space-y-6 sm:space-y-8 py-6 sm:py-10">
                                <div className="flex justify-start">
                                    <button 
                                        onClick={() => setRegStatus('form')}
                                        className="p-2 sm:p-3 bg-gray-100 rounded-xl sm:rounded-2xl text-gray-500 hover:bg-gray-200 transition-all flex items-center gap-2"
                                        title="تعديل البيانات"
                                    >
                                        <ArrowRight size={18} />
                                        <span className="text-xs font-bold">تعديل</span>
                                    </button>
                                </div>
                                <div className="relative">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[2.5rem] flex items-center justify-center mx-auto animate-pulse" style={{ backgroundColor: `${themeColor}15`, color: themeColor }}>
                                        <Bell size={40} />
                                    </div>
                                    <div className="absolute top-0 right-1/2 translate-x-10 sm:translate-x-12 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-4 border-white animate-bounce" style={{ backgroundColor: themeColor }}></div>
                                </div>
                                <div className="space-y-2 sm:space-y-4">
                                    <h3 className="text-xl sm:text-2xl font-black text-gray-900">في انتظار المصادقة...</h3>
                                    <p className="text-xs sm:text-sm text-gray-500 font-bold leading-relaxed">
                                        تم إرسال بياناتك بنجاح إلى موظف الاستقبال. يرجى الانتظار لحظات ريثما يتم تفعيل دخولك.
                                    </p>
                                </div>
                                <div className="flex justify-center gap-2">
                                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-bounce" style={{ backgroundColor: themeColor, animationDelay: '0ms' }}></div>
                                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-bounce" style={{ backgroundColor: themeColor, animationDelay: '150ms' }}></div>
                                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-bounce" style={{ backgroundColor: themeColor, animationDelay: '300ms' }}></div>
                                </div>
                                
                                <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
                                    <button 
                                        onClick={() => setRegStatus('scanning')}
                                        className="w-full py-3 sm:py-4 bg-gray-900 text-white rounded-xl sm:rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-black transition-all text-sm sm:text-base"
                                    >
                                        <QrCode size={18} />
                                        أو امسح رمز الاستقبال الآن
                                    </button>
                                </div>
                            </div>
                        )}

                        {regStatus === 'scanning' && (
                            <div className="text-center space-y-6 sm:space-y-8">
                                <div className="flex justify-start">
                                    <button 
                                        onClick={() => setRegStatus('form')}
                                        className="p-2 sm:p-3 bg-gray-100 rounded-xl sm:rounded-2xl text-gray-500 hover:bg-gray-200 transition-all flex items-center gap-2"
                                        title="رجوع"
                                    >
                                        <ArrowRight size={18} />
                                        <span className="text-xs font-bold">رجوع</span>
                                    </button>
                                </div>
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 text-gray-900 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mx-auto">
                                    <QrCode size={32} />
                                </div>
                                <div className="space-y-2 sm:space-y-4">
                                    <h3 className="text-xl sm:text-2xl font-black text-gray-900">مسح الرمز</h3>
                                    <p className="text-xs sm:text-sm text-gray-500 font-bold">قم بمسح رمز الاستجابة السريع الموجود في مكتب الاستقبال</p>
                                </div>
                                <div className="aspect-square bg-gray-900 rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden relative border-4 border-white shadow-2xl">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-48 h-48 sm:w-64 sm:h-64 border-2 rounded-2xl sm:rounded-3xl animate-pulse relative" style={{ borderColor: themeColor }}>
                                            <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-t-4 border-l-4 -mt-1 -ml-1" style={{ borderColor: themeColor }}></div>
                                            <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-t-4 border-r-4 -mt-1 -mr-1" style={{ borderColor: themeColor }}></div>
                                            <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-b-4 border-l-4 -ml-1 -mb-1" style={{ borderColor: themeColor }}></div>
                                            <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-b-4 border-r-4 -mr-1 -mb-1" style={{ borderColor: themeColor }}></div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-white/50 text-[10px] sm:text-xs font-bold">جاري البحث عن رمز...</div>
                                </div>
                                <button 
                                    onClick={() => setRegStatus('form')}
                                    className="w-full py-3 sm:py-4 bg-gray-100 text-gray-600 rounded-xl sm:rounded-2xl font-black hover:bg-gray-200 transition-all text-sm sm:text-base"
                                >
                                    العودة للتسجيل اليدوي
                                </button>
                            </div>
                        )}

                        <button 
                            onClick={onExit}
                            className="w-full text-gray-400 font-bold text-xs sm:text-sm hover:text-gray-600 transition-colors py-2"
                        >
                            إلغاء والعودة
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    const chatMessages = messages.filter(m => m.senderId === guestProfile?.membershipCode || m.receiverId === guestProfile?.membershipCode);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if(!input.trim() || !guestProfile) return;
        sendGuestMessage(guestProfile.membershipCode, input, chatRecipient);
        setInput('');
    };

    const handleOrder = (items: any[]) => {
        if (!guestProfile) return;
        const orderSummary = items.map(i => {
            let detailsStr = '';
            if (i.details) {
                const forWhom = i.details.forWhom === 'self' ? 'نفسي' : 'آخرين';
                const dateStr = i.details.date;
                const timeStr = i.details.time;
                
                let roomInfo = '';
                if (i.details.roomDetails) {
                    const rd = i.details.roomDetails;
                    const typeLabel = rd.type === 'single' ? 'مفردة' : (rd.type === 'double' ? 'مزدوجة' : 'جناح');
                    const classLabel = rd.classification === 'standard' ? 'قياسية' : (rd.classification === 'deluxe' ? 'ديلوكس' : 'فاخرة');
                    const servicesCount = rd.additionalServices?.length || 0;
                    roomInfo = ` [غرفة ${typeLabel} ${classLabel}${servicesCount > 0 ? ` + ${servicesCount} خدمات` : ''}]`;
                }
                
                detailsStr = ` (لـ: ${forWhom}، ${dateStr} ${timeStr}${roomInfo})`;
            }
            const itemName = i.item?.name || i.name;
            return `${i.quantity}x ${itemName}${detailsStr}`;
        }).join('، ');
        
        sendGuestMessage(guestProfile.membershipCode, `طلب زائر جديد: ${orderSummary}`);
        addNotification('تم استلام طلبك كزائر، سيتم التواصل معك قريباً!', 'success');
        
        // Check if any item is a ticket or facility booking for others
        const ticketItem = items.find(i => {
            const cat = i.item?.category || i.category;
            return cat === 'tickets' || cat === 'pool' || cat === 'hall';
        });

        if (ticketItem && ticketItem.details) {
            const itemName = ticketItem.item?.name || ticketItem.name;
            const category = ticketItem.item?.category || ticketItem.category;
            const ticketId = `TKT-${Date.now()}`;
            
            // Include room details in token if they exist
            const ticketToken = generateSecureToken({
                t: 'TICKET',
                i: ticketId,
                n: itemName,
                m: { 
                    guestName: guestProfile.name,
                    quantity: ticketItem.quantity,
                    date: ticketItem.details.date,
                    time: ticketItem.details.time,
                    forWhom: ticketItem.details.forWhom,
                    roomDetails: ticketItem.details.roomDetails || undefined
                }
            });
            
            addQRRecord({
                type: category === 'pool' ? 'pool_pass' : (category === 'hall' ? 'hall' : 'guest_service'),
                referenceId: ticketId,
                title: itemName,
                subtitle: ticketItem.details.roomDetails 
                    ? `حجز غرفة ${ticketItem.details.roomDetails.type === 'single' ? 'مفردة' : 'مزدوجة'}`
                    : `تذكرة لـ ${ticketItem.details.forWhom === 'self' ? 'نفسي' : 'آخرين'}`,
                status: 'valid',
                dataPayload: ticketToken
            }, 'multi_use');

            setShowTicketQR({ token: ticketToken, title: itemName });
        } else {
            handleTabChange('chat');
        }

        clearCart();
        setShowCartReview(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center font-sans" dir="rtl" style={{ '--theme-color': themeColor } as any}>
            {/* Desktop Branding Side */}
            <div className="hidden lg:flex flex-col items-center justify-center w-1/2 p-12 pt-24 text-center">
                <div 
                    onClick={handleHiddenClick}
                    className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-2xl mb-8 border-8 cursor-pointer active:scale-95 transition-all" 
                    style={{ borderColor: themeColor }}
                >
                    <Star size={80} style={{ color: themeColor }} />
                </div>
                <h1 className="text-5xl font-black text-gray-900 mb-4">{settings.appName}</h1>
                <p className="text-xl text-gray-600 font-medium max-w-md">بوابتك الرقمية للزوار. استكشف مرافقنا، تصفح الخدمات، وتواصل معنا بكل سهولة.</p>
            </div>

            {/* Mobile App Container */}
            <div className="w-full lg:w-[480px] h-[100dvh] lg:h-[90vh] lg:rounded-[3rem] lg:shadow-2xl bg-[#FDFBF7] flex flex-col relative overflow-hidden lg:border-8 border-gray-900">
                {/* Header */}
            <header className="relative h-72 shrink-0 overflow-hidden rounded-b-[4rem] shadow-2xl z-20">
                <img 
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80" 
                    className="absolute inset-0 w-full h-full object-cover" 
                    alt="Hotel"
                    referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90"></div>
                
                <div className="absolute top-0 left-0 right-0 pt-12 px-6 sm:pt-16 sm:px-8 flex justify-between items-center">
                    <div className="flex gap-3">
                        <button onClick={onExit} className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 text-white hover:bg-white/30 transition-all">
                            <ArrowRight size={24} />
                        </button>
                        {activeTab !== 'home' && (
                            <button 
                                onClick={handleBack}
                                className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 text-white hover:bg-white/30 transition-all"
                                title="رجوع"
                            >
                                <ArrowRight size={24} />
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowCartReview(true)}
                            className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 text-white hover:bg-white/30 transition-all relative"
                        >
                            <ShoppingBag size={24} />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                                    {cart.length}
                                </span>
                            )}
                        </button>
                        <button 
                            onClick={() => setShowThemePicker(true)}
                            className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 text-white hover:bg-white/30 transition-all"
                        >
                            <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: themeColor }}></div>
                        </button>
                        <div 
                            onClick={handleHiddenClick}
                            className="flex items-center gap-3 cursor-pointer group active:scale-95 transition-all"
                        >
                            <h1 className="text-white font-black text-2xl tracking-tight group-hover:opacity-80 transition-opacity">{settings.appName}</h1>
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 group-hover:bg-white/30 transition-all">
                                <Star size={24} style={{ color: themeColor }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-10 left-8 right-8">
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                    >
                        <p className="text-white/70 text-xs font-bold mb-2 uppercase tracking-widest">مرحباً بك كزائر مميز</p>
                        <h2 className="text-white text-3xl sm:text-4xl font-black mb-4 truncate w-full">{guestProfile?.name}</h2>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2">
                                <span className="text-white/80 text-xs font-bold">رمز الزيارة:</span>
                                <span className="font-black tracking-wider" style={{ color: themeColor }}>{guestProfile?.membershipCode}</span>
                            </div>
                            <button 
                                onClick={() => setShowQR(true)}
                                className="w-10 h-10 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                style={{ backgroundColor: themeColor }}
                            >
                                <QrCode size={20} />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Main Content - Scrollable */}
            <main className="flex-1 overflow-y-auto p-6 -mt-8 relative z-30 space-y-8 pb-20 custom-scrollbar">
                {activeTab === 'home' && (
                    <div className="space-y-10 animate-fade-in">
                        {/* Visitor Quick Services - New prominent section */}
                        <div className="bg-white p-8 rounded-[3.5rem] shadow-xl border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#cca43b] to-transparent opacity-30"></div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-gray-900 flex items-center gap-2">
                                    <Sparkles size={20} className="text-[#cca43b]" />
                                    خدمات الزوار السريعة
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
                                    { id: 'restaurant', label: 'المطعم', icon: Utensils, color: 'bg-orange-50 text-orange-600', cat: 'restaurant' },
                                    { id: 'cafe', label: 'المقهى', icon: Coffee, color: 'bg-amber-50 text-amber-600', cat: 'cafe' },
                                    { id: 'pool', label: 'المسبح', icon: Waves, color: 'bg-cyan-50 text-cyan-600', cat: 'pool' },
                                    { id: 'tickets', label: 'التذاكر', icon: Star, color: 'bg-[#cca43b15] text-[#cca43b]', cat: 'tickets' },
                                ].map(action => (
                                    <button 
                                        key={action.id}
                                        onClick={() => { setServiceCategory(action.cat); handleTabChange('services'); }}
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

                        {/* Hero Welcome Card */}
                        <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-gray-100 text-center space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 rounded-full -mr-24 -mt-24 opacity-10 blur-3xl" style={{ backgroundColor: themeColor }}></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full -ml-16 -mb-16 opacity-5 blur-2xl" style={{ backgroundColor: themeColor }}></div>
                            
                            <div className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner relative z-10" style={{ backgroundColor: `${themeColor}15`, color: themeColor }}>
                                <Sparkles size={48} className="animate-pulse" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 relative z-10">بوابة الزوار الذكية</h3>
                            <p className="text-gray-500 font-bold leading-relaxed max-w-xs mx-auto relative z-10">
                                استمتع بتجربة إقامة رقمية متكاملة. تصفح، احجز، واطلب خدماتك بلمسة واحدة.
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4 pt-4 relative z-10">
                                <button 
                                     onClick={() => { setServiceCategory('tickets'); handleTabChange('services'); }}
                                     className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex flex-col items-center gap-4 hover:bg-white hover:shadow-xl hover:scale-105 transition-all group"
                                 >
                                     <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:bg-theme transition-all" style={{ color: themeColor }}>
                                         <House size={28} />
                                     </div>
                                     <span className="text-sm font-black text-gray-800">حجز الغرف</span>
                                 </button>
                                 <button 
                                     onClick={() => { setServiceCategory('tickets'); handleTabChange('services'); }}
                                     className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex flex-col items-center gap-4 hover:bg-white hover:shadow-xl hover:scale-105 transition-all group"
                                 >
                                     <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#cca43b] group-hover:bg-[#cca43b] group-hover:text-white transition-all">
                                         <Star size={28} />
                                     </div>
                                     <span className="text-sm font-black text-gray-800">تذاكر المرافق</span>
                                 </button>
                             </div>
                         </div>

                         {/* Smart Quick Actions */}
                         <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="font-black text-xl text-gray-900 flex items-center gap-2">
                                    <Sparkles style={{ color: themeColor }} size={24}/> {new Date().getHours() < 12 ? 'اقتراحات الصباح الذكية' : 'اقتراحات المساء الذكية'}
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {(new Date().getHours() < 12 ? [
                                    { title: 'إفطار كونتيننتال', icon: Coffee, color: '#cca43b', bg: '#cca43b15', cat: 'cafe' },
                                    { title: 'حجز مسبح صباحي', icon: Waves, color: '#006269', bg: '#00626915', cat: 'tickets' },
                                    { title: 'جريدة الصباح', icon: FileText, color: '#1d3557', bg: '#1d355715', cat: 'amenity' },
                                    { title: 'توصيل للمدينة', icon: Car, color: '#E1306C', bg: '#E1306C15', cat: 'transport' },
                                ] : [
                                    { title: 'عشاء رومانسي', icon: Utensils, color: '#9b2226', bg: '#9b222615', cat: 'restaurant' },
                                    { title: 'سهرة في الحديقة', icon: Wind, color: '#3A7D44', bg: '#3A7D4415', cat: 'garden' },
                                    { title: 'خدمة غرف ليلية', icon: Coffee, color: '#5a189a', bg: '#5a189a15', cat: 'room_service' },
                                    { title: 'مساج استرخاء', icon: Sparkles, color: '#006269', bg: '#00626915', cat: 'amenity' },
                                ]).map((action, i) => (
                                    <motion.button
                                        key={i}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => { setServiceCategory(action.cat); handleTabChange('services'); }}
                                        className="flex items-center gap-3 p-4 bg-white rounded-3xl shadow-sm border border-gray-50 hover:shadow-md transition-all text-right w-full"
                                    >
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: action.bg, color: action.color }}>
                                            <action.icon size={24} />
                                        </div>
                                        <span className="text-xs font-black text-gray-800 leading-tight">{action.title}</span>
                                    </motion.button>
                                ))}
                            </div>
                         </div>

                         {/* Featured Room Packages */}
                         <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="font-black text-xl text-gray-900">باقات الغرف المميزة</h3>
                                <button onClick={() => { setServiceCategory('tickets'); handleTabChange('services'); }} className="text-xs font-bold text-[#cca43b]">عرض الكل</button>
                            </div>
                            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide -mx-6 px-6">
                                {[
                                    { title: 'باقة الاسترخاء الملكي', price: '25,000', img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80', tag: 'الأكثر طلباً' },
                                    { title: 'باقة شهر العسل', price: '45,000', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80', tag: 'رومانسي' },
                                    { title: 'باقة رجال الأعمال', price: '30,000', img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=400&q=80', tag: 'عملي' },
                                ].map((pkg, i) => (
                                    <motion.div 
                                        key={i}
                                        whileHover={{ y: -10 }}
                                        onClick={() => { setServiceCategory('tickets'); handleTabChange('services'); }}
                                        className="min-w-[280px] bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-gray-100 shrink-0 group cursor-pointer"
                                    >
                                        <div className="h-48 relative overflow-hidden">
                                            <img src={pkg.img} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black shadow-sm" style={{ color: themeColor }}>
                                                {pkg.tag}
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                                <p className="text-[10px] font-bold opacity-80">يبدأ من</p>
                                                <p className="text-xl font-black">{pkg.price} <span className="text-xs">د.ج</span></p>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <h4 className="font-black text-gray-900 mb-2">{pkg.title}</h4>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                                                <Check size={12} className="text-green-500" /> إفطار مجاني
                                                <span className="w-1 h-1 rounded-full bg-gray-300 mx-1"></span>
                                                <Check size={12} className="text-green-500" /> دخول السبا
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                         </div>

                         {/* Explore Services Grid */}
                         <div className="space-y-4">
                            <h3 className="text-xl font-black text-gray-900 px-2">استكشف المرافق والخدمات</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { title: 'تذكرة المسبح الخارجي', desc: 'دخول يومي تشمل المشروبات والمنشفة', icon: Waves, color: '#006269', bg: '#00626915', cat: 'tickets' },
                                    { title: 'حجز طاولة مطعم', desc: 'أفضل المأكولات مع إطلالة بانورامية ساحرة', icon: Utensils, color: themeColor, bg: `${themeColor}15`, cat: 'restaurant' },
                                    { title: 'حجز قاعة فعاليات', desc: 'قاعات مجهزة بأحدث التقنيات السمعية والبصرية', icon: MapPin, color: '#1d3557', bg: '#1d355715', cat: 'hall' },
                                ].map((facility, i) => (
                                    <motion.div 
                                        key={i} 
                                        whileHover={{ x: -5 }}
                                        onClick={() => { setServiceCategory(facility.cat); handleTabChange('services'); }}
                                        className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-all cursor-pointer group"
                                    >
                                        <div 
                                            style={{ backgroundColor: facility.bg, color: facility.color }}
                                            className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"
                                        >
                                            <facility.icon size={32} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-gray-900">{facility.title}</h4>
                                            <p className="text-xs text-gray-500 font-bold leading-relaxed">{facility.desc}</p>
                                        </div>
                                        <div className="w-10 h-10 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center group-hover:bg-theme group-hover:text-white transition-all">
                                            <ChevronRight size={20} />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'services' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-black text-gray-800">قائمة الطعام والخدمات</h3>
                            <button onClick={handleBack} className="text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
                        </div>
                        <GuestServiceCatalog onOrder={() => setShowCartReview(true)} initialCategory={serviceCategory} themeColor={themeColor} />
                    </div>
                )}

                {activeTab === 'guide' && (
                    <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-gray-100 space-y-8 animate-fade-in">
                        <div className="flex items-center justify-between border-b pb-6">
                            <h3 className="text-2xl font-black text-gray-800">دليل الفندق للزوار</h3>
                            <div className="w-12 h-12 bg-[#006269]/10 text-[#006269] rounded-2xl flex items-center justify-center">
                                <FileText size={24} />
                            </div>
                        </div>
                        <div className="space-y-6">
                            {[
                                { title: 'المطعم الرئيسي', desc: 'يقدم أشهى المأكولات الجزائرية والعالمية', time: '07:00 - 23:00', icon: Utensils, color: themeColor },
                                { title: 'المسبح الأولمبي', desc: 'مسبح خارجي مدفأ مع إطلالة ساحرة', time: '08:00 - 20:00', icon: Waves, color: 'text-cyan-600' },
                                { title: 'النادي الصحي', desc: 'خدمات سبا ومساج وجيم متكامل', time: '09:00 - 21:00', icon: Star, color: 'text-emerald-600' },
                                { title: 'مواقف السيارات', desc: 'مواقف آمنة ومراقبة على مدار الساعة', time: '24/7', icon: MapPin, color: 'text-gray-600' }
                            ].map((item, i) => (
                                <div key={i} className="p-6 bg-gray-50 rounded-[2rem] flex justify-between items-center group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-400 group-hover:text-theme transition-colors" style={{ color: activeTab === 'guide' ? undefined : item.color }}>
                                            <item.icon size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm text-gray-900">{item.title}</h4>
                                            <p className="text-[10px] text-gray-500 font-bold">{item.desc}</p>
                                        </div>
                                    </div>
                                    <div 
                                        className={`text-[10px] font-black bg-white px-3 py-1.5 rounded-xl border border-gray-100`}
                                        style={{ color: item.color.startsWith('#') ? item.color : undefined }}
                                    >
                                        {item.time}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'chat' && (
                    <div className="flex flex-col h-[calc(100vh-280px)] bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-gray-100 animate-fade-in">
                        <div className="bg-gray-50 p-6 border-b flex flex-col gap-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: themeColor }}>
                                        <MessageCircle size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-800">مكتب الاستقبال</h4>
                                        <p className="text-[10px] text-green-500 font-bold">متصل الآن للمساعدة</p>
                                    </div>
                                </div>
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
                                        className={`px-5 py-3 rounded-2xl text-[11px] font-black whitespace-nowrap transition-all flex items-center gap-2 ${
                                            chatRecipient === dept.id 
                                            ? 'text-white shadow-lg' 
                                            : 'bg-white text-gray-400 border border-gray-100'
                                        }`}
                                        style={{ backgroundColor: chatRecipient === dept.id ? themeColor : undefined }}
                                    >
                                        <dept.icon size={14} />
                                        {dept.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FDFBF7]/50">
                            {chatMessages.length === 0 && (
                                <div className="text-center text-gray-400 text-sm mt-10 flex flex-col items-center gap-6">
                                    <div className="w-24 h-24 bg-white rounded-[2rem] shadow-sm flex items-center justify-center">
                                        <MessageSquare size={48} className="opacity-10" />
                                    </div>
                                    <p className="font-bold max-w-[220px] leading-relaxed">مرحباً بك! كيف يمكننا مساعدتك اليوم؟ نحن هنا لخدمتكم.</p>
                                </div>
                            )}
                            {chatMessages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.senderId === guestProfile?.membershipCode ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-5 rounded-[2rem] text-sm shadow-sm font-bold leading-relaxed ${msg.senderId === guestProfile?.membershipCode ? 'text-white rounded-tl-none' : 'bg-white text-gray-800 rounded-tr-none border border-gray-100'}`} style={{ backgroundColor: msg.senderId === guestProfile?.membershipCode ? themeColor : undefined }}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleSend} className="p-6 border-t bg-gray-50 flex gap-4">
                            <input 
                                type="text" 
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="اكتب استفسارك هنا..."
                                className="flex-1 border-none bg-white shadow-inner rounded-[1.5rem] px-6 py-4 focus:ring-2 focus:ring-opacity-20 text-sm font-bold"
                                style={{ '--tw-ring-color': themeColor } as any}
                            />
                            <button type="submit" className="text-white w-14 h-14 rounded-[1.5rem] shadow-xl flex items-center justify-center hover:opacity-90 transition active:scale-90" style={{ backgroundColor: themeColor }}>
                                <Send size={24} />
                            </button>
                        </form>
                    </div>
                )}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-gray-100 p-6 flex justify-around items-center z-50 rounded-t-[3.5rem] shadow-[0_-15px_40px_rgba(0,0,0,0.05)]">
                {[
                    { id: 'home', icon: House, label: 'الرئيسية' },
                    { id: 'services', icon: ShoppingBag, label: 'الخدمات' },
                    { id: 'guide', icon: FileText, label: 'الدليل' },
                    { id: 'chat', icon: MessageCircle, label: 'المحادثة' },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id as any)} 
                        className="flex flex-col items-center gap-2 transition-all duration-300"
                        style={{ color: activeTab === tab.id ? themeColor : '#d1d5db', transform: activeTab === tab.id ? 'scale(1.1)' : 'scale(1)' }}
                    >
                        <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                        <span className="text-[10px] font-black">{tab.label}</span>
                    </button>
                ))}
            </nav>

            {/* TICKET QR MODAL */}
            <AnimatePresence>
                {showTicketQR && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 overflow-y-auto custom-scrollbar"
                        onClick={() => setShowTicketQR(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] p-8 w-full max-w-sm md:max-w-2xl text-center relative overflow-hidden shadow-2xl my-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="drag-handle mb-4"></div>
                            <div className="absolute top-0 left-0 w-full h-3" style={{ backgroundColor: themeColor }}></div>
                            <div className="absolute top-6 right-6 flex gap-2">
                                <button onClick={() => setShowTicketQR(null)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                            
                            <div className="mb-8 mt-4">
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
                                    onClick={() => setShowTicketQR(null)}
                                    className="w-full text-white p-4 rounded-2xl font-black shadow-lg shadow-black/5 hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    style={{ backgroundColor: themeColor }}
                                >
                                    إخفاء و متابعة الاستخدام
                                </button>
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
                                    className="w-full text-gray-700 p-4 rounded-2xl font-black bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Share2 size={20} />
                                    مشاركة التذكرة
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6 overflow-y-auto custom-scrollbar"
                        onClick={() => setShowThemePicker(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] p-8 w-full max-w-sm md:max-w-2xl space-y-6 my-auto relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="drag-handle mb-2"></div>
                            <button onClick={() => setShowThemePicker(false)} className="absolute top-8 right-8 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                                <ArrowRight size={20} />
                            </button>
                            <div className="text-center space-y-2 pt-4">
                                <h3 className="text-xl font-black text-gray-900">تخصيص المظهر</h3>
                                <p className="text-gray-500 text-sm font-bold">اختر لونك المفضل للواجهة</p>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {colors.map(color => (
                                    <button 
                                        key={`${color.name}-${color.value}`}
                                        onClick={() => {
                                            setThemeColor(color.value);
                                            localStorage.setItem('visitorTheme', color.value);
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
                                حفظ و إغلاق
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

            {/* Hotel QR Modal */}
            <AnimatePresence>
                {showHotelQR && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[110] flex items-center justify-center p-6 overflow-y-auto custom-scrollbar"
                        onClick={() => setShowHotelQR(false)}
                    >
                        <div onClick={e => e.stopPropagation()} className="my-auto">
                            <HotelQRCode 
                                hotelName={settings.appName}
                                appUrl={window.location.origin}
                                themeColor={themeColor}
                                onClose={() => setShowHotelQR(false)}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* QR Modal */}
            <AnimatePresence>
                {showQR && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 overflow-y-auto custom-scrollbar" 
                        onClick={() => setShowQR(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                            className="bg-white rounded-[4rem] p-12 w-full max-w-md md:max-w-2xl text-center relative overflow-hidden shadow-2xl my-auto" 
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="drag-handle mb-4"></div>
                            <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: themeColor }}></div>
                            <button onClick={() => setShowQR(false)} className="absolute top-10 left-10 p-3 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                                <ArrowRight size={24} />
                            </button>
                            
                            <div className="mb-10 mt-4">
                                <h2 className="text-3xl font-black text-gray-900 mb-2">بطاقة الزائر الرقمية</h2>
                                <p className="text-gray-500 font-bold">أظهر هذا الرمز لموظفي الفندق عند الطلب</p>
                            </div>

                            <div className="bg-gray-50 p-8 rounded-[3rem] shadow-inner border border-gray-100 inline-block mb-10">
                                <QRCodeSVG 
                                    value={generateSecureToken({
                                        t: 'VISITOR_CODE',
                                        i: guestProfile?.membershipCode || '',
                                        n: guestProfile?.name || 'زائر',
                                        m: { phone: guestProfile?.phone }
                                    })} 
                                    size={220} 
                                    level="H" 
                                />
                            </div>

                            <div className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: `${themeColor}10`, borderColor: `${themeColor}20` }}>
                                <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: themeColor }}>Visitor Identity</div>
                                <div className="text-3xl font-mono font-black tracking-[0.2em]" style={{ color: themeColor }}>{guestProfile?.membershipCode}</div>
                            </div>

                            <div className="space-y-3">
                                <button 
                                    onClick={() => setShowQR(false)}
                                    className="w-full py-4 text-white font-black rounded-2xl shadow-lg shadow-black/5 hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    style={{ backgroundColor: themeColor }}
                                >
                                    إخفاء و متابعة الاستخدام
                                </button>
                                <button 
                                    onClick={async () => {
                                        const token = generateSecureToken({
                                            t: 'VISITOR_CODE',
                                            i: guestProfile?.membershipCode || '',
                                            n: guestProfile?.name || 'زائر',
                                            m: { phone: guestProfile?.phone }
                                        });
                                        const shareData = {
                                            title: 'رمز تسجيل الزائر',
                                            text: `رمز التسجيل الخاص بك في ${settings.appName}`,
                                            url: `${window.location.origin}/visitor?token=${token}`
                                        };
                                        try {
                                            if (navigator.share) {
                                                await navigator.share(shareData);
                                            } else {
                                                await navigator.clipboard.writeText(token);
                                                addNotification('تم نسخ الرمز للحافظة', 'success');
                                            }
                                        } catch (err) {
                                            console.error('Error sharing:', err);
                                        }
                                    }}
                                    className="w-full py-4 text-gray-700 font-black rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Send size={20} />
                                    مشاركة رمز الزائر
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
    );
};

export default VisitorPortal;
