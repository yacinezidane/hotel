
export type Role = 
  | 'admin'
  | 'manager' 
  | 'assistant_manager' 
  | 'operations_manager'
  | 'reception_manager'
  | 'receptionist' 
  | 'restaurant_manager' 
  | 'head_chef'
  | 'chef'
  | 'waiter'
  | 'cafe_manager' 
  | 'barista'
  | 'housekeeping_manager'
  | 'housekeeping_staff'
  | 'maintenance_manager'
  | 'maintenance_staff'
  | 'security_manager'
  | 'security_guard'
  | 'hr_manager'
  | 'accountant'
  | 'marketing_specialist'
  | 'it_specialist'
  | 'concierge'
  | 'bellboy'
  | 'driver'
  | 'staff'
  | 'guest'
  | 'visitor';
export type RoomStatus = 'available' | 'booked' | 'occupied' | 'dirty' | 'maintenance';
export type RoomType = 'single' | 'double' | 'suite' | 'vip';
export type AppTheme = 'zellige' | 'zellige-v2' | 'zellige-algiers' | 'default' | 'modern' | 'zellige-joy' | 'zellige-green' | 'zellige-authentic' | 'instagram' | 'real-madrid' | 'barcelona' | 'comoros' | 'ceramic-talavera' | 'ceramic-majolica' | 'ceramic-delft' | 'ceramic-iznik' | 'lihab-al-oud' | 'algerian-military' | 'modern-ornate' | 'rose' | 'ocean' | 'zellige-tlemcen' | 'zellige-sahara';
export type GridDensity = 'compact' | 'comfortable' | 'spacious';
export type MealPlan = 'room_only' | 'breakfast' | 'half_board' | 'full_board';
export type ThemeVibrancy = 'subtle' | 'normal' | 'bold'; 
export type GuestLocationStatus = 'in_hotel' | 'out_of_hotel';

export type Department = 
  | 'administration' 
  | 'reception' 
  | 'guest_services' 
  | 'housekeeping' 
  | 'food_beverage' 
  | 'maintenance' 
  | 'security' 
  | 'hr' 
  | 'finance' 
  | 'sales_marketing' 
  | 'it' 
  | 'spa_wellness'
  | 'transport'
  | 'room_service'
  | 'management'
  | 'restaurant';

// --- VIOLATIONS & INCIDENTS ---
export type IncidentType = 'guest_violation' | 'staff_violation' | 'property_damage' | 'security_alert' | 'other';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'reported' | 'investigating' | 'resolved' | 'dismissed';

// ... existing code ...
export interface IncidentReport {
    id: string;
    type: IncidentType;
    severity: IncidentSeverity;
    title: string;
    description: string;
    location: string; 
    reportedBy: string; 
    reportedAt: string;
    status: IncidentStatus;
    relatedRoomId?: number; 
    relatedStaffId?: string; 
    fineAmount?: number;
    isFineApplied: boolean;
    evidencePhotos?: string[]; 
    resolutionNotes?: string;
}

export type StaffRank = 'Executive' | 'Senior' | 'Junior' | 'Intern' | 'Trainee';
export type GuestRank = 'Explorer' | 'Resident' | 'Ambassador' | 'Honorary_Crew';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  details: string;
  category: 'booking' | 'finance' | 'staff' | 'settings' | 'security' | 'housekeeping' | 'other';
  timestamp: string;
  ipAddress?: string;
  metadata?: any;
}

export interface HousekeepingTask {
  id: string;
  roomId: number;
  roomNumber: string;
  assignedTo?: string; // Staff ID
  assignedName?: string;
  status: 'dirty' | 'cleaning' | 'clean' | 'maintenance' | 'inspected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  startTime?: string;
  endTime?: string;
  lastCleanedAt?: string;
  itemsNeeded?: string[];
}

export interface HotelActivity {
    id: string;
    title: string;
    description: string;
    type: 'entertainment' | 'sports' | 'culture' | 'kids' | 'wellness';
    location: string;
    startTime: string;
    endTime: string;
    days: string[]; // e.g., ['Monday', 'Wednesday']
    isPaid: boolean;
    price?: number;
    image?: string;
    organizer?: string; // Staff ID
}

