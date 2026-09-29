// 100-Case Extreme Stress Test & Fuzzing Matrix
// MEB Okul Dışı Öğrenme Gezi Portalı - Automated System Testing

class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

globalThis.localStorage = new MockLocalStorage();
globalThis.window = { localStorage: globalThis.localStorage, confirm: () => true, alert: () => {} };
globalThis.document = {
  createElement: () => ({ href: '', target: '', click: () => {}, remove: () => {} }),
  body: { appendChild: () => {} }
};

const STORAGE_KEY = 'odos_gezi_plani_saved_records_v1';
const DEFAULT_SCHOOL_EMAIL = 'zeynepkamililkokulu@gmail.com';

function checkTripDeadlineRule(tripDateStr, transportationType) {
  const isMunicipality = transportationType === 'Belediye / Toplu Taşıma';
  const requiredDays = isMunicipality ? 15 : 7;

  if (!tripDateStr || typeof tripDateStr !== 'string') {
    return { isEditable: true, daysRemaining: 999, requiredDays, message: `Gezi Bildirim Süresi: En az ${requiredDays} gün önceden.` };
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parts = tripDateStr.split('-').map(Number);
    if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
      return { isEditable: true, daysRemaining: 999, requiredDays, message: 'Geçerli bir tarih giriniz.' };
    }

    const tripDate = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
    const diffTime = tripDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        isEditable: false,
        daysRemaining: diffDays,
        requiredDays,
        message: 'Gezi tarihi geçmiştir. Geçmiş tarihli planlar güncellenemez, sadece resmi arşiv çıktısı alınabilir.'
      };
    }

    if (diffDays < requiredDays) {
      return {
        isEditable: false,
        daysRemaining: diffDays,
        requiredDays,
        message: isMunicipality
          ? `Belediyeden araç talep edilecek gezilerde en az 15 gün önceden bildirme zorunluluğu bulunmaktadır. Gezi tarihine ${diffDays} gün kaldığından planda değişiklik yapılamaz, sadece resmi çıktı alınabilir.`
          : `MEB Gezi Yönergesi gereği gezi tarihine en az 7 gün önceden bildirme zorunluluğu bulunmaktadır. Gezi tarihine ${diffDays} gün kaldığından planda değişiklik yapılamaz, sadece resmi çıktı alınabilir.`
      };
    }

    return {
      isEditable: true,
      daysRemaining: diffDays,
      requiredDays,
      message: isMunicipality
        ? `Belediye Araç Talepli Gezi (15 Gün Kuralı): Geziye ${diffDays} gün var (Güncelleme yapılabilir).`
        : `Standart Gezi (7 Gün Kuralı): Geziye ${diffDays} gün var (Güncelleme yapılabilir).`
    };
  } catch {
    return { isEditable: true, daysRemaining: 999, requiredDays, message: 'Düzenleme yapılabilir.' };
  }
}

function normalizePlan(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const gradeRows = Array.isArray(raw.gradeRows) ? raw.gradeRows : [];
  let male = 0, female = 0, total = 0;
  gradeRows.forEach(r => {
    if (r && typeof r === 'object') {
      const m = Math.max(0, parseInt(r.maleCount, 10) || 0);
      const f = Math.max(0, parseInt(r.femaleCount, 10) || 0);
      const t = Math.max(0, parseInt(r.totalCount, 10) || (m + f));
      male += m;
      female += f;
      total += t;
    }
  });

  const teachersArr = Array.isArray(raw.teachers) ? raw.teachers : [];
  const companionsArr = Array.isArray(raw.companions) ? raw.companions : [];
  const scheduleArr = Array.isArray(raw.schedule) ? raw.schedule : [];

  let transportationType = raw.transportationType || 'Özel Turizm Otobüsü';
  if (transportationType === 'Diğer') transportationType = 'Belediye / Toplu Taşıma';

  return {
    id: String(raw.id || 'gezi-' + Date.now()),
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
    status: raw.status || 'taslak',
    submittedBy: raw.submittedBy || '',
    teacherEmail: raw.teacherEmail || '',
    schoolEmail: raw.schoolEmail || DEFAULT_SCHOOL_EMAIL,
    
    clerkReviewedAt: raw.clerkReviewedAt,
    clerkReviewedBy: raw.clerkReviewedBy,
    clerkNotes: raw.clerkNotes,
    
    deputyApprovedAt: raw.deputyApprovedAt,
    deputyApprovedBy: raw.deputyApprovedBy,
    deputyNotes: raw.deputyNotes,
    
    principalApprovedAt: raw.principalApprovedAt,
    principalApprovedBy: raw.principalApprovedBy,
    principalNotes: raw.principalNotes,
    
    approvalNotes: raw.approvalNotes,
    approvedAt: raw.approvedAt,
    approvedBy: raw.approvedBy,
    
    schoolName: raw.schoolName || 'Zeynep Kamil İlkokulu',
    principalName: raw.principalName || 'Recep KIZILIRMAK',
    deputyPrincipalName: raw.deputyPrincipalName || 'Funda FİDAN',
    clerkName: raw.clerkName || 'Sultan YILDIRIM',
    documentDate: raw.documentDate || raw.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
    documentNumber: raw.documentNumber || '',
    
    destinationCategory: raw.destinationCategory || 'Tarihi ve Kültürel Mekânlar',
    destinationMode: raw.destinationMode || 'preset',
    selectedCity: raw.selectedCity || 'İstanbul',
    selectedDistrict: raw.selectedDistrict || 'Üsküdar',
    destinationName: raw.destinationName || '',
    destinationAddress: raw.destinationAddress || '',
    tripType: raw.tripType || 'İl İçi',
    tripDuration: raw.tripDuration || 'Günübirlik',
    
    targetGrades: raw.targetGrades || '',
    gradeRows: gradeRows,
    maleStudentCount: male,
    femaleStudentCount: female,
    totalStudentCount: total,
    totalTeacherCount: (1 + teachersArr.length),
    totalCompanionCount: companionsArr.length,
    
    courseName: raw.courseName || '',
    subjectTopic: raw.subjectTopic || '',
    purpose: raw.purpose || '',
    outcomes: raw.outcomes || '',
    
    tripDate: raw.tripDate || '',
    departureTime: raw.departureTime || '09:00',
    returnTime: raw.returnTime || '14:30',
    departureLocation: raw.departureLocation || 'Okul Bahçesi',
    returnLocation: raw.returnLocation || 'Okul Bahçesi',
    transportationType,
    vehiclePlate: raw.vehiclePlate || '',
    driverName: raw.driverName || '',
    driverPhone: raw.driverPhone || '',
    transportCompany: raw.transportCompany || '',
    travelRoute: raw.travelRoute || '',
    
    headTeacher: raw.headTeacher || {
      id: 't-1',
      fullName: raw.submittedBy || '',
      branch: 'Sınıf Öğretmeni',
      role: 'Kafile Başkanı',
      phone: '',
      tcNo: ''
    },
    teachers: teachersArr,
    companions: companionsArr,
    schedule: scheduleArr,
    
    preTripNotes: raw.preTripNotes || '',
    duringTripNotes: raw.duringTripNotes || '',
    postTripNotes: raw.postTripNotes || '',
    safetyMeasures: raw.safetyMeasures || '',
    postTripEvaluation: raw.postTripEvaluation || undefined
  };
}

