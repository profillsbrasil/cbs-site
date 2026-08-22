---
target: home (src/app/page.tsx)
total_score: 24
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 1
timestamp: 2026-08-21T13-05-31Z
slug: src-app-page-tsx
---
Method: dual-agent (A: design review · B: detector + browser)

## Design Health Score

| # | Heurística | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibilidade do status | 2 | Coluna direita do hero fica vazia 3–5s enquanto o WebGL monta; sem skeleton |
| 2 | Match com mundo real | 3 | Vocabulário do domínio correto; "CD" explicado no hero antes de virar sigla |
| 3 | Controle e liberdade | 3 | Único "voltar ao topo" é o logo (`aria-label`), affordance pouco óbvia |
| 4 | Consistência e padrões | 3 | H2 das estações passa por baixo da navbar sticky durante o scroll |
| 5 | Prevenção de erro | 3 | Sem inputs; links externos com `rel="noopener"` |
| 6 | Reconhecimento vs. lembrança | 4 | Todo CTA com ícone + rótulo; dica de scroll explícita |
| 7 | Flexibilidade e eficiência | n/a | Landing de ação única |
| 8 | Estética e minimalismo | 3 | Microbolhas ambiente lêem como pontos cinza, não como vidro |
| 9 | Recuperação de erro | 3 | Site estático, sem estados de erro |
| 10 | Ajuda e documentação | n/a | Landing institucional |
| **Total** | | **24/32** | **75% — Bom** |

## Design Specificity Verdict

**LLM:** autoral. A especificidade mora toda na camada "Bolha-Pacote": `Scene3D` fixo lendo âncoras DOM (`page.tsx:127-132`, `196-231`), caixa PBR com fita CBS, `journeyProgress` único sincronizando 3D e `LiquidPath`. Ressalva: o esqueleto textual (headline + 2 CTAs, 3 blocos título+parágrafo, CTA final) é genérico B2B — abaixo de 1024px, onde a coreografia desliga, sobra esse esqueleto.

**Detector:** CLI `detect.mjs` sobre `src/app` + `src/components`: 0 findings (exit 0). Em runtime (detect.js injetado na página): 2 achados, ambos falsos positivos — `clipped-overflow-container` em `main.overflow-x-clip` (intencional: impede scroll horizontal da faixa `.road` full-bleed) e `ai-color-palette` "cyan gradient" em `div.road` (`index.css:103` — é navy com tracejado aqua, tokens de marca, não gradiente genérico).

**Overlays:** visíveis na aba **[Human] CBS** (tabId 134231668) no Chrome. Console: `[impeccable] 2 anti-patterns found`.

Concordância A×B: o detector não pegou nenhum dos problemas reais (hero vazio, overlap da navbar, contraste da dica de scroll) — todos são defeitos de runtime/tempo que só o review visual vê. Evidência objetiva de B confirma base sólida: 0 erros de console, 1 `<img>` com alt, h1 único + 4 h2, 8 links todos com nome acessível.

## Overall Impression

Uma landing institucional com direção visual rara e disciplina de sistema acima da média — mas os dois defeitos visíveis (vazio do hero, título sob a navbar) batem exatamente no objetivo do produto: convencer quem pesquisa "CBS" de que a empresa é séria, sem nenhuma prova social para compensar. Maior oportunidade: cobrir o tempo de boot do WebGL.

## What's Working

1. **Sincronização 3D↔DOM por âncoras + `journeyProgress` único** — caixa e traço SVG nunca dessincronizam.
2. **Fallback de movimento é real**: `useJourneyActive` desliga a coreografia <1024px e com `prefers-reduced-motion`; `Reveal` vira fade puro.
3. **Disciplina de forma**: raio binário, zero `box-shadow` em conteúdo, névoa sempre do lado do 3D.

## Priority Issues

**[P1] Hero renderiza vazio por 3–5s sem sinal de carregamento**
- Por que importa: primeira impressão de quem acabou de pesquisar "CBS" depois de uma cotação; espaço em branco ao lado do headline lê como página quebrada.
- Fix: placeholder estático (bolha em CSS/SVG leve ou silhueta blur) enquanto o `Canvas` monta, cross-fade para o WebGL quando pronto.
- Comando: `/impeccable harden`

**[P2] H2 das estações fica cortado sob a navbar sticky durante o scroll**
- Por que importa: confirmado em screenshot ("Fábricas onde o" some atrás do wordmark); mecanismo vale para as 3 estações. Defeito de polimento pesa dobrado sem prova social.
- Fix: `scroll-margin-top` ≈ 73px nos H2 ou reduzir z/opacidade da navbar no overlap.
- Comando: `/impeccable layout`

**[P2] Zero reasseguramento no CTA de WhatsApp**
- Por que importa: único caminho de conversão, sem prova social por decisão de produto; o clique mais arriscado (sair do site) depende só do rótulo.
- Fix: microcópia abaixo do par de CTAs (hero e Chegada): "Resposta direto com quem produz, sem formulário."
- Comando: `/impeccable clarify`

**[P3] 7 chips de praça num único grupo**
- Por que importa: informativo, não decisório — risco baixo, mas quebra o chunking ≤4 do resto da página.
- Fix: 2 linhas por região ou rótulo agregador.
- Comando: `/impeccable layout`

**[P3] Microbolhas ambiente lêem como ruído cinza plano**
- Por que importa: competem visualmente sem reforçar a metáfora de vidro.
- Fix: revisar material/opacidade mínima das 34 microbolhas em `scene3d.tsx` em resolução real.
- Comando: `/impeccable polish`

## Cognitive Load

1 falha de 8 (chunking: 7 chips). Nenhum ponto de decisão com >4 opções. Carga baixa.

## Emotional Journey

Peak = estouro da bolha no primeiro scroll; End = caminhão na doca + "Pronto para vender." — bom peak-end. Vale = hero vazio antes do peak. Reasseguramento no clique do WhatsApp: ausente.

## Persona Red Flags

**Jordan (first-timer):** o vazio de 3–5s é o gatilho de "não carregou"; nada avisa que "Chamar no WhatsApp" abre app externo.

**Riley (stress tester):** rolando contínuo bate no overlap navbar/H2; percebe o payload WebGL sem progresso em conexão lenta.

**Casey (mobile):** a coreografia inteira é desligada <1024px — a direção visual aprovada é invisível para ele; vê só a bolha estática do hero. Mobile não foi verificado visualmente (resize_window não redimensionou a janela no WM; análise por código).

**Gulberto (contratante que cotou):** ordem dos argumentos bate com a prioridade do cliente; mas sem CNPJ/endereço/"sobre", qualquer defeito de polimento pesa proporcionalmente mais porque não há prova social compensando.

## Minor Observations

- Telefone repetido como string solta no rodapé (`page.tsx:261`) em vez de derivar de `WHATSAPP_URL`.
- DESIGN.md ainda cita `public/cbs-logo.jpeg`; o código usa `cbs-logo.png` (`page.tsx:71`) — doc desatualizada (não corrigido neste run).
- Dica de scroll `text-brand-navy/50` (`page.tsx:134`): contraste ~3.3:1, abaixo de AA 4.5:1.
- Detector: `clipped-overflow-container` e `ai-color-palette` em `.road` são falsos positivos (ver acima).

## Questions to Consider

1. O vazio de 3–5s comunica "carregando" ou "site quebrado" para quem está checando se a empresa é séria?
2. Se a maioria do tráfego institucional + WhatsApp no Brasil é mobile, a "Bolha-Pacote" é a experiência real ou a exceção?
3. Que reasseguramento textual substitui a prova social ausente sem inventar números?
