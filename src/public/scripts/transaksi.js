// Transaksi JS - Anggota 3
let daftarTransaksi = [];
let editingId = null;
const formTransaksi = document.getElementById('form-transaksi');
const inputJenis = document.getElementById('jenis');
const inputKeterangan = document.getElementById('keterangan');
const inputJumlah = document.getElementById('jumlah');
const inputTanggal = document.getElementById('tanggal');
const tabelBody = document.querySelector('#tabel-transaksi tbody');
const inputCari = document.getElementById('cari');
const btnCari = document.getElementById('btn-cari');
const formTitle = document.getElementById('form-title');
const resetBtn = document.getElementById('reset-btn');
const formMessage = document.getElementById('form-message');

const opsiTanggal = { year: 'numeric', month: 'long', day: 'numeric' };

function ubahTanggal(tanggal) {
  return new Date(tanggal).toLocaleDateString('id-ID', opsiTanggal);
}

async function loadTransaksi() {
  // Check authentication
  const authResponse = await fetch('/api/auth/user');
  if (!authResponse.ok) {
    window.location.href = 'login.html';
    return;
  }
  
  const user = await authResponse.json();
  document.getElementById('user-name').textContent = user.nama;
  
  try {
    const response = await fetch('/api/transaksi');
    if (response.ok) {
      daftarTransaksi = await response.json();
      updateTabel(daftarTransaksi);
    }
  } catch (error) {
    console.error('Error:', error);
    showMessage('Gagal memuat transaksi', 'error');
  }
}

function updateTabel(transaksi) {
  tabelBody.innerHTML = '';
  transaksi.forEach((t, index) => {
    const row = tabelBody.insertRow();
    row.insertCell(0).textContent = index + 1;
    row.insertCell(1).textContent = ubahTanggal(t.tanggal);
    row.insertCell(2).textContent = t.keterangan;
    row.insertCell(3).textContent = t.jenis === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran';
    row.insertCell(4).textContent = 'Rp ' + parseFloat(t.jumlah).toLocaleString('id-ID');
    
    const aksiCell = row.insertCell(5);
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-edit';
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => editTransaksi(t.id);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-delete';
    deleteBtn.textContent = 'Hapus';
    deleteBtn.onclick = () => deleteTransaksi(t.id);
    
    aksiCell.appendChild(editBtn);
    aksiCell.appendChild(deleteBtn);
  });
}

function editTransaksi(id) {
  const transaksi = daftarTransaksi.find(t => t.id === id);
  if (transaksi) {
    editingId = id;
    formTitle.textContent = 'Edit Transaksi';
    inputJenis.value = transaksi.jenis;
    inputKeterangan.value = transaksi.keterangan;
    inputJumlah.value = transaksi.jumlah;
    inputTanggal.value = transaksi.tanggal;
    window.scrollTo(0, 0);
  }
}

async function deleteTransaksi(id) {
  if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
    try {
      const response = await fetch(`/api/transaksi/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showMessage('Transaksi berhasil dihapus', 'success');
        loadTransaksi();
      } else {
        const data = await response.json();
        showMessage(data.error || 'Gagal menghapus transaksi', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('Gagal menghapus transaksi', 'error');
    }
  }
}

function showMessage(message, type) {
  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`;
  formMessage.style.display = 'block';
  
  setTimeout(() => {
    formMessage.style.display = 'none';
  }, 3000);
}

// Form Submit Handler
formTransaksi.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const jenis = inputJenis.value;
  const keterangan = inputKeterangan.value.trim();
  const jumlah = parseFloat(inputJumlah.value);
  const tanggal = inputTanggal.value;
  
  if (!jenis || !keterangan || !jumlah || !tanggal) {
    showMessage('Semua field harus diisi', 'error');
    return;
  }
  
  try {
    const url = editingId ? `/api/transaksi/${editingId}` : '/api/transaksi';
    const method = editingId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jenis, keterangan, jumlah, tanggal })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      const successMsg = editingId ? 'Transaksi berhasil diperbarui' : 'Transaksi berhasil ditambahkan';
      showMessage(successMsg, 'success');
      formTransaksi.reset();
      formTitle.textContent = 'Tambah Transaksi';
      editingId = null;
      loadTransaksi();
    } else {
      showMessage(data.error || 'Gagal menyimpan transaksi', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showMessage('Gagal menyimpan transaksi', 'error');
  }
});

// Reset Button Handler
resetBtn.addEventListener('click', () => {
  formTransaksi.reset();
  formTitle.textContent = 'Tambah Transaksi';
  editingId = null;
});

function filterTransaksi(keyword) {
  const filtered = daftarTransaksi.filter(t => {
    const gabungan = (t.jenis + ' ' + t.keterangan + ' ' + ubahTanggal(t.tanggal)).toLowerCase();
    return gabungan.includes(keyword);
  });
  updateTabel(filtered);
}

// Search Handler
inputCari.addEventListener('input', (e) => {
  filterTransaksi(e.target.value.trim().toLowerCase());
});

if (btnCari) {
  btnCari.addEventListener('click', () => {
    filterTransaksi(inputCari.value.trim().toLowerCase());
  });
}

// Load on page load
document.addEventListener('DOMContentLoaded', loadTransaksi);
