"use client";

import { useMotionValueEvent } from "motion/react";
import { useEffect, useState } from "react";
import { DOCK_HANDOFF_END } from "./journey-constants";
import { journeyProgress } from "./journey-progress";
import { useJourneyActive } from "./use-journey-active";

/**
 * Título da Chegada: "Pronto para vender." nasce apagado e acende em azul
 * no instante em que a caixa entra no baú do caminhão (`journeyProgress`
 * cruza DOCK_HANDOFF_END) — o único momento raro da página leva o único
 * acento de delight do HTML. Sem coreografia (mobile / reduced-motion) já
 * nasce aceso, como os pontos do mapa.
 */
export function EntregaTitulo() {
	const journeyActive = useJourneyActive();
	const [delivered, setDelivered] = useState(false);

	useEffect(() => {
		setDelivered(!journeyActive);
	}, [journeyActive]);

	useMotionValueEvent(journeyProgress, "change", (p) => {
		if (journeyActive) {
			setDelivered(p >= DOCK_HANDOFF_END);
		}
	});

	return (
		<h2 className="relative z-20 mx-auto max-w-2xl text-balance font-bold font-display text-4xl text-brand-navy leading-tight tracking-tight sm:text-5xl md:text-6xl">
			Entregue no CD.
			<br className="hidden sm:block" />{" "}
			<span
				className="text-brand-navy/30 transition-colors duration-300 ease-brand data-delivered:text-brand-ink"
				data-delivered={delivered ? "" : undefined}
			>
				Pronto para vender.
			</span>
		</h2>
	);
}
