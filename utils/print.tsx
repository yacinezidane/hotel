import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QRCodeSVG } from 'qrcode.react';

interface PrintOptions {
    title: string;
    content: string | React.ReactNode;
    qrCodeValue?: string;
    settings: any; // Hotel settings
    isCustomTemplate?: boolean;
}

export const printDocument = ({ title, content, qrCodeValue, settings, isCustomTemplate }: PrintOptions) => {
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
        window.dispatchEvent(new CustomEvent('show-notification', { 
            detail: { 
                message: 'يرجى السماح بالنوافذ المنبثقة للطباعة (Popups).',
                type: 'warning'
            } 
        }));
        return;
    }

    let contentHtml = '';
    if (typeof content === 'string') {
        contentHtml = content;
    } else {
        contentHtml = renderToStaticMarkup(content as React.ReactElement);
    }

    let qrCodeHtml = '';
    if (qrCodeValue && settings.printConfig.showQrCode) {
        const qrSvg = renderToStaticMarkup(
            <QRCodeSVG value={qrCodeValue} size={128} level="H" includeMargin={true} />
        );
        qrCodeHtml = `
            <div class="print-qr">
                ${qrSvg}
                <p>Scan for Verification</p>
            </div>
        `;
    }

    const styles = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
            body { font-family: 'Cairo', sans-serif; direction: rtl; padding: 20px; color: #000; }
            @media print {
                @page { margin: 0.5cm; size: auto; }
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            .print-container { max-width: 800px; margin: 0 auto; }
            .print-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px; }
            .print-header h1 { margin: 0; font-size: 24px; font-weight: 900; }
            .print-header p { margin: 5px 0 0; font-size: 12px; color: #555; }
            .print-title { text-align: center; font-size: 18px; font-weight: 700; margin: 20px 0; text-transform: uppercase; letter-spacing: 1px; border: 1px solid #000; padding: 5px; display: inline-block; }
            .print-footer { text-align: center; margin-top: 40px; font-size: 10px; border-top: 1px solid #ccc; padding-top: 10px; color: #777; }
            
            .print-qr { text-align: center; margin-top: 20px; border-top: 1px dashed #ccc; padding-top: 20px; }
            .print-qr svg { width: 100px; height: 100px; }
            .print-qr p { font-size: 10px; margin-top: 5px; font-weight: bold; }

            /* Table Styles */
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background-color: #f8f9fa; font-weight: bold; color: #333; }
            tr:nth-child(even) { background-color: #f9f9f9; }

            /* Utility Classes for Print */
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .mb-4 { margin-bottom: 1rem; }
            .p-4 { padding: 1rem; }
            .border { border: 1px solid #ddd; }
            
            /* Tailwind Utilities (Simplified) */
            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .items-center { align-items: center; }
            .justify-between { justify-content: space-between; }
            .justify-center { justify-content: center; }
            .gap-2 { gap: 0.5rem; }
            .gap-4 { gap: 1rem; }
            .w-full { width: 100%; }
            .text-xs { font-size: 0.75rem; }
            .text-sm { font-size: 0.875rem; }
            .text-lg { font-size: 1.125rem; }
            .text-xl { font-size: 1.25rem; }
            .text-2xl { font-size: 1.5rem; }
            .text-3xl { font-size: 1.875rem; }
            .font-black { font-weight: 900; }
            .uppercase { text-transform: uppercase; }
            .bg-gray-50 { background-color: #f9fafb; }
            .bg-white { background-color: #ffffff; }
            .text-gray-500 { color: #6b7280; }
            .text-gray-900 { color: #111827; }
        </style>
    `;

    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <title>${title}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            ${styles}
        </head>
        <body>
            ${isCustomTemplate ? `
                <div class="custom-print-template">
                    ${contentHtml}
                    ${qrCodeHtml}
                </div>
            ` : `
                <div class="print-container">
                    <div class="print-header">
                        <h1>${settings.appName}</h1>
                        <p>${settings.hotelAddress} | ${settings.hotelPhone}</p>
                    </div>
                    
                    <div style="text-align: center;">
                        <div class="print-title">${title}</div>
                    </div>

                    <div class="print-content">
                        ${contentHtml}
                    </div>

                    ${qrCodeHtml}

                    <div class="print-footer">
                        <p>${settings.printConfig.customFooterText || 'شكراً لتعاملكم معنا'}</p>
                        <p>تاريخ الطباعة: ${new Date().toLocaleString('ar-DZ')}</p>
                    </div>
                </div>
            `}
            <script>
                // Wait for Tailwind CDN
                window.onload = function() { 
                    setTimeout(function(){ 
                        window.print(); 
                        window.close(); 
                    }, 1000); 
                }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
};
