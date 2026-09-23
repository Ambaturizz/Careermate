import type { InterviewFeedbackResponse } from '@careermate/contracts';
import { useMutation } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  UserCheck,
} from 'lucide-react';
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

type Seniority = 'intern' | 'junior' | 'mid';

type FeedbackInput = {
  questionId: string;
  question: string;
  answer: string;
};

function errorMessage(error: unknown): string {
  if (error instanceof ApiClientError) return error.message;
  return 'Simulasi wawancara gagal diproses. Pastikan backend dan provider AI aktif.';
}

const InterviewMate = () => {
  const { language } = useLanguage();
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [seniority, setSeniority] = useState<Seniority>('intern');
  const [jobDescription, setJobDescription] = useState('');
  const [planConsent, setPlanConsent] = useState(false);
  const [feedbackConsent, setFeedbackConsent] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedbackByQuestion, setFeedbackByQuestion] = useState<Record<string, InterviewFeedbackResponse>>({});

  const planMutation = useMutation({
    mutationFn: () => {
      const companyContext = `Perusahaan target: ${targetCompany.trim()}`;
      const contextualDescription = jobDescription.trim()
        ? `${companyContext}\n\nDeskripsi lowongan:\n${jobDescription.trim()}`
        : companyContext;

      return careerMateApi.createInterviewPlan({
        consentToAiProcessing: true,
        targetRole: targetRole.trim(),
        seniority,
        focusAreas: ['Jawaban terstruktur dengan metode STAR'],
        jobDescription: contextualDescription,
        questionCount: 5,
        language,
      });
    },
    onSuccess: () => {
      setCurrentQuestionIndex(0);
      setAnswers({});
      setFeedbackByQuestion({});
      setPlanConsent(false);
      setFeedbackConsent(false);
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: (input: FeedbackInput) => careerMateApi.reviewInterviewAnswer({
      consentToAiProcessing: true,
      ...(plan?.sessionId ? { sessionId: plan.sessionId } : {}),
      questionId: input.questionId,
      targetRole: targetRole.trim(),
      targetCompany: targetCompany.trim(),
      seniority,
      ...(jobDescription.trim() ? { jobDescription: jobDescription.trim() } : {}),
      question: input.question,
      evaluationCriteria: currentQuestion?.evaluationCriteria,
      answer: input.answer,
      language,
    }),
    onSuccess: (feedback, input) => {
      setFeedbackByQuestion((current) => ({ ...current, [input.questionId]: feedback }));
    },
    onSettled: () => setFeedbackConsent(false),
  });

  const plan = planMutation.data;
  const currentQuestion = plan?.questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] ?? '' : '';
  const currentFeedback = currentQuestion ? feedbackByQuestion[currentQuestion.id] : undefined;
  const completedFeedback = Object.values(feedbackByQuestion);
  const readinessScore = completedFeedback.length
    ? Math.round(completedFeedback.reduce((total, feedback) => total + feedback.score, 0) / completedFeedback.length)
    : null;
  const canCreatePlan = targetRole.trim().length > 0 && targetCompany.trim().length > 0 && planConsent && !planMutation.isPending;

  const resetSimulation = () => {
    planMutation.reset();
    feedbackMutation.reset();
    setCurrentQuestionIndex(0);
    setAnswers({});
    setFeedbackByQuestion({});
    setPlanConsent(false);
    setFeedbackConsent(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 pb-20 pt-32">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <Badge className="mb-4" variant="secondary"><Sparkles className="mr-1 h-3.5 w-3.5" />Evaluasi Baseline AI</Badge>
          <h1 className="text-4xl font-bold md:text-6xl">InterviewMate</h1>
          <p className="mt-4 text-lg text-muted-foreground">Latihan adaptif sesuai posisi dan perusahaan target, lalu perbaiki jawaban Anda dengan rubrik STAR.</p>
        </div>

        {!plan ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" />Konfigurasi simulasi</CardTitle></CardHeader>
              <CardContent>
                <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); if (canCreatePlan) planMutation.mutate(); }}>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div><label htmlFor="interview-role" className="mb-2 block text-sm font-medium">Posisi yang dituju</label><Input id="interview-role" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="Contoh: Product Manager" maxLength={200} required /></div>
                    <div><label htmlFor="interview-company" className="mb-2 block text-sm font-medium">Perusahaan target</label><Input id="interview-company" value={targetCompany} onChange={(event) => setTargetCompany(event.target.value)} placeholder="Contoh: Unilever" maxLength={150} required /></div>
                  </div>
                  <div>
                    <label htmlFor="interview-seniority" className="mb-2 block text-sm font-medium">Tingkat pengalaman</label>
                    <select id="interview-seniority" value={seniority} onChange={(event) => setSeniority(event.target.value as Seniority)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <option value="intern">Intern / Magang</option>
                      <option value="junior">Junior</option>
                      <option value="mid">Mid-level</option>
                    </select>
                  </div>
                  <div><label htmlFor="interview-job-description" className="mb-2 block text-sm font-medium">Deskripsi lowongan (opsional)</label><Textarea id="interview-job-description" value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="Tempel tanggung jawab dan kualifikasi utama agar pertanyaan lebih relevan." className="min-h-40" maxLength={29_000} /></div>

                  <Card className="border-primary/20 bg-primary/5 p-4">
                    <div className="mb-3 flex items-start gap-3"><LockKeyhole className="mt-0.5 h-5 w-5 text-primary" /><div><p className="font-semibold">Persetujuan pemrosesan AI</p><p className="mt-1 text-sm text-muted-foreground">Konteks lowongan dan jawaban latihan akan dikirim ke provider AI yang dikonfigurasi untuk simulasi ini.</p></div></div>
                    <label className="flex cursor-pointer items-start gap-3 text-sm"><Checkbox checked={planConsent} onCheckedChange={(value) => setPlanConsent(value === true)} /><span>Saya menyetujui pengiriman konteks ini untuk membuat satu rencana wawancara AI.</span></label>
                  </Card>

                  {planMutation.isError && <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{errorMessage(planMutation.error)}</div>}
                  <Button type="submit" size="lg" className="w-full" disabled={!canCreatePlan}>{planMutation.isPending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Menyusun simulasi...</> : <><MessageCircle className="mr-2 h-5 w-5" />Mulai simulasi</>}</Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="p-5"><Building2 className="mb-3 h-6 w-6 text-primary" /><h2 className="font-semibold">Personal per perusahaan</h2><p className="mt-1 text-sm text-muted-foreground">Nama perusahaan dan deskripsi lowongan menjadi konteks penyusunan pertanyaan.</p></Card>
              <Card className="p-5"><Star className="mb-3 h-6 w-6 text-amber-500" /><h2 className="font-semibold">Rubrik STAR</h2><p className="mt-1 text-sm text-muted-foreground">Bangun jawaban dengan Situation, Task, Action, dan Result yang terukur.</p></Card>
              <Card className="p-5"><UserCheck className="mb-3 h-6 w-6 text-emerald-500" /><h2 className="font-semibold">Validasi mentor HR</h2><p className="mt-1 text-sm text-muted-foreground">Lapisan review profesional tersedia sebagai benefit paket Premium.</p></Card>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{seniority}</Badge><span className="font-semibold">{targetRole}</span><span className="text-muted-foreground">di {targetCompany}</span></div><p className="mt-2 text-sm text-muted-foreground">Pertanyaan {currentQuestionIndex + 1} dari {plan.questions.length}</p></div>
                <Button variant="outline" onClick={resetSimulation}><RefreshCw className="mr-2 h-4 w-4" />Konfigurasi ulang</Button>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${((currentQuestionIndex + 1) / plan.questions.length) * 100}%` }} /></div>
            </Card>

            {readinessScore !== null && (
              <Card className="border-primary/20 bg-primary/5 p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-8 border-primary/20 text-3xl font-bold text-primary">{readinessScore}</div>
                  <div className="flex-1"><div className="mb-2 flex flex-wrap items-center gap-2"><h2 className="text-xl font-bold">{completedFeedback.length === plan.questions.length ? 'Skor kesiapan wawancara' : 'Skor sementara'}</h2><Badge>Evaluasi Baseline AI</Badge></div><p className="text-sm text-muted-foreground">Rata-rata dari {completedFeedback.length} jawaban yang telah dievaluasi. Skor ini adalah alat latihan, bukan jaminan hasil rekrutmen.</p></div>
                  <Button variant="outline" disabled title="Tersedia untuk akun Premium setelah alur mentor diaktifkan"><UserCheck className="mr-2 h-4 w-4" />Minta Validasi Mentor HR</Button>
                </div>
              </Card>
            )}

            {currentQuestion && (
              <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                <Card>
                  <CardHeader><div className="mb-2 flex items-center justify-between gap-3"><Badge variant="secondary">{currentQuestion.type}</Badge><span className="text-sm text-muted-foreground">#{currentQuestionIndex + 1}</span></div><CardTitle className="text-2xl leading-relaxed">{currentQuestion.question}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div><label htmlFor="interview-answer" className="mb-2 block text-sm font-medium">Jawaban Anda</label><Textarea id="interview-answer" value={currentAnswer} onChange={(event) => setAnswers((current) => ({ ...current, [currentQuestion.id]: event.target.value }))} placeholder="Susun jawaban: Situation → Task → Action → Result..." className="min-h-56" maxLength={20_000} /></div>
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm"><Checkbox checked={feedbackConsent} onCheckedChange={(value) => setFeedbackConsent(value === true)} /><span>Saya menyetujui pengiriman jawaban ini untuk satu kali evaluasi AI.</span></label>
                    {feedbackMutation.isError && <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{errorMessage(feedbackMutation.error)}</div>}
                    <Button className="w-full" disabled={currentAnswer.trim().length === 0 || !feedbackConsent || feedbackMutation.isPending} onClick={() => feedbackMutation.mutate({ questionId: currentQuestion.id, question: currentQuestion.question, answer: currentAnswer.trim() })}>{feedbackMutation.isPending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Mengevaluasi jawaban...</> : <><Sparkles className="mr-2 h-5 w-5" />Evaluasi jawaban</>}</Button>
                  </CardContent>
                </Card>

                <div className="space-y-5">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Kriteria evaluasi</CardTitle></CardHeader>
                    <CardContent><ul className="space-y-2 text-sm text-muted-foreground">{currentQuestion.evaluationCriteria.map((criterion) => <li key={criterion} className="flex gap-2"><Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{criterion}</li>)}</ul></CardContent>
                  </Card>
                  <Card className="border-amber-500/20 bg-amber-500/5 p-5"><h3 className="font-semibold">Pengingat STAR</h3><p className="mt-2 text-sm text-muted-foreground"><strong>S</strong>ituation: konteks singkat · <strong>T</strong>ask: tanggung jawab · <strong>A</strong>ction: tindakan spesifik Anda · <strong>R</strong>esult: dampak terukur.</p></Card>
                </div>
              </div>
            )}

            {currentFeedback && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-500" />Umpan balik jawaban — {Math.round(currentFeedback.score)}/100</CardTitle></CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div><h3 className="mb-3 font-semibold text-emerald-600">Kekuatan</h3><ul className="space-y-2 text-sm">{currentFeedback.strengths.map((item) => <li key={item} className="flex gap-2"><span className="text-emerald-500">•</span>{item}</li>)}</ul></div>
                  <div><h3 className="mb-3 font-semibold text-amber-600">Perlu ditingkatkan</h3><ul className="space-y-2 text-sm">{currentFeedback.improvements.map((item) => <li key={item} className="flex gap-2"><span className="text-amber-500">•</span>{item}</li>)}</ul></div>
                  <div className="md:col-span-2 rounded-lg bg-muted/50 p-4"><h3 className="mb-2 font-semibold">Kerangka jawaban yang lebih kuat</h3><ol className="space-y-2 text-sm text-muted-foreground">{currentFeedback.improvedAnswerOutline.map((item, index) => <li key={item}>{index + 1}. {item}</li>)}</ol><p className="mt-4 text-sm"><strong>Latihan berikutnya:</strong> {currentFeedback.nextExercise}</p></div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-between gap-3">
              <Button variant="outline" disabled={currentQuestionIndex === 0} onClick={() => { setFeedbackConsent(false); setCurrentQuestionIndex((index) => index - 1); }}><ArrowLeft className="mr-2 h-4 w-4" />Sebelumnya</Button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4" />{completedFeedback.length}/{plan.questions.length} jawaban dievaluasi</div>
              <Button disabled={!currentFeedback || currentQuestionIndex === plan.questions.length - 1} onClick={() => { setFeedbackConsent(false); setCurrentQuestionIndex((index) => index + 1); }}>Berikutnya<ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default InterviewMate;
