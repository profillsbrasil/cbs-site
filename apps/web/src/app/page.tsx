import { ArrowDown } from "lucide-react";

import { CtaEmail, CtaReassurance, CtaWhatsApp } from "@/components/cta";
import { Footer } from "@/components/footer";
import { EntregaTitulo } from "@/components/home/entrega-titulo";
import { LiquidPath } from "@/components/home/liquid-path";
import { MapaMalhaLazy } from "@/components/home/mapa-malha-lazy";
import { pracasPorRegiao } from "@/components/home/pracas";
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
			className="relative mx-auto grid min-h-[100svh] max-w-6xl items-start gap-8 px-6 pt-20 pb-12 sm:gap-10 sm:pt-28 sm:pb-16 lg:grid-cols-[1.05fr_minmax(0,1fr)] lg:items-center lg:pt-28"
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
					<p className="mt-[clamp(1.5rem,20vw,7rem)] max-w-lg text-pretty text-base text-brand-navy/75 leading-relaxed sm:mt-8 sm:text-xl lg:mt-7">
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
					className="rise"
					style={{ "--rise-delay": "220ms" } as React.CSSProperties}
				>
					<div className="mt-6 flex flex-col items-stretch gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
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
				className="absolute top-14 -right-24 size-[clamp(13rem,66vw,17rem)] sm:top-16 sm:-right-16 sm:size-[clamp(17rem,40vw,24rem)] lg:relative lg:top-auto lg:right-auto lg:h-[560px] lg:w-auto"
				data-s-anchor="hero-cluster"
			>
				<HeroPlaceholder />
				{/* Marco da caixa: proporcional à bolha abaixo de lg (a caixa
				    estática escala por este marco, a bolha pela âncora acima). */}
				<div
					className="absolute top-1/2 left-1/2 size-[23%] -translate-x-1/2 -translate-y-1/2 lg:size-32"
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
function StationSlot({ variant }: { variant: string }) {
	return (
		<div className="absolute inset-0" data-s-anchor={variant}>
			{variant === "fabrica" ? (
				/* <object> e não <img>: o Chrome congela SMIL em contexto de
				   imagem; como documento embutido a animação roda. */
				<object
					aria-hidden
					className="pointer-events-none absolute top-1/2 left-1/2 w-[110%] max-w-none -translate-x-1/2 -translate-y-[54%] contrast-[1.06] saturate-[1.4] sm:w-[135%]"
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
	// Abaixo de lg o wrapper de texto vira `contents`: título, visual e corpo
	// são itens diretos do grid e a bolha entra ENTRE o título e o parágrafo,
	// sangrando pelo lado que alterna (o zigue-zague do desktop, num só eixo).
	const textCol = flip ? "lg:order-2" : "";
	// Em md (tablet) título e corpo dividem a coluna 1 e a bolha ocupa a 2,
	// nas duas linhas; em lg o wrapper volta a ser bloco e isso é ignorado.
	const textMd = flip ? "md:col-start-2" : "md:col-start-1";
	// As tracks também espelham: o texto sempre fica na coluna flexível.
	const gridMd = flip
		? "md:grid-cols-[auto_minmax(0,1fr)]"
		: "md:grid-cols-[minmax(0,1fr)_auto]";
	const visualMd = flip
		? "md:col-start-1 md:justify-self-start md:ml-0"
		: "md:col-start-2 md:justify-self-end md:mr-0";
	const sideBleed = flip
		? "justify-self-start -ml-12 sm:-ml-8"
		: "justify-self-end -mr-12 sm:-mr-8";
	return (
		<section
			className={`relative mx-auto grid max-w-6xl scroll-mt-24 items-center gap-y-5 px-6 py-14 sm:gap-y-8 sm:py-24 md:grid-rows-[auto_auto] md:gap-x-8 lg:min-h-[80vh] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-none lg:gap-10 ${gridMd}`}
			id={anchor}
		>
			{hasBackdrop ? null : (
				<div
					className="mist-side absolute inset-y-0 left-1/2 w-screen -translate-x-1/2"
					style={{ "--mist-x": flip ? "18%" : "82%" } as React.CSSProperties}
				/>
			)}
			<div className={`contents lg:relative lg:z-20 lg:block ${textCol}`}>
				<Reveal
					className={`relative z-20 order-1 md:row-start-1 lg:order-none ${textMd}`}
				>
					<h2 className="max-w-md font-bold font-display text-4xl text-brand-navy leading-tight tracking-tight sm:text-5xl">
						{title}
					</h2>
				</Reveal>
				<div
					className={`relative z-20 order-3 md:row-start-2 lg:order-none ${textMd}`}
				>
					{children}
				</div>
			</div>
			{hasBackdrop ? (
				/* Composição D2: mapa no alto-direita, bolha em baixo-esquerda —
				   a diagonal do rio líquido. Abaixo de lg a mesma diagonal,
				   condensada: mapa sangrando à direita, bolha à esquerda. */
				<div
					className={`relative z-10 order-2 h-[clamp(20rem,88vw,26rem)] w-full md:row-span-2 md:row-start-1 md:w-[22rem] lg:order-none lg:col-auto lg:row-auto lg:h-auto lg:min-h-[520px] lg:w-auto lg:justify-self-auto ${visualMd}`}
				>
					<div className="absolute top-0 -right-4 size-[clamp(13rem,60vw,17rem)] sm:right-0 lg:size-[380px]">
						{backdrop}
					</div>
					<div
						aria-hidden
						className="absolute bottom-0 left-0 size-[clamp(11rem,50vw,14rem)] lg:size-80"
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
					className={`relative z-10 order-2 md:row-span-2 md:row-start-1 lg:order-none lg:col-auto lg:row-auto lg:mx-0 lg:flex lg:justify-center lg:justify-self-auto ${sideBleed} ${visualMd}`}
				>
					<div
						aria-hidden
						className="relative size-[clamp(13rem,62vw,17rem)] lg:size-96"
					>
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

/** O que a CBS devolve na primeira resposta, na ordem do fluxo. */
const RESPOSTA = ["produto", "rótulo", "produção", "envio"] as const;

function Chegada() {
	return (
		<section className="relative mx-auto max-w-6xl px-6 pt-14 text-center sm:pt-32">
			<div className="mist-final absolute inset-y-0 left-1/2 w-screen -translate-x-1/2" />
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
					<Reveal delay={0.1}>
						<p className="max-w-md text-pretty text-brand-navy/75 text-lg leading-relaxed lg:mt-6">
							<strong className="text-brand-navy">
								Quem vende no Full paga a remessa até o CD.
							</strong>{" "}
							Saneante é pesado e barato por unidade, então esse trecho pesa na
							margem, e é ele que a fábrica ao lado encurta.
						</p>
					</Reveal>
					<RevealGroups
						className="mt-6 flex max-w-md flex-col gap-2.5 sm:gap-3 lg:mt-7"
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
