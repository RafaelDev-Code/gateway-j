<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\DocumentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\DocumentUploadRequest;
use App\Models\AuditLog;
use App\Models\UserDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    private const ALLOWED_MIMES = [
        'image/jpeg',
        'image/png',
        'application/pdf',
    ];

    private const MAX_PER_TYPE = 2;

    public function index(Request $request): JsonResponse
    {
        $documents = UserDocument::where('user_id', $request->user()->id)
            ->select(['id', 'type', 'status', 'rejection_reason', 'created_at', 'updated_at'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $documents]);
    }

    public function store(DocumentUploadRequest $request): JsonResponse
    {
        $user = $request->user();
        $file = $request->file('file');
        $type = $request->input('type');

        $realMime = $this->getRealMime($file->getRealPath());
        if (! in_array($realMime, self::ALLOWED_MIMES, true)) {
            return response()->json([
                'message' => 'Tipo de arquivo invalido. Apenas imagens JPEG, PNG ou PDF sao aceitos.',
                'error'   => 'INVALID_MIME_TYPE',
            ], 422);
        }

        $existing = UserDocument::where('user_id', $user->id)
            ->where('type', $type)
            ->where('status', '!=', DocumentStatus::REJECTED->value)
            ->count();

        if ($existing >= self::MAX_PER_TYPE) {
            return response()->json([
                'message' => "Voce ja possui o maximo de documentos do tipo {$type}.",
                'error'   => 'DOCUMENT_LIMIT_REACHED',
            ], 422);
        }

        $extension = match ($realMime) {
            'image/jpeg'       => 'jpg',
            'image/png'        => 'png',
            'application/pdf'  => 'pdf',
            default            => 'bin',
        };

        $fileHash    = hash_file('sha256', $file->getRealPath());
        $storedName  = Str::uuid()->toString() . '.' . $extension;
        $storagePath = "documents/{$user->id}/{$storedName}";

        Storage::disk('private')->put($storagePath, file_get_contents($file->getRealPath()));

        // forceFill para incluir status (campo protegido via $fillable)
        $document = (new UserDocument())->forceFill([
            'user_id'          => $user->id,
            'type'             => $type,
            'file_path'        => $storagePath,
            'file_hash'        => $fileHash,
            'mime_type'        => $realMime,
            'file_size'        => $file->getSize(),
            'status'           => DocumentStatus::PENDING,
            'rejection_reason' => null,
        ]);
        $document->save();

        AuditLog::create([
            'user_id'    => $user->id,
            'action'     => 'document.upload',
            'model_type' => UserDocument::class,
            'model_id'   => $document->id,
            'context'    => ['type' => $type, 'mime' => $realMime, 'hash' => $fileHash],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Documento enviado com sucesso. Aguarde a analise.',
            'data'    => [
                'id'         => $document->id,
                'type'       => $document->type,
                'status'     => $document->status,
                'created_at' => $document->created_at,
            ],
        ], 201);
    }

    private function getRealMime(string $path): string
    {
        if (! function_exists('finfo_open')) {
            return mime_content_type($path) ?: 'application/octet-stream';
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime  = finfo_file($finfo, $path);
        finfo_close($finfo);

        return $mime ?: 'application/octet-stream';
    }
}