export interface UserPermissions {
  canManageRooms: boolean;
  canManageBookings: boolean;
  canViewSecurityLink: boolean;
  canManageInvoices: boolean;
  canViewAccounting: boolean;
  canManageFinance: boolean;
  canManageStaff: boolean;
  canManageSettings: boolean;
  canManageMenu: boolean;
  canManageServices: boolean;
  canUseChat: boolean;
  canBroadcast: boolean;
  canCustomizeTitles?: boolean;
  canClearSettlements?: boolean;
  canPrintGuestForms?: boolean;
  canManageParking?: boolean;
  canManageKiosks?: boolean;
  canViewAuditLogs?: boolean;
  canManageHousekeeping?: boolean;
  
  // Granular Controls
  visiblePages: string[]; // List of page keys
  allowedActions: string[]; // List of action keys (e.g., 'delete_booking', 'edit_salary')
  hiddenButtons: string[]; // List of button IDs to hide
}

export interface RolePermissionSet {
  role: Role;
  permissions: UserPermissions;
  updatedAt: string;
  updatedBy: string;
}

export interface User {
  id: string;
  code: string; // New: Staff Code e.g., ADM-001
  name: string;
  role: Role;
  rank: StaffRank; // New
  crewId?: string; // New: For "Sense of Belonging"
  department: Department;
  isHeadOfDepartment: boolean;
  salary: number; 
  joinDate: string;
  avatar: string;
  isBlocked: boolean;
  accessCode?: string;
  permissions: UserPermissions;
  jobTitle?: string; 
  leaveBalance?: number;
  phone?: string; 
  email?: string; 
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
}

export interface KioskProduct {
    id: string;
    name: string;
    price: number;
    type: 'product' | 'service';
    isAvailable: boolean;
    stock?: number;
    description?: string;
}

export interface ParkingSpot {
    id: string;
    number: string;
    type: 'shaded' | 'unshaded' | 'guarded' | 'unguarded' | 'vip' | 'valet';
    status: 'available' | 'occupied' | 'reserved' | 'maintenance';
    pricePerHour: number;
    pricePerDay: number;
    vehiclePlate?: string;
    currentBookingId?: string;
    services: string[]; // e.g., 'cleaning', 'maintenance'
}

export interface LegalRule {
    id: string;
    title: string;
    content: string;
    category: 'hotel_policy' | 'facility_rule' | 'legal_advice';
    isActive: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense' | 'settlement';
  category: 'booking' | 'service' | 'maintenance' | 'salary' | 'bonus' | 'deduction' | 'hall' | 'pool' | 'restaurant' | 'cafe' | 'parking' | 'kiosk' | 'other' | 'fine';
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'check'; // New
  cardDetails?: { last4: string; brand: string }; // New
  description: string;
  notes?: string;
  date: string;
  userId: string;
  userName: string;
  relatedId?: string;
  targetUserId?: string; 
}

export interface MaintenanceTicket {
    id: string;
    description: string;
    location: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'pending';
    reportedBy: string;
    assignedTo?: string;
    createdAt: string;
    resolvedAt?: string;
    images?: string[];
    roomId?: number;
    reportedAt?: string;
}

export type LeaveType = 'annual' | 'sick' | 'unpaid' | 'recovery' | 'maternity' | 'emergency';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
    id: string;
    userId: string;
    userName: string;
    userRole: Role;
    type: LeaveType;
    startDate: string;
    endDate: string;
    daysCount: number;
    reason: string;
    status: LeaveStatus;
    createdAt: string;
    approvedBy?: string;
    rejectionReason?: string;
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave' | 'checkout';

export interface AttendanceRecord {
    id: string;
    userId: string;
    userName: string;
    date: string; 
    checkInTime?: string; 
    checkOutTime?: string; 
    status: AttendanceStatus;
    lateDurationMinutes: number;
    deductionAmount: number; 
    notes?: string;
}

