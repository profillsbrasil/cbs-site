# Home mobile (< 1024px) — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recompor a home da CBS abaixo de 1024px — bolhas como imagem, hero com bolha acima do título e CTAs no pé, estações com lado fixo, malha condensada, navbar sem pill no topo, rodapé sem botões — sem tocar na jornada do desktop.

**Architecture:** Abaixo de `lg` o canvas WebGL não monta (gate por `matchMedia` antes do `import()`); as bolhas viram WebP pré-renderizados por uma rota de desenvolvimento e entram no fluxo do layout como `<Image>`. `page.tsx` ganha blocos `lg:hidden` (celular) ao lado dos blocos `hidden lg:*` (desktop) para hero e estações; a textura de bolhas-fantasma vira componente reutilizável. Navbar, chegada e rodapé são ajustes locais.

**Tech Stack:** Next.js 16 (App Router, `next/image`, `next/dynamic`), React 19, Tailwind v4, motion/react, react-three-fiber + drei (só na rota de render e no desktop), bun test, agent-browser (capturas), ImageMagick (`magick`).

**Spec:** `docs/superpowers/specs/2026-08-31-home-mobile-redesign-design.md`

## Global Constraints

- Nada muda em `≥ 1024px`, exceto o rodapé (§6 da spec). Toda classe nova abaixo de `lg` vem acompanhada do comportamento antigo em `lg:`.
- Em 390px nenhum chunk de `three`, `@react-three` ou `maplibre-gl` pode descer ao aparelho.
- Regras do DESIGN.md preservadas: Branco Dominante, Dois Brancos, Raio Binário (`rounded-full` ou nada), Sem-Sombra-em-Superfície-Plana, Display Só em Título (`font-display` literal), Envelope de Bolha, Mapa-Tinta, 44px (`min-h-11`).
- Tokens abaixo de 768px: H1 40px (`text-[2.5rem]`), H2 30px (`text-3xl`), corpo 16px, `py` de estação 40px (`py-10`), bolha de estação `size-[clamp(11rem,55vw,14rem)]`, bolha do hero `size-[clamp(13rem,62vw,17rem)]`. Em 768–1023: H1 `md:text-6xl`, H2 `md:text-4xl`, `md:py-14`.
- Assets em `apps/web/public/bolhas/{caixa,frasco,selo,vidro}.webp`, lado 800px.
- Comandos, sempre em `apps/web`: `bun test`, `bun run check-types`; na raiz: `bun run check`. Dev server desta sessão: porta 3005 (`/tmp/dev-up-3005.log`); porta padrão do projeto: 3001.
- Hook do projeto roda `bun run fix` no repo inteiro após cada Write/Edit e reformata `apps/web/public/warehouse-delivery.svg`. Antes de cada commit: `git diff --quiet -- apps/web/public/warehouse-delivery.svg || git checkout -- apps/web/public/warehouse-delivery.svg`.
- Commits em Conventional Commits, português, subject ≤ 50 caracteres. Branch `reatividade`. Sem `--no-verify`, sem push em `main`.
- Capturas de verificação com agent-browser (`set viewport 390 844 2`), nunca com o `computer` da extensão Chrome (DPR 3,5 devolve 99×220).
- Componentes R3F novos levam a diretiva `"use no memo"` (React Compiler), como `scene3d.tsx`.

---

## Estrutura de arquivos

| Arquivo | Responsabilidade |
| --- | --- |
| `apps/web/src/app/render-bolhas/page.tsx` (novo) | Rota só em desenvolvimento que monta uma bolha isolada para captura |
| `apps/web/src/app/render-bolhas/render-bolhas-canvas.tsx` (novo) | Client component com o `<Canvas>` transparente e a bolha pedida por `?obj=` |
| `apps/web/scripts/render-bolhas.md` (novo) | Receita de captura dos 4 WebP (comandos, data, commit de origem) |
| `apps/web/public/bolhas/*.webp` (novos) | Os 4 assets |
| `apps/web/src/components/home/use-wide.ts` (novo) | Hook `useWide()` — `matchMedia("(min-width: 1024px)")` reativo |
| `apps/web/src/components/home/scene3d-lazy.tsx` (modificar) | Gate: só importa `scene3d` quando `useWide()` é `true` |
| `apps/web/src/components/home/bubble-ghosts.tsx` (novo) | Textura de bolhas-fantasma por seção, `lg:hidden` |
| `apps/web/src/components/home/bolha-imagem.tsx` (novo) | `<BolhaImagem obj>` (Image WebP) e `<BolhaFabrica>` (SVG animado + vidro, com reduced-motion) |
| `apps/web/src/components/home/pracas.ts` + `.test.ts` (modificar) | `pracasPlanas()` |
| `apps/web/src/app/page.tsx` (modificar) | Hero, `Station`, `StationSlot`, malha, chegada |
| `apps/web/src/components/navbar.tsx` (modificar) | Pill só na cápsula abaixo de `md` |
| `apps/web/src/components/home/entrega-titulo.tsx` (modificar) | H2 da chegada 36px abaixo de `sm` |
| `apps/web/src/components/footer.tsx` (modificar) | Sem CTAs; links de texto de contato |
| `apps/web/DESIGN.md` (modificar) | Regras novas e ajustes (§8 da spec) |

---

### Task 0: Capturas de referência ("antes")

**Files:** nenhum no repo; saída em `/tmp/cbs-mobile/antes/`.

Tem de rodar **antes da Task 1** — a partir da Task 2 o celular já perde o canvas e a captura deixaria de ser o baseline. As capturas do brainstorm em `/tmp/claude-1000/-home-othavio-Work-cbs-site/a4c79f6d-1878-4b05-9be3-b3b34f55c004/scratchpad/shots/cbs-*.png` servem como reserva se `/tmp/cbs-mobile` se perder.

- [ ] **Step 1: Capturar e medir**

```bash
mkdir -p /tmp/cbs-mobile/antes
export AGENT_BROWSER_SESSION="$(agent-browser session id --scope worktree --prefix antes)"
agent-browser open http://localhost:3005 >/dev/null; agent-browser set viewport 390 844 2 >/dev/null
agent-browser wait --load networkidle >/dev/null; agent-browser wait 1500 >/dev/null
agent-browser screenshot /tmp/cbs-mobile/antes/390-hero.png
agent-browser screenshot --full /tmp/cbs-mobile/antes/390-full.png
agent-browser eval "JSON.stringify({docH:document.documentElement.scrollHeight, hero:document.getElementById('topo').getBoundingClientRect().height, footer:document.querySelector('footer').getBoundingClientRect().height})"
agent-browser set viewport 320 700 2 >/dev/null; agent-browser wait 800 >/dev/null
agent-browser screenshot /tmp/cbs-mobile/antes/320-hero.png
agent-browser set viewport 768 1024 2 >/dev/null; agent-browser wait 800 >/dev/null
agent-browser screenshot --full /tmp/cbs-mobile/antes/768-full.png
agent-browser set viewport 1440 900 1 >/dev/null; agent-browser wait 2500 >/dev/null
agent-browser screenshot --full /tmp/cbs-mobile/antes/1440-full.png
agent-browser close
```

Guardar a saída do `eval` em `/tmp/cbs-mobile/antes/metricas.json` (esperado hoje: `docH` ≈ 4457, `hero` ≈ 844–915, `footer` ≈ 576).

---

### Task 1: Rota de render e os 4 assets WebP

**Files:**
- Create: `apps/web/src/app/render-bolhas/page.tsx`
- Create: `apps/web/src/app/render-bolhas/render-bolhas-canvas.tsx`
- Create: `apps/web/scripts/render-bolhas.md`
- Create: `apps/web/public/bolhas/caixa.webp`, `frasco.webp`, `selo.webp`, `vidro.webp`

**Interfaces:**
- Consumes: `SoapBubble`, `StudioRig` de `@/components/home/scene-bits`; `Frasco`, `Selo` de `@/components/home/station-models`; `CardboardBox` de `@/components/home/cardboard-box`.
- Produces: os 4 arquivos em `public/bolhas/` (Task 4 e 5 os consomem por caminho) e a rota `/render-bolhas?obj=caixa|frasco|selo|vidro` (só dev).

- [ ] **Step 1: Criar o client component do canvas**

