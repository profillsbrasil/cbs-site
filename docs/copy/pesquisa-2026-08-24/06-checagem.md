# Checagem factual: 05-proposta-copy.md

Escopo: toda afirmação factual das seções **B** e **C** de `05-proposta-copy.md`, mais as três
checagens pedidas (termos "Avoid" do `CONTEXT.md`, travessões, proibições do `PRODUCT.md`).

Fontes admitidas: `01-mercado.md`, `02-anvisa.md`, `03-logistica-ml.md`, `04-site-atual.md`,
`/home/othavio/Work/cbs-2/cbs-site/apps/web/PRODUCT.md`, `/home/othavio/Work/cbs-2/cbs-site/CONTEXT.md`
e o código do repo (leitura direta). Toda contagem vem de comando inline, colado como evidência.

Legenda: **C** confirmado · **R** refutado · **SF** sem fonte / não verificável · **P** parcial (fato-base sourced, conclusão marcada HIPÓTESE na própria fonte)

---

## B1. Metadados

| # | Afirmação | Veredito | Evidência |
|---|---|---|---|
| 1 | Title atual = "CBS \| Companhia Brasileira de Saneantes" | C | `layout.tsx:16`: `title: "CBS | Companhia Brasileira de Saneantes",` |
| 2 | Description atual (citada literalmente) | C | `layout.tsx:15`, texto idêntico caractere a caractere |
| 3 | Referência `layout.tsx:13-17` | C | `grep -n` → 13 `export const metadata: Metadata = {`, 17 `};` |
| 4 | "o `PRODUCT.md` diz que o visitante típico chega buscando 'CBS' depois de ouvir o nome numa cotação" | C | `PRODUCT.md:11`: "pessoas que pesquisam 'CBS' após receberem menção da empresa em cotações e conversas comerciais" |
| 5 | "a expansão continua no **H1 do rodapé**" | **R** | `rg -n '<h1' apps/web/src` → **1 match**, `page.tsx:43` (hero "Sua marca, nossa fábrica"). O rodapé não tem heading nenhum: `rg -n '<h[1-6]' footer.tsx` → 0. Controle: o mesmo comando acha o único h1 existente, logo detecta positivos. |
| 6 | "...e no alt do logo" | C | `navbar.tsx:88`: `alt="CBS, Companhia Brasileira de Saneantes"` |
| 7 | "A description encolhe para caber nos ~160 caracteres que o Google exibe" | **R** | `python3 len()` → proposta = **167** caracteres (atual = 179). Encolhe 12, mas não cabe em 160. |
| 8 | "pesquisa 03, item 4: o outbound não muda com a posição da fábrica" | P | `03:161-168` afirma exatamente isso, **e** declara: "esta conclusão lógica não está escrita literalmente em nenhuma fonte, é dedução a partir do desenho do programa" |
| 9 | Copy: "em fábricas instaladas junto aos CDs do Mercado Livre" | C | `PRODUCT.md:19` e `CONTEXT.md:28` |
| 10 | Copy: "a remessa até o CD sai mais barata" | P | Fato-base sourced (`03:77-83`: custo do inbound é do vendedor). Relação causa-efeito marcada HIPÓTESE na fonte: `03:146` "este parágrafo de síntese não tem uma fonte única que afirme 'produzir perto do CD economiza X%'" |

## B2. Hero

