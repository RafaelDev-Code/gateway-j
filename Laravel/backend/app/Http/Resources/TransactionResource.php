<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    /**
     * Campos retornados para a API.
     * Nunca expor: postback_url, dados internos do sistema.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'status'       => $this->status->value,
            'status_label' => $this->status->label(),
            'type'         => $this->type->value,
            'type_label'   => $this->type->label(),
            'amount'       => number_format((float) $this->amount, 2, '.', ''),
            'tax'          => number_format((float) $this->tax, 2, '.', ''),
            'net_amount'   => number_format($this->netAmount(), 2, '.', ''),
            'nome'         => $this->nome,
            'descricao'    => $this->descricao,
            'created_at'   => $this->created_at?->toIso8601String(),
            'confirmed_at' => $this->confirmed_at?->toIso8601String(),

            // QR code apenas na criacao (nao e persistido no banco)
            'qr_code'      => $this->when(
                $this->getAttribute('qr_code') !== null,
                $this->getAttribute('qr_code')
            ),
            'qr_code_text' => $this->when(
                $this->getAttribute('qr_code_text') !== null,
                $this->getAttribute('qr_code_text')
            ),
        ];
    }
}
