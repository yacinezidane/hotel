import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Crown, Download, Share2, X } from 'lucide-react';
import { motion } from 'motion/react';

interface HotelQRCodeProps {
    hotelName: string;
    appUrl: string;
    themeColor: string;
    onClose?: () => void;
}

export const HotelQRCode: React.FC<HotelQRCodeProps> = ({ hotelName, appUrl, themeColor, onClose }) => {
    const downloadQR = () => {
        const svg = document.getElementById('hotel-qr-code');
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.download = `${hotelName}-QR.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[3rem] p-8 shadow-2xl border border-gray-100 max-w-sm md:max-w-2xl w-full text-center relative overflow-hidden"
        >
            <div className="drag-handle mb-2"></div>
            <div className="absolute top-0 left-0 w-full h-3" style={{ backgroundColor: themeColor }}></div>
            
            {onClose && (
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                    <X size={20} />
                </button>
            )}

            <div className="mb-6 mt-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner" style={{ backgroundColor: `${themeColor}15`, color: themeColor }}>
                    <Crown size={32} />
                </div>
                <h2 className="text-2xl font-black text-gray-900">{hotelName}</h2>
                <p className="text-gray-500 text-sm font-bold">امسح الرمز للوصول إلى خدماتنا</p>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] shadow-inner border border-gray-50 inline-block mb-6">
                <QRCodeSVG 
                    id="hotel-qr-code"
                    value={appUrl} 
                    size={200}
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                        src: "https://cdn-icons-png.flaticon.com/512/2983/2983067.png",
                        x: undefined,
                        y: undefined,
                        height: 40,
                        width: 40,
                        excavate: true,
                    }}
                />
            </div>

            <div className="flex gap-4">
                <button 
                    onClick={downloadQR}
                    className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95"
                >
                    <Download size={20} />
                    تحميل
                </button>
                <button 
                    onClick={() => {
                        if (navigator.share) {
                            navigator.share({
                                title: hotelName,
                                text: `اكتشف خدمات ${hotelName} عبر تطبيقنا الذكي`,
                                url: appUrl,
                            });
                        }
                    }}
                    className="w-14 h-14 bg-gray-100 text-gray-600 rounded-2xl flex items-center justify-center hover:bg-gray-200 transition-all active:scale-95"
                >
                    <Share2 size={20} />
                </button>
            </div>
            
            <p className="mt-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Powered by Zellige Systems</p>
        </motion.div>
    );
};
