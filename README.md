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

## 📱 Sincronização entre celulares (Supabase)

Há **dois modos** de funcionamento:

- **Modo navegador (padrão):** se você deixar `supabaseUrl` e `supabaseAnonKey` em branco no `config.js`, os números vendidos ficam salvos **só no navegador do responsável**. Bom para testes, mas **não** aparece para os compradores em outros aparelhos.
- **Modo nuvem (recomendado):** ao configurar o Supabase (abaixo), os números vendidos ficam **na nuvem** e aparecem iguais para **todos**, em **tempo real** — quando o responsável salva, o site de todo mundo atualiza sozinho.

### ☁️ Como ligar a sincronização (grátis, ~10 min)

1. Crie uma conta em **https://supabase.com** e clique em **New project** (plano gratuito serve). Guarde a senha do banco.
2. Aguarde o projeto ficar pronto. No menu, abra **SQL Editor → New query**, cole o código abaixo e clique em **Run**.
   > Antes de rodar, **troque `TROQUE_ESTA_SENHA`** pela mesma senha que você usa no `senhaAdmin` do `config.js`.

   ```sql
   -- 1) Tabela com o estado da rifa (uma linha só)
   create table if not exists rifa_estado (
     id text primary key,
     vendidos jsonb not null default '[]'
   );
   insert into rifa_estado (id, vendidos) values ('principal', '[]')
     on conflict (id) do nothing;

   -- 2) Segurança: todos podem LER; ninguém escreve direto na tabela
   alter table rifa_estado enable row level security;
   drop policy if exists "leitura publica" on rifa_estado;
   create policy "leitura publica" on rifa_estado for select using (true);

   -- 3) Função para salvar, protegida por senha
   create or replace function salvar_vendidos(nova_lista jsonb, senha text)
   returns void language plpgsql security definer as $$
   begin
     if senha <> 'TROQUE_ESTA_SENHA' then
       raise exception 'Senha incorreta';
     end if;
     update rifa_estado set vendidos = nova_lista where id = 'principal';
   end; $$;

   -- 4) Liga o tempo real na tabela
   alter publication supabase_realtime add table rifa_estado;
   ```

3. No menu, vá em **Project Settings → API** e copie:
   - **Project URL** (ex.: `https://abcdefgh.supabase.co`)
   - **anon public** (a chave pública)
4. Cole esses dois valores no `config.js`:
   ```js
   supabaseUrl: "https://abcdefgh.supabase.co",
   supabaseAnonKey: "COLE_A_CHAVE_ANON_AQUI",
   ```
5. Publique o site (GitHub Pages/Netlify/Vercel). Pronto! ✅ Agora, quando o responsável marcar números e clicar em **Salvar**, todos os aparelhos veem na hora.

> 🔒 **Sobre segurança:** só quem tem a senha consegue alterar os números (a alteração passa pela função protegida). Os compradores só conseguem **ler**. Use uma senha só sua e mantenha a mesma nos dois lugares (`config.js` e o SQL).

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
