# PicPeak em português do Brasil — instalação local

Este documento descreve a instalação local do **PicPeak** traduzida para português brasileiro (pt-BR), mantida na branch `traducao-pt-br` deste repositório. O projeto original e sua documentação oficial estão em <https://github.com/PicPeak/picpeak> e <https://docs.picpeak.app>.

O PicPeak é distribuído sob a licença MIT (arquivo [LICENSE](LICENSE)). A tradução e os ajustes desta branch seguem a mesma licença e preservam a atribuição aos autores originais.

---

## 1. O que é o PicPeak

O PicPeak é uma plataforma de código aberto, auto-hospedada, para entregar e compartilhar galerias de fotos com clientes. Ele oferece:

- galerias com prazo de expiração, protegidas por senha e com marca d'água;
- envio de fotos por arrastar e soltar, com geração automática de miniaturas;
- área do cliente com visualizador, seleção, favoritos, curtidas, avaliações, comentários e download em lote;
- painel administrativo com estatísticas, identidade visual, e-mails automáticos, cópias de segurança e gestão de usuários e permissões;
- módulos opcionais de CRM (orçamentos, contratos, faturas), PicTransfer, apresentação de slides ao vivo e reconhecimento facial.

### O que esta instalação tem de diferente da oficial

| Item | Situação |
|---|---|
| Versão base | **v3.135.16** (canal estável), tag `v3.135.16` |
| Idioma padrão da interface | português do Brasil (código interno `pt`) |
| Tradução da interface | 100% das chaves do catálogo de textos (6.610) e textos que estavam fixos no código |
| E-mails automáticos | todos os templates com versão pt-BR |
| PDFs (orçamentos, faturas, contratos) | rótulos em pt-BR, valores no formato `R$ 1.234,56` |
| Fuso horário | `America/Sao_Paulo` |
| Imagens Docker | construídas localmente a partir desta branch |

O código interno do idioma continua sendo `pt` (o mesmo usado pelo projeto original), e ele já está associado a pt-BR em todo o sistema: bandeira do Brasil, datas com `date-fns/ptBR` e moeda com `Intl` `pt-BR`. Manter o código original evita quebrar e-mails, PDFs e preferências gravadas no banco.

---

## 2. Requisitos

- Windows 10/11 com **Docker Desktop** (motor WSL2) em execução.
- **Git**.
- Cerca de 5 GB livres em disco para imagens e build, mais o espaço das suas fotos.
- Porta **3000** livre (interface) e **3001** (API, acessível só em `127.0.0.1`).
- Opcional, apenas para manutenção das traduções: **Node.js 20+**.

Nada é instalado fora do Docker. O PicPeak usa nomes de projeto, containers, volumes e rede próprios (`picpeak`, `picpeak-*`, `picpeak_*`) e não interfere em outros projetos, como o FotoGallery Pro.

---

## 3. Configuração do Docker

A pilha usa dois arquivos Compose:

- `docker-compose.production.yml` — arquivo oficial do projeto (PostgreSQL 15, Redis 7, backend, frontend e gerador de segredos).
- `docker-compose.ptbr.yml` — override desta instalação: troca as imagens oficiais do backend e do frontend por imagens **construídas localmente** a partir desta branch, com o idioma padrão pt-BR embutido no build (`VITE_DEFAULT_LANGUAGE=pt`).

As duas configurações já estão referenciadas no `.env`, então qualquer comando `docker compose` as usa automaticamente:

```dotenv
COMPOSE_PROJECT_NAME=picpeak
COMPOSE_PATH_SEPARATOR=:
COMPOSE_FILE=docker-compose.production.yml:docker-compose.ptbr.yml
FRONTEND_PORT=3000
BACKEND_PORT=3001
PICPEAK_BIND_ADDRESS=127.0.0.1
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3000
TZ=America/Sao_Paulo
```

