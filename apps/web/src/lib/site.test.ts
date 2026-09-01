import { describe, expect, test } from "bun:test";

import { EMAIL_ADDRESS } from "@/components/contact";

import {
	organizationJsonLd,
	resolveSiteUrl,
	SITE_DESCRIPTION,
	SITE_TITLE,
	SITE_URL,
	serializeJsonLd,
} from "./site";

const FABRICAS_AUTORIZADAS = /fábricas autorizadas/i;

describe("resolveSiteUrl", () => {
	test("a variável explícita vence a Vercel e perde a barra final", () => {
		expect(
			resolveSiteUrl({
				explicit: "https://exemplo.com.br/",
				nodeEnv: "production",
				vercelProductionHost: "cbs-site.vercel.app",
			})
		).toBe("https://exemplo.com.br");
	});

	test("sem variável explícita, usa a produção da Vercel com https", () => {
		expect(
			resolveSiteUrl({
				nodeEnv: "production",
				vercelProductionHost: "cbs-site.vercel.app",
			})
		).toBe("https://cbs-site.vercel.app");
	});

	test("build de produção sem URL falha em vez de publicar localhost", () => {
		expect(() => resolveSiteUrl({ nodeEnv: "production" })).toThrow(
			"NEXT_PUBLIC_SITE_URL"
		);
	});

	test("fora de produção cai no dev local", () => {
		expect(resolveSiteUrl({ nodeEnv: "development" })).toBe(
			"http://localhost:3001"
		);
	});
});

describe("organizationJsonLd", () => {
	test("carrega nome, expansão e contato no formato do schema.org", () => {
		const data = organizationJsonLd();
		expect(data["@type"]).toBe("Organization");
		expect(data.name).toBe("CBS");
		expect(data.alternateName).toBe("Companhia Brasileira de Saneantes");
		expect(data.url).toBe(SITE_URL);
		expect(data.logo).toBe(`${SITE_URL}/cbs-logo.png`);
		expect(data.contactPoint[0].telephone).toBe("+5519996894236");
		expect(data.contactPoint[0].email).toBe(EMAIL_ADDRESS);
	});
});

describe("serializeJsonLd", () => {
	test("escapa < para um </script> no conteúdo não fechar a tag", () => {
		const out = serializeJsonLd({ x: "</script><script>alert(1)</script>" });
		expect(out).not.toContain("</script>");
		expect(JSON.parse(out).x).toBe("</script><script>alert(1)</script>");
	});
});

describe("textos de busca", () => {
	test("título cabe na SERP e leva a expansão da sigla", () => {
		expect(SITE_TITLE.length).toBeLessThanOrEqual(60);
		expect(SITE_TITLE).toContain("Companhia Brasileira de Saneantes");
	});

	test("description fica na faixa que o Google costuma exibir", () => {
		expect(SITE_DESCRIPTION.length).toBeGreaterThanOrEqual(120);
		expect(SITE_DESCRIPTION.length).toBeLessThanOrEqual(160);
	});

	test("description não atribui a autorização ANVISA às fábricas", () => {
		expect(SITE_DESCRIPTION).not.toMatch(FABRICAS_AUTORIZADAS);
	});
});
