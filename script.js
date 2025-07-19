const imagePaths = [
    'images/kampus1.jpg',
    'images/kampus2.jpg',
    'images/kampus3.jpg',
    'images/kampus4.jpg',
  ];
  
  let currentIndex = 0;
  const slides = document.querySelectorAll('.slider-img');
  
  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.remove('active');
    });
  
    currentIndex = (index + slides.length) % slides.length;
    slides[currentIndex].classList.add('active');
  }
  
  function nextSlide() {
    showSlide(currentIndex + 1);
  }
  
  function prevSlide() {
    showSlide(currentIndex - 1);
  }
  
  // Optional: auto-slide tiap 5 detik
  setInterval(() => {
    nextSlide();
  }, 5000);

const targets = document.querySelectorAll('.program-section, .dosen-card, .lokasi-section');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // Stop setelah animasi jalan
    }
  });
}, {
  threshold: 0.1
});

// Pasang observer ke setiap elemen
targets.forEach(target => observer.observe(target));


  

function toggleLoginForm() {
  const loginForm = document.getElementById('loginForm');
  loginForm.style.display = loginForm.style.display === 'block' ? 'none' : 'block';
  renderLoginDropdown();
}

function renderLoginDropdown() {
  const loginForm = document.getElementById('loginForm');
  const isLoggedIn = localStorage.getItem('adminLoggedIn');

  if (isLoggedIn) {
    loginForm.innerHTML = `
      <button onclick="goToAdmin()">Admin Panel</button>
      <button onclick="logout()">Logout</button>
    `;
  } else {
    loginForm.innerHTML = `
      <form onsubmit="return login(event)">
        <label for="username">Nama:</label>
        <input type="text" id="username" name="username" required>
        
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required>
        
        <button type="submit">Login</button>
      </form>
    `;
  }
}

async function login(event) {
  event.preventDefault();
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value.trim();

  const { data, error } = await sb
    .from('admins')
    .select('*')
    .ilike('username', user)
    .limit(1);

  if (error || !data || data.length === 0) {
    alert('Username tidak ditemukan!');
    return;
  }

  const admin = data[0];
  console.log("Admin record:", admin);

  if (admin.password === pass) {
    localStorage.setItem('adminLoggedIn', 'true');
    alert('Login berhasil!');
    renderLoginDropdown();
  } else {
    alert('Password salah!');
  }
}


function logout() {
  localStorage.removeItem('adminLoggedIn');
  alert('Logout berhasil!');
  renderLoginDropdown();
  window.location.href = 'index.html';
}

function goToAdmin() {
  window.location.href = 'admin-panel.html';
}

// Saat pertama kali halaman load
window.addEventListener('DOMContentLoaded', renderLoginDropdown);

// Dosen Section Tampil Di Halaman Utama
async function loadDosenSection() {
  const { data, error } = await sb.from('dosen').select('*').order('created_at', { ascending: false });
  const container = document.getElementById('dosenSection');
  data.forEach(d => {
    container.innerHTML += `
      <div class="dosen-card visible">
        <div class="dosen-photo"><img src="${d.foto_url}" alt="Foto ${d.nama}"></div>
        <div class="dosen-info">
          <h2>${d.nama}</h2>
          <p><span>Gelar & Jabatan:</span> ${d.jabatan}</p>
          <p><span>Program Studi / Fakultas:</span> ${d.prodi}</p>
        </div>
      </div>`;
  });
}

async function loadKegiatan() {
  const { data, error } = await sb.from('kegiatan').select('*').order('tanggal', { ascending: false });
  const cont = document.getElementById('frontendKegiatan');
  if (!cont || error) return;

  cont.innerHTML = data.map(k => `
    <div class="kegiatan-card" style="background-image: url('${k.foto_url}')" onclick="showDetailKegiatan('${k.id}')">
      <div class="kegiatan-label">${k.tanggal}</div>
      <div class="kegiatan-overlay">
        <div class="kegiatan-text">${k.judul}</div>
        <div class="kegiatan-arrow">›</div>
      </div>
    </div>
  `).join('');
}


async function loadDetailKegiatan(id) {
  const { data, error } = await sb.from('kegiatan')
    .select('*')
    .eq('id', id)
    .single();
  console.log({ data, error });
  if (error || !data) {
    return document.querySelector('.detail-container').innerHTML = "<p>Gagal memuat detail kegiatan.</p>";
  }

  document.getElementById('detailJudul').textContent = data.judul;
  document.getElementById('detailTanggal').textContent = new Date(data.tanggal).toLocaleDateString('id-ID', {
    day:'numeric', month:'long', year:'numeric'
  });
  const img = document.getElementById('detailFoto');
  img.src = data.foto_url;
  img.alt = data.judul;
  document.getElementById('detailIsi').innerHTML = data.isi.replace(/\n/g, '<br>');
}


function showDetailKegiatan(id) {
  window.location.href = `detail-kegiatan.html?id=${id}`;
}

document.addEventListener('DOMContentLoaded', () => {
  loadDosenSection();
  loadKegiatan();
});