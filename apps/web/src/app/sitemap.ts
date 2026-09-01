import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

/** Uma página só. Sem `lastModified`: data fabricada a cada build ensina o Google a ignorar o campo. */
export default function sitemap(): MetadataRoute.Sitemap {
	return [{ url: `${SITE_URL}/` }];
}
