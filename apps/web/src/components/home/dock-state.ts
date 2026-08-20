import { Vector3 } from "three";

/**
 * Canal fora do React (mesmo padrão de box-position.ts): a posição mundial
 * atual do ponto de entrega dentro do caminhão da doca (`CaminhaoParts.cargoTarget`
 * convertido via `body.localToWorld`), publicada pela `DocaFinal` a cada
 * quadro e lida pela `JourneyBox` para desviar o pouso final da caixa para
 * dentro do baú — sem que os dois componentes se conheçam.
 */
export const dockCargoWorld = new Vector3();

/**
 * Se o caminhão da doca já publicou `dockCargoWorld` neste quadro (as partes
 * só existem depois do primeiro `useEffect` de `CaminhaoEntrega`). Mesmo
 * padrão de `boxActive`: evita a caixa mirar em (0,0,0) antes da hora.
 */
export const dockReady: { current: boolean } = { current: false };
