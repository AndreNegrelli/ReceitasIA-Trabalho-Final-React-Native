/**
 * apiKeyStorage.ts
 *
 * Guarda a chave da API do Gemini no armazenamento seguro do aparelho
 * (Keychain no iOS, EncryptedSharedPreferences no Android) usando
 * expo-secure-store.
 *
 * Por que não deixar a chave no código ou num arquivo .env?
 * Porque tudo que entra no bundle do app pode ser extraído por quem
 * baixar o APK. Aqui a chave é digitada pelo próprio usuário na tela de
 * Configurações e nunca sai do aparelho dele.
 */

import * as SecureStore from 'expo-secure-store';

/** Nome sob o qual a chave é gravada. */
const CHAVE_ARMAZENAMENTO = 'gemini_api_key';

/**
 * Lê a chave salva.
 * @returns a chave, ou null se o usuário ainda não configurou nenhuma.
 */
export async function lerApiKey(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(CHAVE_ARMAZENAMENTO);
  } catch (erro) {
    // SecureStore não existe no navegador (npm run web). Nesse caso apenas
    // seguimos como se não houvesse chave salva, em vez de derrubar o app.
    console.warn('Não foi possível ler a chave da API:', erro);
    return null;
  }
}

/**
 * Salva (ou substitui) a chave.
 * @param apiKey chave copiada do Google AI Studio.
 */
export async function salvarApiKey(apiKey: string): Promise<void> {
  await SecureStore.setItemAsync(CHAVE_ARMAZENAMENTO, apiKey.trim());
}

/** Apaga a chave salva no aparelho. */
export async function apagarApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(CHAVE_ARMAZENAMENTO);
}
