import type { GeziPlanData, PlanStatus } from '../types';

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

    const tripDate = new Date(tripDateStr);
    tripDate.setHours(0, 0, 0, 0);

    const diffTime = tripDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

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
  const subject = encodeURIComponent(
    `[MEB Gezi İzni Talebi] ${plan.schoolName} - ${plan.destinationName} (${plan.targetGrades})`
  );

  const bodyContent = `Sayın İdare ve Görevli Öğretmen,

Okul Dışı Öğrenme / Sosyal Etkinlik Gezi Planı sisteme başarıyla kaydedilmiş ve okul idaresi onay sürecine (Memur Ön İnceleme -> Müdür Yardımcısı -> Okul Müdürü) sunulmuştur.

ÖZET GEZİ VE DİLEKÇE BİLGİLERİ:
--------------------------------------------------
• Okul / Kurum: ${plan.schoolName} (${plan.district} / ${plan.city})
• Gidilecek Yer / Mekân: ${plan.destinationName}
• Kategori & Tür: ${plan.destinationCategory} (${plan.tripType} - ${plan.tripDuration})
• Gezi Tarihi & Saat: ${plan.tripDate} (${plan.departureTime} - ${plan.returnTime})
• Katılacak Şubeler: ${plan.targetGrades}
• Toplam Öğrenci Sayısı: ${plan.totalStudentCount} (Erkek: ${plan.maleStudentCount}, Kız: ${plan.femaleStudentCount})
• Kafile Başkanı: ${plan.headTeacher?.fullName} (${plan.headTeacher?.branch || ''}) - Tel: ${plan.headTeacher?.phone}
• Görevli Öğretmen Sayısı: ${1 + (plan.teachers?.length || 0)}
• Refakatçi Veli Sayısı: ${plan.companions?.length || 0}
• Ulaşım Şekli: ${plan.transportationType} ${plan.transportationType !== 'Yürüyerek' ? `(Plaka: ${plan.vehiclePlate || '-'})` : '(Araçsız Yürüyerek İntikal)'}
• Seyahat Güzergâhı: ${plan.travelRoute || '-'}

ONAY AŞAMALARI:
1. Aşama: Memur Ön İnceleme & Evrak Kayıt
2. Aşama: Sosyal Etkinlikler Kurulu Bşk. (Müdür Yrd. Fudan FİDAN) İnceleme & Paraf
3. Aşama: Okul Müdürü (Recep KIZILIRMAK) Nihai Makam Oluru

İlgili gezi planı ve A4 resmi dilekçe çıktısı sistem üzerinden takip edilebilir.

Bildirim E-postaları:
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
 * Onay Durum Değişikliği E-posta Bildirimi
 */
export function sendApprovalStatusEmail(
  plan: GeziPlanData,
  stageName: string,
  reviewerName: string,
  isFinalApproval: boolean = false
): void {
  const teacherEmail = plan.teacherEmail || '';
  const schoolEmail = plan.schoolEmail || DEFAULT_SCHOOL_EMAIL;
  
  const subject = encodeURIComponent(
    `[${isFinalApproval ? 'MAKAM OLURU VERİLDİ - ONAYLANDI' : 'GEZİ PLANI ONAY AŞAMASI GÜNCELLENDİ'}] ${plan.destinationName} (${plan.targetGrades})`
  );

  const bodyContent = `Sayın Öğretmenimiz,

Okulumuz ${plan.schoolName} bünyesinde düzenleyeceğiniz "${plan.destinationName}" okul dışı öğrenme gezi planınızın onay durumu güncellenmiştir.

GÜNCEL DURUM BİLGİSİ:
--------------------------------------------------
• İşlem Yapan Yetkili: ${reviewerName}
• Onay Aşaması: ${stageName}
• Gezi Mekânı: ${plan.destinationName} (${plan.selectedDistrict} / ${plan.selectedCity})
• Gezi Tarihi: ${plan.tripDate} (${plan.departureTime} - ${plan.returnTime})
• Katılımcı: ${plan.totalStudentCount} Öğrenci (${plan.targetGrades})

