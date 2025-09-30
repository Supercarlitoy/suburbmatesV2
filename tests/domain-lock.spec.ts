import { AbnStatus, BusinessSource } from '@prisma/client'
import { SOURCE_LABELS, isAbnVerified } from '@/lib/domain'

describe('domain lock: SOURCE_LABELS coverage', () => {
  it('has a label for every BusinessSource enum value', () => {
    const enumValues = Object.keys(BusinessSource) as (keyof typeof BusinessSource)[]
    for (const key of enumValues) {
      const value = BusinessSource[key]
      expect(SOURCE_LABELS).toHaveProperty(value)
      expect(typeof SOURCE_LABELS[value]).toBe('string')
      expect(SOURCE_LABELS[value].length).toBeGreaterThan(0)
    }
  })

  it('ABN verification helper semantics are unchanged', () => {
    expect(isAbnVerified(AbnStatus.NOT_PROVIDED)).toBe(false)
    expect(isAbnVerified(AbnStatus.PENDING)).toBe(false)
    expect(isAbnVerified(AbnStatus.INVALID)).toBe(false)
    expect(isAbnVerified(AbnStatus.EXPIRED)).toBe(false)
    expect(isAbnVerified(AbnStatus.VERIFIED)).toBe(true)
  })
})
