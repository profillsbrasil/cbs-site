"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { WHATSAPP_URL, WhatsAppIcon } from "@/components/contact";

const SECTIONS = [
	{ id: "modelo", label: "Modelo" },
	{ id: "qualidade", label: "Qualidade" },
	{ id: "malha", label: "Fábricas" },
] as const;

/** Rolagem a partir da qual a barra condensa em cápsula. */
const SCROLL_THRESHOLD = 32;
const CAPSULE_EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Navbar-cápsula: no topo é uma barra transparente fundida ao hero; ao
 * rolar, condensa numa cápsula de vidro flutuante — o mesmo vocabulário das
 * bolhas da cena 3D. A gota aqua (layoutId) desliza entre os links seguindo
 * a seção visível, e microbolhas CSS sobem dentro do vidro.
 */
export function Navbar() {
	const [scrolled, setScrolled] = useState(false);
	const [active, setActive] = useState<string | null>(null);
	const reduced = useReducedMotion();

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		// Scroll-spy: a seção que cruza a faixa central da tela acende o link.
		const sections = SECTIONS.map((section) =>
			document.getElementById(section.id)
		).filter((el): el is HTMLElement => el !== null);
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const { id } = entry.target;
					if (entry.isIntersecting) {
						setActive(id);
					} else {
						setActive((prev) => (prev === id ? null : prev));
					}
				}
			},
			{ rootMargin: "-45% 0px -45% 0px" }
		);
		for (const el of sections) {
			observer.observe(el);
		}
		return () => observer.disconnect();
	}, []);

	const layoutTransition = reduced
		? { duration: 0 }
		: { duration: 0.5, ease: CAPSULE_EASE };
	const gotaTransition = reduced
		? { duration: 0 }
		: { bounce: 0.2, duration: 0.5, type: "spring" as const };

	return (
		<div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center">
			<motion.header
				className={
					scrolled
						? "pointer-events-auto relative mt-3 flex items-center gap-6 overflow-hidden rounded-full border border-brand-blue/25 bg-white/65 py-2 pr-2.5 pl-5 shadow-[0_12px_30px_rgb(15_28_43/0.10),inset_0_1px_0_rgb(255_255_255/0.95),inset_0_-8px_16px_rgb(168_224_240/0.28)] backdrop-blur-md"
						: "pointer-events-auto relative flex w-full max-w-6xl items-center justify-between px-6 py-3"
				}
				layout
				transition={layoutTransition}
			>
				{scrolled ? (
					<>
						<span aria-hidden className="nav-bub" />
						<span aria-hidden className="nav-bub" />
						<span aria-hidden className="nav-bub" />
					</>
				) : null}
				<motion.a aria-label="Voltar ao topo" href="#topo" layout>
					<Image
						alt="CBS, Companhia Brasileira de Saneantes"
						className={scrolled ? "h-9 w-auto" : "h-12 w-auto"}
						height={62}
						priority
						src="/cbs-logo.png"
						width={128}
					/>
				</motion.a>
				<motion.nav
					aria-label="Seções da página"
					className="hidden items-center md:flex"
					layout
				>
					{SECTIONS.map((section) => (
						<a
							className="relative rounded-full px-4 py-1.5 font-semibold text-brand-navy/70 text-sm transition-colors hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-2"
							href={`#${section.id}`}
							key={section.id}
						>
							{active === section.id ? (
								<motion.span
									aria-hidden
									className="absolute inset-0 rounded-full bg-gradient-to-b from-brand-mist to-brand-aqua"
									layoutId="nav-gota"
									transition={gotaTransition}
								/>
							) : null}
							<span className="relative">{section.label}</span>
						</a>
					))}
				</motion.nav>
				<motion.a
					className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-5 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-brand-ink focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-2"
					href={WHATSAPP_URL}
					layout
					rel="noopener"
					target="_blank"
				>
					<WhatsAppIcon className="size-4" />
					WhatsApp
					<span className="sr-only"> (abre em nova aba)</span>
				</motion.a>
			</motion.header>
		</div>
	);
}
