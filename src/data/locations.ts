import type { PresetLocation } from '../types';

export const TURKISH_CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin',
  'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa',
  'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan',
  'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta',
  'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
  'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla',
  'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt',
  'Sinop', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak',
  'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman',
  'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
];

export const CATEGORIES = [
  'Müze',
  'Bilim Merkezi / Rasathane',
  'Tarihi Alan / Saray / Kale',
  'Tabiat Parkı / Doğa / Botanik',
  'Kütüphane / Arşiv',
  'Sanat Galerisi / Tiyatro / Kültür Merkezi',
  'Üniversite / Teknokent / Laboratuvar',
  'Kamu Kurumu / Fabrika / Üretim Tesisi',
  'Diğer / Liste Dışı Özel Mekân'
];

export const PRESET_LOCATIONS: PresetLocation[] = [
  // İstanbul
  {
    id: 'ist-1',
    city: 'İstanbul',
    category: 'Müze',
    name: 'Rahmi M. Koç Müzesi',
    address: 'Hasköy Cad. No:5 Hasköy, Beyoğlu / İstanbul',
    description: 'Sanayi, ulaşım, iletişim ve bilim tarihi koleksiyonları ve interaktif deney atölyeleri.',
    suitableGrades: 'Tüm Sınıflar (1-12)',
    suggestedCourses: 'Fen Bilimleri, Sosyal Bilgiler, Hayat Bilgisi, Teknoloji ve Tasarım'
  },
  {
    id: 'ist-2',
    city: 'İstanbul',
    category: 'Tarihi Alan / Saray / Kale',
    name: 'Topkapı Sarayı Müzesi',
    address: 'Cankurtaran Mah. Fatih / İstanbul',
    description: 'Osmanlı İmparatorluğu yönetim merkezi, kutsal emanetler ve tarihi köşkler.',
    suitableGrades: '3, 4, 5, 6, 7, 8, 9, 10, 11, 12. Sınıflar',
    suggestedCourses: 'Sosyal Bilgiler, Tarih, Türkçe, Görsel Sanatlar'
  },
  {
    id: 'ist-3',
    city: 'İstanbul',
    category: 'Bilim Merkezi / Rasathane',
    name: 'Üsküdar Bilim Merkezi (Bilim Üsküdar)',
    address: 'Ünalan Mah. Mahmut Gazi Cad. No:1 Üsküdar / İstanbul',
    description: 'Astronomi ve uzay salonu, doğa bilimleri, matematik ve robotik atölyeleri.',
    suitableGrades: 'İlkokul ve Ortaokul (1-8. Sınıflar)',
    suggestedCourses: 'Fen Bilimleri, Matematik, Bilişim Teknolojileri'
  },
  {
    id: 'ist-4',
    city: 'İstanbul',
    category: 'Müze',
    name: 'İstanbul Arkeoloji Müzeleri',
    address: 'Osman Hamdi Bey Yokuşu, Gülhane / Fatih / İstanbul',
    description: 'Antik çağ eserleri, İskender Lahdi ve Mezopotamya tarihi.',
    suitableGrades: '4, 5, 6, 7, 8, Lise',
    suggestedCourses: 'Sosyal Bilgiler, Tarih, Görsel Sanatlar'
  },
  {
    id: 'ist-5',
    city: 'İstanbul',
    category: 'Tarihi Alan / Saray / Kale',
    name: 'Dolmabahçe Sarayı',
    address: 'Vişnezade Mah. Dolmabahçe Cad. Beşiktaş / İstanbul',
    description: 'Son dönem Osmanlı saray mimarisi ve Atatürk’ün ebediyete intikal ettiği mekan.',
    suitableGrades: 'Tüm Sınıflar',
    suggestedCourses: 'Sosyal Bilgiler, T.C. İnkılap Tarihi ve Atatürkçülük, Hayat Bilgisi'
  },
  {
    id: 'ist-6',
    city: 'İstanbul',
    category: 'Tabiat Parkı / Doğa / Botanik',
    name: 'Nezahat Gökyiğit Botanik Bahçesi (NGBB)',
    address: 'Ataşehir / İstanbul',
    description: 'Zengin bitki çeşitliliği, kurakçıl bitkiler alanı, keşif patikaları.',
    suitableGrades: 'Okul Öncesi, İlkokul, Ortaokul',
    suggestedCourses: 'Fen Bilimleri, Hayat Bilgisi, Biyoloji'
  },
  {
    id: 'ist-7',
    city: 'İstanbul',
    category: 'Müze',
    name: 'Panorama 1453 Tarih Müzesi',
    address: 'Merkezefendi Mah. Topkapı Kültür Parkı İçi, Zeytinburnu / İstanbul',
    description: 'İstanbul\'un fethinin 3 boyutlu ses ve kubbe görselleriyle anlatımı.',
    suitableGrades: '3, 4, 5, 6, 7, 8. Sınıflar',
    suggestedCourses: 'Sosyal Bilgiler, Tarih'
  },
  {
    id: 'ist-8',
    city: 'İstanbul',
    category: 'Kütüphane / Arşiv',
    name: 'Rami Kütüphanesi',
    address: 'Yeni Mah. Rami Kışla Cad. Eyüpsultan / İstanbul',
    description: 'Türkiye\'nin en büyük kütüphane komplekslerinden biri, çocuk kütüphanesi ve atölyeler.',
    suitableGrades: 'Tüm Sınıflar',
    suggestedCourses: 'Türkçe, Edebiyat, Araştırma ve Bilgi Becerileri'
  },
  {
    id: 'ist-9',
    city: 'İstanbul',
    category: 'Tabiat Parkı / Doğa / Botanik',
    name: 'Atatürk Arboretumu',
    address: 'Kemer Mah. Bahçeköy, Sarıyer / İstanbul',
    description: 'Canlı ağaç müzesi, göletler ve mevsimsel doğa gözlem alanı.',
    suitableGrades: 'Tüm Sınıflar',
    suggestedCourses: 'Fen Bilimleri, Çevre Eğitimi, Hayat Bilgisi'
  },
  {
    id: 'ist-10',
    city: 'İstanbul',
    category: 'Müze',
    name: 'Havacılık Müzesi (Yeşilköy)',
    address: 'Yeşilköy Mah. Bakırköy / İstanbul',
    description: 'Türk Hava Kuvvetleri uçakları, helikopterler ve havacılık tarihi.',
    suitableGrades: 'Tüm Sınıflar',
    suggestedCourses: 'Fen Bilimleri, Sosyal Bilgiler, Fizik'
  },

  // Ankara
  {
    id: 'ank-1',
    city: 'Ankara',
    category: 'Tarihi Alan / Saray / Kale',
    name: 'Anıtkabir ve Atatürk ve Kurtuluş Savaşı Müzesi',
    address: 'Anıttepe, Çankaya / Ankara',
    description: 'Gazi Mustafa Kemal Atatürk\'ün ebedi istirahatgahı, milli mücadele panoramaları.',
    suitableGrades: 'Tüm Sınıflar',
    suggestedCourses: 'T.C. İnkılap Tarihi, Sosyal Bilgiler, Hayat Bilgisi, Tarih'
  },
  {
    id: 'ank-2',
    city: 'Ankara',
    category: 'Tarihi Alan / Saray / Kale',
    name: 'I. ve II. TBMM Kurtuluş Savaşı ve Cumhuriyet Müzeleri',
    address: 'Ulus Meydanı, Altındağ / Ankara',
    description: 'Cumhuriyetin ilan edildiği tarihi meclis binaları ve meclis zabıtları.',
    suitableGrades: '3. Sınıftan İtibaren Tüm Kademeler',
    suggestedCourses: 'Sosyal Bilgiler, T.C. İnkılap Tarihi, Tarih'
  },
  {
    id: 'ank-3',
    city: 'Ankara',
    category: 'Müze',
    name: 'Anadolu Medeniyetleri Müzesi',
    address: 'Kale Mah. Gözcü Sok. No:2 Ulus, Altındağ / Ankara',
    description: 'Paleolitik çağdan günümüze Anadolu tarihi, Çatalhöyük ve Hitit eserleri.',
    suitableGrades: '4, 5, 6, 7, 8, 9, 10, 11, 12. Sınıflar',
    suggestedCourses: 'Sosyal Bilgiler, Tarih, Görsel Sanatlar'
  },
  {
    id: 'ank-4',
    city: 'Ankara',
    category: 'Müze',
    name: 'MTA Şehit Cuma Dağ Tabiat Tarihi Müzesi',
    address: 'Üniversiteler Mah. Dumlupınar Bulvarı No:139 Çankaya / Ankara',
    description: 'Dinozor iskeletleri, fosiller, madenler, taşlar ve uzay kubbesi.',
    suitableGrades: 'Tüm Sınıflar',
    suggestedCourses: 'Fen Bilimleri, Coğrafya, Biyoloji, Hayat Bilgisi'
  },
  {
    id: 'ank-5',
    city: 'Ankara',
    category: 'Bilim Merkezi / Rasathane',
    name: 'Ali Kuşçu Gökbilim Merkezi',
    address: 'Mamak / Ankara',
    description: 'Planetaryum gösterileri, astronot simülasyonları ve robotik kodlama.',
    suitableGrades: '1-8. Sınıflar',
    suggestedCourses: 'Fen Bilimleri, Astronomi, Bilişim Teknolojileri'
  },
  {
    id: 'ank-6',
    city: 'Ankara',
    category: 'Kütüphane / Arşiv',
    name: 'Cumhurbaşkanlığı Millet Kütüphanesi',
    address: 'Cumhurbaşkanlığı Külliyesi, Beştepe / Ankara',
    description: 'Selçuklu ve Nasreddin Hoca Çocuk Kütüphaneleri, teknoloji atölyeleri.',
    suitableGrades: 'Tüm Sınıflar',
    suggestedCourses: 'Türkçe, Edebiyat, Sosyal Bilimler'
  },

  // İzmir
  {
    id: 'izm-1',
    city: 'İzmir',
    category: 'Tarihi Alan / Saray / Kale',
    name: 'Efes Antik Kenti ve Müzesi',
    address: 'Selçuk / İzmir',
    description: 'Celsus Kütüphanesi, Antik Tiyatro, Yamaç Evler ve Arkeoloji Müzesi.',
    suitableGrades: '4. Sınıf ve Üzeri',
    suggestedCourses: 'Sosyal Bilgiler, Tarih, Felsefe'
  },
  {
    id: 'izm-2',
    city: 'İzmir',
    category: 'Bilim Merkezi / Rasathane',
    name: 'Uzay Kampı Türkiye (Space Camp Turkey)',
    address: 'Ege Serbest Bölgesi, Gaziemir / İzmir',
    description: 'Uzay mekiği simülatörü, astronot eğitim donanımları ve astronomi.',
    suitableGrades: '3-12. Sınıflar',
    suggestedCourses: 'Fen Bilimleri, Fizik, Astronomi ve Uzay Bilimleri'
  },
  {
    id: 'izm-3',
    city: 'İzmir',
    category: 'Tabiat Parkı / Doğa / Botanik',
    name: 'İzmir Doğal Yaşam Parkı (Sasalı)',
    address: 'Sasalı, Çiğli / İzmir',
    description: 'Avrupa\'nın sayılı doğal yaşam alanlarından biri, biyolojik çeşitlilik.',
    suitableGrades: 'Tüm Sınıflar',
    suggestedCourses: 'Fen Bilimleri, Hayat Bilgisi, Biyoloji'
  },

  // Bursa
  {
    id: 'bur-1',
    city: 'Bursa',
    category: 'Bilim Merkezi / Rasathane',
    name: 'GUHEM - Gökmen Uzay Havacılık Eğitim Merkezi',
    address: 'Demirtaş Dumlupınar OSB Mah. Osmangazi / Bursa',
    description: 'Avrupa\'nın en büyük uzay ve havacılık temalı interaktif eğitim merkezi.',
    suitableGrades: 'Tüm Sınıflar',
    suggestedCourses: 'Fen Bilimleri, Fizik, Teknoloji ve Tasarım'
  },
  {
    id: 'bur-2',
    city: 'Bursa',
    category: 'Müze',
    name: 'Bursa Bilim ve Teknoloji Merkezi (BTM)',
    address: 'Altınova Mah. Fuar Cad. Osmangazi / Bursa',
    description: 'Uygulamalı deney düzenekleri, planetaryum ve bilimsel atölyeler.',
    suitableGrades: '1-8. Sınıflar',
    suggestedCourses: 'Fen Bilimleri, Matematik, Teknoloji'
  },
  {
    id: 'bur-3',
    city: 'Bursa',
    category: 'Tarihi Alan / Saray / Kale',
    name: 'Panorama 1326 Bursa Fetih Müzesi',
    address: 'Ebu İshak Mah. Osmangazi / Bursa',
    description: 'Dünyanın en büyük tam panoramik müzesi, Osmanlı’nın kuruluş dönemi.',
    suitableGrades: 'Tüm Sınıflar',
    suggestedCourses: 'Sosyal Bilgiler, Tarih'
  },

  // Çanakkale
  {
    id: 'can-1',
    city: 'Çanakkale',
    category: 'Tarihi Alan / Saray / Kale',
    name: 'Çanakkale Savaşları Gelibolu Tarihi Alanı ve Şehitlikler',
    address: 'Eceabat / Çanakkale',
    description: 'Şehitler Abidesi, Conkbayırı, 57. Alay Şehitliği ve Hilal-i Ahmer Müzesi.',
    suitableGrades: '4. Sınıftan İtibaren Tüm Kademeler',
    suggestedCourses: 'Sosyal Bilgiler, T.C. İnkılap Tarihi, Tarih, Türkçe'
  },
  {
    id: 'can-2',
    city: 'Çanakkale',
    category: 'Müze',
    name: 'Troya Müzesi ve Ören Yeri',
    address: 'Tevfikiye Köyü, Merkez / Çanakkale',
    description: 'UNESCO Dünya Mirası Troya efsanesi ve ödüllü çağdaş müze binası.',
    suitableGrades: '4-12. Sınıflar',
    suggestedCourses: 'Sosyal Bilgiler, Tarih, Görsel Sanatlar'
  },

  // Konya
  {
    id: 'kon-1',
    city: 'Konya',
    category: 'Bilim Merkezi / Rasathane',
    name: 'Konya Bilim Merkezi',
    address: 'Büyükkayacık Mah. Ankara Cad. Selçuklu / Konya',
    description: 'TÜBİTAK destekli planetaryum, vücudumuz, temel adımlar ve dünya sergileri.',
    suitableGrades: 'Tüm Sınıflar',
    suggestedCourses: 'Fen Bilimleri, Matematik, Teknoloji'
  },
  {
    id: 'kon-2',
    city: 'Konya',
    category: 'Müze',
    name: 'Mevlana Müzesi',
    address: 'Aziziye Mah. Mevlana Cad. Karatay / Konya',
    description: 'Mevlevi kültürü, tarihi el yazmaları ve Selçuklu mimarisi.',
    suitableGrades: 'Tüm Sınıflar',
    suggestedCourses: 'Din Kültürü ve Ahlak Bilgisi, Sosyal Bilgiler, Türkçe'
  },
  {
    id: 'kon-3',
    city: 'Konya',
    category: 'Tabiat Parkı / Doğa / Botanik',
    name: 'Konya Tropikal Kelebek Bahçesi',
    address: 'Parsana Mah. İsmail Kaya Cad. Selçuklu / Konya',
    description: 'Avrupa\'nın en büyük tropikal kelebek uçuş alanı ve böcek müzesi.',
    suitableGrades: 'Tüm Sınıflar',
    suggestedCourses: 'Fen Bilimleri, Hayat Bilgisi, Biyoloji'
  },

  // Gaziantep
  {
    id: 'gaz-1',
    city: 'Gaziantep',
    category: 'Müze',
    name: 'Zeugma Mozaik Müzesi',
    address: 'Mithatpaşa Mah. Hacı Sani Konukoğlu Bulvarı Şehitkamil / Gaziantep',
    description: 'Çingene Kızı mozaiği, Roma dönemi villaları ve zengin mozaik koleksiyonu.',
    suitableGrades: 'Tüm Sınıflar',
    suggestedCourses: 'Sosyal Bilgiler, Tarih, Görsel Sanatlar'
  },
  {
    id: 'gaz-2',
    city: 'Gaziantep',
    category: 'Bilim Merkezi / Rasathane',
    name: 'Müzeyyen Erkul Gaziantep Bilim Merkezi',
    address: 'Şehitkamil / Gaziantep',
    description: 'Havacılık, uzay, yapay zeka ve temel bilimler atölyeleri.',
    suitableGrades: 'Tüm Sınıflar',
    suggestedCourses: 'Fen Bilimleri, Matematik, Bilişim Teknolojileri'
  },

  // Antalya
  {
    id: 'ant-1',
    city: 'Antalya',
    category: 'Müze',
    name: 'Antalya Müzesi',
    address: 'Bahçelievler Mah. Konyaaltı Cad. Muratpaşa / Antalya',
    description: 'Perge heykelleri, lahitler ve zengin Akdeniz arkeolojisi.',
    suitableGrades: '4-12. Sınıflar',
    suggestedCourses: 'Sosyal Bilgiler, Tarih, Görsel Sanatlar'
  },
  {
    id: 'ant-2',
    city: 'Antalya',
    category: 'Tabiat Parkı / Doğa / Botanik',
    name: 'Düden Şelalesi Tabiat Parkı',
    address: 'Varsak Mah. Kepez / Antalya',
    description: 'Doğal kanyon oluşumu, su kaynakları ve biyolojik çeşitlilik gözlemi.',
    suitableGrades: 'Tüm Sınıflar',
    suggestedCourses: 'Hayat Bilgisi, Fen Bilimleri, Coğrafya'
  },

  // Trabzon
  {
    id: 'tra-1',
    city: 'Trabzon',
    category: 'Tarihi Alan / Saray / Kale',
    name: 'Sümela Manastırı',
    address: 'Altındere Vadisi, Maçka / Trabzon',
    description: 'Kayaya oyulmuş tarihi manastır ve Altındere Milli Parkı doğal zenginliği.',
    suitableGrades: 'Tüm Sınıflar',
    suggestedCourses: 'Sosyal Bilgiler, Tarih, Coğrafya'
  },
  {
    id: 'tra-2',
    city: 'Trabzon',
    category: 'Bilim Merkezi / Rasathane',
    name: 'Trabzon Özdemir Bayraktar Bilim Merkezi',
    address: 'Ortahisar / Trabzon',
    description: 'Tasarım, havacılık, robotik ve doğa bilimleri atölyeleri.',
    suitableGrades: '1-8. Sınıflar',
    suggestedCourses: 'Fen Bilimleri, Teknoloji, Matematik'
  }
];

