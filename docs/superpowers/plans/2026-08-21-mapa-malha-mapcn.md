# Mapa da malha com mapcn — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Colocar, na estação "Fábricas onde o frete nasce menor." da home, o contorno do Brasil com as 7 praças da malha, desenhado pelo mapcn (`Map blank` + GeoJSON local + marcadores), na composição D2 aprovada, acendendo os pontos quando a caixa da jornada chega à estação.

**Architecture:** O mapa é tinta sobre o papel, não UI: `Map blank` sem controles nem interação, estados em `#f0f9fc` com divisas brancas, contorno aqua, 7 `MapMarker` DOM animados em CSS. Um SVG estático com a mesma geometria serve de placeholder (`dynamic` com `ssr:false`) e de fallback sem WebGL. A lógica de "em que fração da jornada fica cada âncora" sai de `scene3d.tsx` para um módulo puro (`journey-math.ts`) testável com `bun test`, e o mapa lê `journeyProgress` contra essa fração — nenhum listener de scroll novo.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, Tailwind 4, motion (`motionValue`, `useMotionValueEvent`), mapcn (`@mapcn/map` → MapLibre GL v6), Natural Earth 50m (domínio público), `bun test` para módulos puros, Biome/Ultracite (`bun run check`/`fix`), `bun run check-types`.

**Spec:** `docs/superpowers/specs/2026-08-21-mapa-malha-mapcn-design.md`

## Global Constraints

- Monorepo bun workspaces; o dev server da home já roda em `http://localhost:3005` (não iniciar outro; `bun run dev:web` usaria 3001).
- Componentes shadcn/mapcn são adicionados com o CLI **dentro de `packages/ui`** e consumidos via `@cbs-site/ui/components/<nome>`.
- Todo arquivo three.js/R3F carrega `"use no memo"`; os novos arquivos deste plano não tocam R3F, então não precisam.
- Tokens de cor: só `brand-navy #0f1c2b`, `brand-blue #1d9dd8`, `brand-ink #1579b0`, `brand-aqua #a8e0f0`, `brand-mist #dcf3fa`, `brand-paper #fafbfc`, branco. Raio binário (`rounded-full` ou nenhum). Sem `box-shadow` em contêiner de conteúdo.
- Título em `font-display` (Sora) só em h1/h2. Corpo no sans herdado.
- Regra do Progresso Único: nada de `scroll` listener novo; coreografia lê `journeyProgress`.
- Regra do Limiar da Jornada: `useJourneyActive()` é `false` abaixo de 1024px ou com `prefers-reduced-motion`; nesse caso os pontos já nascem acesos.
- Dados: só as 7 praças do cliente, no nível de cidade/estado; coordenadas são capitais/cidades de referência, **não** endereço de fábrica; nenhuma chamada externa em runtime (sem CDN, sem tiles CARTO).
- Copy em pt-BR com acentuação correta. Conventional Commits em PT, subject ≤ 50 chars, sem atribuição de IA.
- Depois de cada edit o hook roda `ultracite fix`; reler o arquivo antes do próximo edit no mesmo arquivo.

---

## Estrutura de arquivos

| Arquivo | Responsabilidade |
| --- | --- |
| `apps/web/scripts/geo/build-brasil.mjs` (novo) | Baixa Natural Earth 50m admin_1, filtra `adm0_a3 === "BRA"`, grava o GeoJSON público e o módulo de contorno SVG. Roda uma vez; saída é commitada. |
| `apps/web/public/geo/brasil-estados.json` (gerado) | 27 feições de estado, servido local para o `MapGeoJSON`. |
| `apps/web/src/components/home/brasil-outline.ts` (gerado) | `BRASIL_VIEWBOX`, `BRASIL_STATE_PATHS: string[]`, `projectLngLat(lng, lat)` na mesma projeção — base do SVG placeholder. |
| `apps/web/src/components/home/pracas.ts` (novo) | Fonte única das 7 praças (região, nome, lngLat) + `pracasPorRegiao()` para os chips. |
| `apps/web/src/components/home/pracas.test.ts` (novo) | Invariantes dos dados. |
| `apps/web/src/components/home/journey-math.ts` (novo) | `segmentWeights`, `journeyFraction`, `anchorFraction` — matemática pura extraída de `scene3d.tsx`. |
| `apps/web/src/components/home/journey-math.test.ts` (novo) | Testes da matemática. |
| `apps/web/src/components/home/scene3d.tsx` (modificar) | Passa a importar `segmentWeights`/`journeyFraction` de `journey-math.ts`. |
| `apps/web/src/components/home/use-anchor-fraction.ts` (novo) | Hook: mede as âncoras `data-j-anchor` no DOM e devolve a fração de `journeyProgress` em que a caixa para na âncora pedida. |
| `packages/ui/src/components/map.tsx` (gerado pelo CLI) | Componente mapcn. Não editar à mão além do que o CLI gerar. |
| `apps/web/src/components/home/mapa-malha-placeholder.tsx` (novo) | SVG estático do Brasil + 7 pontos (server component). |
| `apps/web/src/components/home/mapa-malha.tsx` (novo) | Mapa mapcn, montagem tardia, pontos acendendo, fallback. |
| `apps/web/src/app/page.tsx` (modificar) | `Station` ganha `backdrop`; estação "malha" passa o mapa; chips leem `pracasPorRegiao()`. |
| `apps/web/src/index.css` (modificar) | Classes do mapa/pontos (`.malha-map`, `.praca-dot`), cross-fade `data-map-ready`. |
| `docs/adr/0001-mapa-malha-mapcn.md`, `apps/web/DESIGN.md`, `apps/web/.impeccable/surfaces/apps-web-src-app-page-tsx.md`, `CONTEXT.md` | Documentação. |

---

### Task 1: Dados geográficos — script de build, GeoJSON público e contorno SVG

**Files:**
- Create: `apps/web/scripts/geo/build-brasil.mjs`
- Create (gerado): `apps/web/public/geo/brasil-estados.json`
- Create (gerado): `apps/web/src/components/home/brasil-outline.ts`
- Test: `apps/web/src/components/home/brasil-outline.test.ts`

**Interfaces:**
- Produces: `BRASIL_VIEWBOX: string` (ex.: `"0 0 600 629.8"`), `BRASIL_STATE_PATHS: readonly string[]` (27 paths `d`), `projectLngLat(lng: number, lat: number): [number, number]` (mesma projeção Mercator do viewBox), `BRASIL_BOUNDS: [[west, south], [east, north]]` em graus.

- [ ] **Step 1: Escrever o teste que falha**

`apps/web/src/components/home/brasil-outline.test.ts`:

