// Ganti tab
function showSection(id) {
    document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    if (id === 'pendaftar') fetchPendaftar();
    // Tambahan nanti untuk kegiatan dan dosen
  }
  
  // Tampilkan data pendaftar
  async function fetchPendaftar() {
    const { data, error } = await sb.from('pendaftar').select('*').order('waktu_daftar', { ascending: false });
    if (error) return console.error('.', error);
  
    const tbody = document.querySelector('#tablePendaftar tbody');
    tbody.innerHTML = '';
  
    data.forEach((p, i) => {
      tbody.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${p.nama_maba}</td>
          <td>${p.fakultas_prodi}</td>
          <td>${p.jk}</td>
          <td>${p.ttl || '-'}</td>
          <td>${p.nik}</td>
          <td>${p.hp_maba}</td>
          <td>${p.alamat}</td>
          <td>Ibu: ${p.nama_ibu || '-'}<br>Bapak: ${p.nama_ayah || '-'}<br>Wali: ${p.nama_wali || '-'}</td>
          <td>${p.asal_sekolah}</td>
          <td>
            <button onclick="editPendaftar(${p.id})">✏️</button>
            <button onclick="deletePendaftar(${p.id})">🗑️</button>
          </td>
        </tr>
      `);
    });
  }
  
  
  
  // Hapus data
  async function deletePendaftar(id) {
    if (!confirm('Yakin hapus?')) return;
    const { error } = await sb.from('pendaftar').delete().eq('id', id);
    if (error) return alert('Gagal hapus!');
    fetchPendaftar();
  }
  
  // Edit data (contoh isinya hanya alert, perlu form lanjutan)
  async function editPendaftar(id) {
    const { data, error } = await sb.from('pendaftar').select('*').eq('id', id).single();
    if (error) return alert('Error load pendaftar');
    // TODO: Buat dialog/form update
    alert('Mohon tambahkan interface edit sendiri ya sis 😊\nData: ' + JSON.stringify(data));
  }
  
  // Jalankan awal
  document.addEventListener('DOMContentLoaded', () => showSection('pendaftar'));
  
  function showSection(id) {
    document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
  
    document.querySelectorAll('.admin-navbar a').forEach(a => a.classList.remove('active'));
    document.querySelector(`.admin-navbar a[onclick*="${id}"]`)?.classList.add('active');
  
    if (id === 'pendaftar') fetchPendaftar();
    if (id === 'dosen') {fetchDosen();}
  }

  function editPendaftar(id) {
    sb.from('pendaftar').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error) return alert("Gagal mengambil data.");
  
        document.getElementById('editId').value = data.id;
        document.getElementById('editNamaMaba').value = data.nama_maba;
        document.getElementById('editProdi').value = data.fakultas_prodi;
        document.getElementById('editHpMaba').value = data.hp_maba;
        document.getElementById('editAlamat').value = data.alamat;
  
        document.getElementById('editModal').style.display = 'flex';
      });
  }
  
  function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
  }
  
  function submitEdit(e) {
    e.preventDefault();
    const id = document.getElementById('editId').value;
  
    sb.from('pendaftar').update({
      nama_maba: document.getElementById('editNamaMaba').value,
      fakultas_prodi: document.getElementById('editProdi').value,
      hp_maba: document.getElementById('editHpMaba').value,
      alamat: document.getElementById('editAlamat').value,
    }).eq('id', id).then(({ error }) => {
      if (error) return alert('Gagal update data.');
      alert('Berhasil diupdate!');
      closeEditModal();
      fetchPendaftar();
    });
  }

  // Event listener
document.getElementById('btnAddKegiatan').addEventListener('click', showAddKegiatan);
fetchKegiatan();

// Fetch & render
async function fetchKegiatan() {
  const list = document.getElementById('kegiatanList');
  if (!list) return;
  const { data, error } = await sb.from('kegiatan').select('*').order('tanggal', { ascending: false });
  if (error) return list.innerHTML = `<p style="color:red">Gagal ambil data</p>`;
  list.innerHTML = data.map(k => `
    <div class="admin-kegiatan-card">
      <img src="${k.foto_url}" alt="${k.judul}">
      <div class="admin-kegiatan-info">
        <h4>${k.judul}</h4>
        <small>${k.tanggal}</small>
        <div class="aksi-btn-kegiatan">
          <button class="edit-keg" onclick="editKegiatan('${k.id}')">✏️</button>
          <button class="hapus-keg" onclick="deleteKegiatan('${k.id}')">🗑️</button>
        </div>
      </div>
    </div>`).join('');
    
}

function showAddKegiatan() {
  document.getElementById('kegiatanModalTitle').innerText = "Tambah Kegiatan";
  document.getElementById('kegiatanId').value = '';
  document.getElementById('kegiatanJudul').value = '';
  document.getElementById('kegiatanTanggal').value = '';
  document.getElementById('kegiatanFotoFile').value = '';
  document.getElementById('kegiatanIsi').value = '';
  document.getElementById('kegiatanModal').style.display = 'flex';
}

async function editKegiatan(id) {
  const { data, error } = await sb.from('kegiatan').select('*').eq('id', id).single();
  if (error) return alert("Gagal ambil data!");
  document.getElementById('kegiatanModalTitle').innerText = "Edit Kegiatan";
  document.getElementById('kegiatanId').value = data.id;
  document.getElementById('kegiatanJudul').value = data.judul;
  document.getElementById('kegiatanTanggal').value = data.tanggal;
  document.getElementById('kegiatanIsi').value = data.isi;
  document.getElementById('kegiatanModal').style.display = 'flex';
}

async function submitKegiatanForm(e) {
  e.preventDefault();

  const id = document.getElementById('kegiatanId').value;
  const judul = document.getElementById('kegiatanJudul').value.trim();
  const tanggal = document.getElementById('kegiatanTanggal').value;
  const isi = document.getElementById('kegiatanIsi').value.trim();
  const file = document.getElementById('kegiatanFotoFile').files[0];

  if (!judul || !tanggal || !isi || (!file && !id)) {
    return alert("Lengkapi semua data! (foto diperlukan saat tambah)");
  }

  let foto_url = null, foto_path = null, oldFotoPath = null;

  // Jika edit, ambil data lama
  if (id) {
    const { data: old, error: eOld } = await sb.from('kegiatan').select('foto_url, foto_path').eq('id', id).single();
    if (eOld) return alert("Gagal ambil data lama!");
    foto_url = old.foto_url;
    foto_path = old.foto_path;
  }

  if (file) {
    // Jika foto baru diupload: hapus foto lama
    if (foto_path) await sb.storage.from('kegiatan-foto').remove([foto_path]);

    // Upload foto baru
    const filename = `${Date.now()}-${file.name}`;
    const { data: up, error: eUp } = await sb.storage.from('kegiatan-foto').upload(filename, file);
    if (eUp) return alert("Gagal upload foto baru!");
    foto_path = up.path;
    foto_url = sb.storage.from('kegiatan-foto').getPublicUrl(foto_path).data.publicUrl;
  }

  const payload = { judul, tanggal, isi, foto_url, foto_path };

  const { error } = id
    ? await sb.from('kegiatan').update(payload).eq('id', id)
    : await sb.from('kegiatan').insert(payload);

  if (error) {
    console.error("Supabase error:", error);
    return alert("❌ Gagal menyimpan data!");
  }

  closeKegiatanModal();
  fetchKegiatan();
}


async function deleteKegiatan(id) {
  if (!confirm("Yakin hapus kegiatan? Ini juga akan hapus foto.")) return;

  const { data, error: eOld } = await sb.from('kegiatan').select('foto_path').eq('id', id).single();
  if (!eOld && data.foto_path) {
    await sb.storage.from('kegiatan-foto').remove([data.foto_path]);
  }

  const { error: eDel } = await sb.from('kegiatan').delete().eq('id', id);
  if (eDel) return alert("Gagal menghapus data!");

  fetchKegiatan();
}


function closeKegiatanModal() {
  document.getElementById('kegiatanModal').style.display = 'none';
}

  
// Tampilkan daftar dosen
async function fetchDosen() {
    const { data, error } = await sb.from('dosen').select('*').order('created_at', { ascending: false });
    const container = document.getElementById('dosenList');
    if (!container) return;
    if (error) {
      container.innerHTML = `<p style="color:red">Gagal mengambil data</p>`;
      return;
    }
  
    container.innerHTML = data.map(d => `
      <div class="dosen-card visible">
        <div class="dosen-photo"><img src="${d.foto_url}" alt="Foto ${d.nama}"></div>
        <div class="dosen-info">
          <h2>${d.nama}</h2>
          <p><span>Gelar & Jabatan:</span> ${d.jabatan}</p>
          <p><span>Program Studi / Fakultas:</span> ${d.prodi}</p>
            <div class="aksi-btn">
                <button class="edit-btn" onclick="editDosen(${d.id})">Edit</button>
                <button class="hapus-btn" onclick="deleteDosen(${d.id})">Hapus</button>
            </div>
            </div>
        </div>
        `).join('');
  }
  
  // Tampilkan modal tambah dosen
  function showAddDosen() {
    document.getElementById('modalTitle').innerText = "Tambah Dosen";
    document.getElementById('dosenId').value = '';
    document.getElementById('dosenNama').value = '';
    document.getElementById('dosenJabatan').value = '';
    document.getElementById('dosenProdi').value = '';
    document.getElementById('dosenFotoFile').value = '';
    document.getElementById('dosenModal').style.display = 'flex';
  }
  
  // Edit dosen: isi modal
  async function editDosen(id) {
    const { data, error } = await 
    sb.from('dosen').select('*').eq('id', id).single();
    if (error) return alert("Gagal ambil data dosen!");
  
    document.getElementById('modalTitle').innerText = "Edit Dosen";
    document.getElementById('dosenId').value = data.id;
    document.getElementById('dosenNama').value = data.nama;
    document.getElementById('dosenJabatan').value = data.jabatan;
    document.getElementById('dosenProdi').value = data.prodi;
    document.getElementById('dosenFotoFile').value = ''; // reset input file
    document.getElementById('dosenModal').style.display = 'flex';
  }
  
  // Submit (tambah/edit)
  async function submitDosenForm(e) {
    e.preventDefault();
  
    const id = document.getElementById('dosenId').value;
    const nama = document.getElementById('dosenNama').value.trim();
    const jabatan = document.getElementById('dosenJabatan').value.trim();
    const prodi = document.getElementById('dosenProdi').value.trim();
    const file = document.getElementById('dosenFotoFile').files[0];
  
    let foto_url = null;
    let oldFotoUrl = null;
  
    // Jika mode edit dan ada file baru diunggah
    if (id && file) {
      // Ambil foto lama
      const { data: oldData, error: fetchError } = await sb.from('dosen').select('foto_url').eq('id', id).single();
      if (!fetchError && oldData?.foto_url) oldFotoUrl = oldData.foto_url;
    }
  
    // Upload file baru jika ada
    if (file) {
      const filename = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await sb.storage.from('dosen-foto').upload(filename, file);
      if (uploadError) return alert("Gagal upload foto!");
  
      foto_url = `https://pobjjibuexslrzvfshei.supabase.co/storage/v1/object/public/dosen-foto/${filename}`;
  
      // Hapus file lama dari bucket
      if (oldFotoUrl) {
        const oldFilename = oldFotoUrl.split('/').pop();
        await sb.storage.from('dosen-foto').remove([oldFilename]);
      }
    }
  
    const payload = { nama, jabatan, prodi };
    if (foto_url) payload.foto_url = foto_url;
  
    const query = id
      ? sb.from('dosen').update(payload).eq('id', id)
      : sb.from('dosen').insert(payload);
  
    const { error } = await query;
    if (error) return alert("Gagal simpan data!");
  
    closeDosenModal();
    fetchDosen();
  }

  document.getElementById('btnDownload').addEventListener('click', downloadPendaftar);

  // Unduh data sebagai CSV
  async function downloadPendaftar() {
    const { data, error } = await sb.from('pendaftar').select('*');
    if (!data || error) return alert("Gagal ambil data pendaftar!");
  
    const cols = [
      'id','nama_dosen','nama_ref','wa_ref','fakultas_prodi','nama_maba','jk','agama','ttl',
      'nik','hp_maba','alamat','rtrw','kelurahan','kecamatan','kabupaten',
      'asal_sekolah','nama_ibu','nama_ayah','hp_ibu','hp_ayah','nama_wali',
      'hp_wali','alamat_wali','waktu_daftar'
    ];
  
    const sep = ";";  // gunakan titik koma sebagai pemisah
    const header = cols.join(sep);
    const rows = data.map(row => {
      return cols.map(col => {
        let val = row[col] == null ? "" : row[col].toString().replace(/"/g, '""');
        return `"${val}"`;
      }).join(sep);
    }).join("\r\n");
  
    const csv = header + "\r\n" + rows;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pendaftar.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  
  
  // Hapus dosen
  async function deleteDosen(id) {
    if (!confirm("Yakin ingin menghapus dosen ini?")) return;
  
    // Ambil data dosen untuk mengetahui nama file-nya
    const { data, error } = await sb.from('dosen').select('foto_url').eq('id', id).single();
    if (error || !data) {
      alert("Gagal mengambil data foto!");
      return;
    }
  
    // Ekstrak nama file dari foto_url
    const urlParts = data.foto_url.split('/');
    const filename = urlParts[urlParts.length - 1];
  
    // Hapus dari bucket
    const { error: deleteError } = await sb.storage.from('dosen-foto').remove([filename]);
    if (deleteError) {
      alert("Gagal hapus foto dari storage!");
      return;
    }
  
    // Hapus dari tabel
    await sb.from('dosen').delete().eq('id', id);
  
    fetchDosen();
  }
  
  // Tutup modal
  function closeDosenModal() {
    document.getElementById('dosenModal').style.display = 'none';
  }
  