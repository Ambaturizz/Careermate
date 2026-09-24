import type {
  Education,
  Experience,
  JobDetail,
  OccupationDetail,
  Profile,
  Project,
  ReferenceSkill,
  UserInterest,
  UserSkill,
} from '@careermate/contracts';

const ids = {
  profile: '10000000-0000-4000-8000-000000000001',
  user: '10000000-0000-4000-8000-000000000002',
  react: '20000000-0000-4000-8000-000000000001',
  typescript: '20000000-0000-4000-8000-000000000002',
  javascript: '20000000-0000-4000-8000-000000000003',
  git: '20000000-0000-4000-8000-000000000004',
  sql: '20000000-0000-4000-8000-000000000005',
  communication: '20000000-0000-4000-8000-000000000006',
  english: '20000000-0000-4000-8000-000000000007',
  ux: '20000000-0000-4000-8000-000000000008',
  technology: '30000000-0000-4000-8000-000000000001',
  design: '30000000-0000-4000-8000-000000000002',
  frontend: '40000000-0000-4000-8000-000000000001',
  product: '40000000-0000-4000-8000-000000000002',
  data: '40000000-0000-4000-8000-000000000003',
  qa: '40000000-0000-4000-8000-000000000004',
  jobFrontend: '50000000-0000-4000-8000-000000000001',
  jobWeb: '50000000-0000-4000-8000-000000000002',
  jobProduct: '50000000-0000-4000-8000-000000000003',
  jobQa: '50000000-0000-4000-8000-000000000004',
  education: '60000000-0000-4000-8000-000000000001',
  experience: '70000000-0000-4000-8000-000000000001',
  project: '80000000-0000-4000-8000-000000000001',
  interview: '90000000-0000-4000-8000-000000000001',
} as const;

const referenceSkills: ReferenceSkill[] = [
  { id: ids.react, name: 'React', description: 'Library antarmuka web.', category: 'Frontend', kind: 'skill' },
  { id: ids.typescript, name: 'TypeScript', description: 'JavaScript dengan type system.', category: 'Programming', kind: 'skill' },
  { id: ids.javascript, name: 'JavaScript', description: 'Bahasa pemrograman web.', category: 'Programming', kind: 'skill' },
  { id: ids.git, name: 'Git', description: 'Version control.', category: 'Tools', kind: 'skill' },
  { id: ids.sql, name: 'SQL', description: 'Pengolahan basis data relasional.', category: 'Data', kind: 'skill' },
  { id: ids.communication, name: 'Komunikasi', description: 'Menyampaikan ide secara terstruktur.', category: 'Soft skill', kind: 'competence' },
  { id: ids.english, name: 'Bahasa Inggris', description: 'Kemampuan bahasa profesional.', category: 'Language', kind: 'language' },
  { id: ids.ux, name: 'UI/UX Dasar', description: 'Prinsip desain produk digital.', category: 'Design', kind: 'skill' },
];

