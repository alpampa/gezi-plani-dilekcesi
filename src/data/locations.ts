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

export const ISTANBUL_DISTRICTS = [
  'Tüm İlçeler',
  'Üsküdar', 'Kadıköy', 'Ataşehir', 'Beşiktaş', 'Beyoğlu', 'Fatih', 'Sarıyer',
  'Eyüpsultan', 'Bakırköy', 'Şişli', 'Beykoz', 'Maltepe', 'Kartal', 'Pendik',
  'Tuzla', 'Ümraniye', 'Çekmeköy', 'Sancaktepe', 'Sultanbeyli', 'Şile',
  'Adalar', 'Arnavutköy', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Başakşehir',
  'Bayrampaşa', 'Beylikdüzü', 'Büyükçekmece', 'Çatalca', 'Esenler', 'Esenyurt',
  'Gaziosmanpaşa', 'Güngören', 'Kağıthane', 'Küçükçekmece', 'Silivri', 'Sultangazi', 'Zeytinburnu'
];

export const CATEGORIES = [
  'Tüm Kategoriler',
  'Müze (Tarih, Sanat, Arkeoloji, Denizcilik, Havacılık)',
  'Bilim Merkezi & Planetaryum / Rasathane',
  'Tarihi Alan / Saray / Kasır / Kale / Anıt / Şehitlik',
  'Tabiat Parkı / Doğa Parkuru / Botanik & Arboryum',
  'Hayvanat Bahçesi / Akvaryum / Kelebek Bahçesi',
  'Kütüphane / Arşiv / Dokümantasyon Merkezi',
  'Sanat Galerisi / Tiyatro Sahnesi / Kültür Merkezi',
  'Açık Hava / Spor / Doğa Macera Parkuru / İzcilik Alanı',
  'Üniversite / Teknokent / Laboratuvar / Ar-Ge Merkezi',
  'Kamu Kurumu / İtfaiye / Belediye / Meclis / Adliye',
  'Fabrika / Sanayi Tesisi / Çiftlik & Tarım / Geri Dönüşüm',
  'Zanaat & Sanat Atölyesi / Robotik & Tasarım Atölyesi',
  'Manevi & Dini Mekan / Tarihi Cami / Külliye',
  'Liste Dışı / Özel Etkinlik Alanı'
];

