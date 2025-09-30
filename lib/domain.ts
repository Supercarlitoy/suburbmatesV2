// Shared domain single source of truth
// Re-export Prisma enums and provide UI-friendly labels and helpers

export { BusinessSource, AbnStatus, ApprovalStatus } from '@prisma/client'

import type { BusinessSource as _BusinessSource, AbnStatus as _AbnStatus } from '@prisma/client'

export const SOURCE_LABELS: Record<_BusinessSource, string> = {
  MANUAL: 'Manual',
  CSV: 'CSV import',
  CSV_IMPORT: 'CSV Import',
  AUTO_ENRICH: 'Auto-enriched',
  CLAIMED: 'Claimed',
}

export const isAbnVerified = (s: _AbnStatus) => s === 'VERIFIED'
export const isApproved = (s: import('@prisma/client').ApprovalStatus) => s === 'APPROVED'
