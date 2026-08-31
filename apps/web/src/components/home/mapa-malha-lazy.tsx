"use client";

import { lazy, Suspense } from "react";

import { MapaMalhaPlaceholder } from "./mapa-malha-placeholder";
import { useWide } from "./use-wide";

// Abaixo de 1024px o SVG (mesma geometria) fica sozinho: no celular o MapLibre
// só abriria um segundo contexto WebGL para desenhar o que já está na tela.
// O teste vem ANTES do import dinâmico — senão o chunk do maplibre-gl desce
// para o aparelho mesmo sem montar. `useWide` substitui o matchMedia local.
const MapaMalhaGl = lazy(() =>
	import("./mapa-malha").then((m) => ({ default: m.MapaMalha }))
);

export function MapaMalhaLazy() {
	const wide = useWide();

	if (wide) {
		return (
			<Suspense fallback={<MapaMalhaPlaceholder />}>
				<MapaMalhaGl />
			</Suspense>
		);
	}
	// Sem coreografia abaixo de 1024px, os pontos já nascem acesos.
	return (
		<div
			className="malha-map pointer-events-none relative h-full w-full"
			data-lit=""
		>
			<MapaMalhaPlaceholder className="malha-map-fallback absolute inset-0" />
		</div>
	);
}
