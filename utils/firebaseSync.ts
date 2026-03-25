
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  where, 
  Timestamp,
  writeBatch,
  getDoc,
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { saveAll, loadAll, saveSettings, loadSettings } from './db';

const SYNC_COLLECTIONS = [
  'users',
  'rooms',
  'bookings',
  'invoices',
  'transactions',
  'notifications',
  'menuItems',
  'orders',
  'qrRecords',
  'inventory',
  'hallBookings',
  'poolPasses',
  'maintenanceTickets',
  'incidentReports',
  'chatSessions',
  'messages',
  'guestHistory',
  'serviceRequests',
  'externalOrders',
  'coordinationNotes',
  'attendanceRecords',
  'deliveryDrivers',
  'partners',
  'servicePoints',
  'jobOpenings',
  'jobApplications',
  'parkingSpots',
  'legalRules',
  'reservations',
  'resourceBookings',
  'publicServices',
  'facilities',
  'hotelEvents',
  'serviceFeedbacks',
  'activities',
  'guestRegistrationForms',
  'audit_logs',
  'housekeeping',
  'role_permissions'
];

export const syncToFirestore = async (collectionName: string, data: any[]) => {
  if (!auth.currentUser) return;
  
  try {
    const batch = writeBatch(db);
    data.forEach((item) => {
      // Use id or idNumber as document ID
      const id = item.id || item.idNumber || item.token;
      if (id) {
        const docRef = doc(db, collectionName, String(id));
        batch.set(docRef, { ...item, _updatedAt: Timestamp.now() }, { merge: true });
      }
    });
    await batch.commit();
  } catch (error) {
    console.error(`Error syncing ${collectionName} to Firestore:`, error);
  }
};

export const syncSettingsToFirestore = async (settings: any) => {
  if (!auth.currentUser) return;
  try {
    const docRef = doc(db, 'settings', 'global');
    await setDoc(docRef, { ...settings, _updatedAt: Timestamp.now() }, { merge: true });
  } catch (error) {
    console.error('Error syncing settings to Firestore:', error);
  }
};

export const pullFromFirestore = async (collectionName: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data: any[] = [];
    querySnapshot.forEach((doc) => {
      const docData = doc.data();
      delete docData._updatedAt;
      data.push(docData);
    });
    if (data.length > 0) {
      await saveAll(collectionName, data);
    }
    return data;
  } catch (error) {
    console.error(`Error pulling ${collectionName} from Firestore:`, error);
    return null;
  }
};

export const pullSettingsFromFirestore = async () => {
  try {
    const docRef = doc(db, 'settings', 'global');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      delete data._updatedAt;
      await saveSettings(data as any);
      return data;
    }
    return null;
  } catch (error) {
    console.error('Error pulling settings from Firestore:', error);
    return null;
  }
};

export const setupFirestoreListeners = (onUpdate: (collectionName: string, data: any[]) => void) => {
  const unsubscribes: (() => void)[] = [];

  SYNC_COLLECTIONS.forEach((colName) => {
    const q = query(collection(db, colName));
    const unsub = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach((doc) => {
        const docData = doc.data();
        delete docData._updatedAt;
        data.push(docData);
      });
      if (data.length > 0) {
        onUpdate(colName, data);
      }
    }, (error) => {
      console.error(`Listener error for ${colName}:`, error);
    });
    unsubscribes.push(unsub);
  });

  // Settings listener
  const settingsUnsub = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      delete data._updatedAt;
      onUpdate('settings', [data]);
    }
  });
  unsubscribes.push(settingsUnsub);

  return () => unsubscribes.forEach(unsub => unsub());
};
