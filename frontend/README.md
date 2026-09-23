# CareerMate

CareerMate adalah platform pendamping karier untuk profesional Indonesia. Aplikasi ini menyediakan alur pembuatan CV, analisis CV, pencarian pekerjaan, dan dashboard perkembangan karier dalam satu antarmuka.

## Teknologi

- React 18 dan TypeScript
- Vite
- Tailwind CSS dan shadcn/ui
- React Router
- TanStack Query

## Menjalankan secara lokal

Jalankan dari root monorepo:

```sh
npm ci
npm run dev:frontend
```

Aplikasi development tersedia di `http://localhost:8080`.

Fitur AI yang terhubung ke backend:

- review CV dan Motivation Letter;
- generasi CV/Motivation Letter dari profil terstruktur;
- rencana dan feedback InterviewMate;
- penjelasan rekomendasi karier;
- penjelasan AI untuk hasil job matching deterministik.

Setiap request AI membutuhkan consent eksplisit. Provider backend default-nya nonaktif. Login dan registrasi selalu memanggil gateway `/api/v1/auth` di backend; frontend tidak menyimpan key provider autentikasi. Konfigurasi Supabase/JWKS berada sepenuhnya di environment backend.

## Perintah utama

```sh
npm run dev       # Menjalankan development server
npm run build     # Membuat production build
npm run preview   # Meninjau production build
npm run lint      # Memeriksa kualitas kode
```

## Struktur proyek

```text
public/            Aset statis
src/assets/        Aset visual aplikasi
src/components/    Komponen React
src/contexts/      State global tema dan bahasa
src/hooks/         React hooks
src/pages/         Halaman aplikasi
```

Hasil production build dibuat di direktori `dist/`.