| # | Afirmação | Veredito | Evidência |
|---|---|---|---|
| 11 | Hero atual citado literalmente; ref `page.tsx:43-83` | C | `page.tsx:43` `<h1`, `:44-47` "Sua marca, / nossa fábrica.", `:54-58` parágrafo idêntico, `:83` "Role para acompanhar a entrega" |
| 12 | "nenhum concorrente pesquisado tem equivalente [ao H1]" | **SF** | `01-mercado.md` não registra H1/headline de nenhum concorrente. Sem caso de controle, a afirmação de "nenhum" não é verificável. |
| 13 | "'a gente' quebra a voz institucional pedida no `PRODUCT.md`" | P | `PRODUCT.md:37`: "Voz: institucional, no presente". A norma existe; o juízo "a gente quebra" é editorial, não factual. |
| 14 | "a pesquisa 03 mostra que o ganho é no inbound" | P | `03:136-146` e `03:161-168`; ambos os trechos marcados HIPÓTESE quanto à causa-efeito |
| 15 | "o contratante que vende no ML sabe disso" | **SF** | Nenhuma das 4 pesquisas mede conhecimento do seller. |
| 16 | "a pesquisa 02 alerta que misturar a autorização da empresa com o benefício do produto é o começo da alegação imprecisa" | C | `02:31`: "'Autorizada pela ANVISA' como frase solta, sem qualificar o quê: pode induzir o leitor a achar que é o produto (e não a empresa) que tem autorização" |
| 17 | Copy proposta: "Produção com autorização ANVISA." | P + inconsistência interna | `PRODUCT.md:30` autoriza a afirmação ("autorização ANVISA concedida") e `02:22` valida a forma "empresa autorizada pela ANVISA para fabricação de saneantes". Mas a frase proposta continua não distinguindo empresa de produto — exatamente o defeito que B4 (`05:107`) chama de "a correção mais importante da proposta". |

## B3. Estação Modelo