```ts
import { describe, expect, test } from "bun:test";

import {
	BRASIL_BOUNDS,
	BRASIL_STATE_PATHS,
	BRASIL_VIEWBOX,
	projectLngLat,
} from "./brasil-outline";

describe("brasil-outline", () => {
	test("tem os 27 estados", () => {
		expect(BRASIL_STATE_PATHS).toHaveLength(27);
		for (const d of BRASIL_STATE_PATHS) {
			expect(d.startsWith("M")).toBe(true);
		}
	});

	test("viewBox começa em 0 0 e tem 600 de largura", () => {
		const [x, y, w] = BRASIL_VIEWBOX.split(" ").map(Number);
		expect(x).toBe(0);
		expect(y).toBe(0);
		expect(w).toBe(600);
	});

	test("projeta São Paulo dentro do viewBox, abaixo do centro", () => {
		const [, , w, h] = BRASIL_VIEWBOX.split(" ").map(Number);
		const [px, py] = projectLngLat(-46.63, -23.55);
		expect(px).toBeGreaterThan(0);
		expect(px).toBeLessThan(w);
		expect(py).toBeGreaterThan(h / 2);
		expect(py).toBeLessThan(h);
	});

	test("bounds cobrem o país", () => {
		const [[west, south], [east, north]] = BRASIL_BOUNDS;
		expect(west).toBeLessThan(-73);
		expect(east).toBeGreaterThan(-35);
		expect(south).toBeLessThan(-33);
		expect(north).toBeGreaterThan(5);
	});
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd apps/web && bun test src/components/home/brasil-outline.test.ts`
Expected: FAIL — `Cannot find module './brasil-outline'`.

- [ ] **Step 3: Escrever o script de build**

`apps/web/scripts/geo/build-brasil.mjs`:

```js
// Gera os dados do mapa da malha a partir do Natural Earth (domínio público):
//   public/geo/brasil-estados.json      -> GeoJSON dos 27 estados (MapGeoJSON)
//   src/components/home/brasil-outline.ts -> paths SVG + projeção (placeholder)
// Fonte: natural-earth-vector v5.1.2, ne_50m_admin_1_states_provinces.
// Rodar uma vez: `bun scripts/geo/build-brasil.mjs` (saída é commitada).
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SOURCE =
	"https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/ne_50m_admin_1_states_provinces.geojson";
const SVG_WIDTH = 600;
const DECIMALS = 1;

const root = path.resolve(import.meta.dirname, "../..");
const geoOut = path.join(root, "public/geo/brasil-estados.json");
const tsOut = path.join(root, "src/components/home/brasil-outline.ts");

const all = await (await fetch(SOURCE)).json();
const states = all.features.filter((f) => f.properties.adm0_a3 === "BRA");
if (states.length !== 27) {
	throw new Error(`esperava 27 estados, veio ${states.length}`);
}

const rings = (geometry) =>
	geometry.type === "MultiPolygon"
		? geometry.coordinates.flat()
		: geometry.coordinates;

let west = Infinity;
let east = -Infinity;
let south = Infinity;
let north = -Infinity;
for (const f of states) {
	for (const ring of rings(f.geometry)) {
		for (const [lng, lat] of ring) {
			west = Math.min(west, lng);
			east = Math.max(east, lng);
			south = Math.min(south, lat);
			north = Math.max(north, lat);
		}
	}
}

const rad = (deg) => (deg * Math.PI) / 180;
const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2));
const scale = SVG_WIDTH / (rad(east) - rad(west));
const height = (merc(north) - merc(south)) * scale;
const project = (lng, lat) => [
	(rad(lng) - rad(west)) * scale,
	(merc(north) - merc(lat)) * scale,
];

const paths = states.map((f) =>
	rings(f.geometry)
		.map(
			(ring) =>
				`M${ring
					.map(([lng, lat]) =>
						project(lng, lat)
							.map((v) => v.toFixed(DECIMALS))
							.join(" ")
					)
					.join(" L")}Z`
		)
		.join(" ")
);

const geojson = {
	type: "FeatureCollection",
	features: states.map((f) => ({
		type: "Feature",
		properties: { name: f.properties.name, sigla: f.properties.postal },
		geometry: f.geometry,
	})),
};

const ts = `// Gerado por scripts/geo/build-brasil.mjs — não editar à mão.
// Natural Earth v5.1.2 (domínio público), 27 estados, projeção Mercator
// normalizada para um viewBox de ${SVG_WIDTH} de largura.

const WEST = ${west};
const NORTH = ${north};
const SCALE = ${scale};

export const BRASIL_BOUNDS: [[number, number], [number, number]] = [
	[${west}, ${south}],
	[${east}, ${north}],
];

export const BRASIL_VIEWBOX = "0 0 ${SVG_WIDTH} ${height.toFixed(DECIMALS)}";

const rad = (deg: number): number => (deg * Math.PI) / 180;
const merc = (lat: number): number =>
	Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2));

/** Mesma projeção dos paths: converte lng/lat em coordenadas do viewBox. */
export function projectLngLat(lng: number, lat: number): [number, number] {
	return [(rad(lng) - rad(WEST)) * SCALE, (merc(NORTH) - merc(lat)) * SCALE];
}

export const BRASIL_STATE_PATHS: readonly string[] = ${JSON.stringify(paths, null, "\t")};
`;

await mkdir(path.dirname(geoOut), { recursive: true });
await writeFile(geoOut, JSON.stringify(geojson));
await writeFile(tsOut, ts);
console.log(`ok: ${states.length} estados, viewBox ${SVG_WIDTH}x${height.toFixed(1)}`);
```

- [ ] **Step 4: Rodar o script e o teste**

Run: `cd apps/web && bun scripts/geo/build-brasil.mjs && bun test src/components/home/brasil-outline.test.ts`
Expected: `ok: 27 estados, viewBox 600x629.8` e 4 testes PASS. Conferir tamanho: `ls -la public/geo/brasil-estados.json src/components/home/brasil-outline.ts` — ambos na casa de 70–80 KB. Se `brasil-outline.ts` passar de 120 KB, trocar `SOURCE` para `ne_110m_admin_1_states_provinces.geojson` **só no TS** (manter 50m no GeoJSON) e re-rodar.

- [ ] **Step 5: Lint, types e commit**

Run: `cd /home/othavio/Work/cbs-site && bun run fix && bun run check && bun run check-types`
Expected: `Found 1 info` (aviso pré-existente de `biome migrate`), types com `Exited with code 0`.

```bash
git add apps/web/scripts/geo/build-brasil.mjs apps/web/public/geo/brasil-estados.json apps/web/src/components/home/brasil-outline.ts apps/web/src/components/home/brasil-outline.test.ts
git commit -m "feat: dados geográficos da malha (Natural Earth)"
```

---

### Task 2: Fonte única das praças

**Files:**
- Create: `apps/web/src/components/home/pracas.ts`
- Test: `apps/web/src/components/home/pracas.test.ts`
- Modify: `apps/web/src/app/page.tsx` (constante `PRACAS`, linhas ~12-19, e o `groups` do `RevealGroups`)

