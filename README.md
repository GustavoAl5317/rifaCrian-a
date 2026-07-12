# 🎈 Rifa Dia das Crianças — Site

Site simples para divulgar a **Rifa Dia das Crianças da nossa igreja**. Ele mostra os números de **1 a 100**, deixa o comprador **escolher os disponíveis** e o envia direto para o **WhatsApp do responsável**. O responsável tem uma área própria para **marcar os números comprados**.

## ✨ O que o site faz

- Mostra a grade de números com as cores do cartaz.
- **Comprador:** toca nos números disponíveis, vê o total e é levado ao WhatsApp já com a mensagem pronta.
- **Números comprados** ficam bloqueados (riscados) e não podem ser escolhidos.
- **Área do Responsável** (com senha): marca/desmarca os números que foram vendidos.
- Botão para **copiar a chave PIX**.

## ⚙️ Antes de usar — edite o arquivo `config.js`

Abra o arquivo **`config.js`** e ajuste:

| Campo | O que é |
|-------|---------|
| `whatsapp` | **(OBRIGATÓRIO)** WhatsApp do responsável, só números: `55` + DDD + número. Ex.: `5511999998888` |
| `chavePix` | Chave PIX exibida no site |
| `senhaAdmin` | Senha da "Área do responsável" (troque por uma só sua) |
| `valorNumero` | Valor de cada número (padrão: 30) |
| `numerosVendidos` | Números já vendidos por padrão. Ex.: `[7, 15, 42]` |

> ⚠️ Enquanto o `whatsapp` não for trocado, o botão de compra avisa que ainda não foi configurado.

## 👤 Como o responsável marca os números comprados

1. No rodapé do site, clique em **"Área do responsável"**.
2. Digite a **senha** (definida em `config.js`).
3. Toque nos números que foram **comprados** (ficam cinza/riscados).
4. Clique em **💾 Salvar alterações**.

Pronto — quem abrir o site verá esses números bloqueados.

## 📱 Importante sobre a sincronização

Por padrão, os números marcados na "Área do responsável" ficam salvos **no navegador do próprio responsável** (via `localStorage`). Isso funciona muito bem quando **uma pessoa** cuida da rifa sempre pelo **mesmo aparelho**.

Se você quiser que a marcação apareça igual em **qualquer celular**, há duas opções:

1. **Simples (recomendado para igreja):** o responsável mantém os números vendidos na lista `numerosVendidos` do `config.js` e sobe a alteração (ou pede para alguém subir). Todo mundo passa a ver a lista atualizada.
2. **Automático:** conectar a um banco de dados gratuito (ex.: Firebase). O código já está organizado para isso — é só pedir ajuda para plugar.

## 🚀 Como publicar (grátis) com GitHub Pages

1. Este repositório já tem os arquivos (`index.html`, `styles.css`, `app.js`, `config.js`).
2. No GitHub, vá em **Settings → Pages**.
3. Em **Source**, escolha a branch (ex.: `main`) e a pasta `/root`.
4. Salve. Em alguns minutos o site fica no ar num link `https://SEU-USUARIO.github.io/rifacrian-a/`.
5. Compartilhe o link! 🎉

Também funciona no **Netlify** ou **Vercel** arrastando a pasta.

## 🧪 Testar no computador

Abra o arquivo `index.html` no navegador (duplo clique) — já funciona. Para a cópia do PIX funcionar 100%, prefira rodar por um servidor local:

```bash
python3 -m http.server 8000
# depois abra http://localhost:8000
```

## 📂 Arquivos

- `index.html` — estrutura da página
- `styles.css` — visual (cores do cartaz)
- `app.js` — lógica (seleção, WhatsApp, área do responsável)
- `config.js` — **suas configurações** (WhatsApp, PIX, senha, vendidos)