```tsx
// apps/web/src/app/render-bolhas/render-bolhas-canvas.tsx
"use client";

// biome-ignore-start lint: diretiva do React Compiler
"use no memo";
// biome-ignore-end lint: diretiva do React Compiler

import { Canvas } from "@react-three/fiber";

import { CardboardBox } from "@/components/home/cardboard-box";
import { SoapBubble, StudioRig } from "@/components/home/scene-bits";
import { Frasco, Selo } from "@/components/home/station-models";

export type BolhaObj = "caixa" | "frasco" | "selo" | "vidro";

export const BOLHA_OBJS: readonly BolhaObj[] = [
	"caixa",
	"frasco",
	"selo",
	"vidro",
];

/** Mesmos raios da cena real: hero 1.85 (quality lite), estação 1.55 (station). */
const RAIO: Record<BolhaObj, number> = {
	caixa: 1.85,
	frasco: 1.55,
	selo: 1.55,
	vidro: 1.55,
};

function Conteudo({ obj }: { obj: BolhaObj }) {
	if (obj === "caixa") {
		return <CardboardBox />;
	}
	if (obj === "frasco") {
		return <Frasco />;
	}
	if (obj === "selo") {
		return <Selo />;
	}
	return null;
}

/**
 * Bolha isolada, centrada, fundo transparente — a rota existe só para gerar
 * `public/bolhas/*.webp` (ver scripts/render-bolhas.md). Câmera e luzes são as
 * da cena real para o render bater com o desktop.
 */
export function RenderBolhasCanvas({ obj }: { obj: BolhaObj }) {
	return (
		<div className="size-[800px]" data-render-bolha={obj}>
			<Canvas
				camera={{ fov: 35, position: [0, 0, 8] }}
				dpr={1}
				frameloop="always"
				gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
			>
				<StudioRig />
				<group scale={obj === "caixa" ? 1.15 : 1.35}>
					<SoapBubble
						quality={obj === "caixa" ? "lite" : "station"}
						radius={RAIO[obj]}
					/>
					<Conteudo obj={obj} />
				</group>
			</Canvas>
		</div>
	);
}
```

- [ ] **Step 2: Criar a página, bloqueada fora de desenvolvimento**

```tsx
// apps/web/src/app/render-bolhas/page.tsx
import { notFound } from "next/navigation";

import {
	BOLHA_OBJS,
	type BolhaObj,
	RenderBolhasCanvas,
} from "./render-bolhas-canvas";

/** Rota de ferramenta: só existe em `next dev`. Em produção é 404. */
export default async function RenderBolhasPage({
	searchParams,
}: {
	searchParams: Promise<{ obj?: string }>;
}) {
	if (process.env.NODE_ENV !== "development") {
		notFound();
	}
	const { obj } = await searchParams;
	if (!BOLHA_OBJS.includes(obj as BolhaObj)) {
		notFound();
	}
	return (
		<main className="grid min-h-screen place-items-center bg-transparent">
			<RenderBolhasCanvas obj={obj as BolhaObj} />
		</main>
	);
}
```

O `bg-brand-paper` do `<body>` (em `layout.tsx`) pinta o fundo; a captura com `omitBackground` só zera fundos transparentes, então nesta rota o `<main>` precisa cobrir o body: adicionar em `apps/web/src/index.css`:

```css
/* Rota de render das bolhas: fundo transparente para a captura com alfa. */
html:has([data-render-bolha]),
html:has([data-render-bolha]) body {
	background: transparent;
}
```

- [ ] **Step 3: Confirmar que a rota responde no dev server e some em produção**

Run: `curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3005/render-bolhas?obj=frasco"` → Expected: `200`.
Run: `curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3005/render-bolhas?obj=x"` → Expected: `404`.
Run (types): `cd apps/web && bun run check-types` → Expected: sem erros.

- [ ] **Step 4: Capturar os 4 objetos com agent-browser**

```bash
cd apps/web && mkdir -p public/bolhas
export AGENT_BROWSER_SESSION="$(agent-browser session id --scope worktree --prefix bolhas)"
for obj in caixa frasco selo vidro; do
  agent-browser open "http://localhost:3005/render-bolhas?obj=$obj"
  agent-browser set viewport 800 800 1
  agent-browser wait --load networkidle
  agent-browser wait 2500
  agent-browser screenshot "/tmp/bolha-$obj.png"
done
agent-browser close
```

Se `agent-browser screenshot` não tiver flag de fundo transparente, o PNG sai com fundo branco: nesse caso a Step 5 segue pelo **plano B** (recorte circular).

- [ ] **Step 5: Converter para WebP e checar o alfa**

```bash
cd apps/web
for obj in caixa frasco selo vidro; do
  magick "/tmp/bolha-$obj.png" -trim +repage -resize 800x800 -background none -gravity center -extent 800x800 -quality 90 "public/bolhas/$obj.webp"
  magick identify -format "%f %[channels] alpha=%[opaque]\n" "public/bolhas/$obj.webp"
done
ls -la public/bolhas
```

Expected: 4 arquivos, cada um `< 120 KB`, `alpha=false` (ou seja, **tem** pixels transparentes). Se sair `alpha=true` (opaco), plano B: manter o fundo do papel e recortar em círculo —

```bash
magick "/tmp/bolha-$obj.png" -trim +repage -resize 800x800 -gravity center -extent 800x800 \
  \( +clone -alpha extract -fill black -colorize 100 -fill white -draw "circle 400,400 400,10" \) \
  -alpha off -compose copy_opacity -composite -quality 90 "public/bolhas/$obj.webp"
```

e registrar em `scripts/render-bolhas.md` que os assets são "papel + recorte circular" (o `<Image>` da Task 4 usa `rounded-full` de qualquer modo).

- [ ] **Step 6: Escrever a receita**

```markdown
<!-- apps/web/scripts/render-bolhas.md -->
# Bolhas pré-renderizadas (`public/bolhas/*.webp`)

Abaixo de 1024px o canvas WebGL não monta; as bolhas do hero e das estações são
estas imagens. **Modelo 3D mudou (cardboard-box, station-models, scene-bits) →
regerar.**

Origem: commit `<hash do HEAD ao gerar>`, gerado em <data>.
Modo: <alfa transparente | papel + recorte circular>.

1. `bun run dev:web` (ou o dev server em uso) e abrir `/render-bolhas?obj=<caixa|frasco|selo|vidro>`.
2. Capturar 800×800 com agent-browser (comandos abaixo) e converter com ImageMagick.

```bash
<colar os dois blocos de comandos das Steps 4 e 5, já com o plano escolhido>
```
```

- [ ] **Step 7: Commit**

```bash
cd /home/othavio/Work/cbs-site
git diff --quiet -- apps/web/public/warehouse-delivery.svg || git checkout -- apps/web/public/warehouse-delivery.svg
git add apps/web/src/app/render-bolhas apps/web/scripts/render-bolhas.md apps/web/public/bolhas apps/web/src/index.css
git commit -m "feat(web): bolhas pré-renderizadas para o mobile"
```

---

### Task 2: Gate do canvas por `matchMedia` e hook `useWide`

**Files:**
- Create: `apps/web/src/components/home/use-wide.ts`
- Modify: `apps/web/src/components/home/scene3d-lazy.tsx`
- Modify: `apps/web/src/components/home/use-journey-active.ts` (reusar a query)

**Interfaces:**
- Produces: `useWide(): boolean` e `WIDE_QUERY = "(min-width: 1024px)"`; `Scene3DLazy` continua sendo o export usado em `page.tsx`, agora um componente que só monta a cena quando `useWide()`.

- [ ] **Step 1: Criar o hook**

```ts
// apps/web/src/components/home/use-wide.ts
"use client";

import { useEffect, useState } from "react";

/** Limiar da jornada e do canvas: abaixo disso a página é imagem + CSS. */
export const WIDE_QUERY = "(min-width: 1024px)";

/**
 * `true` em telas ≥ 1024px, reagindo a resize/rotação. Começa `false` no
 * servidor e no primeiro paint — o desktop paga um frame sem canvas, o
 * celular nunca baixa o chunk do three.
 */
