import React from 'react';
import { 
  Printer, 
  PlusCircle, 
  Save, 
  History, 
  Sparkles,
  School
} from 'lucide-react';

interface HeaderProps {
  onNewPlan: () => void;
  onPrint: () => void;
  onSave: () => void;
  onOpenHistory: () => void;
  onLoadSample: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onNewPlan,
  onPrint,
  onSave,
  onOpenHistory,
  onLoadSample,
  savedCount
}) => {
  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center shadow-md shadow-red-500/20 shrink-0">
              <School className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  MEB & EBA ODOS Uyumlu
                </span>
                <span className="hidden md:inline-block text-xs font-medium text-slate-500">
                  Maarif Modeli Gezi Planı
                </span>
              </div>
              <h1 className="text-base sm:text-lg lg:text-xl font-black tracking-tight text-slate-900 truncate">
                Okul Dışı Öğrenme Gezi Planı ve Dilekçesi
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* New Form (Reset) */}
            <button
              onClick={onNewPlan}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Yeni Boş Gezi Planı Başlat"
            >
              <PlusCircle className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Yeni Plan</span>
            </button>

            {/* Load Sample */}
            <button
              onClick={onLoadSample}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
              title="Örnek Veri ile Doldur"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Örnek Doldur</span>
            </button>

            {/* Save to LocalStorage */}
            <button
              onClick={onSave}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
              title="Tarayıcı Hafızasına Kaydet"
            >
              <Save className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Kaydet</span>
            </button>

            {/* History */}
            <button
              onClick={onOpenHistory}
              type="button"
              className="relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Kayıtlı Planlarımı Gör"
            >
              <History className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Geçmiş</span>
              {savedCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Primary Print Button */}
            <button
              onClick={onPrint}
              type="button"
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-md shadow-red-500/25 rounded-lg transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Yazdır / PDF</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