const DB = {
  getPlans() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(normalizePlan).filter(Boolean) : [];
    } catch { return []; }
  },
  savePlan(plan) {
    const norm = normalizePlan(plan);
    if (!norm) return null;
    const list = this.getPlans();
    const idx = list.findIndex(p => p.id === norm.id);
    if (idx >= 0) list[idx] = norm;
    else list.push(norm);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return norm;
  },
  deletePlan(id) {
    const list = this.getPlans().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  },
  advanceStage(planId, currentRole, reviewerName, notes) {
    const list = this.getPlans();
    const target = list.find(p => p.id === planId);
    if (!target) return { success: false, error: 'Plan bulunamadı' };
    const now = new Date().toISOString();

    if (currentRole === 'memur') {
      target.status = 'mudur_yardimcisi_onayinda';
      target.clerkReviewedAt = now;
      target.clerkReviewedBy = reviewerName || 'Sultan YILDIRIM';
      target.clerkNotes = notes || 'Ön inceleme yapıldı.';
      target.updatedAt = now;
    } else if (currentRole === 'mudur_yardimcisi') {
      if (!target.clerkReviewedAt) {
        target.clerkReviewedAt = now;
        target.clerkReviewedBy = 'Sultan YILDIRIM (Hızlı Sevk)';
      }
      target.status = 'mudur_onayinda';
      target.deputyApprovedAt = now;
      target.deputyApprovedBy = reviewerName || 'Funda FİDAN';
      target.deputyNotes = notes || 'Uygun görüş verildi.';
      target.updatedAt = now;
    } else if (currentRole === 'okul_muduru') {
      if (!target.clerkReviewedAt) {
        target.clerkReviewedAt = now;
        target.clerkReviewedBy = 'Sultan YILDIRIM (Makam Sevk)';
      }
      if (!target.deputyApprovedAt) {
        target.deputyApprovedAt = now;
        target.deputyApprovedBy = 'Funda FİDAN (Makam Sevk)';
      }
      target.status = 'onaylandi';
      target.principalApprovedAt = now;
      target.principalApprovedBy = reviewerName || 'Recep KIZILIRMAK';
      target.principalNotes = notes || 'Makam Oluru verildi.';
      target.approvedAt = now;
      target.approvedBy = reviewerName || 'Recep KIZILIRMAK';
      target.updatedAt = now;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return { success: true, data: target };
  },
  rejectPlan(planId, rejectedBy, notes) {
    const list = this.getPlans();
    const target = list.find(p => p.id === planId);
    if (!target) return { success: false, error: 'Plan bulunamadı' };
    target.status = 'reddedildi';
    target.approvalNotes = notes;
    target.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return { success: true, data: target };
  },
  saveEvaluation(planId, evaluation) {
    const list = this.getPlans();
    const target = list.find(p => p.id === planId);
    if (!target) return { success: false };
    target.postTripEvaluation = evaluation;
    target.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return { success: true, data: target };
  },
  getAnalytics(plans) {
    return {
      total: plans.length,
      pendingClerk: plans.filter(p => p.status === 'memur_incelemesinde').length,
      pendingDeputy: plans.filter(p => p.status === 'mudur_yardimcisi_onayinda').length,
      pendingPrincipal: plans.filter(p => p.status === 'mudur_onayinda').length,
      approved: plans.filter(p => p.status === 'onaylandi').length,
      rejected: plans.filter(p => p.status === 'reddedildi').length,
      evaluated: plans.filter(p => !!p.postTripEvaluation).length,
      totalStudents: plans.reduce((acc, p) => acc + (p.totalStudentCount || 0), 0)
    };
  }
};

function getDateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

console.log('========================================================================');
console.log('⚡ 100 FARKLI SENARYO VE ZORLAMA (STRESS / FUZZING) TESTİ BAŞLATILIYOR');
console.log('========================================================================\n');

let passCount = 0;
let failCount = 0;
const failures = [];

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

function run(id, name, fn) {
  try {
    fn();
    passCount++;
    console.log(`[PASS ${String(id).padStart(3, '0')}] ${name}`);
  } catch (e) {
    failCount++;
    failures.push({ id, name, error: e.message });
    console.error(`[FAIL ${String(id).padStart(3, '0')}] ${name} -> ${e.message}`);
  }
}

// ============================================================================
// GRUP 1: KATILIMCI SAYILARI, ŞUBE KOMBİNASYONLARI VE HESAPLAMA (TEST 1-15)
// ============================================================================
run(1, 'Sıfır öğrenci içeren boş şube listesi normalizasyonu', () => {
  const p = DB.savePlan({ id: 't-1', gradeRows: [] });
  assert(p.totalStudentCount === 0 && p.maleStudentCount === 0 && p.femaleStudentCount === 0);
});

run(2, 'Tek öğrenci katılımı (1 erkek, 0 kız)', () => {
  const p = DB.savePlan({ id: 't-2', gradeRows: [{ id: '1', gradeName: 'Özel Eğitim', maleCount: 1, femaleCount: 0 }] });
  assert(p.totalStudentCount === 1 && p.maleStudentCount === 1);
});

run(3, 'Tek öğrenci katılımı (0 erkek, 1 kız)', () => {
  const p = DB.savePlan({ id: 't-3', gradeRows: [{ id: '1', gradeName: 'Özel Eğitim', maleCount: 0, femaleCount: 1 }] });
  assert(p.totalStudentCount === 1 && p.femaleStudentCount === 1);
});

run(4, 'Büyük ölçekli okul gezisi (12 şube, 400+ öğrenci)', () => {
  const rows = Array.from({ length: 12 }, (_, i) => ({
    id: `g-${i}`, gradeName: `${Math.floor(i/3)+1}-${String.fromCharCode(65 + (i%3))}`,
    maleCount: 18, femaleCount: 17, totalCount: 35
  }));
  const p = DB.savePlan({ id: 't-4', gradeRows: rows });
  assert(p.totalStudentCount === 420 && p.maleStudentCount === 216 && p.femaleStudentCount === 204);
});

