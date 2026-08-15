import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { pengajar_id, kategori, mata_pelajaran, kelas, nama_modul, username } = await request.json();

    if (!nama_modul || !mata_pelajaran || !kelas) {
      return NextResponse.json({ success: false, message: 'Data modul tidak lengkap.' }, { status: 400 });
    }

    const { data: newMod, error } = await supabase
      .from('modules')
      .insert([
        {
          pengajar_id: pengajar_id || null,
          kategori: kategori || mata_pelajaran,
          mata_pelajaran,
          kelas,
          nama_modul,
          status_approval: 'draft',
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    // Catat log
    await supabase.from('activity_logs').insert([
      {
        user_id: pengajar_id || null,
        action: 'Input Modul Baru',
        details: `Pengajar @${username || 'user'} membuat modul "${nama_modul}" (${mata_pelajaran} - ${kelas}).`,
      },
    ]);

    return NextResponse.json({ success: true, data: newMod });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status_approval, username, nama_modul } = await request.json();

    const { data, error } = await supabase
      .from('modules')
      .update({ status_approval, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (status_approval === 'pending') {
      await supabase.from('activity_logs').insert([
        {
          user_id: null,
          action: 'Pengajuan Modul Tryout',
          details: `Pengajar @${username || 'user'} mengajukan modul "${nama_modul}" untuk Try Out TKA SD.`,
        },
      ]);
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const username = searchParams.get('username');
    const namaModul = searchParams.get('nama_modul');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID modul diperlukan.' }, { status: 400 });
    }

    const { error } = await supabase.from('modules').delete().eq('id', id);
    if (error) throw error;

    await supabase.from('activity_logs').insert([
      {
        user_id: null,
        action: 'Hapus Modul',
        details: `Pengajar @${username || 'user'} menghapus modul "${namaModul || 'Modul'}".`,
      },
    ]);

    return NextResponse.json({ success: true, message: 'Modul berhasil dihapus.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
