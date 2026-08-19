# cbs-site

Site institucional da **CBS — Companhia Brasileira de Saneantes**: terceirização completa de produção de saneantes, com fábricas ao lado dos centros de distribuição do Mercado Livre. Divulgação de marca, só português, sem backend.

Monorepo bun workspaces: `apps/web` (Next.js 16 + Turbopack + three.js/R3F) e `packages/{ui,env,config}` (shadcn/ui compartilhado).

## Rodar

```bash
bun install
bun run dev:web   # http://localhost:3001 (porta pinada)
```

## Qualidade

```bash
bun run check        # lint/format (Ultracite/Biome)
bun run fix          # aplicar fixes
bun run check-types  # TypeScript
```

## Documentação

- `CONTEXT.md` — glossário de domínio (vocabulário canônico do negócio)
- `apps/web/PRODUCT.md` — verdade do produto (público, posicionamento, restrições)
- `apps/web/DESIGN.md` — design system construído (paleta, tipografia, regras)
- `docs/superpowers/specs/` — specs de design aprovadas
- `docs/agents/` — convenções para agentes (issues, triagem, domínio)

## Home 3D

Canvas WebGL único (`apps/web/src/components/home/scene3d.tsx`) com grupos ancorados no DOM: a bolha do hero estoura no primeiro scroll e a caixa CBS percorre um caminho líquido em SVG, parando nas estações (frasco, selo, caminhão) até pousar na doca. Em telas <1024px ou com `prefers-reduced-motion`, a jornada desliga e a caixa fica estática na bolha.
