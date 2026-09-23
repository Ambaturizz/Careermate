# Arsitektur AI CareerMate

## Prinsip utama

1. **Backend sebagai trust boundary.** API key, prompt sistem, akses database, dan model tidak boleh berada di frontend.
2. **Kontrak terstruktur.** Input pengguna dan output model selalu divalidasi; UI tidak memproses teks model yang bentuknya tidak diketahui.
3. **Hybrid intelligence.** Gunakan perhitungan deterministik untuk filter wajib dan skor dasar, lalu gunakan AI untuk penjelasan, coaching, dan generasi teks.
4. **Provider-agnostic.** Fitur bisnis bergantung pada `AiProvider`, bukan SDK vendor tertentu.
5. **Privacy by default.** Mode AI default mati. CV hanya dikirim ke provider setelah konfigurasi dan persetujuan pengguna yang jelas.

Setiap endpoint AI mewajibkan autentikasi, field `consentToAiProcessing: true`, dan rate limit khusus. Consent berlaku untuk satu request dan tidak disimpan sebagai persetujuan umum tanpa batas waktu.

## Alur request

```text
React UI
   │ validasi request
   ▼
Fastify route
   │ Zod contract + rate limit
   ▼
AI orchestrator
   │ prompt berversi
   ▼
AiProvider adapter ──► Gemini native / model lokal / endpoint OpenAI-compatible
   │
   ▼
validasi output model ──► response terstruktur ke UI
```

## Implementasi per fitur

### Career Path

- Simpan profil terstruktur: pendidikan, pengalaman, skill, level skill, minat, nilai kerja, dan target.
- Gunakan skill taxonomy yang konsisten agar `JavaScript`, `JS`, dan `ECMAScript` tidak dianggap skill berbeda.
- Hitung kandidat role secara deterministik dari skill/interest overlap.
- AI menjelaskan alasan, skill gap, dan learning plan; AI bukan satu-satunya penentu ranking.

### Job Matching

- Normalisasi job description menjadi skill wajib, skill tambahan, seniority, lokasi, dan work mode.
- Terapkan hard filter terlebih dahulu, lalu gabungkan weighted score dan semantic similarity.
- Simpan versi algoritma dan komponen skor agar hasil dapat dijelaskan serta diuji.
- AI hanya menulis rationale dan saran perbaikan kandidat.

Contoh bobot awal yang dapat dievaluasi ulang menggunakan data nyata:

```text
required skills     40%
experience level    20%
semantic similarity 20%
preferences         10%
education/language  10%
```

### Interview Learning

- Bangun question bank terversi berdasarkan role, competency, dan seniority.
- Pisahkan generation, evaluation rubric, dan feedback.
- Untuk pertanyaan teknis, gunakan rubric deterministik sebelum AI memberi coaching.
- Simpan attempt, score component, dan perkembangan; jangan hanya menyimpan skor total.

Implementasi saat ini menyimpan session, pertanyaan beserta rubrik, jawaban, skor, dan feedback. Context perusahaan, seniority, deskripsi lowongan, dan evaluation criteria diteruskan kembali saat feedback agar evaluasi konsisten dengan rencana.

### CV dan Motivation Letter

- Parse dokumen sebagai background job; jangan menahan request HTTP untuk OCR/embedding yang lama.
- Simpan dokumen asli di object storage dan hasil ekstraksi terstruktur di database.
- Builder memakai data profil terstruktur. Reviewer tidak boleh menambahkan fakta yang tidak diberikan pengguna.
- Render PDF dari template deterministik; AI hanya menghasilkan atau memperbaiki konten.

## Persistence yang direkomendasikan

- PostgreSQL untuk user, profile, skill, job, document metadata, interview session, dan audit event.
- `pgvector` untuk embedding profil, lowongan, dan knowledge base.
- Object storage kompatibel S3 untuk CV dan hasil render.
- Redis + worker queue untuk parsing, OCR, embedding, dan proses AI panjang.

Jangan menambahkan database sebelum schema domain dan aturan retensi data disetujui. Mulai dengan migration tool tunggal dan repository interface agar storage dapat diuji.

## RAG untuk AI pribadi

1. Kurasi sumber tepercaya: taxonomy skill, panduan interview, template CV, dan materi belajar.
2. Pecah dokumen berdasarkan struktur semantik, bukan panjang karakter semata.
3. Simpan embedding beserta source, version, locale, dan timestamp.
4. Retrieve hanya dokumen yang relevan dengan role dan bahasa pengguna.
5. Minta model menyertakan source ID pada rekomendasi yang bersifat faktual.
6. Evaluasi retrieval dan jawaban secara terpisah.

Fine-tuning sebaiknya dilakukan setelah prompt + RAG memiliki dataset evaluasi yang stabil. Jangan memakai CV pengguna untuk training tanpa consent eksplisit dan kebijakan penghapusan.

## Keamanan dan reliabilitas

- Autentikasi OIDC/JWT diverifikasi di backend.
- Authorization harus berbasis kepemilikan resource, bukan hanya status login.
- Enkripsi transport dan storage untuk dokumen pribadi.
- Rate limit per pengguna, timeout model, ukuran body maksimal, dan retry terbatas.
- Prompt injection diperlakukan sebagai input tidak tepercaya; model tidak mendapat tool berbahaya secara default.
- Log tidak boleh berisi CV mentah, token, API key, atau jawaban interview lengkap.
- Tambahkan moderation, audit trail, retention policy, dan tombol penghapusan data.

## Tahapan pengembangan

1. **Foundation:** auth, profile schema, migrations, object storage, observability.
2. **CV pipeline:** upload, parsing, review, builder, PDF rendering.
3. **Job matching:** ingestion, normalisasi, scoring deterministik, explanation AI.
4. **Interview:** question bank, session, rubric, progress tracking.
5. **Career path:** taxonomy, gap analysis, learning catalog, longitudinal recommendations.
6. **Evaluation:** golden dataset, regression test prompt/model, cost and latency budgets.
