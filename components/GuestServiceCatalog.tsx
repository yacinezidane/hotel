import React, { useState, useMemo } from 'react';
import { Coffee, Utensils, Sparkles, Wind, Car, MapPin, ChevronRight, Plus, Minus, ShoppingBag, Waves, Info, Calendar, House, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FacilityBookingModal } from './FacilityBookingModal';
import { useHotel } from '../context/HotelContext';

interface ServiceItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: 'restaurant' | 'cafe' | 'pool' | 'hall' | 'parking' | 'garden' | 'kiosk' | 'amenity' | 'transport' | 'room_service' | 'tickets';
    subcategory?: string;
    image?: string;
    badge?: 'popular' | 'new' | 'chef';
}

interface GuestServiceCatalogProps {
    onOrder: (items: { item: ServiceItem, quantity: number, details?: any }[]) => void;
    initialCategory?: string;
    themeColor?: string;
}

export const GuestServiceCatalog: React.FC<GuestServiceCatalogProps> = ({ 
    onOrder, 
    initialCategory = 'all',
    themeColor = '#006269' // Default color
}) => {
    const { menuItems, guestServices, settings, cart: globalCart, addToCart: globalAddToCart, updateCartItemQuantity, clearCart } = useHotel();

    const SERVICES: ServiceItem[] = useMemo(() => {
        const items: ServiceItem[] = [];

        // 1. Menu Items (Restaurant & Cafe)
        menuItems.filter(m => m.isAvailable).forEach(m => {
            let cat: ServiceItem['category'] = 'restaurant';
            let subcat = 'local';
            if (m.category === 'hot_drink' || m.category === 'cold_drink') cat = 'cafe';
            
            if (cat === 'restaurant' && settings.serviceAvailability?.restaurant === false) return;
            if (cat === 'cafe' && settings.serviceAvailability?.cafe === false) return;

            if (m.name.includes('برجر') || m.name.includes('سوشي') || m.name.includes('ستيك') || m.name.includes('لاتيه') || m.name.includes('كابتشينو')) {
                subcat = 'intl';
            }
            items.push({
                id: m.id,
                name: m.name,
                description: m.description || 'وصف غير متوفر',
                price: m.price,
                category: cat,
                subcategory: subcat,
                image: m.image || 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=300&q=80',
                badge: m.price > 2000 ? 'chef' : (m.price < 1000 ? 'popular' : undefined)
            });
        });

        // 2. Guest Services (Amenities, Transport, Room Service)
        guestServices.filter(s => s.isActive).forEach(s => {
            let cat: ServiceItem['category'] = 'amenity';
            if (s.targetDepartment === 'transport') cat = 'transport';
            if (s.targetDepartment === 'room_service') cat = 'room_service';
            if (s.targetDepartment === 'maintenance') cat = 'amenity';
            
            items.push({
                id: s.id,
                name: s.labelAr,
                description: s.description || 'خدمة فندقية',
                price: s.price || 0,
                category: cat,
                image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80',
            });
        });

        // 3. Facilities & Tickets (from Standard Rates)
        if (settings.serviceAvailability?.pool !== false) {
            items.push({ id: 'p1', name: 'دخول المسبح (يومي)', description: 'دخول كامل للمسبح مع استخدام غرف التبديل', price: settings.standardRates.poolAccess, category: 'pool', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=300&q=80' });
            if (settings.serviceAvailability?.poolVip !== false) {
                items.push({ id: 'p2', name: 'دخول المسبح VIP', description: 'دخول VIP شامل للمسبح والمرافق', price: settings.standardRates.poolVipAccess, category: 'pool', badge: 'popular', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80' });
            }
        }
        if (settings.serviceAvailability?.hall !== false) {
            items.push({ id: 'h1', name: 'حجز القاعة (ساعة)', description: 'استخدام القاعة متعددة الخدمات للاجتماعات أو الفعاليات', price: settings.standardRates.hallBasePrice, category: 'hall', image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=300&q=80' });
        }
        
        // 4. Hardcoded fallbacks for other categories if needed
        if (settings.serviceAvailability?.parkingVIP !== false) {
            items.push({ id: 'pk1', name: 'ركن السيارة VIP', description: 'خدمة ركن السيارة في مكان مظلل وقريب من المدخل', price: settings.standardRates.parkingVIP || 1000, category: 'parking', image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=300&q=80' });
        }
        if (settings.serviceAvailability?.gardenPicnic !== false) {
            items.push({ id: 'g1', name: 'سلة نزهة الحديقة', description: 'تشكيلة من السندوتشات والفواكه والمشروبات للنزهة', price: settings.standardRates.gardenPicnic || 3500, category: 'garden', image: 'https://images.unsplash.com/photo-1526398977052-654221a252b1?auto=format&fit=crop&w=300&q=80' });
        }
        if (settings.serviceAvailability?.kioskSouvenir !== false) {
            items.push({ id: 'k1', name: 'هدايا تذكارية تقليدية', description: 'صناعات يدوية محلية تعكس التراث الجزائري', price: settings.standardRates.kioskSouvenir || 2500, category: 'kiosk', image: 'https://images.unsplash.com/photo-1533481405265-e9ce0c044abb?auto=format&fit=crop&w=300&q=80' });
        }
        
        // Enhanced Room Booking Options
        if (settings.serviceAvailability?.roomBooking !== false) {
            items.push({ 
                id: 'rm-single', 
                name: 'غرفة فردية قياسية', 
                description: 'مثالية للمسافرين المنفردين، تشمل إفطاراً غنياً وخدمة واي فاي سريعة', 
                price: settings.roomPrices.single[0]?.amount || 8500, 
                category: 'tickets', 
                subcategory: 'standard',
                badge: 'popular',
                image: 'https://images.unsplash.com/photo-1505691938895-1758d7eaa511?auto=format&fit=crop&w=300&q=80' 
            });
            items.push({ 
                id: 'rm-double', 
                name: 'غرفة زوجية ديلوكس', 
                description: 'مساحة واسعة لشخصين مع إطلالة مميزة وشرفة خاصة', 
                price: settings.roomPrices.double[0]?.amount || 14000, 
                category: 'tickets', 
                subcategory: 'deluxe',
                image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=300&q=80' 
            });
            items.push({ 
                id: 'rm-triple', 
                name: 'غرفة ثلاثية / متعددة', 
                description: 'تصميم ذكي لثلاثة أشخاص، مريحة وعملية للرحلات الجماعية', 
                price: 18500, 
                category: 'tickets', 
                subcategory: 'standard',
                image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=300&q=80' 
            });
            items.push({ 
                id: 'rm-family', 
                name: 'غرفة عائلية فسيحة', 
                description: 'جناح عائلي متكامل يضمن الخصوصية والراحة لجميع أفراد الأسرة', 
                price: 22000, 
                category: 'tickets', 
                subcategory: 'deluxe',
                badge: 'new',
                image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=300&q=80' 
            });
            items.push({ 
                id: 'rm-suite', 
                name: 'جناح جونيور فاخر', 
                description: 'أناقة لا تضاهى مع منطقة جلوس منفصلة وخدمات كبار الشخصيات', 
                price: settings.roomPrices.suite[0]?.amount || 35000, 
                category: 'tickets', 
                subcategory: 'luxury',
                badge: 'chef',
                image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=300&q=80' 
            });
            items.push({ 
                id: 'rm-royal', 
                name: 'الجناح الملكي', 
                description: 'قمة الفخامة والرفاهية مع إطلالة بانورامية وخدمة خادم خاص', 
                price: 65000, 
                category: 'tickets', 
                subcategory: 'luxury',
                badge: 'chef',
                image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=300&q=80' 
            });
        }

        return items;
    }, [menuItems, guestServices, settings]);

    const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
    const [activeSubcategory, setActiveSubcategory] = useState<'all' | 'local' | 'intl'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBookingItem, setSelectedBookingItem] = useState<ServiceItem | null>(null);

    const addToCart = (id: string) => {
        const item = SERVICES.find(s => s.id === id);
        if (!item) return;

        if (item.category === 'tickets' || item.id === 'h1') {
            setSelectedBookingItem(item);
            return;
        }

        globalAddToCart({
            id: item.id,
            name: item.name,
            price: item.price,
            category: item.category,
            image: item.image,
            type: (item.category === 'restaurant' || item.category === 'cafe') ? 'menu' : 
                  (item.category === 'pool' || item.category === 'hall') ? 'facility' : 'service'
        });
    };

    const removeFromCart = (id: string) => {
        const existing = globalCart.find(i => i.id === id);
        if (existing) {
            updateCartItemQuantity(id, existing.quantity - 1);
        }
    };

    const getItemQuantity = (id: string) => {
        return globalCart.find(i => i.id === id)?.quantity || 0;
    };

    const totalItems = globalCart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = globalCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const filteredServices = SERVICES.filter(s => {
        const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
        const matchesSubcategory = activeSubcategory === 'all' || s.subcategory === activeSubcategory;
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             s.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSubcategory && matchesSearch;
    });

    const featuredItems = SERVICES.filter(s => {
        const isFeatured = s.badge === 'chef' || s.badge === 'popular';
        const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
        return isFeatured && matchesCategory;
    }).slice(0, 8);

    const chefSpecial = SERVICES.find(s => s.badge === 'chef' && (activeCategory === 'all' || s.category === activeCategory));

    return (
        <div className="space-y-6 pb-24">
            {/* Chef's Special Banner */}
            {!searchQuery && chefSpecial && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative h-48 rounded-[2.5rem] overflow-hidden shadow-xl group cursor-pointer"
                    onClick={() => addToCart(chefSpecial.id)}
                >
                    <img src={chefSpecial.image} alt={chefSpecial.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">توصية الشيف اليوم</span>
                            <div className="flex gap-0.5">
                                {[1,2,3,4,5].map(i => <Sparkles key={i} size={10} className="text-yellow-400 fill-yellow-400" />)}
                            </div>
                        </div>
                        <h3 className="text-white font-black text-xl mb-1">{chefSpecial.name}</h3>
                        <p className="text-white/70 text-xs font-bold line-clamp-1">{chefSpecial.description}</p>
                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-white font-black text-lg">{chefSpecial.price.toLocaleString()} د.ج</span>
                            <div className="bg-white text-gray-900 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 group-active:scale-95 transition-transform">
                                <Plus size={14} /> أضف للطلب
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Search Bar */}
            <div className="relative group px-1">
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-zellige-primary transition-colors">
                    <ShoppingBag size={18} />
                </div>
                <input 
                    type="text" 
                    placeholder="ابحث عن وجبة، مشروب أو خدمة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-[1.5rem] py-4 pr-12 pl-6 text-sm font-bold shadow-sm focus:ring-2 focus:ring-zellige-primary/20 focus:border-zellige-primary outline-none transition-all"
                />
            </div>

            {/* Featured Section (Only when no search and on 'all' or 'food' category) */}
            {!searchQuery && (activeCategory === 'all' || activeCategory === 'food') && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="font-black text-sm text-gray-800 flex items-center gap-2">
                            <Sparkles size={16} className="text-orange-500" /> مختاراتنا المميزة
                        </h4>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
                        {featuredItems.map(item => (
                            <motion.div 
                                key={item.id}
                                whileHover={{ y: -5 }}
                                onClick={() => addToCart(item.id)}
                                className="min-w-[200px] bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 shrink-0 group cursor-pointer relative"
                            >
                                <div className="h-24 relative overflow-hidden">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                                    <div className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-md rounded-lg text-orange-500 shadow-sm">
                                        <Sparkles size={12} />
                                    </div>
                                </div>
                                <div className="p-3">
                                    <h5 className="font-black text-xs text-gray-900 truncate">{item.name}</h5>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[10px] font-black" style={{ color: themeColor }}>{item.price.toLocaleString()} د.ج</span>
                                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: themeColor }}>
                                            <Plus size={12} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Categories */}
            <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide">
                {[
                    { id: 'all', label: 'الكل', icon: Sparkles },
                    { id: 'room_service', label: 'خدمة الغرف', icon: Coffee },
                    { id: 'restaurant', label: 'المطعم', icon: Utensils },
                    { id: 'cafe', label: 'المقهى', icon: Coffee },
                    { id: 'pool', label: 'المسبح', icon: Waves },
                    { id: 'tickets', label: 'تذاكر وحجز', icon: Sparkles },
                    { id: 'hall', label: 'القاعة', icon: MapPin },
                    { id: 'parking', label: 'الموقف', icon: Car },
                    { id: 'garden', label: 'الحديقة', icon: Wind },
                    { id: 'kiosk', label: 'الأكشاك', icon: ShoppingBag },
                    { id: 'amenity', label: 'مستلزمات', icon: Sparkles },
                    { id: 'transport', label: 'نقل', icon: Car }
                ].filter(cat => {
                    if (cat.id === 'restaurant' && settings.serviceAvailability?.restaurant === false) return false;
                    if (cat.id === 'cafe' && settings.serviceAvailability?.cafe === false) return false;
                    if (cat.id === 'pool' && settings.serviceAvailability?.pool === false) return false;
                    if (cat.id === 'hall' && settings.serviceAvailability?.hall === false) return false;
                    if (cat.id === 'parking' && settings.serviceAvailability?.parkingVIP === false) return false;
                    if (cat.id === 'garden' && settings.serviceAvailability?.gardenPicnic === false) return false;
                    if (cat.id === 'kiosk' && settings.serviceAvailability?.kioskSouvenir === false) return false;
                    if (cat.id === 'tickets' && settings.serviceAvailability?.roomBooking === false) return false;
                    return true;
                }).map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => {
                            setActiveCategory(cat.id);
                            setActiveSubcategory('all');
                        }}
                        className={`px-5 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 ${
                            activeCategory === cat.id 
                            ? 'text-white shadow-lg scale-105' 
                            : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                        }`}
                        style={{ backgroundColor: activeCategory === cat.id ? themeColor : undefined }}
                    >
                        {cat.icon && <cat.icon size={16} />}
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Smart Room Filter (Only for Tickets/Rooms) */}
            {activeCategory === 'tickets' && (
                <div className="flex gap-2 bg-gray-100/50 p-1 rounded-2xl w-fit mx-auto">
                    {[
                        { id: 'all', label: 'الكل', icon: Sparkles },
                        { id: 'standard', label: 'قياسية', icon: House },
                        { id: 'suite', label: 'أجنحة', icon: Star },
                        { id: 'royal', label: 'ملكي', icon: Sparkles }
                    ].map(sub => (
                        <button 
                            key={sub.id}
                            onClick={() => setSearchQuery(sub.id === 'all' ? '' : sub.label)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${
                                (sub.id === 'all' && searchQuery === '') || (sub.id !== 'all' && searchQuery === sub.label)
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500'
                            }`}
                        >
                            <sub.icon size={12} className={(sub.id === 'all' && searchQuery === '') || (sub.id !== 'all' && searchQuery === sub.label) ? 'text-zellige-primary' : 'text-gray-400'} />
                            {sub.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Subcategories (Only for Restaurant/Cafe) */}
            {(activeCategory === 'restaurant' || activeCategory === 'cafe') && (
                <div className="flex gap-2 bg-gray-100/50 p-1 rounded-2xl w-fit mx-auto">
                    {[
                        { id: 'all', label: 'الكل', icon: Sparkles },
                        { id: 'local', label: 'محلي', icon: MapPin },
                        { id: 'intl', label: 'عالمي', icon: Wind }
                    ].map(sub => (
                        <button 
                            key={sub.id}
                            onClick={() => setActiveSubcategory(sub.id as any)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${
                                activeSubcategory === sub.id
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500'
                            }`}
                        >
                            <sub.icon size={12} className={activeSubcategory === sub.id ? 'text-zellige-primary' : 'text-gray-400'} />
                            {sub.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredServices.length > 0 ? (
                    filteredServices.map(item => (
                        <motion.div 
                            layout
                            key={item.id} 
                            className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 flex gap-4 items-center relative overflow-hidden group hover:shadow-md transition-shadow"
                        >
                            {/* Simplified Icon - No color images to reduce clutter */}
                            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex flex-col items-center justify-center shrink-0 relative overflow-hidden border border-gray-100 group-hover:bg-white transition-colors">
                                <div style={{ color: themeColor }}>
                                    {item.category === 'restaurant' && <Utensils size={24} />}
                                    {item.category === 'cafe' && <Coffee size={24} />}
                                    {item.category === 'pool' && <Waves size={24} />}
                                    {item.category === 'hall' && <Calendar size={24} />}
                                    {item.category === 'parking' && <Car size={24} />}
                                    {item.category === 'garden' && <Sparkles size={24} />}
                                    {item.category === 'kiosk' && <ShoppingBag size={24} />}
                                    {item.category === 'amenity' && <Sparkles size={24} />}
                                    {item.category === 'transport' && <Car size={24} />}
                                    {item.category === 'room_service' && <Utensils size={24} />}
                                    {item.category === 'tickets' && <MapPin size={24} />}
                                    {!['restaurant', 'cafe', 'pool', 'hall', 'parking', 'garden', 'kiosk', 'amenity', 'transport', 'room_service', 'tickets'].includes(item.category) && <Info size={24} />}
                                </div>
                                <span className="text-[8px] font-black mt-1 text-gray-400 uppercase tracking-tighter">
                                    {item.category === 'restaurant' ? 'مطعم' : 
                                     item.category === 'cafe' ? 'مقهى' :
                                     item.category === 'pool' ? 'مسبح' :
                                     item.category === 'hall' ? 'قاعة' :
                                     item.category === 'parking' ? 'موقف' :
                                     item.category === 'garden' ? 'حديقة' :
                                     item.category === 'kiosk' ? 'متجر' :
                                     item.category === 'amenity' ? 'مرفق' :
                                     item.category === 'transport' ? 'نقل' :
                                     item.category === 'room_service' ? 'غرف' :
                                     item.category === 'tickets' ? 'تذاكر' : 'خدمة'}
                                </span>
                                {item.badge && (
                                    <div className={`absolute top-0 left-0 w-2 h-2 rounded-full m-1 ${
                                        item.badge === 'popular' ? 'bg-orange-500' : 
                                        item.badge === 'new' ? 'bg-blue-500' : 'bg-red-500'
                                    }`} />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-black text-gray-800 text-sm truncate">{item.name}</h4>
                                    <span className="font-black text-xs shrink-0" style={{ color: themeColor }}>
                                        {item.price > 0 ? `${item.price.toLocaleString()} د.ج` : 'مجاني'}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1 font-bold">{item.description}</p>
                                
                                <div className="mt-3 flex justify-end">
                                    {item.category === 'tickets' || item.id === 'h1' ? (
                                        <button 
                                            onClick={() => setSelectedBookingItem(item)}
                                            className="px-4 py-1.5 rounded-xl text-[10px] font-black text-white shadow-sm active:scale-95 transition-all flex items-center gap-2"
                                            style={{ backgroundColor: themeColor }}
                                        >
                                            <Calendar size={12} /> احجز الآن
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                                            {(getItemQuantity(item.id)) > 0 && (
                                                <>
                                                    <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-400 hover:text-red-500 transition-colors"><Minus size={10}/></button>
                                                    <span className="font-black text-[10px] min-w-[1rem] text-center">{getItemQuantity(item.id)}</span>
                                                </>
                                            )}
                                            <button onClick={() => addToCart(item.id)} className="w-6 h-6 flex items-center justify-center text-white rounded-lg shadow-lg transition-transform active:scale-90" style={{ backgroundColor: themeColor }}><Plus size={10}/></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                            <ShoppingBag size={40} />
                        </div>
                        <div>
                            <h4 className="font-black text-gray-800">لم نجد ما تبحث عنه</h4>
                            <p className="text-xs text-gray-400 font-bold">جرب كلمات بحث أخرى أو تصفح الأقسام</p>
                        </div>
                        <button 
                            onClick={() => {
                                setSearchQuery('');
                                setActiveCategory('all');
                                setActiveSubcategory('all');
                            }}
                            className="text-xs font-black px-6 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                            إعادة ضبط الفلاتر
                        </button>
                    </div>
                )}
            </div>

            {/* Floating Cart Button */}
            <AnimatePresence>
                {totalItems > 0 && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-24 left-4 right-4 z-40"
                    >
                        <button 
                            onClick={() => {
                                onOrder(globalCart.map(item => ({
                                    item: SERVICES.find(s => s.id === item.id) || {
                                        id: item.id,
                                        name: item.name,
                                        description: '',
                                        price: item.price,
                                        category: item.category as any,
                                        image: item.image
                                    },
                                    quantity: item.quantity,
                                    details: item.details
                                })));
                            }}
                            className="w-full text-white p-4 rounded-2xl shadow-xl flex items-center justify-between font-black"
                            style={{ backgroundColor: themeColor, boxShadow: `0 20px 40px ${themeColor}33` }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-xl">
                                    <ShoppingBag size={20} />
                                </div>
                                <span>مراجعة الطلب ({totalItems})</span>
                            </div>
                            <div className="text-lg">{totalPrice} د.ج</div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Booking Modal */}
            {selectedBookingItem && (
                <FacilityBookingModal
                    isOpen={!!selectedBookingItem}
                    onClose={() => setSelectedBookingItem(null)}
                    item={selectedBookingItem}
                    themeColor={themeColor}
                    onConfirm={(details) => {
                        globalAddToCart({
                            id: selectedBookingItem.id,
                            name: selectedBookingItem.name,
                            price: selectedBookingItem.price,
                            category: selectedBookingItem.category,
                            image: selectedBookingItem.image,
                            type: 'facility',
                            details: details
                        });
                        setSelectedBookingItem(null);
                    }}
                />
            )}
        </div>
    );
};
