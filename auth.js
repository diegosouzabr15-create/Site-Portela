// =============================================================
//  auth.js — Autenticação com Google Sheets como banco de dados
//  ⚠️  Após publicar o Apps Script, cole a URL abaixo:
// =============================================================
const API_URL = 'https://script.google.com/macros/s/AKfycby6jjGzRNgeF2IWxA9V8OWyVx5ahB3Jl8JCmI-6FqVz6quKDVBlDaTk0_sBEh0UEfUEdg/exec';

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
async function register({ nomeCompleto, email, dataNascimento, sexo, codigoMatricula, senha, role = 'aluno', adminKey = '', nomeEscola = '' }) {

  // ── Via Google Sheets ──────────────────────────────────────
  if (apiConfigurada()) {
    try {
      console.log('Enviando dados para API:', { action: 'cadastrar', nomeCompleto, email, dataNascimento, sexo, codigoMatricula });
      const res = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'cadastrar',
          nomeCompleto,
          email,
          dataNascimento,
          sexo,
          codigoMatricula,
          senhaHash: hashSimples(senha),
          role,
          adminKey,
          nomeEscola
        })
      });
      const data = await res.json();
      console.log('Resposta da API:', data);
      if (data.ok) {
        const user = { id: data.id, nomeCompleto, email, dataNascimento, sexo, codigoMatricula, nomeEscola, inscricoes: [], role: data.role };
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        return { success: true, user };
      }
      return { success: false, error: data.erro };
    } catch (err) {
      console.error('Erro na API:', err);
      console.warn('API indisponível, usando localStorage:', err);
    }
  }

  // ── Fallback: localStorage ─────────────────────────────────
  const users = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  if (users.find(u => u.codigoMatricula === codigoMatricula)) {
    return { success: false, erro: 'Já existe uma conta com esse código de matrícula.' };
  }

  if (role === 'admin' && adminKey !== 'ADMIN2026') {
    return { success: false, error: 'Chave de acesso administrativo inválida.' };
  }

  const user = {
    id: 'u_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    nomeCompleto, email, dataNascimento, sexo, codigoMatricula,
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

  // Fallback: localStorage
  if (adminKey !== 'ADMIN2026') {
    return { success: false, error: 'Chave de acesso administrativo inválida.' };
  }

  const users = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  if (users.find(u => u.nomeEscola === nomeEscola && u.role === 'admin')) {
    return { success: false, error: 'Já existe um admin para esta escola.' };
  }

  const user = {
    id: 'admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    nomeCompleto,
    nomeEscola,
    senhaHash: hashSimples(senha),
    role: 'admin',
    inscricoes: [],
    createdAt: new Date().toISOString()
  };
  users.push(user);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(users));
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return { success: true, user };
}

// -------------------------------------------------------------
//  LOGIN
// -------------------------------------------------------------
async function login(codigoMatricula, senha) {

  // ── Via Google Sheets ──────────────────────────────────────
  if (apiConfigurada()) {
    try {
      console.log('Tentando login com API...');
      const res = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'login',
          codigoMatricula,
          senhaHash: hashSimples(senha)
        })
      });
      const data = await res.json();
      console.log('Resposta login:', data);
      if (data.ok) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(data.usuario));
        return { success: true, user: data.usuario };
      }
      return { success: false, error: data.erro };
    } catch (err) {
      console.error('Erro na API:', err);
      console.warn('API indisponível, usando localStorage:', err);
    }
  }

  // ── Fallback: localStorage ─────────────────────────────────
  const users = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  const user = users.find(u => u.codigoMatricula === codigoMatricula && u.senhaHash === hashSimples(senha));
  const userLegacy = !user ? users.find(u => u.codigoMatricula === codigoMatricula && u.senha === senha) : null;
  const found = user || userLegacy;
  if (!found) return { success: false, error: 'Código de matrícula ou senha incorretos.' };
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
