import React, { useState } from 'react';
import { Printer } from 'lucide-react';
import { PrintPreviewModal } from './PrintPreviewModal';
import { useHotel } from '../context/HotelContext';
import { printDocument } from '../utils/print';

interface PrintButtonProps {
    title: string;
    content?: React.ReactNode;
    children?: React.ReactNode;
    renderContent?: (variant: any) => React.ReactNode;
    htmlContent?: string; // Optional raw HTML
    className?: string;
    label?: string;
    iconSize?: number;
    qrCodeValue?: string;
    instantPrint?: boolean; // New prop for instant printing
    variants?: string[];
    defaultVariant?: string;
    data?: Record<string, any>; // Data for placeholder replacement
    templateType?: 'invoice' | 'booking' | 'pool_pass' | 'staff_id' | 'other';
}

export const PrintButton: React.FC<PrintButtonProps> = ({ 
    title, 
    content, 
    renderContent,
    htmlContent, 
    className, 
    label = "طباعة", 
    iconSize = 18, 
    qrCodeValue,
    instantPrint = false,
    variants,
    defaultVariant,
    data = {},
    templateType,
    children
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeVariant, setActiveVariant] = useState(defaultVariant || (variants && variants[0]));
    const { settings } = useHotel();

    const handlePrint = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (instantPrint) {
            printDocument({
                title,
                content: htmlContent || (renderContent ? renderContent(activeVariant) : content) || '',
                qrCodeValue,
                settings
            });
        } else {
            setIsOpen(true);
        }
    };

    const displayContent = renderContent ? renderContent(activeVariant) : content;

    return (
        <>
            <button 
                onClick={handlePrint} 
                className={className || "flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition"}
                title={label}
            >
                {children ? children : (
                    <>
                        <Printer size={iconSize} />
                        {label && <span>{label}</span>}
                    </>
                )}
            </button>

            {isOpen && (
                <PrintPreviewModal 
                    isOpen={isOpen} 
                    onClose={() => setIsOpen(false)} 
                    title={title} 
                    content={displayContent || null}
                    htmlContent={htmlContent}
                    qrCodeValue={qrCodeValue}
                    variants={variants}
                    activeVariant={activeVariant}
                    onVariantChange={setActiveVariant}
                    data={data}
                    templateType={templateType}
                />
            )}
        </>
    );
};
