import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useHotel } from '../context/HotelContext';
import { X } from 'lucide-react';

const { width, height } = Dimensions.get('window');

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  className?: string;
  icon?: React.ElementType;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  icon: Icon,
}) => {
  const { settings } = useHotel();

  const getModalWidth = () => {
    if (width < 768) return width * 0.95;
    switch (size) {
      case 'sm': return 400;
      case 'md': return 600;
      case 'lg': return 800;
      case 'xl': return 1000;
      case 'full': return width * 0.98;
      default: return 600;
    }
  };

  const getThemeColors = () => {
    if (settings.darkMode) {
      return {
        overlay: 'rgba(0, 0, 0, 0.8)',
        container: '#1f2937',
        header: '#111827',
        text: '#f9fafb',
        border: '#374151',
        closeBg: '#374151',
      };
    }
    return {
      overlay: 'rgba(0, 0, 0, 0.5)',
      container: '#ffffff',
      header: '#f9fafb',
      text: '#111827',
      border: '#e5e7eb',
      closeBg: '#f3f4f6',
    };
  };

  const colors = getThemeColors();

  return (
    <RNModal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={styles.dismissArea}
        />
        
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.container,
              width: getModalWidth(),
              maxHeight: height * 0.9,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
            <View style={styles.headerTitleContainer}>
              {Icon && <Icon size={24} color={colors.text} style={styles.headerIcon} />}
              {typeof title === 'string' ? (
                <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
              ) : (
                title
              )}
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.closeBg }]}
            >
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            {children}
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
});
