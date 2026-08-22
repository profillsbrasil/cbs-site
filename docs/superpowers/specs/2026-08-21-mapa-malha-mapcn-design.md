# Mapa da malha com mapcn — design

Data: 2026-08-21. Superfície: home (`apps/web/src/app/page.tsx`), estação 3 "Fábricas onde o frete nasce menor." Modo: Persuade. Extensão do mundo visual aprovado (Bolha-Pacote) — não é redesign.

## Objetivo

Dar ao argumento-mestre do site (ganho de frete pela malha de fábricas junto aos CDs) uma prova visual: o contorno do Brasil com as 7 praças informadas pelo cliente, desenhado em tinta sobre o papel, no mesmo vocabulário do resto da página. Hoje a estação só tem texto e chips.

## Decisões já tomadas com o usuário

| Decisão | Escolha | Alternativas descartadas |
| --- | --- | --- |
| Dados no mapa | Só as 7 praças, no nível de cidade/estado informado pelo cliente | CDs do ML (não autorizado); rotas/arcos (afirmaria logística inexistente) |
| Onde entra | **D** — mapa como fundo da estação 3 | A (mapa no lugar da bolha), B (faixa nova entre estação e Chegada), C (mapa no lugar dos chips) |
| Composição do D | **D2** — mapa contido (~380px) no alto-direita da coluna visual; bolha do caminhão em baixo-esquerda, diagonal no sentido do rio líquido | D1 (bolha "no Atlântico"), D3 (mapa grande, bolha menor encaixada no Sul) |
| Biblioteca | mapcn (`@mapcn/map`, MapLibre GL) — pedido explícito | SVG estático puro (fica como fallback/placeholder) |

Mocks de referência: `.superpowers/brainstorm/662928-1787323468/content/layout-v4.html` (A/B/D) e `d-composition.html` (D1/D2/D3), renderizados com as fontes e tokens do site, o render atual do caminhão e o GeoJSON real.

## Arquitetura

### Componente (packages/ui)

- Instalar com o CLI dentro de `packages/ui`: `bun x shadcn@latest add @mapcn/map`. Gera `components/map.tsx` (registry `registry:ui`, alvo `components/ui/map.tsx` mapeado pelo alias `@cbs-site/ui/components`) e adiciona `maplibre-gl@^6`. `lucide-react` já existe no pacote.
- O arquivo importa `maplibre-gl/dist/maplibre-gl.css`; confirmar que o build do `apps/web` aceita CSS vindo do pacote (o `globals.css` do pacote já é consumido, então o caminho existe).
- API usada, conferida em `https://mapcn.dev/r/map.json`:
  - `<Map blank theme="light" interactive={false} attributionControl={false} bounds={BRASIL_BOUNDS} fitBoundsOptions={{ padding }}>` — `MapProps` espalha `MapLibreGL.MapOptions`, então `interactive`, `attributionControl`, `bounds` e `fitBoundsOptions` passam direto para o construtor.
  - `<MapGeoJSON data={estados} fillPaint={{ "fill-color": "#f0f9fc" }} linePaint={{ "line-color": "#ffffff", "line-width": 1.2 }} />` para os estados, e um segundo `MapGeoJSON` com o contorno do país em `brand-aqua` (`linePaint`, `fillPaint` transparente) — `MapGeoJSON` só desenha fill + line; pontos não passam por ele.
  - `<MapMarker longitude latitude>` com `<MarkerContent>` para as 7 praças: marcadores DOM, o que permite animar o "acender" em CSS e reaproveitar tokens Tailwind.
- Não usar: `MapControls`, popups, tooltips, clusters, `styles` remotos. O mapa não é UI — é tinta.

### Dados (apps/web)

- `public/geo/brasil-estados.json`: Natural Earth 50m `admin_1_states_provinces` filtrado para `adm0_a3 === "BRA"` (27 feições, ~70 KB). Gerado uma vez por script em `scripts/geo/build-brasil.mjs` (fonte, versão `v5.1.2` e licença pública de domínio registradas no cabeçalho do script e no ADR). Nenhuma chamada de CDN em runtime.
- `src/components/home/pracas.ts`: fonte única das praças, consumida pelos chips (`RevealGroups`) e pelos marcadores.

  ```ts
  export const PRACAS = [
    { regiao: "Sudeste", nome: "São Paulo", lngLat: [-46.63, -23.55] },
    { regiao: "Sudeste", nome: "Minas Gerais", lngLat: [-43.94, -19.92] },
    { regiao: "Sul", nome: "Curitiba", lngLat: [-49.27, -25.43] },
    { regiao: "Sul", nome: "Rio Grande do Sul", lngLat: [-51.23, -30.03] },
    { regiao: "Nordeste", nome: "Pernambuco", lngLat: [-34.88, -8.05] },
    { regiao: "Nordeste", nome: "Bahia", lngLat: [-38.51, -12.97] },
    { regiao: "Centro-Oeste", nome: "Centro do Brasil", lngLat: [-47.93, -15.78] },
  ] as const;
  ```

  Coordenadas são as capitais/cidades-referência de cada praça informada; não representam endereço de fábrica. Isso fica dito no comentário do arquivo e no ADR.

### Componente da home

