"use client";

import { MotionConfig } from "motion/react";

/**
 * Envolve a árvore em MotionConfig com reducedMotion="user": respeita o
 * prefers-reduced-motion do sistema em toda animação do motion/react, sem
 * cada componente ter que checar useReducedMotion na mão.
 */
export function AppMotionConfig({ children }: { children: React.ReactNode }) {
	return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
