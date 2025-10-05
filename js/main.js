/* main.js for College Notice Board Frontend
   - Set API to your deployed backend URL
   - Endpoints used:
     GET  /get_notices[?category=CategoryName]
     POST /add_notice     (JSON {title, content, category})
     DELETE /delete_notice/:id
*/

const API = "https://your-backend.onrender.com"; // <<== change this to your backend URL

/* ---------------- Theme handling (multi-theme) ---------------- */
const themeSelects = Array.from(document.querySelectorAll('#theme-select, #theme-select-2, #theme-select-3'));
function setTheme(name){
  document.documentElement.classList.remove('theme-classic','theme-modern','theme-nature');
  if(name === 'modern') document.documentElement.classList.add('theme-modern');
  else if(name === 'nature') document.documentElement.classList.add('theme-nature');
  else document.documentElement.classList.add('theme-classic');
  // update displays
  const el = document.getElementById('current-theme');
  if(el) el.textContent = name[0].toUpperCase() + name.slice(1);
  // keep selects in sync
  themeSelects.forEach(s=>{ if(s) s.value = name });
  localStorage.setItem('cn-theme', name);
}
themeSelects.forEach(s=>{
  if(!s) return;
  s.addEventListener('change', ()=>setTheme(s.value));
});
// apply saved or default
setTheme(localStorage.getItem('cn-theme') || 'classic');

/* ---------------- Utilities ---------------- */
async function apiGet(path){
  try{
    const r = await fetch(`${API}${path}`);
    return await r.json();
  }catch(e){
    console.error("API GET failed", e);
    return null;
  }
}
async function apiPost(path, body){
  try{
    const r = await fetch(`${API}${path}`, {
      method:'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    return await r.json();
  }catch(e){
    console.error("API POST failed", e);
    return null;
  }
}
async function apiDelete(path){
  try{
    const r = await fetch(`${API}${path}`, { method:'DELETE' });
    return await r.json();
  }catch(e){
    console.error("API DELETE failed", e);
    return null;
  }
}

/* ---------------- Home page (latest notice) ---------------- */
async function loadHomeLatest(){
  const div = document.getElementById('home-latest');
  const countEl = document.getElementById('home-count');
  if(!div) return;
  const data = await apiGet('/get_notices');
  if(!data) { div.innerHTML = '<p class="muted">Cannot reach server</p>'; return; }
  if(data.length === 0){ div.innerHTML = '<p class="muted">No notices yet.</p>'; countEl.textContent = '0'; return; }
  // show latest (most recent date or last in list)
  const latest = data[0];
  div.innerHTML = `<h5>${escapeHtml(latest.title)}</h5><p class="muted">${escapeHtml(latest.content.substring(0,200))}${latest.content.length>200?'…':''}</p><small>${escapeHtml(latest.category)} • ${escapeHtml(latest.date)}</small>`;
  countEl.textContent = String(data.length);
}

/* ---------------- Notices page ---------------- */
async function loadNotices(){
  const grid = document.getElementById('notices-grid');
  const cat = document.getElementById('category-filter')?.value || '';
  const search = document.getElementById('search-input')?.value?.toLowerCase() || '';
  if(!grid) return;
  grid.innerHTML = '<div class="muted">Loading notices…</div>';
  const data = await apiGet(`/get_notices${cat ? '?category=' + encodeURIComponent(cat) : ''}`);
  if(!data){ grid.innerHTML = '<div class="muted">Cannot reach server</div>'; return; }
  let filtered = data;
  if(search) filtered = data.filter(n => (n.title + ' ' + n.content).toLowerCase().includes(search));
  if(filtered.length === 0){ grid.innerHTML = '<div class="muted">No notices found.</div>'; return; }
  grid.innerHTML = filtered.map(n => `
    <article class="notice">
      <h3>${escapeHtml(n.title)}</h3>
      <p>${escapeHtml(n.content)}</p>
      <small><strong>${escapeHtml(n.category)}</strong> • ${escapeHtml(n.date)}</small>
    </article>
  `).join('');
}

/* ---------------- Admin page ---------------- */
async function addNotice(){
  const title = document.getElementById('notice-title')?.value?.trim();
  const content = document.getElementById('notice-content')?.value?.trim();
  const category = document.getElementById('notice-category')?.value;
  const msg = document.getElementById('admin-msg');
  if(!title || !content){ alert('Please provide title and content'); return; }
  const res = await apiPost('/add_notice', { title, content, category });
  if(res?.message){ msg.textContent = res.message; clearForm(); loadAdminNotices(); }
  else{ msg.textContent = res?.error || 'Failed to add notice'; }
}
function clearForm(){
  if(document.getElementById('notice-title')) document.getElementById('notice-title').value = '';
  if(document.getElementById('notice-content')) document.getElementById('notice-content').value = '';
}

async function loadAdminNotices(){
  const container = document.getElementById('admin-notices');
  if(!container) return;
  container.innerHTML = '<div class="muted">Loading…</div>';
  const data = await apiGet('/get_notices');
  if(!data) { container.innerHTML = '<div class="muted">Cannot reach server</div>'; return; }
  container.innerHTML = data.map(n => `
    <div class="notice">
      <h4>${escapeHtml(n.title)}</h4>
      <p class="muted">${escapeHtml(n.content)}</p>
      <small>${escapeHtml(n.category)} • ${escapeHtml(n.date)}</small>
      <button onclick="deleteNotice(${n.id})">Delete</button>
    </div>
  `).join('');
}
async function deleteNotice(id){
  if(!confirm('Delete this notice?')) return;
  const res = await apiDelete(`/delete_notice/${id}`);
  if(res?.message) loadAdminNotices();
  else alert(res?.error || 'Delete failed');
}

/* ---------------- Small helpers ---------------- */
function escapeHtml(s=''){
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

/* ---------------- Event bindings ---------------- */
document.addEventListener('DOMContentLoaded', ()=>{
  // theme selects (sync)
  document.querySelectorAll('#theme-select, #theme-select-2, #theme-select-3').forEach(s=>{
    if(!s) return;
    s.addEventListener('change', e => setTheme(e.target.value));
    // set initial value from localStorage
    const saved = localStorage.getItem('cn-theme') || 'classic';
    s.value = saved;
  });

  // notices page controls
  const refresh = document.getElementById('refresh-btn');
  if(refresh) refresh.addEventListener('click', loadNotices);
  const search = document.getElementById('search-input');
  if(search) search.addEventListener('input', () => setTimeout(loadNotices, 200));

  // load appropriate content per page
  if(location.pathname.endsWith('/index.html') || location.pathname === '/' ) loadHomeLatest();
  if(location.pathname.endsWith('/notices.html')) loadNotices();
  if(location.pathname.endsWith('/admin.html')) loadAdminNotices();
});

/* ---------------- expose functions for inline onclicks ---------------- */
window.addNotice = addNotice;
window.clearForm = clearForm;
window.deleteNotice = deleteNotice;
window.loadNotices = loadNotices;
