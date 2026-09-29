import type { GeziPlanData, PlanStatus, PostTripEvaluation } from '../types';

const STORAGE_KEY = 'odos_gezi_plani_saved_records_v1';
const GITHUB_CONFIG_KEY = 'odos_gezi_github_sync_config_v1';

export const DEFAULT_SCHOOL_EMAIL = 'zeynepkamililkokulu@gmail.com';

export interface GitHubSyncConfig {
  enabled: boolean;
  token?: string;
  gistId?: string;
  repo?: string;
  owner?: string;
  lastSyncAt?: string;
}

/**
 * MEB ve Belediye Bildirim Süresi / Güncelleme Kuralı Kontrolü:
 * - Belediyeden araç talep edilecek gezilerde: En az 15 gün önceden bildirme zorunluluğu (diffDays >= 15).
 * - Diğer tüm gezilerde (Özel Otobüs, Servis, Yürüyerek): En az 7 gün önceden bildirme zorunluluğu (diffDays >= 7).
 * Öğretmen bu sürelere kadar güncelleme yapabilir.
 */
export function checkTripDeadlineRule(
  tripDateStr: string,
  transportationType?: string
): {
  isEditable: boolean;
  daysRemaining: number;
  requiredDays: number;
  message: string;
} {
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

// Geriye dönük uyumluluk aliası
export const checkFiveDaysRule = (tripDateStr: string, transportationType?: string) => 
  checkTripDeadlineRule(tripDateStr, transportationType);

/**
 * E-posta Gönderim Şablonu Oluşturucu & Mailto Tetikleyici
 */
export function sendPlanNotificationEmails(
  plan: GeziPlanData,
  teacherEmail: string,
  schoolEmail: string = DEFAULT_SCHOOL_EMAIL
): { success: boolean; mailtoUrl: string } {
  const isMunicipality = plan.transportationType === 'Belediye / Toplu Taşıma';
  const deadlineDays = isMunicipality ? 15 : 7;

  const subject = encodeURIComponent(
    `[MEB Gezi İzni Talebi] ${plan.schoolName} - ${plan.destinationName} (${plan.targetGrades})`
  );

  const bodyContent = `Sayın Okul İdaresi ve Değerli Öğretmenimiz,

Okulumuz ${plan.schoolName} bünyesinde düzenlenmesi planlanan okul dışı öğrenme gezi planı ve izin dilekçesi sisteme başarıyla kaydedilmiş ve okul idaresi onay sürecine (Memur Ön İnceleme -> Müdür Yardımcısı Uygun Görüş -> Okul Müdürü Makam Oluru) sunulmuştur.

RESMİ GEZİ RAPORU VE TALEP DETAYLARI:
--------------------------------------------------
• Okul / Kurum: ${plan.schoolName} (${plan.district} / ${plan.city})
• Gidilecek Yer / Mekân: ${plan.destinationName}
• Kategori & Tür: ${plan.destinationCategory} (${plan.tripType} - ${plan.tripDuration})
• İl / İlçe: ${plan.selectedCity} / ${plan.selectedDistrict}
• Gezi Tarihi & Saat: ${plan.tripDate} (${plan.departureTime} - ${plan.returnTime})
• Katılacak Şubeler: ${plan.targetGrades}
• Öğrenci Sayıları: Toplam ${plan.totalStudentCount} Öğrenci (Erkek: ${plan.maleStudentCount}, Kız: ${plan.femaleStudentCount})
• Kafile Başkanı: ${plan.headTeacher?.fullName} (${plan.headTeacher?.branch || 'Öğretmen'}) - Tel: ${plan.headTeacher?.phone}
• Görevli Öğretmen Sayısı: ${1 + (plan.teachers?.length || 0)}
• Refakatçi Veli Sayısı: ${plan.companions?.length || 0}
• Ulaşım Türü: ${plan.transportationType} ${plan.transportationType !== 'Yürüyerek' ? `(Plaka: ${plan.vehiclePlate || 'Belirtilmedi'})` : '(Araçsız Yürüyerek İntikal)'}
• Seyahat Güzergâhı: ${plan.travelRoute || '-'}
• İlgili Ders & Maarif Modeli: ${plan.courseName || '-'} / ${plan.subjectTopic || '-'}

ONAY AŞAMALARI (3 SİSTEMLİ AKIŞ):
1. Aşama: Evrak Kayıt Memuru Ön İncelemesi
2. Aşama: Sosyal Etkinlikler Kurulu Bşk. (Müdür Yrd. Funda FİDAN) Uygun Görüşü
3. Aşama: Okul Müdürü (Recep KIZILIRMAK) Nihai Makam Oluru

⚠️ YASAL BİLDİRİM VE EVRAK TESLİM UYARISI:
${isMunicipality 
  ? `* BELEDİYE ARAÇ TALEBİ: Belediyeden araç talep edilen gezilerde MEB ve Belediye kuralları gereği gezi tarihinden EN AZ ${deadlineDays} GÜN ÖNCE onaylı 2 sayfalık resmi çıktının ıslak imzalı olarak evrak kayıt memuruna teslim edilmesi zorunludur.`
  : `* MEB GEZİ YÖNERGESİ: Gezi tarihinden EN AZ ${deadlineDays} GÜN ÖNCE onaylı 2 sayfalık resmi çıktının ıslak imzalı olarak evrak kayıt memuruna teslim edilmesi zorunludur.`
}

Sistem üzerinden 2 sayfalık A4 resmi gezi planı ve dilekçe PDF raporunu görüntüleyebilir ve indirebilirsiniz.

Bildirim İletişim Bilgileri:
Öğretmen: ${teacherEmail || 'Belirtilmedi'}
Okul İdaresi: ${schoolEmail}

Bilgilerinize arz/rica olunur.
${plan.schoolName} Gezi ve İnceleme Kulübü`;

  const body = encodeURIComponent(bodyContent);
  const toEmails = [schoolEmail, teacherEmail].filter(Boolean).join(',');
  const mailtoUrl = `mailto:${toEmails}?subject=${subject}&body=${body}`;

  try {
    const link = document.createElement('a');
    link.href = mailtoUrl;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (e) {
    console.warn('Mailto açılamadı:', e);
  }

  return { success: true, mailtoUrl };
}

/**
 * Onay Durum Değişikliği E-posta Bildirimi & Resmi Gezi Raporu
 */
export function sendApprovalStatusEmail(
  plan: GeziPlanData,
  stageName: string,
  reviewerName: string,
  isFinalApproval: boolean = false
): void {
  const teacherEmail = plan.teacherEmail || '';
  const schoolEmail = plan.schoolEmail || DEFAULT_SCHOOL_EMAIL;
  const isMunicipality = plan.transportationType === 'Belediye / Toplu Taşıma';
  const deadlineDays = isMunicipality ? 15 : 7;
  
  const subject = encodeURIComponent(
    `[${isFinalApproval ? 'MAKAM OLURU VERİLDİ - ONAYLANDI' : 'ONAY AŞAMASI GÜNCELLENDİ'}] ${plan.destinationName} (${plan.targetGrades})`
  );

  const bodyContent = `Sayın Öğretmenimiz ve Okul İdaremiz,

Okulumuz ${plan.schoolName} bünyesinde düzenlenecek olan "${plan.destinationName}" okul dışı öğrenme gezi planının onay süreci güncellenmiştir.

ONAY VE SÜREÇ BİLGİLERİ:
--------------------------------------------------
• İşlem Yapan Yetkili: ${reviewerName}
• Güncel Aşama: ${stageName}
• Gezi Mekânı: ${plan.destinationName} (${plan.selectedDistrict} / ${plan.selectedCity})
• Gezi Tarihi & Saat: ${plan.tripDate} (${plan.departureTime} - ${plan.returnTime})
• Katılımcı: ${plan.totalStudentCount} Öğrenci (${plan.targetGrades})
• Kafile Başkanı: ${plan.headTeacher?.fullName} (${plan.headTeacher?.phone})
• Ulaşım: ${plan.transportationType} ${plan.transportationType !== 'Yürüyerek' ? `(Plaka: ${plan.vehiclePlate || 'Belirtilmedi'})` : '(Yürüyerek)'}

${isFinalApproval ? `
========================================================================
🎉 TEBRİKLER! GEZİ PLANI RESMİ OLARAK ONAYLANMIŞTIR (MAKAM OLURU VERİLDİ)
========================================================================

⚠️ DİKKAT VE ZORUNLU EVRAK TESLİM UYARISI:
1. Lütfen Gezi Portalı üzerinden "🖨️ Resmi 2 Sayfa Çıktı / PDF İndir" butonuna basarak resmi gezi planı ve dilekçenizi alınız.
2. Belgeleri ıslak imza ile imzalayarak, MEB ve Belediye mevzuatı gereğince (Gezi tarihinden EN AZ ${deadlineDays} GÜN ÖNCE) OKUL İDARESİNE / EVRAK KAYIT MEMURUNA SÜRESİ İÇİNDE TESLİM EDİNİZ.
3. Resmi evrak teslimi ve kaydı tamamlanmadan gezi faaliyeti başlatılamaz.

PDF Raporunu sistem üzerinden indirebilir veya bu e-posta çıktısını arşivleyebilirsiniz.
` : `
Planınız bir sonraki onay aşamasına başarıyla iletilmiştir. Süreci Gezi Portalı üzerinden canlı olarak takip edebilirsiniz.
`}

Bilgilerinize sunulur.
${plan.schoolName} Müdürlüğü`;

  const body = encodeURIComponent(bodyContent);
  const toEmails = [teacherEmail, schoolEmail].filter(Boolean).join(',');
  const mailtoUrl = `mailto:${toEmails}?subject=${subject}&body=${body}`;

  try {
    const link = document.createElement('a');
    link.href = mailtoUrl;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (e) {
    console.warn('Mailto açılamadı:', e);
  }
}

/**
 * İade / Düzeltme Talebi E-posta Bildirimi
 */
export function sendReturnStatusEmail(
  plan: GeziPlanData,
  reviewerName: string,
  returnNote: string
): void {
  const teacherEmail = plan.teacherEmail || '';
  const schoolEmail = plan.schoolEmail || DEFAULT_SCHOOL_EMAIL;

  const subject = encodeURIComponent(
    `[DÜZELTME / İADE TALEBİ] ${plan.destinationName} Gezi Planı Revizyonu`
  );

  const bodyContent = `Sayın Öğretmenimiz,

Okulumuz ${plan.schoolName} bünyesinde hazırlamış olduğunuz "${plan.destinationName}" gezi planınızda okul idaresi tarafından düzeltme / revizyon talep edilmiştir.

İADE VE DÜZELTME GEREKÇESİ:
--------------------------------------------------
• İade Eden Yetkili: ${reviewerName}
• İade / Düzeltme Notu: ${returnNote}
• Gezi Mekânı: ${plan.destinationName}
• Gezi Tarihi: ${plan.tripDate}
• Katılımcı Şubeler: ${plan.targetGrades}

Lütfen Gezi Portalına e-posta adresinizle giriş yaparak planınızı belirtilen hususlar doğrultusunda güncelleyip tekrar onaya gönderiniz.

Bilgilerinize sunulur.
${plan.schoolName} Müdürlüğü`;

  const body = encodeURIComponent(bodyContent);
  const toEmails = [teacherEmail, schoolEmail].filter(Boolean).join(',');
  const mailtoUrl = `mailto:${toEmails}?subject=${subject}&body=${body}`;

  try {
    const link = document.createElement('a');
    link.href = mailtoUrl;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (e) {
    console.warn('Mailto açılamadı:', e);
  }
}

const BACKUP_SNAPSHOT_KEY = 'odos_gezi_plani_backup_snapshots_v1';

/**
 * Veritabanı Şema Normalizasyon & Geriye Dönük Uyumluluk Koruyucusu:
 * Eski sürümlerde kaydedilmiş veya güncellenmiş tüm verileri eksiksiz korur,
 * yeni eklenen alanları güvenli varsayılanlarla doldurur, veri kaybını %100 önler.
 */
export function normalizePlanData(raw: any): GeziPlanData {
  if (!raw || typeof raw !== 'object') {
    return {
      id: 'gezi-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'taslak',
      city: 'İstanbul',
      district: 'Üsküdar',
      schoolName: 'Zeynep Kamil İlkokulu',
      clubName: 'Gezi Tanıtma ve Turizm Kulübü',
      documentDate: new Date().toISOString().split('T')[0],
      documentNumber: '',
      principalName: 'Recep KIZILIRMAK',
      deputyPrincipalName: 'Funda FİDAN',
      destinationCategory: 'Tarihi ve Kültürel Mekânlar',
      destinationMode: 'preset',
      selectedCity: 'İstanbul',
      selectedDistrict: 'Üsküdar',
      destinationName: '',
      destinationAddress: '',
      tripType: 'İl İçi',
      tripDuration: 'Günübirlik',
      targetGrades: '',
      gradeRows: [],
      maleStudentCount: 0,
      femaleStudentCount: 0,
      totalStudentCount: 0,
      totalTeacherCount: 1,
      totalCompanionCount: 0,
      courseName: '',
      subjectTopic: '',
      purpose: '',
      outcomes: '',
      tripDate: '',
      departureTime: '09:00',
      returnTime: '14:30',
      departureLocation: 'Okul Bahçesi',
      returnLocation: 'Okul Bahçesi',
      transportationType: 'Okul Servis Aracı',
      vehiclePlate: '',
      driverName: '',
      driverPhone: '',
      transportCompany: '',
      travelRoute: '',
      headTeacher: { id: 't-1', fullName: '', branch: 'Sınıf Öğretmeni', role: 'Kafile Başkanı', phone: '' },
      teachers: [],
      companions: [],
      schedule: [],
      preTripNotes: '',
      duringTripNotes: '',
      postTripNotes: '',
      safetyMeasures: ''
    };
  }

  const maleCount = Number(raw.maleStudentCount) || 0;
  const femaleCount = Number(raw.femaleStudentCount) || 0;
  const totalCount = Number(raw.totalStudentCount) || (maleCount + femaleCount) || 0;
  const teachersArr = Array.isArray(raw.teachers) ? raw.teachers : [];
  const companionsArr = Array.isArray(raw.companions) ? raw.companions : [];
  const scheduleArr = Array.isArray(raw.schedule) ? raw.schedule : [];
  const gradeRowsArr = Array.isArray(raw.gradeRows) ? raw.gradeRows : [];

  // Ulaşım türü geriye dönük uyumluluk
  let transportationType = raw.transportationType;
  if (transportationType === 'Diğer' || !transportationType) {
    transportationType = 'Özel Turizm Otobüsü';
  }

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
    
    city: raw.city || 'İstanbul',
    district: raw.district || 'Üsküdar',
    schoolName: raw.schoolName || 'Zeynep Kamil İlkokulu',
    clubName: raw.clubName || 'Gezi Tanıtma ve Turizm Kulübü',
    documentDate: raw.documentDate || raw.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
    documentNumber: raw.documentNumber || '',
    principalName: raw.principalName || 'Recep KIZILIRMAK',
    deputyPrincipalName: raw.deputyPrincipalName || 'Funda FİDAN',
    clerkName: raw.clerkName || '',
    
    destinationCategory: raw.destinationCategory || 'Tarihi ve Kültürel Mekânlar',
    destinationMode: raw.destinationMode || 'preset',
    selectedCity: raw.selectedCity || 'İstanbul',
    selectedDistrict: raw.selectedDistrict || 'Üsküdar',
    destinationName: raw.destinationName || '',
    destinationAddress: raw.destinationAddress || '',
    tripType: raw.tripType || 'İl İçi',
    tripDuration: raw.tripDuration || 'Günübirlik',
    
    targetGrades: raw.targetGrades || '',
    gradeRows: gradeRowsArr,
    maleStudentCount: maleCount,
    femaleStudentCount: femaleCount,
    totalStudentCount: totalCount,
    totalTeacherCount: Number(raw.totalTeacherCount) || (1 + teachersArr.length),
    totalCompanionCount: Number(raw.totalCompanionCount) || companionsArr.length,
    
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

/**
 * Veritabanı Yöneticisi (LocalStorage + GitHub Database Sync + Kademeli Onay)
 */
export const DatabaseService = {
  // Kayıtlı planları getir (Tüm veriler korunarak normalize edilir)
  getPlans(): GeziPlanData[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];

      // Her kaydı geriye dönük uyumlu normalize et
      return parsed.map(p => normalizePlanData(p));
    } catch (e) {
      console.error('Planlar getirilirken hata, yedek kontrol ediliyor:', e);
      // Hata anında yedek snapshot kontrolü
      try {
        const backup = localStorage.getItem(BACKUP_SNAPSHOT_KEY);
        if (backup) {
          const parsedBackup = JSON.parse(backup);
          if (Array.isArray(parsedBackup)) {
            return parsedBackup.map(p => normalizePlanData(p));
          }
        }
      } catch (_) {}
      return [];
    }
  },

  // Tek bir plan getir
  getPlanById(id: string): GeziPlanData | null {
    const plans = this.getPlans();
    return plans.find(p => p.id === id) || null;
  },

  // Plan kaydet / güncelle
  // Plan kaydet / güncelle (Eski verileri koruyarak snapshot yedek alır)
  savePlan(plan: GeziPlanData): { success: boolean; data: GeziPlanData; error?: string } {
    try {
      const plans = this.getPlans();
      const now = new Date().toISOString();
      
      // Güvenlik Snapshot Yedeklemesi (Mevcut veriyi koruma altına al)
      try {
        localStorage.setItem(BACKUP_SNAPSHOT_KEY, JSON.stringify(plans));
      } catch (_) {}

      const existingIdx = plans.findIndex(p => p.id === plan.id);
      const planToSave = normalizePlanData({
        ...plan,
        updatedAt: now
      });

      let updatedList: GeziPlanData[];
      if (existingIdx >= 0) {
        updatedList = [...plans];
        updatedList[existingIdx] = planToSave;
      } else {
        updatedList = [planToSave, ...plans];
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

      // Asenkron GitHub Sync tetikle (yapılandırılmışsa)
      this.syncWithGitHub(updatedList).catch(err => console.warn('GitHub Sync uyarısı:', err));

      return { success: true, data: planToSave };
    } catch (e: any) {
      console.error('Kaydetme hatası:', e);
      return { success: false, data: plan, error: e?.message || 'Kaydetme hatası' };
    }
  },

  // Plan sil (Snapshot yedekli)
  deletePlan(id: string): boolean {
    try {
      const plans = this.getPlans();
      try {
        localStorage.setItem(BACKUP_SNAPSHOT_KEY, JSON.stringify(plans));
      } catch (_) {}

      const filtered = plans.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      this.syncWithGitHub(filtered).catch(err => console.warn('GitHub Sync uyarısı:', err));
      return true;
    } catch (e) {
      console.error('Silme hatası:', e);
      return false;
    }
  },

  /**
   * Kademeli Onay Akışı İlerletme:
   * 1. Memur İncelemesi -> Müdür Yardımcısı Onayı (Funda FİDAN)
   * 2. Müdür Yardımcısı Onayı -> Okul Müdürü Onayı (Recep KIZILIRMAK)
   * 3. Okul Müdürü Onayı -> Onaylandı (Makam Oluru Verildi)
   */
  advanceStage(
    planId: string,
    currentRole: 'memur' | 'mudur_yardimcisi' | 'okul_muduru',
    reviewerName: string,
    notes?: string
  ): { success: boolean; data?: GeziPlanData; nextStageName: string } {
    const plans = this.getPlans();
    const idx = plans.findIndex(p => p.id === planId);
    if (idx === -1) return { success: false, nextStageName: '' };

    const target = { ...plans[idx] };
    const now = new Date().toISOString();
    let nextStageName = '';

    if (currentRole === 'memur') {
      target.status = 'mudur_yardimcisi_onayinda';
      target.clerkReviewedAt = now;
      target.clerkReviewedBy = reviewerName || 'Memur / Evrak Kayıt';
      target.clerkNotes = notes || 'Ön inceleme ve evrak kontrolleri yapılmıştır.';
      target.updatedAt = now;
      nextStageName = 'Müdür Yardımcısı (Funda FİDAN) Onayı';
    } else if (currentRole === 'mudur_yardimcisi') {
      // Eğer memur henüz incelememişse dahi üst makam doğrudan ilerletebilir
      if (!target.clerkReviewedAt) {
        target.clerkReviewedAt = now;
        target.clerkReviewedBy = 'Müdür Yrd. Tarafından Doğrudan İşleme Alındı';
        target.clerkNotes = 'Müdür Yardımcısı tarafından ön inceleme beklemeden doğrudan işleme alınmıştır.';
      }
      target.status = 'mudur_onayinda';
      target.deputyApprovedAt = now;
      target.deputyApprovedBy = reviewerName || 'Funda FİDAN (Müdür Yrd.)';
      target.deputyNotes = notes || 'Sosyal Etkinlikler Kurulu incelemesi tamamlanmış ve uygun görülmüştür.';
      target.updatedAt = now;
      nextStageName = 'Okul Müdürü (Recep KIZILIRMAK) Makam Oluru';
    } else if (currentRole === 'okul_muduru') {
      // Eğer memur veya müdür yardımcısı henüz onaylamamışsa dahi Makam Oluru doğrudan verilebilir
      if (!target.clerkReviewedAt) {
        target.clerkReviewedAt = now;
        target.clerkReviewedBy = 'Makam Oluru ile Doğrudan Onaylandı';
        target.clerkNotes = 'Okul Müdürü tarafından doğrudan onaylanmıştır.';
      }
      if (!target.deputyApprovedAt) {
        target.deputyApprovedAt = now;
        target.deputyApprovedBy = 'Makam Oluru ile Doğrudan Onaylandı';
        target.deputyNotes = 'Okul Müdürü Makam Oluru ile doğrudan uygun görülmüştür.';
      }
      target.status = 'onaylandi';
      target.principalApprovedAt = now;
      target.principalApprovedBy = reviewerName || 'Recep KIZILIRMAK (Okul Müdürü)';
      target.principalNotes = notes || 'Makam oluru verilmiş, gezi uygun görülmüştür.';
      target.approvedAt = now;
      target.approvedBy = reviewerName || 'Recep KIZILIRMAK (Okul Müdürü)';
      target.approvalNotes = 'Okul Müdürü tarafından onaylanmıştır.';
      target.updatedAt = now;
      nextStageName = 'Kesin Onaylandı / Makam Oluru Verildi';
    }

    plans[idx] = target;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    this.syncWithGitHub(plans).catch(err => console.warn('GitHub Sync uyarısı:', err));

    return { success: true, data: target, nextStageName };
  },

  // Planı Reddet / Düzeltme İste
  rejectPlan(
    planId: string,
    rejectedBy: string,
    notes: string
  ): { success: boolean; data?: GeziPlanData } {
    const plans = this.getPlans();
    const idx = plans.findIndex(p => p.id === planId);
    if (idx === -1) return { success: false };

    const target = {
      ...plans[idx],
      status: 'reddedildi' as PlanStatus,
      approvalNotes: `${rejectedBy}: ${notes}`,
      updatedAt: new Date().toISOString()
    };

    plans[idx] = target;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    this.syncWithGitHub(plans).catch(err => console.warn('GitHub Sync uyarısı:', err));

    return { success: true, data: target };
  },

  // Gezi Sonrası Değerlendirme Raporunu Kaydet / Güncelle (MEB Sosyal Etkinlikler Yönetmeliği)
  savePostTripEvaluation(
    planId: string,
    evaluation: PostTripEvaluation
  ): { success: boolean; data?: GeziPlanData; error?: string } {
    const plans = this.getPlans();
    const idx = plans.findIndex(p => p.id === planId);
    if (idx === -1) return { success: false, error: 'Plan bulunamadı' };

    const target = { ...plans[idx] };
    target.postTripEvaluation = evaluation;
    target.updatedAt = new Date().toISOString();

    plans[idx] = target;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    this.syncWithGitHub(plans).catch(err => console.warn('GitHub Sync uyarısı:', err));

    return { success: true, data: target };
  },

  // GitHub Sync Yapılandırmasını getir
  getGitHubConfig(): GitHubSyncConfig {
    try {
      const config = localStorage.getItem(GITHUB_CONFIG_KEY);
      if (!config) return { enabled: false };
      return JSON.parse(config);
    } catch {
      return { enabled: false };
    }
  },

  // GitHub Sync Yapılandırmasını kaydet
  saveGitHubConfig(config: GitHubSyncConfig): void {
    localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
  },

  // GitHub Gist / API ile bulut senkronizasyonu
  async syncWithGitHub(plans: GeziPlanData[]): Promise<boolean> {
    const config = this.getGitHubConfig();
    if (!config.enabled || !config.token) {
      return false;
    }

    try {
      const payload = {
        description: 'MEB Okul Dışı Öğrenme Gezi Planları Veritabanı',
        public: false,
        files: {
          'meb_gezi_planlari_db.json': {
            content: JSON.stringify(plans, null, 2)
          }
        }
      };

      if (config.gistId) {
        const res = await fetch(`https://api.github.com/gists/${config.gistId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${config.token}`,
            'Accept': 'application/vnd.github+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          config.lastSyncAt = new Date().toISOString();
          this.saveGitHubConfig(config);
          return true;
        }
      } else {
        const res = await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.token}`,
            'Accept': 'application/vnd.github+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          config.gistId = data.id;
          config.lastSyncAt = new Date().toISOString();
          this.saveGitHubConfig(config);
          return true;
        }
      }
      return false;
    } catch (e) {
      console.warn('GitHub Senkronizasyon hatası:', e);
      return false;
    }
  },

  // GitHub Gist'ten buluttaki verileri çek
  async pullFromGitHub(): Promise<{ success: boolean; count: number; error?: string }> {
    const config = this.getGitHubConfig();
    if (!config.enabled || !config.token || !config.gistId) {
      return { success: false, count: 0, error: 'GitHub yapılandırması eksik' };
    }

    try {
      const res = await fetch(`https://api.github.com/gists/${config.gistId}`, {
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Accept': 'application/vnd.github+json'
        }
      });

      if (!res.ok) {
        return { success: false, count: 0, error: 'GitHub Gist okunamadı' };
      }

      const data = await res.json();
      const fileContent = data.files?.['meb_gezi_planlari_db.json']?.content;
      if (fileContent) {
        const parsed = JSON.parse(fileContent);
        if (Array.isArray(parsed)) {
          const normalized = parsed.map(p => normalizePlanData(p));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
          config.lastSyncAt = new Date().toISOString();
          this.saveGitHubConfig(config);
          return { success: true, count: normalized.length };
        }
      }
      return { success: false, count: 0, error: 'Veri formatı uyuşmuyor' };
    } catch (e: any) {
      return { success: false, count: 0, error: e?.message || 'Bağlantı hatası' };
    }
  },

  // Takip & Raporlama için Kapsamlı İstatistik ve Veri Analizi
  getAnalyticsData(plans: GeziPlanData[]) {
    const totalPlans = plans.length;
    const pendingClerk = plans.filter(p => p.status === 'memur_incelemesinde').length;
    const pendingDeputy = plans.filter(p => p.status === 'mudur_yardimcisi_onayinda').length;
    const pendingPrincipal = plans.filter(p => p.status === 'mudur_onayinda').length;
    const approvedPlans = plans.filter(p => p.status === 'onaylandi').length;
    const rejectedPlans = plans.filter(p => p.status === 'reddedildi').length;

    const totalStudents = plans.reduce((acc, p) => acc + (Number(p.totalStudentCount) || 0), 0);
    const totalMale = plans.reduce((acc, p) => acc + (Number(p.maleStudentCount) || 0), 0);
    const totalFemale = plans.reduce((acc, p) => acc + (Number(p.femaleStudentCount) || 0), 0);
    const totalTeachers = plans.reduce((acc, p) => acc + (Number(p.totalTeacherCount) || (1 + (p.teachers?.length || 0))), 0);
    const totalCompanions = plans.reduce((acc, p) => acc + (Number(p.totalCompanionCount) || (p.companions?.length || 0)), 0);

    // Kategori Dağılımı
    const categoriesMap: Record<string, number> = {};
    plans.forEach(p => {
      const cat = p.destinationCategory || 'Diğer';
      categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
    });

    // İlçe Dağılımı
    const districtsMap: Record<string, number> = {};
    plans.forEach(p => {
      const d = p.selectedDistrict || 'Belirtilmedi';
      districtsMap[d] = (districtsMap[d] || 0) + 1;
    });

    // Ulaşım Türü Dağılımı
    const transportMap: Record<string, number> = {};
    plans.forEach(p => {
      const t = p.transportationType || 'Belirtilmedi';
      transportMap[t] = (transportMap[t] || 0) + 1;
    });

    // Gezi Türü Dağılımı (İl İçi / İl Dışı)
    const tripTypeMap: Record<string, number> = { 'İl İçi': 0, 'İl Dışı': 0 };
    plans.forEach(p => {
      const tt = p.tripType || 'İl İçi';
      tripTypeMap[tt] = (tripTypeMap[tt] || 0) + 1;
    });

    // Yıl Dağılımı
    const yearsMap: Record<string, number> = {};
    plans.forEach(p => {
      const year = p.tripDate ? p.tripDate.split('-')[0] : (p.createdAt ? p.createdAt.split('-')[0] : '2026');
      yearsMap[year] = (yearsMap[year] || 0) + 1;
    });

    // Gezi Sonrası Değerlendirme İstatistikleri
    const evaluatedPlans = plans.filter(p => !!p.postTripEvaluation);
    const evaluatedCount = evaluatedPlans.length;
    const notEvaluatedCount = approvedPlans - evaluatedCount > 0 ? approvedPlans - evaluatedCount : 0;
    const totalRatingSum = evaluatedPlans.reduce((sum, p) => sum + (p.postTripEvaluation?.overallRating || 0), 0);
    const averageRating = evaluatedCount > 0 ? Number((totalRatingSum / evaluatedCount).toFixed(1)) : 0;

    return {
      totalPlans,
      pendingClerk,
      pendingDeputy,
      pendingPrincipal,
      totalPending: pendingClerk + pendingDeputy + pendingPrincipal,
      approvedPlans,
      rejectedPlans,
      totalStudents,
      totalMale,
      totalFemale,
      totalTeachers,
      totalCompanions,
      categoriesMap,
      districtsMap,
      transportMap,
      tripTypeMap,
      yearsMap,
      evaluatedCount,
      notEvaluatedCount,
      averageRating
    };
  },

  // CSV Raporu İndir
  downloadCSVReport(plans: GeziPlanData[], reportTitle?: string) {
    const headers = [
      'ID',
      'Durum',
      'Okul',
      'Gezi Yeri',
      'Kategori',
      'Gezi Türü',
      'Süre',
      'İlçe/İl',
      'Gezi Tarihi',
      'Saat',
      'Şubeler',
      'Erkek Öğrenci',
      'Kız Öğrenci',
      'Toplam Öğrenci',
      'Kafile Başkanı',
      'Kafile Tel',
      'Ulaşım Türü',
      'Araç Plaka',
      'Kayıt Tarihi',
      'Memur İnceleyen',
      'Müdür Yrd Onaylayan',
      'Müdür Onaylayan',
      'Değerlendirme Durumu',
      'Değerlendirme Puanı',
      'Kazanım Ulaşılma Düzeyi',
      'Tavsiye Durumu'
    ];

    const rows = plans.map(p => [
      p.id,
      p.status,
      `"${p.schoolName || ''}"`,
      `"${p.destinationName || ''}"`,
      `"${p.destinationCategory || ''}"`,
      `"${p.tripType || 'İl İçi'}"`,
      `"${p.tripDuration || 'Günübirlik'}"`,
      `"${p.selectedDistrict || ''}/${p.selectedCity || ''}"`,
      p.tripDate || '',
      `"${p.departureTime || ''}-${p.returnTime || ''}"`,
      `"${p.targetGrades || ''}"`,
      p.maleStudentCount || 0,
      p.femaleStudentCount || 0,
      p.totalStudentCount || 0,
      `"${p.headTeacher?.fullName || p.submittedBy || ''}"`,
      `"${p.headTeacher?.phone || ''}"`,
      `"${p.transportationType || ''}"`,
      `"${p.vehiclePlate || ''}"`,
      p.createdAt?.split('T')[0] || '',
      `"${p.clerkReviewedBy || ''}"`,
      `"${p.deputyApprovedBy || ''}"`,
      `"${p.principalApprovedBy || ''}"`,
      p.postTripEvaluation ? '"Değerlendirildi"' : '"Değerlendirilmedi"',
      p.postTripEvaluation ? `${p.postTripEvaluation.overallRating} / 5` : '""',
      p.postTripEvaluation ? `"${p.postTripEvaluation.outcomesAttainmentLevel}"` : '""',
      p.postTripEvaluation ? `"${p.postTripEvaluation.recommendationStatus}"` : '""'
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = (reportTitle || 'MEB_Gezi_Planlari_Raporu').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('download', `${safeTitle}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
