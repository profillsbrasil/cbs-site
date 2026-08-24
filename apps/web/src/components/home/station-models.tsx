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
	DoubleSide,
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
// Van de entrega
//
// Convenção de eixos do grupo raiz (`body`): +X aponta para a frente (capô),
// Y é altura (rodas em y=0) e Z é a lateral (largura). Comprimento total
// ~2.16, altura ~1.04.
//
// As rodas usam o eixo do cilindro deitado em Z: o grupo gira via
// `rotation.z` — rolagem física correta, sem composição de Euler. As portas
// traseiras têm o pivô na dobradiça vertical (borda externa) e abrem via
// `rotation.y`, cada folha para o seu lado.
// ---------------------------------------------------------------------------

// ─── Van de entrega (referência: Renault Master da frota do Mercado Livre):
// monobloco amarelo, capô curto inclinado, para-brisa grande, teto alto,
// traseira reta com portas duplas. Aponta para +X, chão em y=0.

const RODA_RAIO = 0.16;
const RODA_LARGURA = 0.12;

const VAN_AMARELO = "#ffe600";
const VAN_NAVY = "#2d3277";
const VAN_GRAFITE = "#39434c";

const VAN_LARGURA = 0.92;
const VAN_TETO_Y = 1.04;
const VAN_PISO_Y = 0.16;
const VAN_TRAS_X = -1.05;

// Corpo de carga: caixa arredondada até debaixo da cabine; atrás de
// CARGA_BOCA_X fica um anel de paredes (teto/piso/laterais) formando a boca
// da abertura traseira, com o interior cinza à mostra quando as portas abrem.
const CARGA_FRENTE_X = 0.55;
const CARGA_BOCA_X = -0.78;
const ABERTURA_MEIA_LARGURA = 0.38;
const ABERTURA_Y0 = 0.28;
const ABERTURA_Y1 = 0.96;

const WHEEL_Z = VAN_LARGURA / 2 - 0.06;
const RODA_FRENTE_X = 0.7;
const RODA_TRAS_X = -0.6;

/** Altura total da van (chão em y=0 até o teto). Quem ancora o modelo usa
 * isto como `unitHeight` para o chão cair exatamente na borda inferior da
 * âncora. */
export const CAMINHAO_ALTURA = VAN_TETO_Y;

/** Ponto-alvo dentro do vão de carga (posição local do grupo raiz), um pouco
 * à frente das portas traseiras. */
const CARGO_TARGET = new Vector3(-0.88, 0.58, 0);

const VAN_TEX_W = 1024;
const VAN_TEX_H = 448;

// O decalque lateral cobre x∈[-1.02, 0.44] e y∈[0.19, 1.01] do modelo.
// px(x) = (x + 1.02) / 1.46 * 1024; py(y) = (1.01 - y) / 0.82 * 448.
const DECAL_COMPRIMENTO = 1.46;
const DECAL_ALTURA = 0.82;
const DECAL_CENTRO_X = -0.29;
const DECAL_CENTRO_Y = 0.6;

/**
 * Lateral da van, pintura da frota: logo oficial do Mercado Livre sobre o
 * vão de carga, vincos da porta deslizante com trilho e a tagline abaixo
 * dele. `traseira` diz em que borda da textura fica a traseira — cada lado
 * recebe a sua, para o logo nunca sair espelhado. O logo (PNG) carrega
 * assíncrono: a textura atualiza quando a imagem chega.
 */
