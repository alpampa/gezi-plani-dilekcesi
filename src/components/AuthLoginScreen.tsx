import React, { useState, useEffect } from 'react';
import type { AuthUser, UserRole } from '../types';
import { DatabaseService } from '../services/db';
import { 
  School, 
  GraduationCap, 
  Building2, 
  Mail, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronDown
} from 'lucide-react';

interface AuthLoginScreenProps {
  onLogin: (user: AuthUser) => void;
}

type MainCategory = 'ogretmen' | 'idare';

const STORAGE_REMEMBER_AUTH_V4 = 'odos_remembered_auth_profile_v4';

interface AdminTitleOption {
  id: UserRole;
  title: string;
  defaultName: string;
  badge: string;
}

const ADMIN_TITLE_OPTIONS: AdminTitleOption[] = [
  {
    id: 'memur',
    title: '1. Evrak Kayıt Memuru — Sultan YILDIRIM (Ön İnceleme)',
    defaultName: 'Sultan YILDIRIM',
    badge: '1. İnceleme'
  },
  {
    id: 'mudur_yardimcisi',
    title: '2. Müdür Yardımcısı — Funda FİDAN (Sosyal Etk. Bşk.)',
    defaultName: 'Funda FİDAN',
    badge: '2. Uygun Görüş'
  },
  {
    id: 'okul_muduru',
    title: '3. Okul Müdürü — Recep KIZILIRMAK (Makam Oluru)',
    defaultName: 'Recep KIZILIRMAK',
    badge: '3. Makam Oluru'
  }
];

