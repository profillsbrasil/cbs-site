"use client";

import {
	type MotionValue,
	motion,
	useReducedMotion,
	useSpring,
	useTransform,
} from "motion/react";
import { useEffect, useState } from "react";
import { JOURNEY_ANCHORS } from "./journey-constants";
import { journeyProgress } from "./journey-progress";
import { useJourneyActive } from "./use-journey-active";

interface Point {
	x: number;
	y: number;
}

interface Segment {
	p0: Point;
	p1: Point;
	p2: Point;
	p3: Point;
}

interface FoamDot {
	/** Só um terço das bolhas balança — dá vida sem animar as 24 por frame. */
	bob: boolean;
	/** Duração (3-5s) do drift ao longo da tangente, dessincronizada por bolha. */
	driftDuration: number;
	duration: number;
	opacity: number;
	r: number;
	/** Fração 0-1 ao longo do caminho: quando o progresso revela a bolha. */
	t: number;
	/** Tangente unitária local: direção em que a bolha deriva com a corrente. */
	tx: number;
	ty: number;
	x: number;
	y: number;
}

interface Geometry {
	centerlineD: string;
	foam: FoamDot[];
	height: number;
	reflectionD: string;
	ribbonD: string;
}

const EMPTY_GEOMETRY: Geometry = {
	centerlineD: "",
	foam: [],
	height: 0,
	reflectionD: "",
	ribbonD: "",
};

const STEPS_PER_SEGMENT = 30;
const FOAM_COUNT = 24;
const RIBBON_BASE_WIDTH = 22;
const RIBBON_MIN_WIDTH = 14;
const RIBBON_MAX_WIDTH = 30;
const REFLECTION_OFFSET = -7;
/** Comprimento do "nariz" de gota nas pontas, em múltiplos da meia-largura. */
const NOSE_LENGTH_FACTOR = 1.6;
/** Alcance do ponto de controle das quadráticas do nariz, mesma unidade. */
const NOSE_CONTROL_FACTOR = 0.5;
/** Deslocamento do drift horizontal/vertical da espuma na direção da tangente, em px. */
const FOAM_DRIFT = 10;

