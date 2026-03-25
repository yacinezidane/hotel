
import React, { useState, useRef } from 'react';
import { useHotel } from '../context/HotelContext';
import { Camera, PenTool, CheckCircle, AlertCircle, Upload, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SelfCheckInFormProps {
    bookingId: string;
    onSuccess?: () => void;
    themeColor?: string;
}

export const SelfCheckInForm: React.FC<SelfCheckInFormProps> = ({ bookingId, onSuccess, themeColor = '#006269' }) => {
    const { submitSelfCheckIn } = useHotel();
    const [step, setStep] = useState(1);
    const [idPhoto, setIdPhoto] = useState<string | null>(null);
    const [signature, setSignature] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setIdPhoto(reader.result as string);
                setStep(2);
            };
            reader.readAsDataURL(file);
        }
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        if (canvasRef.current) {
            setSignature(canvasRef.current.toDataURL());
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const clearSignature = () => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            setSignature(null);
        }
    };

    const handleSubmit = async () => {
        if (!idPhoto || !signature) return;
        setIsSubmitting(true);
        
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        submitSelfCheckIn(bookingId, {
            idPhoto,
            privacySignature: signature
        });
        
        setIsSubmitting(false);
        setIsCompleted(true);
        if (onSuccess) {
            setTimeout(onSuccess, 3000);
        }
    };

    if (isCompleted) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-xl text-center space-y-6"
            >
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle size={56} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-gray-800">تم تسجيل الوصول بنجاح!</h2>
                    <p className="text-gray-500 font-bold">بياناتك قيد المراجعة الآن. يمكنك التوجه مباشرة إلى غرفتك عند وصولك.</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-emerald-700 text-sm font-bold flex items-center gap-3">
                    <ShieldCheck size={20} />
                    تم تشفير وحفظ بيانات هويتك بأمان.
                </div>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6 bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] shadow-xl border border-white/50">
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: themeColor }}>
                        <Camera size={20} />
                    </div>
                    <h2 className="text-xl font-black text-gray-800">تسجيل الوصول الذاتي</h2>
                </div>
                <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`w-6 h-1.5 rounded-full transition-all ${step >= i ? 'bg-brand-gold' : 'bg-gray-200'}`} />
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div 
                        key="step1"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        className="space-y-6"
                    >
                        <div className="text-center space-y-2">
                            <h3 className="font-black text-gray-800">تصوير وثيقة الهوية</h3>
                            <p className="text-xs text-gray-500 font-bold">يرجى تصوير بطاقة التعريف أو جواز السفر بوضوح</p>
                        </div>
                        
                        <div className="relative aspect-[3/2] bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden group">
                            {idPhoto ? (
                                <img src={idPhoto} className="w-full h-full object-cover" alt="ID Preview" />
                            ) : (
                                <>
                                    <Camera size={48} className="text-gray-300 mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-bold text-gray-400">اضغط للتصوير أو الرفع</span>
                                </>
                            )}
                            <input 
                                type="file" 
                                accept="image/*" 
                                capture="environment"
                                onChange={handlePhotoUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700 text-[10px] font-bold">
                            <AlertCircle size={16} />
                            تأكد من أن جميع البيانات في الوثيقة واضحة وغير مغطاة.
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div 
                        key="step2"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        className="space-y-6"
                    >
                        <div className="text-center space-y-2">
                            <h3 className="font-black text-gray-800">التوقيع الرقمي</h3>
                            <p className="text-xs text-gray-500 font-bold">يرجى التوقيع داخل المربع أدناه للموافقة على الشروط</p>
                        </div>

                        <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-inner overflow-hidden relative">
                            <canvas 
                                ref={canvasRef}
                                width={400}
                                height={200}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseOut={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                className="w-full h-48 cursor-crosshair"
                            />
                            <button 
                                onClick={clearSignature}
                                className="absolute bottom-4 left-4 text-[10px] font-black text-red-500 bg-red-50 px-3 py-1 rounded-lg"
                            >
                                مسح التوقيع
                            </button>
                        </div>

                        <button 
                            disabled={!signature}
                            onClick={() => setStep(3)}
                            className="w-full bg-brand-gold text-white p-4 rounded-2xl font-black shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            متابعة <ArrowRight size={18} />
                        </button>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div 
                        key="step3"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        className="space-y-6"
                    >
                        <div className="text-center space-y-2">
                            <h3 className="font-black text-gray-800">مراجعة البيانات</h3>
                            <p className="text-xs text-gray-500 font-bold">تأكد من صحة البيانات قبل الإرسال النهائي</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase">صورة الهوية</p>
                                <div className="aspect-square rounded-2xl overflow-hidden border border-gray-100">
                                    <img src={idPhoto!} className="w-full h-full object-cover" alt="ID" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase">التوقيع</p>
                                <div className="aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                                    <img src={signature!} className="max-w-full max-h-full" alt="Signature" />
                                </div>
                            </div>
                        </div>

                        <button 
                            disabled={isSubmitting}
                            onClick={handleSubmit}
                            className="w-full bg-brand-green text-white p-5 rounded-2xl font-black shadow-xl flex items-center justify-center gap-3 hover:bg-opacity-90 transition-all"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    جاري المعالجة...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck size={20} />
                                    إتمام تسجيل الوصول
                                </>
                            )}
                        </button>
                        
                        <button 
                            onClick={() => setStep(1)}
                            className="w-full text-gray-400 font-bold text-sm"
                        >
                            تعديل البيانات
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
