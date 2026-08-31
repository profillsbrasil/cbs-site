import { ArrowDown } from "lucide-react";
import Image from "next/image";

import { CtaEmail, CtaReassurance, CtaWhatsApp } from "@/components/cta";
import { Footer } from "@/components/footer";
import {
	BolhaFabrica,
	BolhaImagem,
	FabricaIlustracaoDesktop,
} from "@/components/home/bolha-imagem";
import { BubbleGhosts } from "@/components/home/bubble-ghosts";
import { EntregaTitulo } from "@/components/home/entrega-titulo";
import { LiquidPath } from "@/components/home/liquid-path";
import { MapaMalhaLazy } from "@/components/home/mapa-malha-lazy";
import { MapaMalhaPlaceholder } from "@/components/home/mapa-malha-placeholder";
import { pracasPlanas, pracasPorRegiao } from "@/components/home/pracas";
import { Reveal, RevealGroups } from "@/components/home/reveal";
import { Scene3DLazy } from "@/components/home/scene3d-lazy";
import { Navbar } from "@/components/navbar";

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
			className="hero-placeholder pointer-events-none absolute inset-0 hidden items-center justify-center lg:flex"
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
			className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col px-6 pt-20 pb-8 md:min-h-0 md:pb-14 lg:grid lg:min-h-[100svh] lg:grid-cols-[1.05fr_minmax(0,1fr)] lg:items-center lg:gap-10 lg:pt-28 lg:pb-16"
			id="topo"
		>
			<div className="mist-hero absolute inset-y-0 left-1/2 w-screen -translate-x-1/2" />
			<BubbleGhosts variant="hero" />
			{/* Celular/tablet: a bolha-caixa vem ANTES do título, sangrando pela
			    direita (o <main> recorta com overflow-x-clip). Em lg o visual é
			    o cluster WebGL na segunda coluna. */}
			<div
				aria-hidden
				className="rise relative z-10 -mr-10 ml-auto size-[clamp(13rem,62vw,17rem)] sm:-mr-6 md:size-[clamp(17rem,40vw,22rem)] lg:hidden"
			>
				<BolhaImagem obj="caixa" />
			</div>
			<div className="relative z-20 flex flex-1 flex-col lg:flex-none">
				<div className="rise">
					{/* clamp: 36px em 320 (senão "nossa fábrica." quebra em 3 linhas),
					    40px de 380 em diante. */}
					<h1 className="mt-2 max-w-xl font-bold font-display text-[clamp(2.25rem,10.5vw,2.5rem)] text-brand-navy leading-[1.02] tracking-tight md:text-6xl lg:mt-0 lg:text-7xl">
						Sua marca,
						<br />
						<span className="text-brand-ink">nossa fábrica.</span>
					</h1>
				</div>
				<div
					className="rise"
					style={{ "--rise-delay": "120ms" } as React.CSSProperties}
				>
					<p className="mt-4 max-w-lg text-pretty text-base text-brand-navy/75 leading-relaxed md:mt-6 md:text-lg lg:mt-7 lg:text-xl">
						A CBS fabrica o seu saneante, aplica o seu rótulo e entrega no
						centro de distribuição do Mercado Livre, com autorização ANVISA.
						Cada fábrica fica ao lado de um CD, e{" "}
						<strong className="text-brand-navy">
							a remessa até lá sai mais barata
						</strong>
						.
					</p>
				</div>
				<div
					className="rise mt-auto pt-6 md:mt-12 md:pt-0 lg:mt-10"
					style={{ "--rise-delay": "220ms" } as React.CSSProperties}
				>
					<div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
						<CtaWhatsApp
							className="justify-center"
							label="Chamar no WhatsApp"
						/>
						<CtaEmail className="justify-center" />
					</div>
					<CtaReassurance className="mt-4 text-center sm:text-left" />
				</div>
			</div>
			<div
				className="relative hidden h-[560px] lg:block"
				data-s-anchor="hero-cluster"
			>
				<HeroPlaceholder />
				{/* Marco da caixa: a caixa estática escala por este marco, a
				    bolha pela âncora acima. */}
				<div
					className="absolute top-1/2 left-1/2 size-32 -translate-x-1/2 -translate-y-1/2"
					data-j-anchor="hero"
				/>
			</div>
			<div className="scroll-hint absolute bottom-8 left-1/2 hidden translate-x-[-50%] items-center gap-2 text-brand-navy/70 text-sm lg:flex">
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
type StationVariant = "fabrica" | "frasco" | "selo";
type StationAnchor = "modelo" | "qualidade" | "malha";

/**
 * Slot do objeto em lg: a âncora do vidro WebGL. Na "fabrica" a ilustração
 * animada (SVG com SMIL) vive aqui no DOM, atrás do canvas: o vidro é pintado
 * por cima e ela fica "dentro" da bolha sem perder a animação.
 */
function StationSlotDesktop({ variant }: { variant: StationVariant }) {
	return (
		<div className="absolute inset-0" data-s-anchor={variant}>
			{variant === "fabrica" ? <FabricaIlustracaoDesktop /> : null}
		</div>
	);
}