- `src/components/home/mapa-malha.tsx` (`"use client"`): monta `Map` + camadas + marcadores, lê `PRACAS` e `journeyProgress`. Carregado em `page.tsx` via `next/dynamic` com `ssr: false` (MapLibre precisa de `window`).
- `src/components/home/mapa-malha-placeholder.tsx` (server component): o mesmo contorno do Brasil em SVG inline (gerado pelo mesmo script de build a partir do GeoJSON, projeção Mercator, ~60 KB de path simplificado ou `ne_110m` se o tamanho incomodar) com os 7 pontos. É o `loading` do `dynamic` e o fallback se o WebGL não inicializar (`map.on("error")` / ausência de `WebGLRenderingContext` → mantém o SVG e não monta o MapLibre).

### Composição (D2) em `Station`

- `Station` ganha uma prop opcional `backdrop?: React.ReactNode`, renderizada dentro da coluna visual com `position: absolute`, antes do `data-s-anchor`. Só a estação "malha" passa `backdrop={<MapaMalha />}`.
- Coluna visual: `min-h-[520px]`; mapa num quadrado de ~380px ancorado em `right-0 top-0` (`lg:`); a âncora do caminhão (`data-s-anchor="caminhao"`) passa a `left-0 bottom-0` nesta estação com 300–340px, e a parada da caixa (`data-j-anchor="malha"`) acompanha (continua "logo abaixo da bolha, na coluna dela").
- `mist-side` desta estação sai (o mapa ocupa o papel da névoa). Regra do Branco Dominante preservada: o mapa é `#f0f9fc` + aqua + azul, sem bloco sólido.
- Abaixo de `lg`: a coluna empilha — mapa (~280px, centralizado) acima da bolha do caminhão (`h-72`), sem sobreposição.

### Motion

- Pontos começam a 35% de opacidade e "acendem" (opacidade 1 + halo) em sequência de 60 ms quando `journeyProgress` cruza o trecho em que a caixa para na estação "malha" — mesmo valor que `JourneyBox` já usa para a parada; nenhum listener de scroll novo (Regra do Progresso Único). Implementação: `useMotionValueEvent(journeyProgress, "change")` → `data-lit` no container; CSS faz a transição.
- `prefers-reduced-motion` ou `!useJourneyActive()` (telas < 1024px): pontos já acesos, sem transição.
- Mapa sem `Float`, sem pan, sem zoom (`interactive={false}`; o container tem `pointer-events-none`).

### Performance — trade-off registrado

`maplibre-gl` adiciona ~250 KB gzip de JS ao cliente para desenhar o que o SVG de fallback já desenha. Mantido por pedido explícito do usuário (mapcn é o objetivo). Mitigações: `dynamic(ssr:false)` + só montar quando a estação entrar a 600px do viewport (`IntersectionObserver`), o que tira o MapLibre do caminho crítico do hero. Se o LCP/INP da home piorar de forma mensurável, o plano B é trocar `MapaMalha` pelo placeholder SVG definitivo — o contrato visual é o mesmo.

### Erros e estados

- WebGL indisponível → fica o SVG (sem mensagem; é decoração).
- GeoJSON falha (404) → `MapGeoJSON` não desenha; o container mantém o SVG atrás até `isLoaded` e a primeira camada renderizarem (`map.once("idle")`), então faz cross-fade — mesmo padrão de `html[data-scene-ready]` do hero, aqui local ao container (`data-map-ready`).
- Nunca mostrar o `DefaultLoader` do mapcn (pontinhos com `backdrop-blur`) — `loading={false}`.

## Documentação a produzir

1. `docs/adr/0001-mapa-malha-mapcn.md` — contexto, decisão (mapcn + dados locais + só praças), consequências (peso do MapLibre, fallback SVG, dado ≠ endereço de fábrica), fonte e licença do Natural Earth.
2. `apps/web/DESIGN.md` — seção "Mapa da malha" em Components: tokens usados, regra "o mapa é tinta, não UI" (sem controles, sem interação, sem tiles), composição D2, comportamento sob `lg` e reduced-motion.
3. `.impeccable/surfaces/apps-web-src-app-page-tsx.md` — inventário ganha a linha "Mapa da malha | mapcn (`Map blank` + GeoJSON local + `MapMarker`)" e os mocks D/D2 como comps aprovados.
4. `CONTEXT.md` — entrada **Praça** (a cidade/estado de referência de cada fábrica; o que vai no mapa e nos chips; _Avoid_: endereço, unidade) em "A malha".

## Verificação (definição de pronto)

- `bun run check`, `bun run check-types`, detector do impeccable nos alvos alterados.
- Screenshot desktop (≥1280) da estação 3 lado a lado com o mock D2; screenshot mobile (390) via DevTools device toolbar ou `resize_window` se o WM permitir.
- Console do browser sem erro/aviso do MapLibre; `read_network_requests` mostrando `brasil-estados.json` 200 e nenhuma chamada externa (CARTO/CDN).
- Rolar até a estação com a coreografia ativa: pontos acendem quando a caixa para. Com `prefers-reduced-motion: reduce` emulado: já acesos.
- WebGL bloqueado (`chrome://flags` ou `--disable-webgl`): SVG permanece, sem erro não tratado.
- Critique (`/impeccable critique`) depois do merge para medir o efeito na heurística 2/8.

## Fora de escopo

CDs do Mercado Livre, rotas, tooltips/popup nas praças, qualquer interação de mapa, dark mode.
