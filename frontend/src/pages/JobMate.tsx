import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { JobSummary } from '@careermate/contracts';
import { ArrowLeft, BrainCircuit, Briefcase, Building2, CheckCircle2, Loader2, MapPin, Search, ShieldAlert, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import DemoModeNotice from '@/components/DemoModeNotice';
import { useLanguage } from '@/contexts/LanguageContext';
import { ApiClientError, careerMateApi } from '@/lib/api-client';
import { loadCandidateProfile } from '@/lib/candidate-profile';

const modeLabels: Record<string, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site',
  flexible: 'Fleksibel',
};

function errorMessage(error: unknown): string {
  if (error instanceof ApiClientError) return error.message;
  return 'Data JobMate tidak dapat dimuat.';
}

export function JobResultCard({ job, onOpen }: { job: JobSummary; onOpen: (job: JobSummary) => void }) {
  const initials = job.companyName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  return (
    <Card className="p-6 transition-all hover:border-primary/50 hover:shadow-lg" data-testid="job-card">
      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold">{job.title}</h3>
              <div className="mt-1 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Building2 className="h-4 w-4" />{job.companyName}</span>
                {job.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              {job.workMode && <Badge variant="outline">{modeLabels[job.workMode] ?? job.workMode}</Badge>}
              {job.isSynthetic && <Badge variant="secondary">Data demo</Badge>}
            </div>
          </div>
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{job.description}</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              {job.experienceLevel ? `Level ${job.experienceLevel}` : 'Level tidak ditentukan'}
              {job.minimumYearsExperience !== null ? ` · min. ${job.minimumYearsExperience} tahun` : ''}
            </span>
            <Button onClick={() => onOpen(job)}>Lihat kecocokan</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

const JobMate = () => {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<JobSummary | null>(null);
  const [aiConsent, setAiConsent] = useState(false);

  const jobsQuery = useQuery({
    queryKey: ['jobs'],
    queryFn: () => careerMateApi.listJobs({ limit: 100 }),
  });
  const detailQuery = useQuery({
    queryKey: ['job', selectedJob?.id],
    queryFn: () => careerMateApi.getJob(selectedJob!.id),
    enabled: Boolean(selectedJob),
  });
  const matchQuery = useQuery({
    queryKey: ['job-match', selectedJob?.id],
    queryFn: () => careerMateApi.matchJob(selectedJob!.id),
    enabled: Boolean(selectedJob),
  });
  const candidateProfileQuery = useQuery({
    queryKey: ['candidate-profile'],
    queryFn: loadCandidateProfile,
    enabled: Boolean(selectedJob),
  });
  const aiMatchMutation = useMutation({
    mutationFn: () => {
      const job = selectedJob!;
      const detail = detailQuery.data!;
      return careerMateApi.matchJobs({
        consentToAiProcessing: true,
        profile: candidateProfileQuery.data!,
        jobs: [{
          id: job.id,
          title: job.title,
          company: job.companyName,
          description: detail.description,
          requiredSkills: detail.skills.map((skill) => skill.name),
          ...(job.minimumYearsExperience !== null ? { minimumExperienceYears: job.minimumYearsExperience } : {}),
          ...(job.location ? { location: job.location } : {}),
          ...(job.workMode && job.workMode !== 'flexible' ? { workMode: job.workMode } : {}),
        }],
        maxResults: 1,
        language,
      });
    },
    onSettled: () => setAiConsent(false),
  });

  const openJob = (job: JobSummary) => {
    aiMatchMutation.reset();
    setAiConsent(false);
    setSelectedJob(job);
  };

  const closeJob = () => {
    aiMatchMutation.reset();
    setAiConsent(false);
    setSelectedJob(null);
  };

  const jobs = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('id');
    return (jobsQuery.data?.items ?? []).filter((job) => {
      const matchesText = !query || `${job.title} ${job.companyName} ${job.location ?? ''}`.toLocaleLowerCase('id').includes(query);
      return matchesText && (mode === 'all' || job.workMode === mode);
    });
  }, [jobsQuery.data, mode, search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon"><Link to="/dashboard"><ArrowLeft className="h-5 w-5" /></Link></Button>
            <h1 className="text-2xl font-bold text-primary">JobMate</h1>
          </div>
          <Badge variant="outline" className="gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Dataset demo lokal</Badge>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-6 py-12">
        <DemoModeNotice />
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="mb-3 text-4xl font-bold">Lowongan demo CareerMate</h2>
          <p className="text-muted-foreground">Jelajahi contoh lowongan dan skor kecocokan untuk melihat alur produk frontend.</p>
        </div>

        <Card className="mb-8 p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari posisi, perusahaan, atau lokasi" className="h-12 pl-12" />
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', 'remote', 'hybrid', 'onsite'].map((value) => (
                <Button key={value} variant={mode === value ? 'default' : 'outline'} onClick={() => setMode(value)}>
                  {value === 'all' ? 'Semua' : modeLabels[value]}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {jobsQuery.isLoading && <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
        {jobsQuery.isError && (
          <Card className="border-destructive/30 p-6 text-center">
            <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-destructive" />
            <h3 className="font-semibold">Dataset belum dapat dimuat</h3>
            <p className="mt-1 text-sm text-muted-foreground">{errorMessage(jobsQuery.error)}</p>
            <Button className="mt-4" variant="outline" onClick={() => void jobsQuery.refetch()}>Coba lagi</Button>
          </Card>
        )}
        {jobsQuery.isSuccess && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">Menampilkan {jobs.length} dari {jobsQuery.data.total} lowongan.</p>
            {jobs.map((job) => <JobResultCard key={job.id} job={job} onOpen={openJob} />)}
            {jobs.length === 0 && <Card className="p-12 text-center"><Briefcase className="mx-auto mb-3 h-10 w-10 text-muted-foreground" /><p>Tidak ada lowongan yang cocok dengan filter.</p></Card>}
          </div>
        )}
      </main>

      <Dialog open={Boolean(selectedJob)} onOpenChange={(open) => !open && closeJob()}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{selectedJob?.title}</DialogTitle></DialogHeader>
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">{detailQuery.data?.description ?? selectedJob?.description}</p>
            {detailQuery.data && (
              <div>
                <h4 className="mb-2 font-semibold">Skill yang dibutuhkan</h4>
                <div className="flex flex-wrap gap-2">{detailQuery.data.skills.map((skill) => <Badge key={skill.id} variant={skill.requirementType === 'required' ? 'default' : 'secondary'}>{skill.name}</Badge>)}</div>
              </div>
            )}
            <Card className="bg-primary/5 p-5">
              <div className="mb-3 flex items-center gap-2 font-semibold"><Sparkles className="h-5 w-5 text-primary" />Kecocokan deterministik</div>
              {matchQuery.isLoading && <Loader2 className="h-6 w-6 animate-spin" />}
              {matchQuery.isError && <p className="text-sm text-destructive">{errorMessage(matchQuery.error)}</p>}
              {matchQuery.data && (
                <div className="space-y-3">
                  <div className="text-4xl font-bold text-primary">{matchQuery.data.matchScore}%</div>
                  <p className="text-sm text-muted-foreground">{matchQuery.data.disclaimer}</p>
                  <div><span className="text-sm font-medium">Skill wajib yang cocok: </span>{matchQuery.data.matchedRequiredSkills.join(', ') || 'Belum ada'}</div>
                  <div><span className="text-sm font-medium">Skill wajib yang belum ada: </span>{matchQuery.data.missingRequiredSkills.join(', ') || 'Tidak ada'}</div>
                </div>
              )}
            </Card>
            <Card className="border-primary/20 p-5">
              <div className="mb-3 flex items-center gap-2 font-semibold"><BrainCircuit className="h-5 w-5 text-primary" />Simulasi penjelasan kecocokan</div>
              <p className="mb-4 text-sm text-muted-foreground">Fixture lokal memperagakan bagaimana penjelasan kecocokan dan skill gap akan ditampilkan saat AI sungguhan dihubungkan nanti.</p>
              <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-lg bg-primary/5 p-3 text-sm"><Checkbox checked={aiConsent} onCheckedChange={(value) => setAiConsent(value === true)} /><span>Saya memahami bahwa analisis ini hanya simulasi.</span></label>
              {candidateProfileQuery.isError && <p className="mb-3 text-sm text-destructive">Profil tidak dapat dimuat untuk analisis AI.</p>}
              {aiMatchMutation.isError && <p className="mb-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{errorMessage(aiMatchMutation.error)}</p>}
              <Button variant="outline" className="w-full" disabled={!aiConsent || !detailQuery.data || !candidateProfileQuery.data || aiMatchMutation.isPending} onClick={() => aiMatchMutation.mutate()}>{aiMatchMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyiapkan simulasi...</> : <><Sparkles className="mr-2 h-4 w-4" />Lihat hasil simulasi</>}</Button>
              {aiMatchMutation.data?.matches[0] && <div className="mt-4 space-y-3 rounded-lg border p-4"><div className="flex items-center justify-between"><span className="font-semibold">{aiMatchMutation.data.matches[0].recommendation.replace('_', ' ')}</span><Badge>{Math.round(aiMatchMutation.data.matches[0].matchScore)}%</Badge></div><p className="text-sm text-muted-foreground">{aiMatchMutation.data.matches[0].rationale}</p><p className="text-sm"><strong>Skill cocok:</strong> {aiMatchMutation.data.matches[0].matchedSkills.join(', ') || 'Belum ada'}</p><p className="text-sm"><strong>Skill gap:</strong> {aiMatchMutation.data.matches[0].missingSkills.join(', ') || 'Tidak ada'}</p></div>}
            </Card>
            <Button className="w-full" disabled title="CareerMate belum mengirim lamaran ke pihak eksternal.">
              Lamaran eksternal belum tersedia
            </Button>
            <p className="text-center text-xs text-muted-foreground">CareerMate tidak akan mengklaim lamaran terkirim sebelum integrasi perusahaan tersedia.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobMate;
