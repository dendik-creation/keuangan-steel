---
 ##  MANAJEMEN KEUANGAN PRIBADI

##  Latar Belakang
Pengelolaan keuangan pribadi sering kali dilakukan secara manual sehingga menyulitkan pengguna dalam mencatat pemasukan dan pengeluaran secara terstruktur. Hal ini dapat menyebabkan ketidaktahuan terhadap kondisi finansial yang sebenarnya.

Oleh karena itu, dikembangkan sistem **Manajemen Keuangan Pribadi berbasis web** yang dapat membantu pengguna mencatat transaksi keuangan secara digital, cepat, dan terorganisir. Sistem ini diharapkan dapat membantu pengguna dalam memantau kondisi keuangan secara real-time melalui dashboard yang informatif.

---

##  Tujuan Proyek
* Membuat sistem pencatatan keuangan berbasis web.
* Memudahkan pengguna dalam mencatat pemasukan dan pengeluaran.
* Menyediakan laporan keuangan secara otomatis.
* Menampilkan ringkasan keuangan melalui dashboard.
* Mengimplementasikan sistem autentikasi pengguna.

---

##  Teknologi yang Digunakan
* Node.js (Runtime JavaScript)
* Express.js (Backend Framework)
* MySQL (Database)
* HTML5 (Frontend Structure)
* CSS3 (Styling)
* JavaScript (Frontend Logic)
* Fetch API (Komunikasi Frontend & Backend)

---

##  Fitur Utama
### 1. Autentikasi Pengguna
* Login & Register menggunakan username dan password
* Session login sederhana

### 2. Manajemen Transaksi
* Tambah transaksi pemasukan
* Tambah transaksi pengeluaran
* Edit transaksi
* Hapus transaksi

### 3. Dashboard Keuangan
* Total pemasukan
* Total pengeluaran
* Saldo akhir
* Ringkasan transaksi terbaru

### 4. Laporan Keuangan
* Filter data transaksi
* Tampilan rekap pemasukan & pengeluaran

 **Catatan:**
Tidak ada fitur akun pemilik khusus, hanya menggunakan **username pengguna biasa (user login)**.

---

##  Skema Database

### Tabel `users`
* id_user (PK)
* nama
* email
* password
* role

### Tabel `transaksi`
* id_transaksi (PK)
* id_user (FK)
* jenis (Pemasukan / Pengeluaran)
* jumlah
* tanggal
* keterangan

### Tabel `kategori`
* id_kategori (PK)
* nama_kategori
* jenis

### Tabel `laporan`
* id_laporan (PK)
* id_user (FK)
* periode
* total_pemasukan
* total_pengeluaran
* saldo

---

##  Struktur Sistem

```
KEUANGAN/
├── node_modules/
│
├── src/
│   ├── database/
│   │   └── query.sql
│   │
│   ├── routes/
│   │   ├── index.js
│   │   ├── dashboard.js
│   │   └── pages.js
│   │
│   ├── views/
│   │   ├── partials/
│   │   ├── dashboard.ejs
│   │   ├── index.ejs
│   │   ├── laporan.ejs
│   │   ├── login.ejs
│   │   ├── register.ejs
│   │   └── transaksi.ejs
│   │
│   ├── db.js
│   ├── handlers.js
│   ├── index.js
│   └── routes.js
│
├── public/
│   ├── pages/
│   ├── scripts/
│   └── styles/
│
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

##  Pembagian Tugas Tim

## Anggota 1 — Frontend & UI/UX (Amanda Putri Cahyani-202451167)
### Tugas
* Mendesain tampilan website.
* Membuat halaman:

  * Dashboard
  * Login
  * Register
  * Tambah transaksi
  * Edit transaksi
  * Laporan
* Membuat CSS responsif.
* Membuat navbar dan footer.

# Anggota 2 — Backend Autentikasi (Gandhys Intan Sawitri-202451172)
### Tugas
Membuat sistem:

* Register akun
* Login
* Logout
* Session
* Middleware autentikasi

# Anggota 3 — CRUD Transaksi (Nur Qurrotu Ain-202451158)
### Tugas
Mengelola transaksi:

* Tambah pemasukan
* Tambah pengeluaran
* Edit transaksi
* Hapus transaksi
* Menampilkan transaksi pengguna

# Anggota 4 — Dashboard, Grafik, dan Laporan (Ghina Fadhila Rahmah-292451166)
### Tugas
Membuat:
* Ringkasan keuangan
* Total pemasukan
* Total pengeluaran
* Saldo
* Grafik bulanan

### Anggota 1
feat: membuat halaman dashboard
feat: menambahkan CSS responsive
feat: memperbaiki tampilan login

### Anggota 2
feat: menambahkan register user
feat: membuat login dan session
feat: menambahkan logout

### Anggota 3
feat: menambahkan CRUD transaksi
feat: menambahkan relasi user dan transaksi
feat: memperbaiki validasi transaksi

### Anggota 4
feat: membuat dashboard laporan
feat: menambahkan chart pemasukan pengeluaran
feat: menambahkan laporan bulanan

---

##  Instalasi

1. Clone repository

```bash
git clone <repo-url>
```

2. Masuk folder project

```bash
cd keuangan
```

3. Install dependency

```bash
npm install
```

4. Setup database MySQL

* Import file `query.sql`
* Buat database `keuangan`

5. Jalankan server

```bash
npm start
```

6. Akses aplikasi

```
http://localhost:3000
```

---

##  Akun Demo

### User 1

* Username: AnakPutra
* Password: 12345

### User 2

* Username: AnakPutri
* Password: 67890

---
