import React, { useState } from 'react';
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
  Sparkles 
} from 'lucide-react';

interface AuthLoginScreenProps {
  onLogin: (user: AuthUser) => void;
}

export const AuthLoginScreen: React.FC<AuthLoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('ogretmen');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('Lütfen e-posta adresinizi giriniz.');
      return;
    }
    if (!fullName.trim()) {
      alert('Lütfen adınızı ve soyadınızı giriniz.');
      return;
    }

    let title = 'Öğretmen / Kafile Başkanı';
    if (role === 'memur') title = 'Evrak Kayıt Memuru';
    if (role === 'mudur_yardimcisi') title = 'Müdür Yardımcısı (Sosyal Etkinlikler Kurulu Bşk.)';
    if (role === 'okul_muduru') title = 'Okul Müdürü';

    onLogin({
      email: email.trim().toLowerCase(),
      fullName: fullName.trim(),
      role,
      title
    });
  };

  // Hızlı Giriş Ön Tanımları
  const handleQuickSelect = (presetRole: UserRole, presetEmail: string, presetName: string) => {
    setEmail(presetEmail);
    setFullName(presetName);
    setRole(presetRole);
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
            Okul Dışı Öğrenme Gezi Planı Hazırlama, Kademeli Onay ve Takip Sistemi
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          
          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Hızlı Rol & Kullanıcı Seçimi:</span>
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              
              <button
                type="button"
                onClick={() => handleQuickSelect('ogretmen', 'ogretmen@meb.k12.tr', 'Ali Serkan KAYA')}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  role === 'ogretmen' 
                    ? 'border-red-500 bg-red-50/70 text-red-900 font-bold' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <GraduationCap className="w-4 h-4 text-red-600" />
                  <span className="font-bold">Öğretmen Girişi</span>
                </div>
                <span className="text-[11px] text-slate-500 block truncate">Plan Hazırla & Takip Et</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('memur', DEFAULT_SCHOOL_EMAIL, 'Evrak Kayıt Memuru')}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  role === 'memur' 
                    ? 'border-amber-500 bg-amber-50/70 text-amber-900 font-bold' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <UserCheck className="w-4 h-4 text-amber-600" />
                  <span className="font-bold">1. Memur Girişi</span>
                </div>
                <span className="text-[11px] text-slate-500 block truncate">Ön İnceleme Masası</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('mudur_yardimcisi', DEFAULT_SCHOOL_EMAIL, 'Fudan FİDAN')}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  role === 'mudur_yardimcisi' 
                    ? 'border-indigo-500 bg-indigo-50/70 text-indigo-900 font-bold' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold">2. Fudan FİDAN</span>
                </div>
                <span className="text-[11px] text-slate-500 block truncate">Müdür Yrd. Onayı</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('okul_muduru', DEFAULT_SCHOOL_EMAIL, 'Recep KIZILIRMAK')}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  role === 'okul_muduru' 
                    ? 'border-red-600 bg-red-50/80 text-red-950 font-bold' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Award className="w-4 h-4 text-red-700" />
                  <span className="font-bold">3. Recep KIZILIRMAK</span>
                </div>
                <span className="text-[11px] text-slate-500 block truncate">Okul Müdürü Makam Oluru</span>
              </button>

            </div>
          </div>

          {/* E-Posta Girişi */}
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
              placeholder="ornek@meb.k12.tr veya gmail.com"
              className="w-full px-4 py-3 text-sm font-semibold rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition bg-slate-50 focus:bg-white"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              * Bu e-posta ile girdiğiniz sürece tüm geçmiş gezi planlarınızı ve onay süreçlerinizi görüntüleyebilirsiniz.
            </span>
          </div>

          {/* Ad Soyad Girişi */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-500" />
              <span>Adınız Soyadınız / Göreviniz <span className="text-red-500">*</span></span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Örn: Ali Serkan KAYA"
              className="w-full px-4 py-3 text-sm font-semibold rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-red-500/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sisteme Giriş Yap</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="text-center pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Türkiye Yüzyılı Maarif Modeli & MEB Yönergelerine Uygun Güvenli Giriş</span>
          </div>

        </form>

      </div>
    </div>
  );
};