export interface Table {
    id: string;
    number: string;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved' | 'cleaning';
    currentOrderId?: string;
    zone: 'main_hall' | 'terrace' | 'vip_corner' | 'garden';
    location: 'restaurant' | 'cafe'; 
    classification?: string; // New: VIP, Standard, etc.
}

export type StaffRequestType = 'financial_appeal' | 'admin_inquiry' | 'complaint' | 'suggestion' | 'resignation' | 'other';
export type StaffRequestStatus = 'pending' | 'in_review' | 'resolved' | 'rejected';

export interface StaffRequest {
    id: string;
    userId: string;
    type: StaffRequestType;
    subject: string;
    description: string;
    priority: 'normal' | 'urgent';
    status: StaffRequestStatus;
    createdAt: string;
    adminResponse?: string;
    resolvedAt?: string;
}

export interface JobOpening {
    id: string;
    title: string;
    department: Department;
    type: 'full_time' | 'part_time' | 'contract' | 'internship';
    description: string;
    requirements: string[];
    salaryRange?: string;
    status: 'open' | 'closed' | 'draft';
    postedDate: string;
    closingDate?: string;
}

export interface JobApplication {
    id: string;
    jobId: string;
    candidateName: string;
    email: string;
    phone: string;
    resumeUrl?: string;
    status: 'received' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected' | 'pending';
    appliedDate: string;
    notes?: string;
    rating?: number;
}

export interface Room {
  id: number;
  number: string;
  type: RoomType;
  status: RoomStatus;
  price: number;
  currentGuestLocation?: GuestLocationStatus;
}

export interface GuestInfo {
  idType: string;
  idNumber: string;
  firstNameAr: string;
  lastNameAr: string;
  firstNameEn: string;
  lastNameEn: string;
  firstName?: string; // For compatibility
  lastName?: string; // For compatibility
  name?: string; // For compatibility
  birthDate: string;
  birthPlace: string;
  fatherName: string;
  motherName: string;
  nationality?: string;
  phone?: string;
  email?: string; // For compatibility
  lastVisit?: string; // For compatibility
  idPhoto?: string;
  privacySignature?: string; // New: Base64 signature
  isSelfCheckedIn?: boolean; // New
  checkInStatus?: 'checked_in' | 'pending_arrival' | 'checked_out';
  checkInTime?: string;
  checkOutTime?: string;
  rank?: GuestRank;
  loyaltyPoints?: number;
  crewId?: string;
}

export interface ExtraService {
  id: string;
  name: string;
  price: number;
}

export interface Booking {
  id: string;
  guests: GuestInfo[];
  primaryGuestName: string;
  companyName?: string;
  roomId: number;
  roomNumber?: string;
  roomType?: RoomType;
  checkInDate: string;
  checkOutDate: string;
  checkIn?: string; // For compatibility
  checkOut?: string; // For compatibility
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'confirmed';
  totalAmount: number;
  guestToken: string;
  mealPlan: MealPlan;
  extraServices: ExtraService[];
  notes?: string;
  guestLocation?: GuestLocationStatus;
  phone?: string;
}

export type HallLayoutStyle = 'theater' | 'classroom' | 'u_shape' | 'banquet' | 'reception';
export type HallCateringType = 'none' | 'coffee_break' | 'buffet_lunch' | 'gala_dinner' | 'snacks';

export interface HallBooking {
  id: string;
  clientName: string;
  idNumber?: string;
  phone?: string;
  eventType: 'wedding' | 'meeting' | 'party' | 'conference' | 'workshop';
  startDate: string;
  date?: string; // For compatibility
  eventName?: string; // For compatibility
  startTime?: string;
  endTime?: string;
  days: number;
  guestCount: number;
  attendees?: number; // For compatibility
  tableCount?: number; // New
  seatCount?: number; // New
  price: number;
  notes?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentStatus?: 'paid' | 'partial' | 'unpaid';
  
