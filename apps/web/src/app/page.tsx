import { ArrowDown, Mail } from "lucide-react";

import { EMAIL_URL, WHATSAPP_URL, WhatsAppIcon } from "@/components/contact";
import { Footer } from "@/components/footer";
import { LiquidPath } from "@/components/home/liquid-path";
import { MapaMalhaLazy } from "@/components/home/mapa-malha-lazy";
import { pracasPorRegiao } from "@/components/home/pracas";
import { Reveal, RevealGroups } from "@/components/home/reveal";
import { Scene3D } from "@/components/home/scene3d";
import { Navbar } from "@/components/navbar";

function CtaWhatsApp({ label }: { label: string }) {
	return (
		<a
			className="group inline-flex items-center gap-3 rounded-full bg-brand-navy px-8 py-4 font-semibold text-base text-white shadow-brand-navy/25 shadow-lg transition-[transform,background-color,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:bg-brand-ink hover:shadow-brand-ink/30 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-2 active:scale-[0.97] active:duration-100 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
			href={WHATSAPP_URL}
			rel="noopener"
			target="_blank"
		>
			<WhatsAppIcon className="size-5 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110" />
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
function CtaReassurance({ className = "" }: { className?: string }) {
	return (
		<p className={`text-brand-navy/70 text-sm ${className}`}>
			Conversa direta, sem formulário nem cadastro.
		</p>
	);
}

function CtaEmail() {
	return (
		<a
			className="inline-flex items-center gap-3 rounded-full border border-brand-navy/15 bg-white/60 px-8 py-4 font-semibold text-base text-brand-navy transition-[transform,border-color,color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:border-brand-ink hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-2 active:scale-[0.97] active:duration-100 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
			href={EMAIL_URL}
		>
			<Mail aria-hidden className="size-5" />
			Enviar e-mail
		</a>
	);
}

/**
 * Silhueta CSS do aglomerado de bolhas, na mesma geometria da cena 3D
 * (bolha principal com 74% da altura, três satélites). Ocupa o lugar do
 * vidro enquanto o WebGL carrega e some via `html[data-scene-ready]`; se o
 * WebGL nunca montar, fica como versão estática em vez de um vazio.
 */
function HeroPlaceholder() {
	return (
		<div
			aria-hidden
			className="hero-placeholder pointer-events-none absolute inset-0 flex items-center justify-center"
		>
			<div className="relative aspect-square h-full">
				<div className="bubble-ghost absolute top-[11%] left-[13%] size-[74%]" />
				<div className="bubble-ghost absolute top-[19%] left-[-3%] size-[10%]" />
				<div className="bubble-ghost absolute top-[61%] left-[69%] size-[7%]" />
				<div className="bubble-ghost absolute top-[59%] left-[29%] size-[4.5%]" />
			</div>
		</div>
	);
}

function Hero() {
	return (
		<section
			className="relative mx-auto grid min-h-[100svh] max-w-6xl items-center gap-10 px-6 pt-28 pb-16 lg:grid-cols-[1.05fr_1fr]"
			id="topo"
		>
			<div className="mist-hero absolute inset-y-0 left-1/2 w-screen -translate-x-1/2" />
			<div className="relative z-20">
				<div className="rise">
					<h1 className="max-w-xl font-bold font-display text-5xl text-brand-navy leading-[1.02] tracking-tight sm:text-7xl">
						Sua marca,
						<br />
						<span className="text-brand-ink">nossa fábrica.</span>
					</h1>
				</div>
				<div
					className="rise"
					style={{ "--rise-delay": "120ms" } as React.CSSProperties}
				>
					<p className="mt-7 max-w-lg text-brand-navy/75 text-xl leading-relaxed">
						A CBS fabrica seus saneantes com autorização ANVISA e envia de
						fábricas ao lado dos centros de distribuição do Mercado Livre. Você
						vende; <strong className="text-brand-navy">o frete despenca</strong>
						.
					</p>
				</div>
				<div
					className="rise"
					style={{ "--rise-delay": "220ms" } as React.CSSProperties}
				>
					<div className="mt-10 flex flex-wrap items-center gap-4">
						<CtaWhatsApp label="Chamar no WhatsApp" />
						<CtaEmail />
					</div>
					<CtaReassurance className="mt-4" />
				</div>
			</div>
			<div
				className="relative h-[420px] lg:h-[560px]"
				data-s-anchor="hero-cluster"
			>
				<HeroPlaceholder />
				<div
					className="absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2"
					data-j-anchor="hero"
				/>
			</div>
			<div className="absolute bottom-8 left-1/2 hidden translate-x-[-50%] items-center gap-2 text-brand-navy/70 text-sm lg:flex">
				<ArrowDown aria-hidden className="scroll-hint-arrow size-4" />
				Role para acompanhar a entrega
			</div>
		</section>
	);
}

/**
 * Slot do objeto 3D de uma estação. Na "fabrica", a ilustração animada
 * (SVG com SMIL — caminhão e trem em loop) vive aqui no DOM, atrás do
 * canvas: o vidro da bolha é pintado por cima e ela fica "dentro" da bolha
 * sem perder a animação (uma textura WebGL a congelaria).
 */
function StationSlot({ variant }: { variant: string }) {
	return (
		<div className="absolute inset-0" data-s-anchor={variant}>
			{variant === "fabrica" ? (
				/* <object> e não <img>: o Chrome congela SMIL em contexto de
				   imagem; como documento embutido a animação roda. */
				<object
					aria-hidden
					className="pointer-events-none absolute top-1/2 left-1/2 w-[135%] max-w-none -translate-x-1/2 -translate-y-[54%] contrast-[1.06] saturate-[1.4]"
					data="/warehouse-delivery.svg"
					title=""
					type="image/svg+xml"
				/>
			) : null}
		</div>
	);
}

function Station({
	anchor,
	backdrop,
	children,
	flip = false,
	title,
	variant,
}: {
	anchor: string;
	/** Camada atrás do objeto 3D (ex.: o mapa da malha). Substitui a névoa. */
	backdrop?: React.ReactNode;
	children: React.ReactNode;
	flip?: boolean;
	title: string;
	variant: "fabrica" | "frasco" | "selo";
}) {
	const hasBackdrop = Boolean(backdrop);
	return (
		<section
			className="relative mx-auto grid min-h-[80vh] max-w-6xl scroll-mt-24 items-center gap-10 px-6 py-24 lg:grid-cols-2"
			id={anchor}
		>
			{hasBackdrop ? null : (
				<div
					className="mist-side absolute inset-y-0 left-1/2 w-screen -translate-x-1/2"
					style={{ "--mist-x": flip ? "18%" : "82%" } as React.CSSProperties}
				/>
			)}
			<div className={`relative z-20 ${flip ? "lg:order-2" : ""}`}>
				<Reveal>
					<h2 className="max-w-md font-bold font-display text-4xl text-brand-navy leading-tight tracking-tight sm:text-5xl">
						{title}
					</h2>
				</Reveal>
				{children}
			</div>
			{hasBackdrop ? (
				/* Composição D2: mapa no alto-direita, bolha em baixo-esquerda —
				   a diagonal do rio líquido. Abaixo de lg empilha. */
				<div className="relative z-10 flex min-h-[520px] flex-col items-center gap-6 lg:block">
					<div className="relative h-72 w-72 lg:absolute lg:top-0 lg:right-0 lg:h-[380px] lg:w-[380px]">
						{backdrop}
					</div>
					<div
						aria-hidden
						className="relative h-72 w-72 lg:absolute lg:bottom-0 lg:left-0 lg:h-80 lg:w-80"
					>
						<StationSlot variant={variant} />
						<div
							className="absolute top-full -right-10 hidden h-24 w-24 -translate-y-1/2 lg:block"
							data-j-anchor={anchor}
						/>
					</div>
				</div>
			) : (
				<div
					className={`relative z-10 flex justify-center ${flip ? "lg:order-1" : ""}`}
				>
					<div aria-hidden className="relative h-72 w-72 sm:h-96 sm:w-96">
						<StationSlot variant={variant} />
						{/* Parada da caixa: logo abaixo da bolha, na coluna dela — a
						    travessia nunca atravessa a coluna de texto. */}
						<div
							className={`absolute top-full hidden h-24 w-24 -translate-y-1/2 lg:block ${
								flip ? "-left-10" : "-right-10"
							}`}
							data-j-anchor={anchor}
						/>
					</div>
				</div>
			)}
		</section>
	);
}

function Chegada() {
	return (
		<section className="relative mx-auto max-w-6xl px-6 pt-32 text-center">
			<div className="mist-final absolute inset-y-0 left-1/2 w-screen -translate-x-1/2" />
			{/* Curva de chegada: rio e caixa descem pela margem direita e só
			    então entram na doca — nunca por cima do título. */}
			<div
				aria-hidden
				className="absolute right-[4%] bottom-44 hidden h-24 w-24 lg:block"
				data-j-anchor="chegada"
			/>
			<Reveal>
				<h2 className="relative z-20 mx-auto max-w-2xl font-bold font-display text-4xl text-brand-navy leading-tight tracking-tight sm:text-6xl">
					Entregue no CD.
					<br />
					<span className="text-brand-ink">Pronto para vender.</span>
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
				<CtaReassurance className="relative z-20 mt-4" />
			</Reveal>
			{/* A doca: o rio deságua e o caminhão recebe a caixa aqui, com
			    palco inteiro abaixo dos CTAs para a coreografia final. */}
			<div
				aria-hidden
				className="relative mx-auto mt-16 h-40 w-full max-w-xl"
				data-s-anchor="caminhao-doca"
			>
				{/* Marco da caixa separado da âncora do caminhão: a escala da
				    caixa segue o tamanho do marco, e ela precisa chegar pequena
				    (na traseira, à altura da porta) para caber no baú. */}
				<div
					className="absolute top-[30%] right-[12%] h-12 w-12"
					data-j-anchor="doca"
				/>
			</div>
			{/* Asfalto: o chão do caminhão e a divisa com o rodapé. Fica ABAIXO
			    do canvas (z-0 < z-10) e sobe 1rem sob a âncora, para as rodas
			    afundarem na pista em vez de encostarem na borda — sem isso a
			    estrada pintava por cima das rodas. */}
			<div
				aria-hidden
				className="road relative left-1/2 z-0 -mt-4 h-16 w-screen -translate-x-1/2"
			/>
		</section>
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
					backdrop={<MapaMalhaLazy />}
					title="Fábricas onde o frete nasce menor."
					variant="fabrica"
				>
					<Reveal delay={0.1}>
						<p className="mt-6 max-w-md text-brand-navy/75 text-lg leading-relaxed">
							De 6 a 7 unidades ao lado dos centros de distribuição do Mercado
							Livre. Produzir a poucos quilômetros do CD corta o custo de frete
							de quem vende no ML.
						</p>
					</Reveal>
					<RevealGroups
						className="mt-7 flex max-w-md flex-col gap-3"
						groups={pracasPorRegiao()}
						itemClassName="rounded-full bg-brand-mist px-4 py-1.5 font-medium text-brand-navy text-sm transition-[transform,background-color,color] duration-200 hover:-translate-y-0.5 hover:bg-brand-ink hover:text-white motion-reduce:transition-none motion-reduce:hover:translate-y-0"
						labelClassName="w-24 shrink-0 text-brand-navy/60 text-sm"
					/>
				</Station>

				<Chegada />
			</main>
			<Footer />
		</>
	);
}
