# Logística do vendedor no Mercado Livre: Full, Flex, Coleta e o custo do inbound

Pesquisa via WebSearch/WebFetch em 2026-08-24. As páginas oficiais de ajuda do Mercado Livre
(`mercadolivre.com.br/ajuda/...`, `envios.mercadolivre.com.br/...`, `developers.mercadolivre.com.br/...`)
retornaram HTTP 403 para o fetch automatizado (bloqueio de bot), então boa parte dos dados abaixo vem
de resumos de busca que citam essas páginas oficiais, e de blogs especializados em e-commerce/ERP que
documentam o programa para vendedores. Isso está marcado item a item.

## Programas do ML

Nomes oficiais dos programas de envio do Mercado Livre no Brasil, todos sob o guarda-chuva "Mercado
Envios":

- **Mercado Envios Full** (também chamado de "Fulfillment"): o vendedor manda o estoque em lote para
  um centro de distribuição (CD) do Mercado Livre; o ML armazena, separa, embala e despacha a cada
  venda, além de cuidar do pós-venda de entrega.
  Fonte: [Envios Fulfillment — Developers Mercado Livre](https://developers.mercadolivre.com.br/pt_br/envios-fulfillment)
  (título e propósito confirmados via resultado de busca; conteúdo integral não acessível, ver nota acima),
  e [Vender com o Full](https://envios.mercadolivre.com.br/mercado-envios-full).

- **Mercado Envios Coleta**: o vendedor mantém o estoque, mas em vez de postar nos Correios/agência,
  agenda uma retirada gratuita no próprio endereço (casa ou empresa); a transportadora do Mercado
  Livre busca o pacote em horário agendado e leva até o CD/rede de distribuição para expedição.
  Fonte: [Mercado Envios Coleta: o que é e como ativar?](https://ecommercenapratica.com/blog/mercado-envios-coleta/).

- **Mercado Envios Flex**: o vendedor mantém o estoque no próprio endereço e faz a entrega com
  logística própria (entregador próprio ou parceiro), tipicamente no mesmo dia e limitada à região do
  vendedor. Não há tabela de frete do ML nesse modo: o custo é o que o vendedor contrata para a entrega.
  Fonte: resumo de busca de [Envios Flex do Mercado Livre: custos e requisitos em 2026 — Cargoos](https://cargoos.com.br/blog/envios-flex-mercado-livre)
  (fetch direto da página bloqueado com 403; dado vem do resumo do resultado de busca).

- **Mercado Envios "padrão"** (agência/postagem própria ou coleta avulsa sem os benefícios do Full):
  opção residual para quem não usa Full nem Flex, indicada por blogs para produtos pesados, volumosos
  ou de baixo giro que "não justificam o Full".
  Fonte: resumo de busca sobre frete Full/Flex (ver seção Fontes, item sobre tabela de frete).

## CDs (cidade + fonte)

Centros de distribuição/logísticos do Mercado Livre no Brasil confirmados por notícia com cidade
nomeada:

| Cidade | UF | Detalhe | Fonte |
|---|---|---|---|
| Cajamar | SP | Dois CDs anunciados em 2020, 75 mil m² e 112 mil m²; o primeiro entrou em operação em 9/nov/2020 | [InfoMoney](https://www.infomoney.com.br/negocios/mercado-livre-anuncia-5-novos-centros-de-distribuicao-no-brasil-com-foco-em-agilidade-nas-entregas/) |
| Guarulhos | SP | Operação de cross-docking, 50 mil m², perto do aeroporto para reduzir prazo de entrega | [InfoMoney](https://www.infomoney.com.br/negocios/mercado-livre-anuncia-5-novos-centros-de-distribuicao-no-brasil-com-foco-em-agilidade-nas-entregas/) |
| Louveira | SP | CD que passou a ser 100% operado pelo próprio Mercado Livre (internalização de operação) | citado em resultado de busca sobre Betim/Louveira; fonte primária não confirmada em detalhe, ver nota |
| Extrema | MG | 75 mil m², início de operação previsto para meados de 2021 | [InfoMoney](https://www.infomoney.com.br/negocios/mercado-livre-anuncia-5-novos-centros-de-distribuicao-no-brasil-com-foco-em-agilidade-nas-entregas/) |
| Betim | MG | CD de 80 mil m² na Região Metropolitana de Belo Horizonte, anunciado para abrir no fim de 2022, ~2 mil empregos | [Diário do Comércio](https://diariodocomercio.com.br/negocios/mercado-livre-vai-construir-cd-em-betim/) |
| Governador Celso Ramos | SC | Um dos 5 CDs anunciados em 2020 | [InfoMoney](https://www.infomoney.com.br/negocios/mercado-livre-anuncia-5-novos-centros-de-distribuicao-no-brasil-com-foco-em-agilidade-nas-entregas/) |
| Cabo de Santo Agostinho | PE | CD PE01, 60 mil m², início de operação em julho/2024, ~2.500 empregos previstos | [Jamildo/JC](https://jamildo.com/economia/mercado-livre-comeca-a-operar-central-de-distribuicao-no-cabo-agora-em-julho.html) |
| Lauro de Freitas | BA | CD já instalado na Região Metropolitana de Salvador (citado como base existente antes da expansão de 2025) | resumo de busca citando [Bahia Econômica](https://bahiaeconomica.com.br/wp/2024/09/24/mercado-livre-vai-dobrar-centros-de-distribuicao-no-brasil-ate-2025-bahia-ganhara-nova-unidade/) |
| Itaitinga | CE | Novo CD no Nordeste (Ceará), inauguração prevista para 1º trimestre de 2025 | [Diário do Nordeste](https://diariodonordeste.verdesmares.com.br/negocios/mercado-livre-vai-inaugurar-centro-de-distribuicao-em-itaitinga-no-primeiro-trimestre-de-2025-1.3573271) |
| Recife | PE | Novo CD citado entre as aberturas de 2024 | [E-Commerce Brasil](https://www.ecommercebrasil.com.br/noticias/mercado-livre-chega-a-21-centros-de-distribuicao-ate-2025) |
| Porto Alegre | RS | Novo CD citado entre as aberturas de 2024 | [E-Commerce Brasil](https://www.ecommercebrasil.com.br/noticias/mercado-livre-chega-a-21-centros-de-distribuicao-ate-2025) |
| Distrito Federal (Brasília/entorno) | DF | Novo CD citado entre as aberturas de 2024 | [E-Commerce Brasil](https://www.ecommercebrasil.com.br/noticias/mercado-livre-chega-a-21-centros-de-distribuicao-ate-2025) |
| Paraná (estado, cidade não confirmada na pesquisa) | PR | Novo CD previsto para 2025; busca por "São José dos Pinhais" não trouxe confirmação de CD do ML nessa cidade especificamente | [E-Commerce Brasil](https://www.ecommercebrasil.com.br/noticias/mercado-livre-chega-a-21-centros-de-distribuicao-ate-2025) |

Escala nacional (números agregados, sem lista completa de cidades):

- Início de 2024: 10 CDs em operação no Brasil. Meta para 2025: 21 CDs, mais que dobrando a rede, com
  63% das novas unidades fora do estado de São Paulo (foco em Nordeste, Centro-Oeste e Sul).
  Investimento associado de R$ 23 bilhões no Brasil anunciado pelo grupo.
  Fonte: [E-Commerce Brasil — Mercado Livre chegará a 21 Centros de Distribuição até 2025](https://www.ecommercebrasil.com.br/noticias/mercado-livre-chega-a-21-centros-de-distribuicao-ate-2025).
- Em 2020/2021, a expansão de 5 novos CDs levou a capacidade de armazenagem de 305 mil m² para
  610 mil m² e ampliou a lista de cidades atendidas em até 2 dias para 1.800 municípios.
  Fonte: [InfoMoney](https://www.infomoney.com.br/negocios/mercado-livre-anuncia-5-novos-centros-de-distribuicao-no-brasil-com-foco-em-agilidade-nas-entregas/).

HIPÓTESE: não foi possível, nesta pesquisa, obter uma lista oficial e completa e atualizada (2026) de
todos os CDs do Full com endereço/cidade exata publicada pelo próprio Mercado Livre; a tabela acima é
reconstruída a partir de notícias de imprensa e cobre o histórico de anúncios encontrados, não
necessariamente todos os CDs ativos hoje.

## Inbound ao Full

Como o vendedor manda o estoque do Full para o CD, segundo fontes:

- **Duas formas de transporte até o CD**: (1) o próprio vendedor leva o produto com veículo próprio ou
  contrata uma transportadora por conta própria até o CD; (2) solicitar o serviço de coleta do Mercado
  Livre no endereço do vendedor, pagando uma taxa de serviço variável conforme volume de mercadoria e
  distância. Em ambos os casos o custo do transporte até o CD é do vendedor, seja pago diretamente a um
  transportador terceiro, seja pago como taxa de serviço ao ML.
  Fonte: resumo de busca do artigo oficial [O que considerar ao fazer seu primeiro envio ao Full — Vendedores Mercado Livre](https://vendedores.mercadolivre.com.br/nota/o-que-considerar-ao-fazer-seu-primeiro-envio-ao-full)
  (fetch direto bloqueado com 403; dado vem do resumo do resultado de busca, que cita a página oficial).

- **Cobertura geográfica da coleta**: segundo o mesmo resumo, a opção de coleta para envio ao Full só
  está disponível em SP, RJ, MG, BA e SC — nos demais estados o vendedor precisa levar o estoque por
  conta própria (ou de fornecedor) até o CD mais próximo, o que é justamente o ponto de fricção que
  pesa mais para quem fabrica longe do Sudeste/Sul.
  Fonte: mesmo resumo de busca citado acima.

- **Agendamento obrigatório e multa por não comparecimento/divergência**: o vendedor cria a remessa no
  painel do Mercado Livre, segue as orientações de embalagem/etiquetagem e agenda uma janela de entrega
  no CD. Se o vendedor agendar e não comparecer, ou entregar quantidade diferente da planejada, o
  Mercado Livre cobra R$ 5,00 por unidade divergente/não entregue.
  Fonte: resumo de busca do artigo [O que é o Mercado Livre Full? — Ideris](https://www.ideris.com.br/blog/o-que-e-o-mercado-envios-full/),
  que cita esse valor como regra do programa.

- **Custo de armazenagem e giro**: a Ideris cita que produtos parados há mais de 4 meses sem venda no
  CD passam a ter taxa de armazenagem de R$ 2,00/unidade/mês. A GoSmarter (ver abaixo) dá uma curva
  diferente, por faixa de dias e porte do produto — os dois números não batem exatamente entre si
  porque vêm de blogs terceiros interpretando a tabela oficial em momentos/formatos diferentes; nenhum
  dos dois é a tabela oficial em si.
  Fontes: [Ideris](https://www.ideris.com.br/blog/o-que-e-o-mercado-envios-full/) e
  [GoSmarter — Mercado Envios Full 2026: Vale a Pena? Custos](https://gosmarter.com.br/mercado-envios-full-vale-a-pena-2026/).

- **Curva de custo de armazenagem por tempo parado (GoSmarter, 2026)**: de 0 a 60 dias parado, a partir
  de R$ 0,10/unidade/dia para itens pequenos; após 60 dias, a partir de R$ 0,50/unidade/dia para
  pequenos, podendo passar de R$ 5,00/unidade/dia para itens grandes. Taxa de manuseio de fulfillment
  (CFF) citada a partir de R$ 3,50 por unidade vendida.
  Fonte: [GoSmarter — Mercado Envios Full 2026: Vale a Pena? Custos](https://gosmarter.com.br/mercado-envios-full-vale-a-pena-2026/).

- **Perfil de produto recomendado para o Full**: giro rápido (venda em 30 a 45 dias é considerado
  ideal; acima de 60 dias parado a armazenagem penaliza fortemente), peso baixo (uma fonte cita como
  referência produtos de até ~5 kg), volume mínimo de saída por SKU. Produtos "grandes, pesados ou
  frágeis" são apontados como geralmente inadequados ao Full por elevarem o custo logístico.
  Fontes: [GoSmarter](https://gosmarter.com.br/mercado-envios-full-vale-a-pena-2026/) e resumo de busca
  citando [Jaguar Sheet — O que é Full e Flex no Mercado Livre](https://jaguarsheet.com/pt/blog/mercado-livre-flex-vs-full)
  (o limite de "5 kg" apareceu apenas no resumo de busca inicial, sem confirmação por fetch direto da
  página — tratar como HIPÓTESE de valor exato, ainda que a direção geral — "Full é para leve e de giro
  rápido" — apareça em múltiplas fontes independentes).

- **Requisitos fiscais/cadastrais para aderir ao Full**: regime tributário Simples Nacional, Lucro Real
  ou Presumido; faturamento bruto anual máximo de R$ 4,8 milhões (empresas de pequeno porte) ou
  R$ 360 mil (microempresas); certificado digital A1 obrigatório.
  Fonte: resumo de busca do artigo [Ideris — O que é o Mercado Livre Full?](https://www.ideris.com.br/blog/o-que-e-o-mercado-envios-full/).

- **Retirada de estoque do Full**: existe fluxo formal para o vendedor solicitar a retirada ou o
  descarte do estoque parado no CD.
  Fonte: [Como retirar ou descartar estoque do Full — Vendedores Mercado Livre](https://vendedores.mercadolivre.com.br/aprender/nota/como-retirar-meu-estoque-do-full)
  (título e existência do fluxo confirmados via resultado de busca; fetch direto do conteúdo bloqueado
  com 403, então os detalhes de custo/prazo dessa retirada não puderam ser verificados nesta pesquisa —
  marcar como HIPÓTESE qualquer valor específico de custo de retirada).

## Onde a fábrica perto do CD economiza

Juntando os pontos acima, o "ganho de frete" concreto de produzir perto de um CD do Full é:

1. **Frete inbound (fábrica → CD) vira transporte curto e local**, em vez de uma rota interestadual
   longa. Como o custo desse trecho é do vendedor (transporte próprio, contratado, ou taxa de coleta do
   ML por volume/distância — ver seção Inbound), produzir a poucos km do CD reduz diretamente esse
   custo, que escala com peso e volume — exatamente o perfil de material de limpeza (produto pesado,
   volumoso, de baixo valor unitário, onde o frete pesa proporcionalmente mais no preço final).
   Fonte: raciocínio construído sobre os dados de inbound citados acima (transporte pago pelo vendedor,
   coleta cobrada por volume/distância) — este parágrafo de síntese não tem uma fonte única que afirme
   "produzir perto do CD economiza X%"; é inferência a partir dos fatos citados, não um dado publicado
   pelo ML. Tratar a conclusão de causa-efeito como HIPÓTESE, mesmo com os fatos-base sendo sourced.

2. **Menos risco de multa por remessa fora da janela**: uma fábrica perto do CD consegue reagendar e
   corrigir uma remessa com mais folga (menor tempo de trânsito) do que uma fábrica distante, reduzindo
   a chance de cair na multa de R$ 5/unidade por não comparecimento ou quantidade divergente.
   Fonte: inferência sobre a regra de multa citada acima ([Ideris](https://www.ideris.com.br/blog/o-que-e-o-mercado-envios-full/)); é HIPÓTESE quanto à magnitude do benefício, não quanto à existência da multa.

3. **Acesso à coleta gratuita/paga do próprio ML só existe hoje em SP, RJ, MG, BA e SC** (segundo o
   resumo da página oficial de "primeiro envio ao Full"). Uma fábrica de material de limpeza localizada
   em um desses estados, perto de um CD, pode usar a coleta do ML em vez de contratar transportadora
   própria; fora desses estados essa opção não existe e o custo do inbound recai inteiramente sobre o
   vendedor com transporte contratado à parte.
   Fonte: mesmo resumo citado na seção Inbound, referente a
   [vendedores.mercadolivre.com.br/nota/o-que-considerar-ao-fazer-seu-primeiro-envio-ao-full](https://vendedores.mercadolivre.com.br/nota/o-que-considerar-ao-fazer-seu-primeiro-envio-ao-full).

4. **Frete de venda (outbound, CD → cliente final) não muda com a localização da fábrica** — uma vez
   que o produto está armazenado no CD, o frete ao comprador final é calculado pelo ML a partir do CD,
   não da fábrica. Ou seja, o ganho de estar perto do CD é só no trecho de inbound (reabastecimento),
   não no frete que o comprador paga.
   Fonte: inferência direta da mecânica do Full descrita nas fontes acima (o CD é quem despacha as
   vendas, fonte: [Envios Fulfillment — Developers Mercado Livre](https://developers.mercadolivre.com.br/pt_br/envios-fulfillment)
   e [Vender com o Full](https://envios.mercadolivre.com.br/mercado-envios-full)); esta conclusão lógica
   não está escrita literalmente em nenhuma fonte, é dedução a partir do desenho do programa.

5. **Peso volumétrico penaliza produto volumoso mesmo quando leve**: o Mercado Livre cobra pelo maior
   entre peso real e peso volumétrico (cubagem). Isso é regra do frete de venda (outbound), não do
   inbound, mas reforça por que produto pesado/volumoso e barato (como material de limpeza) tem margem
   apertada em qualquer modalidade de frete do ML — o ganho de estar perto do CD ataca só a metade
   inbound do problema, não essa penalidade de cubagem no outbound.
   Fonte: resumo de busca citando [Guia de Frete Mercado Livre Brasil 2026 — Duoke](https://www.duoke.com/pt/blog/article/329-guia-custos-frete-mercado-livre-brasil-2026)
   e outros resultados de busca sobre peso volumétrico (ver seção Vocabulário do seller).

## Vocabulário do seller

Termos que um vendedor de Mercado Livre reconheceria, para usar na comunicação com esse público:

- **Full** / **Fulfillment**: estoque armazenado no CD do ML.
- **Flex**: entrega própria, geralmente no mesmo dia, região local.
- **Coleta**: ML busca o produto no endereço do vendedor (tanto para envio avulso quanto, em alguns
  estados, para reabastecer o Full).
- **CD (centro de distribuição)**: armazém do Mercado Livre onde fica o estoque do Full.
- **Remessa** / **envio de estoque ao Full**: o lote de produtos que o vendedor manda para o CD.
- **Agendamento** (de entrega no CD): janela marcada no painel do vendedor para entregar a remessa.
- **CFF (custo de fulfillment)**: taxa por unidade vendida cobrada pelo Full.
- **Armazenagem** / **taxa de armazenagem**: custo por unidade/dia que o produto parado no CD gera.
- **Giro** (giro de estoque, "produto de alto giro"): velocidade de venda; determinante de elegibilidade prática ao Full.
- **Peso real x peso volumétrico** (cubagem): base de cálculo do frete de venda; ML cobra pelo maior dos dois.
- **Reputação** (selo verde/platinum): nível de reputação da loja que define o percentual de subsídio de frete grátis.
- **Frete grátis / subsídio de frete**: faixas de preço em que o ML banca parte ou todo o frete ao comprador (ex.: acima de R$ 79, desconto de até 70% conforme reputação; entre R$ 19 e R$ 78,99, cobertura de 100% do frete para produto novo em envio padrão, segundo fontes de 2025/2026).
- **Inbound**: termo de logística geral (não é jargão oficial do ML) usado neste documento para "envio do estoque do vendedor até o CD", em oposição ao outbound (CD até o comprador).

## Fontes

- [Envios full (página institucional)](https://www.mercadolivre.com.br/l/envios-full)
- [Envios Fulfillment — Developers Mercado Livre](https://developers.mercadolivre.com.br/pt_br/envios-fulfillment) (403 no fetch direto; dados via resumo de busca)
- [Como enviar seus produtos para o centro de distribuição através da coleta? — Ajuda ML](https://www.mercadolivre.com.br/ajuda/como-enviar-produtos-para-centro-de-distribuicao_15648) (403 no fetch direto; dados via resumo de busca)
- [Como retirar ou descartar estoque do Full — Vendedores ML](https://vendedores.mercadolivre.com.br/aprender/nota/como-retirar-meu-estoque-do-full) (403 no fetch direto)
- [O que considerar ao fazer seu primeiro envio ao Full — Vendedores ML](https://vendedores.mercadolivre.com.br/nota/o-que-considerar-ao-fazer-seu-primeiro-envio-ao-full) (403 no fetch direto; dados via resumo de busca)
- [Vender com o Full](https://envios.mercadolivre.com.br/mercado-envios-full) (403 no fetch direto)
- [Mercado Envios Full 2026: Vale a Pena? Custos — GoSmarter](https://gosmarter.com.br/mercado-envios-full-vale-a-pena-2026/) (fetch completo)
- [O que é o Mercado Livre Full? O Fulfillment do Mercado Envios — Ideris](https://www.ideris.com.br/blog/o-que-e-o-mercado-envios-full/) (dados via resumo de busca)
- [O que é Full e Flex no Mercado Livre: custos e comparação 2026 — Jaguar Sheet](https://jaguarsheet.com/pt/blog/mercado-livre-flex-vs-full) (fetch completo)
- [Envios Flex do Mercado Livre: custos e requisitos em 2026 — Cargoos](https://cargoos.com.br/blog/envios-flex-mercado-livre) (403 no fetch direto; dados via resumo de busca)
- [Frete do Mercado Livre em 2026: quem paga e como pagar menos — Cargoos](https://cargoos.com.br/blog/frete-mercado-livre) (403 no fetch direto)
- [Guia de Frete Mercado Livre Brasil 2026 — Duoke](https://www.duoke.com/pt/blog/article/329-guia-custos-frete-mercado-livre-brasil-2026) (fetch completo)
- [Mercado Envios Coleta: o que é e como ativar? — Ecommerce na Prática](https://ecommercenapratica.com/blog/mercado-envios-coleta/) (dados via resumo de busca)
- [Mercado Livre anuncia 5 novos centros de distribuição no Brasil — InfoMoney](https://www.infomoney.com.br/negocios/mercado-livre-anuncia-5-novos-centros-de-distribuicao-no-brasil-com-foco-em-agilidade-nas-entregas/) (fetch completo)
- [Mercado Livre chegará a 21 Centros de Distribuição até 2025 — E-Commerce Brasil](https://www.ecommercebrasil.com.br/noticias/mercado-livre-chega-a-21-centros-de-distribuicao-ate-2025) (fetch completo)
- [Mercado Livre vai dobrar centros de distribuição no Brasil até 2025; Bahia ganhará nova unidade — Bahia Econômica](https://bahiaeconomica.com.br/wp/2024/09/24/mercado-livre-vai-dobrar-centros-de-distribuicao-no-brasil-ate-2025-bahia-ganhara-nova-unidade/) (dados via resumo de busca)
- [Mercado Livre vai inaugurar Centro de Distribuição em Itaitinga no primeiro trimestre de 2025 — Diário do Nordeste](https://diariodonordeste.verdesmares.com.br/negocios/mercado-livre-vai-inaugurar-centro-de-distribuicao-em-itaitinga-no-primeiro-trimestre-de-2025-1.3573271) (dados via resumo de busca)
- [Mercado Livre começa a operar central de distribuição no Cabo, agora em julho — Jamildo/JC](https://jamildo.com/economia/mercado-livre-comeca-a-operar-central-de-distribuicao-no-cabo-agora-em-julho.html) (dados via resumo de busca)
- [Mercado Livre vai construir CD em Betim — Diário do Comércio](https://diariodocomercio.com.br/negocios/mercado-livre-vai-construir-cd-em-betim/) (dados via resumo de busca)
- Regras de frete grátis por faixa de preço (R$ 19 / R$ 79) e mudança de estrutura tarifária em março
  de 2026 (29 faixas de peso x 8 faixas de preço): resumo de busca sem fetch direto individual
  confirmado de uma única fonte primária — tratar os valores exatos de faixas/percentuais como dado de
  blog terceiro (Duoke, Cargoos, GoSmarter, Tecnospeed apareceram nos resultados), não como cópia
  literal de tabela oficial do ML. HIPÓTESE quanto à exatidão fina dos números, mesmo com a direção
  geral (faixas de preço com subsídio decrescente conforme reputação) corroborada por múltiplas fontes.

### Nota metodológica

As páginas oficiais do domínio `mercadolivre.com.br` e `developers.mercadolivre.com.br` bloqueiam o
fetch automatizado usado nesta pesquisa (HTTP 403), então nenhuma delas foi lida na íntegra por esta
pesquisa — apenas via resumos gerados pela ferramenta de busca, que cita e linka a página oficial mas
não garante reprodução literal do texto. Qualquer número que precise de precisão para uma decisão de
negócio (ex.: valor exato de multa, faixa exata de armazenagem, lista completa e atual de CDs) deveria
ser confirmado por login direto no painel do vendedor Mercado Livre ou por contato com o suporte
oficial, não só por esta pesquisa.