`PICPEAK_BIND_ADDRESS=127.0.0.1` deixa a aplicação acessível apenas neste computador. Para acessar de outros dispositivos da rede local (celular, tablet), troque por `0.0.0.0` e ajuste `FRONTEND_URL`/`ADMIN_URL` para o IP da máquina (ex.: `http://192.168.0.10:3000`). Para publicar na internet, use um proxy reverso com HTTPS conforme a documentação oficial.

Os segredos (JWT, senha do banco, senha do Redis) são gerados automaticamente na primeira execução e ficam no volume `picpeak_picpeak-secrets`. Não é preciso colocá-los no `.env`.

---

## 4. Como executar

Todos os comandos abaixo são executados no PowerShell, na pasta `C:\www\PicPeak`.

```powershell
# Primeira vez (ou após alterar o código): construir as imagens pt-BR
docker compose build

# Subir
docker compose up -d

# Ver o estado dos serviços
docker compose ps

# Acompanhar os logs
docker compose logs -f backend

# Parar (mantém os dados)
docker compose stop

# Parar e remover os containers (os dados continuam nos volumes)
docker compose down
```

> Nunca use `docker compose down -v`: a opção `-v` apaga os volumes, ou seja, o banco de dados e os segredos.

---

## 5. Endereço de acesso

| Área | Endereço |
|---|---|
| Painel administrativo | <http://localhost:3000/admin> |
| Página inicial / galerias | <http://localhost:3000> |
| Portal do cliente | <http://localhost:3000/customer/login> |
| API (verificação de saúde) | <http://localhost:3000/api/health> |

---

## 6. Administrador

Na primeira execução o PicPeak não tem administrador. Abra <http://localhost:3000/admin> e siga o assistente de configuração (já em português). Ele pede um **token de configuração de uso único**, que pode ser lido com:

```powershell
docker compose exec backend cat /app/data/SETUP_TOKEN
```

Nesta instalação o assistente já foi concluído. As credenciais iniciais foram gravadas no arquivo local `CREDENCIAIS-ADMIN.local.txt` (ignorado pelo Git). **Troque a senha no primeiro acesso** em *Configurações → Geral → Conta de administrador* e apague esse arquivo.

Configurações regionais aplicadas no painel (*Configurações → Geral*):

- Idioma padrão: **Português** — usado nas galerias dos clientes e nos e-mails.
- Formato de data: **DD/MM/AAAA**.
- Formato de hora: **24 horas**.
- Perfil da empresa (*Configurações → Perfil da empresa*, visível quando o CRM está ativo): defina moeda **BRL**, país **BR** e fuso **America/Sao_Paulo** antes de emitir orçamentos ou faturas.

Cada usuário pode trocar o idioma pelo seletor no topo da tela; a escolha fica salva no navegador e continua valendo depois de sair e entrar novamente.

---

## 7. Onde ficam os dados

| O quê | Onde |
|---|---|
| Fotos, miniaturas, arquivos e backups locais | pasta `C:\www\PicPeak\storage` |
| Token de configuração e dados internos | pasta `C:\www\PicPeak\data` |
| Logs do backend | pasta `C:\www\PicPeak\logs` |
| Banco de dados PostgreSQL | volume Docker `picpeak_postgres-data` |
| Cache/filas Redis | volume Docker `picpeak_redis-data` |
| Segredos gerados (JWT, senhas internas) | volume Docker `picpeak_picpeak-secrets` |
| Cópias dos segredos para Postgres/Redis | volumes `picpeak_picpeak-db-secret` e `picpeak_picpeak-redis-secret` (recriados automaticamente) |

---

## 8. Backup

### Pelo painel (recomendado)

Em *Cópia de segurança e restauração* é possível agendar backups completos ou só do banco, escolher destino local, S3 ou rsync e baixar um **backup portátil `.picpeak`** (um único arquivo com banco, configurações e, opcionalmente, as fotos originais).

### Manual, pelo PowerShell

