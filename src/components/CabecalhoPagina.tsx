import React from 'react';
import fundo from '../images/fundo-carne.jpg';

interface CabecalhoPaginaProps {
  rotulo: string;
  titulo: string;
  children?: React.ReactNode; // abaixo do título
  lateral?: React.ReactNode; // à direita no computador, abaixo no celular
}

// Faixa escura com a foto de fundo no topo das páginas internas.
// Já desconta a altura do Navbar fixo (pt-16 / md:pt-20).
const CabecalhoPagina = ({ rotulo, titulo, children, lateral }: CabecalhoPaginaProps) => (
  <header className="relative overflow-hidden bg-black pt-16 text-white md:pt-20">
    <div
      className="absolute inset-0 bg-cover bg-center opacity-30"
      style={{ backgroundImage: `url('${fundo}')` }}
      aria-hidden="true"
    />
    <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80" aria-hidden="true" />

    <div className="relative butcher-container flex flex-col gap-4 py-5 sm:gap-6 sm:py-7 md:flex-row md:items-end md:justify-between md:py-10">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400">{rotulo}</p>
        <h1 className="mt-1.5 font-serif text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{titulo}</h1>
        {children}
      </div>
      {lateral && <div className="md:shrink-0">{lateral}</div>}
    </div>
  </header>
);

export default CabecalhoPagina;