  // Professional Details
  layoutStyle: HallLayoutStyle;
  cateringType: HallCateringType;
  resources?: string[]; // mic, projector, etc.
  services?: string[]; // For compatibility
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'hot_drink' | 'cold_drink' | 'breakfast' | 'meal' | 'dessert';
  price: number;
  isAvailable: boolean;
  description?: string;
  image?: string;
}

export interface ServicePoint {
    id: string;
    name: string;
    type: 'kiosk' | 'garden' | 'park' | 'hotel_facility' | 'venue' | 'roaming_cart' | 'activity_zone' | 'restaurant' | 'pool' | 'cafe' | 'other';
    category: 'permanent' | 'pop_up' | 'seasonal';
    location: { lat: number; lng: number; address: string; parentVenueId?: string };
    status: 'active' | 'inactive' | 'maintenance' | 'scheduled' | 'expired';
    managerId?: string;
    description?: string;
    image?: string;
    
    // For Temporary/Pop-up
    validFrom?: string;
    validUntil?: string;
    linkedEventId?: string;
    
    // Operational
    currentStaffIds?: string[];
    menuId?: string; // If it sells food
    
    // For Grand Garden / Hubs
    capacity?: number;
    occupancy?: number;
    seatCount?: number;
    tableCount?: number;
    classification?: string;
    zones?: {
        id: string;
        name: string;
        type: 'seating' | 'kiosk_spot' | 'walkway' | 'stage';
        status: 'available' | 'occupied' | 'reserved' | 'maintenance';
        capacity?: number;
        features?: string[];
    }[];
    features?: string[]; // e.g., 'shaded', 'fountain', 'wifi'
    products?: KioskProduct[]; // New
    units?: BookableUnit[]; // New: Detailed inventory
    allowBooking?: boolean; // New
}

export interface BookableUnit {
    id: string;
    name: string;
    type: 'table' | 'seat' | 'ticket' | 'sunbed' | 'cabana' | 'view_spot' | 'other';
    capacity: number;
    status: 'available' | 'occupied' | 'reserved' | 'maintenance';
    classification: 'standard' | 'vip' | 'premium';
    basePrice: number;
    price?: number; // For compatibility
    features?: string[];
    position?: { x: number; y: number; rotation?: number }; // New: For map visualization
}

export interface ResourceBooking {
    id: string;
    servicePointId: string;
    unitId: string;
    guestName: string;
    guestPhone?: string;
    startTime: string;
    endTime: string;
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
    totalAmount: number;
    notes?: string;
    deposit?: number;
    createdAt: string;
    guestCount?: number;
    duration?: number;
}

export interface KioskProduct {
    id: string;
    name: string;
    price: number;
    type: 'product' | 'service';
    isAvailable: boolean;
    stock?: number;
    description?: string;
}

export interface ParkingSpot {
    id: string;
    number: string;
    type: 'shaded' | 'unshaded' | 'guarded' | 'unguarded' | 'vip' | 'valet';
    status: 'available' | 'occupied' | 'reserved' | 'maintenance';
    pricePerHour: number;
    pricePerDay: number;
    vehiclePlate?: string;
    currentBookingId?: string;
    services: string[]; // e.g., 'cleaning', 'maintenance'
}

export interface LegalRule {
    id: string;
    title: string;
    content: string;
    category: 'hotel_policy' | 'facility_rule' | 'legal_advice';
    isActive: boolean;
}

