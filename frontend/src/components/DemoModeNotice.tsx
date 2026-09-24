import { FlaskConical } from 'lucide-react';
import { isDemoMode } from '@/lib/demo-mode';

export default function DemoModeNotice() {
  if (!isDemoMode) return null;

  return (
    <div className="mb-8 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100" role="status">
      <FlaskConical className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="font-semibold">Mode demo frontend</p>
        <p className="mt-1 opacity-90">Akun, lowongan, skor, dan hasil fitur AI adalah simulasi lokal. Tidak ada data yang dikirim ke backend atau provider AI.</p>
      </div>
    </div>
  );
}
