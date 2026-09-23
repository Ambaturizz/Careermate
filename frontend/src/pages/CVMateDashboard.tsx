import type { CareerDocumentType, DocumentReviewResponse } from '@careermate/contracts';
import { ArrowLeft, Briefcase, CheckCircle2, FileSearch, Lightbulb, Target } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ReviewState = {
  review: DocumentReviewResponse;
  content: string;
  documentType?: CareerDocumentType;
  fileName: string | null;
  targetRole: string;
};

const severityLabel = {
  critical: 'Kritis',
  warning: 'Peringatan',
  suggestion: 'Saran',
} as const;

const CVMateDashboard = () => {
  const location = useLocation();
  const state = location.state as ReviewState | null;

  if (!state?.review) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="max-w-lg p-8 text-center">
          <FileSearch className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="mb-2 text-2xl font-bold">Belum ada hasil review</h1>
          <p className="mb-6 text-muted-foreground">Kirim isi CV melalui CVMate agar backend dapat menghasilkan hasil yang tervalidasi.</p>
          <Button asChild><Link to="/cvmate">Mulai review CV</Link></Button>
        </Card>
      </div>
    );
  }

  const { review } = state;
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      <header className="border-b bg-background/90 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3"><Button asChild variant="ghost" size="icon"><Link to="/cvmate"><ArrowLeft className="h-5 w-5" /></Link></Button><div><h1 className="text-xl font-bold">Hasil Review {state.documentType === 'motivation_letter' ? 'Motivation Letter' : 'CV'}</h1><p className="text-xs text-muted-foreground">{state.fileName ?? 'Teks yang ditempel'}{state.targetRole ? ` · ${state.targetRole}` : ''}</p></div></div>
          <Button asChild variant="outline"><Link to="/cvmate">Review ulang</Link></Button>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl space-y-6 px-6 py-10">
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          <Card className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-3 text-6xl font-bold text-primary">{Math.round(review.score)}</div>
            <p className="font-semibold">Skor review</p>
            <p className="mt-2 text-xs text-muted-foreground">Dihasilkan oleh provider AI yang dikonfigurasi; bukan jaminan lolos ATS atau rekrutmen.</p>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-500" />Kekuatan utama</CardTitle></CardHeader>
            <CardContent><ul className="space-y-2">{review.strengths.map((strength) => <li key={strength} className="flex gap-2"><span className="text-emerald-500">•</span><span>{strength}</span></li>)}</ul></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Temuan dan saran</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {review.issues.length === 0 && <p className="text-muted-foreground">Tidak ada masalah utama yang dilaporkan.</p>}
            {review.issues.map((issue, index) => (
              <div key={`${issue.section}-${index}`} className="rounded-lg border p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2"><Badge variant={issue.severity === 'critical' ? 'destructive' : 'secondary'}>{severityLabel[issue.severity]}</Badge><span className="font-semibold">{issue.section}</span></div>
                <p className="text-sm text-muted-foreground">{issue.explanation}</p>
                {issue.suggestedRewrite && <div className="mt-3 rounded-md bg-primary/5 p-3 text-sm"><span className="font-medium">Usulan penulisan: </span>{issue.suggestedRewrite}</div>}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" />Kata kunci ATS</CardTitle></CardHeader>
            <CardContent className="space-y-4"><div><p className="mb-2 text-sm font-medium">Sudah ada</p><div className="flex flex-wrap gap-2">{review.atsKeywords.present.map((keyword) => <Badge key={keyword} variant="secondary">{keyword}</Badge>)}</div></div><div><p className="mb-2 text-sm font-medium">Belum ada</p><div className="flex flex-wrap gap-2">{review.atsKeywords.missing.map((keyword) => <Badge key={keyword} variant="outline">{keyword}</Badge>)}</div></div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-500" />Catatan belajar</CardTitle></CardHeader>
            <CardContent><ul className="space-y-2">{review.learningNotes.map((note) => <li key={note} className="flex gap-2"><span className="text-amber-500">•</span><span>{note}</span></li>)}</ul></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Isi CV yang direview</CardTitle></CardHeader>
          <CardContent><pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-muted/50 p-4 font-sans text-sm">{state.content}</pre></CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-between gap-4 bg-primary/5 p-6 sm:flex-row">
          <div><h3 className="font-semibold">Lanjutkan dengan data pekerjaan CareerMate</h3><p className="text-sm text-muted-foreground">Skor job match dihitung backend dari profil terstruktur, bukan dari hasil CV ini.</p></div>
          <Button asChild><Link to="/jobmate"><Briefcase className="mr-2 h-4 w-4" />Buka JobMate</Link></Button>
        </Card>
      </main>
    </div>
  );
};

export default CVMateDashboard;
