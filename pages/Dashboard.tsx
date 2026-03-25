import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, TextInput, Animated, Platform,
} from 'react-native';
import { useHotel } from '../context/HotelContext';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import {
  LayoutGrid, BedDouble, TrendingUp, LogIn, LogOut, AlertTriangle,
  CheckCircle, Clock, AlertOctagon, DollarSign, PieChart as PieIcon,
  Truck, Utensils, ShoppingBag, Briefcase, Send, MessageSquare,
  Users, Phone, Shield, FileText, Fingerprint, Settings,
} from 'lucide-react'
import { isZelligeTheme } from '../constants';
import { getThemeStyles } from '../utils/themeStyles';

const { width, height } = Dimensions.get('window');

// ─── Breakpoints ───────────────────────────────────────────────
const isPhone  = width < 480;
const isTablet = width >= 768;
const isLarge  = width >= 1024;

const COLS = isLarge ? 4 : isTablet ? 3 : isPhone ? 2 : 2;
const CARD_PAD = isTablet ? 28 : 20;
const PAGE_PAD = isTablet ? 24 : 16;

// ─── Theme tokens ──────────────────────────────────────────────
const T = {
  bg:         '#0A0A0F',
  surface:    '#111118',
  surfaceAlt: '#16161F',
  border:     'rgba(255,255,255,0.07)',
  gold:       '#C9A84C',
  goldDim:    'rgba(201,168,76,0.12)',
  goldGlow:   'rgba(201,168,76,0.30)',
  text:       '#E8E4DC',
  muted:      'rgba(232,228,220,0.45)',
  danger:     '#EF4444',
  success:    '#10B981',
  warning:    '#F59E0B',
  info:       '#3B82F6',
};

// ─── Simple Bar Chart ──────────────────────────────────────────
const BarChart = ({ data, color }: { data: { name: string; amount: number }[]; color: string }) => {
  const max = Math.max(...data.map(d => d.amount), 1);
  const chartH = isTablet ? 100 : 80;
  return (
    <View style={{ flexDirection: 'row-reverse', alignItems: 'flex-end', height: chartH + 28, gap: isPhone ? 4 : 6, marginTop: 12 }}>
      {data.map((item, i) => {
        const barH = Math.max(4, (item.amount / max) * chartH);
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
            <View style={{
              width: '60%', height: barH,
              backgroundColor: color,
              borderRadius: 4,
              opacity: 0.85 + (i / data.length) * 0.15,
            }} />
            <Text style={{ color: T.muted, fontSize: 9, marginTop: 5, textAlign: 'center' }}>{item.name}</Text>
          </View>
        );
      })}
    </View>
  );
};

