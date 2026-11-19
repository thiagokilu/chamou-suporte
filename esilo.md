# Guia de estilo – Chamou | Suporte de TI

Este documento descreve o estilo visual usado na landing page e na sidebar. Use-o como referência para manter novas telas (dashboards, formulários, modais) com a mesma identidade.

Stack: Next.js (App Router), Tailwind CSS, `next/font/google`, `react-icons/lu`.
Idioma da interface: português brasileiro (PT-BR).

---

## 1. Princípios

1. **Verde é a identidade.** Um verde profundo para estrutura e um verde vivo para ação.
2. **Um único elemento memorável por tela.** Na landing, é o cartão de chamado com a barra de progresso. No dashboard, é a lateral verde-escura. O resto fica quieto e disciplinado.
3. **Estrutura carrega informação.** Bordas, divisores e etiquetas só aparecem quando indicam algo (status, prioridade, agrupamento). Sem decoração gratuita.
4. **Tom claro e direto.** Verbos simples, frases em sentido de frase (só a primeira letra maiúscula), sem enfeite.
5. **Acessível por padrão.** Foco visível, contraste adequado, `prefers-reduced-motion` respeitado, rótulos para leitores de tela.

---

## 2. Cores

### Paleta principal

| Nome | Hex | Uso |
|---|---|---|
| Verde profundo | `#0F3D2A` | Títulos, lateral, rodapé, texto sobre fundos claros |
| Verde de ação | `#15803D` | Botão primário, foco, linhas de progresso |
| Verde de ação (hover) | `#116A32` | Hover do botão primário |
| Menta | `#DDF3E4` | Fundo de ícones, hover do botão contorno, avatares |
| Fundo da página | `#F5F7F4` | Fundo geral (claro) |
| Tinta | `#10241A` | Texto principal |

### Apoio

| Nome | Hex | Uso |
|---|---|---|
| Texto secundário | `#4B5E54` | Descrições, rótulos, navegação |
| Texto de parágrafo | `#3F5248` | Parágrafos de destaque (hero) |
| Linha | `#D8E1DA` | Bordas de cartões e do header |
| Linha suave | `#E6ECE7` | Divisores internos de listas |
| Superfície suave | `#F2F6F3` | Balões de mensagem recebida |
| Verde mais escuro | `#0A2A1D` | Texto sobre verde-claro, tooltips |
| Verde-claro de destaque | `#34D399` (emerald-400) | Botão "Novo chamado" e selos na lateral |
| Verde-claro (hover) | `#6EE7B7` (emerald-300) | Hover do destaque, anel de foco sobre fundo escuro |
| Verde quase branco | `#ECFDF5` (emerald-50) | Item ativo e texto na lateral |

### Prioridades

Sempre acompanhadas do texto (nunca só cor).

| Prioridade | Classes Tailwind |
|---|---|
| Baixa | `bg-emerald-100 text-emerald-900` |
| Média | `bg-sky-100 text-sky-900` |
| Alta | `bg-amber-100 text-amber-900` |
| Urgente | `bg-rose-100 text-rose-900` |

### Ação destrutiva

Sair e excluir usam vermelho só no hover/estado de confirmação (`hover:bg-red-50 hover:text-red-700` no claro).

### Tokens (opcional, para centralizar)

```css
:root {
  --ch-green-deep: #0F3D2A;
  --ch-green: #15803D;
  --ch-green-hover: #116A32;
  --ch-mint: #DDF3E4;
  --ch-bg: #F5F7F4;
  --ch-ink: #10241A;
  --ch-muted: #4B5E54;
  --ch-line: #D8E1DA;
  --ch-line-soft: #E6ECE7;
  --ch-accent: #34D399;
}
```

---

## 3. Tipografia

Duas famílias, bem distintas, carregadas com `next/font/google`.

| Papel | Fonte | Pesos |
|---|---|---|
| Títulos e marca | **Bricolage Grotesque** | 600, 700, 800 |
| Texto de interface | **Public Sans** | 400, 500, 600 |

```tsx
import { Bricolage_Grotesque, Public_Sans } from "next/font/google";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "700", "800"], display: "swap" });
const body = Public_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });
```

### Escala

