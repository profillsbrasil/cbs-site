# Auditoria de copy: home do site CBS

Escopo: todo texto visível ao visitante na home (`apps/web/src/app/page.tsx`), mais navbar, rodapé e metadados de `<head>`. Fontes primárias de verificação: `apps/web/PRODUCT.md`, `CONTEXT.md` (raiz do repo) e `apps/web/DESIGN.md`. Toda afirmação abaixo carrega a fonte que a sustenta; o que não tem fonte está marcado como HIPÓTESE.

## Inventário

Ordem de leitura da página (topo ao rodapé). Item 0 é metadado de navegador/buscador, não corpo da página; incluído porque também é texto que o visitante em potencial lê antes de abrir o site.

0. **Metadados** (`apps/web/src/app/layout.tsx:13-17`)
   - Title: "CBS | Companhia Brasileira de Saneantes"
   - Description: "Terceirização de produção de saneantes: a CBS fabrica com a sua marca, com autorização ANVISA, e envia de fábricas ao lado dos CDs do Mercado Livre. Você vende, o frete sai menor."

1. **Navbar, logo** (`apps/web/src/components/navbar.tsx:88`): texto alternativo da imagem (não aparece visualmente com a imagem carregada; lido por leitor de tela ou se a imagem falhar) "CBS, Companhia Brasileira de Saneantes".
2. **Navbar, links de seção** (`navbar.tsx:9-13`): "Modelo", "Qualidade", "Malha".
3. **Navbar, CTA** (`navbar.tsx:126-128`): "WhatsApp" (mais texto só de leitor de tela "(abre em nova aba)").
4. **Hero, H1** (`page.tsx:43-47`): "Sua marca, nossa fábrica."
5. **Hero, parágrafo** (`page.tsx:53-58`): "A CBS fabrica os seus saneantes e envia de fábricas ao lado dos centros de distribuição do Mercado Livre, com autorização ANVISA. Você vende, a gente produz perto do CD e o frete sai menor."
6. **Hero, CTA primário** (`cta.tsx:10-23`, chamado em `page.tsx:65`): "Chamar no WhatsApp".
7. **Hero, CTA secundário** (`cta.tsx:38-48`, chamado em `page.tsx:66`): "Enviar e-mail".
8. **Hero, reasseguramento** (`cta.tsx:30-36`, chamado em `page.tsx:68`): "Conversa direta, sem formulário nem cadastro."
9. **Hero, dica de rolagem** (`page.tsx:83`): "Role para acompanhar a entrega".
10. **Estação "modelo", H2** (`page.tsx:257`): "Você vende. A gente fabrica e envia."
11. **Estação "modelo", parágrafo** (`page.tsx:261-265`): "Terceirização completa de produção: a CBS produz o saneante, rotula com a sua marca e despacha direto para o centro de distribuição. Você cuida do anúncio e da venda."
12. **Estação "qualidade", H2** (`page.tsx:272`): "Qualidade com autorização ANVISA."
13. **Estação "qualidade", parágrafo** (`page.tsx:276-280`): "A produção é autorizada pela ANVISA e segue o mesmo padrão de qualidade da formulação ao lacre da caixa. O rótulo é seu. A responsabilidade técnica é da CBS."
14. **Estação "malha", H2** (`page.tsx:287`): "Frete menor porque a fábrica fica perto do CD."
15. **Estação "malha", parágrafo** (`page.tsx:291-295`): "São 6 a 7 fábricas junto aos centros de distribuição do Mercado Livre. O produto sai da fábrica e entra no CD, e esse trecho curto é o que corta o frete de quem vende no ML."
16. **Estação "malha", chips de praça** (`page.tsx:297-302`, dados em `pracas.ts:17-29`): rótulos de região (Sudeste, Sul, Nordeste, Centro-Oeste) e nomes de praça (São Paulo, Minas Gerais, Curitiba, Rio Grande do Sul, Pernambuco, Bahia, Centro do Brasil).
17. **Chegada, H2** (`page.tsx:200-204`): "Entregue no CD. Pronto para vender."
18. **Chegada, parágrafo** (`page.tsx:207-210`): "Diga o que você quer vender. A CBS responde com produto, rótulo, produção e envio."
19. **Chegada, CTA primário** (`page.tsx:214`): "Falar com a CBS".
20. **Chegada, CTA secundário** (`page.tsx:215`): "Enviar e-mail".
21. **Chegada, reasseguramento** (`page.tsx:217`): "Conversa direta, sem formulário nem cadastro." (repete o item 8).
22. **Rodapé, wordmark** (`footer.tsx:52-58`): "CBS" (link "Voltar ao topo", `aria-label`).
23. **Rodapé, parágrafo de marca** (`footer.tsx:59-62`): "Companhia Brasileira de Saneantes. Fabricamos com a sua marca, ao lado dos centros de distribuição do Mercado Livre."
24. **Rodapé, CTAs** (`footer.tsx:65-66`): "Falar com a CBS", "Enviar e-mail" (repetem itens 19 e 20).
25. **Rodapé, linha de copyright** (`footer.tsx:70-78`): "© 2026 CBS · Companhia Brasileira de Saneantes · othavioquiliao@gmail.com".
26. **Rodapé, selo ANVISA** (`footer.tsx:79-89`): "Autorizada pela ANVISA" / "Fabricação de saneantes".

