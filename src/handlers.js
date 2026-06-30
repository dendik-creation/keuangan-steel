const db = require("./db");
const bcrypt = require('bcrypt');

async function getKategoriIdByJenis(jenis) {
  const jenisDb = jenis === 'Pemasukan' ? 'Pemasukan' : 'Pengeluaran';
  const [rows] = await db.query('SELECT id_kategori FROM kategori WHERE jenis = ? LIMIT 1', [jenisDb]);
  if (rows.length > 0) {
    return rows[0].id_kategori;
  }

  const namaKategori = jenis === 'Pemasukan' ? 'Umum Pemasukan' : 'Umum Pengeluaran';
  const [result] = await db.query('INSERT INTO kategori (nama_kategori, jenis) VALUES (?, ?)', [namaKategori, jenisDb]);
  return result.insertId;
}

// AUTENTIKASI - Anggota 2
exports.register = async (req, res) => {
  const { nama, email, password, confirmPassword } = req.body;
  
  // Validasi data pengguna
  if (!nama || !email || !password) {
    return res.status(400).json({ error: 'Semua field harus diisi' });
  }
  
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Password tidak sesuai' });
  }
  
  try {
    // Cek email sudah terdaftar
    const [existingUser] = await db.query('SELECT id_user FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Simpan user ke database
    await db.query('INSERT INTO users (nama, email, password) VALUES (?, ?, ?)', 
      [nama, email, hashedPassword]);
    
    res.status(201).json({ message: 'Registrasi berhasil. Silakan login.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password harus diisi' });
  }
  
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }
    
    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }
    
  // Set session
req.session.user = {
  id: user.id_user,
  nama: user.nama,
  email: user.email
};

req.session.userId = user.id_user;
req.session.nama = user.nama;
req.session.email = user.email;
    
    res.json({ 
      message: 'Login berhasil',
      user: { id: user.id_user, nama: user.nama, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Gagal logout' });
    }
    res.json({ message: 'Logout berhasil' });
  });
};

exports.getCurrentUser = (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Tidak ada user yang login' });
  }
  res.json({
    id: req.session.userId,
    nama: req.session.nama,
    email: req.session.email
  });
};

