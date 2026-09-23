# Sumber Data Karier

CareerMate hanya mengimpor berkas unduhan resmi. Direktori `backend/data/raw/` diabaikan Git; hanya seed kecil yang telah dinormalisasi yang disimpan di repository. Setiap proses import mencatat versi, URL sumber, lisensi, waktu pengambilan, waktu import, status, dan statistik ke `career.data_sources` serta `career.data_import_runs`.

## O*NET Database

- Versi: **31.0**, rilis Agustus 2026.
- Penerbit: U.S. Department of Labor, Employment and Training Administration (USDOL/ETA).
- Sumber resmi: [O*NET Database](https://www.onetcenter.org/database.html) dan [riwayat rilis](https://www.onetcenter.org/db_releases.html).
- Lisensi: [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).
- Atribusi yang disimpan: `O*NET® 31.0 Database by USDOL/ETA`; CareerMate menyatakan bahwa data telah dimodifikasi/dinormalisasi.

Importer sengaja memilih tabel yang relevan, bukan menyalin seluruh database mentah:

| Nama lokal | Tabel O*NET | Pemakaian |
| --- | --- | --- |
| `occupation_data.csv` | Occupation Data | kode, judul, deskripsi |
| `content_model_reference.csv` | Content Model Reference | definisi elemen |
| `essential_skills.csv` | Essential Skills | skill dan nilai occupation-skill |
| `transferable_skills.csv` | Transferable Skills | skill dan nilai occupation-skill |
| `knowledge.csv` | Knowledge | knowledge area |
| `abilities.csv` | Abilities | ability |
| `career_interest_types.csv` | Career Interest Types | minat RIASEC |
| `software_skills.csv` | Software Skills | software/technology skills |
| `job_zones.csv` | Job Zones | tingkat preparation |
| `education.csv` | Education | estimasi jenjang pendidikan |

Unduh versi CSV dari halaman resmi, ekstrak, lalu salin/ubah nama sepuluh berkas di atas ke:

```text
backend/data/raw/onet/31.0/
```

Jalankan dari root repository:

```powershell
npm run data:import:onet --workspace @careermate/backend
```

Normalisasi skor:

- O*NET `Importance` berskala 1–5 menjadi `(nilai - 1) / 4 × 100`.
- O*NET `Level` dan `Occupational Interests` berskala 1–7 menjadi `(nilai - 1) / 6 × 100`.
- Nilai mentah tetap disimpan pada kolom `original_values`.
- Jenjang pendidikan diambil dari kategori dengan persentase respons terbesar; pemetaan kategori ke jenjang dijelaskan di kode importer.
- Software Skills disimpan sebagai `technologies` dan juga sebagai canonical skill kategori `technology`, sehingga dapat dipakai oleh matching tanpa menghilangkan taksonomi teknologi.

Verifikasi importer terhadap seluruh berkas O*NET 31.0 pada PostgreSQL in-memory menghasilkan 1.016 occupation, 8.788 canonical/technology skill, 63.671 occupation-skill relation, 9 interest, 8.307 occupation-interest relation, 33 knowledge area, 52 ability, dan 8.753 technology. Angka pada Supabase baru tersedia setelah developer menjalankan importer dengan `DATABASE_URL` project tersebut.

## ESCO

- Versi terbaru yang diverifikasi: **1.2.1**, pembaruan 10 Desember 2025 (release 5.7.0).
- Penerbit: European Commission.
- Sumber resmi: [ESCO downloads](https://esco.ec.europa.eu/en/use-esco/download).
- Ketentuan reuse: [Commission Decision 2011/833/EU](https://eur-lex.europa.eu/eli/dec/2011/833/oj); atribusi dan penandaan perubahan wajib dipertahankan.

Unduhan ESCO memerlukan formulir/email pada situs resmi. Ekstrak bundle CSV bahasa Inggris ke:

```text
backend/data/raw/esco/1.2.1/
```

Importer menemukan otomatis berkas occupation, skill, dan occupation-skill relation. Jalankan:

```powershell
npm run data:import:esco --workspace @careermate/backend
```

Label alternatif masuk ke `skill_aliases`. Exact normalized-label collision tidak dianggap sebagai bukti kesetaraan semantik: importer menunjuk canonical record yang ada tetapi memberi `external_mappings.status = manual_review`. Java dan JavaScript tidak pernah digabung dengan fuzzy matching.

## KBJI

- Versi: **KBJI 2014**, publikasi resmi terbaru yang ditemukan untuk unduhan klasifikasi lengkap.
- Penerbit: Badan Pusat Statistik (BPS).
- Sumber resmi: [PPID BPS – Unduh Publikasi](https://ppid.bps.go.id/app/konten/3302/Unduh.html).
- Ketentuan: [Ketentuan Penggunaan BPS](https://www.bps.go.id/id/term-of-use) mengizinkan penggunaan dan distribusi dengan pencantuman judul, tanggal akses, BPS, dan tautan langsung serta tanpa menyiratkan dukungan BPS.

KBJI hanya menjadi sumber lokalisasi/mapping, bukan pengganti detail skill O*NET/ESCO. PDF resmi tidak diparsing secara heuristik. Siapkan CSV terverifikasi dari publikasi resmi dengan kolom:

```csv
code,title,description
```

Letakkan sebagai `backend/data/raw/kbji/2014/kbji_2014.csv`, lalu jalankan:

```powershell
npm run data:import:kbji --workspace @careermate/backend
```

Kecocokan judul exact hanya ditandai `manual_review`. Tidak ada mapping lintas-taksonomi yang dikarang.

## Data pekerjaan

CareerMate tidak melakukan scraping LinkedIn, Indeed, Glassdoor, JobStreet, Glints, atau situs lowongan lain. Seed berisi lowongan sintetis dengan `source = careermate-seed`, `is_synthetic = true`, nama perusahaan `CareerMate Demo Company NN`, dan deskripsi yang menyatakan bahwa data bukan lowongan nyata.