export const INITIAL_EMPTY_PLAN = {
  city: 'İstanbul',
  district: 'Üsküdar',
  schoolName: 'Zeynep Kamil İlkokulu',
  clubName: 'Sosyal Etkinlikler ve Gezi İnceleme Kulübü',
  documentDate: new Date().toISOString().split('T')[0],
  documentNumber: 'E-83920194-000-001',
  principalName: 'Ahmet YILMAZ',
  deputyPrincipalName: 'Mehmet DEMİR',
  
  destinationCategory: 'Müze',
  destinationMode: 'preset' as const,
  selectedCity: 'İstanbul',
  destinationName: '',
  destinationAddress: '',
  tripType: 'İl İçi' as const,
  tripDuration: 'Günübirlik' as const,
  
  targetGrades: '',
  maleStudentCount: 0,
  femaleStudentCount: 0,
  totalStudentCount: 0,
  totalTeacherCount: 2,
  totalCompanionCount: 2,
  
  courseName: 'Hayat Bilgisi / Sosyal Bilgiler',
  subjectTopic: '',
  purpose: '',
  outcomes: '',
  
  tripDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  departureTime: '09:00',
  returnTime: '15:30',
  departureLocation: 'Okul Bahçesi',
  returnLocation: 'Okul Bahçesi',
  transportationType: 'Özel Turizm Otobüsü' as const,
  vehiclePlate: '34 ZK 1923',
  driverName: 'Mustafa KAYA',
  driverPhone: '0532 000 00 00',
  transportCompany: 'Lider Turizm & Taşımacılık Ltd. Şti.',
  travelRoute: 'Okul -> 15 Temmuz Şehitler Köprüsü -> Hasköy Sahil Yolu -> Müze Alanı -> Okul',
  
  headTeacher: {
    id: 'ht-1',
    fullName: '',
    branch: 'Sınıf Öğretmeni',
    role: 'Kafile Başkanı',
    phone: '0555 123 45 67',
    tcNo: '12345678901'
  },
  teachers: [
    {
      id: 't-1',
      fullName: '',
      branch: 'Sınıf Öğretmeni',
      role: 'Görevli Öğretmen',
      phone: '0555 987 65 43'
    }
  ],
  companions: [
    {
      id: 'c-1',
      fullName: 'Ayşe ÖZTÜRK',
      role: 'Veli Refakatçi',
      phone: '0533 111 22 33'
    },
    {
      id: 'c-2',
      fullName: 'Fatma KILIÇ',
      role: 'Veli Refakatçi',
      phone: '0544 222 33 44'
    }
  ],
  
  schedule: [
    {
      id: 's-1',
      timeRange: '08:45 - 09:00',
      activity: 'Öğrencilerin okul bahçesinde toplanması, yoklama ve güvenlik bilgilendirmesi',
      location: 'Okul Bahçesi',
      responsible: 'Kafile Başkanı ve Görevli Öğretmenler'
    },
    {
      id: 's-2',
      timeRange: '09:00 - 10:00',
      activity: 'Araçlara biniş ve gezi alanına intikal yolculuğu',
      location: 'Gezi Güzergahı',
      responsible: 'Sürücü ve Görevli Öğretmenler'
    },
    {
      id: 's-3',
      timeRange: '10:00 - 12:30',
      activity: 'Mekana varış, rehber eşliğinde sergi ve inceleme alanlarının gezilmesi, gözlem yapılması',
      location: 'Gezi Mekânı',
      responsible: 'Mekân Rehberi ve Görevli Öğretmenler'
    },
    {
      id: 's-4',
      timeRange: '12:30 - 13:30',
      activity: 'Öğle yemeği molası ve dinlenme süresi',
      location: 'Mekân Dinlenme / Kafeterya Alanı',
      responsible: 'Görevli Öğretmenler ve Veliler'
    },
    {
      id: 's-5',
      timeRange: '13:30 - 14:30',
      activity: 'Eğitsel atölye çalışması ve okul dışı öğrenme çalışma yapraklarının doldurulması',
      location: 'Etkinlik / Atölye Salonu',
      responsible: 'Kafile Başkanı ve Branş Öğretmenleri'
    },
    {
      id: 's-6',
      timeRange: '14:30 - 15:30',
      activity: 'Toplu yoklama, araca biniş ve okula dönüş yolculuğu',
      location: 'Dönüş Güzergahı - Okul',
      responsible: 'Kafile Başkanı ve Görevli Öğretmenler'
    }
  ],
  
  preTripNotes: 'Veli izin onay belgeleri eksiksiz toplandı. MEB Sosyal Etkinlikler Yönetmeliği kapsamında Okul Gezi Planı ve Kafile Onay Listesi hazırlandı. Güzergah ve servis güvenliği denetlendi. Öğrencilere acil durum ve grup disiplini kuralları hatırlatıldı.',
  duringTripNotes: 'Gezi boyunca öğrenci takibi yakalık ve yaka kartları ile sağlandı. Her öğretmene sorumlu öğrenci grubu zimmetlendi. Mekanda rehber eşliğinde eğitsel kazanımlara uygun inceleme ve fotoğraf çekimi yapıldı.',
  postTripNotes: 'Gezi dönüşünde okulda son yoklama yapıldı ve öğrenciler velilerine teslim edildi. Sınıfta gezi deneyimleri tartışıldı, okul dışı öğrenme yansıtma çalışma yaprakları değerlendirildi ve okul panosunda sergilendi.',
  safetyMeasures: 'İlk yardım çantası araçta hazır bulundurulacaktır. Acil durum telefonları (112 Acil Çağrı, Okul İdaresi) kafile başkanında mevcuttur. Öğrencilerin gezi alanından izinsiz ayrılmaması için refakatçi dağılımı yapılmıştır.'
};