| Elemento | Classes |
|---|---|
| Título do hero | `text-[2.75rem] sm:text-6xl lg:text-7xl font-extrabold leading-[1.02] tracking-tight` (display) |
| Título de seção | `text-3xl sm:text-4xl font-bold leading-tight tracking-tight` (display) |
| Título de item/cartão | `text-lg` ou `text-xl font-bold` (display) |
| Parágrafo de destaque | `text-lg leading-relaxed` |
| Texto de interface | `text-sm font-medium` |
| Texto auxiliar | `text-xs font-medium` |

Regras:
- Linhas de texto com no máximo ~80 caracteres (`max-w-sm`, `max-w-[34rem]`).
- Evite caixa alta em rótulos e evite destacar só uma palavra de um título com cor ou itálico.
- Use `tabular-nums` em números de contagem (selos).

---

## 4. Espaçamento, formas e bordas

- Container: `mx-auto w-full max-w-6xl px-4 sm:px-6`.
- Seções: `py-16 lg:py-24`. Hero: `pt-12 sm:pt-16 lg:pt-24`.
- Raios por hierarquia (não use o mesmo em tudo):
  - Botões e itens de menu: `rounded-lg`
  - Cartões grandes: `rounded-2xl`
  - Cartão de usuário e balões: `rounded-xl`
  - Selos e etiquetas: `rounded-full`
- Bordas: `border border-[#D8E1DA]` em cartões; divisores internos em `#E6ECE7`.
- Sombras: evitadas. Profundidade vem de um bloco verde deslocado atrás do cartão (`translate-x-3 translate-y-3 bg-[#0F3D2A]`) e de contraste de cor.

---

## 5. Componentes

### Botões

