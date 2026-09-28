export interface CurriculumItem {
  id: string;
  grade: string; // 'Okul Öncesi (Anasınıfı)' | '1. Sınıf' | '2. Sınıf' | '3. Sınıf' | '4. Sınıf'
  modelType: 'Türkiye Yüzyılı Maarif Modeli' | 'MEB Öğretim Programı (Mevcut)';
  lessons: {
    name: string;
    topics: {
      title: string;
      outcomes: {
        code: string;
        text: string;
      }[];
    }[];
  }[];
}

export const CURRICULUM_DATA: CurriculumItem[] = [
  // 1. OKUL ÖNCESİ (ANASINIFI) - MAARİF MODELİ
  {
    id: 'grade-preschool',
    grade: 'Okul Öncesi (Anasınıfı)',
    modelType: 'Türkiye Yüzyılı Maarif Modeli',
    lessons: [
      {
        name: 'Doğa, Çevre ve Yaşam Becerileri',
        topics: [
          {
            title: 'Doğa ve Canlılar / Çevre Bilinci',
            outcomes: [
              { code: 'OÖ.ÖÇ.1', text: 'OÖ.ÖÇ.1. Doğadaki canlı ve cansız varlıkların özelliklerini yerinde gözlemler ve betimler.' },
              { code: 'OÖ.ÖÇ.2', text: 'OÖ.ÖÇ.2. Çevresindeki doğal ve kültürel varlıkları korumaya istekli olur ve saygı gösterir.' },
              { code: 'OÖ.ÖÇ.3', text: 'OÖ.ÖÇ.3. Çevreye karşı duyarlı davranışlar sergiler, atıkların ayrıştırılması ve geri dönüşümün önemini fark eder.' },
              { code: 'OÖ.ÖÇ.4', text: 'OÖ.ÖÇ.4. Doğal olayları, mevsim geçişlerini ve bitkilerin gelişim evrelerini açık alanda inceler.' }
            ]
          },
          {
            title: 'Kültürel Miras ve Sanat Alanları',
            outcomes: [
              { code: 'OÖ.ÖÇ.5', text: 'OÖ.ÖÇ.5. Müze, sergi, tiyatro ve sanat atölyesi gibi okul dışı ortamlarda kurallara uygun hareket eder.' },
              { code: 'OÖ.ÖÇ.6', text: 'OÖ.ÖÇ.6. Kültürel ögeleri, tarihi objeleri ve sanat eserlerini merakla inceler ve sorular sorar.' },
              { code: 'OÖ.ÖÇ.7', text: 'OÖ.ÖÇ.7. Ziyaret ettiği ortamdaki gözlemlerini çizim, kil, drama ve anlatım yoluyla ifade eder.' }
            ]
          },
          {
            title: 'Sosyal Kurallar ve Güvenlik',
            outcomes: [
              { code: 'OÖ.ÖÇ.8', text: 'OÖ.ÖÇ.8. Grup etkinliklerinde ve gezi süresince öğretmen ve refakatçilerin yönergelerine uyar.' },
              { code: 'OÖ.ÖÇ.9', text: 'OÖ.ÖÇ.9. Toplu taşıma ve servis araçlarında güvenlik kurallarına (emniyet kemeri, düzenli iniş-biniş) uyar.' },
              { code: 'OÖ.ÖÇ.10', text: 'OÖ.ÖÇ.10. Ortak kullanım alanlarında nezaket ve sıra bekleme kurallarını uygular.' }
            ]
          }
        ]
      }
    ]
  },

  // 2. 1. SINIF - MAARİF MODELİ
  {
    id: 'grade-1',
    grade: '1. Sınıf',
    modelType: 'Türkiye Yüzyılı Maarif Modeli',
    lessons: [
      {
        name: 'Hayat Bilgisi (Maarif Modeli)',
        topics: [
          {
            title: 'Okulumuzda Hayat ve Yakın Çevremiz',
            outcomes: [
              { code: 'HB.1.1.ÖÇ1', text: 'HB.1.1.ÖÇ1. Okul dışı öğrenme ortamlarında güvenlik, nezaket ve grup içi iş birliği kurallarına uyar.' },
              { code: 'HB.1.1.ÖÇ2', text: 'HB.1.1.ÖÇ2. Okulunun yakın çevresinde bulunan kamu kurumlarını, sosyal ve kültürel mekânları tanır.' },
              { code: 'HB.1.1.ÖÇ3', text: 'HB.1.1.ÖÇ3. Ortak yaşam alanlarında çevre temizliğine ve kurallara özen gösterir.' }
            ]
          },
          {
            title: 'Doğada Hayat ve Çevre Bilinci',
            outcomes: [
              { code: 'HB.1.6.ÖÇ1', text: 'HB.1.6.ÖÇ1. Çevresindeki hayvanları, bitkileri ve doğal yaşam alanlarını yerinde gözlemleyerek ayırt eder.' },
              { code: 'HB.1.6.ÖÇ2', text: 'HB.1.6.ÖÇ2. Doğadaki canlıların yaşam döngüsüne ve korunmasına katkı sağlayan davranışlar sergiler.' },
              { code: 'HB.1.6.ÖÇ3', text: 'HB.1.6.ÖÇ3. Mevsimlerin canlılar ve çevre üzerindeki etkilerini açık havada gözlemler.' }
            ]
          },
          {
            title: 'Ülkemizi Tanıyoruz ve Kültürel Değerlerimiz',
            outcomes: [
              { code: 'HB.1.5.ÖÇ1', text: 'HB.1.5.ÖÇ1. Yaşadığı çevredeki tarihi yapıları, anıtları ve müzeleri keşfeder.' },
              { code: 'HB.1.5.ÖÇ2', text: 'HB.1.5.ÖÇ2. Millî gün, bayram ve kültürel değerlerle ilişkili mekânların anlamını kavrar.' }
            ]
          }
        ]
      },
      {
        name: 'Türkçe (Maarif Modeli)',
        topics: [
          {
            title: 'Dinleme, İzleme ve Sözlü İletişim',
            outcomes: [
              { code: 'T.1.D.ÖÇ1', text: 'T.1.D.ÖÇ1. Gezi alanındaki rehber ve uzmanların açıklamalarını dikkatle dinler ve sorular sorar.' },
              { code: 'T.1.K.ÖÇ2', text: 'T.1.K.ÖÇ2. Okul dışı öğrenme ortamında edindiği gözlem ve deneyimleri sınıfta sözlü olarak aktarır.' }
            ]
          }
        ]
      },
      {
        name: 'Görsel Sanatlar & Müzik',
        topics: [
          {
            title: 'Görsel Kültür ve Estetik Keşif',
            outcomes: [
              { code: 'GS.1.ÖÇ1', text: 'GS.1.ÖÇ1. Müze ve sergilerdeki görsel biçimleri, renkleri ve sanat nesnelerini inceler.' },
              { code: 'GS.1.ÖÇ2', text: 'GS.1.ÖÇ2. Gezi sonrasında gözlemlerine dayalı özgün çizim ve görsel kompozisyonlar oluşturur.' }
            ]
          }
        ]
      }
    ]
  },

  // 3. 2. SINIF - MAARİF MODELİ
  {
    id: 'grade-2',
    grade: '2. Sınıf',
    modelType: 'Türkiye Yüzyılı Maarif Modeli',
    lessons: [
      {
        name: 'Hayat Bilgisi (Maarif Modeli)',
        topics: [
          {
            title: 'Yaşadığımız Çevre ve Kültürel Zenginliklerimiz',
            outcomes: [
              { code: 'HB.2.5.ÖÇ1', text: 'HB.2.5.ÖÇ1. Yaşadığı yerleşim birimindeki tarihi, turistik ve kültürel mekânları araştırır ve yerinde inceler.' },
              { code: 'HB.2.5.ÖÇ2', text: 'HB.2.5.ÖÇ2. Millî kültürümüzü yansıtan el sanatları, tarihi eserler ve mimari yapıların önemini fark eder.' },
              { code: 'HB.2.5.ÖÇ3', text: 'HB.2.5.ÖÇ3. Atatürk\'ün hayatı ve millî mücadele dönemiyle ilgili mekânları ziyaret ederek tarih bilinci kazanır.' }
            ]
          },
          {
            title: 'Doğada Hayat ve Çevre Duyarlılığı',
            outcomes: [
              { code: 'HB.2.6.ÖÇ1', text: 'HB.2.6.ÖÇ1. Bitkilerin ve hayvanların yaşam alanlarındaki çeşitliliği botanik bahçesi/tabiat parkında gözlemler.' },
              { code: 'HB.2.6.ÖÇ2', text: 'HB.2.6.ÖÇ2. Su, toprak ve havanın canlılar için önemini yerinde analiz eder; çevre kirliliğini önleyici tedbirler geliştirir.' },
              { code: 'HB.2.6.ÖÇ3', text: 'HB.2.6.ÖÇ3. Geri dönüşüm, sıfır atık ve sürdürülebilirlik uygulamalarını üretim/geri dönüşüm tesislerinde inceler.' }
            ]
          },
          {
            title: 'Güvenli Hayat ve Toplu Yaşam Becerileri',
            outcomes: [
              { code: 'HB.2.4.ÖÇ1', text: 'HB.2.4.ÖÇ1. Gezi esnasında servis, toplu taşıma, yaya geçidi ve trafik kurallarına titizlikle uyar.' },
              { code: 'HB.2.4.ÖÇ2', text: 'HB.2.4.ÖÇ2. Acil durumlarda (kaybolma, sağlık sorunu) görevli öğretmen ve yetkililere başvurma becerisi sergiler.' }
            ]
          }
        ]
      },
      {
        name: 'Türkçe & Sosyal Beceriler',
        topics: [
          {
            title: 'Gözlem, Anlatım ve Yazılı Yansıtma',
            outcomes: [
              { code: 'T.2.ÖÇ1', text: 'T.2.ÖÇ1. Gezi sırasında gördüğü nesneleri, süreçleri ve mekânları tanıtan kısa notlar ve çalışma kağıtları doldurur.' },
              { code: 'T.2.ÖÇ2', text: 'T.2.ÖÇ2. Gezi deneyimini duygularını ve çıkarımlarını içerecek şekilde cümlelerle ifade eder.' }
            ]
          }
        ]
      }
    ]
  },

  // 4. 3. SINIF - MAARİF MODELİ
  {
    id: 'grade-3',
    grade: '3. Sınıf',
    modelType: 'Türkiye Yüzyılı Maarif Modeli',
    lessons: [
      {
        name: 'Hayat Bilgisi (Maarif Modeli)',
        topics: [
          {
            title: 'Ülkemizde Hayat ve Kültürel Miras',
            outcomes: [
              { code: 'HB.3.5.ÖÇ1', text: 'HB.3.5.ÖÇ1. Ülkemizin farklı bölgelerine ve yaşadığı ile ait tarihi, kültürel ve doğal zenginlikleri yerinde inceler.' },
              { code: 'HB.3.5.ÖÇ2', text: 'HB.3.5.ÖÇ2. Müzelerin, ören yerlerinin ve kütüphanelerin toplumsal hafıza ve eğitimdeki yerini kavrar.' },
              { code: 'HB.3.5.ÖÇ3', text: 'HB.3.5.ÖÇ3. Millî birlik ve dayanışmayı pekiştiren tarihi olayların gerçekleştiği mekânların önemini fark eder.' }
            ]
          },
          {
            title: 'Doğada Hayat, Canlılar ve Çevre',
            outcomes: [
              { code: 'HB.3.6.ÖÇ1', text: 'HB.3.6.ÖÇ1. Doğal anıtları, milli parkları ve koruma altındaki biyolojik türleri yerinde tanır.' },
              { code: 'HB.3.6.ÖÇ2', text: 'HB.3.6.ÖÇ2. İnsan faaliyetlerinin doğal çevre üzerindeki olumlu ve olumsuz etkilerini gözlemler ve çözüm önerileri sunar.' }
            ]
          }
        ]
      },
      {
        name: 'Fen Bilimleri (Maarif Modeli)',
        topics: [
          {
            title: 'Gezegenimizi Tanıyalım & Canlılar Dünyasına Yolculuk',
            outcomes: [
              { code: 'FB.3.1.ÖÇ1', text: 'FB.3.1.ÖÇ1. Dünya\'nın katmanlarını, kayaçları, mineralleri ve fosil oluşumunu tabiat tarihi müzesinde inceler.' },
              { code: 'FB.3.3.ÖÇ2', text: 'FB.3.3.ÖÇ2. Canlıların yaşam alanlarını ve çevresel uyumlarını doğal ortamlarında gözlemler.' },
              { code: 'FB.3.4.ÖÇ1', text: 'FB.3.4.ÖÇ1. Geçmişte ve günümüzde kullanılan teknolojik ürünleri bilim merkezinde deney düzenekleriyle keşfeder.' },
              { code: 'FB.3.5.ÖÇ3', text: 'FB.3.5.ÖÇ3. Ses ve ışık kaynaklarının teknolojideki kullanımını interaktif sergilerde deneyimler.' }
            ]
          }
        ]
      },
      {
        name: 'Görsel Sanatlar & Drama',
        topics: [
          {
            title: 'Müze Eğitimi ve Yaratıcı Yansıtma',
            outcomes: [
              { code: 'GS.3.ÖÇ1', text: 'GS.3.ÖÇ1. Sanat eserlerindeki anlatım tekniklerini, kompozisyon ögelerini ve malzeme çeşitliliğini analiz eder.' },
              { code: 'GS.3.ÖÇ2', text: 'GS.3.ÖÇ2. Gezi sonrasında gözlemlerinden ilham alarak bireysel veya grup halinde okul panosu / sergi hazırlar.' }
            ]
          }
        ]
      }
    ]
  },

  // 5. 4. SINIF - ESKİ / MEVCUT MEB ÖĞRETİM PROGRAMI
  {
    id: 'grade-4',
    grade: '4. Sınıf',
    modelType: 'MEB Öğretim Programı (Mevcut)',
    lessons: [
      {
        name: 'Sosyal Bilgiler (4. Sınıf)',
        topics: [
          {
            title: 'Kültür ve Miras',
            outcomes: [
              { code: 'SB.4.2.1.', text: 'SB.4.2.1. Sözlü, yazılı, görsel kaynaklar ve nesnelerden yararlanarak ailesinin ve çevresinin tarihini oluşturur.' },
              { code: 'SB.4.2.2.', text: 'SB.4.2.2. Yaşadığı yerdeki tarihi mekânları, anıtları ve nesneleri inceleyerek millî kültür ögelerini fark eder.' },
              { code: 'SB.4.2.3.', text: 'SB.4.2.3. Geleneksel çocuk oyunları, el sanatları ve halk kültürüne ait ögeleri müze ortamında somutlaştırır.' },
              { code: 'SB.4.2.4.', text: 'SB.4.2.4. Millî Mücadele kahramanlarının hayatlarından ve savaş alanlarından hareketle Millî Mücadele\'nin önemini kavrar.' }
            ]
          },
          {
            title: 'İnsanlar, Yerler ve Çevreler',
            outcomes: [
              { code: 'SB.4.3.1.', text: 'SB.4.3.1. Çevresindeki herhangi bir yerin konumu ile ilgili çıkarımlarda bulunur ve yön bulma araçlarını yerinde kullanır.' },
              { code: 'SB.4.3.2.', text: 'SB.4.3.2. Çevresinde meydana gelen hava olaylarını ve mevsimsel değişimleri gözlemleyerek bulgularını kaydeder.' },
              { code: 'SB.4.3.3.', text: 'SB.4.3.3. Yaşadığı çevredeki doğal ve beşerî unsurları ayırt eder.' },
              { code: 'SB.4.3.4.', text: 'SB.4.3.4. Doğal afetlere karşı alınması gereken önlemleri afete hazırlık merkezlerinde yerinde öğrenir.' }
            ]
          },
          {
            title: 'Bilim, Teknoloji ve Toplum',
            outcomes: [
              { code: 'SB.4.4.1.', text: 'SB.4.4.1. Teknolojik ürünlerin geçmişteki ve bugünkü kullanımlarını bilim müzesinde karşılaştırır.' },
              { code: 'SB.4.4.2.', text: 'SB.4.4.2. Teknolojik ürünlerin hayatımızda ve çevremizde meydana getirdiği değişimleri inceler.' },
              { code: 'SB.4.4.3.', text: 'SB.4.4.3. Mucitlerin ve bilim insanlarının insanlığa katkılarını keşfeder.' }
            ]
          },
          {
            title: 'Üretim, Dağıtım ve Tüketim',
            outcomes: [
              { code: 'SB.4.5.1.', text: 'SB.4.5.1. Yaşadığı yerdeki ekonomik faaliyetleri ve meslekleri üretim tesislerinde/atölyelerde inceler.' },
              { code: 'SB.4.5.2.', text: 'SB.4.5.2. Bilinçli bir tüketici olarak kaynakların tasarruflu kullanımı ve geri dönüşüm süreçlerini gözlemler.' }
            ]
          }
        ]
      },
      {
        name: 'Fen Bilimleri (4. Sınıf)',
        topics: [
          {
            title: 'Yer Kabuğu ve Dünyamızın Hareketleri',
            outcomes: [
              { code: 'F.4.1.1.1.', text: 'F.4.1.1.1. Yer kabuğunun kayaçlardan oluştuğunu fark eder ve kayaçlarla madenleri ilişkilendirir.' },
              { code: 'F.4.1.1.2.', text: 'F.4.1.1.2. Fosillerin oluşumunu ve geçmiş jeolojik dönemlere ait canlı izlerini tabiat müzesinde inceler.' },
              { code: 'F.4.1.2.1.', text: 'F.4.1.2.1. Dünya\'nın dönme ve dolanma hareketleri arasındaki farkı planetaryum veya rasathanede kavrar.' }
            ]
          },
          {
            title: 'Kuvvetin Etkileri ve Basit Makineler',
            outcomes: [
              { code: 'F.4.3.1.1.', text: 'F.4.3.1.1. Kuvvetin cisimlerin hareket ve şekilleri üzerindeki etkilerini deney düzeneklerinde gözlemler.' },
              { code: 'F.4.3.2.1.', text: 'F.4.3.2.1. Mıknatısların özelliklerini ve kullanım alanlarını bilim atölyelerinde test eder.' }
            ]
          },
          {
            title: 'Aydınlatma ve Ses Teknolojileri',
            outcomes: [
              { code: 'F.4.5.1.1.', text: 'F.4.5.1.1. Geçmişten günümüze aydınlatma teknolojilerini ve gelişimini karşılaştırır.' },
              { code: 'F.4.5.3.1.', text: 'F.4.5.3.1. Ses kirliliğinin insan ve çevre sağlığı üzerindeki olumsuz etkilerini değerlendirir.' }
            ]
          },
          {
            title: 'İnsan ve Çevre',
            outcomes: [
              { code: 'F.4.6.1.1.', text: 'F.4.6.1.1. İnsan ve çevre arasındaki karşılıklı etkileşimin önemini kavrar; doğayı korumaya yönelik çözümler üretir.' }
            ]
          }
        ]
      },
      {
        name: 'Trafik Güvenliği (4. Sınıf)',
        topics: [
          {
            title: 'Trafikte Güvenlik ve Kurallar',
            outcomes: [
              { code: 'TG.4.1.1.', text: 'TG.4.1.1. Trafik işaret ve levhalarının anlamlarını ve önemini trafik eğitim parkında yerinde uygular.' },
              { code: 'TG.4.1.2.', text: 'TG.4.1.2. Toplu taşıma araçlarına biniş, iniş ve seyahat esnasında uyulması gereken güvenlik kurallarını sergiler.' },
              { code: 'TG.4.1.3.', text: 'TG.4.1.3. Emniyet kemeri ve güvenlik ekipmanlarının can güvenliğindeki rolünü fark eder.' }
            ]
          }
        ]
      },
      {
        name: 'İnsan Hakları, Yurttaşlık ve Demokrasi (4. Sınıf)',
        topics: [
          {
            title: 'Birlikte Yaşama ve Ortak Miras',
            outcomes: [
              { code: 'İHYD.4.4.1.', text: 'İHYD.4.4.1. Ortak yaşam alanlarının korunması ve temiz tutulması konusunda sorumluluk üstlenir.' },
              { code: 'İHYD.4.4.2.', text: 'İHYD.4.4.2. Toplumsal kuralların ve nezaketin kamusal mekanlardaki gerekliliğini savunur.' }
            ]
          }
        ]
      },
      {
        name: 'Görsel Sanatlar & Müzik (4. Sınıf)',
        topics: [
          {
            title: 'Sanat Eleştirisi ve Müze Kültürü',
            outcomes: [
              { code: 'G.4.1.1.', text: 'G.4.1.1. Müze, ören yeri, sanat galerisi vb. mekanları ziyaret ederek eserleri biçim, renk ve doku yönünden inceler.' },
              { code: 'G.4.1.2.', text: 'G.4.1.2. Ziyaret ettiği sanat ortamından edindiği izlenimleri görsel sanat çalışmasına yansıtır.' }
            ]
          }
        ]
      }
    ]
  }
];