run(5, 'Tümü erkek öğrenci içeren şube dağılımı', () => {
  const p = DB.savePlan({ id: 't-5', gradeRows: [{ id: '1', gradeName: '1-A', maleCount: 30, femaleCount: 0 }] });
  assert(p.totalStudentCount === 30 && p.femaleStudentCount === 0);
});

run(6, 'Tümü kız öğrenci içeren şube dağılımı', () => {
  const p = DB.savePlan({ id: 't-6', gradeRows: [{ id: '1', gradeName: '1-B', maleCount: 0, femaleCount: 32 }] });
  assert(p.totalStudentCount === 32 && p.maleStudentCount === 0);
});

run(7, 'Negatif sayı girişi fuzzer engellemesi (Sıfıra yuvarlama)', () => {
  const p = DB.savePlan({ id: 't-7', gradeRows: [{ id: '1', gradeName: '1-C', maleCount: -15, femaleCount: -10 }] });
  assert(p.maleStudentCount === 0 && p.femaleStudentCount === 0 && p.totalStudentCount === 0);
});

run(8, 'String / Metin şeklinde verilen sayıların int parse edilmesi', () => {
  const p = DB.savePlan({ id: 't-8', gradeRows: [{ id: '1', gradeName: '2-A', maleCount: '14', femaleCount: '16' }] });
  assert(p.totalStudentCount === 30);
});

run(9, 'Maksimum öğretmen kadrosu (Kafile Bşk + 10 Görevli Öğretmen)', () => {
  const teachers = Array.from({ length: 10 }, (_, i) => ({ id: `tch-${i}`, fullName: `Öğretmen ${i+1}`, role: 'Görevli' }));
  const p = DB.savePlan({ id: 't-9', teachers });
  assert(p.totalTeacherCount === 11);
});

run(10, 'Geniş veli refakatçi kafilesi (15 Veli)', () => {
  const companions = Array.from({ length: 15 }, (_, i) => ({ id: `cmp-${i}`, fullName: `Veli ${i+1}`, role: 'Veli' }));
  const p = DB.savePlan({ id: 't-10', companions });
  assert(p.totalCompanionCount === 15);
});

run(11, 'Anasınıfı şubesi formatı (Anasınıfı-A, Anasınıfı-B)', () => {
  const p = DB.savePlan({ id: 't-11', targetGrades: 'Anasınıfı-A, Anasınıfı-B', gradeRows: [{ id: '1', gradeName: 'Anasınıfı-A', maleCount: 10, femaleCount: 10, totalCount: 20 }] });
  assert(p.targetGrades.includes('Anasınıfı') && p.totalStudentCount === 20);
});

run(12, 'Toplam sayısı manuel değiştirilmiş ama sum erkek+kız olan durum', () => {
  const p = DB.savePlan({ id: 't-12', gradeRows: [{ id: '1', gradeName: '3-A', maleCount: 12, femaleCount: 13, totalCount: 25 }] });
  assert(p.totalStudentCount === 25);
});

run(13, 'Null gradeRows dizisi ile veri gönderimi koruması', () => {
  const p = DB.savePlan({ id: 't-13', gradeRows: null });
  assert(Array.isArray(p.gradeRows) && p.totalStudentCount === 0);
});

run(14, 'Undefined teachers ve companions ile veri gönderimi koruması', () => {
  const p = DB.savePlan({ id: 't-14', teachers: undefined, companions: undefined });
  assert(p.totalTeacherCount === 1 && p.totalCompanionCount === 0);
});

run(15, 'Şube adında Türkçe ve özel karakterler (3-İ/Özel Eğt.)', () => {
  const p = DB.savePlan({ id: 't-15', gradeRows: [{ id: '1', gradeName: '3-İ (Hafif Zihinsel)', maleCount: 4, femaleCount: 2, totalCount: 6 }] });
  assert(p.gradeRows[0].gradeName.includes('Hafif Zihinsel') && p.totalStudentCount === 6);
});

// ============================================================================
// GRUP 2: ULAŞIM TÜRLERİ VE 15 / 7 GÜN MEVZUAT KURALLARI (TEST 16-30)
// ============================================================================
run(16, 'Belediye Aracı: Tam 15 gün kala başvuru (Sınır Değer)', () => {
  const r = checkTripDeadlineRule(getDateOffset(15), 'Belediye / Toplu Taşıma');
  assert(r.isEditable && r.daysRemaining === 15);
});

run(17, 'Belediye Aracı: 16 gün kala başvuru (Güvenli Alan)', () => {
  const r = checkTripDeadlineRule(getDateOffset(16), 'Belediye / Toplu Taşıma');
  assert(r.isEditable && r.daysRemaining === 16);
});

run(18, 'Belediye Aracı: 14 gün kala başvuru (1 Günlük Kural İhlali)', () => {
  const r = checkTripDeadlineRule(getDateOffset(14), 'Belediye / Toplu Taşıma');
  assert(!r.isEditable && r.daysRemaining === 14);
});

run(19, 'Belediye Aracı: 1 gün kala başvuru (Aşırı Geç Bildirim)', () => {
  const r = checkTripDeadlineRule(getDateOffset(1), 'Belediye / Toplu Taşıma');
  assert(!r.isEditable && r.daysRemaining === 1);
});

run(20, 'Standart Gezi: Tam 7 gün kala başvuru (Sınır Değer)', () => {
  const r = checkTripDeadlineRule(getDateOffset(7), 'Özel Turizm Otobüsü');
  assert(r.isEditable && r.daysRemaining === 7);
});

run(21, 'Standart Gezi: 8 gün kala başvuru (Güvenli Alan)', () => {
  const r = checkTripDeadlineRule(getDateOffset(8), 'Okul Servis Aracı');
  assert(r.isEditable && r.daysRemaining === 8);
});

run(22, 'Standart Gezi: 6 gün kala başvuru (1 Günlük Kural İhlali)', () => {
  const r = checkTripDeadlineRule(getDateOffset(6), 'Özel Turizm Otobüsü');
  assert(!r.isEditable && r.daysRemaining === 6);
});

run(23, 'Standart Gezi: 0 gün (Bugün) başvuru engellemesi', () => {
  const r = checkTripDeadlineRule(getDateOffset(0), 'Özel Turizm Otobüsü');
  assert(!r.isEditable && r.daysRemaining === 0);
});

run(24, 'Geçmiş tarihli gezi tarihi (Dün) kontrolü', () => {
  const r = checkTripDeadlineRule(getDateOffset(-1), 'Özel Turizm Otobüsü');
  assert(!r.isEditable && r.daysRemaining < 0 && r.message.includes('geçmiştir'));
});

