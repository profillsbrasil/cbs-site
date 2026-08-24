import { Mail } from "lucide-react";
import Image from "next/image";

import {
	EMAIL_ADDRESS,
	EMAIL_URL,
	WHATSAPP_NUMBER,
	WHATSAPP_URL,
	WhatsAppIcon,
} from "@/components/contact";

const NAV_LINKS = [
	{ href: "#modelo", label: "Modelo" },
	{ href: "#qualidade", label: "Qualidade" },
	{ href: "#malha", label: "Malha de fábricas" },
] as const;

/**
 * Rodapé-espuma: a página abre numa bolha e fecha num tanque de espuma.
 * O fundo aqua fica ABAIXO do canvas 3D (sem z-index) para as bolhas de
 * vidro da cena aparecerem sobre ele; o conteúdo sobe para z-20, acima do
 * canvas. Os fantasmas CSS seguram o lugar enquanto o WebGL não monta
 * (mesmo contrato `data-scene-ready` do hero).
 */
export function Footer() {
	return (
		<footer className="relative overflow-hidden">
			<div aria-hidden className="foam-bg absolute inset-0" />
			<div aria-hidden className="absolute inset-0" data-s-anchor="espuma" />
			<div
				aria-hidden
				className="foam-placeholder pointer-events-none absolute inset-0"
			>
				<div className="bubble-ghost absolute bottom-[-10%] left-[5%] h-28 w-28" />
				<div className="bubble-ghost absolute bottom-[38%] left-[22%] h-12 w-12" />
				<div className="bubble-ghost absolute bottom-[-16%] left-[44%] h-36 w-36" />
				<div className="bubble-ghost absolute right-[24%] bottom-[30%] h-14 w-14" />
				<div className="bubble-ghost absolute right-[6%] bottom-[-6%] h-20 w-20" />
			</div>
			<div className="relative z-20 mx-auto max-w-6xl px-6 pt-16 pb-7">
				<div className="grid gap-10 sm:grid-cols-[1.3fr_1fr_1.2fr]">
					<div>
						<Image
							alt="CBS — Companhia Brasileira de Saneantes"
							className="h-11 w-auto"
							height={62}
							src="/cbs-logo.png"
							width={128}
						/>
						<p className="mt-4 max-w-xs text-brand-navy/70 text-sm leading-relaxed">
							Terceirização completa de saneantes: você vende, a gente fabrica e
							envia.
						</p>
					</div>
					<nav aria-label="Seções do site">
						<h3 className="font-semibold text-brand-navy/55 text-xs uppercase tracking-[0.12em]">
							Navegue
						</h3>
						<ul className="mt-4 flex flex-col gap-2.5">
							{NAV_LINKS.map((link) => (
								<li key={link.href}>
									<a
										className="font-medium text-brand-navy/80 text-sm transition-colors hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-2"
										href={link.href}
									>
										{link.label}
									</a>
								</li>
							))}
						</ul>
					</nav>
					<div>
						<h3 className="font-semibold text-brand-navy/55 text-xs uppercase tracking-[0.12em]">
							Fale com a CBS
						</h3>
						<div className="mt-4 flex flex-col items-start gap-3">
							<a
								className="inline-flex items-center gap-2.5 rounded-full bg-brand-ink px-6 py-3 font-semibold text-sm text-white shadow-brand-ink/25 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-navy focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-2"
								href={WHATSAPP_URL}
								rel="noopener"
								target="_blank"
							>
								<WhatsAppIcon className="size-4" />
								WhatsApp {WHATSAPP_NUMBER}
								<span className="sr-only"> (abre em nova aba)</span>
							</a>
							<a
								className="inline-flex items-center gap-2.5 rounded-full border border-brand-navy/15 bg-white/70 px-6 py-3 font-semibold text-brand-navy text-sm transition-colors hover:border-brand-ink hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-2"
								href={EMAIL_URL}
							>
								<Mail aria-hidden className="size-4" />
								{EMAIL_ADDRESS}
							</a>
						</div>
					</div>
				</div>
				<div className="mt-14 flex flex-col gap-2 border-brand-navy/10 border-t pt-5 text-brand-navy/60 text-sm sm:flex-row sm:items-center sm:justify-between">
					<p>© 2026 CBS — Companhia Brasileira de Saneantes</p>
					<p>Fabricação de saneantes autorizada pela ANVISA</p>
				</div>
			</div>
		</footer>
	);
}
