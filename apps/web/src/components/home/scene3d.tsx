"use client";

// biome-ignore-start lint: diretiva do React Compiler
"use no memo";
// biome-ignore-end lint: diretiva do React Compiler

import { ContactShadows, Float } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { damp, damp3, dampAngle } from "maath/easing";
import { useCallback, useMemo, useRef } from "react";
import { type Group, MathUtils, Vector3 } from "three";

import { boxActive, boxWorldPosition } from "./box-position";
import { CardboardBox } from "./cardboard-box";
import { dockCargoWorld, dockReady } from "./dock-state";
import { journeyProgress } from "./journey-progress";
import {
	BUBBLE_BASE_OPACITY,
	type BubbleMaterial,
	SoapBubble,
	StudioRig,
	smoothstep,
} from "./scene-bits";
import {
	CAMINHAO_ALTURA,
	Caminhao,
	CaminhaoEntrega,
	type CaminhaoParts,
	Frasco,
	Selo,
} from "./station-models";
import { useJourneyActive } from "./use-journey-active";

export const JOURNEY_ANCHORS = [
	"hero",
	"modelo",
	"qualidade",
	"malha",
	"chegada",
	"doca",
] as const;

const FOCUS_LINE = 0.52;
const CAMERA_Z = 8;
const DROPLET_COUNT = 16;
const POP_SCROLL_FRACTION = 0.45;
const VIEW_MARGIN = 240;

// Estouro com antecipação: a bolha aperta bem antes de sumir, e some rápido
// (exit mais curto que o entrance) — ver comentário em popProgress/HeroCluster.
const ANTICIPATION_START = 0.35;
const ANTICIPATION_END = 0.55;
const POP_START = 0.55;
const POP_END = 0.62;
const SQUEEZE_PEAK = 0.12;

// Física da caixa viajante (maath/easing): tempos de suavização e limites do banking.
const BOX_POSITION_SMOOTH_TIME = 0.25;
const BOX_ANGLE_SMOOTH_TIME = 0.3;
const BOX_YAW_LIMIT = 0.6;
const BOX_ROLL_FACTOR = 8;
const BOX_ROLL_LIMIT = 0.35;
// Arco da travessia: ganho sobre o x médio do trecho e amplitude máxima.
const ARC_OUTWARD_GAIN = 0.35;
const ARC_MAX = 0.75;

// Coreografia final "caixa entra no caminhão", inteira dirigida por
// journeyProgress (0-1) — cada fase é uma função pura de `p`, nunca um
// estado one-shot, para o scroll pra cima desfazer tudo automaticamente.
// As faixas encostam de propósito (a porta fica aberta durante o handoff,
// fecha exatamente quando o assentamento começa).
const DOCK_TRUCK_ENTER_START = 0.86;
const DOCK_TRUCK_ENTER_END = 0.92;
const DOCK_DOOR_OPEN_START = 0.9;
const DOCK_DOOR_OPEN_END = 0.94;
const DOCK_HANDOFF_START = 0.94;
const DOCK_HANDOFF_END = 0.985;
const DOCK_SETTLE_START = 0.985;
const DOCK_SETTLE_END = 1;

// Posição local de partida. O grupo da doca é girado 180° em Y (frente do
// caminhão para a esquerda), então x local negativo = fora da tela à direita.
const DOCK_TRUCK_ENTRY_X = -4;
const DOCK_DOOR_OPEN_ANGLE = 1.6;
// Mesmo raio de RODA_RAIO em station-models.tsx (não exportado — só usado
// aqui para converter deslocamento linear em giro angular da roda).
const DOCK_WHEEL_RADIUS = 0.16;
const DOCK_DRIVE_BOUNCE_AMPLITUDE = 0.035;
const DOCK_IDLE_BOUNCE_AMPLITUDE = 0; // parado no asfalto: sem flutuar
const DOCK_BOUNCE_FREQUENCY = 7;
const DOCK_SETTLE_SQUASH_PEAK = 0.1;
const DOCK_HEADLIGHT_FLASH_PEAK = 0.4; // emissiveIntensity 0.6 → 1 → 0.6
const DOCK_HEADLIGHT_HEX = "fff3d6"; // cor dos faróis em FrenteCaminhao

// Handoff da caixa: o quanto ela desvia do pouso na âncora "doca" para
// dentro do baú (dockCargoWorld), com um arco por cima e encolhendo ao
// cruzar a porta.
const DOCK_CARGO_SHRINK = 0.55;
const DOCK_ARC_HEIGHT = 0.4;

