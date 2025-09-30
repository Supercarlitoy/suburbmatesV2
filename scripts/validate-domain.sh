#!/usr/bin/env bash
set -euo pipefail

RED="\033[31m"; GREEN="\033[32m"; YELLOW="\033[33m"; NC="\033[0m"
FAIL=0

# Helpers
err() { echo -e "${RED}✖ $1${NC}"; FAIL=1; }
ok() { echo -e "${GREEN}✔ $1${NC}"; }

# Paths to include/exclude
INCLUDE_DIRS=("app" "lib" "features" "server" "scripts")
EXCLUDE_DIRS=("node_modules" "prisma/migrations" "tests" "docs" ".backup-docs-*")

# Build grep excludes
EXCLUDES=()
for d in "${EXCLUDE_DIRS[@]}"; do EXCLUDES+=(--exclude-dir="$d"); done

# 1) Forbid legacy BusinessSource strings in code
if grep -R -nE "USER_CREATED|ADMIN_IMPORTED|API_SCRAPED|COMMUNITY_ADDED" "${INCLUDE_DIRS[@]}" "${EXCLUDES[@]}" --exclude="*.md" --exclude="scripts/validate-domain.sh" >/dev/null; then
  err "Found legacy BusinessSource string literals (use BusinessSource enum + SOURCE_LABELS)."
else
  ok "No legacy BusinessSource strings found."
fi

# 2) Forbid supabase.from('users').select('role') in admin API routes
if grep -R -nE "from\('users'\).*select\('role'\)" app/api/admin "${EXCLUDES[@]}" >/dev/null 2>&1; then
  err "Found supabase.from('users').select('role') in admin API (use checkAdminAccess)."
else
  ok "Admin role checks standardized."
fi

# 3) Forbid direct prisma.auditLog.create outside logging utility
if grep -R -nE "prisma\.auditLog\.create\(" "${INCLUDE_DIRS[@]}" "${EXCLUDES[@]}" --exclude="lib/utils/audit.ts" --exclude="scripts/directory-cli.ts" >/dev/null; then
  err "Found direct prisma.auditLog.create outside lib/utils/audit.ts (use logAuditEvent)."
else
  ok "Audit logging centralized."
fi

# 4) Warn on direct business.verified usage (should be derived)
if grep -R -nE "business\.verified\b" app lib features "${EXCLUDES[@]}" --exclude="*.md" >/dev/null; then
  err "Found direct '.verified' access (use isAbnVerified(abnStatus))."
else
  ok "No direct '.verified' access in app/lib/features."
fi

# 5) Legacy status checks (status='APPROVED') — soft warning only
if grep -R -nE "\bstatus[[:space:]]*[:=][[:space:]]*'APPROVED'" app lib features "${EXCLUDES[@]}" --exclude="*.md" --exclude="scripts/validate-domain.sh" >/dev/null; then
  echo -e "${YELLOW}⚠ Found potential legacy status='APPROVED' checks. Please prefer approvalStatus. (Non-blocking)${NC}"
else
  ok "No legacy 'status' approval checks."
fi

if [ $FAIL -eq 1 ]; then
  exit 1
else
  echo -e "${YELLOW}Domain validation passed.${NC}"
fi
