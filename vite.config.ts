import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "fs";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Site de uma unidade só (ver src/config/site.ts): não deixa publicar com uma unidade que não existe
  const unidade = loadEnv(mode, process.cwd(), "VITE_").VITE_UNIDADE ?? "";
  const chave = unidade.toLowerCase().replace(/[^a-z0-9]/g, "");
  const lojas = Object.keys(
    JSON.parse(fs.readFileSync(path.resolve(__dirname, "src/data/catalogo.json"), "utf-8")).lojas,
  );
  if (unidade.trim() && !lojas.includes(chave)) {
    throw new Error(`VITE_UNIDADE="${unidade}" não é uma unidade do catálogo. Use ${lojas.join(" ou ")}.`);
  }

  // O nome na aba e na prévia do link (WhatsApp etc.) leva o número da unidade: "Açougue Marumbi 1 | ...".
  // Sai pronto no index.html porque a prévia do link não roda o JavaScript do site.
  // marumbi1 vira "Marumbi 1", igual ao displayName em src/config/storeConfig.ts.
  const nomeDaUnidade = chave.replace(/^marumbi(\d+)$/, "Marumbi $1");
  const nomeNoLink: Plugin = {
    name: "nome-da-unidade-no-link",
    transformIndexHtml: (html) =>
      lojas.includes(chave)
        ? html
            .replace(/Açougue Marumbi \|/g, `Açougue ${nomeDaUnidade} |`)
            .replace("das unidades do Açougue Marumbi", `do Açougue ${nomeDaUnidade}`)
        : html,
  };

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      nomeNoLink,
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
