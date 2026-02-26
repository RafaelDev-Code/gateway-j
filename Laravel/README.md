# Gateway de Pagamentos - Laravel 12

## Estrutura

```
Laravel/
├── backend/    # API Laravel 12 + Admin Filament
└── frontend/   # React Dashboard (desenvolvimento separado)
```

## Backend (`backend/`)

### Stack
- Laravel 12 + Octane (Swoole)
- PostgreSQL (externo)
- Redis (cache + sessoes + filas)
- Horizon (monitoramento de filas)
- Filament 3 (admin panel)

### Docker

```bash
# Subir todos os servicos
docker compose up -d

# Ver logs
docker compose logs -f octane
docker compose logs -f horizon

# Escalar workers
docker compose up --scale octane=3 --scale horizon=2 -d
```

### Configuracao inicial

```bash
# 1. Copiar .env
cp .env.example .env

# 2. Preencher variaveis no .env (DB, Redis, adquirentes...)

# 3. Rodar migrations
php artisan migrate --seed

# 4. Criar primeiro admin
php artisan tinker
>>> App\Models\User::create([...role => 'ADMIN'...])
```

### API Endpoints

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/api/v1/pix/cashin` | Gerar QR Code PIX |
| POST | `/api/v1/pix/cashout` | Processar saque PIX |
| POST | `/api/v1/transfers` | Transferencia interna |
| GET  | `/api/v1/balance` | Consultar saldo |
| GET  | `/api/v1/transactions` | Listar transacoes |
| GET  | `/api/v1/transactions/{id}` | Detalhe da transacao |
| POST | `/api/v1/webhooks/{acquirer}` | Webhooks das adquirentes |

**Autenticacao:** Header `Apikey: {client_id}`

### Adquirentes suportadas

Configuradas via `.env`: PAGPIX, RAPDYN, WITETEC, STRIKE, VERSELL, BSPAY

### Admin Panel

Acesso: `https://seu-dominio.com/admin`

Recursos:
- Merchants (usuarios)
- Transacoes (somente leitura)
- Configuracoes (taxas, anti-fraude)
- Chaves de API
- Documentos

### Seguranca

- PIN hashado com bcrypt
- API keys autenticadas via Sanctum
- Rate limiting por rota
- Validacao HMAC em webhooks
- Headers de seguranca no Nginx
- Zero informacao em erros de producao
- Audit log em todas as operacoes criticas
- IP whitelist por merchant

### Horizon

Acesso: `https://seu-dominio.com/horizon` (apenas admins)

Filas:
- `webhooks` - Alta prioridade (5-10 workers)
- `payments` - Splits (3-6 workers)
- `postbacks` - Callbacks (3-6 workers)
- `notifications` - Baixa prioridade (1-2 workers)

### Testes

```bash
php artisan test
php artisan test --filter TaxCalculatorTest
php artisan test --filter CashInApiTest
```
