const db = require("./db");
const bcrypt = require('bcrypt');

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
  console.log("DATA TRANSAKSI:", req.body);

  const { jenis, tanggal, jumlah, keterangan } = req.body;
  const userId = req.session.userId;

  console.log("USER ID:", userId);

  if (!userId) {
    return res.status(401).json({
      error: 'Harus login terlebih dahulu'
    });
  }

  if (!jenis || !tanggal || !jumlah) {
    return res.status(400).json({
      error: 'Jenis, tanggal, dan jumlah harus diisi'
    });
  }

  if (jumlah <= 0) {
    return res.status(400).json({
      error: 'Jumlah harus lebih dari 0'
    });
  }

  try {
    // mencari kategori berdasarkan jenis
    let [kategori] = await db.query(
      'SELECT id_kategori FROM kategori WHERE jenis = ? LIMIT 1',
      [jenis]
    );
    let idKategori;
    if(kategori.length > 0){
      idKategori = kategori[0].id_kategori;

    }else{

      // jika kategori belum ada, buat otomatis

      const namaKategori =
        jenis === "Pemasukan"
        ? "Umum Pemasukan"
        : "Umum Pengeluaran";

      const [hasil] = await db.query(
        'INSERT INTO kategori (nama_kategori, jenis) VALUES (?,?)',
        [
          namaKategori,
          jenis
        ]
      );

      idKategori = hasil.insertId;
    }

    await db.query(
      `INSERT INTO transaksi 
      (id_user, id_kategori, jumlah, tanggal, keterangan)
      VALUES (?,?,?,?,?)`,
      [
        userId,
        idKategori,
        jumlah,
        tanggal,
        keterangan
      ]
    );

    res.status(201).json({
      message:"Transaksi berhasil ditambahkan"
    });

  } catch(err){
    console.error("ERROR TRANSAKSI:",err);
    res.status(500).json({
      error:err.message
    });

  }

};

exports.editTransaksi = async (req, res) => {
  const { id } = req.params;
  const { jenis, tanggal, jumlah, keterangan } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({
      error: "Harus login terlebih dahulu"
    });
  }

  if (!jenis || !tanggal || !jumlah) {
    return res.status(400).json({
      error: "Jenis, tanggal, dan jumlah harus diisi"
    });
  }

  try {

    // cari kategori berdasarkan jenis
    const [kategori] = await db.query(
      "SELECT id_kategori FROM kategori WHERE jenis = ? LIMIT 1",
      [jenis]
    );

    if(kategori.length === 0){
      return res.status(400).json({
        error:"Kategori tidak ditemukan"
      });
    }

    const idKategori = kategori[0].id_kategori;
    await db.query(
      `UPDATE transaksi 
       SET id_kategori=?, tanggal=?, jumlah=?, keterangan=?
       WHERE id_transaksi=? AND id_user=?`,
       [
        idKategori,
        tanggal,
        jumlah,
        keterangan,
        id,
        userId
       ]
    );

    res.json({
      message:"Transaksi berhasil diperbarui"
    });

  } catch(err){

    console.log(err);
    res.status(500).json({
      error:"Kesalahan server internal"
    });
  }

};

exports.hapusTransaksi = async (req, res) => {
  const { id } = req.params;
  const userId = req.session.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Harus login terlebih dahulu' });
  }
  
  try {
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
        COUNT(*) AS transactionCount,
        COALESCE(SUM(CASE WHEN jenis = 'Pemasukan' THEN 1 ELSE 0 END), 0) as incomeCount,
        COALESCE(SUM(CASE WHEN jenis = 'Pengeluaran' THEN 1 ELSE 0 END), 0) as expenseCount,
        COALESCE(SUM(CASE WHEN jenis = 'Pemasukan' THEN jumlah ELSE 0 END), 0) as totalIncome,
        COALESCE(SUM(CASE WHEN jenis = 'Pengeluaran' THEN jumlah ELSE 0 END), 0) as totalExpense
      FROM transaksi t
      LEFT JOIN kategori k ON t.id_kategori = k.id_kategori
      WHERE t.id_user = ?
    `, [userId]);
    
    const totalIncome = Number.parseFloat(summary[0].totalIncome) || 0;
    const totalExpense = Number.parseFloat(summary[0].totalExpense) || 0;
    const balance = totalIncome - totalExpense;
    const transactionCount = Number.parseInt(summary[0].transactionCount, 10) || 0;
    const incomeCount = Number.parseInt(summary[0].incomeCount, 10) || 0;
    const expenseCount = Number.parseInt(summary[0].expenseCount, 10) || 0;
    
    const totalActivity = totalIncome + totalExpense;
    const incomeRatio = totalActivity > 0 ? Math.round((totalIncome / totalActivity) * 100) : 0;
    const expenseRatio = totalActivity > 0 ? Math.round((totalExpense / totalActivity) * 100) : 0;
    const balanceRatio = totalActivity > 0 ? Math.max(0, Math.min(100, Math.round((balance / totalActivity) * 100))) : 0;

    res.json({
      totalIncome,
      totalExpense,
      balance,
      transactionCount,
      incomeCount,
      expenseCount,
      incomeRatio,
      expenseRatio,
      balanceRatio
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

// ==========================================
// CRUD KATEGORI (Dibutuhkan untuk Form Transaksi)
// ==========================================

exports.daftarKategori = async (req, res) => {
  try {
    const [kategori] = await db.query('SELECT * FROM kategori ORDER BY jenis, nama_kategori');
    res.json(kategori);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

exports.tambahKategori = async (req, res) => {
  const { nama_kategori, jenis } = req.body;
  if (!nama_kategori || !jenis) {
    return res.status(400).json({ error: 'Nama kategori dan jenis harus diisi' });
  }
  try {
    await db.query('INSERT INTO kategori (nama_kategori, jenis) VALUES (?, ?)', [nama_kategori, jenis]);
    res.status(201).json({ message: 'Kategori berhasil ditambahkan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

exports.editKategori = async (req, res) => {
  const { id } = req.params;
  const { nama_kategori, jenis } = req.body;
  if (!nama_kategori || !jenis) {
    return res.status(400).json({ error: 'Nama kategori dan jenis harus diisi' });
  }
  try {
    await db.query('UPDATE kategori SET nama_kategori = ?, jenis = ? WHERE id_kategori = ?', [nama_kategori, jenis, id]);
    res.json({ message: 'Kategori berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

exports.hapusKategori = async (req, res) => {
  const { id } = req.params;
  try {
    const [transaksiTerkait] = await db.query('SELECT id_transaksi FROM transaksi WHERE id_kategori = ? LIMIT 1', [id]);
    if (transaksiTerkait.length > 0) {
      return res.status(400).json({ error: 'Gagal menghapus: Kategori sedang dipakai di transaksi.' });
    }
    await db.query('DELETE FROM kategori WHERE id_kategori = ?', [id]);
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};