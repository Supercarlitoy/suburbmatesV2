/**
 * Content Moderation Utilities
 * 
 * Provides spam detection, profanity filtering, and content quality
 * assessment for user-submitted content.
 */

/**
 * Basic profanity word list (sample - should be comprehensive)
 * In production, consider using a service like Perspective API
 */
const PROFANITY_WORDS = [
  // Basic profanity (sample list)
  'damn', 'hell', 'crap', 'shit', 'fuck', 'bitch', 'asshole',
  // Add more words as needed, or use external profanity filter service
];

/**
 * Disposable email domains to block
 */
const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
  'tempmail.org', 'throwaway.email', 'temp-mail.org',
  'getnada.com', 'maildrop.cc', 'sharklasers.com',
  // Add more disposable domains
];

/**
 * Spam indicators and patterns
 */
const SPAM_PATTERNS = [
  // External URLs (too many links)
  /(https?:\/\/[^\s]+)/gi,
  
  // Common spam phrases
  /\b(click here|act now|limited time|free money|make money|work from home)\b/gi,
  
  // Excessive capitalization
  /\b[A-Z]{4,}\b/g,
  
  // Excessive exclamation marks
  /!{3,}/g,
  
  // Phone number patterns (suspicious if too many)
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  
  // Email patterns (suspicious if too many)
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
];

/**
 * Content moderation result
 */
export interface ModerationResult {
  isAllowed: boolean;       // Whether content should be allowed
  confidence: number;       // Confidence score (0-1)
  reasons: string[];        // Reasons for blocking/flagging
  flags: {
    hasProfanity: boolean;
    isSpam: boolean;
    hasExcessiveLinks: boolean;
    isLowQuality: boolean;
    hasDisposableEmail: boolean;
  };
  suggestedAction: 'allow' | 'flag' | 'block';
}

/**
 * Check for profanity in text
 */
function checkProfanity(text: string): { found: boolean; count: number; words: string[] } {
  const lowerText = text.toLowerCase();
  const foundWords: string[] = [];
  
  for (const word of PROFANITY_WORDS) {
    if (lowerText.includes(word.toLowerCase())) {
      foundWords.push(word);
    }
  }
  
  return {
    found: foundWords.length > 0,
    count: foundWords.length,
    words: foundWords,
  };
}

/**
 * Check if email is from disposable domain
 */
function isDisposableEmail(email: string): boolean {
  if (!email) return false;
  
  const domain = email.toLowerCase().split('@')[1];
  return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
}

/**
 * Analyze content for spam indicators
 */
function analyzeSpamContent(text: string): {
  score: number;
  indicators: string[];
  linkCount: number;
} {
  let score = 0;
  const indicators: string[] = [];
  let linkCount = 0;
  
  // Check for URLs
  const urlMatches = text.match(SPAM_PATTERNS[0]) || [];
  linkCount = urlMatches.length;
  if (linkCount > 2) {
    score += 0.4;
    indicators.push(`Too many links (${linkCount})`);
  }
  
  // Check for spam phrases
  for (let i = 1; i < SPAM_PATTERNS.length; i++) {
    const pattern = SPAM_PATTERNS[i];
    const matches = text.match(pattern) || [];
    if (matches.length > 0) {
      score += 0.2 * matches.length;
      indicators.push(`Spam pattern: ${pattern.source}`);
    }
  }
  
  // Check text quality indicators
  const wordCount = text.split(/\s+/).length;
  const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;
  const uniqueRatio = uniqueWords / wordCount;
  
  if (uniqueRatio < 0.3 && wordCount > 20) {
    score += 0.3;
    indicators.push('Low word uniqueness (possible spam)');
  }
  
  // Check for excessive repetition
  const sentences = text.split(/[.!?]+/);
  if (sentences.length > 3) {
    const duplicateSentences = sentences.length - new Set(sentences).size;
    if (duplicateSentences > 1) {
      score += 0.2;
      indicators.push('Duplicate sentences detected');
    }
  }
  
  return { score: Math.min(score, 1), indicators, linkCount };
}

/**
 * Assess content quality
 */
function assessContentQuality(text: string): {
  score: number;
  issues: string[];
} {
  let score = 1.0; // Start with perfect score
  const issues: string[] = [];
  
  // Length check
  if (text.length < 10) {
    score -= 0.3;
    issues.push('Content too short');
  } else if (text.length > 5000) {
    score -= 0.2;
    issues.push('Content too long');
  }
  
  // Grammar and formatting check (basic)
  const hasProperCapitalization = /^[A-Z]/.test(text.trim());
  if (!hasProperCapitalization) {
    score -= 0.1;
    issues.push('Missing proper capitalization');
  }
  
  // Check for excessive punctuation
  const punctuationRatio = (text.match(/[!?.,;:]/g) || []).length / text.length;
  if (punctuationRatio > 0.1) {
    score -= 0.2;
    issues.push('Excessive punctuation');
  }
  
  // Check for coherent sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = text.split(/\s+/).length / sentences.length;
  
  if (avgWordsPerSentence < 3) {
    score -= 0.2;
    issues.push('Very short sentences (possible low quality)');
  } else if (avgWordsPerSentence > 50) {
    score -= 0.1;
    issues.push('Very long sentences (possible low quality)');
  }
  
  return { score: Math.max(score, 0), issues };
}

/**
 * Moderate business description content
 */
