// ============================================================
//  Google Apps Script — Cole este código no editor do Apps Script
//  Planilha > Extensões > Apps Script
// ============================================================

const SHEET_ADMINS = "Admins";
const SHEET_ALUNOS = "Alunos";
const SHEET_ENROLL = "Inscricoes";
const SHEET_VERIFICATION = "VerificacaoEmail";
const ADMIN_SECRET = "ADMIN2026";
const VERIFICATION_EXPIRY_MINUTES = 15;

const HEADER_ALUNOS = ['Data', 'Nome', 'Email', 'Matricula', 'DataNascimento', 'Sexo', 'SenhaHash', 'ID', 'Role'];
const HEADER_ADMINS = ['Data', 'Nome', 'Escola', 'SenhaHash', 'ID', 'Role'];
const HEADER_ENROLL = ['Data', 'UserID', 'Nome', 'Matricula', 'OlimpiadaID', 'NomeOlimpiada', 'Sigla', 'Status'];

// Garante que a aba exista e tenha uma linha de cabeçalho
function garantirAba(nome, cabecalho) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(nome);
  if (!sheet) {
    sheet = ss.insertSheet(nome);
    sheet.appendRow(cabecalho);
    sheet.getRange('1:1').setFontWeight('bold');
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(cabecalho);
    sheet.getRange('1:1').setFontWeight('bold');
  }
  return sheet;
}

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
    if (action === 'confirmar')  return confirmarInscricao(data);
    if (action === 'remover')    return removerInscricao(data);
    if (action === 'listarInscricoes') return listarInscricoesAdmin();
    if (action === 'enviarCodigo')    return enviarCodigoVerificacao(data);
    if (action === 'verificarCodigo')  return confirmarCodigoVerificacao(data);

    return resposta({ ok: false, erro: 'Ação inválida.' });
  } catch (err) {
    return resposta({ ok: false, erro: 'Erro interno: ' + err.message });
  }
}

