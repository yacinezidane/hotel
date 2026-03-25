import React from 'react';
import { Invoice, AppSettings } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { MapPin, Phone, Mail, ShieldCheck, Globe, CreditCard } from 'lucide-react';

export type InvoiceVariant = 'modern' | 'classic' | 'minimal' | 'elegant' | 'technical' | 'compact';

interface InvoicePrintProps {
    invoice: Invoice;
    settings: AppSettings;
    variant?: InvoiceVariant;
}

export const InvoicePrint: React.FC<InvoicePrintProps> = ({ invoice, settings, variant = 'modern' }) => {
    const qrValue = `INV:${invoice.id}|GUEST:${invoice.guestName}|AMOUNT:${invoice.amount}|STATUS:${invoice.isPaid ? 'PAID' : 'UNPAID'}`;

    const Header = () => (
        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
            <div>
                {settings.invoiceHeaderImage ? (
                    <img src={settings.invoiceHeaderImage} alt="Logo" className="max-h-24 object-contain mb-2" />
                ) : (
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{settings.appName}</h1>
                )}
                <div className="text-sm text-gray-600 space-y-1">
                    <p className="flex items-center gap-2"><MapPin size={12}/> {settings.hotelAddress}</p>
                    <p className="flex items-center gap-2"><Phone size={12}/> {settings.hotelPhone}</p>
                    <p className="flex items-center gap-2"><Mail size={12}/> {settings.hotelEmail}</p>
                    {settings.taxNumber && <p className="font-mono text-xs mt-2 font-bold">{settings.taxNumber}</p>}
                </div>
            </div>
            <div className="text-left">
                <h2 className="text-5xl font-extrabold text-gray-200 tracking-widest">INVOICE</h2>
                <p className="text-xl font-bold text-gray-700 mt-2">فاتورة رقم</p>
                <p className="font-mono text-lg">#{invoice.id.slice(-6).toUpperCase()}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(invoice.date).toLocaleDateString('ar-SA')}</p>
            </div>
        </div>
    );

    const Footer = () => (
        <div className="mt-auto pt-12 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                        <ShieldCheck className="text-green-600" size={32} />
                    </div>
                    <p className="text-[10px] font-bold uppercase">Verified Secure</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-sm mb-2">
                        <QRCodeSVG value={qrValue} size={80} />
                    </div>
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Scan to Verify</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                        <Globe className="text-blue-600" size={32} />
                    </div>
                    <p className="text-[10px] font-bold uppercase">Global Support</p>
                </div>
            </div>
            <div className="mt-8 text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Thank you for choosing {settings.appName}</p>
                <div className="flex justify-center gap-4 text-[10px] font-bold text-gray-500">
                    <span>Terms & Conditions Apply</span>
                    <span>•</span>
                    <span>No Refund After 24h</span>
                    <span>•</span>
                    <span>Customer Support: {settings.hotelPhone}</span>
                </div>
            </div>
        </div>
    );

    if (variant === 'minimal') {
        return (
            <div className="bg-white p-8 max-w-[210mm] mx-auto text-black font-mono text-sm" dir="rtl">
                <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-center">
                    <h1 className="text-xl font-bold">{settings.appName} - INVOICE</h1>
                    <p>#{invoice.id.slice(-6).toUpperCase()}</p>
                </div>
                <div className="mb-6">
                    <p>GUEST: {invoice.guestName}</p>
                    <p>DATE: {new Date(invoice.date).toLocaleDateString()}</p>
                </div>
                <div className="border-y border-black py-4 mb-6">
                    <div className="flex justify-between font-bold">
                        <span>Description</span>
                        <span>Amount</span>
                    </div>
                    <div className="flex justify-between mt-2">
                        <span>Room Services & Stay</span>
                        <span>{invoice.amount.toLocaleString()} DZD</span>
                    </div>
                </div>
                <div className="text-right text-xl font-bold mb-8">
                    TOTAL: {invoice.amount.toLocaleString()} DZD
                </div>
                <div className="flex justify-center">
                    <QRCodeSVG value={qrValue} size={100} />
                </div>
            </div>
        );
    }

    // Default Modern
    return (
        <div className="bg-white p-8 max-w-[210mm] mx-auto min-h-[297mm] relative flex flex-col text-black" dir="rtl">
            <Header />
            
            <div className="grid grid-cols-2 gap-12 mb-12">
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <h3 className="text-xs font-black text-gray-400 uppercase mb-4 tracking-widest">Bill To / فاتورة إلى</h3>
                    <p className="text-2xl font-black text-gray-900 mb-1">{invoice.guestName}</p>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Guest ID: {invoice.guestId}</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <h3 className="text-xs font-black text-gray-400 uppercase mb-4 tracking-widest">Payment Info / معلومات الدفع</h3>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${invoice.isPaid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Status / الحالة</p>
                            <p className={`text-sm font-black uppercase ${invoice.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                                {invoice.isPaid ? 'Paid / مدفوعة' : 'Unpaid / غير مدفوعة'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1">
                <table className="w-full text-right mb-12">
                    <thead>
                        <tr className="border-b-2 border-gray-800 text-xs font-black text-gray-400 uppercase tracking-widest">
                            <th className="pb-4 pr-4">Description / الوصف</th>
                            <th className="pb-4 text-center">Qty / الكمية</th>
                            <th className="pb-4 text-left pl-4">Amount / المبلغ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr className="text-lg font-bold">
                            <td className="py-6 pr-4">
                                <p className="text-gray-900">Room Stay & Services</p>
                                <p className="text-xs font-bold text-gray-400 uppercase mt-1">إقامة فندقية وخدمات</p>
                            </td>
                            <td className="py-6 text-center font-mono">1</td>
                            <td className="py-6 text-left pl-4 font-black">{invoice.amount.toLocaleString()} <span className="text-xs font-normal">DZD</span></td>
                        </tr>
                    </tbody>
                </table>

                <div className="flex justify-end">
                    <div className="w-80 space-y-4">
                        <div className="flex justify-between text-gray-500 font-bold">
                            <span>Subtotal / المجموع الفرعي</span>
                            <span>{invoice.amount.toLocaleString()} DZD</span>
                        </div>
                        <div className="flex justify-between text-gray-500 font-bold">
                            <span>Tax / الضريبة (0%)</span>
                            <span>0.00 DZD</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t-2 border-gray-800">
                            <span className="text-xl font-black text-gray-900 uppercase tracking-tighter">Total / الإجمالي</span>
                            <span className="text-3xl font-black text-green-600">{invoice.amount.toLocaleString()} <span className="text-sm font-normal">DZD</span></span>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};
