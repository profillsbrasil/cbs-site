"use client";

// biome-ignore-start lint: diretiva do React Compiler
"use no memo";
// biome-ignore-end lint: diretiva do React Compiler

import { Environment, Lightformer } from "@react-three/drei";
import type { MeshPhysicalMaterial } from "three";

/**
 * Luz de estúdio branco: rebatedores suaves em vez de HDR externo, para a
 * cena ficar autocontida (nada é buscado de CDN).
 */
export function StudioRig() {
	return (
		<>
			<ambientLight intensity={0.9} />
			<directionalLight castShadow intensity={1.4} position={[4, 6, 6]} />
			<Environment resolution={128}>
				<Lightformer
					intensity={2.2}
					position={[0, 4, 3]}
					rotation-x={-Math.PI / 2}
					scale={[8, 6, 1]}
				/>
				<Lightformer
					color="#1d9dd8"
					intensity={2.4}
					position={[-5, 1, 2]}
					rotation-y={Math.PI / 2}
					scale={[6, 4, 1]}
				/>
				<Lightformer
					color="#a8e0f0"
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
 * Bolha de sabão: vidro fino iridescente. `opacity` permite dissolver a
 * bolha na explosão do hero.
 */
export function SoapBubble({
	radius,
	opacity = 1,
	materialRef,
}: {
	radius: number;
	opacity?: number;
	materialRef?: (material: MeshPhysicalMaterial | null) => void;
}) {
	return (
		<mesh visible={opacity > 0.01}>
			<sphereGeometry args={[radius, 48, 48]} />
			<meshPhysicalMaterial
				clearcoat={1}
				clearcoatRoughness={0.08}
				color="#bfe9f7"
				envMapIntensity={2.2}
				iridescence={1}
				iridescenceIOR={1.33}
				metalness={0}
				opacity={0.55 * opacity}
				ref={materialRef}
				roughness={0.04}
				thickness={0.35}
				transmission={0.85}
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