function makeLadoVan(traseira: "direita" | "esquerda"): Texture {
	const canvas = document.createElement("canvas");
	canvas.width = VAN_TEX_W;
	canvas.height = VAN_TEX_H;
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = 4;
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		return texture;
	}
	const paint = (logo: HTMLImageElement | null) => {
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.fillStyle = VAN_AMARELO;
		ctx.fillRect(0, 0, VAN_TEX_W, VAN_TEX_H);
		// Vincos e trilho espelhados quando a traseira fica à direita; o logo
		// e a tagline são pintados depois, fora da transformação.
		if (traseira === "direita") {
			ctx.setTransform(-1, 0, 0, 1, VAN_TEX_W, 0);
		}
		// Vincos verticais da porta deslizante (x=-0.30 e x=0.30 do modelo)
		ctx.fillStyle = "rgba(45,50,119,0.3)";
		ctx.fillRect(505, 40, 3, VAN_TEX_H - 60);
		ctx.fillRect(926, 40, 3, VAN_TEX_H - 60);
		// Trilho da porta deslizante (y≈0.40) com o puxador na ponta
		ctx.fillStyle = "rgba(120,104,0,0.45)";
		ctx.fillRect(505, 330, 421, 9);
		ctx.fillStyle = VAN_NAVY;
		ctx.fillRect(880, 322, 34, 25);
		// Friso inferior sutil da chapa
		ctx.fillStyle = "rgba(120,104,0,0.18)";
		ctx.fillRect(24, VAN_TEX_H - 26, VAN_TEX_W - 48, 4);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		// Logo oficial sobre o vão de carga (ou wordmark de fallback)
		const logoW = 440;
		const logoH = Math.round(logoW * 0.252);
		const logoX = traseira === "esquerda" ? 60 : VAN_TEX_W - 60 - logoW;
		const logoY = 59;
		if (logo) {
			ctx.drawImage(logo, logoX, logoY, logoW, logoH);
		} else {
			ctx.fillStyle = VAN_NAVY;
			ctx.font = 'bold 64px Sora, "Sora Fallback", sans-serif';
			ctx.textAlign = "left";
			ctx.textBaseline = "middle";
			ctx.fillText("mercado livre", logoX, logoY + logoH / 2);
		}
		// Tagline centrada na porta deslizante
		const taglineX = traseira === "esquerda" ? 715 : VAN_TEX_W - 715;
		ctx.fillStyle = VAN_NAVY;
		ctx.font = '600 34px Sora, "Sora Fallback", sans-serif';
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("O melhor tá chegando", taglineX, 388);
		texture.needsUpdate = true;
	};
	paint(null);
	const logoImage = new Image();
	logoImage.onload = () => paint(logoImage);
	logoImage.src = "/mercado-livre-logo.png";
	return texture;
}

/**
 * Folha da porta traseira: amarela com o logo pequeno (folha esquerda) ou o
 * aviso "Como estou dirigindo?" (folha direita), como na frota real.
 */
function makePortaVanTexture(variante: "aviso" | "logo"): Texture {
	const canvas = document.createElement("canvas");
	canvas.width = 256;
	canvas.height = 448;
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		return texture;
	}
	const paint = (logo: HTMLImageElement | null) => {
		ctx.fillStyle = VAN_AMARELO;
		ctx.fillRect(0, 0, 256, 448);
		ctx.fillStyle = "rgba(120,104,0,0.35)";
		ctx.fillRect(4, 8, 3, 432);
		ctx.fillRect(249, 8, 3, 432);
		if (variante === "logo") {
			if (logo) {
				ctx.drawImage(logo, 33, 130, 190, 48);
			} else {
				ctx.fillStyle = VAN_NAVY;
				ctx.font = 'bold 30px Sora, "Sora Fallback", sans-serif';
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillText("mercado livre", 128, 154);
			}
		} else {
			ctx.fillStyle = VAN_NAVY;
			ctx.font = '600 26px Sora, "Sora Fallback", sans-serif';
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("Como estou", 128, 280);
			ctx.fillText("dirigindo?", 128, 314);
		}
		// Maçaneta na borda interna (a borda z=0 do vão)
		ctx.fillStyle = VAN_NAVY;
		ctx.fillRect(variante === "logo" ? 214 : 20, 200, 22, 44);
		texture.needsUpdate = true;
	};
	paint(null);
	if (variante === "logo") {
		const logoImage = new Image();
		logoImage.onload = () => paint(logoImage);
		logoImage.src = "/mercado-livre-logo.png";
	}
	return texture;
}

const VAN_PINTURA = {
	clearcoat: 0.5,
	clearcoatRoughness: 0.25,
	color: VAN_AMARELO,
	roughness: 0.38,
} as const;

const VIDRO = {
	color: "#bfe4f2",
	metalness: 0,
	roughness: 0.08,
} as const;

/**
 * Uma roda: pneu + aro + cubo, com o eixo do cilindro deitado em Z (lateral
 * da van). O grupo gira via `rotation.z` — rolagem física correta, sem
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

/** Arco de roda: meia-casca escura envolvendo o topo da roda por fora da
 * saia, como o plástico do para-lama da van real. */
