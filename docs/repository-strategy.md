# Strategi Repository

## Rekomendasi saat ini: monorepo

Pertahankan satu repository selama frontend, backend, dan kontrak API masih berubah bersama. npm workspaces melakukan linking package lokal secara otomatis dan satu pull request dapat memperbarui seluruh boundary secara atomik.

Aturan agar monorepo tidak menimbulkan coupling tersembunyi:

- Frontend tidak boleh mengimpor file dari `backend/src`.
- Backend tidak boleh mengimpor file dari `frontend/src`.
- Keduanya hanya berbagi `@careermate/contracts`.
- Setiap workspace memiliki build, typecheck, test, dan environment sendiri.
- Deployment FE dan BE tetap menjadi dua workflow terpisah.

## Kapan dipisah

Pisahkan ketika salah satu kondisi ini terjadi:

- Tim dan hak akses FE/BE berbeda.
- Siklus release dan ownership benar-benar independen.
- Backend melayani lebih dari satu aplikasi.
- Ukuran CI monorepo mulai menjadi hambatan yang terukur.

## Opsi pemisahan

### Dua repo — direkomendasikan untuk jangka panjang

```text
careermate-frontend
careermate-backend
```

Backend menjadi sumber kebenaran OpenAPI. CI backend menerbitkan `openapi.json` sebagai release artifact; CI frontend menghasilkan typed client dari versi spesifikasi yang dipilih. Jangan menyalin DTO secara manual.

### Tiga repo/package

```text
careermate-frontend
careermate-backend
careermate-contracts
```

Ekstrak `packages/contracts` menjadi package privat di GitHub Packages. FE dan BE harus menggunakan versi eksplisit, misalnya `@careermate/contracts@1.4.0`, dan Dependabot/Renovate membuka PR upgrade.

Opsi ini paling dekat dengan struktur sekarang, tetapi memerlukan disiplin semantic versioning dan konfigurasi token registry.

## Prosedur split dari struktur sekarang

1. Pastikan build dan test setiap workspace hijau.
2. Buat repo FE dan pindahkan isi `frontend/` menggunakan `git filter-repo` bila histori diperlukan.
3. Buat repo BE dan lakukan hal yang sama untuk `backend/`.
4. Pilih OpenAPI artifact atau publish `packages/contracts` sebagai package privat.
5. Ganti dependency workspace `"*"` dengan versi package yang eksplisit.
6. Tambahkan CI terpisah, environment deployment terpisah, dan CORS production yang spesifik.

Hindari Git submodule untuk dependency kontrak karena mudah menghasilkan checkout yang tidak sinkron. Hindari pula menyalin file schema ke dua repository.
