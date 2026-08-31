"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type BolhaImagemObj = "caixa" | "frasco" | "selo";

/**
 * Bolha de vidro pré-renderizada (`public/bolhas`, ver scripts/render-bolhas.md).
 * Decorativa: alt vazio. O pai define o tamanho (quadrado); `rounded-full`
 * garante o recorte se o asset tiver fundo de papel.
 */
export function BolhaImagem({
	className = "",
	obj,
}: {
	className?: string;
	obj: BolhaImagemObj;
}) {
	return (
		<Image
			alt=""
			className={`size-full rounded-full object-contain ${className}`}
			height={800}
			priority={obj === "caixa"}
			sizes="(max-width: 767px) 62vw, 272px"
			src={`/bolhas/${obj}.webp`}
			width={800}
		/>
	);
}

/**
 * A fábrica mantém a ilustração animada (SMIL) no celular: o SVG fica embaixo
 * e o vidro vazio (`vidro.webp`) por cima — a mesma composição que o desktop
 * faz com o canvas. Com prefers-reduced-motion entra o PNG já rasterizado.
 */
export function BolhaFabrica({ className = "" }: { className?: string }) {
	const [reduced, setReduced] = useState(false);

	useEffect(() => {
		const query = window.matchMedia("(prefers-reduced-motion: reduce)");
		const update = () => setReduced(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);

	return (
		<div className={`relative size-full ${className}`}>
			{reduced ? (
				<Image
					alt=""
					className="pointer-events-none absolute top-1/2 left-1/2 w-[110%] max-w-none -translate-x-1/2 -translate-y-[54%]"
					height={661}
					src="/textures/warehouse-delivery.png"
					width={1296}
				/>
			) : (
				/* <object> e não <img>: o Chrome congela SMIL em contexto de imagem. */
				<object
					aria-hidden
					className="pointer-events-none absolute top-1/2 left-1/2 w-[110%] max-w-none -translate-x-1/2 -translate-y-[54%] contrast-[1.06] saturate-[1.4]"
					data="/warehouse-delivery.svg"
					title=""
					type="image/svg+xml"
				/>
			)}
			<Image
				alt=""
				className="pointer-events-none absolute inset-0 size-full rounded-full object-contain"
				height={800}
				sizes="(max-width: 767px) 55vw, 224px"
				src="/bolhas/vidro.webp"
				width={800}
			/>
		</div>
	);
}
