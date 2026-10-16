import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "fs";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Site de uma unidade só (ver src/config/site.ts): não deixa publicar com uma unidade que não existe
  const unidade = loadEnv(mode, process.cwd(), "VITE_").VITE_UNIDADE ?? "";
  const lojas = Object.keys(
    JSON.parse(fs.readFileSync(path.resolve(__dirname, "src/data/catalogo.json"), "utf-8")).lojas,
  );
  if (unidade.trim() && !lojas.includes(unidade.toLowerCase().replace(/[^a-z0-9]/g, ""))) {
    throw new Error(`VITE_UNIDADE="${unidade}" não é uma unidade do catálogo. Use ${lojas.join(" ou ")}.`);
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
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
