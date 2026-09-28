import React from 'react';
import type { GeziPlanData } from '../types';

interface PrintDocumentProps {
  data: GeziPlanData;
}

export const PrintDocument: React.FC<PrintDocumentProps> = ({ data }) => {
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

  return (
    <div className="print-container bg-white text-black font-serif leading-tight">
      
      {/* ========================================================================= */}
      {/* ===================== RESMİ ÇIKTI - SAYFA 1 (DİLEKÇE & TABLO 1-2) ========= */}
      {/* ========================================================================= */}
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
                {(data.gradeRows && data.gradeRows.length > 0 ? data.gradeRows : [
                  { id: 'gr-1', gradeName: data.targetGrades || 'Belirtilmedi', maleCount: data.maleStudentCount, femaleCount: data.femaleStudentCount, totalCount: data.totalStudentCount }
                ]).map((row, idx) => (
                  <tr key={row.id || idx} className="border-b border-black">
                    <td className="p-0.5 border-r border-black font-semibold">{idx + 1}</td>
                    <td className="p-0.5 border-r border-black text-left pl-2 font-bold">{row.gradeName || '-'}</td>
                    <td className="p-0.5 border-r border-black">{row.maleCount || 0}</td>
                    <td className="p-0.5 border-r border-black">{row.femaleCount || 0}</td>
                    <td className="p-0.5 font-bold">{row.totalCount || ((row.maleCount || 0) + (row.femaleCount || 0))}</td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-black text-[9.5px]">
                  <td colSpan={2} className="p-1 border-r border-black text-right pr-2 uppercase">
                    GENEL TOPLAM :
                  </td>
                  <td className="p-1 border-r border-black">{data.maleStudentCount} Erkek</td>
                  <td className="p-1 border-r border-black">{data.femaleStudentCount} Kız</td>
                  <td className="p-1 underline bg-gray-200">{data.totalStudentCount} ÖĞRENCİ</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TABLO 2: EĞİTSEL AMAÇ VE ÖĞRENME ÇIKTILARI / KAZANIMLAR */}
          <div className="border border-black text-[9.5px]">
            <div className="bg-gray-100 font-bold px-2 py-0.5 border-b border-black text-[9.5px] uppercase">
              2. Eğitsel Amaç, Konu ve Maarif Modeli Öğrenme Çıktıları / Kazanımları
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
      <div className="print-page-2">
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
                      <td className="w-1/4 p-1 border-r border-black">{data.transportationType}</td>
                      <td className="w-1/4 p-1 font-bold border-r border-black bg-gray-50">Araç Plakası / Firma</td>
                      <td className="w-1/4 p-1 font-semibold">{data.vehiclePlate || '-'} ({data.transportCompany || 'Firma Belirtilmedi'})</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-1 font-bold border-r border-black bg-gray-50">Sürücü Adı & Tel</td>
                      <td className="p-1 border-r border-black">{data.driverName || '-'} / {data.driverPhone || '-'}</td>
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

          {/* TABLO 4: GÖREVLİ KAFİLE VE ÖĞRETMEN LİSTESİ */}
          <div className="border border-black mb-2 text-[9.5px]">
            <div className="bg-gray-100 font-bold px-2 py-0.5 border-b border-black text-[9.5px] uppercase flex justify-between">
              <span>4. Görevli Kafile Listesi (Yönetici, Öğretmen ve Refakatçiler)</span>
              <span className="text-[8.5px] font-normal lowercase">toplam: {1 + (data.teachers?.length || 0) + (data.companions?.length || 0)} görevli</span>
            </div>
            <table className="w-full border-collapse text-center">
              <thead>
                <tr className="border-b border-black bg-gray-50 font-bold text-[9px]">
                  <th className="p-0.5 border-r border-black w-6">S.N</th>
                  <th className="p-0.5 border-r border-black text-left pl-2">Adı Soyadı</th>
                  <th className="p-0.5 border-r border-black w-36">Branşı / Sınıfı</th>
                  <th className="p-0.5 border-r border-black w-32">Görevi</th>
                  <th className="p-0.5 border-r border-black w-28">İletişim Tel</th>
                  <th className="p-0.5 w-16">İmza</th>
                </tr>
              </thead>
              <tbody>
                {/* Kafile Başkanı */}
                <tr className="border-b border-black font-semibold">
                  <td className="p-0.5 border-r border-black">1</td>
                  <td className="p-0.5 border-r border-black text-left pl-2">{data.headTeacher?.fullName || '................................'}</td>
                  <td className="p-0.5 border-r border-black">{data.headTeacher?.branch}</td>
                  <td className="p-0.5 border-r border-black text-red-900 font-bold">Kafile Başkanı</td>
                  <td className="p-0.5 border-r border-black">{data.headTeacher?.phone}</td>
                  <td className="p-0.5"></td>
                </tr>

                {/* Görevli Öğretmenler */}
                {(data.teachers || []).map((teacher, idx) => (
                  <tr key={teacher.id || idx} className="border-b border-black">
                    <td className="p-0.5 border-r border-black">{idx + 2}</td>
                    <td className="p-0.5 border-r border-black text-left pl-2">{teacher.fullName || '................................'}</td>
                    <td className="p-0.5 border-r border-black">{teacher.branch}</td>
                    <td className="p-0.5 border-r border-black">{teacher.role || 'Görevli Öğretmen'}</td>
                    <td className="p-0.5 border-r border-black">{teacher.phone}</td>
                    <td className="p-0.5"></td>
                  </tr>
                ))}

                {/* Veli Refakatçiler */}
                {(data.companions || []).map((comp, idx) => (
                  <tr key={comp.id || idx} className="border-b border-black text-gray-700">
                    <td className="p-0.5 border-r border-black">{1 + (data.teachers?.length || 0) + idx + 1}</td>
                    <td className="p-0.5 border-r border-black text-left pl-2">{comp.fullName || '................................'}</td>
                    <td className="p-0.5 border-r border-black">Veli</td>
                    <td className="p-0.5 border-r border-black">{comp.role || 'Veli Refakatçi'}</td>
                    <td className="p-0.5 border-r border-black">{comp.phone}</td>
                    <td className="p-0.5"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TABLO 5: ZAMAN AKIŞ ÇİZELGESİ */}
          <div className="border border-black mb-2 text-[9.5px]">
            <div className="bg-gray-100 font-bold px-2 py-0.5 border-b border-black text-[9.5px] uppercase">
              5. Gezi Zaman Akış Çizelgesi
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-black bg-gray-50 font-bold text-[9px]">
                  <th className="p-0.5 border-r border-black w-24 text-center">Saat Aralığı</th>
                  <th className="p-0.5 border-r border-black text-left pl-2">Yapılacak Etkinlik / Uygulama Aşaması</th>
                  <th className="p-0.5 border-r border-black w-32 text-center">Mekân / Bölüm</th>
                  <th className="p-0.5 w-32 text-center">Sorumlular</th>
                </tr>
              </thead>
              <tbody>
                {(data.schedule || []).map((item) => (
                  <tr key={item.id} className="border-b border-black">
                    <td className="p-0.5 border-r border-black text-center font-bold">{item.timeRange}</td>
                    <td className="p-0.5 border-r border-black pl-2">{item.activity}</td>
                    <td className="p-0.5 border-r border-black text-center">{item.location}</td>
                    <td className="p-0.5 text-center">{item.responsible}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TABLO 6: DEĞERLENDİRME VE GÜVENLİK NOTLARI */}
          <div className="border border-black mb-3 text-[9.5px]">
            <div className="bg-gray-100 font-bold px-2 py-0.5 border-b border-black text-[9.5px] uppercase">
              6. Süreç Değerlendirme & Güvenlik Önlemleri
            </div>
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b border-black">
                  <td className="w-1/4 p-1 font-bold border-r border-black bg-gray-50">Gezi Öncesi</td>
                  <td className="p-1">{data.preTripNotes}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-bold border-r border-black bg-gray-50">Gezi Sırasında</td>
                  <td className="p-1">{data.duringTripNotes}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-bold border-r border-black bg-gray-50">Gezi Sonrasında</td>
                  <td className="p-1">{data.postTripNotes}</td>
                </tr>
                <tr>
                  <td className="p-1 font-bold border-r border-black bg-gray-50">Güvenlik / İlkyardım</td>
                  <td className="p-1">{data.safetyMeasures}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ===================== RESMİ KADEMELİ ONAY VE İMZA KUTULARI (4 SÜTUN) ===================== */}
          <div className="border-2 border-black p-2 bg-white">
            <div className="text-center font-bold text-[10px] uppercase mb-2">
              KADEMELİ İNCELEME VE ONAY BÖLÜMÜ
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center text-[9px]">
              
              {/* 1. Aşama: Düzenleyen */}
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
                  <p className="text-[9px] font-bold text-gray-800 mt-1">{data.clerkReviewedBy || 'Memur / Evrak Kayıt'}</p>
                  <p className="text-[8px] text-gray-600">Ön Kontrol Yapıldı</p>
                </div>
                <p className="text-[8.5px] italic mt-2">Paraf / Kaşe</p>
              </div>

              {/* 3. Aşama: Müdür Yardımcısı İnceleme */}
              <div className="border border-black p-1.5 flex flex-col justify-between min-h-[90px] bg-gray-50/50">
                <div>
                  <p className="font-extrabold text-[9.5px] uppercase">3. İNCELENDİ / UYGUNDUR</p>
                  <p className="text-[9px] font-bold text-gray-800 mt-1">{data.deputyPrincipalName || 'Fudan FİDAN'}</p>
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

    </div>
  );
};
