import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Platform,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import { useHotel } from '../context/HotelContext';
import { User } from '../types';
import {
  Building2,
  UserCircle,
  KeyRound,
  LogIn,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const { width, height } = Dimensions.get('window');
const isLargeScreen = width >= 1024;

const LoginPage: React.FC = () => {
  const { users, login, settings } = useHotel();
  const [manualId, setManualId] = useState('');
  const [error, setError] = useState('');
  const [showQuickSelect, setShowQuickSelect] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [isBrandingCollapsed, setIsBrandingCollapsed] = useState(false);

  const handleLogin = (userId: string) => {
    try {
      login(userId);
    } catch (err) {
      setError('فشل تسجيل الدخول. يرجى التحقق من البيانات.');
    }
  };

  const handleManualLogin = () => {
    if (!manualId.trim()) return;

    const user = users.find((u) => u.id === manualId || u.accessCode === manualId);
    if (user) {
      handleLogin(user.id);
    } else {
      setError('المستخدم غير موجود. يرجى التحقق من المعرف أو الرمز.');
    }
  };

  // Group users by department
  const groupedUsers = users.reduce((acc, user) => {
    const dept = user.department || 'Other';
    if (!acc[dept]) {
      acc[dept] = [];
    }
    acc[dept].push(user);
    return acc;
  }, {} as Record<string, User[]>);

  // Theme Logic adapted for React Native
  const getThemeStyles = () => {
    const isDark = settings.darkMode;
    const theme = settings.theme;

    const baseStyles = {
      bg: isDark ? '#001e21' : '#fdfbf7',
      card: isDark ? '#002a2d' : '#ffffff',
      cardBorder: isDark ? 'rgba(204, 164, 59, 0.3)' : 'rgba(204, 164, 59, 0.3)',
      text: isDark ? '#cca43b' : '#006269',
      accent: '#cca43b',
      button: isDark ? '#cca43b' : '#006269',
      buttonText: isDark ? '#001e21' : '#cca43b',
      inputBg: isDark ? '#001517' : '#fbf8f1',
      userCard: isDark ? '#002a2d' : '#fbf8f1',
      userCardBorder: isDark ? 'rgba(204, 164, 59, 0.2)' : 'rgba(204, 164, 59, 0.2)',
    };

    if (theme === 'ceramic-talavera') {
      baseStyles.bg = isDark ? '#0f172a' : '#fffbeb';
      baseStyles.card = isDark ? '#1e3a8a' : '#ffffff';
      baseStyles.text = isDark ? '#f59e0b' : '#1e3a8a';
      baseStyles.accent = '#f59e0b';
      baseStyles.button = '#f59e0b';
      baseStyles.buttonText = isDark ? '#0f172a' : '#ffffff';
      baseStyles.inputBg = isDark ? '#0f172a' : '#ffffff';
    } else if (theme === 'ceramic-majolica') {
      baseStyles.bg = isDark ? '#052e16' : '#fefce8';
      baseStyles.card = isDark ? '#15803d' : '#ffffff';
      baseStyles.text = isDark ? '#facc15' : '#15803d';
      baseStyles.accent = '#facc15';
      baseStyles.button = '#facc15';
      baseStyles.buttonText = isDark ? '#052e16' : '#ffffff';
      baseStyles.inputBg = isDark ? '#052e16' : '#ffffff';
    } else if (theme === 'ceramic-delft') {
      baseStyles.bg = isDark ? '#082f49' : '#f0f9ff';
      baseStyles.card = isDark ? '#0c4a6e' : '#ffffff';
      baseStyles.text = isDark ? '#bae6fd' : '#0c4a6e';
      baseStyles.accent = '#bae6fd';
      baseStyles.button = '#bae6fd';
      baseStyles.buttonText = isDark ? '#082f49' : '#ffffff';
      baseStyles.inputBg = isDark ? '#082f49' : '#ffffff';
    } else if (theme === 'ceramic-iznik') {
      baseStyles.bg = isDark ? '#450a0a' : '#fef2f2';
      baseStyles.card = isDark ? '#7f1d1d' : '#ffffff';
      baseStyles.text = isDark ? '#0ea5e9' : '#dc2626';
      baseStyles.accent = '#0ea5e9';
      baseStyles.button = '#0ea5e9';
      baseStyles.buttonText = isDark ? '#450a0a' : '#ffffff';
      baseStyles.inputBg = isDark ? '#450a0a' : '#ffffff';
    }

    return baseStyles;
  };

  const theme = getThemeStyles();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.bg }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.mainWrapper, isLargeScreen && styles.mainWrapperLarge]}>
          
          {/* Right Side: Manual Login & Branding */}
          <View style={[styles.loginSection, isLargeScreen && styles.loginSectionLarge]}>
            
            {/* Manual Login Card */}
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrapper, { backgroundColor: theme.accent + '33' }]}>
                  <KeyRound size={24} color={theme.accent} />
                </View>
                <Text style={[styles.cardTitle, { color: theme.text }]}>تسجيل الدخول الآمن</Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.text + 'cc' }]}>معرف المستخدم / رمز الدخول</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.accent + '66', color: theme.text }]}
                    value={manualId}
                    onChangeText={(text) => {
                      setManualId(text);
                      setError('');
                    }}
                    placeholder="أدخل المعرف الخاص بك..."
                    placeholderTextColor={theme.text + '66'}
                    autoCapitalize="none"
                  />
                </View>

                {error ? (
                  <View style={styles.errorContainer}>
                    <ShieldCheck size={20} color="#ef4444" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[styles.loginButton, { backgroundColor: theme.button }]}
                  onPress={handleManualLogin}
                >
                  <LogIn size={24} color={theme.buttonText} />
                  <Text style={[styles.loginButtonText, { color: theme.buttonText }]}>تسجيل الدخول</Text>
                </TouchableOpacity>
              </View>

              {/* Mobile Toggle for Quick Select */}
              {!isLargeScreen && (
                <TouchableOpacity
                  onPress={() => setShowQuickSelect(!showQuickSelect)}
                  style={styles.quickSelectToggle}
                >
                  <UserCircle size={20} color={theme.text + '99'} />
                  <Text style={[styles.quickSelectToggleText, { color: theme.text + '99' }]}>
                    {showQuickSelect ? 'إخفاء قائمة المستخدمين' : 'إظهار قائمة المستخدمين'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Branding Section */}
            <View style={styles.brandingSection}>
              <View style={styles.brandingHeader}>
                <TouchableOpacity
                  onPress={() => setIsBrandingCollapsed(!isBrandingCollapsed)}
                  style={[styles.logoBox, { backgroundColor: theme.button, borderColor: theme.accent + '33' }]}
                >
                  <Building2 size={isLargeScreen ? 48 : 32} color={theme.buttonText} />
                </TouchableOpacity>
                {!isBrandingCollapsed && (
                  <View style={styles.brandingText}>
                    <Text style={[styles.hotelName, { color: theme.text }]}>
                      فندق <Text style={{ color: theme.accent }}>الجزائر</Text>
                    </Text>
                    <Text style={[styles.hotelSlogan, { color: theme.text + 'b3' }]}>نظام الإدارة الفندقية المتكامل</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* User List Section */}
          {(showQuickSelect || isLargeScreen) && (
            <View style={[styles.userListSection, isLargeScreen && styles.userListSectionLarge]}>
              <View style={[styles.userListCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <View style={styles.userListHeader}>
                  <UserCircle size={24} color={theme.accent} />
                  <Text style={[styles.userListTitle, { color: theme.text }]}>اختيار سريع (للتجربة)</Text>
                  {!isLargeScreen && (
                    <TouchableOpacity onPress={() => setShowQuickSelect(false)}>
                      <ChevronDown size={24} color={theme.text} />
                    </TouchableOpacity>
                  )}
                </View>

                <ScrollView style={styles.userListScroll}>
                  {Object.entries(groupedUsers).map(([dept, deptUsers]) => (
                    <View key={dept} style={styles.deptGroup}>
                      <TouchableOpacity
                        onPress={() => setSelectedDept(selectedDept === dept ? null : dept)}
                        style={[styles.deptHeader, { backgroundColor: theme.text + '1a' }]}
                      >
                        <View style={styles.deptHeaderLeft}>
                          <View style={[styles.deptDot, { backgroundColor: theme.accent }]} />
                          <Text style={[styles.deptTitle, { color: theme.text }]}>{dept.replace('_', ' ')}</Text>
                        </View>
                        {selectedDept === dept ? (
                          <ChevronUp size={16} color={theme.text} />
                        ) : (
                          <ChevronDown size={16} color={theme.text} />
                        )}
                      </TouchableOpacity>

                      {(selectedDept === dept || isLargeScreen) && (
                        <View style={styles.deptUsers}>
                          {deptUsers.map((user: User) => (
                            <TouchableOpacity
                              key={user.id}
                              onPress={() => handleLogin(user.id)}
                              style={[styles.userCard, { backgroundColor: theme.userCard, borderColor: theme.userCardBorder }]}
                            >
                              <View style={[styles.avatarWrapper, { backgroundColor: theme.accent + '33', borderColor: theme.accent }]}>
                                {user.avatar ? (
                                  <Image source={{ uri: user.avatar }} style={styles.avatar} />
                                ) : (
                                  <UserCircle size={28} color={theme.text} />
                                )}
                              </View>
                              <View style={styles.userInfo}>
                                <Text style={[styles.userName, { color: theme.text }]}>{user.name}</Text>
                                <View style={styles.userRoleWrapper}>
                                  <ShieldCheck size={14} color={theme.text + 'b3'} />
                                  <Text style={[styles.userRole, { color: theme.text + 'b3' }]}>{user.role}</Text>
                                </View>
                              </View>
                              <View style={[styles.loginIconWrapper, { backgroundColor: theme.button + '33' }]}>
                                <LogIn size={16} color={theme.button} />
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  mainWrapper: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  mainWrapperLarge: {
    flexDirection: 'row-reverse',
    gap: 32,
  },
  loginSection: {
    flex: 1,
    marginBottom: 24,
  },
  loginSectionLarge: {
    marginBottom: 0,
  },
  card: {
    borderRadius: 40,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconWrapper: {
    padding: 8,
    borderRadius: 12,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  input: {
    height: 60,
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  errorContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    gap: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
    flex: 1,
  },
  loginButton: {
    height: 60,
    borderRadius: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickSelectToggle: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  quickSelectToggleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  brandingSection: {
    alignItems: 'center',
  },
  brandingHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 16,
  },
  logoBox: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  brandingText: {
    alignItems: 'flex-end',
  },
  hotelName: {
    fontSize: 32,
    fontWeight: '900',
  },
  hotelSlogan: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  userListSection: {
    flex: 1,
  },
  userListSectionLarge: {
    maxWidth: 450,
  },
  userListCard: {
    borderRadius: 40,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    height: isLargeScreen ? height - 100 : undefined,
  },
  userListHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  userListTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
    marginRight: 12,
  },
  userListScroll: {
    flex: 1,
  },
  deptGroup: {
    marginBottom: 16,
  },
  deptHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  deptHeaderLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  deptDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deptTitle: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  deptUsers: {
    gap: 8,
  },
  userCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userRoleWrapper: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  userRole: {
    fontSize: 12,
    fontWeight: '500',
  },
  loginIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LoginPage;
