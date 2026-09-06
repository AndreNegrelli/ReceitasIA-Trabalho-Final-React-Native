/**
 * geminiClient.ts
 *
 * Camada mais baixa da integração com a IA: faz a chamada HTTP para a
 * API do Google Gemini e traduz qualquer falha em uma mensagem em
 * português que a interface pode mostrar direto para o usuário.
 *
 * Endpoint usado: Interactions API (interface atual do Gemini; a antiga
 * `generateContent` está marcada como legada).
 *
 *   POST https://generativelanguage.googleapis.com/v1beta/interactions
 *   Header: x-goog-api-key: <chave>
 *
 * A chamada é feita com o `fetch` nativo do React Native — sem SDK.
 * Isso evita polyfills do Hermes e deixa a requisição explícita, que é
 * justamente o que o trabalho pede que fique visível no código.
 */

/** URL do endpoint de geração da API do Gemini. */
const URL_API = 'https://generativelanguage.googleapis.com/v1beta/interactions';

/**
 * Modelo usado nas chamadas.
 *
 * Para trocar, basta mudar esta linha — alternativas são 'gemini-3.5-flash'
 * e 'gemini-3.8-flash'. Os limites da sua conta ficam em
 * https://aistudio.google.com/rate-limit
 *
 * Atenção: o Google aposenta modelos antigos para contas novas. Se um dia
 * aparecer o erro 404 deste app, a mensagem trará o nome do substituto
 * sugerido pela própria API — é só colocá-lo aqui.
 */
export const MODELO = 'gemini-3.6-flash';

/**
 * Quanto tempo esperamos pela resposta antes de desistir (em ms).
 *
 * Medido na prática: ~17s para gerar 3 receitas. A folga é grande de
 * propósito, para uma internet lenta não virar erro à toa.
 */
const TIMEOUT_MS = 90000;

/**
 * Erro de negócio da integração com a IA.
 *
 * A UI só precisa mostrar `erro.message` — todas as mensagens já vêm
 * prontas e em português.
 */
export class ErroIA extends Error {
  /** true quando faz sentido oferecer um botão "tentar de novo". */
  readonly podeTentarNovamente: boolean;

  constructor(mensagem: string, podeTentarNovamente = true) {
    super(mensagem);
    this.name = 'ErroIA';
    this.podeTentarNovamente = podeTentarNovamente;
  }
}

/** Parâmetros aceitos por `chamarGemini`. */
type ParametrosChamada = {
  /** Chave da API salva pelo usuário. */
  apiKey: string;
  /** Instrução de sistema: define o "papel" que a IA deve assumir. */
  systemInstruction: string;
  /** O pedido do usuário, já montado em texto. */
  input: string;
  /** JSON Schema que a resposta precisa obedecer. */
  schema: Record<string, unknown>;
};

/**
 * Formato (parcial) da resposta da Interactions API.
 * Só declaramos os campos que realmente lemos.
 */
type RespostaApi = {
  steps?: Array<{
    content?: Array<{ type?: string; text?: string }>;
  }>;
};

/**
 * Envia um pedido para o Gemini e devolve a resposta já convertida de
 * JSON para objeto.
 *
 * @typeParam T - formato esperado do JSON de resposta.
 * @throws {ErroIA} com mensagem pronta para exibição.
 */
export async function chamarGemini<T>({
  apiKey,
  systemInstruction,
  input,
  schema,
}: ParametrosChamada): Promise<T> {
  if (!apiKey) {
    throw new ErroIA(
      'Nenhuma chave da API configurada. Abra as Configurações e cole a sua chave do Google AI Studio.',
      false,
    );
  }

  // AbortController cancela a requisição se ela demorar demais, para o
  // usuário não ficar preso numa tela de carregamento infinita.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let resposta: Response;
  try {
    resposta = await fetch(URL_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        model: MODELO,
        system_instruction: systemInstruction,
        input,
        // store: false = a conversa não fica guardada nos servidores do
        // Google; cada pedido é independente.
        store: false,
        // Por padrão o modelo "pensa" bastante antes de responder, o que
        // dobrava o tempo de espera (38s contra 17s nos testes) sem melhorar
        // as receitas. 'low' é o suficiente para esta tarefa.
        generation_config: {
          thinking_level: 'low',
        },
        // Saída estruturada: obriga o modelo a responder um JSON que
        // obedece ao schema. É o que permite montar a tela sem precisar
        // interpretar texto livre.
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema,
        },
      }),
      signal: controller.signal,
    });
  } catch (erro) {
    // fetch só rejeita por problema de rede ou cancelamento.
    if (erro instanceof Error && erro.name === 'AbortError') {
      throw new ErroIA('A IA demorou demais para responder. Tente de novo.');
    }
    throw new ErroIA('Sem conexão com a internet. Verifique sua rede e tente de novo.');
  } finally {
    clearTimeout(timeout);
  }

  if (!resposta.ok) {
    throw traduzirErroHttp(resposta.status, await lerCorpoComSeguranca(resposta));
  }

  // A resposta HTTP veio OK; agora extraímos o texto gerado.
  const corpo = (await resposta.json()) as RespostaApi;
  const texto = extrairTexto(corpo);

  if (!texto) {
    throw new ErroIA('A IA respondeu, mas sem conteúdo. Tente de novo.');
  }

  try {
    return JSON.parse(limparCercaDeCodigo(texto)) as T;
  } catch {
    throw new ErroIA('A IA respondeu em um formato inesperado. Tente de novo.');
  }
}

