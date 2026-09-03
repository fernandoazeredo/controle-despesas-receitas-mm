# REGRA HOMOLOGADA — DEMONSTRATIVO DE RECEBIMENTO DE ALVARÁ

Este documento registra a lógica operacional real usada pelo escritório e deve ser tratado como fonte de verdade para o módulo Recebimento de Alvarás.

## Estrutura prática do demonstrativo

1. Valor Líquido do Alvará
2. Imposto de Renda (Adicionar)
3. INSS (Adicionar)
4. FGTS
5. Outros (Especificar) — ex.: Depósito Recursal
6. Base Cálculo Honorários (Valor Bruto)
7. Honorários (%)
8. Honorários Perito (%)
9. INSS Reclamada
10. Honorários Perito (INSS Reclamada)
11. Custas
12. VALOR LÍQUIDO DEVIDO AO CLIENTE
13. Honorários Periciais (preencher se devido repasse)
14. Outros
15. Participação de terceiros (até três linhas no modelo)
16. Dados bancários do cliente
17. Dados para emissão de Nota Fiscal
18. Classificação/lançamento contábil

## Regra de cálculo comprovada pelos demonstrativos reais

### 1. Base Cálculo Honorários
A Base Cálculo Honorários representa o Valor Bruto usado para cálculo dos honorários.

Quando existirem valores de IR, INSS, FGTS ou Outros indicados antes da Base, eles são valores de recomposição/adicionamento do bruto e não devem ser tratados como deduções do cliente.

A regra operacional é:

Base Cálculo Honorários = Valor Líquido do Alvará + IR (Adicionar) + INSS (Adicionar) + FGTS + Outros (Adicionar/Especificar)

Se não houver qualquer valor de adição, a Base Cálculo Honorários será igual ao Valor Líquido do Alvará.

### 2. Honorários do Escritório
Honorários do Escritório = Base Cálculo Honorários × Percentual de Honorários

O percentual pode variar por alvará. Exemplos reais comprovam 30% e 100%.

### 3. Honorários Perito
Honorários Perito = Base Cálculo Honorários × Percentual de Honorários Perito

Exemplos reais comprovam percentual de 1%.

### 4. Valor Líquido Devido ao Cliente
O Valor Líquido Devido ao Cliente parte do Valor Líquido do Alvará efetivamente recebido e sofre as deduções posteriores à Base, quando existirem:

Valor Líquido Devido ao Cliente = Valor Líquido do Alvará
- Honorários
- Honorários Perito
- INSS Reclamada
- Honorários Perito (INSS Reclamada)
- Custas

Campos posteriores ao VALOR LÍQUIDO DEVIDO AO CLIENTE, como Honorários Periciais a repassar, Outros e Participação de Terceiros, são controles de repasse separados e não devem ser incluídos automaticamente na fórmula do líquido do cliente sem regra expressa.

## Casos reais de validação

### Jorge Luiz Felix Pimentel Junior
- Valor Líquido do Alvará: R$ 1.781,99
- Base Cálculo Honorários: R$ 1.781,99
- Honorários: 30% = R$ 534,60
- Honorários Perito: 1% = R$ 17,82
- Valor Líquido Devido ao Cliente: R$ 1.229,57

Cálculo:
1.781,99 - 534,60 - 17,82 = 1.229,57

### Adriana Gomes da Silva — alvará de R$ 18.144,33
- Valor Líquido do Alvará: R$ 18.144,33
- Base Cálculo Honorários: R$ 18.144,33
- Honorários: 30% = R$ 5.443,30
- Honorários Perito: 1% = R$ 181,44
- Valor Líquido Devido ao Cliente: R$ 12.519,59

Cálculo:
18.144,33 - 5.443,30 - 181,44 = 12.519,59

### Adriana Gomes da Silva — honorários sucumbenciais integrais
- Valor Líquido do Alvará: R$ 4.340,06
- Base Cálculo Honorários: R$ 4.340,06
- Honorários: 100% = R$ 4.340,06
- Valor Líquido Devido ao Cliente: R$ 0,00

## Regras de desenvolvimento

- Não transformar este formulário em uma planilha genérica de percentuais.
- Não calcular IR, INSS, FGTS ou Outros como percentual automático do Valor Líquido sem regra expressa.
- Não usar a Base Cálculo Honorários como simples espelho passivo do Valor Líquido.
- Não alterar esta matemática por inferência.
- Toda mudança futura nessa regra deve ser confrontada com este documento e com demonstrativos reais do escritório antes de ser implementada.
- O componente interno "Honorários do Escritório" deve continuar disponível para alimentar Nota Fiscal e Repasse Societário.
