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
  Sparkles
} from 'lucide-react';
import type { GeziPlanData, GeziTeacher, GeziCompanion, GeziScheduleItem } from '../types';
import { TURKISH_CITIES, CATEGORIES, PRESET_LOCATIONS } from '../data/locations';
import { CURRICULUM_DATA } from '../data/curriculum';

interface GeziFormProps {
  data: GeziPlanData;
  onChange: (updated: Partial<GeziPlanData>) => void;
  onPrint: () => void;
}

export const GeziForm: React.FC<GeziFormProps> = ({ data, onChange, onPrint }) => {
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
    if (existing.includes(outcomeText)) return; // already added
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

  // Filtered preset locations based on city and category
  const filteredLocations = PRESET_LOCATIONS.filter(loc => {
    const cityMatch = !data.selectedCity || loc.city === data.selectedCity;
    const catMatch = !data.destinationCategory || data.destinationCategory === 'Diğer / Liste Dışı Özel Mekân' || loc.category === data.destinationCategory;
    return cityMatch && catMatch;
  });

  // Handle number changes
  const handleStudentCountChange = (field: 'maleStudentCount' | 'femaleStudentCount', value: number) => {
    const male = field === 'maleStudentCount' ? value : data.maleStudentCount;
    const female = field === 'femaleStudentCount' ? value : data.femaleStudentCount;
    onChange({
      [field]: value,
      totalStudentCount: Number(male || 0) + Number(female || 0)
    });
  };

  // Preset location select
  const handleSelectPreset = (locId: string) => {
    const found = PRESET_LOCATIONS.find(l => l.id === locId);
    if (found) {
      onChange({
        destinationName: found.name,
        destinationAddress: found.address,
        destinationCategory: found.category,
        selectedCity: found.city,
        courseName: found.suggestedCourses || data.courseName
      });
    }
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
            <input
              type="text"
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder="Örn: İstanbul"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              İlçe <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.district}
              onChange={(e) => onChange({ district: e.target.value })}
              placeholder="Örn: Üsküdar"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
            />
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

      {/* 2. GEZİ MEKÂNI VE LİSTE DIŞI SERBEST GİRİŞ BÖLÜMÜ */}
      <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                2. Gezi Yeri / Mekânı ve Türü
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Mekânı EBA/MEB listesinden seçebilir veya liste dışı elle serbestçe yazabilirsiniz
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
              ✍️ Liste Dışı / Elle Yaz
            </button>
          </div>
        </div>

        {/* Preset Selection Controls */}
        {data.destinationMode === 'preset' ? (
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 mb-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  İl Filtrele
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hazır EBA / MEB Mekânları ({filteredLocations.length})
                </label>
                <select
                  onChange={(e) => handleSelectPreset(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-emerald-300 bg-white text-emerald-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>-- Listeden Mekân Seçiniz --</option>
                  {filteredLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.city})
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
          <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 mb-5">
            <div className="flex items-start gap-2.5">
              <Edit3 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                  Liste Dışı Özel Mekân Modu Aktif
                </h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  EBA listesinde yer almayan herhangi bir okullar arası ziyaret, özel atölye, fabrika, çiftlik, botanik bahçe, tiyatro vb. yer bilgisini serbestçe girebilirsiniz.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Location Inputs (Always Editable) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Gezi Yeri / Mekân Adı <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={data.destinationName}
                onChange={(e) => onChange({ destinationName: e.target.value })}
                placeholder="Örn: Rahmi M. Koç Müzesi veya Kadıköy Belediyesi Çocuk Sanat Merkezi"
                className="w-full pl-3.5 pr-8 py-2.5 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mekânın Açık Adresi / Bulunduğu İl-İlçe
            </label>
            <input
              type="text"
              value={data.destinationAddress}
              onChange={(e) => onChange({ destinationAddress: e.target.value })}
              placeholder="Örn: Hasköy Cad. No:5 Hasköy, Beyoğlu / İstanbul"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Gezi Kapsamı
            </label>
            <select
              value={data.tripType}
              onChange={(e) => onChange({ tripType: e.target.value as any })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="İl İçi">İl İçi Gezi</option>
              <option value="İl Dışı">İl Dışı Gezi (İl MEM / Mülki İdare Onaylı)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Konaklama Durumu
            </label>
            <select
              value={data.tripDuration}
              onChange={(e) => onChange({ tripDuration: e.target.value as any })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Günübirlik">Günübirlik</option>
              <option value="Konaklamalı">Konaklamalı Gezi</option>
            </select>
          </div>
        </div>
      </section>

      {/* 3. EĞİTİM, KAZANIMLAR VE MAARİF MODELİ BİLGİLERİ (GELİŞMİŞ KAZANIM SEÇİCİ) */}
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
            
            {/* 1. Sınıf Seçimi */}
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

            {/* 2. Ders Seçimi */}
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

            {/* Hızlı Ders Adını Forma Aktar Butonu */}
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

      {/* 4. KATILIMCI KADROSU VE ÖĞRENCİ SAYILARI */}
      <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-xs border border-slate-200">
        <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              4. Hedef Sınıflar ve Katılımcı Sayıları
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Geziye katılacak öğrenci şubeleri ve sayı dağılımları
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hedef Sınıf ve Şubeler <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.targetGrades}
              onChange={(e) => onChange({ targetGrades: e.target.value })}
              placeholder="Örn: 3-A, 3-B, 3-C Şubeleri veya Anasınıfı A Şubesi"
              className="w-full px-3.5 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Erkek Öğrenci Sayısı
            </label>
            <input
              type="number"
              min="0"
              value={data.maleStudentCount || ''}
              onChange={(e) => handleStudentCountChange('maleStudentCount', parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kız Öğrenci Sayısı
            </label>
            <input
              type="number"
              min="0"
              value={data.femaleStudentCount || ''}
              onChange={(e) => handleStudentCountChange('femaleStudentCount', parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-blue-900 mb-1">
              Toplam Öğrenci
            </label>
            <div className="w-full px-3.5 py-2 text-sm font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg flex items-center justify-between">
              <span>{data.totalStudentCount} Kişi</span>
              <span className="text-[10px] text-blue-500 uppercase font-bold">Oto</span>
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
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="Özel Turizm Otobüsü">Özel Turizm Otobüsü (D2 Yetki Belgeli)</option>
              <option value="Okul Servis Aracı">Okul Servis Aracı</option>
              <option value="Belediye / Toplu Taşıma">Belediye / Toplu Taşıma</option>
              <option value="Yürüyerek">Yürüyerek (Yakın Çevre)</option>
              <option value="Diğer">Diğer</option>
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
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-2xl p-6 text-white shadow-xl shadow-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black tracking-tight">Gezi Planı ve Dilekçeniz Hazır mı?</h3>
          <p className="text-xs sm:text-sm text-red-100 mt-1">
            Bilgileri tamamladıktan sonra butona tıklayarak resmi A4 formatında yazdırabilir veya PDF olarak kaydedebilirsiniz.
          </p>
        </div>

        <button
          type="button"
          onClick={onPrint}
          className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-red-700 font-extrabold text-sm sm:text-base rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer shrink-0"
        >
          <span>🖨️ Resmi Planı Yazdır / PDF Al</span>
        </button>
      </div>

    </div>
  );
};
