"use client";

// biome-ignore-start lint: diretiva do React Compiler
"use no memo";
// biome-ignore-end lint: diretiva do React Compiler

import { ContactShadows, Float } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useMemo, useRef } from "react";
import {
	type Group,
	MathUtils,
	type MeshPhysicalMaterial,
	Vector3,
} from "three";

import { CardboardBox } from "./cardboard-box";
import { journeyProgress } from "./journey-progress";
import { SoapBubble, StudioRig, smoothstep } from "./scene-bits";
import { Caminhao, Frasco, Selo } from "./station-models";
import { useJourneyActive } from "./use-journey-active";

export const JOURNEY_ANCHORS = [
	"hero",
	"modelo",
	"qualidade",
	"malha",
	"doca",
] as const;

const FOCUS_LINE = 0.52;
const FOLLOW_SPEED = 5;
const DROPLET_COUNT = 16;
const POP_SCROLL_FRACTION = 0.45;
const BUBBLE_BASE_OPACITY = 0.55;
const VIEW_MARGIN = 240;

interface AnchorSample {
	onScreen: boolean;
	scale: number;
	screenY: number;
	world: Vector3;
}

function sampleElement(
	el: Element,
	sizeWidth: number,
	sizeHeight: number,
	worldWidth: number,
	worldHeight: number
): AnchorSample {
	const rect = el.getBoundingClientRect();
	const cx = rect.left + rect.width / 2;
	const cy = rect.top + rect.height / 2;
	const worldPerPixel = worldHeight / sizeHeight;
	return {
		onScreen: rect.bottom > -VIEW_MARGIN && rect.top < sizeHeight + VIEW_MARGIN,
		scale: rect.height * worldPerPixel,
		screenY: cy,
		world: new Vector3(
			(cx / sizeWidth - 0.5) * worldWidth,
			-(cy / sizeHeight - 0.5) * worldHeight,
			0
		),
	};
}

/** Resolve um elemento âncora preguiçosamente (o DOM monta depois da cena). */
function useAnchor(selector: string) {
	const elRef = useRef<Element | null>(null);
	return () => {
		if (!elRef.current) {
			elRef.current = document.querySelector(selector);
		}
		return elRef.current;
	};
}

/**
 * Grupo 3D preso a um elemento do DOM: posição, escala e visibilidade vêm
 * do retângulo do elemento a cada frame. `unitHeight` diz quantas unidades
 * de cena correspondem à altura do elemento.
 */
function AnchoredGroup({
	children,
	selector,
	unitHeight,
}: {
	children: React.ReactNode;
	selector: string;
	unitHeight: number;
}) {
	const group = useRef<Group>(null);
	const getEl = useAnchor(selector);
	const { size, viewport } = useThree();

	useFrame(() => {
		const el = getEl();
		if (!(el && group.current)) {
			return;
		}
		const sample = sampleElement(
			el,
			size.width,
			size.height,
			viewport.width,
			viewport.height
		);
		group.current.visible = sample.onScreen;
		if (sample.onScreen) {
			group.current.position.copy(sample.world);
			group.current.scale.setScalar(sample.scale / unitHeight);
		}
	});

	return (
		<group ref={group} visible={false}>
			{children}
		</group>
	);
}

interface Droplet {
	direction: [number, number, number];
	id: number;
	size: number;
}

function makeDroplets(): Droplet[] {
	const droplets: Droplet[] = [];
	for (let i = 0; i < DROPLET_COUNT; i += 1) {
		const phi = (i / DROPLET_COUNT) * Math.PI * 2;
		const tilt = Math.sin(i * 12.9898) * 0.9;
		droplets.push({
			direction: [Math.cos(phi), Math.sin(phi) * 0.8 + tilt * 0.3, tilt * 0.5],
			id: i,
			size: 0.06 + 0.07 * Math.abs(Math.sin(i * 78.233)),
		});
	}
	return droplets;
}

/** Progresso da explosão: 0 = bolha inteira, 1 = estourada (reversível). */
function popProgress(): number {
	return Math.min(
		window.scrollY / (window.innerHeight * POP_SCROLL_FRACTION),
		1
	);
}

/**
 * O aglomerado do hero: bolhas de sabão com a caixa dentro da maior. Com a
 * jornada ativa, a bolha estoura no primeiro scroll; sem ela, a caixa mora
 * aqui parada.
 */
