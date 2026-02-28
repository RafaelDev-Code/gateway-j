<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Converte todas as colunas monetárias de decimal(20,6) para bigint (centavos).
 *
 * ESTRATÉGIA DE DEPLOY:
 * 1. Ativar maintenance mode: php artisan down
 * 2. Rodar migration: php artisan migrate
 * 3. Deploy do novo código (DTOs, Actions, Jobs, Models já em centavos)
 * 4. Limpar caches: php artisan config:clear && php artisan cache:clear
 * 5. Desativar maintenance mode: php artisan up
 * 6. Verificar manualmente saldo de N usuários conhecidos
 *
 * ROLLBACK: a coluna down() recria decimal com valores divididos por 100.
 */
return new class extends Migration
{
    public function up(): void
    {
        // 1. users.balance: reais -> centavos
        DB::statement('ALTER TABLE users ALTER COLUMN balance TYPE bigint USING ROUND(balance * 100)::bigint');
        DB::statement("ALTER TABLE users ALTER COLUMN balance SET DEFAULT 0");

        // 2. users.auto_cashout_limit: reais -> centavos (nullable)
        DB::statement('ALTER TABLE users ALTER COLUMN auto_cashout_limit TYPE bigint USING ROUND(auto_cashout_limit * 100)::bigint');

        // 3. transactions.amount: reais -> centavos
        DB::statement('ALTER TABLE transactions ALTER COLUMN amount TYPE bigint USING ROUND(amount * 100)::bigint');

        // 4. transactions.tax: reais -> centavos
        DB::statement('ALTER TABLE transactions ALTER COLUMN tax TYPE bigint USING ROUND(tax * 100)::bigint');
        DB::statement("ALTER TABLE transactions ALTER COLUMN tax SET DEFAULT 0");

        // 5. split_transactions.amount: reais -> centavos
        DB::statement('ALTER TABLE split_transactions ALTER COLUMN amount TYPE bigint USING ROUND(amount * 100)::bigint');
        DB::statement("ALTER TABLE split_transactions ALTER COLUMN amount SET DEFAULT 0");
    }

    public function down(): void
    {
        // Rollback: bigint -> decimal(20,6) dividindo por 100
        DB::statement('ALTER TABLE users ALTER COLUMN balance TYPE decimal(20,6) USING balance / 100.0');
        DB::statement("ALTER TABLE users ALTER COLUMN balance SET DEFAULT 0");

        DB::statement('ALTER TABLE users ALTER COLUMN auto_cashout_limit TYPE decimal(20,6) USING auto_cashout_limit / 100.0');

        DB::statement('ALTER TABLE transactions ALTER COLUMN amount TYPE decimal(20,6) USING amount / 100.0');

        DB::statement('ALTER TABLE transactions ALTER COLUMN tax TYPE decimal(20,6) USING tax / 100.0');
        DB::statement("ALTER TABLE transactions ALTER COLUMN tax SET DEFAULT 0");

        DB::statement('ALTER TABLE split_transactions ALTER COLUMN amount TYPE decimal(20,6) USING amount / 100.0');
        DB::statement("ALTER TABLE split_transactions ALTER COLUMN amount SET DEFAULT 0");
    }
};
