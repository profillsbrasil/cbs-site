"use client";

// Importar ANTES de "@cbs-site/ui/components/map" — o mapcn só aponta o
// worker do MapLibre para unpkg.com se getWorkerUrl() ainda estiver vazio.
// Setando aqui primeiro, servimos o worker vendorizado da própria origem
// (ver apps/web/scripts/vendor-maplibre.mjs) e o unpkg nunca é chamado.
import { getWorkerUrl, setWorkerUrl } from "maplibre-gl";

if (typeof window !== "undefined" && !getWorkerUrl()) {
	setWorkerUrl("/vendor/maplibre-gl/maplibre-gl-worker.mjs");
}