/**
 * Procura, do último passo para o primeiro, o texto gerado pelo modelo.
 *
 * Normalmente o conteúdo está no último passo, mas percorrer de trás para
 * frente evita quebrar caso a resposta termine com um passo sem texto.
 */
function extrairTexto(corpo: RespostaApi): string | null {
  const passos = corpo.steps ?? [];

  for (let i = passos.length - 1; i >= 0; i--) {
    const bloco = passos[i]?.content?.find(
      (item) => typeof item.text === 'string' && item.text.trim().length > 0,
    );
    if (bloco?.text) return bloco.text;
  }

  return null;
}

/**
 * Remove uma eventual cerca de código markdown (```json ... ```) em volta
 * do JSON. Com `response_format` isso não deveria acontecer, mas a
 * verificação é barata e evita que a tela quebre se acontecer.
 */
function limparCercaDeCodigo(texto: string): string {
  return texto
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
}

/** Converte o status HTTP em um `ErroIA` com mensagem amigável. */
function traduzirErroHttp(status: number, detalhe: string): ErroIA {
  // Atenção: para chave inválida a API do Google responde 400 (com
  // "API_KEY_INVALID" no corpo), e não 401. Por isso olhamos o corpo
  // antes de decidir a mensagem.
  const chaveInvalida = detalhe.includes('API_KEY_INVALID') || detalhe.includes('API key not valid');

  if (chaveInvalida || status === 401 || status === 403) {
    return new ErroIA(
      'Chave da API inválida ou sem permissão. Gere uma nova em aistudio.google.com/apikey e salve nas Configurações.',
      false,
    );
  }
  if (status === 400) {
    return new ErroIA(
      'A requisição foi recusada pela API. Confira a chave nas Configurações e tente de novo.',
      false,
    );
  }
  if (status === 404) {
    // A API costuma dizer no corpo qual modelo usar no lugar do aposentado.
    // Repassamos essa parte para quem for corrigir o código.
    return new ErroIA(
      `O modelo "${MODELO}" não está disponível para esta chave. ` +
        `Troque a constante MODELO em src/services/geminiClient.ts. ` +
        `Resposta da API: ${extrairMensagemDaApi(detalhe)}`,
      false,
    );
  }
  if (status === 429) {
    return new ErroIA('Limite de uso gratuito atingido. Espere um pouco e tente de novo.');
  }
  if (status >= 500) {
    return new ErroIA('O serviço do Gemini está indisponível no momento. Tente de novo em instantes.');
  }
  // Só aqui o corpo é cortado: acima ele é lido inteiro para detectarmos
  // marcadores como "API_KEY_INVALID".
  return new ErroIA(`Erro inesperado da API (${status}). ${detalhe.slice(0, 200)}`.trim());
}

/**
 * Tenta pegar apenas o campo `error.message` do corpo de erro da API.
 * Se o corpo não for o JSON esperado, devolve o começo do texto cru.
 */
function extrairMensagemDaApi(corpo: string): string {
  try {
    const json = JSON.parse(corpo);
    // A API responde ora como objeto, ora como array de um objeto.
    const erro = Array.isArray(json) ? json[0]?.error : json?.error;
    if (typeof erro?.message === 'string') return erro.message;
  } catch {
    // corpo não era JSON — cai no retorno abaixo
  }
  return corpo.slice(0, 200);
}

/**
 * Lê o corpo da resposta de erro sem deixar uma falha de leitura
 * mascarar o erro original.
 */
async function lerCorpoComSeguranca(resposta: Response): Promise<string> {
  try {
    return await resposta.text();
  } catch {
    return '';
  }
}
