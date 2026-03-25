
import { AppSettings, Room, User, MenuItem, UserPermissions, ServiceItem, ParkingSpot, LegalRule, PublicService, Facility, HotelEvent } from './types';

// ... (Permissions constants remain same)
export const MANAGER_PERMISSIONS: UserPermissions = {
  canManageRooms: true,
  canManageBookings: true,
  canViewSecurityLink: true,
  canManageInvoices: true,
  canViewAccounting: true,
  canManageFinance: true,
  canManageStaff: true,
  canManageSettings: true,
  canManageMenu: true,
  canManageServices: true,
  canUseChat: true,
  canBroadcast: true,
  canPrintGuestForms: true,
  visiblePages: ['all'],
  allowedActions: ['all'],
  hiddenButtons: []
};

export const ASSISTANT_MANAGER_PERMISSIONS: UserPermissions = {
  canManageRooms: true,
  canManageBookings: true,
  canViewSecurityLink: true,
  canManageInvoices: true,
  canViewAccounting: true,
  canManageFinance: false,
  canManageStaff: true,
  canManageSettings: false,
  canManageMenu: true,
  canManageServices: true,
  canUseChat: true,
  canBroadcast: true,
  visiblePages: ['all'],
  allowedActions: ['all'],
  hiddenButtons: []
};

export const RECEPTIONIST_PERMISSIONS: UserPermissions = {
  canManageRooms: true,
  canManageBookings: true,
  canViewSecurityLink: true,
  canManageInvoices: true,
  canViewAccounting: false,
  canManageFinance: false,
  canManageStaff: false,
  canManageSettings: false,
  canManageMenu: false,
  canManageServices: false,
  canUseChat: true,
  canBroadcast: false,
  canPrintGuestForms: true,
  visiblePages: ['dashboard', 'rooms', 'bookings', 'invoices', 'messages', 'guest_services', 'profile'],
  allowedActions: ['edit_booking', 'check_in', 'check_out'],
  hiddenButtons: []
};

export const FB_MANAGER_PERMISSIONS: UserPermissions = {
  canManageRooms: false,
  canManageBookings: false,
  canViewSecurityLink: false,
  canManageInvoices: true,
  canViewAccounting: false,
  canManageFinance: false,
  canManageStaff: false,
  canManageSettings: false,
  canManageMenu: true,
  canManageServices: false,
  canUseChat: true,
  canBroadcast: false,
  visiblePages: ['dashboard', 'restaurant', 'cafe', 'invoices', 'profile'],
  allowedActions: ['manage_menu', 'view_orders'],
  hiddenButtons: ['admin_hub', 'settings']
};

export const STAFF_PERMISSIONS: UserPermissions = {
  canManageRooms: false, // Changed to false
  canManageBookings: false,
  canViewSecurityLink: false,
  canManageInvoices: false,
  canViewAccounting: false,
  canManageFinance: false,
  canManageStaff: false,
  canManageSettings: false,
  canManageMenu: false,
  canManageServices: false,
  canUseChat: true,
  canBroadcast: false,
  visiblePages: ['dashboard', 'rooms', 'bookings', 'messages', 'profile'],
  allowedActions: [],
  hiddenButtons: []
};

export const DEFAULT_ROLE_PERMISSIONS: Record<string, UserPermissions> = {
  manager: MANAGER_PERMISSIONS,
  assistant_manager: ASSISTANT_MANAGER_PERMISSIONS,
  receptionist: RECEPTIONIST_PERMISSIONS,
  staff: STAFF_PERMISSIONS,
  guest: {
    ...STAFF_PERMISSIONS,
    visiblePages: ['guest_services', 'restaurant', 'pool', 'events', 'profile'],
    canUseChat: true,
  },
  visitor: {
    ...STAFF_PERMISSIONS,
    visiblePages: ['public_landing', 'about', 'restaurant', 'pool'],
    canUseChat: false,
  }
};