/** Slot do objeto abaixo de lg: bolha pré-renderizada (ou SVG + vidro, na fábrica). */
function StationSlotMobile({ variant }: { variant: StationVariant }) {
	return (
		<div className="absolute inset-0">
			{variant === "fabrica" ? <BolhaFabrica /> : <BolhaImagem obj={variant} />}
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
	anchor: StationAnchor;
	/** Camada atrás do objeto 3D em lg (ex.: o mapa da malha). Substitui a névoa. */
	backdrop?: React.ReactNode;
	children: React.ReactNode;
	flip?: boolean;
	title: string;
	variant: StationVariant;
}) {
	const hasBackdrop = Boolean(backdrop);
	// Em lg o texto alterna de lado (zigue-zague do desktop); abaixo de lg o
	// lado é fixo: visual sangrando à direita, acima do título (Regra do
	// Lado Fixo).
	const textCol = flip ? "lg:order-2" : "lg:order-none";
	return (
		<section
			className="relative mx-auto flex max-w-6xl scroll-mt-24 flex-col px-6 py-10 md:py-14 lg:grid lg:min-h-[80vh] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-10 lg:py-24"
			id={anchor}
		>
			{hasBackdrop ? null : (
				<div
					className="mist-side absolute inset-y-0 left-1/2 hidden w-screen -translate-x-1/2 lg:block"
					style={{ "--mist-x": flip ? "18%" : "82%" } as React.CSSProperties}
				/>
			)}
			<BubbleGhosts variant={anchor} />
			<div className={`relative z-20 order-2 ${textCol}`}>
				{/* z-10: o mapa da malha é absolute dentro do bloco de children;
				    sem posicionar o título, a ordem de pintura o cobriria. */}
				<Reveal className="relative z-10">
					<h2 className="mt-3 max-w-md font-bold font-display text-3xl text-brand-navy leading-tight tracking-tight md:text-4xl lg:mt-0 lg:text-5xl">
						{title}
					</h2>
				</Reveal>
				<div className="relative mt-3 lg:mt-0">{children}</div>
			</div>
			{hasBackdrop ? (
				<>
					{/* lg — composição D2: mapa no alto-direita, bolha em
					    baixo-esquerda, a diagonal do rio líquido. */}
					<div className="relative z-10 hidden lg:block lg:min-h-[520px]">
						<div className="absolute top-0 right-0 size-[380px]">
							{backdrop}
						</div>
						<div aria-hidden className="absolute bottom-0 left-0 size-80">
							<StationSlotDesktop variant={variant} />
							<div
								className="absolute top-full -right-10 h-24 w-24 -translate-y-1/2"
								data-j-anchor={anchor}
							/>
						</div>
					</div>
					{/* < lg — a bolha da fábrica segue a regra das outras estações. */}
					<div
						aria-hidden
						className="relative z-10 order-1 -mr-8 ml-auto size-[clamp(11rem,55vw,14rem)] sm:-mr-4 lg:hidden"
					>
						<StationSlotMobile variant={variant} />
					</div>
				</>
			) : (
				<>
					<div className="relative z-10 hidden lg:flex lg:justify-center">
						<div aria-hidden className="relative size-96">
							<StationSlotDesktop variant={variant} />
							{/* Parada da caixa: logo abaixo da bolha, na coluna dela — a
							    travessia nunca atravessa a coluna de texto. */}
							<div
								className={`absolute top-full h-24 w-24 -translate-y-1/2 ${
									flip ? "-left-10" : "-right-10"
								}`}
								data-j-anchor={anchor}
							/>
						</div>
					</div>
					<div
						aria-hidden
						className="relative z-10 order-1 -mr-8 ml-auto size-[clamp(11rem,55vw,14rem)] sm:-mr-4 lg:hidden"
					>
						<StationSlotMobile variant={variant} />
					</div>
				</>
			)}
		</section>
	);
}

/** O que a CBS devolve na primeira resposta, na ordem do fluxo. */
const RESPOSTA = ["produto", "rótulo", "produção", "envio"] as const;

