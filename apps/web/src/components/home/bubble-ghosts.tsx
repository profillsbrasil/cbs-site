export type GhostVariant =
	| "hero"
	| "modelo"
	| "qualidade"
	| "malha"
	| "chegada";

interface Ghost {
	/** Classes de posição e tamanho (Tailwind), sempre do lado oposto à bolha-imagem. */
	className: string;
}

/**
 * Posições fixas por seção: 3–5 fantasmas de 14–44px, quase todos à
 * esquerda (a bolha de imagem sangra pela direita); os poucos à direita
 * ficam fora das caixas de texto. Em `lg` o canvas fixo faz esse papel com
 * microbolhas reais, então o componente não renderiza.
 */
const GHOSTS: Record<GhostVariant, Ghost[]> = {
	chegada: [
		{ className: "top-6 left-4 size-7" },
		{ className: "top-24 right-6 size-4" },
		{ className: "bottom-32 left-10 size-3.5" },
	],
	hero: [
		{ className: "top-28 left-5 size-11" },
		{ className: "top-52 left-20 size-5" },
		{ className: "top-20 right-16 size-3.5" },
		{ className: "bottom-40 -left-3 size-9" },
	],
	malha: [
		{ className: "top-10 left-5 size-6" },
		{ className: "top-40 left-16 size-3.5" },
		{ className: "bottom-24 -left-2 size-8" },
	],
	modelo: [
		{ className: "top-8 left-4 size-6" },
		{ className: "top-36 left-16 size-3.5" },
		{ className: "bottom-20 -left-2 size-9" },
		{ className: "bottom-8 right-10 size-4" },
	],
	qualidade: [
		{ className: "top-12 left-6 size-5" },
		{ className: "top-44 left-2 size-8" },
		{ className: "bottom-16 left-24 size-3.5" },
	],
};

export function BubbleGhosts({ variant }: { variant: GhostVariant }) {
	return (
		<div
			aria-hidden
			className="pointer-events-none absolute inset-0 z-0 lg:hidden"
		>
			{GHOSTS[variant].map((ghost) => (
				<span
					className={`bubble-ghost absolute ${ghost.className}`}
					key={ghost.className}
				/>
			))}
		</div>
	);
}
