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
  Check,
  Briefcase
} from 'lucide-react';

interface AuthLoginScreenProps {
  onLogin: (user: AuthUser) => void;
}

type MainCategory = 'ogretmen' | 'idare';

const STORAGE_REMEMBER_AUTH_V3 = 'odos_remembered_auth_profile_v3';

interface AdminTitleOption {
  id: UserRole;
  title: string;
  subtitle: string;
  defaultName: string;
  icon: React.ReactNode;
  badge: string;
}

export const AuthLoginScreen: React.FC<AuthLoginScreenProps> = ({ onLogin }) => {
  // 1. Ana Giriş Seçeneği: 'ogretmen' | 'idare'
  const [mainCategory, setMainCategory] = useState<MainCategory>('ogretmen');

  // 2. Okul İdaresi İçin Seçili Alt Ünvan
  const [selectedAdminRole, setSelectedAdminRole] = useState<UserRole>('mudur_yardimcisi');

  // 3. Ortak Bilgiler
  const [fullName, setFullName] = useState<string>('Ali Serkan KAYA');
  const [email, setEmail] = useState<string>('ogretmen@meb.k12.tr');
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  const ADMIN_TITLE_OPTIONS: AdminTitleOption[] = [
    {
      id: 'memur',
      title: '1. Evrak Kayıt Memuru',
      subtitle: 'Ön İnceleme & Evrak Kayıt',
      defaultName: 'Evrak Kayıt Memuru',
      icon: <UserCheck className="w-5 h-5 text-amber-600" />,
      badge: '1. İnceleme'
    },
    {
      id: 'mudur_yardimcisi',
      title: '2. Müdür Yardımcısı',
      subtitle: 'Fudan FİDAN (Sosyal Etkinlikler Kurulu Bşk.)',
      defaultName: 'Fudan FİDAN',
      icon: <Building2 className="w-5 h-5 text-indigo-600" />,
      badge: '2. Uygun Görüş'
    },
    {
      id: 'okul_muduru',
      title: '3. Okul Müdürü',
      subtitle: 'Recep KIZILIRMAK (Makam Oluru)',
      defaultName: 'Recep KIZILIRMAK',
      icon: <Award className="w-5 h-5 text-red-700" />,
      badge: '3. Makam Oluru'
    }
  ];

  // Hatırlanan verileri yükle
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_REMEMBER_AUTH_V3);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.mainCategory) {
          setMainCategory(parsed.mainCategory);
        }
        if (parsed.adminRole) {
          setSelectedAdminRole(parsed.adminRole);
        }
        if (parsed.fullName) setFullName(parsed.fullName);
        if (parsed.email) setEmail(parsed.email);
      }
    } catch (_) {}
  }, []);

  // Ana Kategori (Öğretmen / Okul İdaresi) değiştiğinde varsayılanları güncelle
  const handleSelectMainCategory = (cat: MainCategory) => {
    setMainCategory(cat);
    if (cat === 'ogretmen') {
      setFullName('Ali Serkan KAYA');
      setEmail('ogretmen@meb.k12.tr');
    } else {
      // İdare varsayılanı
      const found = ADMIN_TITLE_OPTIONS.find(o => o.id === selectedAdminRole) || ADMIN_TITLE_OPTIONS[1];
      setFullName(found.defaultName);
      setEmail(DEFAULT_SCHOOL_EMAIL);
    }
  };

  // İdare alt ünvanı seçildiğinde
  const handleSelectAdminTitle = (opt: AdminTitleOption) => {
    setSelectedAdminRole(opt.id);
    setFullName(opt.defaultName);
    if (!email || email === 'ogretmen@meb.k12.tr') {
      setEmail(DEFAULT_SCHOOL_EMAIL);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      alert('Lütfen Adınızı ve Soyadınızı giriniz.');
      return;
    }
    if (!email.trim()) {
      alert('Lütfen zorunlu E-posta adresinizi giriniz.');
      return;
    }

    const effectiveRole: UserRole = mainCategory === 'ogretmen' ? 'ogretmen' : selectedAdminRole;

    if (rememberMe) {
      localStorage.setItem(STORAGE_REMEMBER_AUTH_V3, JSON.stringify({
        mainCategory,
        adminRole: selectedAdminRole,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase()
      }));
    } else {
      localStorage.removeItem(STORAGE_REMEMBER_AUTH_V3);
    }

    let title = 'Öğretmen / Kafile Başkanı';
    if (mainCategory === 'idare') {
      if (selectedAdminRole === 'memur') title = 'Evrak Kayıt Memuru';
      else if (selectedAdminRole === 'mudur_yardimcisi') title = 'Müdür Yardımcısı (Sosyal Etkinlikler Kurulu Bşk.)';
      else if (selectedAdminRole === 'okul_muduru') title = 'Okul Müdürü (Makam Oluru)';
      else title = 'Okul İdaresi';
    }

    onLogin({
      email: email.trim().toLowerCase(),
      fullName: fullName.trim(),
      role: effectiveRole,
      title
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 selection:bg-red-500 selection:text-white">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-slate-100/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Üst Başlık ve Kurum Kimliği */}
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
          <p className="text-xs sm:text-sm text-red-100 mt-0.5 max-w-md mx-auto font-medium">
            Okul Dışı Öğrenme Gezi Planı Hazırlama, Kademeli Onay Masası ve Raporlama Sistemi
          </p>
        </div>

        {/* Giriş Formu */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          
          {/* 1. ANA GİRİŞ SEÇENEĞİ (2 SEÇENEKLİ: ÖĞRETMEN / OKUL İDARESİ) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
              Giriş Türü Seçiniz: <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Seçenek 1: Öğretmen / Kafile Başkanı */}
              <button
                type="button"
                onClick={() => handleSelectMainCategory('ogretmen')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                  mainCategory === 'ogretmen'
                    ? 'border-rose-600 bg-rose-50/70 shadow-md ring-2 ring-rose-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-start justify-between w-full mb-2">
                  <div className="p-2.5 rounded-xl bg-white shadow-xs border border-slate-100 text-rose-600">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  {mainCategory === 'ogretmen' && (
                    <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <div>
                  <h3 className={`text-sm font-extrabold ${mainCategory === 'ogretmen' ? 'text-rose-950' : 'text-slate-800'}`}>
                    Öğretmen / Kafile Bşk.
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                    Plan Hazırla, Onaya Gönder & Süreç Takip Et
                  </p>
                </div>
              </button>

              {/* Seçenek 2: Okul İdaresi */}
              <button
                type="button"
                onClick={() => handleSelectMainCategory('idare')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                  mainCategory === 'idare'
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-md ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-start justify-between w-full mb-2">
                  <div className="p-2.5 rounded-xl bg-white shadow-xs border border-slate-100 text-indigo-600">
                    <Building2 className="w-6 h-6" />
                  </div>
                  {mainCategory === 'idare' && (
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <div>
                  <h3 className={`text-sm font-extrabold ${mainCategory === 'idare' ? 'text-indigo-950' : 'text-slate-800'}`}>
                    Okul İdaresi
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                    Evrak Kayıt, Md. Yrd., Okul Müdürü & Raporlama
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. OKUL İDARESİ SEÇİLDİĞİNDE GÖRÜNEN ÜNVANLAR */}
          {mainCategory === 'idare' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-indigo-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                <span>İdari Ünvanınızı Seçiniz: <span className="text-red-500">*</span></span>
              </label>

              <div className="space-y-2">
                {ADMIN_TITLE_OPTIONS.map((opt) => {
                  const isSelected = selectedAdminRole === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectAdminTitle(opt)}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-white ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 bg-white/60 hover:bg-white text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-slate-100 shrink-0">
                          {opt.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs block truncate ${isSelected ? 'font-black text-indigo-950' : 'font-bold text-slate-700'}`}>
                              {opt.title}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                              {opt.badge}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                            {opt.subtitle}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. AD SOYAD GİRİŞİ */}
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
              placeholder={mainCategory === 'ogretmen' ? 'Örn: Ali Serkan KAYA' : 'Örn: Recep KIZILIRMAK'}
              className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-slate-50 focus:bg-white"
            />
          </div>

          {/* 4. ZORUNLU E-POSTA GİRİŞİ */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>Zorunlu E-Posta Adresiniz <span className="text-red-500">*</span></span>
              </span>
              {mainCategory === 'idare' && (
                <button
                  type="button"
                  onClick={() => setEmail(DEFAULT_SCHOOL_EMAIL)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold underline"
                >
                  Okul E-postasını Doldur
                </button>
              )}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={mainCategory === 'ogretmen' ? 'ornek@meb.k12.tr' : DEFAULT_SCHOOL_EMAIL}
              className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-slate-50 focus:bg-white"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              {mainCategory === 'ogretmen'
                ? '* Onaya gönderdiğiniz planlar, onay/iade bildirimleri ve teslim uyarıları bu e-postaya iletilir.'
                : '* Onaylanan veya iade edilen gezi evrakları, yasal süre hatırlatmaları ve raporlar bu e-postaya bilgi olarak iletilir.'}
            </span>
          </div>

          {/* 5. CİHAZDA HATIRLA */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="rememberAuth"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="rememberAuth" className="text-xs text-slate-600 font-medium cursor-pointer">
              Bu cihazda beni hatırla (Sonraki girişlerde otomatik doldur)
            </label>
          </div>

          {/* 6. GİRİŞ BUTONU */}
          <button
            type="submit"
            className={`w-full py-3.5 px-6 rounded-xl font-extrabold text-sm sm:text-base text-white shadow-xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2 ${
              mainCategory === 'ogretmen'
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-700 shadow-rose-500/25'
                : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-500/25'
            }`}
          >
            <span>{mainCategory === 'ogretmen' ? 'Öğretmen Girişi Yap' : 'Okul İdaresi Girişi Yap'}</span>
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