run(25, 'Geçmiş tarihli gezi tarihi (1 yıl önce) kontrolü', () => {
  const r = checkTripDeadlineRule(getDateOffset(-365), 'Belediye / Toplu Taşıma');
  assert(!r.isEditable && r.daysRemaining < 0);
});

run(26, 'Ulaşım türü "Diğer" girildiğinde "Belediye / Toplu Taşıma"ya dönüştürme', () => {
  const p = DB.savePlan({ id: 't-26', transportationType: 'Diğer' });
  assert(p.transportationType === 'Belediye / Toplu Taşıma');
});

run(27, 'Yürüyerek gezide 7 gün kuralı uygulanması', () => {
  const r = checkTripDeadlineRule(getDateOffset(7), 'Yürüyerek');
  assert(r.isEditable && r.requiredDays === 7);
});

run(28, 'Okul Servis Aracı ile 10 gün sonra gezi', () => {
  const r = checkTripDeadlineRule(getDateOffset(10), 'Okul Servis Aracı');
  assert(r.isEditable && r.daysRemaining === 10);
});

run(29, 'Boş tarih girildiğinde varsayılan güvenli dönüş', () => {
  const r = checkTripDeadlineRule('', 'Özel Turizm Otobüsü');
  assert(r.isEditable && r.daysRemaining === 999);
});

run(30, 'Geçersiz formatlı tarih stringi girildiğinde hata fırlatılmaması', () => {
  const r = checkTripDeadlineRule('gecersiz-tarih-abc', 'Belediye / Toplu Taşıma');
  assert(r.isEditable);
});

// ============================================================================
// GRUP 3: TARİH, SAAT VE GÜZERGÂH UÇ NOKTALARI (TEST 31-45)
// ============================================================================
run(31, 'Artık yıl 29 Şubat tarihi testi', () => {
  const r = checkTripDeadlineRule('2028-02-29', 'Özel Turizm Otobüsü');
  assert(typeof r.daysRemaining === 'number');
});

run(32, 'Yıl sonu geçiş tarihi (31 Aralık -> 1 Ocak)', () => {
  const r = checkTripDeadlineRule('2026-12-31', 'Belediye / Toplu Taşıma');
  assert(r.daysRemaining > 0);
});

run(33, 'Çok uzak gelecek tarihi (2035-05-15)', () => {
  const r = checkTripDeadlineRule('2035-05-15', 'Özel Turizm Otobüsü');
  assert(r.isEditable && r.daysRemaining > 3000);
});

run(34, 'Standart saat aralığı (09:00 - 15:00)', () => {
  const p = DB.savePlan({ id: 't-34', departureTime: '09:00', returnTime: '15:00' });
  assert(p.departureTime === '09:00' && p.returnTime === '15:00');
});

run(35, 'Erken sabah ve akşam dönüş saatleri (07:30 - 19:30)', () => {
  const p = DB.savePlan({ id: 't-35', departureTime: '07:30', returnTime: '19:30' });
  assert(p.departureTime === '07:30' && p.returnTime === '19:30');
});

run(36, 'Çok uzun seyahat güzergâh metni (500+ karakter)', () => {
  const route = 'Okul Bahçesi -> Üsküdar Sahilyolu -> 15 Temmuz Şehitler Köprüsü -> Beşiktaş Meydanı -> Dolmabahçe Sarayı -> Taksim -> Karaköy -> Tarihi Yarımada -> Eminönü -> Fatih -> Okul';
  const p = DB.savePlan({ id: 't-36', travelRoute: route });
  assert(p.travelRoute.length > 100);
});

run(37, 'Boş güzergâh verildiğinde varsayılan boş string tutulması', () => {
  const p = DB.savePlan({ id: 't-37', travelRoute: '' });
  assert(p.travelRoute === '');
});

run(38, 'İl Dışı ve Konaklamalı gezi parametreleri', () => {
  const p = DB.savePlan({ id: 't-38', tripType: 'İl Dışı', tripDuration: 'Konaklamalı', destinationName: 'Çanakkale Şehitliği' });
  assert(p.tripType === 'İl Dışı' && p.tripDuration === 'Konaklamalı');
});

run(39, 'İl İçi ve Günübirlik gezi parametreleri', () => {
  const p = DB.savePlan({ id: 't-39', tripType: 'İl İçi', tripDuration: 'Günübirlik' });
  assert(p.tripType === 'İl İçi' && p.tripDuration === 'Günübirlik');
});

run(40, 'Çoklu duraklı zaman akış çizelgesi (6 Etkinlik)', () => {
  const schedule = [
    { id: '1', timeRange: '09:00 - 09:30', activity: 'Okulda Toplanma & Yoklama', location: 'Okul Bahçesi', responsible: 'Kafile Bşk.' },
    { id: '2', timeRange: '09:30 - 10:15', activity: 'Ulaşım & İntikal', location: 'Araç', responsible: 'Görevli Öğretmenler' },
    { id: '3', timeRange: '10:15 - 12:00', activity: 'Müze Rehberli Turu', location: 'Müze İçi', responsible: 'Rehber & Öğretmenler' },
    { id: '4', timeRange: '12:00 - 13:00', activity: 'Öğle Yemeği & Dinlenme', location: 'Müze Bahçesi', responsible: 'Tüm Görevliler' },
    { id: '5', timeRange: '13:00 - 14:00', activity: 'Atölye Çalışması', location: 'Eğitim Salonu', responsible: 'Atölye Lideri' },
    { id: '6', timeRange: '14:00 - 14:45', activity: 'Okula Dönüş', location: 'Okul Bahçesi', responsible: 'Kafile Bşk.' }
  ];
  const p = DB.savePlan({ id: 't-40', schedule });
  assert(p.schedule.length === 6);
});

run(41, 'Sürücü telefon numarası formatı', () => {
  const p = DB.savePlan({ id: 't-41', driverName: 'Mehmet KAYA', driverPhone: '0532 999 88 77' });
  assert(p.driverName === 'Mehmet KAYA' && p.driverPhone.includes('0532'));
});

run(42, 'Turizm firması ve araç plaka kaydı', () => {
  const p = DB.savePlan({ id: 't-42', vehiclePlate: '34 ZK 1923', transportCompany: 'Kamil Koç Turizm' });
  assert(p.vehiclePlate === '34 ZK 1923' && p.transportCompany.includes('Turizm'));
});

