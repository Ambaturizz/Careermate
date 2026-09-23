# CareerMate

CareerMate menggunakan npm workspaces agar frontend, backend, dan kontrak API dapat dikembangkan bersama tanpa menduplikasi tipe data.

## Struktur

```text
frontend/              React + Vite
backend/               Fastify + TypeScript
packages/contracts/    Schema Zod dan tipe API bersama
docs/                  Keputusan arsitektur dan roadmap AI
```

## Persyaratan

- Node.js 20.19+ atau 22.12+
- npm 10 atau lebih baru
- PostgreSQL 15+ untuk deployment production (development memakai PGlite embedded)
- Gemini API key dari Google AI Studio untuk fitur AI hosted (Ollama tetap opsional untuk lokal)

## Instalasi

```sh
npm ci
```

Gunakan `npm install` hanya ketika menambah atau memperbarui dependency sehingga `package-lock.json` ikut diperbarui.

Salin file environment sesuai kebutuhan:

```sh
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Konfigurasi development memakai `DATABASE_MODE=embedded`. Backend membuat database PostgreSQL-compatible in-memory, menjalankan migrasi, dan memuat seed terkurasi secara otomatis. Tidak dibutuhkan kredensial database untuk mencoba alur frontend–backend.

Untuk PostgreSQL/Supabase, ubah `DATABASE_MODE=postgres`, isi `DATABASE_URL`, lalu jalankan:

```sh
npm run db:migrate
npm run db:seed
```

Mode AI pada `.env.example` default adalah `disabled`. Semua endpoint AI mewajibkan autentikasi, consent eksplisit pada setiap request, dan rate limit khusus. Rekomendasi database dan job matching tetap tersedia melalui engine deterministik tanpa mengirim data ke provider AI.

Untuk mengaktifkan Gemini, buka `backend/.env` lalu isi konfigurasi berikut:

```dotenv
AI_PROVIDER=gemini
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
GEMINI_API_KEY=your-google-ai-studio-api-key
GEMINI_MODEL=gemini-3.5-flash-lite
AI_TIMEOUT_MS=60000
```

API key hanya boleh disimpan di backend. Untuk deployment, masukkan kelima nilai tersebut melalui menu environment variables milik layanan hosting backend, bukan pada hosting frontend. Ollama dan endpoint OpenAI-compatible masih didukung sebagai fallback; lihat [panduan backend](backend/README.md).

## Development

Jalankan pada dua terminal:

```sh
npm run dev:backend
npm run dev:frontend
```

- Frontend: `http://localhost:8080`
- Backend: `http://127.0.0.1:3000`
- Health check: `http://127.0.0.1:3000/health`
- Readiness database: `http://127.0.0.1:3000/ready`

## Verifikasi

```sh
npm run build
npm run typecheck
npm test
npm run lint
```

Workflow GitHub Actions menjalankan instalasi bersih dan seluruh pemeriksaan tersebut pada setiap pull request serta push ke `main`.

## Supabase

1. Buat project Supabase dan simpan password database di password manager.
2. Buka **Connect**, pilih direct connection atau session pooler untuk backend yang berjalan terus-menerus.
3. Set `DATABASE_MODE=postgres`, lalu salin connection string PostgreSQL ke `backend/.env` sebagai `DATABASE_URL`; URL-encode karakter khusus pada password.
4. Pertahankan `DATABASE_SSL_MODE=require`, jalankan `npm run db:migrate`, lalu `npm run db:seed`.
5. Untuk production, set `NODE_ENV=production`, `DATABASE_MODE=postgres`, `AUTH_MODE=jwks`, URL JWKS/issuer project, audience, `AUTH_SUPABASE_URL`, public anon/publishable key pada `AUTH_SUPABASE_ANON_KEY`, serta CORS origin yang spesifik.

Frontend memanggil endpoint login/registrasi CareerMate; key provider tidak disimpan di browser. Jangan menaruh connection string atau service-role key di `frontend/.env` maupun `backend/.env`. Schema `app`/`career` tidak perlu diekspos lewat Data API Supabase.

Dokumentasi lengkap: [deployment](docs/deployment.md), [database](docs/database.md), [sumber data](docs/data-sources.md), [arsitektur AI](docs/ai-architecture.md), dan [strategi repository](docs/repository-strategy.md).
