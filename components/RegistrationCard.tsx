import React from 'react';
import { GuestInfo } from '../types';
import { QRCodeSVG } from 'qrcode.react';

export type RegistrationCardVariant = 'modern' | 'classic' | 'minimal' | 'elegant' | 'technical' | 'compact';

interface RegistrationCardProps {
    guest: GuestInfo;
    roomNumber?: string;
    checkInDate: string;
    appName: string;
    variant?: RegistrationCardVariant;
    logo?: string;
}

export const RegistrationCard: React.FC<RegistrationCardProps> = ({ 
    guest, 
    roomNumber, 
    checkInDate, 
    appName, 
    variant = 'modern' 
}) => {
    const qrData = JSON.stringify({
        id: guest.idNumber,
        name: `${guest.firstNameAr} ${guest.lastNameAr}`,
        room: roomNumber,
        checkIn: checkInDate
    });

    const CommonQR = () => (
        <div className="flex flex-col items-center justify-center">
            <div className="bg-white p-1 border border-black mb-1">
                <QRCodeSVG value={qrData} size={80} level="M" />
            </div>
            <p className="text-[8px] font-mono text-gray-500 uppercase tracking-widest text-center">Scan Info</p>
        </div>
    );

    const SignatureSection = () => (
        <div className="flex gap-8 mt-8 pt-4 border-t border-gray-300">
            <div className="flex-1 text-center">
                <p className="text-[10px] font-bold uppercase mb-8">Guest Signature / توقيع النزيل</p>
                <div className="border-b border-black w-3/4 mx-auto"></div>
            </div>
            <div className="flex-1 text-center">
                <p className="text-[10px] font-bold uppercase mb-8">Receptionist / موظف الاستقبال</p>
                <div className="border-b border-black w-3/4 mx-auto"></div>
            </div>
        </div>
    );

    const IDDocumentSection = () => (
        <div className="mb-8 border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 print:bg-white">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">ID Document Scan / صورة الهوية</p>
            {guest.idPhoto ? (
                <img src={guest.idPhoto} alt="ID Document" className="max-h-48 object-contain rounded-lg shadow-sm" />
            ) : (
                <div className="h-48 w-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 italic text-sm">
                    Place ID Document Copy Here / ضع نسخة وثيقة الهوية هنا
                </div>
            )}
        </div>
    );

    // --- MODERN VARIANT ---
    if (variant === 'modern') {
        return (
            <div className="bg-white p-8 text-black font-sans border border-gray-300 max-w-[210mm] mx-auto shadow-sm relative overflow-hidden" dir="rtl">
                <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-4">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter mb-1">استمارة تسجيل</h1>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{appName}</p>
                    </div>
                    <div className="text-left">
                        <div className="bg-black text-white px-3 py-1 text-xs font-bold uppercase mb-1 inline-block">Registration Card</div>
                        <p className="text-xs font-mono">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="flex gap-6 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200 print:bg-white print:border-black">
                    <div className="flex-1 border-l border-gray-200 pl-6">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Room Number</p>
                        <p className="text-4xl font-black tracking-tighter">{roomNumber || '---'}</p>
                    </div>
                    <div className="flex-1 border-l border-gray-200 pl-6">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Check-In Date</p>
                        <p className="text-xl font-bold font-mono">{checkInDate}</p>
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Guest Name</p>
                        <p className="text-xl font-bold">{guest.firstNameAr} {guest.lastNameAr}</p>
                        <p className="text-sm font-mono uppercase text-gray-500">{guest.firstNameEn} {guest.lastNameEn}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-8 text-sm">
                    {[
                        { label: 'Date of Birth', value: guest.birthDate },
                        { label: 'Place of Birth', value: guest.birthPlace },
                        { label: 'Nationality', value: guest.nationality },
                        { label: 'Phone', value: guest.phone, dir: 'ltr' },
                        { label: 'ID Type', value: guest.idType },
                        { label: 'ID Number', value: guest.idNumber },
                        { label: "Father's Name", value: guest.fatherName },
                        { label: "Mother's Name", value: guest.motherName },
                    ].map((item, i) => (
                        <div key={i} className="border-b border-gray-100 pb-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{item.label}</p>
                            <p className={`font-bold ${item.dir === 'ltr' ? 'font-mono' : ''}`} dir={item.dir}>{item.value || '---'}</p>
                        </div>
                    ))}
                </div>

                <IDDocumentSection />

                <div className="flex items-end justify-between mt-auto pt-8 border-t-2 border-black">
                    <div className="flex-1 pr-8">
                        <p className="text-[10px] text-justify text-gray-500 mb-8 leading-relaxed">
                            أقر بأن البيانات المذكورة أعلاه صحيحة، وأوافق على الالتزام بقواعد وأنظمة الفندق.
                            <br/>
                            I certify that the information provided above is correct and I agree to abide by the hotel's rules.
                        </p>
                        <div className="flex gap-8">
                            <div className="flex-1">
                                <div className="h-10 border-b-2 border-black mb-2"></div>
                                <p className="text-[10px] font-bold uppercase tracking-widest">Guest Signature</p>
                            </div>
                            <div className="flex-1">
                                <div className="h-10 border-b-2 border-black mb-2"></div>
                                <p className="text-[10px] font-bold uppercase tracking-widest">Receptionist</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-40 flex flex-col items-center justify-center pl-8 border-r border-gray-200">
                        <CommonQR />
                    </div>
                </div>
            </div>
        );
    }

    // --- CLASSIC VARIANT ---
    if (variant === 'classic') {
        return (
            <div className="bg-white p-10 text-black font-serif border-2 border-double border-black max-w-[210mm] mx-auto relative" dir="rtl">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold mb-2">{appName}</h1>
                    <div className="w-32 h-1 bg-black mx-auto mb-2"></div>
                    <h2 className="text-xl uppercase tracking-widest">Guest Registration Card</h2>
                    <p className="text-sm italic mt-1">بطاقة تسجيل النزيل</p>
                </div>

                <div className="flex justify-between items-center mb-8 border-b border-black pb-4">
                    <div>
                        <span className="font-bold ml-2">Room No / رقم الغرفة:</span>
                        <span className="text-2xl font-bold font-mono">{roomNumber || '___'}</span>
                    </div>
                    <div>
                        <span className="font-bold ml-2">Date / التاريخ:</span>
                        <span className="font-mono">{new Date(checkInDate).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="col-span-2">
                        <label className="block text-xs uppercase font-bold text-gray-600 mb-1">Full Name / الاسم الكامل</label>
                        <div className="border-b border-black pb-1 text-lg">
                            {guest.firstNameAr} {guest.lastNameAr} <span className="mx-2">|</span> {guest.firstNameEn} {guest.lastNameEn}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-600 mb-1">Date of Birth / تاريخ الميلاد</label>
                        <div className="border-b border-black pb-1">{guest.birthDate}</div>
                    </div>
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-600 mb-1">Place of Birth / مكان الميلاد</label>
                        <div className="border-b border-black pb-1">{guest.birthPlace}</div>
                    </div>

                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-600 mb-1">Nationality / الجنسية</label>
                        <div className="border-b border-black pb-1">{guest.nationality}</div>
                    </div>
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-600 mb-1">Phone / الهاتف</label>
                        <div className="border-b border-black pb-1 font-mono" dir="ltr">{guest.phone}</div>
                    </div>

                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-600 mb-1">ID Type / نوع الهوية</label>
                        <div className="border-b border-black pb-1">{guest.idType}</div>
                    </div>
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-600 mb-1">ID Number / رقم الهوية</label>
                        <div className="border-b border-black pb-1 font-mono">{guest.idNumber}</div>
                    </div>
                </div>

                <IDDocumentSection />

                <div className="flex justify-between items-center mt-12">
                    <div className="text-xs text-gray-600 max-w-md">
                        <p>By signing this form, I agree to the terms and conditions of the hotel.</p>
                        <p className="mt-1">بتوقيعي على هذه الاستمارة، أوافق على الشروط والأحكام الخاصة بالفندق.</p>
                    </div>
                    <CommonQR />
                </div>

                <SignatureSection />
            </div>
        );
    }

    // --- MINIMAL VARIANT ---
    if (variant === 'minimal') {
        return (
            <div className="bg-white p-6 text-black font-mono text-sm border border-black max-w-[210mm] mx-auto" dir="rtl">
                <div className="flex justify-between items-center border-b border-black pb-4 mb-6">
                    <h1 className="font-bold text-lg uppercase">{appName} - REGISTRATION</h1>
                    <div className="text-right">
                        <p>DATE: {new Date(checkInDate).toLocaleDateString()}</p>
                        <p>ROOM: <span className="text-xl font-bold">{roomNumber || '---'}</span></p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="col-span-2 border border-black p-2">
                        <span className="block text-[10px] uppercase">Guest Name</span>
                        <span className="font-bold">{guest.firstNameEn} {guest.lastNameEn}</span>
                        <span className="mx-2">/</span>
                        <span>{guest.firstNameAr} {guest.lastNameAr}</span>
                    </div>

                    <div className="border border-black p-2">
                        <span className="block text-[10px] uppercase">Birth Date</span>
                        {guest.birthDate}
                    </div>
                    <div className="border border-black p-2">
                        <span className="block text-[10px] uppercase">Nationality</span>
                        {guest.nationality}
                    </div>

                    <div className="border border-black p-2">
                        <span className="block text-[10px] uppercase">ID No.</span>
                        {guest.idNumber} ({guest.idType})
                    </div>
                    <div className="border border-black p-2">
                        <span className="block text-[10px] uppercase">Phone</span>
                        {guest.phone}
                    </div>
                </div>

                <IDDocumentSection />

                <div className="flex justify-between items-end mt-8">
                    <div className="flex-1">
                        <p className="text-[10px] mb-8">I agree to hotel rules / أوافق على قوانين الفندق</p>
                        <div className="flex gap-8">
                            <div className="border-t border-black pt-1 px-4">Guest Signature</div>
                            <div className="border-t border-black pt-1 px-4">Staff Signature</div>
                        </div>
                    </div>
                    <div className="ml-4">
                        <QRCodeSVG value={qrData} size={60} level="L" />
                    </div>
                </div>
            </div>
        );
    }

    // --- ELEGANT VARIANT ---
    if (variant === 'elegant') {
        return (
            <div className="bg-[#fdfbf7] p-12 text-[#1a1a1a] font-serif border-[12px] border-[#cca43b]/20 max-w-[210mm] mx-auto shadow-xl" dir="rtl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-[#006269] mb-2 tracking-widest">{appName}</h1>
                    <p className="text-xs uppercase tracking-[0.5em] text-[#cca43b]">Luxury Hospitality</p>
                </div>
                <div className="grid grid-cols-3 gap-8 mb-12">
                    <div className="col-span-2 border-l border-[#cca43b]/30 pl-8">
                        <h2 className="text-2xl font-bold mb-6 border-b border-[#cca43b]/20 pb-2">Guest Registration</h2>
                        <div className="space-y-4">
                            <p><span className="text-[#cca43b] font-bold">Name:</span> {guest.firstNameAr} {guest.lastNameAr}</p>
                            <p><span className="text-[#cca43b] font-bold">Nationality:</span> {guest.nationality}</p>
                            <p><span className="text-[#cca43b] font-bold">ID:</span> {guest.idNumber} ({guest.idType})</p>
                        </div>
                    </div>
                    <div className="text-center flex flex-col justify-center">
                        <p className="text-xs uppercase text-[#cca43b] mb-1">Room</p>
                        <p className="text-6xl font-black text-[#006269]">{roomNumber || '---'}</p>
                    </div>
                </div>
                <IDDocumentSection />
                <div className="mt-12 flex justify-between items-end">
                    <div className="w-48 border-t border-[#cca43b] pt-2 text-center text-[10px] uppercase tracking-widest">Guest Signature</div>
                    <CommonQR />
                    <div className="w-48 border-t border-[#cca43b] pt-2 text-center text-[10px] uppercase tracking-widest">Hotel Seal</div>
                </div>
            </div>
        );
    }

    // --- TECHNICAL VARIANT ---
    if (variant === 'technical') {
        return (
            <div className="bg-white p-8 text-black font-mono text-xs border-2 border-black max-w-[210mm] mx-auto" dir="rtl">
                <div className="flex justify-between items-start mb-8 border-b-4 border-black pb-4">
                    <div>
                        <h1 className="text-2xl font-black">SYSTEM.REG_CARD_V6.0</h1>
                        <p>HOTEL_ID: {appName.toUpperCase().replace(/\s/g, '_')}</p>
                    </div>
                    <div className="text-right">
                        <p>TIMESTAMP: {new Date().toISOString()}</p>
                        <p>ROOM_ID: {roomNumber || 'NULL'}</p>
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-0 border-2 border-black mb-8">
                    {[
                        ['GUEST_NAME', `${guest.firstNameEn} ${guest.lastNameEn}`],
                        ['GUEST_NAME_AR', `${guest.firstNameAr} ${guest.lastNameAr}`],
                        ['ID_TYPE', guest.idType],
                        ['ID_NUMBER', guest.idNumber],
                        ['BIRTH_DATE', guest.birthDate],
                        ['NATIONALITY', guest.nationality],
                        ['PHONE', guest.phone],
                        ['CHECK_IN', checkInDate]
                    ].map(([label, val], i) => (
                        <div key={i} className="border border-black p-2">
                            <p className="font-black bg-black text-white px-1 mb-1">{label}</p>
                            <p className="font-bold uppercase">{val || 'N/A'}</p>
                        </div>
                    ))}
                </div>
                <IDDocumentSection />
                <div className="flex justify-between items-center mt-8">
                    <div className="border-4 border-black p-4 flex-1 mr-8">
                        <p className="font-black mb-4">AUTHENTICATION_REQUIRED:</p>
                        <div className="h-12 border-b-2 border-black border-dashed"></div>
                    </div>
                    <CommonQR />
                </div>
            </div>
        );
    }

    // --- COMPACT VARIANT ---
    return (
        <div className="bg-white p-4 text-black font-sans border border-gray-400 max-w-[148mm] mx-auto text-[10px]" dir="rtl">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h1 className="font-bold uppercase">{appName}</h1>
                <p>Room: {roomNumber}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
                <p><strong>Name:</strong> {guest.firstNameAr} {guest.lastNameAr}</p>
                <p><strong>ID:</strong> {guest.idNumber}</p>
                <p><strong>Nationality:</strong> {guest.nationality}</p>
                <p><strong>Date:</strong> {checkInDate}</p>
            </div>
            <div className="scale-75 origin-top">
                <IDDocumentSection />
            </div>
            <div className="flex justify-between items-center mt-2">
                <div className="w-24 border-t border-black pt-1">Signature</div>
                <QRCodeSVG value={qrData} size={40} />
            </div>
        </div>
    );
};