export interface RestaurantOrder {
  id: string;
  items: { item: MenuItem; quantity: number }[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'completed' | 'served' | 'cancelled' | 'delivered';
  type: 'room_service' | 'dine_in' | 'event_catering' | 'pool_side' | 'delivery'; 
  source: 'restaurant' | 'cafe'; 
  targetNumber: string; 
  tableId?: string;
  bookingId?: string; // For compatibility
  timestamp: string;
  notes?: string;
  customerName?: string;
  deliveryAddress?: string;
  customerPhone?: string;
  roomNumber?: string;
  roomId?: number;
  
  // Delivery Specifics
  driverId?: string;
  driverName?: string;
  deliveryStartTime?: string;
  deliveryEndTime?: string;
  deliveryRating?: number;
  deliveryFeedback?: string;
  restaurantRating?: number;
  
  // Service Point Integration
  originServicePointId?: string;
  destinationServicePointId?: string;
}

export interface DeliveryDriver {
    id: string;
    name: string;
    phone: string;
    vehicleType: 'bike' | 'motorcycle' | 'car' | 'van';
    vehiclePlate?: string;
    status: 'available' | 'busy' | 'offline';
    currentOrderId?: string;
    totalDeliveries: number;
    averageRating: number;
    isExternal: boolean;
    currentLocation?: { lat: number; lng: number }; // New
}

export interface PoolPass {
  id: string;
  holderName: string;
  idNumber?: string;
  type: 'guest' | 'vip' | 'external';
  accessZone: 'general' | 'vip_lounge' | 'family_area';
  relatedRoomId?: number;
  date: string;
  expiryTime: string;
  price: number;
  isValid: boolean;
  qrCodeData: string;
  seatNumber?: string; // New
  tableNumber?: string; // New
}

export interface Invoice {
  id: string;
  bookingId: string;
  guestId?: string; // For compatibility
  guestName: string;
  amount: number;
  totalAmount?: number; // For compatibility
  date: string;
  isPaid: boolean;
  status?: string; // For compatibility
  items?: any[]; // For compatibility
  details?: {
    roomTotal: number;
    mealTotal: number;
    servicesTotal: number;
    days: number;
    mealPlan: string;
  }; 
}

export type QRUsageType = 'single_use' | 'access_pass' | 'identity' | 'ticket' | 'order' | 'staff_access' | 'multi_use';
export type QRCurrentState = 'fresh' | 'active_session' | 'consumed' | 'expired' | 'blocked';

export interface QRRecord {
  id: string;
  type: 'booking' | 'invoice' | 'pool_pass' | 'hall' | 'restaurant' | 'guest_service';
  usageType: QRUsageType;
  referenceId: string; 
  title: string;
  subtitle: string;
  currentState: QRCurrentState;
  lastScanLocation?: string;
  lastScanTime?: string;
  status: 'valid' | 'expired' | 'used' | 'cancelled';
  createdAt: string;
  dataPayload: string; 
  scannedCount: number;
  maxScans?: number;
  meta?: any; 
  guestName?: string; // For compatibility
  token?: string; // For compatibility
}

export interface QRScanLog {
    id: string;
    qrId: string;
    scannerId: string;
    location: string;
    timestamp: string;
    result: 'success' | 'denied' | 'fraud_alert';
    message: string;
}

export interface Notification {
  id: string;
  message: string;
  details?: string; 
  userId: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category?: 'task' | 'alert' | 'message' | 'reminder' | 'system'; // New
  hiddenFor: string[];
  readBy?: string[]; // New: List of user IDs who read this
  isTrashed?: boolean; 
  deletedAt?: string;
  targetDepartments?: Department[]; 
  targetRoles?: Role[]; 
  targetUsers?: string[]; 
  actionLink?: string; // New: URL or Page ID to navigate to
  actionLabel?: string; // New: Label for the action button
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  content: string;
  timestamp: string;
  isGuestMessage?: boolean;
  guestName?: string;
  roomNumber?: string;
}

export interface ChatSession {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  unreadCount: number;
  isGuest: boolean;
  isMuted: boolean;
  roomNumber?: string;
}

export interface PriceOption {
  label: string;
  amount: number;
}

export type ServiceLocationType = 'room' | 'suite' | 'vip' | 'restaurant_table' | 'cafe_table' | 'pool_chair' | 'vip_area' | 'lobby' | 'hall' | 'kiosk' | 'all';

export interface ServiceItem {
    id: string;
    icon: string; 
    labelAr: string;
    labelEn: string;
    description: string;
    targetDepartment: Department; 
    allowedLocations: ServiceLocationType[]; 
    isActive: boolean;
    price?: number;
}

export interface ServiceRequest {
    id: string;
    serviceId: string;
    guestName: string; 
    locationType: ServiceLocationType;
    locationId: string; 
    status: 'pending' | 'processing' | 'completed';
    timestamp: string;
    notes?: string;
}

export interface SecurityLog {
    id: string;
    type: 'alert' | 'report' | 'bulletin';
    title: string;
    content: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: string;
    reportedBy: string;
    status: 'open' | 'investigating' | 'closed';
    relatedRoomId?: number;
    guestName?: string;
}

export interface MarketingConfig {
    siteUrl: string;
    promoTitle: string;
    promoDescription: string;
    buttonText: string;
}

export type PrintTemplateStyle = 'royal_andalus' | 'modern_corporate' | 'vibrant_party' | 'classic_ticket';
export type RegistrationTemplateStyle = 'modern' | 'classic' | 'minimal' | 'elegant' | 'technical' | 'compact';
export type PoliceTemplateStyle = 'standard' | 'detailed' | 'compact' | 'modern' | 'classic' | 'official';

export interface PrintConfiguration {
    defaultWeddingTemplate: PrintTemplateStyle;
    defaultMeetingTemplate: PrintTemplateStyle;
    defaultTicketTemplate: PrintTemplateStyle;
    defaultRegistrationTemplate: RegistrationTemplateStyle;
    customFooterText: string;
    showQrCode: boolean;
}

export interface StandardRates {
    poolAccess: number;
    poolVipAccess: number;
    hallBasePrice: number;
    hallWeekendSurcharge: number;
    breakfastPrice: number;
    lateArrivalFine: number;
    parkingVIP: number;
    gardenPicnic: number;
    kioskSouvenir: number;
    visitorPoolAccess: number;
}

export interface HotelIdentity {
    openingDate: string;
    stars: number; // 1 to 7
    classificationType: 'Business' | 'Resort' | 'Boutique' | 'Hostel' | 'Luxury';
    crNumber: string; // Commercial Registration
    managerName: string;
    bio: string;
    globalRank?: string;
    website?: string;
    email?: string;
}

export interface SystemIntegrations {
    // Network
    guestWifiSsid: string;
    guestWifiPass: string;
    staffWifiSsid: string;
    
