# CareerMate Backend

Fastify + TypeScript backend untuk katalog karier, profil, deterministic matching, dan fitur AI terstruktur. PostgreSQL diakses melalui Drizzle ORM; browser tidak mengakses database secara langsung.

## Menjalankan

```powershell
copy .env.example .env
npm run dev
```

Mode development default menggunakan PGlite embedded: migrasi dan seed dijalankan otomatis saat server dimulai. Untuk Supabase/PostgreSQL gunakan `DATABASE_MODE=postgres`, isi `DATABASE_URL`, lalu jalankan `npm run db:migrate` dan `npm run db:seed`. Dari root repository gunakan `npm run dev:backend`.

## Endpoint data

Semua endpoint API memakai prefix `/api/v1`.

| Method | Path | Auth | Fungsi |
| --- | --- | --- | --- |
| GET | `/skills`, `/skills/search?q=` | publik | List/search skill |
| GET | `/occupations`, `/occupations/search?q=` | publik | List/search occupation |
| GET | `/occupations/:id` | publik | Detail beserta relasi |
| GET | `/jobs`, `/jobs/:id` | publik | Job dan persyaratan skill |
| GET | `/auth/config` | publik | Status ketersediaan registrasi |
| POST | `/auth/register` | publik | Membuat akun melalui provider auth |
| POST | `/auth/login` | publik | Masuk dan memperoleh access token |
| POST | `/auth/refresh` | publik | Memperbarui access token menggunakan refresh token |
| GET | `/auth/me` | wajib | Identitas pengguna yang sedang aktif |
| GET, PUT | `/profile` | wajib | Baca/perbarui profil sendiri |
| GET, POST | `/profile/skills` | wajib | Skill pengguna |
| PUT, DELETE | `/profile/skills/:id` | wajib | Ubah/hapus skill milik sendiri |
| GET, POST | `/profile/interests` | wajib | Minat pengguna |
| GET, POST | `/profile/education` | wajib | Pendidikan |
| GET, POST | `/profile/experience` | wajib | Pengalaman |
| GET, POST | `/profile/projects` | wajib | Project dan skill |
| GET | `/career/recommendations` | wajib | Matching karier deterministik |
| POST | `/jobs/:id/match` | wajib | Matching job deterministik |

`GET /health` tidak memanggil database; `GET /ready` memverifikasi koneksi database. Pagination memakai `limit` (maksimum 100) dan `offset`.

Mode development memakai `x-careermate-user-id` atau `AUTH_DEV_USER_ID`. Frontend development mengirim identity fixture dari `VITE_AUTH_DEV_USER_ID`. Form login lokal menggunakan `AUTH_DEV_EMAIL` dan `AUTH_DEV_PASSWORD` (default demo: `careermate@gmail.com` / `12345`); registrasi tetap tidak aktif pada mode ini.

Production wajib memakai `AUTH_MODE=jwks` dan Bearer JWT valid. Isi `AUTH_SUPABASE_URL` dan public anon/publishable key di `AUTH_SUPABASE_ANON_KEY` agar backend dapat menangani registrasi/login serta refresh session. Kata sandi hanya diteruskan melalui HTTPS ke Supabase Auth, tidak dicatat atau disimpan di database CareerMate. Access token yang dikembalikan frontend kemudian diverifikasi melalui JWKS pada semua endpoint privat.

## Endpoint AI yang sudah ada

Endpoint POST AI tetap terpisah dari matching deterministik: `/career/recommendations`, `/jobs/match`, `/interviews/plan`, `/interviews/feedback`, `/documents/review`, dan `/documents/generate`. Semuanya memerlukan identitas valid, `consentToAiProcessing: true`, dan tunduk pada `AI_RATE_LIMIT_MAX`. Provider default `disabled`, sehingga tidak ada data pengguna yang dikirim sebelum operator mengaktifkan provider.

### Gemini API (direkomendasikan)

Simpan API key hanya di `backend/.env` untuk development lokal atau pada environment variables layanan hosting backend:

```dotenv
AI_PROVIDER=gemini
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
GEMINI_API_KEY=your-google-ai-studio-api-key
GEMINI_MODEL=gemini-3.5-flash-lite
AI_TIMEOUT_MS=60000
```

Jangan memakai prefix `VITE_` dan jangan menaruh key tersebut di `frontend/.env`. Adapter Gemini memakai endpoint native `generateContent`, meminta structured output JSON, membersihkan keyword JSON Schema yang tidak didukung Gemini, lalu memvalidasi hasil kembali menggunakan kontrak Zod. Error kuota, kredensial, safety block, timeout, JSON rusak, dan schema mismatch dikembalikan sebagai kode error backend yang aman.

Free Tier dapat dibatasi berdasarkan project/model dan data yang dikirim dapat digunakan Google untuk peningkatan produk. Gunakan consent yang sudah diwajibkan endpoint CareerMate dan pertimbangkan paid tier sebelum memproses CV nyata di production.

Ollama tetap tersedia sebagai fallback lokal. Jalankan `ollama pull qwen3:4b-instruct`, lalu set `AI_PROVIDER=openai-compatible`, `AI_BASE_URL=http://127.0.0.1:11434/v1`, `AI_API_KEY=ollama`, `AI_MODEL=qwen3:4b-instruct`, dan `AI_TIMEOUT_MS=180000`.

Rencana, pertanyaan, jawaban, skor, dan feedback InterviewMate disimpan dengan pemeriksaan kepemilikan pengguna.

Lihat [database](../docs/database.md), [sumber data](../docs/data-sources.md), dan [arsitektur AI](../docs/ai-architecture.md).