// Reação das bolhas de estação à passagem da caixa: tudo lido de
// boxWorldPosition/boxActive (canal fora do React), nunca de props — a caixa
// e as vinhetas não se conhecem.
// Fase 1 — squash por proximidade (barato, sempre ligado).
const STATION_PROXIMITY_RADIUS = 2.2; // × escala local da bolha
const STATION_SQUASH_AMPLITUDE = 0.08;
const STATION_SQUASH_SMOOTH_TIME = 0.35;
// Fase 2 — wobble real via MeshDistortMaterial.
const STATION_DISTORT_REST = 0.08;
const STATION_DISTORT_PEAK = 0.35;
const STATION_DISTORT_SMOOTH_TIME = 0.25;
// Fase 3 — mini-burst de gotículas por passagem (limiares em histerese: entra
// mais perto do que rearma, para não vibrar na borda).
const STATION_DROPLET_COUNT = 7;
const STATION_DROPLET_SIZE_SCALE = 0.4;
const STATION_DROPLET_ENTER_DISTANCE = 1.6; // × escala local
const STATION_DROPLET_REARM_DISTANCE = 3; // × escala local
const STATION_DROPLET_DURATION = 0.6; // segundos
const STATION_DROPLET_REACH_BASE = 0.5;
const STATION_DROPLET_REACH_SPAN = 1.3;

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
	speed: number;
}

/** Gera um anel de gotículas divergentes (direção + tamanho + velocidade
 * próprios) para o burst da explosão. `sizeScale` encolhe o padrão inteiro
 * para o mini-burst das estações, sem duplicar a lógica. */
