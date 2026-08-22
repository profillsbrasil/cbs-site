#!/usr/bin/env bun

/**
 * Vendoriza o worker do MapLibre GL (dist/maplibre-gl-worker.mjs +
 * dist/maplibre-gl-shared.mjs, importado por ele via caminho relativo) para
 * apps/web/public/vendor/maplibre-gl/, servido pela própria origem do app.
 *
 * Por quê: o mapcn (@cbs-site/ui/components/map) chama
 * MapLibreGL.setWorkerUrl("https://unpkg.com/...") no load do módulo se
 * nenhuma worker URL já tiver sido configurada. Isso é uma chamada externa
 * incondicional em runtime — mesmo com <Map blank>, o Style do MapLibre cria
 * o Dispatcher/Worker. apps/web/src/components/home/maplibre-worker.ts seta
 * a worker URL para "/vendor/maplibre-gl/maplibre-gl-worker.mjs" ANTES do
 * mapcn ser importado, então o unpkg nunca é usado.
 *
 * MapLibre GL JS é distribuído sob licença BSD-3-Clause
 * (https://github.com/maplibre/maplibre-gl-js/blob/main/LICENSE.txt); os
 * arquivos copiados aqui não são modificados.
 */

import { copyFile, mkdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageJsonUrl = import.meta.resolve("maplibre-gl/package.json");
const packageDir = dirname(fileURLToPath(packageJsonUrl));
const distDir = join(packageDir, "dist");

const outDir = join(
	import.meta.dirname,
	"..",
	"public",
	"vendor",
	"maplibre-gl"
);

const files = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"];

await mkdir(outDir, { recursive: true });

const results = await Promise.all(
	files.map(async (file) => {
		const src = join(distDir, file);
		const dest = join(outDir, file);
		await copyFile(src, dest);
		const { size } = await stat(dest);
		return { dest, file, size };
	})
);

for (const { file, dest, size } of results) {
	console.log(`vendor-maplibre: ${file} -> ${dest} (${size} bytes)`);
}
