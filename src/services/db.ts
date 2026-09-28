import type { GeziPlanData, PlanStatus } from '../types';

const STORAGE_KEY = 'odos_gezi_plani_saved_records_v1';
const GITHUB_CONFIG_KEY = 'odos_gezi_github_sync_config_v1';

export interface GitHubSyncConfig {
  enabled: boolean;
  token?: string;
  gistId?: string;
  repo?: string;
  owner?: string;
  lastSyncAt?: string;
}

/**
 * 5 Gün Kuralı Kontrolü (MEB Gezi Yönergesi)
 * Öğretmen gezi tarihinden 5 gün öncesine kadar güncelleme yapabilir.
 */
export function checkFiveDaysRule(tripDateStr: string): {
  isEditable: boolean;
  daysRemaining: number;
  message?: string;
} {
  if (!tripDateStr) {
    return { isEditable: true, daysRemaining: 999 };
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tripDate = new Date(tripDateStr);
    tripDate.setHours(0, 0, 0, 0);

    const diffTime = tripDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 5) {
      return {
        isEditable: false,
        daysRemaining: diffDays,
        message: diffDays < 0
          ? 'Gezi tarihi geçmiştir. Geçmiş tarihli planlar düzenlenemez, sadece resmi arşiv çıktısı alınabilir.'
          : `Gezi tarihine ${diffDays} gün kalmıştır. MEB Gezi Yönergesi gereği gezi tarihine 5 günden az kaldığından planda değişiklik yapılamaz, sadece resmi çıktı alınabilir.`
      };
    }

    return {
      isEditable: true,
      daysRemaining: diffDays,
      message: `Geziye ${diffDays} gün var (Düzenleme yapılabilir).`
    };
  } catch {
    return { isEditable: true, daysRemaining: 999 };
  }
}

/**
 * Veritabanı Yöneticisi (LocalStorage + GitHub Database Sync)
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

  // Plan onay durumunu güncelle (Okul İdaresi için)
  updateStatus(
    id: string,
    status: PlanStatus,
    adminName: string = 'Recep KIZILIRMAK',
    notes?: string
  ): { success: boolean; data?: GeziPlanData } {
    const plans = this.getPlans();
    const targetIdx = plans.findIndex(p => p.id === id);
    if (targetIdx === -1) return { success: false };

    const updatedPlan: GeziPlanData = {
      ...plans[targetIdx],
      status,
      updatedAt: new Date().toISOString(),
      ...(status === 'onaylandi' ? {
        approvedAt: new Date().toISOString(),
        approvedBy: adminName,
        approvalNotes: notes || 'Okul İdaresi tarafından uygun görülmüş ve onaylanmıştır.'
      } : {}),
      ...(status === 'reddedildi' ? {
        approvalNotes: notes || 'Düzeltme talep edilmiştir.'
      } : {})
    };

    plans[targetIdx] = updatedPlan;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    this.syncWithGitHub(plans).catch(err => console.warn('GitHub Sync uyarısı:', err));

    return { success: true, data: updatedPlan };
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
        // Mevcut Gist güncelle
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
        // Yeni Gist oluştur
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
  }
};
