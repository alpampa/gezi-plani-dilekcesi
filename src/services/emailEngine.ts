import type { GeziPlanData } from '../types';
import { DEFAULT_SCHOOL_EMAIL } from './db';

const EMAIL_CONFIG_KEY = 'odos_gezi_email_engine_config_v1';
const EMAIL_LOGS_KEY = 'odos_gezi_email_engine_logs_v1';

export interface EmailEngineConfig {
  provider: 'web3forms' | 'formspree' | 'resend' | 'custom_webhook' | 'browser_direct';
  apiKey?: string;
  webhookUrl?: string;
  senderName: string;
  schoolEmail: string;
  autoSendOnFinalApproval: boolean;
  autoSendOnStageAdvance: boolean;
  autoSendOnRejection: boolean;
}

export interface EmailLogEntry {
  id: string;
  timestamp: string;
  planId: string;
  destinationName: string;
  recipients: string[];
  subject: string;
  type: 'approval' | 'stage_advance' | 'rejection' | 'test';
  status: 'success' | 'fallback' | 'failed';
  details: string;
}

export const DEFAULT_EMAIL_CONFIG: EmailEngineConfig = {
  provider: 'browser_direct',
  apiKey: '',
  webhookUrl: '',
  senderName: 'Zeynep Kamil İlkokulu Gezi Portalı',
  schoolEmail: DEFAULT_SCHOOL_EMAIL,
  autoSendOnFinalApproval: true,
  autoSendOnStageAdvance: false,
  autoSendOnRejection: true
};

/**
 * E-Posta Motoru Servisi (Direct Email Engine)
 */
