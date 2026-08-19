import { ArrowDown, Mail } from "lucide-react";
import Image from "next/image";

import { LiquidPath } from "@/components/home/liquid-path";
import { Reveal, RevealList } from "@/components/home/reveal";
import { Scene3D } from "@/components/home/scene3d";

const WHATSAPP_URL = "https://wa.me/5519996894236";
const EMAIL_URL = "mailto:othavioquiliao@gmail.com";

const PRACAS = [
	"São Paulo",
	"Minas Gerais",
	"Curitiba",
	"Pernambuco",
	"Bahia",
	"Rio Grande do Sul",
	"Centro do Brasil",
];

function WhatsAppIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden
			className={className}
			fill="currentColor"
			viewBox="0 0 24 24"
		>
			<title>WhatsApp</title>
			<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
		</svg>
	);
}

function CtaWhatsApp({ label }: { label: string }) {
	return (
		<a
			className="group inline-flex items-center gap-3 rounded-full bg-brand-navy px-8 py-4 font-semibold text-base text-white shadow-brand-navy/25 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-blue hover:shadow-brand-blue/30 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-2"
			href={WHATSAPP_URL}
			rel="noopener"
			target="_blank"
		>
			<WhatsAppIcon className="size-5 transition-transform duration-200 group-hover:scale-110" />
			{label}
		</a>
	);
}

function CtaEmail() {
	return (
		<a
			className="inline-flex items-center gap-3 rounded-full border border-brand-navy/15 bg-white/60 px-8 py-4 font-semibold text-base text-brand-navy transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-blue hover:text-brand-blue focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-2"
			href={EMAIL_URL}
		>
			<Mail aria-hidden className="size-5" />
			Enviar e-mail
		</a>
	);
}

function Navbar() {
	return (
		<header className="sticky top-0 z-30 border-brand-navy/8 border-b bg-brand-paper/95 shadow-brand-navy/5 shadow-sm">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
				<a aria-label="Voltar ao topo" href="#topo">
					<Image
						alt="CBS — Companhia Brasileira de Saneantes"
						className="h-12 w-auto"
						height={63}
						priority
						src="/cbs-logo.jpeg"
						width={128}
					/>
				</a>
				<a
					className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-5 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-brand-blue focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-2"
					href={WHATSAPP_URL}
					rel="noopener"
					target="_blank"
				>
					<WhatsAppIcon className="size-4" />
					WhatsApp
				</a>
			</div>
		</header>
	);
}

function Hero() {
	return (
		<section
			className="relative mx-auto grid min-h-[calc(100svh-73px)] max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-[1.05fr_1fr]"
			id="topo"
		>
			<div className="mist-hero absolute inset-0" />
			<div className="relative z-20">
				<Reveal>
					<h1 className="max-w-xl font-bold font-display text-6xl text-brand-navy leading-[1.02] tracking-tight sm:text-7xl">
						Sua marca,
						<br />
						<span className="text-brand-blue">nossa fábrica.</span>
					</h1>
				</Reveal>
				<Reveal delay={0.12}>
					<p className="mt-7 max-w-lg text-brand-navy/75 text-xl leading-relaxed">
						A CBS fabrica seus saneantes com autorização ANVISA e envia de
						fábricas ao lado dos centros de distribuição do Mercado Livre. Você
						vende; <strong className="text-brand-navy">o frete despenca</strong>
						.
					</p>
				</Reveal>
				<Reveal delay={0.22}>
					<div className="mt-10 flex flex-wrap items-center gap-4">
						<CtaWhatsApp label="Chamar no WhatsApp" />
						<CtaEmail />
					</div>
				</Reveal>
			</div>
			<div
				className="relative h-[420px] lg:h-[560px]"
				data-s-anchor="hero-cluster"
			>
				<div
					className="absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2"
					data-j-anchor="hero"
				/>
			</div>
			<div className="absolute bottom-8 left-1/2 hidden translate-x-[-50%] items-center gap-2 text-brand-navy/50 text-sm lg:flex">
				<ArrowDown aria-hidden className="scroll-hint-arrow size-4" />
				Role para acompanhar a entrega
			</div>
		</section>
	);
}

