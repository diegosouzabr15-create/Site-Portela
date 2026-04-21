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
    if (action === 'cancelar')   return cancelarInscricao(data);
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
  const codigos = lastRow >= 2
    ? sheet.getRange(2, 4, lastRow - 1, 1).getValues().flat()
    : [];

  if (codigos.includes(data.codigoMatricula)) {
    return resposta({ ok: false, erro: 'Já existe uma conta com esse código de matrícula.' });
  }

  const novoId = 'u_' + Date.now();

  sheet.appendRow([
    new Date().toLocaleString('pt-BR'),
    data.nomeCompleto,
    data.email || '',
    data.codigoMatricula || '',
    data.dataNascimento || '',
    data.sexo || '',
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
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ALUNOS);
  const rows  = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    const codigoNaPlanilha = String(rows[i][3]);
    const hashNaPlanilha   = String(rows[i][6]);

    if (codigoNaPlanilha === String(data.codigoMatricula) && hashNaPlanilha === String(data.senhaHash)) {
      const userId = String(rows[i][7]);
      const enrollSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ENROLL);
      const enrollRows = enrollSheet.getDataRange().getValues();
      const inscricoes = [];
      
      for (let j = 1; j < enrollRows.length; j++) {
        if (String(enrollRows[j][1]) === userId) {
          inscricoes.push(String(enrollRows[j][4]));
        }
      }
      
      const dn = rows[i][4];
      let dataNascimentoStr = '';
      if (dn instanceof Date) {
        const dia = ('0' + dn.getDate()).slice(-2);
        const mes = ('0' + (dn.getMonth() + 1)).slice(-2);
        dataNascimentoStr = dia + '/' + mes + '/' + dn.getFullYear();
      } else {
        dataNascimentoStr = String(dn || '');
      }
      
      return resposta({
        ok: true,
        usuario: {
          id:              rows[i][7],
          nomeCompleto:    rows[i][1],
          email:           rows[i][2],
          codigoMatricula: rows[i][3],
          dataNascimento:  dataNascimentoStr,
          sexo:            rows[i][5],
          role:            rows[i][8] || 'aluno',
          nomeEscola:      rows[i][9] || '',
          inscricoes:       inscricoes
        }
      });
    }
  }

  return resposta({ ok: false, erro: 'Código de matrícula ou senha incorretos.' });
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
  
  if (!sheet) {
    return resposta({ ok: false, erro: 'Planilha de inscrições não encontrada.' });
  }
  
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

function cancelarInscricao(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ENROLL);
  const rows = sheet.getDataRange().getValues();
  const userId = String(data.userId);
  const olympiadId = String(data.olympiadId);
  
  let found = false;
  for (let i = rows.length - 1; i >= 1; i--) {
    if (String(rows[i][1]) === userId && String(rows[i][4]) === olympiadId) {
      sheet.deleteRow(i + 1);
      found = true;
      break;
    }
  }

  if (found) {
    return resposta({ ok: true, mensagem: 'Inscrição cancelada com sucesso!' });
  }

  return resposta({ ok: false, erro: 'Inscrição não encontrada para o usuário nesta olimpíada.' });
}

// ── LISTAR INSCRIÇÕES (ADMIN) ────────────────────────────────
function listarInscricoesAdmin() {
  const enrollSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ENROLL);
  const enrollRows = enrollSheet.getDataRange().getValues();
  
  const alunosSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ALUNOS);
  const alunosRows = alunosSheet.getDataRange().getValues();
  
  const inscricoes = [];
  for (let i = 1; i < enrollRows.length; i++) {
    const userId = String(enrollRows[i][1]);
    let email = '', dataNascimento = '', sexo = '';
    
    for (let j = 1; j < alunosRows.length; j++) {
      if (String(alunosRows[j][7]) === userId) {
        email = String(alunosRows[j][2] || '');
        const dn = alunosRows[j][4];
        if (dn instanceof Date) {
          const dia = ('0' + dn.getDate()).slice(-2);
          const mes = ('0' + (dn.getMonth() + 1)).slice(-2);
          dataNascimento = dia + '/' + mes + '/' + dn.getFullYear();
        } else {
          dataNascimento = String(dn || '');
        }
        sexo = String(alunosRows[j][5] || '');
        break;
      }
    }
    
    const ts = enrollRows[i][0];
    let timestampStr = '';
    if (ts instanceof Date) {
      const dia = ('0' + ts.getDate()).slice(-2);
      const mes = ('0' + (ts.getMonth() + 1)).slice(-2);
      timestampStr = dia + '/' + mes + '/' + ts.getFullYear();
    } else {
      timestampStr = String(ts || '');
    }
    
    inscricoes.push({
      timestamp: timestampStr,
      userId: userId,
      userName: enrollRows[i][2],
      userMatricula: enrollRows[i][3],
      olympiadId: enrollRows[i][4],
      olympiadName: enrollRows[i][5],
      olympiadAcronym: enrollRows[i][6],
      email: email,
      dataNascimento: dataNascimento,
      sexo: sexo
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
