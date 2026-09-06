/**
 * receitasPrompt.ts
 *
 * Tudo que "ensina" a IA a se comportar como um chef de cozinha fica aqui:
 * a instrução de sistema, o JSON Schema da resposta e a montagem do pedido
 * a partir do que o usuário digitou.
 *
 * Separar isso do cliente HTTP deixa fácil ajustar o comportamento da IA
 * sem mexer em nada de rede.
 */

import { Filtros } from '../types';

/** Quantas receitas pedimos por vez. */
export const QUANTIDADE_RECEITAS = 3;

/**
 * Instrução de sistema: define o papel da IA e as regras que ela deve
 * seguir em toda resposta.
 */
export const INSTRUCAO_SISTEMA = `Você é um chef de cozinha brasileiro, prático e criativo.
Sua tarefa é sugerir receitas usando os ingredientes que a pessoa já tem em casa.

Regras que você deve seguir sempre:
- Responda somente em português do Brasil.
- Aproveite o máximo possível dos ingredientes informados.
- Você pode incluir poucos ingredientes extras, mas apenas itens baratos e
  comuns (sal, óleo, água, açúcar, farinha, ovos, cebola, alho). Liste esses
  itens em "ingredientesExtras".
- Em "ingredientesUsados", liste apenas ingredientes que a pessoa informou.
- Escreva o modo de preparo em passos curtos e diretos, um por item, na
  ordem de execução. Não numere os passos: a numeração é feita pelo app.
- Seja realista no tempo de preparo e no número de porções.
- Se os ingredientes informados forem poucos ou não combinarem bem,
  sugira mesmo assim as receitas mais simples possíveis com eles.
- Nunca sugira preparos que não sejam seguros para consumo.`;

/**
 * JSON Schema da resposta.
 *
 * Enviado à API em `response_format.schema`: o modelo é obrigado a
 * devolver um JSON exatamente nesse formato. Ele espelha o tipo
 * `RespostaReceitas` de src/types.ts.
 */
export const SCHEMA_RECEITAS: Record<string, unknown> = {
  type: 'object',
  properties: {
    receitas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          nome: { type: 'string' },
          descricao: { type: 'string' },
          tempoPreparoMin: { type: 'integer' },
          porcoes: { type: 'integer' },
          dificuldade: { type: 'string', enum: ['Fácil', 'Médio', 'Difícil'] },
          ingredientesUsados: { type: 'array', items: { type: 'string' } },
          ingredientesExtras: { type: 'array', items: { type: 'string' } },
          passos: { type: 'array', items: { type: 'string' } },
          dica: { type: 'string' },
        },
        required: [
          'nome',
          'descricao',
          'tempoPreparoMin',
          'porcoes',
          'dificuldade',
          'ingredientesUsados',
          'ingredientesExtras',
          'passos',
          'dica',
        ],
      },
    },
  },
  required: ['receitas'],
};

/**
 * Monta o texto do pedido enviado à IA a partir da entrada do usuário.
 *
 * @param ingredientes lista digitada pelo usuário.
 * @param filtros tipo de refeição e restrição alimentar (ambos opcionais).
 */
export function montarPedido(ingredientes: string[], filtros: Filtros): string {
  const linhas = [
    `Ingredientes disponíveis: ${ingredientes.join(', ')}.`,
    `Sugira ${QUANTIDADE_RECEITAS} receitas diferentes entre si.`,
  ];

  if (filtros.refeicao) {
    linhas.push(`As receitas devem servir como: ${filtros.refeicao}.`);
  }
  if (filtros.restricao) {
    linhas.push(`Restrição alimentar obrigatória: ${filtros.restricao}.`);
  }

  return linhas.join('\n');
}