// CRUD TRANSAKSI - Anggota 3 (dengan user_id)
exports.daftarTransaksi = async (req, res) => {
  const userId = req.session.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Harus login terlebih dahulu' });
  }
  
  try {
    const [barisData] = await db.query(
      `SELECT t.id_transaksi AS id, t.tanggal, t.jumlah, t.keterangan, k.jenis, k.nama_kategori AS kategori
       FROM transaksi t
       LEFT JOIN kategori k ON t.id_kategori = k.id_kategori
       WHERE t.id_user = ?
       ORDER BY t.tanggal DESC`,
      [userId]
    );
    res.json(barisData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

exports.tambahTransaksi = async (req, res) => {
  const { jenis, tanggal, jumlah, keterangan } = req.body;
  const userId = req.session.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Harus login terlebih dahulu' });
  }
  
  // Validasi transaksi
  if (!jenis || !tanggal || !jumlah) {
    return res.status(400).json({ error: 'Jenis, tanggal, dan jumlah harus diisi' });
  }
  
  if (jumlah <= 0) {
    return res.status(400).json({ error: 'Jumlah harus lebih dari 0' });
  }
  
  try {
    const idKategori = await getKategoriIdByJenis(jenis);
    await db.query(
      'INSERT INTO transaksi (id_user, id_kategori, jumlah, tanggal, keterangan) VALUES (?, ?, ?, ?, ?)', 
      [userId, idKategori, jumlah, tanggal, keterangan]
    );
    res.status(201).json({ message: 'Transaksi berhasil ditambahkan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

exports.editTransaksi = async (req, res) => {
  const { id } = req.params;
  const { jenis, tanggal, jumlah, keterangan } = req.body;
  const userId = req.session.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Harus login terlebih dahulu' });
  }
  
  // Validasi transaksi
  if (!jenis || !tanggal || !jumlah) {
    return res.status(400).json({ error: 'Jenis, tanggal, dan jumlah harus diisi' });
  }
  
  if (jumlah <= 0) {
    return res.status(400).json({ error: 'Jumlah harus lebih dari 0' });
  }
  
  try {
    // Cek apakah transaksi milik user
    const [transaksi] = await db.query(
      'SELECT id_transaksi AS id FROM transaksi WHERE id_transaksi = ? AND id_user = ?', 
      [id, userId]
    );
    
    if (transaksi.length === 0) {
      return res.status(403).json({ error: 'Transaksi tidak ditemukan' });
    }
    
    const idKategori = await getKategoriIdByJenis(jenis);
    await db.query(
      'UPDATE transaksi SET id_kategori = ?, tanggal = ?, jumlah = ?, keterangan = ? WHERE id_transaksi = ?',
      [idKategori, tanggal, jumlah, keterangan, id]
    );
    
    res.json({ message: 'Transaksi berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

exports.hapusTransaksi = async (req, res) => {
  const { id } = req.params;
  const userId = req.session.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Harus login terlebih dahulu' });
  }
  
  try {
    // Cek apakah transaksi milik user
    const [transaksi] = await db.query(
      'SELECT id_transaksi AS id FROM transaksi WHERE id_transaksi = ? AND id_user = ?', 
      [id, userId]
    );
    
    if (transaksi.length === 0) {
      return res.status(403).json({ error: 'Transaksi tidak ditemukan' });
    }
    
    await db.query('DELETE FROM transaksi WHERE id_transaksi = ?', [id]);
    res.json({ message: 'Transaksi berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

// DASHBOARD & LAPORAN - Anggota 4
exports.getFinancialSummary = async (req, res) => {
  const userId = req.session.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Harus login terlebih dahulu' });
  }
  
  try {
    const [summary] = await db.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN jenis = 'Pemasukan' THEN jumlah ELSE 0 END), 0) as totalIncome,
        COALESCE(SUM(CASE WHEN jenis = 'Pengeluaran' THEN jumlah ELSE 0 END), 0) as totalExpense
      FROM transaksi t
      LEFT JOIN kategori k ON t.id_kategori = k.id_kategori
      WHERE t.id_user = ?
    `, [userId]);
    
    const totalIncome = parseFloat(summary[0].totalIncome);
    const totalExpense = parseFloat(summary[0].totalExpense);
    const balance = totalIncome - totalExpense;
    
    res.json({
      totalIncome,
      totalExpense,
      balance
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

exports.getMonthlyReport = async (req, res) => {
  const userId = req.session.userId;
  const { year, month } = req.query;
  
  if (!userId) {
    return res.status(401).json({ error: 'Harus login terlebih dahulu' });
  }
  
  try {
    let query = `
      SELECT 
        DATE_FORMAT(tanggal, '%Y-%m') as bulan,
        COALESCE(SUM(CASE WHEN jenis = 'Pemasukan' THEN jumlah ELSE 0 END), 0) as totalIncome,
        COALESCE(SUM(CASE WHEN jenis = 'Pengeluaran' THEN jumlah ELSE 0 END), 0) as totalExpense
      FROM transaksi t
      LEFT JOIN kategori k ON t.id_kategori = k.id_kategori
      WHERE t.id_user = ?
    `;
    
    const params = [userId];
    
    if (year) {
  query += ` AND YEAR(tanggal) = ?`;
  params.push(year);
}

if (month) {
  query += ` AND MONTH(tanggal) = ?`;
  params.push(month);
}
    
    query += ` GROUP BY DATE_FORMAT(tanggal, '%Y-%m') ORDER BY bulan DESC`;
    
    const [report] = await db.query(query, params);
    
    res.json(report.map(row => ({
      bulan: row.bulan,
      totalIncome: parseFloat(row.totalIncome),
      totalExpense: parseFloat(row.totalExpense),
      balance: parseFloat(row.totalIncome) - parseFloat(row.totalExpense)
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

exports.getChartData = async (req, res) => {
  const userId = req.session.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Harus login terlebih dahulu' });
  }
  
  try {
    const [data] = await db.query(`
      SELECT 
        DATE_FORMAT(tanggal, '%Y-%m') as bulan,
        COALESCE(SUM(CASE WHEN jenis = 'Pemasukan' THEN jumlah ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN jenis = 'Pengeluaran' THEN jumlah ELSE 0 END), 0) as expense
      FROM transaksi t
      LEFT JOIN kategori k ON t.id_kategori = k.id_kategori
      WHERE t.id_user = ?
      GROUP BY DATE_FORMAT(t.tanggal, '%Y-%m')
      ORDER BY bulan DESC
      LIMIT 12
    `, [userId]);
    
    res.json(data.map(row => ({
      bulan: row.bulan,
      income: parseFloat(row.income),
      expense: parseFloat(row.expense)
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};
