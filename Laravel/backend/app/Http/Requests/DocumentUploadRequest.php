<?php

namespace App\Http\Requests;

use App\Enums\DocumentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class DocumentUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'string', 'in:RG_FRENTE,RG_VERSO,CNH,CNPJ,SELFIE,COMPROVANTE'],
            'file' => [
                'required',
                'file',
                'max:10240',
                'mimes:jpg,jpeg,png,pdf',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'type.required'  => 'O tipo de documento e obrigatorio.',
            'type.in'        => 'Tipo de documento invalido. Use: RG_FRENTE, RG_VERSO, CNH, CNPJ, SELFIE ou COMPROVANTE.',
            'file.required'  => 'O arquivo e obrigatorio.',
            'file.max'       => 'O arquivo nao pode ultrapassar 10MB.',
            'file.mimes'     => 'Apenas arquivos JPG, PNG ou PDF sao aceitos.',
        ];
    }
}
