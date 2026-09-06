/**
 * TelaReceita.tsx
 *
 * Detalhe de uma receita: ingredientes separados entre "você já tem" e
 * "precisa comprar", modo de preparo numerado e a dica do chef.
 *
 * A tela é puramente de exibição — ela recebe a receita pronta por props
 * e não faz nenhuma chamada à IA.
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Receita } from '../types';
import { cores, espacos, fontes, raios } from '../theme';

type Props = {
  receita: Receita;
  onVoltar: () => void;
};

export default function TelaReceita({ receita, onVoltar }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={estilos.container}>
      <View style={[estilos.cabecalho, { paddingTop: insets.top + espacos.sm }]}>
        <Pressable onPress={onVoltar} hitSlop={12} accessibilityRole="button">
          <Text style={estilos.voltar}>Voltar</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={estilos.conteudo}>
        <Text style={estilos.nome}>{receita.nome}</Text>
        <Text style={estilos.descricao}>{receita.descricao}</Text>

        <View style={estilos.badges}>
          <Badge texto={`⏱ ${receita.tempoPreparoMin} min`} />
          <Badge texto={`🍽 ${receita.porcoes} porções`} />
          <Badge texto={receita.dificuldade} />
        </View>

        <Secao titulo="Você já tem">
          {receita.ingredientesUsados.map((item, indice) => (
            <Text key={`usado-${indice}`} style={estilos.itemTem}>
              ✓ {item}
            </Text>
          ))}
        </Secao>

        {/* A lista de compras só aparece se realmente faltar alguma coisa. */}
        {receita.ingredientesExtras.length > 0 && (
          <Secao titulo="Precisa comprar">
            {receita.ingredientesExtras.map((item, indice) => (
              <Text key={`extra-${indice}`} style={estilos.itemFalta}>
                • {item}
              </Text>
            ))}
          </Secao>
        )}

        <Secao titulo="Modo de preparo">
          {receita.passos.map((passo, indice) => (
            <View key={`passo-${indice}`} style={estilos.passo}>
              {/* A numeração é feita aqui, não pela IA (ver receitasPrompt.ts). */}
              <View style={estilos.numero}>
                <Text style={estilos.numeroTexto}>{indice + 1}</Text>
              </View>
              <Text style={estilos.passoTexto}>{passo}</Text>
            </View>
          ))}
        </Secao>

        <View style={estilos.dica}>
          <Text style={estilos.dicaTitulo}>Dica do chef</Text>
          <Text style={estilos.dicaTexto}>{receita.dica}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

/** Bloco com título e conteúdo, usado nas três seções da receita. */
function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={estilos.secao}>
      <Text style={estilos.secaoTitulo}>{titulo}</Text>
      <View style={estilos.secaoConteudo}>{children}</View>
    </View>
  );
}

/** Etiqueta pequena de tempo, porções e dificuldade. */
function Badge({ texto }: { texto: string }) {
  return (
    <View style={estilos.badge}>
      <Text style={estilos.badgeTexto}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  cabecalho: {
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
  },
  conteudo: {
    padding: espacos.md,
    gap: espacos.md,
    paddingBottom: espacos.xl,
  },
  nome: {
    fontSize: fontes.titulo,
    fontWeight: '800',
    color: cores.texto,
  },
  descricao: {
    fontSize: fontes.normal,
    color: cores.textoSecundario,
    lineHeight: 22,
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
  secao: {
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raios.md,
    padding: espacos.md,
    gap: espacos.sm,
  },
  secaoTitulo: {
    fontSize: fontes.media,
    fontWeight: '700',
    color: cores.texto,
  },
  secaoConteudo: {
    gap: espacos.sm,
  },
  itemTem: {
    fontSize: fontes.normal,
    color: cores.sucesso,
    lineHeight: 22,
  },
  itemFalta: {
    fontSize: fontes.normal,
    color: cores.texto,
    lineHeight: 22,
  },
  passo: {
    flexDirection: 'row',
    gap: espacos.sm,
    alignItems: 'flex-start',
  },
  numero: {
    width: 24,
    height: 24,
    borderRadius: raios.pill,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroTexto: {
    color: '#FFFFFF',
    fontSize: fontes.pequena,
    fontWeight: '700',
  },
  passoTexto: {
    flex: 1,
    fontSize: fontes.normal,
    color: cores.texto,
    lineHeight: 22,
  },
  dica: {
    backgroundColor: cores.primariaClara,
    borderRadius: raios.md,
    padding: espacos.md,
    gap: espacos.xs,
  },
  dicaTitulo: {
    fontSize: fontes.normal,
    fontWeight: '700',
    color: cores.primariaEscura,
  },
  dicaTexto: {
    fontSize: fontes.normal,
    color: cores.primariaEscura,
    lineHeight: 22,
  },
});
