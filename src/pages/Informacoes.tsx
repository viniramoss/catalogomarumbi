import React from 'react';
import Navbar from '../components/Navbar';
import CabecalhoPagina from '../components/CabecalhoPagina';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const Informacoes = () => (
  <div className="flex min-h-screen flex-col bg-background">
    <Navbar />
    <CabecalhoPagina rotulo="Açougue Marumbi" titulo="Informações">
      <p className="mt-3 max-w-2xl font-semibold text-gold-400">
        Estamos prontos para atender suas dúvidas e pedidos. Entre em contato conosco.
      </p>
    </CabecalhoPagina>
    <main className="flex-1">
      <Contact />
    </main>
    <Footer />
  </div>
);

export default Informacoes;