## Sustentação por argumento

Os três argumentos definidos pelo cliente, na ordem do `PRODUCT.md` (linha 19): frete, qualidade, ANVISA.

- **Item 0 (metadados):** frete + ANVISA explícitos na description ("com autorização ANVISA... o frete sai menor"); nada de qualidade. Verificável: `PRODUCT.md:19,30`.
- **Item 1 (alt do logo):** nenhum dos três; é identidade de marca. Verificável (grafia "CBS" e nome por extenso): `PRODUCT.md:35`.
- **Item 2 (links de seção):** rótulos de navegação que espelham as três estações da página (modelo, qualidade, malha); não fazem afirmação por si. Sem conteúdo a verificar.
- **Item 3, 6, 7, 19, 20, 24 (CTAs):** nenhum dos três; são canal de contato. Verificável contra número e link: `PRODUCT.md:29` e `apps/web/src/components/contact.tsx:5-8` (WhatsApp `+55 19 99689-4236` / `wa.me/5519996894236`; e-mail `othavioquiliao@gmail.com`). Os valores batem em código e documento.
- **Item 4 (H1 "Sua marca, nossa fábrica"):** resume o modelo de terceirização (não é um dos três argumentos, é a premissa deles). Verificável: `PRODUCT.md:19` ("o contratante vende sob a marca dele, a CBS fabrica e envia").
- **Item 5 (parágrafo do hero):** frete ("produz perto do CD e o frete sai menor") + ANVISA ("com autorização ANVISA") explícitos; qualidade não aparece nesta frase. Verificável: `PRODUCT.md:19` (malha reduz frete) e `PRODUCT.md:30` (ANVISA concedida).
- **Item 8, 21 (reasseguramento):** nenhum dos três; reforça a Capability "sem backend, sem formulário, sem captura de dados". Verificável: `PRODUCT.md:27`.
- **Item 9 (dica de rolagem):** nenhum dos três; instrução de UI, sem afirmação factual a checar.
- **Item 10 (H2 "modelo"):** nenhum dos três diretamente; descreve o modelo de terceirização, pré-requisito dos três. Verificável: `PRODUCT.md:19`.
- **Item 11 (parágrafo "modelo"):** sustenta o modelo (não um dos três argumentos-alvo) com dois detalhes verificáveis: "rotula com a sua marca" bate com a definição canônica de Marca própria (`CONTEXT.md:21-23`); "despacha direto para o centro de distribuição" bate com o Operating Context (`PRODUCT.md:23`, "a CBS produz perto do CD e entrega nele").
- **Item 12 (H2 "qualidade"):** qualidade + ANVISA, os dois nomeados juntos. Verificável: `PRODUCT.md:19` (padrões de qualidade) e `PRODUCT.md:30` (ANVISA concedida).
- **Item 13 (parágrafo "qualidade"):** qualidade + ANVISA na primeira frase ("autorizada pela ANVISA e segue o mesmo padrão de qualidade"), verificável do mesmo modo que o item 12. As duas frases seguintes não são verificáveis nos documentos-fonte: "segue o mesmo padrão de qualidade da formulação ao lacre da caixa" detalha um processo (da fórmula ao lacre) que não está descrito em `PRODUCT.md` nem `CONTEXT.md`; "A responsabilidade técnica é da CBS" introduz um termo regulatório (responsável técnico) que não aparece em nenhum dos dois documentos. **HIPÓTESE** (sem fonte no repositório): o detalhe de processo e a atribuição de responsabilidade técnica.
- **Item 14 (H2 "malha"):** frete. Verificável: `PRODUCT.md:19`, `CONTEXT.md:39-41` (Ganho de frete).
- **Item 15 (parágrafo "malha"):** frete, com o número "6 a 7 fábricas" batendo exatamente com `PRODUCT.md:19` ("malha de 6 a 7 fábricas posicionadas junto aos CDs do Mercado Livre").
- **Item 16 (chips de praça):** frete (a malha é o argumento). As 7 praças (São Paulo, Minas Gerais, Curitiba, Rio Grande do Sul, Pernambuco, Bahia, Centro do Brasil) batem com a lista de `PRODUCT.md:19` e com a definição de Praça em `CONTEXT.md:35-37`.
- **Item 17 (H2 "Entregue no CD. Pronto para vender."):** frete/entrega, fechamento da jornada. Verificável: `PRODUCT.md:23` (entrega no CD).
- **Item 18 (parágrafo "Diga o que você quer vender..."):** nenhum dos três diretamente; é convite à conversa. Ver observação em Contradições, abaixo, sobre o alcance implícito desta frase.
- **Item 22, 23 (rodapé, wordmark e parágrafo):** frete (proximidade dos CDs) + modelo. Verificável: `PRODUCT.md:19,23`.
- **Item 25 (copyright):** identidade e contato; e-mail bate com `PRODUCT.md:29` e `contact.tsx:7`.
- **Item 26 (selo ANVISA):** ANVISA. Verificável: `PRODUCT.md:30`.

