// Gera os dados do mapa da malha a partir do Natural Earth (domínio público):
//   public/geo/brasil-estados.json      -> GeoJSON dos 27 estados (MapGeoJSON)
//   public/geo/brasil-pais.json         -> GeoJSON do contorno do país (MapGeoJSON, V3)
//   src/components/home/brasil-outline.ts -> paths SVG + projeção (placeholder)
// Fonte: natural-earth-vector v5.1.2, ne_50m_admin_1_states_provinces e
// ne_50m_admin_0_countries.
// Rodar uma vez: `bun scripts/geo/build-brasil.mjs` (saída é commitada).
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SOURCE =
	"https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/ne_50m_admin_1_states_provinces.geojson";
const COUNTRIES_SOURCE =
	"https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/ne_50m_admin_0_countries.geojson";
const SVG_WIDTH = 600;
const DECIMALS = 1;

const root = path.resolve(import.meta.dirname, "../..");
const geoOut = path.join(root, "public/geo/brasil-estados.json");
const paisOut = path.join(root, "public/geo/brasil-pais.json");
const tsOut = path.join(root, "src/components/home/brasil-outline.ts");

const all = await (await fetch(SOURCE)).json();
const states = all.features.filter((f) => f.properties.adm0_a3 === "BRA");
if (states.length !== 27) {
	throw new Error(`esperava 27 estados, veio ${states.length}`);
}

const allCountries = await (await fetch(COUNTRIES_SOURCE)).json();
const brasilPais = allCountries.features.find(
	(f) => f.properties.ADM0_A3 === "BRA"
);
if (!brasilPais) {
	throw new Error("não encontrei o Brasil em ne_50m_admin_0_countries");
}
const paisGeojson = {
	features: [
		{
			geometry: brasilPais.geometry,
			properties: { name: "Brasil" },
			type: "Feature",
		},
	],
	type: "FeatureCollection",
};

const rings = (geometry) =>
	geometry.type === "MultiPolygon"
		? geometry.coordinates.flat()
		: geometry.coordinates;

let west = Number.POSITIVE_INFINITY;
let east = Number.NEGATIVE_INFINITY;
let south = Number.POSITIVE_INFINITY;
let north = Number.NEGATIVE_INFINITY;
for (const f of states) {
	for (const ring of rings(f.geometry)) {
		for (const [lng, lat] of ring) {
			west = Math.min(west, lng);
			east = Math.max(east, lng);
			south = Math.min(south, lat);
			north = Math.max(north, lat);
		}
	}
}

const rad = (deg) => (deg * Math.PI) / 180;
const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2));
const scale = SVG_WIDTH / (rad(east) - rad(west));
const height = (merc(north) - merc(south)) * scale;
const project = (lng, lat) => [
	(rad(lng) - rad(west)) * scale,
	(merc(north) - merc(lat)) * scale,
];

const paths = states.map((f) =>
	rings(f.geometry)
		.map(
			(ring) =>
				`M${ring
					.map(([lng, lat]) =>
						project(lng, lat)
							.map((v) => v.toFixed(DECIMALS))
							.join(" ")
					)
					.join(" L")}Z`
		)
		.join(" ")
);

const geojson = {
	features: states.map((f) => ({
		geometry: f.geometry,
		properties: { name: f.properties.name, sigla: f.properties.postal },
		type: "Feature",
	})),
	type: "FeatureCollection",
};

const ts = `// Gerado por scripts/geo/build-brasil.mjs — não editar à mão.
// Natural Earth v5.1.2 (domínio público), 27 estados, projeção Mercator
// normalizada para um viewBox de ${SVG_WIDTH} de largura.

const WEST = ${west};
const NORTH = ${north};
const SCALE = ${scale};

export const BRASIL_BOUNDS: [[number, number], [number, number]] = [
	[${west}, ${south}],
	[${east}, ${north}],
];

export const BRASIL_VIEWBOX = "0 0 ${SVG_WIDTH} ${height.toFixed(DECIMALS)}";

const rad = (deg: number): number => (deg * Math.PI) / 180;
const merc = (lat: number): number =>
	Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2));

/** Mesma projeção dos paths: converte lng/lat em coordenadas do viewBox. */
export function projectLngLat(lng: number, lat: number): [number, number] {
	return [(rad(lng) - rad(WEST)) * SCALE, (merc(NORTH) - merc(lat)) * SCALE];
}

export const BRASIL_STATE_PATHS: readonly string[] = ${JSON.stringify(paths, null, "\t")};
`;

await mkdir(path.dirname(geoOut), { recursive: true });
await writeFile(geoOut, JSON.stringify(geojson));
await writeFile(paisOut, JSON.stringify(paisGeojson));
await writeFile(tsOut, ts);
console.log(
	`ok: ${states.length} estados, viewBox ${SVG_WIDTH}x${height.toFixed(1)}`
);