**Interfaces:**
- Produces: `type Praca = { regiao: Regiao; nome: string; lngLat: readonly [number, number] }`, `PRACAS: readonly Praca[]`, `pracasPorRegiao(): { label: string; items: string[] }[]` (mesmo shape que `RevealGroups` já consome).

- [ ] **Step 1: Teste que falha**

`apps/web/src/components/home/pracas.test.ts`:

```ts
import { describe, expect, test } from "bun:test";

import { BRASIL_BOUNDS } from "./brasil-outline";
import { PRACAS, pracasPorRegiao } from "./pracas";

describe("pracas", () => {
	test("são as 7 praças do cliente", () => {
		expect(PRACAS.map((p) => p.nome)).toEqual([
			"São Paulo",
			"Minas Gerais",
			"Curitiba",
			"Rio Grande do Sul",
			"Pernambuco",
			"Bahia",
			"Centro do Brasil",
		]);
	});

	test("toda coordenada cai dentro do Brasil", () => {
		const [[west, south], [east, north]] = BRASIL_BOUNDS;
		for (const { lngLat } of PRACAS) {
			expect(lngLat[0]).toBeGreaterThan(west);
			expect(lngLat[0]).toBeLessThan(east);
			expect(lngLat[1]).toBeGreaterThan(south);
			expect(lngLat[1]).toBeLessThan(north);
		}
	});

	test("agrupa em 4 regiões na ordem Sudeste, Sul, Nordeste, Centro-Oeste", () => {
		const grupos = pracasPorRegiao();
		expect(grupos.map((g) => g.label)).toEqual([
			"Sudeste",
			"Sul",
			"Nordeste",
			"Centro-Oeste",
		]);
		expect(grupos.flatMap((g) => g.items)).toHaveLength(7);
	});
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd apps/web && bun test src/components/home/pracas.test.ts`
Expected: FAIL — `Cannot find module './pracas'`.

- [ ] **Step 3: Implementar**

`apps/web/src/components/home/pracas.ts`:

```ts
/**
 * As praças da malha, exatamente como o cliente informou (cidade ou estado).
 * Fonte única para os chips da estação e para os pontos do mapa.
 *
 * As coordenadas são a capital/cidade de referência de cada praça — servem
 * para posicionar o ponto no mapa e NÃO representam endereço de fábrica.
 */
export type Regiao = "Sudeste" | "Sul" | "Nordeste" | "Centro-Oeste";

export interface Praca {
	regiao: Regiao;
	nome: string;
	/** [longitude, latitude] em graus. */
	lngLat: readonly [number, number];
}

export const PRACAS: readonly Praca[] = [
	{ regiao: "Sudeste", nome: "São Paulo", lngLat: [-46.63, -23.55] },
	{ regiao: "Sudeste", nome: "Minas Gerais", lngLat: [-43.94, -19.92] },
	{ regiao: "Sul", nome: "Curitiba", lngLat: [-49.27, -25.43] },
	{ regiao: "Sul", nome: "Rio Grande do Sul", lngLat: [-51.23, -30.03] },
	{ regiao: "Nordeste", nome: "Pernambuco", lngLat: [-34.88, -8.05] },
	{ regiao: "Nordeste", nome: "Bahia", lngLat: [-38.51, -12.97] },
	{ regiao: "Centro-Oeste", nome: "Centro do Brasil", lngLat: [-47.93, -15.78] },
];

const ORDEM_REGIOES: readonly Regiao[] = [
	"Sudeste",
	"Sul",
	"Nordeste",
	"Centro-Oeste",
];

/** Grupos no formato que `RevealGroups` consome (rótulo + chips). */
export function pracasPorRegiao(): { label: string; items: string[] }[] {
	return ORDEM_REGIOES.map((regiao) => ({
		label: regiao,
		items: PRACAS.filter((p) => p.regiao === regiao).map((p) => p.nome),
	}));
}
```

- [ ] **Step 4: Rodar o teste**

Run: `cd apps/web && bun test src/components/home/pracas.test.ts`
Expected: 3 PASS.

- [ ] **Step 5: Trocar a constante em `page.tsx`**

Em `apps/web/src/app/page.tsx`, remover o bloco:

```ts
// Praças da malha, agrupadas por região: 7 chips num bloco só viram lista;
// por região, o leitor enxerga a cobertura do país de uma vez.
const PRACAS = [
	{ items: ["São Paulo", "Minas Gerais"], label: "Sudeste" },
	{ items: ["Curitiba", "Rio Grande do Sul"], label: "Sul" },
	{ items: ["Pernambuco", "Bahia"], label: "Nordeste" },
	{ items: ["Centro do Brasil"], label: "Centro-Oeste" },
];
```

Adicionar o import `import { pracasPorRegiao } from "@/components/home/pracas";` e, no `RevealGroups` da estação "malha", trocar `groups={PRACAS}` por `groups={pracasPorRegiao()}`.

- [ ] **Step 6: Verificar no browser, lint, types, commit**

Run: `cd /home/othavio/Work/cbs-site && bun run fix && bun run check && bun run check-types`. Abrir `http://localhost:3005`, rolar até a estação 3: os 4 rótulos e 7 chips iguais a antes.

```bash
git add apps/web/src/components/home/pracas.ts apps/web/src/components/home/pracas.test.ts apps/web/src/app/page.tsx
git commit -m "refactor: praças da malha em fonte única"
```

---

### Task 3: Extrair a matemática da jornada (`journey-math.ts`) e o hook de fração da âncora

**Files:**
- Create: `apps/web/src/components/home/journey-math.ts`
- Test: `apps/web/src/components/home/journey-math.test.ts`
- Create: `apps/web/src/components/home/use-anchor-fraction.ts`
- Modify: `apps/web/src/components/home/scene3d.tsx` (funções `segmentWeights` e `journeyFraction`, ~linhas 411-432; import)

**Interfaces:**
- Consumes: `JOURNEY_ANCHORS` de `scene3d.tsx` (`["hero","modelo","qualidade","malha","chegada","doca"]`).
- Produces: `segmentWeights(screenYs: number[]): number[]`, `journeyFraction(weights: number[], segment: number, t: number): number`, `anchorFraction(screenYs: number[], index: number): number`, hook `useAnchorFraction(id: (typeof JOURNEY_ANCHORS)[number]): number` (fração 0–1 de `journeyProgress` em que a caixa está parada sobre a âncora; `1` enquanto o DOM não mediu).

- [ ] **Step 1: Teste que falha**

`apps/web/src/components/home/journey-math.test.ts`:

