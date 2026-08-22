"use client";

// biome-ignore-start lint: diretiva do React Compiler
"use no memo";

// biome-ignore-end lint: diretiva do React Compiler

import { RoundedBox } from "@react-three/drei";
import type { Ref } from "react";
import { useEffect, useMemo, useRef } from "react";
import {
	BackSide,
	CanvasTexture,
	type Group,
	Shape,
	SRGBColorSpace,
	type Texture,
	Vector2,
	Vector3,
} from "three";

const LABEL_W = 512;
const LABEL_H = 320;

/**
 * Rótulo do frasco, mesma assinatura do baú: branco, faixa diagonal
 * azul→aqua na borda direita, logo oficial e linhas de texto greeked.
 * A logo (PNG) chega assíncrona e a textura atualiza.
 */
function makeFrascoLabel(): Texture {
	const canvas = document.createElement("canvas");
	canvas.width = LABEL_W;
	canvas.height = LABEL_H;
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = 4;
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		return texture;
	}
	const paint = (logo: HTMLImageElement | null) => {
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, LABEL_W, LABEL_H);
		// Faixa diagonal na borda direita
		const grad = ctx.createLinearGradient(0, 0, 0, LABEL_H);
		grad.addColorStop(0, "#1d9dd8");
		grad.addColorStop(1, "#a8e0f0");
		ctx.fillStyle = grad;
		ctx.beginPath();
		ctx.moveTo(LABEL_W * 0.78, 0);
		ctx.lineTo(LABEL_W, 0);
		ctx.lineTo(LABEL_W, LABEL_H);
		ctx.lineTo(LABEL_W * 0.64, LABEL_H);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle = "#0f1c2b";
		ctx.beginPath();
		ctx.moveTo(LABEL_W * 0.74, 0);
		ctx.lineTo(LABEL_W * 0.76, 0);
		ctx.lineTo(LABEL_W * 0.62, LABEL_H);
		ctx.lineTo(LABEL_W * 0.6, LABEL_H);
		ctx.closePath();
		ctx.fill();
		// Logo
		const logoW = LABEL_W * 0.42;
		const logoX = LABEL_W * 0.08;
		if (logo) {
			const logoH = (logo.height / logo.width) * logoW;
			ctx.drawImage(logo, logoX, LABEL_H * 0.14, logoW, logoH);
		} else {
			ctx.fillStyle = "#0f1c2b";
			ctx.font = 'bold 72px Sora, "Sora Fallback", sans-serif';
			ctx.textBaseline = "top";
			ctx.fillText("CBS", logoX, LABEL_H * 0.16);
		}
		// Linhas greeked: nome do produto e texto legal
		ctx.fillStyle = "#0f1c2b";
		ctx.fillRect(logoX, LABEL_H * 0.62, LABEL_W * 0.34, 14);
		ctx.fillStyle = "#5c7a8a";
		ctx.fillRect(logoX, LABEL_H * 0.72, LABEL_W * 0.28, 8);
		ctx.fillRect(logoX, LABEL_H * 0.78, LABEL_W * 0.3, 8);
		ctx.fillRect(logoX, LABEL_H * 0.84, LABEL_W * 0.22, 8);
		texture.needsUpdate = true;
	};
	paint(null);
	const logoImage = new Image();
	logoImage.onload = () => paint(logoImage);
	logoImage.src = "/cbs-logo.png";
	return texture;
}

const BAU_TEX_W = 512;
const BAU_TEX_H = 320;

/**
 * Lateral do baú, pintura de frota: logo oficial da CBS à frente e uma faixa
 * diagonal azul→aqua na traseira, com um filete navy. `traseira` diz em que
 * borda da textura fica a faixa — cada lado do baú recebe a sua, para a logo
 * nunca sair espelhada. A logo (PNG) carrega assíncrona: a textura atualiza
 * quando a imagem chega.
 */
