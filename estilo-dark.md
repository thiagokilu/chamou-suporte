# Guia de estilo – Modo escuro (Dark) | Chamou

Complemento do `ESTILO.md`. Tudo que não está aqui (tipografia, espaçamento, raios, ícones, voz e texto) continua **igual** ao modo claro. Este documento define só o que muda no escuro.

Stack: Next.js (App Router), Tailwind CSS.

---

## 1. Princípios do modo escuro

1. **O verde continua sendo a identidade.** O fundo é um preto esverdeado, não cinza neutro, para manter a marca presente.
2. **Verde vivo para ação.** No escuro, o verde profundo `#15803D` perde presença como cor de texto e de links. Quem assume a ação é o verde-claro `#34D399`, o mesmo já usado no botão "Novo chamado" da lateral.
3. **Profundidade por camadas de cor e bordas, não por sombras.** Sombras quase não aparecem no escuro. Superfícies mais claras indicam o que está "acima".
4. **Sem branco puro.** Texto principal em tom esverdeado claro, para não ofuscar. Sem preto puro (`#000`) no fundo.
5. **Contraste primeiro.** Todo par texto/fundo abaixo foi escolhido para passar de 4,5:1 (texto comum) ou 3:1 (elementos de interface).

---

## 2. Cores

### Fundos e superfícies

| Nome | Hex | Uso |
|---|---|---|
| Fundo da página | `#0C1B14` | Fundo geral |
| Superfície | `#12261C` | Cartões, painéis, header |
| Superfície elevada | `#183226` | Balões recebidos, menus suspensos, modais, hover de linhas |
| Lateral e rodapé | `#0A2A1D` | Sidebar e footer (verde mais fechado que o fundo) |

### Linhas

| Nome | Hex | Uso |
|---|---|---|
| Linha | `#234134` | Bordas de cartões, header, divisores principais |
| Linha suave | `#1B3328` | Divisores internos de listas |
| Linha da lateral | `#1F4A36` | Borda direita da sidebar |

### Texto

| Nome | Hex | Uso | Contraste sobre `#0C1B14` |
|---|---|---|---|
| Texto principal | `#E8F3EC` | Títulos e texto de leitura | ~15:1 |
| Texto secundário | `#9DB5A7` | Descrições, rótulos, navegação | ~8:1 |
| Texto desativado | `#6B8576` | Campos e botões desativados (nunca para informação importante) | Decorativo |

### Verdes

| Nome | Hex | Uso |
|---|---|---|
| Ação | `#34D399` (emerald-400) | Botão primário (fundo), links, linha de progresso, foco ativo |
| Ação (hover) | `#6EE7B7` (emerald-300) | Hover do botão primário, anel de foco |
| Texto sobre ação | `#062416` | Texto dentro do botão primário (~8,7:1 sobre `#34D399`) |
| Verde de apoio | `#A7F3D0` (emerald-200) | Texto do botão contorno, ícones destacados |
| Verde translúcido | `#34D399` a 15% | Fundo de ícones, selos e hover suave |
| Verde da marca | `#15803D` | Balão enviado (com texto branco, ~5:1) |

### Prioridades (versão translúcida, sempre com texto)

| Prioridade | Classes Tailwind |
|---|---|
| Baixa | `bg-emerald-400/15 text-emerald-200` |
| Média | `bg-sky-400/15 text-sky-200` |
| Alta | `bg-amber-400/15 text-amber-200` |
| Urgente | `bg-rose-400/15 text-rose-200` |

### Ação destrutiva

`hover:bg-red-950/40 hover:text-red-400`. Confirmações de exclusão usam `bg-red-500` com texto branco.

---

## 3. Tokens (recomendado)

Centralizar as cores em variáveis evita repetir `dark:` em cada componente e deixa o tema trocar em um só lugar.

