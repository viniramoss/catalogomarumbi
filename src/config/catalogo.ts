// Catálogo de preços por unidade.
// Os dados ficam em src/data/catalogo.json, que é editado pelas ferramentas em tools/
// (dashboard, comando de preço e sincronização com o GranMoney). Não edite à mão sem necessidade.
import dados from '../data/catalogo.json';
import { unidadeDoSite } from './site';

export type StoreTag = 'marumbi1' | 'marumbi3';
export type ProductCategory = 'bovinos' | 'suinos' | 'aves' | 'moídas';

// Preço de um produto em uma unidade, ligado ao proCodigo do GranMoney daquela unidade
export interface PrecoNaLoja {
  codigo: string | null;    // proCodigo no GranMoney da unidade; null enquanto não vinculado
  nomeGranMoney?: string;   // nome como está no GranMoney, só para conferência
  preco: number;            // R$ por kg (ou pela unidade informada)
}

export interface ProdutoCatalogo {
  id: string;
  nome: string;
  categoria: ProductCategory;
  unidade?: string; // kg quando não informado
  lojas: Partial<Record<StoreTag, PrecoNaLoja>>;
}

export interface Catalogo {
  lojas: Record<StoreTag, { atualizadoEm: string }>;
  produtos: ProdutoCatalogo[];
}

export const catalogo = dados as Catalogo;

export const categorias: { id: ProductCategory; nome: string }[] = [
  { id: 'bovinos', nome: 'Bovinos' },
  { id: 'suinos', nome: 'Suínos' },
  { id: 'aves', nome: 'Frango' },
  { id: 'moídas', nome: 'Moídas' },
];

export interface ItemDaLoja {
  id: string;
  nome: string;
  categoria: ProductCategory;
  unidade: string;
  preco: number;
}

// Produtos vendidos na unidade, em ordem alfabética
export const produtosDaLoja = (loja: StoreTag): ItemDaLoja[] => {
  return catalogo.produtos
    .filter(produto => produto.lojas[loja])
    .map(produto => ({
      id: produto.id,
      nome: produto.nome,
      categoria: produto.categoria,
      unidade: produto.unidade ?? 'kg',
      preco: produto.lojas[loja]!.preco,
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
};

export const formatPrice = (price: number): string => {
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
};

// Unidade escolhida nesta visita, para a pessoa não escolher de novo ao voltar das outras abas.
// Fica no sessionStorage: some quando a guia do navegador é fechada, então numa nova visita
// a pessoa escolhe a unidade outra vez.
const CHAVE_UNIDADE = 'marumbi_unidade';

export const lembrarUnidade = (loja: StoreTag): void => {
  try {
    sessionStorage.setItem(CHAVE_UNIDADE, loja);
  } catch {
    // navegação privada ou armazenamento bloqueado: só não lembra
  }
};

export const unidadeLembrada = (): StoreTag | null => {
  try {
    const loja = sessionStorage.getItem(CHAVE_UNIDADE);
    return loja && loja in catalogo.lojas ? (loja as StoreTag) : null;
  } catch {
    return null;
  }
};

// Link do catálogo: no site de uma unidade é sempre a página inicial; no site com todas,
// vai direto para a unidade já escolhida nesta visita, senão para a escolha
export const linkDoCatalogo = (): string => {
  if (unidadeDoSite) return '/';
  const loja = unidadeLembrada();
  return loja ? `/catalogo/${loja}` : '/';
};