export const HOUSEKEEPING_PERMISSIONS: UserPermissions = {
  canManageRooms: true, // Can update status
  canManageBookings: false,
  canViewSecurityLink: false,
  canManageInvoices: false,
  canViewAccounting: false,
  canManageFinance: false,
  canManageStaff: false,
  canManageSettings: false,
  canManageMenu: false,
  canManageServices: false,
  canUseChat: true,
  canBroadcast: false,
  visiblePages: ['dashboard', 'rooms', 'housekeeping', 'profile'],
  allowedActions: ['update_room_status'],
  hiddenButtons: ['admin_hub', 'settings', 'finance']
};

export const KITCHEN_PERMISSIONS: UserPermissions = {
  canManageRooms: false,
  canManageBookings: false,
  canViewSecurityLink: false,
  canManageInvoices: false,
  canViewAccounting: false,
  canManageFinance: false,
  canManageStaff: false,
  canManageSettings: false,
  canManageMenu: true, // Can update menu availability
  canManageServices: false,
  canUseChat: true,
  canBroadcast: false,
  visiblePages: ['dashboard', 'restaurant', 'profile'],
  allowedActions: ['update_menu_availability'],
  hiddenButtons: ['admin_hub', 'settings', 'finance', 'rooms']
};

export const DEFAULT_PRINT_TEMPLATES: any[] = [
    {
        id: 'tmpl-inv-1',
        name: 'فاتورة كلاسيكية',
        type: 'invoice',
        content: `
            <div style="font-family: sans-serif; padding: 40px; direction: rtl;">
                <h1 style="text-align: center; color: #006269;">{{hotelName}}</h1>
                <hr/>
                <div style="display: flex; justify-content: space-between;">
                    <div>
                        <p><b>الضيف:</b> {{guestName}}</p>
                        <p><b>رقم الغرفة:</b> {{roomNumber}}</p>
                    </div>
                    <div style="text-align: left;">
                        <p><b>التاريخ:</b> {{date}}</p>
                        <p><b>رقم الفاتورة:</b> {{invoiceId}}</p>
                    </div>
                </div>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <thead>
                        <tr style="background: #f0f0f0;">
                            <th style="border: 1px solid #ddd; padding: 10px;">الوصف</th>
                            <th style="border: 1px solid #ddd; padding: 10px;">المبلغ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {{#items}}
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 10px;">{{description}}</td>
                            <td style="border: 1px solid #ddd; padding: 10px; text-align: left;">{{amount}} د.ج</td>
                        </tr>
                        {{/items}}
                    </tbody>
                    <tfoot>
                        <tr style="font-weight: bold; background: #eee;">
                            <td style="border: 1px solid #ddd; padding: 10px;">الإجمالي</td>
                            <td style="border: 1px solid #ddd; padding: 10px; text-align: left;">{{total}} د.ج</td>
                        </tr>
                    </tfoot>
                </table>
                <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #777;">
                    {{footerText}}
                </div>
            </div>
        `,
        isDefault: true
    },
    {
        id: 'tmpl-pool-1',
        name: 'تذكرة مسبح أنيقة',
        type: 'pool_pass',
        content: `
            <div style="width: 300px; border: 2px solid #006269; border-radius: 15px; padding: 20px; text-align: center; font-family: sans-serif; direction: rtl;">
                <h2 style="color: #006269; margin-bottom: 5px;">{{hotelName}}</h2>
                <p style="font-size: 12px; margin-top: 0;">نادي المسبح والترفيه</p>
                <div style="background: #f9f9f9; padding: 10px; border-radius: 10px; margin: 15px 0;">
                    <p style="font-weight: bold; font-size: 18px; margin: 5px 0;">{{guestName}}</p>
                    <p style="font-size: 14px; color: #555; margin: 5px 0;">{{passType}}</p>
                </div>
                <div style="margin: 20px 0;">
                    {{qrCode}}
                </div>
                <p style="font-size: 10px; color: #999;">صالحة حتى: {{expiryTime}}</p>
            </div>
        `,
        isDefault: true
    }
];

