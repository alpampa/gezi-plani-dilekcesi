import React, { useState } from 'react';
import { 
  EmailEngine, 
  type EmailEngineConfig, 
  type EmailLogEntry 
} from '../services/emailEngine';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  X, 
  Sliders, 
  History, 
  RefreshCw,
  Zap
} from 'lucide-react';
import { DEFAULT_SCHOOL_EMAIL } from '../services/db';
import type { GeziPlanData } from '../types';

interface EmailEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  samplePlan?: GeziPlanData;
}

export const EmailEngineModal: React.FC<EmailEngineModalProps> = ({
  isOpen,
  onClose,
  samplePlan
}) => {
  const [config, setConfig] = useState<EmailEngineConfig>(() => EmailEngine.getConfig());
  const [logs, setLogs] = useState<EmailLogEntry[]>(() => EmailEngine.getLogs());
  const [activeTab, setActiveTab] = useState<'settings' | 'logs' | 'test'>('settings');
  const [testEmail, setTestEmail] = useState<string>(DEFAULT_SCHOOL_EMAIL);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    EmailEngine.saveConfig(config);
    setStatusMessage({ text: 'E-posta motoru yapılandırması başarıyla kaydedildi.', type: 'success' });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSendTest = async () => {
    if (!testEmail.trim()) {
      alert('Lütfen test e-posta adresi giriniz.');
      return;
    }

    setIsSendingTest(true);
    setStatusMessage(null);

    const dummyPlan: GeziPlanData = samplePlan || {
      id: 'test-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'onaylandi',
      city: 'İstanbul',
      district: 'Üsküdar',
      schoolName: 'Zeynep Kamil İlkokulu',
      clubName: 'Gezi Kulübü',
      documentDate: new Date().toISOString().split('T')[0],
      documentNumber: '2026/TEST-01',
      principalName: 'Recep KIZILIRMAK',
      deputyPrincipalName: 'Funda FİDAN',
      destinationCategory: 'Müze',
      destinationMode: 'preset',
      selectedCity: 'İstanbul',
      selectedDistrict: 'Üsküdar',
      destinationName: 'Hababam Sınıfı Müzesi (Test Gezisi)',
      destinationAddress: 'Validebağ Korusu, Üsküdar',
      tripType: 'İl İçi',
      tripDuration: 'Günübirlik',
      targetGrades: '3-A, 3-B',
      gradeRows: [],
      maleStudentCount: 20,
      femaleStudentCount: 20,
      totalStudentCount: 40,
      totalTeacherCount: 2,
      totalCompanionCount: 2,
      courseName: 'Sosyal Bilgiler',
      subjectTopic: 'Kültürel Mirasımız',
      purpose: 'Tarihi ve kültürel mekânları yerinde tanıma',
      outcomes: 'Müze kurallarına uyar ve kültürel mirası değerlendirir.',
      tripDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      departureTime: '09:30',
      returnTime: '14:00',
      departureLocation: 'Okul Önü',
      returnLocation: 'Okul Önü',
      transportationType: 'Okul Servis Aracı',
      vehiclePlate: '34 ZK 1923',
      driverName: 'Ahmet Şoför',
      driverPhone: '0555 123 45 67',
      transportCompany: 'Örnek Taşımacılık',
      travelRoute: 'Okul - Validebağ - Okul',
      headTeacher: { id: 't-1', fullName: 'Ali Serkan KAYA', branch: 'Sınıf Öğretmeni', role: 'Kafile Başkanı', phone: '0532 000 00 00' },
      teachers: [],
      companions: [],
      schedule: [],
      preTripNotes: '',
      duringTripNotes: '',
      postTripNotes: '',
      safetyMeasures: '',
      teacherEmail: testEmail,
      schoolEmail: DEFAULT_SCHOOL_EMAIL
    };

    try {
      const res = await EmailEngine.sendPrincipalApprovalNotification(
        dummyPlan,
        'Recep KIZILIRMAK (Okul Müdürü)',
        'E-posta motoru otomatik test onay iletisi.'
      );
      setLogs(EmailEngine.getLogs());
      setIsSendingTest(false);
      setStatusMessage({
        text: `Test iletisi başarıyla gönderildi: ${res.message}`,
        type: 'success'
      });
    } catch (e: any) {
      setIsSendingTest(false);
      setStatusMessage({
        text: `Gönderim sırasında hata: ${e?.message || 'Bağlantı hatası'}`,
        type: 'error'
      });
    }
  };

  const handleRefreshLogs = () => {
    setLogs(EmailEngine.getLogs());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  OTOMATİK BİLDİRİM MOTORU
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-1">
                E-Posta Dağıtım ve Otomasyon Motoru
              </h3>
              <p className="text-xs text-indigo-200">
                Müdür Onayında Otomatik Öğretmen & İdare Bildirim Servisi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-3 bg-slate-100 border-b border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Motor Yapılandırması</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('test')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'test'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Test Gönderimi Yap</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('logs'); handleRefreshLogs(); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Gönderim Günlüğü ({logs.length})</span>
          </button>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className={`p-3 text-xs font-bold flex items-center justify-center gap-2 shrink-0 ${
            statusMessage.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}>
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-slate-800 text-xs sm:text-sm">
          
          {/* TAB 1: YAPILANDIRMA */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-200 text-xs text-indigo-950 space-y-1">
                <strong className="block font-bold">⚡ OTOMATİK MÜDÜR ONAY MOTORU AKTİF:</strong>
                <p>
                  Okul Müdürü (Recep KIZILIRMAK) sisteme girip Makam Oluru verdiğinde, sistem arka planda hem öğretmenin e-posta adresine hem de okul kurumsal e-postasına (<strong>{DEFAULT_SCHOOL_EMAIL}</strong>) resmi gezi raporu ve teslim uyarısını otomatik olarak iletir.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gönderici Başlığı (From Name):</label>
                <input
                  type="text"
                  value={config.senderName}
                  onChange={(e) => setConfig({ ...config, senderName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kurumsal Okul E-Posta Adresi (Varsayılan Bilgi):</label>
                <input
                  type="email"
                  value={config.schoolEmail}
                  onChange={(e) => setConfig({ ...config, schoolEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-Posta Servis Sağlayıcı (Gönderim Protokolü):</label>
                <select
                  value={config.provider}
                  onChange={(e) => setConfig({ ...config, provider: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="browser_direct">🚀 Otomatik REST Dispatcher (Doğrudan Web API - Önerilen)</option>
                  <option value="custom_webhook">🔗 Özel Kurumsal Webhook URL (Zapier / Make / Node Relay)</option>
                  <option value="resend">📬 Resend API (Özel API Key ile)</option>
                </select>
              </div>

              {config.provider === 'custom_webhook' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Özel Webhook URL:</label>
                  <input
                    type="url"
                    value={config.webhookUrl || ''}
                    onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                    placeholder="https://hook.eu1.make.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs"
                  />
                </div>
              )}

              {config.provider === 'resend' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Resend API Anahtarı (API Key):</label>
                  <input
                    type="password"
                    value={config.apiKey || ''}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    placeholder="re_123456789..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs"
                  />
                </div>
              )}

              {/* Otomatik Gönderim Kuralları */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                  Otomatik Tetikleme Kuralları:
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoSendOnFinalApproval}
                    onChange={(e) => setConfig({ ...config, autoSendOnFinalApproval: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Müdür Makam Oluru Verince Otomatik Gönder (Öğretmen + Okul İdaresi)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoSendOnRejection}
                    onChange={(e) => setConfig({ ...config, autoSendOnRejection: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Düzeltme / İade Talebinde Öğretmene Otomatik E-posta Gönder
                  </span>
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/25 flex items-center gap-2 cursor-pointer transition active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ayarları Kaydet</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: TEST GÖNDERİMİ */}
          {activeTab === 'test' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                <strong className="block font-bold">🧪 CANLI E-POSTA TESTİ:</strong>
                <p>
                  Aşağıdaki alana e-posta adresinizi yazarak okul müdürü onay şablonunun doğrudan iletilip iletilmediğini test edebilirsiniz.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Test Alıcı E-Posta Adresi:
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="ornek@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-semibold text-xs"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-700 block">Gönderilecek Örnek Şablon:</span>
                <p className="text-slate-600">
                  • <strong>Konu:</strong> [MAKAM OLURU VERİLDİ - GEZİ ONAYLANDI] Hababam Sınıfı Müzesi (3-A, 3-B)
                </p>
                <p className="text-slate-600">
                  • <strong>İçerik:</strong> Resmi HTML Gezi Raporu, Katılımcı Sayıları, Onay Notu ve 15/7 Gün Evrak Teslim Uyarısı.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSendTest}
                disabled={isSendingTest}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 disabled:opacity-50"
              >
                {isSendingTest ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Test E-Postası İletiliyor...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Şimdi Test E-Postası Gönder</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 3: GÖNDERİM GÜNLÜĞÜ (LOGS) */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">
                  Son Gönderim İşlemleri ({logs.length})
                </span>
                <button
                  type="button"
                  onClick={handleRefreshLogs}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Yenile</span>
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-xs">Henüz kayıtlı bir e-posta gönderim işlemi bulunmuyor.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900">{log.destinationName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          log.status === 'success' ? 'bg-emerald-100 text-emerald-800' :
                          log.status === 'fallback' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {log.status === 'success' ? 'Doğrudan İletildi' :
                           log.status === 'fallback' ? 'İstemci İle Yedeklendi' : 'Hata'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">
                        <strong>Alıcılar:</strong> {log.recipients.join(', ')}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {log.subject}
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                        <span>{log.details}</span>
                        <span>{new Date(log.timestamp).toLocaleString('tr-TR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 border border-slate-300 font-bold text-xs text-slate-700 cursor-pointer"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