export const PRESET_LOCATIONS: PresetLocation[] = [
  // ==================== İSTANBUL - ÜSKÜDAR ====================
  {
    id: 'usk-1',
    city: 'İstanbul',
    district: 'Üsküdar',
    category: 'Bilim Merkezi & Planetaryum / Rasathane',
    name: 'Bilim Üsküdar (Üsküdar Bilim Merkezi)',
    address: 'Ünalan Mah. Mahmut Gazi Cad. No:1 Üsküdar / İstanbul',
    description: 'Uzay ve havacılık sergi salonu, planetaryum gösterileri, teknoloji ve matematik atölyeleri.',
    suitableGrades: 'Tüm Kademeler (Anasınıfı, 1, 2, 3, 4. Sınıflar)',
    suggestedCourses: 'Fen Bilimleri, Matematik, Hayat Bilgisi, Bilişim Teknolojileri'
  },
  {
    id: 'usk-2',
    city: 'İstanbul',
    district: 'Üsküdar',
    category: 'Tarihi Alan / Saray / Kasır / Kale / Anıt / Şehitlik',
    name: 'Beylerbeyi Sarayı',
    address: 'Beylerbeyi Mah. Abdullah Ağa Cad. Üsküdar / İstanbul',
    description: 'Osmanlı devlet konukevi olarak kullanılan tarihi saray, bahçesi ve deniz köşkleri.',
    suitableGrades: '3, 4. Sınıflar',
    suggestedCourses: 'Sosyal Bilgiler, Hayat Bilgisi, Görsel Sanatlar'
  },
  {
    id: 'usk-3',
    city: 'İstanbul',
    district: 'Üsküdar',
    category: 'Tabiat Parkı / Doğa Parkuru / Botanik & Arboryum',
    name: 'Küçük Çamlıca Tabiat Parkı ve Korusu',
    address: 'Küçük Çamlıca Mah. Üsküdar / İstanbul',
    description: 'Tarihi köşkler, zengin ağaç çeşitliliği, yürüyüş parkurları ve kuş gözlem alanı.',
    suitableGrades: 'Anasınıfı, 1, 2, 3, 4. Sınıflar',
    suggestedCourses: 'Hayat Bilgisi, Fen Bilimleri, Beden Eğitimi'
  },
  {
    id: 'usk-4',
    city: 'İstanbul',
    district: 'Üsküdar',
    category: 'Tabiat Parkı / Doğa Parkuru / Botanik & Arboryum',
    name: 'Büyük Çamlıca Tepesi ve Çamlıca Korusu',
    address: 'Ferah Mah. Çamlıca Tepesi, Üsküdar / İstanbul',
    description: 'İstanbul panoramik seyir noktası, anıt ağaçlar, çiçek parterleri ve açık hava etkinlik alanı.',
    suitableGrades: 'Tüm Sınıflar',
    suggestedCourses: 'Hayat Bilgisi, Sosyal Bilgiler, Görsel Sanatlar'
  },
  {
    id: 'usk-5',
    city: 'İstanbul',
    district: 'Üsküdar',
    category: 'Sanat Galerisi / Tiyatro Sahnesi / Kültür Merkezi',
    name: 'Üsküdar Belediyesi Bağlarbaşı Kültür ve Sanat Merkezi',
    address: 'Bağlarbaşı Mah. Üsküdar / İstanbul',
    description: 'Tiyatro gösterileri, çocuk kütüphanesi, sergi salonları ve sanat atölyeleri.',
    suitableGrades: 'Tüm Sınıflar',
    suggestedCourses: 'Türkçe, Görsel Sanatlar, Müzik'
  },
  {
    id: 'usk-6',
    city: 'İstanbul',
    district: 'Üsküdar',
    category: 'Tarihi Alan / Saray / Kasır / Kale / Anıt / Şehitlik',
    name: 'Kız Kulesi Tarihi Müzesi',
    address: 'Salacak Sahili Açıkları, Üsküdar / İstanbul',
    description: 'İstanbul Boğazı’nın simgesi, tarihi deniz feneri ve etkileşimli dijital sergiler.',
    suitableGrades: '2, 3, 4. Sınıflar',
    suggestedCourses: 'Hayat Bilgisi, Sosyal Bilgiler, Türkçe'
  },
  {
    id: 'usk-7',
    city: 'İstanbul',
    district: 'Üsküdar',
    category: 'Kütüphane / Arşiv / Dokümantasyon Merkezi',
    name: 'Nevmekân Sahil ve Nevmekân Selimiye Çocuk Kütüphaneleri',
    address: 'Selimiye / Şemsipaşa Mah. Üsküdar / İstanbul',
    description: 'Nitelikli çocuk kitaplığı koleksiyonu, okuma atölyeleri ve mimari miras.',
    suitableGrades: 'Tüm Kademeler',
    suggestedCourses: 'Türkçe, Hayat Bilgisi, Sosyal Bilgiler'
  },
  {
    id: 'usk-8',
    city: 'İstanbul',
    district: 'Üsküdar',
    category: 'Manevi & Dini Mekan / Tarihi Cami / Külliye',
    name: 'Mihrimah Sultan (İskele) ve Şemsi Paşa Külliyeleri',
    address: 'Mimar Sinan Mah. İskele Meydanı, Üsküdar / İstanbul',
    description: 'Mimar Sinan’ın eşsiz mimarlık mirası, tarihi medrese ve kütüphane yapıları.',
    suitableGrades: '3, 4. Sınıflar',
    suggestedCourses: 'Sosyal Bilgiler, Görsel Sanatlar, Din Kültürü'
  },

  // ==================== İSTANBUL - KADIKÖY & ATAŞEHİR ====================
  {
    id: 'kad-1',
    city: 'İstanbul',
    district: 'Kadıköy',
    category: 'Müze (Tarih, Sanat, Arkeoloji, Denizcilik, Havacılık)',
    name: 'İstanbul Oyuncak Müzesi',
    address: 'Göztepe Mah. Ömerpaşa Cad. Dr. Zeki Zeren Sok. No:17 Kadıköy / İstanbul',
    description: 'Sunay Akın tarafından kurulan, dünya tarihini oyuncaklarla anlatan tematik müze ve atölyeler.',
    suitableGrades: 'Anasınıfı, 1, 2, 3, 4. Sınıflar',
    suggestedCourses: 'Hayat Bilgisi, Sosyal Bilgiler, Görsel Sanatlar, Türkçe'
  },
  {
    id: 'kad-2',
    city: 'İstanbul',
    district: 'Kadıköy',
    category: 'Tabiat Parkı / Doğa Parkuru / Botanik & Arboryum',
    name: 'Göztepe 60. Yıl Parkı ve Gül Bahçeleri',
    address: 'Bağdat Cad. Göztepe, Kadıköy / İstanbul',
    description: 'Tematik çocuk oyun alanları, akvaryum havuzları, bitki labirentleri ve lale bahçeleri.',
    suitableGrades: 'Okul Öncesi, 1, 2, 3. Sınıflar',
    suggestedCourses: 'Hayat Bilgisi, Fen Bilimleri, Beden Eğitimi'
  },
  {
    id: 'kad-3',
    city: 'İstanbul',
    district: 'Kadıköy',
    category: 'Sanat Galerisi / Tiyatro Sahnesi / Kültür Merkezi',
    name: 'Kadıköy Belediyesi Çocuk Sanat Merkezi & Halis Kurtça Çocuk Kültür Merkezi',
    address: 'Merdivenköy Mah. Ressam Salih Erimez Cad. Kadıköy / İstanbul',
    description: 'Çocuklara yönelik görsel sanatlar, müzik, ritim ve tiyatro atölyeleri.',
    suitableGrades: 'Anasınıfı, 1, 2, 3, 4. Sınıflar',
    suggestedCourses: 'Görsel Sanatlar, Müzik, Hayat Bilgisi'
  },
  {
    id: 'atash-1',
    city: 'İstanbul',
    district: 'Ataşehir',
    category: 'Tabiat Parkı / Doğa Parkuru / Botanik & Arboryum',
    name: 'Nezahat Gökyiğit Botanik Bahçesi (NGBB)',
    address: 'Atatürk Mah. Ataşehir / İstanbul',
    description: 'Türkiye’nin en zengin canlı bitki koleksiyonu, keşif patikaları, kurakçıl bitkiler ve eğitsel doğa atölyeleri.',
    suitableGrades: 'Anasınıfı, 1, 2, 3, 4. Sınıflar',
    suggestedCourses: 'Hayat Bilgisi, Fen Bilimleri, Çevre Eğitimi'
  },

  // ==================== İSTANBUL - BEYOĞLU & FATİH ====================
  {
    id: 'bey-1',
    city: 'İstanbul',
    district: 'Beyoğlu',
    category: 'Müze (Tarih, Sanat, Arkeoloji, Denizcilik, Havacılık)',
    name: 'Rahmi M. Koç Müzesi',
    address: 'Hasköy Cad. No:5 Hasköy, Beyoğlu / İstanbul',
    description: 'Sanayi, denizcilik, havacılık, karayolu ulaşımı, nostaljik tren ve renkli bilim deney atölyeleri.',
    suitableGrades: 'Anasınıfı, 1, 2, 3, 4. Sınıflar',
    suggestedCourses: 'Fen Bilimleri, Sosyal Bilgiler, Hayat Bilgisi, Matematik'
  },
  {
    id: 'bey-2',
    city: 'İstanbul',
    district: 'Beyoğlu',
    category: 'Tarihi Alan / Saray / Kasır / Kale / Anıt / Şehitlik',
    name: 'Galata Kulesi Tarihi Müzesi',
    address: 'Bereketzade Mah. Beyoğlu / İstanbul',
    description: 'Bizans ve Ceneviz mirası gözetleme kulesi, Hezarfen Ahmet Çelebi sergisi ve tarihi panorama.',
    suitableGrades: '3, 4. Sınıflar',
    suggestedCourses: 'Sosyal Bilgiler, Hayat Bilgisi, Türkçe'
  },
  {
    id: 'bey-3',
    city: 'İstanbul',
    district: 'Beyoğlu',
    category: 'Müze (Tarih, Sanat, Arkeoloji, Denizcilik, Havacılık)',
    name: 'Miniatürk (Minyatür Türkiye Parkı)',
    address: 'Örnektepe Mah. İmrahor Cad. Beyoğlu / İstanbul',
    description: 'Anadolu ve Osmanlı coğrafyasındaki 136 tarihi eserin 1/25 ölçekli maketleri ve masal parkı.',
    suitableGrades: 'Anasınıfı, 1, 2, 3, 4. Sınıflar',
    suggestedCourses: 'Hayat Bilgisi, Sosyal Bilgiler, Görsel Sanatlar'
  },
  {
    id: 'fat-1',
    city: 'İstanbul',
    district: 'Fatih',
    category: 'Tarihi Alan / Saray / Kasır / Kale / Anıt / Şehitlik',
    name: 'Topkapı Sarayı Müzesi',
    address: 'Cankurtaran Mah. Fatih / İstanbul',
    description: 'Osmanlı İmparatorluğu yönetim merkezi, kutsal emanetler, silah ve hazine koleksiyonları.',
    suitableGrades: '3, 4. Sınıflar',
    suggestedCourses: 'Sosyal Bilgiler, Tarih, Türkçe'
  },
  {
    id: 'fat-2',
    city: 'İstanbul',
    district: 'Fatih',
    category: 'Müze (Tarih, Sanat, Arkeoloji, Denizcilik, Havacılık)',
    name: 'İstanbul Arkeoloji Müzeleri',
    address: 'Osman Hamdi Bey Yokuşu, Gülhane Parkı İçi, Fatih / İstanbul',
    description: 'İskender Lahdi, antik uygarlıklar, çocuk arkeoloji müzesi ve çinili köşk.',
    suitableGrades: '3, 4. Sınıflar',
    suggestedCourses: 'Sosyal Bilgiler, Görsel Sanatlar, Hayat Bilgisi'
  },
  {
    id: 'fat-3',
    city: 'İstanbul',
    district: 'Fatih',
    category: 'Tarihi Alan / Saray / Kasır / Kale / Anıt / Şehitlik',
    name: 'Yerebatan Sarnıcı Müzesi',
    address: 'Alemdar Mah. Yerebatan Cad. Fatih / İstanbul',
    description: 'Erken Bizans su mimarisi, Medusa başları sütunları ve ışık gösterileri.',
    suitableGrades: '3, 4. Sınıflar',
    suggestedCourses: 'Sosyal Bilgiler, Fen Bilimleri, Hayat Bilgisi'
  },
  {
    id: 'fat-4',
    city: 'İstanbul',
    district: 'Fatih',
    category: 'Tabiat Parkı / Doğa Parkuru / Botanik & Arboryum',
    name: 'Gülhane Parkı ve İslam Bilim ve Teknoloji Tarihi Müzesi',
    address: 'Gülhane Parkı İçi, Cankurtaran Mah. Fatih / İstanbul',
    description: 'Prof. Dr. Fuat Sezgin İslam Bilim Tarihi icatları, planetaryum ve asırlık çınar ağaçları.',
    suitableGrades: '2, 3, 4. Sınıflar',
    suggestedCourses: 'Sosyal Bilgiler, Fen Bilimleri, Matematik'
  },
  {
    id: 'fat-5',
    city: 'İstanbul',
    district: 'Fatih',
    category: 'Manevi & Dini Mekan / Tarihi Cami / Külliye',
    name: 'Ayasofya-i Kebir Cami-i Şerifi ve Sultanahmet Meydanı',
    address: 'Sultanahmet Meydanı, Fatih / İstanbul',
    description: 'Dünya mimarlık tarihinin başyapıtı, Dikilitaş ve tarihi hipodrom alanı.',
    suitableGrades: '3, 4. Sınıflar',
    suggestedCourses: 'Sosyal Bilgiler, Görsel Sanatlar'
  },

  // ==================== İSTANBUL - BEŞİKTAŞ & SARIYER ====================
  {
    id: 'bes-1',
    city: 'İstanbul',
    district: 'Beşiktaş',
    category: 'Tarihi Alan / Saray / Kasır / Kale / Anıt / Şehitlik',
    name: 'Dolmabahçe Sarayı',
    address: 'Vişnezade Mah. Dolmabahçe Cad. Beşiktaş / İstanbul',
    description: 'Atatürk’ün ebediyete intikal ettiği mekan, Selamlık, Muayede Salonu ve Saray Koleksiyonları Müzesi.',
    suitableGrades: 'Anasınıfı, 1, 2, 3, 4. Sınıflar',
    suggestedCourses: 'Hayat Bilgisi, Sosyal Bilgiler, T.C. İnkılap Tarihi'
  },
  {
    id: 'bes-2',
    city: 'İstanbul',
    district: 'Beşiktaş',
    category: 'Müze (Tarih, Sanat, Arkeoloji, Denizcilik, Havacılık)',
    name: 'İstanbul Deniz Müzesi',
    address: 'Sinanpaşa Mah. Beşiktaş Meydanı, Beşiktaş / İstanbul',
    description: 'Tarihi saltanat kayıkları, kadırgalar, Çaka Bey ve Barbaros Hayrettin Paşa mirası.',
    suitableGrades: 'Anasınıfı, 1, 2, 3, 4. Sınıflar',
    suggestedCourses: 'Hayat Bilgisi, Sosyal Bilgiler, Fen Bilimleri'
  },
  {
    id: 'bes-3',
    city: 'İstanbul',
    district: 'Beşiktaş',
    category: 'Tabiat Parkı / Doğa Parkuru / Botanik & Arboryum',
    name: 'Yıldız Parkı ve Şale Köşkü Korusu',
    address: 'Yıldız Mah. Çırağan Cad. Beşiktaş / İstanbul',
    description: 'Tarihi Yıldız Sarayı bahçesi, göletler, asma köprüler ve zengin fauna-flora gözlem alanı.',
    suitableGrades: 'Tüm Kademeler',
    suggestedCourses: 'Hayat Bilgisi, Fen Bilimleri, Çevre Eğitimi'
  },
  {
    id: 'sar-1',
    city: 'İstanbul',
    district: 'Sarıyer',
    category: 'Tabiat Parkı / Doğa Parkuru / Botanik & Arboryum',
    name: 'Atatürk Arboretumu (Canlı Ağaç Müzesi)',
    address: 'Kemer Mah. Bahçeköy, Sarıyer / İstanbul',
    description: 'Dünyanın dört bir yanından getirilen 2000\'i aşkın ağaç ve odunsu bitki türü, gölet ekosistemi.',
    suitableGrades: 'Anasınıfı, 1, 2, 3, 4. Sınıflar',
    suggestedCourses: 'Fen Bilimleri, Hayat Bilgisi, Biyoloji'
  },
  {
    id: 'sar-2',
    city: 'İstanbul',
    district: 'Sarıyer',
    category: 'Tabiat Parkı / Doğa Parkuru / Botanik & Arboryum',
    name: 'Emirgan Korusu ve Lale Müzesi',
    address: 'Emirgan Mah. Sarıyer / İstanbul',
    description: 'Sarı, Pembe ve Beyaz Köşkler, gölet, sincaplar ve geleneksel Lale Festivali alanı.',
    suitableGrades: 'Tüm Kademeler',
    suggestedCourses: 'Hayat Bilgisi, Görsel Sanatlar, Fen Bilimleri'
  },
  {
    id: 'sar-3',
    city: 'İstanbul',
    district: 'Sarıyer',
    category: 'Tarihi Alan / Saray / Kasır / Kale / Anıt / Şehitlik',
    name: 'Rumeli Hisarı Müzesi',
    address: 'Yahya Kemal Cad. Sarıyer / İstanbul',
    description: 'Fatih Sultan Mehmet tarafından Boğaz güvenliği için 90 günde inşa edilen tarihi hisar ve açık hava tiyatrosu.',
    suitableGrades: '3, 4. Sınıflar',
    suggestedCourses: 'Sosyal Bilgiler, Hayat Bilgisi'
  },

  // ==================== İSTANBUL - EYÜPSULTAN & ZEYTİNBURNU ====================
  {
    id: 'eyup-1',
    city: 'İstanbul',
    district: 'Eyüpsultan',
    category: 'Kütüphane / Arşiv / Dokümantasyon Merkezi',
    name: 'Rami Kütüphanesi ve Çocuk Etkinlik Alanları',
    address: 'Yeni Mah. Rami Kışla Cad. Eyüpsultan / İstanbul',
    description: '0-3 yaş, 3-6 yaş ve ilkokul çocuk kütüphaneleri, masal odaları, botanik iç avlu ve dijital atölyeler.',
    suitableGrades: 'Tüm Kademeler (Anasınıfı, 1, 2, 3, 4. Sınıflar)',
    suggestedCourses: 'Türkçe, Hayat Bilgisi, Sosyal Bilgiler, Görsel Sanatlar'
  },
  {
    id: 'eyup-2',
    city: 'İstanbul',
    district: 'Eyüpsultan',
    category: 'Tarihi Alan / Saray / Kasır / Kale / Anıt / Şehitlik',
    name: 'Pierre Loti Tepesi ve Haliç Seyir Terası',
    address: 'Eyüp Merkez Mah. İdris Köşkü Cad. Eyüpsultan / İstanbul',
    description: 'Teleferik yolculuğu ile Haliç panoramik izleme, tarihi mezarlık servileri ve edebi miras.',
    suitableGrades: '2, 3, 4. Sınıflar',
    suggestedCourses: 'Hayat Bilgisi, Sosyal Bilgiler, Türkçe'
  },
  {
    id: 'zey-1',
    city: 'İstanbul',
    district: 'Zeytinburnu',
    category: 'Müze (Tarih, Sanat, Arkeoloji, Denizcilik, Havacılık)',
    name: 'Panorama 1453 Tarih Müzesi',
    address: 'Merkezefendi Mah. Topkapı Kültür Parkı İçi, Zeytinburnu / İstanbul',
    description: 'İstanbul\'un fethini 360 derece kubbe resmi ve ses efektleriyle yaşatan tam panoramik müze.',
    suitableGrades: '3, 4. Sınıflar',
    suggestedCourses: 'Sosyal Bilgiler, Tarih, Türkçe'
  },
  {
    id: 'zey-2',
    city: 'İstanbul',
    district: 'Zeytinburnu',
    category: 'Tabiat Parkı / Doğa Parkuru / Botanik & Arboryum',
    name: 'Zeytinburnu Tıbbi Bitkiler Bahçesi',
    address: 'Merkezefendi Mah. Yeniçiftlik Yolu Cad. Zeytinburnu / İstanbul',
    description: 'Türkiye\'nin ilk tıbbi bitkiler bahçesi, şifalı otlar, sera ve doğal kompost atölyeleri.',
    suitableGrades: 'Anasınıfı, 1, 2, 3, 4. Sınıflar',
    suggestedCourses: 'Fen Bilimleri, Hayat Bilgisi, Çevre Eğitimi'
  },

  // ==================== İSTANBUL - BAKIRKÖY & ŞİŞLİ ====================
  {
    id: 'bak-1',
    city: 'İstanbul',
    district: 'Bakırköy',
    category: 'Müze (Tarih, Sanat, Arkeoloji, Denizcilik, Havacılık)',
    name: 'Hava Kuvvetleri Havacılık Müzesi (Yeşilköy)',
    address: 'Yeşilköy Mah. Eski Havaalanı Cad. Bakırköy / İstanbul',
    description: 'Askeri uçaklar, helikopterler, radar sistemleri, pilot kıyafetleri ve uçuş simülatörleri.',
    suitableGrades: 'Tüm Kademeler',
    suggestedCourses: 'Fen Bilimleri, Sosyal Bilgiler, Fizik, Hayat Bilgisi'
  },
  {
    id: 'bak-2',
    city: 'İstanbul',
    district: 'Bakırköy',
    category: 'Hayvanat Bahçesi / Akvaryum / Kelebek Bahçesi',
    name: 'İstanbul Akvaryum (Florya)',
    address: 'Şenlikköy Mah. Yeşilköy Halkalı Cad. No:93 Florya, Bakırköy / İstanbul',
    description: 'Karadeniz\'den Pasifik\'e tematik 17 coğrafi alan, Amazon yağmur ormanı ve köpekbalıkları.',
    suitableGrades: 'Anasınıfı, 1, 2, 3, 4. Sınıflar',
    suggestedCourses: 'Hayat Bilgisi, Fen Bilimleri, Coğrafya'
  },
  {
    id: 'sis-1',
    city: 'İstanbul',
    district: 'Şişli',
    category: 'Müze (Tarih, Sanat, Arkeoloji, Denizcilik, Havacılık)',
    name: 'Askeri Müze ve Kültür Sitesi Komutanlığı (Harbiye)',
    address: 'Halaskargazi Mah. Vali Konağı Cad. Harbiye, Şişli / İstanbul',
    description: 'Mehteran gösterisi, tarihi çadırlar, zırhlar, kılıçlar ve Atatürk’ün Harbiye sınıfı.',
    suitableGrades: '3, 4. Sınıflar',
    suggestedCourses: 'Sosyal Bilgiler, Müzik, Tarih'
  },
  {
    id: 'sis-2',
    city: 'İstanbul',
    district: 'Şişli',
    category: 'Tarihi Alan / Saray / Kasır / Kale / Anıt / Şehitlik',
    name: 'Atatürk Müzesi (Şişli Atatürk Evi)',
    address: 'Halaskargazi Cad. No:140 Şişli / İstanbul',
    description: 'Mustafa Kemal Paşa’nın 1919 Samsun’a çıkış hazırlıklarını yürüttüğü tarihi üç katlı ev.',
    suitableGrades: '2, 3, 4. Sınıflar',
    suggestedCourses: 'Hayat Bilgisi, Sosyal Bilgiler, T.C. İnkılap Tarihi'
  },

  // ==================== ANKARA MEB MEKANLARI ====================
  {
    id: 'ank-1',
    city: 'Ankara',
    district: 'Çankaya',
    category: 'Tarihi Alan / Saray / Kasır / Kale / Anıt / Şehitlik',
    name: 'Anıtkabir ve Atatürk ve Kurtuluş Savaşı Müzesi',
    address: 'Anıttepe, Çankaya / Ankara',
    description: 'Gazi Mustafa Kemal Atatürk\'ün ebedi istirahatgâhı, milli mücadele panoramaları ve tonozlu galeriler.',
    suitableGrades: 'Tüm Kademeler',
    suggestedCourses: 'Hayat Bilgisi, Sosyal Bilgiler, T.C. İnkılap Tarihi, Türkçe'
  },
  {
    id: 'ank-2',
    city: 'Ankara',
    district: 'Altındağ',
    category: 'Tarihi Alan / Saray / Kasır / Kale / Anıt / Şehitlik',
    name: 'I. TBMM Kurtuluş Savaşı Müzesi ve II. TBMM Cumhuriyet Müzesi',
    address: 'Ulus Meydanı, Altındağ / Ankara',
    description: 'Cumhuriyetin kurulduğu tarihi meclis binası, ilk sıralar, zabıt cerideleri ve Atatürk ilkeleri.',
    suitableGrades: '3, 4. Sınıflar',
    suggestedCourses: 'Sosyal Bilgiler, T.C. İnkılap Tarihi, Türkçe'
  },
  {
    id: 'ank-3',
    city: 'Ankara',
    district: 'Altındağ',
    category: 'Müze (Tarih, Sanat, Arkeoloji, Denizcilik, Havacılık)',
    name: 'Anadolu Medeniyetleri Müzesi',
    address: 'Kale Mah. Gözcü Sok. No:2 Ulus, Altındağ / Ankara',
    description: 'Çatalhöyük, Hitit Güneşi, Frig ve Urartu eserleri; Avrupa Yılın Müzesi ödüllü koleksiyon.',
    suitableGrades: '3, 4. Sınıflar',
    suggestedCourses: 'Sosyal Bilgiler, Görsel Sanatlar, Tarih'
  },
  {
    id: 'ank-4',
    city: 'Ankara',
    district: 'Çankaya',
    category: 'Müze (Tarih, Sanat, Arkeoloji, Denizcilik, Havacılık)',
    name: 'MTA Şehit Cuma Dağ Tabiat Tarihi Müzesi',
    address: 'Üniversiteler Mah. Dumlupınar Bulvarı No:139 Çankaya / Ankara',
    description: 'Dinozor iskeletleri, Maraş Fili, kayaçlar, madenler, fosiller ve planetaryum kubbesi.',
    suitableGrades: 'Anasınıfı, 1, 2, 3, 4. Sınıflar',
    suggestedCourses: 'Fen Bilimleri, Hayat Bilgisi, Coğrafya'
  },
  {
    id: 'ank-5',
    city: 'Ankara',
    district: 'Çankaya',
    category: 'Kütüphane / Arşiv / Dokümantasyon Merkezi',
    name: 'Cumhurbaşkanlığı Millet Kütüphanesi ve Çocuk Kütüphaneleri',
    address: 'Cumhurbaşkanlığı Külliyesi, Beştepe / Ankara',
    description: 'Nasreddin Hoca Çocuk Kütüphanesi, Gençlik Kütüphanesi, teknoloji ve sanat atölyeleri.',
    suitableGrades: 'Tüm Kademeler',
    suggestedCourses: 'Türkçe, Sosyal Bilgiler, Fen Bilimleri'
  },
  {
    id: 'ank-6',
    city: 'Ankara',
    district: 'Mamak',
    category: 'Bilim Merkezi & Planetaryum / Rasathane',
    name: 'Ali Kuşçu Gökbilim Merkezi',
    address: 'Mamak / Ankara',
    description: 'Planetaryum, astronot simülasyonları, robotik kodlama ve uzay atölyeleri.',
    suitableGrades: '1, 2, 3, 4. Sınıflar',
    suggestedCourses: 'Fen Bilimleri, Astronomi, Matematik'
  },

  // ==================== BURSA, İZMİR, ÇANAKKALE, KONYA, GAZİANTEP ====================
  {
    id: 'bur-1',
    city: 'Bursa',
    district: 'Osmangazi',
    category: 'Bilim Merkezi & Planetaryum / Rasathane',
    name: 'GUHEM - Gökmen Uzay Havacılık Eğitim Merkezi',
    address: 'Demirtaş Dumlupınar OSB Mah. Osmangazi / Bursa',
    description: 'Avrupa\'nın en büyük interaktif uzay ve havacılık merkezi, uçuş simülatörleri, Ay yürüyüşü.',
    suitableGrades: 'Anasınıfı, 1, 2, 3, 4. Sınıflar',
    suggestedCourses: 'Fen Bilimleri, Matematik, Teknoloji'
  },
  {
    id: 'bur-2',
    city: 'Bursa',
    district: 'Osmangazi',
    category: 'Tarihi Alan / Saray / Kasır / Kale / Anıt / Şehitlik',
    name: 'Panorama 1326 Bursa Fetih Müzesi',
    address: 'Ebu İshak Mah. Osmangazi / Bursa',
    description: 'Dünyanın en büyük tam panoramik müzesi, Osmanlı’nın kuruluş dönemi ve çevre dostu yeşil bina.',
    suitableGrades: 'Tüm Kademeler',
    suggestedCourses: 'Sosyal Bilgiler, Tarih, Türkçe'
  },
  {
    id: 'can-1',
    city: 'Çanakkale',
    district: 'Eceabat',
    category: 'Tarihi Alan / Saray / Kasır / Kale / Anıt / Şehitlik',
    name: 'Çanakkale Şehitler Abidesi ve Tarihi Alan Ziyaretçi Merkezi',
    address: 'Gelibolu Yarımadası Tarihi Alanı, Eceabat / Çanakkale',
    description: '57. Alay Şehitliği, Conkbayırı, Seyit Onbaşı Heykeli ve Hilal-i Ahmer Canlandırma Müzesi.',
    suitableGrades: '3, 4. Sınıflar',
    suggestedCourses: 'Sosyal Bilgiler, T.C. İnkılap Tarihi, Türkçe'
  },
  {
    id: 'can-2',
    city: 'Çanakkale',
    district: 'Merkez',
    category: 'Müze (Tarih, Sanat, Arkeoloji, Denizcilik, Havacılık)',
    name: 'Troya Müzesi ve Ören Yeri',
    address: 'Tevfikiye Köyü, Merkez / Çanakkale',
    description: 'UNESCO Dünya Mirası ödüllü çağdaş müze binası, Homeros destanları ve arkeoloji atölyeleri.',
    suitableGrades: '3, 4. Sınıflar',
    suggestedCourses: 'Sosyal Bilgiler, Görsel Sanatlar, Tarih'
  },
  {
    id: 'izm-1',
    city: 'İzmir',
    district: 'Gaziemir',
    category: 'Bilim Merkezi & Planetaryum / Rasathane',
    name: 'Uzay Kampı Türkiye (Space Camp Turkey)',
    address: 'Ege Serbest Bölgesi, Gaziemir / İzmir',
    description: 'Astronot eğitim simülatörleri, uzay mekiği görevi, yerçekimsiz ortam hissi ve teleskop gözlemi.',
    suitableGrades: '3, 4. Sınıflar',
    suggestedCourses: 'Fen Bilimleri, Astronomi, Teknoloji'
  },
  {
    id: 'izm-2',
    city: 'İzmir',
    district: 'Çiğli',
    category: 'Hayvanat Bahçesi / Akvaryum / Kelebek Bahçesi',
    name: 'İzmir Doğal Yaşam Parkı (Sasalı)',
    address: 'Sasalı, Çiğli / İzmir',
    description: 'Yaban hayatının korunması, 130\'dan fazla hayvan türü, tropik merkez ve göletler.',
    suitableGrades: 'Anasınıfı, 1, 2, 3, 4. Sınıflar',
    suggestedCourses: 'Hayat Bilgisi, Fen Bilimleri, Biyoloji'
  },
  {
    id: 'kon-1',
    city: 'Konya',
    district: 'Selçuklu',
    category: 'Bilim Merkezi & Planetaryum / Rasathane',
    name: 'Konya Bilim Merkezi',
    address: 'Büyükkayacık Mah. Ankara Cad. Selçuklu / Konya',
    description: 'TÜBİTAK destekli bilim merkezi, planetaryum, temel bilimler, vücudumuz ve uzay sergisi.',
    suitableGrades: 'Anasınıfı, 1, 2, 3, 4. Sınıflar',
    suggestedCourses: 'Fen Bilimleri, Matematik, Teknoloji'
  },
  {
    id: 'kon-2',
    city: 'Konya',
    district: 'Selçuklu',
    category: 'Hayvanat Bahçesi / Akvaryum / Kelebek Bahçesi',
    name: 'Konya Tropikal Kelebek Bahçesi ve Böcek Müzesi',
    address: 'Parsana Mah. İsmail Kaya Cad. Selçuklu / Konya',
    description: 'Binlerce serbest uçan tropikal kelebek, böcek köyü ve botanik yağmur ormanı atmosferi.',
    suitableGrades: 'Tüm Kademeler',
    suggestedCourses: 'Fen Bilimleri, Hayat Bilgisi, Çevre Eğitimi'
  },
  {
    id: 'gaz-1',
    city: 'Gaziantep',
    district: 'Şehitkamil',
    category: 'Müze (Tarih, Sanat, Arkeoloji, Denizcilik, Havacılık)',
    name: 'Zeugma Mozaik Müzesi',
    address: 'Mithatpaşa Mah. Hacı Sani Konukoğlu Bulvarı Şehitkamil / Gaziantep',
    description: 'Çingene Kızı mozaiği, Roma dönemi villaları, antik mozaik restorasyon atölyesi.',
    suitableGrades: '3, 4. Sınıflar',
    suggestedCourses: 'Sosyal Bilgiler, Görsel Sanatlar, Tarih'
  }
];