```tsx
const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#15803D]";

// Primário
const btnPrimario = `inline-flex items-center justify-center rounded-lg bg-[#15803D] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#116A32] ${focus}`;

// Contorno
const btnContorno = `inline-flex items-center justify-center rounded-lg border border-[#15803D] px-5 py-2.5 text-sm font-semibold text-[#0F3D2A] transition-colors hover:bg-[#DDF3E4] ${focus}`;
```

- Use `Link` estilizado como botão para navegação (não coloque `<button>` dentro de `<Link>`).
- Rótulos dizem exatamente o que acontece: **Entrar**, **Criar conta**, **Novo chamado**, **Sair**.
- Botões de hero: `!px-7 !py-3 text-base`. No mobile, empilhados em coluna.

### Header (público)

- `sticky top-0`, fundo `#F5F7F4/95` com `backdrop-blur`, borda inferior `#D8E1DA`, altura `h-16`.
- Logo à esquerda, navegação no centro (`md:` em diante), **Entrar** (contorno) e **Criar conta** (primário) à direita.

### Cartão de chamado (elemento de destaque da landing)

- Cartão branco `rounded-2xl` com borda, sobre bloco `#0F3D2A` deslocado.
- Cabeçalho: número do chamado + etiqueta de prioridade.
- Linha de progresso em 3 etapas: **Aberto → Em atendimento → Resolvido**.
- Conversa curta: balão recebido em `#F2F6F3`, balão enviado em `#15803D` com texto branco.

### Lista de funcionalidades

- Duas colunas em `lg`: título fixo à esquerda (`lg:sticky lg:top-28`), lista à direita.
- Cada item: ícone em quadrado menta (`bg-[#DDF3E4]`, `rounded-xl`, 44px) + título + descrição, separados por `divide-y`.
- Sem cartões idênticos repetidos.

### Rodapé

- Fundo `#0F3D2A`, texto `emerald-50` / `emerald-100/80`.
- Logo (versão clara), descrição e copyright com o ano atual.

### Sidebar (dashboard)

| Estado | Estilo |
|---|---|
| Fundo | `bg-[#0F3D2A]`, texto `emerald-50` |
| Largura | `w-64` expandida, `lg:w-20` recolhida |
| Item padrão | `text-emerald-50/80 hover:bg-white/10 hover:text-white` |
| Item ativo | `bg-emerald-50 text-[#0F3D2A]` + `aria-current="page"` |
| Botão "Novo chamado" | `bg-emerald-400 text-[#0A2A1D] hover:bg-emerald-300` |
| Selo de contagem | `bg-emerald-400 text-[#0A2A1D]` (invertido no item ativo) |
| Cartão de usuário | `bg-black/20 rounded-xl`, avatar com iniciais em `bg-emerald-100` |
| Tooltip (recolhida) | `bg-[#0A2A1D] text-white rounded-md` |
| Foco | `ring-2 ring-emerald-300` |

Comportamentos:
- No desktop, botão circular na borda recolhe e expande; a escolha fica salva em `localStorage` (`chamou:sidebar-collapsed`).
- A largura é publicada em `--sidebar-w`. O conteúdo usa `lg:pl-[var(--sidebar-w,16rem)]`.
- No mobile e tablet: barra superior verde com botão de menu e gaveta lateral. Fecha com clique no fundo, `Esc` ou ao navegar.
- Estrutura: marca → botão "Novo chamado" → itens principais → (rodapé) itens de conta → cartão de usuário com **Sair**.

### Ícones

- Biblioteca: `react-icons/lu` (Lucide).
- Tamanho padrão: `size-5` (20px) na interface; 24px em blocos de destaque.
- Sempre `aria-hidden="true"`; o texto ou `aria-label` do elemento pai descreve a ação.
- Linha 1.8px, cantos arredondados.

### Logo

- Marca: quadrado arredondado verde com balão de fala branco e exclamação ("Chamou!").
- Texto: **Chamou** (Bricolage Grotesque 800) + **Suporte de TI** (11px, abaixo).
- Sobre fundo claro: marca `#15803D`, texto `#0F3D2A`. Sobre fundo escuro: marca `#34D399`, texto branco.

---

## 6. Movimento

- Movimento sem ação do usuário é raro e deliberado. Na landing há **um único momento**: a barra de progresso do chamado avançando ao carregar a página.
- Movimento em resposta a ação do usuário é bem-vindo: abrir/fechar a gaveta, recolher a lateral (`duration-200`), hover e foco.
- Sempre respeitar `prefers-reduced-motion` (`motion-reduce:transition-none` ou `@media (prefers-reduced-motion: reduce)`).
- Evite entradas "fade e sobe" em cada seção e hover animado em todos os cartões.

---

## 7. Responsividade

| Largura | Comportamento |
|---|---|
| Mobile (`< md`) | Navegação do header oculta, botões compactos, hero em uma coluna, botões empilhados, sidebar como gaveta |
| Tablet (`md`) | Navegação do header visível |
| Desktop (`lg`+) | Hero em duas colunas, funcionalidades em duas colunas, sidebar fixa e recolhível |

Conteúdo ao lado da sidebar: `pt-14 lg:pt-0 lg:pl-[var(--sidebar-w,16rem)]`.

---

## 8. Acessibilidade

- Foco visível em tudo que é interativo (`focus-visible:ring-2`).
- Anel de foco: `#15803D` sobre fundo claro, `emerald-300` sobre fundo escuro.
- `aria-current="page"` no item ativo do menu.
- `aria-label` em botões só com ícone e em itens quando a lateral está recolhida.
- `aria-expanded` e `aria-controls` no botão que abre a gaveta; `aria-pressed` no botão de recolher.
- Prioridade e status nunca dependem só de cor: sempre há texto.
- Contraste: texto branco sobre `#15803D` e texto `#10241A` sobre `#F5F7F4` atendem WCAG AA.

---

## 9. Voz e texto da interface

- Português brasileiro, frases curtas, verbos no imperativo claro.
- Sentence case: só a primeira letra maiúscula (**Novo chamado**, **Gestão de prioridades**).
- Cada ação mantém o mesmo nome em todo o fluxo: o botão "Entrar" leva a uma tela "Entrar".
- Chame as coisas pelo nome que o usuário entende: **chamado**, **atendimento**, **prioridade**. Evite termos técnicos internos.
- Erros dizem o que aconteceu e como resolver, sem pedir desculpas nem usar tom dramático.
- Estados vazios convidam a agir: "Você ainda não tem chamados. Abra o primeiro."

### Vocabulário fixo

| Use | Evite |
|---|---|
| Chamado / Ticket (só em menus já existentes) | Solicitação genérica, pedido |
| Entrar | Login, Acessar |
| Criar conta | Cadastrar-se, Registrar |
| Sair | Logout |
| Em atendimento | Em progresso |
| Resolvido | Finalizado, Fechado |

---

## 10. O que evitar

- Cartões idênticos repetidos com a mesma sombra cinza em tudo.
- Degradês decorativos.
- Fundo creme com serifa e terracota, ou preto com verde-ácido (visuais genéricos).
- Rótulos em caixa alta espaçada acima de cada título.
- Numeração (01, 02, 03) em conteúdo que não é uma sequência.
- Setas `→` automáticas em todo botão ou link.
- Misturar raios de borda diferentes sem hierarquia.