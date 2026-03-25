
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { AppSettings, AppState, Booking, Invoice, Message as ChatMessage, Notification, Room, RoomStatus, User, RoomType, GuestInfo, ChatSession, Transaction, Role, HallBooking, PoolPass, RestaurantOrder, QRRecord, MaintenanceTicket, Department, MenuItem, ServiceItem, ServiceRequest, ServiceLocationType, SecurityLog, QRScanLog, QRUsageType, GuestLocationStatus, StandardRates, PriceOption, LeaveRequest, LeaveStatus, StaffRequest, AttendanceRecord, AttendanceStatus, Table, IncidentReport, IncidentSeverity, IncidentType, ExternalOrder, CoordinationNote, PrintTemplateStyle, RegistrationTemplateStyle, InventoryItem, DeliveryDriver, Partner, ServicePoint, ParkingSpot, LegalRule, JobOpening, JobApplication, Reservation, PrintTemplate, DesktopConfig, ResourceBooking, BookableUnit, PublicService, Facility, HotelEvent, ServiceFeedback, HotelActivity, GuestRegistrationForm, AuditLog, HousekeepingTask, CartItem, UserPermissions, RolePermissionSet } from '../types';
import { INITIAL_SETTINGS, MOCK_USERS, generateRooms, DEFAULT_MENU, INITIAL_SERVICES, STAFF_PERMISSIONS, INITIAL_INVENTORY, INITIAL_TABLES, INITIAL_PARKING_SPOTS, INITIAL_LEGAL_RULES, INITIAL_PUBLIC_SERVICES, INITIAL_FACILITIES, INITIAL_HOTEL_EVENTS, DEFAULT_ROLE_PERMISSIONS } from '../constants';
import { generateSecureToken, parseSecureToken, QRPayload, QRTokenType } from '../utils/qrCrypto';
import { injectDemoData } from '../utils/demoData';
import { initDB, saveEntity, loadAll, saveSettings, loadSettings, saveAll } from '../utils/db';
import { 
    syncToFirestore, 
    syncSettingsToFirestore, 
    pullFromFirestore, 
    pullSettingsFromFirestore, 
    setupFirestoreListeners 
} from '../utils/firebaseSync';
import { 
    generateMockUsers, generateMockRooms, generateMockGuests, 
    generateMockBookings, generateMockTransactions, generateMockMaintenanceTickets, 
    generateMockNotifications, generateMockHallBookings, generateMockRestaurantOrders, 
    generateMockAttendance, generateMockPoolPasses, generateMockChatSessions, 
    generateMockMessages, generateMockServiceRequests, generateMockExternalOrders, 
    generateMockCoordinationNotes, generateMockIncidentReports,
    generateMockServicePoints, generateMockDeliveryDrivers, generateMockActivities
} from '../utils/populateData';

interface NotificationTargets {
    roles?: Role[];
    departments?: Department[];
    users?: string[];
}

interface HotelContextType extends AppState {
  login: (userId: string) => void;
  logout: () => void;
  forgetUser: (userId: string) => void; 
  recentUsers: string[]; 
  updateUser: (userId: string, data: Partial<User>, notificationNote?: string) => void;
  addStaff: (name: string, role: Role, department: Department, isHead: boolean, salary: number, accessCode: string) => void;
  removeStaff: (userId: string) => void;
  
  // Recruitment
  jobOpenings: JobOpening[];
  jobApplications: JobApplication[];
  addJobOpening: (job: Omit<JobOpening, 'id' | 'postedDate' | 'status'>) => void;
  updateJobOpening: (id: string, updates: Partial<JobOpening>) => void;
  addJobApplication: (app: Omit<JobApplication, 'id' | 'appliedDate' | 'status'>) => void;
  updateJobApplicationStatus: (id: string, status: JobApplication['status']) => void;

  // Print Templates & Desktop
  addPrintTemplate: (template: Omit<PrintTemplate, 'id'>) => void;
  updatePrintTemplate: (id: string, updates: Partial<PrintTemplate>) => void;
  deletePrintTemplate: (id: string) => void;
  updateDesktopConfig: (updates: Partial<DesktopConfig>) => void;

  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updatePageTitle: (key: string, title: string) => void; 
  updateRoomStatus: (roomId: number, status: RoomStatus) => void;
  updateRoomType: (roomId: number, type: RoomType) => void;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => void;
  addBooking: (booking: Omit<Booking, 'guestToken' | 'id'>, roomIds: number[]) => Booking;
  extendBooking: (bookingId: string, days: number) => void; 
  moveBooking: (bookingId: string, newRoomId: number, reason?: string, newPrice?: number) => void;
  splitBooking: (originalBookingId: string, guestIndicesToMove: number[], newRoomId: number, newPrice: number) => void;
  addGuestToRoom: (roomId: number, guest: GuestInfo, newTotalAmount?: number) => void;
  checkIn: (bookingId: string, roomId?: number) => void;
  checkOut: (bookingId: string) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'userId' | 'userName'> & { userId?: string; userName?: string }) => void; 
  clearUserBalance: (targetUserId: string, amount: number) => void; 
  sendMessage: (content: string, receiverId?: string) => void;
  sendGuestMessage: (token: string, content: string, recipientId?: string) => void;
  replyToGuest: (guestToken: string, content: string) => void;
  toggleChatMute: (sessionId: string) => void;
  toggleShortcut: (actionId: string) => void;
  toggleDarkMode: () => void;
  setTheme: (theme: AppSettings['theme']) => void;
  searchGuest: (idNumber: string) => GuestInfo | undefined;
  
  // Pricing Updates
  updateRoomPrices: (type: RoomType, prices: PriceOption[]) => void;
  updateStandardRate: (key: keyof StandardRates, value: number) => void;
  updateServiceAvailability: (key: string, value: boolean) => void;
  updateRoomCount: (count: number) => void;

  // Notifications
  addNotification: (msg: string, type?: Notification['type'], details?: string, targets?: NotificationTargets, action?: { link: string, label: string }, category?: Notification['category']) => void;
  activeToast: Notification | null;
  hideToast: () => void;
  markAsRead: (id: string) => void; // New
  moveToTrash: (id: string) => void; 
  deleteNotificationPermanently: (id: string) => void; 
  restoreNotification: (id: string) => void; 
  emptyTrash: () => void; 
  
  addHallBooking: (booking: HallBooking) => void;
  cancelHallBooking: (id: string) => void;
  createPoolPass: (pass: PoolPass) => PoolPass; 
  invalidatePoolPass: (id: string) => void;
  
  // Restaurant Extended
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  addRestaurantOrder: (order: RestaurantOrder) => void;
  updateRestaurantOrder: (id: string, status: RestaurantOrder['status']) => void;
  updateRestaurantOrderItems: (orderId: string, newItems: { item: MenuItem; quantity: number }[]) => void;
  inventory: InventoryItem[];
  updateInventory: (itemId: string, quantityChange: number) => void;
  updateTableStatus: (tableId: string, status: Table['status'], orderId?: string) => void;
  chargeOrderToRoom: (orderId: string, roomId: number) => void;
  
  // Table Management (New)
  addTable: (table: Table) => void;
  removeTable: (tableId: string) => void;
  updateTableDetails: (tableId: string, updates: Partial<Table>) => void;
  
  // QR System (Secure)
  addQRRecord: (record: Omit<QRRecord, 'id' | 'createdAt' | 'scannedCount' | 'currentState' | 'usageType'>, usageType?: QRUsageType) => void;
  scanQRRecord: (id: string) => void;
  resetQRState: (qrId: string) => void;
  regenerateBookingQR: (booking: Booking) => string;
  generateSystemQR: (type: QRTokenType, id: string, name?: string, expiryDays?: number, meta?: any) => string;
  parseSystemQR: (token: string) => QRPayload | null;
  toggleGuestPresence: (bookingId: string, status: GuestLocationStatus) => void;

  // External Services
  addExternalOrder: (order: Omit<ExternalOrder, 'id' | 'timestamp' | 'status'>) => void;
  updateExternalOrderStatus: (id: string, status: ExternalOrder['status']) => void;
  
  // Coordination
  addCoordinationNote: (note: Omit<CoordinationNote, 'id' | 'createdAt' | 'createdBy' | 'isResolved'>) => void;
  resolveCoordinationNote: (id: string) => void;

  // Maintenance System
  addMaintenanceTicket: (ticket: Omit<MaintenanceTicket, 'id' | 'reportedAt' | 'status' | 'reportedBy'>) => void;
  resolveMaintenanceTicket: (id: string, cost?: number) => void;

  userShortcuts: string[];
  partners: any[];

  // Guest Services
  toggleServiceStatus: (serviceId: string) => void;
  addNewService: (service: Omit<ServiceItem, 'id'>) => void;
  removeService: (serviceId: string) => void;
  requestService: (serviceId: string, locationType: ServiceLocationType, locationId: string, notes?: string) => void;
  updateServiceRequestStatus: (requestId: string, status: ServiceRequest['status']) => void;
  updateServiceItem: (id: string, data: Partial<ServiceItem>) => void; 

  // Global Profile Modal
  activeProfile: User | null;
  setActiveProfile: (user: User | null) => void;

  // Security
  addSecurityLog: (log: Omit<SecurityLog, 'id' | 'timestamp' | 'reportedBy'>) => void;

  // Leave Management
  addLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) => void;
  updateLeaveStatus: (id: string, status: LeaveStatus, reason?: string) => void;

  // Staff Requests
  submitStaffRequest: (req: Omit<StaffRequest, 'id' | 'status' | 'createdAt'>) => void;

  // Attendance Management
  recordAttendance: (userId: string, type: 'in' | 'out', timestamp?: string) => void;
  updateAttendanceRecord: (id: string, updates: Partial<AttendanceRecord>) => void;
  attendanceRecords: AttendanceRecord[];
  restaurantTables: Table[];

  // Incidents & Violations
  incidentReports: IncidentReport[];
  reportIncident: (incident: Omit<IncidentReport, 'id' | 'reportedAt' | 'status' | 'isFineApplied'>) => void;
  resolveIncident: (id: string, action: 'resolve' | 'dismiss' | 'apply_fine', resolutionNotes?: string) => void;

  // Delivery & Services
  deliveryDrivers: DeliveryDriver[];
  servicePoints: ServicePoint[];
  parkingSpots: ParkingSpot[];
  legalRules: LegalRule[];
  addDeliveryDriver: (driver: DeliveryDriver) => void;
  updateDriverStatus: (driverId: string, status: DeliveryDriver['status']) => void;
  assignDriverToOrder: (orderId: string, driverId: string) => void;
  rateDeliveryOrder: (orderId: string, deliveryRating: number, restaurantRating: number, feedback?: string) => void;
  addServicePoint: (point: ServicePoint) => void;
  updateServicePoint: (id: string, updates: Partial<ServicePoint>) => void;
  deleteServicePoint: (id: string) => void;
  
  // Parking
  addParkingSpot: (spot: ParkingSpot) => void;
  updateParkingSpot: (id: string, updates: Partial<ParkingSpot>) => void;
  
  // Legal
  addLegalRule: (rule: LegalRule) => void;
  updateLegalRule: (id: string, updates: Partial<LegalRule>) => void;

  // Partnership Management
  addPartner: (partner: Partner) => void;
  updatePartner: (id: string, updates: Partial<Partner>) => void;
  removePartner: (id: string) => void;

  // Reservations
  reservations: Reservation[];
  addReservation: (reservation: Omit<Reservation, 'id' | 'createdAt' | 'status' | 'qrCodeData'>) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;

  // Guest Registration Forms (New)
  guestRegistrationForms: GuestRegistrationForm[];
  submitGuestRegistrationForm: (form: Omit<GuestRegistrationForm, 'id' | 'submittedAt' | 'status'>) => void;
  updateGuestRegistrationFormStatus: (id: string, status: GuestRegistrationForm['status']) => void;

  // Booking Approval (New)
  confirmBooking: (bookingId: string) => void;
  cancelBooking: (bookingId: string) => void;
  toggleAutoApproval: () => void;

  // Resource Bookings (New)
  resourceBookings: ResourceBooking[];
  addResourceBooking: (booking: Omit<ResourceBooking, 'id' | 'createdAt' | 'status'>) => void;
  updateResourceBooking: (id: string, updates: Partial<ResourceBooking>) => void;
  updateServicePointUnit: (servicePointId: string, unitId: string, updates: Partial<BookableUnit>) => void;

  // Public Website Content
  publicServices: PublicService[];
  facilities: Facility[];
  hotelEvents: HotelEvent[];
  addPublicService: (service: PublicService) => void;
  updatePublicService: (id: string, updates: Partial<PublicService>) => void;
  deletePublicService: (id: string) => void;
  addFacility: (facility: Facility) => void;
  updateFacility: (id: string, updates: Partial<Facility>) => void;
  deleteFacility: (id: string) => void;
  addHotelEvent: (event: HotelEvent) => void;
  updateHotelEvent: (id: string, updates: Partial<HotelEvent>) => void;
  deleteHotelEvent: (id: string) => void;

  // Activities
  activities: HotelActivity[];
  addActivity: (activity: HotelActivity) => void;
  updateActivity: (id: string, updates: Partial<HotelActivity>) => void;
  deleteActivity: (id: string) => void;

  // Audit Logs (New)
  auditLogs: AuditLog[];
  addAuditLog: (action: string, details: string, category: AuditLog['category'], metadata?: any) => void;

  // Housekeeping (New)
  housekeepingTasks: HousekeepingTask[];
  updateHousekeepingTask: (id: string, updates: Partial<HousekeepingTask>) => void;
  assignHousekeepingTask: (taskId: string, staffId: string, staffName: string) => void;

  // Permissions (New)
  rolePermissions: RolePermissionSet[];
  updateRolePermissions: (role: Role, permissions: UserPermissions) => void;
  checkPermission: (permission: keyof UserPermissions) => boolean;
  canAccessPage: (pageKey: string) => boolean;
  canPerformAction: (actionKey: string) => boolean;
  isButtonVisible: (buttonId: string) => boolean;

  // Guest Self Check-in (New)
  submitSelfCheckIn: (bookingId: string, data: { idPhoto: string, privacySignature: string }) => void;

  // System
  populateDemoData: () => Promise<void>;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};

