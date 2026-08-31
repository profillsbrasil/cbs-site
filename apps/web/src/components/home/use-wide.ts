"use client";

import { useEffect, useState } from "react";

/** Limiar da jornada e do canvas: abaixo disso a página é imagem + CSS. */
export const WIDE_QUERY = "(min-width: 1024px)";

/**
 * `true` em telas ≥ 1024px, reagindo a resize/rotação. Começa `false` no
 * servidor e no primeiro paint — o desktop paga um frame sem canvas, o
 * celular nunca baixa o chunk do three.
 */
export function useWide(): boolean {
	const [wide, setWide] = useState(false);

	useEffect(() => {
		const query = window.matchMedia(WIDE_QUERY);
		const update = () => setWide(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);

	return wide;
}
