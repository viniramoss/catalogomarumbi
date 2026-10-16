import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { unidadeDoSite } from './config/site'
import { getStoreByCatalogo } from './config/storeConfig'

// No site de uma unidade só, a aba do navegador mostra o nome dela
const lojaDoSite = unidadeDoSite && getStoreByCatalogo(unidadeDoSite);
if (lojaDoSite) document.title = `Açougue ${lojaDoSite.displayName} | Catálogo de preços`;

createRoot(document.getElementById("root")!).render(<App />);