export const INITIAL_DESKTOP_CONFIG: any = {
    widgets: [
        { id: 'w1', type: 'clock', title: 'الساعة', size: 'sm', position: 0, isVisible: true },
        { id: 'w2', type: 'stats', title: 'إحصائيات سريعة', size: 'md', position: 1, isVisible: true },
        { id: 'w3', type: 'quick_actions', title: 'إجراءات سريعة', size: 'sm', position: 2, isVisible: true },
        { id: 'w4', type: 'recent_bookings', title: 'آخر الحجوزات', size: 'lg', position: 3, isVisible: true },
        { id: 'w5', type: 'notifications', title: 'التنبيهات', size: 'md', position: 4, isVisible: true },
    ],
    showClock: true,
    isLocked: false,
    theme: 'modern'
};

export const INITIAL_SETTINGS: AppSettings = {
  appName: 'فندق الجزائر',
  welcomeTitle: 'مرحباً بكم في فندق الجزائر',
  totalRooms: 22,
  allowPrinting: true,
  autoApproveBookings: false,
  theme: 'zellige', 
  themeStyle: 'flat', 
  themeVibrancy: 'normal',
  gridDensity: 'comfortable', 
  darkMode: false,
  themeLocked: false,
  invoiceHeaderImage: '',
  registrationHeaderImage: '',
  hotelAddress: 'الجزائر العاصمة، شارع الاستقلال 01',
  hotelPhone: '+213 550 00 00 00',
  whatsappNumber: '+213 550 00 00 00',
  hotelEmail: 'contact@authentic-zellij.com',
  taxNumber: 'RC: 12345678 / NIF: 987654321',
  invoiceFooterText: 'شكراً لاختياركم AUTHENTIC ZELLIJ. نتمنى لكم إقامة ممتعة.',
  roomPrices: {
    single: [
      { label: 'سعر عادي', amount: 3000 },
      { label: 'نصف يوم', amount: 2000 },
      { label: 'سعر خاص', amount: 2500 },
      { label: 'موسم العطلات', amount: 4000 },
    ],
    double: [
      { label: 'سعر عادي', amount: 5000 },
      { label: 'نصف يوم', amount: 3000 },
      { label: 'سعر خاص', amount: 4500 },
      { label: 'موسم العطلات', amount: 6000 },
    ],
    suite: [
      { label: 'سعر عادي', amount: 12000 },
      { label: 'نصف يوم', amount: 8000 },
      { label: 'VIP', amount: 15000 },
      { label: 'موسم العطلات', amount: 18000 },
    ],
    vip: [
       { label: 'سعر عادي', amount: 20000 },
       { label: 'نصف يوم', amount: 12000 },
       { label: 'شامل الخدمات', amount: 25000 },
       { label: 'رجال أعمال', amount: 30000 },
    ]
  },
  pageTitles: {
      'dashboard': 'لوحة المعلومات العامة',
      'rooms': 'حالة الغرف',
      'bookings': 'إدارة الحجوزات',
      'invoices': 'الفواتير والتقارير',
      'messages': 'المركز المراسلات',
      'staff': 'إدارة الموظفين',
      'accounting': 'المحاسبة',
      'events': 'قاعات المناسبات',
      'pool': 'النادي والمسبح',
      'restaurant': 'المطعم والمقهى',
      'reports': 'التقارير والتحليلات',
      'operations': 'مركز العمليات والتشغيل',
      'services': 'مدير الخدمات الرقمية',
      'security': 'بوابة التواصل الأمني',
      'print_settings': 'استوديو الطباعة',
      'pricing': 'دليل الأسعار والخدمات',
      'desktop': 'مكتب الاستقبال الذكي'
  },
  activeDepartments: ['administration', 'reception', 'housekeeping', 'food_beverage', 'maintenance'],
  salaryDate: '28',
  marketingConfig: {
      siteUrl: 'https://authentic-zellij.com',
      promoTitle: 'استمتع بتجربة فاخرة في فندق الجزائر',
      promoDescription: 'اكتشف خدماتنا الحصرية واحجز إقامتك القادمة بأفضل الأسعار في قلب العاصمة.',
      buttonText: 'زيارة الموقع الرسمي'
  },
  printConfig: {
      defaultWeddingTemplate: 'royal_andalus',
      defaultMeetingTemplate: 'modern_corporate',
      defaultTicketTemplate: 'classic_ticket',
      defaultRegistrationTemplate: 'classic',
      customFooterText: 'نتشرف بحضوركم',
      showQrCode: true
  },
  standardRates: {
      poolAccess: 2000,
      poolVipAccess: 5000,
      hallBasePrice: 50000,
      hallWeekendSurcharge: 10000,
      breakfastPrice: 800,
      lateArrivalFine: 500,
      parkingVIP: 1000,
      gardenPicnic: 3500,
      kioskSouvenir: 2500,
      visitorPoolAccess: 3000
  },
  hotelIdentity: {
      openingDate: '2020-01-01',
      stars: 4,
      classificationType: 'Business',
      crNumber: '16/00-8742912',
      managerName: 'السيد المدير العام',
      bio: 'فندق عريق يجمع بين الأصالة والحداثة في قلب المدينة، يقدم خدمات فندقية راقية لرجال الأعمال والعائلات.',
      globalRank: '#1',
      website: 'www.authentic-zellij.com',
      email: 'info@authentic-zellij.com'
  },
  systemIntegrations: {
      guestWifiSsid: 'Authentic_Guest_Free',
      guestWifiPass: 'Welcome2024',
      staffWifiSsid: 'Authentic_Staff_Secure',
      bookingEngineUrl: 'https://admin.booking.com',
      otaManagerUrl: 'https://expedia.com/partner',
      kitchenKdsUrl: 'http://192.168.1.100:3000',
      localServerIp: '192.168.1.50',
      housekeepingPortalUrl: 'http://housekeeping.local',
      printerIp: '192.168.1.200',
      kioskMode: false,
      policePortalUrl: 'https://police.dz/hotels',
      tourismPortalUrl: 'https://mta.gov.dz'
  },
  digitizationEnabled: true,
  defaultNationality: 'الجزائرية',
  roomConfig: {
      startingNumber: 101,
      prefix: '',
      floorCount: 3,
      roomsPerFloor: 10
  },
  buildings: [
      { id: 'b1', name: 'المبنى الرئيسي', address: 'شارع الاستقلال 01', roomCount: 22, isActive: true }
  ],
  partners: [],
  desktopConfig: INITIAL_DESKTOP_CONFIG,
  customPrintTemplates: DEFAULT_PRINT_TEMPLATES,
  serviceAvailability: {
    pool: true,
    poolVip: true,
    hall: true,
    parkingVIP: true,
    gardenPicnic: true,
    kioskSouvenir: true,
    roomBooking: true,
  }
};

