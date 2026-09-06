/**
 * receitasService.ts
 *
 * Ponto de entrada que as telas usam para pedir receitas à IA.
 * As telas nunca falam HTTP diretamente: elas chamam esta função,
 * recebem `Receita[]` ou um `ErroIA` com mensagem pronta.
 */

import { Filtros, Receita, RespostaReceitas } from '../types';
import { ErroIA, chamarGemini } from './geminiClient';
import { INSTRUCAO_SISTEMA, SCHEMA_RECEITAS, montarPedido } from './receitasPrompt';

/**
 * Pede à IA sugestões de receitas com base nos ingredientes informados.
 *
 * @param apiKey chave do Gemini salva pelo usuário.
 * @param ingredientes o que a pessoa tem em casa (ao menos um item).
 * @param filtros tipo de refeição e restrição alimentar (opcionais).
 * @returns lista de receitas prontas para exibição.
 * @throws {ErroIA} quando a chamada falha ou a resposta vem inválida.
 */
export async function buscarReceitas(
  apiKey: string,
  ingredientes: string[],
  filtros: Filtros,
): Promise<Receita[]> {
  if (ingredientes.length === 0) {
    throw new ErroIA('Adicione pelo menos um ingrediente antes de gerar receitas.', false);
  }

  const resposta = await chamarGemini<RespostaReceitas>({
    apiKey,
    systemInstruction: INSTRUCAO_SISTEMA,
    input: montarPedido(ingredientes, filtros),
    schema: SCHEMA_RECEITAS,
  });

  // Mesmo com o schema, vale conferir o que chegou antes de renderizar:
  // uma resposta vazia quebraria a tela silenciosamente.
  if (!Array.isArray(resposta?.receitas) || resposta.receitas.length === 0) {
    throw new ErroIA(
      'A IA não conseguiu montar receitas com esses ingredientes. Tente adicionar mais alguns.',
    );
  }

  return resposta.receitas;
}
