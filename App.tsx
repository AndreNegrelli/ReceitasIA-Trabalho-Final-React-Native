/**
 * App.tsx
 *
 * Raiz do aplicativo. Cuida de duas coisas:
 *
 * 1. Carregar a chave da API salva no aparelho quando o app abre.
 * 2. Decidir qual das três telas está visível.
 *
 * A navegação é feita com um estado simples em vez de uma biblioteca de
 * rotas: são só três telas e o fluxo entre elas é linear, então isso
 * mantém o projeto sem dependências extras e fácil de acompanhar.
 */

import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import TelaConfiguracoes from './src/screens/TelaConfiguracoes';
import TelaInicial from './src/screens/TelaInicial';
import TelaReceita from './src/screens/TelaReceita';
import { lerApiKey } from './src/storage/apiKeyStorage';
import { cores } from './src/theme';
import { Receita } from './src/types';

/** Telas que o app pode exibir. */
type Tela = 'inicial' | 'receita' | 'configuracoes';

export default function App() {
  // `null` = ainda carregando a chave do armazenamento seguro.
  const [carregando, setCarregando] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);

  const [tela, setTela] = useState<Tela>('inicial');
  const [receitaAberta, setReceitaAberta] = useState<Receita | null>(null);

  // Roda uma única vez, quando o app abre.
  useEffect(() => {
    async function carregarChave() {
      const chave = await lerApiKey();
      setApiKey(chave);

      // Primeira execução (nenhuma chave salva): já leva o usuário para as
      // configurações, senão ele bateria num erro logo na primeira tentativa.
      if (!chave) {
        setTela('configuracoes');
      }

      setCarregando(false);
    }

    carregarChave();
  }, []);

  // Splash mínima enquanto lemos o armazenamento seguro (costuma ser instantâneo).
  if (carregando) {
    return (
      <View style={estilos.splash}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  return (
    // SafeAreaProvider habilita o useSafeAreaInsets usado pelas telas para
    // não desenhar embaixo da barra de status nem do notch.
    <SafeAreaProvider>
      <StatusBar style="dark" />

      {tela === 'inicial' && (
        <TelaInicial
          apiKey={apiKey}
          onAbrirReceita={(receita) => {
            setReceitaAberta(receita);
            setTela('receita');
          }}
          onAbrirConfiguracoes={() => setTela('configuracoes')}
        />
      )}

      {tela === 'receita' && receitaAberta && (
        <TelaReceita receita={receitaAberta} onVoltar={() => setTela('inicial')} />
      )}

      {tela === 'configuracoes' && (
        <TelaConfiguracoes
          apiKeyAtual={apiKey}
          onApiKeyAlterada={setApiKey}
          onVoltar={() => setTela('inicial')}
        />
      )}
    </SafeAreaProvider>
  );
}

const estilos = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.fundo,
  },
});