export const isZelligeTheme = (theme: string) => {
  return theme.startsWith('zellige');
};

export const CHAT_GROUPS = {
  GENERAL: 'GROUP_GENERAL',
  MANAGEMENT: 'GROUP_MANAGEMENT',
  RECEPTION: 'GROUP_RECEPTION',
  OPERATIONS: 'GROUP_OPERATIONS',
};

export const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'المدير العام', 
    role: 'manager', 
    department: 'administration',
    isHeadOfDepartment: true,
    salary: 250000,
    joinDate: '2020-01-01',
    avatar: 'https://picsum.photos/100/100?random=1',
    isBlocked: false,
    permissions: MANAGER_PERMISSIONS,
    phone: '0550123456',
    email: 'manager@authentic-zellij.com',
    status: 'active',
    code: 'ADM-001',
    rank: 'Executive',
    crewId: 'CREW-001'
  },
  { 
    id: 'u2', 
    name: 'أحمد (استقبال)', 
    role: 'receptionist', 
    department: 'reception',
    isHeadOfDepartment: true,
    salary: 60000,
    joinDate: '2021-05-12',
    avatar: 'https://picsum.photos/100/100?random=2',
    isBlocked: false,
    permissions: RECEPTIONIST_PERMISSIONS,
    phone: '0550987654',
    email: 'reception@authentic-zellij.com',
    status: 'active',
    code: 'REC-001',
    rank: 'Senior',
    crewId: 'CREW-002'
  },
];

export const generateRooms = (count: number): Room[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    number: `${i + 1}`,
    type: i < 15 ? 'single' : i < 20 ? 'double' : 'suite',
    status: 'available',
    price: 100 + (i % 3) * 50,
  }));
};

