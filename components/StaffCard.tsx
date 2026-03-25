import React from 'react';
import { User, Department } from '../types';
import { QrCode, MapPin, Calendar, Phone, Mail, Shield, Award, Crown } from 'lucide-react';
import { isZelligeTheme } from '../constants';

interface StaffCardProps {
  user: User;
  deptInfo: { label: string; color: string; bg: string; border: string; icon: any };
  settings: any;
  onClick?: () => void;
  onShowQR?: (user: User) => void;
}

export const StaffCard: React.FC<StaffCardProps> = ({ user, deptInfo, settings, onClick, onShowQR }) => {
  const isZellige = isZelligeTheme(settings.theme);
  const isDark = settings.darkMode;

  // Use real code or fallback
  const employeeId = user.code || user.id.replace(/\D/g, '').padEnd(6, '0').slice(0, 6);

  const getRankColor = (rank?: string) => {
      switch(rank) {
          case 'General Manager': return 'text-purple-600 bg-purple-100 border-purple-200';
          case 'Department Head': return 'text-blue-600 bg-blue-100 border-blue-200';
          case 'Senior Staff': return 'text-green-600 bg-green-100 border-green-200';
          case 'Junior Staff': return 'text-orange-600 bg-orange-100 border-orange-200';
          case 'Trainee': return 'text-gray-600 bg-gray-100 border-gray-200';
          default: return 'text-gray-600 bg-gray-100 border-gray-200';
      }
  };

  const rankStyle = getRankColor(user.rank);

  const getCardBaseClass = () => {
      if (settings.theme === 'ceramic-talavera') return isDark ? "bg-[#0f172a] border-[#f59e0b]/40 text-[#f59e0b]" : "bg-[#fffbeb] border-[#f59e0b]/40 text-[#1e3a8a]";
      if (settings.theme === 'ceramic-majolica') return isDark ? "bg-[#052e16] border-[#facc15]/40 text-[#facc15]" : "bg-[#fefce8] border-[#facc15]/40 text-[#15803d]";
      if (settings.theme === 'ceramic-delft') return isDark ? "bg-[#082f49] border-[#bae6fd]/40 text-[#bae6fd]" : "bg-[#f0f9ff] border-[#bae6fd]/40 text-[#0c4a6e]";
      if (settings.theme === 'ceramic-iznik') return isDark ? "bg-[#450a0a] border-[#0ea5e9]/40 text-[#0ea5e9]" : "bg-[#fef2f2] border-[#0ea5e9]/40 text-[#dc2626]";
      
      if (settings.theme === 'zellige-algiers') return isDark ? "bg-[#0f172a] border-[#60a5fa]/40 text-[#60a5fa]" : "bg-[#eff6ff] border-[#1e3a8a]/40 text-[#1e3a8a]";
      if (settings.theme === 'zellige-tlemcen') return isDark ? "bg-[#271c19] border-[#b45309]/40 text-[#b45309]" : "bg-[#fffbeb] border-[#7c2d12]/40 text-[#7c2d12]";
      if (settings.theme === 'zellige-sahara') return isDark ? "bg-[#2a1b12] border-[#d97706]/40 text-[#d97706]" : "bg-[#fff7ed] border-[#c2410c]/40 text-[#c2410c]";

      if (isZellige) return isDark ? "bg-[#001e21] border-[#cca43b]/40 text-[#cca43b]" : "bg-[#FDFBF7] border-[#cca43b]/40 text-[#006269]";
      return isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-800";
  };

  const getZelligePatternClass = () => {
      if (settings.theme === 'zellige') return 'bg-zellige-pattern';
      if (settings.theme === 'zellige-v2') return 'bg-zellige-v2-pattern';
      if (settings.theme === 'zellige-algiers') return 'bg-zellige-algiers-pattern';
      if (settings.theme === 'zellige-tlemcen') return 'bg-zellige-tlemcen-pattern';
      if (settings.theme === 'zellige-sahara') return 'bg-zellige-sahara-pattern';
      if (settings.theme === 'ceramic-talavera') return 'bg-zellige-pattern';
      if (settings.theme === 'ceramic-majolica') return 'bg-zellige-pattern';
      if (settings.theme === 'ceramic-delft') return 'bg-zellige-pattern';
      if (settings.theme === 'ceramic-iznik') return 'bg-zellige-pattern';
      return 'bg-zellige-pattern';
  };

  const cardBaseClass = getCardBaseClass();

  const patternClass = isZellige 
    ? (isDark ? `${getZelligePatternClass()} opacity-10 mix-blend-screen` : `${getZelligePatternClass()} opacity-5 mix-blend-multiply`)
    : "";

  return (
    <div 
      onClick={onClick}
      className={`relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden border shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer group ${cardBaseClass}`}
    >
      {/* Background Pattern */}
      <div className={`absolute inset-0 pointer-events-none ${patternClass}`}></div>
      
      {/* Header Band */}
      <div className={`absolute top-0 left-0 right-0 h-16 ${
          settings.theme === 'ceramic-talavera' ? (isDark ? 'bg-[#1e3a8a]/80' : 'bg-[#1e3a8a]/10') :
          settings.theme === 'ceramic-majolica' ? (isDark ? 'bg-[#15803d]/80' : 'bg-[#15803d]/10') :
          settings.theme === 'ceramic-delft' ? (isDark ? 'bg-[#0c4a6e]/80' : 'bg-[#0c4a6e]/10') :
          settings.theme === 'ceramic-iznik' ? (isDark ? 'bg-[#7f1d1d]/80' : 'bg-[#dc2626]/10') :
          settings.theme === 'zellige-algiers' ? (isDark ? 'bg-[#1e3a8a]/80' : 'bg-[#1e3a8a]/10') :
          settings.theme === 'zellige-tlemcen' ? (isDark ? 'bg-[#451a03]/80' : 'bg-[#7c2d12]/10') :
          settings.theme === 'zellige-sahara' ? (isDark ? 'bg-[#431407]/80' : 'bg-[#c2410c]/10') :
          isZellige ? (isDark ? 'bg-[#002a2d]/80' : 'bg-[#006269]/10') : 'bg-gray-100 dark:bg-gray-700'
      } backdrop-blur-sm border-b ${
          settings.theme === 'ceramic-talavera' ? 'border-[#f59e0b]/20' :
          settings.theme === 'ceramic-majolica' ? 'border-[#facc15]/20' :
          settings.theme === 'ceramic-delft' ? 'border-[#bae6fd]/20' :
          settings.theme === 'ceramic-iznik' ? 'border-[#0ea5e9]/20' :
          settings.theme === 'zellige-algiers' ? 'border-[#60a5fa]/20' :
          settings.theme === 'zellige-tlemcen' ? 'border-[#b45309]/20' :
          settings.theme === 'zellige-sahara' ? 'border-[#d97706]/20' :
          isZellige ? 'border-[#cca43b]/20' : 'border-gray-200 dark:border-gray-600'
      }`}></div>

      <div className="relative z-10 p-4 h-full flex flex-col">
        
        {/* Top Section */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <div className={`w-16 h-16 rounded-xl overflow-hidden border-2 shadow-md ${
                settings.theme === 'ceramic-talavera' ? 'border-[#f59e0b]' :
                settings.theme === 'ceramic-majolica' ? 'border-[#facc15]' :
                settings.theme === 'ceramic-delft' ? 'border-[#bae6fd]' :
                settings.theme === 'ceramic-iznik' ? 'border-[#0ea5e9]' :
                settings.theme === 'zellige-algiers' ? 'border-[#60a5fa]' :
                settings.theme === 'zellige-tlemcen' ? 'border-[#b45309]' :
                settings.theme === 'zellige-sahara' ? 'border-[#d97706]' :
                isZellige ? 'border-[#cca43b]' : 'border-white dark:border-gray-600'
            }`}>
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-black text-lg leading-tight">{user.name.split('(')[0]}</h3>
              <p className={`text-xs font-bold opacity-80 uppercase tracking-wider`}>{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          <div className="text-right">
             <button onClick={(e) => { e.stopPropagation(); onShowQR?.(user); }} className="hover:scale-110 transition-transform">
                <QrCode size={32} className={`opacity-80 ${
                    settings.theme === 'ceramic-talavera' ? 'text-[#f59e0b]' :
                    settings.theme === 'ceramic-majolica' ? 'text-[#facc15]' :
                    settings.theme === 'ceramic-delft' ? 'text-[#bae6fd]' :
                    settings.theme === 'ceramic-iznik' ? 'text-[#0ea5e9]' :
                    settings.theme === 'zellige-algiers' ? 'text-[#60a5fa]' :
                    settings.theme === 'zellige-tlemcen' ? 'text-[#b45309]' :
                    settings.theme === 'zellige-sahara' ? 'text-[#d97706]' :
                    isZellige ? 'text-[#cca43b]' : 'text-gray-400'
                }`} />
             </button>
          </div>
        </div>

        {/* Middle Section - Details */}
        <div className="flex-1 flex flex-col justify-center gap-2 text-[10px] font-medium opacity-90 pl-1 mt-2">
          <div className="flex items-center gap-2">
            <Shield size={12} />
            <span>ID: <span className="font-mono font-bold text-xs">{employeeId}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Award size={12} />
            <span>{deptInfo.label}</span>
          </div>
          {user.rank && (
              <div className={`flex items-center gap-2 px-2 py-1 rounded-lg border w-fit ${rankStyle}`}>
                <Crown size={12} />
                <span className="font-bold">{user.rank}</span>
              </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar size={12} />
            <span>Joined: {new Date(user.joinDate || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Bottom Section - Status */}
        <div className="flex justify-between items-end mt-auto pt-2 border-t border-current/10">
           <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${user.isBlocked ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
             {user.isBlocked ? 'SUSPENDED' : 'ACTIVE'}
           </div>
           <div className="text-[8px] opacity-60 font-mono tracking-widest">
             AUTHORIZED PERSONNEL
           </div>
        </div>

      </div>
      
      {/* Holographic Effect Overlay (Simulated) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mix-blend-overlay"></div>
    </div>
  );
};