function ArcoRoda({ x, z }: { x: number; z: number }) {
	return (
		<mesh position={[x, RODA_RAIO, z]} rotation={[Math.PI / 2, 0, 0]}>
			<cylinderGeometry
				args={[0.215, 0.215, 0.05, 18, 1, true, -Math.PI / 2, Math.PI]}
			/>
			<meshStandardMaterial color="#1a232b" roughness={0.7} side={DoubleSide} />
		</mesh>
	);
}

/**
 * Corpo de carga: caixa arredondada amarela + anel da boca traseira
 * (teto/piso/laterais) + interior cinza (BackSide) + lanternas verticais e
 * para-choque traseiro.
 */
function CorpoVan() {
	const lateralZ = useMemo(() => makeLadoVan("esquerda"), []);
	const lateralMenosZ = useMemo(() => makeLadoVan("direita"), []);
	return (
		<group>
			<RoundedBox
				args={[
					CARGA_FRENTE_X - CARGA_BOCA_X,
					VAN_TETO_Y - VAN_PISO_Y,
					VAN_LARGURA,
				]}
				castShadow
				position={[
					(CARGA_FRENTE_X + CARGA_BOCA_X) / 2,
					(VAN_TETO_Y + VAN_PISO_Y) / 2,
					0,
				]}
				radius={0.03}
				smoothness={3}
			>
				<meshPhysicalMaterial {...VAN_PINTURA} />
			</RoundedBox>
			{/* Anel da boca traseira: teto, piso e laterais da abertura */}
			<mesh castShadow position={[(CARGA_BOCA_X + VAN_TRAS_X) / 2, 1, 0]}>
				<boxGeometry
					args={[
						CARGA_BOCA_X - VAN_TRAS_X,
						VAN_TETO_Y - ABERTURA_Y1,
						VAN_LARGURA,
					]}
				/>
				<meshPhysicalMaterial {...VAN_PINTURA} />
			</mesh>
			<mesh castShadow position={[(CARGA_BOCA_X + VAN_TRAS_X) / 2, 0.22, 0]}>
				<boxGeometry
					args={[
						CARGA_BOCA_X - VAN_TRAS_X,
						ABERTURA_Y0 - VAN_PISO_Y,
						VAN_LARGURA,
					]}
				/>
				<meshPhysicalMaterial {...VAN_PINTURA} />
			</mesh>
			{[1, -1].map((lado) => (
				<mesh
					castShadow
					key={lado}
					position={[
						(CARGA_BOCA_X + VAN_TRAS_X) / 2,
						(ABERTURA_Y0 + ABERTURA_Y1) / 2,
						lado * (ABERTURA_MEIA_LARGURA + 0.04),
					]}
				>
					<boxGeometry
						args={[
							CARGA_BOCA_X - VAN_TRAS_X,
							ABERTURA_Y1 - ABERTURA_Y0,
							VAN_LARGURA / 2 - ABERTURA_MEIA_LARGURA,
						]}
					/>
					<meshPhysicalMaterial {...VAN_PINTURA} />
				</mesh>
			))}
			{/* Interior do vão de carga, visível com as portas abertas */}
			<mesh position={[-0.91, 0.62, 0]}>
				<boxGeometry args={[0.26, 0.66, 0.74]} />
				<meshStandardMaterial color="#d7dee3" roughness={0.8} side={BackSide} />
			</mesh>
			{/* Decalque da pintura nas duas laterais */}
			{[1, -1].map((lado) => (
				<mesh
					key={lado}
					position={[
						DECAL_CENTRO_X,
						DECAL_CENTRO_Y,
						lado * (VAN_LARGURA / 2 + 0.002),
					]}
					rotation={[0, lado === 1 ? 0 : Math.PI, 0]}
				>
					<planeGeometry args={[DECAL_COMPRIMENTO, DECAL_ALTURA]} />
					<meshPhysicalMaterial
						clearcoat={0.5}
						clearcoatRoughness={0.25}
						map={lado === 1 ? lateralZ : lateralMenosZ}
						roughness={0.38}
					/>
				</mesh>
			))}
			{/* Lanternas traseiras verticais */}
			{[1, -1].map((lado) => (
				<mesh key={lado} position={[VAN_TRAS_X - 0.008, 0.44, lado * 0.435]}>
					<boxGeometry args={[0.02, 0.22, 0.05]} />
					<meshStandardMaterial
						color="#c94f43"
						emissive="#b33327"
						emissiveIntensity={0.5}
					/>
				</mesh>
			))}
			{/* Para-choque traseiro baixo */}
			<mesh position={[VAN_TRAS_X - 0.01, 0.12, 0]}>
				<boxGeometry args={[0.05, 0.07, VAN_LARGURA * 0.94]} />
				<meshStandardMaterial color={VAN_GRAFITE} roughness={0.6} />
			</mesh>
		</group>
	);
}

