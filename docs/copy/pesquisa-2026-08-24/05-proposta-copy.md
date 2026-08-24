# Proposta de copy: home da CBS

Base: `01-mercado.md`, `02-anvisa.md`, `03-logistica-ml.md`, `04-site-atual.md`, `apps/web/PRODUCT.md`, `CONTEXT.md`.
Tudo entre colchetes é lacuna, não texto final. Toda lacuna tem linha na tabela D.

---

## A. Diagnóstico

1. A copy atual acerta o essencial. "Sua marca, nossa fábrica" entrega o modelo no primeiro segundo, e o vocabulário do `CONTEXT.md` é respeitado do topo ao rodapé, sem um único termo da lista Avoid.
2. Acerta também ao não fabricar prova: zero depoimento, zero número de cliente, zero selo inventado. Isso segue o Princípio 3 do `PRODUCT.md` e já coloca a CBS acima de metade dos concorrentes pesquisados.
3. Primeira perda: a página responde "o que a CBS faz" e nunca "o que acontece depois que eu chamo no WhatsApp". Não há passo, prazo, lote mínimo nem tipo de produto.
4. Segunda perda: frete é o argumento-mestre pelo Princípio 2 do `PRODUCT.md`, mas só recebe desenvolvimento na terceira estação. O hero cita, a malha explica, e no meio a atenção passa por duas seções.
5. Terceira perda: "o frete sai menor" é vago para quem vende no Mercado Livre. O ganho está no trecho fábrica até CD (a remessa que reabastece o Full), não no frete que o comprador final paga. O seller experiente nota a imprecisão e desconta credibilidade.
6. Quarta perda: "A responsabilidade técnica é da CBS" é a única frase da home sem lastro nos documentos, e a pesquisa 02 indica o contrário: a notificação ou o registro do produto fica com o detentor da marca, ou seja, o contratante.
7. Quinta perda: "Autorizada pela ANVISA" solto sugere que o produto foi aprovado pela agência. A ANVISA autoriza a empresa (AFE) e notifica ou registra o produto. São coisas separadas, e a frase precisa dizer qual.
8. Sexta perda: a voz oscila entre "a gente" (hero e Modelo), "Fabricamos" (rodapé) e "A CBS" (resto). Numa página curta isso soa como dois redatores.
9. Sétima perda: oito concorrentes pesquisados escondem lote mínimo, prazo e custo regulatório atrás de contato comercial. Publicar esses três é a vantagem mais barata disponível, e não exige inventar nada.
10. A proposta abaixo mantém a estrutura e o tom, corrige as duas imprecisões regulatórias, puxa frete para a frente e abre três seções para as perguntas que o mercado não responde.

---

## B. Seção por seção

### B1. Metadados (title e description)

`apps/web/src/app/layout.tsx:13-17`

**Atual**

- Title: `CBS | Companhia Brasileira de Saneantes`
- Description: `Terceirização de produção de saneantes: a CBS fabrica com a sua marca, com autorização ANVISA, e envia de fábricas ao lado dos CDs do Mercado Livre. Você vende, o frete sai menor.`

**Proposto**

- Title: `CBS | Terceirização de produção de saneantes`
- Description: `A CBS fabrica saneantes sob a sua marca, com autorização ANVISA, em fábricas instaladas junto aos CDs do Mercado Livre. Você vende, a remessa até o CD sai mais barata.`

**Por quê**: o `PRODUCT.md` diz que o visitante típico chega buscando "CBS" depois de ouvir o nome numa cotação. O title atual confirma a identidade e não diz o que a empresa faz, então o resultado de busca não se diferencia de nenhuma outra CBS. Trocar a expansão pelo serviço resolve, e a expansão continua no H1 do rodapé e no alt do logo. A description encolhe para caber nos ~160 caracteres que o Google exibe e troca "o frete sai menor" por "a remessa até o CD sai mais barata", que é o trecho onde o ganho existe de fato (pesquisa 03, seção "Onde a fábrica perto do CD economiza", item 4: o outbound não muda com a posição da fábrica).

---

### B2. Hero

`apps/web/src/app/page.tsx:43-83`

**Atual**