```powershell
$data = Get-Date -Format "yyyyMMdd-HHmm"
New-Item -ItemType Directory -Force "C:\Backups\PicPeak\$data" | Out-Null

# 1. Banco de dados (o dump é gerado dentro do container e copiado para fora;
#    não use ">" do PowerShell 5.1, que grava em UTF-16 e corrompe os acentos)
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists -f /tmp/banco.sql'
docker compose cp postgres:/tmp/banco.sql "C:\Backups\PicPeak\$data\banco.sql"

# 2. Segredos (necessários para restaurar o banco com as mesmas senhas)
docker run --rm -v picpeak_picpeak-secrets:/s -v "C:\Backups\PicPeak\${data}:/b" alpine:3.20 tar czf /b/segredos.tgz -C /s .

# 3. Fotos e dados
Compress-Archive -Path C:\www\PicPeak\storage, C:\www\PicPeak\data -DestinationPath "C:\Backups\PicPeak\$data\arquivos.zip"
```

Guarde as cópias fora deste computador. O arquivo de segredos dá acesso ao banco: trate-o como uma senha.

---

## 9. Restauração

### Pelo painel

Em *Cópia de segurança e restauração → Restaurar*, envie um arquivo `.picpeak` ou escolha um backup do histórico. A restauração substitui os dados atuais (o painel avisa e pede confirmação).

### Manual

```powershell
$origem = "C:\Backups\PicPeak\20261117-1700"   # pasta do backup

docker compose stop backend frontend

# Banco de dados (substitui o conteúdo atual pelo do backup)
docker compose cp "$origem\banco.sql" postgres:/tmp/banco.sql
docker compose exec -T postgres sh -c 'psql -q -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /tmp/banco.sql'

# Fotos e dados (extraia por cima das pastas atuais)
Expand-Archive "$origem\arquivos.zip" -DestinationPath C:\www\PicPeak -Force

docker compose start backend frontend
```

Para restaurar em outro computador, restaure primeiro o volume de segredos (`segredos.tgz`) **antes** de subir o Postgres pela primeira vez:

```powershell
docker volume create picpeak_picpeak-secrets
docker run --rm -v picpeak_picpeak-secrets:/s -v "${origem}:/b" alpine:3.20 tar xzf /b/segredos.tgz -C /s
```

Esses comandos de backup e restauração foram testados nesta instalação: o dump foi restaurado num PostgreSQL descartável sem erros, com dados e acentos íntegros.

---

## 10. Atualizar a aplicação

A tradução vive na branch `traducao-pt-br`, criada a partir da tag estável `v3.135.16`. Para trazer uma nova versão estável do PicPeak:

```powershell
# 0. Faça um backup (seção 8)
git fetch origin --tags
git tag --sort=-creatordate | Select-Object -First 10   # veja a versão estável mais nova (ex.: v3.135.17)

git checkout traducao-pt-br
git merge v3.135.17          # substitua pela versão desejada

# Atualize o rótulo da imagem em docker-compose.ptbr.yml (3.135.16-ptbr → 3.135.17-ptbr), se quiser
cd frontend; node scripts/i18n-ptbr.mjs check; cd ..   # veja se surgiram textos novos sem tradução
docker compose build
docker compose up -d
```

As migrações do banco rodam sozinhas na inicialização do backend. Conflitos de merge são raros, porque as traduções ficam em arquivos próprios (seção 11); se ocorrerem, normalmente estarão em `frontend/src/i18n/locales/en.json`/`de.json` (bloco `ui`) ou em algum componente com texto que esta branch passou a traduzir.

> Não use o atualizador automático do painel (*in-app update*) nem `docker compose pull` para o backend/frontend: eles trariam as imagens oficiais, sem a tradução. O `pull_policy: build` do override já impede que o `pull` troque as imagens locais.

---

## 11. Como atualizar as traduções

### Interface (frontend)

- Catálogo original do projeto: `frontend/src/i18n/locales/pt.json` (não editar — vem do upstream).
- **Catálogo pt-BR desta instalação:** `frontend/src/i18n/locales-ptbr/pt.json`. Ele é mesclado por cima do original na inicialização (`frontend/src/i18n/config.ts`) e tem prioridade. Toda correção ou tradução nova vai aqui.
- Textos-base em inglês: `frontend/src/i18n/locales/en.json`.