function makeDroplets(count: number, sizeScale = 1): Droplet[] {
	const droplets: Droplet[] = [];
	for (let i = 0; i < count; i += 1) {
		const phi = (i / count) * Math.PI * 2;
		const tilt = Math.sin(i * 12.9898) * 0.9;
		// Ruído próprio para a velocidade: gotículas não chegam todas juntas
		const speedNoise = Math.abs(Math.sin(i * 91.345));
		droplets.push({
			direction: [Math.cos(phi), Math.sin(phi) * 0.8 + tilt * 0.3, tilt * 0.5],
			id: i,
			size: (0.06 + 0.07 * Math.abs(Math.sin(i * 78.233))) * sizeScale,
			speed: 0.7 + speedNoise * 0.8,
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
 * O aglomerado do hero: bolhas de sabão. Com a jornada ativa, a bolha
 * principal aperta nos ~20% de scroll antes do estouro e dissolve rápido; a
 * caixa que mora dentro dela é responsabilidade da `JourneyBox` (uma caixa
 * só na cena inteira).
 */
function HeroCluster({ journeyActive }: { journeyActive: boolean }) {
	const group = useRef<Group>(null);
	const mainBubble = useRef<Group>(null);
	const dropletsGroup = useRef<Group>(null);
	const mainMaterial = useRef<BubbleMaterial | null>(null);
	const satelliteMaterials = useRef<BubbleMaterial[]>([]);
	const droplets = useMemo(() => makeDroplets(DROPLET_COUNT), []);

	const registerMain = useCallback((material: BubbleMaterial | null) => {
		mainMaterial.current = material;
	}, []);

	const registerSatellite = useCallback((material: BubbleMaterial | null) => {
		if (material && !satelliteMaterials.current.includes(material)) {
			satelliteMaterials.current.push(material);
		}
	}, []);

	useFrame((state, delta) => {
		const p = journeyActive ? popProgress() : 0;
		const anticipation = smoothstep(ANTICIPATION_START, ANTICIPATION_END, p);
		const popT = smoothstep(POP_START, POP_END, p);
		const mainOpacity = 1 - popT;

		if (mainMaterial.current) {
			mainMaterial.current.opacity = BUBBLE_BASE_OPACITY * mainOpacity;
			// Distorção/iridescência intensificam junto com o aperto da bolha
			// (propriedades exclusivas do MeshTransmissionMaterial "high").
			const highMaterial = mainMaterial.current as unknown as {
				chromaticAberration: number;
				distortion: number;
				iridescenceIOR: number;
			};
			if (typeof highMaterial.distortion === "number") {
				highMaterial.distortion = 0.06 + anticipation * 0.35;
				highMaterial.chromaticAberration = 0.06 + anticipation * 0.14;
				highMaterial.iridescenceIOR = 1.27 + anticipation * 0.18;
			}
		}
		for (const material of satelliteMaterials.current) {
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
			// Aperto não-uniforme: cresce mais em Y do que em X/Z (squash), com
			// um flash sutil de escala bem no instante do estouro.
			const flash =
				smoothstep(POP_START, POP_START + 0.02, p) *
				(1 - smoothstep(POP_START + 0.02, POP_END, p));
			const swellY = 1 + SQUEEZE_PEAK * anticipation + 0.05 * flash;
			const swellXZ = 1 + SQUEEZE_PEAK * 0.6 * anticipation - 0.03 * flash;
			mainBubble.current.scale.set(swellXZ, swellY, swellXZ);
		}

		if (dropletsGroup.current) {
			const burst = smoothstep(POP_START, 1, p);
			dropletsGroup.current.visible = burst > 0 && burst < 1;
			let i = 0;
			for (const child of dropletsGroup.current.children) {
				const droplet = droplets[i] ?? {
					direction: [0, 1, 0] as [number, number, number],
					id: -1,
					size: 0.05,
					speed: 1,
				};
				// Velocidade própria por gotícula: nem todas chegam juntas
				const localBurst = Math.min(burst * droplet.speed, 1);
				const reach = 1.2 + localBurst * 2.6;
				const dropletFlash =
					smoothstep(0, 0.15, burst) * (1 - smoothstep(0.15, 0.4, burst));
				child.position.set(
					droplet.direction[0] * reach,
					droplet.direction[1] * reach - localBurst * 0.8,
					droplet.direction[2] * reach
				);
				child.scale.setScalar(
					Math.max(
						droplet.size * (1 - localBurst * 0.85) * (1 + dropletFlash * 0.6),
						0.001
					)
				);
				i += 1;
			}
		}
	});

	return (
		<>
			<group ref={group}>
				<group position={[0, 0.1, 0]} ref={mainBubble}>
					<SoapBubble materialRef={registerMain} quality="lite" radius={1.85} />
				</group>
				<Float floatIntensity={0.6} rotationIntensity={0.3} speed={1.4}>
					<group position={[-2.4, 1.3, -0.6]}>
						<SoapBubble materialRef={registerSatellite} radius={0.5} />
					</group>
				</Float>
				<Float floatIntensity={0.8} rotationIntensity={0.2} speed={1.1}>
					<group position={[2.2, -1.4, -0.4]}>
						<SoapBubble materialRef={registerSatellite} radius={0.34} />
					</group>
				</Float>
				<Float floatIntensity={0.5} rotationIntensity={0.4} speed={1.8}>
					<group position={[-1.9, -1.1, 0.3]}>
						<SoapBubble materialRef={registerSatellite} radius={0.22} />
					</group>
				</Float>
			</group>
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

/**
 * Quando a página não tem scroll suficiente para a doca alcançar a linha de
 * foco, a jornada travaria antes de 1. Aqui a linha de foco desce na mesma
 * medida em que o scroll restante some — no fim da página ela coincide com a
 * doca e o progresso fecha em 1. Contínuo e reversível.
 */
function endOfScrollFocus(focusY: number, lastScreenY: number): number {
	const remaining =
		document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
	const gap = lastScreenY - focusY;
	if (gap <= 0 || remaining >= gap) {
		return focusY;
	}
	return focusY + (gap - Math.max(remaining, 0));
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
			// Arco lateral sempre para FORA (lado oposto ao centro da página,
			// onde moram as colunas de texto). Numa travessia de um lado ao
			// outro o ponto médio fica perto do centro e o arco some sozinho.
			const midX = (a.world.x + b.world.x) / 2;
			const bulge = MathUtils.clamp(midX * ARC_OUTWARD_GAIN, -ARC_MAX, ARC_MAX);
			out.x += Math.sin(t * Math.PI) * bulge;
			return {
				progress: journeyFraction(weights, i, t),
				scale: a.scale + (b.scale - a.scale) * t,
			};
		}
	}
	return { progress: 1, scale: last.scale };
}

/**
 * A única caixa da cena. Com a jornada ativa, nasce na bolha do hero (âncora
 * 0) e viaja com física de verdade: damp3 na posição, banking (yaw/roll)
 * derivado da velocidade real quadro a quadro via dampAngle — nunca um
 * easing customizado dentro de damp3 (maath#33 quebra nesse caso). Sem
 * jornada (mobile/reduced-motion), fica parada na mesma âncora do hero,
 * só com um flutuar leve — mesma fonte de posição das duas variantes, para
 * nunca haver uma segunda caixa em outro lugar.
 */
/**
 * Desvia o alvo final da caixa da âncora "doca" para dentro do caminhão
 * (canal `dockCargoWorld`, publicado pela `DocaFinal`): um arco por cima
 * enquanto cruza a porta e encolhe ~20% no processo. Pura função de
 * `progress` (mesmo `journeyProgress` que a `DocaFinal` lê) — reversível de
 * graça, sem estado próprio. `dockReady` evita mirar em (0,0,0) antes do
 * caminhão publicar seu primeiro quadro.
 */
function applyDockHandoff(
	target: Vector3,
	progress: number,
	baseScale: number
): { hidden: boolean; scale: number } {
	if (!dockReady.current) {
		return { hidden: false, scale: baseScale };
	}
	const handoffT = smoothstep(DOCK_HANDOFF_START, DOCK_HANDOFF_END, progress);
	if (handoffT > 0) {
		target.lerp(dockCargoWorld, handoffT);
		target.y += Math.sin(handoffT * Math.PI) * DOCK_ARC_HEIGHT;
	}
	return {
		hidden: progress >= DOCK_SETTLE_START,
		scale: baseScale * (1 - DOCK_CARGO_SHRINK * handoffT),
	};
}

function JourneyBox({ journeyActive }: { journeyActive: boolean }) {
	const group = useRef<Group>(null);
	const { size, viewport } = useThree();
	const anchorsRef = useRef<(Element | null)[] | null>(null);
	const target = useRef(new Vector3());
	const base = useRef(new Vector3());
	const prevBase = useRef(new Vector3());
	const velocity = useRef(new Vector3());
	const yawState = useRef({ value: 0 });
	const rollState = useRef({ value: 0 });
	const scale = useRef(1);
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
			boxActive.current = false;
			return;
		}
		group.current.visible = true;

		if (!journeyActive) {
			// Sem jornada: parada na âncora do hero (a mesma que abre a
			// jornada quando ativa), só com um flutuar senoidal leve.
			const hero = samples[0] as AnchorSample;
			const bob = Math.sin(state.clock.elapsedTime * 1.6) * 0.05;
			group.current.position.set(
				hero.world.x,
				hero.world.y + bob,
				hero.world.z
			);
			group.current.rotation.set(
				0.35 + Math.sin(state.clock.elapsedTime * 0.9) * 0.05,
				-0.6 + Math.cos(state.clock.elapsedTime * 0.7) * 0.08,
				0.08
			);
			group.current.scale.setScalar(hero.scale * 0.85);
			settled.current = false;
			boxWorldPosition.copy(group.current.position);
			boxActive.current = true;
			return;
		}

		const focusY = endOfScrollFocus(
			size.height * FOCUS_LINE,
			(samples.at(-1) as AnchorSample).screenY
		);
		const result = resolveTarget(samples, focusY, target.current);
		journeyProgress.set(result.progress);
		const handoff = applyDockHandoff(
			target.current,
			result.progress,
			result.scale * 0.85
		);
		const targetScale = handoff.scale;

		if (!settled.current) {
			base.current.copy(target.current);
			prevBase.current.copy(target.current);
			settled.current = true;
		}

		damp3(base.current, target.current, BOX_POSITION_SMOOTH_TIME, delta);

		// Velocidade quadro a quadro (não normalizada por tempo, de propósito):
		// é o que alimenta o banking abaixo.
		velocity.current.subVectors(base.current, prevBase.current);
		prevBase.current.copy(base.current);

		group.current.position.copy(base.current);
		// Flutuação como offset puro: nunca acumula deriva
		group.current.position.y += Math.sin(state.clock.elapsedTime * 1.6) * 0.055;

		const targetYaw = MathUtils.clamp(
			Math.atan2(velocity.current.x, velocity.current.z),
			-BOX_YAW_LIMIT,
			BOX_YAW_LIMIT
		);
		const targetRoll = MathUtils.clamp(
			-velocity.current.x * BOX_ROLL_FACTOR,
			-BOX_ROLL_LIMIT,
			BOX_ROLL_LIMIT
		);
		dampAngle(
			yawState.current,
			"value",
			targetYaw,
			BOX_ANGLE_SMOOTH_TIME,
			delta
		);
		dampAngle(
			rollState.current,
			"value",
			targetRoll,
			BOX_ANGLE_SMOOTH_TIME,
			delta
		);
		group.current.rotation.y = yawState.current.value;
		group.current.rotation.z = rollState.current.value;
		group.current.rotation.x = MathUtils.damp(
			group.current.rotation.x,
			0.35,
			3,
			delta
		);

		scale.current = MathUtils.damp(scale.current, targetScale, 4, delta);
		group.current.scale.setScalar(scale.current);

		// Some assim que a entrega termina e a porta começa a fechar por cima
		// dela; reaparece na hora ao reverter o scroll (função pura de `p`).
		group.current.visible = !handoff.hidden;

		boxWorldPosition.copy(group.current.position);
		boxActive.current = true;
	});

	return (
		<group ref={group} visible={false}>
			<CardboardBox />
		</group>
	);
}

const MICRO_COUNT = 34;

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
const MICRO_POP_RADIUS = 1.05;
const MICRO_POP_SPEED = 2.6;
const MICRO_BASE_OPACITY = 0.3;

interface PoppableMesh {
	material: { opacity: number };
	position: { x: number; y: number; z: number };
	scale: { setScalar: (s: number) => void };
}

/**
 * Estouro de uma microbolha na passagem da caixa (distância de tela,
 * ignorando z: elas vivem atrás dela). Devolve o novo progresso do pop —
 * 0 = viva; ao completar, a bolha renasce embaixo.
 */
function updateMicroPop(
	mesh: PoppableMesh,
	data: MicroBubble,
	pop: number,
	delta: number,
	halfH: number
): number {
	if (pop === 0) {
		mesh.scale.setScalar(data.r);
		mesh.material.opacity = MICRO_BASE_OPACITY;
		if (!boxActive.current) {
			return 0;
		}
		// As microbolhas vivem atrás do plano da caixa (z < 0): projeta a
		// posição delas no plano z=0 pela câmera, senão a distância "de tela"
		// compara coordenadas de planos diferentes e a caixa nunca acerta.
		const depth = CAMERA_Z / (CAMERA_Z - mesh.position.z);
		const dx = mesh.position.x * depth - boxWorldPosition.x;
		const dy = mesh.position.y * depth - boxWorldPosition.y;
		return Math.hypot(dx, dy) < MICRO_POP_RADIUS ? Number.EPSILON : 0;
	}
	// Estouro: incha rápido enquanto some, depois renasce embaixo
	const next = Math.min(pop + delta * MICRO_POP_SPEED, 1);
	mesh.scale.setScalar(data.r * (1 + next * 2.2));
	mesh.material.opacity = MICRO_BASE_OPACITY * (1 - next);
	if (next >= 1) {
		mesh.position.y = -halfH;
		return 0;
	}
	return next;
}

function MicroBubbles() {
	const group = useRef<Group>(null);
	const bubbles = useMemo(makeMicroBubbles, []);
	// Progresso do estouro por bolha: 0 = viva, (0,1) = estourando, 1 = renasce
	const pops = useRef<number[]>(new Array(MICRO_COUNT).fill(0));
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
				pops.current[i] = updateMicroPop(
					child as unknown as PoppableMesh,
					data,
					pops.current[i] ?? 0,
					delta,
					halfH
				);
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
					<sphereGeometry args={[1, 16, 16]} />
					{/* Sem transmission: numa esfera desse tamanho ela só devolve o
					    lado sombreado em cinza. O filme é branco emissivo em aqua,
					    com brilho de clearcoat — lê como bolha, não como poeira. */}
					<meshPhysicalMaterial
						clearcoat={1}
						clearcoatRoughness={0.05}
						color="#ffffff"
						depthWrite={false}
						emissive="#dcf3fa"
						emissiveIntensity={0.9}
						opacity={MICRO_BASE_OPACITY}
						roughness={0.12}
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

interface BurstState {
	armed: boolean;
	playing: boolean;
	t0: number;
}

/**
 * Fase 1: squash-and-stretch não-uniforme por proximidade (mesmo padrão de
 * swellY/swellXZ do HeroCluster). Devolve a proximidade suavizada (0 longe,
 * 1 encostada) para a Fase 2 reaproveitar sem recalcular.
 */
function updateStationSquash(
	group: Group,
	dist: number,
	scaleFactor: number,
	proximity: { value: number },
	delta: number
): number {
	const proximityRaw =
		1 - smoothstep(0, STATION_PROXIMITY_RADIUS * scaleFactor, dist);
	damp(proximity, "value", proximityRaw, STATION_SQUASH_SMOOTH_TIME, delta);
	const swell = proximity.value;
	group.scale.set(
		1 + STATION_SQUASH_AMPLITUDE * 0.6 * swell,
		1 + STATION_SQUASH_AMPLITUDE * swell,
		1 + STATION_SQUASH_AMPLITUDE * 0.6 * swell
	);
	return swell;
}

/** Fase 2: wobble real do MeshDistortMaterial acompanha a mesma proximidade. */
function updateStationDistort(
	material: BubbleMaterial | null,
	distortState: { value: number },
	swell: number,
	delta: number
): void {
	const distortTarget = MathUtils.lerp(
		STATION_DISTORT_REST,
		STATION_DISTORT_PEAK,
		swell
	);
	damp(
		distortState,
		"value",
		distortTarget,
		STATION_DISTORT_SMOOTH_TIME,
		delta
	);
	if (!material) {
		return;
	}
	// MeshDistortMaterial estende MeshPhysicalMaterial em tempo de execução
	// (ver comentário do quality "station" em scene-bits.tsx) — cast seguro.
	const distortMaterial = material as unknown as { distort: number };
	if (typeof distortMaterial.distort === "number") {
		distortMaterial.distort = distortState.value;
	}
}

/**
 * Fase 3, arme/rearme: dispara o burst ao cruzar o limiar de entrada vindo
 * de fora; só rearma quando a caixa já se afastou o suficiente (histerese —
 * evita vibrar ligando/desligando bem na borda de um único limiar).
 */
function updateDropletArming(
	burst: BurstState,
	dist: number,
	scaleFactor: number,
	elapsedTime: number
): void {
	if (burst.armed && dist < STATION_DROPLET_ENTER_DISTANCE * scaleFactor) {
		burst.armed = false;
		burst.playing = true;
		burst.t0 = elapsedTime;
		return;
	}
	if (!burst.armed && dist > STATION_DROPLET_REARM_DISTANCE * scaleFactor) {
		burst.armed = true;
	}
}

/** Fase 3, animação: mesmo padrão de espalhar-e-encolher do burst do hero. */
function animateDropletBurst(
	dropletsNode: Group,
	droplets: Droplet[],
	burst: BurstState,
	elapsedTime: number
): void {
	if (!burst.playing) {
		dropletsNode.visible = false;
		return;
	}
	dropletsNode.visible = true;
	const burstT = Math.min(
		(elapsedTime - burst.t0) / STATION_DROPLET_DURATION,
		1
	);
	let i = 0;
	for (const child of dropletsNode.children) {
		const droplet = droplets[i];
		if (droplet) {
			const localBurst = Math.min(burstT * droplet.speed, 1);
			const reach =
				STATION_DROPLET_REACH_BASE + localBurst * STATION_DROPLET_REACH_SPAN;
			const flash =
				smoothstep(0, 0.15, burstT) * (1 - smoothstep(0.15, 0.4, burstT));
			child.position.set(
				droplet.direction[0] * reach,
				droplet.direction[1] * reach - localBurst * 0.3,
				droplet.direction[2] * reach
			);
			child.scale.setScalar(
				Math.max(
					droplet.size * (1 - localBurst * 0.85) * (1 + flash * 0.6),
					0.001
				)
			);
		}
		i += 1;
	}
	if (burstT >= 1) {
		burst.playing = false;
		dropletsNode.visible = false;
	}
}

/**
 * Vinheta de estação: o objeto da seção flutuando dentro de uma bolha que
 * reage à passagem da caixa viajante (lida de boxWorldPosition/boxActive,
 * nunca via props — a caixa não sabe que as vinhetas existem):
 *
 * 1. Squash por proximidade — a bolha "respira fundo" quando a caixa chega
 *    perto (grupo próprio em volta da bolha, escala não-uniforme).
 * 2. Wobble real — MeshDistortMaterial (quality "station") intensifica a
 *    distorção junto com a proximidade.
 * 3. Mini-burst de gotículas — dispara uma vez por passagem, com histerese
 *    entre o limiar de entrada e o de rearme para não vibrar na borda.
 */
function StationVignette({
	variant,
}: {
	variant: keyof typeof STATION_MODELS;
}) {
	const Model = STATION_MODELS[variant];
	const squashGroup = useRef<Group>(null);
	const dropletsGroup = useRef<Group>(null);
	const material = useRef<BubbleMaterial | null>(null);
	const proximity = useRef({ value: 0 });
	const distortState = useRef({ value: STATION_DISTORT_REST });
	const burst = useRef({ armed: true, playing: false, t0: 0 });
	const worldPos = useRef(new Vector3()).current;
	const worldScale = useRef(new Vector3()).current;
	const droplets = useMemo(
		() => makeDroplets(STATION_DROPLET_COUNT, STATION_DROPLET_SIZE_SCALE),
		[]
	);

	const registerMaterial = useCallback((instance: BubbleMaterial | null) => {
		material.current = instance;
	}, []);

	useFrame((state, delta) => {
		const group = squashGroup.current;
		if (!group) {
			return;
		}

		group.getWorldPosition(worldPos);
		// Escala local real (viewport muda o tamanho de todas as vinhetas) —
		// os limiares de distância abaixo escalam junto.
		const scaleFactor = group.getWorldScale(worldScale).x || 1;
		const dist = boxActive.current
			? boxWorldPosition.distanceTo(worldPos)
			: Number.POSITIVE_INFINITY;
		const { elapsedTime } = state.clock;

		const swell = updateStationSquash(
			group,
			dist,
			scaleFactor,
			proximity.current,
			delta
		);
		updateStationDistort(material.current, distortState.current, swell, delta);

		updateDropletArming(burst.current, dist, scaleFactor, elapsedTime);
		const dropletsNode = dropletsGroup.current;
		if (dropletsNode) {
			animateDropletBurst(dropletsNode, droplets, burst.current, elapsedTime);
		}
	});

	return (
		<AnchoredGroup selector={`[data-s-anchor="${variant}"]`} unitHeight={3.5}>
			<Float floatIntensity={0.7} rotationIntensity={0.35} speed={1.4}>
				<group ref={squashGroup}>
					<SoapBubble
						materialRef={registerMaterial}
						quality="station"
						radius={1.55}
					/>
				</group>
				<Model />
				<group ref={dropletsGroup} visible={false}>
					{droplets.map((droplet) => (
						<mesh key={droplet.id}>
							<sphereGeometry args={[1, 12, 12]} />
							<meshPhysicalMaterial
								color="#cdeef9"
								opacity={0.5}
								roughness={0.1}
								transparent
							/>
						</mesh>
					))}
				</group>
			</Float>
		</AnchoredGroup>
	);
}

/** Posição local (X) do corpo do caminhão: entra dirigindo da direita e para em 0. */
function computeDockBodyX(p: number): number {
	const driveT = smoothstep(DOCK_TRUCK_ENTER_START, DOCK_TRUCK_ENTER_END, p);
	return MathUtils.lerp(DOCK_TRUCK_ENTRY_X, 0, driveT);
}

/** Abertura da porta: trapézio puro em `p` — sobe, segura aberta durante o
 * handoff, desce no assentamento. Duas smoothsteps subtraídas bastam. */
function computeDockDoorAmount(p: number): number {
	const opening = smoothstep(DOCK_DOOR_OPEN_START, DOCK_DOOR_OPEN_END, p);
	const closing = smoothstep(DOCK_SETTLE_START, DOCK_SETTLE_END, p);
	return opening - closing;
}

/** Bounce vertical do corpo: balanço de suspensão enquanto dirige (morre ao
 * parar) mais um flutuar residual contínuo assim que a entrega termina. */
function computeDockBounceY(p: number, elapsed: number): number {
	const driveEnvelope =
		smoothstep(DOCK_TRUCK_ENTER_START, DOCK_TRUCK_ENTER_START + 0.02, p) *
		(1 - smoothstep(DOCK_TRUCK_ENTER_END - 0.02, DOCK_TRUCK_ENTER_END, p));
	const idleEnvelope = smoothstep(0.995, DOCK_SETTLE_END, p);
	const amplitude =
		DOCK_DRIVE_BOUNCE_AMPLITUDE * driveEnvelope +
		DOCK_IDLE_BOUNCE_AMPLITUDE * idleEnvelope;
	// Só para cima (0..2×amplitude): com asfalto embaixo, a roda nunca afunda.
	return (1 + Math.sin(elapsed * DOCK_BOUNCE_FREQUENCY)) * amplitude;
}

/** Pulso de squash-and-stretch (escala nos 3 eixos) no instante do
 * assentamento — a mesma forma de "hump" usada no estouro da bolha. */
function computeDockSettlePulse(p: number): number {
	return (
		smoothstep(DOCK_SETTLE_START, DOCK_SETTLE_START + 0.03, p) *
		(1 - smoothstep(DOCK_SETTLE_START + 0.03, DOCK_SETTLE_END, p))
	);
}

interface EmissiveMaterial {
	emissive: { getHexString: () => string };
	emissiveIntensity: number;
}

/** Percorre o corpo do caminhão e junta os materiais dos faróis (cor
 * conhecida de FrenteCaminhao) — a única forma de alcançá-los, já que o
 * contrato `CaminhaoParts` não os expõe. */
function collectHeadlightMaterials(body: Group): EmissiveMaterial[] {
	const found: EmissiveMaterial[] = [];
	body.traverse((child) => {
		const material = (child as unknown as { material?: unknown }).material as
			| Partial<EmissiveMaterial>
			| undefined;
		if (material?.emissive?.getHexString?.() === DOCK_HEADLIGHT_HEX) {
			found.push(material as EmissiveMaterial);
		}
	});
	return found;
}

/** Gira as rodas proporcionalmente ao deslocamento linear do corpo (arco =
 * ângulo, sem alocação — só escalares). */
function spinDockWheels(wheels: Group[], dx: number): void {
	const dTheta = dx / DOCK_WHEEL_RADIUS;
	for (const wheel of wheels) {
		wheel.rotation.z -= dTheta;
	}
}

/**
 * O caminhão da doca: ancorado em [data-s-anchor="caminhao-doca"], dirigido
 * inteiramente por `journeyProgress` (ver constantes DOCK_* acima). Publica
 * a posição mundial do `cargoTarget` em `dockCargoWorld` a cada quadro para
 * a `JourneyBox` desviar o pouso final da caixa para dentro do baú — os dois
 * componentes não se conhecem, só o canal fora do React.
 */
function DocaFinal() {
	const partsRef = useRef<CaminhaoParts | null>(null);
	const headlightsRef = useRef<EmissiveMaterial[]>([]);
	const bodyBaseY = useRef(0);
	const prevBodyX = useRef(DOCK_TRUCK_ENTRY_X);

	const handleParts = useCallback((parts: CaminhaoParts) => {
		partsRef.current = parts;
		headlightsRef.current = collectHeadlightMaterials(parts.body);
		bodyBaseY.current = parts.body.position.y;
		parts.body.position.x = DOCK_TRUCK_ENTRY_X;
		prevBodyX.current = DOCK_TRUCK_ENTRY_X;
		dockReady.current = true;
	}, []);

	useFrame((state) => {
		const parts = partsRef.current;
		if (!parts) {
			return;
		}
		const p = journeyProgress.get();
		const elapsed = state.clock.elapsedTime;

		const bodyX = computeDockBodyX(p);
		spinDockWheels(parts.wheels, bodyX - prevBodyX.current);
		prevBodyX.current = bodyX;

		const settlePulse = computeDockSettlePulse(p);
		parts.body.position.set(
			bodyX,
			bodyBaseY.current + computeDockBounceY(p, elapsed),
			0
		);
		parts.body.scale.set(
			1 + DOCK_SETTLE_SQUASH_PEAK * 0.5 * settlePulse,
			1 - DOCK_SETTLE_SQUASH_PEAK * settlePulse,
			1 + DOCK_SETTLE_SQUASH_PEAK * 0.5 * settlePulse
		);

		parts.door.rotation.z = DOCK_DOOR_OPEN_ANGLE * computeDockDoorAmount(p);

		const flash = settlePulse * DOCK_HEADLIGHT_FLASH_PEAK;
		for (const material of headlightsRef.current) {
			material.emissiveIntensity = 0.6 + flash;
		}

		// Publica o alvo de entrega em coordenadas mundiais — localToWorld
		// força a atualização da cadeia de matrizes até a raiz, então o
		// valor já reflete a posição que acabamos de escrever acima neste
		// mesmo quadro (sem lag de um frame).
		parts.body.localToWorld(dockCargoWorld.copy(parts.cargoTarget));
	});

	return (
		<AnchoredGroup
			selector='[data-s-anchor="caminhao-doca"]'
			unitHeight={CAMINHAO_ALTURA}
		>
			{/* Chão do modelo (y=0) na borda inferior da âncora: o asfalto do
			    DOM começa exatamente aí, então as rodas tocam a pista. */}
			<group position={[0, -CAMINHAO_ALTURA / 2, 0]} rotation={[0, Math.PI, 0]}>
				<CaminhaoEntrega onParts={handleParts} />
			</group>
		</AnchoredGroup>
	);
}

/**
 * Sinal de "cena pronta" para o DOM: no primeiro frame desenhado (o que só
 * acontece depois das texturas resolverem o Suspense da cena), marca o
 * <html> e o placeholder CSS do hero faz cross-fade para o vidro real.
 */
function SceneReady() {
	const done = useRef(false);
	useFrame(() => {
		if (done.current) {
			return;
		}
		done.current = true;
		document.documentElement.dataset.sceneReady = "";
	});
	return null;
}

/**
 * O único canvas 3D da página (um contexto WebGL para tudo): bolhas do
 * hero, a caixa viajante (única) e vinhetas das seções, cada grupo ancorado
 * ao elemento do DOM que marca seu lugar.
 */
export function Scene3D() {
	const journeyActive = useJourneyActive();

	return (
		<div aria-hidden className="pointer-events-none fixed inset-0 z-10">
			<Canvas
				camera={{ fov: 35, position: [0, 0, CAMERA_Z] }}
				dpr={[1, 1.5]}
				gl={{ alpha: true, antialias: true }}
			>
				<StudioRig />
				<MicroBubbles />
				<AnchoredGroup selector='[data-s-anchor="hero-cluster"]' unitHeight={5}>
					<HeroCluster journeyActive={journeyActive} />
					{/* ContactShadows no lugar do AccumulativeShadows: o grupo
					    ancorado reescala por frame, o que reinicia a acumulação
					    temporal e fazia o plano aparecer cru (placa cinza). */}
					<ContactShadows
						blur={2.8}
						color="#0f1c2b"
						far={4}
						opacity={0.22}
						position={[0, -2.3, 0]}
						scale={9}
					/>
				</AnchoredGroup>
				<DocaFinal />
				<JourneyBox journeyActive={journeyActive} />
				<StationVignette variant="frasco" />
				<StationVignette variant="selo" />
				<StationVignette variant="caminhao" />
				<SceneReady />
			</Canvas>
		</div>
	);
}
