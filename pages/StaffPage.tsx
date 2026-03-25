
import React, { useState, useMemo, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { 
    User, Shield, ShieldOff, Check, X, Lock, Unlock, Plus, Trash2, 
    Briefcase, Crown, UserPlus, Users, Brush, 
    Wrench, Siren, Monitor, Calculator,
    BadgeCheck, ChefHat, Coffee, ConciergeBell, Megaphone, Wifi, Flower2,
    IdCard, ScanBarcode, ArrowRight, Share2, Copy, Edit, FileText, Banknote,
    CheckCircle2, XCircle, LayoutGrid, Key, FileSpreadsheet, ShieldCheck,
    Calendar, Plane, Thermometer, AlertCircle, Clock, Fingerprint, LogIn, LogOut, Timer, Save, Printer
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Role, Department, User as UserType, UserPermissions, LeaveRequest, LeaveType, AttendanceRecord } from '../types';
import { 
    MANAGER_PERMISSIONS, 
    ASSISTANT_MANAGER_PERMISSIONS, 
    RECEPTIONIST_PERMISSIONS, 
    FB_MANAGER_PERMISSIONS, 
    STAFF_PERMISSIONS 
} from '../constants';
import { getThemeStyles } from '../utils/themeStyles';

import { StaffCard } from '../components/StaffCard';

export const StaffPage: React.FC = () => {
  const { users, currentUser, updateUser, addStaff, removeStaff, settings, attendanceRecords, recordAttendance, updateAttendanceRecord, leaveRequests, addLeaveRequest, updateLeaveStatus, setActiveProfile, addNotification, generateSystemQR } = useHotel();
  const ts = getThemeStyles(settings);
  const [activeTab, setActiveTab] = useState<'directory' | 'leaves' | 'attendance'>('directory');
  
  // --- Modals State ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showAttendanceEditModal, setShowAttendanceEditModal] = useState<AttendanceRecord | null>(null);
  const [showManualAttendanceModal, setShowManualAttendanceModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState<UserType | null>(null);
  const [staffQRData, setStaffQRData] = useState('');
  
  // New Staff Form State
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffDept, setNewStaffDept] = useState<Department>('reception');
  const [selectedJobTitle, setSelectedJobTitle] = useState(''); 
  const [newStaffSystemRole, setNewStaffSystemRole] = useState<Role>('receptionist');
  const [newStaffSalary, setNewStaffSalary] = useState('');
  const [newStaffPin, setNewStaffPin] = useState('');
  const [isHeadOfDept, setIsHeadOfDept] = useState(false);

  // Manual Attendance State
  const [manualAttUser, setManualAttUser] = useState('');
  const [manualAttTime, setManualAttTime] = useState('');

  // Edit Attendance State
  const [editAttTimeIn, setEditAttTimeIn] = useState('');
  const [editAttTimeOut, setEditAttTimeOut] = useState('');

  // Leave Form State
  const [newLeave, setNewLeave] = useState({
      type: 'annual' as LeaveType,
      startDate: '',
      endDate: '',
      reason: ''
  });

  const [activeDept, setActiveDept] = useState<Department | 'all'>('all');
  const [activeRank, setActiveRank] = useState<string | 'all'>('all');

  const canManage = currentUser?.permissions.canManageStaff || currentUser?.role === 'manager';
  const canAddStaff = currentUser?.permissions.allowedActions?.includes('add_staff') || currentUser?.role === 'manager';
  const canEditStaff = currentUser?.permissions.allowedActions?.includes('edit_staff') || currentUser?.role === 'manager';
  const canDeleteStaff = currentUser?.permissions.allowedActions?.includes('delete_staff') || currentUser?.role === 'manager';
  const isManager = currentUser?.role === 'manager' || currentUser?.role === 'assistant_manager';

  // --- Departments Config ---
  const departments: { id: Department; label: string; icon: any; color: string; bg: string; border: string }[] = [
      { id: 'administration', label: 'الإدارة العليا', icon: Briefcase, color: ts.text, bg: ts.iconBg, border: 'border-[#cca43b]/20' },
      { id: 'reception', label: 'الاستقبال (Front Office)', icon: Monitor, color: ts.text, bg: ts.iconBg, border: 'border-[#cca43b]/20' },
      { id: 'guest_services', label: 'الخدمات الفندقية', icon: ConciergeBell, color: ts.text, bg: ts.iconBg, border: 'border-[#cca43b]/20' },
      { id: 'food_beverage', label: 'التغذية (F&B)', icon: ChefHat, color: ts.text, bg: ts.iconBg, border: 'border-[#cca43b]/20' },
      { id: 'housekeeping', label: 'التدبير المنزلي', icon: Brush, color: ts.text, bg: ts.iconBg, border: 'border-[#cca43b]/20' },
      { id: 'maintenance', label: 'الصيانة والهندسة', icon: Wrench, color: ts.text, bg: ts.iconBg, border: 'border-[#cca43b]/20' },
      { id: 'security', label: 'الأمن والسلامة', icon: Siren, color: ts.text, bg: ts.iconBg, border: 'border-[#cca43b]/20' },
      { id: 'finance', label: 'المالية والمحاسبة', icon: Calculator, color: ts.text, bg: ts.iconBg, border: 'border-[#cca43b]/20' },
      { id: 'hr', label: 'الموارد البشرية', icon: Users, color: ts.text, bg: ts.iconBg, border: 'border-[#cca43b]/20' },
      { id: 'sales_marketing', label: 'المبيعات والتسويق', icon: Megaphone, color: ts.text, bg: ts.iconBg, border: 'border-[#cca43b]/20' },
      { id: 'it', label: 'تكنولوجيا المعلومات', icon: Wifi, color: ts.text, bg: ts.iconBg, border: 'border-[#cca43b]/20' },
      { id: 'spa_wellness', label: 'السبا والرفاهية', icon: Flower2, color: ts.text, bg: ts.iconBg, border: 'border-[#cca43b]/20' },
  ];

  const getDeptInfo = (deptId: Department) => {
      return departments.find(d => d.id === deptId) || { label: deptId, icon: User, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' };
  };

  // --- Dynamic Job Titles & Role Mapping ---
  const getJobTitlesForDepartment = (dept: Department): { title: string, systemRole: Role }[] => {
      // Simplified for brevity, use full list in real app
      return [{ title: 'رئيس قسم', systemRole: 'assistant_manager' }, { title: 'موظف', systemRole: 'staff' }];
  };

  // --- Attendance Helpers ---
  const today = new Date().toISOString().split('T')[0];
  
  const getTodayRecord = (userId: string) => attendanceRecords.find(r => r.userId === userId && r.date === today);

  const handleManualCheckIn = (userId: string) => recordAttendance(userId, 'in');
  const handleManualCheckOut = (userId: string) => recordAttendance(userId, 'out');

  const handleManualEntrySubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!manualAttUser || !manualAttTime) return;
      
      const timeISO = `${today}T${manualAttTime}:00`;
      recordAttendance(manualAttUser, 'in', timeISO);
      setShowManualAttendanceModal(false);
      setManualAttUser('');
      setManualAttTime('');
  };

  const openEditAttendance = (record: AttendanceRecord) => {
      setShowAttendanceEditModal(record);
      setEditAttTimeIn(record.checkInTime ? new Date(record.checkInTime).toTimeString().slice(0, 5) : '');
      setEditAttTimeOut(record.checkOutTime ? new Date(record.checkOutTime).toTimeString().slice(0, 5) : '');
  };

  const handleSaveAttendanceEdit = () => {
      if (!showAttendanceEditModal) return;
      
      const updates: any = {};
      if (editAttTimeIn) {
          updates.checkInTime = `${showAttendanceEditModal.date}T${editAttTimeIn}:00`;
      }
      if (editAttTimeOut) {
          updates.checkOutTime = `${showAttendanceEditModal.date}T${editAttTimeOut}:00`;
      }

      updateAttendanceRecord(showAttendanceEditModal.id, updates);
      setShowAttendanceEditModal(null);
  };

  // --- Leave Helpers ---
  const getDaysDifference = (start: string, end: string) => {
      const d1 = new Date(start);
      const d2 = new Date(end);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason) return;
      
      const days = getDaysDifference(newLeave.startDate, newLeave.endDate);
      
      addLeaveRequest({
          userId: currentUser?.id || '',
          userName: currentUser?.name || '',
          userRole: currentUser?.role || 'staff',
          type: newLeave.type,
          startDate: newLeave.startDate,
          endDate: newLeave.endDate,
          daysCount: days,
          reason: newLeave.reason
      });
      
      setShowLeaveModal(false);
      setNewLeave({ type: 'annual', startDate: '', endDate: '', reason: '' });
  };

  const getLeaveIcon = (type: LeaveType) => {
      switch(type) {
          case 'annual': return <Plane className="text-blue-500" />;
          case 'sick': return <Thermometer className="text-red-500" />;
          case 'unpaid': return <AlertCircle className="text-orange-500" />;
          default: return <Clock className="text-gray-500" />;
      }
  };

  const isZellige = settings.theme === 'zellige';

  // Helper to get department styles that respect dark mode
  const getDeptStyle = (dept: any) => {
      if (settings.darkMode && settings.theme === 'zellige') {
          return {
              bg: 'bg-[#002a2d]',
              color: 'text-[#cca43b]',
              border: 'border-[#cca43b]/30'
          };
      }
      return dept;
  };

  if (!canManage) {
    return <div className="flex flex-col items-center justify-center py-20 text-gray-500"><ShieldOff size={48} className="mb-4 text-red-400" /><h2 className="text-xl font-bold">وصول مرفوض</h2></div>;
  }

  const handleShowQR = (user: UserType) => {
      const qrData = generateSystemQR('STAFF_ACCESS', user.id, `Staff Access: ${user.name}`, 365); // Valid for 1 year
      setStaffQRData(qrData);
      setShowQRModal(user);
  };

  const handleAddStaff = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newStaffName.trim()) return;
      
      let isHead = isHeadOfDept;
      if (newStaffSystemRole === 'restaurant_manager' || newStaffSystemRole === 'cafe_manager') isHead = true; 

      const finalName = `${newStaffName} (${selectedJobTitle})`;
      addStaff(finalName, newStaffSystemRole, newStaffDept, isHead, Number(newStaffSalary) || 0, newStaffPin);
      setShowAddModal(false);
  };

  const filteredUsers = users.filter(u => {
      if (activeDept !== 'all' && u.department !== activeDept) return false;
      if (activeRank !== 'all' && u.rank !== activeRank) return false;
      return true;
  });

  const canViewSensitiveInfo = currentUser?.role === 'manager' || currentUser?.role === 'hr_manager' || currentUser?.role === 'assistant_manager';

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div className="flex-1 w-full"><PageHeader pageKey="staff" defaultTitle="إدارة الموارد البشرية" icon={Users} /></div>
            {activeTab === 'directory' && canAddStaff && <button onClick={() => setShowAddModal(true)} className={`px-8 py-4 rounded-2xl font-black shadow-lg flex items-center gap-2 ${ts.button}`}><UserPlus size={20}/> تسجيل جديد</button>}
            {activeTab === 'leaves' && <button onClick={() => setShowLeaveModal(true)} className={`px-8 py-4 rounded-2xl font-black shadow-lg flex items-center gap-2 ${ts.button}`}><Plane size={20}/> طلب إجازة</button>}
            {activeTab === 'attendance' && isManager && (
                <button onClick={() => setShowManualAttendanceModal(true)} className={`px-8 py-4 rounded-2xl font-black shadow-lg flex items-center gap-2 ${ts.button}`}>
                    <Clock size={20}/> تسجيل يدوي
                </button>
            )}
        </div>

        <div className="flex justify-center mb-6 px-4">
            <div className={`p-1.5 rounded-2xl flex flex-wrap justify-center items-center gap-2 border ${ts.sectionCard}`}>
                <button onClick={() => setActiveTab('directory')} className={`px-4 md:px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all text-sm md:text-base ${activeTab === 'directory' ? ts.activeTab : ts.tabInactive}`}><Users size={18}/> دليل الموظفين</button>
                <button onClick={() => setActiveTab('attendance')} className={`px-4 md:px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all text-sm md:text-base ${activeTab === 'attendance' ? ts.activeTab : ts.tabInactive}`}><Fingerprint size={18}/> الحضور والانصراف</button>
                <button onClick={() => setActiveTab('leaves')} className={`px-4 md:px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all text-sm md:text-base ${activeTab === 'leaves' ? ts.activeTab : ts.tabInactive}`}><Plane size={18}/> الإجازات والعطل</button>
            </div>
        </div>

        {/* --- DIRECTORY TAB --- */}
        {activeTab === 'directory' && (
            <>
                {/* ... Dept Filters ... */}
            <div className="flex flex-wrap gap-4 mb-6 items-center">
                <select 
                    value={activeRank} 
                    onChange={e => setActiveRank(e.target.value)} 
                    className={`p-3 rounded-xl border-2 font-bold outline-none ${ts.modalInput}`}
                >
                    <option value="all">كل الرتب</option>
                    <option value="General Manager">مدير عام</option>
                    <option value="Department Head">رئيس قسم</option>
                    <option value="Senior Staff">موظف أول</option>
                    <option value="Junior Staff">موظف</option>
                    <option value="Trainee">متدرب</option>
                </select>
                
                <div className="text-sm font-bold text-gray-500">
                    العدد: {filteredUsers.length}
                </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredUsers.map(user => {
                        const deptInfo = getDeptInfo(user.department);
                        return (
                            <StaffCard 
                                key={user.id} 
                                user={user} 
                                deptInfo={deptInfo} 
                                settings={settings} 
                                onClick={() => setActiveProfile(user)} 
                                onShowQR={handleShowQR}
                            />
                        );
                    })}
                </div>
            </div>
            </>
        )}

        {/* --- ATTENDANCE TAB (NEW) --- */}
        {activeTab === 'attendance' && (
            <div className="animate-fade-in space-y-6">
                
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-6 rounded-[2rem] border shadow-sm text-center ${ts.sectionCard}`}>
                        <span className="block text-4xl font-black text-blue-600 mb-1">{users.length}</span>
                        <span className={`text-xs font-bold uppercase ${ts.textSecondary}`}>إجمالي الموظفين</span>
                    </div>
                    <div className={`p-6 rounded-[2rem] border shadow-sm text-center ${ts.sectionCard}`}>
                        <span className="block text-4xl font-black text-green-600 mb-1">{attendanceRecords.filter(r => r.date === today && r.status === 'present').length}</span>
                        <span className={`text-xs font-bold uppercase ${ts.textSecondary}`}>حضور اليوم</span>
                    </div>
                    <div className={`p-6 rounded-[2rem] border shadow-sm text-center ${ts.sectionCard}`}>
                        <span className="block text-4xl font-black text-red-600 mb-1">{attendanceRecords.filter(r => r.date === today && r.status === 'late').length}</span>
                        <span className={`text-xs font-bold uppercase ${ts.textSecondary}`}>تأخرات</span>
                    </div>
                </div>

                {/* Attendance List */}
                <div className={`rounded-[2.5rem] shadow-sm border p-6 ${ts.sectionCard}`}>
                    <h3 className={`font-black text-lg mb-6 flex items-center gap-2 ${ts.textPrimary}`}><Fingerprint className="text-blue-500"/> سجل الحضور اليومي ({today})</h3>
                    <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar space-y-3">
                        {users.map(user => {
                            const record = getTodayRecord(user.id);
                            const deptInfo = getDeptInfo(user.department);
                            const style = getDeptStyle(deptInfo);
                            return (
                                <div key={user.id} className={`flex items-center justify-between p-3 rounded-2xl border hover:shadow-sm transition ${ts.card}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${style.color.replace('text-', 'bg-')} ${settings.theme === 'zellige' ? 'text-[#001e21]' : 'text-white'}`}>
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-sm ${ts.textPrimary}`}>{user.name}</h4>
                                            <p className={`text-[10px] ${ts.textSecondary}`}>{deptInfo.label}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        {record ? (
                                            <>
                                                <div className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${record.status === 'late' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                    {record.status === 'late' ? <><AlertCircle size={12}/> متأخر ({record.lateDurationMinutes}د)</> : <><CheckCircle2 size={12}/> حاضر</>}
                                                </div>
                                                <div className={`text-[10px] font-mono ${ts.textSecondary}`}>
                                                    <div>In: {new Date(record.checkInTime!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                                    {record.checkOutTime && <div>Out: {new Date(record.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>}
                                                </div>
                                                
                                                {/* Actions */}
                                                {!record.checkOutTime && (
                                                    <button onClick={() => handleManualCheckOut(user.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100" title="تسجيل خروج يدوي"><LogOut size={16}/></button>
                                                )}
                                                {isManager && (
                                                    <button onClick={() => openEditAttendance(record)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200" title="تعديل السجل"><Edit size={16}/></button>
                                                )}
                                            </>
                                        ) : (
                                            <button onClick={() => handleManualCheckIn(user.id)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-700 flex items-center gap-2">
                                                <LogIn size={14}/> تسجيل دخول
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        )}

        {/* --- LEAVES TAB --- */}
        {activeTab === 'leaves' && (
            <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {leaveRequests.map(req => (
                    <div key={req.id} className={`p-5 rounded-[2rem] shadow-sm border border-gray-100 ${ts.card}`}>
                        <div className="flex justify-between items-start mb-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${req.status === 'approved' ? 'bg-green-100 text-green-700' : req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{req.status}</span>
                            <span className={`text-xs font-bold ${ts.textSecondary}`}>{new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className={`font-black mb-1 ${ts.textPrimary}`}>{req.userName}</h4>
                        <div className={`text-xs font-bold mb-4 flex items-center gap-2 ${ts.textSecondary}`}>
                            {req.type === 'sick' ? <Thermometer size={14} className="text-red-500"/> : <Plane size={14} className="text-blue-500"/>}
                            {req.type} • {req.daysCount} أيام
                        </div>
                        {req.status === 'pending' && isManager && (
                            <div className="flex gap-2">
                                <button onClick={() => updateLeaveStatus(req.id, 'approved')} className="flex-1 py-2 bg-green-500 text-white rounded-xl text-xs font-bold">قبول</button>
                                <button onClick={() => updateLeaveStatus(req.id, 'rejected', 'إداري')} className="flex-1 py-2 bg-red-100 text-red-600 rounded-xl text-xs font-bold">رفض</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}

        {/* Add Staff Modal */}
        <Modal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            title="إضافة موظف"
            size="md"
        >
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
                <input type="text" placeholder="الاسم" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} className={`w-full p-3 rounded-xl border-2 ${ts.modalInput}`} />
                <select value={newStaffDept} onChange={e => setNewStaffDept(e.target.value as any)} className={`w-full p-3 rounded-xl border-2 ${ts.modalInput}`}>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                </select>
                <select value={newStaffSystemRole} onChange={e => setNewStaffSystemRole(e.target.value as any)} className={`w-full p-3 rounded-xl border-2 ${ts.modalInput}`}>
                    <option value="manager">المدير العام</option>
                    <option value="assistant_manager">مساعد المدير</option>
                    <option value="operations_manager">مدير العمليات</option>
                    <option value="reception_manager">مدير الاستقبال</option>
                    <option value="receptionist">موظف استقبال</option>
                    <option value="restaurant_manager">مدير المطعم</option>
                    <option value="head_chef">كبير الطهاة</option>
                    <option value="chef">طاهي</option>
                    <option value="waiter">نادل</option>
                    <option value="cafe_manager">مدير المقهى</option>
                    <option value="barista">باريستا</option>
                    <option value="housekeeping_manager">مدير التدبير المنزلي</option>
                    <option value="housekeeping_staff">عامل نظافة</option>
                    <option value="maintenance_manager">مدير الصيانة</option>
                    <option value="maintenance_staff">فني صيانة</option>
                    <option value="security_manager">مدير الأمن</option>
                    <option value="security_guard">حارس أمن</option>
                    <option value="hr_manager">مدير الموارد البشرية</option>
                    <option value="accountant">محاسب</option>
                    <option value="marketing_specialist">مسؤول تسويق</option>
                    <option value="it_specialist">مسؤول IT</option>
                    <option value="concierge">كونسيرج</option>
                    <option value="bellboy">حامل الحقائب</option>
                    <option value="driver">سائق</option>
                    <option value="staff">موظف عام</option>
                </select>
                <input type="number" placeholder="الراتب" value={newStaffSalary} onChange={e => setNewStaffSalary(e.target.value)} className={`w-full p-3 rounded-xl border-2 ${ts.modalInput}`} />
                <button onClick={handleAddStaff} className={`w-full py-4 rounded-xl font-bold text-white mt-6 ${ts.button}`}>حفظ</button>
            </div>
        </Modal>

        {/* Manual Attendance Modal */}
        <Modal
            isOpen={showManualAttendanceModal}
            onClose={() => setShowManualAttendanceModal(false)}
            title={<div className="flex items-center gap-2"><Clock size={20}/> تسجيل حضور يدوي</div>}
            size="sm"
        >
            <form onSubmit={handleManualEntrySubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
                <div>
                    <label className={`block text-xs font-bold mb-2 ${ts.inputLabel}`}>الموظف</label>
                    <select 
                        value={manualAttUser} 
                        onChange={e => setManualAttUser(e.target.value)}
                        className={`w-full p-3 rounded-xl border-2 outline-none font-bold ${ts.modalInput}`}
                        required
                    >
                        <option value="">-- اختر الموظف --</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className={`block text-xs font-bold mb-2 ${ts.inputLabel}`}>وقت الدخول</label>
                    <input 
                        type="time" 
                        value={manualAttTime}
                        onChange={e => setManualAttTime(e.target.value)}
                        className={`w-full p-3 rounded-xl border-2 outline-none font-bold ${ts.modalInput}`}
                        required
                    />
                </div>
                <button type="submit" className={`w-full py-3 rounded-xl font-bold text-white mt-4 ${ts.button}`}>
                    تأكيد التسجيل
                </button>
            </form>
        </Modal>

        {/* Edit Attendance Record Modal */}
        <Modal
            isOpen={!!showAttendanceEditModal}
            onClose={() => setShowAttendanceEditModal(null)}
            title={<div className="flex items-center gap-2"><Edit size={20}/> تعديل سجل الحضور</div>}
            size="sm"
        >
            {showAttendanceEditModal && (
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
                    <div className="text-center mb-4">
                        <h4 className={`font-bold text-lg ${ts.textPrimary}`}>{showAttendanceEditModal.userName}</h4>
                        <p className={`text-xs ${ts.textSecondary}`}>{showAttendanceEditModal.date}</p>
                    </div>
                    <div>
                        <label className={`block text-xs font-bold mb-2 ${ts.inputLabel}`}>وقت الدخول</label>
                        <input 
                            type="time" 
                            value={editAttTimeIn}
                            onChange={e => setEditAttTimeIn(e.target.value)}
                            className={`w-full p-3 rounded-xl border-2 outline-none font-bold ${ts.modalInput}`}
                        />
                    </div>
                    <div>
                        <label className={`block text-xs font-bold mb-2 ${ts.inputLabel}`}>وقت الخروج</label>
                        <input 
                            type="time" 
                            value={editAttTimeOut}
                            onChange={e => setEditAttTimeOut(e.target.value)}
                            className={`w-full p-3 rounded-xl border-2 outline-none font-bold ${ts.modalInput}`}
                        />
                    </div>
                    <div className={`p-3 rounded-xl text-xs border ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/10 text-[#cca43b] border-[#cca43b]/30' : (isZellige ? 'bg-[#cca43b]/10 text-[#006269] border-[#cca43b]/30' : 'bg-yellow-50 text-yellow-800 border-yellow-200')}`}>
                        تنبيه: تعديل وقت الدخول سيؤدي تلقائياً إلى إعادة حساب التأخير والخصم المالي في النظام المحاسبي.
                    </div>
                    <button onClick={handleSaveAttendanceEdit} className={`w-full py-3 rounded-xl font-bold text-white mt-4 ${ts.button}`}>
                        حفظ التغييرات
                    </button>
                </div>
            )}
        </Modal>

        {/* --- LEAVE REQUEST MODAL --- */}
        <Modal
            isOpen={showLeaveModal}
            onClose={() => setShowLeaveModal(false)}
            title={<div className="flex items-center gap-2"><Plane/> طلب إجازة</div>}
            size="md"
        >
            <form onSubmit={handleLeaveSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
                <div>
                    <label className={`block text-xs font-bold mb-2 ${ts.inputLabel}`}>نوع الإجازة</label>
                    <select value={newLeave.type} onChange={e => setNewLeave({...newLeave, type: e.target.value as LeaveType})} className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.modalInput}`}>
                        <option value="annual">سنوية (Annual)</option>
                        <option value="sick">مرضية (Sick)</option>
                        <option value="unpaid">بدون راتب (Unpaid)</option>
                        <option value="recovery">تعويضية (Recovery)</option>
                        <option value="emergency">طارئة (Emergency)</option>
                    </select>
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className={`block text-xs font-bold mb-2 ${ts.inputLabel}`}>من</label>
                        <input type="date" required value={newLeave.startDate} onChange={e => setNewLeave({...newLeave, startDate: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.modalInput}`} />
                    </div>
                    <div className="flex-1">
                        <label className={`block text-xs font-bold mb-2 ${ts.inputLabel}`}>إلى غاية</label>
                        <input type="date" required value={newLeave.endDate} onChange={e => setNewLeave({...newLeave, endDate: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold outline-none ${ts.modalInput}`} />
                    </div>
                </div>
                <div>
                    <label className={`block text-xs font-bold mb-2 ${ts.inputLabel}`}>السبب / ملاحظات</label>
                    <textarea required value={newLeave.reason} onChange={e => setNewLeave({...newLeave, reason: e.target.value})} className={`w-full p-3 rounded-xl border-2 font-bold outline-none h-24 resize-none ${ts.modalInput}`} placeholder="سبب الغياب..." />
                </div>
                <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setShowLeaveModal(false)} className="flex-1 py-3 bg-gray-200 rounded-xl font-bold text-gray-600">إلغاء</button>
                    <button type="submit" className={`flex-[2] py-3 rounded-xl font-bold shadow-lg ${ts.button}`}>إرسال الطلب</button>
                </div>
            </form>
        </Modal>

        {/* Staff QR Modal */}
        <Modal
            isOpen={!!showQRModal}
            onClose={() => setShowQRModal(null)}
            title={<div className="flex items-center gap-2"><ScanBarcode size={20}/> بطاقة الوصول الرقمية</div>}
            size="sm"
        >
            {showQRModal && (
                <div className="p-6 flex flex-col items-center justify-center space-y-6">
                    <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-200">
                        <QRCodeSVG value={staffQRData} size={200} />
                    </div>
                    
                    <div className="text-center">
                        <h3 className="text-xl font-bold mb-1">{showQRModal.name}</h3>
                        <p className={`text-sm ${ts.textSecondary}`}>{showQRModal.role.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-xs text-gray-400 mt-2 font-mono">ID: {showQRModal.id.slice(0,8)}</p>
                    </div>

                    <div className="w-full p-4 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold text-center">
                        يستخدم هذا الرمز لتسجيل الحضور والانصراف والوصول للمناطق المصرح بها.
                    </div>

                    <button 
                        onClick={() => {
                            const printWindow = window.open('', '', 'width=600,height=600');
                            if (printWindow) {
                                printWindow.document.write(`
                                    <html>
                                        <head>
                                            <title>Staff Access QR - ${showQRModal.name}</title>
                                            <style>
                                                body { font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                                                .card { border: 2px solid #000; padding: 40px; border-radius: 20px; text-align: center; }
                                                h1 { margin: 20px 0 10px; font-size: 24px; }
                                                p { margin: 0; color: #666; }
                                                .id { margin-top: 10px; font-family: monospace; font-size: 12px; }
                                            </style>
                                        </head>
                                        <body>
                                            <div class="card">
                                                ${document.querySelector('svg')?.outerHTML || ''}
                                                <h1>${showQRModal.name}</h1>
                                                <p>${showQRModal.role.replace('_', ' ').toUpperCase()}</p>
                                                <p class="id">ID: ${showQRModal.id}</p>
                                            </div>
                                            <script>window.print(); window.close();</script>
                                        </body>
                                    </html>
                                `);
                                printWindow.document.close();
                            }
                        }}
                        className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 ${ts.button}`}
                    >
                        <Printer size={18} /> طباعة البطاقة
                    </button>
                </div>
            )}
        </Modal>
    </div>
  );
};
