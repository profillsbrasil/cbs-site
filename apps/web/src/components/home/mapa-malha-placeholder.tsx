import { cn } from "@cbs-site/ui/lib/utils";

import {
	BRASIL_STATE_PATHS,
	BRASIL_VIEWBOX,
	projectLngLat,
} from "./brasil-outline";
import { PRACAS } from "./pracas";

/**
 * O Brasil em tinta, sem WebGL: mesmo contorno e mesmos pontos do mapa
 * mapcn, para ocupar o lugar enquanto o MapLibre carrega e para ficar no
 * lugar dele se o WebGL não montar. Server component — sai no HTML.
 */
export function MapaMalhaPlaceholder({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden
			className={cn("malha-svg h-full w-full", className)}
			viewBox={BRASIL_VIEWBOX}
		>
			<title>Mapa do Brasil com as praças da malha</title>
			<g className="malha-svg-states">
				{BRASIL_STATE_PATHS.map((d) => (
					<path d={d} key={d.slice(0, 24)} />
				))}
			</g>
			<g className="malha-svg-pracas">
				{PRACAS.map(({ nome, lngLat }) => {
					const [x, y] = projectLngLat(lngLat[0], lngLat[1]);
					return (
						<g className="praca-dot" key={nome}>
							<circle className="praca-dot-halo" cx={x} cy={y} r={14} />
							<circle className="praca-dot-core" cx={x} cy={y} r={6} />
						</g>
					);
				})}
			</g>
		</svg>
	);
}
