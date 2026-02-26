<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gateway_configs', function (Blueprint $table) {
            $table->id();

            // Taxas globais (percentual, ex: 2.00 = 2%)
            $table->decimal('tax_cashin', 10, 4)->default(0);
            $table->decimal('tax_cashout', 10, 4)->default(0);
            $table->decimal('tax_min', 10, 6)->default(0)->comment('Taxa minima em reais');
            $table->decimal('tax_internal', 10, 4)->default(0)->comment('Taxa transferencia interna');

            // Anti-fraude
            $table->decimal('anti_fraud_min', 20, 6)->default(0)->comment('Valor minimo para ativar anti-fraude');

            // Configuracoes visuais (usadas pelo React frontend)
            $table->string('gateway_name', 100)->default('Gateway');
            $table->string('primary_color', 20)->default('#f30f22');
            $table->string('secondary_color', 20)->default('#0D0202');
            $table->string('logo_url', 500)->nullable();
            $table->string('favicon_url', 500)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gateway_configs');
    }
};
