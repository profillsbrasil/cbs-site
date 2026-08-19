"use client";

import { motion, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useState } from "react";

import { journeyProgress } from "./journey-progress";
import { JOURNEY_ANCHORS } from "./scene3d";
import { useJourneyActive } from "./use-journey-active";

interface Point {
	x: number;
	y: number;
}

function buildPath(points: Point[]): string {
	if (points.length < 2) {
		return "";
	}
	const [start, ...rest] = points as [Point, ...Point[]];
	let d = `M ${start.x} ${start.y}`;
	let previous = start;
	for (const point of rest) {
		const midY = (previous.y + point.y) / 2;
		d += ` C ${previous.x} ${midY}, ${point.x} ${midY}, ${point.x} ${point.y}`;
		previous = point;
	}
	return d;
}

/**
 * O caminho líquido: um traço aqua que escorre da bolha do hero até a doca,
 * desenhado conforme o scroll avança, com uma corrente interna sempre
 * fluindo. Termina numa poça sob a caixa.
 */
export function LiquidPath() {
	const active = useJourneyActive();
	const reduced = useReducedMotion();
	const [geometry, setGeometry] = useState<{
		d: string;
		height: number;
		puddle: Point | null;
	}>({ d: "", height: 0, puddle: null });
	const pathLength = useSpring(journeyProgress, {
		damping: 30,
		stiffness: 120,
	});

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
			const last = points.at(-1) ?? null;
			setGeometry({
				d: buildPath(points),
				// Preso à altura do main: um svg mais alto que o conteúdo
				// vaza por baixo e estica o documento em loop.
				height: main.offsetHeight,
				puddle: last,
			});
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(document.body);
		return () => observer.disconnect();
	}, [active]);

	if (!(active && geometry.d)) {
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
				<linearGradient id="liquid" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0" stopColor="#dcf3fa" />
					<stop offset="0.5" stopColor="#a8e0f0" />
					<stop offset="1" stopColor="#1d9dd8" />
				</linearGradient>
				<filter height="160%" id="foam" width="160%" x="-30%" y="-30%">
					<feGaussianBlur stdDeviation="9" />
				</filter>
				<radialGradient id="puddle-fill">
					<stop offset="0" stopColor="#a8e0f0" stopOpacity="0.85" />
					<stop offset="0.7" stopColor="#dcf3fa" stopOpacity="0.7" />
					<stop offset="1" stopColor="#dcf3fa" stopOpacity="0" />
				</radialGradient>
			</defs>
			{geometry.puddle ? (
				<g>
					<motion.ellipse
						animate={reduced ? undefined : { scale: [1, 1.05, 1] }}
						cx={geometry.puddle.x}
						cy={geometry.puddle.y + 86}
						fill="url(#puddle-fill)"
						rx={210}
						ry={38}
						style={{
							opacity: pathLength,
							transformOrigin: `${geometry.puddle.x}px ${geometry.puddle.y + 86}px`,
						}}
						transition={{
							duration: 3.2,
							ease: "easeInOut",
							repeat: Number.POSITIVE_INFINITY,
						}}
					/>
					<motion.ellipse
						cx={geometry.puddle.x}
						cy={geometry.puddle.y + 86}
						fill="none"
						rx={150}
						ry={26}
						stroke="#a8e0f0"
						strokeOpacity={0.5}
						strokeWidth={2}
						style={{ opacity: pathLength }}
					/>
				</g>
			) : null}
			{/* Borda de espuma: camada larga e desfocada */}
			<motion.path
				d={geometry.d}
				fill="none"
				filter="url(#foam)"
				stroke="url(#liquid)"
				strokeLinecap="round"
				strokeOpacity={0.5}
				strokeWidth={64}
				style={{ pathLength }}
			/>
			<motion.path
				d={geometry.d}
				fill="none"
				stroke="url(#liquid)"
				strokeLinecap="round"
				strokeOpacity={0.65}
				strokeWidth={38}
				style={{ pathLength }}
			/>
			<motion.path
				d={geometry.d}
				fill="none"
				stroke="#ffffff"
				strokeLinecap="round"
				strokeOpacity={0.6}
				strokeWidth={13}
				style={{ pathLength }}
			/>
			{reduced ? null : (
				<motion.path
					animate={{ strokeDashoffset: [0, -64] }}
					d={geometry.d}
					fill="none"
					stroke="#ffffff"
					strokeDasharray="36 28"
					strokeLinecap="round"
					strokeOpacity={0.35}
					strokeWidth={5}
					style={{ pathLength }}
					transition={{
						duration: 1.6,
						ease: "linear",
						repeat: Number.POSITIVE_INFINITY,
					}}
				/>
			)}
		</svg>
	);
}