function HeroCluster({ journeyActive }: { journeyActive: boolean }) {
	const group = useRef<Group>(null);
	const mainBubble = useRef<Group>(null);
	const dropletsGroup = useRef<Group>(null);
	const bubbleMaterials = useRef<MeshPhysicalMaterial[]>([]);
	const droplets = useMemo(makeDroplets, []);

	const registerMaterial = useCallback(
		(material: MeshPhysicalMaterial | null) => {
			if (material && !bubbleMaterials.current.includes(material)) {
				bubbleMaterials.current.push(material);
			}
		},
		[]
	);

	useFrame((state, delta) => {
		const p = journeyActive ? popProgress() : 0;
		const mainOpacity = 1 - smoothstep(0.55, 0.85, p);

		for (const material of bubbleMaterials.current) {
			material.opacity = BUBBLE_BASE_OPACITY * mainOpacity;
		}

		if (group.current) {
			group.current.visible = mainOpacity > 0.01;
			const targetX = state.pointer.y * 0.12;
			const targetY = state.pointer.x * 0.2;
			group.current.rotation.x +=
				(targetX - group.current.rotation.x) * Math.min(delta * 4, 1);
			group.current.rotation.y +=
				(targetY - group.current.rotation.y) * Math.min(delta * 4, 1);
		}

		if (mainBubble.current) {
			const swell = 1 + 0.4 * smoothstep(0, 0.8, p);
			mainBubble.current.scale.setScalar(swell);
		}

		if (dropletsGroup.current) {
			const burst = smoothstep(0.55, 1, p);
			dropletsGroup.current.visible = burst > 0 && burst < 1;
			let i = 0;
			for (const child of dropletsGroup.current.children) {
				const { direction, size } = droplets[i] ?? {
					direction: [0, 1, 0] as [number, number, number],
					id: -1,
					size: 0.05,
				};
				const reach = 1.2 + burst * 2.6;
				child.position.set(
					direction[0] * reach,
					direction[1] * reach - burst * 0.8,
					direction[2] * reach
				);
				child.scale.setScalar(Math.max(size * (1 - burst * 0.85), 0.001));
				i += 1;
			}
		}
	});

	return (
		<>
			<group ref={group}>
				<group position={[0, 0.1, 0]} ref={mainBubble}>
					<SoapBubble materialRef={registerMaterial} radius={1.85} />
				</group>
				<Float floatIntensity={0.6} rotationIntensity={0.3} speed={1.4}>
					<group position={[-2.4, 1.3, -0.6]}>
						<SoapBubble materialRef={registerMaterial} radius={0.5} />
					</group>
				</Float>
				<Float floatIntensity={0.8} rotationIntensity={0.2} speed={1.1}>
					<group position={[2.2, -1.4, -0.4]}>
						<SoapBubble materialRef={registerMaterial} radius={0.34} />
					</group>
				</Float>
				<Float floatIntensity={0.5} rotationIntensity={0.4} speed={1.8}>
					<group position={[-1.9, -1.1, 0.3]}>
						<SoapBubble materialRef={registerMaterial} radius={0.22} />
					</group>
				</Float>
			</group>
			{journeyActive ? null : (
				<Float floatIntensity={0.7} rotationIntensity={0.5} speed={1.6}>
					<group position={[0, 0.1, 0]} rotation={[0.35, -0.6, 0.08]}>
						<CardboardBox size={1.15} />
					</group>
				</Float>
			)}
			<group ref={dropletsGroup} visible={false}>
				{droplets.map((droplet) => (
					<mesh key={droplet.id}>
						<sphereGeometry args={[1, 16, 16]} />
						<meshPhysicalMaterial
							color="#cdeef9"
							opacity={0.5}
							roughness={0.1}
							transparent
						/>
					</mesh>
				))}
			</group>
		</>
	);
}

function collectSamples(
	anchors: (Element | null)[],
	sizeWidth: number,
	sizeHeight: number,
	worldWidth: number,
	worldHeight: number
): AnchorSample[] {
	const samples: AnchorSample[] = [];
	for (const el of anchors) {
		if (el) {
			samples.push(
				sampleElement(el, sizeWidth, sizeHeight, worldWidth, worldHeight)
			);
		}
	}
	return samples;
}

