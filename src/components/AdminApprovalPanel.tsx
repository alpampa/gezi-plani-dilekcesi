import React, { useState, useEffect } from 'react';
import type { GeziPlanData, AuthUser } from '../types';
import { checkTripDeadlineRule, DatabaseService } from '../services/db';
import { generateAndDownloadPlanPDF } from '../services/pdf';
import { CATEGORIES, ISTANBUL_DISTRICTS } from '../data/locations';
import { PostTripEvaluationModal } from './PostTripEvaluationModal';
import { EmailEngineModal } from './EmailEngineModal';
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
  X,
  FileDown,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  Star,
  Zap
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
    if (currentUser?.role === 'mudur_yardimcisi') return 'Funda FİDAN';
    if (currentUser?.role === 'okul_muduru') return 'Recep KIZILIRMAK';
    return 'Sultan YILDIRIM';
  });

  // Görünüm Modu: 'list' (Onay & Takip Listesi) veya 'analytics' (Raporlama & Veri Masası)
  const [viewMode, setViewMode] = useState<'list' | 'analytics'>('list');

  // Filtreler (Onay Listesi)
  const [activeTab, setActiveTab] = useState<'all' | 'clerk' | 'deputy' | 'principal' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Raporlama ve İstatistik Filtreleri (Yıl, Tarih, Gezi Türü, Ulaşım, Kategori)
  const [reportYear, setReportYear] = useState<string>('all');
  const [reportStartDate, setReportStartDate] = useState<string>('');
  const [reportEndDate, setReportEndDate] = useState<string>('');
  const [reportTripType, setReportTripType] = useState<string>('all');
  const [reportTransportType, setReportTransportType] = useState<string>('all');
  const [reportCategory, setReportCategory] = useState<string>('all');
  const [reportDistrict, setReportDistrict] = useState<string>('all');
  const [reportStatus, setReportStatus] = useState<string>('all');
  const [reportEvalStatus, setReportEvalStatus] = useState<string>('all');

  // Değerlendirme Modalı
  const [evaluatingPlan, setEvaluatingPlan] = useState<GeziPlanData | null>(null);

  // E-Posta Motoru Modalı
  const [isEmailEngineOpen, setIsEmailEngineOpen] = useState(false);

  // Detaylı İnceleme Modalı (Üzerine tıklayınca açılan)
  const [inspectingPlan, setInspectingPlan] = useState<GeziPlanData | null>(null);
  const [decisionNotes, setDecisionNotes] = useState<string>('');

  // Ret / Düzeltme Modalı
  const [rejectingPlanId, setRejectingPlanId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  // Genel İstatistikler
  const generalAnalytics = DatabaseService.getAnalyticsData(plans);

  // Dinamik Yıl Listesi (Kayıtlı planlardan otomatik çıkarılır)
  const availableYears = Array.from(
    new Set(
      plans.map(p => p.tripDate?.split('-')[0] || p.createdAt?.split('-')[0] || '2026')
    )
  ).sort().reverse();

  // Props currentUser değişirse
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'mudur_yardimcisi') {
        setActiveAdminRole('mudur_yardimcisi');
        setReviewerName(currentUser.fullName || 'Funda FİDAN');
      } else if (currentUser.role === 'okul_muduru') {
        setActiveAdminRole('okul_muduru');
        setReviewerName(currentUser.fullName || 'Recep KIZILIRMAK');
      } else if (currentUser.role === 'memur') {
        setActiveAdminRole('memur');
        setReviewerName(currentUser.fullName || 'Sultan YILDIRIM');
      }
    }
  }, [currentUser]);

  // Rol değiştiğinde yetkili adını güncelle
  const handleRoleChange = (role: 'memur' | 'mudur_yardimcisi' | 'okul_muduru') => {
    setActiveAdminRole(role);
    if (role === 'memur') {
      setReviewerName(currentUser?.fullName || 'Sultan YILDIRIM');
    } else if (role === 'mudur_yardimcisi') {
      setReviewerName(currentUser?.fullName || 'Funda FİDAN');
    } else if (role === 'okul_muduru') {
      setReviewerName(currentUser?.fullName || 'Recep KIZILIRMAK');
    }
  };

  // Liste Modu Filtreleme
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
    return timeA - timeB; // En eski talep en üstte
  });

  // Raporlama Modu Filtrelenmiş Veriler
  const reportFilteredPlans = plans.filter(p => {
    if (reportYear !== 'all') {
      const y = p.tripDate ? p.tripDate.split('-')[0] : (p.createdAt ? p.createdAt.split('-')[0] : '');
      if (y !== reportYear) return false;
    }
    if (reportStartDate && p.tripDate && p.tripDate < reportStartDate) return false;
    if (reportEndDate && p.tripDate && p.tripDate > reportEndDate) return false;
    if (reportTripType !== 'all' && p.tripType !== reportTripType) return false;
    if (reportTransportType !== 'all' && p.transportationType !== reportTransportType) return false;
    if (reportCategory !== 'all' && p.destinationCategory !== reportCategory) return false;
    if (reportDistrict !== 'all' && p.selectedDistrict !== reportDistrict) return false;
    if (reportStatus !== 'all' && p.status !== reportStatus) return false;
    if (reportEvalStatus === 'evaluated' && !p.postTripEvaluation) return false;
    if (reportEvalStatus === 'not_evaluated' && p.postTripEvaluation) return false;
    return true;
  });

  const reportAnalytics = DatabaseService.getAnalyticsData(reportFilteredPlans);

  const resetReportFilters = () => {
    setReportYear('all');
    setReportStartDate('');
    setReportEndDate('');
    setReportTripType('all');
    setReportTransportType('all');
    setReportCategory('all');
    setReportDistrict('all');
    setReportStatus('all');
    setReportEvalStatus('all');
  };

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
    if (role === 'mudur_yardimcisi') defaultNote = 'Sosyal Etkinlikler Kurulu incelemesi tamamlanmış, uygun görüşle makama arz edilmiştir.';
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
              <span>{viewMode === 'analytics' ? 'Onay Listesine Dön' : '📊 Yıl & Tarih Bazlı Raporlama Masası'}</span>
            </button>

            {/* E-Posta Motoru Butonu */}
            <button
              type="button"
              onClick={() => setIsEmailEngineOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Otomatik E-Posta Motoru Ayarları, Test ve Gönderim Günlüğü"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>E-Posta Motoru</span>
            </button>

            {/* CSV Dışa Aktar */}
            <button
              type="button"
              onClick={() => DatabaseService.downloadCSVReport(plans, 'MEB_Zeynep_Kamil_Gezi_Raporu')}
              disabled={plans.length === 0}
              className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              title="Tüm Gezi Planlarını Excel / CSV Formatında İndir"
            >
              <Download className="w-4 h-4" />
              <span>Tüm Veritabanı CSV</span>
            </button>

          </div>

        </div>

        {/* 3 Sistemli Onay Makam Seçici Bar & Üst Makam Yetki Açıklaması */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-indigo-200">İşlem Yapan Yetkili:</span>
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
                {generalAnalytics.pendingClerk > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] bg-amber-900 text-amber-100 rounded-full font-black">
                    {generalAnalytics.pendingClerk}
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
                <span>2. Funda FİDAN (Uygun Görüş)</span>
                {generalAnalytics.pendingDeputy > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] bg-indigo-950 text-indigo-100 rounded-full font-black">
                    {generalAnalytics.pendingDeputy}
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
                {generalAnalytics.pendingPrincipal > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] bg-red-950 text-red-100 rounded-full font-black">
                    {generalAnalytics.pendingPrincipal}
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

        {/* Üst Makam Bilgilendirme Notu */}
        <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-2 text-[11px] text-indigo-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            <strong>Hiyerarşik Onay & Veri Bütünlüğü:</strong> Üst makam alt birim onayını beklemeden onaylayabilir. Veritabanındaki tüm eski ve yeni kayıtlar otomatik entegre edilerek %100 korunmaktadır.
          </span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* ================= VIEW MODE 1: YIL, TARİH & TÜR RAPORLAMA MASASI ======= */}
      {/* ========================================================================= */}
      {viewMode === 'analytics' ? (
        <div className="space-y-6">
          
          {/* FİLTRE VE ARAMA PANELİ */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                <span>Gelişmiş Faaliyet & Gezi Raporlama Filtreleri</span>
              </h3>

              <button
                type="button"
                onClick={resetReportFilters}
                className="text-xs text-slate-500 hover:text-red-600 font-bold flex items-center gap-1 cursor-pointer transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Filtreleri Sıfırla</span>
              </button>
            </div>

            {/* Filtre Dropdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              
              {/* 1. Yıl Filtresi */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Eğitim Yılı / Takvim Yılı</label>
                <select
                  value={reportYear}
                  onChange={(e) => setReportYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-semibold"
                >
                  <option value="all">Tüm Yıllar ({plans.length} Plan)</option>
                  {availableYears.map(yr => (
                    <option key={yr} value={yr}>{yr} Yılı</option>
                  ))}
                </select>
              </div>

              {/* 2. Gezi Türü */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Gezi Türü</label>
                <select
                  value={reportTripType}
                  onChange={(e) => setReportTripType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-semibold"
                >
                  <option value="all">Tüm Gezi Türleri</option>
                  <option value="İl İçi">İl İçi Geziler</option>
                  <option value="İl Dışı">İl Dışı Geziler</option>
                </select>
              </div>

              {/* 3. Ulaşım Şekli */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ulaşım Şekli</label>
                <select
                  value={reportTransportType}
                  onChange={(e) => setReportTransportType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-semibold"
                >
                  <option value="all">Tüm Ulaşım Şekilleri</option>
                  <option value="Belediye / Toplu Taşıma">Belediye / Toplu Taşıma (15 Gün)</option>
                  <option value="Okul Servis Aracı">Okul Servis Aracı</option>
                  <option value="Özel Turizm Otobüsü">Özel Turizm Otobüsü</option>
                  <option value="Yürüyerek">Yürüyerek İntikal</option>
                </select>
              </div>

              {/* 4. Onay Durumu */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Onay Durumu</label>
                <select
                  value={reportStatus}
                  onChange={(e) => setReportStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-semibold"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="onaylandi">Makam Oluru Verildi (Kesin Onaylı)</option>
                  <option value="memur_incelemesinde">1. Memur Ön İncelemesinde</option>
                  <option value="mudur_yardimcisi_onayinda">2. Md. Yrd. (Funda FİDAN) Onayında</option>
                  <option value="mudur_onayinda">3. Okul Müdürü (Recep KIZILIRMAK) Olurunda</option>
                  <option value="reddedildi">Düzeltme İstenmiş / İade Edildi</option>
                </select>
              </div>

              {/* 5. Tarih Aralığı: Başlangıç */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Başlangıç Tarihi</label>
                <input
                  type="date"
                  value={reportStartDate}
                  onChange={(e) => setReportStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-semibold"
                />
              </div>

              {/* 6. Tarih Aralığı: Bitiş */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Bitiş Tarihi</label>
                <input
                  type="date"
                  value={reportEndDate}
                  onChange={(e) => setReportEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-semibold"
                />
              </div>

              {/* 7. Kategori */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mekân Kategorisi</label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-semibold"
                >
                  <option value="all">Tüm Kategoriler</option>
                  {CATEGORIES.filter(c => c !== 'Tüm Kategoriler').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* 8. İlçe */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ziyaret Edilen İlçe</label>
                <select
                  value={reportDistrict}
                  onChange={(e) => setReportDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-semibold"
                >
                  <option value="all">Tüm İlçeler</option>
                  {ISTANBUL_DISTRICTS.filter(d => d !== 'Tüm İlçeler').map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* 9. Değerlendirme Durumu */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Değerlendirme Durumu</label>
                <select
                  value={reportEvalStatus}
                  onChange={(e) => setReportEvalStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-semibold"
                >
                  <option value="all">Tümü (Değerlendirilmiş & Bekleyen)</option>
                  <option value="evaluated">✅ Değerlendirildi (Raporlu)</option>
                  <option value="not_evaluated">⏳ Değerlendirilmedi (Bekliyor)</option>
                </select>
              </div>

            </div>

            {/* Filtrelenmiş Rapor Dışa Aktarma Butonları */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-600">
                Filtreye Uyan: <strong className="text-indigo-700">{reportFilteredPlans.length} Gezi Planı</strong> (Toplam {reportAnalytics.totalStudents} Öğrenci)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => DatabaseService.downloadCSVReport(reportFilteredPlans, `Zeynep_Kamil_Gezi_Raporu_${reportYear}_${reportTripType}`)}
                  disabled={reportFilteredPlans.length === 0}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-40"
                >
                  <Download className="w-4 h-4" />
                  <span>Filtrelenmiş Excel/CSV İndir</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Resmi Faaliyet Raporunu Yazdır</span>
                </button>
              </div>
            </div>

          </div>

          {/* Filtrelenmiş KPI Kartları */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Filtrelenen Gezi</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{reportAnalytics.totalPlans} Plan</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">{reportAnalytics.approvedPlans} Makam Oluru, {reportAnalytics.totalPending} Süreçte</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider block">Toplam Katılımcı</span>
              <span className="text-2xl font-black text-blue-700 mt-1 block">{reportAnalytics.totalStudents} Öğrenci</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">{reportAnalytics.totalMale} Erkek / {reportAnalytics.totalFemale} Kız</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider block">Görevli & Refakatçi</span>
              <span className="text-2xl font-black text-indigo-700 mt-1 block">{reportAnalytics.totalTeachers} Öğretmen</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">+{reportAnalytics.totalCompanions} Veli Refakatçi</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider block">Onay Oranı</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                {reportAnalytics.totalPlans > 0 ? `%${Math.round((reportAnalytics.approvedPlans / reportAnalytics.totalPlans) * 100)}` : '%0'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">{reportAnalytics.approvedPlans} Kesin Onaylı Gezi</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Gezi Değerlendirme</span>
              <span className="text-2xl font-black text-emerald-950 mt-1 block">
                {reportAnalytics.evaluatedCount} / {reportAnalytics.approvedPlans} Rapor
              </span>
              <span className="text-[11px] text-emerald-700 block mt-0.5">
                {reportAnalytics.evaluatedCount > 0 ? `Ortalama: ⭐ ${reportAnalytics.averageRating}/5` : 'Henüz rapor girilmedi'}
              </span>
            </div>
          </div>

          {/* Kategori, İlçe, Ulaşım & Tür Dağılım Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 1. Ulaşım Türü Dağılımı */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Bus className="w-4 h-4 text-amber-500" />
                <span>Ulaşım Türü Analizi</span>
              </h4>
              <div className="space-y-2">
                {Object.entries(reportAnalytics.transportMap).map(([t, count]) => (
                  <div key={t} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                    <span className="font-semibold text-slate-700">{t}</span>
                    <span className="font-extrabold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full">{count} Gezi</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Kategorilere Göre Dağılım */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>Mekân Kategorileri Dağılımı</span>
              </h4>
              <div className="space-y-2">
                {Object.entries(reportAnalytics.categoriesMap).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                    <span className="font-semibold text-slate-700 truncate max-w-[170px]">{cat}</span>
                    <span className="font-extrabold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full shrink-0">{count} Gezi</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. İlçelere Göre Dağılım */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-500" />
                <span>İlçelere Göre Dağılım</span>
              </h4>
              <div className="space-y-2">
                {Object.entries(reportAnalytics.districtsMap).map(([dist, count]) => (
                  <div key={dist} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                    <span className="font-semibold text-slate-700">{dist}</span>
                    <span className="font-extrabold px-2 py-0.5 bg-red-100 text-red-800 rounded-full">{count} Gezi</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Filtrelenmiş Gezi Rapor Çizelgesi */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Filtrelenmiş Faaliyet Planı Çizelgesi ({reportFilteredPlans.length} Kayıt)</span>
            </h4>

            {reportFilteredPlans.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Seçilen filtrelere uygun gezi planı bulunamadı.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                      <th className="p-2.5">Gezi Yeri</th>
                      <th className="p-2.5">Tarih</th>
                      <th className="p-2.5">Şubeler</th>
                      <th className="p-2.5">Öğrenci</th>
                      <th className="p-2.5">Kafile Başkanı</th>
                      <th className="p-2.5">Ulaşım</th>
                      <th className="p-2.5">Durum</th>
                      <th className="p-2.5">Değerlendirme</th>
                      <th className="p-2.5 text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportFilteredPlans.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-2.5 font-bold text-slate-900">{p.destinationName}</td>
                        <td className="p-2.5 text-slate-600">{formatDate(p.tripDate)}</td>
                        <td className="p-2.5 text-slate-700 font-semibold">{p.targetGrades}</td>
                        <td className="p-2.5 font-bold text-indigo-700">{p.totalStudentCount}</td>
                        <td className="p-2.5 text-slate-600">{p.headTeacher?.fullName || p.submittedBy || '-'}</td>
                        <td className="p-2.5 text-slate-600">{p.transportationType}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'onaylandi' ? 'bg-emerald-100 text-emerald-800' :
                            p.status === 'reddedildi' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {p.status === 'onaylandi' ? 'Onaylandı' :
                             p.status === 'memur_incelemesinde' ? 'Memurda' :
                             p.status === 'mudur_yardimcisi_onayinda' ? 'Md. Yrd.da' :
                             p.status === 'mudur_onayinda' ? 'Müdürde' : 'Taslak'}
                          </span>
                        </td>
                        <td className="p-2.5">
                          {p.postTripEvaluation ? (
                            <button
                              type="button"
                              onClick={() => setEvaluatingPlan(p)}
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1 hover:bg-emerald-200 cursor-pointer shadow-xs transition"
                              title="MEB Gezi Sonuç Değerlendirme Raporunu Aç"
                            >
                              <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                              <span>⭐ {p.postTripEvaluation.overallRating}/5</span>
                            </button>
                          ) : p.status === 'onaylandi' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              Değerlendirilmedi
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">-</span>
                          )}
                        </td>
                        <td className="p-2.5 text-right flex items-center justify-end gap-1">
                          {p.postTripEvaluation && (
                            <button
                              type="button"
                              onClick={() => setEvaluatingPlan(p)}
                              className="px-2 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg cursor-pointer"
                              title="Gezi Sonrası Değerlendirme Raporunu Gör"
                            >
                              Rapor
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setInspectingPlan(p)}
                            className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer"
                          >
                            İncele
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
            <span>1. Memur ({generalAnalytics.pendingClerk})</span>
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
            <span>2. Md. Yrd ({generalAnalytics.pendingDeputy})</span>
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
            <span>3. Müdür ({generalAnalytics.pendingPrincipal})</span>
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
            <span>Onaylı ({generalAnalytics.approvedPlans})</span>
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
            <span>Düzeltme ({generalAnalytics.rejectedPlans})</span>
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
            {activeTab === 'deputy' && 'Müdür Yardımcısı (Funda FİDAN) incelemesinde bekleyen gezi planı bulunmamaktadır.'}
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
                          <span>2. Aşama: Funda FİDAN (Uygun Görüş)</span>
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
                          <span>Makam Oluru Verildi (ONAYLANDI)</span>
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

                      {/* Değerlendirme Rozeti */}
                      {plan.postTripEvaluation ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEvaluatingPlan(plan);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200 transition shadow-xs cursor-pointer"
                          title="Gezi Değerlendirme Raporunu Aç"
                        >
                          <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                          <span>⭐ {plan.postTripEvaluation.overallRating}/5 Değerlendirildi</span>
                        </button>
                      ) : isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <span>Değerlendirilmedi (Bekliyor)</span>
                        </span>
                      ) : null}

                      <span className="text-xs text-slate-400 font-medium">
                        Talep: {formatDate(plan.createdAt?.split('T')[0] || '')}
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

                    {/* HİYERARŞİK ONAY AKSİYONLARI:
                        1. Okul Müdürü her an Makam Oluru verebilir
                        2. Md. Yrd her an Uygun Görüş ile Müdüre sunabilir
                        3. Memur 1. aşamada sevk edebilir */}
                    
                    {/* Okul Müdürü Yetkisi (Her zaman doğrudan onaylayabilir) */}
                    {activeAdminRole === 'okul_muduru' && !isApproved && !isRejected && (
                      <button
                        type="button"
                        onClick={() => onAdvanceStage(plan.id, 'okul_muduru', reviewerName, 'Makam oluru verilmiş ve gezi kesin olarak onaylanmıştır.')}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Makam Oluru Ver (Onayla)</span>
                      </button>
                    )}

                    {/* Müdür Yardımcısı Yetkisi (Memur beklemeden Müdüre sunabilir) */}
                    {activeAdminRole === 'mudur_yardimcisi' && (isClerkStage || isDeputyStage) && (
                      <button
                        type="button"
                        onClick={() => onAdvanceStage(plan.id, 'mudur_yardimcisi', reviewerName, 'Sosyal etkinlikler incelemesi yapılmış ve uygun görüşle makama sunulmuştur.')}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition cursor-pointer"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Müdür Oluruna Sun</span>
                      </button>
                    )}

                    {/* Memur Yetkisi (1. Aşamada) */}
                    {activeAdminRole === 'memur' && isClerkStage && (
                      <button
                        type="button"
                        onClick={() => onAdvanceStage(plan.id, 'memur', reviewerName, 'Ön inceleme ve evrak kontrolleri yapılmıştır.')}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition cursor-pointer"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Md. Yrd.'na Sevk Et</span>
                      </button>
                    )}

                    {/* Düzeltme İste Butonu */}
                    {!isApproved && !isRejected && (
                      <button
                        type="button"
                        onClick={() => setRejectingPlanId(plan.id)}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Düzeltme İste</span>
                      </button>
                    )}

                    {/* PDF İndir Butonu */}
                    <button
                      type="button"
                      onClick={async () => {
                        await generateAndDownloadPlanPDF(plan);
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 transition cursor-pointer"
                      title="2 Sayfalık Resmi A4 Gezi Raporunu PDF Olarak İndir"
                    >
                      <FileDown className="w-3.5 h-3.5 text-red-600" />
                      <span>PDF İndir</span>
                    </button>

                    {/* Gezi Sonrası Değerlendirme Raporu Butonu */}
                    {plan.postTripEvaluation && (
                      <button
                        type="button"
                        onClick={() => setEvaluatingPlan(plan)}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition cursor-pointer"
                        title="Gezi Değerlendirme Raporunu İncele & Yazdır"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Değerlendirme Raporu</span>
                      </button>
                    )}

                    {/* Resmi Yazdır Butonu */}
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
              
              {/* Teslim Zorunluluğu ve Onay Uyarısı */}
              <div className="bg-amber-500/10 border border-amber-300 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-amber-900">RESMİ EVRAK VE ÇIKTI TESLİM KURALI:</strong>
                  <span>
                    Makam Oluru verilen gezi planlarının 2 sayfalık resmi çıktısının ıslak imzalı olarak gezi tarihinden önce (Belediye araç talepli gezilerde en az 15 gün, diğer gezilerde en az 7 gün önce) okul idaresine / evrak kayıt memuruna teslim edilmesi zorunludur.
                  </span>
                </div>
              </div>

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
                    <span className="text-[11px] font-semibold block">Funda FİDAN (Md. Yrd.)</span>
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

              {/* MEB Gezi Sonrası Değerlendirme Raporu Durumu */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    <span>MEB Gezi Sonrası Değerlendirme Raporu (Ek-8)</span>
                  </h5>

                  {inspectingPlan.postTripEvaluation ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1 shadow-xs">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      <span>Değerlendirildi ({inspectingPlan.postTripEvaluation.overallRating}/5)</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                      Değerlendirme Bekleniyor
                    </span>
                  )}
                </div>

                {inspectingPlan.postTripEvaluation ? (
                  <div className="space-y-2.5 pt-1">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Fiili Katılan:</span>
                        <strong className="text-slate-900">{inspectingPlan.postTripEvaluation.actualStudentCount} Öğrenci</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Kazanım Düzeyi:</span>
                        <strong className="text-slate-900 capitalize">{inspectingPlan.postTripEvaluation.outcomesAttainmentLevel}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Güvenlik:</span>
                        <strong className="text-emerald-700 capitalize">{inspectingPlan.postTripEvaluation.safetyAndHealthStatus}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Tavsiye:</span>
                        <strong className="text-indigo-700 capitalize">{inspectingPlan.postTripEvaluation.recommendationStatus}</strong>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs italic text-slate-700">
                      "{inspectingPlan.postTripEvaluation.summaryConclusion}"
                    </div>

                    <button
                      type="button"
                      onClick={() => setEvaluatingPlan(inspectingPlan)}
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Tam Değerlendirme Raporunu Aç & Yazdır</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    * Bu gezi için henüz öğretmen/kafile başkanı tarafından gezi sonrası değerlendirme formu doldurulmamıştır. Gezi gerçekleştikten sonra öğretmen portalından doldurulup idare incelemesine sunulacaktır.
                  </p>
                )}
              </div>

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
                {/* PDF İndir */}
                <button
                  type="button"
                  onClick={async () => {
                    await generateAndDownloadPlanPDF(inspectingPlan);
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-200 rounded-xl border border-slate-300 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FileDown className="w-4 h-4 text-red-600" />
                  <span>PDF İndir</span>
                </button>

                {/* Yazdır */}
                <button
                  type="button"
                  onClick={() => onPrintPlan(inspectingPlan)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-200 rounded-xl border border-slate-300 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>2 Sayfa Çıktı</span>
                </button>

                {/* Formda Aç */}
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

                {/* Düzeltme İste */}
                {!inspectingPlan.status.startsWith('onaylandi') && (
                  <button
                    type="button"
                    onClick={() => setRejectingPlanId(inspectingPlan.id)}
                    className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Düzeltme İste / İade Et</span>
                  </button>
                )}
              </div>

              {/* HİYERARŞİK ONAY BUTONLARI (MODAL İÇİ) */}
              <div className="flex items-center gap-2">
                
                {/* 1. Memur Ön İnceleme Butonu */}
                {activeAdminRole === 'memur' && inspectingPlan.status === 'memur_incelemesinde' && (
                  <button
                    type="button"
                    onClick={() => handleModalAdvance(inspectingPlan, 'memur')}
                    className="px-5 py-2.5 text-xs font-extrabold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-lg shadow-amber-600/25 flex items-center gap-2 cursor-pointer active:scale-95 transition"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>1. İnceleme Yapıldı (Müdür Yrd.'na Sevk Et)</span>
                  </button>
                )}

                {/* 2. Müdür Yardımcısı Uygun Görüş Butonu (Memur aşamasında dahi olsa sevk edebilir) */}
                {activeAdminRole === 'mudur_yardimcisi' && inspectingPlan.status !== 'onaylandi' && inspectingPlan.status !== 'reddedildi' && inspectingPlan.status !== 'mudur_onayinda' && (
                  <button
                    type="button"
                    onClick={() => handleModalAdvance(inspectingPlan, 'mudur_yardimcisi')}
                    className="px-5 py-2.5 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer active:scale-95 transition"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>2. Uygun Görüşle Arz Et (Okul Müdürüne Sevk Et)</span>
                  </button>
                )}

                {/* 3. Okul Müdürü Makam Oluru Butonu (Her aşamada doğrudan onaylayabilir) */}
                {activeAdminRole === 'okul_muduru' && inspectingPlan.status !== 'onaylandi' && inspectingPlan.status !== 'reddedildi' && (
                  <button
                    type="button"
                    onClick={() => handleModalAdvance(inspectingPlan, 'okul_muduru')}
                    className="px-5 py-2.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center gap-2 cursor-pointer active:scale-95 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>3. Makam Oluru Ver (Doğrudan Onayla)</span>
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

      {/* ========================================================================= */}
      {/* ================ GEZİ SONRASI DEĞERLENDİRME RAPORU MODALI ============== */}
      {/* ========================================================================= */}
      {evaluatingPlan && (
        <PostTripEvaluationModal
          isOpen={!!evaluatingPlan}
          onClose={() => setEvaluatingPlan(null)}
          plan={evaluatingPlan}
          currentUser={currentUser}
          onSaveEvaluation={(planId, evaluation) => {
            DatabaseService.savePostTripEvaluation(planId, evaluation);
            setEvaluatingPlan(null);
          }}
          readOnly={true}
        />
      )}

      {/* ========================================================================= */}
      {/* ================ OTOMATİK E-POSTA MOTORU MODALI ========================= */}
      {/* ========================================================================= */}
      {isEmailEngineOpen && (
        <EmailEngineModal
          isOpen={isEmailEngineOpen}
          onClose={() => setIsEmailEngineOpen(false)}
          samplePlan={plans[0]}
        />
      )}

    </div>
  );
};
