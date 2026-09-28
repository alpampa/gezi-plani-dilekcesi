import React, { useState } from 'react';
import type { GeziPlanData } from '../types';
import { checkFiveDaysRule, DatabaseService } from '../services/db';
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
  Award,
  BarChart3,
  Download,
  ArrowRight,
  UserCheck,
  FileCheck2
} from 'lucide-react';

interface AdminApprovalPanelProps {
  plans: GeziPlanData[];
  onAdvanceStage: (
    planId: string, 
    role: 'memur' | 'mudur_yardimcisi' | 'okul_muduru', 
    reviewerName: string, 
    notes?: string
  ) => void;
  onReject: (planId: string, rejectedBy: string, notes: string) => void;
  onSelectPlan: (plan: GeziPlanData) => void;
  onPrintPlan: (plan: GeziPlanData) => void;
  onDeletePlan: (planId: string) => void;
}

export const AdminApprovalPanel: React.FC<AdminApprovalPanelProps> = ({
  plans,
  onAdvanceStage,
  onReject,
  onSelectPlan,
  onPrintPlan,
  onDeletePlan
}) => {
  // Aktif İdareci Rolü
  const [activeAdminRole, setActiveAdminRole] = useState<'memur' | 'mudur_yardimcisi' | 'okul_muduru'>('memur');
  const [reviewerName, setReviewerName] = useState<string>('Evrak Kayıt Memuru');

  // Görünüm Modu: 'list' (Onay & Takip Listesi) veya 'analytics' (Raporlama & Veri Masası)
  const [viewMode, setViewMode] = useState<'list' | 'analytics'>('list');

  // Filtreler
  const [activeTab, setActiveTab] = useState<'all' | 'clerk' | 'deputy' | 'principal' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Ret / Düzeltme Modalı
  const [rejectingPlanId, setRejectingPlanId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  // İstatistikler
  const analytics = DatabaseService.getAnalyticsData(plans);

  // Rol değiştiğinde varsayılan isimleri güncelle
  const handleRoleChange = (role: 'memur' | 'mudur_yardimcisi' | 'okul_muduru') => {
    setActiveAdminRole(role);
    if (role === 'memur') {
      setReviewerName('Evrak Kayıt Memuru');
      setActiveTab('clerk');
    } else if (role === 'mudur_yardimcisi') {
      setReviewerName('Fudan FİDAN (Müdür Yrd.)');
      setActiveTab('deputy');
    } else if (role === 'okul_muduru') {
      setReviewerName('Recep KIZILIRMAK (Okul Müdürü)');
      setActiveTab('principal');
    }
  };

  const filteredPlans = plans.filter(plan => {
    // Tab filter
    if (activeTab === 'clerk' && plan.status !== 'memur_incelemesinde') return false;
    if (activeTab === 'deputy' && plan.status !== 'mudur_yardimcisi_onayinda') return false;
    if (activeTab === 'principal' && plan.status !== 'mudur_onayinda') return false;
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
    onReject(rejectingPlanId, reviewerName, rejectNote);
    setRejectingPlanId(null);
    setRejectNote('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Welcome Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-xl border border-indigo-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-500/25 shrink-0">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/30 text-red-200 border border-red-400/30">
                  Kademeli Onay Masası
                </span>
                <span className="text-xs text-indigo-300 hidden sm:inline">
                  Memur ➔ Md. Yrd. ➔ Okul Müdürü
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
                Zeynep Kamil İlkokulu Gezi İzin, Takip ve Rapor Masası
              </h2>
            </div>
          </div>

          {/* View Mode Toggle & Active Authority */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Rapor & Veri Butonu */}
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'list' ? 'analytics' : 'list')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'analytics'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{viewMode === 'analytics' ? 'Onay Listesine Dön' : '📊 Takip & Rapor Verileri'}</span>
            </button>

            {/* CSV Dışa Aktar */}
            <button
              type="button"
              onClick={() => DatabaseService.downloadCSVReport(plans)}
              disabled={plans.length === 0}
              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              title="Tüm Gezi Planlarını Excel / CSV Formatında İndir"
            >
              <Download className="w-4 h-4" />
              <span>Excel / CSV</span>
            </button>

          </div>

        </div>

        {/* Multi-Stage Authority Role Switcher Bar */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">İşlem Yapan Makam:</span>
            <div className="flex flex-wrap items-center gap-1.5 bg-white/10 p-1 rounded-xl border border-white/15">
              
              <button
                type="button"
                onClick={() => handleRoleChange('memur')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  activeAdminRole === 'memur'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                1. Memur (Ön İnceleme) {analytics.pendingClerk > 0 && `(${analytics.pendingClerk})`}
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('mudur_yardimcisi')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  activeAdminRole === 'mudur_yardimcisi'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                2. Fudan FİDAN (Md. Yrd.) {analytics.pendingDeputy > 0 && `(${analytics.pendingDeputy})`}
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('okul_muduru')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  activeAdminRole === 'okul_muduru'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                3. Recep KIZILIRMAK (Okul Müdürü) {analytics.pendingPrincipal > 0 && `(${analytics.pendingPrincipal})`}
              </button>

            </div>
          </div>

          <div className="text-xs text-slate-300">
            Yetkili: <strong className="text-white">{reviewerName}</strong>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* ===================== VIEW MODE 1: ANALYTICS & RAPORLAMA ================ */}
      {/* ========================================================================= */}
      {viewMode === 'analytics' ? (
        <div className="space-y-6">
          
          {/* Key KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Toplam Gezi</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{analytics.totalPlans} Plan</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">{analytics.approvedPlans} Onaylı, {analytics.totalPending} Süreçte</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider block">Toplam Katılımcı</span>
              <span className="text-2xl font-black text-blue-700 mt-1 block">{analytics.totalStudents} Öğrenci</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">{analytics.totalMale} Erkek / {analytics.totalFemale} Kız</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider block">Görevli Personel</span>
              <span className="text-2xl font-black text-indigo-700 mt-1 block">{analytics.totalTeachers} Öğretmen</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">+{analytics.totalCompanions} Veli Refakatçi</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider block">Makam Oluru (Onay)</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">{analytics.approvedPlans} Kesin Onay</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Yazdırılmaya Hazır</span>
            </div>
          </div>

          {/* Approval Pipeline Funnel Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
              <span>Kademeli Onay Akışı Takip Durumu</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 text-center">
                <span className="text-[11px] font-bold text-amber-800 uppercase block">1. Aşama: Memurda</span>
                <span className="text-xl font-black text-amber-900 my-1 block">{analytics.pendingClerk} Plan</span>
                <span className="text-[10px] text-amber-700 block">Ön İnceleme Bekliyor</span>
              </div>

              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/60 text-center">
                <span className="text-[11px] font-bold text-indigo-800 uppercase block">2. Aşama: Md. Yrd.'da</span>
                <span className="text-xl font-black text-indigo-900 my-1 block">{analytics.pendingDeputy} Plan</span>
                <span className="text-[10px] text-indigo-700 block">Fudan FİDAN İncelemesinde</span>
              </div>

              <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/60 text-center">
                <span className="text-[11px] font-bold text-red-800 uppercase block">3. Aşama: Müdürde</span>
                <span className="text-xl font-black text-red-900 my-1 block">{analytics.pendingPrincipal} Plan</span>
                <span className="text-[10px] text-red-700 block">Recep KIZILIRMAK Olurunda</span>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 text-center">
                <span className="text-[11px] font-bold text-emerald-800 uppercase block">4. Aşama: Onaylandı</span>
                <span className="text-xl font-black text-emerald-900 my-1 block">{analytics.approvedPlans} Plan</span>
                <span className="text-[10px] text-emerald-700 block">Resmi Olur Verildi</span>
              </div>
            </div>
          </div>

          {/* Categories and Districts Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Kategorilere Göre Gezi Dağılımı
              </h4>
              <div className="space-y-2">
                {Object.entries(analytics.categoriesMap).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                    <span className="font-semibold text-slate-700">{cat}</span>
                    <span className="font-extrabold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">{count} Gezi</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                İlçelere Göre Gezi Dağılımı
              </h4>
              <div className="space-y-2">
                {Object.entries(analytics.districtsMap).map(([dist, count]) => (
                  <div key={dist} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                    <span className="font-semibold text-slate-700">{dist}</span>
                    <span className="font-extrabold px-2 py-0.5 bg-red-100 text-red-800 rounded-full">{count} Gezi</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : null}

      {/* ========================================================================= */}
      {/* ===================== VIEW MODE 2: PLANLAR VE ONAY LİSTESİ ============== */}
      {/* ========================================================================= */}
      
      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Tümü ({plans.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('clerk')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'clerk'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>1. Memur ({analytics.pendingClerk})</span>
          </button>

          <button
            onClick={() => setActiveTab('deputy')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'deputy'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>2. Md. Yrd ({analytics.pendingDeputy})</span>
          </button>

          <button
            onClick={() => setActiveTab('principal')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'principal'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>3. Müdür ({analytics.pendingPrincipal})</span>
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'approved'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Onaylı ({analytics.approvedPlans})</span>
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'rejected'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Düzeltme ({analytics.rejectedPlans})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Mekân, öğretmen, şube ara..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition"
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
              placeholder="Örn: Veli izin belgeleri eksik / Araç plakası güncellenmeli..."
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
            {activeTab === 'clerk' && 'Memur ön incelemesinde bekleyen yeni gezi planı bulunmamaktadır.'}
            {activeTab === 'deputy' && 'Müdür Yardımcısı (Fudan FİDAN) onayında bekleyen gezi planı bulunmamaktadır.'}
            {activeTab === 'principal' && 'Okul Müdürü (Recep KIZILIRMAK) makam olurunda bekleyen gezi planı bulunmamaktadır.'}
            {activeTab === 'approved' && 'Henüz kesin onaylanmış bir gezi planı bulunmuyor.'}
            {activeTab === 'all' && 'Kriterlerinize uygun gezi planı bulunamadı.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPlans.map((plan) => {
            const fiveDaysCheck = checkFiveDaysRule(plan.tripDate);
            const isClerkStage = plan.status === 'memur_incelemesinde';
            const isDeputyStage = plan.status === 'mudur_yardimcisi_onayinda';
            const isPrincipalStage = plan.status === 'mudur_onayinda';
            const isApproved = plan.status === 'onaylandi';
            const isRejected = plan.status === 'reddedildi';

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl p-5 shadow-xs border transition-all hover:shadow-md ${
                  isClerkStage ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/10' :
                  isDeputyStage ? 'border-indigo-300 ring-1 ring-indigo-200 bg-indigo-50/10' :
                  isPrincipalStage ? 'border-red-300 ring-1 ring-red-200 bg-red-50/10' :
                  isApproved ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left Info Column */}
                  <div className="space-y-2.5 min-w-0 flex-1">
                    
                    {/* Status & Deadline Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      
                      {isClerkStage && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                          <span>1. Aşama: Memur Ön İncelemesinde</span>
                        </span>
                      )}

                      {isDeputyStage && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-300 animate-pulse">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>2. Aşama: Fudan FİDAN (Md. Yrd.) Onayında</span>
                        </span>
                      )}

                      {isPrincipalStage && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-800 border border-red-300 animate-pulse">
                          <Award className="w-3.5 h-3.5" />
                          <span>3. Aşama: Recep KIZILIRMAK (Müdür) Olurunda</span>
                        </span>
                      )}

                      {isApproved && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Makam Oluru Verildi / Kesin Onaylandı</span>
                        </span>
                      )}

                      {isRejected && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Düzeltme İstenmiş / Red</span>
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
                        Kayıt: {formatDate(plan.createdAt?.split('T')[0] || '')}
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
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-700 pt-1">
                      <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                        <Users className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Katılımcılar:</span>
                          <strong className="text-slate-900">{plan.targetGrades || '-'}</strong>
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
                          <span className="text-[10px] text-slate-400 block font-medium">Tarih & Saat:</span>
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
                            {plan.transportationType === 'Yürüyerek' ? 'Yürüyerek İntikal' : (plan.vehiclePlate || 'Plakasız')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stage History / Review Logs */}
                    <div className="text-[11px] space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Kademeli Onay Geçmişi:</span>
                      </div>

                      {/* Memur */}
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${plan.clerkReviewedAt ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
                        <span className="text-slate-600 font-medium">Memur Ön İnceleme:</span>
                        <span className="font-bold text-slate-800">
                          {plan.clerkReviewedBy ? `${plan.clerkReviewedBy} (${formatDate(plan.clerkReviewedAt?.split('T')[0] || '')})` : 'Beklemede'}
                        </span>
                      </div>

                      {/* Md Yrd */}
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${plan.deputyApprovedAt ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        <span className="text-slate-600 font-medium">Müdür Yrd. Onayı:</span>
                        <span className="font-bold text-slate-800">
                          {plan.deputyApprovedBy ? `${plan.deputyApprovedBy} (${formatDate(plan.deputyApprovedAt?.split('T')[0] || '')})` : 'Beklemede'}
                        </span>
                      </div>

                      {/* Müdür */}
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${plan.principalApprovedAt ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        <span className="text-slate-600 font-medium">Okul Müdürü Makam Oluru:</span>
                        <span className="font-bold text-slate-800">
                          {plan.principalApprovedBy ? `${plan.principalApprovedBy} (${formatDate(plan.principalApprovedAt?.split('T')[0] || '')})` : 'Beklemede'}
                        </span>
                      </div>

                      {plan.approvalNotes && (
                        <div className="text-rose-700 font-semibold pt-1 border-t border-slate-200 mt-1">
                          Not: {plan.approvalNotes}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Right Actions Column */}
                  <div className="flex flex-row lg:flex-col items-center justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-4">
                    
                    {/* 1. Aşama Memur Aksiyonu */}
                    {isClerkStage && (
                      <button
                        type="button"
                        onClick={() => onAdvanceStage(plan.id, 'memur', reviewerName, 'Ön inceleme ve evrak kontrolleri yapılmıştır.')}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>Md. Yrd.'na Sevk Et</span>
                      </button>
                    )}

                    {/* 2. Aşama Müdür Yardımcısı Aksiyonu */}
                    {isDeputyStage && (
                      <button
                        type="button"
                        onClick={() => onAdvanceStage(plan.id, 'mudur_yardimcisi', reviewerName, 'Sosyal etkinlikler incelemesi yapılmış ve uygun görülmüştür.')}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>Müdür Oluruna Sun</span>
                      </button>
                    )}

                    {/* 3. Aşama Okul Müdürü Aksiyonu */}
                    {isPrincipalStage && (
                      <button
                        type="button"
                        onClick={() => onAdvanceStage(plan.id, 'okul_muduru', reviewerName, 'Makam oluru verilmiş ve gezi onaylanmıştır.')}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Makam Oluru Ver (Onayla)</span>
                      </button>
                    )}

                    {/* Düzeltme İste Butonu */}
                    {(isClerkStage || isDeputyStage || isPrincipalStage) && (
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