```css
:root {
  color-scheme: light;
  --ch-bg: #F5F7F4;
  --ch-surface: #FFFFFF;
  --ch-surface-raised: #F2F6F3;
  --ch-side: #0F3D2A;
  --ch-line: #D8E1DA;
  --ch-line-soft: #E6ECE7;
  --ch-ink: #10241A;
  --ch-muted: #4B5E54;
  --ch-action: #15803D;
  --ch-action-hover: #116A32;
  --ch-on-action: #FFFFFF;
  --ch-tint: #DDF3E4;
  --ch-focus: #15803D;
}

.dark {
  color-scheme: dark;
  --ch-bg: #0C1B14;
  --ch-surface: #12261C;
  --ch-surface-raised: #183226;
  --ch-side: #0A2A1D;
  --ch-line: #234134;
  --ch-line-soft: #1B3328;
  --ch-ink: #E8F3EC;
  --ch-muted: #9DB5A7;
  --ch-action: #34D399;
  --ch-action-hover: #6EE7B7;
  --ch-on-action: #062416;
  --ch-tint: rgb(52 211 153 / 0.15);
  --ch-focus: #6EE7B7;
}

::selection {
  background: #34D399;
  color: #062416;
}
```

`color-scheme: dark` faz o navegador desenhar barras de rolagem, campos e controles nativos já escuros.

Uso nos componentes:

```tsx
// Fundo e texto da página
<div className="bg-[var(--ch-bg)] text-[var(--ch-ink)]">

// Cartão
<div className="rounded-2xl border border-[var(--ch-line)] bg-[var(--ch-surface)]">

// Botão primário (claro e escuro com as mesmas classes)
<a className="rounded-lg bg-[var(--ch-action)] px-5 py-2.5 text-sm font-semibold text-[var(--ch-on-action)] transition-colors hover:bg-[var(--ch-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ch-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ch-bg)]">
  Entrar
</a>
```

---

## 4. Como ativar o escuro

### Opção A – Seguir o sistema (mais simples)

Sem configuração extra: o Tailwind aplica `dark:` quando o sistema do usuário está no escuro. Se for usar as variáveis acima, troque `.dark` por:

```css
@media (prefers-color-scheme: dark) {
  :root { /* mesmos valores de .dark */ }
}
```

### Opção B – Botão manual (claro / escuro / sistema)

1. Configure o Tailwind para usar a classe `dark`:
   - **Tailwind v3:** `darkMode: "class"` em `tailwind.config`.
   - **Tailwind v4:** no CSS global, `@custom-variant dark (&:where(.dark, .dark *));`
2. Evite o "flash" de tema errado ao carregar, com um script no `<head>` do `app/layout.tsx`:

