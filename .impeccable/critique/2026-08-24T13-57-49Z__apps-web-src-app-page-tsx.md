---
target: site inteiro + footer
total_score: 22
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 3
timestamp: 2026-08-24T13-57-49Z
slug: apps-web-src-app-page-tsx
---
Method: dual-agent (A: workflow wf_9cc0d134-cfb/A:design-review · B: workflow wf_9cc0d134-cfb/B:detector)

## Design Health Score (modo Persuade)

| # | Heurística | Nota | Issue principal |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Scroll-spy só no desktop; no mobile a nav é `hidden md:flex` — 5.220 px sem indicador |
| 2 | Match System / Real World | 3 | "CD" aparece 4× e nunca é expandido; "saneantes" nunca vira "produtos de limpeza" |
| 3 | User Control and Freedom | 3 | Sem "voltar ao topo" visível no mobile |
| 4 | Consistency and Standards | 2 | Três linguagens de render (vidro PBR, SVG laranja, furgão); rodapé quebra CTA/foco/nova-aba |
| 5 | Error Prevention | 3 | `<object>` da malha sem fallback |
| 6 | Recognition Rather Than Recall | 3 | Chips e pontos do mapa em colunas opostas |
| 7 | Flexibility and Efficiency | n/a | Persuade, caminho único |
| 8 | Aesthetic and Minimalist Design | 3 | Estação malha sobrecarregada; vazios de ~250 px (modelo) e ~224 px (fecho mobile) |
| 9 | Error Recovery | 2 | Toda falha é silenciosa; sem plano B se `wa.me` não abrir |
| 10 | Help and Documentation | n/a | Uma página, sem tarefa |
| **Total** | | **22/32** | **68,8% — Acceptable, encostado em Good** |

## Veredito de especificidade

Autoral, com um enxerto genérico no meio e um rodapé intercambiável no fim. A jornada Bolha-Pacote é implementada (journeyProgress único, grupos 3D ancorados no DOM), não ilustrada. A estação malha (`warehouse-delivery.svg`, laranja fora da paleta, estoura a bolha, cobre SP/MG no mapa) é o único trecho que caberia em qualquer landing de logística. O rodapé tem zero caráter de produto.

Scan determinístico: 6 findings (2 warning, 4 advisory). Falsos positivos: `broken-image` page.tsx:139 (é um comentário), `side-tab` index.css:255 (meio-fio horizontal do asfalto). Genuínos: `#24384d`/`#0a1520` (gradiente do asfalto, sem token nem prosa no DESIGN.md), `#a5d3e8` (vidro do van, drift de `brand-aqua`), `#f0f9fc` (documentado em prosa, não em token). Overlay ao vivo confirmou os mesmos 6. Console e rede limpos.

## Pontos fortes

1. Coreografia como arquitetura: um único `journeyProgress`, cena 3D sem layout próprio.
2. Copy sem prova fabricada; "O rótulo é seu; a responsabilidade técnica é nossa."
3. `CtaReassurance` desarma o medo de virar lead antes do clique.

## Issues prioritárias

- [P1] Rodapé não fecha a jornada nem entrega credencial (148 px, 0 botões, 0 logo, gmail pessoal). Fix: recuperar a IA do commit 06833a4 sem foam-bg/anchor espuma. Comando: /impeccable shape → polish.
- [P1] Estação malha viola Envelope de Bolha, Nanquim e Branco Dominante. Fix: usar `Fabrica` (fabrica.tsx) ou redesenhar o SVG na paleta e contê-lo na bolha; mover `data-j-anchor="malha"` fora do mapa. Comando: /impeccable colorize + layout.
- [P1] Sem opengraph-image, sitemap, robots, JSON-LD — link no WhatsApp não gera card. Fix: skill nextjs-seo.
- [P2] `<object aria-hidden>` e `<canvas>` são focáveis (WCAG 4.1.2). Fix: `tabIndex={-1}`. Comando: /impeccable harden.
- [P2] Navbar-cápsula com frames intermediários quebrados (links flutuando sobre a bolha; cápsula vazia) e fundo /65 lamacento sobre títulos. Comando: /impeccable animate.

## Red flags por persona

- Jordan: "CD" e "saneantes" sem tradução; nenhuma resposta a "o que vocês fabricam?", lote mínimo, prazo.
- Riley: chips de praça com hover de botão que não fazem nada; 2 tab stops invisíveis; `/robots.txt` 404; rodapé sem `focus-visible`.
- Casey (mobile): bolha do hero abaixo da dobra; coreografia desligada <1024 px; 224 px vazios no fecho; zero navegação.
- Marcos (contratante do PRODUCT.md): sem preview no WhatsApp; vai ao rodapé e encontra gmail e "ANVISA" sem nº de AFE; "6 a 7 unidades" soa impreciso.

## Observações menores

`--font-geist-sans` morto; contraste do rodapé /60 = 4,55:1 (margem 0,05); logo PNG 126 KB sem SVG; `<object>` 251 KB carrega no mobile sem uso; `Chegada` sem `id`; CTAs vivem inline em page.tsx e o rodapé não consegue reusá-los.

## Footer (capítulo)

Hoje: 148 px desktop / 244 px mobile, 12 palavras, 2 links de texto sem sublinhado/ícone/focus-visible/sr-only de nova aba, `bg-white` sobre `#fafbfc` (1,5% de luminância — elevação invisível), `z-20` tampando o canvas (as microbolhas morrem na borda), asfalto quase-preto encostando em branco puro sem mediação, LiquidPath preso ao `<main>` terminando no ar. Peak em Chegada, vale no rodapé: o fim contradiz a página.

Duas leituras: (A) o rodapé é o interior do CD, com cena 3D própria (+467 linhas, já revertido uma vez); (B) o rodapé são os créditos, fora do mundo mas na gramática da marca. Recomendação: B, com microbolhas atravessando por baixo.

Checklist: logo ≥40 px; razão social; CNPJ e cidade/UF (pedir ao cliente); ANVISA com slot de nº de AFE + SeloAnvisa; copyright; e-mail em domínio próprio; CtaWhatsApp pílula + CtaEmail + CtaReassurance; voltar ao topo; nav Modelo/Qualidade/Malha (única navegação no mobile); sem fundo sólido; raio binário; sem box-shadow; separadores navy/8–10; extrair CTAs para components/; /60 → /70; resolver emenda asfalto→rodapé e fim do LiquidPath.

## Perguntas

1. Qual é a versão mobile deliberada da tese, não a degradação?
2. E se a caixa continuasse e o rodapé fosse o interior do CD?
3. As microbolhas morrerem no rodapé é decisão ou acidente?
4. O argumento de frete tem número autorizável?
5. O que a CBS fabrica? Uma linha de categorias resolveria.
6. Se só o rodapé fosse visto, daria para dizer o que a CBS faz?
