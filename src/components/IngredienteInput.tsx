/**
 * IngredienteInput.tsx
 *
 * Campo de texto + botão para adicionar um ingrediente à lista.
 * O componente não guarda a lista: ele só avisa o pai (via onAdicionar)
 * que um novo item foi digitado.
 */

import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { cores, espacos, fontes, raios } from '../theme';

type Props = {
  /** Recebe o texto digitado, já sem espaços nas pontas. */
  onAdicionar: (ingrediente: string) => void;
};

export default function IngredienteInput({ onAdicionar }: Props) {
  const [texto, setTexto] = useState('');

  const vazio = texto.trim().length === 0;

  /** Envia o ingrediente para o pai e limpa o campo. */
  function adicionar() {
    if (vazio) return;
    onAdicionar(texto.trim());
    setTexto('');
  }

  return (
    <View style={estilos.linha}>
      <TextInput
        style={estilos.campo}
        value={texto}
        onChangeText={setTexto}
        placeholder="Ex.: ovo, arroz, tomate..."
        placeholderTextColor={cores.textoSecundario}
        // Permite adicionar apertando "enter" no teclado, além do botão.
        onSubmitEditing={adicionar}
        returnKeyType="done"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Pressable
        onPress={adicionar}
        disabled={vazio}
        style={({ pressed }) => [
          estilos.botao,
          vazio && estilos.botaoDesabilitado,
          pressed && !vazio && estilos.botaoPressionado,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Adicionar ingrediente"
      >
        <Text style={estilos.botaoTexto}>+</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    gap: espacos.sm,
  },
  campo: {
    flex: 1,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raios.md,
    paddingHorizontal: espacos.md,
    paddingVertical: espacos.md,
    fontSize: fontes.normal,
    color: cores.texto,
  },
  botao: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.primaria,
    borderRadius: raios.md,
  },
  botaoDesabilitado: {
    backgroundColor: cores.desabilitado,
  },
  botaoPressionado: {
    backgroundColor: cores.primariaEscura,
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontSize: fontes.grande,
    fontWeight: '700',
  },
});
