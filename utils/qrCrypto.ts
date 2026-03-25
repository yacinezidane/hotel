
// محرك محاكاة التشفير وتوليد الرموز الذكية
// Simulates a secure token structure: Prefix | Base64(Payload) | Signature

export type QRTokenType = 'STAFF' | 'ROOM_KEY' | 'TABLE_ORDER' | 'POOL_ACCESS' | 'INVOICE' | 'ASSET' | 'HALL_EVENT' | 'FACILITY' | 'GUEST_SERVICE' | 'ACCESS_PASS' | 'RESERVATION' | 'HOTEL_CODE' | 'VISITOR_CODE' | 'GUEST_CODE' | 'GROUP_BOOKING_CODE' | 'TICKET' | 'STAFF_ACCESS';

export interface QRPayload {
    t: QRTokenType; // Type
    i: string;      // ID (Staff ID, Room ID, etc.)
    n?: string;     // Name/Label (Optional)
    x?: number;     // Expiry Timestamp
    m?: any;        // Metadata (JSON object for extra details)
}

const SALT = "NUZUL_SECURE_2024";

export const generateSecureToken = (payload: QRPayload): string => {
    try {
        const json = JSON.stringify(payload);
        // Basic Base64 encoding + Salt simulation for "Security"
        const encoded = btoa(unescape(encodeURIComponent(json)));
        const signature = btoa(payload.i + SALT).substring(0, 6); // Mock signature
        return `NZL:${encoded}:${signature}`;
    } catch (e) {
        console.error("QR Generation Error", e);
        return "";
    }
};

export const parseSecureToken = (token: string): QRPayload | null => {
    if (!token.startsWith('NZL:')) return null;
    
    try {
        const parts = token.split(':');
        if (parts.length !== 3) return null;
        
        const encoded = parts[1];
        // The signature (parts[2]) would be verified here in a real backend scenario
        
        const json = decodeURIComponent(escape(atob(encoded)));
        const payload: QRPayload = JSON.parse(json);
        
        // Check Expiry if exists
        if (payload.x && Date.now() > payload.x) {
            console.warn("Token Expired");
            // We return the payload but the UI should handle the expired state
            return { ...payload, m: { ...payload.m, isExpired: true } };
        }

        return payload;
    } catch (e) {
        console.error("QR Parse Error", e);
        return null;
    }
};