// ── CADASTRO ALUNO ─────────────────────────────────────────────────
function cadastrarUsuario(data) {
  const sheet = garantirAba(SHEET_ALUNOS, HEADER_ALUNOS);
  const rows = sheet.getDataRange().getValues();

  for (let i = 0; i < rows.length; i++) {
    const codigo = String(rows[i][3] || '').trim();
    if (codigo && codigo === String(data.codigoMatricula).trim()) {
      return resposta({ ok: false, erro: 'Já existe uma conta com esse código de matrícula.' });
    }
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
  const sheet = garantirAba(SHEET_ADMINS, HEADER_ADMINS);
  
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
  const sheet = garantirAba(SHEET_ALUNOS, HEADER_ALUNOS);
  const rows  = sheet.getDataRange().getValues();

  for (let i = 0; i < rows.length; i++) {
    const userId = String(rows[i][7] || '');
    if (userId.indexOf('u_') !== 0) continue;

    const codigoNaPlanilha = String(rows[i][3]);
    const hashNaPlanilha   = String(rows[i][6]);

    if (codigoNaPlanilha === String(data.codigoMatricula) && hashNaPlanilha === String(data.senhaHash)) {
      const enrollSheet = garantirAba(SHEET_ENROLL, HEADER_ENROLL);
      const enrollRows = enrollSheet.getDataRange().getValues();
      const inscricoes = [];
      
      for (let j = 0; j < enrollRows.length; j++) {
        if (!String(enrollRows[j][1] || '')) continue;
        if (String(enrollRows[j][1]) === userId) {
          inscricoes.push({
            id: String(enrollRows[j][4]),
            status: String(enrollRows[j][7] || 'pendente')
          });
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
  const sheet = garantirAba(SHEET_ADMINS, HEADER_ADMINS);
  const rows = sheet.getDataRange().getValues();

  for (let i = 0; i < rows.length; i++) {
    const id = String(rows[i][4] || '');
    if (id.indexOf('a_') !== 0) continue;

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
  const sheet = garantirAba(SHEET_ENROLL, HEADER_ENROLL);
  
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
    data.olympiadAcronym,
    'pendente'
  ]);

  return resposta({ ok: true, mensagem: 'Inscrição salva com sucesso!' });
}

function cancelarInscricao(data) {
  const sheet = garantirAba(SHEET_ENROLL, HEADER_ENROLL);
  const rows = sheet.getDataRange().getValues();
  const userId = String(data.userId);
  const olympiadId = String(data.olympiadId);
  
  let found = false;
  for (let i = rows.length - 1; i >= 0; i--) {
    if (!String(rows[i][1] || '')) continue;
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

function confirmarInscricao(data) {
  const sheet = garantirAba(SHEET_ENROLL, HEADER_ENROLL);
  const rows = sheet.getDataRange().getValues();
  const userId = String(data.userId);
  const olympiadId = String(data.olympiadId);
  
  for (let i = rows.length - 1; i >= 0; i--) {
    if (!String(rows[i][1] || '')) continue;
    if (String(rows[i][1]) === userId && String(rows[i][4]) === olympiadId) {
      sheet.getRange(i + 1, 8).setValue('confirmada');
      return resposta({ ok: true, mensagem: 'Inscrição confirmada!' });
    }
  }
  
  return resposta({ ok: false, erro: 'Inscrição não encontrada.' });
}

function removerInscricao(data) {
  const sheet = garantirAba(SHEET_ENROLL, HEADER_ENROLL);
  const rows = sheet.getDataRange().getValues();
  const userId = String(data.userId);
  const olympiadId = String(data.olympiadId);
  
  for (let i = rows.length - 1; i >= 0; i--) {
    if (!String(rows[i][1] || '')) continue;
    if (String(rows[i][1]) === userId && String(rows[i][4]) === olympiadId) {
      sheet.deleteRow(i + 1);
      return resposta({ ok: true, mensagem: 'Pedido removido.' });
    }
  }
  
  return resposta({ ok: false, erro: 'Inscrição não encontrada.' });
}

// ── LISTAR INSCRIÇÕES (ADMIN) ────────────────────────────────
function listarInscricoesAdmin() {
  const enrollSheet = garantirAba(SHEET_ENROLL, HEADER_ENROLL);
  const enrollRows = enrollSheet.getDataRange().getValues();
  
  const alunosSheet = garantirAba(SHEET_ALUNOS, HEADER_ALUNOS);
  const alunosRows = alunosSheet.getDataRange().getValues();
  
  const inscricoes = [];
  for (let i = 0; i < enrollRows.length; i++) {
    const userId = String(enrollRows[i][1] || '');
    if (!userId) continue;
    let email = '', dataNascimento = '', sexo = '';
    
    for (let j = 0; j < alunosRows.length; j++) {
      if (String(alunosRows[j][7] || '') === userId) {
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
      sexo: sexo,
      status: enrollRows[i][7] || 'pendente'
    });
  }
  
  inscricoes.sort((a, b) => {
    if (a.status === 'pendente' && b.status === 'confirmada') return -1;
    if (a.status === 'confirmada' && b.status === 'pendente') return 1;
    return 0;
  });
  
  return resposta({ ok: true, inscricoes: inscricoes });
}

// ── VERIFICAÇÃO DE EMAIL ─────────────────────────────────────
function garantirAbaVerificacao() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_VERIFICATION);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_VERIFICATION);
    sheet.appendRow(['email', 'codigo', 'criadoEm', 'verificado']);
    sheet.getRange('1:1').setFontWeight('bold');
  }
  return sheet;
}

function enviarCodigoVerificacao(data) {
  const sheet = garantirAbaVerificacao();
  const email = (data.email || '').trim().toLowerCase();

  if (!email) {
    return resposta({ ok: false, erro: 'E-mail não informado.' });
  }

  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
  const agora = new Date();

  sheet.appendRow([email, codigo, agora, 'nao']);

    try {
      MailApp.sendEmail({
        to: email,
        subject: 'Código de verificação — OlímpIA Portela',
        name: 'OlímpIA Portela',
        body: 'Seu código de verificação é: ' + codigo + '\n\n' +
              'Este código expira em ' + VERIFICATION_EXPIRY_MINUTES + ' minutos.\n\n' +
              'Se você não solicitou este código, ignore este e-mail.'
      });
    } catch (err) {
      console.error('Erro ao enviar email:', err.message);
      return resposta({ ok: false, erro: 'Erro ao enviar e-mail: ' + err.message });
    }

  return resposta({ ok: true, mensagem: 'Código enviado para ' + email });
}

function confirmarCodigoVerificacao(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_VERIFICATION);
  if (!sheet) {
    return resposta({ ok: false, erro: 'Nenhuma verificação encontrada. Solicite um novo código.' });
  }

  const email = (data.email || '').trim().toLowerCase();
  const codigo = (data.codigo || '').trim();

  if (!email || !codigo) {
    return resposta({ ok: false, erro: 'E-mail e código são obrigatórios.' });
  }

  const rows = sheet.getDataRange().getValues();

  for (let i = rows.length - 1; i >= 1; i--) {
    if (String(rows[i][0]).trim().toLowerCase() === email) {
      const codigoSalvo = String(rows[i][1]).trim();
      const criadoEm = rows[i][2];
      const verificado = String(rows[i][3] || '').trim();

      if (verificado === 'sim') {
        return resposta({ ok: false, erro: 'Este e-mail já foi verificado.' });
      }

      if (codigoSalvo !== codigo) {
        return resposta({ ok: false, erro: 'Código inválido.' });
      }

      if (criadoEm instanceof Date) {
        const diffMs = new Date().getTime() - criadoEm.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin > VERIFICATION_EXPIRY_MINUTES) {
          sheet.getRange(i + 1, 4).setValue('expirado');
          return resposta({ ok: false, erro: 'Código expirado. Solicite um novo.' });
        }
      }

      sheet.getRange(i + 1, 4).setValue('sim');
      return resposta({ ok: true, mensagem: 'E-mail verificado com sucesso!' });
    }
  }

  return resposta({ ok: false, erro: 'Nenhum código encontrado para este e-mail. Solicite um novo.' });
}

// ── AUXILIARES ────────────────────────────────────────────────
function resposta(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
