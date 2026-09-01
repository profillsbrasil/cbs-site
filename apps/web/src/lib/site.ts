import { env } from "@cbs-site/env/web";

import { EMAIL_ADDRESS, WHATSAPP_NUMBER } from "@/components/contact";

/**
 * Identidade do site para metadata, sitemap, robots e JSON-LD: a única
 * fonte da URL base e dos textos que o Google e as prévias de link leem.
 *
 * Este módulo só é importado por código de servidor (layout, sitemap,
 * robots, OG image). `VERCEL_PROJECT_PRODUCTION_URL` não chega ao cliente;
 * um client component que importar daqui veria a URL errada.
 */
const TRAILING_SLASH = /\/$/;

interface SiteUrlSource {
	/** `NEXT_PUBLIC_SITE_URL`, já validada como URL pelo pacote de env. */
	explicit?: string;
	/** `NODE_ENV` do processo. */
	nodeEnv?: string;
	/** `VERCEL_PROJECT_PRODUCTION_URL`: só o host, sem esquema. */
	vercelProductionHost?: string;
}

/**
 * Precedência: variável explícita, depois a produção da Vercel, depois o
 * dev local. Build de produção sem nenhuma das duas falha em vez de
 * publicar canonical, sitemap e og:image apontando para localhost.
 */
export function resolveSiteUrl(source: SiteUrlSource): string {
	if (source.explicit) {
		return source.explicit.replace(TRAILING_SLASH, "");
	}
	if (source.vercelProductionHost) {
		return `https://${source.vercelProductionHost}`;
	}
	if (source.nodeEnv === "production") {
		throw new Error(
			"URL base do site indefinida: defina NEXT_PUBLIC_SITE_URL (ex.: https://exemplo.com.br) ou habilite as System Environment Variables na Vercel. Para um build local, NEXT_PUBLIC_SITE_URL=http://localhost:3001."
		);
	}
	return "http://localhost:3001";
}

export const SITE_URL = resolveSiteUrl({
	explicit: env.NEXT_PUBLIC_SITE_URL,
	nodeEnv: process.env.NODE_ENV,
	vercelProductionHost: env.VERCEL_PROJECT_PRODUCTION_URL,
});
export const SITE_NAME = "CBS";
export const SITE_LEGAL_NAME = "Companhia Brasileira de Saneantes";
export const SITE_TITLE = `${SITE_NAME} · ${SITE_LEGAL_NAME}`;
/**
 * "Autorização ANVISA" é da empresa, não da fábrica nem do produto
 * (docs/copy/pesquisa-2026-08-24/02-anvisa.md, "O que evitar afirmar").
 */
export const SITE_DESCRIPTION =
	"Terceirização de produção de saneantes com a sua marca. Autorização ANVISA e fábricas junto aos CDs do Mercado Livre: a remessa até o CD sai mais barata.";
export const SITE_TAGLINE = "Sua marca, nossa fábrica.";
export const SITE_LOGO_PATH = "/cbs-logo.png";

/** Telefone no formato E.164 que o schema.org espera. */
const WHATSAPP_E164 = `+${WHATSAPP_NUMBER.replace(/\D/g, "")}`;

/** Dados estruturados da empresa (schema.org/Organization). */
export function organizationJsonLd() {
	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		alternateName: SITE_LEGAL_NAME,
		areaServed: "BR",
		contactPoint: [
			{
				"@type": "ContactPoint",
				availableLanguage: "pt-BR",
				contactType: "sales",
				email: EMAIL_ADDRESS,
				telephone: WHATSAPP_E164,
			},
		],
		description: SITE_DESCRIPTION,
		logo: `${SITE_URL}${SITE_LOGO_PATH}`,
		name: SITE_NAME,
		url: SITE_URL,
	} as const;
}

/**
 * Serializa JSON-LD para dentro de um `<script>`: `<` vira `<` para
 * nenhum `</script>` no conteúdo fechar a tag antes da hora.
 */
export function serializeJsonLd(data: unknown): string {
	return JSON.stringify(data).replace(/</g, "\\u003c");
}
