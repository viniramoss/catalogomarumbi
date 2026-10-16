// Um site para cada unidade.
// No projeto da Vercel de uma unidade, a variável VITE_UNIDADE diz qual é ela (marumbi1 ou marumbi3):
// o site abre direto no catálogo dela e mostra só os dados dela.
// Sem a variável, o site mostra todas as unidades e a pessoa escolhe na página inicial.
// O vite.config.ts não deixa publicar com um valor que não seja uma unidade do catálogo.
import type { StoreTag } from './catalogo';
import dados from '../data/catalogo.json';

// Aceita "marumbi3", "Marumbi 3" etc.
const valor = (import.meta.env.VITE_UNIDADE ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

export const unidadeDoSite: StoreTag | null = Object.keys(dados.lojas).includes(valor) ? (valor as StoreTag) : null;
