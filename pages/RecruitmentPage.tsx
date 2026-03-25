import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { 
    Briefcase, Users, Plus, Search, Filter, MapPin, Clock, DollarSign, 
    FileText, CheckCircle, XCircle, AlertCircle, ChevronRight, Star, Mail, Phone
} from 'lucide-react';
import { JobOpening, JobApplication, Department } from '../types';

export const RecruitmentPage: React.FC = () => {
    const { 
        jobOpenings, jobApplications, addJobOpening, updateJobOpening, 
        addJobApplication, updateJobApplicationStatus, settings 
    } = useHotel();
    
    const [activeTab, setActiveTab] = useState<'openings' | 'applications'>('openings');
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);
    const [isAppModalOpen, setIsAppModalOpen] = useState(false);
    
    // New Job Form State
    const [newJob, setNewJob] = useState<Omit<JobOpening, 'id' | 'postedDate' | 'status'>>({
        title: '',
        department: 'reception',
        type: 'full_time',
        description: '',
        requirements: [],
        salaryRange: ''
    });

    // New Application Form State
    const [newApp, setNewApp] = useState<Omit<JobApplication, 'id' | 'appliedDate' | 'status'>>({
        jobId: '',
        candidateName: '',
        email: '',
        phone: '',
        notes: ''
    });

    const handleAddJob = () => {
        addJobOpening(newJob);
        setIsJobModalOpen(false);
        setNewJob({
            title: '',
            department: 'reception',
            type: 'full_time',
            description: '',
            requirements: [],
            salaryRange: ''
        });
    };

    const handleAddApp = () => {
        addJobApplication(newApp);
        setIsAppModalOpen(false);
        setNewApp({
            jobId: '',
            candidateName: '',
            email: '',
            phone: '',
            notes: ''
        });
    };

    return (
        <div className="p-6 space-y-6 pb-24 animate-fade-in">
            <PageHeader 
                title="التوظيف والموارد البشرية" 
                subtitle="إدارة الشواغر الوظيفية وطلبات التوظيف"
                icon={Briefcase}
            />

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 pb-1">
                <button 
                    onClick={() => setActiveTab('openings')}
                    className={`pb-3 px-4 text-sm font-bold transition-colors relative ${activeTab === 'openings' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    الشواغر الوظيفية
                    {activeTab === 'openings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('applications')}
                    className={`pb-3 px-4 text-sm font-bold transition-colors relative ${activeTab === 'applications' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    طلبات التوظيف
                    {activeTab === 'applications' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                </button>
            </div>

            {/* Content */}
            {activeTab === 'openings' ? (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg">الوظائف المتاحة حالياً</h3>
                        <button 
                            onClick={() => setIsJobModalOpen(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition shadow-lg"
                        >
                            <Plus size={18} /> إضافة وظيفة جديدة
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {jobOpenings.map(job => (
                            <div key={job.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {job.status === 'open' ? 'متاح' : 'مغلق'}
                                    </span>
                                    <span className="text-xs text-gray-400">{new Date(job.postedDate).toLocaleDateString('ar-EG')}</span>
                                </div>
                                <h4 className="font-bold text-lg mb-1">{job.title}</h4>
                                <p className="text-xs font-bold text-blue-600 mb-4">{job.department}</p>
                                
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock size={14}/> {job.type === 'full_time' ? 'دوام كامل' : 'دوام جزئي'}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <DollarSign size={14}/> {job.salaryRange || 'راتب تنافسي'}
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <button 
                                        onClick={() => updateJobOpening(job.id, { status: job.status === 'open' ? 'closed' : 'open' })}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold ${job.status === 'open' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                    >
                                        {job.status === 'open' ? 'إغلاق الوظيفة' : 'إعادة فتح'}
                                    </button>
                                    <button className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200">
                                        تعديل
                                    </button>
                                </div>
                            </div>
                        ))}
                        {jobOpenings.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-400">
                                <Briefcase size={48} className="mx-auto mb-4 opacity-20"/>
                                <p>لا توجد وظائف متاحة حالياً</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg">طلبات التوظيف المستلمة</h3>
                        <button 
                            onClick={() => setIsAppModalOpen(true)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-purple-700 transition shadow-lg"
                        >
                            <Plus size={18} /> تسجيل طلب يدوي
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-4">المرشح</th>
                                    <th className="px-6 py-4">الوظيفة</th>
                                    <th className="px-6 py-4">تاريخ التقديم</th>
                                    <th className="px-6 py-4">الحالة</th>
                                    <th className="px-6 py-4">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {jobApplications.map(app => {
                                    const job = jobOpenings.find(j => j.id === app.jobId);
                                    return (
                                        <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-sm">{app.candidateName}</div>
                                                <div className="text-xs text-gray-400 flex gap-2 mt-1">
                                                    <span className="flex items-center gap-1"><Mail size={10}/> {app.email}</span>
                                                    <span className="flex items-center gap-1"><Phone size={10}/> {app.phone}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium">{job?.title || 'غير محدد'}</span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500">
                                                {new Date(app.appliedDate).toLocaleDateString('ar-EG')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <select 
                                                    value={app.status}
                                                    onChange={(e) => updateJobApplicationStatus(app.id, e.target.value as any)}
                                                    className={`text-xs font-bold px-2 py-1 rounded-lg border-0 outline-none cursor-pointer ${
                                                        app.status === 'hired' ? 'bg-green-100 text-green-700' :
                                                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        app.status === 'offer' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}
                                                >
                                                    <option value="received">تم الاستلام</option>
                                                    <option value="screening">فرز</option>
                                                    <option value="interview">مقابلة</option>
                                                    <option value="offer">عرض عمل</option>
                                                    <option value="hired">تم التعيين</option>
                                                    <option value="rejected">رفض</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-gray-400 hover:text-blue-600 transition">
                                                    <FileText size={18}/>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {jobApplications.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-gray-400 text-sm">لا توجد طلبات توظيف حالياً</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Job Modal */}
            {isJobModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-scale-in">
                        <h3 className="text-xl font-bold mb-4">إضافة وظيفة جديدة</h3>
                        <div className="space-y-4">
                            <input 
                                type="text" 
                                placeholder="عنوان الوظيفة" 
                                className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                                value={newJob.title}
                                onChange={e => setNewJob({...newJob, title: e.target.value})}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <select 
                                    className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                                    value={newJob.department}
                                    onChange={e => setNewJob({...newJob, department: e.target.value as any})}
                                >
                                    <option value="reception">الاستقبال</option>
                                    <option value="housekeeping">التنظيف</option>
                                    <option value="food_beverage">المطعم</option>
                                    <option value="security">الأمن</option>
                                    <option value="administration">الإدارة</option>
                                </select>
                                <select 
                                    className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                                    value={newJob.type}
                                    onChange={e => setNewJob({...newJob, type: e.target.value as any})}
                                >
                                    <option value="full_time">دوام كامل</option>
                                    <option value="part_time">دوام جزئي</option>
                                    <option value="contract">عقد</option>
                                    <option value="internship">تدريب</option>
                                </select>
                            </div>
                            <input 
                                type="text" 
                                placeholder="نطاق الراتب (اختياري)" 
                                className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                                value={newJob.salaryRange}
                                onChange={e => setNewJob({...newJob, salaryRange: e.target.value})}
                            />
                            <textarea 
                                placeholder="وصف الوظيفة" 
                                className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:border-gray-700 h-32"
                                value={newJob.description}
                                onChange={e => setNewJob({...newJob, description: e.target.value})}
                            ></textarea>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setIsJobModalOpen(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl font-bold">إلغاء</button>
                                <button onClick={handleAddJob} className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg">نشر الوظيفة</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Application Modal */}
            {isAppModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-scale-in">
                        <h3 className="text-xl font-bold mb-4">تسجيل طلب توظيف</h3>
                        <div className="space-y-4">
                            <select 
                                className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                                value={newApp.jobId}
                                onChange={e => setNewApp({...newApp, jobId: e.target.value})}
                            >
                                <option value="">اختر الوظيفة...</option>
                                {jobOpenings.filter(j => j.status === 'open').map(j => (
                                    <option key={j.id} value={j.id}>{j.title}</option>
                                ))}
                            </select>
                            <input 
                                type="text" 
                                placeholder="اسم المرشح" 
                                className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                                value={newApp.candidateName}
                                onChange={e => setNewApp({...newApp, candidateName: e.target.value})}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    type="email" 
                                    placeholder="البريد الإلكتروني" 
                                    className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                                    value={newApp.email}
                                    onChange={e => setNewApp({...newApp, email: e.target.value})}
                                />
                                <input 
                                    type="tel" 
                                    placeholder="رقم الهاتف" 
                                    className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                                    value={newApp.phone}
                                    onChange={e => setNewApp({...newApp, phone: e.target.value})}
                                />
                            </div>
                            <textarea 
                                placeholder="ملاحظات إضافية" 
                                className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:border-gray-700 h-24"
                                value={newApp.notes}
                                onChange={e => setNewApp({...newApp, notes: e.target.value})}
                            ></textarea>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setIsAppModalOpen(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl font-bold">إلغاء</button>
                                <button onClick={handleAddApp} className="flex-[2] py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg">حفظ الطلب</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
