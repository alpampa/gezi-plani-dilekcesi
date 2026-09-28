import React, { useState, useEffect } from 'react';
import type { AuthUser } from '../types';
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
  Sparkles,
  Lock
} from 'lucide-react';

interface AuthLoginScreenProps {
  onLogin: (user: AuthUser) => void;
}

const STORAGE_REMEMBER_TEACHER = 'odos_remembered_teacher_v1';
const STORAGE_REMEMBER_ADMIN = 'odos_remembered_admin_v1';
const STORAGE_LAST_LOGIN_TYPE = 'odos_last_login_type_v1';

export const AuthLoginScreen: React.FC<AuthLoginScreenProps> = ({ onLogin }) => {
  // Login Type Tab: 'ogretmen' | 'okul_idaresi'
  const [loginType, setLoginType] = useState<'ogretmen' | 'okul_idaresi'>('ogretmen');

  // Teacher State
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [rememberTeacher, setRememberTeacher] = useState(true);

  // Admin State
  const [adminTitleRole, setAdminTitleRole] = useState<'memur' | 'mudur_yardimcisi' | 'okul_muduru'>('memur');
  const [adminName, setAdminName] = useState('Evrak Kayıt Memuru');
  const [rememberAdmin, setRememberAdmin] = useState(true);

  // Load remembered credentials on mount
  useEffect(() => {
    try {
      const lastType = localStorage.getItem(STORAGE_LAST_LOGIN_TYPE) as 'ogretmen' | 'okul_idaresi' | null;
      if (lastType) setLoginType(lastType);

      const savedTeacher = localStorage.getItem(STORAGE_REMEMBER_TEACHER);
      if (savedTeacher) {
        const parsed = JSON.parse(savedTeacher);
        if (parsed.name) setTeacherName(parsed.name);
        if (parsed.email) setTeacherEmail(parsed.email);
      }

      const savedAdmin = localStorage.getItem(STORAGE_REMEMBER_ADMIN);
      if (savedAdmin) {
        const parsed = JSON.parse(savedAdmin);
        if (parsed.titleRole) setAdminTitleRole(parsed.titleRole);
        if (parsed.name) setAdminName(parsed.name);
      }
    } catch (_) {}
  }, []);

  // Admin Ünvanı Değiştiğinde Varsayılan Adı Soyadı Güncelle
  const handleAdminRoleSelect = (role: 'memur' | 'mudur_yardimcisi' | 'okul_muduru') => {
    setAdminTitleRole(role);
    if (role === 'memur') {
      setAdminName('Evrak Kayıt Memuru');
    } else if (role === 'mudur_yardimcisi') {
      setAdminName('Fudan FİDAN');
    } else if (role === 'okul_muduru') {
      setAdminName('Recep KIZILIRMAK');
    }
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim()) {
      alert('Lütfen Adınızı ve Soyadınızı giriniz.');
      return;
    }
    if (!teacherEmail.trim()) {
      alert('Lütfen E-posta adresinizi giriniz.');
      return;
    }

    if (rememberTeacher) {
      localStorage.setItem(STORAGE_REMEMBER_TEACHER, JSON.stringify({
        name: teacherName.trim(),
        email: teacherEmail.trim()
      }));
      localStorage.setItem(STORAGE_LAST_LOGIN_TYPE, 'ogretmen');
    } else {
      localStorage.removeItem(STORAGE_REMEMBER_TEACHER);
    }

    onLogin({
      email: teacherEmail.trim().toLowerCase(),
      fullName: teacherName.trim(),
      role: 'ogretmen',
      title: 'Öğretmen / Kafile Başkanı'
    });
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim()) {
      alert('Lütfen Adınızı ve Soyadınızı giriniz.');
      return;
    }

    if (rememberAdmin) {
      localStorage.setItem(STORAGE_REMEMBER_ADMIN, JSON.stringify({
        titleRole: adminTitleRole,
        name: adminName.trim()
      }));
      localStorage.setItem(STORAGE_LAST_LOGIN_TYPE, 'okul_idaresi');
    } else {
      localStorage.removeItem(STORAGE_REMEMBER_ADMIN);
    }

    let title = 'Evrak Kayıt Memuru';
    if (adminTitleRole === 'mudur_yardimcisi') {
      title = 'Müdür Yardımcısı (Sosyal Etkinlikler Kurulu Bşk.)';
    } else if (adminTitleRole === 'okul_muduru') {
      title = 'Okul Müdürü (Makam Oluru)';
    }

    // Okul İdaresi ortak e-posta ile girer (Ekranda e-posta görünmez)
    onLogin({
      email: DEFAULT_SCHOOL_EMAIL,
      fullName: adminName.trim(),
      role: adminTitleRole, // İlgili idareci rolü
      title
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 selection:bg-red-500 selection:text-white">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-slate-100/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 sm:p-8 text-white text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mx-auto mb-3 shadow-lg shadow-black/10">
            <School className="w-9 h-9 text-white" />
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-white/20 text-red-100 border border-white/20">
            T.C. MİLLÎ EĞİTİM BAKANLIĞI • EBA ODOS UYUMLU
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-2">
            Zeynep Kamil İlkokulu Gezi Portalı
          </h2>
          <p className="text-xs sm:text-sm text-red-100 mt-1 max-w-md mx-auto">
            Okul Dışı Öğrenme Gezi Planı, Kademeli İdare Onayı ve Takip Sistemi
          </p>
        </div>

        {/* Main Tab Selection: Öğretmen vs Okul İdaresi */}
        <div className="p-6 sm:p-8 space-y-6">
          
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setLoginType('ogretmen')}
              className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                loginType === 'ogretmen'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Öğretmen Girişi</span>
            </button>

            <button
              type="button"
              onClick={() => setLoginType('okul_idaresi')}
              className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                loginType === 'okul_idaresi'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
              <span>Okul İdaresi Girişi</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* ======================= TAB 1: ÖĞRETMEN GİRİŞİ ========================== */}
          {/* ========================================================================= */}
          {loginType === 'ogretmen' ? (
            <form onSubmit={handleTeacherSubmit} className="space-y-4 animate-in fade-in duration-150">
              
              <div className="bg-red-50/70 border border-red-200/80 rounded-2xl p-4 text-xs text-red-950 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Öğretmen / Kafile Başkanı Giriş Masası</strong>
                  <span>Gezi planı hazırlayabilir, onay sürecini takip edebilir ve onaylanan planların resmi 2 sayfalık çıktısını alabilirsiniz.</span>
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
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Örn: Ali Serkan KAYA"
                  className="w-full px-4 py-3 text-sm font-semibold rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition bg-slate-50 focus:bg-white"
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
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="ornek@meb.k12.tr veya gmail.com"
                  className="w-full px-4 py-3 text-sm font-semibold rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition bg-slate-50 focus:bg-white"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  * Bu e-posta ile girdiğiniz sürece hazırladığınız tüm planları ve onay bildirimlerini görebilirsiniz.
                </span>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberTeacher"
                  checked={rememberTeacher}
                  onChange={(e) => setRememberTeacher(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="rememberTeacher" className="text-xs text-slate-600 font-medium cursor-pointer">
                  Bu cihazda beni hatırla (Bir sonraki girişte otomatik doldur)
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-red-500/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Öğretmen Olarak Giriş Yap</span>
                <ArrowRight className="w-5 h-5" />
              </button>

            </form>
          ) : (
            /* ========================================================================= */
            /* ==================== TAB 2: OKUL İDARESİ GİRİŞİ ========================= */
            /* ========================================================================= */
            <form onSubmit={handleAdminSubmit} className="space-y-4 animate-in fade-in duration-150">
              
              <div className="bg-slate-900 text-white rounded-2xl p-4 text-xs flex items-start gap-3 shadow-md">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-indigo-200">Zeynep Kamil İlkokulu İdare Onay Masası</strong>
                  <span className="text-slate-300 text-[11px]">
                    Onaya gönderilen planlar en eski talepten başlayarak sıralanır. İnceleme, Uygun Görüş ve Makam Oluru onay aşamaları yetkinize göre sunulur.
                  </span>
                </div>
              </div>

              {/* Ünvan Seçimi (Memur, Müdür Yrd, Okul Müdürü) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  İdare Görevi / Ünvanı Seçiniz: <span className="text-red-500">*</span>
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  
                  {/* 1. Memur */}
                  <button
                    type="button"
                    onClick={() => handleAdminRoleSelect('memur')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      adminTitleRole === 'memur'
                        ? 'border-amber-500 bg-amber-50/80 text-amber-950 font-bold ring-2 ring-amber-400/50'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <UserCheck className="w-4 h-4 text-amber-600" />
                      {adminTitleRole === 'memur' && <Check className="w-4 h-4 text-amber-600" />}
                    </div>
                    <span className="text-xs font-black block">1. Memur</span>
                    <span className="text-[10px] text-slate-500 block">Ön İnceleme</span>
                  </button>

                  {/* 2. Müdür Yardımcısı */}
                  <button
                    type="button"
                    onClick={() => handleAdminRoleSelect('mudur_yardimcisi')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      adminTitleRole === 'mudur_yardimcisi'
                        ? 'border-indigo-500 bg-indigo-50/80 text-indigo-950 font-bold ring-2 ring-indigo-400/50'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      {adminTitleRole === 'mudur_yardimcisi' && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <span className="text-xs font-black block">2. Fudan FİDAN</span>
                    <span className="text-[10px] text-slate-500 block">Müdür Yrd. Onayı</span>
                  </button>

                  {/* 3. Okul Müdürü */}
                  <button
                    type="button"
                    onClick={() => handleAdminRoleSelect('okul_muduru')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      adminTitleRole === 'okul_muduru'
                        ? 'border-red-600 bg-red-50/80 text-red-950 font-bold ring-2 ring-red-400/50'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Award className="w-4 h-4 text-red-700" />
                      {adminTitleRole === 'okul_muduru' && <Check className="w-4 h-4 text-red-700" />}
                    </div>
                    <span className="text-xs font-black block">3. Recep KIZILIRMAK</span>
                    <span className="text-[10px] text-slate-500 block">Okul Müdürü Oluru</span>
                  </button>

                </div>
              </div>

              {/* Yetkili Ad Soyad */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Yetkili Adı Soyadı <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Örn: Recep KIZILIRMAK"
                  className="w-full px-4 py-3 text-sm font-semibold rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none transition bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Kurumsal Bilgilendirme (E-posta gösterilmez, arka planda okul epostası kullanılır) */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs">
                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-[11px]">
                  Kurumsal Okul İdaresi Yetkilendirmesi (Ortak Okul E-posta Protokolü)
                </span>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberAdmin"
                  checked={rememberAdmin}
                  onChange={(e) => setRememberAdmin(e.target.checked)}
                  className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer"
                />
                <label htmlFor="rememberAdmin" className="text-xs text-slate-600 font-medium cursor-pointer">
                  Bu cihazda ünvan ve yetkili bilgilerimi hatırla
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-slate-900/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>İdare Masasına Giriş Yap</span>
                <ArrowRight className="w-5 h-5 text-indigo-400" />
              </button>

            </form>
          )}

          <div className="text-center pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1 border-t border-slate-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Türkiye Yüzyılı Maarif Modeli & MEB Sosyal Etkinlikler Yönergesi</span>
          </div>

        </div>

      </div>
    </div>
  );
};
