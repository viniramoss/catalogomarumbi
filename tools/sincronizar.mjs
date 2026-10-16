#!/usr/bin/env node
// Sincroniza os preços do site com o GranMoney, pelo proCodigo vinculado em cada unidade.
//
//   node tools/sincronizar.mjs                 confere e grava src/data/catalogo.json
//   node tools/sincronizar.mjs --simular       só mostra o que mudaria
//   node tools/sincronizar.mjs --publicar      grava e publica (commit + push na main)
//   node tools/sincronizar.mjs --loja marumbi1 só uma unidade
//
// Só LÊ o GranMoney. Unidade sem credencial (tools/.env ou variáveis GM_*) é pulada.
import { LOJAS, formatarPreco, lerCatalogo, marcarAtualizado, publicar, salvarCatalogo, validarLoja } from './lib/catalogo.mjs';
import { credenciais } from './lib/env.mjs';
import { GranMoney } from './lib/granmoney.mjs';

const args = process.argv.slice(2);
const simular = args.includes('--simular');
const lojaArg = args.includes('--loja') ? validarLoja(args[args.indexOf('--loja') + 1]) : null;

const catalogo = lerCatalogo();
const resumo = [];
let falhas = 0;

for (const loja of lojaArg ? [lojaArg] : Object.keys(LOJAS)) {
  const cred = credenciais(loja);
  if (!cred) {
    console.log(`${LOJAS[loja]}: sem credenciais, pulando.`);
    continue;
  }
  let produtosGM;
  try {
    const gm = new GranMoney(cred);
    await gm.login();
    produtosGM = await gm.produtos();
  } catch (erro) {
    console.error(`${LOJAS[loja]}: ${erro.message}`);
    falhas++;
    continue;
  }

  let alterados = 0;
  for (const produto of catalogo.produtos) {
    const vinculo = produto.lojas[loja];
    if (!vinculo?.codigo) continue;
    const achados = produtosGM.filter(p => p.codigo === String(vinculo.codigo));
    if (achados.length === 0) {
      console.warn(`  ! ${produto.nome}: código ${vinculo.codigo} não está ativo no GranMoney da ${LOJAS[loja]}.`);
      continue;
    }
    if (achados.length > 1) {
      console.warn(`  ! ${produto.nome}: código ${vinculo.codigo} aparece ${achados.length} vezes no GranMoney; não alterei.`);
      continue;
    }
    const gm = achados[0];
    if (!gm.preco || gm.preco <= 0) {
      console.warn(`  ! ${produto.nome}: preço zerado no GranMoney (código ${gm.codigo}); não alterei.`);
      continue;
    }
    vinculo.nomeGranMoney = gm.nome;
    if (gm.preco !== vinculo.preco) {
      console.log(`  ${produto.nome} (cód. ${gm.codigo}): ${formatarPreco(vinculo.preco)} → ${formatarPreco(gm.preco)}`);
      vinculo.preco = gm.preco;
      alterados++;
    }
  }
  console.log(`${LOJAS[loja]}: ${alterados} preço(s) alterado(s).`);
  if (alterados) {
    marcarAtualizado(catalogo, loja);
    resumo.push(`${LOJAS[loja]}: ${alterados}`);
  }
}

if (resumo.length && !simular) {
  salvarCatalogo(catalogo);
  if (args.includes('--publicar')) console.log(publicar(`Preços sincronizados do GranMoney (${resumo.join(', ')})`));
}
process.exit(falhas ? 1 : 0);
