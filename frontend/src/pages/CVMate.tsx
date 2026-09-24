import { useRef, useState } from 'react';
import type { CareerDocumentType } from '@careermate/contracts';
import { useMutation } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, FileText, Lightbulb, Loader2, LockKeyhole, ShieldCheck, Sparkles, Upload } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import DemoModeNotice from '@/components/DemoModeNotice';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { ApiClientError, careerMateApi } from '@/lib/api-client';
import { saveCvReviewHistory } from '@/lib/cv-review-history';

const MAX_CONTENT_LENGTH = 50_000;

function errorMessage(error: unknown): string {
  if (error instanceof ApiClientError) return error.message;
  return 'Simulasi review CV gagal. Silakan coba kembali.';
}

const CVMate = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const fileInput = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [documentType, setDocumentType] = useState<CareerDocumentType>('cv');
  const [fileName, setFileName] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [consent, setConsent] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const reviewMutation = useMutation({
    mutationFn: () => careerMateApi.reviewDocument({
      consentToAiProcessing: true,
      documentType,
      content,
      ...(targetRole.trim() ? { targetRole: targetRole.trim() } : {}),
      ...(jobDescription.trim() ? { jobDescription: jobDescription.trim() } : {}),
      language,
    }),
    onSuccess: (review) => {
      saveCvReviewHistory({ review, documentType, fileName, targetRole });
      navigate('/cvmate/dashboard', { state: { review, content, documentType, fileName, targetRole } });
    },
  });

  const microlearningTips = [
    {
      ready: /\b(memimpin|mengembangkan|meningkatkan|mengurangi|mencapai|menganalisis|membangun|led|built|improved|reduced|achieved|analyzed|developed)\b/i.test(content),
      title: 'Mulai dengan action verb',
      description: 'Gunakan kata kerja aktif seperti “meningkatkan”, “memimpin”, atau “mengembangkan”.',
    },
    {
      ready: /\b\d+(?:[.,]\d+)?\s*(?:%|x|orang|pengguna|proyek|juta|ribu|jt|rb)?\b/i.test(content),
      title: 'Tambahkan metric dan impact',
      description: 'Ubah tugas menjadi dampak: Action Verb + Metric + Impact, misalnya “meningkatkan konversi 18%”.',
    },
    {
      ready: content.length > 0 && !/(?:\|[^\n]+\|)|(?:\t{2,})/.test(content),
      title: 'Pertahankan format ATS',
      description: 'Gunakan judul bagian dan bullet sederhana; hindari tabel, kolom rumit, ikon, dan informasi di gambar.',
    },
  ];

  const handleFile = async (file: File) => {
    setFileError(null);
    const isText = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt') || file.name.toLowerCase().endsWith('.md');
    if (!isText) {
      setFileError('Gunakan berkas .txt atau .md. PDF/DOCX belum diproses sampai parser dokumen yang aman tersedia.');
      return;
    }
    if (file.size > MAX_CONTENT_LENGTH) {
      setFileError('Ukuran teks CV maksimum 50 KB.');
      return;
    }
    const text = await file.text();
    setContent(text);
    setFileName(file.name);
  };

  const canSubmit = content.trim().length >= 20 && content.length <= MAX_CONTENT_LENGTH && consent && !reviewMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 pb-20 pt-32">
        <DemoModeNotice />
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><FileText className="h-7 w-7 text-primary" /></div>
          <h1 className="mb-4 text-4xl font-bold md:text-6xl">Review CV atau Motivation Letter</h1>
          <p className="text-lg text-muted-foreground">Teks diproses secara lokal untuk menampilkan contoh hasil review. Tidak ada dokumen yang dikirim keluar dari browser.</p>
          <Button asChild variant="outline" className="mt-5"><Link to="/cvmate/generate"><Sparkles className="mr-2 h-4 w-4" />Coba simulasi pembuatan dokumen</Link></Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Isi {documentType === 'cv' ? 'CV' : 'Motivation Letter'}</h2>
                <p className="text-sm text-muted-foreground">Tempelkan isi dokumen atau unggah berkas teks.</p>
              </div>
              <input ref={fileInput} type="file" accept=".txt,.md,text/plain,text/markdown" className="hidden" onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
              }} />
              <Button variant="outline" onClick={() => fileInput.current?.click()}><Upload className="mr-2 h-4 w-4" />Unggah teks</Button>
            </div>
            {fileName && <p className="mb-3 text-sm text-primary">Berkas: {fileName}</p>}
            {fileError && <p className="mb-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{fileError}</p>}
            <Textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Nama, ringkasan profesional, pengalaman, pendidikan, dan keterampilan..." className="min-h-[440px] resize-y" maxLength={MAX_CONTENT_LENGTH} />
            <p className="mt-2 text-right text-xs text-muted-foreground">{content.length.toLocaleString('id-ID')} / {MAX_CONTENT_LENGTH.toLocaleString('id-ID')} karakter</p>
            <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="mb-3 flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-500" /><h3 className="font-semibold">Microlearning kontekstual</h3></div>
              <div className="grid gap-3 sm:grid-cols-3">
                {microlearningTips.map((tip) => (
                  <div key={tip.title} className="rounded-lg bg-background/70 p-3">
                    <div className="mb-1 flex items-start gap-2"><CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${tip.ready ? 'text-emerald-500' : 'text-muted-foreground/40'}`} /><p className="text-sm font-semibold">{tip.title}</p></div>
                    <p className="text-xs leading-relaxed text-muted-foreground">{tip.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="space-y-4 p-6">
              <div><label htmlFor="review-document-type" className="mb-2 block text-sm font-medium">Jenis dokumen</label><select id="review-document-type" value={documentType} onChange={(event) => setDocumentType(event.target.value as CareerDocumentType)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="cv">CV</option><option value="motivation_letter">Motivation Letter</option></select></div>
              <div><label htmlFor="target-role" className="mb-2 block text-sm font-medium">Target posisi</label><Input id="target-role" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="Contoh: Product Manager" maxLength={200} /></div>
              <div><label htmlFor="job-description" className="mb-2 block text-sm font-medium">Deskripsi lowongan (opsional)</label><Textarea id="job-description" value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="Tempel deskripsi lowongan untuk review yang lebih spesifik" className="min-h-32" maxLength={30_000} /></div>
            </Card>

            <Card className="border-primary/20 bg-primary/5 p-6">
              <div className="mb-4 flex items-start gap-3"><LockKeyhole className="mt-0.5 h-5 w-5 text-primary" /><div><h3 className="font-semibold">Konfirmasi simulasi</h3><p className="mt-1 text-sm text-muted-foreground">Hasil berikut memakai respons hardcode untuk demonstrasi antarmuka dan bukan evaluasi AI atau ATS nyata.</p></div></div>
              <label className="flex cursor-pointer items-start gap-3 text-sm"><Checkbox checked={consent} onCheckedChange={(value) => setConsent(value === true)} /><span>Saya memahami bahwa hasil review ini hanya simulasi.</span></label>
            </Card>

            {reviewMutation.isError && <Card className="border-destructive/30 p-4 text-sm text-destructive">{errorMessage(reviewMutation.error)}</Card>}
            <Button size="lg" className="w-full" disabled={!canSubmit} onClick={() => reviewMutation.mutate()}>
              {reviewMutation.isPending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Menyiapkan simulasi...</> : <><Sparkles className="mr-2 h-5 w-5" />Lihat simulasi review<ArrowRight className="ml-2 h-5 w-5" /></>}
            </Button>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4" />Isi dokumen tidak dikirim ke server mana pun.</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CVMate;