> **Sua marca, nossa fábrica.**
>
> A CBS fabrica os seus saneantes e envia de fábricas ao lado dos centros de distribuição do Mercado Livre, com autorização ANVISA. Você vende, a gente produz perto do CD e **o frete sai menor**.
>
> [Chamar no WhatsApp] [Enviar e-mail]
> Conversa direta, sem formulário nem cadastro.
> Role para acompanhar a entrega

**Proposto**

> **Sua marca, nossa fábrica.**
>
> A CBS fabrica o seu saneante, aplica o seu rótulo e entrega no CD do Mercado Livre. Cada fábrica fica perto de um CD, e **esse trecho curto é o que derruba o custo da remessa**. Produção com autorização ANVISA.
>
> [Chamar no WhatsApp] [Enviar e-mail]
> Conversa direta, sem formulário nem cadastro.
> Role para acompanhar a entrega

**Por quê**: o H1 fica. Ele resolve o modelo em quatro palavras e nenhum concorrente pesquisado tem equivalente. O parágrafo muda em três pontos. Sai "a gente", que quebra a voz institucional pedida no `PRODUCT.md`. O negrito migra de "o frete sai menor" para a frase que explica o mecanismo, porque a pesquisa 03 mostra que o ganho é no inbound e o contratante que vende no ML sabe disso. E a ANVISA sai do meio da frase de frete para uma sentença própria, já que a pesquisa 02 alerta que misturar a autorização da empresa com o benefício do produto é o começo da alegação imprecisa.

---

### B3. Estação Modelo

`apps/web/src/app/page.tsx:255-268`

**Atual**

> **Você vende. A gente fabrica e envia.**
>
> Terceirização completa de produção: a CBS produz o saneante, rotula com a sua marca e despacha direto para o centro de distribuição. Você cuida do anúncio e da venda.

**Proposto**

> **Você vende. A CBS fabrica e envia.**
>
> Terceirização completa de produção. A CBS produz o saneante, envasa, aplica o seu rótulo e despacha para o CD do Mercado Livre. Você cuida do anúncio, do preço e da venda. A marca no rótulo é sua, e a CBS não assina o produto final.

**Por quê**: "a gente" vira "a CBS" pelo mesmo motivo do hero. A frase final é nova e vem direto da definição de Marca própria no `CONTEXT.md` ("A CBS não assina o produto final"). A pesquisa 01 mostra que nenhuma das oito páginas de concorrentes lidas declara de quem é a marca no produto acabado, e essa é exatamente a dúvida de quem vai colocar o próprio nome num produto feito por terceiro. Dizer em uma linha custa nada e responde antes de perguntarem.

---

### B4. Estação Qualidade

`apps/web/src/app/page.tsx:270-283`

**Atual**

> **Qualidade com autorização ANVISA.**
>
> A produção é autorizada pela ANVISA e segue o mesmo padrão de qualidade da formulação ao lacre da caixa. O rótulo é seu. A responsabilidade técnica é da CBS.

**Proposto**

> **Autorização ANVISA. Padrão em cada lote.**
>
> A CBS tem autorização da ANVISA para fabricar saneantes e trabalha sob as Boas Práticas de Fabricação da categoria [confirmar CBPF]. Cada lote sai identificado e conferido antes do embarque [confirmar o controle]. A notificação ou o registro do produto na ANVISA fica no CNPJ do contratante, e a CBS fornece a documentação técnica de fabricação para abrir esse processo.

**Por quê**: esta é a correção mais importante da proposta. A pesquisa 02 separa quatro figuras que o texto atual funde numa só: AFE (autoriza a empresa), licença sanitária (autoriza o endereço), responsável técnico (pessoa) e notificação ou registro (autoriza o produto). "A produção é autorizada pela ANVISA" e "A responsabilidade técnica é da CBS" leem como se a agência tivesse examinado o produto e como se o contratante ficasse sem obrigação regulatória. A pesquisa 02 indica o oposto: o dossiê e o rótulo continuam com o detentor da marca. Manter a frase atual entrega um contratante despreparado para a primeira conversa com a vigilância sanitária, e isso volta como reclamação. A versão proposta também vira argumento de venda: das oito páginas pesquisadas, só a FAQ da Multlabel toca nesse ponto, e nenhuma o antecipa.