/**
 * Cabine monobloco: perfil lateral (capô curto, para-brisa inclinado, nariz
 * arredondado) extrudado na largura, emendado por baixo do corpo de carga —
 * o mesmo amarelo funde a silhueta numa van só. Carrega vidros, faróis,
 * grade, para-choque e retrovisores.
 */
function CabineVan() {
	const geometria = useMemo(() => {
		const perfil = new Shape();
		perfil.moveTo(0.35, VAN_PISO_Y);
		perfil.lineTo(1, VAN_PISO_Y);
		perfil.quadraticCurveTo(1.08, VAN_PISO_Y, 1.08, 0.3);
		perfil.lineTo(1.08, 0.44);
		perfil.quadraticCurveTo(1.07, 0.53, 0.98, 0.55);
		perfil.lineTo(0.8, 0.61);
		perfil.quadraticCurveTo(0.75, 0.63, 0.72, 0.68);
		perfil.lineTo(0.48, 1);
		perfil.quadraticCurveTo(0.46, VAN_TETO_Y, 0.42, VAN_TETO_Y);
		perfil.lineTo(0.35, VAN_TETO_Y);
		perfil.closePath();
		return [
			perfil,
			{
				bevelEnabled: true,
				bevelSegments: 2,
				bevelSize: 0.02,
				bevelThickness: 0.02,
				depth: VAN_LARGURA - 0.08,
				steps: 1,
			},
		] as const;
	}, []);
	const janela = useMemo(() => {
		const forma = new Shape();
		forma.moveTo(0.34, 0.64);
		forma.lineTo(0.7, 0.64);
		forma.lineTo(0.53, 0.96);
		forma.lineTo(0.34, 0.96);
		forma.closePath();
		return [forma, { bevelEnabled: false, depth: 0.012 }] as const;
	}, []);
	// Para-brisa: painel colado na rampa (0.72,0.68)→(0.48,1.00)
	return (
		<group>
			<mesh castShadow position={[0, 0, -(VAN_LARGURA - 0.08) / 2]}>
				<extrudeGeometry args={geometria} />
				<meshPhysicalMaterial {...VAN_PINTURA} />
			</mesh>
			<mesh position={[0.61, 0.847, 0]} rotation={[0, 0, 0.6435]}>
				<boxGeometry args={[0.015, 0.4, 0.74]} />
				<meshStandardMaterial {...VIDRO} />
			</mesh>
			{/* Janelas das portas da cabine (borda dianteira acompanha o A-pilar) */}
			{[1, -1].map((lado) => (
				<mesh
					key={lado}
					position={[
						0,
						0,
						lado === 1 ? VAN_LARGURA / 2 - 0.005 : -VAN_LARGURA / 2 - 0.007,
					]}
				>
					<extrudeGeometry args={janela} />
					<meshStandardMaterial {...VIDRO} />
				</mesh>
			))}
			{/* Faróis varrendo as quinas do capô */}
			{[1, -1].map((lado) => (
				<mesh key={lado} position={[1.02, 0.49, lado * 0.34]}>
					<boxGeometry args={[0.1, 0.06, 0.16]} />
					<meshStandardMaterial
						color="#fff3d6"
						emissive="#fff3d6"
						emissiveIntensity={0.6}
					/>
				</mesh>
			))}
			{/* Grade grafite no nariz */}
			<mesh position={[1.078, 0.375, 0]}>
				<boxGeometry args={[0.02, 0.09, 0.6]} />
				<meshStandardMaterial color={VAN_GRAFITE} roughness={0.55} />
			</mesh>
			{/* Para-choque dianteiro grafite envolvente */}
			<mesh castShadow position={[1.06, 0.22, 0]}>
				<boxGeometry args={[0.07, 0.16, VAN_LARGURA + 0.02]} />
				<meshStandardMaterial color={VAN_GRAFITE} roughness={0.55} />
			</mesh>
			{/* Placa */}
			<mesh position={[1.098, 0.22, 0]}>
				<boxGeometry args={[0.012, 0.05, 0.16]} />
				<meshStandardMaterial color="#f2f5f7" roughness={0.4} />
			</mesh>
			{/* Retrovisores pretos */}
			{[1, -1].map((lado) => (
				<group
					key={lado}
					position={[0.68, 0.84, (lado * (VAN_LARGURA + 0.16)) / 2]}
				>
					<mesh>
						<boxGeometry args={[0.02, 0.02, 0.14]} />
						<meshStandardMaterial color="#1a232b" roughness={0.5} />
					</mesh>
					<mesh position={[0, 0.02, (lado * 0.1) / 2]}>
						<boxGeometry args={[0.025, 0.12, 0.06]} />
						<meshStandardMaterial color="#1a232b" roughness={0.4} />
					</mesh>
				</group>
			))}
		</group>
	);
}

