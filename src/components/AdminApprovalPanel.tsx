import React, { useState } from 'react';
import type { GeziPlanData } from '../types';
import { checkFiveDaysRule } from '../services/db';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Printer, 
  FileText, 
  Trash2, 
  Edit3, 
  Calendar, 
  Users, 
  Bus, 
  Search, 
  AlertCircle,
  Filter,
  ShieldCheck,
  Award
} from 'lucide-react';

interface AdminApprovalPanelProps {
  plans: GeziPlanData[];
  onApprove: (planId: string, adminName: string, notes?: string) => void;
  onReject: (planId: string, notes: string) => void;
  onSelectPlan: (plan: GeziPlanData) => void;
  onPrintPlan: (plan: GeziPlanData) => void;
  onDeletePlan: (planId: string) => void;
}

export const AdminApprovalPanel: React.FC<AdminApprovalPanelProps> = ({
  plans,
  onApprove,
  onReject,
  onSelectPlan,
  onPrintPlan,
  onDeletePlan
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState<'Recep KIZILIRMAK' | 'Fudan FİDAN'>('Recep KIZILIRMAK');
  const [rejectingPlanId, setRejectingPlanId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const pendingCount = plans.filter(p => p.status === 'onay_bekliyor').length;
  const approvedCount = plans.filter(p => p.status === 'onaylandi').length;
  const rejectedCount = plans.filter(p => p.status === 'reddedildi').length;

  const filteredPlans = plans.filter(plan => {
    // Tab filter
    if (activeTab === 'pending' && plan.status !== 'onay_bekliyor') return false;
    if (activeTab === 'approved' && plan.status !== 'onaylandi') return false;
    if (activeTab === 'rejected' && plan.status !== 'reddedildi') return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (plan.destinationName || '').toLowerCase();
      const teacher = (plan.headTeacher?.fullName || plan.submittedBy || '').toLowerCase();
      const grade = (plan.targetGrades || '').toLowerCase();
      const district = (plan.selectedDistrict || '').toLowerCase();
      return name.includes(q) || teacher.includes(q) || grade.includes(q) || district.includes(q);
    }
    return true;
  });

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

  const handleConfirmReject = () => {
    if (!rejectingPlanId) return;
    if (!rejectNote.trim()) {
      alert('Lütfen düzeltme veya ret gerekçesini yazınız.');
      return;
    }
    onReject(rejectingPlanId, rejectNote);
    setRejectingPlanId(null);
    setRejectNote('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Welcome Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  Okul İdaresi Yönetim & Onay Masası
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white mt-0.5">
                Zeynep Kamil İlkokulu Gezi İzin & Onay Paneli
              </h2>
            </div>
          </div>

          {/* Active Admin Switcher */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur p-1.5 rounded-xl border border-white/15">
            <span className="text-xs font-medium text-slate-300 pl-2">Onaylayan Yetkili:</span>
            <button
              type="button"
              onClick={() => setSelectedAdmin('Recep KIZILIRMAK')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                selectedAdmin === 'Recep KIZILIRMAK'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Recep KIZILIRMAK (Okul Müdürü)
            </button>
            <button
              type="button"
              onClick={() => setSelectedAdmin('Fudan FİDAN')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                selectedAdmin === 'Fudan FİDAN'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Fudan FİDAN (Müdür Yrd.)
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Onay Bekleyenler</span>
            {pendingCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'pending' ? 'bg-white text-amber-600' : 'bg-amber-500 text-white'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'approved'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Onaylananlar ({approvedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'rejected'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Düzeltme / Red ({rejectedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Tüm Kayıtlar ({plans.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Mekân, öğretmen, şube ara..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingPlanId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>Düzeltme Talebi / Planı Reddet</span>
            </h4>
            <p className="text-xs text-slate-500">
              Öğretmenin planı revize edebilmesi için eksik veya düzeltilmesi gereken hususları yazınız:
            </p>
            <textarea
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Örn: Araç plakası ve sürücü telefonu güncellenmeli veya gezi süresi revize edilmeli..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setRejectingPlanId(null); setRejectNote(''); }}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm cursor-pointer"
              >
                Düzeltme Talebini İlet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Cards List */}
      {filteredPlans.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-700">Bu sekmede gösterilecek gezi planı bulunamadı</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {activeTab === 'pending' 
              ? 'Öğretmenler tarafından onaya sunulmuş bekleyen yeni gezi planı bulunmamaktadır.'
              : 'Arama kriterlerinize uygun kayıt bulunamadı.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPlans.map((plan) => {
            const fiveDaysCheck = checkFiveDaysRule(plan.tripDate);
            const isApproved = plan.status === 'onaylandi';
            const isPending = plan.status === 'onay_bekliyor';
            const isRejected = plan.status === 'reddedildi';

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl p-5 shadow-xs border transition-all hover:shadow-md ${
                  isPending 
                    ? 'border-amber-300 ring-1 ring-amber-200 bg-gradient-to-r from-amber-50/30 to-white' 
                    : isApproved 
                    ? 'border-emerald-200 bg-gradient-to-r from-emerald-50/20 to-white' 
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left Info Column */}
                  <div className="space-y-2.5 min-w-0 flex-1">
                    
                    {/* Status & Deadline Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Onay Bekliyor</span>
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Makam Oluru Verildi / Onaylandı</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Düzeltme İstenmiş / Reddedildi</span>
                        </span>
                      )}

                      {/* 5 Gün Bilgisi */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        fiveDaysCheck.isEditable 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'bg-orange-50 text-orange-800 border border-orange-200'
                      }`}>
                        <Calendar className="w-3 h-3" />
                        <span>{fiveDaysCheck.message}</span>
                      </span>

                      <span className="text-xs text-slate-400 font-medium">
                        Oluşturulma: {formatDate(plan.createdAt?.split('T')[0] || '')}
                      </span>
                    </div>

                    {/* Destination & School Name */}
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                        <span>{plan.destinationName || 'İsimsiz Gezi Planı'}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {plan.destinationCategory}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {plan.schoolName} — {plan.selectedDistrict} / {plan.selectedCity}
                      </p>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-slate-700 pt-1">
                      <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                        <Users className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Hedef Kitle:</span>
                          <strong className="text-slate-900">{plan.targetGrades || 'Şube Belirtilmedi'}</strong>
                          <span className="text-[10px] text-slate-500 block">({plan.totalStudentCount} Öğrenci)</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                        <ShieldCheck className="w-4 h-4 text-purple-500 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Kafile Başkanı:</span>
                          <strong className="text-slate-900 truncate block">{plan.headTeacher?.fullName || plan.submittedBy || 'Belirtilmedi'}</strong>
                          <span className="text-[10px] text-slate-500 block">{plan.headTeacher?.phone || '-'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                        <Calendar className="w-4 h-4 text-rose-500 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Gezi Tarihi:</span>
                          <strong className="text-slate-900">{formatDate(plan.tripDate)}</strong>
                          <span className="text-[10px] text-slate-500 block">{plan.departureTime} - {plan.returnTime}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                        <Bus className="w-4 h-4 text-amber-500 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Ulaşım:</span>
                          <strong className="text-slate-900 truncate block">{plan.transportationType}</strong>
                          <span className="text-[10px] text-slate-500 block">
                            {plan.transportationType === 'Yürüyerek' ? 'Yürüyerek İntikal' : (plan.vehiclePlate || 'Plaka Yok')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Admin Approval Note */}
                    {plan.approvalNotes && (
                      <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700 text-xs flex items-start gap-2 border border-slate-200">
                        <Award className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">İdare Notu: </span>
                          <span>{plan.approvalNotes}</span>
                          {plan.approvedBy && (
                            <span className="text-[10px] text-slate-500 block font-semibold mt-0.5">
                              İşlem Yapan: {plan.approvedBy} ({formatDate(plan.approvedAt?.split('T')[0] || '')})
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Right Actions Column */}
                  <div className="flex flex-row lg:flex-col items-center justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-4">
                    
                    {/* Onayla Butonu (Eğer Onay Bekliyorsa) */}
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => onApprove(plan.id, selectedAdmin, `${selectedAdmin} tarafından incelenmiş ve uygun görülmüştür.`)}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Makam Oluru Ver (Onayla)</span>
                      </button>
                    )}

                    {/* Düzeltme İste Butonu */}
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => setRejectingPlanId(plan.id)}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Düzeltme İste</span>
                      </button>
                    )}

                    {/* Resmi Yazdır / PDF Butonu */}
                    <button
                      type="button"
                      onClick={() => onPrintPlan(plan)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Resmi Çıktı / PDF</span>
                    </button>

                    {/* İncele / Forma Aktar Butonu */}
                    <button
                      type="button"
                      onClick={() => onSelectPlan(plan)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Formda İncele</span>
                    </button>

                    {/* Sil Butonu */}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`"${plan.destinationName}" gezi planını kalıcı olarak silmek istediğinize emin misiniz?`)) {
                          onDeletePlan(plan.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                      title="Kaydı Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