const occupations: OccupationDetail[] = [
  {
    id: ids.frontend, title: 'Frontend Developer', description: 'Membangun antarmuka web yang cepat, aksesibel, dan mudah digunakan.', careerCluster: 'Software Development', educationLevel: 'Bachelor', jobZone: 3, externalId: 'DEMO-FE',
    skills: [
      { id: ids.react, name: 'React', importance: 92, level: 4, requirementType: 'required' },
      { id: ids.typescript, name: 'TypeScript', importance: 86, level: 3, requirementType: 'required' },
      { id: ids.ux, name: 'UI/UX Dasar', importance: 68, level: 2, requirementType: 'preferred' },
    ],
    interests: [{ id: ids.technology, name: 'Teknologi', score: 90 }],
    knowledge: [{ id: ids.javascript, name: 'Pemrograman Web', importance: 90, level: 4 }],
    abilities: [{ id: ids.communication, name: 'Pemecahan Masalah', importance: 82, level: 3 }],
    technologies: [{ id: ids.git, name: 'Git', importance: 80 }],
  },
  {
    id: ids.product, title: 'Associate Product Manager', description: 'Membantu tim menentukan masalah pengguna dan prioritas produk.', careerCluster: 'Product Management', educationLevel: 'Bachelor', jobZone: 3, externalId: 'DEMO-PM',
    skills: [{ id: ids.communication, name: 'Komunikasi', importance: 90, level: 4, requirementType: 'required' }],
    interests: [{ id: ids.design, name: 'Desain Produk', score: 78 }],
    knowledge: [{ id: ids.ux, name: 'Riset Pengguna', importance: 75, level: 3 }],
    abilities: [{ id: ids.sql, name: 'Analisis Data', importance: 70, level: 2 }],
    technologies: [{ id: ids.git, name: 'Collaboration tools', importance: 60 }],
  },
  {
    id: ids.data, title: 'Junior Data Analyst', description: 'Mengolah data menjadi insight yang dapat ditindaklanjuti.', careerCluster: 'Data & Analytics', educationLevel: 'Bachelor', jobZone: 3, externalId: 'DEMO-DA',
    skills: [{ id: ids.sql, name: 'SQL', importance: 94, level: 3, requirementType: 'required' }],
    interests: [{ id: ids.technology, name: 'Teknologi', score: 76 }],
    knowledge: [{ id: ids.sql, name: 'Analisis Data', importance: 92, level: 3 }],
    abilities: [{ id: ids.communication, name: 'Komunikasi Insight', importance: 72, level: 3 }],
    technologies: [{ id: ids.sql, name: 'PostgreSQL', importance: 84 }],
  },
  {
    id: ids.qa, title: 'Quality Assurance Engineer', description: 'Menjaga kualitas produk melalui pengujian terstruktur.', careerCluster: 'Software Quality', educationLevel: 'Bachelor', jobZone: 3, externalId: 'DEMO-QA',
    skills: [{ id: ids.javascript, name: 'JavaScript', importance: 78, level: 3, requirementType: 'preferred' }],
    interests: [{ id: ids.technology, name: 'Teknologi', score: 82 }],
    knowledge: [{ id: ids.git, name: 'Software Delivery', importance: 80, level: 3 }],
    abilities: [{ id: ids.communication, name: 'Ketelitian', importance: 94, level: 4 }],
    technologies: [{ id: ids.git, name: 'Git', importance: 76 }],
  },
];

const publishedAt = '2026-09-20T08:00:00.000Z';
const jobs: JobDetail[] = [
  {
    id: ids.jobFrontend, title: 'Junior Frontend Developer', companyName: 'Nusantara Digital', description: 'Membangun fitur React, memperbaiki kualitas UI, dan berkolaborasi dengan tim produk.', location: 'Jakarta', workMode: 'hybrid', employmentType: 'full_time', experienceLevel: 'junior', minimumYearsExperience: 1, isSynthetic: true, publishedAt, expiresAt: null,
    skills: [
      { id: ids.react, name: 'React', requirementType: 'required', importance: 95 },
      { id: ids.typescript, name: 'TypeScript', requirementType: 'required', importance: 88 },
      { id: ids.git, name: 'Git', requirementType: 'preferred', importance: 70 },
    ],
  },
  {
    id: ids.jobWeb, title: 'Web Developer Intern', companyName: 'Ruang Bertumbuh', description: 'Mendukung pengembangan landing page dan dashboard internal dengan JavaScript modern.', location: 'Bandung', workMode: 'remote', employmentType: 'internship', experienceLevel: 'entry', minimumYearsExperience: 0, isSynthetic: true, publishedAt, expiresAt: null,
    skills: [
      { id: ids.javascript, name: 'JavaScript', requirementType: 'required', importance: 92 },
      { id: ids.react, name: 'React', requirementType: 'preferred', importance: 72 },
    ],
  },
  {
    id: ids.jobProduct, title: 'Product Operations Associate', companyName: 'KerjaKita Labs', description: 'Merapikan proses produk, membuat dokumentasi, dan memantau metrik operasional.', location: 'Jakarta', workMode: 'onsite', employmentType: 'contract', experienceLevel: 'junior', minimumYearsExperience: 1, isSynthetic: true, publishedAt, expiresAt: null,
    skills: [
      { id: ids.communication, name: 'Komunikasi', requirementType: 'required', importance: 90 },
      { id: ids.sql, name: 'SQL', requirementType: 'preferred', importance: 60 },
    ],
  },
  {
    id: ids.jobQa, title: 'Junior QA Engineer', companyName: 'Awan Teknologi', description: 'Menulis test case, melaporkan bug, dan membantu otomasi pengujian web.', location: 'Surabaya', workMode: 'remote', employmentType: 'full_time', experienceLevel: 'junior', minimumYearsExperience: 1, isSynthetic: true, publishedAt, expiresAt: null,
    skills: [
      { id: ids.javascript, name: 'JavaScript', requirementType: 'preferred', importance: 72 },
      { id: ids.git, name: 'Git', requirementType: 'required', importance: 80 },
    ],
  },
];

