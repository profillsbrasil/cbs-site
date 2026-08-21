import { describe, expect, test } from "bun:test";

import {
	anchorFraction,
	journeyFraction,
	segmentWeights,
} from "./journey-math";

describe("journey-math", () => {
	test("pesos são a distância vertical entre âncoras consecutivas, mínimo 1", () => {
		expect(segmentWeights([0, 100, 100, 350])).toEqual([100, 1, 250]);
	});

	test("journeyFraction acumula os segmentos anteriores e interpola o atual", () => {
		const w = [100, 100, 200];
		expect(journeyFraction(w, 0, 0)).toBe(0);
		expect(journeyFraction(w, 1, 0)).toBeCloseTo(0.25);
		expect(journeyFraction(w, 1, 1)).toBeCloseTo(0.5);
		expect(journeyFraction(w, 2, 1)).toBe(1);
	});

	test("anchorFraction é a fração acumulada até a âncora", () => {
		const ys = [0, 100, 200, 400];
		expect(anchorFraction(ys, 0)).toBe(0);
		expect(anchorFraction(ys, 1)).toBeCloseTo(0.25);
		expect(anchorFraction(ys, 3)).toBe(1);
	});
});
