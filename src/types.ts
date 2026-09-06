/**
 * types.ts
 *
 * Tipos de domínio do app. O JSON Schema enviado para a IA
 * (ver src/services/receitasPrompt.ts) espelha exatamente estes tipos,
 * então a resposta do modelo já chega no formato que as telas consomem.
 */

/** Nível de dificuldade que a IA pode atribuir a uma receita. */
export type Dificuldade = 'Fácil' | 'Médio' | 'Difícil';

/** Uma receita sugerida pela IA. */
export type Receita = {
  /** Nome do prato, ex.: "Arroz de forno com ovo". */
  nome: string;
  /** Uma ou duas frases descrevendo o prato. */
  descricao: string;
  /** Tempo total de preparo, em minutos. */
  tempoPreparoMin: number;
  /** Quantas pessoas a receita serve. */
  porcoes: number;
  dificuldade: Dificuldade;
  /** Ingredientes da receita que o usuário informou que já tem. */
  ingredientesUsados: string[];
  /** Ingredientes que faltam e o usuário precisaria comprar. */
  ingredientesExtras: string[];
  /** Modo de preparo, um passo por item. */
  passos: string[];
  /** Uma dica curta do "chef" para melhorar o resultado. */
  dica: string;
};

/** Formato exato do JSON devolvido pela IA. */
export type RespostaReceitas = {
  receitas: Receita[];
};

/** Filtros opcionais que o usuário pode aplicar antes de gerar as receitas. */
export type Filtros = {
  /** null = "tanto faz"; a IA escolhe livremente. */
  refeicao: string | null;
  restricao: string | null;
};

/** Opções mostradas no seletor de tipo de refeição. */
export const OPCOES_REFEICAO = [
  'Café da manhã',
  'Almoço',
  'Jantar',
  'Lanche',
  'Sobremesa',
] as const;

/** Opções mostradas no seletor de restrição alimentar. */
export const OPCOES_RESTRICAO = [
  'Vegetariana',
  'Vegana',
  'Sem glúten',
  'Sem lactose',
  'Low carb',
] as const;