function makeBauSide(traseira: "direita" | "esquerda"): Texture {
	const canvas = document.createElement("canvas");
	canvas.width = BAU_TEX_W;
	canvas.height = BAU_TEX_H;
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = 4;
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		return texture;
	}
	const paint = (logo: HTMLImageElement | null) => {
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		// Fundo branco opaco: clearRect deixaria alfa zero, que vira preto
		// num material sem transparent.
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, BAU_TEX_W, BAU_TEX_H);
		// Faixa e filete espelhados em X quando a traseira é à esquerda; a
		// logo é pintada depois, fora da transformação, sempre legível.
		if (traseira === "esquerda") {
			ctx.setTransform(-1, 0, 0, 1, BAU_TEX_W, 0);
		}
		// Frisos verticais sutis (chapa do baú)
		ctx.fillStyle = "rgba(15,28,43,0.06)";
		for (let i = 1; i < 12; i += 1) {
			ctx.fillRect(i * 44 - 1, 0, 2, BAU_TEX_H);
		}
		// Faixa diagonal na traseira: azul CBS → aqua, inclinada ~18°
		const skew = 0.32 * BAU_TEX_H;
		const bandX = BAU_TEX_W * 0.66;
		const bandW = BAU_TEX_W * 0.2;
		const grad = ctx.createLinearGradient(0, 0, 0, BAU_TEX_H);
		grad.addColorStop(0, "#1d9dd8");
		grad.addColorStop(1, "#a8e0f0");
		ctx.fillStyle = grad;
		ctx.beginPath();
		ctx.moveTo(bandX + skew, 0);
		ctx.lineTo(bandX + skew + bandW, 0);
		ctx.lineTo(bandX + bandW, BAU_TEX_H);
		ctx.lineTo(bandX, BAU_TEX_H);
		ctx.closePath();
		ctx.fill();
		// Filete navy paralelo, à frente da faixa
		const stripeX = bandX - BAU_TEX_W * 0.06;
		const stripeW = BAU_TEX_W * 0.022;
		ctx.fillStyle = "#0f1c2b";
		ctx.beginPath();
		ctx.moveTo(stripeX + skew, 0);
		ctx.lineTo(stripeX + skew + stripeW, 0);
		ctx.lineTo(stripeX + stripeW, BAU_TEX_H);
		ctx.lineTo(stripeX, BAU_TEX_H);
		ctx.closePath();
		ctx.fill();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		// Logo oficial à frente (ou wordmark de fallback enquanto carrega)
		const logoW = BAU_TEX_W * 0.42;
		const logoX =
			traseira === "direita"
				? BAU_TEX_W * 0.07
				: BAU_TEX_W - BAU_TEX_W * 0.07 - logoW;
		if (logo) {
			const logoH = (logo.height / logo.width) * logoW;
			ctx.drawImage(logo, logoX, (BAU_TEX_H - logoH) / 2, logoW, logoH);
		} else {
			ctx.fillStyle = "#0f1c2b";
			ctx.font = 'bold 84px Sora, "Sora Fallback", sans-serif';
			ctx.textAlign = "left";
			ctx.textBaseline = "middle";
			ctx.fillText("CBS", logoX, BAU_TEX_H / 2);
		}
		texture.needsUpdate = true;
	};
	paint(null);
	const logoImage = new Image();
	logoImage.onload = () => paint(logoImage);
	logoImage.src = "/cbs-logo.png";
	return texture;
}

