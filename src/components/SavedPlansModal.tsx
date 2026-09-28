import React from 'react';
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
  AlertTriangle
} from 'lucide-react';
import type { GeziPlanData } from '../types';
import { checkFiveDaysRule } from '../services/db';

interface SavedPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedPlans: GeziPlanData[];
  onLoadPlan: (plan: GeziPlanData) => void;
  onDeletePlan: (id: string) => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SavedPlansModal: React.FC<SavedPlansModalProps> = ({
  isOpen,
  onClose,
  savedPlans,
  onLoadPlan,
  onDeletePlan,
  onExportJSON,
  onImportJSON
}) => {
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
              <h3 className="text-base font-bold text-slate-900">Kayıtlı Gezi Planlarım & Geçmiş</h3>
              <p className="text-xs text-slate-500">Veritabanında saklanan gezi planları ve onay durumları</p>
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
          
          {/* Top Actions: Export / Import */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-600">
              Toplam {savedPlans.length} Adet Kayıtlı Gezi Planı
            </span>

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
          {savedPlans.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
              <p className="text-sm font-semibold text-slate-600">Henüz kaydedilmiş bir gezi planı bulunmuyor.</p>
              <p className="text-xs text-slate-400 mt-1">Formu doldurduktan sonra "Onaya Gönder & Kaydet" veya "Taslak Kaydet" butonu ile saklayabilirsiniz.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedPlans.map((plan) => {
                const fiveDays = checkFiveDaysRule(plan.tripDate);
                const isPending = plan.status === 'onay_bekliyor';
                const isApproved = plan.status === 'onaylandi';
                const isRejected = plan.status === 'reddedildi';

                return (
                  <div
                    key={plan.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-red-300 bg-slate-50/50 hover:bg-red-50/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                          {plan.destinationName || 'İsimsiz Gezi Planı'}
                        </h4>

                        {/* Status Badge */}
                        {isPending && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>İdare Onayı Bekliyor</span>
                          </span>
                        )}
                        {isApproved && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Makam Oluru Verildi (Onaylı)</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            <span>Düzeltme İstenmiş</span>
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

                      {/* 5-Day Warning / Countdown Badge */}
                      <div className="pt-0.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                          fiveDays.isEditable ? 'bg-blue-50 text-blue-700' : 'bg-amber-100 text-amber-900 font-bold'
                        }`}>
                          <AlertTriangle className="w-3 h-3" />
                          <span>{fiveDays.message}</span>
                        </span>
                      </div>

                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => {
                          onLoadPlan(plan);
                          onClose();
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition cursor-pointer"
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
