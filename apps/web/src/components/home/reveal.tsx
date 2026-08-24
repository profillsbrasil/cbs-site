"use client";

import { motion, useReducedMotion } from "motion/react";

import { BRAND_EASE } from "./motion-tokens";

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
			initial={{
				opacity: 0,
				transform: reduced ? "translateY(0px)" : "translateY(24px)",
			}}
			transition={{ delay, duration: 0.45, ease: BRAND_EASE }}
			viewport={{ margin: "-40px", once: true }}
			whileInView={{ opacity: 1, transform: "translateY(0px)" }}
		>
			{children}
		</motion.div>
	);
}

export interface RevealGroup {
	items: string[];
	label: string;
}

/**
 * Lista agrupada com rótulo por linha (as praças por região): o stagger
 * corre por toda a sequência de chips, grupo a grupo.
 */
export function RevealGroups({
	className,
	groups,
	itemClassName,
	labelClassName,
}: {
	className?: string;
	groups: RevealGroup[];
	itemClassName?: string;
	labelClassName?: string;
}) {
	const reduced = useReducedMotion();
	return (
		<motion.dl
			className={className}
			initial="hidden"
			transition={{ staggerChildren: 0.06 }}
			viewport={{ margin: "-40px", once: true }}
			whileInView="shown"
		>
			{groups.map((group) => (
				<div className="flex flex-wrap items-center gap-2" key={group.label}>
					<motion.dt
						className={labelClassName}
						transition={{ duration: 0.45, ease: BRAND_EASE }}
						variants={{
							hidden: { opacity: 0 },
							shown: { opacity: 1 },
						}}
					>
						{group.label}
					</motion.dt>
					{group.items.map((item) => (
						<motion.dd
							className={itemClassName}
							key={item}
							transition={{ duration: 0.45, ease: BRAND_EASE }}
							variants={{
								hidden: {
									opacity: 0,
									transform: reduced ? "translateY(0px)" : "translateY(14px)",
								},
								shown: { opacity: 1, transform: "translateY(0px)" },
							}}
						>
							{item}
						</motion.dd>
					))}
				</div>
			))}
		</motion.dl>
	);
}