```ts
import { describe, expect, test } from "bun:test";

import {
	anchorFraction,
	journeyFraction,
	segmentWeights,
} from "./journey-math";

describe("journey-math", () => {
	test("pesos são a distância vertical entre âncoras consecutivas, mínimo 1", () => {
		expect(segmentWeights([0, 100, 100, 350])).toEqual([100, 1, 250]);
	});

	test("journeyFraction acumula os segmentos anteriores e interpola o atual", () => {
		const w = [100, 100, 200];
		expect(journeyFraction(w, 0, 0)).toBe(0);
		expect(journeyFraction(w, 1, 0)).toBeCloseTo(0.25);
		expect(journeyFraction(w, 1, 1)).toBeCloseTo(0.5);
		expect(journeyFraction(w, 2, 1)).toBe(1);
	});

	test("anchorFraction é a fração acumulada até a âncora", () => {
		const ys = [0, 100, 200, 400];
		expect(anchorFraction(ys, 0)).toBe(0);
		expect(anchorFraction(ys, 1)).toBeCloseTo(0.25);
		expect(anchorFraction(ys, 3)).toBe(1);
	});
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd apps/web && bun test src/components/home/journey-math.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Criar `journey-math.ts`**

```ts
/**
 * Matemática pura da jornada da caixa: o progresso 0–1 é a distância
 * vertical acumulada entre as âncoras `data-j-anchor`, na ordem de
 * `JOURNEY_ANCHORS`. Vive fora de scene3d.tsx para ser testável e para o
 * DOM (mapa da malha) poder perguntar "em que fração a caixa para aqui?"
 * sem duplicar a conta.
 */
export function segmentWeights(screenYs: number[]): number[] {
	const weights: number[] = [];
	for (let i = 0; i < screenYs.length - 1; i += 1) {
		const a = screenYs[i] as number;
		const b = screenYs[i + 1] as number;
		weights.push(Math.max(Math.abs(b - a), 1));
	}
	return weights;
}

export function journeyFraction(
	weights: number[],
	segment: number,
	t: number
): number {
	const total = weights.reduce((sum, w) => sum + w, 0);
	let before = 0;
	for (let i = 0; i < segment; i += 1) {
		before += weights[i] ?? 0;
	}
	return (before + t * (weights[segment] ?? 0)) / total;
}

/** Fração de progresso em que a caixa está exatamente sobre a âncora `index`. */
export function anchorFraction(screenYs: number[], index: number): number {
	const weights = segmentWeights(screenYs);
	if (index >= weights.length) {
		return 1;
	}
	return journeyFraction(weights, index, 0);
}
```

- [ ] **Step 4: Rodar o teste**

Run: `cd apps/web && bun test src/components/home/journey-math.test.ts`
Expected: 3 PASS.

- [ ] **Step 5: Fazer `scene3d.tsx` usar o módulo**

Em `scene3d.tsx`: apagar as funções locais `segmentWeights` (que recebia `AnchorSample[]`) e `journeyFraction`; adicionar `import { journeyFraction, segmentWeights } from "./journey-math";`; em `resolveTarget`, trocar `const weights = segmentWeights(samples);` por `const weights = segmentWeights(samples.map((s) => s.screenY));`. Nada mais muda.

- [ ] **Step 6: Criar o hook `use-anchor-fraction.ts`**

```ts
"use client";

import { useEffect, useState } from "react";

import { anchorFraction } from "./journey-math";
import { JOURNEY_ANCHORS } from "./scene3d";

type AnchorId = (typeof JOURNEY_ANCHORS)[number];

/**
 * Em que fração de `journeyProgress` a caixa para sobre a âncora `id`.
 * Mede o DOM uma vez por layout (resize) — o mesmo critério de distância
 * vertical que `JourneyBox` usa, então os dois concordam. Devolve 1 até a
 * primeira medição, para nenhum consumidor "acender" antes da hora.
 */
export function useAnchorFraction(id: AnchorId): number {
	const [fraction, setFraction] = useState(1);

	useEffect(() => {
		const measure = () => {
			const ys: number[] = [];
			for (const anchor of JOURNEY_ANCHORS) {
				const el = document.querySelector(`[data-j-anchor="${anchor}"]`);
				if (!el) {
					return;
				}
				const rect = el.getBoundingClientRect();
				ys.push(rect.top + rect.height / 2 + window.scrollY);
			}
			setFraction(anchorFraction(ys, JOURNEY_ANCHORS.indexOf(id)));
		};
		measure();
		window.addEventListener("resize", measure);
		return () => window.removeEventListener("resize", measure);
	}, [id]);

	return fraction;
}
```

- [ ] **Step 7: Lint, types, smoke no browser, commit**

Run: `cd /home/othavio/Work/cbs-site && bun run fix && bun run check && bun run check-types && cd apps/web && bun test`. Abrir `http://localhost:3005`, rolar a página inteira: a caixa continua parando nas 3 estações e entrando no caminhão (a refatoração não pode mudar a coreografia).

```bash
git add apps/web/src/components/home/journey-math.ts apps/web/src/components/home/journey-math.test.ts apps/web/src/components/home/use-anchor-fraction.ts apps/web/src/components/home/scene3d.tsx
git commit -m "refactor: matemática da jornada em módulo puro"
```

---

### Task 4: Instalar o mapcn em `packages/ui`

**Files:**
- Create (CLI): `packages/ui/src/components/map.tsx`
- Modify (CLI): `packages/ui/package.json` (`maplibre-gl`)
- Modify: `packages/ui/components.json` (registry `@mapcn`, se o CLI pedir)

**Interfaces:**
- Produces: `import { Map, MapGeoJSON, MapMarker, MarkerContent } from "@cbs-site/ui/components/map"` — `Map` aceita `blank`, `theme`, `loading`, `className` e espalha `MapLibreGL.MapOptions` (`interactive`, `attributionControl`, `bounds`, `fitBoundsOptions`); `MapGeoJSON` aceita `data` (objeto ou URL), `fillPaint`, `linePaint`; `MapMarker` aceita `longitude`, `latitude`, `children`.

- [ ] **Step 1: Rodar o CLI dentro do pacote**

Run: `cd /home/othavio/Work/cbs-site/packages/ui && bun x shadcn@latest add @mapcn/map`
Expected: cria `src/components/map.tsx` (o alias `ui` → `@cbs-site/ui/components` resolve `components/ui/map.tsx` para `src/components/map.tsx`) e instala `maplibre-gl@^6`. Se o CLI perguntar para registrar o registry `@mapcn`, aceitar — ele grava em `components.json` → `registries`. Se gerar em outro caminho, mover para `src/components/map.tsx` e ajustar nada mais.

- [ ] **Step 2: Conferir o arquivo gerado**

Run: `grep -n '^import "maplibre-gl/dist/maplibre-gl.css"\|^export {' src/components/map.tsx && grep -n '"maplibre-gl"' package.json`
Expected: a linha do CSS na linha ~5, o bloco `export { Map, useMap, MapMarker, ... MapGeoJSON, ... }` e a dependência no `package.json`. O arquivo pode usar `forwardRef` e `any` internos — **não** "corrigir" o código do registry; se o Biome reclamar dele, adicionar `"packages/ui/src/components/map.tsx"` ao `ignore`/`includes` negativo do `biome.jsonc` da raiz (olhar como os outros componentes shadcn estão tratados lá primeiro; provavelmente já há uma exceção para `packages/ui/src/components/**`).

