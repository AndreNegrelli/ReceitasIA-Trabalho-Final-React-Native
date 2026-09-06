/**
 * CardReceita.tsx
 *
 * Card resumido de uma receita, mostrado na lista da tela inicial.
 * Tocar no card abre a tela de detalhe.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Receita } from '../types';
import { cores, espacos, fontes, raios } from '../theme';

type Props = {
  receita: Receita;
  onPress: () => void;
};

export default function CardReceita({ receita, onPress }: Props) {
  // Quantos ingredientes o usuário ainda precisaria comprar.
  const faltam = receita.ingredientesExtras.length;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [estilos.card, pressed && estilos.cardPressionado]}
      accessibilityRole="button"
      accessibilityLabel={`Abrir receita ${receita.nome}`}
    >
      <Text style={estilos.nome}>{receita.nome}</Text>
      <Text style={estilos.descricao} numberOfLines={2}>
        {receita.descricao}
      </Text>

      <View style={estilos.badges}>
        <Badge texto={`⏱ ${receita.tempoPreparoMin} min`} />
        <Badge texto={`🍽 ${receita.porcoes} porções`} />
        <Badge texto={receita.dificuldade} />
      </View>

      <Text style={estilos.rodape}>
        {faltam === 0
          ? '✓ Você tem tudo o que precisa'
          : `Faltam ${faltam} ${faltam === 1 ? 'ingrediente' : 'ingredientes'}`}
      </Text>
    </Pressable>
  );
}

/** Etiqueta pequena usada para tempo, porções e dificuldade. */
function Badge({ texto }: { texto: string }) {
  return (
    <View style={estilos.badge}>
      <Text style={estilos.badgeTexto}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  card: {
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raios.md,
    padding: espacos.md,
    gap: espacos.sm,
  },
  cardPressionado: {
    backgroundColor: cores.primariaClara,
  },
  nome: {
    fontSize: fontes.media,
    fontWeight: '700',
    color: cores.texto,
  },
  descricao: {
    fontSize: fontes.normal,
    color: cores.textoSecundario,
    lineHeight: 21,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacos.sm,
  },
  badge: {
    backgroundColor: cores.primariaClara,
    borderRadius: raios.pill,
    paddingVertical: espacos.xs,
    paddingHorizontal: espacos.sm + 2,
  },
  badgeTexto: {
    fontSize: fontes.pequena,
    color: cores.primariaEscura,
    fontWeight: '600',
  },
  rodape: {
    fontSize: fontes.pequena,
    color: cores.textoSecundario,
  },
});
