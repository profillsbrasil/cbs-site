"use client";

import dynamic from "next/dynamic";

import { MapaMalhaPlaceholder } from "./mapa-malha-placeholder";

export const MapaMalhaLazy = dynamic(
	() => import("./mapa-malha").then((m) => m.MapaMalha),
	{ loading: () => <MapaMalhaPlaceholder />, ssr: false }
);