function Chegada() {
	return (
		<section className="relative mx-auto max-w-6xl px-6 pt-10 text-center md:pt-20 lg:pt-32">
			<div className="mist-final absolute inset-y-0 left-1/2 w-screen -translate-x-1/2" />
			<BubbleGhosts variant="chegada" />
			{/* Curva de chegada: rio e caixa descem pela margem direita e só
			    então entram na doca — nunca por cima do título. */}
			<div
				aria-hidden
				className="absolute right-[4%] bottom-44 hidden h-24 w-24 lg:block"
				data-j-anchor="chegada"
			/>
			<Reveal>
				<EntregaTitulo />
			</Reveal>
			<Reveal delay={0.12}>
				<p className="relative z-20 mx-auto mt-5 max-w-xl text-pretty text-brand-navy/75 text-lg leading-relaxed sm:mt-7 sm:text-xl">
					Diga o que você quer vender e em qual volume. A CBS responde com:
				</p>
				<ul className="relative z-20 mt-5 flex flex-wrap items-center justify-center gap-2">
					{RESPOSTA.map((item) => (
						<li
							className="rounded-full bg-brand-mist px-4 py-1.5 font-medium text-brand-navy text-sm"
							key={item}
						>
							{item}
						</li>
					))}
				</ul>
			</Reveal>
			<Reveal delay={0.22}>
				<div className="relative z-20 mt-8 flex flex-col items-stretch gap-3 sm:mt-11 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
					<CtaWhatsApp className="justify-center" label="Falar com a CBS" />
					<CtaEmail className="justify-center" />
				</div>
				<CtaReassurance className="relative z-20 mt-4" />
			</Reveal>
			{/* A doca: o rio deságua e o caminhão recebe a caixa aqui, com
			    palco inteiro abaixo dos CTAs para a coreografia final. */}
			<div
				aria-hidden
				className="relative mx-auto mt-12 h-28 w-full max-w-xl sm:mt-16 sm:h-40"
				data-s-anchor="caminhao-doca"
			>
				{/* Abaixo de lg não há canvas: a van entra como imagem, parada
				    na doca, com as rodas alinhadas ao asfalto logo abaixo. */}
				<Image
					alt=""
					className="pointer-events-none absolute bottom-[-1.75rem] left-1/2 z-10 w-[min(20rem,72vw)] -translate-x-1/2 lg:hidden"
					height={387}
					src="/bolhas/caminhao.webp"
					width={800}
				/>
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
			<Scene3DLazy />
			<main className="relative overflow-x-clip">
				<LiquidPath />
				<Hero />

				<Station
					anchor="modelo"
					title="Você vende. A CBS fabrica e envia."
					variant="frasco"
				>
					<Reveal delay={0.1}>
						<p className="max-w-md text-pretty text-brand-navy/75 text-lg leading-relaxed lg:mt-6">
							Terceirização completa de produção: a CBS produz o saneante,
							aplica o seu rótulo e despacha para o CD. Você anuncia, precifica
							e vende. A marca no rótulo é sua; a CBS não assina o produto
							final.
						</p>
					</Reveal>
				</Station>

				<Station
					anchor="qualidade"
					flip
					title="Fábrica autorizada pela ANVISA."
					variant="selo"
				>
					<Reveal delay={0.1}>
						<p className="max-w-md text-pretty text-brand-navy/75 text-lg leading-relaxed lg:mt-6">
							A CBS tem{" "}
							<strong className="text-brand-navy">
								autorização da ANVISA para fabricar saneantes
							</strong>{" "}
							e produz com o mesmo padrão em cada lote. O rótulo é seu; a
							autorização de fabricação é da CBS.
						</p>
					</Reveal>
				</Station>

				<Station
					anchor="malha"
					backdrop={<MapaMalhaLazy />}
					title="6 a 7 fábricas, uma por CD."
					variant="fabrica"
				>
					{/* < lg: o Brasil é tinta atrás do parágrafo (Regra do Mapa-Tinta);
					    o SVG do placeholder já nasce com os pontos acesos. */}
					<div
						aria-hidden
						className="pointer-events-none absolute -top-16 -right-6 z-0 w-[clamp(11rem,52vw,15rem)] opacity-90 lg:hidden"
					>
						<div className="malha-map" data-lit="">
							<MapaMalhaPlaceholder className="malha-map-fallback" />
						</div>
					</div>
					<Reveal delay={0.1}>
						<p className="relative z-10 max-w-[62%] text-pretty text-brand-navy/75 text-lg leading-relaxed sm:max-w-md lg:mt-6">
							<strong className="text-brand-navy">
								Quem vende no Full paga a remessa até o CD.
							</strong>{" "}
							Saneante é pesado e barato por unidade, então esse trecho pesa na
							margem, e é ele que a fábrica ao lado encurta.
						</p>
					</Reveal>
					<Reveal className="lg:hidden" delay={0.16}>
						<ul className="relative z-10 mt-5 flex flex-wrap gap-2">
							{pracasPlanas().map((nome) => (
								<li
									className="rounded-full bg-brand-mist px-4 py-1.5 font-medium text-brand-navy text-sm"
									key={nome}
								>
									{nome}
								</li>
							))}
						</ul>
					</Reveal>
					<RevealGroups
						className="mt-6 hidden max-w-md flex-col gap-2.5 sm:gap-3 lg:mt-7 lg:flex"
						groups={pracasPorRegiao()}
						itemClassName="rounded-full bg-brand-mist px-4 py-1.5 font-medium text-brand-navy text-sm transition-[transform,background-color,color] duration-200 hover:-translate-y-0.5 hover:bg-brand-ink hover:text-white motion-reduce:transition-none motion-reduce:hover:translate-y-0"
						labelClassName="w-full text-brand-navy/60 text-sm sm:w-24 sm:shrink-0"
					/>
				</Station>

				<Chegada />
			</main>
			<Footer />
		</>
	);
}