type DemoState = {
  profile: Profile;
  skills: UserSkill[];
  interests: UserInterest[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
};

const initialState: DemoState = {
  profile: {
    id: ids.profile,
    userId: ids.user,
    fullName: 'CareerMate Demo',
    headline: 'Fresh Graduate Informatika | Frontend Developer',
    bio: 'Kandidat pemula yang berfokus pada pengembangan produk web.',
    location: 'Jakarta, Indonesia',
    educationLevel: 'bachelor',
    preferredWorkMode: 'remote',
  },
  skills: [
    { id: ids.react, skillId: ids.react, name: 'React', proficiencyLevel: 'advanced', yearsExperience: 2, source: 'self_assessed' },
    { id: ids.typescript, skillId: ids.typescript, name: 'TypeScript', proficiencyLevel: 'intermediate', yearsExperience: 1.5, source: 'project' },
    { id: ids.javascript, skillId: ids.javascript, name: 'JavaScript', proficiencyLevel: 'advanced', yearsExperience: 2, source: 'project' },
    { id: ids.git, skillId: ids.git, name: 'Git', proficiencyLevel: 'intermediate', yearsExperience: 2, source: 'self_assessed' },
  ],
  interests: [
    { interestId: ids.technology, interestLevel: 5, name: 'Teknologi' },
    { interestId: ids.design, interestLevel: 4, name: 'Desain Produk' },
  ],
  education: [{ id: ids.education, institution: 'Universitas Indonesia', fieldOfStudy: 'Informatika', degree: 'S1', startDate: '2021-08-01', endDate: '2025-07-01', description: 'Fokus pada rekayasa perangkat lunak dan pengembangan web.' }],
  experience: [{ id: ids.experience, organization: 'Studio Digital Kampus', role: 'Frontend Developer Intern', startDate: '2024-01-01', endDate: '2024-07-01', description: 'Membangun dashboard React dan memperbaiki alur antarmuka bersama tim produk.' }],
  projects: [{ id: ids.project, title: 'Career Portfolio', description: 'Aplikasi portofolio responsif dengan React dan TypeScript.', repositoryUrl: 'https://github.com/example/career-portfolio', projectUrl: null, startDate: '2025-01-01', endDate: '2025-03-01', skillIds: [ids.react, ids.typescript] }],
};

const storageKey = 'careermate.demo-state.v1';
let memoryState: DemoState = structuredClone(initialState);

function loadState(): DemoState {
  if (typeof window === 'undefined') return memoryState;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) return JSON.parse(stored) as DemoState;
  } catch {
    // Browser privacy settings may disable storage; the in-memory fixture still works.
  }
  return memoryState;
}

function saveState(state: DemoState): void {
  memoryState = state;
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Keep the current tab functional even if localStorage is unavailable.
  }
}

function bodyOf(init: RequestInit): Record<string, unknown> {
  if (typeof init.body !== 'string' || !init.body) return {};
  return JSON.parse(init.body) as Record<string, unknown>;
}

function paginated<T>(items: T[], url: URL): { items: T[]; total: number; limit: number; offset: number } {
  const query = (url.searchParams.get('q') ?? '').trim().toLocaleLowerCase('id');
  const limit = Math.max(1, Number(url.searchParams.get('limit') ?? 20));
  const offset = Math.max(0, Number(url.searchParams.get('offset') ?? 0));
  const filtered = query
    ? items.filter((item) => JSON.stringify(item).toLocaleLowerCase('id').includes(query))
    : items;
  return { items: filtered.slice(offset, offset + limit), total: filtered.length, limit, offset };
}

function newId(prefix: string): string {
  const counter = Math.floor(Math.random() * 999_999).toString().padStart(12, '0');
  return `${prefix}0000000-0000-4000-8000-${counter}`;
}

