"use client";

import { useTexture } from "@react-three/drei";
import { SRGBColorSpace } from "three";

// Rasterizada de public/warehouse-delivery.svg (asset original preservado);
// aparada, a arte fica em 1296x661 — o plano segue essa proporção.
const TEXTURE_URL = "/textures/warehouse-delivery.png";
const LARGURA = 2.7;
const ALTURA = LARGURA * (661 / 1296);

useTexture.preload(TEXTURE_URL);

/**
 * A fábrica da estação "malha" como ilustração isométrica (galpão, caminhão
 * e trem de contêineres) num plano dentro da bolha — substitui o modelo 3D
 * `Fabrica`, que fica preservado em fabrica.tsx para uso futuro.
 */
export function FabricaIlustrada() {
	const map = useTexture(TEXTURE_URL, (texture) => {
		texture.colorSpace = SRGBColorSpace;
		texture.anisotropy = 4;
	});
	return (
		<mesh>
			<planeGeometry args={[LARGURA, ALTURA]} />
			{/* Passe opaco + alphaTest: transparente de verdade perderia o teste
			    de profundidade contra o vidro da bolha (que escreve depth). */}
			<meshBasicMaterial alphaTest={0.5} map={map} toneMapped={false} />
		</mesh>
	);
}