---

### B5. Estação Malha

`apps/web/src/app/page.tsx:285-303`

**Atual**

> **Frete menor porque a fábrica fica perto do CD.**
>
> São 6 a 7 fábricas junto aos centros de distribuição do Mercado Livre. O produto sai da fábrica e entra no CD, e esse trecho curto é o que corta o frete de quem vende no ML.
>
> (chips de praça por região)

**Proposto**

> **A fábrica fica ao lado do CD. A remessa fica curta.**
>
> A malha tem de 6 a 7 fábricas, cada uma perto de um CD do Mercado Livre. Quem vende no Full paga o transporte da remessa até o CD, e é esse trecho que a CBS encurta. Saneante é produto pesado e de baixo valor por unidade, então o frete morde a margem e cada quilômetro a menos aparece no preço final.
>
> (chips de praça por região, sem mudança)

**Por quê**: a pesquisa 03 documenta que o custo de levar o estoque até o CD é do vendedor, cobrado como transporte contratado ou como taxa de coleta por volume e distância, e que essa coleta do Mercado Livre só existe em SP, RJ, MG, BA e SC. O texto proposto usa o vocabulário que o seller reconhece ("Full", "remessa") e nomeia o trecho exato do ganho, em vez de "corta o frete", que pode ser lido como o frete pago pelo comprador. A frase sobre peso e valor unitário explica por que a proximidade importa mais para saneante do que para qualquer outra categoria, e é o argumento que sustenta a malha inteira. Recomendação estrutural: mover esta estação para antes de Qualidade, para o frete abrir a sequência conforme o Princípio 2 do `PRODUCT.md`.

---

### B6. Chegada

`apps/web/src/app/page.tsx:199-218`

**Atual**

> **Entregue no CD. Pronto para vender.**
>
> Diga o que você quer vender. A CBS responde com produto, rótulo, produção e envio.
>
> [Falar com a CBS] [Enviar e-mail]
> Conversa direta, sem formulário nem cadastro.

**Proposto**

> **Entregue no CD. Pronto para vender.**
>
> Diga o que você quer vender e em qual volume. A CBS responde com a proposta: produto, envase, rótulo, prazo e preço por unidade.
>
> [Falar com a CBS] [Enviar e-mail]
> Conversa direta, sem formulário nem cadastro. Resposta em [confirmar prazo].

**Por quê**: o H2 fica, fecha a jornada e não tem nada a corrigir. O parágrafo atual diz que a CBS "responde", sem dizer com o quê, e a pesquisa 01 lista "qual o investimento inicial" e "quanto tempo leva a produção" entre as perguntas que aparecem em toda FAQ de concorrente. Nomear os cinco itens da resposta transforma o clique de "vou pedir informação" em "vou receber uma proposta". O prazo de resposta na linha de reasseguramento é o custo mais baixo de credibilidade que existe numa página sem formulário.

---

### B7. Rodapé

`apps/web/src/components/footer.tsx:59-89`

**Atual**

> **CBS**
> Companhia Brasileira de Saneantes. Fabricamos com a sua marca, ao lado dos centros de distribuição do Mercado Livre.
>
> © 2026 CBS · Companhia Brasileira de Saneantes · othavioquiliao@gmail.com
> **Autorizada pela ANVISA** / Fabricação de saneantes

**Proposto**

> **CBS**
> Companhia Brasileira de Saneantes. Terceirização de produção de saneantes, com fábricas junto aos CDs do Mercado Livre.
>
> © 2026 CBS · [Razão social completa] · CNPJ [confirmar] · othavioquiliao@gmail.com
> **Autorizada pela ANVISA** / Fabricação de saneantes · AFE nº [confirmar]

**Por quê**: "Fabricamos" é a última sobra de primeira pessoa do plural na página, e trocar por "Terceirização de produção" fecha a voz e repete o termo canônico do `CONTEXT.md` no lugar onde os buscadores mais olham. Razão social e CNPJ são a checagem que qualquer contratante faz antes de mandar dinheiro para uma fábrica que nunca visitou, e a pesquisa 04 registra a ausência deles como lacuna 11. O número da AFE é dado público consultável no portal da ANVISA (pesquisa 02), então publicar transforma um selo decorativo em algo verificável em trinta segundos.

