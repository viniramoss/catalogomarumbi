// Credenciais do GranMoney por loja, lidas do ambiente ou de tools/.env (que não vai para o GitHub; modelo em tools/env.exemplo).
//   GM_MARUMBI1_EMAIL=...   GM_MARUMBI1_SENHA=...
//   GM_MARUMBI3_EMAIL=...   GM_MARUMBI3_SENHA=...
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const arquivo = join(dirname(fileURLToPath(import.meta.url)), '..', '.env');
if (existsSync(arquivo)) {
  for (const linha of readFileSync(arquivo, 'utf8').split(/\r?\n/)) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

export function credenciais(loja) {
  const prefixo = `GM_${loja.toUpperCase()}_`;
  const email = process.env[prefixo + 'EMAIL'];
  const senha = process.env[prefixo + 'SENHA'];
  return email && senha ? { email, senha } : null;
}
