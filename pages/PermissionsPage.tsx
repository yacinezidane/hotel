import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { Shield, Check, Save, Users, Eye, Play, XCircle } from 'lucide-react';
import { Role, UserPermissions } from '../types';
import { DEFAULT_ROLE_PERMISSIONS } from '../constants';

const PERMISSIONS_LIST = [
    { key: 'canManageRooms', label: 'إدارة الغرف' },
    { key: 'canManageBookings', label: 'إدارة الحجوزات' },
    { key: 'canViewSecurityLink', label: 'الرابط الأمني' },
    { key: 'canManageInvoices', label: 'إدارة الفواتير' },
    { key: 'canViewAccounting', label: 'عرض المحاسبة' },
    { key: 'canManageFinance', label: 'إدارة المالية' },
    { key: 'canManageStaff', label: 'إدارة الموظفين' },
    { key: 'canManageSettings', label: 'إعدادات النظام' },
    { key: 'canManageMenu', label: 'إدارة القائمة' },
    { key: 'canManageServices', label: 'إدارة الخدمات' },
    { key: 'canUseChat', label: 'استخدام المحادثة' },
    { key: 'canBroadcast', label: 'إرسال تعاميم' },
    { key: 'canCustomizeTitles', label: 'تخصيص العناوين' },
    { key: 'canClearSettlements', label: 'تصفية الحسابات' },
    { key: 'canPrintGuestForms', label: 'طباعة نماذج النزلاء' },
];

const PAGES_LIST = [
    { key: 'dashboard', label: 'لوحة التحكم' },
    { key: 'rooms', label: 'الغرف' },
    { key: 'bookings', label: 'الحجوزات' },
    { key: 'invoices', label: 'الفواتير' },
    { key: 'accounting', label: 'المحاسبة' },
    { key: 'staff', label: 'الموظفين' },
    { key: 'settings', label: 'الإعدادات' },
    { key: 'messages', label: 'الرسائل' },
    { key: 'guest_services', label: 'خدمات النزلاء' },
    { key: 'restaurant', label: 'المطعم' },
    { key: 'cafe', label: 'المقهى' },
    { key: 'pool', label: 'المسبح' },
    { key: 'maintenance', label: 'الصيانة' },
    { key: 'security', label: 'الأمن' },
    { key: 'permissions', label: 'الصلاحيات' },
];

const ACTIONS_LIST = [
    { key: 'edit_booking', label: 'تعديل حجز' },
    { key: 'delete_booking', label: 'حذف حجز' },
    { key: 'check_in', label: 'تسجيل دخول' },
    { key: 'check_out', label: 'تسجيل خروج' },
    { key: 'add_invoice', label: 'إضافة فاتورة' },
    { key: 'delete_invoice', label: 'حذف فاتورة' },
    { key: 'manage_staff', label: 'إدارة الموظفين' },
    { key: 'view_reports', label: 'عرض التقارير' },
];

const ROLES: { id: Role; label: string; level: number }[] = [
    { id: 'manager', label: 'المدير العام', level: 1 },
    { id: 'assistant_manager', label: 'مساعد المدير', level: 2 },
    { id: 'operations_manager', label: 'مدير العمليات', level: 2 },
    { id: 'reception_manager', label: 'مدير الاستقبال', level: 3 },
    { id: 'restaurant_manager', label: 'مدير المطعم', level: 3 },
    { id: 'cafe_manager', label: 'مدير المقهى', level: 3 },
    { id: 'housekeeping_manager', label: 'مدير التدبير المنزلي', level: 3 },
    { id: 'maintenance_manager', label: 'مدير الصيانة', level: 3 },
    { id: 'security_manager', label: 'مدير الأمن', level: 3 },
    { id: 'hr_manager', label: 'مدير الموارد البشرية', level: 3 },
    { id: 'accountant', label: 'المحاسب', level: 3 },
    { id: 'marketing_specialist', label: 'مسؤول التسويق', level: 3 },
    { id: 'it_specialist', label: 'مسؤول IT', level: 3 },
    { id: 'head_chef', label: 'كبير الطهاة', level: 3 },
    { id: 'receptionist', label: 'موظف استقبال', level: 4 },
    { id: 'concierge', label: 'كونسيرج', level: 4 },
    { id: 'chef', label: 'طاهي', level: 4 },
    { id: 'waiter', label: 'نادل', level: 4 },
    { id: 'barista', label: 'باريستا', level: 4 },
    { id: 'housekeeping_staff', label: 'عامل نظافة', level: 4 },
    { id: 'maintenance_staff', label: 'فني صيانة', level: 4 },
    { id: 'security_guard', label: 'حارس أمن', level: 4 },
    { id: 'bellboy', label: 'حامل الحقائب', level: 4 },
    { id: 'driver', label: 'سائق', level: 4 },
    { id: 'staff', label: 'موظف عام', level: 4 },
    { id: 'guest', label: 'نزيل', level: 5 },
    { id: 'visitor', label: 'زائر', level: 5 },
];