/**
 * Resolve para onde a caixa deve ir: o marco atual, o próximo, ou um ponto
 * da travessia entre os dois (com dwell nas pontas e um arco lateral).
 * Escreve a posição em `out` e devolve a escala-alvo.
 */
interface TargetResult {
	progress: number;
	scale: number;
}

function segmentWeights(samples: AnchorSample[]): number[] {
	const weights: number[] = [];
	for (let i = 0; i < samples.length - 1; i += 1) {
		const a = samples[i] as AnchorSample;
		const b = samples[i + 1] as AnchorSample;
		weights.push(Math.max(Math.abs(b.screenY - a.screenY), 1));
	}
	return weights;
}

function journeyFraction(
	weights: number[],
	segment: number,
	t: number
): number {
	const total = weights.reduce((sum, w) => sum + w, 0);
	let before = 0;
	for (let i = 0; i < segment; i += 1) {
		before += weights[i] ?? 0;
	}
	return (before + t * (weights[segment] ?? 0)) / total;
}

function resolveTarget(
	samples: AnchorSample[],
	focusY: number,
	out: Vector3
): TargetResult {
	const first = samples[0] as AnchorSample;
	const last = samples.at(-1) as AnchorSample;
	const weights = segmentWeights(samples);
	out.copy(first.world);
	if (focusY >= last.screenY) {
		out.copy(last.world);
		return { progress: 1, scale: last.scale };
	}
	if (focusY < first.screenY) {
		return { progress: 0, scale: first.scale };
	}
	for (let i = 0; i < samples.length - 1; i += 1) {
		const a = samples[i] as AnchorSample;
		const b = samples[i + 1] as AnchorSample;
		if (focusY >= a.screenY && focusY < b.screenY) {
			const raw = (focusY - a.screenY) / (b.screenY - a.screenY);
			const t = smoothstep(0.12, 0.88, raw);
			out.lerpVectors(a.world, b.world, t);
			// Leve arco lateral para a travessia não ser reta
			out.x += Math.sin(t * Math.PI) * (i % 2 === 0 ? -0.75 : 0.75);
			return {
				progress: journeyFraction(weights, i, t),
				scale: a.scale + (b.scale - a.scale) * t,
			};
		}
	}
	return { progress: 1, scale: last.scale };
}

/**
 * A caixa viajante: nasce na bolha do hero, desce a página parando ao lado
 * de cada seção e pousa na doca final.
 */
function TravelingBox() {
	const group = useRef<Group>(null);
	const { size, viewport } = useThree();
	const anchorsRef = useRef<(Element | null)[] | null>(null);
	const target = useRef(new Vector3());
	const base = useRef(new Vector3());
	const settled = useRef(false);

	useFrame((state, delta) => {
		if (!group.current) {
			return;
		}
		if (!anchorsRef.current || anchorsRef.current.includes(null)) {
			anchorsRef.current = JOURNEY_ANCHORS.map((id) =>
				document.querySelector(`[data-j-anchor="${id}"]`)
			);
		}
		const samples = collectSamples(
			anchorsRef.current,
			size.width,
			size.height,
			viewport.width,
			viewport.height
		);
		if (samples.length < 2) {
			group.current.visible = false;
			return;
		}
		group.current.visible = true;

		const focusY = size.height * FOCUS_LINE;
		const result = resolveTarget(samples, focusY, target.current);
		const targetScale = result.scale * 0.85;
		journeyProgress.set(result.progress);

		const follow = settled.current ? Math.min(delta * FOLLOW_SPEED, 1) : 1;
		settled.current = true;
		base.current.lerp(target.current, follow);
		group.current.position.copy(base.current);
		// Flutuação como offset puro: nunca acumula deriva
		group.current.position.y += Math.sin(state.clock.elapsedTime * 1.6) * 0.055;

		const speed = base.current.distanceTo(target.current);
		group.current.rotation.y += delta * (0.25 + speed * 1.2);
		group.current.rotation.x = MathUtils.damp(
			group.current.rotation.x,
			0.35 + speed * 0.4,
			3,
			delta
		);
		group.current.scale.setScalar(
			MathUtils.damp(group.current.scale.x || 1, targetScale, 4, delta)
		);
	});

	return (
		<group ref={group} visible={false}>
			<CardboardBox />
		</group>
	);
}

