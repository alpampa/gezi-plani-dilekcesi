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
    <div className="print-container bg-white text-black p-4 sm:p-8 font-serif leading-tight">
      
      {/* ===================== RESMİ DİLEKÇE BÖLÜMÜ (SAYFA 1 BAŞI) ===================== */}
      <div className="border-b-2 border-black pb-4 mb-4">
        {/* Antet */}
        <div className="text-center font-bold uppercase space-y-1 mb-6">
          <p className="text-sm tracking-wide">T.C.</p>
          <p className="text-sm tracking-wide">{data.district || '................'} KAYMAKAMLIĞI / İLÇE MİLLÎ EĞİTİM MÜDÜRLÜĞÜ</p>
          <p className="text-base font-extrabold tracking-wider mt-1">{data.schoolName || '................................ MÜDÜRLÜĞÜ'}</p>
        </div>

        {/* Sayı ve Tarih */}
        <div className="flex justify-between items-center text-xs font-semibold mb-4 px-1">
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
        <div className="text-xs font-semibold mb-5 px-1">
          <span>Konu : </span>
          <span>Okul Dışı Öğrenme / Sosyal Etkinlik Gezi İzni Talebi ({data.destinationName || 'Eğitsel Gezi'})</span>
        </div>

        {/* Makam Hitabı */}
        <div className="text-center font-extrabold text-sm mb-4">
          {data.schoolName ? data.schoolName.toLocaleUpperCase('tr-TR') : 'OKUL'} MÜDÜRLÜĞÜNE
        </div>

        {/* Dilekçe Gövdesi */}
        <div className="text-xs text-justify leading-relaxed mb-6 indent-6">
          Okulumuz <strong className="underline">{data.targetGrades || '...................'}</strong> şubeleri öğrencilerine yönelik olarak; 
          <strong className="underline"> {data.courseName || '...................'}</strong> dersi öğretim programı ve Türkiye Yüzyılı Maarif Modeli kazanımları doğrultusunda, 
          <strong className="underline"> {formatDate(data.tripDate) || '..../..../202...'}</strong> tarihinde 
          <strong className="underline"> {data.departureTime || '....:....'} - {data.returnTime || '....:....'}</strong> saatleri arasında 
          <strong className="underline"> {data.destinationName || '................................'}</strong> ({data.destinationAddress || data.selectedCity}) adresine 
          <strong className="underline"> {data.tripType}</strong> gezi düzenlenmesi planlanmaktadır.
          <br /><br />
          Söz konusu geziye ait Okul Gezi Planı, Kafile ve Görevli Listesi, Araç ve Ulaşım Bilgileri ile Zaman Akış Çizelgesi ekte sunulmuştur. 
          Gezinin MEB Eğitim Kurumları Sosyal Etkinlikler Yönetmeliği ve ilgili Okul Dışı Öğrenme Yönergesi hükümleri doğrultusunda yapılması hususunu olurlarınıza arz ederim.
        </div>

        {/* Düzenleyen İmza Bloğu */}
        <div className="flex justify-end text-xs text-right pr-6 mb-2">
          <div>
            <p className="font-bold">{data.headTeacher.fullName || '........................................'}</p>
            <p className="text-[11px] text-gray-700">{data.headTeacher.branch || 'Sınıf / Branş Öğretmeni'}</p>
            <p className="text-[10px] text-gray-600">Kafile Başkanı / Kulüp Danışman Öğrt.</p>
            <div className="h-10"></div>
            <p className="text-[11px] italic">İmza</p>
          </div>
        </div>
      </div>

      {/* ===================== RESMİ GEZİ PLANI TABLOLARI ===================== */}
      <div className="text-center font-bold text-sm uppercase tracking-wide bg-gray-100 py-1.5 border border-black mb-2">
        MEB OKUL DIŞI ÖĞRENME VE SOSYAL ETKİNLİK GEZİ PLANI
      </div>

      {/* TABLO 1: GENEL VE İDARİ BİLGİLER */}
      <div className="border border-black mb-3 text-xs page-break-inside-avoid">
        <div className="bg-gray-100 font-bold px-2 py-1 border-b border-black text-[11px] uppercase">
          1. Gezi ve Katılımcı Bilgileri
        </div>
        <table className="w-full border-collapse">
          <tbody>
            <tr className="border-b border-black">
              <td className="w-1/4 p-1.5 font-bold border-r border-black bg-gray-50">Gezinin Düzenlendiği Okul</td>
              <td className="w-1/4 p-1.5 border-r border-black">{data.schoolName} ({data.district}/{data.city})</td>
              <td className="w-1/4 p-1.5 font-bold border-r border-black bg-gray-50">Kulüp / Alan</td>
              <td className="w-1/4 p-1.5">{data.clubName}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-1.5 font-bold border-r border-black bg-gray-50">Gidilecek Yer / Mekân</td>
              <td className="p-1.5 border-r border-black font-semibold">{data.destinationName}</td>
              <td className="p-1.5 font-bold border-r border-black bg-gray-50">Mekân Türü / Kategori</td>
              <td className="p-1.5">{data.destinationCategory} ({data.tripType} - {data.tripDuration})</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-1.5 font-bold border-r border-black bg-gray-50">Mekân Adresi</td>
              <td colSpan={3} className="p-1.5">{data.destinationAddress || '-'}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-1.5 font-bold border-r border-black bg-gray-50">Gezi Tarihi ve Saati</td>
              <td className="p-1.5 border-r border-black font-semibold">{formatDate(data.tripDate)} | {data.departureTime} - {data.returnTime}</td>
              <td className="p-1.5 font-bold border-r border-black bg-gray-50">Görevli Personel</td>
              <td className="p-1.5 font-semibold">
                {1 + data.teachers.length} Öğretmen + {data.companions.length} Veli Refakatçi
              </td>
            </tr>
          </tbody>
        </table>

        {/* SINIF BAZLI KATILIMCI TABLOSU */}
        <div className="border-t border-black bg-gray-50 font-bold px-2 py-1 text-[10.5px] uppercase border-b border-black flex justify-between">
          <span>Katılacak Sınıf ve Şubeler / Öğrenci Sayıları Dağılımı</span>
          <span>Genel Toplam: {data.totalStudentCount} Öğrenci</span>
        </div>
        <table className="w-full border-collapse text-center text-[11px]">
          <thead>
            <tr className="border-b border-black bg-gray-100 font-bold text-[10px]">
              <th className="p-1 border-r border-black w-8">S.N</th>
              <th className="p-1 border-r border-black text-left pl-2">Sınıf / Şube Adı</th>
              <th className="p-1 border-r border-black w-28">Erkek Öğrenci</th>
              <th className="p-1 border-r border-black w-28">Kız Öğrenci</th>
              <th className="p-1 w-32 font-black">Şube Toplamı</th>
            </tr>
          </thead>
          <tbody>
            {(data.gradeRows && data.gradeRows.length > 0 ? data.gradeRows : [
              { id: 'gr-1', gradeName: data.targetGrades || 'Belirtilmedi', maleCount: data.maleStudentCount, femaleCount: data.femaleStudentCount, totalCount: data.totalStudentCount }
            ]).map((row, idx) => (
              <tr key={row.id || idx} className="border-b border-black">
                <td className="p-1 border-r border-black font-semibold">{idx + 1}</td>
                <td className="p-1 border-r border-black text-left pl-2 font-bold">{row.gradeName || '-'}</td>
                <td className="p-1 border-r border-black">{row.maleCount || 0}</td>
                <td className="p-1 border-r border-black">{row.femaleCount || 0}</td>
                <td className="p-1 font-bold">{row.totalCount || ((row.maleCount || 0) + (row.femaleCount || 0))}</td>
              </tr>
            ))}
            {/* Toplam Satırı */}
            <tr className="bg-gray-100 font-black text-[11.5px]">
              <td colSpan={2} className="p-1.5 border-r border-black text-right pr-3 uppercase">
                GENEL TOPLAM :
              </td>
              <td className="p-1.5 border-r border-black">{data.maleStudentCount} Erkek</td>
              <td className="p-1.5 border-r border-black">{data.femaleStudentCount} Kız</td>
              <td className="p-1.5 underline bg-gray-200">{data.totalStudentCount} ÖĞRENCİ</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* TABLO 2: EĞİTSEL AMAÇ VE ÖĞRENME ÇIKTILARI / KAZANIMLAR */}
      <div className="border border-black mb-3 text-xs page-break-inside-avoid">
        <div className="bg-gray-100 font-bold px-2 py-1 border-b border-black text-[11px] uppercase">
          2. Eğitsel Amaç, Konu ve Öğretim Programı / Maarif Modeli Öğrenme Çıktıları / Kazanımları
        </div>
        <table className="w-full border-collapse">
          <tbody>
            <tr className="border-b border-black">
              <td className="w-1/4 p-1.5 font-bold border-r border-black bg-gray-50">İlgili Ders / Alan</td>
              <td className="w-1/4 p-1.5 border-r border-black">{data.courseName}</td>
              <td className="w-1/4 p-1.5 font-bold border-r border-black bg-gray-50">Gezinin Konusu</td>
              <td className="w-1/4 p-1.5">{data.subjectTopic}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-1.5 font-bold border-r border-black bg-gray-50">Gezinin Amacı</td>
              <td colSpan={3} className="p-1.5">{data.purpose}</td>
            </tr>
            <tr>
              <td className="p-1.5 font-bold border-r border-black bg-gray-50">Öğrenme Çıktıları / Kazanımları</td>
              <td colSpan={3} className="p-1.5 whitespace-pre-line font-mono text-[11px]">{data.outcomes}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* TABLO 3: ULAŞIM, ARAÇ VE GÜZERGAH */}
      <div className="border border-black mb-3 text-xs page-break-inside-avoid">
        <div className="bg-gray-100 font-bold px-2 py-1 border-b border-black text-[11px] uppercase">
          3. Ulaşım, Araç ve Güzergâh Bilgileri
        </div>
        <table className="w-full border-collapse">
          <tbody>
            {data.transportationType === 'Yürüyerek' ? (
              <>
                <tr className="border-b border-black">
                  <td className="w-1/4 p-1.5 font-bold border-r border-black bg-gray-50">Ulaşım Türü / Şekli</td>
                  <td className="w-1/4 p-1.5 border-r border-black font-semibold">Yürüyerek (Araçsız Yakın Çevre İntikali)</td>
                  <td className="w-1/4 p-1.5 font-bold border-r border-black bg-gray-50">Hareket / Dönüş Yeri</td>
                  <td className="w-1/4 p-1.5">{data.departureLocation} - {data.returnLocation}</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold border-r border-black bg-gray-50">Yürüyüş Güzergâhı</td>
                  <td colSpan={3} className="p-1.5">{data.travelRoute || `${data.departureLocation} -> ${data.destinationName} -> ${data.returnLocation}`}</td>
                </tr>
              </>
            ) : (
              <>
                <tr className="border-b border-black">
                  <td className="w-1/4 p-1.5 font-bold border-r border-black bg-gray-50">Ulaşım Türü / Şekli</td>
                  <td className="w-1/4 p-1.5 border-r border-black">{data.transportationType}</td>
                  <td className="w-1/4 p-1.5 font-bold border-r border-black bg-gray-50">Araç Plakası / Firma</td>
                  <td className="w-1/4 p-1.5 font-semibold">{data.vehiclePlate || '-'} ({data.transportCompany || 'Firma Belirtilmedi'})</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1.5 font-bold border-r border-black bg-gray-50">Sürücü Adı & Tel</td>
                  <td className="p-1.5 border-r border-black">{data.driverName || '-'} / {data.driverPhone || '-'}</td>
                  <td className="p-1.5 font-bold border-r border-black bg-gray-50">Hareket / Dönüş Yeri</td>
                  <td className="p-1.5">{data.departureLocation} - {data.returnLocation}</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold border-r border-black bg-gray-50">Seyahat Güzergâhı</td>
                  <td colSpan={3} className="p-1.5">{data.travelRoute || 'Okul -> Gezi Alanı -> Okul'}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* TABLO 4: GÖREVLİ KAFİLE VE ÖĞRETMEN LİSTESİ */}
      <div className="border border-black mb-3 text-xs page-break-inside-avoid">
        <div className="bg-gray-100 font-bold px-2 py-1 border-b border-black text-[11px] uppercase flex justify-between">
          <span>4. Görevli Kafile Listesi (Yönetici, Öğretmen ve Refakatçiler)</span>
          <span className="text-[10px] font-normal lowercase">toplam: {1 + data.teachers.length + data.companions.length} görevli</span>
        </div>
        <table className="w-full border-collapse text-center">
          <thead>
            <tr className="border-b border-black bg-gray-50 font-bold text-[11px]">
              <th className="p-1 border-r border-black w-8">S.N</th>
              <th className="p-1 border-r border-black text-left pl-2">Adı Soyadı</th>
              <th className="p-1 border-r border-black w-40">Branşı / Sınıfı</th>
              <th className="p-1 border-r border-black w-36">Görevi</th>
              <th className="p-1 border-r border-black w-32">İletişim Tel</th>
              <th className="p-1 w-20">İmza</th>
            </tr>
          </thead>
          <tbody>
            {/* Kafile Başkanı */}
            <tr className="border-b border-black font-semibold">
              <td className="p-1 border-r border-black">1</td>
              <td className="p-1 border-r border-black text-left pl-2">{data.headTeacher.fullName || '................................'}</td>
              <td className="p-1 border-r border-black">{data.headTeacher.branch}</td>
              <td className="p-1 border-r border-black text-red-900 font-bold">Kafile Başkanı</td>
              <td className="p-1 border-r border-black">{data.headTeacher.phone}</td>
              <td className="p-1"></td>
            </tr>

            {/* Görevli Öğretmenler */}
            {data.teachers.map((teacher, idx) => (
              <tr key={teacher.id} className="border-b border-black">
                <td className="p-1 border-r border-black">{idx + 2}</td>
                <td className="p-1 border-r border-black text-left pl-2">{teacher.fullName || '................................'}</td>
                <td className="p-1 border-r border-black">{teacher.branch}</td>
                <td className="p-1 border-r border-black">{teacher.role}</td>
                <td className="p-1 border-r border-black">{teacher.phone}</td>
                <td className="p-1"></td>
              </tr>
            ))}

            {/* Veli Refakatçiler */}
            {data.companions.map((comp, idx) => (
              <tr key={comp.id} className="border-b border-black text-gray-700">
                <td className="p-1 border-r border-black">{1 + data.teachers.length + idx + 1}</td>
                <td className="p-1 border-r border-black text-left pl-2">{comp.fullName || '................................'}</td>
                <td className="p-1 border-r border-black">Veli</td>
                <td className="p-1 border-r border-black">{comp.role}</td>
                <td className="p-1 border-r border-black">{comp.phone}</td>
                <td className="p-1"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TABLO 5: ZAMAN AKIŞ ÇİZELGESİ */}
      <div className="border border-black mb-3 text-xs page-break-inside-avoid">
        <div className="bg-gray-100 font-bold px-2 py-1 border-b border-black text-[11px] uppercase">
          5. Gezi Zaman Akış Çizelgesi
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-black bg-gray-50 font-bold text-[11px]">
              <th className="p-1 border-r border-black w-24 text-center">Saat Aralığı</th>
              <th className="p-1 border-r border-black text-left pl-2">Yapılacak Etkinlik / Uygulama Aşaması</th>
              <th className="p-1 border-r border-black w-36 text-center">Mekân / Bölüm</th>
              <th className="p-1 w-36 text-center">Sorumlular</th>
            </tr>
          </thead>
          <tbody>
            {data.schedule.map((item) => (
              <tr key={item.id} className="border-b border-black">
                <td className="p-1 border-r border-black text-center font-bold">{item.timeRange}</td>
                <td className="p-1 border-r border-black pl-2">{item.activity}</td>
                <td className="p-1 border-r border-black text-center">{item.location}</td>
                <td className="p-1 text-center">{item.responsible}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TABLO 6: DEĞERLENDİRME VE GÜVENLİK NOTLARI */}
      <div className="border border-black mb-6 text-xs page-break-inside-avoid">
        <div className="bg-gray-100 font-bold px-2 py-1 border-b border-black text-[11px] uppercase">
          6. Süreç Değerlendirme & Güvenlik Önlemleri
        </div>
        <table className="w-full border-collapse">
          <tbody>
            <tr className="border-b border-black">
              <td className="w-1/4 p-1.5 font-bold border-r border-black bg-gray-50">Gezi Öncesi</td>
              <td className="p-1.5">{data.preTripNotes}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-1.5 font-bold border-r border-black bg-gray-50">Gezi Sırasında</td>
              <td className="p-1.5">{data.duringTripNotes}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-1.5 font-bold border-r border-black bg-gray-50">Gezi Sonrasında</td>
              <td className="p-1.5">{data.postTripNotes}</td>
            </tr>
            <tr>
              <td className="p-1.5 font-bold border-r border-black bg-gray-50">Güvenlik / İlkyardım</td>
              <td className="p-1.5">{data.safetyMeasures}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ===================== RESMİ ONAY VE İMZA KUTULARI ===================== */}
      <div className="border-2 border-black p-3 page-break-inside-avoid">
        <div className="text-center font-bold text-xs uppercase mb-3">
          İNCELEME VE ONAY BÖLÜMÜ
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          
          {/* Düzenleyen */}
          <div className="border border-black p-2 flex flex-col justify-between min-h-[110px]">
            <div>
              <p className="font-bold">DÜZENLEYEN</p>
              <p className="text-[11px] text-gray-700 mt-1">{data.headTeacher.fullName || '................................'}</p>
              <p className="text-[10px] text-gray-600">Gezi Kulübü / Kafile Başkanı</p>
            </div>
            <p className="text-[11px] italic mt-4">İmza</p>
          </div>

          {/* İnceleyen */}
          <div className="border border-black p-2 flex flex-col justify-between min-h-[110px]">
            <div>
              <p className="font-bold">İNCELENDİ</p>
              <p className="text-[11px] text-gray-700 mt-1">{data.deputyPrincipalName || '................................'}</p>
              <p className="text-[10px] text-gray-600">Sosyal Etkinlikler Kurulu Bşk. (Müdür Yrd.)</p>
            </div>
            <p className="text-[11px] italic mt-4">İmza</p>
          </div>

          {/* Onaylayan (Okul Müdürü) */}
          <div className="border-2 border-black p-2 flex flex-col justify-between min-h-[110px] bg-gray-50">
            <div>
              <p className="font-extrabold text-[13px]">UYGUNDUR / OLUR</p>
              <p className="text-[10px] text-gray-600">..../..../202...</p>
              <p className="text-[11px] font-bold text-black mt-1">{data.principalName || '................................'}</p>
              <p className="text-[10px] text-gray-700">Okul Müdürü</p>
            </div>
            <p className="text-[11px] italic mt-4">Mühür - İmza</p>
          </div>

        </div>

        {/* İl Dışı Geziler için Mülki İdare Onayı Notu */}
        {data.tripType === 'İl Dışı' && (
          <div className="mt-3 pt-2 border-t border-black text-center text-[10px] italic">
            * İl Dışı Gezilerde İlçe Millî Eğitim Müdürlüğü / Kaymakamlık Makam Oluru ayrıca alınacaktır.
          </div>
        )}
      </div>

    </div>
  );
};
