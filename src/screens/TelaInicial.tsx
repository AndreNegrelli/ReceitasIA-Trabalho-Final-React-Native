/**
 * TelaInicial.tsx
 *
 * Tela principal do app. O usuário monta a lista do que tem em casa,
 * escolhe filtros opcionais e pede as receitas para a IA.
 *
 * O fluxo da tela é controlado por um estado simples:
 *   'inicial'    -> nada foi pedido ainda
 *   'carregando' -> aguardando a resposta da IA
 *   'erro'       -> a chamada falhou (mensagem pronta em `erro`)
 *   'pronto'     -> temos receitas para listar
 */

import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CardReceita from '../components/CardReceita';
import ChipIngrediente from '../components/ChipIngrediente';
import EstadoCarregando from '../components/EstadoCarregando';
import EstadoErro from '../components/EstadoErro';
import IngredienteInput from '../components/IngredienteInput';
import SeletorOpcao from '../components/SeletorOpcao';
import { ErroIA } from '../services/geminiClient';
import { buscarReceitas } from '../services/receitasService';
import { cores, espacos, fontes, raios } from '../theme';
import { Filtros, OPCOES_REFEICAO, OPCOES_RESTRICAO, Receita } from '../types';

/** Situação em que a tela se encontra. */
type Situacao = 'inicial' | 'carregando' | 'erro' | 'pronto';

type Props = {
  /** Chave da API salva, ou null se ainda não configurada. */
  apiKey: string | null;
  /** Abre a tela de detalhe da receita escolhida. */
  onAbrirReceita: (receita: Receita) => void;
  /** Abre a tela de configurações. */
  onAbrirConfiguracoes: () => void;
};

export default function TelaInicial({ apiKey, onAbrirReceita, onAbrirConfiguracoes }: Props) {
  const insets = useSafeAreaInsets();

  const [ingredientes, setIngredientes] = useState<string[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({ refeicao: null, restricao: null });
  const [situacao, setSituacao] = useState<Situacao>('inicial');
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [erro, setErro] = useState<string>('');

  const podeGerar = ingredientes.length > 0 && situacao !== 'carregando';

  /** Adiciona um ingrediente, ignorando repetidos (sem diferenciar maiúsculas). */
  function adicionarIngrediente(novo: string) {
    setIngredientes((atuais) => {
      const jaExiste = atuais.some((item) => item.toLowerCase() === novo.toLowerCase());
      return jaExiste ? atuais : [...atuais, novo];
    });
  }

  /** Remove o ingrediente da posição informada. */
  function removerIngrediente(indice: number) {
    setIngredientes((atuais) => atuais.filter((_, i) => i !== indice));
  }

  /** Chama a IA e guarda o resultado (ou o erro) no estado da tela. */
  async function gerarReceitas() {
    setSituacao('carregando');
    setErro('');

    try {
      const resultado = await buscarReceitas(apiKey ?? '', ingredientes, filtros);
      setReceitas(resultado);
      setSituacao('pronto');
    } catch (e) {
      // O serviço sempre lança ErroIA com mensagem pronta em português;
      // o `else` cobre qualquer imprevisto para o app não quebrar.
      setErro(e instanceof ErroIA ? e.message : 'Algo deu errado. Tente de novo.');
      setSituacao('erro');
    }
  }

  return (
    <View style={[estilos.container, { paddingTop: insets.top }]}>
      <View style={estilos.cabecalho}>
        <View>
          <Text style={estilos.titulo}>ReceitasIA</Text>
          <Text style={estilos.subtitulo}>O que você tem na cozinha hoje?</Text>
        </View>

        <Pressable
          onPress={onAbrirConfiguracoes}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Abrir configurações"
        >
          <Text style={estilos.engrenagem}>⚙︎</Text>
        </Pressable>
      </View>

      {/*
        A FlatList é a rolagem da tela inteira: o formulário vai no
        ListHeaderComponent. Assim evitamos aninhar uma lista dentro de
        um ScrollView, o que o React Native desaconselha.
      */}
      <FlatList
        data={situacao === 'pronto' ? receitas : []}
        keyExtractor={(receita, indice) => `${receita.nome}-${indice}`}
        renderItem={({ item }) => (
          <CardReceita receita={item} onPress={() => onAbrirReceita(item)} />
        )}
        contentContainerStyle={estilos.conteudo}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={estilos.formulario}>
            <IngredienteInput onAdicionar={adicionarIngrediente} />

            {ingredientes.length > 0 ? (
              <View style={estilos.chips}>
                {ingredientes.map((ingrediente, indice) => (
                  <ChipIngrediente
                    key={`${ingrediente}-${indice}`}
                    nome={ingrediente}
                    onRemover={() => removerIngrediente(indice)}
                  />
                ))}
              </View>
            ) : (
              <Text style={estilos.dica}>
                Adicione os ingredientes que você já tem em casa. Quanto mais itens,
                melhores as sugestões.
              </Text>
            )}

            <SeletorOpcao
              titulo="Tipo de refeição (opcional)"
              opcoes={OPCOES_REFEICAO}
              valor={filtros.refeicao}
              onChange={(refeicao) => setFiltros((atual) => ({ ...atual, refeicao }))}
            />

            <SeletorOpcao
              titulo="Restrição alimentar (opcional)"
              opcoes={OPCOES_RESTRICAO}
              valor={filtros.restricao}
              onChange={(restricao) => setFiltros((atual) => ({ ...atual, restricao }))}
            />

            <Pressable
              onPress={gerarReceitas}
              disabled={!podeGerar}
              style={({ pressed }) => [
                estilos.botaoGerar,
                !podeGerar && estilos.botaoDesabilitado,
                pressed && podeGerar && estilos.botaoPressionado,
              ]}
              accessibilityRole="button"
            >
              <Text style={estilos.botaoGerarTexto}>
                {situacao === 'carregando' ? 'Gerando...' : 'Gerar receitas'}
              </Text>
            </Pressable>

            {situacao === 'carregando' && <EstadoCarregando />}

            {situacao === 'erro' && (
              <EstadoErro
                mensagem={erro}
                // Se o problema é a chave, o botão leva direto às configurações;
                // nos outros casos ele apenas repete a chamada.
                rotuloAcao={apiKey ? 'Tentar de novo' : 'Abrir configurações'}
                onAcao={apiKey ? gerarReceitas : onAbrirConfiguracoes}
              />
            )}

            {situacao === 'pronto' && (
              <Text style={estilos.tituloResultados}>
                {receitas.length} sugestões do chef
              </Text>
            )}
          </View>
        }
      />
    </View>
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
    paddingVertical: espacos.md,
  },
  titulo: {
    fontSize: fontes.titulo,
    fontWeight: '800',
    color: cores.primaria,
  },
  subtitulo: {
    fontSize: fontes.normal,
    color: cores.textoSecundario,
  },
  engrenagem: {
    fontSize: fontes.grande,
    color: cores.textoSecundario,
  },
  conteudo: {
    paddingHorizontal: espacos.md,
    paddingBottom: espacos.xl,
    gap: espacos.md,
  },
  formulario: {
    gap: espacos.md,
    marginBottom: espacos.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacos.sm,
  },
  dica: {
    fontSize: fontes.normal,
    color: cores.textoSecundario,
    lineHeight: 22,
  },
  botaoGerar: {
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
  botaoGerarTexto: {
    color: '#FFFFFF',
    fontSize: fontes.media,
    fontWeight: '700',
  },
  tituloResultados: {
    fontSize: fontes.media,
    fontWeight: '700',
    color: cores.texto,
    marginTop: espacos.sm,
  },
});
