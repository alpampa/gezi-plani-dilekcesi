import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  FolderOpen, 
  Download, 
  Upload, 
  Calendar, 
  MapPin, 
  Users, 
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Printer,
  FileDown,
  Star,
  FileCheck2
} from 'lucide-react';
import type { GeziPlanData, AuthUser } from '../types';
import { checkTripDeadlineRule } from '../services/db';
import { generateAndDownloadPlanPDF } from '../services/pdf';

interface SavedPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedPlans: GeziPlanData[];
  currentUser?: AuthUser | null;
  onLoadPlan: (plan: GeziPlanData) => void;
  onPrintPlan?: (plan: GeziPlanData) => void;
  onOpenEvaluation?: (plan: GeziPlanData) => void;
  onDeletePlan: (id: string) => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SavedPlansModal: React.FC<SavedPlansModalProps> = ({
  isOpen,
  onClose,
  savedPlans,
  currentUser,
  onLoadPlan,
  onPrintPlan,
  onOpenEvaluation,
  onDeletePlan,
  onExportJSON,
  onImportJSON
}) => {
  const [filterMineOnly, setFilterMineOnly] = useState(currentUser?.role === 'ogretmen');

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const displayedPlans = savedPlans.filter(plan => {
    if (filterMineOnly && currentUser?.email) {
      return plan.teacherEmail?.toLowerCase() === currentUser.email.toLowerCase() ||
             plan.submittedBy?.toLowerCase().includes(currentUser.fullName.toLowerCase());
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Gezi Planlarım & Onay Süreci Takip Masası</h3>
              <p className="text-xs text-slate-500">
                {currentUser ? `${currentUser.fullName} (${currentUser.email}) adına kayıtlı işlemler` : 'Geçmiş gezi kayıtları ve onay durumları'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Top Actions: Filter Toggle & Export / Import */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
            
            {/* Filter Toggle */}
            {currentUser?.email && (
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setFilterMineOnly(true)}
                  className={`px-2.5 py-1 text-xs font-bold rounded transition cursor-pointer ${
                    filterMineOnly ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Yalnızca Benim Planlarım
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMineOnly(false)}
                  className={`px-2.5 py-1 text-xs font-bold rounded transition cursor-pointer ${
                    !filterMineOnly ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tüm Okul Planları ({savedPlans.length})
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={onExportJSON}
                disabled={savedPlans.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg disabled:opacity-40 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Yedek İndir (JSON)</span>
              </button>

              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Yedek Yükle</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={onImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* List */}
          {displayedPlans.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
              <p className="text-sm font-semibold text-slate-600">
                {filterMineOnly ? 'Bu e-posta adresiyle henüz gönderilmiş bir gezi planı bulunmuyor.' : 'Henüz kayıtlı bir gezi planı bulunmuyor.'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Formu doldurduktan sonra "Onaya Gönder & E-Posta Bildir" butonu ile saklayabilirsiniz.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedPlans.map((plan) => {
                const deadlineCheck = checkTripDeadlineRule(plan.tripDate, plan.transportationType);
                const isPendingClerk = plan.status === 'memur_incelemesinde';
                const isPendingDeputy = plan.status === 'mudur_yardimcisi_onayinda';
                const isPendingPrincipal = plan.status === 'mudur_onayinda';
                const isApproved = plan.status === 'onaylandi';
                const isRejected = plan.status === 'reddedildi';

                return (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group ${
                      isApproved 
                        ? 'border-emerald-300 bg-emerald-50/25 hover:bg-emerald-50/40' 
                        : 'border-slate-200 hover:border-red-300 bg-slate-50/50 hover:bg-red-50/20'
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                          {plan.destinationName || 'İsimsiz Gezi Planı'}
                        </h4>

                        {/* Status Badges */}
                        {isPendingClerk && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3" />
                            <span>1. Aşama: Memur Ön İncelemesinde</span>
                          </span>
                        )}
                        {isPendingDeputy && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3" />
                            <span>2. Aşama: Fudan FİDAN (Md. Yrd.) Onayında</span>
                          </span>
                        )}
                        {isPendingPrincipal && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3" />
                            <span>3. Aşama: Recep KIZILIRMAK (Müdür) Olurunda</span>
                          </span>
                        )}
                        {isApproved && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Makam Oluru Verildi (ONAYLANDI)</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            <span>Düzeltme İstenmiş (İade)</span>
                          </span>
                        )}

                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-200 text-slate-700">
                          {plan.destinationCategory}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {plan.selectedDistrict} / {plan.selectedCity}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(plan.tripDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {plan.totalStudentCount} Öğrenci ({plan.targetGrades || 'Şube Belirtilmedi'})
                        </span>
                      </div>

                      {/* Return / Reject Note if any */}
                      {plan.approvalNotes && (
                        <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800">
                          <strong>İade / İdare Notu:</strong> {plan.approvalNotes}
                        </div>
                      )}

                      {/* Deadline Warning / Countdown Badge */}
                      <div className="pt-0.5 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                          deadlineCheck.isEditable ? 'bg-blue-50 text-blue-700' : 'bg-amber-100 text-amber-900 font-bold'
                        }`}>
                          <AlertTriangle className="w-3 h-3" />
                          <span>{deadlineCheck.message}</span>
                        </span>

                        {/* Gezi Sonrası Değerlendirme Durum Rozeti */}
                        {plan.postTripEvaluation ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                            <span>Değerlendirildi ({plan.postTripEvaluation.overallRating}/5)</span>
                          </span>
                        ) : isApproved ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            <span>Değerlendirme Bekliyor</span>
                          </span>
                        ) : null}
                      </div>

                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                      
                      {/* Gezi Sonrası Değerlendirme Butonu */}
                      {onOpenEvaluation && (isApproved || plan.postTripEvaluation) && (
                        <button
                          type="button"
                          onClick={() => {
                            onOpenEvaluation(plan);
                          }}
                          className={`px-3 py-1.5 text-xs font-extrabold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer ${
                            plan.postTripEvaluation
                              ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
                              : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-emerald-600/20'
                          }`}
                          title="MEB Sosyal Etkinlikler Yönetmeliği Gezi Sonuç Değerlendirme Formunu Doldur / Görüntüle"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>{plan.postTripEvaluation ? 'Değerlendirmeyi Gör/Düzenle' : 'Geziyi Değerlendir'}</span>
                        </button>
                      )}

                      {/* PDF İndir Butonu */}
                      <button
                        type="button"
                        onClick={async () => {
                          await generateAndDownloadPlanPDF(plan);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg shadow-xs transition flex items-center gap-1 cursor-pointer"
                        title="2 Sayfalık Resmi A4 Gezi Raporunu PDF Olarak İndir"
                      >
                        <FileDown className="w-3.5 h-3.5 text-red-600" />
                        <span>PDF İndir</span>
                      </button>

                      {/* Onaylı İse Islak İmza İçin Çıktı Butonu */}
                      {isApproved && onPrintPlan && (
                        <button
                          type="button"
                          onClick={() => {
                            onPrintPlan(plan);
                            onClose();
                          }}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer"
                          title="Okul idaresine teslim etmek üzere 2 sayfalık resmi çıktıyı yazdır"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Resmi Çıktı / İdareye Sun</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onLoadPlan(plan);
                          onClose();
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition cursor-pointer"
                      >
                        Forma Yükle
                      </button>

                      <button
                        onClick={() => onDeletePlan(plan.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                        title="Planı Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
