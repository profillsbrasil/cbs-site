# Home no celular e tablet (< 1024px) — design

Data: 2026-08-31. Superfície: home (`apps/web/src/app/page.tsx`, `navbar.tsx`, `footer.tsx`, `components/home/*`). Modo: Persuade. Refinamento do mundo visual aprovado (Bolha-Pacote), restrito a larguras abaixo de `lg` (1024px) — o desktop e a coreografia de scroll não mudam, com uma exceção declarada (rodapé, ver §6).

## Objetivo

A home foi composta para o desktop e degradada para o celular; o resultado tem cara de improviso: hero com um terço de tela em branco, bolha sobre o título, visual gigante com metade da largura vazia em cada estação, zigue-zague que no celular vira só um deslocamento, e o mesmo par de botões repetido quatro vezes. O objetivo é que a página no celular pareça desenhada para ele, mantendo a identidade do desktop (bolhas de vidro, caixa viajante, papel branco, pílulas) e ficando mais curta.

## Diagnóstico medido (390×844, dev server)

| Medida | Hoje | Causa no código |
| --- | --- | --- |
| Branco morto no 1º viewport do hero | ~35% (conteúdo termina em ~570 de 844px) | `min-h-[100svh]` com `items-start`; nada preenche o resto |
| Sobreposição bolha/título | bolha cobre "fábrica." | bolha `absolute top-14 -right-24` atrás do H1; parágrafo empurrado por `mt-[clamp(1.5rem,20vw,7rem)]` |
| Botões de WhatsApp na página | 4 (navbar, hero, chegada, rodapé), 2 no 1º viewport | `Navbar` sempre com pill; `Footer` repete o par de CTAs |
| H1 / H2 / corpo | 48 / 36 / 16px | `text-5xl` / `text-4xl` sem degrau abaixo de `sm` |
| Altura por estação | 614–644px, ~430px só de bolha | `size-[clamp(13rem,62vw,17rem)]` sangrando, `gap-y-5`, `py-14` |
| Estação da malha | 1.016px | palco `h-[clamp(20rem,88vw,26rem)]` + chips em 4 grupos com rótulo |
| Home inteira | 4.457px (5,3 telas) | soma do acima; rodapé 576px |

Fontes que orientaram as escolhas: NN/g (zigue-zague com imagem decorativa reduz eficiência de leitura; alinhar sempre do mesmo lado), Baymard (70% rolam a home inteira ao chegar), guias de hero mobile (título ≤ 2 linhas, CTA no 1º viewport, hero 50–70% do viewport ou preenchido por conteúdo), escalas de espaçamento (64px entre seções no celular, 96–128 no desktop), tipografia (H1 mobile 32–40px, corpo 16–18px, 50–75 caracteres por linha). Referências de estrutura observadas em mobile: Stripe, Linear, Hajster, Icomat — importou-se a ordem de empilhamento e o ritmo, não a paleta (o branco dominante é decisão pinada do dono).

## Decisões já tomadas com o usuário

Mocks de referência em `.superpowers/brainstorm/81296-1788183718/content/` (`01-diagnostico.html` … `05-cta-navbar.html`), renderizados com Sora/Inter, tokens da marca e recortes reais das bolhas.

| Decisão | Escolha | Alternativas descartadas |
| --- | --- | --- |
| Bolhas 3D abaixo de `lg` | **Imagens pré-renderizadas** (WebP) no fluxo do layout; WebGL só monta em ≥ 1024px | manter canvas parado e mover âncoras; sem objeto 3D no celular |
| Hero | **B** — bolha-caixa sangrando à direita **acima** do título; H1, parágrafo; CTAs ancorados no pé do 1º viewport; bolhas-fantasma CSS como textura | visual abaixo dos CTAs (v1-A); bolha pequena ao lado do título; tudo centralizado |
| Estações | **A** — mesma regra do hero: bolha média sangrando à direita acima do H2, texto abaixo, lado fixo (sem zigue-zague) | bolha-ícone ao lado do título; cartões brancos (quebraria "sem cards"/raio binário) |
| Malha | **1** — mapa SVG como tinta atrás do bloco de texto; chips das 7 praças numa só nuvem, sem rótulos de região | mapa pequeno ao lado da legenda agrupada |
| Navbar | **A** — no topo só o logo; o pill WhatsApp entra na cápsula quando `scrolled` | logo + pill sempre (hoje); barra fixa no pé |
| Repetição de CTAs | **A** — par WhatsApp + e-mail no hero e na chegada; rodapé sem botões | par só no hero; manter três pares |
| Rodapé sem botões | **Em todas as larguras**, com WhatsApp (número) e e-mail como links de texto | só no celular (`hidden lg:flex`); manter |
| Animação da fábrica | **B2** — manter o SVG animado (`<object>`) com o vidro da bolha como imagem por cima | congelar em imagem; só o caminhão em CSS |