export const SAMPLE_POPULATED_PLAN = {
  ...INITIAL_EMPTY_PLAN,
  targetGrades: '3-A ve 3-B Şubeleri',
  destinationMode: 'preset' as const,
  selectedCity: 'İstanbul',
  destinationName: 'Rahmi M. Koç Müzesi',
  destinationAddress: 'Hasköy Cad. No:5 Hasköy, Beyoğlu / İstanbul',
  courseName: 'Fen Bilimleri & Sosyal Bilgiler',
  subjectTopic: 'Geçmişten Günümüze Ulaşım ve İletişim Teknolojileri / Bilimsel Keşifler',
  purpose: 'Öğrencilerin teknolojik araçların tarihsel gelişimini yerinde gözlemlemeleri, sanayi ve bilim mirasını keşfetmeleri, müze bilinci kazanmaları.',
  outcomes: 'FB.3.4. Geçmişte ve günümüzde kullanılan teknolojik ürünleri karşılaştırır.\nSB.3.2. Çevresindeki tarihi ve kültürel mekânların önemini fark eder.\nHB.3.5. Ortak kullanım alanlarında güvenlik ve nezaket kurallarına uyar.',
  maleStudentCount: 18,
  femaleStudentCount: 20,
  totalStudentCount: 38,
  headTeacher: {
    id: 'ht-1',
    fullName: 'Ali Serkan KAYA',
    branch: 'Sınıf Öğretmeni (3-A)',
    role: 'Kafile Başkanı',
    phone: '0532 111 22 33',
    tcNo: '28475930291'
  },
  teachers: [
    {
      id: 't-1',
      fullName: 'Zeynep YILDIZ',
      branch: 'Sınıf Öğretmeni (3-B)',
      role: 'Görevli Öğretmen',
      phone: '0542 987 65 43'
    },
    {
      id: 't-2',
      fullName: 'Murat AKSOY',
      branch: 'Rehberlik / Psikolojik Danışman',
      role: 'Rehber Öğretmen',
      phone: '0505 444 55 66'
    }
  ]
};
