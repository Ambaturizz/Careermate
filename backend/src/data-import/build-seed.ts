import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { normalizeKey, normalizeText, numberOrNull, readCsv, scaleOneToFive, scaleOneToSeven } from './common.js';
import { ONET_SOURCE } from './onet.js';

const selectedCodes = [
  '11-2021.00', '11-2022.00', '11-3021.00', '13-1071.00', '13-1081.00', '13-1082.00',
  '13-1111.00', '13-1151.00', '13-1161.00', '13-2011.00', '15-1211.00', '15-1212.00',
  '15-1243.00', '15-1244.00', '15-1252.00', '15-1253.00', '15-1254.00', '15-1255.00',
  '15-2031.00', '15-2041.00', '15-2051.00', '17-2051.00', '19-1042.00', '19-3032.00',
  '23-1011.00', '25-2021.00', '27-1024.00', '27-3031.00', '29-1141.00', '43-4051.00',
];
const selected = new Set(selectedCodes);

function cluster(title: string): string {
  if (/Software Developers|Quality Assurance|Web Developers/i.test(title)) return 'Software Engineering';
  if (/Data Scientists|Database Architects|Operations Research|Statisticians/i.test(title)) return 'Data';
  if (/Security/i.test(title)) return 'Cybersecurity';
  if (/Interface Designers|Graphic Designers/i.test(title)) return 'UI/UX';
  if (/Network and Computer Systems/i.test(title)) return 'Cloud / DevOps';
  if (/Project Management/i.test(title)) return 'Project Management';
  if (/Market Research|Marketing Managers|Public Relations/i.test(title)) return 'Digital Marketing';
  if (/Management Analysts/i.test(title)) return 'Business Analysis';
  if (/Computer Systems Analysts/i.test(title)) return 'IT Consulting';
  if (/Information Systems Managers/i.test(title)) return 'Information Systems';
  return 'Cross-industry';
}

function educationFromCategory(rows: Record<string, string>[], code: string): string | null {
  const dominant = rows.filter((row) => row['O*NET-SOC Code'] === code)
    .map((row) => ({ category: numberOrNull(row.Category), weight: numberOrNull(row['Data Value']) ?? 0 }))
    .filter((row): row is { category: number; weight: number } => row.category !== null)
    .sort((left, right) => right.weight - left.weight)[0]?.category;
  if (!dominant) return null;
  return dominant <= 3 ? 'secondary' : dominant === 4 ? 'vocational' : dominant <= 6 ? 'associate' : dominant <= 8 ? 'bachelor' : dominant <= 10 ? 'master' : 'doctorate';
}

function measures(rows: Record<string, string>[], limit: number) {
  const values = new Map<string, { occupationCode: string; externalId: string; name: string; importance: number | null; level: number | null }>();
  for (const row of rows) {
    const occupationCode = row['O*NET-SOC Code'];
    if (!occupationCode || !selected.has(occupationCode) || row['Recommend Suppress'] === 'Y') continue;
    const externalId = row['Element ID']!;
    const key = `${occupationCode}\u0000${externalId}`;
    const record = values.get(key) ?? { occupationCode, externalId, name: normalizeText(row['Element Name'] ?? ''), importance: null, level: null };
    if (row['Scale ID'] === 'IM') record.importance = scaleOneToFive(numberOrNull(row['Data Value']));
    if (row['Scale ID'] === 'LV') record.level = scaleOneToSeven(numberOrNull(row['Data Value']));
    values.set(key, record);
  }
  const grouped = new Map<string, typeof values extends Map<string, infer V> ? V[] : never>();
  for (const value of values.values()) {
    const group = grouped.get(value.occupationCode) ?? [];
    group.push(value);
    grouped.set(value.occupationCode, group);
  }
  return [...grouped.values()].flatMap((group) => group.sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0)).slice(0, limit));
}

