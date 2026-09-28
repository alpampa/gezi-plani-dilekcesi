import React, { useState, useEffect } from 'react';
import { DatabaseService, type GitHubSyncConfig } from '../services/db';
import { 
  Database, 
  UploadCloud, 
  DownloadCloud, 
  Key, 
  X, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  GitBranch
} from 'lucide-react';
import type { GeziPlanData } from '../types';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: GeziPlanData[];
  onSyncComplete: () => void;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({
  isOpen,
  onClose,
  plans,
  onSyncComplete
}) => {
  const [config, setConfig] = useState<GitHubSyncConfig>({ enabled: false });
  const [tokenInput, setTokenInput] = useState('');
  const [gistInput, setGistInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState<{ text: string; isError?: boolean } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const existing = DatabaseService.getGitHubConfig();
      setConfig(existing);
      setTokenInput(existing.token || '');
      setGistInput(existing.gistId || '');
      setStatusText(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    const newConfig: GitHubSyncConfig = {
      enabled: Boolean(tokenInput.trim()),
      token: tokenInput.trim(),
      gistId: gistInput.trim() || undefined,
      lastSyncAt: config.lastSyncAt
    };
    DatabaseService.saveGitHubConfig(newConfig);
    setConfig(newConfig);
    setStatusText({ text: 'GitHub yapılandırma ayarları kaydedildi.' });
  };

  const handlePushToGitHub = async () => {
    if (!tokenInput.trim()) {
      setStatusText({ text: 'Lütfen önce GitHub Personal Access Token (PAT) giriniz.', isError: true });
      return;
    }
    setLoading(true);
    setStatusText(null);

    // Save token first
    const newConfig: GitHubSyncConfig = {
      enabled: true,
      token: tokenInput.trim(),
      gistId: gistInput.trim() || undefined
    };
    DatabaseService.saveGitHubConfig(newConfig);

    const success = await DatabaseService.syncWithGitHub(plans);
    setLoading(false);

    if (success) {
      const updated = DatabaseService.getGitHubConfig();
      setConfig(updated);
      setGistInput(updated.gistId || '');
      setStatusText({ text: `Başarılı: ${plans.length} adet gezi planı GitHub veritabanına yedeklendi!` });
      onSyncComplete();
    } else {
      setStatusText({ text: 'GitHub bağlantı hatası! Lütfen token yetkilerini (gist izni) kontrol ediniz.', isError: true });
    }
  };

  const handlePullFromGitHub = async () => {
    if (!tokenInput.trim() || !gistInput.trim()) {
      setStatusText({ text: 'GitHub Token ve Gist ID alanları doldurulmalıdır.', isError: true });
      return;
    }
    setLoading(true);
    setStatusText(null);

    const res = await DatabaseService.pullFromGitHub();
    setLoading(false);

    if (res.success) {
      setStatusText({ text: `Başarılı: GitHub veritabanından ${res.count} adet gezi planı indirildi ve yüklendi!` });
      onSyncComplete();
    } else {
      setStatusText({ text: `İndirme hatası: ${res.error || 'Bilinmeyen hata'}`, isError: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0">
              <GitBranch className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                Bulut & GitHub Veritabanı
              </span>
              <h3 className="text-base sm:text-lg font-black">
                GitHub Database Entegrasyonu
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
        <div className="p-5 sm:p-6 space-y-4">
          
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 text-xs text-indigo-950 leading-relaxed space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-700" />
              <span>Cihazlar Arası Ortak Veritabanı (Cloud Sync)</span>
            </div>
            <p>
              GitHub Gist API entegrasyonu sayesinde okul idaresi ve öğretmenler farklı bilgisayarlardan gezi planlarına erişebilir ve gerçek zamanlı eşitleyebilir.
            </p>
          </div>

          {/* Token Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                GitHub Personal Access Token (PAT)
              </label>
              <a
                href="https://github.com/settings/tokens/new?scopes=gist&description=MEB_Gezi_Plani_Sync"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-600 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <span>Token Oluştur (Gist İzni)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full pl-9 pr-3.5 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Gist ID Field */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-800">
              Gist ID (Otomatik oluşturulur veya mevcut ID girilebilir)
            </label>
            <input
              type="text"
              value={gistInput}
              onChange={(e) => setGistInput(e.target.value)}
              placeholder="Örn: 9a8b7c6d5e4f3a2b1..."
              className="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <span className="text-[10px] text-slate-500 block">
              * İlk kaydetmede boş bırakırsanız sistem sizin adınıza otomatik bir özel (private) Gist veri tabanı oluşturur.
            </span>
          </div>

          {/* Status Message */}
          {statusText && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              statusText.isError 
                ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              {statusText.isError ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span className="font-semibold">{statusText.text}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <button
              type="button"
              onClick={handlePushToGitHub}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{loading ? 'Eşitleniyor...' : 'GitHub\'a Yükle / Eşitle'}</span>
            </button>

            <button
              type="button"
              onClick={handlePullFromGitHub}
              disabled={loading || !gistInput.trim()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 transition cursor-pointer disabled:opacity-50"
            >
              <DownloadCloud className="w-4 h-4 text-slate-600" />
              <span>Cloud\'dan Planları İndir</span>
            </button>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleSaveConfig}
              className="text-xs text-indigo-700 hover:underline font-bold cursor-pointer"
            >
              Sadece Ayarları Kaydet
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
