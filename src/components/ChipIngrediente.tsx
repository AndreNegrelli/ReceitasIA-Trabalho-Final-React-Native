/**
 * ChipIngrediente.tsx
 *
 * "Etiqueta" arredondada que mostra um ingrediente adicionado pelo
 * usuário, com um X para removê-lo da lista.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores, espacos, fontes, raios } from '../theme';

type Props = {
  /** Texto do ingrediente, ex.: "cebola". */
  nome: string;
  /** Chamado quando o usuário toca no X. */
  onRemover: () => void;
};

export default function ChipIngrediente({ nome, onRemover }: Props) {
  return (
    <View style={estilos.chip}>
      <Text style={estilos.texto}>{nome}</Text>

      <Pressable
        onPress={onRemover}
        // Aumenta a área de toque sem aumentar o tamanho visual do X,
        // para o botão não ficar difícil de acertar com o dedo.
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={`Remover ${nome}`}
      >
        <Text style={estilos.remover}>×</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
    backgroundColor: cores.primariaClara,
    borderRadius: raios.pill,
    paddingVertical: espacos.sm,
    paddingHorizontal: espacos.md,
  },
  texto: {
    color: cores.primariaEscura,
    fontSize: fontes.normal,
    fontWeight: '600',
  },
  remover: {
    color: cores.primariaEscura,
    fontSize: fontes.media,
    fontWeight: '700',
    lineHeight: fontes.media + 2,
  },
});
