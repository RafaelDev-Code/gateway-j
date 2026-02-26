<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => ['required', 'string', 'max:50'],
            'valor'    => ['required', 'numeric', 'min:0.01', 'max:999999.99'],
            'pin'      => ['required', 'string', 'max:10'],
        ];
    }
}
