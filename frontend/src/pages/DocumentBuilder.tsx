import type { CareerDocumentType } from '@careermate/contracts';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, Download, FilePlus2, Loader2, LockKeyhole, Sparkles } from 'lucide-react';
import { useState } from 'react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { ApiClientError, careerMateApi } from '@/lib/api-client';
import { loadCandidateProfile } from '@/lib/candidate-profile';

type Tone = 'professional' | 'confident' | 'concise';

function errorMessage(error: unknown): string {
  if (error instanceof ApiClientError) return error.message;
  return 'Dokumen gagal dibuat. Periksa profil, backend, dan konfigurasi provider AI.';
}

const DocumentBuilder = () => {
  const { language } = useLanguage();
  const [documentType, setDocumentType] = useState<CareerDocumentType>('cv');
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState<Tone>('professional');
  const [consent, setConsent] = useState(false);

  const profileQuery = useQuery({
    queryKey: ['candidate-profile'],
    queryFn: loadCandidateProfile,
  });

  const generateMutation = useMutation({
    mutationFn: () => careerMateApi.generateDocument({
      consentToAiProcessing: true,
      documentType,
      profile: profileQuery.data!,
      targetRole: targetRole.trim(),
      ...(jobDescription.trim() ? { jobDescription: jobDescription.trim() } : {}),
      tone,
      language,
    }),
    onSettled: () => setConsent(false),
  });

  const canGenerate = Boolean(profileQuery.data) && targetRole.trim().length > 0 && consent && !generateMutation.isPending;

  const downloadDocument = () => {
    if (!generateMutation.data) return;
    const blob = new Blob([generateMutation.data.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${documentType === 'cv' ? 'cv' : 'motivation-letter'}-${targetRole.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'careermate'}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 pb-20 pt-32">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4"><Sparkles className="mr-1 h-3.5 w-3.5" />AI Document Builder</Badge>
          <h1 className="text-4xl font-bold md:text-6xl">Buat CV atau Motivation Letter</h1>
          <p className="mt-4 text-lg text-muted-foreground">Konten dibuat hanya dari profil CareerMate Anda dan tidak boleh menambahkan pengalaman atau kredensial baru.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FilePlus2 className="h-5 w-5 text-primary" />Konfigurasi dokumen</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div><label htmlFor="document-type" className="mb-2 block text-sm font-medium">Jenis dokumen</label><select id="document-type" value={documentType} onChange={(event) => setDocumentType(event.target.value as CareerDocumentType)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="cv">CV</option><option value="motivation_letter">Motivation Letter</option></select></div>
              <div><label htmlFor="builder-role" className="mb-2 block text-sm font-medium">Posisi target</label><Input id="builder-role" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="Contoh: Data Analyst" maxLength={200} /></div>
              <div><label htmlFor="builder-tone" className="mb-2 block text-sm font-medium">Gaya bahasa</label><select id="builder-tone" value={tone} onChange={(event) => setTone(event.target.value as Tone)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="professional">Profesional</option><option value="confident">Percaya diri</option><option value="concise">Ringkas</option></select></div>
              <div><label htmlFor="builder-job" className="mb-2 block text-sm font-medium">Deskripsi lowongan (opsional)</label><Textarea id="builder-job" value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} className="min-h-36" maxLength={30_000} /></div>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm"><Checkbox checked={consent} onCheckedChange={(value) => setConsent(value === true)} /><span>Saya menyetujui pengiriman data profil dan konteks lowongan untuk satu kali pembuatan dokumen AI.</span></label>
              {profileQuery.isLoading && <p className="flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Memuat profil...</p>}
              {profileQuery.isError && <p className="text-sm text-destructive">Profil tidak dapat dimuat. Pastikan Anda sudah login dan backend aktif.</p>}
              {generateMutation.isError && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{errorMessage(generateMutation.error)}</p>}
              <Button className="w-full" size="lg" disabled={!canGenerate} onClick={() => generateMutation.mutate()}>{generateMutation.isPending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Membuat dokumen...</> : <><Sparkles className="mr-2 h-5 w-5" />Buat dokumen</>}</Button>
              <p className="flex items-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="h-4 w-4" />Consent direset setelah setiap request.</p>
            </CardContent>
          </Card>

          <Card className="min-h-[560px]">
            <CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle>Hasil dokumen</CardTitle>{generateMutation.data && <Button variant="outline" onClick={downloadDocument}><Download className="mr-2 h-4 w-4" />Unduh teks</Button>}</div></CardHeader>
            <CardContent>
              {!generateMutation.data ? <div className="flex min-h-[420px] flex-col items-center justify-center text-center text-muted-foreground"><FilePlus2 className="mb-4 h-12 w-12" /><p>Lengkapi konfigurasi dan berikan consent untuk membuat dokumen.</p></div> : <div className="space-y-6"><div><h2 className="text-2xl font-bold">{generateMutation.data.title}</h2><pre className="mt-4 whitespace-pre-wrap rounded-xl bg-muted/50 p-5 font-sans text-sm leading-relaxed">{generateMutation.data.content}</pre></div><div><h3 className="mb-3 font-semibold">Checklist akhir</h3><ul className="space-y-2">{generateMutation.data.checklist.map((item) => <li key={item} className="flex gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />{item}</li>)}</ul></div></div>}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DocumentBuilder;
