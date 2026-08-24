import { Mail } from "lucide-react";

import { EMAIL_URL, WHATSAPP_URL, WhatsAppIcon } from "@/components/contact";

/**
 * Sistema de botões da marca: pílula navy (WhatsApp) e pílula fantasma
 * (e-mail), com a linha de reasseguramento. Vive fora da página para o
 * rodapé fechar com o mesmo vocabulário do hero e da chegada.
 */
export function CtaWhatsApp({ label }: { label: string }) {
	return (
		<a
			className="group inline-flex items-center gap-3 rounded-full bg-brand-navy px-8 py-4 font-semibold text-base text-white shadow-brand-navy/25 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-ink hover:shadow-brand-ink/30 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-2"
			href={WHATSAPP_URL}
			rel="noopener"
			target="_blank"
		>
			<WhatsAppIcon className="size-5 transition-transform duration-200 group-hover:scale-110" />
			{label}
			<span className="sr-only"> (abre em nova aba)</span>
		</a>
	);
}

/**
 * Linha de reasseguramento sob o par de CTAs: o site não tem formulário nem
 * cadastro, e o clique leva a uma conversa — é o que o visitante precisa
 * saber antes de sair da página.
 */
export function CtaReassurance({ className = "" }: { className?: string }) {
	return (
		<p className={`text-brand-navy/70 text-sm ${className}`}>
			Conversa direta, sem formulário nem cadastro.
		</p>
	);
}

export function CtaEmail() {
	return (
		<a
			className="inline-flex items-center gap-3 rounded-full border border-brand-navy/15 bg-white/60 px-8 py-4 font-semibold text-base text-brand-navy transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-ink hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-2"
			href={EMAIL_URL}
		>
			<Mail aria-hidden className="size-5" />
			Enviar e-mail
		</a>
	);
}
