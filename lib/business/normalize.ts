// Business normalization helpers

export function parseServiceAreas(input: unknown, fallback?: string): string[] {
  try {
    if (Array.isArray(input)) {
      // Ensure all strings
      return (input as unknown[]).map(String).filter(Boolean)
    }
    if (typeof input === 'string') {
      const trimmed = input.trim()
      if (!trimmed) return fallback ? [fallback] : []
      // Try JSON parse first
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean)
      }
      return [trimmed]
    }
    // Unknown type
    return fallback ? [fallback] : []
  } catch {
    return fallback ? [fallback] : []
  }
}