function deterministicJobMatch(job: JobDetail) {
  const scoreByJob: Record<string, number> = {
    [ids.jobFrontend]: 86,
    [ids.jobWeb]: 82,
    [ids.jobProduct]: 62,
    [ids.jobQa]: 68,
  };
  const state = loadState();
  const known = new Set(state.skills.map((skill) => skill.name));
  const required = job.skills.filter((skill) => skill.requirementType === 'required');
  const preferred = job.skills.filter((skill) => skill.requirementType === 'preferred');
  return {
    jobId: job.id,
    matchScore: scoreByJob[job.id] ?? 70,
    components: { requiredSkills: 0.82, preferredSkills: 0.7, experience: 0.75 },
    matchedRequiredSkills: required.filter((skill) => known.has(skill.name)).map((skill) => skill.name),
    missingRequiredSkills: required.filter((skill) => !known.has(skill.name)).map((skill) => skill.name),
    matchedPreferredSkills: preferred.filter((skill) => known.has(skill.name)).map((skill) => skill.name),
    scoringVersion: 'frontend-demo-v1',
    disclaimer: 'Skor ini adalah fixture simulasi frontend, bukan evaluasi rekrutmen nyata.',
  };
}

function careerRecommendations(limit: number) {
  const values = [
    { occupation: occupations[0], compatibility: 0.88, matched: ['React', 'TypeScript', 'JavaScript'], missing: ['Testing otomatis'] },
    { occupation: occupations[3], compatibility: 0.72, matched: ['JavaScript', 'Git'], missing: ['Playwright', 'Test planning'] },
    { occupation: occupations[1], compatibility: 0.64, matched: ['Komunikasi', 'UI/UX Dasar'], missing: ['Product analytics', 'Prioritization'] },
    { occupation: occupations[2], compatibility: 0.55, matched: ['Problem solving'], missing: ['SQL lanjutan', 'Data visualization'] },
  ];
  return {
    recommendations: values.slice(0, limit).map(({ occupation, compatibility, matched, missing }) => ({
      occupationId: occupation.id,
      title: occupation.title,
      compatibility,
      components: { skillMatch: compatibility, interestMatch: Math.max(0, compatibility - 0.05), educationAlignment: 0.9 },
      matchedSkills: matched,
      missingSkills: missing,
      matchedInterests: ['Teknologi'],
      disclaimer: 'Rekomendasi fixture untuk demonstrasi frontend.',
    })),
    scoringVersion: 'frontend-demo-v1',
  };
}

const interviewQuestionBank = [
  ['behavioral', 'Ceritakan proyek yang paling menantang dan bagaimana Anda menyelesaikannya.'],
  ['technical', 'Bagaimana Anda mengelola state dan efek samping dalam aplikasi React?'],
  ['technical', 'Jelaskan cara Anda menjaga type safety pada proyek TypeScript.'],
  ['situational', 'Apa yang Anda lakukan ketika desain berubah mendekati tenggat?'],
  ['case', 'Sebuah halaman lambat saat memuat data. Bagaimana Anda mendiagnosisnya?'],
  ['behavioral', 'Ceritakan saat Anda menerima feedback yang sulit.'],
  ['technical', 'Bagaimana strategi Anda menguji komponen frontend?'],
  ['situational', 'Bagaimana Anda berkomunikasi saat menemukan risiko pada rilis?'],
] as const;