export const HotelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ... (State initialization remains same)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [rooms, setRooms] = useState<Room[]>(generateRooms(INITIAL_SETTINGS.totalRooms));
  
  const [recentUsers, setRecentUsers] = useState<string[]>([]);
  const [guestProfile, setGuestProfile] = useState<{ name: string, phone: string, idNumber: string, membershipCode: string } | null>(() => {
    const saved = localStorage.getItem('guestProfile');
    return saved ? JSON.parse(saved) : null;
  });

  const registerGuest = (profile: { name: string, phone: string, idNumber: string, membershipCode?: string }) => {
    const mCode = profile.membershipCode || `ALG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const fullProfile = { ...profile, membershipCode: mCode };
    setGuestProfile(fullProfile);
    localStorage.setItem('guestProfile', JSON.stringify(fullProfile));
  };
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeToast, setActiveToast] = useState<Notification | null>(null);
  const [activeProfile, setActiveProfile] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [hallBookings, setHallBookings] = useState<HallBooking[]>([]);
  const [poolPasses, setPoolPasses] = useState<PoolPass[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU);
  const [restaurantOrders, setRestaurantOrders] = useState<RestaurantOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [restaurantTables, setRestaurantTables] = useState<Table[]>(INITIAL_TABLES);
  const [qrRecords, setQrRecords] = useState<QRRecord[]>([]);
  const [qrLogs, setQrLogs] = useState<QRScanLog[]>([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>([]);
  const [guestHistory, setGuestHistory] = useState<GuestInfo[]>([]);
  const [userShortcuts, setUserShortcuts] = useState<string[]>([]);
  const [guestServices, setGuestServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [staffRequests, setStaffRequests] = useState<StaffRequest[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const updateCartItemQuantity = (itemId: string, quantity: number) => {
    setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity: Math.max(0, quantity) } : i).filter(i => i.quantity > 0));
  };

  const updateCartItemNotes = (itemId: string, notes: string) => {
    setCart(prev => prev.map(i => i.id === itemId ? { ...i, notes } : i));
  };

  const clearCart = () => setCart([]);

  const [incidentReports, setIncidentReports] = useState<IncidentReport[]>([]);
  const [externalOrders, setExternalOrders] = useState<ExternalOrder[]>([]);
  const [coordinationNotes, setCoordinationNotes] = useState<CoordinationNote[]>([]);
  const [deliveryDrivers, setDeliveryDrivers] = useState<DeliveryDriver[]>([]);
  const [servicePoints, setServicePoints] = useState<ServicePoint[]>([]); // New State
  const [partners, setPartners] = useState<Partner[]>([]); // New State
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>(INITIAL_PARKING_SPOTS); // New State
  const [legalRules, setLegalRules] = useState<LegalRule[]>(INITIAL_LEGAL_RULES); // New State
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([]); // New State
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]); // New State
  const [reservations, setReservations] = useState<Reservation[]>([]); // New State
  const [guestRegistrationForms, setGuestRegistrationForms] = useState<GuestRegistrationForm[]>([]); // New State
  const [resourceBookings, setResourceBookings] = useState<ResourceBooking[]>([]); // New State
  const [publicServices, setPublicServices] = useState<PublicService[]>([]); // New State
  const [facilities, setFacilities] = useState<Facility[]>([]); // New State
  const [hotelEvents, setHotelEvents] = useState<HotelEvent[]>([]); // New State
  const [serviceFeedbacks, setServiceFeedbacks] = useState<ServiceFeedback[]>([]); // New State
  const [activities, setActivities] = useState<HotelActivity[]>([]); // New State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]); // New State
  const [housekeepingTasks, setHousekeepingTasks] = useState<HousekeepingTask[]>([]); // New State
  const [rolePermissions, setRolePermissions] = useState<RolePermissionSet[]>([]); // New State

  // --- FIREBASE AUTH SYNC ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Try to find matching user in our local state
        const matchedUser = users.find(u => u.email === firebaseUser.email || u.id === firebaseUser.uid);
        if (matchedUser) {
          setCurrentUser(matchedUser);
        } else {
          // If not found, we might need to create a profile or just set a basic one
          // For now, let's just log it
          console.log("Firebase user logged in but no matching hotel staff found:", firebaseUser.email);
        }
        
        // Start Firestore Listeners when logged in
        const unsubListeners = setupFirestoreListeners((colName, data) => {
          if (colName === 'settings') {
            setSettings(prev => ({ ...prev, ...data[0] }));
          } else {
            // Generic update for other collections
            const setterMap: { [key: string]: React.Dispatch<React.SetStateAction<any[]>> } = {
              'users': setUsers,
              'rooms': setRooms,
              'bookings': setBookings,
              'invoices': setInvoices,
              'transactions': setTransactions,
              'notifications': setNotifications,
              'menuItems': setMenuItems,
              'orders': setRestaurantOrders,
              'qrRecords': setQrRecords,
              'inventory': setInventory,
              'hallBookings': setHallBookings,
              'poolPasses': setPoolPasses,
              'maintenanceTickets': setMaintenanceTickets,
              'incidentReports': setIncidentReports,
              'chatSessions': setChatSessions,
              'messages': setMessages,
              'guestHistory': setGuestHistory,
              'serviceRequests': setServiceRequests,
              'externalOrders': setExternalOrders,
              'coordinationNotes': setCoordinationNotes,
              'attendanceRecords': setAttendanceRecords,
              'deliveryDrivers': setDeliveryDrivers,
              'partners': setPartners,
              'servicePoints': setServicePoints,
              'parkingSpots': setParkingSpots,
              'legalRules': setLegalRules,
              'jobOpenings': setJobOpenings,
              'jobApplications': setJobApplications,
              'reservations': setReservations,
              'resourceBookings': setResourceBookings,
              'guestRegistrationForms': setGuestRegistrationForms,
              'publicServices': setPublicServices,
              'facilities': setFacilities,
              'hotelEvents': setHotelEvents,
              'serviceFeedbacks': setServiceFeedbacks,
              'activities': setActivities,
              'audit_logs': setAuditLogs,
              'housekeeping': setHousekeepingTasks,
              'role_permissions': setRolePermissions
            };
            
            const setter = setterMap[colName];
            if (setter) {
              setter(data);
            }
          }
        });
        return () => unsubListeners();
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, [users]);

  // --- DB LOADING ---
  useEffect(() => {
      const loadData = async () => {
          try {
              const [
                  savedSettings, savedUsers, savedRooms, savedBookings, savedInvoices, 
                  savedTransactions, savedNotifications, savedMenuItems, savedOrders, savedQrRecords,
                  savedInventory, savedHallBookings, savedPoolPasses, savedMaintenanceTickets,
                  savedIncidentReports, savedChatSessions, savedMessages, savedGuestHistory,
                  savedServiceRequests, savedExternalOrders, savedCoordinationNotes, savedAttendanceRecords,
                  savedDrivers, savedPartners, savedServicePoints, savedParkingSpots, savedLegalRules,
                  savedJobOpenings, savedJobApplications, savedReservations, savedResourceBookings,
                  savedGuestRegistrationForms,
                  savedPublicServices, savedFacilities, savedHotelEvents, savedServiceFeedbacks,
                  savedActivities,
                  savedAuditLogs, savedHousekeepingTasks,
                  savedRolePermissions
              ] = await Promise.all([
                  loadSettings(),
                  loadAll<User>('users'),
                  loadAll<Room>('rooms'),
                  loadAll<Booking>('bookings'),
                  loadAll<Invoice>('invoices'),
                  loadAll<Transaction>('transactions'),
                  loadAll<Notification>('notifications'),
                  loadAll<MenuItem>('menuItems'),
                  loadAll<RestaurantOrder>('orders'),
                  loadAll<QRRecord>('qrRecords'),
                  loadAll<InventoryItem>('inventory'),
                  loadAll<HallBooking>('hallBookings'),
                  loadAll<PoolPass>('poolPasses'),
                  loadAll<MaintenanceTicket>('maintenanceTickets'),
                  loadAll<IncidentReport>('incidentReports'),
                  loadAll<ChatSession>('chatSessions'),
                  loadAll<ChatMessage>('messages'),
                  loadAll<GuestInfo>('guestHistory'),
                  loadAll<ServiceRequest>('serviceRequests'),
                  loadAll<ExternalOrder>('externalOrders'),
                  loadAll<CoordinationNote>('coordinationNotes'),
                  loadAll<AttendanceRecord>('attendanceRecords'),
                  loadAll<DeliveryDriver>('deliveryDrivers'),
                  loadAll<Partner>('partners'), // New Load
                  loadAll<ServicePoint>('servicePoints'), // New Load
                  loadAll<ParkingSpot>('parkingSpots'), // New Load
                  loadAll<LegalRule>('legalRules'), // New Load
                  loadAll<JobOpening>('jobOpenings'), // New Load
                  loadAll<JobApplication>('jobApplications'), // New Load
                  loadAll<Reservation>('reservations'), // New Load
                  loadAll<ResourceBooking>('resourceBookings'), // New Load
                  loadAll<GuestRegistrationForm>('guestRegistrationForms'), // New Load
                  loadAll<PublicService>('publicServices'), // New Load
                  loadAll<Facility>('facilities'), // New Load
                  loadAll<HotelEvent>('hotelEvents'), // New Load
                  loadAll<ServiceFeedback>('serviceFeedbacks'), // New Load
                  loadAll<HotelActivity>('activities'), // New Load
                  loadAll<AuditLog>('audit_logs'), // New Load
                  loadAll<HousekeepingTask>('housekeeping'), // New Load
                  loadAll<RolePermissionSet>('role_permissions') // New Load
              ]);

              if (savedSettings) {
                  setSettings({ ...INITIAL_SETTINGS, ...savedSettings });
              }
              
              // POPULATE IF EMPTY
              if (!savedUsers || savedUsers.length === 0) {
                  console.log("DB Empty: Populating with Mock Data...");
                  const newUsers = generateMockUsers();
                  const newRooms = generateMockRooms(INITIAL_SETTINGS.totalRooms);
                  const newGuests = generateMockGuests();
                  const newBookings = generateMockBookings(newRooms, newGuests);
                  const newTransactions = generateMockTransactions(newUsers);
                  const newMaintenance = generateMockMaintenanceTickets(newRooms, newUsers);
                  const newNotifications = generateMockNotifications(newUsers);
                  const newHallBookings = generateMockHallBookings();
                  const newOrders = generateMockRestaurantOrders(DEFAULT_MENU);
                  const newAttendance = generateMockAttendance(newUsers);
                  const rawServicePoints = generateMockServicePoints();
                  const newServicePoints: ServicePoint[] = rawServicePoints.map(sp => ({
                      ...sp,
                      units: sp.units && sp.units.length > 0 ? sp.units : Array.from({ length: 10 }).map((_, i) => ({
                          id: `unit-${sp.id}-${i}`,
                          name: `طاولة ${i + 1}`,
                          type: 'table',
                          capacity: 4,
                          status: Math.random() > 0.7 ? 'occupied' : 'available',
                          classification: 'standard',
                          basePrice: 0,
                          position: { x: 15 + (i % 3) * 25, y: 20 + Math.floor(i / 3) * 25, rotation: 0 }
                      })) as BookableUnit[]
                  }));
                  const newDrivers = generateMockDeliveryDrivers();
                  const newActivities = generateMockActivities();

                  setUsers(newUsers);
                  setRooms(newRooms);
                  setBookings(newBookings);
                  setGuestHistory(newGuests);
                  setTransactions(newTransactions);
                  setMaintenanceTickets(newMaintenance);
                  setNotifications(newNotifications);
                  setHallBookings(newHallBookings);
                  setRestaurantOrders(newOrders);
                  setAttendanceRecords(newAttendance);
                  setServicePoints(newServicePoints);
                  setDeliveryDrivers(newDrivers);
                  setPublicServices(INITIAL_PUBLIC_SERVICES);
                  setFacilities(INITIAL_FACILITIES);
                  setHotelEvents(INITIAL_HOTEL_EVENTS);
                  setActivities(newActivities);
                  
                  // Save immediately
                  await Promise.all([
                      saveAll('users', newUsers),
                      saveAll('rooms', newRooms),
                      saveAll('bookings', newBookings),
                      saveAll('transactions', newTransactions),
                      saveAll('notifications', newNotifications),
                      saveAll('orders', newOrders),
                      saveAll('guestHistory', newGuests),
                      saveAll('maintenanceTickets', newMaintenance),
                      saveAll('hallBookings', newHallBookings),
                      saveAll('attendanceRecords', newAttendance),
                      saveAll('servicePoints', newServicePoints),
                      saveAll('deliveryDrivers', newDrivers),
                      saveAll('publicServices', INITIAL_PUBLIC_SERVICES),
                      saveAll('facilities', INITIAL_FACILITIES),
                      saveAll('hotelEvents', INITIAL_HOTEL_EVENTS),
                      saveAll('activities', newActivities)
                  ]);
              } else {
                  setUsers(savedUsers);
                  setRooms(savedRooms.length > 0 ? savedRooms : generateMockRooms(INITIAL_SETTINGS.totalRooms));
                  if (savedBookings.length > 0) setBookings(savedBookings);
                  if (savedInvoices.length > 0) setInvoices(savedInvoices);
                  if (savedTransactions.length > 0) setTransactions(savedTransactions);
                  if (savedNotifications.length > 0) setNotifications(savedNotifications);
                  if (savedMenuItems.length > 0) setMenuItems(savedMenuItems);
                  if (savedOrders.length > 0) setRestaurantOrders(savedOrders);
                  if (savedQrRecords.length > 0) setQrRecords(savedQrRecords);
                  
                  if (savedInventory.length > 0) setInventory(savedInventory);
                  if (savedHallBookings.length > 0) setHallBookings(savedHallBookings);
                  if (savedPoolPasses.length > 0) setPoolPasses(savedPoolPasses);
                  if (savedMaintenanceTickets.length > 0) setMaintenanceTickets(savedMaintenanceTickets);
                  if (savedIncidentReports.length > 0) setIncidentReports(savedIncidentReports);
                  if (savedChatSessions.length > 0) setChatSessions(savedChatSessions);
                  if (savedMessages.length > 0) setMessages(savedMessages);
                  if (savedGuestHistory.length > 0) setGuestHistory(savedGuestHistory);
                  if (savedServiceRequests.length > 0) setServiceRequests(savedServiceRequests);
                  if (savedExternalOrders.length > 0) setExternalOrders(savedExternalOrders);
                  if (savedCoordinationNotes.length > 0) setCoordinationNotes(savedCoordinationNotes);
                  if (savedAttendanceRecords.length > 0) setAttendanceRecords(savedAttendanceRecords);
                  
                  if (savedDrivers && savedDrivers.length > 0) {
                      setDeliveryDrivers(savedDrivers);
                  } else {
                      const newDrivers = generateMockDeliveryDrivers();
                      setDeliveryDrivers(newDrivers);
                      saveAll('deliveryDrivers', newDrivers);
                  }

                  if (savedPartners && savedPartners.length > 0) setPartners(savedPartners);
                  
                  if (savedServicePoints && savedServicePoints.length > 0) {
                      // Enrich if missing units
                      const enriched = savedServicePoints.map(sp => ({
                          ...sp,
                          units: sp.units && sp.units.length > 0 ? sp.units : Array.from({ length: 10 }).map((_, i) => ({
                              id: `unit-${sp.id}-${i}`,
                              name: `طاولة ${i + 1}`,
                              type: 'table',
                              capacity: 4,
                              status: Math.random() > 0.7 ? 'occupied' : 'available',
                              classification: 'standard',
                              basePrice: 0,
                              position: { x: 15 + (i % 3) * 25, y: 20 + Math.floor(i / 3) * 25, rotation: 0 }
                          })) as BookableUnit[]
                      }));
                      setServicePoints(enriched);
                  } else {
                      const rawServicePoints = generateMockServicePoints();
                      const newPoints = rawServicePoints.map(sp => ({
                          ...sp,
                          units: sp.units && sp.units.length > 0 ? sp.units : Array.from({ length: 10 }).map((_, i) => ({
                              id: `unit-${sp.id}-${i}`,
                              name: `طاولة ${i + 1}`,
                              type: 'table',
                              capacity: 4,
                              status: Math.random() > 0.7 ? 'occupied' : 'available',
                              classification: 'standard',
                              basePrice: 0,
                              position: { x: 15 + (i % 3) * 25, y: 20 + Math.floor(i / 3) * 25, rotation: 0 }
                          })) as BookableUnit[]
                      }));
                      setServicePoints(newPoints);
                      saveAll('servicePoints', newPoints);
                  }

                  if (savedParkingSpots && savedParkingSpots.length > 0) setParkingSpots(savedParkingSpots);
                  if (savedLegalRules && savedLegalRules.length > 0) setLegalRules(savedLegalRules);
                  if (savedJobOpenings && savedJobOpenings.length > 0) setJobOpenings(savedJobOpenings);
                  if (savedJobApplications && savedJobApplications.length > 0) setJobApplications(savedJobApplications);
                  if (savedReservations && savedReservations.length > 0) setReservations(savedReservations);
                  if (savedResourceBookings && savedResourceBookings.length > 0) setResourceBookings(savedResourceBookings);
                  if (savedGuestRegistrationForms && savedGuestRegistrationForms.length > 0) setGuestRegistrationForms(savedGuestRegistrationForms);
                  
                  if (savedPublicServices && savedPublicServices.length > 0) setPublicServices(savedPublicServices);
                  else setPublicServices(INITIAL_PUBLIC_SERVICES);

                  if (savedFacilities && savedFacilities.length > 0) setFacilities(savedFacilities);
                  else setFacilities(INITIAL_FACILITIES);

                  if (savedHotelEvents && savedHotelEvents.length > 0) setHotelEvents(savedHotelEvents);
                  else setHotelEvents(INITIAL_HOTEL_EVENTS);

                  if (savedServiceFeedbacks && savedServiceFeedbacks.length > 0) setServiceFeedbacks(savedServiceFeedbacks);

                  if (savedActivities && savedActivities.length > 0) setActivities(savedActivities);
                  else {
                      const newActivities = generateMockActivities();
                      setActivities(newActivities);
                      saveAll('activities', newActivities);
                  }

                  if (savedAuditLogs && savedAuditLogs.length > 0) setAuditLogs(savedAuditLogs);
                  if (savedHousekeepingTasks && savedHousekeepingTasks.length > 0) setHousekeepingTasks(savedHousekeepingTasks);
                  
                  if (savedRolePermissions && savedRolePermissions.length > 0) {
                      setRolePermissions(savedRolePermissions);
                  } else {
                      // Initialize with defaults
                      const defaults: RolePermissionSet[] = Object.entries(DEFAULT_ROLE_PERMISSIONS).map(([role, perms]) => ({
                          role: role as Role,
                          permissions: perms,
                          updatedAt: new Date().toISOString(),
                          updatedBy: 'System'
                      }));
                      setRolePermissions(defaults);
                      saveAll('role_permissions', defaults);
                  }
              }
              
          } catch (error) {
              console.error("Failed to load data from DB:", error);
          }
      };
      loadData();
  }, []);

  // --- DB SAVING (Debounced) ---
  useEffect(() => { const t = setTimeout(() => { saveSettings(settings); syncSettingsToFirestore(settings); }, 1000); return () => clearTimeout(t); }, [settings]);
  useEffect(() => { const t = setTimeout(() => { if(users.length > 0) { saveAll('users', users); syncToFirestore('users', users); } }, 2000); return () => clearTimeout(t); }, [users]);
  useEffect(() => { const t = setTimeout(() => { if(rooms.length > 0) { saveAll('rooms', rooms); syncToFirestore('rooms', rooms); } }, 2000); return () => clearTimeout(t); }, [rooms]);
  useEffect(() => { const t = setTimeout(() => { if(bookings.length > 0) { saveAll('bookings', bookings); syncToFirestore('bookings', bookings); } }, 1000); return () => clearTimeout(t); }, [bookings]);
  useEffect(() => { const t = setTimeout(() => { if(invoices.length > 0) { saveAll('invoices', invoices); syncToFirestore('invoices', invoices); } }, 2000); return () => clearTimeout(t); }, [invoices]);
  useEffect(() => { const t = setTimeout(() => { if(transactions.length > 0) { saveAll('transactions', transactions); syncToFirestore('transactions', transactions); } }, 2000); return () => clearTimeout(t); }, [transactions]);
  useEffect(() => { const t = setTimeout(() => { if(notifications.length > 0) { saveAll('notifications', notifications); syncToFirestore('notifications', notifications); } }, 5000); return () => clearTimeout(t); }, [notifications]);
  useEffect(() => { const t = setTimeout(() => { if(menuItems.length > 0) { saveAll('menuItems', menuItems); syncToFirestore('menuItems', menuItems); } }, 5000); return () => clearTimeout(t); }, [menuItems]);
  useEffect(() => { const t = setTimeout(() => { if(restaurantOrders.length > 0) { saveAll('orders', restaurantOrders); syncToFirestore('orders', restaurantOrders); } }, 2000); return () => clearTimeout(t); }, [restaurantOrders]);
  useEffect(() => { const t = setTimeout(() => { if(qrRecords.length > 0) { saveAll('qrRecords', qrRecords); syncToFirestore('qrRecords', qrRecords); } }, 2000); return () => clearTimeout(t); }, [qrRecords]);
  
  // NEW STORES SAVING
  useEffect(() => { const t = setTimeout(() => { if(inventory.length > 0) { saveAll('inventory', inventory); syncToFirestore('inventory', inventory); } }, 2000); return () => clearTimeout(t); }, [inventory]);
  useEffect(() => { const t = setTimeout(() => { if(hallBookings.length > 0) { saveAll('hallBookings', hallBookings); syncToFirestore('hallBookings', hallBookings); } }, 2000); return () => clearTimeout(t); }, [hallBookings]);
  useEffect(() => { const t = setTimeout(() => { if(poolPasses.length > 0) { saveAll('poolPasses', poolPasses); syncToFirestore('poolPasses', poolPasses); } }, 2000); return () => clearTimeout(t); }, [poolPasses]);
  useEffect(() => { const t = setTimeout(() => { if(maintenanceTickets.length > 0) { saveAll('maintenanceTickets', maintenanceTickets); syncToFirestore('maintenanceTickets', maintenanceTickets); } }, 2000); return () => clearTimeout(t); }, [maintenanceTickets]);
  useEffect(() => { const t = setTimeout(() => { if(incidentReports.length > 0) { saveAll('incidentReports', incidentReports); syncToFirestore('incidentReports', incidentReports); } }, 2000); return () => clearTimeout(t); }, [incidentReports]);
  useEffect(() => { const t = setTimeout(() => { if(chatSessions.length > 0) { saveAll('chatSessions', chatSessions); syncToFirestore('chatSessions', chatSessions); } }, 2000); return () => clearTimeout(t); }, [chatSessions]);
  useEffect(() => { const t = setTimeout(() => { if(messages.length > 0) { saveAll('messages', messages); syncToFirestore('messages', messages); } }, 2000); return () => clearTimeout(t); }, [messages]);
  useEffect(() => { const t = setTimeout(() => { if(guestHistory.length > 0) { saveAll('guestHistory', guestHistory); syncToFirestore('guestHistory', guestHistory); } }, 2000); return () => clearTimeout(t); }, [guestHistory]);
  useEffect(() => { const t = setTimeout(() => { if(serviceRequests.length > 0) { saveAll('serviceRequests', serviceRequests); syncToFirestore('serviceRequests', serviceRequests); } }, 2000); return () => clearTimeout(t); }, [serviceRequests]);
  useEffect(() => { const t = setTimeout(() => { if(externalOrders.length > 0) { saveAll('externalOrders', externalOrders); syncToFirestore('externalOrders', externalOrders); } }, 2000); return () => clearTimeout(t); }, [externalOrders]);
  useEffect(() => { const t = setTimeout(() => { if(coordinationNotes.length > 0) { saveAll('coordinationNotes', coordinationNotes); syncToFirestore('coordinationNotes', coordinationNotes); } }, 2000); return () => clearTimeout(t); }, [coordinationNotes]);
  useEffect(() => { const t = setTimeout(() => { if(attendanceRecords.length > 0) { saveAll('attendanceRecords', attendanceRecords); syncToFirestore('attendanceRecords', attendanceRecords); } }, 2000); return () => clearTimeout(t); }, [attendanceRecords]);
  useEffect(() => { const t = setTimeout(() => { if(deliveryDrivers.length > 0) { saveAll('deliveryDrivers', deliveryDrivers); syncToFirestore('deliveryDrivers', deliveryDrivers); } }, 2000); return () => clearTimeout(t); }, [deliveryDrivers]);
  useEffect(() => { const t = setTimeout(() => { if(partners.length > 0) { saveAll('partners', partners); syncToFirestore('partners', partners); } }, 2000); return () => clearTimeout(t); }, [partners]);
  useEffect(() => { const t = setTimeout(() => { if(servicePoints.length > 0) { saveAll('servicePoints', servicePoints); syncToFirestore('servicePoints', servicePoints); } }, 2000); return () => clearTimeout(t); }, [servicePoints]);
  useEffect(() => { const t = setTimeout(() => { if(parkingSpots.length > 0) { saveAll('parkingSpots', parkingSpots); syncToFirestore('parkingSpots', parkingSpots); } }, 2000); return () => clearTimeout(t); }, [parkingSpots]);
  useEffect(() => { const t = setTimeout(() => { if(legalRules.length > 0) { saveAll('legalRules', legalRules); syncToFirestore('legalRules', legalRules); } }, 2000); return () => clearTimeout(t); }, [legalRules]);
  useEffect(() => { const t = setTimeout(() => { if(jobOpenings.length > 0) { saveAll('jobOpenings', jobOpenings); syncToFirestore('jobOpenings', jobOpenings); } }, 2000); return () => clearTimeout(t); }, [jobOpenings]);
  useEffect(() => { const t = setTimeout(() => { if(jobApplications.length > 0) { saveAll('jobApplications', jobApplications); syncToFirestore('jobApplications', jobApplications); } }, 2000); return () => clearTimeout(t); }, [jobApplications]);
  useEffect(() => { const t = setTimeout(() => { if(reservations.length > 0) { saveAll('reservations', reservations); syncToFirestore('reservations', reservations); } }, 2000); return () => clearTimeout(t); }, [reservations]);
  useEffect(() => { const t = setTimeout(() => { if(resourceBookings.length > 0) { saveAll('resourceBookings', resourceBookings); syncToFirestore('resourceBookings', resourceBookings); } }, 2000); return () => clearTimeout(t); }, [resourceBookings]);
  useEffect(() => { const t = setTimeout(() => { if(guestRegistrationForms.length > 0) { saveAll('guestRegistrationForms', guestRegistrationForms); syncToFirestore('guestRegistrationForms', guestRegistrationForms); } }, 2000); return () => clearTimeout(t); }, [guestRegistrationForms]);
  useEffect(() => { const t = setTimeout(() => { if(publicServices.length > 0) { saveAll('publicServices', publicServices); syncToFirestore('publicServices', publicServices); } }, 2000); return () => clearTimeout(t); }, [publicServices]);
  useEffect(() => { const t = setTimeout(() => { if(facilities.length > 0) { saveAll('facilities', facilities); syncToFirestore('facilities', facilities); } }, 2000); return () => clearTimeout(t); }, [facilities]);
  useEffect(() => { const t = setTimeout(() => { if(hotelEvents.length > 0) { saveAll('hotelEvents', hotelEvents); syncToFirestore('hotelEvents', hotelEvents); } }, 2000); return () => clearTimeout(t); }, [hotelEvents]);
  useEffect(() => { const t = setTimeout(() => { if(serviceFeedbacks.length > 0) { saveAll('serviceFeedbacks', serviceFeedbacks); syncToFirestore('serviceFeedbacks', serviceFeedbacks); } }, 2000); return () => clearTimeout(t); }, [serviceFeedbacks]);
  useEffect(() => { const t = setTimeout(() => { if(activities.length > 0) { saveAll('activities', activities); syncToFirestore('activities', activities); } }, 2000); return () => clearTimeout(t); }, [activities]);
  useEffect(() => { const t = setTimeout(() => { if(auditLogs.length > 0) { saveAll('audit_logs', auditLogs); syncToFirestore('audit_logs', auditLogs); } }, 5000); return () => clearTimeout(t); }, [auditLogs]);
  useEffect(() => { const t = setTimeout(() => { if(housekeepingTasks.length > 0) { saveAll('housekeeping', housekeepingTasks); syncToFirestore('housekeeping', housekeepingTasks); } }, 2000); return () => clearTimeout(t); }, [housekeepingTasks]);
  useEffect(() => { const t = setTimeout(() => { if(rolePermissions.length > 0) { saveAll('role_permissions', rolePermissions); syncToFirestore('role_permissions', rolePermissions); } }, 2000); return () => clearTimeout(t); }, [rolePermissions]);

  // --- GUEST PORTAL EVENTS ---
  useEffect(() => {
      const handleGuestOrder = (e: CustomEvent) => {
          const order = e.detail;
          setRestaurantOrders(prev => {
              const updated = [order, ...prev];
              saveAll('orders', updated);
              return updated;
          });
          
          if(order.tableId) {
             setRestaurantTables(prev => prev.map(t => t.id === order.tableId ? { ...t, status: 'occupied', currentOrderId: order.id } : t));
          }

          // Add notification
          const userId = currentUser ? currentUser.name : 'System';
          const newNotif: Notification = {
            id: Date.now().toString(),
            message: `طلب جديد من ${order.customerName}`,
            details: `${order.type} - ${order.totalAmount} د.ج`,
            userId: userId,
            timestamp: new Date().toISOString(),
            type: 'success',
            hiddenFor: [],
            isTrashed: false
          };
          setNotifications(prev => [newNotif, ...prev]);
          setActiveToast(newNotif);
      };

      window.addEventListener('guest-order-placed', handleGuestOrder as EventListener);
      return () => window.removeEventListener('guest-order-placed', handleGuestOrder as EventListener);
  }, [currentUser]);

  useEffect(() => {
    const handleShowNotification = (e: CustomEvent) => {
      const { message, type, details } = e.detail;
      addNotification(message, type, details);
    };
    window.addEventListener('show-notification', handleShowNotification as EventListener);
    return () => window.removeEventListener('show-notification', handleShowNotification as EventListener);
  }, [currentUser]); // addNotification depends on currentUser via useCallback

  // ... (Keep existing notification and user helpers)
  const addNotification = useCallback((msg: string, type: Notification['type'] = 'info', details?: string, targets?: NotificationTargets, action?: { link: string, label: string }, category?: Notification['category']) => {
    const userId = currentUser ? currentUser.name : 'System';
    const newNotif: Notification = {
      id: Date.now().toString(),
      message: msg,
      details: details,
      userId: userId,
      timestamp: new Date().toISOString(),
      type,
      category: category || 'system',
      hiddenFor: [],
      readBy: [],
      isTrashed: false,
      targetRoles: targets?.roles,
      targetDepartments: targets?.departments,
      targetUsers: targets?.users,
      actionLink: action?.link,
      actionLabel: action?.label
    };
    setNotifications(prev => [newNotif, ...prev]);
    if (currentUser && (!targets || (targets.users?.includes(currentUser.id) || targets.roles?.includes(currentUser.role)))) {
        setActiveToast(newNotif);
    }
  }, [currentUser]);

  const markAsRead = (id: string) => {
      if (!currentUser) return;
      setNotifications(prev => prev.map(n => {
          if (n.id === id) {
              const readers = n.readBy || [];
              if (!readers.includes(currentUser.id)) {
                  return { ...n, readBy: [...readers, currentUser.id] };
              }
          }
          return n;
      }));
  };

  const updateRolePermissions = (role: Role, permissions: UserPermissions) => {
    setRolePermissions(prev => {
      const existing = prev.find(rp => rp.role === role);
      if (existing) {
        return prev.map(rp => rp.role === role ? { ...rp, permissions, updatedAt: new Date().toISOString(), updatedBy: currentUser?.name || 'System' } : rp);
      }
      return [...prev, { role, permissions, updatedAt: new Date().toISOString(), updatedBy: currentUser?.name || 'System' }];
    });
    addNotification(`تم تحديث صلاحيات دور ${role}`, 'success');
  };

  const checkPermission = useCallback((permission: keyof UserPermissions) => {
    if (!currentUser) return false;
    if (currentUser.role === 'manager') return true;
    
    // Prioritize user-specific permissions (Individual overrides)
    if (currentUser.permissions) {
        return currentUser.permissions[permission] === true;
    }
    
    // Fallback to role-based permissions
    const rolePerms = rolePermissions.find(rp => rp.role === currentUser.role)?.permissions;
    return rolePerms?.[permission] === true;
  }, [currentUser, rolePermissions]);

  const canAccessPage = useCallback((pageKey: string) => {
    if (!currentUser) return ['public_landing', 'about', 'restaurant', 'pool'].includes(pageKey);
    if (currentUser.role === 'manager') return true;
    
    // Prioritize user-specific visible pages
    const visiblePages = currentUser.permissions?.visiblePages || rolePermissions.find(rp => rp.role === currentUser.role)?.permissions?.visiblePages || [];
    
    if (visiblePages.includes('all')) return true;
    return visiblePages.includes(pageKey);
  }, [currentUser, rolePermissions]);

  const canPerformAction = useCallback((actionKey: string) => {
    if (!currentUser) return false;
    if (currentUser.role === 'manager') return true;
    
    // Prioritize user-specific allowed actions
    const allowedActions = currentUser.permissions?.allowedActions || rolePermissions.find(rp => rp.role === currentUser.role)?.permissions?.allowedActions || [];
    
    if (allowedActions.includes('all')) return true;
    return allowedActions.includes(actionKey);
  }, [currentUser, rolePermissions]);

  const isButtonVisible = useCallback((buttonId: string) => {
    if (!currentUser) return true; // Default to visible for guests if not restricted
    if (currentUser.role === 'manager') return true;
    
    // Prioritize user-specific hidden buttons
    const hiddenButtons = currentUser.permissions?.hiddenButtons || rolePermissions.find(rp => rp.role === currentUser.role)?.permissions?.hiddenButtons || [];
    
    return !hiddenButtons.includes(buttonId);
  }, [currentUser, rolePermissions]);

  const login = (userId: string) => { const user = users.find(u => u.id === userId); if (user) { setCurrentUser(user); setRecentUsers(prev => [userId, ...prev.filter(id => id !== userId)].slice(0, 5)); } };
  const logout = () => {
      setCurrentUser(null);
      sessionStorage.removeItem('staffMode');
      window.location.href = window.location.origin; // Redirect to home to ensure public mode
  };
  const forgetUser = (userId: string) => setRecentUsers(prev => prev.filter(id => id !== userId));
  const updateUser = (userId: string, data: Partial<User>, notificationNote?: string) => { setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u)); if (notificationNote) addNotification(`تم تحديث بيانات الموظف`, 'info', notificationNote); };
  const addStaff = (name: string, role: Role, department: Department, isHead: boolean, salary: number, accessCode: string) => { 
      const rolePerms = rolePermissions.find(rp => rp.role === role)?.permissions || DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS['staff'];
      const newUser: User = { 
          id: `u${Date.now()}`, 
          name, 
          role, 
          department, 
          isHeadOfDepartment: isHead, 
          salary, 
          accessCode, 
          joinDate: new Date().toISOString(), 
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`, 
          isBlocked: false, 
          permissions: rolePerms, 
          leaveBalance: 30, 
          status: 'active',
          code: `${department.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
          rank: isHead ? 'Executive' : 'Junior',
          crewId: `CREW-${Date.now()}`
      }; 
      setUsers(prev => [...prev, newUser]); 
  };
  const removeStaff = (userId: string) => setUsers(prev => prev.filter(u => u.id !== userId));
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    if (newSettings.privateFirebaseConfig) {
      localStorage.setItem('hotel_private_firebase_config', JSON.stringify(newSettings.privateFirebaseConfig));
    }
    setSettings(prev => ({ ...prev, ...newSettings }));
  };
  const updatePageTitle = (key: string, title: string) => setSettings(prev => ({ ...prev, pageTitles: { ...prev.pageTitles, [key]: title } }));
  const updateRoomPrices = (type: RoomType, prices: PriceOption[]) => setSettings(prev => ({ ...prev, roomPrices: { ...prev.roomPrices, [type]: prices } }));
  const updateStandardRate = (key: keyof StandardRates, value: number) => setSettings(prev => ({ ...prev, standardRates: { ...prev.standardRates, [key]: value } }));
  const updateServiceAvailability = (key: string, value: boolean) => setSettings(prev => ({ ...prev, serviceAvailability: { ...prev.serviceAvailability, [key]: value } }));
  const updateRoomStatus = (roomId: number, status: RoomStatus) => {
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status } : r));
      
      // Automatic Housekeeping Task Creation
      if (status === 'dirty') {
          const room = rooms.find(r => r.id === roomId);
          if (room) {
              addHousekeepingTask({
                  roomId: room.id,
                  roomNumber: room.number,
                  status: 'dirty',
                  priority: 'medium',
                  notes: 'تلقائي: الغرفة تحتاج لتنظيف بعد المغادرة'
              });
          }
      }
  };
  const updateRoomType = (roomId: number, type: RoomType) => setRooms(prev => prev.map(r => r.id === roomId ? { ...r, type } : r));

  const updateRoomCount = (count: number) => {
      if (count < 1) return;
      
      setRooms(prev => {
          const currentCount = prev.length;
          let newRooms = [...prev];
          
          if (count > currentCount) {
              // Add rooms
              const addedRooms = Array.from({ length: count - currentCount }, (_, i) => {
                  const id = currentCount + i + 1;
                  return {
                      id: id,
                      number: `${id}`,
                      type: 'single' as RoomType,
                      status: 'available' as RoomStatus,
                      price: 100 + (id % 3) * 50,
                  };
              });
              newRooms = [...newRooms, ...addedRooms];
          } else if (count < currentCount) {
              // Remove rooms (from the end)
              newRooms = newRooms.slice(0, count);
          }

          // Re-number all rooms to start from 1
          newRooms = newRooms.map((room, index) => ({
              ...room,
              number: `${index + 1}`
          }));
          
          // Update settings as well
          updateSettings({ totalRooms: count });
          return newRooms;
      });
      
      addNotification(`تم تحديث عدد الغرف إلى ${count} وإعادة الترقيم`, 'success');
  };
  
  // ... (Keep booking logic)
  const addBooking = (bookingData: Omit<Booking, 'guestToken' | 'id'>, roomIds: number[]) => { 
      const isAutoApprove = settings.autoApproveBookings;
      const newBooking: Booking = { 
          ...bookingData, 
          id: `bkg-${Date.now()}`, 
          guestToken: Math.random().toString(36).substring(7), 
          guestLocation: 'in_hotel',
          status: isAutoApprove ? (bookingData.status || 'pending') : 'pending'
      }; 
      setBookings(prev => {
          const updated = [...prev, newBooking];
          saveAll('bookings', updated); // Immediate Save
          return updated;
      }); 

      if (newBooking.status === 'active') {
          roomIds.forEach(id => updateRoomStatus(id, 'occupied'));
      } else if (newBooking.status === 'pending') {
          roomIds.forEach(id => updateRoomStatus(id, 'booked'));
      }

      if (!isAutoApprove && newBooking.status === 'pending') {
          addNotification(
              `حجز جديد بانتظار التأكيد من ${newBooking.primaryGuestName}`,
              'info',
              `التاريخ: ${newBooking.checkInDate} إلى ${newBooking.checkOutDate}`,
              { roles: ['manager', 'receptionist'] },
              { link: 'bookings', label: 'عرض الحجوزات' }
          );
      }

      return newBooking; 
  };

  const confirmBooking = (bookingId: string) => {
      setBookings(prev => {
          const updated = prev.map(b => {
              if (b.id === bookingId) {
                  updateRoomStatus(b.roomId, 'booked');
                  return { ...b, status: 'pending' as const }; // Confirmed but not yet checked in
              }
              return b;
          });
          saveAll('bookings', updated);
          return updated;
      });
      addNotification('تم تأكيد الحجز بنجاح', 'success');
  };

  const cancelBooking = (bookingId: string) => {
      setBookings(prev => {
          const updated = prev.map(b => {
              if (b.id === bookingId) {
                  updateRoomStatus(b.roomId, 'available');
                  return { ...b, status: 'cancelled' as const };
              }
              return b;
          });
          saveAll('bookings', updated);
          return updated;
      });
      addNotification('تم إلغاء الحجز', 'warning');
  };

  const toggleAutoApproval = () => {
      updateSettings({ autoApproveBookings: !settings.autoApproveBookings });
      addNotification(
          `تم ${!settings.autoApproveBookings ? 'تفعيل' : 'تعطيل'} التأكيد الآلي للحجوزات`,
          'info'
      );
  };

  const submitGuestRegistrationForm = (formData: Omit<GuestRegistrationForm, 'id' | 'submittedAt' | 'status'>) => {
      const newForm: GuestRegistrationForm = {
          ...formData,
          id: `form-${Date.now()}`,
          submittedAt: new Date().toISOString(),
          status: 'pending'
      };
      setGuestRegistrationForms(prev => {
          const updated = [newForm, ...prev];
          saveAll('guestRegistrationForms', updated);
          return updated;
      });
      addNotification(
          `استمارة نزيل جديدة من ${newForm.firstNameAr} ${newForm.lastNameAr}`,
          'info',
          'بانتظار المراجعة من الاستقبال',
          { roles: ['manager', 'receptionist'] }
      );
  };

  const updateGuestRegistrationFormStatus = (id: string, status: GuestRegistrationForm['status']) => {
      setGuestRegistrationForms(prev => {
          const updated = prev.map(f => f.id === id ? { ...f, status } : f);
          saveAll('guestRegistrationForms', updated);
          return updated;
      });
  };

  const extendBooking = (bookingId: string, days: number) => {
      setBookings(prev => {
          const updated = prev.map(b => {
              if (b.id === bookingId) {
                  const newDate = new Date(b.checkOutDate);
                  newDate.setDate(newDate.getDate() + days);
                  return { ...b, checkOutDate: newDate.toISOString().split('T')[0] };
              }
              return b;
          });
          saveAll('bookings', updated); // Immediate Save
          return updated;
      });
      addNotification('تم تمديد الحجز بنجاح', 'success');
  };

  const moveBooking = (bookingId: string, newRoomId: number, reason?: string, newPrice?: number) => {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;
      const oldRoomId = booking.roomId;
      
      setBookings(prev => {
          const updated = prev.map(b => b.id === bookingId ? { 
              ...b, 
              roomId: newRoomId, 
              totalAmount: newPrice !== undefined ? newPrice : b.totalAmount,
              notes: (b.notes || '') + (reason ? `\n[System]: Moved from Room ${oldRoomId} to ${newRoomId}. Reason: ${reason}` : '') 
          } : b);
          saveAll('bookings', updated); // Immediate Save
          return updated;
      });
      
      if (oldRoomId) updateRoomStatus(oldRoomId, 'dirty');
      updateRoomStatus(newRoomId, 'occupied');
      
      addNotification(`تم نقل الحجز من الغرفة ${rooms.find(r=>r.id===oldRoomId)?.number} إلى ${rooms.find(r=>r.id===newRoomId)?.number}`, 'info', reason);
  };

  const splitBooking = (originalBookingId: string, guestIndicesToMove: number[], newRoomId: number, newPrice: number) => {
      const original = bookings.find(b => b.id === originalBookingId);
      if(!original) return;
      
      const guestsMoving = original.guests.filter((_, i) => guestIndicesToMove.includes(i));
      const guestsStaying = original.guests.filter((_, i) => !guestIndicesToMove.includes(i));
      
      setBookings(prev => {
          const updated = prev.map(b => b.id === originalBookingId ? { ...b, guests: guestsStaying } : b);
          saveAll('bookings', updated); // Immediate Save
          return updated;
      });
      
      addBooking({
          ...original,
          roomId: newRoomId,
          guests: guestsMoving,
          totalAmount: newPrice,
          status: 'active',
          mealPlan: original.mealPlan,
          extraServices: original.extraServices
      }, [newRoomId]);
      
      addNotification('تم فصل الحجز وإنشاء حجز جديد بنجاح', 'success');
  };

  const updateBooking = (bookingId: string, updates: Partial<Booking>) => {
      setBookings(prev => {
          const updated = prev.map(b => b.id === bookingId ? { ...b, ...updates } : b);
          saveAll('bookings', updated); // Immediate Save
          return updated;
      });
      if (updates.totalAmount) {
          addNotification('تم تحديث سعر الحجز بنجاح', 'success');
      }
  };

  const addGuestToRoom = (roomId: number, guest: GuestInfo, newTotalAmount?: number) => {
      setBookings(prev => {
          const updated = prev.map(b => {
              if (b.roomId === roomId && b.status === 'active') {
                  return { 
                      ...b, 
                      guests: [...b.guests, guest],
                      totalAmount: newTotalAmount !== undefined ? newTotalAmount : b.totalAmount
                  };
              }
              return b;
          });
          saveAll('bookings', updated); // Immediate Save
          return updated;
      });
      addNotification(`تم إضافة النزيل ${guest.firstNameAr} للغرفة بنجاح`, 'success');
  };

  const checkIn = (bookingId: string, roomId?: number) => {
      setBookings(prev => {
          const updated = prev.map(b => {
              if (b.id === bookingId) {
                  const targetRoom = roomId || b.roomId;
                  updateRoomStatus(targetRoom, 'occupied');
                  return { 
                      ...b, 
                      status: 'active' as const, 
                      checkInDate: new Date().toISOString(), 
                      roomId: targetRoom, 
                      guestLocation: 'in_hotel' as const 
                  };
              }
              return b;
          });
          saveAll('bookings', updated); // Immediate Save
          return updated;
      });
      addNotification('تم تسجيل الدخول بنجاح', 'success');
  };

  const checkOut = (bookingId: string) => {
      const b = bookings.find(b => b.id === bookingId);
      if (b) {
          updateRoomStatus(b.roomId, 'dirty');
          setBookings(prev => {
              const updated = prev.map(bk => bk.id === bookingId ? { 
                  ...bk, 
                  status: 'completed' as const, 
                  checkOutDate: new Date().toISOString(), 
                  guestLocation: 'out_of_hotel' as const 
              } : bk);
              saveAll('bookings', updated); // Immediate Save
              return updated;
          });
          
          const inv: Invoice = {
              id: `inv-${Date.now()}`,
              bookingId: b.id,
              guestName: b.primaryGuestName,
              amount: b.totalAmount,
              date: new Date().toISOString(),
              isPaid: false,
              details: {
                  roomTotal: b.totalAmount,
                  mealTotal: 0,
                  servicesTotal: 0,
                  days: 1,
                  mealPlan: b.mealPlan
              }
          };
          addInvoice(inv);
          addNotification('تم تسجيل الخروج وإصدار الفاتورة', 'success');
      }
  };

  const addInvoice = (invoice: Invoice) => setInvoices(prev => {
      const updated = [invoice, ...prev];
      saveAll('invoices', updated); // Immediate Save
      return updated;
  });

  const updateInvoice = (id: string, updates: Partial<Invoice>) => setInvoices(prev => {
      const updated = prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv);
      saveAll('invoices', updated);
      return updated;
  });

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date' | 'userId' | 'userName'> & { userId?: string; userName?: string }) => { 
      const newTrans: Transaction = { 
          id: `tx-${Date.now()}`, 
          date: new Date().toISOString(), 
          userId: transaction.userId || currentUser?.id || 'system', 
          userName: transaction.userName || currentUser?.name || 'System', 
          paymentMethod: transaction.paymentMethod || 'cash', // Default to cash
          cardDetails: transaction.cardDetails,
          ...transaction 
      }; 
      setTransactions(prev => {
          const updated = [newTrans, ...prev];
          saveAll('transactions', updated); // Immediate Save
          return updated;
      }); 
  };
  const clearUserBalance = (targetUserId: string, amount: number) => addTransaction({ amount, type: 'settlement', category: 'deduction', description: 'تصفية حساب', targetUserId });
  
  const sendMessage = (content: string, receiverId?: string) => {
      setMessages(prev => [...prev, { id: `msg-${Date.now()}`, senderId: currentUser?.id || 'system', receiverId, content, timestamp: new Date().toISOString() }]);
  };
  
  const sendGuestMessage = (token: string, content: string, recipientId: string = 'reception') => {
      setMessages(prev => [...prev, { id: `msg-${Date.now()}`, senderId: token, receiverId: recipientId, content, isGuestMessage: true, timestamp: new Date().toISOString() }]);
      setChatSessions(prev => {
          const exists = prev.find(s => s.id === token);
          if (exists) return prev.map(s => s.id === token ? { ...s, lastMessage: content, unreadCount: s.unreadCount + 1 } : s);
          return [...prev, { id: token, name: 'Guest', lastMessage: content, unreadCount: 1, isGuest: true, isMuted: false, roomNumber: 'Online' }];
      });
  };
  
  const replyToGuest = (token: string, content: string) => {
      setMessages(prev => [...prev, { id: `msg-${Date.now()}`, senderId: currentUser?.id || 'system', receiverId: token, content, timestamp: new Date().toISOString() }]);
  };
  
  const toggleChatMute = (sessionId: string) => setChatSessions(prev => prev.map(s => s.id === sessionId ? { ...s, isMuted: !s.isMuted } : s));
  const toggleShortcut = (actionId: string) => setUserShortcuts(prev => prev.includes(actionId) ? prev.filter(id => id !== actionId) : [...prev, actionId]);
  const toggleDarkMode = () => updateSettings({ darkMode: !settings.darkMode });
  const setTheme = (theme: AppSettings['theme']) => updateSettings({ theme });
  const searchGuest = (id: string) => guestHistory.find(g => g.idNumber === id);
  
  const hideToast = () => setActiveToast(null);
  const moveToTrash = (id: string) => { setNotifications(prev => prev.map(n => n.id === id ? { ...n, isTrashed: true, deletedAt: new Date().toISOString() } : n)); };
  const deleteNotificationPermanently = (id: string) => { setNotifications(prev => prev.filter(n => n.id !== id)); };
  const restoreNotification = (id: string) => { setNotifications(prev => prev.map(n => n.id === id ? { ...n, isTrashed: false, deletedAt: undefined } : n)); };
  const emptyTrash = () => { setNotifications(prev => prev.filter(n => !n.isTrashed)); };

  const addHallBooking = (b: HallBooking) => setHallBookings(prev => [...prev, b]);
  const cancelHallBooking = (id: string) => setHallBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
  const createPoolPass = (p: PoolPass) => { setPoolPasses(prev => [p, ...prev]); return p; };
  const invalidatePoolPass = (id: string) => setPoolPasses(prev => prev.map(p => p.id === id ? { ...p, isValid: false } : p));
  const addRestaurantOrder = (order: RestaurantOrder) => { 
      setRestaurantOrders(prev => {
          const updated = [order, ...prev];
          saveAll('orders', updated); // Immediate Save
          return updated;
      }); 
      if(order.tableId) updateTableStatus(order.tableId, 'occupied', order.id); 
  };
  const updateRestaurantOrder = (id: string, status: any) => {
      setRestaurantOrders(prev => {
          const updated = prev.map(o => o.id === id ? { ...o, status } : o);
          saveAll('orders', updated); // Immediate Save
          return updated;
      });
  };
  
  // NEW: Update order items (append/merge)
  const updateRestaurantOrderItems = (orderId: string, newItems: { item: MenuItem; quantity: number }[]) => {
      setRestaurantOrders(prev => {
          const updated = prev.map(order => {
              if (order.id !== orderId) return order;
              
              // Merge items
              const updatedItems = [...order.items];
              newItems.forEach(newItem => {
                  const existingIndex = updatedItems.findIndex(i => i.item.id === newItem.item.id);
                  if (existingIndex >= 0) {
                      updatedItems[existingIndex].quantity += newItem.quantity;
                  } else {
                      updatedItems.push(newItem);
                  }
              });

              // Recalculate total
              const newTotal = updatedItems.reduce((sum, i) => sum + (i.item.price * i.quantity), 0);

              return { ...order, items: updatedItems, totalAmount: newTotal };
          });
          saveAll('orders', updated); // Immediate Save
          return updated;
      });
  };

  const updateInventory = (id: string, qty: number) => {
      setInventory(prev => {
          const updated = prev.map(i => i.id === id ? { ...i, quantity: i.quantity + qty } : i);
          saveAll('inventory', updated); // Immediate Save
          return updated;
      });
  };
  const updateTableStatus = (tableId: string, status: Table['status'], orderId?: string) => setRestaurantTables(prev => prev.map(t => t.id === tableId ? { ...t, status, currentOrderId: orderId } : t));
  const addMenuItem = (i: any) => {
      setMenuItems(prev => {
          const updated = [...prev, { ...i, id: `m-${Date.now()}` }];
          saveAll('menuItems', updated); // Immediate Save
          return updated;
      });
  };
  const updateMenuItem = (id: string, i: any) => {
      setMenuItems(prev => {
          const updated = prev.map(item => item.id === id ? { ...item, ...i } : item);
          saveAll('menuItems', updated); // Immediate Save
          return updated;
      });
  };
  const deleteMenuItem = (id: string) => {
      setMenuItems(prev => {
          const updated = prev.filter(i => i.id !== id);
          saveAll('menuItems', updated); // Immediate Save
          return updated;
      });
  };
  
  const addTable = (table: Table) => setRestaurantTables(prev => [...prev, table]);
  const removeTable = (tableId: string) => setRestaurantTables(prev => prev.filter(t => t.id !== tableId));
  const updateTableDetails = (tableId: string, updates: Partial<Table>) => setRestaurantTables(prev => prev.map(t => t.id === tableId ? { ...t, ...updates } : t));

  const addQRRecord = (r: any, usageType: QRUsageType = 'single_use') => {
      setQrRecords(prev => [...prev, { 
          ...r, 
          id: `qr-${Date.now()}`, 
          createdAt: new Date().toISOString(), 
          scannedCount: 0, 
          currentState: 'fresh',
          usageType: usageType 
      }]);
  };
  
  // FIX: Refactored scanQRRecord to prevent side-effects in updater
  const scanQRRecord = (id: string) => {
      const record = qrRecords.find(r => r.id === id);
      if (!record) return;

      let nextState = record.currentState;
      let resultMessage = 'Scan Logged';
      let scanResult: 'success' | 'denied' | 'fraud_alert' = 'success';

      if (record.usageType === 'single_use') {
          if (record.currentState === 'consumed') {
              scanResult = 'denied';
              resultMessage = 'Already Used';
          } else {
              nextState = 'consumed';
              resultMessage = 'Marked as Used';
          }
      } else if (record.usageType === 'access_pass') {
          nextState = record.currentState === 'active_session' ? 'consumed' : 'active_session';
          resultMessage = nextState === 'active_session' ? 'Entry Logged' : 'Exit Logged';
      } else if (record.usageType === 'ticket') {
          if (record.currentState === 'consumed') {
              scanResult = 'denied';
              resultMessage = 'Ticket Already Used';
          } else {
              nextState = 'consumed';
              resultMessage = 'Ticket Validated';
              // Logic to update ticket status if linked
              if (record.referenceId && record.meta?.type === 'resource_booking') {
                  updateResourceBooking(record.referenceId, { status: 'completed' });
              }
          }
      } else if (record.usageType === 'order') {
          // For orders, scanning might mean "Delivered" or "Picked Up"
          if (record.currentState !== 'consumed') {
              nextState = 'consumed';
              resultMessage = 'Order Delivered/Completed';
              if (record.referenceId) {
                  updateRestaurantOrder(record.referenceId, 'completed');
              }
          } else {
              resultMessage = 'Order Already Processed';
          }
      } else if (record.usageType === 'staff_access') {
          // Log attendance or access
          resultMessage = 'Staff Access Granted';
          // Could trigger recordAttendance here if we had the user ID
      }

      // Update Record
      setQrRecords(prev => prev.map(r => r.id === id ? { 
          ...r, 
          scannedCount: r.scannedCount + 1, 
          lastScanTime: new Date().toISOString(), 
          currentState: nextState 
      } : r));

      // Update Log
      setQrLogs(l => [{
          id: `log-${Date.now()}`,
          qrId: id,
          scannerId: currentUser?.id || 'sys',
          location: 'Main Gate', // This could be dynamic based on scanner location
          timestamp: new Date().toISOString(),
          result: scanResult,
          message: resultMessage
      }, ...l]);
      
      if (scanResult === 'success') {
          addNotification(resultMessage, 'success');
      } else {
          addNotification(resultMessage, 'error');
      }
  };

  // ... (Keep existing secure QR methods)
  const generateSystemQR = (type: QRTokenType, id: string, name?: string, expiryDays: number = 1, meta?: any) => {
      const expiry = Date.now() + (expiryDays * 24 * 60 * 60 * 1000);
      const payload: QRPayload = { t: type, i: id, n: name, x: expiry, m: meta };
      return generateSecureToken(payload);
  };

  const parseSystemQR = (token: string) => {
      return parseSecureToken(token);
  };

  const resetQRState = (id: string) => setQrRecords(prev => prev.map(r => r.id === id ? { ...r, currentState: 'fresh' } : r));
  const regenerateBookingQR = (b: Booking) => { 
      return generateSystemQR('ROOM_KEY', b.roomId.toString(), b.primaryGuestName, 1);
  };
  
  // FIX: Separate state updates to avoid side-effects (React #310)
  const toggleGuestPresence = (bid: string, status: any) => {
      const booking = bookings.find(b => b.id === bid);
      if (booking) {
          setRooms(prev => prev.map(r => r.id === booking.roomId ? { ...r, currentGuestLocation: status } : r));
      }
      setBookings(prev => prev.map(b => b.id === bid ? { ...b, guestLocation: status } : b));
  };

  // ... (Keep remaining methods)
  const addMaintenanceTicket = (t: any) => setMaintenanceTickets(prev => [...prev, { ...t, id: `tkt-${Date.now()}`, reportedAt: new Date().toISOString(), status: 'pending', reportedBy: currentUser?.name || 'Staff' }]);
  const resolveMaintenanceTicket = (id: string, cost?: number) => { setMaintenanceTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t)); if (cost) addTransaction({ amount: cost, type: 'expense', category: 'maintenance', description: `Fix Ticket ${id}` }); };
  const toggleServiceStatus = (id: string) => setGuestServices(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  const addNewService = (s: any) => setGuestServices(prev => [...prev, { ...s, id: `srv-${Date.now()}` }]);
  const removeService = (id: string) => setGuestServices(prev => prev.filter(s => s.id !== id));
  const requestService = (sid: string, lt: any, lid: string, notes?: string) => { setServiceRequests(prev => [...prev, { id: `req-${Date.now()}`, serviceId: sid, guestName: 'Guest', locationType: lt, locationId: lid, status: 'pending', timestamp: new Date().toISOString(), notes }]); };
  const updateServiceRequestStatus = (id: string, s: any) => setServiceRequests(prev => prev.map(r => r.id === id ? { ...r, status: s } : r));
  const updateServiceItem = (id: string, data: Partial<ServiceItem>) => setGuestServices(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  const addSecurityLog = (l: any) => setSecurityLogs(prev => [...prev, { ...l, id: `sec-${Date.now()}`, timestamp: new Date().toISOString() }]);
  const submitStaffRequest = (req: any) => setStaffRequests(prev => [...prev, { ...req, id: `sr-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() }]);

  const addDeliveryDriver = (driver: DeliveryDriver) => setDeliveryDrivers(prev => [...prev, driver]);
  const updateDriverStatus = (id: string, status: DeliveryDriver['status']) => setDeliveryDrivers(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  
  const assignDriverToOrder = (orderId: string, driverId: string) => {
      const driver = deliveryDrivers.find(d => d.id === driverId);
      if (!driver) return;
      
      setRestaurantOrders(prev => prev.map(o => o.id === orderId ? { 
          ...o, 
          status: 'out_for_delivery', 
          driverId, 
          driverName: driver.name,
          deliveryStartTime: new Date().toISOString() 
      } : o));
      
      updateDriverStatus(driverId, 'busy');
      addNotification(`تم إسناد الطلب #${orderId.slice(-4)} للسائق ${driver.name}`, 'info');
  };

  const rateDeliveryOrder = (orderId: string, deliveryRating: number, restaurantRating: number, feedback?: string) => {
      setRestaurantOrders(prev => prev.map(o => {
          if (o.id === orderId) {
              // Update driver stats
              if (o.driverId) {
                  setDeliveryDrivers(drivers => drivers.map(d => {
                      if (d.id === o.driverId) {
                          const newTotal = d.totalDeliveries + 1;
                          const newAvg = ((d.averageRating * d.totalDeliveries) + deliveryRating) / newTotal;
                          return { ...d, totalDeliveries: newTotal, averageRating: newAvg, status: 'available' };
                      }
                      return d;
                  }));
              }
              return { 
                  ...o, 
                  status: 'completed', 
                  deliveryEndTime: new Date().toISOString(),
                  deliveryRating, 
                  restaurantRating, 
                  deliveryFeedback: feedback 
              };
          }
          return o;
      }));
  };

  const chargeOrderToRoom = (orderId: string, roomId: number) => {
      const order = restaurantOrders.find(o => o.id === orderId);
      if (!order) return;
      const booking = bookings.find(b => b.roomId === roomId && b.status === 'active');
      if (!booking) { addNotification("فشل العملية", 'error', "الغرفة غير مشغولة حالياً"); return; }
      setRestaurantOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed' } : o));
      if (order.tableId) updateTableStatus(order.tableId, 'available');
      setBookings(prev => prev.map(b => { if (b.id === booking.id) { return { ...b, totalAmount: b.totalAmount + order.totalAmount, notes: (b.notes || '') + `\n[مطعمة] ${order.totalAmount} د.ج` }; } return b; }));
      addNotification(`تم تحويل الفاتورة (${order.totalAmount} د.ج) إلى الغرفة ${rooms.find(r => r.id === roomId)?.number}`, 'success', `النزيل: ${booking.primaryGuestName}`);
  };

  const recordAttendance = (userId: string, type: 'in' | 'out', timestamp?: string) => {
      const user = users.find(u => u.id === userId);
      if (!user) return;
      const date = timestamp ? new Date(timestamp) : new Date();
      const dateStr = date.toISOString().split('T')[0];
      const timeStr = date.toISOString();
      setAttendanceRecords(prev => {
          const existing = prev.find(r => r.userId === userId && r.date === dateStr);
          if (type === 'in') {
              if (existing) return prev;
              const limit = new Date(dateStr + 'T' + (settings.workStartTime || '09:00:00'));
              const isLate = date > limit;
              const diffMinutes = isLate ? Math.floor((date.getTime() - limit.getTime()) / 60000) : 0;
              const deduction = diffMinutes > 15 ? Math.floor(diffMinutes / 15) * 100 : 0;
              if (deduction > 0) {
                  addTransaction({ amount: deduction, type: 'expense', category: 'deduction', description: `خصم تأخير آلي - ${user.name}`, notes: `تأخر ${diffMinutes} دقيقة`, targetUserId: userId, userId: 'system' });
                  addNotification(`تم تسجيل تأخير للموظف ${user.name} (${diffMinutes} دقيقة)`, 'warning', `تم خصم ${deduction} د.ج`);
              }
              return [...prev, { id: `att-${Date.now()}`, userId, userName: user.name, date: dateStr, checkInTime: timeStr, status: isLate ? 'late' : 'present', lateDurationMinutes: diffMinutes, deductionAmount: deduction }];
          } else {
              if (!existing) return prev;
              return prev.map(r => r.id === existing.id ? { ...r, checkOutTime: timeStr } : r);
          }
      });
  };

  const updateAttendanceRecord = (recordId: string, updates: Partial<AttendanceRecord>) => {
      setAttendanceRecords(prev => prev.map(record => {
          if (record.id !== recordId) return record;
          return { ...record, ...updates };
      }));
  };

  const addLeaveRequest = (req: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) => {
      const newReq: LeaveRequest = {
          id: `leave-${Date.now()}`,
          status: 'pending',
          createdAt: new Date().toISOString(),
          ...req
      };
      setLeaveRequests(prev => [newReq, ...prev]);
      addNotification(`طلب إجازة جديد: ${req.userName}`, 'info', `${req.type} - ${req.daysCount} أيام`);
  };

  const updateLeaveStatus = (id: string, status: LeaveStatus, reason?: string) => {
      setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status, rejectionReason: reason, approvedBy: currentUser?.name } : r));
      const req = leaveRequests.find(r => r.id === id);
      if (req && status === 'approved') {
          addNotification(`تمت الموافقة على إجازة ${req.userName}`, 'success');
          if (req.type === 'unpaid' || req.type === 'sick') {
              addNotification(`تنبيه محاسبي: إجازة ${req.type === 'unpaid' ? 'بدون راتب' : 'مرضية'} للموظف ${req.userName}`, 'warning', `يرجى مراجعة الخصومات (${req.daysCount} أيام)`);
          }
      } else if (req && status === 'rejected') {
          addNotification(`تم رفض طلب الإجازة للموظف ${req.userName}`, 'error');
      }
  };

  const addExternalOrder = (order: Omit<ExternalOrder, 'id' | 'timestamp' | 'status'>) => {
      const newOrder: ExternalOrder = {
          ...order,
          id: `ext-${Date.now()}`,
          status: 'pending',
          timestamp: new Date().toISOString()
      };
      setExternalOrders(prev => [newOrder, ...prev]);
      addNotification(`طلب خارجي جديد: ${order.type}`, 'info', `${order.customerName} - ${order.totalAmount} د.ج`);
  };

  const updateExternalOrderStatus = (id: string, status: ExternalOrder['status']) => {
      setExternalOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      const order = externalOrders.find(o => o.id === id);
      if (order) {
          addNotification(`تحديث حالة الطلب الخارجي: ${status}`, 'info', `${order.customerName}`);
      }
  };

  const addCoordinationNote = (note: Omit<CoordinationNote, 'id' | 'createdAt' | 'createdBy' | 'isResolved'>) => {
      const newNote: CoordinationNote = {
          ...note,
          id: `coord-${Date.now()}`,
          createdAt: new Date().toISOString(),
          createdBy: currentUser?.name || 'System',
          isResolved: false
      };
      setCoordinationNotes(prev => [newNote, ...prev]);
      addNotification(`ملاحظة تنسيق جديدة`, 'warning', `${note.content}`, { departments: note.targetDepartments });
  };

  const resolveCoordinationNote = (id: string) => {
      setCoordinationNotes(prev => prev.map(n => n.id === id ? { ...n, isResolved: true } : n));
  };

  const reportIncident = (incident: Omit<IncidentReport, 'id' | 'reportedAt' | 'status' | 'isFineApplied'>) => {
      const newIncident: IncidentReport = {
          id: `inc-${Date.now()}`,
          reportedAt: new Date().toISOString(),
          status: 'reported',
          isFineApplied: false,
          ...incident
      };
      setIncidentReports(prev => [newIncident, ...prev]);
      addNotification(`بلاغ جديد: ${incident.title}`, 'error', incident.location, {roles: ['manager', 'assistant_manager', 'security'] as any});
  };

  const resolveIncident = (id: string, action: 'resolve' | 'dismiss' | 'apply_fine', resolutionNotes?: string) => {
      setIncidentReports(prev => prev.map(inc => {
          if (inc.id !== id) return inc;
          
          let updatedStatus: IncidentReport['status'] = action === 'dismiss' ? 'dismissed' : 'resolved';
          let fineApplied = inc.isFineApplied;

          if (action === 'apply_fine' && inc.fineAmount && !inc.isFineApplied) {
              fineApplied = true;
              updatedStatus = 'resolved';
              
              if (inc.type === 'guest_violation' && inc.relatedRoomId) {
                  const booking = bookings.find(b => b.roomId === inc.relatedRoomId && b.status === 'active');
                  if (booking) {
                      setBookings(curr => curr.map(b => b.id === booking.id ? { 
                          ...b, 
                          totalAmount: b.totalAmount + (inc.fineAmount || 0),
                          notes: (b.notes || '') + `\n[مخالفة] ${inc.fineAmount} د.ج - ${inc.title}`
                      } : b));
                      addNotification(`تم إضافة غرامة (${inc.fineAmount}) للغرفة ${rooms.find(r=>r.id===inc.relatedRoomId)?.number}`, 'warning');
                  } else {
                      addNotification(`تم تسجيل الغرامة ولكن الغرفة ${rooms.find(r=>r.id===inc.relatedRoomId)?.number} غير مشغولة حالياً`, 'info');
                  }
              } else if (inc.type === 'staff_violation' && inc.relatedStaffId) {
                  addTransaction({
                      amount: inc.fineAmount,
                      type: 'income', // Fine is income for hotel
                      category: 'fine',
                      description: `غرامة موظف: ${inc.relatedStaffId} - ${inc.title}`,
                      userId: 'system',
                      userName: 'System',
                      targetUserId: inc.relatedStaffId
                  });
                  addNotification(`تم تسجيل غرامة (${inc.fineAmount}) على الموظف ${users.find(u=>u.id===inc.relatedStaffId)?.name}`, 'warning');
              }
          }

          return { ...inc, status: updatedStatus, isFineApplied: fineApplied, resolutionNotes };
      }));
  };

  const addPartner = (p: Partner) => setPartners(prev => [...prev, p]);
  const updatePartner = (id: string, updates: Partial<Partner>) => setPartners(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  const removePartner = (id: string) => setPartners(prev => prev.filter(p => p.id !== id));

  const addServicePoint = (point: ServicePoint) => setServicePoints(prev => [...prev, point]);
  const deleteServicePoint = (id: string) => setServicePoints(prev => prev.filter(p => p.id !== id));
  const updateServicePoint = (id: string, updates: Partial<ServicePoint>) => setServicePoints(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

  const addParkingSpot = (spot: ParkingSpot) => setParkingSpots(prev => [...prev, spot]);
  const updateParkingSpot = (id: string, updates: Partial<ParkingSpot>) => setParkingSpots(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

  const addLegalRule = (rule: LegalRule) => setLegalRules(prev => [...prev, rule]);
  const updateLegalRule = (id: string, updates: Partial<LegalRule>) => setLegalRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));

  const populateDemoData = async () => {
      console.log("Forcing Demo Data Population...");
      
      await injectDemoData({
          setUsers,
          setRooms,
          setBookings,
          setGuestHistory,
          setTransactions,
          setMaintenanceTickets,
          setNotifications,
          setHallBookings,
          setRestaurantOrders,
          setAttendanceRecords,
          setPoolPasses,
          setChatSessions,
          setMessages,
          setServiceRequests,
          setExternalOrders,
          setCoordinationNotes,
          setIncidentReports,
          setPublicServices,
          setFacilities,
          setHotelEvents,
          setActivities,
          setServiceFeedbacks,
          setGuestServices,
          setMenuItems,
          setRestaurantTables,
          setPartners,
          setServicePoints,
          setParkingSpots,
          setLegalRules,
          setJobOpenings,
          setJobApplications,
          setDeliveryDrivers,
          setInvoices,
          setReservations,
          setGuestRegistrationForms,
          setSettings,
          saveAll,
          saveSettings
      });

      addNotification('تم ملء البيانات التجريبية بنجاح!', 'success');
  };

  const addAuditLog = useCallback((action: string, details: string, category: AuditLog['category'], metadata?: any) => {
      const log: AuditLog = {
          id: `log-${Date.now()}`,
          userId: currentUser?.id || 'system',
          userName: currentUser?.name || 'النظام',
          userRole: currentUser?.role || 'staff',
          action,
          details,
          category,
          timestamp: new Date().toISOString(),
          metadata
      };
      setAuditLogs(prev => [log, ...prev]);
  }, [currentUser]);

  const addHousekeepingTask = (task: Omit<HousekeepingTask, 'id'>) => {
      const newTask: HousekeepingTask = {
          ...task,
          id: `hk-${Date.now()}`
      };
      setHousekeepingTasks(prev => {
          const updated = [newTask, ...prev];
          saveAll('housekeeping', updated);
          return updated;
      });
  };

  const updateHousekeepingTask = (id: string, updates: Partial<HousekeepingTask>) => {
      setHousekeepingTasks(prev => {
          const updated = prev.map(t => {
              if (t.id === id) {
                  const newTask = { ...t, ...updates };
                  // If status changed to clean, update room status
                  if (updates.status === 'clean' || updates.status === 'inspected') {
                      updateRoomStatus(t.roomId, 'available');
                  } else if (updates.status === 'maintenance') {
                      updateRoomStatus(t.roomId, 'maintenance');
                  }
                  return newTask;
              }
              return t;
          });
          saveAll('housekeeping', updated);
          return updated;
      });
      addAuditLog('تحديث مهمة تنظيف', `تحديث المهمة ${id} إلى ${updates.status}`, 'housekeeping');
  };

  const assignHousekeepingTask = (taskId: string, staffId: string, staffName: string) => {
      updateHousekeepingTask(taskId, { 
          assignedTo: staffId, 
          assignedName: staffName,
          status: 'cleaning',
          startTime: new Date().toISOString()
      });
  };

  const submitSelfCheckIn = (bookingId: string, data: { idPhoto: string, privacySignature: string }) => {
      setBookings(prev => {
          const updated = prev.map(b => {
              if (b.id === bookingId) {
                  const updatedGuests = b.guests.map((g, idx) => 
                      idx === 0 ? { ...g, ...data, isSelfCheckedIn: true } : g
                  );
                  return { ...b, guests: updatedGuests };
              }
              return b;
          });
          saveAll('bookings', updated);
          return updated;
      });
      addAuditLog('تسجيل وصول ذاتي', `النزيل في الحجز ${bookingId} قام بتسجيل الوصول ذاتياً`, 'booking');
      addNotification('تم استلام بيانات تسجيل الوصول الذاتي بنجاح', 'success');
  };

  const addJobOpening = (job: Omit<JobOpening, 'id' | 'postedDate' | 'status'>) => {
      setJobOpenings(prev => {
          const updated = [...prev, { ...job, id: `job-${Date.now()}`, postedDate: new Date().toISOString(), status: 'open' as const }];
          saveAll('jobOpenings', updated);
          return updated;
      });
  };

  const updateJobOpening = (id: string, updates: Partial<JobOpening>) => {
      setJobOpenings(prev => {
          const updated = prev.map(j => j.id === id ? { ...j, ...updates } : j);
          saveAll('jobOpenings', updated);
          return updated;
      });
  };

  const addJobApplication = (app: Omit<JobApplication, 'id' | 'appliedDate' | 'status'>) => {
      setJobApplications(prev => {
          const updated = [...prev, { ...app, id: `app-${Date.now()}`, appliedDate: new Date().toISOString(), status: 'received' as const }];
          saveAll('jobApplications', updated);
          return updated;
      });
  };

  const updateJobApplicationStatus = (id: string, status: JobApplication['status']) => {
      setJobApplications(prev => {
          const updated = prev.map(a => a.id === id ? { ...a, status } : a);
          saveAll('jobApplications', updated);
          return updated;
      });
  };



  const addReservation = (res: Omit<Reservation, 'id' | 'createdAt' | 'status' | 'qrCodeData'>) => {
      const id = `res-${Date.now()}`;
      const qrData = generateSystemQR('RESERVATION', id, res.guestName, 1, { type: res.type, target: res.targetName });
      const newRes: Reservation = {
          ...res,
          id,
          createdAt: new Date().toISOString(),
          status: 'confirmed',
          qrCodeData: qrData
      };
      setReservations(prev => {
          const updated = [...prev, newRes];
          saveAll('reservations', updated);
          return updated;
      });
      addNotification(`تم تأكيد الحجز: ${res.targetName}`, 'success');
  };

  const updateReservation = (id: string, updates: Partial<Reservation>) => {
      setReservations(prev => {
          const updated = prev.map(r => r.id === id ? { ...r, ...updates } : r);
          saveAll('reservations', updated);
          return updated;
      });
      addNotification('تم تحديث الحجز بنجاح', 'success');
  };

  const addPrintTemplate = (template: Omit<PrintTemplate, 'id'>) => {
      const newTemplate = { ...template, id: `tmpl-${Date.now()}` };
      setSettings(prev => {
          const updated = { ...prev, customPrintTemplates: [...(prev.customPrintTemplates || []), newTemplate] };
          saveSettings(updated);
          return updated;
      });
      addNotification('تم إضافة نموذج الطباعة بنجاح', 'success');
  };

  const updatePrintTemplate = (id: string, updates: Partial<PrintTemplate>) => {
      setSettings(prev => {
          const updated = { 
              ...prev, 
              customPrintTemplates: (prev.customPrintTemplates || []).map(t => t.id === id ? { ...t, ...updates } : t) 
          };
          saveSettings(updated);
          return updated;
      });
      addNotification('تم تحديث نموذج الطباعة بنجاح', 'success');
  };

  const deletePrintTemplate = (id: string) => {
      setSettings(prev => {
          const updated = { 
              ...prev, 
              customPrintTemplates: (prev.customPrintTemplates || []).filter(t => t.id !== id) 
          };
          saveSettings(updated);
          return updated;
      });
      addNotification('تم حذف نموذج الطباعة بنجاح', 'info');
  };

  const updateDesktopConfig = (updates: Partial<DesktopConfig>) => {
      setSettings(prev => {
          const updated = { 
              ...prev, 
              desktopConfig: { ...prev.desktopConfig, ...updates } 
          };
          saveSettings(updated);
          return updated;
      });
      addNotification('تم تحديث إعدادات المكتب بنجاح', 'success');
  };

  const addResourceBooking = (bookingData: Omit<ResourceBooking, 'id' | 'createdAt' | 'status'>) => {
      const newBooking: ResourceBooking = {
          ...bookingData,
          id: `res-${Date.now()}`,
          status: 'confirmed',
          createdAt: new Date().toISOString()
      };
      setResourceBookings(prev => [...prev, newBooking]);
      
      // Update unit status
      updateServicePointUnit(bookingData.servicePointId, bookingData.unitId, { status: 'occupied' });
      addNotification(`تم حجز ${bookingData.unitId} بنجاح`, 'success');
  };

  const updateResourceBooking = (id: string, updates: Partial<ResourceBooking>) => {
      setResourceBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const updateServicePointUnit = (servicePointId: string, unitId: string, updates: Partial<BookableUnit>) => {
      setServicePoints(prev => {
          const updated = prev.map(sp => {
              if (sp.id === servicePointId && sp.units) {
                  return {
                      ...sp,
                      units: sp.units.map(u => u.id === unitId ? { ...u, ...updates } : u)
                  };
              }
              return sp;
          });
          saveAll('servicePoints', updated);
          return updated;
      });
  };

  const addPublicService = (s: PublicService) => setPublicServices(prev => [...prev, s]);
  const updatePublicService = (id: string, updates: Partial<PublicService>) => setPublicServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  const deletePublicService = (id: string) => setPublicServices(prev => prev.filter(s => s.id !== id));

  const addFacility = (f: Facility) => setFacilities(prev => [...prev, f]);
  const updateFacility = (id: string, updates: Partial<Facility>) => setFacilities(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  const deleteFacility = (id: string) => setFacilities(prev => prev.filter(f => f.id !== id));

  const addHotelEvent = (e: HotelEvent) => setHotelEvents(prev => [...prev, e]);
  const updateHotelEvent = (id: string, updates: Partial<HotelEvent>) => setHotelEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  const deleteHotelEvent = (id: string) => setHotelEvents(prev => prev.filter(e => e.id !== id));

  const addActivity = (activity: HotelActivity) => setActivities(prev => [...prev, activity]);
  const updateActivity = (id: string, updates: Partial<HotelActivity>) => setActivities(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  const deleteActivity = (id: string) => setActivities(prev => prev.filter(a => a.id !== id));

  const addServiceFeedback = (feedback: ServiceFeedback) => {
      setServiceFeedbacks(prev => {
          const updated = [feedback, ...prev];
          saveAll('serviceFeedbacks', updated);
          return updated;
      });
      
      // Update target rating (Simplified logic for demo)
      if (feedback.targetType === 'service') {
          const service = publicServices.find(s => s.id === feedback.targetId);
          if (service) {
              const currentCount = service.feedbackCount || 0;
              const currentRating = service.rating || 5;
              const newRating = ((currentRating * currentCount) + feedback.rating) / (currentCount + 1);
              updatePublicService(feedback.targetId, { 
                  rating: Number(newRating.toFixed(1)), 
                  feedbackCount: currentCount + 1 
              });
          }
      } else if (feedback.targetType === 'facility') {
          const facility = facilities.find(f => f.id === feedback.targetId);
          if (facility) {
              const currentCount = facility.feedbackCount || 0;
              const currentRating = facility.rating || 5;
              const newRating = ((currentRating * currentCount) + feedback.rating) / (currentCount + 1);
              updateFacility(feedback.targetId, { 
                  rating: Number(newRating.toFixed(1)), 
                  feedbackCount: currentCount + 1 
              });
          }
      }
      
      addNotification('شكراً لتقييمك! رأيك يهمنا جداً.', 'success');
  };

  return (
    <HotelContext.Provider value={{
      // ... existing values
      publicServices, facilities, hotelEvents, serviceFeedbacks, activities,
      addPublicService, updatePublicService, deletePublicService,
      addFacility, updateFacility, deleteFacility,
      addHotelEvent, updateHotelEvent, deleteHotelEvent,
      addActivity, updateActivity, deleteActivity,
      addServiceFeedback,
      auditLogs, addAuditLog,
      housekeepingTasks, updateHousekeepingTask, assignHousekeepingTask,
      rolePermissions, updateRolePermissions, checkPermission, canAccessPage, canPerformAction, isButtonVisible,
      submitSelfCheckIn,
      guestProfile, registerGuest,
      currentUser, users, rooms, bookings, invoices, notifications, messages, settings, guestHistory, chatSessions, userShortcuts, transactions, hallBookings, poolPasses, restaurantOrders, qrRecords, maintenanceTickets, qrLogs,
      reservations, // New
      guestRegistrationForms,
      submitGuestRegistrationForm,
      updateGuestRegistrationFormStatus,
      confirmBooking,
      cancelBooking,
      toggleAutoApproval,
      login, logout, forgetUser, recentUsers,
      updateUser, updateSettings, updatePageTitle, updateRoomStatus, updateRoomType, updateRoomCount, addBooking, updateBooking, extendBooking, addGuestToRoom, checkIn, checkOut, 
      addInvoice, updateInvoice, addTransaction, sendMessage, sendGuestMessage, replyToGuest, toggleChatMute, toggleShortcut,
      toggleDarkMode, setTheme, searchGuest, 
      activeToast, hideToast, markAsRead, moveToTrash, restoreNotification, deleteNotificationPermanently, emptyTrash, addNotification,
      addStaff, removeStaff, clearUserBalance,
      addHallBooking, cancelHallBooking, createPoolPass, invalidatePoolPass, 
      addRestaurantOrder, updateRestaurantOrder, inventory, updateInventory,
      menuItems, addMenuItem, updateMenuItem, deleteMenuItem, restaurantTables, updateTableStatus, chargeOrderToRoom, updateRestaurantOrderItems,
      addQRRecord, scanQRRecord, addMaintenanceTicket, resolveMaintenanceTicket,
      activeProfile, setActiveProfile,
      guestServices, serviceRequests, toggleServiceStatus, addNewService, removeService, requestService, updateServiceRequestStatus, updateServiceItem,
      moveBooking, splitBooking, securityLogs, addSecurityLog, 
      generateSystemQR, parseSystemQR,
      resetQRState, regenerateBookingQR,
      toggleGuestPresence,
      updateRoomPrices, updateStandardRate, updateServiceAvailability,
      leaveRequests, addLeaveRequest, updateLeaveStatus,
      staffRequests, submitStaffRequest,
      attendanceRecords, recordAttendance, updateAttendanceRecord,
      incidentReports, reportIncident, resolveIncident,
      addTable, removeTable, updateTableDetails,
      externalOrders, addExternalOrder, updateExternalOrderStatus,
      coordinationNotes, addCoordinationNote, resolveCoordinationNote,
      partners, addPartner, updatePartner, removePartner,
      servicePoints, addServicePoint, updateServicePoint, deleteServicePoint,
      parkingSpots, addParkingSpot, updateParkingSpot,
      legalRules, addLegalRule, updateLegalRule,
      jobOpenings, addJobOpening, updateJobOpening,
      jobApplications, addJobApplication, updateJobApplicationStatus,
      printTemplates: settings.customPrintTemplates || [],
      addPrintTemplate, updatePrintTemplate, deletePrintTemplate, updateDesktopConfig,
      resourceBookings, addResourceBooking, updateResourceBooking, updateServicePointUnit,
      addReservation, updateReservation,
      deliveryDrivers, addDeliveryDriver, updateDriverStatus, assignDriverToOrder, rateDeliveryOrder,
      cart,
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      updateCartItemNotes,
      clearCart,
      populateDemoData
    }}>
      {children}
    </HotelContext.Provider>
  );
};
