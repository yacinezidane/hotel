import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, Plus, Minus, CreditCard, Clock, MapPin } from 'lucide-react';
import { CartItem } from '../types';

interface CartReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onUpdateNotes?: (id: string, notes: string) => void;
  onRemove: (id: string) => void;
  onConfirm: () => void;
  themeColor?: string;
}

export const CartReviewModal: React.FC<CartReviewModalProps> = ({
  isOpen,
  onClose,
  items = [],
  onUpdateQuantity,
  onUpdateNotes,
  onRemove,
  onConfirm,
  themeColor = '#006269'
}) => {
  const total = (items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg md:max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Drag Handle for Mobile */}
            <div className="drag-handle mb-0 absolute top-2 left-1/2 -translate-x-1/2 z-30"></div>
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl text-white" style={{ backgroundColor: themeColor }}>
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900">مراجعة الطلب</h2>
                  <p className="text-xs text-gray-500 font-bold">{items.length} أصناف في السلة</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                    <ShoppingBag size={40} />
                  </div>
                  <p className="text-gray-500 font-bold">سلتك فارغة حالياً</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-3xl border border-gray-100">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-16 rounded-2xl object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-black text-gray-900 text-sm truncate">{item.name}</h3>
                        <button 
                          onClick={() => onRemove(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      {item.details && (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {item.details.date && (
                            <span className="text-[10px] bg-white px-2 py-0.5 rounded-md text-gray-500 flex items-center gap-1">
                              <Clock size={10} /> {item.details.date}
                            </span>
                          )}
                          {item.details.time && (
                            <span className="text-[10px] bg-white px-2 py-0.5 rounded-md text-gray-500 flex items-center gap-1">
                              <Clock size={10} /> {item.details.time}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-black text-sm" style={{ color: themeColor }}>
                          {(item.price * item.quantity).toLocaleString()} د.ج
                        </span>
                        
                        <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-xl shadow-sm border border-gray-100">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-xs font-black min-w-[1rem] text-center">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Item Notes */}
                      <div className="mt-4">
                        <textarea
                          value={item.notes || ''}
                          onChange={(e) => onUpdateNotes?.(item.id, e.target.value)}
                          placeholder="أضف ملاحظة لهذا الصنف (اختياري)..."
                          className="w-full p-3 bg-white border border-gray-100 rounded-xl text-[10px] font-bold focus:ring-1 outline-none resize-none h-12"
                          style={{ '--tw-ring-color': themeColor } as any}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}

              {items.length > 0 && (
                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 px-2">
                    <CreditCard size={14} />
                    <span>سيتم إضافة المبلغ إلى حساب غرفتك</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 px-2">
                    <Clock size={14} />
                    <span>وقت التوصيل المتوقع: 20-30 دقيقة</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4">
                <div className="flex justify-between items-center px-2">
                  <span className="text-gray-500 font-bold">الإجمالي</span>
                  <span className="text-2xl font-black text-gray-900">{total.toLocaleString()} د.ج</span>
                </div>
                
                <button
                  onClick={onConfirm}
                  className="w-full py-4 rounded-2xl text-white font-black shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  style={{ backgroundColor: themeColor, boxShadow: `0 10px 20px ${themeColor}33` }}
                >
                  تأكيد وإرسال الطلب
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
