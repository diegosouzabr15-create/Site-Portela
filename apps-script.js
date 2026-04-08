// ============================================================
//  Google Apps Script — Cole este código no editor do Apps Script
//  Planilha > Extensões > Apps Script
// ============================================================

const SHEET_ADMINS = "Admins";
const SHEET_ALUNOS = "Alunos";
const SHEET_ENROLL = "Inscricoes";
const ADMIN_SECRET = "ADMIN2026";

// Roteador principal (chamado pelo fetch do front-end)
function doPost(e) {
  try {
    const data   = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'cadastrar') return cadastrarUsuario(data);
    if (action === 'cadastrarAdmin') return cadastrarAdmin(data);
    if (action === 'login')     return verificarLogin(data);
    if (action === 'loginAdmin') return verificarLoginAdmin(data);
    if (action === 'inscrever')  return salvarInscricao(data);
    if (action === 'listarInscricoes') return listarInscricoesAdmin();

    return resposta({ ok: false, erro: 'Ação inválida.' });
  } catch (err) {
    return resposta({ ok: false, erro: 'Erro interno: ' + err.message });
  }
}

// ── CADASTRO ALUNO ─────────────────────────────────────────────────
function cadastrarUsuario(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ALUNOS);
  const lastRow = sheet.getLastRow();
  const matriculas = lastRow >= 2
    ? sheet.getRange(2, 4, lastRow - 1, 1).getValues().flat()
    : [];

  if (matriculas.includes(data.matricula)) {
    return resposta({ ok: false, erro: 'Já existe uma conta com essa matrícula.' });
  }

  const novoId = 'u_' + Date.now();

  sheet.appendRow([
    new Date().toLocaleString('pt-BR'),
    data.nomeCompleto,
    data.nomeResponsavel || '',
    data.matricula || '',
    data.dataNascimento || '',
    data.senhaHash,
    novoId,
    'aluno'
  ]);

  return resposta({ ok: true, id: novoId, role: 'aluno', mensagem: 'Cadastro realizado com sucesso!' });
}

// ── CADASTRO ADMIN ─────────────────────────────────────────────────
function cadastrarAdmin(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ADMINS);
  
  if (data.adminKey !== ADMIN_SECRET) {
    return resposta({ ok: false, erro: 'Chave de acesso administrativo inválida.' });
  }

  const novoId = 'a_' + Date.now();

  sheet.appendRow([
    new Date().toLocaleString('pt-BR'),
    data.nomeCompleto,
    data.nomeEscola || '',
    data.senhaHash,
    novoId,
    'admin'
  ]);

  return resposta({ ok: true, id: novoId, role: 'admin', mensagem: 'Cadastro admin realizado com sucesso!' });
}

// ── LOGIN ─────────────────────────────────────────────────────
function verificarLogin(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_USERS);
  const rows  = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    const matriculaNaPlanilha = String(rows[i][3]);
    const hashNaPlanilha      = String(rows[i][5]);

    if (matriculaNaPlanilha === String(data.matricula) && hashNaPlanilha === String(data.senhaHash)) {
      const userId = String(rows[i][6]);
      const enrollSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ENROLL);
      const enrollRows = enrollSheet.getDataRange().getValues();
      const inscricoes = [];
      
      for (let j = 1; j < enrollRows.length; j++) {
        if (String(enrollRows[j][1]) === userId) {
          inscricoes.push(String(enrollRows[j][4]));
        }
      }
      
      return resposta({
        ok: true,
        usuario: {
          id:              rows[i][6],
          nomeCompleto:    rows[i][1],
          nomeResponsavel: rows[i][2],
          matricula:       rows[i][3],
          dataNascimento:  rows[i][4],
          role:            rows[i][7] || 'aluno',
          nomeEscola:      rows[i][8] || '',
          inscricoes:       inscricoes
        }
      });
    }
  }

  return resposta({ ok: false, erro: 'Matrícula ou senha incorretos.' });
}

// ── LOGIN ADMIN ─────────────────────────────────────────────────
function verificarLoginAdmin(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ADMINS);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    const nomeEscola = String(rows[i][2] || '');
    const hashNaPlanilha = String(rows[i][3]);

    if (nomeEscola === String(data.escola) && hashNaPlanilha === String(data.senhaHash)) {
      return resposta({
        ok: true,
        usuario: {
          id: rows[i][4],
          nomeCompleto: rows[i][1],
          nomeEscola: rows[i][2] || '',
          role: 'admin',
          inscricoes: []
        }
      });
    }
  }

  return resposta({ ok: false, erro: 'Escola ou senha incorretos.' });
}

// ── INSCRIÇÃO ─────────────────────────────────────────────────
function salvarInscricao(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ENROLL);
  
  sheet.appendRow([
    new Date().toLocaleString('pt-BR'),
    data.userId,
    data.userName,
    data.userMatricula,
    data.olympiadId,
    data.olympiadName,
    data.olympiadAcronym
  ]);

  return resposta({ ok: true, mensagem: 'Inscrição salva com sucesso!' });
}

// ── LISTAR INSCRIÇÕES (ADMIN) ────────────────────────────────
function listarInscricoesAdmin() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ENROLL);
  const rows = sheet.getDataRange().getValues();
  
  const inscricoes = [];
  for (let i = 1; i < rows.length; i++) {
    inscricoes.push({
      timestamp: rows[i][0],
      userId: rows[i][1],
      userName: rows[i][2],
      userMatricula: rows[i][3],
      olympiadId: rows[i][4],
      olympiadName: rows[i][5],
      olympiadAcronym: rows[i][6]
    });
  }
  
  return resposta({ ok: true, inscricoes: inscricoes });
}

// ── AUXILIARES ────────────────────────────────────────────────
function resposta(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
