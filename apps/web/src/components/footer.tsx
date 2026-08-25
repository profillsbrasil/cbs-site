import { EMAIL_ADDRESS, EMAIL_URL } from "@/components/contact";
import { CtaEmail, CtaWhatsApp } from "@/components/cta";

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
 * o conteúdo sobe para z-20. O asfalto da doca é a única divisa: o rodapé
 * só respira abaixo dele, sem fio nem faixa própria.
 */
export function Footer() {
	return (
		<footer className="relative">
			<div className="relative z-20 mx-auto max-w-6xl px-6 pt-20 pb-8">
				<div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-center">
					<div>
						<a
							aria-label="Voltar ao topo"
							className="inline-block rounded-full font-bold font-display text-7xl text-brand-navy leading-[0.9] tracking-[-0.03em] focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-8 sm:text-8xl"
							href="#topo"
						>
							C<span className="text-brand-blue">B</span>S
						</a>
						<p className="mt-6 max-w-md text-base text-brand-navy/75 leading-relaxed">
							Companhia Brasileira de Saneantes. Terceirização de produção de
							saneantes, com fábricas junto aos CDs do Mercado Livre.
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-4 lg:justify-end">
						<CtaWhatsApp label="Falar com a CBS" />
						<CtaEmail />
					</div>
				</div>
				<div className="mt-14 flex flex-col gap-4 border-brand-navy/10 border-t pt-5 text-brand-navy/70 text-sm sm:flex-row sm:items-center sm:justify-between">
					<p className="flex flex-wrap items-center gap-x-1.5">
						<span>© 2026 CBS · Companhia Brasileira de Saneantes ·</span>
						<a
							className="-my-3 inline-flex min-h-11 items-center underline decoration-brand-navy/30 underline-offset-4 transition-colors hover:text-brand-ink hover:decoration-brand-ink focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-2"
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
