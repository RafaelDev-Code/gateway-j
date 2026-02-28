# Deploy — Gateway de Pagamento JJ

> Leia do início ao fim antes de executar qualquer comando.

---

## Pré-requisitos

- Acesso SSH ao servidor de produção
- Acesso ao GitHub (repositório `RafaelDev-Code/gateway-j`)
- Docker e Docker Compose instalados no servidor
- Variáveis de ambiente configuradas no `.env` de produção (ver seção abaixo)

---

## Variáveis de ambiente obrigatórias

Copie `.env.example` para `.env` e preencha **todos** os campos abaixo antes do primeiro deploy.

```env
APP_ENV=production
APP_DEBUG=false
APP_KEY=          # php artisan key:generate

DB_CONNECTION=pgsql
DB_HOST=
DB_PORT=5432
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=

# Segurança de sessão — OBRIGATÓRIO true em produção
SESSION_SECURE_COOKIE=true
SESSION_DRIVER=database

# Sanctum
SANCTUM_STATEFUL_DOMAINS=seudominio.com

# Adquirentes
PAGPIX_KEY=
PAGPIX_URL=
PAGPIX_WEBHOOK_SECRET=    # Usado para validar assinatura HMAC dos webhooks

RAPDYN_KEY=
RAPDYN_WEBHOOK_SECRET=

# ... demais adquirentes

# Cache / Fila
CACHE_STORE=redis
QUEUE_CONNECTION=redis
REDIS_HOST=
REDIS_PASSWORD=
REDIS_PORT=6379
```

> **APP_DEBUG nunca deve ser `true` em produção.** O smoke test verifica isso automaticamente.

---

## Checklist pré-deploy

Execute na ordem. Não pule etapas.

### 1. Rodar o smoke test no staging

```bash
bash smoke-test.sh https://staging.seudominio.com
```

O script verifica automaticamente:
- SSRF protection (postback bloqueado para IPs internos)
- Rate limiting de login (brute force)
- API key auth (X-Client-Id + X-Client-Secret)
- Webhook replay protection (timestamp expirado)
- Cookies HttpOnly / Secure / SameSite
- Headers de segurança (CSP, X-Frame-Options, HSTS)
- APP_DEBUG não vaza stack traces
- Idempotency-Key obrigatória no cashout
- Mass assignment bloqueado no cadastro

**Resultado esperado: 0 falhas.** Com avisos (HSTS, SameSite) é aceitável dependendo da infra.

### 2. Verificar transações com valor zerado no staging

O bug `amountCents` nos acquirers existia antes desta versão e pode ter gerado transações com `amount = 0`. Verifique antes de migrar produção:

```bash
docker exec gateway_app php artisan tinker --no-interaction
```

```php
// No tinker:
Transaction::whereNull('amount')->orWhere('amount', 0)->where('type', 'DEPOSIT')->count();
// Resultado esperado: 0
// Se > 0: não fazer deploy ainda, investigar manualmente cada transação
```

### 3. Rodar a suite de testes completa

```bash
docker exec gateway_app php artisan test
# Resultado esperado: 95 passed, 0 failed, 1 skipped
```

---

## Procedimento de deploy em produção

### Passo 1 — Colocar em manutenção

```bash
docker exec gateway_app php artisan down \
  --message="Manutenção programada. Voltamos em instantes." \
  --retry=60
```

### Passo 2 — Puxar o código

```bash
git pull origin main
```

### Passo 3 — Instalar dependências (se houver mudanças no composer.json)

```bash
docker exec gateway_app composer install --no-dev --optimize-autoloader
```

### Passo 4 — Rodar as migrations

> Esta versão tem **10 migrations novas**. Não pule este passo.

```bash
docker exec gateway_app php artisan migrate --force
```

Migrations incluídas nesta versão:
| Arquivo | O que faz |
|---------|-----------|
| `2026_02_28_000001` | Campos admin na tabela users |
| `2026_02_28_000002` | Role `manager` |
| `2026_02_28_000003` | Campo `site` nos users |
| `2026_02_28_000004` | Tabela `user_webhooks` |
| `2026_02_28_000005` | Criptografia de CNPJs existentes |
| `2026_02_28_000010` | Campo `next_secret_hash` em integration_keys |
| `2026_02_28_000020` | Tabela `webhook_events` (deduplicação atômica) |
| `2026_02_28_000030` | **Converte colunas monetárias para centavos (bigint)** |
| `2026_02_28_000040` | Expande coluna CNPJ para criptografia |
| `2026_02_28_000050` | Campo `idempotency_key` em transactions |
| `2026_02_28_000060` | Campo `uuid` em user_webhooks |

