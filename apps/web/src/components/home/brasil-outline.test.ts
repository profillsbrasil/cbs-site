import { describe, expect, test } from "bun:test";

import {
	BRASIL_BOUNDS,
	BRASIL_STATE_PATHS,
	BRASIL_VIEWBOX,
	projectLngLat,
} from "./brasil-outline";

describe("brasil-outline", () => {
	test("tem os 27 estados", () => {
		expect(BRASIL_STATE_PATHS).toHaveLength(27);
		for (const d of BRASIL_STATE_PATHS) {
			expect(d.startsWith("M")).toBe(true);
		}
	});

	test("viewBox começa em 0 0 e tem 600 de largura", () => {
		const [x, y, w] = BRASIL_VIEWBOX.split(" ").map(Number);
		expect(x).toBe(0);
		expect(y).toBe(0);
		expect(w).toBe(600);
	});

	test("projeta São Paulo dentro do viewBox, abaixo do centro", () => {
		const [, , w, h] = BRASIL_VIEWBOX.split(" ").map(Number);
		const [px, py] = projectLngLat(-46.63, -23.55);
		expect(px).toBeGreaterThan(0);
		expect(px).toBeLessThan(w);
		expect(py).toBeGreaterThan(h / 2);
		expect(py).toBeLessThan(h);
	});

	test("bounds cobrem o país", () => {
		const [[west, south], [east, north]] = BRASIL_BOUNDS;
		expect(west).toBeLessThan(-73);
		expect(east).toBeGreaterThan(-35);
		expect(south).toBeLessThan(-33);
		expect(north).toBeGreaterThan(5);
	});
});
