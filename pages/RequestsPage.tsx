
import React, { useState, useMemo } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { 
    BellRing, CheckCircle2, Clock, Filter, Check, X, User, 
    MapPin, MessageSquare, ArrowRight, Loader2, Inbox
} from 'lucide-react';
import { ServiceRequest, AppSettings, ServiceItem } from '../types';

// Standalone Component for Performance
const RequestCard: React.FC<{ 
    req: ServiceRequest; 
    settings: AppSettings;
    guestServices: ServiceItem[];
    onUpdateStatus: (id: string, status: ServiceRequest['status']) => void;
}> = ({ req, settings, guestServices, onUpdateStatus }) => {
    
    // --- Theme Logic (Localized for Component) ---
    const getThemeStyles = () => {
        switch(settings.theme) {
            case 'zellige': return {
                card: 'bg-[#FDFBF7] border-2 border-[#cca43b]/20 hover:border-[#006269]',
                badge: 'bg-[#cca43b]/10 text-[#006269] border-[#cca43b]/30',
            };
            case 'zellige-v2': return {
                card: 'bg-[#f5fcf9] border-2 border-[#c6e3d8] hover:border-[#024d38]',
                badge: 'bg-[#c6e3d8]/30 text-[#024d38] border-[#c6e3d8]',
            };
            default: return {
                card: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
                badge: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
            };
        }
    };
    const ts = getThemeStyles();

    const getServiceLabel = (id: string) => {
        const service = guestServices.find(s => s.id === id);
        return service ? service.labelAr : 'خدمة غير معروفة';
    };

    const isPending = req.status === 'pending';
    const isProcessing = req.status === 'processing';
    
    return (
        <div className={`p-5 rounded-2xl shadow-sm transition-all duration-300 relative group animate-fade-in ${ts.card}`}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${ts.badge}`}>
                        {req.locationType === 'room' ? 'غرفة' : 'موقع'}
                    </span>
                    <h4 className="font-black text-lg text-gray-800 dark:text-gray-100">{req.locationId}</h4>
                </div>
                <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                    <Clock size={10} /> {new Date(req.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
            </div>

            <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                <BellRing size={16} className={isPending ? 'text-red-500 animate-pulse' : 'text-blue-500'} />
                {getServiceLabel(req.serviceId)}
            </h3>

            {req.notes && (
                <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl mb-4 text-xs font-medium text-gray-600 dark:text-gray-300 flex items-start gap-2">
                    <MessageSquare size={14} className="shrink-0 mt-0.5 opacity-50"/>
                    "{req.notes}"
                </div>
            )}

            <div className="flex gap-2 mt-2">
                {isPending && (
                    <button 
                        onClick={() => onUpdateStatus(req.id, 'processing')}
                        className="flex-1 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                        <Loader2 size={14} className="animate-spin"/> بدء التنفيذ
                    </button>
                )}
                {(isPending || isProcessing) && (
                    <button 
                        onClick={() => onUpdateStatus(req.id, 'completed')}
                        className="flex-1 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 size={14}/> إكمال
                    </button>
                )}
                {req.status === 'completed' && (
                    <div className="w-full py-2 bg-gray-50 text-gray-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                        <Check size={14}/> تم الإنجاز
                    </div>
                )}
            </div>
            
            {/* Visual Status Indicator Line */}
            <div className={`absolute top-4 left-0 w-1 h-8 rounded-r-full ${
                req.status === 'pending' ? 'bg-red-500' : 
                req.status === 'processing' ? 'bg-blue-500' : 'bg-green-500'
            }`}></div>
        </div>
    );
};

export const RequestsPage: React.FC = () => {
    const { serviceRequests, updateServiceRequestStatus, guestServices, settings } = useHotel();
    const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed'>('all');

    // --- Page Level Theme Styles ---
    const getPageStyles = () => {
        switch(settings.theme) {
            case 'zellige': return {
                columnHeader: 'text-[#006269]',
                activeFilter: 'bg-[#006269] text-[#cca43b]',
            };
            case 'zellige-v2': return {
                columnHeader: 'text-[#024d38]',
                activeFilter: 'bg-[#024d38] text-white',
            };
            default: return {
                columnHeader: 'text-gray-700 dark:text-gray-200',
                activeFilter: 'bg-blue-600 text-white',
            };
        }
    };
    const ps = getPageStyles();

    const filteredRequests = useMemo(() => {
        if (filter === 'all') return serviceRequests;
        return serviceRequests.filter(req => req.status === filter);
    }, [serviceRequests, filter]);

    return (
        <div className="space-y-8 pb-20 animate-fade-in">
            <PageHeader pageKey="requests" defaultTitle="سجل طلبات النزلاء" icon={Inbox} />

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-[2rem] border border-red-100 dark:border-red-900 text-center">
                    <span className="block text-3xl font-black text-red-500 mb-1">{serviceRequests.filter(r => r.status === 'pending').length}</span>
                    <span className="text-xs font-bold text-red-400 uppercase">قيد الانتظار</span>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-[2rem] border border-blue-100 dark:border-blue-900 text-center">
                    <span className="block text-3xl font-black text-blue-500 mb-1">{serviceRequests.filter(r => r.status === 'processing').length}</span>
                    <span className="text-xs font-bold text-blue-400 uppercase">جاري التنفيذ</span>
                </div>
                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-[2rem] border border-green-100 dark:border-green-900 text-center">
                    <span className="block text-3xl font-black text-green-500 mb-1">{serviceRequests.filter(r => r.status === 'completed').length}</span>
                    <span className="text-xs font-bold text-green-400 uppercase">مكتملة</span>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex justify-center">
                <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl flex shadow-inner">
                    {[
                        { id: 'all', label: 'الكل' },
                        { id: 'pending', label: 'انتظار' },
                        { id: 'processing', label: 'جاري' },
                        { id: 'completed', label: 'مكتمل' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id as any)}
                            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                                filter === tab.id 
                                ? `${ps.activeFilter} shadow-sm` 
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Kanban / List View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Column: Pending */}
                {(filter === 'all' || filter === 'pending') && (
                    <div className="space-y-4">
                        <h3 className={`font-black text-sm uppercase tracking-wider flex items-center gap-2 mb-4 ${ps.columnHeader}`}>
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> قيد الانتظار
                        </h3>
                        {serviceRequests.filter(r => r.status === 'pending').map(req => (
                            <RequestCard 
                                key={req.id} 
                                req={req} 
                                settings={settings} 
                                guestServices={guestServices} 
                                onUpdateStatus={updateServiceRequestStatus} 
                            />
                        ))}
                        {serviceRequests.filter(r => r.status === 'pending').length === 0 && (
                            <div className="text-center py-10 opacity-40 border-2 border-dashed rounded-3xl border-gray-200">
                                <CheckCircle2 size={32} className="mx-auto mb-2"/>
                                <p className="text-xs font-bold">لا توجد طلبات جديدة</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Column: Processing */}
                {(filter === 'all' || filter === 'processing') && (
                    <div className="space-y-4">
                        <h3 className={`font-black text-sm uppercase tracking-wider flex items-center gap-2 mb-4 ${ps.columnHeader}`}>
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div> جاري التنفيذ
                        </h3>
                        {serviceRequests.filter(r => r.status === 'processing').map(req => (
                            <RequestCard 
                                key={req.id} 
                                req={req} 
                                settings={settings} 
                                guestServices={guestServices} 
                                onUpdateStatus={updateServiceRequestStatus} 
                            />
                        ))}
                         {serviceRequests.filter(r => r.status === 'processing').length === 0 && (
                            <div className="text-center py-10 opacity-40 border-2 border-dashed rounded-3xl border-gray-200">
                                <Clock size={32} className="mx-auto mb-2"/>
                                <p className="text-xs font-bold">لا توجد مهام جارية</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Column: Completed */}
                {(filter === 'all' || filter === 'completed') && (
                    <div className="space-y-4">
                        <h3 className={`font-black text-sm uppercase tracking-wider flex items-center gap-2 mb-4 ${ps.columnHeader}`}>
                            <div className="w-2 h-2 rounded-full bg-green-500"></div> المكتملة
                        </h3>
                        {serviceRequests.filter(r => r.status === 'completed').slice(0, 10).map(req => (
                            <RequestCard 
                                key={req.id} 
                                req={req} 
                                settings={settings} 
                                guestServices={guestServices} 
                                onUpdateStatus={updateServiceRequestStatus} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
