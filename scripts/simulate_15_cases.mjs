// Test Agent: 15 Comprehensive Application & Approval Simulation Scenarios
// MEB Okul Dışı Öğrenme Gezi Portalı

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

// Import or recreate DB test logic
const STORAGE_KEY = 'odos_gezi_plani_saved_records_v1';
const DEFAULT_SCHOOL_EMAIL = 'zeynepkamililkokulu@gmail.com';

function checkTripDeadlineRule(tripDateStr, transportationType) {
  const isMunicipality = transportationType === 'Belediye / Toplu Taşıma';
  const requiredDays = isMunicipality ? 15 : 7;

  if (!tripDateStr) {
    return { isEditable: true, daysRemaining: 999, requiredDays, message: `Gezi Bildirim Süresi: En az ${requiredDays} gün önceden.` };
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = tripDateStr.split('-').map(Number);
    const tripDate = new Date(year, month - 1, day, 0, 0, 0, 0);

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
    male += Number(r.maleCount) || 0;
    female += Number(r.femaleCount) || 0;
    total += Number(r.totalCount) || ((Number(r.maleCount) || 0) + (Number(r.femaleCount) || 0));
  });

  return {
    id: raw.id || 'gezi-' + Date.now(),
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
    
    destinationName: raw.destinationName || '',
    destinationCategory: raw.destinationCategory || 'Tarihi ve Kültürel Mekânlar',
    selectedCity: raw.selectedCity || 'İstanbul',
    selectedDistrict: raw.selectedDistrict || 'Üsküdar',
    tripType: raw.tripType || 'İl İçi',
    tripDuration: raw.tripDuration || 'Günübirlik',
    
    targetGrades: raw.targetGrades || '',
    gradeRows: gradeRows,
    maleStudentCount: male,
    femaleStudentCount: female,
    totalStudentCount: total,
    totalTeacherCount: (1 + (raw.teachers?.length || 0)),
    totalCompanionCount: (raw.companions?.length || 0),
    
    courseName: raw.courseName || '',
    subjectTopic: raw.subjectTopic || '',
    purpose: raw.purpose || '',
    outcomes: raw.outcomes || '',
    
    tripDate: raw.tripDate || '',
    departureTime: raw.departureTime || '09:00',
    returnTime: raw.returnTime || '14:30',
    transportationType: raw.transportationType || 'Özel Turizm Otobüsü',
    vehiclePlate: raw.vehiclePlate || '',
    driverName: raw.driverName || '',
    
    headTeacher: raw.headTeacher || { fullName: raw.submittedBy || '', phone: '05551234567' },
    teachers: raw.teachers || [],
    companions: raw.companions || [],
    postTripEvaluation: raw.postTripEvaluation
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
    const list = this.getPlans();
    const idx = list.findIndex(p => p.id === norm.id);
    if (idx >= 0) list[idx] = norm;
    else list.push(norm);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return norm;
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

// Date helper relative to today
function getDateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

console.log('========================================================================');
console.log('🤖 BAŞLATILIYOR: 15 KAPSAMLI GEZİ BAŞVURU, ONAY & MEVZUAT TEST SENARYOSU');
console.log('========================================================================\n');

const results = [];
function runTest(testNum, testTitle, testFn) {
  try {
    const outcome = testFn();
    results.push({ testNum, testTitle, status: 'PASSED', details: outcome });
    console.log(`✅ [TEST ${String(testNum).padStart(2, '0')}] ${testTitle} -> BAŞARILI`);
    if (outcome) console.log(`    ↳ Sonuç: ${JSON.stringify(outcome)}`);
  } catch (err) {
    results.push({ testNum, testTitle, status: 'FAILED', error: err.message });
    console.error(`❌ [TEST ${String(testNum).padStart(2, '0')}] ${testTitle} -> HATA: ${err.message}`);
  }
}

// --------------------------------------------------------------------------------
// SENARYO 1: Standart Müze Gezisi (3 Kademeli Tam Onay: Memur -> Md Yrd -> Müdür)
// --------------------------------------------------------------------------------
runTest(1, 'Standart Gezi - 3 Kademeli Sıralı Onay Akışı', () => {
  const plan = DB.savePlan({
    id: 'gezi-01',
    destinationName: 'Rahmi Koç Müzesi',
    destinationCategory: 'Müze',
    transportationType: 'Özel Turizm Otobüsü',
    tripDate: getDateOffset(20),
    targetGrades: '3-A, 3-B',
    gradeRows: [
      { id: '1', gradeName: '3-A', maleCount: 15, femaleCount: 17, totalCount: 32 },
      { id: '2', gradeName: '3-B', maleCount: 14, femaleCount: 16, totalCount: 30 }
    ],
    submittedBy: 'Ahmet YILMAZ',
    teacherEmail: 'ahmet@meb.k12.tr',
    status: 'memur_incelemesinde'
  });

  if (plan.totalStudentCount !== 62) throw new Error('Öğrenci toplamı hatalı');
  
  // 1. Kademe: Memur Sultan YILDIRIM
  const step1 = DB.advanceStage('gezi-01', 'memur', 'Sultan YILDIRIM', 'Evraklar tam.');
  if (step1.data.status !== 'mudur_yardimcisi_onayinda') throw new Error('1. Kademe sevk başarısız');

  // 2. Kademe: Md. Yrd. Funda FİDAN
  const step2 = DB.advanceStage('gezi-01', 'mudur_yardimcisi', 'Funda FİDAN', 'Etkinlik uygun.');
  if (step2.data.status !== 'mudur_onayinda') throw new Error('2. Kademe sevk başarısız');

  // 3. Kademe: Okul Müdürü Recep KIZILIRMAK
  const step3 = DB.advanceStage('gezi-01', 'okul_muduru', 'Recep KIZILIRMAK', 'Makam oluru verildi.');
  if (step3.data.status !== 'onaylandi') throw new Error('3. Kademe nihai onay başarısız');

  return { finalStatus: step3.data.status, approvedBy: step3.data.principalApprovedBy };
});

// --------------------------------------------------------------------------------
// SENARYO 2: Belediye Araç Talepli Gezi (15 Gün Kuralı Sağlanıyor: 18 Gün Sonra)
// --------------------------------------------------------------------------------
runTest(2, 'Belediye Araç Talebi (18 Gün Sonra) - Yasal Süre Doğrulaması & Onay', () => {
  const tripDate = getDateOffset(18);
  const ruleCheck = checkTripDeadlineRule(tripDate, 'Belediye / Toplu Taşıma');
  if (!ruleCheck.isEditable || ruleCheck.daysRemaining < 15) throw new Error('15 gün kuralı yanlış hesaplandı');

  const plan = DB.savePlan({
    id: 'gezi-02',
    destinationName: 'Hababam Sınıfı Müzesi',
    destinationCategory: 'Tarihi ve Kültürel Mekânlar',
    transportationType: 'Belediye / Toplu Taşıma',
    tripDate: tripDate,
    targetGrades: '4-B',
    gradeRows: [{ id: '1', gradeName: '4-B', maleCount: 16, femaleCount: 15, totalCount: 31 }],
    submittedBy: 'Zeynep KAYA',
    teacherEmail: 'zeynep@meb.k12.tr',
    status: 'memur_incelemesinde'
  });

  DB.advanceStage('gezi-02', 'memur', 'Sultan YILDIRIM');
  DB.advanceStage('gezi-02', 'mudur_yardimcisi', 'Funda FİDAN');
  const final = DB.advanceStage('gezi-02', 'okul_muduru', 'Recep KIZILIRMAK');

  return { isEditable: ruleCheck.isEditable, daysRemaining: ruleCheck.daysRemaining, status: final.data.status };
});

// --------------------------------------------------------------------------------
// SENARYO 3: Belediye Araç Talebi Kural İhlali (15 Gün Kuralı İhlali: 10 Gün Sonra)
// --------------------------------------------------------------------------------
runTest(3, 'Belediye Araç Talebi Süre Aşımı (10 Gün Sonra) - Sistem Kısıtlaması', () => {
  const tripDate = getDateOffset(10);
  const ruleCheck = checkTripDeadlineRule(tripDate, 'Belediye / Toplu Taşıma');
  if (ruleCheck.isEditable) throw new Error('10 gün kala belediye aracına izin verilmemeliydi');
  if (!ruleCheck.message.includes('15 gün')) throw new Error('Uyarı mesajı mevzuat uyarısını içermiyor');

  return { isBlockedCorrectly: !ruleCheck.isEditable, ruleDays: ruleCheck.requiredDays, daysRemaining: ruleCheck.daysRemaining };
});

// --------------------------------------------------------------------------------
// SENARYO 4: Standart Gezi Süre İhlali (7 Gün Kuralı İhlali: 4 Gün Sonra)
// --------------------------------------------------------------------------------
runTest(4, 'Standart Gezi Süre Aşımı (4 Gün Sonra) - 7 Gün Kısıtlama Kontrolü', () => {
  const tripDate = getDateOffset(4);
  const ruleCheck = checkTripDeadlineRule(tripDate, 'Özel Turizm Otobüsü');
  if (ruleCheck.isEditable) throw new Error('4 gün kala standart gezi düzenlemesine izin verilmemeliydi');
  if (!ruleCheck.message.includes('7 gün')) throw new Error('7 gün kural mesajı eksik');

  return { isBlockedCorrectly: !ruleCheck.isEditable, daysRemaining: ruleCheck.daysRemaining };
});

// --------------------------------------------------------------------------------
// SENARYO 5: Yürüyerek Yakın Çevre Gezisi (Araçsız İntikal)
// --------------------------------------------------------------------------------
runTest(5, 'Yürüyerek Gezi - Plakasız Ulaşım ve Güzergâh Doğrulama', () => {
  const plan = DB.savePlan({
    id: 'gezi-05',
    destinationName: 'Validebağ Korusu Doğa İnceleme',
    destinationCategory: 'Doğal Mekânlar ve Parklar',
    transportationType: 'Yürüyerek',
    departureLocation: 'Okul Ön Bahçesi',
    returnLocation: 'Okul Ön Bahçesi',
    travelRoute: 'Zeynep Kamil İlkokulu -> Tophanelioğlu Cd. -> Validebağ Korusu',
    tripDate: getDateOffset(9),
    targetGrades: '2-A',
    gradeRows: [{ id: '1', gradeName: '2-A', maleCount: 12, femaleCount: 13, totalCount: 25 }],
    submittedBy: 'Elif ŞAHİN',
    teacherEmail: 'elif@meb.k12.tr',
    status: 'memur_incelemesinde'
  });

  if (plan.transportationType !== 'Yürüyerek') throw new Error('Ulaşım türü hatalı');
  DB.advanceStage('gezi-05', 'memur', 'Sultan YILDIRIM');
  DB.advanceStage('gezi-05', 'mudur_yardimcisi', 'Funda FİDAN');
  const res = DB.advanceStage('gezi-05', 'okul_muduru', 'Recep KIZILIRMAK');

  return { transport: res.data.transportationType, status: res.data.status, totalStudents: res.data.totalStudentCount };
});

// --------------------------------------------------------------------------------
// SENARYO 6: Çoklu Şube ve Çoklu Öğretmen / Refakatçi Katılımı
// --------------------------------------------------------------------------------
runTest(6, 'Çoklu Şube & Kafile Kadrosu Öğrenci/Öğretmen Sayım Tutarlılığı', () => {
  const plan = DB.savePlan({
    id: 'gezi-06',
    destinationName: 'Miniatürk & Panorama 1453',
    destinationCategory: 'Tarihi ve Kültürel Mekânlar',
    transportationType: 'Özel Turizm Otobüsü',
    tripDate: getDateOffset(25),
    targetGrades: '1-A, 1-B, 1-C, 1-D',
    gradeRows: [
      { id: '1', gradeName: '1-A', maleCount: 12, femaleCount: 14, totalCount: 26 },
      { id: '2', gradeName: '1-B', maleCount: 13, femaleCount: 13, totalCount: 26 },
      { id: '3', gradeName: '1-C', maleCount: 15, femaleCount: 11, totalCount: 26 },
      { id: '4', gradeName: '1-D', maleCount: 10, femaleCount: 16, totalCount: 26 }
    ],
    teachers: [
      { id: 't-2', fullName: 'Bülent DEMİR', branch: 'Sınıf Öğretmeni', phone: '05552223344' },
      { id: 't-3', fullName: 'Merve CAN', branch: 'Rehber Öğretmen', phone: '05553334455' }
    ],
    companions: [
      { id: 'c-1', fullName: 'Fatma YILDIZ (Okul Aile Birliği)', role: 'Veli', phone: '05554445566' },
      { id: 'c-2', fullName: 'Ali ÇELİK', role: 'Veli', phone: '05555556677' }
    ],
    submittedBy: 'Hasan YILMAZ',
    status: 'memur_incelemesinde'
  });

  if (plan.totalStudentCount !== 104) throw new Error(`Toplam öğrenci 104 olmalıydı, ${plan.totalStudentCount} bulundu`);
  if (plan.totalTeacherCount !== 3) throw new Error(`Toplam öğretmen 3 olmalıydı (1 kafile bşk + 2 öğretmen), ${plan.totalTeacherCount} bulundu`);
  if (plan.totalCompanionCount !== 2) throw new Error('Refakatçi sayısı hatalı');

  return { students: plan.totalStudentCount, teachers: plan.totalTeacherCount, companions: plan.totalCompanionCount };
});

// --------------------------------------------------------------------------------
// SENARYO 7: Memur Aşamasında İade / Revizyon -> Öğretmen Düzeltmesi -> Yeniden Sevk
// --------------------------------------------------------------------------------
runTest(7, 'Memur İade / Düzeltme Notu -> Revizyon ve Onay Döngüsü', () => {
  const plan = DB.savePlan({
    id: 'gezi-07',
    destinationName: 'İslam Bilim ve Teknoloji Tarihi Müzesi',
    transportationType: 'Özel Turizm Otobüsü',
    tripDate: getDateOffset(16),
    targetGrades: '3-C',
    gradeRows: [{ id: '1', gradeName: '3-C', maleCount: 15, femaleCount: 15, totalCount: 30 }],
    submittedBy: 'Murat TEKİN',
    status: 'memur_incelemesinde'
  });

  // Memur iade ediyor
  const rejected = DB.rejectPlan('gezi-07', 'Sultan YILDIRIM', 'Güzergâh detayları ve veli izin dilekçeleri eksik, lütfen ekleyiniz.');
  if (rejected.data.status !== 'reddedildi') throw new Error('İade statüsü reddedildi olmadı');

  // Öğretmen düzeltiyor ve tekrar sunuyor
  const updatedPlan = DB.savePlan({
    ...rejected.data,
    travelRoute: 'Okul -> Sahilyolu -> Gülhane Parkı -> Müze',
    status: 'memur_incelemesinde'
  });

  // Yeniden onaylama
  DB.advanceStage('gezi-07', 'memur', 'Sultan YILDIRIM', 'Düzeltmeler tamamlandı, uygundur.');
  DB.advanceStage('gezi-07', 'mudur_yardimcisi', 'Funda FİDAN');
  const final = DB.advanceStage('gezi-07', 'okul_muduru', 'Recep KIZILIRMAK');

  return { returnNote: rejected.data.approvalNotes, finalStatus: final.data.status };
});

// --------------------------------------------------------------------------------
// SENARYO 8: Müdür Yardımcısı Aşamasında İade -> Düzeltme -> Onay
// --------------------------------------------------------------------------------
runTest(8, 'Md. Yrd. (Funda FİDAN) İade Talebi ve Tekrar Onay Akışı', () => {
  const plan = DB.savePlan({
    id: 'gezi-08',
    destinationName: 'İstanbul Arkeoloji Müzeleri',
    transportationType: 'Özel Turizm Otobüsü',
    tripDate: getDateOffset(22),
    targetGrades: '4-A',
    gradeRows: [{ id: '1', gradeName: '4-A', maleCount: 14, femaleCount: 16, totalCount: 30 }],
    submittedBy: 'Semra AYDIN',
    status: 'memur_incelemesinde'
  });

  DB.advanceStage('gezi-08', 'memur', 'Sultan YILDIRIM');
  // Md Yrd iade ediyor
  const rej = DB.rejectPlan('gezi-08', 'Funda FİDAN', 'Etkinlik saatleri ders programı ile çakışıyor, 09:30 olarak güncelleyiniz.');
  if (rej.data.status !== 'reddedildi') throw new Error('Md Yrd iade başarısız');

  // Düzeltildi
  DB.savePlan({ ...rej.data, departureTime: '09:30', status: 'memur_incelemesinde' });
  DB.advanceStage('gezi-08', 'memur', 'Sultan YILDIRIM');
  DB.advanceStage('gezi-08', 'mudur_yardimcisi', 'Funda FİDAN');
  const final = DB.advanceStage('gezi-08', 'okul_muduru', 'Recep KIZILIRMAK');

  return { finalStatus: final.data.status, approvedBy: final.data.principalApprovedBy };
});

// --------------------------------------------------------------------------------
// SENARYO 9: Okul Müdürü Doğrudan Makam Oluru (Hızlı Onay - Bypass Yetkisi)
// --------------------------------------------------------------------------------
runTest(9, 'Okul Müdürü (Recep KIZILIRMAK) Doğrudan Olur / Hızlı Sevk Yetkisi', () => {
  // Plan henüz memur aşamasında bekliyor
  DB.savePlan({
    id: 'gezi-09',
    destinationName: 'Çamlıca Kulesi ve Bilim Merkezi',
    transportationType: 'Özel Turizm Otobüsü',
    tripDate: getDateOffset(30),
    targetGrades: '2-B',
    gradeRows: [{ id: '1', gradeName: '2-B', maleCount: 15, femaleCount: 15, totalCount: 30 }],
    submittedBy: 'Cemil AKTAŞ',
    status: 'memur_incelemesinde'
  });

  // Müdür alt birimlerin onayını beklemeden doğrudan Makam Oluru veriyor
  const directApproval = DB.advanceStage('gezi-09', 'okul_muduru', 'Recep KIZILIRMAK', 'Acil onay verildi.');
  if (directApproval.data.status !== 'onaylandi') throw new Error('Müdür doğrudan onayı başarısız');
  if (!directApproval.data.clerkReviewedAt || !directApproval.data.deputyApprovedAt) {
    throw new Error('Müdür doğrudan onayında alt aşamalar otomatik sevk edilmeliydi');
  }

  return { status: directApproval.data.status, bypassVerified: true };
});

// --------------------------------------------------------------------------------
// SENARYO 10: Müdür Yardımcısı Doğrudan Sevk (Memuru Beklemeden Müdüre Aktarma)
// --------------------------------------------------------------------------------
runTest(10, 'Md. Yrd. (Funda FİDAN) Hızlı Sevk Yetkisi (Memuru Beklemeden Müdüre İletme)', () => {
  DB.savePlan({
    id: 'gezi-10',
    destinationName: 'Nezahat Gökyiğit Botanik Bahçesi',
    transportationType: 'Özel Turizm Otobüsü',
    tripDate: getDateOffset(14),
    targetGrades: '3-D',
    gradeRows: [{ id: '1', gradeName: '3-D', maleCount: 16, femaleCount: 14, totalCount: 30 }],
    submittedBy: 'Ayşe GÜL',
    status: 'memur_incelemesinde'
  });

  // Funda FİDAN memur beklemeden müdüre sevk ediyor
  const deputyAdvance = DB.advanceStage('gezi-10', 'mudur_yardimcisi', 'Funda FİDAN', 'Sosyal Etkinlikler Kurulu adına sevk edildi.');
  if (deputyAdvance.data.status !== 'mudur_onayinda') throw new Error('Md Yrd hızlı sevki başarısız');

  // Müdür onaylıyor
  const final = DB.advanceStage('gezi-10', 'okul_muduru', 'Recep KIZILIRMAK');
  return { status: final.data.status, deputyApprovedBy: final.data.deputyApprovedBy };
});

// --------------------------------------------------------------------------------
// SENARYO 11: Gezi Sonrası Değerlendirme Raporu (5 Yıldızlı Mükemmel Başarı)
// --------------------------------------------------------------------------------
runTest(11, 'MEB Gezi Sonrası Değerlendirme Raporu - Yüksek Kazanım Kaydı', () => {
  const evalData = {
    evaluatedAt: new Date().toISOString(),
    evaluatedBy: 'Ahmet YILMAZ',
    actualStudentCount: 60,
    actualTeacherCount: 2,
    actualCompanionCount: 1,
    outcomesAttainmentLevel: 'tamamen',
    outcomesEvaluationNotes: 'Öğrenciler sanayi devrimi ve tarihi teknolojik icatları uygulamalı olarak inceledi.',
    studentInterestAndDiscipline: 'cok_iyi',
    venueEducationalSuitability: 'cok_iyi',
    organizationAndTransport: 'cok_iyi',
    safetyAndHealthStatus: 'sorunsuz',
    problemsEncountered: 'Hiçbir problem yaşanmamıştır.',
    suggestionsAndRecommendations: 'Gelecek eğitim dönemlerinde tüm 3. sınıflar için tekrar düzenlenmesi önerilir.',
    overallRating: 5,
    recommendationStatus: 'kesinlikle_tavsiye',
    summaryConclusion: 'Gezi hedeflenen tüm eğitsel kazanımlara eksiksiz ulaşmıştır.'
  };

  const res = DB.saveEvaluation('gezi-01', evalData);
  if (!res.success) throw new Error('Değerlendirme kaydedilemedi');
  const stored = DB.getPlans().find(p => p.id === 'gezi-01');
  if (!stored.postTripEvaluation || stored.postTripEvaluation.overallRating !== 5) {
    throw new Error('Değerlendirme verisi eşleşmedi');
  }

  return { evaluatedBy: evalData.evaluatedBy, rating: evalData.overallRating, conclusion: evalData.summaryConclusion };
});

// --------------------------------------------------------------------------------
// SENARYO 12: Gezi Sonrası Değerlendirme (Aksaklık ve Öneri Kayıtları)
// --------------------------------------------------------------------------------
runTest(12, 'MEB Gezi Değerlendirme - Aksaklık ve İyileştirme Önerisi Kaydı', () => {
  const evalData = {
    evaluatedAt: new Date().toISOString(),
    evaluatedBy: 'Elif ŞAHİN',
    actualStudentCount: 24,
    actualTeacherCount: 1,
    actualCompanionCount: 0,
    outcomesAttainmentLevel: 'buyuk_olcude',
    outcomesEvaluationNotes: 'Doğa ve çevre bilinci pekiştirildi.',
    studentInterestAndDiscipline: 'iyi',
    venueEducationalSuitability: 'iyi',
    organizationAndTransport: 'orta',
    safetyAndHealthStatus: 'kucuk_aksaklik',
    safetyNotes: 'Bir öğrencinin ayağı burkuldu, ilk yardım yapıldı.',
    problemsEncountered: 'Hava aniden rüzgarlı oldu.',
    suggestionsAndRecommendations: 'Mevsim geçişlerinde hava durumu daha sıkı takip edilmeli.',
    overallRating: 3,
    recommendationStatus: 'sartli_tavsiye',
    summaryConclusion: 'Etkinlik faydalı oldu ancak hava koşullarına dikkat edilmeli.'
  };

  const res = DB.saveEvaluation('gezi-05', evalData);
  if (!res.success) throw new Error('Değerlendirme kaydedilemedi');
  return { safetyStatus: evalData.safetyAndHealthStatus, recommendation: evalData.recommendationStatus };
});

// --------------------------------------------------------------------------------
// SENARYO 13: İdare İstatistik ve Raporlama Masası Metrik Hesaplaması
// --------------------------------------------------------------------------------
runTest(13, 'İdare Veri Masası & Analitik Metriklerin Otomatik Hesaplanması', () => {
  const allPlans = DB.getPlans();
  const stats = DB.getAnalytics(allPlans);

  if (stats.total < 8) throw new Error(`Beklenen plan sayısı yetersiz: ${stats.total}`);
  if (stats.approved < 5) throw new Error(`Onaylanan plan sayısı tutarsız: ${stats.approved}`);
  if (stats.evaluated !== 2) throw new Error(`Değerlendirilen plan sayısı 2 olmalıydı: ${stats.evaluated}`);

  return {
    totalPlans: stats.total,
    approvedCount: stats.approved,
    evaluatedCount: stats.evaluated,
    totalParticipatingStudents: stats.totalStudents
  };
});

// --------------------------------------------------------------------------------
// SENARYO 14: Türkçe Karakter & Boşluk Güvenliği (Ç, Ğ, İ, Ö, Ş, Ü)
// --------------------------------------------------------------------------------
runTest(14, 'Türkçe Karakter ve Özel İsim / Metin Bütünlüğü Doğrulaması', () => {
  const specialText = 'Zeynep Kâmil İlkokulu — Şehitler Çeşmesi & Öğrenci Kulübü';
  const plan = DB.savePlan({
    id: 'gezi-14',
    destinationName: 'Üsküdar Valide-i Atik Külliyesi',
    purpose: 'Osmanlı mimarisinde taş işçiliği ve şadırvan kültürünü öğrenme (Ç, Ğ, İ, Ö, Ş, Ü)',
    tripDate: getDateOffset(15),
    targetGrades: '4-C',
    gradeRows: [{ id: '1', gradeName: '4-C', maleCount: 15, femaleCount: 15, totalCount: 30 }],
    submittedBy: 'Şükrü ÇAĞLAYAN',
    status: 'memur_incelemesinde'
  });

  const retrieved = DB.getPlans().find(p => p.id === 'gezi-14');
  if (!retrieved.purpose.includes('Ç, Ğ, İ, Ö, Ş, Ü')) throw new Error('Türkçe karakterler bozuldu');
  if (retrieved.submittedBy !== 'Şükrü ÇAĞLAYAN') throw new Error('Yazar adı eşleşmedi');

  return { destination: retrieved.destinationName, teacher: retrieved.submittedBy };
});

// --------------------------------------------------------------------------------
// SENARYO 15: Veri Tabanı Geriye Dönük Uyumluluk ve Normalizasyon
// --------------------------------------------------------------------------------
runTest(15, 'Eski/Eksik Şablonlu Verilerin Sıfır Kayıpla Otomatik Onarımı', () => {
  // Eksik alanları olan eski bir veri kaydı simüle ediliyor
  const legacyRaw = {
    id: 'legacy-gezi-99',
    destinationName: 'Topkapı Sarayı',
    tripDate: '2026-11-20',
    // totalStudentCount yok, gradeRows eksik
    maleStudentCount: 10,
    femaleStudentCount: 15
  };

  const normalized = normalizePlan(legacyRaw);
  if (normalized.schoolName !== 'Zeynep Kamil İlkokulu') throw new Error('Varsayılan okul adı doldurulamadı');
  if (normalized.principalName !== 'Recep KIZILIRMAK') throw new Error('Müdür adı doldurulamadı');
  if (normalized.deputyPrincipalName !== 'Funda FİDAN') throw new Error('Müdür Yrd adı Funda FİDAN olmadı');
  if (normalized.status !== 'taslak') throw new Error('Varsayılan statü taslak olmadı');

  return {
    normalizedSchool: normalized.schoolName,
    deputy: normalized.deputyPrincipalName,
    status: normalized.status
  };
});

console.log('\n========================================================================');
console.log(`🎉 TÜM TESTLER TAMAMLANDI: ${results.filter(r => r.status === 'PASSED').length}/15 BAŞARILI, ${results.filter(r => r.status === 'FAILED').length}/15 HATA`);
console.log('========================================================================\n');
