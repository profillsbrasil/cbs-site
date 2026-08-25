"use client";

import { useEffect, useState } from "react";
import { JOURNEY_ANCHORS } from "./journey-constants";
import { anchorFraction } from "./journey-math";

type AnchorId = (typeof JOURNEY_ANCHORS)[number];

/**
 * Em que fração de `journeyProgress` a caixa para sobre a âncora `id`.
 * Remede quando o layout muda — mesmo padrão do liquid-path — então os
 * dois concordam mesmo quando fontes/imagens tardias deslocam as âncoras
 * sem redimensionar a janela. Devolve 1 até a primeira medição, para
 * nenhum consumidor "acender" antes da hora.
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
		const observer = new ResizeObserver(measure);
		observer.observe(document.body);
		return () => observer.disconnect();
	}, [id]);

	return fraction;
}
