---
version: 1
slug: "apps-web-src-app-page-tsx"
primary_target: "apps/web/src/app/page.tsx"
related_targets: []
---

# Home — apps/web/src/app/page.tsx

Modo: Persuade. Público: contratantes (marcas de limpeza que vendem no ML) e quem pesquisa "CBS" após cotação. Ação: chamar no WhatsApp. Prova disponível: modelo claro + praças da malha; zero social proof (não inventar).

Direção escolhida: Bolha-Pacote (comp aprovado `.impeccable/mocks/comp-bolha-pacote.png`, sidecar approved:true). Momento memorável: a bolha do hero estoura no primeiro scroll e a caixa desce a página presa ao caminho líquido, parando em cada seção (escolha B do usuário no companion). Ordem cronológica (escolha A): modelo → qualidade/ANVISA → malha → chegada; frete na sub-headline do hero.

## Inventário de fidelidade (comp → build)

| Ingrediente | Meio |
| --- | --- |
| Bolhas de vidro do hero (aglomerado, caixa dentro da maior) | three.js/R3F, MeshTransmissionMaterial |
| Caixa de papelão com fita azul CBS | three.js (boxGeometry + textura de fita autorada em canvas/SVG) |
| Caminho líquido aqua descendo a página | SVG autorado, desenho por scroll |
| Bolhas de seção (frasco, selo, caminhão) | three.js primitivas estilizadas dentro de bolha de vidro; selo em SVG autorado |
| Poça final | SVG autorado |
| Logotipo CBS | asset real `public/cbs-logo.jpeg` |
| Headline display | Sora (Google Fonts, self-host via next/font) |
| CTA primário | HTML/CSS no vocabulário do mundo (pílula azul #1D9DD8) |
| Greeked bars do comp | substituídos por copy real PT (proposta, refino com cliente) |
| Mapa da malha (Brasil + 7 praças, fundo da estação 3, composição D2) | mapcn `Map blank` + GeoJSON local + `MapMarker`; SVG placeholder/fallback |

Não literalizar: as barras cinzas do comp, a posição exata das bolhas, o "SBS" garbled da fita (usar CBS correto).

Pendências: copy final com Gulberto; logo vetorial.

## Desfecho (2026-08-19)

Revisão de acabamento independente: **ship** após 2 rodadas. Resolvidos: materiais das estações (frasco com rótulo curvo, selo frontal com visto e fitas, caminhão com marca no baú), fita líquida em camadas, lettering Sora nas texturas, cobertura de screenshot completa. Preservar sempre: o vidro das bolhas do hero e a coreografia estoura→viaja (momento autoral da página).

## Mapa da malha (2026-08-21)

Decisões com o usuário via visual companion: dados = só as 7 praças; posição = D (fundo da estação 3); composição = D2. Comps: `.superpowers/brainstorm/662928-1787323468/content/layout-v4.html` e `d-composition.html`. ADR-0001.
Worker do MapLibre self-hosted (ADR-0001).
