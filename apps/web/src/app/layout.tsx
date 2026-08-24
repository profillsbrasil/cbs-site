import type { Metadata } from "next";
import { Sora } from "next/font/google";

import { AppMotionConfig } from "@/components/motion-config";

import "../index.css";

const sora = Sora({
	subsets: ["latin"],
	variable: "--font-sora",
});

export const metadata: Metadata = {
	description:
		"Terceirização de produção de saneantes: a CBS fabrica com a sua marca, com autorização ANVISA, e envia de fábricas ao lado dos CDs do Mercado Livre. Você vende, o frete sai menor.",
	title: "CBS | Companhia Brasileira de Saneantes",
};

const DIRECTION_CONTRACT = `impeccable-direction b61342a9/870fbad3 (user-pinned)
THESIS: A home é a jornada de um pacote que nasce numa bolha de sabão e termina no CD do Mercado Livre; recusa o hero estático com cards de benefícios.
OWN-WORLD: Branco #FAFBFC quase absoluto; navy #0F1C2B e azul #1D9DD8 da marca; aquas #A8E0F0/#DCF3FA; bolhas de vidro e caixas de papelão com fita azul como únicos sólidos; caminho líquido em SVG; display Sora.
STORY: O contratante entende que a CBS fabrica e envia sob a marca dele, acredita em frete + qualidade + ANVISA, e chama no WhatsApp.
FIRST VIEWPORT: Headline à esquerda com CTA; à direita bolhas 3D com a caixa dentro da maior; no primeiro scroll a bolha estoura e a caixa desce a página.
FORM: Bolha-Pacote, comp aprovado .impeccable/mocks/comp-bolha-pacote.png; jornada cronológica (modelo → qualidade → malha → chegada).
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md`;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			className="scroll-smooth motion-reduce:scroll-auto"
			lang="pt-BR"
			suppressHydrationWarning
		>
			<body
				className={`${sora.variable} bg-brand-paper text-brand-navy antialiased`}
			>
				<script id="direction-contract" type="text/x-impeccable-contract">
					{DIRECTION_CONTRACT}
				</script>
				<AppMotionConfig>{children}</AppMotionConfig>
			</body>
		</html>
	);
}
