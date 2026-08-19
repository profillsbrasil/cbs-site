# Home CBS — design aprovado

Data: 2026-08-19 · Aprovado pelo dono no brainstorm com companion visual + fluxo impeccable (comps gerados, composição "Bolha-Pacote" escolhida na página de decisão).

## O que é

Home do site institucional da CBS (Companhia Brasileira de Saneantes). Página única longa, branca, em português, sem backend. Persuade: o visitante entende o modelo (terceirização de produção de saneantes), acredita nos três argumentos (frete, qualidade, ANVISA) e chama no WhatsApp.

## Decisões travadas

- **Mundo visual**: Bolha-Pacote (comp aprovado em `.impeccable/mocks/comp-bolha-pacote.png`). Branco #FAFBFC dominante, navy #0F1C2B, azul #1D9DD8, aquas #A8E0F0/#DCF3FA. Bolhas de vidro + caixas de papelão com fita azul como únicos elementos 3D.
- **Comportamento 3D** (escolha B do companion): bolhas vivas no hero com a caixa dentro da maior; no primeiro scroll a bolha estoura e a caixa desce a página presa ao caminho líquido, parando em cada seção.
- **Ordem** (escolha A): cronológica — modelo → qualidade/ANVISA → malha/frete → chegada. O frete aparece já na sub-headline do hero para manter a prioridade comercial.
- **Sem dark mode**: branco pinado pelo dono. Header do scaffold sai.
- **Fontes**: Sora (display) + Geist (corpo).
- **Contato**: WhatsApp +55 19 99689-4236 (wa.me/5519996894236) e othavioquiliao@gmail.com.

## Estrutura

0. Navbar: logo real (`public/cbs-logo.jpeg`) + botão WhatsApp.
1. Hero: headline "Sua marca, nossa fábrica." + sub com ganho de frete + CTA; cena R3F à direita (bolhas MeshTransmissionMaterial, caixa flutuando, parallax).
2. Explosão da bolha no scroll; caixa entra na jornada.
3. Seção O Modelo (frasco em bolha): você vende, a CBS fabrica, rotula com a sua marca e envia.
4. Seção Qualidade + ANVISA (selo): padrões + autorização.
5. Seção A Malha (caminhão): 6–7 fábricas junto aos CDs do ML; praças: SP, MG, Curitiba, PE, BA, RS, Centro do Brasil.
6. Chegada no CD: poça + CTA WhatsApp/e-mail; rodapé institucional.

## Técnica

- `apps/web/src/app/page.tsx` server component; ilhas client em `components/home/`.
- Jornada: Canvas fixo com a caixa seguindo âncoras por seção via progresso de scroll (`motion`); caminho líquido SVG com stroke desenhado no scroll.
- `prefers-reduced-motion`: desativa viagem e explosão; caixa estática por seção.
- Mobile: hero simplificado, jornada leve (aparição por seção, sem path contínuo).
- Sem formulário, sem coleta; links externos apenas.

## Fora de escopo / pendências

- Copy final refinada com o Gulberto (texto atual é proposta).
- Logo vetorial/PNG transparente (JPEG atual tem fundo quase branco).
- Páginas além da home.

## Desfecho da implementação (2026-08-19)

Construída e aprovada pelo revisor de acabamento independente (disposition: **ship**, 2 rodadas de fix). Divergências do plano original, todas a favor da robustez:

- **Canvas WebGL único** (`scene3d.tsx`) com grupos ancorados no DOM em vez de canvas por seção — o browser esgota contextos WebGL com múltiplos canvases.
- Corpo do texto renderiza em **Inter Variable** (token do pacote ui); Sora só em display, via classe CSS `.font-display` (a utility de tema do Tailwind não gerava).
- Caminho líquido virou fita em camadas (espuma desfocada + corpo gradiente + miolo + corrente animada), sincronizada com a caixa por um `motionValue` compartilhado.
- `"use no memo"` nos arquivos 3D (compatibilidade com React Compiler).

Design system registrado em `apps/web/DESIGN.md`.