export const DEFAULT_MENU: MenuItem[] = [
    { id: 'hd1', name: 'قهوة اسبريسو', category: 'hot_drink', price: 150, isAvailable: true, description: 'حبوب أرابيكا فاخرة' },
    { id: 'hd2', name: 'كابتشينو', category: 'hot_drink', price: 250, isAvailable: true, description: 'رغوة حليب كثيفة' },
    { id: 'hd3', name: 'شاي بالنعناع', category: 'hot_drink', price: 200, isAvailable: true, description: 'إبريق صغير' },
    { id: 'hd4', name: 'لاتيه كراميل', category: 'hot_drink', price: 300, isAvailable: true, description: 'نكهة الكراميل المملح' },
    { id: 'hd5', name: 'شوكولاتة ساخنة', category: 'hot_drink', price: 350, isAvailable: true, description: 'مع الكريمة' },
    { id: 'cd1', name: 'ماء معدني (صغير)', category: 'cold_drink', price: 50, isAvailable: true },
    { id: 'cd2', name: 'ماء معدني (كبير)', category: 'cold_drink', price: 100, isAvailable: true },
    { id: 'cd3', name: 'مشروب غازي', category: 'cold_drink', price: 150, isAvailable: true, description: 'كوكا، فانتا، سبرايت' },
    { id: 'cd4', name: 'عصير برتقال طازج', category: 'cold_drink', price: 400, isAvailable: true },
    { id: 'cd5', name: 'موهيتو كلاسيك', category: 'cold_drink', price: 350, isAvailable: true, description: 'ليمون ونعناع' },
    { id: 'cd6', name: 'ميلك شيك فانيليا', category: 'cold_drink', price: 450, isAvailable: true },
    { id: 'cd7', name: 'ليمونادة', category: 'cold_drink', price: 300, isAvailable: true },
    { id: 'ds1', name: 'تشيز كيك', category: 'dessert', price: 600, isAvailable: true, description: 'توت أزرق أو فراولة' },
    { id: 'ds2', name: 'تيراميسو', category: 'dessert', price: 550, isAvailable: true, description: 'على الطريقة الإيطالية' },
    { id: 'ds3', name: 'سلطة فواكه', category: 'dessert', price: 450, isAvailable: true, description: 'فواكه موسمية طازجة' },
    { id: 'ds4', name: 'كريب نوتيلا', category: 'dessert', price: 400, isAvailable: true },
    { id: 'ds5', name: 'أيس كريم (3 كرات)', category: 'dessert', price: 350, isAvailable: true },
    { id: 'bk1', name: 'فطور صباحي كامل', category: 'breakfast', price: 1200, isAvailable: true, description: 'بيض، أجبان، مربى، كرواسون، مشروب' },
    { id: 'bk2', name: 'أومليت خضار', category: 'breakfast', price: 500, isAvailable: true },
    { id: 'bk3', name: 'بان كيك بالعسل', category: 'breakfast', price: 450, isAvailable: true },
    { id: 'ml1', name: 'شريحة لحم مشوي (Entrecôte)', category: 'meal', price: 2500, isAvailable: true, description: 'مع بطاطا وخضار سوتيه' },
    { id: 'ml2', name: 'دجاج محمر', category: 'meal', price: 1200, isAvailable: true, description: 'نصف دجاجة مع أرز' },
    { id: 'ml3', name: 'سلطة سيزر', category: 'meal', price: 800, isAvailable: true, description: 'دجاج مشوي، خس، جبن بارميزان' },
    { id: 'ml4', name: 'شوربة اليوم', category: 'meal', price: 400, isAvailable: true },
    { id: 'ml5', name: 'كلوب ساندويتش', category: 'meal', price: 600, isAvailable: true, description: 'وجبة خفيفة (مناسب للمقهى)' },
    { id: 'ml6', name: 'برجر كلاسيك', category: 'meal', price: 700, isAvailable: true, description: 'مع بطاطا مقلية' },
    { id: 'ml7', name: 'بيتزا مارجريتا', category: 'meal', price: 600, isAvailable: true },
    { id: 'ml8', name: 'طاجين زيتون', category: 'meal', price: 1400, isAvailable: true, description: 'طبق تقليدي' },
];

