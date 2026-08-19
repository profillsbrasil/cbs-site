"use client";

// biome-ignore-start lint: diretiva do React Compiler
"use no memo";
// biome-ignore-end lint: diretiva do React Compiler

import { useMemo } from "react";
import {
	CanvasTexture,
	MeshStandardMaterial,
	SRGBColorSpace,
	type Texture,
} from "three";

const TEX_SIZE = 256;
const KRAFT = "#c89b6a";
const KRAFT_SHADE = "#b8895a";
const TAPE = "#1d9dd8";

function paintKraft(ctx: CanvasRenderingContext2D) {
	ctx.fillStyle = KRAFT;
	ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
	ctx.strokeStyle = KRAFT_SHADE;
	ctx.lineWidth = 2;
	for (let y = 24; y < TEX_SIZE; y += 48) {
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(TEX_SIZE, y);
		ctx.stroke();
	}
}

function paintTape(ctx: CanvasRenderingContext2D, vertical: boolean) {
	const band = TEX_SIZE * 0.22;
	const start = (TEX_SIZE - band) / 2;
	ctx.fillStyle = TAPE;
	if (vertical) {
		ctx.fillRect(start, 0, band, TEX_SIZE);
	} else {
		ctx.fillRect(0, start, TEX_SIZE, band);
	}
	ctx.fillStyle = "#ffffff";
	ctx.font = 'bold 26px Sora, "Sora Fallback", sans-serif';
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	if (vertical) {
		ctx.save();
		ctx.translate(TEX_SIZE / 2, TEX_SIZE / 2);
		ctx.rotate(-Math.PI / 2);
		ctx.fillText("CBS", 0, 0);
		ctx.restore();
	} else {
		ctx.fillText("CBS", TEX_SIZE / 2, TEX_SIZE / 2);
	}
}

function makeFaceTexture(kind: "plain" | "tape-v" | "tape-h"): Texture {
	const canvas = document.createElement("canvas");
	canvas.width = TEX_SIZE;
	canvas.height = TEX_SIZE;
	const ctx = canvas.getContext("2d");
	if (ctx) {
		paintKraft(ctx);
		if (kind !== "plain") {
			paintTape(ctx, kind === "tape-v");
		}
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = 4;
	return texture;
}

/**
 * A caixa de papelão da CBS: kraft fosco com fita azul cruzando o topo e as
 * laterais, "CBS" impresso na fita — o pacote que viaja a página inteira.
 */
export function CardboardBox({ size = 1 }: { size?: number }) {
	const materials = useMemo(() => {
		const plain = makeFaceTexture("plain");
		const tapeV = makeFaceTexture("tape-v");
		const tapeH = makeFaceTexture("tape-h");
		const common = { metalness: 0, roughness: 0.85 };
		// Ordem das faces do BoxGeometry: +x, -x, +y, -y, +z, -z
		return [
			new MeshStandardMaterial({ ...common, map: tapeV }),
			new MeshStandardMaterial({ ...common, map: tapeV }),
			new MeshStandardMaterial({ ...common, map: tapeH }),
			new MeshStandardMaterial({ ...common, map: plain }),
			new MeshStandardMaterial({ ...common, map: tapeV }),
			new MeshStandardMaterial({ ...common, map: tapeV }),
		];
	}, []);

	return (
		<mesh castShadow material={materials} scale={size}>
			<boxGeometry args={[1, 0.82, 1]} />
		</mesh>
	);
}
