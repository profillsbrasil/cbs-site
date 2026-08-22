"use client";

// Precisa ser o primeiro import: aponta o worker do MapLibre para o arquivo
// vendorizado antes que "@cbs-site/ui/components/map" tenha chance de
// apontá-lo para o unpkg.
import "./maplibre-worker";

import {
	MapGeoJSON,
	Map as MapLibreMap,
	MapMarker,
	type MapRef,
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
const PAIS_GEOJSON_URL = "/geo/brasil-pais.json";
// Paint do MapLibre não lê custom properties do CSS: mesmo valor de
// --color-brand-navy, repetido aqui como literal.
const brandNavy = "#0f1c2b";
// A caixa "chegou" um pouco antes de parar exatamente sobre a âncora.
const LIT_LEAD = 0.02;
// Só montar o MapLibre quando a estação estiver a essa distância do viewport.
const MOUNT_MARGIN = "600px";

function hasWebGL(): boolean {
	try {
		const canvas = document.createElement("canvas");
		return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
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
	// Instância do mapa via callback ref: `Map` só popula um `useRef` comum
	// depois de um efeito interno (setMapInstance), então um `useRef` no pai
	// ainda estaria `null` no primeiro efeito após `shouldMount`. Um callback
	// ref alimentando este `useState` dispara um re-render assim que a
	// instância nasce, e o efeito de `ready` abaixo reage a ela.
	const [mapInstance, setMapInstance] = useState<MapRef | null>(null);
	const [ready, setReady] = useState(false);
	const journeyActive = useJourneyActive();
	const malhaAt = useAnchorFraction("malha");
	const [lit, setLit] = useState(false);

	// Montagem tardia: o MapLibre só entra quando a estação se aproxima.
	useEffect(() => {
		const el = container.current;
		if (!(el && hasWebGL())) {
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

	// Cross-fade: o mapa está pronto quando a primeira renderização ociosa
	// acontece.
	useEffect(() => {
		if (!mapInstance) {
			return;
		}
		const onIdle = () => setReady(true);
		mapInstance.once("idle", onIdle);
		return () => {
			mapInstance.off("idle", onIdle);
		};
	}, [mapInstance]);

	// Sem coreografia (mobile / reduced-motion) os pontos já nascem acesos.
	// Sem o "else", `useJourneyActive` começa como `false` no primeiro
	// render (antes do matchMedia resolver) e este efeito acenderia os
	// pontos uma vez, para sempre — mesmo em desktop com motion ativo.
	useEffect(() => {
		setLit(!journeyActive);
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
				/* loading={false} não suprime o DefaultLoader do mapcn (ele
				   renderiza enquanto !isLoaded); é o cross-fade via
				   data-map-ready que o mantém invisível — não remover o
				   cross-fade sem tratar isso. */
				<MapLibreMap
					attributionControl={false}
					blank
					bounds={BRASIL_BOUNDS}
					className="malha-map-gl absolute inset-0"
					fitBoundsOptions={{ padding: 12 }}
					interactive={false}
					loading={false}
					ref={setMapInstance}
					theme="light"
				>
					<MapGeoJSON
						data={GEOJSON_URL}
						fillPaint={{ "fill-color": "#f0f9fc" }}
						linePaint={{
							"line-color": brandNavy,
							"line-opacity": 0.25,
							"line-width": 1,
						}}
					/>
					<MapGeoJSON
						data={PAIS_GEOJSON_URL}
						fillPaint={false}
						linePaint={{
							"line-color": brandNavy,
							"line-opacity": 0.6,
							"line-width": 1.5,
						}}
					/>
					{PRACAS.map(({ nome, lngLat }, index) => (
						<MapMarker key={nome} latitude={lngLat[1]} longitude={lngLat[0]}>
							<MarkerContent>
								<span
									className="praca-dot block size-3.5 rounded-full bg-brand-blue ring-[3px] ring-white"
									style={{ "--praca-index": index } as React.CSSProperties}
								/>
							</MarkerContent>
						</MapMarker>
					))}
				</MapLibreMap>
			) : null}
		</div>
	);
}
