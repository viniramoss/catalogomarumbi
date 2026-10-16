#!/usr/bin/env node
// Dashboard local para escolher quais produtos do GranMoney entram no site.
//   npm run dashboard   →   abre em http://localhost:5174
// Roda só no seu computador; as senhas do GranMoney ficam em tools/.env.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOJAS, CATEGORIAS, aplicarSelecao, lerCatalogo, publicar, salvarCatalogo, validarLoja } from './lib/catalogo.mjs';
import { credenciais } from './lib/env.mjs';
import { GranMoney } from './lib/granmoney.mjs';

const PORTA = Number(process.env.PORTA ?? 5174);
const PAGINA = join(dirname(fileURLToPath(import.meta.url)), 'dashboard.html');

async function lerCorpo(req) {
  let texto = '';
  for await (const parte of req) texto += parte;
  return texto ? JSON.parse(texto) : {};
}

const rotas = {
  'GET /api/catalogo': () => ({
    catalogo: lerCatalogo(),
    lojas: LOJAS,
    categorias: CATEGORIAS,
    comCredencial: Object.fromEntries(Object.keys(LOJAS).map(l => [l, !!credenciais(l)])),
  }),
  'POST /api/granmoney': async ({ loja }) => {
    validarLoja(loja);
    const cred = credenciais(loja);
    if (!cred) throw new Error(`Faltam as credenciais da ${LOJAS[loja]} em tools/.env (GM_${loja.toUpperCase()}_EMAIL e GM_${loja.toUpperCase()}_SENHA).`);
    const gm = new GranMoney(cred);
    await gm.login();
    return { produtos: await gm.produtos() };
  },
  'POST /api/salvar': ({ loja, linhas }) => {
    const catalogo = lerCatalogo();
    const resumo = aplicarSelecao(catalogo, loja, linhas);
    salvarCatalogo(catalogo);
    return { resumo, catalogo };
  },
  'POST /api/remover': ({ loja, id }) => {
    validarLoja(loja);
    const catalogo = lerCatalogo();
    const produto = catalogo.produtos.find(p => p.id === id);
    if (produto) delete produto.lojas[loja];
    catalogo.produtos = catalogo.produtos.filter(p => Object.keys(p.lojas).length > 0);
    salvarCatalogo(catalogo);
    return { catalogo };
  },
  'POST /api/publicar': () => ({ mensagem: publicar('Atualiza o catálogo pela dashboard') }),
};

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (req.method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(readFileSync(PAGINA));
    }
    const rota = rotas[`${req.method} ${url.pathname}`];
    if (!rota) {
      res.writeHead(404);
      return res.end();
    }
    // Só aceita chamadas da própria página (bloqueia outros sites tentando usar a dashboard)
    if (req.method === 'POST' && req.headers['content-type'] !== 'application/json') throw new Error('Requisição inválida');
    const resultado = await rota(req.method === 'POST' ? await lerCorpo(req) : {});
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(resultado));
  } catch (erro) {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ erro: erro.message }));
  }
}).listen(PORTA, '127.0.0.1', () => {
  console.log(`Dashboard do catálogo em http://localhost:${PORTA}  (Ctrl+C para sair)`);
});
