▸ Thought for 21s
Para definir quais componentes testar e quais não testar, utilizamos o critério de ROI (Retorno sobre o Investimento) de testes: focar onde há regras de negócio, validações, estado e
interações críticas que, se quebrarem, afetam diretamente o usuário final.
──────

### 1. Componentes que você DEVE testar (Alta Prioridade)

Estes componentes contêm validações de formulário, lógica condicional, chamadas de API, estados complexos ou regras de permissão.

Componente │ Tipo de Teste Recomendado │ O que testar nele
────────────────────────────────────────────────────┼───────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────
components/LoginForm.tsx │ Unitário / Integração │ • Validação de formulário via Zod (e-mail inválido, senha curta).• Submissão com sucesso e
│ │ redirecionamento de acordo com o perfil (/admin, /agent, /client).• Exibição de mensagem de erro e
│ │ estado de loading.
components/RegisterForm.tsx │ Unitário / Integração │ • Validação Zod com .refine (confirmação de senhas divergentes).• Envio de cadastro e tratamento de
│ │ erro de e-mail já existente.
components/CreateTicketModal.tsx │ Unitário / Integração │ • Validação de campos obrigatórios (título, descrição, categoria, prioridade).• Lógica de anexos de
│ │ arquivo (limite de no máximo 5 arquivos e limite de 5MB por arquivo com toast de erro).• Fechamento do
│ │ modal e chamada do callback onCreated.
components/UpdateTicketModal.tsx │ Unitário / Integração │ • Pré-preenchimento dos dados existentes do chamado.• Prop condicional isClient: garantir que clientes
│ │ não vejam nem editem os campos de status e prioridade.• Submissão de atualização para a API.
components/EditUserRoleModal.tsx │ Unitário / Integração │ • Troca de permissão do usuário (ADMIN, AGENT, CLIENT, USER).• Disparo da API updateRole e retorno do
│ │ callback onSaved.
components/tickets-table/TicketTableBody.tsx │ Integração │ • Filtros de busca (texto, status, prioridade, agente e período).• Ordenação por colunas (asc/desc).•
│ │ Renderização dos estados de loading, vazio (empty state) e erro.• Fallback correto para modo demo
│ │ (isDemoMode).
components/tickets-table/TicketTablePagination.tsx │ Unitário │ • Desabilitação dos botões "Anterior" (na pág 1) e "Próximo" (na última pág).• Disparo de eventos ao
│ │ trocar de página e ao mudar tamanho da página (pageSize).
components/sidebar-menu/SideBarMenu.tsx │ Integração │ • Controle de acesso visual: menu "Usuários" visível apenas para perfil ADMIN.• Ação de Logout e
│ │ colapso/expansão do menu.
components/chat.tsx │ Integração │ • Envio de mensagem pelo usuário e exibição no feed.• Tratamento da resposta da IA através do helper
│ │ getAssistantText.• Estado de carregamento enquanto aguarda a resposta.
│ Tip
│ Utilitários e funções puras de apoio também devem ter 100% de cobertura com Vitest antes dos componentes, pois são rápidos e garantem a base:
│
│ • utils/ticketHelpers.ts (formatação de datas, mapeamento de cores/status, extração de iniciais).
│ • lib/auth.ts e lib/require-role.ts (persistência de token, checagem de roles isAdmin, isAgent).
──────

### 2. Componentes que você NÃO precisa testar isoladamente (Baixa Prioridade / Desperdício de Tempo)

Evite criar arquivos de teste unitário para estes componentes, pois geram testes frágeis e que não testam lógica real:

Componente │ Motivo para NÃO testar isoladamente
────────────────────────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────
components/ui/sonner.tsx │ Componente gerado pelo shadcn/ui: é apenas um wrapper da biblioteca externa sonner. Testar
│ isso seria testar código de terceiros.
components/theme-provider.tsx │ Wrapper pass-through: apenas repassa propriedades para o NextThemesProvider da biblioteca
│ next-themes.
components/ReactMarkdown.tsx │ Renderizador puro: apenas estiliza tags HTML padrão do react-markdown. Se houver teste no
│ componente de chat, ele já é coberto indiretamente.
components/sidebar-menu/Brand.tsx e components/sidebar-menu/SidebarSection.tsx │ Componentes puramente estáticos/visuais: contêm apenas marcação JSX e imagens sem nenhuma
│ lógica de negócio ou ramificação (if/else).
components/tickets-table/TicketTableRow.tsx e components/TicketRow.tsx │ Linhas de tabela: testar cada linha isolada cria duplicação desnecessária. É muito mais
│ eficiente testar a tabela como um todo (TicketTableBody.tsx).
components/tickets-table/TicketTableContainer.tsx e │ Cascas/Containers simples: são componentes de 5 a 10 linhas que apenas envelopam o corpo
components/tickets-table/TicketsTable.tsx │ da tabela em tags <div>.
components/demo-tour/demo-tour.tsx │ Manipulação de DOM de biblioteca externa (driver.js): testar no ambiente virtual
│ (JSDOM/Vitest) é complexo e pouco confiável. O ideal para ele é apenas um teste E2E
│ pontual (Playwright) se for crítico.
app/layout.tsx e app/(auth)/layout.tsx/layout.tsx) │ Layouts raiz do Next.js: layouts que apenas montam provedores não devem ter testes
│ unitários; são cobertos de forma natural pelos testes de ponta a ponta (E2E).
──────