```tsx
<html lang="pt-BR" suppressHydrationWarning>
  <head>
    <script
      dangerouslySetInnerHTML={{
        __html: `try{var t=localStorage.getItem("chamou:tema");var d=t==="dark"||((!t||t==="system")&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}`,
      }}
    />
  </head>
  <body>{children}</body>
</html>
```

3. Botão para alternar:

```tsx
"use client";

import { useEffect, useState } from "react";
import { LuMoon, LuSun } from "react-icons/lu";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("chamou:tema", next ? "dark" : "light");
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Mudar para o modo claro" : "Mudar para o modo escuro"}
      className="rounded-md p-2 text-[var(--ch-muted)] transition-colors hover:bg-[var(--ch-surface-raised)] hover:text-[var(--ch-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ch-focus)]"
    >
      {dark ? <LuSun className="size-5" aria-hidden="true" /> : <LuMoon className="size-5" aria-hidden="true" />}
    </button>
  );
}
```

Onde colocar: no header público (ao lado de **Entrar**) e na página de **Configurações** do dashboard.

---

## 5. Componentes: do claro para o escuro

| Componente | Claro | Escuro |
|---|---|---|
| Fundo da página | `#F5F7F4` | `#0C1B14` |
| Cartão | `bg-white` + borda `#D8E1DA` | `#12261C` + borda `#234134` |
| Título | `#0F3D2A` | `#E8F3EC` |
| Texto secundário | `#4B5E54` | `#9DB5A7` |
| Botão primário | fundo `#15803D`, texto branco | fundo `#34D399`, texto `#062416` |
| Botão contorno | borda `#15803D`, texto `#0F3D2A`, hover `#DDF3E4` | borda `#34D399`, texto `#A7F3D0`, hover `#34D399` a 10% |
| Quadrado de ícone | `#DDF3E4` + ícone `#0F3D2A` | `#34D399` a 15% + ícone `#6EE7B7` |
| Divisores de lista | `#E6ECE7` | `#1B3328` |
| Balão recebido | `#F2F6F3` | `#183226` |
| Balão enviado | `#15803D`, texto branco | `#15803D`, texto branco |
| Etiquetas de prioridade | `-100` com texto `-900` | `/15` translúcido com texto `-200` |
| Header | `#F5F7F4` a 95% + blur | `#0C1B14` a 90% + blur, borda `#234134` |
| Rodapé | `#0F3D2A` | `#0A2A1D` + borda superior `#234134` |
| Anel de foco | `#15803D` | `#6EE7B7` (com `ring-offset` na cor do fundo) |

### Sidebar

A sidebar já é escura no modo claro, então muda pouco:

- Fundo passa de `#0F3D2A` para `#0A2A1D`, com borda direita `#1F4A36` para separar do conteúdo escuro.
- Item ativo continua `bg-emerald-50 text-[#0F3D2A]` (bloco claro de alto contraste).
- Item padrão, hover, selo, "Novo chamado", cartão de usuário e tooltips ficam **iguais**.
- Tooltip: fundo `#031A10` com `ring-1 ring-white/10`.

### Cartão de chamado da landing

- Bloco deslocado atrás do cartão: de `#0F3D2A` para `#1F4A36`.
- Linha de progresso: trilho `#234134`, preenchimento `#34D399`. Nós concluídos em `#34D399` com ícone `#062416`.
- Mesma animação única de entrada, sem mudança.

### Campos de formulário

| Estado | Estilo |
|---|---|
| Padrão | `bg-[#12261C] border-[#234134] text-[#E8F3EC]`, placeholder `#6B8576` |
| Hover | borda `#2F5A47` |
| Foco | borda `#34D399` + anel `#6EE7B7` a 40% |
| Erro | borda `#FB7185`, mensagem `#FDA4AF` com ícone |
| Desativado | `bg-[#0F2119]`, texto `#6B8576` |

---

## 6. Profundidade e elevação

Sem sombras fortes. A elevação vem da cor da superfície:

| Camada | Cor |
|---|---|
| 0 – Página | `#0C1B14` |
| 1 – Cartões e painéis | `#12261C` |
| 2 – Menus suspensos, balões, linhas em hover | `#183226` |
| 3 – Modais e popovers | `#183226` + borda `#2F5A47` + fundo escurecido atrás (`bg-black/60`) |

Sempre acompanhe a camada mais alta de uma borda de 1px, para separar superfícies de tons próximos.

---

## 7. Imagens, ilustrações e gráficos

- Logo sobre fundo escuro: marca `#34D399` com balão `#0F3D2A` (a versão clara usada na sidebar) e texto branco.
- Imagens e capturas de tela: `rounded-xl` com `ring-1 ring-white/10`, para não "sumirem" no fundo.
- Gráficos do painel de controle: eixos e grades em `#234134`, rótulos em `#9DB5A7`, série principal em `#34D399`. Nunca use só cor para separar séries: acrescente rótulos, formas ou texturas.

---

## 8. Acessibilidade no escuro

- Contraste mínimo: 4,5:1 para texto comum e 3:1 para bordas de campos, ícones e anéis de foco. Valide os pares novos antes de usar.
- Foco sempre visível: `#6EE7B7` com `ring-offset` na cor do fundo.
- Respeite `prefers-color-scheme` quando o usuário não escolheu manualmente (opção "sistema").
- Respeite `prefers-reduced-motion` ao trocar de tema: sem transição animada de cores ao alternar.
- Evite texto branco puro sobre fundo escuro em parágrafos longos; use `#E8F3EC`.
- Prioridade e status continuam com texto, nunca só cor.

---

## 9. Checklist antes de publicar uma tela

- [ ] Testada nos dois temas, em mobile e desktop.
- [ ] Nenhuma cor fixa de modo claro (`bg-white`, `text-zinc-900`) sobrando; use as variáveis.
- [ ] Sem `#000` e sem `#FFF` puros.
- [ ] Bordas visíveis entre superfícies de tons próximos.
- [ ] Foco visível em todos os elementos interativos.
- [ ] Imagens e logos legíveis sobre o fundo escuro.
- [ ] Sem flash de tema errado ao recarregar a página.