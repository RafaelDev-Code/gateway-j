# Credenciais de Acesso - Gateway de Pagamentos (Laravel)

> ATENCAO: Este arquivo NAO deve ser commitado no Git.
> Mantenha em local seguro (ex: cofre de senhas).

---

## Ambiente

Configure todas as variaveis abaixo em `backend/.env` antes de subir os containers.
Use `backend/.env.example` como ponto de partida.

---

## Banco de Dados PostgreSQL (Externo)

```
DB_HOST=SEU_HOST_POSTGRESQL
DB_PORT=5432
DB_DATABASE=gateway
DB_USERNAME=gateway_user
DB_PASSWORD=SENHA_FORTE_AQUI
DB_SSLMODE=require
```

---

## Redis

```
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=SENHA_REDIS_AQUI
```

---

## Admin Filament

- URL: `https://seudominio.com/admin`
- Criar primeiro admin via tinker:

```bash
docker compose exec octane php artisan tinker

# Dentro do tinker:
\App\Models\User::create([
    'username' => 'admin',
    'name'     => 'Administrador',
    'email'    => 'admin@seudominio.com',
    'password' => bcrypt('SENHA_FORTE_AQUI'),
    'role'     => 'ADMIN',
    'payment_pix'       => 'PAGPIX',
    'cash_in_active'    => true,
    'cash_out_active'   => true,
    'documents_checked' => true,
    'balance'           => 0,
    'reference'         => \Illuminate\Support\Str::random(20),
]);
```

---

## Adquirentes

Preencher no `backend/.env`:

```
PAGPIX_URL=
PAGPIX_KEY=
PAGPIX_WEBHOOK_SECRET=

RAPDYN_URL=
RAPDYN_KEY=
RAPDYN_WEBHOOK_SECRET=

WITETEC_URL=
WITETEC_KEY=
WITETEC_SECRET_KEY=
WITETEC_MERCHANT_EMAIL=
WITETEC_MERCHANT_PASSWORD=
WITETEC_WEBHOOK_SECRET=

STRIKE_URL=
STRIKE_KEY_PUBLIC=
STRIKE_KEY_SECRET=
STRIKE_WEBHOOK_SECRET=

VERSELL_URL=
VERSELL_CLIENT_ID=
VERSELL_SECRET=
VERSELL_WEBHOOK_SECRET=

BSPAY_URL=
BSPAY_CLIENT_ID=
BSPAY_CLIENT_SECRET=
BSPAY_WEBHOOK_SECRET=
```

---

## Comandos Uteis (Docker)

```bash
# Subir o sistema
cd Laravel/backend
docker compose up -d

# Ver logs
docker compose logs -f octane
docker compose logs -f horizon

# Rodar migrations
docker compose exec octane php artisan migrate --seed

# Acessar o container
docker compose exec octane bash

# Parar tudo
docker compose down
```

---

## Horizon (Monitoramento de Filas)

- URL: `https://seudominio.com/horizon`
- Acesso restrito a usuarios com role ADMIN

---

## Notas de Seguranca

- Nunca exponha o `backend/.env` publicamente
- Nunca commite credenciais reais no Git
- Use senhas fortes (minimo 32 caracteres) para Redis e PostgreSQL
- Ative SSL/TLS no PostgreSQL (`DB_SSLMODE=require`)
- Troque `APP_KEY` em producao com `php artisan key:generate`
