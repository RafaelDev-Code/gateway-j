<?php

namespace App\Exceptions;

use RuntimeException;

class AcquirerException extends RuntimeException
{
    public function render(): array
    {
        return ['message' => 'Erro ao processar pagamento. Tente novamente.'];
    }
}