- [ ] **Step 3: Verificar que o app compila importando o pacote**

Criar temporariamente em `apps/web/src/app/_map-smoke/page.tsx`:

```tsx
"use client";

import { Map } from "@cbs-site/ui/components/map";

export default function MapSmoke() {
	return (
		<div className="h-80 w-80">
			<Map blank interactive={false} theme="light" />
		</div>
	);
}
```

Run: `cd /home/othavio/Work/cbs-site && bun install && bun run check-types`, depois abrir `http://localhost:3005/_map-smoke` e `read_console_messages` (pattern `error|maplibre`): nenhum erro; a área fica transparente (blank sem camadas não desenha nada — é o esperado). Se o CSS do MapLibre não for encontrado, a causa é o `exports` do pacote: adicionar a `packages/ui/package.json` → `exports` a entrada `"./components/map": "./src/components/map.tsx"` não resolve CSS — o CSS é importado **dentro** do `map.tsx`, e o Turbopack resolve `maplibre-gl/dist/maplibre-gl.css` pelo `node_modules` do pacote; se falhar, instalar `maplibre-gl` também em `apps/web` (`cd apps/web && bun add maplibre-gl@^6`) e registrar isso no ADR.

- [ ] **Step 4: Remover o smoke e commitar**

```bash
rm -r apps/web/src/app/_map-smoke
cd /home/othavio/Work/cbs-site && bun run fix && bun run check && bun run check-types
git add packages/ui bun.lock
git commit -m "feat(ui): adiciona mapcn (Map, GeoJSON, markers)"
```

---

### Task 5: Placeholder SVG do mapa

**Files:**
- Create: `apps/web/src/components/home/mapa-malha-placeholder.tsx`
- Modify: `apps/web/src/index.css` (classes `.malha-svg`, `.praca-dot`)

**Interfaces:**
- Consumes: `BRASIL_VIEWBOX`, `BRASIL_STATE_PATHS`, `projectLngLat` (Task 1); `PRACAS` (Task 2).
- Produces: `MapaMalhaPlaceholder({ className?: string })` — server component, `aria-hidden`, preenche o container pai (`h-full w-full`).

- [ ] **Step 1: Componente**

```tsx
import { cn } from "@cbs-site/ui/lib/utils";

import {
	BRASIL_STATE_PATHS,
	BRASIL_VIEWBOX,
	projectLngLat,
} from "./brasil-outline";
import { PRACAS } from "./pracas";

/**
 * O Brasil em tinta, sem WebGL: mesmo contorno e mesmos pontos do mapa
 * mapcn, para ocupar o lugar enquanto o MapLibre carrega e para ficar no
 * lugar dele se o WebGL não montar. Server component — sai no HTML.
 */
export function MapaMalhaPlaceholder({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden
			className={cn("malha-svg h-full w-full", className)}
			viewBox={BRASIL_VIEWBOX}
		>
			<title>Mapa do Brasil com as praças da malha</title>
			<g className="malha-svg-states">
				{BRASIL_STATE_PATHS.map((d) => (
					<path d={d} key={d.slice(0, 24)} />
				))}
			</g>
			<g className="malha-svg-pracas">
				{PRACAS.map(({ nome, lngLat }) => {
					const [x, y] = projectLngLat(lngLat[0], lngLat[1]);
					return (
						<g className="praca-dot" key={nome}>
							<circle className="praca-dot-halo" cx={x} cy={y} r={14} />
							<circle className="praca-dot-core" cx={x} cy={y} r={6} />
						</g>
					);
				})}
			</g>
		</svg>
	);
}
```

Nota: `key={d.slice(0, 24)}` é estável porque cada estado começa em coordenadas diferentes; se o Biome reclamar, trocar por `key={index}` com `// biome-ignore lint/suspicious/noArrayIndexKey: lista gerada, imutável`.

- [ ] **Step 2: CSS**

Acrescentar a `apps/web/src/index.css`, antes de `/* Asfalto da doca`:

```css
/* Mapa da malha: o Brasil é tinta sobre o papel — estados quase brancos,
   divisas brancas, contorno aqua. Os pontos das praças nascem apagados e
   acendem (`data-lit`) quando a caixa chega à estação. */
.malha-svg-states path {
	fill: #f0f9fc;
	stroke: #ffffff;
	stroke-width: 1.2;
	stroke-linejoin: round;
	paint-order: stroke;
}

.malha-svg-states {
	filter: drop-shadow(0 0 0.8px var(--color-brand-aqua));
}

.praca-dot-core {
	fill: var(--color-brand-blue);
	stroke: #ffffff;
	stroke-width: 2.5;
}

.praca-dot-halo {
	fill: none;
	stroke: var(--color-brand-blue);
	stroke-width: 1.2;
	opacity: 0.45;
}

.praca-dot {
	opacity: 0.35;
	transform-box: fill-box;
	transform-origin: center;
	transition:
		opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1),
		transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
	transition-delay: calc(var(--praca-index, 0) * 60ms);
}

[data-lit] .praca-dot {
	opacity: 1;
	transform: scale(1.08);
}

@media (prefers-reduced-motion: reduce) {
	.praca-dot {
		transition: none;
		opacity: 1;
	}
}
```

O `drop-shadow` de 0.8px é o contorno aqua do país sem precisar de uma segunda camada de geometria (a divisa externa do conjunto de estados). Não é sombra de elevação — é traço.

- [ ] **Step 3: Ver renderizado**

Adicionar temporariamente ao `page.tsx`, dentro da estação "malha" (depois do `RevealGroups`): `<div className="h-72 w-72"><MapaMalhaPlaceholder /></div>` com o import. Abrir `http://localhost:3005`, rolar até a estação, screenshot: Brasil claro com divisas, 7 pontos azuis. Remover o trecho temporário.

- [ ] **Step 4: Lint, types, commit**

```bash
cd /home/othavio/Work/cbs-site && bun run fix && bun run check && bun run check-types
git add apps/web/src/components/home/mapa-malha-placeholder.tsx apps/web/src/index.css
git commit -m "feat: placeholder SVG do mapa da malha"
```

---

### Task 6: `MapaMalha` — mapcn com montagem tardia, pontos que acendem e fallback

**Files:**
- Create: `apps/web/src/components/home/mapa-malha.tsx`
- Modify: `apps/web/src/index.css` (`.malha-map`, cross-fade)

**Interfaces:**
- Consumes: `Map`, `MapGeoJSON`, `MapMarker`, `MarkerContent` (Task 4); `BRASIL_BOUNDS`, `PRACAS`, `useAnchorFraction("malha")` (Tasks 1–3); `journeyProgress`; `useJourneyActive`; `MapaMalhaPlaceholder` (Task 5).
- Produces: `MapaMalha()` — client component; preenche o container pai; `data-lit` no container quando os pontos devem estar acesos.

- [ ] **Step 1: Componente**