Ferramenta de verificação (na pasta `frontend`):

```powershell
node scripts/i18n-ptbr.mjs check
node scripts/i18n-missing-defaults.mjs
```

A primeira mostra a cobertura e falha (código de saída 1) se houver chave sem tradução, variável `{{...}}` ou tag divergente, ou termos de português europeu ("ficheiro", "utilizador", "palavra-passe"...). Para traduzir o que surgir após uma atualização:

```powershell
node scripts/i18n-ptbr.mjs export ..\traducoes-pendentes   # gera lotes en-01.json, en-02.json...
# traduza cada arquivo mantendo as chaves e as variáveis {{...}} e salve como, por exemplo, pt-01.json
node scripts/i18n-ptbr.mjs merge ..\traducoes-pendentes\pt-01.json
node scripts/i18n-ptbr.mjs check
docker compose build frontend; docker compose up -d frontend
```

O teste automatizado `frontend/src/i18n/__tests__/pt-br.coverage.test.ts` faz as mesmas verificações (`npx vitest run src/i18n`).

Regras usadas na tradução:

- Português brasileiro: "arquivo", "usuário", "senha", "excluir", "salvar", "configurações", "compartilhar", "baixar".
- Glossário do menu: Dashboard → Painel de controle; Galleries → Galerias; Analytics → Estatísticas; Storage → Armazenamento; Backup → Cópia de segurança; Settings → Configurações; Save changes → Salvar alterações.
- Preserve exatamente variáveis (`{{name}}`, `{{count}}`), tags (`<strong>`, `<1>`) e referências `$t(...)`.
- Plurais seguem o i18next: chaves `_one` (singular) e `_other` (plural).

### E-mails automáticos

- Templates pt-BR: `backend/src/services/ptbrEmailTemplates.js`. Eles são inseridos no banco na inicialização do backend **apenas quando ainda não existe versão pt** do template — edições feitas pelo painel (*Configurações de e-mail → Templates*) nunca são sobrescritas.
- Para alterar o texto de um e-mail, o caminho mais simples é editar pelo painel, escolhendo o idioma Português.
- O idioma do e-mail segue esta ordem: idioma do evento → idioma preferido do cliente → idioma padrão em *Configurações → Geral* → idioma padrão do e-mail.

### Dados pré-cadastrados

Alguns rótulos visíveis vêm do banco de dados, cadastrados em inglês ou alemão pelo projeto original. O arquivo `backend/src/services/ptbrDefaultData.js` os traduz na inicialização do backend, **somente quando o idioma padrão é Português e o texto ainda é exatamente o padrão de fábrica** (nada que você editou é alterado):

- nomes das categorias de fotos (Cerimônia, Recepção, Retratos...) e dos tipos de evento (Casamento, Aniversário, Corporativo, Outro);
- páginas do CMS (Aviso legal, Política de privacidade, Página/Galeria não encontrada);
- condições de pagamento usadas em orçamentos e faturas, e nomes/descrições dos fluxos de trabalho integrados.

Os identificadores técnicos (`wedding`, `birthday`...) não mudam, porque o código os usa.

**Não traduzidos de propósito:** os blocos de exemplo da biblioteca de contratos (*Contratos → Biblioteca de blocos*). São cláusulas jurídicas escritas para o direito suíço/alemão, marcadas como exemplo; para uso no Brasil, substitua-as por textos revisados por um advogado.

O CMS só tem as versões "EN" e "DE" de cada página; visitantes de qualquer idioma que não seja alemão recebem a versão "EN". Por isso, nesta instalação, o conteúdo em português fica na aba **EN** do editor de páginas.

### PDFs

Rótulos de orçamentos, faturas, contratos e relatório fiscal: bloco `pt` em `backend/src/services/pdf-i18n.js`.

---

## 12. Solução de problemas

**A interface abre em inglês.**
O navegador guardou outra escolha de idioma. Use o seletor de idioma no topo e escolha *Português*, ou limpe os dados do site `localhost:3000`. Confira também se as imagens em uso são as locais: `docker compose images` deve listar `picpeak-ptbr/frontend` e `picpeak-ptbr/backend`.

