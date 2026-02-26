<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CashInRequest extends FormRequest
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
            'valor'     => ['required', 'numeric', 'min:0.01', 'max:999999.99'],
            'descricao' => ['nullable', 'string', 'max:255'],
            'postback'  => ['nullable', 'url', 'max:500'],
            'split'     => ['nullable', 'array', 'max:10'],
            'split.*.user_id'    => ['required_with:split', 'integer', 'exists:users,id'],
            'split.*.percentage' => ['required_with:split', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'valor.required' => 'O valor e obrigatorio.',
            'valor.numeric'  => 'O valor deve ser numerico.',
            'valor.min'      => 'O valor minimo e R$ 0,01.',
            'cpf.required'   => 'O documento e obrigatorio.',
            'nome.required'  => 'O nome do pagador e obrigatorio.',
        ];
    }
}