**Observação estrutural (não é item de copy isolado, é ordem de argumentos):** `PRODUCT.md:49` (Product Principle 2) fixa "Frete é o argumento-mestre: a malha... abre a narrativa, qualidade e ANVISA sustentam". Na página renderizada (`page.tsx:255-303`), a ordem das três estações é modelo, qualidade, malha, ou seja, o argumento de frete (estação "malha") vem por último entre as três, não abre a narrativa das estações. O hero (item 5) já menciona frete e ANVISA antes de qualquer estação, o que atenua o ponto, mas frete só recebe desenvolvimento completo (número de fábricas, lista de praças) na última estação, não na primeira. Fonte: `PRODUCT.md:49` versus ordem de render em `page.tsx:255-303`.

**Observação de asset (fora do escopo de copy, mas achado de verificabilidade):** `PRODUCT.md:36` documenta o logo recebido como `public/cbs-logo.jpeg`; o navbar carrega `/cbs-logo.png` (`navbar.tsx:92`) e só existe `cbs-logo.png` em `apps/web/public/`. Não é contradição de conteúdo, é documentação desatualizada: o PNG provavelmente é a versão de fundo transparente que `PRODUCT.md:36` lista como pendência, mas isso não está registrado no documento.

## Perguntas sem resposta

Perguntas que um contratante em potencial teria ao ler a página, sem resposta nela nem em `PRODUCT.md`/`CONTEXT.md` (marcadas HIPÓTESE quando é minha inferência sobre a lacuna, não um fato documentado):

