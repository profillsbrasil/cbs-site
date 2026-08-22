---
target: home (src/app/page.tsx)
total_score: 23
max_score: 28
na_heuristics: 7,9,10
p0_count: 0
p1_count: 2
timestamp: 2026-08-21T14-29-47Z
slug: src-app-page-tsx
---
Method: dual-agent (A: design review · B: detector + browser) — run #2, após harden/layout/clarify/polish

## Design Health Score

| # | Heurística | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibilidade do status | 3 | Placeholder do hero com cross-fade resolvido; sem indicador de progresso entre estações |
| 2 | Match com mundo real | 4 | Metáfora bolha→caixa→CD mapeia 1:1 o modelo de negócio |
| 3 | Controle e liberdade | 3 | Sem modais; links externos avisados por sr-only; sem pausar animação |
| 4 | Consistência | 3 | Reasseguramento só no hero, faltava na Chegada (corrigido neste run) |
| 5 | Prevenção de erro | 4 | Sem formulário; URL do WhatsApp derivada do número |
| 6 | Reconhecimento | 3 | Praças por região em `<dl>`; sem âncoras entre estações |
| 7 | Flexibilidade | n/a | Persuade |
| 8 | Estética/minimalismo | 3 | 4 seções quase full-viewport para pouco texto |
| 9 | Recuperação de erro | n/a | Superfície só-leitura, sem estado de erro |
| 10 | Ajuda | n/a | Landing institucional |
| **Total** | | **23/28** | **82% — Bom** |

## Design Specificity Verdict

**LLM:** autoral, não intercambiável — a composição inteira está amarrada à história do produto; o risco é de entrega (mobile nunca vê a coreografia), não de composição.

**Detector:** CLI limpo (0). Runtime: 7 ocorrências — `overflow-x-clip` no `main` (intencional), 5× `ai-color-palette` "gradiente ciano" em `.bubble-ghost` ×4 e `.road` (tokens aqua/azul de marca, falso positivo), 1× `dark-glow` no `body` cor `#d97757` (laranja da extensão claude-in-chrome, transitório; `getComputedStyle(body).boxShadow` = none — falso positivo).

**Evidência objetiva:** 0 erros de console; `data-scene-ready` presente e `.hero-placeholder` em opacity 0; `.text-brand-navy/70` sobre paper = 6.28:1 (AA); 1 `<dl>`, 4 `<dt>`, 7 `<dd>`; h1 único + 4 h2. Overlays na aba **[Human] CBS v2** (tabId 134231679).

## Overall Impression

Os defeitos de credibilidade do run #1 (hero vazio, CTA sem contexto, chips em bloco, microbolhas cinza) saíram. O que sobra é contraste de marca: o azul `#1d9dd8` pinado não passa AA nem como texto grande sobre o papel, nem como fundo de hover com texto branco.

## What's Working

1. Motivo autoral coerente ponta a ponta; Regra do Envelope de Bolha respeitada nas estações.
2. Estado de carregamento do WebGL resolvido: `.bubble-ghost` → cross-fade via `data-scene-ready`, sem flash de vazio (verificado em t=0 e t=5s).
3. Higiene de acessibilidade: H1→H2 limpa, nomes acessíveis nos links, foco visível testado via Tab, reduced-motion por animação.

## Priority Issues

**[P1] Contraste no hover dos CTAs e chips** — branco sobre `#1d9dd8` = 3.06:1 (`hover:bg-brand-blue hover:text-white` em CtaWhatsApp, nav CTA, chips). Fix: tom de hover mais escuro até ≥4.5:1, sem tocar a paleta de repouso. → `/impeccable colorize`

**[P1] "nossa fábrica." em `text-brand-blue` sobre paper = 2.95:1** — abaixo até do 3:1 de texto grande. Fix: escurecer levemente o azul de texto (token separado do azul de fita/ícone). → `/impeccable colorize`

**[P2] Reasseguramento ausente na Chegada** — `CtaReassurance` só existia no hero. **Corrigido neste run** (`page.tsx`, bloco de CTAs da Chegada).

**[P2] Sem fallback visual para estações e doca se o WebGL não montar** — só o hero tem `.bubble-ghost`; frasco/selo/caminhão/doca ficam vazios. Fix: replicar silhueta estática nos `data-s-anchor` de `Station`/`Chegada`. → `/impeccable harden`

**[P3] Fita da caixa não lê "CBS" na escala do hero** — só 3 tracinhos; nas estações lê. → `/impeccable polish`

## Cognitive Load

0 falhas de 8. Ressalva: 34 microbolhas em movimento contínuo atrás do texto.

## Emotional Journey

Pico (estouro) acontece antes de qualquer argumento; fim (caminhão na doca) é satisfatório mas mais quieto que a abertura. Estações monótonas em energia. Reasseguramento agora presente nos dois pares de CTA.

## Persona Red Flags

- **Jordan:** "CD" nunca é amarrado explicitamente a "centro de distribuição" na mesma frase.
- **Riley:** teclado e console OK; quebra ao bloquear WebGL (estações sem fallback).
- **Casey (mobile, por código):** coreografia inteira desligada <1024px — a maioria do tráfego provável vê a versão quieta.
- **Gulberto:** frete é prometido primeiro e provado por último (praças na 3ª estação).

## Minor Observations

- `cbs-logo.png` transparente já está em uso; PRODUCT.md/DESIGN.md ainda citam o JPEG.
- Caminhão da doca final aparece sem bolha — confirmar se é exceção intencional à Regra do Envelope.
- Medição de B "link sem nome" em `#topo` é falso positivo: o logo tem `aria-label="Voltar ao topo"` (B leu só textContent).

## Questions to Consider

1. E se o clímax visual coincidisse com o CTA final, depois dos três argumentos?
2. Vale uma versão mobile-nativa do momento autoral em vez de só desativá-lo?
3. Vale adiantar um resumo da malha para perto do hero, para quem chega motivado por frete?
