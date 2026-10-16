import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Instagram, Mail, MapPin, MessageCircle } from 'lucide-react';
import logo from '../logo/logo-marumbi.png';
import { StoreLocation, contatos, getOrderedStores } from '../config/storeConfig';
import { linkDoCatalogo } from '../config/catalogo';

// Endereço (abre o Maps), WhatsApp e horário de uma unidade
// (largo: quando é a única unidade do site, os três itens ficam lado a lado no computador)
const DadosDaLoja = ({ store, largo = false }: { store: StoreLocation; largo?: boolean }) => (
  <div>
    <h3 className="font-serif text-xl font-bold">
      {store.displayName} <span className="font-sans text-base font-semibold text-butcher-300">· {store.bairro}</span>
    </h3>
    <ul className={`mt-4 font-medium ${largo ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6' : 'space-y-3'}`}>
      <li>
        <a
          href={store.directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-3 text-white/85 hover:text-white transition-colors"
        >
          <MapPin size={18} className="mt-0.5 shrink-0 text-gold-400" />
          <span>
            {store.address1}
            <br />
            {store.address2}
            <span className="mt-0.5 block text-sm font-semibold text-gold-400 group-hover:underline">Abrir no Maps</span>
          </span>
        </a>
      </li>
      <li>
        <a
          href={store.whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-3 text-white/85 hover:text-white transition-colors"
        >
          <MessageCircle size={18} className="mt-0.5 shrink-0 text-green-500" />
          <span>
            {store.phone}
            <span className="mt-0.5 block text-sm font-semibold text-green-500 group-hover:underline">Mandar mensagem no WhatsApp</span>
          </span>
        </a>
      </li>
      <li className="flex items-start gap-3 text-white/85">
        <Clock size={18} className="mt-0.5 shrink-0 text-gold-400" />
        <span>
          Seg. a sáb.: {store.hours.weekdays}
          <br />
          Domingo: {store.hours.sunday}
        </span>
      </li>
    </ul>
  </div>
);

// Igual em todas as telas: sempre com todas as unidades do site
const Footer = () => {
  const lojas = getOrderedStores();
  const currentYear = new Date().getFullYear();
  const catalogo = linkDoCatalogo();

  return (
    <footer className="border-t border-white/10 bg-butcher-950 text-white">
      <div className="butcher-container py-12 md:py-14">
        <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
          {/* Logo, texto e botões na mesma linha à esquerda */}
          <div>
            <Link to={catalogo} className="inline-block">
              <img src={logo} alt="Casa de Carnes Marumbi" className="h-12 w-auto md:h-14 logo-marumbi" />
            </Link>
            <p className="mt-5 max-w-xs font-medium text-butcher-300">
              Há mais de 5 anos oferecendo as melhores carnes, com tradição e excelência no atendimento.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {contatos.instagram && (
                <a
                  href={contatos.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 font-semibold hover:bg-white/20 transition-colors"
                >
                  <Instagram size={18} />
                  Instagram
                </a>
              )}
              <a
                href={`mailto:${contatos.email}`}
                className="inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 font-semibold hover:bg-white/20 transition-colors"
              >
                <Mail size={18} />
                E-mail
              </a>
            </div>
          </div>

          <div className={`grid gap-10 lg:col-span-2 ${lojas.length > 1 ? 'sm:grid-cols-2' : ''}`}>
            {lojas.map(store => (
              <DadosDaLoja key={store.id} store={store} largo={lojas.length === 1} />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="butcher-container flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap gap-x-6 gap-y-2 font-semibold">
            <Link to={catalogo} className="text-butcher-300 hover:text-white transition-colors">Catálogo</Link>
            <Link to="/localizacao" className="text-butcher-300 hover:text-white transition-colors">Localização</Link>
            <Link to="/informacoes" className="text-butcher-300 hover:text-white transition-colors">Informações</Link>
          </nav>
          <p className="text-sm font-medium text-butcher-400">
            © {currentYear} Marumbi. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
