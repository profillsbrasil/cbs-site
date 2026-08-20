"use client";

// biome-ignore-start lint: diretiva do React Compiler
"use no memo";
// biome-ignore-end lint: diretiva do React Compiler

import { RoundedBox, useTexture } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import {
	CanvasTexture,
	RepeatWrapping,
	SRGBColorSpace,
	type Texture,
} from "three";

const TAPE = "#1d9dd8";
const NAVY = "#0f1c2b";

// PBR ambientCG "Cardboard004" (CC0, 1K) — color/normal/roughness reais.
const TEXTURE_URLS = {
	map: "/textures/cardboard/color.webp",
	normalMap: "/textures/cardboard/normal.webp",
	roughnessMap: "/textures/cardboard/roughness.webp",
};
useTexture.preload(Object.values(TEXTURE_URLS));

/**
 * Fita personalizada: azul com "CBS" repetido em branco. A fita corre ao
 * longo de z e, na face de cima do boxGeometry, v acompanha z — por isso o
 * texto é pintado em pé (64×256) e repete em v.
 */
function makeTapeTexture(): Texture {
	const canvas = document.createElement("canvas");
	canvas.width = 64;
	canvas.height = 256;
	const ctx = canvas.getContext("2d");
	if (ctx) {
		ctx.fillStyle = TAPE;
		ctx.fillRect(0, 0, 64, 256);
		ctx.fillStyle = "#ffffff";
		ctx.font = 'bold 34px Sora, "Sora Fallback", sans-serif';
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.translate(32, 128);
		ctx.rotate(-Math.PI / 2);
		ctx.fillText("CBS", 0, 2);
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	texture.anisotropy = 4;
	return texture;
}

/** Etiqueta de envio: branca, cabeçalho navy, linhas greeked e código de barras. */
function makeShippingLabel(): Texture {
	const w = 256;
	const h = 192;
	const canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext("2d");
	if (ctx) {
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, w, h);
		ctx.fillStyle = NAVY;
		ctx.fillRect(0, 0, w, 34);
		ctx.fillStyle = "#ffffff";
		ctx.font = 'bold 20px Sora, "Sora Fallback", sans-serif';
		ctx.textBaseline = "middle";
		ctx.fillText("CBS", 14, 18);
		ctx.font = '600 11px Sora, "Sora Fallback", sans-serif';
		ctx.textAlign = "right";
		ctx.fillText("EXPRESSO", w - 14, 18);
		ctx.textAlign = "left";
		// destinatário greeked
		ctx.fillStyle = NAVY;
		ctx.fillRect(14, 50, 120, 9);
		ctx.fillStyle = "#5c7a8a";
		ctx.fillRect(14, 66, 160, 6);
		ctx.fillRect(14, 78, 132, 6);
		ctx.fillRect(14, 90, 96, 6);
		// código de barras
		let x = 14;
		ctx.fillStyle = NAVY;
		for (let i = 0; i < 46; i += 1) {
			const bar = 2 + ((i * 7) % 4);
			if (i % 3 !== 1) {
				ctx.fillRect(x, 116, bar, 52);
			}
			x += bar + 2;
		}
		// selo "frágil" (taça) no canto
		ctx.strokeStyle = NAVY;
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(208, 120);
		ctx.lineTo(236, 120);
		ctx.lineTo(222, 146);
		ctx.closePath();
		ctx.moveTo(222, 146);
		ctx.lineTo(222, 160);
		ctx.moveTo(212, 160);
		ctx.lineTo(232, 160);
		ctx.stroke();
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = 4;
	return texture;
}

/** Carimbo "CBS" impresso direto no kraft (alfa fora das letras). */
function makeStamp(): Texture {
	const w = 256;
	const h = 128;
	const canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext("2d");
	if (ctx) {
		ctx.clearRect(0, 0, w, h);
		ctx.fillStyle = NAVY;
		ctx.font = 'bold 84px Sora, "Sora Fallback", sans-serif';
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("CBS", w / 2, 52);
		ctx.fillStyle = TAPE;
		ctx.fillRect(44, 100, 168, 9);
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = 4;
	return texture;
}

// Decalques colados às faces: polygonOffset evita z-fighting com o papelão
// sem precisar "levantar" a geometria (o que gerava bordas flutuando).
const DECAL = {
	polygonOffset: true,
	polygonOffsetFactor: -2,
	polygonOffsetUnits: -2,
} as const;

/**
 * A caixa de papelão da CBS, como caixa de e-commerce de verdade: corpo
 * kraft PBR, duas abas no topo com junta central, UMA fita azul fina e
 * personalizada cobrindo a junta e descendo as duas faces, etiqueta de envio
 * numa lateral e carimbo CBS na outra.
 */
export function CardboardBox({ size = 1 }: { size?: number }) {
	const { map, normalMap, roughnessMap } = useTexture(TEXTURE_URLS);

	useEffect(() => {
		for (const texture of [map, normalMap, roughnessMap]) {
			texture.wrapS = RepeatWrapping;
			texture.wrapT = RepeatWrapping;
			texture.repeat.set(1.2, 1.2);
			texture.anisotropy = 8;
			texture.needsUpdate = true;
		}
		map.colorSpace = SRGBColorSpace;
	}, [map, normalMap, roughnessMap]);

	const tape = useMemo(makeTapeTexture, []);
	const shippingLabel = useMemo(makeShippingLabel, []);
	const stamp = useMemo(makeStamp, []);

	const width = 1.6 * size;
	const height = 1.15 * size;
	const depth = 1.25 * size;
	const flapT = 0.05 * size; // espessura do papelão das abas
	const gap = 0.012 * size; // junta entre as abas
	const bodyH = height - flapT;
	const tapeW = 0.13 * size;
	const tapeT = 0.004 * size;
	const radius = 0.03 * size;

	const kraft = (
		<meshStandardMaterial
			map={map}
			normalMap={normalMap}
			normalScale={[0.7, 0.7]}
			roughnessMap={roughnessMap}
		/>
	);

	useEffect(() => {
		// A fita repete "CBS" a cada ~0.45 unidades de comprimento
		tape.repeat.set(1, Math.max(1, Math.round(depth / (0.45 * size))));
		tape.needsUpdate = true;
	}, [tape, depth, size]);

	const flapW = (width - gap) / 2;
	const flapY = bodyH / 2 + flapT / 2 - 0.001 * size;
	const topY = bodyH / 2 + flapT;

	return (
		<group>
			{/* Corpo */}
			<RoundedBox
				args={[width, bodyH, depth]}
				castShadow
				position={[0, 0, 0]}
				radius={radius}
				smoothness={3}
			>
				{kraft}
			</RoundedBox>

			{/* Abas do topo, dobradas para dentro com junta ao centro (eixo z) */}
			{[1, -1].map((side) => (
				<RoundedBox
					args={[flapW, flapT, depth]}
					castShadow
					key={side}
					position={[(side * (flapW + gap)) / 2, flapY, 0]}
					radius={0.012 * size}
					smoothness={2}
				>
					{kraft}
				</RoundedBox>
			))}
			{/* Sombra da junta */}
			<mesh position={[0, flapY, 0]}>
				<boxGeometry args={[gap, flapT * 0.9, depth * 0.96]} />
				<meshStandardMaterial color="#5a3f24" roughness={1} />
			</mesh>

			{/* Fita personalizada: topo sobre a junta + descendo as faces ±z */}
			<mesh castShadow position={[0, topY + tapeT / 2, 0]}>
				<boxGeometry args={[tapeW, tapeT, depth + 2 * tapeT]} />
				<meshPhysicalMaterial
					{...DECAL}
					clearcoat={0.5}
					clearcoatRoughness={0.15}
					map={tape}
					roughness={0.3}
				/>
			</mesh>
			{[1, -1].map((side) => (
				<mesh
					key={side}
					position={[0, height * 0.22, side * (depth / 2 + tapeT / 2)]}
				>
					<boxGeometry args={[tapeW, height * 0.56 + flapT, tapeT]} />
					<meshPhysicalMaterial
						{...DECAL}
						clearcoat={0.5}
						clearcoatRoughness={0.15}
						color={TAPE}
						roughness={0.3}
					/>
				</mesh>
			))}

			{/* Etiqueta de envio na face +x, levemente descentrada */}
			<mesh
				position={[width / 2 + 0.001 * size, -0.04 * size, 0.1 * size]}
				rotation={[0, Math.PI / 2, 0]}
			>
				<planeGeometry args={[depth * 0.56, depth * 0.42]} />
				<meshStandardMaterial {...DECAL} map={shippingLabel} roughness={0.5} />
			</mesh>

			{/* Carimbo CBS na face -x */}
			<mesh
				position={[-width / 2 - 0.001 * size, 0, 0]}
				rotation={[0, -Math.PI / 2, 0]}
			>
				<planeGeometry args={[depth * 0.7, depth * 0.35]} />
				<meshStandardMaterial
					{...DECAL}
					map={stamp}
					roughness={0.9}
					transparent
				/>
			</mesh>
		</group>
	);
}
