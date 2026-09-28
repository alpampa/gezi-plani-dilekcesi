// @ts-ignore
import html2pdf from 'html2pdf.js';
import type { GeziPlanData } from '../types';

/**
 * Gezi Planı ve İzin Dilekçesi 2 Sayfalık Resmi PDF Oluşturma & İndirme Servisi
 */
export async function generateAndDownloadPlanPDF(plan: GeziPlanData): Promise<void> {
  // Yazdırılabilir element seçimi (print-only veya canlı önizleme elementi)
  const element = document.querySelector('.print-only') || document.querySelector('.a4-print-container');
  
  if (!element) {
    // Eğer element bulunamazsa tarayıcının print diyaloğunu aç
    window.print();
    return;
  }

  const sanitizedSchool = (plan.schoolName || 'Okul').replace(/[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ_-]/g, '_');
  const sanitizedDest = (plan.destinationName || 'Gezi_Plani').replace(/[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ_-]/g, '_');
  const filename = `${sanitizedSchool}_${sanitizedDest}_Gezi_Plani_${plan.tripDate || 'Tarihsiz'}.pdf`;

  const opt = {
    margin: [5, 5, 5, 5] as [number, number, number, number],
    filename: filename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      letterRendering: true,
      logging: false
    },
    jsPDF: { 
      unit: 'mm' as const, 
      format: 'a4' as const, 
      orientation: 'portrait' as const 
    },
    pagebreak: { mode: ['css', 'legacy'] }
  };

  try {
    // Geçici olarak görünür yapıp render alıyoruz
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.display = 'block';
    clone.style.position = 'fixed';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = '210mm';
    clone.style.background = '#ffffff';
    clone.classList.remove('print-only');
    document.body.appendChild(clone);

    await html2pdf().set(opt).from(clone).save();

    document.body.removeChild(clone);
  } catch (error) {
    console.error('PDF oluşturma hatası, yazdırma sistemine yönlendiriliyor:', error);
    window.print();
  }
}
