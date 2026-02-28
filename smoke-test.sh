#!/bin/bash
# =============================================================================
# Gateway de Pagamento JJ — Smoke Test Pré-Deploy
# Rodar em STAGING antes de qualquer deploy em produção
# Uso: bash smoke-test.sh https://staging.seusite.com
# =============================================================================

BASE_URL="${1:-https://staging.seusite.com}"
PASS=0
FAIL=0
WARN=0

green()  { echo -e "\033[32m✅ $1\033[0m"; ((PASS++)); }
red()    { echo -e "\033[31m❌ $1\033[0m"; ((FAIL++)); }
yellow() { echo -e "\033[33m⚠️  $1\033[0m"; ((WARN++)); }
header() { echo -e "\n\033[1;34m══ $1 ══\033[0m"; }

echo "🔐 Smoke Test de Segurança — $BASE_URL"
echo "Data: $(date)"

# ── 1. SSRF ──────────────────────────────────────────────────────────────────
header "SSRF Protection"

status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/pix/cashin" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VALID_TOKEN_AQUI" \
  -d '{"postback_url":"http://169.254.169.254/latest/meta-data","amount":100}')
[ "$status" = "422" ] && green "SSRF AWS metadata bloqueado (422)" || red "SSRF AWS metadata NÃO bloqueado (got $status)"

status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/pix/cashin" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VALID_TOKEN_AQUI" \
  -d '{"postback_url":"http://192.168.1.1/admin","amount":100}')
[ "$status" = "422" ] && green "SSRF RFC1918 bloqueado (422)" || red "SSRF RFC1918 NÃO bloqueado (got $status)"

status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/pix/cashin" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VALID_TOKEN_AQUI" \
  -d '{"postback_url":"http://localhost/secret","amount":100}')
[ "$status" = "422" ] && green "SSRF localhost bloqueado (422)" || red "SSRF localhost NÃO bloqueado (got $status)"

# ── 2. RATE LIMITING ─────────────────────────────────────────────────────────
header "Rate Limiting"

for i in $(seq 1 5); do
  curl -s -o /dev/null -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' &
done
wait
sleep 1

status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}')
[ "$status" = "429" ] && green "Brute force login bloqueado após 5 tentativas (429)" || red "Rate limit login NÃO funcionando (got $status)"

# ── 3. API KEY AUTH ───────────────────────────────────────────────────────────
header "API Key Authentication"

status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/merchant/transactions" \
  -H "X-Client-Id: qualquer-id-sem-secret" \
  -H "Content-Type: application/json")
[ "$status" = "401" ] && green "API key sem secret rejeitado (401)" || red "API key sem secret ACEITO (got $status — CRÍTICO)"

status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/merchant/transactions" \
  -H "X-Client-Id: qualquer-id" \
  -H "X-Client-Secret: secret-errado" \
  -H "Content-Type: application/json")
[ "$status" = "401" ] && green "API key com secret errado rejeitado (401)" || red "Secret errado ACEITO (got $status — CRÍTICO)"

# ── 4. WEBHOOK REPLAY ────────────────────────────────────────────────────────
header "Webhook Replay Protection"

PAYLOAD='{"event_id":"smoke-test-replay-001","status":"paid","amount":10000}'
TIMESTAMP_OLD=$(date -d "10 minutes ago" +%s 2>/dev/null || date -v-10M +%s)
SIG_OLD=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "webhook-secret-aqui" | awk '{print $2}')

status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/webhooks/pagpix" \
  -H "Content-Type: application/json" \
  -H "X-PagPix-Signature: $SIG_OLD" \
  -H "X-Webhook-Timestamp: $TIMESTAMP_OLD" \
  -d "$PAYLOAD")
[ "$status" = "400" ] || [ "$status" = "401" ] && green "Webhook com timestamp expirado rejeitado ($status)" || yellow "Webhook antigo: status $status (verificar manualmente)"

# ── 5. SESSION SECURITY ───────────────────────────────────────────────────────
header "Session & Cookie Security"

headers=$(curl -s -I "$BASE_URL/auth/login" 2>&1)

echo "$headers" | grep -qi "HttpOnly" && green "Cookie HttpOnly presente" || red "Cookie HttpOnly AUSENTE"
echo "$headers" | grep -qi "Secure" && green "Cookie Secure presente" || red "Cookie Secure AUSENTE (verificar se é HTTPS)"
echo "$headers" | grep -qi "SameSite" && green "Cookie SameSite presente" || yellow "Cookie SameSite ausente (recomendado)"

# ── 6. SECURITY HEADERS ───────────────────────────────────────────────────────
header "Security Headers"

headers=$(curl -s -I "$BASE_URL" 2>&1)

echo "$headers" | grep -qi "X-Frame-Options" && green "X-Frame-Options presente" || red "X-Frame-Options AUSENTE"
echo "$headers" | grep -qi "X-Content-Type-Options: nosniff" && green "X-Content-Type-Options: nosniff presente" || red "X-Content-Type-Options AUSENTE"
echo "$headers" | grep -qi "Strict-Transport-Security" && green "HSTS presente" || yellow "HSTS ausente (configurar no nginx/cloudflare)"
echo "$headers" | grep -qi "Content-Security-Policy" && green "CSP presente" || red "CSP AUSENTE"

# Garantir que APP_DEBUG não vaza
debug_leak=$(curl -s "$BASE_URL/rota-que-nao-existe-404" | grep -i "laravel\|stack trace\|exception\|vendor/")
[ -z "$debug_leak" ] && green "APP_DEBUG não vaza stack traces" || red "APP_DEBUG vazando informações de debug — CRÍTICO"

# ── 7. IDEMPOTENCY ────────────────────────────────────────────────────────────
header "Idempotency Key"

status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/pix/cashout" \
  -H "Authorization: Bearer VALID_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"amount":100}')
[ "$status" = "422" ] && green "Cashout sem Idempotency-Key rejeitado (422)" || red "Cashout sem Idempotency-Key ACEITO (got $status)"

# ── 8. MASS ASSIGNMENT ───────────────────────────────────────────────────────
header "Mass Assignment"

response=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Hacker Test",
    "email":"hacker-smoke-test@example.com",
    "password":"Password123!",
    "password_confirmation":"Password123!",
    "cpf":"529.982.247-25",
    "is_admin":true,
    "role":"admin",
    "balance":999999
  }')

echo "$response" | grep -qi '"is_admin":true' && red "Mass assignment is_admin ACEITO — CRÍTICO" || green "Mass assignment is_admin bloqueado"
echo "$response" | grep -qi '"role":"admin"' && red "Mass assignment role=admin ACEITO — CRÍTICO" || green "Mass assignment role=admin bloqueado"

# ── RESULTADO FINAL ───────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════"
echo "  RESULTADO: ✅ $PASS passou | ❌ $FAIL falhou | ⚠️  $WARN avisos"
echo "════════════════════════════════════════"

if [ $FAIL -gt 0 ]; then
  echo "🚨 NÃO fazer deploy — $FAIL verificações críticas falharam"
  exit 1
elif [ $WARN -gt 0 ]; then
  echo "⚠️  Deploy possível mas revisar os $WARN avisos antes"
  exit 0
else
  echo "🚀 Todos os checks passaram — seguro para deploy"
  exit 0
fi
