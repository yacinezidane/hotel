import { 
    User, Room, Booking, Invoice, Transaction, Notification, MenuItem, 
    RestaurantOrder, QRRecord, AppSettings, GuestInfo, HallBooking, 
    PoolPass, MaintenanceTicket, ServiceItem, ServiceRequest, 
    SecurityLog, LeaveRequest, StaffRequest, AttendanceRecord, 
    IncidentReport, ExternalOrder, CoordinationNote, Table,
    Role, Department, RoomType, GuestLocationStatus, ChatSession, Message as ChatMessage,
    JobOpening, JobApplication, Reservation, PrintTemplate, DesktopConfig, ResourceBooking, 
    BookableUnit, PublicService, Facility, HotelEvent, ServiceFeedback, HotelActivity, 
    GuestRegistrationForm, Partner, DeliveryDriver, ServicePoint, ParkingSpot, LegalRule
} from '../types';
import { 
    MANAGER_PERMISSIONS, RECEPTIONIST_PERMISSIONS, STAFF_PERMISSIONS,
    DEFAULT_MENU, INITIAL_SERVICES, INITIAL_INVENTORY, INITIAL_TABLES, 
    INITIAL_PARKING_SPOTS, INITIAL_LEGAL_RULES, INITIAL_PUBLIC_SERVICES, 
    INITIAL_FACILITIES, INITIAL_HOTEL_EVENTS 
} from '../constants';
import { 
    generateMockUsers, generateMockRooms, generateMockGuests, 
    generateMockBookings, generateMockTransactions, generateMockMaintenanceTickets, 
    generateMockNotifications, generateMockHallBookings, generateMockRestaurantOrders, 
    generateMockAttendance, generateMockPoolPasses, generateMockChatSessions, 
    generateMockMessages, generateMockServiceRequests, generateMockExternalOrders, 
    generateMockCoordinationNotes, generateMockIncidentReports,
    generateMockServicePoints, generateMockDeliveryDrivers, generateMockActivities
} from './populateData';

export const DEMO_TOKENS = {
    GUEST_VIP: 'VIP-777',
    GUEST_STANDARD: 'GUEST-101',
    VISITOR: 'VISITOR-DEMO'
};

export const injectDemoData = async (setters: any) => {
    const {
        setUsers, setRooms, setBookings, setGuestHistory, setInvoices, setNotifications,
        setTransactions, setMaintenanceTickets, setHallBookings, setRestaurantOrders,
        setAttendance, setPoolPasses, setChatSessions, setMessages, setServiceRequests,
        setExternalOrders, setCoordinationNotes, setIncidentReports, setPublicServices,
        setFacilities, setHotelEvents, setActivities, setServiceFeedbacks, setGuestServices,
        setMenuItems, setRestaurantTables, setPartners, setServicePoints, setParkingSpots,
        setLegalRules, setJobOpenings, setJobApplications, setDeliveryDrivers, setReservations,
        setGuestRegistrationForms, setSettings,
        saveAll
    } = setters;

    // Generate Data using generators
    const demoUsers = generateMockUsers();
    const demoRooms = generateMockRooms(30);
    const demoGuests = generateMockGuests();
    const demoBookings = generateMockBookings(demoRooms, demoGuests);
    const demoTransactions = generateMockTransactions(demoUsers);
    const demoMaintenance = generateMockMaintenanceTickets(demoRooms, demoUsers);
    const demoNotifications = generateMockNotifications(demoUsers);
    const demoHallBookings = generateMockHallBookings();
    const demoRestaurantOrders = generateMockRestaurantOrders(DEFAULT_MENU);
    const demoAttendance = generateMockAttendance(demoUsers);
    const demoPoolPasses = generateMockPoolPasses();
    const demoChatSessions = generateMockChatSessions(demoUsers);
    const demoServiceRequests = generateMockServiceRequests();
    const demoExternalOrders = generateMockExternalOrders();
    const demoCoordinationNotes = generateMockCoordinationNotes();
    const demoIncidentReports = generateMockIncidentReports();
    const demoServicePoints = generateMockServicePoints();
    const demoDeliveryDrivers = generateMockDeliveryDrivers();
    const demoActivities = generateMockActivities();

    // Apply setters
    if (setUsers) setUsers(demoUsers);
    if (setRooms) setRooms(demoRooms);
    if (setBookings) setBookings(demoBookings);
    if (setGuestHistory) setGuestHistory(demoGuests);
    if (setTransactions) setTransactions(demoTransactions);
    if (setMaintenanceTickets) setMaintenanceTickets(demoMaintenance);
    if (setNotifications) setNotifications(demoNotifications);
    if (setHallBookings) setHallBookings(demoHallBookings);
    if (setRestaurantOrders) setRestaurantOrders(demoRestaurantOrders);
    if (setAttendance) setAttendance(demoAttendance);
    if (setPoolPasses) setPoolPasses(demoPoolPasses);
    if (setChatSessions) setChatSessions(demoChatSessions);
    if (setServiceRequests) setServiceRequests(demoServiceRequests);
    if (setExternalOrders) setExternalOrders(demoExternalOrders);
    if (setCoordinationNotes) setCoordinationNotes(demoCoordinationNotes);
    if (setIncidentReports) setIncidentReports(demoIncidentReports);
    if (setServicePoints) setServicePoints(demoServicePoints);
    if (setDeliveryDrivers) setDeliveryDrivers(demoDeliveryDrivers);
    if (setActivities) setActivities(demoActivities);
    
    if (setMenuItems) setMenuItems(DEFAULT_MENU);
    if (setHotelEvents) setHotelEvents(INITIAL_HOTEL_EVENTS);
    if (setFacilities) setFacilities(INITIAL_FACILITIES);
    if (setPublicServices) setPublicServices(INITIAL_PUBLIC_SERVICES);
    if (setParkingSpots) setParkingSpots(INITIAL_PARKING_SPOTS);
    if (setLegalRules) setLegalRules(INITIAL_LEGAL_RULES);

    // Save to DB
    if (saveAll) {
        await saveAll('users', demoUsers);
        await saveAll('rooms', demoRooms);
        await saveAll('bookings', demoBookings);
        await saveAll('guestHistory', demoGuests);
        await saveAll('transactions', demoTransactions);
        await saveAll('maintenanceTickets', demoMaintenance);
        await saveAll('notifications', demoNotifications);
        await saveAll('hallBookings', demoHallBookings);
        await saveAll('orders', demoRestaurantOrders);
        await saveAll('attendance', demoAttendance);
        await saveAll('poolPasses', demoPoolPasses);
        await saveAll('chatSessions', demoChatSessions);
        await saveAll('serviceRequests', demoServiceRequests);
        await saveAll('externalOrders', demoExternalOrders);
        await saveAll('coordinationNotes', demoCoordinationNotes);
        await saveAll('incidentReports', demoIncidentReports);
        await saveAll('servicePoints', demoServicePoints);
        await saveAll('deliveryDrivers', demoDeliveryDrivers);
        await saveAll('activities', demoActivities);
    }
};
