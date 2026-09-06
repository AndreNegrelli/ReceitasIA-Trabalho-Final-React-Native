/**
 * theme.ts
 *
 * Paleta de cores, espaçamentos e tamanhos de fonte usados em todo o app.
 * Centralizar esses valores aqui evita "números mágicos" espalhados pelos
 * componentes e deixa fácil mudar a identidade visual em um lugar só.
 */

export const cores = {
  fundo: '#FFF9F3', // fundo geral (bege bem claro, remete a cozinha)
  superficie: '#FFFFFF', // cards e caixas sobre o fundo
  primaria: '#E4572E', // cor de destaque (botões, títulos)
  primariaEscura: '#C2431E', // estado "pressionado" dos botões
  primariaClara: '#FDEDE6', // fundo suave para chips e badges
  texto: '#2B2118', // texto principal
  textoSecundario: '#7A6A5C', // legendas, descrições, placeholders
  borda: '#EADFD4', // divisórias e contornos
  sucesso: '#2E7D4F', // "você já tem esse ingrediente"
  erro: '#C0392B', // mensagens de erro
  desabilitado: '#D9CFC5', // botão sem ação disponível
};

export const espacos = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const fontes = {
  pequena: 13,
  normal: 15,
  media: 17,
  grande: 22,
  titulo: 28,
};

export const raios = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999, // deixa o elemento totalmente arredondado (chips e badges)
};
