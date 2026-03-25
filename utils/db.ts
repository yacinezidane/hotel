import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { 
    AppState, User, Room, Booking, Invoice, Transaction, Notification, MenuItem, 
    RestaurantOrder, QRRecord, AppSettings, InventoryItem, HallBooking, PoolPass,
    MaintenanceTicket, IncidentReport, ChatSession, Message as ChatMessage, GuestInfo,
    ServiceRequest, ExternalOrder, CoordinationNote, AttendanceRecord, DeliveryDriver, Partner, ServicePoint,
    JobOpening, JobApplication, ParkingSpot, LegalRule, Reservation, ResourceBooking,
    PublicService, Facility, HotelEvent, ServiceFeedback, HotelActivity, GuestRegistrationForm,
    AuditLog, HousekeepingTask, RolePermissionSet
} from '../types';

interface AppDB extends DBSchema {
  users: { key: string; value: User };
  rooms: { key: number; value: Room };
  bookings: { key: string; value: Booking };
  invoices: { key: string; value: Invoice };
  transactions: { key: string; value: Transaction };
  notifications: { key: string; value: Notification };
  menuItems: { key: string; value: MenuItem };
  orders: { key: string; value: RestaurantOrder };
  qrRecords: { key: string; value: QRRecord };
  settings: { key: string; value: AppSettings };
  inventory: { key: string; value: InventoryItem };
  hallBookings: { key: string; value: HallBooking };
  poolPasses: { key: string; value: PoolPass };
  maintenanceTickets: { key: string; value: MaintenanceTicket };
  incidentReports: { key: string; value: IncidentReport };
  chatSessions: { key: string; value: ChatSession };
  messages: { key: string; value: ChatMessage };
  guestHistory: { key: string; value: GuestInfo };
  serviceRequests: { key: string; value: ServiceRequest };
  externalOrders: { key: string; value: ExternalOrder };
  coordinationNotes: { key: string; value: CoordinationNote };
  attendanceRecords: { key: string; value: AttendanceRecord };
  deliveryDrivers: { key: string; value: DeliveryDriver };
  partners: { key: string; value: Partner };
  servicePoints: { key: string; value: ServicePoint };
  jobOpenings: { key: string; value: JobOpening };
  jobApplications: { key: string; value: JobApplication };
  parkingSpots: { key: string; value: ParkingSpot };
  legalRules: { key: string; value: LegalRule };
  reservations: { key: string; value: Reservation };
  resourceBookings: { key: string; value: ResourceBooking };
  publicServices: { key: string; value: PublicService };
  facilities: { key: string; value: Facility };
  hotelEvents: { key: string; value: HotelEvent };
  serviceFeedbacks: { key: string; value: ServiceFeedback };
  activities: { key: string; value: HotelActivity };
  guestRegistrationForms: { key: string; value: GuestRegistrationForm };
  audit_logs: { key: string; value: AuditLog };
  housekeeping: { key: string; value: HousekeepingTask };
  role_permissions: { key: string; value: RolePermissionSet };
}

const DB_NAME = 'authentic-zellij-db';
const DB_VERSION = 19;

