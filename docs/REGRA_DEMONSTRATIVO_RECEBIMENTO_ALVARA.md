# REGRA HOMOLOGADA — DEMONSTRATIVO E REPASSE SOCIETÁRIO

Este documento registra somente regras expressamente confirmadas para integração entre o Demonstrativo de Recebimento de Alvará e o módulo Repasse Societário.

## Regra central do Repasse Societário

O Repasse Societário NÃO é calculado sobre:
- Valor Líquido do Alvará;
- Base Cálculo Honorários;
- IR;
- INSS;
- FGTS;
- Honorários Perito;
- Custas;
- Participações de terceiros;
- qualquer outro campo do Demonstrativo.

O Repasse Societário usa exclusivamente o valor final do campo:

**Honorários do Escritório**

O Demonstrativo deve apenas fornecer esse valor ao módulo Repasse Societário.

O cálculo do repasse é realizado dentro do próprio módulo Repasse Societário:

**Valor do Repasse = Honorários do Escritório × Percentual de Repasse configurado**

Exemplo já homologado:
- Honorários do Escritório: R$ 20.000,00
- Percentual do Repasse: 40%
- Valor do Repasse: R$ 8.000,00

## Integração

Ao confirmar o recebimento do alvará pela Tesouraria, o módulo Repasse Societário deve localizar no Demonstrativo o componente/campo **Honorários do Escritório** e copiar seu valor integral para o registro individual do repasse.

A partir daí, o módulo Repasse Societário aplica sua própria regra de percentual, aprovação, envio à Tesouraria, pagamento, saldo e auditoria.

## Regra de desenvolvimento

- Não reinterpretar a matemática interna do Demonstrativo para calcular Repasse Societário.
- Não derivar o Repasse Societário de Base Cálculo Honorários.
- Não derivar o Repasse Societário de Valor Líquido do Alvará.
- Não somar ou subtrair IR, INSS, perito, custas ou outras deduções para formar a base do Repasse Societário.
- Não criar regra financeira nova sem confirmação expressa.
- O único vínculo financeiro entre o Demonstrativo e o Repasse Societário é o valor final de **Honorários do Escritório**.