${isFinalApproval ? `
TEBRİKLER! Gezi planınız Okul Müdürü Recep KIZILIRMAK tarafından incelenmiş, uygun görülmüş ve MAKAM OLURU VERİLMİŞTİR.
Lütfen sistem üzerinden "Resmi Çıktı / PDF" butonuna basarak 2 sayfalık resmi A4 gezi planı ve dilekçenizi yazdırıp ıslak imza için okul idaresine teslim ediniz.
` : `
Planınız bir sonraki onay aşamasına başarıyla iletilmiştir. Süreci sistem üzerinden takip edebilirsiniz.
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
    `[DÜZELTME / İADE TALEBİ] ${plan.destinationName} Gezi Planı İadesi`
  );

  const bodyContent = `Sayın Öğretmenimiz,

Okulumuz ${plan.schoolName} bünyesinde hazırlamış olduğunuz "${plan.destinationName}" gezi planınızda okul idaresi tarafından düzeltme / revizyon talep edilmiştir.

İADE VE DÜZELTME GEREKÇESİ:
--------------------------------------------------
• İade Eden Yetkili: ${reviewerName}
• İade / Düzeltme Notu: ${returnNote}
• Gezi Mekânı: ${plan.destinationName}
• Gezi Tarihi: ${plan.tripDate}

Lütfen gezi portalına e-posta adresinizle giriş yaparak planınızı belirtilen hususlar doğrultusunda güncelleyip tekrar onaya gönderiniz.

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
 * Veritabanı Yöneticisi (LocalStorage + GitHub Database Sync + Kademeli Onay)
 */
export const DatabaseService = {
  // Kayıtlı planları getir
  getPlans(): GeziPlanData[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Planlar getirilirken hata:', e);
      return [];
    }
  },

  // Tek bir plan getir
  getPlanById(id: string): GeziPlanData | null {
    const plans = this.getPlans();
    return plans.find(p => p.id === id) || null;
  },

  // Plan kaydet / güncelle
  savePlan(plan: GeziPlanData): { success: boolean; data: GeziPlanData; error?: string } {
    try {
      const plans = this.getPlans();
      const now = new Date().toISOString();
      const existingIdx = plans.findIndex(p => p.id === plan.id);

      const planToSave: GeziPlanData = {
        ...plan,
        updatedAt: now
      };

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

  // Plan sil
  deletePlan(id: string): boolean {
    try {
      const plans = this.getPlans();
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
   * 1. Memur İncelemesi -> Müdür Yardımcısı Onayı (Fudan FİDAN)
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
      nextStageName = 'Müdür Yardımcısı (Fudan FİDAN) Onayı';
    } else if (currentRole === 'mudur_yardimcisi') {
      target.status = 'mudur_onayinda';
      target.deputyApprovedAt = now;
      target.deputyApprovedBy = reviewerName || 'Fudan FİDAN (Müdür Yrd.)';
      target.deputyNotes = notes || 'Sosyal Etkinlikler Kurulu incelemesi tamamlanmış ve uygun görülmüştür.';
      target.updatedAt = now;
      nextStageName = 'Okul Müdürü (Recep KIZILIRMAK) Makam Oluru';
    } else if (currentRole === 'okul_muduru') {
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
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          config.lastSyncAt = new Date().toISOString();
          this.saveGitHubConfig(config);
          return { success: true, count: parsed.length };
        }
      }
      return { success: false, count: 0, error: 'Veri formatı uyuşmuyor' };
    } catch (e: any) {
      return { success: false, count: 0, error: e?.message || 'Bağlantı hatası' };
    }
  },

  // Takip & Raporlama için İstatistik ve Veri Analizi
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
    const totalTeachers = plans.reduce((acc, p) => acc + 1 + (p.teachers?.length || 0), 0);
    const totalCompanions = plans.reduce((acc, p) => acc + (p.companions?.length || 0), 0);

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
      districtsMap
    };
  },

  // CSV Raporu İndir
  downloadCSVReport(plans: GeziPlanData[]) {
    const headers = [
      'ID',
      'Durum',
      'Okul',
      'Gezi Yeri',
      'Kategori',
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
      'Oluşturulma Tarihi',
      'Memur İnceleyen',
      'Müdür Yrd Onaylayan',
      'Müdür Onaylayan'
    ];

    const rows = plans.map(p => [
      p.id,
      p.status,
      `"${p.schoolName || ''}"`,
      `"${p.destinationName || ''}"`,
      `"${p.destinationCategory || ''}"`,
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
      `"${p.principalApprovedBy || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MEB_Gezi_Planlari_Raporu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
