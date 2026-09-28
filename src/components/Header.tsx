import React from 'react';
import { 
  Printer, 
  PlusCircle, 
  Save, 
  History, 
  Sparkles, 
  School, 
  GraduationCap, 
  Building2, 
  Database,
  LogOut,
  User,
  UserCheck,
  Award
} from 'lucide-react';
import type { UserRole, AuthUser } from '../types';

interface HeaderProps {
  userRole: UserRole;
  currentUser: AuthUser | null;
  onRoleChange: (role: UserRole) => void;
  onLogout: () => void;
  onNewPlan: () => void;
  onPrint: () => void;
  onSave: () => void;
  onOpenHistory: () => void;
  onLoadSample: () => void;
  onOpenGitHubSync: () => void;
  savedCount: number;
  pendingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  userRole,
  currentUser,
  onRoleChange,
  onLogout,
  onNewPlan,
  onPrint,
  onSave,
  onOpenHistory,
  onLoadSample,
  onOpenGitHubSync,
  savedCount,
  pendingCount
}) => {
  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Header Bar */}
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center shadow-md shadow-red-500/20 shrink-0">
              <School className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  MEB & EBA ODOS Uyumlu
                </span>
                <span className="hidden md:inline-block text-xs font-medium text-slate-500">
                  Zeynep Kamil İlkokulu
                </span>
              </div>
              <h1 className="text-sm sm:text-base lg:text-lg font-black tracking-tight text-slate-900 truncate">
                Okul Dışı Öğrenme Gezi Planı ve İzin Dilekçesi
              </h1>
            </div>
          </div>

          {/* User Profile & Role Switcher in Header */}
          <div className="hidden lg:flex items-center gap-2">
            
            {/* Logged in User Badge */}
            {currentUser && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center font-bold text-slate-700 shadow-xs">
                  {currentUser.role === 'ogretmen' ? <GraduationCap className="w-4 h-4 text-red-600" /> :
                   currentUser.role === 'memur' ? <UserCheck className="w-4 h-4 text-amber-600" /> :
                   currentUser.role === 'mudur_yardimcisi' ? <Building2 className="w-4 h-4 text-indigo-600" /> :
                   <Award className="w-4 h-4 text-red-700" />}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block truncate max-w-[140px]">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                    {currentUser.role === 'ogretmen' ? currentUser.email : (currentUser.title || 'Okul İdaresi')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition ml-1 cursor-pointer"
                  title="Hesaptan Çıkış Yap / Profil Değiştir"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Quick Role Switcher */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => onRoleChange('ogretmen')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  userRole === 'ogretmen'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-rose-600" />
                <span>Öğretmen</span>
              </button>

              <button
                type="button"
                onClick={() => onRoleChange('okul_idaresi')}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  userRole === 'okul_idaresi'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>İdare Onay Masası</span>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* New Form (Reset) */}
            <button
              onClick={onNewPlan}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Yeni Boş Gezi Planı Başlat"
            >
              <PlusCircle className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Yeni Plan</span>
            </button>

            {/* Load Sample */}
            <button
              onClick={onLoadSample}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
              title="Örnek Veri ile Doldur"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Örnek</span>
            </button>

            {/* GitHub Sync Button */}
            <button
              onClick={onOpenGitHubSync}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
              title="GitHub Bulut Veritabanı ile Eşitle"
            >
              <Database className="w-4 h-4 text-indigo-600" />
              <span className="hidden lg:inline">GitHub DB</span>
            </button>

            {/* Save to LocalStorage */}
            <button
              onClick={onSave}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
              title="Tarayıcı Hafızasına Kaydet"
            >
              <Save className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Kaydet</span>
            </button>

            {/* History */}
            <button
              onClick={onOpenHistory}
              type="button"
              className="relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Kayıtlı Planlarımı Gör"
            >
              <History className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Geçmiş</span>
              {savedCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Primary Print Button */}
            <button
              onClick={onPrint}
              type="button"
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-md shadow-red-500/25 rounded-lg transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Yazdır / PDF</span>
            </button>
          </div>

        </div>

        {/* Mobile Subheader Bar */}
        <div className="lg:hidden flex items-center justify-between p-2 bg-slate-100 rounded-xl border border-slate-200 mb-2 gap-2">
          {currentUser && (
            <div className="flex items-center gap-1.5 text-xs truncate">
              <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="font-bold text-slate-900 truncate">{currentUser.fullName}</span>
              <span className="text-[10px] text-slate-500">
                ({currentUser.role === 'ogretmen' ? currentUser.email : (currentUser.title || 'Okul İdaresi')})
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onRoleChange(userRole === 'ogretmen' ? 'okul_idaresi' : 'ogretmen')}
              className="px-2.5 py-1 text-xs font-bold bg-white text-slate-800 rounded-lg shadow-xs cursor-pointer"
            >
              {userRole === 'ogretmen' ? 'İdareye Geç' : 'Öğretmene Geç'}
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="p-1 text-slate-500 hover:text-red-600 cursor-pointer"
              title="Çıkış Yap"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