/**
 * Folha da porta traseira: pivô na dobradiça vertical (borda externa da
 * abertura, z=±0.40). `rotation.y` 0 = fechada; a folha de dobradiça +z abre
 * com ângulo positivo e a de -z com negativo (as duas giram para fora).
 */
function PortaTraseira({ lado, ref }: { lado: 1 | -1; ref?: Ref<Group> }) {
	const painel = useMemo(
		() => makePortaVanTexture(lado === 1 ? "logo" : "aviso"),
		[lado]
	);
	return (
		<group
			position={[
				VAN_TRAS_X - 0.005,
				(ABERTURA_Y0 + ABERTURA_Y1) / 2,
				lado * (ABERTURA_MEIA_LARGURA + 0.02),
			]}
			ref={ref}
		>
			<mesh castShadow position={[0, 0, -lado * 0.2]}>
				<boxGeometry args={[0.025, ABERTURA_Y1 - ABERTURA_Y0, 0.4]} />
				<meshStandardMaterial map={painel} roughness={0.45} />
			</mesh>
		</group>
	);
}

export interface CaminhaoParts {
	/** Grupo raiz do corpo (balanço/suspensão). */
	body: Group;
	/** Ponto-alvo dentro do vão de carga onde a caixa deve terminar (posição local do grupo raiz). */
	cargoTarget: Vector3;
	/** Portas traseiras [dobradiça em +z, dobradiça em -z]; `rotation.y` 0 =
	 * fechadas, a folha +z abre com ângulo positivo e a -z com negativo. */
	doors: [Group, Group];
	/** Rodas para girar (`rotation.z` contínuo — eixo lateral, rolagem física). */
	wheels: Group[];
}

const WHEEL_POSITIONS: [number, number][] = [
	[RODA_FRENTE_X, WHEEL_Z],
	[RODA_FRENTE_X, -WHEEL_Z],
	[RODA_TRAS_X, WHEEL_Z],
	[RODA_TRAS_X, -WHEEL_Z],
];

/**
 * A van de entrega do Mercado Livre, com partes animáveis expostas via
 * `onParts` (chamado uma vez após o mount). O componente não anima nada
 * sozinho.
 */
export function CaminhaoEntrega({
	onParts,
}: {
	onParts?: (parts: CaminhaoParts) => void;
}) {
	const body = useRef<Group>(null);
	const doorZ = useRef<Group>(null);
	const doorMenosZ = useRef<Group>(null);
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
		if (
			body.current &&
			doorZ.current &&
			doorMenosZ.current &&
			wheels.length > 0
		) {
			onParts?.({
				body: body.current,
				cargoTarget: CARGO_TARGET,
				doors: [doorZ.current, doorMenosZ.current],
				wheels,
			});
		}
	}, [onParts]);

	return (
		<group ref={body}>
			<CorpoVan />
			<CabineVan />
			<PortaTraseira lado={1} ref={doorZ} />
			<PortaTraseira lado={-1} ref={doorMenosZ} />
			{WHEEL_POSITIONS.map(([x, z], index) => (
				<Roda key={`${x}:${z}`} ref={wheelSetters[index]} x={x} z={z} />
			))}
			<ArcoRoda x={RODA_FRENTE_X} z={0.468} />
			<ArcoRoda x={RODA_FRENTE_X} z={-0.468} />
			<ArcoRoda x={RODA_TRAS_X} z={0.468} />
			<ArcoRoda x={RODA_TRAS_X} z={-0.468} />
		</group>
	);
}
