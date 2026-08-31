"use client";

import { lazy, Suspense } from "react";

import { useWide } from "./use-wide";

// `React.lazy` + gate: o `import()` só roda quando o componente renderiza,
// isto é, quando `useWide()` vira `true` — o chunk do three não desce ao
// celular (medido em produção: 8 arquivos JS em 390px contra 13 em 1440px).
const Scene3DLazyInner = lazy(() =>
	import("./scene3d").then((m) => ({ default: m.Scene3D }))
);

/**
 * A cena WebGL (three.js + R3F + drei + texturas) só existe em ≥ 1024px: o
 * teste vem ANTES do import dinâmico (mesmo padrão de MapaMalhaLazy). No
 * desktop o HTML pinta com o `HeroPlaceholder` e o vidro faz cross-fade em
 * `data-scene-ready`. Abaixo disso as bolhas são imagens (`public/bolhas`,
 * ver scripts/render-bolhas.md). `useWide` começa `false` no servidor, então
 * a cena nunca é renderizada no SSR.
 */
export function Scene3DLazy() {
	const wide = useWide();
	if (!wide) {
		return null;
	}
	return (
		<Suspense fallback={null}>
			<Scene3DLazyInner />
		</Suspense>
	);
}
