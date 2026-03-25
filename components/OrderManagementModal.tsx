import React, { useState, useMemo } from 'react';
import { useHotel } from '../context/HotelContext';
import { Modal } from './Modal';
import { RestaurantOrder, MenuItem, Role } from '../types';
import { CheckCircle, Clock, ChefHat, Truck, X, AlertCircle, ArrowRight, Check, Bell } from 'lucide-react';

interface OrderManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'restaurant' | 'cafe';
}

interface OrderCardProps {
    order: RestaurantOrder;
    onClick: (order: RestaurantOrder) => void;
    canManageKitchen: boolean;
    canManageService: boolean;
    onStatusChange: (orderId: string, status: RestaurantOrder['status']) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick, canManageKitchen, canManageService, onStatusChange }) => (
    <div 
        onClick={() => onClick(order)}
        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
            order.status === 'pending' ? 'bg-white border-orange-100 hover:border-orange-300' :
            order.status === 'preparing' ? 'bg-blue-50 border-blue-200 hover:border-blue-400' :
            'bg-green-50 border-green-200 hover:border-green-400'
        }`}
    >
        <div className="flex justify-between items-start mb-2">
            <span className="font-black text-lg">#{order.targetNumber}</span>
            <span className="text-[10px] font-mono opacity-60">{new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
        
        <div className="space-y-1 mb-3">
            {order.items.slice(0, 3).map((line, i) => (
                <div key={i} className="flex justify-between text-xs font-bold">
                    <span>{line.item.name}</span>
                    <span className="bg-black/5 px-1.5 rounded">x{line.quantity}</span>
                </div>
            ))}
            {order.items.length > 3 && <span className="text-[10px] opacity-50">+{order.items.length - 3} عناصر أخرى</span>}
        </div>

        <div className="flex gap-2 mt-2">
            {order.status === 'pending' && canManageKitchen && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onStatusChange(order.id, 'preparing'); }}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-blue-700"
                >
                    <ChefHat size={14}/> تحضير
                </button>
            )}
            {order.status === 'preparing' && canManageKitchen && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onStatusChange(order.id, 'completed'); }}
                    className="flex-1 py-2 bg-green-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-green-700"
                >
                    <Check size={14}/> جاهز
                </button>
            )}
            {order.status === 'completed' && canManageService && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onStatusChange(order.id, 'served'); }}
                    className="w-full py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
                >
                    <CheckCircle size={14}/> تقديم (Serve)
                </button>
            )}
        </div>
    </div>
);

export const OrderManagementModal: React.FC<OrderManagementModalProps> = ({ isOpen, onClose, mode }) => {
    const { restaurantOrders, updateRestaurantOrder, currentUser, addNotification, settings } = useHotel();
    const [selectedOrder, setSelectedOrder] = useState<RestaurantOrder | null>(null);

    // Theme Styles
    const getThemeStyles = () => {
        if (settings.darkMode) {
            switch (settings.theme) {
                case 'zellige': return {
                    bg: 'bg-[#001e21]',
                    columnBg: 'bg-[#002a2d]',
                    border: 'border-[#cca43b]/20',
                    headerText: 'text-[#f0c04a]',
                    cardBorder: 'border-[#cca43b]/30'
                };
                case 'zellige-v2': return {
                    bg: 'bg-[#012a20]',
                    columnBg: 'bg-[#003d2e]',
                    border: 'border-[#c6e3d8]/20',
                    headerText: 'text-[#c6e3d8]',
                    cardBorder: 'border-[#c6e3d8]/30'
                };
                case 'ceramic-talavera': return {
                    bg: 'bg-[#1e3a8a]',
                    columnBg: 'bg-[#0f172a]',
                    border: 'border-[#f59e0b]/20',
                    headerText: 'text-[#f59e0b]',
                    cardBorder: 'border-[#f59e0b]/30'
                };
                case 'ceramic-majolica': return {
                    bg: 'bg-[#15803d]',
                    columnBg: 'bg-[#052e16]',
                    border: 'border-[#facc15]/20',
                    headerText: 'text-[#facc15]',
                    cardBorder: 'border-[#facc15]/30'
                };
                case 'ceramic-delft': return {
                    bg: 'bg-[#0c4a6e]',
                    columnBg: 'bg-[#082f49]',
                    border: 'border-[#bae6fd]/20',
                    headerText: 'text-[#bae6fd]',
                    cardBorder: 'border-[#bae6fd]/30'
                };
                case 'ceramic-iznik': return {
                    bg: 'bg-[#7f1d1d]',
                    columnBg: 'bg-[#450a0a]',
                    border: 'border-[#0ea5e9]/20',
                    headerText: 'text-[#0ea5e9]',
                    cardBorder: 'border-[#0ea5e9]/30'
                };
                default: return {
                    bg: 'bg-gray-900',
                    columnBg: 'bg-gray-800',
                    border: 'border-gray-700',
                    headerText: 'text-white',
                    cardBorder: 'border-gray-600'
                };
            }
        }

        switch (settings.theme) {
            case 'zellige': return {
                bg: 'bg-[#FDFBF7]',
                columnBg: 'bg-[#FDFBF7]/50',
                border: 'border-[#cca43b]/20',
                headerText: 'text-[#006269]',
                cardBorder: 'border-[#cca43b]/30'
            };
            case 'zellige-v2': return {
                bg: 'bg-[#f5fcf9]',
                columnBg: 'bg-[#f5fcf9]/50',
                border: 'border-[#024d38]/20',
                headerText: 'text-[#024d38]',
                cardBorder: 'border-[#024d38]/30'
            };
            case 'ceramic-talavera': return {
                bg: 'bg-[#fffbeb]',
                columnBg: 'bg-[#fffbeb]/50',
                border: 'border-[#1e3a8a]/20',
                headerText: 'text-[#1e3a8a]',
                cardBorder: 'border-[#1e3a8a]/30'
            };
            case 'ceramic-majolica': return {
                bg: 'bg-[#fefce8]',
                columnBg: 'bg-[#fefce8]/50',
                border: 'border-[#15803d]/20',
                headerText: 'text-[#15803d]',
                cardBorder: 'border-[#15803d]/30'
            };
            case 'ceramic-delft': return {
                bg: 'bg-[#f0f9ff]',
                columnBg: 'bg-[#f0f9ff]/50',
                border: 'border-[#0c4a6e]/20',
                headerText: 'text-[#0c4a6e]',
                cardBorder: 'border-[#0c4a6e]/30'
            };
            case 'ceramic-iznik': return {
                bg: 'bg-[#fef2f2]',
                columnBg: 'bg-[#fef2f2]/50',
                border: 'border-[#dc2626]/20',
                headerText: 'text-[#dc2626]',
                cardBorder: 'border-[#dc2626]/30'
            };
            default: return {
                bg: 'bg-gray-50/50',
                columnBg: '',
                border: '',
                headerText: '',
                cardBorder: ''
            };
        }
    };
    const ts = getThemeStyles();

    // Filter orders for this facility
    const facilityOrders = useMemo(() => {
        return restaurantOrders.filter(o => o.source === mode && o.status !== 'cancelled');
    }, [restaurantOrders, mode]);

    // Group by status
    const columns = {
        pending: facilityOrders.filter(o => o.status === 'pending'),
        preparing: facilityOrders.filter(o => o.status === 'preparing'),
        completed: facilityOrders.filter(o => o.status === 'completed'), // "Ready" or "Served"
    };

    const handleStatusChange = (orderId: string, newStatus: RestaurantOrder['status']) => {
        updateRestaurantOrder(orderId, newStatus);
        
        // Notify relevant parties
        const order = restaurantOrders.find(o => o.id === orderId);
        if (order) {
            let msg = '';
            if (newStatus === 'preparing') msg = `بدأ تحضير الطلب للطاولة ${order.targetNumber}`;
            if (newStatus === 'completed') msg = `الطلب جاهز للطاولة ${order.targetNumber}`;
            if (newStatus === 'served') msg = `تم تقديم الطلب للطاولة ${order.targetNumber}`;
            
            if (msg) {
                const roles: Role[] = newStatus === 'served' ? ['restaurant_manager', 'cafe_manager'] : ['waiter', 'restaurant_manager'];
                addNotification(msg, 'info', undefined, { roles });
            }
        }
    };

    const canManageKitchen = ['head_chef', 'chef', 'restaurant_manager', 'cafe_manager', 'manager'].includes(currentUser?.role || '');
    const canManageService = ['waiter', 'barista', 'restaurant_manager', 'cafe_manager', 'manager'].includes(currentUser?.role || '');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`شاشة متابعة الطلبات - ${mode === 'restaurant' ? 'المطعم' : 'المقهى'}`} size="xl" className="h-[90vh] w-[95vw] max-w-[95vw]">
            <div className={`flex h-full gap-4 overflow-hidden p-4 ${ts.bg}`}>
                
                {/* Pending Column */}
                <div className={`flex-1 flex flex-col rounded-3xl border overflow-hidden ${ts.columnBg} ${(settings.theme.startsWith('zellige') || settings.theme.startsWith('ceramic')) ? ts.border : 'border-orange-100 bg-orange-50/50'}`}>
                    <div className={`p-4 border-b flex justify-between items-center ${(settings.theme.startsWith('zellige') || settings.theme.startsWith('ceramic')) ? `${ts.border} bg-black/5` : 'bg-orange-100/50 border-orange-100'}`}>
                        <h3 className={`font-black flex items-center gap-2 ${(settings.theme.startsWith('zellige') || settings.theme.startsWith('ceramic')) ? ts.headerText : 'text-orange-800'}`}><AlertCircle size={20}/> قيد الانتظار</h3>
                        <span className="bg-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">{columns.pending.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {columns.pending.map(order => (
                            <OrderCard 
                                key={order.id} 
                                order={order} 
                                onClick={setSelectedOrder}
                                canManageKitchen={canManageKitchen}
                                canManageService={canManageService}
                                onStatusChange={handleStatusChange}
                            />
                        ))}
                        {columns.pending.length === 0 && <div className="text-center py-10 opacity-40 font-bold">لا توجد طلبات جديدة</div>}
                    </div>
                </div>

                {/* Preparing Column */}
                <div className={`flex-1 flex flex-col rounded-3xl border overflow-hidden ${ts.columnBg} ${(settings.theme.startsWith('zellige') || settings.theme.startsWith('ceramic')) ? ts.border : 'border-blue-100 bg-blue-50/50'}`}>
                    <div className={`p-4 border-b flex justify-between items-center ${(settings.theme.startsWith('zellige') || settings.theme.startsWith('ceramic')) ? `${ts.border} bg-black/5` : 'bg-blue-100/50 border-blue-100'}`}>
                        <h3 className={`font-black flex items-center gap-2 ${(settings.theme.startsWith('zellige') || settings.theme.startsWith('ceramic')) ? ts.headerText : 'text-blue-800'}`}><ChefHat size={20}/> جاري التحضير</h3>
                        <span className="bg-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">{columns.preparing.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {columns.preparing.map(order => (
                            <OrderCard 
                                key={order.id} 
                                order={order} 
                                onClick={setSelectedOrder}
                                canManageKitchen={canManageKitchen}
                                canManageService={canManageService}
                                onStatusChange={handleStatusChange}
                            />
                        ))}
                        {columns.preparing.length === 0 && <div className="text-center py-10 opacity-40 font-bold">المطبخ فارغ</div>}
                    </div>
                </div>

                {/* Ready Column */}
                <div className={`flex-1 flex flex-col rounded-3xl border overflow-hidden ${ts.columnBg} ${(settings.theme.startsWith('zellige') || settings.theme.startsWith('ceramic')) ? ts.border : 'border-green-100 bg-green-50/50'}`}>
                    <div className={`p-4 border-b flex justify-between items-center ${(settings.theme.startsWith('zellige') || settings.theme.startsWith('ceramic')) ? `${ts.border} bg-black/5` : 'bg-green-100/50 border-green-100'}`}>
                        <h3 className={`font-black flex items-center gap-2 ${(settings.theme.startsWith('zellige') || settings.theme.startsWith('ceramic')) ? ts.headerText : 'text-green-800'}`}><CheckCircle size={20}/> جاهز للتقديم</h3>
                        <span className="bg-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">{columns.completed.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {columns.completed.map(order => (
                            <OrderCard 
                                key={order.id} 
                                order={order} 
                                onClick={setSelectedOrder}
                                canManageKitchen={canManageKitchen}
                                canManageService={canManageService}
                                onStatusChange={handleStatusChange}
                            />
                        ))}
                        {columns.completed.length === 0 && <div className="text-center py-10 opacity-40 font-bold">لا توجد طلبات جاهزة</div>}
                    </div>
                </div>

            </div>


            {/* Order Details Modal (Nested) */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white w-full max-w-md md:max-w-2xl rounded-3xl p-6 shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-xl">تفاصيل الطلب #{selectedOrder.targetNumber}</h3>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
                        </div>
                        
                        <div className="space-y-4 mb-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
                            {selectedOrder.items.map((line, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-white border w-8 h-8 flex items-center justify-center rounded-lg font-bold shadow-sm">{line.quantity}</span>
                                        <span className="font-bold">{line.item.name}</span>
                                    </div>
                                    <span className="font-mono text-sm opacity-60">{line.item.price * line.quantity}</span>
                                </div>
                            ))}
                            {selectedOrder.notes && (
                                <div className="p-3 bg-yellow-50 text-yellow-800 rounded-xl text-sm font-bold border border-yellow-100">
                                    ملاحظات: {selectedOrder.notes}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {selectedOrder.status === 'pending' && canManageKitchen && (
                                <button onClick={() => { handleStatusChange(selectedOrder.id, 'preparing'); setSelectedOrder(null); }} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">بدء التحضير</button>
                            )}
                            {selectedOrder.status === 'preparing' && canManageKitchen && (
                                <button onClick={() => { handleStatusChange(selectedOrder.id, 'completed'); setSelectedOrder(null); }} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700">جاهز للتقديم</button>
                            )}
                            {selectedOrder.status === 'completed' && canManageService && (
                                <button onClick={() => { handleStatusChange(selectedOrder.id, 'served'); setSelectedOrder(null); }} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700">تم التقديم (Serve)</button>
                            )}
                            <button onClick={() => { updateRestaurantOrder(selectedOrder.id, 'cancelled'); setSelectedOrder(null); }} className="px-4 py-3 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200">إلغاء</button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};
