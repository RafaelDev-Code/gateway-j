# Gateway de Pagamentos

Este repositório contém **dois sistemas distintos**:

| Pasta | Descricao | Status |
|-------|-----------|--------|
| `_backup_php_legacy/` | Sistema original em PHP puro (legado) | Somente leitura / referencia |
| `Laravel/` | **Sistema novo — Laravel 12** (producao) | Desenvolvimento ativo |

---

## Sistema Novo — `Laravel/`

Monorepo com API + Dashboard separados por responsabilidade.

```
Laravel/
├── backend/    ← API REST + Admin Filament (Laravel 12, PHP 8.3)
├── frontend/   ← Dashboard do merchant (React 18 + Vite)
└── README.md   ← Documentacao detalhada do sistema
```

### Por que monorepo?

Manter `backend/` e `frontend/` no mesmo repositorio garante:
- Versionamento conjunto (1 commit descreve a mudanca completa)
- Deploy atomico via Docker Compose
- Um unico lugar para abrir issues e rastrear historico

### Stack do Backend

| Tecnologia | Funcao |
|------------|--------|
| Laravel 12 | Framework principal (API + Admin) |
| PHP 8.3 | Linguagem |
| PostgreSQL (externo) | Banco de dados principal |
| Redis | Cache + Sessoes + Filas |
| Laravel Horizon | Monitoramento de filas |
| Laravel Octane (Swoole) | Alta performance / throughput |
| Filament 3 | Painel administrativo |
| Laravel Sanctum | Autenticacao API (tokens) |
| Docker | Containers de producao |

### Stack do Frontend

| Tecnologia | Funcao |
|------------|--------|
| React 18 | Framework de interface |
| Vite | Build e dev server |
| Lucide React | Icones |

---

## Inicio Rapido

### 1. Configurar o Backend

```bash
cd Laravel/backend

# Copiar e preencher variaveis de ambiente
cp .env.example .env
# Editar .env: DB_HOST, DB_PASSWORD, REDIS_PASSWORD, chaves das adquirentes...

# Subir containers Docker
docker compose up -d

# Rodar migrations + seeders
docker compose exec octane php artisan migrate --seed

# Criar primeiro admin
docker compose exec octane php artisan tinker
# >>> \App\Models\User::factory()->admin()->create(['email' => 'admin@seudominio.com', 'password' => 'SenhaForte123!'])
```

### 2. Configurar o Frontend

```bash
cd Laravel/frontend
npm install
npm run dev   # desenvolvimento
npm run build # producao
```

---

## Adquirentes Suportadas

Todas as 6 adquirentes do sistema legado foram migradas:

| Adquirente | Cash-In (PIX) | Cash-Out | Webhook |
|------------|:---:|:---:|:---:|
| PagPix | ✅ | ✅ | ✅ |
| RapDyn | ✅ | ✅ | ✅ |
| WiteTec | ✅ | ✅ | ✅ |
| Strike | ✅ | ✅ | ✅ |
| Versell Pay | ✅ | ✅ | ✅ |
| BSPay | ✅ | ✅ | ✅ |

---

## Seguranca

O sistema foi construido com seguranca em camadas:

- **Autenticacao**: API Keys (HMAC SHA-256) + Sanctum tokens
- **Webhooks**: Validacao de assinatura HMAC por adquirente
- **Rate Limiting**: Por rota (API, cashin, cashout, webhooks, admin)
- **IP Whitelist**: Por merchant
- **Dados sensiveis**: Criptografados em repouso (AES-256 via Laravel Crypt)
- **Senhas e PINs**: Bcrypt
- **Uploads KYC**: Validacao MIME real (finfo_file), SHA-256, storage privado
- **Headers HTTP**: HSTS, CSP, X-Frame-Options, X-Content-Type-Options
- **Logs**: Sanitizados — nunca expoe senhas, PINs ou secrets
- **Audit Log**: Todas as acoes criticas registradas com IP + User-Agent

---

## Rotas da API (v1)

### Publica
| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/api/v1/auth/login` | Login do merchant |
| POST | `/api/v1/webhooks/pagpix` | Webhook PagPix |
| POST | `/api/v1/webhooks/rapdyn` | Webhook RapDyn |
| POST | `/api/v1/webhooks/witetec` | Webhook WiteTec |
| POST | `/api/v1/webhooks/strike` | Webhook Strike |
| POST | `/api/v1/webhooks/versell` | Webhook Versell |
| POST | `/api/v1/webhooks/bspay` | Webhook BSPay |

### Autenticada por API Key (header `Apikey`)
| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/v1/balance` | Saldo do merchant |
| POST | `/api/v1/pix/cashin` | Gerar cobranca PIX |
| POST | `/api/v1/pix/cashout` | Solicitar saque PIX |
| POST | `/api/v1/transfers` | Transferencia interna |
| GET | `/api/v1/transactions` | Listar transacoes |
| GET | `/api/v1/transactions/{id}` | Detalhe da transacao |
| GET | `/api/v1/documents` | Listar documentos KYC |
| POST | `/api/v1/documents` | Enviar documento KYC |

### Autenticada por Sanctum Token (React Dashboard)
| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/me` | Dados do usuario logado |
| POST | `/api/v1/pin` | Criar PIN |
| PUT | `/api/v1/pin` | Alterar PIN |
| GET | `/api/v1/keys` | Listar API Keys |
| POST | `/api/v1/keys` | Criar API Key |
| DELETE | `/api/v1/keys/{id}` | Revogar API Key |

---

## Painel Admin

Acesso: `https://seudominio.com/admin`

Recursos disponiveis:
- **Merchants** — criar, editar, ativar/desativar cash-in e cash-out
- **Transacoes** — visualizacao completa (somente leitura)
- **Configuracoes** — taxas globais, anti-fraude, temas
- **API Keys** — gerenciar chaves de integracao
- **Documentos KYC** — aprovar/rejeitar com URL temporaria assinada

---

## Sistema Legado — `_backup_php_legacy/`

Backup do sistema original em PHP puro para referencia.

> **Nao utilizar em producao.** Este sistema possui vulnerabilidades criticas de seguranca documentadas durante a analise de migracao.

---

## Suporte e Manutencao

Para qualquer ajuste, correcao ou nova funcionalidade, trabalhe **exclusivamente** dentro de `Laravel/backend/` e `Laravel/frontend/`. O sistema legado deve ser mantido apenas como referencia historica.
