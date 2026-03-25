
import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { 
    User, Mail, Phone, Calendar, Briefcase, Award, ShieldAlert, FileText, Send, 
    MessageSquare, AlertCircle, CheckCircle, Clock, Edit3, Key, Eye, EyeOff, 
    HelpCircle, DollarSign, Wallet, IdCard, Scan, X, Save
} from 'lucide-react';
import { StaffRequest, StaffRequestType } from '../types';

export const UserProfilePage: React.FC = () => {
    const { currentUser, staffRequests, submitStaffRequest, settings, setActiveProfile, addNotification, updateUser } = useHotel();
    const [activeTab, setActiveTab] = useState<'profile' | 'requests' | 'new_request' | 'emergency'>('profile');
    const [showSalary, setShowSalary] = useState(false);
    const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
    
    // Edit Modals State
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [isEditSalaryModalOpen, setIsEditSalaryModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        phone: '',
        email: '',
        password: ''
    });
    const [salaryForm, setSalaryForm] = useState({
        amount: 0
    });

    // Initialize forms when modal opens
    React.useEffect(() => {
        if (currentUser) {
            setEditForm({
                name: currentUser.name,
                phone: currentUser.phone || '',
                email: currentUser.email || '',
                password: ''
            });
            setSalaryForm({
                amount: currentUser.salary
            });
        }
    }, [currentUser, isEditProfileModalOpen, isEditSalaryModalOpen]);

    // Request Form State
    const [requestForm, setRequestForm] = useState({
        type: 'admin_inquiry' as StaffRequestType,
        subject: '',
        description: '',
        priority: 'normal' as 'normal' | 'urgent'
    });

    if (!currentUser) return null;

    const myRequests = staffRequests.filter(req => req.userId === currentUser.id);

    const handleSubmitRequest = (e: React.FormEvent) => {
        e.preventDefault();
        if(!requestForm.subject || !requestForm.description) return;

        submitStaffRequest({
            userId: currentUser.id,
            type: requestForm.type,
            subject: requestForm.subject,
            description: requestForm.description,
            priority: requestForm.priority
        });

        addNotification("تم إرسال طلبك بنجاح وسيتم الرد عليه قريباً.", "success");
        setActiveTab('requests');
        setRequestForm({ type: 'admin_inquiry', subject: '', description: '', priority: 'normal' });
    };

    const handleEmergencyCall = () => {
        // Logic to trigger urgent notification
        submitStaffRequest({
            userId: currentUser.id,
            type: 'other',
            subject: 'نداء طوارئ عاجل',
            description: 'الموظف يطلب تدخلاً عاجلاً.',
            priority: 'urgent'
        });
        addNotification("تم إشعار الإدارة.", "info");
        setShowEmergencyConfirm(false);
    };

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        
        const updates: any = {
            name: editForm.name,
            phone: editForm.phone,
            email: editForm.email
        };
        
        if (editForm.password) {
            updates.password = editForm.password; // In a real app, hash this!
        }

        updateUser(currentUser.id, updates, "تم تحديث الملف الشخصي بنجاح");
        setIsEditProfileModalOpen(false);
    };

    const handleUpdateSalary = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        
        updateUser(currentUser.id, { salary: Number(salaryForm.amount) }, "تم تحديث الراتب بنجاح");
        setIsEditSalaryModalOpen(false);
    };

    // Trigger the global modal with QR view by default via a slight hack (modal opens on profile, user switches to QR)
    // Or better, just open the modal, users can click QR there.
    const openDigitalID = () => {
        setActiveProfile(currentUser);
    };

    // Theme Styles
    const getThemeStyles = () => {
        const isZellige = settings.theme === 'zellige' || settings.theme === 'zellige-v2';
        const isDark = settings.darkMode;

        if (isZellige && isDark) {
            return {
                bg: 'bg-[#001e21]',
                card: 'bg-[#002a2d] border border-[#cca43b]/30 shadow-lg shadow-[#cca43b]/5 relative overflow-hidden',
                accent: 'text-[#cca43b]',
                button: 'bg-[#cca43b] text-[#001e21] hover:bg-[#b08d30] font-bold border border-[#cca43b]',
                header: 'bg-[#002a2d] text-[#cca43b] border-b border-[#cca43b]/20',
                tabActive: 'bg-[#cca43b] text-[#001e21] shadow-lg shadow-[#cca43b]/20',
                tabInactive: 'text-[#cca43b]/60 bg-[#001e21] hover:bg-[#cca43b]/10 border border-[#cca43b]/20',
                textPrimary: 'text-[#cca43b]',
                textSecondary: 'text-[#cca43b]/70',
                input: 'bg-[#001517] border-[#cca43b]/30 text-[#cca43b] placeholder-[#cca43b]/30 focus:border-[#cca43b]',
                pattern: 'bg-zellige-pattern opacity-10 mix-blend-screen',
                badge: 'bg-[#cca43b]/20 text-[#cca43b] border border-[#cca43b]/20',
                divider: 'border-[#cca43b]/20',
                successBadge: 'bg-green-900/30 text-green-400 border border-green-800',
                warningBadge: 'bg-yellow-900/30 text-yellow-400 border border-yellow-800',
                errorBadge: 'bg-red-900/30 text-red-400 border border-red-800',
                infoBadge: 'bg-blue-900/30 text-blue-400 border border-blue-800',
                sectionBg: 'bg-[#001517]/50'
            };
        }

        if (isZellige) {
            return {
                bg: 'bg-[#FDFBF7]',
                card: 'bg-white border border-[#cca43b]/30 shadow-sm relative overflow-hidden',
                accent: 'text-[#006269]',
                button: 'bg-[#006269] text-[#cca43b] hover:bg-[#004d53]',
                header: 'bg-[#006269] text-[#cca43b]',
                tabActive: 'bg-[#006269] text-[#cca43b] shadow-md',
                tabInactive: 'text-[#006269] bg-[#fbf8f1] hover:bg-[#cca43b]/10 border border-[#cca43b]/20',
                textPrimary: 'text-[#006269]',
                textSecondary: 'text-[#006269]/70',
                input: 'bg-[#fbf8f1] border-[#cca43b]/30 text-[#006269] placeholder-[#006269]/50 focus:border-[#006269]',
                pattern: 'bg-zellige-pattern opacity-5 mix-blend-multiply',
                badge: 'bg-[#cca43b]/20 text-[#006269]',
                divider: 'border-[#cca43b]/20',
                successBadge: 'bg-green-100 text-green-700',
                warningBadge: 'bg-yellow-100 text-yellow-700',
                errorBadge: 'bg-red-100 text-red-700',
                infoBadge: 'bg-blue-100 text-blue-700',
                sectionBg: 'bg-[#fbf8f1]'
            };
        }

        // Default Theme
        return {
            bg: 'bg-gray-50 dark:bg-gray-900',
            card: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm',
            accent: 'text-blue-600 dark:text-blue-400',
            button: 'bg-blue-600 text-white hover:bg-blue-700',
            header: 'bg-slate-900 text-white',
            tabActive: 'bg-blue-600 text-white',
            tabInactive: 'text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
            textPrimary: 'text-gray-800 dark:text-white',
            textSecondary: 'text-gray-500 dark:text-gray-400',
            input: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white',
            pattern: '',
            badge: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
            divider: 'border-gray-200 dark:border-gray-700',
            successBadge: 'bg-green-100 text-green-700',
            warningBadge: 'bg-yellow-100 text-yellow-700',
            errorBadge: 'bg-red-100 text-red-700',
            infoBadge: 'bg-blue-100 text-blue-700',
            sectionBg: 'bg-gray-50 dark:bg-gray-900'
        };
    };
    const ts = getThemeStyles();
    const isZellige = settings.theme === 'zellige' || settings.theme === 'zellige-v2';
    const isDark = settings.darkMode;

    const getRequestTypeLabel = (type: StaffRequestType) => {
        switch(type) {
            case 'financial_appeal': return 'طعن مالي / راتب';
            case 'admin_inquiry': return 'استفسار إداري';
            case 'complaint': return 'شكوى / تظلم';
            case 'suggestion': return 'اقتراح تحسين';
            case 'resignation': return 'استقالة / إعفاء';
            default: return 'أخرى';
        }
    };

    return (
        <div className={`space-y-6 pb-20 animate-fade-in ${ts.bg}`}>
            <PageHeader pageKey="profile" defaultTitle="ملفي الشخصي وبوابة الموظف" icon={User} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- LEFT COLUMN: ID CARD & STATS --- */}
                <div className="space-y-6">
                    {/* ID Card */}
                    <div className={`rounded-[2.5rem] overflow-hidden relative ${ts.card}`}>
                        {isZellige && <div className={`absolute inset-0 pointer-events-none ${ts.pattern}`}></div>}
                        <div className={`h-32 ${ts.header} relative flex items-center justify-center overflow-hidden`}>
                            {isZellige && <div className="absolute inset-0 opacity-30 bg-zellige-pattern mix-blend-overlay"></div>}
                            <div className="absolute -bottom-10 p-1.5 bg-white/10 backdrop-blur-sm rounded-full border-2 border-white/20">
                                <img src={currentUser.avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white/20 shadow-md"/>
                            </div>
                        </div>
                        <div className="pt-14 pb-8 px-6 text-center relative z-10">
                            <h2 className={`text-2xl font-black mb-1 ${ts.textPrimary}`}>{currentUser.name}</h2>
                            <p className={`text-sm font-bold mb-4 ${ts.textSecondary}`}>{currentUser.jobTitle || 'موظف'}</p>
                            
                            <div className="flex justify-center gap-2 mb-6">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${ts.badge}`}>{currentUser.role}</span>
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${ts.badge}`}>{currentUser.department}</span>
                            </div>

                            <button 
                                onClick={openDigitalID}
                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg mb-6 transition hover:scale-105 ${ts.button}`}
                            >
                                <Scan size={20} /> إظهار البطاقة المهنية (QR)
                            </button>

                            <div className={`grid grid-cols-2 gap-4 border-t pt-6 ${ts.divider}`}>
                                <div>
                                    <span className={`block text-xs font-bold mb-1 opacity-60 ${ts.textSecondary}`}>تاريخ الانضمام</span>
                                    <span className={`font-mono font-bold ${ts.textPrimary}`}>{new Date(currentUser.joinDate).toLocaleDateString('ar-SA')}</span>
                                </div>
                                <div>
                                    <span className={`block text-xs font-bold mb-1 opacity-60 ${ts.textSecondary}`}>الرقم الوظيفي</span>
                                    <span className={`font-mono font-bold uppercase ${ts.textPrimary}`}>#{currentUser.id.slice(-4)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className={`p-6 rounded-[2rem] relative overflow-hidden ${ts.card}`}>
                        {(isZellige || isDark) && <div className={`absolute inset-0 pointer-events-none ${ts.pattern}`}></div>}
                        <h3 className={`font-black text-lg mb-4 flex items-center gap-2 relative z-10 ${ts.textPrimary}`}>
                            <Wallet size={20}/> البيانات المالية
                        </h3>
                        <div className="space-y-4 relative z-10">
                            <div className={`flex justify-between items-center p-4 rounded-2xl ${ts.sectionBg}`}>
                                <span className={`font-bold text-sm ${ts.textSecondary}`}>الراتب الأساسي</span>
                                <div className="flex items-center gap-2">
                                    <span className={`font-mono font-black text-lg ${showSalary ? ts.accent : 'text-gray-400 blur-sm'}`}>
                                        {currentUser.salary.toLocaleString()} د.ج
                                    </span>
                                    <button onClick={() => setShowSalary(!showSalary)} className={`${ts.textSecondary} hover:opacity-100`}>
                                        {showSalary ? <EyeOff size={16}/> : <Eye size={16}/>}
                                    </button>
                                    {(currentUser.role === 'manager' || currentUser.role === 'admin') && (
                                        <button onClick={() => setIsEditSalaryModalOpen(true)} className={`${ts.textSecondary} hover:text-green-600 ml-2`}>
                                            <Edit3 size={16}/>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between items-center px-2">
                                <span className={`font-bold text-xs ${ts.textSecondary}`}>رصيد الإجازات</span>
                                <span className={`font-black ${ts.accent}`}>{currentUser.leaveBalance || 30} يوم</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => addNotification("سيتم تفعيل تغيير كلمة المرور قريباً", "info")} className={`p-4 rounded-2xl border shadow-sm font-bold text-xs flex flex-col items-center gap-2 transition ${ts.card} ${ts.textSecondary} hover:brightness-95`}>
                            <Key size={20}/> تغيير الرمز
                        </button>
                        <button onClick={() => setIsEditProfileModalOpen(true)} className={`p-4 rounded-2xl border shadow-sm font-bold text-xs flex flex-col items-center gap-2 transition ${ts.card} ${ts.textSecondary} hover:brightness-95`}>
                            <Edit3 size={20}/> تعديل البيانات
                        </button>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: HR DESK --- */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Navigation Tabs */}
                    <div className={`flex p-1.5 rounded-2xl shadow-sm border overflow-x-auto ${ts.card} ${ts.divider}`}>
                        {[
                            {id: 'profile', label: 'الطلبات الحالية', icon: MessageSquare},
                            {id: 'new_request', label: 'طلب جديد / طعن', icon: Send},
                            {id: 'requests', label: 'الأرشيف', icon: FileText},
                            {id: 'emergency', label: 'الطوارئ', icon: ShieldAlert, color: 'text-red-500'},
                        ].map(tab => (
                            <button 
                                key={tab.id} 
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition whitespace-nowrap ${activeTab === tab.id ? ts.tabActive : ts.tabInactive} ${tab.color || ''}`}
                            >
                                <tab.icon size={18}/> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className={`p-6 rounded-[2.5rem] min-h-[400px] ${ts.card}`}>
                        {(isZellige || isDark) && <div className={`absolute inset-0 pointer-events-none ${ts.pattern}`}></div>}
                        
                        {/* 1. CURRENT REQUESTS */}
                        {activeTab === 'profile' && (
                            <div className="space-y-4 relative z-10">
                                <h3 className={`font-black text-xl mb-6 ${ts.textPrimary}`}>متابعة الطلبات النشطة</h3>
                                {myRequests.filter(r => r.status !== 'resolved' && r.status !== 'rejected').length === 0 ? (
                                    <div className={`text-center py-10 opacity-50 ${ts.textSecondary}`}>
                                        <CheckCircle size={48} className="mx-auto mb-2"/>
                                        <p className="font-bold">لا توجد طلبات معلقة</p>
                                    </div>
                                ) : (
                                    myRequests.filter(r => r.status !== 'resolved' && r.status !== 'rejected').map(req => (
                                        <div key={req.id} className={`p-4 rounded-2xl border flex justify-between items-start ${ts.sectionBg} ${ts.divider}`}>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${req.priority === 'urgent' ? ts.errorBadge : ts.infoBadge}`}>
                                                        {req.priority === 'urgent' ? 'عاجل' : 'عادي'}
                                                    </span>
                                                    <span className={`text-xs font-bold ${ts.textSecondary}`}>{new Date(req.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <h4 className={`font-bold ${ts.textPrimary}`}>{req.subject}</h4>
                                                <p className={`text-xs mt-1 ${ts.textSecondary}`}>{getRequestTypeLabel(req.type)}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${ts.warningBadge}`}>
                                                {req.status === 'pending' ? 'قيد الانتظار' : 'تحت المراجعة'}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* 2. NEW REQUEST FORM */}
                        {activeTab === 'new_request' && (
                            <form onSubmit={handleSubmitRequest} className="space-y-6 relative z-10">
                                <div>
                                    <h3 className={`font-black text-xl mb-2 ${ts.textPrimary}`}>تقديم طلب أو اعتراض</h3>
                                    <p className={`text-sm ${ts.textSecondary}`}>استخدم هذا النموذج للتواصل الرسمي مع الإدارة. سيتم التعامل مع طلبك بسرية.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-xs font-bold mb-2 ${ts.textSecondary}`}>نوع الطلب</label>
                                        <select 
                                            className={`w-full p-4 rounded-2xl border-2 font-bold outline-none transition ${ts.input}`}
                                            value={requestForm.type}
                                            onChange={e => setRequestForm({...requestForm, type: e.target.value as any})}
                                        >
                                            <option value="admin_inquiry">استفسار إداري عام</option>
                                            <option value="financial_appeal">طعن مالي (راتب/خصم)</option>
                                            <option value="complaint">شكوى / تظلم</option>
                                            <option value="suggestion">اقتراح</option>
                                            <option value="resignation">استقالة</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-bold mb-2 ${ts.textSecondary}`}>الأولوية</label>
                                        <div className="flex gap-2">
                                            <button 
                                                type="button" 
                                                onClick={() => setRequestForm({...requestForm, priority: 'normal'})}
                                                className={`flex-1 p-3 rounded-xl font-bold text-xs border-2 transition ${requestForm.priority === 'normal' ? ts.infoBadge : `${ts.card} ${ts.textSecondary}`}`}
                                            >
                                                عادي
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => setRequestForm({...requestForm, priority: 'urgent'})}
                                                className={`flex-1 p-3 rounded-xl font-bold text-xs border-2 transition ${requestForm.priority === 'urgent' ? ts.errorBadge : `${ts.card} ${ts.textSecondary}`}`}
                                            >
                                                عاجل
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className={`block text-xs font-bold mb-2 ${ts.textSecondary}`}>الموضوع</label>
                                    <input 
                                        type="text" 
                                        required
                                        className={`w-full p-4 rounded-2xl border-2 font-bold outline-none transition ${ts.input}`}
                                        placeholder="عنوان مختصر للطلب..."
                                        value={requestForm.subject}
                                        onChange={e => setRequestForm({...requestForm, subject: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className={`block text-xs font-bold mb-2 ${ts.textSecondary}`}>التفاصيل</label>
                                    <textarea 
                                        required
                                        className={`w-full p-4 rounded-2xl border-2 font-bold outline-none transition h-32 resize-none ${ts.input}`}
                                        placeholder="اشرح طلبك أو مشكلتك بالتفصيل..."
                                        value={requestForm.description}
                                        onChange={e => setRequestForm({...requestForm, description: e.target.value})}
                                    />
                                </div>

                                <button type="submit" className={`w-full py-4 rounded-2xl font-black text-lg shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center gap-2 ${ts.button}`}>
                                    <Send size={20}/> إرسال الطلب
                                </button>
                            </form>
                        )}

                        {/* 3. ARCHIVE */}
                        {activeTab === 'requests' && (
                            <div className="space-y-4 relative z-10">
                                <h3 className={`font-black text-xl mb-6 ${ts.textPrimary}`}>سجل الطلبات السابقة</h3>
                                {myRequests.length === 0 ? (
                                    <p className={`text-center font-bold py-10 ${ts.textSecondary}`}>السجل فارغ</p>
                                ) : (
                                    myRequests.map(req => (
                                        <div key={req.id} className={`p-5 rounded-2xl border transition group ${ts.sectionBg} ${ts.divider}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className={`font-bold ${ts.textPrimary}`}>{req.subject}</h4>
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                                    req.status === 'resolved' ? ts.successBadge : 
                                                    req.status === 'rejected' ? ts.errorBadge : ts.warningBadge
                                                }`}>
                                                    {req.status === 'resolved' ? 'تم الحل' : req.status === 'rejected' ? 'مرفوض' : 'قيد المعالجة'}
                                                </span>
                                            </div>
                                            <p className={`text-xs mb-3 line-clamp-2 ${ts.textSecondary}`}>{req.description}</p>
                                            
                                            {req.adminResponse && (
                                                <div className={`p-3 rounded-xl text-xs font-medium mt-2 flex items-start gap-2 ${ts.infoBadge}`}>
                                                    <MessageSquare size={14} className="mt-0.5 shrink-0"/>
                                                    <div>
                                                        <span className="block font-bold mb-1">رد الإدارة:</span>
                                                        {req.adminResponse}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className={`mt-3 pt-3 border-t flex justify-between items-center text-[10px] ${ts.textSecondary} ${ts.divider}`}>
                                                <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                                                <span>{getRequestTypeLabel(req.type)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* 4. EMERGENCY */}
                        {activeTab === 'emergency' && (
                            <div className="flex flex-col items-center justify-center text-center py-10">
                                <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                    <ShieldAlert size={48}/>
                                </div>
                                <h3 className="text-3xl font-black text-red-600 mb-2">اتصال الطوارئ</h3>
                                <p className={`max-w-md mb-8 font-bold ${ts.textSecondary}`}>
                                    استخدم هذا الزر فقط في الحالات الطارئة جداً (خطر أمني، حادث خطير، مشكلة تستدعي تدخل المدير العام فوراً).
                                </p>
                                <button 
                                    onClick={() => setShowEmergencyConfirm(true)}
                                    className="px-10 py-5 bg-red-600 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-red-500/30 hover:bg-red-700 transition transform hover:scale-105 active:scale-95 flex items-center gap-3"
                                >
                                    <Phone size={24}/> نداء استغاثة فوري
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Emergency Confirmation Modal */}
            {showEmergencyConfirm && (
                <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] p-8 text-center shadow-2xl border-4 border-red-500 relative overflow-hidden">
                        <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none"></div>
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                            <ShieldAlert size={40}/>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 relative z-10">تأكيد نداء الطوارئ</h3>
                        <p className="text-gray-500 font-bold mb-8 relative z-10">سيتم إرسال تنبيه عاجل لجميع المدراء ومسؤولي الأمن. هل أنت متأكد؟</p>
                        
                        <div className="flex gap-4 relative z-10">
                            <button onClick={() => setShowEmergencyConfirm(false)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-bold text-lg">إلغاء</button>
                            <button onClick={handleEmergencyCall} className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black text-lg shadow-lg hover:bg-red-700 animate-pulse">تأكيد الإرسال</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Profile Modal */}
            {isEditProfileModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in">
                    <div className={`w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden ${ts.card}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className={`text-2xl font-black ${ts.textPrimary}`}>تعديل الملف الشخصي</h3>
                            <button onClick={() => setIsEditProfileModalOpen(false)} className={`p-2 rounded-full hover:bg-black/5 ${ts.textSecondary}`}>
                                <X size={24}/>
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className={`block text-xs font-bold mb-2 ${ts.textSecondary}`}>الاسم الكامل</label>
                                <input 
                                    type="text" 
                                    value={editForm.name}
                                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                                    className={`w-full p-4 rounded-2xl border-2 font-bold outline-none transition ${ts.input}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-xs font-bold mb-2 ${ts.textSecondary}`}>رقم الهاتف</label>
                                <input 
                                    type="tel" 
                                    value={editForm.phone}
                                    onChange={e => setEditForm({...editForm, phone: e.target.value})}
                                    className={`w-full p-4 rounded-2xl border-2 font-bold outline-none transition ${ts.input}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-xs font-bold mb-2 ${ts.textSecondary}`}>البريد الإلكتروني</label>
                                <input 
                                    type="email" 
                                    value={editForm.email}
                                    onChange={e => setEditForm({...editForm, email: e.target.value})}
                                    className={`w-full p-4 rounded-2xl border-2 font-bold outline-none transition ${ts.input}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-xs font-bold mb-2 ${ts.textSecondary}`}>كلمة المرور الجديدة (اختياري)</label>
                                <input 
                                    type="password" 
                                    value={editForm.password}
                                    onChange={e => setEditForm({...editForm, password: e.target.value})}
                                    placeholder="اتركه فارغاً للاحتفاظ بالحالية"
                                    className={`w-full p-4 rounded-2xl border-2 font-bold outline-none transition ${ts.input}`}
                                />
                            </div>
                            
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsEditProfileModalOpen(false)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-bold text-lg">إلغاء</button>
                                <button type="submit" className={`flex-[2] py-4 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2 ${ts.button}`}>
                                    <Save size={20}/> حفظ التغييرات
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Salary Modal */}
            {isEditSalaryModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in">
                    <div className={`w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden ${ts.card}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className={`text-2xl font-black ${ts.textPrimary}`}>تعديل الراتب</h3>
                            <button onClick={() => setIsEditSalaryModalOpen(false)} className={`p-2 rounded-full hover:bg-black/5 ${ts.textSecondary}`}>
                                <X size={24}/>
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpdateSalary} className="space-y-6">
                            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-xl border border-yellow-200 dark:border-yellow-700">
                                <p className="text-yellow-800 dark:text-yellow-200 text-xs font-bold flex items-center gap-2">
                                    <AlertCircle size={16}/>
                                    تنبيه: تعديل الراتب سيؤثر على جميع الحسابات المالية والتقارير القادمة.
                                </p>
                            </div>

                            <div>
                                <label className={`block text-xs font-bold mb-2 ${ts.textSecondary}`}>الراتب الأساسي (د.ج)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={salaryForm.amount}
                                        onChange={e => setSalaryForm({...salaryForm, amount: Number(e.target.value)})}
                                        className={`w-full p-4 pl-12 rounded-2xl border-2 font-bold outline-none transition text-2xl font-mono ${ts.input}`}
                                    />
                                    <DollarSign className={`absolute left-4 top-1/2 -translate-y-1/2 ${ts.textSecondary}`} size={24}/>
                                </div>
                            </div>
                            
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsEditSalaryModalOpen(false)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-bold text-lg">إلغاء</button>
                                <button type="submit" className={`flex-[2] py-4 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2 ${ts.button}`}>
                                    <Save size={20}/> حفظ الراتب
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
