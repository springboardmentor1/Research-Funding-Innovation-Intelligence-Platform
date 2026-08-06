#!/bin/sh
# Milestone 4 end-to-end smoke test. POSIX-sh compatible (works with macOS's stock
# bash 3.2 too, which doesn't support associative arrays).
# Usage: ./verify_milestone4.sh [base_url]

BASE_URL="${1:-http://127.0.0.1:8000}"
STAMP=$(date +%s)
PASS=0
FAIL=0
TMPDIR=$(mktemp -d)

pass() { echo "  PASS  $1"; PASS=$((PASS+1)); }
fail() { echo "  FAIL  $1"; FAIL=$((FAIL+1)); }

json_get() {
  python3 -c "import sys,json; d=json.loads(sys.argv[1]); print(d.get(sys.argv[2],''))" "$1" "$2" 2>/dev/null
}

echo "=== Milestone 4 Verification against $BASE_URL ==="
echo

echo "[1/10] Health check"
HEALTH=$(curl -s "$BASE_URL/api/health")
if echo "$HEALTH" | grep -q '"milestone":4'; then pass "backend reports milestone 4"; else fail "backend health check ($HEALTH)"; fi
echo

echo "[2/10] Register test users (unique per run)"
EMAIL_RESEARCHER="researcher_${STAMP}@test.com"
EMAIL_FOUNDER="founder_${STAMP}@test.com"
EMAIL_MANAGER="manager_${STAMP}@test.com"
EMAIL_ADMIN="admin_${STAMP}@test.com"

register() {
  role="$1"; email="$2"
  RESP=$(curl -s -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"testpass123\",\"full_name\":\"Test $role\",\"role\":\"$role\"}")
  if echo "$RESP" | grep -q "$email"; then pass "registered $role"; else fail "register $role ($RESP)"; fi
}
register researcher "$EMAIL_RESEARCHER"
register startup_founder "$EMAIL_FOUNDER"
register innovation_manager "$EMAIL_MANAGER"
register administrator "$EMAIL_ADMIN"
echo

echo "[3/10] Login and collect tokens"
login() {
  email="$1"
  curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=$email&password=testpass123"
}
RESP=$(login "$EMAIL_RESEARCHER"); TOKEN_RESEARCHER=$(json_get "$RESP" "access_token")
if [ -n "$TOKEN_RESEARCHER" ]; then pass "login researcher"; else fail "login researcher ($RESP)"; fi
RESP=$(login "$EMAIL_FOUNDER"); TOKEN_FOUNDER=$(json_get "$RESP" "access_token")
if [ -n "$TOKEN_FOUNDER" ]; then pass "login startup_founder"; else fail "login startup_founder ($RESP)"; fi
RESP=$(login "$EMAIL_MANAGER"); TOKEN_MANAGER=$(json_get "$RESP" "access_token")
if [ -n "$TOKEN_MANAGER" ]; then pass "login innovation_manager"; else fail "login innovation_manager ($RESP)"; fi
RESP=$(login "$EMAIL_ADMIN"); TOKEN_ADMIN=$(json_get "$RESP" "access_token")
if [ -n "$TOKEN_ADMIN" ]; then pass "login administrator"; else fail "login administrator ($RESP)"; fi
echo

RESEARCHER_AUTH="Authorization: Bearer $TOKEN_RESEARCHER"
FOUNDER_AUTH="Authorization: Bearer $TOKEN_FOUNDER"
MANAGER_AUTH="Authorization: Bearer $TOKEN_MANAGER"
ADMIN_AUTH="Authorization: Bearer $TOKEN_ADMIN"

echo "[4/10] Update researcher profile"
RESP=$(curl -s -X PUT "$BASE_URL/api/profile/me" -H "$RESEARCHER_AUTH" -H "Content-Type: application/json" \
  -d '{"research_domains":["NLP"],"keywords":["transformers"],"organization":"Smoke Test"}')
