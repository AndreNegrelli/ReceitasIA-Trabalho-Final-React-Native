/**
 * EstadoCarregando.tsx
 *
 * Mostrado enquanto a IA está pensando. Uma resposta pode levar alguns
 * segundos, então é importante deixar claro que o app não travou.
 */

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { cores, espacos, fontes } from '../theme';

export default function EstadoCarregando() {
  return (
    <View style={estilos.container}>
      <ActivityIndicator size="large" color={cores.primaria} />
      <Text style={estilos.titulo}>Consultando o chef...</Text>
      <Text style={estilos.legenda}>
        A IA está montando receitas com os seus ingredientes.
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: espacos.sm,
    paddingVertical: espacos.xl,
  },
  titulo: {
    fontSize: fontes.media,
    fontWeight: '700',
    color: cores.texto,
    marginTop: espacos.sm,
  },
  legenda: {
    fontSize: fontes.normal,
    color: cores.textoSecundario,
    textAlign: 'center',
  },
});
