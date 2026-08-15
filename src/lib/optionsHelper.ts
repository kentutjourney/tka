export interface QuestionOption {
  key: string; // 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', dst.
  text: string;
}

/**
 * Universal parser untuk membaca pilihan ganda (A, B, C, D, E, F, G, H, dst.)
 * Mendukung opsi standar maupun opsi dinamis berapapun jumlahnya tanpa batasan database.
 */
export function parseQuestionOptions(q: any): QuestionOption[] {
  if (!q) return [];

  // Jika opsi disimpan dengan format dinamis pada opsi_d
  if (q.opsi_d && typeof q.opsi_d === 'string' && q.opsi_d.startsWith('__JSON_OPTS__:')) {
    try {
      const jsonStr = q.opsi_d.replace('__JSON_OPTS__:', '');
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing dynamic options:', e);
    }
  }

  // Format kolom standar
  const opts: QuestionOption[] = [];
  if (q.opsi_a) opts.push({ key: 'A', text: q.opsi_a });
  if (q.opsi_b) opts.push({ key: 'B', text: q.opsi_b });
  if (q.opsi_c) opts.push({ key: 'C', text: q.opsi_c });
  if (q.opsi_d) opts.push({ key: 'D', text: q.opsi_d });
  if (q.opsi_e) opts.push({ key: 'E', text: q.opsi_e });
  if (q.opsi_f) opts.push({ key: 'F', text: q.opsi_f });
  if (q.opsi_g) opts.push({ key: 'G', text: q.opsi_g });
  if (q.opsi_h) opts.push({ key: 'H', text: q.opsi_h });

  return opts;
}

/**
 * Helper untuk mengemas list pilihan ganda ke format penyimpanan database yang aman.
 * Menjamin tidak akan pernah error "column not found" di database.
 */
export function formatOptionsForDatabase(options: QuestionOption[]) {
  if (!options || options.length === 0) {
    return { opsi_a: '', opsi_b: '', opsi_c: null, opsi_d: null };
  }

  // Jika opsi 4 atau kurang (A, B, C, D)
  if (options.length <= 4) {
    return {
      opsi_a: options[0]?.text || '',
      opsi_b: options[1]?.text || '',
      opsi_c: options[2]?.text || null,
      opsi_d: options[3]?.text || null,
    };
  }

  // Jika opsi lebih dari 4 (ada E, F, G, H, dst.)
  // Kita simpan A, B, C seperti biasa, dan opsi_d dikemas dengan penanda JSON lengkap
  return {
    opsi_a: options[0]?.text || '',
    opsi_b: options[1]?.text || '',
    opsi_c: options[2]?.text || '',
    opsi_d: '__JSON_OPTS__:' + JSON.stringify(options),
  };
}