export async function demoApiRequest(path: string, init: RequestInit = {}): Promise<unknown> {
  await new Promise((resolve) => setTimeout(resolve, 180));
  const url = new URL(path, 'https://demo.careermate.local');
  const method = (init.method ?? 'GET').toUpperCase();
  const body = bodyOf(init);
  const state = loadState();

  if (url.pathname === '/skills' && method === 'GET') return paginated(referenceSkills, url);
  if (url.pathname === '/occupations' && method === 'GET') return paginated(occupations.map(({ skills: _skills, interests: _interests, knowledge: _knowledge, abilities: _abilities, technologies: _technologies, ...item }) => item), url);
  if (url.pathname.startsWith('/occupations/') && method === 'GET') return occupations.find((item) => item.id === url.pathname.split('/')[2]) ?? occupations[0];
  if (url.pathname === '/jobs' && method === 'GET') return paginated(jobs.map(({ skills: _skills, ...job }) => job), url);
  if (url.pathname === '/jobs/match' && method === 'POST') {
    const requestedJobs = Array.isArray(body.jobs) ? body.jobs as Array<Record<string, unknown>> : [];
    return {
      matches: requestedJobs.slice(0, Number(body.maxResults ?? 10)).map((job) => ({
        jobId: String(job.id),
        matchScore: 84,
        matchedSkills: ['React', 'TypeScript', 'Git'],
        missingSkills: ['Testing otomatis'],
        rationale: 'Simulasi frontend: profil demo memiliki sebagian besar skill utama pada lowongan ini.',
        recommendation: 'strong_match',
      })),
    };
  }
  const jobMatch = url.pathname.match(/^\/jobs\/([^/]+)\/match$/);
  if (jobMatch && method === 'POST') return deterministicJobMatch(jobs.find((item) => item.id === jobMatch[1]) ?? jobs[0]);
  const jobDetail = url.pathname.match(/^\/jobs\/([^/]+)$/);
  if (jobDetail && method === 'GET') return jobs.find((item) => item.id === jobDetail[1]) ?? jobs[0];

  if (url.pathname === '/profile' && method === 'GET') return state.profile;
  if (url.pathname === '/profile' && method === 'PUT') {
    state.profile = { ...state.profile, ...body } as Profile;
    saveState(state);
    return state.profile;
  }
  if (url.pathname === '/profile/skills' && method === 'GET') return { items: state.skills };
  if (url.pathname === '/profile/skills' && method === 'POST') {
    const reference = referenceSkills.find((item) => item.id === body.skillId) ?? referenceSkills[0];
    const item = { id: newId('2'), name: reference.name, ...body } as UserSkill;
    state.skills.push(item); saveState(state); return item;
  }
  const skillMutation = url.pathname.match(/^\/profile\/skills\/([^/]+)$/);
  if (skillMutation && method === 'PUT') {
    const index = state.skills.findIndex((item) => item.id === skillMutation[1]);
    state.skills[index] = { ...state.skills[index], ...body };
    saveState(state); return state.skills[index];
  }
  if (skillMutation && method === 'DELETE') {
    state.skills = state.skills.filter((item) => item.id !== skillMutation[1]); saveState(state); return undefined;
  }
  if (url.pathname === '/profile/interests' && method === 'GET') return { items: state.interests };
  if (url.pathname === '/profile/interests' && method === 'POST') {
    const item = { ...body, name: body.interestId === ids.design ? 'Desain Produk' : 'Teknologi' } as UserInterest;
    state.interests.push(item); saveState(state); return item;
  }
  if (url.pathname === '/profile/education' && method === 'GET') return { items: state.education };
  if (url.pathname === '/profile/education' && method === 'POST') {
    const item = { id: newId('6'), ...body } as Education; state.education.push(item); saveState(state); return item;
  }
  if (url.pathname === '/profile/experience' && method === 'GET') return { items: state.experience };
  if (url.pathname === '/profile/experience' && method === 'POST') {
    const item = { id: newId('7'), ...body } as Experience; state.experience.push(item); saveState(state); return item;
  }
  if (url.pathname === '/profile/projects' && method === 'GET') return { items: state.projects };
  if (url.pathname === '/profile/projects' && method === 'POST') {
    const item = { id: newId('8'), ...body } as Project; state.projects.push(item); saveState(state); return item;
  }

  if (url.pathname === '/career/recommendations' && method === 'GET') return careerRecommendations(Number(url.searchParams.get('limit') ?? 10));
  if (url.pathname === '/career/recommendations' && method === 'POST') {
    const requestedRoles = Array.isArray(body.targetRoles) && body.targetRoles.length > 0
      ? body.targetRoles.map(String)
      : ['Frontend Developer', 'Quality Assurance Engineer', 'Associate Product Manager'];
    return {
      recommendations: requestedRoles.slice(0, Number(body.limit ?? 5)).map((role, index) => ({
        role,
        matchScore: Math.max(58, 88 - index * 8),
        rationale: 'Simulasi frontend berdasarkan profil demo; hasil ini tidak dibuat oleh model AI.',
        transferableSkills: ['JavaScript', 'Komunikasi', 'Problem solving'],
        skillGaps: [{ skill: index === 0 ? 'Testing otomatis' : 'Analisis data', priority: 'medium', learningSuggestion: 'Buat satu proyek kecil dan dokumentasikan hasilnya.' }],
        nextSteps: ['Perbarui portofolio dengan hasil terukur.', 'Latih penjelasan proyek dalam format STAR.'],
      })),
      summary: 'Ini adalah respons simulasi lokal agar alur rekomendasi dapat didemonstrasikan tanpa backend atau API AI.',
    };
  }
  if (url.pathname === '/interviews/plan' && method === 'POST') {
    const count = Math.max(3, Math.min(20, Number(body.questionCount ?? 8)));
    const bank = Array.from({ length: count }, (_, index) => interviewQuestionBank[index % interviewQuestionBank.length]);
    return {
      sessionId: ids.interview,
      learningObjectives: ['Menyusun jawaban terstruktur', 'Menjelaskan keputusan teknis dengan jelas'],
      studyPlan: [{ topic: `Persiapan ${String(body.targetRole ?? 'posisi target')}`, objective: 'Menghubungkan pengalaman dengan kebutuhan peran.', activities: ['Pilih dua proyek utama.', 'Latih jawaban menggunakan format STAR.', 'Catat hasil dan metrik proyek.'] }],
      questions: bank.map(([type, question], index) => ({ id: `91000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, type, question, answerOutline: ['Konteks singkat', 'Tindakan spesifik', 'Hasil terukur', 'Pelajaran'], evaluationCriteria: ['Relevansi', 'Kejelasan', 'Bukti konkret'] })),
    };
  }
  if (url.pathname === '/interviews/feedback' && method === 'POST') {
    return {
      score: 78,
      strengths: ['Jawaban relevan dengan pertanyaan.', 'Alur jawaban cukup mudah diikuti.'],
      improvements: ['Tambahkan metrik hasil.', 'Perjelas kontribusi pribadi Anda.'],
      improvedAnswerOutline: ['Situasi dan target', 'Tindakan yang Anda ambil', 'Hasil dalam angka', 'Refleksi singkat'],
      nextExercise: 'Ulangi jawaban dalam 90 detik dan sertakan satu hasil terukur.',
    };
  }
  if (url.pathname === '/documents/review' && method === 'POST') {
    return {
      score: 79,
      strengths: ['Struktur dokumen mudah dipindai.', 'Skill teknis utama sudah disebutkan.'],
      issues: [
        { severity: 'warning', section: 'Pengalaman', explanation: 'Dampak pekerjaan belum terukur.', suggestedRewrite: 'Membangun 5 halaman React dan mengurangi waktu muat sebesar 25%.' },
        { severity: 'suggestion', section: 'Ringkasan', explanation: 'Ringkasan dapat dibuat lebih spesifik terhadap posisi target.' },
      ],
      atsKeywords: { present: ['React', 'TypeScript', 'Git'], missing: ['unit testing', 'accessibility'] },
      learningNotes: ['Gunakan kata kerja aktif.', 'Sertakan angka hanya jika dapat dipertanggungjawabkan.', 'Ini hasil simulasi frontend, bukan pemeriksaan ATS nyata.'],
    };
  }
  if (url.pathname === '/documents/generate' && method === 'POST') {
    const role = String(body.targetRole ?? 'Frontend Developer');
    const title = body.documentType === 'cover_letter' ? `Surat Lamaran — ${role}` : `CV Terarah — ${role}`;
    const sections = [
      { heading: 'Ringkasan', content: `Fresh graduate Informatika yang berfokus pada ${role}, React, dan TypeScript.` },
      { heading: 'Pengalaman Relevan', content: 'Membangun dashboard React bersama tim produk dan memperbaiki alur antarmuka berdasarkan feedback pengguna.' },
      { heading: 'Proyek', content: 'Career Portfolio — aplikasi responsif menggunakan React, TypeScript, dan Git.' },
    ];
    return {
      title,
      content: sections.map((section) => `${section.heading}\n${section.content}`).join('\n\n'),
      sections,
      checklist: ['Sesuaikan nama perusahaan.', 'Verifikasi semua angka dan klaim.', 'Ekspor ke format PDF yang rapi.', 'Konten ini adalah fixture simulasi, bukan hasil AI.'],
    };
  }

  throw new Error(`Endpoint demo belum tersedia: ${method} ${url.pathname}`);
}
