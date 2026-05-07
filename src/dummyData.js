export const pasienDummy = [
  { id: 1, rm: "RM-00123", nama: "Tn. Budi Santoso", umur: 45, diagnosis: "Hipertensi Grade II", waktu: "08:30 WIB", status: "Rawat Inap" },
  { id: 2, rm: "RM-00124", nama: "Ny. Siti Aminah", umur: 62, diagnosis: "Diabetes Mellitus Tipe 2", waktu: "08:45 WIB", status: "Rawat Jalan" },
  { id: 3, rm: "RM-00125", nama: "An. Doni Pratama", umur: 8, diagnosis: "Demam Berdarah (DHF)", waktu: "09:10 WIB", status: "IGD" },
  { id: 4, rm: "RM-00126", nama: "Tn. Ahmad Hidayat", umur: 58, diagnosis: "PPOK Eksaserbasi Akut", waktu: "09:30 WIB", status: "Rawat Inap" },
];

export const dataRingkasan = {
  nama: "Tn. Ahmad Hidayat",
  umur: 58,
  rm: "123456",
  diagnosis: "Hipertensi Grade II, PPOK Eksaserbasi Akut",
  keluhan: "Sesak napas, batuk berdahak"
};

export const dataResume = {
  nama: "Ny. Siti",
  umur: 65,
  rm: "789012",
  diagnosis: "Diabetes Mellitus Tipe 2, Luka Kaki Diabetik",
  terapi: "Metformin 500mg 2x1, Perawatan luka rutin",
  tanggalKeluar: "21/07/2023"
};

export const riwayatKunjungan = [
  {
    id: 1,
    tanggal: "15 Agustus 2026",
    poli: "Poli Penyakit Dalam",
    dokter: "Dr. Ilham Eka",
    diagnosis: "Hipertensi Grade II, PPOK Eksaserbasi Akut",
    keterangan: "Pasien datang dengan keluhan sesak napas berat dan batuk berdahak. Dilakukan nebulisasi di IGD dan disarankan rawat inap."
  },
  {
    id: 2,
    tanggal: "10 Juli 2026",
    poli: "Poli Penyakit Dalam",
    dokter: "Dr. Ilham Eka",
    diagnosis: "PPOK Stabil",
    keterangan: "Kontrol rutin bulanan. Sesak napas berkurang. Pasien dianjurkan melanjutkan terapi inhaler."
  },
  {
    id: 3,
    tanggal: "05 Juni 2026",
    poli: "Poli Penyakit Dalam",
    dokter: "Dr. Budi Santoso",
    diagnosis: "PPOK Eksaserbasi Ringan",
    keterangan: "Pasien mengeluh batuk meningkat akibat cuaca dingin. Diberikan resep mukolitik tambahan."
  }
];