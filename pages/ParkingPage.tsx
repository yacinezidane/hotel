import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { ParkingSpot } from '../types';
import { Car, Plus, Filter, Search, Edit, Trash, CheckCircle, XCircle, Shield, Umbrella } from 'lucide-react';
import { Modal } from '../components/Modal';
import { PaymentModal } from '../components/PaymentModal';

const ParkingPage: React.FC = () => {
  const { parkingSpots, addParkingSpot, updateParkingSpot, settings, addTransaction } = useHotel();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState<ParkingSpot | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentSpot, setPaymentSpot] = useState<ParkingSpot | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const filteredSpots = parkingSpots.filter(spot => {
    const matchesSearch = spot.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          spot.vehiclePlate?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || spot.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const spotData: Partial<ParkingSpot> = {
      number: formData.get('number') as string,
      type: formData.get('type') as ParkingSpot['type'],
      status: formData.get('status') as ParkingSpot['status'],
      pricePerHour: Number(formData.get('pricePerHour')),
      pricePerDay: Number(formData.get('pricePerDay')),
      vehiclePlate: formData.get('vehiclePlate') as string,
      services: formData.getAll('services') as string[]
    };

    if (editingSpot) {
      updateParkingSpot(editingSpot.id, spotData);
    } else {
      addParkingSpot({
        id: `p-${Date.now()}`,
        ...spotData as ParkingSpot
      });
    }
    setIsModalOpen(false);
    setEditingSpot(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'occupied': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'reserved': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'shaded': return <Umbrella className="w-4 h-4" />;
      case 'guarded': return <Shield className="w-4 h-4" />;
      case 'vip': return <Car className="w-4 h-4 text-amber-500" />;
      default: return <Car className="w-4 h-4" />;
    }
  };

  const handleCheckout = (spot: ParkingSpot) => {
    setPaymentSpot(spot);
    setPaymentAmount(spot.pricePerDay); // Mock: Assume 1 day for now
    setIsPaymentModalOpen(true);
  };

  const onPaymentSuccess = (paymentDetails: any) => {
    if (!paymentSpot) return;

    addTransaction({
      amount: paymentAmount,
      type: 'income',
      category: 'parking',
      description: `رسوم موقف - مكان ${paymentSpot.number}`,
      paymentMethod: paymentDetails.method,
      relatedId: paymentSpot.id
    });

    updateParkingSpot(paymentSpot.id, { status: 'available', vehiclePlate: undefined });
    setIsPaymentModalOpen(false);
    setPaymentSpot(null);
  };

  return (
    <div className={`p-6 min-h-screen ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display mb-2">إدارة موقف السيارات</h1>
          <p className="text-gray-500">مراقبة وتسيير أماكن الوقوف والخدمات الملحقة</p>
        </div>
        <button 
          onClick={() => { setEditingSpot(null); setIsModalOpen(true); }}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة مكان</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="بحث برقم المكان أو اللوحة..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pr-10 pl-4 py-2 rounded-lg border ${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} focus:ring-2 focus:ring-primary-500 outline-none transition-all`}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['all', 'shaded', 'unshaded', 'guarded', 'vip'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filterType === type 
                  ? 'bg-primary-600 text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {type === 'all' ? 'الكل' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSpots.map(spot => (
          <div key={spot.id} className={`relative group rounded-xl border p-5 transition-all hover:shadow-lg ${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${spot.status === 'occupied' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {getTypeIcon(spot.type)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{spot.number}</h3>
                  <span className="text-xs text-gray-500">{spot.type}</span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(spot.status)}`}>
                {spot.status}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">الساعة:</span>
                <span className="font-mono font-medium">{spot.pricePerHour} د.ج</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">اليوم:</span>
                <span className="font-mono font-medium">{spot.pricePerDay} د.ج</span>
              </div>
              {spot.vehiclePlate && (
                <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500">المركبة:</span>
                  <span className="font-mono font-bold text-gray-800">{spot.vehiclePlate}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <button 
                onClick={() => { setEditingSpot(spot); setIsModalOpen(true); }}
                className="flex-1 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                تعديل
              </button>
              {spot.status === 'occupied' ? (
                <button 
                  onClick={() => handleCheckout(spot)}
                  className="flex-1 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  إنهاء
                </button>
              ) : (
                <button 
                  onClick={() => updateParkingSpot(spot.id, { status: 'occupied' })}
                  className="flex-1 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  حجز
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSpot ? 'تعديل مكان' : 'إضافة مكان جديد'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">رقم المكان</label>
              <input 
                name="number" 
                defaultValue={editingSpot?.number} 
                required 
                className="w-full p-2 rounded border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">النوع</label>
              <select name="type" defaultValue={editingSpot?.type || 'shaded'} className="w-full p-2 rounded border">
                <option value="shaded">مظلل</option>
                <option value="unshaded">غير مظلل</option>
                <option value="guarded">محروس</option>
                <option value="vip">VIP</option>
                <option value="valet">Valet</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">سعر الساعة</label>
              <input 
                name="pricePerHour" 
                type="number" 
                defaultValue={editingSpot?.pricePerHour || 200} 
                className="w-full p-2 rounded border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">سعر اليوم</label>
              <input 
                name="pricePerDay" 
                type="number" 
                defaultValue={editingSpot?.pricePerDay || 1500} 
                className="w-full p-2 rounded border"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">الحالة</label>
            <select name="status" defaultValue={editingSpot?.status || 'available'} className="w-full p-2 rounded border">
              <option value="available">متاح</option>
              <option value="occupied">مشغول</option>
              <option value="reserved">محجوز</option>
              <option value="maintenance">صيانة</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">رقم اللوحة (اختياري)</label>
            <input 
              name="vehiclePlate" 
              defaultValue={editingSpot?.vehiclePlate} 
              className="w-full p-2 rounded border"
              placeholder="00000 123 16"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">الخدمات الإضافية</label>
            <div className="grid grid-cols-2 gap-2">
              {['cleaning', 'valet', 'maintenance', 'charging'].map(service => (
                <label key={service} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                  <input 
                    type="checkbox" 
                    name="services" 
                    value={service}
                    defaultChecked={editingSpot?.services?.includes(service)}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="text-sm">
                    {service === 'cleaning' ? 'تنظيف' : 
                     service === 'valet' ? 'خدمة صف السيارات' : 
                     service === 'maintenance' ? 'صيانة' : 'شحن كهربائي'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              إلغاء
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              حفظ
            </button>
          </div>
        </form>
      </Modal>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={paymentAmount}
        description={`دفع رسوم موقف سيارات - مكان رقم ${paymentSpot?.number}`}
        onSuccess={onPaymentSuccess}
      />
    </div>
  );
};

export default ParkingPage;
