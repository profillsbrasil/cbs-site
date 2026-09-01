import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	client: {
		/**
		 * URL pública do site, com esquema (`https://exemplo.com.br`). Alimenta
		 * canonical, sitemap, robots, Open Graph e JSON-LD. Sem ela, o build na
		 * Vercel usa `VERCEL_PROJECT_PRODUCTION_URL`; fora da Vercel o build de
		 * produção falha de propósito.
		 */
		NEXT_PUBLIC_SITE_URL: z.url().optional(),
	},
	emptyStringAsUndefined: true,
	experimental__runtimeEnv: {
		NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
	},
	server: {
		/** Domínio de produção que a Vercel injeta (sem esquema), inclusive em preview. */
		VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
	},
});
