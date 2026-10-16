// Leitura e escrita do catálogo do site (src/data/catalogo.json) e publicação via git.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const ARQUIVO = join(RAIZ, 'src', 'data', 'catalogo.json');
export const ARQUIVO_RELATIVO = 'src/data/catalogo.json';

export const LOJAS = {
  marumbi1: 'Marumbi 1 (Uberaba)',
  marumbi3: 'Marumbi 3 (Capão da Imbuia)',
};

export const CATEGORIAS = ['bovinos', 'suinos', 'aves', 'moídas'];

export function lerCatalogo() {
  return JSON.parse(readFileSync(ARQUIVO, 'utf8'));
}

export function salvarCatalogo(catalogo) {
  catalogo.produtos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  writeFileSync(ARQUIVO, JSON.stringify(catalogo, null, 2) + '\n');
}

export function validarLoja(loja) {
  if (!LOJAS[loja]) throw new Error(`Loja desconhecida: "${loja}". Use ${Object.keys(LOJAS).join(' ou ')}.`);
  return loja;
}

export const normalizar = texto =>
  String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export const slug = texto => normalizar(texto).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// "79,84", "79.84", "1.234,56" ou número → 79.84
export function lerPreco(valor) {
  if (typeof valor === 'number') return valor;
  let texto = String(valor ?? '').replace(/[R$\s]/g, '');
  if (texto.includes(',')) texto = texto.replace(/\./g, '').replace(',', '.');
  const numero = Number(texto);
  if (!Number.isFinite(numero)) throw new Error(`Preço inválido: "${valor}"`);
  return Math.round(numero * 100) / 100;
}

export const formatarPreco = n => `R$ ${n.toFixed(2).replace('.', ',')}`;

// Produto vinculado a um proCodigo naquela loja
export function acharPorCodigo(catalogo, loja, codigo) {
  return catalogo.produtos.filter(p => p.lojas[loja]?.codigo != null && String(p.lojas[loja].codigo) === String(codigo));
}

// Busca por trecho do nome do site, do nome no GranMoney ou pelo código
export function buscar(catalogo, termo, loja) {
  const t = normalizar(termo);
  return catalogo.produtos.filter(p =>
    Object.entries(p.lojas)
      .filter(([l]) => !loja || l === loja)
      .some(([, v]) =>
        normalizar(p.nome).includes(t) ||
        normalizar(v.nomeGranMoney).includes(t) ||
        (v.codigo != null && String(v.codigo) === termo.trim()),
      ),
  );
}

export function marcarAtualizado(catalogo, loja) {
  catalogo.lojas[loja] = { ...(catalogo.lojas[loja] ?? {}), atualizadoEm: new Date().toISOString() };
}

/**
 * Aplica as escolhas da dashboard para uma loja.
 * linhas: [{ codigo, nomeGranMoney, preco, incluir, nomeSite, categoria }]
 * - incluir=true: vincula o código ao produto do site com aquele nome (cria se não existir)
 * - incluir=false: se o código estava vinculado nessa loja, tira o produto da loja
 * Produtos sem nenhuma loja saem do catálogo.
 */
export function aplicarSelecao(catalogo, loja, linhas) {
  validarLoja(loja);
  const resumo = { vinculados: 0, criados: 0, removidos: 0 };
  const nomes = new Map();
  for (const linha of linhas.filter(l => l.incluir)) {
    const chave = normalizar(linha.nomeSite);
    if (nomes.has(chave)) throw new Error(`"${linha.nomeSite}" está nos códigos ${nomes.get(chave)} e ${linha.codigo}. Cada produto do site usa um código por unidade.`);
    nomes.set(chave, linha.codigo);
  }
  for (const linha of linhas) {
    const codigo = String(linha.codigo);
    const atuais = acharPorCodigo(catalogo, loja, codigo);
    if (!linha.incluir) {
      for (const p of atuais) {
        delete p.lojas[loja];
        resumo.removidos++;
      }
      continue;
    }
    const nomeSite = String(linha.nomeSite ?? '').trim();
    if (!nomeSite) throw new Error(`Código ${codigo}: falta o nome no site.`);
    if (!CATEGORIAS.includes(linha.categoria)) throw new Error(`Código ${codigo}: categoria inválida.`);

    let produto = catalogo.produtos.find(p => normalizar(p.nome) === normalizar(nomeSite));
    if (!produto) {
      let id = slug(nomeSite);
      while (catalogo.produtos.some(p => p.id === id)) id += '-2';
      produto = { id, nome: nomeSite, categoria: linha.categoria, lojas: {} };
      catalogo.produtos.push(produto);
      resumo.criados++;
    }
    // O código muda de produto do site: tira do antigo
    for (const p of atuais) if (p !== produto) delete p.lojas[loja];

    produto.categoria = linha.categoria;
    produto.lojas[loja] = { codigo, nomeGranMoney: linha.nomeGranMoney, preco: lerPreco(linha.preco) };
    resumo.vinculados++;
  }
  catalogo.produtos = catalogo.produtos.filter(p => Object.keys(p.lojas).length > 0);
  marcarAtualizado(catalogo, loja);
  return resumo;
}

function git(args) {
  return execFileSync('git', args, { cwd: RAIZ, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

/**
 * Publica o catálogo: commit só do catalogo.json e push para a main (a Vercel publica sozinha).
 * Traz antes o que a sincronização automática possa ter enviado.
 */
export function publicar(mensagem) {
  const ramo = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  if (ramo !== 'main') throw new Error(`O repositório está no ramo "${ramo}". Mude para a main antes de publicar.`);
  if (!git(['status', '--porcelain', '--', ARQUIVO_RELATIVO])) return 'Nada mudou no catálogo; nada a publicar.';
  git(['add', '--', ARQUIVO_RELATIVO]);
  git(['commit', '-m', mensagem, '--', ARQUIVO_RELATIVO]);
  git(['pull', '--rebase', '--autostash', 'origin', 'main']);
  git(['push', 'origin', 'main']);
  return 'Publicado. O site atualiza em cerca de 1 minuto.';
}
