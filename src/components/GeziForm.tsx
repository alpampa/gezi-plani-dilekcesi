import React, { useState } from 'react';
import { 
  Building, 
  MapPin, 
  Clock, 
  Bus, 
  Users, 
  GraduationCap, 
  Plus, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  FileCheck2, 
  CheckCircle2,
  BookOpen,
  PlusCircle,
  Sparkles,
  AlertTriangle,
  Send,
  Save,
  Footprints,
  FileDown
} from 'lucide-react';
import type { GeziPlanData, GeziTeacher, GeziCompanion, GeziScheduleItem, GradeStudentRow, UserRole } from '../types';
import { TURKISH_CITIES, ISTANBUL_DISTRICTS, CATEGORIES, PRESET_LOCATIONS } from '../data/locations';
import { CURRICULUM_DATA } from '../data/curriculum';
import { checkTripDeadlineRule } from '../services/db';

interface GeziFormProps {
  data: GeziPlanData;
  onChange: (updated: Partial<GeziPlanData>) => void;
  onPrint: () => void;
  onDownloadPDF?: () => void;
  onSubmitForApproval?: () => void;
  onSaveDraft?: () => void;
  userRole?: UserRole;
}

export const GeziForm: React.FC<GeziFormProps> = ({ 
  data, 
  onChange, 
  onPrint, 
  onDownloadPDF,
  onSubmitForApproval, 
  onSaveDraft,
  userRole = 'ogretmen'
}) => {
  const deadlineStatus = checkTripDeadlineRule(data.tripDate, data.transportationType);
  const isLockedForTeacher = userRole === 'ogretmen' && !deadlineStatus.isEditable && data.createdAt !== data.updatedAt;
  // Curriculum selector state
  const [selectedGradeId, setSelectedGradeId] = useState<string>('grade-1');
  const [selectedLessonName, setSelectedLessonName] = useState<string>('Hayat Bilgisi (Maarif Modeli)');

  const currentGradeData = CURRICULUM_DATA.find(g => g.id === selectedGradeId) || CURRICULUM_DATA[0];
  const currentLessons = currentGradeData.lessons;
  const currentLesson = currentLessons.find(l => l.name === selectedLessonName) || currentLessons[0];

  // When grade changes, adjust default lesson
  const handleGradeChange = (gradeId: string) => {
    setSelectedGradeId(gradeId);
    const newGrade = CURRICULUM_DATA.find(g => g.id === gradeId);
    if (newGrade && newGrade.lessons.length > 0) {
      setSelectedLessonName(newGrade.lessons[0].name);
    }
  };

  // Add single outcome to textarea
  const handleAddOutcome = (outcomeText: string) => {
    const existing = data.outcomes ? data.outcomes.trim() : '';
    if (existing.includes(outcomeText)) return;
    const updated = existing ? `${existing}\n${outcomeText}` : outcomeText;
    onChange({ outcomes: updated });
  };

  // Add all outcomes of current lesson topic
  const handleAddAllTopicOutcomes = (topicOutcomes: { text: string }[]) => {
    const existing = data.outcomes ? data.outcomes.trim() : '';
    let updated = existing;
    topicOutcomes.forEach(item => {
      if (!updated.includes(item.text)) {
        updated = updated ? `${updated}\n${item.text}` : item.text;
      }
    });
    onChange({ outcomes: updated });
  };

  // Filtered preset locations based on city, district, and category
  const filteredLocations = PRESET_LOCATIONS.filter(loc => {
    const cityMatch = !data.selectedCity || loc.city === data.selectedCity;
    const districtMatch = !data.selectedDistrict || data.selectedDistrict === 'Tüm İlçeler' || loc.district === data.selectedDistrict;
    const catMatch = !data.destinationCategory || data.destinationCategory === 'Tüm Kategoriler' || data.destinationCategory === 'Liste Dışı / Özel Etkinlik Alanı' || loc.category === data.destinationCategory;
    return cityMatch && districtMatch && catMatch;
  });

  // Preset location select
  const handleSelectPreset = (locId: string) => {
    const found = PRESET_LOCATIONS.find(l => l.id === locId);
    if (found) {
      onChange({
        destinationName: found.name,
        destinationAddress: found.address,
        destinationCategory: found.category,
        selectedCity: found.city,
        selectedDistrict: found.district || data.selectedDistrict,
        courseName: found.suggestedCourses || data.courseName
      });
    }
  };

  // ================= GRADE ROWS (HER SINIF AYRI SATIR VE TOPLAMLAR) =================
  const gradeRows = data.gradeRows && data.gradeRows.length > 0 
    ? data.gradeRows 
    : [{ id: 'gr-1', gradeName: data.targetGrades || '3-A', maleCount: data.maleStudentCount || 0, femaleCount: data.femaleStudentCount || 0, totalCount: data.totalStudentCount || 0 }];

  const recalculateGradeTotals = (rows: GradeStudentRow[]) => {
    const maleTotal = rows.reduce((acc, r) => acc + (Number(r.maleCount) || 0), 0);
    const femaleTotal = rows.reduce((acc, r) => acc + (Number(r.femaleCount) || 0), 0);
    const overallTotal = maleTotal + femaleTotal;
    const targetNames = rows.map(r => r.gradeName.trim()).filter(Boolean).join(', ');

    onChange({
      gradeRows: rows,
      maleStudentCount: maleTotal,
      femaleStudentCount: femaleTotal,
      totalStudentCount: overallTotal,
      targetGrades: targetNames || data.targetGrades
    });
  };

  const handleAddGradeRow = () => {
    const newRow: GradeStudentRow = {
      id: 'gr-' + Date.now(),
      gradeName: '',
      maleCount: 0,
      femaleCount: 0,
      totalCount: 0
    };
    const updated = [...gradeRows, newRow];
    recalculateGradeTotals(updated);
  };

  const handleUpdateGradeRow = (index: number, field: keyof GradeStudentRow, value: any) => {
    const updated = [...gradeRows];
    const targetRow = { ...updated[index], [field]: value };
    
    if (field === 'maleCount' || field === 'femaleCount') {
      const male = field === 'maleCount' ? (parseInt(value) || 0) : (targetRow.maleCount || 0);
      const female = field === 'femaleCount' ? (parseInt(value) || 0) : (targetRow.femaleCount || 0);
      targetRow.totalCount = male + female;
    }
    
    updated[index] = targetRow;
    recalculateGradeTotals(updated);
  };

  const handleRemoveGradeRow = (index: number) => {
    if (gradeRows.length <= 1) {
      // Don't remove last row, just clear
      const resetRow: GradeStudentRow = { id: 'gr-1', gradeName: '', maleCount: 0, femaleCount: 0, totalCount: 0 };
      recalculateGradeTotals([resetRow]);
      return;
    }
    const updated = gradeRows.filter((_, i) => i !== index);
    recalculateGradeTotals(updated);
  };

  // Teacher handlers
  const handleAddTeacher = () => {
    const newTeacher: GeziTeacher = {
      id: 't-' + Date.now(),
      fullName: '',
      branch: 'Sınıf / Branş Öğretmeni',
      role: 'Görevli Öğretmen',
      phone: ''
    };
    const updated = [...data.teachers, newTeacher];
    onChange({
      teachers: updated,
      totalTeacherCount: 1 + updated.length
    });
  };

  const handleUpdateTeacher = (index: number, field: keyof GeziTeacher, value: string) => {
    const updated = [...data.teachers];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ teachers: updated });
  };

  const handleRemoveTeacher = (index: number) => {
    const updated = data.teachers.filter((_, i) => i !== index);
    onChange({
      teachers: updated,
      totalTeacherCount: 1 + updated.length
    });
  };

  // Companion handlers
  const handleAddCompanion = () => {
    const newComp: GeziCompanion = {
      id: 'c-' + Date.now(),
      fullName: '',
      role: 'Veli Refakatçi',
      phone: ''
    };
    const updated = [...data.companions, newComp];
    onChange({
      companions: updated,
      totalCompanionCount: updated.length
    });
  };

  const handleUpdateCompanion = (index: number, field: keyof GeziCompanion, value: string) => {
    const updated = [...data.companions];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ companions: updated });
  };

  const handleRemoveCompanion = (index: number) => {
    const updated = data.companions.filter((_, i) => i !== index);
    onChange({
      companions: updated,
      totalCompanionCount: updated.length
    });
  };

  // Schedule handlers
  const handleAddScheduleItem = () => {
    const newItem: GeziScheduleItem = {
      id: 's-' + Date.now(),
      timeRange: '10:00 - 11:00',
      activity: '',
      location: data.destinationName || 'Gezi Mekânı',
      responsible: 'Görevli Öğretmenler'
    };
    onChange({
      schedule: [...data.schedule, newItem]
    });
  };

  const handleUpdateScheduleItem = (index: number, field: keyof GeziScheduleItem, value: string) => {
    const updated = [...data.schedule];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ schedule: updated });
  };

  const handleRemoveScheduleItem = (index: number) => {
    const updated = data.schedule.filter((_, i) => i !== index);
    onChange({ schedule: updated });
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      
      {/* BİLDİRİM SÜRESİ VE KİLİT BİLGİLENDİRME BANNERI */}
      {isLockedForTeacher && (
        <div className="bg-amber-500 text-white rounded-2xl p-5 shadow-lg flex items-start gap-3.5 animate-in slide-in-from-top-3">
          <AlertTriangle className="w-6 h-6 text-amber-100 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-100">
              MEB & Belediye Bildirim Süresi Kısıtlaması ({deadlineStatus.requiredDays} Gün Kuralı)
            </h3>
            <p className="text-xs text-white/95 mt-1 leading-relaxed">
              {deadlineStatus.message}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={onPrint}
                className="px-3.5 py-1.5 bg-white text-amber-900 rounded-lg text-xs font-bold shadow-xs hover:bg-amber-50 cursor-pointer"
              >
                🖨️ Resmi Dilekçe ve Plan Çıktısı Al (PDF)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. OKUL VE RESMİ BAŞVURU BİLGİLERİ */}
      <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-xs border border-slate-200">
        <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              1. Okul ve Resmi Dilekçe Başlığı Bilgileri
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Dilekçenin sunulacağı okul idaresi ve kurum kayıt bilgileri
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              İl <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                list="school-city-options"
                value={data.city}
                onChange={(e) => onChange({ city: e.target.value })}
                placeholder="Örn: İstanbul"
                className="w-full px-3.5 py-2 text-sm font-medium rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition bg-white"
              />
              <datalist id="school-city-options">
                {TURKISH_CITIES.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                İlçe <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
                Üsküdar Tanımlı
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                list="school-district-options"
                value={data.district}
                onChange={(e) => onChange({ district: e.target.value })}
                placeholder="Örn: Üsküdar"
                className="w-full px-3.5 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition bg-white text-slate-900"
              />
              <datalist id="school-district-options">
                {ISTANBUL_DISTRICTS.filter(d => d !== 'Tüm İlçeler').map(d => <option key={d} value={d} />)}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Okul Adı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.schoolName}
              onChange={(e) => onChange({ schoolName: e.target.value })}
              placeholder="Örn: Zeynep Kamil İlkokulu"
              className="w-full px-3.5 py-2 text-sm font-medium rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kulüp / Düzenleyen Birim
            </label>
            <input
              type="text"
              value={data.clubName}
              onChange={(e) => onChange({ clubName: e.target.value })}
              placeholder="Sosyal Etkinlikler ve Gezi Kulübü"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dilekçe Tarihi
            </label>
            <input
              type="date"
              value={data.documentDate}
              onChange={(e) => onChange({ documentDate: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sayı / Evrak Kayıt No
            </label>
            <input
              type="text"
              value={data.documentNumber}
              onChange={(e) => onChange({ documentNumber: e.target.value })}
              placeholder="E-83920194-000-001"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Okul Müdürü (Onay Makamı)
            </label>
            <input
              type="text"
              value={data.principalName}
              onChange={(e) => onChange({ principalName: e.target.value })}
              placeholder="Adı Soyadı"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Müdür Yardımcısı / Kurul Başkanı
            </label>
            <input
              type="text"
              value={data.deputyPrincipalName}
              onChange={(e) => onChange({ deputyPrincipalName: e.target.value })}
              placeholder="Adı Soyadı"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
            />
          </div>
        </div>
      </section>

      {/* 2. GEZİ MEKÂNI VE LİSTE DIŞI SERBEST ETKİNLİK ALANI GİRİŞİ */}
      <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                2. Gezi Yeri / Etkinlik Alanı ve Türü
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Mekânı il/ilçe ve kategori bazında filtreleyebilir veya liste dışı istediğiniz etkinlik alanını serbestçe yazabilirsiniz
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onChange({ destinationMode: 'preset' })}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                data.destinationMode === 'preset'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏛️ Listeden Mekân Seç
            </button>
            <button
              type="button"
              onClick={() => onChange({ destinationMode: 'custom' })}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                data.destinationMode === 'custom'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ✍️ Liste Dışı / Elle Etkinlik Alanı Yaz
            </button>
          </div>
        </div>

        {/* Preset Selection Controls */}
        {data.destinationMode === 'preset' ? (
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 mb-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              {/* İl Seçimi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  1. İl Seçiniz
                </label>
                <select
                  value={data.selectedCity}
                  onChange={(e) => onChange({ selectedCity: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  <option value="">Tüm İller</option>
                  {TURKISH_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* İlçe Seçimi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  2. İlçe Seçiniz
                </label>
                <select
                  value={data.selectedDistrict || 'Tüm İlçeler'}
                  onChange={(e) => onChange({ selectedDistrict: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  {ISTANBUL_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kategori Seçimi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  3. Kategori Seçiniz
                </label>
                <select
                  value={data.destinationCategory}
                  onChange={(e) => onChange({ destinationCategory: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hazır Mekanlar Listesi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  4. Hazır EBA / MEB Mekânları ({filteredLocations.length})
                </label>
                <select
                  onChange={(e) => handleSelectPreset(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-emerald-300 bg-white text-emerald-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>-- Listeden Mekân Seçiniz --</option>
                  {filteredLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.district ? `${loc.district}/` : ''}{loc.city})
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Listeden bir yer seçtikten sonra aşağıdaki alanlardan dilediğiniz gibi düzenleyebilir veya doğrudan kullanabilirsiniz.</span>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200 rounded-xl p-4 mb-5 space-y-3">
            <div className="flex items-start gap-2.5">
              <Edit3 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                  ✍️ Liste Dışı Serbest Etkinlik Alanı Modu Aktif
                </h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  EBA listesinde yer almayan herhangi bir okullar arası ziyaret, çocuk tiyatrosu, spor tesisi, doğa parkuru, üretim fabrikası, botanik bahçe veya atölye alanını serbestçe aşağıya yazabilirsiniz.
                </p>
              </div>
            </div>

            {/* Hızlı Örnek Liste Dışı Etkinlik Alanı Butonları */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-amber-800 mr-1">Hızlı Doldur:</span>
              <button
                type="button"
                onClick={() => onChange({
                  destinationName: 'Üsküdar Çamlıca Tabiat ve Yürüyüş Parkuru',
                  destinationAddress: 'Küçük Çamlıca Mah. Üsküdar / İstanbul',
                  destinationCategory: 'Açık Hava / Spor / Doğa Macera Parkuru / İzcilik Alanı'
                })}
                className="px-2 py-1 text-[11px] font-medium bg-white hover:bg-amber-100/70 text-amber-900 rounded border border-amber-300 transition cursor-pointer"
              >
                🌲 Çamlıca Tabiat Parkuru
              </button>
              <button
                type="button"
                onClick={() => onChange({
                  destinationName: 'Üsküdar Belediyesi Gençlik ve Çocuk Sahnesi',
                  destinationAddress: 'Mimar Sinan Mah. Çavuşdere Cad. Üsküdar / İstanbul',
                  destinationCategory: 'Sanat Galerisi / Tiyatro Sahnesi / Kültür Merkezi'
                })}
                className="px-2 py-1 text-[11px] font-medium bg-white hover:bg-amber-100/70 text-amber-900 rounded border border-amber-300 transition cursor-pointer"
              >
                🎭 Çocuk Tiyatro Sahnesi
              </button>
              <button
                type="button"
                onClick={() => onChange({
                  destinationName: 'Özel Robotik Tasarım ve Kodlama Atölyesi',
                  destinationAddress: 'Altunizade Mah. Kısıklı Cad. Üsküdar / İstanbul',
                  destinationCategory: 'Zanaat & Sanat Atölyesi / Robotik & Tasarım Atölyesi'
                })}
                className="px-2 py-1 text-[11px] font-medium bg-white hover:bg-amber-100/70 text-amber-900 rounded border border-amber-300 transition cursor-pointer"
              >
                🤖 Robotik Atölyesi
              </button>
            </div>
          </div>
        )}

        {/* Location Inputs (Always Editable) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Gezi Yeri / Etkinlik Alanı Adı <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={data.destinationName}
                onChange={(e) => onChange({ destinationName: e.target.value })}
                placeholder="Örn: Bilim Üsküdar, Çamlıca Parkı veya Özel Robotik Atölyesi"
                className="w-full pl-3.5 pr-8 py-2.5 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Etkinlik Alanı Kategorisi / Türü
            </label>
            <select
              value={data.destinationCategory}
              onChange={(e) => onChange({ destinationCategory: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Etkinlik Alanının Açık Adresi / Bulunduğu İl-İlçe
            </label>
            <input
              type="text"
              value={data.destinationAddress}
              onChange={(e) => onChange({ destinationAddress: e.target.value })}
              placeholder="Örn: Hasköy Cad. No:5 Hasköy, Beyoğlu / İstanbul veya Üsküdar / İstanbul"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gezi Kapsamı
              </label>
              <select
                value={data.tripType}
                onChange={(e) => onChange({ tripType: e.target.value as any })}
                className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="İl İçi">İl İçi Gezi</option>
                <option value="İl Dışı">İl Dışı Gezi (İl MEM Onaylı)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Süre
              </label>
              <select
                value={data.tripDuration}
                onChange={(e) => onChange({ tripDuration: e.target.value as any })}
                className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Günübirlik">Günübirlik</option>
                <option value="Konaklamalı">Konaklamalı</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EĞİTİM, KAZANIMLAR VE MAARİF MODELİ BİLGİLERİ */}
      <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-xs border border-slate-200">
        <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              3. Eğitim Programı, Gezinin Amacı ve Öğrenme Çıktıları / Kazanımları
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Türkiye Yüzyılı Maarif Modeli (Okul Öncesi, 1, 2, 3. Sınıf) ve MEB Öğretim Programı (4. Sınıf) ders ve konu bazlı kazanım seçimi
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              İlgili Ders / Alan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.courseName}
              onChange={(e) => onChange({ courseName: e.target.value })}
              placeholder="Örn: Hayat Bilgisi / Fen Bilimleri / Sosyal Bilgiler"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Gezinin Konusu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.subjectTopic}
              onChange={(e) => onChange({ subjectTopic: e.target.value })}
              placeholder="Örn: Bilim Tarihi ve Ulaşım Araçlarının Geçmişten Günümüze Gelişimi"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Gezinin Amacı ve Gerekçesi <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2}
            value={data.purpose}
            onChange={(e) => onChange({ purpose: e.target.value })}
            placeholder="Öğrencilerin okul dışı öğrenme ortamlarında yerinde gözlem yaparak inceleme becerilerini geliştirmeleri..."
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>

        {/* KAZANIM / ÖĞRENME ÇIKTISI SEÇİM KUTUSU (HİYERARŞİK MENÜ) */}
        <div className="bg-gradient-to-br from-indigo-50/70 via-slate-50 to-blue-50/50 rounded-xl border border-indigo-200 p-4 sm:p-5 mb-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span className="text-xs sm:text-sm font-bold text-indigo-950">
                Öğretim Programı & Maarif Modeli Açılır Menüden Kazanım Seçici
              </span>
            </div>
            <span className="text-[11px] font-semibold text-indigo-700 px-2 py-0.5 rounded-md bg-indigo-100/70">
              {currentGradeData.modelType}
            </span>
          </div>

          {/* Sınıf / Kademe ve Ders Seçimi Dropdownları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                1. Sınıf Düzeyi Seçiniz:
              </label>
              <select
                value={selectedGradeId}
                onChange={(e) => handleGradeChange(e.target.value)}
                className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-indigo-300 bg-white text-indigo-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {CURRICULUM_DATA.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.grade} {item.id === 'grade-4' ? '(Eski / Mevcut Program)' : '(Maarif Modeli)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                2. İlgili Dersi Seçiniz:
              </label>
              <select
                value={selectedLessonName}
                onChange={(e) => setSelectedLessonName(e.target.value)}
                className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-indigo-300 bg-white text-indigo-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {currentLessons.map((l) => (
                  <option key={l.name} value={l.name}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  onChange({ courseName: selectedLessonName });
                }}
                className="w-full px-3 py-2 text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-300 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Bu Dersi Form Alanına Yaz</span>
              </button>
            </div>
          </div>

          {/* Konu ve Kazanımlar Listesi */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-slate-700 block">
              3. Konu Bazlı Öğrenme Çıktıları / Kazanımlar (Tek tıkla forma ekleyin):
            </span>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {currentLesson.topics.map((topic, tIdx) => (
                <div key={tIdx} className="bg-white rounded-lg p-3 border border-indigo-100 shadow-xs">
                  <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">
                      📖 {topic.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddAllTopicOutcomes(topic.outcomes)}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>Bu Konudaki Tümünü Ekle</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {topic.outcomes.map((out) => {
                      const isAlreadyAdded = data.outcomes?.includes(out.text);
                      return (
                        <div
                          key={out.code}
                          className={`p-2 rounded-md text-xs flex items-start justify-between gap-2 transition ${
                            isAlreadyAdded 
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                              : 'bg-slate-50 hover:bg-indigo-50/70 text-slate-700 border border-slate-200/80'
                          }`}
                        >
                          <span className="font-mono text-[11px] leading-relaxed flex-1">
                            {out.text}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddOutcome(out.text)}
                            disabled={isAlreadyAdded}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded shrink-0 transition cursor-pointer ${
                              isAlreadyAdded
                                ? 'bg-emerald-200/60 text-emerald-800 cursor-default'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                            }`}
                          >
                            {isAlreadyAdded ? '✓ Eklendi' : '+ Ekle'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* METİN ALANI (HER SATIRA BİR KAZANIM) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-800">
              Öğretim Programı / Maarif Modeli İlgili Öğrenme Çıktıları / Kazanımları (Her satıra bir kazanım) <span className="text-red-500">*</span>
            </label>
            {data.outcomes && (
              <button
                type="button"
                onClick={() => onChange({ outcomes: '' })}
                className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer"
              >
                Kazanımları Temizle
              </button>
            )}
          </div>
          <textarea
            rows={4}
            value={data.outcomes}
            onChange={(e) => onChange({ outcomes: e.target.value })}
            placeholder="Yukarıdaki menüden seçebilir veya elle her satıra bir kazanım/öğrenme çıktısı yazabilirsiniz..."
            className="w-full px-3.5 py-2.5 text-xs font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition leading-relaxed bg-white"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            * Yukarıdaki menüden ekleme yapabilir ya da bu alana serbestçe ekleme/çıkarma yapabilirsiniz.
          </span>
        </div>
      </section>

      {/* 4. HEDEF SINIFLAR VE KATILIMCI SAYILARI (HER SINIF AYRI SATIRDA VE ALTTA TOPLAM) */}
      <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                4. Hedef Sınıflar ve Katılımcı Sayıları (Sınıf Bazlı Dağılım)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Her sınıfı ayrı satır olarak ekleyiniz; öğrenci sayıları ve genel toplam otomatik hesaplanır
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddGradeRow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Yeni Sınıf/Şube Ekle</span>
          </button>
        </div>

        {/* Sınıf Satırları Tablosu */}
        <div className="space-y-3 mb-6">
          <div className="hidden sm:grid grid-cols-12 gap-3 px-3 py-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-1 text-center">S.N</div>
            <div className="col-span-4">Sınıf / Şube Adı</div>
            <div className="col-span-2 text-center">Erkek Öğrenci</div>
            <div className="col-span-2 text-center">Kız Öğrenci</div>
            <div className="col-span-2 text-center">Şube Toplamı</div>
            <div className="col-span-1 text-right">İşlem</div>
          </div>

          {gradeRows.map((row, index) => (
            <div 
              key={row.id} 
              className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/70 items-center hover:border-blue-200 transition-all"
            >
              {/* S.N */}
              <div className="sm:col-span-1 text-center font-bold text-xs text-slate-400 hidden sm:block">
                {index + 1}
              </div>

              {/* Sınıf Adı */}
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-600 sm:hidden mb-1">
                  Sınıf / Şube Adı:
                </label>
                <input
                  type="text"
                  value={row.gradeName}
                  onChange={(e) => handleUpdateGradeRow(index, 'gradeName', e.target.value)}
                  placeholder="Örn: Anasınıfı-A, 1-A, 3-B, vb."
                  className="w-full px-3 py-2 text-sm font-bold text-slate-900 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Erkek */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 sm:hidden mb-1">
                  Erkek Sayısı:
                </label>
                <input
                  type="number"
                  min="0"
                  value={row.maleCount || ''}
                  onChange={(e) => handleUpdateGradeRow(index, 'maleCount', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm font-semibold text-center rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Kız */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 sm:hidden mb-1">
                  Kız Sayısı:
                </label>
                <input
                  type="number"
                  min="0"
                  value={row.femaleCount || ''}
                  onChange={(e) => handleUpdateGradeRow(index, 'femaleCount', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm font-semibold text-center rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Şube Toplamı */}
              <div className="sm:col-span-2 text-center">
                <label className="block text-[11px] font-semibold text-slate-600 sm:hidden mb-1">
                  Şube Toplamı:
                </label>
                <div className="w-full px-2 py-2 text-sm font-extrabold bg-blue-100/70 text-blue-900 rounded-lg border border-blue-200">
                  {row.totalCount || 0} Öğrenci
                </div>
              </div>

              {/* Sil */}
              <div className="sm:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveGradeRow(index)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  title="Şubeyi Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ALT TOPLAM KARTLARI */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-xl p-4 sm:p-5 text-white shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
            
            <div className="sm:col-span-1">
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block">
                Katılımcı Şubeler:
              </span>
              <span className="text-sm font-bold text-white truncate block mt-0.5">
                {data.targetGrades || 'Şube Belirtilmedi'}
              </span>
            </div>

            <div className="sm:col-span-1 bg-white/10 rounded-lg p-2.5 text-center border border-white/10">
              <span className="text-[11px] text-blue-200 uppercase block font-semibold">Toplam Erkek</span>
              <span className="text-lg font-black text-white">{data.maleStudentCount} Kişi</span>
            </div>

            <div className="sm:col-span-1 bg-white/10 rounded-lg p-2.5 text-center border border-white/10">
              <span className="text-[11px] text-blue-200 uppercase block font-semibold">Toplam Kız</span>
              <span className="text-lg font-black text-white">{data.femaleStudentCount} Kişi</span>
            </div>

            <div className="sm:col-span-1 bg-gradient-to-r from-red-600 to-rose-600 rounded-lg p-3 text-center shadow-md">
              <span className="text-[11px] text-red-100 uppercase block font-bold">GENEL TOPLAM</span>
              <span className="text-xl font-black text-white">{data.totalStudentCount} ÖĞRENCİ</span>
            </div>

          </div>
        </div>
      </section>

      {/* 5. GÖREVLİ ÖĞRETMEN VE REFAKATÇİ LİSTESİ (DİNAMİK) */}
      <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-xs border border-slate-200">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                5. Kafile Başkanı, Görevli Öğretmenler ve Refakatçiler
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Resmi dilekçede ve kafile listesinde yer alacak görevli personel
              </p>
            </div>
          </div>
        </div>

        {/* Kafile Başkanı (Sabit Birinci Sorumlu) */}
        <div className="mb-6 p-4 rounded-xl bg-violet-50/50 border border-violet-100">
          <div className="text-xs font-bold uppercase tracking-wider text-violet-800 mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-600"></span>
            Kafile Başkanı (1. Derece Sorumlu Öğretmen)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Adı Soyadı *</label>
              <input
                type="text"
                value={data.headTeacher.fullName}
                onChange={(e) => onChange({ headTeacher: { ...data.headTeacher, fullName: e.target.value } })}
                placeholder="Örn: Ali Serkan KAYA"
                className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Branşı / Sınıfı</label>
              <input
                type="text"
                value={data.headTeacher.branch}
                onChange={(e) => onChange({ headTeacher: { ...data.headTeacher, branch: e.target.value } })}
                placeholder="Sınıf Öğretmeni (3-A)"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">İletişim Telefonu</label>
              <input
                type="text"
                value={data.headTeacher.phone}
                onChange={(e) => onChange({ headTeacher: { ...data.headTeacher, phone: e.target.value } })}
                placeholder="0532 000 00 00"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">T.C. Kimlik No</label>
              <input
                type="text"
                maxLength={11}
                value={data.headTeacher.tcNo || ''}
                onChange={(e) => onChange({ headTeacher: { ...data.headTeacher, tcNo: e.target.value } })}
                placeholder="11 Haneli T.C."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Görevli Öğretmenler (Dinamik Liste) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Görevli / Rehber Öğretmenler ({data.teachers.length})
            </span>
            <button
              type="button"
              onClick={handleAddTeacher}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-lg border border-violet-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Öğretmen Ekle</span>
            </button>
          </div>

          <div className="space-y-3">
            {data.teachers.map((teacher, index) => (
              <div key={teacher.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 items-center">
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    value={teacher.fullName}
                    onChange={(e) => handleUpdateTeacher(index, 'fullName', e.target.value)}
                    placeholder="Öğretmen Adı Soyadı"
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-violet-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    value={teacher.branch}
                    onChange={(e) => handleUpdateTeacher(index, 'branch', e.target.value)}
                    placeholder="Branşı / Görevi"
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-violet-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    value={teacher.phone}
                    onChange={(e) => handleUpdateTeacher(index, 'phone', e.target.value)}
                    placeholder="Telefon Numarası"
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-violet-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveTeacher(index)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Öğretmeni Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Görevli Veliler / Refakatçiler */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Görevli Veli Refakatçiler ({data.companions.length})
            </span>
            <button
              type="button"
              onClick={handleAddCompanion}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Veli / Refakatçi Ekle</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {data.companions.map((comp, index) => (
              <div key={comp.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 items-center">
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    value={comp.fullName}
                    onChange={(e) => handleUpdateCompanion(index, 'fullName', e.target.value)}
                    placeholder="Veli / Refakatçi Adı Soyadı"
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-slate-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    value={comp.role}
                    onChange={(e) => handleUpdateCompanion(index, 'role', e.target.value)}
                    placeholder="Görevi (Veli vb.)"
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-slate-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    value={comp.phone}
                    onChange={(e) => handleUpdateCompanion(index, 'phone', e.target.value)}
                    placeholder="Telefon"
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-slate-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveCompanion(index)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TARİH, ZAMAN VE ULAŞIM BİLGİLERİ */}
      <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-xs border border-slate-200">
        <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              6. Tarih, Zaman, Ulaşım ve Güzergâh Bilgileri
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Gezi başlangıç-bitiş saatleri, araç plakası, şoför ve seyahat rotası
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Gezi Tarihi <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={data.tripDate}
              onChange={(e) => onChange({ tripDate: e.target.value })}
              className="w-full px-3.5 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hareket Saati <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={data.departureTime}
              onChange={(e) => onChange({ departureTime: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dönüş Saati <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={data.returnTime}
              onChange={(e) => onChange({ returnTime: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ulaşım Türü
            </label>
            <select
              value={data.transportationType}
              onChange={(e) => onChange({ transportationType: e.target.value as any })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 outline-none font-semibold text-slate-800"
            >
              <option value="Özel Turizm Otobüsü">Özel Turizm Otobüsü (D2 Yetki Belgeli)</option>
              <option value="Okul Servis Aracı">Okul Servis Aracı</option>
              <option value="Belediye / Toplu Taşıma">Belediye / Toplu Taşıma (Belediye Araç Talepli)</option>
              <option value="Yürüyerek">Yürüyerek (Yakın Çevre / Araçsız)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hareket / Buluşma Yeri
            </label>
            <input
              type="text"
              value={data.departureLocation}
              onChange={(e) => onChange({ departureLocation: e.target.value })}
              placeholder="Okul Bahçesi"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dönüş / Bitiş Yeri
            </label>
            <input
              type="text"
              value={data.returnLocation}
              onChange={(e) => onChange({ returnLocation: e.target.value })}
              placeholder="Okul Bahçesi"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {data.transportationType === 'Belediye / Toplu Taşıma' && (
            <div className="sm:col-span-2 lg:col-span-4 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-blue-900">
              <Bus className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Belediye Ulaşım Desteği:</strong> Resmi dilekçeye ve plana <em>"Gezi için ilgili Belediye Başkanlığından araç tahsisi ve ulaşım desteği talebinde bulunulmuştur."</em> resmi ibaresi otomatik olarak eklenecektir.
              </span>
            </div>
          )}

          {data.transportationType === 'Yürüyerek' ? (
            <div className="sm:col-span-2 lg:col-span-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-950 block">
                  🚶 Yürüyerek Ulaşım Seçildi (Araçsız Yakın Çevre Gezisi)
                </span>
                <span className="text-[11px] text-emerald-700 block mt-0.5">
                  Araç plakası, firma ve şoför bilgisi gerekmemektedir. Lütfen aşağıdaki seyahat güzergâhı alanına yürüyüş rotasını ve cadde/sokak hattını yazınız.
                </span>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Araç Plakası
                </label>
                <input
                  type="text"
                  value={data.vehiclePlate}
                  onChange={(e) => onChange({ vehiclePlate: e.target.value })}
                  placeholder="34 ZK 1923"
                  className="w-full px-3.5 py-2 text-sm uppercase rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Firma / Turizm Acentesi
                </label>
                <input
                  type="text"
                  value={data.transportCompany}
                  onChange={(e) => onChange({ transportCompany: e.target.value })}
                  placeholder="Lider Turizm A.Ş."
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sürücü Adı Soyadı
                </label>
                <input
                  type="text"
                  value={data.driverName}
                  onChange={(e) => onChange({ driverName: e.target.value })}
                  placeholder="Mustafa KAYA"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sürücü İletişim Telefonu
                </label>
                <input
                  type="text"
                  value={data.driverPhone}
                  onChange={(e) => onChange({ driverPhone: e.target.value })}
                  placeholder="0532 000 00 00"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </>
          )}

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Gezi Güzergâhı (Takip Edilecek Yol Hattı)
            </label>
            <input
              type="text"
              value={data.travelRoute}
              onChange={(e) => onChange({ travelRoute: e.target.value })}
              placeholder="Okul -> 15 Temmuz Şehitler Köprüsü -> Hasköy Sahil Yolu -> Müze Alanı -> Okul"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>
      </section>

      {/* 7. ZAMAN AKIŞ ÇİZELGESİ (DİNAMİK ETKİNLİK PROGRAMI) */}
      <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-xs border border-slate-200">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                7. Gezi Zaman Akış Çizelgesi (Saatlik Etkinlik Programı)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Gezinin saat saat planlanan toplanma, inceleme, etkinlik ve dönüş aşamaları
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddScheduleItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Akış Satırı Ekle</span>
          </button>
        </div>

        <div className="space-y-3">
          {data.schedule.map((item, index) => (
            <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/80 items-center">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={item.timeRange}
                  onChange={(e) => handleUpdateScheduleItem(index, 'timeRange', e.target.value)}
                  placeholder="09:00 - 10:00"
                  className="w-full px-2.5 py-1.5 text-xs font-bold text-center rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="sm:col-span-5">
                <input
                  type="text"
                  value={item.activity}
                  onChange={(e) => handleUpdateScheduleItem(index, 'activity', e.target.value)}
                  placeholder="Yapılacak Etkinlik / Aşama Açıklaması"
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={item.location}
                  onChange={(e) => handleUpdateScheduleItem(index, 'location', e.target.value)}
                  placeholder="Mekân / Bölüm"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={item.responsible}
                  onChange={(e) => handleUpdateScheduleItem(index, 'responsible', e.target.value)}
                  placeholder="Sorumlular"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="sm:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveScheduleItem(index)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  title="Satırı Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. ÖNCESİ - SIRASI - SONRASI DEĞERLENDİRME SÜREÇLERİ */}
      <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-xs border border-slate-200">
        <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              8. Gezi Öncesi, Sırası ve Sonrası Değerlendirme & Güvenlik
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Okul dışı öğrenme sürecinin pedagojik adımları ve güvenlik tedbirleri
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Gezi Öncesi Yapılacak Hazırlıklar
            </label>
            <textarea
              rows={2}
              value={data.preTripNotes}
              onChange={(e) => onChange({ preTripNotes: e.target.value })}
              placeholder="Veli izin belgeleri, okul idaresi onayı, öğrenci bilgilendirmesi..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Gezi Sırasında Yapılacak Etkinlik ve Gözlemler
            </label>
            <textarea
              rows={2}
              value={data.duringTripNotes}
              onChange={(e) => onChange({ duringTripNotes: e.target.value })}
              placeholder="Rehberli anlatım, çalışma yaprakları uygulaması, inceleme..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Gezi Sonrası Değerlendirme ve Yansıtma Çalışmaları
            </label>
            <textarea
              rows={2}
              value={data.postTripNotes}
              onChange={(e) => onChange({ postTripNotes: e.target.value })}
              placeholder="Sınıf içi sunum, pano sergisi, öğrenci yansıtma formu..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alınan Güvenlik ve İlk Yardım Tedbirleri
            </label>
            <textarea
              rows={2}
              value={data.safetyMeasures}
              onChange={(e) => onChange({ safetyMeasures: e.target.value })}
              placeholder="İlk yardım çantası, acil durum irtibatları, öğrenci takip sorumlulukları..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>
        </div>
      </section>

      {/* Bottom Floating / Big Action Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-2xl p-6 text-white shadow-xl shadow-red-500/20 flex flex-col lg:flex-row items-center justify-between gap-5">
        <div className="space-y-1 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider text-red-100">
              MEB Onay Süreci
            </span>
            <span className="text-xs text-red-200">
              Müdür: Recep KIZILIRMAK | Md. Yrd: Fudan FİDAN
            </span>
          </div>
          <h3 className="text-lg font-black tracking-tight">Gezi Planı ve Dilekçeniz Hazır mı?</h3>
          <p className="text-xs sm:text-sm text-red-100 max-w-xl">
            Bilgileri tamamladıktan sonra Okul İdaresi onayına sunabilir, taslak olarak kaydedebilir veya doğrudan resmi A4 formatında yazdırabilirsiniz.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0 w-full lg:w-auto">
          {/* Taslak Kaydet */}
          {onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              className="px-4 py-3 bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Taslak Kaydet</span>
            </button>
          )}

          {/* PDF İndir */}
          {onDownloadPDF && (
            <button
              type="button"
              onClick={onDownloadPDF}
              className="px-4 py-3 bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/30 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              title="2 Sayfalık Resmi A4 Gezi Planını PDF Olarak İndir"
            >
              <FileDown className="w-4 h-4 text-white" />
              <span>PDF İndir</span>
            </button>
          )}

          {/* Resmi Yazdır */}
          <button
            type="button"
            onClick={onPrint}
            className="px-4 py-3 bg-slate-900/40 hover:bg-slate-900/60 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🖨️ Yazdır</span>
          </button>

          {/* Onaya Gönder & Veritabanına Kaydet (Ana Buton) */}
          {onSubmitForApproval && !isLockedForTeacher && (
            <button
              type="button"
              onClick={onSubmitForApproval}
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-red-700 font-black text-sm sm:text-base rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Send className="w-4 h-4 text-red-600" />
              <span>Onaya Gönder & Kaydet</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
