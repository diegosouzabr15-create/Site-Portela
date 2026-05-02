# Portal de Olimpiadas da Rede Publica

Uma aplicacao web para estudantes da rede publica se cadastrarem e participarem das principais olimpíadas acadêmicas brasileiras.

---

## Descricao

O **Portal de Olimpiadas da Rede Publica** e um sistema que permite que estudantes:

- Se **cadastrem** e facam **login** na plataforma.
- Visualizem um **dashboard** com 24 olimpíadas disponíveis.
- Consultem detalhes como **fases**, **taxas**, **níveis** e **status** de cada olimpíada.
- Se **inscrevam** diretamente nas olimpíadas de interesse.
- **Filtrem** as olimpíadas por área do conhecimento e status.

---

## Estrutura de Arquivos

```
olimpiadas-publicas/
|
├── index.html         # Dashboard principal com lista de olimpíadas
├── login.html        # Página de login
├── cadastro.html     # Página de cadastro de novos usuários
├── app.js           # Lógica principal: dados das olimpíadas, filtros e inscrições
├── auth.js          # Lógica de autenticação (login, cadastro, sessão)
├── style.css       # Estilos globais da aplicação
├── apps-script.js # Google Apps Script (backend alternativo)
└── README.md     # Este arquivo
```

---

## Como Usar

1. Clone ou baixe os arquivos do projeto.
2. Abra o arquivo `index.html` em qualquer navegador moderno.
3. Você será redirecionado para a página de **Login**.
4. Caso não tenha conta, clique em "Criar conta gratuita".
5. Faça **Login** e explore o dashboard de olimpíadas.
6. Clique em "Inscrever-se" nas olimpíadas de interesse.

---

## Sistema de Status

As olimpíadas são exibidas com um sistema de cores basado no seu status atual:

| Status              | Cor      | Significado                         |
|--------------------|----------|-------------------------------------|
| Inscricoes abertas | Verde   | Aceitando novas inscricoes           |
| Em andamento       | Amarelo | Prova ou fase ja iniciada           |
| Inscricoes fechaas  | Roxo    | Prazo de inscricao encerrado         |
| Encerrada          | Vermelho | Olimpiada ja concluida no ano      |

---

## Olimpíadas Incluídas (24)

O dashboard inclui as seguintes olimpíadas:

1. OBB – Olimpíada Brasileira de Biologia
2. ONHB – Olimpíada Nacional em História do Brasil
3. OBBiotec – Olimpíada Brasileira de Biotecnologia
4. OLITEF – Olimpíada de Literatura e Filosofia
5. OBR – Olimpíada Brasileira de Robótica
6. ONC – Olimpíada Nacional de Ciências
7. OLIMPÍADA DO OCEANO – Olimpíada do Oceano
8. TORNEIO FEMININO DE FÍSICA – Torneio Feminino de Física
9. CANGURU – Canguru de Matemática Brasil
10. OBSMA – Olimpíada Brasileira de Saúde e Meio Ambiente
11. OBMEP – Olimpíada Brasileira de Matemática das Escolas Públicas
12. OBAPO – Olimpíada Brasileira de Astronomia para Professores e Orientadores
13. OBI – Olimpíada Brasileira de Informática
14. OBQJr – Olimpíada Brasileira de Química Júnior
15. MATEMÁTICOS POR DIVERSÃO – Matemáticos por Diversão
16. QUIMENINAS – Quimeninas — Olimpíada de Química para Meninas
17. OLIMPÍADA DE LITERATURA – Olimpíada de Literatura
18. PURPLE COMET – Purple Comet Math Meet
19. OBA – Olimpíada Brasileira de Astronomia e Astronáutica
20. OSEQUIM – Olimpíada Sul-Americana de Química
21. OBAFOF – Olimpíada Brasileira de Astrofísica e Óptica para Física
22. OFV – Olimpíada Filosófica Virtual
23. ONEE – Olimpíada Nacional de Eficiência Energética
24. OBF – Olimpíada Brasileira de Física

---

## Tecnologias Utilizadas

- **HTML5** – Estrutura semantica das paginas
- **CSS3** – Estilização, animacoes e design responsivo
- **JavaScript (Vanilla)** – Logica de aplicacao e gerenciamento de estado
- **LocalStorage** – Persistencia de dados de usuário
- **Google Apps Script** – Backend opcional via planilha Google

---

## Autenticacao

A autenticacao e feita via **Google Sheets** (quando configurado) ou **LocalStorage**:

- Os dados de cadastro podem ser armazenados em uma planilha Google (para uso em produção).
- A sessao e mantida no navegador ate o logout.
- Tambem funciona offline usando LocalStorage.

> **Atencao:** Por usar LocalStorage, os dados sao especificos para cada navegador e dispositivo. Use senhas diferentes das suas senhas reais.

---

## Backup (Google Sheets)

Para usar com Google Sheets como banco de dados:

1. Crie uma nova planilha no Google Sheets.
2.Nomeie a aba como "Cadastros".
3. Va em **Extensoes > Apps Script**.
4. Copie o codigo de `apps-script.js`.
5. Clique em **Executar** (conceda permissões se necessário).
6. Va em **Implementar > Novo implantação**.
7. Escolha "Web app", defina como "Anyone".
8. Copie a URL gerada.
9. Cole a URL no arquivo `auth.js` na constante `API_URL`.

---

## Responsividade

A aplicacao e totalmente responsiva, adaptando-se a:

- Desktops e monitores grandes
- Notebooks e laptops
- Smartphones e tablets

---

## Desenvolvimento

Projeto desenvolvido como um portal de acesso às olimpíadas das escolas públicas brasileiras, com foco em acessibilidade e facilidade de uso para estudantes.

---

*Ultima atualizacao: Maio de 2026*