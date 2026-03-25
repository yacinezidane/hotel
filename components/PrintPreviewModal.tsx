
import React, { useState, useMemo } from 'react';
import { Modal } from './Modal';
import { Printer, Layout, Check } from 'lucide-react';
import { useHotel } from '../context/HotelContext';
import { QRCodeSVG } from 'qrcode.react';
import { printDocument } from '../utils/print';

interface PrintPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: React.ReactNode; // The content to print (React Node)
    htmlContent?: string; // Optional raw HTML for printing
    onPrint?: () => void;
    qrCodeValue?: string; // Optional QR code value
    variants?: string[];
    activeVariant?: string;
    onVariantChange?: (variant: any) => void;
    data?: Record<string, any>; // Data for placeholder replacement
    templateType?: 'invoice' | 'booking' | 'pool_pass' | 'staff_id' | 'other';
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ 
    isOpen, 
    onClose, 
    title, 
    content, 
    htmlContent, 
    onPrint, 
    qrCodeValue,
    variants,
    activeVariant,
    onVariantChange,
    data = {},
    templateType
}) => {
    const { settings } = useHotel();
    const [showVariants, setShowVariants] = useState(false);

    const customTemplates = useMemo(() => {
        const all = (settings.customPrintTemplates || []);
        if (templateType) {
            return all.filter(t => t.type === templateType);
        }
        return all;
    }, [settings.customPrintTemplates, templateType]);

    const activeCustomTemplate = useMemo(() => {
        return customTemplates.find(t => t.id === activeVariant);
    }, [customTemplates, activeVariant]);

    const replacePlaceholders = (text: string) => {
        let result = text
            .replace(/{{hotelName}}/g, settings.appName)
            .replace(/{{hotelAddress}}/g, settings.hotelAddress)
            .replace(/{{hotelPhone}}/g, settings.hotelPhone)
            .replace(/{{footerText}}/g, settings.invoiceFooterText || settings.printConfig.customFooterText || 'شكراً لتعاملكم معنا')
            .replace(/{{date}}/g, new Date().toLocaleDateString('ar-DZ'));

        // Replace dynamic data
        Object.entries(data).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            result = result.replace(regex, value?.toString() || '');
        });

        return result;
    };

    const handlePrint = () => {
        if (onPrint) {
            onPrint();
            return;
        }

        const finalContent = activeCustomTemplate 
            ? replacePlaceholders(activeCustomTemplate.content)
            : (htmlContent || content || '');

        printDocument({
            title,
            content: finalContent,
            qrCodeValue,
            settings,
            isCustomTemplate: !!activeCustomTemplate
        });
    };

    const isZellige = settings.theme.startsWith('zellige') || settings.theme.startsWith('ceramic');
    const isDark = settings.darkMode;

    const getButtonStyles = () => {
        if (settings.theme === 'ceramic-talavera') {
            return {
                cancel: isDark ? 'bg-[#0f172a] text-[#f59e0b] hover:bg-[#f59e0b]/10 border border-[#f59e0b]/30' : 'bg-[#fffbeb] text-[#1e3a8a] hover:bg-[#1e3a8a]/10 border border-[#f59e0b]/20',
                print: isDark ? 'bg-[#f59e0b] text-[#1e3a8a] hover:bg-[#d97706]' : 'bg-[#1e3a8a] text-[#f59e0b] hover:bg-[#1e40af]'
            };
        }
        if (settings.theme === 'ceramic-majolica') {
            return {
                cancel: isDark ? 'bg-[#052e16] text-[#facc15] hover:bg-[#facc15]/10 border border-[#facc15]/30' : 'bg-[#fefce8] text-[#15803d] hover:bg-[#15803d]/10 border border-[#facc15]/20',
                print: isDark ? 'bg-[#facc15] text-[#15803d] hover:bg-[#ca8a04]' : 'bg-[#15803d] text-[#facc15] hover:bg-[#166534]'
            };
        }
        if (settings.theme === 'ceramic-delft') {
            return {
                cancel: isDark ? 'bg-[#082f49] text-[#bae6fd] hover:bg-[#bae6fd]/10 border border-[#bae6fd]/30' : 'bg-[#f0f9ff] text-[#0c4a6e] hover:bg-[#0c4a6e]/10 border border-[#bae6fd]/20',
                print: isDark ? 'bg-[#bae6fd] text-[#0c4a6e] hover:bg-[#7dd3fc]' : 'bg-[#0c4a6e] text-[#bae6fd] hover:bg-[#075985]'
            };
        }
        if (settings.theme === 'ceramic-iznik') {
            return {
                cancel: isDark ? 'bg-[#450a0a] text-[#0ea5e9] hover:bg-[#0ea5e9]/10 border border-[#0ea5e9]/30' : 'bg-[#fef2f2] text-[#dc2626] hover:bg-[#dc2626]/10 border border-[#0ea5e9]/20',
                print: isDark ? 'bg-[#0ea5e9] text-[#7f1d1d] hover:bg-[#0284c7]' : 'bg-[#dc2626] text-[#0ea5e9] hover:bg-[#b91c1c]'
            };
        }

        if (isZellige) {
            return {
                cancel: isDark ? 'bg-[#002a2d] text-[#cca43b] hover:bg-[#cca43b]/10 border border-[#cca43b]/30' : 'bg-[#fbf8f1] text-[#006269] hover:bg-[#cca43b]/10 border border-[#cca43b]/20',
                print: isDark ? 'bg-[#cca43b] text-[#001e21] hover:bg-[#b08d30]' : 'bg-[#006269] text-[#cca43b] hover:bg-[#004d53]'
            };
        }
        
        return {
            cancel: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            print: 'bg-blue-600 text-white hover:bg-blue-700'
        };
    };

    const buttonStyles = getButtonStyles();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`معاينة الطباعة: ${title}`} size="lg">
            <div className="flex flex-col h-[75vh]">
                {/* Variant Selector */}
                {variants && variants.length > 0 && (
                    <div className="mb-4 flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400">
                            <Layout size={16} />
                            <span>اختر النموذج:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {variants.map((v) => (
                                <button
                                    key={v}
                                    onClick={() => onVariantChange?.(v)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                                        activeVariant === v
                                        ? (isZellige ? 'bg-[#cca43b] text-white shadow-md' : 'bg-blue-600 text-white shadow-md')
                                        : (isDark ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')
                                    }`}
                                >
                                    <span className="capitalize">{v}</span>
                                    {activeVariant === v && <Check size={12} />}
                                </button>
                            ))}
                            {customTemplates.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => onVariantChange?.(t.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                                        activeVariant === t.id
                                        ? (isZellige ? 'bg-[#cca43b] text-white shadow-md' : 'bg-blue-600 text-white shadow-md')
                                        : (isDark ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')
                                    }`}
                                >
                                    <span className="capitalize">{t.name}</span>
                                    {activeVariant === t.id && <Check size={12} />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto overflow-x-auto p-8 bg-white border rounded-xl shadow-inner mb-4 custom-scrollbar text-black">
                    <div className="print-preview-content min-w-fit flex justify-center">
                        <div className="bg-white shadow-lg p-1 print:shadow-none print:p-0">
                            {activeCustomTemplate ? (
                                <div dangerouslySetInnerHTML={{ __html: replacePlaceholders(activeCustomTemplate.content) }} />
                            ) : (
                                htmlContent ? <div dangerouslySetInnerHTML={{ __html: htmlContent }} /> : content
                            )}
                            {qrCodeValue && settings.printConfig.showQrCode && (
                                <div className="mt-8 pt-8 border-t flex flex-col items-center justify-center opacity-50">
                                    <QRCodeSVG value={qrCodeValue} size={100} />
                                    <p className="text-[10px] mt-2 font-mono">{qrCodeValue}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className={`flex justify-end gap-3 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <button onClick={onClose} className={`px-6 py-2 rounded-xl font-bold ${buttonStyles.cancel}`}>إلغاء</button>
                    <button onClick={handlePrint} className={`px-8 py-2 rounded-xl font-black shadow-lg flex items-center gap-2 ${buttonStyles.print}`}>
                        <Printer size={20}/> طباعة
                    </button>
                </div>
            </div>
        </Modal>
    );
};
