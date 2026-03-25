import React, { useState, useEffect, useMemo } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { FacilityMap } from '../components/FacilityMap';
import { BookableUnit, ServicePoint, ResourceBooking } from '../types';
import { 
    Tent, Plus, Edit2, Trash2, Save, X, Map as MapIcon, List, 
    Users, Calendar, Clock, CheckCircle2, AlertCircle, DollarSign, 
    Ticket, Armchair, LayoutGrid, Sun, Umbrella, Eye, CreditCard 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { QRCodeCanvas } from 'qrcode.react';

export const VenueManagementPage: React.FC = () => {
    const { 
        servicePoints, 
        addServicePoint, 
        updateServicePoint, 
        deleteServicePoint,
        currentUser,
        addNotification,
        settings,
        addTransaction,
        generateSystemQR,
        addQRRecord
    } = useHotel();

    const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [showVenueModal, setShowVenueModal] = useState(false);
    const [editingVenue, setEditingVenue] = useState<Partial<ServicePoint> | null>(null);
    
    // Unit Management State
    const [selectedUnit, setSelectedUnit] = useState<BookableUnit | null>(null);
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Partial<BookableUnit> | null>(null);

    // Booking State
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingDetails, setBookingDetails] = useState<Partial<ResourceBooking>>({
        guestCount: 1,
        duration: 60, // minutes
        status: 'confirmed'
    });

    // Ticket Window State
    const [showTicketWindow, setShowTicketWindow] = useState(false);
    const [ticketDetails, setTicketDetails] = useState({
        type: 'entry',
        count: 1,
        price: 2000,
        customerName: '',
        unitId: ''
    });

    const ticketTotal = useMemo(() => {
        const subtotal = ticketDetails.price * ticketDetails.count;
        const tax = subtotal * 0.19;
        return { subtotal, tax, total: subtotal + tax };
    }, [ticketDetails]);

    const [showTicketSuccess, setShowTicketSuccess] = useState(false);
    const [lastTicketQR, setLastTicketQR] = useState<string>('');

    const handleTicketSale = (paymentMethod: 'cash' | 'card') => {
        if (!selectedVenueId) return;

        // 1. Create Transaction
        addTransaction({
            amount: ticketTotal.total,
            type: 'income',
            category: 'kiosk',
            description: `بيع تذاكر (${ticketDetails.type}) - ${selectedVenue?.name}`,
            paymentMethod,
            notes: `العميل: ${ticketDetails.customerName || 'زائر'}, العدد: ${ticketDetails.count}`
        });

        // 2. Update Unit Status if applicable
        if (ticketDetails.unitId) {
            const updatedUnits = (selectedVenue?.units || []).map(u => 
                u.id === ticketDetails.unitId ? { ...u, status: 'occupied' } : u
            );
            updateServicePoint(selectedVenueId, { units: updatedUnits });
        }

        // 3. Generate QR Code
        const ticketId = `tkt-${Date.now()}`;
        const qrData = generateSystemQR('TICKET', ticketId, ticketDetails.customerName || 'Guest', 1, {
            venueId: selectedVenueId,
            venueName: selectedVenue?.name,
            type: ticketDetails.type,
            count: ticketDetails.count,
            amount: ticketTotal.total,
            unitId: ticketDetails.unitId
        });
        
        // Add QR Record for tracking
        addQRRecord({
            referenceId: ticketId,
            title: `تذكرة: ${selectedVenue?.name}`,
            subtitle: `${ticketDetails.type} - ${ticketDetails.count} أشخاص`,
            status: 'valid',
            dataPayload: qrData,
            maxScans: 1,
            meta: { type: 'venue_ticket', amount: ticketTotal.total }
        }, 'ticket');

        setLastTicketQR(qrData);
        setShowTicketSuccess(true);

        // 4. Notification & Reset
        addNotification('تم إصدار التذكرة بنجاح', 'success');
        setShowTicketWindow(false);
        setTicketDetails({ type: 'entry', count: 1, price: 2000, customerName: '', unitId: '' });
    };

    const selectedVenue = useMemo(() => 
        servicePoints.find(p => p.id === selectedVenueId), 
    [servicePoints, selectedVenueId]);

    const handleSaveVenue = () => {
        if (!editingVenue?.name) return;

        if (editingVenue.id) {
            updateServicePoint(editingVenue.id, editingVenue);
            addNotification('تم تحديث المرفق بنجاح', 'success');
        } else {
            addServicePoint({
                ...editingVenue,
                type: editingVenue.type || 'other',
                status: 'open',
                capacity: editingVenue.capacity || 50,
                units: []
            } as ServicePoint);
            addNotification('تم إضافة المرفق بنجاح', 'success');
        }
        setShowVenueModal(false);
        setEditingVenue(null);
    };

    const handleSaveUnit = () => {
        if (!selectedVenueId || !editingUnit) return;

        const updatedUnits = [...(selectedVenue?.units || [])];
        
        if (editingUnit.id) {
            const index = updatedUnits.findIndex(u => u.id === editingUnit.id);
            if (index !== -1) {
                updatedUnits[index] = { ...updatedUnits[index], ...editingUnit } as BookableUnit;
            }
        } else {
            updatedUnits.push({
                ...editingUnit,
                id: Math.random().toString(36).substr(2, 9),
                venueId: selectedVenueId,
                status: 'available'
            } as BookableUnit);
        }

        updateServicePoint(selectedVenueId, { units: updatedUnits });
        setShowUnitModal(false);
        setEditingUnit(null);
        addNotification('تم حفظ الوحدة بنجاح', 'success');
    };

    const handleDeleteUnit = (unitId: string) => {
        if (!selectedVenueId) return;
        const updatedUnits = (selectedVenue?.units || []).filter(u => u.id !== unitId);
        updateServicePoint(selectedVenueId, { units: updatedUnits });
        addNotification('تم حذف الوحدة', 'success');
    };

    const handleUpdateUnitPosition = (unitId: string, updates: Partial<BookableUnit>) => {
        if (!selectedVenueId) return;
        const updatedUnits = (selectedVenue?.units || []).map(u => 
            u.id === unitId ? { ...u, ...updates } : u
        );
        updateServicePoint(selectedVenueId, { units: updatedUnits });
    };

    const handleBooking = () => {
        // Logic to save booking would go here
        // For now, just update unit status
        if (selectedVenueId && selectedUnit) {
            const updatedUnits = (selectedVenue?.units || []).map(u => 
                u.id === selectedUnit.id ? { ...u, status: 'occupied' } : u
            );
            updateServicePoint(selectedVenueId, { units: updatedUnits });
            addNotification('تم تأكيد الحجز بنجاح', 'success');
            setShowBookingModal(false);
            setBookingDetails({ guestCount: 1, duration: 60, status: 'confirmed' });
        }
    };

    return (
        <div className="space-y-6 pb-20 animate-fade-in">
            <PageHeader 
                pageKey="venues" 
                defaultTitle="إدارة المساحات والأكشاك المؤقتة" 
                icon={Tent} 
                description="تخطيط وإدارة الفعاليات والأكشاك الموسمية داخل مرافق الفندق"
            />

            {/* Venue Selection & Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {servicePoints.filter(sp => ['pool', 'garden', 'beach', 'kiosk', 'restaurant', 'cafe'].includes(sp.type)).map(venue => (
                        <button
                            key={venue.id}
                            onClick={() => setSelectedVenueId(venue.id)}
                            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${
                                selectedVenueId === venue.id 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            {venue.name}
                        </button>
                    ))}
                    <button 
                        onClick={() => { setEditingVenue({}); setShowVenueModal(true); }}
                        className="p-2 rounded-xl bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                        title="إضافة مرفق جديد"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {selectedVenueId && (
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button 
                            onClick={() => setShowTicketWindow(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20"
                        >
                            <Ticket size={18} /> شباك التذاكر
                        </button>
                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
                        <button 
                            onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors"
                            title={viewMode === 'map' ? 'عرض القائمة' : 'عرض الخريطة'}
                        >
                            {viewMode === 'map' ? <List size={20} /> : <MapIcon size={20} />}
                        </button>
                        <button 
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors ${
                                isEditMode 
                                ? 'bg-orange-100 text-orange-600 border border-orange-200' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                            }`}
                        >
                            <Edit2 size={18} /> {isEditMode ? 'إنهاء التعديل' : 'تعديل المخطط'}
                        </button>
                        <button 
                            onClick={() => { setEditingVenue(selectedVenue || {}); setShowVenueModal(true); }}
                            className="p-2 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                            title="إعدادات المرفق"
                        >
                            <Save size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[600px] relative">
                {selectedVenue ? (
                    viewMode === 'map' ? (
                        <FacilityMap 
                            venue={selectedVenue}
                            units={selectedVenue.units || []}
                            onUpdateUnit={handleUpdateUnitPosition}
                            onDeleteUnit={handleDeleteUnit}
                            onAddUnit={(unit) => { setEditingUnit(unit); setShowUnitModal(true); }}
                            onSelectUnit={(unit) => { setSelectedUnit(unit); setShowBookingModal(true); }}
                            selectedUnitId={selectedUnit?.id}
                            mode={isEditMode ? 'edit' : 'booking'}
                        />
                    ) : (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">قائمة الوحدات</h3>
                                <button 
                                    onClick={() => { setEditingUnit({}); setShowUnitModal(true); }}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                                >
                                    <Plus size={18} /> إضافة وحدة
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(selectedVenue.units || []).map(unit => (
                                    <div key={unit.id} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-xl ${unit.status === 'occupied' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                {unit.type === 'table' ? <LayoutGrid size={20}/> : 
                                                 unit.type === 'seat' ? <Armchair size={20}/> :
                                                 unit.type === 'sunbed' ? <Sun size={20}/> :
                                                 unit.type === 'cabana' ? <Umbrella size={20}/> :
                                                 <Ticket size={20}/>}
                                            </div>
                                            <div>
                                                <h4 className="font-bold">{unit.name}</h4>
                                                <p className="text-xs text-gray-500">السعة: {unit.capacity} أشخاص</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setEditingUnit(unit); setShowUnitModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                                            <button onClick={() => handleDeleteUnit(unit.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-400">
                        <Tent size={64} className="mb-4 opacity-20" />
                        <h2 className="text-xl font-bold">اختر مرفقاً للبدء</h2>
                        <p>قم باختيار أحد المرافق من القائمة أعلاه لإدارة المخطط والحجوزات</p>
                    </div>
                )}
            </div>

            {/* Venue Edit Modal */}
            <Modal
                isOpen={showVenueModal}
                onClose={() => setShowVenueModal(false)}
                title={editingVenue?.id ? 'تعديل المرفق' : 'إضافة مرفق جديد'}
                icon={Tent}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">اسم المرفق</label>
                        <input 
                            type="text" 
                            className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                            value={editingVenue?.name || ''}
                            onChange={e => setEditingVenue(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="مثال: المسبح الرئيسي، الحديقة الخلفية..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">نوع المرفق</label>
                        <select 
                            className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                            value={editingVenue?.type || 'other'}
                            onChange={e => setEditingVenue(prev => ({ ...prev, type: e.target.value as any }))}
                        >
                            <option value="pool">مسبح</option>
                            <option value="garden">حديقة</option>
                            <option value="beach">شاطئ</option>
                            <option value="restaurant">مطعم خارجي</option>
                            <option value="cafe">مقهى</option>
                            <option value="kiosk">أكشاك</option>
                            <option value="other">أخرى</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">الحد الأقصى للزوار (السعة الكلية)</label>
                        <input 
                            type="number" 
                            className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                            value={editingVenue?.capacity || 50}
                            onChange={e => setEditingVenue(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button onClick={() => setShowVenueModal(false)} className="px-4 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-100">إلغاء</button>
                        <button onClick={handleSaveVenue} className="px-6 py-2 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700">حفظ</button>
                    </div>
                </div>
            </Modal>

            {/* Unit Edit Modal */}
            <Modal
                isOpen={showUnitModal}
                onClose={() => setShowUnitModal(false)}
                title={editingUnit?.id ? 'تعديل الوحدة' : 'إضافة وحدة جديدة'}
                icon={LayoutGrid}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">اسم الوحدة / الرقم</label>
                        <input 
                            type="text" 
                            className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                            value={editingUnit?.name || ''}
                            onChange={e => setEditingUnit(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="مثال: طاولة 1، كرسي 5..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">النوع</label>
                            <select 
                                className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                                value={editingUnit?.type || 'table'}
                                onChange={e => setEditingUnit(prev => ({ ...prev, type: e.target.value as any }))}
                            >
                                <option value="table">طاولة</option>
                                <option value="seat">مقعد</option>
                                <option value="sunbed">سرير تشمس</option>
                                <option value="cabana">كابانا (خيمة)</option>
                                <option value="view_spot">نقطة مشاهدة</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">السعة (أشخاص)</label>
                            <input 
                                type="number" 
                                className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                                value={editingUnit?.capacity || 4}
                                onChange={e => setEditingUnit(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button onClick={() => setShowUnitModal(false)} className="px-4 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-100">إلغاء</button>
                        <button onClick={handleSaveUnit} className="px-6 py-2 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700">حفظ</button>
                    </div>
                </div>
            </Modal>

            {/* Booking Modal */}
            <Modal
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                title={`حجز ${selectedUnit?.name}`}
                icon={Ticket}
            >
                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm text-blue-600">
                            {selectedUnit?.type === 'table' ? <LayoutGrid size={24}/> : <Armchair size={24}/>}
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">{selectedUnit?.name}</h4>
                            <p className="text-sm opacity-70">السعة: {selectedUnit?.capacity} أشخاص</p>
                        </div>
                        <div className="mr-auto text-xl font-black text-blue-600">
                            {selectedUnit?.price || 0} د.ج
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">عدد الضيوف</label>
                            <div className="relative">
                                <Users className="absolute top-3 right-3 text-gray-400" size={18} />
                                <input 
                                    type="number" 
                                    className="w-full p-3 pr-10 rounded-xl border bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                                    value={bookingDetails.guestCount}
                                    onChange={e => setBookingDetails(prev => ({ ...prev, guestCount: parseInt(e.target.value) }))}
                                    max={selectedUnit?.capacity}
                                    min={1}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">المدة (دقيقة)</label>
                            <div className="relative">
                                <Clock className="absolute top-3 right-3 text-gray-400" size={18} />
                                <select 
                                    className="w-full p-3 pr-10 rounded-xl border bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                                    value={bookingDetails.duration}
                                    onChange={e => setBookingDetails(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                                >
                                    <option value={30}>30 دقيقة</option>
                                    <option value={60}>1 ساعة</option>
                                    <option value={120}>2 ساعة</option>
                                    <option value={180}>3 ساعات</option>
                                    <option value={0}>يوم كامل</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">ملاحظات إضافية</label>
                        <textarea 
                            className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 dark:border-gray-600 h-24 resize-none"
                            placeholder="طلبات خاصة، حساسية طعام، مناسبة خاصة..."
                            value={bookingDetails.notes || ''}
                            onChange={e => setBookingDetails(prev => ({ ...prev, notes: e.target.value }))}
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button onClick={() => setShowBookingModal(false)} className="px-4 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-100">إلغاء</button>
                        <button onClick={handleBooking} className="px-6 py-2 rounded-xl font-bold bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20 flex items-center gap-2">
                            <CheckCircle2 size={18} /> تأكيد الحجز
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Ticket Window (Box Office) Modal */}
            <Modal
                isOpen={showTicketWindow}
                onClose={() => setShowTicketWindow(false)}
                title="شباك التذاكر - حجز سريع"
                icon={Ticket}
                size="lg"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="font-bold text-lg border-b pb-2">تفاصيل الحجز</h4>
                        <div>
                            <label className="block text-sm font-bold mb-1">نوع التذكرة / الوحدة</label>
                            <select 
                                className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                                value={ticketDetails.type}
                                onChange={e => setTicketDetails(prev => ({ ...prev, type: e.target.value }))}
                            >
                                <option value="entry">تذكرة دخول عامة</option>
                                <option value="vip">تذكرة VIP</option>
                                <option value="table">حجز طاولة</option>
                                <option value="sunbed">حجز سرير تشمس</option>
                            </select>
                        </div>
                        
                        {/* Unit Selection if applicable */}
                        {(ticketDetails.type === 'table' || ticketDetails.type === 'sunbed') && (
                            <div>
                                <label className="block text-sm font-bold mb-1">اختر الوحدة</label>
                                <select 
                                    className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                                    value={ticketDetails.unitId}
                                    onChange={e => setTicketDetails(prev => ({ ...prev, unitId: e.target.value }))}
                                >
                                    <option value="">-- اختر --</option>
                                    {selectedVenue?.units?.filter(u => u.status === 'available').map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.capacity} أشخاص)</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">عدد الأشخاص</label>
                                <input 
                                    type="number" 
                                    className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 dark:border-gray-600" 
                                    value={ticketDetails.count}
                                    onChange={e => setTicketDetails(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
                                    min={1} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">السعر (للفرد)</label>
                                <div className="relative">
                                    <DollarSign className="absolute top-3 right-3 text-gray-400" size={18} />
                                    <input 
                                        type="number" 
                                        className="w-full p-3 pr-10 rounded-xl border bg-gray-50 dark:bg-gray-700 dark:border-gray-600" 
                                        value={ticketDetails.price}
                                        onChange={e => setTicketDetails(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">بيانات العميل (اختياري)</label>
                            <input 
                                type="text" 
                                className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 dark:border-gray-600" 
                                placeholder="الاسم أو رقم الهاتف" 
                                value={ticketDetails.customerName}
                                onChange={e => setTicketDetails(prev => ({ ...prev, customerName: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 border-r pr-6 border-gray-100 dark:border-gray-700">
                        <h4 className="font-bold text-lg border-b pb-2">ملخص الدفع</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">المجموع الفرعي</span>
                                <span className="font-bold">{ticketTotal.subtotal.toLocaleString()} د.ج</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">الضريبة (19%)</span>
                                <span className="font-bold">{ticketTotal.tax.toLocaleString()} د.ج</span>
                            </div>
                            <div className="flex justify-between text-lg font-black pt-4 border-t">
                                <span>الإجمالي</span>
                                <span className="text-green-600">{ticketTotal.total.toLocaleString()} د.ج</span>
                            </div>
                        </div>
                        
                        <div className="pt-4 space-y-2">
                            <button 
                                onClick={() => handleTicketSale('cash')}
                                className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
                            >
                                <DollarSign size={20} /> دفع نقدي
                            </button>
                            <button 
                                onClick={() => handleTicketSale('card')}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                            >
                                <CreditCard size={20} /> دفع بالبطاقة
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
            {/* Ticket Success Modal */}
            <Modal
                isOpen={showTicketSuccess}
                onClose={() => setShowTicketSuccess(false)}
                title="تم إصدار التذكرة"
                icon={CheckCircle2}
            >
                <div className="flex flex-col items-center justify-center p-6 space-y-6">
                    <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-200">
                        <QRCodeCanvas value={lastTicketQR} size={200} />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold mb-2">امسح الرمز للدخول</h3>
                        <p className="text-gray-500">يمكن للزائر استخدام هذا الرمز للدخول إلى {selectedVenue?.name}</p>
                    </div>
                    <div className="flex gap-4 w-full">
                        <button 
                            onClick={() => {
                                // Print Logic (Mock)
                                window.print();
                            }}
                            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
                        >
                            <Ticket size={20} /> طباعة التذكرة
                        </button>
                        <button 
                            onClick={() => setShowTicketSuccess(false)}
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

export default VenueManagementPage;
