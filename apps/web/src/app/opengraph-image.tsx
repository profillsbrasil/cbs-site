import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { SITE_DESCRIPTION, SITE_LEGAL_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `CBS, ${SITE_LEGAL_NAME}: ${SITE_TAGLINE}`;
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

// Paleta da marca (index.css). O Satori não lê CSS, então os valores vêm inline.
const NAVY = "#0f1c2b";
const BLUE = "#1d9dd8";
const PAPER = "#fafbfc";
const AQUA = "#a8e0f0";
const MIST = "#dcf3fa";

/**
 * Prévia de link (WhatsApp, LinkedIn, Google): wordmark CBS com o B em
 * azul, como no rodapé, sobre o branco da marca, com a tagline do hero e a
 * descrição de busca. Sora não vem do `next/font` aqui; o TTF é lido do
 * repositório no build.
 */
export default async function Image() {
	const fontsDir = join(process.cwd(), "src/app/_fonts");
	const [soraBold, soraRegular] = await Promise.all([
		readFile(join(fontsDir, "sora-700.ttf")),
		readFile(join(fontsDir, "sora-400.ttf")),
	]);

	return new ImageResponse(
		<div
			style={{
				background: PAPER,
				color: NAVY,
				display: "flex",
				flexDirection: "column",
				fontFamily: "Sora",
				fontWeight: 700,
				height: "100%",
				justifyContent: "space-between",
				padding: "72px 88px",
				position: "relative",
				width: "100%",
			}}
		>
			{/* Bolha de vidro no canto, o único sólido além do texto. */}
			<div
				style={{
					background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${MIST} 45%, ${AQUA} 100%)`,
					border: `2px solid ${AQUA}`,
					borderRadius: "50%",
					height: 520,
					position: "absolute",
					right: -120,
					top: -140,
					width: 520,
				}}
			/>
			<div style={{ display: "flex", flexDirection: "column" }}>
				<div
					style={{
						display: "flex",
						fontSize: 132,
						letterSpacing: "-0.04em",
						lineHeight: 0.9,
					}}
				>
					<span>C</span>
					<span style={{ color: BLUE }}>B</span>
					<span>S</span>
				</div>
				<div
					style={{
						color: NAVY,
						fontSize: 30,
						fontWeight: 400,
						marginTop: 24,
						opacity: 0.75,
					}}
				>
					{SITE_LEGAL_NAME}
				</div>
			</div>
			<div style={{ display: "flex", flexDirection: "column" }}>
				<div
					style={{
						display: "flex",
						fontSize: 64,
						letterSpacing: "-0.03em",
						lineHeight: 1.05,
					}}
				>
					{SITE_TAGLINE}
				</div>
				<div
					style={{
						color: NAVY,
						fontSize: 28,
						fontWeight: 400,
						lineHeight: 1.4,
						marginTop: 20,
						maxWidth: 940,
						opacity: 0.75,
					}}
				>
					{SITE_DESCRIPTION}
				</div>
			</div>
		</div>,
		{
			...size,
			fonts: [
				{ data: soraBold, name: "Sora", style: "normal", weight: 700 },
				{ data: soraRegular, name: "Sora", style: "normal", weight: 400 },
			],
		}
	);
}
