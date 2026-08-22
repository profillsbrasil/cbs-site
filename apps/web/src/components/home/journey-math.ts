/**
 * Matemática pura da jornada da caixa: o progresso 0–1 é a distância
 * vertical acumulada entre as âncoras `data-j-anchor`, na ordem de
 * `JOURNEY_ANCHORS`. Vive fora de scene3d.tsx para ser testável e para o
 * DOM (mapa da malha) poder perguntar "em que fração a caixa para aqui?"
 * sem duplicar a conta.
 */
export function segmentWeights(screenYs: number[]): number[] {
	const weights: number[] = [];
	for (let i = 0; i < screenYs.length - 1; i += 1) {
		const a = screenYs[i] as number;
		const b = screenYs[i + 1] as number;
		weights.push(Math.max(Math.abs(b - a), 1));
	}
	return weights;
}

export function journeyFraction(
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

/** Fração de progresso em que a caixa está exatamente sobre a âncora `index`. */
export function anchorFraction(screenYs: number[], index: number): number {
	const weights = segmentWeights(screenYs);
	if (index >= weights.length) {
		return 1;
	}
	return journeyFraction(weights, index, 0);
}
