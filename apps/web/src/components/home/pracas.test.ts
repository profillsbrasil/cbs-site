import { describe, expect, test } from "bun:test";

import { BRASIL_BOUNDS } from "./brasil-outline";
import { PRACAS, pracasPorRegiao } from "./pracas";

describe("pracas", () => {
	test("são as 7 praças do cliente", () => {
		expect(PRACAS.map((p) => p.nome)).toEqual([
			"São Paulo",
			"Minas Gerais",
			"Curitiba",
			"Rio Grande do Sul",
			"Pernambuco",
			"Bahia",
			"Centro do Brasil",
		]);
	});

	test("toda coordenada cai dentro do Brasil", () => {
		const [[west, south], [east, north]] = BRASIL_BOUNDS;
		for (const { lngLat } of PRACAS) {
			expect(lngLat[0]).toBeGreaterThan(west);
			expect(lngLat[0]).toBeLessThan(east);
			expect(lngLat[1]).toBeGreaterThan(south);
			expect(lngLat[1]).toBeLessThan(north);
		}
	});

	test("agrupa em 4 regiões na ordem Sudeste, Sul, Nordeste, Centro-Oeste", () => {
		const grupos = pracasPorRegiao();
		expect(grupos.map((g) => g.label)).toEqual([
			"Sudeste",
			"Sul",
			"Nordeste",
			"Centro-Oeste",
		]);
		expect(grupos.flatMap((g) => g.items)).toHaveLength(7);
	});
});