```tsx
"use client";

import {
	Map,
	MapGeoJSON,
	MapMarker,
	MarkerContent,
} from "@cbs-site/ui/components/map";
import { useMotionValueEvent } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { BRASIL_BOUNDS } from "./brasil-outline";
import { journeyProgress } from "./journey-progress";
import { MapaMalhaPlaceholder } from "./mapa-malha-placeholder";
import { PRACAS } from "./pracas";
import { useAnchorFraction } from "./use-anchor-fraction";
import { useJourneyActive } from "./use-journey-active";

const GEOJSON_URL = "/geo/brasil-estados.json";
// A caixa "chegou" um pouco antes de parar exatamente sobre a âncora.
const LIT_LEAD = 0.02;
// Só montar o MapLibre quando a estação estiver a essa distância do viewport.
const MOUNT_MARGIN = "600px";

function hasWebGL(): boolean {
	try {
		const canvas = document.createElement("canvas");
		return Boolean(
			canvas.getContext("webgl2") ?? canvas.getContext("webgl")
		);
	} catch {
		return false;
	}
}

/**
 * O Brasil da malha em mapcn: `Map blank` (sem tiles, sem controles, sem
 * interação) + GeoJSON local dos estados + um marcador por praça. O SVG
 * estático fica por baixo até o mapa desenhar (cross-fade via
 * `data-map-ready`) e fica sozinho se não houver WebGL.
 */
export function MapaMalha() {
	const container = useRef<HTMLDivElement>(null);
	const [shouldMount, setShouldMount] = useState(false);
	const [ready, setReady] = useState(false);
	const journeyActive = useJourneyActive();
	const malhaAt = useAnchorFraction("malha");
	const [lit, setLit] = useState(false);

	// Montagem tardia: o MapLibre só entra quando a estação se aproxima.
	useEffect(() => {
		const el = container.current;
		if (!el || !hasWebGL()) {
			return;
		}
		const io = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					setShouldMount(true);
					io.disconnect();
				}
			},
			{ rootMargin: MOUNT_MARGIN }
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);

	// Sem coreografia (mobile / reduced-motion) os pontos já nascem acesos.
	useEffect(() => {
		if (!journeyActive) {
			setLit(true);
		}
	}, [journeyActive]);

	useMotionValueEvent(journeyProgress, "change", (p) => {
		if (journeyActive) {
			setLit(p >= malhaAt - LIT_LEAD);
		}
	});

	return (
		<div
			className="malha-map pointer-events-none relative h-full w-full"
			data-lit={lit ? "" : undefined}
			data-map-ready={ready ? "" : undefined}
			ref={container}
		>
			<MapaMalhaPlaceholder className="malha-map-fallback absolute inset-0" />
			{shouldMount ? (
				<Map
					attributionControl={false}
					blank
					bounds={BRASIL_BOUNDS}
					className="malha-map-gl absolute inset-0"
					fitBoundsOptions={{ padding: 12 }}
					interactive={false}
					loading={false}
					onLoad={() => setReady(true)}
					theme="light"
				>
					<MapGeoJSON
						data={GEOJSON_URL}
						fillPaint={{ "fill-color": "#f0f9fc" }}
						linePaint={{ "line-color": "#ffffff", "line-width": 1.2 }}
					/>
					{PRACAS.map(({ nome, lngLat }, index) => (
						<MapMarker key={nome} latitude={lngLat[1]} longitude={lngLat[0]}>
							<MarkerContent>
								<span
									className="praca-dot block size-3 rounded-full bg-brand-blue ring-2 ring-white"
									style={{ "--praca-index": index } as React.CSSProperties}
								/>
							</MarkerContent>
						</MapMarker>
					))}
				</Map>
			) : null}
		</div>
	);
}
```

**Atenção ao `onLoad`:** `Map` espalha `MapOptions` no construtor, e `onLoad` não é opção do MapLibre. Se o `map.tsx` gerado não expuser um callback de load, usar o `ref`: `const mapRef = useRef<MapRef>(null)` + `useEffect` que faz `mapRef.current?.once("idle", () => setReady(true))` quando `shouldMount` vira `true` (checar `MapRef` no `export type` do arquivo gerado). Marcar `ready` é o que dispara o cross-fade.

- [ ] **Step 2: CSS do cross-fade e do marcador**

Acrescentar a `apps/web/src/index.css`, logo após o bloco da Task 5:

```css
/* Cross-fade SVG -> MapLibre quando o mapa desenhou. O canvas do MapLibre
   fica transparente (blank) e os estados vêm do GeoJSON local. */
.malha-map-gl {
	opacity: 0;
	transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

[data-map-ready] .malha-map-gl {
	opacity: 1;
}

[data-map-ready] .malha-map-fallback {
	opacity: 0;
	transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Marcadores DOM do MapLibre: mesmo acendimento dos pontos do SVG. */
.malha-map .maplibregl-marker .praca-dot {
	opacity: 0.35;
	transform: scale(1);
	transition:
		opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1),
		transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
	transition-delay: calc(var(--praca-index, 0) * 60ms);
	box-shadow: 0 0 0 6px rgb(29 157 216 / 0.18);
}

.malha-map[data-lit] .maplibregl-marker .praca-dot {
	opacity: 1;
	transform: scale(1.15);
}
```

(O `box-shadow` aqui é o halo do ponto — elemento gráfico de 12px, não contêiner de conteúdo; é a mesma função do `praca-dot-halo` do SVG.)

- [ ] **Step 3: Montar provisoriamente e verificar no browser**

Em `page.tsx`, dentro da estação "malha", acrescentar provisoriamente `<div className="h-96 w-96"><MapaMalha /></div>` (import via `next/dynamic`: `const MapaMalha = dynamic(() => import("@/components/home/mapa-malha").then((m) => m.MapaMalha), { ssr: false });`). Abrir `http://localhost:3005`, rolar até a estação e conferir, em duas chamadas de `browser_batch` (a primeira arma `read_console_messages` + `read_network_requests`, a segunda navega):

1. `read_network_requests` com `urlPattern: "geo/"` → `brasil-estados.json` 200; com `urlPattern: "carto"` ou `"basemaps"` → nenhum.
2. `read_console_messages` pattern `error|maplibre|WebGL` → vazio.
3. Screenshot: o SVG some e o MapLibre aparece com o mesmo desenho (sem "pulo" de posição — se houver, ajustar `fitBoundsOptions.padding` até o contorno do GL coincidir com o do SVG).
4. Rolar devagar até a caixa parar: os 7 pontos acendem em sequência. `javascript_tool`: `document.querySelector('.malha-map').hasAttribute('data-lit')` → `true`.

Remover o trecho provisório do `page.tsx` (a composição definitiva é a Task 7).

- [ ] **Step 4: Lint, types, commit**

```bash
cd /home/othavio/Work/cbs-site && bun run fix && bun run check && bun run check-types
git add apps/web/src/components/home/mapa-malha.tsx apps/web/src/index.css
git commit -m "feat: mapa da malha em mapcn com fallback SVG"
```

