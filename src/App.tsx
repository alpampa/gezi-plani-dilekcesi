import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { Header } from './components/Header';
import { GeziForm } from './components/GeziForm';
import { PrintDocument } from './components/PrintDocument';
import { SavedPlansModal } from './components/SavedPlansModal';
import type { GeziPlanData } from './types';
import { INITIAL_EMPTY_PLAN, SAMPLE_POPULATED_PLAN } from './data/locations';
import { Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'odos_gezi_plani_saved_records_v1';

export function App() {
  // Her açılışta kullanıcının istediği gibi YENİ BOŞ EKRAN gelsin
  const createNewPlanObject = (): GeziPlanData => ({
    ...INITIAL_EMPTY_PLAN,
    id: 'gezi-' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [currentPlan, setCurrentPlan] = useState<GeziPlanData>(createNewPlanObject());
  const [savedPlans, setSavedPlans] = useState<GeziPlanData[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Load saved plans from localStorage on start
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedPlans(parsed);
        }
      }
    } catch (e) {
      console.error('Kayıtlı planlar yüklenirken hata:', e);
    }
  }, []);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
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
      showToast('Yeni boş gezi planı oluşturuldu.', 'info');
    }
  };

  // Load Sample Data
  const handleLoadSample = () => {
    setCurrentPlan({
      ...SAMPLE_POPULATED_PLAN,
      id: 'gezi-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.2 } });
    } catch (_) {}
    showToast('Örnek Rahmi M. Koç Müzesi gezi planı yüklendi.', 'success');
  };

  // Save current plan
  const handleSavePlan = () => {
    try {
      const existingIndex = savedPlans.findIndex(p => p.id === currentPlan.id);
      let updatedList: GeziPlanData[];

      if (existingIndex >= 0) {
        updatedList = [...savedPlans];
        updatedList[existingIndex] = { ...currentPlan, updatedAt: new Date().toISOString() };
      } else {
        updatedList = [{ ...currentPlan, updatedAt: new Date().toISOString() }, ...savedPlans];
      }

      setSavedPlans(updatedList);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      try {
        confetti({ particleCount: 40, spread: 50 });
      } catch (_) {}
      showToast('Gezi planı başarıyla tarayıcı hafızasına kaydedildi.', 'success');
    } catch (e) {
      showToast('Kaydetme sırasında bir hata oluştu.', 'error');
    }
  };

  // Delete saved plan
  const handleDeletePlan = (id: string) => {
    const updated = savedPlans.filter(p => p.id !== id);
    setSavedPlans(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    showToast('Plan kaydı silindi.', 'info');
  };

  // Load selected plan from history
  const handleLoadPlan = (plan: GeziPlanData) => {
    setCurrentPlan(plan);
    showToast(`"${plan.destinationName || 'Seçilen Gezi'}" planı forma aktarıldı.`, 'success');
  };

  // Export JSON backup
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedPlans, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `MEB_Gezi_Planlari_Yedek_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Gezi planları yedek dosyası indirildi.', 'success');
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
          setSavedPlans(parsed);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-red-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="no-print fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
          {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          {toastMessage.type === 'info' && <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />}
          <span className="text-xs sm:text-sm font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <Header
        onNewPlan={handleNewPlan}
        onPrint={handlePrint}
        onSave={handleSavePlan}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onLoadSample={handleLoadSample}
        savedCount={savedPlans.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        
        {/* Toggle Live A4 Preview */}
        <div className="no-print flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 mb-6 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              Canlı Resmi A4 Baskı Önizlemesi
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              (Yazıcı çıktısının sayfa üzerindeki birebir görünümü)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowPrintPreview(!showPrintPreview)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition cursor-pointer"
          >
            {showPrintPreview ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Önizlemeyi Gizle</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>A4 Önizlemeyi Göster</span>
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

        {/* Form Fill Area */}
        <div className="no-print">
          <GeziForm
            data={currentPlan}
            onChange={handleFormChange}
            onPrint={handlePrint}
          />
        </div>

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

    </div>
  );
}

export default App;