## 1. Assets e gates

### Imagens das bolhas

- `apps/web/public/bolhas/caixa.webp`, `frasco.webp`, `selo.webp` (bolha + objeto) e `vidro.webp` (bolha vazia, centro transparente, para a fábrica). Lado ≈ 800px, fundo transparente.
- Geração: rota de desenvolvimento `apps/web/src/app/render-bolhas/page.tsx` (`notFound()` fora de `NODE_ENV=development`) que monta um `<Canvas gl={{ alpha: true }}>` só com a `SoapBubble` pedida via `?obj=` (mesmas luzes/materiais de `scene-bits.tsx`, sem `AccumulativeShadows`), e script `apps/web/scripts/render-bolhas.md` com o comando de captura (agent-browser em 3×, `omitBackground`). Se a captura não preservar o alfa do canvas com `transmission`, plano B: fundo `brand-paper` chapado e `rounded-full` + `overflow-hidden` no `<Image>` — a página é papel, a diferença some.
- Regra nova no DESIGN.md: **modelo 3D mudou → regerar o asset** (o script registra a data e o commit de origem no cabeçalho).

### Gates por `matchMedia`

- `Scene3DLazy` passa a testar `(min-width: 1024px)` **antes** do `import()` (mesmo padrão de `MapaMalhaLazy`), com um hook `useWide()` compartilhado; `LiquidPath` idem. Abaixo de `lg` o chunk de `three`/R3F/drei não desce ao aparelho. `useJourneyActive` continua como está (já exige ≥ 1024px).
- `MapaMalhaLazy` já faz o gate do MapLibre; abaixo de `lg` continua o `MapaMalhaPlaceholder` (SVG, pontos acesos).
- `prefers-reduced-motion` abaixo de `lg`: a fábrica troca o `<object>` SVG por `/textures/warehouse-delivery.png` (já existe); `.bubble-ghost` já desliga a animação.

## 2. Textura: bolhas-fantasma

- `HeroPlaceholder` vira `BubbleGhosts` (`components/home/bubble-ghosts.tsx`, server component, `aria-hidden`, `lg:hidden`): 3–5 círculos `.bubble-ghost` de 14–44px em posições fixas por seção (`variant: "hero" | "modelo" | "qualidade" | "malha" | "chegada"`), sempre do lado oposto à bolha-imagem (esquerda), `pointer-events-none`, `z-0`. No desktop o papel é do canvas (microbolhas reais), então o componente não renderiza em `lg`.
- O `HeroPlaceholder` original continua existindo em `lg` como silhueta de carregamento do WebGL (`html[data-scene-ready]` o esconde); abaixo de `lg` não renderiza.

## 3. Hero (< lg)

Ordem no DOM, `flex-col min-h-[100svh] pt-20 pb-8`:

1. `BubbleGhosts variant="hero"` (absoluto).
2. `<Image src="/bolhas/caixa.webp">` em `size-[clamp(13rem,62vw,17rem)] ml-auto -mr-10 sm:-mr-6` (sangra pela direita; `<main>` já tem `overflow-x-clip`).
3. H1 `text-[2.5rem] leading-[1.02] md:text-6xl lg:text-7xl`, `mt-2`.
4. Parágrafo `mt-4 text-base md:text-lg` — sai o `mt-[clamp(1.5rem,20vw,7rem)]`.
5. Bloco de ação `mt-auto pt-6`: `CtaWhatsApp` + `CtaEmail` empilhados (`flex-col gap-3`), `CtaReassurance` centralizado.

