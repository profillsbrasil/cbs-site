import { ArrowUp } from "lucide-react";

import { EMAIL_ADDRESS, EMAIL_URL } from "@/components/contact";
import { CtaEmail, CtaReassurance, CtaWhatsApp } from "@/components/cta";

const NAV_LINKS = [
	{ href: "#modelo", label: "Modelo" },
	{ href: "#qualidade", label: "Qualidade" },
	{ href: "#malha", label: "Malha de fábricas" },
] as const;

const NAV_LINK_CLASS =
	"font-medium text-brand-navy/80 text-sm transition-colors hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-2";

/**
 * Selo de autorização: anel pontilhado com visto — o mesmo vocabulário do
 * selo 3D da estação Qualidade, agora como carimbo da credencial ANVISA.
 */
function SeloAnvisa({ className }: { className?: string }) {
	return (
		<svg aria-hidden className={className} fill="none" viewBox="0 0 36 36">
			<title>Selo ANVISA</title>
			<circle
				cx="18"
				cy="18"
				fill="var(--color-brand-mist)"
				r="15"
				stroke="var(--color-brand-blue)"
				strokeWidth="1.6"
			/>
			<circle
				cx="18"
				cy="18"
				r="11.5"
				stroke="var(--color-brand-blue)"
				strokeDasharray="2.4 2.6"
				strokeWidth="1.1"
			/>
			<path
				d="M12.5 18.5l3.6 3.4 7-7.6"
				stroke="var(--color-brand-navy)"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2.2"
			/>
		</svg>
	);
}

/**
 * Rodapé-wordmark: a página abre com Sora gigante no hero e fecha com o
 * nome da marca na mesma escala. O `<footer>` fica sem z-index para as
 * microbolhas do canvas fixo (z-10) atravessarem até o fim da página; só
 * o conteúdo sobe para z-20. A fita aqua do asfalto continua como fio
 * divisor (`.road-thread`), emendando o quase-preto da doca ao branco.
 */
export function Footer() {
	return (
		<footer className="relative">
			<div aria-hidden className="road-thread" />
			<div className="relative z-20 mx-auto max-w-6xl px-6 pt-16 pb-8">
				<div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-end">
					<div>
						<a
							aria-label="Voltar ao topo"
							className="inline-block rounded-full font-bold font-display text-7xl text-brand-navy leading-[0.9] tracking-[-0.03em] focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-8 sm:text-8xl"
							href="#topo"
						>
							C<span className="text-brand-blue">B</span>S
						</a>
						<p className="mt-6 max-w-md text-base text-brand-navy/75 leading-relaxed">
							Companhia Brasileira de Saneantes. Sua marca, nossa fábrica —
							produzida ao lado do centro de distribuição do Mercado Livre.
						</p>
					</div>
					<div className="lg:text-right">
						<div className="flex flex-wrap items-center gap-4 lg:justify-end">
							<CtaWhatsApp label="Falar com a CBS" />
							<CtaEmail />
						</div>
						<CtaReassurance className="mt-4" />
						<nav
							aria-label="Seções do site"
							className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 lg:justify-end"
						>
							{NAV_LINKS.map((link) => (
								<a className={NAV_LINK_CLASS} href={link.href} key={link.href}>
									{link.label}
								</a>
							))}
							<a
								className={`${NAV_LINK_CLASS} inline-flex items-center gap-1.5 text-brand-ink`}
								href="#topo"
							>
								<ArrowUp aria-hidden className="size-3.5" />
								Topo
							</a>
						</nav>
					</div>
				</div>
				<div className="mt-14 flex flex-col gap-4 border-brand-navy/10 border-t pt-5 text-brand-navy/70 text-sm sm:flex-row sm:items-center sm:justify-between">
					<p>
						© 2026 CBS — Companhia Brasileira de Saneantes ·{" "}
						<a
							className="transition-colors hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-2"
							href={EMAIL_URL}
						>
							{EMAIL_ADDRESS}
						</a>
					</p>
					<p className="flex items-center gap-3">
						<SeloAnvisa className="size-9 shrink-0" />
						<span>
							<span className="block font-semibold text-brand-navy">
								Autorizada pela ANVISA
							</span>
							<span className="block text-brand-navy/70 text-xs">
								Fabricação de saneantes
							</span>
						</span>
					</p>
				</div>
			</div>
		</footer>
	);
}
