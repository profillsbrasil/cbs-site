"use client";

// biome-ignore-start lint: diretiva do React Compiler
"use no memo";
// biome-ignore-end lint: diretiva do React Compiler

import {
	Environment,
	Lightformer,
	MeshDistortMaterial,
	MeshTransmissionMaterial,
} from "@react-three/drei";
import { useCallback, useMemo } from "react";
import { Color, type MeshPhysicalMaterial } from "three";

// O buffer de transmissão só enxerga a cena 3D — sem isso, o "atrás" da
// bolha vira o clear color preto do canvas alpha, não o papel da página.
const PAPER_BACKGROUND = "#ffffff";

/**
 * Luz de estúdio branco: rebatedores suaves em vez de HDR externo, para a
 * cena ficar autocontida (nada é buscado de CDN).
 */
export function StudioRig() {
	return (
		<>
			<ambientLight intensity={0.9} />
			<directionalLight
				castShadow
				intensity={1.4}
				position={[4, 6, 6]}
				shadow-mapSize={1024}
			/>
			<Environment resolution={256}>
				<Lightformer
					form="rect"
					intensity={2.2}
					position={[0, 4, 3]}
					rotation-x={-Math.PI / 2}
					scale={[8, 6, 1]}
				/>
				<Lightformer
					color="#1d9dd8"
					form="ring"
					intensity={2.4}
					position={[-5, 1, 2]}
					rotation-y={Math.PI / 2}
					scale={[6, 4, 1]}
				/>
				<Lightformer
					color="#a8e0f0"
					form="circle"
					intensity={1.8}
					position={[5, -1, 1]}
					rotation-y={-Math.PI / 2}
					scale={[6, 4, 1]}
				/>
			</Environment>
		</>
	);
}

/**
 * Material comum às duas variantes de bolha: o material da variante "high"
 * estende MeshPhysicalMaterial em tempo de execução, então essa é a base
 * que o fade do estouro precisa (só lê/escreve `opacity`).
 */
export type BubbleMaterial = MeshPhysicalMaterial;

/**
 * Opacidade de repouso do filme da bolha "lite": transmission alto demais
 * amostra o buffer vazio (preto) e escurece o vidro sobre canvas alpha —
 * o filme claro vem de opacity baixa + transmission moderado.
 */
export const BUBBLE_BASE_OPACITY = 0.42;

/**
 * Bolha de sabão: vidro fino iridescente. `opacity` permite dissolver a
 * bolha na explosão do hero. `quality` "high" usa transmissão real (custo
 * alto, reservado para a bolha principal do hero); "lite" usa
 * meshPhysicalMaterial para as demais; "station" é a mesma base de "lite"
 * mas com MeshDistortMaterial (que estende MeshPhysicalMaterial em tempo de
 * execução) para o wobble real das bolhas de estação — o pai lê `distort`
 * pelo mesmo `materialRef` e escreve por frame, como já faz com `opacity`.
 */
export function SoapBubble({
	radius,
	opacity = 1,
	quality = "lite",
	materialRef,
}: {
	radius: number;
	opacity?: number;
	quality?: "high" | "lite" | "station";
	materialRef?: (material: BubbleMaterial | null) => void;
}) {
	// O ref do MeshTransmissionMaterial do drei é tipado pelas props, não pela
	// instância — o cast é seguro porque a classe estende MeshPhysicalMaterial
	// em tempo de execução (ver BubbleMaterial acima).
	const highMaterialRef = useCallback(
		(instance: unknown) => materialRef?.(instance as BubbleMaterial | null),
		[materialRef]
	);
	const background = useMemo(() => new Color(PAPER_BACKGROUND), []);

	if (quality === "high") {
		return (
			<mesh visible={opacity > 0.01}>
				<sphereGeometry args={[radius, 64, 64]} />
				<MeshTransmissionMaterial
					anisotropicBlur={0.04}
					background={background}
					chromaticAberration={0.06}
					distortion={0.06}
					distortionScale={0.4}
					ior={1.33}
					iridescence={1}
					iridescenceIOR={1.27}
					iridescenceThicknessRange={[120, 340]}
					opacity={opacity}
					ref={highMaterialRef}
					resolution={512}
					roughness={0.01}
					samples={6}
					temporalDistortion={0.15}
					thickness={0.1}
					transmission={1}
					transparent
				/>
			</mesh>
		);
	}

	if (quality === "station") {
		return (
			<mesh visible={opacity > 0.01}>
				<sphereGeometry args={[radius, 48, 48]} />
				<MeshDistortMaterial
					clearcoat={1}
					clearcoatRoughness={0.06}
					color="#e4f4fa"
					distort={0.08}
					envMapIntensity={1.3}
					ior={1.33}
					iridescence={1}
					iridescenceIOR={1.27}
					iridescenceThicknessRange={[80, 220]}
					metalness={0}
					opacity={BUBBLE_BASE_OPACITY * opacity}
					ref={materialRef}
					roughness={0.06}
					speed={2}
					thickness={0.15}
					transmission={0.5}
					transparent
				/>
			</mesh>
		);
	}

	return (
		<mesh visible={opacity > 0.01}>
			<sphereGeometry args={[radius, 48, 48]} />
			<meshPhysicalMaterial
				clearcoat={1}
				clearcoatRoughness={0.06}
				color="#e4f4fa"
				envMapIntensity={1.3}
				ior={1.33}
				iridescence={1}
				iridescenceIOR={1.27}
				iridescenceThicknessRange={[80, 220]}
				metalness={0}
				opacity={BUBBLE_BASE_OPACITY * opacity}
				ref={materialRef}
				roughness={0.06}
				thickness={0.15}
				transmission={0.5}
				transparent
			/>
		</mesh>
	);
}

/** Interpolação suave (Hermite) entre duas bordas, presa a [0, 1]. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
	const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
	return t * t * (3 - 2 * t);
}
