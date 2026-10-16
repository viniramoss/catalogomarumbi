import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import CabecalhoPagina from '../components/CabecalhoPagina';
import Footer from '../components/Footer';
import { StoreLocation, getOrderedStores, getStoreByCatalogo } from '../config/storeConfig';
import { ProductCategory, categorias, formatPrice, lembrarUnidade, produtosDaLoja } from '../config/catalogo';
import { unidadeDoSite } from '../config/site';

// Normaliza para a busca ignorar acento e maiúsculas
const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// Botões para trocar de unidade sem sair do catálogo
const SeletorDeUnidade = ({ atual }: { atual: StoreLocation }) => (
  <nav aria-label="Unidade">
    <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white/70 sm:mb-2">Unidade</p>
    <div className="flex flex-wrap gap-1.5 rounded-xl bg-white/10 p-1.5 backdrop-blur-sm">
      {getOrderedStores().map(store => {
        const ativa = store.id === atual.id;
        return (
          <Link
            key={store.id}
            to={`/catalogo/${store.catalogo}`}
            aria-current={ativa ? 'page' : undefined}
            className={`min-w-[7.5rem] flex-1 rounded-lg px-3 py-1.5 text-center transition-colors sm:min-w-[10.5rem] sm:px-5 sm:py-2 ${
              ativa ? 'bg-gold-500 text-black shadow' : 'text-white hover:bg-white/15'
            }`}
          >
            <span className="block font-bold leading-tight">{store.displayName}</span>
            <span className={`block whitespace-nowrap text-xs font-semibold ${ativa ? 'text-black/75' : 'text-white/70'}`}>
              {store.bairro}
            </span>
          </Link>
        );
      })}
    </div>
  </nav>
);

const Catalogo = () => {
  // No site de uma unidade só, o catálogo é a página inicial e não tem a unidade no endereço
  const { loja = unidadeDoSite ?? '' } = useParams();
  const store = getStoreByCatalogo(loja);
  const variasUnidades = getOrderedStores().length > 1;
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState<ProductCategory | 'todos'>('todos');

  // Lembra a unidade enquanto a pessoa navega pelas outras abas
  useEffect(() => {
    if (store) lembrarUnidade(store.catalogo);
  }, [store]);

  const itens = useMemo(() => (store ? produtosDaLoja(store.catalogo) : []), [store]);

  // Só as categorias que a unidade tem
  const categoriasDaLoja = useMemo(
    () => categorias.filter(c => itens.some(item => item.categoria === c.id)),
    [itens],
  );

  // Ao trocar de unidade a busca continua; a categoria volta para Todos se a outra unidade não tiver
  useEffect(() => {
    if (categoria !== 'todos' && !categoriasDaLoja.some(c => c.id === categoria)) {
      setCategoria('todos');
    }
  }, [categoria, categoriasDaLoja]);

  const secoes = useMemo(() => {
    const termo = normalizar(busca);
    const filtrados = itens.filter(
      item =>
        (categoria === 'todos' || item.categoria === categoria) &&
        (!termo || normalizar(item.nome).includes(termo)),
    );
    return categoriasDaLoja
      .map(c => ({ ...c, itens: filtrados.filter(item => item.categoria === c.id) }))
      .filter(secao => secao.itens.length > 0);
  }, [itens, categoriasDaLoja, busca, categoria]);

  if (!store) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <CabecalhoPagina
        rotulo="Catálogo de preços"
        titulo={store.displayName}
        lateral={variasUnidades ? <SeletorDeUnidade atual={store} /> : undefined}
      >
        {/* Sem ícone na frente, para o endereço alinhar à esquerda com o título */}
        <a
          href={store.directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-sm font-medium text-white/85 hover:text-white hover:underline underline-offset-4 transition-colors sm:text-base"
        >
          {store.address1} · {store.bairro}
        </a>
      </CabecalhoPagina>

      {/* Busca e categorias */}
      <div className="z-30 border-b border-border bg-background/95 backdrop-blur-sm md:sticky md:top-20">
        <div className="butcher-container flex flex-col gap-3 py-3 md:py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <label className="relative block w-full lg:order-last lg:w-80 lg:shrink-0">
            <span className="sr-only">Buscar produto</span>
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar produto"
              className="w-full rounded-lg border border-input bg-card py-2.5 pl-10 pr-10 text-base font-medium text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                aria-label="Limpar busca"
              >
                <X size={18} />
              </button>
            )}
          </label>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Categorias">
            {[{ id: 'todos' as const, nome: 'Todos' }, ...categoriasDaLoja].map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoria(c.id)}
                aria-pressed={categoria === c.id}
                className={`rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors sm:px-4 sm:py-2 ${
                  categoria === c.id
                    ? 'bg-gold-500 text-black shadow-sm'
                    : 'border border-border bg-card text-card-foreground hover:border-gold-500'
                }`}
              >
                {c.nome}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de preços */}
      <main className="flex-1">
        <div className="butcher-container py-7 md:py-10">
          {secoes.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg font-semibold text-foreground">Nenhum produto encontrado.</p>
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca('')}
                  className="mt-3 font-semibold text-gold-800 underline dark:text-gold-400"
                >
                  Limpar a busca
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-10">
              {secoes.map(secao => (
                <section key={secao.id} aria-labelledby={`categoria-${secao.id}`}>
                  <div className="mb-4 flex items-end justify-between gap-3 border-b-2 border-gold-500 pb-2">
                    <h2 id={`categoria-${secao.id}`} className="font-serif text-2xl font-bold text-foreground md:text-3xl">
                      {secao.nome}
                    </h2>
                    <span className="pb-1 text-sm font-semibold text-muted-foreground">
                      {secao.itens.length} {secao.itens.length === 1 ? 'produto' : 'produtos'}
                    </span>
                  </div>

                  <ul className="grid gap-2.5 md:grid-cols-2 md:gap-3 xl:grid-cols-3">
                    {secao.itens.map(item => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm"
                      >
                        <span className="min-w-0 break-words font-bold leading-snug text-card-foreground">
                          {item.nome}
                        </span>
                        <span className="shrink-0 whitespace-nowrap">
                          <span className="text-base font-extrabold lining-nums tabular-nums text-card-foreground sm:text-lg">
                            {formatPrice(item.preco)}
                          </span>
                          <span className="ml-0.5 text-xs font-semibold text-muted-foreground">/{item.unidade}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}

          <p className="mt-10 text-center text-sm font-semibold text-muted-foreground">
            Preços da unidade {store.displayName}, sujeitos a alterações sem aviso.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Catalogo;
