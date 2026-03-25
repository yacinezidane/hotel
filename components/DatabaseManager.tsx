import React, { useState, useRef } from 'react';
import { 
    Database, FileSpreadsheet, Box, FileText, Download, Upload, 
    Copy, Check, AlertTriangle, Shield, Info, Trash2, Search,
    RefreshCw, Save, History, Settings, Users, Key, ShieldCheck,
    ChevronLeft, X
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { exportAllData, importAllData, mergeGuestHistory } from '../utils/db';
import { GuestInfo } from '../types';
import { DatabaseSettings } from './DatabaseSettings';

export const DatabaseManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'excel' | 'capsule' | 'bulk' | 'firebase'>('excel');
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [lastBackup, setLastBackup] = useState<string | null>(localStorage.getItem('last_db_backup'));
    const [capsuleData, setCapsuleData] = useState('');
    const [bulkText, setBulkText] = useState('');
    const [parsedGuests, setParsedGuests] = useState<GuestInfo[]>([]);
    const [showSuccess, setShowSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExportExcel = async () => {
        setIsExporting(true);
        setError(null);
        try {
            const data = await exportAllData();
            const wb = XLSX.utils.book_new();
            
            Object.entries(data).forEach(([storeName, items]) => {
                const ws = XLSX.utils.json_to_sheet(items as any[]);
                XLSX.utils.book_append_sheet(wb, ws, storeName.substring(0, 31));
            });

            const date = new Date().toISOString().split('T')[0];
            XLSX.writeFile(wb, `hotel_db_${date}.xlsx`);
            
            const now = new Date().toLocaleString('ar-SA');
            localStorage.setItem('last_db_backup', now);
            setLastBackup(now);
            triggerSuccess('تم تصدير البيانات بنجاح');
        } catch (err) {
            console.error(err);
            setError('فشل تصدير البيانات');
        } finally {
            setIsExporting(false);
        }
    };

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!window.confirm('تحذير: الاستيراد سيحذف كافة البيانات الحالية ويستبدلها ببيانات الملف. هل أنت متأكد؟')) {
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setIsImporting(true);
        setError(null);
        try {
            const reader = new FileReader();
            reader.onload = async (evt) => {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const importedData: Record<string, any[]> = {};
                
                wb.SheetNames.forEach(sheetName => {
                    const ws = wb.Sheets[sheetName];
                    importedData[sheetName] = XLSX.utils.sheet_to_json(ws);
                });

                await importAllData(importedData);
                triggerSuccess('تم استيراد البيانات بنجاح. سيتم إعادة تحميل التطبيق.');
                setTimeout(() => window.location.reload(), 2000);
            };
            reader.readAsBinaryString(file);
        } catch (err) {
            console.error(err);
            setError('فشل استيراد البيانات. تأكد من صحة الملف.');
        } finally {
            setIsImporting(false);
        }
    };

    const generateCapsule = async () => {
        setIsExporting(true);
        try {
            const data = await exportAllData();
            const json = JSON.stringify(data);
            const base64 = btoa(unescape(encodeURIComponent(json)));
            setCapsuleData(base64);
            triggerSuccess('تم توليد الكبسولة بنجاح');
        } catch (err) {
            setError('فشل توليد الكبسولة');
        } finally {
            setIsExporting(false);
        }
    };

    const restoreCapsule = async () => {
        if (!capsuleData) return;
        
        if (!window.confirm('تحذير: استعادة الكبسولة ستحذف البيانات الحالية. هل أنت متأكد؟')) return;

        setIsImporting(true);
        try {
            const json = decodeURIComponent(escape(atob(capsuleData)));
            const data = JSON.parse(json);
            await importAllData(data);
            triggerSuccess('تمت استعادة البيانات بنجاح. سيتم إعادة تحميل التطبيق.');
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            setError('الكبسولة غير صالحة أو تالفة');
        } finally {
            setIsImporting(false);
        }
    };

    const parseBulkText = () => {
        const lines = bulkText.split('\n').filter(l => l.trim());
        const guests: GuestInfo[] = lines.map(line => {
            const parts = line.split('\t');
            return {
                idType: 'national_id',
                idNumber: parts[0] || '',
                firstNameAr: parts[1] || '',
                lastNameAr: parts[2] || '',
                firstNameEn: '',
                lastNameEn: '',
                birthDate: parts[3] || '',
                birthPlace: '',
                fatherName: '',
                motherName: '',
                nationality: parts[4] || 'سعودي',
                phone: parts[5] || '',
                email: parts[6] || '',
                lastVisit: new Date().toISOString()
            };
        }).filter(g => g.idNumber);
        setParsedGuests(guests);
    };

    const saveBulkGuests = async () => {
        if (parsedGuests.length === 0) return;
        setIsImporting(true);
        try {
            await mergeGuestHistory(parsedGuests);
            triggerSuccess(`تمت إضافة ${parsedGuests.length} نزيل بنجاح`);
            setBulkText('');
            setParsedGuests([]);
        } catch (err) {
            setError('فشل استيراد النزلاء');
        } finally {
            setIsImporting(false);
        }
    };

    const triggerSuccess = (msg: string) => {
        setShowSuccess(msg);
        setTimeout(() => setShowSuccess(null), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans" dir="rtl">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row-reverse justify-between items-start md:items-center gap-4 mb-8">
                <div className="text-right">
                    <div className="flex items-center gap-3 justify-end">
                        <Database className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-black text-gray-900">إدارة قاعدة البيانات</h1>
                    </div>
                    <p className="text-gray-500 mt-2">تحكم كامل في بياناتك: تصدير، استيراد، ومزامنة محلية احترافية.</p>
                </div>
                
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${lastBackup ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    <Shield className="w-4 h-4" />
                    <span>{lastBackup ? `آخر نسخة: ${lastBackup}` : 'لم يتم أخذ نسخة احتياطية بعد'}</span>
                    {lastBackup && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                </div>
            </header>

            {/* Tabs Navigation */}
            <nav className="flex bg-gray-200 p-1 rounded-2xl gap-1 mb-8">
                {[
                    { id: 'excel', icon: FileSpreadsheet, label: 'نظام Excel' },
                    { id: 'capsule', icon: Box, label: 'الكبسولة' },
                    { id: 'bulk', icon: FileText, label: 'استيراد نصي' },
                    { id: 'firebase', icon: ShieldCheck, label: 'السحابة' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all ${
                            activeTab === tab.id 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-gray-500 hover:bg-gray-300'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <main className="lg:col-span-2 space-y-8">
                    {activeTab === 'excel' && (
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4 mb-8 flex-row-reverse">
                                <div className="p-3 bg-blue-50 rounded-2xl">
                                    <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="text-right">
                                    <h2 className="text-xl font-black text-gray-900">إدارة ملفات Excel</h2>
                                    <p className="text-sm text-gray-500">الطريقة الرسمية للنسخ الاحتياطي الشامل</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <button 
                                    onClick={handleExportExcel}
                                    disabled={isExporting}
                                    className="group relative overflow-hidden bg-blue-600 p-8 rounded-3xl text-right transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                                >
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="p-4 bg-white/20 rounded-2xl">
                                            <Download className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="text-center">
                                            <span className="block text-lg font-black text-white">تصدير إلى Excel</span>
                                            <span className="text-xs text-blue-100">تحميل كافة الجداول في ملف واحد</span>
                                        </div>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isImporting}
                                    className="group relative overflow-hidden bg-white border-2 border-dashed border-gray-200 p-8 rounded-3xl text-right transition-all hover:border-blue-400 hover:bg-blue-50/30 active:scale-95 disabled:opacity-50"
                                >
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-blue-100 transition-colors">
                                            <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-600" />
                                        </div>
                                        <div className="text-center">
                                            <span className="block text-lg font-black text-gray-700 group-hover:text-blue-700">استيراد من Excel</span>
                                            <span className="text-xs text-gray-400">رفع ملف احتياطي سابق</span>
                                        </div>
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleImportExcel} 
                                        accept=".xlsx,.xls" 
                                        className="hidden" 
                                    />
                                </button>
                            </div>

                            <div className="flex items-start gap-4 bg-amber-50 p-4 rounded-2xl border border-amber-100 flex-row-reverse">
                                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-800 leading-relaxed text-right">
                                    <strong className="font-black">تنبيه أمني:</strong> عملية الاستيراد ستقوم بمسح كافة البيانات الحالية (الغرف، الحجوزات، المستخدمين) واستبدالها بمحتويات الملف. يرجى التأكد من اختيار الملف الصحيح.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'capsule' && (
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4 mb-8 flex-row-reverse">
                                <div className="p-3 bg-purple-50 rounded-2xl">
                                    <Box className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="text-right">
                                    <h2 className="text-xl font-black text-gray-900">كبسولة البيانات (Data Capsule)</h2>
                                    <p className="text-sm text-gray-500">نقل البيانات عبر نص مشفر بدون ملفات</p>
                                </div>
                            </div>

                            <div className="relative mb-6">
                                <textarea 
                                    value={capsuleData}
                                    onChange={(e) => setCapsuleData(e.target.value)}
                                    placeholder="ألصق كبسولة البيانات هنا للاستعادة، أو اضغط توليد لإنشاء كبسولة جديدة..."
                                    className="w-full h-48 bg-gray-50 rounded-3xl p-6 text-xs font-mono text-gray-600 text-right border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                                />
                                {capsuleData && (
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(capsuleData);
                                            triggerSuccess('تم نسخ الكبسولة');
                                        }}
                                        className="absolute bottom-4 left-4 bg-white p-2 rounded-xl shadow-md hover:bg-gray-50 transition-colors"
                                    >
                                        <Copy className="w-4 h-4 text-purple-600" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button 
                                    onClick={generateCapsule}
                                    className="bg-purple-600 text-white py-4 rounded-2xl font-black hover:bg-purple-700 transition-colors"
                                >
                                    توليد كبسولة جديدة
                                </button>
                                <button 
                                    onClick={restoreCapsule}
                                    disabled={!capsuleData}
                                    className="bg-white border border-purple-200 text-purple-600 py-4 rounded-2xl font-black hover:bg-purple-50 transition-colors disabled:opacity-50"
                                >
                                    استعادة من الكبسولة
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'bulk' && (
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4 mb-8 flex-row-reverse">
                                <div className="p-3 bg-emerald-50 rounded-2xl">
                                    <FileText className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div className="text-right">
                                    <h2 className="text-xl font-black text-gray-900">الاستيراد النصي الذكي</h2>
                                    <p className="text-sm text-gray-500">إضافة نزلاء تاريخيين بسرعة من قوائم خارجية</p>
                                </div>
                            </div>

                            <div className="bg-emerald-50 p-4 rounded-2xl mb-6 text-right">
                                <p className="text-xs font-black text-emerald-800 mb-1">طريقة الاستخدام:</p>
                                <p className="text-[11px] text-emerald-700 leading-relaxed">
                                    انسخ صفوفاً من ملف Excel (رقم الهوية، الاسم، اللقب، تاريخ الميلاد) وألصقها هنا. سيقوم النظام بالتعرف عليها تلقائياً.
                                </p>
                            </div>

                            <textarea 
                                value={bulkText}
                                onChange={(e) => setBulkText(e.target.value)}
                                placeholder="رقم الهوية	الاسم الأول	اللقب	تاريخ الميلاد..."
                                className="w-full h-32 bg-gray-50 rounded-2xl p-4 text-xs text-gray-600 text-right border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none mb-4"
                            />

                            <button 
                                onClick={parseBulkText}
                                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-black hover:bg-emerald-700 transition-colors mb-6"
                            >
                                تحليل البيانات ومعاينتها
                            </button>

                            {parsedGuests.length > 0 && (
                                <div className="space-y-4">
                                    <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                                        <table className="w-full text-right text-xs">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="p-3 font-black text-gray-700">الهوية</th>
                                                    <th className="p-3 font-black text-gray-700">الاسم</th>
                                                    <th className="p-3 font-black text-gray-700">تاريخ الميلاد</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {parsedGuests.map((g, i) => (
                                                    <tr key={i}>
                                                        <td className="p-3 text-gray-600">{g.idNumber}</td>
                                                        <td className="p-3 text-gray-600">{g.firstName} {g.lastName}</td>
                                                        <td className="p-3 text-gray-600">{g.birthDate}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <button 
                                        onClick={saveBulkGuests}
                                        className="w-full flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 py-4 rounded-2xl font-black hover:bg-emerald-200 transition-colors"
                                    >
                                        <Save className="w-5 h-5" />
                                        <span>تأكيد الإضافة إلى السجل ({parsedGuests.length} نزيل)</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'firebase' && <DatabaseSettings />}
                </main>

                {activeTab !== 'firebase' && (
                    <aside className="space-y-8">
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-6 flex-row-reverse">
                                <Info className="w-5 h-5 text-blue-500" />
                                <h3 className="text-lg font-black text-gray-900">لماذا Excel؟</h3>
                            </div>
                            <ul className="space-y-4 text-right">
                                {[
                                    { title: 'العمل بدون إنترنت', desc: 'بياناتك مخزنة محلياً بالكامل ولا تحتاج لاتصال سحابي.' },
                                    { title: 'التحكم المطلق', desc: 'أنت تملك ملفاتك ويمكنك فتحها بأي برنامج جداول بيانات.' },
                                    { title: 'سهولة النقل', desc: 'انقل فندقك بالكامل من جهاز لآخر في ثوانٍ معدودة.' }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-3 flex-row-reverse">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            <strong className="font-black text-gray-800">{item.title}: </strong>
                                            {item.desc}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-6 flex-row-reverse">
                                <Shield className="w-5 h-5 text-emerald-500" />
                                <h3 className="text-lg font-black text-gray-900">نصائح الأمان</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-emerald-50 p-4 rounded-2xl text-right">
                                    <p className="text-[11px] font-black text-emerald-800 mb-1">النسخ الدوري:</p>
                                    <p className="text-[10px] text-emerald-700 leading-relaxed">ننصح بأخذ نسخة احتياطية في نهاية كل نوبة عمل (Shift) لضمان عدم فقدان أي بيانات.</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-2xl text-right">
                                    <p className="text-[11px] font-black text-blue-800 mb-1">التخزين الخارجي:</p>
                                    <p className="text-[10px] text-blue-700 leading-relaxed">احتفظ بملفات الـ Excel في وحدة تخزين خارجية (USB) أو سحابة خاصة بك بعيداً عن المتصفح.</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                )}
            </div>

            {/* Status Toasts */}
            {showSuccess && (
                <div className="fixed bottom-8 right-8 bg-gray-900 text-white px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl animate-in slide-in-from-bottom-10 z-50 flex-row-reverse">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold">{showSuccess}</span>
                </div>
            )}

            {error && (
                <div className="fixed bottom-8 right-8 bg-red-600 text-white px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl animate-in slide-in-from-bottom-10 z-50 flex-row-reverse">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-bold flex-1">{error}</span>
                    <button onClick={() => setError(null)}><X className="w-5 h-5" /></button>
                </div>
            )}

            {/* Loading Overlay */}
            {(isExporting || isImporting) && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
                    <div className="bg-white p-10 rounded-[3rem] flex flex-col items-center gap-4 shadow-2xl">
                        <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />
                        <h3 className="text-xl font-black text-gray-900">جاري معالجة البيانات...</h3>
                        <p className="text-gray-500">يرجى عدم إغلاق الصفحة</p>
                    </div>
                </div>
            )}
        </div>
    );
};