if echo "$RESP" | grep -q '"NLP"'; then pass "researcher profile updated"; else fail "profile update ($RESP)"; fi
echo

echo "[5/10] Admin creates funding opportunity and patent"
RESP=$(curl -s -X POST "$BASE_URL/api/funding/opportunities" -H "$ADMIN_AUTH" -H "Content-Type: application/json" \
  -d "{\"title\":\"Smoke Test Grant $STAMP\",\"source\":\"Test\",\"source_category\":\"Government Grants\",\"eligible_domains\":[\"NLP\"],\"eligible_keywords\":[\"transformers\"],\"eligible_roles\":[\"researcher\"]}")
if echo "$RESP" | grep -q "Smoke Test Grant"; then pass "funding opportunity created"; else fail "funding create ($RESP)"; fi

RESP=$(curl -s -X POST "$BASE_URL/api/patents/" -H "$ADMIN_AUTH" -H "Content-Type: application/json" \
  -d "{\"title\":\"Smoke Test Patent $STAMP\",\"assignee\":\"Test Corp\",\"filing_date\":\"2024-01-01\",\"technology_domain\":[\"NLP\"],\"citation_count\":10,\"source\":\"manual\"}")
if echo "$RESP" | grep -q "Smoke Test Patent"; then pass "patent created"; else fail "patent create ($RESP)"; fi

RESP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/funding/opportunities" -H "$RESEARCHER_AUTH" -H "Content-Type: application/json" \
  -d '{"title":"x","source":"y","source_category":"z"}')
if [ "$RESP" = "403" ]; then pass "non-admin blocked from creating funding (403)"; else fail "RBAC check returned $RESP, expected 403"; fi
echo

echo "[6/10] Dashboards"
check_dashboard() {
  name="$1"; url="$2"; auth="$3"
  CODE=$(curl -s --max-time 30 -o "$TMPDIR/${name}.json" -w "%{http_code}" "$url" -H "$auth")
  if [ "$CODE" = "200" ]; then pass "$name dashboard (200)"; else fail "$name dashboard returned $CODE"; fi
}
check_dashboard researcher "$BASE_URL/api/dashboard/researcher" "$RESEARCHER_AUTH"
check_dashboard startup "$BASE_URL/api/dashboard/startup" "$FOUNDER_AUTH"
check_dashboard innovation "$BASE_URL/api/dashboard/innovation" "$RESEARCHER_AUTH"

CODE=$(curl -s -o "$TMPDIR/manager.json" -w "%{http_code}" "$BASE_URL/api/dashboard/innovation-manager" -H "$MANAGER_AUTH")
if [ "$CODE" = "200" ]; then pass "innovation-manager dashboard (200)"; else fail "manager dashboard returned $CODE"; fi

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/dashboard/innovation-manager" -H "$RESEARCHER_AUTH")
if [ "$CODE" = "403" ]; then pass "researcher blocked from manager dashboard (403)"; else fail "manager RBAC returned $CODE, expected 403"; fi
echo

echo "[7/10] Admin endpoints"
CODE=$(curl -s -o "$TMPDIR/stats.json" -w "%{http_code}" "$BASE_URL/api/admin/platform-stats" -H "$ADMIN_AUTH")
if [ "$CODE" = "200" ]; then pass "admin platform-stats (200)"; else fail "platform-stats returned $CODE"; fi

CODE=$(curl -s -o "$TMPDIR/users.json" -w "%{http_code}" "$BASE_URL/api/admin/users" -H "$ADMIN_AUTH")
USER_COUNT=$(python3 -c "import json; print(len(json.load(open('$TMPDIR/users.json'))))" 2>/dev/null || echo 0)
if [ "$CODE" = "200" ] && [ "$USER_COUNT" -ge 4 ]; then pass "admin users list (200, $USER_COUNT users)"; else fail "users list returned $CODE, count=$USER_COUNT"; fi

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/admin/platform-stats" -H "$RESEARCHER_AUTH")
if [ "$CODE" = "403" ]; then pass "researcher blocked from admin (403)"; else fail "admin RBAC returned $CODE, expected 403"; fi
echo

