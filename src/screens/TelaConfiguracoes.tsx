/**
 * TelaConfiguracoes.tsx
 *
 * Onde o usuário cola a chave da API do Google AI Studio. A chave é
 * gravada no armazenamento seguro do aparelho (ver src/storage/apiKeyStorage.ts)
 * e nunca é escrita no código do app.
 */

import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apagarApiKey, salvarApiKey } from '../storage/apiKeyStorage';
import { cores, espacos, fontes, raios } from '../theme';

/** Página onde o usuário cria a chave gratuita. */
const URL_AI_STUDIO = 'https://aistudio.google.com/apikey';

type Props = {
  /** Chave já salva, para preencher o campo ao abrir a tela. */
  apiKeyAtual: string | null;
  /** Avisa o App.tsx que a chave mudou (salva ou apagada). */
  onApiKeyAlterada: (novaChave: string | null) => void;
  /** Volta para a tela anterior. */
  onVoltar: () => void;
};

export default function TelaConfiguracoes({ apiKeyAtual, onApiKeyAlterada, onVoltar }: Props) {
  const insets = useSafeAreaInsets();
  const [texto, setTexto] = useState(apiKeyAtual ?? '');
  const [mostrarChave, setMostrarChave] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const podeSalvar = texto.trim().length > 0 && !salvando;

  /** Grava a chave digitada e volta para a tela inicial. */
  async function salvar() {
    setSalvando(true);
    try {
      await salvarApiKey(texto);
      onApiKeyAlterada(texto.trim());
      Alert.alert('Pronto!', 'Chave salva. Agora é só gerar suas receitas.');
      onVoltar();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a chave neste aparelho.');
    } finally {
      setSalvando(false);
    }
  }

  /** Remove a chave do aparelho, com confirmação. */
  function apagar() {
    Alert.alert('Apagar chave', 'Tem certeza que quer remover a chave salva?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          await apagarApiKey();
          setTexto('');
          onApiKeyAlterada(null);
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={estilos.container}
      // No iOS o teclado cobre o campo; 'padding' empurra o conteúdo para cima.
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[estilos.cabecalho, { paddingTop: insets.top + espacos.sm }]}>
        <Pressable onPress={onVoltar} hitSlop={12} accessibilityRole="button">
          <Text style={estilos.voltar}>Voltar</Text>
        </Pressable>
        <Text style={estilos.tituloCabecalho}>Configurações</Text>
        {/* Espaçador para o título ficar centralizado entre os dois lados. */}
        <View style={estilos.espacador} />
      </View>

      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        <Text style={estilos.titulo}>Chave da API do Gemini</Text>
        <Text style={estilos.paragrafo}>
          O app usa a IA do Google Gemini para criar as receitas. Para isso ele precisa de
          uma chave gratuita, gerada na sua própria conta Google.
        </Text>

        <View style={estilos.passos}>
          <Text style={estilos.passo}>1. Abra o Google AI Studio no link abaixo.</Text>
          <Text style={estilos.passo}>2. Entre com a sua conta Google.</Text>
          <Text style={estilos.passo}>3. Toque em "Create API key" e copie a chave.</Text>
          <Text style={estilos.passo}>4. Cole a chave no campo abaixo e salve.</Text>
        </View>

        <Pressable onPress={() => Linking.openURL(URL_AI_STUDIO)} accessibilityRole="link">
          <Text style={estilos.link}>{URL_AI_STUDIO}</Text>
        </Pressable>

        <TextInput
          style={estilos.campo}
          value={texto}
          onChangeText={setTexto}
          placeholder="Cole aqui a sua chave"
          placeholderTextColor={cores.textoSecundario}
          // Esconde a chave por padrão, como um campo de senha.
          secureTextEntry={!mostrarChave}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Pressable onPress={() => setMostrarChave((atual) => !atual)} hitSlop={8}>
          <Text style={estilos.alternar}>
            {mostrarChave ? 'Ocultar chave' : 'Mostrar chave'}
          </Text>
        </Pressable>

        <Pressable
          onPress={salvar}
          disabled={!podeSalvar}
          style={({ pressed }) => [
            estilos.botaoPrimario,
            !podeSalvar && estilos.botaoDesabilitado,
            pressed && podeSalvar && estilos.botaoPressionado,
          ]}
          accessibilityRole="button"
        >
          <Text style={estilos.botaoPrimarioTexto}>
            {salvando ? 'Salvando...' : 'Salvar chave'}
          </Text>
        </Pressable>

        {apiKeyAtual && (
          <Pressable onPress={apagar} style={estilos.botaoSecundario} accessibilityRole="button">
            <Text style={estilos.botaoSecundarioTexto}>Apagar chave salva</Text>
          </Pressable>
        )}

        <View style={estilos.aviso}>
          <Text style={estilos.avisoTexto}>
            A chave fica guardada apenas neste aparelho, no armazenamento seguro do
            sistema. Ela não é enviada para nenhum servidor além da própria API do Google.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: espacos.md,
    paddingBottom: espacos.sm,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  voltar: {
    fontSize: fontes.normal,
    color: cores.primaria,
    fontWeight: '600',
    width: 80,
  },
  tituloCabecalho: {
    fontSize: fontes.media,
    fontWeight: '700',
    color: cores.texto,
  },
  espacador: {
    width: 80,
  },
  conteudo: {
    padding: espacos.md,
    gap: espacos.md,
    paddingBottom: espacos.xl,
  },
  titulo: {
    fontSize: fontes.grande,
    fontWeight: '700',
    color: cores.texto,
  },
  paragrafo: {
    fontSize: fontes.normal,
    color: cores.textoSecundario,
    lineHeight: 22,
  },
  passos: {
    gap: espacos.xs,
  },
  passo: {
    fontSize: fontes.normal,
    color: cores.texto,
    lineHeight: 22,
  },
  link: {
    fontSize: fontes.normal,
    color: cores.primaria,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  campo: {
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raios.md,
    paddingHorizontal: espacos.md,
    paddingVertical: espacos.md,
    fontSize: fontes.normal,
    color: cores.texto,
  },
  alternar: {
    fontSize: fontes.pequena,
    color: cores.primaria,
    fontWeight: '600',
  },
  botaoPrimario: {
    backgroundColor: cores.primaria,
    borderRadius: raios.md,
    paddingVertical: espacos.md,
    alignItems: 'center',
  },
  botaoPressionado: {
    backgroundColor: cores.primariaEscura,
  },
  botaoDesabilitado: {
    backgroundColor: cores.desabilitado,
  },
  botaoPrimarioTexto: {
    color: '#FFFFFF',
    fontSize: fontes.normal,
    fontWeight: '700',
  },
  botaoSecundario: {
    alignItems: 'center',
    paddingVertical: espacos.sm,
  },
  botaoSecundarioTexto: {
    color: cores.erro,
    fontSize: fontes.normal,
    fontWeight: '600',
  },
  aviso: {
    backgroundColor: cores.primariaClara,
    borderRadius: raios.md,
    padding: espacos.md,
  },
  avisoTexto: {
    fontSize: fontes.pequena,
    color: cores.primariaEscura,
    lineHeight: 19,
  },
});
