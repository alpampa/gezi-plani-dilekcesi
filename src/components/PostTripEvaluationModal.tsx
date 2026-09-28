import React, { useState } from 'react';
import type { 
  GeziPlanData, 
  PostTripEvaluation, 
  AttainmentLevel, 
  QualityLevel, 
  SafetyLevel, 
  RecommendationLevel,
  AuthUser
} from '../types';
import { 
  CheckCircle2, 
  X, 
  Printer, 
  Star, 
  Award, 
  ShieldCheck, 
  Save, 
  Users, 
  BookOpen, 
  Sparkles,
  FileCheck2
} from 'lucide-react';

interface PostTripEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: GeziPlanData;
  currentUser: AuthUser | null;
  onSaveEvaluation: (planId: string, evaluation: PostTripEvaluation) => void;
  readOnly?: boolean;
}

export const PostTripEvaluationModal: React.FC<PostTripEvaluationModalProps> = ({
  isOpen,
  onClose,
  plan,
  currentUser,
  onSaveEvaluation,
  readOnly = false
}) => {
  const existing = plan.postTripEvaluation;

  // Form State
  const [actualStudentCount, setActualStudentCount] = useState<number>(
    existing?.actualStudentCount ?? (plan.totalStudentCount || 0)
  );
  const [actualTeacherCount, setActualTeacherCount] = useState<number>(
    existing?.actualTeacherCount ?? (plan.totalTeacherCount || 1)
  );
  const [actualCompanionCount, setActualCompanionCount] = useState<number>(
    existing?.actualCompanionCount ?? (plan.totalCompanionCount || 0)
  );

  const [outcomesAttainmentLevel, setOutcomesAttainmentLevel] = useState<AttainmentLevel>(
    existing?.outcomesAttainmentLevel ?? 'tamamen'
  );
  const [outcomesEvaluationNotes, setOutcomesEvaluationNotes] = useState<string>(
    existing?.outcomesEvaluationNotes ?? 'Öğrenciler planlanan kazanım ve öğrenme çıktılarını yerinde gözlemleyerek aktif katılım sağlamış ve hedeflenen eğitsel hedeflere ulaşılmıştır.'
  );

  const [studentInterestAndDiscipline, setStudentInterestAndDiscipline] = useState<QualityLevel>(
    existing?.studentInterestAndDiscipline ?? 'cok_iyi'
  );
  const [venueEducationalSuitability, setVenueEducationalSuitability] = useState<QualityLevel>(
    existing?.venueEducationalSuitability ?? 'cok_iyi'
  );
  const [organizationAndTransport, setOrganizationAndTransport] = useState<QualityLevel>(
    existing?.organizationAndTransport ?? 'cok_iyi'
  );
  const [safetyAndHealthStatus, setSafetyAndHealthStatus] = useState<SafetyLevel>(
    existing?.safetyAndHealthStatus ?? 'sorunsuz'
  );
  const [safetyNotes, setSafetyNotes] = useState<string>(
    existing?.safetyNotes ?? ''
  );

  const [problemsEncountered, setProblemsEncountered] = useState<string>(
    existing?.problemsEncountered ?? 'Herhangi bir aksaklık veya disiplin/güvenlik problemi yaşanmamıştır.'
  );
  const [suggestionsAndRecommendations, setSuggestionsAndRecommendations] = useState<string>(
    existing?.suggestionsAndRecommendations ?? 'Mekân ilkokul yaş seviyesine son derece uygun olup gelecek eğitim-öğretim yıllarında zümre öğretmenlerimize tavsiye edilmektedir.'
  );

  const [overallRating, setOverallRating] = useState<number>(
    existing?.overallRating ?? 5
  );
  const [recommendationStatus, setRecommendationStatus] = useState<RecommendationLevel>(
    existing?.recommendationStatus ?? 'kesinlikle_tavsiye'
  );
  const [summaryConclusion, setSummaryConclusion] = useState<string>(
    existing?.summaryConclusion ?? 'MEB Sosyal Etkinlikler Yönetmeliği ve Türkiye Yüzyılı Maarif Modeli çerçevesinde gezi faaliyeti planlandığı şekilde başarıyla ve tam güvenlik tedbirleri altında icra edilmiştir.'
  );

  const [isSavedNotice, setIsSavedNotice] = useState(false);

  if (!isOpen) return null;

  const isTeacher = currentUser?.role === 'ogretmen';
  const canEdit = !readOnly && (isTeacher || !existing);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const evalData: PostTripEvaluation = {
      evaluatedAt: new Date().toISOString(),
      evaluatedBy: currentUser?.fullName || plan.headTeacher?.fullName || 'Kafile Başkanı',
      actualStudentCount: Number(actualStudentCount) || 0,
      actualTeacherCount: Number(actualTeacherCount) || 1,
      actualCompanionCount: Number(actualCompanionCount) || 0,
      outcomesAttainmentLevel,
      outcomesEvaluationNotes: outcomesEvaluationNotes.trim(),
      studentInterestAndDiscipline,
      venueEducationalSuitability,
      organizationAndTransport,
      safetyAndHealthStatus,
      safetyNotes: safetyNotes.trim(),
      problemsEncountered: problemsEncountered.trim(),
      suggestionsAndRecommendations: suggestionsAndRecommendations.trim(),
      overallRating,
      recommendationStatus,
      summaryConclusion: summaryConclusion.trim()
    };

    onSaveEvaluation(plan.id, evalData);
    setIsSavedNotice(true);
    setTimeout(() => {
      setIsSavedNotice(false);
      onClose();
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  const attainmentOptions: { value: AttainmentLevel; label: string; desc: string }[] = [
    { value: 'tamamen', label: 'Tamamen Ulaşıldı (%90 - %100)', desc: 'Planlanan tüm kazanım ve çıktılar eksiksiz pekiştirildi.' },
    { value: 'buyuk_olcude', label: 'Büyük Ölçüde Ulaşıldı (%75 - %89)', desc: 'Kazanımların büyük kısmı yerinde deneyimlendi.' },
    { value: 'kismen', label: 'Kısmen Ulaşıldı (%50 - %74)', desc: 'Zaman veya mekân sınırlılıkları nedeniyle kısmi ulaşım.' },
    { value: 'yetersiz', label: 'Yetersiz / Ulaşılamadı (< %50)', desc: 'Eğitsel amaçlar yeterince karşılanamadı.' }
  ];

  const qualityOptions: { value: QualityLevel; label: string }[] = [
    { value: 'cok_iyi', label: 'Çok İyi (Mükemmel)' },
    { value: 'iyi', label: 'İyi (Yeterli)' },
    { value: 'orta', label: 'Orta (Geliştirilmeli)' },
    { value: 'yetersiz', label: 'Yetersiz (Uygunsuz)' }
  ];

  const safetyOptions: { value: SafetyLevel; label: string; desc: string }[] = [
    { value: 'sorunsuz', label: 'Sorunsuz / Güvenli', desc: 'Hiçbir sağlık veya güvenlik problemi yaşanmadı.' },
    { value: 'kucuk_aksaklik', label: 'Küçük Aksaklık', desc: 'Yerinde müdahale ile çözülen ufak durumlar.' },
    { value: 'onemli_aksaklik', label: 'Önemli Aksaklık', desc: 'Sağlık kuruluşu veya idari müdahale gerekti.' }
  ];

  const recommendationOptions: { value: RecommendationLevel; label: string; desc: string }[] = [
    { value: 'kesinlikle_tavsiye', label: 'Kesinlikle Tavsiye Edilir', desc: 'Diğer sınıflara ve zümrelere örnek mekân.' },
    { value: 'tavsiye_edilir', label: 'Tavsiye Edilir', desc: 'Standartlara uygun, yararlı bir etkinlik.' },
    { value: 'sartli_tavsiye', label: 'Şartlı Tavsiye', desc: 'Bazı organizasyonel düzeltmelerle gidilebilir.' },
    { value: 'tavsiye_edilmez', label: 'Tavsiye Edilmez', desc: 'Eğitsel açıdan faydalı bulunmadı.' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Container */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full my-auto overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 p-5 sm:p-6 text-white flex items-center justify-between shrink-0 print:bg-white print:text-black print:border-b-2 print:border-black print:p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0 print:hidden">
              <FileCheck2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-emerald-100 border border-white/20 print:text-black print:border-black">
                  MEB SOSYAL ETKİNLİKLER YÖNETMELİĞİ • EK-8 RAPORU
                </span>
                {existing && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950 flex items-center gap-1 shadow-xs print:hidden">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Değerlendirildi</span>
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-black mt-1">
                Gezi Sonrası Faaliyet Değerlendirme Raporu
              </h2>
              <p className="text-xs text-emerald-100 mt-0.5 print:text-slate-600">
                {plan.destinationName} • {plan.targetGrades} • Tarih: {plan.tripDate || 'Belirtilmedi'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Resmi Değerlendirme Raporu Yazdır"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Rapor Yazdır</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSave} className="p-5 sm:p-7 overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-sm print:p-2 print:overflow-visible">
          
          {/* Bilgi Kartı (Gezi Özeti) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 print:border-black print:bg-white">
            <div>
              <span className="text-[11px] font-bold text-slate-500 block uppercase">Okul / Kurum</span>
              <span className="font-extrabold text-slate-900">{plan.schoolName}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 block uppercase">Gezi Mekânı & İlçe</span>
              <span className="font-extrabold text-slate-900">{plan.destinationName} ({plan.selectedDistrict})</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 block uppercase">Katılan Şubeler</span>
              <span className="font-extrabold text-slate-900">{plan.targetGrades}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 block uppercase">Kafile Başkanı</span>
              <span className="font-extrabold text-slate-900">{plan.headTeacher?.fullName || plan.submittedBy}</span>
            </div>
          </div>

          {/* 1. BÖLÜM: FİİLİ KATILIMCI SAYILARI */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2 pb-1 border-b border-slate-200">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>1. Fiili Katılımcı Sayıları</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                <label className="block text-xs font-bold text-emerald-950 mb-1">
                  Fiili Katılan Öğrenci:
                </label>
                <input
                  type="number"
                  min={0}
                  disabled={!canEdit}
                  value={actualStudentCount}
                  onChange={(e) => setActualStudentCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-emerald-300 bg-white font-black text-emerald-950 text-base disabled:bg-slate-100 disabled:text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-emerald-700 mt-1 block">
                  Planlanan: {plan.totalStudentCount} Öğrenci
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Görevli Öğretmen:
                </label>
                <input
                  type="number"
                  min={1}
                  disabled={!canEdit}
                  value={actualTeacherCount}
                  onChange={(e) => setActualTeacherCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold text-slate-900 text-base disabled:bg-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Planlanan: {plan.totalTeacherCount || 1} Öğretmen
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Refakatçi Veli / Personel:
                </label>
                <input
                  type="number"
                  min={0}
                  disabled={!canEdit}
                  value={actualCompanionCount}
                  onChange={(e) => setActualCompanionCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold text-slate-900 text-base disabled:bg-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Planlanan: {plan.totalCompanionCount || 0} Refakatçi
                </span>
              </div>
            </div>
          </div>

          {/* 2. BÖLÜM: MAARİF MODELİ & KAZANIMLARA ULAŞILMA DÜZEYİ */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2 pb-1 border-b border-slate-200">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>2. Maarif Modeli Öğrenme Çıktıları & Kazanımlara Ulaşılma Düzeyi</span>
            </h3>

            {plan.outcomes && (
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 text-indigo-950 text-xs">
                <span className="font-extrabold block mb-1">Planda Hedeflenen Çıktılar:</span>
                <p className="whitespace-pre-wrap">{plan.outcomes}</p>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-800 mb-2">
                Kazanımlara Ulaşılma Derecesi: <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {attainmentOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`p-3 rounded-xl border-2 flex items-start gap-2.5 transition cursor-pointer ${
                      outcomesAttainmentLevel === opt.value
                        ? 'border-indigo-600 bg-indigo-50/80 font-bold text-indigo-950 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    } ${!canEdit ? 'pointer-events-none' : ''}`}
                  >
                    <input
                      type="radio"
                      name="outcomesLevel"
                      disabled={!canEdit}
                      value={opt.value}
                      checked={outcomesAttainmentLevel === opt.value}
                      onChange={() => setOutcomesAttainmentLevel(opt.value)}
                      className="mt-0.5 text-indigo-600"
                    />
                    <div>
                      <span className="block font-black text-xs">{opt.label}</span>
                      <span className="text-[11px] text-slate-500">{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Kazanım Gerçekleşme Değerlendirme Notları:
              </label>
              <textarea
                rows={2}
                disabled={!canEdit}
                value={outcomesEvaluationNotes}
                onChange={(e) => setOutcomesEvaluationNotes(e.target.value)}
                placeholder="Öğrencilerin öğrenme çıktılarını deneyimleme seviyesini ve gözlemlerinizi açıklayınız..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium disabled:bg-slate-100"
              />
            </div>
          </div>

          {/* 3. BÖLÜM: ETKİNLİK ALANI, ÖĞRENCİ DİSİPLİNİ & ULAŞIM KALİTESİ */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2 pb-1 border-b border-slate-200">
              <Award className="w-4 h-4 text-amber-600" />
              <span>3. Süreç, Disiplin, Mekân ve Ulaşım Değerlendirmesi</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Öğrenci İlgi & Disiplin:</label>
                <select
                  disabled={!canEdit}
                  value={studentInterestAndDiscipline}
                  onChange={(e) => setStudentInterestAndDiscipline(e.target.value as QualityLevel)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-slate-100"
                >
                  {qualityOptions.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mekân & Rehberlik Uygunluğu:</label>
                <select
                  disabled={!canEdit}
                  value={venueEducationalSuitability}
                  onChange={(e) => setVenueEducationalSuitability(e.target.value as QualityLevel)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-slate-100"
                >
                  {qualityOptions.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ulaşım & Zaman Yönetimi:</label>
                <select
                  disabled={!canEdit}
                  value={organizationAndTransport}
                  onChange={(e) => setOrganizationAndTransport(e.target.value as QualityLevel)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-slate-100"
                >
                  {qualityOptions.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
                </select>
              </div>
            </div>

            {/* Güvenlik & İlkyardım */}
            <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-2">
              <label className="block font-bold text-amber-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Güvenlik ve İlkyardım Tedbirleri Durumu:</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {safetyOptions.map(s => (
                  <label
                    key={s.value}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                      safetyAndHealthStatus === s.value
                        ? 'border-emerald-600 bg-white font-bold text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 bg-white/60 text-slate-700'
                    } ${!canEdit ? 'pointer-events-none' : ''}`}
                  >
                    <input
                      type="radio"
                      name="safetyStatus"
                      disabled={!canEdit}
                      value={s.value}
                      checked={safetyAndHealthStatus === s.value}
                      onChange={() => setSafetyAndHealthStatus(s.value)}
                      className="text-emerald-600"
                    />
                    <span className="text-xs">{s.label}</span>
                  </label>
                ))}
              </div>

              {safetyAndHealthStatus !== 'sorunsuz' && (
                <div className="pt-1">
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                    Güvenlik / Sağlık Açıklaması:
                  </label>
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={safetyNotes}
                    onChange={(e) => setSafetyNotes(e.target.value)}
                    placeholder="Yaşanan sağlık veya güvenlik durumunun ayrıntısını yazınız..."
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-slate-100"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 4. BÖLÜM: KARŞILAŞILAN GÜÇLÜKLER, ÖNERİLER VE TAVSİYE DERECESİ */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2 pb-1 border-b border-slate-200">
              <Sparkles className="w-4 h-4 text-rose-600" />
              <span>4. Sonuç, Tavsiye ve Gelecek Yıllara Öneriler</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Karşılaşılan Sorunlar / Güçlükler:
                </label>
                <textarea
                  rows={2}
                  disabled={!canEdit}
                  value={problemsEncountered}
                  onChange={(e) => setProblemsEncountered(e.target.value)}
                  placeholder="Yaşanan herhangi bir aksaklık veya eksiklik varsa belirtiniz..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none font-medium disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Gelecek Yıllar / Zümreler İçin Tavsiyeler:
                </label>
                <textarea
                  rows={2}
                  disabled={!canEdit}
                  value={suggestionsAndRecommendations}
                  onChange={(e) => setSuggestionsAndRecommendations(e.target.value)}
                  placeholder="Gelecek gezi planlamalarında dikkat edilmesi önerilen hususlar..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none font-medium disabled:bg-slate-100"
                />
              </div>
            </div>

            {/* Puanlama ve Tavsiye Durumu */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Yıldız Puanı */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Genel Gezi Memnuniyet Puanı (1 - 5 Yıldız):
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      disabled={!canEdit}
                      onClick={() => setOverallRating(star)}
                      className={`p-1 transition ${canEdit ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= overallRating
                            ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-black text-slate-800 text-sm">
                    {overallRating} / 5 Yıldız
                  </span>
                </div>
              </div>

              {/* Tavsiye Seçeneği */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Mekân Tavsiye Derecesi:
                </label>
                <select
                  disabled={!canEdit}
                  value={recommendationStatus}
                  onChange={(e) => setRecommendationStatus(e.target.value as RecommendationLevel)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-extrabold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                >
                  {recommendationOptions.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Genel Sonuç ve Kanaat Özeti */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Genel Değerlendirme & Sonuç Kanaati (Yönetmelik Rapor Metni):
              </label>
              <textarea
                rows={2}
                disabled={!canEdit}
                value={summaryConclusion}
                onChange={(e) => setSummaryConclusion(e.target.value)}
                placeholder="Genel sonuç özeti..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-semibold disabled:bg-slate-100"
              />
            </div>

          </div>

          {/* İMZA BLOKLARI (RESMİ ÇIKTI İÇİN) */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Değerlendirmeyi Yapan</span>
              <span className="font-bold text-slate-900 block mt-1">
                {existing?.evaluatedBy || currentUser?.fullName || plan.headTeacher?.fullName}
              </span>
              <span className="text-[10px] text-slate-500 block">Kafile Başkanı / Öğretmen</span>
              <div className="mt-4 border-b border-dashed border-slate-400 w-24 mx-auto"></div>
              <span className="text-[9px] text-slate-400 mt-0.5 block">İmza</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Sosyal Etkinlikler Kurulu</span>
              <span className="font-bold text-slate-900 block mt-1">
                {plan.deputyPrincipalName || 'Fudan FİDAN'}
              </span>
              <span className="text-[10px] text-slate-500 block">Müdür Yardımcısı</span>
              <div className="mt-4 border-b border-dashed border-slate-400 w-24 mx-auto"></div>
              <span className="text-[9px] text-slate-400 mt-0.5 block">İmza</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Makam Oluru / Arşiv</span>
              <span className="font-bold text-slate-900 block mt-1">
                {plan.principalName || 'Recep KIZILIRMAK'}
              </span>
              <span className="text-[10px] text-slate-500 block">Okul Müdürü</span>
              <div className="mt-4 border-b border-dashed border-slate-400 w-24 mx-auto"></div>
              <span className="text-[9px] text-slate-400 mt-0.5 block">İmza / Mühür</span>
            </div>
          </div>

          {/* Modal Footer Butonları */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Resmi Ek-8 Raporu Yazdır</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Kapat
              </button>

              {canEdit && (
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2 cursor-pointer transition active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Değerlendirmeyi Kaydet & İdareye İlet</span>
                </button>
              )}
            </div>
          </div>

          {isSavedNotice && (
            <div className="p-3 rounded-xl bg-emerald-600 text-white text-center font-bold text-xs flex items-center justify-center gap-2 animate-in fade-in zoom-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Gezi Değerlendirme Raporu başarıyla kaydedildi ve okul idaresine iletildi!</span>
            </div>
          )}

        </form>

      </div>

    </div>
  );
};