export const INITIAL_SERVICES: ServiceItem[] = [
    { id: 'srv1', icon: 'Bell', labelAr: 'تنظيف الغرفة', labelEn: 'Room Cleaning', description: 'طلب تنظيف فوري للغرفة وتغيير المناشف', targetDepartment: 'housekeeping', isActive: true, allowedLocations: ['room', 'suite', 'vip'], price: 0 },
    { id: 'srv2', icon: 'Coffee', labelAr: 'مشروبات', labelEn: 'Beverages', description: 'قهوة، شاي، أو مياه معدنية باردة', targetDepartment: 'food_beverage', isActive: true, allowedLocations: ['all'], price: 0 },
    { id: 'srv3', icon: 'Car', labelAr: 'طلب تاكسي', labelEn: 'Taxi Request', description: 'حجز سيارة أجرة للتنقل داخل المدينة', targetDepartment: 'reception', isActive: true, allowedLocations: ['all'], price: 500 },
    { id: 'srv4', icon: 'Shirt', labelAr: 'مكواة ملابس', labelEn: 'Ironing', description: 'طلب طاولة ومكواة بخارية للغرفة', targetDepartment: 'housekeeping', isActive: true, allowedLocations: ['room', 'suite'], price: 0 },
    { id: 'srv5', icon: 'Plane', labelAr: 'نقل للمطار', labelEn: 'Airport Transfer', description: 'خدمة نقل مريحة من وإلى مطار هواري بومدين الدولي', targetDepartment: 'reception', isActive: true, allowedLocations: ['all'], price: 2500 },
    { id: 'srv6', icon: 'Map', labelAr: 'جولة سياحية', labelEn: 'City Tour', description: 'جولة سياحية منظمة لاكتشاف معالم القصبة ومقام الشهيد', targetDepartment: 'reception', isActive: true, allowedLocations: ['all'], price: 4000 },
    { id: 'srv7', icon: 'Sparkles', labelAr: 'جلسة سبا', labelEn: 'Spa Session', description: 'حجز جلسة تدليك أو حمام مغربي تقليدي', targetDepartment: 'food_beverage', isActive: true, allowedLocations: ['all'], price: 6000 },
    { id: 'srv8', icon: 'Crown', labelAr: 'خدمة كبار الشخصيات', labelEn: 'VIP Service', description: 'مرافقة خاصة وخدمات حصرية لعملاء VIP', targetDepartment: 'reception', isActive: true, allowedLocations: ['all'], price: 10000 },
    { id: 'srv9', icon: 'Utensils', labelAr: 'حجز قاعة خاصة', labelEn: 'Private Hall Booking', description: 'حجز قاعة خاصة لتناول الطعام أو الاجتماعات المصغرة', targetDepartment: 'food_beverage', isActive: true, allowedLocations: ['all'], price: 15000 },
    { id: 'srv_dnd', icon: 'Moon', labelAr: 'عدم الإزعاج', labelEn: 'Do Not Disturb', description: 'تفعيل وضع عدم الإزعاج للغرفة', targetDepartment: 'housekeeping', isActive: true, allowedLocations: ['room', 'suite'], price: 0 },
    { id: 'srv_waiter', icon: 'User', labelAr: 'استدعاء نادل', labelEn: 'Call Waiter', description: 'طلب حضور نادل للطاولة', targetDepartment: 'food_beverage', isActive: true, allowedLocations: ['restaurant_table', 'cafe_table'], price: 0 },
    { id: 'srv_bill', icon: 'DollarSign', labelAr: 'طلب الفاتورة', labelEn: 'Request Bill', description: 'طلب فاتورة الحساب', targetDepartment: 'food_beverage', isActive: true, allowedLocations: ['restaurant_table', 'cafe_table'], price: 0 },
    { id: 'srv_attendant', icon: 'User', labelAr: 'مشرف المسبح', labelEn: 'Pool Attendant', description: 'طلب مساعدة من مشرف المسبح', targetDepartment: 'reception', isActive: true, allowedLocations: ['pool_chair'], price: 0 },
    { id: 'srv_tech', icon: 'Zap', labelAr: 'دعم فني', labelEn: 'Tech Support', description: 'طلب دعم فني للقاعات أو الغرف', targetDepartment: 'reception', isActive: true, allowedLocations: ['all'], price: 0 },
];