export const INITIAL_EMPTY_PLAN = {
  status: 'taslak' as const,
  city: 'İstanbul',
  district: 'Üsküdar',
  schoolName: 'Zeynep Kamil İlkokulu',
  clubName: 'Sosyal Etkinlikler ve Gezi İnceleme Kulübü',
  documentDate: new Date().toISOString().split('T')[0],
  documentNumber: '', // Boş gelsin
  principalName: 'Recep KIZILIRMAK', // Varsayılan Okul Müdürü
  deputyPrincipalName: 'Fudan FİDAN', // Varsayılan Müdür Yardımcısı
  
  destinationCategory: 'Tüm Kategoriler',
  destinationMode: 'preset' as const,
  selectedCity: 'İstanbul',
  selectedDistrict: 'Üsküdar',
  destinationName: '',
  destinationAddress: '',
  tripType: 'İl İçi' as const,
  tripDuration: 'Günübirlik' as const,
  
  targetGrades: '',
  gradeRows: [
    {
      id: 'gr-1',
      gradeName: '',
      maleCount: 0,
      femaleCount: 0,
      totalCount: 0
    }
  ],
  maleStudentCount: 0,
  femaleStudentCount: 0,
  totalStudentCount: 0,
  totalTeacherCount: 2,
  totalCompanionCount: 2,
  
  courseName: 'Hayat Bilgisi (Maarif Modeli)',
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
  travelRoute: 'Okul -> Gezi Güzergâhı -> Etkinlik Alanı -> Okul',
  
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
  gradeRows: [
    {
      id: 'gr-1',
      gradeName: '3-A',
      maleCount: 10,
      femaleCount: 11,
      totalCount: 21
    },
    {
      id: 'gr-2',
      gradeName: '3-B',
      maleCount: 9,
      femaleCount: 10,
      totalCount: 19
    }
  ],
  maleStudentCount: 19,
  femaleStudentCount: 21,
  totalStudentCount: 40,
  destinationMode: 'preset' as const,
  selectedCity: 'İstanbul',
  selectedDistrict: 'Üsküdar',
  destinationName: 'Bilim Üsküdar (Üsküdar Bilim Merkezi)',
  destinationAddress: 'Ünalan Mah. Mahmut Gazi Cad. No:1 Üsküdar / İstanbul',
  courseName: 'Fen Bilimleri (Maarif Modeli)',
  subjectTopic: 'Uzay, Havacılık ve Temel Bilimler Keşif Yolculuğu',
  purpose: 'Öğrencilerin interaktif düzenekler ile deneyimleyerek öğrenmeleri, astronomi ve uzay bilimlerine ilgi duymaları, bilim merkezleri farkındalığı kazanmaları.',
  outcomes: 'FB.3.4.ÖÇ1. Geçmişte ve günümüzde kullanılan teknolojik ürünleri bilim merkezinde deney düzenekleriyle keşfeder.\nFB.3.1.ÖÇ1. Dünya\'nın katmanlarını ve uzay teknolojilerini planetaryum gösterisinde inceler.\nHB.3.5.ÖÇ1. Bilim merkezlerinde grup kurallarına ve güvenlik yönergelerine uyar.',
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
    }
  ]
};
