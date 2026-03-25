import React from 'react';
import { HallBooking } from '../types';
import { QRCodeSVG } from 'qrcode.react';

export type HallTicketVariant = 'modern' | 'classic' | 'minimal' | 'elegant' | 'technical' | 'compact';

interface HallBookingTicketProps {
    booking: HallBooking;
    appName: string;
    layoutLabel: string;
    cateringLabel: string;
    variant?: HallTicketVariant;
}

export const HallBookingTicket: React.FC<HallBookingTicketProps> = ({ 
    booking, 
    appName, 
    layoutLabel, 
    cateringLabel,
    variant = 'modern'
}) => {
    const qrValue = `HALL:${booking.id}|CLIENT:${booking.clientName}|DATE:${booking.startDate}`;

    const renderIDSection = () => (
        <div className="mt-4 border border-dashed border-gray-300 p-2 text-center text-[10px] text-gray-400">
            ID COPY AREA / مساحة نسخة الهوية
        </div>
    );

    if (variant === 'minimal') {
        return (
            <div className="w-full max-w-[210mm] bg-white text-black font-mono p-8 border border-black mx-auto" dir="rtl">
                <h1 className="text-2xl font-bold border-b-2 border-black pb-2 mb-4">{appName} - EVENT TICKET</h1>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <p><strong>CLIENT:</strong> {booking.clientName}</p>
                    <p><strong>DATE:</strong> {booking.startDate}</p>
                    <p><strong>TIME:</strong> {booking.startTime} - {booking.endTime}</p>
                    <p><strong>GUESTS:</strong> {booking.guestCount}</p>
                </div>
                <div className="flex justify-center my-4">
                    <QRCodeSVG value={qrValue} size={100} />
                </div>
                {renderIDSection()}
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto bg-white text-black font-sans overflow-hidden border border-gray-200 relative shadow-sm" dir="rtl">
            {/* Ticket Stub (Left Side in LTR, Right in RTL) */}
            <div className="flex flex-col md:flex-row h-full">
                
                {/* Main Ticket Body */}
                <div className="flex-1 p-8 relative border-l-2 border-dashed border-gray-300">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-4">
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tighter mb-1">تذكرة حجز قاعة</h1>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{appName}</p>
                        </div>
                        <div className="text-left">
                            <div className="bg-black text-white px-3 py-1 text-xs font-bold uppercase mb-1 inline-block">Event Ticket</div>
                            <p className="text-xs font-mono">{booking.id}</p>
                        </div>
                    </div>

                    {/* Event Details */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div className="col-span-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Event Name / Client</p>
                            <h2 className="text-2xl font-black uppercase leading-none">{booking.clientName}</h2>
                        </div>
                        
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Date</p>
                            <p className="text-xl font-bold font-mono">{booking.startDate}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Time</p>
                            <p className="text-xl font-bold font-mono">{booking.startTime} - {booking.endTime}</p>
                        </div>

                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Hall Layout</p>
                            <p className="font-bold">{layoutLabel}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Guests</p>
                            <p className="font-bold font-mono">{booking.guestCount}</p>
                        </div>
                    </div>
                    {renderIDSection()}

                    {/* Footer */}
                    <div className="flex justify-between items-end pt-4 border-t border-gray-200">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Amount</p>
                            <p className="text-2xl font-black">{booking.price} <span className="text-sm font-normal">DZD</span></p>
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status</p>
                            <span className="px-3 py-1 border border-black rounded-full text-xs font-bold uppercase">{booking.status}</span>
                        </div>
                    </div>
                </div>

                {/* Stub / QR Section */}
                <div className="w-full md:w-64 bg-gray-50 p-8 flex flex-col items-center justify-center text-center border-t-2 md:border-t-0 md:border-r-2 border-dashed border-gray-300 relative">
                    {/* Cutout Circles */}
                    <div className="absolute top-0 right-0 w-6 h-6 bg-white rounded-full translate-x-3 -translate-y-3 border-b border-l border-gray-200 print:hidden"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full translate-x-3 translate-y-3 border-t border-l border-gray-200 print:hidden"></div>

                    <p className="text-xs font-bold text-gray-400 uppercase mb-4">Scan for Entry</p>
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 mb-4">
                        <QRCodeSVG value={qrValue} size={140} />
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono break-all">{booking.id}</p>
                    
                    <div className="mt-auto pt-8 w-full">
                        <div className="border-t border-gray-300 pt-2">
                            <p className="text-[10px] font-bold uppercase">Admit One</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
