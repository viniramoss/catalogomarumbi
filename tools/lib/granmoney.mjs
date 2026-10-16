// Cliente SOMENTE LEITURA do GranMoney: login e download do catálogo de produtos.
// Segue a referência técnica do app granmoney-mobile (login.do + produtos_json.do).
// Nada aqui grava no GranMoney.
import { createHash } from 'node:crypto';

const BASE = process.env.GM_BASE ?? 'https://app.granmoney.com'; // GM_BASE só para testes
const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Mobile Safari/537.36';

const ENDPOINTS_PRODUTOS = [
  '/produtos_json.do?acao=produto.ProdutoJsonAcao&pro_versao=0',
  '/produtos_json.do?acao=produto.ProdutoJsonAcao',
  '/produto_json.do?acao=produto.ProdutoJsonAcao&pro_versao=0',
];

const INATIVO = new Set(['0', 'false', 'f', 'n', 'nao', 'não', 'inativo']);

export class GranMoney {
  constructor({ email, senha }) {
    this.email = email;
    this.senha = senha;
    this.cookies = new Map();
  }

  guardarCookies(res) {
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [par] = c.split(';');
      const i = par.indexOf('=');
      if (i < 1) continue;
      const nome = par.slice(0, i).trim();
      const valor = par.slice(i + 1).trim();
      if (!valor || /max-age=0/i.test(c)) this.cookies.delete(nome);
      else this.cookies.set(nome, valor);
    }
  }

  // Requisição com cookie de sessão; segue redirecionamentos guardando os cookies de cada passo
  async req(caminho, { method = 'GET', body, headers = {} } = {}) {
    let url = new URL(caminho, BASE);
    for (let passo = 0; passo < 6; passo++) {
      const res = await fetch(url, {
        method,
        body,
        redirect: 'manual',
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json, text/html;q=0.9, */*;q=0.5',
          Cookie: [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; '),
          ...headers,
        },
      });
      this.guardarCookies(res);
      const destino = res.headers.get('location');
      if (res.status >= 300 && res.status < 400 && destino) {
        url = new URL(destino, url);
        method = 'GET';
        body = undefined;
        continue;
      }
      return res;
    }
    throw new Error('GranMoney: redirecionamentos demais');
  }

  async login() {
    const sha1 = createHash('sha1').update(this.senha).digest('hex');
    const res = await this.req('/login.do', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Referer: `${BASE}/` },
      body: new URLSearchParams({ acao: 'login.Login', op: 'loginCookie', usuEmail: this.email, usuSenha: sha1 }).toString(),
    });
    if (!res.ok) throw new Error(`Login GranMoney falhou (${res.status})`);
    const painel = await (await this.req('/principal.do')).text();
    const usuario = painel.match(/usuarioId:\s*"?(\d+)"?/) ?? painel.match(/setUsuAndEmpIdfs\(\s*"?(\d+)/);
    if (!usuario) throw new Error('Login falhou: confira o email e a senha.');
  }

  // Produtos ativos: { id, codigo, nome, preco, porPeso }
  async produtos() {
    for (const caminho of ENDPOINTS_PRODUTOS) {
      let corpo;
      try {
        const res = await this.req(caminho);
        if (!res.ok) continue;
        corpo = JSON.parse(await res.text());
      } catch {
        continue;
      }
      const lista = Array.isArray(corpo)
        ? corpo
        : corpo?.produtos ?? corpo?.produto ?? corpo?.listaProdutos ?? corpo?.prods;
      if (!Array.isArray(lista) || lista.length === 0) continue;
      return lista
        .filter(p => {
          const flag = p.proAtivo ?? p.ativo ?? p.proSituacao ?? p.situacao;
          return flag === undefined || flag === null || !INATIVO.has(String(flag).trim().toLowerCase());
        })
        .map(p => ({
          id: p.id,
          codigo: p.proCodigo == null ? '' : String(p.proCodigo).trim(),
          nome: String(p.proNome ?? '').trim(),
          preco: lerValor(p.proVenda),
          porPeso: String(p.proPeso ?? '').trim() === '1',
        }));
    }
    // Um download que volta vazio NÃO pode virar "todos os produtos sumiram" (armadilha 14 da referência)
    throw new Error('GranMoney devolveu 0 produtos. Nada foi alterado; tente de novo mais tarde.');
  }
}

function lerValor(v) {
  if (typeof v === 'number') return v;
  let t = String(v ?? '').trim();
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  const n = Number(t);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}
