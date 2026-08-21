---
name: CBS — Companhia Brasileira de Saneantes
description: Sistema visual da home Bolha-Pacote — bolhas de vidro, caixa viajante e caminho líquido aqua sobre uma superfície quase branca.
colors:
  brand-navy: "#0f1c2b"
  brand-blue: "#1d9dd8"
  brand-ink: "#1579b0"
  brand-aqua: "#a8e0f0"
  brand-mist: "#dcf3fa"
  brand-paper: "#fafbfc"
  white: "#ffffff"
typography:
  display:
    fontFamily: "var(--font-sora), ui-sans-serif, system-ui, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
rounded:
  none: "0px"
  full: "9999px"
components:
  button-primary:
    backgroundColor: "{colors.brand-navy}"
    textColor: "{colors.white}"
    rounded: "{rounded.full}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "{colors.brand-blue}"
  button-secondary:
    backgroundColor: "rgb(255 255 255 / 0.6)"
    textColor: "{colors.brand-navy}"
    rounded: "{rounded.full}"
    padding: "16px 32px"
  button-secondary-hover:
    textColor: "{colors.brand-blue}"
  nav-cta:
    backgroundColor: "{colors.brand-navy}"
    textColor: "{colors.white}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
  chip:
    backgroundColor: "{colors.brand-mist}"
    textColor: "{colors.brand-navy}"
    rounded: "{rounded.full}"
    padding: "6px 16px"
---

# Design System: CBS — Companhia Brasileira de Saneantes

## Overview

**Creative North Star: "A Bolha-Pacote"**

