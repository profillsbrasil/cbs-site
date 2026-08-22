/**
 * As praças da malha, exatamente como o cliente informou (cidade ou estado).
 * Fonte única para os chips da estação e para os pontos do mapa.
 *
 * As coordenadas são a capital/cidade de referência de cada praça — servem
 * para posicionar o ponto no mapa e NÃO representam endereço de fábrica.
 */
export type Regiao = "Sudeste" | "Sul" | "Nordeste" | "Centro-Oeste";

export interface Praca {
	/** [longitude, latitude] em graus. */
	lngLat: readonly [number, number];
	nome: string;
	regiao: Regiao;
}

export const PRACAS: readonly Praca[] = [
	{ lngLat: [-46.63, -23.55], nome: "São Paulo", regiao: "Sudeste" },
	{ lngLat: [-43.94, -19.92], nome: "Minas Gerais", regiao: "Sudeste" },
	{ lngLat: [-49.27, -25.43], nome: "Curitiba", regiao: "Sul" },
	{ lngLat: [-51.23, -30.03], nome: "Rio Grande do Sul", regiao: "Sul" },
	{ lngLat: [-34.88, -8.05], nome: "Pernambuco", regiao: "Nordeste" },
	{ lngLat: [-38.51, -12.97], nome: "Bahia", regiao: "Nordeste" },
	{
		lngLat: [-47.93, -15.78],
		nome: "Centro do Brasil",
		regiao: "Centro-Oeste",
	},
];

const ORDEM_REGIOES: readonly Regiao[] = [
	"Sudeste",
	"Sul",
	"Nordeste",
	"Centro-Oeste",
];

/** Grupos no formato que `RevealGroups` consome (rótulo + chips). */
export function pracasPorRegiao(): { label: string; items: string[] }[] {
	return ORDEM_REGIOES.map((regiao) => ({
		items: PRACAS.filter((p) => p.regiao === regiao).map((p) => p.nome),
		label: regiao,
	}));
}