    // External Links (Booking/OTA)
    bookingEngineUrl: string;
    otaManagerUrl: string;
    
    // Internal Systems
    kitchenKdsUrl: string;
    localServerIp: string;
    housekeepingPortalUrl: string;

    // Hardware & Devices
    printerIp: string; // For thermal printers
    kioskMode: boolean; // UI simplification

    // Government & Helper Sites
    policePortalUrl: string; // E.g., Police des Etrangers
    tourismPortalUrl: string; // Ministry of Tourism
}

export interface Building {
    id: string;
    name: string;
    address: string;
    managerId?: string;
    roomCount: number;
    isActive: boolean;
}

export interface Partner {
    id: string;
    name: string;
    type: 'hotel' | 'service_center' | 'travel_agency' | 'corporate';
    contactPerson: string;
    email: string;
    phone: string;
    contractStatus: 'active' | 'pending' | 'expired';
    partnershipLevel: 'silver' | 'gold' | 'platinum';
    servicesExchanged: string[];
    logo?: string;
}

export interface RoomConfiguration {
    startingNumber: number;
    prefix: string; // e.g., "10" for 101, 102... or "A-" for A-1
    floorCount: number;
    roomsPerFloor: number;
}

export interface PrintTemplate {
    id: string;
    name: string;
    type: 'invoice' | 'booking' | 'pool_pass' | 'staff_id' | 'other' | 'ticket' | 'form' | 'card' | 'report' | 'letter';
    category?: string;
    description?: string;
    content: string; // HTML/Markdown template with placeholders like {{guestName}}
    styles?: string; // Custom CSS
    isDefault: boolean;
}

export interface DesktopWidget {
    id: string;
    type: 'stats' | 'quick_actions' | 'recent_bookings' | 'staff_status' | 'weather' | 'notifications' | 'clock';
    title: string;
    size: 'sm' | 'md' | 'lg';
    position: number;
    isVisible: boolean;
}

export interface DesktopConfig {
    widgets: DesktopWidget[];
    wallpaper?: string;
    showClock: boolean;
    isLocked: boolean;
    theme: 'modern' | 'glass' | 'classic' | 'dark';
}

export interface GuestRegistrationForm {
    id: string;
    registrationId?: string;
    bookingId?: string;
    firstNameAr: string;
    lastNameAr: string;
    firstNameEn: string;
    lastNameEn: string;
    idType: string;
    idNumber: string;
    idPhoto?: string | null;
    nationality: string;
    birthDate: string;
    birthPlace: string;
    fatherName: string;
    motherName: string;
    phone: string;
    email?: string;
    address?: string;
    profession?: string;
    purposeOfVisit?: string;
    vehiclePlate?: string;
    submittedAt: string;
    status: 'pending' | 'approved' | 'rejected' | 'processed' | 'archived';
}

export interface PrivateFirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  databaseId?: string;
}

