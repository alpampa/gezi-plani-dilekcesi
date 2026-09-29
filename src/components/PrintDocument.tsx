import React from 'react';
import type { GeziPlanData } from '../types';

export type PrintViewType = 'official_plan' | 'ek1_parent_consent' | 'ek2_student_list' | 'all';

interface PrintDocumentProps {
  data: GeziPlanData;
  viewType?: PrintViewType;
}

export const PrintDocument: React.FC<PrintDocumentProps> = ({ data, viewType = 'official_plan' }) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const showOfficialPlan = viewType === 'official_plan' || viewType === 'all';
  const showStudentList = (viewType === 'ek2_student_list' || viewType === 'all') && (data.studentList && data.studentList.length > 0);
  const showParentConsent = viewType === 'ek1_parent_consent' || viewType === 'all';

  // Öğrenci listesi varsa veya boş şablon için en az 10 satır üretelim
  const studentDisplayList = (data.studentList && data.studentList.length > 0)
    ? data.studentList
    : Array.from({ length: Math.min(30, Math.max(10, data.totalStudentCount || 15)) }, (_, i) => ({
        id: `empty-${i}`,
        studentNumber: `${100 + i + 1}`,
        fullName: '....................................................',
        grade: data.targetGrades.split(',')[0] || '....',
        parentName: '....................................................',
        parentPhone: '05.. ... .. ..',
        bloodType: '...',
        consentStatus: 'Alındı' as const
      }));

  return (
    <div className="print-container bg-white text-black font-serif leading-tight">
      
      {/* ========================================================================= */}
      {/* ===================== RESMİ ÇIKTI - SAYFA 1 (DİLEKÇE & TABLO 1-2) ========= */}
      {/* ========================================================================= */}
      {showOfficialPlan && (
        <>
          <div className="print-page-1 border-b-2 print:border-none pb-4 mb-6">
            <div>
              {/* Antet */}
              <div className="text-center font-bold uppercase space-y-0.5 mb-3">
                <p className="text-[11px] tracking-wide">T.C.</p>
                <p className="text-[11px] tracking-wide">{data.district || 'ÜSKÜDAR'} KAYMAKAMLIĞI / İLÇE MİLLÎ EĞİTİM MÜDÜRLÜĞÜ</p>
                <p className="text-[13px] font-extrabold tracking-wider mt-0.5">{data.schoolName || 'ZEYNEP KAMİL İLKOKULU'} MÜDÜRLÜĞÜ</p>
              </div>

              {/* Sayı ve Tarih */}
              <div className="flex justify-between items-center text-[10.5px] font-semibold mb-2 px-1">
                <div>
                  <span>Sayı : </span>
                  <span>{data.documentNumber || '................................'}</span>
                </div>
                <div>
                  <span>Tarih : </span>
                  <span>{formatDate(data.documentDate) || '..../..../202...'}</span>
                </div>
              </div>

              {/* Konu */}
              <div className="text-[10.5px] font-semibold mb-3 px-1">
                <span>Konu : </span>
                <span>Okul Dışı Öğrenme / Sosyal Etkinlik Gezi İzni Talebi ({data.destinationName || 'Eğitsel Gezi'})</span>
              </div>

              {/* Makam Hitabı */}
              <div className="text-center font-extrabold text-[12px] mb-2 uppercase">
                {data.schoolName ? data.schoolName.toLocaleUpperCase('tr-TR') : 'ZEYNEP KAMİL İLKOKULU'} MÜDÜRLÜĞÜNE
              </div>

              {/* Dilekçe Gövdesi */}
              <div className="text-[10px] text-justify leading-relaxed mb-3 indent-5">
                Okulumuz <strong className="underline">{data.targetGrades || '...................'}</strong> şubeleri öğrencilerine yönelik olarak; 
                <strong className="underline"> {data.courseName || '...................'}</strong> dersi öğretim programı ve Türkiye Yüzyılı Maarif Modeli öğrenme çıktıları / kazanımları doğrultusunda, 
                <strong className="underline"> {formatDate(data.tripDate) || '..../..../202...'}</strong> tarihinde 
                <strong className="underline"> {data.departureTime || '....:....'} - {data.returnTime || '....:....'}</strong> saatleri arasında 
                <strong className="underline"> {data.destinationName || '................................'}</strong> ({data.destinationAddress || data.selectedCity}) adresine 
                <strong className="underline"> {data.tripType}</strong> gezi düzenlenmesi planlanmaktadır.
                {data.transportationType === 'Belediye / Toplu Taşıma' && (
                  <span> Gezi için ilgili Belediye Başkanlığı üzerinden araç tahsisi ve ulaşım desteği talebinde bulunulmuştur.</span>
                )}
                <br />
                Söz konusu geziye ait Okul Gezi Planı, Kafile ve Görevli Listesi, Ulaşım Bilgileri ile Zaman Akış Çizelgesi ekte sunulmuştur. 
                Gezinin MEB Eğitim Kurumları Sosyal Etkinlikler Yönetmeliği hükümleri doğrultusunda yapılması hususunu olurlarınıza arz ederim.
              </div>

              {/* Düzenleyen İmza Bloğu (Sayfa 1 Sağ Alt) */}
              <div className="flex justify-end text-[10px] text-right pr-4 mb-3">
                <div>
                  <p className="font-bold">{data.headTeacher?.fullName || '........................................'}</p>
                  <p className="text-[9.5px] text-gray-700">{data.headTeacher?.branch || 'Sınıf / Branş Öğretmeni'}</p>
                  <p className="text-[9px] text-gray-600">Kafile Başkanı / Sorumlu Öğretmen</p>
                  <p className="text-[9.5px] italic mt-2">İmza</p>
                </div>
              </div>

              {/* ===================== RESMİ GEZİ PLANI BAŞLIĞI ===================== */}
              <div className="text-center font-bold text-[11px] uppercase tracking-wide bg-gray-100 py-1 border border-black mb-2">
                MEB OKUL DIŞI ÖĞRENME VE SOSYAL ETKİNLİK GEZİ PLANI
              </div>

              {/* TABLO 1: GENEL VE İDARİ BİLGİLER */}
              <div className="border border-black mb-2 text-[9.5px]">
                <div className="bg-gray-100 font-bold px-2 py-0.5 border-b border-black text-[9.5px] uppercase">
                  1. Gezi ve Katılımcı Dağılım Bilgileri
                </div>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="w-1/4 p-1 font-bold border-r border-black bg-gray-50">Düzenleyen Okul</td>
                      <td className="w-1/4 p-1 border-r border-black">{data.schoolName} ({data.district}/{data.city})</td>
                      <td className="w-1/4 p-1 font-bold border-r border-black bg-gray-50">Kulüp / Alan</td>
                      <td className="w-1/4 p-1">{data.clubName}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-1 font-bold border-r border-black bg-gray-50">Gidilecek Yer / Mekân</td>
                      <td className="p-1 border-r border-black font-semibold">{data.destinationName}</td>
                      <td className="p-1 font-bold border-r border-black bg-gray-50">Mekân Türü / Kategori</td>
                      <td className="p-1">{data.destinationCategory} ({data.tripType} - {data.tripDuration})</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-1 font-bold border-r border-black bg-gray-50">Mekân Adresi</td>
                      <td colSpan={3} className="p-1">{data.destinationAddress || '-'}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-1 font-bold border-r border-black bg-gray-50">Gezi Tarihi ve Saati</td>
                      <td className="p-1 border-r border-black font-semibold">{formatDate(data.tripDate)} | {data.departureTime} - {data.returnTime}</td>
                      <td className="p-1 font-bold border-r border-black bg-gray-50">Görevli Sayısı</td>
                      <td className="p-1 font-semibold">
                        {1 + (data.teachers?.length || 0)} Öğretmen + {data.companions?.length || 0} Veli
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Sınıf Bazlı Öğrenci Dağılımı */}
                <div className="border-t border-black bg-gray-50 font-bold px-2 py-0.5 text-[9px] uppercase border-b border-black flex justify-between">
                  <span>Katılacak Sınıf ve Şubeler / Öğrenci Sayıları Dağılımı</span>
                  <span>Genel Toplam: {data.totalStudentCount} Öğrenci</span>
                </div>
                <table className="w-full border-collapse text-center text-[9.5px]">
                  <thead>
                    <tr className="border-b border-black bg-gray-100 font-bold text-[8.5px]">
                      <th className="p-0.5 border-r border-black w-6">S.N</th>
                      <th className="p-0.5 border-r border-black text-left pl-2">Sınıf / Şube Adı</th>
                      <th className="p-0.5 border-r border-black w-24">Erkek Öğrenci</th>
                      <th className="p-0.5 border-r border-black w-24">Kız Öğrenci</th>
                      <th className="p-0.5 w-28 font-black">Şube Toplamı</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.gradeRows && data.gradeRows.length > 0 ? (
                      data.gradeRows.map((row, idx) => (
                        <tr key={row.id} className="border-b border-black last:border-b-0">
                          <td className="p-0.5 border-r border-black">{idx + 1}</td>
                          <td className="p-0.5 border-r border-black text-left pl-2 font-bold">{row.gradeName}</td>
                          <td className="p-0.5 border-r border-black">{row.maleCount}</td>
                          <td className="p-0.5 border-r border-black">{row.femaleCount}</td>
                          <td className="p-0.5 font-bold bg-gray-50">{row.totalCount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-1 italic text-gray-500">Şube bilgisi girilmedi ({data.totalStudentCount} Öğrenci)</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TABLO 2: EĞİTİM, KAZANIM VE MAARİF MODELİ BİLGİLERİ */}
              <div className="border border-black text-[9.5px]">
                <div className="bg-gray-100 font-bold px-2 py-0.5 border-b border-black text-[9.5px] uppercase">
                  2. Eğitsel Amaç ve Türkiye Yüzyılı Maarif Modeli Öğrenme Çıktıları
                </div>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="w-1/4 p-1 font-bold border-r border-black bg-gray-50">İlgili Ders / Alan</td>
                      <td className="w-1/4 p-1 border-r border-black">{data.courseName}</td>
                      <td className="w-1/4 p-1 font-bold border-r border-black bg-gray-50">Gezinin Konusu</td>
                      <td className="w-1/4 p-1">{data.subjectTopic}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-1 font-bold border-r border-black bg-gray-50">Gezinin Amacı</td>
                      <td colSpan={3} className="p-1">{data.purpose}</td>
                    </tr>
                    <tr>
                      <td className="p-1 font-bold border-r border-black bg-gray-50">Öğrenme Çıktıları</td>
                      <td colSpan={3} className="p-1 whitespace-pre-line font-mono text-[9px] leading-relaxed">{data.outcomes || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sayfa 1 Alt Dipnot */}
            <div className="text-[8.5px] text-gray-500 flex justify-between items-center pt-2 border-t border-gray-300 mt-2">
              <span>MEB Okul Dışı Öğrenme Gezi Planı ve İzin Dilekçesi (EBA ODOS Uyumlu)</span>
              <span className="font-bold">Sayfa 1 / 2</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* ===================== RESMİ ÇIKTI - SAYFA 2 (ULAŞIM, KAFİLE & ONAY) ====== */}
          {/* ========================================================================= */}
          <div className="print-page-2 border-b-2 print:border-none pb-4 mb-6">
            <div>
              
              {/* TABLO 3: ULAŞIM, ARAÇ VE GÜZERGAH */}
              <div className="border border-black mb-2 text-[9.5px]">
                <div className="bg-gray-100 font-bold px-2 py-0.5 border-b border-black text-[9.5px] uppercase">
                  3. Ulaşım, Araç ve Güzergâh Bilgileri
                </div>
                <table className="w-full border-collapse">
                  <tbody>
                    {data.transportationType === 'Yürüyerek' ? (
                      <>
                        <tr className="border-b border-black">
                          <td className="w-1/4 p-1 font-bold border-r border-black bg-gray-50">Ulaşım Türü / Şekli</td>
                          <td className="w-1/4 p-1 border-r border-black font-semibold">Yürüyerek (Araçsız Yakın Çevre İntikali)</td>
                          <td className="w-1/4 p-1 font-bold border-r border-black bg-gray-50">Hareket / Dönüş Yeri</td>
                          <td className="w-1/4 p-1">{data.departureLocation} - {data.returnLocation}</td>
                        </tr>
                        <tr>
                          <td className="p-1 font-bold border-r border-black bg-gray-50">Yürüyüş Güzergâhı</td>
                          <td colSpan={3} className="p-1">{data.travelRoute || `${data.departureLocation} -> ${data.destinationName} -> ${data.returnLocation}`}</td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr className="border-b border-black">
                          <td className="w-1/4 p-1 font-bold border-r border-black bg-gray-50">Ulaşım Türü / Şekli</td>
                          <td className="w-1/4 p-1 border-r border-black font-semibold">{data.transportationType}</td>
                          <td className="w-1/4 p-1 font-bold border-r border-black bg-gray-50">Araç Plakası / Firma</td>
                          <td className="w-1/4 p-1 font-semibold">
                            {data.transportationType === 'Belediye / Toplu Taşıma' 
                              ? `Belediye Araç Talepli (${data.vehiclePlate || 'Tahsisli Araç'})` 
                              : `${data.vehiclePlate || '-'} (${data.transportCompany || 'Firma Belirtilmedi'})`}
                          </td>
                        </tr>
                        <tr className="border-b border-black">
                          <td className="p-1 font-bold border-r border-black bg-gray-50">Sürücü Adı & Tel</td>
                          <td className="p-1 border-r border-black">
                            {data.transportationType === 'Belediye / Toplu Taşıma' && !data.driverName
                              ? 'Belediye Görevli Sürücüsü'
                              : `${data.driverName || '-'} / ${data.driverPhone || '-'}`}
                          </td>
                          <td className="p-1 font-bold border-r border-black bg-gray-50">Hareket / Dönüş Yeri</td>
                          <td className="p-1">{data.departureLocation} - {data.returnLocation}</td>
                        </tr>
                        <tr>
                          <td className="p-1 font-bold border-r border-black bg-gray-50">Seyahat Güzergâhı</td>
                          <td colSpan={3} className="p-1">{data.travelRoute || 'Okul -> Gezi Alanı -> Okul'}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TABLO 4: KAFİLE LİSTESİ (ÖĞRETMEN VE REFAKATÇİLER) */}
              <div className="border border-black mb-2 text-[9px]">
                <div className="bg-gray-100 font-bold px-2 py-0.5 border-b border-black text-[9.5px] uppercase flex justify-between">
                  <span>4. Kafile Başkanı, Görevli Öğretmenler ve Refakatçi Veliler</span>
                  <span>Toplam Kadro: {1 + (data.teachers?.length || 0) + (data.companions?.length || 0)} Kişi</span>
                </div>
                <table className="w-full border-collapse text-center">
                  <thead>
                    <tr className="border-b border-black bg-gray-100 font-bold text-[8.5px]">
                      <th className="p-0.5 border-r border-black w-6">S.N</th>
                      <th className="p-0.5 border-r border-black text-left pl-2">Adı Soyadı</th>
                      <th className="p-0.5 border-r border-black w-36">Görevi / Branşı</th>
                      <th className="p-0.5 border-r border-black w-32">Kafiledaki Rolü</th>
                      <th className="p-0.5 border-r border-black w-28">Telefon No</th>
                      <th className="p-0.5 w-16">İmza</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Kafile Başkanı */}
                    <tr className="border-b border-black bg-yellow-50/40 font-semibold">
                      <td className="p-0.5 border-r border-black">1</td>
                      <td className="p-0.5 border-r border-black text-left pl-2 font-bold">{data.headTeacher?.fullName || 'Belirtilmedi'}</td>
                      <td className="p-0.5 border-r border-black">{data.headTeacher?.branch || 'Sınıf Öğretmeni'}</td>
                      <td className="p-0.5 border-r border-black font-black text-red-900">Kafile Başkanı</td>
                      <td className="p-0.5 border-r border-black">{data.headTeacher?.phone || '-'}</td>
                      <td className="p-0.5"></td>
                    </tr>

                    {/* Diğer Görevli Öğretmenler */}
                    {data.teachers && data.teachers.map((t, idx) => (
                      <tr key={t.id || idx} className="border-b border-black">
                        <td className="p-0.5 border-r border-black">{idx + 2}</td>
                        <td className="p-0.5 border-r border-black text-left pl-2 font-bold">{t.fullName}</td>
                        <td className="p-0.5 border-r border-black">{t.branch || 'Öğretmen'}</td>
                        <td className="p-0.5 border-r border-black">{t.role || 'Görevli Öğretmen'}</td>
                        <td className="p-0.5 border-r border-black">{t.phone || '-'}</td>
                        <td className="p-0.5"></td>
                      </tr>
                    ))}

                    {/* Refakatçi Veliler */}
                    {data.companions && data.companions.map((c, idx) => (
                      <tr key={c.id || idx} className="border-b border-black last:border-b-0">
                        <td className="p-0.5 border-r border-black">{(data.teachers?.length || 0) + idx + 2}</td>
                        <td className="p-0.5 border-r border-black text-left pl-2">{c.fullName}</td>
                        <td className="p-0.5 border-r border-black">Veli / Refakatçi</td>
                        <td className="p-0.5 border-r border-black">{c.role || 'Veli'}</td>
                        <td className="p-0.5 border-r border-black">{c.phone || '-'}</td>
                        <td className="p-0.5"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* TABLO 5: ZAMAN AKIŞ ÇİZELGESİ */}
              <div className="border border-black mb-2 text-[9px]">
                <div className="bg-gray-100 font-bold px-2 py-0.5 border-b border-black text-[9.5px] uppercase">
                  5. Gezi Zaman Akış ve Etkinlik Çizelgesi
                </div>
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-black bg-gray-100 font-bold text-[8.5px]">
                      <th className="p-0.5 border-r border-black w-24 text-center">Saat Aralığı</th>
                      <th className="p-0.5 border-r border-black pl-2">Yapılacak Faaliyet / Etkinlik</th>
                      <th className="p-0.5 border-r border-black w-36 pl-2">Uygulama Yeri</th>
                      <th className="p-0.5 w-36 pl-2">Sorumlu Kişi / Kurul</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.schedule && data.schedule.length > 0 ? (
                      data.schedule.map((s, idx) => (
                        <tr key={s.id || idx} className="border-b border-black last:border-b-0">
                          <td className="p-0.5 border-r border-black text-center font-bold">{s.timeRange}</td>
                          <td className="p-0.5 border-r border-black pl-2">{s.activity}</td>
                          <td className="p-0.5 border-r border-black pl-2">{s.location}</td>
                          <td className="p-0.5 pl-2">{s.responsible}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-1 italic text-gray-500">Zaman akışı belirtilmedi</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TABLO 6: 4 KADEMELİ RESMİ İMZA VE MAKAM OLURU BLOĞU */}
              <div className="border-2 border-black p-1 text-[9px]">
                <div className="text-center font-extrabold text-[10px] uppercase border-b border-black pb-0.5 mb-1.5 tracking-wide">
                  MEB EĞİTİM KURUMLARI SOSYAL ETKİNLİKLER YÖNETMELİĞİ GEZİ ONAY MASASI
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-center">
                  
                  {/* 1. Aşama: Kafile Başkanı */}
                  <div className="border border-black p-1.5 flex flex-col justify-between min-h-[90px] bg-gray-50/50">
                    <div>
                      <p className="font-extrabold text-[9.5px] uppercase">1. DÜZENLEYEN</p>
                      <p className="text-[9px] font-bold text-gray-800 mt-1">{data.headTeacher?.fullName || '................................'}</p>
                      <p className="text-[8px] text-gray-600">Kafile Başkanı / Sınıf Öğrt.</p>
                    </div>
                    <p className="text-[8.5px] italic mt-2">İmza</p>
                  </div>

                  {/* 2. Aşama: Memur Ön İnceleme */}
                  <div className="border border-black p-1.5 flex flex-col justify-between min-h-[90px] bg-gray-50/50">
                    <div>
                      <p className="font-extrabold text-[9.5px] uppercase">2. EVRAK / ÖN İNCELEME</p>
                      <p className="text-[9px] font-bold text-gray-800 mt-1">{data.clerkReviewedBy || 'Sultan YILDIRIM'}</p>
                      <p className="text-[8px] text-gray-600">Ön Kontrol Yapıldı</p>
                    </div>
                    <p className="text-[8.5px] italic mt-2">Paraf / Kaşe</p>
                  </div>

                  {/* 3. Aşama: Müdür Yardımcısı İnceleme */}
                  <div className="border border-black p-1.5 flex flex-col justify-between min-h-[90px] bg-gray-50/50">
                    <div>
                      <p className="font-extrabold text-[9.5px] uppercase">3. İNCELENDİ / UYGUNDUR</p>
                      <p className="text-[9px] font-bold text-gray-800 mt-1">{data.deputyPrincipalName || 'Funda FİDAN'}</p>
                      <p className="text-[8px] text-gray-600">Müdür Yardımcısı</p>
                    </div>
                    <p className="text-[8.5px] italic mt-2">İmza</p>
                  </div>

                  {/* 4. Aşama: Okul Müdürü Makam Oluru */}
                  <div className="border-2 border-black p-1.5 flex flex-col justify-between min-h-[90px] bg-gray-100">
                    <div>
                      <p className="font-black text-[10px] text-black">4. MAKAM OLURU / UYGUNDUR</p>
                      <p className="text-[8px] text-gray-600">..../..../202...</p>
                      <p className="text-[9.5px] font-black text-black mt-0.5">{data.principalName || 'Recep KIZILIRMAK'}</p>
                      <p className="text-[8px] text-gray-700">Okul Müdürü</p>
                    </div>
                    <p className="text-[8.5px] italic mt-2 font-semibold">Mühür - İmza</p>
                  </div>

                </div>

                {/* İl Dışı Geziler için Mülki İdare Onayı Notu */}
                {data.tripType === 'İl Dışı' && (
                  <div className="mt-1.5 pt-1 border-t border-black text-center text-[8px] italic">
                    * İl Dışı Gezilerde İlçe Millî Eğitim Müdürlüğü / Kaymakamlık Makam Oluru ayrıca alınacaktır.
                  </div>
                )}
              </div>

            </div>

            {/* Sayfa 2 Alt Dipnot */}
            <div className="text-[8.5px] text-gray-500 flex justify-between items-center pt-2 border-t border-gray-300 mt-2">
              <span>MEB Okul Dışı Öğrenme Gezi Planı ve İzin Dilekçesi (EBA ODOS Uyumlu)</span>
              <span className="font-bold">Sayfa 2 / 2</span>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* ===================== RESMİ ÇIKTI - EK-2 ÖĞRENCİ İSİM LİSTESİ ============ */}
      {/* ========================================================================= */}
      {showStudentList && (
        <div className="print-page-ek2 border-b-2 print:border-none pb-4 mb-6 page-break-before">
          {/* Antet */}
          <div className="text-center font-bold uppercase space-y-0.5 mb-2">
            <p className="text-[10px] tracking-wide">T.C. ÜSKÜDAR KAYMAKAMLIĞI / ZEYNEP KAMİL İLKOKULU MÜDÜRLÜĞÜ</p>
            <h3 className="text-[12px] font-extrabold uppercase bg-gray-100 py-1 border border-black">
              EK-2: GEZİYE KATILACAK ÖĞRENCİ İSİM LİSTESİ
            </h3>
          </div>

          <div className="flex justify-between items-center text-[9.5px] font-semibold mb-2 px-1">
            <span>Gezi Yeri: <strong>{data.destinationName}</strong></span>
            <span>Tarih: <strong>{formatDate(data.tripDate)}</strong></span>
            <span>Katılımcı Sayısı: <strong>{data.studentList?.length || data.totalStudentCount} Öğrenci</strong></span>
          </div>

          <table className="w-full border border-black border-collapse text-[9px] text-center">
            <thead>
              <tr className="border-b border-black bg-gray-100 font-bold text-[8.5px]">
                <th className="p-1 border-r border-black w-6">S.N</th>
                <th className="p-1 border-r border-black w-14">Okul No</th>
                <th className="p-1 border-r border-black text-left pl-2">Öğrencinin Adı Soyadı</th>
                <th className="p-1 border-r border-black w-16">Sınıf/Şube</th>
                <th className="p-1 border-r border-black text-left pl-2">Velisinin Adı Soyadı</th>
                <th className="p-1 border-r border-black w-24">Veli İletişim Tel</th>
                <th className="p-1 w-14">Ek-1 İzin</th>
              </tr>
            </thead>
            <tbody>
              {studentDisplayList.map((st, idx) => (
                <tr key={st.id || idx} className="border-b border-black last:border-b-0">
                  <td className="p-0.5 border-r border-black">{idx + 1}</td>
                  <td className="p-0.5 border-r border-black font-semibold">{st.studentNumber || '-'}</td>
                  <td className="p-0.5 border-r border-black text-left pl-2 font-bold">{st.fullName}</td>
                  <td className="p-0.5 border-r border-black">{st.grade || data.targetGrades}</td>
                  <td className="p-0.5 border-r border-black text-left pl-2">{st.parentName || '-'}</td>
                  <td className="p-0.5 border-r border-black">{st.parentPhone || '-'}</td>
                  <td className="p-0.5 font-bold text-emerald-800">{st.consentStatus || 'Alındı'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* İmza Bloğu */}
          <div className="flex justify-between items-center text-[9px] mt-4 pt-2 border-t border-black px-4">
            <div className="text-center">
              <p className="font-bold">{data.headTeacher?.fullName}</p>
              <p className="text-[8px] text-gray-600">Kafile Başkanı / Sınıf Öğretmeni</p>
              <p className="text-[8px] italic mt-2">İmza</p>
            </div>
            <div className="text-center">
              <p className="font-bold">{data.deputyPrincipalName || 'Funda FİDAN'}</p>
              <p className="text-[8px] text-gray-600">Müdür Yardımcısı</p>
              <p className="text-[8px] italic mt-2">İmza</p>
            </div>
            <div className="text-center">
              <p className="font-bold">{data.principalName || 'Recep KIZILIRMAK'}</p>
              <p className="text-[8px] text-gray-600">Okul Müdürü</p>
              <p className="text-[8px] italic mt-2">Mühür - İmza</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ===================== RESMİ ÇIKTI - EK-1 VELİ İZİN BELGELERİ ============= */}
      {/* ========================================================================= */}
      {showParentConsent && (
        <div className="print-page-ek1 border-b-2 print:border-none pb-4 mb-6 page-break-before">
          <div className="space-y-6">
            {/* Sayfa Başına 2 Adet MEB Ek-1 Veli İzin Formu */}
            {[1, 2].map((formNum) => (
              <div key={formNum} className="border-2 border-black p-3 bg-white text-[9.5px] rounded-sm">
                
                {/* Antet */}
                <div className="text-center font-bold uppercase space-y-0.5 border-b border-black pb-1 mb-2">
                  <p className="text-[10px]">T.C. MİLLÎ EĞİTİM BAKANLIĞI</p>
                  <p className="text-[10px]">{data.schoolName || 'ZEYNEP KAMİL İLKOKULU'} MÜDÜRLÜĞÜ</p>
                  <p className="text-[11px] font-extrabold uppercase bg-gray-100 py-0.5">
                    EK-1: SOSYAL ETKİNLİK / GEZİ VELİ İZİN MUVAFAKATNAMESİ
                  </p>
                </div>

                <div className="text-center font-bold uppercase mb-2">
                  {data.schoolName || 'ZEYNEP KAMİL İLKOKULU'} MÜDÜRLÜĞÜNE
                </div>

                <p className="text-justify leading-relaxed mb-3 indent-4 text-[9.5px]">
                  Velisi bulunduğum okulunuz <strong>{data.targetGrades || '...........'}</strong> sınıfı/şubesi 
                  <strong> ............. </strong> numaralı öğrencisi <strong>...........................................................................</strong>'nin; 
                  okulunuz Gezi Kulübü tarafından <strong>{formatDate(data.tripDate) || '..../..../202...'}</strong> tarihinde 
                  <strong> {data.departureTime || '....:....'} - {data.returnTime || '....:....'}</strong> saatleri arasında 
                  <strong> {data.destinationName || '...................................................'}</strong> ({data.selectedCity}) adresine düzenlenecek olan 
                  eğitsel okul dışı öğrenme gezisine katılmasına izin veriyorum. 
                  Gezinin MEB Sosyal Etkinlikler Yönetmeliği hükümleri doğrultusunda gerçekleşmesini kabul ve taahhüt ederim.
                </p>

                {/* Veli ve Öğrenci Bilgileri Tablosu */}
                <div className="grid grid-cols-2 gap-3 border border-black p-2 bg-gray-50 mb-3">
                  <div>
                    <p className="font-bold text-[9px] uppercase border-b border-gray-400 pb-0.5 mb-1">Öğrenci Bilgileri:</p>
                    <p>Adı Soyadı: <strong>........................................................</strong></p>
                    <p>Sınıf / Şube: <strong>{data.targetGrades || '................................'}</strong></p>
                    <p>Okul Numarası: <strong>..................................................</strong></p>
                    <p>Kronik Rahatsızlık: <strong>Var (.......) / Yok (.......)</strong></p>
                  </div>
                  <div>
                    <p className="font-bold text-[9px] uppercase border-b border-gray-400 pb-0.5 mb-1">Veli Bilgileri ve İmza:</p>
                    <p>Veli Adı Soyadı: <strong>...................................................</strong></p>
                    <p>Yakınlık Derecesi: <strong>(Anne / Baba / Vasi)</strong></p>
                    <p>İletişim Telefon No: <strong>05........................................</strong></p>
                    <p className="mt-2 text-right">Tarih: ...../...../202... &nbsp;&nbsp;&nbsp; <strong>İmza: ....................</strong></p>
                  </div>
                </div>

                <div className="flex justify-between text-[8px] text-gray-600 italic">
                  <span>* MEB Sosyal Etkinlikler Yönetmeliği Ek-1 Formu</span>
                  <span>* İmzalı nüsha gezi tarihinden önce sınıf öğretmenine teslim edilecektir.</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