**Algum texto aparece em inglês.**
Rode `node scripts/i18n-ptbr.mjs check` em `frontend`. Se a cobertura estiver em 100%, o texto provavelmente está fixo no código (não passa pelo catálogo) ou vem do banco (template de e-mail editado, página do CMS, nome de categoria). Textos cadastrados por você no painel ficam no idioma em que foram escritos.

**E-mails chegam em inglês.**
Verifique *Configurações → Geral → Idioma* (deve ser Português), o idioma do evento e o idioma preferido do cliente. Os e-mails só são enviados depois de configurar o SMTP em *Configurações de e-mail*.

**A porta 3000 está ocupada.**
Altere `FRONTEND_PORT` no `.env` (por exemplo, `3080`), ajuste `FRONTEND_URL` e `ADMIN_URL` e rode `docker compose up -d`.

**O backend não fica "healthy".**
`docker compose logs backend` mostra o motivo. Erros de senha do banco normalmente indicam que o volume `picpeak_picpeak-secrets` foi apagado enquanto `picpeak_postgres-data` continuou existindo; restaure os segredos do backup (seção 9).

**Perdi o token de configuração inicial.**
`docker compose exec backend cat /app/data/SETUP_TOKEN` (ele só existe enquanto não há administrador).

**Esqueci a senha do administrador.**
Use *Esqueci minha senha* na tela de login (exige SMTP configurado) ou consulte a documentação oficial sobre redefinição pela linha de comando.

**Datas ou horários com uma ou três horas de diferença.**
Confirme `TZ=America/Sao_Paulo` no `.env` e o fuso em *Perfil da empresa*; depois `docker compose up -d` para recriar os containers.

**Quero voltar às imagens oficiais (sem tradução).**
No `.env`, deixe `COMPOSE_FILE=docker-compose.production.yml` e rode `docker compose pull; docker compose up -d`. Os dados continuam os mesmos.

---

## Arquivos alterados por esta tradução

- `frontend/src/i18n/locales-ptbr/pt.json` — catálogo pt-BR (novo).
- `frontend/src/i18n/config.ts` — mescla do catálogo pt-BR, idioma padrão configurável no build e normalização `pt-BR` → `pt`.
- `frontend/scripts/i18n-ptbr.mjs` e `frontend/src/i18n/__tests__/pt-br.coverage.test.ts` — ferramentas e teste de cobertura (novos).
- `frontend/src/i18n/locales/en.json` e `de.json` — novas chaves `ui.*` para textos que estavam fixos no código.
- Componentes do frontend com textos fixos em inglês passaram a usar `t()`; `frontend/src/utils/tr.ts` e `frontend/src/hooks/useEventTypeName.ts` são utilitários novos para isso (lista completa em `git diff v3.135.16 --stat`).
- `frontend/scripts/i18n-missing-defaults.mjs` — encontra chamadas `t('chave', 'texto')` cuja chave não existe no catálogo (o texto em inglês apareceria mesmo em pt-BR).
- `frontend/Dockerfile` — argumento de build `VITE_DEFAULT_LANGUAGE`.
- `backend/src/services/ptbrEmailTemplates.js` (novo) e `_emailTemplateBoot.js` — templates de e-mail pt-BR.
- `backend/src/services/emailProcessor.js`, `guestRecoveryService.js`, `publicDocumentVerificationService.js`, `routes/galleryGuests.js` — rodapé e e-mails gerados no código em pt-BR.
- `backend/src/services/pdf-i18n.js`, `backend/src/utils/docIntlLocale.js` e serviços de fatura/orçamento/relatório fiscal — rótulos de PDF e formatação `pt-BR`.
- `backend/src/services/ptbrDefaultData.js` (novo) — tradução dos dados pré-cadastrados.
- `.gitattributes` (novo) — força quebras de linha LF nos scripts `.sh`; sem isso, o checkout no Windows quebra os containers.
- `docker-compose.ptbr.yml` e este `README-PTBR.md` (novos).
