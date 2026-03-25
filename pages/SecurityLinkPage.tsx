
import React, { useState, useMemo } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { ShieldAlert, FileText, Siren, AlertTriangle, Eye, Send, Printer, User, Check, Lock, ChevronRight, Activity, CalendarDays, Search, ArrowRight } from 'lucide-react';
import { SecurityLog } from '../types';
import { printDocument } from '../utils/print';

export const SecurityLinkPage: React.FC = () => {
    const { bookings, rooms, securityLogs, addSecurityLog, settings, currentUser, addNotification } = useHotel();
    const [activeTab, setActiveTab] = useState<'daily_report' | 'report_suspicion' | 'bulletin'>('daily_report');
    const [reportForm, setReportForm] = useState({ roomId: 0, title: '', content: '', severity: 'medium' as 'low'|'medium'|'high' });
    const [blacklistCheck, setBlacklistCheck] = useState('');
    const [blacklistResult, setBlacklistResult] = useState<string | null>(null);

    const today = new Date().toISOString().split('T')[0];

    const dailyArrivals = useMemo(() => {
        return bookings.filter(b => b.checkInDate.split('T')[0] === today).map(b => ({...b, type: 'arrival'}));
    }, [bookings, today]);

    const dailyDepartures = useMemo(() => {
        return bookings.filter(b => b.checkOutDate.split('T')[0] === today).map(b => ({...b, type: 'departure'}));
    }, [bookings, today]);

    const handleBlacklistCheck = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API check
        if (blacklistCheck.toUpperCase() === 'AB-123456' || blacklistCheck === '123456789') {
            setBlacklistResult('⚠️ تحذير: هذا الرقم مدرج في قائمة المراقبة (تطابق جزئي)');
        } else {
            setBlacklistResult('✅ السجل نظيف (لا توجد قيود)');
        }
    };

    const submitSecurityReport = (e: React.FormEvent) => {
        e.preventDefault();
        if(!reportForm.title || !reportForm.content) return;

        const booking = bookings.find(b => b.roomId === reportForm.roomId && b.status === 'active');
        
        addSecurityLog({
            type: 'report',
            title: reportForm.title,
            content: reportForm.content,
            severity: reportForm.severity,
            status: 'open',
            relatedRoomId: reportForm.roomId || undefined,
            guestName: booking?.primaryGuestName
        });

        setReportForm({ roomId: 0, title: '', content: '', severity: 'medium' });
        addNotification("تم إرسال التقرير الأمني وتشفيره بنجاح", "success");
    };

    // Style Helpers
    const getThemeStyles = () => {
        if (settings.darkMode) {
            if (settings.theme === 'zellige') {
                return {
                    bg: 'bg-[#001517]',
                    card: 'bg-[#001e21] border-[#cca43b]/30 text-[#cca43b]',
                    header: 'text-[#cca43b]',
                    tabActive: 'bg-[#cca43b] text-[#001e21] border-[#cca43b]',
                    tabInactive: 'bg-[#002a2d] text-[#cca43b]/60 border-[#cca43b]/20 hover:bg-[#cca43b]/10',
                    input: 'bg-[#001517] border-[#cca43b]/30 text-[#cca43b] placeholder-[#cca43b]/40 focus:border-[#cca43b]',
                    button: 'bg-[#cca43b] text-[#001e21] hover:bg-[#b08d30]',
                    tableHeader: 'bg-[#002a2d] text-[#cca43b]',
                    tableRow: 'hover:bg-[#cca43b]/5 border-[#cca43b]/10',
                    textSecondary: 'text-[#cca43b]/60',
                    badgeSuccess: 'bg-green-900/30 text-green-400 border border-green-800',
                    badgeError: 'bg-red-900/30 text-red-400 border border-red-800',
                    badgeWarning: 'bg-orange-900/30 text-orange-400 border border-orange-800',
                    badgeInfo: 'bg-blue-900/30 text-blue-400 border border-blue-800'
                };
            }
            return {
                bg: 'bg-gray-900',
                card: 'bg-gray-800 border-gray-700 text-white',
                header: 'text-white',
                tabActive: 'bg-blue-600 text-white',
                tabInactive: 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700',
                input: 'bg-gray-900 border-gray-700 text-white placeholder-gray-500',
                button: 'bg-blue-600 text-white hover:bg-blue-700',
                tableHeader: 'bg-gray-900 text-gray-300',
                tableRow: 'hover:bg-gray-700 border-gray-700',
                textSecondary: 'text-gray-400',
                badgeSuccess: 'bg-green-900/30 text-green-400',
                badgeError: 'bg-red-900/30 text-red-400',
                badgeWarning: 'bg-orange-900/30 text-orange-400',
                badgeInfo: 'bg-blue-900/30 text-blue-400'
            };
        }

        if (settings.theme === 'zellige') {
            return {
                bg: 'bg-[#FDFBF7]',
                card: 'bg-white border-[#cca43b]/20 text-[#006269]',
                header: 'text-[#006269]',
                tabActive: 'bg-[#006269] text-[#cca43b] border-[#cca43b]',
                tabInactive: 'bg-white text-[#006269]/70 border-[#cca43b]/20 hover:bg-[#fbf8f1]',
                input: 'bg-[#fbf8f1] border-[#cca43b]/30 text-[#006269] placeholder-[#006269]/40 focus:border-[#006269]',
                button: 'bg-[#006269] text-[#cca43b] hover:bg-[#004d53]',
                tableHeader: 'bg-[#fbf8f1] text-[#006269]',
                tableRow: 'hover:bg-[#fbf8f1] border-[#cca43b]/10',
                textSecondary: 'text-[#006269]/60',
                badgeSuccess: 'bg-green-100 text-green-700',
                badgeError: 'bg-red-100 text-red-700',
                badgeWarning: 'bg-orange-100 text-orange-700',
                badgeInfo: 'bg-blue-100 text-blue-700'
            };
        }

        return {
            bg: 'bg-gray-50',
            card: 'bg-white border-gray-200 text-gray-900',
            header: 'text-blue-900',
            tabActive: 'bg-blue-800 text-white',
            tabInactive: 'bg-white text-gray-500 hover:bg-gray-100',
            input: 'bg-white border-gray-200 text-gray-900 placeholder-gray-400',
            button: 'bg-blue-600 text-white hover:bg-blue-700',
            tableHeader: 'bg-gray-100 text-gray-600',
            tableRow: 'hover:bg-gray-50 border-gray-100',
            textSecondary: 'text-gray-500',
            badgeSuccess: 'bg-green-100 text-green-700',
            badgeError: 'bg-red-100 text-red-700',
            badgeWarning: 'bg-orange-100 text-orange-700',
            badgeInfo: 'bg-blue-100 text-blue-700'
        };
    };

    const ts = getThemeStyles();

    const getSeverityBadge = (severity: string) => {
        switch(severity) {
            case 'high': return <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${ts.badgeError}`}><AlertTriangle size={12}/> مرتفع</span>;
            case 'medium': return <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${ts.badgeWarning}`}><Activity size={12}/> متوسط</span>;
            default: return <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${ts.badgeInfo}`}><Check size={12}/> منخفض</span>;
        }
    };

    if (!currentUser?.permissions.canViewSecurityLink) {
        return <div className="p-10 text-center text-red-500 font-bold">وصول غير مصرح به</div>;
    }

    return (
        <div className={`space-y-6 pb-20 animate-fade-in`}>
            <PageHeader pageKey="security" defaultTitle="بوابة التواصل الأمني" icon={ShieldAlert} />

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-[2rem] border relative overflow-hidden flex items-center justify-between shadow-sm ${ts.card}`}>
                    <div>
                        <p className={`text-xs font-bold uppercase mb-1 ${ts.textSecondary}`}>الوافدون اليوم</p>
                        <h3 className="text-3xl font-black text-green-600">{dailyArrivals.length}</h3>
                    </div>
                    <div className={`p-3 rounded-2xl ${ts.badgeSuccess}`}><User size={24}/></div>
                </div>
                <div className={`p-6 rounded-[2rem] border relative overflow-hidden flex items-center justify-between shadow-sm ${ts.card}`}>
                    <div>
                        <p className={`text-xs font-bold uppercase mb-1 ${ts.textSecondary}`}>المغادرون اليوم</p>
                        <h3 className="text-3xl font-black text-orange-600">{dailyDepartures.length}</h3>
                    </div>
                    <div className={`p-3 rounded-2xl ${ts.badgeWarning}`}><ArrowRight size={24}/></div>
                </div>
                <div className={`p-6 rounded-[2rem] border relative overflow-hidden flex items-center justify-between shadow-sm ${ts.card} ${settings.darkMode && settings.theme === 'zellige' ? 'border-red-900/50' : 'border-red-100 bg-red-50'}`}>
                    <div>
                        <p className={`text-xs font-bold uppercase mb-1 ${settings.darkMode && settings.theme === 'zellige' ? 'text-red-400' : 'text-red-500'}`}>تنبيهات نشطة</p>
                        <h3 className="text-3xl font-black text-red-700">{securityLogs.filter(l => l.status === 'open').length}</h3>
                    </div>
                    <div className={`p-3 rounded-2xl shadow-sm ${ts.badgeError}`}><Siren size={24} className="animate-pulse"/></div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className={`flex gap-2 p-1.5 rounded-2xl w-fit mx-auto md:mx-0 ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#001e21] border border-[#cca43b]/20' : 'bg-gray-200/50'}`}>
                <button onClick={() => setActiveTab('daily_report')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border ${activeTab === 'daily_report' ? ts.tabActive : ts.tabInactive}`}>
                    <FileText size={16}/> الاستمارة اليومية
                </button>
                <button onClick={() => setActiveTab('report_suspicion')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border ${activeTab === 'report_suspicion' ? ts.tabActive : ts.tabInactive}`}>
                    <Eye size={16}/> إبلاغ عن اشتباه
                </button>
                <button onClick={() => setActiveTab('bulletin')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border ${activeTab === 'bulletin' ? ts.tabActive : ts.tabInactive}`}>
                    <Lock size={16}/> النشرة الأمنية
                </button>
            </div>

            {/* === DAILY REPORT TAB === */}
            {activeTab === 'daily_report' && (
                <div className={`rounded-[2.5rem] shadow-sm border p-8 animate-fade-in ${ts.card}`}>
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className={`text-xl font-black flex items-center gap-2 ${ts.header}`}>
                                <FileText className={settings.theme === 'zellige' ? 'text-[#cca43b]' : 'text-blue-600'}/> القائمة الاسمية للنزلاء (Police Sheet)
                            </h3>
                            <p className={`text-sm mt-1 ${ts.textSecondary}`}>تاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
                        </div>
                        <button onClick={() => printDocument({
                            title: `Police Sheet - ${new Date().toLocaleDateString('ar-SA')}`,
                            content: (
                                <div className="p-8" dir="rtl">
                                    <div className="flex justify-between items-start mb-8 border-b pb-4">
                                        <div>
                                            <h3 className="text-xl font-black flex items-center gap-2 text-gray-800">
                                                القائمة الاسمية للنزلاء (Police Sheet)
                                            </h3>
                                            <p className="text-gray-500 text-sm mt-1">تاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
                                        </div>
                                    </div>
                                    <table className="w-full text-sm text-right border-collapse">
                                        <thead className="bg-gray-100 text-gray-600 font-bold">
                                            <tr>
                                                <th className="p-4 border">الاسم الكامل</th>
                                                <th className="p-4 border">رقم الهوية</th>
                                                <th className="p-4 border">تاريخ الميلاد</th>
                                                <th className="p-4 border">الغرفة</th>
                                                <th className="p-4 border">الحركة</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {[...dailyArrivals, ...dailyDepartures].length === 0 ? (
                                                <tr><td colSpan={5} className="p-8 text-center text-gray-400 font-bold border">لا توجد حركات دخول أو خروج اليوم</td></tr>
                                            ) : (
                                                [...dailyArrivals, ...dailyDepartures].map((guest, idx) => (
                                                    <tr key={idx}>
                                                        <td className="p-4 border font-bold">{guest.guests[0].firstNameAr} {guest.guests[0].lastNameAr}</td>
                                                        <td className="p-4 border font-mono uppercase">{guest.guests[0].idNumber}</td>
                                                        <td className="p-4 border">{guest.guests[0].birthDate}</td>
                                                        <td className="p-4 border"><span className="bg-gray-200 px-2 py-1 rounded font-black">{rooms.find(r=>r.id===guest.roomId)?.number}</span></td>
                                                        <td className="p-4 border">
                                                            {guest.type === 'arrival' ? 
                                                                <span className="text-green-600 font-bold">دخول</span> : 
                                                                <span className="text-red-600 font-bold">خروج</span>
                                                            }
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                    <div className="mt-8 text-xs text-gray-400 text-center border-t pt-4">
                                        هذه الوثيقة رسمية وسرية، مخصصة حصراً لمصالح الأمن المختصة.
                                    </div>
                                </div>
                            ),
                            settings
                        })} className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition ${ts.button}`}>
                            <Printer size={18}/> طباعة / تصدير PDF
                        </button>
                    </div>

                    <div className={`overflow-x-auto border rounded-xl ${settings.darkMode && settings.theme === 'zellige' ? 'border-[#cca43b]/20' : ''}`}>
                        <table className="w-full text-sm text-right">
                            <thead className={`font-bold ${ts.tableHeader}`}>
                                <tr>
                                    <th className="p-4">الاسم الكامل</th>
                                    <th className="p-4">رقم الهوية</th>
                                    <th className="p-4">تاريخ الميلاد</th>
                                    <th className="p-4">الغرفة</th>
                                    <th className="p-4">الحركة</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${settings.darkMode && settings.theme === 'zellige' ? 'divide-[#cca43b]/10' : 'divide-gray-100'}`}>
                                {[...dailyArrivals, ...dailyDepartures].length === 0 ? (
                                    <tr><td colSpan={5} className={`p-8 text-center font-bold ${ts.textSecondary}`}>لا توجد حركات دخول أو خروج اليوم</td></tr>
                                ) : (
                                    [...dailyArrivals, ...dailyDepartures].map((guest, idx) => (
                                        <tr key={idx} className={`transition ${ts.tableRow}`}>
                                            <td className="p-4 font-bold">{guest.guests[0].firstNameAr} {guest.guests[0].lastNameAr}</td>
                                            <td className="p-4 font-mono uppercase">{guest.guests[0].idNumber}</td>
                                            <td className="p-4">{guest.guests[0].birthDate}</td>
                                            <td className="p-4"><span className={`px-2 py-1 rounded font-black ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#cca43b]/20 text-[#cca43b]' : 'bg-gray-200'}`}>{rooms.find(r=>r.id===guest.roomId)?.number}</span></td>
                                            <td className="p-4">
                                                {guest.type === 'arrival' ? 
                                                    <span className={`px-2 py-1 rounded font-bold ${ts.badgeSuccess}`}>دخول</span> : 
                                                    <span className={`px-2 py-1 rounded font-bold ${ts.badgeError}`}>خروج</span>
                                                }
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className={`mt-4 text-[10px] text-center ${ts.textSecondary}`}>
                        هذه الوثيقة رسمية وسرية، مخصصة حصراً لمصالح الأمن المختصة.
                    </div>
                </div>
            )}

            {/* === REPORT SUSPICION TAB === */}
            {activeTab === 'report_suspicion' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                    
                    {/* Report Form */}
                    <div className={`rounded-[2.5rem] shadow-sm border p-8 ${ts.card}`}>
                        <h3 className="text-xl font-black text-red-600 mb-6 flex items-center gap-2">
                            <Eye /> إبلاغ عن حالة اشتباه
                        </h3>
                        <form onSubmit={submitSecurityReport} className="space-y-6">
                            <div>
                                <label className={`block text-xs font-bold mb-2 ${ts.textSecondary}`}>الغرفة المعنية (اختياري)</label>
                                <select 
                                    className={`w-full p-4 rounded-2xl border-2 font-bold outline-none transition ${ts.input}`}
                                    value={reportForm.roomId}
                                    onChange={e => setReportForm({...reportForm, roomId: Number(e.target.value)})}
                                >
                                    <option value={0}>-- غير محدد --</option>
                                    {rooms.filter(r => r.status === 'occupied').map(r => (
                                        <option key={r.id} value={r.id}>غرفة {r.number}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={`block text-xs font-bold mb-2 ${ts.textSecondary}`}>عنوان البلاغ</label>
                                <input 
                                    type="text" 
                                    placeholder="مثال: ضوضاء غير طبيعية، زوار كثر..." 
                                    className={`w-full p-4 rounded-2xl border-2 font-bold outline-none transition ${ts.input}`}
                                    value={reportForm.title}
                                    onChange={e => setReportForm({...reportForm, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className={`block text-xs font-bold mb-2 ${ts.textSecondary}`}>التفاصيل والملاحظات</label>
                                <textarea 
                                    className={`w-full p-4 rounded-2xl border-2 font-bold outline-none transition h-32 resize-none ${ts.input}`}
                                    placeholder="يرجى وصف الحالة بدقة..."
                                    value={reportForm.content}
                                    onChange={e => setReportForm({...reportForm, content: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className={`block text-xs font-bold mb-2 ${ts.textSecondary}`}>درجة الخطورة</label>
                                <div className="flex gap-2">
                                    {['low', 'medium', 'high'].map(sev => (
                                        <button 
                                            key={sev}
                                            type="button"
                                            onClick={() => setReportForm({...reportForm, severity: sev as any})}
                                            className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase transition ${reportForm.severity === sev 
                                                ? (sev === 'high' ? 'bg-red-600 text-white' : sev === 'medium' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white') 
                                                : (settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] text-[#cca43b]/60 border border-[#cca43b]/20' : 'bg-gray-100 text-gray-500')}`}
                                        >
                                            {sev === 'high' ? 'مرتفع' : sev === 'medium' ? 'متوسط' : 'منخفض'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg hover:bg-red-700 transition flex items-center justify-center gap-2">
                                <Send size={20}/> إرسال البلاغ فوراً
                            </button>
                        </form>
                    </div>

                    {/* Check Blacklist Widget */}
                    <div className="space-y-6">
                        <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-xl font-black mb-4 flex items-center gap-2"><Search /> فحص القائمة السوداء</h3>
                                <p className="text-sm opacity-70 mb-6">تحقق من رقم هوية أو اسم للتأكد من عدم وجود موانع أمنية.</p>
                                <form onSubmit={handleBlacklistCheck} className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="رقم الهوية / الاسم (ABC-123)" 
                                        className="flex-1 p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none focus:bg-white/20 transition uppercase font-mono"
                                        value={blacklistCheck}
                                        onChange={e => setBlacklistCheck(e.target.value.toUpperCase())}
                                    />
                                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-6 rounded-xl font-bold transition">فحص</button>
                                </form>
                                {blacklistResult && (
                                    <div className={`mt-4 p-4 rounded-xl font-bold text-sm border ${blacklistResult.includes('تحذير') ? 'bg-red-500/20 border-red-500 text-red-200' : 'bg-green-500/20 border-green-500 text-green-200'}`}>
                                        {blacklistResult}
                                    </div>
                                )}
                            </div>
                            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                        </div>

                        {/* Recent Reports List */}
                        <div className={`rounded-[2.5rem] border p-6 h-[300px] overflow-y-auto custom-scrollbar ${ts.card}`}>
                            <h4 className={`font-bold uppercase text-xs mb-4 ${ts.textSecondary}`}>البلاغات الأخيرة</h4>
                            {securityLogs.length === 0 ? (
                                <p className={`text-center py-10 font-bold ${ts.textSecondary}`}>لا توجد بلاغات مسجلة</p>
                            ) : (
                                <div className="space-y-3">
                                    {securityLogs.map(log => (
                                        <div key={log.id} className={`border p-3 rounded-2xl transition ${ts.tableRow}`}>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`font-bold ${ts.header}`}>{log.title}</span>
                                                {getSeverityBadge(log.severity)}
                                            </div>
                                            <p className={`text-xs line-clamp-1 mb-2 ${ts.textSecondary}`}>{log.content}</p>
                                            <div className={`flex justify-between items-center text-[10px] ${ts.textSecondary}`}>
                                                <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                                                <span>{log.reportedBy}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* === BULLETIN TAB === */}
            {activeTab === 'bulletin' && (
                <div className={`rounded-[2.5rem] shadow-sm border p-10 text-center animate-fade-in ${ts.card}`}>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${ts.badgeInfo}`}>
                        <Lock size={40}/>
                    </div>
                    <h3 className={`text-2xl font-black mb-2 ${ts.header}`}>النشرة الأمنية الموحدة</h3>
                    <p className={`max-w-lg mx-auto mb-8 ${ts.textSecondary}`}>
                        لا توجد تعاميم جديدة من المصالح الأمنية لليوم.
                        يرجى مراجعة التحديثات بانتظام لضمان سلامة المنشأة.
                    </p>
                    <div className="flex justify-center gap-4">
                        <div className={`px-6 py-4 rounded-2xl border text-left ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] border-[#cca43b]/20' : 'bg-gray-50'}`}>
                            <span className={`block text-xs font-bold uppercase ${ts.textSecondary}`}>رقم الشرطة</span>
                            <span className={`text-xl font-black ${ts.header}`}>1548</span>
                        </div>
                        <div className={`px-6 py-4 rounded-2xl border text-left ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] border-[#cca43b]/20' : 'bg-gray-50'}`}>
                            <span className={`block text-xs font-bold uppercase ${ts.textSecondary}`}>الحماية المدنية</span>
                            <span className={`text-xl font-black ${ts.header}`}>14</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
