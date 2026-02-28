<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BalanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            // balance convertido de centavos para reais na boundary da API
            'balance'          => bcdiv((string) (int) $this->balance, '100', 2),
            'cash_in_active'   => $this->cash_in_active,
            'cash_out_active'  => $this->cash_out_active,
            'documents_checked'=> $this->documents_checked,
        ];
    }
}
