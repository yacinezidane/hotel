import React from 'react';
import { GuestInfo } from '../types';

export type PoliceFormVariant = 'standard' | 'detailed' | 'compact' | 'modern' | 'classic' | 'official';

interface PoliceFormPrintProps {
    guest: GuestInfo;
    roomNumber?: string;
    checkInDate: string;
    hotelName: string;
    variant?: PoliceFormVariant;
}

export const PoliceFormPrint: React.FC<PoliceFormPrintProps> = ({ 
    guest, 
    roomNumber, 
    checkInDate, 
    hotelName,
    variant = 'standard'
}) => {
    const renderIDSection = () => (
        <div className="mt-6 border-2 border-black p-4 flex flex-col items-center justify-center bg-gray-50 print:bg-white">
            <p className="font-bold mb-2 text-xs uppercase">وثيقة الهوية / Pièce d'identité</p>
            {guest.idPhoto ? (
                <img src={guest.idPhoto} alt="ID Document" className="max-h-48 object-contain border border-gray-300" />
            ) : (
                <div className="h-48 w-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 italic text-sm">
                    مكان وضع نسخة الهوية / Place ID Copy Here
                </div>
            )}
        </div>
    );

    // --- STANDARD VARIANT ---
    if (variant === 'standard') {
        return (
            <div className="bg-white p-8 text-black font-serif max-w-[210mm] mx-auto relative overflow-hidden" dir="rtl">
                {/* Header */}
                <div className="text-center mb-8 border-b-2 border-black pb-4">
                    <h1 className="text-2xl font-bold mb-2">الجمهورية الجزائرية الديمقراطية الشعبية</h1>
                    <h2 className="text-xl font-bold mb-4">RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE</h2>
                    <div className="flex justify-between items-end px-4">
                        <div className="text-right">
                            <p className="font-bold">ولاية: ........................</p>
                            <p className="font-bold">دائرة: ........................</p>
                        </div>
                        <div className="text-center border-2 border-black px-6 py-2 rounded">
                            <h3 className="text-xl font-black uppercase">بطاقة الشرطة</h3>
                            <h4 className="text-lg font-bold uppercase">FICHE DE POLICE</h4>
                        </div>
                        <div className="text-left">
                            <p className="font-bold">Wilaya: ........................</p>
                            <p className="font-bold">Daïra: ........................</p>
                        </div>
                    </div>
                </div>

                {/* Hotel Info */}
                <div className="mb-6 flex justify-between items-center bg-gray-50 p-2 border border-gray-300">
                    <p className="font-bold">فندق: {hotelName}</p>
                    <p className="font-bold">غرفة رقم: {roomNumber || '___'}</p>
                    <p className="font-bold">تاريخ الدخول: {new Date(checkInDate).toLocaleDateString('en-GB')}</p>
                </div>

                {/* Guest Info Grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-6 text-sm border-2 border-black p-6">
                    <div className="col-span-2 grid grid-cols-2 gap-4 border-b border-gray-300 pb-4">
                        <div>
                            <label className="block font-bold mb-1">اللقب (Nom):</label>
                            <div className="font-mono text-lg uppercase">{guest.lastNameEn || guest.lastNameAr}</div>
                        </div>
                        <div>
                            <label className="block font-bold mb-1">الاسم (Prénom):</label>
                            <div className="font-mono text-lg capitalize">{guest.firstNameEn || guest.firstNameAr}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-b border-gray-300 pb-4 col-span-2">
                        <div>
                            <label className="block font-bold mb-1">ابن (Fils de):</label>
                            <div>{guest.fatherName || '....................'}</div>
                        </div>
                        <div>
                            <label className="block font-bold mb-1">و (Et de):</label>
                            <div>{guest.motherName || '....................'}</div>
                        </div>
                    </div>

                    <div className="border-b border-gray-300 pb-4">
                        <label className="block font-bold mb-1">تاريخ الميلاد (Date de Naissance):</label>
                        <div className="font-mono text-lg">{guest.birthDate || '../../....'}</div>
                    </div>
                    <div className="border-b border-gray-300 pb-4">
                        <label className="block font-bold mb-1">مكان الميلاد (Lieu de Naissance):</label>
                        <div>{guest.birthPlace || '....................'}</div>
                    </div>

                    <div className="border-b border-gray-300 pb-4">
                        <label className="block font-bold mb-1">الجنسية (Nationalité):</label>
                        <div>{guest.nationality || 'Jazairia'}</div>
                    </div>
                    <div className="border-b border-gray-300 pb-4">
                        <label className="block font-bold mb-1">المهنة (Profession):</label>
                        <div>....................</div>
                    </div>

                    <div className="col-span-2 border-b border-gray-300 pb-4">
                        <label className="block font-bold mb-1">العنوان الدائم (Domicile Habituel):</label>
                        <div>................................................................................................</div>
                    </div>

                    <div className="col-span-2 grid grid-cols-3 gap-4 border-b border-gray-300 pb-4">
                        <div>
                            <label className="block font-bold mb-1">نوع الوثيقة (Nature):</label>
                            <div>{guest.idType}</div>
                        </div>
                        <div>
                            <label className="block font-bold mb-1">رقمها (Numéro):</label>
                            <div className="font-mono font-bold">{guest.idNumber}</div>
                        </div>
                        <div>
                            <label className="block font-bold mb-1">تاريخ الإصدار (Délivré le):</label>
                            <div>../../....</div>
                        </div>
                    </div>
                </div>

                {renderIDSection()}

                <div className="flex justify-between mt-12 px-8">
                    <div className="text-center">
                        <p className="font-bold mb-12">توقيع النزيل<br/>Signature du Client</p>
                        <div className="w-32 border-b border-black"></div>
                    </div>
                    <div className="text-center">
                        <p className="font-bold mb-12">ختم وتوقيع الفندق<br/>Cachet et Signature</p>
                        <div className="w-32 border-b border-black"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Placeholder for other variants to avoid huge file in one go, but I'll implement them now
    // --- MODERN VARIANT ---
    if (variant === 'modern') {
        return (
            <div className="bg-white p-8 text-black font-sans max-w-[210mm] mx-auto border border-gray-200" dir="rtl">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <div className="text-2xl font-black text-blue-900">FICHE DE POLICE</div>
                    <div className="text-left text-xs font-bold text-gray-500">
                        <p>ALGERIAN REPUBLIC</p>
                        <p>{hotelName}</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="col-span-2 space-y-4">
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Guest Identity</p>
                            <p className="text-xl font-bold">{guest.firstNameAr} {guest.lastNameAr}</p>
                            <p className="text-sm font-mono text-gray-500">{guest.firstNameEn} {guest.lastNameEn}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Birth</p>
                                <p className="font-bold">{guest.birthDate} - {guest.birthPlace}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Nationality</p>
                                <p className="font-bold">{guest.nationality}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-blue-900 text-white p-4 rounded-xl flex flex-col justify-center items-center">
                        <p className="text-[10px] font-bold uppercase mb-2">Room</p>
                        <p className="text-4xl font-black">{roomNumber || '---'}</p>
                    </div>
                </div>
                {renderIDSection()}
                <div className="mt-8 grid grid-cols-2 gap-8">
                    <div className="border-t pt-4">
                        <p className="text-xs font-bold uppercase text-gray-400">Guest Signature</p>
                    </div>
                    <div className="border-t pt-4 text-left">
                        <p className="text-xs font-bold uppercase text-gray-400">Hotel Stamp</p>
                    </div>
                </div>
            </div>
        );
    }

    // Default to a simplified version for others for now to keep it manageable
    return (
        <div className="bg-white p-10 text-black border-2 border-black max-w-[210mm] mx-auto" dir="rtl">
            <h1 className="text-center text-2xl font-bold mb-8 uppercase underline">Police Form / {variant}</h1>
            <div className="space-y-4">
                <p><strong>Name:</strong> {guest.firstNameAr} {guest.lastNameAr}</p>
                <p><strong>ID:</strong> {guest.idNumber} ({guest.idType})</p>
                <p><strong>Room:</strong> {roomNumber}</p>
                <p><strong>Date:</strong> {checkInDate}</p>
            </div>
            {renderIDSection()}
            <div className="mt-20 flex justify-between">
                <div className="border-t border-black w-40 text-center pt-2">Signature</div>
                <div className="border-t border-black w-40 text-center pt-2">Stamp</div>
            </div>
        </div>
    );
};
