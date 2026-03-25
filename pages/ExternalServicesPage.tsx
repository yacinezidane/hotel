import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { 
  Truck, ShoppingBag, MapPin, Phone, User, Clock, CheckCircle, 
  X, AlertCircle, Plus, DollarSign, Package, Car, Shirt, Sparkles, Utensils, Minus,
  List
} from 'lucide-react';
import { ExternalOrder, ExternalServiceType, MenuItem, RestaurantOrder } from '../types';
import { PrintButton } from '../components/PrintButton';

export const ExternalServicesPage: React.FC = () => {
  const { settings, externalOrders, addExternalOrder, updateExternalOrderStatus, menuItems, addRestaurantOrder, updateRestaurantOrder, restaurantOrders, generateSystemQR, currentUser, addNotification } = useHotel();
  const [activeTab, setActiveTab] = useState<ExternalServiceType>('food_delivery');
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Permissions
  const isDriver = currentUser?.role === 'driver';
  const canManageOrders = currentUser?.role === 'manager' || currentUser?.role === 'receptionist' || currentUser?.role === 'concierge' || isDriver;

  // Suggested Items for Quick Add
  const suggestedItems = [
      { name: 'توصيل مطار', price: 2000, type: 'transport' },
      { name: 'توصيل وسط المدينة', price: 500, type: 'transport' },
      { name: 'جولة سياحية (4 ساعات)', price: 6000, type: 'transport' },
      { name: 'توصيل محطة القطار', price: 800, type: 'transport' },
      { name: 'غسيل مستعجل (5 قطع)', price: 1500, type: 'laundry_pickup' },
      { name: 'كي فقط (5 قطع)', price: 800, type: 'laundry_pickup' },
      { name: 'غسيل جاف (بدلة)', price: 1200, type: 'laundry_pickup' },
      { name: 'تنظيف غرفة إضافي', price: 1000, type: 'cleaning_service' },
      { name: 'تنظيف شامل', price: 2500, type: 'cleaning_service' },
      { name: 'تعقيم', price: 1500, type: 'cleaning_service' },
  ];

  // New Order Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [details, setDetails] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  // Food Order State
  const [cart, setCart] = useState<{ item: MenuItem, quantity: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getThemeStyles = () => {
      if (settings.darkMode) {
          if (settings.theme === 'zellige') {
              return {
                  card: 'bg-[#001e21] border border-[#cca43b]/30 relative overflow-hidden shadow-lg',
                  activeTab: 'bg-[#cca43b] text-[#001e21] shadow-lg shadow-[#cca43b]/20',
                  inactiveTab: 'bg-[#001e21] text-[#cca43b]/60 border-[#cca43b]/20 hover:bg-[#002a2d]',
                  button: 'bg-[#cca43b] text-[#001e21] hover:bg-[#b08d30] font-bold border border-[#cca43b]',
                  badge: 'bg-[#cca43b]/20 text-[#cca43b] border border-[#cca43b]/20',
                  input: 'bg-[#001517] border-[#cca43b]/30 focus:border-[#cca43b] text-[#cca43b] placeholder-[#cca43b]/40',
                  pattern: 'bg-zellige-pattern opacity-10 mix-blend-screen',
                  modalBg: 'bg-[#001e21] text-[#cca43b] border border-[#cca43b]/30',
                  textPrimary: 'text-[#cca43b]',
                  textSecondary: 'text-[#cca43b]/70',
                  itemCard: 'bg-[#002a2d] border-[#cca43b]/20 text-[#cca43b] hover:border-[#cca43b]/50',
                  cartBg: 'bg-[#001517] border-[#cca43b]/20'
              };
          }
          return {
              card: 'bg-gray-800 border-gray-700',
              activeTab: 'bg-blue-600 text-white',
              inactiveTab: 'bg-gray-800 text-gray-400 border-gray-700',
              button: 'bg-blue-600 text-white',
              badge: 'bg-blue-900/30 text-blue-300',
              input: 'bg-gray-800 border-gray-600 text-white placeholder-gray-400',
              pattern: '',
              modalBg: 'bg-gray-900 text-white',
              textPrimary: 'text-white',
              textSecondary: 'text-gray-400',
              itemCard: 'bg-gray-800 border-gray-700 text-white',
              cartBg: 'bg-gray-800 border-gray-700'
          };
      }

      switch (settings.theme) {
          case 'zellige': return {
              card: 'bg-[#FDFBF7] border border-[#cca43b]/40 relative overflow-hidden shadow-sm',
              activeTab: 'bg-[#006269] text-[#cca43b] shadow-md border-[#cca43b]',
              inactiveTab: 'bg-[#fbf8f1] text-[#006269] border-[#cca43b]/30',
              button: 'bg-[#006269] text-[#cca43b] hover:bg-[#004d53]',
              badge: 'bg-[#cca43b]/20 text-[#006269]',
              input: 'bg-[#fbf8f1] border-[#cca43b]/30 focus:border-[#006269] text-[#006269] placeholder-[#cca43b]/50',
              pattern: 'bg-zellige-pattern opacity-10 mix-blend-multiply',
              modalBg: 'bg-[#FDFBF7] text-[#006269]',
              textPrimary: 'text-[#006269]',
              textSecondary: 'text-[#006269]/70',
              itemCard: 'bg-white border-[#cca43b]/20 text-[#006269] hover:border-[#006269]',
              cartBg: 'bg-white border-[#cca43b]/20'
          };
          case 'algerian-military': return {
              card: 'bg-[#F0EFEA] border-[#D4AF37]/40',
              activeTab: 'bg-[#2F3E2E] text-[#D4AF37] border border-[#D4AF37]',
              inactiveTab: 'bg-[#E5E5E0] text-[#2F3E2E] border-[#D4AF37]/30',
              button: 'bg-[#2F3E2E] text-[#D4AF37] border border-[#D4AF37]',
              badge: 'bg-[#D4AF37]/20 text-[#2F3E2E]',
              input: 'bg-[#E5E5E0] border-[#D4AF37]/30 focus:border-[#2F3E2E]',
              pattern: 'bg-military-pattern opacity-10',
              modalBg: 'bg-[#F0EFEA] text-[#2F3E2E]',
              textPrimary: 'text-[#2F3E2E]',
              textSecondary: 'text-[#2F3E2E]/70',
              itemCard: 'bg-[#E5E5E0] border-[#D4AF37]/30 text-[#2F3E2E]',
              cartBg: 'bg-[#E5E5E0] border-[#D4AF37]/30'
          };
          default: return {
              card: 'bg-white border-gray-200',
              activeTab: 'bg-blue-600 text-white',
              inactiveTab: 'bg-gray-50 text-gray-600 border-gray-200',
              button: 'bg-blue-600 text-white',
              badge: 'bg-blue-100 text-blue-800',
              input: 'bg-gray-50 border-gray-300',
              pattern: '',
              modalBg: 'bg-white text-gray-900',
              textPrimary: 'text-gray-900',
              textSecondary: 'text-gray-500',
              itemCard: 'bg-white border-gray-200 text-gray-900',
              cartBg: 'bg-white border-gray-200'
          };
      }
  };
  const ts = getThemeStyles();

  const handleCreateOrder = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (activeTab === 'food_delivery') {
          // Create Restaurant Order for Food Delivery
          if (cart.length === 0) {
              addNotification("الرجاء إضافة عناصر للسلة", "warning");
              return;
          }
          const orderTotal = cart.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0);
          const newOrder: RestaurantOrder = {
              id: `del-${Date.now()}`,
              items: cart,
              totalAmount: orderTotal,
              status: 'pending',
              type: 'delivery',
              source: 'restaurant',
              targetNumber: customerName,
              customerName: customerName,
              deliveryAddress: address,
              timestamp: new Date().toISOString(),
              notes: `Phone: ${phone} - ${details}`
          };
          addRestaurantOrder(newOrder);
          addNotification("تم إرسال طلب الطعام إلى المطبخ (Restaurant System)", "success");
      } else {
          // Generic External Order
          addExternalOrder({
              type: activeTab,
              customerName,
              phone,
              address,
              details,
              totalAmount
          });
      }
      
      setShowOrderModal(false);
      // Reset form
      setCustomerName('');
      setPhone('');
      setAddress('');
      setDetails('');
      setTotalAmount(0);
      setCart([]);
  };

  // Filter Logic
  const filteredOrders = activeTab === 'food_delivery' 
      ? restaurantOrders.filter(o => o.type === 'delivery') 
      : externalOrders.filter(o => o.type === activeTab);

  const services = [
      { id: 'food_delivery', label: 'توصيل الطعام (Restaurant)', icon: Utensils },
      { id: 'transport', label: 'نقل الأفراد', icon: Car },
      { id: 'catering', label: 'تموين خارجي', icon: Package },
      { id: 'laundry_pickup', label: 'غسيل وتوصيل', icon: Shirt },
      { id: 'cleaning_service', label: 'تنظيف منزلي', icon: Sparkles },
  ];

  // Cart Helpers
  const addToCart = (item: MenuItem) => {
      setCart(prev => {
          const existing = prev.find(i => i.item.id === item.id);
          if (existing) return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
          return [...prev, { item, quantity: 1 }];
      });
  };

  const removeFromCart = (itemId: string) => {
      setCart(prev => prev.filter(i => i.item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
      setCart(prev => prev.map(i => {
          if (i.item.id === itemId) return { ...i, quantity: Math.max(0, i.quantity + delta) };
          return i;
      }).filter(i => i.quantity > 0));
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
        <PageHeader pageKey="external_services" defaultTitle="خدمات خارجية (المنافسة)" icon={Truck} />

        {/* Service Tabs */}
        <div className="flex overflow-x-auto pb-2 gap-3 scrollbar-hide">
            {services.map((service: any) => (
                <button
                    key={service.id}
                    onClick={() => setActiveTab(service.id)}
                    className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition flex items-center gap-2 shadow-sm ${activeTab === service.id ? ts.activeTab : ts.inactiveTab}`}
                >
                    <service.icon size={18} />
                    {service.label}
                </button>
            ))}
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-black opacity-80">الطلبات النشطة ({activeTab === 'food_delivery' ? 'من المطعم' : 'خدمات عامة'})</h2>
            {canManageOrders && (
                <button 
                    onClick={() => setShowOrderModal(true)}
                    className={`px-6 py-3 rounded-xl font-bold shadow-lg transition transform hover:-translate-y-1 flex items-center gap-2 ${ts.button}`}
                >
                    <Plus size={20}/> {activeTab === 'food_delivery' ? 'طلب طعام جديد' : 'طلب خدمة جديد'}
                </button>
            )}
        </div>

        {/* Suggested Quick Actions (Driver/Concierge) */}
        {activeTab !== 'food_delivery' && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {suggestedItems.filter(i => i.type === activeTab).map((item, idx) => (
                    <button 
                        key={idx}
                        onClick={() => {
                            setDetails(item.name);
                            setTotalAmount(item.price);
                            setShowOrderModal(true);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm transition min-w-fit ${ts.itemCard}`}
                    >
                        <Plus size={14} className="text-green-500"/>
                        <span className="text-xs font-bold">{item.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${ts.badge}`}>{item.price} د.ج</span>
                    </button>
                ))}
            </div>
        )}

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredOrders.length === 0 ? (
                <div className={`col-span-full text-center py-12 opacity-50 font-bold ${ts.textSecondary}`}>
                    لا توجد طلبات نشطة في هذا القسم
                </div>
            ) : (
                filteredOrders.map(order => {
                    // Handle RestaurantOrder vs ExternalOrder display
                    const isRestaurantOrder = activeTab === 'food_delivery';
                    // Cast to any to handle both types safely for display
                    const o: any = order; 
                    
                    return (
                    <div key={o.id} className={`p-6 rounded-[2.5rem] shadow-sm border relative overflow-hidden group ${ts.card}`}>
                        {(settings.theme === 'zellige' || (settings.darkMode && settings.theme === 'zellige')) && <div className={`absolute inset-0 pointer-events-none ${ts.pattern}`}></div>}
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                                o.status === 'pending' || o.status === 'preparing' ? (settings.darkMode && settings.theme === 'zellige' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800' : 'bg-yellow-100 text-yellow-700') :
                                o.status === 'accepted' ? (settings.darkMode && settings.theme === 'zellige' ? 'bg-blue-900/30 text-blue-400 border border-blue-800' : 'bg-blue-100 text-blue-700') :
                                o.status === 'in_progress' ? (settings.darkMode && settings.theme === 'zellige' ? 'bg-purple-900/30 text-purple-400 border border-purple-800' : 'bg-purple-100 text-purple-700') :
                                o.status === 'delivered' || o.status === 'completed' ? (settings.darkMode && settings.theme === 'zellige' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-green-100 text-green-700') :
                                (settings.darkMode && settings.theme === 'zellige' ? 'bg-red-900/30 text-red-400 border border-red-800' : 'bg-red-100 text-red-700')
                            }`}>
                                {o.status === 'pending' ? 'قيد الانتظار' : 
                                 o.status === 'preparing' ? 'جاري التحضير' :
                                 o.status === 'accepted' ? 'تم القبول' :
                                 o.status === 'in_progress' ? 'جاري التنفيذ' :
                                 o.status === 'delivered' || o.status === 'completed' ? 'تم التسليم' : 'ملغي'}
                            </div>
                            <span className={`font-mono font-bold text-lg ${ts.textPrimary}`}>{o.totalAmount} د.ج</span>
                        </div>

                        <div className="space-y-3 mb-6 relative z-10">
                            <div className={`flex items-center gap-3 opacity-80 ${ts.textPrimary}`}>
                                <User size={16}/> <span className="font-bold text-sm">{isRestaurantOrder ? o.targetNumber : o.customerName}</span>
                            </div>
                            {/* For Restaurant Orders, phone/address are in notes */}
                            {isRestaurantOrder ? (
                                <div className={`text-xs opacity-70 p-2 rounded-lg ${ts.badge}`}>
                                    {o.notes}
                                </div>
                            ) : (
                                <>
                                    <div className={`flex items-center gap-3 opacity-80 ${ts.textPrimary}`}>
                                        <Phone size={16}/> <span className="font-bold text-sm font-mono" dir="ltr">{o.phone}</span>
                                    </div>
                                    <div className={`flex items-center gap-3 opacity-80 ${ts.textPrimary}`}>
                                        <MapPin size={16}/> <span className="font-bold text-sm line-clamp-1">{o.address}</span>
                                    </div>
                                </>
                            )}
                            
                            {/* Items List for Food Orders */}
                            {isRestaurantOrder && o.items && (
                                <div className={`mt-4 space-y-1 border-t pt-2 border-dashed ${ts.textSecondary} border-current/20`}>
                                    {o.items.map((i: any, idx: number) => (
                                        <div key={idx} className="flex justify-between text-xs font-bold">
                                            <span>{i.item.name} x{i.quantity}</span>
                                            <span>{i.item.price * i.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-auto pt-4 border-t border-black/5 dark:border-white/5 relative z-10">
                            {isRestaurantOrder ? (
                                <>
                                    <PrintButton 
                                        title={`Delivery QR - ${o.id}`}
                                        label="طباعة"
                                        className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition"
                                        htmlContent={`
                                            <div style="text-align: center; padding: 20px; border: 2px solid #000; border-radius: 10px;">
                                                <h1>Delivery #${o.id.slice(-4)}</h1>
                                                <p>${o.targetNumber}</p>
                                                <p>${o.notes}</p>
                                                <hr/>
                                                ${o.items.map((i: any) => `<p>${i.item.name} x${i.quantity} - ${i.item.price * i.quantity}</p>`).join('')}
                                                <h3>Total: ${o.totalAmount}</h3>
                                            </div>
                                        `}
                                    />
                                    {o.status === 'pending' && (
                                        <button onClick={() => updateRestaurantOrder(o.id, 'preparing')} className="flex-1 py-2 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition">بدء التحضير</button>
                                    )}
                                    {o.status === 'preparing' && (
                                        <button onClick={() => updateRestaurantOrder(o.id, 'completed')} className="flex-1 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition">تم التسليم</button>
                                    )}
                                </>
                            ) : (
                                <>
                                    {o.status === 'pending' && (
                                        <>
                                            <button onClick={() => updateExternalOrderStatus(o.id, 'accepted')} className="flex-1 py-2 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition">قبول</button>
                                            <button onClick={() => updateExternalOrderStatus(o.id, 'cancelled')} className="flex-1 py-2 bg-red-100 text-red-600 rounded-xl font-bold text-sm hover:bg-red-200 transition">رفض</button>
                                        </>
                                    )}
                                    {o.status === 'accepted' && (
                                        <button onClick={() => updateExternalOrderStatus(o.id, 'in_progress')} className="flex-1 py-2 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition">بدء التنفيذ</button>
                                    )}
                                    {o.status === 'in_progress' && (
                                        <button onClick={() => updateExternalOrderStatus(o.id, 'delivered')} className="flex-1 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition">إتمام التسليم</button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )})
            )}
        </div>

        {/* New Order Modal */}
        {showOrderModal && (
            <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end justify-center p-0 overflow-hidden" onClick={() => setShowOrderModal(false)}>
                <div className={`w-full max-w-full rounded-t-[2.5rem] p-8 shadow-2xl animate-fade-in-up h-[95dvh] overflow-hidden flex flex-col ${ts.modalBg} relative`} onClick={e => e.stopPropagation()}>
                    {(settings.theme === 'zellige' || (settings.darkMode && settings.theme === 'zellige')) && <div className={`absolute inset-0 pointer-events-none ${ts.pattern}`}></div>}
                    <div className="flex justify-between items-center mb-6 shrink-0 relative z-10">
                        <h3 className="text-2xl font-black flex items-center gap-2">
                            <Plus size={24}/> {activeTab === 'food_delivery' ? 'طلب طعام (قائمة المطعم)' : `طلب جديد (${services.find(s => s.id === activeTab)?.label})`}
                        </h3>
                        <button onClick={() => setShowOrderModal(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-black"><X size={20}/></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
                        <form onSubmit={handleCreateOrder} className="space-y-6">
                            {/* Customer Details Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-xs font-bold mb-1 opacity-70 ${ts.textSecondary}`}>اسم العميل</label>
                                    <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className={`w-full p-3 rounded-xl outline-none border-2 font-bold ${ts.input}`} />
                                </div>
                                <div>
                                    <label className={`block text-xs font-bold mb-1 opacity-70 ${ts.textSecondary}`}>رقم الهاتف</label>
                                    <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={`w-full p-3 rounded-xl outline-none border-2 font-bold font-mono ${ts.input}`} dir="ltr" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={`block text-xs font-bold mb-1 opacity-70 ${ts.textSecondary}`}>العنوان</label>
                                    <input required type="text" value={address} onChange={e => setAddress(e.target.value)} className={`w-full p-3 rounded-xl outline-none border-2 font-bold ${ts.input}`} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={`block text-xs font-bold mb-1 opacity-70 ${ts.textSecondary}`}>ملاحظات / تفاصيل</label>
                                    <textarea value={details} onChange={e => setDetails(e.target.value)} className={`w-full p-3 rounded-xl outline-none border-2 font-bold min-h-[60px] ${ts.input}`} />
                                </div>
                            </div>

                            {/* Menu Selection Section (Only for Food Delivery) */}
                            {activeTab === 'food_delivery' ? (
                                <div className="border-t pt-6 border-current/10">
                                    <h4 className="font-black text-lg mb-4 flex items-center gap-2"><Utensils size={18}/> اختر من القائمة</h4>
                                    
                                    {/* Categories */}
                                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                                        {['all', 'meal', 'breakfast', 'hot_drink', 'cold_drink', 'dessert'].map(cat => (
                                            <button 
                                                key={cat} 
                                                type="button"
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border ${selectedCategory === cat ? ts.activeTab : `bg-transparent border-current opacity-60 hover:opacity-100 ${ts.textSecondary}`}`}
                                            >
                                                {cat === 'all' ? 'الكل' : cat}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Menu Items */}
                                        <div className={`h-64 overflow-y-auto custom-scrollbar border rounded-2xl p-2 ${ts.cartBg} bg-opacity-50`}>
                                            <div className="grid grid-cols-2 gap-2">
                                                {menuItems
                                                    .filter(item => (selectedCategory === 'all' || item.category === selectedCategory) && item.isAvailable)
                                                    .map(item => (
                                                    <button 
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => addToCart(item)}
                                                        className={`p-2 rounded-xl border shadow-sm hover:shadow-md transition text-right flex flex-col gap-1 ${ts.itemCard}`}
                                                    >
                                                        <span className="font-bold text-xs line-clamp-1">{item.name}</span>
                                                        <span className="text-[10px] opacity-70">{item.price} د.ج</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Cart Preview */}
                                        <div className={`h-64 overflow-y-auto custom-scrollbar border rounded-2xl p-4 shadow-inner flex flex-col ${ts.cartBg}`}>
                                            <h5 className="font-bold text-sm mb-2 flex items-center gap-2"><ShoppingBag size={14}/> السلة الحالية</h5>
                                            <div className="flex-1 space-y-2">
                                                {cart.length === 0 && <p className="text-center opacity-50 text-xs py-10">السلة فارغة</p>}
                                                {cart.map((line, idx) => (
                                                    <div key={idx} className={`flex justify-between items-center p-2 rounded-lg text-xs ${ts.badge}`}>
                                                        <div className="flex items-center gap-2">
                                                            <button type="button" onClick={() => updateQuantity(line.item.id, 1)} className="w-5 h-5 bg-white/20 rounded shadow flex items-center justify-center"><Plus size={10}/></button>
                                                            <span className="font-bold w-4 text-center">{line.quantity}</span>
                                                            <button type="button" onClick={() => updateQuantity(line.item.id, -1)} className="w-5 h-5 bg-white/20 rounded shadow flex items-center justify-center"><Minus size={10}/></button>
                                                            <span className="font-bold">{line.item.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span>{line.item.price * line.quantity}</span>
                                                            <button type="button" onClick={() => removeFromCart(line.item.id)} className="text-red-500 hover:text-red-600"><X size={12}/></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-auto pt-2 border-t border-current/10 flex justify-between font-black">
                                                <span>المجموع</span>
                                                <span>{cart.reduce((a, c) => a + (c.item.price * c.quantity), 0)} د.ج</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className={`block text-xs font-bold mb-1 opacity-70 ${ts.textSecondary}`}>المبلغ الإجمالي (د.ج)</label>
                                    <div className="relative">
                                        <input required type="number" value={totalAmount} onChange={e => setTotalAmount(Number(e.target.value))} className={`w-full p-3 rounded-xl outline-none border-2 font-bold font-mono ${ts.input}`} />
                                        <DollarSign size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 opacity-50 ${ts.textPrimary}`}/>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4 border-t border-current/10">
                                <button type="button" onClick={() => setShowOrderModal(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-bold text-sm transition hover:bg-gray-200 text-gray-600 dark:text-gray-300">إلغاء</button>
                                <button type="submit" className={`flex-[2] py-3 rounded-xl font-black shadow-lg transition transform active:scale-95 ${ts.button}`}>
                                    {activeTab === 'food_delivery' ? `تأكيد الطلب (${cart.reduce((a, c) => a + (c.item.price * c.quantity), 0)} د.ج)` : 'إنشاء الطلب'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