---

### Task 7: Composição D2 na estação "malha"

**Files:**
- Modify: `apps/web/src/app/page.tsx` (`Station`, ~linhas 181-225; estação "malha", ~linhas 350-370)

**Interfaces:**
- Consumes: `MapaMalha` (Task 6) via `next/dynamic`.
- Produces: `Station` aceita `backdrop?: React.ReactNode` e `visualClassName?: string`.

- [ ] **Step 1: Estender `Station`**

Substituir a assinatura e a coluna visual de `Station` por:

```tsx
function Station({
	anchor,
	backdrop,
	children,
	flip = false,
	title,
	variant,
}: {
	anchor: string;
	/** Camada atrás do objeto 3D (ex.: o mapa da malha). Substitui a névoa. */
	backdrop?: React.ReactNode;
	children: React.ReactNode;
	flip?: boolean;
	title: string;
	variant: "caminhao" | "frasco" | "selo";
}) {
	const hasBackdrop = Boolean(backdrop);
	return (
		<section className="relative mx-auto grid min-h-[80vh] max-w-6xl items-center gap-10 px-6 py-24 lg:grid-cols-2">
			{hasBackdrop ? null : (
				<div
					className="mist-side absolute inset-y-0 left-1/2 w-screen -translate-x-1/2"
					style={{ "--mist-x": flip ? "18%" : "82%" } as React.CSSProperties}
				/>
			)}
			<div className={`relative z-20 ${flip ? "lg:order-2" : ""}`}>
				<Reveal>
					<h2 className="max-w-md font-bold font-display text-4xl text-brand-navy leading-tight tracking-tight sm:text-5xl">
						{title}
					</h2>
				</Reveal>
				{children}
			</div>
			{hasBackdrop ? (
				/* Composição D2: mapa no alto-direita, bolha em baixo-esquerda —
				   a diagonal do rio líquido. Abaixo de lg empilha. */
				<div className="relative z-10 flex min-h-[520px] flex-col items-center gap-6 lg:block">
					<div className="relative h-72 w-72 lg:absolute lg:top-0 lg:right-0 lg:h-[380px] lg:w-[380px]">
						{backdrop}
					</div>
					<div
						aria-hidden
						className="relative h-72 w-72 lg:absolute lg:bottom-0 lg:left-0 lg:h-80 lg:w-80"
					>
						<div className="absolute inset-0" data-s-anchor={variant} />
						<div
							className="absolute top-full -right-10 hidden h-24 w-24 -translate-y-1/2 lg:block"
							data-j-anchor={anchor}
						/>
					</div>
				</div>
			) : (
				<div
					className={`relative z-10 flex justify-center ${flip ? "lg:order-1" : ""}`}
				>
					<div aria-hidden className="relative h-72 w-72 sm:h-96 sm:w-96">
						<div className="absolute inset-0" data-s-anchor={variant} />
						{/* Parada da caixa: logo abaixo da bolha, na coluna dela — a
						    travessia nunca atravessa a coluna de texto. */}
						<div
							className={`absolute top-full hidden h-24 w-24 -translate-y-1/2 lg:block ${
								flip ? "-left-10" : "-right-10"
							}`}
							data-j-anchor={anchor}
						/>
					</div>
				</div>
			)}
		</section>
	);
}
```

- [ ] **Step 2: Passar o mapa na estação "malha"**

No topo de `page.tsx`:

```tsx
import dynamic from "next/dynamic";

const MapaMalha = dynamic(
	() => import("@/components/home/mapa-malha").then((m) => m.MapaMalha),
	{ ssr: false }
);
```

Se `page.tsx` for server component e o `dynamic` com `ssr:false` reclamar ("`ssr: false` is not allowed in Server Components"), criar `apps/web/src/components/home/mapa-malha-lazy.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";

import { MapaMalhaPlaceholder } from "./mapa-malha-placeholder";

export const MapaMalhaLazy = dynamic(
	() => import("./mapa-malha").then((m) => m.MapaMalha),
	{ loading: () => <MapaMalhaPlaceholder />, ssr: false }
);
```

e usar `<MapaMalhaLazy />` no lugar.

Na estação:

```tsx
<Station
	anchor="malha"
	backdrop={<MapaMalha />}
	title="Fábricas onde o frete nasce menor."
	variant="caminhao"
>
```

- [ ] **Step 3: Conferir a cena 3D**

A `AnchoredGroup` do caminhão lê `[data-s-anchor="caminhao"]` a cada frame — o novo tamanho (320px em `lg`) reescala a bolha sozinho. A parada da caixa (`data-j-anchor="malha"`) continua "abaixo da bolha, à direita". Rolar a página inteira em `http://localhost:3005`: a caixa para ao lado do caminhão, não sobre o mapa nem sobre o texto; o rio (`LiquidPath`) remede as âncoras no resize (ele já escuta `resize`), e `useAnchorFraction` também.

- [ ] **Step 4: Provas visuais**

1. Desktop (viewport ≥ 1280): screenshot da estação 3 e comparar lado a lado com `.superpowers/brainstorm/662928-1787323468/content/d-composition.html` (card D2) — mapa alto-direita, caminhão baixo-esquerda, pontos visíveis, chips iguais.
2. Mobile: no Chrome, DevTools → device toolbar 390×844 (ou `resize_window` se o WM obedecer): mapa (288px) acima da bolha, sem sobreposição, sem scroll horizontal (`document.documentElement.scrollWidth === innerWidth`).
3. `prefers-reduced-motion: reduce` emulado (DevTools → Rendering): pontos já acesos ao chegar, sem transição.
4. WebGL desligado (`chrome://flags/#disable-webgl` ou abrir com `--disable-webgl`): o SVG fica; `read_console_messages` sem erro não tratado.
5. `read_network_requests`: nenhuma chamada a `carto`, `basemaps`, `jsdelivr`.

- [ ] **Step 5: Detector, lint, types, commit**

```bash
cd /home/othavio/Work/cbs-site && bun run fix && bun run check && bun run check-types
cd apps/web && node /home/othavio/.claude/skills/impeccable/scripts/detect.mjs --json src/app src/components
```

Expected: `[]`, exit 0. Um achado `ai-color-palette` sobre o mapa seria falso positivo (tokens de marca) — registrar, não "corrigir".

```bash
git add apps/web/src/app/page.tsx apps/web/src/components/home/mapa-malha-lazy.tsx
git commit -m "feat: mapa da malha na estação (composição D2)"
```

---

### Task 8: Documentação — ADR, DESIGN.md, surface brief, CONTEXT.md

**Files:**
- Create: `docs/adr/0001-mapa-malha-mapcn.md`
- Modify: `apps/web/DESIGN.md` (seção Components; Do's and Don'ts)
- Modify: `apps/web/.impeccable/surfaces/apps-web-src-app-page-tsx.md` (inventário)
- Modify: `CONTEXT.md` (seção "A malha")