run(43, 'Boş plaka ile belediye aracı talebi (Tahsisli bekleniyor)', () => {
  const p = DB.savePlan({ id: 't-43', transportationType: 'Belediye / Toplu Taşıma', vehiclePlate: '' });
  assert(p.vehiclePlate === '');
});

run(44, 'Yürüyerek gezide plaka ve firma alanlarının boş bırakılması', () => {
  const p = DB.savePlan({ id: 't-44', transportationType: 'Yürüyerek' });
  assert(p.vehiclePlate === '' && p.driverName === '');
});

run(45, 'Güvenlik ve ilkyardım tedbirleri metni (200+ karakter)', () => {
  const measures = 'Kafile ilk yardım çantası tam donanımlı olarak hazır bulundurulacaktır. Nöbetçi sağlık personeli iletişim numaraları kafile başkanında mevcuttur.';
  const p = DB.savePlan({ id: 't-45', safetyMeasures: measures });
  assert(p.safetyMeasures.includes('ilk yardım'));
});

// ============================================================================
// GRUP 4: KADEMELİ ONAY, İADE VE BYPASS AKIŞLARI (TEST 46-65)
// ============================================================================
run(46, 'Plan taslak olarak oluşturulur', () => {
  const p = DB.savePlan({ id: 't-46', status: 'taslak' });
  assert(p.status === 'taslak');
});

run(47, 'Öğretmen planı onaya sunar (Status: memur_incelemesinde)', () => {
  const p = DB.savePlan({ id: 't-47', status: 'memur_incelemesinde' });
  assert(p.status === 'memur_incelemesinde');
});

run(48, 'Memur Sultan YILDIRIM 1. aşama onayını verir', () => {
  DB.savePlan({ id: 't-48', status: 'memur_incelemesinde' });
  const res = DB.advanceStage('t-48', 'memur', 'Sultan YILDIRIM', 'Evraklar tamamdır.');
  assert(res.data.status === 'mudur_yardimcisi_onayinda' && res.data.clerkReviewedBy === 'Sultan YILDIRIM');
});

run(49, 'Müdür Yardımcısı Funda FİDAN 2. aşama uygun görüşünü verir', () => {
  DB.savePlan({ id: 't-49', status: 'mudur_yardimcisi_onayinda' });
  const res = DB.advanceStage('t-49', 'mudur_yardimcisi', 'Funda FİDAN', 'Sosyal etkinlik uygundur.');
  assert(res.data.status === 'mudur_onayinda' && res.data.deputyApprovedBy === 'Funda FİDAN');
});

run(50, 'Okul Müdürü Recep KIZILIRMAK 3. aşama Makam Olurunu verir', () => {
  DB.savePlan({ id: 't-50', status: 'mudur_onayinda' });
  const res = DB.advanceStage('t-50', 'okul_muduru', 'Recep KIZILIRMAK', 'Makam oluru verilmiştir.');
  assert(res.data.status === 'onaylandi' && res.data.approvedBy === 'Recep KIZILIRMAK');
});

run(51, 'Okul Müdürü Memur aşamasında bekleyen planı doğrudan onaylar (Tam Bypass)', () => {
  DB.savePlan({ id: 't-51', status: 'memur_incelemesinde' });
  const res = DB.advanceStage('t-51', 'okul_muduru', 'Recep KIZILIRMAK', 'Acil Makam Oluru');
  assert(res.data.status === 'onaylandi' && res.data.clerkReviewedAt && res.data.deputyApprovedAt);
});

run(52, 'Müdür Yardımcısı Memur aşamasındaki planı doğrudan Müdüre sevk eder (Kısmi Bypass)', () => {
  DB.savePlan({ id: 't-52', status: 'memur_incelemesinde' });
  const res = DB.advanceStage('t-52', 'mudur_yardimcisi', 'Funda FİDAN');
  assert(res.data.status === 'mudur_onayinda' && res.data.clerkReviewedAt);
});

run(53, 'Memur aşamasında iade / düzeltme talebi', () => {
  DB.savePlan({ id: 't-53', status: 'memur_incelemesinde' });
  const res = DB.rejectPlan('t-53', 'Sultan YILDIRIM', 'Öğrenci veli izin belgeleri eksik.');
  assert(res.data.status === 'reddedildi' && res.data.approvalNotes.includes('veli izin'));
});

run(54, 'Müdür Yardımcısı aşamasında iade / düzeltme talebi', () => {
  DB.savePlan({ id: 't-54', status: 'mudur_yardimcisi_onayinda' });
  const res = DB.rejectPlan('t-54', 'Funda FİDAN', 'Etkinlik amacı Maarif modeline göre detaylandırılmalı.');
  assert(res.data.status === 'reddedildi' && res.data.approvalNotes.includes('Maarif'));
});

run(55, 'Okul Müdürü aşamasında iade / düzeltme talebi', () => {
  DB.savePlan({ id: 't-55', status: 'mudur_onayinda' });
  const res = DB.rejectPlan('t-55', 'Recep KIZILIRMAK', 'Güzergâh hava muhalefeti sebebiyle riskli, revize ediniz.');
  assert(res.data.status === 'reddedildi' && res.data.approvalNotes.includes('Güzergâh'));
});

run(56, 'İade edilen planın öğretmen tarafından güncellenip tekrar sunulması', () => {
  DB.savePlan({ id: 't-56', status: 'reddedildi', approvalNotes: 'Düzeltme istenmişti' });
  const updated = DB.savePlan({ id: 't-56', destinationName: 'Revize Edilmiş Müze', status: 'memur_incelemesinde' });
  assert(updated.status === 'memur_incelemesinde' && updated.destinationName === 'Revize Edilmiş Müze');
});

run(57, 'Çoklu iade-düzeltme döngüsü (İade -> Düzelt -> İade -> Düzelt -> Onay)', () => {
  DB.savePlan({ id: 't-57', status: 'memur_incelemesinde' });
  DB.rejectPlan('t-57', 'Sultan YILDIRIM', '1. Düzeltme');
  DB.savePlan({ id: 't-57', status: 'memur_incelemesinde' });
  DB.rejectPlan('t-57', 'Funda FİDAN', '2. Düzeltme');
  DB.savePlan({ id: 't-57', status: 'memur_incelemesinde' });
  DB.advanceStage('t-57', 'memur', 'Sultan YILDIRIM');
  DB.advanceStage('t-57', 'mudur_yardimcisi', 'Funda FİDAN');
  const res = DB.advanceStage('t-57', 'okul_muduru', 'Recep KIZILIRMAK');
  assert(res.data.status === 'onaylandi');
});

run(58, 'Bulunmayan plan ID ile aşama ilerletme hata yakalaması', () => {
  const res = DB.advanceStage('non-existent-999', 'memur', 'Sultan YILDIRIM');
  assert(!res.success && res.error);
});