export const INITIAL_INVENTORY: any[] = [
    { id: 'inv1', name: 'صابون سائل', quantity: 50, unit: 'لتر', minThreshold: 10, category: 'cleaning', lastUpdated: '2023-01-01' },
    { id: 'inv2', name: 'مناشف حمام', quantity: 200, unit: 'قطعة', minThreshold: 50, category: 'amenities', lastUpdated: '2023-01-01' },
    { id: 'inv3', name: 'قهوة حبوب', quantity: 20, unit: 'كغ', minThreshold: 5, category: 'food', lastUpdated: '2023-01-01' },
];

export const INITIAL_TABLES: any[] = [
    // Restaurant Tables (R)
    { id: 'R1', number: 'R1', capacity: 4, status: 'available', zone: 'main_hall', location: 'restaurant' },
    { id: 'R2', number: 'R2', capacity: 2, status: 'occupied', zone: 'main_hall', location: 'restaurant' },
    { id: 'R3', number: 'R3', capacity: 6, status: 'reserved', zone: 'vip_corner', location: 'restaurant' },
    { id: 'R4', number: 'R4', capacity: 4, status: 'available', zone: 'terrace', location: 'restaurant' },
    { id: 'R5', number: 'R5', capacity: 2, status: 'cleaning', zone: 'main_hall', location: 'restaurant' },
    { id: 'R6', number: 'R6', capacity: 8, status: 'available', zone: 'vip_corner', location: 'restaurant' },
    
    // Cafe Tables (C)
    { id: 'C1', number: 'C1', capacity: 2, status: 'available', zone: 'garden', location: 'cafe' },
    { id: 'C2', number: 'C2', capacity: 4, status: 'occupied', zone: 'main_hall', location: 'cafe' },
    { id: 'C3', number: 'C3', capacity: 2, status: 'available', zone: 'terrace', location: 'cafe' },
    { id: 'C4', number: 'C4', capacity: 3, status: 'available', zone: 'garden', location: 'cafe' },
    { id: 'C5', number: 'C5', capacity: 2, status: 'cleaning', zone: 'main_hall', location: 'cafe' },
];

export const INITIAL_PARKING_SPOTS: ParkingSpot[] = [
    { id: 'p1', number: 'A-01', type: 'shaded', status: 'available', pricePerHour: 200, pricePerDay: 1500, services: ['cleaning'] },
    { id: 'p2', number: 'A-02', type: 'shaded', status: 'occupied', pricePerHour: 200, pricePerDay: 1500, services: [] },
    { id: 'p3', number: 'B-01', type: 'unshaded', status: 'available', pricePerHour: 100, pricePerDay: 800, services: [] },
    { id: 'p4', number: 'V-01', type: 'vip', status: 'reserved', pricePerHour: 500, pricePerDay: 3000, services: ['valet', 'cleaning'] },
];

export const INITIAL_LEGAL_RULES: LegalRule[] = [
    { id: 'lr1', title: 'سياسة التدخين', content: 'يمنع التدخين في جميع الغرف والممرات الداخلية. يسمح به فقط في المناطق المخصصة.', category: 'hotel_policy', isActive: true },
    { id: 'lr2', title: 'استخدام المسبح', content: 'يجب ارتداء ملابس السباحة المناسبة. يمنع القفز في المناطق الضحلة.', category: 'facility_rule', isActive: true },
    { id: 'lr3', title: 'إخلاء المسؤولية', content: 'الفندق غير مسؤول عن فقدان الأشياء الثمينة غير المودعة في الخزنة.', category: 'legal_advice', isActive: true },
];

