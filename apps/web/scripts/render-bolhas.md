# Bolhas pré-renderizadas (`public/bolhas/*.webp`)

Abaixo de 1024px o canvas WebGL não monta; as bolhas do hero e das estações e a
van da doca são estas imagens. **Modelo 3D mudou (`cardboard-box.tsx`,
`station-models.tsx`, `scene-bits.tsx`) → regerar.** Objetos: `caixa`, `frasco`,
`selo`, `vidro` (bolha vazia da fábrica) e `caminhao` (sem bolha; o `-trim`
deixa o WebP retangular, ~800×387).

- Origem: commit `4859205` (código da cena), gerado em 2026-08-31.
- Modo: alfa transparente real (filme da bolha com alfa ≈ 0,33, fora da bolha alfa 0) —
  lido direto do canvas com `toDataURL`, não por screenshot.

## Receita

1. Dev server de pé (`bun run dev:web`, porta 3001; troque a porta abaixo se for outra).
2. Cada objeto tem uma rota: `/render-bolhas?obj=<caixa|frasco|selo|vidro>` (404 fora de
   `NODE_ENV=development`). O canvas é 800×800, `gl.alpha` e `preserveDrawingBuffer`.
3. Capturar o canvas e converter (precisa de `agent-browser` e ImageMagick `magick`):

```bash
cd apps/web && mkdir -p public/bolhas /tmp/bolhas
export AGENT_BROWSER_SESSION="$(agent-browser session id --scope worktree --prefix bolhas)"
for obj in caixa caminhao frasco selo vidro; do
  agent-browser open "http://localhost:3001/render-bolhas?obj=$obj" >/dev/null
  agent-browser set viewport 800 800 1 >/dev/null
  agent-browser wait --load networkidle >/dev/null; agent-browser wait 3000 >/dev/null
  agent-browser eval --max-output 5000000 \
    "document.querySelector('canvas').toDataURL('image/png').split(',')[1]" \
    | tr -d '"\n' | base64 -d > /tmp/bolhas/$obj.png
  magick /tmp/bolhas/$obj.png -trim +repage -resize 800x800 -background none \
    -gravity center -extent 800x800 -define webp:alpha-quality=100 -quality 90 \
    public/bolhas/$obj.webp
done
agent-browser close
```

4. Conferir: `magick identify -format "%f %wx%h opaque=%[opaque]\n" public/bolhas/*.webp`
   → todos `800x800 opaque=False`. Filme da bolha: `magick public/bolhas/vidro.webp -format
   '%[pixel:p{400,120}]' info:` → alfa entre 0,25 e 0,45.
5. Atualizar "Origem" acima com o novo commit e a data.

`screenshot` do agent-browser não preserva alfa; por isso a leitura é via `toDataURL`.
