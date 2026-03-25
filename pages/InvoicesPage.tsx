
import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { PaymentModal } from '../components/PaymentModal';
import { Printer, MapPin, Phone, Mail, FileText, X, ExternalLink, CreditCard } from 'lucide-react';
import { Booking } from '../types';
import { PrintButton } from '../components/PrintButton';
import { InvoicePrint } from '../components/InvoicePrint';
import { QRCodeSVG } from 'qrcode.react';
import { renderToStaticMarkup } from 'react-dom/server';
import { printDocument } from '../utils/print';
import { getThemeStyles } from '../utils/themeStyles';

export const InvoicesPage: React.FC = () => {
  const { invoices, settings, currentUser, bookings, rooms, addQRRecord, addNotification, updateInvoice, addTransaction } = useHotel();
  const ts = getThemeStyles(settings);
  const [showQRModal, setShowQRModal] = useState<{ id: string, name: string, url: string } | null>(null);
  const [paymentModalData, setPaymentModalData] = useState<{ id: string, amount: number, guestName: string } | null>(null);
  const canPrint = settings.allowPrinting && currentUser?.permissions.canManageInvoices;

  const handlePaymentSuccess = (details: { method: 'cash' | 'card' | 'transfer'; cardInfo?: any }) => {
      if (paymentModalData) {
          updateInvoice(paymentModalData.id, { isPaid: true });
          addTransaction({
              amount: paymentModalData.amount,
              type: 'income',
              category: 'booking',
              description: `Invoice Payment #${paymentModalData.id.slice(-6)}`,
              notes: `Guest: ${paymentModalData.guestName}`,
              paymentMethod: details.method,
              cardDetails: details.cardInfo
          });
          addNotification(`تم دفع الفاتورة بنجاح (${details.method === 'card' ? 'بطاقة' : details.method === 'transfer' ? 'تحويل' : 'نقداً'})`, 'success');
          setPaymentModalData(null);
      }
  };

  const handlePrintQR = () => {
    if (!showQRModal) return;
    printDocument({
        title: `Digital Invoice QR - ${showQRModal.name}`,
        content: `
            <div style="text-align: center; padding: 40px; border: 2px solid #000; border-radius: 20px; font-family: sans-serif;">
                <h1 style="font-size: 24px; font-weight: 900; margin-bottom: 10px;">Digital Invoice</h1>
                <h2 style="font-size: 18px; margin-bottom: 20px;">${showQRModal.name}</h2>
                <div style="margin: 20px auto; display: inline-block;">
                    ${renderToStaticMarkup(<QRCodeSVG value={showQRModal.url} size={200} />)}
                </div>
                <p style="margin-top: 20px; font-weight: bold;">Scan to Pay / View Invoice</p>
                <p style="font-size: 12px; color: #555;">${showQRModal.id}</p>
            </div>
        `,
        settings
    });
  };

  const handlePrint = (invoice: any) => {
    if (!canPrint) {
      addNotification("الطباعة غير متاحة", "warning");
      return;
    }
    // Generate QR Record for internal tracking
    addQRRecord({
        type: 'invoice',
        referenceId: invoice.id,
        title: `فاتورة: ${invoice.guestName}`,
        subtitle: `${invoice.amount.toLocaleString()} د.ج`,
        status: 'valid',
        dataPayload: `INV:${invoice.id}`
    });

    // Show Digital Invoice QR for the Guest
    const portalPayload = JSON.stringify({
        type: 'invoice',
        id: invoice.id,
        name: invoice.guestName,
        expiry: new Date(Date.now() + 86400000).toISOString() // 24h link
    });
    // SAFE UNICODE ENCODING
    const url = `https://nuzul-hotel.com/pay?token=${btoa(unescape(encodeURIComponent(portalPayload)))}`;
    
    setShowQRModal({ id: invoice.id, name: invoice.guestName, url });
  };

  const getBookingForInvoice = (bookingId: string) => bookings.find(b => b.id === bookingId);
  const getRoomNumber = (roomId: number) => rooms.find(r => r.id === roomId)?.number || 'Unknown';
  
  const calculateDays = (start: string, end: string) => {
      if (!end || end === 'TBD') return 1;
      const d1 = new Date(start);
      const d2 = new Date(end);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays > 0 ? diffDays : 1;
  };

  return (
    <div className="space-y-4 pb-10">
        
      {/* Normal Screen View */}
      <div className="print:hidden">
        <div className="flex items-center justify-between mb-4 text-inherit">
             <h2 className="text-xl font-bold flex items-center gap-2"><FileText /> الفواتير المالية</h2>
        </div>
        
        <div className="space-y-4">
            {invoices.length === 0 ? (
                <div className={`p-12 text-center opacity-50 font-bold rounded-[2.5rem] border ${ts.sectionCard}`}>لا توجد فواتير</div>
            ) : (
                invoices.map(inv => (
                    <div key={inv.id} className={`p-5 rounded-[2rem] shadow-sm border transition-all hover:shadow-md ${ts.card}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">INV-{inv.id.slice(-6).toUpperCase()}</p>
                                <h4 className={`text-lg font-black ${ts.textPrimary}`}>{inv.guestName}</h4>
                                <p className={`text-xs font-bold ${ts.textSecondary}`}>{new Date(inv.date).toLocaleDateString('ar-SA')}</p>
                            </div>
                            <div className="text-left">
                                <p className="text-xl font-black text-green-600">
                                    {inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-[10px]">د.ج</span>
                                </p>
                                <div className={`mt-1 px-2 py-0.5 rounded text-[10px] font-black inline-block ${inv.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {inv.isPaid ? 'مدفوعة' : 'غير مدفوعة'}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 pt-4 border-t border-current/5">
                            {!inv.isPaid && (
                                <button
                                    onClick={() => setPaymentModalData({ id: inv.id, amount: inv.amount, guestName: inv.guestName })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition font-black text-sm ${ts.button}`}
                                >
                                    <CreditCard size={18}/> دفع الآن
                                </button>
                            )}
                            <PrintButton 
                                title={`Invoice #${inv.id}`}
                                label="طباعة الفاتورة"
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition font-black text-sm ${
                                    canPrint 
                                    ? ts.button 
                                    : 'opacity-50 cursor-not-allowed bg-gray-100'
                                }`}
                                variants={['modern', 'classic', 'minimal', 'elegant', 'technical', 'compact']}
                                defaultVariant="modern"
                                renderContent={(variant) => (
                                    <InvoicePrint 
                                        invoice={inv}
                                        settings={settings}
                                        variant={variant}
                                    />
                                )}
                                data={{
                                    guestName: inv.guestName,
                                    invoiceId: inv.id.slice(-6).toUpperCase(),
                                    total: inv.amount.toLocaleString(),
                                    date: new Date(inv.date).toLocaleDateString('ar-DZ'),
                                    roomNumber: getRoomNumber(getBookingForInvoice(inv.bookingId)?.roomId || 0)
                                }}
                                templateType="invoice"
                            />
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* --- PAYMENT MODAL --- */}
      {paymentModalData && (
          <PaymentModal
              isOpen={!!paymentModalData}
              onClose={() => setPaymentModalData(null)}
              amount={paymentModalData.amount}
              description={`دفع فاتورة النزيل: ${paymentModalData.guestName}`}
              onSuccess={handlePaymentSuccess}
          />
      )}

      {/* --- DIGITAL INVOICE QR MODAL --- */}
      {showQRModal && (
            <div className="fixed inset-0 bg-black/90 z-[150] flex items-end justify-center p-0 backdrop-blur-xl animate-fade-in print:hidden" onClick={() => setShowQRModal(null)}>
                <div className={`w-full max-w-full rounded-t-[3rem] shadow-2xl relative overflow-hidden flex flex-col items-center p-8 h-[85dvh] animate-fade-in-up ${settings.darkMode ? (settings.theme === 'zellige' ? 'bg-[#001e21] text-[#cca43b] border border-[#cca43b]/20' : 'bg-gray-900 text-white border border-gray-700') : 'bg-white text-gray-900'}`} onClick={e => e.stopPropagation()}>
                    
                    <button onClick={() => setShowQRModal(null)} className={`absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition z-20 ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <X size={24} />
                    </button>

                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-inner ${settings.theme === 'zellige' && settings.darkMode ? 'bg-[#cca43b]/10 text-[#cca43b]' : 'bg-blue-100 text-blue-600'}`}>
                        <FileText size={40} />
                    </div>

                    <h3 className="text-2xl font-black mb-1">الفاتورة الرقمية</h3>
                    <p className={`text-sm font-bold mb-8 ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>امسح الرمز لتحميل الفاتورة أو الدفع</p>
                    
                    <div className={`p-6 rounded-[2.5rem] shadow-2xl mb-6 relative group ${settings.theme === 'zellige' && settings.darkMode ? 'bg-[#002a2d] border border-[#cca43b]/20' : 'bg-gray-900'}`}>
                        <div className="bg-white p-2 rounded-xl">
                            <QRCodeSVG value={showQRModal.url} size={224} />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-[2.5rem]">
                            <a href={showQRModal.url} target="_blank" rel="noreferrer" className="text-white font-bold flex items-center gap-2 hover:underline">
                                <ExternalLink size={20}/> فتح الرابط
                            </a>
                        </div>
                    </div>
                    
                    <div className={`p-4 rounded-2xl w-full text-center border ${settings.theme === 'zellige' && settings.darkMode ? 'bg-[#002a2d] border-[#cca43b]/20' : 'bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700'}`}>
                        <p className={`text-xs font-bold uppercase mb-1 ${settings.darkMode ? 'text-gray-400' : 'text-gray-400'}`}>العميل</p>
                        <p className="text-lg font-black">{showQRModal.name}</p>
                        <p className={`text-sm font-bold mt-1 uppercase font-mono ${settings.theme === 'zellige' && settings.darkMode ? 'text-[#cca43b]' : 'text-blue-600'}`}>#{showQRModal.id.slice(-6)}</p>
                    </div>

                    <button 
                        onClick={handlePrintQR}
                        className={`mt-6 text-xs font-bold flex items-center gap-2 ${settings.darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Printer size={14}/> طباعة نسخة ورقية
                    </button>
                </div>
            </div>
      )}

      {/* Detailed Invoice Print Layout */}
      {/* Removed: Handled by PrintButton modal */}
    </div>
  );
};
