"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { useWide } from "./use-wide";

export type BolhaImagemObj = "caixa" | "frasco" | "selo";

/**
 * A ilustração SMIL da fábrica em lg (atrás do vidro WebGL). É client e
 * gated por `useWide` para o `<object>` não existir dobrado abaixo de lg —
 * `display:none` não impede um `<object>` de carregar e rodar SMIL.
 */
export function FabricaIlustracaoDesktop() {
	const wide = useWide();
	if (!wide) {
		return null;
	}
	return (
		/* <object> e não <img>: o Chrome congela SMIL em contexto de imagem. */
		<object
			aria-hidden
			className="pointer-events-none absolute top-1/2 left-1/2 w-[135%] max-w-none -translate-x-1/2 -translate-y-[54%] contrast-[1.06] saturate-[1.4]"
			data="/warehouse-delivery.svg"
			title=""
			type="image/svg+xml"
		/>
	);
}

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
	const wide = useWide();
	const [reduced, setReduced] = useState(false);

	useEffect(() => {
		const query = window.matchMedia("(prefers-reduced-motion: reduce)");
		const update = () => setReduced(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);

	// O wrapper já é lg:hidden; o gate evita o segundo <object> SMIL montado
	// (display:none não impede um <object> de carregar e animar).
	if (wide) {
		return null;
	}

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
