<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // Autenticacao
            $table->string('username', 50)->unique();
            $table->string('email', 100)->unique();
            $table->string('password');
            $table->string('pin')->nullable()->comment('Hashado com bcrypt - NUNCA texto plano');

            // Dados pessoais
            $table->string('name', 100);
            $table->string('telefone', 20)->nullable();
            $table->string('cnpj', 20)->nullable();
            $table->string('faturamento', 50)->nullable();

            // Financeiro
            $table->decimal('balance', 20, 6)->default(0)->comment('Saldo em reais');

            // Role e permissoes
            $table->enum('role', ['USER', 'ADMIN'])->default('USER');
            $table->boolean('cash_in_active')->default(false);
            $table->boolean('cash_out_active')->default(false);
            $table->boolean('checkout_active')->default(false);
            $table->boolean('documents_checked')->default(false);

            // Adquirente configurada para este usuario
            $table->enum('payment_pix', ['PAGPIX', 'RAPDYN', 'WITETEC', 'STRIKE', 'VERSELL', 'BSPAY'])
                  ->default('PAGPIX');

            // Taxas individuais (NULL = usa config global)
            $table->decimal('taxa_cashin_individual', 10, 4)->nullable();
            $table->decimal('taxa_cashout_individual', 10, 4)->nullable();
            $table->decimal('taxa_min_individual', 10, 6)->nullable();

            // Referencia e indicacao
            $table->string('reference', 100)->unique()->nullable();
            $table->string('ref_used', 100)->nullable();

            // Notificacoes externas (encriptado em repouso)
            $table->text('pushcut_link')->nullable()->comment('Encriptado com Crypt::encrypt');

            // Controle de acesso
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();

            // Indices para queries frequentes
            $table->index('role');
            $table->index('payment_pix');
            $table->index(['cash_in_active', 'cash_out_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