### 3. Estratégia recomendada para o seu projeto

Como o projeto já possui Vitest e Playwright configurados:

1. Vitest + React Testing Library (Testes Unitários / Integração de Componentes):
   • Para os formulários e modais (LoginForm, CreateTicketModal, UpdateTicketModal) e para a paginação/filtros.
   • Para as funções utilitárias em utils/ e lib/.
2. Playwright (Testes End-to-End no navegador):
   • Para 2 fluxos críticos: 1. Login com credenciais válidas e navegação até o painel. 2. Criação de um chamado completo e visualização dele na tabela.

Para o seu sistema de chamados (Tickets Front / Chamou Suporte de TI), os testes E2E (End-to-End) devem testar as jornadas reais do
usuário do início ao fim no navegador.

Aqui está a lista exata dos testes E2E que você precisa fazer, divididos por prioridade:
──────

### 🔴 1. Fluxos Críticos (Obrigatórios — O "Coração" do Sistema)

Estes são os testes que garantem que o produto funciona nas suas funções principais:

# │ Teste E2E │ O que o teste faz no navegador

────┼─────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────
01 │ Login e Redirecionamento por Perfil │ 1. Acessa /login.2. Digita email e senha válidos.3. Clica em "Entrar".4. Verifica se
│ │ gravou o token e redirecionou para a página correta (/admin, /agent ou /client).
02 │ Acesso Rápido via Modo Demo │ 1. Na tela de login, clica em "Acessar como Administrador (Demo)".2. Verifica se entrou
│ │ direto em /admin com os chamados simulados visíveis na tabela.
03 │ Criação de Novo Chamado │ 1. Usuário logado clica no botão + Novo Chamado.2. Preenche título, descrição, categoria
│ │ e prioridade no modal.3. Clica em salvar.4. Valida se o modal fechou e se o novo chamado
│ │ aparece na tabela de tickets.
04 │ Detalhes e Atualização do Chamado │ 1. Clica em uma linha de chamado na tabela.2. Navega para /chamado/[id].3. Clica em
│ │ "Editar Chamado", altera o status para "Resolvido" e salva.4. Verifica se a página
│ │ atualizou o status para "Resolvido".
05 │ Proteção de Rotas e Logout │ 1. Tenta acessar /admin sem login ➔ deve ser redirecionado para /login.2. Estando logado,
│ │ clica em "Sair" na Sidebar ➔ deve limpar a sessão e voltar para /.
──────

### 🟡 2. Fluxos Secundários e Administrativos (Muito Recomendados)

Garantem que a experiência de busca e a gestão de usuários e permissões não quebrem:

# │ Teste E2E │ O que o teste faz no navegador

────┼──────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────
06 │ Filtros e Busca na Tabela de Tickets │ 1. Na tabela, digita no campo de busca (ex: "financeiro").2. Valida se a lista filtrou
│ │ apenas os chamados correspondentes.3. Aplica o filtro de status "Aberto" e confere o
│ │ resultado.4. Clica em limpar filtros e confere se a lista voltou ao normal.
07 │ Cadastro de Novo Usuário (Register) │ 1. Acessa /register.2. Preenche nome, email, senha e confirmação de senha.3. Clica em
│ │ cadastrar.4. Verifica o toast/mensagem de sucesso e redirecionamento para o login.
08 │ Gestão de Usuários (Apenas Admin) │ 1. Logado como Admin, clica no menu "Usuários" (/usuarios).2. Clica no botão de editar
│ │ papel de um usuário.3. Altera a permissão de USER para AGENT e confirma.4. Verifica se a
│ │ tag do usuário na lista mudou para "Agente".
09 │ Controle de Acesso por Papel (RBAC) │ 1. Loga como CLIENT.2. Garante que o menu "Usuários" não aparece na barra lateral.3. Se
│ │ tentar forçar a URL /usuarios na barra de navegação, deve ser bloqueado ou
│ │ redirecionado.
10 │ Chat com IA / Assistente │ 1. Abre o componente de chat.2. Digita uma dúvida (ex: "Como redefinir minha senha?") e
│ │ envia.3. Aguarda o balão de resposta da IA aparecer no histórico de mensagens.
──────# chamou-suporte
