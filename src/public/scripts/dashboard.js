// Dashboard JS - Anggota 4
let chart = null;

async function loadDashboard() {
  // Check authentication
  const authResponse = await fetch('/api/auth/user');
  if (!authResponse.ok) {
    window.location.href = 'login.html';
    return;
  }
  
  const user = await authResponse.json();
  document.getElementById('user-name').textContent = user.nama;
  
  // Load financial summary
  try {
    const summaryResponse = await fetch('/api/dashboard/summary');
    const summary = await summaryResponse.json();
    
    document.getElementById('total-income').textContent = 'Rp ' + summary.totalIncome.toLocaleString('id-ID');
    document.getElementById('total-expense').textContent = 'Rp ' + summary.totalExpense.toLocaleString('id-ID');
    document.getElementById('balance').textContent = 'Rp ' + summary.balance.toLocaleString('id-ID');
    
    // Update balance color
    const balanceEl = document.getElementById('balance');
    if (summary.balance < 0) {
      balanceEl.parentElement.classList.add('negative');
    }
  } catch (error) {
    console.error('Error loading summary:', error);
  }
  
  // Load chart data
  try {
    const chartResponse = await fetch('/api/dashboard/chart');
    const chartData = await chartResponse.json();
    
    const labels = chartData.map(d => d.bulan);
    const incomeData = chartData.map(d => d.income);
    const expenseData = chartData.map(d => d.expense);
    
    const ctx = document.getElementById('chart').getContext('2d');
    
    if (chart) {
      chart.destroy();
    }

    console.log("chartData:", chartData);
    
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Pemasukan',
            data: incomeData,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.1
          },
          {
            label: 'Pengeluaran',
            data: expenseData,
            borderColor: '#FF6B6B',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          }
        }
      }
    });
  } catch (error) {
    console.error('Error loading chart:', error);
  }
  
  // Load recent transactions
  try {
    const transaksiResponse = await fetch('/api/transaksi');
    const transaksi = await transaksiResponse.json();
    
    const tbody = document.querySelector('#recent-table tbody');
    tbody.innerHTML = '';
    
    transaksi.slice(0, 5).forEach(t => {
      const row = tbody.insertRow();
      const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      const tanggal = new Date(t.tanggal).toLocaleDateString('id-ID', dateOptions);
      
      row.insertCell(0).textContent = tanggal;
      row.insertCell(1).textContent = t.keterangan;
      row.insertCell(2).textContent = t.jenis === 'Pemasukan' ? 'Pemasukan' : 'Pengeluaran';
      row.insertCell(3).textContent = 'Rp ' + parseFloat(t.jumlah).toLocaleString('id-ID');
    });
  } catch (error) {
    console.error('Error loading transactions:', error);
  }
}


// Load dashboard on page load
document.addEventListener('DOMContentLoaded', loadDashboard);