export const initDB = async (): Promise<IDBPDatabase<AppDB>> => {
  return openDB<AppDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Migration for version 6: Fix guestHistory keyPath and settings store
      if (oldVersion < 6) {
          if (db.objectStoreNames.contains('guestHistory')) {
              db.deleteObjectStore('guestHistory');
          }
          if (db.objectStoreNames.contains('settings')) {
              db.deleteObjectStore('settings');
          }
      }

      if (!db.objectStoreNames.contains('users')) db.createObjectStore('users', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('rooms')) db.createObjectStore('rooms', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('bookings')) db.createObjectStore('bookings', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('invoices')) db.createObjectStore('invoices', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('transactions')) db.createObjectStore('transactions', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('notifications')) db.createObjectStore('notifications', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('menuItems')) db.createObjectStore('menuItems', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('orders')) db.createObjectStore('orders', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('qrRecords')) db.createObjectStore('qrRecords', { keyPath: 'id' });
      
      // New Stores
      if (!db.objectStoreNames.contains('inventory')) db.createObjectStore('inventory', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('hallBookings')) db.createObjectStore('hallBookings', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('poolPasses')) db.createObjectStore('poolPasses', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('maintenanceTickets')) db.createObjectStore('maintenanceTickets', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('incidentReports')) db.createObjectStore('incidentReports', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('chatSessions')) db.createObjectStore('chatSessions', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('messages')) db.createObjectStore('messages', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('guestHistory')) db.createObjectStore('guestHistory', { keyPath: 'idNumber' });
      if (!db.objectStoreNames.contains('serviceRequests')) db.createObjectStore('serviceRequests', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('externalOrders')) db.createObjectStore('externalOrders', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('coordinationNotes')) db.createObjectStore('coordinationNotes', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('attendanceRecords')) db.createObjectStore('attendanceRecords', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('deliveryDrivers')) db.createObjectStore('deliveryDrivers', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('partners')) db.createObjectStore('partners', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('servicePoints')) db.createObjectStore('servicePoints', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('jobOpenings')) db.createObjectStore('jobOpenings', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('jobApplications')) db.createObjectStore('jobApplications', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('parkingSpots')) db.createObjectStore('parkingSpots', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('legalRules')) db.createObjectStore('legalRules', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('reservations')) db.createObjectStore('reservations', { keyPath: 'id' });

      // Add missing stores if they don't exist
      if (!db.objectStoreNames.contains('resourceBookings')) {
        db.createObjectStore('resourceBookings', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('publicServices')) {
        db.createObjectStore('publicServices', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('facilities')) {
        db.createObjectStore('facilities', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('hotelEvents')) {
        db.createObjectStore('hotelEvents', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('serviceFeedbacks')) {
        db.createObjectStore('serviceFeedbacks', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('activities')) {
        db.createObjectStore('activities', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('guestRegistrationForms')) {
        db.createObjectStore('guestRegistrationForms', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('audit_logs')) {
        db.createObjectStore('audit_logs', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('housekeeping')) {
        db.createObjectStore('housekeeping', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('role_permissions')) {
        db.createObjectStore('role_permissions', { keyPath: 'role' });
      }

      // Settings store (no keyPath for out-of-line keys)
      if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings'); 
      }
    },
  });
};

export const saveEntity = async <T>(storeName: any, data: T) => {
  const db = await initDB();
  await db.put(storeName, data as any);
};

export const saveAll = async (storeName: any, data: any[]) => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  await store.clear();
  for (const item of data) {
    await store.put(item);
  }
  await tx.done;
};

export const loadAll = async <T>(storeName: any): Promise<T[]> => {
  const db = await initDB();
  return db.getAll(storeName) as Promise<T[]>;
};

export const saveSettings = async (settings: AppSettings) => {
    const db = await initDB();
    await db.put('settings', settings, 'config');
}

export const loadSettings = async (): Promise<AppSettings | undefined> => {
    const db = await initDB();
    return db.get('settings', 'config');
}

export const exportAllData = async () => {
  const db = await initDB();
  const storeNames = Array.from(db.objectStoreNames);
  const data: Record<string, any[]> = {};
  
  for (const storeName of storeNames) {
    if (storeName === 'settings') {
      const config = await db.get('settings', 'config');
      data[storeName] = config ? [config] : [];
    } else {
      data[storeName] = await db.getAll(storeName as any);
    }
  }
  return data;
};

export const importAllData = async (data: Record<string, any[]>) => {
  const db = await initDB();
  const storeNames = Array.from(db.objectStoreNames);
  
  for (const storeName of storeNames) {
    const tx = db.transaction(storeName as any, 'readwrite');
    const store = tx.objectStore(storeName as any);
    await store.clear();
    
    if (data[storeName]) {
      if (storeName === 'settings') {
        if (data[storeName][0]) {
          await store.put(data[storeName][0], 'config');
        }
      } else {
        for (const item of data[storeName]) {
          await store.put(item);
        }
      }
    }
    await tx.done;
  }
};

export const mergeGuestHistory = async (guests: GuestInfo[]) => {
  const db = await initDB();
  const tx = db.transaction('guestHistory', 'readwrite');
  const store = tx.objectStore('guestHistory');
  
  for (const guest of guests) {
    const existing = await store.get(guest.idNumber);
    if (!existing) {
      await store.put(guest);
    }
  }
  await tx.done;
};
