const STORAGE_KEY = 'saringdulu_laporan_simulasi_v1';

const indikatorRisiko = [
  { kata: 'kuota gratis', bobot: 3, alasan: 'Iming-iming kuota gratis sering dipakai untuk menjebak korban phishing.' },
  { kata: 'hadiah', bobot: 2, alasan: 'Tawaran hadiah tak terduga perlu dipastikan keasliannya.' },
  { kata: 'klik segera', bobot: 2, alasan: 'Mendesak tindakan cepat agar penerima tidak sempat berpikir kritis.' },
  { kata: 'sebelum hangus', bobot: 2, alasan: 'Pola manipulasi tenggat waktu palsu.' },
  { kata: 'sebarkan ke', bobot: 3, alasan: 'Ciri khas pesan berantai yang menyebar tanpa verifikasi sumber.' },
  { kata: 'selamat anda terpilih', bobot: 3, alasan: 'Kalimat umum pada pesan penipuan undian palsu.' },
  { kata: 'pin', bobot: 3, alasan: 'Permintaan PIN melalui pesan berisiko tinggi terhadap pencurian akun.' },
  { kata: 'otp', bobot: 4, alasan: 'Kode OTP bersifat rahasia dan tidak boleh diberikan kepada siapa pun.' },
  { kata: '.xyz', bobot: 2, alasan: 'Domain alternatif yang sering muncul pada situs tiruan.' },
  { kata: 'bit.ly', bobot: 1, alasan: 'Tautan pendek menyembunyikan alamat tujuan asli.' },
  { kata: 'http://', bobot: 2, alasan: 'Alamat web belum menggunakan enkripsi HTTPS.' }
];

const dataSimulasiAwal = [
  {
    pelapor: 'Siswa_Simulasi_01',
    kategori: 'Tautan Phishing / Penipuan',
    ringkasan: 'Tautan klaim bantuan kuota palsu di grup pesan instan.',
    waktu: 'Simulasi Awal'
  },
  {
    pelapor: 'Pengurus_Literasi_Sim',
    kategori: 'Hoaks Informasi Sekolah / Publik',
    ringkasan: 'Kabar perubahan jadwal kegiatan yang belum diumumkan secara resmi.',
    waktu: 'Simulasi Awal'
  }
];

// Elemen DOM
const btnMenu = document.getElementById('btnMenu');
const navLinks = document.getElementById('navLinks');
const pesanInput = document.getElementById('pesanInput');
const hasilAnalisis = document.getElementById('hasilAnalisis');
const btnAnalisis = document.getElementById('btnAnalisis');
const btnContohPhishing = document.getElementById('btnContohPhishing');
const btnContohAman = document.getElementById('btnContohAman');
const btnReset = document.getElementById('btnReset');
const formLapor = document.getElementById('formLapor');
const tabelLaporan = document.getElementById('tabelLaporan');
const btnUnduhJSON = document.getElementById('btnUnduhJSON');
const btnResetLaporan = document.getElementById('btnResetLaporan');

// Toggle menu di layar kecil
btnMenu.addEventListener('click', () => {
  const terbuka = navLinks.classList.toggle('active');
  btnMenu.setAttribute('aria-expanded', String(terbuka));
});

// Tutup menu saat tautan diklik di ponsel
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    btnMenu.setAttribute('aria-expanded', 'false');
  });
});

// Isi contoh simulasi
btnContohPhishing.addEventListener('click', () => {
  pesanInput.value =
    'INFO PENTING!! Sebarkan ke 5 grup sekarang! Anda terpilih menerima kuota gratis 50GB, klik segera http://klaim-kuota-gratis.xyz dan masukkan kode OTP sebelum hangus!';
});

btnContohAman.addEventListener('click', () => {
  pesanInput.value =
    'Pengumuman kegiatan literasi membaca bersama akan dilaksanakan hari Jumat pukul 08.00 WIB di perpustakaan sekolah sesuai jadwal resmi.';
});

btnReset.addEventListener('click', () => {
  pesanInput.value = '';
  hasilAnalisis.style.display = 'none';
  hasilAnalisis.innerHTML = '';
});