function clampNumber(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

/** Hash determinístico (sem Math.random) — mesma bolha cai sempre no mesmo lugar entre measures. */
function pseudoRandom(seed: number): number {
	const value = Math.sin(seed * 12.9898) * 43_758.5453;
	return value - Math.floor(value);
}

/**
 * Catmull-Rom (tensão 0.5) convertido em cúbicas de Bézier: a tangente em
 * cada marco segue a direção dos vizinhos, então trechos quase horizontais
 * (a curva de chegada) viram uma curva contínua em vez de um cotovelo com
 * tangentes verticais forçadas.
 */
const CATMULL_TENSION = 6;

function buildSegments(points: Point[]): Segment[] {
	const segments: Segment[] = [];
	for (let i = 0; i < points.length - 1; i += 1) {
		const prev = points[i - 1] ?? (points[i] as Point);
		const a = points[i] as Point;
		const b = points[i + 1] as Point;
		const next = points[i + 2] ?? b;
		segments.push({
			p0: a,
			p1: {
				x: a.x + (b.x - prev.x) / CATMULL_TENSION,
				y: a.y + (b.y - prev.y) / CATMULL_TENSION,
			},
			p2: {
				x: b.x - (next.x - a.x) / CATMULL_TENSION,
				y: b.y - (next.y - a.y) / CATMULL_TENSION,
			},
			p3: b,
		});
	}
	return segments;
}

function buildPath(points: Point[]): string {
	if (points.length === 0) {
		return "";
	}
	const [start] = points as [Point];
	let d = `M ${start.x} ${start.y}`;
	for (const { p1, p2, p3 } of buildSegments(points)) {
		d += ` C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;
	}
	return d;
}

function cubicPoint(segment: Segment, t: number): Point {
	const mt = 1 - t;
	const a = mt * mt * mt;
	const b = 3 * mt * mt * t;
	const c = 3 * mt * t * t;
	const d = t * t * t;
	return {
		x:
			a * segment.p0.x + b * segment.p1.x + c * segment.p2.x + d * segment.p3.x,
		y:
			a * segment.p0.y + b * segment.p1.y + c * segment.p2.y + d * segment.p3.y,
	};
}

/**
 * Amostra a centerline avaliando a cúbica manualmente (~120 pontos), em vez
 * de desenhar um <path> oculto e chamar getPointAtLength: isso ficaria
 * refém do DOM (forçaria layout a cada leitura) só para gerar números que a
 * própria fórmula da bezier já dá em JS puro. Roda uma vez por measure, não
 * por frame.
 */
function sampleCenterline(points: Point[]): Point[] {
	const segments = buildSegments(points);
	const samples: Point[] = [];
	for (const [index, segment] of segments.entries()) {
		const startStep = index === 0 ? 0 : 1;
		const steps = Array.from(
			{ length: STEPS_PER_SEGMENT - startStep + 1 },
			(_, i) => startStep + i
		);
		for (const step of steps) {
			samples.push(cubicPoint(segment, step / STEPS_PER_SEGMENT));
		}
	}
	return samples;
}

/** Normal unitária por amostra, a partir da tangente entre vizinhos. */
function computeNormals(samples: Point[]): Point[] {
	const normals: Point[] = [];
	for (const [index, point] of samples.entries()) {
		const prev = samples[Math.max(0, index - 1)] ?? point;
		const next = samples[Math.min(samples.length - 1, index + 1)] ?? point;
		const tx = next.x - prev.x;
		const ty = next.y - prev.y;
		const len = Math.hypot(tx, ty) || 1;
		normals.push({ x: -ty / len, y: tx / len });
	}
	return normals;
}

/** Tangente unitária (direção de avanço do caminho) a partir da normal já calculada. */
function tangentFromNormal(normal: Point): Point {
	return { x: normal.y, y: -normal.x };
}

const EDGE_TAPER_FRACTION = 0.06;

/** 0 nas pontas, 1 no miolo: a fita estreita até um fio antes de sumir. */
function edgeTaper(u: number): number {
	const fromStart = clampNumber(u / EDGE_TAPER_FRACTION, 0, 1);
	const fromEnd = clampNumber((1 - u) / EDGE_TAPER_FRACTION, 0, 1);
	return Math.min(fromStart, fromEnd);
}

/** Largura da fita por amostra: base + 3 senos de baixa frequência somados. */
function computeWidths(samples: Point[]): number[] {
	const last = samples.length - 1;
	return samples.map((_, index) => {
		const u = last === 0 ? 0 : index / last;
		const wobble =
			Math.sin(u * Math.PI * 2 * 1.3) * 4 +
			Math.sin(u * Math.PI * 2 * 2.7 + 1.1) * 2.5 +
			Math.sin(u * Math.PI * 2 * 0.6 + 2.4) * 1.5;
		const width = clampNumber(
			RIBBON_BASE_WIDTH + wobble,
			RIBBON_MIN_WIDTH,
			RIBBON_MAX_WIDTH
		);
		return width * edgeTaper(u);
	});
}

/** Ponto do nariz de gota e seus dois controles, projetado na direção da tangente. */
function buildNose(
	tip: Point,
	otherTip: Point,
	origin: Point,
	tangent: Point,
	halfWidth: number
): { control1: Point; control2: Point; nose: Point } {
	const noseLen = halfWidth * NOSE_LENGTH_FACTOR;
	const controlLen = halfWidth * NOSE_CONTROL_FACTOR;
	return {
		control1: {
			x: tip.x + tangent.x * controlLen,
			y: tip.y + tangent.y * controlLen,
		},
		control2: {
			x: otherTip.x + tangent.x * controlLen,
			y: otherTip.y + tangent.y * controlLen,
		},
		nose: {
			x: origin.x + tangent.x * noseLen,
			y: origin.y + tangent.y * noseLen,
		},
	};
}

/**
 * Polígono fechado: vai pela borda esquerda, volta pela direita. As duas
 * pontas (nascente e foz) fecham num "nariz" de gota — duas quadráticas
 * projetadas na tangente local — em vez do segmento reto original.
 */
function buildRibbonPath(
	samples: Point[],
	normals: Point[],
	widths: number[]
): string {
	const last = samples.length - 1;
	const left = samples.map((point, index) => ({
		x: point.x + normals[index].x * (widths[index] / 2),
		y: point.y + normals[index].y * (widths[index] / 2),
	}));
	const right = samples.map((point, index) => ({
		x: point.x - normals[index].x * (widths[index] / 2),
		y: point.y - normals[index].y * (widths[index] / 2),
	}));

	// Foz: tangente aponta para a frente, o rio continua na direção do fluxo.
	const endTangent = tangentFromNormal(normals[last]);
	const endNose = buildNose(
		left[last],
		right[last],
		samples[last],
		endTangent,
		widths[last] / 2
	);

	// Nascente: tangente invertida, o rio "nasce" redondo puxando pra trás.
	const startTangentRaw = tangentFromNormal(normals[0]);
	const startTangent = { x: -startTangentRaw.x, y: -startTangentRaw.y };
	const startNose = buildNose(
		right[0],
		left[0],
		samples[0],
		startTangent,
		widths[0] / 2
	);

	const [firstLeft, ...restLeft] = left as [Point, ...Point[]];
	let d = `M ${firstLeft.x} ${firstLeft.y}`;
	for (const point of restLeft) {
		d += ` L ${point.x} ${point.y}`;
	}
	d += ` Q ${endNose.control1.x} ${endNose.control1.y}, ${endNose.nose.x} ${endNose.nose.y}`;
	d += ` Q ${endNose.control2.x} ${endNose.control2.y}, ${right[last].x} ${right[last].y}`;
	for (const point of right.slice(0, last).reverse()) {
		d += ` L ${point.x} ${point.y}`;
	}
	d += ` Q ${startNose.control1.x} ${startNose.control1.y}, ${startNose.nose.x} ${startNose.nose.y}`;
	d += ` Q ${startNose.control2.x} ${startNose.control2.y}, ${left[0].x} ${left[0].y}`;
	return `${d} Z`;
}

/** Linha aberta, deslocada para um lado da centerline: o brilho interno. */
function buildReflectionPath(samples: Point[], normals: Point[]): string {
	const points = samples.map((point, index) => ({
		x: point.x + normals[index].x * REFLECTION_OFFSET,
		y: point.y + normals[index].y * REFLECTION_OFFSET,
	}));
	const [first, ...rest] = points as [Point, ...Point[]];
	let d = `M ${first.x} ${first.y}`;
	for (const point of rest) {
		d += ` L ${point.x} ${point.y}`;
	}
	return d;
}

/** Bolhas de espuma distribuídas nas bordas da fita, alternando os lados. */
function buildFoam(
	samples: Point[],
	normals: Point[],
	widths: number[]
): FoamDot[] {
	const last = samples.length - 1;
	if (last <= 0) {
		return [];
	}
	return Array.from({ length: FOAM_COUNT }, (_, i) => {
		const t = i / (FOAM_COUNT - 1);
		const index = Math.round(t * last);
		const sample = samples[index];
		const normal = normals[index];
		const side = i % 2 === 0 ? 1 : -1;
		const halfWidth = widths[index] / 2;
		// -2..6px: algumas ficam encostadas na borda, outras vazam pra fora.
		const spread = pseudoRandom(i) * 8 - 2;
		const offset = side * (halfWidth + spread);
		const tangent = tangentFromNormal(normal);
		return {
			bob: i % 3 === 0,
			driftDuration: 3 + pseudoRandom(i + 400) * 2,
			duration: 2.2 + pseudoRandom(i + 300) * 1.6,
			opacity: 0.7 + pseudoRandom(i + 200) * 0.3,
			r: 2.5 + pseudoRandom(i + 100) * 4,
			t,
			tx: tangent.x,
			ty: tangent.y,
			x: sample.x + normal.x * offset,
			y: sample.y + normal.y * offset,
		};
	});
}

interface FoamBubbleProps {
	dot: FoamDot;
	progress: MotionValue<number>;
}

/**
 * Uma bolha por componente para poder chamar useTransform (opacidade
 * amarrada ao t dela) sem depender de hooks em loop no componente pai.
 *
 * O drift ao longo da tangente (a corrente do rio) e o balanço vertical das
 * bolhas com bob são um keyframe CSS em `transform` (`.foam-drift`): roda
 * fora da main thread, que já pertence ao Canvas 3D. Animar `cx`/`cy` por
 * rAF era um repaint por frame por bolha. As variáveis ficam na própria
 * bolha, não num pai, para não recalcular estilo em cascata.
 */
function FoamBubble({ dot, progress }: FoamBubbleProps) {
	const revealStart = Math.max(0, dot.t - 0.05);
	const revealEnd = Math.max(dot.t, revealStart + 0.001);
	const opacity = useTransform(
		progress,
		[revealStart, revealEnd],
		[0, dot.opacity]
	);
	const bobOffset = dot.bob ? -3 : 0;
	const duration = dot.bob ? dot.duration : dot.driftDuration;
	return (
		<motion.g style={{ opacity }}>
			<circle
				className="foam-drift"
				cx={dot.x}
				cy={dot.y}
				fill="#ffffff"
				r={dot.r}
				style={
					{
						"--foam-dur": `${duration}s`,
						"--foam-dx": `${dot.tx * FOAM_DRIFT}px`,
						"--foam-dy": `${dot.ty * FOAM_DRIFT + bobOffset}px`,
					} as React.CSSProperties
				}
			/>
		</motion.g>
	);
}

export function LiquidPath() {
	const active = useJourneyActive();
	const reduced = useReducedMotion();
	const [geometry, setGeometry] = useState<Geometry>(EMPTY_GEOMETRY);
	const progress = useSpring(journeyProgress, {
		damping: 30,
		stiffness: 120,
	});
	// Chrome pinta um véu leitoso gigante quando o stroke do mask fica com
	// dasharray "0px" (progresso 0) e linecap round — some com o grupo
	// mascarado até o progresso realmente começar.
	const riverOpacity = useTransform(progress, [0, 0.008], [0, 1]);

	useEffect(() => {
		if (!active) {
			return;
		}
		const measure = () => {
			const main = document.querySelector("main");
			if (!main) {
				return;
			}
			const mainTop = main.getBoundingClientRect().top + window.scrollY;
			const points: Point[] = [];
			for (const id of JOURNEY_ANCHORS) {
				const el = document.querySelector(`[data-j-anchor="${id}"]`);
				if (el) {
					const rect = el.getBoundingClientRect();
					points.push({
						x: rect.left + rect.width / 2 + window.scrollX,
						y: rect.top + rect.height / 2 + window.scrollY - mainTop,
					});
				}
			}
			if (points.length < 2) {
				setGeometry(EMPTY_GEOMETRY);
				return;
			}
			const samples = sampleCenterline(points);
			const normals = computeNormals(samples);
			const widths = computeWidths(samples);
			setGeometry({
				centerlineD: buildPath(points),
				foam: buildFoam(samples, normals, widths),
				// Preso à altura do main: um svg mais alto que o conteúdo
				// vaza por baixo e estica o documento em loop.
				height: main.offsetHeight,
				reflectionD: buildReflectionPath(samples, normals),
				ribbonD: buildRibbonPath(samples, normals, widths),
			});
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(document.body);
		return () => observer.disconnect();
	}, [active]);

	if (!(active && geometry.ribbonD)) {
		return null;
	}

	return (
		<svg
			aria-hidden
			className="pointer-events-none absolute top-0 left-0 z-0 w-full"
			height={geometry.height}
			style={{ height: geometry.height }}
		>
			<title>Caminho da entrega</title>
			<defs>
				<linearGradient
					gradientUnits="userSpaceOnUse"
					id="liquid"
					x1="0"
					x2="0"
					y1="0"
					y2={geometry.height}
				>
					<stop offset="0" stopColor="#dcf3fa" stopOpacity="0.85" />
					<stop offset="0.5" stopColor="#a8e0f0" stopOpacity="0.75" />
					<stop offset="1" stopColor="#1d9dd8" stopOpacity="0.5" />
					{/* SMIL nativo — custo zero de React/rAF; ignora prefers-reduced-motion sozinho, por isso o gate manual. */}
					{reduced ? null : (
						<animateTransform
							attributeName="gradientTransform"
							dur="7s"
							repeatCount="indefinite"
							type="translate"
							values="0 0; 0 48; 0 0"
						/>
					)}
				</linearGradient>
				{/* Fade das pontas: a nascente e a foz nunca mostram corte, mesmo
				    já reveladas — o alfa mora no gradiente do stroke do mask. */}
				<linearGradient id="river-fade" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0" stopColor="#fff" stopOpacity="0" />
					<stop offset="0.05" stopColor="#fff" stopOpacity="1" />
					<stop offset="0.95" stopColor="#fff" stopOpacity="1" />
					<stop offset="1" stopColor="#fff" stopOpacity="0" />
				</linearGradient>
				{/* Faixa larga acompanhando a centerline: revela a fita conforme o progresso. */}
				<mask id="liquid-reveal">
					<motion.path
						d={geometry.centerlineD}
						fill="none"
						stroke="url(#river-fade)"
						strokeLinecap="round"
						strokeWidth={80}
						style={{ pathLength: progress }}
					/>
				</mask>
			</defs>
			<motion.g mask="url(#liquid-reveal)" style={{ opacity: riverOpacity }}>
				{/* A fita: um rio preenchido, sem stroke fino nem blur. */}
				<path d={geometry.ribbonD} fill="url(#liquid)" />
				{/* Reflexo interno: realce fino que dá volume sem virar neon. */}
				<path
					d={geometry.reflectionD}
					fill="none"
					stroke="#ffffff"
					strokeLinecap="round"
					strokeOpacity={0.65}
					strokeWidth={2.5}
				/>
				{/* Brilho vivo: trecho curto do reflexo que percorre o rio, tracejado. */}
				<motion.path
					animate={reduced ? undefined : { strokeDashoffset: [0, -300] }}
					d={geometry.reflectionD}
					fill="none"
					stroke="#ffffff"
					strokeDasharray="40 260"
					strokeLinecap="round"
					strokeOpacity={0.5}
					strokeWidth={2.5}
					transition={{
						duration: 5,
						ease: "linear",
						repeat: Number.POSITIVE_INFINITY,
					}}
				/>
			</motion.g>
			{geometry.foam.map((dot, index) => (
				<FoamBubble
					dot={dot}
					// biome-ignore lint/suspicious/noArrayIndexKey: lista de tamanho fixo (FOAM_COUNT), o índice É a identidade determinística da bolha
					key={index}
					progress={progress}
				/>
			))}
		</svg>
	);
}
