import React, { useState, useEffect } from 'react';
import type { AuthUser, UserRole } from '../types';
import { DEFAULT_SCHOOL_EMAIL } from '../services/db';
import { 
  School, 
  GraduationCap, 
  Building2, 
  UserCheck, 
  Award, 
  Mail, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Check
} from 'lucide-react';

interface AuthLoginScreenProps {
  onLogin: (user: AuthUser) => void;
}

const STORAGE_REMEMBER_AUTH_V2 = 'odos_remembered_auth_profile_v2';

interface TitleOption {
  id: UserRole;
  title: string;
  subtitle: string;
  defaultName: string;
  defaultEmail: string;
  icon: React.ReactNode;
  borderActive: string;
  bgActive: string;
  badge: string;
}

export const AuthLoginScreen: React.FC<AuthLoginScreenProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('ogretmen');
  const [fullName, setFullName] = useState<string>('Ali Serkan KAYA');
  const [email, setEmail] = useState<string>('ogretmen@meb.k12.tr');
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  const TITLE_OPTIONS: TitleOption[] = [
    {
      id: 'ogretmen',
      title: 'Öğretmen / Kafile Bşk.',
      subtitle: 'Plan Hazırla & Takip Et',
      defaultName: 'Ali Serkan KAYA',
      defaultEmail: 'ogretmen@meb.k12.tr',
      icon: <GraduationCap className="w-5 h-5 text-rose-600" />,
      borderActive: 'border-rose-600 ring-2 ring-rose-500/30',
      bgActive: 'bg-rose-50/80',
      badge: 'Öğretmen'
    },
    {
      id: 'memur',
      title: '1. Evrak Kayıt Memuru',
      subtitle: 'Ön İnceleme & Kayıt',
      defaultName: 'Evrak Kayıt Memuru',
      defaultEmail: DEFAULT_SCHOOL_EMAIL,
      icon: <UserCheck className="w-5 h-5 text-amber-600" />,
      borderActive: 'border-amber-500 ring-2 ring-amber-500/30',
      bgActive: 'bg-amber-50/80',
      badge: '1. İnceleme'
    },
    {
      id: 'mudur_yardimcisi',
      title: '2. Müdür Yardımcısı',
      subtitle: 'Fudan FİDAN (Sosyal Etk.)',
      defaultName: 'Fudan FİDAN',
      defaultEmail: DEFAULT_SCHOOL_EMAIL,
      icon: <Building2 className="w-5 h-5 text-indigo-600" />,
      borderActive: 'border-indigo-600 ring-2 ring-indigo-500/30',
      bgActive: 'bg-indigo-50/80',
      badge: '2. Uygun Görüş'
    },
    {
      id: 'okul_muduru',
      title: '3. Okul Müdürü',
      subtitle: 'Recep KIZILIRMAK (Makam)',
      defaultName: 'Recep KIZILIRMAK',
      defaultEmail: DEFAULT_SCHOOL_EMAIL,
      icon: <Award className="w-5 h-5 text-red-700" />,
      borderActive: 'border-red-700 ring-2 ring-red-600/30',
      bgActive: 'bg-red-50/90',
      badge: '3. Makam Oluru'
    }
  ];

  // Load remembered credentials on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_REMEMBER_AUTH_V2);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role) setSelectedRole(parsed.role);
        if (parsed.fullName) setFullName(parsed.fullName);
        if (parsed.email) setEmail(parsed.email);
      }
    } catch (_) {}
  }, []);

  // Rol değiştiğinde varsayılanları ata
  const handleSelectRole = (opt: TitleOption) => {
    setSelectedRole(opt.id);
    setFullName(opt.defaultName);
    setEmail(opt.defaultEmail);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Lütfen Adınızı ve Soyadınızı giriniz.');
      return;
    }
    if (!email.trim()) {
      alert('Lütfen E-posta adresinizi giriniz.');
      return;
    }

    if (rememberMe) {
      localStorage.setItem(STORAGE_REMEMBER_AUTH_V2, JSON.stringify({
        role: selectedRole,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase()
      }));
    } else {
      localStorage.removeItem(STORAGE_REMEMBER_AUTH_V2);
    }

    let title = 'Öğretmen / Kafile Başkanı';
    if (selectedRole === 'memur') title = 'Evrak Kayıt Memuru';
    if (selectedRole === 'mudur_yardimcisi') title = 'Müdür Yardımcısı (Sosyal Etkinlikler Kurulu Bşk.)';
    if (selectedRole === 'okul_muduru') title = 'Okul Müdürü (Makam Oluru)';

    onLogin({
      email: email.trim().toLowerCase(),
      fullName: fullName.trim(),
      role: selectedRole,
      title
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 selection:bg-red-500 selection:text-white">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-slate-100/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 sm:p-7 text-white text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mx-auto mb-2.5 shadow-lg shadow-black/10">
            <School className="w-8 h-8 text-white" />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-0.5 rounded-full bg-white/20 text-red-100 border border-white/20">
            T.C. MİLLÎ EĞİTİM BAKANLIĞI • EBA ODOS UYUMLU
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1.5">
            Zeynep Kamil İlkokulu Gezi Portalı
          </h2>
          <p className="text-xs sm:text-sm text-red-100 mt-0.5 max-w-md mx-auto">
            Okul Dışı Öğrenme Gezi Planı Hazırlama, Kademeli İdare Onayı & Takip Sistemi
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          
          {/* ÜNVAN SEÇİMİ (Ana Girişte Sadece Ünvanlar) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
              Giriş Ünvanınızı Seçiniz: <span className="text-red-500">*</span>
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TITLE_OPTIONS.map((opt) => {
                const isSelected = selectedRole === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectRole(opt)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? `${opt.borderActive} ${opt.bgActive} shadow-sm`
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-white shadow-xs shrink-0">
                        {opt.icon}
                      </div>
                      <div className="min-w-0">
                        <span className={`text-xs block truncate ${isSelected ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                          {opt.title}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {opt.subtitle}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ad Soyad */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-500" />
              <span>Adınız ve Soyadınız <span className="text-red-500">*</span></span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Örn: Ali Serkan KAYA veya Recep KIZILIRMAK"
              className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition bg-slate-50 focus:bg-white"
            />
          </div>

          {/* E-Posta */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-500" />
              <span>E-Posta Adresiniz <span className="text-red-500">*</span></span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@meb.k12.tr veya zeynepkamililkokulu@gmail.com"
              className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition bg-slate-50 focus:bg-white"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              * Bu e-posta ile işlem geçmişiniz, onay bildirimleriniz ve resmi gezi raporlarınız takip edilir.
            </span>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="rememberAuth"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
            />
            <label htmlFor="rememberAuth" className="text-xs text-slate-600 font-medium cursor-pointer">
              Bu cihazda beni hatırla (Bir sonraki girişte otomatik doldur)
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-red-500/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>Sisteme Giriş Yap</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="text-center pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1 border-t border-slate-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Türkiye Yüzyılı Maarif Modeli & MEB Sosyal Etkinlikler Yönergesi</span>
          </div>

        </form>

      </div>
    </div>
  );
};
