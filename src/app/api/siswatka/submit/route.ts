import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { student_id, module_id, nisn, nama_lengkap, nama_modul, mata_pelajaran, total_soal, jawaban_siswa } = body;

    if (!student_id || !module_id || !nisn || !nama_lengkap) {
      return NextResponse.json(
        { success: false, message: 'Data siswa atau modul tidak lengkap.' },
        { status: 400 }
      );
    }

    // Hitung skor berdasarkan jawaban benar
    let benarCount = 0;
    if (jawaban_siswa && Array.isArray(jawaban_siswa)) {
      jawaban_siswa.forEach((item: any) => {
        if (item.benar) benarCount++;
      });
    }

    // Hitung skor akhir (misal skala 100)
    const skor = total_soal > 0 ? Math.round((benarCount / total_soal) * 100) : 0;

    const { data: result, error } = await supabase
      .from('exam_results')
      .insert([
        {
          student_id,
          module_id,
          nisn,
          nama_lengkap,
          nama_modul,
          mata_pelajaran,
          skor,
          total_soal,
          jawaban_siswa: JSON.stringify(jawaban_siswa),
          waktu_selesai: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Terjadi kesalahan pada server saat menyimpan hasil.' },
      { status: 500 }
    );
  }
}