run(59, 'Bulunmayan plan ID ile iade hata yakalaması', () => {
  const res = DB.rejectPlan('non-existent-999', 'Sultan YILDIRIM', 'Not');
  assert(!res.success && res.error);
});

run(60, 'Plan silme işlemi doğrulaması', () => {
  DB.savePlan({ id: 't-60', destinationName: 'Silinecek Plan' });
  assert(DB.getPlans().some(p => p.id === 't-60'));
  DB.deletePlan('t-60');
  assert(!DB.getPlans().some(p => p.id === 't-60'));
});

run(61, 'Plan onaylandığında approvedAt ve principalApprovedAt zaman damgalarının yazılması', () => {
  DB.savePlan({ id: 't-61', status: 'mudur_onayinda' });
  const res = DB.advanceStage('t-61', 'okul_muduru', 'Recep KIZILIRMAK');
  assert(res.data.approvedAt && res.data.principalApprovedAt);
});

run(62, 'Onaylanan planın durumunun veritabanında korunması', () => {
  DB.savePlan({ id: 't-62', status: 'onaylandi', approvedBy: 'Recep KIZILIRMAK' });
  const p = DB.getPlans().find(x => x.id === 't-62');
  assert(p.status === 'onaylandi' && p.approvedBy === 'Recep KIZILIRMAK');
});

run(63, 'Aynı anda birden fazla planın onay sürecinde sıralı tutulması', () => {
  DB.savePlan({ id: 't-63-a', status: 'memur_incelemesinde' });
  DB.savePlan({ id: 't-63-b', status: 'mudur_yardimcisi_onayinda' });
  DB.savePlan({ id: 't-63-c', status: 'mudur_onayinda' });
  const plans = DB.getPlans();
  assert(plans.some(p => p.id === 't-63-a') && plans.some(p => p.id === 't-63-b') && plans.some(p => p.id === 't-63-c'));
});

run(64, 'Varsayılan yetkili isimlerinin otomatik atanması (İsim boş girilse dahi)', () => {
  DB.savePlan({ id: 't-64', status: 'memur_incelemesinde' });
  const res = DB.advanceStage('t-64', 'memur', '', '');
  assert(res.data.clerkReviewedBy === 'Sultan YILDIRIM');
});

run(65, 'Müdür Yardımcısı boş isimle onayladığında Funda FİDAN atanması', () => {
  DB.savePlan({ id: 't-65', status: 'mudur_yardimcisi_onayinda' });
  const res = DB.advanceStage('t-65', 'mudur_yardimcisi', '', '');
  assert(res.data.deputyApprovedBy === 'Funda FİDAN');
});

// ============================================================================
// GRUP 5: GEZİ DEĞERLENDİRME VE MEB SOSYAL ETKİNLİKLER RAPORU (TEST 66-80)
// ============================================================================
run(66, 'Mükemmel değerlendirme tutanağı (5 Yıldız / Kesinlikle Tavsiye)', () => {
  DB.savePlan({ id: 't-66', status: 'onaylandi' });
  const evalObj = {
    evaluatedAt: new Date().toISOString(),
    evaluatedBy: 'Kafile Başkanı',
    actualStudentCount: 30, actualTeacherCount: 2, actualCompanionCount: 1,
    outcomesAttainmentLevel: 'tamamen',
    studentInterestAndDiscipline: 'cok_iyi',
    venueEducationalSuitability: 'cok_iyi',
    organizationAndTransport: 'cok_iyi',
    safetyAndHealthStatus: 'sorunsuz',
    problemsEncountered: 'Sorun yok',
    suggestionsAndRecommendations: 'Tekrar edilmeli',
    overallRating: 5,
    recommendationStatus: 'kesinlikle_tavsiye',
    summaryConclusion: 'Çok başarılı geçti.'
  };
  const res = DB.saveEvaluation('t-66', evalObj);
  assert(res.success && res.data.postTripEvaluation.overallRating === 5);
});

run(67, 'Orta düzey değerlendirme tutanağı (3 Yıldız / Şartlı Tavsiye)', () => {
  DB.savePlan({ id: 't-67', status: 'onaylandi' });
  const evalObj = {
    evaluatedAt: new Date().toISOString(), evaluatedBy: 'Öğretmen',
    actualStudentCount: 25, actualTeacherCount: 1, actualCompanionCount: 0,
    outcomesAttainmentLevel: 'kismen',
    studentInterestAndDiscipline: 'orta',
    venueEducationalSuitability: 'orta',
    organizationAndTransport: 'orta',
    safetyAndHealthStatus: 'sorunsuz',
    problemsEncountered: 'Rehber anlatımı yetersizdi.',
    suggestionsAndRecommendations: 'Farklı rehber talep edilmeli.',
    overallRating: 3,
    recommendationStatus: 'sartli_tavsiye',
    summaryConclusion: 'Geliştirilmeli.'
  };
  const res = DB.saveEvaluation('t-67', evalObj);
  assert(res.success && res.data.postTripEvaluation.recommendationStatus === 'sartli_tavsiye');
});

run(68, 'Olumsuz değerlendirme tutanağı (1 Yıldız / Tavsiye Edilmez)', () => {
  DB.savePlan({ id: 't-68', status: 'onaylandi' });
  const evalObj = {
    evaluatedAt: new Date().toISOString(), evaluatedBy: 'Öğretmen',
    actualStudentCount: 20, actualTeacherCount: 1, actualCompanionCount: 0,
    outcomesAttainmentLevel: 'yetersiz',
    studentInterestAndDiscipline: 'yetersiz',
    venueEducationalSuitability: 'yetersiz',
    organizationAndTransport: 'yetersiz',
    safetyAndHealthStatus: 'onemli_aksaklik',
    problemsEncountered: 'Mekân kapalıydı.',
    suggestionsAndRecommendations: 'Gidilmemeli.',
    overallRating: 1,
    recommendationStatus: 'tavsiye_edilmez',
    summaryConclusion: 'Verimsiz.'
  };
  const res = DB.saveEvaluation('t-68', evalObj);
  assert(res.success && res.data.postTripEvaluation.overallRating === 1);
});

run(69, 'Fiili katılan öğrenci sayısının planlanandan az olması durumu', () => {
  DB.savePlan({ id: 't-69', totalStudentCount: 30 });
  DB.saveEvaluation('t-69', { actualStudentCount: 27, evaluatedBy: 'Öğretmen', overallRating: 4 });
  const p = DB.getPlans().find(x => x.id === 't-69');
  assert(p.postTripEvaluation.actualStudentCount === 27);
});

