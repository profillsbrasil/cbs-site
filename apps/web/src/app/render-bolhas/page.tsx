import { notFound } from "next/navigation";

import { isBolhaObj } from "./bolha-objs";
import { RenderBolhasCanvas } from "./render-bolhas-canvas";

/** Rota de ferramenta: só existe em `next dev`. Em produção é 404. */
export default async function RenderBolhasPage({
	searchParams,
}: {
	searchParams: Promise<{ obj?: string }>;
}) {
	if (process.env.NODE_ENV !== "development") {
		notFound();
	}
	const { obj } = await searchParams;
	if (!isBolhaObj(obj)) {
		notFound();
	}
	return (
		<main className="grid min-h-screen place-items-center bg-transparent">
			<RenderBolhasCanvas obj={obj} />
		</main>
	);
}
