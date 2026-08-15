export type Role = 'superadmin' | 'admin' | 'pengajar';

export interface PengajarProfile {
  id: string;
  email: string;
  username: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface ModuleItem {
  id: string;
  pengajar_id: string;
  kategori: string;
  mata_pelajaran: string;
  kelas: string;
  nama_modul: string;
  status_approval: 'draft' | 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  pengajar_profiles?: {
    username: string;
    email: string;
  };
  questions_count?: number;
}

export interface QuestionItem {
  id: string;
  module_id: string;
  tipe_input: 'text' | 'image';
  pertanyaan: string;
  gambar_url?: string | null;
  opsi_a: string;
  opsi_b: string;
  opsi_c: string;
  opsi_d: string;
  jawaban_benar: 'A' | 'B' | 'C' | 'D';
  durasi_detik?: number; // Durasi waktu pengerjaan per soal dalam detik
  created_at: string;
}

export interface ActivityLogItem {
  id: string;
  user_id: string | null;
  action: string;
  details?: string | null;
  created_at: string;
  pengajar_profiles?: {
    username: string;
    email: string;
  } | null;
}

export interface StudentResultItem {
  id: string;
  student_name: string;
  module_id: string;
  nilai: number;
  bahasa_pengerjaan?: string | null;
  created_at: string;
  modules?: {
    nama_modul: string;
    mata_pelajaran: string;
    kelas: string;
  };
}
