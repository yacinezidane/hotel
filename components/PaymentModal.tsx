import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { CreditCard, Wallet, CheckCircle, X, Banknote, Landmark } from 'lucide-react';
import { Transaction } from '../types';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    description: string;
    onSuccess: (paymentDetails: { method: 'cash' | 'card' | 'transfer'; cardInfo?: any }) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, amount, description, onSuccess }) => {
    const { settings } = useHotel();
    const [method, setMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
    const [cardInfo, setCardInfo] = useState({ number: '', expiry: '', cvc: '', name: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const isZellige = settings.theme.startsWith('zellige') || settings.theme.startsWith('ceramic');
    const isDark = settings.darkMode;
    
    const getThemeStyles = () => {
        if (settings.theme === 'ceramic-talavera') {
             return {
                 bg: isDark ? 'bg-[#0f172a]' : 'bg-[#fffbeb]',
                 header: isDark ? 'bg-[#1e3a8a] text-[#f59e0b]' : 'bg-[#1e3a8a] text-[#f59e0b]',
                 activeTab: isDark ? 'bg-[#f59e0b] text-[#1e3a8a] shadow-lg' : 'bg-[#1e3a8a] text-[#f59e0b] shadow-lg',
                 inactiveTab: isDark ? 'bg-[#1e3a8a]/20 text-[#f59e0b] hover:bg-[#1e3a8a]/40' : 'bg-[#f59e0b]/10 text-[#1e3a8a] hover:bg-[#f59e0b]/20',
                 input: isDark ? 'border-[#f59e0b]/30 focus:border-[#f59e0b] bg-[#0f172a] text-[#f59e0b]' : 'border-[#f59e0b]/30 focus:border-[#1e3a8a] bg-white text-[#1e3a8a]',
                 button: isDark ? 'bg-[#f59e0b] text-[#1e3a8a] hover:bg-[#d97706]' : 'bg-[#1e3a8a] text-[#f59e0b] hover:bg-[#1e40af]'
             };
        }
        if (settings.theme === 'ceramic-majolica') {
             return {
                 bg: isDark ? 'bg-[#052e16]' : 'bg-[#fefce8]',
                 header: isDark ? 'bg-[#15803d] text-[#facc15]' : 'bg-[#15803d] text-[#facc15]',
                 activeTab: isDark ? 'bg-[#facc15] text-[#15803d] shadow-lg' : 'bg-[#15803d] text-[#facc15] shadow-lg',
                 inactiveTab: isDark ? 'bg-[#15803d]/20 text-[#facc15] hover:bg-[#15803d]/40' : 'bg-[#facc15]/10 text-[#15803d] hover:bg-[#facc15]/20',
                 input: isDark ? 'border-[#facc15]/30 focus:border-[#facc15] bg-[#052e16] text-[#facc15]' : 'border-[#facc15]/30 focus:border-[#15803d] bg-white text-[#15803d]',
                 button: isDark ? 'bg-[#facc15] text-[#15803d] hover:bg-[#ca8a04]' : 'bg-[#15803d] text-[#facc15] hover:bg-[#166534]'
             };
        }
        if (settings.theme === 'ceramic-delft') {
             return {
                 bg: isDark ? 'bg-[#082f49]' : 'bg-[#f0f9ff]',
                 header: isDark ? 'bg-[#0c4a6e] text-[#bae6fd]' : 'bg-[#0c4a6e] text-[#bae6fd]',
                 activeTab: isDark ? 'bg-[#bae6fd] text-[#0c4a6e] shadow-lg' : 'bg-[#0c4a6e] text-[#bae6fd] shadow-lg',
                 inactiveTab: isDark ? 'bg-[#0c4a6e]/20 text-[#bae6fd] hover:bg-[#0c4a6e]/40' : 'bg-[#bae6fd]/10 text-[#0c4a6e] hover:bg-[#bae6fd]/20',
                 input: isDark ? 'border-[#bae6fd]/30 focus:border-[#bae6fd] bg-[#082f49] text-[#bae6fd]' : 'border-[#bae6fd]/30 focus:border-[#0c4a6e] bg-white text-[#0c4a6e]',
                 button: isDark ? 'bg-[#bae6fd] text-[#0c4a6e] hover:bg-[#7dd3fc]' : 'bg-[#0c4a6e] text-[#bae6fd] hover:bg-[#075985]'
             };
        }
        if (settings.theme === 'ceramic-iznik') {
             return {
                 bg: isDark ? 'bg-[#450a0a]' : 'bg-[#fef2f2]',
                 header: isDark ? 'bg-[#7f1d1d] text-[#0ea5e9]' : 'bg-[#dc2626] text-[#0ea5e9]',
                 activeTab: isDark ? 'bg-[#0ea5e9] text-[#7f1d1d] shadow-lg' : 'bg-[#dc2626] text-[#0ea5e9] shadow-lg',
                 inactiveTab: isDark ? 'bg-[#7f1d1d]/20 text-[#0ea5e9] hover:bg-[#7f1d1d]/40' : 'bg-[#0ea5e9]/10 text-[#dc2626] hover:bg-[#0ea5e9]/20',
                 input: isDark ? 'border-[#0ea5e9]/30 focus:border-[#0ea5e9] bg-[#450a0a] text-[#0ea5e9]' : 'border-[#0ea5e9]/30 focus:border-[#dc2626] bg-white text-[#dc2626]',
                 button: isDark ? 'bg-[#0ea5e9] text-[#7f1d1d] hover:bg-[#0284c7]' : 'bg-[#dc2626] text-[#0ea5e9] hover:bg-[#b91c1c]'
             };
        }

        if (isZellige) {
            return {
                bg: isDark ? 'bg-[#001e21]' : 'bg-[#FDFBF7]',
                header: isDark ? 'bg-[#002a2d] text-[#f0c04a]' : 'bg-[#006269] text-[#cca43b]',
                activeTab: isDark ? 'bg-[#cca43b] text-[#001e21] shadow-lg' : 'bg-[#006269] text-white shadow-lg',
                inactiveTab: isDark ? 'bg-[#002a2d] text-[#cca43b] hover:bg-[#cca43b]/20' : 'bg-[#fbf8f1] text-[#006269] hover:bg-[#cca43b]/10',
                input: isDark ? 'border-[#cca43b]/30 focus:border-[#cca43b] bg-[#002a2d] text-[#f0c04a]' : 'border-[#cca43b]/30 focus:border-[#006269] bg-[#fbf8f1]',
                button: isDark ? 'bg-[#cca43b] text-[#001e21] hover:bg-[#b08d30]' : 'bg-[#006269] text-[#cca43b] hover:bg-[#004d53]'
            };
        }

        return {
            bg: 'bg-white dark:bg-gray-900',
            header: 'bg-gray-900 text-white',
            activeTab: 'bg-blue-600 text-white shadow-lg',
            inactiveTab: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            input: 'border-gray-200 focus:border-blue-500 bg-gray-50',
            button: 'bg-blue-600 text-white hover:bg-blue-700'
        };
    };

    const ts = getThemeStyles();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate API delay
        setTimeout(() => {
            setIsProcessing(false);
            onSuccess({
                method,
                cardInfo: method === 'card' ? { last4: cardInfo.number.slice(-4), brand: 'Visa' } : undefined
            });
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className={`w-full max-w-md md:max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative ${ts.bg}`}>
                {isZellige && <div className={`absolute inset-0 pointer-events-none bg-zellige-pattern ${isDark ? 'opacity-20 mix-blend-screen' : 'opacity-10 mix-blend-multiply'}`}></div>}
                
                {/* Header */}
                <div className={`p-6 flex justify-between items-center relative z-10 ${ts.header}`}>
                    <h3 className="text-xl font-black flex items-center gap-2">
                        <Wallet size={24}/> إتمام الدفع
                    </h3>
                    <button onClick={onClose} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition"><X size={20}/></button>
                </div>

                <div className="p-8 relative z-10">
                    <div className="text-center mb-8">
                        <p className="text-gray-500 text-sm font-bold mb-1">المبلغ المستحق</p>
                        <h2 className={`text-4xl font-black ${isZellige ? 'text-[#006269]' : 'text-gray-900'}`}>
                            {amount.toLocaleString()} <span className="text-lg text-gray-400">د.ج</span>
                        </h2>
                        <p className="text-xs text-gray-400 mt-2 font-medium">{description}</p>
                    </div>

                    {/* Payment Methods */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        <button onClick={() => setMethod('cash')} className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition font-bold text-xs ${method === 'cash' ? ts.activeTab : ts.inactiveTab}`}>
                            <Banknote size={24}/> نقداً
                        </button>
                        <button onClick={() => setMethod('card')} className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition font-bold text-xs ${method === 'card' ? ts.activeTab : ts.inactiveTab}`}>
                            <CreditCard size={24}/> بطاقة
                        </button>
                        <button onClick={() => setMethod('transfer')} className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition font-bold text-xs ${method === 'transfer' ? ts.activeTab : ts.inactiveTab}`}>
                            <Landmark size={24}/> تحويل
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {method === 'card' && (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-xs font-bold mb-1 opacity-70">رقم البطاقة</label>
                                    <div className="relative">
                                        <input 
                                            required 
                                            type="text" 
                                            placeholder="0000 0000 0000 0000" 
                                            className={`w-full p-3 pl-10 rounded-xl border-2 outline-none font-mono text-lg ${ts.input}`}
                                            value={cardInfo.number}
                                            onChange={e => setCardInfo({...cardInfo, number: e.target.value})}
                                            maxLength={19}
                                        />
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={18}/>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold mb-1 opacity-70">تاريخ الانتهاء</label>
                                        <input 
                                            required 
                                            type="text" 
                                            placeholder="MM/YY" 
                                            className={`w-full p-3 rounded-xl border-2 outline-none font-mono text-center ${ts.input}`}
                                            value={cardInfo.expiry}
                                            onChange={e => setCardInfo({...cardInfo, expiry: e.target.value})}
                                            maxLength={5}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold mb-1 opacity-70">CVC</label>
                                        <input 
                                            required 
                                            type="text" 
                                            placeholder="123" 
                                            className={`w-full p-3 rounded-xl border-2 outline-none font-mono text-center ${ts.input}`}
                                            value={cardInfo.cvc}
                                            onChange={e => setCardInfo({...cardInfo, cvc: e.target.value})}
                                            maxLength={3}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 opacity-70">اسم حامل البطاقة</label>
                                    <input 
                                        required 
                                        type="text" 
                                        placeholder="الاسم الكامل" 
                                        className={`w-full p-3 rounded-xl border-2 outline-none ${ts.input}`}
                                        value={cardInfo.name}
                                        onChange={e => setCardInfo({...cardInfo, name: e.target.value})}
                                    />
                                </div>
                            </div>
                        )}

                        {method === 'transfer' && (
                            <div className="bg-gray-50 p-4 rounded-xl text-center text-sm text-gray-500 border-2 border-dashed animate-fade-in">
                                <p className="font-bold mb-2">يرجى التحويل إلى الحساب التالي:</p>
                                <p className="font-mono text-lg select-all bg-white p-2 rounded border">DZ 0000 1234 5678 9000</p>
                                <p className="mt-2 text-xs">ثم اضغط تأكيد لإرفاق الإيصال لاحقاً</p>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isProcessing}
                            className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-2 transition transform active:scale-95 ${ts.button} ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {isProcessing ? 'جاري المعالجة...' : (
                                <>
                                    <CheckCircle size={20}/> تأكيد الدفع ({amount.toLocaleString()})
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
