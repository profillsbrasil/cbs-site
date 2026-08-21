"use client";

import { useEffect, useState } from "react";

import { anchorFraction } from "./journey-math";
import { JOURNEY_ANCHORS } from "./scene3d";

type AnchorId = (typeof JOURNEY_ANCHORS)[number];

/**
 * Em que fração de `journeyProgress` a caixa para sobre a âncora `id`.
 * Mede o DOM uma vez por layout (resize) — o mesmo critério de distância
 * vertical que `JourneyBox` usa, então os dois concordam. Devolve 1 até a
 * primeira medição, para nenhum consumidor "acender" antes da hora.
 */
export function useAnchorFraction(id: AnchorId): number {
	const [fraction, setFraction] = useState(1);

	useEffect(() => {
		const measure = () => {
			const ys: number[] = [];
			for (const anchor of JOURNEY_ANCHORS) {
				const el = document.querySelector(`[data-j-anchor="${anchor}"]`);
				if (!el) {
					return;
				}
				const rect = el.getBoundingClientRect();
				ys.push(rect.top + rect.height / 2 + window.scrollY);
			}
			setFraction(anchorFraction(ys, JOURNEY_ANCHORS.indexOf(id)));
		};
		measure();
		window.addEventListener("resize", measure);
		return () => window.removeEventListener("resize", measure);
	}, [id]);

	return fraction;
}