const rawDirectory = resolve(process.cwd(), process.argv[2] ?? 'data/raw/onet/31.0');
const outputPath = resolve(process.cwd(), process.argv[3] ?? 'data/seed/career-reference.seed.json');
const [occupationRows, contentRows, essentialRows, transferableRows, knowledgeRows, abilityRows, interestRows, technologyRows, jobZoneRows, educationRows] = await Promise.all([
  readCsv(join(rawDirectory, 'occupation_data.csv')),
  readCsv(join(rawDirectory, 'content_model_reference.csv')),
  readCsv(join(rawDirectory, 'essential_skills.csv')),
  readCsv(join(rawDirectory, 'transferable_skills.csv')),
  readCsv(join(rawDirectory, 'knowledge.csv')),
  readCsv(join(rawDirectory, 'abilities.csv')),
  readCsv(join(rawDirectory, 'career_interest_types.csv')),
  readCsv(join(rawDirectory, 'software_skills.csv')),
  readCsv(join(rawDirectory, 'job_zones.csv')),
  readCsv(join(rawDirectory, 'education.csv')),
]);
const descriptions = new Map(contentRows.map((row) => [row['Element ID']!, normalizeText(row.Description ?? '')]));
const zones = new Map(jobZoneRows.map((row) => [row['O*NET-SOC Code']!, numberOrNull(row['Job Zone'])]));
const occupations = occupationRows.filter((row) => selected.has(row['O*NET-SOC Code'] ?? '')).map((row) => ({
  code: row['O*NET-SOC Code']!, title: normalizeText(row.Title ?? ''), description: normalizeText(row.Description ?? ''),
  careerCluster: cluster(row.Title ?? ''), educationLevel: educationFromCategory(educationRows, row['O*NET-SOC Code']!),
  jobZone: zones.get(row['O*NET-SOC Code']!) ?? null,
}));
if (occupations.length !== selectedCodes.length) throw new Error(`Expected ${selectedCodes.length} selected occupations, found ${occupations.length}.`);

const skillMeasures = measures([...essentialRows, ...transferableRows], 15);
const knowledgeMeasures = measures(knowledgeRows, 10);
const abilityMeasures = measures(abilityRows, 10);
const selectedTechnologyRows = technologyRows.filter((row) => selected.has(row['O*NET-SOC Code'] ?? ''));
const technologyFrequency = new Map<string, { name: string; category: string; count: number }>();
for (const row of selectedTechnologyRows) {
  const name = normalizeText(row['Workplace Example'] ?? '');
  if (!name) continue;
  const key = normalizeKey(name);
  const current = technologyFrequency.get(key) ?? { name, category: normalizeText(row['Element Name'] ?? ''), count: 0 };
  current.count += row['Hot Technology'] === 'Y' ? 3 : row['In Demand'] === 'Y' ? 2 : 1;
  technologyFrequency.set(key, current);
}
const selectedTechnologyKeys = new Set([...technologyFrequency.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 140).map(([key]) => key));
const technologies = [...technologyFrequency.entries()].filter(([key]) => selectedTechnologyKeys.has(key)).map(([key, value]) => ({
  externalId: `technology:${key}`, name: value.name, category: value.category,
}));
const technologyRelations = selectedTechnologyRows.filter((row) => selectedTechnologyKeys.has(normalizeKey(row['Workplace Example'] ?? ''))).map((row) => ({
  occupationCode: row['O*NET-SOC Code']!, technologyExternalId: `technology:${normalizeKey(row['Workplace Example'] ?? '')}`,
  importance: row['Hot Technology'] === 'Y' ? 100 : row['In Demand'] === 'Y' ? 75 : 50,
}));

const coreSkillIds = new Set(skillMeasures.map((row) => row.externalId));
const uniqueSkillRows = [...essentialRows, ...transferableRows].filter((row) => coreSkillIds.has(row['Element ID'] ?? ''));
const skills = [
  ...[...new Map(uniqueSkillRows.map((row) => [row['Element ID'], row])).values()].map((row) => ({
    externalId: row['Element ID']!, name: normalizeText(row['Element Name'] ?? ''),
    description: descriptions.get(row['Element ID'] ?? '') || null,
    category: row['Element ID']?.startsWith('2.A') ? 'essential' : 'transferable',
  })),
  ...technologies.map((technology) => ({
    externalId: technology.externalId,
    name: technology.name,
    description: `Software skill: ${technology.category}.`,
    category: 'technology',
  })),
];
const occupationSkills = [
  ...skillMeasures.map((row) => ({ ...row, skillExternalId: row.externalId, requirementType: (row.importance ?? 0) >= 50 ? 'required' : 'preferred' })),
  ...technologyRelations.map((row) => ({
    occupationCode: row.occupationCode, skillExternalId: row.technologyExternalId,
    importance: row.importance, level: null, requirementType: row.importance >= 75 ? 'required' : 'preferred',
  })),
];
const interests = [...new Map(interestRows.map((row) => [row['Element ID'], row])).values()].map((row) => ({
  externalId: row['Element ID']!, name: normalizeText(row['Element Name'] ?? ''), description: descriptions.get(row['Element ID'] ?? '') || null,
}));
const occupationInterests = interestRows.filter((row) => selected.has(row['O*NET-SOC Code'] ?? '')).map((row) => ({
  occupationCode: row['O*NET-SOC Code']!, interestExternalId: row['Element ID']!, score: scaleOneToSeven(numberOrNull(row['Data Value'])) ?? 0,
}));

