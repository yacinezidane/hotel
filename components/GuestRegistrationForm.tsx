import React, { useState, useRef } from 'react';
import { useHotel } from '../context/HotelContext';
import { User, FileText, CheckCircle, AlertCircle, Send, ArrowRight, Camera, QrCode, X, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';

interface GuestRegistrationFormProps {
    bookingId?: string;
    registrationType?: 'new' | 'companion';
    onSuccess?: () => void;
}

export const GuestRegistrationForm: React.FC<GuestRegistrationFormProps> = ({ bookingId, registrationType, onSuccess }) => {
    const { submitGuestRegistrationForm } = useHotel();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [registrationId, setRegistrationId] = useState('');
    const [idPhoto, setIdPhoto] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [formData, setFormData] = useState({
        firstNameAr: '',
        lastNameAr: '',
        firstNameEn: '',
        lastNameEn: '',
        idType: 'national_id',
        idNumber: '',
        nationality: 'الجزائرية',
        birthDate: '',
        birthPlace: '',
        phone: '',
        email: '',
        address: '',
        profession: '',
        purposeOfVisit: 'tourism',
        vehiclePlate: '',
        registrationType: registrationType || 'new'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setIdPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newRegId = `REG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        setRegistrationId(newRegId);
        
        submitGuestRegistrationForm({
            ...formData,
            idPhoto,
            registrationId: newRegId,
            bookingId,
            fatherName: '',
            motherName: ''
        });
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-3xl shadow-xl text-center space-y-6 max-w-md md:max-w-2xl mx-auto border-4 border-zellige-primary/20"
            >
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={48} />
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-gray-800">تم التسجيل بنجاح</h2>
                    <p className="text-sm text-gray-500 px-4">
                        يرجى إظهار رمز الاستجابة السريع (QR) لموظف الاستقبال عند وصولك لتسريع عملية الدخول.
                    </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <QRCodeSVG 
                            value={JSON.stringify({
                                type: 'GUEST_REG',
                                regType: formData.registrationType,
                                id: registrationId,
                                name: `${formData.firstNameAr} ${formData.lastNameAr}`,
                                bookingId
                            })}
                            size={180}
                            level="H"
                            includeMargin={true}
                        />
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">رقم التسجيل</p>
                        <p className="text-lg font-black text-zellige-primary">{registrationId}</p>
                    </div>
                </div>

                <div className="pt-2 flex flex-col gap-3">
                    <button 
                        onClick={() => window.print()}
                        className="w-full bg-gray-800 text-white p-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                    >
                        <FileText size={18} /> حفظ كملف PDF
                    </button>
                    <button 
                        onClick={() => {
                            setIsSubmitted(false);
                            if (onSuccess) onSuccess();
                        }}
                        className="text-zellige-primary font-bold flex items-center gap-2 mx-auto text-sm"
                    >
                        <ArrowRight size={18} /> العودة للرئيسية
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="max-h-[90vh] overflow-y-auto custom-scrollbar pb-10 px-1">
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 relative">
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md -mx-6 -mt-6 p-6 border-b border-gray-100 rounded-t-[2.5rem] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2.5 rounded-2xl text-[#007AFF]">
                            <FileText size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900">
                                {registrationType === 'companion' ? 'تسجيل نزيل مرافق' : 'تسجيل نزيل جديد'}
                            </h2>
                            <p className="text-[10px] text-gray-400 font-bold">المعلومات الأساسية المطلوبة فقط</p>
                        </div>
                    </div>
                    {onSuccess && (
                        <button 
                            type="button"
                            onClick={onSuccess}
                            className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all active:scale-90"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div className="space-y-8 pt-4">
                    {/* Section 0: ID Photo Capture */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-gray-400 px-1 uppercase tracking-wider">وثيقة الهوية</label>
                        <div className="relative">
                            {idPhoto ? (
                                <div className="relative group">
                                    <img 
                                        src={idPhoto} 
                                        alt="ID Document" 
                                        className="w-full h-40 object-cover rounded-3xl border border-gray-100 shadow-sm"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setIdPhoto(null)}
                                        className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-red-500 w-8 h-8 rounded-full shadow-lg flex items-center justify-center active:scale-90"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-40 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 transition-all active:scale-[0.98]"
                                >
                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100">
                                        <Camera size={24} className="text-[#007AFF]" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-gray-600 text-sm">تصوير أو رفع الهوية</p>
                                        <p className="text-[10px] text-gray-400">بطاقة تعريف أو جواز سفر</p>
                                    </div>
                                </button>
                            )}
                            <input 
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePhotoCapture}
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Section 1: Names */}
                    <div className="space-y-4">
                        <label className="text-xs font-black text-gray-400 px-1 uppercase tracking-wider">المعلومات الشخصية</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <input 
                                    required
                                    type="text" 
                                    name="firstNameAr"
                                    placeholder="الاسم (Ar)"
                                    value={formData.firstNameAr}
                                    onChange={handleChange}
                                    className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#007AFF] focus:ring-0 font-bold text-sm transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <input 
                                    required
                                    type="text" 
                                    name="lastNameAr"
                                    placeholder="اللقب (Ar)"
                                    value={formData.lastNameAr}
                                    onChange={handleChange}
                                    className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#007AFF] focus:ring-0 font-bold text-sm transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <input 
                                    required
                                    type="text" 
                                    name="firstNameEn"
                                    placeholder="First Name"
                                    value={formData.firstNameEn}
                                    onChange={handleChange}
                                    dir="ltr"
                                    className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#007AFF] focus:ring-0 font-bold text-sm transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <input 
                                    required
                                    type="text" 
                                    name="lastNameEn"
                                    placeholder="Last Name"
                                    value={formData.lastNameEn}
                                    onChange={handleChange}
                                    dir="ltr"
                                    className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#007AFF] focus:ring-0 font-bold text-sm transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Identity & Birth */}
                    <div className="space-y-4">
                        <label className="text-xs font-black text-gray-400 px-1 uppercase tracking-wider">الهوية والميلاد</label>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <select 
                                    name="idType"
                                    value={formData.idType}
                                    onChange={handleChange}
                                    className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#007AFF] focus:ring-0 font-bold text-sm transition-all"
                                >
                                    <option value="national_id">بطاقة تعريف</option>
                                    <option value="passport">جواز سفر</option>
                                    <option value="driving_license">رخصة سياقة</option>
                                </select>
                                <input 
                                    required
                                    type="text" 
                                    name="idNumber"
                                    placeholder="رقم الوثيقة"
                                    value={formData.idNumber}
                                    onChange={handleChange}
                                    className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#007AFF] focus:ring-0 font-bold text-sm transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input 
                                    required
                                    type="date" 
                                    name="birthDate"
                                    value={formData.birthDate}
                                    onChange={handleChange}
                                    className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#007AFF] focus:ring-0 font-bold text-sm transition-all"
                                />
                                <input 
                                    required
                                    type="text" 
                                    name="birthPlace"
                                    placeholder="مكان الميلاد"
                                    value={formData.birthPlace}
                                    onChange={handleChange}
                                    className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#007AFF] focus:ring-0 font-bold text-sm transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Contact & Address */}
                    <div className="space-y-4">
                        <label className="text-xs font-black text-gray-400 px-1 uppercase tracking-wider">التواصل والعنوان</label>
                        <div className="grid grid-cols-1 gap-3">
                            <input 
                                required
                                type="tel" 
                                name="phone"
                                placeholder="رقم الهاتف"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#007AFF] focus:ring-0 font-bold text-sm transition-all"
                            />
                            <textarea 
                                name="address"
                                placeholder="العنوان الكامل"
                                value={formData.address}
                                onChange={handleChange}
                                rows={2}
                                className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#007AFF] focus:ring-0 font-bold text-sm transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* Section 4: Profession & Purpose */}
                    <div className="space-y-4">
                        <label className="text-xs font-black text-gray-400 px-1 uppercase tracking-wider">تفاصيل إضافية</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input 
                                type="text" 
                                name="profession"
                                placeholder="المهنة"
                                value={formData.profession}
                                onChange={handleChange}
                                className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#007AFF] focus:ring-0 font-bold text-sm transition-all"
                            />
                            <select 
                                name="purposeOfVisit"
                                value={formData.purposeOfVisit}
                                onChange={handleChange}
                                className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#007AFF] focus:ring-0 font-bold text-sm transition-all"
                            >
                                <option value="tourism">سياحة</option>
                                <option value="business">عمل</option>
                                <option value="family">زيارة عائلية</option>
                                <option value="medical">علاج</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="sticky bottom-0 bg-white/95 backdrop-blur-md -mx-6 -mb-6 p-6 border-t border-gray-100 rounded-b-[2.5rem] mt-8">
                    <button 
                        type="submit"
                        className="w-full bg-[#007AFF] text-white py-4 rounded-2xl font-black shadow-md hover:shadow-lg hover:bg-[#0066D6] transition-all flex items-center justify-center gap-2 transform active:scale-95 border border-[#007AFF]/20"
                    >
                        <Send size={20} /> تأكيد وإرسال البيانات
                    </button>
                    
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 justify-center mt-4">
                        <Shield size={12} />
                        بياناتك محمية ومشفرة وفقاً لمعايير الخصوصية.
                    </div>
                </div>
            </form>
        </div>
    );
};

export default GuestRegistrationForm;
