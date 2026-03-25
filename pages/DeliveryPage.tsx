import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { 
  Truck, MapPin, Package, Clock, User, Phone, 
  CheckCircle, XCircle, AlertTriangle, Plus, 
  Search, Filter, Navigation, Store, Trees, 
  Coffee, Utensils, Bike, Car, QrCode, Printer
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { RestaurantOrder, DeliveryDriver, ServicePoint, MenuItem } from '../types';

const DeliveryPage: React.FC = () => {
  const { 
    restaurantOrders, deliveryDrivers, servicePoints,
    addDeliveryDriver, updateDriverStatus, assignDriverToOrder,
    addServicePoint, updateServicePoint, updateRestaurantOrder,
    settings, currentUser, generateSystemQR
  } = useHotel();

  const [activeTab, setActiveTab] = useState<'orders' | 'drivers' | 'map' | 'service_points'>('orders');
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [showAddPoint, setShowAddPoint] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<RestaurantOrder | null>(null);
  
  // QR Modal State
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState('');
  const [qrTitle, setQrTitle] = useState('');
  const [qrSubtitle, setQrSubtitle] = useState('');

  // QR Handlers
  const handleShowOrderQR = (order: RestaurantOrder) => {
      const qr = generateSystemQR('TABLE_ORDER', order.id, `Order #${order.id.slice(-4)}`, 30);
      setQrData(qr);
      setQrTitle(`طلب توصيل #${order.id.slice(-4)}`);
      setQrSubtitle(`${order.customerName} - ${order.totalAmount} د.ج`);
      setShowQRModal(true);
  };

  const handleShowServicePointQR = (point: ServicePoint) => {
      const qr = generateSystemQR('FACILITY', point.id, point.name, 365, { type: point.type });
      setQrData(qr);
      setQrTitle(point.name);
      setQrSubtitle(point.location.address);
      setShowQRModal(true);
  };

  // Filtered Lists
  const activeOrders = restaurantOrders.filter(o => o.type === 'delivery' && !['completed', 'cancelled'].includes(o.status));
  const completedOrders = restaurantOrders.filter(o => o.type === 'delivery' && ['completed', 'cancelled'].includes(o.status));

  // Zellige Pattern Style
  const zelligePattern = settings.theme === 'zellige' ? "bg-[url('https://www.tilingtextures.com/wp-content/uploads/2023/06/0096-Zellige-Tile-Texture-1024x1024.jpg')] bg-opacity-10" : "";

  return (
    <div className={`p-6 min-h-screen ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} relative overflow-hidden`}>
      {/* Zellige Background Overlay */}
      {settings.theme === 'zellige' && (
        <div className="absolute inset-0 opacity-5 pointer-events-none z-0" 
             style={{ backgroundImage: `url('https://img.freepik.com/free-vector/seamless-islamic-pattern_1284-42526.jpg')`, backgroundSize: '300px' }}>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Truck className="w-8 h-8 text-emerald-600" />
              <span>نظام التوصيل والخدمات الخارجية</span>
            </h1>
            <p className={`mt-2 ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              إدارة الطلبات، السائقين، والمرافق الخارجية (أكشاك، حدائق)
            </p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'orders' ? 'bg-emerald-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}
            >
              <Package className="w-4 h-4" />
              <span>الطلبات</span>
            </button>
            <button 
              onClick={() => setActiveTab('drivers')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'drivers' ? 'bg-emerald-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}
            >
              <Bike className="w-4 h-4" />
              <span>السائقين</span>
            </button>
            <button 
              onClick={() => setActiveTab('service_points')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'service_points' ? 'bg-emerald-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}
            >
              <Store className="w-4 h-4" />
              <span>المرافق والنقاط</span>
            </button>
            <button 
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'map' ? 'bg-emerald-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}
            >
              <MapPin className="w-4 h-4" />
              <span>الخريطة الحية</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {/* Active Orders Section */}
                <div className={`p-6 rounded-2xl ${settings.darkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-lg border border-emerald-500/20`}>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <span>الطلبات الجارية ({activeOrders.length})</span>
                  </h2>
                  
                  <div className="grid gap-4">
                    {activeOrders.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">لا توجد طلبات توصيل نشطة حالياً</div>
                    ) : (
                      activeOrders.map(order => (
                        <div key={order.id} className={`p-4 rounded-xl border ${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} flex justify-between items-center`}>
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-bold text-lg">#{order.id.slice(-4)}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'out_for_delivery' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status === 'pending' ? 'قيد الانتظار' :
                                 order.status === 'preparing' ? 'جاري التحضير' :
                                 order.status === 'out_for_delivery' ? 'جاري التوصيل' : order.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 mb-1">
                              <User className="w-3 h-3 inline ml-1" />
                              {order.customerName} - {order.customerPhone}
                            </div>
                            <div className="text-sm text-gray-500">
                              <MapPin className="w-3 h-3 inline ml-1" />
                              {order.deliveryAddress || 'استلام من الفرع'}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleShowOrderQR(order)}
                                className={`p-1.5 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:bg-blue-100 hover:text-blue-600 transition-colors`} 
                                title="عرض رمز QR"
                              >
                                <QrCode className="w-4 h-4" />
                              </button>
                              <span className="font-bold text-emerald-600">{order.totalAmount} د.ج</span>
                            </div>
                            
                            {!order.driverId && (
                              <select 
                                className={`text-sm p-2 rounded-lg border ${settings.darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                onChange={(e) => assignDriverToOrder(order.id, e.target.value)}
                                defaultValue=""
                              >
                                <option value="" disabled>اختر سائق...</option>
                                {deliveryDrivers.filter(d => d.status === 'available').map(d => (
                                  <option key={d.id} value={d.id}>{d.name} ({d.vehicleType})</option>
                                ))}
                              </select>
                            )}
                            
                            {order.driverId && (
                              <div className="flex items-center gap-2 text-sm text-purple-600">
                                <Bike className="w-4 h-4" />
                                <span>{order.driverName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'drivers' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className={`p-6 rounded-2xl ${settings.darkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-lg border border-emerald-500/20 col-span-full flex justify-between items-center`}>
                    <h2 className="text-xl font-bold">طاقم التوصيل</h2>
                    <button 
                      onClick={() => setShowAddDriver(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة سائق</span>
                    </button>
                 </div>

                 {deliveryDrivers.map(driver => (
                   <div key={driver.id} className={`p-4 rounded-xl border ${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} relative overflow-hidden`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            {driver.vehicleType === 'bike' ? <Bike className="w-6 h-6" /> : <Car className="w-6 h-6" />}
                          </div>
                          <div>
                            <h3 className="font-bold">{driver.name}</h3>
                            <p className="text-xs text-gray-500">{driver.phone}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          driver.status === 'available' ? 'bg-green-100 text-green-800' :
                          driver.status === 'busy' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {driver.status === 'available' ? 'متاح' : driver.status === 'busy' ? 'مشغول' : 'خارج الخدمة'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className={`p-2 rounded-lg ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <span className="block text-gray-500 text-xs">الطلبات</span>
                          <span className="font-bold">{driver.totalDeliveries}</span>
                        </div>
                        <div className={`p-2 rounded-lg ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <span className="block text-gray-500 text-xs">التقييم</span>
                          <span className="font-bold text-amber-500">★ {Number(driver.averageRating || 0).toFixed(1)}</span>
                        </div>
                      </div>
                   </div>
                 ))}
              </div>
            )}

            {activeTab === 'service_points' && (
              <div className="space-y-6">
                <div className={`p-6 rounded-2xl ${settings.darkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-lg border border-emerald-500/20 flex justify-between items-center`}>
                    <div>
                      <h2 className="text-xl font-bold">نقاط الخدمة والمرافق</h2>
                      <p className="text-sm text-gray-500">إدارة الأكشاك، الحدائق، والمرافق السياحية التابعة للفندق</p>
                    </div>
                    <button 
                      onClick={() => setShowAddPoint(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة نقطة</span>
                    </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {servicePoints.map(point => (
                      <div key={point.id} className={`group relative rounded-2xl overflow-hidden border ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-md hover:shadow-xl transition-all`}>
                        <div className="h-32 bg-gray-200 relative">
                          {point.image ? (
                            <img src={point.image} alt={point.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-600">
                              {point.type === 'garden' ? <Trees className="w-12 h-12" /> : 
                               point.type === 'kiosk' ? <Store className="w-12 h-12" /> : 
                               <MapPin className="w-12 h-12" />}
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold shadow-sm ${
                              point.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                            }`}>
                              {point.status === 'active' ? 'مفتوح' : 'مغلق'}
                            </span>
                          </div>
                        </div>
                        
                        <div className={`p-4 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                          <h3 className="font-bold text-lg mb-1">{point.name}</h3>
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{point.description || 'لا يوجد وصف'}</p>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <MapPin className="w-3 h-3" />
                            <span>{point.location.address}</span>
                          </div>
                          <button 
                            onClick={() => handleShowServicePointQR(point)}
                            className={`absolute bottom-4 left-4 p-2 rounded-full ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'} hover:bg-blue-600 hover:text-white transition-colors shadow-sm`} 
                            title="رمز QR للموقع"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {activeTab === 'map' && (
              <div className={`h-[600px] rounded-2xl overflow-hidden border ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'} relative bg-gray-100`}>
                {/* Placeholder for Map - In a real app, integrate Google Maps or Leaflet */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-200">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p>نظام الخرائط التفاعلي (محاكاة)</p>
                    <p className="text-sm">يعرض مواقع السائقين ونقاط الخدمة</p>
                  </div>
                </div>
                
                {/* Simulated Points on Map */}
                {servicePoints.map((point, idx) => (
                  <div 
                    key={point.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group"
                    style={{ top: `${30 + (idx * 15)}%`, left: `${20 + (idx * 20)}%` }} // Random positioning for demo
                  >
                    <div className={`p-2 rounded-full shadow-lg ${point.type === 'garden' ? 'bg-green-500' : 'bg-blue-500'} text-white`}>
                      {point.type === 'garden' ? <Trees className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                    </div>
                    <div className="mt-1 px-2 py-1 bg-white text-gray-900 text-xs rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {point.name}
                    </div>
                  </div>
                ))}

                {/* Simulated Drivers */}
                {deliveryDrivers.filter(d => d.status !== 'offline').map((driver, idx) => (
                  <div 
                    key={driver.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-1000"
                    style={{ top: `${50 + (idx * 10)}%`, left: `${50 + (idx * 10)}%` }}
                  >
                    <div className="p-1.5 rounded-full shadow-lg bg-purple-600 text-white animate-pulse">
                      {driver.vehicleType === 'bike' ? <Bike className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl ${settings.darkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-lg border border-emerald-500/20`}>
              <h3 className="font-bold mb-4 text-lg">إحصائيات سريعة</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">طلبات اليوم</span>
                  <span className="font-bold text-xl">{restaurantOrders.filter(o => o.type === 'delivery').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">سائقين متاحين</span>
                  <span className="font-bold text-green-500">{deliveryDrivers.filter(d => d.status === 'available').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">نقاط نشطة</span>
                  <span className="font-bold text-blue-500">{servicePoints.filter(p => p.status === 'active').length}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`p-6 rounded-2xl ${settings.darkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-lg border border-emerald-500/20`}>
              <h3 className="font-bold mb-4 text-lg">روابط سريعة</h3>
              <div className="space-y-2">
                <button className="w-full py-2 px-4 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-right transition-colors">
                  + طلب توصيل جديد
                </button>
                <button className="w-full py-2 px-4 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 text-right transition-colors">
                  + تسجيل شكوى سائق
                </button>
                <button className="w-full py-2 px-4 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 text-right transition-colors">
                  طباعة تقرير اليوم
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Add Driver Modal */}
      {showAddDriver && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-0">
          <div className={`w-full max-w-md p-6 rounded-t-[2.5rem] shadow-2xl ${settings.darkMode ? 'bg-gray-800' : 'bg-white'} relative border-x border-t border-white/20 animate-fade-in-up`}>
            <button onClick={() => setShowAddDriver(false)} className="absolute top-4 left-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              <XCircle className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-6">إضافة سائق جديد</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addDeliveryDriver({
                id: `drv-${Date.now()}`,
                name: formData.get('name') as string,
                phone: formData.get('phone') as string,
                vehicleType: formData.get('vehicleType') as any,
                vehiclePlate: formData.get('vehiclePlate') as string,
                status: 'available',
                totalDeliveries: 0,
                averageRating: 5,
                isExternal: false
              });
              setShowAddDriver(false);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">الاسم الكامل</label>
                <input name="name" required className={`w-full p-2 rounded-lg border ${settings.darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
                <input name="phone" required className={`w-full p-2 rounded-lg border ${settings.darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">نوع المركبة</label>
                  <select name="vehicleType" className={`w-full p-2 rounded-lg border ${settings.darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                    <option value="bike">دراجة هوائية</option>
                    <option value="motorcycle">دراجة نارية</option>
                    <option value="car">سيارة</option>
                    <option value="van">شاحنة صغيرة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">رقم اللوحة</label>
                  <input name="vehiclePlate" className={`w-full p-2 rounded-lg border ${settings.darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`} />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold mt-4">
                حفظ السائق
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Service Point Modal */}
      {showAddPoint && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-0">
          <div className={`w-full max-w-md p-6 rounded-t-[2.5rem] shadow-2xl ${settings.darkMode ? 'bg-gray-800' : 'bg-white'} relative border-x border-t border-white/20 animate-fade-in-up`}>
            <button onClick={() => setShowAddPoint(false)} className="absolute top-4 left-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              <XCircle className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-6">إضافة نقطة خدمة جديدة</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addServicePoint({
                id: `sp-${Date.now()}`,
                name: formData.get('name') as string,
                type: formData.get('type') as any,
                category: 'permanent', // Default to permanent
                location: { 
                  lat: 0, 
                  lng: 0, 
                  address: formData.get('address') as string 
                },
                status: 'active',
                description: formData.get('description') as string
              });
              setShowAddPoint(false);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم المرفق</label>
                <input name="name" required className={`w-full p-2 rounded-lg border ${settings.darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">النوع</label>
                <select name="type" className={`w-full p-2 rounded-lg border ${settings.darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                  <option value="kiosk">كشك (Kiosk)</option>
                  <option value="garden">حديقة (Garden)</option>
                  <option value="park">منتزه (Park)</option>
                  <option value="hotel_facility">مرفق فندقي</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">العنوان / الموقع</label>
                <input name="address" required placeholder="مثال: المدخل الشمالي، بجانب المسبح..." className={`w-full p-2 rounded-lg border ${settings.darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">وصف مختصر</label>
                <textarea name="description" rows={3} className={`w-full p-2 rounded-lg border ${settings.darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}></textarea>
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold mt-4">
                إنشاء النقطة
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-0">
          <div className={`w-full max-w-sm p-6 rounded-t-[3rem] shadow-2xl ${settings.darkMode ? 'bg-gray-800' : 'bg-white'} relative border-x border-t border-white/20 animate-fade-in-up`}>
            <button onClick={() => setShowQRModal(false)} className="absolute top-4 left-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              <XCircle className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-6">
              <h2 className="text-xl font-black mb-1">{qrTitle}</h2>
              <p className="text-sm text-gray-500">{qrSubtitle}</p>
            </div>

            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-2xl shadow-inner border-2 border-gray-100">
                <QRCodeSVG value={qrData} size={200} />
              </div>
            </div>

            <button 
              onClick={() => {
                  const printWindow = window.open('', '', 'width=600,height=600');
                  if (printWindow) {
                      printWindow.document.write(`
                          <html>
                              <head>
                                  <title>QR Code - ${qrTitle}</title>
                                  <style>
                                      body { font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                                      .card { border: 2px solid #000; padding: 40px; border-radius: 20px; text-align: center; }
                                      h1 { margin: 20px 0 10px; font-size: 24px; }
                                      p { margin: 0; color: #666; }
                                  </style>
                              </head>
                              <body>
                                  <div class="card">
                                      ${document.querySelector('svg')?.outerHTML || ''}
                                      <h1>${qrTitle}</h1>
                                      <p>${qrSubtitle}</p>
                                  </div>
                                  <script>window.print(); window.close();</script>
                              </body>
                          </html>
                      `);
                      printWindow.document.close();
                  }
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              <span>طباعة الرمز</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default DeliveryPage;