A home é a jornada de um pacote: nasce numa bolha de sabão de vidro no hero e desce a página até pousar no CD do Mercado Livre. O mundo é quase todo branco (#FAFBFC) — decisão de marca pinada, porque "empresa de limpeza precisa parecer limpa" — e os únicos sólidos que aparecem são as bolhas de vidro e a caixa de papelão com fita azul; tudo o resto é tinta plana (navy/azul) sobre papel. A página não usa cards com sombra nem grades de benefícios: o storytelling acontece num único canvas WebGL fixo, ancorado a elementos do DOM, com um rio de espuma em SVG (banda orgânica preenchida com microbolhas nas bordas, sem blur/neon) que persegue a caixa enquanto ela viaja.

O mundo é implementado, não só desenhado: um `Scene3D` fixo de tela cheia renderiza bolhas de sabão (vidro fino iridescente: `meshPhysicalMaterial` com transmission real, iridescência de filme fino e clearcoat — sem hack de opacity) sobre grupos que leem a posição de elementos DOM marcados (`data-s-anchor`, `data-j-anchor`) a cada frame — a cena 3D nunca tem layout próprio, ela segue a página. Um único valor compartilhado (`journeyProgress`) sincroniza a caixa 3D viajante com o preenchimento do traço SVG (`LiquidPath`), então os dois nunca dessincronizam. Essa coreografia só roda em telas ≥1024px sem `prefers-reduced-motion`; abaixo disso a página degrada para uma versão estática, com a caixa parada dentro da bolha do hero.

**Key Characteristics:**
- Superfície branca dominante (#FAFBFC/#FFFFFF); navy e azul são tinta de acento, nunca fundo de seção inteira.
- Um único canvas WebGL fixo por trás de toda a página, ancorado a marcadores DOM (`data-s-anchor`/`data-j-anchor`).
- Todo objeto 3D de estação vive dentro de uma bolha de vidro — nunca aparece nu.
- Raio binário: pílula (`rounded-full`) ou nenhum raio; sem meio-termo.
- Sem `box-shadow` em contêineres de conteúdo; profundidade vem do vidro WebGL e de névoas aqua radiais.
- Título sempre em Sora (`.font-display`); corpo de texto sempre no sans herdado do pacote `@cbs-site/ui`.

## Colors

Paleta de marca restrita a cinco tokens, com o branco puro como sexto papel funcional; nenhuma outra cor sólida aparece na camada 2D da página.

### Primary
- **Navy** (`#0f1c2b`): a tinta dominante — todo texto de título e corpo, o preenchimento em repouso do CTA primário, o aro do selo 3D, o chassi do caminhão.

### Secondary
- **Azul CBS** (`#1d9dd8`): o acento gráfico — a fita azul da caixa/rótulos 3D, ícones, anel de foco, névoas. Não é usado como texto nem como fundo de hover: sobre o papel mede 2.95:1 e com texto branco 3.06:1, abaixo de AA.
- **Azul-tinta** (`#1579b0`): o mesmo matiz escurecido até passar AA (4.6:1 sobre o papel, 4.8:1 com branco) — a palavra destacada nos headlines ("nossa fábrica", "Pronto para vender"), o CTA primário e os chips no hover, links no hover.

### Tertiary
- **Aqua** (`#a8e0f0`): o tom intermediário do vidro e do líquido — meio-tom do gradiente do `LiquidPath`, tracejado do asfalto da doca, tonalidade das bolhas de sabão e microbolhas ambiente.

### Neutral
- **Brand Paper** (`#fafbfc`): o fundo da página inteira — o "quase branco absoluto" da marca.
- **Brand Mist** (`#dcf3fa`): a névoa — usada só nos radiais `mist-hero`/`mist-side`/`mist-final` e no fundo dos chips de praça; nunca uma cor sólida de fundo.
- **White** (`#ffffff`): a superfície "elevada" — fundo do rodapé, preenchimento do CTA fantasma, cor do texto sobre navy/azul.

### Named Rules

**A Regra do Branco Dominante.** Nenhuma seção da home tem fundo de cor sólida navy/azul/aqua; essas três cores existem só como tinta (texto, ícones, bordas, preenchimento de pílula) ou como névoa translúcida sobre o papel. É um compromisso de marca pinado no PRODUCT.md — direções escuras/saturadas foram recusadas pelo dono.

**A Regra dos Dois Brancos.** Brand Paper (`#fafbfc`) é a tela da página; branco puro (`#ffffff`) marca o que deve ler como "acima" da tela — a faixa do rodapé, o preenchimento translúcido do CTA fantasma e o texto sobre navy/azul. Não trocar os dois pelo mesmo papel.

## Typography

**Display Font:** Sora (via `next/font/google`, variável `--font-sora`)
**Body Font:** Inter Variable — herdado do token `--font-sans` de `@cbs-site/ui/globals.css`, com fallback `sans-serif`

**Character:** Um display geométrico e confiante (Sora, sempre em bold) contra um corpo sans neutro e legível — o título fala, o corpo explica.

### Hierarchy
- **Display** (700, `text-6xl` → `sm:text-7xl`, `leading-[1.02]`, `tracking-tight`): o H1 do hero — "Sua marca, nossa fábrica."
- **Headline** (700, `text-5xl` → `sm:text-6xl`, `leading-tight`): o H2 de fechamento em Chegada — "Entregue no CD."
- **Title** (700, `text-4xl` → `sm:text-5xl`, `leading-tight`): os H2 das três estações (modelo, qualidade, malha).
- **Body** (400, `text-xl`/`text-lg`, `leading-relaxed`, `max-w-lg`/`max-w-md`, cor `brand-navy/75`): parágrafos de introdução — `text-xl` no hero e em Chegada, `text-lg` nas estações.
- **Label** (500–600, `text-sm`): chips de praça, CTA compacto da navbar, metadados do rodapé.

### Named Rules

**A Regra do Display Só em Título.** `.font-display` (Sora) aparece só em h1/h2 e no wordmark do rodapé; nenhum parágrafo, chip ou botão usa Sora — corpo e rótulos ficam sempre no sans herdado.

**A Regra da Classe Manual.** Sora é aplicado pela classe CSS manual `.font-display` em `index.css` (`font-family: var(--font-sora), ui-sans-serif, system-ui, sans-serif`), não por um utilitário de tema Tailwind — o caminho `@theme` com token de fonte falhou neste build. Todo novo título precisa da classe literal `font-display`, não de um utilitário gerado.

## Layout

Contêiner consistente: `max-w-6xl` (72rem) centralizado, `px-6` de respiro lateral, repetido em navbar, hero, cada estação, Chegada e rodapé.

Ritmo vertical: o hero ocupa o primeiro viewport inteiro (`min-h-[calc(100svh-73px)]`); cada estação é uma grade de duas colunas (`lg:grid-cols-2`, hero em `1.05fr/1fr` assimétrico) com `min-h-[80vh]` e `py-24`; Chegada colapsa para coluna única centralizada (`pt-40 pb-16 text-center`). Abaixo de `lg` (1024px) toda grade empilha em coluna única.

O componente `Station` alterna texto e visual de lado (`flip`), criando um zigue-zague de leitura: estação 1 (modelo) tem texto à esquerda e bolha à direita; estação 2 (qualidade) inverte; estação 3 (malha) volta ao padrão. A névoa aqua daquela seção (`mist-side`, via `--mist-x`) sempre acompanha o mesmo lado do objeto 3D, nunca o do texto.

### Named Rules

**A Regra do Limiar da Jornada.** A coreografia de scroll (caixa viajante + caminho líquido + estouro da bolha) só roda em telas ≥1024px sem `prefers-reduced-motion` (`useJourneyActive`). Abaixo desse limiar, ou com movimento reduzido, a página nunca fica num estado parcialmente animado: a caixa fica parada dentro da bolha do hero e o SVG do caminho líquido simplesmente não renderiza.

## Elevation & Depth

A página é flat por padrão: nenhum contêiner de conteúdo (seção, texto, chip) recebe `box-shadow`. Profundidade vem de dois canais só: o vidro WebGL real (transmission, clearcoat, iridescência, mais `AccumulativeShadows` + `RandomizedLight` sob o aglomerado do hero) e névoas 2D — gradientes radiais aqua (`mist-hero`/`mist-side`/`mist-final`) ancorados sempre do mesmo lado do objeto 3D da seção, funcionando como um halo de luz atrás do vidro, não como sombra.

### Shadow Vocabulary
- **CTA primário** (`shadow-lg shadow-brand-navy/25`, vira `shadow-xl shadow-brand-blue/30` no hover): a única sombra "de verdade" da camada 2D — colorida com a própria cor de preenchimento do botão.
- **Navbar** (`shadow-sm shadow-brand-navy/5`): sombra quase invisível, só para separar a navbar sticky do conteúdo por trás.

### Named Rules

**A Regra do Sem-Sombra-em-Superfície-Plana.** Nenhum `div`/`section` de conteúdo recebe `box-shadow`; sombra é reservada a elementos interativos (pílulas de CTA, cada uma colorida com a própria cor) e à divisória quase invisível da navbar. Separação entre seções vem de borda-fio (`border-brand-navy/8`) ou de nada, nunca de sombra.

## Shapes

Duas famílias de forma, sem meio-termo entre elas: pílula total (`rounded-full`) para tudo interativo em 2D — CTAs, pílula da navbar, chips — e nenhum raio (retas, `rounded-none` implícito) para título, parágrafo e contêiner de seção. Bordas, quando existem, são sempre um fio navy em baixa opacidade (`border-brand-navy/8` para divisórias, `/15` para o contorno do CTA fantasma) — nunca cinza, nunca opacidade cheia.

Na camada 3D, o motivo de forma é a esfera de vidro: todo objeto de estação (frasco, selo, caminhão) vive dentro de uma `SoapBubble` — nunca aparece nu sobre a página. A caixa de papelão (RoundedBox com PBR real de papelão — ambientCG Cardboard004 CC0 em `/textures/cardboard/` — e fita azul como geometria própria com "CBS" impresso) é a única geometria de aresta reta do mundo 3D, propositalmente em contraste com as esferas de vidro ao redor dela.

### Named Rules

**A Regra do Raio Binário.** Toda forma 2D é pílula completa ou sem raio nenhum; `rounded-md`/`rounded-lg`/`rounded-xl` não aparecem em lugar nenhum da home.

**A Regra do Envelope de Bolha.** Nenhum objeto 3D de estação (frasco, selo, caminhão) é renderizado fora de uma `SoapBubble`; a bolha é a moldura obrigatória.

## Components

### Buttons
- **Shape:** pílula completa (`rounded-full`, `9999px`) em todos os três botões do sistema.
- **Primary (`CtaWhatsApp`):** preenchimento navy (`#0f1c2b`), texto branco, `px-8 py-4`, ícone WhatsApp inline (SVG, não pacote de ícone), sombra `shadow-brand-navy/25`. No hover: preenchimento azul (`#1d9dd8`), sombra recolore para `shadow-brand-blue/30`, sobe 2px (`-translate-y-0.5`), ícone escala 110%.
- **Secondary/Ghost (`CtaEmail`):** fundo branco a 60% de opacidade, borda `border-brand-navy/15`, texto navy, ícone de e-mail (lucide). No hover: borda e texto viram azul, sobe 2px — sem sombra.
- **Nav CTA:** versão compacta do primário (`px-5 py-2.5`, `text-sm`), sem sombra, sem elevação no hover — só troca de cor de fundo.

### Chips (praças da malha)
- **Style:** fundo `brand-mist` (`#dcf3fa`), texto navy, `text-sm font-medium`, `px-4 py-1.5`, pílula completa.
- **State:** entram com stagger de 60ms via `RevealList` (`opacity`+`y:14→0`), sem estado de seleção — são informativos, não interativos.

### Navigation
- **Style:** navbar `sticky top-0`, fundo `brand-paper/95`, borda inferior `border-brand-navy/8`, sombra quase invisível.
- **Content:** logo (`public/cbs-logo.jpeg`) à esquerda, um único CTA de WhatsApp compacto à direita — sem menu de links, sem hambúrguer; a navegação da home é toda por scroll.

### Bolha-Pacote (Signature Component)
O motor visual da página: um `Scene3D` (`<Canvas>` do react-three-fiber, único por página, `position: fixed inset-0 z-10`) por trás de todo o conteúdo HTML. Cada grupo 3D é uma `AnchoredGroup` que lê a posição/tamanho de um elemento DOM marcado (`data-s-anchor="frasco|selo|caminhao|hero-cluster"`) a cada frame e posiciona a cena ali — a 3D nunca define seu próprio layout. Paralelamente, `LiquidPath` desenha um rio de espuma SVG (ribbon preenchido + espuma + reflexo, revelado por mask com `pathLength`) conectando os marcadores `data-j-anchor="hero|modelo|qualidade|malha|chegada|doca"`; na chegada o rio desce pela margem direita e deságua na traseira do caminhão, que está parado sobre uma faixa de asfalto (navy, tracejado aqua) que também é a divisa com o rodapé. Os dois sistemas (caixa 3D viajante e traço SVG) são sincronizados por um único `motionValue` compartilhado (`journeyProgress`, em `journey-progress.ts`) — a caixa escreve o progresso, o traço o lê como `pathLength`.

No hero, a bolha principal (raio 1.85) mais três satélites menores flutuam com a caixa de papelão dentro; no primeiro scroll, a bolha aperta (antecipação com squash) e "estoura" (dissolve rápido, 16 gotículas com velocidades próprias); a caixa é única na cena (`JourneyBox`), nasce na âncora do hero e viaja com física de `maath/easing` (damp3 + banking por velocidade), parando ao lado de cada estação. Um campo de 34 microbolhas ambiente (vidro fino translúcido) sobe devagar pela tela inteira o tempo todo, dando textura de "limpeza" ao branco vazio — a caixa estoura as que cruza no caminho.

Todo arquivo desse sistema (`scene3d.tsx`, `scene-bits.tsx`, `cardboard-box.tsx`, `station-models.tsx`) carrega a diretiva `"use no memo"` — necessária para compatibilidade com o React Compiler; qualquer novo componente three.js/R3F nesta base precisa repetir a diretiva.

### Named Rules

**A Regra do Progresso Único.** `journeyProgress` é o único canal de coreografia entre a cena 3D e o SVG; um novo elemento amarrado ao scroll deve ler/escrever esse valor, não criar um segundo listener de scroll independente.

**A Regra da Suavização.** Toda entrada de seção (`Reveal`/`RevealList`) usa `cubic-bezier(0.16, 1, 0.3, 1)`, 0.45–0.55s, com stagger de 60ms por item de lista; com `prefers-reduced-motion` vira um fade simples sem deslocamento em y.

## Do's and Don'ts

### Do:
- **Do** manter a página dominantemente branca (`brand-paper`/`white`); navy e azul entram como tinta e acento, nunca como fundo de seção inteira.
- **Do** envolver todo objeto 3D de estação numa `SoapBubble` de vidro — nunca renderizar o modelo nu.
- **Do** ancorar a névoa (`mist-side`) do mesmo lado do objeto 3D da seção, nunca do lado do texto.
- **Do** usar `rounded-full` para qualquer elemento interativo novo (botão, chip, pílula) e nenhum raio para contêineres de texto.
- **Do** respeitar `prefers-reduced-motion`: qualquer animação nova precisa de um fallback estático, seguindo o padrão de `useJourneyActive`/`Reveal`.
- **Do** aplicar o título display com a classe literal `font-display`, não um utilitário Tailwind de fonte.

### Don't:
- **Don't** adicionar `box-shadow` a contêineres de conteúdo (seções, cards, textos); sombra é só para pílulas de CTA (colorida com a própria cor) e a divisória quase invisível da navbar.
- **Don't** introduzir um raio intermediário (`rounded-md`/`lg`/`xl`); a linguagem de forma 2D é binária.
- **Don't** depender da variável `--font-geist-sans` para o corpo de texto — ela é carregada em `layout.tsx` mas não está conectada a nenhum seletor; o corpo renderiza hoje em Inter Variable, herdado do token `--font-sans` de `@cbs-site/ui`. Se o corpo em Geist for de fato a intenção, é preciso religar o token — hoje ele é morto.
- **Don't** usar marrom kraft (a textura da caixa de papelão) como cor de UI, texto ou fundo — é um tom de material fotográfico do objeto 3D, não um token de marca.