function Station({
	anchor,
	children,
	flip = false,
	title,
	variant,
}: {
	anchor: string;
	children: React.ReactNode;
	flip?: boolean;
	title: string;
	variant: "caminhao" | "frasco" | "selo";
}) {
	return (
		<section className="relative mx-auto grid min-h-[80vh] max-w-6xl items-center gap-10 px-6 py-24 lg:grid-cols-2">
			<div
				className="mist-side absolute inset-0"
				style={{ "--mist-x": flip ? "18%" : "82%" } as React.CSSProperties}
			/>
			<div className={`relative z-20 ${flip ? "lg:order-2" : ""}`}>
				<Reveal>
					<h2 className="max-w-md font-bold font-display text-4xl text-brand-navy leading-tight tracking-tight sm:text-5xl">
						{title}
					</h2>
				</Reveal>
				{children}
			</div>
			<div
				className={`relative z-10 flex justify-center ${flip ? "lg:order-1" : ""}`}
			>
				<div
					aria-hidden
					className="h-72 w-72 sm:h-96 sm:w-96"
					data-s-anchor={variant}
				/>
			</div>
			<div
				className={`absolute top-1/2 hidden h-24 w-24 -translate-y-1/2 lg:block ${
					flip ? "left-[44%]" : "left-[58%]"
				}`}
				data-j-anchor={anchor}
			/>
		</section>
	);
}

function Chegada() {
	return (
		<section className="relative mx-auto max-w-6xl px-6 pt-40 pb-16 text-center">
			<div className="mist-final absolute inset-0" />
			<div className="mx-auto h-28 w-28" data-j-anchor="doca" />
			<Reveal>
				<h2 className="relative z-20 mx-auto mt-16 max-w-2xl font-bold font-display text-5xl text-brand-navy leading-tight tracking-tight sm:text-6xl">
					Entregue no CD.
					<br />
					<span className="text-brand-blue">Pronto para vender.</span>
				</h2>
			</Reveal>
			<Reveal delay={0.12}>
				<p className="relative z-20 mx-auto mt-7 max-w-xl text-brand-navy/75 text-xl leading-relaxed">
					Conte o que você quer vender e a CBS devolve o caminho: produto,
					rótulo, produção e envio.
				</p>
			</Reveal>
			<Reveal delay={0.22}>
				<div className="relative z-20 mt-11 flex flex-wrap items-center justify-center gap-4">
					<CtaWhatsApp label="Falar com a CBS" />
					<CtaEmail />
				</div>
			</Reveal>
		</section>
	);
}

function Footer() {
	return (
		<footer className="relative z-20 border-brand-navy/8 border-t bg-white">
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
						className="text-brand-navy/80 transition-colors hover:text-brand-blue"
						href={WHATSAPP_URL}
						rel="noopener"
						target="_blank"
					>
						WhatsApp: +55 19 99689-4236
					</a>
					<a
						className="text-brand-navy/80 transition-colors hover:text-brand-blue"
						href={EMAIL_URL}
					>
						othavioquiliao@gmail.com
					</a>
				</div>
			</div>
		</footer>
	);
}

export default function Home() {
	return (
		<>
			<Navbar />
			<Scene3D />
			<main className="relative overflow-x-clip">
				<LiquidPath />
				<Hero />

				<Station
					anchor="modelo"
					title="Você vende. A gente fabrica e envia."
					variant="frasco"
				>
					<Reveal delay={0.1}>
						<p className="mt-6 max-w-md text-brand-navy/75 text-lg leading-relaxed">
							Terceirização completa de produção: a CBS produz o saneante,
							rotula com a sua marca e despacha direto para o centro de
							distribuição. Seu produto, sua marca, nossa operação.
						</p>
					</Reveal>
				</Station>

				<Station
					anchor="qualidade"
					flip
					title="Qualidade com registro, não com promessa."
					variant="selo"
				>
					<Reveal delay={0.1}>
						<p className="mt-6 max-w-md text-brand-navy/75 text-lg leading-relaxed">
							Produção autorizada pela ANVISA e padrões de qualidade de ponta a
							ponta — da formulação ao lacre da caixa. O rótulo é seu; a
							responsabilidade técnica é nossa.
						</p>
					</Reveal>
				</Station>

				<Station
					anchor="malha"
					title="Fábricas onde o frete nasce menor."
					variant="caminhao"
				>
					<Reveal delay={0.1}>
						<p className="mt-6 max-w-md text-brand-navy/75 text-lg leading-relaxed">
							De 6 a 7 unidades ao lado dos centros de distribuição do Mercado
							Livre. Produzir a poucos quilômetros do CD corta o custo de frete
							de quem vende no ML.
						</p>
					</Reveal>
					<RevealList
						className="mt-7 flex max-w-md flex-wrap gap-2"
						itemClassName="rounded-full bg-brand-mist px-4 py-1.5 font-medium text-brand-navy text-sm"
						items={PRACAS}
					/>
				</Station>

				<Chegada />
			</main>
			<Footer />
		</>
	);
}
