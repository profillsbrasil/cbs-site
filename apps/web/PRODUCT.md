# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Empresas que vendem produtos de limpeza sob marca própria (contratantes) e pessoas que pesquisam "CBS" após receberem menção da empresa em cotações e conversas comerciais. A situação típica: alguém ouviu falar da CBS num contato comercial, joga o nome no Google e precisa encontrar uma empresa apresentável em vez de nada. Público secundário: fornecedores de equipamentos sendo cotados, que também pesquisam a empresa.

## Product Purpose

Site institucional da CBS (Companhia Brasileira Saneantes): divulgação de marca, só português, sem backend e sem captura de dados. Sucesso = quem pesquisa a CBS encontra um site profissional que explica o negócio e passa credibilidade. O site precede a operação plena — a empresa está cotando equipamentos — mas por decisão do dono a comunicação fala no presente, como empresa em operação.

## Positioning

Terceirização completa da produção de saneantes: o contratante vende sob a marca dele, a CBS fabrica e envia. O diferencial que um concorrente não copia de imediato: malha de 6 a 7 fábricas posicionadas junto aos CDs do Mercado Livre (São Paulo, Minas Gerais, Curitiba, Pernambuco, Bahia, Rio Grande do Sul e região central do Brasil), o que reduz o custo de frete de quem vende no ML. Os três argumentos, por ordem definida pelo cliente: ganho de custos de frete pelas localizações, padrões de qualidade, autorização ANVISA.

## Operating Context

O visitante avalia a CBS comparando com fabricar por conta própria ou contratar outro terceirista. O contexto de venda é o comércio eletrônico via Mercado Livre: o contratante anuncia, a CBS produz perto do CD e entrega nele. Vocabulário canônico do domínio em `../../CONTEXT.md` (raiz do repo): saneante, contratante, terceirização de produção, fábrica, CD, ganho de frete.

## Capabilities and Constraints

- Site estático institucional: sem backend, sem formulário, sem captura de dados.
- Só português (pt-BR).
- Contato via canais externos: WhatsApp +55 19 99689-4236 (link `https://wa.me/5519996894236`) e e-mail othavioquiliao@gmail.com (mailto).
- Afirmações autorizadas pelo dono: empresa em operação; autorização ANVISA concedida.
- Stack já dada pelo repositório (Next.js 16, monorepo bun, shadcn/ui via `@cbs-site/ui`).

## Brand Commitments

- Nome: CBS — sigla de "Companhia Brasileira de Saneantes" (grafia conforme o logo); o dono diz que a expansão não carrega significado especial. Usar "CBS" como nome corrente.
- Logo recebido em `public/cbs-logo.jpeg` (642x317, JPEG sobre fundo quase-branco #F6F7F7): "CBS" em caixa alta com C e S em azul-marinho escuro (#0F1C2B) e B em azul claro (#1D9DD8), brilho de quatro pontas sobre o B, e a expansão por extenso embaixo em azul-marinho. Essas duas cores são a paleta de marca até segunda ordem. Pendência: versão vetorial/PNG com fundo transparente — o JPEG não recorta limpo sobre fundo escuro.
- Voz: institucional, no presente, focada nos três argumentos (frete, qualidade, ANVISA).
- Superfície branca (decisão do dono, 19/08/2026): o site é dominantemente branco porque empresa de limpeza precisa parecer limpa; azuis da marca sobre fundo branco. Direções escuras/saturadas foram rejeitadas.
- O texto final será refinado com o cliente (Gulberto/Profills) — copy inicial é proposta, não versão aprovada.

## Evidence on Hand

- Mensagens do cliente (18/08/2026) definindo o modelo de negócio, as praças das fábricas e os três argumentos. Nada além disso.
- NÃO existem ainda: fotos de fábrica, portfólio de produtos, clientes, depoimentos, números de produção, certificados escaneados. Nenhum desses pode ser inventado; usar apenas o que o cliente fornecer.

## Product Principles

1. Credibilidade primeiro: o site existe para validar a empresa aos olhos de quem pesquisa; tudo deve parecer estabelecido e profissional.
2. Frete é o argumento-mestre: a malha junto aos CDs do ML abre a narrativa, qualidade e ANVISA sustentam.
3. Nunca fabricar prova: sem depoimento, cliente ou número inventado; a força vem da clareza do modelo, não de social proof falso.
4. O contratante é o herói: a marca dele vai no rótulo; a CBS se apresenta como a fábrica por trás, não como marca de consumo.
5. Site leve e direto: sem backend e sem coleta, cada seção existe para explicar o modelo ou levar ao WhatsApp/e-mail.
