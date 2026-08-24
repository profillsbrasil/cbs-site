import { ArrowDown } from "lucide-react";

import { CtaEmail, CtaReassurance, CtaWhatsApp } from "@/components/cta";
import { Footer } from "@/components/footer";
import { LiquidPath } from "@/components/home/liquid-path";
import { MapaMalhaLazy } from "@/components/home/mapa-malha-lazy";
import { pracasPorRegiao } from "@/components/home/pracas";
import { Reveal, RevealGroups } from "@/components/home/reveal";
import { Scene3D } from "@/components/home/scene3d";
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

/** O que a CBS devolve na primeira resposta, na ordem do fluxo. */
const RESPOSTA = ["produto", "rótulo", "produção", "envio"] as const;

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
					title="Você vende. A CBS fabrica e envia."
					variant="frasco"
				>
					<Reveal delay={0.1}>
						<p className="mt-6 max-w-md text-brand-navy/75 text-lg leading-relaxed">
							Terceirização completa de produção, dividida em duas partes.
						</p>
						<dl className="mt-5 grid max-w-md grid-cols-[auto_1fr] gap-x-5 gap-y-3 text-lg leading-relaxed">
							<dt className="font-semibold text-brand-navy">Você</dt>
							<dd className="text-brand-navy/75">
								anuncia, precifica e vende.
							</dd>
							<dt className="font-semibold text-brand-navy">A CBS</dt>
							<dd className="text-brand-navy/75">
								produz o saneante, aplica o seu rótulo e despacha para o CD.
							</dd>
						</dl>
						<p className="mt-5 max-w-md text-brand-navy/75 text-lg leading-relaxed">
							A marca no rótulo é sua.{" "}
							<strong className="text-brand-navy">
								A CBS não assina o produto final.
							</strong>
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
						<p className="mt-6 max-w-md text-brand-navy/75 text-lg leading-relaxed">
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
						<p className="mt-6 max-w-md text-brand-navy/75 text-lg leading-relaxed">
							<strong className="text-brand-navy">
								Quem vende no Full paga a remessa até o CD do Mercado Livre.
							</strong>{" "}
							Saneante é pesado e barato por unidade, então esse trecho pesa na
							margem, e é ele que a fábrica ao lado encurta.
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
