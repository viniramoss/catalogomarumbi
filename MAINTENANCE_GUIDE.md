# Guia de Manutenção — Catálogo de preços Marumbi

Como mexer nos catálogos, testar e publicar.

O site original da Casa de Carnes Marumbi (https://casadecarnesmarumbi.vercel.app) fica em outro repositório, `viniramoss/casadecarnesmarumbi`, e não é mexido por aqui.

---

## 1. Onde fica cada coisa

| O quê | Onde |
|---|---|
| **Código (GitHub)** | `viniramoss/catalogomarumbi`, branch `main` |
| **Hospedagem** | Vercel, dois projetos ligados a este repositório: `catalogomarumbiuberaba` e `catalogomarumbiimbuia` |
| **Sites no ar** | https://catalogomarumbiuberaba.vercel.app (Marumbi 1) e https://catalogomarumbiimbuia.vercel.app (Marumbi 3) |
| **Pasta na máquina** | onde você baixou o repositório (veja abaixo) |

O site é feito em **React + Vite + Tailwind**. Não tem banco de dados: preços e produtos ficam em `src/data/catalogo.json` e os dados das lojas em `src/config/storeConfig.ts`. Mudar um preço = mudar esse arquivo e publicar.

### Baixar no computador
Precisa do [Git](https://git-scm.com) e do [Node.js](https://nodejs.org) instalados. No PowerShell, na pasta onde quer guardar:

```bash
git clone https://github.com/viniramoss/catalogomarumbi.git
```

```bash
cd catalogomarumbi; npm install
```

---

## 2. O fluxo de uma mudança

```
editar arquivo  →  testar local  →  commit  →  push  →  Vercel publica sozinha
```

O passo final é automático: **todo `git push` na branch `main` dispara um deploy nos dois sites**. Leva cerca de 1 minuto. Você não precisa entrar no painel da Vercel para nada.

### Os comandos
Na pasta do repositório:

```bash
git add -A; git commit -m "Descreve o que mudou"; git push origin main
```

Depois é só esperar um minuto e conferir nos dois endereços.

> Se o site não atualizar, veja a seção **6. Quando algo dá errado**.

---

## 3. Os arquivos que importam

### `src/data/catalogo.json` — produtos e preços por unidade
Cada produto tem um bloco por unidade, ligado ao **proCodigo** do GranMoney daquela unidade (os códigos não valem entre lojas):

```json
{
  "id": "picanha",
  "nome": "Picanha",
  "categoria": "bovinos",
  "lojas": {
    "marumbi1": { "codigo": "90", "nomeGranMoney": "PICANHA", "preco": 79.9 },
    "marumbi3": { "codigo": "214", "nomeGranMoney": "PICANHA BOV", "preco": 84.9 }
  }
}
```

- O nome no site é livre; o vínculo é pelo código.
- Produto sem bloco de uma unidade não aparece naquela unidade.
- `codigo: null` = ainda não foi ligado ao GranMoney (a sincronização ignora).
- Categorias: `bovinos | suinos | aves | moídas`. Embutidos entram em Suínos; miúdos entram em Bovinos, menos a moela, que fica em Aves.

Não edite à mão sem necessidade: use as ferramentas da seção 4.

### `src/config/storeConfig.ts` — as lojas
Endereço, telefone, WhatsApp e horário de cada unidade, mostrados no catálogo, nas abas Localização e Informações e no rodapé. O campo `catalogo` liga a loja à chave usada no `catalogo.json` (`marumbi1`, `marumbi3`). Em `contatos` ficam o link do Instagram (vazio = o botão não aparece) e o e-mail do rodapé. A mensagem que já vem escrita quando a pessoa chama a loja no WhatsApp fica em `mensagemWhatsApp`, no mesmo arquivo, e vale para todos os botões de WhatsApp dos dois sites.

### Os dois sites na Vercel
Os dois sites saem do mesmo código. Quem decide a unidade de cada um é a variável `VITE_UNIDADE` no projeto da Vercel (ver `src/config/site.ts`):

| Projeto na Vercel | `VITE_UNIDADE` | O site |
|---|---|---|
| `catalogomarumbiuberaba` | `marumbi1` | Só a Marumbi 1 |
| `catalogomarumbiimbuia` | `marumbi3` | Só a Marumbi 3 |
| (no PC, sem a variável) | — | As duas unidades, com a escolha na página inicial; serve para testar |

Preços, dashboard, comando de preço e sincronização valem para os dois: os dois sites leem o mesmo `catalogo.json`, e cada push na `main` atualiza os dois de uma vez.

Para criar um site (uma vez só, no painel da Vercel):

1. **Add New… → Project** e importe o repositório `viniramoss/catalogomarumbi`.
2. Em **Project Name**, coloque `catalogomarumbiuberaba` (o site fica em `catalogomarumbiuberaba.vercel.app`, se o nome estiver livre).
3. Em **Environment Variables**, crie `VITE_UNIDADE` com o valor `marumbi1`.
4. Clique em **Deploy**.

Repita com `catalogomarumbiimbuia` e `marumbi3`. Se o valor da variável estiver errado, o build falha dizendo quais valores valem, e o que está no ar não muda.

### Telas
| Endereço | Arquivo | O que mostra |
|---|---|---|
| `/` | `src/pages/Catalogo.tsx` | Os preços da unidade do site, com busca e categorias |
| `/localizacao` | `src/pages/Localizacao.tsx` | Mapa e endereço da unidade |
| `/informacoes` | `src/pages/Informacoes.tsx` | Telefone, horário e WhatsApp da unidade |

O rodapé é o mesmo em todas as telas, com endereço (abre o Maps), WhatsApp e horário da unidade, além do Instagram e do e-mail. Os endereços `/catalogo/...` e `/products` levam para a página inicial.

Sem a variável `VITE_UNIDADE` (por exemplo, no `npm run dev`), o site mostra as duas unidades: a página inicial (`src/pages/EscolherUnidade.tsx`) pede a unidade, `/catalogo/marumbi1` e `/catalogo/marumbi3` mostram os preços com a troca de unidade no topo, e a unidade escolhida fica lembrada enquanto a guia do navegador estiver aberta (`sessionStorage`).

O site fica claro ou escuro conforme o sistema da pessoa (sem preferência, fica claro). Quem decide é o script no `index.html`; as cores dos dois modos ficam em `src/index.css`. A barra do topo, a faixa com o nome de cada página e o rodapé ficam escuros nos dois modos, de propósito; o que muda é a lista de preços, a busca e o conteúdo das abas.

---

## 4. Ferramentas de preço (pasta `tools/`)

Nenhuma delas grava no GranMoney: elas só **leem** o GranMoney e mudam o `catalogo.json`.

### Credenciais
Copie `tools/env.exemplo` para `tools/.env` e preencha email e senha do GranMoney de cada unidade. O `tools/.env` não vai para o GitHub.

### Dashboard (escolher o que entra no site)
```bash
npm run dashboard
```
Abre em **http://localhost:5174**. Escolha a unidade → **Puxar do GranMoney** → marque o que entra, dê o nome do site e a categoria → **Salvar escolhas** → **Publicar no site**. Para ligar um produto do site a um código, escolha o nome dele no campo "Nome no site".

### Comando de preço (fluxo pelo chat)
```bash
npm run preco -- buscar picanha
npm run preco -- alterar --loja marumbi1 --codigo 90 --preco 79,90            # só mostra
npm run preco -- alterar --loja marumbi1 --codigo 90 --preco 79,90 --confirmar --publicar
```
Sem `--confirmar` nada é gravado: primeiro confere o produto, depois confirma.

### Sincronização com o GranMoney
```bash
npm run sincronizar -- --simular     # mostra o que mudaria
npm run sincronizar -- --publicar    # grava e publica
```
Para cada produto com código, lê o preço de venda no GranMoney da unidade e atualiza o site se mudou. Pula código repetido, inativo ou com preço zerado, e não faz nada se o GranMoney devolver 0 produtos.

O GitHub roda a mesma sincronização a cada 15 minutos (`.github/workflows/sincronizar-precos.yml`) quando os segredos `GM_MARUMBI1_EMAIL`, `GM_MARUMBI1_SENHA`, `GM_MARUMBI3_EMAIL` e `GM_MARUMBI3_SENHA` estão cadastrados em *Settings → Secrets and variables → Actions* deste repositório. Sem eles, a unidade é pulada.

> Como a sincronização automática também faz push na `main`, rode `git pull` antes de mexer no código pelo PC. O botão Publicar da dashboard e o `--publicar` já fazem isso sozinhos.

### Fechar ou abrir uma unidade
Tire (ou devolva) o bloco em `storeConfig.ts`, a chave em `tools/lib/catalogo.mjs` (`LOJAS`), o tipo `StoreTag` em `src/config/catalogo.ts` e os blocos daquela unidade no `catalogo.json`. Apague também o projeto dela na Vercel (ou crie um, ao abrir; veja "Os dois sites na Vercel").

---

## 5. Testar antes de publicar

Para mudanças de preço simples, dá para publicar direto — o risco é baixo. Para qualquer coisa estrutural, vale rodar local primeiro. Para ver o site de uma unidade (PowerShell):

```powershell
$env:VITE_UNIDADE="marumbi1"; npm run dev
```

Abre em **http://localhost:8080**. A página recarrega sozinha a cada arquivo salvo. Troque para `marumbi3` para ver a outra unidade; para ver as duas juntas, feche o terminal ou rode `Remove-Item Env:VITE_UNIDADE`.

Para checar se não quebrou nada antes de subir:

```bash
npx tsc --noEmit -p tsconfig.app.json
```

Esse comando pega erros de digitação e campos inválidos. **Vale rodar porque o build da Vercel não faz essa checagem** — ela roda só `vite build`, que ignora erros de tipo. Ou seja, dá para publicar código com erro de tipo sem a Vercel reclamar.

Confira o catálogo de cada unidade (no modo claro e no escuro) e as abas Localização e Informações, no celular e no computador.

---

## 6. Quando algo dá errado

### O site não atualizou depois do push

Confira se o commit chegou ao GitHub:

```bash
git log origin/main --oneline -1
```

Se o commit está lá mas o site continua velho, o gatilho da Vercel pode ter caído. Já aconteceu no site original: a conexão aparecia como ativa mas não disparava, e uma atualização de preços e telefones ficou dois meses sem ir ao ar. A correção é desconectar e reconectar o repositório no painel da Vercel: abra o projeto → **Settings → Git** → **Disconnect** e depois conecte de novo `viniramoss/catalogomarumbi`. Faça nos dois projetos, se os dois pararam.

Se mesmo assim não disparar, o problema está do lado do GitHub — reinstale o app da Vercel em https://github.com/settings/installations

### O push pede login e trava

O Windows abre uma janela do GitHub pedindo autenticação. Se ela não aparecer, rode o push direto no PowerShell (não em terminal automatizado) para a janela surgir.

### Publicar sem depender do gatilho

No painel da Vercel, abra o projeto → **Deployments** → no deploy mais recente, menu **⋯** → **Redeploy**. Use só como emergência: o certo é o push na `main` publicar sozinho.

---

## 7. Acessos

| Serviço | Como entrar |
|---|---|
| **GitHub** | Primeiro `git push` abre a janela de login. Fica salvo depois disso. |
| **Vercel (painel)** | https://vercel.com/viniramoss-projects/catalogomarumbiuberaba e https://vercel.com/viniramoss-projects/catalogomarumbiimbuia |

---

## 8. O que fica fora do site

Fechou ou mudou uma loja? O catálogo é só uma das pontas. Lembre também do **site original** (repositório `viniramoss/casadecarnesmarumbi`), do **Google Meu Negócio** e do **Instagram** — nenhum deles é atualizado por aqui.

---

## Estado atual

- **2 unidades ativas:** Marumbi 1 (Uberaba) e Marumbi 3 (Capão da Imbuia)
- A Marumbi 2 (Cajuru) foi removida em agosto de 2026
- A numeração segue 1 e 3 de propósito, para o Capão continuar com o nome que os clientes conhecem
- Em outubro de 2026 o catálogo de preços saiu do site original e ganhou este repositório: um site para cada unidade, só com nome e preço/kg, com todos os produtos ligados a um código do GranMoney. O site original continua no ar, sem mudanças. O histórico desse trabalho está no PR #1 do repositório `viniramoss/casadecarnesmarumbi`
- Os dois sites estão no ar desde 16/10/2026, nos projetos `catalogomarumbiuberaba` e `catalogomarumbiimbuia` da Vercel
