import {
	WHATSAPP_NUMBER,
	WHATSAPP_URL,
	WhatsAppIcon,
} from "@/components/contact";

const LINK =
	"inline-flex min-h-11 items-center gap-2 underline decoration-brand-navy/30 underline-offset-4 transition-colors hover:text-brand-ink hover:decoration-brand-ink focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-2";

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
 * nome da marca na mesma escala. Sem CTAs — a Chegada, logo acima, já fechou
 * com o par de botões; aqui o contato é informação (links de texto de 44px).
 * O `<footer>` fica sem z-index para as microbolhas do canvas fixo (z-10)
 * atravessarem até o fim da página; só o conteúdo sobe para z-20. O asfalto
 * da doca é a única divisa: o rodapé só respira abaixo dele, sem fio nem
 * faixa própria.
 */
export function Footer() {
	return (
		<footer className="relative">
			<div className="relative z-20 mx-auto max-w-6xl px-6 pt-10 pb-8 sm:pt-16">
				<a
					aria-label="Voltar ao topo"
					className="inline-block rounded-full font-bold font-display text-6xl text-brand-navy leading-[0.9] tracking-[-0.03em] focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-8 sm:text-8xl"
					href="#topo"
				>
					C<span className="text-brand-blue">B</span>S
				</a>
				<p className="mt-5 max-w-md text-base text-brand-navy/75 leading-relaxed sm:mt-6">
					Companhia Brasileira de Saneantes. Terceirização de produção de
					saneantes, com fábricas junto aos CDs do Mercado Livre.
				</p>
				<div className="mt-8 flex flex-col gap-4 border-brand-navy/10 border-t pt-5 text-brand-navy/70 text-sm sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
						<span className="inline-flex min-h-11 items-center">
							© 2026 CBS · Companhia Brasileira de Saneantes
						</span>
						<a
							className={LINK}
							href={WHATSAPP_URL}
							rel="noopener"
							target="_blank"
						>
							<WhatsAppIcon className="size-4" />
							{WHATSAPP_NUMBER}
							<span className="sr-only"> (abre em nova aba)</span>
						</a>
					</div>
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
