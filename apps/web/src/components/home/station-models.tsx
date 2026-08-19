"use client";

// biome-ignore-start lint: diretiva do React Compiler
"use no memo";
// biome-ignore-end lint: diretiva do React Compiler

import { useMemo } from "react";
import { CanvasTexture, SRGBColorSpace, type Texture } from "three";

const LABEL_W = 256;
const LABEL_H = 192;

/** Rótulo impresso do frasco: fundo aqua, marca e linhas greeked. */
function makeFrascoLabel(): Texture {
	const canvas = document.createElement("canvas");
	canvas.width = LABEL_W;
	canvas.height = LABEL_H;
	const ctx = canvas.getContext("2d");
	if (ctx) {
		ctx.fillStyle = "#dcf3fa";
		ctx.fillRect(0, 0, LABEL_W, LABEL_H);
		ctx.strokeStyle = "#1d9dd8";
		ctx.lineWidth = 6;
		ctx.strokeRect(8, 8, LABEL_W - 16, LABEL_H - 16);
		// gota da marca
		ctx.fillStyle = "#1d9dd8";
		ctx.beginPath();
		ctx.arc(LABEL_W / 2, 62, 26, 0, Math.PI * 2);
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(LABEL_W / 2 - 18, 52);
		ctx.lineTo(LABEL_W / 2, 16);
		ctx.lineTo(LABEL_W / 2 + 18, 52);
		ctx.closePath();
		ctx.fill();
		// linhas de texto greeked
		ctx.fillStyle = "#0f1c2b";
		ctx.fillRect(48, 110, LABEL_W - 96, 14);
		ctx.fillStyle = "#5c7a8a";
		ctx.fillRect(64, 138, LABEL_W - 128, 9);
		ctx.fillRect(74, 156, LABEL_W - 148, 9);
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	return texture;
}

/** Lateral do baú do caminhão: branco com faixa e marca CBS. */
function makeBauSide(): Texture {
	const canvas = document.createElement("canvas");
	canvas.width = 256;
	canvas.height = 160;
	const ctx = canvas.getContext("2d");
	if (ctx) {
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, 256, 160);
		ctx.fillStyle = "#1d9dd8";
		ctx.fillRect(0, 118, 256, 22);
		ctx.fillStyle = "#0f1c2b";
		ctx.font = 'bold 44px Sora, "Sora Fallback", sans-serif';
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("CBS", 128, 62);
		ctx.fillStyle = "#a8e0f0";
		ctx.fillRect(58, 92, 140, 8);
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	return texture;
}

const WHEEL_POSITIONS: [number, number][] = [
	[-0.62, 0.34],
	[-0.62, -0.34],
	[0.45, 0.34],
	[0.45, -0.34],
];

/** Frasco branco de saneante: tampa azul, rótulo impresso curvo. */
export function Frasco() {
	const label = useMemo(makeFrascoLabel, []);
	return (
		<group position={[0, -0.25, 0]}>
			<mesh>
				<cylinderGeometry args={[0.42, 0.48, 1.1, 40]} />
				<meshPhysicalMaterial
					clearcoat={0.6}
					clearcoatRoughness={0.25}
					color="#ffffff"
					roughness={0.3}
				/>
			</mesh>
			<mesh position={[0, 0.62, 0]}>
				<sphereGeometry args={[0.42, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
				<meshPhysicalMaterial
					clearcoat={0.6}
					clearcoatRoughness={0.25}
					color="#ffffff"
					roughness={0.3}
				/>
			</mesh>
			<mesh position={[0, 0.98, 0]}>
				<cylinderGeometry args={[0.16, 0.16, 0.28, 24]} />
				<meshPhysicalMaterial color="#ffffff" roughness={0.3} />
			</mesh>
			<mesh position={[0, 1.16, 0]}>
				<cylinderGeometry args={[0.21, 0.21, 0.2, 28]} />
				<meshPhysicalMaterial
					clearcoat={0.5}
					color="#1d9dd8"
					roughness={0.35}
				/>
			</mesh>
			<mesh position={[0, 1.245, 0]}>
				<torusGeometry args={[0.21, 0.018, 12, 28]} />
				<meshStandardMaterial color="#1479ad" roughness={0.4} />
			</mesh>
			{/* Rótulo curvo abraçando o corpo */}
			<mesh position={[0, 0.02, 0]} rotation={[0, -0.95, 0]}>
				<cylinderGeometry args={[0.455, 0.455, 0.72, 40, 1, true, 0, 1.9]} />
				<meshStandardMaterial map={label} roughness={0.45} />
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

/** Caminhão de entrega: baú branco com a marca, cabine azul envernizada. */
export function Caminhao() {
	const side = useMemo(makeBauSide, []);
	return (
		<group position={[0.05, -0.28, 0]} rotation={[0.16, -0.6, 0]}>
			{/* Baú com a marca nas laterais */}
			<mesh position={[0.32, 0.44, 0]}>
				<boxGeometry args={[1.18, 0.78, 0.8]} />
				<meshPhysicalMaterial
					clearcoat={0.4}
					clearcoatRoughness={0.3}
					color="#ffffff"
					map={side}
					roughness={0.35}
				/>
			</mesh>
			{/* Chassi */}
			<mesh position={[-0.05, 0.02, 0]}>
				<boxGeometry args={[1.7, 0.1, 0.6]} />
				<meshStandardMaterial color="#233242" roughness={0.6} />
			</mesh>
			{/* Cabine */}
			<mesh position={[-0.64, 0.3, 0]}>
				<boxGeometry args={[0.56, 0.54, 0.74]} />
				<meshPhysicalMaterial
					clearcoat={0.8}
					clearcoatRoughness={0.15}
					color="#1d9dd8"
					roughness={0.3}
				/>
			</mesh>
			{/* Para-brisa */}
			<mesh position={[-0.83, 0.42, 0]} rotation={[0, 0, -0.18]}>
				<boxGeometry args={[0.06, 0.3, 0.62]} />
				<meshPhysicalMaterial
					clearcoat={1}
					clearcoatRoughness={0.05}
					color="#0f1c2b"
					metalness={0.3}
					roughness={0.15}
				/>
			</mesh>
			{/* Farol */}
			<mesh position={[-0.93, 0.14, 0.22]}>
				<cylinderGeometry args={[0.05, 0.05, 0.03, 16]} />
				<meshStandardMaterial
					color="#fff6d8"
					emissive="#ffedb0"
					emissiveIntensity={0.6}
					roughness={0.2}
				/>
			</mesh>
			{WHEEL_POSITIONS.map(([x, z]) => (
				<group key={`${x}:${z}`} position={[x, -0.06, z]}>
					<mesh rotation={[Math.PI / 2, 0, 0]}>
						<cylinderGeometry args={[0.17, 0.17, 0.13, 28]} />
						<meshStandardMaterial color="#182430" roughness={0.7} />
					</mesh>
					<mesh
						position={[0, 0, z > 0 ? 0.068 : -0.068]}
						rotation={[Math.PI / 2, 0, 0]}
					>
						<cylinderGeometry args={[0.08, 0.08, 0.015, 20]} />
						<meshStandardMaterial
							color="#c8d6e0"
							metalness={0.5}
							roughness={0.3}
						/>
					</mesh>
				</group>
			))}
		</group>
	);
}
