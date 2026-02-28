<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('webhook_events', function (Blueprint $table) {
            $table->id();

            // Identifica o evento de forma única por adquirente
            $table->string('provider', 50)->comment('Nome da adquirente (ex: pagpix, rapdyn)');
            $table->string('provider_event_id', 255)->comment('ID do evento retornado pela adquirente');

            // Referência à transação processada (preenchida após processamento)
            $table->string('transaction_id', 50)->nullable();

            $table->string('status', 30)->default('received');
            $table->timestamps();

            // Índice único composto: garante deduplicação atômica via INSERT
            $table->unique(['provider', 'provider_event_id'], 'uidx_webhook_events_dedup');
            $table->index('transaction_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('webhook_events');
    }
};
