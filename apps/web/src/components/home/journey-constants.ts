/**
 * Constantes da jornada lidas pelo DOM (caminho líquido, mapa, título da
 * Chegada). Vivem fora de scene3d.tsx para que quem só precisa delas não
 * puxe three.js/R3F para o bundle principal — a cena entra por `dynamic()`.
 */
export const JOURNEY_ANCHORS = [
	"hero",
	"modelo",
	"qualidade",
	"malha",
	"chegada",
	"doca",
] as const;

/** Fim da entrega: a caixa está dentro do baú. O título da Chegada lê isto. */
export const DOCK_HANDOFF_END = 0.985;
