"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * Entrada padrão das seções: sobe 24px e aparece, uma vez, quando entra na
 * tela. Com reduced-motion vira só um fade curto.
 */
export function Reveal({
	children,
	className,
	delay = 0,
}: {
	children: React.ReactNode;
	className?: string;
	delay?: number;
}) {
	const reduced = useReducedMotion();
	return (
		<motion.div
			className={className}
			initial={{ opacity: 0, y: reduced ? 0 : 24 }}
			transition={{ delay, duration: 0.55, ease: EASE_OUT }}
			viewport={{ margin: "-80px", once: true }}
			whileInView={{ opacity: 1, y: 0 }}
		>
			{children}
		</motion.div>
	);
}

/**
 * Lista com stagger: cada item entra 60ms depois do anterior. Para os
 * chips das praças e afins.
 */
export function RevealList({
	className,
	itemClassName,
	items,
}: {
	className?: string;
	itemClassName?: string;
	items: string[];
}) {
	const reduced = useReducedMotion();
	return (
		<motion.ul
			className={className}
			initial="hidden"
			transition={{ staggerChildren: 0.06 }}
			viewport={{ margin: "-80px", once: true }}
			whileInView="shown"
		>
			{items.map((item) => (
				<motion.li
					className={itemClassName}
					key={item}
					transition={{ duration: 0.45, ease: EASE_OUT }}
					variants={{
						hidden: { opacity: 0, y: reduced ? 0 : 14 },
						shown: { opacity: 1, y: 0 },
					}}
				>
					{item}
				</motion.li>
			))}
		</motion.ul>
	);
}