export interface AppSettings {
  appName: string;
  welcomeTitle: string;
  totalRooms: number;
  roomConfig: RoomConfiguration; // New
  buildings: Building[]; // New
  partners: Partner[]; // New
  allowPrinting: boolean;
  autoApproveBookings: boolean; // New
  theme: AppTheme;
  themeStyle: 'flat' | 'gradient';
  themeVibrancy: ThemeVibrancy; 
  gridDensity: GridDensity;
  darkMode: boolean;
  themeLocked: boolean;
  invoiceHeaderImage?: string;
  registrationHeaderImage?: string;
  hotelAddress: string;
  hotelPhone: string;
  phone?: string; // For compatibility
  whatsappNumber?: string;
  hotelEmail: string;
  email?: string; // For compatibility
  taxNumber: string;
  invoiceFooterText: string;
  roomPrices: Record<RoomType, PriceOption[]>;
  pageTitles: Record<string, string>;
  salaryDate?: string;
  activeDepartments?: Department[];
  marketingConfig: MarketingConfig; 
  printConfig: PrintConfiguration; 
  standardRates: StandardRates; 
  hotelIdentity: HotelIdentity;
  systemIntegrations: SystemIntegrations;
  workStartTime?: string; 
  digitizationEnabled: boolean;
  defaultNationality: string;
  desktopConfig: DesktopConfig; // New
  customPrintTemplates: PrintTemplate[]; // New
  privateFirebaseConfig?: PrivateFirebaseConfig; // New: For independent database
  serviceAvailability: Record<string, boolean>; // New: For toggling services/facilities
  guestPermissions?: any; // For compatibility
}

export type ExternalServiceType = 'food_delivery' | 'transport' | 'catering' | 'laundry_pickup' | 'cleaning_service';

export interface ExternalOrder {
    id: string;
    type: ExternalServiceType;
    customerName: string;
    phone: string;
    address: string;
    items?: { name: string; quantity: number; price: number }[]; // For food/laundry
    details?: string; // For transport/cleaning
    status: 'pending' | 'accepted' | 'in_progress' | 'delivered' | 'cancelled';
    totalAmount: number;
    driverId?: string;
    timestamp: string;
    notes?: string;
}

export interface PublicService {
    id: string;
    title: string;
    description: string;
    iconName: string;
    image?: string;
    color?: string;
    category: 'internal' | 'external' | 'dining' | 'wellness' | 'business' | 'family' | 'other';
    isActive?: boolean;
    price?: number;
    features?: string[];
    rating?: number;
    feedbackCount?: number;
}

export interface Facility {
    id: string;
    title: string;
    description: string;
    iconName: string;
    image: string;
    color: string;
    isActive: boolean;
    rating?: number;
    feedbackCount?: number;
}

export interface ServiceFeedback {
    id: string;
    targetId: string;
    targetType: 'service' | 'facility' | 'menu_item';
    guestName: string;
    rating: number;
    comment: string;
    date: string;
}

