// =============================================================
//  auth.js — Autenticação com Google Sheets como banco de dados
//  ⚠️  Após publicar o Apps Script, cole a URL abaixo:
// =============================================================
const API_URL = 'https://script.google.com/macros/s/AKfycbwayF64KudbPXQbIH3XoiSMqA1RWublRT-FcEFy9I21eIs20axtBMkhq4o4L5CRLC9cbg/exec';

const SESSION_KEY = 'olimpiadas_session';
const LOCAL_KEY = 'olimpiadas_users';

// -------------------------------------------------------------
//  HASH simples (mesma lógica usada no Apps Script)
// -------------------------------------------------------------
function hashSimples(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
}

// -------------------------------------------------------------
//  Verifica se a API está configurada
// -------------------------------------------------------------
function apiConfigurada() {
  return API_URL && API_URL.startsWith('https://');
}

// -------------------------------------------------------------
//  SESSÃO
// -------------------------------------------------------------
function getCurrentUser() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = 'login.html';
}

function requireAuth() {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'login.html'; return null; }
  return user;
}

// -------------------------------------------------------------
//  CADASTRO
// -------------------------------------------------------------
async function register({ nomeCompleto, nomeResponsavel, dataNascimento, matricula, senha, role = 'aluno', adminKey = '', nomeEscola = '' }) {

  // ── Via Google Sheets ──────────────────────────────────────
  if (apiConfigurada()) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'cadastrar',
          nomeCompleto,
          nomeResponsavel,
          dataNascimento,
          matricula,
          senhaHash: hashSimples(senha),
          role,
          adminKey,
          nomeEscola
        })
      });
      const data = await res.json();
      if (data.ok) {
        // Salva sessão com os dados retornados pela API
        const user = { id: data.id, nomeCompleto, nomeResponsavel, dataNascimento, matricula, nomeEscola, inscricoes: [], role: data.role };
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        return { success: true, user };
      }
      return { success: false, error: data.erro };
    } catch (err) {
      console.warn('API indisponível, usando localStorage:', err);
    }
  }

  // ── Fallback: localStorage ─────────────────────────────────
  const users = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  if (users.find(u => u.matricula === matricula)) {
    return { success: false, error: 'Já existe uma conta com essa matrícula.' };
  }

  if (role === 'admin' && adminKey !== 'ADMIN2026') {
    return { success: false, error: 'Chave de acesso administrativo inválida.' };
  }

  const user = {
    id: 'u_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    nomeCompleto, nomeResponsavel, dataNascimento, matricula,
    senhaHash: hashSimples(senha),
    role: role,
    inscricoes: [],
    createdAt: new Date().toISOString()
  };
  users.push(user);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(users));
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return { success: true, user };
}

async function registerAdmin({ nomeCompleto, nomeEscola, senha, adminKey }) {
  if (apiConfigurada()) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'cadastrarAdmin',
          nomeCompleto,
          nomeEscola,
          senhaHash: hashSimples(senha),
          adminKey
        })
      });
      const data = await res.json();
      if (data.ok) {
        const user = { id: data.id, nomeCompleto, nomeEscola, inscricoes: [], role: 'admin' };
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        return { success: true, user };
      }
      return { success: false, error: data.erro };
    } catch (err) {
      console.warn('API indisponível:', err);
    }
  }
  return { success: false, error: 'API não configurada.' };
}

// -------------------------------------------------------------
//  LOGIN
// -------------------------------------------------------------
async function login(matricula, senha) {

  // ── Via Google Sheets ──────────────────────────────────────
  if (apiConfigurada()) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'login',
          matricula,
          senhaHash: hashSimples(senha)
        })
      });
      const data = await res.json();
      if (data.ok) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(data.usuario));
        return { success: true, user: data.usuario };
      }
      return { success: false, error: data.erro };
    } catch (err) {
      console.warn('API indisponível, usando localStorage:', err);
    }
  }

  // ── Fallback: localStorage ─────────────────────────────────
  const users = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  const user = users.find(u => u.matricula === matricula && u.senhaHash === hashSimples(senha));
  // Suporte a contas antigas que salvaram senha em texto puro
  const userLegacy = !user ? users.find(u => u.matricula === matricula && u.senha === senha) : null;
  const found = user || userLegacy;
  if (!found) return { success: false, error: 'Matrícula ou senha incorretos.' };
  localStorage.setItem(SESSION_KEY, JSON.stringify(found));
  return { success: true, user: found };
}

// -------------------------------------------------------------
//  LOGIN ADMIN
// -------------------------------------------------------------
async function loginAdmin(escola, senha) {

  // ── Via Google Sheets ──────────────────────────────────────
  if (apiConfigurada()) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'loginAdmin',
          escola,
          senhaHash: hashSimples(senha)
        })
      });
      const data = await res.json();
      if (data.ok) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(data.usuario));
        return { success: true, user: data.usuario };
      }
      return { success: false, error: data.erro };
    } catch (err) {
      console.warn('API indisponível, usando localStorage:', err);
    }
  }

  // ── Fallback: localStorage ─────────────────────────────────
  const users = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  const user = users.find(u => u.nomeEscola === escola && u.senhaHash === hashSimples(senha) && u.role === 'admin');
  if (!user) return { success: false, error: 'Escola ou senha incorretos.' };
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return { success: true, user: user };
}

// -------------------------------------------------------------
//  INSCRIÇÕES (armazenadas localmente na sessão)
// -------------------------------------------------------------
function toggleEnroll(olympiadId) {
  const user = getCurrentUser();
  if (!user) return false;
  const list = user.inscricoes || [];
  const pos = list.indexOf(olympiadId);
  if (pos === -1) list.push(olympiadId);
  else list.splice(pos, 1);
  user.inscricoes = list;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return pos === -1;
}

function isEnrolled(olympiadId) {
  const user = getCurrentUser();
  return user ? (user.inscricoes || []).includes(olympiadId) : false;
}
