import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import {
  Edit2,
  Check,
  X,
  ArrowRight,
  Crown,
  Shield,
  Headphones,
  User,
  Hexagon,
  ChefHat,
  Coffee,
  ChevronRight,
  CornerUpRight,
} from 'lucide-react';

interface PageHeaderProps {
  pageKey?: string;
  defaultTitle?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  icon?: React.ElementType;
  onBack?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  pageKey, 
  defaultTitle, 
  title: propTitle, 
  subtitle: propSubtitle, 
  icon: Icon 
}) => {
  const { settings, updatePageTitle, currentUser } = useHotel();
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  const currentTitle = propTitle || (pageKey ? (settings.pageTitles[pageKey] || defaultTitle) : defaultTitle) || '';
  const canEdit = pageKey && (currentUser?.role === 'manager' || currentUser?.permissions.canCustomizeTitles);

  const handleBack = () => {
    window.dispatchEvent(new Event('go-back'));
  };

  const handleEditClick = () => {
    setTempTitle(currentTitle);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (tempTitle.trim() && pageKey) {
      updatePageTitle(pageKey, tempTitle);
    }
    setIsEditing(false);
  };

  const handleProfileClick = () => {
    window.dispatchEvent(new CustomEvent('navigate-to', { detail: 'user_profile' }));
  };

  const getUserRoleLabel = (role?: string) => {
    switch (role) {
      case 'manager': return 'المدير العام';
      case 'assistant_manager': return 'مساعد إداري';
      case 'receptionist': return 'موظف استقبال';
      case 'restaurant_manager': return 'مدير المطعم';
      case 'cafe_manager': return 'مدير المقهى';
      default: return 'موظف';
    }
  };

  const getUserRoleIcon = (role?: string) => {
    switch (role) {
      case 'manager': return <Crown className="w-4 h-4 text-amber-400" />;
      case 'assistant_manager': return <Shield className="w-4 h-4 text-gray-500" />;
      case 'restaurant_manager': return <ChefHat className="w-4 h-4 text-gray-500" />;
      case 'cafe_manager': return <Coffee className="w-4 h-4 text-gray-500" />;
      default: return <Headphones className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className={`flex flex-col md:flex-row-reverse items-center justify-between p-4 rounded-[2rem] border shadow-sm mb-6 transition-colors ${
      settings.darkMode ? 'bg-gray-800 border-gray-700 text-gray-50' : 'bg-white border-gray-200 text-gray-900'
    }`} dir="rtl">
      
      {/* User Profile Section */}
      {currentUser && (
        <button onClick={handleProfileClick} className="flex items-center gap-4 p-2 hover:bg-black/5 rounded-2xl transition-colors">
          <div className="text-right">
            <p className="text-base font-black">{currentUser.name}</p>
            <div className="flex items-center gap-1.5 justify-end bg-black/5 px-2 py-0.5 rounded-lg mt-0.5">
              <span className="text-[10px] font-bold text-gray-500">{getUserRoleLabel(currentUser.role)}</span>
              {getUserRoleIcon(currentUser.role)}
            </div>
          </div>
          <div className="relative">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm object-cover" referrerPolicy="no-referrer" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>
        </button>
      )}

      {/* Title Section */}
      <div className="flex items-center gap-4 flex-1 w-full md:w-auto mt-4 md:mt-0">
        {Icon && (
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
        
        <div className="flex-1 text-right">
          {isEditing ? (
            <div className="flex items-center gap-2 justify-end">
              <input
                type="text"
                className="bg-transparent border-b border-blue-500 text-lg font-black outline-none px-1 text-right"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                autoFocus
              />
              <button onClick={handleSave} className="p-1 hover:bg-green-50 rounded-lg"><Check className="w-5 h-5 text-green-500" /></button>
              <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-red-50 rounded-lg"><X className="w-5 h-5 text-red-500" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2 justify-end">
              <div className="flex flex-col items-end">
                <h2 className="text-xl font-black">{currentTitle}</h2>
                {propSubtitle && <p className="text-xs text-gray-500">{propSubtitle}</p>}
              </div>
              {canEdit && (
                <button onClick={handleEditClick} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>
          )}
        </div>

        {pageKey !== 'dashboard' && (
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <CornerUpRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};
