<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CashOutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nome'      => ['required', 'string', 'max:100'],
            'cpf'       => ['required', 'string', 'max:18'],
            'key'       => ['required', 'string', 'max:255'], // Chave PIX
            'valor'     => ['required', 'numeric', 'min:0.01', 'max:999999.99'],
            'descricao' => ['nullable', 'string', 'max:255'],
            'pin'       => ['required', 'string', 'max:10'],
            'postback'  => ['nullable', 'url', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'key.required'   => 'A chave PIX e obrigatoria.',
            'pin.required'   => 'O PIN e obrigatorio.',
            'valor.required' => 'O valor e obrigatorio.',
        ];
    }
}