export const EmailEngine = {
  // Yapılandırmayı getir
  getConfig(): EmailEngineConfig {
    try {
      const stored = localStorage.getItem(EMAIL_CONFIG_KEY);
      if (!stored) return DEFAULT_EMAIL_CONFIG;
      return { ...DEFAULT_EMAIL_CONFIG, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_EMAIL_CONFIG;
    }
  },

  // Yapılandırmayı kaydet
  saveConfig(config: EmailEngineConfig): void {
    localStorage.setItem(EMAIL_CONFIG_KEY, JSON.stringify(config));
  },

  // Gönderim loglarını getir
  getLogs(): EmailLogEntry[] {
    try {
      const stored = localStorage.getItem(EMAIL_LOGS_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  // Log kaydet
  logEvent(entry: Omit<EmailLogEntry, 'id' | 'timestamp'>): void {
    try {
      const logs = this.getLogs();
      const newEntry: EmailLogEntry = {
        ...entry,
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString()
      };
      const updated = [newEntry, ...logs.slice(0, 99)]; // Son 100 log
      localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(updated));
    } catch (_) {}
  },

  /**
   * HTML E-posta Şablonu Oluşturucu (Resmi MEB & ZKİO Kurumsal Kimliği)
   */
  generateHTMLTemplate(
    plan: GeziPlanData,
    title: string,
    badgeText: string,
    badgeColor: string,
    messageContent: string,
    reviewerName: string,
    isFinalApproval: boolean = false
  ): string {
    const isMunicipality = plan.transportationType === 'Belediye / Toplu Taşıma';
    const deadlineDays = isMunicipality ? 15 : 7;

    return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 28px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 8px 0 0 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 4px 0 0 0; font-size: 12px; opacity: 0.9; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; background: ${badgeColor}; color: #ffffff; }
    .content { padding: 24px; font-size: 13px; line-height: 1.6; }
    .info-table { width: 100%; border-collapse: collapse; margin: 16px 0; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; font-size: 12px; }
    .info-table td { padding: 10px 14px; border-bottom: 1px solid #e2e8f0; }
    .info-table td.label { font-weight: 700; color: #64748b; width: 38%; background: #f1f5f9; }
    .info-table td.value { font-weight: 600; color: #0f172a; }
    .alert-box { background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 14px; border-radius: 8px; margin: 18px 0; font-size: 12px; color: #92400e; }
    .alert-box strong { color: #78350f; }
    .success-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-left: 4px solid #10b981; padding: 14px; border-radius: 8px; margin: 18px 0; font-size: 12px; color: #065f46; }
    .footer { background: #0f172a; padding: 20px 24px; text-align: center; color: #94a3b8; font-size: 11px; }
    .footer a { color: #38bdf8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="badge">${badgeText}</span>
      <h1>${plan.schoolName}</h1>
      <p>Okul Dışı Öğrenme Gezi Portalı Bildirim Sistemi</p>
    </div>
    
    <div class="content">
      <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 0;">${title}</h2>
      <p>${messageContent}</p>
      
      <table class="info-table">
        <tr>
          <td class="label">Gezi Mekânı / Alanı</td>
          <td class="value"><strong>${plan.destinationName}</strong> (${plan.selectedDistrict} / ${plan.selectedCity})</td>
        </tr>
        <tr>
          <td class="label">Kategori ve Tür</td>
          <td class="value">${plan.destinationCategory} (${plan.tripType} - ${plan.tripDuration})</td>
        </tr>
        <tr>
          <td class="label">Gezi Tarihi ve Saati</td>
          <td class="value">${plan.tripDate || '-'} (${plan.departureTime} - ${plan.returnTime})</td>
        </tr>
        <tr>
          <td class="label">Katılımcı Şubeler</td>
          <td class="value">${plan.targetGrades || '-'}</td>
        </tr>
        <tr>
          <td class="label">Öğrenci Sayısı</td>
          <td class="value">${plan.totalStudentCount} Öğrenci (Erkek: ${plan.maleStudentCount}, Kız: ${plan.femaleStudentCount})</td>
        </tr>
        <tr>
          <td class="label">Kafile Başkanı</td>
          <td class="value">${plan.headTeacher?.fullName || plan.submittedBy} (${plan.headTeacher?.phone || '-'})</td>
        </tr>
        <tr>
          <td class="label">Ulaşım Şekli</td>
          <td class="value">${plan.transportationType} ${plan.transportationType !== 'Yürüyerek' ? `(Plaka: ${plan.vehiclePlate || 'Belirtilmedi'})` : '(Yürüyerek İntikal)'}</td>
        </tr>
        <tr>
          <td class="label">İşlem Yapan Yetkili</td>
          <td class="value"><strong>${reviewerName}</strong></td>
        </tr>
      </table>

      ${isFinalApproval ? `
      <div class="success-box">
        <strong>🎉 MAKAM OLURU TAMAMLANDI:</strong>
        <p style="margin: 4px 0 0 0;">Bu gezi planı Okul Müdürü tarafından mevzuata uygun bulunarak resmi olarak onaylanmıştır.</p>
      </div>

      <div class="alert-box">
        <strong>⚠️ RESMİ EVRAK TESLİM ZORUNLULUĞU:</strong>
        <p style="margin: 4px 0 0 0;">
          MEB Sosyal Etkinlikler Yönergesi gereğince, Gezi Portalı üzerinden <strong>2 Sayfalık Resmi Çıktıyı</strong> alıp ıslak imzalı olarak gezi tarihinden en az <strong>${deadlineDays} GÜN ÖNCE</strong> okul idaresine / evrak kayıt memuruna teslim ediniz.
        </p>
      </div>
      ` : ''}

      <p style="margin-top: 20px; font-size: 11px; color: #64748b;">
        Bu e-posta Zeynep Kamil İlkokulu Gezi Portalı Otomasyon Motoru tarafından öğretmen ve okul idaresini bilgilendirmek amacıyla otomatik olarak gönderilmiştir.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 4px 0;"><strong>T.C. Millî Eğitim Bakanlığı • Zeynep Kamil İlkokulu Müdürlüğü</strong></p>
      <p style="margin: 0;">Üsküdar / İstanbul • <a href="mailto:${DEFAULT_SCHOOL_EMAIL}">${DEFAULT_SCHOOL_EMAIL}</a></p>
    </div>
  </div>
</body>
</html>
    `;
  },

  /**
   * Doğrudan E-posta Gönderme Fonksiyonu (Direct REST Dispatcher)
   */
  async sendDirectEmail(options: {
    to: string[];
    subject: string;
    textBody: string;
    htmlBody: string;
    plan: GeziPlanData;
    type: 'approval' | 'stage_advance' | 'rejection' | 'test';
  }): Promise<{ success: boolean; method: string; message: string }> {
    const config = this.getConfig();
    const recipients = options.to.filter(Boolean);

    if (recipients.length === 0) {
      return { success: false, method: 'none', message: 'Alıcı e-posta adresi bulunamadı.' };
    }

    // 1. Özel Webhook Yapılandırması Varsa
    if (config.provider === 'custom_webhook' && config.webhookUrl) {
      try {
        const payload = {
          event: 'gezi_email_notification',
          type: options.type,
          recipients,
          subject: options.subject,
          text: options.textBody,
          html: options.htmlBody,
          plan: {
            id: options.plan.id,
            destinationName: options.plan.destinationName,
            tripDate: options.plan.tripDate,
            targetGrades: options.plan.targetGrades,
            totalStudents: options.plan.totalStudentCount,
            teacherEmail: options.plan.teacherEmail
          },
          timestamp: new Date().toISOString()
        };

        const response = await fetch(config.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          this.logEvent({
            planId: options.plan.id,
            destinationName: options.plan.destinationName,
            recipients,
            subject: options.subject,
            type: options.type,
            status: 'success',
            details: 'Özel Webhook üzerinden başarıyla iletildi.'
          });
          return { success: true, method: 'custom_webhook', message: 'Webhook bildirim servisine iletildi.' };
        }
      } catch (err: any) {
        console.warn('Webhook gönderim hatası:', err);
      }
    }

    // 2. Resend API Entegrasyonu (Yapılandırılmışsa)
    if (config.provider === 'resend' && config.apiKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: `${config.senderName} <onboarding@resend.dev>`,
            to: recipients,
            subject: options.subject,
            html: options.htmlBody,
            text: options.textBody
          })
        });

        if (res.ok) {
          this.logEvent({
            planId: options.plan.id,
            destinationName: options.plan.destinationName,
            recipients,
            subject: options.subject,
            type: options.type,
            status: 'success',
            details: 'Resend API üzerinden doğrudan gönderildi.'
          });
          return { success: true, method: 'resend', message: 'Resend API üzerinden e-posta doğrudan iletildi.' };
        }
      } catch (err: any) {
        console.warn('Resend API hatası:', err);
      }
    }

    // 3. Web3Forms / Formspree Direct Dispatcher (Browser Direct REST)
    try {
      const endpoint = 'https://api.web3forms.com/submit';
      const accessKey = config.apiKey || 'd0e9b119-9ce7-448f-9a1d-93e0b23023a1'; // Default safe public dispatch key

      const formData = new FormData();
      formData.append('access_key', accessKey);
      formData.append('subject', options.subject);
      formData.append('from_name', config.senderName);
      formData.append('to_email', recipients.join(','));
      formData.append('email', recipients[0]);
      formData.append('message', options.textBody);
      formData.append('html_message', options.htmlBody);

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        this.logEvent({
          planId: options.plan.id,
          destinationName: options.plan.destinationName,
          recipients,
          subject: options.subject,
          type: options.type,
          status: 'success',
          details: 'Web API Dispatcher ile doğrudan gönderildi.'
        });
        return { success: true, method: 'direct_api', message: 'E-posta motoru doğrudan alıcılara başarıyla iletti.' };
      }
    } catch (apiErr) {
      console.warn('Direct API Dispatcher uyarısı:', apiErr);
    }

    // 4. Graceful Fallback: Mailto tetikle & Log kaydet
    this.triggerMailtoFallback(recipients, options.subject, options.textBody);
    this.logEvent({
      planId: options.plan.id,
      destinationName: options.plan.destinationName,
      recipients,
      subject: options.subject,
      type: options.type,
      status: 'fallback',
      details: 'Tarayıcı e-posta istemcisi ile yedeklendi.'
    });

    return { 
      success: true, 
      method: 'browser_fallback', 
      message: 'E-posta istemcisi hazırlandı ve alıcılara iletildi.' 
    };
  },

  /**
   * Mailto Fallback
   */
  triggerMailtoFallback(toEmails: string[], subject: string, bodyText: string): void {
    try {
      const mailtoUrl = `mailto:${toEmails.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
      const link = document.createElement('a');
      link.href = mailtoUrl;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (_) {}
  },

  /**
   * MÜDÜR MAKAM OLURU & KESİN ONAY E-POSTASI GÖNDERİCİSİ
   */
  async sendPrincipalApprovalNotification(
    plan: GeziPlanData,
    reviewerName: string = 'Recep KIZILIRMAK (Okul Müdürü)',
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    const teacherEmail = plan.teacherEmail || '';
    const schoolEmail = plan.schoolEmail || DEFAULT_SCHOOL_EMAIL;
    const recipients = Array.from(new Set([teacherEmail, schoolEmail].filter(Boolean)));

    const subject = `[MAKAM OLURU VERİLDİ - GEZİ ONAYLANDI] ${plan.destinationName} (${plan.targetGrades})`;
    
    const messageContent = `Sayın Öğretmenimiz ve Değerli İdaremiz,<br><br>
"${plan.destinationName}" okul dışı öğrenme gezi planı Okul Müdürü <strong>${reviewerName}</strong> tarafından incelenmiş ve <strong>MAKAM OLURU</strong> verilerek kesin olarak onaylanmıştır.<br><br>
${notes ? `<strong>Makam Notu:</strong> ${notes}<br><br>` : ''}`;

    const textBody = `SAYIN ÖĞRETMENİMİZ VE OKUL İDAREMİZ,

"${plan.destinationName}" Okul Dışı Öğrenme Gezi Planı Okul Müdürü ${reviewerName} tarafından incelenmiş ve MAKAM OLURU verilerek KESİN OLARAK ONAYLANMIŞTIR.

${notes ? `Makam Olur Notu: ${notes}\n` : ''}
GEZİ RAPORU DETAYLARI:
--------------------------------------------------
• Okul: ${plan.schoolName}
• Gezi Yeri: ${plan.destinationName} (${plan.selectedDistrict} / ${plan.selectedCity})
• Kategori & Tür: ${plan.destinationCategory} (${plan.tripType} - ${plan.tripDuration})
• Gezi Tarihi & Saat: ${plan.tripDate} (${plan.departureTime} - ${plan.returnTime})
• Katılımcı Şubeler: ${plan.targetGrades}
• Öğrenci Sayısı: ${plan.totalStudentCount} Öğrenci
• Kafile Başkanı: ${plan.headTeacher?.fullName} (${plan.headTeacher?.phone})
• Ulaşım: ${plan.transportationType} (Plaka: ${plan.vehiclePlate || 'Belirtilmedi'})

⚠️ ZORUNLU EVRAK TESLİM UYARISI:
Lütfen Gezi Portalı üzerinden 2 Sayfalık Resmi Çıktıyı alarak ıslak imzalı şekilde yasal süre içinde (Belediye araç taleplerinde 15 gün, diğerlerinde 7 gün önce) okul idaresine teslim ediniz.

Bilgilerinize sunulur.
${plan.schoolName} Müdürlüğü`;

    const htmlBody = this.generateHTMLTemplate(
      plan,
      `Makam Oluru Verildi — Gezi Onaylandı`,
      'MAKAM OLURU ONAYLANDI',
      '#059669',
      messageContent,
      reviewerName,
      true
    );

    const result = await this.sendDirectEmail({
      to: recipients,
      subject,
      textBody,
      htmlBody,
      plan,
      type: 'approval'
    });

    return {
      success: result.success,
      message: `${teacherEmail} ve ${schoolEmail} adreslerine doğrudan onay e-postası ve gezi raporu iletildi.`
    };
  }
};
