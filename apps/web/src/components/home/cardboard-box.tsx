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
const CREASE = "#b8895a";

// PBR ambientCG "Cardboard004" (CC0, 1K) — color/normal/roughness reais.
const TEXTURE_URLS = {
	map: "/textures/cardboard/color.webp",
	normalMap: "/textures/cardboard/normal.webp",
	roughnessMap: "/textures/cardboard/roughness.webp",
};
useTexture.preload(Object.values(TEXTURE_URLS));

const LABEL_W = 512;
const LABEL_H = 128;

/**
 * Rótulo "CBS" branco impresso na fita. `vertical` gira o texto para as
 * corridas de fita que descem pelas faces (lê de lado, como fita real).
 */
function makeTapeLabel(vertical: boolean): Texture {
	const canvas = document.createElement("canvas");
	canvas.width = vertical ? LABEL_H : LABEL_W;
	canvas.height = vertical ? LABEL_W : LABEL_H;
	const ctx = canvas.getContext("2d");
	if (ctx) {
		ctx.fillStyle = TAPE;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "#ffffff";
		ctx.font = 'bold 68px Sora, "Sora Fallback", sans-serif';
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		if (vertical) {
			ctx.save();
			ctx.translate(canvas.width / 2, canvas.height / 2);
			ctx.rotate(-Math.PI / 2);
			ctx.fillText("CBS", 0, 4);
			ctx.restore();
		} else {
			ctx.fillText("CBS", canvas.width / 2, canvas.height / 2 + 4);
		}
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	return texture;
}

type TapeStripProps = Readonly<{
	axis: "x" | "z";
	width: number;
	height: number;
	depth: number;
	size: number;
	labelMap?: Texture;
	sideLabelMap?: Texture;
}>;

/**
 * Uma faixa de fita: três caixas achatadas (topo + duas laterais opostas)
 * que cruzam a quina viva do papelão, como fita de embalagem real — não
 * é textura na caixa, é geometria própria por cima.
 */
function TapeStrip({
	axis,
	width,
	height,
	depth,
	size,
	labelMap,
	sideLabelMap,
}: TapeStripProps) {
	const thickness = 0.02 * size;
	const lift = 0.004 * size;
	const sideHeight = height * 0.96;
	const along = (axis === "x" ? width : depth) * 0.98;
	const band = (axis === "x" ? depth : width) * 0.22;
	const sideOffset = (axis === "x" ? width : depth) / 2 + lift;

	const topArgs: [number, number, number] =
		axis === "x" ? [along, thickness, band] : [band, thickness, along];
	const sideArgs: [number, number, number] =
		axis === "x"
			? [thickness, sideHeight, band]
			: [band, sideHeight, thickness];
	const sidePositionA: [number, number, number] =
		axis === "x" ? [sideOffset, 0, 0] : [0, 0, sideOffset];
	const sidePositionB: [number, number, number] =
		axis === "x" ? [-sideOffset, 0, 0] : [0, 0, -sideOffset];

	return (
		<group>
			<mesh castShadow position={[0, height / 2 + lift, 0]}>
				<boxGeometry args={topArgs} />
				<meshPhysicalMaterial
					clearcoat={0.4}
					clearcoatRoughness={0.15}
					color={labelMap ? "#ffffff" : TAPE}
					map={labelMap}
					roughness={0.3}
				/>
			</mesh>
			<mesh castShadow position={sidePositionA}>
				<boxGeometry args={sideArgs} />
				<meshPhysicalMaterial
					clearcoat={0.4}
					clearcoatRoughness={0.15}
					color={sideLabelMap ? "#ffffff" : TAPE}
					map={sideLabelMap}
					roughness={0.3}
				/>
			</mesh>
			<mesh castShadow position={sidePositionB}>
				<boxGeometry args={sideArgs} />
				<meshPhysicalMaterial
					clearcoat={0.4}
					clearcoatRoughness={0.15}
					color={sideLabelMap ? "#ffffff" : TAPE}
					map={sideLabelMap}
					roughness={0.3}
				/>
			</mesh>
		</group>
	);
}

/**
 * A caixa de papelão da CBS: kraft PBR (color + normal + roughness reais)
 * com aresta viva de RoundedBox, fita azul cruzando topo e laterais como
 * geometria própria, "CBS" impresso na faixa horizontal — o pacote que
 * viaja a página inteira.
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

	const tapeLabel = useMemo(() => makeTapeLabel(false), []);
	const tapeSideLabel = useMemo(() => makeTapeLabel(true), []);

	const width = 1.6 * size;
	const height = 1.15 * size;
	const depth = 1.25 * size;

	return (
		<group>
			<RoundedBox
				args={[width, height, depth]}
				bevelSegments={4}
				castShadow
				creaseAngle={0.3}
				radius={0.035 * size}
				smoothness={4}
			>
				<meshStandardMaterial
					map={map}
					normalMap={normalMap}
					normalScale={[0.7, 0.7]}
					roughnessMap={roughnessMap}
				/>
			</RoundedBox>

			{/* vinco: linha escura sutil onde as abas do topo se encontram */}
			<mesh position={[0, height / 2 + 0.002 * size, 0]}>
				<boxGeometry args={[0.012 * size, 0.003 * size, depth * 0.98]} />
				<meshStandardMaterial color={CREASE} roughness={0.9} />
			</mesh>

			<TapeStrip
				axis="x"
				depth={depth}
				height={height}
				labelMap={tapeLabel}
				size={size}
				width={width}
			/>
			<TapeStrip
				axis="z"
				depth={depth}
				height={height}
				sideLabelMap={tapeSideLabel}
				size={size}
				width={width}
			/>
		</group>
	);
}
