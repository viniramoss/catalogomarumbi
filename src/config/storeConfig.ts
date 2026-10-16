// Configuração centralizada das lojas Marumbi
import type { StoreTag } from './catalogo';
import { unidadeDoSite } from './site';

export interface StoreLocation {
  id: string;
  catalogo: StoreTag; // chave da unidade no catalogo de precos (src/data/catalogo.json)
  title: string;
  displayName: string;
  bairro: string;
  address1: string;
  address2: string;
  cep: string;
  phone: string;
  whatsappNumber: string;
  whatsappLink: string;
  embedUrl: string;
  directionsUrl: string;
  hours: {
    weekdays: string;
    sunday: string;
  };
  order: number;
}

// Contatos que valem para todas as unidades, mostrados no rodapé.
// Instagram vazio = o botão não aparece.
export const contatos = {
  instagram: "https://www.instagram.com/casadecarnesmarumbi/",
  email: "casadecarnesmarumbiadm@gmail.com",
};

// Configuração das unidades Marumbi em operação
export const storeLocations: Record<string, StoreLocation> = {
  uberaba: {
    id: "uberaba",
    catalogo: "marumbi1",
    title: "Uberaba - Marumbi 1",
    displayName: "Marumbi 1",
    bairro: "Uberaba",
    address1: "Rua Eunice Bettini Bartoszeck, 1122",
    address2: "Uberaba, Curitiba - PR",
    cep: "CEP: 81590-180",
    phone: "(41) 99853-2456",
    whatsappNumber: "+5541998532456",
    whatsappLink: "https://wa.me/+5541998532456?text=Olá,%20vim%20pelo%20site,%20pode%20me%20passar%20algumas%20informações??%20:)%20",
    embedUrl: "https://www.google.com/maps?q=Rua%20Eunice%20Bettini%20Bartoszeck%2C%201122%2C%20Uberaba%2C%20Curitiba%20-%20PR&output=embed",
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Rua+Eunice+Bettini+Bartoszeck,+1122,+Uberaba,+Curitiba+-+PR",
    hours: {
      weekdays: "8:00 - 21:00",
      sunday: "9:00 - 14:00"
    },
    order: 1
  },
  capao: {
    id: "capao",
    catalogo: "marumbi3",
    title: "Capão da Imbuia - Marumbi 3",
    displayName: "Marumbi 3",
    bairro: "Capão da Imbuia",
    address1: "Rua Delegado Leopoldo Belczak, 2045",
    address2: "Capão da Imbuia, Curitiba - PR",
    cep: "CEP: 82810-060",
    phone: "(41) 99735-3725",
    whatsappNumber: "+5541997353725",
    whatsappLink: "https://wa.me/+5541997353725?text=Olá,%20vim%20pelo%20site,%20pode%20me%20passar%20algumas%20informações??%20:)%20",
    embedUrl: "https://www.google.com/maps?q=Rua%20Delegado%20Leopoldo%20Belczak%2C%202045%2C%20Cap%C3%A3o%20da%20Imbuia%2C%20Curitiba%20-%20PR&output=embed",
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Rua+Delegado+Leopoldo+Belczak,+2045,+Capao+da+Imbuia,+Curitiba+-+PR",
    hours: {
      weekdays: "8:00 - 20:00",
      sunday: "8:00 - 13:00"
    },
    order: 3
  }
};

// Unidades do site, em ordem: todas, ou só a do site de uma unidade (ver src/config/site.ts)
export const getOrderedStores = (): StoreLocation[] => {
  return Object.values(storeLocations)
    .filter(store => !unidadeDoSite || store.catalogo === unidadeDoSite)
    .sort((a, b) => a.order - b.order);
};

// Função para obter loja por ID
export const getStoreById = (id: string): StoreLocation | undefined => {
  return storeLocations[id];
};

// Loja pela chave do catalogo (marumbi1, marumbi3), entre as unidades do site
export const getStoreByCatalogo = (tag: string): StoreLocation | undefined => {
  return getOrderedStores().find(store => store.catalogo === tag);
};
