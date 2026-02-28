<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Criptografa CNPJs existentes que estão em texto plano.
     * A partir desta migration, todos os novos CNPJs são gravados criptografados
     * pelo mutator setCnpjAttribute() do modelo User.
     */
    public function up(): void
    {
        DB::table('users')
            ->whereNotNull('cnpj')
            ->orderBy('id')
            ->chunkById(100, function ($users): void {
                foreach ($users as $user) {
                    // Tenta descriptografar: se tiver sucesso, ja esta criptografado
                    try {
                        Crypt::decryptString($user->cnpj);
                        // Ja criptografado — pular
                    } catch (\Exception) {
                        // Texto plano — criptografar
                        DB::table('users')
                            ->where('id', $user->id)
                            ->update(['cnpj' => Crypt::encryptString($user->cnpj)]);
                    }
                }
            });
    }

    public function down(): void
    {
        // Nao e seguro reverter — dados ja criptografados nao devem voltar a texto plano
    }
};