Em `lg` nada muda (grid de duas colunas, `data-s-anchor="hero-cluster"`, `data-j-anchor="hero"`, `scroll-hint`). Os marcadores `data-*-anchor` ficam só em `lg` (`hidden lg:block`), porque o canvas não existe abaixo disso.

Regra de dobra: em 844px tudo cabe sem rolar; em 700px (320×700) o CTA primário ainda fica visível porque a bolha encolhe pelo `clamp` (13rem = 208px) — verificar na entrega.

## 4. Estações (< lg)

`Station` abaixo de `lg` deixa de usar `contents`/`order-*`/`justify-self-*`/espelhamento por `flip` e vira `flex-col`:

1. `BubbleGhosts variant={anchor}` (absoluto).
2. Visual: `<Image src="/bolhas/{frasco|selo}.webp">` em `size-[clamp(11rem,55vw,14rem)] ml-auto -mr-8 sm:-mr-4`; na fábrica, `<object data="/warehouse-delivery.svg">` (ou o PNG em reduced-motion) com `<Image src="/bolhas/vidro.webp">` por cima (`absolute inset-0 pointer-events-none`), dentro do mesmo quadrado.
3. H2 `text-3xl md:text-4xl lg:text-5xl`, `mt-3`.
4. Corpo (children) `mt-3`.

Espaçamento: `py-10 md:py-14 lg:py-24`; divisória entre estações continua sendo só o padding (sem fio). Em `md` (768–1023) vale o mesmo padrão do celular — sai a grade `md:grid-cols-[…auto]` de hoje. `flip`, `mist-side` (`--mist-x`) e `data-j-anchor` continuam só em `lg`. `Reveal`/`RevealList` mantêm a suavização atual.

Alvo: cada estação de ~630px para ~420px em 390px de largura.

## 5. Malha (< lg)

- Visual: bolha da fábrica pela regra da §4 (o palco `h-[clamp(20rem,88vw,26rem)]` sai abaixo de `lg`).
- Bloco de texto `relative`: `MapaMalhaPlaceholder` em `absolute -right-6 top-0 w-[clamp(11rem,52vw,15rem)] opacity-90 z-0 pointer-events-none`; H2 e parágrafo com `relative z-10 max-w-[62%] sm:max-w-md`. Contraste: estados são `#f0f9fc` e divisas navy a 25% — texto navy passa AA; os 7 pontos `brand-blue` não podem cair atrás de palavra: se a verificação mostrar colisão, o mapa desce `top-8`.
- Chips: uma nuvem plana (`flex flex-wrap gap-2`) com as 7 praças, sem rótulo de região. `pracas.ts` ganha `pracasPlanas()` (mesma fonte `PRACAS`), com teste ao lado de `pracas.test.ts`; `pracasPorRegiao()` continua no `lg`.
- Regra do Mapa-Tinta preservada: nenhuma interação, nenhum dado novo.

Alvo: de ~1.000px para ~520px.

## 6. Navbar, chegada e rodapé

- **Navbar** (`navbar.tsx`): abaixo de `md`, o pill WhatsApp só renderiza quando `scrolled` (`className={scrolled ? "inline-flex" : "hidden md:inline-flex"}`); o `layout` do motion já anima a largura da cápsula. Logo, links de seção (`hidden md:flex`) e Regra dos 44px seguem iguais.
- **Chegada**: continua centralizada com o par de CTAs; `pt-10 md:pt-20 lg:pt-32`; `BubbleGhosts variant="chegada"`; caminhão, doca e asfalto ficam como estão (`data-s-anchor="caminhao-doca"` só em `lg`; abaixo, o caminhão é o SVG que já renderiza hoje).
- **Rodapé** (todas as larguras — a única mudança fora de `< lg`): saem `CtaWhatsApp` e `CtaEmail`; a grade vira coluna única (wordmark + descrição); a linha de copyright ganha dois links de texto com `min-h-11`: `WHATSAPP_NUMBER` (para `WHATSAPP_URL`, `rel="noopener" target="_blank"`) e `EMAIL_ADDRESS` (para `EMAIL_URL`); selo ANVISA permanece. `pt-10 sm:pt-16`. Alvo: de 576px para ~380px no celular.

