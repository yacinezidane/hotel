import React, { useState, useEffect, Suspense, lazy, useTransition } from 'react';
import { HotelProvider, useHotel } from './context/HotelContext';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Building2, Shield, Loader2 } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import { testConnection } from './firebase';

// Lazy Load Pages
const LoginPage = lazy(() => import('./pages/LoginPageNew'));
const RoomsPage = lazy(() => import('./pages/RoomsPage').then(module => ({ default: module.RoomsPage })));
const BookingsPage = lazy(() => import('./pages/BookingsPage').then(module => ({ default: module.BookingsPage })));
const InvoicesPage = lazy(() => import('./pages/InvoicesPage').then(module => ({ default: module.InvoicesPage })));
const MessagesPage = lazy(() => import('./pages/MessagesPage').then(module => ({ default: module.MessagesPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(module => ({ default: module.NotificationsPage })));
const StaffPage = lazy(() => import('./pages/StaffPage').then(module => ({ default: module.StaffPage })));
const ShortcutsPage = lazy(() => import('./pages/ShortcutsPage').then(module => ({ default: module.ShortcutsPage })));
const AccountingPage = lazy(() => import('./pages/AccountingPage').then(module => ({ default: module.AccountingPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(module => ({ default: module.AboutPage })));
const EventsPage = lazy(() => import('./pages/EventsPage').then(module => ({ default: module.EventsPage })));
const PoolPage = lazy(() => import('./pages/PoolPage').then(module => ({ default: module.PoolPage })));
const RestaurantPage = lazy(() => import('./pages/RestaurantPage').then(module => ({ default: module.RestaurantPage })));
const QRScannerPage = lazy(() => import('./pages/QRScannerPage').then(module => ({ default: module.QRScannerPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(module => ({ default: module.ReportsPage })));
const OperationsPage = lazy(() => import('./pages/OperationsPage').then(module => ({ default: module.OperationsPage })));
const ServiceManagerPage = lazy(() => import('./pages/ServiceManagerPage').then(module => ({ default: module.ServiceManagerPage })));
const GuestServicesPage = lazy(() => import('./pages/GuestServicesPage').then(module => ({ default: module.GuestServicesPage })));
const RequestsPage = lazy(() => import('./pages/RequestsPage').then(module => ({ default: module.RequestsPage })));
const GuestExperiencePreview = lazy(() => import('./pages/GuestExperiencePreview').then(module => ({ default: module.GuestExperiencePreview })));
const SecurityLinkPage = lazy(() => import('./pages/SecurityLinkPage').then(module => ({ default: module.SecurityLinkPage })));
const QRMonitoringPage = lazy(() => import('./pages/QRMonitoringPage').then(module => ({ default: module.QRMonitoringPage })));
const ManagementHub = lazy(() => import('./pages/ManagementHub').then(module => ({ default: module.ManagementHub })));
const PrintStudioPage = lazy(() => import('./pages/PrintStudioPage').then(module => ({ default: module.PrintStudioPage })));
const PricingPage = lazy(() => import('./pages/PricingPage').then(module => ({ default: module.PricingPage })));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage').then(module => ({ default: module.UserProfilePage })));
const WebsiteManagerPage = lazy(() => import('./pages/WebsiteManagerPage').then(module => ({ default: module.WebsiteManagerPage })));
const PublicLandingPage = lazy(() => import('./pages/PublicLandingPage').then(module => ({ default: module.PublicLandingPage })));
const GuestPortal = lazy(() => import('./components/GuestPortal').then(module => ({ default: module.GuestPortal })));
const VisitorPortal = lazy(() => import('./components/VisitorPortal').then(module => ({ default: module.VisitorPortal })));
const PortalSelectionPage = lazy(() => import('./components/PortalSelectionPage').then(module => ({ default: module.PortalSelectionPage })));
const CoordinationCenter = lazy(() => import('./pages/CoordinationCenter').then(module => ({ default: module.CoordinationCenter })));
const ExternalServicesPage = lazy(() => import('./pages/ExternalServicesPage').then(module => ({ default: module.ExternalServicesPage })));
const PermissionsPage = lazy(() => import('./pages/PermissionsPage').then(module => ({ default: module.PermissionsPage })));
const GlobalNetworkPage = lazy(() => import('./pages/GlobalNetworkPage').then(module => ({ default: module.GlobalNetworkPage })));
const ProfitabilityPage = lazy(() => import('./pages/ProfitabilityPage').then(module => ({ default: module.ProfitabilityPage })));
const DeliveryPage = lazy(() => import('./pages/DeliveryPage'));
const VenueManagementPage = lazy(() => import('./pages/VenueManagementPage').then(module => ({ default: module.VenueManagementPage })));
const GardenOasisPage = lazy(() => import('./pages/GardenOasisPage').then(module => ({ default: module.GardenOasisPage })));
const ParkingPage = lazy(() => import('./pages/ParkingPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const KioskManagerPage = lazy(() => import('./pages/KioskManagerPage'));
const RecruitmentPage = lazy(() => import('./pages/RecruitmentPage').then(module => ({ default: module.RecruitmentPage })));
const ReservationsPage = lazy(() => import('./pages/ReservationsPage').then(module => ({ default: module.ReservationsPage })));
const DesktopPage = lazy(() => import('./pages/DesktopPage').then(module => ({ default: module.DesktopPage })));
const DatabaseSettingsPage = lazy(() => import('./pages/DatabaseSettingsPage').then(module => ({ default: module.DatabaseSettingsPage })));
const HousekeepingPage = lazy(() => import('./pages/HousekeepingPage').then(module => ({ default: module.HousekeepingPage })));
const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage').then(module => ({ default: module.AuditLogsPage })));

const LoadingScreen = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-[#006269] text-white font-sans">
        <div className="p-6 bg-white/10 rounded-[2rem] mb-6 animate-pulse">
            <Building2 size={64} className="text-[#cca43b]" />
        </div>
        <h1 className="text-3xl font-black text-[#cca43b] mb-2 text-center">فندق الجزائر</h1>
        <p className="text-sm font-bold text-[#ecfdf5] tracking-[0.2em] uppercase text-center">System Loading...</p>
    </div>
);

const AppContent = () => {
  const { currentUser, canAccessPage } = useHotel();
  const [activePage, setActivePage] = useState('dashboard');
  const [history, setHistory] = useState<string[]>([]); 
  const [initialTab, setInitialTab] = useState<string | undefined>(undefined);
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [isGuestServiceMode, setIsGuestServiceMode] = useState(false);
  const [isVisitorMode, setIsVisitorMode] = useState(false);
  const [visitorProfile, setVisitorProfile] = useState<any>(null);
  const [isPublicMode, setIsPublicMode] = useState(true); 
  const [showPortalSelection, setShowPortalSelection] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    testConnection();
    const timer = setTimeout(() => setIsLoading(false), 1500);

    const params = new URLSearchParams(window.location.search);
    const token = params.get('guest');
    const serviceToken = params.get('token'); 
    const mode = params.get('mode');
    const isStaffSession = sessionStorage.getItem('staffMode') === 'true';

    if (mode === 'app' || isStaffSession || token || serviceToken) {
        setIsPublicMode(false);
        setShowPortalSelection(false);
    }

    if (token) {
        setGuestToken(token);
    }
    if (serviceToken && window.location.pathname.includes('guest-services')) {
        setIsGuestServiceMode(true);
    }
    
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (page: string) => {
      if (page === activePage) return;
      setHistory(prev => [...prev, activePage]);
      startTransition(() => {
          setActivePage(page);
      });
  };

  const handleManualCode = (code: string) => {
      const upperCode = code.toUpperCase();
      
      if (upperCode.startsWith('REST') || upperCode.startsWith('CAFE') || upperCode.startsWith('POOL')) {
          setInitialTab('services');
      } else {
          setInitialTab(undefined);
      }

      if (upperCode.startsWith('V-') || upperCode.startsWith('VISIT') || upperCode.includes('VISITOR')) {
          setVisitorProfile({
              name: 'زائر تجريبي',
              phone: '0500000000',
              idNumber: 'VISITOR-MOCK',
              membershipCode: upperCode
          });
          setIsVisitorMode(true);
          setIsPublicMode(false);
          setShowPortalSelection(false);
      } else {
          setGuestToken(upperCode);
          setIsPublicMode(false);
          setShowPortalSelection(false);
      }
  };

  const handleGoBack = () => {
      if (history.length === 0) {
          startTransition(() => {
              setActivePage('dashboard');
          });
          return;
      }

      const newHistory = [...history];
      const lastPage = newHistory.pop();
      setHistory(newHistory);
      
      startTransition(() => {
          setActivePage(lastPage || 'dashboard');
      });
  };

  const handleExitToPublic = () => {
      setIsPublicMode(true);
      setIsVisitorMode(false);
      setGuestToken(null);
      setShowPortalSelection(true);
      setActivePage('dashboard');
      sessionStorage.removeItem('staffMode');
  };

  const handleSwitchToVisitor = (profile?: any) => {
      setGuestToken(null);
      setIsGuestServiceMode(false);
      setIsVisitorMode(true);
      setIsPublicMode(false);
      setShowPortalSelection(false);
      if (profile) setVisitorProfile(profile);
  };

  if (isLoading) return <LoadingScreen />;

  if (isPublicMode && showPortalSelection) {
      return (
          <Suspense fallback={<LoadingScreen />}>
              <PortalSelectionPage 
                onSelectGuest={handleManualCode}
                onSelectVisitor={() => {
                    setIsVisitorMode(true);
                    setIsPublicMode(false);
                    setShowPortalSelection(false);
                }}
                onAdminClick={() => {
                    setIsPublicMode(false);
                    setShowPortalSelection(false);
                    sessionStorage.setItem('staffMode', 'true');
                }}
              />
          </Suspense>
      );
  }

  if (isPublicMode && !showPortalSelection) {
      return (
          <Suspense fallback={<LoadingScreen />}>
              <Layout 
                activeTab={activePage === 'dashboard' ? 'home' : activePage} 
                setActiveTab={handleNavigate}
                user={currentUser}
                onLogout={() => {}} // Handle logout
                notifications={[]} // Pass notifications
                onNotificationClick={() => {}}
                onClearNotifications={() => {}}
                onMarkAllAsRead={() => {}}
                onSettingsClick={() => handleNavigate('settings')}
                onProfileClick={() => handleNavigate('user_profile')}
                onSearch={() => {}}
              >
                  <PublicLandingPage activePage={activePage === 'dashboard' ? 'home' : activePage} onNavigate={handleNavigate} />
              </Layout>
          </Suspense>
      );
  }

  if (isGuestServiceMode || guestToken) {
      return (
          <Suspense fallback={<LoadingScreen />}>
              <GuestPortal 
                token={guestToken || ''} 
                onExit={handleExitToPublic}
                onSwitchToVisitor={handleSwitchToVisitor}
                initialTab={initialTab as any}
              />
          </Suspense>
      );
  }

  if (isVisitorMode) {
      return (
          <Suspense fallback={<LoadingScreen />}>
              <VisitorPortal 
                guestProfile={visitorProfile}
                onExit={() => {
                    setVisitorProfile(null);
                    handleExitToPublic();
                }} 
                initialTab={initialTab as any}
              />
          </Suspense>
      );
  }

  if (!currentUser) {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <LoginPage />
        </Suspense>
    );
  }

  const renderPage = () => {
    if (!canAccessPage(activePage)) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <Shield size={48} className="text-red-600" />
                </div>
                <h2 className="text-2xl font-black mb-2">غير مصرح بالدخول</h2>
                <p className="text-gray-500 max-w-md mb-8">عذراً، لا تملك الصلاحيات الكافية للوصول إلى هذا القسم. يرجى التواصل مع الإدارة إذا كنت تعتقد أن هذا خطأ.</p>
                <button 
                  onClick={() => handleNavigate('dashboard')} 
                  className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                >
                    العودة للرئيسية
                </button>
            </div>
        );
    }

    switch (activePage) {
      case 'dashboard': return <Dashboard navigate={handleNavigate} />;
      case 'shortcuts': return <ShortcutsPage navigate={handleNavigate} />;
      case 'rooms':
      case 'accommodation': return <RoomsPage />;
      case 'events': return <EventsPage />; 
      case 'pool': return <PoolPage />; 
      case 'restaurant': return <RestaurantPage mode="restaurant" />; 
      case 'cafe': return <RestaurantPage mode="cafe" />;
      case 'invoices': return <InvoicesPage />;
      case 'messages': return <MessagesPage />;
      case 'qr_scanner': return <QRScannerPage />; 
      case 'qr_monitor': return <QRMonitoringPage />;
      case 'admin_hub': return <ManagementHub navigate={handleNavigate} />; 
      case 'reports': return <ReportsPage />;
      case 'operations': return <OperationsPage />; 
      case 'services': return <ServiceManagerPage />; 
      case 'requests': return <RequestsPage />;
      case 'guest_preview': return <GuestExperiencePreview />; 
      case 'security': return <SecurityLinkPage />; 
      case 'settings': return <SettingsPage />;
      case 'print_studio':
      case 'print_settings': return <PrintStudioPage />;
      case 'website_manager': return <WebsiteManagerPage />; 
      case 'pricing': return <PricingPage />; 
      case 'notifications': return <NotificationsPage />;
      case 'staff': return <StaffPage />;
      case 'permissions': return <PermissionsPage />;
      case 'bookings':
      case 'guests': return <BookingsPage />;
      case 'coordination': return <CoordinationCenter />; 
      case 'external_services': return <ExternalServicesPage />;
      case 'resident': return <GuestPortal token={guestToken || ''} onExit={() => setIsPublicMode(true)} />;
      case 'visitor': return <VisitorPortal guestProfile={visitorProfile} onExit={() => setIsPublicMode(true)} />;
      case 'user_profile': return <UserProfilePage />;
      case 'accounting': return <AccountingPage />;
      case 'about': return <AboutPage />;
      case 'delivery': return <DeliveryPage />;
      case 'venues':
      case 'facilities': return <VenueManagementPage />;
      case 'garden_oasis': return <GardenOasisPage />;
      case 'parking': return <ParkingPage />;
      case 'legal': return <LegalPage />;
      case 'kiosk_manager': return <KioskManagerPage />;
      case 'recruitment': return <RecruitmentPage />;
      case 'global_network': return <GlobalNetworkPage />;
      case 'profitability': return <ProfitabilityPage />;
      case 'reservations': return <ReservationsPage />;
      case 'desktop': return <DesktopPage />;
      case 'database':
      case 'database_settings': return <DatabaseSettingsPage />;
      case 'housekeeping': return <HousekeepingPage />;
      case 'audit_logs': return <AuditLogsPage />;
      case 'inventory': return <OperationsPage />;
      default: return <Dashboard navigate={handleNavigate} />;
    }
  };

  return (
    <Layout 
      activeTab={activePage} 
      setActiveTab={handleNavigate}
      user={currentUser}
      onLogout={() => {}} // Handle logout
      notifications={[]} // Pass notifications
      onNotificationClick={() => {}}
      onClearNotifications={() => {}}
      onMarkAllAsRead={() => {}}
      onSettingsClick={() => handleNavigate('settings')}
      onProfileClick={() => handleNavigate('user_profile')}
      onSearch={() => {}}
    >
      {isPending && (
          <div className="fixed top-0 left-0 right-0 h-1 bg-blue-50 z-[100]">
              <div className="h-full bg-blue-600 animate-progress" />
          </div>
      )}
      <Suspense fallback={<div className="flex items-center justify-center h-full min-h-[300px]"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>}>
        {renderPage()}
      </Suspense>
    </Layout>
  );
};

export default function App() {
  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
        <ErrorBoundary>
            <HotelProvider>
                <AppContent />
            </HotelProvider>
        </ErrorBoundary>
    </div>
  );
}
