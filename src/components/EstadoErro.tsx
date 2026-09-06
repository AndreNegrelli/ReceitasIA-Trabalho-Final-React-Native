/**
 * EstadoErro.tsx
 *
 * Caixa de erro amigável. A mensagem vem pronta do serviço (ErroIA),
 * então aqui só cuidamos da aparência e do botão de ação.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores, espacos, fontes, raios } from '../theme';

type Props = {
  /** Mensagem já em português, vinda de ErroIA.message. */
  mensagem: string;
  /** Rótulo do botão. Se ausente, nenhum botão é mostrado. */
  rotuloAcao?: string;
  /** Ação executada ao tocar no botão. */
  onAcao?: () => void;
};

export default function EstadoErro({ mensagem, rotuloAcao, onAcao }: Props) {
  return (
    <View style={estilos.container}>
      <Text style={estilos.icone}>⚠️</Text>
      <Text style={estilos.mensagem}>{mensagem}</Text>

      {rotuloAcao && onAcao && (
        <Pressable
          onPress={onAcao}
          style={({ pressed }) => [estilos.botao, pressed && estilos.botaoPressionado]}
          accessibilityRole="button"
        >
          <Text style={estilos.botaoTexto}>{rotuloAcao}</Text>
        </Pressable>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: espacos.sm,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raios.md,
    padding: espacos.lg,
  },
  icone: {
    fontSize: fontes.grande,
  },
  mensagem: {
    fontSize: fontes.normal,
    color: cores.texto,
    textAlign: 'center',
    lineHeight: 22,
  },
  botao: {
    marginTop: espacos.sm,
    backgroundColor: cores.primaria,
    borderRadius: raios.md,
    paddingVertical: espacos.sm,
    paddingHorizontal: espacos.lg,
  },
  botaoPressionado: {
    backgroundColor: cores.primariaEscura,
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontSize: fontes.normal,
    fontWeight: '700',
  },
});