1. Quais produtos exatamente a CBS fabrica? A página só usa o termo genérico "saneantes"; nenhuma lista de categorias (desinfetante, detergente, alvejante, água sanitária, conforme a própria definição de Saneante em `CONTEXT.md:9-11`) aparece na home. `PRODUCT.md:44` confirma que não existe portfólio de produtos ainda.
2. Existe lote mínimo de produção (MOQ)? Não mencionado em nenhuma fonte.
3. Quem desenvolve a fórmula do produto: o contratante traz uma fórmula pronta, ou a CBS oferece formulações próprias? O item 18 ("Diga o que você quer vender. A CBS responde com produto...") sugere que a CBS decide o produto, mas isso não está detalhado em nenhum documento.
4. Quem faz a arte do rótulo (design gráfico)? O item 13 diz "o rótulo é seu" (a marca é do contratante, conforme `CONTEXT.md:21-23`), mas nenhuma fonte diz se a CBS aplica uma arte que o contratante já traz pronta ou se também desenha o rótulo.
5. Qual o prazo entre fechar negócio e o produto chegar no CD? Não mencionado.
6. Depois do clique em WhatsApp ou e-mail, qual é o próximo passo prático (orçamento, amostra, contrato, visita)? Não descrito.
7. Existe faixa de investimento ou tabela de preço, ainda que aproximada? Não mencionado (esperado para site institucional sem venda direta, mas é pergunta natural de quem cotaria o serviço).
8. Quem é o "responsável técnico" citado implicitamente no item 13 ("A responsabilidade técnica é da CBS")? Nenhuma fonte identifica pessoa, registro profissional ou o que esse termo cobre.
9. A empresa já está fabricando hoje, ou ainda está montando a operação? `PRODUCT.md:15` registra que a empresa "está cotando equipamentos" e que a comunicação fala no presente por decisão do dono; o visitante não tem como saber disso lendo só a página, que usa presente do indicativo o tempo todo ("A CBS fabrica...", "Fabricamos..."). HIPÓTESE (inferência sobre a lacuna, não fato documentado): essa é uma pergunta plausível de quem pesquisa a empresa antes de fechar negócio.
10. A CBS atende contratantes fora do Mercado Livre (loja própria, outros marketplaces)? Toda a página fala no contexto do ML (`PRODUCT.md:23`); nada indica se o modelo se restringe a isso.
11. Dados formais da empresa (CNPJ, razão social) não aparecem na página. Não é exigido pelo PRODUCT.md, mas é pergunta natural de due diligence de um contratante.

## Contradições de vocabulário

Termos canônicos de `CONTEXT.md` e suas listas "Avoid" foram checados contra todo o texto visível listado no Inventário (itens 0 a 26).

- **Saneante** (evitar "produto químico", "químicos"): não encontrado nenhum uso desses termos evitados no texto visível. O item 18 usa a palavra genérica "produto" (não "produto químico"), fora do escopo do termo evitado.
- **Terceirização de produção** (evitar "white label", "private label", "terceirização" sozinho): o item 11 usa "Terceirização completa de produção", forma explícita e não ambígua. Nenhum uso de white label/private label encontrado.
- **Contratante** (evitar "cliente", "parceiro" para se referir ao visitante): a página nunca chama o visitante de "cliente" ou "parceiro"; usa sempre "você" (itens 5, 11, 18). Nenhuma contradição encontrada.
- **Marca própria** (evitar "marca branca"): termo não usado no texto visível. Nenhuma contradição.
- **Fábrica** (evitar "planta", "unidade fabril", "filial"): a página usa "fábrica"/"fábricas" de forma consistente (itens 4, 10, 11, 14, 15). Nenhum dos termos evitados aparece.
- **CD** (evitar "hub", "armazém", "galpão"): a página usa "CD" e "centro(s) de distribuição" (itens 5, 11, 15, 17, 23). Nenhum termo evitado encontrado no texto visível.
- **Praça** (evitar "endereço", "unidade", "localização da fábrica"): os chips (item 16) mostram só nomes de praça, sem qualificação de endereço ou localização. Nenhuma contradição.
- **Ganho de frete** (evitar "logística", "economia de custos"): a página usa "frete" diretamente ("o frete sai menor", "corta o frete", itens 5 e 15); nenhum uso de "logística" ou "economia de custos" encontrado no texto visível.

Nenhuma contradição de vocabulário canônico (termos da lista "Avoid" de `CONTEXT.md`) foi encontrada no texto visível da home. O único ponto fora do vocabulário controlado por `CONTEXT.md` é o termo "responsabilidade técnica" no item 13, que não é um termo evitado (não consta na lista Avoid de nenhuma entrada), mas também não é um termo canônico definido em `CONTEXT.md`; é vocabulário novo, introduzido sem definição nem fonte. Ver item 13 em Sustentação e pergunta 8 em Perguntas sem resposta.