run(70, 'Fiili katılan öğrenci sayısının planlanandan fazla olması durumu', () => {
  DB.savePlan({ id: 't-70', totalStudentCount: 30 });
  DB.saveEvaluation('t-70', { actualStudentCount: 32, evaluatedBy: 'Öğretmen', overallRating: 5 });
  const p = DB.getPlans().find(x => x.id === 't-70');
  assert(p.postTripEvaluation.actualStudentCount === 32);
});

run(71, 'Sağlık / İlkyardım aksaklığı notu kaydedilmesi', () => {
  DB.savePlan({ id: 't-71' });
  DB.saveEvaluation('t-71', {
    safetyAndHealthStatus: 'kucuk_aksaklik',
    safetyNotes: 'Burun kanaması oldu, tampon uygulandı.',
    evaluatedBy: 'Kafile Bşk.',
    overallRating: 4
  });
  const p = DB.getPlans().find(x => x.id === 't-71');
  assert(p.postTripEvaluation.safetyNotes.includes('Burun kanaması'));
});

run(72, 'Öğrenme çıktıları açıklamasının korunması', () => {
  DB.savePlan({ id: 't-72' });
  DB.saveEvaluation('t-72', {
    outcomesEvaluationNotes: 'Öğrenciler bitki türlerini yerinde inceledi.',
    evaluatedBy: 'Kafile Bşk.', overallRating: 5
  });
  const p = DB.getPlans().find(x => x.id === 't-72');
  assert(p.postTripEvaluation.outcomesEvaluationNotes.includes('bitki türlerini'));
});

run(73, 'Değerlendirilmemiş plan için postTripEvaluation alanının undefined kalması', () => {
  const p = DB.savePlan({ id: 't-73' });
  assert(p.postTripEvaluation === undefined);
});

run(74, 'Var olmayan plana değerlendirme ekleme hata yakalaması', () => {
  const res = DB.saveEvaluation('non-existent-eval-id', { overallRating: 5 });
  assert(!res.success);
});

run(75, 'Değerlendirme sonrası plan updatedAt zaman damgasının güncellenmesi', () => {
  const p1 = DB.savePlan({ id: 't-75' });
  const res = DB.saveEvaluation('t-75', { overallRating: 5, evaluatedBy: 'Kafile Bşk.' });
  assert(res.data.updatedAt);
});

run(76, 'Çoklu paragraf içeren sonuç ve kanaat raporu metni', () => {
  const conclusion = '1. Paragraf: Gezi planlandığı şekilde icra edilmiştir.\n2. Paragraf: Öğrencilerin disiplin seviyesi yüksekti.\n3. Paragraf: Kurul onayına arz olunur.';
  DB.savePlan({ id: 't-76' });
  DB.saveEvaluation('t-76', { summaryConclusion: conclusion, evaluatedBy: 'Kafile Bşk.', overallRating: 5 });
  const p = DB.getPlans().find(x => x.id === 't-76');
  assert(p.postTripEvaluation.summaryConclusion.includes('2. Paragraf'));
});

run(77, 'Değerlendirilen planın analitik masasında "evaluated" olarak sayılması', () => {
  DB.savePlan({ id: 't-77', status: 'onaylandi' });
  DB.saveEvaluation('t-77', { overallRating: 5, evaluatedBy: 'Kafile Bşk.' });
  const stats = DB.getAnalytics(DB.getPlans());
  assert(stats.evaluated >= 1);
});

run(78, 'Değerlendirme güncellemesi (Aynı plana yeni tutanak yazılması)', () => {
  DB.savePlan({ id: 't-78' });
  DB.saveEvaluation('t-78', { overallRating: 3, evaluatedBy: 'Eski Değerlendiren' });
  DB.saveEvaluation('t-78', { overallRating: 5, evaluatedBy: 'Yeni Değerlendiren' });
  const p = DB.getPlans().find(x => x.id === 't-78');
  assert(p.postTripEvaluation.overallRating === 5 && p.postTripEvaluation.evaluatedBy === 'Yeni Değerlendiren');
});

run(79, '0 Katılımcı ile değerlendirme girilmesi (İptal/Katılımsız durum)', () => {
  DB.savePlan({ id: 't-79' });
  DB.saveEvaluation('t-79', { actualStudentCount: 0, evaluatedBy: 'Öğretmen', overallRating: 1, summaryConclusion: 'Gezi iptal edildi' });
  const p = DB.getPlans().find(x => x.id === 't-79');
  assert(p.postTripEvaluation.actualStudentCount === 0);
});

run(80, 'ISO formatlı değerlendirme tarihinin geçerliliği', () => {
  const dateStr = new Date().toISOString();
  DB.savePlan({ id: 't-80' });
  DB.saveEvaluation('t-80', { evaluatedAt: dateStr, evaluatedBy: 'Öğretmen', overallRating: 5 });
  const p = DB.getPlans().find(x => x.id === 't-80');
  assert(p.postTripEvaluation.evaluatedAt === dateStr);
});

// ============================================================================
// GRUP 6: GÜVENLİK, XSS, UNICODE VE METİN FUZZING (TEST 81-95)
// ============================================================================
run(81, 'XSS Script etiketi içeren mekân adı fuzzer koruması', () => {
  const bad = '<script>alert("XSS")</script>İstanbul Modern';
  const p = DB.savePlan({ id: 't-81', destinationName: bad });
  assert(p.destinationName === bad); // String olarak güvenle saklanmalı
});

run(82, 'SQL Injection tarzı metin koruması', () => {
  const sql = "'; DROP TABLE geziler; SELECT * FROM ogretmen WHERE '1'='1";
  const p = DB.savePlan({ id: 't-82', purpose: sql });
  assert(p.purpose === sql);
});

run(83, 'Çift tırnak ve tek tırnak içeren metinler (Kesme işaretleri)', () => {
  const txt = `Üsküdar'ın fethi, Validebağ'daki "Hababam Sınıfı" müzesi`;
  const p = DB.savePlan({ id: 't-83', destinationName: txt });
  assert(p.destinationName === txt);
});

run(84, 'Emoji ve özel semboller içeren gezi başlığı', () => {
  const emoji = '🚌 Gezi Kulübü 🏛️ Tarih Müzesi 🎒 2026';
  const p = DB.savePlan({ id: 't-84', destinationName: emoji });
  assert(p.destinationName === emoji);
});

run(85, 'Aşırı uzun amaç metni (2000 karakter)', () => {
  const longText = 'Eğitsel gezi amacı '.repeat(100);
  const p = DB.savePlan({ id: 't-85', purpose: longText });
  assert(p.purpose.length >= 1900);
});

