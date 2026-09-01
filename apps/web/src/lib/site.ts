import { EMAIL_ADDRESS, WHATSAPP_NUMBER } from "@/components/contact";

/**
 * Identidade do site para metadata, sitemap, robots e JSON-LD — a única
 * fonte da URL base e dos textos que o Google e as prévias de link leem.
 *
 * Domínio pendente: enquanto não houver `NEXT_PUBLIC_SITE_URL`, a URL base
 * cai na produção da Vercel (`VERCEL_PROJECT_PRODUCTION_URL`) e, fora dela,
 * no dev local. Canonical e sitemap só apontam certo com a variável definida.
 */
const TRAILING_SLASH = /\/$/;

function resolveSiteUrl(): string {
	const explicit = process.env.NEXT_PUBLIC_SITE_URL;
	if (explicit) {
		return explicit.replace(TRAILING_SLASH, "");
	}
	const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
	if (vercel) {
		return `https://${vercel}`;
	}
	return "http://localhost:3001";
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "CBS";
export const SITE_LEGAL_NAME = "Companhia Brasileira de Saneantes";
export const SITE_TITLE = `${SITE_NAME} · ${SITE_LEGAL_NAME}`;
export const SITE_DESCRIPTION =
	"Terceirização de produção de saneantes com a sua marca. Fábricas autorizadas pela ANVISA ao lado dos CDs do Mercado Livre: a remessa até o CD sai mais barata.";
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
