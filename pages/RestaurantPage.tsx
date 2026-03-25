import React, { useState, useMemo } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { Coffee, Plus, ShoppingCart, CheckCircle, X, Menu, Edit3, Trash2, Save, Tag, User, House, Home, ShoppingBag, Search, Utensils, Zap, Filter, BedDouble, LayoutGrid, RotateCcw, Clock, CreditCard, Settings, Layout, Grid, Check, QrCode, Truck, Phone, MapPin, Printer, Waves, ChefHat, Info } from 'lucide-react';
import { PaymentModal } from '../components/PaymentModal';
import { MenuItem, RestaurantOrder, Table } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { renderToStaticMarkup } from 'react-dom/server';
import { printDocument } from '../utils/print';

interface RestaurantPageProps {
    mode: 'restaurant' | 'cafe';
}

const LayoutEditorModal: React.FC<{
    onClose: () => void;
    onSave: (table: Table) => void;
    initialData?: Partial<Table>;
    theme: string;
    mode: 'restaurant' | 'cafe';
    darkMode: boolean;
}> = ({ onClose, onSave, initialData, theme, mode, darkMode }) => {
    const [formData, setFormData] = useState<Partial<Table>>({
        number: '',
        capacity: 4,
        status: 'available',
        zone: 'main_hall',
        location: mode,
        ...initialData
    });

    const isZellige = theme === 'zellige' || theme === 'zellige-v2';
    // Radical Fix: Dark mode overrides theme styles
    const inputStyle = darkMode 
        ? isZellige 
            ? "border-[#cca43b]/40 focus:border-[#cca43b] bg-[#001e21] text-[#cca43b] placeholder-[#cca43b]/40"
            : "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
        : isZellige
            ? "border-[#cca43b]/40 focus:border-[#006269] bg-[#fbf8f1] text-[#006269] placeholder-[#006269]/40"
            : "border-gray-200 bg-white text-gray-900 placeholder-gray-400";

    const btnStyle = darkMode
        ? isZellige
            ? "bg-[#cca43b] text-[#001e21] hover:bg-[#b08d30] font-bold"
            : "bg-blue-600 text-white hover:bg-blue-700"
        : isZellige
            ? "bg-[#006269] text-[#cca43b] hover:bg-[#004d53] shadow-lg shadow-[#006269]/20"
            : "bg-blue-600 text-white hover:bg-blue-700";

    const zones = [
        { id: 'main_hall', label: 'القاعة الرئيسية' },
        { id: 'terrace', label: 'الشرفة / التراس' },
        { id: 'vip_corner', label: 'جناح VIP' },
        { id: 'garden', label: 'الحديقة الخارجية' }
    ];

    return (
        <Modal isOpen={true} onClose={onClose} title={initialData ? 'تعديل الطاولة' : 'إضافة طاولة جديدة'} size="sm">
            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold mb-2 opacity-70">رقم الطاولة / الاسم</label>
                    <input 
                        type="text" 
                        className={`w-full p-4 rounded-2xl border-2 font-black text-center text-xl outline-none ${inputStyle}`}
                        value={formData.number}
                        onChange={e => setFormData({...formData, number: e.target.value})}
                        placeholder="A1, 10, VIP..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold mb-2 opacity-70">عدد المقاعد</label>
                        <input 
                            type="number" 
                            className={`w-full p-3 rounded-xl border-2 font-bold text-center outline-none ${inputStyle}`}
                            value={formData.capacity}
                            onChange={e => setFormData({...formData, capacity: Number(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-2 opacity-70">التصنيف</label>
                        <input 
                            type="text" 
                            className={`w-full p-3 rounded-xl border-2 font-bold text-center outline-none ${inputStyle}`}
                            value={formData.classification || ''}
                            onChange={e => setFormData({...formData, classification: e.target.value})}
                            placeholder="VIP, عائلي..."
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold mb-2 opacity-70">المنطقة</label>
                    <select 
                        className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${inputStyle}`}
                        value={formData.zone}
                        onChange={e => setFormData({...formData, zone: e.target.value as any})}
                    >
                        {zones.map(z => <option key={z.id} value={z.id}>{z.label}</option>)}
                    </select>
                </div>

                <div className="pt-4 flex gap-3">
                    <button onClick={onClose} className={`flex-1 py-3 rounded-xl font-bold ${darkMode && theme === 'zellige' ? 'bg-[#cca43b]/10 text-[#cca43b] hover:bg-[#cca43b]/20' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>إلغاء</button>
                    <button 
                        onClick={() => {
                            if (formData.number) onSave(formData as Table);
                        }} 
                        className={`flex-[2] py-3 rounded-xl font-black transition flex items-center justify-center gap-2 ${btnStyle}`}
                    >
                        <Check size={20}/> حفظ التغييرات
                    </button>
                </div>
            </div>
        </Modal>
    );
};

import { PrintButton } from '../components/PrintButton';

export const MenuEditorModal: React.FC<{
    onClose: () => void;
    onSave: (item: any) => void;
    initialData?: Partial<MenuItem>;
    theme: string;
    darkMode: boolean;
}> = ({ onClose, onSave, initialData, theme, darkMode }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        category: 'meal',
        description: '',
        isAvailable: true,
        ...initialData
    });

    const isZellige = theme === 'zellige' || theme === 'zellige-v2';
    // Radical Fix: Dark mode overrides theme styles
    const inputStyle = darkMode 
        ? isZellige 
            ? "border-[#cca43b]/40 focus:border-[#cca43b] bg-[#001e21] text-[#cca43b] placeholder-[#cca43b]/40"
            : "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
        : isZellige 
            ? "border-[#cca43b]/40 focus:border-[#006269] bg-[#fbf8f1] text-[#006269]" 
            : "border-gray-200 bg-white text-gray-900";
            
    const btnStyle = darkMode
        ? isZellige
            ? "bg-[#cca43b] text-[#001e21] hover:bg-[#b08d30] font-bold"
            : "bg-blue-600 text-white hover:bg-blue-700"
        : isZellige 
            ? "bg-[#006269] text-[#cca43b] hover:bg-[#004d53]" 
            : "bg-blue-600 text-white hover:bg-blue-700";

    return (
        <Modal isOpen={true} onClose={onClose} title={initialData?.id ? 'تعديل عنصر' : 'عنصر جديد'} size="sm">
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold mb-1">اسم العنصر</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${inputStyle}`} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold mb-1">السعر</label>
                        <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${inputStyle}`} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-1">التصنيف</label>
                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${inputStyle}`}>
                            <option value="meal">وجبة رئيسية</option>
                            <option value="breakfast">فطور</option>
                            <option value="hot_drink">مشروب ساخن</option>
                            <option value="cold_drink">مشروب بارد</option>
                            <option value="dessert">حلى</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold mb-1">الوصف</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold outline-none h-24 resize-none ${inputStyle}`} />
                </div>
                
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${darkMode && theme === 'zellige' ? 'bg-[#002a2d] border-[#cca43b]/30 text-[#cca43b]' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                    <input 
                        type="checkbox" 
                        id="isAvailable" 
                        checked={formData.isAvailable} 
                        onChange={e => setFormData({...formData, isAvailable: e.target.checked})}
                        className={`w-5 h-5 rounded focus:ring-2 ${darkMode && theme === 'zellige' ? 'text-[#cca43b] focus:ring-[#cca43b]/50 bg-[#001e21] border-[#cca43b]/50' : 'text-blue-600 focus:ring-blue-500'}`}
                    />
                    <label htmlFor="isAvailable" className="font-bold text-sm cursor-pointer select-none">
                        متوفر للطلب (Available)
                    </label>
                </div>

                <button onClick={() => onSave(formData)} className={`w-full py-3 rounded-xl font-black mt-4 ${btnStyle}`}>حفظ</button>
            </div>
        </Modal>
    );
};

import { OrderManagementModal } from '../components/OrderManagementModal';

export const RestaurantPage: React.FC<RestaurantPageProps> = ({ mode }) => {
  const { 
      menuItems, addRestaurantOrder, updateRestaurantOrderItems, settings, restaurantOrders, 
      restaurantTables, updateTableStatus, addTransaction, bookings, rooms, 
      chargeOrderToRoom, currentUser, updateRestaurantOrder,
      addTable, removeTable, updateTableDetails, 
      addMenuItem, updateMenuItem, deleteMenuItem, generateSystemQR, addNotification 
  } = useHotel();

  const [activeTab, setActiveTab] = useState<'kitchen' | 'delivery' | 'kitchen_modal'>('kitchen');
  const [showTablesModal, setShowTablesModal] = useState(false);
  const [showMenuManagerModal, setShowMenuManagerModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<RestaurantOrder | null>(null);
  
  // Layout Edit Mode
  const [isLayoutMode, setIsLayoutMode] = useState(false);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [showLayoutModal, setShowLayoutModal] = useState(false);

  // QR Display State
  const [showTableQR, setShowTableQR] = useState<Table | null>(null);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [lastOrderQR, setLastOrderQR] = useState<string>('');
  const [lastOrderDetails, setLastOrderDetails] = useState<RestaurantOrder | null>(null);

  // Cart & Menu State
  const [cart, setCart] = useState<{ item: MenuItem, quantity: number }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Delivery State
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryModalTab, setDeliveryModalTab] = useState<'selection' | 'customer' | 'menu' | 'cart' | 'notes'>('selection');
  const [deliveryDetails, setDeliveryDetails] = useState({ name: '', phone: '', address: '', notes: '' });
  const [mobileOrderTab, setMobileOrderTab] = useState<'menu' | 'cart'>('menu');

  const handleSaveMenuItem = (item: any) => {
      if (editingItem?.id) {
          updateMenuItem(editingItem.id, item);
      } else {
          addMenuItem(item);
      }
      setShowMenuModal(false);
      setEditingItem(null);
  };

  // Permission Check
  if (currentUser?.role === 'restaurant_manager' && mode === 'cafe') return <div className="p-20 text-center text-red-500 font-bold">وصول غير مصرح (إدارة المطعم فقط)</div>;
  if (currentUser?.role === 'cafe_manager' && mode === 'restaurant') return <div className="p-20 text-center text-red-500 font-bold">وصول غير مصرح (إدارة المقهى فقط)</div>;

  const isManager = currentUser?.role === 'manager' || currentUser?.role === 'restaurant_manager' || currentUser?.role === 'cafe_manager';
  const isRestaurant = mode === 'restaurant';
  const pageTitle = isRestaurant ? "إدارة المطعم والمطبخ" : "إدارة المقهى (Coffee Shop)";
  const PageIcon = isRestaurant ? Utensils : Coffee;

  const getThemeStyles = () => {
      // Radical Fix: Dark mode overrides all themes for consistency but respects theme identity
      if (settings.darkMode) {
          if (settings.theme === 'zellige') {
              return {
                  button: 'bg-[#cca43b] text-[#001e21] hover:bg-[#b08d30] font-bold border border-[#cca43b]',
                  activeTab: 'bg-[#cca43b] text-[#001e21] border-[#cca43b] shadow-md',
                  modalBg: 'bg-[#001e21] text-[#cca43b] border border-[#cca43b]/30 relative overflow-hidden',
                  modalHeader: 'bg-[#002a2d] text-[#cca43b] border-b border-[#cca43b]/20',
                  input: 'border-[#cca43b]/40 focus:border-[#cca43b] bg-[#001517] text-[#cca43b] placeholder-[#cca43b]/40',
                  tableAvailable: 'bg-[#002a2d] border-[#cca43b]/30 text-[#cca43b] hover:border-[#cca43b]',
                  tableOccupied: 'bg-red-900/20 border-red-500/30 text-red-400',
                  tableReserved: 'bg-orange-900/20 border-orange-500/30 text-orange-400',
                  editModeBar: 'bg-[#002a2d] border-[#cca43b] text-[#cca43b]'
              };
          }
           if (settings.theme === 'algerian-military') {
              return {
                  button: 'bg-[#D4AF37] text-[#1a211a] hover:bg-[#b08d30] border border-[#D4AF37]',
                  activeTab: 'bg-[#D4AF37] text-[#1a211a] border border-[#D4AF37]',
                  modalBg: 'bg-[#0f140f]',
                  modalHeader: 'bg-[#1a211a] text-[#D4AF37] border-b border-[#D4AF37]/30',
                  input: 'border-[#D4AF37]/40 focus:border-[#D4AF37] bg-[#0f140f] text-[#D4AF37] placeholder-[#D4AF37]/40',
                  tableAvailable: 'bg-[#1a211a] border-[#D4AF37]/30 text-[#D4AF37]',
                  tableOccupied: 'bg-red-900/40 border-red-700/50 text-red-300',
                  tableReserved: 'bg-orange-900/40 border-orange-700/50 text-orange-300',
                  editModeBar: 'bg-[#1a211a] border-[#D4AF37] text-[#D4AF37]'
              };
          }
          if (settings.theme === 'modern-ornate') {
              return {
                  button: 'bg-[#ffd700] text-[#2d0b3d] hover:bg-[#e6c200] border border-[#ffd700]',
                  activeTab: 'bg-[#ffd700] text-[#2d0b3d] border border-[#ffd700]',
                  modalBg: 'bg-[#2d0b3d]',
                  modalHeader: 'bg-[#2d0b3d] text-[#ffd700] border-b border-[#ffd700]/30',
                  input: 'border-[#ffd700]/40 focus:border-[#ffd700] bg-[#1a0524] text-[#ffd700] placeholder-[#ffd700]/40',
                  tableAvailable: 'bg-[#2d0b3d] border-[#ffd700]/30 text-[#ffd700]',
                  tableOccupied: 'bg-red-900/40 border-red-700/50 text-red-300',
                  tableReserved: 'bg-orange-900/40 border-orange-700/50 text-orange-300',
                  editModeBar: 'bg-[#2d0b3d] border-[#ffd700] text-[#ffd700]'
              };
          }
          return {
              button: isRestaurant ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-amber-700 text-white hover:bg-amber-800',
              activeTab: isRestaurant ? 'bg-orange-600 text-white border-orange-600' : 'bg-amber-700 text-white border-amber-700',
              modalBg: 'bg-white dark:bg-gray-900',
              modalHeader: 'bg-slate-900 text-white',
              input: 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
              tableAvailable: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300',
              tableOccupied: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-300',
              tableReserved: 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-300',
              editModeBar: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200'
          };
      }

      switch (settings.theme) {
          case 'zellige': return {
              button: 'bg-[#006269] text-[#cca43b] hover:bg-[#004d53] shadow-lg shadow-[#006269]/20',
              activeTab: 'bg-[#006269] text-[#cca43b] border-[#cca43b] shadow-md',
              modalBg: 'bg-[#FDFBF7] relative overflow-hidden',
              modalHeader: 'bg-[#006269] text-[#cca43b] border-b border-[#cca43b]/20',
              input: 'border-[#cca43b]/30 focus:border-[#006269] bg-[#fbf8f1] text-[#006269] placeholder-[#cca43b]/50',
              tableAvailable: 'bg-white border-[#cca43b]/30 text-[#006269] hover:border-[#006269] shadow-sm',
              tableOccupied: 'bg-red-50 border-red-200 text-red-700',
              tableReserved: 'bg-orange-50 border-orange-200 text-orange-700',
              editModeBar: 'bg-[#fbf8f1] border-[#cca43b] text-[#006269]'
          };
          case 'algerian-military': return {
              button: 'bg-[#2F3E2E] text-[#D4AF37] hover:bg-[#4B5320] border border-[#D4AF37]',
              activeTab: 'bg-[#2F3E2E] text-[#D4AF37] border border-[#D4AF37]',
              modalBg: 'bg-[#F0EFEA]',
              modalHeader: 'bg-[#2F3E2E] text-[#D4AF37]',
              input: 'border-[#D4AF37]/40 focus:border-[#2F3E2E] bg-[#F0EFEA] text-[#2F3E2E]',
              tableAvailable: 'bg-[#E5E5E0] border-[#D4AF37]/30 text-[#2F3E2E]',
              tableOccupied: 'bg-red-50 border-red-200 text-red-700',
              tableReserved: 'bg-orange-50 border-orange-200 text-orange-700',
              editModeBar: 'bg-[#E5E5E0] border-[#D4AF37] text-[#2F3E2E]'
          };
          case 'modern-ornate': return {
              button: 'bg-[#4a148c] text-[#ffd700] hover:bg-[#380d6b] border border-[#ffd700]',
              activeTab: 'bg-[#4a148c] text-[#ffd700] border border-[#ffd700]',
              modalBg: 'bg-[#f3e5f5]',
              modalHeader: 'bg-[#4a148c] text-[#ffd700]',
              input: 'border-[#ffd700]/40 focus:border-[#4a148c] bg-white text-[#4a148c]',
              tableAvailable: 'bg-white border-[#ffd700]/30 text-[#4a148c]',
              tableOccupied: 'bg-red-50 border-red-200 text-red-700',
              tableReserved: 'bg-orange-50 border-orange-200 text-orange-700',
              editModeBar: 'bg-[#f3e5f5] border-[#ffd700] text-[#4a148c]'
          };
          default: return {
              button: isRestaurant ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-amber-700 text-white hover:bg-amber-800',
              activeTab: isRestaurant ? 'bg-orange-600 text-white border-orange-600' : 'bg-amber-700 text-white border-amber-700',
              modalBg: 'bg-white dark:bg-gray-900',
              modalHeader: 'bg-slate-900 text-white',
              input: 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
              tableAvailable: 'bg-white border-gray-200 text-gray-600',
              tableOccupied: 'bg-red-50 border-red-200 text-red-600',
              tableReserved: 'bg-orange-50 border-orange-200 text-orange-600',
              editModeBar: 'bg-yellow-50 border-yellow-200 text-yellow-800'
          };
      }
  };
  const ts = getThemeStyles();

  // --- Filtering Logic ---
  const currentTables = restaurantTables.filter(t => t.location === mode);
  
  const filterMenuItem = (item: MenuItem) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (isRestaurant) {
          return ['meal', 'breakfast', 'cold_drink', 'dessert'].includes(item.category) && matchesCategory && matchesSearch;
      }
      return ['hot_drink', 'cold_drink', 'dessert', 'meal'].includes(item.category) && matchesCategory && matchesSearch;
  };

  const currentOrders = restaurantOrders.filter(o => o.source === mode);
  const deliveryOrders = currentOrders.filter(o => o.type === 'delivery');

  // --- Handlers ---
  const handleTableClick = (table: Table) => {
      if (isLayoutMode) {
          setEditingTableId(table.id);
          setShowLayoutModal(true);
      } else {
          setSelectedTable(table);
          setCart([]);
          setSelectedCategory('all');
      }
  };

  const handleSaveTable = (tableData: Table) => {
      if (editingTableId) {
          updateTableDetails(editingTableId, tableData);
      } else {
          const newId = `${mode === 'restaurant' ? 'R' : 'C'}-${Date.now().toString().slice(-4)}`;
          addTable({ ...tableData, id: newId, location: mode });
      }
      setShowLayoutModal(false);
      setEditingTableId(null);
  };

  const handleDeleteTable = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (window.confirm("هل أنت متأكد من حذف هذه الطاولة نهائياً؟")) {
          removeTable(id);
      }
  };

  const addToCart = (item: MenuItem) => {
      setCart(prev => {
          const existing = prev.find(i => i.item.id === item.id);
          if (existing) return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
          return [...prev, { item, quantity: 1 }];
      });
  };

  const updateCartItemQuantity = (itemId: string, delta: number) => {
      setCart(prev => prev.map(i => {
          if (i.item.id === itemId) {
              const newQuantity = Math.max(0, i.quantity + delta);
              return { ...i, quantity: newQuantity };
          }
          return i;
      }).filter(i => i.quantity > 0));
  };

  const removeFromCart = (itemId: string) => {
      setCart(prev => prev.filter(i => i.item.id !== itemId));
  };

  const handlePlaceOrder = () => {
      if (!selectedTable || cart.length === 0) return;
      
      // Check if table has an active order
      if (selectedTable.status === 'occupied' && selectedTable.currentOrderId) {
          // Append to existing order
          updateRestaurantOrderItems(selectedTable.currentOrderId, cart);
          addNotification("تم إضافة العناصر للطلب الحالي", "success");
      } else {
          // Create new order
          const totalAmount = cart.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0);
          const newOrder: RestaurantOrder = {
              id: `ord-${Date.now()}`,
              items: cart,
              totalAmount,
              status: 'preparing',
              type: 'dine_in',
              source: mode,
              targetNumber: selectedTable.number,
              tableId: selectedTable.id,
              timestamp: new Date().toISOString()
          };
          addRestaurantOrder(newOrder); 
          
          // Generate QR for the new order
          const qrData = generateSystemQR('TABLE_ORDER', newOrder.id, `Order #${newOrder.id} - ${newOrder.targetNumber}`, 30);
          setLastOrderQR(qrData);
          setLastOrderDetails(newOrder);
          setShowOrderSuccess(true);

          addNotification("تم فتح طاولة جديدة وإرسال الطلب", "success");
      }
      
      setSelectedTable(null);
      setCart([]);
  };



  const handlePlaceDeliveryOrder = () => {
      if (cart.length === 0 || !deliveryDetails.name || !deliveryDetails.phone) return;
      const totalAmount = cart.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0);
      const newOrder: RestaurantOrder = {
          id: `del-${Date.now()}`,
          items: cart,
          totalAmount,
          status: 'preparing',
          type: 'delivery',
          source: mode,
          targetNumber: deliveryDetails.name, // Using name as target
          timestamp: new Date().toISOString(),
          notes: `Phone: ${deliveryDetails.phone}, Address: ${deliveryDetails.address}${deliveryDetails.notes ? ` | Note: ${deliveryDetails.notes}` : ''}`
      };
      addRestaurantOrder(newOrder);
      setShowDeliveryModal(false);
      setCart([]);
      setDeliveryDetails({ name: '', phone: '', address: '', notes: '' });
      addNotification("تم إرسال طلب التوصيل", "success");
  };

  const handleCloseTable = (table: Table) => {
      if (!table.currentOrderId) {
          updateTableStatus(table.id, 'available');
          return;
      }
      const order = restaurantOrders.find(o => o.id === table.currentOrderId);
      if (order) setShowPaymentModal(order);
      else updateTableStatus(table.id, 'available');
  };

  const filteredMenuItems = menuItems.filter(filterMenuItem);

  // NEW: Generate Secure Table QR
  const getTableQRToken = (table: Table) => {
      return generateSystemQR('TABLE_ORDER', table.id, `${mode === 'restaurant' ? 'مطعم' : 'مقهى'} - طاولة ${table.number}`, 365);
  };

  const handlePrintOrderQR = (order: RestaurantOrder) => {
      const qrData = generateSystemQR('TABLE_ORDER', order.id, `Order #${order.id} - ${order.targetNumber}`, 30);
      
      printDocument({
          title: `Order QR - ${order.id}`,
          content: (
              <div className="text-center p-8 border-4 border-black rounded-xl">
                  <h1 className="text-2xl font-black mb-4">Order #{order.id.slice(-4)}</h1>
                  <div className="my-6 inline-block p-4 border-2 border-dashed border-gray-300 rounded-xl">
                      {renderToStaticMarkup(<QRCodeSVG value={qrData} size={200} level="H" includeMargin={true} />)}
                  </div>
                  <p className="text-lg font-bold">{order.targetNumber}</p>
                  <p className="text-sm text-gray-500 mt-2">{new Date(order.timestamp).toLocaleString()}</p>
              </div>
          ),
          settings
      });
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-fade-in pb-20 relative">
        <div className="flex-1 flex flex-col overflow-hidden">
            <PageHeader pageKey={mode} defaultTitle={pageTitle} icon={PageIcon} />
            
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                    <button onClick={() => setShowTablesModal(true)} className={`px-6 py-2 rounded-xl font-bold transition border ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] text-[#cca43b] border-[#cca43b]/30 hover:bg-[#cca43b]/10' : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'}`}><LayoutGrid size={18} className="inline mr-2"/> الصالة (Tables)</button>
                    <button onClick={() => setShowMenuManagerModal(true)} className={`px-6 py-2 rounded-xl font-bold transition border ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] text-[#cca43b] border-[#cca43b]/30 hover:bg-[#cca43b]/10' : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'}`}><Menu size={18} className="inline mr-2"/> القائمة</button>
                    <button onClick={() => setActiveTab('kitchen_modal')} className={`px-6 py-2 rounded-xl font-bold transition border ${ts.activeTab} shadow-lg flex items-center gap-2`}>
                        <ChefHat size={18}/> شاشة المطبخ (Kitchen Monitor)
                    </button>
                    <button onClick={() => setActiveTab('delivery')} className={`px-6 py-2 rounded-xl font-bold transition border ${activeTab === 'delivery' ? ts.activeTab : (settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] text-[#cca43b] border-[#cca43b]/30 hover:bg-[#cca43b]/10' : 'bg-gray-100 text-gray-600 border-transparent dark:bg-gray-800 dark:text-gray-300')}`}><Truck size={18} className="inline mr-2"/> التوصيل</button>
                </div>
                
                {activeTab === 'delivery' && (
                    <button onClick={() => { setCart([]); setDeliveryModalTab('selection'); setShowDeliveryModal(true); }} className={`px-6 py-2.5 rounded-xl font-black shadow-lg flex items-center gap-2 ${ts.button}`}>
                        <Plus size={20}/> طلب توصيل جديد
                    </button>
                )}
            </div>

            {/* --- TABLES MANAGER MODAL --- */}
            <Modal 
                isOpen={showTablesModal} 
                onClose={() => setShowTablesModal(false)} 
                title={
                    <div className="flex items-center justify-between w-full">
                        <span className="flex items-center gap-2"><LayoutGrid size={24}/> إدارة الصالة والطاولات</span>
                        <div className="flex items-center gap-2">
                            {isManager && (
                                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mx-4">
                                    {isLayoutMode && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setEditingTableId(null); setShowLayoutModal(true); }}
                                            className={`px-3 py-1.5 rounded-md font-bold text-xs shadow-sm flex items-center gap-2 animate-bounce ${settings.theme === 'zellige' ? (settings.darkMode ? 'bg-[#cca43b] text-[#001e21]' : 'bg-[#FDFBF7] text-[#006269]') : 'bg-white text-blue-600'}`}
                                        >
                                            <Plus size={14}/> طاولة جديدة
                                        </button>
                                    )}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setIsLayoutMode(!isLayoutMode); }} 
                                        className={`px-3 py-1.5 rounded-md transition-all font-bold text-xs flex items-center gap-2 ${isLayoutMode ? 'bg-red-500 text-white' : (settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] text-[#cca43b] border border-[#cca43b]/30' : 'bg-white/50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-white')}`}
                                    >
                                        {isLayoutMode ? <X size={14} /> : <Settings size={14} />}
                                        <span>{isLayoutMode ? 'إغلاق التعديل' : 'تعديل القاعة'}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                }
                size="xl"
                className="h-[85vh]"
            >
                <div className={`h-full flex flex-col ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#001e21]' : 'bg-gray-50/50 dark:bg-gray-900/50'}`}>
                    {isLayoutMode && (
                        <div className={`p-4 rounded-2xl mb-6 border-l-4 shadow-sm flex items-center justify-between mx-6 mt-6 ${ts.editModeBar}`}>
                            <div className="flex items-center gap-3">
                                <Grid size={24} className="animate-pulse"/>
                                <div>
                                    <h4 className="font-black text-sm">وضع تصميم القاعة مفعل</h4>
                                    <p className="text-xs opacity-70">اضغط على أي طاولة لتعديلها، أو أضف طاولة جديدة.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {currentTables.length === 0 ? (
                            <div className={`text-center py-20 font-bold border-2 border-dashed rounded-3xl flex flex-col items-center gap-4 ${settings.darkMode && settings.theme === 'zellige' ? 'border-[#cca43b]/30 text-[#cca43b]/60' : 'text-gray-400 border-gray-200 dark:border-gray-700'}`}>
                                <Grid size={48} className="opacity-20"/>
                                <p>القاعة فارغة حالياً.</p>
                                {isLayoutMode && (
                                    <button onClick={() => setShowLayoutModal(true)} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-blue-700">إضافة أول طاولة</button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-20">
                                {currentTables.map(table => (
                                    <div 
                                        key={table.id}
                                        onClick={() => handleTableClick(table)}
                                        className={`
                                            relative p-6 rounded-[2.5rem] border-2 flex flex-col items-center justify-center min-h-[180px] cursor-pointer transition-all duration-300 transform group
                                            ${isLayoutMode ? 'hover:scale-[1.02] border-dashed border-gray-400 opacity-90 hover:opacity-100' : 'hover:scale-[1.02] shadow-sm'}
                                            ${!isLayoutMode ? (table.status === 'occupied' ? ts.tableOccupied : table.status === 'reserved' ? ts.tableReserved : ts.tableAvailable) : (settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] text-[#cca43b] border-[#cca43b]/30' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600')}
                                            ${selectedTable?.id === table.id && !isLayoutMode ? (settings.theme === 'zellige' ? 'ring-4 ring-[#cca43b] ring-opacity-50' : 'ring-4 ring-blue-400 ring-opacity-50') : ''}
                                        `}
                                    >
                                        {/* QR Button Overlay */}
                                        {!isLayoutMode && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setShowTableQR(table); }}
                                                className={`absolute top-2 left-2 p-1.5 rounded-full transition opacity-0 group-hover:opacity-100 ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/20 text-[#cca43b] hover:bg-[#cca43b]/40' : 'bg-black/10 hover:bg-black/20 text-current'}`}
                                                title="عرض رمز الطاولة"
                                            >
                                                <QrCode size={16}/>
                                            </button>
                                        )}

                                        {isLayoutMode && (
                                            <div className="absolute top-2 right-2 flex gap-1 z-20">
                                                <div className="bg-blue-100 text-blue-600 p-1.5 rounded-full"><Edit3 size={12}/></div>
                                                <button onClick={(e) => handleDeleteTable(e, table.id)} className="bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition"><Trash2 size={12}/></button>
                                            </div>
                                        )}

                                        <span className="absolute top-4 right-4 text-xs font-bold opacity-60 uppercase">{table.zone.replace('_', ' ')}</span>
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl mb-2 ${table.status === 'occupied' && !isLayoutMode ? 'bg-red-200 text-red-800' : (settings.darkMode && settings.theme === 'zellige' ? 'bg-[#001e21] text-[#cca43b]' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200')}`}>
                                            {table.number}
                                        </div>
                                        <span className="font-bold text-sm uppercase tracking-wider">{table.status}</span>
                                        <div className="mt-3 flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-1 text-xs font-bold opacity-70">
                                                <User size={12}/> {table.capacity} مقاعد
                                            </div>
                                            {table.classification && (
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full mt-1 ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/20 text-[#cca43b]' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                    {table.classification}
                                                </span>
                                            )}
                                        </div>
                                        
                                        {!isLayoutMode && table.status === 'occupied' && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleCloseTable(table); }}
                                                className={`mt-4 px-4 py-2 rounded-xl shadow-sm text-xs font-bold z-10 ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#001e21] text-[#cca43b] hover:bg-[#cca43b]/10 border border-[#cca43b]/30' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                                            >
                                                إغلاق الحساب
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* --- MENU MANAGER MODAL --- */}
            <Modal
                isOpen={showMenuManagerModal}
                onClose={() => setShowMenuManagerModal(false)}
                title={
                    <div className="flex items-center gap-3">
                        <Menu size={24}/> 
                        <span>قائمة الطعام والمشروبات</span>
                    </div>
                }
                size="xl"
                className="h-[85vh]"
            >
                <div className="flex flex-col h-full">
                    <div className={`p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-20 ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] border-[#cca43b]/30' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'}`}>
                            <div className="relative w-full md:w-96">
                                <input 
                                    type="text" 
                                    placeholder="بحث عن صنف..." 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)} 
                                    className={`w-full p-3 pr-10 rounded-xl border-2 font-bold outline-none ${ts.input}`}
                                />
                                <Search size={18} className={`absolute right-3 top-1/2 -translate-y-1/2 opacity-50 ${settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]' : 'text-gray-500'}`}/>
                            </div>
                            <button onClick={() => { setEditingItem({}); setShowMenuModal(true); }} className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg ${ts.button}`}><Plus size={20}/> إضافة صنف جديد</button>
                    </div>

                    <div className={`flex-1 overflow-y-auto p-8 custom-scrollbar ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#001e21]' : 'bg-gray-50/50 dark:bg-gray-900/50'}`}>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-20">
                            {filteredMenuItems.map(item => (
                                <div key={item.id} className={`p-6 rounded-[2.5rem] border shadow-sm relative group hover:shadow-md transition-all duration-300 hover:-translate-y-1 ${!item.isAvailable ? 'opacity-60 grayscale' : ''} ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] border-[#cca43b]/30' : 'bg-white dark:bg-gray-800 dark:border-gray-700'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/20 text-[#cca43b]' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>{item.category}</span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                            <button onClick={() => { setEditingItem(item); setShowMenuModal(true); }} className={`p-2 rounded-full ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/20 text-[#cca43b] hover:bg-[#cca43b]/40' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}><Edit3 size={14}/></button>
                                        </div>
                                    </div>
                                    <h4 className={`font-black text-lg mb-1 line-clamp-1 ${settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]' : 'text-gray-900 dark:text-white'}`}>{item.name}</h4>
                                    <p className={`text-xs line-clamp-2 mb-4 h-8 ${settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]/60' : 'text-gray-400'}`}>{item.description || 'لا يوجد وصف'}</p>
                                    <div className="flex justify-between items-center">
                                        <p className={`font-black text-xl ${settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]' : 'text-gray-900 dark:text-white'}`}>{item.price} <span className={`text-xs font-bold ${settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]/60' : 'text-gray-400'}`}>د.ج</span></p>
                                        {!item.isAvailable && <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-1 rounded-full">غير متوفر</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>

            {/* --- DELIVERY TAB --- */}
            {activeTab === 'delivery' && (
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {deliveryOrders.map(order => (
                            <div key={order.id} className={`p-6 rounded-[2rem] shadow-sm border relative ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] border-[#cca43b]/30 text-[#cca43b]' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="font-black text-lg block flex items-center gap-2"><Truck size={18}/> {order.targetNumber}</span>
                                        <span className={`text-xs font-bold ${settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]/60' : 'text-gray-500'}`}>{new Date(order.timestamp).toLocaleString()}</span>
                                        <span className={`block mt-1 text-[10px] font-black px-2 py-0.5 rounded-md w-fit ${settings.darkMode && settings.theme === 'zellige' ? 'bg-purple-900/30 text-purple-400 border border-purple-800' : 'text-purple-600 bg-purple-100'}`}>طلب خارج الفندق (Out-of-Hotel)</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                        order.status === 'completed' 
                                            ? (settings.darkMode && settings.theme === 'zellige' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-green-100 text-green-700')
                                            : (settings.darkMode && settings.theme === 'zellige' ? 'bg-orange-900/30 text-orange-400 border border-orange-800' : 'bg-orange-100 text-orange-700')
                                    }`}>{order.status}</span>
                                </div>
                                <div className={`p-3 rounded-xl text-xs font-mono mb-4 ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#001e21] text-[#cca43b]/80' : 'bg-gray-50 text-gray-600'}`}>
                                    {order.notes}
                                </div>
                                <div className="space-y-2 mb-4">
                                    {order.items.map((i, idx) => (
                                        <div key={idx} className="flex justify-between text-sm font-bold">
                                            <span>{i.item.name} x{i.quantity}</span>
                                            <span>{i.item.price * i.quantity}</span>
                                        </div>
                                    ))}
                                    <div className="border-t pt-2 flex justify-between font-black text-lg border-current/10">
                                        <span>المجموع</span>
                                        <span>{order.totalAmount} د.ج</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <PrintButton 
                                        title={`Order QR - ${order.id}`}
                                        label=""
                                        className={`p-2 rounded-xl transition ${settings.darkMode && settings.theme === 'zellige' ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}
                                        qrCodeValue={generateSystemQR('TABLE_ORDER', order.id, `Order #${order.id} - ${order.targetNumber}`, 30)}
                                        instantPrint={true}
                                        htmlContent={`
                                            <div style="text-align: center; padding: 20px; border: 2px solid #000; border-radius: 10px;">
                                                <h1>Order #${order.id.slice(-4)}</h1>
                                                <p>${order.targetNumber}</p>
                                                <p>${new Date(order.timestamp).toLocaleString()}</p>
                                                <p><strong>طلب خارجي / Out-of-Hotel</strong></p>
                                            </div>
                                        `}
                                    />
                                    <button onClick={() => setShowPaymentModal(order)} className={`flex-1 py-2 rounded-xl font-bold transition ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b] text-[#001e21] hover:bg-[#b08d30]' : 'bg-green-600 text-white hover:bg-green-700'}`}>إتمام الطلب</button>
                                </div>
                            </div>
                        ))}
                        {deliveryOrders.length === 0 && (
                            <div className={`col-span-full py-20 text-center font-bold flex flex-col items-center gap-4 ${settings.darkMode && settings.theme === 'zellige' ? 'text-[#cca43b]/40' : 'text-gray-400'}`}>
                                <Truck size={48} className="opacity-20"/>
                                <p>لا توجد طلبات توصيل نشطة (خارج الفندق).</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- KITCHEN MONITOR MODAL --- */}
            <Modal
                isOpen={activeTab === 'kitchen_modal'}
                onClose={() => setActiveTab('kitchen')} // Revert to default or previous
                title={
                    <div className="flex items-center gap-3 text-red-600">
                        <ChefHat size={28}/> 
                        <span className="font-black text-2xl">شاشة المطبخ (Kitchen Monitor)</span>
                    </div>
                }
                size="xl"
                className="h-[90vh] bg-slate-900 text-white"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar p-4 h-full bg-slate-900">
                    {currentOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center h-full opacity-50">
                            <CheckCircle size={64} className="mb-4 text-green-500"/>
                            <h3 className="text-2xl font-bold">لا توجد طلبات نشطة</h3>
                            <p>المطبخ جاهز لاستقبال الطلبات</p>
                        </div>
                    ) : (
                        currentOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').map(order => (
                            <div key={order.id} className="p-6 rounded-[2rem] shadow-xl border-l-8 relative bg-slate-800 border-l-orange-500 text-white animate-fade-in">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="font-black text-2xl block flex items-center gap-2 mb-2">
                                            {order.type === 'delivery' ? <><Truck size={24} className="text-purple-400"/> {order.targetNumber}</> : 
                                             order.type === 'room_service' ? <><BedDouble size={24} className="text-indigo-400"/> {order.targetNumber}</> :
                                             order.type === 'pool_side' ? <><Waves size={24} className="text-cyan-400"/> {order.targetNumber}</> :
                                             <span className="text-orange-400">#{order.targetNumber}</span>}
                                        </span>
                                        <div className="flex gap-2">
                                            <span className="text-xs font-mono bg-black/30 px-2 py-1 rounded text-gray-400">{new Date(order.timestamp).toLocaleTimeString()}</span>
                                            <span className="text-xs font-bold px-2 py-1 rounded bg-white/10 text-white">
                                                {Math.floor((new Date().getTime() - new Date(order.timestamp).getTime()) / 60000)} دقيقة
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-lg text-sm font-black uppercase tracking-wider ${
                                        order.status === 'preparing' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' : 
                                        order.status === 'pending' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 
                                        'bg-blue-500/20 text-blue-400'
                                    }`}>{order.status}</span>
                                </div>
                                
                                <div className="space-y-3 mb-6 border-t border-b border-white/10 py-4 my-4">
                                    {order.items.map((i, idx) => (
                                        <div key={idx} className="flex justify-between text-lg font-bold items-center">
                                            <span className="flex items-center gap-2">
                                                <span className="bg-white/10 w-8 h-8 flex items-center justify-center rounded-full text-sm">{i.quantity}</span>
                                                {i.item.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {order.notes && (
                                    <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-xl text-red-200 text-sm font-bold flex gap-2">
                                        <Info size={16} className="shrink-0 mt-0.5"/>
                                        {order.notes}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => updateRestaurantOrder(order.id, 'completed')}
                                        className="flex-1 py-4 rounded-xl font-black shadow-lg flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white transition transform active:scale-95"
                                    >
                                        <CheckCircle size={24}/> جاهز للتقديم
                                    </button>
                                    <button 
                                        onClick={() => handlePrintOrderQR(order)}
                                        className="p-4 rounded-xl font-bold shadow-lg bg-slate-700 hover:bg-slate-600 text-white transition"
                                    >
                                        <Printer size={24}/>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Modal>
        </div>

            {/* --- ORDER MANAGEMENT MODAL --- */}
            {showOrderModal && (
                <OrderManagementModal 
                    isOpen={showOrderModal} 
                    onClose={() => setShowOrderModal(false)} 
                    mode={mode} 
                />
            )}

            {/* --- TABLE ORDER MODAL (POS Style) --- */}
            <Modal
                isOpen={!!selectedTable && !isLayoutMode}
                onClose={() => setSelectedTable(null)}
                title={
                    <div className="flex items-center gap-3 w-full">
                        <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-xl text-sm font-black">{selectedTable?.number}</span>
                        <span>طلب جديد</span>
                    </div>
                }
                size="xl"
                className="h-[85vh] p-0 overflow-hidden flex flex-col"
            >
                <div className="flex flex-col h-full md:flex-row bg-white dark:bg-gray-900">
                     {/* Mobile Tabs */}
                     <div className="md:hidden grid grid-cols-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0">
                        <button onClick={() => setMobileOrderTab('menu')} className={`p-3 font-bold text-sm ${mobileOrderTab === 'menu' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' : 'text-gray-500 dark:text-gray-400'}`}>القائمة</button>
                        <button onClick={() => setMobileOrderTab('cart')} className={`p-3 font-bold text-sm flex items-center justify-center gap-2 ${mobileOrderTab === 'cart' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' : 'text-gray-500 dark:text-gray-400'}`}>
                            السلة 
                            {cart.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{cart.length}</span>}
                        </button>
                     </div>

                    {/* Left: Menu Grid */}
                    <div className={`flex-1 flex flex-col border-l border-gray-200 dark:border-gray-700 relative z-10 ${mobileOrderTab === 'cart' ? 'hidden md:flex' : 'flex'}`}>
                        <div className={`hidden md:block p-6 border-b ${ts.modalHeader}`}>
                            <h3 className="font-black text-2xl flex items-center gap-3">
                                <span className="bg-white/20 p-2 rounded-xl">{selectedTable?.number}</span>
                                <span>قائمة الطلبات</span>
                            </h3>
                        </div>
                        
                        <div className="p-4 border-b bg-gray-50 dark:bg-gray-800/50 flex gap-3 overflow-x-auto scrollbar-hide shrink-0">
                             {/* Categories Filter */}
                             {['all', 'meal', 'breakfast', 'hot_drink', 'cold_drink', 'dessert'].map(cat => (
                                 <button 
                                    key={cat} 
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-xl shadow-sm text-xs font-bold transition uppercase whitespace-nowrap ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'}`}
                                 >
                                    {cat === 'all' ? 'الكل' : cat}
                                 </button>
                             ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50/50 dark:bg-gray-900/50">
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 pb-20 md:pb-0">
                                {filteredMenuItems.map(item => (
                                    <button 
                                        key={item.id} 
                                        onClick={() => { addToCart(item); if(window.innerWidth < 768) addNotification('تمت الإضافة', "success"); }} 
                                        className={`p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] border bg-white dark:bg-gray-800 shadow-sm hover:shadow-md hover:scale-[1.02] transition flex flex-col items-center text-center gap-2 group relative overflow-hidden ${ts.input}`}
                                    >
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-1 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition">
                                            <Utensils size={18} className="opacity-50 group-hover:opacity-100 text-blue-600 dark:text-blue-400"/>
                                        </div>
                                        <span className="font-black text-xs md:text-sm line-clamp-1 text-gray-900 dark:text-white">{item.name}</span>
                                        <span className="text-[10px] md:text-xs font-bold opacity-60 text-gray-500 dark:text-gray-400">{item.price} د.ج</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Cart & Actions */}
                    <div className={`w-full md:w-[400px] flex flex-col bg-white dark:bg-gray-800 relative z-10 shadow-xl ${mobileOrderTab === 'menu' ? 'hidden md:flex' : 'flex h-full'}`}>
                        <div className="hidden md:block p-6 border-b bg-gray-50 dark:bg-gray-900">
                            <h4 className="font-black text-lg flex items-center gap-2 text-gray-500 uppercase tracking-widest">
                                <ShoppingBag size={18}/> الطلب الحالي
                            </h4>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 gap-4">
                                    <ShoppingCart size={48} strokeWidth={1}/>
                                    <p className="font-bold text-sm">السلة فارغة</p>
                                </div>
                            ) : (
                                cart.map((line, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => updateCartItemQuantity(line.item.id, 1)} className="w-6 h-6 rounded-full bg-white dark:bg-gray-600 border dark:border-gray-500 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-white"><Plus size={12}/></button>
                                                <span className="font-bold text-sm w-4 text-center text-gray-900 dark:text-white">{line.quantity}</span>
                                                <button onClick={() => updateCartItemQuantity(line.item.id, -1)} className="w-6 h-6 rounded-full bg-white dark:bg-gray-600 border dark:border-gray-500 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-white"><span className="text-lg leading-none mb-1">-</span></button>
                                            </div>
                                            <span className="font-bold text-sm text-gray-900 dark:text-white">{line.item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono font-bold text-sm text-gray-900 dark:text-white">{line.item.price * line.quantity}</span>
                                            <button onClick={() => removeFromCart(line.item.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded-full"><X size={14}/></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 space-y-4 pb-20 md:pb-6 shrink-0">
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-bold text-gray-500 uppercase">الإجمالي</span>
                                <span className="text-3xl font-black text-gray-900 dark:text-white">{cart.reduce((a, c) => a + (c.item.price * c.quantity), 0)} <span className="text-sm font-bold text-gray-400">د.ج</span></span>
                            </div>
                            <button 
                                onClick={handlePlaceOrder} 
                                disabled={cart.length===0} 
                                className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-3 transition transform active:scale-95 ${cart.length===0 ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' : ts.button}`}
                            >
                                <CheckCircle size={24}/> {selectedTable?.status === 'occupied' ? 'إضافة للطلب' : 'فتح الطاولة'}
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>

        {/* --- DELIVERY ORDER MODAL --- */}
        {showDeliveryModal && (
            <div className="fixed inset-0 bg-black/70 z-[150] flex items-center justify-center p-4 backdrop-blur-sm">
                <div className={`w-full max-w-5xl h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden ${ts.modalBg}`}>
                    {/* Header with Navigation Buttons */}
                    <div className={`p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4 ${ts.modalHeader}`}>
                        <div className="flex items-center gap-3">
                            <Truck size={28}/>
                            <h3 className="font-black text-2xl">طلب توصيل جديد</h3>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
                             <button 
                                onClick={() => setDeliveryModalTab('selection')} 
                                className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${deliveryModalTab === 'selection' ? ts.activeTab : (settings.darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white/20 text-white/70')}`}
                             >
                                <Home size={16}/> الرئيسية
                             </button>
                             <button 
                                onClick={() => setDeliveryModalTab('customer')} 
                                className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${deliveryModalTab === 'customer' ? ts.activeTab : (settings.darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white/20 text-white/70')}`}
                             >
                                <User size={16}/> معلومات العميل
                             </button>
                             <button 
                                onClick={() => setDeliveryModalTab('menu')} 
                                className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${deliveryModalTab === 'menu' ? ts.activeTab : (settings.darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white/20 text-white/70')}`}
                             >
                                <Utensils size={16}/> اختيار الطلب
                             </button>
                             <button 
                                onClick={() => setDeliveryModalTab('cart')} 
                                className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${deliveryModalTab === 'cart' ? ts.activeTab : (settings.darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white/20 text-white/70')}`}
                             >
                                <ShoppingCart size={16}/> السلة ({cart.length})
                             </button>
                             <button 
                                onClick={() => setDeliveryModalTab('notes')} 
                                className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${deliveryModalTab === 'notes' ? ts.activeTab : (settings.darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white/20 text-white/70')}`}
                             >
                                <Edit3 size={16}/> ملاحظة الطلب
                             </button>
                        </div>
                        <button onClick={() => setShowDeliveryModal(false)} className="p-2 hover:bg-white/10 rounded-full transition"><X size={24}/></button>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                            {deliveryModalTab === 'selection' && (
                                <div className="max-w-4xl mx-auto h-full flex flex-col justify-center items-center space-y-8 animate-fade-in py-12">
                                    <div className="text-center space-y-2">
                                        <h4 className="text-3xl font-black text-gray-900 dark:text-white">بدء طلب توصيل جديد</h4>
                                        <p className="text-gray-500 dark:text-gray-400 font-bold">اختر الخطوة التي تريد البدء بها</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                                        <button 
                                            onClick={() => setDeliveryModalTab('customer')}
                                            className="p-8 rounded-[2.5rem] bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-800 hover:border-blue-500 transition-all group flex flex-col items-center text-center gap-4"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                                                <User size={32}/>
                                            </div>
                                            <div>
                                                <h5 className="text-xl font-black text-blue-900 dark:text-blue-100">معلومات العميل</h5>
                                                <p className="text-sm text-blue-700/60 dark:text-blue-300/60 font-bold">إدخال بيانات التوصيل</p>
                                            </div>
                                        </button>

                                        <button 
                                            onClick={() => setDeliveryModalTab('menu')}
                                            className="p-8 rounded-[2.5rem] bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-100 dark:border-orange-800 hover:border-orange-500 transition-all group flex flex-col items-center text-center gap-4"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                                                <Utensils size={32}/>
                                            </div>
                                            <div>
                                                <h5 className="text-xl font-black text-orange-900 dark:text-orange-100">اختيار الطلب وتصنيفه</h5>
                                                <p className="text-sm text-orange-700/60 dark:text-orange-300/60 font-bold">تصفح قائمة الطعام</p>
                                            </div>
                                        </button>

                                        <button 
                                            onClick={() => setDeliveryModalTab('cart')}
                                            className="p-8 rounded-[2.5rem] bg-green-50 dark:bg-green-900/20 border-2 border-green-100 dark:border-green-800 hover:border-green-500 transition-all group flex flex-col items-center text-center gap-4"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                                                <ShoppingCart size={32}/>
                                            </div>
                                            <div>
                                                <h5 className="text-xl font-black text-green-900 dark:text-green-100">سلة المقتنيات</h5>
                                                <p className="text-sm text-green-700/60 dark:text-green-300/60 font-bold">مراجعة العناصر المختارة</p>
                                            </div>
                                        </button>

                                        <button 
                                            onClick={() => setDeliveryModalTab('notes')}
                                            className="p-8 rounded-[2.5rem] bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-100 dark:border-purple-800 hover:border-purple-500 transition-all group flex flex-col items-center text-center gap-4"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                                                <Edit3 size={32}/>
                                            </div>
                                            <div>
                                                <h5 className="text-xl font-black text-purple-900 dark:text-purple-100">ملاحظة خاصة بالطلب</h5>
                                                <p className="text-sm text-purple-700/60 dark:text-purple-300/60 font-bold">إضافة تعليمات خاصة</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {deliveryModalTab === 'customer' && (
                                <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                                    <h4 className="text-xl font-black mb-4 flex items-center gap-2"><User className="text-blue-500"/> بيانات العميل</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold mb-2 opacity-70">اسم العميل</label>
                                            <input type="text" value={deliveryDetails.name} onChange={e => setDeliveryDetails({...deliveryDetails, name: e.target.value})} className={`w-full p-4 rounded-2xl border-2 font-bold outline-none ${ts.input}`} placeholder="الاسم الكامل"/>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-2 opacity-70">رقم الهاتف</label>
                                            <input type="text" value={deliveryDetails.phone} onChange={e => setDeliveryDetails({...deliveryDetails, phone: e.target.value})} className={`w-full p-4 rounded-2xl border-2 font-bold outline-none ${ts.input}`} placeholder="05XXXXXXXX"/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold mb-2 opacity-70">العنوان بالتفصيل</label>
                                        <textarea value={deliveryDetails.address} onChange={e => setDeliveryDetails({...deliveryDetails, address: e.target.value})} className={`w-full p-4 rounded-2xl border-2 font-bold outline-none h-32 resize-none ${ts.input}`} placeholder="الشارع، رقم المنزل، المعالم القريبة..."/>
                                    </div>
                                    <div className="flex justify-end">
                                        <button onClick={() => setDeliveryModalTab('menu')} className={`px-8 py-3 rounded-xl font-bold ${ts.button}`}>التالي: اختيار الطلب</button>
                                    </div>
                                </div>
                            )}

                            {deliveryModalTab === 'menu' && (
                                <div className="animate-fade-in">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-xl font-black flex items-center gap-2"><Utensils className="text-orange-500"/> قائمة الطعام والمشروبات</h4>
                                        <div className="flex gap-2 overflow-x-auto pb-2 max-w-md scrollbar-hide">
                                            {['all', 'meal', 'breakfast', 'hot_drink', 'cold_drink', 'dessert'].map(cat => (
                                                <button 
                                                    key={cat} 
                                                    onClick={() => setSelectedCategory(cat)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                                                >
                                                    {cat === 'all' ? 'الكل' : 
                                                     cat === 'meal' ? 'وجبات' :
                                                     cat === 'breakfast' ? 'فطور' :
                                                     cat === 'hot_drink' ? 'مشروبات ساخنة' :
                                                     cat === 'cold_drink' ? 'مشروبات باردة' :
                                                     cat === 'dessert' ? 'حلويات' : cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {menuItems.filter(filterMenuItem).map(item => (
                                            <button 
                                                key={item.id} 
                                                onClick={() => { addToCart(item); addNotification(`تمت إضافة ${item.name}`, "success"); }} 
                                                className={`p-4 rounded-[2rem] border bg-white dark:bg-gray-800 shadow-sm hover:shadow-md hover:scale-[1.02] transition flex flex-col items-center text-center gap-2 group relative overflow-hidden ${ts.input}`}
                                            >
                                                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-1 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition">
                                                    <Utensils size={20} className="opacity-50 group-hover:opacity-100 text-blue-600 dark:text-blue-400"/>
                                                </div>
                                                <span className="font-black text-sm line-clamp-1 text-gray-900 dark:text-white">{item.name}</span>
                                                <span className="text-xs font-bold opacity-60 text-gray-500 dark:text-gray-400">{item.price} د.ج</span>
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                                                    <Plus size={16} className="text-blue-600"/>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-8">
                                        <button onClick={() => setDeliveryModalTab('customer')} className="px-8 py-3 rounded-xl font-bold bg-gray-200 text-gray-600">السابق</button>
                                        <button onClick={() => setDeliveryModalTab('cart')} className={`px-8 py-3 rounded-xl font-bold ${ts.button}`}>التالي: مراجعة السلة</button>
                                    </div>
                                </div>
                            )}

                            {deliveryModalTab === 'cart' && (
                                <div className="max-w-2xl mx-auto animate-fade-in">
                                    <h4 className="text-xl font-black mb-6 flex items-center gap-2"><ShoppingCart className="text-purple-500"/> سلة المقتنيات</h4>
                                    {cart.length === 0 ? (
                                        <div className="py-20 text-center opacity-50 flex flex-col items-center gap-4">
                                            <ShoppingCart size={64} strokeWidth={1}/>
                                            <p className="text-xl font-bold">السلة فارغة حالياً</p>
                                            <button onClick={() => setDeliveryModalTab('menu')} className="text-blue-600 font-bold underline">اذهب لاختيار الطلبات</button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {cart.map((line, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <button onClick={() => updateCartItemQuantity(line.item.id, 1)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 transition"><Plus size={16}/></button>
                                                            <span className="font-black text-lg w-6 text-center">{line.quantity}</span>
                                                            <button onClick={() => updateCartItemQuantity(line.item.id, -1)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition"><span className="text-xl leading-none mb-1">-</span></button>
                                                        </div>
                                                        <div>
                                                            <span className="font-black block">{line.item.name}</span>
                                                            <span className="text-xs text-gray-500 font-bold">{line.item.price} د.ج للوحدة</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-black text-lg">{line.item.price * line.quantity} د.ج</span>
                                                        <button onClick={() => removeFromCart(line.item.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition"><Trash2 size={18}/></button>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex justify-between mt-8">
                                                <button onClick={() => setDeliveryModalTab('menu')} className="px-8 py-3 rounded-xl font-bold bg-gray-200 text-gray-600">السابق</button>
                                                <button onClick={() => setDeliveryModalTab('notes')} className={`px-8 py-3 rounded-xl font-bold ${ts.button}`}>التالي: إضافة ملاحظة</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {deliveryModalTab === 'notes' && (
                                <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
                                    <h4 className="text-xl font-black mb-4 flex items-center gap-2"><Edit3 className="text-emerald-500"/> ملاحظة خاصة بالطلب</h4>
                                    <div>
                                        <label className="block text-xs font-bold mb-2 opacity-70">أي تعليمات إضافية للمطبخ أو عامل التوصيل؟</label>
                                        <textarea 
                                            value={deliveryDetails.notes} 
                                            onChange={e => setDeliveryDetails({...deliveryDetails, notes: e.target.value})} 
                                            className={`w-full p-4 rounded-2xl border-2 font-bold outline-none h-48 resize-none ${ts.input}`} 
                                            placeholder="مثال: بدون بصل، الباب الخلفي، يرجى الاتصال عند الوصول..."
                                        />
                                    </div>
                                    <div className="flex justify-between">
                                        <button onClick={() => setDeliveryModalTab('cart')} className="px-8 py-3 rounded-xl font-bold bg-gray-200 text-gray-600">السابق</button>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-400 mb-1">جاهز للإرسال؟</p>
                                            <button 
                                                onClick={handlePlaceDeliveryOrder} 
                                                disabled={cart.length === 0 || !deliveryDetails.name || !deliveryDetails.phone}
                                                className={`px-12 py-3 rounded-xl font-black text-lg shadow-xl transition transform active:scale-95 ${cart.length === 0 || !deliveryDetails.name || !deliveryDetails.phone ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : ts.button}`}
                                            >
                                                تأكيد وإرسال الطلب
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Summary Sidebar (Visible on Desktop) */}
                        <div className={`hidden lg:flex w-80 flex-col border-r p-6 ${settings.darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                            <h4 className="font-black text-sm uppercase tracking-widest text-gray-400 mb-6">ملخص الطلب</h4>
                            
                            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
                                {deliveryDetails.name && (
                                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">العميل</p>
                                        <p className="font-black text-sm">{deliveryDetails.name}</p>
                                        <p className="text-xs font-bold opacity-70">{deliveryDetails.phone}</p>
                                    </div>
                                )}
                                
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">العناصر ({cart.length})</p>
                                    {cart.slice(0, 5).map((line, idx) => (
                                        <div key={idx} className="flex justify-between text-xs font-bold">
                                            <span className="opacity-70">{line.item.name} x{line.quantity}</span>
                                            <span>{line.item.price * line.quantity}</span>
                                        </div>
                                    ))}
                                    {cart.length > 5 && <p className="text-[10px] text-center opacity-50">+{cart.length - 5} عناصر أخرى</p>}
                                </div>
                            </div>

                            <div className="pt-6 border-t mt-6">
                                <div className="flex justify-between items-end mb-4">
                                    <span className="text-xs font-bold text-gray-400 uppercase">الإجمالي</span>
                                    <span className="text-2xl font-black">{cart.reduce((a, c) => a + (c.item.price * c.quantity), 0)} <span className="text-xs">د.ج</span></span>
                                </div>
                                {deliveryModalTab !== 'notes' && (
                                    <button 
                                        onClick={handlePlaceDeliveryOrder}
                                        disabled={cart.length === 0 || !deliveryDetails.name || !deliveryDetails.phone}
                                        className={`w-full py-4 rounded-xl font-black shadow-lg transition ${cart.length === 0 || !deliveryDetails.name || !deliveryDetails.phone ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : ts.button}`}
                                    >
                                        تأكيد الطلب
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- TABLE QR MODAL --- */}
        {showTableQR && (
            <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-6 backdrop-blur-md" onClick={() => setShowTableQR(null)}>
                <div className="bg-white p-8 rounded-[3rem] text-center max-w-sm w-full relative shadow-2xl" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setShowTableQR(null)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
                    <h3 className="font-black text-2xl mb-2">QR الطاولة</h3>
                    <p className="text-sm text-gray-500 font-bold mb-6">مسح هذا الرمز يتيح للعميل طلب الخدمة مباشرة</p>
                    <div className="bg-black p-4 rounded-[2.5rem] inline-block mb-4 shadow-lg">
                        <div className="bg-white p-2 rounded-xl">
                            <QRCodeSVG 
                                value={getTableQRToken(showTableQR)} 
                                size={224}
                            />
                        </div>
                    </div>
                    <p className="font-black text-xl mt-2 text-gray-800">{showTableQR.number}</p>
                    <span className="inline-block mt-1 px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-500 uppercase mb-4">Secure Token Active</span>
                    
                    <div className="flex justify-center">
                        <PrintButton
                            title={`Table QR - ${showTableQR.number}`}
                            label="طباعة الرمز"
                            className="bg-black text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 flex items-center gap-2"
                            iconSize={18}
                            instantPrint={true}
                            qrCodeValue={getTableQRToken(showTableQR)}
                            htmlContent={`
                                <div style="text-align: center; padding: 40px; border: 4px solid #000; border-radius: 20px; font-family: sans-serif;">
                                    <h1 style="font-size: 48px; margin-bottom: 20px; font-weight: 900;">${mode === 'restaurant' ? 'المطعم' : 'المقهى'}</h1>
                                    <h2 style="font-size: 32px; margin-bottom: 40px; color: #555;">طاولة ${showTableQR.number}</h2>
                                    <div style="margin-bottom: 40px; display: inline-block; padding: 20px; border: 2px dashed #ccc; border-radius: 20px;">
                                        ${renderToStaticMarkup(<QRCodeSVG value={getTableQRToken(showTableQR)} size={400} level="H" includeMargin={true} />)}
                                    </div>
                                    <p style="font-size: 24px; font-weight: bold; margin-top: 20px;">امسح الرمز للطلب</p>
                                    <p style="font-size: 14px; color: #888; margin-top: 10px;">Scan to Order</p>
                                </div>
                            `}
                        />
                    </div>
                </div>
            </div>
        )}

        {/* --- LAYOUT EDITOR MODAL --- */}
        {showLayoutModal && (
            <LayoutEditorModal 
                onClose={() => setShowLayoutModal(false)}
                onSave={handleSaveTable}
                initialData={editingTableId ? restaurantTables.find(t => t.id === editingTableId) : undefined}
                theme={settings.theme}
                mode={mode}
                darkMode={settings.darkMode}
            />
        )}

        {/* --- MENU EDITOR MODAL --- */}
        {showMenuModal && (
            <MenuEditorModal 
                onClose={() => setShowMenuModal(false)}
                onSave={handleSaveMenuItem}
                initialData={editingItem || undefined}
                theme={settings.theme}
                darkMode={settings.darkMode}
            />
        )}

        {/* --- PAYMENT MODAL --- */}
        {showPaymentModal && (
            <PaymentModal
                isOpen={true}
                onClose={() => setShowPaymentModal(null)}
                amount={showPaymentModal.totalAmount}
                description={`طلب ${showPaymentModal.type === 'delivery' ? 'توصيل' : 'طاولة'} - ${showPaymentModal.targetNumber}`}
                onSuccess={(details) => {
                    const category = isRestaurant ? 'restaurant' : 'cafe';
                    addTransaction({
                        amount: showPaymentModal.totalAmount,
                        type: 'income',
                        category: category as any,
                        paymentMethod: details.method,
                        cardDetails: details.cardInfo,
                        description: `مبيعات ${isRestaurant ? 'مطعم' : 'مقهى'} - ${showPaymentModal.type === 'delivery' ? 'توصيل' : 'طاولة'} ${showPaymentModal.targetNumber}`,
                    });
                    
                    if (showPaymentModal.tableId) {
                        updateTableStatus(showPaymentModal.tableId, 'available'); // Reset table to available after payment
                    }
                    
                    setShowPaymentModal(null);
                    addNotification('تم الدفع بنجاح وإغلاق الطلب', "success");
                }}
            />
        )}

        {/* Order Success Modal */}
        <Modal
            isOpen={showOrderSuccess}
            onClose={() => setShowOrderSuccess(false)}
            title="تم إنشاء الطلب بنجاح"
            icon={CheckCircle}
        >
            <div className="flex flex-col items-center justify-center p-6 space-y-6">
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-200">
                    <QRCodeSVG value={lastOrderQR} size={200} />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">رمز الطلب #{lastOrderDetails?.id.slice(-4)}</h3>
                    <p className="text-gray-500">يمكن للعميل مسح هذا الرمز لمتابعة الطلب أو الدفع</p>
                </div>
                <div className="flex gap-4 w-full">
                    <button 
                        onClick={() => {
                            if (lastOrderDetails) handlePrintOrderQR(lastOrderDetails);
                        }}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                        <Printer size={20} /> طباعة الرمز
                    </button>
                    <button 
                        onClick={() => setShowOrderSuccess(false)}
                        className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </Modal>
    </div>
  );
};
