
import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { 
    ShieldCheck, Activity, MapPin, AlertTriangle, Users, Search, 
    ScanBarcode, RotateCcw, Lock, CheckCircle, XCircle, Printer 
} from 'lucide-react';
import { QRCurrentState } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { renderToStaticMarkup } from 'react-dom/server';
import { printDocument } from '../utils/print';

export const QRMonitoringPage: React.FC = () => {
    const { qrRecords, qrLogs, resetQRState, settings, currentUser } = useHotel();
    const [filter, setFilter] = useState<'all' | 'active' | 'blocked' | 'consumed'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    if (currentUser?.role !== 'manager' && currentUser?.role !== 'assistant_manager' && currentUser?.department !== 'security') {
        return <div className="p-10 text-center text-red-500 font-bold">وصول غير مصرح به</div>;
    }

    const activeSessions = qrRecords.filter(r => r.currentState === 'active_session');
    const blockedRecords = qrRecords.filter(r => r.currentState === 'blocked');
    const totalScansToday = qrLogs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length;

    const filteredRecords = qrRecords.filter(record => {
        if (filter !== 'all' && record.currentState !== filter) return false;
        if (searchTerm && !record.guestName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    // Style Helpers
    const getThemeStyles = () => {
        if (settings.darkMode) {
            if (settings.theme === 'zellige') {
                return {
                    bg: 'bg-[#001517]',
                    card: 'bg-[#001e21] border-[#cca43b]/30 text-[#cca43b]',
                    header: 'text-[#cca43b]',
                    input: 'bg-[#001517] border-[#cca43b]/30 text-[#cca43b] placeholder-[#cca43b]/40 focus:border-[#cca43b]',
                    select: 'bg-[#001517] border-[#cca43b]/30 text-[#cca43b] focus:border-[#cca43b]',
                    button: 'bg-[#cca43b] text-[#001e21] hover:bg-[#b08d30]',
                    buttonSecondary: 'bg-[#002a2d] text-[#cca43b] border-[#cca43b]/30 hover:bg-[#cca43b]/10',
                    listItem: 'bg-[#002a2d] border-[#cca43b]/20 hover:bg-[#cca43b]/5',
                    listItemBlocked: 'bg-red-900/20 border-red-800/50',
                    textSecondary: 'text-[#cca43b]/60',
                    badgeSuccess: 'bg-green-900/30 text-green-400 border border-green-800',
                    badgeError: 'bg-red-900/30 text-red-400 border border-red-800',
                    badgeWarning: 'bg-orange-900/30 text-orange-400 border border-orange-800',
                    badgeInfo: 'bg-blue-900/30 text-blue-400 border border-blue-800',
                    badgePurple: 'bg-purple-900/30 text-purple-400 border border-purple-800',
                    liveFeedBg: 'bg-[#001e21] text-[#cca43b] border-[#cca43b]/30'
                };
            }
            return {
                bg: 'bg-gray-900',
                card: 'bg-gray-800 border-gray-700 text-white',
                header: 'text-white',
                input: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400',
                select: 'bg-gray-700 border-gray-600 text-white',
                button: 'bg-blue-600 text-white hover:bg-blue-700',
                buttonSecondary: 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600',
                listItem: 'bg-gray-700/50 border-gray-700 hover:bg-gray-700',
                listItemBlocked: 'bg-red-900/20 border-red-800/50',
                textSecondary: 'text-gray-400',
                badgeSuccess: 'bg-green-900/30 text-green-400',
                badgeError: 'bg-red-900/30 text-red-400',
                badgeWarning: 'bg-orange-900/30 text-orange-400',
                badgeInfo: 'bg-blue-900/30 text-blue-400',
                badgePurple: 'bg-purple-900/30 text-purple-400',
                liveFeedBg: 'bg-gray-900 text-white'
            };
        }

        if (settings.theme === 'zellige') {
            return {
                bg: 'bg-[#FDFBF7]',
                card: 'bg-white border-[#cca43b]/20 text-[#006269]',
                header: 'text-[#006269]',
                input: 'bg-[#fbf8f1] border-[#cca43b]/30 text-[#006269] placeholder-[#006269]/40 focus:border-[#006269]',
                select: 'bg-[#fbf8f1] border-[#cca43b]/30 text-[#006269] focus:border-[#006269]',
                button: 'bg-[#006269] text-[#cca43b] hover:bg-[#004d53]',
                buttonSecondary: 'bg-white text-[#006269] border-[#cca43b]/30 hover:bg-[#fbf8f1]',
                listItem: 'bg-white border-[#cca43b]/10 hover:bg-[#fbf8f1]',
                listItemBlocked: 'bg-red-50 border-red-200',
                textSecondary: 'text-[#006269]/60',
                badgeSuccess: 'bg-green-100 text-green-700',
                badgeError: 'bg-red-100 text-red-700',
                badgeWarning: 'bg-orange-100 text-orange-700',
                badgeInfo: 'bg-blue-100 text-blue-700',
                badgePurple: 'bg-purple-100 text-purple-700',
                liveFeedBg: 'bg-[#002a2d] text-[#cca43b]'
            };
        }

        return {
            bg: 'bg-gray-50',
            card: 'bg-white border-gray-200 text-gray-900',
            header: 'text-blue-900',
            input: 'bg-white border-gray-200 text-gray-900 placeholder-gray-400',
            select: 'bg-white border-gray-200 text-gray-900',
            button: 'bg-blue-600 text-white hover:bg-blue-700',
            buttonSecondary: 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100',
            listItem: 'bg-white border-gray-100 hover:bg-gray-50',
            listItemBlocked: 'bg-red-50 border-red-200',
            textSecondary: 'text-gray-500',
            badgeSuccess: 'bg-green-100 text-green-700',
            badgeError: 'bg-red-100 text-red-700',
            badgeWarning: 'bg-orange-100 text-orange-700',
            badgeInfo: 'bg-blue-100 text-blue-700',
            badgePurple: 'bg-purple-100 text-purple-600',
            liveFeedBg: 'bg-gray-900 text-white'
        };
    };

    const ts = getThemeStyles();

    const getStatusBadge = (state: QRCurrentState) => {
        switch(state) {
            case 'active_session': return <span className={`px-2 py-1 rounded text-xs font-bold animate-pulse ${ts.badgeSuccess}`}>نشط (بالداخل)</span>;
            case 'blocked': return <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${ts.badgeError}`}><Lock size={10}/> محظور</span>;
            case 'consumed': return <span className={`px-2 py-1 rounded text-xs font-bold ${ts.badgeWarning}`}>مستهلك</span>;
            case 'fresh': return <span className={`px-2 py-1 rounded text-xs font-bold ${ts.badgeInfo}`}>جديد</span>;
            default: return <span className={`px-2 py-1 rounded text-xs font-bold ${ts.textSecondary}`}>{state}</span>;
        }
    };

    return (
        <div className="space-y-6 pb-20 animate-fade-in">
            <PageHeader pageKey="qr_monitor" defaultTitle="الحارس الرقمي (مراقبة التذاكر)" icon={ShieldCheck} />

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-[2.5rem] shadow-sm border ${ts.card} ${settings.darkMode && settings.theme === 'zellige' ? 'border-green-900/50' : 'border-green-100 dark:border-green-900/30'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className={`text-xs font-bold uppercase mb-1 ${ts.textSecondary}`}>المتواجدون حالياً</p>
                            <h3 className="text-4xl font-black text-green-600">{activeSessions.length}</h3>
                        </div>
                        <div className={`p-3 rounded-2xl ${ts.badgeSuccess}`}><Users size={24}/></div>
                    </div>
                    <div className={`mt-4 text-xs font-bold ${ts.textSecondary}`}>تذاكر "دخول" نشطة</div>
                </div>

                <div className={`p-6 rounded-[2.5rem] shadow-sm border ${ts.card} ${settings.darkMode && settings.theme === 'zellige' ? 'border-red-900/50' : 'border-red-100 dark:border-red-900/30'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className={`text-xs font-bold uppercase mb-1 ${ts.textSecondary}`}>تنبيهات الاحتيال</p>
                            <h3 className="text-4xl font-black text-red-600">{blockedRecords.length}</h3>
                        </div>
                        <div className={`p-3 rounded-2xl ${ts.badgeError}`}><AlertTriangle size={24}/></div>
                    </div>
                    <div className={`mt-4 text-xs font-bold ${ts.textSecondary}`}>رموز محظورة بسبب التكرار</div>
                </div>

                <div className={`p-6 rounded-[2.5rem] shadow-sm border ${ts.card} ${settings.darkMode && settings.theme === 'zellige' ? 'border-blue-900/50' : 'border-blue-100 dark:border-blue-900/30'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className={`text-xs font-bold uppercase mb-1 ${ts.textSecondary}`}>نشاط اليوم</p>
                            <h3 className="text-4xl font-black text-blue-600">{totalScansToday}</h3>
                        </div>
                        <div className={`p-3 rounded-2xl ${ts.badgeInfo}`}><Activity size={24}/></div>
                    </div>
                    <div className={`mt-4 text-xs font-bold ${ts.textSecondary}`}>عملية مسح ضوئي</div>
                </div>
            </div>

            {/* Live Monitor Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Active List */}
                <div className={`lg:col-span-2 rounded-[2.5rem] shadow-sm border overflow-hidden flex flex-col h-[600px] ${ts.card}`}>
                    <div className={`p-6 border-b flex justify-between items-center ${settings.darkMode && settings.theme === 'zellige' ? 'bg-[#002a2d] border-[#cca43b]/20' : 'bg-gray-50/50 border-gray-100 dark:border-gray-700'}`}>
                        <h3 className={`font-black text-lg flex items-center gap-2 ${ts.header}`}><ScanBarcode /> سجل الرموز الحية</h3>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="بحث..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className={`border-none rounded-xl px-3 py-1.5 text-xs font-bold shadow-sm outline-none ${ts.input}`}
                            />
                            <select 
                                value={filter} 
                                onChange={e => setFilter(e.target.value as any)}
                                className={`border-none rounded-xl px-3 py-1.5 text-xs font-bold shadow-sm outline-none cursor-pointer ${ts.select}`}
                            >
                                <option value="all">الكل</option>
                                <option value="active">نشط (بالداخل)</option>
                                <option value="blocked">محظور</option>
                                <option value="consumed">مستهلك</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {filteredRecords.length === 0 ? (
                            <div className={`text-center py-20 opacity-50 ${ts.textSecondary}`}>
                                <Search size={48} className="mx-auto mb-2 opacity-20"/>
                                <p className="font-bold">لا توجد سجلات مطابقة</p>
                            </div>
                        ) : (
                            filteredRecords.map(record => (
                                <div key={record.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition ${record.currentState === 'blocked' ? ts.listItemBlocked : ts.listItem}`}>
                                    <div className={`p-3 rounded-xl shadow-sm ${record.usageType === 'access_pass' ? ts.badgePurple : ts.badgeInfo}`}>
                                        {record.usageType === 'access_pass' ? <Lock size={20}/> : <CheckCircle size={20}/>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between">
                                            <h4 className={`font-bold truncate ${ts.header}`}>{record.title}</h4>
                                            {getStatusBadge(record.currentState)}
                                        </div>
                                        <p className={`text-xs truncate ${ts.textSecondary}`}>{record.subtitle} • REF: {record.referenceId}</p>
                                        <div className={`flex items-center gap-3 mt-2 text-[10px] font-bold ${ts.textSecondary}`}>
                                            <span className="flex items-center gap-1"><Activity size={10}/> مسح: {record.scannedCount}</span>
                                            {record.lastScanLocation && (
                                                <span className="flex items-center gap-1 text-blue-500"><MapPin size={10}/> {record.lastScanLocation}</span>
                                            )}
                                            {record.lastScanTime && (
                                                <span>{new Date(record.lastScanTime).toLocaleTimeString()}</span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Action for Manager: Reset State & Print */}
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => {
                                                printDocument({
                                                    title: record.title,
                                                    content: `
                                                        <div style="text-align:center;">
                                                            <h1>${record.title}</h1>
                                                            <p>${record.subtitle}</p>
                                                            <div style="margin: 20px auto; display: inline-block;">
                                                                ${renderToStaticMarkup(<QRCodeSVG value={record.token} size={256} level="H" includeMargin={true} />)}
                                                            </div>
                                                        </div>
                                                    `,
                                                    settings
                                                });
                                            }}
                                            className={`p-2 rounded-xl border shadow-sm ${ts.buttonSecondary}`}
                                            title="طباعة الرمز"
                                        >
                                            <Printer size={16}/>
                                        </button>
                                        {(record.currentState === 'blocked' || record.currentState === 'active_session') && (
                                            <button 
                                                onClick={() => { if(window.confirm('هل أنت متأكد من إعادة تعيين حالة هذا الرمز يدوياً؟')) resetQRState(record.id); }}
                                                className={`p-2 rounded-xl border shadow-sm ${ts.buttonSecondary}`}
                                                title="إعادة تعيين الحالة (فك الحظر/خروج قسري)"
                                            >
                                                <RotateCcw size={16}/>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Scan Logs Feed */}
                <div className={`rounded-[2.5rem] shadow-xl p-6 flex flex-col h-[600px] relative overflow-hidden ${ts.liveFeedBg}`}>
                    <h3 className="font-black text-lg mb-6 flex items-center gap-2 relative z-10"><Activity className="text-green-400"/> البث الحي (Live Feed)</h3>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar relative z-10 pr-2">
                        {qrLogs.slice(0, 20).map(log => (
                            <div key={log.id} className={`flex gap-3 text-xs border-b pb-3 last:border-0 ${settings.darkMode && settings.theme === 'zellige' ? 'border-[#cca43b]/20' : 'border-gray-800'}`}>
                                <div className={`mt-1 ${log.result === 'success' ? 'text-green-400' : log.result === 'fraud_alert' ? 'text-red-500' : 'text-orange-400'}`}>
                                    {log.result === 'success' ? <CheckCircle size={14}/> : log.result === 'fraud_alert' ? <AlertTriangle size={14}/> : <XCircle size={14}/>}
                                </div>
                                <div>
                                    <p className="font-bold opacity-90">{log.message}</p>
                                    <div className="flex gap-2 opacity-50 mt-1">
                                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                                        <span>•</span>
                                        <span>{log.location}</span>
                                    </div>
                                    {log.result === 'fraud_alert' && (
                                        <span className="inline-block mt-1 bg-red-900/50 text-red-200 px-2 py-0.5 rounded text-[10px] border border-red-800">تنبيه أمني</span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {qrLogs.length === 0 && <p className="text-center opacity-30 mt-20">بانتظار عمليات المسح...</p>}
                    </div>

                    {/* Matrix Effect Background */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                </div>
            </div>
        </div>
    );
};
