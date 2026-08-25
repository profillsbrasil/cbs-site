"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { MapaMalhaPlaceholder } from "./mapa-malha-placeholder";

// Abaixo disso o SVG (mesma geometria) fica sozinho: no celular o MapLibre
// só abriria um segundo contexto WebGL para desenhar o que já está na tela.
// O teste vem ANTES do import dinâmico — senão o chunk do maplibre-gl
// desce para o aparelho mesmo sem montar.
const GL_MIN_WIDTH = "(min-width: 1024px)";

const MapaMalhaGl = dynamic(
	() => import("./mapa-malha").then((m) => m.MapaMalha),
	{ loading: () => <MapaMalhaPlaceholder />, ssr: false }
);

export function MapaMalhaLazy() {
	const [wide, setWide] = useState(false);

	useEffect(() => {
		const query = window.matchMedia(GL_MIN_WIDTH);
		const update = () => setWide(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);

	if (wide) {
		return <MapaMalhaGl />;
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