function referenceEntries(records: ReturnType<typeof measures>) {
  return [...new Map(records.map((row) => [row.externalId, row])).values()].map((row) => ({
    externalId: row.externalId, name: row.name, description: descriptions.get(row.externalId) || null,
  }));
}

const jobs = occupations.map((occupation, index) => {
  const related = occupationSkills.filter((row) => row.occupationCode === occupation.code).sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0)).slice(0, 8);
  const jobTitle = occupation.careerCluster === 'Cross-industry' ? occupation.title : `${occupation.title} — ${occupation.careerCluster}`;
  return {
    externalId: `demo-job-${String(index + 1).padStart(2, '0')}`,
    occupationCode: occupation.code,
    title: jobTitle,
    companyName: `CareerMate Demo Company ${String(index + 1).padStart(2, '0')}`,
    description: `Synthetic development vacancy derived from the O*NET ${occupation.title} profile. This is not a real job vacancy.`,
    location: index % 3 === 0 ? 'Jakarta (Demo)' : index % 3 === 1 ? 'Bandung (Demo)' : 'Remote (Demo)',
    workMode: index % 3 === 2 ? 'remote' : index % 2 === 0 ? 'hybrid' : 'onsite',
    employmentType: index % 7 === 0 ? 'contract' : 'full_time',
    experienceLevel: (['entry', 'junior', 'mid', 'senior'] as const)[index % 4],
    minimumYearsExperience: index % 4,
    skills: related.map((row, skillIndex) => ({ skillExternalId: row.skillExternalId, requirementType: skillIndex < 5 ? 'required' : 'preferred', importance: Math.max(40, row.importance ?? 50) })),
  };
});

const demoProfiles = [
  ['00000000-0000-4000-8000-000000000001', 'alya.pratama@example.test', 'Alya Pratama', 'Data and analytics learner'],
  ['00000000-0000-4000-8000-000000000002', 'bima.santoso@example.test', 'Bima Santoso', 'Software engineering learner'],
  ['00000000-0000-4000-8000-000000000003', 'citra.lestari@example.test', 'Citra Lestari', 'Design and research learner'],
  ['00000000-0000-4000-8000-000000000004', 'danu.wijaya@example.test', 'Danu Wijaya', 'Cybersecurity learner'],
  ['00000000-0000-4000-8000-000000000005', 'eka.maharani@example.test', 'Eka Maharani', 'Project management learner'],
].map(([id, email, fullName, headline], index) => ({
  id, email, fullName, headline,
  educationLevel: index < 2 ? 'bachelor' : index === 2 ? 'vocational' : 'associate',
  skillExternalIds: occupationSkills.filter((row) => row.occupationCode === selectedCodes[index + 14]).slice(0, 5).map((row) => row.skillExternalId),
  interestExternalIds: occupationInterests.filter((row) => row.occupationCode === selectedCodes[index + 14]).sort((a, b) => b.score - a.score).slice(0, 2).map((row) => row.interestExternalId),
}));

const seed = {
  metadata: {
    generatedAt: new Date().toISOString(),
    source: ONET_SOURCE,
    notice: 'Reference records are a modified subset of O*NET 31.0. Jobs and users are explicitly synthetic.',
  },
  occupations,
  skills,
  occupationSkills,
  interests,
  occupationInterests,
  knowledgeAreas: referenceEntries(knowledgeMeasures),
  occupationKnowledge: knowledgeMeasures.map((row) => ({ occupationCode: row.occupationCode, knowledgeExternalId: row.externalId, importance: row.importance, level: row.level })),
  abilities: referenceEntries(abilityMeasures),
  occupationAbilities: abilityMeasures.map((row) => ({ occupationCode: row.occupationCode, abilityExternalId: row.externalId, importance: row.importance, level: row.level })),
  technologies,
  occupationTechnologies: technologyRelations,
  jobs,
  demoProfiles,
};
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(seed, null, 2)}\n`, 'utf8');
process.stdout.write(`${JSON.stringify({ outputPath, occupations: occupations.length, skills: skills.length, jobs: jobs.length, users: demoProfiles.length }, null, 2)}\n`);