---

## C. Seções novas

A pesquisa 01 mostra que as oito páginas de concorrentes lidas escondem lote mínimo, prazo e processo atrás de "fale com um consultor". As três seções abaixo atacam justamente isso. Todas entram entre Malha e Chegada, e os rótulos de navegação passariam a ser: Modelo, Malha, Qualidade, Passos, Produtos.

### C1. Como funciona (4 passos)

> **Do primeiro contato à prateleira do CD.**
>
> **1. Conversa.** Você diz o produto, o volume e o prazo. A CBS responde com preço por unidade e cronograma.
> **2. Amostra.** A CBS produz uma amostra do saneante com a formulação combinada. Você aprova antes de qualquer lote [confirmar].
> **3. Regularização.** O produto é notificado ou registrado na ANVISA no CNPJ do contratante. A CBS entrega a documentação técnica de fabricação que esse processo exige.
> **4. Produção e entrega.** A fábrica mais perto do seu CD produz o lote, aplica o seu rótulo e entrega no centro de distribuição.

**Por quê**: a pesquisa 04 lista "qual é o próximo passo depois do clique" como lacuna 6, e a pesquisa 01 mostra que só Império das Essências publica um cronograma, com 11 etapas e nenhum prazo. Quatro passos legíveis em dez segundos é o formato que falta no setor. O passo 3 é o que separa a CBS do resto: nomeia a obrigação regulatória do contratante em vez de deixar a surpresa para depois do contrato.

### C2. O que fabricamos

> **O que sai das nossas fábricas.**
>
> A CBS fabrica saneantes de uso geral: [desinfetante, detergente, alvejante, água sanitária, confirmar a lista]. Envase em [confirmar volumes]. Se o produto que você quer vender está fora dessa lista, pergunte antes de descartar.

**Por quê**: a pesquisa 04 abre a lista de perguntas sem resposta exatamente com "quais produtos a CBS fabrica". Hoje a home usa "saneantes" catorze vezes sem nunca dizer o que isso é na prateleira. A própria definição do `CONTEXT.md` já cita as quatro categorias, então a seção é um preenchimento de lacuna, não uma invenção. Sem confirmação do cliente, esta seção não vai ao ar.

### C3. FAQ curto

> **Perguntas que chegam sempre.**
>
> **Qual é o lote mínimo?** [confirmar]
> **Quem desenvolve a fórmula?** [confirmar: a CBS oferece formulações próprias, o contratante traz a fórmula, ou os dois]
> **De quem é a responsabilidade perante a ANVISA?** A notificação ou o registro do produto fica no CNPJ do contratante, que é o detentor da marca. A CBS mantém a autorização de fabricação e fornece a documentação técnica do processo produtivo.
> **Quem faz a arte do rótulo?** [confirmar]
> **Quanto tempo leva do fechamento à entrega no CD?** [confirmar]
> **Preciso ter CNPJ?** [confirmar; a regularização do produto na ANVISA é feita por pessoa jurídica]

**Por quê**: a pesquisa 01 extraiu 17 perguntas das FAQs de Multlabel, Tekclean e Império das Essências, e as seis acima são as que mais se repetem e as que mais afetam a decisão de contratar. Duas delas (lote mínimo e prazo) são as que quase nenhum concorrente publica, o que torna a resposta uma vantagem em si. A terceira pergunta já vem respondida porque a resposta está na pesquisa 02, e é a única da lista que não depende do Gulberto.

---

## D. Precisa confirmar com o cliente

Toda afirmação da proposta que não tem lastro em `PRODUCT.md` ou `CONTEXT.md`. Nada disso vai ao ar sem resposta.

