"use client";

import dynamic from "next/dynamic";

/**
 * A cena WebGL (three.js + R3F + drei + texturas) entra fora do bundle
 * inicial: o HTML pinta com o `HeroPlaceholder` em CSS e o vidro faz
 * cross-fade quando a cena marca `data-scene-ready`. Sem SSR — o canvas
 * não tem representação no servidor.
 */
export const Scene3DLazy = dynamic(
	() => import("./scene3d").then((m) => m.Scene3D),
	{ ssr: false }
);
