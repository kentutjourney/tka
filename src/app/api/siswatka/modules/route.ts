import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mapel = searchParams.get('mapel');

    let query = supabase
      .from('modules')
      .select(`
        id,
        nama_modul,
        mata_pelajaran,
        kelas,
        status_approval,
        pengajar_profiles(username)
      `)
      .eq('status_approval', 'approved')
      .order('created_at', { ascending: false });

    if (mapel) {
      query = query.eq('mata_pelajaran', mapel);
    }

    const { data: modules, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    // Ambil jumlah soal per modul (agar siswa tahu berapa soal)
    const modulesWithCounts = await Promise.all(
      modules.map(async (mod: any) => {
        const { count } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('module_id', mod.id);
        
        return {
          ...mod,
          total_soal: count || 0
        };
      })
    );

    return NextResponse.json({ success: true, data: modulesWithCounts });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
