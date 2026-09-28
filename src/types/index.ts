export interface GradeStudentRow {
  id: string;
  gradeName: string; // Örn: '3-A', 'Anasınıfı-B', '4-C'
  maleCount: number;
  femaleCount: number;
  totalCount: number;
}

export interface GeziTeacher {
  id: string;
  fullName: string;
  branch: string;
  role: string; // 'Kafile Başkanı' | 'Görevli Öğretmen' | 'Rehber Öğretmen' | 'Müdür Yardımcısı'
  phone: string;
  tcNo?: string;
}

export interface GeziCompanion {
  id: string;
  fullName: string;
  role: string; // 'Veli' | 'Okul Aile Birliği Üyesi' | 'Sağlık Personeli'
  phone: string;
}

export interface GeziScheduleItem {
  id: string;
  timeRange: string;
  activity: string;
  location: string;
  responsible: string;
}

export interface GeziPlanData {
  id: string;
  createdAt: string;
  updatedAt: string;
  
  // 1. İdari ve Okul Bilgileri
  city: string;
  district: string;
  schoolName: string;
  clubName: string;
  documentDate: string;
  documentNumber: string;
  principalName: string;
  deputyPrincipalName: string;
  
  // 2. Gezi Mekan & Türü
  destinationCategory: string;
  destinationMode: 'preset' | 'custom';
  selectedCity: string;
  selectedDistrict: string; // Gezi yeri ilçe seçimi
  destinationName: string;
  destinationAddress: string;
  tripType: 'İl İçi' | 'İl Dışı';
  tripDuration: 'Günübirlik' | 'Konaklamalı';
  
  // 3. Hedef Kitle & Katılımcılar (Her sınıf yeni satırda ve toplam)
  targetGrades: string;
  gradeRows: GradeStudentRow[];
  maleStudentCount: number;
  femaleStudentCount: number;
  totalStudentCount: number;
  totalTeacherCount: number;
  totalCompanionCount: number;
  
  // 4. Eğitim & Kazanım Bilgileri
  courseName: string;
  subjectTopic: string;
  purpose: string;
  outcomes: string; // Öğrenme Çıktıları / Kazanımları
  
  // 5. Tarih, Zaman ve Ulaşım
  tripDate: string;
  departureTime: string;
  returnTime: string;
  departureLocation: string;
  returnLocation: string;
  transportationType: 'Okul Servis Aracı' | 'Özel Turizm Otobüsü' | 'Belediye / Toplu Taşıma' | 'Yürüyerek' | 'Diğer';
  vehiclePlate: string;
  driverName: string;
  driverPhone: string;
  transportCompany: string;
  travelRoute: string;
  
  // 6. Kafile ve Görevliler
  headTeacher: GeziTeacher;
  teachers: GeziTeacher[];
  companions: GeziCompanion[];
  
  // 7. Zaman Akış Çizelgesi
  schedule: GeziScheduleItem[];
  
  // 8. Öncesi - Sırası - Sonrası Süreç
  preTripNotes: string;
  duringTripNotes: string;
  postTripNotes: string;
  
  // 9. Güvenlik & İlkyardım Tedbirleri
  safetyMeasures: string;
}

export interface PresetLocation {
  id: string;
  city: string;
  district?: string;
  category: string;
  name: string;
  address: string;
  description?: string;
  suitableGrades?: string;
  suggestedCourses?: string;
}
