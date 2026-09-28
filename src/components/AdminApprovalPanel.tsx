import React, { useState, useEffect } from 'react';
import type { GeziPlanData, AuthUser } from '../types';
import { checkTripDeadlineRule, DatabaseService } from '../services/db';
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
  FileCheck2,
  BookOpen,
  MapPin,
  Send,
  X
} from 'lucide-react';

interface AdminApprovalPanelProps {
  plans: GeziPlanData[];
  currentUser: AuthUser | null;
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
  currentUser,
  onAdvanceStage,
  onReject,
  onSelectPlan,
  onPrintPlan,
  onDeletePlan
}) => {
  // Aktif İdareci Rolü
  const [activeAdminRole, setActiveAdminRole] = useState<'memur' | 'mudur_yardimcisi' | 'okul_muduru'>(() => {
    if (currentUser?.role === 'mudur_yardimcisi') return 'mudur_yardimcisi';
    if (currentUser?.role === 'okul_muduru') return 'okul_muduru';
    return 'memur';
  });

  const [reviewerName, setReviewerName] = useState<string>(() => {
    if (currentUser?.fullName) return currentUser.fullName;
    if (currentUser?.role === 'mudur_yardimcisi') return 'Fudan FİDAN';
    if (currentUser?.role === 'okul_muduru') return 'Recep KIZILIRMAK';
    return 'Evrak Kayıt Memuru';
  });

  // Görünüm Modu: 'list' (Onay & Takip Listesi) veya 'analytics' (Raporlama & Veri Masası)
  const [viewMode, setViewMode] = useState<'list' | 'analytics'>('list');

  // Filtreler: Varsayılan olarak kullanıcının kendi onay aşaması
  const [activeTab, setActiveTab] = useState<'all' | 'clerk' | 'deputy' | 'principal' | 'approved' | 'rejected'>(() => {
    if (currentUser?.role === 'mudur_yardimcisi') return 'deputy';
    if (currentUser?.role === 'okul_muduru') return 'principal';
    if (currentUser?.role === 'memur') return 'clerk';
    return 'all';
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Detaylı İnceleme Modalı (Üzerine tıklayınca açılan)
  const [inspectingPlan, setInspectingPlan] = useState<GeziPlanData | null>(null);
  const [decisionNotes, setDecisionNotes] = useState<string>('');

  // Ret / Düzeltme Modalı
  const [rejectingPlanId, setRejectingPlanId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  // İstatistikler
  const analytics = DatabaseService.getAnalyticsData(plans);

  // Props currentUser değişirse
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'mudur_yardimcisi') {
        setActiveAdminRole('mudur_yardimcisi');
        setReviewerName(currentUser.fullName || 'Fudan FİDAN');
        setActiveTab('deputy');
      } else if (currentUser.role === 'okul_muduru') {
        setActiveAdminRole('okul_muduru');
        setReviewerName(currentUser.fullName || 'Recep KIZILIRMAK');
        setActiveTab('principal');
      } else if (currentUser.role === 'memur') {
        setActiveAdminRole('memur');
        setReviewerName(currentUser.fullName || 'Evrak Kayıt Memuru');
        setActiveTab('clerk');
      }
    }
  }, [currentUser]);

  // Rol değiştiğinde varsayılan isimleri güncelle
  const handleRoleChange = (role: 'memur' | 'mudur_yardimcisi' | 'okul_muduru') => {
    setActiveAdminRole(role);
    if (role === 'memur') {
      setReviewerName('Evrak Kayıt Memuru');
      setActiveTab('clerk');
    } else if (role === 'mudur_yardimcisi') {
      setReviewerName('Fudan FİDAN');
      setActiveTab('deputy');
    } else if (role === 'okul_muduru') {
      setReviewerName('Recep KIZILIRMAK');
      setActiveTab('principal');
    }
  };

  // Filtreleme
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

  // KURAL: En eski talep en üstte kalsın (FIFO Sıralama: createdAt / documentDate bazında Ascending)
  const sortedPlans = [...filteredPlans].sort((a, b) => {
    const timeA = new Date(a.createdAt || a.documentDate || 0).getTime();
    const timeB = new Date(b.createdAt || b.documentDate || 0).getTime();
    return timeA - timeB; // En eski en başta
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
    if (inspectingPlan?.id === rejectingPlanId) {
      setInspectingPlan(null);
    }
  };

  const handleModalAdvance = (plan: GeziPlanData, role: 'memur' | 'mudur_yardimcisi' | 'okul_muduru') => {
    let defaultNote = '';
    if (role === 'memur') defaultNote = 'Ön inceleme ve mevzuat kontrolleri yapılmış olup evrak uygun görülmüştür.';
    if (role === 'mudur_yardimcisi') defaultNote = 'Sosyal Etkinlikler Kurulu incelemesi tamamlanmış, uygun görüşle makama sunulmuştur.';
    if (role === 'okul_muduru') defaultNote = 'Gezi planı incelenmiş, usul ve mevzuata uygun bulunarak MAKAM OLURU verilmiştir.';

    onAdvanceStage(plan.id, role, reviewerName, decisionNotes || defaultNote);
    setDecisionNotes('');
    setInspectingPlan(null);
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
                  Kademeli 3 Sistemli Onay Masası
                </span>
                <span className="text-xs text-indigo-300 hidden sm:inline">
                  1. İnceleme ➔ 2. Uygun Görüş ➔ 3. Makam Oluru
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
                Zeynep Kamil İlkokulu Gezi İzin, İnceleme & Makam Oluru Masası
              </h2>
            </div>
          </div>

          {/* View Mode Toggle & Analytics */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Rapor & Veri Butonu */}
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'list' ? 'analytics' : 'list')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'analytics'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{viewMode === 'analytics' ? 'Onay Listesine Dön' : '📊 İdare Takip & Rapor Verileri'}</span>
            </button>

            {/* CSV Dışa Aktar */}
            <button
              type="button"
              onClick={() => DatabaseService.downloadCSVReport(plans)}
              disabled={plans.length === 0}
              className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              title="Tüm Gezi Planlarını Excel / CSV Formatında İndir"
            >
              <Download className="w-4 h-4" />
              <span>Excel / CSV</span>
            </button>

          </div>

        </div>

        {/* 3 Sistemli Onay Makam Seçici Bar */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-indigo-200">Aktif İnceleme Yetkilisi:</span>
            <div className="flex flex-wrap items-center gap-1.5 bg-white/10 p-1 rounded-xl border border-white/15">
              
              {/* 1. Memur */}
              <button
                type="button"
                onClick={() => handleRoleChange('memur')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeAdminRole === 'memur'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>1. Memur (İnceleme)</span>
                {analytics.pendingClerk > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] bg-amber-900 text-amber-100 rounded-full font-black">
                    {analytics.pendingClerk}
                  </span>
                )}
              </button>

              {/* 2. Müdür Yardımcısı */}
              <button
                type="button"
                onClick={() => handleRoleChange('mudur_yardimcisi')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeAdminRole === 'mudur_yardimcisi'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>2. Fudan FİDAN (Uygun Görüş)</span>
                {analytics.pendingDeputy > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] bg-indigo-950 text-indigo-100 rounded-full font-black">
                    {analytics.pendingDeputy}
                  </span>
                )}
              </button>

              {/* 3. Okul Müdürü */}
              <button
                type="button"
                onClick={() => handleRoleChange('okul_muduru')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeAdminRole === 'okul_muduru'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>3. Recep KIZILIRMAK (Makam Oluru)</span>
                {analytics.pendingPrincipal > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] bg-red-950 text-red-100 rounded-full font-black">
                    {analytics.pendingPrincipal}
                  </span>
                )}
              </button>

            </div>
          </div>

          <div className="text-xs text-slate-300 flex items-center gap-1.5 bg-black/25 px-3 py-1.5 rounded-lg">
            <span>İmza Yetkilisi:</span>
            <strong className="text-white">{reviewerName}</strong>
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

          {/* 3 Sistemli Onay Akış Kartı */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
              <span>3 Kademeli Onay Akışı Takip Durumu</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 text-center">
                <span className="text-[11px] font-bold text-amber-800 uppercase block">1. Aşama: Memur İncelemesi</span>
                <span className="text-xl font-black text-amber-900 my-1 block">{analytics.pendingClerk} Plan</span>
                <span className="text-[10px] text-amber-700 block">Ön İnceleme Bekliyor</span>
              </div>

              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/60 text-center">
                <span className="text-[11px] font-bold text-indigo-800 uppercase block">2. Aşama: Md. Yrd. Uygun Görüş</span>
                <span className="text-xl font-black text-indigo-900 my-1 block">{analytics.pendingDeputy} Plan</span>
                <span className="text-[10px] text-indigo-700 block">Fudan FİDAN İncelemesinde</span>
              </div>

              <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/60 text-center">
                <span className="text-[11px] font-bold text-red-800 uppercase block">3. Aşama: Müdür Makam Oluru</span>
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

        {/* Search Bar & Order Info */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="text-[11px] font-bold text-slate-500 hidden xl:flex items-center gap-1">
            <span>⏱️ Sıralama: En eski talep en üstte (FIFO)</span>
          </div>

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

      </div>

      {/* Plan Cards List (En eski talep en üstte) */}
      {sortedPlans.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-700">Bu sekmede gösterilecek gezi planı bulunamadı</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {activeTab === 'clerk' && 'Memur ön incelemesinde bekleyen yeni gezi planı bulunmamaktadır.'}
            {activeTab === 'deputy' && 'Müdür Yardımcısı (Fudan FİDAN) incelemesinde bekleyen gezi planı bulunmamaktadır.'}
            {activeTab === 'principal' && 'Okul Müdürü (Recep KIZILIRMAK) makam olurunda bekleyen gezi planı bulunmamaktadır.'}
            {activeTab === 'approved' && 'Henüz kesin onaylanmış bir gezi planı bulunmuyor.'}
            {activeTab === 'all' && 'Kriterlerinize uygun gezi planı bulunamadı.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedPlans.map((plan, index) => {
            const deadlineCheck = checkTripDeadlineRule(plan.tripDate, plan.transportationType);
            const isClerkStage = plan.status === 'memur_incelemesinde';
            const isDeputyStage = plan.status === 'mudur_yardimcisi_onayinda';
            const isPrincipalStage = plan.status === 'mudur_onayinda';
            const isApproved = plan.status === 'onaylandi';
            const isRejected = plan.status === 'reddedildi';

            return (
              <div
                key={plan.id}
                onClick={() => setInspectingPlan(plan)}
                className={`bg-white rounded-2xl p-5 shadow-xs border transition-all hover:shadow-lg hover:border-indigo-300 cursor-pointer group relative ${
                  isClerkStage ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/10' :
                  isDeputyStage ? 'border-indigo-300 ring-1 ring-indigo-200 bg-indigo-50/10' :
                  isPrincipalStage ? 'border-red-300 ring-1 ring-red-200 bg-red-50/10' :
                  isApproved ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'
                }`}
              >
                {/* Sıra Numarası Rozeti (FIFO) */}
                <div className="absolute top-4 right-4 sm:right-6 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold border border-slate-200">
                  <span>Talep Sırası: #{index + 1}</span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left Info Column */}
                  <div className="space-y-2.5 min-w-0 flex-1 pr-16 sm:pr-0">
                    
                    {/* Status & Deadline Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      
                      {isClerkStage && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                          <span>1. Aşama: Memur Ön İncelemesinde</span>
                        </span>
                      )}

                      {isDeputyStage && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-900 border border-indigo-300 animate-pulse">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>2. Aşama: Fudan FİDAN (Uygun Görüş)</span>
                        </span>
                      )}

                      {isPrincipalStage && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-900 border border-red-300 animate-pulse">
                          <Award className="w-3.5 h-3.5" />
                          <span>3. Aşama: Recep KIZILIRMAK (Makam Oluru)</span>
                        </span>
                      )}

                      {isApproved && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Makam Oluru Verildi / Kesin Onaylandı</span>
                        </span>
                      )}

                      {isRejected && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-900 border border-rose-300">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Düzeltme İstenmiş / İade Edildi</span>
                        </span>
                      )}

                      {/* Deadline Kuralı */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        deadlineCheck.isEditable 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'bg-orange-50 text-orange-800 border border-orange-200'
                      }`}>
                        <Calendar className="w-3 h-3" />
                        <span>{deadlineCheck.message}</span>
                      </span>

                      <span className="text-xs text-slate-400 font-medium">
                        Talep Tarihi: {formatDate(plan.createdAt?.split('T')[0] || '')}
                      </span>
                    </div>

                    {/* Destination & School Name */}
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 group-hover:text-indigo-600 transition">
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
                            {plan.transportationType === 'Yürüyerek' ? 'Yürüyerek İntikal' : (plan.vehiclePlate || 'Plakasız')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stage History */}
                    <div className="text-[11px] space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>3 Kademeli Onay Durumu:</span>
                        </span>
                        <span className="text-[10px] text-indigo-600 font-bold group-hover:underline">
                          Tıklayın ve İnceleyin ➔
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {/* 1. Memur */}
                        <div className={`p-1.5 rounded-lg border text-[10px] ${
                          plan.clerkReviewedAt ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold' : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}>
                          <span className="block font-bold">1. Memur İncelemesi</span>
                          <span>{plan.clerkReviewedBy ? `${plan.clerkReviewedBy}` : 'Beklemede'}</span>
                        </div>

                        {/* 2. Md. Yrd */}
                        <div className={`p-1.5 rounded-lg border text-[10px] ${
                          plan.deputyApprovedAt ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold' : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}>
                          <span className="block font-bold">2. Md. Yrd. Uygun Görüş</span>
                          <span>{plan.deputyApprovedBy ? `${plan.deputyApprovedBy}` : 'Beklemede'}</span>
                        </div>

                        {/* 3. Müdür */}
                        <div className={`p-1.5 rounded-lg border text-[10px] ${
                          plan.principalApprovedAt ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold' : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}>
                          <span className="block font-bold">3. Okul Müdürü Makam Oluru</span>
                          <span>{plan.principalApprovedBy ? `${plan.principalApprovedBy}` : 'Beklemede'}</span>
                        </div>
                      </div>

                      {plan.approvalNotes && (
                        <div className="text-rose-700 font-semibold pt-1 border-t border-slate-200 mt-1">
                          Not: {plan.approvalNotes}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Right Actions Column */}
                  <div 
                    onClick={(e) => e.stopPropagation()} 
                    className="flex flex-row lg:flex-col items-center justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-4"
                  >
                    
                    {/* Detaylı İncele ve Onayla Butonu */}
                    <button
                      type="button"
                      onClick={() => setInspectingPlan(plan)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-indigo-900 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                    >
                      <FileCheck2 className="w-4 h-4 text-indigo-400" />
                      <span>İncele & Onayla</span>
                    </button>

                    {/* 1. Aşama Memur Hızlı Aksiyon */}
                    {isClerkStage && (
                      <button
                        type="button"
                        onClick={() => onAdvanceStage(plan.id, 'memur', reviewerName, 'Ön inceleme ve evrak kontrolleri yapılmıştır.')}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition cursor-pointer"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Md. Yrd.'na Sevk Et</span>
                      </button>
                    )}

                    {/* 2. Aşama Müdür Yardımcısı Hızlı Aksiyon */}
                    {isDeputyStage && (
                      <button
                        type="button"
                        onClick={() => onAdvanceStage(plan.id, 'mudur_yardimcisi', reviewerName, 'Sosyal etkinlikler incelemesi yapılmış ve uygun görülmüştür.')}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-900 bg-indigo-100 hover:bg-indigo-200 border border-indigo-300 rounded-xl transition cursor-pointer"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Müdür Oluruna Sun</span>
                      </button>
                    )}

                    {/* 3. Aşama Okul Müdürü Hızlı Aksiyon */}
                    {isPrincipalStage && (
                      <button
                        type="button"
                        onClick={() => onAdvanceStage(plan.id, 'okul_muduru', reviewerName, 'Makam oluru verilmiş ve gezi onaylanmıştır.')}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Makam Oluru Ver</span>
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
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Resmi Çıktı</span>
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

      {/* ========================================================================= */}
      {/* ============ DETAYLI İNCELEME VE 3 SİSTEMLİ ONAY MODALI ================== */}
      {/* ========================================================================= */}
      {inspectingPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-indigo-200">
                    Kademeli İnceleme & Onay Masası
                  </span>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    {inspectingPlan.destinationName} ({inspectingPlan.targetGrades})
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { setInspectingPlan(null); setDecisionNotes(''); }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
              
              {/* 3 Sistemli Onay Zinciri Durum Çubuğu */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  3 Aşamalı Kademeli Onay Süreci:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* 1. Memur İncelemesi */}
                  <div className={`p-3 rounded-xl border text-xs ${
                    inspectingPlan.clerkReviewedAt 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                      : inspectingPlan.status === 'memur_incelemesinde'
                      ? 'bg-amber-50 border-amber-300 text-amber-950 ring-2 ring-amber-400'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span>1. Aşama: İnceleme</span>
                      {inspectingPlan.clerkReviewedAt ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-amber-600" />}
                    </div>
                    <span className="text-[11px] font-semibold block">Evrak Kayıt Memuru</span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {inspectingPlan.clerkReviewedBy ? `${inspectingPlan.clerkReviewedBy} (${formatDate(inspectingPlan.clerkReviewedAt?.split('T')[0] || '')})` : 'İnceleme Bekliyor'}
                    </span>
                    {inspectingPlan.clerkNotes && (
                      <span className="text-[10px] text-emerald-700 italic block mt-1">"{inspectingPlan.clerkNotes}"</span>
                    )}
                  </div>

                  {/* 2. Müdür Yardımcısı Uygun Görüş */}
                  <div className={`p-3 rounded-xl border text-xs ${
                    inspectingPlan.deputyApprovedAt 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                      : inspectingPlan.status === 'mudur_yardimcisi_onayinda'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-950 ring-2 ring-indigo-400'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span>2. Aşama: Uygun Görüş</span>
                      {inspectingPlan.deputyApprovedAt ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <span className="text-[11px] font-semibold block">Fudan FİDAN (Md. Yrd.)</span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {inspectingPlan.deputyApprovedBy ? `${inspectingPlan.deputyApprovedBy} (${formatDate(inspectingPlan.deputyApprovedAt?.split('T')[0] || '')})` : 'Görüş Bekliyor'}
                    </span>
                    {inspectingPlan.deputyNotes && (
                      <span className="text-[10px] text-indigo-700 italic block mt-1">"{inspectingPlan.deputyNotes}"</span>
                    )}
                  </div>

                  {/* 3. Okul Müdürü Makam Oluru */}
                  <div className={`p-3 rounded-xl border text-xs ${
                    inspectingPlan.principalApprovedAt 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                      : inspectingPlan.status === 'mudur_onayinda'
                      ? 'bg-red-50 border-red-300 text-red-950 ring-2 ring-red-400'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span>3. Aşama: Makam Oluru</span>
                      {inspectingPlan.principalApprovedAt ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-red-600" />}
                    </div>
                    <span className="text-[11px] font-semibold block">Recep KIZILIRMAK (Müdür)</span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {inspectingPlan.principalApprovedBy ? `${inspectingPlan.principalApprovedBy} (${formatDate(inspectingPlan.principalApprovedAt?.split('T')[0] || '')})` : 'Makam Oluru Bekliyor'}
                    </span>
                    {inspectingPlan.principalNotes && (
                      <span className="text-[10px] text-red-700 italic block mt-1">"{inspectingPlan.principalNotes}"</span>
                    )}
                  </div>

                </div>
              </div>

              {/* Gezi Bilgileri Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Mekan ve Zaman */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h5 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span>Mekân ve Zaman Bilgileri</span>
                  </h5>
                  <div className="space-y-1 text-slate-700">
                    <div><strong>Gidilecek Yer:</strong> {inspectingPlan.destinationName}</div>
                    <div><strong>Kategori:</strong> {inspectingPlan.destinationCategory} ({inspectingPlan.tripType} - {inspectingPlan.tripDuration})</div>
                    <div><strong>İl / İlçe:</strong> {inspectingPlan.selectedCity} / {inspectingPlan.selectedDistrict}</div>
                    <div><strong>Gezi Tarihi:</strong> {formatDate(inspectingPlan.tripDate)} ({inspectingPlan.departureTime} - {inspectingPlan.returnTime})</div>
                    <div><strong>Adres:</strong> {inspectingPlan.destinationAddress || '-'}</div>
                  </div>
                </div>

                {/* Katılımcılar ve Ulaşım */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h5 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>Katılımcı & Ulaşım Bilgileri</span>
                  </h5>
                  <div className="space-y-1 text-slate-700">
                    <div><strong>Hedef Şubeler:</strong> {inspectingPlan.targetGrades}</div>
                    <div><strong>Öğrenci Sayısı:</strong> {inspectingPlan.totalStudentCount} (Erkek: {inspectingPlan.maleStudentCount}, Kız: {inspectingPlan.femaleStudentCount})</div>
                    <div><strong>Kafile Başkanı:</strong> {inspectingPlan.headTeacher?.fullName} ({inspectingPlan.headTeacher?.phone})</div>
                    <div><strong>Ulaşım Türü:</strong> {inspectingPlan.transportationType} {inspectingPlan.transportationType !== 'Yürüyerek' ? `(Plaka: ${inspectingPlan.vehiclePlate || 'Belirtilmedi'})` : '(Yürüyerek)'}</div>
                    <div><strong>Güzergah:</strong> {inspectingPlan.travelRoute || '-'}</div>
                  </div>
                </div>

              </div>

              {/* Maarif Modeli ve Öğrenme Çıktıları */}
              {(inspectingPlan.courseName || inspectingPlan.outcomes || inspectingPlan.purpose) && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h5 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span>Maarif Modeli Öğrenme Çıktıları & Ders Kazanımları</span>
                  </h5>
                  <div className="space-y-1 text-xs text-slate-700">
                    {inspectingPlan.courseName && (
                      <div><strong>İlgili Ders / Konu:</strong> {inspectingPlan.courseName} {inspectingPlan.subjectTopic ? `— ${inspectingPlan.subjectTopic}` : ''}</div>
                    )}
                    {inspectingPlan.purpose && (
                      <div><strong>Gezinin Amacı:</strong> {inspectingPlan.purpose}</div>
                    )}
                  </div>
                  {inspectingPlan.outcomes && (
                    <div className="space-y-1.5 pt-1">
                      <strong className="text-[11px] text-slate-500 uppercase block">Öğrenme Çıktıları / Kazanımlar:</strong>
                      {inspectingPlan.outcomes.split('\n').filter(line => line.trim().length > 0).map((outcome: string, i: number) => (
                        <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-800">
                          • {outcome}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Onay Karar ve Not Yazma Alanı */}
              <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-200 space-y-3">
                <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wider">
                  Yetkili Karar Notu (İsteğe Bağlı):
                </label>
                <input
                  type="text"
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder={`Örn: ${
                    activeAdminRole === 'memur' ? 'Evraklar incelendi, mevzuata uygundur.' :
                    activeAdminRole === 'mudur_yardimcisi' ? 'Sosyal Etkinlikler Kurulu incelemesi yapılmış ve uygun görülmüştür.' :
                    'Makam oluru verilmiş ve gezi onaylanmıştır.'
                  }`}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-indigo-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="bg-slate-100 p-4 sm:p-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPrintPlan(inspectingPlan)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-200 rounded-xl border border-slate-300 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>2 Sayfa Çıktı / PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectPlan(inspectingPlan);
                    setInspectingPlan(null);
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-indigo-800 bg-indigo-100 hover:bg-indigo-200 rounded-xl border border-indigo-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                  <span>Formda Aç</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRejectingPlanId(inspectingPlan.id)}
                  className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Düzeltme İste / İade Et</span>
                </button>
              </div>

              {/* 3 Sistemli Yetkili Onay Butonları */}
              <div className="flex items-center gap-2">
                
                {/* 1. Memur Ön İnceleme Butonu */}
                {inspectingPlan.status === 'memur_incelemesinde' && (
                  <button
                    type="button"
                    onClick={() => handleModalAdvance(inspectingPlan, 'memur')}
                    className="px-5 py-2.5 text-xs font-extrabold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-lg shadow-amber-600/25 flex items-center gap-2 cursor-pointer active:scale-95 transition"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>1. İnceleme Yapıldı (Müdür Yrd.'na Sevk Et)</span>
                  </button>
                )}

                {/* 2. Müdür Yardımcısı Uygun Görüş Butonu */}
                {inspectingPlan.status === 'mudur_yardimcisi_onayinda' && (
                  <button
                    type="button"
                    onClick={() => handleModalAdvance(inspectingPlan, 'mudur_yardimcisi')}
                    className="px-5 py-2.5 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer active:scale-95 transition"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>2. Uygun Görüşle Arz Et (Okul Müdürüne Sevk Et)</span>
                  </button>
                )}

                {/* 3. Okul Müdürü Makam Oluru Butonu */}
                {inspectingPlan.status === 'mudur_onayinda' && (
                  <button
                    type="button"
                    onClick={() => handleModalAdvance(inspectingPlan, 'okul_muduru')}
                    className="px-5 py-2.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center gap-2 cursor-pointer active:scale-95 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>3. Makam Oluru Ver (Kesin Onayla)</span>
                  </button>
                )}

                {inspectingPlan.status === 'onaylandi' && (
                  <span className="px-4 py-2 text-xs font-black text-emerald-800 bg-emerald-100 rounded-xl border border-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Makam Oluru Verilmiştir</span>
                  </span>
                )}

              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ======================= RET / DÜZELTME MODALI =========================== */}
      {/* ========================================================================= */}
      {rejectingPlanId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>Düzeltme Talebi / Planı İade Et</span>
            </h4>
            <p className="text-xs text-slate-500">
              Öğretmenin planı revize edebilmesi için eksik veya düzeltilmesi gereken hususları yazınız (Öğretmene e-posta bildirimi iletilecektir):
            </p>
            <textarea
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Örn: Veli izin belgeleri eksik / Araç plakası güncellenmeli / Gezi saati düzenlenmeli..."
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
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>İade Talebini Gönder</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
