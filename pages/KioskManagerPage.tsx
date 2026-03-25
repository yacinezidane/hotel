import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { ServicePoint, KioskProduct } from '../types';
import { Store, Plus, Edit, Trash, Package, DollarSign, MapPin, Monitor } from 'lucide-react';
import { Modal } from '../components/Modal';

const KioskManagerPage: React.FC = () => {
  const { servicePoints, addServicePoint, updateServicePoint, settings } = useHotel();
  const [isKioskModalOpen, setIsKioskModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingKiosk, setEditingKiosk] = useState<ServicePoint | null>(null);
  const [activeKioskId, setActiveKioskId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<KioskProduct | null>(null);

  const activeKiosk = servicePoints.find(k => k.id === activeKioskId);

  const handleSaveKiosk = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const kioskData: Partial<ServicePoint> = {
      name: formData.get('name') as string,
      type: formData.get('type') as ServicePoint['type'],
      location: {
        lat: 0,
        lng: 0,
        address: formData.get('location') as string
      },
      status: formData.get('status') as ServicePoint['status'],
      products: editingKiosk?.products || []
    };

    if (editingKiosk) {
      updateServicePoint(editingKiosk.id, kioskData);
    } else {
      addServicePoint({
        id: `sp-${Date.now()}`,
        ...kioskData as ServicePoint,
        products: []
      });
    }
    setIsKioskModalOpen(false);
    setEditingKiosk(null);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeKiosk) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const productData: KioskProduct = {
      id: editingProduct ? editingProduct.id : `kp-${Date.now()}`,
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      type: formData.get('type') as 'product' | 'service',
      isAvailable: formData.get('isAvailable') === 'on',
      description: formData.get('description') as string,
      stock: Number(formData.get('stock')) || 0
    };

    const updatedProducts = editingProduct 
      ? activeKiosk.products?.map(p => p.id === editingProduct.id ? productData : p)
      : [...(activeKiosk.products || []), productData];

    updateServicePoint(activeKiosk.id, { products: updatedProducts });
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
    if (!activeKiosk || !window.confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;
    const updatedProducts = activeKiosk.products?.filter(p => p.id !== productId);
    updateServicePoint(activeKiosk.id, { products: updatedProducts });
  };

  return (
    <div className={`p-6 min-h-screen ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display mb-2">إدارة الأكشاك ونقاط الخدمة</h1>
          <p className="text-gray-500">تخصيص الخدمات والمنتجات في نقاط البيع المختلفة</p>
        </div>
        <button 
          onClick={() => { setEditingKiosk(null); setIsKioskModalOpen(true); }}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة كشك</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kiosk List */}
        <div className="lg:col-span-1 space-y-4">
          {servicePoints.map(kiosk => (
            <div 
              key={kiosk.id}
              onClick={() => setActiveKioskId(kiosk.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                activeKioskId === kiosk.id 
                  ? 'border-primary-500 ring-2 ring-primary-500/20 bg-primary-50 dark:bg-primary-900/20' 
                  : settings.darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">{kiosk.name}</h3>
                    <span className="text-xs text-gray-500">{kiosk.type}</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setEditingKiosk(kiosk); setIsKioskModalOpen(true); }}
                  className="p-1 text-gray-400 hover:text-primary-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                <MapPin className="w-3 h-3" />
                <span>{kiosk.location}</span>
                <span className={`mr-auto px-2 py-0.5 rounded-full ${kiosk.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                  {kiosk.status}
                </span>
              </div>
            </div>
          ))}
          
          {servicePoints.length === 0 && (
            <div className="text-center p-8 text-gray-400 border-2 border-dashed rounded-xl">
              <Store className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>لا توجد نقاط خدمة حالياً</p>
            </div>
          )}
        </div>

        {/* Products/Services List */}
        <div className="lg:col-span-2">
          {activeKiosk ? (
            <div className={`p-6 rounded-2xl border min-h-[500px] ${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary-500" />
                  <span>المنتجات والخدمات - {activeKiosk.name}</span>
                </h2>
                <button 
                  onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة عنصر</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeKiosk.products?.map(product => (
                  <div key={product.id} className={`p-4 rounded-xl border flex justify-between items-center group ${settings.darkMode ? 'bg-gray-750 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold">{product.name}</h4>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${product.type === 'service' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {product.type === 'service' ? 'خدمة' : 'منتج'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        <span className="font-mono font-bold text-emerald-600">{product.price} د.ج</span>
                        {product.type === 'product' && (
                          <span className="text-gray-400">المخزون: {product.stock}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                        className="p-2 bg-white text-gray-600 rounded-lg shadow-sm hover:text-primary-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 bg-white text-rose-600 rounded-lg shadow-sm hover:bg-rose-50"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {(!activeKiosk.products || activeKiosk.products.length === 0) && (
                  <div className="col-span-2 text-center py-12 text-gray-400">
                    <p>لا توجد عناصر مضافة لهذا الكشك</p>
                    <button 
                      onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                      className="mt-2 text-primary-600 hover:underline"
                    >
                      إضافة أول عنصر
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-2xl p-8">
              <Monitor className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg">اختر نقطة خدمة لعرض وإدارة محتوياتها</p>
            </div>
          )}
        </div>
      </div>

      {/* Kiosk Modal */}
      <Modal
        isOpen={isKioskModalOpen}
        onClose={() => setIsKioskModalOpen(false)}
        title={editingKiosk ? 'تعديل نقطة خدمة' : 'إضافة نقطة خدمة'}
      >
        <form onSubmit={handleSaveKiosk} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">الاسم</label>
            <input name="name" defaultValue={editingKiosk?.name} required className="w-full p-2 rounded border" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">النوع</label>
              <select name="type" defaultValue={editingKiosk?.type || 'kiosk'} className="w-full p-2 rounded border">
                <option value="kiosk">كشك بيع</option>
                <option value="counter">كاونتر خدمة</option>
                <option value="mobile_cart">عربة متنقلة</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الحالة</label>
              <select name="status" defaultValue={editingKiosk?.status || 'active'} className="w-full p-2 rounded border">
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
                <option value="maintenance">صيانة</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الموقع</label>
            <input name="location" defaultValue={editingKiosk?.location} required className="w-full p-2 rounded border" />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsKioskModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">إلغاء</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">حفظ</button>
          </div>
        </form>
      </Modal>

      {/* Product Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'تعديل عنصر' : 'إضافة عنصر جديد'}
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم العنصر</label>
            <input name="name" defaultValue={editingProduct?.name} required className="w-full p-2 rounded border" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">النوع</label>
              <select name="type" defaultValue={editingProduct?.type || 'product'} className="w-full p-2 rounded border">
                <option value="product">منتج مادي</option>
                <option value="service">خدمة</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">السعر (د.ج)</label>
              <input name="price" type="number" defaultValue={editingProduct?.price} required className="w-full p-2 rounded border" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الوصف</label>
            <textarea name="description" defaultValue={editingProduct?.description} rows={3} className="w-full p-2 rounded border" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">المخزون</label>
              <input name="stock" type="number" defaultValue={editingProduct?.stock || 0} className="w-full p-2 rounded border" />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input name="isAvailable" type="checkbox" defaultChecked={editingProduct?.isAvailable ?? true} className="w-4 h-4 text-primary-600" />
                <span className="text-sm">متاح للطلب</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">إلغاء</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">حفظ</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default KioskManagerPage;
