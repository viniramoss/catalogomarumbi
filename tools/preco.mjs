#!/usr/bin/env node
// Alteração de preço pelo terminal (fluxo do chat).
//
//   node tools/preco.mjs buscar picanha [--loja marumbi1]
//   node tools/preco.mjs alterar --loja marumbi1 --codigo 90 --preco 79,90             (só mostra)
//   node tools/preco.mjs alterar --loja marumbi1 --codigo 90 --preco 79,90 --confirmar (grava)
//   node tools/preco.mjs alterar --loja marumbi3 --id picanha --preco 82 --confirmar --publicar
//   node tools/preco.mjs publicar ["mensagem do commit"]
//
// Sem --confirmar nada é gravado: primeiro confere-se o produto, depois confirma.
import {
  LOJAS, acharPorCodigo, buscar, formatarPreco, lerCatalogo, lerPreco, marcarAtualizado, publicar,
  salvarCatalogo, validarLoja,
} from './lib/catalogo.mjs';

const [comando, ...resto] = process.argv.slice(2);
const opcoes = {};
const livres = [];
for (let i = 0; i < resto.length; i++) {
  if (resto[i].startsWith('--')) {
    const chave = resto[i].slice(2);
    const proximo = resto[i + 1];
    if (proximo === undefined || proximo.startsWith('--')) opcoes[chave] = true;
    else opcoes[chave] = resto[++i];
  } else livres.push(resto[i]);
}

function descrever(produto, loja) {
  const linhas = [`${produto.nome}  [id: ${produto.id} · ${produto.categoria}]`];
  for (const [l, v] of Object.entries(produto.lojas)) {
    if (loja && l !== loja) continue;
    const gm = v.codigo ? `código ${v.codigo}${v.nomeGranMoney ? ` "${v.nomeGranMoney}"` : ''}` : 'sem código vinculado';
    linhas.push(`   ${LOJAS[l]}: ${formatarPreco(v.preco)}/kg · ${gm}`);
  }
  return linhas.join('\n');
}

function sair(msg) {
  console.error(msg);
  process.exit(1);
}

try {
  if (comando === 'buscar') {
    const termo = livres.join(' ');
    if (!termo) sair('Informe o que buscar: node tools/preco.mjs buscar <nome ou código>');
    const loja = opcoes.loja ? validarLoja(opcoes.loja) : undefined;
    const achados = buscar(lerCatalogo(), termo, loja);
    if (!achados.length) console.log(`Nada encontrado para "${termo}".`);
    for (const p of achados) console.log(descrever(p, loja));
  } else if (comando === 'alterar') {
    const loja = validarLoja(opcoes.loja ?? sair('Falta --loja (marumbi1 ou marumbi3).'));
    if (opcoes.preco === undefined) sair('Falta --preco.');
    const novo = lerPreco(opcoes.preco);
    if (novo <= 0) sair('Preço precisa ser maior que zero.');

    const catalogo = lerCatalogo();
    let achados;
    if (opcoes.codigo !== undefined) achados = acharPorCodigo(catalogo, loja, opcoes.codigo);
    else if (opcoes.id !== undefined) achados = catalogo.produtos.filter(p => p.id === opcoes.id && p.lojas[loja]);
    else sair('Informe --codigo (proCodigo do GranMoney) ou --id (id do produto no site).');

    if (achados.length === 0) sair(`Nenhum produto do site com esse ${opcoes.codigo !== undefined ? 'código' : 'id'} na ${LOJAS[loja]}.`);
    if (achados.length > 1) sair(`Mais de um produto com esse código na ${LOJAS[loja]}:\n${achados.map(p => descrever(p, loja)).join('\n')}`);

    const produto = achados[0];
    const atual = produto.lojas[loja].preco;
    console.log(descrever(produto, loja));
    console.log(`\n   ${LOJAS[loja]}: ${formatarPreco(atual)} → ${formatarPreco(novo)}`);

    if (!opcoes.confirmar) {
      console.log('\n(Só conferência. Repita com --confirmar para gravar.)');
    } else {
      produto.lojas[loja].preco = novo;
      marcarAtualizado(catalogo, loja);
      salvarCatalogo(catalogo);
      console.log('\nGravado em src/data/catalogo.json.');
      if (opcoes.publicar) console.log(publicar(`Preço: ${produto.nome} na ${LOJAS[loja]} ${formatarPreco(novo)}`));
    }
  } else if (comando === 'publicar') {
    console.log(publicar(livres.join(' ') || 'Atualiza preços do catálogo'));
  } else {
    console.log('Uso: node tools/preco.mjs buscar|alterar|publicar  (veja o topo do arquivo)');
  }
} catch (erro) {
  sair(erro.message);
}
