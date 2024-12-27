// URL dari Google Apps Script yang sudah di-deploy
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyZZ7qkTQKLgzKs6smd5zxqSOQHBrOw91UZar69gsrR6JbkIX03BAeiZtioNW5iUiJf/exec"; // Ganti dengan URL deploy Anda

let table;

// Format currency function
function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Initialize DataTable
function initializeDataTable() {
  table = $("#memberTable").DataTable({
    columns: [
      { data: "nama" },
      { data: "id" },
      {
        data: "simpananPokok",
        render: function (data) {
          return formatCurrency(data || 0);
        },
      },
      {
        data: "simpananWajib",
        render: function (data) {
          return formatCurrency(data || 0);
        },
      },
      {
        data: "pinjaman",
        render: function (data) {
          return formatCurrency(data || 0);
        },
      },
      {
        data: "tagihan",
        render: function (data) {
          return formatCurrency(data || 0);
        },
      },
      {
        data: "status",
        render: function (data) {
          let badgeClass = "";
          switch (data.toLowerCase()) {
            case "aktif":
              badgeClass = "bg-success";
              break;
            case "non aktif":
              badgeClass = "bg-danger";
              break;
            case "blocked":
              badgeClass = "bg-secondary";
              break;
            default:
              badgeClass = "bg-info";
          }
          return `<span class="badge ${badgeClass}">${data}</span>`;
        },
      },
    ],
    language: {
      search: "Cari:",
      lengthMenu: "Tampilkan _MENU_ data",
      zeroRecords: "Data tidak ditemukan",
      info: "Menampilkan _START_ hingga _END_ dari _TOTAL_ data",
      infoEmpty: "Tidak ada data yang ditampilkan",
      infoFiltered: "(difilter dari _MAX_ total data)",
      paginate: {
        first: "Pertama",
        last: "Terakhir",
        next: "Selanjutnya",
        previous: "Sebelumnya",
      },
    },
  });
}

// Update dashboard data
function updateDashboard(data) {
  // Update cards
  document.getElementById("simpananPokok").textContent = formatCurrency(
    data.simpananPokok
  );
  document.getElementById("simpananWajib").textContent = formatCurrency(
    data.simpananWajib
  );
  document.getElementById("totalPinjaman").textContent = formatCurrency(
    data.totalPinjaman
  );
  document.getElementById("totalSimpanan").textContent = formatCurrency(
    data.totalSimpanan
  );
  document.getElementById("salesAdmin").textContent = formatCurrency(
    data.salesAdmin
  );
  document.getElementById("totalAnggota").textContent = data.totalAnggota;

  // Update table data
  if (data.members) {
    if (!table) {
      initializeDataTable();
    }
    table.clear().rows.add(data.members).draw();
  }
}

// Fetch data from Google Apps Script
async function fetchData() {
  try {
    const response = await fetch(SCRIPT_URL);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    updateDashboard(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("Gagal memuat data. Silakan coba lagi nanti.");
  }
}

// Export functions
function exportToExcel() {
  if (!table) return;

  const data = table.data().toArray();
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data Anggota");
  XLSX.writeFile(wb, "data_anggota.xlsx");
}

function exportToPDF() {
  if (!table) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.autoTable({
    head: [
      [
        "Nama Anggota",
        "ID",
        "Simpanan Pokok",
        "Simpanan Wajib",
        "Pinjaman",
        "Tagihan",
        "Status",
      ],
    ],
    body: table
      .data()
      .toArray()
      .map((row) => [
        row.nama,
        row.id,
        formatCurrency(row.simpananPokok),
        formatCurrency(row.simpananWajib),
        formatCurrency(row.pinjaman),
        formatCurrency(row.tagihan),
        row.status,
      ]),
  });
  doc.save("data_anggota.pdf");
}

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  // Initialize data
  fetchData();

  // Add export button event listeners
  document
    .getElementById("exportExcel")
    .addEventListener("click", exportToExcel);
  document.getElementById("exportPDF").addEventListener("click", exportToPDF);

  // Add logout button event listener
  document.getElementById("logoutBtn").addEventListener("click", function (e) {
    e.preventDefault();
    if (confirm("Yakin ingin logout?")) {
      window.location.href = "login.html";
    }
  });

  // Refresh data every 5 minutes
  setInterval(fetchData, 300000);
});

// Event listener untuk tombol About
document.addEventListener("DOMContentLoaded", function () {
  // Menambahkan event listener ke link About
  document
    .querySelector('a[href="#about"]')
    .addEventListener("click", function (e) {
      e.preventDefault();
      const aboutModal = new bootstrap.Modal(
        document.getElementById("aboutModal")
      );
      aboutModal.show();
    });
});