// Analisis risiko pesan
btnAnalisis.addEventListener('click', () => {
  const teks = pesanInput.value.trim();

  if (!teks) {
    hasilAnalisis.style.display = 'block';
    hasilAnalisis.className = 'result-box risk-med';
    hasilAnalisis.innerHTML = '<strong>Perhatian:</strong> Masukkan teks pesan atau tautan terlebih dahulu sebelum diperiksa.';
    return;
  }

  const teksKecil = teks.toLowerCase();
  let skor = 0;
  const daftarTemuan = [];

  indikatorRisiko.forEach((item) => {
    if (teksKecil.includes(item.kata)) {
      skor += item.bobot;
      daftarTemuan.push(`<li><strong>"${escapeHTML(item.kata)}"</strong>: ${escapeHTML(item.alasan)}</li>`);
    }
  });

  hasilAnalisis.style.display = 'block';
  hasilAnalisis.className = 'result-box';

  if (skor >= 5) {
    hasilAnalisis.classList.add('risk-high');
    hasilAnalisis.innerHTML = `
      <strong>Status: RISIKO TINGGI (Skor: ${skor})</strong>
      <p>Pesan memiliki banyak indikator hoaks atau phishing. Hindari mengeklik tautan dan jangan meneruskan pesan.</p>
      <ul>${daftarTemuan.join('')}</ul>
    `;
  } else if (skor >= 2) {
    hasilAnalisis.classList.add('risk-med');
    hasilAnalisis.innerHTML = `
      <strong>Status: PERLU WASPADA (Skor: ${skor})</strong>
      <p>Ditemukan pola yang patut dicermati. Verifikasi kebenarannya melalui sumber resmi terlebih dahulu.</p>
      <ul>${daftarTemuan.join('')}</ul>
    `;
  } else {
    hasilAnalisis.classList.add('risk-low');
    hasilAnalisis.innerHTML = `
      <strong>Status: RISIKO RENDAH PADA POLA UMUM (Skor: ${skor})</strong>
      <p>Tidak ditemukan kata kunci penipuan umum dalam daftar aturan, namun tetap biasakan cek sumber sebelum membagikan informasi.</p>
    `;
  }
});

// Sanitasi karakter HTML agar aman dari injeksi skrip
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

function ambilDataLaporan() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...dataSimulasiAwal];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...dataSimulasiAwal];
  } catch {
    return [...dataSimulasiAwal];
  }
}

function simpanDataLaporan(daftar) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(daftar));
}

function renderTabelLaporan() {
  const daftar = ambilDataLaporan();
  tabelLaporan.innerHTML = daftar
    .map(
      (item) => `
      <tr>
        <td>${escapeHTML(item.pelapor)}</td>
        <td><span class="badge">${escapeHTML(item.kategori)}</span></td>
        <td>${escapeHTML(item.ringkasan)}</td>
        <td>${escapeHTML(item.waktu || 'Simulasi')}</td>
      </tr>
    `
    )
    .join('');
}

formLapor.addEventListener('submit', (e) => {
  e.preventDefault();

  const pelapor = document.getElementById('namaPelapor').value.trim();
  const kategori = document.getElementById('kategori').value;
  const ringkasan = document.getElementById('ringkasan').value.trim();

  if (!pelapor || !ringkasan) return;

  const waktuLabel = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const daftar = ambilDataLaporan();
  daftar.unshift({
    pelapor,
    kategori,
    ringkasan,
    waktu: `Simulasi (${waktuLabel})`
  });

  simpanDataLaporan(daftar);
  formLapor.reset();
  renderTabelLaporan();
});

btnUnduhJSON.addEventListener('click', () => {
  const daftar = ambilDataLaporan();
  const blob = new Blob([JSON.stringify(daftar, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const tautan = document.createElement('a');
  tautan.href = url;
  tautan.download = 'data-simulasi-saringdulu.json';
  tautan.click();
  URL.revokeObjectURL(url);
});

btnResetLaporan.addEventListener('click', () => {
  simpanDataLaporan([...dataSimulasiAwal]);
  renderTabelLaporan();
});

// Tampilkan data saat halaman dimuat
renderTabelLaporan();
