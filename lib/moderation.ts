export function simpleModeration(text: string) {
  const bad = /(fuck|shit|spam|http[^\s]{0,}|free\s*bitcoin)/i;
  const manyLinks = (text.match(/https?:\/\//g) || []).length > 1;
  return { flag: bad.test(text) || manyLinks, reasons: { badWords: bad.test(text), manyLinks } };
}