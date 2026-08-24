import {
	EMAIL_ADDRESS,
	EMAIL_URL,
	WHATSAPP_NUMBER,
	WHATSAPP_URL,
} from "@/components/contact";

/** Rodapé original: faixa branca simples com nome, ANVISA e contatos. */
export function Footer() {
	return (
		<footer className="relative z-20 bg-white">
			<div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-12 text-center sm:flex-row sm:justify-between sm:text-left">
				<div>
					<p className="font-bold font-display text-brand-navy text-lg">
						CBS — Companhia Brasileira de Saneantes
					</p>
					<p className="mt-1 text-brand-navy/60 text-sm">
						Fabricação de saneantes autorizada pela ANVISA.
					</p>
				</div>
				<div className="flex flex-col gap-1 text-sm">
					<a
						className="text-brand-navy/80 transition-colors hover:text-brand-ink"
						href={WHATSAPP_URL}
						rel="noopener"
						target="_blank"
					>
						WhatsApp: {WHATSAPP_NUMBER}
					</a>
					<a
						className="text-brand-navy/80 transition-colors hover:text-brand-ink"
						href={EMAIL_URL}
					>
						{EMAIL_ADDRESS}
					</a>
				</div>
			</div>
		</footer>
	);
}
