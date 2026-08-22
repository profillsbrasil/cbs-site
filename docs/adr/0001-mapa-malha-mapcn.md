# ADR-0001 — Mapa da malha com mapcn

Data: 2026-08-21. Status: aceito.

## Contexto

O argumento-mestre do site é o ganho de frete pela malha de fábricas junto aos CDs do Mercado Livre. A estação 3 da home só tinha texto e chips; faltava a prova visual. O cliente informou 7 praças (cidade/estado), nada mais: nenhum endereço de fábrica nem localização autorizada de CD.

## Decisão

- Mapa do Brasil com as 7 praças na estação 3, composição D2 (mapa no alto-direita, bolha do caminhão em baixo-esquerda), como fundo — não como UI.
- Biblioteca: mapcn (`@mapcn/map`, MapLibre GL v6) instalado em `packages/ui` pelo CLI do shadcn. Uso restrito a `Map blank` + `MapGeoJSON` + `MapMarker`/`MarkerContent`; sem controles, tiles, interação ou popups.
- Dados locais: `apps/web/public/geo/brasil-estados.json` (Natural Earth v5.1.2, 50m, 27 estados, domínio público), gerado por `apps/web/scripts/geo/build-brasil.mjs`. Nenhuma chamada externa em runtime.
- Praças em `src/components/home/pracas.ts`; coordenadas são a capital/cidade de referência, não endereço de fábrica. Só as praças: CDs do ML e rotas ficaram fora por não serem autorizados/verdadeiros.
- Placeholder e fallback: SVG estático com a mesma geometria (`brasil-outline.ts`), usado enquanto o MapLibre carrega e sozinho quando não há WebGL.
- Motion: pontos acendem lendo `journeyProgress` contra a fração da âncora "malha" (`journey-math.ts`); sem listener de scroll novo.
- Worker do MapLibre self-hosted: o `map.tsx` do mapcn aponta o worker para `unpkg.com` se nenhuma URL tiver sido definida; `apps/web/scripts/vendor-maplibre.mjs` (rodado em `predev`/`prebuild`) copia `maplibre-gl-worker.mjs` + `maplibre-gl-shared.mjs` para `public/vendor/maplibre-gl/` (gitignored) e `src/components/home/maplibre-worker.ts` chama `setWorkerUrl` — ele precisa ser o primeiro import de `mapa-malha.tsx`.
- `packages/ui/src/components/map.tsx` fica excluído do `tsconfig` de `packages/ui` (o código do registry não atende `noUncheckedIndexedAccess` e não é nosso para editar); `apps/web` typechecka o arquivo ao importá-lo. `public/geo` e `public/vendor` ficam fora do Biome para os artefatos gerados não serem reformatados.

## Consequências

- +~250 KB gzip de JS (maplibre-gl) no cliente para desenhar o que o SVG já desenha. Aceito por decisão explícita do dono do projeto; mitigado com montagem tardia (IntersectionObserver, 600px) e `ssr:false`. Plano B documentado: trocar `MapaMalha` pelo SVG definitivo sem mudar o contrato visual.
- Atualizar o mapa = rodar o script de build de novo (mesma fonte e versão).
- Qualquer dado novo no mapa (CD, rota, endereço) exige autorização do cliente e nova ADR.
- Deploy precisa rodar `bun run build` na raiz (que dispara `prebuild`); um build que chame `next build` direto não terá o worker vendorizado (404 do worker). `loading={false}` não suprime o loader do mapcn — é o cross-fade via `data-map-ready` que o esconde.