export function useWide(): boolean {
	const [wide, setWide] = useState(false);

	useEffect(() => {
		const query = window.matchMedia(WIDE_QUERY);
		const update = () => setWide(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);

	return wide;
}
```

- [ ] **Step 2: Reusar a query em `use-journey-active.ts`**

Trocar `window.matchMedia("(min-width: 1024px)")` por `window.matchMedia(WIDE_QUERY)` com `import { WIDE_QUERY } from "./use-wide";`.

- [ ] **Step 3: Transformar `Scene3DLazy` em gate**

```tsx
// apps/web/src/components/home/scene3d-lazy.tsx
"use client";

import dynamic from "next/dynamic";

import { useWide } from "./use-wide";

const Scene3DDynamic = dynamic(
	() => import("./scene3d").then((m) => m.Scene3D),
	{ ssr: false }
);

/**
 * A cena WebGL (three.js + R3F + drei + texturas) só existe em ≥ 1024px: o
 * teste vem ANTES do import dinâmico, senão o chunk desce ao celular mesmo
 * sem montar (mesmo padrão de MapaMalhaLazy). No desktop o HTML pinta com o
 * `HeroPlaceholder` e o vidro faz cross-fade em `data-scene-ready`.
 */
export function Scene3DLazy() {
	const wide = useWide();
	if (!wide) {
		return null;
	}
	return <Scene3DDynamic />;
}
```

**Desvio deliberado da spec §1:** `LiquidPath` **não** recebe gate. Ele não importa `three` (só `motion/react`) e já devolve `null` fora da jornada (`use-journey-active.ts` exige ≥ 1024px), então o gate só duplicaria a condição. Registrar no relatório final.

- [ ] **Step 4: Verificar que o chunk do three não desce em 390px**

```bash
export AGENT_BROWSER_SESSION="$(agent-browser session id --scope worktree --prefix gate)"
agent-browser open http://localhost:3005 >/dev/null
agent-browser set viewport 390 844 2 >/dev/null
agent-browser wait --load networkidle >/dev/null; agent-browser wait 2000 >/dev/null
agent-browser eval "performance.getEntriesByType('resource').map(r=>r.name).filter(n=>/three|react-three|maplibre|scene3d/i.test(n)).join('\n') || 'NENHUM'"
agent-browser set viewport 1440 900 1 >/dev/null; agent-browser wait 3000 >/dev/null
agent-browser eval "document.documentElement.hasAttribute('data-scene-ready')"
agent-browser close
```

Expected: `NENHUM` em 390px; `true` em 1440px (a cena monta ao alargar).

- [ ] **Step 5: Tipos e commit**

Run: `cd apps/web && bun run check-types` → sem erros.

```bash
cd /home/othavio/Work/cbs-site
git diff --quiet -- apps/web/public/warehouse-delivery.svg || git checkout -- apps/web/public/warehouse-delivery.svg
git add apps/web/src/components/home/use-wide.ts apps/web/src/components/home/scene3d-lazy.tsx apps/web/src/components/home/use-journey-active.ts
git commit -m "perf(web): canvas só monta em telas ≥1024px"
```

---

### Task 3: `BubbleGhosts` e `BolhaImagem`/`BolhaFabrica`

**Files:**
- Create: `apps/web/src/components/home/bubble-ghosts.tsx`
- Create: `apps/web/src/components/home/bolha-imagem.tsx`

**Interfaces:**
- Consumes: `.bubble-ghost` de `index.css`; `public/bolhas/*.webp` (Task 1); `/warehouse-delivery.svg` e `/textures/warehouse-delivery.png`.
- Produces:
  - `<BubbleGhosts variant="hero" | "modelo" | "qualidade" | "malha" | "chegada" />` — absoluto, `lg:hidden`, `aria-hidden`.
  - `<BolhaImagem obj="caixa" | "frasco" | "selo" className? />` — `<Image>` quadrado, `rounded-full`, `sizes`.
  - `<BolhaFabrica className? />` — `<object>` SVG (ou PNG em reduced-motion) + `vidro.webp` por cima.

- [ ] **Step 1: Criar `BubbleGhosts`**

```tsx
// apps/web/src/components/home/bubble-ghosts.tsx
export type GhostVariant = "hero" | "modelo" | "qualidade" | "malha" | "chegada";

interface Ghost {
	/** Classes de posição e tamanho (Tailwind), sempre do lado oposto à bolha-imagem. */
	className: string;
}

/**
 * Posições fixas por seção: 3–5 fantasmas de 14–44px, à esquerda (a bolha
 * de imagem sangra pela direita). Em `lg` o canvas fixo faz esse papel com
 * microbolhas reais, então o componente não renderiza.
 */
const GHOSTS: Record<GhostVariant, Ghost[]> = {
	chegada: [
		{ className: "top-6 left-4 size-7" },
		{ className: "top-24 right-6 size-4" },
		{ className: "bottom-32 left-10 size-3.5" },
	],
	hero: [
		{ className: "top-28 left-5 size-11" },
		{ className: "top-52 left-20 size-5" },
		{ className: "top-20 right-16 size-3.5" },
		{ className: "top-[62%] right-4 size-7" },
		{ className: "bottom-40 -left-3 size-9" },
	],
	malha: [
		{ className: "top-10 left-5 size-6" },
		{ className: "top-40 left-16 size-3.5" },
		{ className: "bottom-24 -left-2 size-8" },
	],
	modelo: [
		{ className: "top-8 left-4 size-6" },
		{ className: "top-36 left-16 size-3.5" },
		{ className: "bottom-20 -left-2 size-9" },
		{ className: "bottom-8 right-10 size-4" },
	],
	qualidade: [
		{ className: "top-12 left-6 size-5" },
		{ className: "top-44 left-2 size-8" },
		{ className: "bottom-16 left-24 size-3.5" },
	],
};

export function BubbleGhosts({ variant }: { variant: GhostVariant }) {
	return (
		<div
			aria-hidden
			className="pointer-events-none absolute inset-0 z-0 lg:hidden"
		>
			{GHOSTS[variant].map((ghost) => (
				<span
					className={`bubble-ghost absolute ${ghost.className}`}
					key={ghost.className}
				/>
			))}
		</div>
	);
}
```

`.bubble-ghost` (index.css:156) já traz gradiente, borda e a animação `bubble-breathe` com `nth-child` para dessincronizar; `prefers-reduced-motion` já a desliga (index.css:191).

- [ ] **Step 2: Criar `BolhaImagem` e `BolhaFabrica`**

```tsx
// apps/web/src/components/home/bolha-imagem.tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type BolhaObj = "caixa" | "frasco" | "selo";

const ALT: Record<BolhaObj, string> = {
	caixa: "",
	frasco: "",
	selo: "",
};

/**
 * Bolha de vidro pré-renderizada (`public/bolhas`, ver scripts/render-bolhas.md).
 * Decorativa: alt vazio. O pai define o tamanho (quadrado); `rounded-full`
 * garante o recorte se o asset tiver fundo de papel.
 */
export function BolhaImagem({
	className = "",
	obj,
}: {
	className?: string;
	obj: BolhaObj;
}) {
	return (
		<Image
			alt={ALT[obj]}
			className={`size-full rounded-full object-contain ${className}`}
			height={800}
			priority={obj === "caixa"}
			sizes="(max-width: 767px) 62vw, 272px"
			src={`/bolhas/${obj}.webp`}
			width={800}
		/>
	);
}

/**
 * A fábrica mantém a ilustração animada (SMIL) no celular: o SVG fica embaixo
 * e o vidro vazio (`vidro.webp`) por cima — a mesma composição que o desktop
 * faz com o canvas. Com prefers-reduced-motion entra o PNG já rasterizado.
 */
export function BolhaFabrica({ className = "" }: { className?: string }) {
	const [reduced, setReduced] = useState(false);

	useEffect(() => {
		const query = window.matchMedia("(prefers-reduced-motion: reduce)");
		const update = () => setReduced(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);

	return (
		<div className={`relative size-full ${className}`}>
			{reduced ? (
				<Image
					alt=""
					className="pointer-events-none absolute top-1/2 left-1/2 w-[110%] max-w-none -translate-x-1/2 -translate-y-[54%]"
					height={661}
					src="/textures/warehouse-delivery.png"
					width={1296}
				/>
			) : (
				/* <object> e não <img>: o Chrome congela SMIL em contexto de imagem. */
				<object
					aria-hidden
					className="pointer-events-none absolute top-1/2 left-1/2 w-[110%] max-w-none -translate-x-1/2 -translate-y-[54%] contrast-[1.06] saturate-[1.4]"
					data="/warehouse-delivery.svg"
					title=""
					type="image/svg+xml"
				/>
			)}
			<Image
				alt=""
				className="pointer-events-none absolute inset-0 size-full rounded-full object-contain"
				height={800}
				sizes="(max-width: 767px) 55vw, 224px"
				src="/bolhas/vidro.webp"
				width={800}
			/>
		</div>
	);
}
```

- [ ] **Step 3: Tipos e commit**

Run: `cd apps/web && bun run check-types` → sem erros (os componentes ainda não são usados; a Task 4 e 5 os montam).

```bash
cd /home/othavio/Work/cbs-site
git diff --quiet -- apps/web/public/warehouse-delivery.svg || git checkout -- apps/web/public/warehouse-delivery.svg
git add apps/web/src/components/home/bubble-ghosts.tsx apps/web/src/components/home/bolha-imagem.tsx
git commit -m "feat(web): bolhas-fantasma e bolha-imagem"
```

---

### Task 4: Hero (< lg)

**Files:**
- Modify: `apps/web/src/app/page.tsx` — funções `HeroPlaceholder` (linhas 13–32) e `Hero` (34–101)

**Interfaces:**
- Consumes: `BubbleGhosts`, `BolhaImagem` (Task 3).
- Produces: hero em `flex-col min-h-[100svh]` abaixo de `lg`, grid inalterado em `lg`; `data-s-anchor="hero-cluster"` e `data-j-anchor="hero"` só em `lg`.

- [ ] **Step 1: Conferir que o baseline da Task 0 existe**

Run: `ls /tmp/cbs-mobile/antes/` → Expected: `390-hero.png 390-full.png 320-hero.png 768-full.png 1440-full.png metricas.json`. Se faltar, usar as capturas do brainstorm indicadas na Task 0 — **não** recapturar agora (o estado já é intermediário).

- [ ] **Step 2: `HeroPlaceholder` só em `lg`**

Em `HeroPlaceholder`, trocar a classe do wrapper:

```tsx
className="hero-placeholder pointer-events-none absolute inset-0 hidden items-center justify-center lg:flex"
```

- [ ] **Step 3: Reescrever `Hero`**

```tsx
function Hero() {
	return (
		<section
			className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col px-6 pt-20 pb-8 lg:grid lg:grid-cols-[1.05fr_minmax(0,1fr)] lg:items-center lg:gap-10 lg:pt-28 lg:pb-16"
			id="topo"
		>
			<div className="mist-hero absolute inset-y-0 left-1/2 w-screen -translate-x-1/2" />
			<BubbleGhosts variant="hero" />
			{/* Celular/tablet: a bolha-caixa vem ANTES do título, sangrando pela
			    direita (o <main> recorta com overflow-x-clip). Em lg o visual é
			    o cluster WebGL na segunda coluna. */}
			<div
				aria-hidden
				className="rise relative z-10 ml-auto size-[clamp(13rem,62vw,17rem)] -mr-10 sm:-mr-6 md:size-[clamp(17rem,40vw,22rem)] lg:hidden"
			>
				<BolhaImagem obj="caixa" />
			</div>
			<div className="relative z-20 flex flex-1 flex-col lg:flex-none">
				<div className="rise">
					<h1 className="mt-2 max-w-xl font-bold font-display text-[2.5rem] text-brand-navy leading-[1.02] tracking-tight md:text-6xl lg:mt-0 lg:text-7xl">
						Sua marca,
						<br />
						<span className="text-brand-ink">nossa fábrica.</span>
					</h1>
				</div>
				<div
					className="rise"
					style={{ "--rise-delay": "120ms" } as React.CSSProperties}
				>
					<p className="mt-4 max-w-lg text-pretty text-base text-brand-navy/75 leading-relaxed md:mt-6 md:text-lg lg:mt-7 lg:text-xl">
						A CBS fabrica o seu saneante, aplica o seu rótulo e entrega no
						centro de distribuição do Mercado Livre, com autorização ANVISA.
						Cada fábrica fica ao lado de um CD, e{" "}
						<strong className="text-brand-navy">
							a remessa até lá sai mais barata
						</strong>
						.
					</p>
				</div>
				<div
					className="rise mt-auto pt-6 lg:mt-10 lg:pt-0"
					style={{ "--rise-delay": "220ms" } as React.CSSProperties}
				>
					<div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
						<CtaWhatsApp
							className="justify-center"
							label="Chamar no WhatsApp"
						/>
						<CtaEmail className="justify-center" />
					</div>
					<CtaReassurance className="mt-4 text-center sm:text-left" />
				</div>
			</div>
			<div
				className="relative hidden h-[560px] lg:block"
				data-s-anchor="hero-cluster"
			>
				<HeroPlaceholder />
				<div
					className="absolute top-1/2 left-1/2 size-32 -translate-x-1/2 -translate-y-1/2"
					data-j-anchor="hero"
				/>
			</div>
			<div className="scroll-hint absolute bottom-8 left-1/2 hidden translate-x-[-50%] items-center gap-2 text-brand-navy/70 text-sm lg:flex">
				<ArrowDown aria-hidden className="scroll-hint-arrow size-4" />
				Role para acompanhar a entrega
			</div>
		</section>
	);
}
```

Adicionar os imports no topo de `page.tsx`:

```tsx
import { BolhaImagem } from "@/components/home/bolha-imagem";
import { BubbleGhosts } from "@/components/home/bubble-ghosts";
```

Nota sobre o desktop: o cluster perdeu as classes `absolute top-14 -right-24 size-[…]` que só valiam abaixo de `lg`; em `lg` ele já era `relative h-[560px]`, então o layout de `≥ 1024px` não muda. O marco `data-j-anchor` era `size-[23%] lg:size-32` — agora só existe em `lg`, `size-32`.

- [ ] **Step 4: Verificar em 390, 320 e 1440**

```bash
mkdir -p /tmp/cbs-mobile/depois
export AGENT_BROWSER_SESSION="$(agent-browser session id --scope worktree --prefix hero)"
agent-browser open http://localhost:3005 >/dev/null; agent-browser set viewport 390 844 2 >/dev/null
agent-browser wait --load networkidle >/dev/null; agent-browser wait 1500 >/dev/null
agent-browser screenshot /tmp/cbs-mobile/depois/390-hero.png
agent-browser eval "(()=>{const cta=document.querySelector('#topo a[href^=\"https://wa.me\"]').getBoundingClientRect();const h1=document.querySelector('h1').getBoundingClientRect();const img=document.querySelector('#topo img[src*=\"caixa\"]').getBoundingClientRect();return JSON.stringify({ctaBottom:Math.round(cta.bottom),vh:innerHeight,h1Top:Math.round(h1.top),imgBottom:Math.round(img.bottom),h1Size:getComputedStyle(document.querySelector('h1')).fontSize})})()"
agent-browser set viewport 320 700 2 >/dev/null; agent-browser wait 800 >/dev/null
agent-browser screenshot /tmp/cbs-mobile/depois/320-hero.png
agent-browser eval "Math.round(document.querySelector('#topo a[href^=\"https://wa.me\"]').getBoundingClientRect().bottom) + ' de ' + innerHeight"
agent-browser set viewport 1440 900 1 >/dev/null; agent-browser wait 3000 >/dev/null
agent-browser screenshot /tmp/cbs-mobile/depois/1440-hero.png
agent-browser close
```

Expected em 390×844: `h1Size` = `40px`; `imgBottom` ≤ `h1Top` (bolha acima do título, sem sobreposição); `ctaBottom` ≤ 844 (CTA na dobra). Em 320×700: CTA `bottom` ≤ 700. Em 1440: captura igual a `/tmp/cbs-mobile/antes/1440-full.png` no hero (comparar a olho as duas imagens com `Read`).

- [ ] **Step 5: Lint, tipos e commit**

Run: `bun run check` (raiz) e `cd apps/web && bun run check-types` → sem erros.

```bash
cd /home/othavio/Work/cbs-site
git diff --quiet -- apps/web/public/warehouse-delivery.svg || git checkout -- apps/web/public/warehouse-delivery.svg
git add apps/web/src/app/page.tsx
git commit -m "feat(web): hero mobile com bolha acima do título"
```

---

### Task 5: `Station` e `StationSlot` com lado fixo (< lg)

**Files:**
- Modify: `apps/web/src/app/page.tsx` — `StationSlot` (linhas ~103–126) e `Station` (~128–246); as três chamadas de `<Station>` em `Home`.

**Interfaces:**
- Consumes: `BubbleGhosts`, `BolhaImagem`, `BolhaFabrica` (Task 3).
- Produces: `Station` com prop `anchor: "modelo" | "qualidade" | "malha"` tipada (o `BubbleGhosts` precisa do variant); abaixo de `lg`: visual → H2 → corpo; em `lg`: grid, `flip`, `mist-side`, `data-j-anchor` inalterados. A composição da malha (`backdrop`) abaixo de `lg` fica para a Task 6 — nesta task ela recebe o mesmo tratamento das outras duas (bolha da fábrica acima do título) e o mapa fica só em `lg`.

- [ ] **Step 1: Dividir `StationSlot` em desktop e mobile**

Cada um é renderizado **uma vez**, no wrapper do seu breakpoint (Step 2). Assim `data-s-anchor` continua único no DOM (o `AnchoredGroup` da cena usa `querySelector`) e o `<object>` do SVG de 254 KB não é instanciado em cópias escondidas — `display:none` não impede `<object>` de carregar e rodar SMIL.

```tsx
type StationVariant = "fabrica" | "frasco" | "selo";

/**
 * Slot do objeto em lg: a âncora do vidro WebGL. Na "fabrica" a ilustração
 * animada (SVG com SMIL) vive aqui no DOM, atrás do canvas: o vidro é pintado
 * por cima e ela fica "dentro" da bolha sem perder a animação.
 */
function StationSlotDesktop({ variant }: { variant: StationVariant }) {
	return (
		<div className="absolute inset-0" data-s-anchor={variant}>
			{variant === "fabrica" ? (
				/* <object> e não <img>: o Chrome congela SMIL em contexto de
				   imagem; como documento embutido a animação roda. */
				<object
					aria-hidden
					className="pointer-events-none absolute top-1/2 left-1/2 w-[135%] max-w-none -translate-x-1/2 -translate-y-[54%] contrast-[1.06] saturate-[1.4]"
					data="/warehouse-delivery.svg"
					title=""
					type="image/svg+xml"
				/>
			) : null}
		</div>
	);
}

/** Slot do objeto abaixo de lg: bolha pré-renderizada (ou SVG + vidro, na fábrica). */
function StationSlotMobile({ variant }: { variant: StationVariant }) {
	return (
		<div className="absolute inset-0">
			{variant === "fabrica" ? (
				<BolhaFabrica />
			) : (
				<BolhaImagem obj={variant} />
			)}
		</div>
	);
}
```

Apagar o `StationSlot` antigo.

- [ ] **Step 2: Reescrever `Station`**

```tsx
type StationAnchor = "modelo" | "qualidade" | "malha";

function Station({
	anchor,
	backdrop,
	children,
	flip = false,
	title,
	variant,
}: {
	anchor: StationAnchor;
	/** Camada atrás do objeto 3D em lg (ex.: o mapa da malha). Substitui a névoa. */
	backdrop?: React.ReactNode;
	children: React.ReactNode;
	flip?: boolean;
	title: string;
	variant: StationVariant;
}) {
	const hasBackdrop = Boolean(backdrop);
	// Em lg o texto alterna de lado (zigue-zague do desktop); abaixo de lg o
	// lado é fixo: visual sangrando à direita, acima do título.
	const textCol = flip ? "lg:order-2" : "";
	return (
		<section
			className={`relative mx-auto flex max-w-6xl scroll-mt-24 flex-col px-6 py-10 md:py-14 lg:grid lg:min-h-[80vh] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-10 lg:py-24`}
			id={anchor}
		>
			{hasBackdrop ? null : (
				<div
					className="mist-side absolute inset-y-0 left-1/2 hidden w-screen -translate-x-1/2 lg:block"
					style={{ "--mist-x": flip ? "18%" : "82%" } as React.CSSProperties}
				/>
			)}
			<BubbleGhosts variant={anchor} />
			<div className={`relative z-20 order-2 lg:order-none ${textCol}`}>
				<Reveal>
					<h2 className="mt-3 max-w-md font-bold font-display text-3xl text-brand-navy leading-tight tracking-tight md:text-4xl lg:mt-0 lg:text-5xl">
						{title}
					</h2>
				</Reveal>
				<div className="mt-3 lg:mt-0">{children}</div>
			</div>
			{hasBackdrop ? (
				<>
					{/* lg — composição D2: mapa no alto-direita, bolha em baixo-esquerda. */}
					<div className="relative z-10 hidden lg:block lg:min-h-[520px]">
						<div className="absolute top-0 right-0 size-[380px]">{backdrop}</div>
						<div aria-hidden className="absolute bottom-0 left-0 size-80">
							<StationSlotDesktop variant={variant} />
							<div
								className="absolute top-full -right-10 h-24 w-24 -translate-y-1/2"
								data-j-anchor={anchor}
							/>
						</div>
					</div>
					{/* < lg — a bolha da fábrica segue a regra das outras estações. */}
					<div
						aria-hidden
						className="relative z-10 order-1 ml-auto size-[clamp(11rem,55vw,14rem)] -mr-8 sm:-mr-4 lg:hidden"
					>
						<StationSlotMobile variant={variant} />
					</div>
				</>
			) : (
				<>
					<div className="relative z-10 hidden lg:flex lg:justify-center">
						<div aria-hidden className="relative size-96">
							<StationSlotDesktop variant={variant} />
							{/* Parada da caixa: logo abaixo da bolha, na coluna dela. */}
							<div
								className={`absolute top-full h-24 w-24 -translate-y-1/2 ${
									flip ? "-left-10" : "-right-10"
								}`}
								data-j-anchor={anchor}
							/>
						</div>
					</div>
					<div
						aria-hidden
						className="relative z-10 order-1 ml-auto size-[clamp(11rem,55vw,14rem)] -mr-8 sm:-mr-4 lg:hidden"
					>
						<StationSlotMobile variant={variant} />
					</div>
				</>
			)}
		</section>
	);
}
```

Conferir depois de montar: `document.querySelectorAll('[data-s-anchor="frasco"]').length` = 1 e `document.querySelectorAll('object[data*="warehouse"]').length` = 1 em qualquer largura (o `hidden lg:flex` esconde o wrapper desktop, mas o `<object>` dentro dele ainda existe — é 1 cópia, igual a hoje; abaixo de `lg` a `BolhaFabrica` adiciona a segunda, e é isso: no máximo 2).

- [ ] **Step 3: Ajustar as chamadas em `Home`**

Nos três `<Station>`, os parágrafos têm `lg:mt-6` — manter. Nada mais muda nesta task (a malha continua com `backdrop={<MapaMalhaLazy />}`, agora renderizado só em `lg` até a Task 6).

- [ ] **Step 4: Verificar alturas e ordem**

```bash
export AGENT_BROWSER_SESSION="$(agent-browser session id --scope worktree --prefix est)"
agent-browser open http://localhost:3005 >/dev/null; agent-browser set viewport 390 844 2 >/dev/null
agent-browser wait --load networkidle >/dev/null; agent-browser wait 1500 >/dev/null
agent-browser eval "JSON.stringify(['modelo','qualidade','malha'].map(id=>{const s=document.getElementById(id);const h2=s.querySelector('h2').getBoundingClientRect();const img=s.querySelector('img,object').getBoundingClientRect();return {id,h:Math.round(s.getBoundingClientRect().height),imgBottom:Math.round(img.bottom),h2Top:Math.round(h2.top),h2Size:getComputedStyle(s.querySelector('h2')).fontSize}}))"
for id in modelo qualidade malha; do agent-browser eval "document.getElementById('$id').scrollIntoView(); scrollY" >/dev/null; agent-browser wait 700 >/dev/null; agent-browser screenshot /tmp/cbs-mobile/depois/390-$id.png; done
agent-browser set viewport 1440 900 1 >/dev/null; agent-browser wait 3000 >/dev/null
agent-browser screenshot --full /tmp/cbs-mobile/depois/1440-full.png
agent-browser close
```

Expected: `h2Size` = `30px`; `imgBottom ≤ h2Top` nas três; `h` de modelo/qualidade ≤ 460px. Em 1440 as três estações iguais ao "antes" (comparar `1440-full.png` antes/depois com `Read`).

- [ ] **Step 5: Lint, tipos, testes e commit**

Run: `bun run check`; `cd apps/web && bun run check-types && bun test` → verde (10 testes).

```bash
cd /home/othavio/Work/cbs-site
git diff --quiet -- apps/web/public/warehouse-delivery.svg || git checkout -- apps/web/public/warehouse-delivery.svg
git add apps/web/src/app/page.tsx
git commit -m "feat(web): estações com lado fixo no mobile"
```

---

### Task 6: Malha — mapa atrás do texto e chips planos

**Files:**
- Modify: `apps/web/src/components/home/pracas.ts`
- Modify: `apps/web/src/components/home/pracas.test.ts`
- Modify: `apps/web/src/app/page.tsx` — a chamada `<Station anchor="malha">` em `Home` e `Station` (bloco `hasBackdrop` abaixo de `lg`)

**Interfaces:**
- Produces: `pracasPlanas(): string[]` (7 nomes na ordem de `PRACAS`).
- Consumes: `MapaMalhaPlaceholder` de `@/components/home/mapa-malha-placeholder` (já existe; aceita `className`), `RevealList`? — não: usar `<ul>` simples com `Reveal`, porque `RevealGroups` exige rótulos.

- [ ] **Step 1: Teste que falha**

Acrescentar em `pracas.test.ts` (import: `import { PRACAS, pracasPlanas, pracasPorRegiao } from "./pracas";`):

```ts
	test("lista plana mantém as 7 praças na ordem do cliente", () => {
		expect(pracasPlanas()).toEqual(PRACAS.map((p) => p.nome));
		expect(pracasPlanas()).toHaveLength(7);
	});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd apps/web && bun test src/components/home/pracas.test.ts` → Expected: FAIL, `pracasPlanas is not a function` (ou erro de export).

- [ ] **Step 3: Implementar**

Em `pracas.ts`, após `pracasPorRegiao`:

```ts
/** Só os nomes, na ordem informada: a nuvem de chips do celular, sem rótulo de região. */
export function pracasPlanas(): string[] {
	return PRACAS.map((p) => p.nome);
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `cd apps/web && bun test` → Expected: 11 pass.

- [ ] **Step 5: Compor a malha abaixo de `lg` em `page.tsx`**

Em `Home`, a chamada da malha passa a ter dois blocos de texto (um por faixa) e o mapa abaixo de `lg` entra como fundo do bloco de texto:

```tsx
				<Station
					anchor="malha"
					backdrop={<MapaMalhaLazy />}
					title="6 a 7 fábricas, uma por CD."
					variant="fabrica"
				>
					{/* < lg: o Brasil é tinta atrás do parágrafo (Regra do Mapa-Tinta);
					    o SVG do placeholder já nasce com os pontos acesos. */}
					<div
						aria-hidden
						className="pointer-events-none absolute -top-16 -right-6 z-0 w-[clamp(11rem,52vw,15rem)] opacity-90 lg:hidden"
					>
						<MapaMalhaPlaceholder className="malha-map-fallback" />
					</div>
					<Reveal delay={0.1}>
						<p className="relative z-10 max-w-[62%] text-pretty text-brand-navy/75 text-lg leading-relaxed sm:max-w-md lg:mt-6">
							<strong className="text-brand-navy">
								Quem vende no Full paga a remessa até o CD.
							</strong>{" "}
							Saneante é pesado e barato por unidade, então esse trecho pesa na
							margem, e é ele que a fábrica ao lado encurta.
						</p>
					</Reveal>
					<Reveal className="lg:hidden" delay={0.16}>
						<ul className="relative z-10 mt-5 flex flex-wrap gap-2">
							{pracasPlanas().map((nome) => (
								<li
									className="rounded-full bg-brand-mist px-4 py-1.5 font-medium text-brand-navy text-sm"
									key={nome}
								>
									{nome}
								</li>
							))}
						</ul>
					</Reveal>
					<RevealGroups
						className="mt-6 hidden max-w-md flex-col gap-2.5 sm:gap-3 lg:mt-7 lg:flex"
						groups={pracasPorRegiao()}
						itemClassName="rounded-full bg-brand-mist px-4 py-1.5 font-medium text-brand-navy text-sm transition-[transform,background-color,color] duration-200 hover:-translate-y-0.5 hover:bg-brand-ink hover:text-white motion-reduce:transition-none motion-reduce:hover:translate-y-0"
						labelClassName="w-full text-brand-navy/60 text-sm sm:w-24 sm:shrink-0"
					/>
				</Station>
```

Imports em `page.tsx`: `import { MapaMalhaPlaceholder } from "@/components/home/mapa-malha-placeholder";` e `pracasPlanas` junto de `pracasPorRegiao`. O wrapper do texto em `Station` (`<div className="mt-3 lg:mt-0">{children}</div>`) precisa de `relative` para o mapa absoluto se ancorar nele: trocar para `className="relative mt-3 lg:mt-0"`. O H2 da malha também precisa ficar acima do mapa: já tem `relative z-20` via o pai `.order-2`.

Confirmar que `MapaMalhaPlaceholder` aceita `className` e que o `data-lit` (pontos acesos) é atributo do pai `.malha-map` em `MapaMalhaLazy` — se os pontos dependerem de `data-lit`, envolver o placeholder em `<div className="malha-map" data-lit="">`.

- [ ] **Step 6: Verificar contraste e colisão dos pontos**

```bash
export AGENT_BROWSER_SESSION="$(agent-browser session id --scope worktree --prefix malha)"
agent-browser open http://localhost:3005 >/dev/null; agent-browser set viewport 390 844 2 >/dev/null
agent-browser wait --load networkidle >/dev/null; agent-browser wait 1500 >/dev/null
agent-browser eval "document.getElementById('malha').scrollIntoView(); scrollY" >/dev/null; agent-browser wait 800 >/dev/null
agent-browser screenshot /tmp/cbs-mobile/depois/390-malha.png
agent-browser eval "(()=>{const s=document.getElementById('malha');const p=s.querySelector('p').getBoundingClientRect();const pts=[...s.querySelectorAll('.lg\\\\:hidden circle, .lg\\\\:hidden [data-praca]')].map(c=>c.getBoundingClientRect());const hits=pts.filter(r=>r.left<p.right&&r.right>p.left&&r.top<p.bottom&&r.bottom>p.top).length;return JSON.stringify({h:Math.round(s.getBoundingClientRect().height),pontosSobreTexto:hits,pontos:pts.length})})()"
agent-browser close
```

Expected: `h` ≤ 560; `pontosSobreTexto` = 0 (se > 0, descer o mapa: `-top-16` → `-top-8`, e repetir). Abrir `390-malha.png` com `Read` e conferir que o texto navy sobre os estados `#f0f9fc` lê limpo.

- [ ] **Step 7: Lint, tipos, testes e commit**

Run: `bun run check`; `cd apps/web && bun run check-types && bun test` → verde (11).

```bash
cd /home/othavio/Work/cbs-site
git diff --quiet -- apps/web/public/warehouse-delivery.svg || git checkout -- apps/web/public/warehouse-delivery.svg
git add apps/web/src/components/home/pracas.ts apps/web/src/components/home/pracas.test.ts apps/web/src/app/page.tsx
git commit -m "feat(web): malha condensada no mobile"
```

---

### Task 7: Navbar, chegada e rodapé

**Files:**
- Modify: `apps/web/src/components/navbar.tsx` (o `<motion.a>` do WhatsApp, ~linhas 128–140)
- Modify: `apps/web/src/components/home/entrega-titulo.tsx` (classe do `<h2>`)
- Modify: `apps/web/src/app/page.tsx` — `Chegada`
- Modify: `apps/web/src/components/footer.tsx`

**Interfaces:**
- Consumes: `WHATSAPP_NUMBER`, `WHATSAPP_URL`, `EMAIL_ADDRESS`, `EMAIL_URL` de `@/components/contact`; `BubbleGhosts`.
- Produces: rodapé sem `CtaWhatsApp`/`CtaEmail` em todas as larguras.

- [ ] **Step 1: Navbar — pill só na cápsula abaixo de `md`**

Em `navbar.tsx`, na classe do `<motion.a href={WHATSAPP_URL}>`, trocar o prefixo `inline-flex` por:

```tsx
className={`${scrolled ? "inline-flex" : "hidden md:inline-flex"} min-h-11 items-center gap-2 rounded-full bg-brand-navy px-5 py-2.5 font-semibold text-sm text-white transition-[background-color,transform] duration-150 ease-brand hover:bg-brand-ink focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-2 active:scale-[0.97]`}
```

O `layout` do motion já anima a cápsula quando o pill entra. Atualizar o comentário do componente: "abaixo de `md`, no topo só o logo; o WhatsApp entra com a cápsula".

- [ ] **Step 2: `EntregaTitulo` — 36px abaixo de `sm`**

Trocar `text-4xl … sm:text-5xl md:text-6xl` por `text-4xl … sm:text-5xl lg:text-6xl` (36 / 48 / 60; o desktop continua 60).

- [ ] **Step 3: `Chegada` — padding e fantasmas**

```tsx
		<section className="relative mx-auto max-w-6xl px-6 pt-10 text-center md:pt-20 lg:pt-32">
			<div className="mist-final absolute inset-y-0 left-1/2 w-screen -translate-x-1/2" />
			<BubbleGhosts variant="chegada" />
```

O marcador `data-j-anchor="chegada"` já é `hidden lg:block`; `data-s-anchor="caminhao-doca"` continua em todas as larguras (é a âncora do caminhão SVG que já renderiza hoje abaixo de `lg` — não mexer). `mt-12 sm:mt-16` da doca ficam.

- [ ] **Step 4: Rodapé sem botões, com links de contato**

Substituir o conteúdo de `Footer` (mantendo `SeloAnvisa`):

```tsx
import {
	EMAIL_ADDRESS,
	EMAIL_URL,
	WHATSAPP_NUMBER,
	WHATSAPP_URL,
	WhatsAppIcon,
} from "@/components/contact";

const LINK =
	"inline-flex min-h-11 items-center gap-2 underline decoration-brand-navy/30 underline-offset-4 transition-colors hover:text-brand-ink hover:decoration-brand-ink focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-2";

/**
 * Rodapé-wordmark: a página abre com Sora gigante no hero e fecha com o
 * nome da marca na mesma escala. Sem CTAs — a Chegada, logo acima, já fechou
 * com o par de botões; aqui o contato é informação (links de texto de 44px).
 * O `<footer>` fica sem z-index para as microbolhas do canvas fixo (z-10)
 * atravessarem até o fim da página; só o conteúdo sobe para z-20.
 */
export function Footer() {
	return (
		<footer className="relative">
			<div className="relative z-20 mx-auto max-w-6xl px-6 pt-10 pb-8 sm:pt-16">
				<a
					aria-label="Voltar ao topo"
					className="inline-block rounded-full font-bold font-display text-6xl text-brand-navy leading-[0.9] tracking-[-0.03em] focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-8 sm:text-8xl"
					href="#topo"
				>
					C<span className="text-brand-blue">B</span>S
				</a>
				<p className="mt-5 max-w-md text-base text-brand-navy/75 leading-relaxed sm:mt-6">
					Companhia Brasileira de Saneantes. Terceirização de produção de
					saneantes, com fábricas junto aos CDs do Mercado Livre.
				</p>
				<div className="mt-8 flex flex-col gap-4 border-brand-navy/10 border-t pt-5 text-brand-navy/70 text-sm sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
						<span>© 2026 CBS · Companhia Brasileira de Saneantes</span>
						<a
							className={LINK}
							href={WHATSAPP_URL}
							rel="noopener"
							target="_blank"
						>
							<WhatsAppIcon className="size-4" />
							{WHATSAPP_NUMBER}
							<span className="sr-only"> (abre em nova aba)</span>
						</a>
						<a className={LINK} href={EMAIL_URL}>
							{EMAIL_ADDRESS}
						</a>
					</div>
					<p className="flex items-center gap-3">
						<SeloAnvisa className="size-9 shrink-0" />
						<span>
							<span className="block font-semibold text-brand-navy">
								Autorizada pela ANVISA
							</span>
							<span className="block text-brand-navy/70 text-xs">
								Fabricação de saneantes
							</span>
						</span>
					</p>
				</div>
			</div>
		</footer>
	);
}
```

Remover o import de `CtaEmail, CtaWhatsApp` do rodapé. `WhatsAppIcon` já é exportado de `contact.tsx`.

- [ ] **Step 5: Verificar**

```bash
export AGENT_BROWSER_SESSION="$(agent-browser session id --scope worktree --prefix fim)"
agent-browser open http://localhost:3005 >/dev/null; agent-browser set viewport 390 844 2 >/dev/null
agent-browser wait --load networkidle >/dev/null; agent-browser wait 1500 >/dev/null
agent-browser eval "JSON.stringify({pillsTopo:[...document.querySelectorAll('header a[href^=\"https://wa.me\"]')].filter(a=>getComputedStyle(a).display!=='none').length, waTotal:[...document.querySelectorAll('a[href^=\"https://wa.me\"]')].filter(a=>getComputedStyle(a).display!=='none').length, footerH:Math.round(document.querySelector('footer').getBoundingClientRect().height), docH:document.documentElement.scrollHeight})"
agent-browser eval "window.scrollTo(0,400); scrollY" >/dev/null; agent-browser wait 900 >/dev/null
agent-browser eval "[...document.querySelectorAll('header a[href^=\"https://wa.me\"]')].filter(a=>getComputedStyle(a).display!=='none').length"
agent-browser eval "window.scrollTo(0, document.body.scrollHeight); scrollY" >/dev/null; agent-browser wait 800 >/dev/null
agent-browser screenshot /tmp/cbs-mobile/depois/390-footer.png
agent-browser close
```

Expected: no topo `pillsTopo` = 0 e `waTotal` = 3 (hero, chegada, rodapé-texto); depois de rolar, `1`; `footerH` ≤ 420; `docH` ≤ 3200.

- [ ] **Step 6: Lint, tipos e commit**

Run: `bun run check`; `cd apps/web && bun run check-types` → sem erros.

```bash
cd /home/othavio/Work/cbs-site
git diff --quiet -- apps/web/public/warehouse-delivery.svg || git checkout -- apps/web/public/warehouse-delivery.svg
git add apps/web/src/components/navbar.tsx apps/web/src/components/home/entrega-titulo.tsx apps/web/src/app/page.tsx apps/web/src/components/footer.tsx
git commit -m "feat(web): navbar, chegada e rodapé sem CTAs repetidos"
```

---

### Task 8: DESIGN.md

**Files:**
- Modify: `apps/web/DESIGN.md`

- [ ] **Step 1: Layout — substituir "Zigue-zague num só eixo"**

Apagar o parágrafo que começa com `**Zigue-zague num só eixo (abaixo de \`lg\`).**` e o parágrafo "Medidas fluidas abaixo de `lg`" (linha 177), e inserir no lugar:

```markdown
**Medidas abaixo de `lg`.** Bolha do hero `size-[clamp(13rem,62vw,17rem)]` (`md:` `clamp(17rem,40vw,22rem)`), bolha de estação `size-[clamp(11rem,55vw,14rem)]`, mapa da malha `w-[clamp(11rem,52vw,15rem)]`; as bolhas sangram pela direita (`-mr-10`/`-mr-8`) e o `<main>` recorta com `overflow-x-clip`. Nenhuma outra largura fixa em px fica acima de `calc(100vw - 3rem)`.

**A Regra do Lado Fixo (abaixo de `lg`).** Toda seção empilha na mesma ordem: visual (bolha pré-renderizada) sangrando pela borda direita → título → corpo; as bolhas-fantasma (`BubbleGhosts`) ficam à esquerda. Nada é posicionado atrás de título ou parágrafo (o mapa da malha é a exceção: tinta atrás do texto, com `max-w-[62%]` no parágrafo). O zigue-zague de `flip` existe só em `lg`. Ritmo: hero `min-h-[100svh]` em `flex-col` com os CTAs em `mt-auto`; estações `py-10 md:py-14`; Chegada `pt-10 md:pt-20`; rodapé `pt-10 sm:pt-16`. Tipos: H1 `text-[2.5rem] md:text-6xl`, H2 `text-3xl md:text-4xl`, corpo `text-base md:text-lg`.
```

- [ ] **Step 2: Regra do Limiar da Jornada**

No parágrafo `**A Regra do Limiar da Jornada.**`, substituir a frase que começa em "Nesse modo o `<Canvas>` roda em `frameloop=\"demand\"`" até "para three.js não entrar no bundle inicial." por:

```markdown
Abaixo de 1024px o `<Canvas>` **não monta**: `Scene3DLazy` testa `matchMedia("(min-width: 1024px)")` (`useWide`) antes do `import()` de `scene3d`, então o chunk de three.js/R3F não desce ao celular; com reduced-motion em tela larga a cena monta em `frameloop="demand"` (um quadro por scroll/resize, `DemandRedraw`) com o `THREE.Clock` parado. As bolhas do celular são imagens pré-renderizadas (ver Bolha-Pacote). As constantes que o DOM lê (`JOURNEY_ANCHORS`, `DOCK_HANDOFF_END`) vivem em `journey-constants.ts`, fora de `scene3d.tsx`.
```

- [ ] **Step 3: Bolha-Pacote — assets**

Ao fim da seção "Bolha-Pacote (Signature Component)", antes de "### Named Rules", acrescentar:

```markdown
**Bolhas pré-renderizadas (abaixo de `lg`).** `public/bolhas/{caixa,frasco,selo,vidro}.webp` (800px) são capturas da própria cena (`/render-bolhas?obj=…`, rota só em desenvolvimento; receita em `scripts/render-bolhas.md`) e entram no fluxo como `<Image>` (`BolhaImagem`). A fábrica mantém a ilustração SMIL (`warehouse-delivery.svg`) com o vidro vazio (`vidro.webp`) por cima (`BolhaFabrica`); com `prefers-reduced-motion` entra `textures/warehouse-delivery.png`. **Regra da Regeneração:** mudou `cardboard-box.tsx`, `station-models.tsx` ou `scene-bits.tsx` → regerar os quatro assets e anotar o commit de origem na receita.
```

- [ ] **Step 4: Navigation, Buttons e Mapa**

- Em "### Navigation › Content": acrescentar ao fim — `Abaixo de \`md\`, no topo só o logo aparece; o CTA de WhatsApp entra junto com a cápsula ao rolar (evita dois botões iguais no primeiro viewport).`
- Em "### Buttons", após "Nav CTA": acrescentar — `- **Rodapé:** não usa CTAs. Contato em links de texto de 44px (\`WHATSAPP_NUMBER\` e \`EMAIL_ADDRESS\`) na linha do copyright; o par de pílulas aparece só no hero e na Chegada.`
- Em "### Mapa da malha", substituir a frase "Abaixo de `lg`, a mesma diagonal condensada (mapa no alto-direita, bolha em baixo-esquerda, palco `h-[clamp(20rem,88vw,26rem)]`), e só o SVG renderiza:" por: `Abaixo de \`lg\` o SVG (\`MapaMalhaPlaceholder\`) fica atrás do bloco de texto (\`w-[clamp(11rem,52vw,15rem)]\`, opacidade 90%), a bolha da fábrica segue a Regra do Lado Fixo e as praças viram uma nuvem única de chips (\`pracasPlanas()\`); só o SVG renderiza:` (o resto da frase, sobre o `matchMedia` do MapLibre, permanece).
- Em "## Do's and Don'ts › Do": acrescentar — `- **Do** abaixo de \`lg\`, colocar o visual acima do título e sangrando pela direita (Regra do Lado Fixo); novo objeto de estação nasce como asset em \`public/bolhas/\`.`

- [ ] **Step 5: Conferir contra o código e commitar**

Run: `rg -n "BubbleGhosts|BolhaImagem|BolhaFabrica|pracasPlanas|useWide|render-bolhas" apps/web/src | wc -l` → > 0 para cada nome citado (todos existem).

```bash
cd /home/othavio/Work/cbs-site
git diff --quiet -- apps/web/public/warehouse-delivery.svg || git checkout -- apps/web/public/warehouse-delivery.svg
git add apps/web/DESIGN.md
git commit -m "docs(web): DESIGN.md com a Regra do Lado Fixo"
```

---

### Task 9: Verificação final, PR

**Files:** nenhum novo; relatório na conversa.

- [ ] **Step 1: Suíte completa**

Run (raiz): `bun run check` → sem erros. Run (`apps/web`): `bun run check-types && bun test` → 11 pass.

- [ ] **Step 2: Capturas "depois" completas e métricas**

```bash
export AGENT_BROWSER_SESSION="$(agent-browser session id --scope worktree --prefix final)"
for vp in "320 700" "390 844" "768 1024"; do
  set -- $vp
  agent-browser open http://localhost:3005 >/dev/null; agent-browser set viewport $1 $2 2 >/dev/null
  agent-browser wait --load networkidle >/dev/null; agent-browser wait 1500 >/dev/null
  agent-browser screenshot --full "/tmp/cbs-mobile/depois/$1-full.png"
  agent-browser eval "JSON.stringify({vp:'$1x$2', docH:document.documentElement.scrollHeight, chunks:performance.getEntriesByType('resource').map(r=>r.name).filter(n=>/three|react-three|maplibre|scene3d/i.test(n)).length, ctaBottom:Math.round(document.querySelector('#topo a[href^=\"https://wa.me\"]').getBoundingClientRect().bottom), scrollX:document.documentElement.scrollWidth>innerWidth})"
done
if agent-browser set media reduce-motion >/dev/null 2>&1; then RM_OK=1; else RM_OK=0; echo "emulação de reduced-motion indisponível — checar manualmente"; fi
agent-browser open http://localhost:3005 >/dev/null; agent-browser set viewport 390 844 2 >/dev/null; agent-browser wait 1500 >/dev/null
agent-browser eval "document.getElementById('malha').scrollIntoView(); scrollY" >/dev/null; agent-browser wait 800 >/dev/null
agent-browser eval "JSON.stringify({reduced:matchMedia('(prefers-reduced-motion: reduce)').matches, png:!!document.querySelector('#malha img[src*=\"warehouse-delivery.png\"]')})"
agent-browser set viewport 1440 900 1 >/dev/null; agent-browser wait 3000 >/dev/null
agent-browser screenshot --full /tmp/cbs-mobile/depois/1440-full-final.png
agent-browser close
```

Expected: `chunks` = 0 nas três larguras; `docH` ≤ 3200 em 390; `ctaBottom` ≤ altura do viewport em 320 e 390; `scrollX` = false; `1440-full-final.png` idêntico ao "antes" fora do rodapé (comparar com `Read`). Reduced-motion: a asserção só vale se `reduced` vier `true` — então `png` tem de ser `true`; se `reduced` for `false` (emulação indisponível), registrar "não testado" no relatório em vez de reprovar.

- [ ] **Step 3: Relatório**

Listar no relatório: os números "antes" (Task 4 Step 1) e "depois" (acima), os caminhos das capturas, a saída real de `bun run check`, `check-types`, `bun test`, e qualquer desvio da spec (ex.: plano B dos assets, `-top-8` no mapa).

- [ ] **Step 4: Escrever o corpo do PR e passar pelos filtros de texto**

Escrever `/tmp/cbs-mobile/pr-body.md`: resumo em português das oito decisões, os números antes/depois (Task 0 × Step 2), os caminhos das capturas (`gh pr create` não anexa imagens — descrever o que cada uma mostra), o desvio declarado do `LiquidPath` (Task 2) e a nota de que o merge dispara deploy em produção. Sem atribuição de IA no corpo. Em seguida rodar `/unslop` e `/humanize-pt-br` sobre o arquivo e reler o resultado antes do próximo step.

- [ ] **Step 5: Push e PR**

```bash
cd /home/othavio/Work/cbs-site
git status --short   # limpo
git push -u origin reatividade
gh pr create --base main --title "Home mobile: bolhas como imagem e lado fixo" --body-file /tmp/cbs-mobile/pr-body.md
```

Não fazer merge — `main` tem deploy automático.

---

## Self-review (feito ao escrever)

- **Cobertura da spec:** §1 assets → Task 1; gates → Task 2; §2 fantasmas → Task 3/4/5/7; §3 hero → Task 4; §4 estações → Task 5; §5 malha → Task 6; §6 navbar/chegada/rodapé → Task 7; §7 tokens → Tasks 4–7 (classes literais); §8 DESIGN.md → Task 8; §10 verificação → Steps de verificação por task + Task 9; §11 plano B dos assets → Task 1 Step 5.
- **Nomes consistentes:** `useWide`/`WIDE_QUERY` (Task 2) usados em `scene3d-lazy.tsx`; `BubbleGhosts` com `variant` `"hero" | "modelo" | "qualidade" | "malha" | "chegada"` (Task 3) e `Station.anchor: StationAnchor` (Task 5) casam; `BolhaImagem obj: "caixa" | "frasco" | "selo"` (Task 3) usado em Task 4 (`caixa`) e Task 5 (`variant` frasco/selo — `StationSlot` só chama `BolhaImagem` quando `variant !== "fabrica"`, então o tipo fecha); `pracasPlanas()` (Task 6) importado em `page.tsx`.
- **Risco declarado:** o `AnchoredGroup` da cena usa `querySelector('[data-s-anchor=…]')` — Task 5 separa `StationSlotDesktop` (única cópia do atributo e do `<object>` da fábrica) de `StationSlotMobile`, cada um renderizado uma vez no wrapper do seu breakpoint.
- **Desvios da spec, declarados:** `LiquidPath` sem gate (Task 2); baseline capturado na Task 0, antes de qualquer mudança.
