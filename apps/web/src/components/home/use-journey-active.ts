"use client";

import { useEffect, useState } from "react";

import { WIDE_QUERY } from "./use-wide";

/**
 * A jornada contínua da caixa (canvas fixo + explosão da bolha) só roda em
 * telas largas e sem prefers-reduced-motion. Fora disso, a caixa fica
 * estática dentro da bolha do hero.
 */
export function useJourneyActive(): boolean {
	const [active, setActive] = useState(false);

	useEffect(() => {
		const wide = window.matchMedia(WIDE_QUERY);
		const motionOk = window.matchMedia(
			"(prefers-reduced-motion: no-preference)"
		);
		const update = () => setActive(wide.matches && motionOk.matches);
		update();
		wide.addEventListener("change", update);
		motionOk.addEventListener("change", update);
		return () => {
			wide.removeEventListener("change", update);
			motionOk.removeEventListener("change", update);
		};
	}, []);

	return active;
}