export function moderateBusinessContent(content: {
  name?: string;
  description?: string;
  email?: string;
  website?: string;
  services?: string[];
}): ModerationResult {
  const reasons: string[] = [];
  let confidence = 0.8;
  let isAllowed = true;
  
  // Combine all text content
  const allText = [
    content.name || '',
    content.description || '',
    ...(content.services || []),
  ].join(' ');
  
  // Check profanity
  const profanityCheck = checkProfanity(allText);
  const hasProfanity = profanityCheck.found;
  if (hasProfanity) {
    reasons.push(`Profanity detected: ${profanityCheck.words.join(', ')}`);
    confidence = Math.max(confidence, 0.9);
    isAllowed = false;
  }
  
  // Check for disposable email
  const hasDisposableEmail = content.email ? isDisposableEmail(content.email) : false;
  if (hasDisposableEmail) {
    reasons.push('Disposable email domain detected');
    confidence = Math.max(confidence, 0.7);
  }
  
  // Spam analysis
  const spamAnalysis = analyzeSpamContent(allText);
  const isSpam = spamAnalysis.score > 0.6;
  if (isSpam) {
    reasons.push(...spamAnalysis.indicators);
    confidence = Math.max(confidence, 0.8);
    isAllowed = false;
  }
  
  // Quality assessment
  const qualityCheck = assessContentQuality(allText);
  const isLowQuality = qualityCheck.score < 0.4;
  if (isLowQuality) {
    reasons.push(...qualityCheck.issues);
    confidence = Math.max(confidence, 0.6);
  }
  
  // Link analysis
  const hasExcessiveLinks = spamAnalysis.linkCount > 3;
  if (hasExcessiveLinks) {
    reasons.push(`Too many external links (${spamAnalysis.linkCount})`);
    confidence = Math.max(confidence, 0.7);
  }
  
  // Determine suggested action
  let suggestedAction: 'allow' | 'flag' | 'block' = 'allow';
  
  if (hasProfanity || isSpam) {
    suggestedAction = 'block';
    isAllowed = false;
  } else if (hasDisposableEmail || hasExcessiveLinks || isLowQuality) {
    suggestedAction = 'flag';
  }
  
  return {
    isAllowed: suggestedAction !== 'block',
    confidence,
    reasons,
    flags: {
      hasProfanity,
      isSpam,
      hasExcessiveLinks,
      isLowQuality,
      hasDisposableEmail,
    },
    suggestedAction,
  };
}

/**
 * Moderate inquiry/lead form content
 */
export function moderateInquiryContent(content: {
  name: string;
  email?: string;
  message: string;
}): ModerationResult {
  const reasons: string[] = [];
  let confidence = 0.8;
  let isAllowed = true;
  
  const allText = `${content.name} ${content.message}`;
  
  // Check profanity
  const profanityCheck = checkProfanity(allText);
  const hasProfanity = profanityCheck.found;
  if (hasProfanity) {
    reasons.push(`Inappropriate language detected`);
    confidence = Math.max(confidence, 0.9);
    isAllowed = false;
  }
  
  // Check for disposable email
  const hasDisposableEmail = content.email ? isDisposableEmail(content.email) : false;
  if (hasDisposableEmail) {
    reasons.push('Suspicious email domain');
    confidence = Math.max(confidence, 0.6);
  }
  
  // Spam analysis (more lenient for inquiries)
  const spamAnalysis = analyzeSpamContent(allText);
  const isSpam = spamAnalysis.score > 0.8; // Higher threshold for inquiries
  if (isSpam) {
    reasons.push('Possible spam content');
    confidence = Math.max(confidence, 0.8);
    isAllowed = false;
  }
  
  // Quality check
  if (content.message.length < 5) {
    reasons.push('Message too short');
    confidence = Math.max(confidence, 0.5);
  }
  
  // Determine action
  let suggestedAction: 'allow' | 'flag' | 'block' = 'allow';
  
  if (hasProfanity || isSpam) {
    suggestedAction = 'block';
    isAllowed = false;
  } else if (hasDisposableEmail || content.message.length < 5) {
    suggestedAction = 'flag';
  }
  
  return {
    isAllowed,
    confidence,
    reasons,
    flags: {
      hasProfanity,
      isSpam,
      hasExcessiveLinks: spamAnalysis.linkCount > 1,
      isLowQuality: content.message.length < 10,
      hasDisposableEmail,
    },
    suggestedAction,
  };
}

/**
 * Simple text cleaning (remove potential XSS, normalize whitespace)
 */
export function cleanText(text: string): string {
  if (!text) return '';
  
  return text
    // Remove potential HTML/script tags
    .replace(/<[^>]*>/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Trim
    .trim()
    // Limit length (prevent abuse)
    .substring(0, 10000);
}

/**
 * Validate Australian business details
 */
export function validateAustralianBusiness(business: {
  name: string;
  suburb: string;
  phone?: string;
  abn?: string;
}): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Validate business name
  if (!business.name || business.name.length < 2) {
    issues.push('Business name too short');
  } else if (business.name.length > 100) {
    issues.push('Business name too long');
  }
  
  // Validate suburb (should be Australian)
  if (!business.suburb || business.suburb.length < 2) {
    issues.push('Invalid suburb');
  }
  
  // Validate phone (Australian format)
  if (business.phone) {
    const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;
    const cleanPhone = business.phone.replace(/[\s\-\(\)]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      issues.push('Invalid Australian phone number format');
    }
  }
  
  // Validate ABN (Australian Business Number)
  if (business.abn) {
    const abnRegex = /^\d{11}$/;
    const cleanABN = business.abn.replace(/\s/g, '');
    if (!abnRegex.test(cleanABN)) {
      issues.push('Invalid ABN format (should be 11 digits)');
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  };
}

export default {
  moderateBusinessContent,
  moderateInquiryContent,
  cleanText,
  validateAustralianBusiness,
};