export const INITIAL_PUBLIC_SERVICES: PublicService[] = [
    { id: 'ps1', title: 'المطعم الأندلسي المستقل', description: 'مطعم فاخر بقاعة خاصة مستقلة، يقدم أشهى الأطباق التقليدية والعالمية.', iconName: 'Utensils', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800', color: 'text-orange-600', category: 'dining', isActive: true },
    { id: 'ps2', title: 'مقهى القصبة المستقل', description: 'مقهى بقاعة خاصة مستقلة، مثالي للاسترخاء والاستمتاع بالحلويات التقليدية.', iconName: 'Coffee', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800', color: 'text-emerald-600', category: 'dining', isActive: true },
    { id: 'ps3', title: 'المسبح والمركز الترفيهي', description: 'مسبح بانورامي وقاعة متعددة الخدمات للرياضة والاستجمام.', iconName: 'Waves', image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800', color: 'text-cyan-600', category: 'wellness', isActive: true },
    { id: 'ps4', title: 'الأجنحة والقاعات VIP', description: 'خدمات حصرية في قاعات وأجنحة VIP مجهزة بأعلى معايير الرفاهية.', iconName: 'Crown', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800', color: 'text-yellow-600', category: 'business', isActive: true },
    { id: 'ps5', title: 'الحديقة والأكشاك', description: 'مساحات خضراء واسعة مع أكشاك لتقديم الوجبات الخفيفة والمشروبات.', iconName: 'Flower2', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800', color: 'text-green-600', category: 'other', isActive: true },
    { id: 'ps6', title: 'خدمة الغرف الذكية', description: 'اطلب ما تشاء من قائمة الطعام والخدمات إلى غرفتك مباشرة (للنزلاء فقط).', iconName: 'Bell', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800', color: 'text-red-600', category: 'other', isActive: true },
];

export const INITIAL_FACILITIES: Facility[] = [
    { id: 'fac1', title: 'المطعم المستقل (قاعة خاصة)', description: 'قاعة طعام فاخرة ومستقلة توفر الخصوصية التامة للنزلاء والزوار.', iconName: 'Utensils', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800', color: 'bg-orange-50 text-orange-600', isActive: true },
    { id: 'fac2', title: 'المقهى المستقل (قاعة خاصة)', description: 'أجواء هادئة في قاعة مستقلة للاستمتاع بأفضل أنواع القهوة والحلويات.', iconName: 'Coffee', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800', color: 'bg-emerald-50 text-emerald-600', isActive: true },
    { id: 'fac3', title: 'المسبح والقاعة المتعددة', description: 'مرفق متكامل يضم مسبحاً وقاعة متعددة الخدمات للنشاطات المختلفة.', iconName: 'Waves', image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800', color: 'bg-cyan-50 text-cyan-600', isActive: true },
    { id: 'fac4', title: 'قاعات وأجنحة VIP', description: 'مساحات حصرية مخصصة لكبار الشخصيات ورجال الأعمال.', iconName: 'Crown', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800', color: 'bg-yellow-50 text-yellow-600', isActive: true },
    { id: 'fac5', title: 'الحديقة والأكشاك الخارجية', description: 'استمتع بالهواء الطلق في حديقتنا الواسعة مع خدمات الأكشاك المتنوعة.', iconName: 'Flower2', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800', color: 'bg-green-50 text-green-600', isActive: true },
    { id: 'fac6', title: 'مركز السبا الملكي', description: 'حمام مغربي تقليدي وجلسات تدليك احترافية.', iconName: 'Sparkles', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800', color: 'bg-purple-50 text-purple-600', isActive: true },
];

export const INITIAL_HOTEL_EVENTS: HotelEvent[] = [
    { id: 'evt1', title: 'أمسية الجاز', date: 'الخميس، 8 مساءً', description: 'استمتع بأجمل مقطوعات الجاز مع فرقة موسيقية حية.', image: 'https://images.unsplash.com/photo-1514525253440-b393452e3383?auto=format&fit=crop&w=800', category: 'music', isActive: true, totalSeats: 50, availableSeats: 12, price: 2500 },
    { id: 'evt2', title: 'بوفيه المأكولات البحرية', date: 'الجمعة، 1 ظهراً', description: 'تشكيلة واسعة من الأسماك والمأكولات البحرية الطازجة.', image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800', category: 'food', isActive: true, totalSeats: 100, availableSeats: 45, price: 4500 },
    { id: 'evt3', title: 'حفلة العشاء الأندلسي', date: 'السبت، 9 مساءً', description: 'تجربة عشاء ملكية مع عروض فلكلورية أندلسية.', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800', category: 'culture', isActive: true, totalSeats: 80, availableSeats: 20, price: 6000 },
];