/** Grade frontal: lâminas horizontais escuras sobre fundo navy. */
function makeGradeTexture(): Texture {
	const canvas = document.createElement("canvas");
	canvas.width = 128;
	canvas.height = 96;
	const ctx = canvas.getContext("2d");
	if (ctx) {
		ctx.fillStyle = "#111b26";
		ctx.fillRect(0, 0, 128, 96);
		ctx.fillStyle = "#2c3e4e";
		for (let i = 0; i < 5; i += 1) {
			ctx.fillRect(6, 10 + i * 16, 116, 7);
		}
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	return texture;
}

/** Porta traseira: painel de enrolar, frisos horizontais claros. */
function makePortaTexture(): Texture {
	const canvas = document.createElement("canvas");
	canvas.width = 128;
	canvas.height = 160;
	const ctx = canvas.getContext("2d");
	if (ctx) {
		ctx.fillStyle = "#f2f7fa";
		ctx.fillRect(0, 0, 128, 160);
		ctx.strokeStyle = "rgba(15,28,43,0.18)";
		ctx.lineWidth = 2;
		for (let i = 1; i < 10; i += 1) {
			ctx.beginPath();
			ctx.moveTo(0, i * 16);
			ctx.lineTo(128, i * 16);
			ctx.stroke();
		}
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	return texture;
}

// Perfil da garrafa (raio, altura), do fundo ao pescoço: base com pé
// recuado, corpo reto, ombro arredondado, pescoço curto.
const FRASCO_PERFIL: [number, number][] = [
	[0, 0],
	[0.36, 0],
	[0.41, 0.03],
	[0.43, 0.1],
	[0.43, 0.78],
	[0.41, 0.9],
	[0.34, 1.0],
	[0.24, 1.07],
	[0.17, 1.12],
	[0.17, 1.2],
];
const FRASCO_TOPO_Y = 1.2;
const FRASCO_PLASTICO = {
	clearcoat: 0.7,
	clearcoatRoughness: 0.2,
	color: "#ffffff",
	roughness: 0.28,
} as const;

/** Garrafa de saneante (2L) com tampa flip-top azul e rótulo impresso. */
export function Frasco() {
	const label = useMemo(makeFrascoLabel, []);
	const perfil = useMemo(
		() => FRASCO_PERFIL.map(([r, y]) => new Vector2(r, y)),
		[]
	);
	return (
		<group position={[0, -0.72, 0]}>
			<mesh castShadow>
				<latheGeometry args={[perfil, 56]} />
				<meshPhysicalMaterial {...FRASCO_PLASTICO} />
			</mesh>
			{/* Tampa flip-top: base azul, tampa rebaixada e o "bico" da dobradiça */}
			<group position={[0, FRASCO_TOPO_Y, 0]}>
				<mesh castShadow position={[0, 0.07, 0]}>
					<cylinderGeometry args={[0.2, 0.2, 0.14, 32]} />
					<meshPhysicalMaterial
						clearcoat={0.5}
						clearcoatRoughness={0.3}
						color="#1d9dd8"
						roughness={0.35}
					/>
				</mesh>
				<mesh castShadow position={[0, 0.17, 0]}>
					<cylinderGeometry args={[0.17, 0.2, 0.06, 32]} />
					<meshPhysicalMaterial
						clearcoat={0.5}
						clearcoatRoughness={0.3}
						color="#1479ad"
						roughness={0.35}
					/>
				</mesh>
				<mesh position={[0, 0.18, 0.17]}>
					<boxGeometry args={[0.12, 0.04, 0.07]} />
					<meshStandardMaterial color="#1479ad" roughness={0.4} />
				</mesh>
				{/* Filete de vedação navy entre tampa e pescoço */}
				<mesh position={[0, 0.005, 0]}>
					<cylinderGeometry args={[0.185, 0.185, 0.012, 32]} />
					<meshStandardMaterial color="#0f1c2b" roughness={0.5} />
				</mesh>
			</group>
			{/* Rótulo impresso: cilindro aberto colado ao corpo (raio +1mm) */}
			<mesh position={[0, 0.44, 0]} rotation={[0, -1.1, 0]}>
				<cylinderGeometry args={[0.432, 0.432, 0.56, 56, 1, true, 0, 2.2]} />
				<meshStandardMaterial map={label} roughness={0.4} />
			</mesh>
		</group>
	);
}

/** Selo de conformidade: medalha azul DE FRENTE, visto branco e fitas. */
export function Selo() {
	return (
		<group rotation={[0.08, -0.28, 0]}>
			{/* Disco principal, face voltada para a câmera */}
			<mesh rotation={[Math.PI / 2, 0, 0]}>
				<cylinderGeometry args={[0.82, 0.82, 0.14, 56]} />
				<meshPhysicalMaterial
					clearcoat={0.7}
					clearcoatRoughness={0.2}
					color="#1d9dd8"
					metalness={0.1}
					roughness={0.3}
				/>
			</mesh>
			{/* Aro navy no perímetro */}
			<mesh position={[0, 0, 0.04]}>
				<torusGeometry args={[0.82, 0.055, 16, 56]} />
				<meshPhysicalMaterial
					clearcoat={0.6}
					color="#0f1c2b"
					metalness={0.2}
					roughness={0.3}
				/>
			</mesh>
			{/* Anel branco interno */}
			<mesh position={[0, 0, 0.075]}>
				<torusGeometry args={[0.58, 0.035, 14, 48]} />
				<meshStandardMaterial
					color="#ffffff"
					metalness={0.1}
					roughness={0.25}
				/>
			</mesh>
			{/* Visto branco, grande e frontal */}
			<group position={[-0.04, -0.02, 0.1]}>
				<mesh position={[-0.19, -0.06, 0]} rotation={[0, 0, -0.85]}>
					<boxGeometry args={[0.34, 0.13, 0.07]} />
					<meshStandardMaterial color="#ffffff" roughness={0.25} />
				</mesh>
				<mesh position={[0.13, 0.04, 0]} rotation={[0, 0, 0.65]}>
					<boxGeometry args={[0.62, 0.13, 0.07]} />
					<meshStandardMaterial color="#ffffff" roughness={0.25} />
				</mesh>
			</group>
			{/* Fitas caindo atrás do disco */}
			<mesh position={[-0.28, -0.92, -0.06]} rotation={[0, 0, 0.3]}>
				<boxGeometry args={[0.24, 0.62, 0.05]} />
				<meshStandardMaterial color="#0f1c2b" roughness={0.5} />
			</mesh>
			<mesh position={[0.28, -0.92, -0.06]} rotation={[0, 0, -0.3]}>
				<boxGeometry args={[0.24, 0.62, 0.05]} />
				<meshStandardMaterial color="#0f1c2b" roughness={0.5} />
			</mesh>
		</group>
	);
}

// ---------------------------------------------------------------------------
// Caminhão de entrega
//
// Convenção de eixos do grupo raiz (`body`): +X aponta para a frente (cabine),
// Y é altura (rodas em y=0) e Z é a lateral (largura). Comprimento total
// ~2.4, altura ~1.1.
//
// Rodas e porta usam um truque de composição de Euler: o grupo que o
// consumidor vai girar (`rotation.x` puro, contínuo) carrega uma rotação de
// base fixa em Y (ou, para a roda, um subgrupo interno com Z fixo) que
// reorienta o eixo de giro local para o eixo lateral correto do mundo — sem
// isso, girar só em X giraria a peça no eixo errado. A ordem de Euler padrão
// do three.js (XYZ) aplica X primeiro, então a rotação de base em Y sempre
// compõe por cima do giro sem resetá-lo.
// ---------------------------------------------------------------------------

// ─── Caminhão de entrega (referência: caminhão baú urbano cab-over, tipo
// Iveco Tector do Mercado Livre): cabine baixa e curta na frente, baú alto
// dominante atrás, rodas pequenas. Aponta para +X, chão em y=0.

const RODA_RAIO = 0.16;
const RODA_LARGURA = 0.12;

const CHASSI_Y = 0.2;

const BAU_COMPRIMENTO = 1.45;
const BAU_ALTURA = 0.92;
const BAU_LARGURA = 0.92;
const BAU_X = -0.35;
const BAU_Y = 0.26 + BAU_ALTURA / 2;
const BAU_FRENTE_X = BAU_X + BAU_COMPRIMENTO / 2;
const BAU_TRAS_X = BAU_X - BAU_COMPRIMENTO / 2;

const CABINE_COMPRIMENTO = 0.5;
// Teto da cabine a ~80% do teto do baú, como num Tector (cabine baixa, mas
// não um degrau de meio caminhão).
const CABINE_ALTURA = 0.74;
const CABINE_LARGURA = 0.88;
const CABINE_BASE_Y = 0.2;
const CABINE_X = BAU_FRENTE_X + 0.06 + CABINE_COMPRIMENTO / 2;
const CABINE_FRENTE_X = CABINE_X + CABINE_COMPRIMENTO / 2;
const PARABRISA_RECUO = 0.09;

const WHEEL_Z = BAU_LARGURA / 2 - 0.06;
const RODA_FRENTE_X = CABINE_X + 0.02;
const RODA_TRAS_A_X = BAU_X - 0.18;
const RODA_TRAS_B_X = BAU_X - 0.52;

/** Altura total do caminhão (chão em y=0 até o teto do baú). Quem ancora o
 * modelo usa isto como `unitHeight` para o chão cair exatamente na borda
 * inferior da âncora. */
export const CAMINHAO_ALTURA = BAU_Y + BAU_ALTURA / 2;

// Chassi: longarina entre a traseira do baú e a frente da cabine — nunca
// sobrando para fora do corpo.
const CHASSI_TRAS_X = BAU_TRAS_X + 0.04;
const CHASSI_FRENTE_X = CABINE_FRENTE_X - 0.06;
const CHASSI_COMPRIMENTO = CHASSI_FRENTE_X - CHASSI_TRAS_X;
const CHASSI_X = (CHASSI_FRENTE_X + CHASSI_TRAS_X) / 2;

/** Ponto-alvo dentro do baú (posição local do grupo raiz), perto do centro
 * e um pouco à frente da porta traseira. */
const CARGO_TARGET = new Vector3(BAU_X + 0.2, BAU_Y - 0.08, 0);

/**
 * Uma roda: pneu + aro + cubo, com o eixo do cilindro deitado em Z (lateral
 * do caminhão). O grupo gira via `rotation.z` — rolagem física correta, sem
 * composição de Euler que entorte a roda.
 */
function Roda({ ref, x, z }: { ref?: Ref<Group>; x: number; z: number }) {
	return (
		<group position={[x, RODA_RAIO, z]} ref={ref}>
			<mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
				<cylinderGeometry args={[RODA_RAIO, RODA_RAIO, RODA_LARGURA, 28]} />
				<meshStandardMaterial color="#1f2933" roughness={0.8} />
			</mesh>
			<mesh rotation={[Math.PI / 2, 0, 0]}>
				<cylinderGeometry
					args={[RODA_RAIO * 0.52, RODA_RAIO * 0.52, RODA_LARGURA + 0.012, 22]}
				/>
				<meshStandardMaterial
					color="#d3dde4"
					metalness={0.45}
					roughness={0.3}
				/>
			</mesh>
			<mesh rotation={[Math.PI / 2, 0, 0]}>
				<cylinderGeometry
					args={[RODA_RAIO * 0.16, RODA_RAIO * 0.16, RODA_LARGURA + 0.024, 12]}
				/>
				<meshStandardMaterial
					color="#8fa3b0"
					metalness={0.5}
					roughness={0.35}
				/>
			</mesh>
		</group>
	);
}

/** Para-lama reto sobre uma roda (estilo caminhão urbano, não arco de moto). */
function ParaLama({ x, z }: { x: number; z: number }) {
	return (
		<mesh position={[x, RODA_RAIO * 2 + 0.035, z]}>
			<boxGeometry args={[RODA_RAIO * 2.4, 0.03, RODA_LARGURA + 0.05]} />
			<meshStandardMaterial color="#16232f" roughness={0.6} />
		</mesh>
	);
}

/**
 * Cabine cab-over: perfil lateral desenhado como Shape (base reta, frente
 * quase vertical, para-brisa inclinado, teto curto) extrudado na largura —
 * a silhueta certa sem empilhar caixas.
 */
function Cabine() {
	const geometria = useMemo(() => {
		const perfil = new Shape();
		const t = CABINE_COMPRIMENTO;
		const h = CABINE_ALTURA;
		perfil.moveTo(0, 0);
		perfil.lineTo(t, 0);
		perfil.lineTo(t, h * 0.62);
		perfil.lineTo(t - PARABRISA_RECUO, h);
		perfil.lineTo(0, h);
		perfil.closePath();
		return [
			perfil,
			{
				bevelEnabled: true,
				bevelSegments: 2,
				bevelSize: 0.018,
				bevelThickness: 0.018,
				depth: CABINE_LARGURA - 0.036,
				steps: 1,
			},
		] as const;
	}, []);
	const vidro = {
		color: "#bfe4f2",
		metalness: 0,
		roughness: 0.08,
	} as const;
	// Ângulo do para-brisa em relação à vertical
	const anguloParabrisa = Math.atan2(PARABRISA_RECUO, CABINE_ALTURA * 0.38);
	return (
		<group position={[CABINE_X, CABINE_BASE_Y, 0]}>
			<mesh
				castShadow
				position={[-CABINE_COMPRIMENTO / 2, 0, -(CABINE_LARGURA - 0.036) / 2]}
			>
				<extrudeGeometry args={geometria} />
				<meshPhysicalMaterial
					clearcoat={0.7}
					clearcoatRoughness={0.2}
					color="#0f1c2b"
					roughness={0.3}
				/>
			</mesh>
			{/* Para-brisa: painel colado na rampa frontal */}
			<mesh
				position={[
					CABINE_COMPRIMENTO / 2 - PARABRISA_RECUO / 2 + 0.012,
					CABINE_ALTURA * 0.81,
					0,
				]}
				rotation={[0, 0, -anguloParabrisa]}
			>
				<boxGeometry
					args={[0.015, CABINE_ALTURA * 0.34, CABINE_LARGURA * 0.82]}
				/>
				<meshStandardMaterial {...vidro} />
			</mesh>
			{/* Janelas laterais */}
			{[1, -1].map((lado) => (
				<mesh
					key={lado}
					position={[
						-CABINE_COMPRIMENTO * 0.04,
						CABINE_ALTURA * 0.78,
						(lado * CABINE_LARGURA) / 2,
					]}
				>
					<boxGeometry
						args={[CABINE_COMPRIMENTO * 0.55, CABINE_ALTURA * 0.3, 0.015]}
					/>
					<meshStandardMaterial {...vidro} />
				</mesh>
			))}
			{/* Retrovisores */}
			{[1, -1].map((lado) => (
				<group
					key={lado}
					position={[
						CABINE_COMPRIMENTO / 2 - 0.05,
						CABINE_ALTURA * 0.86,
						(lado * (CABINE_LARGURA + 0.14)) / 2,
					]}
				>
					<mesh>
						<boxGeometry args={[0.02, 0.02, 0.14]} />
						<meshStandardMaterial color="#0f1c2b" roughness={0.5} />
					</mesh>
					<mesh position={[0, -0.05, (lado * 0.14) / 2]}>
						<boxGeometry args={[0.025, 0.11, 0.06]} />
						<meshStandardMaterial color="#16232f" roughness={0.4} />
					</mesh>
				</group>
			))}
		</group>
	);
}

/** Frente: grade texturizada, para-choque envolvente, faróis e placa. */
function FrenteCaminhao() {
	const grade = useMemo(makeGradeTexture, []);
	return (
		<group position={[CABINE_FRENTE_X, 0, 0]}>
			<mesh position={[0.005, CABINE_BASE_Y + 0.14, 0]}>
				<boxGeometry args={[0.02, 0.2, CABINE_LARGURA * 0.72]} />
				<meshStandardMaterial map={grade} roughness={0.55} />
			</mesh>
			{/* Para-choque */}
			<mesh castShadow position={[0.02, CABINE_BASE_Y - 0.02, 0]}>
				<boxGeometry args={[0.07, 0.12, CABINE_LARGURA + 0.04]} />
				<meshStandardMaterial color="#c3ced6" roughness={0.45} />
			</mesh>
			{/* Faróis */}
			{[1, -1].map((lado) => (
				<mesh
					key={lado}
					position={[
						0.035,
						CABINE_BASE_Y + 0.075,
						lado * (CABINE_LARGURA / 2 - 0.1),
					]}
				>
					<boxGeometry args={[0.025, 0.05, 0.1]} />
					<meshStandardMaterial
						color="#fff3d6"
						emissive="#fff3d6"
						emissiveIntensity={0.6}
					/>
				</mesh>
			))}
			{/* Placa */}
			<mesh position={[0.058, CABINE_BASE_Y - 0.02, 0]}>
				<boxGeometry args={[0.012, 0.055, 0.16]} />
				<meshStandardMaterial color="#f2f5f7" roughness={0.4} />
			</mesh>
		</group>
	);
}

/** Baú branco com marca CBS nas laterais, faixa azul e luzes traseiras. */
function Bau() {
	// Lado +z (rotação 0): u cresce para +X = frente, traseira à esquerda.
	// Lado -z (rotação π): u cresce para -X = traseira à direita.
	const lateralZ = useMemo(() => makeBauSide("esquerda"), []);
	const lateralMenosZ = useMemo(() => makeBauSide("direita"), []);
	return (
		<group>
			<RoundedBox
				args={[BAU_COMPRIMENTO, BAU_ALTURA, BAU_LARGURA]}
				castShadow
				position={[BAU_X, BAU_Y, 0]}
				radius={0.02}
				smoothness={3}
			>
				<meshPhysicalMaterial
					clearcoat={0.35}
					clearcoatRoughness={0.3}
					color="#ffffff"
					roughness={0.35}
				/>
			</RoundedBox>
			{/* Marca nas duas laterais */}
			{[1, -1].map((lado) => (
				<mesh
					key={lado}
					position={[BAU_X, BAU_Y + 0.06, (lado * (BAU_LARGURA + 0.006)) / 2]}
					rotation={[0, lado === 1 ? 0 : Math.PI, 0]}
				>
					<planeGeometry args={[BAU_COMPRIMENTO * 0.94, BAU_ALTURA * 0.74]} />
					<meshStandardMaterial
						map={lado === 1 ? lateralZ : lateralMenosZ}
						roughness={0.4}
					/>
				</mesh>
			))}
			{/* Faixa azul na base do baú */}
			<mesh position={[BAU_X, 0.26 + 0.045, 0]}>
				<boxGeometry
					args={[BAU_COMPRIMENTO + 0.004, 0.09, BAU_LARGURA + 0.004]}
				/>
				<meshStandardMaterial color="#1d9dd8" roughness={0.35} />
			</mesh>
			{/* Interior visível com a porta aberta */}
			<mesh position={[BAU_X, BAU_Y, 0]}>
				<boxGeometry
					args={[BAU_COMPRIMENTO - 0.08, BAU_ALTURA - 0.08, BAU_LARGURA - 0.08]}
				/>
				<meshStandardMaterial color="#d7dee3" roughness={0.8} side={BackSide} />
			</mesh>
			{/* Luzes traseiras */}
			{[1, -1].map((lado) => (
				<mesh
					key={lado}
					position={[BAU_TRAS_X - 0.005, 0.34, lado * (BAU_LARGURA / 2 - 0.07)]}
				>
					<boxGeometry args={[0.02, 0.05, 0.08]} />
					<meshStandardMaterial
						color="#c94f43"
						emissive="#b33327"
						emissiveIntensity={0.5}
					/>
				</mesh>
			))}
		</group>
	);
}

/**
 * Porta traseira de enrolar: pivô na dobradiça superior. Abre girando
 * `rotation.z` positivo (o painel sobe em direção ao teto do baú).
 */
function Porta({ ref }: { ref?: Ref<Group> }) {
	const painel = useMemo(makePortaTexture, []);
	return (
		<group position={[BAU_TRAS_X, BAU_Y + BAU_ALTURA / 2 - 0.06, 0]} ref={ref}>
			<mesh castShadow position={[0, -(BAU_ALTURA - 0.12) / 2, 0]}>
				<boxGeometry args={[0.025, BAU_ALTURA - 0.12, BAU_LARGURA - 0.1]} />
				<meshStandardMaterial map={painel} roughness={0.5} />
			</mesh>
		</group>
	);
}

/** Chassi: longarina escura contida no corpo, para-choque traseiro e tanque. */
function Chassi() {
	return (
		<group>
			<mesh position={[CHASSI_X, CHASSI_Y, 0]}>
				<boxGeometry args={[CHASSI_COMPRIMENTO, 0.08, BAU_LARGURA * 0.6]} />
				<meshStandardMaterial color="#13202d" roughness={0.6} />
			</mesh>
			{/* Para-choque traseiro: barra baixa sob a porta, na largura do baú */}
			<mesh position={[BAU_TRAS_X + 0.02, CHASSI_Y - 0.06, 0]}>
				<boxGeometry args={[0.04, 0.05, BAU_LARGURA * 0.9]} />
				<meshStandardMaterial color="#c3ced6" roughness={0.45} />
			</mesh>
			<mesh
				position={[BAU_FRENTE_X - 0.1, CHASSI_Y - 0.03, WHEEL_Z * 0.8]}
				rotation={[0, 0, Math.PI / 2]}
			>
				<cylinderGeometry args={[0.055, 0.055, 0.3, 14]} />
				<meshStandardMaterial
					color="#8fa3b0"
					metalness={0.5}
					roughness={0.35}
				/>
			</mesh>
		</group>
	);
}

export interface CaminhaoParts {
	/** Grupo raiz do corpo (balanço/suspensão). */
	body: Group;
	/** Ponto-alvo dentro do baú onde a caixa deve terminar (posição local do grupo raiz). */
	cargoTarget: Vector3;
	/** Porta traseira do baú; pivô na dobradiça superior (`rotation.z` 0 = fechada, ~1.6 = aberta pra cima). */
	door: Group;
	/** Rodas para girar (`rotation.z` contínuo — eixo lateral, rolagem física). */
	wheels: Group[];
}

const WHEEL_POSITIONS: [number, number][] = [
	[RODA_FRENTE_X, WHEEL_Z],
	[RODA_FRENTE_X, -WHEEL_Z],
	[RODA_TRAS_A_X, WHEEL_Z],
	[RODA_TRAS_A_X, -WHEEL_Z],
	[RODA_TRAS_B_X, WHEEL_Z],
	[RODA_TRAS_B_X, -WHEEL_Z],
];

/**
 * O caminhão de entrega da CBS, com partes animáveis expostas via `onParts`
 * (chamado uma vez após o mount). O componente não anima nada sozinho.
 */
export function CaminhaoEntrega({
	onParts,
}: {
	onParts?: (parts: CaminhaoParts) => void;
}) {
	const body = useRef<Group>(null);
	const door = useRef<Group>(null);
	const wheelRefs = useRef<(Group | null)[]>([]);
	const wheelSetters = useMemo(
		() =>
			WHEEL_POSITIONS.map((_, index) => (group: Group | null) => {
				wheelRefs.current[index] = group;
			}),
		[]
	);

	useEffect(() => {
		const wheels = wheelRefs.current.filter((w): w is Group => w !== null);
		if (body.current && door.current && wheels.length > 0) {
			onParts?.({
				body: body.current,
				cargoTarget: CARGO_TARGET,
				door: door.current,
				wheels,
			});
		}
	}, [onParts]);

	return (
		<group ref={body}>
			<Bau />
			<Porta ref={door} />
			<Cabine />
			<FrenteCaminhao />
			<Chassi />
			{WHEEL_POSITIONS.map(([x, z], index) => (
				<Roda key={`${x}:${z}`} ref={wheelSetters[index]} x={x} z={z} />
			))}
			<ParaLama x={RODA_TRAS_A_X} z={WHEEL_Z} />
			<ParaLama x={RODA_TRAS_A_X} z={-WHEEL_Z} />
			<ParaLama x={RODA_TRAS_B_X} z={WHEEL_Z} />
			<ParaLama x={RODA_TRAS_B_X} z={-WHEEL_Z} />
		</group>
	);
}