export const AuthLoginScreen: React.FC<AuthLoginScreenProps> = ({ onLogin }) => {
  // 1. Ana Giriş Seçeneği: 'ogretmen' | 'idare'
  const [mainCategory, setMainCategory] = useState<MainCategory>('ogretmen');

  // 2. Okul İdaresi İçin Seçili Alt Ünvan
  const [selectedAdminRole, setSelectedAdminRole] = useState<UserRole>('mudur_yardimcisi');

  // 3. Ortak Bilgiler (Öğretmen ad soyad girer; İdarede unvanın yanındaki isim otomatik kullanılır)
  const [teacherName, setTeacherName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  // Hatırlanan verileri yükle
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_REMEMBER_AUTH_V4);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.mainCategory) setMainCategory(parsed.mainCategory);
        if (parsed.adminRole) setSelectedAdminRole(parsed.adminRole);
        if (parsed.teacherName) setTeacherName(parsed.teacherName);
        if (parsed.email) setEmail(parsed.email);
        setRememberMe(true);
      }
    } catch (_) {}
  }, []);

  // E-posta girildiğinde geçmiş kayıtlardan öğretmenin doğru adını otomatik bul
  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    if (mainCategory === 'ogretmen' && (!teacherName.trim() || teacherName.trim().length < 3)) {
      try {
        const plans = DatabaseService.getPlans();
        const matchedPlan = plans.find(p => 
          p.teacherEmail?.toLowerCase() === newEmail.trim().toLowerCase() && 
          (p.submittedBy || p.headTeacher?.fullName)
        );
        if (matchedPlan) {
          const foundName = matchedPlan.submittedBy || matchedPlan.headTeacher?.fullName;
          if (foundName && foundName.trim()) {
            setTeacherName(foundName.trim());
          }
        }
      } catch (_) {}
    }
  };

  // Ana Kategori (Öğretmen / Okul İdaresi) değiştiğinde
  const handleSelectMainCategory = (cat: MainCategory) => {
    setMainCategory(cat);
  };

  // İdare Açılır Menü Ünvan Seçimi
  const handleAdminDropdownChange = (roleId: UserRole) => {
    setSelectedAdminRole(roleId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalFullName = '';

    if (mainCategory === 'ogretmen') {
      if (!teacherName.trim()) {
        alert('Lütfen Adınızı ve Soyadınızı giriniz.');
        return;
      }
      finalFullName = teacherName.trim();
    } else {
      const foundAdmin = ADMIN_TITLE_OPTIONS.find(o => o.id === selectedAdminRole);
      finalFullName = foundAdmin ? foundAdmin.defaultName : 'Okul İdaresi';
    }

    if (!email.trim()) {
      alert('Lütfen E-posta adresinizi giriniz.');
      return;
    }

    const effectiveRole: UserRole = mainCategory === 'ogretmen' ? 'ogretmen' : selectedAdminRole;

    if (rememberMe) {
      localStorage.setItem(STORAGE_REMEMBER_AUTH_V4, JSON.stringify({
        mainCategory,
        adminRole: selectedAdminRole,
        teacherName: teacherName.trim(),
        email: email.trim().toLowerCase()
      }));
    } else {
      localStorage.removeItem(STORAGE_REMEMBER_AUTH_V4);
    }

    let title = 'Öğretmen / Kafile Başkanı';
    if (mainCategory === 'idare') {
      if (selectedAdminRole === 'memur') title = 'Evrak Kayıt Memuru (Ön İnceleme)';
      else if (selectedAdminRole === 'mudur_yardimcisi') title = 'Müdür Yardımcısı (Sosyal Etkinlikler Kurulu Bşk.)';
      else if (selectedAdminRole === 'okul_muduru') title = 'Okul Müdürü (Makam Oluru)';
      else title = 'Okul İdaresi';
    }

    onLogin({
      email: email.trim().toLowerCase(),
      fullName: finalFullName,
      role: effectiveRole,
      title
    });
  };

  const selectedAdminObj = ADMIN_TITLE_OPTIONS.find(o => o.id === selectedAdminRole) || ADMIN_TITLE_OPTIONS[1];

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-3 sm:p-4 overflow-hidden selection:bg-red-500 selection:text-white">
      <div className="max-w-lg w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100/20 overflow-hidden flex flex-col max-h-[98vh] justify-between animate-in fade-in zoom-in-95 duration-200">
        
        {/* 1. Üst Kurumsal Başlık (Kompakt) */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-4 sm:p-5 text-white text-center relative shrink-0">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center mx-auto mb-1.5 shadow-sm">
            <School className="w-6 h-6 text-white" />
          </div>
          <span className="text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-red-100 border border-white/20 inline-block">
            T.C. MEB • EBA ODOS UYUMLU
          </span>
          <h2 className="text-base sm:text-lg font-black tracking-tight mt-1">
            Zeynep Kamil İlkokulu Gezi Portalı
          </h2>
          <p className="text-[11px] text-red-100 mt-0.5 font-medium">
            Gezi Planı, Kademeli İdare Onay & Rapor Masası
          </p>
        </div>

        {/* 2. MEB & Belediye Yasal Bildirim Uyarısı (Kompakt Tek Satır/Şerit) */}
        <div className="mx-4 sm:mx-6 mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <div className="text-[10px] sm:text-[11px] leading-tight font-semibold">
              <span className="font-black text-amber-950 uppercase">Bildirim Kuralı: </span>
              <span>Araç talepli geziler </span>
              <strong className="underline font-black text-amber-950">15 gün</strong>
              <span>, diğer geziler </span>
              <strong className="underline font-black text-amber-950">7 gün önce</strong>
              <span> okul idaresine bildirilmelidir.</span>
            </div>
          </div>
        </div>

        {/* 3. Giriş Formu (Kaydırmasız, Tam Ekran Uyumlu) */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-3.5 flex-1 flex flex-col justify-between">
          
          <div className="space-y-3">
            {/* 1. İki Seçenekli Ana Giriş Türü */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Giriş Türü: <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Seçenek 1: Öğretmen / Kafile Bşk. */}
                <button
                  type="button"
                  onClick={() => handleSelectMainCategory('ogretmen')}
                  className={`p-2.5 sm:p-3 rounded-xl border-2 text-left transition cursor-pointer flex items-center gap-2.5 ${
                    mainCategory === 'ogretmen'
                      ? 'border-rose-600 bg-rose-50/80 font-bold text-rose-950 ring-2 ring-rose-500/20 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-white shadow-xs text-rose-600 shrink-0">
                    <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-black block truncate">Öğretmen / Kafile</span>
                    <span className="text-[10px] text-slate-500 block truncate">Plan Hazırla & Takip</span>
                  </div>
                </button>

                {/* Seçenek 2: Okul İdaresi */}
                <button
                  type="button"
                  onClick={() => handleSelectMainCategory('idare')}
                  className={`p-2.5 sm:p-3 rounded-xl border-2 text-left transition cursor-pointer flex items-center gap-2.5 ${
                    mainCategory === 'idare'
                      ? 'border-indigo-600 bg-indigo-50/80 font-bold text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-white shadow-xs text-indigo-600 shrink-0">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-black block truncate">Okul İdaresi</span>
                    <span className="text-[10px] text-slate-500 block truncate">Onay & Rapor Masası</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Okul İdaresi Seçildiğinde Açılır Menü (Dropdown/Select) */}
            {mainCategory === 'idare' ? (
              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                <label className="block text-[10px] font-bold text-indigo-950 uppercase tracking-wider flex items-center justify-between">
                  <span>İdari Ünvan & Yetkili Seçiniz: <span className="text-red-500">*</span></span>
                  <span className="text-[9px] text-indigo-700 font-semibold">Açılır Menü</span>
                </label>

                <div className="relative">
                  <select
                    value={selectedAdminRole}
                    onChange={(e) => handleAdminDropdownChange(e.target.value as UserRole)}
                    className="w-full px-3 py-2 pr-8 text-xs font-bold rounded-lg border border-indigo-300 bg-white text-indigo-950 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                  >
                    {ADMIN_TITLE_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-indigo-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="flex items-center justify-between text-[11px] px-1 text-indigo-900 font-medium pt-0.5">
                  <span>Yetkili İdareci: <strong className="font-bold text-indigo-950">{selectedAdminObj.defaultName}</strong></span>
                  <span className="text-[10px] px-2 py-0.5 bg-indigo-200/80 text-indigo-900 rounded-md font-bold">{selectedAdminObj.badge}</span>
                </div>
              </div>
            ) : (
              /* 3. Öğretmen İçin Ad Soyad Girişi */
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Adınız ve Soyadınız <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Adınızı ve Soyadınızı giriniz..."
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>
            )}

            {/* 4. E-Posta (Varsayılan olarak boş, ilgili kişi yazacak) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>E-Posta Adresiniz <span className="text-red-500">*</span></span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="E-posta adresinizi giriniz (Örn: adiniz@meb.k12.tr)..."
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            {/* 5. Beni Hatırla (İsteğe Bağlı İşaretleme) */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="checkbox"
                id="rememberAuthV4"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="rememberAuthV4" className="text-[11px] text-slate-600 font-medium cursor-pointer select-none">
                Bilgilerimi bu cihazda hatırla (İsteğe bağlı)
              </label>
            </div>
          </div>

          {/* 6. Giriş Butonu & Alt Bilgi */}
          <div className="space-y-2 pt-1">
            <button
              type="submit"
              className={`w-full py-2.5 sm:py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm text-white shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                mainCategory === 'ogretmen'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-rose-500/20'
                  : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-500/20'
              }`}
            >
              <span>{mainCategory === 'ogretmen' ? 'Öğretmen Girişi Yap' : 'Okul İdaresi Girişi Yap'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>Türkiye Yüzyılı Maarif Modeli & Sosyal Etkinlikler Portalı</span>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