echo "[8/10] Notifications"
CODE=$(curl -s -o "$TMPDIR/alerts.json" -w "%{http_code}" "$BASE_URL/api/notifications/alerts" -H "$RESEARCHER_AUTH")
if [ "$CODE" = "200" ]; then pass "alerts endpoint (200)"; else fail "alerts returned $CODE"; fi
echo

echo "[9/10] Reports and export"
curl -s -o "$TMPDIR/funding.csv" -D "$TMPDIR/funding_headers.txt" "$BASE_URL/api/reports/funding.csv" -H "$RESEARCHER_AUTH"
SIZE=$(wc -c < "$TMPDIR/funding.csv" | tr -d ' ')
if grep -qi "text/csv" "$TMPDIR/funding_headers.txt" && [ "$SIZE" -gt 20 ]; then pass "funding.csv downloaded ($SIZE bytes)"; else fail "funding.csv invalid (size=$SIZE)"; fi

curl -s -o "$TMPDIR/patents.csv" -D "$TMPDIR/patents_headers.txt" "$BASE_URL/api/reports/patents.csv" -H "$RESEARCHER_AUTH"
SIZE=$(wc -c < "$TMPDIR/patents.csv" | tr -d ' ')
if grep -qi "text/csv" "$TMPDIR/patents_headers.txt" && [ "$SIZE" -gt 20 ]; then pass "patents.csv downloaded ($SIZE bytes)"; else fail "patents.csv invalid (size=$SIZE)"; fi

curl -s -o "$TMPDIR/innovation.pdf" -D "$TMPDIR/pdf_headers.txt" "$BASE_URL/api/reports/innovation.pdf" -H "$RESEARCHER_AUTH"
SIZE=$(wc -c < "$TMPDIR/innovation.pdf" | tr -d ' ')
if grep -qi "application/pdf" "$TMPDIR/pdf_headers.txt" && [ "$SIZE" -gt 100 ]; then pass "innovation.pdf downloaded ($SIZE bytes)"; else fail "innovation.pdf invalid (size=$SIZE)"; fi
echo

echo "[10/10] Admin deactivate/activate flow"
FOUNDER_ID=$(python3 -c "
import json
users = json.load(open('$TMPDIR/users.json'))
for u in users:
    if u['email'] == '$EMAIL_FOUNDER':
        print(u['id'])
        break
")
if [ -n "$FOUNDER_ID" ]; then
  curl -s -o /dev/null -X PATCH "$BASE_URL/api/admin/users/$FOUNDER_ID/deactivate" -H "$ADMIN_AUTH"
  LOGIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=$EMAIL_FOUNDER&password=testpass123")
  if [ "$LOGIN_CODE" = "401" ]; then pass "deactivated user blocked from login (401)"; else fail "deactivated login returned $LOGIN_CODE, expected 401"; fi

  curl -s -o /dev/null -X PATCH "$BASE_URL/api/admin/users/$FOUNDER_ID/activate" -H "$ADMIN_AUTH"
  LOGIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=$EMAIL_FOUNDER&password=testpass123")
  if [ "$LOGIN_CODE" = "200" ]; then pass "reactivated user can log in again (200)"; else fail "reactivated login returned $LOGIN_CODE, expected 200"; fi
else
  fail "could not find founder user id to test deactivate/activate"
fi
echo

echo "=== Results: $PASS passed, $FAIL failed ==="
echo "(Downloaded report files kept at: $TMPDIR)"
if [ "$FAIL" -eq 0 ]; then
  echo "All checks passed. Milestone 4 backend workflow verified end-to-end."
  exit 0
else
  echo "Some checks failed - see above for details."
  exit 1
fi
