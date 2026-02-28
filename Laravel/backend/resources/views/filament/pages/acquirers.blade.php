<x-filament-panels::page>

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        @foreach ($this->getAcquirerStats() as $acq)
            <div class="fi-card rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <p class="text-lg font-semibold text-gray-950 dark:text-white">{{ $acq['name'] }}</p>
                        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {{ $acq['user_count'] }} merchant(s) usando
                        </p>
                    </div>
                    <span @class([
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' => $acq['active'],
                        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'     => ! $acq['active'],
                    ])>
                        {{ $acq['active'] ? 'Ativa' : 'Inativa' }}
                    </span>
                </div>
                <div class="mt-4 text-xs text-gray-400">
                    Configurada via <code class="font-mono">.env</code>
                </div>
            </div>
        @endforeach
    </div>

    <div class="mt-8">
        <div class="fi-section rounded-xl bg-white shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10 p-6">
            <h2 class="text-base font-semibold text-gray-950 dark:text-white mb-1">Como configurar adquirentes</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                As adquirentes são configuradas via variáveis de ambiente no arquivo <code>.env</code> do servidor.
                Para ativar uma adquirente, defina <code>_ACTIVE=true</code> e preencha as credenciais correspondentes.
            </p>
            <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 dark:border-gray-700">
                            <th class="py-2 pr-4 text-left font-medium text-gray-700 dark:text-gray-300">Adquirente</th>
                            <th class="py-2 pr-4 text-left font-medium text-gray-700 dark:text-gray-300">Variável de ativação</th>
                            <th class="py-2 text-left font-medium text-gray-700 dark:text-gray-300">Credenciais necessárias</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                        <tr><td class="py-2 pr-4 text-gray-900 dark:text-gray-100">PagPix</td><td class="py-2 pr-4 font-mono text-xs text-gray-500">PAGPIX_ACTIVE=true</td><td class="py-2 text-xs text-gray-500 font-mono">PAGPIX_URL, PAGPIX_KEY</td></tr>
                        <tr><td class="py-2 pr-4 text-gray-900 dark:text-gray-100">RapDyn</td><td class="py-2 pr-4 font-mono text-xs text-gray-500">RAPDYN_ACTIVE=true</td><td class="py-2 text-xs text-gray-500 font-mono">RAPDYN_URL, RAPDYN_KEY</td></tr>
                        <tr><td class="py-2 pr-4 text-gray-900 dark:text-gray-100">WiteTec</td><td class="py-2 pr-4 font-mono text-xs text-gray-500">WITETEC_ACTIVE=true</td><td class="py-2 text-xs text-gray-500 font-mono">WITETEC_URL, WITETEC_SECRET_KEY, WITETEC_MERCHANT_EMAIL, WITETEC_MERCHANT_PASSWORD</td></tr>
                        <tr><td class="py-2 pr-4 text-gray-900 dark:text-gray-100">Strike</td><td class="py-2 pr-4 font-mono text-xs text-gray-500">STRIKE_ACTIVE=true</td><td class="py-2 text-xs text-gray-500 font-mono">STRIKE_URL, STRIKE_PUBLIC_KEY, STRIKE_SECRET_KEY</td></tr>
                        <tr><td class="py-2 pr-4 text-gray-900 dark:text-gray-100">Versell Pay</td><td class="py-2 pr-4 font-mono text-xs text-gray-500">VERSELL_ACTIVE=true</td><td class="py-2 text-xs text-gray-500 font-mono">VERSELL_URL, VERSELL_CLIENT_ID, VERSELL_SECRET</td></tr>
                        <tr><td class="py-2 pr-4 text-gray-900 dark:text-gray-100">BSPay</td><td class="py-2 pr-4 font-mono text-xs text-gray-500">BSPAY_ACTIVE=true</td><td class="py-2 text-xs text-gray-500 font-mono">BSPAY_URL, BSPAY_CLIENT_ID, BSPAY_CLIENT_SECRET</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

</x-filament-panels::page>
