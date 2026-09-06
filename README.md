# ReceitasIA

Aplicativo em **React Native (Expo)** que usa uma **API de IA** para sugerir receitas a
partir dos ingredientes que o usuário já tem em casa.

O usuário monta a lista do que tem na cozinha, escolhe filtros opcionais (tipo de
refeição e restrição alimentar) e o app consulta a API do **Google Gemini**, que devolve
três receitas completas: ingredientes, modo de preparo passo a passo, tempo, porções,
dificuldade e uma dica de preparo.

---

## Como rodar

### 1. Instalar as dependências

```bash
npm install
```

### 2. Iniciar o projeto

```bash
npx expo start
```

Com o servidor rodando, escolha uma das opções:

- **Celular:** instale o app **Expo Go** (Android/iOS) e escaneie o QR Code do terminal.
- **Emulador Android:** aperte `a` no terminal (requer Android Studio instalado).
- **Navegador:** aperte `w`. Funciona para ver o layout, mas o armazenamento seguro da
  chave não existe no navegador — use o celular ou o emulador para testar de verdade.

### 3. Configurar a chave da API (só na primeira vez)

Na primeira execução o app abre direto a tela de **Configurações**:

1. Acesse <https://aistudio.google.com/apikey>
2. Entre com sua conta Google.
3. Clique em **Create API key** e copie a chave.
4. Cole a chave no campo do app e toque em **Salvar chave**.

A chave é gratuita (free tier do Gemini). Os limites de uso da sua conta ficam em
<https://aistudio.google.com/rate-limit>.

---

## Como usar

1. Digite um ingrediente e toque em **+** (ou aperte "enter" no teclado). Repita para
   cada item que você tem em casa.
2. Toque no **×** de um chip para remover um ingrediente.
3. Opcionalmente escolha o tipo de refeição e/ou uma restrição alimentar.
4. Toque em **Gerar receitas**.
5. Toque em qualquer card para ver a receita completa.

---

## Estrutura do projeto

```
ReceitasIA/
├── App.tsx                       # raiz: carrega a chave e controla qual tela aparece
├── src/
│   ├── theme.ts                  # cores, espaçamentos e tamanhos de fonte
│   ├── types.ts                  # tipos de domínio (Receita, Filtros...)
│   ├── storage/
│   │   └── apiKeyStorage.ts      # salva/lê/apaga a chave no armazenamento seguro
│   ├── services/                 # integração com a IA
│   │   ├── geminiClient.ts       # chamada HTTP + tradução de erros
│   │   ├── receitasPrompt.ts     # instrução de sistema + JSON Schema da resposta
│   │   └── receitasService.ts    # o que as telas chamam: devolve Receita[]
│   ├── components/               # peças reutilizáveis de UI
│   │   ├── IngredienteInput.tsx
│   │   ├── ChipIngrediente.tsx
│   │   ├── SeletorOpcao.tsx
│   │   ├── CardReceita.tsx
│   │   ├── EstadoCarregando.tsx
│   │   └── EstadoErro.tsx
│   └── screens/                  # as três telas do app
│       ├── TelaInicial.tsx
│       ├── TelaReceita.tsx
│       └── TelaConfiguracoes.tsx
└── README.md
```

A organização é em camadas: **telas** só cuidam de interface e chamam os **serviços**;
os serviços cuidam da IA e devolvem dados já validados. Nenhuma tela fala HTTP
diretamente.

---

## Como funciona a integração com a IA

A chamada é feita com o `fetch` nativo do React Native (sem SDK), para a interface atual
da API do Gemini — a **Interactions API**:

```
POST https://generativelanguage.googleapis.com/v1beta/interactions
Header: x-goog-api-key: <sua chave>
```

O corpo da requisição leva cinco coisas:

| Campo | Para que serve |
|---|---|
| `model` | qual modelo responde (`gemini-3.6-flash`) |
| `system_instruction` | define o papel da IA: um chef que só usa o que a pessoa tem |
| `input` | o pedido montado a partir dos ingredientes e filtros |
| `response_format` | **JSON Schema** que a resposta é obrigada a seguir |
| `generation_config` | `thinking_level: 'low'` — reduz o tempo de espera pela metade |

Sobre o `thinking_level`: por padrão o modelo raciocina bastante antes de responder.
Nos testes isso levava **38 segundos** para gerar 3 receitas; com `'low'` cai para
**~17 segundos**, sem diferença perceptível na qualidade das receitas.

O `response_format` é o ponto mais importante: em vez de receber um texto corrido e ter
que interpretá-lo, o app recebe um JSON com campos fixos (`nome`, `passos`,
`ingredientesExtras`...) que espelham exatamente os tipos de `src/types.ts`. É isso que
permite montar os cards e a tela de detalhe sem nenhum parsing frágil.

### Trocar de modelo

O modelo está numa única constante em `src/services/geminiClient.ts`:

```ts
export const MODELO = 'gemini-3.6-flash';
```

Alternativas mais recentes: `gemini-3.5-flash`, `gemini-3.8-flash`.

### Tratamento de erros

Toda falha vira um `ErroIA` com mensagem pronta em português, exibida na própria tela:

| Situação | O que o usuário vê |
|---|---|
| Sem chave configurada | Aviso com atalho para as Configurações |
| Chave inválida | "Chave da API inválida ou sem permissão" |
| Modelo aposentado (404) | Diz qual constante trocar e repassa o substituto sugerido pela API |
| Limite gratuito atingido (429) | "Limite de uso gratuito atingido" |
| Sem internet | "Sem conexão com a internet" |
| Demora acima de 90s | "A IA demorou demais para responder" |
| Resposta fora do formato | "A IA respondeu em um formato inesperado" |

Detalhe importante descoberto nos testes: para chave inválida a API do Google responde
**400**, não 401. Por isso o código inspeciona o corpo da resposta (`API_KEY_INVALID`)
antes de escolher a mensagem.

---

## Limitações conhecidas

- **A chave fica no aparelho.** Ela é guardada no armazenamento seguro do sistema
  (`expo-secure-store`) e nunca aparece no código nem no bundle — que é o suficiente para
  um trabalho acadêmico. Em um app de produção, porém, a chamada à IA deveria passar por
  um backend próprio, de modo que a chave nunca saísse do servidor.
- **`expo-secure-store` não funciona no navegador.** Rodar com `npm run web` mostra o
  layout, mas a chave não é salva.
- O app não guarda histórico nem receitas favoritas: cada consulta é independente.
