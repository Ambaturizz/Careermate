import { useMutation, useQuery } from '@tanstack/react-query';
import { Briefcase, BrainCircuit, Database, Download, FileText, FolderArchive, GraduationCap, Loader2, MessageCircle, RefreshCw, Sparkles, TrendingUp, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import DemoModeNotice from '@/components/DemoModeNotice';
import { useLanguage } from '@/contexts/LanguageContext';
import { ApiClientError, careerMateApi } from '@/lib/api-client';
import { buildCandidateProfile } from '@/lib/candidate-profile';
import { formatCvReviewSummary, listCvReviewHistory, type CvReviewHistoryItem } from '@/lib/cv-review-history';
import { signOut } from '@/lib/auth-client';
import { isDemoMode } from '@/lib/demo-mode';

function errorMessage(error: unknown): string {
  if (error instanceof ApiClientError) return error.message;
  return 'Dashboard tidak dapat memuat data.';
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [careerAiConsent, setCareerAiConsent] = useState(false);
  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const [profile, skills, interests, education, experience, jobs, recommendations, referenceSkills, occupations] = await Promise.all([
        careerMateApi.getProfile(),
        careerMateApi.listUserSkills(),
        careerMateApi.listUserInterests(),
        careerMateApi.listEducation(),
        careerMateApi.listExperience(),
        careerMateApi.listJobs({ limit: 5 }),
        careerMateApi.getCareerRecommendations(5),
        careerMateApi.listSkills({ limit: 8 }),
        careerMateApi.listOccupations({ limit: 4 }),
      ]);
      return { profile, skills, interests, education, experience, jobs, recommendations, referenceSkills, occupations };
    },
  });

  const careerAiMutation = useMutation({
    mutationFn: () => {
      const data = dashboardQuery.data!;
      return careerMateApi.careerRecommendations({
        consentToAiProcessing: true,
        profile: buildCandidateProfile({
          profile: data.profile,
          skills: data.skills.items,
          interests: data.interests.items,
          education: data.education.items,
          experience: data.experience.items,
        }),
        targetRoles: data.recommendations.recommendations.map((item) => item.title).slice(0, 5),
        limit: 5,
        language,
      });
    },
    onSettled: () => setCareerAiConsent(false),
  });

  if (dashboardQuery.isLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-9 w-9 animate-spin text-primary" /></div>;
  }

  if (dashboardQuery.isError) {
    const needsLogin = dashboardQuery.error instanceof ApiClientError && dashboardQuery.error.status === 401;
    return <div className="flex min-h-screen items-center justify-center bg-background p-6"><Card className="max-w-lg p-8 text-center"><h1 className="mb-2 text-2xl font-bold">{needsLogin ? 'Masuk untuk membuka dashboard' : 'Backend belum siap'}</h1><p className="mb-5 text-muted-foreground">{needsLogin ? 'Sesi Anda belum tersedia atau sudah berakhir.' : errorMessage(dashboardQuery.error)}</p>{needsLogin ? <Button asChild><Link to="/login">Masuk ke CareerMate</Link></Button> : <Button onClick={() => void dashboardQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" />Coba lagi</Button>}</Card></div>;
  }

  const data = dashboardQuery.data!;
  const reviewHistory = listCvReviewHistory();
  const stats = [
    { label: 'Skill profil', value: data.skills.items.length, icon: Sparkles },
    { label: 'Riwayat pendidikan', value: data.education.items.length, icon: GraduationCap },
    { label: 'Lowongan dataset', value: data.jobs.total, icon: Briefcase },
    { label: 'Rekomendasi karier', value: data.recommendations.recommendations.length, icon: UserRound },
  ];

  const downloadReview = (item: CvReviewHistoryItem) => {
    const blob = new Blob([formatCvReviewSummary(item)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `careermate-review-${item.createdAt.slice(0, 10)}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      <header className="border-b bg-background/90 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4"><Link to="/" className="text-2xl font-bold text-primary">CareerMate</Link><div className="flex items-center gap-3"><Badge variant="outline" className="hidden sm:inline-flex">{isDemoMode ? 'Demo lokal aktif' : 'Profil aktif'}</Badge><Button asChild variant="outline"><Link to="/">Beranda</Link></Button><Button variant="ghost" onClick={() => { signOut(); navigate('/login'); }}>Keluar</Button></div></div>
      </header>

      <main className="container mx-auto max-w-6xl px-6 py-12">
        <DemoModeNotice />
        <div className="mb-10"><h1 className="text-4xl font-bold">Selamat datang, {data.profile.fullName}</h1><p className="mt-2 text-lg text-muted-foreground">{data.profile.headline ?? 'Lengkapi profil untuk rekomendasi yang lebih baik.'}</p></div>

        <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => <Card key={label}><CardContent className="flex items-center justify-between p-6"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-3xl font-bold">{value}</p></div><div className="rounded-xl bg-primary/10 p-3 text-primary"><Icon className="h-6 w-6" /></div></CardContent></Card>)}
        </div>

        <div className="mb-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Button asChild size="lg" className="h-16"><Link to="/cvmate"><FileText className="mr-2 h-5 w-5" />Simulasi review CV</Link></Button>
          <Button asChild size="lg" variant="outline" className="h-16"><Link to="/jobmate"><Briefcase className="mr-2 h-5 w-5" />Jelajahi pekerjaan</Link></Button>
          <Button asChild size="lg" variant="outline" className="h-16"><Link to="/interviewmate"><MessageCircle className="mr-2 h-5 w-5" />Latihan wawancara</Link></Button>
          <Button asChild size="lg" variant="outline" className="h-16"><Link to="/cvmate/generate"><Sparkles className="mr-2 h-5 w-5" />Simulasi dokumen</Link></Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Rekomendasi karier deterministik</CardTitle></CardHeader>
            <CardContent className="space-y-4">{data.recommendations.recommendations.map((item) => <div key={item.occupationId} className="rounded-lg border p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{item.title}</h3><p className="mt-1 text-xs text-muted-foreground">Skill cocok: {item.matchedSkills.slice(0, 3).join(', ') || 'belum ada'}</p></div><Badge>{Math.round(item.compatibility * 100)}%</Badge></div></div>)}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Lowongan terbaru di dataset</CardTitle></CardHeader>
            <CardContent className="space-y-4">{data.jobs.items.map((job) => <div key={job.id} className="rounded-lg border p-4"><h3 className="font-semibold">{job.title}</h3><p className="text-sm text-muted-foreground">{job.companyName}{job.location ? ` · ${job.location}` : ''}</p><div className="mt-2 flex gap-2">{job.workMode && <Badge variant="outline">{job.workMode}</Badge>}{job.isSynthetic && <Badge variant="secondary">Data demo</Badge>}</div></div>)}<Button asChild variant="link" className="px-0"><Link to="/jobmate">Lihat semua lowongan</Link></Button></CardContent>
          </Card>
        </div>

        <section className="pt-10">
          <Card className="border-primary/20">
            <CardHeader><CardTitle className="flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-primary" />Simulasi penjelasan jalur karier</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground">Versi demo menampilkan fixture lokal untuk memperagakan transferable skills, skill gap, dan langkah berikutnya. Hasil ini bukan analisis AI nyata.</p>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm"><Checkbox checked={careerAiConsent} onCheckedChange={(value) => setCareerAiConsent(value === true)} /><span>Saya memahami bahwa hasil rekomendasi ini hanya simulasi.</span></label>
              {careerAiMutation.isError && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{errorMessage(careerAiMutation.error)}</p>}
              <Button disabled={!careerAiConsent || careerAiMutation.isPending} onClick={() => careerAiMutation.mutate()}>{careerAiMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyiapkan simulasi...</> : <><Sparkles className="mr-2 h-4 w-4" />Lihat hasil simulasi</>}</Button>
              {careerAiMutation.data && <div className="grid gap-4 md:grid-cols-2">{careerAiMutation.data.recommendations.map((recommendation) => <div key={recommendation.role} className="rounded-lg border p-4"><div className="flex items-start justify-between gap-3"><h3 className="font-semibold">{recommendation.role}</h3><Badge>{Math.round(recommendation.matchScore)}%</Badge></div><p className="mt-2 text-sm text-muted-foreground">{recommendation.rationale}</p><p className="mt-3 text-xs font-semibold uppercase tracking-wide">Skill gap</p><div className="mt-2 flex flex-wrap gap-2">{recommendation.skillGaps.map((gap) => <Badge key={gap.skill} variant="outline">{gap.skill} · {gap.priority}</Badge>)}</div></div>)}</div>}
            </CardContent>
          </Card>
        </section>

        <section id="documate" className="scroll-mt-24 pt-10">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div><div className="mb-2 flex items-center gap-2 text-primary"><FolderArchive className="h-5 w-5" /><span className="text-sm font-semibold uppercase tracking-wide">DocuMate</span></div><h2 className="text-2xl font-bold">Arsip review CV</h2><p className="mt-1 text-sm text-muted-foreground">Hanya ringkasan hasil yang disimpan di browser ini; isi CV Anda tidak masuk ke local storage.</p></div>
            <Button asChild><Link to="/cvmate"><FileText className="mr-2 h-4 w-4" />Review CV baru</Link></Button>
          </div>
          {reviewHistory.length === 0 ? (
            <Card className="p-8 text-center"><FolderArchive className="mx-auto mb-3 h-10 w-10 text-muted-foreground" /><h3 className="font-semibold">Belum ada arsip review</h3><p className="mt-1 text-sm text-muted-foreground">Selesaikan satu review CV untuk melihat ringkasannya di sini.</p></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {reviewHistory.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4"><div><div className="mb-1 flex items-center gap-2"><h3 className="font-semibold">{item.fileName ?? 'Teks yang ditempel'}</h3><Badge variant="outline">{item.documentType === 'cv' ? 'CV' : 'MotLet'}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString('id-ID')}{item.targetRole ? ` · ${item.targetRole}` : ''}</p></div><div className="text-right"><p className="text-2xl font-bold text-primary">{Math.round(item.score)}</p><p className="text-xs text-muted-foreground">skor</p></div></div>
                    <div className="mt-4 flex flex-wrap gap-2"><Badge variant="secondary">{item.issueCount} temuan</Badge>{item.missingKeywords.slice(0, 3).map((keyword) => <Badge key={keyword} variant="outline">{keyword}</Badge>)}</div>
                    <Button className="mt-4 w-full" variant="outline" onClick={() => downloadReview(item)}><Download className="mr-2 h-4 w-4" />Unduh ringkasan</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section id="insightmate" className="scroll-mt-24 pt-10">
          <div className="mb-5"><div className="mb-2 flex items-center gap-2 text-primary"><TrendingUp className="h-5 w-5" /><span className="text-sm font-semibold uppercase tracking-wide">InsightMate</span></div><h2 className="text-2xl font-bold">Sinyal skill dan jalur karier</h2><p className="mt-1 text-sm text-muted-foreground">Pada versi ini, referensi berasal dari dataset demo lokal untuk memperagakan tampilan produk.</p></div>
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-primary" />Skill dalam taksonomi aktif</CardTitle></CardHeader>
              <CardContent><div className="flex flex-wrap gap-2">{data.referenceSkills.items.map((skill) => <Badge key={skill.id} variant="secondary">{skill.name}</Badge>)}</div><p className="mt-4 text-xs text-muted-foreground">Daftar ini menunjukkan referensi skill yang tersedia. Urutannya belum menyatakan frekuensi permintaan pasar.</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Referensi pekerjaan & kesiapan data gaji</CardTitle></CardHeader>
              <CardContent className="space-y-3">{data.occupations.items.map((occupation) => <div key={occupation.id} className="rounded-lg border p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-semibold">{occupation.title}</h3><p className="mt-1 text-xs text-muted-foreground">{occupation.careerCluster ?? 'Klasifikasi pekerjaan'}{occupation.jobZone ? ` · Job Zone ${occupation.jobZone}` : ''}</p></div><Badge variant="outline">Gaji: data belum tersedia</Badge></div></div>)}<p className="rounded-lg bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">Versi demo tidak menampilkan estimasi gaji karena belum memakai sumber data kompensasi yang dapat diverifikasi.</p></CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