| # | Afirmação proposta | Onde aparece | Pergunta exata para o Gulberto |
|---|---|---|---|
| 1 | "autorização da ANVISA para fabricar saneantes" | Hero, Qualidade, rodapé | A autorização concedida é a AFE (Autorização de Funcionamento de Empresa) para a classe saneantes? A ANVISA autoriza a empresa, não o produto, então preciso saber qual documento você tem em mãos. |
| 2 | "AFE nº [confirmar]" | Rodapé | Qual é o número da AFE? Ele é público no portal da ANVISA. Posso publicar no rodapé? |
| 3 | Licença sanitária do estabelecimento | Qualidade (implícito) | A fábrica já tem licença sanitária (alvará sanitário) emitida pela vigilância local? Ela é pré-requisito da AFE e vale citar. |
| 4 | "trabalha sob as Boas Práticas de Fabricação da categoria" | Qualidade | A CBS tem CBPF (Certificado de Boas Práticas de Fabricação) ou está em processo? Se não tem, posso escrever "segue as Boas Práticas de Fabricação" ou é melhor tirar? |
| 5 | "Cada lote sai identificado e conferido antes do embarque" | Qualidade | O que a fábrica confere antes de liberar um lote (pH, viscosidade, ensaio microbiológico, só inspeção visual)? Quero descrever o controle real, não uma frase genérica. |
| 6 | "A notificação ou o registro do produto fica no CNPJ do contratante" | Qualidade, Como funciona, FAQ | Confirma que o produto é notificado ou registrado no CNPJ de quem contrata, e não no da CBS? Isso muda quem responde à ANVISA se der problema. |
| 7 | Responsável técnico da fábrica | Remoção da frase atual | A frase "A responsabilidade técnica é da CBS" pode sair? Ela hoje sugere que o contratante não tem obrigação regulatória, o que não bate com a norma. Quem é o responsável técnico da fábrica, e posso citar o cargo sem o nome? |
| 8 | Lote mínimo | FAQ | Qual é o lote mínimo por produto, em unidades ou em litros? Concorrentes escondem esse número, e publicar é vantagem nossa. |
| 9 | Quem desenvolve a fórmula | Como funciona, FAQ | A CBS tem formulações próprias, ou o contratante precisa trazer a fórmula pronta? Se a CBS desenvolve, isso é cobrado à parte? |
| 10 | "A CBS produz uma amostra. Você aprova antes de qualquer lote" | Como funciona (passo 2) | Vocês mandam amostra antes da produção em escala? É gratuita ou tem custo? |
| 11 | Arte do rótulo | FAQ | Quem faz a arte do rótulo: o contratante entrega o arquivo pronto, ou a CBS desenha? E quem imprime e aplica? |
| 12 | Tipos de produto fabricados | O que fabricamos | Quais produtos a CBS fabrica hoje? Desinfetante, detergente, alvejante e água sanitária cobrem a lista, ou tem mais e menos? |
| 13 | Volumes de envase | O que fabricamos | Em quais volumes vocês envasam (500 ml, 1 L, 2 L, 5 L, granel)? O visitante precisa saber se o produto dele cabe. |
| 14 | Prazo do fechamento à entrega no CD | Chegada, FAQ | Do aceite da proposta até a caixa entrar no CD, quanto tempo leva? Um concorrente publica "30 a 90 dias" e é o único. Qual é a nossa faixa honesta? |
| 15 | "preço por unidade" na proposta | Chegada, Como funciona | A proposta que vocês mandam já traz preço por unidade fechado, ou é faixa e depende de negociação? Não quero prometer o que a resposta do WhatsApp não entrega. |
| 16 | "Resposta em [confirmar prazo]" | Chegada | Em quanto tempo vocês respondem uma mensagem de WhatsApp em dia útil? Se for algumas horas, vale escrever. |
| 17 | Entrega dentro do Full | Malha, Como funciona | A CBS entrega direto no CD do Mercado Livre em nome do contratante, com agendamento da remessa no painel dele, ou entrega no endereço do contratante e ele leva? Isso muda a frase inteira da malha. |
| 18 | Atendimento fora do Mercado Livre | Não proposto ainda | A CBS atende contratante que vende em loja própria ou em outro marketplace? Toda a página fala de ML, e quem vende fora pode achar que não é para ele. |
| 19 | Razão social e CNPJ | Rodapé | Qual é a razão social completa e o CNPJ para o rodapé? É a primeira coisa que um contratante checa antes de mandar dinheiro. |
| 20 | Status real das praças | Chips da malha | Quantas fábricas já estão operando hoje, e quais praças ainda são plano? A comunicação fala no presente por decisão sua, e eu preciso saber onde essa decisão fica arriscada. |
