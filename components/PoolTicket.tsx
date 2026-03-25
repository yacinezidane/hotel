import React from 'react';
import { PoolPass } from '../types';
import { QRCodeSVG } from 'qrcode.react';

export type PoolTicketVariant = 'modern' | 'classic' | 'minimal' | 'elegant' | 'technical' | 'compact';

interface PoolTicketProps {
    pass: PoolPass;
    appName: string;
    variant?: PoolTicketVariant;
}

export const PoolTicket: React.FC<PoolTicketProps> = ({ pass, appName, variant = 'modern' }) => {
    const qrValue = `POOL:${pass.id}|GUEST:${pass.holderName}|ZONE:${pass.accessZone}`;

    const renderIDSection = () => (
        <div className="mt-4 border border-dashed border-gray-300 p-2 text-center text-[8px] text-gray-400">
            ID COPY AREA / مساحة نسخة الهوية
        </div>
    );

    if (variant === 'minimal') {
        return (
            <div className="w-[80mm] bg-white text-black font-mono p-4 border border-black mx-auto" dir="rtl">
                <h1 className="text-center font-bold border-b border-black pb-1 mb-2">{appName} - POOL</h1>
                <p>GUEST: {pass.holderName}</p>
                <p>DATE: {new Date(pass.date).toLocaleDateString()}</p>
                <p>ZONE: {pass.accessZone}</p>
                <div className="flex justify-center my-2">
                    <QRCodeSVG value={qrValue} size={80} />
                </div>
                <p className="text-[8px] text-center">ID: {pass.id}</p>
            </div>
        );
    }

    // Default Modern
    return (
        <div className="w-[350px] bg-white text-black font-sans border border-gray-200 rounded-3xl overflow-hidden relative mx-auto my-4 shadow-sm print:shadow-none print:border-black print:rounded-none print:w-full print:max-w-[80mm] print:break-inside-avoid">
            {/* Header */}
            <div className="bg-[#0093E9] bg-[linear-gradient(160deg,#0093E9_0%,#80D0C7_100%)] text-white p-6 text-center relative overflow-hidden print:bg-none print:text-black print:border-b print:border-black print:p-4">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] print:hidden"></div>
                <h1 className="text-2xl font-black tracking-widest uppercase relative z-10 drop-shadow-md print:drop-shadow-none print:text-xl">{appName}</h1>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-90 relative z-10 mt-1 print:text-black">Pool & Club Access</p>
            </div>

            {/* Body */}
            <div className="p-6 relative print:p-4">
                <div className="text-center mb-6 print:mb-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider print:text-black">Guest Name</p>
                    <h2 className="text-xl font-black uppercase text-gray-900 leading-none print:text-black">{pass.holderName}</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 border-b border-dashed border-gray-200 pb-6 print:border-black print:mb-4 print:pb-4">
                    <div className="text-left">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider print:text-black">Date</p>
                        <p className="font-bold text-sm">{new Date(pass.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider print:text-black">Valid Until</p>
                        <p className="font-bold text-sm">{pass.expiryTime}</p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-2">
                     <div className="p-2 border-2 border-gray-100 rounded-xl print:border-black">
                        <QRCodeSVG value={qrValue} size={120} level="M" />
                     </div>
                     <p className="text-[9px] font-mono text-gray-400 uppercase tracking-widest mt-1 print:text-black">{pass.id}</p>
                </div>
                {renderIDSection()}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-3 text-center border-t border-gray-100 print:bg-transparent print:border-black">
                <p className="text-[8px] text-gray-400 leading-tight font-medium print:text-black">
                    NON-TRANSFERABLE • SHOW AT ENTRY • NO REFUNDS
                </p>
            </div>
        </div>
    );
};
