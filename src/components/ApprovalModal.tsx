import React, { useState } from 'react';
import type { GeziPlanData } from '../types';
import { DEFAULT_SCHOOL_EMAIL } from '../services/db';
import { 
  CheckCircle2, 
  Send, 
  AlertTriangle, 
  X, 
  MapPin, 
  Calendar, 
  Users, 
  Bus, 
  FileCheck,
  Mail,
  Building2,
  UserCheck
} from 'lucide-react';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: GeziPlanData;
  onConfirmSubmit: (
    teacherName: string, 
    teacherEmail: string, 
    schoolEmail: string, 
    teacherNotes?: string
  ) => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  data,
  onConfirmSubmit
}) => {
  const [teacherName, setTeacherName] = useState(data.headTeacher?.fullName || '');
  const [teacherEmail, setTeacherEmail] = useState(data.teacherEmail || '');
  const [schoolEmail, setSchoolEmail] = useState(data.schoolEmail || DEFAULT_SCHOOL_EMAIL);
  const [teacherNotes, setTeacherNotes] = useState('');
  const [isAgreed, setIsAgreed] = useState(true);

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Tarih Belirtilmedi';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const handleConfirm = () => {
    if (!teacherName.trim()) {
      alert('Lütfen Kafile Başkanı / Gönderen Öğretmen adını belirtiniz.');
      return;
    }
    if (!isAgreed) {
      alert('Lütfen mevzuat ve güvenlik beyanını onaylayınız.');
      return;
    }
    onConfirmSubmit(teacherName.trim(), teacherEmail.trim(), schoolEmail.trim(), teacherNotes.trim());
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-4 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <FileCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-200">
                MEB Sosyal Etkinlikler & Kademeli Onay
              </span>
              <h3 className="text-base sm:text-lg font-black">
                Okul İdaresi Onayına Sunma & E-Posta Bildirimi
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Gezi Planı Özet Bilgileri</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Gezi Mekânı:</span>
                  <strong className="text-slate-900">{data.destinationName || 'Belirtilmedi'}</strong>
                  <span className="text-[10px] text-slate-500 block">{data.selectedDistrict} / {data.selectedCity}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                <Calendar className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Gezi Tarihi & Saat:</span>
                  <strong className="text-slate-900">{formatDate(data.tripDate)}</strong>
                  <span className="text-[10px] text-slate-500 block">{data.departureTime} - {data.returnTime}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                <Users className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Katılımcı Dağılımı:</span>
                  <strong className="text-slate-900">{data.totalStudentCount} Öğrenci</strong>
                  <span className="text-[10px] text-slate-500 block">Şubeler: {data.targetGrades || 'Belirtilmedi'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                <Bus className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Ulaşım Türü:</span>
                  <strong className="text-slate-900">{data.transportationType}</strong>
                  {data.transportationType === 'Yürüyerek' ? (
                    <span className="text-[10px] text-emerald-600 font-semibold block">🚶 Yürüyerek İntikal</span>
                  ) : (
                    <span className="text-[10px] text-slate-500 block">Plaka: {data.vehiclePlate || '-'}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Kademeli Onay Sırası Bilgilendirmesi */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-950 space-y-1.5">
            <span className="font-bold flex items-center gap-1.5 text-indigo-900">
              <UserCheck className="w-4 h-4 text-indigo-700" />
              <span>Kademeli Onay Akışı Takvimi:</span>
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-[10.5px] pt-1">
              <div className="bg-white p-2 rounded-lg border border-indigo-200 font-semibold text-slate-800">
                <span className="text-[9px] text-indigo-600 block uppercase font-bold">1. Aşama</span>
                Memur Ön İnceleme
              </div>
              <div className="bg-white p-2 rounded-lg border border-indigo-200 font-semibold text-slate-800">
                <span className="text-[9px] text-indigo-600 block uppercase font-bold">2. Aşama</span>
                Md. Yrd. Fudan FİDAN
              </div>
              <div className="bg-white p-2 rounded-lg border border-indigo-200 font-semibold text-slate-800">
                <span className="text-[9px] text-indigo-600 block uppercase font-bold">3. Aşama</span>
                Müdür Recep KIZILIRMAK
              </div>
            </div>
          </div>

          {/* Gönderen ve E-posta Bilgileri */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Planı Sunan / Kafile Başkanı Öğretmen Adı Soyadı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="Örn: Ali Serkan KAYA"
                className="w-full px-3.5 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            {/* E-posta Alanları */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Öğretmen E-posta Adresi</span>
                </label>
                <input
                  type="email"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="ogretmen@meb.k12.tr"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Okul E-posta Adresi (Varsayılan)</span>
                </label>
                <input
                  type="email"
                  value={schoolEmail}
                  onChange={(e) => setSchoolEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-900 bg-slate-50 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Okul İdaresine İletilmek İstenen Not (İsteğe Bağlı)
              </label>
              <textarea
                rows={2}
                value={teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
                placeholder="Örn: Veli izin belgeleri toplanmış olup onaya arz ederim."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
          </div>

          {/* Mevzuat & Onay Beyanı */}
          <label className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200 cursor-pointer">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
            />
            <span className="text-[11.5px] text-amber-900 leading-relaxed">
              <strong>Mevzuat Beyanı:</strong> MEB Eğitim Kurumları Sosyal Etkinlikler Yönetmeliği gereğince veli izin onay belgelerinin toplandığını, güvenlik tedbirlerinin planlandığını ve gezi planının doğruluğunu onaylıyorum.
            </span>
          </label>

          {/* Info Banner */}
          <div className="text-[10.5px] text-slate-500 flex items-center gap-1.5 bg-slate-100 p-2.5 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Onaya gönderildiğinde plan memur ve idare onay sırasına girecek, e-posta bildirimi tetiklenecek ve <strong>ekran otomatik olarak yeni boş forma sıfırlanacaktır.</strong>
            </span>
          </div>

        </div>

        {/* Footer Buttons */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition cursor-pointer"
          >
            İptal / Düzenlemeye Dön
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-lg shadow-md shadow-red-500/25 transition active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Onaya Gönder & E-Posta Bildir</span>
          </button>
        </div>

      </div>
    </div>
  );
};
