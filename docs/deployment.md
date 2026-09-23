# Deployment CareerMate

CareerMate membutuhkan tiga layanan: frontend statis, backend Node.js yang selalu aktif, dan PostgreSQL/Supabase. Gemini dipanggil hanya oleh backend.

## 1. Siapkan Supabase

1. Buat project dan ambil connection string PostgreSQL dari menu **Connect**.
2. Ambil project URL, public anon/publishable key, JWKS URL, dan issuer Auth.
3. Pastikan email/password sign-in aktif. Atur Site URL dan redirect URLs ke domain frontend production.
4. Gunakan session pooler bila platform backend memakai IPv4 atau koneksi berumur panjang.

## 2. Konfigurasi backend

Gunakan [contoh environment production](../backend/.env.production.example). Nilai wajib terpenting:

```dotenv
NODE_ENV=production
HOST=0.0.0.0
CORS_ORIGINS=https://frontend.example.com
TRUST_PROXY=true
AI_PROVIDER=gemini
GEMINI_API_KEY=...
DATABASE_MODE=postgres
DATABASE_URL=...
AUTH_MODE=jwks
AUTH_JWKS_URL=...
AUTH_JWT_ISSUER=...
AUTH_SUPABASE_URL=...
AUTH_SUPABASE_ANON_KEY=...
```

Build harus dijalankan dari root monorepo karena backend bergantung pada workspace `@careermate/contracts`:

```sh
npm ci
npm run build
```

Sebelum release pertama dan setiap perubahan schema database:

```sh
npm run db:prepare:prod
```

Start command backend:

```sh
npm start
```

Gunakan `/health` untuk liveness dan `/ready` untuk readiness database. Jangan mengarahkan health check platform ke endpoint frontend.

## 3. Konfigurasi frontend

`VITE_API_URL` disisipkan saat build, sehingga perubahan nilainya membutuhkan rebuild frontend. Sertakan prefix `/api/v1`:

```dotenv
VITE_API_URL=https://backend.example.com/api/v1
VITE_API_TIMEOUT_MS=90000
```

Build command:

```sh
npm ci
npm run build --workspace @careermate/contracts
npm run build --workspace @careermate/frontend
```

Publish directory adalah `frontend/dist`. Hosting harus mengarahkan semua route SPA yang tidak cocok ke `index.html`; image Docker dan file `_redirects` yang disediakan sudah melakukannya.

## 4. Deployment dengan Docker

Jalankan build dari root repository:

```sh
docker build -f deploy/Dockerfile.backend -t careermate-backend .
docker build -f deploy/Dockerfile.frontend --build-arg VITE_API_URL=https://backend.example.com/api/v1 -t careermate-frontend .
```

Jalankan migrasi menggunakan image backend dengan environment production yang sama sebelum menyalakan release baru:

```sh
docker run --rm --env-file backend.production.env careermate-backend npm run db:prepare:prod
```

## 5. Checklist setelah deployment

1. `GET https://backend.example.com/health` mengembalikan `status: ok`, provider `gemini`, dan model yang benar.
2. `GET https://backend.example.com/ready` mengembalikan `status: ready`.
3. Buka langsung `https://frontend.example.com/cvmate`; halaman tidak boleh 404.
4. Daftar akun baru, verifikasi email bila diwajibkan, lalu login.
5. Isi profil dan pastikan refresh halaman tetap menampilkan data akun yang sama.
6. Jalankan satu review CV dummy, satu rencana interview, dan satu rekomendasi karier.
7. Tunggu atau paksa access token kedaluwarsa dan pastikan refresh token memperbarui sesi tanpa login ulang.
8. Periksa log backend: tidak boleh ada API key, token, kata sandi, atau isi CV mentah.

## Batas jaminan

Build dan test lokal memastikan kontrak kode. Deployment baru dapat dinyatakan sehat setelah smoke test terhadap URL production, database production, Supabase Auth, dan kuota Gemini milik environment tersebut.