## 7. Tipografia e ritmo (resumo dos tokens)

| Token | < 768 | 768–1023 | ≥ 1024 (inalterado) |
| --- | --- | --- | --- |
| H1 (Sora 700) | 40px | 60px | 72px |
| H2 estações | 30px | 36px | 48px |
| H2 chegada | 36px (`text-4xl`) | 48px | 60px |
| Corpo | 16px | 18px | 18–20px |
| `py` de estação | 40px | 56px | 96px |
| Bolha (imagem) | `clamp(11rem,55vw,14rem)` | idem | vidro WebGL 384px |
| Bolha do hero | `clamp(13rem,62vw,17rem)` | idem | 560px |

Regras do DESIGN.md preservadas: Branco Dominante, Dois Brancos, Raio Binário, Sem-Sombra-em-Superfície-Plana, Display Só em Título, Envelope de Bolha (a imagem é a bolha), Mapa-Tinta, 44px.

## 8. DESIGN.md — atualizações

- Layout: "Zigue-zague num só eixo (abaixo de `lg`)" sai; entra **A Regra do Lado Fixo**: abaixo de `lg`, todo visual de seção fica acima do texto e sangra pela direita; fantasmas à esquerda; nada atrás de título.
- Regra do Limiar da Jornada: abaixo de `lg` o `<Canvas>` **não monta** (antes: montava em `frameloop="demand"`); as bolhas são imagens em `public/bolhas/`.
- Bolha-Pacote: parágrafo sobre os assets pré-renderizados e a regra de regeneração; fábrica = SVG animado + `vidro.webp`.
- Components › Navigation: pill WhatsApp só na cápsula abaixo de `md`. Components › Buttons: rodapé não usa CTAs; contato em links de texto.
- Mapa da malha: composição abaixo de `lg` passa a ser "mapa atrás do texto, chips planos".

## 9. Implementação

- Branch atual `reatividade`; PR contra `main` (deploy automático — merge só com pedido explícito).
- Veículo: `/impeccable adapt` com esta spec como brief (escopo `< lg`), depois `/impeccable polish` na página; revisão adversarial única em `opus` sobre o diff inteiro no fim.
- Ordem sugerida para o plano: (1) spike dos assets (rota de render + captura + decisão alfa vs. plano B); (2) gates de `matchMedia` e `BubbleGhosts`; (3) hero; (4) `Station` + malha + `pracasPlanas()`; (5) navbar, chegada, rodapé; (6) DESIGN.md; (7) verificação.
- Hook do projeto (`bun run fix` em todo o repo após Write/Edit) reformata `public/warehouse-delivery.svg`; reverter esse arquivo antes de cada commit se aparecer no `git status` sem edição intencional.

## 10. Verificação (prova na entrega)

- Capturas antes/depois em 320×700, 390×844 e 768×1024 (agent-browser, DPR 2), anexadas ao relatório; a `computer` da extensão não serve (DPR 3,5 devolve 99×220).
- Em 390px: nenhum chunk de `three`, `@react-three` ou `maplibre-gl` na lista de requests; hero cabe no viewport em 844 e o CTA primário visível em 700; altura total ≤ 3.200px (hoje 4.457).
- Contraste do texto sobre o mapa medido (navy sobre `#f0f9fc` ≥ 4,5:1) e nenhum ponto azul sob palavra.
- `bun run check`, `bun run check-types`, testes existentes (`journey-math`, `pracas`, `brasil-outline`) + `pracasPlanas`.
- Desktop (1440×900) antes/depois idêntico fora do rodapé — captura comparada.
- `prefers-reduced-motion` em 390px: fábrica mostra o PNG, fantasmas parados.

## 11. Riscos e fora de escopo

- Risco principal: alfa do canvas com `transmission` na captura (plano B descrito na §1).
- Risco secundário: alinhamento do `<object>` da fábrica com `vidro.webp` em 320/390/430 (hoje há `w-[110%] -translate-y-[54%]` ajustados a olho para a bolha WebGL) — ajustar por captura.
- Fora de escopo: copy, desktop (exceto rodapé), novas seções, paisagem em tablet além do que o padrão do celular cobre, migração dos modelos 3D para o estilo Nanquim.
