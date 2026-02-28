<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Expande a coluna users.cnpj de varchar(20) para text.
 * Necessário pois o valor é agora encriptado via Crypt::encryptString(),
 * que produz strings de ~200 caracteres (base64 AES-256 + IV + MAC).
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE users ALTER COLUMN cnpj TYPE text');
    }

    public function down(): void
    {
        // Ao fazer rollback, trunca para 20 chars — dados encriptados serão perdidos
        DB::statement('ALTER TABLE users ALTER COLUMN cnpj TYPE varchar(20) USING LEFT(cnpj, 20)');
    }
};