export interface HotelEvent {
    id: string;
    title: string;
    date: string;
    startTime?: string;
    endTime?: string;
    description: string;
    image: string;
    category: string;
    isActive: boolean;
    totalSeats?: number;
    availableSeats?: number;
    price?: number;
}

export interface CoordinationNote {
    id: string;
    targetDepartments: Department[];
    content: string;
    priority: 'normal' | 'high' | 'urgent';
    createdBy: string;
    createdAt: string;
    relatedEventId?: string;
    relatedOrderId?: string;
    isResolved: boolean;
}

export interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    minThreshold: number;
    alertLevel?: number; // Alias for minThreshold
    cost?: number;
    category: 'food' | 'cleaning' | 'amenities' | 'maintenance' | 'office';
    lastUpdated: string;
}

export type ReservationType = 'table' | 'event' | 'pool' | 'service' | 'venue';

export interface Reservation {
    id: string;
    type: ReservationType;
    targetId: string; // ID of the table, event, venue, etc.
    targetName: string; // Name of the facility/event
    guestName: string;
    guestId?: string; // If registered guest
    roomNumber?: string;
    date: string;
    startTime: string;
    endTime?: string;
    pax: number; // Number of people
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    notes?: string;
    qrCodeData: string;
    createdAt: string;
    price?: number;
    isPaid: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image?: string;
  type: 'menu' | 'service' | 'facility';
  details?: any;
  notes?: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  rooms: Room[];
  bookings: Booking[];
  reservations: Reservation[]; // New
  invoices: Invoice[];
  notifications: Notification[];
  messages: Message[];
  transactions: Transaction[];
  hallBookings: HallBooking[];
  poolPasses: PoolPass[];
  restaurantOrders: RestaurantOrder[];
  qrRecords: QRRecord[]; 
  qrLogs: QRScanLog[]; 
  maintenanceTickets: MaintenanceTicket[]; 
  settings: AppSettings;
  guestHistory: GuestInfo[];
  chatSessions: ChatSession[];
  guestServices: ServiceItem[];
  serviceRequests: ServiceRequest[];
  securityLogs: SecurityLog[];
  leaveRequests: LeaveRequest[];
  staffRequests: StaffRequest[];
  attendanceRecords: AttendanceRecord[];
  restaurantTables: Table[];
  incidentReports: IncidentReport[];
  externalOrders: ExternalOrder[]; // New
  coordinationNotes: CoordinationNote[]; // New
  printTemplates: PrintTemplate[]; // New
  serviceFeedbacks: ServiceFeedback[]; // New
  guestProfile: { name: string, phone: string, idNumber: string, membershipCode: string } | null;
  registerGuest: (profile: { name: string, phone: string, idNumber: string }) => void;
  
  // Cart Management
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  updateCartItemNotes: (itemId: string, notes: string) => void;
  clearCart: () => void;

  // Delivery System
  deliveryDrivers: DeliveryDriver[];
  servicePoints: ServicePoint[]; // New
  parkingSpots: ParkingSpot[]; // New
  legalRules: LegalRule[]; // New
  addDeliveryDriver: (driver: DeliveryDriver) => void;
  updateDriverStatus: (driverId: string, status: DeliveryDriver['status']) => void;
  assignDriverToOrder: (orderId: string, driverId: string) => void;
  rateDeliveryOrder: (orderId: string, deliveryRating: number, restaurantRating: number, feedback?: string) => void;
  addServicePoint: (point: ServicePoint) => void; // New
  updateServicePoint: (id: string, updates: Partial<ServicePoint>) => void; // New
  
  // Parking
  addParkingSpot: (spot: ParkingSpot) => void;
  updateParkingSpot: (id: string, updates: Partial<ParkingSpot>) => void;
  
  // Legal
  addLegalRule: (rule: LegalRule) => void;
  updateLegalRule: (id: string, updates: Partial<LegalRule>) => void;

  // Feedback
  addServiceFeedback: (feedback: ServiceFeedback) => void;

  // Partnership Management
  addPartner: (partner: Partner) => void;
  updatePartner: (id: string, updates: Partial<Partner>) => void;
  removePartner: (id: string) => void;
}