- [ ] **Step 1: ADR**

`docs/adr/0001-mapa-malha-mapcn.md`:

```markdown
# ADR-0001 — Mapa da malha com mapcn

Data: 2026-08-21. Status: aceito.

## Contexto

O argumento-mestre do site é o ganho de frete pela malha de fábricas junto aos CDs do Mercado Livre. A estação 3 da home só tinha texto e chips; faltava a prova visual. O cliente informou 7 praças (cidade/estado), nada mais: nenhum endereço de fábrica nem localização autorizada de CD.

## Decisão

- Mapa do Brasil com as 7 praças na estação 3, composição D2 (mapa no alto-direita, bolha do caminhão em baixo-esquerda), como fundo — não como UI.
- Biblioteca: mapcn (`@mapcn/map`, MapLibre GL v6) instalado em `packages/ui` pelo CLI do shadcn. Uso restrito a `Map blank` + `MapGeoJSON` + `MapMarker`; sem controles, tiles, interação ou popups.
- Dados locais: `apps/web/public/geo/brasil-estados.json` (Natural Earth v5.1.2, 50m, 27 estados, domínio público), gerado por `apps/web/scripts/geo/build-brasil.mjs`. Nenhuma chamada externa em runtime.
- Praças em `src/components/home/pracas.ts`; coordenadas são a capital/cidade de referência, não endereço de fábrica. Só as praças: CDs do ML e rotas ficaram fora por não serem autorizados/verdadeiros.
- Placeholder e fallback: SVG estático com a mesma geometria (`brasil-outline.ts`), usado enquanto o MapLibre carrega e sozinho quando não há WebGL.
- Motion: pontos acendem lendo `journeyProgress` contra a fração da âncora "malha" (`journey-math.ts`); sem listener de scroll novo.

## Consequências

- +~250 KB gzip de JS (maplibre-gl) no cliente para desenhar o que o SVG já desenha. Aceito por decisão explícita do dono do projeto; mitigado com montagem tardia (IntersectionObserver, 600px) e `ssr:false`. Plano B documentado: trocar `MapaMalha` pelo SVG definitivo sem mudar o contrato visual.
- Atualizar o mapa = rodar o script de build de novo (mesma fonte e versão).
- Qualquer dado novo no mapa (CD, rota, endereço) exige autorização do cliente e nova ADR.
```

- [ ] **Step 2: DESIGN.md**

Em `apps/web/DESIGN.md`, dentro de `## Components`, antes de `### Bolha-Pacote (Signature Component)`, inserir:

```markdown
### Mapa da malha
O Brasil como tinta atrás da estação "Fábricas onde o frete nasce menor.": `Map blank` do mapcn (MapLibre, sem tiles, sem controles, `interactive={false}`, `pointer-events-none`) com o GeoJSON local dos estados (`#f0f9fc`, divisas brancas de 1.2px, contorno aqua) e um marcador por praça (`brand-blue` com anel branco e halo aqua). Composição D2: mapa de 380px no alto-direita da coluna visual, bolha do caminhão (320px) em baixo-esquerda — a diagonal do rio líquido. Abaixo de `lg`, mapa (288px) acima da bolha. Os pontos nascem a 35% e acendem em sequência de 60ms quando a caixa chega à estação (`journeyProgress` ≥ fração da âncora "malha"); com `prefers-reduced-motion` ou abaixo de 1024px já nascem acesos. Um SVG com a mesma geometria (`MapaMalhaPlaceholder`) ocupa o lugar até o MapLibre desenhar e permanece se não houver WebGL.

**A Regra do Mapa-Tinta.** O mapa nunca é interface: sem zoom, pan, tooltip, popup, rótulo ou controle; os chips da estação continuam sendo a legenda. Só as 7 praças do cliente aparecem — nada de CDs, rotas ou endereços.
```

Em `### Don't:` acrescentar:

```markdown
- **Don't** adicionar interação, tiles ou camadas novas ao mapa da malha — ele é tinta de fundo (Regra do Mapa-Tinta); dado novo no mapa passa por autorização do cliente e ADR.
```

- [ ] **Step 3: Surface brief**

Em `apps/web/.impeccable/surfaces/apps-web-src-app-page-tsx.md`, na tabela "Inventário de fidelidade", acrescentar a linha:

```markdown
| Mapa da malha (Brasil + 7 praças, fundo da estação 3, composição D2) | mapcn `Map blank` + GeoJSON local + `MapMarker`; SVG placeholder/fallback |
```

E ao final, nova seção:

```markdown
## Mapa da malha (2026-08-21)

Decisões com o usuário via visual companion: dados = só as 7 praças; posição = D (fundo da estação 3); composição = D2. Comps: `.superpowers/brainstorm/662928-1787323468/content/layout-v4.html` e `d-composition.html`. ADR-0001.
```

- [ ] **Step 4: CONTEXT.md**

Em `CONTEXT.md`, seção `### A malha`, depois de **CD**:

```markdown
**Praça**:
A cidade ou estado de referência de cada fábrica da malha, como o cliente informou (São Paulo, Minas Gerais, Curitiba, Pernambuco, Bahia, Rio Grande do Sul, Centro do Brasil). É o que aparece nos chips e nos pontos do mapa da home; não é endereço.
_Avoid_: endereço, unidade, localização da fábrica
```

- [ ] **Step 5: Commit**

```bash
cd /home/othavio/Work/cbs-site && bun run fix
git add docs/adr/0001-mapa-malha-mapcn.md apps/web/DESIGN.md apps/web/.impeccable/surfaces/apps-web-src-app-page-tsx.md CONTEXT.md
git commit -m "docs: ADR e design do mapa da malha"
```

---

## Self-review

- **Cobertura do spec:** componente mapcn (T4, T6); dados locais + script (T1); praças fonte única (T2); composição D2 + mobile + remoção da névoa (T7); motion via `journeyProgress` sem scroll listener (T3, T6); reduced-motion (T5 CSS, T6); placeholder/fallback WebGL (T5, T6); montagem tardia (T6); sem `DefaultLoader` (`loading={false}`, T6); cross-fade `data-map-ready` (T6); trade-off de peso (ADR, T8); docs 1–4 (T8); verificação completa (T6 step 3, T7 step 4–5). Critique pós-merge fica para o usuário rodar.
- **Placeholders:** nenhum "TBD"; o único ponto condicional é o callback de load do `Map` (T6), com os dois caminhos escritos.
- **Tipos:** `pracasPorRegiao()` devolve `{ label, items }[]`, o mesmo shape de `RevealGroup` em `reveal.tsx`; `useAnchorFraction("malha")` usa o union de `JOURNEY_ANCHORS`; `BRASIL_BOUNDS` é `[[w,s],[e,n]]`, o formato `LngLatBoundsLike` do MapLibre; `projectLngLat(lng, lat)` recebe `lngLat[0], lngLat[1]` em T5.