const MICRO_COUNT = 22;

interface MicroBubble {
	id: number;
	r: number;
	speed: number;
	x: number;
	y: number;
	z: number;
}

function makeMicroBubbles(): MicroBubble[] {
	const list: MicroBubble[] = [];
	for (let i = 0; i < MICRO_COUNT; i += 1) {
		// Hash fracionário: mata a correlação entre eixos que formava fileiras
		const hx = (Math.sin(i * 127.1 + 311.7) * 43_758.545) % 1;
		const hy = (Math.sin(i * 269.5 + 183.3) * 28_001.897) % 1;
		const hr = (Math.sin(i * 419.2 + 371.9) * 61_337.221) % 1;
		list.push({
			id: i,
			r: 0.025 + Math.abs(hr) * 0.07,
			speed: 0.08 + Math.abs(hy) * 0.14,
			x: hx,
			y: hy * 1.2,
			z: -1.5 - Math.abs(hr) * 2,
		});
	}
	return list;
}

/**
 * Campo de microbolhas ambiente: sobem devagar pela tela inteira e
 * reaparecem embaixo — a textura de limpeza que tira o branco do vazio.
 */
function MicroBubbles() {
	const group = useRef<Group>(null);
	const bubbles = useMemo(makeMicroBubbles, []);
	const { viewport } = useThree();

	useFrame((_, delta) => {
		if (!group.current) {
			return;
		}
		const halfH = viewport.height / 2 + 0.4;
		const halfW = viewport.width / 2;
		let i = 0;
		for (const child of group.current.children) {
			const data = bubbles[i];
			if (data) {
				child.position.x = data.x * halfW;
				child.position.y += data.speed * delta;
				if (child.position.y > halfH) {
					child.position.y = -halfH;
				}
				child.position.z = data.z;
			}
			i += 1;
		}
	});

	return (
		<group ref={group}>
			{bubbles.map((bubble) => (
				<mesh
					key={bubble.id}
					position={[bubble.x, bubble.y * 3, bubble.z]}
					scale={bubble.r}
				>
					<sphereGeometry args={[1, 12, 12]} />
					<meshPhysicalMaterial
						clearcoat={1}
						color="#cdeef9"
						opacity={0.35}
						roughness={0.1}
						transparent
					/>
				</mesh>
			))}
		</group>
	);
}

const STATION_MODELS = {
	caminhao: Caminhao,
	frasco: Frasco,
	selo: Selo,
} as const;

/** Vinheta de estação: o objeto da seção flutuando dentro de uma bolha. */
function StationVignette({
	variant,
}: {
	variant: keyof typeof STATION_MODELS;
}) {
	const Model = STATION_MODELS[variant];
	return (
		<AnchoredGroup selector={`[data-s-anchor="${variant}"]`} unitHeight={3.5}>
			<Float floatIntensity={0.7} rotationIntensity={0.35} speed={1.4}>
				<SoapBubble radius={1.55} />
				<Model />
			</Float>
		</AnchoredGroup>
	);
}

/**
 * O único canvas 3D da página (um contexto WebGL para tudo): bolhas do
 * hero, caixa viajante e vinhetas das seções, cada grupo ancorado ao
 * elemento do DOM que marca seu lugar.
 */
export function Scene3D() {
	const journeyActive = useJourneyActive();

	return (
		<div aria-hidden className="pointer-events-none fixed inset-0 z-10">
			<Canvas
				camera={{ fov: 35, position: [0, 0, 8] }}
				dpr={[1, 1.5]}
				gl={{ alpha: true, antialias: true }}
			>
				<StudioRig />
				<MicroBubbles />
				<AnchoredGroup selector='[data-s-anchor="hero-cluster"]' unitHeight={5}>
					<HeroCluster journeyActive={journeyActive} />
					<ContactShadows
						blur={2.8}
						color="#0f1c2b"
						far={4}
						opacity={0.22}
						position={[0, -2.3, 0]}
						scale={9}
					/>
				</AnchoredGroup>
				{journeyActive ? <TravelingBox /> : null}
				<StationVignette variant="frasco" />
				<StationVignette variant="selo" />
				<StationVignette variant="caminhao" />
			</Canvas>
		</div>
	);
}
