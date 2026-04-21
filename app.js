const ENROLLMENTS_KEY = 'olimpiadas_inscricoes';

// Statuses: inscricoes-abertas | em-andamento | inscricoes-fechadas | encerrada
const STATUS_LABELS = {
  'inscricoes-abertas':  'Inscrições abertas',
  'em-andamento':        'Em andamento',
  'inscricoes-fechadas': 'Inscrições fechadas',
  'encerrada':           'Encerrada'
};

function makeBanner(acronym, c1, c2) {
  const lines = [];
  const words = acronym.split(' ');
  let cur = '';
  words.forEach(w => {
    const test = cur ? cur + ' ' + w : w;
    if (test.length <= 10) { cur = test; }
    else { if (cur) lines.push(cur); cur = w; }
  });
  if (cur) lines.push(cur);
  const lineH = 16;
  const totalH = lines.length * lineH;
  const startY = 55 - totalH / 2 + lineH / 2;
  const textNodes = lines.map((l, i) => {
    const fs = l.length > 7 ? 8 : l.length > 5 ? 9 : l.length > 3 ? 10 : 12;
    return `<text x="45" y="${startY + i * lineH}" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="Inter,system-ui,sans-serif" font-weight="800" font-size="${fs}">${l}</text>`;
  }).join('');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='90' height='110'><defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0%' stop-color='${c1}'/><stop offset='100%' stop-color='${c2}'/></linearGradient><linearGradient id='sh' x1='0' y1='0' x2='1' y2='0'><stop offset='0%' stop-color='rgba(0,0,0,.18)'/><stop offset='100%' stop-color='rgba(0,0,0,0)'/></linearGradient></defs><rect width='90' height='110' fill='url(#g)'/><rect width='90' height='110' fill='url(#sh)'/>${textNodes}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const OLYMPIADS = [
  { id:'obb',        acronym:'OBB',                     name:'Olimpíada Brasileira de Biologia',                                      area:'Biologia',             deadline:'30/05/2026', status:'inscricoes-fechadas', phases:2, fee:'Gratuita', level:'Ensino Médio',           c1:'#059669',c2:'#047857' },
  { id:'onhb',       acronym:'ONHB',                    name:'Olimpíada Nacional em História do Brasil',                              area:'História',             deadline:'10/06/2026', status:'inscricoes-abertas',  phases:5, fee:'Gratuita', level:'Ensino Médio',           c1:'#d97706',c2:'#b45309' },
  { id:'obbiotec',   acronym:'OBBiotec',                name:'Olimpíada Brasileira de Biotecnologia',                                 area:'Biotecnologia',        deadline:'15/07/2026', status:'inscricoes-fechadas', phases:2, fee:'Gratuita', level:'Ensino Médio',           c1:'#10b981',c2:'#059669' },
  { id:'olitef',     acronym:'OLITEF',                  name:'Olimpíada de Literatura e Filosofia',                                   area:'Literatura / Filosofia',deadline:'20/06/2026', status:'inscricoes-fechadas', phases:2, fee:'Gratuita', level:'Ensino Médio',           c1:'#7c3aed',c2:'#6d28d9' },
  { id:'obr',        acronym:'OBR',                     name:'Olimpíada Brasileira de Robótica',                                     area:'Robótica / Tecnologia', deadline:'25/05/2026', status:'inscricoes-fechadas', phases:3, fee:'Gratuita', level:'Fund. e Médio',          c1:'#2563eb',c2:'#1d4ed8' },
  { id:'onc',        acronym:'ONC',                     name:'Olimpíada Nacional de Ciências',                                       area:'Ciências',             deadline:'12/06/2026', status:'inscricoes-abertas',  phases:2, fee:'Gratuita', level:'Fund. e Médio',          c1:'#0891b2',c2:'#0e7490' },
  { id:'oceano',     acronym:'OLIMPÍADA DO OCEANO',     name:'Olimpíada do Oceano',                                                   area:'Ciências Ambientais',  deadline:'30/07/2026', status:'inscricoes-fechadas', phases:2, fee:'Gratuita', level:'Fundamental II e Médio', c1:'#0284c7',c2:'#0369a1' },
  { id:'tff',        acronym:'TORNEIO FEMININO DE FÍSICA',name:'Torneio Feminino de Física',                                         area:'Física',               deadline:'22/06/2026', status:'inscricoes-abertas',  phases:2, fee:'Gratuita', level:'Ensino Médio',           c1:'#db2777',c2:'#be185d', femaleOnly:true },
  { id:'canguru',    acronym:'CANGURU',                 name:'Canguru de Matemática Brasil',                                         area:'Matemática',           deadline:'18/05/2026', status:'em-andamento',        phases:1, fee:'Gratuita', level:'Fund. e Médio',          c1:'#ea580c',c2:'#c2410c' },
  { id:'obsma',      acronym:'OBSMA',                   name:'Olimpíada Brasileira de Saúde e Meio Ambiente',                        area:'Saúde / Meio Ambiente', deadline:'28/06/2026', status:'inscricoes-fechadas', phases:3, fee:'Gratuita', level:'Ensino Médio',           c1:'#16a34a',c2:'#15803d' },
  { id:'obmep',      acronym:'OBMEP',                   name:'Olimpíada Brasileira de Matemática das Escolas Públicas',              area:'Matemática',           deadline:'30/06/2026', status:'inscricoes-abertas',  phases:2, fee:'Gratuita', level:'Fund. II e Médio',       c1:'#dc2626',c2:'#b91c1c' },
  { id:'obapo',      acronym:'OBAPO',                   name:'Olimpíada Brasileira de Astronomia para Professores e Orientadores',   area:'Astronomia',           deadline:'15/05/2026', status:'encerrada',           phases:2, fee:'Gratuita', level:'Ensino Médio',           c1:'#4f46e5',c2:'#4338ca' },
  { id:'obi',        acronym:'OBI',                     name:'Olimpíada Brasileira de Informática',                                  area:'Informática',          deadline:'05/08/2026', status:'inscricoes-abertas',  phases:3, fee:'Gratuita', level:'Fund. e Médio',          c1:'#0369a1',c2:'#075985' },
  { id:'obqjr',      acronym:'OBQJr',                   name:'Olimpíada Brasileira de Química Júnior',                               area:'Química',              deadline:'20/07/2026', status:'inscricoes-fechadas', phases:2, fee:'Gratuita', level:'Fundamental II',         c1:'#9333ea',c2:'#7e22ce' },
  { id:'matdiv',     acronym:'MATEMÁTICOS POR DIVERSÃO',name:'Matemáticos por Diversão',                                            area:'Matemática',           deadline:'10/07/2026', status:'inscricoes-fechadas', phases:2, fee:'Gratuita', level:'Fund. e Médio',          c1:'#f59e0b',c2:'#d97706' },
  { id:'quimeninas', acronym:'QUIMENINAS',              name:'Quimeninas — Olimpíada de Química para Meninas',                       area:'Química',              deadline:'14/06/2026', status:'inscricoes-abertas',  phases:2, fee:'Gratuita', level:'Ensino Médio',           c1:'#ec4899',c2:'#db2777', femaleOnly:true },
  { id:'olimplit',   acronym:'OLIMPÍADA DE LITERATURA', name:'Olimpíada de Literatura',                                              area:'Literatura',           deadline:'08/07/2026', status:'inscricoes-fechadas', phases:2, fee:'Gratuita', level:'Ensino Médio',           c1:'#8b5cf6',c2:'#7c3aed' },
  { id:'purple',     acronym:'PURPLE COMET',            name:'Purple Comet Math Meet',                                               area:'Matemática',           deadline:'02/06/2026', status:'em-andamento',        phases:1, fee:'Gratuita', level:'Fund. e Médio',          c1:'#a855f7',c2:'#9333ea' },
  { id:'oba',        acronym:'OBA',                     name:'Olimpíada Brasileira de Astronomia e Astronáutica',                   area:'Astronomia',           deadline:'15/05/2026', status:'encerrada',           phases:2, fee:'Gratuita', level:'Fund. e Médio',          c1:'#1e40af',c2:'#1e3a8a' },
  { id:'osequim',    acronym:'OSEQUIM',                 name:'Olimpíada Sul-Americana de Química',                                   area:'Química',              deadline:'25/07/2026', status:'inscricoes-fechadas', phases:2, fee:'Gratuita', level:'Ensino Médio',           c1:'#7c3aed',c2:'#6d28d9' },
  { id:'obafof',     acronym:'OBAFOF',                  name:'Olimpíada Brasileira de Astrofísica e Óptica para Física',            area:'Física / Astronomia',  deadline:'18/07/2026', status:'inscricoes-fechadas', phases:2, fee:'Gratuita', level:'Ensino Médio',           c1:'#0284c7',c2:'#0369a1' },
  { id:'ofv',        acronym:'OFV',                     name:'Olimpíada Filosófica Virtual',                                         area:'Filosofia',            deadline:'30/06/2026', status:'inscricoes-fechadas', phases:2, fee:'Gratuita', level:'Ensino Médio',           c1:'#64748b',c2:'#475569' },
  { id:'onee',       acronym:'ONEE',                    name:'Olimpíada Nacional de Eficiência Energética',                         area:'Energia / Engenharia', deadline:'22/07/2026', status:'inscricoes-fechadas', phases:3, fee:'Gratuita', level:'Ensino Médio',           c1:'#ca8a04',c2:'#a16207' },
  { id:'obf',        acronym:'OBF',                     name:'Olimpíada Brasileira de Física',                                       area:'Física',               deadline:'10/08/2026', status:'inscricoes-abertas',  phases:3, fee:'Gratuita', level:'Ensino Médio',           c1:'#1e293b',c2:'#0f172a' }
];

document.addEventListener('DOMContentLoaded', () => {
  const user = requireAuth();
  if (!user) return;

  document.getElementById('user-name').textContent = user.nomeCompleto;
  document.getElementById('btn-logout').addEventListener('click', logout);
  updateCounts();

  // Admin Features
  if (user.role === 'admin') {
    document.getElementById('btn-admin').style.display = 'flex';
    initAdminPanel();
    loadAdminEnrollmentsCount();
  }

  // Populate area filter
  const areas = [...new Set(OLYMPIADS.map(o => o.area))].sort();
  const sel = document.getElementById('area-filter');
  areas.forEach(a => { const opt = document.createElement('option'); opt.value = a; opt.textContent = a; sel.appendChild(opt); });

  // Populate status filter
  const ssel = document.getElementById('status-filter');
  Object.entries(STATUS_LABELS).forEach(([val, lbl]) => {
    const opt = document.createElement('option'); opt.value = val; opt.textContent = lbl; ssel.appendChild(opt);
  });

  document.getElementById('search-input').addEventListener('input', applyFilters);
  document.getElementById('area-filter').addEventListener('change', applyFilters);
  document.getElementById('status-filter').addEventListener('change', applyFilters);

  renderCards(OLYMPIADS);
});

function updateCounts() {
  const user = getCurrentUser();
  document.getElementById('enrolled-count').textContent = (user?.inscricoes || []).length;
  document.getElementById('total-count').textContent = OLYMPIADS.length;
}

function applyFilters() {
  const search = document.getElementById('search-input').value.toLowerCase();
  const area   = document.getElementById('area-filter').value;
  const status = document.getElementById('status-filter').value;
  const list = OLYMPIADS.filter(o => {
    const ms = o.name.toLowerCase().includes(search) || o.acronym.toLowerCase().includes(search);
    const ma = !area   || o.area === area;
    const mv = !status || o.status === status;
    return ms && ma && mv;
  });
  document.getElementById('grid-label').textContent = `${list.length} olimpíada${list.length !== 1 ? 's' : ''} encontrada${list.length !== 1 ? 's' : ''}`;
  renderCards(list);
}

function renderCards(list) {
  const grid = document.getElementById('olympiads-grid');
  document.getElementById('grid-label').textContent = `${list.length} olimpíada${list.length !== 1 ? 's' : ''} encontrada${list.length !== 1 ? 's' : ''}`;

  if (list.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="ei">🔍</div><p>Nenhuma olimpíada encontrada.</p></div>`;
    return;
  }

  grid.innerHTML = list.map((o, i) => {
    const user = getCurrentUser();
    const enrolled = isEnrolled(o.id);
    const statusLabel = STATUS_LABELS[o.status] || o.status;
    const banner = makeBanner(o.acronym, o.c1, o.c2);
    const isAdmin = user?.role === 'admin';
    
    let enrollCount = 0;
    if (isAdmin && allEnrollmentsFromSheet.length > 0) {
      enrollCount = allEnrollmentsFromSheet.filter(e => e.olympiadId === o.id).length;
    }
    
    return `
    <article class="olympiad-card status-${o.status} ${enrolled ? 'enrolled' : ''}" id="card-${o.id}" style="animation-delay:${i * 0.035}s" aria-label="${o.name} - ${statusLabel}">
      <div class="card-banner">
        <img src="${banner}" alt="Banner da ${o.name}" />
      </div>
      <div class="card-content">
        <div class="card-top">
          <span class="status-badge status-${o.status}" role="status" aria-label="Status: ${statusLabel}">${statusLabel}</span>
          ${enrolled ? '<span class="enrolled-badge" aria-label="Inscrito nesta olimpíada">✓ Inscrito</span>' : ''}
        </div>
        <div class="card-acronym" aria-hidden="true">${o.acronym}</div>
        <h3 class="card-title">${o.name}</h3>
        <div class="card-area"><span class="area-dot" style="background:${o.c1}" aria-hidden="true"></span><span class="sr-only">Área: </span>${o.area}</div>
        <div class="card-meta" aria-label="Informações da olimpíada">
          <span class="meta-pill" aria-label="${o.phases} fases">📋 ${o.phases} ${o.phases === 1 ? 'fase' : 'fases'}</span>
          <span class="meta-pill" aria-label="Taxa: ${o.fee}">💰 ${o.fee}</span>
          <span class="meta-pill" aria-label="Nível: ${o.level}">🎓 ${o.level}</span>
        </div>
        <div class="card-footer">
          <div class="card-deadline" aria-label="Prazo: ${o.deadline}">📅 Prazo: ${o.deadline}</div>
          ${isAdmin ? `
            <button class="btn-check" id="btn-${o.id}" onclick="showEnrollmentsFor('${o.id}')" aria-label="Ver pedidos de inscrição para ${o.name}">
              📋 Checar pedidos ${enrollCount > 0 ? `<span class="badge-count" aria-label="${enrollCount} pedidos">${enrollCount}</span>` : ''}
            </button>
          ` : `
            <button class="btn-enroll ${enrolled ? 'enrolled' : ''}" id="btn-${o.id}" onclick="handleEnroll('${o.id}')"
              ${o.status === 'encerrada' ? 'disabled aria-disabled="true" aria-label="Olimpíada encerrada"' : 'aria-label="' + (enrolled ? 'Cancelar inscrição na ' : 'Inscrever-se na ') + o.name + '"'}>
              ${enrolled ? '✓ Inscrito' : o.status === 'encerrada' ? 'Encerrada' : 'Inscrever-se'}
            </button>
          `}
        </div>
      </div>
    </article>`;
  }).join('');
}

function handleEnroll(id) {
  const o = OLYMPIADS.find(x => x.id === id);
  if (!o || o.status === 'encerrada') return;
  const user = getCurrentUser();
  
  if (o.femaleOnly && user.sexo !== 'feminino') {
    alert('Esta olimpíada é exclusiva para pessoas do sexo feminino.');
    return;
  }
  
  const currentlyEnrolled = isEnrolled(id);
  
  if (currentlyEnrolled) {
    const cancelData = { userId: user.id, olympiadId: id };
    toggleEnroll(id);
    updateCardUI(id, false);
    updateCounts();
    cancelEnrollmentFromSheet(cancelData).then(result => {
      if (result && !result.ok) {
        console.warn('Erro ao cancelar na planilha: ' + (result?.erro || 'Erro desconhecido'));
      }
    });
  } else {
    toggleEnroll(id);
    updateCardUI(id, true);
    updateCounts();
    saveEnrollmentToSheet({ action: 'inscrever', userId: user.id, userName: user.nomeCompleto, userMatricula: user.codigoMatricula, olympiadId: id, olympiadName: o.name, olympiadAcronym: o.acronym }).then(result => {
      if (result && !result.ok) {
        console.warn('Erro ao salvar na planilha: ' + (result?.erro || 'Erro desconhecido'));
      }
    });
  }
}

function updateCardUI(id, enrolled) {
  const card = document.getElementById('card-' + id);
  const btn = document.getElementById('btn-' + id);
  const top = card.querySelector('.card-top');
  
  if (enrolled) {
    card.classList.add('enrolled');
    btn.classList.add('enrolled');
    btn.textContent = '✓ Inscrito';
    if (!top.querySelector('.enrolled-badge')) {
      const b = document.createElement('span');
      b.className = 'enrolled-badge'; b.textContent = '✓ Inscrito';
      top.appendChild(b);
    }
  } else {
    card.classList.remove('enrolled');
    btn.classList.remove('enrolled');
    btn.textContent = 'Inscrever-se';
    const eb = top.querySelector('.enrolled-badge');
    if (eb) eb.remove();
  }
}

async function saveEnrollmentToSheet(data) {
  console.log('Salvando inscrição:', data);
  if (!apiConfigurada()) {
    console.warn('API não configurada');
    return { ok: false, erro: 'API não configurada' };
  }
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const result = await res.json();
    console.log('Resposta do salvamento:', result);
    return result;
  } catch (err) {
    console.error('Erro ao salvar inscrição:', err);
    return { ok: false, erro: err.message };
  }
}

async function cancelEnrollmentFromSheet(data) {
  console.log('Cancelando inscrição:', data);
  if (!apiConfigurada()) {
    console.warn('API não configurada');
    return { ok: false, erro: 'API não configurada' };
  }
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'cancelar', ...data })
    });
    const result = await res.json();
    console.log('Resposta do cancelamento:', result);
    return result;
  } catch (err) {
    console.error('Erro ao cancelar inscrição:', err);
    return { ok: false, erro: err.message };
  }
}

// -------------------------------------------------------------
// ADMIN PANEL FUNCTIONS
// -------------------------------------------------------------
function initAdminPanel() {
  const btnAdmin = document.getElementById('btn-admin');
  const adminPanel = document.getElementById('admin-panel');
  const mainGrid = document.getElementById('main-grid');
  const btnClose = document.getElementById('btn-close-panel');
  const adminFilter = document.getElementById('admin-olympiad-filter');
  const exportBtn = document.getElementById('btn-export-csv');

  OLYMPIADS.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o.id;
    opt.textContent = o.acronym;
    adminFilter.appendChild(opt);
  });

  btnAdmin.addEventListener('click', () => {
    adminPanel.style.display = 'block';
    mainGrid.style.display = 'none';
    loadAdminEnrollments();
  });

  btnClose.addEventListener('click', () => {
    adminPanel.style.display = 'none';
    mainGrid.style.display = 'block';
  });

  adminFilter.addEventListener('change', filterAdminTable);
  exportBtn.addEventListener('click', exportToCSV);
}

let allEnrollmentsFromSheet = [];

async function loadAdminEnrollmentsCount() {
  if (!apiConfigurada()) return;
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'listarInscricoes' })
    });
    const data = await res.json();
    if (data.ok) {
      const badge = document.getElementById('badge-count');
      badge.textContent = data.inscricoes.length;
      badge.style.display = data.inscricoes.length > 0 ? 'inline-flex' : 'none';
    }
  } catch (err) {}
}

async function loadAdminEnrollments() {
  const tbody = document.getElementById('admin-tbody');
  const empty = document.getElementById('admin-empty');
  
  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">Carregando...</td></tr>';
  
  if (!apiConfigurada()) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#dc2626">API não configurada. Configure o Google Apps Script.</td></tr>';
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'listarInscricoes' })
    });
    const data = await res.json();
    if (data.ok) {
      allEnrollmentsFromSheet = data.inscricoes;
      renderAdminTableData(allEnrollmentsFromSheet);
    } else {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#dc2626">Erro ao carregar: ' + data.erro + '</td></tr>';
    }
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#dc2626">Erro de conexão</td></tr>';
  }
}

function filterAdminTable() {
  const filter = document.getElementById('admin-olympiad-filter').value;
  const filtered = filter ? allEnrollmentsFromSheet.filter(r => r.olympiadId === filter) : allEnrollmentsFromSheet;
  renderAdminTableData(filtered);
}

function renderAdminTableData(records) {
  const tbody = document.getElementById('admin-tbody');
  const empty = document.getElementById('admin-empty');

  if (records.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  const formatDate = (d) => {
    if (!d || d === '-') return '-';
    if (d instanceof Date && !isNaN(d)) {
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const ano = d.getFullYear();
      return `${dia}/${mes}/${ano}`;
    }
    if (typeof d === 'string' && d.includes('GMT')) {
      const parsed = new Date(d);
      if (!isNaN(parsed)) {
        const dia = String(parsed.getDate()).padStart(2, '0');
        const mes = String(parsed.getMonth() + 1).padStart(2, '0');
        const ano = parsed.getFullYear();
        return `${dia}/${mes}/${ano}`;
      }
    }
    if (d.includes('/')) return d.split(',')[0];
    if (d.includes('-') && d.length === 10) {
      const parts = d.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return d;
  };
  tbody.innerHTML = records.map(r => `<tr>
    <td>${r.userName}</td>
    <td>${r.userMatricula}</td>
    <td>${r.email || '-'}</td>
    <td>${formatDate(r.dataNascimento)}</td>
    <td>${r.sexo || '-'}</td>
    <td>${r.olympiadAcronym}</td>
    <td>${formatDate(r.timestamp)}</td>
  </tr>`).join('');
}

function exportToCSV() {
  if (allEnrollmentsFromSheet.length === 0) return;

  const formatDateForCsv = (d) => {
    if (!d || d === '-') return '';
    if (d instanceof Date && !isNaN(d)) {
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const ano = d.getFullYear();
      return `${dia}/${mes}/${ano}`;
    }
    if (typeof d === 'string' && d.includes('GMT')) {
      const parsed = new Date(d);
      if (!isNaN(parsed)) {
        const dia = String(parsed.getDate()).padStart(2, '0');
        const mes = String(parsed.getMonth() + 1).padStart(2, '0');
        const ano = parsed.getFullYear();
        return `${dia}/${mes}/${ano}`;
      }
    }
    if (d.includes('/')) return d.split(',')[0];
    if (d.includes('-') && d.length === 10) {
      const parts = d.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return d;
  };
  const csv = 'Aluno,Matrícula,E-mail,DataNasc,Sexo,Olimpíada,Data\r\n' + allEnrollmentsFromSheet.map(r => 
    `${r.userName},${r.userMatricula},${r.email || ''},${formatDateForCsv(r.dataNascimento)},${r.sexo || ''},${r.olympiadAcronym},${formatDateForCsv(r.timestamp)}`
  ).join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inscricoes_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function showEnrollmentsFor(olympiadId) {
  const adminPanel = document.getElementById('admin-panel');
  const mainGrid = document.getElementById('main-grid');
  document.getElementById('admin-olympiad-filter').value = olympiadId;
  adminPanel.style.display = 'block';
  mainGrid.style.display = 'none';
  
  if (allEnrollmentsFromSheet.length === 0) {
    loadAdminEnrollments();
  } else {
    renderAdminTableData(allEnrollmentsFromSheet.filter(r => r.olympiadId === olympiadId));
  }
}
