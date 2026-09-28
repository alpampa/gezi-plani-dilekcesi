import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { Header } from './components/Header';
import { GeziForm } from './components/GeziForm';
import { PrintDocument } from './components/PrintDocument';
import { SavedPlansModal } from './components/SavedPlansModal';
import { ApprovalModal } from './components/ApprovalModal';
import { AdminApprovalPanel } from './components/AdminApprovalPanel';
import { GitHubSyncModal } from './components/GitHubSyncModal';
import type { GeziPlanData, UserRole } from './types';
import { INITIAL_EMPTY_PLAN, SAMPLE_POPULATED_PLAN } from './data/locations';
import { DatabaseService } from './services/db';
import { Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles, GraduationCap, Building2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  // Her açılışta ve onay sonrası YENİ BOŞ EKRAN oluşturucu
  const createNewPlanObject = (): GeziPlanData => ({
    ...INITIAL_EMPTY_PLAN,
    id: 'gezi-' + Date.now(),
    documentNumber: '',
    principalName: 'Recep KIZILIRMAK',
    deputyPrincipalName: 'Fudan FİDAN',
    status: 'taslak',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [userRole, setUserRole] = useState<UserRole>('ogretmen');
  const [currentPlan, setCurrentPlan] = useState<GeziPlanData>(createNewPlanObject());
  const [savedPlans, setSavedPlans] = useState<GeziPlanData[]>([]);
  
  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isGitHubSyncOpen, setIsGitHubSyncOpen] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Load saved plans on mount
  const refreshPlans = () => {
    const plans = DatabaseService.getPlans();
    setSavedPlans(plans);
  };

  useEffect(() => {
    refreshPlans();
  }, []);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Form field update
  const handleFormChange = (updated: Partial<GeziPlanData>) => {
    setCurrentPlan(prev => ({
      ...prev,
      ...updated,
      updatedAt: new Date().toISOString()
    }));
  };

  // New Blank Form
  const handleNewPlan = () => {
    if (window.confirm('Yeni bir boş gezi planı oluşturmak istediğinize emin misiniz?')) {
      setCurrentPlan(createNewPlanObject());
      setUserRole('ogretmen');
      showToast('Yeni boş gezi planı formu açıldı.', 'info');
    }
  };

  // Load Sample Data
  const handleLoadSample = () => {
    setCurrentPlan({
      ...SAMPLE_POPULATED_PLAN,
      id: 'gezi-' + Date.now(),
      documentNumber: '',
      principalName: 'Recep KIZILIRMAK',
      deputyPrincipalName: 'Fudan FİDAN',
      status: 'taslak',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.2 } });
    } catch (_) {}
    setUserRole('ogretmen');
    showToast('Örnek Rahmi M. Koç / Bilim Üsküdar gezi planı yüklendi.', 'success');
  };

  // Save current plan as draft
  const handleSaveDraft = () => {
    const res = DatabaseService.savePlan({
      ...currentPlan,
      status: currentPlan.status || 'taslak'
    });
    if (res.success) {
      refreshPlans();
      try {
        confetti({ particleCount: 30, spread: 40 });
      } catch (_) {}
      showToast('Gezi planı taslak olarak veritabanına kaydedildi.', 'success');
    } else {
      showToast('Kaydetme sırasında bir hata oluştu.', 'error');
    }
  };

  // Submit plan for admin approval
  const handleOpenApprovalModal = () => {
    if (!currentPlan.destinationName.trim()) {
      alert('Lütfen en azından gezi mekân adını belirtiniz.');
      return;
    }
    setIsApprovalModalOpen(true);
  };

  // Confirm submission: Save with status 'onay_bekliyor' and RESET to clean new blank form!
  const handleConfirmSubmit = (teacherName: string, teacherNotes?: string) => {
    const planToSubmit: GeziPlanData = {
      ...currentPlan,
      status: 'onay_bekliyor',
      submittedBy: teacherName,
      approvalNotes: teacherNotes ? `Öğretmen Notu: ${teacherNotes}` : undefined,
      headTeacher: {
        ...currentPlan.headTeacher,
        fullName: teacherName || currentPlan.headTeacher.fullName
      },
      updatedAt: new Date().toISOString()
    };

    const res = DatabaseService.savePlan(planToSubmit);
    setIsApprovalModalOpen(false);

    if (res.success) {
      refreshPlans();
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.3 } });
      } catch (_) {}
      
      showToast(`"${planToSubmit.destinationName}" planı Okul İdaresi (Recep KIZILIRMAK / Fudan FİDAN) onayına sunuldu.`, 'success');
      
      // Kullanıcının istediği gibi EKRAN YENİ BOŞ KAYIT EKRANINA DÖNSÜN:
      setCurrentPlan(createNewPlanObject());
    } else {
      showToast('Plan onay veritabanına gönderilirken bir hata oluştu.', 'error');
    }
  };

  // Admin: Approve Plan
  const handleApprovePlan = (planId: string, adminName: string, notes?: string) => {
    const res = DatabaseService.updateStatus(planId, 'onaylandi', adminName, notes);
    if (res.success) {
      refreshPlans();
      try {
        confetti({ particleCount: 60, spread: 60 });
      } catch (_) {}
      showToast(`Gezi planı ${adminName} tarafından onaylandı ve makam oluru verildi.`, 'success');
    }
  };

  // Admin: Reject / Request revision
  const handleRejectPlan = (planId: string, notes: string) => {
    const res = DatabaseService.updateStatus(planId, 'reddedildi', 'Okul İdaresi', notes);
    if (res.success) {
      refreshPlans();
      showToast('Düzeltme talebi kaydedildi.', 'info');
    }
  };

  // Delete saved plan
  const handleDeletePlan = (id: string) => {
    DatabaseService.deletePlan(id);
    refreshPlans();
    showToast('Plan kaydı veritabanından silindi.', 'info');
  };

  // Load selected plan into form
  const handleLoadPlan = (plan: GeziPlanData) => {
    setCurrentPlan(plan);
    setUserRole('ogretmen');
    showToast(`"${plan.destinationName || 'Seçilen Gezi'}" planı forma aktarıldı.`, 'success');
  };

  // Print specific plan
  const handlePrintPlan = (plan: GeziPlanData) => {
    setCurrentPlan(plan);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Export JSON backup
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedPlans, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `MEB_Gezi_Planlari_Veritabani_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Gezi planları veritabanı yedek dosyası indirildi.', 'success');
  };

  // Import JSON backup
  const handleImportJSON = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          localStorage.setItem('odos_gezi_plani_saved_records_v1', JSON.stringify(parsed));
          refreshPlans();
          showToast(`${parsed.length} adet gezi planı başarıyla içe aktarıldı.`, 'success');
        } else {
          showToast('Geçersiz dosya biçimi.', 'error');
        }
      } catch (err) {
        showToast('JSON dosyası okunurken hata oluştu.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Print Action
  const handlePrint = () => {
    window.print();
  };

  const pendingCount = savedPlans.filter(p => p.status === 'onay_bekliyor').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-red-500 selection:text-white font-sans antialiased">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="no-print fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
          {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          {toastMessage.type === 'info' && <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />}
          <span className="text-xs sm:text-sm font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <Header
        userRole={userRole}
        onRoleChange={setUserRole}
        onNewPlan={handleNewPlan}
        onPrint={handlePrint}
        onSave={handleSaveDraft}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onLoadSample={handleLoadSample}
        onOpenGitHubSync={() => setIsGitHubSyncOpen(true)}
        savedCount={savedPlans.length}
        pendingCount={pendingCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        
        {/* Role Tab Navigation Banner */}
        <div className="no-print flex flex-col sm:flex-row items-center justify-between bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 mb-6 shadow-xs gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUserRole('ogretmen')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
                userRole === 'ogretmen'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Öğretmen Planlama Modu</span>
            </button>

            <button
              type="button"
              onClick={() => setUserRole('okul_idaresi')}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
                userRole === 'okul_idaresi'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Okul İdaresi Onay Masası</span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-500 text-white animate-pulse">
                  {pendingCount} Bekleyen
                </span>
              )}
            </button>
          </div>

          {/* Toggle Live A4 Preview */}
          <button
            type="button"
            onClick={() => setShowPrintPreview(!showPrintPreview)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition cursor-pointer self-end sm:self-auto"
          >
            {showPrintPreview ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>A4 Önizlemeyi Gizle</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Canlı A4 Baskı Önizlemesi</span>
              </>
            )}
          </button>
        </div>

        {/* Live A4 Preview Card (Screen Only) */}
        {showPrintPreview && (
          <div className="no-print mb-8 p-4 sm:p-8 bg-slate-300/70 rounded-2xl border border-slate-300 shadow-inner flex justify-center">
            <div className="bg-white w-full max-w-[210mm] shadow-2xl border border-slate-300 rounded-sm overflow-hidden p-6 sm:p-10">
              <div className="text-[10px] text-slate-400 text-center uppercase tracking-widest border-b border-dashed pb-2 mb-4 font-mono">
                --- A4 Resmi MEB Baskı Önizleme Alanı ---
              </div>
              <PrintDocument data={currentPlan} />
            </div>
          </div>
        )}

        {/* Dynamic View: Teacher Form vs Admin Panel */}
        {userRole === 'okul_idaresi' ? (
          <div className="no-print">
            <AdminApprovalPanel
              plans={savedPlans}
              onApprove={handleApprovePlan}
              onReject={handleRejectPlan}
              onSelectPlan={handleLoadPlan}
              onPrintPlan={handlePrintPlan}
              onDeletePlan={handleDeletePlan}
            />
          </div>
        ) : (
          <div className="no-print">
            <GeziForm
              data={currentPlan}
              onChange={handleFormChange}
              onPrint={handlePrint}
              onSubmitForApproval={handleOpenApprovalModal}
              onSaveDraft={handleSaveDraft}
              userRole={userRole}
            />
          </div>
        )}

        {/* Print-Only Document Container (Automatically rendered when Ctrl+P / Yazdır is triggered) */}
        <div className="print-only">
          <PrintDocument data={currentPlan} />
        </div>

      </main>

      {/* History / Saved Plans Modal */}
      <SavedPlansModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedPlans={savedPlans}
        onLoadPlan={handleLoadPlan}
        onDeletePlan={handleDeletePlan}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
      />

      {/* Approval Submit Modal */}
      <ApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        data={currentPlan}
        onConfirmSubmit={handleConfirmSubmit}
      />

      {/* GitHub Sync Modal */}
      <GitHubSyncModal
        isOpen={isGitHubSyncOpen}
        onClose={() => setIsGitHubSyncOpen(false)}
        plans={savedPlans}
        onSyncComplete={refreshPlans}
      />

    </div>
  );
}

export default App;
