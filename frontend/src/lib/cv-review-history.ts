import type { DocumentReviewResponse } from '@careermate/contracts';
import { z } from 'zod';

const STORAGE_KEY = 'careermate.cv-review-history.v1';
const MAX_HISTORY_ITEMS = 10;

const historyItemSchema = z.object({
  id: z.string(),
  createdAt: z.string().datetime(),
  documentType: z.enum(['cv', 'motivation_letter']).default('cv'),
  fileName: z.string().nullable(),
  targetRole: z.string(),
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  issueCount: z.number().int().nonnegative(),
  missingKeywords: z.array(z.string()),
});

const historySchema = z.array(historyItemSchema);

export type CvReviewHistoryItem = z.infer<typeof historyItemSchema>;

export function listCvReviewHistory(): CvReviewHistoryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = historySchema.safeParse(JSON.parse(stored));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export function saveCvReviewHistory(input: {
  review: DocumentReviewResponse;
  documentType: 'cv' | 'motivation_letter';
  fileName: string | null;
  targetRole: string;
}): CvReviewHistoryItem {
  const item: CvReviewHistoryItem = {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`,
    createdAt: new Date().toISOString(),
    documentType: input.documentType,
    fileName: input.fileName,
    targetRole: input.targetRole.trim(),
    score: input.review.score,
    strengths: input.review.strengths.slice(0, 3),
    issueCount: input.review.issues.length,
    missingKeywords: input.review.atsKeywords.missing.slice(0, 8),
  };

  if (typeof window !== 'undefined') {
    try {
      const next = [item, ...listCvReviewHistory()].slice(0, MAX_HISTORY_ITEMS);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // A successful AI review should not fail when browser storage is unavailable.
    }
  }

  return item;
}

export function formatCvReviewSummary(item: CvReviewHistoryItem): string {
  return [
    'Ringkasan Review CV — CareerMate',
    `Tanggal: ${new Date(item.createdAt).toLocaleString('id-ID')}`,
    `Jenis: ${item.documentType === 'cv' ? 'CV' : 'Motivation Letter'}`,
    `Dokumen: ${item.fileName ?? 'Teks yang ditempel'}`,
    `Target posisi: ${item.targetRole || 'Tidak ditentukan'}`,
    `Skor: ${Math.round(item.score)}/100`,
    `Jumlah temuan: ${item.issueCount}`,
    '',
    'Kekuatan:',
    ...item.strengths.map((strength) => `- ${strength}`),
    '',
    'Kata kunci ATS yang belum ada:',
    ...(item.missingKeywords.length > 0 ? item.missingKeywords.map((keyword) => `- ${keyword}`) : ['- Tidak ada']),
    '',
    'Catatan: skor AI bukan jaminan lolos ATS atau proses rekrutmen.',
  ].join('\n');
}
