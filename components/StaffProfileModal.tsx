
import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { 
    X, User, Briefcase, Crown, Copy, ScanBarcode, Unlock, Lock, Trash2, Edit, Check, FileText,
    Mail, Phone, Save, Camera, IdCard, BadgeCheck, Shield, Share2, CheckCircle
} from 'lucide-react';
import { User as UserType, Department, Role } from '../types';
import { QRCodeSVG } from 'qrcode.react';

export const StaffProfileModal: React.FC = () => {
    // Balance/Debt (Manager/Audit Only)
    const { activeProfile, setActiveProfile, settings, currentUser, updateUser, removeStaff, clearUserBalance, transactions, generateSystemQR } = useHotel();
    const [viewMode, setViewMode] = useState<'profile' | 'qr' | 'edit'>('profile');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    // Salary Edit State (Manager Only)
    const [isEditingSalary, setIsEditingSalary] = useState(false);
    const [tempSalary, setTempSalary] = useState('');
    const [salaryNote, setSalaryNote] = useState('');

    // Promotion State
    const [isPromoting, setIsPromoting] = useState(false);
    const [newRole, setNewRole] = useState<Role>('staff');
    const [newDept, setNewDept] = useState<Department>('reception');

    // Personal Edit State (Self)
    const [editForm, setEditForm] = useState({
        name: '',
        phone: '',
        email: ''
    });

    const isSelf = activeProfile && currentUser?.id === activeProfile.id;
    const isManager = currentUser?.role === 'manager';
    const canEditStaff = currentUser?.permissions.allowedActions?.includes('edit_staff') || isManager;
    const canDeleteStaff = currentUser?.permissions.allowedActions?.includes('delete_staff') || isManager;
    const canClearBalance = currentUser?.permissions.allowedActions?.includes('clear_balance') || isManager;

    const userBalance = activeProfile ? transactions
        .filter(t => t.targetUserId === activeProfile.id)
        .reduce((acc, t) => acc + (t.type === 'settlement' ? t.amount : -t.amount), 0) : 0;

    // Reset internal state when profile changes
    React.useEffect(() => {
        if (activeProfile) {
            setViewMode('profile');
            setIsEditingSalary(false);
            setTempSalary(activeProfile.salary.toString());
            setSalaryNote('');
            setEditForm({
                name: activeProfile.name,
                phone: activeProfile.phone || '',
                email: activeProfile.email || ''
            });
            setNewRole(activeProfile.role);
            setNewDept(activeProfile.department);
            setIsPromoting(false);
        }
    }, [activeProfile]);

    const handlePromotion = () => {
        if (activeProfile) {
            updateUser(activeProfile.id, { role: newRole, department: newDept }, `تمت الترقية/النقل إلى ${newRole} في قسم ${newDept}`);
            setIsPromoting(false);
        }
    };

    const handleSaveSalary = () => {
        if (tempSalary && activeProfile) {
            updateUser(activeProfile.id, { salary: Number(tempSalary) }, salaryNote);
            setIsEditingSalary(false);
            setSalaryNote('');
        }
    };

    const handleSaveProfile = () => {
        if (activeProfile) {
            updateUser(activeProfile.id, {
                name: editForm.name,
                phone: editForm.phone,
                email: editForm.email
            }, 'تحديث البيانات الشخصية');
            setViewMode('profile');
        }
    };

    // --- Departments Config ---
    const departments = React.useMemo(() => {
        if (!activeProfile) return [];
        return [
            { id: 'administration', label: 'الإدارة العليا', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
            { id: 'reception', label: 'الاستقبال', icon: User, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
            // Fallback
            { id: activeProfile.department, label: activeProfile.department.replace('_', ' ').toUpperCase(), icon: User, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' }
        ] as { id: Department; label: string; icon: any; color: string; bg: string; border: string }[];
    }, [activeProfile]);

    const getDeptInfo = (deptId: Department) => {
        return departments.find(d => d.id === deptId) || { label: deptId, icon: User, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' };
    };

    // --- Theme Logic ---
    const getThemeStyles = () => {
        if (settings.darkMode) {
            switch(settings.theme) {
                case 'zellige': return {
                    modalBg: 'bg-[#002a2d]',
                    badgePattern: 'bg-zellige-pattern',
                    modalHeader: 'bg-[#001e21] text-[#cca43b] border-b-8 border-[#cca43b]', 
                    sectionCard: 'bg-[#001e21] border-[#cca43b]/30 shadow-sm',
                    button: 'bg-[#cca43b] text-[#002a2d] hover:bg-[#b08d30]',
                    modalInput: 'border-[#cca43b]/40 focus:border-[#cca43b] bg-[#001e21] text-[#cca43b]'
                };
                case 'zellige-v2': return {
                    modalBg: 'bg-[#012a20]',
                    badgePattern: 'bg-zellige-v2-pattern',
                    modalHeader: 'bg-[#024d38] text-white border-b-8 border-[#c6e3d8]',
                    sectionCard: 'bg-[#003d2e] border-[#c6e3d8]/30 shadow-sm',
                    button: 'bg-[#024d38] text-white hover:bg-[#013b2b]',
                    modalInput: 'border-[#c6e3d8] focus:border-[#024d38] bg-[#003d2e] text-[#c6e3d8]'
                };
                case 'lihab-al-oud': return {
                    modalBg: 'bg-[#1a0f0f]',
                    badgePattern: 'bg-zellige-pattern',
                    modalHeader: 'bg-[#2a1f1f] text-[#e6c288] border-b-8 border-[#8b5a2b]',
                    sectionCard: 'bg-[#2a1f1f] border-[#8b5a2b]/30 shadow-sm',
                    button: 'bg-[#8b5a2b] text-[#1a0f0f] hover:bg-[#6b4226]',
                    modalInput: 'border-[#8b5a2b]/40 focus:border-[#8b5a2b] bg-[#2a1f1f] text-[#e6c288]'
                };
                case 'ceramic-talavera': return {
                    modalBg: 'bg-[#1e3a8a]',
                    badgePattern: 'bg-zellige-pattern',
                    modalHeader: 'bg-[#0f172a] text-[#f59e0b] border-b-8 border-[#f59e0b]',
                    sectionCard: 'bg-[#0f172a] border-[#f59e0b]/30 shadow-sm',
                    button: 'bg-[#f59e0b] text-[#1e3a8a] hover:bg-[#d97706]',
                    modalInput: 'border-[#f59e0b]/40 focus:border-[#f59e0b] bg-[#0f172a] text-[#f59e0b]'
                };
                case 'ceramic-majolica': return {
                    modalBg: 'bg-[#15803d]',
                    badgePattern: 'bg-zellige-pattern',
                    modalHeader: 'bg-[#052e16] text-[#facc15] border-b-8 border-[#facc15]',
                    sectionCard: 'bg-[#052e16] border-[#facc15]/30 shadow-sm',
                    button: 'bg-[#facc15] text-[#15803d] hover:bg-[#ca8a04]',
                    modalInput: 'border-[#facc15]/40 focus:border-[#facc15] bg-[#052e16] text-[#facc15]'
                };
                case 'ceramic-delft': return {
                    modalBg: 'bg-[#0c4a6e]',
                    badgePattern: 'bg-zellige-pattern',
                    modalHeader: 'bg-[#082f49] text-[#bae6fd] border-b-8 border-[#bae6fd]',
                    sectionCard: 'bg-[#082f49] border-[#bae6fd]/30 shadow-sm',
                    button: 'bg-[#bae6fd] text-[#0c4a6e] hover:bg-[#7dd3fc]',
                    modalInput: 'border-[#bae6fd]/40 focus:border-[#bae6fd] bg-[#082f49] text-[#bae6fd]'
                };
                case 'ceramic-iznik': return {
                    modalBg: 'bg-[#7f1d1d]',
                    badgePattern: 'bg-zellige-pattern',
                    modalHeader: 'bg-[#450a0a] text-[#0ea5e9] border-b-8 border-[#0ea5e9]',
                    sectionCard: 'bg-[#450a0a] border-[#0ea5e9]/30 shadow-sm',
                    button: 'bg-[#0ea5e9] text-[#7f1d1d] hover:bg-[#0284c7]',
                    modalInput: 'border-[#0ea5e9]/40 focus:border-[#0ea5e9] bg-[#450a0a] text-[#0ea5e9]'
                };
                default: return {
                    modalBg: 'bg-gray-900',
                    badgePattern: 'bg-gray-800/50',
                    modalHeader: 'bg-gray-800 text-white border-b border-gray-700',
                    sectionCard: 'bg-gray-800 border-gray-700 shadow-sm',
                    button: 'bg-blue-600 text-white hover:bg-blue-700',
                    modalInput: 'border-gray-600 focus:border-blue-500 bg-gray-800 text-white'
                };
            }
        }

        switch(settings.theme) {
            case 'zellige': return {
                modalBg: 'bg-[#fdfbf7]',
                badgePattern: 'bg-zellige-pattern',
                modalHeader: 'bg-[#006269] text-[#cca43b] border-b-8 border-[#cca43b]', 
                sectionCard: 'bg-white border-[#cca43b]/30 shadow-sm',
                button: 'bg-[#006269] text-[#cca43b] hover:bg-[#004d53]',
                modalInput: 'border-[#cca43b]/40 focus:border-[#006269] bg-[#fbf8f1] text-[#006269]'
            };
            case 'zellige-v2': return {
                modalBg: 'bg-[#f5fcf9]',
                badgePattern: 'bg-zellige-v2-pattern',
                modalHeader: 'bg-[#024d38] text-white border-b-8 border-[#c6e3d8]',
                sectionCard: 'bg-white border-[#c6e3d8]/50 shadow-sm',
                button: 'bg-[#024d38] text-white hover:bg-[#013b2b]',
                modalInput: 'border-[#c6e3d8] focus:border-[#024d38] bg-[#f5fcf9] text-[#024d38]'
            };
            case 'lihab-al-oud': return {
                modalBg: 'bg-[#f5e6d3]',
                badgePattern: 'bg-zellige-pattern',
                modalHeader: 'bg-[#5c3a1b] text-[#e6c288] border-b-8 border-[#8b5a2b]',
                sectionCard: 'bg-white border-[#8b5a2b]/30 shadow-sm',
                button: 'bg-[#5c3a1b] text-[#e6c288] hover:bg-[#3e2712]',
                modalInput: 'border-[#8b5a2b]/40 focus:border-[#5c3a1b] bg-[#fff8f0] text-[#5c3a1b]'
            };
            case 'ceramic-talavera': return {
                modalBg: 'bg-[#fffbeb]',
                badgePattern: 'bg-zellige-pattern',
                modalHeader: 'bg-[#1e3a8a] text-[#f59e0b] border-b-8 border-[#f59e0b]',
                sectionCard: 'bg-white border-[#f59e0b]/30 shadow-sm',
                button: 'bg-[#1e3a8a] text-[#f59e0b] hover:bg-[#1e40af]',
                modalInput: 'border-[#f59e0b]/40 focus:border-[#1e3a8a] bg-[#fef3c7] text-[#1e3a8a]'
            };
            case 'ceramic-majolica': return {
                modalBg: 'bg-[#fefce8]',
                badgePattern: 'bg-zellige-pattern',
                modalHeader: 'bg-[#15803d] text-[#facc15] border-b-8 border-[#facc15]',
                sectionCard: 'bg-white border-[#facc15]/30 shadow-sm',
                button: 'bg-[#15803d] text-[#facc15] hover:bg-[#166534]',
                modalInput: 'border-[#facc15]/40 focus:border-[#15803d] bg-[#fef9c3] text-[#15803d]'
            };
            case 'ceramic-delft': return {
                modalBg: 'bg-[#f0f9ff]',
                badgePattern: 'bg-zellige-pattern',
                modalHeader: 'bg-[#0c4a6e] text-[#bae6fd] border-b-8 border-[#bae6fd]',
                sectionCard: 'bg-white border-[#bae6fd]/30 shadow-sm',
                button: 'bg-[#0c4a6e] text-[#bae6fd] hover:bg-[#075985]',
                modalInput: 'border-[#bae6fd]/40 focus:border-[#0c4a6e] bg-[#e0f2fe] text-[#0c4a6e]'
            };
            case 'ceramic-iznik': return {
                modalBg: 'bg-[#fef2f2]',
                badgePattern: 'bg-zellige-pattern',
                modalHeader: 'bg-[#dc2626] text-[#0ea5e9] border-b-8 border-[#0ea5e9]',
                sectionCard: 'bg-white border-[#0ea5e9]/30 shadow-sm',
                button: 'bg-[#dc2626] text-[#0ea5e9] hover:bg-[#b91c1c]',
                modalInput: 'border-[#0ea5e9]/40 focus:border-[#dc2626] bg-[#fee2e2] text-[#dc2626]'
            };
            default: return {
                modalBg: 'bg-white dark:bg-gray-900',
                badgePattern: 'bg-gray-100/50',
                modalHeader: 'bg-slate-900 text-white border-b border-gray-700',
                sectionCard: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm',
                button: 'bg-blue-600 text-white hover:bg-blue-700',
                modalInput: 'border-gray-200 dark:border-gray-600 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
            };
        }
    };
    const ts = getThemeStyles();

    // --- QR MODE (PROFESSIONAL BADGE) ---
    const [badgeDesign, setBadgeDesign] = useState<'classic' | 'modern' | 'dark_futuristic' | 'minimal'>('modern');

    // Generate Secure QR using new utility
    const staffQRToken = activeProfile ? generateSystemQR('STAFF', activeProfile.id, activeProfile.name, 365, { role: activeProfile.role }) : '';

    if (!activeProfile) return null;

    if (viewMode === 'qr') {
        return (
            <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-6 backdrop-blur-xl animate-fade-in" onClick={() => setViewMode('profile')}>
                
                {/* Design Switcher */}
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md p-1 rounded-full flex gap-1 z-50" onClick={e => e.stopPropagation()}>
                    {['classic', 'modern', 'dark_futuristic', 'minimal'].map((d) => (
                        <button 
                            key={d}
                            onClick={() => setBadgeDesign(d as any)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition ${badgeDesign === d ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
                        >
                            {d.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <div 
                    className={`w-[340px] h-[580px] rounded-[2.5rem] relative shadow-2xl overflow-hidden flex flex-col items-center text-center transform transition-all scale-100 ring-8 ring-white/10 ${
                        badgeDesign === 'dark_futuristic' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
                    }`} 
                    onClick={e => e.stopPropagation()}
                >
                    
                    {/* --- DESIGN: CLASSIC --- */}
                    {badgeDesign === 'classic' && (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white pointer-events-none"></div>
                            <div className="w-full h-32 relative bg-blue-900 flex justify-center items-center">
                                <div className="absolute -bottom-10 w-[120%] h-20 bg-white rounded-[50%]"></div>
                                <h1 className="relative z-10 text-white font-black text-xl tracking-wider uppercase">{settings.appName}</h1>
                            </div>
                            <div className="relative -mt-14 z-10 mb-4">
                                <div className="w-32 h-32 rounded-full p-1 bg-white shadow-xl mx-auto">
                                    <img src={activeProfile.avatar} className="w-full h-full rounded-full object-cover border-4 border-blue-50" alt="Staff" />
                                </div>
                            </div>
                            <div className="relative z-10 w-full px-8">
                                <h2 className="text-2xl font-black mb-1">{activeProfile.name.split('(')[0]}</h2>
                                <p className="text-sm font-bold text-gray-500 mb-6 uppercase">{activeProfile.jobTitle || activeProfile.role}</p>
                                <div className="inline-block px-6 py-2 rounded-full bg-blue-900 text-white text-xs font-black uppercase tracking-widest mb-8 shadow-lg">
                                    {activeProfile.department}
                                </div>
                                <div className="bg-white p-3 rounded-xl border-4 border-blue-900 shadow-none mb-6 w-40 h-40 mx-auto flex items-center justify-center">
                                    <QRCodeSVG value={staffQRToken} size={140} />
                                </div>
                            </div>
                        </>
                    )}

                    {/* --- DESIGN: MODERN --- */}
                    {badgeDesign === 'modern' && (
                        <>
                            <div className="absolute inset-0 bg-white pointer-events-none"></div>
                            {(settings.theme === 'zellige' || settings.theme === 'zellige-v2') && (
                                <div className={`absolute inset-0 opacity-10 ${ts.badgePattern} mix-blend-multiply pointer-events-none`}></div>
                            )}
                            <div className={`w-full h-40 relative ${settings.theme === 'zellige' ? 'bg-[#006269]' : 'bg-black'} flex flex-col justify-center items-center rounded-b-[3rem]`}>
                                <h1 className="text-white font-black text-2xl tracking-widest uppercase mb-2">{settings.appName}</h1>
                                <span className="px-3 py-1 bg-white/20 rounded-full text-white text-[10px] uppercase font-bold backdrop-blur-sm">Official Staff Badge</span>
                            </div>
                            <div className="relative -mt-12 z-10 mb-2">
                                <div className="w-28 h-28 rounded-2xl rotate-3 p-1 bg-white shadow-2xl mx-auto">
                                    <img src={activeProfile.avatar} className="w-full h-full rounded-xl object-cover rotate-[-3deg]" alt="Staff" />
                                </div>
                            </div>
                            <div className="relative z-10 w-full px-8 pt-4">
                                <h2 className="text-3xl font-black mb-1 tracking-tight">{activeProfile.name.split(' ')[0]}</h2>
                                <p className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-[0.2em]">{activeProfile.jobTitle || activeProfile.role}</p>
                                
                                <div className="flex justify-center gap-4 mb-8">
                                    <div className="text-center">
                                        <span className="block text-[10px] font-bold text-gray-400 uppercase">Dept</span>
                                        <span className="block font-black text-sm">{activeProfile.department}</span>
                                    </div>
                                    <div className="w-px bg-gray-200 h-8"></div>
                                    <div className="text-center">
                                        <span className="block text-[10px] font-bold text-gray-400 uppercase">ID</span>
                                        <span className="block font-black text-sm">#{activeProfile.id.slice(-4)}</span>
                                    </div>
                                </div>

                                <div className="bg-gray-900 p-4 rounded-3xl shadow-xl w-40 h-40 mx-auto flex items-center justify-center">
                                    <QRCodeSVG value={staffQRToken} size={130} bgColor="#111827" fgColor="#ffffff" />
                                </div>
                            </div>
                        </>
                    )}

                    {/* --- DESIGN: DARK FUTURISTIC --- */}
                    {badgeDesign === 'dark_futuristic' && (
                        <>
                            <div className="absolute inset-0 bg-gray-900 pointer-events-none">
                                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black"></div>
                                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
                            </div>
                            
                            <div className="relative z-10 w-full h-full flex flex-col items-center pt-12 px-6">
                                <div className="w-full flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-[10px] font-mono text-green-500 uppercase">Active Status</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-gray-500">{new Date().toLocaleDateString()}</span>
                                </div>

                                <div className="w-32 h-32 rounded-full p-0.5 bg-gradient-to-tr from-blue-500 to-purple-500 mb-6 relative">
                                    <div className="absolute inset-0 rounded-full blur-md bg-blue-500/50"></div>
                                    <img src={activeProfile.avatar} className="w-full h-full rounded-full object-cover relative z-10 border-4 border-gray-900" alt="Staff" />
                                </div>

                                <h2 className="text-2xl font-bold text-white mb-1">{activeProfile.name}</h2>
                                <p className="text-xs font-mono text-blue-400 mb-8 uppercase">{activeProfile.jobTitle || activeProfile.role}</p>

                                <div className="w-full bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition duration-1000"></div>
                                    <div className="flex justify-center">
                                        <QRCodeSVG value={staffQRToken} size={120} bgColor="transparent" fgColor="#ffffff" />
                                    </div>
                                </div>

                                <div className="mt-auto mb-8 font-mono text-[10px] text-gray-600">
                                    SECURE ACCESS TOKEN • {activeProfile.id}
                                </div>
                            </div>
                        </>
                    )}

                    {/* --- DESIGN: MINIMAL --- */}
                    {badgeDesign === 'minimal' && (
                        <>
                            <div className="absolute inset-0 bg-gray-50 pointer-events-none"></div>
                            <div className="relative z-10 w-full h-full flex flex-col p-8 text-left">
                                <div className="flex justify-between items-start mb-12">
                                    <h1 className="font-black text-xl tracking-tighter">{settings.appName}</h1>
                                    <div className="w-8 h-8 bg-black rounded-full"></div>
                                </div>

                                <div className="mb-auto">
                                    <img src={activeProfile.avatar} className="w-20 h-20 rounded-lg object-cover mb-6 grayscale" alt="Staff" />
                                    <h2 className="text-3xl font-black leading-none mb-2">{activeProfile.name}</h2>
                                    <p className="text-sm font-medium text-gray-500">{activeProfile.jobTitle || activeProfile.role}</p>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Department</p>
                                        <p className="font-bold">{activeProfile.department}</p>
                                    </div>
                                    <QRCodeSVG value={staffQRToken} size={80} />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Close Button */}
                    <button onClick={() => setViewMode('profile')} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition z-50 backdrop-blur-sm">
                        <X size={20} />
                    </button>
                </div>
            </div>
        );
    }

    // ... (Keep existing edit view rendering logic same as before, just removed duplicate code to fit in snippet)
    // Assuming the rest of the component remains unchanged for the profile/edit views
    return (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-0 md:p-6 backdrop-blur-md animate-fade-in">
            {/* ... Modal Structure ... */}
            <div className={`w-full max-w-md md:max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden ${ts.modalBg} dark:bg-gray-900 border border-white/20 transform transition-all scale-100 flex flex-col h-[85dvh] md:h-auto max-h-[90vh]`}>
                {/* Drag Handle for Mobile */}
                <div className="drag-handle mb-0 absolute top-2 left-1/2 -translate-x-1/2 z-30"></div>
                
                {/* Header */}
                <div className={`h-28 w-full relative shrink-0 ${ts.modalHeader.split(' ')[0]}`}>
                    {(settings.theme === 'zellige' || settings.theme === 'lihab-al-oud') && (
                        <div className={`absolute inset-0 pointer-events-none ${ts.badgePattern} ${settings.darkMode ? 'opacity-20 mix-blend-screen' : 'opacity-20 mix-blend-multiply'}`}></div>
                    )}
                    <button onClick={() => setActiveProfile(null)} className="absolute top-4 left-4 bg-black/20 text-white p-2 rounded-full hover:bg-black/40 transition backdrop-blur-sm z-20">
                        <X size={20} />
                    </button>
                    {isSelf && viewMode === 'profile' && (
                        <button 
                            onClick={() => setViewMode('edit')} 
                            className="absolute top-4 right-4 bg-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/30 transition backdrop-blur-sm z-20 text-xs font-bold flex items-center gap-2"
                        >
                            <Edit size={14}/> تعديل
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="px-8 pb-8 -mt-14 relative z-10 flex flex-col items-center text-center flex-1 overflow-y-auto custom-scrollbar">
                    {/* Avatar */}
                    <div className="w-28 h-28 rounded-[2rem] p-1.5 bg-white dark:bg-gray-800 shadow-xl mb-3 relative shrink-0">
                        <img src={activeProfile.avatar} className="w-full h-full rounded-[1.7rem] object-cover" alt="Profile" />
                        {activeProfile.isHeadOfDepartment && (
                            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 p-2 rounded-full shadow-md border-2 border-white">
                                <Crown size={16} fill="currentColor"/>
                            </div>
                        )}
                    </div>

                    {viewMode === 'edit' ? (
                        // --- EDIT FORM ---
                        <div className="w-full space-y-4 mt-2 animate-fade-in">
                            <h3 className="font-bold text-gray-800 dark:text-white mb-4">تحديث البيانات</h3>
                            
                            <div className="text-right">
                                <label className="text-[10px] font-bold text-gray-500 mb-1 block">الاسم الظاهر</label>
                                <input 
                                    type="text" 
                                    value={editForm.name} 
                                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                                    className={`w-full p-3 rounded-xl border-2 outline-none font-bold text-sm ${ts.modalInput}`}
                                />
                            </div>
                            <div className="text-right">
                                <label className="text-[10px] font-bold text-gray-500 mb-1 block">رقم الهاتف</label>
                                <input 
                                    type="tel" 
                                    value={editForm.phone} 
                                    onChange={e => setEditForm({...editForm, phone: e.target.value})}
                                    className={`w-full p-3 rounded-xl border-2 outline-none font-bold text-sm ${ts.modalInput}`}
                                    placeholder="05..."
                                />
                            </div>
                            <div className="text-right">
                                <label className="text-[10px] font-bold text-gray-500 mb-1 block">البريد الإلكتروني</label>
                                <input 
                                    type="email" 
                                    value={editForm.email} 
                                    onChange={e => setEditForm({...editForm, email: e.target.value})}
                                    className={`w-full p-3 rounded-xl border-2 outline-none font-bold text-sm ${ts.modalInput}`}
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div className="flex gap-2 mt-6">
                                <button onClick={() => setViewMode('profile')} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600 text-sm">إلغاء</button>
                                <button onClick={handleSaveProfile} className={`flex-[2] py-3 rounded-xl font-bold text-white shadow-lg text-sm ${ts.button.split(' ')[0]}`}>حفظ التغييرات</button>
                            </div>
                        </div>
                    ) : (
                        // --- VIEW PROFILE ---
                        <>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">{activeProfile.name.split('(')[0]}</h2>
                            <p className="text-xs font-bold text-gray-500 mb-6">{activeProfile.jobTitle || getDeptInfo(activeProfile.department).label}</p>

                            <div className="w-full space-y-3 mb-6">
                                <div className={`flex justify-between items-center p-3 rounded-2xl border ${ts.sectionCard}`}>
                                    <span className="text-xs font-bold text-gray-400 uppercase">المعرف</span>
                                    <span className="font-mono font-bold text-sm">{activeProfile.id}</span>
                                </div>
                                <div className={`flex justify-between items-center p-3 rounded-2xl border ${ts.sectionCard}`}>
                                    <span className="text-xs font-bold text-gray-400 uppercase">الهاتف</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm">{activeProfile.phone || 'غير مسجل'}</span>
                                        {activeProfile.phone && <Phone size={14} className="text-gray-400"/>}
                                    </div>
                                </div>
                                
                                {/* Salary (Manager Only) */}
                                {isManager && (
                                    <div className={`flex flex-col p-3 rounded-2xl border ${ts.sectionCard}`}>
                                        <div className="flex justify-between items-center w-full">
                                            <span className="text-xs font-bold text-gray-400 uppercase">الراتب</span>
                                            {!isEditingSalary ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-black text-sm text-green-600">{activeProfile.salary.toLocaleString()} د.ج</span>
                                                    <button onClick={() => { setTempSalary(activeProfile.salary.toString()); setIsEditingSalary(true); }} className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-500"><Edit size={12}/></button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 w-full mt-2">
                                                    <input type="number" value={tempSalary} onChange={(e) => setTempSalary(e.target.value)} className={`flex-1 p-2 rounded-lg border text-sm font-bold text-center ${ts.modalInput}`} autoFocus />
                                                    <button onClick={handleSaveSalary} className="p-2 bg-green-500 text-white rounded-lg"><Check size={14}/></button>
                                                    <button onClick={() => setIsEditingSalary(false)} className="p-2 bg-gray-200 text-gray-600 rounded-lg"><X size={14}/></button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Balance/Debt (Manager/Audit Only) */}
                            {canClearBalance && activeProfile.role !== 'manager' && (
                                <div className={`flex flex-col p-3 rounded-2xl border ${ts.sectionCard} mb-4`}>
                                    <div className="flex justify-between items-center w-full">
                                        <span className="text-xs font-bold text-gray-400 uppercase">الرصيد المستحق</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-mono font-black text-sm ${userBalance < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                                {Math.abs(userBalance).toLocaleString()} د.ج
                                                {userBalance < 0 ? ' (دين)' : ' (مسوى)'}
                                            </span>
                                            {userBalance < 0 && (
                                                <button 
                                                    onClick={() => {
                                                        if (window.confirm(`هل أنت متأكد من تصفية حساب ${activeProfile.name} بمبلغ ${Math.abs(userBalance)} د.ج؟`)) {
                                                            clearUserBalance(activeProfile.id, Math.abs(userBalance));
                                                        }
                                                    }}
                                                    className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                                    title="تصفية الحساب"
                                                >
                                                    <CheckCircle size={12}/>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Promotion Form */}
                            {isPromoting && (
                                <div className="w-full bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 mb-4 animate-fade-in text-right">
                                    <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-3 text-sm flex items-center gap-2">
                                        <Crown size={14}/> ترقية / نقل الموظف
                                    </h4>
                                    
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">القسم الجديد</label>
                                            <select 
                                                value={newDept} 
                                                onChange={(e) => setNewDept(e.target.value as Department)}
                                                className={`w-full p-2 rounded-xl text-xs font-bold ${ts.modalInput}`}
                                            >
                                                {departments.map(d => (
                                                    <option key={d.id} value={d.id}>{d.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">المسمى الوظيفي الجديد</label>
                                            <select 
                                                value={newRole} 
                                                onChange={(e) => setNewRole(e.target.value as Role)}
                                                className={`w-full p-2 rounded-xl text-xs font-bold ${ts.modalInput}`}
                                            >
                                                <option value="manager">مدير</option>
                                                <option value="receptionist">موظف استقبال</option>
                                                <option value="housekeeping_staff">عامل نظافة</option>
                                                <option value="chef">طاهي</option>
                                                <option value="waiter">نادل</option>
                                                <option value="security_guard">حارس أمن</option>
                                                <option value="accountant">محاسب</option>
                                                <option value="marketing_specialist">مسوق</option>
                                                <option value="it_specialist">تقني</option>
                                                <option value="staff">موظف عام</option>
                                            </select>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button onClick={() => setIsPromoting(false)} className="flex-1 py-2 bg-gray-200 text-gray-600 rounded-lg text-xs font-bold">إلغاء</button>
                                            <button onClick={handlePromotion} className="flex-[2] py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-md">تأكيد الترقية</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3 w-full mt-auto">
                                <button 
                                    onClick={() => setViewMode('qr')}
                                    className={`py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition transform active:scale-95 text-white ${isPromoting ? 'col-span-1' : 'col-span-2'} ${ts.button.split(' ')[0]}`}
                                >
                                    <IdCard size={20} /> {isPromoting ? 'QR' : 'البطاقة المهنية (QR ID)'}
                                </button>
                                
                                {canEditStaff && !isSelf && !isPromoting && (
                                    <>
                                        <button 
                                            onClick={() => setIsPromoting(true)}
                                            className="py-3 rounded-2xl font-bold text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 flex items-center justify-center gap-2 col-span-2"
                                        >
                                            <Crown size={16} /> ترقية / نقل
                                        </button>
                                        <button 
                                            onClick={() => updateUser(activeProfile.id, { isBlocked: !activeProfile.isBlocked })}
                                            className={`py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border-2 ${activeProfile.isBlocked ? 'border-green-500 text-green-600 bg-green-50' : 'border-orange-500 text-orange-600 bg-orange-50'}`}
                                        >
                                            {activeProfile.isBlocked ? <><Unlock size={16}/> تفعيل</> : <><Lock size={16}/> تجميد</>}
                                        </button>
                                    </>
                                )}

                                {canClearBalance && activeProfile.role !== 'manager' && userBalance < 0 && !isPromoting && (
                                    <button 
                                        onClick={() => {
                                            if (window.confirm(`هل أنت متأكد من تصفية حساب ${activeProfile.name} بمبلغ ${Math.abs(userBalance)} د.ج؟`)) {
                                                clearUserBalance(activeProfile.id, Math.abs(userBalance));
                                            }
                                        }}
                                        className="py-3 rounded-2xl font-bold text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center justify-center gap-2 col-span-2"
                                    >
                                        <CheckCircle size={16} /> تصفية الحساب ({Math.abs(userBalance).toLocaleString()} د.ج)
                                    </button>
                                )}
                                {canDeleteStaff && !isSelf && !isPromoting && (
                                    <button 
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="py-3 rounded-2xl font-bold text-xs text-red-500 hover:bg-red-50 border border-red-100 flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={16} /> حذف
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Delete Confirmation Overlay */}
                {showDeleteConfirm && (
                    <div className="absolute inset-0 z-50 bg-white/90 dark:bg-gray-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                            <Trash2 size={32}/>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">حذف الموظف نهائياً؟</h3>
                        <p className="text-sm text-gray-500 mb-6 font-bold">لا يمكن التراجع عن هذا الإجراء.</p>
                        <div className="flex gap-3 w-full">
                            <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-bold">إلغاء</button>
                            <button 
                                onClick={() => { removeStaff(activeProfile.id); setActiveProfile(null); setShowDeleteConfirm(false); }}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700"
                            >
                                تأكيد الحذف
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
