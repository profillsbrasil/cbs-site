/** Objetos que a rota /render-bolhas sabe renderizar (um asset WebP por item). */
export type BolhaObj = "caixa" | "frasco" | "selo" | "vidro";

export const BOLHA_OBJS: readonly BolhaObj[] = [
	"caixa",
	"frasco",
	"selo",
	"vidro",
];

export function isBolhaObj(value: string | undefined): value is BolhaObj {
	return BOLHA_OBJS.some((obj) => obj === value);
}
