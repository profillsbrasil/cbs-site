import { Vector3 } from "three";

/**
 * Canal fora do React (mesmo padrão de journey-progress.ts): a posição
 * mundial da caixa viajante, publicada pela `JourneyBox` a cada frame e lida
 * pelas vinhetas de estação para reagir à proximidade — sem re-render, sem
 * prop drilling, sem alocação por frame (os leitores só chamam `.copy`/
 * `.distanceTo` sobre este singleton).
 */
export const boxWorldPosition = new Vector3();

/**
 * Se a caixa está presente na cena neste frame. Falso enquanto as âncoras
 * ainda não resolveram — evita que uma bolha de estação reaja a uma posição
 * desatualizada (ex.: (0,0,0) antes do primeiro frame válido).
 */
export const boxActive: { current: boolean } = { current: false };
