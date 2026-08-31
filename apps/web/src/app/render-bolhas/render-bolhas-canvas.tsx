"use client";

// biome-ignore-start lint: diretiva do React Compiler
"use no memo";
// biome-ignore-end lint: diretiva do React Compiler

import { Canvas } from "@react-three/fiber";

import { CardboardBox } from "@/components/home/cardboard-box";
import { SoapBubble, StudioRig } from "@/components/home/scene-bits";
import {
	CaminhaoEntrega,
	Frasco,
	Selo,
} from "@/components/home/station-models";

import type { BolhaObj } from "./bolha-objs";

/** Mesmos raios da cena real: hero 1.85 (quality lite), estação 1.55 (station). */
const RAIO: Record<BolhaObj, number> = {
	caixa: 1.85,
	caminhao: 0,
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
	if (obj === "caminhao") {
		// A van é o único objeto que vive fora de uma bolha (ela fica na doca).
		return <CaminhaoEntrega />;
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
					{RAIO[obj] > 0 ? (
						<SoapBubble
							quality={obj === "caixa" ? "lite" : "station"}
							radius={RAIO[obj]}
						/>
					) : null}
					<Conteudo obj={obj} />
				</group>
			</Canvas>
		</div>
	);
}