export const PermissionsPage: React.FC = () => {
    const { currentUser, addNotification, settings, rolePermissions: savedRolePermissions, updateRolePermissions } = useHotel();
    const [activeTab, setActiveTab] = useState<'functional' | 'pages' | 'actions' | 'staff'>('functional');
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    
    // Local state for editing permissions
    const [localPermissions, setLocalPermissions] = useState<Record<Role, UserPermissions>>(() => {
        const initial: any = {};
        ROLES.forEach(role => {
            initial[role.id] = DEFAULT_ROLE_PERMISSIONS[role.id] || DEFAULT_ROLE_PERMISSIONS['staff'];
        });
        return initial;
    });

    const { users, updateUser } = useHotel();
    const selectedUser = users.find(u => u.id === selectedUserId);
    const [userPermissionsLocal, setUserPermissionsLocal] = useState<UserPermissions | null>(null);

    useEffect(() => {
        if (selectedUser) {
            setUserPermissionsLocal(selectedUser.permissions);
        }
    }, [selectedUserId, users]);

    // Sync local state with saved permissions from context
    useEffect(() => {
        if (savedRolePermissions && savedRolePermissions.length > 0) {
            const updated: any = { ...localPermissions };
            savedRolePermissions.forEach(rp => {
                updated[rp.role] = rp.permissions;
            });
            setLocalPermissions(updated);
        }
    }, [savedRolePermissions]);

    const getThemeStyles = () => {
        switch (settings.theme) {
            case 'zellige': return {
                card: 'bg-[#FDFBF7] border-[#cca43b]',
                headerText: 'text-[#006269]',
                button: 'bg-[#006269] text-[#cca43b] hover:bg-[#004d53]',
                tableHeader: 'bg-[#FDFBF7] text-[#006269] border-[#cca43b]/20',
                tableRowEven: 'bg-[#FDFBF7]',
                tableRowOdd: 'bg-[#fbf8f1]',
                checkboxActive: 'bg-[#006269] border-[#006269]',
                checkboxInactive: 'border-[#cca43b]/40',
                level1: 'bg-[#006269] text-[#cca43b] border-[#cca43b]',
                level2: 'bg-[#004d53] text-[#cca43b]',
                level3: 'bg-[#cca43b] text-[#006269]',
                level4: 'bg-[#fbf8f1] text-[#006269] border-[#cca43b]/20',
            };
            default: return {
                card: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
                headerText: 'text-blue-600',
                button: 'bg-blue-600 text-white hover:bg-blue-700',
                tableHeader: 'bg-gray-50 dark:bg-gray-800 text-gray-500',
                tableRowEven: 'bg-white dark:bg-gray-800',
                tableRowOdd: 'bg-gray-50/30 dark:bg-gray-800/30',
                checkboxActive: 'bg-blue-600 border-blue-600',
                checkboxInactive: 'border-gray-300 dark:border-gray-500',
                level1: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-white dark:border-gray-700',
                level2: 'bg-blue-600 text-white',
                level3: 'bg-teal-500 text-white',
                level4: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600',
            };
        }
    };
    const ts = getThemeStyles();

    const togglePermission = (role: Role, permKey: keyof UserPermissions) => {
        setLocalPermissions(prev => ({
            ...prev,
            [role]: {
                ...prev[role],
                [permKey]: !prev[role][permKey]
            }
        }));
    };

    const toggleArrayPermission = (role: Role, field: 'visiblePages' | 'allowedActions' | 'hiddenButtons', value: string) => {
        setLocalPermissions(prev => {
            const current = (prev[role][field] as string[]) || [];
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            
            return {
                ...prev,
                [role]: {
                    ...prev[role],
                    [field]: updated
                }
            };
        });
    };

    const handleSave = () => {
        Object.entries(localPermissions).forEach(([role, perms]) => {
            updateRolePermissions(role as Role, perms);
        });
        addNotification('تم تحديث صلاحيات الأدوار بنجاح', 'success');
    };

    if (currentUser?.role !== 'manager') {
        return <div className="p-10 text-center font-bold text-red-500">عذراً، هذه الصفحة مخصصة للمدير العام فقط.</div>;
    }

    return (
        <div className="space-y-6 pb-20 animate-fade-in">
            <PageHeader pageKey="permissions" defaultTitle="إدارة الصلاحيات والأدوار" icon={Shield} />

            <div className={`rounded-[2.5rem] p-6 shadow-sm border overflow-hidden mb-8 ${ts.card}`}>
                <h3 className={`font-black text-xl flex items-center gap-2 mb-6 ${ts.headerText}`}>
                    <Users size={24}/> الهرم الوظيفي (Organizational Chart)
                </h3>
                <div className="flex flex-col items-center gap-8 py-8 overflow-x-auto">
                    {/* Level 1 */}
                    <div className="flex justify-center w-full">
                        {ROLES.filter(r => r.level === 1).map(role => (
                            <div key={role.id} className={`px-8 py-4 rounded-2xl text-center shadow-lg font-black text-lg transform hover:scale-105 transition cursor-pointer border-4 ${ts.level1}`}>
                                {role.label}
                            </div>
                        ))}
                    </div>
                    
                    <div className="h-8 w-0.5 bg-gray-300"></div>
                    
                    {/* Level 2 */}
                    <div className="flex gap-6 justify-center w-full flex-wrap">
                        {ROLES.filter(r => r.level === 2).map(role => (
                            <div key={role.id} className={`px-6 py-3 rounded-xl text-center shadow-md font-bold transform hover:scale-105 transition cursor-pointer min-w-[140px] ${ts.level2}`}>
                                {role.label}
                            </div>
                        ))}
                    </div>

                    <div className="h-8 w-0.5 bg-gray-300"></div>

                    {/* Level 3 */}
                    <div className="flex gap-4 justify-center w-full flex-wrap max-w-5xl">
                        {ROLES.filter(r => r.level === 3).map(role => (
                            <div key={role.id} className={`px-4 py-2 rounded-lg text-center shadow-sm font-bold text-sm transform hover:scale-105 transition cursor-pointer min-w-[120px] ${ts.level3}`}>
                                {role.label}
                            </div>
                        ))}
                    </div>

                    <div className="h-8 w-0.5 bg-gray-300"></div>

                    {/* Level 4 */}
                    <div className="flex gap-3 justify-center w-full flex-wrap max-w-6xl">
                        {ROLES.filter(r => r.level === 4).map(role => (
                            <div key={role.id} className={`px-3 py-1.5 rounded-lg text-center border font-bold text-xs hover:opacity-80 transition cursor-pointer ${ts.level4}`}>
                                {role.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={`rounded-[2.5rem] p-6 shadow-sm border overflow-hidden ${ts.card}`}>
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-4">
                        <h3 className={`font-black text-xl flex items-center gap-2 ${ts.headerText}`}>
                            <Users size={24}/> جدول الصلاحيات
                        </h3>
                        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                            <button 
                                onClick={() => setActiveTab('functional')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'functional' ? ts.button : 'text-gray-500'}`}
                            >
                                <Shield size={16} className="inline ml-1"/> الوظيفية
                            </button>
                            <button 
                                onClick={() => setActiveTab('pages')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'pages' ? ts.button : 'text-gray-500'}`}
                            >
                                <Eye size={16} className="inline ml-1"/> الصفحات
                            </button>
                            <button 
                                onClick={() => setActiveTab('actions')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'actions' ? ts.button : 'text-gray-500'}`}
                            >
                                <Play size={16} className="inline ml-1"/> العمليات
                            </button>
                            <button 
                                onClick={() => setActiveTab('staff')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'staff' ? ts.button : 'text-gray-500'}`}
                            >
                                <Users size={16} className="inline ml-1"/> الموظفين
                            </button>
                        </div>
                    </div>
                    {activeTab !== 'staff' && (
                        <button onClick={handleSave} className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition w-full md:w-auto justify-center ${ts.button}`}>
                            <Save size={18}/> حفظ التغييرات
                        </button>
                    )}
                </div>

                {activeTab === 'staff' ? (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1 space-y-4">
                                <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-2">اختر الموظف:</h4>
                                <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {users.filter(u => u.role !== 'manager').map(user => (
                                        <button
                                            key={user.id}
                                            onClick={() => setSelectedUserId(user.id)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition border-2 ${selectedUserId === user.id ? 'border-[#006269] bg-[#006269]/5' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                        >
                                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-gray-200" />
                                            <div className="text-right">
                                                <div className="font-bold text-sm">{user.name}</div>
                                                <div className="text-xs text-gray-500">{ROLES.find(r => r.id === user.role)?.label || user.role}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                {selectedUser && userPermissionsLocal ? (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white dark:bg-gray-600 rounded-lg shadow-sm">
                                                    <Shield size={20} className="text-[#006269]" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black">صلاحيات: {selectedUser.name}</h4>
                                                    <p className="text-xs text-gray-500">تعديل الصلاحيات الفردية لهذا الموظف بعينه</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    updateUser(selectedUser.id, { permissions: userPermissionsLocal });
                                                    addNotification(`تم تحديث صلاحيات ${selectedUser.name} بنجاح`, 'success');
                                                }}
                                                className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition ${ts.button}`}
                                            >
                                                <Save size={18}/> حفظ صلاحيات الموظف
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Functional Permissions */}
                                            <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 shadow-sm">
                                                <h5 className="font-bold mb-4 text-[#006269] flex items-center gap-2">
                                                    <Shield size={16}/> الصلاحيات الوظيفية
                                                </h5>
                                                <div className="space-y-3">
                                                    {PERMISSIONS_LIST.map(perm => (
                                                        <label key={perm.key} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition">
                                                            <span className="text-sm font-medium">{perm.label}</span>
                                                            <input 
                                                                type="checkbox"
                                                                className="w-5 h-5 rounded border-gray-300 text-[#006269] focus:ring-[#006269]"
                                                                checked={!!(userPermissionsLocal as any)[perm.key]}
                                                                onChange={() => {
                                                                    setUserPermissionsLocal(prev => prev ? ({
                                                                        ...prev,
                                                                        [perm.key]: !(prev as any)[perm.key]
                                                                    }) : null);
                                                                }}
                                                            />
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Page Access */}
                                            <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 shadow-sm">
                                                <h5 className="font-bold mb-4 text-[#006269] flex items-center gap-2">
                                                    <Eye size={16}/> الوصول للصفحات
                                                </h5>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {PAGES_LIST.map(page => (
                                                        <label key={page.key} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition">
                                                            <input 
                                                                type="checkbox"
                                                                className="w-4 h-4 rounded border-gray-300 text-[#006269] focus:ring-[#006269]"
                                                                checked={(userPermissionsLocal.visiblePages || []).includes(page.key) || (userPermissionsLocal.visiblePages || []).includes('all')}
                                                                onChange={() => {
                                                                    const current = userPermissionsLocal.visiblePages || [];
                                                                    const updated = current.includes(page.key)
                                                                        ? current.filter(p => p !== page.key)
                                                                        : [...current, page.key];
                                                                    setUserPermissionsLocal({ ...userPermissionsLocal, visiblePages: updated });
                                                                }}
                                                            />
                                                            <span className="text-xs font-medium">{page.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Action Permissions */}
                                            <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 shadow-sm md:col-span-2">
                                                <h5 className="font-bold mb-4 text-[#006269] flex items-center gap-2">
                                                    <Play size={16}/> العمليات المسموحة
                                                </h5>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                    {ACTIONS_LIST.map(action => (
                                                        <label key={action.key} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition">
                                                            <input 
                                                                type="checkbox"
                                                                className="w-4 h-4 rounded border-gray-300 text-[#006269] focus:ring-[#006269]"
                                                                checked={(userPermissionsLocal.allowedActions || []).includes(action.key) || (userPermissionsLocal.allowedActions || []).includes('all')}
                                                                onChange={() => {
                                                                    const current = userPermissionsLocal.allowedActions || [];
                                                                    const updated = current.includes(action.key)
                                                                        ? current.filter(a => a !== action.key)
                                                                        : [...current, action.key];
                                                                    setUserPermissionsLocal({ ...userPermissionsLocal, allowedActions: updated });
                                                                }}
                                                            />
                                                            <span className="text-xs font-medium">{action.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 p-10 border-2 border-dashed border-gray-200 rounded-[2.5rem]">
                                        <Users size={48} className="mb-4 opacity-20" />
                                        <p className="font-bold">يرجى اختيار موظف من القائمة لعرض وتعديل صلاحياته الفردية</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar pb-4">
                    <table className="w-full min-w-[1200px]">
                        <thead>
                            <tr className={`border-b ${ts.tableHeader}`}>
                                <th className={`p-4 text-right font-black text-sm sticky right-0 z-10 min-w-[200px] ${ts.tableHeader}`}>
                                    {activeTab === 'functional' ? 'الصلاحية الوظيفية' : activeTab === 'pages' ? 'الصفحة' : 'العملية'}
                                </th>
                                {ROLES.map(role => (
                                    <th key={role.id} className="p-4 text-center font-bold text-xs whitespace-nowrap min-w-[100px] vertical-text">
                                        <div className="writing-mode-vertical transform rotate-180 h-32 flex items-center justify-center w-full">
                                            {role.label}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(activeTab === 'functional' ? PERMISSIONS_LIST : activeTab === 'pages' ? PAGES_LIST : ACTIONS_LIST).map((item, idx) => (
                                <tr key={item.key} className={`border-b hover:opacity-90 transition ${idx % 2 === 0 ? ts.tableRowEven : ts.tableRowOdd}`}>
                                    <td className={`p-4 font-bold text-sm sticky right-0 z-10 border-l ${idx % 2 === 0 ? ts.tableRowEven : ts.tableRowOdd}`}>
                                        {item.label}
                                    </td>
                                    {ROLES.map(role => {
                                        let isChecked = false;
                                        if (activeTab === 'functional') {
                                            isChecked = !!localPermissions[role.id][item.key as keyof UserPermissions];
                                        } else if (activeTab === 'pages') {
                                            isChecked = (localPermissions[role.id].visiblePages || []).includes(item.key) || (localPermissions[role.id].visiblePages || []).includes('all');
                                        } else {
                                            isChecked = (localPermissions[role.id].allowedActions || []).includes(item.key) || (localPermissions[role.id].allowedActions || []).includes('all');
                                        }

                                        return (
                                            <td key={role.id} className="p-2 text-center">
                                                <label className="inline-flex items-center justify-center cursor-pointer p-1 rounded-lg hover:bg-black/5 transition">
                                                    <input 
                                                        type="checkbox" 
                                                        className="hidden" 
                                                        checked={isChecked} 
                                                        onChange={() => {
                                                            if (activeTab === 'functional') togglePermission(role.id, item.key as keyof UserPermissions);
                                                            else if (activeTab === 'pages') toggleArrayPermission(role.id, 'visiblePages', item.key);
                                                            else toggleArrayPermission(role.id, 'allowedActions', item.key);
                                                        }}
                                                    />
                                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${isChecked ? `${ts.checkboxActive} text-white` : `${ts.checkboxInactive} text-transparent`}`}>
                                                        <Check size={12} strokeWidth={4} />
                                                    </div>
                                                </label>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </div>
);
};
