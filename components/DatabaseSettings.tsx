import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Database, ShieldCheck, Save, AlertTriangle, Info, RefreshCw, CheckCircle } from 'lucide-react';
import { PrivateFirebaseConfig } from '../types';

export const DatabaseSettings: React.FC = () => {
    const { settings, updateSettings, addNotification } = useHotel();
    const [config, setConfig] = useState<PrivateFirebaseConfig>(settings.privateFirebaseConfig || {
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
        measurementId: '',
        databaseId: '(default)'
    });
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSettings({ privateFirebaseConfig: config });
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                if (window.confirm('تم حفظ الإعدادات. يجب إعادة تحميل التطبيق لتطبيق التغييرات. هل تريد إعادة التحميل الآن؟')) {
                    window.location.reload();
                }
            }, 1000);
        } catch (error) {
            console.error("Failed to save database settings:", error);
            addNotification('فشل حفظ الإعدادات', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (name: string, value: string) => {
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm" dir="rtl">
            <header className="flex flex-col md:flex-row-reverse justify-between items-start md:items-center gap-4 mb-8">
                <div className="text-right">
                    <div className="flex items-center gap-3 justify-end">
                        <Database className="w-8 h-8 text-blue-600" />
                        <h1 className="text-2xl font-black text-gray-900">إعدادات قاعدة البيانات المستقلة</h1>
                    </div>
                    <p className="text-gray-500 mt-2">قم بربط الفندق بقاعدة بيانات Firebase الخاصة بك لضمان استقلالية وخصوصية البيانات.</p>
                </div>
            </header>

            <div className="flex items-start gap-4 bg-amber-50 p-6 rounded-2xl border border-amber-100 flex-row-reverse mb-8">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-right">
                    <p className="text-sm font-black text-amber-800 mb-1">تنبيه هام:</p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                        تغيير هذه الإعدادات سيؤدي إلى محاولة التطبيق الاتصال بقاعدة بيانات جديدة. تأكد من صحة البيانات المدخلة ومن تفعيل Firestore و Authentication في مشروع Firebase الخاص بك.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <section className="space-y-6">
                    <div className="flex items-center gap-2 flex-row-reverse mb-4">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <h3 className="text-lg font-black text-gray-900">بيانات الاتصال (Firebase SDK Config)</h3>
                    </div>
                    
                    {[
                        { label: 'API Key', name: 'apiKey', placeholder: 'AIzaSy...', secure: true },
                        { label: 'Project ID', name: 'projectId', placeholder: 'my-hotel-db' },
                        { label: 'Auth Domain', name: 'authDomain', placeholder: 'my-hotel-db.firebaseapp.com' },
                        { label: 'App ID', name: 'appId', placeholder: '1:123456789:web:abcdef...' }
                    ].map((field) => (
                        <div key={field.name} className="space-y-1">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider text-right px-1">{field.label}</label>
                            <input 
                                type={field.secure ? "password" : "text"}
                                value={(config as any)[field.name]}
                                onChange={(e) => handleChange(field.name, e.target.value)}
                                placeholder={field.placeholder}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 text-right focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    ))}
                </section>

                <section className="space-y-6">
                    <div className="flex items-center gap-2 flex-row-reverse mb-4">
                        <Info className="w-5 h-5 text-blue-500" />
                        <h3 className="text-lg font-black text-gray-900">إعدادات إضافية</h3>
                    </div>
                    
                    {[
                        { label: 'Storage Bucket', name: 'storageBucket', placeholder: 'my-hotel-db.appspot.com' },
                        { label: 'Messaging Sender ID', name: 'messagingSenderId', placeholder: '123456789' },
                        { label: 'Firestore Database ID', name: 'databaseId', placeholder: '(default)' }
                    ].map((field) => (
                        <div key={field.name} className="space-y-1">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider text-right px-1">{field.label}</label>
                            <input 
                                type="text"
                                value={(config as any)[field.name]}
                                onChange={(e) => handleChange(field.name, e.target.value)}
                                placeholder={field.placeholder}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 text-right focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    ))}

                    <div className="pt-6 space-y-4">
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
                                showSuccess ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {isSaving ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : showSuccess ? (
                                <CheckCircle className="w-5 h-5" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            <span>{isSaving ? 'جاري الحفظ...' : showSuccess ? 'تم الحفظ بنجاح' : 'حفظ إعدادات الربط'}</span>
                        </button>

                        {settings.privateFirebaseConfig && (
                            <button 
                                onClick={() => {
                                    if (window.confirm('هل أنت متأكد من العودة لقاعدة البيانات الافتراضية؟ سيتم إعادة تحميل التطبيق.')) {
                                        updateSettings({ privateFirebaseConfig: undefined });
                                        window.location.reload();
                                    }
                                }}
                                className="w-full py-3 rounded-2xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors"
                            >
                                العودة لقاعدة البيانات الافتراضية
                            </button>
                        )}
                    </div>
                </section>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-8">
                <div className="flex items-center gap-2 mb-4 flex-row-reverse">
                    <Info className="w-5 h-5 text-blue-700" />
                    <h3 className="text-lg font-black text-blue-900">كيفية الحصول على هذه البيانات؟</h3>
                </div>
                <ol className="space-y-3 text-right text-sm text-blue-800 list-decimal list-inside">
                    <li>قم بإنشاء مشروع جديد في Firebase Console.</li>
                    <li>أضف تطبيق ويب (Web App) للمشروع.</li>
                    <li>انسخ كائن الإعدادات (firebaseConfig) وألصق القيم في الحقول أعلاه.</li>
                    <li>تأكد من تفعيل Firestore Database و Authentication في لوحة تحكم Firebase.</li>
                    <li>أضف رابط التطبيق الحالي إلى قائمة النطاقات المسموح بها.</li>
                </ol>
            </div>
        </div>
    );
};
