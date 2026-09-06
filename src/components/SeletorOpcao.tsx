/**
 * SeletorOpcao.tsx
 *
 * Grupo de botões onde no máximo uma opção fica marcada. Usado para os
 * filtros de tipo de refeição e restrição alimentar.
 *
 * Tocar na opção já marcada desmarca — assim o usuário volta para
 * "tanto faz" sem precisar de um botão extra.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores, espacos, fontes, raios } from '../theme';

type Props = {
  /** Rótulo mostrado acima dos botões. */
  titulo: string;
  /** Opções disponíveis. */
  opcoes: readonly string[];
  /** Opção marcada no momento; null = nenhuma. */
  valor: string | null;
  /** Recebe a nova opção, ou null quando o usuário desmarca. */
  onChange: (valor: string | null) => void;
};

export default function SeletorOpcao({ titulo, opcoes, valor, onChange }: Props) {
  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>{titulo}</Text>

      <View style={estilos.opcoes}>
        {opcoes.map((opcao) => {
          const selecionada = valor === opcao;

          return (
            <Pressable
              key={opcao}
              // Se já estava marcada, desmarca (volta para null).
              onPress={() => onChange(selecionada ? null : opcao)}
              style={[estilos.opcao, selecionada && estilos.opcaoSelecionada]}
              accessibilityRole="radio"
              accessibilityState={{ selected: selecionada }}
            >
              <Text style={[estilos.opcaoTexto, selecionada && estilos.opcaoTextoSelecionado]}>
                {opcao}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    gap: espacos.sm,
  },
  titulo: {
    fontSize: fontes.normal,
    fontWeight: '700',
    color: cores.texto,
  },
  opcoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacos.sm,
  },
  opcao: {
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    borderRadius: raios.pill,
    paddingVertical: espacos.sm,
    paddingHorizontal: espacos.md,
  },
  opcaoSelecionada: {
    backgroundColor: cores.primaria,
    borderColor: cores.primaria,
  },
  opcaoTexto: {
    fontSize: fontes.pequena,
    color: cores.textoSecundario,
    fontWeight: '600',
  },
  opcaoTextoSelecionado: {
    color: '#FFFFFF',
  },
});
