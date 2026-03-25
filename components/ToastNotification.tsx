
import React from 'react';
import { CheckCircle, AlertOctagon, AlertTriangle, Info } from 'lucide-react';
import { AppTheme, Notification, AppSettings } from '../types';
import { getThemeStyles } from '../utils/themeStyles';

interface ToastNotificationProps {
    notification: Notification;
    onClose: () => void;
    onClick: () => void;
    onDelete: () => void;
    theme: AppTheme;
    settings: AppSettings;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ 
    notification, 
    onClose, 
    onClick, 
    onDelete, 
    theme, 
    settings 
}) => {
    const ts = getThemeStyles(settings);
    
    const getStatusStyles = () => {
        switch (notification.type) {
            case 'success': return { icon: <CheckCircle size={24} />, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' };
            case 'error': return { icon: <AlertOctagon size={24} />, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' };
            case 'warning': return { icon: <AlertTriangle size={24} />, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' };
            default: return { icon: <Info size={24} />, color: ts.text, bg: `${ts.iconBox.split(' ')[0]}`, border: ts.card.split(' ').find(c => c.startsWith('border-')) || 'border-gray-200' };
        }
    };
    
    const status = getStatusStyles();
    
    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[150] animate-fade-in-up w-[95%] max-w-md">
            <div className={`rounded-[2rem] p-5 flex flex-col gap-3 relative overflow-hidden border-2 ${ts.card} shadow-2xl`}>
                <div className="flex items-start gap-4 relative z-10">
                    <div className={`p-3 rounded-2xl shrink-0 ${status.bg} ${status.color} shadow-sm`}>{status.icon}</div>
                    <div className="flex-1 pt-1">
                        <p className={`font-black text-base leading-tight ${ts.text}`}>{notification.message}</p>
                        {notification.details && <p className={`text-xs mt-1.5 font-medium leading-relaxed line-clamp-2 ${ts.textMuted}`}>{notification.details}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-2 pt-3 border-t border-black/5 relative z-10">
                    <button onClick={onClick} className={`flex-1 py-2.5 rounded-xl font-bold text-sm shadow-sm ${ts.button} flex items-center justify-center gap-2`}>
                        {notification.actionLabel || 'عرض'}
                    </button>
                    <button onClick={onClose} className={`flex-1 py-2.5 rounded-xl font-bold text-sm ${ts.buttonSecondary} flex items-center justify-center gap-2`}>تأجيل</button>
                </div>
            </div>
        </div>
    );
};