> ⚠️ A migration `000030` converte todos os valores monetários de `decimal` para `bigint` em centavos. É **irreversível**. Faça backup do banco antes.

### Passo 5 — Limpar caches

```bash
docker exec gateway_app php artisan config:clear
docker exec gateway_app php artisan cache:clear
docker exec gateway_app php artisan route:clear
docker exec gateway_app php artisan view:clear
docker exec gateway_app php artisan optimize
```

### Passo 6 — Reiniciar workers de fila

```bash
docker exec gateway_app php artisan queue:restart
```

### Passo 7 — Tirar da manutenção

```bash
docker exec gateway_app php artisan up
```

### Passo 8 — Smoke test em produção

```bash
bash smoke-test.sh https://seudominio.com
```

Se **qualquer** check crítico falhar: execute rollback imediatamente (ver abaixo).

---

## Rollback

Caso o smoke test falhe após o deploy:

```bash
# 1. Voltar para manutenção
docker exec gateway_app php artisan down

# 2. Reverter para o commit anterior
git reset --hard HEAD~1
git checkout HEAD -- .

# 3. Reverter as migrations (apenas se necessário — prefira não reverter a 000030)
docker exec gateway_app php artisan migrate:rollback --step=10 --force

# 4. Reinstalar dependências da versão anterior
docker exec gateway_app composer install --no-dev --optimize-autoloader

# 5. Limpar caches
docker exec gateway_app php artisan optimize

# 6. Subir de volta
docker exec gateway_app php artisan up
```

> A migration `000030` (conversão monetária) **não tem rollback seguro** — ela converte os dados. Por isso o backup do banco antes do deploy é obrigatório.

---

## Comunicação para merchants — prazo 7 dias após deploy

Esta versão torna o header `X-Client-Secret` **obrigatório** em todas as requisições de API. Merchants que só enviavam `X-Client-Id` passarão a receber `401`.

O fallback de autenticação SHA-256 (legado) está ativo e faz upgrade automático para bcrypt na primeira autenticação bem-sucedida. Merchants com chaves antigas continuarão funcionando durante a transição.

**Modelo de comunicação:**

```
Assunto: Atualização de segurança — autenticação da API

A partir de [DATA], todas as requisições à API do Gateway JJ
requerem os dois headers de autenticação:

  X-Client-Id: <seu_client_id>
  X-Client-Secret: <seu_client_secret>

Requisições com apenas X-Client-Id passarão a retornar 401.

Seu client_secret está disponível no painel em:
Configurações → Integrações → [nome da chave]

Dúvidas: suporte@seudominio.com
```

---

## Monitoramento pós-deploy

Nos primeiros 30 minutos após o deploy, monitore:

```bash
# Erros nos logs da aplicação
docker exec gateway_app tail -f storage/logs/laravel.log | grep -E "ERROR|CRITICAL"

# Fila de webhooks processando normalmente
docker exec gateway_app php artisan queue:monitor webhooks

# Jobs falhando
docker exec gateway_app php artisan queue:failed
```

**Alertas críticos para ficar atento:**

| Log | Significado | Ação |
|-----|-------------|------|
| `CRITICO: falha ao reverter saldo` | Saque debitado mas adquirente falhou e reversão também falhou | Intervenção manual imediata |
| `Webhook: divergencia de valor` | Adquirente enviou valor diferente do cobrado | Investigar transação |
| `amountCents` com valor 0 | Bug de integração com adquirente | Verificar configuração da adquirente |

---

## Contato de emergência

| Situação | Ação |
|----------|------|
| Transação duplicada creditada | Acesse `/admin` → Transações → estorne manualmente |
| Saldo negativo em usuário | Acesse `/admin` → Usuários → ajuste manual de saldo |
| Adquirente fora do ar | Acesse `/admin` → Adquirentes → desative temporariamente |
| Usuário suspeito | Acesse `/admin` → Usuários → Banir / Bloquear credenciais |