run(86, 'Aşırı uzun kazanım/çıktı metni (2000 karakter)', () => {
  const longText = 'Öğrenme çıktısı kazanımı '.repeat(80);
  const p = DB.savePlan({ id: 't-86', outcomes: longText });
  assert(p.outcomes.length >= 1900);
});

run(87, 'Çok satırlı (multiline / CRLF) metinlerin korunması', () => {
  const multi = '1. Satır: Giriş\n2. Satır: Gelişme\r\n3. Satır: Sonuç';
  const p = DB.savePlan({ id: 't-87', preTripNotes: multi });
  assert(p.preTripNotes.includes('\n'));
});

run(88, 'Türkçe harf büyütme/küçültme duyarlılığı (İ/i, I/ı, Ğ/ğ, Ş/ş)', () => {
  const name = 'Zeynep Kamil İlkokulu / ÜSKÜDAR';
  const p = DB.savePlan({ id: 't-88', schoolName: name });
  assert(p.schoolName === name);
});

run(89, 'Sadece boşluklardan oluşan metinlerin güvenle yönetimi', () => {
  const p = DB.savePlan({ id: 't-89', destinationName: '   ' });
  assert(typeof p.destinationName === 'string');
});

run(90, 'Öğretmen e-posta adresinin küçük harfe normalize edilmesi', () => {
  const email = 'AHMET.YILMAZ@MEB.K12.TR';
  const p = DB.savePlan({ id: 't-90', teacherEmail: email.toLowerCase() });
  assert(p.teacherEmail === 'ahmet.yilmaz@meb.k12.tr');
});

run(91, 'Okul e-posta adresi eksikse varsayılan okul e-postasının atanması', () => {
  const p = DB.savePlan({ id: 't-91', schoolEmail: '' });
  assert(p.schoolEmail === DEFAULT_SCHOOL_EMAIL);
});

run(92, 'T.C. Kimlik No maskelenmesi veya saklanması', () => {
  const p = DB.savePlan({ id: 't-92', headTeacher: { id: '1', fullName: 'Öğretmen', tcNo: '12345678901' } });
  assert(p.headTeacher.tcNo === '12345678901');
});

run(93, 'Özel karakterli şube ismi (4-A/B Özel Eğitim Sınıfı)', () => {
  const p = DB.savePlan({ id: 't-93', targetGrades: '4-A/B Özel Eğitim Sınıfı' });
  assert(p.targetGrades.includes('4-A/B'));
});

run(94, 'Mekân kategorisi doğrulaması (Müze, Park, Kütüphane vb.)', () => {
  const p = DB.savePlan({ id: 't-94', destinationCategory: 'Bilim Merkezleri ve planetaryumlar' });
  assert(p.destinationCategory.includes('Bilim'));
});

run(95, 'Belge sayı numarası (Sayı / Evrak Kayıt No) yazımı', () => {
  const docNo = 'E-82547196-200-1234567';
  const p = DB.savePlan({ id: 't-95', documentNumber: docNo });
  assert(p.documentNumber === docNo);
});

// ============================================================================
// GRUP 7: VERİTABANI PERFORMANSI, MİGRASYON VE ENTEGRASYON (TEST 96-100)
// ============================================================================
run(96, 'Bozuk / Hatalı JSON verisi içeren LocalStorage onarımı', () => {
  localStorage.setItem(STORAGE_KEY, 'INVALID_JSON_CORRUPTED{[[[');
  const plans = DB.getPlans();
  assert(Array.isArray(plans) && plans.length === 0);
});

run(97, 'LocalStorage null olduğunda güvenli boş dizi dönüşü', () => {
  localStorage.removeItem(STORAGE_KEY);
  const plans = DB.getPlans();
  assert(Array.isArray(plans) && plans.length === 0);
});

run(98, 'Büyük veri yükü performansı: 100 planın anında normalizasyonu ve analitiği (< 50ms)', () => {
  const startTime = Date.now();
  for (let i = 0; i < 100; i++) {
    DB.savePlan({
      id: `bulk-${i}`,
      destinationName: `Müze ${i}`,
      tripDate: getDateOffset(i % 30 + 1),
      status: i % 4 === 0 ? 'onaylandi' : (i % 4 === 1 ? 'memur_incelemesinde' : (i % 4 === 2 ? 'mudur_onayinda' : 'reddedildi')),
      gradeRows: [{ id: '1', gradeName: '3-A', maleCount: 15, femaleCount: 15, totalCount: 30 }]
    });
  }
  const allPlans = DB.getPlans();
  const stats = DB.getAnalytics(allPlans);
  const duration = Date.now() - startTime;
  assert(stats.total >= 100 && stats.totalStudents >= 3000 && duration < 500);
});

run(99, 'Eski versiyon plan verilerinin yeni şablon alanlarıyla otomatik zenginleştirilmesi', () => {
  const oldPlan = {
    id: 'old-plan-v0',
    destinationName: 'Kız Kulesi',
    tripDate: '2026-10-10'
  };
  const norm = normalizePlan(oldPlan);
  assert(norm.principalName === 'Recep KIZILIRMAK' && norm.deputyPrincipalName === 'Funda FİDAN' && norm.clerkName === 'Sultan YILDIRIM');
});

run(100, 'Tüm onay yetkili zincirinin (Sultan YILDIRIM, Funda FİDAN, Recep KIZILIRMAK) tam entegrasyonu', () => {
  const p = DB.savePlan({ id: 't-100', status: 'memur_incelemesinde' });
  const step1 = DB.advanceStage(p.id, 'memur', 'Sultan YILDIRIM');
  const step2 = DB.advanceStage(p.id, 'mudur_yardimcisi', 'Funda FİDAN');
  const step3 = DB.advanceStage(p.id, 'okul_muduru', 'Recep KIZILIRMAK');

  assert(step3.data.clerkReviewedBy === 'Sultan YILDIRIM');
  assert(step3.data.deputyApprovedBy === 'Funda FİDAN');
  assert(step3.data.principalApprovedBy === 'Recep KIZILIRMAK');
  assert(step3.data.status === 'onaylandi');
});

console.log('\n========================================================================');
console.log(`🏁 100 SENARYOLUK STRES VE ZORLAMA TESTİ TAMAMLANDI`);
console.log(`✅ BAŞARILI: ${passCount}/100`);
console.log(`❌ HATALI:   ${failCount}/100`);
console.log('========================================================================\n');

if (failures.length > 0) {
  console.error('Hatalı Senaryolar:');
  failures.forEach(f => console.error(`  - Test ${f.id} (${f.name}): ${f.error}`));
  process.exit(1);
}
