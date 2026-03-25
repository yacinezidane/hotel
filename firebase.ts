import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import defaultFirebaseConfig from './firebase-applet-config.json';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

const getPrivateConfig = () => {
    const saved = localStorage.getItem('hotel_private_firebase_config');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            return null;
        }
    }
    return null;
};

const config = getPrivateConfig() || defaultFirebaseConfig;
const databaseId = config.databaseId || (defaultFirebaseConfig as any).firestoreDatabaseId;

if (!getApps().length) {
    app = initializeApp(config);
} else {
    app = getApp();
}

auth = getAuth(app);
db = getFirestore(app, databaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  try {
    // Attempt to fetch a document that is allowed for reading to test connectivity
    await getDocFromServer(doc(db, 'settings', 'global'));
    console.log("Firebase connection test successful.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    } else {
        // We expect a "not found" or "permission denied" if the doc doesn't exist, 
        // which still means we are online.
        console.log("Firebase connection test completed (may have returned expected error).");
    }
  }
}

export { auth, db, app };
export default app;

// Run connection test on startup
testConnection();
