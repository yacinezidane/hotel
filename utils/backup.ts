import { initDB } from './db';
import * as XLSX from 'xlsx';

// Helper to prepare data for Excel (stringify nested objects/arrays)
const prepareForExcel = (obj: any): any => {
    const prepared: any = {};
    Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (value !== null && typeof value === 'object') {
            prepared[key] = JSON.stringify(value); // Keep nested structures as JSON strings
        } else {
            prepared[key] = value;
        }
    });
    return prepared;
};

export const exportDatabase = async (): Promise<Blob> => {
    const db = await initDB();
    const workbook = XLSX.utils.book_new();
    
    const stores = ['users', 'rooms', 'bookings', 'invoices', 'transactions', 'notifications', 'menuItems', 'orders', 'qrRecords', 'settings', 'inventory', 'hallBookings', 'poolPasses', 'maintenanceTickets', 'incidentReports', 'chatSessions', 'messages', 'guestHistory', 'serviceRequests', 'externalOrders', 'coordinationNotes', 'attendanceRecords', 'deliveryDrivers', 'partners', 'servicePoints', 'parkingSpots', 'legalRules', 'jobOpenings', 'jobApplications', 'reservations', 'resourceBookings', 'guestRegistrationForms', 'publicServices', 'facilities', 'hotelEvents', 'activities', 'audit_logs', 'housekeeping'];
    
    for (const storeName of stores) {
        try {
            const data = await db.getAll(storeName as any);
            // Prepare data for Excel
            const excelData = data.map(item => prepareForExcel(item));
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            XLSX.utils.book_append_sheet(workbook, worksheet, storeName);
        } catch (e) {
            console.warn(`Store ${storeName} not found or empty during export`);
        }
    }
    
    // Write to buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const importDatabase = async (file: File): Promise<boolean> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const db = await initDB();
        
        const stores = ['users', 'rooms', 'bookings', 'invoices', 'transactions', 'notifications', 'menuItems', 'orders', 'qrRecords', 'settings', 'inventory', 'hallBookings', 'poolPasses', 'maintenanceTickets', 'incidentReports', 'chatSessions', 'messages', 'guestHistory', 'serviceRequests', 'externalOrders', 'coordinationNotes', 'attendanceRecords', 'deliveryDrivers', 'partners', 'servicePoints', 'parkingSpots', 'legalRules', 'jobOpenings', 'jobApplications', 'reservations', 'resourceBookings', 'guestRegistrationForms', 'publicServices', 'facilities', 'hotelEvents', 'activities', 'audit_logs', 'housekeeping'];
        
        for (const storeName of stores) {
            if (workbook.Sheets[storeName]) {
                const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[storeName]);
                
                const processedData = rawData.map((row: any) => {
                    // Parse JSON strings back to objects/arrays
                    for (const key in row) {
                        const val = row[key];
                        if (typeof val === 'string') {
                            const trimmed = val.trim();
                            if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || 
                                (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
                                try {
                                    row[key] = JSON.parse(trimmed);
                                } catch (e) {
                                    // Keep as string if parsing fails
                                }
                            }
                        }
                    }
                    return row;
                });

                if (Array.isArray(processedData)) {
                    const tx = db.transaction(storeName as any, 'readwrite');
                    const store = tx.objectStore(storeName as any);
                    await store.clear();
                    for (const item of processedData) {
                        await store.put(item);
                    }
                    await tx.done;
                }
            }
        }
        return true;
    } catch (error) {
        console.error('Import failed:', error);
        return false;
    }
};

export const downloadBackup = async () => {
    const blob = await exportDatabase();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `authentic-zellij-backup-${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