| # | Afirmação | Veredito | Evidência |
|---|---|---|---|
| 18 | Texto atual citado; ref `page.tsx:255-268` | C | `page.tsx:255` `<Station`, `:256` `anchor="modelo"`, `:257` título, `:262-265` parágrafo idêntico |
| 19 | "A CBS não assina o produto final" vem do `CONTEXT.md` | C | `CONTEXT.md:22`, literal: "A CBS não assina o produto final." |
| 20 | "nenhuma das **oito** páginas de concorrentes lidas declara de quem é a marca no produto acabado" | **R** | (a) Contagem: `sed -n '/^## Concorrentes/,/^Tentativas/p' 01-mercado.md \| rg -c '^[0-9]+\. \*\*'` → **9**, não 8. (b) A lacuna que `01:86` registra é "quem é o *dono regulatório* do produto", não titularidade de marca. O `01` não observa titularidade de marca em lugar nenhum. |
| 21 | Copy proposta: "a CBS produz o saneante, **envasa**, aplica o seu rótulo" | **SF** | Envase como etapa da CBS não aparece em `PRODUCT.md`, `CONTEXT.md` nem em 01-04. A tabela D só pergunta *volumes* de envase (D#13), pressupondo a etapa sem confirmá-la. |

## B4. Estação Qualidade

| # | Afirmação | Veredito | Evidência |
|---|---|---|---|
| 22 | Texto atual citado; ref `page.tsx:270-283` | C | `page.tsx:270` `anchor="qualidade"`, `:272` título, `:276-280` parágrafo idêntico (o `<Station` abre em 269, off-by-one irrelevante) |
| 23 | "A pesquisa 02 separa quatro figuras: AFE, licença sanitária, RT, notificação/registro" | C | `02:7-17`, as quatro numeradas exatamente assim. Soma fecha: 4 figuras, 4 itens. |
| 24 | "A pesquisa 02 indica o oposto: o dossiê e o rótulo continuam com o detentor da marca" | P | `02:38` afirma isso **e** se autodeclara: "HIPÓTESE quanto à formulação exata desse trecho da norma (não foi possível acessar o texto integral da RDC 989/2025 diretamente; a leitura vem de resumo de fonte secundária)" |
| 25 | Copy (sem colchete): "A notificação ou o registro do produto na ANVISA fica **no CNPJ do contratante**" | **SF** | `02:38` fala em responsabilidade da contratante, nunca em "CNPJ". Além disso o próprio documento lista a frase como pendente: D#6 (`05:234`) pede a confirmação ao Gulberto. Afirmação apresentada como texto final apesar de aberta. |
| 26 | Copy (sem colchete): "a CBS **fornece a documentação técnica de fabricação** para abrir esse processo" (repetida em C1 passo 3 e C3 resposta 3) | **SF** | Não aparece em 01, 02, 03, 04, `PRODUCT.md` nem `CONTEXT.md`. E **não tem linha na tabela D**, violando a regra do próprio documento (`05:4` e `05:225`). |
| 27 | "das **oito** páginas pesquisadas, só a FAQ da Multlabel toca nesse ponto" | P | Conteúdo confirmado por `01:86` ("nenhuma das outras 7 páginas fetchadas aborda esse ponto proativamente"); o denominador 8 conflita com os 9 concorrentes enumerados em `01` (ver linha 20). |
| 28 | "[confirmar CBPF]" e "[confirmar o controle]" | C (lacuna declarada) | D#4 e D#5 cobrem as duas |

## B5. Estação Malha

| # | Afirmação | Veredito | Evidência |
|---|---|---|---|
| 29 | Texto atual citado; ref `page.tsx:285-303` | C | `:285` `anchor="malha"`, `:287` título, `:291-295` parágrafo idêntico, `:303` `</Station>` |
| 30 | "A malha tem de 6 a 7 fábricas, cada uma perto de um CD do Mercado Livre" | C | `PRODUCT.md:19` "malha de 6 a 7 fábricas posicionadas junto aos CDs do Mercado Livre"; `CONTEXT.md:28` "O plano tem de seis a sete" |
| 31 | "Quem vende no Full paga o transporte da remessa até o CD" | C (com ressalva de fonte) | `03:77-83`: "em ambos os casos o custo do transporte até o CD é do vendedor". Ressalva registrada na própria 03: página oficial do ML deu 403, dado vem de resumo de busca. |
| 32 | Copy (sem colchete): "e é esse trecho que **a CBS encurta**" (idem C1 passo 4, "entrega no centro de distribuição") | **SF** | D#17 (`05:245`) declara em aberto se a CBS entrega no CD ou no endereço do contratante, e diz que "isso muda a frase inteira da malha". A frase foi escrita como final mesmo assim. |
| 33 | "a coleta do Mercado Livre só existe em SP, RJ, MG, BA e SC" | C (com ressalva de fonte) | `03:85-89` e `03:153-159`; mesma ressalva de 403/resumo |
| 34 | Copy: "Saneante é produto pesado e de baixo valor por unidade" | P | `03:142` diz isso de "material de limpeza", dentro do parágrafo que `03:146` marca como HIPÓTESE |
| 35 | Copy: "cada quilômetro a menos aparece **no preço final**" | **SF** e em tensão com a fonte | `03:161-168` estabelece que o frete que o comprador paga (outbound) **não** muda com a posição da fábrica. "Preço final" é ambíguo e admite exatamente a leitura que B1 e B2 dizem estar corrigindo. Nenhuma fonte quantifica "cada quilômetro". |
| 36 | "conforme o Princípio 2 do `PRODUCT.md`" (frete abre a narrativa) | C | `PRODUCT.md:49`: "Frete é o argumento-mestre: a malha junto aos CDs do ML abre a narrativa" |

## B6. Chegada

| # | Afirmação | Veredito | Evidência |
|---|---|---|---|
| 37 | Texto atual citado; ref `page.tsx:199-218` | C | `:201-204` H2, `:207-210` parágrafo idêntico |
| 38 | "a pesquisa 01 lista 'qual o investimento inicial' e 'quanto tempo leva a produção' entre as perguntas que aparecem **em toda FAQ de concorrente**" | **R** | `01:71-72` atribui as duas **apenas à Tekclean**: "Qual o valor do investimento inicial? (Tekclean)" / "Quanto tempo leva a produção? (Tekclean)". Nenhuma outra FAQ é citada para elas. |
| 39 | "Nomear os **cinco** itens da resposta" | C (soma fecha) | Copy proposta lista: produto, envase, rótulo, prazo, preço por unidade = **5** |
| 40 | Copy: "preço por unidade" | C (lacuna declarada) | D#15 |
| 41 | Copy: "Resposta em [confirmar prazo]" | C (lacuna declarada) | D#16 |

## B7. Rodapé

| # | Afirmação | Veredito | Evidência |
|---|---|---|---|
| 42 | Texto atual do rodapé citado; ref `footer.tsx:59-89` | C | `:60` parágrafo, `:71` copyright, `:83` "Autorizada pela ANVISA", `:86` "Fabricação de saneantes" |
| 43 | "'Fabricamos' é a **última** sobra de primeira pessoa do plural na página" | **R** | `rg -i -P '\b(nossa\|nosso\|fabricamos\|produzimos\|entregamos\|atendemos)\b'` → o H1 `page.tsx:43-47` é "Sua marca, **nossa** fábrica.", primeira pessoa do plural, e a proposta o mantém intacto (`05:59`). Como *verbo*, "Fabricamos" é o único; como pessoa gramatical, não. |
| 44 | "a pesquisa 04 registra a ausência [de razão social e CNPJ] como lacuna 11" | C | `04:83`, item 11: "Dados formais da empresa (CNPJ, razão social) não aparecem na página" |
| 45 | "O número da AFE é dado público consultável no portal da ANVISA (pesquisa 02)" | C | `02:26`: "É legítimo mencionar o número da AFE (...) pois são dados públicos consultáveis no sistema da própria ANVISA" |
| 46 | "repete o termo canônico do `CONTEXT.md`" | C | `CONTEXT.md:13`: entrada canônica "**Terceirização de produção**" |
| 47 | "no lugar onde os buscadores mais olham" | **SF** | Nenhuma fonte da pesquisa trata de peso de SEO por região da página |
| 48 | "verificável em trinta segundos" | **SF** | Número retórico, sem medição em nenhuma fonte |

## C. Introdução das seções novas

| # | Afirmação | Veredito | Evidência |
|---|---|---|---|
| 49 | "as **oito** páginas de concorrentes lidas **escondem** lote mínimo, prazo e processo atrás de 'fale com um consultor'" | **R** | Refutada em três pontos por `01`: `01:46` "Império das Essências fixa '100 unidades por SKU'"; `01:50` "Tekclean é o único que dá um número direto ('de 30 a 90 dias')"; `01:49` Império publica "um cronograma de 11 etapas". Contagem também errada (9 concorrentes enumerados). A frase "fale com um consultor" não aparece em `01`: `rg -i 'fale com um consultor' 01-mercado.md` → 0 matches. |
| 50 | "os rótulos de navegação passariam a ser: Modelo, Malha, Qualidade, Passos, Produtos" (5) | **soma não fecha** | A seção C cria **três** seções novas (C1 Como funciona, C2 O que fabricamos, C3 FAQ), mas a navegação proposta só ganha **dois** rótulos novos (Passos, Produtos). A FAQ fica sem rótulo e sem explicação. Navbar atual tem 3 rótulos (`navbar.tsx:9-13`, confirmado em `04:14`). |

## C1. Como funciona

| # | Afirmação | Veredito | Evidência |
|---|---|---|---|
| 51 | "só Império das Essências publica um cronograma, com 11 etapas e nenhum prazo" | C | `01:49`: "Império das Essências também dá valores (...) e um cronograma de 11 etapas sem prazos específicos" |
| 52 | "a pesquisa 04 lista 'qual é o próximo passo depois do clique' como lacuna 6" | C | `04:78`, item 6: "Depois do clique em WhatsApp ou e-mail, qual é o próximo passo prático" |
| 53 | "Quatro passos legíveis em dez segundos é o formato que falta no setor" | **SF** | Afirmação de ausência ("falta no setor") sem caso de controle; nenhuma fonte mede tempo de leitura nem inventaria formatos de "passos" dos concorrentes |
| 54 | Passo 2: amostra aprovada antes do lote "[confirmar]" | C (lacuna declarada) | D#10 |
| 55 | Passo 3: "notificado ou registrado na ANVISA no CNPJ do contratante" | **SF** | Mesma evidência da linha 25 |
| 56 | Passo 4: "A **fábrica mais perto do seu CD** produz o lote" | **SF** | "Entrega no CD" bate com `PRODUCT.md:23`; mas o roteamento por CD do contratante não está em nenhuma fonte, e D#17 mantém o fluxo de entrega em aberto |
| 57 | Passo 1: "A CBS responde com preço por unidade e cronograma" | C (lacuna declarada) | D#15 |

## C2. O que fabricamos

| # | Afirmação | Veredito | Evidência |
|---|---|---|---|
| 58 | "a pesquisa 04 abre a lista de perguntas sem resposta exatamente com 'quais produtos a CBS fabrica'" | C | `04:73`, item 1: "Quais produtos exatamente a CBS fabrica?" |
| 59 | "Hoje a home usa 'saneantes' **catorze vezes**" | **R** | `rg -n -i 'saneante' apps/web/src` → **9 linhas no total do src**, e só **4** são o termo-categoria em copy/metadado (`page.tsx:54`, `page.tsx:262`, `footer.tsx:86`, `layout.tsx:15`). As outras são o nome da empresa "Companhia Brasileira de Saneantes" (`navbar.tsx:88`, `footer.tsx:60`, `footer.tsx:71`, `layout.tsx:16`) e um comentário de código (`station-models.tsx:113`, invisível ao visitante). `rg -c -i 'saneante' apps/web/src/app/page.tsx` → **2**. Nem 14, nem perto disso. Controle: o comando retorna 9 positivos, logo detecta ocorrências. |
| 60 | "A própria definição do `CONTEXT.md` já cita as **quatro** categorias" | C (soma fecha) | `CONTEXT.md:10`: "desinfetante, detergente, alvejante e água sanitária" = 4 |
| 61 | Título proposto "O que sai das **nossas** fábricas." / rótulo "O que **fabricamos**" | **inconsistência interna** | Contradiz o próprio B7 (`05:181`), que remove a primeira pessoa do plural do rodapé "para fechar a voz", e `PRODUCT.md:37` ("Voz: institucional"). A proposta reintroduz em título de seção o que acabou de eliminar. |
| 62 | Copy: "A CBS fabrica saneantes de uso geral: [lista]" | C (lacuna declarada, mas atenção) | `PRODUCT.md:44` registra que **não existe portfólio de produtos**. A lista está entre colchetes, D#12 cobre, e `05:206` diz "Sem confirmação do cliente, esta seção não vai ao ar" — não é prova inventada. As quatro categorias em `CONTEXT.md:10` definem *saneante* em geral, não o catálogo da CBS. |
| 63 | Uso de "cliente" em `05:206` e `05:223` | não é violação | "Cliente" é Avoid no `CONTEXT.md:19` só como designação do **visitante/contratante**. Aqui refere-se ao Gulberto, mesmo uso de `PRODUCT.md:39` ("O texto final será refinado com o cliente (Gulberto/Profills)"). Nenhuma ocorrência dentro de bloco de copy. |

## C3. FAQ curto

| # | Afirmação | Veredito | Evidência |
|---|---|---|---|
| 64 | "a pesquisa 01 extraiu **17 perguntas**" | C (contagem bate) | `sed -n '/^## Perguntas do contratante/,/^## Lacunas/p' 01-mercado.md \| rg -c '^- '` → **17** |
| 65 | "das FAQs de Multlabel, Tekclean e Império das Essências" | C | `01:57` nomeia exatamente essas três fontes |
| 66 | "as seis acima são as que **mais se repetem**" | **SF** | `01` lista perguntas mas não mede repetição nem frequência entre concorrentes |
| 67 | "Duas delas (lote mínimo e prazo) são as que quase nenhum concorrente publica" | C | `01:82` (só Tekclean dá prazo) e `01:83` (só Império dá MOQ) |
| 68 | "[a 3ª pergunta] é a única da lista que **não depende do Gulberto**" | **R** | Refutada pelo próprio documento: D#6 (`05:234`) pede ao Gulberto "Confirma que o produto é notificado ou registrado no CNPJ de quem contrata, e não no da CBS?" — exatamente essa resposta. |
| 69 | "[confirmar; a regularização do produto na ANVISA é feita por **pessoa jurídica**]" | **SF** | `02` não afirma isso em lugar nenhum. `01:74` registra apenas a política de um concorrente ("apenas empresas com CNPJ ativo", Império das Essências), que é regra comercial de terceiro, não norma da ANVISA. |
| 70 | Resposta 3: "A CBS mantém a autorização de fabricação e **fornece a documentação técnica** do processo produtivo" | **SF** | Mesma evidência da linha 26; sem fonte e sem linha em D |

---

## Checagens transversais pedidas

| # | Checagem | Veredito | Evidência (comando + saída + controle) |
|---|---|---|---|
| 71 | Termos da lista "Avoid" do `CONTEXT.md` na copy proposta | **zero, com controle** | Loop `rg -n -i -F` sobre os 17 termos Avoid (produto químico, químicos, white label, private label, marca branca, planta, unidade fabril, filial, hub, armazém, galpão, endereço, localização da fábrica, logística, economia de custos, cliente, parceiro). Só dois acharam algo: "endereço" (linhas 107, 245) e "cliente" (11, 206, 223), **todos fora de bloco de copy** (`^>`) e em sentido distinto do evitado — 107 é a explicação regulatória "licença sanitária (autoriza o endereço)", 245 é a pergunta D#17 ao cliente. **Controle**: esses 5 matches provam que o loop detecta positivos; os outros 15 termos deram 0 de verdade. |
| 72 | "terceirização" sozinho (Avoid, `CONTEXT.md:15`) | **zero** | `rg -n -i -o 'Terceiriza[çc]ão[^.,;:]{0,25}'` → 6 ocorrências, todas qualificadas: "Terceirização de produção de saneantes" (linhas 32, 36, 176), "Terceirização completa de produção" (79, 85), "Terceirização de produção" (181) |
| 73 | Travessões | **zero, com controle** | `rg -c -F '—' 05-proposta-copy.md` → 0 linhas; `rg -c -F '–'` → 0 linhas. **Controle**: `rg -c -F '—' 03-logistica-ml.md` → **41** linhas. O comando detecta travessão quando existe; em 05 não existe. |
| 74 | Prova inventada proibida por `PRODUCT.md:44` (depoimento, cliente nomeado, número de produção, certificado) na copy proposta | **zero, com controle** | `rg '^>' 05 \| rg -i 'anos\|empresas atendidas\|depoimento\|case\|clientes'` → nenhum match. **Controle**: o mesmo padrão dá 5 matches em `01-mercado.md` e 1 em linha sintética de teste. Números presentes na copy, extraídos com `rg '^>' \| rg -o -P '(?<![\w/])\d[\d.,]*'`: apenas `6` e `7` (fábricas, lastro em `PRODUCT.md:19`), `2026` (copyright) e `1. 2. 3. 4.` (numeração dos passos). Nenhum número de produção, nenhum cliente, nenhum depoimento. |
| 75 | Regra do próprio documento: "Toda lacuna tem linha na tabela D" (`05:4`, `05:225`) | **falha parcial** | `rg -o -c '\[[^]]*confirmar[^]]*\]'` → 15 marcadores; `rg -c '^\| [0-9]+ \|'` na tabela D → 20 linhas. Os marcadores estão cobertos, **mas** as afirmações não-colchetadas das linhas 21, 26, 32, 35, 56 e 70 desta checagem entram na copy final sem lacuna declarada e sem linha em D. |

---

## Veredito final

**REPROVADO para publicação; aproveitável como rascunho depois de revisão.**

**Contagens desta checagem** (todas de comando inline sobre o próprio `06-checagem.md`):
`rg -c '^\| [0-9]+ \|' 06-checagem.md` → **75** afirmações checadas;
`rg -c '^\| [0-9]+ \|[^|]*\|\s*\*\*R\*\*'` → **8** linhas refutadas (5, 7, 20, 38, 43, 49, 59, 68),
mais a linha 50, cuja soma não fecha → **9 refutadas**;
`rg -c '^\| [0-9]+ \|[^|]*\|\s*\*\*SF\*\*'` → **15** linhas sem fonte, que correspondem a **13
afirmações distintas** (as linhas 25/55 e 26/70 são a mesma frase repetida em seções diferentes).
As três somas fecham: 75 = 9 refutadas + 15 sem fonte + 51 confirmadas, parciais ou lacunas declaradas.

A mais grave para a credibilidade do próprio documento é a linha 59. "A home usa
'saneantes' catorze vezes" quando o repositório tem 4 usos do termo-categoria em copy. É um número
inventado dentro de um documento cuja tese é que a CBS não deve inventar números.

Das 13 afirmações sem fonte ou não verificáveis, **6 estão dentro da copy proposta sem
colchete de lacuna** e portanto seriam publicadas como fato: "envasa" (21), "a CBS fornece a
documentação técnica" (26, repetida em C1 e C3), "notificação/registro no CNPJ do contratante" (25/55,
com D#6 aberto), "é esse trecho que a CBS encurta" (32, com D#17 aberto), "cada quilômetro a menos
aparece no preço final" (35, em tensão com `03:161-168`), "a fábrica mais perto do seu CD" (56).

**O que passou limpo**: nenhum termo da lista Avoid dentro da copy (71, 72), nenhum travessão (73),
nenhuma prova inventada — sem depoimento, cliente nomeado ou número de produção (74). As citações do
texto atual do site e as referências de linha ao código conferem uma a uma. As correções regulatórias
de B4 estão na direção certa segundo `02`, com a ressalva de que a fonte de `02:38` se autodeclara
HIPÓTESE apoiada em resumo de fonte secundária, e por isso não sustenta texto afirmativo final.

**Padrão sistemático a corrigir antes de qualquer uso**: o documento trata conclusões que as próprias
pesquisas 02 e 03 marcaram como HIPÓTESE (dedução, resumo de busca, página oficial com 403) como se
fossem fato estabelecido, e escreve como texto final frases que sua própria tabela D lista como
pendentes de confirmação do cliente. Duas escadas: ou a frase vira colchete, ou a fonte precisa subir
de nível.

## O que faltou no material

1. **Nenhuma fonte primária de ANVISA foi lida na íntegra.** `02` não conseguiu acessar a RDC 989/2025;
   a afirmação central de B4/C1/C3 (responsabilidade regulatória do contratante) repousa em um resumo
   de consultoria privada. Falta o texto da norma.
2. **Nenhuma fonte oficial do Mercado Livre foi lida.** `03` registra 403 em todas as páginas do domínio
   `mercadolivre.com.br`. Todo o argumento de frete de B5 vem de resumo de busca e de blogs de ERP.
3. **Discrepância não resolvida na pesquisa 01**: a seção Concorrentes enumera 9 empresas, a seção
   Lacunas fala em "8 páginas fetchadas". A proposta 05 herdou o 8 sem notar. Falta reconciliar.
4. **Nenhuma verificação de que a CBS de fato tem AFE.** `PRODUCT.md:30` registra a autorização como
   "afirmação autorizada pelo dono", não como documento visto. D#1 e D#2 reconhecem, mas o texto
   proposto já afirma "A CBS tem autorização da ANVISA para fabricar saneantes" como fato.
5. **Nenhuma prova perceptual.** Nada da proposta foi renderizado; não há screenshot nem contagem de
   caracteres por breakpoint para os títulos novos, que são mais longos que os atuais.
6. **A recomendação estrutural de B5** (mover Malha para antes de Qualidade) não tem linha na tabela D
   nem checagem de impacto no `DESIGN.md` / na coreografia de `page.tsx`, que ancora cenas 3D por
   `anchor` (`page.tsx:256`, `270`, `285`) e por `data-j-anchor` (`page.tsx:197`).
