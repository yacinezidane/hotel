
import { 
    User, Room, Booking, Invoice, Transaction, Notification, MenuItem, 
    RestaurantOrder, QRRecord, AppSettings, GuestInfo, HallBooking, 
    PoolPass, MaintenanceTicket, ServiceItem, ServiceRequest, 
    SecurityLog, LeaveRequest, StaffRequest, AttendanceRecord, 
    IncidentReport, ExternalOrder, CoordinationNote, Table,
    Role, Department, RoomType, GuestLocationStatus, ChatSession, Message as ChatMessage
} from '../types';
import { 
    MANAGER_PERMISSIONS, ASSISTANT_MANAGER_PERMISSIONS, 
    RECEPTIONIST_PERMISSIONS, FB_MANAGER_PERMISSIONS, STAFF_PERMISSIONS,
    DEFAULT_MENU
} from '../constants';

// --- HELPERS ---
const randomId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// --- GENERATORS ---

export const generateMockUsers = (): User[] => {
    const departments: Department[] = ['administration', 'reception', 'guest_services', 'housekeeping', 'food_beverage', 'maintenance', 'security', 'hr', 'finance', 'sales_marketing', 'it', 'spa_wellness'];
    const roles: Record<Department, Role[]> = {
        administration: ['manager', 'assistant_manager'],
        reception: ['reception_manager', 'receptionist'],
        guest_services: ['concierge', 'bellboy', 'driver'],
        housekeeping: ['housekeeping_manager', 'housekeeping_staff'],
        food_beverage: ['restaurant_manager', 'head_chef', 'chef', 'waiter', 'cafe_manager', 'barista'],
        maintenance: ['maintenance_manager', 'maintenance_staff'],
        security: ['security_manager', 'security_guard'],
        hr: ['hr_manager'],
        finance: ['accountant'],
        sales_marketing: ['marketing_specialist'],
        it: ['it_specialist'],
        spa_wellness: ['staff'],
        transport: ['driver'],
        room_service: ['waiter'],
        management: ['manager'],
        restaurant: ['waiter']
    };

    const users: User[] = [];
    let idCounter = 1;

    // 1. Executive Team (Fixed)
    users.push({ 
        id: 'u1', code: 'ADM-001', name: 'محمد المدير', role: 'manager', rank: 'Executive', department: 'administration', isHeadOfDepartment: true, 
        salary: 250000, joinDate: '2020-01-01', avatar: 'https://ui-avatars.com/api/?name=Mohamed+Manager&background=0D8ABC&color=fff', 
        isBlocked: false, permissions: MANAGER_PERMISSIONS, phone: '0550111111', email: 'manager@hotel.com', jobTitle: 'المدير العام',
        accessCode: '1234', status: 'active'
    });

    // 2. Generate remaining ~99 staff
    const firstNames = ['أحمد', 'محمد', 'علي', 'عمر', 'يوسف', 'إبراهيم', 'خالد', 'سعيد', 'حسن', 'حسين', 'فاطمة', 'عائشة', 'مريم', 'سارة', 'ليلى', 'نادية', 'سميرة', 'جميلة', 'هدى', 'زينب'];
    const lastNames = ['المنصور', 'العمري', 'سعيد', 'بن علي', 'تواتي', 'حداد', 'بوقرة', 'سليماني', 'مزيان', 'بن يحيى', 'شريف', 'موساوي', 'بلحاج', 'قاسم', 'دحمان', 'زروقي', 'بوخالفة', 'حميدي', 'طالب', 'سعدي'];

    departments.forEach(dept => {
        const deptRoles = roles[dept];
        // Assign a head
        const headRole = deptRoles[0];
        const headName = `${randomItem(firstNames)} ${randomItem(lastNames)}`;
        idCounter++;
        users.push({
            id: `u${idCounter}`,
            code: `${dept.substring(0, 3).toUpperCase()}-${String(idCounter).padStart(3, '0')}`,
            name: headName,
            role: headRole,
            rank: 'Senior',
            department: dept,
            isHeadOfDepartment: true,
            salary: randomInt(60000, 120000),
            joinDate: randomDate(new Date(2020, 0, 1), new Date()),
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(headName)}&background=random`,
            isBlocked: false,
            permissions: dept === 'reception' ? RECEPTIONIST_PERMISSIONS : dept === 'food_beverage' ? FB_MANAGER_PERMISSIONS : STAFF_PERMISSIONS,
            phone: `0550${String(idCounter).padStart(6, '0')}`,
            email: `${headRole}.${idCounter}@hotel.com`,
            jobTitle: `مدير ${dept}`,
            status: 'active'
        });

        // Assign staff
        const staffCount = dept === 'housekeeping' || dept === 'food_beverage' ? 15 : 5;
        for (let i = 0; i < staffCount; i++) {
            idCounter++;
            const role = deptRoles[deptRoles.length > 1 ? randomInt(1, deptRoles.length - 1) : 0];
            const name = `${randomItem(firstNames)} ${randomItem(lastNames)}`;
            users.push({
                id: `u${idCounter}`,
                code: `${dept.substring(0, 3).toUpperCase()}-${String(idCounter).padStart(3, '0')}`,
                name: name,
                role: role,
                rank: i < 2 ? 'Senior' : i < 5 ? 'Junior' : 'Intern',
                department: dept,
                isHeadOfDepartment: false,
                salary: randomInt(30000, 55000),
                joinDate: randomDate(new Date(2021, 0, 1), new Date()),
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
                isBlocked: false,
                permissions: STAFF_PERMISSIONS,
                phone: `0550${String(idCounter).padStart(6, '0')}`,
                email: `${role}.${idCounter}@hotel.com`,
                jobTitle: role,
                status: 'active'
            });
        }
    });

    return users;
};

export const generateMockActivities = (): any[] => {
    return [
        {
            id: 'act1', title: 'سهرة أندلسية', description: 'استمتع بأجمل الموشحات الأندلسية مع فرقة التراث',
            type: 'culture', location: 'الحديقة الرئيسية', startTime: '20:00', endTime: '23:00',
            days: ['Thursday', 'Friday'], isPaid: true, price: 2000, image: 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&q=80&w=800'
        },
        {
            id: 'act2', title: 'يوغا الصباح', description: 'جلسة استرخاء وتأمل لبدء يومك بنشاط',
            type: 'wellness', location: 'تراس المسبح', startTime: '07:00', endTime: '08:00',
            days: ['Daily'], isPaid: false, image: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&q=80&w=800'
        },
        {
            id: 'act3', title: 'نادي الأطفال', description: 'ألعاب وأنشطة ترفيهية للأطفال بإشراف مختصين',
            type: 'kids', location: 'قاعة الألعاب', startTime: '10:00', endTime: '16:00',
            days: ['Daily'], isPaid: true, price: 1000, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800'
        },
        {
            id: 'act4', title: 'دورة الطبخ الجزائري', description: 'تعلم أسرار المطبخ الجزائري مع الشيف كريم',
            type: 'culture', location: 'المطبخ التعليمي', startTime: '15:00', endTime: '17:00',
            days: ['Tuesday', 'Saturday'], isPaid: true, price: 3000, image: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=800'
        }
    ];
};

export const generateMockGuests = (): GuestInfo[] => [
    {
        idType: 'national_id', idNumber: '111111111', firstNameAr: 'علي', lastNameAr: 'بن محمد', 
        firstNameEn: 'Ali', lastNameEn: 'Ben Mohamed', birthDate: '1985-05-15', birthPlace: 'Algiers', 
        fatherName: 'Mohamed', motherName: 'Fatima', checkInStatus: 'checked_in'
    },
    {
        idType: 'passport', idNumber: 'P12345678', firstNameAr: 'جون', lastNameAr: 'سميث', 
        firstNameEn: 'John', lastNameEn: 'Smith', birthDate: '1990-10-20', birthPlace: 'London', 
        fatherName: 'David', motherName: 'Mary', checkInStatus: 'checked_out'
    },
    {
        idType: 'national_id', idNumber: '222222222', firstNameAr: 'سعاد', lastNameAr: 'العمري', 
        firstNameEn: 'Souad', lastNameEn: 'Amri', birthDate: '1995-03-10', birthPlace: 'Oran', 
        fatherName: 'Ahmed', motherName: 'Zohra', checkInStatus: 'pending_arrival'
    },
    {
        idType: 'national_id', idNumber: '333333333', firstNameAr: 'كريم', lastNameAr: 'بوزيد', 
        firstNameEn: 'Karim', lastNameEn: 'Bouzid', birthDate: '1988-12-05', birthPlace: 'Constantine', 
        fatherName: 'Omar', motherName: 'Samia', checkInStatus: 'checked_in'
    },
    {
        idType: 'passport', idNumber: 'P87654321', firstNameAr: 'ماريا', lastNameAr: 'غارسيا', 
        firstNameEn: 'Maria', lastNameEn: 'Garcia', birthDate: '1992-07-25', birthPlace: 'Madrid', 
        fatherName: 'Jose', motherName: 'Elena', checkInStatus: 'checked_in'
    }
];

export const generateMockRooms = (count: number): Room[] => {
    return Array.from({ length: count }, (_, i) => {
        const type: RoomType = i < 10 ? 'single' : i < 16 ? 'double' : i < 20 ? 'suite' : 'vip';
        
        // Force some rooms to be occupied for demo
        let status: any = 'available';
        if (i === 0 || i === 2 || i === 5) status = 'occupied';
        else if (i === 1 || i === 3) status = 'booked';
        else if (i === 4) status = 'dirty';
        else if (i === 6) status = 'maintenance';
        
        const priceMap = { single: 3000, double: 5000, suite: 12000, vip: 20000 };
        
        return {
            id: i + 1,
            number: `${100 + i + 1}`,
            type,
            status,
            price: priceMap[type],
            currentGuestLocation: status === 'occupied' ? (Math.random() > 0.7 ? 'out_of_hotel' : 'in_hotel') : undefined
        };
    });
};

export const generateMockBookings = (rooms: Room[], guests: GuestInfo[]): Booking[] => {
    const bookings: Booking[] = [];
    const occupiedRooms = rooms.filter(r => r.status === 'occupied');
    const bookedRooms = rooms.filter(r => r.status === 'booked');
    
    // Active Bookings
    occupiedRooms.forEach((room, index) => {
        const guest = guests[index % guests.length];
        // Make the first active booking have a predictable token for testing
        const token = index === 0 ? 'GUEST-101' : randomId('tkn');
        
        bookings.push({
            id: randomId('bkg'),
            guests: [guest],
            primaryGuestName: `${guest.firstNameAr} ${guest.lastNameAr}`,
            roomId: room.id,
            checkInDate: new Date().toISOString(),
            checkOutDate: new Date(Date.now() + 86400000 * 2).toISOString(),
            status: 'active',
            totalAmount: room.price * 2,
            guestToken: token,
            mealPlan: randomItem(['breakfast', 'half_board', 'room_only']),
            extraServices: [],
            guestLocation: 'in_hotel',
            notes: 'يحتاج سرير إضافي'
        });
    });

    // Pending Bookings
    bookedRooms.forEach((room, index) => {
        const guest = guests[(index + 2) % guests.length];
        bookings.push({
            id: randomId('bkg'),
            guests: [guest],
            primaryGuestName: `${guest.firstNameAr} ${guest.lastNameAr}`,
            roomId: room.id,
            checkInDate: new Date(Date.now() + 86400000).toISOString(),
            checkOutDate: new Date(Date.now() + 86400000 * 3).toISOString(),
            status: 'pending',
            totalAmount: room.price * 2,
            guestToken: randomId('tkn'),
            mealPlan: 'room_only',
            extraServices: [],
            guestLocation: 'out_of_hotel'
        });
    });

    // Completed Bookings (History)
    for (let i = 0; i < 5; i++) {
        const guest = randomItem(guests);
        const room = randomItem(rooms);
        bookings.push({
            id: randomId('bkg-old'),
            guests: [guest],
            primaryGuestName: `${guest.firstNameAr} ${guest.lastNameAr}`,
            roomId: room.id,
            checkInDate: new Date(Date.now() - 86400000 * 10).toISOString(),
            checkOutDate: new Date(Date.now() - 86400000 * 8).toISOString(),
            status: 'completed',
            totalAmount: room.price * 2,
            guestToken: randomId('tkn'),
            mealPlan: 'breakfast',
            extraServices: [],
            guestLocation: 'out_of_hotel'
        });
    }

    return bookings;
};

export const generateMockTransactions = (users: User[]): Transaction[] => {
    const transactions: Transaction[] = [];
    const categories: any[] = ['booking', 'restaurant', 'cafe', 'service', 'maintenance', 'salary'];
    
    for (let i = 0; i < 20; i++) {
        const type = Math.random() > 0.3 ? 'income' : 'expense';
        const amount = type === 'income' ? randomInt(1000, 50000) : randomInt(500, 10000);
        const user = randomItem(users);
        
        transactions.push({
            id: randomId('tx'),
            amount,
            type,
            category: randomItem(categories),
            description: type === 'income' ? 'دفع حجز / خدمة' : 'شراء مستلزمات / صيانة',
            date: randomDate(new Date(Date.now() - 86400000 * 30), new Date()),
            userId: user.id,
            userName: user.name,
            paymentMethod: randomItem(['cash', 'card', 'transfer']),
        });
    }
    return transactions;
};

export const generateMockMaintenanceTickets = (rooms: Room[], users: User[]): MaintenanceTicket[] => {
    return [
        {
            id: randomId('tkt'), description: 'المكيف لا يعمل', priority: 'high', 
            status: 'open', reportedBy: users[1].name, createdAt: new Date().toISOString(),
            location: `Room ${rooms[0].number}`
        },
        {
            id: randomId('tkt'), description: 'تسرب مياه في الحمام', priority: 'critical', 
            status: 'in_progress', reportedBy: users[6].name, createdAt: new Date().toISOString(),
            location: `Room ${rooms[2].number}`
        },
        {
            id: randomId('tkt'), description: 'تغيير مصباح السرير', priority: 'low', 
            status: 'resolved', reportedBy: users[6].name, createdAt: new Date(Date.now() - 86400000).toISOString(), resolvedAt: new Date().toISOString(),
            location: `Room ${rooms[5].number}`
        }
    ];
};

export const generateMockNotifications = (users: User[]): Notification[] => [
    {
        id: randomId('notif'), message: 'تذكير: اجتماع الموظفين غداً', type: 'info', 
        userId: 'System', timestamp: new Date().toISOString(), hiddenFor: []
    },
    {
        id: randomId('notif'), message: 'نقص في مخزون القهوة', type: 'warning', 
        userId: 'System', timestamp: new Date().toISOString(), hiddenFor: [], targetDepartments: ['food_beverage']
    },
    {
        id: randomId('notif'), message: 'تم تسجيل دخول نزيل VIP', type: 'success', 
        userId: users[1].name, timestamp: new Date().toISOString(), hiddenFor: [], targetRoles: ['manager', 'reception_manager']
    }
];

export const generateMockHallBookings = (): HallBooking[] => [
    {
        id: randomId('hall'), clientName: 'شركة سوناطراك', eventType: 'conference', 
        startDate: new Date(Date.now() + 86400000 * 5).toISOString(), days: 2, guestCount: 50, price: 150000, 
        status: 'confirmed', layoutStyle: 'classroom', cateringType: 'buffet_lunch', paymentStatus: 'partial'
    },
    {
        id: randomId('hall'), clientName: 'عائلة بن يحيى', eventType: 'wedding', 
        startDate: new Date(Date.now() + 86400000 * 20).toISOString(), days: 1, guestCount: 200, price: 300000, 
        status: 'pending', layoutStyle: 'banquet', cateringType: 'gala_dinner', paymentStatus: 'unpaid'
    }
];

export const generateMockRestaurantOrders = (menuItems: MenuItem[]): RestaurantOrder[] => {
    const orders: RestaurantOrder[] = [];
    const activeMenu = menuItems.length > 0 ? menuItems : DEFAULT_MENU;

    // Room Service Orders (Linked to occupied rooms 101, 103, 106 which are IDs 1, 3, 6)
    // IDs are 1-based index from generateMockRooms
    
    // Order for Room 101
    orders.push({
        id: randomId('ord'),
        items: [{ item: activeMenu[0], quantity: 2 }, { item: activeMenu[17], quantity: 2 }], // Coffee + Breakfast
        totalAmount: (activeMenu[0].price * 2) + (activeMenu[17].price * 2),
        status: 'preparing',
        type: 'room_service',
        source: 'restaurant',
        targetNumber: '101',
        timestamp: new Date().toISOString(),
        roomId: 1
    });

    // Dine-in Orders
    for (let i = 0; i < 3; i++) {
        const items = [
            { item: randomItem(activeMenu), quantity: randomInt(1, 3) },
            { item: randomItem(activeMenu), quantity: randomInt(1, 2) }
        ];
        const total = items.reduce((sum, i) => sum + (i.item.price * i.quantity), 0);
        
        orders.push({
            id: randomId('ord'),
            items,
            totalAmount: total,
            status: randomItem(['pending', 'preparing', 'completed']),
            type: 'dine_in',
            source: 'restaurant',
            targetNumber: `Table ${randomInt(1, 10)}`,
            timestamp: new Date().toISOString(),
            tableId: `R${randomInt(1, 6)}`
        });
    }
    return orders;
};

export const generateMockPoolPasses = (): PoolPass[] => {
    return Array.from({ length: 5 }, (_, i) => ({
        id: randomId('pool'),
        holderName: `Guest ${i + 1}`,
        type: randomItem(['guest', 'vip', 'external']),
        accessZone: randomItem(['general', 'vip_lounge', 'family_area']),
        date: new Date().toISOString(),
        expiryTime: new Date(Date.now() + 3600000 * 4).toISOString(),
        price: 2000,
        isValid: true,
        qrCodeData: randomId('qr')
    }));
};

export const generateMockChatSessions = (users: User[]): ChatSession[] => {
    return Array.from({ length: 3 }, (_, i) => ({
        id: randomId('chat'),
        name: `Guest Room ${101 + i}`,
        lastMessage: 'Hello, I need help',
        unreadCount: i,
        isGuest: true,
        isMuted: false,
        roomNumber: `${101 + i}`
    }));
};

export const generateMockMessages = (sessions: ChatSession[]): ChatMessage[] => {
    const messages: ChatMessage[] = [];
    sessions.forEach(session => {
        messages.push({
            id: randomId('msg'),
            senderId: session.id,
            content: session.lastMessage,
            timestamp: new Date().toISOString(),
            isGuestMessage: true,
            guestName: session.name,
            roomNumber: session.roomNumber
        });
    });
    return messages;
};

export const generateMockServiceRequests = (): ServiceRequest[] => {
    return Array.from({ length: 4 }, (_, i) => ({
        id: randomId('srv-req'),
        serviceId: 'srv1',
        guestName: `Guest ${i + 1}`,
        locationType: 'room',
        locationId: `${101 + i}`,
        status: randomItem(['pending', 'processing', 'completed']),
        timestamp: new Date().toISOString(),
        notes: 'Please hurry'
    }));
};

export const generateMockExternalOrders = (): ExternalOrder[] => {
    return Array.from({ length: 3 }, (_, i) => ({
        id: randomId('ext'),
        type: randomItem(['food_delivery', 'transport']),
        customerName: `Customer ${i + 1}`,
        phone: '0555555555',
        address: 'Algiers Center',
        status: 'pending',
        totalAmount: 1500,
        timestamp: new Date().toISOString()
    }));
};

export const generateMockCoordinationNotes = (): CoordinationNote[] => {
    return [
        {
            id: randomId('note'),
            targetDepartments: ['housekeeping', 'reception'],
            content: 'VIP Guest arriving in Room 101',
            priority: 'high',
            createdBy: 'Manager',
            createdAt: new Date().toISOString(),
            isResolved: false
        }
    ];
};

export const generateMockIncidentReports = (): IncidentReport[] => {
    return [
        {
            id: randomId('inc'),
            type: 'property_damage',
            severity: 'medium',
            title: 'Broken Lamp',
            description: 'Lamp in lobby is broken',
            location: 'Lobby',
            reportedBy: 'Staff',
            reportedAt: new Date().toISOString(),
            status: 'reported',
            isFineApplied: false
        }
    ];
};

export const generateMockAttendance = (users: User[]): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    users.forEach(user => {
        // Today
        records.push({
            id: randomId('att'), userId: user.id, userName: user.name, date: new Date().toISOString().split('T')[0],
            checkInTime: new Date(new Date().setHours(8, 30, 0)).toISOString(), status: 'present', lateDurationMinutes: 0, deductionAmount: 0
        });
        // Yesterday
        records.push({
            id: randomId('att'), userId: user.id, userName: user.name, date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            checkInTime: new Date(Date.now() - 86400000).toISOString(), checkOutTime: new Date(Date.now() - 86400000 + 28800000).toISOString(),
            status: 'present', lateDurationMinutes: 0, deductionAmount: 0
        });
    });
    return records;
};

export const generateMockServicePoints = (): any[] => {
    return [
        {
            id: 'sp1',
            name: 'حديقة الواحة',
            description: 'منطقة استرخاء هادئة مع خدمة المشروبات',
            type: 'garden',
            status: 'active',
            location: { lat: 36.7525, lng: 3.0420, address: 'الحديقة الشمالية' },
            image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800',
            workingHours: '08:00 - 22:00'
        },
        {
            id: 'sp2',
            name: 'كشك المسبح',
            description: 'وجبات خفيفة ومشروبات منعشة بجانب المسبح',
            type: 'kiosk',
            status: 'active',
            location: { lat: 36.7528, lng: 3.0425, address: 'بجانب المسبح الرئيسي' },
            image: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&q=80&w=800',
            workingHours: '10:00 - 18:00'
        },
        {
            id: 'sp3',
            name: 'تراس الغروب',
            description: 'إطلالة بانورامية مع خدمة الشيشة والشاي',
            type: 'terrace',
            status: 'active',
            location: { lat: 36.7530, lng: 3.0415, address: 'الطابق العلوي' },
            image: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800',
            workingHours: '16:00 - 00:00'
        },
        {
            id: 'sp4',
            name: 'متجر الهدايا',
            description: 'تذكارات وهدايا تقليدية',
            type: 'store',
            status: 'closed',
            location: { lat: 36.7522, lng: 3.0418, address: 'المدخل الرئيسي' },
            image: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&q=80&w=800',
            workingHours: '09:00 - 20:00'
        }
    ];
};

export const generateMockDeliveryDrivers = (): any[] => {
    return [
        {
            id: 'drv1',
            name: 'أحمد سائق',
            phone: '0550123456',
            status: 'available',
            vehicleType: 'motorcycle',
            currentLocation: { lat: 36.7525, lng: 3.0420 },
            averageRating: 4.8,
            totalDeliveries: 150,
            isExternal: false
        },
        {
            id: 'drv2',
            name: 'سليم سريع',
            phone: '0550654321',
            status: 'busy',
            vehicleType: 'bike',
            currentLocation: { lat: 36.7530, lng: 3.0430 },
            averageRating: 4.5,
            totalDeliveries: 89,
            isExternal: false
        },
        {
            id: 'drv3',
            name: 'كمال موصل',
            phone: '0550987654',
            status: 'offline',
            vehicleType: 'car',
            currentLocation: { lat: 36.7510, lng: 3.0410 },
            averageRating: 4.9,
            totalDeliveries: 320,
            isExternal: false
        }
    ];
};