// ─── Donut Chart ───────────────────────────────────────────────
const DonutChart = ({ data }: { data: { name: string; value: number; color: string }[] }) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const size = isTablet ? 130 : 110;
  return (
    <View style={{ alignItems: 'center', marginTop: 12 }}>
      <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', flexDirection: 'row', marginBottom: 16 }}>
        {data.map((d, i) => (
          d.value > 0 ? (
            <View key={i} style={{ height: '100%', flex: d.value / total, backgroundColor: d.color }} />
          ) : null
        ))}
        <View style={{
          position: 'absolute',
          top: size * 0.25, left: size * 0.25,
          width: size * 0.5, height: size * 0.5,
          borderRadius: size * 0.25,
          backgroundColor: T.surface,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: T.gold, fontSize: 11, fontWeight: '700' }}>{total}</Text>
          <Text style={{ color: T.muted, fontSize: 9 }}>غرف</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
        {data.map((d, i) => (
          <View key={i} style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: d.color }} />
            <Text style={{ color: T.muted, fontSize: 11 }}>{d.name}: <Text style={{ color: T.text, fontWeight: '700' }}>{d.value}</Text></Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ─── Stat Card ─────────────────────────────────────────────────
const StatCard = ({
  label, value, icon: Icon, accent, index,
}: { label: string; value: string | number; icon: any; accent: string; index: number }) => {
  const statW = isLarge
    ? (width - PAGE_PAD * 2 - 16 * 3) / 4
    : isTablet
    ? (width - PAGE_PAD * 2 - 16 * 2) / 3
    : (width - PAGE_PAD * 2 - 12) / 2;

  return (
    <View style={[S.statCard, { width: statW }]}>
      <View style={[S.statIconWrap, { backgroundColor: accent + '1A' }]}>
        <Icon size={isTablet ? 22 : 18} color={accent} />
      </View>
      <Text style={[S.statValue, { color: T.gold }]}>{value}</Text>
      <Text style={S.statLabel}>{label}</Text>
    </View>
  );
};

// ─── Section Card ──────────────────────────────────────────────
const Card = ({ children, style }: { children: React.ReactNode; style?: any }) => (
  <View style={[S.card, style]}>{children}</View>
);

const CardHeader = ({ icon: Icon, title, iconColor = T.gold }: { icon: any; title: string; iconColor?: string }) => (
  <View style={S.cardHeader}>
    <View style={[S.cardIconBox, { backgroundColor: iconColor + '1A' }]}>
      <Icon size={16} color={iconColor} />
    </View>
    <Text style={S.cardTitle}>{title}</Text>
  </View>
);

// ─── Quick Action Button ───────────────────────────────────────
const QuickBtn = ({ label, icon: Icon, onPress }: { label: string; icon: any; onPress: () => void }) => {
  const btnW = isLarge
    ? (width - PAGE_PAD * 2 - CARD_PAD * 2 - 10 * 3) / 4
    : isTablet
    ? (width - PAGE_PAD * 2 - CARD_PAD * 2 - 10 * 2) / 3
    : (width - PAGE_PAD * 2 - CARD_PAD * 2 - 10) / 2;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={[S.quickBtn, { width: btnW }]}>
      <View style={S.quickBtnIcon}>
        <Icon size={18} color={T.gold} />
      </View>
      <Text style={S.quickBtnLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

// ─── Pill Badge ────────────────────────────────────────────────
const Pill = ({ label, color }: { label: string; color: string }) => (
  <View style={{ backgroundColor: color + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1, borderColor: color + '44' }}>
    <Text style={{ color, fontSize: 10, fontWeight: '700' }}>{label}</Text>
  </View>
);

// ─── Separator ─────────────────────────────────────────────────
const Sep = () => <View style={{ height: 1, backgroundColor: T.border, marginVertical: 16 }} />;

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
const Dashboard: React.FC<{ navigate: (page: string) => void }> = ({ navigate }) => {
  const {
    rooms, bookings, maintenanceTickets, incidentReports, settings,
    transactions, externalOrders, restaurantOrders, currentUser,
    addNotification, users, isButtonVisible, canPerformAction, canAccessPage,
  } = useHotel();

  const [showTeamModal, setShowTeamModal]   = useState(false);
  const [msgModal, setMsgModal]             = useState<{ open: boolean; type: 'broadcast' | 'report' | null }>({ open: false, type: null });
  const [msgText, setMsgText]               = useState('');

  // ── Computed values ───────────────────────────────────────
  const occupied    = rooms.filter(r => r.status === 'occupied').length;
  const maintenance = rooms.filter(r => r.status === 'maintenance').length;
  const available   = rooms.filter(r => r.status === 'available').length;
  const dirty       = rooms.filter(r => r.status === 'dirty').length;
  const occRate     = Math.round((occupied / rooms.length) * 100) || 0;

  const today     = new Date().toISOString().split('T')[0];
  const checkIns  = bookings.filter(b => b.checkInDate.split('T')[0] === today).length;
  const checkOuts = bookings.filter(b => b.checkOutDate.split('T')[0] === today).length;

  const activeIncidents       = incidentReports.filter(i => i.status === 'reported' || i.status === 'investigating').length;
  const activeRestOrders      = restaurantOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
  const deliveryOrders        = restaurantOrders.filter(o => o.type === 'delivery' && o.status !== 'completed' && o.status !== 'cancelled').length;
  const activeExternalOrders  = externalOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;

  const myDept = currentUser?.department;
  const isHead = currentUser?.isHeadOfDepartment;

  const deptName = myDept === 'food_beverage' ? 'المطعم والمقهى'
    : myDept === 'reception'    ? 'الاستقبال'
    : myDept === 'housekeeping' ? 'التنظيف'
    : myDept === 'maintenance'  ? 'الصيانة'
    : 'الإدارة';

  const revenueData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const daily = transactions
      .filter(t => t.date.startsWith(dateStr) && t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    return { name: d.toLocaleDateString('ar-EG', { weekday: 'short' }), amount: daily };
  });

  const roomStatusData = [
    { name: 'متاحة', value: available,   color: T.success },
    { name: 'مشغولة', value: occupied,   color: T.info },
    { name: 'تنظيف', value: dirty,       color: T.warning },
    { name: 'صيانة', value: maintenance, color: T.danger },
  ];

  const stats = [
    { label: 'نسبة الإشغال',   value: `${occRate}%`,  icon: TrendingUp,   accent: T.gold    },
    { label: 'غرف مشغولة',    value: occupied,        icon: BedDouble,    accent: T.info    },
    { label: 'دخول اليوم',    value: checkIns,        icon: LogIn,        accent: T.success },
    { label: 'مغادرة اليوم',  value: checkOuts,       icon: LogOut,       accent: T.warning },
    { label: 'تحت الصيانة',   value: maintenance,     icon: AlertTriangle,accent: T.danger  },
  ];

  const quickActions = [
    { id: 'accommodation',    label: 'حجز جديد',      icon: BedDouble,    page: 'accommodation' },
    { id: 'requests',         label: 'طلبات الضيوف',  icon: MessageSquare,page: 'requests' },
    { id: 'invoices',         label: 'الفواتير',      icon: DollarSign,   page: 'invoices' },
    { id: 'restaurant',       label: 'طلب مطعم',      icon: Utensils,     page: 'restaurant' },
    { id: 'cafe',             label: 'طلبات المقهى',  icon: ShoppingBag,  page: 'cafe' },
    { id: 'operations_clean', label: 'تنظيف غرفة',   icon: CheckCircle,  page: 'operations' },
    { id: 'operations_report',label: 'إبلاغ عطل',    icon: AlertTriangle,page: 'operations' },
    { id: 'operations_tickets',label:'تذاكر صيانة',  icon: Briefcase,    page: 'operations' },
    { id: 'accounting',       label: 'المحاسبة',      icon: DollarSign,   page: 'accounting' },
    { id: 'profitability',    label: 'الربحية',       icon: TrendingUp,   page: 'profitability' },
    { id: 'reports',          label: 'التقارير',      icon: FileText,     page: 'reports' },
    { id: 'staff',            label: 'الموظفين',      icon: Users,        page: 'staff' },
    { id: 'audit_logs',       label: 'السجلات',       icon: Shield,       page: 'audit_logs' },
    { id: 'permissions',      label: 'الصلاحيات',     icon: Fingerprint,  page: 'permissions' },
    { id: 'settings',         label: 'الإعدادات',     icon: Settings,     page: 'settings' },
    { id: 'admin_hub',        label: 'الإدارة',       icon: LayoutGrid,   page: 'admin_hub' },
  ].filter(a => isButtonVisible(`dashboard_action_${a.id}`) && canAccessPage(a.page));

  // ── Handlers ─────────────────────────────────────────────
  const handleBroadcast = () => {
    if (!canPerformAction('broadcast_message')) {
      addNotification('ليس لديك صلاحية لإرسال توجيه', 'error'); return;
    }
    setMsgModal({ open: true, type: 'broadcast' });
  };

  const handleSend = () => {
    if (!msgText.trim()) return;
    if (msgModal.type === 'broadcast' && myDept) {
      addNotification(`توجيه من رئيس القسم (${currentUser?.name})`, 'warning', msgText, { departments: [myDept as any] });
      addNotification('تم إرسال التوجيه للفريق', 'success');
    } else if (msgModal.type === 'report') {
      const roles = ['manager', 'assistant_manager'];
      if (myDept) roles.push(`${myDept}_manager`);
      addNotification(`تقرير من ${currentUser?.name}`, 'info', msgText, { roles: roles as any });
      addNotification('تم إرسال التقرير', 'success');
    }
    setMsgModal({ open: false, type: null });
    setMsgText('');
  };

  // ── Two-column grid for charts/panels ────────────────────
  const twoCol = isTablet || isLarge;

  return (
    <ScrollView
      style={S.root}
      contentContainerStyle={[S.content, { paddingHorizontal: PAGE_PAD }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ─── Page Header ─────────────────────────────────── */}
      <PageHeader
        title={settings.pageTitles?.dashboard || 'لوحة التحكم'}
        subtitle={`مرحباً، ${currentUser?.name}`}
        icon={LayoutGrid}
      />

      {/* ─── Alert Banner ────────────────────────────────── */}
      {activeIncidents > 0 && canAccessPage('operations') && (
        <TouchableOpacity onPress={() => navigate('operations')} activeOpacity={0.85} style={S.alertBanner}>
          <View style={S.alertGlow} />
          <View style={S.alertLeft}>
            <View style={S.alertIconBox}>
              <AlertOctagon size={20} color="#fff" />
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={S.alertTitle}>تنبيهات نشطة</Text>
              <Text style={S.alertSub}>يوجد {activeIncidents} مخالفات تتطلب المعالجة</Text>
            </View>
          </View>
          <View style={S.alertBadge}>
            <Text style={S.alertBadgeText}>{activeIncidents}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* ─── Stats Grid ──────────────────────────────────── */}
      <View style={S.statsRow}>
        {stats.map((s, i) => (
          <StatCard key={i} index={i} label={s.label} value={s.value} icon={s.icon} accent={s.accent} />
        ))}
      </View>

      {/* ─── Department Hub ──────────────────────────────── */}
      <Card>
        <View style={[S.cardHeader, { marginBottom: 0 }]}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10, flex: 1 }}>
            <View style={[S.cardIconBox, { backgroundColor: T.goldDim }]}>
              <Briefcase size={16} color={T.gold} />
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={S.cardTitle}>التحالف الخدماتي</Text>
              <Text style={{ color: T.muted, fontSize: 11, marginTop: 1 }}>{deptName}</Text>
            </View>
          </View>
          {isHead && <Pill label="رئيس القطاع" color={T.gold} />}
        </View>

        <Sep />

        {/* Quick Actions */}
        <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10 }}>
          {quickActions.map(a => (
            <QuickBtn key={a.id} label={a.label} icon={a.icon} onPress={() => navigate(a.page)} />
          ))}
        </View>

        <Sep />

        {/* Footer Buttons */}
        <View style={{ flexDirection: 'row-reverse', gap: 10 }}>
          <TouchableOpacity
            onPress={isHead ? handleBroadcast : () => setMsgModal({ open: true, type: 'report' })}
            activeOpacity={0.8}
            style={S.primaryBtn}
          >
            {isHead ? <Send size={15} color="#0A0A0F" /> : <MessageSquare size={15} color="#0A0A0F" />}
            <Text style={S.primaryBtnText}>{isHead ? 'توجيه للفريق' : 'تقرير لرئيس القسم'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowTeamModal(true)}
            activeOpacity={0.8}
            style={S.secondaryBtn}
          >
            <Users size={13} color={T.gold} />
            <Text style={S.secondaryBtnText}>فريق العمل</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* ─── Charts Row ──────────────────────────────────── */}
      <View style={[S.twoCol, { flexDirection: twoCol ? 'row-reverse' : 'column' }]}>
        {/* Revenue Chart */}
        <Card style={{ flex: twoCol ? 1 : undefined }}>
          <CardHeader icon={DollarSign} title="الإيرادات — آخر 7 أيام" iconColor={T.success} />
          <BarChart data={revenueData} color={T.gold} />
        </Card>

        {/* Room Status Donut */}
        <Card style={{ flex: twoCol ? 1 : undefined }}>
          <CardHeader icon={PieIcon} title="توزيع حالة الغرف" iconColor={T.info} />
          <DonutChart data={roomStatusData} />
        </Card>
      </View>

      {/* ─── Services + Room Status ──────────────────────── */}
      <View style={[S.twoCol, { flexDirection: twoCol ? 'row-reverse' : 'column' }]}>
        {/* Services Pulse */}
        <Card style={{ flex: twoCol ? 1 : undefined }}>
          <CardHeader icon={Utensils} title="نبض الخدمات" iconColor={T.warning} />
          <View style={{ gap: 10, marginTop: 4 }}>
            {[
              { label: 'طلبات المطعم', value: activeRestOrders,     icon: Utensils,     color: T.warning },
              { label: 'توصيل خارجي', value: deliveryOrders,        icon: Truck,        color: '#A855F7' },
              { label: 'خدمات أخرى',  value: activeExternalOrders,  icon: ShoppingBag,  color: T.info    },
            ].map((s, i) => (
              <View key={i} style={S.pulseItem}>
                <View style={[S.pulseIcon, { backgroundColor: s.color + '1A' }]}>
                  <s.icon size={14} color={s.color} />
                </View>
                <Text style={S.pulseLabel}>{s.label}</Text>
                <Text style={[S.pulseValue, { color: s.color }]}>{s.value}</Text>
              </View>
            ))}
          </View>
          {canAccessPage('external_services') && (
            <TouchableOpacity onPress={() => navigate('external_services')} activeOpacity={0.8} style={S.cardFooterBtn}>
              <Text style={S.cardFooterBtnText}>إدارة الخدمات الخارجية</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Room Status Now */}
        <Card style={{ flex: twoCol ? 1 : undefined }}>
          <CardHeader icon={Clock} title="حالة الغرف الآن" iconColor={T.muted} />
          <View style={{ flexDirection: 'row-reverse', gap: 10, marginTop: 8 }}>
            <View style={[S.roomBox, { flex: 1, borderColor: T.success + '44' }]}>
              <Text style={[S.roomBoxVal, { color: T.success }]}>{available}</Text>
              <Text style={[S.roomBoxLabel, { color: T.success }]}>متاحة</Text>
            </View>
            <View style={[S.roomBox, { flex: 1, borderColor: T.warning + '44' }]}>
              <Text style={[S.roomBoxVal, { color: T.warning }]}>{dirty}</Text>
              <Text style={[S.roomBoxLabel, { color: T.warning }]}>للتنظيف</Text>
            </View>
            <View style={[S.roomBox, { flex: 1, borderColor: T.danger + '44' }]}>
              <Text style={[S.roomBoxVal, { color: T.danger }]}>{maintenance}</Text>
              <Text style={[S.roomBoxLabel, { color: T.danger }]}>صيانة</Text>
            </View>
          </View>
          {canAccessPage('accommodation') && (
            <TouchableOpacity onPress={() => navigate('accommodation')} activeOpacity={0.8} style={S.cardFooterBtn}>
              <Text style={S.cardFooterBtnText}>إدارة الإقامة والغرف</Text>
            </TouchableOpacity>
          )}
        </Card>
      </View>

      {/* ─── Maintenance & Incidents ─────────────────────── */}
      <Card>
        <CardHeader icon={AlertTriangle} title="العمليات والطوارئ" iconColor={T.danger} />

        {maintenanceTickets.filter(t => t.status !== 'resolved').length === 0 &&
         incidentReports.filter(i => i.status === 'reported').length === 0 ? (
          <View style={S.emptyState}>
            <CheckCircle size={36} color={T.success} />
            <Text style={S.emptyText}>كل شيء تحت السيطرة</Text>
          </View>
        ) : (
          <View style={{ gap: 10, marginTop: 4 }}>
            {incidentReports.filter(i => i.status === 'reported').slice(0, 3).map(inc => (
              <View key={inc.id} style={[S.incidentItem, { borderColor: T.danger + '44', backgroundColor: T.danger + '0D' }]}>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={[S.incidentTitle, { color: T.text }]}>{inc.title}</Text>
                  <Text style={S.incidentSub}>{inc.location}</Text>
                </View>
                <Pill label="مخالفة" color={T.danger} />
              </View>
            ))}
            {maintenanceTickets.filter(t => t.status !== 'resolved').slice(0, 3).map(ticket => {
              const rm = rooms.find(r => r.id === ticket.roomId);
              const pc = ticket.priority === 'critical' ? T.danger : T.warning;
              return (
                <View key={ticket.id} style={[S.incidentItem, { borderColor: pc + '44', backgroundColor: pc + '0D' }]}>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={[S.incidentTitle, { color: T.text }]}>غرفة {rm?.number}</Text>
                    <Text style={S.incidentSub}>{ticket.description}</Text>
                  </View>
                  <Pill label={ticket.priority} color={pc} />
                </View>
              );
            })}
          </View>
        )}

        {canAccessPage('operations') && (
          <TouchableOpacity onPress={() => navigate('operations')} activeOpacity={0.8} style={[S.cardFooterBtn, { marginTop: 16 }]}>
            <Text style={S.cardFooterBtnText}>مركز العمليات</Text>
          </TouchableOpacity>
        )}
      </Card>

      {/* ─── MODALS ──────────────────────────────────────── */}

      {/* Team Modal */}
      <Modal isOpen={showTeamModal} onClose={() => setShowTeamModal(false)} title={`فريق ${deptName}`} icon={Users}>
        <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
          {users
            .filter(u => u.department === myDept || (myDept === 'management' && u.role === 'manager'))
            .map(m => (
              <View key={m.id} style={S.memberCard}>
                <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10, flex: 1 }}>
                  <View style={[S.memberAvatar, { backgroundColor: m.isHeadOfDepartment ? T.gold : T.muted }]}>
                    <Text style={{ color: '#0A0A0F', fontWeight: '800', fontSize: 14 }}>{m.name.charAt(0)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: T.text, fontWeight: '700', fontSize: 13 }}>{m.name}</Text>
                    <Text style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>{m.role === 'manager' ? 'مدير' : m.role}</Text>
                  </View>
                  {m.isHeadOfDepartment && <Pill label="رئيس القطاع" color={T.gold} />}
                </View>
                <View style={{ flexDirection: 'row-reverse', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => addNotification(`جاري الاتصال بـ ${m.name}...`, 'info', `رقم الهاتف: ${m.phone || 'غير مسجل'}`)}
                    style={[S.iconBtn, { backgroundColor: T.success + '1A' }]}
                  >
                    <Phone size={14} color={T.success} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => addNotification(`فتح المحادثة مع ${m.name}...`, 'info', 'سيتم تحويلك إلى نظام المراسلة الداخلية')}
                    style={[S.iconBtn, { backgroundColor: T.info + '1A' }]}
                  >
                    <MessageSquare size={14} color={T.info} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          {users.filter(u => u.department === myDept).length === 0 && (
            <Text style={{ textAlign: 'center', color: T.muted, paddingVertical: 32, fontSize: 13 }}>
              لا يوجد أعضاء آخرون في هذا القسم حالياً.
            </Text>
          )}
        </ScrollView>
      </Modal>

      {/* Message Modal */}
      <Modal
        isOpen={msgModal.open}
        onClose={() => setMsgModal({ open: false, type: null })}
        title={msgModal.type === 'broadcast' ? 'توجيه للفريق' : 'تقرير لرئيس القسم'}
      >
        <View style={{ gap: 14 }}>
          <Text style={{ color: T.muted, fontSize: 13, textAlign: 'right', lineHeight: 20 }}>
            {msgModal.type === 'broadcast'
              ? 'أرسل رسالة فورية لجميع أعضاء فريقك. ستظهر كإشعار هام.'
              : 'أرسل تقريراً سريعاً أو ملاحظة لرئيس القسم والإدارة.'}
          </Text>
          <TextInput
            style={S.textArea}
            placeholder="اكتب رسالتك هنا..."
            placeholderTextColor={T.muted}
            multiline
            numberOfLines={4}
            value={msgText}
            onChangeText={setMsgText}
            textAlignVertical="top"
            textAlign="right"
          />
          <View style={{ flexDirection: 'row-reverse', gap: 10, justifyContent: 'flex-start' }}>
            <TouchableOpacity onPress={() => setMsgModal({ open: false, type: null })} style={S.cancelBtn}>
              <Text style={{ color: T.muted, fontWeight: '600', fontSize: 13 }}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSend}
              disabled={!msgText.trim()}
              activeOpacity={0.8}
              style={[S.primaryBtn, { opacity: msgText.trim() ? 1 : 0.4 }]}
            >
              <Send size={14} color="#0A0A0F" />
              <Text style={S.primaryBtnText}>إرسال</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },

  content: {
    paddingTop: 8,
    paddingBottom: 120,
    gap: 16,
  },

  // ── Alert ────────────────────────────────────────────────────
  alertBanner: {
    backgroundColor: '#3D0B0B',
    borderWidth: 1,
    borderColor: T.danger + '55',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
  },
  alertGlow: {
    position: 'absolute',
    top: -20, right: -20,
    width: 80, height: 80,
    borderRadius: 40,
    backgroundColor: T.danger,
    opacity: 0.12,
  },
  alertLeft: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, flex: 1 },
  alertIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: T.danger + '33',
    alignItems: 'center', justifyContent: 'center',
  },
  alertTitle:    { color: '#fff', fontWeight: '800', fontSize: isTablet ? 16 : 14, textAlign: 'right' },
  alertSub:      { color: 'rgba(255,255,255,0.7)', fontSize: 11, textAlign: 'right', marginTop: 2 },
  alertBadge:    { backgroundColor: T.danger, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  alertBadgeText:{ color: '#fff', fontWeight: '900', fontSize: 18 },

  // ── Stats ────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: T.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: T.border,
    padding: isTablet ? 20 : 16,
    alignItems: 'center',
  },
  statIconWrap: {
    width: isTablet ? 44 : 38,
    height: isTablet ? 44 : 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue:  { fontSize: isTablet ? 28 : 24, fontWeight: '900', color: T.gold, marginBottom: 4 },
  statLabel:  { fontSize: isTablet ? 11 : 10, color: T.muted, textAlign: 'center', fontWeight: '600' },

  // ── Card ─────────────────────────────────────────────────────
  card: {
    backgroundColor: T.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: T.border,
    padding: CARD_PAD,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  cardIconBox: {
    width: 32, height: 32, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: isTablet ? 16 : 14, fontWeight: '800', color: T.text },

  // ── Quick Actions ─────────────────────────────────────────────
  quickBtn: {
    backgroundColor: T.surfaceAlt,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 14,
    padding: isTablet ? 14 : 12,
    alignItems: 'center',
  },
  quickBtnIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: T.goldDim,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  quickBtnLabel: { fontSize: isTablet ? 12 : 11, fontWeight: '700', color: T.text, textAlign: 'center' },

  // ── Primary / Secondary Buttons ───────────────────────────────
  primaryBtn: {
    flex: 1,
    backgroundColor: T.gold,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: { color: '#0A0A0F', fontWeight: '800', fontSize: 13 },

  secondaryBtn: {
    backgroundColor: T.surfaceAlt,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 7,
  },
  secondaryBtnText: { color: T.gold, fontWeight: '700', fontSize: 13 },

  // ── Two-column layout ─────────────────────────────────────────
  twoCol: { gap: 16 },

  // ── Services Pulse ────────────────────────────────────────────
  pulseItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    backgroundColor: T.surfaceAlt,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: T.border,
  },
  pulseIcon: {
    width: 32, height: 32, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  pulseLabel: { flex: 1, color: T.text, fontSize: 13, fontWeight: '600', textAlign: 'right' },
  pulseValue: { fontSize: 20, fontWeight: '900' },

  // ── Card footer button ─────────────────────────────────────────
  cardFooterBtn: {
    backgroundColor: T.surfaceAlt,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 14,
    borderWidth: 1,
    borderColor: T.border,
  },
  cardFooterBtnText: { color: T.muted, fontWeight: '700', fontSize: 13 },

  // ── Room Status Boxes ─────────────────────────────────────────
  roomBox: {
    backgroundColor: T.surfaceAlt,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  roomBoxVal:   { fontSize: isTablet ? 26 : 22, fontWeight: '900', marginBottom: 4 },
  roomBoxLabel: { fontSize: 11, fontWeight: '700' },

  // ── Empty State ───────────────────────────────────────────────
  emptyState: { alignItems: 'center', gap: 10, paddingVertical: 24 },
  emptyText:  { color: T.muted, fontSize: 14, fontWeight: '600' },

  // ── Incident Items ────────────────────────────────────────────
  incidentItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  incidentTitle: { fontWeight: '800', fontSize: 13, textAlign: 'right' },
  incidentSub:   { color: T.muted, fontSize: 11, textAlign: 'right', marginTop: 2 },

  // ── Member Card ───────────────────────────────────────────────
  memberCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: T.surfaceAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border,
    padding: 14,
    marginBottom: 10,
  },
  memberAvatar: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtn: {
    width: 34, height: 34, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },

  // ── Text Area ─────────────────────────────────────────────────
  textArea: {
    backgroundColor: T.surfaceAlt,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 14,
    padding: 14,
    color: T.text,
    fontSize: 14,
    minHeight: 110,
    textAlign: 'right',
  },

  // ── Cancel Button ─────────────────────────────────────────────
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: T.surfaceAlt,
    borderWidth: 1,
    borderColor: T.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Dashboard;